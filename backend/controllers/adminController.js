const AdminStatsFacade = require('../stats/AdminStatsFacade');

// US6.1 - As an admin, I want a statistics dashboard, so I can see the state of
// reviews, movies and reviewers at a glance. The facade does all the work.
const getAdminStats = async (req, res) => {
  try {
    const stats = await AdminStatsFacade.getInstance().getDashboardStats();
    res.status(200).json(stats);
  } catch (error) {
    // US6.1-AC4 - log the cause, never send it or a stack trace to the client.
    console.error(error.message);
    res.status(500).json({ message: 'Could not load statistics' });
  }
};

module.exports = { getAdminStats };
