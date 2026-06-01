import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { socket } from '../socket';

const StudentsContext = createContext(null);

export const StudentsProvider = ({ children }) => {
  const [students, setStudentsState] = useState({});

  // Subscribe to students updates via sockets
  useEffect(() => {
    const onList = (data) => {
      if (data && typeof data === 'object') setStudentsState(data);
    };
    socket.on('students:list', onList);
    return () => {
      socket.off('students:list', onList);
    };
  }, []);

  const addStudent = async (name, phone) => {
    const trimmed = String(name || '').trim();
  if (!trimmed) return { ok: false, error: 'שם נדרש' };
  if (students[trimmed]) return { ok: false, error: 'השם כבר קיים' };
    const digits = String(phone || '').replace(/\D/g, '');
  if (!digits) return { ok: false, error: 'מספר טלפון נדרש' };
    return new Promise((resolve) => {
      socket.emit('students:add', { name: trimmed, phone: digits }, (resp) => {
        if (!resp?.ok) return resolve({ ok: false, error: resp?.error || 'נכשל הוספה' });
        // State will update from 'students:list'
        resolve({ ok: true });
      });
    });
  };

  const removeStudent = async (name) => {
    const trimmed = String(name || '').trim();
    return new Promise((resolve) => {
      socket.emit('students:remove', trimmed, (resp) => {
        if (!resp?.ok) return resolve({ ok: false, error: resp?.error || 'נכשל להסיר' });
        resolve({ ok: true });
      });
    });
  };

  // Replace entire collection (used by Import JSON)
  const setStudents = async (obj) => {
    return new Promise((resolve) => {
      socket.emit('students:replace', obj || {}, (resp) => {
        if (!resp?.ok) return resolve({ ok: false, error: resp?.error || 'נכשל לשמור' });
        resolve({ ok: true });
      });
    });
  };

  const value = useMemo(() => ({ students, addStudent, removeStudent, setStudents }), [students]);

  return (
    <StudentsContext.Provider value={value}>{children}</StudentsContext.Provider>
  );
};

export const useStudents = () => {
  const ctx = useContext(StudentsContext);
  if (!ctx) throw new Error('useStudents must be used within StudentsProvider');
  return ctx;
};
