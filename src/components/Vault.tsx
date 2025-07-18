import React from 'react';
import { Link } from 'react-router-dom';
import { Film, PlayCircle, Star, Layers } from 'lucide-react';

const Vault: React.FC = () => {
  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-black via-gray-900 to-black text-white flex flex-col">
      {/* Hero Section */}
      <header className="relative flex flex-col items-center justify-center flex-1 text-center px-6 py-16">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-500/10 via-purple-700/10 to-black"></div>

          <div className="relative z-10 max-w-3xl">
            <div className="flex justify-center mb-6">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-700 rounded-2xl flex items-center justify-center shadow-xl">
                <Film className="w-8 h-8 text-white" />
              </div>
            </div>


            <h1 className="text-4xl sm:text-5xl font-bold bg-gradient-to-r from-blue-400 to-purple-600 bg-clip-text text-transparent mb-4">
              LunaVault
            </h1>
            <p className="text-gray-400 text-lg sm:text-xl mb-8">
              Your personal archive for movies & TV. Curate. Watch. Remember.
            </p>

          <Link
            to="/watchlist"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-blue-500 to-purple-700 hover:from-blue-600 hover:to-purple-800 transition-all shadow-md hover:shadow-xl text-white text-lg font-medium"
          >
            <PlayCircle className="w-5 h-5" />
            View Your Watchlist
          </Link>
        </div>
      </header>

      {/* Features Section */}
      <section className="relative px-8 py-16 bg-black/30 backdrop-blur-md border-t border-white/10">
        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-gradient-to-br from-white/5 to-white/0 rounded-2xl p-6 border border-white/10 shadow-lg hover:shadow-2xl transition">
            <Star className="w-8 h-8 text-blue-400 mb-4" />
            <h3 className="text-lg font-semibold mb-2">Curate Favorites</h3>
            <p className="text-gray-400 text-sm">
              Build a vault of movies and shows you've watched or loved. LunaVault remembers for you.
            </p>
          </div>

          <div className="bg-gradient-to-br from-white/5 to-white/0 rounded-2xl p-6 border border-white/10 shadow-lg hover:shadow-2xl transition">
            <Layers className="w-8 h-8 text-purple-400 mb-4" />
            <h3 className="text-lg font-semibold mb-2">Seamless Browsing</h3>
            <p className="text-gray-400 text-sm">
              Effortlessly search, sort, and explore your personal library of past watches.
            </p>
          </div>

          <div className="bg-gradient-to-br from-white/5 to-white/0 rounded-2xl p-6 border border-white/10 shadow-lg hover:shadow-2xl transition">
            <Film className="w-8 h-8 text-pink-400 mb-4" />
            <h3 className="text-lg font-semibold mb-2">Minimal & Private</h3>
            <p className="text-gray-400 text-sm">
              No accounts, no tracking. Your vault lives in your browser, fully private.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="text-center text-gray-500 text-sm py-6 border-t border-white/10">
        © {new Date().getFullYear()} LunaVault · Built for your personal media journey.
      </footer>
    </div>
  );
};

export default Vault;
