import { initThreeScene, addUserToScene, moveUser, rotateUser, removeUser } from './threeScene.js';
import { initSocket } from './socketHandler.js';

// DOM Elements
const landingPage = document.getElementById('landing-page');
const eventRoom = document.getElementById('event-room');
const usernameInput = document.getElementById('username');
const enterEventBtn = document.getElementById('enter-event-btn');
const avatarOptions = document.querySelectorAll('.avatar-option');
const chatInput = document.getElementById('chat-input');
const sendMessageBtn = document.getElementById('send-message-btn');
const chatMessages = document.getElementById('chat-messages');
const minimizeChat = document.getElementById('minimize-chat');
const privateChatContainer = document.getElementById('private-chat-container');
const privateChatUsername = document.getElementById('private-chat-username');
const privateChatMessages = document.getElementById('private-chat-messages');
const privateChatInput = document.getElementById('private-chat-input');
const sendPrivateMessageBtn = document.getElementById('send-private-message-btn');
const closePrivateChat = document.getElementById('close-private-chat');
const chatRequestPopup = document.getElementById('chat-request-popup');
const requesterUsername = document.getElementById('requester-username');
const acceptChatBtn = document.getElementById('accept-chat-btn');
const declineChatBtn = document.getElementById('decline-chat-btn');

// Global variables
let userData = {
  username: '',
  avatar: 'robot'
};
let socket;
let currentPrivateChatUser = null;

// Initialize
(function init() {
  // Enable/disable Enter Event button based on username input
  usernameInput.addEventListener('input', () => {
    enterEventBtn.disabled = !usernameInput.value.trim();
  });

  // Avatar selection
  avatarOptions.forEach(option => {
    option.addEventListener('click', () => {
      // Remove selected class from all options
      avatarOptions.forEach(opt => opt.classList.remove('selected'));
      // Add selected class to clicked option
      option.classList.add('selected');
      // Update selected avatar
      userData.avatar = option.dataset.avatar;
    });
  });

  // Enter Event button click
  enterEventBtn.addEventListener('click', enterEvent);

  // Enter key in username input
  usernameInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter' && usernameInput.value.trim()) {
      enterEvent();
    }
  });

  // Initialize minimizing chat
  minimizeChat.addEventListener('click', () => {
    const chatContainer = document.getElementById('chat-container');
    if (minimizeChat.textContent === '-') {
      chatMessages.style.display = 'none';
      document.querySelector('.chat-input-container').style.display = 'none';
      minimizeChat.textContent = '+';
    } else {
      chatMessages.style.display = 'flex';
      document.querySelector('.chat-input-container').style.display = 'flex';
      minimizeChat.textContent = '-';
    }
  });

  // Close private chat
  closePrivateChat.addEventListener('click', () => {
    privateChatContainer.classList.add('hidden');
    currentPrivateChatUser = null;
  });

  // Send public message
  sendMessageBtn.addEventListener('click', sendPublicMessage);
  chatInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      sendPublicMessage();
    }
  });

  // Send private message
  sendPrivateMessageBtn.addEventListener('click', sendPrivateMessage);
  privateChatInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      sendPrivateMessage();
    }
  });

  // Chat request actions
  acceptChatBtn.addEventListener('click', () => {
    const fromId = chatRequestPopup.dataset.fromId;
    socket.emit('acceptChatRequest', fromId);
    openPrivateChat(fromId, requesterUsername.textContent);
    chatRequestPopup.classList.add('hidden');
  });

  declineChatBtn.addEventListener('click', () => {
    chatRequestPopup.classList.add('hidden');
  });
})();

// Enter the event room
function enterEvent() {
  userData.username = usernameInput.value.trim();
  
  if (!userData.username) return;

  // Hide landing page, show event room
  landingPage.classList.add('hidden');
  eventRoom.classList.remove('hidden');

  // Initialize socket connection first
  socket = initSocket({
    userData,
    addUserToScene,
    moveUser,
    rotateUser,
    removeUser,
    addPublicMessage,
    handleChatRequest,
    handlePrivateMessage,
    handleChatRequestAccepted
  });

  // Initialize Three.js scene with the socket instance
  const { threeScene, camera, renderer, controls } = initThreeScene(socket);

  // Add event listeners for 3D interaction with other users
  renderer.domElement.addEventListener('click', (event) => {
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();
    
    // Calculate mouse position in normalized device coordinates
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
    
    // Update the raycaster
    raycaster.setFromCamera(mouse, camera);
    
    // Calculate objects intersecting the ray
    const intersects = raycaster.intersectObjects(threeScene.children, true);
    
    if (intersects.length > 0) {
      // Check if we're intersecting with a user avatar
      const clickedObject = intersects[0].object;
      const userId = clickedObject.userData.userId;
      
      if (userId && userId !== socket.id) {
        // Request private chat with this user
        socket.emit('requestPrivateChat', userId);
      }
    }
  });
}

// Send public message
function sendPublicMessage() {
  const message = chatInput.value.trim();
  if (message) {
    socket.emit('publicMessage', message);
    chatInput.value = '';
  }
}

// Add message to public chat
function addPublicMessage(messageData) {
  const { id, username, message, timestamp } = messageData;
  
  const messageElement = document.createElement('div');
  messageElement.classList.add('message');
  
  const isCurrentUser = id === socket.id;
  
  messageElement.innerHTML = `
    <span class="sender">${isCurrentUser ? 'You' : username}</span>
    <span class="timestamp">${timestamp}</span>
    <div class="content">${message}</div>
  `;
  
  chatMessages.appendChild(messageElement);
  chatMessages.scrollTop = chatMessages.scrollHeight;
}

// Handle chat request
function handleChatRequest(data) {
  const { from, username } = data;
  
  requesterUsername.textContent = username;
  chatRequestPopup.dataset.fromId = from;
  chatRequestPopup.classList.remove('hidden');
}

// Open private chat
function openPrivateChat(userId, username) {
  currentPrivateChatUser = userId;
  privateChatUsername.textContent = `Chat with ${username}`;
  privateChatMessages.innerHTML = '';
  privateChatContainer.classList.remove('hidden');
}

// Send private message
function sendPrivateMessage() {
  const message = privateChatInput.value.trim();
  
  if (message && currentPrivateChatUser) {
    socket.emit('privateMessage', {
      to: currentPrivateChatUser,
      message
    });
    
    const timestamp = new Date().toLocaleTimeString();
    
    // Add message to our private chat window
    const messageElement = document.createElement('div');
    messageElement.classList.add('message');
    messageElement.innerHTML = `
      <span class="sender">You</span>
      <span class="timestamp">${timestamp}</span>
      <div class="content">${message}</div>
    `;
    
    privateChatMessages.appendChild(messageElement);
    privateChatMessages.scrollTop = privateChatMessages.scrollHeight;
    
    privateChatInput.value = '';
  }
}

// Handle private message
function handlePrivateMessage(data) {
  const { from, username, message, timestamp } = data;
  
  // If we don't have a private chat open with this user, open one
  if (currentPrivateChatUser !== from) {
    openPrivateChat(from, username);
  }
  
  // Add message to private chat window
  const messageElement = document.createElement('div');
  messageElement.classList.add('message');
  messageElement.innerHTML = `
    <span class="sender">${username}</span>
    <span class="timestamp">${timestamp}</span>
    <div class="content">${message}</div>
  `;
  
  privateChatMessages.appendChild(messageElement);
  privateChatMessages.scrollTop = privateChatMessages.scrollHeight;
}

// Handle chat request accepted
function handleChatRequestAccepted(data) {
  const { with: userId, username } = data;
  openPrivateChat(userId, username);
} 