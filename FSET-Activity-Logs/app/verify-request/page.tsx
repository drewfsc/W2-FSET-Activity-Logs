'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { Mail, ArrowLeft } from 'lucide-react';
import { Suspense } from 'react';

function VerifyRequestContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get('email');

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-blue-900 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="bg-base-100 rounded-2xl shadoFSETxl p-8">
          <div className="text-center">
            <div className="mx-auto h-16 w-16 rounded-full flex items-center justify-center mb-6 bg-blue-600 shadow-lg">
              <Mail className="h-8 w-8 text-white" />
            </div>

            <h2 className="text-3xl font-bold mb-2">
              Check your email
            </h2>

            {email && (
              <p className="text-base-content opacity-90 mb-4">
                A sign-in link has been sent to<br />
                <span className="font-semibold">{email}</span>
              </p>
            )}

            <div className="my-6 p-4 bg-base-200 rounded-lg">
              <p className="text-sm opacity-70">
                Click the link in the email to sign in to your account. The link will expire in 24 hours.
              </p>
            </div>

            <div className="space-y-3">
              <button
                onClick={() => router.push('/login')}
                className="btn btn-primary w-full"
              >
                <ArrowLeft className="h-5 w-5 mr-2" />
                Back to Login
              </button>

              <p className="text-sm opacity-60">
                Didn't receive the email? Check your spam folder or try logging in again.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function VerifyRequestPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-blue-900 flex items-center justify-center">
        <div className="loading loading-spinner loading-lg"></div>
      </div>
    }>
      <VerifyRequestContent />
    </Suspense>
  );
}
