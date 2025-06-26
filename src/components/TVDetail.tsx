import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Play, Star, Calendar, Tv, ChevronDown, X, Info, AlertTriangle } from 'lucide-react';
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
  const [currentPlayerIndex, setCurrentPlayerIndex] = useState(0);
  const [playerError, setPlayerError] = useState(false);

  // Multiple video sources to bypass blocking
  const getVideoSources = (showId: string, season: number, episode: number) => [
    {
      name: 'Primary Player',
      url: `https://player.videasy.net/tv/${showId}/${season}/${episode}?color=fbc9ff&nextEpisode=true&episodeSelector=true&autoplayNextEpisode=true&noRedirect=true`,
      sandbox: "allow-scripts allow-same-origin allow-forms"
    },
    {
      name: 'Alternative Player 1',
      url: `https://vidsrc.to/embed/tv/${showId}/${season}/${episode}`,
      sandbox: "allow-scripts allow-same-origin allow-forms"
    },
    {
      name: 'Alternative Player 2',
      url: `https://www.2embed.cc/embedtv/${showId}&s=${season}&e=${episode}`,
      sandbox: "allow-scripts allow-same-origin allow-forms"
    },
    {
      name: 'Alternative Player 3',
      url: `https://multiembed.mov/directstream.php?video_id=${showId}&tmdb=1&s=${season}&e=${episode}`,
      sandbox: "allow-scripts allow-same-origin allow-forms"
    },
    {
      name: 'Backup Player',
      url: `https://embed.su/embed/tv/${showId}/${season}/${episode}`,
      sandbox: "allow-scripts allow-same-origin allow-forms"
    }
  ];

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
    setPlayerError(false);
    setCurrentPlayerIndex(0);
  };

  const handleClosePlayer = () => {
    setIsPlaying(false);
    setCurrentEpisode(null);
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
    if (currentPlayerIndex < 4) { // 5 sources total (0-4)
      setCurrentPlayerIndex(currentPlayerIndex + 1);
      setPlayerError(false);
    }
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
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-r from-pink-500 to-purple-600 rounded-full animate-spin flex items-center justify-center mb-4 shadow-lg">
            <Tv className="w-8 h-8 text-white" />
          </div>
          <p className="text-gray-600 text-lg">Loading show details...</p>
        </div>
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

  if (isPlaying && currentEpisode) {
    const videoSources = getVideoSources(id!, currentEpisode.season_number, currentEpisode.episode_number);
    const currentSource = videoSources[currentPlayerIndex];
    
    return (
      <div className="fixed inset-0 bg-black z-50">
        {/* Player Controls */}
        <div className="absolute top-4 left-4 right-4 z-10 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <span className="bg-black/70 text-white px-3 py-1 rounded-full text-sm">
              {currentSource.name}
            </span>
            <span className="bg-black/70 text-white px-3 py-1 rounded-full text-sm">
              S{currentEpisode.season_number}E{currentEpisode.episode_number}
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
          title={`${show.name} - S${currentEpisode.season_number}E${currentEpisode.episode_number}`}
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
        {/* Show Details */}
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
                <div>
                  {show.number_of_seasons} Season{show.number_of_seasons !== 1 ? 's' : ''}
                </div>
                <div>
                  {show.number_of_episodes} Episodes
                </div>
              </div>

              <div className="flex flex-wrap gap-2 mb-6">
                {show.genres.map((genre) => (
                  <span
                    key={genre.id}
                    className="bg-gradient-to-r from-purple-500 to-indigo-600 text-white px-3 py-1 rounded-full text-sm"
                  >
                    {genre.name}
                  </span>
                ))}
              </div>

              <p className="text-gray-700 leading-relaxed mb-6">{show.overview}</p>

              {/* Network Info */}
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-800">
                  <strong>Having trouble?</strong> If episodes don't load on school/work WiFi, 
                  the player will automatically try alternative sources to bypass network restrictions.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Season Selector & Episodes */}
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
                    <option key={season.id} value={season.season_number} className="bg-gray-800">
                      Season {season.season_number}
                    </option>
                  ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-white pointer-events-none" />
            </div>
          </div>

          {/* Episodes List */}
          {episodesLoading ? (
            <div className="text-center py-8">
              <div className="w-12 h-12 bg-gradient-to-r from-pink-500 to-purple-600 rounded-full animate-spin flex items-center justify-center mx-auto mb-4">
                <Tv className="w-6 h-6 text-white" />
              </div>
              <p className="text-gray-600">Loading episodes...</p>
            </div>
          ) : (
            <div className="space-y-3">
              {episodes.map((episode) => (
                <div
                  key={episode.id}
                  className="group bg-gradient-to-br from-pink-50 to-purple-50 rounded-xl border border-pink-200/50 overflow-hidden hover:shadow-lg transition-all duration-300"
                >
                  <div className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-3">
                        <span className="bg-gradient-to-r from-pink-500 to-purple-600 text-white px-3 py-1 rounded-full text-sm font-semibold">
                          {episode.episode_number}
                        </span>
                        <h3 className="font-semibold text-gray-900 group-hover:text-pink-600 transition-colors">
                          {episode.name}
                        </h3>
                      </div>
                      <div className="flex items-center space-x-2">
                        {episode.overview && (
                          <button
                            onClick={() => toggleDescription(episode.id)}
                            className="text-gray-500 hover:text-pink-600 transition-colors p-1"
                            title="Show description"
                          >
                            <Info className="w-5 h-5" />
                          </button>
                        )}
                        <button
                          onClick={() => handleWatchEpisode(episode)}
                          className="bg-gradient-to-r from-pink-500 to-purple-600 text-white px-3 py-1 rounded-lg font-semibold hover:from-pink-600 hover:to-purple-700 transition-colors flex items-center space-x-2"
                          title="Watch episode"
                        >
                          <Play className="w-4 h-4" />
                          <span>Watch</span>
                        </button>
                      </div>
                    </div>
                    {showDescriptions[episode.id] && episode.overview && (
                      <p className="mt-2 text-gray-700 text-sm leading-relaxed">{episode.overview}</p>
                    )}
                  </div>
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