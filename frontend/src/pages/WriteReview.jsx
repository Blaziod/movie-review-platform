import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import axiosInstance from '../axiosConfig';
import StarRating from '../components/StarRating';
import Button from '../components/Button';

const MIN_TEXT_LENGTH = 20;

// US3.1 - As a reviewer, I want to submit a rating (1-5) + review text for a
// movie, so I can share my opinion.

const WriteReview = () => {
  const { user } = useAuth();
  const authHeader = { headers: { Authorization: `Bearer ${user?.token}` } };

  const [movies, setMovies] = useState([]);
  const [movieId, setMovieId] = useState('');
  const [rating, setRating] = useState(0);
  const [text, setText] = useState('');
  const [errors, setErrors] = useState({});

  // US3.2 - the review just submitted, kept here so it can be edited or
  // withdrawn immediately without needing the full "My Reviews" list
  const [submittedReview, setSubmittedReview] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editErrors, setEditErrors] = useState({});

  useEffect(() => {
    axiosInstance
      .get('/api/movies', authHeader)
      .then((res) => setMovies(res.data))
      .catch(() => setErrors({ form: 'Failed to load the movie catalog.' }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const selectedMovie = movies.find((m) => m._id === movieId);
  const reviewedMovie = submittedReview && movies.find((m) => m._id === submittedReview.movieId);

  const validate = () => {
    const next = {};
    if (!movieId) next.movie = 'Please select a movie.';
    if (!rating) next.rating = 'Please select a rating.';
    if (!text.trim() || text.trim().length < MIN_TEXT_LENGTH) {
      next.text = `Review must be at least ${MIN_TEXT_LENGTH} characters (currently ${text.trim().length}).`;
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      const response = await axiosInstance.post('/api/reviews', { movieId, rating, text }, authHeader);
      setSubmittedReview(response.data);
      setMovieId('');
      setRating(0);
      setText('');
      setErrors({});
    } catch (error) {
      setErrors({ form: error.response?.data?.message || 'Failed to submit review.' });
    }
  };

  const startEditingReview = () => {
    setRating(submittedReview.rating);
    setText(submittedReview.text);
    setIsEditing(true);
    setEditErrors({});
  };

  const saveEditedReview = async () => {
    setEditErrors({});
    try {
      const response = await axiosInstance.put(
        `/api/reviews/${submittedReview._id}`,
        { rating, text },
        authHeader
      );
      setSubmittedReview(response.data);
      setIsEditing(false);
    } catch (error) {
      setEditErrors({ form: error.response?.data?.message || 'Failed to update review.' });
    }
  };

  const withdrawReview = async () => {
    try {
      await axiosInstance.delete(`/api/reviews/${submittedReview._id}`, authHeader);
      setSubmittedReview(null);

      setRating(0);
      setText('');
      setIsEditing(false);
    } catch (error) {
      setEditErrors({ form: error.response?.data?.message || 'Failed to withdraw review.' });
    }
  };

  // AC: editing is disabled once a review is no longer Pending
  if (submittedReview) {
    const isPending = submittedReview.status === 'Pending';

    return (
      <div className="max-w-md mx-auto mt-16 px-4">
        <div className="bg-surface p-8 rounded-2xl">
          <h1 className="text-lg font-bold mb-1 text-white">
            Your review {reviewedMovie ? `of ${reviewedMovie.title}` : ''}
          </h1>
          <span className="inline-block text-xs px-3 py-1 rounded-pill bg-warning-bg text-warning mb-4">
            {submittedReview.status}
          </span>

          {editErrors.form && (
            <div className="mb-4 px-4 py-2 text-sm text-danger bg-danger-bg rounded-xl">{editErrors.form}</div>
          )}

          {isEditing ? (
            <>
              <div className="mb-3">
                <StarRating value={rating} onChange={setRating} />
              </div>
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                rows={4}
                className="w-full mb-4 px-4 py-3 rounded-xl bg-input text-white border border-transparent focus:outline-none focus:border-brand-orange"
              />
              <div className="flex gap-2">
                <Button variant="primary" className="flex-1" onClick={saveEditedReview}>
                  Save
                </Button>
                <Button variant="secondary" className="flex-1" onClick={() => setIsEditing(false)}>
                  Cancel
                </Button>
              </div>
            </>
          ) : (
            <>
              <StarRating value={submittedReview.rating} readOnly size="text-xl" />
              <p className="text-gray-300 text-sm mt-3 mb-6">{submittedReview.text}</p>

              {isPending ? (
                <div className="flex gap-2">
                  <Button variant="secondary" className="flex-1" onClick={startEditingReview}>
                    Edit
                  </Button>
                  <Button variant="outlineDanger" className="flex-1" onClick={withdrawReview}>
                    Withdraw
                  </Button>
                </div>
              ) : (
                <p className="text-xs text-gray-500">
                  This review has been {submittedReview.status.toLowerCase()} and can no longer be edited.
                </p>
              )}
            </>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto mt-16 px-4">
      <form onSubmit={handleSubmit} className="bg-surface p-8 rounded-2xl" noValidate>
        <h1 className="text-lg font-bold mb-4 text-white">
          What Do You Rate {selectedMovie ? selectedMovie.title : 'This Movie'}
        </h1>

        {errors.form && (
          <div className="mb-4 px-4 py-2 text-sm text-danger bg-danger-bg rounded-xl">
            {errors.form}
          </div>
        )}

        <div className="mb-3">
          <select
            value={movieId}
            onChange={(e) => setMovieId(e.target.value)}
            className="w-full px-4 py-3 rounded-pill bg-input text-white border border-transparent focus:outline-none focus:border-brand-orange"
          >
            <option value="">Select a movie...</option>
            {movies.map((movie) => (
              <option key={movie._id} value={movie._id}>
                {movie.title} ({movie.year})
              </option>
            ))}
          </select>
          {errors.movie && <p className="text-xs text-danger mt-1 pl-2">{errors.movie}</p>}
        </div>

        <div className="mb-3">
          <StarRating value={rating} onChange={setRating} />
          {errors.rating && <p className="text-xs text-danger mt-1">{errors.rating}</p>}
        </div>

        <div className="mb-4">
          <textarea
            placeholder="Write your review.."
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={4}
            className="w-full px-4 py-3 rounded-xl bg-input text-white placeholder-gray-500 border border-transparent focus:outline-none focus:border-brand-orange"
          />
          {errors.text && <p className="text-xs text-danger mt-1 pl-2">{errors.text}</p>}
        </div>

        <Button type="submit" className="w-full">
          Submit
        </Button>
      </form>
    </div>
  );
};

export default WriteReview;
