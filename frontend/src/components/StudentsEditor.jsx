import React, { useState } from 'react';
import { X, Plus, Repeat, Download, Upload } from 'lucide-react';
import './StudentsEditor.css';
import { useStudents } from '../context/StudentsContext';
import { HOURS, END_HOURS, DAYS_OF_WEEK } from '../utils/constants';
import { formatHourDisplay } from '../utils/dateUtils';

const toHour = (time) => {
  const [h, m] = time.split(':').map(Number);
  return h + m / 60;
};

// Collapse { "<day>-H:MM": name } into contiguous ranges per student and day
const groupFixed = (recurring) => {
  const entries = Object.entries(recurring)
    .map(([key, name]) => {
      const [day, time] = key.split('-');
      return { key, name, day: Number(day), hour: toHour(time) };
    })
    .sort((a, b) => a.day - b.day || a.hour - b.hour);

  const groups = [];
  for (const e of entries) {
    const last = groups[groups.length - 1];
    if (last && last.name === e.name && last.day === e.day && last.to === e.hour) {
      last.to = e.hour + 0.5;
      last.keys.push(e.key);
    } else {
      groups.push({ name: e.name, day: e.day, from: e.hour, to: e.hour + 0.5, keys: [e.key] });
    }
  }
  return groups;
};

const StudentsEditor = ({ open, onClose }) => {
  const { students, addStudent, removeStudent, setStudents, recurring, addFixed, removeFixed } = useStudents();
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [error, setError] = useState('');
  const [fixedName, setFixedName] = useState('');
  const [fixedDay, setFixedDay] = useState(0);
  const [fixedFrom, setFixedFrom] = useState(16);
  const [fixedTo, setFixedTo] = useState(17);

  if (!open) return null;

  const handleAdd = async () => {
    setError('');
    const res = await addStudent(name, phone);
    if (!res.ok) {
      setError(res.error);
    } else {
      setName('');
      setPhone('');
    }
  };

  const handleAddFixed = async () => {
    setError('');
    const res = await addFixed(fixedName, fixedDay, fixedFrom, fixedTo);
    if (!res.ok) setError(res.error);
  };

  const list = Object.entries(students);
  const fixedGroups = groupFixed(recurring);

  return (
    <div className="se-overlay" onClick={onClose}>
      <div className="se-modal" onClick={(e) => e.stopPropagation()}>
        <div className="se-header">
          <h3>עריכת רשימת תלמידים</h3>
          <button className="icon-btn" onClick={onClose} aria-label="Close">
            <X size={18} />
          </button>
        </div>

        <div className="se-body">
          <div className="se-top-actions">
            <button
              className="se-export"
              aria-label="ייצוא JSON"
              title="ייצוא JSON"
              onClick={() => {
                const data = new Blob([JSON.stringify(students, null, 2)], { type: 'application/json' });
                const url = URL.createObjectURL(data);
                const a = document.createElement('a');
                a.href = url;
                a.download = 'students.json';
                a.click();
                URL.revokeObjectURL(url);
              }}
            >
              <Download size={16} />
            </button>
            <label className="se-import-label" aria-label="ייבוא JSON" title="ייבוא JSON">
              <Upload size={16} />
              <input
                type="file"
                accept="application/json"
                aria-label="ייבוא JSON"
                onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  try {
                    const text = await file.text();
                    const obj = JSON.parse(text);
                    if (obj && typeof obj === 'object') {
                      const res = await setStudents(obj);
                      if (!res?.ok) setError(res?.error || 'שגיאה בשמירה');
                      else setError('');
                    }
                  } catch {
                    setError('קובץ JSON לא תקין');
                  }
                }}
                style={{ display: 'none' }}
              />
            </label>
          </div>

          <div className="se-list">
            {list.length === 0 && <div className="se-empty">עדיין אין תלמידים</div>}
            {list.map(([n, p]) => (
              <div key={n} className="se-row">
                <div className="se-name">{n}</div>
                <div className="se-phone">{p}</div>
                <button className="se-remove" onClick={() => removeStudent(n)} aria-label={`הסר ${n}`}>
                  <X size={14} />
                </button>
              </div>
            ))}
          </div>

          <div className="se-divider" />

          <div className="se-add">
            <input
              className="se-input"
              placeholder="שם תלמיד"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <input
              className="se-input"
              placeholder="טלפון"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
            <button className="se-add-btn" onClick={handleAdd}>
              <Plus size={16} /> הוסף
            </button>
          </div>

          <div className="se-divider" />

          <h4 className="se-section-title">
            <Repeat size={16} /> שיעורים קבועים
          </h4>
          <p className="se-hint">חוזרים כל שבוע באותו יום ובאותן שעות. הסרה מהטבלה מבטלת רק את אותו שבוע.</p>

          <div className="se-list se-fixed-list">
            {fixedGroups.length === 0 && <div className="se-empty">אין שיעורים קבועים</div>}
            {fixedGroups.map(g => (
              <div key={g.keys[0]} className="se-row">
                <div className="se-name">{g.name}</div>
                <div className="se-fixed-time">
                  {DAYS_OF_WEEK[g.day]} {formatHourDisplay(g.from)}–{formatHourDisplay(g.to)}
                </div>
                <button className="se-remove" onClick={() => removeFixed(g.keys)} aria-label={`הסר שיעור קבוע של ${g.name}`}>
                  <X size={14} />
                </button>
              </div>
            ))}
          </div>

          <div className="se-add se-fixed-add">
            <select className="se-input" value={fixedName} onChange={(e) => setFixedName(e.target.value)}>
              <option value="">תלמיד</option>
              {list.map(([n]) => <option key={n} value={n}>{n}</option>)}
            </select>
            <select className="se-input" value={fixedDay} onChange={(e) => setFixedDay(Number(e.target.value))}>
              {DAYS_OF_WEEK.map((d, i) => <option key={d} value={i}>{d}</option>)}
            </select>
            <select className="se-input" value={fixedFrom} onChange={(e) => setFixedFrom(Number(e.target.value))} aria-label="משעה">
              {HOURS.map(h => <option key={h} value={h}>{formatHourDisplay(h)}</option>)}
            </select>
            <select className="se-input" value={fixedTo} onChange={(e) => setFixedTo(Number(e.target.value))} aria-label="עד שעה">
              {END_HOURS.map(h => <option key={h} value={h}>{formatHourDisplay(h)}</option>)}
            </select>
            <button className="se-add-btn" onClick={handleAddFixed}>
              <Plus size={16} /> הוסף
            </button>
          </div>
          {error && <div className="se-error">{error}</div>}
        </div>
      </div>
    </div>
  );
};

export default StudentsEditor;
