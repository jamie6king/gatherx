# GatherX - Event Platform

GatherX is a modern web application for discovering, joining, and creating events. This platform allows users to sign up for events, create their own events, and manage their event experience, all enhanced with AI capabilities.

## Features

### For Attendees
- **Event Discovery**: Browse and search for events on the homepage
- **Event Details**: View comprehensive information about events, including sessions and schedules
- **Enhanced Sign-up Flow**: Register for events with a simple and intuitive interface
- **Session Management**: Select specific sessions to attend based on your interests
- **User Profiles**: Manage your profile and view your registered events
- **AI Recommendations**: Get personalized session recommendations based on your interests

### For Organizers
- **Event Creation**: Create new events with all essential details
- **Event Management**: Edit event information, add sessions, and track registrations
- **Attendee Insights**: View and manage event attendees
- **Session Organization**: Create and schedule multiple sessions for your events

## Tech Stack

- **Frontend**: Next.js 14 with App Router, TypeScript, Tailwind CSS
- **State Management**: React Query (TanStack Query)
- **Database**: SQLite (development), PostgreSQL (production ready)
- **ORM**: Prisma for database access
- **API**: Next.js Route Handlers for backend functionality
- **Deployment**: Ready for deployment on Vercel, Netlify, or any other hosting platform

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn

### Installation

1. Clone the repository
```bash
git clone https://github.com/yourusername/gatherx.git
cd gatherx
```

2. Install dependencies
```bash
npm install
# or
yarn install
```

3. Set up environment variables
```bash
cp .env.example .env.local
```
Edit the `.env.local` file with your database connection string and other configuration.

4. Run database migrations
```bash
npx prisma migrate dev
```

5. Seed the database (optional)
```bash
npm run seed
```

6. Run the development server
```bash
npm run dev
# or
yarn dev
```

7. Open [http://localhost:3000](http://localhost:3000) in your browser

## Project Structure

```
/app
  /api - API routes using Next.js Route Handlers
  /components - Reusable UI components
    /EventCard.tsx - Card component for displaying events
    /RegistrationSidebar.tsx - Sidebar for event registration
    /SessionList.tsx - Component for displaying event sessions
  /events - Event-related pages
    /[id] - Event detail page
    /create - Event creation page
  /lib - Utility functions and libraries
    /prisma.ts - Prisma client configuration
  /profile - User profile page
  /providers.tsx - React Query and other providers
  /layout.tsx - Root layout component
  /page.tsx - Homepage
/prisma
  /migrations - Database migrations
  schema.prisma - Prisma schema
```

## API Endpoints

- `GET /api/events` - Get all events
- `POST /api/events` - Create a new event
- `GET /api/events/{id}` - Get event details
- `POST /api/events/register` - Register for an event
- `GET /api/user` - Get current user details

## Current Functionality

- Users can browse featured events on the homepage
- Users can view detailed information about events, including sessions and schedules
- Users can register for events and select sessions to attend
- Users can create new events
- Users can view their profile and registered events

## Future Enhancements

- **Authentication System**: Implement a proper authentication system
- **Advanced Search**: Add search functionality for events with filters
- **Event Recommendations**: AI-driven recommendations based on user interests
- **Social Features**: Allow users to share events and connect with others
- **Payment Integration**: Support for paid events with payment processing
- **Mobile Application**: Develop a companion mobile app
- **Event Analytics**: Provide insights to event organizers
- **Notification System**: Email and in-app notifications for users

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details. 