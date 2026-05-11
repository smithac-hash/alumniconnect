const express = require('express');
const router = express.Router();
const Post = require('../models/Post');
const Profile = require('../models/Profile');
const { protect, alumni } = require('../middleware/authMiddleware');

// @desc    Get all achievements/posts
// @route   GET /api/posts
// @access  Private
router.get('/', protect, async (req, res) => {
    try {
        const posts = await Post.find({ type: 'achievement' })
            .sort({ createdAt: -1 })
            .populate('author', 'name email')
            .lean();

        // Fetch profiles for the authors
        const authorIds = posts.map(p => p.author._id);
        const profiles = await Profile.find({ user: { $in: authorIds } }).lean();

        // Attach profiles to posts
        const postsWithProfiles = posts.map(post => {
            const profile = profiles.find(p => p.user.toString() === post.author._id.toString());
            return {
                ...post,
                alumniProfile: profile || null
            };
        });

        res.json(postsWithProfiles);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @desc    Create an achievement post
// @route   POST /api/posts
// @access  Private/Alumni
router.post('/', protect, alumni, async (req, res) => {
    try {
        const post = new Post({
            author: req.user._id,
            type: 'achievement',
            ...req.body
        });
        const savedPost = await post.save();
        res.status(201).json(savedPost);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

module.exports = router;
