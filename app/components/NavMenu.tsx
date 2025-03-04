'use client';

import Link from 'next/link';
import { useAuth } from '@/app/contexts/AuthContext';
import { Button } from '@/components/ui/button';

export default function NavMenu() {
  const { user, isLoading, logout } = useAuth();

  if (isLoading) {
    return <div className="flex space-x-4 items-center text-muted-foreground">Loading...</div>;
  }

  if (user) {
    return (
      <div className="flex space-x-4 items-center">
        <Link href="/events" className="text-foreground hover:text-primary transition">
          Events
        </Link>
        <Link href="/profile" className="text-foreground hover:text-primary transition">
          Profile
        </Link>
        <div className="h-4 w-px bg-muted mx-2"></div>
        <Button
          onClick={() => logout()}
          variant="outline-primary"
          size="sm"
        >
          Sign out
        </Button>
        <span className="bg-primary text-white px-3 py-1 rounded-md">
          {user.name}
        </span>
      </div>
    );
  }

  return (
    <div className="flex space-x-4 items-center">
      <Link href="/events" className="text-foreground hover:text-primary transition">
        Events
      </Link>
      <div className="h-4 w-px bg-muted mx-2"></div>
      <Link href="/auth/login" className="text-foreground hover:text-primary transition">
        Sign in
      </Link>
      <Button
        asChild
        variant="gradient"
        size="sm"
      >
        <Link href="/auth/signup">
          Sign up
        </Link>
      </Button>
    </div>
  );
} 