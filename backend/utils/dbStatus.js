const mongoose = require('mongoose');

// Health check - wraps readyState (a non-configurable getter Sinon cannot stub)
// so tests can stub isDatabaseConnected instead. 1 = connected.
const isDatabaseConnected = () => mongoose.connection.readyState === 1;

module.exports = { isDatabaseConnected };
