const express = require('express');
const router = express.Router();
const Event = require('../models/Event');
const RSVP = require('../models/RSVP');
const EventMessage = require('../models/EventMessage');
const Notification = require('../models/Notification');
const User = require('../models/User');
const { protect, admin, alumni } = require('../middleware/authMiddleware');

// @desc    Get all events with RSVP status
// @route   GET /api/events
// @access  Private
router.get('/', protect, async (req, res) => {
    try {
        const events = await Event.find()
            .sort({ dateTime: 1 })
            .populate('createdBy', 'name email role')
            .lean();
        
        // Get user's RSVPs for these events
        const userRSVPs = await RSVP.find({ user: req.user._id }).lean();
        const rsvpMap = {};
        userRSVPs.forEach(r => { rsvpMap[r.event.toString()] = r.status; });

        // Get total counts for each event
        const allRSVPs = await RSVP.find({ event: { $in: events.map(e => e._id) } }).lean();
        
        const eventsWithStats = events.map(event => {
            const eventRSVPs = allRSVPs.filter(r => r.event.toString() === event._id.toString());
            return {
                ...event,
                userStatus: rsvpMap[event._id.toString()] || null,
                stats: {
                    attending: eventRSVPs.filter(r => r.status === 'Attending').length,
                    maybe: eventRSVPs.filter(r => r.status === 'Maybe').length,
                    notAttending: eventRSVPs.filter(r => r.status === 'Not Attending').length,
                    total: eventRSVPs.length
                }
            };
        });

        res.json(eventsWithStats);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @desc    Create an event
// @route   POST /api/events
// @access  Private/Admin
router.post('/', protect, admin, async (req, res) => {
    try {
        const event = new Event({
            ...req.body,
            createdBy: req.user._id
        });
        const savedEvent = await event.save();

        // Notify all users
        const users = await User.find({ _id: { $ne: req.user._id } });
        const notifications = users.map(u => ({
            recipient: u._id,
            sender: req.user._id,
            message: `New Event: ${event.title} has been announced!`,
            type: 'event'
        }));
        await Notification.insertMany(notifications);

        // Emit socket notification
        const io = req.app.get('socketio');
        if (io) {
            io.emit('new_notification', {
                message: `New Event: ${event.title}`,
                type: 'event'
            });
        }

        res.status(201).json(savedEvent);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// @desc    RSVP for an event
// @route   POST /api/events/:id/rsvp
// @access  Private
router.post('/:id/rsvp', protect, async (req, res) => {
    try {
        const { status } = req.body;
        if (!['Attending', 'Maybe', 'Not Attending'].includes(status)) {
            return res.status(400).json({ message: 'Invalid RSVP status' });
        }

        const event = await Event.findById(req.params.id);
        if (!event) return res.status(404).json({ message: 'Event not found' });

        const rsvp = await RSVP.findOneAndUpdate(
            { event: req.params.id, user: req.user._id },
            { status },
            { upsert: true, new: true }
        );

        res.json(rsvp);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @desc    Get messages for an event chat
// @route   GET /api/events/:id/messages
// @access  Private
router.get('/:id/messages', protect, async (req, res) => {
    try {
        const messages = await EventMessage.find({ event: req.params.id })
            .populate('sender', 'name role')
            .sort({ createdAt: 1 });
        res.json(messages);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @desc    Post a message to event chat
// @route   POST /api/events/:id/messages
// @access  Private
router.post('/:id/messages', protect, async (req, res) => {
    try {
        const message = new EventMessage({
            event: req.params.id,
            sender: req.user._id,
            content: req.body.content,
            type: req.body.type || 'text'
        });
        await message.save();
        
        const populatedMessage = await message.populate('sender', 'name role');

        // Emit socket message
        const io = req.app.get('socketio');
        if (io) {
            io.to(`event_${req.params.id}`).emit('new_event_message', populatedMessage);
        }

        res.status(201).json(populatedMessage);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @desc    Get attendee list for an event
// @route   GET /api/events/:id/attendees
// @access  Private (Admin or Creator)
router.get('/:id/attendees', protect, async (req, res) => {
    try {
        const event = await Event.findById(req.params.id);
        if (!event) return res.status(404).json({ message: 'Event not found' });

        // Check if user is admin OR the creator
        const isCreator = (event.createdBy && event.createdBy.toString() === req.user._id.toString()) || 
                          (event.organizer && event.organizer.toString() === req.user._id.toString());
        
        if (req.user.role !== 'admin' && !isCreator) {
            return res.status(403).json({ message: 'Not authorized to view attendee list' });
        }

        const rsvps = await RSVP.find({ event: req.params.id })
            .populate('user', 'name email role')
            .sort({ createdAt: -1 });
        res.json(rsvps);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
