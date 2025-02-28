'use client';

import { useState } from 'react';
import { Webinar } from '@/app/models/webinar';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';

interface WebinarViewerProps {
  webinar: Webinar;
  onEdit?: () => void;
  onDelete?: () => void;
  isOwner?: boolean;
}

export const WebinarViewer = ({ webinar, onEdit, onDelete, isOwner = false }: WebinarViewerProps) => {
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const formattedDate = format(new Date(webinar.date), 'MMMM d, yyyy');

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this webinar?')) {
      return;
    }

    try {
      setIsDeleting(true);
      setError(null);
      await onDelete?.();
    } catch (error) {
      console.error('Error deleting webinar:', error);
      if (error instanceof Response && error.status === 401) {
        setError('Please sign in to delete this webinar');
        router.push('/auth/signin');
      } else {
        setError('Failed to delete webinar. Please try again.');
      }
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <div className="space-y-4">
        <div className="flex justify-between items-start">
          <h1 className="text-2xl font-bold text-gray-900">{webinar.title}</h1>
          {isOwner && (
            <div className="flex space-x-2">
              <Button
                onClick={onEdit}
                variant="outline"
                size="sm"
                aria-label="Edit webinar"
              >
                Edit
              </Button>
              <Button
                onClick={handleDelete}
                variant="destructive"
                size="sm"
                disabled={isDeleting}
                aria-label="Delete webinar"
              >
                {isDeleting ? 'Deleting...' : 'Delete'}
              </Button>
            </div>
          )}
        </div>

        <div className="flex items-center text-gray-600 space-x-4">
          <div>
            <span className="font-medium">Date:</span> {formattedDate}
          </div>
          <div>
            <span className="font-medium">Time:</span> {webinar.time}
          </div>
        </div>

        <div>
          <h2 className="text-lg font-semibold text-gray-900">Host</h2>
          <p className="text-gray-600">{webinar.hostName}</p>
        </div>

        {webinar.speakers.length > 0 && (
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Speakers</h2>
            <ul className="mt-2 space-y-2">
              {webinar.speakers.map((speaker) => (
                <li key={speaker.id} className="text-gray-600">
                  <span className="font-medium">{speaker.name}</span>
                  {speaker.role && (
                    <span className="text-gray-500"> - {speaker.role}</span>
                  )}
                </li>
              ))}
            </ul>
          </div>
        )}

        <div>
          <h2 className="text-lg font-semibold text-gray-900">Description</h2>
          <p className="text-gray-600 whitespace-pre-wrap">{webinar.description}</p>
        </div>

        {webinar.registrationLink && (
          <div className="mt-6">
            <Button
              onClick={() => window.open('http://localhost:3001', '_blank', 'noopener,noreferrer')}
              className="w-full"
              aria-label="Register for webinar"
            >
              Join Now
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}; 