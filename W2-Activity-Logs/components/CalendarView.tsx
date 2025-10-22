'use client';

import { useState } from 'react';
import { ChevronLeft, ChevronRight, Edit, Trash2, Plus, Clock } from 'lucide-react';
import {
  getWeeksInMonth,
  getWeekDays,
  formatWeekRange,
  isDateEditable,
  getMonthStart,
} from '@/utils/weekUtils';
import { LOG_COLORS, LOG_SHORT_NAMES, formatDuration, type LogType } from '@/utils/logUtils';

interface Activity {
  _id: string;
  userId: string;
  logType: LogType;
  weekStart: string;
  activityType?: string; // Optional for backward compatibility
  description: string;
  date: string;
  startTime?: string;
  endTime?: string;
  duration?: number;
  status?: string; // Optional for backward compatibility
  notes?: string;
}

interface CalendarViewProps {
  activities: Activity[];
  onEditClick: (activity: Activity) => void;
  onDeleteClick: (activityId: string) => void;
  onAddClick: (date: Date, logType?: LogType) => void;
}

export default function CalendarView({
  activities,
  onEditClick,
  onDeleteClick,
  onAddClick,
}: CalendarViewProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const handlePreviousMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  };

  const handleToday = () => {
    setCurrentMonth(new Date());
  };

  const weeks = getWeeksInMonth(currentMonth);
  const monthName = currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  // Group activities by date and log type
  const activitiesByDate: { [key: string]: { [key in LogType]?: Activity[] } } = {};
  activities.forEach((activity) => {
    // Skip activities without logType (old data)
    if (!activity.logType) {
      console.warn('Activity without logType found:', activity._id);
      return;
    }

    const dateKey = new Date(activity.date).toISOString().split('T')[0];
    if (!activitiesByDate[dateKey]) {
      activitiesByDate[dateKey] = {};
    }
    if (!activitiesByDate[dateKey][activity.logType]) {
      activitiesByDate[dateKey][activity.logType] = [];
    }
    activitiesByDate[dateKey][activity.logType]!.push(activity);
  });

  const getLogColor = (logType: LogType) => {
    return LOG_COLORS[logType] || {
      bg: 'bg-gray-100',
      border: 'border-gray-500',
      text: 'text-gray-900',
      badge: 'badge-neutral',
      light: 'bg-gray-50',
    };
  };

  const isDateInCurrentMonth = (date: Date) => {
    return date.getMonth() === currentMonth.getMonth();
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  };

  return (
    <div className="space-y-4">
      {/* Calendar Navigation */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">{monthName}</h2>
        <div className="flex gap-2">
          <button
            onClick={handleToday}
            className="btn btn-sm btn-outline"
          >
            Today
          </button>
          <button
            onClick={handlePreviousMonth}
            className="btn btn-sm btn-square btn-ghost"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            onClick={handleNextMonth}
            className="btn btn-sm btn-square btn-ghost"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="space-y-6">
        {/* Day Headers */}
        <div className="grid grid-cols-7 gap-2 text-center font-semibold text-sm">
          <div>Sun</div>
          <div>Mon</div>
          <div>Tue</div>
          <div>Wed</div>
          <div>Thu</div>
          <div>Fri</div>
          <div>Sat</div>
        </div>

        {/* Weeks */}
        {weeks.map((weekStart, weekIndex) => {
          const weekDays = getWeekDays(weekStart);

          return (
            <div key={weekIndex} className="space-y-2">
              {/* Week Range Label with Log Begin Date */}
              <div className="flex items-center justify-between">
                <div className="text-sm font-medium opacity-70">
                  {formatWeekRange(weekStart)}
                </div>
                <div className="text-xs font-semibold text-primary">
                  Log Begin: {weekStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                </div>
              </div>

              {/* Days Grid */}
              <div className="grid grid-cols-7 gap-2">
                {weekDays.map((day, dayIndex) => {
                  const dateKey = day.toISOString().split('T')[0];
                  const dayLogs = activitiesByDate[dateKey] || {};
                  const isCurrentMonth = isDateInCurrentMonth(day);
                  const isTodayDate = isToday(day);
                  const isEditable = isDateEditable(day);
                  const hasActivities = Object.keys(dayLogs).length > 0;

                  return (
                    <div
                      key={dayIndex}
                      className={`min-h-[220px] p-2 rounded-lg border-2 ${
                        isTodayDate
                          ? 'border-primary bg-primary/5'
                          : hasActivities && isCurrentMonth
                          ? 'border-base-300 bg-base-100 shadow-sm'
                          : isCurrentMonth
                          ? 'border-base-300 bg-base-100'
                          : 'border-base-200 bg-base-200/50'
                      }`}
                    >
                      {/* Day Number and Add Buttons */}
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-1">
                          <span
                            className={`text-sm font-medium ${
                              isTodayDate
                                ? 'text-primary font-bold'
                                : isCurrentMonth
                                ? ''
                                : 'opacity-40'
                            }`}
                          >
                            {day.getDate()}
                          </span>
                          {hasActivities && isCurrentMonth && (
                            <div className="w-2 h-2 rounded-full bg-primary animate-pulse" title="Has activities"></div>
                          )}
                        </div>
                        {isEditable && isCurrentMonth && (
                          <div className="dropdown dropdown-end">
                            <button
                              tabIndex={0}
                              className="btn btn-xs btn-ghost btn-circle"
                              title="Add activity to log"
                            >
                              <Plus className="h-3 w-3" />
                            </button>
                            <ul tabIndex={0} className="dropdown-content z-[1] menu p-2 shadow-lg bg-base-100 rounded-box w-64">
                              <li>
                                <a onClick={() => onAddClick(day, 'Self-Directed Employment Search Log')}>
                                  <div className={`w-3 h-3 rounded ${LOG_COLORS['Self-Directed Employment Search Log'].bg}`}></div>
                                  Employment Search
                                </a>
                              </li>
                              <li>
                                <a onClick={() => onAddClick(day, 'W-2 Activity Log')}>
                                  <div className={`w-3 h-3 rounded ${LOG_COLORS['W-2 Activity Log'].bg}`}></div>
                                  W-2 Activity
                                </a>
                              </li>
                              <li>
                                <a onClick={() => onAddClick(day, 'Work Experience Log')}>
                                  <div className={`w-3 h-3 rounded ${LOG_COLORS['Work Experience Log'].bg}`}></div>
                                  Work Experience
                                </a>
                              </li>
                            </ul>
                          </div>
                        )}
                      </div>

                      {/* Activities grouped by log type */}
                      <div className="space-y-2">
                        {Object.entries(dayLogs).map(([logType, activities]) => {
                          const colors = getLogColor(logType as LogType);
                          const logActivities = activities as Activity[];

                          return (
                            <div key={logType} className={`border-l-4 ${colors.border} pl-2 py-1 ${colors.light} rounded-r`}>
                              {/* Log Type Header */}
                              <div className={`text-xs font-semibold ${colors.text} mb-1`}>
                                {LOG_SHORT_NAMES[logType as LogType] || logType}
                              </div>

                              {/* Activities */}
                              <div className="space-y-1">
                                {logActivities.map((activity) => (
                                  <div
                                    key={activity._id}
                                    className={`text-xs p-2 rounded ${colors.bg} border ${colors.border} group relative`}
                                  >
                                    <div className="flex items-start justify-between gap-1">
                                      <div className="flex-1 min-w-0">
                                        {/* Description - Prominent */}
                                        <div className={`font-bold ${colors.text} text-sm mb-1`}>
                                          {activity.description}
                                        </div>

                                        {/* Duration - Prominent */}
                                        {(activity.startTime || activity.endTime || activity.duration) && (
                                          <div className={`flex items-center gap-1 font-semibold ${colors.text}`}>
                                            <Clock className="h-3 w-3" />
                                            {activity.startTime && activity.endTime ? (
                                              <span>{activity.startTime} - {activity.endTime}</span>
                                            ) : activity.duration ? (
                                              <span>{formatDuration(activity.duration)}</span>
                                            ) : null}
                                          </div>
                                        )}
                                      </div>

                                      {/* Action Buttons - Show on hover */}
                                      {isEditable && (
                                        <div className="flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                          <button
                                            onClick={() => onEditClick(activity)}
                                            className="btn btn-xs btn-ghost btn-square"
                                            title="Edit"
                                          >
                                            <Edit className="h-3 w-3" />
                                          </button>
                                          <button
                                            onClick={() => onDeleteClick(activity._id)}
                                            className="btn btn-xs btn-ghost btn-square"
                                            title="Delete"
                                          >
                                            <Trash2 className="h-3 w-3" />
                                          </button>
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      {/* Non-editable indicator */}
                      {!isEditable && hasActivities && isCurrentMonth && (
                        <div className="text-xs opacity-50 mt-1">
                          Read-only
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="card bg-base-100 shadow-sm">
        <div className="card-body p-4">
          <h3 className="font-semibold mb-2">Log Types</h3>
          <div className="flex flex-wrap gap-4 text-sm mb-4">
            <div className="flex items-center gap-2">
              <div className={`w-4 h-4 rounded ${LOG_COLORS['Self-Directed Employment Search Log'].bg} border-2 ${LOG_COLORS['Self-Directed Employment Search Log'].border}`}></div>
              <span>Self-Directed Employment Search</span>
            </div>
            <div className="flex items-center gap-2">
              <div className={`w-4 h-4 rounded ${LOG_COLORS['W-2 Activity Log'].bg} border-2 ${LOG_COLORS['W-2 Activity Log'].border}`}></div>
              <span>W-2 Activity</span>
            </div>
            <div className="flex items-center gap-2">
              <div className={`w-4 h-4 rounded ${LOG_COLORS['Work Experience Log'].bg} border-2 ${LOG_COLORS['Work Experience Log'].border}`}></div>
              <span>Work Experience</span>
            </div>
          </div>
          <div className="flex flex-wrap gap-4 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded border-2 border-primary bg-primary/5"></div>
              <span>Today</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-primary animate-pulse"></div>
              <span>Has Activities</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-medium">Log Begin Date:</span>
              <span className="opacity-70">
                Sunday of each week (week runs Sunday-Saturday)
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-medium">Note:</span>
              <span className="opacity-70">
                You can only add/edit activities for the current week and 2 previous weeks. One log of each type per week, multiple activities per day.
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
