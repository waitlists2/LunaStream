import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Play,
  Star,
  Calendar,
  Clock,
  Film,
  X
} from 'lucide-react';
import { tmdb } from '../services/tmdb';
import { TVDetails, Season } from '../types';

const TVDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [tvShow, setTvShow] = useState<TVDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const [selectedSeason, setSelectedSeason] = useState<Season | null>(null);

  useEffect(() => {
    const fetchTVShow = async () => {
      if (!id) return;
      setLoading(true);
      try {
        const tvData = await tmdb.getTVDetails(parseInt(id));
        setTvShow(tvData);
        setSelectedSeason(tvData.seasons[0] || null);
      } catch (error) {
        console.error('Failed to fetch TV show:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchTVShow();
  }, [id]);

  const handleWatchTV = () => {
    setIsPlaying(true);
  };

  const handleClosePlayer = () => {
    setIsPlaying(false);
  };

  // Fix: season selector text display issue
  // We'll ensure the option text renders correctly and season id is stored properly

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-100 via-purple-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-r from-pink-500 to-purple-600 rounded-full animate-spin flex items-center justify-center mb-4 shadow-lg">
            <Film className="w-8 h-8 text-white" />
          </div>
          <p className="text-gray-600 text-lg">Loading TV show details...</p>
        </div>
      </div>
    );
  }

  if (!tvShow) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-100 via-purple-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">TV show not found</h2>
          <Link to="/" className="text-pink-600 hover:text-pink-700">Go back home</Link>
        </div>
      </div>
    );
  }

  if (isPlaying && selectedSeason) {
    // Use noRedirect=true in player URL to avoid URL changes on selection
    // Also pass season number, play from first episode (1)
    const playerUrl = `https://player.videasy.net/tv/${tvShow.id}?color=fbc9ff&season=${selectedSeason.season_number}&episode=1&nextEpisode=true&episodeSelector=true&autoplayNextEpisode=true&noRedirect=true`;

    return (
      <div className="fixed inset-0 bg-black z-50">
        <div className="absolute top-4 right-4 z-10">
          <button
            onClick={handleClosePlayer}
            className="bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-colors"
            aria-label="Close Player"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
        <iframe
          src={playerUrl}
          className="w-full h-full border-0"
          allowFullScreen
          sandbox="allow-scripts allow-same-origin"
          title={`${tvShow.name} - Season ${selectedSeason.season_number}`}
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

      {/* TV Details */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-pink-200/50 overflow-hidden">
          <div className="md:flex">
            {/* Poster */}
            <div className="md:flex-shrink-0">
              <img
                src={tmdb.getImageUrl(tvShow.poster_path, 'w500')}
                alt={tvShow.name}
                className="h-96 w-full object-cover md:h-full md:w-80"
              />
            </div>

            {/* Content */}
            <div className="p-8">
              <div className="flex items-start justify-between mb-4">
                <h1 className="text-3xl font-bold text-gray-900">{tvShow.name}</h1>
                <div className="flex items-center bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-3 py-1 rounded-full">
                  <Star className="w-4 h-4 mr-1" />
                  {tvShow.vote_average.toFixed(1)}
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-4 mb-6 text-sm text-gray-600">
                <div className="flex items-center">
                  <Calendar className="w-4 h-4 mr-1" />
                  {new Date(tvShow.first_air_date).getFullYear()}
                </div>
                <div className="flex items-center">
                  <Clock className="w-4 h-4 mr-1" />
                  {tvShow.episode_run_time.length > 0
                    ? `${tvShow.episode_run_time[0]} minutes`
                    : 'N/A'}
                </div>
              </div>

              {/* Genres */}
              <div className="flex flex-wrap gap-2 mb-6">
                {tvShow.genres.map((genre) => (
                  <span
                    key={genre.id}
                    className="bg-gradient-to-r from-pink-500 to-purple-600 text-white px-3 py-1 rounded-full text-sm"
                  >
                    {genre.name}
                  </span>
                ))}
              </div>

              {/* Overview */}
              <p className="text-gray-700 mb-6 leading-relaxed">{tvShow.overview}</p>

              {/* Season Selector */}
              <div className="mb-8">
                <label htmlFor="season-select" className="block text-gray-900 font-semibold mb-2">
                  Select Season
                </label>
                <select
                  id="season-select"
                  className="w-full max-w-xs rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-pink-500"
                  value={selectedSeason?.season_number ?? ''}
                  onChange={(e) => {
                    const seasonNum = Number(e.target.value);
                    const season = tvShow.seasons.find(s => s.season_number === seasonNum) || null;
                    setSelectedSeason(season);
                  }}
                >
                  {tvShow.seasons.map((season) => (
                    <option key={season.id} value={season.season_number}>
                      {season.name || `Season ${season.season_number}`}
                    </option>
                  ))}
                </select>
              </div>

              {/* Watch Button */}
              <button
                onClick={handleWatchTV}
                className="bg-gradient-to-r from-pink-500 to-purple-600 text-white px-8 py-4 rounded-xl font-bold text-lg hover:from-pink-600 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 flex items-center"
              >
                <Play className="w-6 h-6 mr-2" />
                Watch Now
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TVDetail;
