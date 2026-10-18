const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const connectDB = require('./config/db');
const { registerNotificationListener } = require('./events/notificationListener');

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/movies', require('./routes/movieRoutes'));
app.use('/api/reviews', require('./routes/reviewRoutes'));
app.use('/api/notifications', require('./routes/notificationRoutes'));
app.use('/api/health', require('./routes/healthRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));

const buildPath = path.join(__dirname, '..', 'frontend', 'build');
if (fs.existsSync(buildPath)) {
  app.use(express.static(buildPath));
  // Any non-API route returns the React app, so React Router works on page refresh.
  app.get(/^\/(?!api).*/, (req, res) => res.sendFile(path.join(buildPath, 'index.html')));
}

// Export the app object for testing
if (require.main === module) {
  // Observer pattern: subscribe the notification handler to review-moderated events.
  // Only when the server really starts, so importing the app in tests does not
  // attach the real listener to the shared event emitter.
  registerNotificationListener();
  connectDB();
  const PORT = process.env.PORT || 5001;
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
}

module.exports = app;
