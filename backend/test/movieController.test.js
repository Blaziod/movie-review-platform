const chai = require('chai');
const sinon = require('sinon');
const mongoose = require('mongoose');
const Movie = require('../models/Movie');
const { addMovie, updateMovie, deleteMovie } = require('../controllers/movieController');
const { expect } = chai;

// US2.1 - As an admin, I want to add a movie (title, year, genre, synopsis),
// so the catalog stays current.
describe('MovieController - addMovie', () => {
  afterEach(() => {
    sinon.restore();
  });

  it('should create a movie with valid fields', async () => {
    const req = {
      body: { title: 'Inception', year: 2010, genre: 'Sci-Fi', synopsis: 'A mind-bending heist.' },
    };
    const res = { status: sinon.stub().returnsThis(), json: sinon.spy() };

    sinon.stub(Movie, 'create').resolves({
      id: 'movie123',
      title: 'Inception',
      year: 2010,
      genre: 'Sci-Fi',
      synopsis: 'A mind-bending heist.',
      avgRating: 0,
    });

    await addMovie(req, res);

    expect(res.status.calledWith(201)).to.be.true;
    expect(res.json.calledWithMatch({ title: 'Inception', year: 2010 })).to.be.true;
  });

  it('should return 400 when title is missing', async () => {
    const req = { body: { year: 2010, genre: 'Sci-Fi' } };
    const res = { status: sinon.stub().returnsThis(), json: sinon.spy() };

    await addMovie(req, res);

    expect(res.status.calledWith(400)).to.be.true;
    expect(res.json.calledWithMatch({ message: 'Title is required.' })).to.be.true;
  });

  it('should return 400 when year is missing', async () => {
    const req = { body: { title: 'Inception', genre: 'Sci-Fi' } };
    const res = { status: sinon.stub().returnsThis(), json: sinon.spy() };

    await addMovie(req, res);

    expect(res.status.calledWith(400)).to.be.true;
  });

  it('should return 400 when year is out of range', async () => {
    const req = { body: { title: 'Inception', year: 1899, genre: 'Sci-Fi' } };
    const res = { status: sinon.stub().returnsThis(), json: sinon.spy() };

    await addMovie(req, res);

    expect(res.status.calledWith(400)).to.be.true;
  });

  it('should return 400 when genre is missing', async () => {
    const req = { body: { title: 'Inception', year: 2010 } };
    const res = { status: sinon.stub().returnsThis(), json: sinon.spy() };

    await addMovie(req, res);

    expect(res.status.calledWith(400)).to.be.true;
    expect(res.json.calledWithMatch({ message: 'Genre is required.' })).to.be.true;
  });
});

// US2.2 - As an admin, I want to edit or remove a movie, so I can correct
// errors or retire titles.
describe('MovieController - updateMovie', () => {
  afterEach(() => {
    sinon.restore();
  });

  const makeMovieDoc = (overrides = {}) => {
    const doc = {
      title: 'Old Title',
      year: 2000,
      genre: 'Drama',
      synopsis: 'Old synopsis',
      ...overrides,
    };
    doc.save = sinon.stub().callsFake(async () => ({ ...doc }));
    return doc;
  };

  it('should update the movie in place (no duplicate created)', async () => {
    const movieDoc = makeMovieDoc();
    sinon.stub(Movie, 'findById').resolves(movieDoc);

    const req = { params: { id: 'movie123' }, body: { title: 'New Title', year: 2020 } };
    const res = { status: sinon.stub().returnsThis(), json: sinon.spy() };

    await updateMovie(req, res);

    expect(movieDoc.title).to.equal('New Title');
    expect(movieDoc.year).to.equal(2020);
    expect(movieDoc.save.calledOnce).to.be.true;
    expect(res.json.calledWithMatch({ title: 'New Title', year: 2020 })).to.be.true;
  });

  it('should return 404 when the movie does not exist', async () => {
    sinon.stub(Movie, 'findById').resolves(null);
    const req = { params: { id: 'missing' }, body: { title: 'X' } };
    const res = { status: sinon.stub().returnsThis(), json: sinon.spy() };

    await updateMovie(req, res);

    expect(res.status.calledWith(404)).to.be.true;
  });

  it('should return 400 for an invalid year on update', async () => {
    sinon.stub(Movie, 'findById').resolves(makeMovieDoc());
    const req = { params: { id: 'movie123' }, body: { year: 1800 } };
    const res = { status: sinon.stub().returnsThis(), json: sinon.spy() };

    await updateMovie(req, res);

    expect(res.status.calledWith(400)).to.be.true;
  });
});

describe('MovieController - deleteMovie', () => {
  afterEach(() => {
    sinon.restore();
  });

  const stubApprovedReviewCount = (count) => {
    sinon.stub(mongoose.connection, 'collection').returns({
      countDocuments: sinon.stub().resolves(count),
    });
  };

  it('should delete immediately when the movie has no approved reviews', async () => {
    const movieDoc = { _id: 'movie123', deleteOne: sinon.stub().resolves() };
    sinon.stub(Movie, 'findById').resolves(movieDoc);
    stubApprovedReviewCount(0);

    const req = { params: { id: 'movie123' }, query: {} };
    const res = { status: sinon.stub().returnsThis(), json: sinon.spy() };

    await deleteMovie(req, res);

    expect(movieDoc.deleteOne.calledOnce).to.be.true;
    expect(res.json.calledWithMatch({ message: 'Movie deleted' })).to.be.true;
  });

  // AC: a movie with approved reviews requires explicit confirmation
  // (Decision #4 - soft-restrict rather than cascade-delete).
  it('should return 409 (not delete) when approved reviews exist and confirm is not set', async () => {
    const movieDoc = { _id: 'movie123', deleteOne: sinon.stub().resolves() };
    sinon.stub(Movie, 'findById').resolves(movieDoc);
    stubApprovedReviewCount(3);

    const req = { params: { id: 'movie123' }, query: {} };
    const res = { status: sinon.stub().returnsThis(), json: sinon.spy() };

    await deleteMovie(req, res);

    expect(res.status.calledWith(409)).to.be.true;
    expect(movieDoc.deleteOne.called).to.be.false;
    expect(res.json.calledWithMatch({ approvedReviewCount: 3 })).to.be.true;
  });

  it('should delete when approved reviews exist but confirm=true is passed', async () => {
    const movieDoc = { _id: 'movie123', deleteOne: sinon.stub().resolves() };
    sinon.stub(Movie, 'findById').resolves(movieDoc);
    stubApprovedReviewCount(3);

    const req = { params: { id: 'movie123' }, query: { confirm: 'true' } };
    const res = { status: sinon.stub().returnsThis(), json: sinon.spy() };

    await deleteMovie(req, res);

    expect(movieDoc.deleteOne.calledOnce).to.be.true;
    expect(res.json.calledWithMatch({ message: 'Movie deleted' })).to.be.true;
  });

  it('should return 404 when the movie does not exist', async () => {
    sinon.stub(Movie, 'findById').resolves(null);
    const req = { params: { id: 'missing' }, query: {} };
    const res = { status: sinon.stub().returnsThis(), json: sinon.spy() };

    await deleteMovie(req, res);

    expect(res.status.calledWith(404)).to.be.true;
  });
});
