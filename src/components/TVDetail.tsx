import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Play, Star, Calendar, Tv, ChevronDown, X, Info } from 'lucide-react';
import { tmdb } from '../services/tmdb';
import { TVDetails, Episode } from '../types';

const TVDetail: React.FC = () => {
  const { id, season: urlSeason, episode: urlEpisode } = useParams<{ 
    id: string; 
    season?: string; 
    episode?: string; 
  }>();
  const navigate = useNavigate();
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
        
        // Set initial season from URL or first available season
        if (urlSeason) {
          setSelectedSeason(parseInt(urlSeason));
        } else if (showData.seasons && showData.seasons.length > 0) {
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
  }, [id, urlSeason]);

  useEffect(() => {
    const fetchEpisodes = async () => {
      if (!id || selectedSeason === 0) return;
      
      setEpisodesLoading(true);
      try {
        const seasonData = await tmdb.getTVSeasons(parseInt(id), selectedSeason);
        setEpisodes(seasonData.episodes || []);
        
        // If URL has episode number, auto-play that episode
        if (urlEpisode && seasonData.episodes) {
          const episode = seasonData.episodes.find(ep => ep.episode_number === parseInt(urlEpisode));
          if (episode) {
            setCurrentEpisode(episode);
            setIsPlaying(true);
          }
        }
      } catch (error) {
        console.error('Failed to fetch episodes:', error);
      } finally {
        setEpisodesLoading(false);
      }
    };

    fetchEpisodes();
  }, [id, selectedSeason, urlEpisode]);

  const handleWatchEpisode = (episode: Episode) => {
    setCurrentEpisode(episode);
    setIsPlaying(true);
    // Update URL to reflect current episode with hash routing
    navigate(`/tv/${id}/${episode.season_number}/${episode.episode_number}`, { replace: true });
  };

  const handleClosePlayer = () => {
    setIsPlaying(false);
    setCurrentEpisode(null);
    // Navigate back to show page without episode
    navigate(`/tv/${id}`, { replace: true });
  };

  const handleSeasonChange = (newSeason: number) => {
    setSelectedSeason(newSeason);
    // Update URL to reflect season change
    navigate(`/tv/${id}`, { replace: true });
  };

  const getNextEpisode = (currentEp: Episode): Episode | null => {
    if (!episodes || !show) return null;
    
    // Try to find next episode in current season
    const nextInSeason = episodes.find(ep => ep.episode_number === currentEp.episode_number + 1);
    if (nextInSeason) return nextInSeason;
    
    // If no next episode in current season, try first episode of next season
    const nextSeason = show.seasons.find(s => s.season_number === currentEp.season_number + 1);
    if (nextSeason) {
      // We would need to fetch the next season's episodes, but for now return null
      // This could be enhanced to automatically load next season
      return null;
    }
    
    return null;
  };

  const handlePlayerMessage = (event: MessageEvent) => {
    // Listen for messages from the video player iframe
    if (event.origin !== 'https://player.videasy.net') return;
    
    try {
      const data = JSON.parse(event.data);
      
      if (data.type === 'nextEpisode' && currentEpisode) {
        const nextEp = getNextEpisode(currentEpisode);
        if (nextEp) {
          handleWatchEpisode(nextEp);
        }
      }
    } catch (error) {
      // Ignore parsing errors
    }
  };

  useEffect(() => {
    // Add event listener for player messages
    window.addEventListener('message', handlePlayerMessage);
    return () => window.removeEventListener('message', handlePlayerMessage);
  }, [currentEpisode, episodes, show]);

  const toggleDescription = (episodeId: number) => {
    setShowDescriptions(prev => ({
      ...prev,
      [episodeId]: !prev[episodeId]
    }));
  };

  const formatAirDate = (dateString: string) => {
    if (!dateString) return 'TBA';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
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

        {/* Enhanced Video Player with better integration */}
        <iframe
          src={`https://player.videasy.net/tv/${id}/${currentEpisode.season_number}/${currentEpisode.episode_number}?color=fbc9ff&nextEpisode=true&episodeSelector=true&autoplayNextEpisode=true&noRedirect=true&adblock=true&popup=false&origin=${encodeURIComponent(window.location.origin)}`}
          className="w-full h-full border-0"
          allowFullScreen
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share; fullscreen"
          sandbox="allow-scripts allow-same-origin allow-forms allow-popups-to-escape-sandbox"
          title={`${show.name} - S${currentEpisode.season_number}E${currentEpisode.episode_number}`}
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
                onChange={(e) => handleSeasonChange(parseInt(e.target.value))}
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
                  className={`group bg-gradient-to-br from-pink-50 to-purple-50 rounded-xl border overflow-hidden hover:shadow-lg transition-all duration-300 ${
                    currentEpisode?.id === episode.id ? 'border-pink-400 bg-gradient-to-br from-pink-100 to-purple-100' : 'border-pink-200/50'
                  }`}
                >
                  <div className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-3">
                        <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                          currentEpisode?.id === episode.id 
                            ? 'bg-gradient-to-r from-pink-600 to-purple-700 text-white' 
                            : 'bg-gradient-to-r from-pink-500 to-purple-600 text-white'
                        }`}>
                          {episode.episode_number}
                        </span>
                        <h3 className={`font-semibold transition-colors ${
                          currentEpisode?.id === episode.id 
                            ? 'text-pink-700' 
                            : 'text-gray-900 group-hover:text-pink-600'
                        }`}>
                          {episode.name}
                        </h3>
                      </div>
                      <div className="flex items-center space-x-2">
                        {(episode.overview || episode.air_date) && (
                          <button
                            onClick={() => toggleDescription(episode.id)}
                            className="text-gray-500 hover:text-pink-600 transition-colors p-1"
                            title="Show episode info"
                          >
                            <Info className="w-5 h-5" />
                          </button>
                        )}
                        <button
                          onClick={() => handleWatchEpisode(episode)}
                          className={`px-3 py-1 rounded-lg font-semibold transition-colors flex items-center space-x-2 ${
                            currentEpisode?.id === episode.id
                              ? 'bg-gradient-to-r from-pink-600 to-purple-700 text-white'
                              : 'bg-gradient-to-r from-pink-500 to-purple-600 text-white hover:from-pink-600 hover:to-purple-700'
                          }`}
                          title="Watch episode"
                        >
                          <Play className="w-4 h-4" />
                          <span>{currentEpisode?.id === episode.id ? 'Playing' : 'Watch'}</span>
                        </button>
                      </div>
                    </div>
                    {showDescriptions[episode.id] && (
                      <div className="mt-3 p-3 bg-white/60 rounded-lg border border-pink-200/30">
                        {episode.air_date && (
                          <div className="flex items-center text-sm text-gray-600 mb-2">
                            <Calendar className="w-4 h-4 mr-2" />
                            <span className="font-medium">Aired:</span>
                            <span className="ml-1">{formatAirDate(episode.air_date)}</span>
                          </div>
                        )}
                        {episode.overview && (
                          <p className="text-gray-700 text-sm leading-relaxed">{episode.overview}</p>
                        )}
                      </div>
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