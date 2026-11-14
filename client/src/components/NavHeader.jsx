import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './NavHeader.css';

function NavHeader() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const userInitial = user?.name ? user.name.trim().charAt(0).toUpperCase() : 'U';

  return (
    <header className="nav-header">
      <div className="nav-container">
        <div className="nav-left">
          <NavLink to="/dashboard" className="nav-brand">
            <div className="nav-logo-icon">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z" fill="url(#nav-brand-grad)" />
                <path d="M8.5 14.5l2.5-3 2 2.5 3-4" stroke="#ffffff" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
                <defs>
                  <linearGradient id="nav-brand-grad" x1="6.34" y1="2.69" x2="17.66" y2="20" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#0d9488" />
                    <stop offset="1" stopColor="#059669" />
                  </linearGradient>
                </defs>
              </svg>
            </div>
            <div className="nav-brand-text">
              <span className="nav-brand-name">Sweety</span>
              <span className="nav-brand-tag">Clinical Tracker</span>
            </div>
          </NavLink>

          <nav className="nav-links">
            <NavLink
              to="/dashboard"
              className={({ isActive }) => isActive ? 'nav-link nav-link--active' : 'nav-link'}
            >
              <svg className="nav-link-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect width="18" height="18" x="3" y="3" rx="2" />
                <path d="M3 9h18" />
                <path d="M9 21V9" />
              </svg>
              <span>Readings</span>
            </NavLink>
            <NavLink
              to="/reports"
              className={({ isActive }) => isActive ? 'nav-link nav-link--active' : 'nav-link'}
            >
              <svg className="nav-link-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 3v18h18" />
                <path d="m19 9-5 5-4-4-3 3" />
              </svg>
              <span>Reports</span>
            </NavLink>
          </nav>
        </div>

        <div className="nav-user">
          <div className="user-profile">
            <div className="user-avatar" aria-hidden="true">
              {userInitial}
            </div>
            <span className="nav-welcome">{user?.name}</span>
          </div>

          <button
            id="logout-btn"
            className="btn-logout"
            onClick={handleLogout}
            title="Sign out of your account"
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
            <span>Sign out</span>
          </button>
        </div>
      </div>
    </header>
  );
}

export default NavHeader;
