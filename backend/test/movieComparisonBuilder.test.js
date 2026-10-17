const { expect } = require('chai');
const MovieComparisonBuilder = require('../builders/MovieComparisonBuilder');

describe('MovieComparisonBuilder', () => {
  const movie = {
    _id: '507f1f77bcf86cd799439011',
    title: 'Interstellar',
    year: 2014,
    genre: 'Sci-Fi',
    synopsis: 'A journey through space.',
    duration: '169 min',
    imageUrl: 'interstellar.jpg',
  };

  // MRP-68: Implement the MovieComparisonBuilder class
  it('builds a complete movie comparison object', () => {
    const result = new MovieComparisonBuilder().withMovieDetails(movie).withReviewStatistics([
        { rating: 4, status: 'Approved' },
        { rating: 5, status: 'Approved' },
    ]).build();
    expect(result.id).to.equal(movie._id);
    expect(result.title).to.equal('Interstellar');
    expect(result.year).to.equal(2014);
    expect(result.averageRating).to.equal(4.5);
    expect(result.approvedReviewCount).to.equal(2);
  });

  // MRP-70: Implement fluent Builder methods
  it('supports method chaining', () => {
    const builder = new MovieComparisonBuilder();
    expect(builder.withMovieDetails(movie)).to.equal(builder);
    expect(builder.withReviewStatistics([])).to.equal(builder);
  });

  // MRP-71: Integrate Builder with approved review statistics
  it('excludes pending and rejected reviews', () => {
    const result = new MovieComparisonBuilder().withMovieDetails(movie).withReviewStatistics([
        { rating: 5, status: 'Approved' },
        { rating: 1, status: 'Pending' },
        { rating: 2, status: 'Rejected' },
      ]).build();
    expect(result.averageRating).to.equal(5);
    expect(result.approvedReviewCount).to.equal(1);
  });

  // MRP-72: Test Builder behaviour with no approved reviews
  it('returns null average rating when no reviews are approved', () => {
    const result = new MovieComparisonBuilder().withMovieDetails(movie).withReviewStatistics([]).build();
    expect(result.averageRating).to.equal(null);
    expect(result.approvedReviewCount).to.equal(0);
  });

  // MRP-72: Test incomplete Builder objects
  it('prevents building an incomplete object', () => {
    const builder = new MovieComparisonBuilder().withMovieDetails(movie);
    expect(() => builder.build()).to.throw('Movie details and review statistics are required.');
  });

  // MRP-72: Test Builder input validation
  it('validates movie details and review inputs', () => {
    const builder = new MovieComparisonBuilder();
    expect(() => builder.withMovieDetails(null)).to.throw('Movie details are required.');
    expect(() => builder.withReviewStatistics(null)).to.throw('Reviews must be an array.');
  });

  // MRP-69: Verify encapsulation through private fields
  it('encapsulates its internal state using private fields', () => {
    const builder = new MovieComparisonBuilder().withMovieDetails(movie).withReviewStatistics([]);
    expect(builder).not.to.have.property('movie');
    expect(builder).not.to.have.property('reviewStatistics');
    expect(builder.build().title).to.equal('Interstellar');
  });
});