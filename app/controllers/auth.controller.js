const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const nodemailer = require('nodemailer');
const otpGenerator = require('otp-generator');
const User = require('../models/user.model');
const mail = require('../config/mail.config');
const authConfig = require('../config/auth.config');
const { validationResult } = require('express-validator');
const twilio = require('twilio');
const fs = require('fs')

const transporter = nodemailer.createTransport(mail);

exports.registerUser = async function (req, res, next) {
    try {
        console.log(req.body)
        const { name, email, phone, image_filename } = req.body;

        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'User already exists' });
        }

        // Generate OTP code
        const phoneOtp = otpGenerator.generate(6, { upperCase: false, specialChars: false });
        const emailOtp = otpGenerator.generate(6, { upperCase: false, specialChars: false });

        const image = {
            data: fs.readFileSync(image_filename),
            contentType: 'image/png'
        };

        // Create user
        const user = new User({
            name,
            email,
            phone,
            image,
            phone_otp: phoneOtp,
            email_otp: emailOtp,
        });

        // Send phone otp
        console.log("phone OTP is : " + phoneOtp)
        // const twilioClient = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
        // try {
        //     const verification = await twilioClient.verify.services(process.env.TWILIO_VERIFY_SERVICE_SID).verifications.create({
        //         to: phone,
        //         channel: 'sms',
        //         customCode: phoneOtp,
        //     });

        //     console.log(verification.status); // Outputs 'pending' if the OTP was sent successfully
        // } catch (err) {
        //     console.error(err);
        // }

        // Send verification email
        const verificationLink = `http://localhost:3000/auth/verify-email?email=${email}&otp=${emailOtp}`;
        const mailOptions = {
            from: mail.auth.user,
            to: email,
            subject: 'Verify your email address',
            html: `<p>Click <a href="${verificationLink}">here</a> to verify your email address.</p>`,
        };
        await transporter.sendMail(mailOptions);

        // Save user
        await user.save();

        res.status(201).json({ message: 'User created' });
    } catch (err) {
        next(err);
    }
};

exports.verifyEmail = async (req, res, next) => {
    try {
        const { email, otp } = req.query;

        // Find user by email and OTP code
        const user = await User.findOne({ email, email_otp: otp });
        if (!user) {
            return res.status(400).json({ message: 'Invalid email or OTP code' });
        }

        // Update user to mark email as verified
        user.isEmailVerified = true;
        user.email_otp = null;
        await user.save();

        res.status(200).json({ message: 'Email verified' });
    } catch (err) {
        next(err);
    }
};

exports.login = async function (req, res, next) {
    try {
        const { phone, otp } = req.body;

        // Find user by phone number
        const user = await User.findOne({ phone: phone });
        if (!user) {
            return res.status(400).json({ message: 'User not found' });
        }

        // Check if email is verified and OTP is valid
        if (user.phone_otp !== otp) {
            return res.status(400).json({ message: 'Invalid phone otp' });
        }
        if (!user.isEmailVerified) {
            return res.status(400).json({ message: 'Email not verified' });
        }

        // Generate JWT token
        const token = jwt.sign({ id: user._id }, authConfig.JWT_SECRET, {
            expiresIn: 86400 // 24 hours
        });

        user.phone_otp = null
        await user.save()

        res.status(200).json({ token });
    } catch (err) {
        next(err);
    }
};

exports.sendPhoneOTP = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { phone } = req.body;

    try {
        // Find user by phone number
        const user = await User.findOne({ phone });
        if (!user) {
            return res.status(400).json({ message: 'User not found' });
        }

        const phoneOtp = otpGenerator.generate(6, { upperCase: false, specialChars: false });

        // Send phone otp
        console.log("phone OTP is : " + phoneOtp)
        // const twilioClient = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
        // try {
        //     const verification = await twilioClient.verify.services(process.env.TWILIO_VERIFY_SERVICE_SID).verifications.create({
        //         to: phone,
        //         channel: 'sms',
        //         customCode: phoneOtp,
        //     });

        //     console.log(verification.status); // Outputs 'pending' if the OTP was sent successfully
        // } catch (err) {
        //     console.error(err);
        // }

        user.phone_otp = phoneOtp
        await user.save()

        res.status(200).json({ message: 'otp sent.' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Internal server error' });
    }
};
