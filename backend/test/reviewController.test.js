const chai = require('chai');
const sinon = require('sinon');
const Review = require('../models/Review');
const Movie = require('../models/Movie');
const {
  submitReview,
  updateReview,
  withdrawReview,
  getMyReviews,
  getPendingReviews,
  moderateReview,
} = require('../controllers/reviewController');
const { expect } = chai;

// US3.1 - As a reviewer, I want to submit a rating (1-5) + review text for a
// movie, so I can share my opinion.
describe('ReviewController - submitReview', () => {
  afterEach(() => {
    sinon.restore();
  });

  const validBody = {
    movieId: 'movie123',
    rating: 4,
    text: 'A genuinely solid film with strong performances throughout.',
  };

  it('should create a Pending review for a valid submission', async () => {
    const req = { body: { ...validBody }, user: { id: 'user123' } };
    const res = { status: sinon.stub().returnsThis(), json: sinon.spy() };

    sinon.stub(Movie, 'findById').resolves({ _id: 'movie123', title: 'Inception' });
    sinon.stub(Review, 'create').resolves({
      id: 'review1',
      movieId: 'movie123',
      userId: 'user123',
      rating: 4,
      text: validBody.text,
      status: 'Pending',
    });

    await submitReview(req, res);

    expect(res.status.calledWith(201)).to.be.true;
    expect(res.json.calledWithMatch({ status: 'Pending', rating: 4 })).to.be.true;
  });

  it('should return 404 when the movie does not exist', async () => {
    const req = { body: { ...validBody }, user: { id: 'user123' } };
    const res = { status: sinon.stub().returnsThis(), json: sinon.spy() };

    sinon.stub(Movie, 'findById').resolves(null);
    const createStub = sinon.stub(Review, 'create');

    await submitReview(req, res);

    expect(res.status.calledWith(404)).to.be.true;
    expect(createStub.called).to.be.false;
  });

  it('should return 400 when no movie is selected', async () => {
    const req = { body: { rating: 4, text: validBody.text }, user: { id: 'user123' } };
    const res = { status: sinon.stub().returnsThis(), json: sinon.spy() };

    await submitReview(req, res);

    expect(res.status.calledWith(400)).to.be.true;
    expect(res.json.calledWithMatch({ message: 'A movie must be selected.' })).to.be.true;
  });

  it('should return 400 when rating is missing', async () => {
    const req = { body: { movieId: 'movie123', text: validBody.text }, user: { id: 'user123' } };
    const res = { status: sinon.stub().returnsThis(), json: sinon.spy() };

    await submitReview(req, res);

    expect(res.status.calledWith(400)).to.be.true;
    expect(res.json.calledWithMatch({ message: 'Please select a rating between 1 and 5.' })).to.be.true;
  });

  it('should return 400 when rating is out of range', async () => {
    const req = { body: { ...validBody, rating: 7 }, user: { id: 'user123' } };
    const res = { status: sinon.stub().returnsThis(), json: sinon.spy() };

    await submitReview(req, res);

    expect(res.status.calledWith(400)).to.be.true;
  });

  it('should return 400 when review text is under 20 characters', async () => {
    const req = { body: { ...validBody, text: 'too short' }, user: { id: 'user123' } };
    const res = { status: sinon.stub().returnsThis(), json: sinon.spy() };

    await submitReview(req, res);

    expect(res.status.calledWith(400)).to.be.true;
    expect(res.json.calledWithMatch({ message: 'Review must be at least 20 characters (currently 9).' })).to.be
      .true;
  });
});

