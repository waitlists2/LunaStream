"use client"

import React, { useState, useEffect } from "react"
import { useParams, Link } from "react-router-dom"
import { Play, Star, Calendar, Clock, Heart, ChevronDown, Tv, Info, ChevronLeft, Share2, Download, MoreVertical } from "lucide-react"
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

const TVDetailMobile: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const [show, setShow] = useState<TVDetails | null>(null)
  const [selectedSeason, setSelectedSeason] = useState(1)
  const [episodes, setEpisodes] = useState<Episode[]>([])
  const [loading, setLoading] = useState(true)
  const [episodesLoading, setEpisodesLoading] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentEpisode, setCurrentEpisode] = useState<Episode | null>(null)
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [isFavorited, setIsFavorited] = useState(false)
  const [cast, setCast] = useState<any[]>([])
  const [selectedPlayer, setSelectedPlayer] = useState(playerConfigs[0].id)
  const [showFullDescription, setShowFullDescription] = useState(false)
  const [activeTab, setActiveTab] = useState<'episodes' | 'cast' | 'similar'>('episodes')
  const { language } = useLanguage()
  const isMobile = useIsMobile()

  const t = translations[language]

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
    const fetchCredits = async () => {
      if (!show?.id) return
      try {
        const credits = await tmdb.getTVCredits(show.id)
        setCast(credits.cast || [])
      } catch (error) {
        console.error("Failed to fetch credits:", error)
      }
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
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">{t.tv_not_found || 'Show not found'}</h2>
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

        {/* Hero Section */}
        <div className="relative rounded-xl overflow-hidden mb-6">
          <img 
            src={show.poster_path ? tmdb.getImageUrl(show.poster_path, "w500") : "/placeholder-profile.png"}
            alt={show.name}
            className="w-full h-64 object-cover rounded-xl"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent rounded-xl">
            <div className="absolute bottom-4 left-4 right-4">
              <h1 className="text-2xl font-bold text-white mb-2">{show.name}</h1>
              <div className="flex items-center space-x-2 text-white text-sm">
                <Star className="w-4 h-4 text-yellow-400" />
                <span>{show.vote_average?.toFixed(1)}</span>
                <span>•</span>
                <span>{show.first_air_date?.split('-')[0]}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Show Info */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-6">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">{show.name}</h1>
              <p className="text-gray-600 dark:text-gray-300 mb-4">{show.overview}</p>
            </div>
            <button
              onClick={toggleFavorite}
              className={`p-2 rounded-full ${isFavorited ? 'text-pink-500' : 'text-gray-400'}`}
            >
              <Heart className="w-6 h-6" fill={isFavorited ? 'currentColor' : 'none'} />
            </button>
          </div>

          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-gray-600 dark:text-white">Rating</p>
              <p className="font-semibold text-gray-600 dark:text-white">{show.vote_average?.toFixed(1)}/10</p>
            </div>
            <div>
              <p className="text-gray-600 dark:text-white">First Air Date</p>
              <p className="font-semibold text-gray-600 dark:text-white">{formatAirDate(show.first_air_date)}</p>
            </div>
            <div>
              <p className="text-gray-600 dark:text-white">Episodes</p>
              <p className="font-semibold text-gray-600 dark:text-white">{show.number_of_episodes}</p>
            </div>
            <div>
              <p className="text-gray-600 dark:text-white">Status</p>
              <p className="font-semibold text-gray-600 dark:text-white">{show.status}</p>
            </div>
          </div>
        </div>

        {/* Season Selector */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4 mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Seasons</h2>
            <select
              value={selectedSeason}
              onChange={(e) => setSelectedSeason(Number(e.target.value))}
              className="bg-gray-100 dark:bg-gray-700 rounded-lg px-3 py-2 text-sm dark:text-white"
            >
              {show.seasons?.filter(s => s.season_number > 0).map(season => (
                <option key={season.id} value={season.season_number}>
                  Season {season.season_number}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-4">
            {episodes.map((episode) => (
              <div key={episode.id} className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">
                      Episode {episode.episode_number}: {episode.name}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-white mt-1">{episode.overview}</p>
                    <p className="text-xs text-gray-500 dark:text-white mt-2">{formatAirDate(episode.air_date)}</p>
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

        {/* Cast Section */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Cast</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {cast.slice(0, 6).map((person) => (
              <div key={person.id} className="text-center">
                <img
                  src={person.profile_path ? tmdb.getImageUrl(person.profile_path, "w185") : "/placeholder-profile.png"}
                  alt={person.name}
                  className="w-full h-24 object-cover rounded-lg mb-2"
                />
                <p className="text-sm font-medium text-gray-900 dark:text-white">{person.name}</p>
                <p className="text-xs text-gray-600 dark:text-gray-300">{person.character}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default TVDetailMobile
