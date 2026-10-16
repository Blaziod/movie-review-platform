const ReviewStats = require('./ReviewStats');
const MovieStats = require('./MovieStats');
const UserStats = require('./UserStats');

// US6 - Admin statistics dashboard.
// Facade (Tutorial 9, SmartHomeFacade): builds its statistics providers in the
// constructor and offers one simple method, getDashboardStats(), so the controller
// only talks to the facade.
// Singleton (Tutorial 9, SmartHomeConfigManager): every caller gets the one shared
// instance.
// Composition (Week 5): the facade is made of its ReviewStats, MovieStats and
// UserStats providers.
class AdminStatsFacade {
  static #instance = null;

  constructor() {
    // Singleton - mirrors __new__ in SmartHomeConfigManager: return the shared instance.
    if (AdminStatsFacade.#instance) {
      return AdminStatsFacade.#instance;
    }
    // Composition (Week 5) - the facade is made of its providers.
    this.reviewStats = new ReviewStats();
    this.movieStats = new MovieStats();
    this.userStats = new UserStats();
    AdminStatsFacade.#instance = this;
  }

  // US6 - Always the same object.
  static getInstance() {
    return new AdminStatsFacade();
  }

  // US6.1 / US6.2 - One call for the whole dashboard. Errors propagate so the
  // controller decides the HTTP answer.
  async getDashboardStats() {
    const [reviews, movies, reviewers] = await Promise.all([
      this.reviewStats.collect(),
      this.movieStats.collect(),
      this.userStats.collect(),
    ]);
    return {
      reviews,
      movies: { total: movies.total },
      reviewers,
      topRated: movies.topRated,
      generatedAt: new Date().toISOString(),
    };
  }
}

module.exports = AdminStatsFacade;
