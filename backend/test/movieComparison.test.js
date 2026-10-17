const chai = require('chai');
const chaiHttp = require('chai-http');
const sinon = require('sinon');
const app = require('../server');
const Movie = require('../models/Movie');
const Review = require('../models/Review');
const { expect } = chai;

chai.use(chaiHttp);

const movieId1 = '507f1f77bcf86cd799439011';
const movieId2 = '507f191e810c19729de860ea';

describe('GET /api/movies/compare', () => {
  afterEach(() => {
    sinon.restore();
  });

  // MRP-67: Verify Movie Comparison API integration and approved review statistics.
  it('returns two movies with approved review statistics', async () => {
    sinon.stub(Movie, 'findById').callsFake(async (id) => ({
      _id: id,
      title: id === movieId1 ? 'Movie A' : 'Movie B',
      year: 2024,
      genre: 'Drama',
      synopsis: 'Example movie',
      duration: '120 min',
      imageUrl: '',
    }));

    sinon.stub(Review, 'find').callsFake(async (query) => {
      expect(query.status).to.equal('Approved');
      return String(query.movieId) === movieId1
        ? [
            { rating: 4, status: 'Approved' },
            { rating: 5, status: 'Approved' },
          ]
        : [];
    });

    const response = await chai.request(app).get(`/api/movies/compare?movie1=${movieId1}&movie2=${movieId2}`);
    expect(response).to.have.status(200);
    expect(response.body.movies).to.have.length(2);
    expect(response.body.movies[0].averageRating).to.equal(4.5);
    expect(response.body.movies[0].approvedReviewCount).to.equal(2);
    expect(response.body.movies[1].averageRating).to.equal(null);
    expect(response.body.movies[1].approvedReviewCount).to.equal(0);
  });

  // MRP-75: Prevent duplicate movie selection
  it('rejects duplicate movie IDs', async () => {
    const response = await chai.request(app).get(`/api/movies/compare?movie1=${movieId1}&movie2=${movieId1}`);
    expect(response).to.have.status(400);
  });

  // MRP-74: Validate MongoDB ObjectId format
  it('rejects malformed movie IDs', async () => {
    const response = await chai.request(app).get('/api/movies/compare?movie1=invalid&movie2=invalid2');
    expect(response).to.have.status(400);
  });

  // MRP-76: Handle nonexistent movies
  it('returns 404 when a movie does not exist', async () => {
    sinon.stub(Movie, 'findById').resolves(null);
    const response = await chai.request(app).get(`/api/movies/compare?movie1=${movieId1}&movie2=${movieId2}`);
    expect(response).to.have.status(404);
  });

  // MRP-73: Validate query parameter types and reject repeated parameters
  it('returns 400 when both movie IDs are missing', async () => {
    const response = await chai.request(app).get('/api/movies/compare');
    expect(response).to.have.status(400);
    expect(response.body.message).to.be.a('string');
  });

  it('returns 400 when movie1 is missing', async () => {
    const response = await chai.request(app).get(`/api/movies/compare?movie2=${movieId2}`);
    expect(response).to.have.status(400);
  });

  it('returns 400 when movie2 is missing', async () => {
    const response = await chai.request(app).get(`/api/movies/compare?movie1=${movieId1}`);
    expect(response).to.have.status(400);
  });

  it('returns 400 when movie IDs are empty', async () => {
    const response = await chai.request(app).get('/api/movies/compare?movie1=&movie2=');
    expect(response).to.have.status(400);
  });

  // MRP-74: Reject invalid query parameter types
  it('returns 400 when a movie ID is provided multiple times', async () => {
    const response = await chai.request(app).get(`/api/movies/compare?movie1=${movieId1}&movie1=${movieId2}&movie2=${movieId2}`);
    expect(response).to.have.status(400);
  });

  // MRP-77: Verify structured error responses
  it('returns a JSON error without exposing stack traces', async () => {
    const response = await chai.request(app).get(`/api/movies/compare?movie1=invalid&movie2=${movieId2}`);
    expect(response).to.have.status(400);
    expect(response).to.have.header('content-type', /application\/json/);
    expect(response.body.message).to.be.a('string');
    expect(response.body).not.to.have.property('stack');
  });

  it('returns a safe error when the database fails', async () => {
    sinon.stub(Movie, 'findById').rejects(new Error('Sensitive database error'));
    sinon.stub(console, 'error');

    const response = await chai.request(app).get(`/api/movies/compare?movie1=${movieId1}&movie2=${movieId2}`);
    expect(response).to.have.status(500);
    expect(response.body.message).to.equal('Unable to compare movies.');
    expect(JSON.stringify(response.body)).not.to.include('Sensitive database error');
  });

  // MRP-78 / NFR-02: Verify backend stability after invalid requests
  it('accepts a valid comparison after an invalid request', async () => {
    sinon.stub(Movie, 'findById').callsFake(async (id) => ({
      _id: id,
      title: 'Test Movie',
      year: 2024,
      genre: 'Drama',
      synopsis: 'Example movie',
      duration: '120 min',
      imageUrl: '',
    }));

    sinon.stub(Review, 'find').resolves([]);

    const invalidResponse = await chai.request(app).get(`/api/movies/compare?movie1=invalid&movie2=${movieId2}`);
    expect(invalidResponse).to.have.status(400);

    const validResponse = await chai.request(app).get(`/api/movies/compare?movie1=${movieId1}&movie2=${movieId2}`);
    expect(validResponse).to.have.status(200);
    expect(validResponse.body.movies).to.have.length(2);
  });
});
