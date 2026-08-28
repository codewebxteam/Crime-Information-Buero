import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

/**
 * AnchorProtectedRoute - Only allows anchor access
 * Checks Firebase Auth and verifies anchor role in anchors collection
 * Also checks localStorage as fallback for anchor authentication
 */
export const AnchorProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  // Check localStorage as primary check for anchor auth
  const anchorAuth = localStorage.getItem('anchorAuth');
  const isAnchorFromStorage = anchorAuth ? JSON.parse(anchorAuth)?.role === 'anchor' : false;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f8f9fa]">
        <div className="w-10 h-10 border-4 border-red-700 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  // Allow access if user has isAnchor flag OR if localStorage has anchorAuth
  const hasAccess = user?.isAnchor || isAnchorFromStorage;
  
  console.log("AnchorProtectedRoute check:", { user, isAnchorFromStorage, hasAccess });

  if (!hasAccess) {
    // Redirect to home page since anchor login page doesn't exist anymore
    return <Navigate to="/" replace />;
  }

  return children;
};
