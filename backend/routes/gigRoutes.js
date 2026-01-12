// backend/routes/gigRoutes.js
const express = require('express');
const router = express.Router();
const { createGig, getGigs, getMyPostedGigs, completeGig } = require('../controllers/gigController');
const { authenticate } = require('../middleware/auth');

router.get('/', getGigs);
router.post('/', authenticate, createGig);
router.get('/my-posted', authenticate, getMyPostedGigs);
router.patch('/:gigId/complete', authenticate, completeGig);

module.exports = router;