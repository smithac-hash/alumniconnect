const express = require('express');
const router = express.Router();
const Conversation = require('../models/Conversation');
const Message = require('../models/Message');
const { protect } = require('../middleware/authMiddleware');

// @desc    Get all conversations for a user
// @route   GET /api/chat/conversations
// @access  Private
router.get('/conversations', protect, async (req, res) => {
    try {
        const conversations = await Conversation.find({
            participants: { $in: [req.user._id] }
        })
        .populate('participants', 'name role profilePhoto')
        .populate('lastMessage')
        .sort({ updatedAt: -1 });

        res.json(conversations);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @desc    Get messages for a conversation
// @route   GET /api/chat/messages/:conversationId
// @access  Private
router.get('/messages/:conversationId', protect, async (req, res) => {
    try {
        const messages = await Message.find({
            conversation: req.params.conversationId
        })
        .populate('sender', 'name profilePhoto')
        .sort({ createdAt: 1 });

        res.json(messages);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @desc    Create a new message
// @route   POST /api/chat/messages
// @access  Private
router.post('/messages', protect, async (req, res) => {
    try {
        const { conversationId, content, messageType } = req.body;
        
        // Check if conversation exists and check privacy
        const conversation = await Conversation.findById(conversationId).populate('participants');
        if (!conversation) return res.status(404).json({ message: 'Conversation not found' });

        // If sender is a student, check if any alumni in the conversation has disabled student messages
        if (req.user.role === 'student') {
            const Profile = require('../models/Profile');
            const alumniParticipants = conversation.participants.filter(p => p.role === 'alumni');
            
            for (const alumni of alumniParticipants) {
                const profile = await Profile.findOne({ user: alumni._id });
                if (profile && profile.settings && profile.settings.allowStudentMessages === false) {
                    return res.status(403).json({ message: `Privacy settings prevent messaging ${alumni.name}` });
                }
            }
        }

        const message = await Message.create({
            conversation: conversationId,
            sender: req.user._id,
            content,
            messageType
        });

        await Conversation.findByIdAndUpdate(conversationId, {
            lastMessage: message._id
        });

        const populatedMessage = await Message.findById(message._id).populate('sender', 'name profilePhoto');

        res.status(201).json(populatedMessage);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @desc    Create or get 1:1 conversation
// @route   POST /api/chat/conversation
// @access  Private
router.post('/conversation', protect, async (req, res) => {
    try {
        const { recipientId } = req.body;
        const User = require('../models/User');
        const Profile = require('../models/Profile');

        const recipient = await User.findById(recipientId);
        if (!recipient) return res.status(404).json({ message: 'Recipient not found' });

        // Privacy Check: If sender is student and recipient is alumni
        if (req.user.role === 'student' && recipient.role === 'alumni') {
            const profile = await Profile.findOne({ user: recipientId });
            if (profile && profile.settings && profile.settings.allowStudentMessages === false) {
                return res.status(403).json({ message: 'This alumni has disabled direct messages from students.' });
            }
        }
        
        let conversation = await Conversation.findOne({
            isGroup: false,
            participants: { $all: [req.user._id, recipientId] }
        });

        if (!conversation) {
            conversation = await Conversation.create({
                participants: [req.user._id, recipientId]
            });
        }

        res.json(conversation);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
