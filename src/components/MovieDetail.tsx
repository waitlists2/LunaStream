import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Play, Star, Calendar, Clock, Film, X, AlertTriangle } from 'lucide-react';
import { tmdb } from '../services/tmdb';
import { MovieDetails } from '../types';

const MovieDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [movie, setMovie] = useState<MovieDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentPlayerIndex, setCurrentPlayerIndex] = useState(0);
  const [playerError, setPlayerError] = useState(false);

  // Multiple video sources to bypass blocking
  const videoSources = [
    {
      name: 'Primary Player',
      url: `https://player.videasy.net/movie/${id}?color=fbc9ff&nextEpisode=true&episodeSelector=true&autoplayNextEpisode=true&noRedirect=true`,
      sandbox: "allow-scripts allow-same-origin allow-forms"
    },
    {
      name: 'Alternative Player 1',
      url: `https://vidsrc.to/embed/movie/${id}`,
      sandbox: "allow-scripts allow-same-origin allow-forms"
    },
    {
      name: 'Alternative Player 2',
      url: `https://www.2embed.cc/embed/${id}`,
      sandbox: "allow-scripts allow-same-origin allow-forms"
    },
    {
      name: 'Alternative Player 3',
      url: `https://multiembed.mov/directstream.php?video_id=${id}&tmdb=1`,
      sandbox: "allow-scripts allow-same-origin allow-forms"
    },
    {
      name: 'Backup Player',
      url: `https://embed.su/embed/movie/${id}`,
      sandbox: "allow-scripts allow-same-origin allow-forms"
    }
  ];

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
    setIsPlaying(true);
    setPlayerError(false);
    setCurrentPlayerIndex(0);
  };

  const handleClosePlayer = () => {
    setIsPlaying(false);
    setPlayerError(false);
    setCurrentPlayerIndex(0);
  };

  const handlePlayerError = () => {
    setPlayerError(true);
  };

  const switchPlayer = (index: number) => {
    setCurrentPlayerIndex(index);
    setPlayerError(false);
  };

  const nextPlayer = () => {
    if (currentPlayerIndex < videoSources.length - 1) {
      setCurrentPlayerIndex(currentPlayerIndex + 1);
      setPlayerError(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-100 via-purple-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-r from-pink-500 to-purple-600 rounded-full animate-spin flex items-center justify-center mb-4 shadow-lg">
            <Film className="w-8 h-8 text-white" />
          </div>
          <p className="text-gray-600 text-lg">Loading movie details...</p>
        </div>
      </div>
    );
  }

  if (!movie) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-100 via-purple-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Movie not found</h2>
          <Link to="/" className="text-pink-600 hover:text-pink-700">Go back home</Link>
        </div>
      </div>
    );
  }

  if (isPlaying) {
    const currentSource = videoSources[currentPlayerIndex];

    return (
      <div className="fixed inset-0 bg-black z-50">
        {/* Player Controls */}
        <div className="absolute top-4 left-4 right-4 z-10 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <span className="bg-black/70 text-white px-3 py-1 rounded-full text-sm">
              {currentSource.name}
            </span>
            {playerError && (
              <div className="flex items-center bg-red-600/90 text-white px-3 py-1 rounded-full text-sm">
                <AlertTriangle className="w-4 h-4 mr-1" />
                Player blocked
              </div>
            )}
          </div>
          <button
            onClick={handleClosePlayer}
            className="bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-colors"
            aria-label="Close Player"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Player Selection */}
        {playerError && (
          <div className="absolute bottom-4 left-4 right-4 z-10">
            <div className="bg-black/80 backdrop-blur-sm rounded-lg p-4">
              <p className="text-white text-sm mb-3">
                This player is blocked by your network. Try another source:
              </p>
              <div className="flex flex-wrap gap-2">
                {videoSources.map((source, index) => (
                  <button
                    key={index}
                    onClick={() => switchPlayer(index)}
                    className={`px-3 py-1 rounded-full text-sm transition-colors ${
                      index === currentPlayerIndex
                        ? 'bg-pink-600 text-white'
                        : 'bg-gray-600 text-white hover:bg-gray-500'
                    }`}
                  >
                    {source.name}
                  </button>
                ))}
              </div>
              {currentPlayerIndex < videoSources.length - 1 && (
                <button
                  onClick={nextPlayer}
                  className="mt-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm transition-colors"
                >
                  Try Next Player
                </button>
              )}
            </div>
          </div>
        )}

        {/* Video Player */}
        <iframe
          key={currentPlayerIndex}
          src={currentSource.url}
          className="w-full h-full border-0"
          allowFullScreen
          sandbox={currentSource.sandbox}
          title={movie.title}
          onError={handlePlayerError}
          onLoad={() => setPlayerError(false)}
          referrerPolicy="no-referrer"
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-100 via-purple-50 to-indigo-100">
      {/* Header */}
      <nav className="bg-white/80 backdrop-blur-sm border-b border-pink-200/50 sticky top-0 z-50">
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
            <Link
              to="/"
              className="flex items-center text-gray-600 hover:text-pink-600 transition-colors"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              Back to Home
            </Link>
          </div>
        </div>
      </nav>

      {/* Movie Details */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-pink-200/50 overflow-hidden">
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
                <h1 className="text-3xl font-bold text-gray-900">{movie.title}</h1>
                <div className="flex items-center bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-3 py-1 rounded-full">
                  <Star className="w-4 h-4 mr-1" />
                  {movie.vote_average.toFixed(1)}
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-4 mb-6 text-sm text-gray-600">
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
              <p className="text-gray-700 mb-8 leading-relaxed">{movie.overview}</p>

              {/* Watch Button */}
              <button
                onClick={handleWatchMovie}
                className="bg-gradient-to-r from-pink-500 to-purple-600 text-white px-8 py-4 rounded-xl font-bold text-lg hover:from-pink-600 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 flex items-center"
              >
                <Play className="w-6 h-6 mr-2" />
                Watch Now
              </button>

              {/* Network Info */}
              <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-800">
                  <strong>Having trouble?</strong> If the video doesn't load on school/work WiFi, 
                  the player will automatically try alternative sources to bypass network restrictions.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MovieDetail;