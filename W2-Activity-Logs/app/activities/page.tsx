'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { Briefcase, Calendar, Clock, Plus, Search, ArrowLeft, Edit, Trash2, ArrowUpDown, ArrowUp, ArrowDown, LayoutGrid, Table } from 'lucide-react';
import ActivityModal from '@/components/ActivityModal';
import CalendarView from '@/components/CalendarView';
import { isDateEditable } from '@/utils/weekUtils';
import { type LogType, LOG_COLORS, LOG_SHORT_NAMES, formatDuration } from '@/utils/logUtils';

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
  createdAt?: string;
}

export default function ActivitiesPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [activities, setActivities] = useState<Activity[]>([]);
  const [filteredActivities, setFilteredActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingActivity, setEditingActivity] = useState<Activity | null>(null);
  const [sortBy, setSortBy] = useState<'date' | 'duration'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [viewMode, setViewMode] = useState<'table' | 'calendar'>('calendar');
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedLogType, setSelectedLogType] = useState<LogType | null>(null);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    } else if (status === 'authenticated') {
      fetchActivities();
    }
  }, [status, router]);

  const fetchActivities = async () => {
    try {
      const response = await fetch('/api/activities');
      const data = await response.json();

      if (data.success) {
        setActivities(data.data);
        setFilteredActivities(data.data);
      }
    } catch (error) {
      console.error('Error fetching activities:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let filtered = activities;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(activity =>
        activity.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        activity.notes?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Sort
    filtered.sort((a, b) => {
      let comparison = 0;

      switch (sortBy) {
        case 'date':
          comparison = new Date(a.date).getTime() - new Date(b.date).getTime();
          break;
        case 'duration':
          comparison = (a.duration || 0) - (b.duration || 0);
          break;
      }

      return sortOrder === 'asc' ? comparison : -comparison;
    });

    setFilteredActivities(filtered);
  }, [searchTerm, activities, sortBy, sortOrder]);


  const handleEditClick = (activity: Activity) => {
    const activityDate = new Date(activity.date);
    if (!isDateEditable(activityDate)) {
      alert('You can only edit activities from the current week and 2 previous weeks.');
      return;
    }
    setEditingActivity(activity);
    setIsModalOpen(true);
  };

  const handleAddClick = (date?: Date, logType?: LogType) => {
    const targetDate = date || new Date();
    if (!isDateEditable(targetDate)) {
      alert('You can only add activities for the current week and 2 previous weeks.');
      return;
    }
    setSelectedDate(targetDate);
    setSelectedLogType(logType || null);
    setEditingActivity(null);
    setIsModalOpen(true);
  };

  const handleDeleteClick = async (activityId: string) => {
    if (!confirm('Are you sure you want to delete this activity?')) {
      return;
    }

    try {
      const response = await fetch(`/api/activities/${activityId}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (data.success) {
        // Refresh activities list
        fetchActivities();
      } else {
        alert('Failed to delete activity');
      }
    } catch (error) {
      console.error('Error deleting activity:', error);
      alert('Failed to delete activity');
    }
  };

  const handleSubmitActivity = async (activitiesData: any[]) => {
    try {
      if (editingActivity) {
        // Editing single activity
        const response = await fetch(`/api/activities/${editingActivity._id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(activitiesData[0]),
        });

        const data = await response.json();

        if (!data.success) {
          throw new Error(data.error || 'Failed to update activity');
        }
      } else {
        // Creating multiple activities
        const promises = activitiesData.map(activityData =>
          fetch('/api/activities', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(activityData),
          }).then(res => res.json())
        );

        const results = await Promise.all(promises);

        const failed = results.filter(r => !r.success);
        if (failed.length > 0) {
          // Log detailed errors
          console.error('Failed activities:', failed);
          const errorMessages = failed.map(r => r.error).join(', ');
          throw new Error(`Failed to create ${failed.length} activity(ies): ${errorMessages}`);
        }
      }

      // Refresh activities
      fetchActivities();
      setIsModalOpen(false);
      setEditingActivity(null);
    } catch (error) {
      console.error('Error saving activities:', error);
      throw error;
    }
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setEditingActivity(null);
    setSelectedDate(null);
    setSelectedLogType(null);
  };

  const handleSort = (column: 'date' | 'duration') => {
    if (sortBy === column) {
      // Toggle sort order if clicking same column
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      // Set new column and default to descending
      setSortBy(column);
      setSortOrder('desc');
    }
  };

  const getSortIcon = (column: string) => {
    if (sortBy !== column) {
      return <ArrowUpDown className="h-4 w-4 opacity-30" />;
    }
    return sortOrder === 'asc'
      ? <ArrowUp className="h-4 w-4" />
      : <ArrowDown className="h-4 w-4" />;
  };

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    );
  }

  if (!session || !session.user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-base-200">
      {/* Navbar */}
      <div className="navbar bg-primary text-primary-content">
        <div className="flex-1">
          <Link href="/dashboard" className="btn btn-ghost text-xl">
            <ArrowLeft className="h-5 w-5 mr-2" />
            W-2 Activity Logs
          </Link>
        </div>
        <div className="flex-none">
          <span className="mr-4">{session.user.name}</span>
        </div>
      </div>

      <div className="container mx-auto p-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold mb-2">All Activities</h1>
            <p className="text-base-content opacity-70">
              View and manage your W-2 program activities
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => handleAddClick()}
              className="btn btn-primary"
            >
              <Plus className="h-5 w-5 mr-2" />
              New Activity
            </button>
          </div>
        </div>

        {/* View Toggle and Filters */}
        <div className="card bg-base-100 shadow-xl mb-6">
          <div className="card-body">
            {/* View Toggle */}
            <div className="flex justify-end mb-4">
              <div className="btn-group">
                <button
                  onClick={() => setViewMode('table')}
                  className={`btn btn-sm ${viewMode === 'table' ? 'btn-active' : ''}`}
                >
                  <Table className="h-4 w-4 mr-2" />
                  Table View
                </button>
                <button
                  onClick={() => setViewMode('calendar')}
                  className={`btn btn-sm ${viewMode === 'calendar' ? 'btn-active' : ''}`}
                >
                  <LayoutGrid className="h-4 w-4 mr-2" />
                  Calendar View
                </button>
              </div>
            </div>

            <div className="form-control">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search activities..."
                  className="input input-bordered w-full pr-10"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <Search className="h-5 w-5 absolute right-3 top-1/2 -translate-y-1/2 opacity-50" />
              </div>
            </div>

            {/* Results count */}
            <div className="text-sm opacity-70 mt-2">
              Showing {filteredActivities.length} of {activities.length} activities
            </div>
          </div>
        </div>

        {/* Activities Display - Table or Calendar */}
        <div className="card bg-base-100 shadow-xl">
          <div className="card-body">
            {viewMode === 'calendar' ? (
              <CalendarView
                activities={filteredActivities}
                onEditClick={handleEditClick}
                onDeleteClick={handleDeleteClick}
                onAddClick={handleAddClick}
              />
            ) : filteredActivities.length === 0 ? (
              <div className="text-center py-12">
                <Briefcase className="h-16 w-16 mx-auto opacity-30 mb-4" />
                <h3 className="text-xl font-bold mb-2">No activities found</h3>
                <p className="opacity-70 mb-4">
                  {activities.length === 0
                    ? "You haven't logged any activities yet."
                    : "Try adjusting your filters to see more results."}
                </p>
                <div>
                  <button
                    onClick={() => handleAddClick()}
                    className="btn btn-primary"
                  >
                    <Plus className="h-5 w-5 mr-2" />
                    Log New Activity
                  </button>
                </div>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="table table-zebra">
                  <thead>
                    <tr>
                      <th
                        className="cursor-pointer hover:bg-base-300 select-none"
                        onClick={() => handleSort('date')}
                      >
                        <div className="flex items-center gap-2">
                          Date
                          {getSortIcon('date')}
                        </div>
                      </th>
                      <th>Log Type</th>
                      <th>Description</th>
                      <th
                        className="cursor-pointer hover:bg-base-300 select-none"
                        onClick={() => handleSort('duration')}
                      >
                        <div className="flex items-center gap-2">
                          Time/Duration
                          {getSortIcon('duration')}
                        </div>
                      </th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredActivities.map((activity) => (
                      <tr key={activity._id} className="hover">
                        <td>
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 opacity-50" />
                            {new Date(activity.date).toLocaleDateString()}
                          </div>
                        </td>
                        <td>
                          {activity.logType && (
                            <span className={`badge ${LOG_COLORS[activity.logType]?.badge || 'badge-neutral'}`}>
                              {LOG_SHORT_NAMES[activity.logType] || activity.logType}
                            </span>
                          )}
                        </td>
                        <td>
                          <div>
                            <div className="font-medium">{activity.description}</div>
                            {activity.notes && (
                              <div className="text-sm opacity-70 mt-1">
                                {activity.notes.length > 100
                                  ? `${activity.notes.substring(0, 100)}...`
                                  : activity.notes}
                              </div>
                            )}
                          </div>
                        </td>
                        <td>
                          {activity.startTime && activity.endTime ? (
                            <div>
                              <div className="flex items-center gap-1">
                                <Clock className="h-4 w-4 opacity-50" />
                                <span className="text-xs">{activity.startTime} - {activity.endTime}</span>
                              </div>
                              {activity.duration && (
                                <div className="text-xs opacity-70">
                                  {formatDuration(activity.duration)}
                                </div>
                              )}
                            </div>
                          ) : activity.duration ? (
                            <div className="flex items-center gap-1">
                              <Clock className="h-4 w-4 opacity-50" />
                              {formatDuration(activity.duration)}
                            </div>
                          ) : (
                            <span className="opacity-50">-</span>
                          )}
                        </td>
                        <td>
                          {isDateEditable(new Date(activity.date)) ? (
                            <div className="flex gap-2">
                              <button
                                onClick={() => handleEditClick(activity)}
                                className="btn btn-xs btn-outline btn-primary"
                                title="Edit activity"
                              >
                                <Edit className="h-3 w-3" />
                              </button>
                              <button
                                onClick={() => handleDeleteClick(activity._id)}
                                className="btn btn-xs btn-outline btn-error"
                                title="Delete activity"
                              >
                                <Trash2 className="h-3 w-3" />
                              </button>
                            </div>
                          ) : (
                            <span className="text-xs opacity-50">Read-only</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Activity Modal */}
      {session && session.user && (
        <ActivityModal
          isOpen={isModalOpen}
          onClose={handleModalClose}
          onSubmit={handleSubmitActivity}
          userId={session.user.id || ''}
          editActivity={editingActivity}
          initialDate={selectedDate}
          initialLogType={selectedLogType}
        />
      )}
    </div>
  );
}
