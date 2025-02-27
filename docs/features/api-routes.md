# API Routes

GatherX implements a comprehensive API system using Next.js API routes. These routes handle all server-side operations and data management.

## Base URL
All API routes are prefixed with `/api/`

## Available Endpoints

### User Management
- `GET /api/user` - Get current user information
- `PUT /api/user` - Update user profile
- `GET /api/user/events` - Get user's events (both registered and hosted)

### Event Management
- `GET /api/events` - List events with pagination and filters
- `POST /api/events` - Create a new event
- `GET /api/events/:id` - Get event details
- `PUT /api/events/:id` - Update event details
- `DELETE /api/events/:id` - Delete an event

### Event Registration
- `POST /api/events/:id/register` - Register for an event
- `DELETE /api/events/:id/register` - Cancel registration
- `GET /api/events/:id/attendees` - List event attendees

## Authentication
- All routes are protected by authentication middleware
- Uses Next.js middleware for route protection
- JWT-based authentication system

## Response Format
```typescript
interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    message: string;
    code: string;
  };
}
```

## Error Handling
- Standard HTTP status codes
- Detailed error messages
- Validation error responses

## Rate Limiting
- Implements rate limiting for API endpoints
- Prevents abuse and ensures fair usage

## Data Validation
- Input validation using validation schemas
- Sanitization of user inputs
- Type checking with TypeScript

## Security Measures
- CORS configuration
- CSRF protection
- Input sanitization
- Request size limits 