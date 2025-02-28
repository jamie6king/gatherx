'use client';

import { WebinarCreator } from '@/app/components/webinar/WebinarCreator';
import { WebinarFormData } from '@/app/models/webinar';
import { useRouter } from 'next/navigation';

interface CreateWebinarPageProps {
  params: {
    id: string;
  };
}

export default function CreateWebinarPage({ params }: CreateWebinarPageProps) {
  const router = useRouter();
  const eventId = params.id;

  const handleSubmit = async (data: WebinarFormData) => {
    try {
      const response = await fetch('/api/webinars', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error('Failed to create webinar');
      }

      router.push(`/events/${eventId}`);
    } catch (error) {
      console.error('Error creating webinar:', error);
      // Handle error (show toast notification, etc.)
    }
  };

  return (
    <div className="max-w-2xl mx-auto py-8 px-4">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Create Webinar</h1>
      <WebinarCreator
        eventId={eventId}
        onSubmit={handleSubmit}
      />
    </div>
  );
} 