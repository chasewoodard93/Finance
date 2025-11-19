import React from 'react';
import { useNavigate } from 'react-router-dom';

/**
 * Logout Component
 * 
 * Provides logout functionality with session clearing and navigation.
 * Clears authentication tokens and redirects to login page.
 */
const Logout: React.FC = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    // Clear authentication tokens from localStorage
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
    
    // Clear any session data
    sessionStorage.clear();
    
    // Redirect to login page
    navigate('/login');
  };

  React.useEffect(() => {
    handleLogout();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-md text-center">
        <div className="mb-4">
          <svg
            className="mx-auto h-12 w-12 text-blue-500 animate-spin"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
        </div>
        <h2 className="text-xl font-semibold text-gray-800 mb-2">Logging out...</h2>
        <p className="text-gray-600">Please wait while we securely log you out.</p>
      </div>
    </div>
  );
};

export default Logout;
