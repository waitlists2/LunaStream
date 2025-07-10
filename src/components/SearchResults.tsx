import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Search, Film, Tv, Star, Calendar } from 'lucide-react';
import { tmdb } from '../services/tmdb';
import Fuse from 'fuse.js';
import { Movie, TVShow } from '../types';
import ThemeToggle from './ThemeToggle';

type MediaItem = (Movie | TVShow) & { media_type: 'movie' | 'tv'; popularity: number };

const fuseOptions = {
  keys: [
    { name: 'title', weight: 0.9 },
    { name: 'name', weight: 0.9 },
    { name: 'original_title', weight: 0.7 },
    { name: 'original_name', weight: 0.7 },
    { name: 'overview', weight: 0.1 }
  ],
  threshold: 0.4,
  ignoreLocation: true,
  minMatchCharLength: 1,
  includeScore: true,
  findAllMatches: true,
  useExtendedSearch: true,
  includeMatches: true,
};

const bannedKeywords = [
  'gore',
  'extreme gore',
  'graphic violence',
  'real death',
  'real murder',
  'snuff',
  'decapitation',
  'beheading',
  'dismemberment',
  'execution',
  'liveleak',
  'necrophilia',

  'child abuse',
  'child torture',
  'child exploitation',
  'cp',
  'infant abuse',
  'underage',
  'pedo',
  'pedophile',

  'rape',
  'sexual assault',
  'incest',
  'bestiality',
  'zoo',
  'nonconsensual',
  'molestation',
  'forced sex',
  'snuff porn',
  'rape porn',

  'animal abuse',
  'animal cruelty',
  'animal torture',

  '9/11',
  'isis execution',
  'terrorist execution',
  'war footage',
  'massacre',
  'school shooting',
  'shooting video',
  'torture video',

  'shockumentary',
  'mondo film',
  'banned horror',
  'red room',
  'deep web video',
  'dark web',
  'gore video',
  'disturbing footage',

  'august underground',
  'a serbian film',
  'guinea pig',
  'tumblr gore',
  'faces of death',
  'traces of death',
  'cannibal holocaust',
  'human centipede 2',
  'men behind the sun',
  'salo 120 days of sodom',
  'martyrs',
  'grotesque',
  'naked blood',
  'snuff 102',
  'vase de noces',

  'kill yourself',
  'kys',
  'suicide',
  'how to die',
];

