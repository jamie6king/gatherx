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
      description: 'Annual technology conference',
      date: new Date('2024-06-01T09:00:00Z'),
      location: 'San Francisco, CA',
      bannerUrl: '/images/defaults/event-banner.svg',
      logoUrl: '/images/defaults/event-logo.svg',
      hostEmail: 'john@example.com'
    },
    {
      name: 'Healthcare Summit',
      description: 'Healthcare innovation summit',
      date: new Date('2024-07-15T10:00:00Z'),
      location: 'Boston, MA',
      bannerUrl: '/images/defaults/event-banner.svg',
      logoUrl: '/images/defaults/event-logo.svg',
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
          date: event.date,
          location: event.location,
          bannerUrl: event.bannerUrl,
          logoUrl: event.logoUrl,
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