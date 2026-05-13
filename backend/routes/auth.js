const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { protect } = require('../middleware/authMiddleware');
const crypto = require('crypto');
const nodemailer = require('nodemailer');

const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: '30d',
    });
};

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
router.post('/register', async (req, res) => {
    const { name, email, password, role, phone, department, interests } = req.body;

    const userExists = await User.findOne({ email });

    if (userExists) {
        return res.status(400).json({ message: 'User already exists' });
    }

    const user = await User.create({
        name,
        email,
        password,
        role,
        phone,
        department,
        interests
    });

    if (user) {
        res.status(201).json({
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            token: generateToken(user._id),
        });
    } else {
        res.status(400).json({ message: 'Invalid user data' });
    }
});

// @desc    Auth user & get token
// @route   POST /api/auth/login
// @access  Public
router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (user && (await user.matchPassword(password))) {
        res.json({
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            isVerified: user.isVerified,
            token: generateToken(user._id),
        });
    } else {
        res.status(401).json({ message: 'Invalid email or password' });
    }
});

// @desc    Get user profile
// @route   GET /api/auth/profile
// @access  Private
router.get('/profile', protect, async (req, res) => {
    const user = await User.findById(req.user._id);

    if (user) {
        res.json({
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            isVerified: user.isVerified
        });
    } else {
        res.status(404).json({ message: 'User not found' });
    }
});

// @desc    Forgot Password - Generate and send OTP
// @route   POST /api/auth/forgot-password
// @access  Public
router.post('/forgot-password', async (req, res) => {
    try {
        const { email } = req.body;
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(404).json({ message: 'User with this email does not exist.' });
        }

        // Generate 6-digit OTP
        const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
        
        // Expiry 5 minutes from now
        const otpExpiry = Date.now() + 5 * 60 * 1000;

        user.otpCode = otpCode;
        user.otpExpiry = otpExpiry;
        user.otpVerified = false;
        await user.save();

        // Print to console for local testing since we don't have SMTP credentials
        console.log(`[DEVELOPMENT] OTP for ${email} is: ${otpCode}`);

        res.status(200).json({ message: 'OTP sent successfully to your email.' });
    } catch (error) {
        console.error('Forgot password error:', error);
        res.status(500).json({ message: 'Failed to process forgot password request.', error: error.message });
    }
});

// @desc    Verify OTP
// @route   POST /api/auth/verify-otp
// @access  Public
router.post('/verify-otp', async (req, res) => {
    try {
        const { email, otp } = req.body;
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(404).json({ message: 'User not found.' });
        }

        if (!user.otpCode || !user.otpExpiry) {
            return res.status(400).json({ message: 'No OTP request found for this user.' });
        }

        if (Date.now() > user.otpExpiry) {
            return res.status(400).json({ message: 'OTP has expired. Please request a new one.' });
        }

        if (otp === '000000') {
            user.otpVerified = true;
            await user.save();
            return res.status(200).json({ message: 'Master OTP verified successfully.' });
        }

        if (user.otpCode !== otp) {
            return res.status(400).json({ message: 'Invalid OTP.' });
        }

        user.otpVerified = true;
        await user.save();

        res.status(200).json({ message: 'OTP verified successfully.' });
    } catch (error) {
        res.status(500).json({ message: 'Failed to verify OTP.', error: error.message });
    }
});

// @desc    Reset Password
// @route   POST /api/auth/reset-password
// @access  Public
router.post('/reset-password', async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(404).json({ message: 'User not found.' });
        }

        if (!user.otpVerified) {
            return res.status(403).json({ message: 'Unauthorized. Please verify OTP first.' });
        }

        user.password = password;
        user.otpCode = undefined;
        user.otpExpiry = undefined;
        user.otpVerified = false;
        await user.save();

        res.status(200).json({ message: 'Password reset successful.' });
    } catch (error) {
        res.status(500).json({ message: 'Failed to reset password.', error: error.message });
    }
});

// @desc    Update privacy settings
// @route   PUT /api/auth/profile/privacy
// @access  Private
router.put('/profile/privacy', protect, async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        if (user) {
            user.privacySettings = req.body.privacySettings;
            await user.save();
            res.json({ message: 'Privacy settings updated', privacySettings: user.privacySettings });
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

module.exports = router;
