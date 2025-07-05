import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  ArrowLeft, 
  Film, 
  Users, 
  Eye, 
  Clock, 
  TrendingUp, 
  Monitor, 
  BarChart3,
  Activity,
  Play,
  Tv,
  Calendar,
  RefreshCw,
  LogOut
} from 'lucide-react';
import { analytics, ViewingStats, StreamingSession } from '../services/analytics';
import ThemeToggle from './ThemeToggle';

interface AdminPanelProps {
  onLogout: () => void;
}

const AdminPanel: React.FC<AdminPanelProps> = ({ onLogout }) => {
  const [stats, setStats] = useState<ViewingStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  const fetchStats = () => {
    setLoading(true);
    try {
      const viewingStats = analytics.getViewingStats();
      setStats(viewingStats);
      setLastUpdate(new Date());
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Generate demo data on first load
    analytics.generateDemoData();
    fetchStats();

    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchStats, 30000);
    return () => clearInterval(interval);
  }, []);

  const formatDuration = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  const formatTimeAgo = (date: Date): string => {
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    return `${Math.floor(diffInSeconds / 86400)}d ago`;
  };

  if (loading && !stats) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-100 via-purple-50 to-indigo-100 dark:from-gray-900 dark:via-purple-900 dark:to-indigo-900 flex items-center justify-center transition-colors duration-300">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-r from-pink-500 to-purple-600 rounded-full animate-spin flex items-center justify-center mb-4 shadow-lg">
            <BarChart3 className="w-8 h-8 text-white" />
          </div>
          <p className="text-gray-600 dark:text-gray-300 text-lg transition-colors duration-300">Loading analytics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-100 via-purple-50 to-indigo-100 dark:from-gray-900 dark:via-purple-900 dark:to-indigo-900 transition-colors duration-300">
      {/* Header */}
      <nav className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-b border-pink-200/50 dark:border-gray-700/50 sticky top-0 z-50 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link to="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-pink-400 to-purple-500 rounded-lg flex items-center justify-center shadow-lg">
                <Film className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
                LunaStream Admin
              </span>
            </Link>
            <div className="flex items-center space-x-4">
              <button
                onClick={fetchStats}
                disabled={loading}
                className="flex items-center space-x-2 bg-gradient-to-r from-pink-500 to-purple-600 text-white px-3 py-2 rounded-lg font-semibold hover:from-pink-600 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                <span>Refresh</span>
              </button>
              <ThemeToggle />
              <button
                onClick={onLogout}
                className="flex items-center space-x-2 text-gray-600 dark:text-gray-300 hover:text-red-600 dark:hover:text-red-400 transition-colors"
              >
                <LogOut className="w-5 h-5" />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2 transition-colors duration-300">
            <span className="bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
              Analytics Dashboard
            </span>
          </h1>
          <p className="text-gray-600 dark:text-gray-300 transition-colors duration-300">
            Real-time streaming analytics and user insights
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 transition-colors duration-300">
            Last updated: {lastUpdate.toLocaleTimeString()}
          </p>
        </div>

        {stats && (
          <>
            {/* Overview Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl border border-pink-200/50 dark:border-gray-700/50 p-6 transition-colors duration-300">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-300 transition-colors duration-300">Total Views</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white transition-colors duration-300">{stats.totalViews.toLocaleString()}</p>
                  </div>
                  <div className="w-12 h-12 bg-gradient-to-r from-pink-500 to-pink-600 rounded-lg flex items-center justify-center">
                    <Eye className="w-6 h-6 text-white" />
                  </div>
                </div>
              </div>

              <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl border border-purple-200/50 dark:border-gray-700/50 p-6 transition-colors duration-300">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-300 transition-colors duration-300">Unique Viewers</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white transition-colors duration-300">{stats.uniqueViewers.toLocaleString()}</p>
                  </div>
                  <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg flex items-center justify-center">
                    <Users className="w-6 h-6 text-white" />
                  </div>
                </div>
              </div>

              <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl border border-indigo-200/50 dark:border-gray-700/50 p-6 transition-colors duration-300">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-300 transition-colors duration-300">Watch Time</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white transition-colors duration-300">{formatDuration(stats.totalWatchTime)}</p>
                  </div>
                  <div className="w-12 h-12 bg-gradient-to-r from-indigo-500 to-indigo-600 rounded-lg flex items-center justify-center">
                    <Clock className="w-6 h-6 text-white" />
                  </div>
                </div>
              </div>

              <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl border border-green-200/50 dark:border-gray-700/50 p-6 transition-colors duration-300">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-300 transition-colors duration-300">Currently Watching</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white transition-colors duration-300">{stats.currentlyWatching.length}</p>
                  </div>
                  <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-green-600 rounded-lg flex items-center justify-center">
                    <Activity className="w-6 h-6 text-white" />
                  </div>
                </div>
              </div>
            </div>

            {/* Currently Watching */}
            <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl border border-pink-200/50 dark:border-gray-700/50 p-6 mb-8 transition-colors duration-300">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center transition-colors duration-300">
                <Monitor className="w-7 h-7 mr-3 text-green-500" />
                Live Viewers ({stats.currentlyWatching.length})
              </h2>
              
              {stats.currentlyWatching.length > 0 ? (
                <div className="space-y-3">
                  {stats.currentlyWatching.map((session) => (
                    <div
                      key={session.id}
                      className="flex items-center justify-between p-4 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl border border-green-200/50 dark:border-green-700/50 transition-colors duration-300"
                    >
                      <div className="flex items-center space-x-4">
                        <div className={`w-10 h-10 bg-gradient-to-r ${session.mediaType === 'movie' ? 'from-pink-500 to-pink-600' : 'from-purple-500 to-purple-600'} rounded-lg flex items-center justify-center`}>
                          {session.mediaType === 'movie' ? (
                            <Film className="w-5 h-5 text-white" />
                          ) : (
                            <Tv className="w-5 h-5 text-white" />
                          )}
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900 dark:text-white transition-colors duration-300">
                            {session.mediaTitle}
                            {session.season && session.episode && (
                              <span className="text-sm text-gray-600 dark:text-gray-300 ml-2">
                                S{session.season}E{session.episode}
                              </span>
                            )}
                          </h3>
                          <p className="text-sm text-gray-600 dark:text-gray-300 transition-colors duration-300">
                            User: {session.userId.substring(0, 12)}... • {formatDuration(session.currentTime)} watched
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center text-green-600 dark:text-green-400 text-sm font-semibold">
                          <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></div>
                          LIVE
                        </div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 transition-colors duration-300">
                          {formatTimeAgo(session.lastActivity)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Monitor className="w-12 h-12 text-gray-400 dark:text-gray-500 mx-auto mb-4 transition-colors duration-300" />
                  <p className="text-gray-600 dark:text-gray-300 transition-colors duration-300">No one is currently watching</p>
                </div>
              )}
            </div>

            {/* Top Content */}
            <div className="grid lg:grid-cols-2 gap-8 mb-8">
              {/* Top Movies */}
              <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl border border-pink-200/50 dark:border-gray-700/50 p-6 transition-colors duration-300">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center transition-colors duration-300">
                  <Film className="w-7 h-7 mr-3 text-pink-500" />
                  Top Movies
                </h2>
                
                {stats.topMovies.length > 0 ? (
                  <div className="space-y-3">
                    {stats.topMovies.slice(0, 5).map((movie, index) => (
                      <div
                        key={movie.id}
                        className="flex items-center justify-between p-3 bg-gradient-to-r from-pink-50 to-rose-50 dark:from-pink-900/20 dark:to-rose-900/20 rounded-lg border border-pink-200/50 dark:border-pink-700/50 transition-colors duration-300"
                      >
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-gradient-to-r from-pink-500 to-pink-600 rounded-lg flex items-center justify-center text-white font-bold text-sm">
                            {index + 1}
                          </div>
                          <div>
                            <h3 className="font-semibold text-gray-900 dark:text-white transition-colors duration-300">{movie.title}</h3>
                            <p className="text-sm text-gray-600 dark:text-gray-300 transition-colors duration-300">
                              {movie.views} views • {formatDuration(movie.totalWatchTime)} total
                            </p>
                          </div>
                        </div>
                        <TrendingUp className="w-5 h-5 text-pink-500" />
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Film className="w-12 h-12 text-gray-400 dark:text-gray-500 mx-auto mb-4 transition-colors duration-300" />
                    <p className="text-gray-600 dark:text-gray-300 transition-colors duration-300">No movie data available</p>
                  </div>
                )}
              </div>

              {/* Top TV Shows */}
              <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl border border-purple-200/50 dark:border-gray-700/50 p-6 transition-colors duration-300">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center transition-colors duration-300">
                  <Tv className="w-7 h-7 mr-3 text-purple-500" />
                  Top TV Shows
                </h2>
                
                {stats.topTVShows.length > 0 ? (
                  <div className="space-y-3">
                    {stats.topTVShows.slice(0, 5).map((show, index) => (
                      <div
                        key={show.id}
                        className="flex items-center justify-between p-3 bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20 rounded-lg border border-purple-200/50 dark:border-purple-700/50 transition-colors duration-300"
                      >
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg flex items-center justify-center text-white font-bold text-sm">
                            {index + 1}
                          </div>
                          <div>
                            <h3 className="font-semibold text-gray-900 dark:text-white transition-colors duration-300">{show.title}</h3>
                            <p className="text-sm text-gray-600 dark:text-gray-300 transition-colors duration-300">
                              {show.views} views • {formatDuration(show.totalWatchTime)} total
                            </p>
                          </div>
                        </div>
                        <TrendingUp className="w-5 h-5 text-purple-500" />
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Tv className="w-12 h-12 text-gray-400 dark:text-gray-500 mx-auto mb-4 transition-colors duration-300" />
                    <p className="text-gray-600 dark:text-gray-300 transition-colors duration-300">No TV show data available</p>
                  </div>
                )}
              </div>
            </div>

            {/* Daily Stats Chart */}
            <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl border border-indigo-200/50 dark:border-gray-700/50 p-6 transition-colors duration-300">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center transition-colors duration-300">
                <BarChart3 className="w-7 h-7 mr-3 text-indigo-500" />
                7-Day Activity
              </h2>
              
              <div className="space-y-4">
                {stats.dailyStats.map((day, index) => {
                  const maxViews = Math.max(...stats.dailyStats.map(d => d.views));
                  const percentage = maxViews > 0 ? (day.views / maxViews) * 100 : 0;
                  
                  return (
                    <div key={day.date} className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="font-medium text-gray-700 dark:text-gray-300 transition-colors duration-300">
                          {new Date(day.date).toLocaleDateString('en-US', { 
                            weekday: 'short', 
                            month: 'short', 
                            day: 'numeric' 
                          })}
                        </span>
                        <span className="text-gray-600 dark:text-gray-400 transition-colors duration-300">
                          {day.views} views • {day.uniqueViewers} viewers
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 transition-colors duration-300">
                        <div
                          className="bg-gradient-to-r from-indigo-500 to-purple-600 h-3 rounded-full transition-all duration-500"
                          style={{ width: `${percentage}%` }}
                        ></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default AdminPanel;