import React, { useEffect, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Film, ArrowLeft } from 'lucide-react';
import { ThemeToggle } from '../components/ThemeToggle';

type Movie = {
  id: number;
  title: string;
  poster_path: string;
  release_date?: string;
  lastWatchedAt: number;
  vote_average?: number;
};

type Episode = {
  id: number;
  season_number: number;
  episode_number: number;
  name: string;
  lastWatchedAt: number;
};

type TVGroup = {
  show: {
    id: number;
    name: string;
    poster_path: string;
    vote_average?: number;
  };
  episodes: Episode[];
};

type CombinedItem =
  | { type: 'movie'; movie: Movie; lastWatchedAt: number }
  | { type: 'tv'; show: TVGroup['show']; lastWatchedAt: number };

const WATCHED_MOVIES_KEY = 'recentlyViewedMovies';
const WATCHED_TV_KEY = 'recentlyViewedTVEpisodes';

const tmdbGetImageUrl = (path: string, size: string) =>
  `https://image.tmdb.org/t/p/${size}${path}`;

const Watchlist: React.FC = () => {
  const [combinedItems, setCombinedItems] = useState<CombinedItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  const loadData = () => {
    let movies: Movie[] = [];
    let tvEpisodes: Record<string, TVGroup> = {};

    try {
      const moviesRaw = localStorage.getItem(WATCHED_MOVIES_KEY);
      if (moviesRaw) movies = JSON.parse(moviesRaw);

      const tvRaw = localStorage.getItem(WATCHED_TV_KEY);
      if (tvRaw) tvEpisodes = JSON.parse(tvRaw);
    } catch (e) {
      console.error('Failed to parse watchlist data', e);
    }

    const tvItems: CombinedItem[] = Object.values(tvEpisodes).map((group) => ({
      type: 'tv',
      show: group.show,
      lastWatchedAt: Math.max(...group.episodes.map((ep) => ep.lastWatchedAt)),
    }));

    const movieItems: CombinedItem[] = movies.map((movie) => ({
      type: 'movie',
      movie,
      lastWatchedAt: movie.lastWatchedAt,
    }));

    const combined = [...tvItems, ...movieItems].sort(
      (a, b) => b.lastWatchedAt - a.lastWatchedAt
    );

    setCombinedItems(combined);
  };

  useEffect(() => {
    loadData();
  }, []);

  const clearWatchlist = () => {
    localStorage.removeItem(WATCHED_MOVIES_KEY);
    localStorage.removeItem(WATCHED_TV_KEY);
    setCombinedItems([]);
  };

  const filteredItems = useMemo(() => {
    if (searchTerm === '') return combinedItems;

    return combinedItems.filter((item) => {
      if (item.type === 'movie') {
        return item.movie.title.toLowerCase().includes(searchTerm.toLowerCase());
      }
      if (item.type === 'tv') {
        return item.show.name.toLowerCase().includes(searchTerm.toLowerCase());
      }
      return false;
    });
  }, [searchTerm, combinedItems]);


  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-100 via-purple-50 to-indigo-100 dark:from-black dark:via-gray-950 dark:to-black transition-colors duration-300">
      {/* Navbar */}
      <nav className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-b border-pink-200/50 dark:border-gray-700/50 sticky top-0 z-50 transition-colors duration-300">
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

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center gap-3">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white transition-colors duration-300">Your Watchlist</h1>
        </div>
        <div className="flex items-center gap-4">
          <input
            type="text"
            placeholder="Search..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-64 px-4 py-2 bg-white/50 dark:bg-gray-700/50 rounded-xl border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-pink-500 transition-colors duration-300"
          />
          <button
            onClick={clearWatchlist}
            className="bg-gradient-to-r from-pink-500 to-purple-600 text-white px-5 py-2.5 rounded-xl font-semibold hover:from-pink-600 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
          >
            Clear All
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        {combinedItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-[60vh] text-gray-500 dark:text-gray-400 transition-colors duration-300">
            <Film className="w-14 h-14 mb-4 opacity-30" />
            <p className="text-lg">Your watchlist is empty.</p>
          </div>
        ) : filteredItems.length === 0 ? (
          <p className="text-center text-gray-500 dark:text-gray-400 mt-20 transition-colors duration-300">
            No results found for &quot;{searchTerm}&quot;.
          </p>
        ) : (
          <div className="grid gap-6 grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
            {filteredItems.map((item, idx) => {
              const isMovie = item.type === 'movie';
              const data = isMovie ? item.movie : item.show;
              const link = isMovie ? `/movie/${data.id}` : `/tv/${data.id}`;

              return (
                <Link
                  key={`${item.type}-${data.id}-${idx}`}
                  to={link}
                  className="group block bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl shadow-lg border border-pink-200/50 dark:border-gray-700/50 overflow-hidden hover:shadow-2xl transition-all duration-300 hover:-translate-y-2"
                >
                  <div className="aspect-[2/3] overflow-hidden">
                    <img
                      src={tmdbGetImageUrl(data.poster_path, 'w342')}
                      alt={isMovie ? data.title : data.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      loading="lazy"
                      draggable={false}
                    />
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold text-gray-900 dark:text-white text-sm mb-2 line-clamp-2 group-hover:text-pink-600 dark:group-hover:text-pink-400 transition-colors">
                      {isMovie ? data.title : data.name}
                    </h3>
                    <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                      {isMovie && data.release_date && (
                        <span>{data.release_date.split('-')[0]}</span>
                      )}
                      {!isMovie && (
                        <span>TV Show</span>
                      )}
                      <div className="flex items-center">
                        <span className="text-yellow-500">★</span>
                        <span className="ml-1">{data.vote_average?.toFixed(1) || 'N/A'}</span>
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default Watchlist;
