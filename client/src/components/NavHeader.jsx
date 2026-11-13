import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import './NavHeader.css';

function NavHeader() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="nav-header">

      <div className="nav-brand">
        <span>🩸</span>
        <span className="nav-brand-name">Sweety</span>
      </div>

      <nav className="nav-links">
        <NavLink
          to="/dashboard"
          className={({ isActive }) => isActive ? 'nav-link nav-link--active' : 'nav-link'}
        >
          Readings
        </NavLink>
        <NavLink
          to="/reports"
          className={({ isActive }) => isActive ? 'nav-link nav-link--active' : 'nav-link'}
        >
          Reports
        </NavLink>
      </nav>

      <div className="nav-user">
        <span className="nav-welcome">
          <strong>{user?.name}</strong>
        </span>
        <button
          id="logout-btn"
          className="btn-logout"
          onClick={handleLogout}
        >
          Sign out
        </button>
      </div>
    </header>
  );
}

export default NavHeader;
