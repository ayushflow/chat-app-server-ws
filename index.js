const WebSocket = require('ws');
const express = require('express');
const http = require('http');
const cors = require('cors');

const app = express();

// Allow all CORS
app.use(cors());

const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

let users = {}; // Store connected users
let messages = {}; // Store messages by channel

// Utility function to create a channel key
function createChannelKey(user1, user2) {
    return [user1, user2].sort().join(':');
}

// Utility function to get the most recent message between two users
function getMostRecentMessage(user1, user2) {
    const channelKey = createChannelKey(user1, user2);
    const channelMessages = messages[channelKey];
    return channelMessages && channelMessages.length > 0
        ? channelMessages[channelMessages.length - 1]
        : null;
}

// Utility function to create a personalized update_users event
function createPersonalizedUpdateUsersEvent(currentUser) {
    const otherUsers = Object.keys(users).filter((user) => user !== currentUser);
    const recentChats = otherUsers.map((user) => ({
        username: user,
        message: getMostRecentMessage(currentUser, user),
    }));
    return {
        type: 'update_users',
        chats: recentChats,
    };
}

// Function to broadcast personalized update_users event to every user
function broadcastPersonalizedUpdate() {
    Object.keys(users).forEach((user) => {
        const personalizedUpdate = createPersonalizedUpdateUsersEvent(user);
        users[user].send(JSON.stringify(personalizedUpdate));
    });
}

wss.on('connection', (ws) => {
    ws.on('message', (rawEventData) => {
        const parsedEventData = JSON.parse(rawEventData);
        const { type } = parsedEventData;

        if (type === 'connect') {
            const { name } = parsedEventData;
            ws.name = name;
            users[name] = ws;

            // Broadcast personalized updates to all users
            broadcastPersonalizedUpdate();
        } else if (type === 'message') {
            const { message } = parsedEventData;
            const { target, content } = JSON.parse(message);
            const channelKey = createChannelKey(ws.name, target);

            // Initialize the channel if it doesn't exist
            if (!messages[channelKey]) {
                messages[channelKey] = [];
            }

            const newMessage = createMessage(ws.name, target, content);

            // Store the message in the appropriate channel
            messages[channelKey].push(newMessage);

            const newMessageEvent = createMessageEvent(newMessage);

            // Send the message to both users
            if (users[ws.name]) {
                users[ws.name].send(JSON.stringify(newMessageEvent));
            }
            if (users[target]) {
                users[target].send(JSON.stringify(newMessageEvent));
            }

            // Broadcast personalized updates to all users after a new message
            broadcastPersonalizedUpdate();
        } else if (type === 'close') {
            delete users[ws.name];
            // Broadcast personalized updates to all users when a user disconnects
            broadcastPersonalizedUpdate();
        }
    });
});

// Event Data Models
function createMessage(from, target, content) {
    return {
        from: from,
        target: target,
        content: content,
    };
}

function createMessageEvent(message) {
    return {
        type: 'message',
        message: message,
    };
}

server.listen(8080, () => {
    console.log('WebSocket server started on port 8080');
});