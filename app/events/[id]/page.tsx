import { prisma } from '@/app/lib/prisma';
import { format } from 'date-fns';
import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import dynamic from 'next/dynamic';

// Use dynamic imports to prevent hydration errors with client components
const SessionList = dynamic(() => import('../../components/SessionList'), { ssr: false });
const RegistrationSidebar = dynamic(() => import('../../components/RegistrationSidebar'), { ssr: false });

interface Session {
  id: string;
  title: string;
  description: string;
  startTime: Date;
  endTime: Date;
  speaker: string;
  format: string;
  tags: Array<{
    id: string;
    name: string;
  }>;
  _count: {
    attendees: number;
  };
}

interface Event {
  id: string;
  name: string;
  description: string;
  date: Date;
  location: string;
  bannerUrl: string | null;
  logoUrl: string | null;
  host: {
    id: string;
    name: string | null;
    jobTitle: string | null;
    avatarUrl: string | null;
  };
  sessions: Session[];
}

async function getEvent(id: string): Promise<Event | null> {
  try {
    const event = await prisma.event.findUnique({
      where: { id },
      include: {
        host: {
          select: {
            id: true,
            name: true,
            jobTitle: true,
            avatarUrl: true,
          },
        },
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

    return {
      id: event.id,
      name: event.name,
      description: event.description,
      date: event.date,
      location: event.location,
      bannerUrl: event.bannerUrl,
      logoUrl: event.logoUrl,
      host: event.host,
      sessions: event.sessions.map(session => ({
        id: session.id,
        title: session.title,
        description: session.description,
        speaker: session.speaker || 'TBA',
        startTime: session.startTime,
        endTime: session.endTime,
        format: session.format || 'General Session',
        tags: session.tags,
        _count: session._count,
      })),
    };
  } catch (error) {
    console.error('Error fetching event:', error);
    return null;
  }
}

export default async function EventDetail({ params }: { params: { id: string } }) {
  const event = await getEvent(params.id);

  if (!event) {
    notFound();
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Event Banner */}
      <div className="relative h-64 rounded-lg overflow-hidden mb-6">
        <Image
          src={event.bannerUrl || '/images/defaults/event-banner.svg'}
          alt={event.name}
          fill
          sizes="(max-width: 1280px) 100vw, 1280px"
          priority
          className="object-cover"
        />
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          {/* Event Details */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <div className="flex items-start mb-4">
              <div className="relative w-16 h-16 bg-gray-200 rounded-md overflow-hidden mr-4">
                {event.logoUrl ? (
                  <Image
                    src={event.logoUrl}
                    alt={`${event.name} logo`}
                    fill
                    sizes="64px"
                    className="object-contain"
                  />
                ) : (
                  <Image
                    src="/images/defaults/event-logo.svg"
                    alt={`${event.name} logo`}
                    fill
                    sizes="64px"
                    className="object-contain p-2"
                  />
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
                <div className="relative w-12 h-12 rounded-full overflow-hidden mr-3">
                  {event.host.avatarUrl ? (
                    <Image
                      src={event.host.avatarUrl}
                      alt={event.host.name || ''}
                      fill
                      sizes="48px"
                      className="object-cover"
                    />
                  ) : (
                    <Image
                      src="/images/defaults/avatar.svg"
                      alt={event.host.name || ''}
                      fill
                      sizes="48px"
                      className="object-cover"
                    />
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