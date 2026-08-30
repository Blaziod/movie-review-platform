const mongoose = require('mongoose');
const Movie = require('../models/Movie');

const CURRENT_YEAR = new Date().getFullYear();

// US2.1 - As an admin, I want to add a movie (title, year, genre, synopsis)
const addMovie = async (req, res) => {
  const { title, year, genre, synopsis } = req.body;

  if (!title || !title.trim()) {
    return res.status(400).json({ message: 'Title is required.' });
  }
  if (!year || Number.isNaN(Number(year)) || year < 1900 || year > CURRENT_YEAR + 1) {
    return res.status(400).json({ message: `Enter a valid year (1900-${CURRENT_YEAR + 1}).` });
  }
  if (!genre || !genre.trim()) {
    return res.status(400).json({ message: 'Genre is required.' });
  }

  try {
    const movie = await Movie.create({
      title: title.trim(),
      year: Number(year),
      genre: genre.trim(),
      synopsis: synopsis ? synopsis.trim() : '',
    });
    res.status(201).json(movie);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getMovies = async (req, res) => {
  try {
    const movies = await Movie.find().sort({ createdAt: -1 });
    res.json(movies);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// US2.2 - As an admin, I want to edit or remove a movie, so I can correct
// errors or retire titles.
const updateMovie = async (req, res) => {
  try {
    const movie = await Movie.findById(req.params.id);
    if (!movie) {
      return res.status(404).json({ message: 'Movie not found' });
    }

    const { title, year, genre, synopsis } = req.body;

    if (title !== undefined) {
      if (!title.trim()) return res.status(400).json({ message: 'Title is required.' });
      movie.title = title.trim();
    }
    if (year !== undefined) {
      if (Number.isNaN(Number(year)) || year < 1900 || year > CURRENT_YEAR + 1) {
        return res.status(400).json({ message: `Enter a valid year (1900-${CURRENT_YEAR + 1}).` });
      }
      movie.year = Number(year);
    }
    if (genre !== undefined) {
      if (!genre.trim()) return res.status(400).json({ message: 'Genre is required.' });
      movie.genre = genre.trim();
    }
    if (synopsis !== undefined) {
      movie.synopsis = synopsis.trim();
    }

    const updated = await movie.save();
    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const countApprovedReviews = (movieId) =>
  mongoose.connection.collection('reviews').countDocuments({ movieId, status: 'Approved' });

// AC: a movie with approved reviews requires explicit confirmation before
// deletion
const deleteMovie = async (req, res) => {
  try {
    const movie = await Movie.findById(req.params.id);
    if (!movie) {
      return res.status(404).json({ message: 'Movie not found' });
    }

    const approvedReviewCount = await countApprovedReviews(movie._id);

    if (approvedReviewCount > 0 && req.query.confirm !== 'true') {
      return res.status(409).json({
        message: `This movie has ${approvedReviewCount} approved review(s). Confirm deletion to proceed.`,
        approvedReviewCount,
      });
    }

    await movie.deleteOne();
    res.json({ message: 'Movie deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { addMovie, getMovies, updateMovie, deleteMovie };
