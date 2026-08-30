import { Link } from 'react-router-dom';
import Logo from './Logo';

const Footer = () => (
  <footer className="max-w-5xl mx-auto mt-16 mb-6 px-4">
    <div className="bg-brand-orange rounded-3xl p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-8">
      <Logo dark />

      <div>
        <p className="text-[10px] font-normal uppercase tracking-wider text-[#1B1819] mb-2">Information</p>
        <ul className="text-sm text-[#1B1819] space-y-1">
          <li>
            <Link to="/" className="hover:underline">Movies</Link>
          </li>
          <li>
            <Link to="/my-reviews" className="hover:underline">Reviews</Link>
          </li>
          <li>Genres</li>
        </ul>
      </div>

      <div className="flex flex-col sm:items-end gap-3">
        <Link
          to="/register"
          className="px-6 py-2.5 rounded-pill bg-bg text-white text-sm font-semibold hover:bg-surface-light transition-colors"
        >
          Create Account
        </Link>
        <div className="text-sm text-bg sm:text-right">
          <p className="font-medium">+1 (999) 999-99-99</p>
          <p>info@reelboxed.com</p>
        </div>
      </div>
    </div>
  </footer>
);

export default Footer;