// US3.2 - As a reviewer, I want to edit/withdraw my own pending review, so I
// can correct mistakes before moderation.
describe('ReviewController - updateReview', () => {
  afterEach(() => {
    sinon.restore();
  });

  const makeReviewDoc = (overrides = {}) => {
    const doc = {
      userId: { toString: () => 'user123' },
      status: 'Pending',
      rating: 3,
      text: 'Original review text that is long enough.',
      ...overrides,
    };
    doc.save = sinon.stub().callsFake(async () => ({ ...doc }));
    return doc;
  };

  it('should update rating/text in place while Pending', async () => {
    const reviewDoc = makeReviewDoc();
    sinon.stub(Review, 'findById').resolves(reviewDoc);

    const req = {
      params: { id: 'review1' },
      user: { id: 'user123' },
      body: { rating: 5, text: 'Updated review text that is long enough.' },
    };
    const res = { status: sinon.stub().returnsThis(), json: sinon.spy() };

    await updateReview(req, res);

    expect(reviewDoc.rating).to.equal(5);
    expect(reviewDoc.text).to.equal('Updated review text that is long enough.');
    expect(reviewDoc.save.calledOnce).to.be.true;
    expect(res.status.called).to.be.false;
  });

  it('should return 404 when the review does not exist', async () => {
    sinon.stub(Review, 'findById').resolves(null);
    const req = { params: { id: 'missing' }, user: { id: 'user123' }, body: {} };
    const res = { status: sinon.stub().returnsThis(), json: sinon.spy() };

    await updateReview(req, res);

    expect(res.status.calledWith(404)).to.be.true;
  });

  it("should return 403 when editing someone else's review", async () => {
    sinon.stub(Review, 'findById').resolves(makeReviewDoc({ userId: { toString: () => 'someone-else' } }));
    const req = {
      params: { id: 'review1' },
      user: { id: 'user123' },
      body: { rating: 5, text: 'Updated review text that is long enough.' },
    };
    const res = { status: sinon.stub().returnsThis(), json: sinon.spy() };

    await updateReview(req, res);

    expect(res.status.calledWith(403)).to.be.true;
  });

  // AC: editing once Approved -> disabled (immutable after moderation).
  it('should return 409 when the review is no longer Pending', async () => {
    sinon.stub(Review, 'findById').resolves(makeReviewDoc({ status: 'Approved' }));
    const req = {
      params: { id: 'review1' },
      user: { id: 'user123' },
      body: { rating: 5, text: 'Updated review text that is long enough.' },
    };
    const res = { status: sinon.stub().returnsThis(), json: sinon.spy() };

    await updateReview(req, res);

    expect(res.status.calledWith(409)).to.be.true;
    expect(
      res.json.calledWithMatch({ message: 'This review has already been approved and can no longer be edited.' })
    ).to.be.true;
  });

  it('should return 400 for an invalid rating on update', async () => {
    sinon.stub(Review, 'findById').resolves(makeReviewDoc());
    const req = {
      params: { id: 'review1' },
      user: { id: 'user123' },
      body: { rating: 9, text: 'Updated review text that is long enough.' },
    };
    const res = { status: sinon.stub().returnsThis(), json: sinon.spy() };

    await updateReview(req, res);

    expect(res.status.calledWith(400)).to.be.true;
  });
});

describe('ReviewController - withdrawReview', () => {
  afterEach(() => {
    sinon.restore();
  });

  it('should withdraw (delete) a Pending review owned by the requester', async () => {
    const reviewDoc = {
      userId: { toString: () => 'user123' },
      status: 'Pending',
      deleteOne: sinon.stub().resolves(),
    };
    sinon.stub(Review, 'findById').resolves(reviewDoc);

    const req = { params: { id: 'review1' }, user: { id: 'user123' } };
    const res = { status: sinon.stub().returnsThis(), json: sinon.spy() };

    await withdrawReview(req, res);

    expect(reviewDoc.deleteOne.calledOnce).to.be.true;
    expect(res.json.calledWithMatch({ message: 'Review withdrawn' })).to.be.true;
  });

  it("should return 403 when withdrawing someone else's review", async () => {
    sinon.stub(Review, 'findById').resolves({
      userId: { toString: () => 'someone-else' },
      status: 'Pending',
      deleteOne: sinon.stub(),
    });
    const req = { params: { id: 'review1' }, user: { id: 'user123' } };
    const res = { status: sinon.stub().returnsThis(), json: sinon.spy() };

    await withdrawReview(req, res);

    expect(res.status.calledWith(403)).to.be.true;
  });

  it('should return 409 when the review is no longer Pending', async () => {
    sinon.stub(Review, 'findById').resolves({
      userId: { toString: () => 'user123' },
      status: 'Rejected',
      deleteOne: sinon.stub(),
    });
    const req = { params: { id: 'review1' }, user: { id: 'user123' } };
    const res = { status: sinon.stub().returnsThis(), json: sinon.spy() };

    await withdrawReview(req, res);

    expect(res.status.calledWith(409)).to.be.true;
  });

  it('should return 404 when the review does not exist', async () => {
    sinon.stub(Review, 'findById').resolves(null);
    const req = { params: { id: 'missing' }, user: { id: 'user123' } };
    const res = { status: sinon.stub().returnsThis(), json: sinon.spy() };

    await withdrawReview(req, res);

    expect(res.status.calledWith(404)).to.be.true;
  });
});

// US4.1 - As a moderator, I want a queue of pending reviews with
// reviewer/movie context, so I can assess them efficiently.
describe('ReviewController - getPendingReviews', () => {
  afterEach(() => {
    sinon.restore();
  });

  const makeQuery = (result) => {
    const query = {};
    query.sort = sinon.stub().returns(query);
    query.populate = sinon.stub().returns(query);
    query.then = (resolve) => resolve(result);
    return query;
  };

  it('should return pending reviews sorted oldest-first with movie/reviewer context', async () => {
    const fakeReviews = [
      { _id: 'r1', status: 'Pending', movieId: { title: 'Inception' }, userId: { name: 'Jane' } },
    ];
    const query = makeQuery(fakeReviews);
    sinon.stub(Review, 'find').returns(query);

    const req = {};
    const res = { status: sinon.stub().returnsThis(), json: sinon.spy() };

    await getPendingReviews(req, res);

    expect(Review.find.calledWith({ status: 'Pending' })).to.be.true;
    expect(query.sort.calledWith({ createdAt: 1 })).to.be.true;
    expect(res.json.calledWith(fakeReviews)).to.be.true;
  });
});

