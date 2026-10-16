const dbStatus = require('../utils/dbStatus');

// Health check - GET /api/health for the AWS load balancer. No auth; reveals only
// this server's name and whether MongoDB is connected.
const getHealth = (req, res) => {
  const instance = process.env.INSTANCE_NAME || 'local';
  const timestamp = new Date().toISOString();

  // Called through the module object so tests can stub it.
  if (dbStatus.isDatabaseConnected()) {
    return res.status(200).json({ status: 'ok', instance, database: 'connected', timestamp });
  }
  // 503 takes this server out of the load balancer's rotation.
  return res.status(503).json({ status: 'unavailable', instance, database: 'disconnected', timestamp });
};

module.exports = { getHealth };
