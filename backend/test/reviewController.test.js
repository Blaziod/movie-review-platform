const chai = require('chai');
const sinon = require('sinon');
const Review = require('../models/Review');
const Movie = require('../models/Movie');
const { submitReview, updateReview, withdrawReview } = require('../controllers/reviewController');
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
