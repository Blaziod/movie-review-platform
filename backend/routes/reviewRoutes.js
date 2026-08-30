const express = require('express');
const { submitReview, updateReview, withdrawReview } = require('../controllers/reviewController');
const { protect } = require('../middleware/authMiddleware');
const router = express.Router();

router.post('/', protect, submitReview);
router.put('/:id', protect, updateReview);
router.delete('/:id', protect, withdrawReview);

module.exports = router;
