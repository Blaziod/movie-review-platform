const express = require('express');
const {
  submitReview,
  updateReview,
  withdrawReview,
  getMyReviews,
  getPendingReviews,
  moderateReview,
} = require('../controllers/reviewController');
const { protect, requireAdmin } = require('../middleware/authMiddleware');
const router = express.Router();

router.post('/', protect, submitReview);
router.get('/mine', protect, getMyReviews);
router.get('/pending', protect, requireAdmin, getPendingReviews);
router.put('/:id', protect, updateReview);
router.delete('/:id', protect, withdrawReview);
router.patch('/:id/moderate', protect, requireAdmin, moderateReview);

module.exports = router;
