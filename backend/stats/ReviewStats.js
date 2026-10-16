const StatsProvider = require('./StatsProvider');
const Review = require('../models/Review');

// US6.1 - Review counts by moderation status. An empty database gives zeros (US6.1-AC3).
class ReviewStats extends StatsProvider {
  async collect() {
    const [pending, approved, rejected] = await Promise.all([
      Review.countDocuments({ status: 'Pending' }),
      Review.countDocuments({ status: 'Approved' }),
      Review.countDocuments({ status: 'Rejected' }),
    ]);
    return { pending, approved, rejected, total: pending + approved + rejected };
  }
}

module.exports = ReviewStats;
