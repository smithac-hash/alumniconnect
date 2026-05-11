const express = require('express');
const router = express.Router();
const Profile = require('../models/Profile');
const User = require('../models/User');
const { protect, alumni } = require('../middleware/authMiddleware');

// @desc    Get all alumni profiles with filters
// @route   GET /api/alumni
// @access  Private
router.get('/', protect, async (req, res) => {
    try {
        const { domain, company, graduationYear, search } = req.query;
        let query = {};

        if (domain) query.domain = domain;
        if (company) query.company = new RegExp(company, 'i');
        if (graduationYear) query.graduationYear = graduationYear;
        
        let profiles = await Profile.find(query).populate('user', 'name email');

        if (search) {
            profiles = profiles.filter(p => 
                p.user.name.toLowerCase().includes(search.toLowerCase()) ||
                p.role.toLowerCase().includes(search.toLowerCase())
            );
        }

        res.json(profiles);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @desc    Create or update profile
// @route   POST /api/alumni/profile
// @access  Private/Alumni
router.post('/profile', protect, alumni, async (req, res) => {
    try {
        const profileData = {
            user: req.user._id,
            ...req.body
        };

        let profile = await Profile.findOne({ user: req.user._id });

        if (profile) {
            profile = await Profile.findOneAndUpdate(
                { user: req.user._id },
                { $set: profileData },
                { new: true }
            );
        } else {
            profile = new Profile(profileData);
            await profile.save();
        }

        res.json(profile);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// @desc    Get profile by user ID
// @route   GET /api/alumni/profile/:userId
// @access  Private
router.get('/profile/:userId', protect, async (req, res) => {
    try {
        const profile = await Profile.findOne({ user: req.params.userId }).populate('user', 'name email');
        if (!profile) return res.status(404).json({ message: 'Profile not found' });
        res.json(profile);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
