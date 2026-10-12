import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { onSnapshot, setDoc, updateDoc, deleteField } from 'firebase/firestore';
import { studentsRef, recurringRef } from '../firebase';
import { HOURS } from '../utils/constants';
import { formatHourDisplay } from '../utils/dateUtils';

const StudentsContext = createContext(null);

export const StudentsProvider = ({ children }) => {
  const [students, setStudentsState] = useState({});
  const [recurring, setRecurring] = useState({});

  // Subscribe to students / fixed lessons updates via Firestore
  useEffect(() => onSnapshot(studentsRef, (snap) => setStudentsState(snap.data() || {})), []);
  useEffect(() => onSnapshot(recurringRef, (snap) => setRecurring(snap.data() || {})), []);

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
      const fixedKeys = Object.keys(recurring).filter(k => recurring[k] === trimmed);
      if (fixedKeys.length) await removeFixed(fixedKeys);
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

  // Fixed weekly lesson: same weekday, every half-hour slot in [from, to)
  const addFixed = async (name, day, from, to) => {
    if (!students[name]) return { ok: false, error: 'בחר תלמיד' };
    if (!(from < to)) return { ok: false, error: 'שעת הסיום חייבת להיות אחרי שעת ההתחלה' };
    const slots = {};
    for (const hour of HOURS.filter(h => h >= from && h < to)) {
      const key = `${day}-${formatHourDisplay(hour)}`;
      if (recurring[key] && recurring[key] !== name) {
        return { ok: false, error: `${formatHourDisplay(hour)} כבר תפוס ע"י ${recurring[key]}` };
      }
      slots[key] = name;
    }
    try {
      await setDoc(recurringRef, slots, { merge: true });
      return { ok: true };
    } catch (e) {
      return { ok: false, error: e.message || 'נכשל הוספה' };
    }
  };

  const removeFixed = async (keys) => {
    try {
      await updateDoc(recurringRef, Object.fromEntries(keys.map(k => [k, deleteField()])));
      return { ok: true };
    } catch (e) {
      return { ok: false, error: e.message || 'נכשל להסיר' };
    }
  };

  const value = useMemo(
    () => ({ students, addStudent, removeStudent, setStudents, recurring, addFixed, removeFixed }),
    [students, recurring]
  );

  return (
    <StudentsContext.Provider value={value}>{children}</StudentsContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components -- hook lives next to its provider
export const useStudents = () => {
  const ctx = useContext(StudentsContext);
  if (!ctx) throw new Error('useStudents must be used within StudentsProvider');
  return ctx;
};
