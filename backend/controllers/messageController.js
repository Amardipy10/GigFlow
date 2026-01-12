// backend/controllers/messageController.js
const Message = require('../models/Message');
const Gig = require('../models/Gig');
const Bid = require('../models/Bid');

/**
 * CRITICAL AUTHORIZATION LOGIC
 * Messaging is ONLY allowed for post-hire coordination:
 * 1. Gig must be in "assigned" status
 * 2. Only gig owner and hired freelancer can message
 * 3. All other cases return 403 Forbidden
 */
const verifyMessagingAuth = async (gigId, userId) => {
  // Find gig
  const gig = await Gig.findById(gigId);
  if (!gig) {
    return { authorized: false, message: 'Gig not found' };
  }

  // RULE 1: Gig must be assigned
  if (gig.status !== 'assigned') {
    return { 
      authorized: false, 
      message: 'Messaging is only available for assigned gigs' 
    };
  }

  // Find hired freelancer
  const hiredBid = await Bid.findOne({ gigId, status: 'hired' });
  if (!hiredBid) {
    return { 
      authorized: false, 
      message: 'No hired freelancer found' 
    };
  }

  const isOwner = gig.ownerId.toString() === userId.toString();
  const isHiredFreelancer = hiredBid.freelancerId.toString() === userId.toString();

  // RULE 2: Only owner and hired freelancer
  if (!isOwner && !isHiredFreelancer) {
    return { 
      authorized: false, 
      message: 'Only gig owner and hired freelancer can message' 
    };
  }

  return { 
    authorized: true, 
    gig, 
    hiredBid,
    isOwner,
    otherUserId: isOwner ? hiredBid.freelancerId : gig.ownerId
  };
};

exports.sendMessage = async (req, res) => {
  try {
    const { gigId, text } = req.body;

    // Validate input
    if (!gigId || !text) {
      return res.status(400).json({ message: 'Gig ID and message text are required' });
    }

    if (text.trim().length === 0) {
      return res.status(400).json({ message: 'Message cannot be empty' });
    }

    // Verify authorization
    const auth = await verifyMessagingAuth(gigId, req.user._id);
    if (!auth.authorized) {
      return res.status(403).json({ message: auth.message });
    }

    // Create message
    const message = await Message.create({
      gigId,
      senderId: req.user._id,
      receiverId: auth.otherUserId,
      text: text.trim()
    });

    await message.populate('senderId', 'name');

    // Real-time delivery is now handled by Socket.io events
    // Controller just returns success
    res.status(201).json({
      message: 'Message sent',
      data: message
    });
  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.getMessages = async (req, res) => {
  try {
    const { gigId } = req.params;

    // Verify authorization
    const auth = await verifyMessagingAuth(gigId, req.user._id);
    if (!auth.authorized) {
      return res.status(403).json({ message: auth.message });
    }

    // Fetch messages
    const messages = await Message.find({ gigId })
      .populate('senderId', 'name')
      .populate('receiverId', 'name')
      .sort({ createdAt: 1 });

    res.json({ messages });
  } catch (error) {
    console.error('Get messages error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};