const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Profile = require('../models/Profile');
const { protect, admin } = require('../middleware/authMiddleware');

// @desc    Get all unverified alumni
// @route   GET /api/admin/unverified
// @access  Private/Admin
router.get('/unverified', protect, admin, async (req, res) => {
    try {
        const users = await User.find({ role: 'alumni', isVerified: false }).select('-password');
        
        // Populate with profile data
        const unverifiedAlumni = await Promise.all(users.map(async (user) => {
            const profile = await Profile.findOne({ user: user._id });
            return {
                ...user._doc,
                profile: profile || {}
            };
        }));

        res.json(unverifiedAlumni);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @desc    Verify alumni
// @route   PUT /api/admin/verify/:id
// @access  Private/Admin
router.put('/verify/:id', protect, admin, async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) return res.status(404).json({ message: 'User not found' });

        user.isVerified = true;
        await user.save();

        res.json({ message: 'User verified successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @desc    Reject/Delete user
// @route   DELETE /api/admin/reject/:id
// @access  Private/Admin
router.delete('/reject/:id', protect, admin, async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) return res.status(404).json({ message: 'User not found' });

        await User.findByIdAndDelete(req.params.id);
        await Profile.findOneAndDelete({ user: req.params.id });

        res.json({ message: 'User rejected and deleted' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
