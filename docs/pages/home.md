# Home Page

The home page serves as the main entry point for GatherX users. Located at `/app/page.tsx`, it provides an overview of featured events and quick access to event creation.

## Features

### Hero Section
- Welcoming header with "Welcome to GatherX"
- Descriptive subtext about the platform's purpose
"GatherX the remote event and networking solution, helping people connect all over the world"
- Primary CTA button for event creation [Directs to a login screen when logged out or to the event_creation_page while logged in]

### Featured Events Section
- Displays up to 6 upcoming events
- Events are sorted by date in ascending order
- Each event is displayed using the EventCard component
- Grid layout: 1 column on mobile, 2 on tablet, 3 on desktop

### Call-to-Action Section
- "Ready to Host Your Event?" promotional section
- Encourages users to create their own events
- Secondary CTA button for event creation

## Technical Details

### Data Fetching
```typescript
async function getEvents() {
  const events = await prisma.event.findMany({
    orderBy: {
      date: 'asc',
    },
    take: 6,
  });
  return events;
}
```

### Event Interface
```typescript
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
```

## Component Usage
- Uses dynamic import for EventCard to prevent hydration errors
- Implements responsive design using Tailwind CSS classes
- Utilizes Next.js Link component for client-side navigation 