import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Search, Film, Tv, Star, Calendar } from 'lucide-react';
import { tmdb } from '../services/tmdb';
import Fuse from 'fuse.js';
import { Movie, TVShow } from '../types';
import ThemeToggle from './ThemeToggle';

type MediaItem = (Movie | TVShow) & { media_type: 'movie' | 'tv'; popularity: number };

// Enhanced fuzzy search options with wildcard support
const fuseOptions = {
  keys: [
    { name: 'title', weight: 0.9 },
    { name: 'name', weight: 0.9 },
    { name: 'original_title', weight: 0.7 },
    { name: 'original_name', weight: 0.7 },
    { name: 'overview', weight: 0.1 }
  ],
  threshold: 0.4, // More lenient for wildcard matching
  ignoreLocation: true,
  minMatchCharLength: 1,
  includeScore: true,
  findAllMatches: true,
  useExtendedSearch: true, // Enable for wildcard patterns
  includeMatches: true,
};

// Updated banned keywords list
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

// Enhanced search preprocessing with wildcard support
const preprocessQuery = (query: string): string => {
  return query
    .toLowerCase()
    .trim()
    // Remove special characters but keep spaces and basic punctuation
    .replace(/[^\w\s\-'.:]/g, ' ')
    // Normalize multiple spaces
    .replace(/\s+/g, ' ')
    // Handle common abbreviations
    .replace(/\b&\b/g, 'and');
};

// Create wildcard patterns for partial matching
const createWildcardPatterns = (query: string): string[] => {
  const patterns = [query];
  const words = query.split(' ').filter(word => word.length > 0);
  
  if (words.length > 1) {
    // Add patterns for each word individually
    patterns.push(...words);
    
    // Add patterns for word combinations
    for (let i = 0; i < words.length - 1; i++) {
      patterns.push(words.slice(i, i + 2).join(' '));
    }
    
    // Add fuzzy patterns for partial words (like "family gy" -> "family guy")
    const fuzzyPatterns = words.map(word => {
      if (word.length >= 3) {
        // Create patterns for partial matches
        return [
          `${word}*`, // Prefix wildcard
          `*${word}*`, // Contains wildcard
          word.slice(0, -1) + '*', // Remove last character + wildcard
        ];
      }
      return [word];
    }).flat();
    
    patterns.push(...fuzzyPatterns);
  } else if (query.length >= 3) {
    // Single word patterns
    patterns.push(
      `${query}*`, // Prefix wildcard
      `*${query}*`, // Contains wildcard
    );
  }
  
  return [...new Set(patterns)]; // Remove duplicates
};

const SearchResults: React.FC = () => {
  const [searchParams] = useSearchParams();
  const query = (searchParams.get('q') || '').trim();

  const [results, setResults] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [warningVisible, setWarningVisible] = useState(false);

  // Check if query matches any banned keywords (case insensitive)
  const isQueryBanned = (): boolean => {
    const lowerQuery = query.toLowerCase();
    return bannedKeywords.some(keyword => lowerQuery.includes(keyword));
  };

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
        // Preprocess the query
        const processedQuery = preprocessQuery(query);
        
        // Perform primary search with original query
        const [movieResults, tvResults] = await Promise.all([
          tmdb.searchMovies(processedQuery),
          tmdb.searchTV(processedQuery),
        ]);

        if (!isMounted) return;

        const movieItems: Movie[] = movieResults?.results || [];
        const tvItems: TVShow[] = tvResults?.results || [];

        const combinedResults: MediaItem[] = [
          ...movieItems.map(m => ({
            ...m,
            media_type: 'movie' as const,
            popularity: m.popularity || 0,
          })),
          ...tvItems.map(t => ({
            ...t,
            media_type: 'tv' as const,
            popularity: t.popularity || 0,
          })),
        ];

        // Create wildcard patterns for enhanced matching
        const wildcardPatterns = createWildcardPatterns(processedQuery);
        const fuse = new Fuse(combinedResults, fuseOptions);
        
        // Search with multiple patterns and combine results
        const allMatches = new Map<number, { item: MediaItem; score: number; pattern: string }>();
        
        wildcardPatterns.forEach((pattern, index) => {
          const patternResults = fuse.search(pattern);
          patternResults.forEach(result => {
            const key = `${result.item.media_type}-${result.item.id}`;
            const score = (result.score || 0) + (index * 0.1); // Prefer exact matches
            
            if (!allMatches.has(result.item.id) || allMatches.get(result.item.id)!.score > score) {
              allMatches.set(result.item.id, {
                item: result.item,
                score,
                pattern
              });
            }
          });
        });

        // Sort by relevance score and popularity
        const finalResults = Array.from(allMatches.values())
          .sort((a, b) => {
            // Sort by score first (lower is better), then by popularity
            const scoreDiff = a.score - b.score;
            if (Math.abs(scoreDiff) > 0.05) {
              return scoreDiff;
            }
            return b.item.popularity - a.item.popularity;
          })
          .map(r => r.item)
          .slice(0, 40); // Increased limit for better wildcard results

        setResults(finalResults);

        if (isQueryBanned()) {
          setWarningVisible(true);
        }
      } catch (err) {
        if (!isMounted) return;
        console.error('Search failed:', err);
        setError('Failed to fetch search results. Please try again.');
        setResults([]);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchResults();

    return () => {
      isMounted = false;
    };
  }, [query]);

  const isMovie = (item: MediaItem): item is MediaItem & Movie => {
    return item.media_type === 'movie';
  };

  const getTitle = (item: MediaItem) => {
    return isMovie(item) ? item.title : (item as TVShow).name;
  };

  const getReleaseDate = (item: MediaItem) => {
    return isMovie(item) ? item.release_date : (item as TVShow).first_air_date;
  };

  const getLink = (item: MediaItem) => {
    return isMovie(item) ? `/movie/${item.id}` : `/tv/${item.id}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-100 via-purple-50 to-indigo-100 dark:from-gray-900 dark:via-purple-900 dark:to-indigo-900 flex items-center justify-center transition-colors duration-300">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-r from-pink-500 to-purple-600 rounded-full animate-spin flex items-center justify-center mb-4 shadow-lg">
            <Search className="w-8 h-8 text-white" />
          </div>
          <p className="text-gray-600 dark:text-gray-300 text-lg transition-colors duration-300">Searching for "{query}"...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-100 via-purple-50 to-indigo-100 dark:from-gray-900 dark:via-purple-900 dark:to-indigo-900 transition-colors duration-300">
        <div className="text-center max-w-md p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md transition-colors duration-300">
          <p className="text-red-600 dark:text-red-400 text-lg font-semibold mb-4">{error}</p>
          <p className="text-gray-700 dark:text-gray-300">Try searching with different keywords or check your connection.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-100 via-purple-50 to-indigo-100 dark:from-gray-900 dark:via-purple-900 dark:to-indigo-900 relative transition-colors duration-300">
      {/* Header */}
      <nav className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-b border-pink-200/50 dark:border-gray-700/50 sticky top-0 z-50 transition-colors duration-300">
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
            <ThemeToggle />
          </div>
        </div>
      </nav>

      {/* WARNING MODAL */}
      {warningVisible && (
        <div
          aria-live="assertive"
          role="alertdialog"
          aria-modal="true"
          tabIndex={-1}
          className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[1000] flex items-center justify-center px-6"
        >
          <div className="bg-white dark:bg-gray-800 rounded-xl p-8 max-w-lg w-full shadow-lg text-center transition-colors duration-300">
            <h2 className="text-3xl font-bold mb-4 text-pink-600 dark:text-pink-400">Haiii!</h2>
            <p className="mb-6 text-gray-700 dark:text-gray-300 text-lg leading-relaxed">
              Based on your search term, you might find a TV show or movie that could be highly disturbing! Please stay safe.
            </p>
            <button
              onClick={() => setWarningVisible(false)}
              className="bg-pink-600 hover:bg-pink-700 text-white font-semibold px-6 py-3 rounded-lg shadow-lg transition-colors focus:outline-none focus:ring-4 focus:ring-pink-400"
            >
              Continue anyway
            </button>
          </div>
        </div>
      )}

      {/* CONTENT BELOW - blur and disable interaction if warning visible */}
      <main
        className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 transition-filter duration-300 ${
          warningVisible ? 'blur-sm pointer-events-none select-none' : ''
        }`}
        aria-hidden={warningVisible}
      >
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2 transition-colors duration-300">
            Search Results for "<span className="bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">{query}</span>"
          </h1>
          <p className="text-gray-600 dark:text-gray-300 transition-colors duration-300">
            Found {results.length} result{results.length !== 1 ? 's' : ''}
          </p>
        </div>

        {results.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
            {results.map(item => (
              <Link
                key={`${item.media_type}-${item.id}`}
                to={getLink(item)}
                className="group block bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl shadow-lg border border-pink-200/50 dark:border-gray-700/50 overflow-hidden hover:shadow-2xl transition-all duration-300 hover:-translate-y-1"
                aria-label={`View details for ${getTitle(item)}`}
              >
                <div className="aspect-[2/3] overflow-hidden relative">
                  <img
                    src={tmdb.getImageUrl(item.poster_path)}
                    alt={getTitle(item)}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    loading="lazy"
                  />
                  {/* Media Type Badge */}
                  <div className="absolute top-2 left-2">
                    <div
                      className={`flex items-center px-2 py-1 rounded-full text-xs font-semibold text-white shadow-lg ${
                        isMovie(item)
                          ? 'bg-gradient-to-r from-pink-500 to-pink-600'
                          : 'bg-gradient-to-r from-purple-500 to-purple-600'
                      }`}
                    >
                      {isMovie(item) ? (
                        <>
                          <Film className="w-3 h-3 mr-1" />
                          Movie
                        </>
                      ) : (
                        <>
                          <Tv className="w-3 h-3 mr-1" />
                          TV
                        </>
                      )}
                    </div>
                  </div>
                </div>
                <div className="p-4">
                  <h3
                    className={`font-semibold text-gray-900 dark:text-white text-sm mb-2 line-clamp-2 transition-colors ${
                      isMovie(item) ? 'group-hover:text-pink-600 dark:group-hover:text-pink-400' : 'group-hover:text-purple-600 dark:group-hover:text-purple-400'
                    }`}
                  >
                    {getTitle(item)}
                  </h3>
                  <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                    <div className="flex items-center">
                      <Calendar className="w-3 h-3 mr-1" />
                      {getReleaseDate(item) ? new Date(getReleaseDate(item)).getFullYear() : 'N/A'}
                    </div>
                    <div className="flex items-center">
                      <Star className="w-3 h-3 mr-1 text-yellow-500" />
                      {(item.vote_average ?? 0).toFixed(1)}
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          !loading && (
            <div className="text-center py-16">
              <div className="w-24 h-24 bg-gradient-to-r from-pink-300 to-purple-400 rounded-full flex items-center justify-center mx-auto mb-6 opacity-50">
                <Search className="w-12 h-12 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2 transition-colors duration-300">No results found</h3>
              <p className="text-gray-600 dark:text-gray-300 transition-colors duration-300">Try searching with different keywords or check spelling</p>
            </div>
          )
        )}
      </main>
    </div>
  );
};

export default SearchResults;