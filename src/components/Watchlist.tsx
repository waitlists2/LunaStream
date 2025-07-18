import React, { useEffect, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Film } from 'lucide-react';

type Movie = {
  id: number;
  title: string;
  poster_path: string;
  release_date?: string;
  lastWatchedAt: number;
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
  };
  episodes: Episode[];
};

type CombinedItem =
  | { type: 'movie'; movie: Movie; lastWatchedAt: number }
  | { type: 'tv'; show: TVGroup['show']; lastWatchedAt: number };

const WL_MOVIES_KEY = 'watchlistMovies';
const WL_TV_KEY = 'watchlistTV';

const tmdbGetImageUrl = (path: string, size: string) =>
  `https://image.tmdb.org/t/p/${size}${path}`;

const Watchlist: React.FC = () => {
  const [combinedItems, setCombinedItems] = useState<CombinedItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  const loadData = () => {
    let movies: Movie[] = [];
    let tvEpisodes: Record<string, TVGroup> = {};

    try {
      const moviesRaw = localStorage.getItem(WL_MOVIES_KEY);
      if (moviesRaw) movies = JSON.parse(moviesRaw);

      const tvRaw = localStorage.getItem(WL_TV_KEY);
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
    localStorage.removeItem(WL_MOVIES_KEY);
    localStorage.removeItem(WL_TV_KEY);
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
    <div className="min-h-screen w-full flex flex-col bg-gradient-to-b from-black via-gray-900 to-black text-white">
      {/* Navbar */}
      <header className="sticky top-0 z-20 flex items-center justify-between px-6 py-4 backdrop-blur-md bg-black/70 border-b border-gray-800">
        <Link to="/vault" className="flex items-center gap-3">
          <div className="w-9 h-9 bg-gradient-to-br from-blue-500 to-purple-700 rounded-lg flex items-center justify-center shadow-md">
            <Film className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-semibold tracking-tight bg-gradient-to-r from-blue-400 to-purple-600 bg-clip-text text-transparent">
            LunaVault
          </span>
        </Link>
        <div className="flex items-center gap-4">
          <input
            type="text"
            placeholder="Search..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-64 px-4 py-2 bg-black/30 backdrop-blur-md rounded-xl placeholder-gray-400 text-sm border border-white/10 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
          />
          <button
            onClick={clearWatchlist}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-blue-500 to-purple-700 hover:from-red-600 hover:to-pink-700 text-sm font-medium shadow-md hover:shadow-lg transition-all"
          >
            Clear All
          </button>
        </div>
      </header>


      {/* Content */}
      <main className="flex-grow px-6 py-8 overflow-y-auto">
        {combinedItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-[60vh] text-gray-500">
            <Film className="w-14 h-14 mb-4 opacity-30" />
            <p className="text-lg">Your watchlist is empty.</p>
          </div>
        ) : filteredItems.length === 0 ? (
          <p className="text-center text-gray-500 mt-20">
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
                  className="group relative rounded-xl overflow-hidden bg-gradient-to-br from-blue-500/20 via-purple-700/20 to-black/20 hover:from-blue-500/30 hover:to-purple-700/30 transition shadow-lg hover:shadow-2xl border border-white/10 backdrop-blur-lg"
                >
                  <img
                    src={tmdbGetImageUrl(data.poster_path, 'w342')}
                    alt={isMovie ? data.title : data.name}
                    className="aspect-[2/3] overflow-hidden object-cover group-hover:scale-105 transition-transform duration-500 rounded-xl"
                    loading="lazy"
                    draggable={false}
                  />
                  <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent">
                    <p className="text-sm font-medium truncate bg-gradient-to-r from-blue-400 to-purple-600 bg-clip-text text-transparent group-hover:from-blue-300 group-hover:to-purple-500 transition-colors">
                      {isMovie ? data.title : data.name}
                    </p>
                    {isMovie && data.release_date && (
                      <p className="text-xs text-gray-400 mt-1">
                        {data.release_date.split('-')[0]}
                      </p>
                    )}
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
};

export default Watchlist;
