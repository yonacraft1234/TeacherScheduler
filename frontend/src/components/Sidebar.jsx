import React, { useRef } from 'react';
import { useStudents } from '../context/StudentsContext';
import './Sidebar.css';

const Sidebar = ({ onDragStart, onDragEnd }) => {
  const { students } = useStudents();
  const dragItemRef = useRef(null);
  const isCoarsePointer =
    typeof window !== 'undefined' &&
    window.matchMedia &&
    window.matchMedia('(pointer: coarse)').matches;

  // --- Mouse / Desktop ---
  const handleMouseDragStart = (name, e) => {
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', name);
    if (onDragStart) onDragStart(name);
  };

  // --- Touch / iOS ---
  const handleTouchStart = (name, e) => {
    e.preventDefault();
    e.stopPropagation();
    dragItemRef.current = {
      name,
      startX: e.touches[0].clientX,
      startY: e.touches[0].clientY,
    };
    if (onDragStart) onDragStart(name);
  };

  const handleTouchMove = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const touch = e.touches[0];
    const dragItem = dragItemRef.current;
    if (!dragItem) return;
    // You can add visual feedback here if needed
  };

  const handleTouchEnd = (e) => {
    e.preventDefault();    // suppress synthetic click
    e.stopPropagation();
    const dragItem = dragItemRef.current;
    if (!dragItem) return;

    dragItemRef.current = null;
    if (onDragEnd) onDragEnd(dragItem.name);
  };

  return (
    <div className="sidebar">
      <h2 className="sidebar-title">תלמידים</h2>
      <div className="students-list">
        {Object.entries(students).map(([name, phone]) => (
          <div
            key={name}
            draggable={true}  // enable native drag only for mouse/trackpad
            onDragStart={(e) => handleMouseDragStart(name, e)}
            onDragEnd={() => onDragEnd && onDragEnd(name)}
            onTouchStart={(e) => handleTouchStart(name, e)}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            className="student-card"
          >
            <div className="student-name">{name}</div>
            <div className="student-phone">{phone}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Sidebar;
