import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Register from './pages/Register';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import AddMovie from './pages/AddMovie';
import ManageMovies from './pages/ManageMovies';
import WriteReview from './pages/WriteReview';
import ModerationQueue from './pages/ModerationQueue';

function App() {
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/admin/add-movie" element={<AddMovie />} />
        <Route path="/admin/manage-movies" element={<ManageMovies />} />
        <Route path="/admin/moderation-queue" element={<ModerationQueue />} />
        <Route path="/write-review" element={<WriteReview />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
