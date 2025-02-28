'use client';

import { WebinarViewer } from '@/app/components/webinar/WebinarViewer';
import { Webinar } from '@/app/models/webinar';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { fetchWithAuth } from '@/app/lib/api';

interface WebinarPageProps {
  params: {
    id: string;
    webinarId: string;
  };
}

export default function WebinarPage({ params }: WebinarPageProps) {
  const router = useRouter();
  const [webinar, setWebinar] = useState<Webinar | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isOwner, setIsOwner] = useState(false);

  useEffect(() => {
    const fetchWebinar = async () => {
      try {
        // Fetch webinar data and get current user
        const [webinarResponse, userResponse] = await Promise.all([
          fetch(`/api/webinars/${params.webinarId}`),
          fetchWithAuth('/api/auth/me')
        ]);

        if (!webinarResponse.ok) {
          throw new Error('Failed to fetch webinar data');
        }

        const webinarData = await webinarResponse.json();
        
        if (!userResponse.ok) {
          console.error('Failed to fetch user data:', await userResponse.text());
          setIsOwner(false);
          setWebinar(webinarData);
          return;
        }

        const userData = await userResponse.json();
        console.log('Webinar Data:', webinarData);
        console.log('User Data:', userData);
        console.log('User ID:', userData?.user?.id);
        console.log('Webinar Host ID:', webinarData.hostId);
        console.log('Is Owner Check:', userData?.user?.id === webinarData.hostId);

        setWebinar(webinarData);
        // Check if the current user is the webinar host
        setIsOwner(userData?.user?.id === webinarData.hostId);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchWebinar();
  }, [params.webinarId]);

  const handleEdit = () => {
    router.push(`/events/${params.id}/webinar/${params.webinarId}/edit`);
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this webinar?')) {
      return;
    }

    try {
      const response = await fetchWithAuth(`/api/webinars/${params.webinarId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete webinar');
      }

      router.push(`/events/${params.id}`);
    } catch (error) {
      console.error('Error deleting webinar:', error);
      // Handle error (show toast notification, etc.)
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (!webinar) {
    return (
      <div className="text-center py-8">
        <h1 className="text-2xl font-bold text-gray-900">Webinar not found</h1>
        <button
          onClick={() => router.push(`/events/${params.id}`)}
          className="mt-4 text-blue-600 hover:text-blue-800"
        >
          Return to Event
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <WebinarViewer
        webinar={webinar}
        onEdit={handleEdit}
        onDelete={handleDelete}
        isOwner={isOwner}
      />
    </div>
  );
} 