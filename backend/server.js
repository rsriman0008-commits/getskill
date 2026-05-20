const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const http = require('http');
const socketIo = require('socket.io');

// Load environment variables
dotenv.config();

// Import routes
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const courseRoutes = require('./routes/courses');
const sessionRoutes = require('./routes/sessions');
const searchRoutes = require('./routes/search');

// Initialize Express app
const app = express();
const server = http.createServer(app);

// Initialize Socket.io
const io = socketIo(server, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    methods: ['GET', 'POST'],
    credentials: true
  }
});

// Make io global for use in routes
global.io = io;

// Middleware
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/skillswap', {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
  .then(() => console.log('✅ MongoDB connected successfully'))
  .catch(err => console.error('❌ MongoDB connection error:', err));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({ success: true, message: 'Server is running' });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/sessions', sessionRoutes);
app.use('/api/search', searchRoutes);

// Socket.io Event Handlers
const userSockets = new Map();

io.on('connection', (socket) => {
  console.log(`📱 User connected: ${socket.id}`);

  // Register user socket
  socket.on('register_user', (userId) => {
    userSockets.set(userId, socket.id);
    socket.join(userId);
    console.log(`✅ ${userId} registered with socket ${socket.id}`);
  });

  // Handle chat messages
  socket.on('send_message', ({ senderId, recipientId, message }) => {
    const messageData = {
      senderId,
      recipientId,
      message,
      timestamp: new Date(),
      read: false
    };

    // Save message to database would happen here
    // For now, just emit to recipient
    io.to(recipientId).emit('receive_message', messageData);
    console.log(`💬 Message from ${senderId} to ${recipientId}: ${message}`);
  });

  // Handle typing indicator
  socket.on('user_typing', ({ senderId, recipientId }) => {
    io.to(recipientId).emit('typing', { senderId });
  });

  socket.on('user_stop_typing', ({ recipientId }) => {
    io.to(recipientId).emit('stop_typing');
  });

  // Handle disconnection
  socket.on('disconnect', () => {
    // Find and remove user from map
    for (const [userId, socketId] of userSockets.entries()) {
      if (socketId === socket.id) {
        userSockets.delete(userId);
        console.log(`❌ User disconnected: ${userId}`);
        break;
      }
    }
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    success: false,
    error: err.message || 'Internal server error'
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'Route not found'
  });
});

// Start server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`
  🚀 =========================================
     GetSkills API Server Started
  =========================================
  Port: ${PORT}
  Environment: ${process.env.NODE_ENV || 'development'}
  Frontend URL: ${process.env.FRONTEND_URL || 'http://localhost:5173'}
  =========================================
  `);
});

module.exports = server;
