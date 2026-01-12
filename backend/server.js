// backend/server.js
require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const connectDB = require('./config/database');

const app = express();
const server = http.createServer(app);

// Socket.io setup with CORS
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true,
    methods: ['GET', 'POST']
  }
});

// Connect to database
connectDB();

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());
app.use(cookieParser());

// Make io accessible to routes
app.set('io', io);

// Store connected users (userId -> socketId)
const connectedUsers = new Map();

// Socket.io connection handling
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  // User registers their userId with their socket
  socket.on('register', (userId) => {
    connectedUsers.set(userId, socket.id);
    console.log(`User ${userId} registered with socket ${socket.id}`);
  });

  // Join a gig room for real-time messaging
  socket.on('joinGigRoom', async (data) => {
    const { gigId, userId } = data;
    
    try {
      // Verify user is authorized (gig owner or hired freelancer)
      const Gig = require('./models/Gig');
      const Bid = require('./models/Bid');
      
      const gig = await Gig.findById(gigId);
      if (!gig || gig.status !== 'assigned') {
        socket.emit('error', { message: 'Cannot join room for this gig' });
        return;
      }

      const hiredBid = await Bid.findOne({ gigId, status: 'hired' });
      if (!hiredBid) {
        socket.emit('error', { message: 'No hired freelancer found' });
        return;
      }

      const isOwner = gig.ownerId.toString() === userId;
      const isHiredFreelancer = hiredBid.freelancerId.toString() === userId;

      if (!isOwner && !isHiredFreelancer) {
        socket.emit('error', { message: 'Unauthorized to join this room' });
        return;
      }

      // Join the room
      const roomName = `gig_${gigId}`;
      socket.join(roomName);
      console.log(`User ${userId} joined room ${roomName}`);
    } catch (error) {
      console.error('Error joining gig room:', error);
      socket.emit('error', { message: 'Failed to join room' });
    }
  });

  // Handle incoming messages
  socket.on('sendMessage', async (data) => {
    const { gigId, senderId, text } = data;
    
    try {
      // Verify authorization and save message
      const Message = require('./models/Message');
      const Gig = require('./models/Gig');
      const Bid = require('./models/Bid');

      const gig = await Gig.findById(gigId);
      if (!gig || gig.status !== 'assigned') {
        socket.emit('error', { message: 'Cannot send message for this gig' });
        return;
      }

      const hiredBid = await Bid.findOne({ gigId, status: 'hired' });
      if (!hiredBid) {
        socket.emit('error', { message: 'No hired freelancer found' });
        return;
      }

      const isOwner = gig.ownerId.toString() === senderId;
      const isHiredFreelancer = hiredBid.freelancerId.toString() === senderId;

      if (!isOwner && !isHiredFreelancer) {
        socket.emit('error', { message: 'Unauthorized to send message' });
        return;
      }

      const receiverId = isOwner ? hiredBid.freelancerId : gig.ownerId;

      // Save message to database
      const message = await Message.create({
        gigId,
        senderId,
        receiverId,
        text: text.trim()
      });

      await message.populate('senderId', 'name');

      // Emit to room (real-time delivery)
      const roomName = `gig_${gigId}`;
      io.to(roomName).emit('receiveMessage', {
        message: message
      });

      console.log(`Message sent in room ${roomName}`);
    } catch (error) {
      console.error('Error sending message:', error);
      socket.emit('error', { message: 'Failed to send message' });
    }
  });

  socket.on('disconnect', () => {
    // Remove user from connected users
    for (const [userId, socketId] of connectedUsers.entries()) {
      if (socketId === socket.id) {
        connectedUsers.delete(userId);
        console.log(`User ${userId} disconnected`);
        break;
      }
    }
  });
});

// Export connectedUsers for use in controllers
app.set('connectedUsers', connectedUsers);

// Import routes
const authRoutes = require('./routes/authRoutes');
const gigRoutes = require('./routes/gigRoutes');
const bidRoutes = require('./routes/bidRoutes');
const messageRoutes = require('./routes/messageRoutes');

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/gigs', gigRoutes);
app.use('/api/bids', bidRoutes);
app.use('/api/messages', messageRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'GigFlow API is running' });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

const PORT = process.env.PORT || 5001;

server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});