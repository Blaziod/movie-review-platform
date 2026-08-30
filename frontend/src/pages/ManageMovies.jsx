import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axiosInstance from '../axiosConfig';
import Input from '../components/Input';
import Button from '../components/Button';
import Footer from '../components/Footer';

// US2.2 - As an admin, I want to edit or remove a movie, so I can correct
// errors or retire titles.
const ManageMovies = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const authHeader = { headers: { Authorization: `Bearer ${user?.token}` } };

  const [movies, setMovies] = useState([]);
  const [error, setError] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({
    title: '',
    year: '',
    genre: '',
    synopsis: '',
    imageUrl: '',
    duration: '',
  });
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
    setEditForm({
      title: movie.title,
      year: movie.year,
      genre: movie.genre,
      synopsis: movie.synopsis || '',
      imageUrl: movie.imageUrl || '',
      duration: movie.duration || '',
    });
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
          <Button variant="primary" className="text-sm flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
  <path d="M12 2.25C10.0716 2.25 8.18657 2.82183 6.58319 3.89317C4.97982 4.96451 3.73013 6.48726 2.99218 8.26884C2.25422 10.0504 2.06114 12.0108 2.43735 13.9021C2.81355 15.7934 3.74215 17.5307 5.10571 18.8943C6.46928 20.2579 8.20656 21.1865 10.0979 21.5627C11.9892 21.9389 13.9496 21.7458 15.7312 21.0078C17.5127 20.2699 19.0355 19.0202 20.1068 17.4168C21.1782 15.8134 21.75 13.9284 21.75 12C21.7473 9.41498 20.7192 6.93661 18.8913 5.10872C17.0634 3.28084 14.585 2.25273 12 2.25ZM12 20.25C10.3683 20.25 8.77326 19.7661 7.41655 18.8596C6.05984 17.9531 5.00242 16.6646 4.378 15.1571C3.75358 13.6496 3.5902 11.9908 3.90853 10.3905C4.22685 8.79016 5.01259 7.32015 6.16637 6.16637C7.32016 5.01259 8.79017 4.22685 10.3905 3.90852C11.9909 3.59019 13.6497 3.75357 15.1571 4.37799C16.6646 5.00242 17.9531 6.05984 18.8596 7.41655C19.7661 8.77325 20.25 10.3683 20.25 12C20.2475 14.1873 19.3775 16.2843 17.8309 17.8309C16.2843 19.3775 14.1873 20.2475 12 20.25ZM16.5 12C16.5 12.1989 16.421 12.3897 16.2803 12.5303C16.1397 12.671 15.9489 12.75 15.75 12.75H12.75V15.75C12.75 15.9489 12.671 16.1397 12.5303 16.2803C12.3897 16.421 12.1989 16.5 12 16.5C11.8011 16.5 11.6103 16.421 11.4697 16.2803C11.329 16.1397 11.25 15.9489 11.25 15.75V12.75H8.25C8.05109 12.75 7.86033 12.671 7.71967 12.5303C7.57902 12.3897 7.5 12.1989 7.5 12C7.5 11.8011 7.57902 11.6103 7.71967 11.4697C7.86033 11.329 8.05109 11.25 8.25 11.25H11.25V8.25C11.25 8.05109 11.329 7.86032 11.4697 7.71967C11.6103 7.57902 11.8011 7.5 12 7.5C12.1989 7.5 12.3897 7.57902 12.5303 7.71967C12.671 7.86032 12.75 8.05109 12.75 8.25V11.25H15.75C15.9489 11.25 16.1397 11.329 16.2803 11.4697C16.421 11.6103 16.5 11.8011 16.5 12Z" fill="#080808"/>
</svg> Add Movie
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
                <Input
                  value={editForm.imageUrl}
                  onChange={(e) => setEditForm({ ...editForm, imageUrl: e.target.value })}
                  placeholder="Poster Image URL (optional)"
                />
                <Input
                  value={editForm.duration}
                  onChange={(e) => setEditForm({ ...editForm, duration: e.target.value })}
                  placeholder="Duration (optional, e.g. 2h 34m)"
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
              <div className="w-14 h-20 rounded-lg bg-surface-light flex items-center justify-center text-gray-500 text-xs shrink-0 overflow-hidden">
                {movie.imageUrl ? (
                  <img src={movie.imageUrl} alt={movie.title} className="w-full h-full object-cover" />
                ) : (
                  movie.title.slice(0, 1)
                )}
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

      <Footer />
    </div>
  );
};

export default ManageMovies;
