const mongoose = require('mongoose');
const {getMovieComparison,} = require('../services/movieComparisonService');

async function compareMovies(req, res) {
  const { movie1, movie2 } = req.query;
  if (
    typeof movie1 !== 'string' ||
    typeof movie2 !== 'string' ||
    !mongoose.isValidObjectId(movie1) ||
    !mongoose.isValidObjectId(movie2) ||
    movie1 === movie2
  ) {
    return res.status(400).json({
      message:'Provide two different, valid movie IDs in movie1 and movie2.',
    });
  }

  try {
    const comparison = await getMovieComparison(movie1, movie2);

    return res.status(200).json(comparison);
    } catch (error) {
        if (error.status) {return res.status(error.status).json({message: error.message,});}
        
        console.error('Unexpected movie comparison error:', error);
        
        return res.status(500).json({message: 'Unable to compare movies.',});
    }
}

module.exports = { compareMovies };
