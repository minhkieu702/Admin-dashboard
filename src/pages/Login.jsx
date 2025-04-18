import React, { useEffect, useState } from 'react';
import { Container, Row, Col, Card, Form, Button, Alert } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { getMessaging, getToken } from "firebase/messaging";
import { initializeApp } from "firebase/app";
import { FaEnvelope, FaLock, FaEye, FaEyeSlash } from 'react-icons/fa';
import axiosInstance from '../services/axiosConfig';
import signalRService from '../services/signalR';

const Login = () => {
  const navigate = useNavigate();
  const firebaseConfig = {
    apiKey: "AIzaSyAtAbV6sMft_doFAjrLp774VZWhEavz6MQ",
    authDomain: "fir-realtime-database-49344.firebaseapp.com",
    projectId: "fir-realtime-database-49344",
    storageBucket: "fir-realtime-database-49344.appspot.com",
    messagingSenderId: "423913316379",
    appId: "1:423913316379:web:201871eb6ae9dd2a0198be"
  };
  const app = initializeApp(firebaseConfig);
  const messaging = getMessaging(app);
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
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  useEffect(() => {
    // Register service worker
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker
        .register("/firebase-messaging-sw.js")
        .then((registration) => {
          console.log("Service Worker registered with scope:", registration.scope);
        })
        .catch((error) => {
          console.error("Service Worker registration failed:", error);
        });
    }
  }, []);

  const setupNotificationsAndSignalR = async (accessToken) => {
    try {
      // 1. Request notification permission
      const status = await Notification.requestPermission();
      if (status !== "granted") {
        console.error("Notification permission denied");
        return;
      }

      // 2. Get device token
      const deviceToken = await getToken(messaging, {
        vapidKey: "BIUfDNHZV3QQtZE9wYFA7n8vJLvQzVQJm9JNTRbLqBT8t7saxVmeEB2rA7oMimn04xeB6LvHKvYLoQsv5nqar4o"
      });

      if (!deviceToken) {
        console.error("Failed to generate device token");
        return;
      }

      console.log("Device Token:", deviceToken);
      localStorage.setItem("deviceToken", deviceToken);

      // 3. Register device token with backend
      const formData = new FormData();
      formData.append("PlatformType", 1);
      formData.append("Token", deviceToken);

      await axiosInstance.post(`/api/DeviceToken`, formData);

      // 4. Start SignalR connection
      await signalRService.startConnection(accessToken);

    } catch (error) {
      console.error("Error in setup:", error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
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
    Object.keys(formData).forEach((key) => {
      if (formData[key] !== null) {
        formDataToSend.append(key, formData[key])
      }
    });

    try {
      // 1. Login
      const response = await axiosInstance.post('/api/Authentication/staff/login', formDataToSend);
      
      const token = response.accessToken;
      console.log('Login successful, token:', token);

      // 2. Store token and update axios headers
      localStorage.setItem('token', token);
      axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${token}`;

      // 3. Setup notifications and SignalR
      await setupNotificationsAndSignalR(token);

      // 4. Navigate to dashboard
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