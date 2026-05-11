const express = require('express');
const router = express.Router();
const Event = require('../models/Event');
const Notification = require('../models/Notification');
const User = require('../models/User');
const { protect, alumni } = require('../middleware/authMiddleware');

// @desc    Get all events
// @route   GET /api/events
// @access  Private
router.get('/', protect, async (req, res) => {
    try {
        const events = await Event.find().sort({ date: 1 }).populate('organizer', 'name email').lean();
        
        const Profile = require('../models/Profile');
        const organizerIds = events.map(e => e.organizer._id);
        const profiles = await Profile.find({ user: { $in: organizerIds } }).lean();

        const eventsWithProfiles = events.map(event => {
            const profile = profiles.find(p => p.user.toString() === event.organizer._id.toString());
            return {
                ...event,
                alumniProfile: profile || null
            };
        });

        res.json(eventsWithProfiles);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @desc    Get upcoming events
// @route   GET /api/events/upcoming
// @access  Private
router.get('/upcoming', protect, async (req, res) => {
    try {
        const currentDate = new Date();
        // Zero out the time portion to include today's events regardless of exact hour
        currentDate.setHours(0, 0, 0, 0);
        
        const upcomingEvents = await Event.find({
            date: { $gte: currentDate }
        })
        .sort({ date: 1 })
        .populate('organizer', 'name email')
        .lean();

        const Profile = require('../models/Profile');
        const organizerIds = upcomingEvents.map(e => e.organizer._id);
        const profiles = await Profile.find({ user: { $in: organizerIds } }).lean();

        const eventsWithProfiles = upcomingEvents.map(event => {
            const profile = profiles.find(p => p.user.toString() === event.organizer._id.toString());
            return {
                ...event,
                alumniProfile: profile || null
            };
        });

        res.json({
            count: eventsWithProfiles.length,
            events: eventsWithProfiles
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @desc    Create an event
// @route   POST /api/events
// @access  Private/Alumni
router.post('/', protect, alumni, async (req, res) => {
    try {
        const event = new Event({
            organizer: req.user._id,
            ...req.body
        });
        const savedEvent = await event.save();

        // Real-time Notification logic
        const io = req.app.get('socketio');
        const students = await User.find({ role: 'student' });
        
        // Create notifications in DB
        const notifications = students.map(student => ({
            recipient: student._id,
            sender: req.user._id,
            message: `New webinar scheduled: ${event.title}`,
            type: 'event'
        }));
        await Notification.insertMany(notifications);

        // Emit socket event
        io.emit('new_notification', {
            message: `New webinar scheduled: ${event.title}`,
            type: 'event'
        });

        res.status(201).json(savedEvent);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// @desc    Register for an event
// @route   POST /api/events/:id/register
// @access  Private
router.post('/:id/register', protect, async (req, res) => {
    try {
        const event = await Event.findById(req.params.id);
        if (!event) return res.status(404).json({ message: 'Event not found' });

        if (event.attendees.includes(req.user._id)) {
            return res.status(400).json({ message: 'Already registered for this event' });
        }

        event.attendees.push(req.user._id);
        await event.save();

        res.json({ message: 'Registered successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
