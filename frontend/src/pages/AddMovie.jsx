import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axiosInstance from '../axiosConfig';
import Input from '../components/Input';
import Button from '../components/Button';

const CURRENT_YEAR = new Date().getFullYear();

// US2.1 - As an admin, I want to add a movie (title, year, genre, synopsis),
// so the catalog stays current.
const AddMovie = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    year: '',
    genre: '',
    synopsis: '',
    imageUrl: '',
    duration: '',
  });
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
      setFormData({ title: '', year: '', genre: '', synopsis: '', imageUrl: '', duration: '' });
      setErrors({});
    } catch (error) {
      setErrors({ form: error.response?.data?.message || 'Failed to add movie.' });
    }
  };

  if (user?.role !== 'admin') {
    return (
      <div className="max-w-md mx-auto mt-20 text-center text-gray-400">
        Admin access required.{' '}
        <button onClick={() => navigate('/dashboard')} className="text-brand-orange underline">
          Back to dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto mt-16 px-4">
      <form onSubmit={handleSubmit} className="bg-surface p-8 rounded-2xl" noValidate>
        <h1 className="text-lg font-bold mb-6 text-white">Add Movie</h1>

        {success && (
          <div className="mb-4 px-4 py-2 text-sm text-success bg-success-bg rounded-xl">
            Movie added to the catalog.
          </div>
        )}
        {errors.form && (
          <div className="mb-4 px-4 py-2 text-sm text-danger bg-danger-bg rounded-xl">
            {errors.form}
          </div>
        )}

        <div className="space-y-1 mb-1">
          <Input
            type="text"
            placeholder="Movie Title"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            error={errors.title}
             className="px-4 py-3 rounded-xl bg-input text-white placeholder-gray-500 border border-transparent focus:outline-none focus:border-brand-orange"
          />
          {errors.title && <p className="text-xs text-danger mt-1 pl-2">{errors.title}</p>}
        </div>

        <div className="space-y-1 my-2">
          <Input
            type="number"
            placeholder="Year"
            value={formData.year}
            onChange={(e) => setFormData({ ...formData, year: e.target.value })}
            error={errors.year}
             className="px-4 py-3 rounded-xl bg-input text-white placeholder-gray-500 border border-transparent focus:outline-none focus:border-brand-orange"
          />
          {errors.year && <p className="text-xs text-danger mt-1 pl-2">{errors.year}</p>}
        </div>

        <div className="space-y-1 mb-2">
          <Input
            type="text"
            placeholder="Genre"
            value={formData.genre}
            onChange={(e) => setFormData({ ...formData, genre: e.target.value })}
            error={errors.genre}
             className="px-4 py-3 rounded-xl bg-input text-white placeholder-gray-500 border border-transparent focus:outline-none focus:border-brand-orange"
          />
          {errors.genre && <p className="text-xs text-danger mt-1 pl-2">{errors.genre}</p>}
        </div>

        <textarea
          placeholder="Synopsis"
          value={formData.synopsis}
          onChange={(e) => setFormData({ ...formData, synopsis: e.target.value })}
          className="w-full mb-2 px-4 py-3 rounded-xl bg-input text-white placeholder-gray-500 border border-transparent focus:outline-none focus:border-brand-orange"
          rows={3}
        />

        <div className="space-y-1 mb-2">
          <Input
            type="text"
            placeholder="Poster Image URL (optional)"
            value={formData.imageUrl}
            onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
             className="px-4 py-3 rounded-xl bg-input text-white placeholder-gray-500 border border-transparent focus:outline-none focus:border-brand-orange"
          />
        </div>

        <div className="space-y-1 mb-4">
          <Input
            type="text"
            placeholder="Duration (optional, e.g. 2h 34m)"
            value={formData.duration}
            onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
            className="px-4 py-3 rounded-xl bg-input text-white placeholder-gray-500 border border-transparent focus:outline-none focus:border-brand-orange"
          />
        </div>

        <Button type="submit" className="w-full">
          Submit
        </Button>
      </form>
    </div>
  );
};

export default AddMovie;
