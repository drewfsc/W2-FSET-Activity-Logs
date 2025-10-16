import Link from 'next/link';
import { GraduationCap, Users, BarChart3, ArrowRight } from 'lucide-react';

export default function Home() {
  return (
    <div className="min-h-screen bg-base-200">
      <div className="navbar bg-success text-success-content">
        <div className="flex-1">
          <a className="btn btn-ghost text-xl">FSET Activity Logs</a>
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
              <h1 className="text-5xl font-bold">Welcome to FSET Program</h1>
              <p className="py-6">
                Track education and training activities, manage client development, and monitor progress for the FSET program.
              </p>
              <Link href="/login" className="btn btn-success gap-2">
                Get Started
                <ArrowRight className="h-5 w-5" />
              </Link>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
          <div className="card bg-base-100 shadow-xl">
            <div className="card-body">
              <GraduationCap className="h-12 w-12 text-success mb-2" />
              <h2 className="card-title">Education & Training</h2>
              <p>Track educational programs, workshops, and vocational training activities</p>
            </div>
          </div>

          <div className="card bg-base-100 shadow-xl">
            <div className="card-body">
              <Users className="h-12 w-12 text-success mb-2" />
              <h2 className="card-title">Client Development</h2>
              <p>Monitor client progress, skill development, and career counseling sessions</p>
            </div>
          </div>

          <div className="card bg-base-100 shadow-xl">
            <div className="card-body">
              <BarChart3 className="h-12 w-12 text-success mb-2" />
              <h2 className="card-title">Reports & Analytics</h2>
              <p>Generate reports and track program participation and outcomes</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
