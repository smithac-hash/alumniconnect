const express = require('express');
const router = express.Router();
const Post = require('../models/Post');
const Profile = require('../models/Profile');
const { protect } = require('../middleware/authMiddleware');

// @desc    Get all posts (all types)
// @route   GET /api/posts
// @access  Private
router.get('/', protect, async (req, res) => {
    try {
        const posts = await Post.find()
            .sort({ createdAt: -1 })
            .populate('author', 'name email role')
            .lean();

        // Attach alumni profiles to posts
        const authorIds = posts.map(p => p.author?._id).filter(Boolean);
        const profiles = await Profile.find({ user: { $in: authorIds } }).lean();

        const postsWithProfiles = posts.map(post => {
            const profile = profiles.find(p => 
                p.user.toString() === post.author?._id?.toString()
            );
            return { ...post, alumniProfile: profile || null };
        });

        res.json(postsWithProfiles);
    } catch (error) {
        console.error('GET /api/posts error:', error);
        res.status(500).json({ message: error.message });
    }
});

// @desc    Create a post (any type, any authenticated user)
// @route   POST /api/posts
// @access  Private
router.post('/', protect, async (req, res) => {
    try {
        const { title, content, type, image } = req.body;

        if (!title || !title.trim()) {
            return res.status(400).json({ message: 'Title is required.' });
        }
        if (!content || !content.trim()) {
            return res.status(400).json({ message: 'Content is required.' });
        }

        // Map frontend 'job' type to valid enum value 'career_update'
        const validTypes = ['achievement', 'career_update', 'general'];
        const resolvedType = type === 'job' ? 'career_update' 
            : validTypes.includes(type) ? type 
            : 'general';

        const post = await Post.create({
            author: req.user._id,
            title: title.trim(),
            content: content.trim(),
            type: resolvedType,
            image: image || undefined
        });

        // Use findById + populate for reliable population in Mongoose 9
        const populated = await Post.findById(post._id)
            .populate('author', 'name email role');

        res.status(201).json(populated);
    } catch (error) {
        console.error('POST /api/posts error:', error);
        res.status(400).json({ message: error.message });
    }
});

// @desc    Like / unlike a post (toggle)
// @route   PUT /api/posts/:id/like
// @access  Private
router.put('/:id/like', protect, async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        if (!post) return res.status(404).json({ message: 'Post not found' });

        const userId = req.user._id.toString();
        const alreadyLiked = post.likes.map(id => id.toString()).includes(userId);

        if (alreadyLiked) {
            post.likes = post.likes.filter(id => id.toString() !== userId);
        } else {
            post.likes.push(req.user._id);
        }
        await post.save();

        const populated = await Post.findById(post._id)
            .populate('author', 'name email role');

        res.json(populated);
    } catch (error) {
        console.error('PUT /api/posts/:id/like error:', error);
        res.status(500).json({ message: error.message });
    }
});

// @desc    Delete a post (author or admin only)
// @route   DELETE /api/posts/:id
// @access  Private
router.delete('/:id', protect, async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        if (!post) return res.status(404).json({ message: 'Post not found' });

        if (post.author.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Not authorized to delete this post' });
        }

        await Post.findByIdAndDelete(req.params.id);
        res.json({ message: 'Post deleted' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
