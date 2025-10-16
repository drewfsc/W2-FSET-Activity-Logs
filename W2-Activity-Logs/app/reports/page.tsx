'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, TrendingUp, Briefcase, Clock, Calendar, PieChart, BarChart3 } from 'lucide-react';

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

interface Stats {
  totalActivities: number;
  totalHours: number;
  completedActivities: number;
  pendingActivities: number;
  activitiesByType: { [key: string]: number };
  activitiesByMonth: { month: string; count: number }[];
  averageHoursPerActivity: number;
}

export default function ReportsPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'year' | 'all'>('month');

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (!userData) {
      router.push('/login');
    } else {
      setUser(JSON.parse(userData));
      fetchActivities();
    }
  }, [router]);

  useEffect(() => {
    if (activities.length > 0) {
      calculateStats();
    }
  }, [activities, timeRange]);

  const fetchActivities = async () => {
    try {
      const response = await fetch('/api/activities');
      const data = await response.json();

      if (data.success) {
        setActivities(data.data);
      }
    } catch (error) {
      console.error('Error fetching activities:', error);
    } finally {
      setLoading(false);
    }
  };

  const getFilteredActivities = () => {
    const now = new Date();
    const filtered = activities.filter(activity => {
      const activityDate = new Date(activity.date);

      switch (timeRange) {
        case 'week':
          const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          return activityDate >= weekAgo;
        case 'month':
          const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          return activityDate >= monthAgo;
        case 'year':
          const yearAgo = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
          return activityDate >= yearAgo;
        default:
          return true;
      }
    });

    return filtered;
  };

  const calculateStats = () => {
    const filtered = getFilteredActivities();

    const totalActivities = filtered.length;
    const totalHours = filtered.reduce((sum, a) => sum + (a.duration || 0), 0);
    const completedActivities = filtered.filter(a => a.status === 'Completed').length;
    const pendingActivities = filtered.filter(a => a.status === 'Pending').length;

    // Activities by type
    const activitiesByType: { [key: string]: number } = {};
    filtered.forEach(activity => {
      activitiesByType[activity.activityType] = (activitiesByType[activity.activityType] || 0) + 1;
    });

    // Activities by month (last 6 months)
    const activitiesByMonth: { month: string; count: number }[] = [];
    for (let i = 5; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      const monthKey = date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
      const count = filtered.filter(activity => {
        const activityDate = new Date(activity.date);
        return (
          activityDate.getMonth() === date.getMonth() &&
          activityDate.getFullYear() === date.getFullYear()
        );
      }).length;
      activitiesByMonth.push({ month: monthKey, count });
    }

    const averageHoursPerActivity = totalActivities > 0 ? totalHours / totalActivities : 0;

    setStats({
      totalActivities,
      totalHours,
      completedActivities,
      pendingActivities,
      activitiesByType,
      activitiesByMonth,
      averageHoursPerActivity
    });
  };

  if (loading || !user || !stats) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    );
  }

  const completionRate = stats.totalActivities > 0
    ? ((stats.completedActivities / stats.totalActivities) * 100).toFixed(1)
    : 0;

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
          <span className="mr-4">{user.name}</span>
        </div>
      </div>

      <div className="container mx-auto p-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold mb-2">Reports & Analytics</h1>
            <p className="text-base-content opacity-70">
              Track your progress and analyze your W-2 program performance
            </p>
          </div>

          {/* Time Range Selector */}
          <div className="form-control">
            <select
              className="select select-bordered"
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value as any)}
            >
              <option value="week">Last 7 Days</option>
              <option value="month">Last 30 Days</option>
              <option value="year">Last Year</option>
              <option value="all">All Time</option>
            </select>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="stats shadow bg-base-100">
            <div className="stat">
              <div className="stat-figure text-primary">
                <Briefcase className="h-8 w-8" />
              </div>
              <div className="stat-title">Total Activities</div>
              <div className="stat-value text-primary">{stats.totalActivities}</div>
              <div className="stat-desc">{timeRange === 'all' ? 'All time' : `Last ${timeRange}`}</div>
            </div>
          </div>

          <div className="stats shadow bg-base-100">
            <div className="stat">
              <div className="stat-figure text-secondary">
                <Clock className="h-8 w-8" />
              </div>
              <div className="stat-title">Total Hours</div>
              <div className="stat-value text-secondary">{stats.totalHours.toFixed(1)}</div>
              <div className="stat-desc">{stats.averageHoursPerActivity.toFixed(1)} avg per activity</div>
            </div>
          </div>

          <div className="stats shadow bg-base-100">
            <div className="stat">
              <div className="stat-figure text-success">
                <TrendingUp className="h-8 w-8" />
              </div>
              <div className="stat-title">Completion Rate</div>
              <div className="stat-value text-success">{completionRate}%</div>
              <div className="stat-desc">{stats.completedActivities} completed</div>
            </div>
          </div>

          <div className="stats shadow bg-base-100">
            <div className="stat">
              <div className="stat-figure text-warning">
                <Calendar className="h-8 w-8" />
              </div>
              <div className="stat-title">Pending</div>
              <div className="stat-value text-warning">{stats.pendingActivities}</div>
              <div className="stat-desc">Activities in progress</div>
            </div>
          </div>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Activities by Type */}
          <div className="card bg-base-100 shadow-xl">
            <div className="card-body">
              <h2 className="card-title flex items-center gap-2">
                <PieChart className="h-6 w-6" />
                Activities by Type
              </h2>
              <div className="space-y-3 mt-4">
                {Object.entries(stats.activitiesByType)
                  .sort(([, a], [, b]) => b - a)
                  .map(([type, count]) => {
                    const percentage = ((count / stats.totalActivities) * 100).toFixed(1);
                    return (
                      <div key={type}>
                        <div className="flex justify-between text-sm mb-1">
                          <span>{type}</span>
                          <span className="font-semibold">{count} ({percentage}%)</span>
                        </div>
                        <progress
                          className="progress progress-primary w-full"
                          value={count}
                          max={stats.totalActivities}
                        ></progress>
                      </div>
                    );
                  })}
              </div>
            </div>
          </div>

          {/* Monthly Trend */}
          <div className="card bg-base-100 shadow-xl">
            <div className="card-body">
              <h2 className="card-title flex items-center gap-2">
                <BarChart3 className="h-6 w-6" />
                Activity Trend (Last 6 Months)
              </h2>
              <div className="space-y-3 mt-4">
                {stats.activitiesByMonth.map((item) => {
                  const maxCount = Math.max(...stats.activitiesByMonth.map(m => m.count));
                  const percentage = maxCount > 0 ? (item.count / maxCount) * 100 : 0;
                  return (
                    <div key={item.month}>
                      <div className="flex justify-between text-sm mb-1">
                        <span>{item.month}</span>
                        <span className="font-semibold">{item.count} activities</span>
                      </div>
                      <progress
                        className="progress progress-secondary w-full"
                        value={percentage}
                        max={100}
                      ></progress>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Status Breakdown */}
        <div className="card bg-base-100 shadow-xl">
          <div className="card-body">
            <h2 className="card-title">Activity Status Breakdown</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-4">
              <div className="text-center p-6 bg-success/10 rounded-lg">
                <div className="text-4xl font-bold text-success mb-2">
                  {stats.completedActivities}
                </div>
                <div className="text-sm opacity-70">Completed Activities</div>
              </div>
              <div className="text-center p-6 bg-warning/10 rounded-lg">
                <div className="text-4xl font-bold text-warning mb-2">
                  {stats.pendingActivities}
                </div>
                <div className="text-sm opacity-70">Pending Activities</div>
              </div>
              <div className="text-center p-6 bg-error/10 rounded-lg">
                <div className="text-4xl font-bold text-error mb-2">
                  {stats.totalActivities - stats.completedActivities - stats.pendingActivities}
                </div>
                <div className="text-sm opacity-70">Cancelled Activities</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
