const chai = require('chai');
const mongoose = require('mongoose');
const {
  ReviewNotification,
  ApprovedNotification,
  RejectedNotification,
  createReviewNotification,
} = require('../notifications/ReviewNotification');
const { expect } = chai;

const makeReview = (overrides = {}) => ({
  _id: new mongoose.Types.ObjectId(),
  userId: new mongoose.Types.ObjectId(),
  movieId: new mongoose.Types.ObjectId(),
  status: 'Approved',
  moderationReason: '',
  ...overrides,
});

describe('ReviewNotification (OOP: inheritance + polymorphism)', () => {
  it('cannot be instantiated directly because it is abstract', () => {
    expect(() => new ReviewNotification(makeReview(), 'Frozen')).to.throw(/abstract/);
  });

  it('ApprovedNotification builds an approval message and type', () => {
    const notification = new ApprovedNotification(makeReview(), 'Frozen');
    expect(notification.type).to.equal('review_approved');
    expect(notification.buildMessage()).to.equal('Your review of "Frozen" was approved and is now public.');
  });

  it('RejectedNotification includes the moderator reason in its message', () => {
    const review = makeReview({ status: 'Rejected', moderationReason: 'Contains spoilers' });
    const notification = new RejectedNotification(review, 'Frozen');
    expect(notification.type).to.equal('review_rejected');
    expect(notification.buildMessage()).to.equal(
      'Your review of "Frozen" was rejected. Reason: Contains spoilers'
    );
  });

  it('toDocument() returns the record to store, whichever subclass it is called on', () => {
    const review = makeReview();
    const doc = new ApprovedNotification(review, 'Frozen').toDocument();
    expect(doc).to.deep.equal({
      userId: review.userId,
      reviewId: review._id,
      movieId: review.movieId,
      type: 'review_approved',
      message: 'Your review of "Frozen" was approved and is now public.',
    });
  });

  it('falls back to a generic title when the movie is unknown', () => {
    const notification = new ApprovedNotification(makeReview(), null);
    expect(notification.buildMessage()).to.contain('"a movie"');
  });
});

describe('createReviewNotification (factory)', () => {
  it('returns an ApprovedNotification for an approved review', () => {
    expect(createReviewNotification(makeReview({ status: 'Approved' }), 'X')).to.be.instanceOf(ApprovedNotification);
  });

  it('returns a RejectedNotification for a rejected review', () => {
    expect(createReviewNotification(makeReview({ status: 'Rejected' }), 'X')).to.be.instanceOf(RejectedNotification);
  });

  it('returns null for a review that has not been decided yet', () => {
    expect(createReviewNotification(makeReview({ status: 'Pending' }), 'X')).to.equal(null);
  });
});
