class MovieComparisonBuilder {
    #movie;
    #reviewStatistics;

    constructor() {
        this.#movie = null;
        this.#reviewStatistics = null;
    }

    withMovieDetails(movie) {
        if (!movie) { throw new Error('Movie details are required.');}
        this.#movie = {
            id: movie._id,
            title: movie.title,
            year: movie.year,
            genre: movie.genre,
            synopsis: movie.synopsis,
            duration: movie.duration,
            imageUrl: movie.imageUrl,
        };
        return this;
    }

    withReviewStatistics(reviews) {
        if (!Array.isArray(reviews)) { throw new Error('Reviews must be an array.');}
        const approvedReviews = reviews.filter( (review) => review.status === 'Approved');
        const approvedReviewCount = approvedReviews.length;
        const averageRating = approvedReviewCount
        ? Number((approvedReviews.reduce((sum, review) => sum + review.rating, 0 ) / approvedReviewCount).toFixed(2)): null;
        this.#reviewStatistics = { averageRating, approvedReviewCount, };
        return this;
    }

    build() {
        if (!this.#movie || !this.#reviewStatistics) { throw new Error('Movie details and review statistics are required.');}
        return { ...this.#movie, ...this.#reviewStatistics,};
  }
}

module.exports = MovieComparisonBuilder;