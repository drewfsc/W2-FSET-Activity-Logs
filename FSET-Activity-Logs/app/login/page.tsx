'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';
import { ArrowLeft, Mail, Phone, LogIn } from 'lucide-react';

type AuthMethod = 'email' | 'sms';

export default function LoginPage() {
  const router = useRouter();
  const [authMethod, setAuthMethod] = useState<AuthMethod>('email');
  const [email, setEmail] = useState('');
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
      const result = await signIn('email', {
        email: email,
        redirect: false,
        callbackUrl: '/dashboard',
      });

      if (result?.error) {
        setError(result.error);
      } else {
        setMessage('Check your email for the magic link!');
        // Optionally redirect to verify-request page
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
              authMethod === 'email' ? 'bg-blue-600' : 'bg-green-600'
            } shadow-lg`}>
              {authMethod === 'email' ? (
                <Mail className="h-8 w-8 text-white" />
              ) : (
                <Phone className="h-8 w-8 text-white" />
              )}
            </div>

            <h2 className="text-3xl font-bold mb-2">
              FSET Program Login
            </h2>
            <p className="text-base-content opacity-70">
              Sign in with magic link or SMS code
            </p>
          </div>

          {/* Auth Method Selection */}
          <div className="mt-6 flex gap-4">
            <button
              type="button"
              onClick={() => {
                setAuthMethod('email');
                setOtpSent(false);
                setError('');
                setMessage('');
              }}
              className={`flex-1 btn ${authMethod === 'email' ? 'btn-primary' : 'btn-outline'}`}
            >
              <Mail className="h-5 w-5 mr-2" />
              Email
            </button>
            <button
              type="button"
              onClick={() => {
                setAuthMethod('sms');
                setOtpSent(false);
                setError('');
                setMessage('');
              }}
              className={`flex-1 btn ${authMethod === 'sms' ? 'btn-success' : 'btn-outline'}`}
            >
              <Phone className="h-5 w-5 mr-2" />
              SMS
            </button>
          </div>

          {/* Email Magic Link Form */}
          {authMethod === 'email' && (
            <form className="mt-8 space-y-6" onSubmit={handleEmailLogin}>
              {error && (
                <div className="alert alert-error">
                  <span>{error}</span>
                </div>
              )}

              {message && (
                <div className="alert alert-success">
                  <span>{message}</span>
                </div>
              )}

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
                  disabled={isLoading}
                />
                <label className="label">
                  <span className="label-text-alt">We'll send you a magic link</span>
                </label>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="btn w-full btn-primary"
              >
                {isLoading ? (
                  <span className="loading loading-spinner"></span>
                ) : (
                  <>
                    <Mail className="h-5 w-5" />
                    Send Magic Link
                  </>
                )}
              </button>
            </form>
          )}

          {/* SMS OTP Form */}
          {authMethod === 'sms' && (
            <form className="mt-8 space-y-6" onSubmit={handleSMSLogin}>
              {error && (
                <div className="alert alert-error">
                  <span>{error}</span>
                </div>
              )}

              {message && (
                <div className="alert alert-success">
                  <span>{message}</span>
                </div>
              )}

              <div className="form-control">
                <label htmlFor="phoneNumber" className="label">
                  <span className="label-text">Phone Number</span>
                </label>
                <input
                  id="phoneNumber"
                  name="phoneNumber"
                  type="tel"
                  required
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  className="input input-bordered w-full"
                  placeholder="+1234567890"
                  disabled={isLoading || otpSent}
                />
                <label className="label">
                  <span className="label-text-alt">Use E.164 format (e.g., +12345678900)</span>
                </label>
              </div>

              {!otpSent ? (
                <button
                  type="button"
                  onClick={handleSendOTP}
                  disabled={isLoading}
                  className="btn w-full btn-success"
                >
                  {isLoading ? (
                    <span className="loading loading-spinner"></span>
                  ) : (
                    <>
                      <Phone className="h-5 w-5" />
                      Send Verification Code
                    </>
                  )}
                </button>
              ) : (
                <>
                  <div className="form-control">
                    <label htmlFor="otp" className="label">
                      <span className="label-text">Verification Code</span>
                    </label>
                    <input
                      id="otp"
                      name="otp"
                      type="text"
                      required
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                      className="input input-bordered w-full"
                      placeholder="Enter 6-digit code"
                      maxLength={6}
                      disabled={isLoading}
                    />
                  </div>

                  <div className="flex gap-4">
                    <button
                      type="submit"
                      disabled={isLoading || otp.length !== 6}
                      className="btn flex-1 btn-success"
                    >
                      {isLoading ? (
                        <span className="loading loading-spinner"></span>
                      ) : (
                        <>
                          <LogIn className="h-5 w-5" />
                          Verify & Sign In
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
                      className="btn btn-outline"
                      disabled={isLoading}
                    >
                      Change Number
                    </button>
                  </div>
                </>
              )}
            </form>
          )}

          <div className="mt-6 text-center">
            <p className="text-sm opacity-70">
              First time here? Just enter your {authMethod === 'email' ? 'email' : 'phone number'} to get started!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
