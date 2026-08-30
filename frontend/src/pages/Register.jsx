import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axiosInstance from '../axiosConfig';
import HeaderLogo from '../components/HeaderLogo';
import Input from '../components/Input';
import Button from '../components/Button';

// As a visitor, I want to register as a Reviewer, so that I can submit reviews.
const Register = () => {
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const navigate = useNavigate();

  const validate = () => {
    const next = {};
    if (!formData.name.trim()) next.name = 'Name is required.';
    if (!formData.email.trim()) next.email = 'Email is required.';
    else if (!/^\S+@\S+\.\S+$/.test(formData.email)) next.email = 'Enter a valid email address.';
    if (!formData.password || formData.password.length < 6) {
      next.password = 'Password must be at least 6 characters.';
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError('');
    if (!validate()) return;

    try {
      await axiosInstance.post('/api/auth/register', formData);
      navigate('/login');
    } catch (error) {
      // AC: duplicate email -> "Email already in use", no duplicate account created.
      setServerError(error.response?.data?.message || 'Registration failed. Please try again.');
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

        {serverError && (
          <div className="mb-4 px-4 py-2 text-sm text-danger bg-danger-bg rounded-xl">
            {serverError}
          </div>
        )}

        <div className="mb-1">
          <Input
            type="text"
            placeholder="Name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            error={errors.name}
          />
          {errors.name && <p className="text-xs text-danger mt-1 mb-2 pl-2">{errors.name}</p>}
        </div>

        <div className="mb-1">
          <Input
            type="email"
            placeholder="Email address"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            error={errors.email}
          />
          {errors.email && <p className="text-xs text-danger mt-1 mb-2 pl-2">{errors.email}</p>}
        </div>

        <div className="mb-1">
          <Input
            type="password"
            placeholder="Password"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            error={errors.password}
          />
          {errors.password && <p className="text-xs text-danger mt-1 mb-2 pl-2">{errors.password}</p>}
        </div>

        <Button type="submit" className="w-full mt-3">
          Register
        </Button>

        <p className="text-sm text-center mt-6 text-gray-400">
          Already have an account?{' '}
          <Link to="/login" className="text-white underline">
            Log in
          </Link>
        </p>
      </form>
    </div>
  );
};

export default Register;
