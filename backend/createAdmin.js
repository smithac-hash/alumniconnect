const mongoose = require('mongoose');
const User = require('./models/User');
const dotenv = require('dotenv');

dotenv.config();

const createAdmin = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB');

        const adminEmail = 'admin@college.edu';
        let admin = await User.findOne({ email: adminEmail });

        if (admin) {
            console.log('Admin user exists, updating password...');
            admin.password = 'admin123';
            await admin.save();
            console.log('Admin password updated successfully');
        } else {
            admin = new User({
                name: 'College Admin',
                email: adminEmail,
                password: 'admin123',
                role: 'admin',
                isVerified: true
            });
            await admin.save();
            console.log('Admin user created successfully');
        }

        console.log('Email: admin@college.edu');
        console.log('Password: admin123');
        process.exit();
    } catch (error) {
        console.error('Error creating admin:', error);
        process.exit(1);
    }
};

createAdmin();
