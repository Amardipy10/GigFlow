// frontend/src/components/ProtectedRoute.jsx
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="fixed inset-0 flex flex-col justify-center items-center bg-white z-[9999]">
        {/* Modern Branded Spinner */}
        <div className="relative flex items-center justify-center">
          <div className="absolute h-16 w-16 border-4 border-indigo-50 rounded-full"></div>
          <div className="h-16 w-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
          <div className="absolute">
             <svg className="w-6 h-6 text-indigo-600" fill="currentColor" viewBox="0 0 24 24">
                <path d="M13 10V3L4 14h7v7l9-11h-7z" />
             </svg>
          </div>
        </div>
        
        {/* Subtle Text below the spinner */}
        <div className="mt-6 flex flex-col items-center gap-1">
          <h2 className="text-lg font-bold text-gray-900 tracking-tight">GigFlow</h2>
          <p className="text-sm text-gray-500 font-medium animate-pulse">Securing your session...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="animate-in fade-in duration-500">
      {children}
    </div>
  );
};

export default ProtectedRoute;