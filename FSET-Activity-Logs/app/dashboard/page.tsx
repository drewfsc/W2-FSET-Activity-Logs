'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { LogOut, GraduationCap, Calendar, Clock, TrendingUp } from 'lucide-react';

interface User {
  id: string;
  name: string;
  email: string;
  role: 'client' | 'coach';
}

export default function Dashboard() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (!userData) {
      router.push('/login');
    } else {
      setUser(JSON.parse(userData));
    }
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('user');
    router.push('/');
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
      <div className="navbar bg-success text-success-content">
        <div className="flex-1">
          <a className="btn btn-ghost text-xl">FSET Activity Logs</a>
        </div>
        <div className="flex-none gap-2">
          <div className="dropdown dropdown-end">
            <div tabIndex={0} role="button" className="btn btn-ghost">
              {user.name}
            </div>
            <ul tabIndex={0} className="mt-3 z-[1] p-2 shadow menu menu-sm dropdown-content bg-base-100 rounded-box w-52">
              <li><a>Profile</a></li>
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
              ? 'Track your FSET program progress and manage your training activities'
              : 'Manage your clients and track their FSET program progress'
            }
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="stats shadow">
            <div className="stat">
              <div className="stat-figure text-success">
                <Clock className="h-8 w-8" />
              </div>
              <div className="stat-title">Total Hours</div>
              <div className="stat-value text-success">32</div>
              <div className="stat-desc">This month</div>
            </div>
          </div>

          <div className="stats shadow">
            <div className="stat">
              <div className="stat-figure text-secondary">
                <Calendar className="h-8 w-8" />
              </div>
              <div className="stat-title">This Week</div>
              <div className="stat-value text-secondary">12</div>
              <div className="stat-desc">Hours logged</div>
            </div>
          </div>

          <div className="stats shadow">
            <div className="stat">
              <div className="stat-figure text-primary">
                <GraduationCap className="h-8 w-8" />
              </div>
              <div className="stat-title">Completed</div>
              <div className="stat-value text-primary">8</div>
              <div className="stat-desc">Training sessions</div>
            </div>
          </div>

          <div className="stats shadow">
            <div className="stat">
              <div className="stat-figure text-info">
                <TrendingUp className="h-8 w-8" />
              </div>
              <div className="stat-title">Upcoming</div>
              <div className="stat-value text-info">4</div>
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
              <div className="space-y-3">
                <div className="alert alert-success">
                  <GraduationCap className="h-5 w-5" />
                  <div>
                    <div className="font-bold">Workshop Completed</div>
                    <div className="text-sm">Resume Building - 1 day ago</div>
                  </div>
                </div>
                <div className="alert alert-info">
                  <Calendar className="h-5 w-5" />
                  <div>
                    <div className="font-bold">Counseling Session</div>
                    <div className="text-sm">Career Planning - 3 days ago</div>
                  </div>
                </div>
                <div className="alert">
                  <Clock className="h-5 w-5" />
                  <div>
                    <div className="font-bold">Vocational Training</div>
                    <div className="text-sm">Computer Skills - 5 days ago</div>
                  </div>
                </div>
              </div>
              <div className="card-actions justify-end mt-4">
                <button className="btn btn-success">View All Activities</button>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="card bg-base-100 shadow-xl">
            <div className="card-body">
              <h2 className="card-title">Quick Actions</h2>
              <div className="space-y-3">
                <button className="btn btn-success btn-block justify-start">
                  <GraduationCap className="h-5 w-5" />
                  Log New Activity
                </button>
                <button className="btn btn-outline btn-block justify-start">
                  <Calendar className="h-5 w-5" />
                  View Schedule
                </button>
                <button className="btn btn-outline btn-block justify-start">
                  <TrendingUp className="h-5 w-5" />
                  View Reports
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Info Alert */}
        <div className="alert alert-info mt-6">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="stroke-current shrink-0 w-6 h-6">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
          </svg>
          <span>This is a demo dashboard. Full features are coming soon!</span>
        </div>
      </div>
    </div>
  );
}
