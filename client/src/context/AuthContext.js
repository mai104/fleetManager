import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import jwt_decode from 'jwt-decode';

// Create the auth context
const AuthContext = createContext();

// Custom hook to use the auth context
export const useAuth = () => useContext(AuthContext);

// Auth provider component
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  
  // Check for token on initial load
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('token');
      
      if (token) {
        try {
          // Set default Authorization header for all requests
          axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
          
          // Decode the token to get user info
          const decoded = jwt_decode(token);
          
          // Check if token is expired
          if (decoded.exp * 1000 < Date.now()) {
            // Token expired, logout
            logout();
          } else {
            // Valid token, set user
            setUser(decoded);
            setIsAuthenticated(true);
          }
        } catch (error) {
          // Invalid token, logout
          logout();
        }
      }
      
      setLoading(false);
    };
    
    checkAuth();
  }, []);
  
  // Login function
  const login = async (email, password) => {
    try {
      const res = await axios.post('/api/auth/login', { email, password });
      
      // Get token from response
      const { token } = res.data;
      
      // Save token to localStorage
      localStorage.setItem('token', token);
      
      // Set default Authorization header
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      // Decode token to get user data
      const decoded = jwt_decode(token);
      setUser(decoded);
      setIsAuthenticated(true);
      
      toast.success('Login successful');
      return true;
    } catch (error) {
      const message = 
        error.response && error.response.data.message
          ? error.response.data.message
          : 'Login failed. Please check your credentials.';
          
      toast.error(message);
      return false;
    }
  };
  
  // Register function
  const register = async (userData) => {
    try {
      const res = await axios.post('/api/auth/register', userData);
      
      toast.success('Registration successful. You can now login.');
      return true;
    } catch (error) {
      const message = 
        error.response && error.response.data.message
          ? error.response.data.message
          : 'Registration failed. Please try again.';
          
      toast.error(message);
      return false;
    }
  };
  
  // Logout function
  const logout = () => {
    // Remove token from localStorage
    localStorage.removeItem('token');
    
    // Remove Authorization header
    delete axios.defaults.headers.common['Authorization'];
    
    // Reset auth state
    setUser(null);
    setIsAuthenticated(false);
    
    toast.info('You have been logged out');
  };
  
  // Update user permissions (admin only)
  const updateUserPermissions = async (userId, permissions) => {
    try {
      const res = await axios.put(`/api/users/${userId}/permissions`, { permissions });
      
      toast.success('User permissions updated successfully');
      return true;
    } catch (error) {
      const message = 
        error.response && error.response.data.message
          ? error.response.data.message
          : 'Failed to update user permissions';
          
      toast.error(message);
      return false;
    }
  };
  
  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAuthenticated,
        login,
        register,
        logout,
        updateUserPermissions
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
