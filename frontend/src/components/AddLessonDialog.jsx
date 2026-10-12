import React, { useState } from 'react';
import { X, Plus } from 'lucide-react';
import './StudentsEditor.css';
import './AddLessonDialog.css';
import { HOURS, END_HOURS, DAYS_OF_WEEK } from '../utils/constants';
import { formatDate, formatHourDisplay } from '../utils/dateUtils';

const parseDate = (value) => {
  const [y, m, d] = value.split('-').map(Number);
  return new Date(y, m - 1, d);
};

// Rendered only while open (keyed by student), so state starts fresh each time
const AddLessonDialog = ({ student, defaultDate, onSave, onClose }) => {
  const [date, setDate] = useState(formatDate(defaultDate));
  const [from, setFrom] = useState(16);
  const [to, setTo] = useState(17);
  const [fixed, setFixed] = useState(false);
  const [error, setError] = useState('');

  const handleSave = async () => {
    setError('');
    if (!date) return setError('בחר תאריך');
    const res = await onSave({ name: student, date: parseDate(date), from, to, fixed });
    if (res.ok) onClose();
    else setError(res.error);
  };

  const handleFromChange = (value) => {
    setFrom(value);
    if (to <= value) setTo(value + 0.5);
  };

  return (
    <div className="se-overlay" onClick={onClose}>
      <div className="se-modal al-modal" role="dialog" aria-label="שיעור חדש" onClick={(e) => e.stopPropagation()}>
        <div className="se-header">
          <h3>שיעור חדש · {student}</h3>
          <button className="icon-btn" onClick={onClose} aria-label="סגור">
            <X size={18} />
          </button>
        </div>

        <div className="se-body al-body">
          <label className="al-field">
            <span>תאריך</span>
            <input className="se-input" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
          </label>

          <div className="al-times">
            <label className="al-field">
              <span>משעה</span>
              <select className="se-input" value={from} onChange={(e) => handleFromChange(Number(e.target.value))}>
                {HOURS.map(h => <option key={h} value={h}>{formatHourDisplay(h)}</option>)}
              </select>
            </label>
            <label className="al-field">
              <span>עד שעה</span>
              <select className="se-input" value={to} onChange={(e) => setTo(Number(e.target.value))}>
                {END_HOURS.map(h => <option key={h} value={h} disabled={h <= from}>{formatHourDisplay(h)}</option>)}
              </select>
            </label>
          </div>

          <label className="al-check">
            <input type="checkbox" checked={fixed} onChange={(e) => setFixed(e.target.checked)} />
            <span>
              שיעור קבוע
              {date && <> — כל יום {DAYS_OF_WEEK[parseDate(date).getDay()]}</>}
            </span>
          </label>

          {error && <div className="se-error">{error}</div>}

          <div className="al-actions">
            <button className="se-export" onClick={onClose}>ביטול</button>
            <button className="se-add-btn" onClick={handleSave}>
              <Plus size={16} /> הוסף שיעור
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddLessonDialog;
