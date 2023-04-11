const WebSocket = require('ws');
const socketController = require('../controllers/socket.controller');
const authMiddleware = require('../middlewares/authJwt');

// Create a new WebSocket server
const wss = new WebSocket.Server({ port: 8080 });

// Listen for incoming WebSocket connections
wss.on('connection', authMiddleware, socketController.handleWebSocketConnection);

module.exports = wss;