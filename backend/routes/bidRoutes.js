// backend/routes/bidRoutes.js
const express = require('express');
const router = express.Router();
const { createBid, getBidsForGig, hireBid, getMyAssignedGigs, getMyApplications } = require('../controllers/bidController');
const { authenticate } = require('../middleware/auth');

router.post('/', authenticate, createBid);
router.get('/:gigId', authenticate, getBidsForGig);
router.patch('/:bidId/hire', authenticate, hireBid);
router.get('/assigned/me', authenticate, getMyAssignedGigs);
router.get('/applications/me', authenticate, getMyApplications);

module.exports = router;