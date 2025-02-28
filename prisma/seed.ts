const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

const defaultNotifications = {
  eventReminders: true,
  friendActivity: true,
  messageNotifications: true,
  systemUpdates: true
};

async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

async function main() {
  // Create sample users
  const users = [
    {
      name: 'John Doe',
      email: 'john@example.com',
      password: 'password123',
      tagString: 'Software,AI,Cloud',
      jobTitle: 'Software Engineer',
      industry: 'Technology',
      notifications: JSON.stringify(defaultNotifications),
      userType: 'EVENT_MANAGER'
    },
    {
      name: 'Jane Smith',
      email: 'jane@example.com',
      password: 'password123',
      tagString: 'Medical,Biotech',
      jobTitle: 'Research Scientist',
      industry: 'Healthcare',
      notifications: JSON.stringify(defaultNotifications),
      userType: 'EVENT_MANAGER'
    }
  ];

  for (const user of users) {
    const hashedPassword = await hashPassword(user.password);
    await prisma.user.upsert({
      where: { email: user.email },
      update: {
        name: user.name,
        tagString: user.tagString,
        jobTitle: user.jobTitle,
        industry: user.industry,
        notifications: user.notifications,
        userType: user.userType,
        password: hashedPassword
      },
      create: {
        name: user.name,
        email: user.email,
        password: hashedPassword,
        tagString: user.tagString,
        jobTitle: user.jobTitle,
        industry: user.industry,
        notifications: user.notifications,
        userType: user.userType
      }
    });
  }

  // Create sample events
  const events = [
    {
      name: 'Tech Conference 2024',
      description: 'Annual technology conference bringing together industry leaders and innovators',
      startDate: new Date('2024-06-01T09:00:00Z'),
      endDate: new Date('2024-06-03T17:00:00Z'),
      startTime: '09:00',
      endTime: '17:00',
      industry: 'Tech',
      interestTags: JSON.stringify(['Software Development', 'AI', 'Cloud Computing', 'Blockchain']),
      eventType: 'Conference',
      capacity: 500,
      price: 299.99,
      location: 'San Francisco Convention Center',
      bannerUrl: '/images/defaults/event-banner.svg',
      logoUrl: '/images/defaults/event-logo.svg',
      videoUrl: null,
      website: 'https://techconf2024.example.com',
      socialMediaLinks: JSON.stringify(['https://twitter.com/techconf', 'https://linkedin.com/company/techconf']),
      contactEmail: 'info@techconf2024.example.com',
      contactPhone: '+1 (555) 123-4567',
      contactName: 'Conference Organizer',
      hostEmail: 'john@example.com'
    },
    {
      name: 'Healthcare Summit',
      description: 'Healthcare innovation summit focused on the latest medical technologies and breakthroughs',
      startDate: new Date('2024-07-15T10:00:00Z'),
      endDate: new Date('2024-07-16T18:00:00Z'),
      startTime: '10:00',
      endTime: '18:00',
      industry: 'Health',
      interestTags: JSON.stringify(['Healthcare IT', 'Biotechnology', 'Medical Devices', 'Digital Health']),
      eventType: 'Summit',
      capacity: 300,
      price: 399.99,
      location: 'Boston Medical Center',
      bannerUrl: '/images/defaults/event-banner.svg',
      logoUrl: '/images/defaults/event-logo.svg',
      videoUrl: null,
      website: 'https://healthsummit2024.example.com',
      socialMediaLinks: JSON.stringify(['https://twitter.com/healthsummit', 'https://linkedin.com/company/healthsummit']),
      contactEmail: 'info@healthsummit2024.example.com',
      contactPhone: '+1 (555) 987-6543',
      contactName: 'Summit Coordinator',
      hostEmail: 'jane@example.com'
    }
  ];

  for (const event of events) {
    const host = await prisma.user.findUnique({
      where: { email: event.hostEmail }
    });

    if (host) {
      await prisma.event.create({
        data: {
          name: event.name,
          description: event.description,
          startDate: event.startDate,
          endDate: event.endDate,
          startTime: event.startTime,
          endTime: event.endTime,
          industry: event.industry,
          interestTags: event.interestTags,
          eventType: event.eventType,
          capacity: event.capacity,
          price: event.price,
          location: event.location,
          bannerUrl: event.bannerUrl,
          logoUrl: event.logoUrl,
          videoUrl: event.videoUrl,
          website: event.website,
          socialMediaLinks: event.socialMediaLinks,
          contactEmail: event.contactEmail,
          contactPhone: event.contactPhone,
          contactName: event.contactName,
          hostId: host.id
        }
      });
    }
  }

  // Create sample tags
  const tags = [
    'Software Development',
    'AI/ML',
    'Cloud Computing',
    'Healthcare IT',
    'Biotechnology'
  ];

  for (const tagName of tags) {
    await prisma.tag.upsert({
      where: { name: tagName },
      update: {},
      create: {
        name: tagName
      }
    });
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 