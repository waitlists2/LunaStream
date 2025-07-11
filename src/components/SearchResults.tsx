import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Search, Film, Star, Calendar } from 'lucide-react';
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
  'gore', 'extreme gore', 'graphic violence', 'real death', 'real murder', 'snuff', 'decapitation',
  'beheading', 'dismemberment', 'execution', 'liveleak', 'necrophilia',

  'child abuse', 'child torture', 'child exploitation', 'cp', 'infant abuse', 'underage', 'pedo', 'pedophile',

  'rape', 'sexual assault', 'incest', 'bestiality', 'zoo', 'nonconsensual', 'molestation', 'forced sex', 'snuff porn', 'rape porn',

  'animal abuse', 'animal cruelty', 'animal torture',

  '9/11', 'isis execution', 'terrorist execution', 'war footage', 'massacre', 'school shooting', 'shooting video', 'torture video',

  'shockumentary', 'mondo film', 'banned horror', 'red room', 'deep web video', 'dark web', 'gore video', 'disturbing footage',

  'august underground', 'a serbian film', 'guinea pig', 'tumblr gore', 'faces of death', 'traces of death', 'cannibal holocaust',
  'human centipede 2', 'men behind the sun', 'salo 120 days of sodom', 'martyrs', 'grotesque', 'naked blood', 'snuff 102', 'vase de noces',

  'kill yourself', 'kys', 'suicide', 'how to die',
];

