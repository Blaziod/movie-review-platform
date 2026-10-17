import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axiosInstance from '../axiosConfig';
import RatingStats from './RatingStats';

const StatCard = ({ label, value, valueClass = 'text-white' }) => (
  <div className="bg-surface-light rounded-xl p-4">
    <p className="text-xs uppercase tracking-wide text-gray-400">{label}</p>
    <p className={`text-3xl font-bold mt-1 ${valueClass}`}>{value}</p>
  </div>
);

// US6.1 - As an admin, I want a statistics dashboard showing review counts by
// status, the movie total and the reviewer total.
// US6.2 - As an admin, I want to see the top rated movies.
const AdminStats = ({ token }) => {
  const [stats, setStats] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    axiosInstance
      .get('/api/admin/stats', { headers: { Authorization: `Bearer ${token}` } })
      .then((res) => setStats(res.data))
      .catch((err) => setError(err.response?.data?.message || 'Could not load statistics.'));
  }, [token]);

  if (error) {
    return <div className="mt-8 px-4 py-2 text-sm text-danger bg-danger-bg rounded-xl">{error}</div>;
  }

  if (!stats) {
    return <p className="mt-8 text-gray-400">Loading statistics...</p>;
  }

  return (
    <div className="mt-8 text-left">
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        <StatCard label="Pending reviews" value={stats.reviews.pending} valueClass="text-warning" />
        <StatCard label="Approved reviews" value={stats.reviews.approved} valueClass="text-success" />
        <StatCard label="Rejected reviews" value={stats.reviews.rejected} valueClass="text-danger" />
        <StatCard label="All reviews" value={stats.reviews.total} />
        <StatCard label="Movies" value={stats.movies.total} />
        <StatCard label="Reviewers" value={stats.reviewers.total} />
      </div>

      <h2 className="text-lg font-bold text-white mt-8 mb-3">Top rated</h2>
      {stats.topRated.length === 0 ? (
        <p className="text-gray-500">No approved reviews yet.</p>
      ) : (
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-xs uppercase tracking-wide text-gray-400 border-b border-border">
              <th className="py-2 pr-2">#</th>
              <th className="py-2 pr-2">Movie</th>
              <th className="py-2 pr-2">Genre</th>
              <th className="py-2">Rating</th>
            </tr>
          </thead>
          <tbody>
            {stats.topRated.map((movie, index) => (
              <tr key={movie.id} className="border-b border-border">
                <td className="py-2 pr-2 text-gray-400">{index + 1}</td>
                <td className="py-2 pr-2">
                  <Link to={`/movies/${movie.id}`} className="text-white hover:text-brand-orange">
                    {movie.title}
                  </Link>{' '}
                  <span className="text-gray-500">({movie.year})</span>
                </td>
                <td className="py-2 pr-2 text-gray-300">{movie.genre}</td>
                <td className="py-2">
                  <RatingStats avgRating={movie.avgRating} reviewCount={movie.reviewCount} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default AdminStats;
