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
    date: Date;
    location: string;
    bannerUrl?: string | null;
    logoUrl?: string | null;
  };
}

export default function EventCard({ event }: EventCardProps) {
  const [bannerError, setBannerError] = useState(false);
  const [logoError, setLogoError] = useState(false);

  return (
    <Link href={`/events/${event.id}`}>
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition group relative">
        <div className="absolute top-0 left-0 w-1 h-full bg-hx-yellow transform origin-top transition-all duration-300 group-hover:scale-y-100 scale-y-0"></div>
        {/* Banner Image or Fallback */}
        <div className="relative h-48 bg-gradient-primary">
          <Image
            src={bannerError ? '/images/defaults/event-banner.svg' : (event.bannerUrl || '/images/defaults/event-banner.svg')}
            alt={event.name}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            quality={85}
            priority={true}
            className="object-cover transition group-hover:scale-105"
            onError={() => setBannerError(true)}
          />
          
          {/* Logo with Fallback */}
          <div className="absolute bottom-4 left-4 w-12 h-12 bg-white rounded-full p-1 shadow-md overflow-hidden">
            <div className="relative w-full h-full">
              {logoError ? (
                <div className="w-full h-full rounded-full bg-primary flex items-center justify-center text-white font-bold">
                  {event.name.charAt(0).toUpperCase()}
                </div>
              ) : (
                <Image
                  src={event.logoUrl || '/images/defaults/event-logo.svg'}
                  alt={`${event.name} logo`}
                  fill
                  sizes="48px"
                  className="object-cover rounded-full"
                  onError={() => setLogoError(true)}
                />
              )}
            </div>
          </div>
        </div>
        
        {/* Event Details */}
        <div className="p-4">
          <h3 className="font-semibold text-lg text-primary group-hover:text-primary-dark transition">
            {event.name}
          </h3>
          <p className="text-text-secondary text-sm mb-1">
            {format(new Date(event.date), 'MMMM d, yyyy')}
          </p>
          <p className="text-text-secondary text-sm flex items-center">
            <svg className="w-4 h-4 mr-1 text-hx-yellow" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            {event.location}
          </p>
        </div>
      </div>
    </Link>
  );
} 