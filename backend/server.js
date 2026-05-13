const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');

dotenv.config();
connectDB();

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/alumni', require('./routes/alumni'));
app.use('/api/jobs', require('./routes/jobs'));
app.use('/api/events', require('./routes/events'));
app.use('/api/notifications', require('./routes/notifications'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/posts', require('./routes/posts'));
app.use('/api/chat', require('./routes/chat'));
app.use('/api/connections', require('./routes/connections'));
app.use('/api/analytics', require('./routes/analytics'));

app.get('/', (req, res) => {
    res.send('Alumni Connect API is running...');
});

// Socket.io connection logic
io.on('connection', (socket) => {
    console.log('New client connected:', socket.id);
    
    socket.on('join_room', (roomId) => {
        socket.join(roomId);
        console.log(`User joined room: ${roomId}`);
    });

    socket.on('send_message', (data) => {
        // data contains: roomId, senderId, content, timestamp
        io.to(data.roomId).emit('receive_message', data);
    });

    socket.on('typing', (data) => {
        socket.to(data.roomId).emit('user_typing', { userId: data.userId });
    });

    socket.on('stop_typing', (data) => {
        socket.to(data.roomId).emit('user_stop_typing', { userId: data.userId });
    });

    socket.on('disconnect', () => {
        console.log('Client disconnected');
    });
});

// Make io accessible to routes
app.set('socketio', io);

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
    console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
    
    // Start Job Reminder System (Check every 6 hours)
    const { checkUpcomingDeadlines } = require('./utils/jobReminders');
    setInterval(() => checkUpcomingDeadlines(io), 6 * 60 * 60 * 1000);
    // Initial check on startup
    setTimeout(() => checkUpcomingDeadlines(io), 5000);
});
