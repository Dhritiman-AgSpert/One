const io = require('socket.io-client');
const jwt = require('jsonwebtoken');
const http = require('http');
const express = require('express');
const mongoose = require('mongoose');
const cors = require("cors");
const authRoutes = require('./app/routes/auth.routes');
const userRoutes = require('./app/routes/user.routes');
const authConfig = require('./app/config/auth.config.js');

const app = express();
var corsOptions = {
    origin: '*'
};
app.use(cors(corsOptions));
app.use(express.json());

// Connect to MongoDB
mongoose
    .connect('mongodb://127.0.0.1:27017/one_db', { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('Connected to MongoDB'))
    .catch((err) => console.error('Failed to connect to MongoDB', err));

// Register routes
app.use('/auth', authRoutes);
app.use('/user', userRoutes);


// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err);
    res.status(500).json({ message: 'Internal server error' });
});

// Initialize HTTP server
const httpServer = http.createServer(app);

// Initialize WebSocket server
const ioServer = require('socket.io')(httpServer, {
    cors: {
        origin: '*',
    },
});

// Add authentication middleware to the ioServer object
ioServer.use((socket, next) => {
    const token = socket.handshake.auth.token;
    console.log(token)
    try {
        const decoded = jwt.verify(token, authConfig.JWT_SECRET);
        socket.userId = decoded.id;
        next();
    } catch (err) {
        return next(new Error('Invalid token'));
    }
});

ioServer.on('connection', (socket) => {
    console.log('A client connected to the WebSocket');

    // Connect to remote socket server
    const a = io.connect('http://13.232.18.39/');

    // Listen for 'dashboard' event on remote socket server
    a.on('dashboard', (data) => {
        // Forward received data to Socket.IO server on HTTP server
        ioServer.emit('dashboard', data);
    });

    socket.on('disconnect', () => {
        console.log('A client disconnected from the WebSocket');
    });
});


// Start servers
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`HTTP server started on port ${PORT}`);
});

const WEBSOCKET_PORT = 8080;
httpServer.listen(WEBSOCKET_PORT, () => {
    console.log(`WebSocket server started on port ${WEBSOCKET_PORT}`);
});
