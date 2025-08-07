"use client"

import React, { useState, useEffect } from "react"
import { useParams, Link } from "react-router-dom"
import { Play, Star, Calendar, Clock, Heart, ChevronDown, Tv, Info, ChevronLeft, Share2, Download, MoreVertical, Grid } from "lucide-react"
import { tmdb } from "../services/tmdb"
import { analytics } from "../services/analytics"
import type { TVDetails, Episode } from "../types"
import { watchlistService } from "../services/watchlist"
import GlobalNavbar from "./GlobalNavbar"
import { playerConfigs, getPlayerUrl } from "../utils/playerUtils"
import { useLanguage } from "./LanguageContext"
import { translations } from "../data/i18n"
import Loading from "./Loading"
import { useIsMobile } from "../hooks/useIsMobile"
import HybridTVHeader from "./HybridTVHeader"

const TVDetailMobile: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const [show, setShow] = useState<TVDetails | null>(null)
  const [selectedSeason, setSelectedSeason] = useState(1)
  const [episodes, setEpisodes] = useState<Episode[]>([])
  const [loading, setLoading] = useState(true)
  const [episodesLoading, setEpisodesLoading] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentEpisode, setCurrentEpisode] = useState<Episode | null>(null)
  const [isFavorited, setIsFavorited] = useState(false)
  const [cast, setCast] = useState<any[]>([])
  const [selectedPlayer, setSelectedPlayer] = useState(playerConfigs[0].id)
  const [showFullDescription, setShowFullDescription] = useState(false)
  const [activeTab, setActiveTab] = useState<'episodes' | 'cast' | 'similar'>('episodes')
  const { language } = useLanguage()
  const isMobile = useIsMobile()
  const [sessionId, setSessionId] = useState<string | null>(null);

  const t = translations[language as keyof typeof translations] as Record<string, string>

  useEffect(() => {
    const fetchShow = async () => {
      if (!id) return
      setLoading(true)
      try {
        const showData = await tmdb.getTVDetails(Number(id))
        setShow(showData)
        if (showData.seasons && showData.seasons.length > 0) {
          const firstSeason = showData.seasons?.find((s: any) => s.season_number > 0) || showData.seasons[0]
          setSelectedSeason(firstSeason.season_number)
        }
      } catch (error) {
        console.error("Failed to fetch TV show:", error)
      } finally {
        setLoading(false)
      }
    }
    fetchShow()
  }, [id])

  useEffect(() => {
    const fetchEpisodes = async () => {
      if (!id || selectedSeason === 0) return
      setEpisodesLoading(true)
      try {
        const seasonData = await tmdb.getTVSeasons(Number(id), selectedSeason)
        setEpisodes(seasonData.episodes || [])
      } catch (error) {
        console.error("Failed to fetch episodes:", error)
      } finally {
        setEpisodesLoading(false)
      }
    }
    fetchEpisodes()
  }, [id, selectedSeason])

  useEffect(() => {
    if (!show) return
    const favorites = JSON.parse(localStorage.getItem("favoriteShows") || "[]")
    const isFav = favorites.some((fav: any) => fav.id === show.id)
    setIsFavorited(isFav)
  }, [show])

  useEffect(() => {
    if (!show?.id) return
    const fetchCredits = async () => {
      const credits = await tmdb.getTVCredits(show.id)
      setCast(credits.cast || [])
    }
    fetchCredits()
  }, [show?.id])

  const toggleFavorite = () => {
    if (!show) return
    const favorites = JSON.parse(localStorage.getItem("favoriteShows") || "[]")
    const index = favorites.findIndex((fav: any) => fav.id === show.id)

    if (index !== -1) {
      favorites.splice(index, 1)
      setIsFavorited(false)
    } else {
      favorites.unshift(show)
      setIsFavorited(true)
    }
    localStorage.setItem("favoriteShows", JSON.stringify(favorites))
  }

  const handleWatchEpisode = (episode: Episode) => {
    if (show && id) {
      watchlistService.addEpisodeToWatchlist(show, episode)
      
      const newSessionId = analytics.startSession(
        "tv",
        Number(id),
        show.name,
        show.poster_path,
        episode.season_number,
        episode.episode_number,
        45 * 60
      )
      setSessionId(newSessionId)
      setCurrentEpisode(episode)
      setIsPlaying(true)
    }
  }

  const handleClosePlayer = () => {
    if (sessionId) {
      analytics.endSession(sessionId, 30 * 60)
      setSessionId(null)
    }
    setIsPlaying(false)
    setCurrentEpisode(null)
  }

  const formatAirDate = (dateString: string) => {
    if (!dateString) return "TBA"
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric"
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-100 via-purple-50 to-indigo-100 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950">
        <GlobalNavbar />
        <div className="flex items-center justify-center h-screen">
          <Loading message={t.status_loading_show_details || 'Loading show details...'} />
        </div>
      </div>
    )
  }

  if (!show) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-100 via-purple-50 to-indigo-100 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950">
        <GlobalNavbar />
        <div className="flex items-center justify-center h-screen">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">{t.tv_not_found || 'Show not found'}</h2>
            <Link to="/" className="text-pink-600 dark:text-pink-400">Go Home</Link>
          </div>
        </div>
      </div>
    )
  }

  if (isPlaying && currentEpisode) {
    return (
      <div className="fixed inset-0 bg-black z-50">
        <div className="absolute top-4 left-4 z-10">
          <button
            onClick={handleClosePlayer}
            className="text-white bg-black/50 rounded-full p-2"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
        </div>
        <iframe
          src={getPlayerUrl(selectedPlayer, id!, "tv", currentEpisode.season_number, currentEpisode.episode_number)}
          className="w-full h-full"
          allowFullScreen
        />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-100 via-purple-50 to-indigo-100 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950">
      <GlobalNavbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <Link to="/" className="flex items-center text-pink-600 dark:text-pink-400 mb-4">
          <ChevronLeft className="w-5 h-5 mr-1" />
          Back
        </Link>

        {/* Hybrid TV Header - This replaces the basic hero section with comprehensive show overview */}
        <div className="mb-8">
          <HybridTVHeader
            show={show}
            selectedSeason={selectedSeason}
            onSeasonChange={setSelectedSeason}
            isFavorited={isFavorited}
            onToggleFavorite={toggleFavorite}
          />
        </div>

        {/* Episodes Section */}
        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl border border-purple-200/50 dark:border-gray-700/50 p-6 mb-8 transition-colors duration-300">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              {t.episodes || 'Episodes'}
            </h2>
            <div className="flex items-center space-x-3">
              {/* Grid button for view season */}
              <Link
                to={`/tv/${id}/season/${selectedSeason}`}
                className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white px-4 py-2 rounded-xl font-semibold hover:from-indigo-600 hover:to-purple-700 transition-colors flex items-center space-x-2 shadow-lg"
              >
                <Grid className="w-4 h-4" />
              </Link>
              
              {/* Second season selector */}
              <div className="relative">
                <select
                  value={selectedSeason}
                  onChange={(e) => setSelectedSeason(Number(e.target.value))}
                  className="appearance-none bg-gray-100/95 dark:bg-gray-700/95 backdrop-blur-md rounded-xl border border-white/20 dark:border-gray-600/30 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-pink-500 transition-all duration-200 py-2 px-4 cursor-pointer font-semibold"
                >
                  {show.seasons?.filter(s => s.season_number > 0).map(season => (
                    <option key={season.id} value={season.season_number}>
                      {t.season} {season.season_number}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            {episodes.map((episode) => (
              <div
                key={episode.id}
                className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
              >
                <div className="flex items-center justify-between gap-4">
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 dark:text-white">
                      Episode {episode.episode_number}: {episode.name}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                      {episode.overview}
                      <Link
                        to={`/tv/${id}/season/${episode.season_number}/episode/${episode.episode_number}`}
                        className="text-pink-600 dark:text-pink-400 hover:underline ml-1"
                      >
                        {t.details || 'Details'}
                      </Link>
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-300 mt-2">
                      {formatAirDate(episode.air_date)}
                    </p>
                  </div>
                  <button
                    onClick={() => handleWatchEpisode(episode)}
                    className="bg-pink-500 text-white px-3 py-1 rounded-lg text-sm hover:bg-pink-600 transition-colors"
                  >
                    <Play className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default TVDetailMobile
