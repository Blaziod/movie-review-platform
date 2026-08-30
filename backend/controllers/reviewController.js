const Review = require('../models/Review');
const Movie = require('../models/Movie');

const MIN_TEXT_LENGTH = 20;

const validateRatingAndText = (rating, text) => {
  const ratingNum = Number(rating);
  if (!rating || Number.isNaN(ratingNum) || ratingNum < 1 || ratingNum > 5) {
    return 'Please select a rating between 1 and 5.';
  }
  if (!text || text.trim().length < MIN_TEXT_LENGTH) {
    return `Review must be at least ${MIN_TEXT_LENGTH} characters (currently ${text ? text.trim().length : 0}).`;
  }
  return null;
};

// US3.1 - As a reviewer, I want to submit a rating (1-5) + review text for a
// movie, so I can share my opinion.
const submitReview = async (req, res) => {
  const { movieId, rating, text } = req.body;

  if (!movieId) {
    return res.status(400).json({ message: 'A movie must be selected.' });
  }
  const validationError = validateRatingAndText(rating, text);
  if (validationError) {
    return res.status(400).json({ message: validationError });
  }

  try {
    const movie = await Movie.findById(movieId);
    if (!movie) {
      return res.status(404).json({ message: 'Movie not found' });
    }

    const review = await Review.create({
      movieId,
      userId: req.user.id,
      rating: Number(rating),
      text: text.trim(),
      status: 'Pending',
    });

    res.status(201).json(review);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// US3.2 - As a reviewer, I want to edit/withdraw my own pending review, so I
// can correct mistakes before moderation.

const updateReview = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }
    if (review.userId.toString() !== req.user.id) {
      return res.status(403).json({ message: 'You can only edit your own reviews.' });
    }
    if (review.status !== 'Pending') {
      return res.status(409).json({
        message: `This review has already been ${review.status.toLowerCase()} and can no longer be edited.`,
      });
    }

    const { rating, text } = req.body;
    const validationError = validateRatingAndText(rating, text);
    if (validationError) {
      return res.status(400).json({ message: validationError });
    }

    review.rating = Number(rating);
    review.text = text.trim();
    const updated = await review.save();
    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// US3.2 (withdraw) - a reviewer can remove their own review while it's still
// Pending. Once moderated, the same immutability rule as editing applies.
const withdrawReview = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }
    if (review.userId.toString() !== req.user.id) {
      return res.status(403).json({ message: 'You can only withdraw your own reviews.' });
    }
    if (review.status !== 'Pending') {
      return res.status(409).json({
        message: `This review has already been ${review.status.toLowerCase()} and can no longer be withdrawn.`,
      });
    }

    await review.deleteOne();
    res.json({ message: 'Review withdrawn' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// US3.3 - As a reviewer, I want to see my reviews' status (Pending/
// Approved/Rejected + reason), so I know the outcome.
const getMyReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ userId: req.user.id })
      .sort({ createdAt: -1 })
      .populate('movieId', 'title');
    res.json(reviews);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// US4.1 - As a moderator, I want a queue of pending reviews with
// reviewer/movie context, so I can assess them efficiently.
const getPendingReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ status: 'Pending' })
      .sort({ createdAt: 1 })
      .populate('movieId', 'title')
      .populate('userId', 'name');
    res.json(reviews);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const recalculateMovieRating = async (movieId) => {
  const [stats] = await Review.aggregate([
    { $match: { movieId, status: 'Approved' } },
    { $group: { _id: null, avgRating: { $avg: '$rating' }, count: { $sum: 1 } } },
  ]);
  await Movie.findByIdAndUpdate(movieId, {
    avgRating: stats ? Math.round(stats.avgRating * 10) / 10 : 0,
    reviewCount: stats ? stats.count : 0,
  });
};

// US4.2 - As a moderator, I want to approve/reject a review with a reason,
// so content quality is controlled and reviewers get feedback.
const moderateReview = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }
    if (review.status !== 'Pending') {
      return res.status(409).json({ message: `This review has already been ${review.status.toLowerCase()}.` });
    }

    const { decision, reason } = req.body;

    if (decision === 'approve') {
      review.status = 'Approved';
      await review.save();
      await recalculateMovieRating(review.movieId);
      return res.json(review);
    }

    if (decision === 'reject') {
      if (!reason || reason.trim().length < 10) {
        return res.status(400).json({ message: 'Reason must be at least 10 characters.' });
      }
      review.status = 'Rejected';
      review.moderationReason = reason.trim();
      await review.save();
      return res.json(review);
    }

    return res.status(400).json({ message: "Decision must be 'approve' or 'reject'." });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  submitReview,
  updateReview,
  withdrawReview,
  getMyReviews,
  getPendingReviews,
  moderateReview,
};
