'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { Briefcase, Calendar, Clock, Plus, Search, ArrowLeft } from 'lucide-react';

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
        activity.activityType.toLowerCase().includes(searchTerm.toLowerCase())
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

    setFilteredActivities(filtered);
  }, [searchTerm, filterType, filterStatus, activities]);

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
                <div className="input-group">
                  <span>
                    <Search className="h-5 w-5" />
                  </span>
                  <input
                    type="text"
                    placeholder="Search activities..."
                    className="input input-bordered w-full"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
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

        {/* Activities List */}
        {filteredActivities.length === 0 ? (
          <div className="card bg-base-100 shadow-xl">
            <div className="card-body text-center py-12">
              <Briefcase className="h-16 w-16 mx-auto opacity-30 mb-4" />
              <h3 className="text-xl font-bold mb-2">No activities found</h3>
              <p className="opacity-70 mb-4">
                {activities.length === 0
                  ? "You haven't logged any activities yet."
                  : "Try adjusting your filters to see more results."}
              </p>
              <div>
                <Link href="/dashboard" className="btn btn-primary">
                  <Plus className="h-5 w-5 mr-2" />
                  Log New Activity
                </Link>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredActivities.map((activity) => (
              <div key={activity._id} className="card bg-base-100 shadow-xl hover:shadow-2xl transition-shadow">
                <div className="card-body">
                  <div className="flex justify-between items-start">
                    <div className="flex gap-4 flex-1">
                      <div className="avatar placeholder">
                        <div className="bg-primary text-primary-content rounded-full w-12 h-12">
                          {getActivityIcon(activity.activityType)}
                        </div>
                      </div>

                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="text-xl font-bold">{activity.activityType}</h3>
                          <span className={`badge ${getStatusBadge(activity.status)}`}>
                            {activity.status}
                          </span>
                        </div>

                        <p className="text-base-content opacity-80 mb-2">
                          {activity.description}
                        </p>

                        <div className="flex gap-4 text-sm opacity-70">
                          <div className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            {new Date(activity.date).toLocaleDateString()}
                          </div>
                          {activity.duration && (
                            <div className="flex items-center gap-1">
                              <Clock className="h-4 w-4" />
                              {activity.duration} hours
                            </div>
                          )}
                        </div>

                        {activity.notes && (
                          <div className="mt-3 p-3 bg-base-200 rounded-lg">
                            <p className="text-sm"><strong>Notes:</strong> {activity.notes}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
