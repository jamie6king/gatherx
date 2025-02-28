import { prisma } from '@/app/lib/prisma';
import { format } from 'date-fns';
import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { SessionList } from '@/app/components/SessionList';
import { RegistrationSidebar } from '@/app/components/RegistrationSidebar';
import { WebinarList } from '@/app/components/webinar/WebinarList';
import { Event } from '@/app/models/event';
import { cookies } from 'next/headers';
import { verifyAuth } from '@/app/lib/auth';

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
        },
        webinars: {
          include: {
            speakers: {
              select: {
                id: true,
                name: true,
                role: true,
              },
            },
          },
        },
      },
    });

    if (!event) {
      return null;
    }

    return {
      ...event,
      capacity: event.capacity ?? undefined,
      price: event.price ?? undefined,
      website: event.website ?? undefined,
      contactEmail: event.contactEmail ?? undefined,
      contactPhone: event.contactPhone ?? undefined,
      contactName: event.contactName ?? undefined,
      bannerUrl: event.bannerUrl ?? undefined,
      logoUrl: event.logoUrl ?? undefined,
      videoUrl: event.videoUrl ?? undefined,
      interestTags: event.interestTags,
      socialMediaLinks: event.socialMediaLinks,
      webinars: event.webinars.map(webinar => ({
        ...webinar,
        speakers: webinar.speakers.map(speaker => ({
          id: speaker.id,
          name: speaker.name,
          role: speaker.role ?? undefined,
        })),
      })),
    };
  } catch (error) {
    console.error('Error fetching event:', error);
    return null;
  }
}

export default async function EventDetail({ params }: { params: { id: string } }) {
  const event = await getEvent(params.id);
  let user;
  try {
    user = await verifyAuth();
    console.log('Current user ID:', user);
  } catch (error) {
    console.error('Error verifying auth:', error);
    user = null;
  }

  if (!event) {
    notFound();
  }

  console.log('Event host ID:', event.host.id);
  console.log('Event host:', event.host);
  console.log('Is owner check:', !!user && user === event.host.id);

  const parsedInterestTags = JSON.parse(event.interestTags || '[]');
  const parsedSocialMediaLinks = JSON.parse(event.socialMediaLinks || '[]');

  return (
    <div className="min-h-screen bg-gray-50">
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
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            {/* Event Details */}
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <div className="flex items-start mb-6">
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
                  <div className="flex items-center gap-4 text-gray-600 mt-2">
                    <span>
                      {format(new Date(event.startDate), 'MMMM d, yyyy')}
                      {event.startDate !== event.endDate && 
                        ` - ${format(new Date(event.endDate), 'MMMM d, yyyy')}`}
                    </span>
                    <span>•</span>
                    <span>{event.startTime} - {event.endTime}</span>
                  </div>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-light text-primary">
                      {event.industry}
                    </span>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {event.eventType}
                    </span>
                    {event.price !== undefined && (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        {event.price === 0 ? 'Free' : `$${event.price}`}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="mb-6">
                <h2 className="text-xl font-semibold mb-2">About this Event</h2>
                <p className="text-gray-700 whitespace-pre-wrap">{event.description}</p>
              </div>

              {parsedInterestTags.length > 0 && (
                <div className="mb-6">
                  <h2 className="text-xl font-semibold mb-2">Tags</h2>
                  <div className="flex flex-wrap gap-2">
                    {parsedInterestTags.map((tag: string, index: number) => (
                      <span
                        key={index}
                        className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {event.videoUrl && (
                <div className="mb-6">
                  <h2 className="text-xl font-semibold mb-2">Event Video</h2>
                  <div className="relative aspect-video rounded-lg overflow-hidden">
                    <video
                      src={event.videoUrl}
                      controls
                      className="w-full h-full"
                      poster={event.bannerUrl || undefined}
                    />
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <h2 className="text-xl font-semibold mb-2">Location</h2>
                  <p className="text-gray-700">{event.location}</p>
                </div>

                {event.capacity && (
                  <div>
                    <h2 className="text-xl font-semibold mb-2">Capacity</h2>
                    <p className="text-gray-700">{event.capacity} attendees</p>
                  </div>
                )}
              </div>

              <div className="mb-6">
                <h2 className="text-xl font-semibold mb-2">Contact Information</h2>
                <div className="space-y-2">
                  {event.contactName && (
                    <p className="text-gray-700">
                      <span className="font-medium">Contact:</span> {event.contactName}
                    </p>
                  )}
                  {event.contactEmail && (
                    <p className="text-gray-700">
                      <span className="font-medium">Email:</span>{' '}
                      <a href={`mailto:${event.contactEmail}`} className="text-primary hover:underline">
                        {event.contactEmail}
                      </a>
                    </p>
                  )}
                  {event.contactPhone && (
                    <p className="text-gray-700">
                      <span className="font-medium">Phone:</span>{' '}
                      <a href={`tel:${event.contactPhone}`} className="text-primary hover:underline">
                        {event.contactPhone}
                      </a>
                    </p>
                  )}
                </div>
              </div>

              {(event.website || parsedSocialMediaLinks.length > 0) && (
                <div className="mb-6">
                  <h2 className="text-xl font-semibold mb-2">Links</h2>
                  <div className="space-y-2">
                    {event.website && (
                      <p className="text-gray-700">
                        <span className="font-medium">Website:</span>{' '}
                        <a
                          href={event.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary hover:underline"
                        >
                          {event.website}
                        </a>
                      </p>
                    )}
                    {parsedSocialMediaLinks.length > 0 && (
                      <div className="flex gap-4">
                        {parsedSocialMediaLinks.map((link: string, index: number) => (
                          <a
                            key={index}
                            href={link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-gray-500 hover:text-gray-700"
                          >
                            {/* You can add social media icons here based on the URL */}
                            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M12 0c-6.627 0-12 5.373-12 12s5.373 12 12 12 12-5.373 12-12-5.373-12-12-12zm-2 16h-2v-6h2v6zm-1-6.891c-.607 0-1.1-.496-1.1-1.109 0-.612.492-1.109 1.1-1.109s1.1.497 1.1 1.109c0 .613-.493 1.109-1.1 1.109zm8 6.891h-1.998v-2.861c0-1.881-2.002-1.722-2.002 0v2.861h-2v-6h2v1.093c.872-1.616 4-1.736 4 1.548v3.359z" />
                            </svg>
                          </a>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

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
                    <Link href={`/hosts/${event.host.id}`} className="text-primary text-sm hover:underline">
                      View Profile
                    </Link>
                  </div>
                </div>
              </div>
            </div>

            <section className="mt-8">
              <WebinarList 
                webinars={event.webinars} 
                eventId={event.id} 
                isOwner={!!user && user === event.host.id} 
              />
            </section>

            <section className="mt-8">
              <SessionList sessions={event.sessions} />
            </section>
          </div>

          <div className="lg:col-span-1">
            <RegistrationSidebar event={event} />
          </div>
        </div>
      </div>
    </div>
  );
} 