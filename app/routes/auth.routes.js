const express = require('express');
const router = express.Router();
const { body, param } = require('express-validator');
const authController = require('../controllers/auth.controller');
const User = require('../models/user.model');
const authMiddleware = require('../middlewares/authJwt');

// Register a new user
router.post(
  '/register',
  [
    body('name').notEmpty(),
    body('email').isEmail(),
    body('phone')
      .isMobilePhone('any')
      .custom(async (phone) => {
        const existingUser = await User.findOne({ phone });
        if (existingUser) {
          return Promise.reject('Phone number already in use');
        }
      }),
    body('password').isLength({ min: 6 }),
  ],
  authController.registerUser
);

// Login a user
router.post(
  '/login',
  [
    body('phone').isMobilePhone('any'),
    body('otp').isAlphanumeric().isLength({ min: 6, max: 6 }),
  ],
  authController.login
);

// Verify user email
router.get(
  '/verify-email',
  [
    param('email').isEmail(),
    param('otp').isAlphanumeric().isLength({ min: 6, max: 6 }),
  ],
  authController.verifyEmail
);

// send phone otp
router.post(
  '/send-phone-otp',
  [
    body('phone').isMobilePhone('any'),
  ],
  authController.sendPhoneOTP
);

module.exports = router;
