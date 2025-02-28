# Event Search Page

The Event Search page allows users to search and view a list of events based on various filters and criteria. It is the page that users are directed to after initiating a search from the homepage.

## Directory Structure

```
/app/events/search/  # Event search page
```

## Event Search Page

Located at `/events/search/`, this page displays a list of events that match the user's search criteria, including various filtering and sorting options.

### Features
- **Search bar**: Input field for users to search events by keywords (e.g., event name, location, description).
- **Filters**: Users can filter events by:
  - Date (e.g., upcoming, past, specific date range)
  - Event type [Webinar, Workshop, Networking, Hackathon]
  - Host (name)

- **Event list**: Displays a paginated list of events matching the search criteria.
  - Each event listing includes:
    - Event name
    - Date and time
    - Description
    - Event Logo

- **Sort options**: Users can sort events by:
  - Date (e.g., upcoming or past)
  - Name (alphabetically)

- **Pagination**: Navigates through multiple pages of search results.

## Technical Details

### Data Models

Search results are derived from the following Prisma data model:

```typescript
interface Event {
  id: string;
  name: string;
  description: string;
  date: Date;
  location: string;
  eventLogo: string | null;
  hostId: string;
  createdAt: Date;
  updatedAt: Date;
}
```

### API Integration
- **Search event endpoint**: Returns events matching the search criteria and filters.
- **Filter events endpoint**: Allows filtering based on various attributes (date, location, type, etc.).
- **Sort events endpoint**: Enables sorting based on user preference.
- **Pagination endpoint**: Handles event list pagination to manage large result sets.

### Security
- **Authentication**: Not required for event search functionality, but users may be prompted to sign in for additional functionality (e.g., event registration).
- **Rate limiting**: To prevent abuse of the search functionality, rate limiting may be applied to the search API.
- **Input validation and sanitization**: Ensures search queries and filters are properly validated to prevent injection attacks.