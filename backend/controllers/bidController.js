// backend/controllers/bidController.js
const Bid = require('../models/Bid');
const Gig = require('../models/Gig');
const mongoose = require('mongoose');

exports.createBid = async (req, res) => {
  try {
    const { gigId, message, price } = req.body;

    // Validate input
    if (!gigId || !message || !price) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    if (price <= 0) {
      return res.status(400).json({ message: 'Price must be greater than 0' });
    }

    // Check if gig exists and is open
    const gig = await Gig.findById(gigId);
    if (!gig) {
      return res.status(404).json({ message: 'Gig not found' });
    }

    if (gig.status !== 'open') {
      return res.status(400).json({ message: 'This gig is no longer accepting bids' });
    }

    // Prevent owner from bidding on own gig
    if (gig.ownerId.toString() === req.user._id.toString()) {
      return res.status(403).json({ message: 'Cannot bid on your own gig' });
    }

    // Create bid
    const bid = await Bid.create({
      gigId,
      freelancerId: req.user._id,
      message,
      price
    });

    await bid.populate('freelancerId', 'name email');

    res.status(201).json({
      message: 'Bid submitted successfully',
      bid
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: 'You have already bid on this gig' });
    }
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.getBidsForGig = async (req, res) => {
  try {
    const { gigId } = req.params;

    // Check if gig exists
    const gig = await Gig.findById(gigId);
    if (!gig) {
      return res.status(404).json({ message: 'Gig not found' });
    }

    // Only gig owner can view bids
    if (gig.ownerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Only gig owner can view bids' });
    }

    const bids = await Bid.find({ gigId })
      .populate('freelancerId', 'name email')
      .sort({ createdAt: -1 });

    res.json({ bids });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

/**
 * CRITICAL HIRING LOGIC
 * When hiring a freelancer:
 * 1. Verify the gig owner is making the request
 * 2. Check the gig is still open
 * 3. Use a MongoDB session for atomic transaction:
 *    - Mark the selected bid as 'hired'
 *    - Mark all other bids for the same gig as 'rejected'
 *    - Change gig status from 'open' to 'assigned'
 * 4. All changes commit together or none at all
 */
exports.hireBid = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { bidId } = req.params;

    // Find bid with gig details
    const bid = await Bid.findById(bidId).populate('gigId').session(session);
    if (!bid) {
      await session.abortTransaction();
      return res.status(404).json({ message: 'Bid not found' });
    }

    const gig = bid.gigId;

    // Verify gig owner
    if (gig.ownerId.toString() !== req.user._id.toString()) {
      await session.abortTransaction();
      return res.status(403).json({ message: 'Only gig owner can hire freelancers' });
    }

    // Check gig is still open
    if (gig.status !== 'open') {
      await session.abortTransaction();
      return res.status(400).json({ message: 'This gig has already been assigned' });
    }

    // ATOMIC OPERATIONS:
    
    // 1. Mark selected bid as hired
    bid.status = 'hired';
    await bid.save({ session });

    // 2. Reject all other bids for this gig
    await Bid.updateMany(
      { 
        gigId: gig._id, 
        _id: { $ne: bidId },
        status: 'pending'
      },
      { status: 'rejected' },
      { session }
    );

    // 3. Mark gig as assigned
    gig.status = 'assigned';
    await gig.save({ session });

    // Commit all changes atomically
    await session.commitTransaction();

    await bid.populate('freelancerId', 'name email');

    // Send real-time notification to hired freelancer
    const io = req.app.get('io');
    const connectedUsers = req.app.get('connectedUsers');
    const freelancerSocketId = connectedUsers.get(bid.freelancerId._id.toString());

    if (freelancerSocketId) {
      io.to(freelancerSocketId).emit('hired', {
        message: `You have been hired for "${gig.title}"!`,
        gigId: gig._id,
        gigTitle: gig.title,
        clientName: req.user.name,
        bidPrice: bid.price
      });
      console.log(`Notification sent to freelancer ${bid.freelancerId._id}`);
    }

    res.json({
      message: 'Freelancer hired successfully',
      bid
    });
  } catch (error) {
    await session.abortTransaction();
    res.status(500).json({ message: 'Server error', error: error.message });
  } finally {
    session.endSession();
  }
};

exports.getMyAssignedGigs = async (req, res) => {
  try {
    // Find all bids where user is hired
    const hiredBids = await Bid.find({
      freelancerId: req.user._id,
      status: 'hired'
    })
      .populate('gigId')
      .populate('freelancerId', 'name email')
      .sort({ createdAt: -1 });

    // Filter out null gigs (in case gig was deleted)
    const validBids = hiredBids.filter(bid => bid.gigId);

    res.json({ bids: validBids });
  } catch (error) {
    console.error('Get assigned gigs error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.getMyApplications = async (req, res) => {
  try {
    const bids = await Bid.find({ freelancerId: req.user._id })
      .populate('gigId')
      .populate('freelancerId', 'name email')
      .sort({ createdAt: -1 });

    // Filter out null gigs and exclude hired bids (they're in Assigned To Me)
    const validBids = bids.filter(bid => bid.gigId && bid.status !== 'hired');

    res.json({ bids: validBids });
  } catch (error) {
    console.error('Get my applications error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};