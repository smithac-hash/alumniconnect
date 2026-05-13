const mongoose = require('mongoose');

const connectionSchema = new mongoose.Schema({
    sender: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    receiver: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    status: {
        type: String,
        enum: ['pending', 'accepted', 'rejected'],
        default: 'pending'
    },
    requestType: {
        type: String,
        enum: ['networking', 'mentorship'],
        default: 'networking'
    },
    message: {
        type: String // Optional note with request
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Connection', connectionSchema);
