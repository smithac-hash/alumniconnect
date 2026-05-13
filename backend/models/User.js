const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    phone: {
        type: String
    },
    password: {
        type: String,
        required: true
    },
    role: {
        type: String,
        enum: ['student', 'alumni', 'admin'],
        default: 'student'
    },
    isVerified: {
        type: Boolean,
        default: false
    },
    otpCode: {
        type: String
    },
    otpExpiry: {
        type: Date
    },
    otpVerified: {
        type: Boolean,
        default: false
    },
    department: {
        type: String
    },
    interests: {
        type: [String],
        default: []
    },
    skills: {
        type: [String],
        default: []
    },
    connections: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    pendingRequests: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    privacySettings: {
        showEmail: { type: Boolean, default: false },
        showPhone: { type: Boolean, default: false },
        allowStudentMessages: { type: Boolean, default: true },
        openForMentorship: { type: Boolean, default: true },
        showJourney: { type: Boolean, default: true }
    }
} , {
    timestamps: true
});

userSchema.pre('save', async function() {
    if (!this.isModified('password')) {
        return;
    }
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

userSchema.methods.matchPassword = async function(enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
