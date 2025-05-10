import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';

const Login = () => {
  const { login, isAuthenticated } = useAuth();
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  
  // Redirect if already authenticated
  React.useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);
  
  // Validation schema
  const LoginSchema = Yup.object().shape({
    email: Yup.string()
      .email('Invalid email address')
      .required('Email is required'),
    password: Yup.string()
      .required('Password is required')
      .min(6, 'Password must be at least 6 characters')
  });
  
  // Handle form submission
  const handleSubmit = async (values, { setSubmitting }) => {
    setError(null);
    
    try {
      const success = await login(values.email, values.password);
      
      if (success) {
        navigate('/dashboard');
      }
    } catch (err) {
      setError('Failed to login. Please check your credentials.');
    }
    
    setSubmitting(false);
  };
  
  return (
    <div className="auth-container">
      <div className="auth-form">
        <h2 className="text-center mb-3">Login to Fleet Manager</h2>
        
        {error && (
          <div className="alert alert-danger">{error}</div>
        )}
        
        <Formik
          initialValues={{ email: '', password: '' }}
          validationSchema={LoginSchema}
          onSubmit={handleSubmit}
        >
          {({ isSubmitting }) => (
            <Form>
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
              
              <button 
                type="submit" 
                className="btn btn-primary w-100 mt-3" 
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Logging in...' : 'Login'}
              </button>
            </Form>
          )}
        </Formik>
        
        <div className="mt-3 text-center">
          <p>
            Don't have an account?{' '}
            <Link to="/register">Register</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
