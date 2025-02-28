'use client';

import { Event } from '@/app/models/event';

type Session = Event['sessions'][number];

interface Tag {
  id: string;
  name: string;
}

interface SessionListProps {
  sessions: Session[];
}

export function SessionList({ sessions }: SessionListProps) {
  if (!sessions || sessions.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold text-gray-900">Sessions</h2>
      <div className="grid gap-4">
        {sessions.map((session) => (
          <div
            key={session.id}
            className="bg-white rounded-lg shadow-sm p-4 border border-gray-200"
          >
            <h3 className="font-semibold text-gray-900">{session.title}</h3>
            <div className="mt-2 text-sm text-gray-600">
              <div className="flex items-center space-x-2">
                <span>{new Date(session.startTime).toLocaleTimeString()}</span>
                <span>-</span>
                <span>{new Date(session.endTime).toLocaleTimeString()}</span>
              </div>
              <div className="mt-1">Speaker: {session.speaker}</div>
            </div>
            <p className="mt-2 text-sm text-gray-500">{session.description}</p>
            <div className="mt-2 flex items-center justify-between">
              <div className="flex gap-2">
                {session.tags.map((tag) => (
                  <span
                    key={tag.id}
                    className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800"
                  >
                    {tag.name}
                  </span>
                ))}
              </div>
              <span className="text-sm text-gray-600">
                {session._count.attendees} {session._count.attendees === 1 ? 'attendee' : 'attendees'}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
} 