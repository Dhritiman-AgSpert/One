const jwt = require('jsonwebtoken');
const User = require('../models/user.model');
const authConfig = require('../config/auth.config');

module.exports = (req, res, next) => {
  // Get the token from the request header
  const token = req.header('Authorization')?.replace('Bearer ', '');
  if (!token) {
    return res.status(401).json({ message: 'Authorization header missing' });
  }

  try {
    // Verify the token
    const decoded = jwt.verify(token, authConfig.JWT_SECRET);
    req.userId = decoded.id;
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Invalid token' });
  }
};
