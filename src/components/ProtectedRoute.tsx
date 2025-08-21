import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

interface ProtectedRouteProps {
  children: JSX.Element;
  requiresAuth?: boolean;
  requiresProfile?: boolean;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  requiresAuth = true,
  requiresProfile = false 
}) => {
  const { isAuthenticated, user, loading } = useAuth();
  const location = useLocation();

  // Show loading indicator while auth state is being determined
  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-teal-500"></div>
      </div>
    );
  }

  // If not authenticated and authentication is required, redirect to login
  if (requiresAuth && !isAuthenticated) {
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  // If profile completion is required but profile is incomplete, redirect to profile setup
  if (requiresProfile && isAuthenticated && user) {
    const profile = user.profile;
    const isProfileComplete = profile && 
                             profile.firstName && 
                             profile.ageGroup && 
                             profile.job;
    
    if (!isProfileComplete) {
      return <Navigate to="/profile/setup" replace />;
    }
  }

  // If all conditions are met, render the protected content
  return children;
};

export default ProtectedRoute;