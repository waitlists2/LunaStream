"use client";

import React, { useState, useEffect, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Search } from "lucide-react";
import { tmdb } from "../services/tmdb";
import { filterBannedContent } from "../utils/banList";
import { useLanguage } from "./LanguageContext";
import { translations } from "../data/i18n";
import type { Movie, TVShow } from "../types";
import GlobalNavbar from "./GlobalNavbar";

type MediaItem = (Movie | TVShow) & { media_type: "movie" | "tv" };
const isMovie = (item: MediaItem): item is Movie => "title" in item;

const MediaCard: React.FC<{ item: MediaItem; t: any }> = React.memo(({ item, t }) => (
  <Link to={`/${item.media_type}/${item.id}`} className="flex-shrink-0 w-28">
    {item.poster_path ? (
      <img
        src={`https://image.tmdb.org/t/p/w154${item.poster_path}`}
        alt={isMovie(item) ? item.title : item.name}
        className="w-full h-40 object-cover rounded-lg shadow"
        loading="lazy"
      />
    ) : (
      <div className="w-full h-40 bg-gray-300 dark:bg-gray-700 rounded-lg flex items-center justify-center text-xs text-gray-500 dark:text-gray-300">
        {t.no_poster || "No Poster"}
      </div>
    )}
    <p className="mt-1 text-xs text-gray-800 dark:text-gray-200 truncate">
      {isMovie(item) ? item.title : item.name}
    </p>
  </Link>
));

const HomepageMobile: React.FC = () => {
  const [query, setQuery] = useState("");
  const [trendingMovies, setTrendingMovies] = useState<MediaItem[]>([]);
  const [trendingTV, setTrendingTV] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();
  const { language } = useLanguage();
  const t = useMemo(() => translations[language] || translations.en, [language]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [moviesWeek, tvWeek] = await Promise.all([
        tmdb.getTrendingMovies(),
        tmdb.getTrendingTV(),
      ]);

      setTrendingMovies(
        filterBannedContent(moviesWeek.results ?? []).map(item => ({ ...item, media_type: "movie" }))
      );
      setTrendingTV(
        filterBannedContent(tvWeek.results ?? []).map(item => ({ ...item, media_type: "tv" }))
      );
    } catch (error) {
      console.error("Failed to fetch trending data", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const onSearch = () => {
    if (query.trim()) navigate(`/search?q=${encodeURIComponent(query.trim())}`);
  };

  const renderTrendingSection = (title: string, items: MediaItem[]) => (
    <section>
      <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-2">{title}</h2>
      <div className="flex gap-3 overflow-x-auto pb-1 scrollbar-hide">
        {loading
          ? Array.from({ length: 6 }).map((_, idx) => (
              <div
                key={`skeleton-${idx}`}
                className="flex-shrink-0 w-28 h-40 bg-gray-300 dark:bg-gray-700 rounded-lg animate-pulse"
              />
            ))
          : items.map((item) => <MediaCard key={item.id} item={item} t={t} />)}
      </div>
    </section>
  );

  return (
    <>
      <GlobalNavbar />
      <div className="min-h-screen bg-gradient-to-br from-pink-100 via-purple-50 to-indigo-100 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 px-4 py-5 space-y-6">
        {/* Search Bar */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            onSearch();
          }}
          className="relative"
        >
          <Search className="absolute top-3.5 left-3 w-5 h-5 text-gray-500 dark:text-gray-400" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t.search_placeholder}
            className="w-full pl-10 pr-4 py-3 text-sm rounded-xl bg-white dark:bg-gray-800 placeholder:text-gray-500 dark:placeholder:text-gray-400 text-gray-900 dark:text-white shadow focus:outline-none focus:ring-2 focus:ring-pink-400"
            aria-label={t.search_placeholder}
          />
        </form>

        <h1 className="text-3xl font-bold text-center bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 bg-clip-text text-transparent">
          {t.home_heading_title}
        </h1>
        <p className="text-center text-gray-700 dark:text-gray-300">
          {t.home_heading_subtitle}
        </p>


        {/* Trending Movies */}
        {renderTrendingSection(`${t.content_trending} ${t.content_movie_plural}`, trendingMovies)}

        {/* Trending TV */}
        {renderTrendingSection(`${t.content_trending} ${t.content_tv_plural}`, trendingTV)}
      </div>
    </>
  );
};

export default HomepageMobile;
