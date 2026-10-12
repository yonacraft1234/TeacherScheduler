import React, { useEffect, useState } from 'react';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import ViewToggle from './components/ViewToggle';
import DayView from './components/DayView';
import WeekView from './components/WeekView';
import { formatTimeSlot } from './utils/dateUtils';
import { onSnapshot, setDoc } from 'firebase/firestore';
import { lessonsRef } from './firebase';
import StudentsEditor from './components/StudentsEditor';
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
  const [schedule, setSchedule] = useState({});
  const [draggedStudent, setDraggedStudent] = useState(null);
  const [editorOpen, setEditorOpen] = useState(false);
  const { students } = useStudents();

  // Subscribe to lessons updates via Firestore
  useEffect(() => onSnapshot(lessonsRef, (snap) => setSchedule(snap.data() || {})), []);

  const handleDragStart = (studentName) => {
    setDraggedStudent(studentName);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (date, hour) => {
    if (draggedStudent) {
      const timeSlot = formatTimeSlot(date, hour);
      setSchedule(prev => {
        const next = { ...prev, [timeSlot]: draggedStudent };
        setDoc(lessonsRef, next).catch(console.error);
        return next;
      });
      setDraggedStudent(null);
    }
  };

  const removeFromSchedule = (timeSlot) => {
    setSchedule(prev => {
      const next = { ...prev };
      delete next[timeSlot];
      setDoc(lessonsRef, next).catch(console.error);
      return next;
    });
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
        <Sidebar onDragStart={handleDragStart} />

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
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              onRemove={removeFromSchedule}
            />
          ) : (
            <WeekView
              currentDate={currentDate}
              schedule={schedule}
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              onRemove={removeFromSchedule}
            />
          )}
        </div>
      </div>

      <StudentsEditor open={editorOpen} onClose={() => setEditorOpen(false)} />
    </div>
  );
};

export default App;
