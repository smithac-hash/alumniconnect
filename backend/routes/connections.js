const express = require('express');
const router = express.Router();
const Connection = require('../models/Connection');
const User = require('../models/User');
const { protect } = require('../middleware/authMiddleware');

// @desc    Send a connection request
// @route   POST /api/connections/request
// @access  Private
router.post('/request', protect, async (req, res) => {
    try {
        const { receiverId, requestType, message } = req.body;
        
        // Check if request already exists
        const existingRequest = await Connection.findOne({
            sender: req.user._id,
            receiver: receiverId,
            status: 'pending'
        });

        if (existingRequest) {
            return res.status(400).json({ message: 'Request already pending' });
        }

        const connection = await Connection.create({
            sender: req.user._id,
            receiver: receiverId,
            requestType,
            message
        });

        res.status(201).json(connection);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @desc    Get pending requests for current user
// @route   GET /api/connections/pending
// @access  Private
router.get('/pending', protect, async (req, res) => {
    try {
        const requests = await Connection.find({
            receiver: req.user._id,
            status: 'pending'
        }).populate('sender', 'name role department profilePhoto');
        
        res.json(requests);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @desc    Accept or Reject a request
// @route   PUT /api/connections/:requestId
// @access  Private
router.put('/:requestId', protect, async (req, res) => {
    try {
        const { status } = req.body;
        const connection = await Connection.findById(req.params.requestId);

        if (!connection) return res.status(404).json({ message: 'Request not found' });
        if (connection.receiver.toString() !== req.user._id.toString()) {
            return res.status(401).json({ message: 'Unauthorized' });
        }

        connection.status = status;
        await connection.save();

        if (status === 'accepted') {
            // Add to both users' connections array
            await User.findByIdAndUpdate(connection.sender, { $addToSet: { connections: connection.receiver } });
            await User.findByIdAndUpdate(connection.receiver, { $addToSet: { connections: connection.sender } });
        }

        res.json(connection);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
