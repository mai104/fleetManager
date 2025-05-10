import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const Sidebar = () => {
  const { user } = useAuth();
  const isAdmin = user && user.role === 'admin';

  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <h3>Navigation</h3>
      </div>
      <ul className="sidebar-menu">
        <li>
          <NavLink 
            to="/dashboard" 
            className={({isActive}) => isActive ? 'active' : ''}
          >
            Dashboard
          </NavLink>
        </li>
        <li>
          <NavLink 
            to="/vehicles" 
            className={({isActive}) => isActive ? 'active' : ''}
          >
            Vehicles
          </NavLink>
        </li>
        <li>
          <NavLink 
            to="/movements" 
            className={({isActive}) => isActive ? 'active' : ''}
          >
            Vehicle Movements
          </NavLink>
        </li>
        {(isAdmin || (user && user.permissions && user.permissions.canExport)) && (
          <li>
            <NavLink 
              to="/reports" 
              className={({isActive}) => isActive ? 'active' : ''}
            >
              Reports
            </NavLink>
          </li>
        )}
        {isAdmin && (
          <li>
            <NavLink 
              to="/users" 
              className={({isActive}) => isActive ? 'active' : ''}
            >
              User Management
            </NavLink>
          </li>
        )}
      </ul>
    </div>
  );
};

export default Sidebar;
