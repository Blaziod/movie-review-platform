const StatsProvider = require('./StatsProvider');
const Movie = require('../models/Movie');

// US6.1 - Movie total. US6.2 - Top 5 movies with at least one approved review,
// highest avgRating first, ties broken by more approved reviews. Uses the avgRating
// and reviewCount A1 keeps on each movie when a review is approved.
class MovieStats extends StatsProvider {
  async collect() {
    const [total, movies] = await Promise.all([
      Movie.countDocuments({}),
      Movie.find({ reviewCount: { $gt: 0 } })
        .sort({ avgRating: -1, reviewCount: -1 })
        .limit(5)
        .select('title year genre avgRating reviewCount')
        .lean(),
    ]);
    const topRated = movies.map((movie) => ({
      id: String(movie._id),
      title: movie.title,
      year: movie.year,
      genre: movie.genre,
      avgRating: movie.avgRating,
      reviewCount: movie.reviewCount,
    }));
    return { total, topRated };
  }
}

module.exports = MovieStats;
