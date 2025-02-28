'use client';

import { useState, useEffect } from 'react';
import { Webinar } from '@/app/models/webinar';
import { format } from 'date-fns';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface WebinarListProps {
  webinars: Webinar[];
  eventId: string;
  isOwner?: boolean;
}

export const WebinarList = ({ webinars: initialWebinars, eventId, isOwner = false }: WebinarListProps) => {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [webinars, setWebinars] = useState<Webinar[]>(initialWebinars);

  // Fetch webinars on mount and when eventId changes
  useEffect(() => {
    const fetchWebinars = async () => {
      try {
        const response = await fetch(`/api/webinars?eventId=${eventId}`);
        if (!response.ok) {
          throw new Error('Failed to fetch webinars');
        }
        const data = await response.json();
        setWebinars(data);
      } catch (error) {
        console.error('Error fetching webinars:', error);
      }
    };

    fetchWebinars();
  }, [eventId]);

  const handleCreateClick = () => {
    if (!isOwner) {
      setError('You must be the event owner to create webinars');
      return;
    }
    router.push(`/events/${eventId}/webinar/create`);
  };

  if (webinars.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-600">No webinars scheduled for this event yet.</p>
        {isOwner && (
          <button
            onClick={handleCreateClick}
            className="mt-4 inline-block text-blue-600 hover:text-blue-800"
          >
            Create a Webinar
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-900">Webinars</h2>
        {isOwner && (
          <button
            onClick={handleCreateClick}
            className="text-blue-600 hover:text-blue-800"
          >
            Add Webinar
          </button>
        )}
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {webinars.map((webinar) => (
          <Link
            key={webinar.id}
            href={`/events/${eventId}/webinar/${webinar.id}`}
            className="block group"
          >
            <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-200 hover:border-blue-500 transition-colors">
              <h3 className="font-semibold text-gray-900 group-hover:text-blue-600">
                {webinar.title}
              </h3>
              
              <div className="mt-2 text-sm text-gray-600">
                <div className="flex items-center space-x-2">
                  <span>{format(new Date(webinar.date), 'MMM d, yyyy')}</span>
                  <span>•</span>
                  <span>{webinar.time}</span>
                </div>
                
                {webinar.hostName && (
                  <div className="mt-1">
                    Host: {webinar.hostName}
                  </div>
                )}
              </div>

              <p className="mt-2 text-sm text-gray-500 line-clamp-2">
                {webinar.description}
              </p>

              {webinar.speakers.length > 0 && (
                <div className="mt-2 text-sm text-gray-600">
                  <span className="font-medium">
                    {webinar.speakers.length} {webinar.speakers.length === 1 ? 'Speaker' : 'Speakers'}
                  </span>
                </div>
              )}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}; 