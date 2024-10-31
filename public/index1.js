// Initialize Socket.IO
const socket = io(window.location.origin);
let username = '';

// DOM Elements
const messagesContainer = document.getElementById('chat-messages');
const messageInput = document.getElementById('message-input');
const usersList = document.getElementById('users-list');
const loginScreen = document.getElementById('login-screen');
const chatScreen = document.getElementById('chat-screen');

// Join Chat Function
function joinChat() {
    const usernameInput = document.getElementById('username-input');
    username = usernameInput.value.trim();
    
    if (username) {
        socket.emit('user_join', username);
        loginScreen.style.display = 'none';
        chatScreen.style.display = 'flex';
        
        // Update profile username
        document.querySelector('.user-profile .username').textContent = username;
    }
}

// Message Templates
function createMessage(text, type, user = '') {
    const messageDiv = document.createElement('div');
    
    if (type === 'system') {
        messageDiv.className = 'system-message';
        messageDiv.textContent = text;
    } else {
        messageDiv.className = `message ${type}`;
        if (user && user !== username) {
            messageDiv.textContent = `${user}: ${text}`;
        } else {
            messageDiv.textContent = text;
        }
    }
    
    return messageDiv;
}

// Send Message Function
function sendMessage() {
    const text = messageInput.value.trim();
    
    if (text !== '') {
        socket.emit('send_message', text);
        messageInput.value = '';
    }
}

// Socket Event Handlers
socket.on('chat_message', (data) => {
    let messageDiv;
    
    if (data.type === 'system') {
        messageDiv = createMessage(data.message, 'system');
    } else {
        const messageType = data.username === username ? 'sent' : 'received';
        messageDiv = createMessage(data.message, messageType, data.username);
    }
    
    messagesContainer.appendChild(messageDiv);
    scrollToBottom();
});

socket.on('user_list', (users) => {
    usersList.innerHTML = '';
    users.forEach(user => {
        const li = document.createElement('li');
        li.textContent = user;
        if (user === username) {
            li.style.fontWeight = 'bold';
        }
        usersList.appendChild(li);
    });
});

// Utility Functions
function scrollToBottom() {
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

// Event Listeners
messageInput.addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
        sendMessage();
    }
});

// Emoji button functionality
const emojiBtn = document.querySelector('.emoji-btn');
emojiBtn.addEventListener('click', () => {
    const emojis = ['😊', '😂', '❤️', '👍', '🎉'];
    const randomEmoji = emojis[Math.floor(Math.random() * emojis.length)];
    messageInput.value += randomEmoji;
    messageInput.focus();
});

// Handle page refresh/close
window.addEventListener('beforeunload', () => {
    socket.disconnect();
});

// Initial scroll to bottom
scrollToBottom();