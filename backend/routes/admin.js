const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Profile = require('../models/Profile');
const Job = require('../models/Job');
const Event = require('../models/Event');
const { protect, admin } = require('../middleware/authMiddleware');

// @desc    Get dashboard statistics
// @route   GET /api/admin/stats
// @access  Private/Admin
router.get('/stats', protect, admin, async (req, res) => {
    try {
        const totalStudents = await User.countDocuments({ role: 'student' });
        const totalAlumni = await User.countDocuments({ role: 'alumni' });
        const verifiedAlumni = await User.countDocuments({ role: 'alumni', isVerified: true });
        const pendingAlumni = await User.countDocuments({ role: 'alumni', isVerified: false });
        const totalJobs = await Job.countDocuments();
        const totalEvents = await Event.countDocuments();
        const pendingJobs = await Job.countDocuments({ isVerified: false });

        res.json({
            totalStudents,
            totalAlumni,
            verifiedAlumni,
            pendingAlumni,
            totalJobs,
            totalEvents,
            pendingJobs,
            activeUsers: totalStudents + totalAlumni // Simplified
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @desc    Get all users with filters
// @route   GET /api/admin/users
// @access  Private/Admin
router.get('/users', protect, admin, async (req, res) => {
    try {
        const { role, department, isVerified, search } = req.query;
        let query = {};
        if (role) query.role = role;
        if (department) query.department = department;
        if (isVerified !== undefined) query.isVerified = isVerified === 'true';
        
        if (search) {
            query.$or = [
                { name: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } }
            ];
        }

        const users = await User.find(query).select('-password').sort({ createdAt: -1 });
        
        // Populate with profile data for alumni
        const usersWithProfiles = await Promise.all(users.map(async (user) => {
            if (user.role === 'alumni') {
                const profile = await Profile.findOne({ user: user._id });
                return { ...user._doc, profile: profile || {} };
            }
            return user;
        }));

        res.json(usersWithProfiles);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @desc    Get all unverified alumni
// @route   GET /api/admin/unverified
// @access  Private/Admin
router.get('/unverified', protect, admin, async (req, res) => {
    try {
        const users = await User.find({ role: 'alumni', isVerified: false }).select('-password');
        const unverifiedAlumni = await Promise.all(users.map(async (user) => {
            const profile = await Profile.findOne({ user: user._id });
            return { ...user._doc, profile: profile || {} };
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

// @desc    Reset user password
// @route   PUT /api/admin/users/:id/reset-password
// @access  Private/Admin
router.put('/users/:id/reset-password', protect, admin, async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) return res.status(404).json({ message: 'User not found' });
        
        const { newPassword } = req.body;
        if (!newPassword) return res.status(400).json({ message: 'New password is required' });
        
        user.password = newPassword; // Will be hashed by pre-save hook
        await user.save();
        
        res.json({ message: 'Password reset successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @desc    Reject/Delete user
// @route   DELETE /api/admin/reject/:id
// @access  Private/Admin
router.delete('/reject/:id', protect, admin, async (req, res) => {
    try {
        await User.findByIdAndDelete(req.params.id);
        await Profile.findOneAndDelete({ user: req.params.id });
        res.json({ message: 'User deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @desc    Get recent activities
// @route   GET /api/admin/activities
// @access  Private/Admin
router.get('/activities', protect, admin, async (req, res) => {
    try {
        // Fetch recent records from multiple collections and combine them
        const recentUsers = await User.find().sort({ createdAt: -1 }).limit(5).select('name role createdAt');
        const recentJobs = await Job.find().sort({ createdAt: -1 }).limit(5).select('title company createdAt');

        const activities = [
            ...recentUsers.map(u => ({ type: 'user', content: `New ${u.role} registered: ${u.name}`, timestamp: u.createdAt })),
            ...recentJobs.map(j => ({ type: 'job', content: `New job posted: ${j.title} at ${j.company}`, timestamp: j.createdAt }))
        ].sort((a, b) => b.timestamp - a.timestamp).slice(0, 10);

        res.json(activities);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;

