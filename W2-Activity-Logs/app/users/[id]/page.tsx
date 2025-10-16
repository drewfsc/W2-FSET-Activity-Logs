'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { ArrowLeft, Save, User as UserIcon, Mail, Phone, MapPin, Shield } from 'lucide-react';

interface UserData {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  level: 'client' | 'coach' | 'admin';
  street?: string;
  city?: string;
  state?: string;
  zip?: string;
  homeCounty?: string;
  county?: string[];
  programs?: string[];
  lastLogin?: Date;
  timestamp?: Date;
}

export default function UserEditPage() {
  const router = useRouter();
  const params = useParams();
  const { data: session, status } = useSession();
  const [userData, setUserData] = useState<UserData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    } else if (status === 'authenticated') {
      // Only admins can access this page
      if (session.user.role !== 'admin') {
        router.push('/dashboard');
      } else {
        fetchUserData();
      }
    }
  }, [status, session, router, params.id]);

  const fetchUserData = async () => {
    try {
      const response = await fetch(`/api/users/${params.id}`);
      const data = await response.json();

      if (data.success) {
        setUserData(data.data);
      } else {
        setError(data.error || 'Failed to load user data');
      }
    } catch (err) {
      console.error('Error fetching user:', err);
      setError('Failed to load user data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: keyof UserData, value: string) => {
    if (!userData) return;
    setUserData({
      ...userData,
      [field]: value
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setError('');
    setSuccess('');

    try {
      const response = await fetch(`/api/users/${params.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      const data = await response.json();

      if (data.success) {
        setSuccess('User updated successfully!');
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setError(data.error || 'Failed to update user');
      }
    } catch (err) {
      console.error('Error updating user:', err);
      setError('Failed to update user');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading || status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    );
  }

  if (!userData) {
    return (
      <div className="min-h-screen bg-base-200 flex items-center justify-center">
        <div className="card bg-base-100 shadow-xl p-8">
          <h2 className="text-2xl font-bold mb-4">User Not Found</h2>
          <Link href="/dashboard" className="btn btn-primary">
            <ArrowLeft className="h-5 w-5 mr-2" />
            Back to Dashboard
          </Link>
        </div>
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
        <div className="flex-none">
          <Link href="/dashboard" className="btn btn-ghost">
            <ArrowLeft className="h-5 w-5 mr-2" />
            Back to Dashboard
          </Link>
        </div>
      </div>

      <div className="container mx-auto p-8 max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Edit User</h1>
          <p className="text-base-content opacity-70">
            Update user information and permissions
          </p>
        </div>

        {/* User Edit Form */}
        <div className="card bg-base-100 shadow-xl">
          <div className="card-body">
            {error && (
              <div className="alert alert-error mb-4">
                <span>{error}</span>
              </div>
            )}

            {success && (
              <div className="alert alert-success mb-4">
                <span>{success}</span>
              </div>
            )}

            <form onSubmit={handleSubmit}>
              {/* Basic Information */}
              <div className="mb-6">
                <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                  <UserIcon className="h-5 w-5" />
                  Basic Information
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Name */}
                  <div className="form-control">
                    <label className="label">
                      <span className="label-text font-semibold">Full Name *</span>
                    </label>
                    <input
                      type="text"
                      value={userData.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      className="input input-bordered"
                      required
                    />
                  </div>

                  {/* Email */}
                  <div className="form-control">
                    <label className="label">
                      <span className="label-text font-semibold">Email *</span>
                    </label>
                    <div className="flex items-center gap-2">
                      <Mail className="h-5 w-5 opacity-70" />
                      <input
                        type="email"
                        value={userData.email}
                        onChange={(e) => handleInputChange('email', e.target.value)}
                        className="input input-bordered flex-1"
                        required
                      />
                    </div>
                  </div>

                  {/* Phone */}
                  <div className="form-control">
                    <label className="label">
                      <span className="label-text font-semibold">Phone</span>
                    </label>
                    <div className="flex items-center gap-2">
                      <Phone className="h-5 w-5 opacity-70" />
                      <input
                        type="tel"
                        value={userData.phone || ''}
                        onChange={(e) => handleInputChange('phone', e.target.value)}
                        className="input input-bordered flex-1"
                        placeholder="+1234567890"
                      />
                    </div>
                  </div>

                  {/* Role/Level */}
                  <div className="form-control">
                    <label className="label">
                      <span className="label-text font-semibold">Role *</span>
                    </label>
                    <div className="flex items-center gap-2">
                      <Shield className="h-5 w-5 opacity-70" />
                      <select
                        value={userData.level}
                        onChange={(e) => handleInputChange('level', e.target.value)}
                        className="select select-bordered flex-1"
                        required
                      >
                        <option value="client">Client</option>
                        <option value="coach">Coach</option>
                        <option value="admin">Admin</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              {/* Address Information */}
              <div className="divider">
                <MapPin className="h-5 w-5" />
                Address Information
              </div>

              <div className="grid grid-cols-1 gap-4 mb-6">
                {/* Street */}
                <div className="form-control">
                  <label className="label">
                    <span className="label-text font-semibold">Street Address</span>
                  </label>
                  <input
                    type="text"
                    value={userData.street || ''}
                    onChange={(e) => handleInputChange('street', e.target.value)}
                    className="input input-bordered"
                    placeholder="123 Main St"
                  />
                </div>

                {/* City, State, ZIP */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="form-control">
                    <label className="label">
                      <span className="label-text font-semibold">City</span>
                    </label>
                    <input
                      type="text"
                      value={userData.city || ''}
                      onChange={(e) => handleInputChange('city', e.target.value)}
                      className="input input-bordered"
                      placeholder="City"
                    />
                  </div>

                  <div className="form-control">
                    <label className="label">
                      <span className="label-text font-semibold">State</span>
                    </label>
                    <input
                      type="text"
                      value={userData.state || ''}
                      onChange={(e) => handleInputChange('state', e.target.value)}
                      className="input input-bordered"
                      placeholder="WI"
                      maxLength={2}
                    />
                  </div>

                  <div className="form-control">
                    <label className="label">
                      <span className="label-text font-semibold">ZIP Code</span>
                    </label>
                    <input
                      type="text"
                      value={userData.zip || ''}
                      onChange={(e) => handleInputChange('zip', e.target.value)}
                      className="input input-bordered"
                      placeholder="53703"
                    />
                  </div>
                </div>

                {/* Home County */}
                <div className="form-control">
                  <label className="label">
                    <span className="label-text font-semibold">Home County</span>
                  </label>
                  <input
                    type="text"
                    value={userData.homeCounty || ''}
                    onChange={(e) => handleInputChange('homeCounty', e.target.value)}
                    className="input input-bordered"
                    placeholder="Dane"
                  />
                </div>
              </div>

              {/* Submit Button */}
              <div className="flex gap-4 mt-8">
                <button
                  type="submit"
                  className="btn btn-primary flex-1"
                  disabled={isSaving}
                >
                  {isSaving ? (
                    <>
                      <span className="loading loading-spinner loading-sm mr-2"></span>
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="h-5 w-5 mr-2" />
                      Save Changes
                    </>
                  )}
                </button>

                <Link href="/dashboard" className="btn btn-outline">
                  Cancel
                </Link>
              </div>
            </form>

            {/* User Metadata */}
            <div className="divider mt-8"></div>
            <div className="text-sm opacity-70">
              <p>User ID: {userData._id}</p>
              {userData.lastLogin && (
                <p>Last Login: {new Date(userData.lastLogin).toLocaleString()}</p>
              )}
              {userData.timestamp && (
                <p>Account Created: {new Date(userData.timestamp).toLocaleString()}</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
