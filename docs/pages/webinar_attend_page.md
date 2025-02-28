# Webinar Attendance Page

This page provides real-time webinar attendance functionality with screen sharing and chat capabilities.

## Features

- Live webinar streaming
- Host screen sharing
- Real-time chat
- Participant list
- Basic webinar controls
- Breakout rooms with timer


## Components

### Screen Sharing Display

The main content area displays the host's shared screen or presentation:

```jsx
<WebinarDisplay
  hostId={hostId}
  streamId={streamId}
  isActive={isScreenSharing}
/>
```

### Chat Box

A real-time chat component allows participants to communicate during the webinar:

```jsx
<WebinarChat
  webinarId={webinarId}
  userId={currentUser.id}
  role={userRole}
/>
```

### Breakout Room

A component to handle breakout room functionality, including a timer and filtered chat:

```javascript
<BreakoutRoom
  breakoutGroupId={breakoutGroupId}
  endBreakoutSession={endBreakoutSession}
/>
```

## User Roles

### Host Controls
- Start/Stop screen sharing
- Mute/Unmute participants
- Remove participants
- End webinar session
- Start breakout session (if configured)
- End breakout session


### Participant Features
- View shared screen
- Send chat messages
- Raise hand
- Leave webinar
- Join breakout room

## Technical Implementation

### WebRTC Integration

The screen sharing functionality utilizes WebRTC for low-latency video streaming:

```javascript
const startScreenShare = async () => {
  try {
    const stream = await navigator.mediaDevices.getDisplayMedia({
      video: true,
      audio: true
    });
    // Handle stream
  } catch (error) {
    console.error('Error accessing screen share:', error);
  }
};
```

### Chat Implementation

Real-time chat uses WebSocket connections for instant message delivery:

```javascript
const webSocket = new WebSocket(CHAT_SERVER_URL);

webSocket.onmessage = (event) => {
  const message = JSON.parse(event.data);
  updateChatMessages(message);
};
```
## Breakout Room Implementation
Breakout rooms use WebSocket connections for group-specific chat and a timer to manage session duration:

```javascript
import React, { useState, useEffect } from 'react';

const BreakoutRoom = ({ breakoutGroupId, endBreakoutSession }) => {
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes for example
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prevTime => prevTime - 1);
    }, 1000);

    if (timeLeft <= 0) {
      clearInterval(timer);
      endBreakoutSession();
    }

    return () => clearInterval(timer);
  }, [timeLeft, endBreakoutSession]);

  useEffect(() => {
    const webSocket = new WebSocket(`CHAT_SERVER_URL/breakout/${breakoutGroupId}`);

    webSocket.onmessage = (event) => {
      const message = JSON.parse(event.data);
      setMessages(prevMessages => [...prevMessages, message]);
    };

    return () => webSocket.close();
  }, [breakoutGroupId]);

  return (
    <div>
      <h2>Breakout Room</h2>
      <p>Time left: {Math.floor(timeLeft / 60)}:{timeLeft % 60}</p>
      <div className="chat-box">
        {messages.map((msg, index) => (
          <div key={index}>{msg.user}: {msg.text}</div>
        ))}
      </div>
    </div>
  );
};

export default BreakoutRoom;
```

## Error Handling

Common error scenarios and their handling:

1. Screen share permission denied
2. Connection loss
3. Browser compatibility issues

## Browser Support

Supported browsers:
- Chrome (version 72+)
- Firefox (version 66+)
- Safari (version 13+)
- Edge (version 79+)

## Related Documentation

- [WebRTC Setup Guide](./webrtc_setup.md)
- [Chat System Integration](./chat_integration.md)
- [User Authentication](./auth.md)