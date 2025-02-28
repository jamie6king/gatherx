import { Webinar } from './webinar';

export interface Event {
  id: string;
  name: string;
  description: string;
  startDate: Date;
  endDate: Date;
  startTime: string;
  endTime: string;
  industry: string;
  interestTags: string;
  eventType: string;
  capacity?: number;
  price?: number;
  location: string;
  bannerUrl?: string;
  logoUrl?: string;
  videoUrl?: string;
  website?: string;
  socialMediaLinks: string;
  contactEmail?: string;
  contactPhone?: string;
  contactName?: string;
  hostId: string;
  host: {
    id: string;
    name: string | null;
    jobTitle: string | null;
    avatarUrl: string | null;
  };
  sessions: Array<{
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
  }>;
  webinars: Webinar[];
  createdAt: Date;
  updatedAt: Date;
} 