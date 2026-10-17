import { useEffect, useState } from 'react';
import axiosInstance from '../axiosConfig';
import Footer from '../components/Footer';

// MRP-79: Create the Movie Comparison page layout.
const MovieComparison = () => {
  // MRP-80: Load available movies and manage selections.
  const [movies, setMovies] = useState([]);
  const [movie1, setMovie1] = useState('');
  const [movie2, setMovie2] = useState('');
  const [error, setError] = useState('');

  // MRP-81 / MRP-82: Store movie comparison results.
  const [comparison, setComparison] = useState(null);
  const [loading, setLoading] = useState(false);

  // MRP-83: Track movie list loading separately.
  const [moviesLoading, setMoviesLoading] = useState(true);

  // MRP-80: Allow comparison only when two different movies are selected.
  const canCompare = Boolean(movie1 && movie2 && movie1 !== movie2);

  // MRP-83: Handle movie list loading and errors.
  useEffect(() => {
    let active = true;
    axiosInstance.get('/api/movies').then((res) => {
        if (!active) return;
        setMovies(res.data);
        setError('');
      })
      .catch(() => {
        if (!active) return;
        setError('Failed to load movies. Please refresh the page and try again.');
      })
      .finally(() => {
        if (active) setMoviesLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  // MRP-82 / MRP-83: Fetch comparison data and handle API errors.
  const handleCompare = async () => {
    if (!canCompare || loading || moviesLoading) return;
    setLoading(true);
    setError('');
    setComparison(null);
    try {
      const response = await axiosInstance.get('/api/movies/compare', {params: { movie1, movie2 }});
      setComparison(response.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to compare movies. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // MRP-80: Update the first movie selection.
  const handleMovie1Change = (e) => {
    setMovie1(e.target.value);
    setComparison(null);
    setError('');
  };

  // MRP-80: Update the second movie selection.
  const handleMovie2Change = (e) => {
    setMovie2(e.target.value);
    setComparison(null);
    setError('');
  };

  return (
    <div className="max-w-5xl mx-auto mt-12 px-4">
      {/* MRP-79: Page heading */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white uppercase tracking-wide">
          Compare Movies
        </h1>

        <p className="text-sm text-gray-400 mt-2">
          Select two movies to compare their details and ratings.
        </p>
      </div>

      {/* MRP-83: Display API errors */}
      {error && (
        <div
          role="alert"
          className="mb-4 px-4 py-3 text-sm text-red-400 bg-surface rounded-xl"
        >
          {error}
        </div>
      )}

      {/* MRP-83: Movie list loading indicator */}
      {moviesLoading && (
        <p role="status" className="mb-4 text-sm text-gray-400">
          Loading movies...
        </p>
      )}

      {/* MRP-79: Movie selection panel */}
      <div className="bg-surface rounded-2xl p-6 mb-8">
        <div className="grid md:grid-cols-2 gap-6 mb-6">
          <div>
            <label
              htmlFor="movie1"
              className="block text-sm font-semibold text-white mb-2"
            >
              First Movie
            </label>

            {/* MRP-80: First movie selection */}
            <select
              id="movie1"
              value={movie1}
              onChange={handleMovie1Change}
              disabled={loading || moviesLoading}
              className="w-full px-4 py-3 rounded-xl bg-input text-white border border-transparent focus:outline-none focus:border-brand-orange disabled:opacity-50"
            >
              <option value="">
                {moviesLoading ? 'Loading movies...' : 'Select first movie'}
              </option>

              {movies.map((movie) => (
                <option
                  key={movie._id}
                  value={movie._id}
                  disabled={movie._id === movie2}
                >
                  {movie.title}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label
              htmlFor="movie2"
              className="block text-sm font-semibold text-white mb-2"
            >
              Second Movie
            </label>

            {/* MRP-80: Second movie selection */}
            <select
              id="movie2"
              value={movie2}
              onChange={handleMovie2Change}
              disabled={loading || moviesLoading}
              className="w-full px-4 py-3 rounded-xl bg-input text-white border border-transparent focus:outline-none focus:border-brand-orange disabled:opacity-50"
            >
              <option value="">
                {moviesLoading ? 'Loading movies...' : 'Select second movie'}
              </option>

              {movies.map((movie) => (
                <option
                  key={movie._id}
                  value={movie._id}
                  disabled={movie._id === movie1}
                >
                  {movie.title}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* MRP-83: Prevent repeated requests and show loading status */}
        <button
          type="button"
          onClick={handleCompare}
          disabled={!canCompare || loading || moviesLoading}
          className="px-6 py-3 rounded-pill bg-brand-orange text-bg font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Comparing...' : 'Compare Movies'}
        </button>
      </div>

      {/* MRP-81: Display movie comparison results side by side */}
      <div className="grid md:grid-cols-2 gap-6">
        {(comparison?.movies || [null, null]).map((movie, index) => (
          <div
            key={movie?.id || index}
            className="bg-surface rounded-2xl p-6"
          >
            {movie?.imageUrl ? (
              <img
                src={movie.imageUrl}
                alt={movie.title}
                className="w-full h-72 object-contain rounded-xl bg-surface-light mb-5"
              />
            ) : (
              <div className="h-72 rounded-xl bg-surface-light flex items-center justify-center text-gray-500 mb-5">
                Movie {index + 1}
              </div>
            )}

            <h2 className="text-xl font-bold text-white mb-3">
              {movie?.title || 'Select a movie'}
            </h2>

            <div className="space-y-3 text-sm text-gray-400">
              <p>
                Year: {movie?.year ?? '—'}
              </p>

              <p>
                Genre: {movie?.genre || '—'}
              </p>

              <p>
                Duration: {movie?.duration || '—'}
              </p>

              <p>
                Average Rating:{' '}
                {movie?.averageRating != null
                  ? `${Number(movie.averageRating).toFixed(1)} / 5`
                  : movie
                    ? 'No ratings yet'
                    : '—'}
              </p>

              <p>
                Approved Reviews: {movie?.approvedReviewCount ?? '—'}
              </p>

              {movie?.synopsis && (
                <p className="pt-3 border-t border-gray-700">
                  {movie.synopsis}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>

      <Footer />
    </div>
  );
};

export default MovieComparison;