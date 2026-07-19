/**
 * =============================================================
 * api.js — The connection to our backend
 * =============================================================
 * 
 * WHAT IS THIS FILE FOR?
 * This file sets up "Axios", which is a popular library used to 
 * make HTTP requests (like GET, POST) to our backend server.
 * 
 * WHY IS IT USEFUL?
 * Instead of typing "http://localhost:5000/api" every time we
 * want to talk to the backend, we set it up once here. We also
 * configure it to automatically attach our login token to every
 * request so the backend knows who we are.
 * =============================================================
 */

import axios from 'axios';

// Create a configured instance of Axios
const api = axios.create({
  // This means all requests will go to /api (e.g., /api/auth/login)
  // Because of our Vite setup, /api is forwarded to http://localhost:5000
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000, // If a request takes more than 30s, it will fail
});

// INTERCEPTORS (Automatic Request/Response Handlers)

// 1. REQUEST INTERCEPTOR: Runs BEFORE every request is sent out
api.interceptors.request.use((config) => {
  // Grab the user's login token from local storage
  const token = localStorage.getItem('token');
  
  // If we have a token, attach it to the "Authorization" header
  // Example: Authorization: Bearer eyJhbGciOiJIUzI1Ni...
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  
  return config;
});

// 2. RESPONSE INTERCEPTOR: Runs AFTER every response comes back
api.interceptors.response.use(
  (response) => {
    // If the request was successful, just return the response
    return response;
  },
  (error) => {
    // If the backend says "401 Unauthorized" (meaning the token expired or is invalid)
    if (error.response?.status === 401) {
      // Remove the invalid token and redirect the user to the login page
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error); // Pass the error along so the component can handle it
  }
);

export default api;
