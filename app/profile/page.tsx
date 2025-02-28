'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { useAuth } from '@/app/contexts/AuthContext';
import { fetchWithAuth } from '@/app/lib/api';

interface UserProfile {
  id: string;
  name: string | null;
  email: string | null;
  bio: string | null;
  jobTitle: string | null;
  industry: string | null;
  avatarUrl: string | null;
  bannerUrl: string | null;
  useGravatar: boolean;
  tagString: string | null;
  notifications: string | null;
  userType: 'GUEST' | 'EVENT_MANAGER';
}

interface Event {
  id: string;
  name: string;
  description: string;
  date: string;
  location: string;
  bannerUrl: string | null;
  logoUrl: string | null;
  hostId: string;
  createdAt: string;
  updatedAt: string;
}

interface UserActivity {
  hostedEvents: Event[];
  registeredEvents: Event[];
}

export default function Profile() {
  const router = useRouter();
  const { user, isLoading, token } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [activity, setActivity] = useState<UserActivity | null>(null);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [loadingActivity, setLoadingActivity] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      // Only proceed if we're not in the loading state and have a token
      if (!isLoading) {
        if (!user || !token) {
          router.push('/auth/login?redirect=/profile');
          return;
        }

        try {
          setLoadingProfile(true);
          setLoadingActivity(true);
          setError(null);

          // Ensure the token cookie is set before making requests
          document.cookie = `token=${token}; path=/; max-age=604800; SameSite=Lax; Secure`;

          // Add a small delay to ensure the cookie is set
          await new Promise(resolve => setTimeout(resolve, 100));

          // Fetch profile and activity data in parallel using fetchWithAuth
          const [profileResponse, activityResponse] = await Promise.all([
            fetchWithAuth('/api/auth/me'),
            fetchWithAuth('/api/user/activity')
          ]);

          if (!profileResponse.ok || !activityResponse.ok) {
            throw new Error('Failed to fetch user data');
          }

          const [profileData, activityData] = await Promise.all([
            profileResponse.json(),
            activityResponse.json()
          ]);

          setProfile(profileData.user);
          setActivity(activityData);
        } catch (error) {
          console.error('Error fetching user data:', error);
          setError('Failed to load profile data. Please try again.');
        } finally {
          setLoadingProfile(false);
          setLoadingActivity(false);
        }
      }
    }

    fetchData();
  }, [user, isLoading, router, token]);

  // Show loading state while checking authentication or fetching data
  if (isLoading || loadingProfile || loadingActivity) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-red-600">{error}</div>
      </div>
    );
  }

  // If not authenticated, return null (useEffect will handle redirect)
  if (!user || !profile) {
    return null;
  }

  const tags = profile.tagString ? profile.tagString.split(',').map(tag => tag.trim()) : [];

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Banner */}
      <div className="relative h-64 bg-gray-300">
        {profile.bannerUrl && (
          <Image
            src={profile.bannerUrl}
            alt="Profile banner"
            fill
            className="object-cover"
          />
        )}
      </div>

      {/* Profile Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative -mt-24 sm:-mt-32 pb-8">
          <div className="relative z-10 bg-white rounded-lg shadow-lg p-6">
            <div className="sm:flex sm:items-center sm:justify-between">
              <div className="sm:flex sm:items-center">
                {/* Avatar */}
                <div className="relative h-24 w-24 rounded-full overflow-hidden border-4 border-white">
                  <Image
                    src={profile.avatarUrl || '/images/defaults/avatar.svg'}
                    alt={profile.name || 'User'}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="mt-4 sm:mt-0 sm:ml-6">
                  <h1 className="text-3xl font-bold text-gray-900">{profile.name}</h1>
                  {profile.jobTitle && (
                    <p className="text-lg text-gray-600">{profile.jobTitle}</p>
                  )}
                  {profile.industry && (
                    <p className="text-sm text-gray-500 mt-1">{profile.industry}</p>
                  )}
                </div>
              </div>
              <div className="mt-6 sm:mt-0">
                <Link
                  href="/settings"
                  className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                >
                  Edit Profile
                </Link>
              </div>
            </div>

            {/* Bio */}
            {profile.bio && (
              <div className="mt-8">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">About</h2>
                <p className="text-gray-700 whitespace-pre-wrap">{profile.bio}</p>
              </div>
            )}

            {/* Tags */}
            {tags.length > 0 && (
              <div className="mt-8">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Interests</h2>
                <div className="flex flex-wrap gap-2">
                  {tags.map(tag => (
                    <span
                      key={tag}
                      className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-primary-50 text-primary"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Activity Section */}
        <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Hosted Events Section */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Hosted Events</h2>
            {activity?.hostedEvents && activity.hostedEvents.length > 0 ? (
              <div className="space-y-4">
                {activity.hostedEvents.map(event => (
                  <Link
                    key={event.id}
                    href={`/events/${event.id}`}
                    className="block hover:bg-gray-50 transition rounded-lg"
                  >
                    <div className="flex items-center space-x-4 p-4">
                      <div className="relative h-16 w-16 rounded-lg overflow-hidden flex-shrink-0">
                        <Image
                          src={event.bannerUrl || '/images/defaults/event-banner.svg'}
                          alt={event.name}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {event.name}
                        </p>
                        <p className="text-sm text-gray-500">
                          {new Date(event.date).toLocaleDateString()}
                        </p>
                        <p className="text-sm text-gray-500 truncate">
                          {event.location}
                        </p>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <p className="text-gray-500">No hosted events</p>
            )}
          </div>

          {/* Registered Events Section */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Registered Events</h2>
            {activity?.registeredEvents && activity.registeredEvents.length > 0 ? (
              <div className="space-y-4">
                {activity.registeredEvents.map(event => (
                  <Link
                    key={event.id}
                    href={`/events/${event.id}`}
                    className="block hover:bg-gray-50 transition rounded-lg"
                  >
                    <div className="flex items-center space-x-4 p-4">
                      <div className="relative h-16 w-16 rounded-lg overflow-hidden flex-shrink-0">
                        <Image
                          src={event.bannerUrl || '/images/defaults/event-banner.svg'}
                          alt={event.name}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {event.name}
                        </p>
                        <p className="text-sm text-gray-500">
                          {new Date(event.date).toLocaleDateString()}
                        </p>
                        <p className="text-sm text-gray-500 truncate">
                          {event.location}
                        </p>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <p className="text-gray-500">No registered events</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 