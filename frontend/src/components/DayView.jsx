import React from 'react';
import { User, Repeat } from 'lucide-react';
import { HOURS } from '../utils/constants';
import { formatTimeSlot, formatHourRange } from '../utils/dateUtils';
import './DayView.css';

const DayView = ({ currentDate, schedule, fixedSlots, onDragOver, onDrop, onRemove }) => {
  return (
    <div className="day-view">
      <div className="day-view-content">
        <div className="day-header">
          {currentDate.toLocaleDateString('he-IL', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            timeZone: 'Asia/Jerusalem'
          })}
        </div>
        {HOURS.map(hour => {
          const timeSlot = formatTimeSlot(currentDate, hour);
          const assignedStudent = schedule[timeSlot];
          const isFixed = fixedSlots[timeSlot] === assignedStudent;

            return (
            <div
              key={hour}
              className="time-slot"
              data-drop-slot={timeSlot}
              onDragOver={onDragOver}
              onDrop={() => onDrop(currentDate, hour)}
            >
              <div className="time-slot-content">
              <div className="time-label">
                {formatHourRange(hour)}
              </div>
              {assignedStudent ? (
                <div className="slot-content">
                <div className={`student-assignment${isFixed ? ' fixed' : ''}`}>
                  <div className="assignment-details">
                  <div className="student-info">
                    {isFixed ? <Repeat size={16} aria-label="שיעור קבוע" /> : <User size={16} />}
                    <span className="student-info-name">{assignedStudent}</span>
                    {isFixed && <span className="fixed-badge">קבוע</span>}
                  </div>
                  <button
                    onClick={() => onRemove(timeSlot)}
                    className="remove-button"
                    aria-label={isFixed ? 'הסר מהשבוע הזה' : 'הסר'}
                    title={isFixed ? 'הסר מהשבוע הזה' : 'הסר'}
                  >
                    <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                    >
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                    </svg>
                  </button>
                  </div>
                </div>
                </div>
              ) : (
                <div className="slot-content empty-slot">שחרר תלמיד כאן</div>
              )}
              </div>
            </div>
            );
        })}
      </div>
    </div>
  );
};

export default DayView;
