import { PrismaClient } from '@prisma/client';
import { addDays, addHours, setHours } from 'date-fns';

const prisma = new PrismaClient();

async function main() {
  // Clean existing data
  await prisma.sessionUser.deleteMany();
  await prisma.eventUser.deleteMany();
  await prisma.tag.deleteMany();
  await prisma.session.deleteMany();
  await prisma.event.deleteMany();
  await prisma.user.deleteMany();

  console.log('Deleted existing data');

  // Create sample users
  const hostUser = await prisma.user.create({
    data: {
      name: 'Tech Events Inc',
      email: 'host@techevents.com',
      jobTitle: 'Event Organizer',
      industry: 'Technology',
      avatarUrl: '/images/avatar-host.jpg'
    }
  });

  const user1 = await prisma.user.create({
    data: {
      name: 'Jane Smith',
      email: 'jane@example.com',
      jobTitle: 'Software Engineer',
      industry: 'Technology',
      avatarUrl: '/images/avatar-jane.jpg'
    }
  });

  const user2 = await prisma.user.create({
    data: {
      name: 'John Doe',
      email: 'john@example.com',
      jobTitle: 'Product Manager',
      industry: 'Technology',
      avatarUrl: '/images/avatar-john.jpg'
    }
  });

  console.log('Created sample users');

  // Create tags
  const tagAI = await prisma.tag.create({
    data: { name: 'AI' }
  });

  const tagWebDev = await prisma.tag.create({
    data: { name: 'Web Dev' }
  });

  const tagJavaScript = await prisma.tag.create({
    data: { name: 'JavaScript' }
  });

  const tagDiversity = await prisma.tag.create({
    data: { name: 'Diversity' }
  });

  const tagFutureTech = await prisma.tag.create({
    data: { name: 'Future Tech' }
  });

  const tagWorkplaceCulture = await prisma.tag.create({
    data: { name: 'Workplace Culture' }
  });

  console.log('Created tags');

  // Create sample events
  const today = new Date();
  const techConferenceDate = addDays(today, 30);

  const techConference = await prisma.event.create({
    data: {
      name: 'Tech Conference 2023',
      description: 'Join us for the biggest tech conference of the year featuring top speakers from around the world.',
      date: techConferenceDate,
      location: 'San Francisco Convention Center',
      bannerUrl: '/images/tech-conf-banner.jpg',
      logoUrl: '/images/tech-conf-logo.png',
      hostId: hostUser.id,
    }
  });

  const designWorkshopDate = addDays(today, 45);

  const designWorkshop = await prisma.event.create({
    data: {
      name: 'Design Workshop',
      description: 'Learn the latest design trends and techniques from industry experts.',
      date: designWorkshopDate,
      location: 'New York Design Center',
      bannerUrl: '/images/design-workshop-banner.jpg',
      logoUrl: '/images/design-workshop-logo.png',
      hostId: hostUser.id,
    }
  });

  const aiSummitDate = addDays(today, 60);

  const aiSummit = await prisma.event.create({
    data: {
      name: 'AI Summit',
      description: 'Explore the future of artificial intelligence and its impact on various industries.',
      date: aiSummitDate,
      location: 'Seattle Tech Hub',
      bannerUrl: '/images/ai-summit-banner.jpg',
      logoUrl: '/images/ai-summit-logo.png',
      hostId: hostUser.id,
    }
  });

  console.log('Created sample events');

  // Create sessions for Tech Conference
  const keynoteSession = await prisma.session.create({
    data: {
      title: 'Keynote: The Future of AI',
      description: 'Exploring the upcoming trends in artificial intelligence',
      speaker: 'Dr. Jane Smith',
      startTime: setHours(techConferenceDate, 9),
      endTime: setHours(techConferenceDate, 10),
      format: 'Keynote',
      eventId: techConference.id,
      tags: {
        connect: [
          { id: tagAI.id },
          { id: tagFutureTech.id }
        ]
      }
    }
  });

  const webDevSession = await prisma.session.create({
    data: {
      title: 'Web Development in 2023',
      description: 'Latest frameworks and tools for modern web development',
      speaker: 'John Doe',
      startTime: setHours(techConferenceDate, 11),
      endTime: setHours(techConferenceDate, 12),
      format: 'Workshop',
      eventId: techConference.id,
      tags: {
        connect: [
          { id: tagWebDev.id },
          { id: tagJavaScript.id }
        ]
      }
    }
  });

  const diversityPanel = await prisma.session.create({
    data: {
      title: 'Panel: Diversity in Tech',
      description: 'Discussion on improving diversity and inclusion in the tech industry',
      speaker: 'Various Industry Leaders',
      startTime: setHours(techConferenceDate, 14),
      endTime: setHours(techConferenceDate, 15),
      format: 'Panel',
      eventId: techConference.id,
      tags: {
        connect: [
          { id: tagDiversity.id },
          { id: tagWorkplaceCulture.id }
        ]
      }
    }
  });

  console.log('Created sessions for Tech Conference');

  // Register users for events
  await prisma.eventUser.create({
    data: {
      userId: user1.id,
      eventId: techConference.id
    }
  });

  await prisma.eventUser.create({
    data: {
      userId: user2.id,
      eventId: techConference.id
    }
  });

  await prisma.eventUser.create({
    data: {
      userId: user1.id,
      eventId: aiSummit.id
    }
  });

  console.log('Registered users for events');

  // Register users for sessions
  await prisma.sessionUser.create({
    data: {
      userId: user1.id,
      sessionId: keynoteSession.id
    }
  });

  await prisma.sessionUser.create({
    data: {
      userId: user1.id,
      sessionId: diversityPanel.id
    }
  });

  await prisma.sessionUser.create({
    data: {
      userId: user2.id,
      sessionId: webDevSession.id
    }
  });

  await prisma.sessionUser.create({
    data: {
      userId: user2.id,
      sessionId: diversityPanel.id
    }
  });

  console.log('Registered users for sessions');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 