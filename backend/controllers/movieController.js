const Movie = require('../models/Movie');

const CURRENT_YEAR = new Date().getFullYear();

// US2.1 - As an admin, I want to add a movie (title, year, genre, synopsis),
// so the catalog stays current.
// AC: valid submit -> appears in the public catalog immediately.
// AC: missing title/year -> inline validation blocks submission.
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

module.exports = { addMovie };
