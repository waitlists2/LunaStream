import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Search, Film, Tv, Star, Calendar } from 'lucide-react';
import { tmdb } from '../services/tmdb';
import { Movie, TVShow } from '../types';

type MediaItem = (Movie | TVShow) & { media_type: 'movie' | 'tv' };

const SearchResults: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [results, setResults] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const query = searchParams.get('q') || '';

  useEffect(() => {
    const fetchResults = async () => {
      if (!query) return;
      
      setLoading(true);
      try {
        const [movieResults, tvResults] = await Promise.all([
          tmdb.searchMovies(query),
          tmdb.searchTV(query)
        ]);
        
        // Combine and mark media types
        const movies: MediaItem[] = (movieResults.results || []).map((movie: Movie) => ({
          ...movie,
          media_type: 'movie' as const
        }));
        
        const tvShows: MediaItem[] = (tvResults.results || []).map((show: TVShow) => ({
          ...show,
          media_type: 'tv' as const
        }));
        
        // Combine all results and sort by popularity/rating
        const allResults = [...movies, ...tvShows].sort((a, b) => b.vote_average - a.vote_average);
        
        setResults(allResults);
      } catch (error) {
        console.error('Search failed:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-100 via-purple-50 to-indigo-100">
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

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Search Results for "<span className="bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">{query}</span>"
          </h1>
          <p className="text-gray-600">
            Found {results.length} results
          </p>
        </div>

        {/* Combined Results */}
        {results.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
            {results.map((item) => (
              <Link
                key={`${item.media_type}-${item.id}`}
                to={getLink(item)}
                className="group block bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-pink-200/50 overflow-hidden hover:shadow-2xl transition-all duration-300 hover:-translate-y-1"
              >
                <div className="aspect-[2/3] overflow-hidden relative">
                  <img
                    src={tmdb.getImageUrl(item.poster_path)}
                    alt={getTitle(item)}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  {/* Media Type Badge */}
                  <div className="absolute top-2 left-2">
                    <div className={`flex items-center px-2 py-1 rounded-full text-xs font-semibold text-white shadow-lg ${
                      isMovie(item) 
                        ? 'bg-gradient-to-r from-pink-500 to-pink-600' 
                        : 'bg-gradient-to-r from-purple-500 to-purple-600'
                    }`}>
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
                  <h3 className={`font-semibold text-gray-900 text-sm mb-2 line-clamp-2 transition-colors ${
                    isMovie(item) ? 'group-hover:text-pink-600' : 'group-hover:text-purple-600'
                  }`}>
                    {getTitle(item)}
                  </h3>
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <div className="flex items-center">
                      <Calendar className="w-3 h-3 mr-1" />
                      {new Date(getReleaseDate(item)).getFullYear()}
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
        ) : !loading ? (
          <div className="text-center py-16">
            <div className="w-24 h-24 bg-gradient-to-r from-pink-300 to-purple-400 rounded-full flex items-center justify-center mx-auto mb-6 opacity-50">
              <Search className="w-12 h-12 text-white" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No results found</h3>
            <p className="text-gray-600">Try searching with different keywords</p>
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default SearchResults;