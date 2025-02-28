const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));

// Users in the room
const users = {};

// Socket.io connection
io.on('connection', (socket) => {
  console.log('New user connected:', socket.id);
  
  // User joins the event
  socket.on('userJoin', (userData) => {
    users[socket.id] = {
      id: socket.id,
      username: userData.username,
      avatar: userData.avatar,
      position: { x: 0, y: 0, z: 0 },
      rotation: { y: 0 }
    };
    
    // Broadcast to all clients that a new user has joined
    io.emit('userJoined', users[socket.id]);
    
    // Send the current users to the new user
    socket.emit('currentUsers', users);
  });
  
  // User moves in the 3D environment
  socket.on('move', (position) => {
    if (users[socket.id]) {
      users[socket.id].position = position;
      socket.broadcast.emit('userMoved', {
        id: socket.id,
        position: position
      });
    }
  });
  
  // User rotates in the 3D environment
  socket.on('rotate', (rotation) => {
    if (users[socket.id]) {
      users[socket.id].rotation = rotation;
      socket.broadcast.emit('userRotated', {
        id: socket.id,
        rotation: rotation
      });
    }
  });
  
  // User sends a public message
  socket.on('publicMessage', (message) => {
    const timestamp = new Date().toLocaleTimeString();
    io.emit('publicMessage', {
      id: socket.id,
      username: users[socket.id]?.username || 'Anonymous',
      message,
      timestamp
    });
  });
  
  // User requests private chat
  socket.on('requestPrivateChat', (targetId) => {
    io.to(targetId).emit('chatRequest', {
      from: socket.id,
      username: users[socket.id]?.username || 'Anonymous'
    });
  });
  
  // User accepts private chat request
  socket.on('acceptChatRequest', (fromId) => {
    io.to(fromId).emit('chatRequestAccepted', {
      with: socket.id,
      username: users[socket.id]?.username || 'Anonymous'
    });
  });
  
  // User sends a private message
  socket.on('privateMessage', ({ to, message }) => {
    const timestamp = new Date().toLocaleTimeString();
    io.to(to).emit('privateMessage', {
      from: socket.id,
      username: users[socket.id]?.username || 'Anonymous',
      message,
      timestamp
    });
  });
  
  // User disconnects
  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
    if (users[socket.id]) {
      io.emit('userLeft', socket.id);
      delete users[socket.id];
    }
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
}); 