const chai = require('chai');
const sinon = require('sinon');
const AdminStatsFacade = require('../stats/AdminStatsFacade');
const ReviewStats = require('../stats/ReviewStats');
const MovieStats = require('../stats/MovieStats');
const UserStats = require('../stats/UserStats');
const { expect } = chai;

// US6 - Facade (with a Singleton instance) over the admin statistics providers.
describe('AdminStatsFacade', () => {
  afterEach(() => {
    sinon.restore();
  });

  it('US6 facade - getInstance() returns the same object every time', () => {
    const first = AdminStatsFacade.getInstance();
    const second = AdminStatsFacade.getInstance();

    expect(first).to.equal(second);
  });

  it('US6 facade - new AdminStatsFacade() returns the shared instance', () => {
    expect(new AdminStatsFacade()).to.equal(AdminStatsFacade.getInstance());
  });

  it('US6 facade - is composed of ReviewStats, MovieStats and UserStats providers', () => {
    const facade = AdminStatsFacade.getInstance();

    expect(facade.reviewStats).to.be.instanceOf(ReviewStats);
    expect(facade.movieStats).to.be.instanceOf(MovieStats);
    expect(facade.userStats).to.be.instanceOf(UserStats);
  });

  it('US6 facade - getDashboardStats() combines the three providers into one result', async () => {
    const reviews = { pending: 3, approved: 10, rejected: 2, total: 15 };
    const topRated = [
      { id: 'movie1', title: 'Inception', year: 2010, genre: 'Sci-Fi', avgRating: 4.8, reviewCount: 12 },
    ];
    sinon.stub(ReviewStats.prototype, 'collect').resolves(reviews);
    sinon.stub(MovieStats.prototype, 'collect').resolves({ total: 7, topRated });
    sinon.stub(UserStats.prototype, 'collect').resolves({ total: 4 });

    const result = await AdminStatsFacade.getInstance().getDashboardStats();

    expect(result).to.have.all.keys('reviews', 'movies', 'reviewers', 'topRated', 'generatedAt');
    expect(result.reviews).to.deep.equal(reviews);
    expect(result.movies).to.deep.equal({ total: 7 });
    expect(result.reviewers).to.deep.equal({ total: 4 });
    expect(result.topRated).to.deep.equal(topRated);
    expect(new Date(result.generatedAt).toISOString()).to.equal(result.generatedAt);
  });

  it('US6 facade - getDashboardStats() rejects with the same error when a provider fails', async () => {
    const dbError = new Error('DB Error');
    sinon.stub(ReviewStats.prototype, 'collect').resolves({ pending: 0, approved: 0, rejected: 0, total: 0 });
    sinon.stub(MovieStats.prototype, 'collect').rejects(dbError);
    sinon.stub(UserStats.prototype, 'collect').resolves({ total: 0 });

    let error;
    try {
      await AdminStatsFacade.getInstance().getDashboardStats();
    } catch (err) {
      error = err;
    }

    expect(error).to.equal(dbError);
  });
});
