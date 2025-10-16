import Link from 'next/link';
import { Briefcase, Users, BarChart3, ArrowRight } from 'lucide-react';

export default function Home() {
  return (
    <div className="min-h-screen bg-base-200">
      <div className="navbar bg-primary text-primary-content">
        <div className="flex-1">
          <a className="btn btn-ghost text-xl">W-2 Activity Logs</a>
        </div>
        <div className="flex-none">
          <Link href="/login" className="btn btn-ghost">
            Login
          </Link>
        </div>
      </div>

      <div className="container mx-auto p-8">
        <div className="hero bg-base-100 rounded-lg shadow-xl">
          <div className="hero-content text-center">
            <div className="max-w-md">
              <h1 className="text-5xl font-bold">Welcome to W-2 Program</h1>
              <p className="py-6">
                Track employment activities, manage client progress, and monitor outcomes for the W-2 program.
              </p>
              <Link href="/login" className="btn btn-primary gap-2">
                Get Started
                <ArrowRight className="h-5 w-5" />
              </Link>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
          <div className="card bg-base-100 shadow-xl">
            <div className="card-body">
              <Briefcase className="h-12 w-12 text-primary mb-2" />
              <h2 className="card-title">Job Search & Training</h2>
              <p>Access job search tools, track applications, and manage training activities</p>
            </div>
          </div>

          <div className="card bg-base-100 shadow-xl">
            <div className="card-body">
              <Users className="h-12 w-12 text-primary mb-2" />
              <h2 className="card-title">Client Management</h2>
              <p>Track client progress, activities, and employment outcomes</p>
            </div>
          </div>

          <div className="card bg-base-100 shadow-xl">
            <div className="card-body">
              <BarChart3 className="h-12 w-12 text-primary mb-2" />
              <h2 className="card-title">Reports & Analytics</h2>
              <p>Generate comprehensive reports and track program metrics</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
