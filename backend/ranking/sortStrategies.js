// Strategy pattern: each way of ordering a movie's reviews is its own class with the
// same method, `mongoSort()`. Polymorphism lets the controller use any of them the
// same way.
class SortStrategy {
  get key() {
    throw new Error('key must be implemented by a subclass');
  }

  mongoSort() {
    throw new Error('mongoSort must be implemented by a subclass');
  }
}

class NewestStrategy extends SortStrategy {
  get key() {
    return 'newest';
  }

  mongoSort() {
    return { createdAt: -1 };
  }
}

class HighestRatedStrategy extends SortStrategy {
  get key() {
    return 'highest';
  }

  mongoSort() {
    return { rating: -1, createdAt: -1 };
  }
}

class MostHelpfulStrategy extends SortStrategy {
  get key() {
    return 'helpful';
  }

  mongoSort() {
    return { helpfulCount: -1, createdAt: -1 };
  }
}


class ReviewSorter {
  constructor(strategies) {
    this.strategies = new Map(strategies.map((strategy) => [strategy.key, strategy]));
    this.fallback = this.strategies.get('newest');
  }

  choose(key) {
    return this.strategies.get(key) || this.fallback;
  }
}

const reviewSorter = new ReviewSorter([
  new NewestStrategy(),
  new HighestRatedStrategy(),
  new MostHelpfulStrategy(),
]);

module.exports = {
  SortStrategy,
  NewestStrategy,
  HighestRatedStrategy,
  MostHelpfulStrategy,
  ReviewSorter,
  reviewSorter,
};
