require('dotenv').config();
const mongoose = require('mongoose');
const Movie = require('../models/Movie');
const movies = [
  {
    title: 'Interstellar',
    year: 2014,
    genre: 'Sci-Fi',
    synopsis: 'A team of explorers travels beyond Earth to find a new home for humanity.',
    duration: '169 min',
    imageUrl: 'https://image.tmdb.org/t/p/w500/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg'
  },

  {
    title: 'Inception',
    year: 2010,
    genre: 'Sci-Fi',
    synopsis: 'A skilled thief enters dreams to extract secrets and attempt an impossible mission.',
    duration: '148 min',
    imageUrl: 'https://image.tmdb.org/t/p/w500/oYuLEt3zVCKq57qu2F8dT7NIa6f.jpg'
  },
  
  {
    title: 'The Dark Knight',
    year: 2008,
    genre: 'Action',
    synopsis: 'Batman faces the Joker as Gotham City descends into chaos.',
    duration: '152 min',
    imageUrl: 'https://image.tmdb.org/t/p/w500/qJ2tW6WMUDux911r6m7haRef0WH.jpg'
  },
  
  {
    title: 'Parasite',
    year: 2019,
    genre: 'Thriller',
    synopsis: 'Two families from different social classes become entangled in unexpected ways.',
    duration: '132 min',
    imageUrl: 'https://image.tmdb.org/t/p/w500/7IiTTgloJzvGI1TAYymCfbfl3vT.jpg'
  },
  
  {
    title: 'The Matrix',
    year: 1999,
    genre: 'Sci-Fi',
    synopsis: 'A programmer discovers the truth about his simulated reality.',
    duration: '136 min',
    imageUrl: 'https://image.tmdb.org/t/p/w500/f89U3ADr1oiB1s9GkdPOEpXUk5H.jpg'
  },
  
  {
    title: 'Spirited Away',
    year: 2001,
    genre: 'Animation',
    synopsis: 'A young girl enters a mysterious world of spirits.',
    duration: '125 min',
    imageUrl: 'https://image.tmdb.org/t/p/w500/39wmItIWsg5sZMyRUHLkWBcuVCM.jpg'
  }
];

(async () => {
  try {
    if (!process.env.MONGO_URI) {
      throw new Error('MONGO_URI is missing in backend/.env');
    }
    await mongoose.connect(process.env.MONGO_URI);
    let inserted = 0;
    for (const movie of movies) {
      const existing = await Movie.findOne({
        title: movie.title,
        year: movie.year
      });

      if (!existing) {
        await Movie.create(movie);
        inserted++;
        console.log(`Added: ${movie.title}`);
      } else {
        console.log(`Skipped existing: ${movie.title}`);
      }
    }
    console.log(`Done. Inserted ${inserted} movies.`);
  } catch (error) {
    console.error('Movie seed failed:', error.message);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
})();
