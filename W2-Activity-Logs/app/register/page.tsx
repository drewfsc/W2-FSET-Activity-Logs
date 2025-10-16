'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { ArrowLeft, User, MapPin, Save } from 'lucide-react';

export default function RegisterPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    street: '',
    city: '',
    state: '',
    zip: '',
    homeCounty: '',
  });

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    // Validate required fields
    if (!formData.name || !formData.street || !formData.city || !formData.state || !formData.zip) {
      setError('Please fill in all required fields');
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          referralSource: 'W2 Activity Logs', // Default to W2, can be made dynamic
        }),
      });

      const data = await response.json();

      if (data.success) {
        // Registration successful, force full page reload to refresh session
        window.location.href = '/dashboard';
      } else {
        setError(data.error || 'Registration failed');
      }
    } catch (err) {
      console.error('Registration error:', err);
      setError('Failed to complete registration');
    } finally {
      setIsLoading(false);
    }
  };

  if (status === 'loading') {
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
      </div>

      <div className="container mx-auto p-8 max-w-2xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Complete Your Registration</h1>
          <p className="text-base-content opacity-70">
            We need a few more details to set up your account
          </p>
        </div>

        {/* Registration Form */}
        <div className="card bg-base-100 shadow-xl">
          <div className="card-body">
            {error && (
              <div className="alert alert-error mb-4">
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit}>
              {/* Name */}
              <div className="form-control mb-4">
                <label className="label">
                  <span className="label-text font-semibold">Full Name *</span>
                </label>
                <div className="flex items-center gap-2">
                  <User className="h-5 w-5 opacity-70" />
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    className="input input-bordered flex-1"
                    placeholder="Enter your full name"
                    required
                  />
                </div>
              </div>

              {/* Address Section */}
              <div className="divider">
                <MapPin className="h-5 w-5" />
                Address Information
              </div>

              {/* Street Address */}
              <div className="form-control mb-4">
                <label className="label">
                  <span className="label-text font-semibold">Street Address *</span>
                </label>
                <input
                  type="text"
                  value={formData.street}
                  onChange={(e) => handleInputChange('street', e.target.value)}
                  className="input input-bordered"
                  placeholder="Enter street address"
                  required
                />
              </div>

              {/* City, State, ZIP */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div className="form-control">
                  <label className="label">
                    <span className="label-text font-semibold">City *</span>
                  </label>
                  <input
                    type="text"
                    value={formData.city}
                    onChange={(e) => handleInputChange('city', e.target.value)}
                    className="input input-bordered"
                    placeholder="City"
                    required
                  />
                </div>

                <div className="form-control">
                  <label className="label">
                    <span className="label-text font-semibold">State *</span>
                  </label>
                  <input
                    type="text"
                    value={formData.state}
                    onChange={(e) => handleInputChange('state', e.target.value)}
                    className="input input-bordered"
                    placeholder="State"
                    maxLength={2}
                    required
                  />
                </div>

                <div className="form-control">
                  <label className="label">
                    <span className="label-text font-semibold">ZIP Code *</span>
                  </label>
                  <input
                    type="text"
                    value={formData.zip}
                    onChange={(e) => handleInputChange('zip', e.target.value)}
                    className="input input-bordered"
                    placeholder="ZIP"
                    required
                  />
                </div>
              </div>

              {/* Home County */}
              <div className="form-control mb-6">
                <label className="label">
                  <span className="label-text font-semibold">Home County</span>
                </label>
                <input
                  type="text"
                  value={formData.homeCounty}
                  onChange={(e) => handleInputChange('homeCounty', e.target.value)}
                  className="input input-bordered"
                  placeholder="Enter home county (optional)"
                />
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                className="btn btn-primary w-full"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <span className="loading loading-spinner loading-sm mr-2"></span>
                    Completing Registration...
                  </>
                ) : (
                  <>
                    <Save className="h-5 w-5 mr-2" />
                    Complete Registration
                  </>
                )}
              </button>
            </form>

            <div className="alert alert-info mt-4">
              <span className="text-sm">
                * Required fields. This information helps us provide you with better service.
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
