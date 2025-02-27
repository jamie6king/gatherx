'use client';

import { useState } from 'react';
import { format } from 'date-fns';

interface Tag {
  id: string;
  name: string;
}

interface Session {
  id: string;
  title: string;
  description: string;
  speaker: string;
  startTime: Date;
  endTime: Date;
  format: string;
  tags: Tag[];
  _count: {
    attendees: number;
  };
}

interface SessionListProps {
  sessions: Session[];
}

export default function SessionList({ sessions }: SessionListProps) {
  const [activeFilter, setActiveFilter] = useState('all');
  const [selectedSessions, setSelectedSessions] = useState<string[]>([]);

  const toggleSessionSelection = (sessionId: string) => {
    setSelectedSessions((prev) =>
      prev.includes(sessionId)
        ? prev.filter((id) => id !== sessionId)
        : [...prev, sessionId]
    );
  };

  // Filter sessions based on the active filter
  const filteredSessions = sessions;

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-semibold mb-4">Event Schedule</h2>
      
      {/* Session Filters */}
      <div className="mb-6 flex flex-wrap gap-2">
        <button 
          className={`px-3 py-1 rounded-full text-sm ${
            activeFilter === 'all' 
              ? 'bg-primary text-white' 
              : 'bg-gray-100 text-gray-700'
          }`}
          onClick={() => setActiveFilter('all')}
        >
          All Sessions
        </button>
        <button 
          className={`px-3 py-1 rounded-full text-sm ${
            activeFilter === 'interest' 
              ? 'bg-primary text-white' 
              : 'bg-gray-100 text-gray-700'
          }`}
          onClick={() => setActiveFilter('interest')}
        >
          By Interest
        </button>
        <button 
          className={`px-3 py-1 rounded-full text-sm ${
            activeFilter === 'speaker' 
              ? 'bg-primary text-white' 
              : 'bg-gray-100 text-gray-700'
          }`}
          onClick={() => setActiveFilter('speaker')}
        >
          By Speaker
        </button>
        <button 
          className={`px-3 py-1 rounded-full text-sm ${
            activeFilter === 'format' 
              ? 'bg-primary text-white' 
              : 'bg-gray-100 text-gray-700'
          }`}
          onClick={() => setActiveFilter('format')}
        >
          By Format
        </button>
      </div>
      
      {/* Session List */}
      <div className="space-y-4">
        {filteredSessions.length === 0 ? (
          <p className="text-gray-500 text-center py-4">No sessions found</p>
        ) : (
          filteredSessions.map((session) => (
            <div key={session.id} className="border border-gray-200 rounded-md p-4">
              <div className="flex items-start justify-between mb-2">
                <h3 className="text-lg font-medium">{session.title}</h3>
                <div className="text-sm text-gray-500">
                  {format(new Date(session.startTime), 'h:mm a')} - {format(new Date(session.endTime), 'h:mm a')}
                </div>
              </div>
              <p className="text-gray-600 mb-2">{session.description}</p>
              <p className="text-gray-700 text-sm mb-2">Speaker: {session.speaker}</p>
              <div className="flex items-center justify-between">
                <div className="flex flex-wrap gap-2">
                  {session.tags.map((tag: Tag) => (
                    <span key={tag.id} className="bg-gray-100 text-gray-600 px-2 py-1 rounded-md text-xs">
                      {tag.name}
                    </span>
                  ))}
                  <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded-md text-xs">
                    {session.format}
                  </span>
                </div>
                <div className="text-gray-500 text-xs flex items-center">
                  <span>{session._count.attendees} Attendees</span>
                  <input 
                    type="checkbox" 
                    id={`session-${session.id}`} 
                    className="ml-2" 
                    checked={selectedSessions.includes(session.id)}
                    onChange={() => toggleSessionSelection(session.id)}
                    aria-label={`Select ${session.title}`}
                  />
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
} 