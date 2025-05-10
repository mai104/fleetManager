import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import './App.css';

// Layout components
import Navbar from './components/layout/Navbar';
import Sidebar from './components/layout/Sidebar';
import Footer from './components/layout/Footer';

// Auth pages
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';

// Dashboard pages
import Dashboard from './pages/dashboard/Dashboard';

// Vehicle pages
import VehicleList from './pages/vehicles/VehicleList';
import VehicleDetail from './pages/vehicles/VehicleDetail';
import VehicleForm from './pages/vehicles/VehicleForm';

// Movement pages
import MovementList from './pages/movements/MovementList';
import MovementForm from './pages/movements/MovementForm';

// Report pages
import Reports from './pages/reports/Reports';

// User management pages (Admin only)
import UserManagement from './pages/users/UserManagement';

// Protected route component
const ProtectedRoute = ({ children, requiredRole }) => {
  const { user, isAuthenticated } = useAuth();
  
  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }
  
  // Check if user has required role (if specified)
  if (requiredRole && user.role !== requiredRole) {
    return <Navigate to="/dashboard" />;
  }
  
  return children;
};

function App() {
  const { isAuthenticated } = useAuth();

  return (
    <div className="App">
      {isAuthenticated && <Navbar />}
      <div className="main-container">
        {isAuthenticated && <Sidebar />}
        <main className="content">
          <Routes>
            {/* Public routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            
            {/* Protected routes */}
            <Route path="/" element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } />
            
            <Route path="/dashboard" element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } />
            
            <Route path="/vehicles" element={
              <ProtectedRoute>
                <VehicleList />
              </ProtectedRoute>
            } />
            
            <Route path="/vehicles/:id" element={
              <ProtectedRoute>
                <VehicleDetail />
              </ProtectedRoute>
            } />
            
            <Route path="/vehicles/add" element={
              <ProtectedRoute>
                <VehicleForm />
              </ProtectedRoute>
            } />
            
            <Route path="/vehicles/edit/:id" element={
              <ProtectedRoute>
                <VehicleForm />
              </ProtectedRoute>
            } />
            
            <Route path="/movements" element={
              <ProtectedRoute>
                <MovementList />
              </ProtectedRoute>
            } />
            
            <Route path="/movements/add" element={
              <ProtectedRoute>
                <MovementForm />
              </ProtectedRoute>
            } />
            
            <Route path="/reports" element={
              <ProtectedRoute>
                <Reports />
              </ProtectedRoute>
            } />
            
            {/* Admin-only routes */}
            <Route path="/users" element={
              <ProtectedRoute requiredRole="admin">
                <UserManagement />
              </ProtectedRoute>
            } />
            
            {/* Redirect unknown routes to dashboard */}
            <Route path="*" element={
              isAuthenticated ? <Navigate to="/dashboard" /> : <Navigate to="/login" />
            } />
          </Routes>
        </main>
      </div>
      {isAuthenticated && <Footer />}
    </div>
  );
}

export default App;
