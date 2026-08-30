import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import axiosInstance from '../axiosConfig';
import StarRating from '../components/StarRating';
import StatusBadge from '../components/StatusBadge';
import Button from '../components/Button';

const timeAgo = (dateString) => {
  const diffMs = Date.now() - new Date(dateString).getTime();
  const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  if (days <= 0) return 'today';
  if (days === 1) return '1 day ago';
  return `${days} days ago`;
};

// US3.3 - As a reviewer, I want to see my reviews' status (Pending/
// Approved/Rejected + reason), so I know the outcome.
const MyReviews = () => {
  const { user } = useAuth();
  const [reviews, setReviews] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    axiosInstance
      .get('/api/reviews/mine', { headers: { Authorization: `Bearer ${user?.token}` } })
      .then((res) => setReviews(res.data))
      .catch((err) => setError(err.response?.data?.message || 'Failed to load your reviews.'));
  }, [user]);

  return (
    <div className="max-w-2xl mx-auto mt-12 px-4">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold text-white uppercase tracking-wide">My Reviews</h1>
      </div>

      {error && (
        <div className="mb-4 px-4 py-2 text-sm text-danger bg-danger-bg rounded-xl">{error}</div>
      )}

      {reviews.length === 0 && !error && (
        <div className="text-center py-10">
          <p className="text-gray-500 mb-4">You haven't reviewed any movies yet.</p>
          <Link to="/write-review">
            <Button variant="primary">Write a Review</Button>
          </Link>
        </div>
      )}

      <div className="space-y-4">
        {reviews.map((review) => (
          <div key={review._id} className="bg-surface p-5 rounded-2xl">
            <div className="flex justify-between items-start mb-2">
              <p className="text-xs text-gray-500">Submitted {timeAgo(review.createdAt)}</p>
              <StatusBadge status={review.status} />
            </div>
            <p className="font-semibold text-white mb-1">{review.movieId?.title || 'Unknown movie'}</p>
            <StarRating value={review.rating} readOnly size="text-base" />
            <p className="text-sm text-gray-300 mt-2">{review.text}</p>
            {review.status === 'Rejected' && review.moderationReason && (
              <p className="text-xs text-danger mt-2">Reason: "{review.moderationReason}"</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default MyReviews;
