/**
 * Get an array of dates for the week containing the given date
 * @param {Date} date - The reference date
 * @returns {Date[]} Array of 7 dates representing the week
 */
export const getWeekDates = (date) => {
  const curr = new Date(date);
  const first = curr.getDate() - curr.getDay();
  return Array.from({ length: 7 }, (_, i) => {
    const day = new Date(curr.setDate(first + i));
    return new Date(day);
  });
};

/**
 * Format a date to YYYY-MM-DD string
 * @param {Date} date - The date to format
 * @returns {string} Formatted date string
 */
export const formatDate = (date) => {
  const m = (date.getMonth() + 1).toString().padStart(2, '0');
  const d = date.getDate().toString().padStart(2, '0');
  return `${date.getFullYear()}-${m}-${d}`;
};

/**
 * Get the weekday (0 = Sunday) of a time slot identifier
 * @param {string} timeSlot - "YYYY-MM-DD-H:MM"
 * @returns {number} Weekday index
 */
export const getSlotWeekday = (timeSlot) => {
  const [y, m, d] = timeSlot.substring(0, 10).split('-').map(Number);
  return new Date(y, m - 1, d).getDay();
};

/**
 * Format a time slot identifier from date and hour
 * @param {Date} date - The date
 * @param {number} hour - The hour (can include .5 for half hours)
 * @returns {string} Formatted time slot identifier
 */
export const formatTimeSlot = (date, hour) => {
  const wholeHour = Math.floor(hour);
  const minutes = (hour % 1) === 0.5 ? 30 : 0;
  return `${formatDate(date)}-${wholeHour}:${minutes.toString().padStart(2, '0')}`;
};

/**
 * Format hour for display
 * @param {number} hour - The hour (can include .5 for half hours)
 * @returns {string} Formatted time string
 */
export const formatHourDisplay = (hour) => {
  const wholeHour = Math.floor(hour);
  const minutes = (hour % 1) === 0.5 ? 30 : 0;
  return `${wholeHour}:${minutes.toString().padStart(2, '0')}`;
};

/**
 * Format hour range for display (e.g., "8:00 - 8:30")
 * @param {number} hour - The hour (can include .5 for half hours)
 * @returns {string} Formatted time range string
 */
export const formatHourRange = (hour) => {
  const startHour = Math.floor(hour);
  const startMinutes = (hour % 1) === 0.5 ? 30 : 0;
  const startTime = `${startHour}:${startMinutes.toString().padStart(2, '0')}`;
  
  // Calculate end time (30 minutes later)
  let endHour = startHour;
  let endMinutes = startMinutes + 30;
  
  if (endMinutes >= 60) {
    endHour += 1;
    endMinutes -= 60;
  }
  
  const endTime = `${endHour}:${endMinutes.toString().padStart(2, '0')}`;
  
  return `${startTime} - ${endTime}`;
};
