const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});
const cors = require('cors');
const path = require('path');

// Production settings
const PORT = process.env.PORT || 3000;
const HOST = '0.0.0.0';  // Required for Render

app.use(cors());
app.use(express.static(path.join(__dirname, 'public')));

// Add this route explicitly
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Store connected users
const users = new Map();

io.on('connection', (socket) => {
    console.log('A user connected');

    socket.on('user_join', (username) => {
        console.log(`${username} joined the chat`);
        users.set(socket.id, username);
        io.emit('user_list', Array.from(users.values()));
        io.emit('chat_message', {
            type: 'system',
            message: `${username} joined the chat`
        });
    });

    socket.on('send_message', (message) => {
        const username = users.get(socket.id);
        io.emit('chat_message', {
            type: 'message',
            username: username,
            message: message
        });
    });

    socket.on('disconnect', () => {
        const username = users.get(socket.id);
        users.delete(socket.id);
        io.emit('user_list', Array.from(users.values()));
        if (username) {
            io.emit('chat_message', {
                type: 'system',
                message: `${username} left the chat`
            });
        }
    });
});

http.listen(PORT, HOST, () => {
    console.log(`Server is running on port ${PORT}`);
});