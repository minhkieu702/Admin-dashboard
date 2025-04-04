import React, { useState } from 'react';
import { Container, Row, Col, Card, Form, Button, Alert } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { FaEnvelope, FaLock, FaEye, FaEyeSlash } from 'react-icons/fa';
import axiosInstance from '../services/axiosConfig';

const Login = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: '',
    password: '',
  });
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [loginError, setLoginError] = useState('');

  const validateForm = () => {
    const newErrors = {};
    if (!formData.username) {
      newErrors.username = 'Username is required';
    } 
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);
    setLoginError('');
console.log(formData);

    const formDataToSend = new FormData();
    Object.keys(formData).forEach((key) =>{
      if (formData[key] !== null) {
        formDataToSend.append(key, formData[key])
      }
    })

    try {
      const response = await axiosInstance.post('/api/Authentication/staff/login', formDataToSend, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
    });
      console.log(response);
      const token  = response.accessToken;
      
      // Store the token
      localStorage.setItem('token', token);
      
      // Set the token in axios headers
      axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      // Redirect to dashboard
      navigate('/dashboard');
    } catch (error) {
      console.error('Login error:', error);
      setLoginError(
        error.response?.data?.message || 
        'An error occurred during login. Please try again.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-container">
      <Card className="shadow-lg border-0">
        <Card.Body className="p-5">
          <div className="text-center mb-4">
            <h2 className="fw-bold mb-0">Welcome Back</h2>
            <p className="text-muted">Please sign in to continue</p>
          </div>

          {loginError && (
            <Alert variant="danger" className="mb-4">
              {loginError}
            </Alert>
          )}

          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-4">
              <div className="position-relative">
                <div className="position-absolute" style={{ top: '50%', left: '1rem', transform: 'translateY(-50%)' }}>
                  <FaEnvelope className="text-muted" />
                </div>
                <Form.Control
                  type="text"
                  name="username"
                  placeholder="Enter your username"
                  value={formData.username}
                  onChange={handleInputChange}
                  className={`ps-5 ${errors.username ? 'is-invalid' : ''}`}
                  style={{ height: '3rem' }}
                />
              </div>
              {errors.username && (
                <Form.Text className="text-danger">
                  {errors.username}
                </Form.Text>
              )}
            </Form.Group>

            <Form.Group className="mb-4">
              <div className="position-relative">
                <div className="position-absolute" style={{ top: '50%', left: '1rem', transform: 'translateY(-50%)' }}>
                  <FaLock className="text-muted" />
                </div>
                <Form.Control
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className={`ps-5 ${errors.password ? 'is-invalid' : ''}`}
                  style={{ height: '3rem' }}
                />
                <div 
                  className="position-absolute" 
                  style={{ top: '50%', right: '1rem', transform: 'translateY(-50%)', cursor: 'pointer' }}
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <FaEyeSlash className="text-muted" />
                  ) : (
                    <FaEye className="text-muted" />
                  )}
                </div>
              </div>
              {errors.password && (
                <Form.Text className="text-danger">
                  {errors.password}
                </Form.Text>
              )}
            </Form.Group>

            <div className="d-flex justify-content-between align-items-center mb-4">
              <Form.Check
                type="checkbox"
                label="Remember me"
                className="text-muted"
              />
              <a href="#forgot-password" className="text-primary text-decoration-none">
                Forgot Password?
              </a>
            </div>

            <Button
              variant="primary"
              type="submit"
              className="w-100"
              disabled={isLoading}
            >
              {isLoading ? 'Signing in...' : 'Sign In'}
            </Button>
          </Form>
        </Card.Body>
      </Card>
    </div>
  );
};

export default Login; 