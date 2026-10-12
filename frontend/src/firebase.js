import { initializeApp } from 'firebase/app';
import { getAnalytics, isSupported } from 'firebase/analytics';
import { getFirestore, doc } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: 'AIzaSyC5nwLBF9L30bmdPFjHg7p7KFGaUMnSzCo',
  authDomain: 'teacherscheduler-8b645.firebaseapp.com',
  projectId: 'teacherscheduler-8b645',
  storageBucket: 'teacherscheduler-8b645.firebasestorage.app',
  messagingSenderId: '719562783387',
  appId: '1:719562783387:web:0699492f58cede07be243e',
  measurementId: 'G-EDQH03B9D7',
};

export const app = initializeApp(firebaseConfig);
isSupported().then((ok) => ok && getAnalytics(app));
export const db = getFirestore(app);

// Data shapes: students { name: phone }, lessons { "YYYY-MM-DD-HH:MM": name },
// recurring { "<weekday 0-6>-HH:MM": name } (fixed weekly lessons),
// skips { "YYYY-MM-DD-HH:MM": true } (single occurrences of a fixed lesson removed from the table)
export const studentsRef = doc(db, 'data', 'students');
export const lessonsRef = doc(db, 'data', 'lessons');
export const recurringRef = doc(db, 'data', 'recurring');
export const skipsRef = doc(db, 'data', 'skips');
