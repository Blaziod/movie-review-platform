const express = require('express');
const { addMovie, getMovies, updateMovie, deleteMovie } = require('../controllers/movieController');
const { protect, requireAdmin } = require('../middleware/authMiddleware');
const router = express.Router();

router.get('/', protect, requireAdmin, getMovies);
router.post('/', protect, requireAdmin, addMovie);
router.put('/:id', protect, requireAdmin, updateMovie);
router.delete('/:id', protect, requireAdmin, deleteMovie);

module.exports = router;
