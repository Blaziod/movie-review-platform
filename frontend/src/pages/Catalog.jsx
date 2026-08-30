import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axiosInstance from '../axiosConfig';
import RatingStats from '../components/RatingStats';
import Footer from '../components/Footer';

// US5.1 - As any visitor, I want to browse/search the catalog by title or
// genre. 
const Catalog = () => {
  const [movies, setMovies] = useState([]);
  const [allGenres, setAllGenres] = useState([]);
  const [title, setTitle] = useState('');
  const [genre, setGenre] = useState('');
  const [error, setError] = useState('');

  const loadMovies = () => {
    const params = {};
    if (title) params.title = title;
    if (genre) params.genre = genre;
    axiosInstance
      .get('/api/movies', { params })
      .then((res) => setMovies(res.data))
      .catch(() => setError('Failed to load the movie catalog.'));
  };

  useEffect(() => {
    loadMovies();
    axiosInstance
      .get('/api/movies')
      .then((res) => setAllGenres([...new Set(res.data.map((m) => m.genre))].sort()));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    loadMovies();
  };

  return (
    <div className="max-w-5xl mx-auto mt-12 px-4">
      <div className="flex flex-wrap justify-between items-center gap-4 mb-8">
        <h1 className="text-2xl font-bold text-white uppercase tracking-wide">Movie List</h1>

        <form onSubmit={handleSearch} className="flex gap-3">
          <div className="relative">
            <input
              type="text"
              placeholder="Search by title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-56 pl-4 pr-9 py-2 rounded-pill bg-input text-white placeholder-gray-500 border border-transparent focus:outline-none focus:border-brand-orange"
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="none">
  <path d="M14.3539 13.6463L11.2245 10.5175C12.1315 9.42857 12.5838 8.03188 12.4873 6.61796C12.3908 5.20405 11.7528 3.88179 10.7062 2.92624C9.65963 1.97069 8.28492 1.45541 6.86808 1.48761C5.45125 1.51981 4.10137 2.09701 3.09926 3.09912C2.09714 4.10123 1.51995 5.45111 1.48775 6.86795C1.45555 8.28478 1.97082 9.65949 2.92638 10.7061C3.88193 11.7527 5.20419 12.3906 6.6181 12.4872C8.03201 12.5837 9.42871 12.1314 10.5176 11.2244L13.6464 14.3538C13.6928 14.4002 13.748 14.4371 13.8087 14.4622C13.8694 14.4873 13.9344 14.5003 14.0001 14.5003C14.0658 14.5003 14.1309 14.4873 14.1916 14.4622C14.2523 14.4371 14.3074 14.4002 14.3539 14.3538C14.4003 14.3073 14.4372 14.2522 14.4623 14.1915C14.4875 14.1308 14.5004 14.0657 14.5004 14C14.5004 13.9343 14.4875 13.8693 14.4623 13.8086C14.4372 13.7479 14.4003 13.6927 14.3539 13.6463ZM2.50014 7.00001C2.50014 6.10999 2.76406 5.23996 3.25853 4.49994C3.753 3.75992 4.4558 3.18314 5.27807 2.84255C6.10034 2.50195 7.00514 2.41284 7.87805 2.58647C8.75096 2.76011 9.55279 3.18869 10.1821 3.81802C10.8115 4.44736 11.24 5.24918 11.4137 6.1221C11.5873 6.99501 11.4982 7.89981 11.1576 8.72208C10.817 9.54435 10.2402 10.2472 9.50021 10.7416C8.76019 11.2361 7.89016 11.5 7.00014 11.5C5.80708 11.4987 4.66325 11.0242 3.81962 10.1805C2.976 9.3369 2.50147 8.19307 2.50014 7.00001Z" fill="#FAFAFA" fill-opacity="0.55"/>
</svg></span>
          </div>
          <select
            value={genre}
            onChange={(e) => setGenre(e.target.value)}
            className="px-4 py-2 rounded-pill bg-input text-white border border-transparent focus:outline-none focus:border-brand-orange"
          >
            <option value="">Genre</option>
            {allGenres.map((g) => (
              <option key={g} value={g}>
                {g}
              </option>
            ))}
          </select>
          <button
            type="submit"
            className="px-5 py-2 rounded-pill bg-brand-orange text-bg font-semibold hover:bg-brand-orange-dark"
          >
            Search
          </button>
        </form>
      </div>

      {error && (
        <div className="mb-4 px-4 py-2 text-sm text-danger bg-danger-bg rounded-xl">{error}</div>
      )}

      {movies.length === 0 && !error && (
        <p className="text-gray-500">No movies match your search.</p>
      )}

      <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-6">
        {movies.map((movie) => (
          <Link key={movie._id} to={`/movies/${movie._id}`} className="group">
            <div className="w-full aspect-[2/3] rounded-xl bg-surface flex items-center justify-center text-gray-500 text-3xl mb-2 group-hover:bg-surface-light transition-colors overflow-hidden">
              {movie.imageUrl ? (
                <img src={movie.imageUrl} alt={movie.title} className="w-full h-full object-cover" />
              ) : (
                movie.title.slice(0, 1)
              )}
            </div>
            <p className="font-semibold text-white truncate">{movie.title}</p>
            <p className="text-xs text-gray-400 mb-1">
              {movie.year} &bull; {movie.genre}
            </p>
            <RatingStats avgRating={movie.avgRating} reviewCount={movie.reviewCount} />
          </Link>
        ))}
      </div>

      <Footer />
    </div>
  );
};

export default Catalog;
