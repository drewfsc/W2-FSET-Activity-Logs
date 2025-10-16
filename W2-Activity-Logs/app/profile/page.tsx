'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { ArrowLeft, User, Mail, Phone, MapPin, Briefcase, Calendar, Shield, Users, Edit2, Save, X } from 'lucide-react';

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
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editedProfile, setEditedProfile] = useState<Partial<UserProfile>>({});

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

  const handleEdit = () => {
    setIsEditing(true);
    setEditedProfile({
      phone: profile?.phone || '',
      street: profile?.street || '',
      city: profile?.city || '',
      state: profile?.state || '',
      zip: profile?.zip || '',
      homeCounty: profile?.homeCounty || '',
    });
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditedProfile({});
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const response = await fetch('/api/profile', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(editedProfile),
      });

      const data = await response.json();

      if (data.success) {
        setProfile(data.data);
        setIsEditing(false);
        setEditedProfile({});
      } else {
        setError(data.error || 'Failed to update profile');
      }
    } catch (err) {
      console.error('Error updating profile:', err);
      setError('Failed to update profile');
    } finally {
      setIsSaving(false);
    }
  };

  const handleInputChange = (field: keyof UserProfile, value: string) => {
    setEditedProfile(prev => ({
      ...prev,
      [field]: value
    }));
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
                {!isEditing && (
                  <button onClick={handleEdit} className="btn btn-sm btn-ghost ml-auto">
                    <Edit2 className="h-4 w-4" />
                    Edit
                  </button>
                )}
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

                <div className="form-control">
                  <label className="label">
                    <span className="label-text font-semibold">Phone</span>
                  </label>
                  {isEditing ? (
                    <input
                      type="tel"
                      value={editedProfile.phone || ''}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      className="input input-bordered"
                      placeholder="Enter phone number"
                    />
                  ) : (
                    <div className="flex items-center gap-2 p-3 bg-base-200 rounded-lg">
                      <Phone className="h-4 w-4 opacity-70" />
                      <span>{profile.phone || 'Not provided'}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Address Information */}
            <div className="mb-6">
              <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Address
              </h3>
              {isEditing ? (
                <div className="space-y-4">
                  <div className="form-control">
                    <label className="label">
                      <span className="label-text font-semibold">Street Address</span>
                    </label>
                    <input
                      type="text"
                      value={editedProfile.street || ''}
                      onChange={(e) => handleInputChange('street', e.target.value)}
                      className="input input-bordered"
                      placeholder="Enter street address"
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="form-control">
                      <label className="label">
                        <span className="label-text font-semibold">City</span>
                      </label>
                      <input
                        type="text"
                        value={editedProfile.city || ''}
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
                        value={editedProfile.state || ''}
                        onChange={(e) => handleInputChange('state', e.target.value)}
                        className="input input-bordered"
                        placeholder="State"
                        maxLength={2}
                      />
                    </div>
                    <div className="form-control">
                      <label className="label">
                        <span className="label-text font-semibold">ZIP Code</span>
                      </label>
                      <input
                        type="text"
                        value={editedProfile.zip || ''}
                        onChange={(e) => handleInputChange('zip', e.target.value)}
                        className="input input-bordered"
                        placeholder="ZIP"
                      />
                    </div>
                  </div>
                  <div className="form-control">
                    <label className="label">
                      <span className="label-text font-semibold">Home County</span>
                    </label>
                    <input
                      type="text"
                      value={editedProfile.homeCounty || ''}
                      onChange={(e) => handleInputChange('homeCounty', e.target.value)}
                      className="input input-bordered"
                      placeholder="Enter home county"
                    />
                  </div>
                </div>
              ) : (
                <div className="p-4 bg-base-200 rounded-lg">
                  {profile.street && <p>{profile.street}</p>}
                  {(profile.city || profile.state || profile.zip) && (
                    <p>
                      {profile.city && profile.city}
                      {profile.city && profile.state && ', '}
                      {profile.state && profile.state}
                      {profile.zip && ` ${profile.zip}`}
                    </p>
                  )}
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
                  {!profile.street && !profile.city && !profile.state && !profile.zip && !profile.homeCounty && (
                    <p className="opacity-70">No address information provided</p>
                  )}
                </div>
              )}
            </div>

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
            {profile.coach && profile.coach.filter(c => !c.removalDate).length > 0 && (
              <div className="mb-6">
                <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Coaches
                </h3>
                <div className="space-y-2">
                  {profile.coach
                    .filter(c => !c.removalDate)
                    .map((coachItem, index) => (
                      <div key={index} className="p-3 bg-base-200 rounded-lg">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-semibold">{coachItem.name}</p>
                            <p className="text-sm opacity-70">{coachItem.email}</p>
                          </div>
                          {coachItem.timestamp && (
                            <span className="text-xs opacity-70">
                              Since: {new Date(coachItem.timestamp).toLocaleDateString()}
                            </span>
                          )}
                        </div>
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

            {/* Edit Actions */}
            {isEditing && (
              <div className="flex gap-4 justify-end mt-6">
                <button
                  onClick={handleCancel}
                  className="btn btn-outline"
                  disabled={isSaving}
                >
                  <X className="h-4 w-4 mr-2" />
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  className="btn btn-primary"
                  disabled={isSaving}
                >
                  {isSaving ? (
                    <>
                      <span className="loading loading-spinner loading-sm mr-2"></span>
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Save Changes
                    </>
                  )}
                </button>
              </div>
            )}

            {/* Additional Info */}
            {!isEditing && (
              <div className="alert alert-info">
                <span className="text-sm">
                  You can edit your phone number, address, and home county using the Edit button above.
                  Other information is managed by your coach or administrator.
                </span>
              </div>
            )}
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
