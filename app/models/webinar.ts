export interface Webinar {
  id: string;
  title: string;
  description: string;
  date: Date;
  time: string;
  hostId: string;
  hostName?: string;
  speakers: Array<{
    id: string;
    name: string;
    role?: string;
  }>;
  imageUrl: string | null;
  registrationLink: string | null;
  eventId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface WebinarFormData extends Omit<Webinar, 'id' | 'createdAt' | 'updatedAt'> {
  id?: string;
}

export interface WebinarSpeaker {
  id: string;
  name: string;
  role?: string;
} 