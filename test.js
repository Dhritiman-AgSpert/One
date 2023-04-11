// Import Socket.IO client library
const io = require('socket.io-client');

const socket = io('ws://localhost:8080', {
  auth: { token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY0MzUzZmU2Y2Y4OWVjYTZmZTQwMmJjZSIsImlhdCI6MTY4MTI1MDg0NiwiZXhwIjoxNjgxMzM3MjQ2fQ.QLt6_yKPD_rDLYfNYsJV50_Ru59EbeO89k3ZeBWLyts' },
});

// const socket = io('http://13.232.18.39/');

socket.on('connect', () => {
  console.log('Connected to WebSocket');
});

socket.on('dashboard', (data) => {
  console.log('Received data:', data);
});

socket.on('disconnect', () => {
  console.log('Disconnected from WebSocket');
});
