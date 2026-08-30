const Review = require('../models/Review');
const Movie = require('../models/Movie');

const MIN_TEXT_LENGTH = 20;

// US3.1 - As a reviewer, I want to submit a rating (1-5) + review text for a
// movie, so I can share my opinion.
const submitReview = async (req, res) => {
  const { movieId, rating, text } = req.body;

  if (!movieId) {
    return res.status(400).json({ message: 'A movie must be selected.' });
  }
  const ratingNum = Number(rating);
  if (!rating || Number.isNaN(ratingNum) || ratingNum < 1 || ratingNum > 5) {
    return res.status(400).json({ message: 'Please select a rating between 1 and 5.' });
  }
  if (!text || text.trim().length < MIN_TEXT_LENGTH) {
    return res.status(400).json({
      message: `Review must be at least ${MIN_TEXT_LENGTH} characters (currently ${text ? text.trim().length : 0}).`,
    });
  }

  try {
    const movie = await Movie.findById(movieId);
    if (!movie) {
      return res.status(404).json({ message: 'Movie not found' });
    }

    const review = await Review.create({
      movieId,
      userId: req.user.id,
      rating: ratingNum,
      text: text.trim(),
      status: 'Pending',
    });

    res.status(201).json(review);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { submitReview };
