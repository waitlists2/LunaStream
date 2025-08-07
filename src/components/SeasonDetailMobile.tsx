import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Play, Calendar, Star, X, Grid } from 'lucide-react';
import { tmdb } from '../services/tmdb';
import { analytics } from '../services/analytics';
import { watchlistService } from '../services/watchlist';
import { useLanguage } from './LanguageContext';
import { translations } from '../data/i18n';
import Loading from './Loading';
import { playerConfigs, getPlayerUrl } from '../utils/playerUtils';

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
  vote_average: number;
}

const SeasonDetailMobile: React.FC = () => {
  const { id, seasonNumber } = useParams<{ id: string; seasonNumber: string }>();
  const [show, setShow] = useState<any>(null);
  const [season, setSeason] = useState<SeasonData | null>(null);
  const [loading, setLoading] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentEpisode, setCurrentEpisode] = useState<Episode | null>(null);
  const [selectedPlayer, setSelectedPlayer] = useState(playerConfigs[0].id);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const { language } = useLanguage();
  const t = translations[language];

  useEffect(() => {
    const fetchData = async () => {
      if (!id || !seasonNumber) return;

      setLoading(true);
      try {
        const [showData, seasonData] = await Promise.all([
          tmdb.getTVDetails(parseInt(id)),
          tmdb.getTVSeasons(parseInt(id), parseInt(seasonNumber)),
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

    const duration = show.episode_run_time?.[0] ?? 45;
    const newSessionId = analytics.startSession(
      'tv',
      parseInt(id),
      show.name,
      show.poster_path,
      episode.season_number,
      episode.episode_number,
      duration * 60
    );

    setSessionId(newSessionId);
    setCurrentEpisode(episode);
    setIsPlaying(true);
  };

  const handleClosePlayer = () => {
    if (sessionId) {
      analytics.endSession(sessionId, Math.random() * 45 * 60);
    }
    setIsPlaying(false);
    setCurrentEpisode(null);
    setSessionId(null);
  };

  if (loading) return <Loading message={t.status_loading || 'Loading...'} />;

  if (!season || !show) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-center px-4 py-8">
        <h2 className="text-xl font-bold break-words">{t.season_not_found || 'Season not found'}</h2>
        <Link to="/" className="text-pink-600 mt-2 underline break-words">
          {t.error_404_go_home}
        </Link>
      </div>
    );
  }

  if (isPlaying && currentEpisode) {
    return (
      <div className="fixed inset-0 bg-black z-50">
        <div className="absolute top-4 right-4 z-10">
          <button onClick={handleClosePlayer} aria-label={t.close_player}>
            <X className="w-8 h-8 text-white" />
          </button>
        </div>

        <div className="absolute top-4 left-4 z-10">
          <select
            value={selectedPlayer}
            onChange={(e) => setSelectedPlayer(e.target.value)}
            className="bg-black/70 text-white px-2 py-1 rounded"
          >
            {playerConfigs.map((config) => (
              <option key={config.id} value={config.id}>
                {config.name}
              </option>
            ))}
          </select>
        </div>

        <iframe
          src={getPlayerUrl(selectedPlayer, id!, 'tv', currentEpisode.season_number, currentEpisode.episode_number)}
          className="w-full h-full border-0"
          allowFullScreen
        />
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-pink-50 to-purple-100 dark:from-gray-900 dark:to-gray-800 min-h-screen px-4 py-4">
      <Link
        to={`/tv/${id}`}
        className="inline-flex items-center text-pink-600 dark:text-pink-400 mb-4 break-words"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        {t.back_to_show}
      </Link>

      <div className="mb-4">
        <div className="flex flex-wrap gap-3">
          <img
            src={tmdb.getImageUrl(season.poster_path || show.poster_path, 'w200')}
            alt={season.name}
            className="w-24 h-36 object-cover rounded-lg"
          />
          <div className="flex-1 min-w-0 break-words overflow-wrap break-word">
            <h1 className="text-lg font-bold text-gray-900 dark:text-white break-words">
              {show.name}
            </h1>
            <h2 className="text-pink-600 dark:text-pink-400 font-semibold break-words">
              {season.name}
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-300 break-words">
              {season.episodes.length} {t.episodes}
            </p>
            {season.vote_average > 0 && (
              <div className="mt-1 text-yellow-600 text-sm flex items-center">
                <Star className="w-4 h-4 mr-1" />
                {season.vote_average.toFixed(1)}
              </div>
            )}
          </div>
        </div>
        {season.overview && (
          <p className="mt-3 text-sm text-gray-700 dark:text-gray-300 break-words overflow-wrap break-word">
            {season.overview}
          </p>
        )}
      </div>

      <div className="space-y-3">
        {season.episodes.map((ep) => (
          <div
            key={ep.id}
            className="bg-white dark:bg-gray-700 p-3 rounded-lg shadow border border-gray-200 dark:border-gray-600"
          >
            <div className="flex flex-wrap gap-3">
              <img
                src={tmdb.getImageUrl(ep.still_path || show.backdrop_path, 'w300')}
                alt={ep.name}
                className="w-24 h-16 rounded object-cover"
              />
              <div className="flex-1 min-w-0 break-words overflow-wrap break-word">
                <div className="flex flex-wrap justify-between items-center gap-2">
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-white break-words overflow-wrap break-word">
                    {ep.episode_number}. {ep.name}
                  </h3>
                  {ep.vote_average > 0 && (
                    <span className="text-xs text-yellow-500 flex items-center">
                      <Star className="w-3 h-3 mr-1" />
                      {ep.vote_average.toFixed(1)}
                    </span>
                  )}
                </div>
                {ep.air_date && (
                  <p className="text-xs text-gray-500 mt-1">
                    <Calendar className="inline w-3 h-3 mr-1" />
                    {new Date(ep.air_date).toLocaleDateString()}
                  </p>
                )}
                <p className="text-xs text-gray-600 dark:text-gray-300 mt-1 break-words overflow-wrap break-word">
                  {ep.overview}
                </p>

                {/* Button Row */}
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  <button
                    onClick={() => handleWatchEpisode(ep)}
                    className="text-xs bg-pink-600 text-white px-3 py-1 rounded-full flex items-center space-x-1"
                  >
                    <Play className="w-3 h-3" />
                    <span>{t.action_watch}</span>
                  </button>

                  <Link
                    to={`/tv/${id}/season/${ep.season_number}/episode/${ep.episode_number}`}
                    className="text-xs bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded-full text-gray-700 dark:text-gray-200 flex items-center justify-center"
                    aria-label={t.details || 'Details'}
                  >
                    <Grid className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SeasonDetailMobile;
