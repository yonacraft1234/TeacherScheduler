import React from 'react';
import { Repeat } from 'lucide-react';
import { HOURS, DAYS_OF_WEEK } from '../utils/constants';
import { getWeekDates, formatTimeSlot, formatHourRange } from '../utils/dateUtils';
import './WeekView.css';

const WeekView = ({ currentDate, schedule, fixedSlots, onDragOver, onDrop, onRemove }) => {
  const weekDates = getWeekDates(currentDate);

  return (
    <div className="week-view">
      <div className="week-view-content">
        <div className="week-header">
          <div className="week-header-cell"></div>
          {weekDates.map((date, i) => (
            <div key={i} className="week-header-cell">
              <div className="day-name">{DAYS_OF_WEEK[date.getDay()]}</div>
              <div className="day-date">{date.getDate()}/{date.getMonth() + 1}</div>
            </div>
          ))}
        </div>
        {HOURS.map(hour => (
          <div key={hour} className="week-row">
            <div className="week-time-cell">
              {formatHourRange(hour)}
            </div>
            {weekDates.map((date, i) => {
              const timeSlot = formatTimeSlot(date, hour);
              const assignedStudent = schedule[timeSlot];
              const isFixed = fixedSlots[timeSlot] === assignedStudent;

              return (
                <div
                  key={i}
                  className="week-slot-cell"
                  onDragOver={onDragOver}
                  onDrop={() => onDrop(date, hour)}
                >
                  {assignedStudent ? (
                    <div className={`week-student-assignment${isFixed ? ' fixed' : ''}`}>
                      <div className="week-student-name">
                        {isFixed && <Repeat size={12} className="week-fixed-icon" aria-label="שיעור קבוע" />}
                        {assignedStudent}
                      </div>
                      <button
                        onClick={() => onRemove(timeSlot)}
                        className="week-remove-button"
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
                  ) : (
                    <div className="week-empty-slot"></div>
                  )}
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
};

export default WeekView;
