import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import axios from 'axios';

const Register = () => {
  const { register, isAuthenticated } = useAuth();
  const [error, setError] = useState(null);
  const [isLimitReached, setIsLimitReached] = useState(false);
  const navigate = useNavigate();
  
  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);
  
  // Check if user limit (5) is reached
  useEffect(() => {
    const checkUserLimit = async () => {
      try {
        const res = await axios.get('/api/users/check-limit');
        setIsLimitReached(res.data.isLimitReached);
      } catch (err) {
        console.error('Error checking user limit:', err);
      }
    };
    
    checkUserLimit();
  }, []);
  
  // Validation schema
  const RegisterSchema = Yup.object().shape({
    name: Yup.string()
      .required('Name is required')
      .min(3, 'Name must be at least 3 characters'),
    email: Yup.string()
      .email('Invalid email address')
      .required('Email is required'),
    password: Yup.string()
      .required('Password is required')
      .min(6, 'Password must be at least 6 characters'),
    confirmPassword: Yup.string()
      .oneOf([Yup.ref('password'), null], 'Passwords must match')
      .required('Confirm password is required')
  });
  
  // Handle form submission
  const handleSubmit = async (values, { setSubmitting }) => {
    setError(null);
    
    try {
      const success = await register({
        name: values.name,
        email: values.email,
        password: values.password
      });
      
      if (success) {
        navigate('/login');
      }
    } catch (err) {
      setError('Failed to register. Please try again.');
    }
    
    setSubmitting(false);
  };
  
  if (isLimitReached) {
    return (
      <div className="auth-container">
        <div className="auth-form">
          <h2 className="text-center mb-3">Registration Limit Reached</h2>
          <div className="alert alert-warning">
            Sorry, the maximum number of users (5) has been reached. Please contact the administrator.
          </div>
          <div className="mt-3 text-center">
            <p>
              Already have an account?{' '}
              <Link to="/login">Login</Link>
            </p>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="auth-container">
      <div className="auth-form">
        <h2 className="text-center mb-3">Register for Fleet Manager</h2>
        
        {error && (
          <div className="alert alert-danger">{error}</div>
        )}
        
        <Formik
          initialValues={{ 
            name: '', 
            email: '', 
            password: '', 
            confirmPassword: '' 
          }}
          validationSchema={RegisterSchema}
          onSubmit={handleSubmit}
        >
          {({ isSubmitting }) => (
            <Form>
              <div className="form-group">
                <label htmlFor="name" className="form-label">Name</label>
                <Field 
                  type="text" 
                  name="name" 
                  className="form-control" 
                  placeholder="Enter your name" 
                />
                <ErrorMessage name="name" component="div" className="text-danger mt-1" />
              </div>
              
              <div className="form-group">
                <label htmlFor="email" className="form-label">Email Address</label>
                <Field 
                  type="email" 
                  name="email" 
                  className="form-control" 
                  placeholder="Enter your email" 
                />
                <ErrorMessage name="email" component="div" className="text-danger mt-1" />
              </div>
              
              <div className="form-group">
                <label htmlFor="password" className="form-label">Password</label>
                <Field 
                  type="password" 
                  name="password" 
                  className="form-control" 
                  placeholder="Enter your password" 
                />
                <ErrorMessage name="password" component="div" className="text-danger mt-1" />
              </div>
              
              <div className="form-group">
                <label htmlFor="confirmPassword" className="form-label">Confirm Password</label>
                <Field 
                  type="password" 
                  name="confirmPassword" 
                  className="form-control" 
                  placeholder="Confirm your password" 
                />
                <ErrorMessage name="confirmPassword" component="div" className="text-danger mt-1" />
              </div>
              
              <button 
                type="submit" 
                className="btn btn-primary w-100 mt-3" 
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Registering...' : 'Register'}
              </button>
            </Form>
          )}
        </Formik>
        
        <div className="mt-3 text-center">
          <p>
            Already have an account?{' '}
            <Link to="/login">Login</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
