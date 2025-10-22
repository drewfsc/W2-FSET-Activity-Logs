/**
 * Utility functions for week calculations
 * Weeks run from Sunday to Saturday
 */

/**
 * Get the start of the week (Sunday) for a given date
 */
export function getWeekStart(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay(); // 0 (Sunday) to 6 (Saturday)
  const diff = day; // How many days to subtract to get to Sunday
  d.setDate(d.getDate() - diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

/**
 * Get the end of the week (Saturday) for a given date
 */
export function getWeekEnd(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay();
  const diff = 6 - day; // How many days to add to get to Saturday
  d.setDate(d.getDate() + diff);
  d.setHours(23, 59, 59, 999);
  return d;
}

/**
 * Check if a date is within the editable range:
 * - Current week (Sunday to Saturday)
 * - Previous 2 weeks
 */
export function isDateEditable(date: Date): boolean {
  const now = new Date();
  const currentWeekStart = getWeekStart(now);

  // Go back 2 weeks from current week start
  const editableStartDate = new Date(currentWeekStart);
  editableStartDate.setDate(editableStartDate.getDate() - 14); // 2 weeks = 14 days

  // End of current week
  const editableEndDate = getWeekEnd(now);

  const checkDate = new Date(date);
  checkDate.setHours(0, 0, 0, 0);

  return checkDate >= editableStartDate && checkDate <= editableEndDate;
}

/**
 * Get the week number in the year (1-53)
 * Note: This is a simple implementation. Week 1 is the first week with a Sunday.
 */
export function getWeekNumber(date: Date): number {
  const d = new Date(date);
  const yearStart = new Date(d.getFullYear(), 0, 1);
  const weekStart = getWeekStart(yearStart);

  const diffTime = d.getTime() - weekStart.getTime();
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

  return Math.floor(diffDays / 7) + 1;
}

/**
 * Get all days in a week starting from Sunday
 */
export function getWeekDays(weekStart: Date): Date[] {
  const days: Date[] = [];
  for (let i = 0; i < 7; i++) {
    const day = new Date(weekStart);
    day.setDate(weekStart.getDate() + i);
    days.push(day);
  }
  return days;
}

/**
 * Get the start of the month
 */
export function getMonthStart(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

/**
 * Get the end of the month
 */
export function getMonthEnd(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59, 999);
}

/**
 * Get all weeks in a month (starting from Sunday)
 * Returns an array of week start dates
 */
export function getWeeksInMonth(date: Date): Date[] {
  const monthStart = getMonthStart(date);
  const monthEnd = getMonthEnd(date);

  // Get the Sunday of the week containing the first day of the month
  const firstWeekStart = getWeekStart(monthStart);

  const weeks: Date[] = [];
  let currentWeekStart = new Date(firstWeekStart);

  // Keep adding weeks until we pass the end of the month
  while (currentWeekStart <= monthEnd) {
    weeks.push(new Date(currentWeekStart));
    currentWeekStart.setDate(currentWeekStart.getDate() + 7);
  }

  return weeks;
}

/**
 * Format week range as string (e.g., "Jan 1 - Jan 7")
 */
export function formatWeekRange(weekStart: Date): string {
  const weekEnd = getWeekEnd(weekStart);

  const startMonth = weekStart.toLocaleDateString('en-US', { month: 'short' });
  const startDay = weekStart.getDate();
  const endMonth = weekEnd.toLocaleDateString('en-US', { month: 'short' });
  const endDay = weekEnd.getDate();

  if (startMonth === endMonth) {
    return `${startMonth} ${startDay} - ${endDay}`;
  } else {
    return `${startMonth} ${startDay} - ${endMonth} ${endDay}`;
  }
}

/**
 * Check if two dates are in the same week
 */
export function isSameWeek(date1: Date, date2: Date): boolean {
  const week1Start = getWeekStart(date1);
  const week2Start = getWeekStart(date2);
  return week1Start.getTime() === week2Start.getTime();
}

/**
 * Check if a date is in the current week
 */
export function isCurrentWeek(date: Date): boolean {
  return isSameWeek(date, new Date());
}
