import React from 'react';
import './ViewToggle.css';

const ViewToggle = ({ viewMode, onViewModeChange, currentDate, onDateChange }) => {
  const handlePrevious = () => {
    const newDate = new Date(currentDate);
    newDate.setDate(newDate.getDate() - (viewMode === 'day' ? 1 : 7));
    onDateChange(newDate);
  };

  const handleToday = () => {
    onDateChange(new Date());
  };

  const handleNext = () => {
    const newDate = new Date(currentDate);
    newDate.setDate(newDate.getDate() + (viewMode === 'day' ? 1 : 7));
    onDateChange(newDate);
  };

  return (
    <div className="view-toggle-container">
      <div className="view-toggle-content">
        <div className="view-mode-buttons">
          <button
            onClick={() => onViewModeChange('day')}
            className={`view-mode-button ${viewMode === 'day' ? 'active' : 'inactive'}`}
          >
            תצוגת יום
          </button>
          <button
            onClick={() => onViewModeChange('week')}
            className={`view-mode-button ${viewMode === 'week' ? 'active' : 'inactive'}`}
          >
            תצוגת שבוע
          </button>
        </div>
        <div className="navigation-buttons">
          <button onClick={handlePrevious} className="nav-button">
            הקודם
          </button>
          <button onClick={handleToday} className="nav-button">
            היום
          </button>
          <button onClick={handleNext} className="nav-button">
            הבא
          </button>
        </div>
      </div>
    </div>
  );
};

export default ViewToggle;