const preprocessQuery = (query: string): string =>
  query.toLowerCase().trim().replace(/[^\w\s\-'.:]/g, ' ').replace(/\s+/g, ' ').replace(/\b&\b/g, 'and');

const createWildcardPatterns = (query: string): string[] => {
  const patterns = [query];
  const words = query.split(' ').filter(Boolean);
  if (words.length > 1) {
    patterns.push(...words);
    for (let i = 0; i < words.length - 1; i++) {
      patterns.push(words.slice(i, i + 2).join(' '));
    }
    const fuzzyPatterns = words.flatMap(word =>
      word.length >= 3 ? [`${word}*`, `*${word}*`, word.slice(0, -1) + '*'] : [word]
    );
    patterns.push(...fuzzyPatterns);
  } else if (query.length >= 3) {
    patterns.push(`${query}*`, `*${query}*`);
  }
  return [...new Set(patterns)];
};

const SearchResults: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialQuery = (searchParams.get('q') || '').trim();

  const [searchInput, setSearchInput] = useState(initialQuery);
  const [query, setQuery] = useState(initialQuery);
  const [results, setResults] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [warningVisible, setWarningVisible] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  const resultsPerPage = 20;
  const totalPages = Math.ceil(results.length / resultsPerPage);
  const startIdx = (currentPage - 1) * resultsPerPage;
  const paginatedResults = results.slice(startIdx, startIdx + resultsPerPage);

  useEffect(() => {
    const handler = setTimeout(() => {
      const trimmed = searchInput.trim();
      if (trimmed !== initialQuery) {
        setSearchParams(trimmed ? { q: trimmed } : {});
        setQuery(trimmed);
      }
    }, 300);
    return () => clearTimeout(handler);
  }, [searchInput, initialQuery, setSearchParams]);

  useEffect(() => {
    const urlQuery = (searchParams.get('q') || '').trim();
    if (urlQuery !== searchInput) setSearchInput(urlQuery);
    if (urlQuery !== query) setQuery(urlQuery);
  }, [searchParams]);

  useEffect(() => {
    if (!query) {
      setResults([]);
      setError(null);
      setLoading(false);
      setWarningVisible(false);
      return;
    }

    let isMounted = true;
    setLoading(true);
    setError(null);
    setWarningVisible(false);

    const fetchResults = async () => {
      try {
        const processed = preprocessQuery(query);
        const [movies, shows] = await Promise.all([
          tmdb.searchMovies(processed),
          tmdb.searchTV(processed),
        ]);

        if (!isMounted) return;

        const combined: MediaItem[] = [
          ...(movies?.results || []).map(m => ({ ...m, media_type: 'movie', popularity: m.popularity || 0 })),
          ...(shows?.results || []).map(t => ({ ...t, media_type: 'tv', popularity: t.popularity || 0 })),
        ];

        const patterns = createWildcardPatterns(processed);
        const fuse = new Fuse(combined, fuseOptions);
        const matches = new Map();

        patterns.forEach((p, idx) => {
          fuse.search(p).forEach(({ item, score }) => {
            const key = `${item.media_type}-${item.id}`;
            const adjustedScore = (score ?? 0) + idx * 0.1;
            if (!matches.has(key) || matches.get(key)!.score > adjustedScore) {
              matches.set(key, { item, score: adjustedScore });
            }
          });
        });

        const finalResults = Array.from(matches.values())
          .sort((a, b) => a.score - b.score || b.item.popularity - a.item.popularity)
          .map(r => r.item);

        setResults(finalResults);
        setCurrentPage(1);

        if (bannedKeywords.some(k => query.toLowerCase().includes(k))) {
          setWarningVisible(true);
        }
      } catch (err) {
        console.error(err);
        setError('Failed to fetch search results.');
        setResults([]);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchResults();
    return () => { isMounted = false; };
  }, [query]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentPage]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchInput(e.target.value);
  };

  const isMovie = (item: MediaItem): item is Movie & { media_type: 'movie' } => item.media_type === 'movie';
  const getTitle = (item: MediaItem) => isMovie(item) ? item.title : (item as TVShow).name;
  const getDate = (item: MediaItem) => isMovie(item) ? item.release_date : (item as TVShow).first_air_date;
  const getLink = (item: MediaItem) => isMovie(item) ? `/movie/${item.id}` : `/tv/${item.id}`;

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-100 via-purple-50 to-indigo-100 dark:from-gray-900 dark:via-purple-900 dark:to-indigo-900 transition-colors duration-300">
      {/* Header */}
      <nav className="sticky top-0 z-50 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-b border-pink-200/50 dark:border-gray-700/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center h-16">
          <div className="flex-1 max-w-md">
            <input
              type="text"
              placeholder="Search..."
              value={searchInput}
              onChange={handleInputChange}
              className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 focus:ring-2 focus:ring-pink-400 dark:bg-gray-700 dark:text-white transition-colors"
            />
          </div>
          <Link to="/" className="flex items-center space-x-2 ml-4">
            <div className="w-8 h-8 bg-gradient-to-r from-pink-400 to-purple-500 rounded-lg flex items-center justify-center shadow-lg">
              <Film className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
              LunaStream
            </span>
          </Link>
          <ThemeToggle />
        </div>
      </nav>

      {/* Warning Modal */}
      {warningVisible && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[1000] flex items-center justify-center px-6">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-8 max-w-lg w-full text-center">
            <h2 className="text-3xl font-bold mb-4 text-pink-600 dark:text-pink-400">Haiii!</h2>
            <p className="mb-6 text-gray-700 dark:text-gray-300">
              Based on your search term, you might find disturbing content. Please stay safe.
            </p>
            <button
              onClick={() => setWarningVisible(false)}
              className="bg-pink-600 hover:bg-pink-700 text-white font-semibold px-6 py-3 rounded-lg shadow-lg focus:ring-4 focus:ring-pink-400"
            >
              Continue anyway
            </button>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 ${warningVisible ? 'blur-sm pointer-events-none' : ''}`}>
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Search Results for "<span className="bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">{query}</span>"
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            Showing {paginatedResults.length} of {results.length} result{results.length !== 1 ? 's' : ''}
          </p>
        </div>

        {loading && (
          <div className="flex items-center justify-center py-10">
            <div className="w-12 h-12 bg-gradient-to-r from-pink-500 to-purple-600 rounded-full animate-spin flex items-center justify-center shadow-lg">
              <Search className="w-6 h-6 text-white" />
            </div>
            <p className="ml-4 text-gray-600 dark:text-gray-300">Searching...</p>
          </div>
        )}

        {error && !loading && (
          <div className="text-center p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md">
            <p className="text-red-600 dark:text-red-400 font-semibold mb-2">{error}</p>
            <p className="text-gray-700 dark:text-gray-300">Try searching with different keywords or check your connection.</p>
          </div>
        )}

        {!loading && !error && paginatedResults.length > 0 && (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
              {paginatedResults.map(item => (
                <Link
                  key={`${item.media_type}-${item.id}`}
                  to={getLink(item)}
                  className="group bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl shadow-lg border border-pink-200/50 dark:border-gray-700/50 hover:shadow-2xl hover:-translate-y-1 transition-all overflow-hidden"
                >
                  <div className="aspect-[2/3] relative">
                    <img
                      src={tmdb.getImageUrl(item.poster_path)}
                      alt={getTitle(item)}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      loading="lazy"
                    />
                    <div className="absolute top-2 left-2">
                      <div className={`px-2 py-1 rounded-full text-xs text-white shadow-lg ${isMovie(item)
                          ? 'bg-gradient-to-r from-pink-500 to-pink-600'
                          : 'bg-gradient-to-r from-purple-500 to-purple-600'}`}>
                        {isMovie(item) ? 'Movie' : 'TV'}
                      </div>
                    </div>
                  </div>
                  <div className="p-4">
                    <h3 className="text-sm font-semibold text-gray-900 dark:text-white group-hover:text-pink-600 dark:group-hover:text-pink-400 line-clamp-2">
                      {getTitle(item)}
                    </h3>
                    <div className="flex justify-between items-center text-xs text-gray-500 dark:text-gray-400 mt-2">
                      <span className="flex items-center"><Calendar className="w-3 h-3 mr-1" />{getDate(item)?.slice(0, 4) || 'N/A'}</span>
                      <span className="flex items-center"><Star className="w-3 h-3 mr-1 text-yellow-500" />{item.vote_average.toFixed(1)}</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            {/* Pagination */}
            <div className="flex flex-wrap justify-center items-center gap-2 mt-10">
              {Array.from({ length: totalPages }, (_, i) => (
                <button
                  key={i + 1}
                  onClick={() => setCurrentPage(i + 1)}
                  className={`px-4 py-2 rounded-lg font-medium ${currentPage === i + 1
                    ? 'bg-pink-600 text-white'
                    : 'bg-white dark:bg-gray-700 text-gray-800 dark:text-white border border-gray-300 dark:border-gray-600 hover:bg-pink-100 dark:hover:bg-pink-600/30'
                    }`}
                >
                  {i + 1}
                </button>
              ))}
            </div>
          </>
        )}

        {!loading && !error && results.length === 0 && (
          <div className="text-center py-16">
            <div className="w-24 h-24 bg-gradient-to-r from-pink-300 to-purple-400 rounded-full flex items-center justify-center mx-auto mb-6 opacity-50">
              <Search className="w-12 h-12 text-white" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">No results found</h3>
            <p className="text-gray-600 dark:text-gray-300">Try different keywords or check spelling.</p>
          </div>
        )}
      </main>
    </div>
  );
};

export default SearchResults;
