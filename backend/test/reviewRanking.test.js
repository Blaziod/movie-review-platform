const chai = require('chai');
const sinon = require('sinon');
const mongoose = require('mongoose');
const Review = require('../models/Review');
const Movie = require('../models/Movie');
const { reviewEvents, REVIEW_MODERATED } = require('../events/reviewEvents');
const { toggleHelpful, moderateReview } = require('../controllers/reviewController');
const { getMovieById } = require('../controllers/movieController');
const { expect } = chai;

const makeRes = () => ({ status: sinon.stub().returnsThis(), json: sinon.spy() });
const id = () => new mongoose.Types.ObjectId();

describe('ReviewController - toggleHelpful', () => {
  afterEach(() => sinon.restore());

  const approvedReview = (overrides = {}) => ({ _id: id(), userId: id(), status: 'Approved', ...overrides });

  it('adds a helpful vote for a user who has not voted yet', async () => {
    const review = approvedReview();
    sinon.stub(Review, 'findById').resolves(review);
    const updateStub = sinon.stub(Review, 'findOneAndUpdate').resolves({ helpfulCount: 3 });
    const voter = id().toString();
    const res = makeRes();

    await toggleHelpful({ params: { id: 'r1' }, user: { id: voter } }, res);

    expect(updateStub.calledOnce).to.be.true;
    expect(updateStub.firstCall.args[1]).to.deep.equal({
      $addToSet: { helpfulVoters: voter },
      $inc: { helpfulCount: 1 },
    });
    expect(res.json.calledWith({ helpfulCount: 3, voted: true })).to.be.true;
  });

  it('removes the vote when the user had already voted', async () => {
    sinon.stub(Review, 'findById').resolves(approvedReview());
    const updateStub = sinon.stub(Review, 'findOneAndUpdate');
    updateStub.onFirstCall().resolves(null); // already in helpfulVoters, so the add did not match
    updateStub.onSecondCall().resolves({ helpfulCount: 2 });
    const voter = id().toString();
    const res = makeRes();

    await toggleHelpful({ params: { id: 'r1' }, user: { id: voter } }, res);

    expect(updateStub.secondCall.args[1]).to.deep.equal({
      $pull: { helpfulVoters: voter },
      $inc: { helpfulCount: -1 },
    });
    expect(res.json.calledWith({ helpfulCount: 2, voted: false })).to.be.true;
  });

  it('returns 404 when the review does not exist', async () => {
    sinon.stub(Review, 'findById').resolves(null);
    const res = makeRes();

    await toggleHelpful({ params: { id: 'missing' }, user: { id: id().toString() } }, res);

    expect(res.status.calledWith(404)).to.be.true;
  });

  it('returns 409 when the review is not approved', async () => {
    sinon.stub(Review, 'findById').resolves(approvedReview({ status: 'Pending' }));
    const res = makeRes();

    await toggleHelpful({ params: { id: 'r1' }, user: { id: id().toString() } }, res);

    expect(res.status.calledWith(409)).to.be.true;
  });

  it('returns 403 when a user tries to mark their own review helpful', async () => {
    const author = id();
    sinon.stub(Review, 'findById').resolves(approvedReview({ userId: author }));
    const updateStub = sinon.stub(Review, 'findOneAndUpdate');
    const res = makeRes();

    await toggleHelpful({ params: { id: 'r1' }, user: { id: author.toString() } }, res);

    expect(res.status.calledWith(403)).to.be.true;
    expect(updateStub.called).to.be.false;
  });

  it('returns 500 when the database fails', async () => {
    sinon.stub(Review, 'findById').throws(new Error('DB Error'));
    const res = makeRes();

    await toggleHelpful({ params: { id: 'r1' }, user: { id: id().toString() } }, res);

    expect(res.status.calledWith(500)).to.be.true;
  });
});

describe('ReviewController - moderateReview announces the decision (Observer)', () => {
  afterEach(() => sinon.restore());

  const pendingReview = () => ({
    _id: id(),
    movieId: id(),
    status: 'Pending',
    moderationReason: '',
    save: sinon.stub().resolvesThis(),
  });

  it('emits review.moderated after an approval', async () => {
    const review = pendingReview();
    sinon.stub(Review, 'findById').resolves(review);
    sinon.stub(Review, 'aggregate').resolves([{ avgRating: 4, count: 1 }]);
    sinon.stub(Movie, 'findByIdAndUpdate').resolves();
    const emitSpy = sinon.spy(reviewEvents, 'emit');
    const res = makeRes();

    await moderateReview({ params: { id: 'r1' }, body: { decision: 'approve' } }, res);

    expect(emitSpy.calledWith(REVIEW_MODERATED, review)).to.be.true;
    expect(res.json.calledWith(review)).to.be.true;
  });

  it('emits review.moderated after a rejection', async () => {
    const review = pendingReview();
    sinon.stub(Review, 'findById').resolves(review);
    const emitSpy = sinon.spy(reviewEvents, 'emit');
    const res = makeRes();

    await moderateReview(
      { params: { id: 'r1' }, body: { decision: 'reject', reason: 'Not a real review' } },
      res
    );

    expect(emitSpy.calledWith(REVIEW_MODERATED, review)).to.be.true;
    expect(review.status).to.equal('Rejected');
  });

  it('does not emit when the rejection is invalid', async () => {
    sinon.stub(Review, 'findById').resolves(pendingReview());
    const emitSpy = sinon.spy(reviewEvents, 'emit');
    const res = makeRes();

    await moderateReview({ params: { id: 'r1' }, body: { decision: 'reject', reason: 'short' } }, res);

    expect(emitSpy.called).to.be.false;
    expect(res.status.calledWith(400)).to.be.true;
  });
});

describe('MovieController - getMovieById review ordering (Strategy)', () => {
  afterEach(() => sinon.restore());

  const makeReviewQuery = (result) => {
    const query = {};
    query.sort = sinon.stub().returns(query);
    query.populate = sinon.stub().resolves(result);
    return query;
  };

  it('orders reviews with the strategy chosen by ?sort=', async () => {
    sinon.stub(Movie, 'findById').resolves({ _id: id(), title: 'Frozen' });
    const query = makeReviewQuery([]);
    sinon.stub(Review, 'find').returns(query);

    await getMovieById({ params: { id: 'm1' }, query: { sort: 'helpful' } }, makeRes());

    expect(query.sort.calledWith({ helpfulCount: -1, createdAt: -1 })).to.be.true;
  });

  it('defaults to newest-first when no sort is given', async () => {
    sinon.stub(Movie, 'findById').resolves({ _id: id(), title: 'Frozen' });
    const query = makeReviewQuery([]);
    sinon.stub(Review, 'find').returns(query);

    await getMovieById({ params: { id: 'm1' }, query: {} }, makeRes());

    expect(query.sort.calledWith({ createdAt: -1 })).to.be.true;
  });

  it('still returns only approved reviews', async () => {
    const movie = { _id: id(), title: 'Frozen' };
    sinon.stub(Movie, 'findById').resolves(movie);
    const query = makeReviewQuery([]);
    const findStub = sinon.stub(Review, 'find').returns(query);

    await getMovieById({ params: { id: 'm1' }, query: { sort: 'highest' } }, makeRes());

    expect(findStub.calledWith({ movieId: movie._id, status: 'Approved' })).to.be.true;
  });
});
