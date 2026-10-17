const Movie = require('../models/Movie');
const Notification = require('../models/Notification');
const { reviewEvents, REVIEW_MODERATED } = require('./reviewEvents');
const { createReviewNotification } = require('../notifications/ReviewNotification');

// Observer: turns a moderation decision into a stored notification for the reviewer.
// NFR (reliability): any failure is caught and logged here, so a problem creating a
// notification can never make the moderator's approve/reject action fail.
const handleReviewModerated = async (review) => {
  try {
    const movie = await Movie.findById(review.movieId);
    const notification = createReviewNotification(review, movie ? movie.title : null);
    if (!notification) return;
    await Notification.create(notification.toDocument());
  } catch (error) {
    console.error('Failed to create review notification:', error.message);
  }
};

const registerNotificationListener = (emitter = reviewEvents) => {
  emitter.on(REVIEW_MODERATED, handleReviewModerated);
};

module.exports = { handleReviewModerated, registerNotificationListener };
