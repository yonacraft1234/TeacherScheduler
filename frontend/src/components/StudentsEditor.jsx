import React, { useState } from 'react';
import { X, Plus } from 'lucide-react';
import './StudentsEditor.css';
import { useStudents } from '../context/StudentsContext';

const StudentsEditor = ({ open, onClose }) => {
  const { students, addStudent, removeStudent, setStudents } = useStudents();
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [error, setError] = useState('');

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

  const list = Object.entries(students);

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
              ייצוא JSON
            </button>
            <label className="se-import-label">
              ייבוא JSON
              <input
                type="file"
                accept="application/json"
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
                  } catch {}
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
          {error && <div className="se-error">{error}</div>}
        </div>
      </div>
    </div>
  );
};

export default StudentsEditor;
