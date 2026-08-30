import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axiosInstance from '../axiosConfig';
import HeaderLogo from '../components/HeaderLogo';
import Input from '../components/Input';
import Button from '../components/Button';

// As a registered user, I want to log in, so I reach my role's dashboard.
const Login = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const response = await axiosInstance.post('/api/auth/login', formData);
      login(response.data);

      navigate('/dashboard');
    } catch (err) {
      // AC: wrong credentials -> "Invalid email or password".
      setError(err.response?.data?.message || 'Login failed. Please try again.');
    }
  };

  return (
    <div className="max-w-md mx-auto mt-16 px-4">
      <form onSubmit={handleSubmit} className="bg-surface p-10 rounded-2xl" noValidate>
        <div className="flex justify-center mb-3">
          <HeaderLogo />
        </div>
        <p className="text-center text-sm text-[#808080] mb-6">
          Join Reelboxed to find good movies you want to see
        </p>

        {error && (
          <div className="mb-4 px-4 py-2 text-sm text-danger bg-danger-bg rounded-xl">
            {error}
          </div>
        )}

        <div className="space-y-3 mb-4">
          <Input
            type="email"
            placeholder="Email address"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          />
          <Input
            type="password"
            placeholder="Password"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
          />
        </div>

        <Button type="submit" className="w-full">
          Log In
        </Button>

        <p className="text-sm text-center mt-6 text-gray-400">
          Don't have an account?{' '}
          <Link to="/register" className="text-white underline">
            Register
          </Link>
        </p>
      </form>
    </div>
  );
};

export default Login;
