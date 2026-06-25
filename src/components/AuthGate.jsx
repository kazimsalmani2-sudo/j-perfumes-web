import React from 'react';
import { useAuth } from "../context/AuthContext";
import { useLocation, Navigate } from "react-router-dom";

const AuthGate = ({ children }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  // Allow these pages without login:
  const publicRoutes = ["/", "/login", "/register", "/forgot-password"];

  const isPublicRoute = publicRoutes.includes(location.pathname);
  const isGuest = sessionStorage.getItem("guestMode") === "true" || !user;

  // Show loading spinner while checking auth
  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        background: '#FFFFFF'
      }}>
        <div className="spinner" style={{
          width: '40px',
          height: '40px',
          border: '3px solid #f3f3f3',
          borderTop: '3px solid #B8960C',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite'
        }} />
        <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  // If not logged in, not on guest mode, and not on public route → redirect to landing
  if (!user && !isGuest && !isPublicRoute) {
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  // If guest tries to access guest-blocked routes (checkout or confirmation) → redirect to login
  const guestBlockedRoutes = ["/checkout", "/order-confirmation"];
  const isGuestBlocked = guestBlockedRoutes.includes(location.pathname);
  if (!user && isGuest && isGuestBlocked) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
};

export default AuthGate;
