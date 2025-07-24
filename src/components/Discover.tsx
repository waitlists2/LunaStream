import React, { useState, useEffect, useCallback } from 'react';
import { Film, Tv, SlidersHorizontal, ArrowLeft, ArrowRight, TrendingUp } from 'lucide-react';
import { tmdb } from '../services/tmdb';
import { Link } from 'react-router-dom';
import GlobalNavbar from './GlobalNavbar';

interface Genre {
  id: number;
  name: string;
}

interface Movie {
  id: number;
  title: string;
  poster_path: string | null;
  release_date: string;
  vote_average: number;
  overview: string;
  backdrop_path: string | null;
}

interface TVShow {
  id: number;
  name: string;
  poster_path: string | null;
  first_air_date: string;
  vote_average: number;
  overview: string;
  backdrop_path: string | null;
}

type MediaItem = (Movie | TVShow) & { media_type?: 'movie' | 'tv' };

const Discover: React.FC = () => {
  const [mediaType, setMediaType] = useState<'movie' | 'tv' | 'all'>('movie');
  const [genres, setGenres] = useState<Genre[]>([]);
  const [selectedGenre, setSelectedGenre] = useState<number | ''>('');
  const [sortBy, setSortBy] = useState<string>('popularity.desc');
  const [results, setResults] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);

  const API_KEY = '762f9abeaf5a0a96795dee0bb3989df9'
  const BASE_URL = 'https://api.themoviedb.org/3';

  useEffect(() => {
    if (mediaType === 'all') {
      setGenres([]); // No genres for 'all'
      return;
    }
    const fetchGenres = async () => {
      try {
        const response = await fetch(`${BASE_URL}/genre/${mediaType}/list?api_key=${API_KEY}`);
        const data = await response.json();
        setGenres(data.genres);
      } catch (err) {
        console.error('Error fetching genres:', err);
        setError('Failed to load genres.');
      }
    };
    fetchGenres();
  }, [mediaType]);

  const fetchDiscoverResults = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      let params = `sort_by=${sortBy}&page=${page}`;
      if (selectedGenre && mediaType !== 'all') {
        params += `&with_genres=${selectedGenre}`;
      }

      let data;
      if (mediaType === 'movie') {
        data = await tmdb.discoverMovies(params);
      } else if (mediaType === 'tv') {
        data = await tmdb.discoverTV(params);
      } else {
        // For "all": combine movie + tv results and sort correctly based on sortBy
        const [movieData, tvData] = await Promise.all([
          tmdb.discoverMovies(params),
          tmdb.discoverTV(params),
        ]);

        let combinedResults = [
          ...movieData.results.map((m: any) => ({ ...m, media_type: 'movie' })),
          ...tvData.results.map((t: any) => ({ ...t, media_type: 'tv' })),
        ];

        // If sorting by release date, we need to handle different date fields
        if (sortBy.startsWith('release_date')) {
          combinedResults.sort((a, b) => {
            const dateA = a.media_type === 'movie' ? a.release_date : a.first_air_date;
            const dateB = b.media_type === 'movie' ? b.release_date : b.first_air_date;
            if (!dateA) return 1;
            if (!dateB) return -1;
            if (sortBy.endsWith('asc')) {
              return new Date(dateA).getTime() - new Date(dateB).getTime();
            } else {
              return new Date(dateB).getTime() - new Date(dateA).getTime();
            }
          });
        } else if (sortBy.startsWith('vote_average')) {
          combinedResults.sort((a, b) => {
            if (sortBy.endsWith('asc')) {
              return a.vote_average - b.vote_average;
            } else {
              return b.vote_average - a.vote_average;
            }
          });
        } else if (sortBy.startsWith('popularity')) {
          combinedResults.sort((a, b) => {
            if (sortBy.endsWith('asc')) {
              return a.popularity - b.popularity;
            } else {
              return b.popularity - a.popularity;
            }
          });
        } else {
          // default fallback sorting by popularity desc
          combinedResults.sort((a, b) => b.popularity - a.popularity);
        }

        data = {
          results: combinedResults,
          total_pages: Math.max(movieData.total_pages, tvData.total_pages),
        };
      }

      setResults(data.results || []);
      setTotalPages(data.total_pages);
    } catch (err) {
      console.error('Error fetching discover results:', err);
      setError('Failed to load results. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [mediaType, selectedGenre, sortBy, page]);

  useEffect(() => {
    fetchDiscoverResults();
  }, [fetchDiscoverResults]);

  const handleMediaTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setMediaType(e.target.value as 'movie' | 'tv' | 'all');
    setSelectedGenre('');
    setPage(1);
  };

  const handleGenreChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedGenre(e.target.value === '' ? '' : Number(e.target.value));
    setPage(1);
  };

  const handleSortByChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSortBy(e.target.value);
    setPage(1);
  };

  const handleNextPage = () => {
    if (page < totalPages) {
      setPage(prev => prev + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handlePrevPage = () => {
    if (page > 1) {
      setPage(prev => prev - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-100 via-purple-50 to-indigo-100 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 transition-colors duration-300">
      <GlobalNavbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-12">
        <h1 className="text-4xl font-bold text-center text-gray-900 dark:text-white mb-10">
          <span className="bg-gradient-to-r from-pink-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
            Discover {mediaType === 'all' ? 'Everything' : mediaType === 'movie' ? 'Movies' : 'TV Shows'}
          </span>
        </h1>

        {/* Filters */}
        <div className="flex flex-wrap justify-center gap-6 mb-12">
          <select onChange={handleMediaTypeChange} value={mediaType} className="px-4 py-2 rounded-lg border dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-white">
            <option value="movie">Movies</option>
            <option value="tv">TV Shows</option>
            <option value="all">All</option>
          </select>

          {mediaType !== 'all' && (
            <select onChange={handleGenreChange} value={selectedGenre} className="px-4 py-2 rounded-lg border dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-white">
              <option value="">All Genres</option>
              {genres.map(genre => (
                <option key={genre.id} value={genre.id}>{genre.name}</option>
              ))}
            </select>
          )}

          <select onChange={handleSortByChange} value={sortBy} className="px-4 py-2 rounded-lg border dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-white">
            <option value="popularity.desc">Popularity (Desc)</option>
            <option value="popularity.asc">Popularity (Asc)</option>
            <option value="vote_average.desc">Rating (Desc)</option>
            <option value="vote_average.asc">Rating (Asc)</option>
            <option value="release_date.desc">Release Date (Newest)</option>
            <option value="release_date.asc">Release Date (Oldest)</option>
          </select>
        </div>

        {/* Results */}
        {loading ? (
          <div className="text-center py-20 text-gray-700 dark:text-gray-300">Loading...</div>
        ) : error ? (
          <div className="text-center text-red-500">{error}</div>
        ) : results.length === 0 ? (
          <div className="text-center text-gray-500 dark:text-gray-400">No results found.</div>
        ) : (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
              {results.map(item => {
                const isMovie = (item.media_type || mediaType) === 'movie';
                const title = isMovie ? (item as Movie).title : (item as TVShow).name;
                const date = isMovie ? (item as Movie).release_date : (item as TVShow).first_air_date;
                return (
                  <Link key={item.id} to={`/${isMovie ? 'movie' : 'tv'}/${item.id}`} className="group bg-white/80 dark:bg-gray-800/80 rounded-xl overflow-hidden shadow hover:shadow-2xl hover:-translate-y-1 transition-all duration-300">
                    <div className="aspect-[2/3] overflow-hidden">
                      <img
                        src={tmdb.getImageUrl(item.poster_path)}
                        alt={title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                    </div>
                    <div className="p-3">
                      <h3 className="text-sm font-semibold text-gray-800 dark:text-white line-clamp-2 group-hover:text-pink-600 dark:group-hover:text-purple-400">
                        {title}
                      </h3>
                      <div className="flex justify-between mt-1 text-xs text-gray-500 dark:text-gray-400">
                        <span>{date ? new Date(date).getFullYear() : 'N/A'}</span>
                        <span>★ {item.vote_average.toFixed(1)}</span>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>

            {/* Pagination */}
            <div className="flex justify-center mt-10 gap-6">
              <button onClick={handlePrevPage} disabled={page === 1 || loading} className="px-6 py-2 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-full shadow disabled:opacity-40">
                <ArrowLeft className="inline-block mr-2" size={18} /> Prev
              </button>
              <span className="text-lg font-medium text-gray-700 dark:text-gray-300">
                Page {page} of {totalPages}
              </span>
              <button onClick={handleNextPage} disabled={page === totalPages || loading} className="px-6 py-2 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-full shadow disabled:opacity-40">
                Next <ArrowRight className="inline-block ml-2" size={18} />
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Discover;
