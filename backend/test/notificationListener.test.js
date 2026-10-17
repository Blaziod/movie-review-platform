const chai = require('chai');
const sinon = require('sinon');
const mongoose = require('mongoose');
const { EventEmitter } = require('events');
const Movie = require('../models/Movie');
const Notification = require('../models/Notification');
const { REVIEW_MODERATED } = require('../events/reviewEvents');
const { handleReviewModerated, registerNotificationListener } = require('../events/notificationListener');
const { expect } = chai;

const makeReview = (overrides = {}) => ({
  _id: new mongoose.Types.ObjectId(),
  userId: new mongoose.Types.ObjectId(),
  movieId: new mongoose.Types.ObjectId(),
  status: 'Approved',
  moderationReason: '',
  ...overrides,
});

describe('notificationListener (Observer)', () => {
  afterEach(() => {
    sinon.restore();
  });

  it('creates an approval notification using the movie title', async () => {
    sinon.stub(Movie, 'findById').resolves({ title: 'Frozen' });
    const createStub = sinon.stub(Notification, 'create').resolves();
    const review = makeReview({ status: 'Approved' });

    await handleReviewModerated(review);

    expect(createStub.calledOnce).to.be.true;
    const doc = createStub.firstCall.args[0];
    expect(doc.type).to.equal('review_approved');
    expect(doc.userId).to.equal(review.userId);
    expect(doc.message).to.contain('Frozen');
  });

  it('creates a rejection notification that carries the reason', async () => {
    sinon.stub(Movie, 'findById').resolves({ title: 'Frozen' });
    const createStub = sinon.stub(Notification, 'create').resolves();

    await handleReviewModerated(makeReview({ status: 'Rejected', moderationReason: 'Off topic review' }));

    const doc = createStub.firstCall.args[0];
    expect(doc.type).to.equal('review_rejected');
    expect(doc.message).to.contain('Off topic review');
  });

  it('still creates a notification when the movie no longer exists', async () => {
    sinon.stub(Movie, 'findById').resolves(null);
    const createStub = sinon.stub(Notification, 'create').resolves();

    await handleReviewModerated(makeReview());

    expect(createStub.firstCall.args[0].message).to.contain('a movie');
  });

  it('creates nothing for a review that is still Pending', async () => {
    sinon.stub(Movie, 'findById').resolves({ title: 'Frozen' });
    const createStub = sinon.stub(Notification, 'create').resolves();

    await handleReviewModerated(makeReview({ status: 'Pending' }));

    expect(createStub.called).to.be.false;
  });

  it('NFR reliability: swallows and logs a database failure instead of throwing', async () => {
    sinon.stub(Movie, 'findById').resolves({ title: 'Frozen' });
    sinon.stub(Notification, 'create').rejects(new Error('DB down'));
    const logStub = sinon.stub(console, 'error');

    let thrown = null;
    try {
      await handleReviewModerated(makeReview());
    } catch (error) {
      thrown = error;
    }

    expect(thrown).to.equal(null);
    expect(logStub.calledOnce).to.be.true;
  });

  it('registerNotificationListener subscribes the handler to the moderated event', async () => {
    sinon.stub(Movie, 'findById').resolves({ title: 'Frozen' });
    const createStub = sinon.stub(Notification, 'create').resolves();
    const emitter = new EventEmitter();

    registerNotificationListener(emitter);
    emitter.emit(REVIEW_MODERATED, makeReview());
    await new Promise((resolve) => setImmediate(resolve));

    expect(createStub.calledOnce).to.be.true;
  });
});
