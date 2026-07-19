/**
 * =============================================================
 * App.jsx — The main Router for the application
 * =============================================================
 * 
 * This file acts as the "traffic cop" for our app. It decides 
 * which page to show based on the URL (e.g. /login shows the LoginPage).
 * 
 * It also uses "PrivateRoutes" to protect pages (like Dashboard)
 * so that only logged-in users can see them.
 * =============================================================
 */

import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';

// Import our shared components
import { Navbar } from './components/Navbar';
import { LoadingSpinner } from './components/LoadingSpinner';

// Import all of our Page components
import LandingPage from './pages/LandingPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { DashboardPage } from './pages/DashboardPage';
import { UploadPage } from './pages/UploadPage';
import { CourseDetailPage } from './pages/CourseDetailPage';
import { ChatPage } from './pages/ChatPage';

// ─────────────────────────────────────────────
// ROUTING HELPERS
// ─────────────────────────────────────────────

// PrivateRoute ensures only logged-in users can access a page
const PrivateRoute = ({ children }) => {
  const { user, loading } = useAuth();
  
  if (loading) return <LoadingSpinner fullScreen />;
  
  // If user is logged in, show the children (the page).
  // If not, redirect them back to the login screen.
  return user ? children : <Navigate to="/login" replace />;
};

// PublicRoute ensures logged-in users are redirected away from login/register pages
const PublicRoute = ({ children }) => {
  const { user, loading } = useAuth();
  
  if (loading) return <LoadingSpinner fullScreen />;
  
  // If user is already logged in, redirect them to dashboard.
  return user ? <Navigate to="/dashboard" replace /> : children;
};

// A simple wrapper that automatically adds the Navbar above the page content
const AppLayout = ({ children }) => (
  <>
    <Navbar />
    {children}
  </>
);

// ─────────────────────────────────────────────
// MAIN APP COMPONENT
// ─────────────────────────────────────────────
export default function App() {
  return (
    // React Router matches the URL path to the correct component to show
    <Routes>
      {/* PUBLIC ROUTES (Anyone can see these) */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
      <Route path="/register" element={<PublicRoute><RegisterPage /></PublicRoute>} />
      
      {/* PRIVATE ROUTES (Require login, wrapped in AppLayout for the Navbar) */}
      <Route path="/dashboard" element={
        <PrivateRoute><AppLayout><DashboardPage /></AppLayout></PrivateRoute>
      } />
      
      <Route path="/upload" element={
        <PrivateRoute><AppLayout><UploadPage /></AppLayout></PrivateRoute>
      } />
      
      <Route path="/courses/:id" element={
        <PrivateRoute><AppLayout><CourseDetailPage /></AppLayout></PrivateRoute>
      } />
      
      <Route path="/courses/:id/chat" element={
        <PrivateRoute><AppLayout><ChatPage /></AppLayout></PrivateRoute>
      } />
      
      {/* Fallback for unknown URLs (Sends them to the home page) */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
