import { useAuth } from '../context/AuthContext';

const Dashboard = () => {
  const { user } = useAuth();

  return (
    <div className="max-w-md mx-auto mt-20 text-center bg-surface rounded-2xl p-10">
      <h1 className="text-2xl font-bold mb-2 text-white">Welcome, {user?.name}</h1>
      <p className="text-gray-400">
        Logged in as <span className="font-semibold text-white">{user?.role}</span>.
      </p>
      <p className="text-sm text-gray-500 mt-4">
        {user?.role === 'admin'
          ? 'Moderation queue lands here (MRP-37).'
          : 'Movie catalog lands here (MRP-45).'}
      </p>
    </div>
  );
};

export default Dashboard;
