// Hours array from 8 AM to 11 PM (23:00) with half hours
export const HOURS = [];
for (let i = 8; i <= 23; i++) {
  HOURS.push(i);
  if (i < 23) {
    HOURS.push(i + 0.5);
  }
}

// Lesson end times: every slot's end (last slot ends at 23:30)
export const END_HOURS = [...HOURS.slice(1), HOURS[HOURS.length - 1] + 0.5];

// Days of the week
export const DAYS_OF_WEEK = [
  'ראשון',
  'שני',
  'שלישי',
  'רביעי',
  'חמישי',
  'שישי',
  'שבת'
];
