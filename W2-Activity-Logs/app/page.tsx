'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';
import { Briefcase, Users, BarChart3, Mail, Phone, LogIn } from 'lucide-react';

type UserType = 'new' | 'existing';
type ContactMethod = 'email' | 'sms';

export default function Home() {
  const router = useRouter();
  const [userType, setUserType] = useState<UserType>('new');
  const [contactMethod, setContactMethod] = useState<ContactMethod>('email');
  const [email, setEmail] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [message, setMessage] = useState('');

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setMessage('');

    try {
      // For new users, store name in localStorage
      if (userType === 'new') {
        localStorage.setItem('pendingUserName', `${firstName.trim()} ${lastName.trim()}`);
        localStorage.setItem('pendingUserEmail', email);
      }

      const result = await signIn('email', {
        email: email,
        redirect: false,
        callbackUrl: '/dashboard',
      });

      if (result?.error) {
        setError(result.error);
      } else {
        setMessage('Check your email for the magic link!');
        router.push('/verify-request?email=' + encodeURIComponent(email));
      }
    } catch (err) {
      console.error('Email login error:', err);
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendOTP = async () => {
    setIsLoading(true);
    setError('');
    setMessage('');

    try {
      const response = await fetch('/api/auth/sms/send-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ phoneNumber }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Failed to send code');
        setIsLoading(false);
        return;
      }

      setMessage('Verification code sent to your phone!');
      setOtpSent(true);
    } catch (err) {
      console.error('SMS send error:', err);
      setError('Failed to send verification code');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSMSLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      // For new users, store name in localStorage
      if (userType === 'new') {
        localStorage.setItem('pendingUserName', `${firstName.trim()} ${lastName.trim()}`);
        localStorage.setItem('pendingUserPhone', phoneNumber);
      }

      const result = await signIn('sms-otp', {
        phoneNumber: phoneNumber,
        code: otp,
        redirect: false,
        callbackUrl: '/dashboard',
      });

      if (result?.error) {
        setError(result.error);
        setIsLoading(false);
      } else if (result?.ok) {
        router.push('/dashboard');
        router.refresh();
      }
    } catch (err) {
      console.error('SMS login error:', err);
      setError('An unexpected error occurred. Please try again.');
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-blue-900">
      <div className="navbar bg-primary text-primary-content">
        <div className="flex-1">
          <a className="btn btn-ghost text-xl">W-2 Activity Logs</a>
        </div>
      </div>

      <div className="container mx-auto p-8">
        {/* Bento Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Hero Section - Spans 2 columns */}
          <div className="lg:col-span-2 bg-base-100 rounded-2xl shadow-2xl p-8">
            <h1 className="text-5xl font-bold mb-4">Welcome to W-2 Program</h1>
            <p className="text-lg opacity-80 mb-6">
              Track employment activities, manage client progress, and monitor outcomes for the W-2 program.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
              <div className="flex flex-col items-center text-center p-4 bg-base-200 rounded-lg">
                <Briefcase className="h-10 w-10 text-primary mb-2" />
                <h3 className="font-bold">Job Search</h3>
                <p className="text-sm opacity-70">Track applications and training</p>
              </div>

              <div className="flex flex-col items-center text-center p-4 bg-base-200 rounded-lg">
                <Users className="h-10 w-10 text-primary mb-2" />
                <h3 className="font-bold">Client Management</h3>
                <p className="text-sm opacity-70">Monitor progress and outcomes</p>
              </div>

              <div className="flex flex-col items-center text-center p-4 bg-base-200 rounded-lg">
                <BarChart3 className="h-10 w-10 text-primary mb-2" />
                <h3 className="font-bold">Analytics</h3>
                <p className="text-sm opacity-70">Comprehensive reports</p>
              </div>
            </div>
          </div>

          {/* Login Section - Prominent Bento Region */}
          <div className="bg-base-100 rounded-2xl shadow-2xl p-6">
            <div className="text-center mb-6">
              <div className={`mx-auto h-14 w-14 rounded-full flex items-center justify-center mb-4 ${
                contactMethod === 'email' ? 'bg-blue-600' : 'bg-green-600'
              } shadow-lg`}>
                {contactMethod === 'email' ? (
                  <Mail className="h-7 w-7 text-white" />
                ) : (
                  <Phone className="h-7 w-7 text-white" />
                )}
              </div>
              <h2 className="text-2xl font-bold">Get Started</h2>
              <p className="text-sm opacity-70">Sign in to access your account</p>
            </div>

            {/* New/Existing User Toggle */}
            <div className="flex gap-2 mb-4">
              <button
                type="button"
                onClick={() => setUserType('new')}
                className={`flex-1 btn btn-sm ${userType === 'new' ? 'btn-primary' : 'btn-outline'}`}
              >
                New User
              </button>
              <button
                type="button"
                onClick={() => setUserType('existing')}
                className={`flex-1 btn btn-sm ${userType === 'existing' ? 'btn-primary' : 'btn-outline'}`}
              >
                Existing User
              </button>
            </div>

            {/* Email/SMS Toggle */}
            <div className="flex gap-2 mb-6">
              <button
                type="button"
                onClick={() => {
                  setContactMethod('email');
                  setOtpSent(false);
                  setError('');
                  setMessage('');
                }}
                className={`flex-1 btn btn-sm ${contactMethod === 'email' ? 'btn-secondary' : 'btn-outline'}`}
              >
                <Mail className="h-4 w-4 mr-1" />
                Email
              </button>
              <button
                type="button"
                onClick={() => {
                  setContactMethod('sms');
                  setOtpSent(false);
                  setError('');
                  setMessage('');
                }}
                className={`flex-1 btn btn-sm ${contactMethod === 'sms' ? 'btn-success' : 'btn-outline'}`}
              >
                <Phone className="h-4 w-4 mr-1" />
                SMS
              </button>
            </div>

            {/* Error/Success Messages */}
            {error && (
              <div className="alert alert-error mb-4 py-2 text-sm">
                <span>{error}</span>
              </div>
            )}

            {message && (
              <div className="alert alert-success mb-4 py-2 text-sm">
                <span>{message}</span>
              </div>
            )}

            {/* Email Login Form */}
            {contactMethod === 'email' && (
              <form className="space-y-4" onSubmit={handleEmailLogin}>
                {/* Name fields only for new users */}
                {userType === 'new' && (
                  <div className="grid grid-cols-2 gap-2">
                    <div className="form-control">
                      <input
                        type="text"
                        required
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        className="input input-bordered input-sm w-full"
                        placeholder="First name"
                        disabled={isLoading}
                      />
                    </div>
                    <div className="form-control">
                      <input
                        type="text"
                        required
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        className="input input-bordered input-sm w-full"
                        placeholder="Last name"
                        disabled={isLoading}
                      />
                    </div>
                  </div>
                )}

                <div className="form-control">
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="input input-bordered input-sm w-full"
                    placeholder="Enter your email"
                    disabled={isLoading}
                  />
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="btn btn-primary btn-sm w-full"
                >
                  {isLoading ? (
                    <span className="loading loading-spinner loading-sm"></span>
                  ) : (
                    <>
                      <Mail className="h-4 w-4" />
                      Send Magic Link
                    </>
                  )}
                </button>
              </form>
            )}

            {/* SMS Login Form */}
            {contactMethod === 'sms' && (
              <form className="space-y-4" onSubmit={handleSMSLogin}>
                {/* Name fields only for new users */}
                {userType === 'new' && !otpSent && (
                  <div className="grid grid-cols-2 gap-2">
                    <div className="form-control">
                      <input
                        type="text"
                        required
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        className="input input-bordered input-sm w-full"
                        placeholder="First name"
                        disabled={isLoading || otpSent}
                      />
                    </div>
                    <div className="form-control">
                      <input
                        type="text"
                        required
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        className="input input-bordered input-sm w-full"
                        placeholder="Last name"
                        disabled={isLoading || otpSent}
                      />
                    </div>
                  </div>
                )}

                <div className="form-control">
                  <input
                    type="tel"
                    required
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    className="input input-bordered input-sm w-full"
                    placeholder="+1234567890"
                    disabled={isLoading || otpSent}
                  />
                </div>

                {!otpSent ? (
                  <button
                    type="button"
                    onClick={handleSendOTP}
                    disabled={isLoading}
                    className="btn btn-success btn-sm w-full"
                  >
                    {isLoading ? (
                      <span className="loading loading-spinner loading-sm"></span>
                    ) : (
                      <>
                        <Phone className="h-4 w-4" />
                        Send Code
                      </>
                    )}
                  </button>
                ) : (
                  <>
                    <div className="form-control">
                      <input
                        type="text"
                        required
                        value={otp}
                        onChange={(e) => setOtp(e.target.value)}
                        className="input input-bordered input-sm w-full"
                        placeholder="Enter 6-digit code"
                        maxLength={6}
                        disabled={isLoading}
                      />
                    </div>

                    <div className="flex gap-2">
                      <button
                        type="submit"
                        disabled={isLoading || otp.length !== 6}
                        className="btn btn-success btn-sm flex-1"
                      >
                        {isLoading ? (
                          <span className="loading loading-spinner loading-sm"></span>
                        ) : (
                          <>
                            <LogIn className="h-4 w-4" />
                            Verify
                          </>
                        )}
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setOtpSent(false);
                          setOtp('');
                          setMessage('');
                        }}
                        className="btn btn-outline btn-sm"
                        disabled={isLoading}
                      >
                        Change
                      </button>
                    </div>
                  </>
                )}
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
