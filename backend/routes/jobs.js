const express = require('express');
const router = express.Router();
const Job = require('../models/Job');
const Notification = require('../models/Notification');
const User = require('../models/User');
const { protect, alumni } = require('../middleware/authMiddleware');
const SavedJob = require('../models/SavedJob');

// @desc    Get all jobs with filters
// @route   GET /api/jobs
// @access  Private
router.get('/', protect, async (req, res) => {
    try {
        const { search, domain, type, location } = req.query;
        let query = {};

        if (search) {
            query.$or = [
                { title: { $regex: search, $options: 'i' } },
                { company: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } }
            ];
        }
        if (domain) query.domain = domain;
        if (type) query.type = type;
        if (location) query.location = { $regex: location, $options: 'i' };

        const jobs = await Job.find(query).sort({ createdAt: -1 }).populate('postedBy', 'name email').lean();
        
        const Profile = require('../models/Profile');
        const authorIds = jobs.map(j => j.postedBy?._id).filter(id => id);
        const profiles = await Profile.find({ user: { $in: authorIds } }).lean();

        const jobsWithProfiles = jobs.map(job => {
            const profile = profiles.find(p => p.user.toString() === job.postedBy?._id.toString());
            return {
                ...job,
                alumniProfile: profile || null
            };
        });

        res.json(jobsWithProfiles);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @desc    Get recommended jobs for student
// @route   GET /api/jobs/recommended
// @access  Private
router.get('/recommended', protect, async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        if (!user) return res.status(404).json({ message: 'User not found' });

        // Simple matching logic: matches user domain or department
        let query = {};
        if (user.role === 'student') {
            const criteria = [];
            if (user.department) criteria.push({ domain: user.department });
            if (user.interests && user.interests.length > 0) {
                criteria.push({ domain: { $in: user.interests } });
            }
            
            if (criteria.length > 0) {
                query.$or = criteria;
            }
        }

        const jobs = await Job.find(query).sort({ createdAt: -1 }).limit(10).populate('postedBy', 'name email').lean();
        
        const Profile = require('../models/Profile');
        const authorIds = jobs.map(j => j.postedBy?._id).filter(id => id);
        const profiles = await Profile.find({ user: { $in: authorIds } }).lean();

        const jobsWithProfiles = jobs.map(job => {
            const profile = profiles.find(p => p.user.toString() === job.postedBy?._id.toString());
            return {
                ...job,
                alumniProfile: profile || null
            };
        });

        res.json(jobsWithProfiles);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @desc    Post a job
// @route   POST /api/jobs
// @access  Private/Alumni
router.post('/', protect, alumni, async (req, res) => {
    try {
        const job = new Job({
            postedBy: req.user._id,
            ...req.body
        });
        const savedJob = await job.save();

        const io = req.app.get('socketio');
        
        // Emit socket event for real-time update
        io.emit('new_job', {
            message: `New job posted: ${job.title} at ${job.company}`,
            job: savedJob
        });

        // Also send generic notification
        const students = await User.find({ role: 'student' });
        const notifications = students.map(student => ({
            recipient: student._id,
            sender: req.user._id,
            message: `New job alert: ${job.title} at ${job.company}`,
            type: 'job'
        }));
        await Notification.insertMany(notifications);
        io.emit('new_notification', { type: 'job' });

        res.status(201).json(savedJob);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// @desc    Toggle save/bookmark a job
// @route   POST /api/jobs/:id/save
// @access  Private
router.post('/:id/save', protect, async (req, res) => {
    try {
        const savedJob = await SavedJob.findOne({ user: req.user._id, job: req.params.id });

        if (savedJob) {
            await SavedJob.deleteOne({ _id: savedJob._id });
            return res.json({ message: 'Job removed from bookmarks', isSaved: false });
        } else {
            const newSave = new SavedJob({
                user: req.user._id,
                job: req.params.id
            });
            await newSave.save();
            return res.status(201).json({ message: 'Job saved successfully', isSaved: true });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @desc    Get saved jobs for the logged in user
// @route   GET /api/jobs/saved
// @access  Private
router.get('/saved', protect, async (req, res) => {
    try {
        const savedJobs = await SavedJob.find({ user: req.user._id })
            .populate({
                path: 'job',
                populate: {
                    path: 'postedBy',
                    select: 'name email'
                }
            })
            .sort({ createdAt: -1 });

        res.json(savedJobs);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @desc    Update saved job status or notes
// @route   PUT /api/jobs/saved/:id
// @access  Private
router.put('/saved/:id', protect, async (req, res) => {
    try {
        const { status, notes, priority, reminderEnabled } = req.body;
        const savedJob = await SavedJob.findOneAndUpdate(
            { _id: req.params.id, user: req.user._id },
            { $set: { status, notes, priority, reminderEnabled } },
            { new: true }
        );

        if (!savedJob) return res.status(404).json({ message: 'Saved job not found' });
        res.json(savedJob);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
