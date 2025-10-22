'use client';

import { useState, useEffect } from 'react';
import { X, Clock, Plus, ChevronDown, ChevronUp } from 'lucide-react';
import { LOG_TYPES, calculateDuration, type LogType } from '@/utils/logUtils';
import { getWeekStart } from '@/utils/weekUtils';

interface ActivityModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (activities: ActivityFormData[]) => Promise<void>;
  userId: string;
  editActivity?: Activity | null;
  initialDate?: Date | null;
  initialLogType?: LogType | null;
}

export interface ActivityFormData {
  userId: string;
  logType: LogType;
  weekStart: string;
  description: string;
  date: string;
  startTime?: string;
  endTime?: string;
  duration?: number;
  notes?: string;
  [key: string]: any; // Allow additional fields
}

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

interface ActivityEntry {
  id: string;
  description: string;
  date: string;
  startTime: string;
  endTime: string;
  duration?: number;
  notes: string;
  collapsed: boolean;
}

export default function ActivityModal({ isOpen, onClose, onSubmit, userId, editActivity, initialDate, initialLogType }: ActivityModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [logType, setLogType] = useState<LogType>(initialLogType || editActivity?.logType || 'W-2 Activity Log');
  const [activities, setActivities] = useState<ActivityEntry[]>([]);

  // Initialize activities when modal opens
  useEffect(() => {
    if (isOpen) {
      if (editActivity) {
        // Editing single activity
        setLogType(editActivity.logType);
        setActivities([{
          id: editActivity._id,
          description: editActivity.description,
          date: new Date(editActivity.date).toISOString().split('T')[0],
          startTime: editActivity.startTime || '',
          endTime: editActivity.endTime || '',
          duration: editActivity.duration,
          notes: editActivity.notes || '',
          collapsed: false,
        }]);
      } else {
        // Creating new activity
        const defaultDate = initialDate
          ? initialDate.toISOString().split('T')[0]
          : new Date().toISOString().split('T')[0];

        setLogType(initialLogType || 'W-2 Activity Log');
        setActivities([{
          id: `new-${Date.now()}`,
          description: '',
          date: defaultDate,
          startTime: '',
          endTime: '',
          duration: undefined,
          notes: '',
          collapsed: false,
        }]);
      }
    }
  }, [isOpen, editActivity, initialDate, initialLogType]);

  // Auto-calculate duration when start/end time changes
  useEffect(() => {
    setActivities(prev => prev.map(activity => {
      if (activity.startTime && activity.endTime) {
        const calculatedDuration = calculateDuration(activity.startTime, activity.endTime);
        return { ...activity, duration: calculatedDuration };
      }
      return activity;
    }));
  }, [activities.map(a => `${a.startTime}-${a.endTime}`).join(',')]);

  const handleAddAnother = () => {
    // Collapse all existing activities
    setActivities(prev => prev.map(a => ({ ...a, collapsed: true })));

    // Add new activity with same date as last one
    const lastActivity = activities[activities.length - 1];
    setActivities(prev => [...prev, {
      id: `new-${Date.now()}`,
      description: '',
      date: lastActivity.date,
      startTime: '',
      endTime: '',
      duration: undefined,
      notes: '',
      collapsed: false,
    }]);
  };

  const handleActivityChange = (id: string, field: keyof ActivityEntry, value: any) => {
    setActivities(prev => prev.map(activity => {
      if (activity.id === id) {
        return { ...activity, [field]: value };
      }
      return activity;
    }));
  };

  const toggleCollapse = (id: string) => {
    setActivities(prev => prev.map(activity => {
      if (activity.id === id) {
        return { ...activity, collapsed: !activity.collapsed };
      }
      return activity;
    }));
  };

  const removeActivity = (id: string) => {
    if (activities.length === 1) {
      alert('You must have at least one activity');
      return;
    }
    setActivities(prev => prev.filter(a => a.id !== id));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Convert activities to form data
      const activitiesToSubmit: ActivityFormData[] = activities.map(activity => {
        const date = new Date(activity.date);
        const weekStart = getWeekStart(date).toISOString().split('T')[0];

        const formData: ActivityFormData = {
          userId,
          logType,
          weekStart,
          description: activity.description,
          date: activity.date,
        };

        // Only include optional fields if they have values
        if (activity.startTime && activity.startTime.trim()) {
          formData.startTime = activity.startTime;
        }
        if (activity.endTime && activity.endTime.trim()) {
          formData.endTime = activity.endTime;
        }
        if (activity.duration) {
          formData.duration = activity.duration;
        }
        if (activity.notes && activity.notes.trim()) {
          formData.notes = activity.notes;
        }

        return formData;
      });

      console.log('Submitting activities:', activitiesToSubmit);
      await onSubmit(activitiesToSubmit);
      onClose();
    } catch (error) {
      console.error('Error submitting activities:', error);
      alert(`Failed to ${editActivity ? 'update' : 'create'} activities. Please try again.\n\nError: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal modal-open">
      <div className="modal-box max-w-3xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4 sticky top-0 bg-base-100 z-10 pb-4">
          <h3 className="font-bold text-2xl">{editActivity ? 'Edit Activity' : 'Log Activities'}</h3>
          <button
            onClick={onClose}
            className="btn btn-sm btn-circle btn-ghost"
            disabled={isSubmitting}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Log Type */}
          <div className="form-control">
            <label className="label">
              <span className="label-text font-semibold">Log Type</span>
            </label>
            <select
              value={logType}
              onChange={(e) => setLogType(e.target.value as LogType)}
              className="select select-bordered w-full"
              required
              disabled={!!editActivity || isSubmitting}
            >
              {LOG_TYPES.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
            {editActivity && (
              <label className="label">
                <span className="label-text-alt text-warning">Log type cannot be changed when editing</span>
              </label>
            )}
          </div>

          {/* Activities */}
          <div className="space-y-3">
            {activities.map((activity, index) => (
              <div key={activity.id} className="card bg-base-200 shadow-sm">
                <div className="card-body p-4">
                  {/* Activity Header */}
                  <div className="flex items-center justify-between mb-2">
                    <button
                      type="button"
                      onClick={() => toggleCollapse(activity.id)}
                      className="flex items-center gap-2 text-sm font-semibold"
                    >
                      {activity.collapsed ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}
                      Activity {index + 1}
                      {activity.collapsed && activity.description && (
                        <span className="text-xs opacity-70 ml-2">- {activity.description.substring(0, 30)}{activity.description.length > 30 ? '...' : ''}</span>
                      )}
                    </button>
                    {activities.length > 1 && !editActivity && (
                      <button
                        type="button"
                        onClick={() => removeActivity(activity.id)}
                        className="btn btn-xs btn-ghost btn-circle"
                        title="Remove"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    )}
                  </div>

                  {/* Activity Fields */}
                  {!activity.collapsed && (
                    <div className="space-y-3">
                      {/* Description */}
                      <div className="form-control">
                        <label className="label">
                          <span className="label-text font-semibold">Description</span>
                        </label>
                        <input
                          type="text"
                          value={activity.description}
                          onChange={(e) => handleActivityChange(activity.id, 'description', e.target.value)}
                          placeholder="Enter activity description"
                          className="input input-bordered w-full"
                          required
                        />
                      </div>

                      {/* Date, Start Time, End Time - One Line */}
                      <div className="grid grid-cols-3 gap-3">
                        <div className="form-control">
                          <label className="label">
                            <span className="label-text font-semibold">Date</span>
                          </label>
                          <input
                            type="date"
                            value={activity.date}
                            onChange={(e) => handleActivityChange(activity.id, 'date', e.target.value)}
                            className="input input-bordered w-full"
                            required
                          />
                        </div>

                        <div className="form-control">
                          <label className="label">
                            <span className="label-text font-semibold">Start Time</span>
                          </label>
                          <input
                            type="time"
                            value={activity.startTime}
                            onChange={(e) => handleActivityChange(activity.id, 'startTime', e.target.value)}
                            className="input input-bordered w-full"
                          />
                        </div>

                        <div className="form-control">
                          <label className="label">
                            <span className="label-text font-semibold">End Time</span>
                          </label>
                          <input
                            type="time"
                            value={activity.endTime}
                            onChange={(e) => handleActivityChange(activity.id, 'endTime', e.target.value)}
                            className="input input-bordered w-full"
                          />
                        </div>
                      </div>

                      {/* Duration Display */}
                      {activity.duration && activity.duration > 0 && (
                        <div className="alert alert-info py-2">
                          <Clock className="h-4 w-4" />
                          <span className="text-sm">
                            Duration: {Math.floor(activity.duration / 60)}h {activity.duration % 60}m
                          </span>
                        </div>
                      )}

                      {/* Notes */}
                      <div className="form-control">
                        <label className="label">
                          <span className="label-text font-semibold">Notes</span>
                        </label>
                        <textarea
                          value={activity.notes}
                          onChange={(e) => handleActivityChange(activity.id, 'notes', e.target.value)}
                          placeholder="Additional notes (optional)"
                          className="textarea textarea-bordered h-20"
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Add Another Activity Button */}
          {!editActivity && (
            <button
              type="button"
              onClick={handleAddAnother}
              className="btn btn-outline btn-sm w-full"
              disabled={isSubmitting}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Another Activity +
            </button>
          )}

          {/* Actions */}
          <div className="modal-action sticky bottom-0 bg-base-100 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="btn btn-ghost"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <span className="loading loading-spinner loading-sm"></span>
                  {editActivity ? 'Updating...' : 'Saving...'}
                </>
              ) : (
                editActivity ? 'Update Activity' : `Save ${activities.length > 1 ? 'All' : ''}`
              )}
            </button>
          </div>
        </form>
      </div>
      <div className="modal-backdrop" onClick={onClose}></div>
    </div>
  );
}
