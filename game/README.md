# GatherX - The AI-Enhanced Event Universe (Localhost Version)

GatherX is a virtual event platform that allows users to join events, create avatars, and interact with others in a 3D environment. This is a simplified localhost version of the platform, focusing on core functionality.

## Features

- **Event Entry**: Simple landing page with "Enter Event" button to access the 3D space
- **Character Creation**: Choose an avatar from predefined options
- **3D Environment**: A Doom-like dark aesthetic room for exploration
- **Public Lobby Chat**: Text-based chat visible to all event participants
- **Request to Talk**: Click on another user's avatar to request a private conversation

## Prerequisites

- Node.js (v14 or higher)
- npm (v6 or higher)

## Installation

1. Clone the repository:
   ```
   git clone <repository-url>
   cd gatherx
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Run the application:
   ```
   npm start
   ```

4. Open your browser and navigate to:
   ```
   http://localhost:3000
   ```

## How to Use

1. Enter your username and select an avatar on the landing page
2. Click the "Enter Event" button to join the 3D environment
3. Use WASD keys to move around and mouse to look around
4. Click on another user's avatar to request a private chat
5. Use the public chat on the right side to communicate with everyone

## Controls

- **W/A/S/D** or **Arrow Keys**: Move around
- **Mouse**: Look around
- **Click on Users**: Request private chat
- **ESC**: Exit pointer lock (to use the UI)

## Development

This application uses:
- Express.js for the server
- Socket.io for real-time communication
- Three.js for 3D rendering

## License

MIT 