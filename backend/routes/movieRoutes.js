const express = require('express');
const {addMovie,getMovies,getMovieById,updateMovie,deleteMovie,} = require('../controllers/movieController');
const {compareMovies,} = require('../controllers/movieComparisonController');
const {protect,requireAdmin,} = require('../middleware/authMiddleware');
const router = express.Router();

router.get('/', getMovies);

// Static routes must be registered before '/:id'.
router.get('/compare', compareMovies);
router.get('/:id', getMovieById);
router.post('/', protect, requireAdmin, addMovie);
router.put('/:id', protect, requireAdmin, updateMovie);
router.delete('/:id', protect, requireAdmin, deleteMovie);

module.exports = router;
