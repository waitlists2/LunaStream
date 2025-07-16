import React, { useState, useEffect } from 'react';
import { Search, Film, TrendingUp, Heart } from 'lucide-react';
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
  const [showAllFaves, setShowAllFaves] = React.useState(false);


  const [recentlyViewedMovies, setRecentlyViewedMovies] = useState<any[]>([]);
  const [recentlyViewedTVEpisodes, setRecentlyViewedTVEpisodes] = useState<{ [showId: number]: { show: any, episodes: any[] } }>({});

  // State
  const [favoriteShows, setFavoriteShows] = useState(() => {
    const stored = localStorage.getItem('favoriteShows');
    return stored ? JSON.parse(stored) : [];
  });

  const [favoriteMovies, setFavoriteMovies] = useState(() => {
    const stored = localStorage.getItem('favoriteMovies');
    return stored ? JSON.parse(stored) : [];
  });

  // Load favorites from localStorage on mount
  useEffect(() => {
    const storedShows = JSON.parse(localStorage.getItem('favoriteShows') || '[]');
    const storedMovies = JSON.parse(localStorage.getItem('favoriteMovies') || '[]');
    setFavoriteShows(storedShows);
    setFavoriteMovies(storedMovies);
  }, []);

  const toggleFavorite = (item: any) => {
    if (item.type === 'tv') {
      let updatedShows = [...favoriteShows];
      if (favoriteShows.includes(item.show.id)) {
        updatedShows = updatedShows.filter((id) => id !== item.show.id);
      } else {
        updatedShows.unshift(item.show.id);
      }
      setFavoriteShows(updatedShows);
      localStorage.setItem('favoriteShows', JSON.stringify(updatedShows));
    }

    if (item.type === 'movie') {
      let updatedMovies = [...favoriteMovies];
      if (favoriteMovies.includes(item.movie.id)) {
        updatedMovies = updatedMovies.filter((id) => id !== item.movie.id);
      } else {
        updatedMovies.unshift(item.movie.id);
      }
      setFavoriteMovies(updatedMovies);
      localStorage.setItem('favoriteMovies', JSON.stringify(updatedMovies));
    }
  };

  const isFavorited = (item: any) => {
    if (item.type === 'tv') {
      return favoriteShows.includes(item.show.id);
    }
    if (item.type === 'movie') {
      return favoriteMovies.includes(item.movie.id);
    }
    return false;
  };

  const clearRecentlyViewed = () => {
    localStorage.removeItem('recentlyViewedMovies');
    localStorage.removeItem('recentlyViewedTVEpisodes');
    setRecentlyViewedMovies([]);
    setRecentlyViewedTVEpisodes({});
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

  const showRecentlyViewed = recentlyViewedMovies.length > 0 || Object.keys(recentlyViewedTVEpisodes).length > 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-100 via-purple-50 to-indigo-100 dark:from-black dark:via-gray-950 dark:to-black transition-colors duration-300">

      {/* Header */}
      <nav className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-b border-pink-200/50 dark:border-gray-700/50 sticky top-0 z-50 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo & Title */}
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-pink-400 to-purple-500 rounded-lg flex items-center justify-center shadow-lg">
                <Film className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
                LunaStream
              </span>
            </div>
            {/* Buttons */}
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

      {/* Hero & Search */}
      <div className="relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-12">
          {/* Heading */}
          <div className="text-center">
            <h1 className="text-4xl sm:text-6xl font-bold text-gray-900 dark:text-white mb-6 transition-colors duration-300">
              <span className="bg-gradient-to-r from-pink-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
                Watch Movies & TV Shows
              </span>
            </h1>
            {/* Subtitle */}
            <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-3xl mx-auto transition-colors duration-300">
              Discover and stream your favorite content with our beautiful, easy-to-use platform
            </p>
            {/* Search with Suggestions */}
            <div className="max-w-2xl mx-auto relative">
              <form onSubmit={handleSearch} className="relative">
                <div className="relative bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm rounded-2xl shadow-xl border border-pink-200/50 dark:border-gray-700/50 transition-colors duration-300">
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
                            .sort((a, b) => (b.popularity || 0) - (a.popularity || 0))
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
                {/* Suggestions Dropdown */}
                {suggestions.length > 0 && (
                  <ul className="absolute z-50 mt-2 w-full bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 max-h-64 overflow-auto">
                    {suggestions.map((item) => (
                      <li key={`${item.title || item.name}-${item.id}`}>
                        <button
                          onClick={() => navigate(`/${item.media_type}/${item.id}`)}
                          className="w-full text-left px-4 py-3 hover:bg-pink-50 dark:hover:bg-gray-700 rounded-xl text-gray-800 dark:text-white transition-colors"
                        >
                          {item.title || item.name}
                          <span className="ml-2 text-xs text-gray-500 dark:text-gray-400">
                            ({item.media_type === 'movie' ? 'Movie' : 'TV'})
                          </span>
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </form>
            </div>
          </div>
        </div>
      </div>

      {/* Recently Viewed */}
      {(recentlyViewedMovies.length > 0 || Object.keys(recentlyViewedTVEpisodes).length > 0) && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mt-12 p-8 relative rounded-2xl shadow-xl border border-white/20 dark:border-gray-700/50 bg-gradient-to-br from-white/30 to-white/10 dark:from-gray-800/30 dark:to-gray-800/10 backdrop-blur-lg transition-all duration-500 overflow-hidden">
            <div className="absolute inset-0 z-0 pointer-events-none">
                <div className="absolute inset-0 bg-gradient-to-br from-pink-400/10 via-purple-400/10 to-indigo-400/10 opacity-30 rounded-2xl"></div>
            </div>
            <div className="relative z-10">
              {/* Heading + Clear Button */}
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
                  Continue Watching
                </h2>
                <button
                  onClick={clearRecentlyViewed}
                  className="bg-gradient-to-r from-pink-500 to-purple-600 text-white px-5 py-2.5 rounded-xl font-semibold hover:from-pink-600 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                >
                  Clear All
                </button>
              </div>

              {/* Unified Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
                {(() => {
                  const tvItems = Object.values(recentlyViewedTVEpisodes).map((group: any) => {
                    const seasons = group.episodes.reduce((acc: any, ep: any) => {
                      if (!acc[ep.season_number]) acc[ep.season_number] = [];
                      acc[ep.season_number].push(ep);
                      return acc;
                    }, {});
                    return {
                      show: group.show,
                      seasons,
                      lastWatchedAt: Math.max(...group.episodes.map((ep: any) => ep.lastWatchedAt)),
                    };
                  });

                  const movieItems = recentlyViewedMovies.map((movie: any) => ({
                    type: 'movie',
                    lastWatchedAt: movie.lastWatchedAt,
                    movie,
                  }));

                  const combined = [
                    ...tvItems.map((item) => ({ type: 'tv', ...item })),
                    ...movieItems,
                  ].sort((a, b) => b.lastWatchedAt - a.lastWatchedAt);

                  return combined.slice(0, 12).map((item, idx) => {
                    if (item.type === 'movie') {
                      return (
                        <Link
                          key={`movie-${item.movie.id}-${idx}`}
                          to={`/movie/${item.movie.id}`}
                          className="group relative rounded-2xl overflow-hidden hover:shadow-2xl transition-all duration-300 border border-white/20 dark:border-gray-700/50 bg-white/10 dark:bg-gray-700/10 backdrop-blur-sm"
                        >
                          <img
                            src={tmdb.getImageUrl(item.movie.poster_path, 'w300')}
                            alt={item.movie.title}
                            className="w-full h-full object-cover rounded-2xl group-hover:opacity-80 transition-opacity"
                          />
                          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4 text-white text-sm">
                            <p className="font-semibold truncate">{item.movie.title}</p>
                            <p className="text-xs opacity-80">{item.movie.release_date?.split('-')[0]}</p>
                          </div>
                        </Link>
                      );
                    }

                    if (item.type === 'tv') {
                      return (
                        <Link
                          key={`tv-${item.show.id}-${idx}`}
                          to={`/tv/${item.show.id}`}
                          className="group relative rounded-2xl overflow-hidden hover:shadow-2xl transition-all duration-300 border border-white/20 dark:border-gray-700/50 bg-white/10 dark:bg-gray-700/10 backdrop-blur-sm"
                        >
                          <img
                            src={tmdb.getImageUrl(item.show.poster_path, 'w300')}
                            alt={item.show.name}
                            className="w-full h-full object-cover rounded-2xl group-hover:opacity-80 transition-opacity"
                          />
                          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4 text-white text-xs">
                            <p className="font-semibold truncate">{item.show.name}</p>
                            <p className="opacity-80 truncate">Multiple Episodes</p>
                          </div>

                          {/* Hover Details */}
                          <div className="absolute inset-0 bg-black/75 backdrop-blur-md opacity-0 group-hover:opacity-100 transition-all duration-300 flex flex-col p-4 rounded-2xl transform scale-95 group-hover:scale-100 pointer-events-none group-hover:pointer-events-auto">
                            <div className="flex-shrink-0">
                              <p className="text-lg font-bold text-center">{item.show.name}</p>
                            </div>
                            <div className="mt-4 overflow-y-auto text-white text-sm space-y-3 flex-1 flex justify-center">
                              <div className="w-full max-w-xs text-left">
                                {Object.entries(item.seasons)
                                  .sort(([a], [b]) => Number(a) - Number(b))
                                  .map(([seasonNum, episodes]) => (
                                    <div key={seasonNum}>
                                      <p className="font-semibold text-pink-400 mb-1">Season {seasonNum}</p>
                                      <ul className="space-y-1">
                                        {episodes
                                          .sort((a: any, b: any) => a.episode_number - b.episode_number)
                                          .map((ep: any) => (
                                            <li key={ep.id}>
                                              <Link
                                                to={`/tv/${item.show.id}#S${ep.season_number}E${ep.episode_number}`}
                                                className="block hover:text-pink-300 transition-colors"
                                              >
                                                <span className="opacity-80">
                                                  S{ep.season_number}E{ep.episode_number}
                                                </span>{' '}
                                                - {ep.name}
                                              </Link>
                                            </li>
                                          ))}
                                      </ul>
                                    </div>
                                  ))}
                              </div>
                            </div>
                          </div>
                        </Link>
                      );
                    }
                    return null;
                  });
                })()}
              </div>
            </div>
          </div>
        </div>
      )}

      <br/>

      {/* Favourites Section */}
      {(favoriteMovies.length > 0 || favoriteShows.length > 0) && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mt-12 p-8 relative rounded-2xl shadow-xl border border-white/20 dark:border-gray-700/50 bg-gradient-to-br from-white/30 to-white/10 dark:from-gray-800/30 dark:to-gray-800/10 backdrop-blur-lg transition-all duration-500 overflow-hidden">
            <div className="absolute inset-0 z-0 pointer-events-none">
              <div className="absolute inset-0 bg-gradient-to-br from-pink-400/10 via-purple-400/10 to-indigo-400/10 opacity-30 rounded-2xl"></div>
            </div>
            <div className="relative z-10">
              {/* Heading with Unlimit button */}
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Favorites</h2>
                {[...favoriteMovies, ...favoriteShows].length > 12 && (
                  <button
                    onClick={() => setShowAllFaves(!showAllFaves)}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md transition"
                  >
                    {showAllFaves ? 'Close' : 'Show All'}
                  </button>
                )}
              </div>

              {/* Unified Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
                {[...favoriteMovies.map(movie => ({ type: 'movie', data: movie })), ...favoriteShows.map(show => ({ type: 'tv', data: show }))]
                  .slice(0, showAllFaves ? undefined : 12)
                  .map(({ type, data }) => {
                    const isMovie = type === 'movie';
                    const id = data.id;
                    const title = isMovie ? data.title : data.name;

                    // Calculate subtitle
                    let subtitle = '';
                    if (isMovie) {
                      subtitle = data.release_date?.split('-')[0] ?? '';
                    } else {
                      const firstYear = data.first_air_date?.split('-')[0];
                      const lastAirDate = data.last_air_date || data.last_episode_to_air?.air_date;
                      const lastYear = lastAirDate?.split('-')[0];
                      if (firstYear && lastYear) {
                        subtitle = firstYear === lastYear ? firstYear : `${firstYear} - ${lastYear}`;
                      } else if (firstYear) {
                        subtitle = firstYear;
                      } else {
                        subtitle = 'TV Show';
                      }
                    }

                    const imageUrl = tmdb.getImageUrl(data.poster_path, 'w300');

                    const isFavorited = isMovie
                      ? favoriteMovies.some(fav => fav.id === id)
                      : favoriteShows.some(fav => fav.id === id);

                    const toggleFavorite = () => {
                      if (isMovie) {
                        let favs = JSON.parse(localStorage.getItem('favoriteMovies') || '[]');
                        if (favs.some(fav => fav.id === id)) {
                          favs = favs.filter(fav => fav.id !== id);
                        } else {
                          favs.unshift(data);
                        }
                        localStorage.setItem('favoriteMovies', JSON.stringify(favs));
                        setFavoriteMovies(favs);
                      } else {
                        let favs = JSON.parse(localStorage.getItem('favoriteShows') || '[]');
                        if (favs.some(fav => fav.id === id)) {
                          favs = favs.filter(fav => fav.id !== id);
                        } else {
                          favs.unshift(data);
                        }
                        localStorage.setItem('favoriteShows', JSON.stringify(favs));
                        setFavoriteShows(favs);
                      }
                    };

                    return (
                      <Link
                        key={`${type}-${id}`}
                        to={`/${isMovie ? 'movie' : 'tv'}/${id}`}
                        className="group relative rounded-2xl overflow-hidden hover:shadow-2xl transition-all duration-300 border border-white/20 dark:border-gray-700/50 bg-white/10 dark:bg-gray-700/10 backdrop-blur-sm block"
                      >
                        <img
                          src={imageUrl}
                          alt={title}
                          className="w-full h-full object-cover rounded-2xl group-hover:opacity-80 transition-opacity"
                        />

                        <button
                          onClick={(e) => {
                            e.preventDefault(); // Prevent link navigation on button click
                            toggleFavorite();
                          }}
                          aria-label="Toggle Favorite"
                          className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 text-pink-500 p-1 transition-opacity duration-300"
                        >
                          <Heart
                            className="w-7 h-7"
                            fill={isFavorited ? 'currentColor' : 'none'}
                            stroke="currentColor"
                            strokeWidth={1.5}
                          />
                        </button>

                        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4 text-white text-sm">
                          <p className="font-semibold truncate">{title}</p>
                          {subtitle && <p className="text-xs opacity-80">{subtitle}</p>}
                        </div>
                      </Link>
                    );
                  })}
              </div>
            </div>
          </div>
        </div>
      )}

      <br/>

      {/* Trending Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        {loading ? (
          <div className="text-center py-16">
            <div className="w-16 h-16 bg-gradient-to-r from-pink-500 to-purple-600 rounded-full animate-spin flex items-center justify-center mb-4 shadow-lg mx-auto">
              <TrendingUp className="w-8 h-8 text-white" />
            </div>
            <p className="text-gray-600 dark:text-gray-300 text-lg transition-colors duration-300">
              Loading trending content...
            </p>
          </div>
        ) : (
          <>
            {/* Trending Movies */}
            <div className="mb-12">
              <h2 className="flex items-center mb-8 text-3xl font-bold text-gray-900 dark:text-white transition-colors duration-300">
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
              <h2 className="flex items-center mb-8 text-3xl font-bold text-gray-900 dark:text-white transition-colors duration-300">
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

      {/* Footer social links */}
      <div className="bg-white/60 dark:bg-gray-900/80 backdrop-blur-sm border-t border-pink-200/50 dark:border-gray-700/50 py-6 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-center items-center space-x-4">
            {/* Discord */}
            <a
              href="https://discord.gg/8ubGetGGge"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-[#5865F2] hover:bg-[#4752C4] text-white p-2.5 rounded-lg shadow-md transition-all duration-200 transform hover:-translate-y-0.5 group"
              title="Join our Discord"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                fill="currentColor"
                className="bi bi-discord"
                viewBox="0 0 16 16"
              >
                <path d="M13.545 2.907a13.2 13.2 0 0 0-3.257-1.011.05.05 0 0 0-.052.025c-.141.25-.297.577-.406.833a12.2 12.2 0 0 0-3.658 0 8 8 0 0 0-.412-.833.05.05 0 0 0-.052-.025c-1.125.194-2.22.534-3.257 1.011a.04.04 0 0 0-.021.018C.356 6.024-.213 9.047.066 12.032q.003.022.021.037a13.3 13.3 0 0 0 3.995 2.02.05.05 0 0 0 .056-.019q.463-.63.818-1.329a.05.05 0 0 0-.01-.059l-.018-.011a9 9 0 0 1-1.248-.595.05.05 0 0 1-.02-.066l.015-.019q.127-.095.248-.195a.05.05 0 0 1 .051-.007c2.619 1.196 5.454 1.196 8.041 0a.05.05 0 0 1 .053.007q.121.1.248.195a.05.05 0 0 1-.004.085 8 8 0 0 1-1.249.594.05.05 0 0 0-.03.03.05.05 0 0 0 .003.041c.24.465.515.909.817 1.329a.05.05 0 0 0 .056.019 13.2 13.2 0 0 0 4.001-2.02.05.05 0 0 0 .021-.037c.334-3.451-.559-6.449-2.366-9.106a.03.03 0 0 0-.02-.019m-8.198 7.307c-.789 0-1.438-.724-1.438-1.612s.637-1.613 1.438-1.613c.807 0 1.45.73 1.438 1.613 0 .888-.637 1.612-1.438 1.612m5.316 0c-.788 0-1.438-.724-1.438-1.612s.637-1.613 1.438-1.613c.807 0 1.451.73 1.438 1.613 0 .888-.631 1.612-1.438 1.612" />
              </svg>
            </a>
            {/* Twitter */}
            <a
              href="https://x.com/Lunastreamwatch"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-[#1DA1F2] hover:bg-[#1A91DA] text-white p-2.5 rounded-lg shadow-md transition-all duration-200 transform hover:-translate-y-0.5 group"
              title="Follow us on Twitter"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                fill="currentColor"
                className="bi bi-twitter"
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