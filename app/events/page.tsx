'use client';

import Link from 'next/link';
import { format } from 'date-fns';
import dynamic from 'next/dynamic';
import { useState, useEffect } from 'react';

// Use dynamic import to prevent hydration errors with client components
const EventCard = dynamic(() => import('../components/EventCard'), { ssr: false });

// Define the Event interface based on the Prisma schema
interface Event {
  id: string;
  name: string;
  description: string;
  date: Date;
  location: string;
  bannerUrl: string | null;
  logoUrl: string | null;
  hostId: string;
  createdAt: Date;
  updatedAt: Date;
}

export default function Events() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchEvents() {
      try {
        const response = await fetch('/api/events');
        if (!response.ok) {
          throw new Error('Failed to fetch events');
        }
        const data = await response.json();
        setEvents(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load events');
        console.error('Error fetching events:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchEvents();
  }, []);

  // Filter events based on search term
  const filteredEvents = events.filter(event =>
    event.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    event.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    event.location.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">
          <p className="text-lg text-gray-600">Loading events...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">
          <p className="text-lg text-red-600">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header Section */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-3xl font-bold text-primary">All Events</h1>
          <Link 
            href="/events/create"
            className="inline-block bg-primary text-white px-6 py-2 rounded-md text-lg font-medium hover:bg-primary-dark transition"
          >
            Create Event
          </Link>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm">
          <div className="flex flex-wrap gap-4">
            <input
              type="text"
              placeholder="Search events..."
              className="flex-1 min-w-[200px] px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <select className="px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent">
              <option value="">All Categories</option>
              <option value="tech">Technology</option>
              <option value="business">Business</option>
              <option value="social">Social</option>
            </select>
            <select className="px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent">
              <option value="">All Locations</option>
              <option value="online">Online</option>
              <option value="in-person">In-Person</option>
            </select>
          </div>
        </div>
      </div>

      {/* Events Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredEvents.map((event: Event) => (
          <EventCard key={event.id} event={event} />
        ))}
      </div>

      {/* Empty State */}
      {filteredEvents.length === 0 && (
        <div className="text-center py-12">
          <h3 className="text-xl font-medium text-gray-600 mb-4">No events found</h3>
          <p className="text-gray-500 mb-6">Try adjusting your search or filters</p>
          <Link 
            href="/events/create"
            className="inline-block bg-primary text-white px-6 py-2 rounded-md text-lg font-medium hover:bg-primary-dark transition"
          >
            Create an Event
          </Link>
        </div>
      )}
    </div>
  );
} 