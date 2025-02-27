'use client';

import Link from 'next/link';
import { useAuth } from '@/app/contexts/AuthContext';

export default function NavMenu() {
  const { user, loading, logout } = useAuth();

  if (loading) {
    return <div className="flex space-x-4 items-center">Loading...</div>;
  }

  if (user) {
    return (
      <div className="flex space-x-4 items-center">
        <Link href="/events" className="hover:text-primary-light transition">
          Events
        </Link>
        <Link href="/profile" className="hover:text-primary-light transition">
          Profile
        </Link>
        <div className="h-4 w-px bg-white/30 mx-2"></div>
        <button
          onClick={() => logout()}
          className="hover:text-primary-light transition"
        >
          Sign out
        </button>
        <span className="bg-white text-primary px-3 py-1 rounded-md">
          {user.name}
        </span>
      </div>
    );
  }

  return (
    <div className="flex space-x-4 items-center">
      <Link href="/events" className="hover:text-primary-light transition">
        Events
      </Link>
      <div className="h-4 w-px bg-white/30 mx-2"></div>
      <Link href="/auth/login" className="hover:text-primary-light transition">
        Sign in
      </Link>
      <Link
        href="/auth/signup"
        className="bg-white text-primary px-3 py-1 rounded-md hover:bg-gray-100 transition"
      >
        Sign up
      </Link>
    </div>
  );
} 