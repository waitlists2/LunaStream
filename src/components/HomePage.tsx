import React, { useState, useEffect } from 'react';
import { Search, Film, Tv, TrendingUp, MessageCircle, Twitter, Heart } from 'lucide-react';
import { useNavigate, useParams, Link } from 'react-router-dom';

import { tmdb } from '../services/tmdb';
import { Movie, TVShow } from '../types';
import ThemeToggle from './ThemeToggle';

const HomePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<(Movie | TVShow & { media_type: 'movie' | 'tv' })[]>([]);
  const [trendingMovies, setTrendingMovies] = useState<Movie[]>([]);
  const [trendingTV, setTrendingTV] = useState<TVShow[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const [recentlyViewedMovies, setRecentlyViewedMovies] = useState<any[]>([]);
  const [recentlyViewedTV, setRecentlyViewedTV] = useState<any[]>([]);
  const [showRecentlyViewed, setShowRecentlyViewed] = useState(true);
  const [recentlyViewedTVEpisodes, setRecentlyViewedTVEpisodes] = useState<{ [showId: number]: { show: any, episodes: any[] } }>({});

  const clearRecentlyViewed = () => {
    localStorage.removeItem('recentlyViewedMovies');
    localStorage.removeItem('recentlyViewedTVEpisodes');
    setRecentlyViewedMovies([]);
    setRecentlyViewedTV([]);
    setShowRecentlyViewed(false); // Hide the entire section after clearing
  };

  useEffect(() => {
      const items = JSON.parse(localStorage.getItem('recentlyViewedMovies') || '[]');
      setRecentlyViewedMovies(items);
    }, [id]);

  useEffect(() => {
    const data = JSON.parse(localStorage.getItem('recentlyViewedTVEpisodes') || '{}');
    setRecentlyViewedTVEpisodes(data);
  }, []);
  
  
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
    <div className="min-h-screen bg-gradient-to-br from-pink-100 via-purple-50 to-indigo-100 dark:from-gray-900 dark:via-purple-900 dark:to-indigo-900 transition-colors duration-300">
      {/* Header */}
      <nav className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-b border-pink-200/50 dark:border-gray-700/50 sticky top-0 z-50 transition-colors duration-300">
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
            <div className="flex items-center space-x-3">
              <ThemeToggle />
              <Link
                to="/donate"
                className="flex items-center space-x-2 bg-gradient-to-r from-pink-500 to-purple-600 text-white px-4 py-2 rounded-lg font-semibold hover:from-pink-600 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              >
                <Heart className="w-4 h-4" />
                <span>Donate</span>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-12">
          <div className="text-center">
            <h1 className="text-4xl sm:text-6xl font-bold text-gray-900 dark:text-white mb-6 transition-colors duration-300">
              <span className="bg-gradient-to-r from-pink-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
                Watch Movies & TV Shows
              </span>
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-3xl mx-auto transition-colors duration-300">
              Discover and stream your favorite content with our beautiful, easy-to-use platform
            </p>

            {/* Search Bar */}
            {/* Search Bar with Suggestions */}
            <div className="max-w-2xl mx-auto relative">
              <form onSubmit={handleSearch} className="relative">
                <div className="relative bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-2xl shadow-xl border border-pink-200/50 dark:border-gray-700/50 transition-colors duration-300">
                  <div className="absolute inset-y-0 left-0 pl-6 flex items-center pointer-events-none">
                    <Search className="h-6 w-6 text-pink-400 dark:text-purple-400 transition-colors duration-300" />
                  </div>
                  <input
                    type="text"
                    value={query}
                    onChange={async (e) => {
                      const value = e.target.value;
                      setQuery(value);

                      if (value.trim().length > 1) {
                        try {
                          const [movieRes, tvRes] = await Promise.all([
                            tmdb.searchMovies(value),
                            tmdb.searchTV(value),
                          ]);

                          const movieResults = (movieRes.results || []).map((item) => ({
                            ...item,
                            media_type: 'movie',
                          }));

                          const tvResults = (tvRes.results || []).map((item) => ({
                            ...item,
                            media_type: 'tv',
                          }));

                          const combined = [...movieResults, ...tvResults]
                            .sort((a, b) => (b.popularity || 0) - (a.popularity || 0)) // optional sort
                            .slice(0, 6);

                          setSuggestions(combined);
                        } catch (error) {
                          console.error('Search error:', error);
                          setSuggestions([]);
                        }
                      } else {
                        setSuggestions([]);
                      }
                    }}
                    placeholder="Search for movies or TV shows..."
                    className="block w-full pl-16 pr-6 py-6 text-lg bg-transparent border-0 placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-white focus:ring-0 focus:outline-none transition-colors duration-300"
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

              {/* Suggestions Dropdown */}
              {suggestions.length > 0 && (
                <ul className="absolute z-50 mt-2 w-full bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
                  {suggestions.map((item) => (
                    <li key={`${item.title || item.name}-${item.id}`}>
                      <button
                        onClick={() => navigate(`/${item.media_type}/${item.id}`)}
                        className="w-full text-left px-4 py-3 hover:bg-pink-50 dark:hover:bg-gray-700 rounded-xl text-gray-800 dark:text-white transition-colors"
                      >
                        {item.title || item.name}
                        <span className="ml-2 text-xs text-gray-500">
                          ({item.media_type === 'movie' ? 'Movie' : 'TV'})
                        </span>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      </div>
      
      {/* Recently Viewed Section Wrapper */}
      {showRecentlyViewed && (recentlyViewedMovies.length > 0 || recentlyViewedTV.length > 0) && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mt-12 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl border border-pink-200/50 dark:border-gray-700/50 p-6 transition-colors duration-300 relative">

            {/* Heading + Clear Button Wrapper */}
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white transition-colors duration-300">
                Recently Viewed
              </h2>
              <button
                onClick={clearRecentlyViewed}
                className="bg-gradient-to-r from-pink-500 to-purple-600 text-white px-4 py-2 rounded-lg font-semibold hover:from-pink-600 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                aria-label="Clear all recently viewed content"
              >
                Clear All
              </button>
            </div>

            {/* Recently Viewed Movies */}
            {recentlyViewedMovies.length > 0 && (
              <>
                <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-4">Movies</h3>
                <div className="flex gap-4 overflow-x-auto scrollbar-hide mb-8 max-w-fit">
                  {recentlyViewedMovies.slice(0, 10).map((item) => (
                    <Link
                      key={`movie-${item.id}`}
                      to={`/movie/${item.id}`}
                      className="group relative flex-shrink min-w-[80px] max-w-[120px] rounded-lg overflow-hidden hover:shadow-lg transition-all duration-300"
                    >
                      <img
                        src={tmdb.getImageUrl(item.poster_path, 'w300')}
                        alt={item.title}
                        className="w-full h-48 object-cover rounded-lg group-hover:opacity-80 transition-opacity"
                      />
                      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-2 text-white text-sm">
                        <p className="font-semibold truncate">{item.title}</p>
                        <p className="text-xs">{item.release_date?.split('-')[0]}</p>
                      </div>
                    </Link>
                  ))}
                </div>
              </>
            )}

            {/* Recently Viewed TV Shows */}
            {Object.keys(recentlyViewedTVEpisodes).length > 0 && (
              <>
                <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-4">
                  TV
                </h3>
                <div className="mt-2 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl border border-pink-200/50 dark:border-gray-700/50 p-6 transition-colors duration-300">
                  <div className="flex gap-6">
                    {/* Left: Latest viewed show with big image and episodes */}
                    {(() => {
                      const firstShow = Object.values(recentlyViewedTVEpisodes)[0];
                      if (!firstShow) return null;
                      return (
                        <div className="md:w-1/2 flex space-x-6">
                          <Link to={`/tv/${firstShow.show.id}`} className="flex-shrink-0">
                            <img
                              src={tmdb.getImageUrl(firstShow.show.poster_path, 'w300')}
                              alt={firstShow.show.name}
                              className="rounded-lg object-cover w-48 h-72"
                            />
                          </Link>
                          <div className="flex flex-col">
                            <h3 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">
                              {firstShow.show.name}
                            </h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                              {firstShow.show.first_air_date?.slice(0, 4)}
                            </p>
                            <ul className="list-disc list-inside text-gray-700 dark:text-gray-300 space-y-1 max-h-[360px] overflow-auto pr-2">
                              {firstShow.episodes.slice(0, 5).map((ep: any) => (
                                <li key={ep.id}>
                                  <Link
                                    to={`/tv/${firstShow.show.id}`}
                                    className="hover:text-pink-600 dark:hover:text-pink-400"
                                  >
                                    S{ep.season_number}E{ep.episode_number} – {ep.name}
                                  </Link>
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      );
                    })()}

                    {/* Right: Next 4 shows in 2x2 grid matching left side height */}
                    <div className="md:w-1/2 grid grid-cols-2 grid-rows-2 gap-4 h-[288px]">
                      {Object.values(recentlyViewedTVEpisodes)
                        .slice(1, 5)
                        .map((group: any) => (
                          <div
                            key={group.show.id}
                            className="bg-white dark:bg-gray-900 rounded-lg shadow p-3 flex flex-col"
                          >
                            <Link
                              to={`/tv/${group.show.id}`}
                              className="flex items-center space-x-3 mb-2 hover:underline"
                            >
                              <img
                                src={tmdb.getImageUrl(group.show.poster_path, 'w92')}
                                alt={group.show.name}
                                className="w-12 h-18 rounded-md object-cover flex-shrink-0"
                              />
                              <div>
                                <h4 className="text-md font-semibold text-gray-900 dark:text-white">
                                  {group.show.name}
                                </h4>
                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                  {group.show.first_air_date?.slice(0, 4)}
                                </p>
                              </div>
                            </Link>
                            <ul className="list-disc list-inside text-gray-700 dark:text-gray-300 space-y-1 text-xs overflow-auto flex-grow pr-2">
                              {group.episodes.slice(0, 5).map((ep: any) => (
                                <li key={ep.id}>
                                  <Link
                                    to={`/tv/${group.show.id}`}
                                    className="hover:text-pink-600 dark:hover:text-pink-400"
                                  >
                                    S{ep.season_number}E{ep.episode_number} - {ep.name}
                                  </Link>
                                </li>
                              ))}
                            </ul>
                          </div>
                        ))}
                    </div>
                  </div>
                </div>
              </>
            )}

          </div>
        </div>
      )}
      
      <br/>
      <br/>


      {/* Trending Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        {loading ? (
          <div className="text-center py-16">
            <div className="w-16 h-16 bg-gradient-to-r from-pink-500 to-purple-600 rounded-full animate-spin flex items-center justify-center mb-4 shadow-lg mx-auto">
              <TrendingUp className="w-8 h-8 text-white" />
            </div>
            <p className="text-gray-600 dark:text-gray-300 text-lg transition-colors duration-300">Loading trending content...</p>
          </div>
        ) : (
          <>
            {/* Trending Movies */}
            <div className="mb-12">
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-8 flex items-center transition-colors duration-300">
                <TrendingUp className="w-8 h-8 mr-3 text-pink-500" />
                Trending Movies
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
                {trendingMovies.map((movie) => (
                  <Link
                    key={movie.id}
                    to={`/movie/${movie.id}`}
                    className="group block bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl shadow-lg border border-pink-200/50 dark:border-gray-700/50 overflow-hidden hover:shadow-2xl transition-all duration-300 hover:-translate-y-2"
                  >
                    <div className="aspect-[2/3] overflow-hidden">
                      <img
                        src={tmdb.getImageUrl(movie.poster_path)}
                        alt={movie.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                    </div>
                    <div className="p-4">
                      <h3 className="font-semibold text-gray-900 dark:text-white text-sm mb-2 line-clamp-2 group-hover:text-pink-600 dark:group-hover:text-pink-400 transition-colors">
                        {movie.title}
                      </h3>
                      <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
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
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-8 flex items-center transition-colors duration-300">
                <TrendingUp className="w-8 h-8 mr-3 text-purple-500" />
                Trending TV Shows
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
                {trendingTV.map((show) => (
                  <Link
                    key={show.id}
                    to={`/tv/${show.id}`}
                    className="group block bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl shadow-lg border border-purple-200/50 dark:border-gray-700/50 overflow-hidden hover:shadow-2xl transition-all duration-300 hover:-translate-y-2"
                  >
                    <div className="aspect-[2/3] overflow-hidden">
                      <img
                        src={tmdb.getImageUrl(show.poster_path)}
                        alt={show.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                    </div>
                    <div className="p-4">
                      <h3 className="font-semibold text-gray-900 dark:text-white text-sm mb-2 line-clamp-2 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                        {show.name}
                      </h3>
                      <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
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
      <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm border-t border-pink-200/50 dark:border-gray-700/50 py-6 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-center items-center space-x-4">
            <a
              href="https://discord.gg/8ubGetGGge"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-[#5865F2] hover:bg-[#4752C4] text-white p-2.5 rounded-lg shadow-md hover:shadow-lg transition-all duration-200 transform hover:-translate-y-0.5 group"
              title="Join our Discord"
            >
            <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            fill="currentColor"
            class="bi bi-discord"
            viewBox="0 0 16 16"
            >
              <path d="M13.545 2.907a13.2 13.2 0 0 0-3.257-1.011.05.05 0 0 0-.052.025c-.141.25-.297.577-.406.833a12.2 12.2 0 0 0-3.658 0 8 8 0 0 0-.412-.833.05.05 0 0 0-.052-.025c-1.125.194-2.22.534-3.257 1.011a.04.04 0 0 0-.021.018C.356 6.024-.213 9.047.066 12.032q.003.022.021.037a13.3 13.3 0 0 0 3.995 2.02.05.05 0 0 0 .056-.019q.463-.63.818-1.329a.05.05 0 0 0-.01-.059l-.018-.011a9 9 0 0 1-1.248-.595.05.05 0 0 1-.02-.066l.015-.019q.127-.095.248-.195a.05.05 0 0 1 .051-.007c2.619 1.196 5.454 1.196 8.041 0a.05.05 0 0 1 .053.007q.121.1.248.195a.05.05 0 0 1-.004.085 8 8 0 0 1-1.249.594.05.05 0 0 0-.03.03.05.05 0 0 0 .003.041c.24.465.515.909.817 1.329a.05.05 0 0 0 .056.019 13.2 13.2 0 0 0 4.001-2.02.05.05 0 0 0 .021-.037c.334-3.451-.559-6.449-2.366-9.106a.03.03 0 0 0-.02-.019m-8.198 7.307c-.789 0-1.438-.724-1.438-1.612s.637-1.613 1.438-1.613c.807 0 1.45.73 1.438 1.613 0 .888-.637 1.612-1.438 1.612m5.316 0c-.788 0-1.438-.724-1.438-1.612s.637-1.613 1.438-1.613c.807 0 1.451.73 1.438 1.613 0 .888-.631 1.612-1.438 1.612"/>
            </svg>
            </a>
            <a
              href="https://x.com/Lunastreamwatch"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-[#1DA1F2] hover:bg-[#1A91DA] text-white p-2.5 rounded-lg shadow-md hover:shadow-lg transition-all duration-200 transform hover:-translate-y-0.5 group"
              title="Follow us on Twitter"
            >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              fill="currentColor"
              class="bi bi-twitter"
              viewBox="0 0 16 16"
            >
              <path d="M5.026 15c6.038 0 9.341-5.003 9.341-9.334q.002-.211-.006-.422A6.7 6.7 0 0 0 16 3.542a6.7 6.7 0 0 1-1.889.518 3.3 3.3 0 0 0 1.447-1.817 6.5 6.5 0 0 1-2.087.793A3.286 3.286 0 0 0 7.875 6.03a9.32 9.32 0 0 1-6.767-3.429 3.29 3.29 0 0 0 1.018 4.382A3.3 3.3 0 0 1 .64 6.575v.045a3.29 3.29 0 0 0 2.632 3.218 3.2 3.2 0 0 1-.865.115 3 3 0 0 1-.614-.057 3.28 3.28 0 0 0 3.067 2.277A6.6 6.6 0 0 1 .78 13.58a6 6 0 0 1-.78-.045A9.34 9.34 0 0 0 5.026 15" />
            </svg>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;