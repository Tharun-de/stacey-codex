import React from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';

const NotFoundPage: React.FC = () => {
  return (
    <>
      <Helmet>
        <title>Page Not Found | Lentil Life</title>
      </Helmet>
      <div className="min-h-[calc(100vh-200px)] flex flex-col items-center justify-center text-center p-4">
        <h1 className="text-6xl font-bold text-gray-800 mb-4">404</h1>
        <h2 className="text-2xl font-light text-gray-600 mb-6">Oops! Page Not Found.</h2>
        <p className="text-gray-500 mb-8 max-w-md">
          The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.
        </p>
        <Link 
          to="/"
          className="px-6 py-3 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors text-sm uppercase tracking-wider font-medium"
        >
          Go to Homepage
        </Link>
      </div>
    </>
  );
};

export default NotFoundPage; 