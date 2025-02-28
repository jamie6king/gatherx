import { z } from 'zod';

export const userSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  email: z.string().email().optional(),
  password: z.string().min(8).optional(),
  userType: z.enum(['GUEST', 'EVENT_MANAGER']).default('GUEST'),
  jobTitle: z.string().max(100).optional(),
  industry: z.string().max(100).optional(),
  bio: z.string().max(500).optional(),
  avatarUrl: z.string().url().optional(),
  bannerUrl: z.string().url().optional(),
  useGravatar: z.boolean().default(false),
  tagString: z.string().optional(),
});

export const eventSchema = z.object({
  name: z.string().min(3).max(100),
  description: z.string(),
  startDate: z.string().transform((str: string) => new Date(str)),
  endDate: z.string().transform((str: string) => new Date(str)),
  startTime: z.string(),
  endTime: z.string(),
  industry: z.enum(['Tech', 'Health', 'Finance', 'Marketing', 'Education', 'Other']),
  interestTags: z.array(z.string()).default([]),
  eventType: z.enum(['Webinar', 'Workshop', 'Networking', 'Hackathon']),
  capacity: z.number().optional(),
  price: z.number().optional(),
  location: z.string(),
  bannerUrl: z.string().url().optional(),
  logoUrl: z.string().url().optional(),
  videoUrl: z.string().url().optional(),
  website: z.string().url().optional().nullable(),
  socialMediaLinks: z.array(z.string().url()).optional().nullable().default([]),
  contactEmail: z.string().email().optional().nullable(),
  contactPhone: z.string().optional().nullable(),
  contactName: z.string().optional().nullable(),
});

export const eventSessionSchema = z.object({
  title: z.string().min(3).max(100),
  description: z.string().min(10).max(1000),
  speaker: z.string().min(2).max(100),
  startTime: z.string().transform((str: string) => new Date(str)),
  endTime: z.string().transform((str: string) => new Date(str)),
  format: z.string().min(2).max(50),
  tags: z.array(z.string()).optional(),
}); 