import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axiosInstance from '../axiosConfig';

//As a visitor, I want to register as a Reviewer, so that I can submit reviews.
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
    <div className="max-w-md mx-auto mt-20">
      <form onSubmit={handleSubmit} className="bg-white p-6 shadow-md rounded" noValidate>
        <h1 className="text-2xl font-bold mb-4 text-center">Register</h1>

        {serverError && (
          <div className="mb-4 p-2 text-sm text-red-700 bg-red-50 border border-red-300 rounded">
            {serverError}
          </div>
        )}

        <input
          type="text"
          placeholder="Name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          className={`w-full mb-1 p-2 border rounded ${errors.name ? 'border-red-500' : ''}`}
        />
        {errors.name && <p className="text-xs text-red-600 mb-3">{errors.name}</p>}

        <input
          type="email"
          placeholder="Email"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          className={`w-full mb-1 p-2 border rounded ${errors.email ? 'border-red-500' : ''}`}
        />
        {errors.email && <p className="text-xs text-red-600 mb-3">{errors.email}</p>}

        <input
          type="password"
          placeholder="Password"
          value={formData.password}
          onChange={(e) => setFormData({ ...formData, password: e.target.value })}
          className={`w-full mb-1 p-2 border rounded ${errors.password ? 'border-red-500' : ''}`}
        />
        {errors.password && <p className="text-xs text-red-600 mb-3">{errors.password}</p>}

        <button type="submit" className="w-full bg-green-600 text-white p-2 rounded mt-2">
          Register
        </button>

        <p className="text-sm text-center mt-4">
          Already have an account? <Link to="/login" className="text-blue-600">Log in</Link>
        </p>
      </form>
    </div>
  );
};

export default Register;
