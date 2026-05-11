const mongoose = require('mongoose');

const profileSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    company: {
        type: String,
        required: true
    },
    role: {
        type: String,
        required: true
    },
    experience: {
        type: Number,
        required: true
    },
    skills: {
        type: [String],
        required: true
    },
    graduationYear: {
        type: Number,
        required: true
    },
    domain: {
        type: String,
        required: true
    },
    achievements: {
        type: String
    },
    linkedin: {
        type: String
    },
    bio: {
        type: String
    },
    profilePhoto: {
        type: String,
        default: ''
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Profile', profileSchema);
