import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { user } = useAuth();

  return (
    <nav className="bg-blue-600 text-white p-4 flex justify-between items-center">
      <Link to="/" className="text-xl font-bold">Movie Review Platform</Link>
      <div>
        {!user && (
          <>
            <Link to="/login" className="mr-4">Login</Link>
            <Link to="/register" className="bg-green-500 px-4 py-2 rounded hover:bg-green-700">
              Register
            </Link>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
