// Socket handling module
export function initSocket({
  userData,
  addUserToScene,
  moveUser,
  rotateUser,
  removeUser,
  addPublicMessage,
  handleChatRequest,
  handlePrivateMessage,
  handleChatRequestAccepted
}) {
  const socket = io();

  // Join the event with user data
  socket.emit('userJoin', userData);

  // Handle current users in the room
  socket.on('currentUsers', (users) => {
    // Add existing users to the scene
    Object.values(users).forEach(user => {
      if (user.id !== socket.id) {
        addUserToScene(user);
      }
    });
  });

  // New user joined
  socket.on('userJoined', (user) => {
    if (user.id !== socket.id) {
      addUserToScene(user);
      
      // System message in chat
      const systemMessage = {
        id: 'system',
        username: 'System',
        message: `${user.username} has joined the event`,
        timestamp: new Date().toLocaleTimeString()
      };
      addPublicMessage(systemMessage);
    }
  });

  // User moved
  socket.on('userMoved', (data) => {
    moveUser(data.id, data.position);
  });

  // User rotated
  socket.on('userRotated', (data) => {
    rotateUser(data.id, data.rotation);
  });

  // User left
  socket.on('userLeft', (userId) => {
    removeUser(userId);
    
    // System message in chat
    const systemMessage = {
      id: 'system',
      username: 'System',
      message: `A user has left the event`,
      timestamp: new Date().toLocaleTimeString()
    };
    addPublicMessage(systemMessage);
  });

  // Public message received
  socket.on('publicMessage', (messageData) => {
    addPublicMessage(messageData);
  });

  // Chat request received
  socket.on('chatRequest', (data) => {
    handleChatRequest(data);
  });

  // Chat request accepted
  socket.on('chatRequestAccepted', (data) => {
    handleChatRequestAccepted(data);
  });

  // Private message received
  socket.on('privateMessage', (data) => {
    handlePrivateMessage(data);
  });

  // Handle player movement and send updates to server
  document.addEventListener('keydown', (e) => {
    // Send position update to server when user moves
    // This will be handled by the threeScene.js controls
  });

  return socket;
} 