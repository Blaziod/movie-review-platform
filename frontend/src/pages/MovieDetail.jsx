import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axiosInstance from '../axiosConfig';
import StarRating from '../components/StarRating';
import RatingStats from '../components/RatingStats';
import Button from '../components/Button';
import Footer from '../components/Footer';

const MIN_TEXT_LENGTH = 20;

// US5.2 - As any visitor, I want to see a movie's average rating and its
// approved reviews, so I can judge quality before watching.
const MovieDetail = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const [movie, setMovie] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [error, setError] = useState('');

  const [rating, setRating] = useState(0);
  const [text, setText] = useState('');
  const [formErrors, setFormErrors] = useState({});
  const [success, setSuccess] = useState(false);

  const load = () => {
    axiosInstance
      .get(`/api/movies/${id}`)
      .then((res) => {
        setMovie(res.data.movie);
        setReviews(res.data.reviews);
      })
      .catch((err) => setError(err.response?.data?.message || 'Failed to load this movie.'));
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    setSuccess(false);
    const next = {};
    if (!rating) next.rating = 'Please select a rating.';
    if (!text.trim() || text.trim().length < MIN_TEXT_LENGTH) {
      next.text = `Review must be at least ${MIN_TEXT_LENGTH} characters (currently ${text.trim().length}).`;
    }
    setFormErrors(next);
    if (Object.keys(next).length > 0) return;

    try {
      await axiosInstance.post(
        '/api/reviews',
        { movieId: id, rating, text },
        { headers: { Authorization: `Bearer ${user?.token}` } }
      );
      setSuccess(true);
      setRating(0);
      setText('');
      setFormErrors({});
    } catch (err) {
      setFormErrors({ form: err.response?.data?.message || 'Failed to submit review.' });
    }
  };

  if (error) {
    return <div className="max-w-md mx-auto mt-20 text-center text-danger">{error}</div>;
  }
  if (!movie) return null;

  return (
    <div className="max-w-5xl mx-auto mt-12 px-4">
      <div className="flex flex-wrap justify-between items-baseline gap-2 mb-4">
        <h1 className="text-2xl font-bold text-white">{movie.title}</h1>
        {movie.duration && (
          <p className="text-sm text-gray-400">
            {movie.duration} <span className="text-white font-medium ml-2">Movie Info</span>
          </p>
        )}
      </div>

      <div className="grid md:grid-cols-[2fr_1fr] gap-8 mb-10">
        <div className="aspect-video rounded-2xl bg-surface flex items-center justify-center text-gray-500 text-4xl overflow-hidden">
          {movie.imageUrl ? (
            <img src={movie.imageUrl} alt={movie.title} className="w-full h-full object-cover" />
          ) : (
            movie.title.slice(0, 1)
          )}
        </div>
        <div className="bg-surface rounded-2xl p-6">
          <p className="text-sm text-gray-400 mb-1">
            {movie.year} &bull; {movie.genre}
          </p>
          <div className="mb-3">
            <RatingStats avgRating={movie.avgRating} reviewCount={movie.reviewCount} size="text-sm" />
          </div>
          {movie.synopsis && <p className="text-sm text-gray-300">{movie.synopsis}</p>}
        </div>
      </div>

      <div className="grid md:grid-cols-[2fr_1fr] gap-8">
        <div>
          <h2 className="font-bold text-white mb-4">Approved Reviews ({reviews.length})</h2>
          {reviews.length === 0 ? (
            <p className="text-gray-500">No reviews yet - be the first to review!</p>
          ) : (
            <div className="space-y-4">
              {reviews.map((review) => (
                <div key={review._id} className="bg-surface p-4 rounded-2xl">
                  <div className="flex justify-between items-center mb-1">
                    <p className="text-sm font-semibold text-white">{review.userId?.name || 'Reviewer'}</p>
                    <StarRating value={review.rating} readOnly size="text-sm" />
                  </div>
                  <p className="text-sm text-gray-300">{review.text}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        <div>
          {user && user.role !== 'admin' ? (
            <form onSubmit={handleSubmitReview} className="bg-surface p-6 rounded-2xl">
              <h2 className="font-bold text-white mb-3">What Do You Rate {movie.title}</h2>
              {success && (
                <div className="mb-3 px-4 py-2 text-sm text-success bg-success-bg rounded-xl">
                  Review submitted - pending moderation.
                </div>
              )}
              {formErrors.form && (
                <div className="mb-3 px-4 py-2 text-sm text-danger bg-danger-bg rounded-xl">
                  {formErrors.form}
                </div>
              )}
              <div className="mb-3">
                <StarRating value={rating} onChange={setRating} />
                {formErrors.rating && <p className="text-xs text-danger mt-1">{formErrors.rating}</p>}
              </div>
              <textarea
                placeholder="Write your review.."
                value={text}
                onChange={(e) => setText(e.target.value)}
                rows={3}
                className="w-full mb-1 px-4 py-3 rounded-xl bg-input text-white placeholder-gray-500 border border-transparent focus:outline-none focus:border-brand-orange"
              />
              {formErrors.text && <p className="text-xs text-danger mb-2">{formErrors.text}</p>}
              <Button type="submit" className="w-full mt-2">
                Submit
              </Button>
            </form>
          ) : (
            !user && (
              <div className="bg-surface p-6 rounded-2xl text-center">
                <p className="text-sm text-gray-400">
                  <Link to="/login" className="text-brand-orange underline">
                    Log in
                  </Link>{' '}
                  to write a review.
                </p>
              </div>
            )
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default MovieDetail;
