import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axiosInstance from '../axiosConfig';
import StarRating from '../components/StarRating';
import Button from '../components/Button';

// US4.1 - As a moderator, I want a queue of pending reviews with
// reviewer/movie context, so I can assess them efficiently.
// US4.2 - As a moderator, I want to approve/reject a review with a reason.
const ModerationQueue = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const authHeader = { headers: { Authorization: `Bearer ${user?.token}` } };

  const [reviews, setReviews] = useState([]);
  const [error, setError] = useState('');
  const [rejecting, setRejecting] = useState(null);

  const loadQueue = () => {
    axiosInstance
      .get('/api/reviews/pending', authHeader)
      .then((res) => setReviews(res.data))
      .catch((err) => setError(err.response?.data?.message || 'Failed to load the moderation queue.'));
  };

  useEffect(() => {
    if (user?.role === 'admin') loadQueue();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (user?.role !== 'admin') {
    return (
      <div className="max-w-md mx-auto mt-20 text-center text-gray-400">
        Admin access required.{' '}
        <button onClick={() => navigate('/dashboard')} className="text-brand-orange underline">
          Back to dashboard
        </button>
      </div>
    );
  }

  const approve = async (id) => {
    try {
      await axiosInstance.patch(`/api/reviews/${id}/moderate`, { decision: 'approve' }, authHeader);
      loadQueue();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to approve review.');
    }
  };

  const submitReject = async () => {
    if (!rejecting.reason || rejecting.reason.trim().length < 10) {
      setRejecting({ ...rejecting, error: 'Reason must be at least 10 characters.' });
      return;
    }
    try {
      await axiosInstance.patch(
        `/api/reviews/${rejecting.reviewId}/moderate`,
        { decision: 'reject', reason: rejecting.reason },
        authHeader
      );
      setRejecting(null);
      loadQueue();
    } catch (err) {
      setRejecting({ ...rejecting, error: err.response?.data?.message || 'Failed to reject review.' });
    }
  };

  return (
    <div className="max-w-2xl mx-auto mt-12 px-4">
      <h1 className="text-2xl font-bold text-white uppercase tracking-wide mb-8">Moderation Queue</h1>

      {error && (
        <div className="mb-4 px-4 py-2 text-sm text-danger bg-danger-bg rounded-xl">{error}</div>
      )}

      {reviews.length === 0 && (
        <p className="text-gray-500">No pending reviews, all caught up!</p>
      )}

      <div className="space-y-4">
        {reviews.map((review) => (
          <div key={review._id} className="bg-surface p-5 rounded-2xl">
            <div className="flex justify-between items-start mb-2">
              <div>
                <p className="font-semibold text-white">{review.userId?.name || 'Unknown reviewer'}</p>
                <p className="text-xs text-gray-500">{review.movieId?.title || 'Unknown movie'}</p>
              </div>
              <StarRating value={review.rating} readOnly size="text-base" />
            </div>
            <p className="text-sm text-gray-300 mb-4">{review.text}</p>
            <div className="flex gap-2">
              <Button variant="outlineSuccess" className="text-sm px-4 py-1.5" onClick={() => approve(review._id)}>
                Approve
              </Button>
              <Button
                variant="outlineDanger"
                className="text-sm px-4 py-1.5"
                onClick={() => setRejecting({ reviewId: review._id, reason: '' })}
              >
                Reject
              </Button>
            </div>
          </div>
        ))}
      </div>

      {rejecting && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center px-4">
          <div className="bg-surface p-6 rounded-2xl max-w-sm w-full">
            <h2 className="font-bold text-white mb-1">Reject Review</h2>
            <p className="text-xs text-gray-400 mb-2">Reason (min 10 characters, shown to Reviewer)</p>
            <textarea
              value={rejecting.reason}
              onChange={(e) => setRejecting({ ...rejecting, reason: e.target.value })}
              placeholder="Write reason.."
              rows={3}
              className="w-full mb-2 px-4 py-3 rounded-xl bg-input text-white placeholder-gray-500 border border-transparent focus:outline-none focus:border-brand-orange"
            />
            {rejecting.error && <p className="text-xs text-danger mb-3">{rejecting.error}</p>}
            <div className="flex gap-2 mt-2">
              <Button variant="primary" className="flex-1" onClick={submitReject}>
                Submit
              </Button>
              <Button variant="secondary" className="flex-1" onClick={() => setRejecting(null)}>
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ModerationQueue;
