import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Button from '../components/Button';

const Dashboard = () => {
  const { user } = useAuth();

  return (
    <div className="max-w-md mx-auto mt-20 text-center bg-surface rounded-2xl p-10">
      <h1 className="text-2xl font-bold mb-2 text-white">Welcome, {user?.name}</h1>
      <p className="text-gray-400">
        Logged in as <span className="font-semibold text-white">{user?.role}</span>.
      </p>

      {user?.role === 'admin' ? (
        <p className="text-sm text-gray-500 mt-4">Moderation queue lands here (MRP-37).</p>
      ) : (
        <>
          <p className="text-sm text-gray-500 mt-4 mb-4">
            Full movie catalog browsing lands here (MRP-45).
          </p>
          <Link to="/write-review">
            <Button variant="primary">Write a Review</Button>
          </Link>
        </>
      )}
    </div>
  );
};

export default Dashboard;
