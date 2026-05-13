const mongoose = require('mongoose');

const rsvpSchema = new mongoose.Schema({
    event: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Event',
        required: true
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    status: {
        type: String,
        enum: ['Attending', 'Maybe', 'Not Attending'],
        required: true
    }
}, {
    timestamps: true
});

// Ensure a user can only have one RSVP per event
rsvpSchema.index({ event: 1, user: 1 }, { unique: true });

module.exports = mongoose.model('RSVP', rsvpSchema);
