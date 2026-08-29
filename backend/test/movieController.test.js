const chai = require('chai');
const sinon = require('sinon');
const Movie = require('../models/Movie');
const { addMovie } = require('../controllers/movieController');
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
