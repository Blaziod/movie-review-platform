const Movie = require('../models/Movie');
const Review = require('../models/Review');
const MovieComparisonBuilder = require('../builders/MovieComparisonBuilder');

async function getMovieComparison(movie1Id, movie2Id) {
  const movies = await Promise.all([
    Movie.findById(movie1Id),
    Movie.findById(movie2Id),
  ]);

  if (movies.some((movie) => !movie)) {
    const error = new Error('One or both movies were not found.');
    error.status = 404;
    throw error;
  }

  // Build comparison data for each movie.
  const results = await Promise.all(
    movies.map(async (movie) => {
      const reviews = await Review.find({
        movieId: movie._id,
        status: 'Approved',
      });

      // Builder Pattern: Construct the movie comparison object step by step.
      // The Builder encapsulates movie details and rating calculations.
      return new MovieComparisonBuilder()
        .withMovieDetails(movie)
        .withReviewStatistics(reviews)
        .build();
    })
  );
  return { movies: results };
}

module.exports = { getMovieComparison };
