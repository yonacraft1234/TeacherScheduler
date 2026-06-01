import React from 'react';
import { HOURS, DAYS_OF_WEEK } from '../utils/constants';
import { getWeekDates, formatTimeSlot, formatHourRange } from '../utils/dateUtils';
import './WeekView.css';

const WeekView = ({ currentDate, schedule, onDragOver, onDrop, onRemove }) => {
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
              
              return (
                <div
                  key={i}
                  className="week-slot-cell"
                  onDragOver={onDragOver}
                  onDrop={() => onDrop(date, hour)}
                >
                  {assignedStudent ? (
                    <div className="week-student-assignment">
                      <div className="week-student-name">{assignedStudent}</div>
                      <button
                        onClick={() => onRemove(timeSlot)}
                        className="week-remove-button"
                        aria-label="הסר"
                        title="הסר"
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
