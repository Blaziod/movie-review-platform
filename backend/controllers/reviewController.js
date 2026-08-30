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

module.exports = { submitReview, updateReview, withdrawReview };
