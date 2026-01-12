// backend/controllers/gigController.js
const Gig = require('../models/Gig');

const createGig = async (req, res) => {
  try {
    const { title, description, budget } = req.body;

    // Validate input
    if (!title || !description || !budget) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    if (budget <= 0) {
      return res.status(400).json({ message: 'Budget must be greater than 0' });
    }

    // Create gig
    const gig = await Gig.create({
      title,
      description,
      budget,
      ownerId: req.user._id
    });

    // Populate owner details
    await gig.populate('ownerId', 'name email');

    res.status(201).json({
      message: 'Gig created successfully',
      gig
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const getGigs = async (req, res) => {
  try {
    const { search } = req.query;
    
    // Build query - only show OPEN gigs
    const query = { status: 'open' };
    
    // Add search filter if provided
    if (search) {
      query.title = { $regex: search, $options: 'i' };
    }

    const gigs = await Gig.find(query)
      .populate('ownerId', 'name email')
      .sort({ createdAt: -1 });

    res.json({ gigs });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const getMyPostedGigs = async (req, res) => {
  try {
    const gigs = await Gig.find({ ownerId: req.user._id })
      .populate('ownerId', 'name email')
      .sort({ createdAt: -1 });

    // For assigned gigs, populate hired freelancer info
    const Bid = require('../models/Bid');
    const gigsWithFreelancer = await Promise.all(
      gigs.map(async (gig) => {
        if (gig.status === 'assigned' || gig.status === 'completed') {
          const hiredBid = await Bid.findOne({ 
            gigId: gig._id, 
            status: 'hired' 
          }).populate('freelancerId', 'name email');
          
          return {
            ...gig.toObject(),
            hiredFreelancer: hiredBid ? hiredBid.freelancerId : null
          };
        }
        return gig.toObject();
      })
    );

    res.json({ gigs: gigsWithFreelancer });
  } catch (error) {
    console.error('Get my posted gigs error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const completeGig = async (req, res) => {
  try {
    const { gigId } = req.params;

    // Find gig
    const gig = await Gig.findById(gigId);
    if (!gig) {
      return res.status(404).json({ message: 'Gig not found' });
    }

    // Check if gig is assigned
    if (gig.status !== 'assigned') {
      return res.status(400).json({ message: 'Only assigned gigs can be marked as completed' });
    }

    // Find the hired bid to get the freelancer
    const Bid = require('../models/Bid');
    const hiredBid = await Bid.findOne({ gigId, status: 'hired' });

    if (!hiredBid) {
      return res.status(404).json({ message: 'No hired freelancer found for this gig' });
    }

    // Authorization: Only gig owner OR hired freelancer can mark as completed
    const isOwner = gig.ownerId.toString() === req.user._id.toString();
    const isHiredFreelancer = hiredBid.freelancerId.toString() === req.user._id.toString();

    if (!isOwner && !isHiredFreelancer) {
      return res.status(403).json({ 
        message: 'Only gig owner or hired freelancer can mark as completed' 
      });
    }

    // Mark as completed
    gig.status = 'completed';
    await gig.save();

    await gig.populate('ownerId', 'name email');

    res.json({
      message: 'Gig marked as completed',
      gig
    });
  } catch (error) {
    console.error('Complete gig error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = {
  createGig,
  getGigs,
  getMyPostedGigs,
  completeGig
};