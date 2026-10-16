const chai = require('chai');
const sinon = require('sinon');
const Review = require('../models/Review');
const Movie = require('../models/Movie');
const User = require('../models/User');
const StatsProvider = require('../stats/StatsProvider');
const ReviewStats = require('../stats/ReviewStats');
const MovieStats = require('../stats/MovieStats');
const UserStats = require('../stats/UserStats');
const { expect } = chai;

// US6 - Abstraction: StatsProvider is an abstract base class with an abstract collect().
describe('StatsProvider - abstraction', () => {
  it('US6 abstraction - new StatsProvider() throws a TypeError', () => {
    expect(() => new StatsProvider()).to.throw(
      TypeError,
      'StatsProvider is abstract; create a subclass instead'
    );
  });

  it('US6 abstraction - a subclass without collect() rejects with "<ClassName> must implement collect()"', async () => {
    class IncompleteStats extends StatsProvider {}

    let error;
    try {
      await new IncompleteStats().collect();
    } catch (err) {
      error = err;
    }

    expect(error).to.be.an('error');
    expect(error.message).to.equal('IncompleteStats must implement collect()');
  });

  it('US6 abstraction - ReviewStats, MovieStats and UserStats are all StatsProviders', () => {
    expect(new ReviewStats()).to.be.instanceOf(StatsProvider);
    expect(new MovieStats()).to.be.instanceOf(StatsProvider);
    expect(new UserStats()).to.be.instanceOf(StatsProvider);
  });
});

// US6.1 - Review counts by status.
describe('ReviewStats - collect', () => {
  afterEach(() => {
    sinon.restore();
  });

  it('US6.1-AC1 counts Pending, Approved and Rejected reviews and their total', async () => {
    const countStub = sinon.stub(Review, 'countDocuments');
    countStub.withArgs({ status: 'Pending' }).resolves(3);
    countStub.withArgs({ status: 'Approved' }).resolves(10);
    countStub.withArgs({ status: 'Rejected' }).resolves(2);

    const result = await new ReviewStats().collect();

    expect(result).to.deep.equal({ pending: 3, approved: 10, rejected: 2, total: 15 });
    expect(countStub.calledThrice).to.be.true;
  });

  it('US6.1-AC3 an empty database gives zeros, not an error', async () => {
    const countStub = sinon.stub(Review, 'countDocuments');
    countStub.withArgs({ status: 'Pending' }).resolves(0);
    countStub.withArgs({ status: 'Approved' }).resolves(0);
    countStub.withArgs({ status: 'Rejected' }).resolves(0);

    const result = await new ReviewStats().collect();

    expect(result).to.deep.equal({ pending: 0, approved: 0, rejected: 0, total: 0 });
  });
});

// US6.1 - Movie total. US6.2 - Top 5 rated movies.
describe('MovieStats - collect', () => {
  afterEach(() => {
    sinon.restore();
  });

  const buildChain = (docs) => {
    const chain = {
      sort: sinon.stub(),
      limit: sinon.stub(),
      select: sinon.stub(),
      lean: sinon.stub().resolves(docs),
    };
    chain.sort.returns(chain);
    chain.limit.returns(chain);
    chain.select.returns(chain);
    return chain;
  };

  const movieDocs = [
    { _id: 'movie1', title: 'Inception', year: 2010, genre: 'Sci-Fi', avgRating: 4.8, reviewCount: 12 },
    { _id: 'movie2', title: 'Arrival', year: 2016, genre: 'Sci-Fi', avgRating: 4.8, reviewCount: 5 },
  ];

  it('US6.1-AC1 returns the total number of movies', async () => {
    sinon.stub(Movie, 'countDocuments').resolves(7);
    sinon.stub(Movie, 'find').returns(buildChain(movieDocs));

    const result = await new MovieStats().collect();

    expect(result.total).to.equal(7);
  });

  it('US6.2-AC3 only includes movies with at least one approved review', async () => {
    sinon.stub(Movie, 'countDocuments').resolves(7);
    const findStub = sinon.stub(Movie, 'find').returns(buildChain(movieDocs));

    await new MovieStats().collect();

    expect(findStub.calledOnceWithExactly({ reviewCount: { $gt: 0 } })).to.be.true;
  });

  it('US6.2-AC1 sorts by avgRating then reviewCount (both descending) and limits to 5', async () => {
    sinon.stub(Movie, 'countDocuments').resolves(7);
    const chain = buildChain(movieDocs);
    sinon.stub(Movie, 'find').returns(chain);

    await new MovieStats().collect();

    expect(chain.sort.calledOnceWithExactly({ avgRating: -1, reviewCount: -1 })).to.be.true;
    expect(chain.limit.calledOnceWithExactly(5)).to.be.true;
  });

  it('US6.2-AC2 each top movie has id, title, year, genre, avgRating and reviewCount', async () => {
    sinon.stub(Movie, 'countDocuments').resolves(7);
    const chain = buildChain(movieDocs);
    sinon.stub(Movie, 'find').returns(chain);

    const result = await new MovieStats().collect();

    expect(chain.select.calledOnceWithExactly('title year genre avgRating reviewCount')).to.be.true;
    expect(result.topRated).to.deep.equal([
      { id: 'movie1', title: 'Inception', year: 2010, genre: 'Sci-Fi', avgRating: 4.8, reviewCount: 12 },
      { id: 'movie2', title: 'Arrival', year: 2016, genre: 'Sci-Fi', avgRating: 4.8, reviewCount: 5 },
    ]);
  });

  it('US6.1-AC3 an empty database gives a zero total and no top movies', async () => {
    sinon.stub(Movie, 'countDocuments').resolves(0);
    sinon.stub(Movie, 'find').returns(buildChain([]));

    const result = await new MovieStats().collect();

    expect(result).to.deep.equal({ total: 0, topRated: [] });
  });
});

// US6.1 - Reviewer total.
describe('UserStats - collect', () => {
  afterEach(() => {
    sinon.restore();
  });

  it('US6.1-AC1 counts only users with the reviewer role', async () => {
    const countStub = sinon.stub(User, 'countDocuments').resolves(4);

    const result = await new UserStats().collect();

    expect(countStub.calledOnceWithExactly({ role: 'reviewer' })).to.be.true;
    expect(result).to.deep.equal({ total: 4 });
  });
});
