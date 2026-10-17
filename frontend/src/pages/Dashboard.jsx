import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Button from '../components/Button';
import AdminStats from '../components/AdminStats';

const Dashboard = () => {
  const { user } = useAuth();

  return (
    <div
      className={`${user?.role === 'admin' ? 'max-w-3xl' : 'max-w-md'} mx-auto mt-20 text-center bg-surface rounded-2xl p-10`}
    >
      <h1 className="text-2xl font-bold mb-2 text-white">Welcome, {user?.name}</h1>
      <p className="text-gray-400">
        Logged in as <span className="font-semibold text-white">{user?.role}</span>.
      </p>

      {user?.role === 'admin' ? (
        <div className="mt-4">
          <Link to="/admin/moderation-queue">
            <Button variant="primary">Moderation Queue</Button>
          </Link>
          <AdminStats token={user.token} />
        </div>
      ) : (
        <div className="mt-4">
          <Link to="/">
            <Button variant="primary">Browse Movies</Button>
          </Link>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
