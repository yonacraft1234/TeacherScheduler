import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { onSnapshot, setDoc, updateDoc, deleteField } from 'firebase/firestore';
import { studentsRef } from '../firebase';

const StudentsContext = createContext(null);

export const StudentsProvider = ({ children }) => {
  const [students, setStudentsState] = useState({});

  // Subscribe to students updates via Firestore
  useEffect(() => onSnapshot(studentsRef, (snap) => setStudentsState(snap.data() || {})), []);

  const addStudent = async (name, phone) => {
    const trimmed = String(name || '').trim();
  if (!trimmed) return { ok: false, error: 'שם נדרש' };
  if (students[trimmed]) return { ok: false, error: 'השם כבר קיים' };
    const digits = String(phone || '').replace(/\D/g, '');
  if (!digits) return { ok: false, error: 'מספר טלפון נדרש' };
    try {
      await setDoc(studentsRef, { [trimmed]: digits }, { merge: true });
      return { ok: true };
    } catch (e) {
      return { ok: false, error: e.message || 'נכשל הוספה' };
    }
  };

  const removeStudent = async (name) => {
    const trimmed = String(name || '').trim();
    try {
      await updateDoc(studentsRef, { [trimmed]: deleteField() });
      return { ok: true };
    } catch (e) {
      return { ok: false, error: e.message || 'נכשל להסיר' };
    }
  };

  // Replace entire collection (used by Import JSON)
  const setStudents = async (obj) => {
    const next = {};
    for (const [k, v] of Object.entries(obj || {})) {
      const n = String(k).trim();
      const p = String(v || '').replace(/\D/g, '');
      if (n && p) next[n] = p;
    }
    try {
      await setDoc(studentsRef, next);
      return { ok: true };
    } catch (e) {
      return { ok: false, error: e.message || 'נכשל לשמור' };
    }
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
