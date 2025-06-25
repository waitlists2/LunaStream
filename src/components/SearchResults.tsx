import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Search, Film, Tv, Star, Calendar } from 'lucide-react';
import { tmdb } from '../services/tmdb';
import Fuse from 'fuse.js';
import { Movie, TVShow } from '../types';

type MediaItem = (Movie | TVShow) & { media_type: 'movie' | 'tv'; popularity: number };

const fuseOptions = {
  keys: ['title', 'name', 'overview'], // search in movie title or tv show name and overview
  threshold: 0.4, // fuzzy match threshold (0 = exact, 1 = match anything)
  ignoreLocation: true,
  minMatchCharLength: 2,
};

// Extensive banned keywords list (case insensitive matching)
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
  'ritual killing',
];

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
    setWarningVisible(false); // reset warning when query changes

    const fetchResults = async () => {
      try {
        const [movieResults, tvResults] = await Promise.all([
          tmdb.searchMovies(query),
          tmdb.searchTV(query),
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

        const fuse = new Fuse(combinedResults, fuseOptions);
        const fuzzyResults = query.length >= 2 ? fuse.search(query) : combinedResults.map(r => ({ item: r }));

        const finalResults = fuzzyResults
          .map(res => res.item)
          .sort((a, b) => b.popularity - a.popularity);

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
      <div className="min-h-screen bg-gradient-to-br from-pink-100 via-purple-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-r from-pink-500 to-purple-600 rounded-full animate-spin flex items-center justify-center mb-4 shadow-lg">
            <Search className="w-8 h-8 text-white" />
          </div>
          <p className="text-gray-600 text-lg">Searching for "{query}"...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-100 via-purple-50 to-indigo-100">
        <div className="text-center max-w-md p-6 bg-white rounded-lg shadow-md">
          <p className="text-red-600 text-lg font-semibold mb-4">{error}</p>
          <p className="text-gray-700">Try searching with different keywords or check your connection.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-100 via-purple-50 to-indigo-100 relative">
      {/* Header */}
      <nav className="bg-white/80 backdrop-blur-sm border-b border-pink-200/50 sticky top-0 z-50">
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
          </div>
        </div>
      </nav>

      {/* WARNING OVERLAY */}
      {warningVisible && (
        <div
          aria-live="assertive"
          role="alert"
          className="fixed inset-0 bg-black/80 z-[1000] flex flex-col items-center justify-center px-6 text-center text-white"
        >
          <h2 className="text-3xl font-bold mb-4">Haiii!</h2>
          <p className="mb-6 max-w-lg text-lg leading-relaxed">
            Based on your search term, you might find a TV show or movie that could be highly disturbing! Please stay safe.
          </p>
          <button
            onClick={() => setWarningVisible(false)}
            className="bg-pink-600 hover:bg-pink-700 text-white font-semibold px-6 py-3 rounded-lg shadow-lg transition-colors"
          >
            Continue anyway
          </button>
        </div>
      )}

      {/* CONTENT BELOW - Blur & disable interaction if warning visible */}
      <main
        className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 transition-filter duration-300 ${
          warningVisible ? 'blur-sm pointer-events-none select-none' : ''
        }`}
        aria-hidden={warningVisible}
      >
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Search Results for "<span className="bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">{query}</span>"
          </h1>
          <p className="text-gray-600">
            Found {results.length} result{results.length !== 1 ? 's' : ''} (sorted by popularity)
          </p>
        </div>

        {results.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
            {results.map(item => (
              <Link
                key={`${item.media_type}-${item.id}`}
                to={getLink(item)}
                className="group block bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-pink-200/50 overflow-hidden hover:shadow-2xl transition-all duration-300 hover:-translate-y-1"
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
                    className={`font-semibold text-gray-900 text-sm mb-2 line-clamp-2 transition-colors ${
                      isMovie(item) ? 'group-hover:text-pink-600' : 'group-hover:text-purple-600'
                    }`}
                  >
                    {getTitle(item)}
                  </h3>
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <div className="flex items-center">
                      <Calendar className="w-3 h-3 mr-1" />
                      {getReleaseDate(item) ? new Date(getReleaseDate(item)).getFullYear() : 'N/A'}
                    </div>
                    <div className="flex items-center">
                      <Star className="w-3 h-3 mr-1 text-yellow-500" />
                      {item.vote_average.toFixed(1)}
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
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No results found</h3>
              <p className="text-gray-600">Try searching with different keywords</p>
            </div>
          )
        )}
      </main>
    </div>
  );
};

export default SearchResults;
