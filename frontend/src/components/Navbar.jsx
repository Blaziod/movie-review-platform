import { useEffect, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axiosInstance from '../axiosConfig';
import HeaderLogo from './HeaderLogo';
import Button from './Button';

const NAV_LINK = 'text-xs font-semibold uppercase tracking-wider text-[#808080] hover:text-white transition-colors';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [unreadCount, setUnreadCount] = useState(0);

  // Refresh the unread badge whenever the reviewer logs in or moves to another page.
  useEffect(() => {
    if (!user || user.role === 'admin') {
      setUnreadCount(0);
      return;
    }
    axiosInstance
      .get('/api/notifications', { headers: { Authorization: `Bearer ${user.token}` } })
      .then((res) => setUnreadCount(res.data.unreadCount))
      .catch(() => setUnreadCount(0));
  }, [user, location.pathname]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="px-4 pt-4">
      <nav className="max-w-5xl mx-auto bg-surface rounded-pill px-6 py-3 flex justify-between items-center">
        <Link to="/">
          <HeaderLogo />
        </Link>
        <div className="flex items-center gap-6">
          <Link to="/" className={NAV_LINK}>
            Movies
          </Link>

          <Link to="/movies/compare" className={NAV_LINK}>
            Compare Movies
          </Link>
          {user?.role === 'admin' && (
            <>
              <Link to="/admin/manage-movies" className={NAV_LINK}>
                Manage Movies
              </Link>
              <Link to="/admin/moderation-queue" className={NAV_LINK}>
                Moderation Queue
              </Link>
            </>
          )}
          {user && user.role !== 'admin' && (
            <>
              <Link to="/my-reviews" className={NAV_LINK}>
                My Reviews
              </Link>
              <Link to="/notifications" className={`${NAV_LINK} flex items-center gap-2`}>
                Notifications
                {unreadCount > 0 && (
                  <span className="bg-brand-orange text-bg rounded-pill px-2 py-0.5 text-[10px] font-bold">
                    {unreadCount}
                  </span>
                )}
              </Link>
            </>
          )}
          {user ? (
            <>
              <span className="text-sm text-gray-300">Hi, {user.name}</span>
              <button onClick={handleLogout} className={NAV_LINK}>
                Log Out
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className={NAV_LINK}>
                Sign In
              </Link>
              <Link to="/register">
                <Button variant="primary" className="text-sm px-5 py-2">
                  Create account
                </Button>
              </Link>
            </>
          )}
        </div>
      </nav>
    </div>
  );
};

export default Navbar;
