# Webinar Creation Page
Located at /events/[id]/webinar/, this page enables users to create webinars tied to a specific event.

## Features
- Webinar title: Form input for specifying the name of the webinar.
- Webinar description: Text area for users to provide a description of the webinar.
- Webinar date and time: Date and time picker to schedule the webinar.
- Webinar host: Dropdown or input field to select the host(s) of the webinar.
- Webinar speakers: Option to add multiple speakers.
- Webinar image: Upload functionality for an image associated with the webinar.
- Registration link: A field for specifying a URL for webinar registration.
- Preview functionality: Allows the user to preview the webinar details before saving.
- Toggle Breakout Sessions (optional) & set max participants per group.

interface Webinar {
  id: string;
  title: string;
  description: string;
  date: Date;
  time: Date;
  hostId: string;
  speakers: string[];
  imageUrl: string | null;
  registrationLink: string | null;
  eventId: string;  // Linked to specific event
  createdAt: Date;
  updatedAt: Date;
}

# API Integration
- Create webinar endpoint: For creating a new webinar.
- Update webinar endpoint: For editing webinar details.
- Delete webinar endpoint: For removing a webinar.
- Webinar query endpoints: To retrieve webinar details associated with an event.
# Security
- Authentication: Required for creating and managing webinars.
- Authorization: Ensures that only authorised users can manage webinars for specific events.
- Input validation and sanitization: Ensures all input is validated before being saved to the database.