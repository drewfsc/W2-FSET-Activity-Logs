'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Calendar as CalendarIcon, Clock, Briefcase, ArrowLeft, ChevronLeft, ChevronRight } from 'lucide-react';

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

export default function SchedulePage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (!userData) {
      router.push('/login');
    } else {
      setUser(JSON.parse(userData));
      fetchActivities();
    }
  }, [router]);

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

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    return { daysInMonth, startingDayOfWeek, year, month };
  };

  const getActivitiesForDate = (date: Date) => {
    return activities.filter(activity => {
      const activityDate = new Date(activity.date);
      return (
        activityDate.getDate() === date.getDate() &&
        activityDate.getMonth() === date.getMonth() &&
        activityDate.getFullYear() === date.getFullYear()
      );
    });
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      if (direction === 'prev') {
        newDate.setMonth(newDate.getMonth() - 1);
      } else {
        newDate.setMonth(newDate.getMonth() + 1);
      }
      return newDate;
    });
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  };

  const isSameDay = (date1: Date, date2: Date) => {
    return (
      date1.getDate() === date2.getDate() &&
      date1.getMonth() === date2.getMonth() &&
      date1.getFullYear() === date2.getFullYear()
    );
  };

  const renderCalendar = () => {
    const { daysInMonth, startingDayOfWeek, year, month } = getDaysInMonth(currentDate);
    const days = [];

    // Empty cells for days before month starts
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(<div key={`empty-${i}`} className="p-2"></div>);
    }

    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      const dayActivities = getActivitiesForDate(date);
      const isSelected = isSameDay(date, selectedDate);
      const today = isToday(date);

      days.push(
        <div
          key={day}
          onClick={() => setSelectedDate(date)}
          className={`
            p-2 min-h-[80px] border border-base-300 cursor-pointer hover:bg-base-200 transition-colors
            ${today ? 'bg-primary/10 border-primary' : ''}
            ${isSelected ? 'ring-2 ring-primary' : ''}
          `}
        >
          <div className={`text-sm font-semibold mb-1 ${today ? 'text-primary' : ''}`}>
            {day}
          </div>
          {dayActivities.length > 0 && (
            <div className="space-y-1">
              {dayActivities.slice(0, 2).map((activity, idx) => (
                <div
                  key={idx}
                  className={`text-xs p-1 rounded truncate ${
                    activity.status === 'Completed' ? 'bg-success/20' :
                    activity.status === 'Pending' ? 'bg-warning/20' :
                    'bg-error/20'
                  }`}
                >
                  {activity.activityType}
                </div>
              ))}
              {dayActivities.length > 2 && (
                <div className="text-xs opacity-70">+{dayActivities.length - 2} more</div>
              )}
            </div>
          )}
        </div>
      );
    }

    return days;
  };

  const selectedDateActivities = getActivitiesForDate(selectedDate);

  if (loading || !user) {
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
          <Link href="/dashboard" className="btn btn-ghost text-xl">
            <ArrowLeft className="h-5 w-5 mr-2" />
            FSET Activity Logs
          </Link>
        </div>
        <div className="flex-none">
          <span className="mr-4">{user.name}</span>
        </div>
      </div>

      <div className="container mx-auto p-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Schedule & Calendar</h1>
          <p className="text-base-content opacity-70">
            View your activities in calendar format
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Calendar */}
          <div className="lg:col-span-2">
            <div className="card bg-base-100 shadow-xl">
              <div className="card-body">
                {/* Calendar Header */}
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold">
                    {currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                  </h2>
                  <div className="flex gap-2">
                    <button
                      onClick={() => navigateMonth('prev')}
                      className="btn btn-sm btn-circle"
                    >
                      <ChevronLeft className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => setCurrentDate(new Date())}
                      className="btn btn-sm"
                    >
                      Today
                    </button>
                    <button
                      onClick={() => navigateMonth('next')}
                      className="btn btn-sm btn-circle"
                    >
                      <ChevronRight className="h-5 w-5" />
                    </button>
                  </div>
                </div>

                {/* Day Headers */}
                <div className="grid grid-cols-7 gap-0 mb-2">
                  {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                    <div key={day} className="text-center font-semibold text-sm p-2">
                      {day}
                    </div>
                  ))}
                </div>

                {/* Calendar Grid */}
                <div className="grid grid-cols-7 gap-0 border border-base-300">
                  {renderCalendar()}
                </div>

                {/* Legend */}
                <div className="flex gap-4 mt-4 text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-success/20 rounded"></div>
                    <span>Completed</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-warning/20 rounded"></div>
                    <span>Pending</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-error/20 rounded"></div>
                    <span>Cancelled</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Selected Date Details */}
          <div className="lg:col-span-1">
            <div className="card bg-base-100 shadow-xl sticky top-8">
              <div className="card-body">
                <div className="flex items-center gap-2 mb-4">
                  <CalendarIcon className="h-6 w-6 text-primary" />
                  <h3 className="text-xl font-bold">
                    {selectedDate.toLocaleDateString('en-US', {
                      month: 'long',
                      day: 'numeric',
                      year: 'numeric'
                    })}
                  </h3>
                </div>

                {selectedDateActivities.length === 0 ? (
                  <div className="text-center py-8 opacity-70">
                    <Briefcase className="h-12 w-12 mx-auto mb-3 opacity-30" />
                    <p>No activities scheduled for this date</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {selectedDateActivities.map((activity) => (
                      <div
                        key={activity._id}
                        className="p-3 bg-base-200 rounded-lg hover:bg-base-300 transition-colors"
                      >
                        <div className="flex items-start gap-2 mb-2">
                          <Briefcase className="h-4 w-4 mt-1 opacity-70" />
                          <div className="flex-1">
                            <div className="font-semibold">{activity.activityType}</div>
                            <div className="text-sm opacity-70">{activity.description}</div>
                          </div>
                        </div>

                        {activity.duration && (
                          <div className="flex items-center gap-1 text-sm opacity-70">
                            <Clock className="h-3 w-3" />
                            {activity.duration} hours
                          </div>
                        )}

                        <div className="mt-2">
                          <span className={`badge badge-sm ${
                            activity.status === 'Completed' ? 'badge-success' :
                            activity.status === 'Pending' ? 'badge-warning' :
                            'badge-error'
                          }`}>
                            {activity.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                <div className="mt-4">
                  <Link href="/dashboard" className="btn btn-primary btn-block btn-sm">
                    Log New Activity
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
