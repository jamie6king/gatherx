# Profile Page

The profile page (`/app/profile/page.tsx`) provides users with a personal dashboard to manage their events and view their information.

## Features

### User Information Display
- Profile picture/avatar with fallback
- User's name and email
- Job title (if provided)
- Bio section
- Gradient header background for visual appeal

### Events Management
The page implements a tab system to manage different types of events:

#### Registered Events Tab
- Lists all events the user has registered to attend
- Each event shows:
  - Event name
  - Date (formatted)
  - Location
  - Link to view event details

#### Hosted Events Tab
- Shows events created by the user
- Each event displays:
  - Event name
  - Date (formatted)
  - Location
  - View and Manage event options
- Quick access button to create new events

## Technical Implementation

### State Management
```typescript
interface User {
  id: string;
  name: string;
  email: string;
  avatarUrl: string | null;
  jobTitle: string | null;
  bio: string | null;
}

interface Event {
  id: string;
  name: string;
  date: Date;
  location: string;
}

// State hooks
const [user, setUser] = useState<User | null>(null);
const [registeredEvents, setRegisteredEvents] = useState<Event[]>([]);
const [hostedEvents, setHostedEvents] = useState<Event[]>([]);
```

### Loading States
- Implements loading state during data fetching
- Shows loading spinner/message
- Handles error states gracefully

### Responsive Design
- Adapts layout for different screen sizes
- Mobile-first approach using Tailwind CSS
- Flexible grid system for event listings

## API Integration
- Fetches user data from `/api/user` endpoint
- Manages event data through API endpoints
- Implements error handling for failed API calls

## Navigation
- Uses Next.js Link component for client-side navigation
- Provides direct links to:
  - Individual event pages
  - Event management pages
  - Event creation page 