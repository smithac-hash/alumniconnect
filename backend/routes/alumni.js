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
        
        let profiles = await Profile.find(query).populate('user', 'name email role');

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

// @desc    Get all users available for messaging (students + alumni, respecting privacy)
// @route   GET /api/alumni/messaging-contacts
// @access  Private
router.get('/messaging-contacts', protect, async (req, res) => {
    try {
        const { search = '' } = req.query;
        const requestingUser = req.user;

        // Get all users except the requesting user
        const allUsers = await User.find({
            _id: { $ne: requestingUser._id }
        }).select('name email role isVerified');

        // Get all alumni profiles for privacy settings lookup
        const profiles = await Profile.find({}).select('user settings');
        const profileMap = {};
        profiles.forEach(p => { profileMap[p.user.toString()] = p; });

        const contacts = [];

        for (const u of allUsers) {
            // If requesting user is a student, check if the alumni allows student messages
            if (requestingUser.role === 'student' && u.role === 'alumni') {
                const profile = profileMap[u._id.toString()];
                // If alumni has set allowStudentMessages to false, skip them
                if (profile && profile.settings && profile.settings.allowStudentMessages === false) {
                    continue;
                }
            }

            // Filter by search
            if (search && !u.name.toLowerCase().includes(search.toLowerCase())) {
                continue;
            }

            const profile = profileMap[u._id.toString()];
            contacts.push({
                _id: u._id,
                name: u.name,
                email: u.email,
                role: u.role,
                isVerified: u.isVerified,
                jobTitle: profile?.role || '',
                company: profile?.company || ''
            });
        }

        res.json(contacts);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @desc    Create or update profile
// @route   POST /api/alumni/profile
// @access  Private/Alumni
router.post('/profile', protect, alumni, async (req, res) => {
    try {
        const { _id, user, createdAt, updatedAt, __v, ...updateData } = req.body;
        
        const profileData = {
            user: req.user._id,
            ...updateData
        };

        let profile = await Profile.findOne({ user: req.user._id });

        if (profile) {
            profile = await Profile.findOneAndUpdate(
                { user: req.user._id },
                { $set: profileData },
                { new: true, runValidators: true }
            );
        } else {
            profile = new Profile(profileData);
            await profile.save();
        }

        res.json(profile);
    } catch (error) {
        console.error('Profile Update Error:', error);
        res.status(400).json({ message: error.message });
    }
});

// @desc    Update privacy settings for alumni profile
// @route   PUT /api/alumni/profile/settings
// @access  Private/Alumni
router.put('/profile/settings', protect, alumni, async (req, res) => {
    try {
        const { isPrivate, allowStudentMessages } = req.body;

        const profile = await Profile.findOneAndUpdate(
            { user: req.user._id },
            { $set: { 'settings.isPrivate': isPrivate, 'settings.allowStudentMessages': allowStudentMessages } },
            { new: true, upsert: true, setDefaultsOnInsert: true }
        );

        res.json({ message: 'Privacy settings updated', settings: profile.settings });
    } catch (error) {
        console.error('Privacy update error:', error);
        res.status(500).json({ message: 'Failed to update privacy settings', error: error.message });
    }
});

// @desc    Get profile by user ID
// @route   GET /api/alumni/profile/:userId
// @access  Private
router.get('/profile/:userId', protect, async (req, res) => {
    try {
        const profile = await Profile.findOne({ user: req.params.userId }).populate('user', 'name email role isVerified');
        if (!profile) return res.status(404).json({ message: 'Profile not found' });

        // If profile is private and the requester is not the owner, return limited info
        if (profile.settings?.isPrivate && req.user._id.toString() !== req.params.userId) {
            return res.json({
                _id: profile._id,
                user: profile.user,
                role: profile.role,
                company: profile.company,
                isPrivate: true
            });
        }

        res.json(profile);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
