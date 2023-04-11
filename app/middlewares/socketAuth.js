const jwt = require('jsonwebtoken');
const authConfig = require('../config/auth.config.js');

module.exports = function() {
  return (socket, next) => {
    const token = socket.handshake.auth.token;
    console.log(token);
    try {
      const decoded = jwt.verify(token, authConfig.JWT_SECRET);
      socket.userId = decoded.id;
      next();
    } catch (err) {
      return next(new Error('Invalid token'));
    }
  };
};
