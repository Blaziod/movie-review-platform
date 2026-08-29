import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axiosInstance from '../axiosConfig';

const CURRENT_YEAR = new Date().getFullYear();

// US2.1 - As an admin, I want to add a movie (title, year, genre, synopsis),
// so the catalog stays current.
const AddMovie = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ title: '', year: '', genre: '', synopsis: '' });
  const [errors, setErrors] = useState({});
  const [success, setSuccess] = useState(false);

  const validate = () => {
    const next = {};
    if (!formData.title.trim()) next.title = 'Title is required.';
    const yearNum = Number(formData.year);
    if (!formData.year || Number.isNaN(yearNum) || yearNum < 1900 || yearNum > CURRENT_YEAR + 1) {
      next.year = `Enter a valid year (1900-${CURRENT_YEAR + 1}).`;
    }
    if (!formData.genre.trim()) next.genre = 'Genre is required.';
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccess(false);
    if (!validate()) return;

    try {
      await axiosInstance.post(
        '/api/movies',
        { ...formData, year: Number(formData.year) },
        { headers: { Authorization: `Bearer ${user?.token}` } }
      );
      setSuccess(true);
      setFormData({ title: '', year: '', genre: '', synopsis: '' });
      setErrors({});
    } catch (error) {
      setErrors({ form: error.response?.data?.message || 'Failed to add movie.' });
    }
  };

  if (user?.role !== 'admin') {
    return (
      <div className="max-w-md mx-auto mt-20 text-center text-gray-600">
        Admin access required.{' '}
        <button onClick={() => navigate('/dashboard')} className="text-blue-600 underline">
          Back to dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto mt-16">
      <form onSubmit={handleSubmit} className="bg-white p-6 shadow-md rounded" noValidate>
        <h1 className="text-2xl font-bold mb-4 text-center">Add Movie</h1>

        {success && (
          <div className="mb-4 p-2 text-sm text-green-700 bg-green-50 border border-green-300 rounded">
            Movie added to the catalog.
          </div>
        )}
        {errors.form && (
          <div className="mb-4 p-2 text-sm text-red-700 bg-red-50 border border-red-300 rounded">
            {errors.form}
          </div>
        )}

        <input
          type="text"
          placeholder="Title"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          className={`w-full mb-1 p-2 border rounded ${errors.title ? 'border-red-500' : ''}`}
        />
        {errors.title && <p className="text-xs text-red-600 mb-3">{errors.title}</p>}

        <input
          type="number"
          placeholder="Year"
          value={formData.year}
          onChange={(e) => setFormData({ ...formData, year: e.target.value })}
          className={`w-full mb-1 p-2 border rounded ${errors.year ? 'border-red-500' : ''}`}
        />
        {errors.year && <p className="text-xs text-red-600 mb-3">{errors.year}</p>}

        <input
          type="text"
          placeholder="Genre"
          value={formData.genre}
          onChange={(e) => setFormData({ ...formData, genre: e.target.value })}
          className={`w-full mb-1 p-2 border rounded ${errors.genre ? 'border-red-500' : ''}`}
        />
        {errors.genre && <p className="text-xs text-red-600 mb-3">{errors.genre}</p>}

        <textarea
          placeholder="Synopsis (optional)"
          value={formData.synopsis}
          onChange={(e) => setFormData({ ...formData, synopsis: e.target.value })}
          className="w-full mb-4 p-2 border rounded"
          rows={3}
        />

        <button type="submit" className="w-full bg-blue-600 text-white p-2 rounded">
          Add Movie
        </button>
      </form>
    </div>
  );
};

export default AddMovie;
