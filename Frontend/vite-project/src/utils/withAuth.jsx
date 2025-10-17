import React, { useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext'; // Adjust this path if your context is elsewhere

/**
 * A Higher-Order Component (HOC) that protects a component from unauthenticated access.
 *
 * @param {React.Component} WrappedComponent The component to protect.
 * @returns A new component that includes the authentication check.
 */
const withAuth = (WrappedComponent) => {
  // The new component that will be returned
  const WithAuthComponent = (props) => {
    const navigate = useNavigate();
    
    // Get the user and loading state from your AuthContext
    // This assumes your context provides an object with 'user' and 'loading'
    const { user, loading } = useContext(AuthContext);

    useEffect(() => {
      // Don't do anything while the authentication status is still loading.
      if (loading) {
        return;
      }

      // If loading is finished and there is no user, redirect to the login page.
      if (!user) {
        navigate('/auth');
      }
    }, [user, loading, navigate]); // Re-run this effect if any of these values change

    // While loading, you can show a spinner or a simple message.
    if (loading) {
      return <div>Loading...</div>; // Or a <CircularProgress /> component
    }

    // If a user exists, render the component that was passed in.
    // Otherwise, render null while the redirect is in progress.
    return user ? <WrappedComponent {...props} /> : null;
  };

  return WithAuthComponent;
};

export default withAuth;