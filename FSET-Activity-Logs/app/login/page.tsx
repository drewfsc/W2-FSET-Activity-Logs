'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, User, Lock, LogIn } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [role, setRole] = useState<'client' | 'coach'>('client');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Simulate login process
    setTimeout(() => {
      // In production, validate credentials and get user data
      const userData = {
        id: Math.random().toString(36).substr(2, 9),
        name: role === 'client' ? 'Maria Garcia' : 'David Lee',
        email: email,
        role: role,
      };

      // Store in localStorage (in production, use proper session management)
      localStorage.setItem('user', JSON.stringify(userData));

      // Redirect to dashboard
      router.push('/dashboard');
      setIsLoading(false);
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-900 via-green-800 to-green-900 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="bg-base-100 rounded-2xl shadow-2xl p-8">
          <div className="text-center">
            <button
              onClick={() => router.push('/')}
              className="btn btn-ghost btn-sm mb-6"
            >
              <ArrowLeft className="h-5 w-5 mr-2" />
              Back to Home
            </button>

            <div className={`mx-auto h-16 w-16 rounded-full flex items-center justify-center mb-6 ${
              role === 'client' ? 'bg-blue-600' : 'bg-green-600'
            } shadow-lg`}>
              <User className="h-8 w-8 text-white" />
            </div>

            <h2 className="text-3xl font-bold mb-2">
              FSET Program Login
            </h2>
            <p className="text-base-content opacity-70">
              Access your FSET activity records and program information
            </p>
          </div>

          {/* Role Selection */}
          <div className="mt-6 flex gap-4">
            <button
              type="button"
              onClick={() => setRole('client')}
              className={`flex-1 btn ${role === 'client' ? 'btn-primary' : 'btn-outline'}`}
            >
              Client
            </button>
            <button
              type="button"
              onClick={() => setRole('coach')}
              className={`flex-1 btn ${role === 'coach' ? 'btn-success' : 'btn-outline'}`}
            >
              Coach
            </button>
          </div>

          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-4">
              <div className="form-control">
                <label htmlFor="email" className="label">
                  <span className="label-text">Email Address</span>
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input input-bordered w-full"
                  placeholder="Enter your email"
                />
              </div>

              <div className="form-control">
                <label htmlFor="password" className="label">
                  <span className="label-text">Password</span>
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input input-bordered w-full"
                  placeholder="Enter your password"
                />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <label className="label cursor-pointer gap-2">
                <input type="checkbox" className="checkbox checkbox-sm" />
                <span className="label-text">Remember me</span>
              </label>

              <a href="#" className="link link-success text-sm">
                Forgot password?
              </a>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className={`btn w-full ${role === 'client' ? 'btn-primary' : 'btn-success'}`}
            >
              {isLoading ? (
                <span className="loading loading-spinner"></span>
              ) : (
                <>
                  <LogIn className="h-5 w-5" />
                  Sign In
                </>
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm opacity-60">
              Demo credentials: Use any email and password
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
