import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import axiosInstance from '../axiosConfig';
import Button from '../components/Button';
import Footer from '../components/Footer';

const timeAgo = (dateString) => {
  const diffMs = Date.now() - new Date(dateString).getTime();
  const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  if (days <= 0) return 'today';
  if (days === 1) return '1 day ago';
  return `${days} days ago`;
};

// FR: a reviewer sees what happened to each review they submitted (approved or
// rejected) without having to open My Reviews and check each one.
const Notifications = () => {
  const { user } = useAuth();
  const authHeader = { headers: { Authorization: `Bearer ${user?.token}` } };
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [error, setError] = useState('');

  const load = () => {
    axiosInstance
      .get('/api/notifications', authHeader)
      .then((res) => {
        setNotifications(res.data.notifications);
        setUnreadCount(res.data.unreadCount);
      })
      .catch((err) => setError(err.response?.data?.message || 'Failed to load notifications.'));
  };

  useEffect(() => {
    if (user) load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const markRead = async (id) => {
    try {
      await axiosInstance.patch(`/api/notifications/${id}/read`, {}, authHeader);
      load();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update the notification.');
    }
  };

  const markAllRead = async () => {
    try {
      await axiosInstance.patch('/api/notifications/read-all', {}, authHeader);
      load();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update notifications.');
    }
  };

  return (
    <div className="max-w-2xl mx-auto mt-12 px-4">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold text-white uppercase tracking-wide">Notifications</h1>
        {unreadCount > 0 && (
          <Button variant="secondary" className="text-sm px-4 py-1.5" onClick={markAllRead}>
            Mark all as read
          </Button>
        )}
      </div>

      {error && <div className="mb-4 px-4 py-2 text-sm text-danger bg-danger-bg rounded-xl">{error}</div>}

      {notifications.length === 0 && !error && (
        <p className="text-gray-500">No notifications yet. You will see a message here when a moderator decides on one of your reviews.</p>
      )}

      <div className="space-y-3">
        {notifications.map((n) => (
          <div
            key={n._id}
            className={`p-4 rounded-2xl flex justify-between items-start gap-4 ${n.read ? 'bg-surface' : 'bg-surface-light border border-brand-orange'}`}
          >
            <div>
              <p className={`text-sm ${n.type === 'review_rejected' ? 'text-danger' : 'text-success'} font-semibold mb-1`}>
                {n.type === 'review_rejected' ? 'Review rejected' : 'Review approved'}
              </p>
              <p className="text-sm text-gray-300">{n.message}</p>
              <p className="text-xs text-gray-500 mt-1">{timeAgo(n.createdAt)}</p>
            </div>
            {!n.read && (
              <button onClick={() => markRead(n._id)} className="text-xs text-brand-orange underline shrink-0">
                Mark read
              </button>
            )}
          </div>
        ))}
      </div>

      <Footer />
    </div>
  );
};

export default Notifications;
