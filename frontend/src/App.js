import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Register from './pages/Register';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import AddMovie from './pages/AddMovie';
import ManageMovies from './pages/ManageMovies';
import MyReviews from './pages/MyReviews';
import ModerationQueue from './pages/ModerationQueue';
import Catalog from './pages/Catalog';
import MovieDetail from './pages/MovieDetail';

function App() {
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/" element={<Catalog />} />
        <Route path="/movies/:id" element={<MovieDetail />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/admin/add-movie" element={<AddMovie />} />
        <Route path="/admin/manage-movies" element={<ManageMovies />} />
        <Route path="/admin/moderation-queue" element={<ModerationQueue />} />
        <Route path="/my-reviews" element={<MyReviews />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
