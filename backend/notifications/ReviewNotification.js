// OOP (inheritance + polymorphism): ReviewNotification is an abstract base class.
// Each subclass supplies its own `type` and `buildMessage()`; callers only ever use
// `toDocument()` and never need to know which subclass they hold.
class ReviewNotification {
  constructor(review, movieTitle) {
    if (new.target === ReviewNotification) {
      throw new Error('ReviewNotification is abstract and cannot be instantiated directly');
    }
    this.review = review;
    this.movieTitle = movieTitle || 'a movie';
  }

  get type() {
    throw new Error('type must be implemented by a subclass');
  }

  buildMessage() {
    throw new Error('buildMessage must be implemented by a subclass');
  }

  // Encapsulation: the shape stored in MongoDB is decided here, in one place.
  toDocument() {
    return {
      userId: this.review.userId,
      reviewId: this.review._id,
      movieId: this.review.movieId,
      type: this.type,
      message: this.buildMessage(),
    };
  }
}

class ApprovedNotification extends ReviewNotification {
  get type() {
    return 'review_approved';
  }

  buildMessage() {
    return `Your review of "${this.movieTitle}" was approved and is now public.`;
  }
}

class RejectedNotification extends ReviewNotification {
  get type() {
    return 'review_rejected';
  }

  buildMessage() {
    return `Your review of "${this.movieTitle}" was rejected. Reason: ${this.review.moderationReason}`;
  }
}

// Picks the right subclass for a moderated review. Returns null for a review that
// has not been decided yet, so nothing is sent.
const createReviewNotification = (review, movieTitle) => {
  if (review.status === 'Approved') return new ApprovedNotification(review, movieTitle);
  if (review.status === 'Rejected') return new RejectedNotification(review, movieTitle);
  return null;
};

module.exports = {
  ReviewNotification,
  ApprovedNotification,
  RejectedNotification,
  createReviewNotification,
};