const preprocessQuery = (query: string): string =>
  query.toLowerCase().trim()
    .replace(/[^\w\s\-'.:]/g, ' ')
    .replace(/\s+/g, ' ')
    .replace(/\b&\b/g, 'and');

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

  const [sortBy, setSortBy] = useState<'score' | 'popularity'>(
    (searchParams.get('sort') === 'score' ? 'score' : 'popularity')
  );

  // Sync sort param from URL when it changes:
  useEffect(() => {
    const sortParam = searchParams.get('sort');
    if (sortParam === 'popularity' || sortParam === 'score') {
      setSortBy(sortParam);
    }
  }, [searchParams]);

  const initialQuery = (searchParams.get('q') || '').trim();

  const [searchInput, setSearchInput] = useState(initialQuery);
  const [query, setQuery] = useState(initialQuery);
  const [results, setResults] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [warningVisible, setWarningVisible] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  const resultsPerPage = 18;
  const totalPages = Math.ceil(results.length / resultsPerPage);
  const startIdx = (currentPage - 1) * resultsPerPage;
  const paginatedResults = results.slice(startIdx, startIdx + resultsPerPage);

  useEffect(() => {
    const handler = setTimeout(() => {
      const trimmed = searchInput.trim();
      if (trimmed !== initialQuery) {
        const newParams: Record<string, string> = {};
        if (trimmed) newParams.q = trimmed;
        if (sortBy) newParams.sort = sortBy;
        setSearchParams(newParams);
        setQuery(trimmed);
      }
    }, 300);
    return () => clearTimeout(handler);
  }, [searchInput, initialQuery, setSearchParams, sortBy]);

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
        const matches = new Map<string, { item: MediaItem; score: number }>();

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
          .sort((a, b) => {
            if (sortBy === 'popularity') {
              return b.item.popularity - a.item.popularity || a.score - b.score;
            } else {
              return a.score - b.score || b.item.popularity - a.item.popularity;
            }
          })
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

    return () => {
      isMounted = false;
    };
  }, [query, sortBy]);

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
          {/* Left side: Logo + Search */}
          <div className="flex items-center max-w-md w-full space-x-3">
            {/* Logo only, no text */}
            <Link to="/" className="flex items-center flex-shrink-0">
              <div className="w-8 h-8 bg-gradient-to-r from-pink-400 to-purple-500 rounded-lg flex items-center justify-center shadow-lg">
                <Film className="w-5 h-5 text-white" />
              </div>
            </Link>

            {/* Search bar */}
            <input
              type="text"
              placeholder="Search..."
              value={searchInput}
              onChange={handleInputChange}
              className="flex-grow px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 focus:ring-2 focus:ring-pink-400 dark:bg-gray-700 dark:text-white transition-colors"
            />
          </div>

          {/* Right side: Theme toggle */}
          <ThemeToggle />
        </div>
      </nav>

      {/* Sort control */}
      <div className="mb-4 flex items-center justify-center space-x-2 mt-4">
        <label htmlFor="sort" className="text-gray-700 dark:text-gray-300 font-semibold">
          Sort by:
        </label>
        <select
          id="sort"
          value={sortBy}
          onChange={(e) => {
            const newSort = e.target.value === 'popularity' ? 'popularity' : 'score';
            setSortBy(newSort);
            const newParams: Record<string, string> = {};
            if (query) newParams.q = query;
            newParams.sort = newSort;
            setSearchParams(newParams);
          }}
          className="rounded border border-gray-300 dark:border-gray-700 px-2 py-1 bg-white dark:bg-gray-700 dark:text-white"
        >
          <option value="popularity">Popularity</option>
          <option value="score">Relevance</option>
        </select>
      </div>

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
          </div>
        )}

        {error && (
          <div className="text-center text-red-600 dark:text-red-400 font-semibold py-10">
            {error}
          </div>
        )}

        {!loading && !error && paginatedResults.length === 0 && (
          <div className="text-center text-gray-700 dark:text-gray-300 py-10">
            No results found for &quot;{query}&quot;.
          </div>
        )}

        {!loading && !error && paginatedResults.length > 0 && (
          <ul className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
            {paginatedResults.map(item => (
              <li key={`${item.media_type}-${item.id}`} className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                <Link to={getLink(item)} className="block focus:outline-none focus:ring-2 focus:ring-pink-500">
                  {item.poster_path ? (
                    <img
                      src={`https://image.tmdb.org/t/p/w342${item.poster_path}`}
                      alt={getTitle(item)}
                      className="w-full h-auto object-cover"
                      loading="lazy"
                    />
                  ) : (
                    <div className="w-full h-48 bg-gray-300 dark:bg-gray-700 flex items-center justify-center text-gray-500 dark:text-gray-400 text-sm">
                      No Image
                    </div>
                  )}
                  <div className="p-3">
                    <h3 className="text-sm font-semibold text-gray-900 dark:text-white truncate" title={getTitle(item)}>
                      {getTitle(item)}
                    </h3>
                    <p className="text-xs text-gray-600 dark:text-gray-400 flex items-center space-x-1 mt-1">
                      <Calendar className="w-3 h-3" />
                      <span>{getDate(item) || 'N/A'}</span>
                    </p>
                    <p className="text-xs text-yellow-500 flex items-center space-x-1 mt-1">
                      <Star className="w-3 h-3" />
                      <span>{item.vote_average?.toFixed(1) || '–'}</span>
                    </p>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}

        {/* Pagination */}
        {!loading && totalPages > 1 && (
          <nav aria-label="Pagination" className="flex justify-center mt-8 space-x-2">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="px-3 py-1 rounded-md bg-pink-600 text-white disabled:bg-pink-300 focus:outline-none focus:ring-2 focus:ring-pink-500"
            >
              Previous
            </button>

            {[...Array(totalPages)].map((_, idx) => {
              const page = idx + 1;
              return (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  aria-current={currentPage === page ? 'page' : undefined}
                  className={`px-3 py-1 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500 ${
                    currentPage === page
                      ? 'bg-pink-700 text-white'
                      : 'bg-pink-300 dark:bg-pink-500 text-pink-900 dark:text-pink-100 hover:bg-pink-400'
                  }`}
                >
                  {page}
                </button>
              );
            })}

            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="px-3 py-1 rounded-md bg-pink-600 text-white disabled:bg-pink-300 focus:outline-none focus:ring-2 focus:ring-pink-500"
            >
              Next
            </button>
          </nav>
        )}
      </main>
    </div>
  );
};

export default SearchResults;
