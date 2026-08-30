import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Logo from './Logo';
import Button from './Button';

const NAV_LINK = 'text-xs font-semibold uppercase tracking-wider text-gray-400 hover:text-white transition-colors';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="px-4 pt-4">
      <nav className="max-w-5xl mx-auto bg-surface rounded-pill px-6 py-3 flex justify-between items-center">
        <Link to="/">
          <Logo />
        </Link>
        <div className="flex items-center gap-6">
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
            <Link to="/write-review" className={NAV_LINK}>
              Write a Review
            </Link>
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
