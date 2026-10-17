// US6.1 - Abstract base class for the admin dashboard's statistics providers.
// JavaScript has no abstract keyword, so this mirrors the Week 5 lecture's abstract
// base class (Animal with an abstract speak() that Dog and Cat implement): it cannot
// be created directly, and every subclass must implement collect().
class StatsProvider {
  constructor() {
    if (new.target === StatsProvider) {
      throw new TypeError('StatsProvider is abstract; create a subclass instead');
    }
  }

  // Each subclass returns its own section of the dashboard statistics.
  async collect() {
    throw new Error(`${this.constructor.name} must implement collect()`);
  }
}

module.exports = StatsProvider;
