# EventCard Component

The EventCard component is a reusable UI element that displays event information in a consistent and attractive format.

## Usage

```typescript
import EventCard from '@/app/components/EventCard';

// Example usage
<EventCard event={eventData} />
```

## Props Interface

```typescript
interface EventCardProps {
  event: {
    id: string;
    name: string;
    description: string;
    date: Date;
    location: string;
    bannerUrl?: string | null;
    logoUrl?: string | null;
  };
}
```

## Features

### Visual Elements
- Event banner image with fallback
- Event logo (if provided)
- Event name
- Date and time
- Location
- Brief description preview

### Interactions
- Click to view full event details
- Hover effects
- Responsive design

### Styling
- Uses Tailwind CSS for styling
- Consistent card dimensions
- Responsive image handling
- Text truncation for long content

## Implementation Details

### Image Handling
- Optimized image loading
- Fallback images
- Lazy loading for performance

### Accessibility
- Semantic HTML structure
- ARIA labels
- Keyboard navigation support

### Responsive Design
- Mobile-first approach
- Flexible layout
- Adaptive image sizes

## Example

```tsx
export default function EventCard({ event }: EventCardProps) {
  return (
    <div className="border rounded-lg overflow-hidden hover:shadow-md transition">
      {/* Banner Image */}
      <div className="relative h-48">
        <Image
          src={event.bannerUrl || '/default-event-banner.jpg'}
          alt={event.name}
          fill
          className="object-cover"
        />
      </div>
      
      {/* Event Details */}
      <div className="p-4">
        <h3 className="font-semibold text-lg">{event.name}</h3>
        <p className="text-gray-600 text-sm">
          {format(new Date(event.date), 'MMMM d, yyyy')}
        </p>
        <p className="text-gray-600 text-sm">{event.location}</p>
      </div>
    </div>
  );
}
``` 