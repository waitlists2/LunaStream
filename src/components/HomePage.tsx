import React, { useState, useEffect } from 'react';
import { Search, Film, Tv, TrendingUp, MessageCircle, Twitter, Heart } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { tmdb } from '../services/tmdb';
import { Movie, TVShow } from '../types';

const HomePage: React.FC = () => {
  const [query, setQuery] = useState('');
  const [trendingMovies, setTrendingMovies] = useState<Movie[]>([]);
  const [trendingTV, setTrendingTV] = useState<TVShow[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchTrending = async () => {
      try {
        const [moviesData, tvData] = await Promise.all([
          tmdb.getTrendingMovies(),
          tmdb.getTrendingTV()
        ]);
        
        setTrendingMovies(moviesData.results?.slice(0, 12) || []);
        setTrendingTV(tvData.results?.slice(0, 12) || []);
      } catch (error) {
        console.error('Failed to fetch trending content:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTrending();
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      navigate(`/search?q=${encodeURIComponent(query.trim())}`);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-100 via-purple-50 to-indigo-100">
      {/* Header */}
      <nav className="bg-white/80 backdrop-blur-sm border-b border-pink-200/50 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-pink-400 to-purple-500 rounded-lg flex items-center justify-center shadow-lg">
                <Film className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
                LunaStream
              </span>
            </div>
            <Link
              to="/donate"
              className="flex items-center space-x-2 bg-gradient-to-r from-pink-500 to-purple-600 text-white px-4 py-2 rounded-lg font-semibold hover:from-pink-600 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            >
              <Heart className="w-4 h-4" />
              <span>Donate</span>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-12">
          <div className="text-center">
            <h1 className="text-4xl sm:text-6xl font-bold text-gray-900 mb-6">
              <span className="bg-gradient-to-r from-pink-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
                Watch Movies & TV Shows
              </span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Discover and stream your favorite content with our beautiful, easy-to-use platform
            </p>

            {/* Search Bar */}
            <div className="max-w-2xl mx-auto">
              <form onSubmit={handleSearch} className="relative">
                <div className="relative bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-pink-200/50 overflow-hidden">
                  <div className="absolute inset-y-0 left-0 pl-6 flex items-center pointer-events-none">
                    <Search className="h-6 w-6 text-pink-400" />
                  </div>
                  <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search for movies or TV shows..."
                    className="block w-full pl-16 pr-6 py-6 text-lg bg-transparent border-0 placeholder-gray-500 focus:ring-0 focus:outline-none"
                  />
                  <button
                    type="submit"
                    className="absolute inset-y-0 right-0 flex items-center pr-6"
                  >
                    <div className="bg-gradient-to-r from-pink-500 to-purple-600 text-white px-8 py-3 rounded-xl font-semibold hover:from-pink-600 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5">
                      Search
                    </div>
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>

      {/* Trending Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        {loading ? (
          <div className="text-center py-16">
            <div className="w-16 h-16 bg-gradient-to-r from-pink-500 to-purple-600 rounded-full animate-spin flex items-center justify-center mb-4 shadow-lg mx-auto">
              <TrendingUp className="w-8 h-8 text-white" />
            </div>
            <p className="text-gray-600 text-lg">Loading trending content...</p>
          </div>
        ) : (
          <>
            {/* Trending Movies */}
            <div className="mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-8 flex items-center">
                <TrendingUp className="w-8 h-8 mr-3 text-pink-500" />
                Trending Movies
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
                {trendingMovies.map((movie) => (
                  <Link
                    key={movie.id}
                    to={`/movie/${movie.id}`}
                    className="group block bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-pink-200/50 overflow-hidden hover:shadow-2xl transition-all duration-300 hover:-translate-y-2"
                  >
                    <div className="aspect-[2/3] overflow-hidden">
                      <img
                        src={tmdb.getImageUrl(movie.poster_path)}
                        alt={movie.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                    </div>
                    <div className="p-4">
                      <h3 className="font-semibold text-gray-900 text-sm mb-2 line-clamp-2 group-hover:text-pink-600 transition-colors">
                        {movie.title}
                      </h3>
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <span>{new Date(movie.release_date).getFullYear()}</span>
                        <div className="flex items-center">
                          <span className="text-yellow-500">★</span>
                          <span className="ml-1">{movie.vote_average.toFixed(1)}</span>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>

            {/* Trending TV Shows */}
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-8 flex items-center">
                <TrendingUp className="w-8 h-8 mr-3 text-purple-500" />
                Trending TV Shows
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
                {trendingTV.map((show) => (
                  <Link
                    key={show.id}
                    to={`/tv/${show.id}`}
                    className="group block bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-purple-200/50 overflow-hidden hover:shadow-2xl transition-all duration-300 hover:-translate-y-2"
                  >
                    <div className="aspect-[2/3] overflow-hidden">
                      <img
                        src={tmdb.getImageUrl(show.poster_path)}
                        alt={show.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                    </div>
                    <div className="p-4">
                      <h3 className="font-semibold text-gray-900 text-sm mb-2 line-clamp-2 group-hover:text-purple-600 transition-colors">
                        {show.name}
                      </h3>
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <span>{new Date(show.first_air_date).getFullYear()}</span>
                        <div className="flex items-center">
                          <span className="text-yellow-500">★</span>
                          <span className="ml-1">{show.vote_average.toFixed(1)}</span>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </>
        )}
      </div>

      {/* Social Links at Bottom */}
      <div className="bg-white/60 backdrop-blur-sm border-t border-pink-200/50 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-center items-center space-x-4">
            <a
              href="https://discord.gg/8ubGetGGge"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-[#5865F2] hover:bg-[#4752C4] text-white p-2.5 rounded-lg shadow-md hover:shadow-lg transition-all duration-200 transform hover:-translate-y-0.5 group"
              title="Join our Discord"
            >
              <MessageCircle className="w-4 h-4" />
            </a>
            <a
              href="https://x.com/Lunastreamwatch"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-[#1DA1F2] hover:bg-[#1A91DA] text-white p-2.5 rounded-lg shadow-md hover:shadow-lg transition-all duration-200 transform hover:-translate-y-0.5 group"
              title="Follow us on Twitter"
            >
              <Twitter className="w-4 h-4" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;