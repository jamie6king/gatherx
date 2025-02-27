import Link from 'next/link';
import { prisma } from '@/app/lib/prisma';
import { format } from 'date-fns';
import dynamic from 'next/dynamic';

// Use dynamic import to prevent hydration errors with client components
const EventCard = dynamic(() => import('./components/EventCard'), { ssr: false });

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

async function getEvents() {
  const events = await prisma.event.findMany({
    orderBy: {
      date: 'asc',
    },
    take: 6,
  });
  return events;
}

export default async function Home() {
  const featuredEvents = await getEvents();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Hero Section */}
      <section className="mb-16 text-center">
        <div className="bg-gradient-primary-yellow text-white rounded-lg p-12 mb-8 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-primary opacity-90"></div>
          <div className="relative z-10">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Welcome to GatherX</h1>
            <p className="text-xl opacity-90 mb-8 max-w-3xl mx-auto">
              Discover and join amazing events or create your own to share with the world.
            </p>
            <Link 
              href="/events/create"
              className="inline-block bg-white text-primary px-6 py-3 rounded-md text-lg font-medium hover:bg-gray-100 transition"
            >
              Create Your Event
            </Link>
          </div>
        </div>
      </section>
      
      <section className="mb-12">
        <div className="flex items-center mb-6">
          <div className="w-2 h-8 bg-hx-yellow rounded-full mr-3"></div>
          <h2 className="text-3xl font-bold text-primary">Featured Events</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {featuredEvents.map((event: Event) => (
            <EventCard key={event.id} event={event} />
          ))}
        </div>
      </section>

      <section className="bg-primary text-white p-8 rounded-lg relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-hx-yellow opacity-10 rounded-full transform translate-x-32 -translate-y-32"></div>
        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between">
          <div className="mb-6 md:mb-0 md:mr-6">
            <h2 className="text-2xl font-bold mb-2">Ready to Host Your Event?</h2>
            <p className="opacity-90">
              Share your passion, knowledge, or create memorable experiences for others.
            </p>
          </div>
          <Link 
            href="/events/create"
            className="inline-block bg-white text-primary px-5 py-2 rounded-md text-md font-medium hover:bg-gray-100 transition"
          >
            Get Started Now
          </Link>
        </div>
      </section>
    </div>
  );
} 