# Events Pages

The events section consists of multiple pages that handle different aspects of event management.

## Directory Structure
```
/app/events/
├── create/     # Event creation page
└── [id]/       # Dynamic event detail pages
```

## Event Creation Page

Located at `/events/create/`, this page provides a form for users to create new events.

### Features
- Event details form
- Image upload for banner and logo
- Location input
- Date and time selection
- Event description editor
- Preview functionality

## Event Detail Page

Located at `/events/[id]/`, this dynamic page shows detailed information about a specific event.

### Features
- Event banner display
- Event information:
  - Name
  - Date and time
  - Location
  - Description
  - Host information
- Registration functionality
- Share options
- Related/Similar events

## Event Management Page

Located at `/events/[id]/manage`, this page allows event hosts to manage their events.

### Features
- Edit event details
- Manage registrations
- View analytics
- Cancel/Delete event options
- Update event status

## Technical Details

### Data Models
Events are structured according to the Prisma schema:

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

### API Integration
- Create event endpoint
- Update event endpoint
- Delete event endpoint
- Registration management endpoints
- Event query endpoints

### Security
- Authentication required for creation and management
- Authorization checks for event modifications
- Input validation and sanitization 