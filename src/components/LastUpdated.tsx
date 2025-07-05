import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Film } from 'lucide-react';
import ThemeToggle from './ThemeToggle';

const LastUpdated: React.FC = () => {
  const lastUpdated = new Date(document.lastModified);
  const localTime = lastUpdated.toLocaleString();

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-100 via-purple-50 to-indigo-100 dark:from-gray-900 dark:via-purple-900 dark:to-indigo-900 transition-colors duration-300">
      {/* Header */}
      <nav className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-b border-pink-200/50 dark:border-gray-700/50 sticky top-0 z-50 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link to="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-pink-400 to-purple-500 rounded-lg flex items-center justify-center shadow-lg">
                <Film className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
                LunaStream
              </span>
            </Link>
            <div className="flex items-center space-x-4">
              <ThemeToggle />
              <Link
                to="/"
                className="flex items-center text-gray-600 dark:text-gray-300 hover:text-pink-600 dark:hover:text-pink-400 transition-colors"
              >
                <ArrowLeft className="w-5 h-5 mr-2" />
                Back to Home
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Content */}
      <div className="flex items-center justify-center min-h-[calc(100vh-4rem)]">
        <div className="text-center bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl border border-pink-200/50 dark:border-gray-700/50 p-8 transition-colors duration-300">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 transition-colors duration-300">Page Last Updated</h2>
          <p className="text-lg text-gray-600 dark:text-gray-300 transition-colors duration-300">This page was last updated on:</p>
          <p className="text-xl font-semibold text-gray-800 dark:text-gray-200 transition-colors duration-300">{localTime}</p>
        </div>
      </div>
    </div>
  );
};

export default LastUpdated;