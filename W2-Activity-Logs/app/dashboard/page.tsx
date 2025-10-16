'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import Link from 'next/link';
import { LogOut, Briefcase, Calendar, Clock, TrendingUp } from 'lucide-react';
import ActivityModal, { ActivityFormData } from '@/components/ActivityModal';

interface User {
  id: string;
  name: string;
  email: string;
  role: 'client' | 'coach';
}

interface Activity {
  _id: string;
  userId: string;
  activityType: string;
  description: string;
  date: string;
  duration?: number;
  status: string;
  notes?: string;
}

export default function Dashboard() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [user, setUser] = useState<User | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [stats, setStats] = useState({
    totalHours: 0,
    weekHours: 0,
    completedActivities: 0,
    upcomingActivities: 0
  });

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    } else if (status === 'authenticated' && session?.user) {
      setUser({
        id: session.user.id || '',
        name: session.user.name || session.user.email?.split('@')[0] || 'User',
        email: session.user.email || '',
        role: (session.user.role as 'client' | 'coach') || 'client'
      });
      fetchActivities();
    }
  }, [status, session, router]);

  const fetchActivities = async () => {
    try {
      const response = await fetch('/api/activities');
      const data = await response.json();

      if (data.success) {
        const activityData = data.data;
        setActivities(activityData.slice(0, 3)); // Get recent 3 activities

        // Calculate stats
        const now = new Date();
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

        const totalHours = activityData
          .filter((a: Activity) => new Date(a.date) >= monthAgo)
          .reduce((sum: number, a: Activity) => sum + (a.duration || 0), 0);

        const weekHours = activityData
          .filter((a: Activity) => new Date(a.date) >= weekAgo)
          .reduce((sum: number, a: Activity) => sum + (a.duration || 0), 0);

        const completedActivities = activityData.filter(
          (a: Activity) => a.status === 'Completed'
        ).length;

        const upcomingActivities = activityData.filter(
          (a: Activity) => a.status === 'Pending' && new Date(a.date) >= now
        ).length;

        setStats({
          totalHours: Math.round(totalHours),
          weekHours: Math.round(weekHours),
          completedActivities,
          upcomingActivities
        });
      }
    } catch (error) {
      console.error('Error fetching activities:', error);
    }
  };

  const handleCreateActivity = async (activityData: ActivityFormData) => {
    try {
      const response = await fetch('/api/activities', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(activityData),
      });

      const data = await response.json();

      if (data.success) {
        // Refresh activities
        fetchActivities();
      } else {
        throw new Error(data.error || 'Failed to create activity');
      }
    } catch (error) {
      console.error('Error creating activity:', error);
      throw error;
    }
  };

  const handleLogout = () => {
    signOut({ callbackUrl: '/login' });
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-base-200">
      {/* Navbar */}
      <div className="navbar bg-primary text-primary-content">
        <div className="flex-1">
          <a className="btn btn-ghost text-xl">W-2 Activity Logs</a>
        </div>
        <div className="flex-none gap-2">
          <div className="dropdown dropdown-end">
            <div tabIndex={0} role="button" className="btn btn-ghost">
              {user.name}
            </div>
            <ul tabIndex={0} className="mt-3 z-[1] p-2 shadow menu menu-sm dropdown-content bg-base-100 rounded-box w-52">
              <li><Link href="/profile">Profile</Link></li>
              <li><a>Settings</a></li>
              <li><a onClick={handleLogout}>Logout</a></li>
            </ul>
          </div>
        </div>
      </div>

      <div className="container mx-auto p-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">
            Welcome back, {user.name}!
          </h1>
          <p className="text-base-content opacity-70">
            {user.role === 'client'
              ? 'Track your W-2 program progress and manage your activities'
              : 'Manage your clients and track their W-2 program progress'
            }
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="stats shadow">
            <div className="stat">
              <div className="stat-figure text-primary">
                <Clock className="h-8 w-8" />
              </div>
              <div className="stat-title">Total Hours</div>
              <div className="stat-value text-primary">{stats.totalHours}</div>
              <div className="stat-desc">This month</div>
            </div>
          </div>

          <div className="stats shadow">
            <div className="stat">
              <div className="stat-figure text-secondary">
                <Calendar className="h-8 w-8" />
              </div>
              <div className="stat-title">This Week</div>
              <div className="stat-value text-secondary">{stats.weekHours}</div>
              <div className="stat-desc">Hours logged</div>
            </div>
          </div>

          <div className="stats shadow">
            <div className="stat">
              <div className="stat-figure text-success">
                <Briefcase className="h-8 w-8" />
              </div>
              <div className="stat-title">Completed</div>
              <div className="stat-value text-success">{stats.completedActivities}</div>
              <div className="stat-desc">Activities</div>
            </div>
          </div>

          <div className="stats shadow">
            <div className="stat">
              <div className="stat-figure text-info">
                <TrendingUp className="h-8 w-8" />
              </div>
              <div className="stat-title">Upcoming</div>
              <div className="stat-value text-info">{stats.upcomingActivities}</div>
              <div className="stat-desc">This week</div>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Activities */}
          <div className="card bg-base-100 shadow-xl">
            <div className="card-body">
              <h2 className="card-title">Recent Activities</h2>
              {activities.length === 0 ? (
                <div className="text-center py-8 opacity-70">
                  <Briefcase className="h-12 w-12 mx-auto mb-3 opacity-30" />
                  <p>No activities yet. Log your first activity to get started!</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {activities.map((activity) => {
                    const daysAgo = Math.floor(
                      (Date.now() - new Date(activity.date).getTime()) / (1000 * 60 * 60 * 24)
                    );
                    const alertClass =
                      activity.status === 'Completed' ? 'alert-success' :
                      activity.status === 'Pending' ? 'alert-warning' :
                      'alert-error';

                    return (
                      <div key={activity._id} className={`alert ${alertClass}`}>
                        <Briefcase className="h-5 w-5" />
                        <div>
                          <div className="font-bold">{activity.activityType}</div>
                          <div className="text-sm">
                            {activity.description} - {daysAgo === 0 ? 'Today' : `${daysAgo} day${daysAgo > 1 ? 's' : ''} ago`}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
              <div className="card-actions justify-end mt-4">
                <Link href="/activities" className="btn btn-primary">
                  View All Activities
                </Link>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="card bg-base-100 shadow-xl">
            <div className="card-body">
              <h2 className="card-title">Quick Actions</h2>
              <div className="space-y-3">
                <button
                  className="btn btn-primary btn-block justify-start"
                  onClick={() => setIsModalOpen(true)}
                >
                  <Briefcase className="h-5 w-5" />
                  Log New Activity
                </button>
                <Link href="/schedule" className="btn btn-outline btn-block justify-start">
                  <Calendar className="h-5 w-5" />
                  View Schedule
                </Link>
                <Link href="/reports" className="btn btn-outline btn-block justify-start">
                  <TrendingUp className="h-5 w-5" />
                  View Reports
                </Link>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* Activity Modal */}
      {user && (
        <ActivityModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSubmit={handleCreateActivity}
          userId={user.id}
        />
      )}
    </div>
  );
}
