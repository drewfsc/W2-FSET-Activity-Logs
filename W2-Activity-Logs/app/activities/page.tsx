'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { Briefcase, Calendar, Clock, Plus, Search, ArrowLeft, Edit, Trash2, ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';
import ActivityModal from '@/components/ActivityModal';

interface Activity {
  _id: string;
  userId: string;
  activityType: string;
  description: string;
  date: string;
  duration?: number;
  status: string;
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
  const [filterType, setFilterType] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingActivity, setEditingActivity] = useState<Activity | null>(null);
  const [sortBy, setSortBy] = useState<'date' | 'activityType' | 'status' | 'duration'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

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
        activity.activityType.toLowerCase().includes(searchTerm.toLowerCase()) ||
        activity.notes?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by type
    if (filterType !== 'all') {
      filtered = filtered.filter(activity => activity.activityType === filterType);
    }

    // Filter by status
    if (filterStatus !== 'all') {
      filtered = filtered.filter(activity => activity.status === filterStatus);
    }

    // Sort
    filtered.sort((a, b) => {
      let comparison = 0;

      switch (sortBy) {
        case 'date':
          comparison = new Date(a.date).getTime() - new Date(b.date).getTime();
          break;
        case 'activityType':
          comparison = a.activityType.localeCompare(b.activityType);
          break;
        case 'status':
          comparison = a.status.localeCompare(b.status);
          break;
        case 'duration':
          comparison = (a.duration || 0) - (b.duration || 0);
          break;
      }

      return sortOrder === 'asc' ? comparison : -comparison;
    });

    setFilteredActivities(filtered);
  }, [searchTerm, filterType, filterStatus, activities, sortBy, sortOrder]);

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'Job Application':
      case 'Job Search':
        return <Briefcase className="h-5 w-5" />;
      case 'Interview':
      case 'Meeting':
        return <Calendar className="h-5 w-5" />;
      default:
        return <Clock className="h-5 w-5" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const badges: { [key: string]: string } = {
      'Completed': 'badge-success',
      'Pending': 'badge-warning',
      'Cancelled': 'badge-error'
    };
    return badges[status] || 'badge-neutral';
  };

  const handleEditClick = (activity: Activity) => {
    setEditingActivity(activity);
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

  const handleSubmitActivity = async (activityData: any) => {
    try {
      const url = editingActivity
        ? `/api/activities/${editingActivity._id}`
        : '/api/activities';

      const method = editingActivity ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(activityData),
      });

      const data = await response.json();

      if (data.success) {
        // Refresh activities
        fetchActivities();
        setIsModalOpen(false);
        setEditingActivity(null);
      } else {
        throw new Error(data.error || 'Failed to save activity');
      }
    } catch (error) {
      console.error('Error saving activity:', error);
      throw error;
    }
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setEditingActivity(null);
  };

  const handleSort = (column: 'date' | 'activityType' | 'status' | 'duration') => {
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
        </div>

        {/* Filters and Search */}
        <div className="card bg-base-100 shadow-xl mb-6">
          <div className="card-body">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* Search */}
              <div className="form-control md:col-span-2">
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

              {/* Type Filter */}
              <div className="form-control">
                <select
                  className="select select-bordered w-full"
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                >
                  <option value="all">All Types</option>
                  <option value="Job Search">Job Search</option>
                  <option value="Job Application">Job Application</option>
                  <option value="Interview">Interview</option>
                  <option value="Job Training">Job Training</option>
                  <option value="Work Hours">Work Hours</option>
                  <option value="Meeting">Meeting</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              {/* Status Filter */}
              <div className="form-control">
                <select
                  className="select select-bordered w-full"
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                >
                  <option value="all">All Status</option>
                  <option value="Completed">Completed</option>
                  <option value="Pending">Pending</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
              </div>
            </div>

            {/* Results count */}
            <div className="text-sm opacity-70 mt-2">
              Showing {filteredActivities.length} of {activities.length} activities
            </div>
          </div>
        </div>

        {/* Activities Table */}
        <div className="card bg-base-100 shadow-xl">
          <div className="card-body">
            {filteredActivities.length === 0 ? (
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
                    onClick={() => setIsModalOpen(true)}
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
                      <th
                        className="cursor-pointer hover:bg-base-300 select-none"
                        onClick={() => handleSort('activityType')}
                      >
                        <div className="flex items-center gap-2">
                          Activity Type
                          {getSortIcon('activityType')}
                        </div>
                      </th>
                      <th>Description</th>
                      <th
                        className="cursor-pointer hover:bg-base-300 select-none"
                        onClick={() => handleSort('duration')}
                      >
                        <div className="flex items-center gap-2">
                          Duration
                          {getSortIcon('duration')}
                        </div>
                      </th>
                      <th
                        className="cursor-pointer hover:bg-base-300 select-none"
                        onClick={() => handleSort('status')}
                      >
                        <div className="flex items-center gap-2">
                          Status
                          {getSortIcon('status')}
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
                          <div className="flex items-center gap-2">
                            {getActivityIcon(activity.activityType)}
                            <span className="font-medium">{activity.activityType}</span>
                          </div>
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
                          {activity.duration ? (
                            <div className="flex items-center gap-1">
                              <Clock className="h-4 w-4 opacity-50" />
                              {activity.duration} hrs
                            </div>
                          ) : (
                            <span className="opacity-50">-</span>
                          )}
                        </td>
                        <td>
                          <span className={`badge ${getStatusBadge(activity.status)}`}>
                            {activity.status}
                          </span>
                        </td>
                        <td>
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
        />
      )}
    </div>
  );
}
