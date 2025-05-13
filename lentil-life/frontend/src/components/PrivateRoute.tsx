import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';

// Placeholder for authentication logic
// In a real app, you would replace this with your actual authentication check
// e.g., checking a context, a token in localStorage, etc.
const isAuthenticated = () => {
  // For now, let's assume the user is authenticated to allow access to admin pages during development.
  // Later, this should check actual login status.
  // Example: Check for a token or user object from AuthContext
  // const { user } = useAuth(); 
  // return !!user;
  
  // For demonstration, let's simulate a simple check. 
  // If you want to test the redirect to login, change this to false.
  const isLoggedIn = true; // Or check localStorage.getItem('isLoggedIn') === 'true';
  return isLoggedIn; 
};

interface PrivateRouteProps {
  children: JSX.Element;
}

const PrivateRoute: React.FC<PrivateRouteProps> = ({ children }) => {
  const location = useLocation();

  if (!isAuthenticated()) {
    // If not authenticated, redirect them to the /login page
    // Pass the current location in state so we can redirect back after login
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children; // If authenticated, render the children (the protected page)
};

export default PrivateRoute; 