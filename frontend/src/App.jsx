import React, { useEffect, useMemo, useState } from 'react';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import ViewToggle from './components/ViewToggle';
import DayView from './components/DayView';
import WeekView from './components/WeekView';
import { formatTimeSlot, formatDate, formatHourDisplay, getWeekDates, getSlotWeekday } from './utils/dateUtils';
import { HOURS } from './utils/constants';
import { onSnapshot, setDoc } from 'firebase/firestore';
import { lessonsRef, skipsRef } from './firebase';
import StudentsEditor from './components/StudentsEditor';
import AddLessonDialog from './components/AddLessonDialog';
import { useStudents } from './context/StudentsContext';
import './App.css';

const App = () => {
  const [viewMode, setViewMode] = useState(() => {
    try { return localStorage.getItem('viewMode') || 'day'; } catch { return 'day'; }
  });

  useEffect(() => {
    try { localStorage.setItem('viewMode', viewMode); } catch { /* storage unavailable */ }
  }, [viewMode]);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [lessons, setLessons] = useState({});
  const [skips, setSkips] = useState({});
  const [draggedStudent, setDraggedStudent] = useState(null);
  const [editorOpen, setEditorOpen] = useState(false);
  const [lessonStudent, setLessonStudent] = useState(null);
  const { students, recurring, addFixed } = useStudents();

  // Subscribe to lessons / removed fixed occurrences via Firestore
  useEffect(() => onSnapshot(lessonsRef, (snap) => setLessons(snap.data() || {})), []);
  useEffect(() => onSnapshot(skipsRef, (snap) => setSkips(snap.data() || {})), []);

  // Fixed lessons of the displayed week (minus removed occurrences); one-off lessons override them
  const fixedSlots = useMemo(() => {
    const slots = {};
    for (const date of getWeekDates(currentDate)) {
      for (const [key, name] of Object.entries(recurring)) {
        const [day, time] = key.split('-');
        const timeSlot = `${formatDate(date)}-${time}`;
        if (Number(day) === date.getDay() && !skips[timeSlot]) slots[timeSlot] = name;
      }
    }
    return slots;
  }, [currentDate, recurring, skips]);

  const schedule = useMemo(() => ({ ...fixedSlots, ...lessons }), [fixedSlots, lessons]);

  const handleDragStart = (studentName) => {
    setDraggedStudent(studentName);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const addLessons = (slots) => {
    setLessons(prev => {
      const next = { ...prev, ...slots };
      setDoc(lessonsRef, next).catch(console.error);
      return next;
    });
  };

  const handleDrop = (date, hour) => {
    if (draggedStudent) {
      addLessons({ [formatTimeSlot(date, hour)]: draggedStudent });
      setDraggedStudent(null);
    }
  };

  const handleTouchDrop = (name, timeSlot) => addLessons({ [timeSlot]: name });

  // Who is booked at a slot on any date: one-off lesson first, then a fixed lesson not removed that week
  const occupantAt = (timeSlot) => {
    if (lessons[timeSlot]) return lessons[timeSlot];
    const time = timeSlot.split('-').slice(-1)[0];
    const fixedName = recurring[`${getSlotWeekday(timeSlot)}-${time}`];
    return fixedName && !skips[timeSlot] ? fixedName : null;
  };

  const handleAddLesson = async ({ name, date, from, to, fixed }) => {
    if (fixed) return addFixed(name, date.getDay(), from, to);
    const slots = {};
    for (const hour of HOURS.filter(h => h >= from && h < to)) {
      const timeSlot = formatTimeSlot(date, hour);
      const occupant = occupantAt(timeSlot);
      if (occupant && occupant !== name) {
        return { ok: false, error: `${formatHourDisplay(hour)} כבר תפוס ע"י ${occupant}` };
      }
      slots[timeSlot] = name;
    }
    addLessons(slots);
    return { ok: true };
  };

  const removeFromSchedule = (timeSlot) => {
    if (lessons[timeSlot]) {
      setLessons(prev => {
        const next = { ...prev };
        delete next[timeSlot];
        setDoc(lessonsRef, next).catch(console.error);
        return next;
      });
    }
    // Removing a fixed lesson from the table only cancels this week's occurrence
    const time = timeSlot.split('-').slice(-1)[0];
    if (recurring[`${getSlotWeekday(timeSlot)}-${time}`] && !skips[timeSlot]) {
      setDoc(skipsRef, { [timeSlot]: true }, { merge: true }).catch(console.error);
    }
  };

  const handleSendSMS = async () => {
    const lessonsMap = {};
    const sortedSlots = Object.entries(schedule).sort((a, b) => a[0].localeCompare(b[0]));

    sortedSlots.forEach(([timeSlot, studentName]) => {
      const time = timeSlot.split('-').slice(-1)[0];
      if (!lessonsMap[studentName]) lessonsMap[studentName] = [];
      const currentLesson = lessonsMap[studentName][lessonsMap[studentName].length - 1];

      if (currentLesson && currentLesson.date === timeSlot.substring(0, 10)) {
        const [lastHour, lastMinute] = currentLesson.end_hour.split(':').map(Number);
        const [currentHour, currentMinute] = time.split(':').map(Number);
        const lastEndMinutes = lastHour * 60 + lastMinute;
        const currentStartMinutes = currentHour * 60 + currentMinute;

        if (currentStartMinutes === lastEndMinutes) {
          const newEndMinute = currentMinute + 30;
          currentLesson.end_hour =
            newEndMinute >= 60
              ? `${currentHour + 1}:${(newEndMinute - 60).toString().padStart(2, '0')}`
              : `${currentHour}:${newEndMinute.toString().padStart(2, '0')}`;
          return;
        }
      }

      const [hour, minute] = time.split(':').map(Number);
      const endMinute = minute + 30;
      lessonsMap[studentName].push({
        name: studentName,
        date: timeSlot.substring(0, 10),
        start_hour: time,
        end_hour:
          endMinute >= 60
            ? `${hour + 1}:${(endMinute - 60).toString().padStart(2, '0')}`
            : `${hour}:${endMinute.toString().padStart(2, '0')}`,
      });
    });

    const lessons = Object.values(lessonsMap).flat();
    const payload = {
      lessons: lessons.map(l => ({ ...l, phone: students[l.name] })),
    };
    
    try {
      const resp = await fetch('/api/send-lessons', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
      const data = await resp.json();
      console.log('תוצאת שליחת הודעות:', data);
    } catch (e) {
      console.error(e);
      alert('נכשל לשלוח הודעות. בדוק את לוג שרת ה־Backend.');
    }
  };

  return (
    <div className="app">
      <Header onSendSMS={handleSendSMS} onOpenStudentsEditor={() => setEditorOpen(true)} />

      <div className="app-content">
        <Sidebar onDragStart={handleDragStart} onTouchDrop={handleTouchDrop} onStudentClick={setLessonStudent} />

        <div className="calendar-section">
          <ViewToggle
            viewMode={viewMode}
            onViewModeChange={setViewMode}
            currentDate={currentDate}
            onDateChange={setCurrentDate}
          />

          {viewMode === 'day' ? (
            <DayView
              currentDate={currentDate}
              schedule={schedule}
              fixedSlots={fixedSlots}
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              onRemove={removeFromSchedule}
            />
          ) : (
            <WeekView
              currentDate={currentDate}
              schedule={schedule}
              fixedSlots={fixedSlots}
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              onRemove={removeFromSchedule}
            />
          )}
        </div>
      </div>

      <StudentsEditor open={editorOpen} onClose={() => setEditorOpen(false)} />
      {lessonStudent && (
        <AddLessonDialog
          key={lessonStudent}
          student={lessonStudent}
          defaultDate={currentDate}
          onSave={handleAddLesson}
          onClose={() => setLessonStudent(null)}
        />
      )}
    </div>
  );
};

export default App;
