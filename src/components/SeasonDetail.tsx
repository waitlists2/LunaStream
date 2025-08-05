import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Play, Calendar, Info, Star, Tv } from 'lucide-react';
import { tmdb } from '../services/tmdb';
import { analytics } from '../services/analytics';
import { watchlistService } from '../services/watchlist';
import GlobalNavbar from './GlobalNavbar';
import { playerConfigs, getPlayerUrl } from '../utils/playerUtils';
import { useLanguage } from './LanguageContext';
import { translations } from '../data/i18n';
import Loading from './Loading';
import { useIsMobile } from '../hooks/useIsMobile';

interface Episode {
  id: number;
  name: string;
  episode_number: number;
  season_number: number;
  air_date: string;
  overview: string;
  still_path: string | null;
  vote_average: number;
}

interface SeasonData {
  id: number;
  name: string;
  overview: string;
  poster_path: string | null;
  season_number: number;
  episodes: Episode[];
}

const SeasonDetail: React.FC = () => {
  const { id, seasonNumber } = useParams<{ id: string; seasonNumber: string }>();
  const [show, setShow] = useState<any>(null);
  const [season, setSeason] = useState<SeasonData | null>(null);
  const [loading, setLoading] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentEpisode, setCurrentEpisode] = useState<Episode | null>(null);
  const [selectedPlayer, setSelectedPlayer] = useState(playerConfigs[0].id);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [showDescriptions, setShowDescriptions] = useState<{ [key: number]: boolean }>({});
  
  const { language } = useLanguage();
  const t = translations[language];
  const isMobile = useIsMobile();

  useEffect(() => {
    const fetchData = async () => {
      if (!id || !seasonNumber) return;
      
      setLoading(true);
      try {
        const [showData, seasonData] = await Promise.all([
          tmdb.getTVDetails(parseInt(id)),
          tmdb.getTVSeasons(parseInt(id), parseInt(seasonNumber))
        ]);
        
        setShow(showData);
        setSeason(seasonData);
      } catch (error) {
        console.error('Failed to fetch season data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id, seasonNumber]);

  const handleWatchEpisode = (episode: Episode) => {
    if (!show || !id) return;

    watchlistService.addEpisodeToWatchlist(
      {
        id: show.id,
        name: show.name,
        poster_path: show.poster_path,
        first_air_date: show.first_air_date,
        vote_average: show.vote_average,
      },
      {
        id: episode.id,
        season_number: episode.season_number,
        episode_number: episode.episode_number,
        name: episode.name,
        air_date: episode.air_date,
      }
    );

    const episodeDuration = show.episode_run_time && show.episode_run_time.length > 0 
      ? show.episode_run_time[0] * 60 
      : 45 * 60;

    const newSessionId = analytics.startSession(
      'tv',
      parseInt(id),
      show.name,
      show.poster_path,
      episode.season_number,
      episode.episode_number,
      episodeDuration
    );

    setSessionId(newSessionId);
    setCurrentEpisode(episode);
    setIsPlaying(true);
  };

  const handleClosePlayer = () => {
    if (sessionId) {
      const episodeDuration = show?.episode_run_time && show.episode_run_time.length > 0 
        ? show.episode_run_time[0] * 60 
        : 45 * 60;
      const finalTime = Math.random() * episodeDuration;
      analytics.endSession(sessionId, finalTime);
      setSessionId(null);
    }
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
    return <Loading message={t.status_loading || 'Loading...'} />;
  }

  if (!season || !show) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-100 via-purple-50 to-indigo-100 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            {t.season_not_found || 'Season not found'}
          </h2>
          <Link to="/" className="text-pink-600 dark:text-pink-400 hover:underline">
            {t.error_404_go_home}
          </Link>
        </div>
      </div>
    );
  }

  if (isPlaying && currentEpisode) {
    return (
      <div className="fixed inset-0 bg-black z-50">
        {/* Player controls */}
        <div className="absolute top-6 right-6 z-10">
          <button
            onClick={handleClosePlayer}
            className="text-white hover:text-gray-300 transition-colors"
          >
            <ArrowLeft className="w-8 h-8" />
          </button>
        </div>

        <div className="absolute top-6 left-6 z-10">
          <div className="bg-black/70 backdrop-blur-md rounded-xl p-4 text-white">
            <div className="grid grid-cols-2 gap-2">
              {playerConfigs.map((config) => (
                <button
                  key={config.id}
                  onClick={() => setSelectedPlayer(config.id)}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                    selectedPlayer === config.id
                      ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white'
                      : 'bg-white/20 text-white/80 hover:bg-white/30'
                  }`}
                >
                  {config.name}
                </button>
              ))}
            </div>
          </div>
        </div>

        <iframe
          key={selectedPlayer}
          src={getPlayerUrl(selectedPlayer, id!, 'tv', currentEpisode.season_number, currentEpisode.episode_number)}
          className="w-full h-full border-0"
          allowFullScreen
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share; fullscreen"
          title={`${show.name} - S${currentEpisode.season_number}E${currentEpisode.episode_number}`}
          referrerPolicy="no-referrer"
          sandbox={['videasy', 'vidjoy'].includes(selectedPlayer) ? "allow-scripts allow-same-origin allow-presentation allow-forms" : undefined}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-100 via-purple-50 to-indigo-100 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950">
      <GlobalNavbar />
      
      <div className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 ${isMobile ? 'px-4 py-4' : ''}`}>
        {/* Back Navigation */}
        <div className="mb-6">
          <Link
            to={`/tv/${id}`}
            className="inline-flex items-center space-x-2 text-pink-600 dark:text-pink-400 hover:text-pink-700 dark:hover:text-pink-300 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>{t.back_to_show || 'Back to Show'}</span>
          </Link>
        </div>

        {/* Season Header */}
        <div className={`bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl border border-pink-200/50 dark:border-gray-700/50 overflow-hidden mb-8 ${isMobile ? 'rounded-xl' : ''}`}>
          <div className={isMobile ? 'p-4' : 'md:flex'}>
            {!isMobile && (
              <div className="md:flex-shrink-0">
                <img
                  src={tmdb.getImageUrl(season.poster_path || show.poster_path, 'w500')}
                  alt={season.name}
                  className="h-96 w-full object-cover md:h-full md:w-80"
                />
              </div>
            )}
            
            <div className={isMobile ? '' : 'p-8'}>
              {isMobile && (
                <div className="flex items-start space-x-4 mb-4">
                  <img
                    src={tmdb.getImageUrl(season.poster_path || show.poster_path, 'w200')}
                    alt={season.name}
                    className="w-20 h-28 object-cover rounded-lg"
                  />
                  <div className="flex-1">
                    <h1 className="text-xl font-bold text-gray-900 dark:text-white mb-1">
                      {show.name}
                    </h1>
                    <h2 className="text-lg font-semibold text-pink-600 dark:text-pink-400">
                      {season.name}
                    </h2>
                    <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                      {season.episodes?.length || 0} {t.episodes}
                    </p>
                  </div>
                </div>
              )}
              
              {!isMobile && (
                <>
                  <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                    {show.name}
                  </h1>
                  <h2 className="text-2xl font-semibold text-pink-600 dark:text-pink-400 mb-4">
                    {season.name}
                  </h2>
                  <p className="text-gray-600 dark:text-gray-300 mb-4">
                    {season.episodes?.length || 0} {t.episodes}
                  </p>
                </>
              )}
              
              {season.overview && (
                <p className={`text-gray-700 dark:text-gray-300 leading-relaxed ${isMobile ? 'text-sm' : ''}`}>
                  {season.overview}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Episodes List */}
        <div className={`bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl border border-pink-200/50 dark:border-gray-700/50 p-6 ${isMobile ? 'rounded-xl p-4' : ''}`}>
          <h3 className={`font-bold text-gray-900 dark:text-white mb-6 ${isMobile ? 'text-lg mb-4' : 'text-2xl'}`}>
            {t.episodes}
          </h3>
          
          <div className="space-y-3">
            {season.episodes?.map((episode) => (
              <div
                key={episode.id}
                className={`group bg-gradient-to-br from-pink-50 to-purple-50 dark:from-gray-700 dark:to-gray-600 rounded-xl border border-pink-200/50 dark:border-gray-600/50 overflow-hidden hover:shadow-lg transition-all duration-300 ${isMobile ? 'rounded-lg' : ''}`}
              >
                <div className={isMobile ? 'p-3' : 'p-4'}>
                  {isMobile ? (
                    // Mobile layout
                    <div className="space-y-3">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center space-x-3 flex-1">
                          <span className="bg-gradient-to-r from-pink-500 to-purple-600 text-white px-2 py-1 rounded-full text-xs font-semibold">
                            {episode.episode_number}
                          </span>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-semibold text-gray-900 dark:text-white text-sm truncate">
                              {episode.name}
                            </h4>
                            {episode.air_date && (
                              <p className="text-xs text-gray-500 dark:text-gray-400">
                                {new Date(episode.air_date).toLocaleDateString()}
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center space-x-1">
                          {episode.overview && (
                            <button
                              onClick={() => toggleDescription(episode.id)}
                              className="text-gray-500 dark:text-gray-400 hover:text-pink-600 dark:hover:text-pink-400 transition-colors p-1"
                            >
                              <Info className="w-4 h-4" />
                            </button>
                          )}
                          <button
                            onClick={() => handleWatchEpisode(episode)}
                            className="bg-gradient-to-r from-pink-500 to-purple-600 text-white px-3 py-1 rounded-lg font-semibold hover:from-pink-600 hover:to-purple-700 transition-colors flex items-center space-x-1"
                          >
                            <Play className="w-3 h-3" />
                            <span className="text-xs">{t.action_watch}</span>
                          </button>
                        </div>
                      </div>
                      
                      {showDescriptions[episode.id] && episode.overview && (
                        <div className="mt-2 p-3 bg-white/60 dark:bg-gray-800/60 rounded-lg border border-pink-200/30 dark:border-gray-600/30">
                          <p className="text-gray-700 dark:text-gray-300 text-xs leading-relaxed">
                            {episode.overview}
                          </p>
                        </div>
                      )}
                    </div>
                  ) : (
                    // Desktop layout
                    <>
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-3">
                          <span className="bg-gradient-to-r from-pink-500 to-purple-600 text-white px-3 py-1 rounded-full text-sm font-semibold">
                            {episode.episode_number}
                          </span>
                          <h4 className="font-semibold text-gray-900 dark:text-white group-hover:text-pink-600 dark:group-hover:text-pink-400 transition-colors">
                            {episode.name}
                          </h4>
                          {episode.air_date && (
                            <span className="text-sm text-gray-500 dark:text-gray-400">
                              • {new Date(episode.air_date).toLocaleDateString()}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center space-x-2">
                          {episode.overview && (
                            <button
                              onClick={() => toggleDescription(episode.id)}
                              className="text-gray-500 dark:text-gray-400 hover:text-pink-600 dark:hover:text-pink-400 transition-colors p-1"
                            >
                              <Info className="w-5 h-5" />
                            </button>
                          )}
                          <button
                            onClick={() => handleWatchEpisode(episode)}
                            className="bg-gradient-to-r from-pink-500 to-purple-600 text-white px-4 py-2 rounded-lg font-semibold hover:from-pink-600 hover:to-purple-700 transition-colors flex items-center space-x-2"
                          >
                            <Play className="w-4 h-4" />
                            <span>{t.action_watch}</span>
                          </button>
                        </div>
                      </div>
                      
                      {showDescriptions[episode.id] && episode.overview && (
                        <div className="mt-3 p-3 bg-white/60 dark:bg-gray-800/60 rounded-lg border border-pink-200/30 dark:border-gray-600/30">
                          <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed">
                            {episode.overview}
                          </p>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SeasonDetail;