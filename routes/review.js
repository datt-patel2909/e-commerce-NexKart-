const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/authentication');
const { createReview, getProductReviews } = require('../controllers/review');

router.post('/', auth, createReview);
router.get('/:id', getProductReviews);

module.exports = router;
