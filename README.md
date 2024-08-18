# WebSocket Chat Server

This project implements a simple WebSocket-based chat server using Node.js and Express. The server allows multiple users to connect, exchange messages, and receive real-time updates about the users and messages.

## Features

- **Real-Time Communication:** Users can send and receive messages in real-time via WebSocket connections.
- **User Management:** The server tracks connected users and sends updates to all users whenever the user list changes.
- **Message Storage:** Messages are stored by channels, which are identified by the combination of two users' names.
- **Personalized Updates:** Each user receives personalized updates on the list of users and their most recent chat history.

## Code Overview

### Main Components

- **Express Server with CORS:** 
  - The server is created using Express, and CORS is enabled to allow cross-origin requests.

- **WebSocket Server:**
  - The WebSocket server is created and attached to the Express server, allowing bi-directional communication between the client and server.

- **User and Message Storage:**
  - Users and messages are stored in memory using objects. Each channel between two users is identified by a unique key created by sorting and joining their usernames.

### Utility Functions

- `createChannelKey(user1, user2)`: 
  - Generates a unique key for the chat channel between two users.

- `getMostRecentMessage(user1, user2)`:
  - Retrieves the most recent message exchanged between two users.

- `createPersonalizedUpdateUsersEvent(currentUser)`:
  - Creates a personalized update event for a user, listing other users and their most recent message.

- `broadcastPersonalizedUpdate()`:
  - Sends personalized updates to all connected users.

### WebSocket Events

- **Connection Event (`connect`):**
  - When a user connects, their name is registered, and a personalized user update is broadcast to all users.

- **Message Event (`message`):**
  - When a user sends a message, it is stored in the appropriate channel and sent to both the sender and receiver. A personalized user update is then broadcast to all users.

- **Close Event (`close`):**
  - When a user disconnects, they are removed from the user list, and a personalized user update is broadcast to all users.

### Message Models

- `createMessage(from, target, content)`:
  - Creates a message object containing the sender, recipient, and content of the message.

- `createMessageEvent(message)`:
  - Creates a message event object to be sent via WebSocket.

## Getting Started

### Prerequisites

- Node.js installed on your machine.

### Installation

1. Clone the repository.
2. Navigate to the project directory.
3. Install the dependencies:
   ```bash
   npm install
   ```

### Running the Server

To start the WebSocket server, run:

```bash
node server.js
```

The server will start on port `8080`.

### Connecting to the Server

You can connect to the WebSocket server using a WebSocket client on `ws://localhost:8080`.

## Notes

- This is a basic implementation and stores data in memory, meaning all data will be lost when the server is restarted.
- For production, consider adding persistence (e.g., using a database) and enhancing error handling.