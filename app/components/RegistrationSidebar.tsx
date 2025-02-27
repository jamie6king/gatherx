'use client';

import { useState, useEffect } from 'react';

interface RegistrationSidebarProps {
  eventId: string;
}

interface User {
  id: string;
  name: string;
  email: string;
}

export default function RegistrationSidebar({ eventId }: RegistrationSidebarProps) {
  const [registering, setRegistering] = useState(false);
  const [registered, setRegistered] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Fetch the current user
  useEffect(() => {
    async function fetchUser() {
      try {
        const response = await fetch('/api/user');
        if (response.ok) {
          const userData = await response.json();
          setUser(userData);
        } else {
          console.error('Failed to fetch user');
        }
      } catch (error) {
        console.error('Error fetching user:', error);
      } finally {
        setLoading(false);
      }
    }
    
    fetchUser();
  }, []);

  const handleRegister = async () => {
    if (!user) return;
    
    try {
      setRegistering(true);
      const response = await fetch('/api/events/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user.id,
          eventId,
        }),
      });

      const data = await response.json();
      
      if (response.ok) {
        setRegistered(true);
      } else {
        console.error('Registration failed:', data.error);
      }
    } catch (error) {
      console.error('Error during registration:', error);
    } finally {
      setRegistering(false);
    }
  };

  const handleAutoSelectSessions = async () => {
    if (!user) return;
    
    try {
      setRegistering(true);
      // First register for the event
      await fetch('/api/events/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user.id,
          eventId,
        }),
      });

      // Then get AI recommendations (mock for now)
      // This would be a real AI endpoint in a production app
      setTimeout(() => {
        setRegistered(true);
        setRegistering(false);
      }, 1000);
    } catch (error) {
      console.error('Error during auto-selection:', error);
      setRegistering(false);
    }
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
          <>
            {registered ? (
              <div className="mb-6">
                <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
                  You have successfully registered for this event!
                </div>
                <button 
                  className="w-full bg-gray-100 text-gray-700 px-4 py-2 rounded-md font-medium mb-3 hover:bg-gray-200"
                  onClick={() => setRegistered(false)}
                >
                  Cancel Registration
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
                  disabled={registering}
                >
                  Register & Follow Friends
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded mb-4">
            Please sign in to register for this event.
          </div>
        )}
        
        <div className="mb-6">
          <h3 className="font-medium mb-2">Not ready to register?</h3>
          <button className="w-full bg-gray-100 text-gray-700 px-4 py-2 rounded-md font-medium mb-3 hover:bg-gray-200">
            Continue as Guest
          </button>
          <button className="w-full bg-gray-100 text-gray-700 px-4 py-2 rounded-md font-medium hover:bg-gray-200">
            Add to Calendar
          </button>
        </div>
        
        <div className="border-t border-gray-200 pt-4">
          <h3 className="font-medium mb-2">Social Sign-up</h3>
          <div className="space-y-3">
            <button className="w-full bg-blue-600 text-white px-4 py-2 rounded-md font-medium flex items-center justify-center">
              <span>Sign up with Facebook</span>
            </button>
            <button className="w-full bg-red-500 text-white px-4 py-2 rounded-md font-medium flex items-center justify-center">
              <span>Sign up with Google</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 