// US4.2 - As a moderator, I want to approve/reject a review with a reason.
describe('ReviewController - moderateReview', () => {
  afterEach(() => {
    sinon.restore();
  });

  const makeReviewDoc = (overrides = {}) => {
    const doc = { status: 'Pending', movieId: 'movie123', ...overrides };
    doc.save = sinon.stub().callsFake(async () => doc);
    return doc;
  };

  it('should approve a Pending review and recalculate the movie rating', async () => {
    const reviewDoc = makeReviewDoc();
    sinon.stub(Review, 'findById').resolves(reviewDoc);
    sinon.stub(Review, 'aggregate').resolves([{ avgRating: 4.5, count: 2 }]);
    sinon.stub(Movie, 'findByIdAndUpdate').resolves();

    const req = { params: { id: 'review1' }, body: { decision: 'approve' } };
    const res = { status: sinon.stub().returnsThis(), json: sinon.spy() };

    await moderateReview(req, res);

    expect(reviewDoc.status).to.equal('Approved');
    expect(Movie.findByIdAndUpdate.calledWith('movie123', { avgRating: 4.5, reviewCount: 2 })).to.be.true;
    expect(res.status.called).to.be.false;
  });

  it('should reject a Pending review with a valid reason', async () => {
    const reviewDoc = makeReviewDoc();
    sinon.stub(Review, 'findById').resolves(reviewDoc);

    const req = { params: { id: 'review1' }, body: { decision: 'reject', reason: 'Contains spoilers unrelated to the plot.' } };
    const res = { status: sinon.stub().returnsThis(), json: sinon.spy() };

    await moderateReview(req, res);

    expect(reviewDoc.status).to.equal('Rejected');
    expect(reviewDoc.moderationReason).to.equal('Contains spoilers unrelated to the plot.');
  });

  it('should return 400 when rejecting with a reason under 10 characters', async () => {
    sinon.stub(Review, 'findById').resolves(makeReviewDoc());

    const req = { params: { id: 'review1' }, body: { decision: 'reject', reason: 'too short' } };
    const res = { status: sinon.stub().returnsThis(), json: sinon.spy() };

    await moderateReview(req, res);

    expect(res.status.calledWith(400)).to.be.true;
  });

  it('should return 409 when the review has already been moderated', async () => {
    sinon.stub(Review, 'findById').resolves(makeReviewDoc({ status: 'Approved' }));

    const req = { params: { id: 'review1' }, body: { decision: 'approve' } };
    const res = { status: sinon.stub().returnsThis(), json: sinon.spy() };

    await moderateReview(req, res);

    expect(res.status.calledWith(409)).to.be.true;
  });

  it('should return 404 when the review does not exist', async () => {
    sinon.stub(Review, 'findById').resolves(null);

    const req = { params: { id: 'missing' }, body: { decision: 'approve' } };
    const res = { status: sinon.stub().returnsThis(), json: sinon.spy() };

    await moderateReview(req, res);

    expect(res.status.calledWith(404)).to.be.true;
  });

  it('should return 400 for an invalid decision value', async () => {
    sinon.stub(Review, 'findById').resolves(makeReviewDoc());

    const req = { params: { id: 'review1' }, body: { decision: 'maybe' } };
    const res = { status: sinon.stub().returnsThis(), json: sinon.spy() };

    await moderateReview(req, res);

    expect(res.status.calledWith(400)).to.be.true;
  });
});

// US3.3 - As a reviewer, I want to see my reviews' status (Pending/
// Approved/Rejected + reason), so I know the outcome.
describe('ReviewController - getMyReviews', () => {
  afterEach(() => {
    sinon.restore();
  });

  it("should return only the requesting user's reviews, newest first", async () => {
    const fakeReviews = [{ _id: 'r1', status: 'Approved', movieId: { title: 'Inception' } }];
    const query = {};
    query.sort = sinon.stub().returns(query);
    query.populate = sinon.stub().returns(query);
    query.then = (resolve) => resolve(fakeReviews);
    sinon.stub(Review, 'find').returns(query);

    const req = { user: { id: 'user123' } };
    const res = { status: sinon.stub().returnsThis(), json: sinon.spy() };

    await getMyReviews(req, res);

    expect(Review.find.calledWith({ userId: 'user123' })).to.be.true;
    expect(query.sort.calledWith({ createdAt: -1 })).to.be.true;
    expect(res.json.calledWith(fakeReviews)).to.be.true;
  });
});
