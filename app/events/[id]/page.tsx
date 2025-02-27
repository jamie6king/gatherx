import { prisma } from '@/app/lib/prisma';
import { format } from 'date-fns';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import dynamic from 'next/dynamic';

// Use dynamic imports to prevent hydration errors with client components
const SessionList = dynamic(() => import('../../components/SessionList'), { ssr: false });
const RegistrationSidebar = dynamic(() => import('../../components/RegistrationSidebar'), { ssr: false });

async function getEvent(id: string) {
  const event = await prisma.event.findUnique({
    where: { id },
    include: {
      host: true,
      sessions: {
        include: {
          tags: true,
          _count: {
            select: {
              attendees: true,
            },
          },
        },
        orderBy: {
          startTime: 'asc',
        },
      },
    },
  });

  if (!event) {
    return null;
  }

  return event;
}

export default async function EventDetail({ params }: { params: { id: string } }) {
  const event = await getEvent(params.id);

  if (!event) {
    notFound();
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Event Banner */}
      <div className="h-64 bg-gray-200 rounded-lg overflow-hidden mb-6">
        {event.bannerUrl ? (
          <img 
            src={event.bannerUrl} 
            alt={event.name} 
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-500">
            Event Banner
          </div>
        )}
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          {/* Event Details */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <div className="flex items-start mb-4">
              <div className="w-16 h-16 bg-gray-200 rounded-md flex items-center justify-center text-gray-500 mr-4">
                {event.logoUrl ? (
                  <img 
                    src={event.logoUrl} 
                    alt={`${event.name} logo`} 
                    className="w-full h-full object-contain p-1"
                  />
                ) : (
                  'Logo'
                )}
              </div>
              <div>
                <h1 className="text-3xl font-bold">{event.name}</h1>
                <p className="text-gray-600">
                  {format(new Date(event.date), 'MMMM d, yyyy')} • {event.location}
                </p>
              </div>
            </div>
            <div className="mb-6">
              <h2 className="text-xl font-semibold mb-2">About this Event</h2>
              <p className="text-gray-700">{event.description}</p>
            </div>
            <div>
              <h2 className="text-xl font-semibold mb-2">Hosted by</h2>
              <div className="flex items-center">
                <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center text-gray-500 mr-3">
                  {event.host.avatarUrl ? (
                    <img 
                      src={event.host.avatarUrl} 
                      alt={event.host.name} 
                      className="w-full h-full object-cover rounded-full"
                    />
                  ) : (
                    'Host'
                  )}
                </div>
                <div>
                  <p className="font-medium">{event.host.name}</p>
                  <p className="text-gray-600 text-sm">{event.host.jobTitle}</p>
                  <Link href={`/hosts/${event.host.id}`} className="text-primary text-sm">
                    View Profile
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* Sessions */}
          <SessionList sessions={event.sessions} />
        </div>
        
        {/* Registration Sidebar */}
        <RegistrationSidebar eventId={event.id} />
      </div>
    </div>
  );
} 