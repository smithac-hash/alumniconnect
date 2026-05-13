const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    bannerImage: {
        type: String,
        default: ''
    },
    dateTime: {
        type: Date,
        required: true
    },
    venue: {
        type: String,
        required: true
    },
    organizerName: {
        type: String,
        required: true
    },
    guestAlumni: {
        type: String,
        default: ''
    },
    type: {
        type: String,
        enum: ['Alumni Meet', 'Webinar', 'Workshop', 'Career Guidance', 'Placement Talk', 'Networking Event'],
        default: 'Alumni Meet'
    },
    registrationDeadline: {
        type: Date
    },
    maxParticipants: {
        type: Number,
        default: 0 // 0 for unlimited
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Event', eventSchema);
