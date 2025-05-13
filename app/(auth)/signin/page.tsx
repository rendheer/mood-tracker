'use client';

import { signIn } from 'next-auth/react';
import { Button } from '@/components/ui/button';

export default function SignInPage() {
  const handleSignIn = async () => {
    // In a real app, you would implement proper authentication
    // For now, we'll just sign in with a test user
    await signIn('credentials', {
      email: 'test@example.com',
      password: 'password',
      callbackUrl: '/dashboard',
    });
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Sign in to your account
          </h2>
        </div>
        <div className="mt-8 space-y-6">
          <div>
            <Button
              onClick={handleSignIn}
              className="group relative flex w-full justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
            >
              Sign in with Test Account
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
