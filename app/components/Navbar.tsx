'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@/app/contexts/AuthContext';

export function Navbar() {
  const { user, loading, logout } = useAuth();

  return (
    <nav className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <Link href="/" className="flex-shrink-0 flex items-center">
              <Image
                src="/images/logo.svg"
                alt="GatherX"
                width={32}
                height={32}
                className="h-8 w-auto"
              />
              <span className="ml-2 text-xl font-bold text-gray-900">GatherX</span>
            </Link>
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              <Link
                href="/events"
                className="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-900"
              >
                Events
              </Link>
            </div>
          </div>
          <div className="hidden sm:ml-6 sm:flex sm:items-center">
            {loading ? (
              <div className="flex items-center space-x-4">
                <div className="h-8 w-8 animate-pulse bg-gray-200 rounded-full"></div>
                <div className="h-4 w-20 animate-pulse bg-gray-200 rounded"></div>
              </div>
            ) : user ? (
              <div className="relative ml-3">
                <div className="flex items-center space-x-4">
                  <span className="text-sm font-medium text-gray-700">
                    {user.name || user.email}
                  </span>
                  <Link
                    href="/profile"
                    className="text-sm font-medium text-gray-700 hover:text-gray-800"
                  >
                    Profile
                  </Link>
                  <button
                    onClick={() => logout()}
                    className="text-sm font-medium text-gray-700 hover:text-gray-800"
                  >
                    Sign out
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-center space-x-4">
                <Link
                  href="/auth/login"
                  className="text-sm font-medium text-gray-700 hover:text-gray-800"
                >
                  Sign in
                </Link>
                <Link
                  href="/auth/signup"
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                >
                  Sign up
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
} 