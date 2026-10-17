const chai = require('chai');
const {
  SortStrategy,
  NewestStrategy,
  HighestRatedStrategy,
  MostHelpfulStrategy,
  ReviewSorter,
  reviewSorter,
} = require('../ranking/sortStrategies');
const { expect } = chai;

describe('sortStrategies (Strategy pattern)', () => {
  it('the base class is abstract: key and mongoSort must be implemented', () => {
    const base = new SortStrategy();
    expect(() => base.key).to.throw(/subclass/);
    expect(() => base.mongoSort()).to.throw(/subclass/);
  });

  it('NewestStrategy orders by creation date, newest first', () => {
    const strategy = new NewestStrategy();
    expect(strategy.key).to.equal('newest');
    expect(strategy.mongoSort()).to.deep.equal({ createdAt: -1 });
  });

  it('HighestRatedStrategy orders by rating, then newest', () => {
    const strategy = new HighestRatedStrategy();
    expect(strategy.key).to.equal('highest');
    expect(strategy.mongoSort()).to.deep.equal({ rating: -1, createdAt: -1 });
  });

  it('MostHelpfulStrategy orders by helpful votes, then newest', () => {
    const strategy = new MostHelpfulStrategy();
    expect(strategy.key).to.equal('helpful');
    expect(strategy.mongoSort()).to.deep.equal({ helpfulCount: -1, createdAt: -1 });
  });
});

describe('ReviewSorter (context)', () => {
  it('chooses the strategy matching the requested key', () => {
    expect(reviewSorter.choose('highest')).to.be.instanceOf(HighestRatedStrategy);
    expect(reviewSorter.choose('helpful')).to.be.instanceOf(MostHelpfulStrategy);
    expect(reviewSorter.choose('newest')).to.be.instanceOf(NewestStrategy);
  });

  it('falls back to newest for an unknown or missing key', () => {
    expect(reviewSorter.choose('banana')).to.be.instanceOf(NewestStrategy);
    expect(reviewSorter.choose(undefined)).to.be.instanceOf(NewestStrategy);
  });

  it('a new strategy can be added without changing the sorter (open/closed)', () => {
    class OldestStrategy extends SortStrategy {
      get key() {
        return 'oldest';
      }

      mongoSort() {
        return { createdAt: 1 };
      }
    }
    const sorter = new ReviewSorter([new NewestStrategy(), new OldestStrategy()]);
    expect(sorter.choose('oldest').mongoSort()).to.deep.equal({ createdAt: 1 });
  });
});
