// Import required modules
const io = require('socket.io-client');
const jwt = require('jsonwebtoken');
const http = require('http');
const express = require('express');
const mongoose = require('mongoose');
const cors = require("cors");

// Import configuration
const authConfig = require('./app/config/auth.config');

// Import websocketController
const websocketController = require('./app/controllers/websocket.controller')

// Import routes
const authRoutes = require('./app/routes/auth.routes');
const userRoutes = require('./app/routes/user.routes');

// Initialize express app
const app = express();

// Configure CORS middleware
var corsOptions = {
    origin: '*'
};
app.use(cors(corsOptions));

// Parse request body as JSON
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

// Attach WebSocket event listeners
websocketController(ioServer);

// Start HTTP server
const HTTP_PORT = 3000;
httpServer.listen(HTTP_PORT, () => {
    console.log(`HTTP server started on port ${HTTP_PORT}`);
});

// Start WebSocket server
const WEBSOCKET_PORT = 8080;
httpServer.listen(WEBSOCKET_PORT, () => {
    console.log(`WebSocket server started on port ${WEBSOCKET_PORT}`);
});