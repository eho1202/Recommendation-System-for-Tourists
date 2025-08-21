import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-slate-800 text-white py-8">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-xl font-bold mb-4">Travel Recommender</h3>
            <p className="text-gray-300">
              Discover your next adventure with our personalized travel recommendations.
            </p>
          </div>
          <div>
            <h3 className="text-xl font-bold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-gray-300 hover:text-teal-300 transition">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/destinations" className="text-gray-300 hover:text-teal-300 transition">
                  Destinations
                </Link>
              </li>
              <li>
                <Link to="/about" className="text-gray-300 hover:text-teal-300 transition">
                  About
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-xl font-bold mb-4">Contact</h3>
            <ul className="space-y-2">
              <li className="text-gray-300">Email: info@travelrecommender.com</li>
              <li className="text-gray-300">Phone: +1 (555) 123-4567</li>
            </ul>
          </div>
        </div>
        <div className="mt-8 pt-8 border-t border-gray-700 text-center">
          <p className="text-gray-300">
            © {new Date().getFullYear()} Travel Recommender. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;