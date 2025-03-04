'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@/app/contexts/AuthContext';
import { Button } from '@/components/ui/button';

export function Navbar() {
  const { user, isLoading, logout } = useAuth();

  return (
    <nav className="bg-white text-foreground border-b shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <Link 
              href="/" 
              className="flex-shrink-0 flex items-center"
              tabIndex={0}
              aria-label="Go to homepage"
            >
              <Image
                src="/images/logos/gatherx.png"
                alt="GatherX"
                width={120}
                height={36}
                className="h-8 w-auto"
                priority
              />
            </Link>
            <div className="hidden sm:ml-6 sm:flex sm:space-x-4">
              <Link
                href="/events"
                className="inline-flex items-center px-3 py-2 text-sm font-medium text-foreground hover:text-primary transition-colors"
                tabIndex={0}
                aria-label="Browse events"
              >
                Events
              </Link>
            </div>
          </div>
          <div className="hidden sm:ml-6 sm:flex sm:items-center">
            {isLoading ? (
              <div className="flex items-center space-x-4">
                <div className="h-8 w-8 animate-pulse bg-muted rounded-full"></div>
                <div className="h-4 w-20 animate-pulse bg-muted rounded"></div>
              </div>
            ) : user ? (
              <div className="relative ml-3">
                <div className="flex items-center space-x-4">
                  <span className="text-sm font-medium text-foreground">
                    {user.name || user.email}
                  </span>
                  <Link
                    href="/profile"
                    className="text-sm font-medium text-foreground hover:text-primary transition-colors"
                    tabIndex={0}
                    aria-label="View your profile"
                  >
                    Profile
                  </Link>
                  <Button
                    onClick={() => logout()}
                    variant="outline-primary"
                    size="sm"
                    className="text-sm font-medium"
                    aria-label="Sign out of your account"
                  >
                    Sign out
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex items-center space-x-4">
                <Link
                  href="/auth/login"
                  className="text-sm font-medium text-foreground hover:text-primary transition-colors"
                  tabIndex={0}
                  aria-label="Sign in to your account"
                >
                  Sign in
                </Link>
                <Button 
                  asChild 
                  size="sm"
                  variant="gradient"
                  aria-label="Create a new account"
                >
                  <Link href="/auth/signup">
                    Sign up
                  </Link>
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
} 