import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Play, Star, Calendar, Tv, ChevronDown, X, Info } from 'lucide-react';
import { tmdb } from '../services/tmdb';
import { TVDetails, Episode } from '../types';

const TVDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [show, setShow] = useState<TVDetails | null>(null);
  const [selectedSeason, setSelectedSeason] = useState(1);
  const [episodes, setEpisodes] = useState<Episode[]>([]);
  const [loading, setLoading] = useState(true);
  const [episodesLoading, setEpisodesLoading] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentEpisode, setCurrentEpisode] = useState<Episode | null>(null);
  const [showDescriptions, setShowDescriptions] = useState<{ [key: number]: boolean }>({});

  useEffect(() => {
    const fetchShow = async () => {
      if (!id) return;
      setLoading(true);
      try {
        const showData = await tmdb.getTVDetails(parseInt(id));
        setShow(showData);
        if (showData.seasons && showData.seasons.length > 0) {
          const firstSeason = showData.seasons.find(s => s.season_number > 0) || showData.seasons[0];
          setSelectedSeason(firstSeason.season_number);
        }
      } catch (error) {
        console.error('Failed to fetch TV show:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchShow();
  }, [id]);

  useEffect(() => {
    const fetchEpisodes = async () => {
      if (!id || selectedSeason === 0) return;
      setEpisodesLoading(true);
      try {
        const seasonData = await tmdb.getTVSeasons(parseInt(id), selectedSeason);
        setEpisodes(seasonData.episodes || []);
      } catch (error) {
        console.error('Failed to fetch episodes:', error);
      } finally {
        setEpisodesLoading(false);
      }
    };
    fetchEpisodes();
  }, [id, selectedSeason]);

  const handleWatchEpisode = (episode: Episode) => {
    setCurrentEpisode(episode);
    setIsPlaying(true);
  };

  const handleClosePlayer = () => {
    setIsPlaying(false);
    setCurrentEpisode(null);
  };

  const toggleDescription = (episodeId: number) => {
    setShowDescriptions(prev => ({
      ...prev,
      [episodeId]: !prev[episodeId]
    }));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-100 via-purple-50 to-indigo-100 flex items-center justify-center">
        <p className="text-lg text-gray-700">Loading show details...</p>
      </div>
    );
  }

  if (!show) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-100 via-purple-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Show not found</h2>
          <Link to="/" className="text-pink-600 hover:text-pink-700">Go back home</Link>
        </div>
      </div>
    );
  }

  // 🚫 Prevent redirecting with sandbox attribute
  if (isPlaying && currentEpisode) {
    const playerUrl = `https://player.videasy.net/tv/${show.id}/${currentEpisode.season_number}/${currentEpisode.episode_number}?color=fbc9ff&nextEpisode=true&episodeSelector=true&autoplayNextEpisode=true`;

    return (
      <div className="fixed inset-0 bg-black z-50">
        <div className="absolute top-4 right-4 z-10">
          <button
            onClick={handleClosePlayer}
            className="bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
        <iframe
          src={playerUrl}
          className="w-full h-full border-0"
          allowFullScreen
          title={`Playing: ${show.name} - S${currentEpisode.season_number}E${currentEpisode.episode_number}`}
          sandbox="allow-scripts allow-same-origin" // ✅ This prevents redirect
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-100 via-purple-50 to-indigo-100">
      <nav className="bg-white/80 backdrop-blur-sm border-b border-pink-200/50 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link to="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-pink-400 to-purple-500 rounded-lg flex items-center justify-center shadow-lg">
                <Tv className="w-5 h-5 text-white" />
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

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-pink-200/50 overflow-hidden mb-8">
          <div className="md:flex">
            <div className="md:flex-shrink-0">
              <img
                src={tmdb.getImageUrl(show.poster_path, 'w500')}
                alt={show.name}
                className="h-96 w-full object-cover md:h-full md:w-80"
              />
            </div>
            <div className="p-8">
              <div className="flex items-start justify-between mb-4">
                <h1 className="text-3xl font-bold text-gray-900">{show.name}</h1>
                <div className="flex items-center bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-3 py-1 rounded-full">
                  <Star className="w-4 h-4 mr-1" />
                  {show.vote_average.toFixed(1)}
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-4 mb-6 text-sm text-gray-600">
                <div className="flex items-center">
                  <Calendar className="w-4 h-4 mr-1" />
                  {new Date(show.first_air_date).getFullYear()}
                </div>
                <div>{show.number_of_seasons} Season{show.number_of_seasons !== 1 ? 's' : ''}</div>
                <div>{show.number_of_episodes} Episodes</div>
              </div>

              <div className="flex flex-wrap gap-2 mb-6">
                {show.genres.map((genre) => (
                  <span key={genre.id} className="bg-gradient-to-r from-purple-500 to-indigo-600 text-white px-3 py-1 rounded-full text-sm">
                    {genre.name}
                  </span>
                ))}
              </div>

              <p className="text-gray-700 leading-relaxed">{show.overview}</p>
            </div>
          </div>
        </div>

        {/* Episodes Section */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-pink-200/50 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Episodes</h2>
            <div className="relative">
              <select
                value={selectedSeason}
                onChange={(e) => setSelectedSeason(parseInt(e.target.value))}
                className="appearance-none bg-gradient-to-r from-pink-500 to-purple-600 text-white px-6 py-3 rounded-xl font-semibold pr-10 focus:outline-none focus:ring-2 focus:ring-pink-500 cursor-pointer"
              >
                {show.seasons
                  .filter(season => season.season_number > 0)
                  .map((season) => (
                    <option key={season.id} value={season.season_number}>
                      Season {season.season_number}
                    </option>
                  ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-white pointer-events-none" />
            </div>
          </div>

          {episodesLoading ? (
            <p className="text-center text-gray-600">Loading episodes...</p>
          ) : (
            <div className="space-y-3">
              {episodes.map((episode) => (
                <div key={episode.id} className="bg-gradient-to-br from-pink-50 to-purple-50 rounded-xl border border-pink-200/50 p-4 shadow-sm">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center space-x-3">
                      <span className="bg-gradient-to-r from-pink-500 to-purple-600 text-white px-3 py-1 rounded-full text-sm font-semibold">
                        {episode.episode_number}
                      </span>
                      <h3 className="text-gray-900 font-semibold">{episode.name}</h3>
                    </div>
                    <div className="flex space-x-2">
                      {episode.overview && (
                        <button
                          onClick={() => toggleDescription(episode.id)}
                          title="Toggle Description"
                          className="text-gray-500 hover:text-pink-600"
                        >
                          <Info className="w-4 h-4" />
                        </button>
                      )}
                      <button
                        onClick={() => handleWatchEpisode(episode)}
                        className="bg-gradient-to-r from-pink-500 to-purple-600 text-white px-3 py-2 rounded-lg hover:from-pink-600 hover:to-purple-700"
                      >
                        <Play className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {episode.air_date && (
                    <p className="text-xs text-gray-500 mt-1">
                      Aired: {new Date(episode.air_date).toLocaleDateString()}
                    </p>
                  )}

                  {showDescriptions[episode.id] && episode.overview && (
                    <p className="mt-2 text-sm text-gray-700">{episode.overview}</p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TVDetail;
