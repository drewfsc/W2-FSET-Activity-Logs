import { getWeekStart } from './weekUtils';

export type LogType = 'Self-Directed Employment Search Log' | 'W-2 Activity Log' | 'Work Experience Log';

export const LOG_TYPES: LogType[] = [
  'Self-Directed Employment Search Log',
  'W-2 Activity Log',
  'Work Experience Log'
];

export const LOG_COLORS = {
  'Self-Directed Employment Search Log': {
    bg: 'bg-blue-100',
    border: 'border-blue-500',
    text: 'text-blue-900',
    badge: 'badge-info',
    light: 'bg-blue-50',
  },
  'W-2 Activity Log': {
    bg: 'bg-green-100',
    border: 'border-green-500',
    text: 'text-green-900',
    badge: 'badge-success',
    light: 'bg-green-50',
  },
  'Work Experience Log': {
    bg: 'bg-purple-100',
    border: 'border-purple-500',
    text: 'text-purple-900',
    badge: 'badge-secondary',
    light: 'bg-purple-50',
  },
};

export const LOG_SHORT_NAMES = {
  'Self-Directed Employment Search Log': 'Employment Search',
  'W-2 Activity Log': 'W-2 Activity',
  'Work Experience Log': 'Work Experience',
};

/**
 * Calculate duration in minutes from start and end time
 * @param startTime - Format: "HH:MM"
 * @param endTime - Format: "HH:MM"
 * @returns Duration in minutes
 */
export function calculateDuration(startTime: string, endTime: string): number {
  if (!startTime || !endTime) return 0;

  const [startHour, startMin] = startTime.split(':').map(Number);
  const [endHour, endMin] = endTime.split(':').map(Number);

  const startMinutes = startHour * 60 + startMin;
  let endMinutes = endHour * 60 + endMin;

  // Handle case where end time is on the next day
  if (endMinutes < startMinutes) {
    endMinutes += 24 * 60; // Add 24 hours
  }

  return endMinutes - startMinutes;
}

/**
 * Format minutes into hours and minutes string
 * @param minutes - Total minutes
 * @returns Formatted string like "2h 30m" or "45m"
 */
export function formatDuration(minutes: number): string {
  if (!minutes || minutes === 0) return '0m';

  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;

  if (hours === 0) {
    return `${mins}m`;
  } else if (mins === 0) {
    return `${hours}h`;
  } else {
    return `${hours}h ${mins}m`;
  }
}

/**
 * Convert minutes to decimal hours
 * @param minutes - Total minutes
 * @returns Hours as decimal (e.g., 90 minutes = 1.5 hours)
 */
export function minutesToHours(minutes: number): number {
  return Math.round((minutes / 60) * 100) / 100; // Round to 2 decimal places
}

/**
 * Group activities by log type and week
 */
export interface ActivityWithLog {
  _id: string;
  userId: string;
  logType: LogType;
  weekStart: string;
  activityType: string;
  description: string;
  date: string;
  startTime?: string;
  endTime?: string;
  duration?: number;
  status: string;
  notes?: string;
}

export interface WeeklyLog {
  logType: LogType;
  weekStart: Date;
  activities: ActivityWithLog[];
  totalDuration: number; // in minutes
}

/**
 * Group activities into weekly logs
 */
export function groupActivitiesIntoWeeklyLogs(activities: ActivityWithLog[]): WeeklyLog[] {
  const logsMap = new Map<string, WeeklyLog>();

  activities.forEach((activity) => {
    const key = `${activity.logType}-${activity.weekStart}`;

    if (!logsMap.has(key)) {
      logsMap.set(key, {
        logType: activity.logType,
        weekStart: new Date(activity.weekStart),
        activities: [],
        totalDuration: 0,
      });
    }

    const log = logsMap.get(key)!;
    log.activities.push(activity);
    log.totalDuration += activity.duration || 0;
  });

  return Array.from(logsMap.values()).sort((a, b) => {
    // Sort by week (descending), then by log type
    const weekDiff = b.weekStart.getTime() - a.weekStart.getTime();
    if (weekDiff !== 0) return weekDiff;
    return a.logType.localeCompare(b.logType);
  });
}

/**
 * Get the week start date for a given date
 */
export function getLogWeekStart(date: Date): Date {
  return getWeekStart(date);
}

/**
 * Validate if user can create a new activity for a log type in a specific week
 * Rule: Only one log of each type per week
 */
export function canAddToLog(
  logType: LogType,
  weekStart: Date,
  existingLogs: WeeklyLog[]
): boolean {
  // Check if a log of this type already exists for this week
  const existingLog = existingLogs.find(
    (log) =>
      log.logType === logType &&
      log.weekStart.getTime() === weekStart.getTime()
  );

  // Log doesn't exist yet - can create
  // Log exists - can add more activities to it
  return true; // Always return true since we can add multiple activities to each log
}

/**
 * Calculate total hours for all logs in a week
 */
export function calculateWeekTotalHours(
  logs: WeeklyLog[],
  weekStart: Date
): number {
  const weekLogs = logs.filter(
    (log) => log.weekStart.getTime() === weekStart.getTime()
  );

  const totalMinutes = weekLogs.reduce(
    (sum, log) => sum + log.totalDuration,
    0
  );

  return minutesToHours(totalMinutes);
}
