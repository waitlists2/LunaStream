import React, { useEffect, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Film, Search, Trash2, Play, Calendar, Star, ArrowLeft } from 'lucide-react';
import { watchlistService, WatchlistMovie, WatchlistTVShow } from '../services/watchlist';
import { tmdb } from '../services/tmdb';
import GlobalNavbar from './GlobalNavbar';

type CombinedItem =
  | { type: 'movie'; data: WatchlistMovie; lastActivity: number }
  | { type: 'tv'; data: WatchlistTVShow; lastActivity: number };

const Watchlist: React.FC = () => {
  const [combinedItems, setCombinedItems] = useState<CombinedItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  const loadData = () => {
    setLoading(true);
    const items = watchlistService.getCombinedWatchlist();
    setCombinedItems(items);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
    
    // Auto-import from recently viewed on first load
    const hasImported = localStorage.getItem('lunastream-watchlist-imported');
    if (!hasImported) {
      watchlistService.importFromRecentlyViewed();
      localStorage.setItem('lunastream-watchlist-imported', 'true');
      loadData(); // Reload after import
    }
  }, []);

  const clearWatchlist = () => {
    if (confirm('Are you sure you want to clear your entire watchlist?')) {
      watchlistService.clearWatchlist();
      setCombinedItems([]);
    }
  };

  const removeItem = (item: CombinedItem) => {
    if (item.type === 'movie') {
      watchlistService.removeMovieFromWatchlist(item.data.id);
    } else {
      watchlistService.removeShowFromWatchlist(item.data.id);
    }
    loadData();
  };

  const filteredItems = useMemo(() => {
    if (searchTerm === '') return combinedItems;

    return combinedItems.filter((item) => {
      if (item.type === 'movie') {
        return (item.data as WatchlistMovie).title.toLowerCase().includes(searchTerm.toLowerCase());
      }
      if (item.type === 'tv') {
        return (item.data as WatchlistTVShow).name.toLowerCase().includes(searchTerm.toLowerCase());
      }
      return false;
    });
  }, [searchTerm, combinedItems]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-100 via-purple-50 to-indigo-100 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 transition-colors duration-300">
      <GlobalNavbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                <span className="bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
                  My Watchlist
                </span>
              </h1>
              <p className="text-gray-600 dark:text-gray-200">
                {combinedItems.length} item{combinedItems.length !== 1 ? 's' : ''} in your watchlist
              </p>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search watchlist..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 bg-white/95 dark:bg-gray-800/95 backdrop-blur-md rounded-xl border border-pink-200/50 dark:border-gray-600/30 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-pink-500 transition-all duration-200"
                />
              </div>
              
              {combinedItems.length > 0 && (
                <button
                  onClick={clearWatchlist}
                  className="flex items-center space-x-2 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-xl font-medium shadow-lg hover:shadow-xl transition-all duration-200"
                >
                  <Trash2 className="w-4 h-4" />
                  <span className="hidden sm:inline">Clear All</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-20">
            <div className="w-12 h-12 bg-gradient-to-r from-pink-500 to-purple-600 rounded-full animate-spin flex items-center justify-center shadow-lg">
              <Film className="w-6 h-6 text-white" />
            </div>
          </div>
        )}

        {/* Empty State */}
        {!loading && combinedItems.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-20 h-20 bg-gradient-to-r from-pink-500 to-purple-600 rounded-full flex items-center justify-center mb-6 shadow-xl">
              <Film className="w-10 h-10 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">Your watchlist is empty</h3>
            <p className="text-gray-600 dark:text-gray-200 mb-6 text-center max-w-md">
              Start adding movies and TV shows to your watchlist by watching them or clicking the heart icon.
            </p>
            <Link
              to="/"
              className="flex items-center space-x-2 bg-gradient-to-r from-pink-500 to-purple-600 text-white px-6 py-3 rounded-xl font-semibold hover:from-pink-600 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Browse Content</span>
            </Link>
          </div>
        )}

        {/* No Search Results */}
        {!loading && combinedItems.length > 0 && filteredItems.length === 0 && (
          <div className="text-center py-20">
            <Search className="w-16 h-16 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">No results found</h3>
            <p className="text-gray-600 dark:text-gray-200">
              No items in your watchlist match "{searchTerm}".
            </p>
          </div>
        )}

        {/* Watchlist Grid */}
        {!loading && filteredItems.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
            {filteredItems.map((item, idx) => {
              const isMovie = item.type === 'movie';
              const data = item.data;
              const title = isMovie ? (data as WatchlistMovie).title : (data as WatchlistTVShow).name;
              const releaseDate = isMovie ? (data as WatchlistMovie).release_date : (data as WatchlistTVShow).first_air_date;
              const link = isMovie ? `/movie/${data.id}` : `/tv/${data.id}`;

              return (
                <div
                  key={`${item.type}-${data.id}-${idx}`}
                  className="group relative bg-white/95 dark:bg-gray-800/95 backdrop-blur-md rounded-2xl shadow-lg border border-pink-200/50 dark:border-gray-600/30 overflow-hidden hover:shadow-2xl transition-all duration-300 hover:-translate-y-1"
                >
                  <Link to={link} className="block">
                    <div className="aspect-[2/3] overflow-hidden">
                      <img
                        src={tmdb.getImageUrl(data.poster_path, 'w342')}
                        alt={title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        loading="lazy"
                      />
                    </div>
                    
                    <div className="p-4">
                      <h3 className="font-semibold text-gray-900 dark:text-gray-100 text-sm mb-2 line-clamp-2 group-hover:text-pink-600 dark:group-hover:text-pink-400 transition-colors">
                        {title}
                      </h3>
                      
                      <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 mb-2">
                        <div className="flex items-center space-x-1">
                          <Calendar className="w-3 h-3" />
                          <span>{releaseDate ? new Date(releaseDate).getFullYear() : 'N/A'}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Star className="w-3 h-3 text-yellow-500" />
                          <span>{data.vote_average.toFixed(1)}</span>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-400 dark:text-gray-500">
                          {isMovie ? 'Movie' : 'TV Show'}
                        </span>
                        <div className="flex items-center space-x-1">
                          <Play className="w-3 h-3 text-pink-500" />
                          <span className="text-xs text-pink-600 dark:text-pink-400 font-medium">Watch</span>
                        </div>
                      </div>
                    </div>
                  </Link>
                  
                  {/* Remove Button */}
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      removeItem(item);
                    }}
                    className="absolute top-2 right-2 w-8 h-8 bg-red-500/90 hover:bg-red-600 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-200 shadow-lg"
                    title="Remove from watchlist"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default Watchlist;