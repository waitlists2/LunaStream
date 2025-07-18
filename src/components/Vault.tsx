import React from 'react';
import { Link } from 'react-router-dom';
import { Film, PlayCircle, Star, Layers, Heart, Archive, TrendingUp } from 'lucide-react';
import GlobalNavbar from './GlobalNavbar';

const Vault: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-100 via-purple-50 to-indigo-100 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 transition-colors duration-300">
      <GlobalNavbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <div className="flex justify-center mb-6">
            <div className="w-20 h-20 bg-gradient-to-r from-pink-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-xl">
              <Archive className="w-10 h-10 text-white" />
            </div>
          </div>

          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 dark:text-gray-100 mb-6">
            <span className="bg-gradient-to-r from-pink-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
              LunaVault
            </span>
          </h1>
          
          <p className="text-xl text-gray-600 dark:text-gray-200 mb-8 max-w-3xl mx-auto leading-relaxed">
            Your personal archive for movies & TV shows. Curate, watch, and remember your favorite content.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/watchlist"
              className="inline-flex items-center gap-3 px-8 py-4 rounded-xl bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl text-white text-lg font-semibold"
            >
              <Heart className="w-5 h-5" />
              View Your Watchlist
            </Link>
            
            <Link
              to="/"
              className="inline-flex items-center gap-3 px-8 py-4 rounded-xl bg-white/95 dark:bg-gray-800/95 backdrop-blur-md border border-pink-200/50 dark:border-gray-600/30 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-all shadow-lg hover:shadow-xl text-gray-900 dark:text-gray-100 text-lg font-semibold"
            >
              <TrendingUp className="w-5 h-5" />
              Browse Content
            </Link>
          </div>
        </div>

        {/* Features Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          <div className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-md rounded-2xl p-8 border border-pink-200/50 dark:border-gray-600/30 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
            <div className="w-12 h-12 bg-gradient-to-r from-pink-500 to-pink-600 rounded-xl flex items-center justify-center mb-6 shadow-lg">
              <Heart className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4">Curate Favorites</h3>
            <p className="text-gray-600 dark:text-gray-200 leading-relaxed">
              Build a personal vault of movies and shows you've watched or want to watch. LunaVault remembers everything for you.
            </p>
          </div>

          <div className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-md rounded-2xl p-8 border border-purple-200/50 dark:border-gray-600/30 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
            <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl flex items-center justify-center mb-6 shadow-lg">
              <Layers className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4">Seamless Browsing</h3>
            <p className="text-gray-600 dark:text-gray-200 leading-relaxed">
              Effortlessly search, sort, and explore your personal library with our intuitive interface.
            </p>
          </div>

          <div className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-md rounded-2xl p-8 border border-indigo-200/50 dark:border-gray-600/30 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
            <div className="w-12 h-12 bg-gradient-to-r from-indigo-500 to-indigo-600 rounded-xl flex items-center justify-center mb-6 shadow-lg">
              <Film className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4">Private & Secure</h3>
            <p className="text-gray-600 dark:text-gray-200 leading-relaxed">
              No accounts, no tracking. Your vault lives securely in your browser, completely private to you.
            </p>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-md rounded-2xl p-8 border border-pink-200/50 dark:border-gray-600/30 shadow-lg text-center">
          <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">Your Vault at a Glance</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div>
              <div className="text-3xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent mb-2">
                {JSON.parse(localStorage.getItem('lunastream-watchlist-movies') || '[]').length}
              </div>
              <div className="text-gray-600 dark:text-gray-200">Movies Watched</div>
            </div>
            <div>
              <div className="text-3xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent mb-2">
                {Object.keys(JSON.parse(localStorage.getItem('lunastream-watchlist-tv') || '{}')).length}
              </div>
              <div className="text-gray-600 dark:text-gray-200">TV Shows Followed</div>
            </div>
            <div>
              <div className="text-3xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent mb-2">
                {JSON.parse(localStorage.getItem('favoriteMovies') || '[]').length + JSON.parse(localStorage.getItem('favoriteShows') || '[]').length}
              </div>
              <div className="text-gray-600 dark:text-gray-200">Favorites</div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-white/60 dark:bg-gray-900/80 backdrop-blur-sm border-t border-pink-200/50 dark:border-gray-600/30 py-8 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-gray-600 dark:text-gray-200">
            © {new Date().getFullYear()} LunaVault · Built for your personal media journey
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Vault;