import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Play, Star, Calendar, Clock, Film, X } from 'lucide-react';
import { tmdb } from '../services/tmdb';
import { analytics } from '../services/analytics';
import { MovieDetails } from '../types';
import ThemeToggle from './ThemeToggle';

const MovieDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [movie, setMovie] = useState<MovieDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [frogBoops, setFrogBoops] = useState(0);
  const [showBoopAnimation, setShowBoopAnimation] = useState(false);
  const [recentlyViewedMovies, setRecentlyViewedMovies] = useState<any[]>([]);

  // Easter egg movie IDs
  const easterEggMovieIds = ['816', '817', '818'];
  const showEasterEgg = id && easterEggMovieIds.includes(id);

  const clearRecentlyViewed = () => {
    localStorage.removeItem('recentlyViewedMovies');
    setRecentlyViewedMovies([]);
  };


  useEffect(() => {
      const items = JSON.parse(localStorage.getItem('recentlyViewedMovies') || '[]');
      setRecentlyViewedMovies(items);
    }, [id]);

  useEffect(() => {
    if (movie) {
      const existing = JSON.parse(localStorage.getItem('recentlyViewedMovies') || '[]');

      // Remove duplicates by filtering out this movie if already in the list
      const filtered = existing.filter((item: any) => item.id !== movie.id);

      // Add current movie to the start
      const updated = [{
        id: movie.id,
        title: movie.title,
        poster_path: movie.poster_path,
        release_date: movie.release_date
      }, ...filtered];

      // Limit to 10 items max
      localStorage.setItem('recentlyViewedMovies', JSON.stringify(updated.slice(0, 10)));
    }
}, [movie]);


  useEffect(() => {
    const fetchMovie = async () => {
      if (!id) return;
      setLoading(true);
      try {
        const movieData = await tmdb.getMovieDetails(parseInt(id));
        setMovie(movieData);
      } catch (error) {
        console.error('Failed to fetch movie:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchMovie();
  }, [id]);

  const handleWatchMovie = () => {
    if (movie && id) {
      // Start real analytics session with poster path and duration
      const newSessionId = analytics.startSession(
        'movie', 
        parseInt(id), 
        movie.title,
        movie.poster_path,
        undefined,
        undefined,
        movie.runtime ? movie.runtime * 60 : undefined // Convert minutes to seconds
      );
      setSessionId(newSessionId);
      setIsPlaying(true);
    }
  };

  const handleClosePlayer = () => {
    if (sessionId) {
      // End analytics session with final time
      const finalTime = Math.random() * (movie?.runtime ? movie.runtime * 60 : 7200); // Simulate watch time
      analytics.endSession(sessionId, finalTime);
      setSessionId(null);
    }
    setIsPlaying(false);
  };

  // Update session periodically while playing
  useEffect(() => {
    if (isPlaying && sessionId && movie) {
      const interval = setInterval(() => {
        // Simulate realistic progression through the movie
        const currentTime = Math.random() * (movie.runtime ? movie.runtime * 60 : 7200);
        
        // Simulate user interactions
        const additionalData: any = {};
        if (Math.random() > 0.95) additionalData.pauseEvents = 1;
        if (Math.random() > 0.98) additionalData.seekEvents = 1;
        if (Math.random() > 0.99) additionalData.bufferingEvents = 1;
        if (Math.random() > 0.9) additionalData.isFullscreen = Math.random() > 0.5;
        
        analytics.updateSession(sessionId, currentTime, additionalData);
      }, 30000); // Update every 30 seconds

      return () => clearInterval(interval);
    }
  }, [isPlaying, sessionId, movie]);

  const handleFrogBoop = () => {
    setFrogBoops(prev => prev + 1);
    setShowBoopAnimation(true);
    setTimeout(() => setShowBoopAnimation(false), 600);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-100 via-purple-50 to-indigo-100 dark:from-gray-900 dark:via-purple-900 dark:to-indigo-900 flex items-center justify-center transition-colors duration-300">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-r from-pink-500 to-purple-600 rounded-full animate-spin flex items-center justify-center mb-4 shadow-lg">
            <Film className="w-8 h-8 text-white" />
          </div>
          <p className="text-gray-600 dark:text-gray-300 text-lg transition-colors duration-300">Loading movie details...</p>
        </div>
      </div>
    );
  }

  if (!movie) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-100 via-purple-50 to-indigo-100 dark:from-gray-900 dark:via-purple-900 dark:to-indigo-900 flex items-center justify-center transition-colors duration-300">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 transition-colors duration-300">Movie not found</h2>
          <Link to="/" className="text-pink-600 dark:text-pink-400 hover:text-pink-700 dark:hover:text-pink-300 transition-colors">Go back home</Link>
        </div>
      </div>
    );
  }

  if (isPlaying) {
    return (
      <div className="fixed inset-0 bg-black z-50">
        {/* Close Button */}
        <div className="absolute top-6 right-6 z-10">
          <button
            onClick={handleClosePlayer}
            className="text-white hover:text-gray-300 transition-colors"
            aria-label="Close Player"
          >
            <X className="w-8 h-8" />
          </button>
        </div>

        {/* Video Player with Enhanced Ad Blocking */}
        <iframe
          src={`https://player.videasy.net/movie/${id}?color=fbc9ff&nextEpisode=true&episodeSelector=true&autoplayNextEpisode=true&noRedirect=true&adblock=true&popup=false`}
          className="w-full h-full border-0"
          allowFullScreen
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share; fullscreen"
          sandbox="allow-scripts allow-same-origin allow-forms"
          title={movie.title}
          referrerPolicy="no-referrer"
          style={{
            colorScheme: 'normal',
            filter: 'none'
          }}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-100 via-purple-50 to-indigo-100 dark:from-gray-900 dark:via-purple-900 dark:to-indigo-900 relative transition-colors duration-300">
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

      {/* Movie Details */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl border border-pink-200/50 dark:border-gray-700/50 overflow-hidden transition-colors duration-300">
          <div className="md:flex">
            {/* Poster */}
            <div className="md:flex-shrink-0">
              <img
                src={tmdb.getImageUrl(movie.poster_path, 'w500')}
                alt={movie.title}
                className="h-96 w-full object-cover md:h-full md:w-80"
              />
            </div>

            {/* Content */}
            <div className="p-8">
              <div className="flex items-start justify-between mb-4">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white transition-colors duration-300">{movie.title}</h1>
                <div className="flex items-center bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-3 py-1 rounded-full">
                  <Star className="w-4 h-4 mr-1" />
                  {movie.vote_average.toFixed(1)}
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-4 mb-6 text-sm text-gray-600 dark:text-gray-300 transition-colors duration-300">
                <div className="flex items-center">
                  <Calendar className="w-4 h-4 mr-1" />
                  {new Date(movie.release_date).getFullYear()}
                </div>
                <div className="flex items-center">
                  <Clock className="w-4 h-4 mr-1" />
                  {movie.runtime} minutes
                </div>
              </div>

              {/* Genres */}
              <div className="flex flex-wrap gap-2 mb-6">
                {movie.genres.map((genre) => (
                  <span
                    key={genre.id}
                    className="bg-gradient-to-r from-pink-500 to-purple-600 text-white px-3 py-1 rounded-full text-sm"
                  >
                    {genre.name}
                  </span>
                ))}
              </div>

              {/* Overview */}
              <p className="text-gray-700 dark:text-gray-300 mb-8 leading-relaxed transition-colors duration-300">{movie.overview}</p>

              {/* Watch Button */}
              <button
                onClick={handleWatchMovie}
                className="bg-gradient-to-r from-pink-500 to-purple-600 text-white px-8 py-4 rounded-xl font-bold text-lg hover:from-pink-600 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 flex items-center"
              >
                 <Play className="w-6 h-6 mr-2" />
                Watch Now
              </button>
            </div>
          </div>
        </div>

      {recentlyViewedMovies.length > 0 && (
        <div className="mt-12 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl border border-pink-200/50 dark:border-gray-700/50 p-6 transition-colors duration-300">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white transition-colors duration-300">
              Recently Viewed
            </h2>
    
            <button
              onClick={clearRecentlyViewed}
              className="text-sm bg-pink-500 hover:bg-pink-600 text-white px-3 py-1 rounded-lg shadow transition-all duration-200"
            >
              Clear
            </button>
          </div>
            
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {recentlyViewedMovies.slice(0, 5).map((item) => (
              <Link
                key={item.id}
                to={`/movie/${item.id}`}
                className="group relative rounded-lg overflow-hidden hover:shadow-lg transition-all duration-300"
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
        </div>
      )}
    </div>

      {/* Easter Egg Frog */}
      {showEasterEgg && (
        <div className="fixed bottom-6 right-6 z-40">
          <button
            onClick={handleFrogBoop}
            className={`group relative bg-green-500 hover:bg-green-600 rounded-full p-4 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-110 ${
              showBoopAnimation ? 'animate-bounce' : ''
            }`}
            title={`Boop the frog! (${frogBoops} boops)`}
            aria-label="Easter egg frog"
          >
            {/* Frog Emoji/Icon */}
            <div className="text-2xl select-none">🐸</div>
            
            {/* Boop Counter */}
            {frogBoops > 0 && (
              <div className="absolute -top-2 -right-2 bg-pink-500 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center shadow-md">
                {frogBoops > 99 ? '99+' : frogBoops}
              </div>
            )}
            
            {/* Boop Animation Effect */}
            {showBoopAnimation && (
              <div className="absolute inset-0 bg-yellow-400 rounded-full animate-ping opacity-75"></div>
            )}
            
            {/* Hover Tooltip */}
            <div className="absolute bottom-full right-0 mb-2 px-3 py-1 bg-gray-800 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap pointer-events-none">
              Boop me! 🐸
              <div className="absolute top-full right-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-800"></div>
            </div>
          </button>
        </div>
      )}
    </div>
  );
};

export default MovieDetail;