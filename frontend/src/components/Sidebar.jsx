import React, { useEffect, useRef, useState } from 'react';
import { useStudents } from '../context/StudentsContext';
import './Sidebar.css';

const LONG_PRESS_MS = 350;
const MOVE_TOLERANCE_PX = 10;

const Sidebar = ({ onDragStart, onTouchDrop, onStudentClick }) => {
  const { students } = useStudents();
  const touchRef = useRef(null);
  const suppressClickRef = useRef(false);
  const [ghost, setGhost] = useState(null); // { name, x, y } while touch-dragging
  const isCoarsePointer =
    typeof window !== 'undefined' &&
    window.matchMedia &&
    window.matchMedia('(pointer: coarse)').matches;

  useEffect(() => () => clearTimeout(touchRef.current?.timer), []);

  // --- Mouse / Desktop ---
  const handleMouseDragStart = (name, e) => {
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', name);
    if (onDragStart) onDragStart(name);
  };

  // Quick tap / click opens the "new lesson" dialog
  const handleClick = (name) => {
    if (suppressClickRef.current) {
      suppressClickRef.current = false;
      return;
    }
    onStudentClick(name);
  };

  // --- Touch: long press starts a drag, quick tap falls through to click ---
  const setDropHighlight = (el) => {
    const t = touchRef.current;
    if (t.target === el) return;
    t.target?.classList.remove('touch-drop-target');
    el?.classList.add('touch-drop-target');
    t.target = el;
  };

  const handleTouchStart = (name, e) => {
    const { clientX, clientY } = e.touches[0];
    const timer = setTimeout(() => {
      touchRef.current.dragging = true;
      suppressClickRef.current = true;
      navigator.vibrate?.(20);
      setGhost({ name, x: clientX, y: clientY });
    }, LONG_PRESS_MS);
    touchRef.current = { name, startX: clientX, startY: clientY, timer, dragging: false, target: null };
  };

  const handleTouchMove = (e) => {
    const t = touchRef.current;
    if (!t) return;
    const { clientX, clientY } = e.touches[0];
    if (!t.dragging) {
      if (Math.hypot(clientX - t.startX, clientY - t.startY) > MOVE_TOLERANCE_PX) {
        clearTimeout(t.timer);
        touchRef.current = null;
      }
      return;
    }
    setGhost({ name: t.name, x: clientX, y: clientY });
    setDropHighlight(document.elementFromPoint(clientX, clientY)?.closest('[data-drop-slot]') || null);
  };

  const endTouch = (drop) => {
    const t = touchRef.current;
    if (!t) return;
    clearTimeout(t.timer);
    if (t.dragging) {
      const slot = t.target?.dataset.dropSlot;
      setDropHighlight(null);
      if (drop && slot) onTouchDrop(t.name, slot);
      setGhost(null);
    }
    touchRef.current = null;
  };

  return (
    <div className="sidebar">
      <h2 className="sidebar-title">תלמידים</h2>
      <div className="students-list">
        {Object.entries(students).map(([name, phone]) => (
          <div
            key={name}
            draggable={!isCoarsePointer} // native drag for mouse/trackpad only
            onDragStart={(e) => handleMouseDragStart(name, e)}
            onClick={() => handleClick(name)}
            onTouchStart={(e) => handleTouchStart(name, e)}
            onTouchMove={handleTouchMove}
            onTouchEnd={() => endTouch(true)}
            onTouchCancel={() => endTouch(false)}
            onContextMenu={(e) => e.preventDefault()}
            className={`student-card${ghost?.name === name ? ' dragging' : ''}`}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && (e.preventDefault(), onStudentClick(name))}
          >
            <div className="student-name">{name}</div>
            <div className="student-phone">{phone}</div>
          </div>
        ))}
      </div>

      {ghost && (
        <div className="student-drag-ghost" style={{ left: ghost.x, top: ghost.y }}>
          {ghost.name}
        </div>
      )}
    </div>
  );
};

export default Sidebar;
