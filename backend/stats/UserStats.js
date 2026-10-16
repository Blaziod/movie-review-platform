const StatsProvider = require('./StatsProvider');
const User = require('../models/User');

// US6.1 - Reviewer total (admins are not counted).
class UserStats extends StatsProvider {
  async collect() {
    return { total: await User.countDocuments({ role: 'reviewer' }) };
  }
}

module.exports = UserStats;
