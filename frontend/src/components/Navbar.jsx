// frontend/src/components/Navbar.jsx
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Notifications from './Notifications';

const Navbar = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  // Helper to highlight active links
  const isActive = (path) => location.pathname === path;

  return (
    <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <div className="bg-indigo-600 p-1.5 rounded-lg group-hover:rotate-12 transition-transform">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <span className="text-2xl font-black text-gray-900 tracking-tighter">
              Gig<span className="text-indigo-600">Flow</span>
            </span>
          </Link>

          {/* Right Side Navigation */}
          <div className="flex items-center gap-2 md:gap-4">
            {isAuthenticated ? (
              <>
                <div className="hidden md:flex items-center mr-2 border-r border-gray-100 pr-4">
                  <div className="w-8 h-8 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600 font-bold text-xs border border-indigo-100">
                    {user?.name?.charAt(0)}
                  </div>
                  <span className="ml-2 text-sm font-semibold text-gray-700 max-w-[100px] truncate">
                    {user?.name}
                  </span>
                </div>

                <div className="flex items-center gap-1 md:gap-3">
                  <Notifications />
                  
                  <Link
                    to="/dashboard"
                    className={`px-3 py-2 rounded-xl text-sm font-bold transition-all ${
                      isActive('/dashboard') 
                        ? 'text-indigo-600 bg-indigo-50' 
                        : 'text-gray-500 hover:text-indigo-600 hover:bg-gray-50'
                    }`}
                  >
                    Dashboard
                  </Link>

                  <Link
                    to="/create-gig"
                    className="hidden sm:block bg-indigo-600 text-white px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-indigo-700 shadow-md shadow-indigo-100 transition-all active:scale-95"
                  >
                    Post Gig
                  </Link>

                  <button
                    onClick={handleLogout}
                    className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                    title="Logout"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                  </button>
                </div>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="px-5 py-2.5 rounded-xl text-sm font-bold text-gray-600 hover:text-indigo-600 transition-all"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="bg-indigo-600 text-white px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-indigo-700 shadow-md shadow-indigo-100 transition-all active:scale-95"
                >
                  Join Now
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;