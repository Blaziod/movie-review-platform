import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axiosInstance from '../axiosConfig';

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
      <div className="max-w-md mx-auto mt-20 text-center text-gray-600">
        Admin access required.{' '}
        <button onClick={() => navigate('/dashboard')} className="text-blue-600 underline">
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
    <div className="max-w-2xl mx-auto mt-12">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Manage Movies</h1>
        <Link to="/admin/add-movie" className="bg-green-600 text-white px-4 py-2 rounded">
          + Add Movie
        </Link>
      </div>

      {error && (
        <div className="mb-4 p-2 text-sm text-red-700 bg-red-50 border border-red-300 rounded">
          {error}
        </div>
      )}

      {movies.length === 0 && <p className="text-gray-500">No movies in the catalog yet.</p>}

      <ul className="space-y-3">
        {movies.map((movie) => (
          <li key={movie._id} className="bg-white p-4 shadow rounded">
            {editingId === movie._id ? (
              <div>
                {editErrors.form && (
                  <p className="text-xs text-red-600 mb-2">{editErrors.form}</p>
                )}
                <input
                  className="w-full mb-2 p-2 border rounded"
                  value={editForm.title}
                  onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                  placeholder="Title"
                />
                <input
                  type="number"
                  className="w-full mb-2 p-2 border rounded"
                  value={editForm.year}
                  onChange={(e) => setEditForm({ ...editForm, year: e.target.value })}
                  placeholder="Year"
                />
                <input
                  className="w-full mb-2 p-2 border rounded"
                  value={editForm.genre}
                  onChange={(e) => setEditForm({ ...editForm, genre: e.target.value })}
                  placeholder="Genre"
                />
                <textarea
                  className="w-full mb-2 p-2 border rounded"
                  value={editForm.synopsis}
                  onChange={(e) => setEditForm({ ...editForm, synopsis: e.target.value })}
                  placeholder="Synopsis"
                  rows={2}
                />
                <div className="flex gap-2">
                  <button
                    onClick={() => saveEdit(movie._id)}
                    className="bg-blue-600 text-white px-3 py-1 rounded"
                  >
                    Save
                  </button>
                  <button
                    onClick={() => setEditingId(null)}
                    className="bg-gray-200 px-3 py-1 rounded"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex justify-between items-center">
                <div>
                  <p className="font-semibold">
                    {movie.title} ({movie.year})
                  </p>
                  <p className="text-sm text-gray-500">{movie.genre}</p>
                </div>
                <div className="flex gap-3">
                  <button onClick={() => startEdit(movie)} className="text-blue-600">
                    Edit
                  </button>
                  <button onClick={() => requestDelete(movie._id)} className="text-red-600">
                    Delete
                  </button>
                </div>
              </div>
            )}
          </li>
        ))}
      </ul>

      {pendingDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center">
          <div className="bg-white p-6 rounded shadow-lg max-w-sm">
            <p className="mb-4">{pendingDelete.message}</p>
            <p className="text-sm text-red-600 mb-4">Deleting it is permanent.</p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setPendingDelete(null)}
                className="px-4 py-2 border rounded"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="px-4 py-2 bg-red-600 text-white rounded"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageMovies;
