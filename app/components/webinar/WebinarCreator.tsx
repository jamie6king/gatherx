'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { WebinarFormData } from '@/app/models/webinar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { DatePicker } from '@/components/ui/date-picker';
import { TimePicker } from '@/components/ui/time-picker';
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';

interface WebinarCreatorProps {
  eventId: string;
  initialData?: WebinarFormData;
  onSubmit: (data: WebinarFormData) => Promise<void>;
}

export const WebinarCreator = ({ eventId, initialData, onSubmit }: WebinarCreatorProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const [date, setDate] = useState<Date | undefined>(initialData?.date);
  const [time, setTime] = useState<Date | undefined>(
    initialData?.time ? new Date(`1970-01-01T${initialData.time}`)
    : undefined
  );

  const { register, handleSubmit, setValue, formState: { errors } } = useForm<WebinarFormData>({
    defaultValues: initialData || {
      eventId,
      title: '',
      description: '',
      date: new Date(),
      time: '09:00',
      hostId: '',
      hostName: '',
      speakers: [],
      imageUrl: null,
      registrationLink: null,
    }
  });

  // Update form values when date/time changes
  useEffect(() => {
    if (date) {
      setValue('date', date);
    }
  }, [date, setValue]);

  useEffect(() => {
    if (time) {
      setValue('time', format(time, 'HH:mm'));
    }
  }, [time, setValue]);

  const handleFormSubmit = async (data: WebinarFormData) => {
    try {
      setIsSubmitting(true);
      setError(null);
      await onSubmit(data);
    } catch (error) {
      console.error('Error submitting webinar:', error);
      setError('Failed to create webinar. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      <div>
        <label htmlFor="title" className="block text-sm font-medium text-gray-700">
          Title
        </label>
        <Input
          id="title"
          type="text"
          {...register('title', { required: 'Title is required' })}
          className="mt-1"
          aria-label="Webinar title"
        />
        {errors.title && (
          <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>
        )}
      </div>

      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700">
          Description
        </label>
        <Textarea
          id="description"
          {...register('description', { required: 'Description is required' })}
          className="mt-1"
          rows={4}
          aria-label="Webinar description"
        />
        {errors.description && (
          <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="date" className="block text-sm font-medium text-gray-700">
            Date
          </label>
          <DatePicker
            date={date}
            setDate={setDate}
            className="mt-1"
          />
          {errors.date && (
            <p className="mt-1 text-sm text-red-600">{errors.date.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="time" className="block text-sm font-medium text-gray-700">
            Time
          </label>
          <TimePicker
            date={time}
            setDate={setTime}
            className="mt-1"
          />
          {errors.time && (
            <p className="mt-1 text-sm text-red-600">{errors.time.message}</p>
          )}
        </div>
      </div>

      <div>
        <label htmlFor="hostName" className="block text-sm font-medium text-gray-700">
          Host Name
        </label>
        <Input
          id="hostName"
          type="text"
          {...register('hostName', { required: 'Host name is required' })}
          className="mt-1"
          aria-label="Host name"
        />
      </div>

      <div>
        <label htmlFor="registrationLink" className="block text-sm font-medium text-gray-700">
          Registration Link
        </label>
        <Input
          id="registrationLink"
          type="url"
          {...register('registrationLink')}
          className="mt-1"
          aria-label="Registration link"
        />
      </div>

      <Button
        type="submit"
        disabled={isSubmitting}
        className="w-full"
      >
        {isSubmitting ? 'Saving...' : initialData ? 'Update Webinar' : 'Create Webinar'}
      </Button>
    </form>
  );
}; 