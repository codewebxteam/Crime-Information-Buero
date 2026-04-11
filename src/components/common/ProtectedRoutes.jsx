import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

/**
 * AdminProtectedRoute - Only allows admin access (super_admin, national_admin, state_admin, district_admin)
 * Checks Firebase Auth and verifies admin role in admins collection
 */
export const AdminProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f8f9fa]">
        <div className="w-10 h-10 border-4 border-red-700 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  // Not authenticated
  if (!user) {
    return <Navigate to="/admin/login" state={{ from: location }} replace />;
  }

  // Not an admin - redirect to member login
  if (!user.isAdmin) {
    return <Navigate to="/member/login" replace />;
  }

  // Allow all admin roles (super_admin, national_admin, state_admin, district_admin)
  const allowedAdminRoles = ['super_admin', 'national_admin', 'state_admin', 'district_admin'];
  if (!allowedAdminRoles.includes(user.role)) {
    // If role is member, redirect to member dashboard
    if (user.role === 'member') {
      return <Navigate to="/member/dashboard" replace />;
    }
    // Otherwise redirect to home
    return <Navigate to="/" replace />;
  }

  return children;
};

/**
 * MemberProtectedRoute - Only allows member access
 * Checks Firebase Auth and verifies member role in users collection
 */
export const MemberProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f8f9fa]">
        <div className="w-10 h-10 border-4 border-red-700 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  // Not authenticated
  if (!user) {
    return <Navigate to="/member/login" state={{ from: location }} replace />;
  }

  // Is admin (any admin role), redirect to admin dashboard
  const isAdmin = user.isAdmin && 
    ['super_admin', 'national_admin', 'state_admin', 'district_admin'].includes(user.role);
  
  if (isAdmin) {
    return <Navigate to="/dashboard" replace />;
  }

  // Not a member (role is not member)
  if (user.role !== 'member') {
    return <Navigate to="/admin/login" replace />;
  }

  return children;
};

/**
 * PublicRoute - Redirects if already authenticated
 */
export const PublicRoute = ({ children }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f8f9fa]">
        <div className="w-10 h-10 border-4 border-red-700 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  // Check if user is admin (any admin role)
  const isAdmin = user?.isAdmin && 
    ['super_admin', 'national_admin', 'state_admin', 'district_admin'].includes(user?.role);

  // Already authenticated as admin
  if (isAdmin) {
    return <Navigate to="/dashboard" replace />;
  }

  // Already authenticated as member
  if (user?.role === 'member') {
    return <Navigate to="/member/dashboard" replace />;
  }

  return children;
};
