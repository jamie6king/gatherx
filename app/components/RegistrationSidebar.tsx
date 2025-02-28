'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/app/contexts/AuthContext';
import { fetchWithAuth } from '@/app/lib/api';

interface User {
  id: string;
  name: string | null;
  email: string;
}

interface RegistrationSidebarProps {
  eventId: string;
}

export default function RegistrationSidebar({ eventId }: RegistrationSidebarProps) {
  const router = useRouter();
  const [registering, setRegistering] = useState(false);
  const [registered, setRegistered] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Fetch the current user and registration status
  useEffect(() => {
    async function fetchUserAndRegistration() {
      try {
        // Fetch user data
        const userResponse = await fetchWithAuth('/api/auth/me');
        if (userResponse.ok) {
          const { user: userData } = await userResponse.json();
          setUser(userData);
          
          // If we have a user, check their registration status
          if (userData) {
            const registrationResponse = await fetchWithAuth(`/api/events/${eventId}/registration?userId=${userData.id}`);
            if (registrationResponse.ok) {
              const { isRegistered } = await registrationResponse.json();
              setRegistered(isRegistered);
            }
          }
        }
      } catch (error) {
        console.error('Error fetching user or registration:', error);
      } finally {
        setLoading(false);
      }
    }
    
    fetchUserAndRegistration();
  }, [eventId]);

  const handleRegister = async () => {
    if (!user) {
      router.push('/auth/login');
      return;
    }
    
    try {
      setRegistering(true);
      const response = await fetchWithAuth('/api/events/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user.id,
          eventId,
        }),
      });

      if (response.ok) {
        setRegistered(true);
      }
    } catch (error) {
      console.error('Error registering for event:', error);
    } finally {
      setRegistering(false);
    }
  };

  const handleCancelRegistration = async () => {
    if (!user) return;
    
    try {
      setRegistering(true);
      const response = await fetchWithAuth('/api/events/register', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user.id,
          eventId,
        }),
      });

      if (response.ok) {
        setRegistered(false);
      } else {
        const data = await response.json();
        console.error('Cancellation failed:', data.error);
      }
    } catch (error) {
      console.error('Error during cancellation:', error);
    } finally {
      setRegistering(false);
    }
  };

  const handleAutoSelectSessions = async () => {
    if (!user) {
      router.push('/auth/login');
      return;
    }
    
    try {
      setRegistering(true);
      // First register for the event
      await fetchWithAuth('/api/events/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user.id,
          eventId,
        }),
      });

      // Then get AI recommendations and register for sessions
      const response = await fetchWithAuth('/api/sessions/auto-select', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user.id,
          eventId,
        }),
      });

      if (response.ok) {
        setRegistered(true);
      }
    } catch (error) {
      console.error('Error during auto-selection:', error);
    } finally {
      setRegistering(false);
    }
  };

  const handleFollowFriends = async () => {
    if (!user) {
      router.push('/auth/login');
      return;
    }
    
    try {
      setRegistering(true);
      // First register for the event
      await fetchWithAuth('/api/events/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user.id,
          eventId,
        }),
      });

      // Then register for sessions that friends are attending
      const response = await fetchWithAuth('/api/sessions/follow-friends', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user.id,
          eventId,
        }),
      });

      if (response.ok) {
        setRegistered(true);
      }
    } catch (error) {
      console.error('Error following friends:', error);
    } finally {
      setRegistering(false);
    }
  };

  const handleContinueAsGuest = () => {
    router.push(`/events/${eventId}/sessions`);
  };

  const handleAddToCalendar = async () => {
    try {
      const response = await fetchWithAuth(`/api/events/${eventId}/calendar`);
      const data = await response.json();
      
      // Create calendar event URL
      const { name, description, date, location } = data;
      const startTime = new Date(date).toISOString();
      const endTime = new Date(new Date(date).setHours(23, 59)).toISOString();
      
      const calendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(name)}&details=${encodeURIComponent(description)}&location=${encodeURIComponent(location)}&dates=${startTime.replace(/[-:]/g, '')}/${endTime.replace(/[-:]/g, '')}`;
      
      window.open(calendarUrl, '_blank');
    } catch (error) {
      console.error('Error adding to calendar:', error);
    }
  };

  const handleSocialSignup = (provider: 'facebook' | 'google') => {
    const authUrl = `/api/auth/${provider}`;
    window.location.href = authUrl;
  };

  if (loading) {
    return (
      <div className="lg:col-span-1">
        <div className="bg-white rounded-lg shadow-md p-6 sticky top-8">
          <h2 className="text-xl font-semibold mb-4">Registration Options</h2>
          <div className="animate-pulse flex flex-col space-y-4">
            <div className="h-10 bg-gray-200 rounded"></div>
            <div className="h-10 bg-gray-200 rounded"></div>
            <div className="h-10 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="lg:col-span-1">
      <div className="bg-white rounded-lg shadow-md p-6 sticky top-8">
        <h2 className="text-xl font-semibold mb-4">Registration Options</h2>
        
        {user ? (
          // Authenticated User View
          <>
            {registered ? (
              <div className="mb-6">
                <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
                  You have successfully registered for this event!
                </div>
                <button 
                  className="w-full bg-gray-100 text-gray-700 px-4 py-2 rounded-md font-medium mb-3 hover:bg-gray-200"
                  onClick={handleCancelRegistration}
                  disabled={registering}
                >
                  {registering ? 'Cancelling...' : 'Cancel Registration'}
                </button>
              </div>
            ) : (
              <div className="mb-6">
                <button 
                  className="w-full bg-primary text-white px-4 py-3 rounded-md font-medium mb-3 hover:bg-blue-600 disabled:opacity-50"
                  onClick={handleRegister}
                  disabled={registering}
                >
                  {registering ? 'Registering...' : 'Register Now'}
                </button>
                <button 
                  className="w-full bg-white text-primary border border-primary px-4 py-3 rounded-md font-medium mb-3 hover:bg-blue-50 disabled:opacity-50"
                  onClick={handleAutoSelectSessions}
                  disabled={registering}
                >
                  Register & Auto-Select Sessions
                </button>
                <button 
                  className="w-full bg-white text-primary border border-primary px-4 py-3 rounded-md font-medium hover:bg-blue-50 disabled:opacity-50"
                  onClick={handleFollowFriends}
                  disabled={registering}
                >
                  Register & Follow Friends
                </button>
              </div>
            )}
            
            <div className="mb-6">
              <h3 className="font-medium mb-2">Additional Options</h3>
              <button 
                className="w-full bg-gray-100 text-gray-700 px-4 py-2 rounded-md font-medium mb-3 hover:bg-gray-200"
                onClick={handleAddToCalendar}
              >
                Add to Calendar
              </button>
            </div>
          </>
        ) : (
          // Unauthenticated User View
          <>
            <div className="mb-6">
              <div className="bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded mb-4">
                Sign in to unlock all registration options and features
              </div>
              <button 
                className="w-full bg-primary text-white px-4 py-3 rounded-md font-medium mb-3 hover:bg-blue-600"
                onClick={() => router.push(`/auth/login?redirect=/events/${eventId}`)}
              >
                Sign in to Register
              </button>
            </div>

            <div className="mb-6">
              <h3 className="font-medium mb-2">New to the platform?</h3>
              <div className="space-y-3">
                <button 
                  className="w-full bg-[#1877F2] text-white px-4 py-2 rounded-md font-medium flex items-center justify-center hover:bg-[#1664D9]"
                  onClick={() => handleSocialSignup('facebook')}
                >
                  Sign up with Facebook
                </button>
                <button 
                  className="w-full bg-[#DB4437] text-white px-4 py-2 rounded-md font-medium flex items-center justify-center hover:bg-[#C53929]"
                  onClick={() => handleSocialSignup('google')}
                >
                  Sign up with Google
                </button>
              </div>
            </div>

            <div className="mb-6">
              <h3 className="font-medium mb-2">Not ready to register?</h3>
              <button 
                className="w-full bg-gray-100 text-gray-700 px-4 py-2 rounded-md font-medium mb-3 hover:bg-gray-200"
                onClick={handleContinueAsGuest}
              >
                Continue as Guest
              </button>
              <button 
                className="w-full bg-gray-100 text-gray-700 px-4 py-2 rounded-md font-medium hover:bg-gray-200"
                onClick={handleAddToCalendar}
              >
                Add to Calendar
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
} 