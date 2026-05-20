import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/auth');
  };

  if (!isAuthenticated) {
    return null;
  }

  return (
    <nav className="bg-white border-b border-slate-200 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 font-bold text-xl text-indigo-600">
            <div className="w-8 h-8 rounded-full primary-gradient flex items-center justify-center text-white text-sm font-bold">
              GS
            </div>
            GetSkills
          </Link>

          {/* Navigation Links */}
          <div className="hidden md:flex gap-8">
            <Link
              to="/"
              className="text-slate-700 hover:text-indigo-600 font-medium transition-colors"
            >
              Home
            </Link>
            <Link
              to="/search"
              className="text-slate-700 hover:text-indigo-600 font-medium transition-colors"
            >
              Search
            </Link>
            <Link
              to="/provide-service"
              className="text-slate-700 hover:text-indigo-600 font-medium transition-colors"
            >
              Teach
            </Link>
          </div>

          {/* User Menu */}
          {user && (
            <div className="flex items-center gap-4">
              <Link
                to="/profile"
                className="flex items-center gap-2 hover:bg-slate-100 px-3 py-2 rounded-lg transition-colors"
              >
                <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-white font-bold text-sm">
                  {user.name?.[0]?.toUpperCase()}
                </div>
                <span className="text-sm font-medium text-slate-900 hidden sm:block">
                  {user.name?.split(' ')[0]}
                </span>
              </Link>

              <button
                onClick={handleLogout}
                className="text-sm text-red-600 hover:text-red-700 font-medium"
              >
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
