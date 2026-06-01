import React from 'react';
import { Calendar, Send, Users } from 'lucide-react';
import './Header.css';

const Header = ({ onSendSMS, onOpenStudentsEditor }) => {
  return (
    <div className="header">
      <div className="header-container">
        <h1 className="header-title">
          <Calendar className="icon" />
          מערכת שיעורים
        </h1>
        <div className="header-actions">
          <button onClick={onOpenStudentsEditor} className="edit-students-button">
            <Users size={18} />
            רשימת תלמידים
          </button>
          <button onClick={onSendSMS} className="send-sms-button">
            <Send size={18} />
            שלח הודעות
          </button>
        </div>
      </div>
    </div>
  );
};

export default Header;
