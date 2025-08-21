import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Compass, User } from 'lucide-react';
import AuthModal from './AuthModal';
import travelIcon from '../img/travel-icon.png';

const Navbar = () => {
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    if (token && userData) {
      setIsLoggedIn(true);
      setUser(JSON.parse(userData));
    }
  }, []);

  const handleSignOut = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('userId');
    setIsLoggedIn(false);
    setUser(null);
    window.location.reload();
  };

  return (
    <>
      <nav className="bg-slate-800 text-white">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <Link to="/" className="flex items-center space-x-2">
            <img src={travelIcon} alt="Travel Icon" className="h-6 w-6" />
            <span className="text-xl font-bold">Travel Recommender</span>
          </Link>

          <div className="flex items-center space-x-6">
            <Link to="/destinations" className="hover:text-teal-300 transition">
              Destinations
            </Link>
            <Link to="/plan-trip" className="hover:text-teal-300 transition">
              Plan Your Trip
            </Link>
            <Link to="/about" className="hover:text-teal-300 transition">
              About
            </Link>

            {isLoggedIn ? (
              <div className="flex items-center space-x-4">
                <Link to="/profile" className="flex items-center space-x-2 hover:text-teal-300">
                  <User className="h-5 w-5" />
                  <span>{user?.profile?.firstName || user?.firstName || 'User'}</span>
                </Link>
                <button
                  onClick={handleSignOut}
                  className="bg-red-500 hover:bg-red-600 px-4 py-2 rounded-lg transition"
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <button
                onClick={() => setIsAuthModalOpen(true)}
                className="bg-teal-500 hover:bg-teal-600 px-4 py-2 rounded-lg transition"
              >
                Sign In
              </button>
            )}
          </div>
        </div>
      </nav>

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
      />
    </>
  );
};

export default Navbar;
