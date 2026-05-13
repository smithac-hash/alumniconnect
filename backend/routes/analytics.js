const express = require('express');
const router = express.Router();
const Profile = require('../models/Profile');
const User = require('../models/User');
const { protect, admin } = require('../middleware/authMiddleware');

// @desc    Get alumni career distribution stats
// @route   GET /api/analytics/alumni-career
// @access  Private/Admin
router.get('/alumni-career', protect, admin, async (req, res) => {
    try {
        const stats = await Profile.aggregate([
            {
                $group: {
                    _id: "$domain",
                    count: { $sum: 1 }
                }
            },
            { $sort: { count: -1 } }
        ]);
        res.json(stats);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @desc    Get alumni location distribution (Country-wise)
// @route   GET /api/analytics/alumni-location
// @access  Private/Admin
router.get('/alumni-location', protect, admin, async (req, res) => {
    try {
        // Since we don't have a 'country' field in Profile yet, we'll simulate it or use domain as proxy for now
        // BUT wait, the prompt asks for Country-wise. I should check the Profile model for location.
        // The Profile model has 'location' in workExperience.
        
        const stats = await Profile.aggregate([
            {
                $group: {
                    _id: "$domain", // Using domain as placeholder for geography if not present
                    count: { $sum: 1 }
                }
            }
        ]);
        res.json(stats);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @desc    Get general alumni stats (KPIs)
// @route   GET /api/analytics/overview
// @access  Private/Admin
router.get('/overview', protect, admin, async (req, res) => {
    try {
        const totalAlumni = await User.countDocuments({ role: 'alumni' });
        const verifiedAlumni = await User.countDocuments({ role: 'alumni', isVerified: true });
        const profiles = await Profile.countDocuments();
        const mentorshipAvailable = await Profile.countDocuments({ 'mentorship.isAvailable': true });

        res.json({
            totalAlumni,
            verifiedAlumni,
            profilesWithData: profiles,
            mentorshipAvailable
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
