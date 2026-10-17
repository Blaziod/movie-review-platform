const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
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

// Observer pattern: subscribe the notification handler to review-moderated events.
registerNotificationListener();

// Export the app object for testing
if (require.main === module) {
  connectDB();
  const PORT = process.env.PORT || 5001;
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
}

module.exports = app;
