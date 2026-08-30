const chai = require('chai');
const sinon = require('sinon');
const Review = require('../models/Review');
const Movie = require('../models/Movie');
const { submitReview } = require('../controllers/reviewController');
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
