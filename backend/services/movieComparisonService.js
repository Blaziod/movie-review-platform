const Movie = require('../models/Movie');
const Review = require('../models/Review');

async function getMovieComparison(movie1Id, movie2Id) {
  // Retrieve both movies concurrently.
  const movies = await Promise.all([
    Movie.findById(movie1Id),
    Movie.findById(movie2Id),
  ]);

  if (movies.some((movie) => !movie)) {
    const error = new Error('One or both movies were not found.');
    error.status = 404;
    throw error;
  }

  // Calculate statistics using approved reviews only.
  const results = await Promise.all(
    movies.map(async (movie) => {
      const reviews = await Review.find({movieId: movie._id, status: 'Approved',});
      const approvedReviewCount = reviews.length;
      const averageRating = approvedReviewCount
        ? Number(
            (reviews.reduce((sum, review) => sum + review.rating, 0) / approvedReviewCount).toFixed(2)
          ): null;

      return {
        id: movie._id,
        title: movie.title,
        year: movie.year,
        genre: movie.genre,
        synopsis: movie.synopsis,
        duration: movie.duration,
        imageUrl: movie.imageUrl,
        averageRating,
        approvedReviewCount,
      };
    })
  );
  return { movies: results };
}

module.exports = { getMovieComparison };
