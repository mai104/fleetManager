import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const Navbar = () => {
  const { user, logout } = useAuth();

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/dashboard" className="navbar-logo">
          Fleet Manager
        </Link>
        
        <div className="navbar-user">
          <span className="navbar-username">{user ? user.name : ''}</span>
          <div className="navbar-role">{user && user.role}</div>
          <button onClick={logout} className="btn btn-sm btn-logout">
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
