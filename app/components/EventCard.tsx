'use client';

import Image from 'next/image';
import Link from 'next/link';
import { format } from 'date-fns';
import { useState } from 'react';

interface EventCardProps {
  event: {
    id: string;
    name: string;
    description: string;
    startDate: Date;
    endDate: Date;
    startTime: string;
    endTime: string;
    industry: 'Tech' | 'Health' | 'Finance' | 'Marketing' | 'Education' | 'Other';
    interestTags: string[];
    eventType: 'Webinar' | 'Workshop' | 'Networking' | 'Hackathon';
    capacity?: number;
    price?: number;
    location: string;
    bannerUrl?: string | null;
    logoUrl?: string | null;
    videoUrl?: string | null;
  };
}

export default function EventCard({ event }: EventCardProps) {
  const [bannerError, setBannerError] = useState(false);
  const [logoError, setLogoError] = useState(false);

  return (
    <Link
      href={`/events/${event.id}`}
      className="block group bg-white rounded-lg shadow-sm hover:shadow-md transition overflow-hidden"
    >
      <div className="relative aspect-video overflow-hidden">
        <Image
          src={bannerError ? '/images/defaults/event-banner.svg' : (event.bannerUrl || '/images/defaults/event-banner.svg')}
          alt={event.name}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className="object-cover group-hover:scale-105 transition duration-300"
          onError={() => setBannerError(true)}
        />
      </div>
      <div className="p-4">
        <h3 className="font-semibold text-lg text-primary group-hover:text-primary-dark transition">
          {event.name}
        </h3>
        <div className="flex items-center justify-between mb-1">
          <p className="text-text-secondary text-sm">
            {format(new Date(event.startDate), 'MMMM d, yyyy')}
          </p>
          {event.price !== undefined && (
            <span className="text-sm font-medium">
              {event.price === 0 ? 'Free' : `$${event.price}`}
            </span>
          )}
        </div>
        <div className="flex items-center justify-between">
          <p className="text-text-secondary text-sm flex items-center">
            <svg className="w-4 h-4 mr-1 text-hx-yellow" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            {event.location}
          </p>
          <span className="text-sm text-primary font-medium">
            {event.eventType}
          </span>
        </div>
      </div>
    </Link>
  );
} 