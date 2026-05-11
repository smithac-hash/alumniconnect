const mongoose = require('mongoose');

const jobSchema = new mongoose.Schema({
    postedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    title: {
        type: String,
        required: true
    },
    company: {
        type: String,
        required: true
    },
    location: {
        type: String,
        required: true
    },
    type: {
        type: String,
        enum: ['Full-time', 'Part-time', 'Internship', 'Contract'],
        required: true
    },
    description: {
        type: String,
        required: true
    },
    requirements: {
        type: String
    },
    applicationLink: {
        type: String
    },
    salary: {
        type: String
    },
    stipend: {
        type: String
    },
    domain: {
        type: String,
        required: true
    },
    skillsRequired: {
        type: [String],
        default: []
    },
    deadline: {
        type: Date
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Job', jobSchema);
