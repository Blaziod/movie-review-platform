import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axiosInstance from '../axiosConfig';
import Input from '../components/Input';
import Button from '../components/Button';

// US2.2 - As an admin, I want to edit or remove a movie, so I can correct
// errors or retire titles.
const ManageMovies = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const authHeader = { headers: { Authorization: `Bearer ${user?.token}` } };

  const [movies, setMovies] = useState([]);
  const [error, setError] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({ title: '', year: '', genre: '', synopsis: '' });
  const [editErrors, setEditErrors] = useState({});
  const [pendingDelete, setPendingDelete] = useState(null);

  const loadMovies = async () => {
    try {
      const response = await axiosInstance.get('/api/movies', authHeader);
      setMovies(response.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load movies.');
    }
  };

  useEffect(() => {
    if (user?.role === 'admin') loadMovies();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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

  const startEdit = (movie) => {
    setEditingId(movie._id);
    setEditForm({ title: movie.title, year: movie.year, genre: movie.genre, synopsis: movie.synopsis || '' });
    setEditErrors({});
  };

  const saveEdit = async (id) => {
    setEditErrors({});
    try {
      await axiosInstance.put(
        `/api/movies/${id}`,
        { ...editForm, year: Number(editForm.year) },
        authHeader
      );
      setEditingId(null);
      loadMovies();
    } catch (err) {
      setEditErrors({ form: err.response?.data?.message || 'Failed to update movie.' });
    }
  };

  const requestDelete = async (id) => {
    try {
      await axiosInstance.delete(`/api/movies/${id}`, authHeader);
      loadMovies();
    } catch (err) {
      if (err.response?.status === 409) {
        setPendingDelete({ id, message: err.response.data.message });
      } else {
        setError(err.response?.data?.message || 'Failed to delete movie.');
      }
    }
  };

  const confirmDelete = async () => {
    const { id } = pendingDelete;
    setPendingDelete(null);
    try {
      await axiosInstance.delete(`/api/movies/${id}?confirm=true`, authHeader);
      loadMovies();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete movie.');
    }
  };

  return (
    <div className="max-w-4xl mx-auto mt-12 px-4">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold text-white uppercase tracking-wide">Manage Movies</h1>
        <Link to="/admin/add-movie">
          <Button variant="primary" className="text-sm">
            + Add Movie
          </Button>
        </Link>
      </div>

      {error && (
        <div className="mb-4 px-4 py-2 text-sm text-danger bg-danger-bg rounded-xl">{error}</div>
      )}

      {movies.length === 0 && <p className="text-gray-500">No movies in the catalog yet.</p>}

      <div className="grid sm:grid-cols-2 gap-6">
        {movies.map((movie) =>
          editingId === movie._id ? (
            <div key={movie._id} className="bg-surface p-5 rounded-2xl sm:col-span-2 max-w-md">
              {editErrors.form && <p className="text-xs text-danger mb-2">{editErrors.form}</p>}
              <div className="space-y-2">
                <Input
                  value={editForm.title}
                  onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                  placeholder="Movie Title"
                />
                <Input
                  type="number"
                  value={editForm.year}
                  onChange={(e) => setEditForm({ ...editForm, year: e.target.value })}
                  placeholder="Year"
                />
                <Input
                  value={editForm.genre}
                  onChange={(e) => setEditForm({ ...editForm, genre: e.target.value })}
                  placeholder="Genre"
                />
                <textarea
                  value={editForm.synopsis}
                  onChange={(e) => setEditForm({ ...editForm, synopsis: e.target.value })}
                  placeholder="Synopsis"
                  rows={2}
                  className="w-full px-4 py-3 rounded-xl bg-input text-white placeholder-gray-500 border border-transparent focus:outline-none focus:border-brand-orange"
                />
              </div>
              <div className="flex gap-2 mt-3">
                <Button variant="primary" className="flex-1" onClick={() => saveEdit(movie._id)}>
                  Submit
                </Button>
                <Button variant="secondary" className="flex-1" onClick={() => setEditingId(null)}>
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <div key={movie._id} className="flex items-center gap-4">
              <div className="w-14 h-20 rounded-lg bg-surface-light flex items-center justify-center text-gray-500 text-xs shrink-0">
                {movie.title.slice(0, 1)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-white truncate">{movie.title}</p>
                <p className="text-sm text-gray-400">
                  {movie.year} &bull; {movie.genre}
                </p>
              </div>
              <div className="flex gap-2 shrink-0">
                <Button variant="secondary" className="text-sm px-4 py-1.5" onClick={() => startEdit(movie)}>
                  Edit
                </Button>
                <Button
                  variant="outlineDanger"
                  className="text-sm px-4 py-1.5"
                  onClick={() => requestDelete(movie._id)}
                >
                  Delete
                </Button>
              </div>
            </div>
          )
        )}
      </div>

      {pendingDelete && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center px-4">
          <div className="bg-surface p-6 rounded-2xl max-w-sm w-full">
            <h2 className="font-bold text-white mb-3">Delete Movie</h2>
            <p className="text-sm text-gray-300 mb-1">{pendingDelete.message}</p>
            <p className="text-sm text-danger mb-4">Deleting it is permanent.</p>
            <div className="flex gap-2">
              <Button variant="primary" className="flex-1" onClick={confirmDelete}>
                Delete
              </Button>
              <Button variant="secondary" className="flex-1" onClick={() => setPendingDelete(null)}>
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageMovies;
