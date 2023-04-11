const io = require('socket.io-client');
const socketAuthMiddleware = require('../middlewares/socketAuth');
const remoteSocketUrl = 'http://13.232.18.39/';

module.exports = function(ioServer) {
  // Add authentication middleware to the ioServer object
  ioServer.use(socketAuthMiddleware());

  ioServer.on('connection', (socket) => {
    console.log('A client connected to the WebSocket');

    // Connect to remote socket server
    const a = io.connect(remoteSocketUrl);

    // Listen for 'dashboard' event on remote socket server
    a.on('dashboard', (data) => {
      // Forward received data to Socket.IO server on HTTP server
      ioServer.emit('dashboard', data);
    });

    socket.on('disconnect', () => {
      console.log('A client disconnected from the WebSocket');
    });
  });
};
