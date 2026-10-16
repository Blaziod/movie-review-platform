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

describe('GET /api/movies/compare', () => {afterEach(() => {sinon.restore();});
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
        ? [{ rating: 4 }, { rating: 5 }]
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

  it('rejects duplicate movie IDs', async () => {
    const response = await chai.request(app).get(`/api/movies/compare?movie1=${movieId1}&movie2=${movieId1}`);
    expect(response).to.have.status(400);
  });

  it('rejects malformed movie IDs', async () => {
    const response = await chai.request(app).get('/api/movies/compare?movie1=invalid&movie2=invalid2');
    expect(response).to.have.status(400);
  });

  it('returns 404 when a movie does not exist', async () => {
    sinon.stub(Movie, 'findById').resolves(null);
    const response = await chai.request(app).get(`/api/movies/compare?movie1=${movieId1}&movie2=${movieId2}`);
    expect(response).to.have.status(404);
  });
});
