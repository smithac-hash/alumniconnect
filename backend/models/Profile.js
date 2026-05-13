const mongoose = require('mongoose');

const profileSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    company: {
        type: String,
        default: ''
    },
    role: {
        type: String,
        default: ''
    },
    experience: {
        type: Number,
        default: 0
    },
    skills: {
        type: [String],
        default: []
    },
    graduationYear: {
        type: Number,
        default: new Date().getFullYear()
    },
    domain: {
        type: String,
        default: 'General'
    },
    bio: {
        type: String,
        default: ''
    },
    linkedin: {
        type: String
    },
    profilePhoto: {
        type: String,
        default: ''
    },
    coverPhoto: {
        type: String,
        default: ''
    },
    workExperience: [{
        company: String,
        role: String,
        location: String,
        startDate: Date,
        endDate: Date,
        description: String,
        logo: String
    }],
    education: [{
        school: String,
        degree: String,
        fieldOfStudy: String,
        startYear: Number,
        endYear: Number
    }],
    achievements: [{
        title: String,
        issuer: String,
        date: Date,
        description: String,
        icon: String
    }],
    summary: {
        type: String
    },
    mentorship: {
        isAvailable: { type: Boolean, default: false },
        areas: [String],
        maxStudents: { type: Number, default: 3 },
        availableTimings: String,
        languages: [String]
    },
    resumeUrl: String,
    portfolioUrl: String,
    githubUrl: String,
    settings: {
        isPrivate: { type: Boolean, default: false },
        allowStudentMessages: { type: Boolean, default: true }
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Profile', profileSchema);
