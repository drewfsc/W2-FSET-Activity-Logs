'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { ArrowLeft, User, Mail, Phone, MapPin, Briefcase, Calendar, Shield, Users } from 'lucide-react';

interface UserProfile {
  _id: string;
  email: string;
  name: string;
  phone?: string;
  level?: string;
  programs?: string[];
  city?: string;
  state?: string;
  street?: string;
  zip?: string;
  county?: string[];
  homeCounty?: string;
  image?: string;
  emailVerified?: string;
  lastLogin?: string;
  timestamp?: string;
  isYouth?: boolean;
  appearance?: string;
  coach?: any[];
  coachUpdate?: string;
}

export default function ProfilePage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    } else if (status === 'authenticated') {
      fetchProfile();
    }
  }, [status, router]);

  const fetchProfile = async () => {
    try {
      const response = await fetch('/api/profile');
      const data = await response.json();

      if (data.success) {
        setProfile(data.data);
      } else {
        setError(data.error || 'Failed to load profile');
      }
    } catch (err) {
      console.error('Error fetching profile:', err);
      setError('Failed to load profile');
    } finally {
      setIsLoading(false);
    }
  };

  if (status === 'loading' || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="alert alert-error max-w-md">
          <span>{error}</span>
        </div>
      </div>
    );
  }

  if (!profile) {
    return null;
  }

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

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
      </div>

      <div className="container mx-auto p-8 max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">My Profile</h1>
          <p className="text-base-content opacity-70">
            Your information from FSC database
          </p>
        </div>

        {/* Profile Card */}
        <div className="card bg-base-100 shadow-xl">
          <div className="card-body">
            {/* Profile Image and Name */}
            <div className="flex items-center gap-6 mb-6 pb-6 border-b border-base-300">
              {profile.image ? (
                <div className="avatar">
                  <div className="w-24 rounded-full">
                    <img src={profile.image} alt={profile.name} />
                  </div>
                </div>
              ) : (
                <div className="avatar placeholder">
                  <div className="bg-primary text-primary-content rounded-full w-24">
                    <span className="text-3xl">{profile.name.charAt(0).toUpperCase()}</span>
                  </div>
                </div>
              )}
              <div className="flex-1">
                <h2 className="text-3xl font-bold">{profile.name}</h2>
                <div className="flex items-center gap-2 mt-2">
                  <Shield className="h-4 w-4 opacity-70" />
                  <span className="badge badge-primary capitalize">
                    {profile.level || 'Participant'}
                  </span>
                </div>
              </div>
            </div>

            {/* Contact Information */}
            <div className="mb-6">
              <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <Mail className="h-5 w-5" />
                Contact Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="form-control">
                  <label className="label">
                    <span className="label-text font-semibold">Email</span>
                  </label>
                  <div className="flex items-center gap-2 p-3 bg-base-200 rounded-lg">
                    <Mail className="h-4 w-4 opacity-70" />
                    <span>{profile.email}</span>
                  </div>
                </div>

                {profile.phone && (
                  <div className="form-control">
                    <label className="label">
                      <span className="label-text font-semibold">Phone</span>
                    </label>
                    <div className="flex items-center gap-2 p-3 bg-base-200 rounded-lg">
                      <Phone className="h-4 w-4 opacity-70" />
                      <span>{profile.phone}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Address Information */}
            {(profile.street || profile.city || profile.state || profile.zip) && (
              <div className="mb-6">
                <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  Address
                </h3>
                <div className="p-4 bg-base-200 rounded-lg">
                  {profile.street && <p>{profile.street}</p>}
                  <p>
                    {profile.city && profile.city}
                    {profile.city && profile.state && ', '}
                    {profile.state && profile.state}
                    {profile.zip && ` ${profile.zip}`}
                  </p>
                  {profile.homeCounty && (
                    <p className="mt-2">
                      <span className="font-semibold">Home County:</span> {profile.homeCounty}
                    </p>
                  )}
                  {profile.county && profile.county.length > 0 && (
                    <p className="mt-1">
                      <span className="font-semibold">Counties:</span> {profile.county.join(', ')}
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Programs */}
            {profile.programs && profile.programs.length > 0 && (
              <div className="mb-6">
                <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                  <Briefcase className="h-5 w-5" />
                  Programs
                </h3>
                <div className="flex flex-wrap gap-2">
                  {profile.programs.map((program, index) => (
                    <span key={index} className="badge badge-lg badge-secondary">
                      {program}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Coach Assignments */}
            {profile.coach && profile.coach.length > 0 && (
              <div className="mb-6">
                <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Coach History
                </h3>
                <div className="space-y-2">
                  {profile.coach.map((coachItem, index) => (
                    <div key={index} className="p-3 bg-base-200 rounded-lg">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-semibold">{coachItem.name}</p>
                          <p className="text-sm opacity-70">{coachItem.email}</p>
                        </div>
                        {coachItem.timestamp && (
                          <span className="text-xs opacity-70">
                            {new Date(coachItem.timestamp).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                      {coachItem.removalDate && (
                        <p className="text-xs opacity-70 mt-1">
                          Removed: {new Date(coachItem.removalDate).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Account Details */}
            <div className="mb-6">
              <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Account Details
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {profile.timestamp && (
                  <div className="form-control">
                    <label className="label">
                      <span className="label-text font-semibold">Account Created</span>
                    </label>
                    <div className="p-3 bg-base-200 rounded-lg">
                      {formatDate(profile.timestamp)}
                    </div>
                  </div>
                )}

                {profile.lastLogin && (
                  <div className="form-control">
                    <label className="label">
                      <span className="label-text font-semibold">Last Login</span>
                    </label>
                    <div className="p-3 bg-base-200 rounded-lg">
                      {formatDate(profile.lastLogin)}
                    </div>
                  </div>
                )}

                {profile.emailVerified && (
                  <div className="form-control">
                    <label className="label">
                      <span className="label-text font-semibold">Email Verified</span>
                    </label>
                    <div className="p-3 bg-base-200 rounded-lg">
                      {formatDate(profile.emailVerified)}
                    </div>
                  </div>
                )}

                {typeof profile.isYouth !== 'undefined' && (
                  <div className="form-control">
                    <label className="label">
                      <span className="label-text font-semibold">Youth Program</span>
                    </label>
                    <div className="p-3 bg-base-200 rounded-lg">
                      {profile.isYouth ? 'Yes' : 'No'}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Additional Info */}
            <div className="alert alert-info">
              <span className="text-sm">
                This information is pulled from the FSC database. To update your profile,
                please contact your coach or administrator.
              </span>
            </div>
          </div>
        </div>

        {/* Back Button */}
        <div className="mt-6 flex justify-center">
          <Link href="/dashboard" className="btn btn-primary">
            <ArrowLeft className="h-5 w-5 mr-2" />
            Back to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
