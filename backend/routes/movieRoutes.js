const express = require('express');
const { addMovie } = require('../controllers/movieController');
const { protect, requireAdmin } = require('../middleware/authMiddleware');
const router = express.Router();

router.post('/', protect, requireAdmin, addMovie);

module.exports = router;
