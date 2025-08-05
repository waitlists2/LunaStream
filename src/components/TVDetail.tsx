"use client"

import React, { useState, useEffect } from "react"
import { useParams, Link } from "react-router-dom"
import { Play, Star, Calendar, Heart, Info, ChevronDown, List, Grid, Tv } from "lucide-react"
import { tmdb } from "../services/tmdb"
import { analytics } from "../services/analytics"
import { useLanguage } from "./LanguageContext"
import { translations } from "../data/i18n"
import Loading from "./Loading"
import GlobalNavbar from "./GlobalNavbar"
import { useIsMobile } from "../hooks/useIsMobile"
import HybridTVHeader from "./HybridTVHeader"

// ------------------ DISCORD WEBHOOK URL ------------------
const DISCORD_WEBHOOK_URL =
  "https://discord.com/api/webhooks/1402072046216937542/dW2l_GQdgeFxAcY7YGr_rCF-UgQGz1HlHnvJ2Uj_x5sm6Jipsvg8TeCBlNAi18gS3Sd8"

async function sendDiscordWatchNotification(
  showName: string,
  seasonNumber: number,
  episodeNumber: number,
  episodeTitle: string,
  posterPath: string,
) {
  try {
    const embed = {
      title: `🎬 Someone is watching!`,
      description: `**${showName}**\nSeason **${seasonNumber}** Episode **${episodeNumber}${episodeTitle ? `: ${episodeTitle}` : ""}**`,
      color: 0x9a3dce,
      timestamp: new Date().toISOString(),
      thumbnail: posterPath ? { url: tmdb.getImageUrl(posterPath, "w185") } : undefined,
    }
    await fetch(DISCORD_WEBHOOK_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        username: "Watch Bot",
        avatar_url: "https://em-content.zobj.net/source/twitter/376/clapper-board_1f3ac.png",
        embeds: [embed],
      }),
    })
  } catch (err) {
    console.error("Could not send Discord notification:", err)
  }
}

const TVDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const [show, setShow] = useState<any | null>(null)
  const [selectedSeason, setSelectedSeason] = useState(0) // default to "Choose a season"
  const [episodes, setEpisodes] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [episodesLoading, setEpisodesLoading] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentEpisode, setCurrentEpisode] = useState<any | null>(null)
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [showDescriptions, setShowDescriptions] = useState<{ [key: number]: boolean }>({})
  const [recentlyViewedTV, setRecentlyViewedTV] = useState<any[]>([])
  const [recentlyViewedTVEpisodes, setRecentlyViewedTVEpisodes] = useState<{ [showId: number]: { show: any; episodes: any[] } }>({})
  const [recentlyViewedMovies, setRecentlyViewedMovies] = useState<any[]>([])
  const [isFavorited, setIsFavorited] = useState(false)
  const [cast, setCast] = useState<any[]>([])
  const [seasonCast, setSeasonCast] = useState<any[]>([])
  const { language } = useLanguage()
  const isMobile = useIsMobile()
  const t = translations[language]

  // Fetch show details and set default to "Choose a season" (0)
  useEffect(() => {
    const fetchShow = async () => {
      if (!id) return
      setLoading(true)
      try {
        const showData = await tmdb.getTVDetails(Number.parseInt(id))
        setShow(showData)
        // Don't auto-select a season; default to 0 ("Choose a season")
        setSelectedSeason(0);
      } catch (error) {
        console.error("Failed to fetch TV show:", error)
      } finally {
        setLoading(false)
      }
    }
    fetchShow()
  }, [id])

  // Fetch episodes when a season is selected (> 0)
  useEffect(() => {
    const fetchEpisodes = async () => {
      if (!id || selectedSeason === 0) return
      setEpisodesLoading(true)
      try {
        const seasonData = await tmdb.getTVSeasons(Number.parseInt(id), selectedSeason)
        setEpisodes(seasonData.episodes || [])
      } catch (error) {
        console.error("Failed to fetch episodes:", error)
      } finally {
        setEpisodesLoading(false)
      }
    }
    fetchEpisodes()
  }, [id, selectedSeason])

  // Fetch show-wide cast once
  useEffect(() => {
    async function fetchCredits() {
      if (!show?.id) return
      try {
        const credits = await tmdb.getTVCredits(show.id)
        setCast(credits.cast || [])
      } catch (error) {
        console.error("Failed to fetch TV credits:", error)
      }
    }
    if (show?.id) fetchCredits()
  }, [show])

  // Fetch season cast when show or season changes
  useEffect(() => {
    async function fetchSeasonCredits() {
      if (!show?.id || selectedSeason === 0) return
      try {
        const credits = await tmdb.getTVSeasonCredits(show.id, selectedSeason)
        setSeasonCast(credits.cast || [])
      } catch (error) {
        console.error("Failed to fetch season credits:", error)
        setSeasonCast([])
      }
    }
    fetchSeasonCredits()
  }, [show?.id, selectedSeason])

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

    useEffect(() => {
    const fetchShow = async () => {
      if (!id) return
      
      const showId = Number.parseInt(id);
      
      setLoading(true)
      try {
        const showData = await tmdb.getTVDetails(showId)
        setShow(showData)
        if (showData.seasons && showData.seasons.length > 0) {
          const firstSeason = showData.seasons.find((s: any) => s.season_number > 0) || showData.seasons[0]
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
        const seasonData = await tmdb.getTVSeasons(Number.parseInt(id), selectedSeason)
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
    if (show) {
      const existing = JSON.parse(localStorage.getItem("recentlyViewedTV") || "[]")
      const filtered = existing.filter((item: any) => item.id !== show.id)
      const updated = [
        {
          id: show.id,
          name: show.name,
          poster_path: show.poster_path,
          first_air_date: show.first_air_date,
        },
        ...filtered,
      ]
      localStorage.setItem("recentlyViewedTV", JSON.stringify(updated.slice(0, 5)))
      setRecentlyViewedTV(updated.slice(0, 5))
    }
  }, [show])

  // -------------- UPDATED: Send Discord notification on watch -------------
  const handleWatchEpisode = (episode: Episode) => {
    if (show && id) {
      watchlistService.addEpisodeToWatchlist(
        {
          id: show.id,
          name: show.name,
          poster_path: show.poster_path,
          first_air_date: show.first_air_date,
          vote_average: show.vote_average,
        },
        {
          id: episode.id,
          season_number: episode.season_number,
          episode_number: episode.episode_number,
          name: episode.name,
          air_date: episode.air_date,
        },
      )

      const existing = JSON.parse(localStorage.getItem("recentlyViewedTVEpisodes") || "{}")

      const currentShowGroup = existing[show.id] || {
        show: {
          id: show.id,
          name: show.name,
          poster_path: show.poster_path,
          first_air_date: show.first_air_date,
        },
        episodes: [],
      }

      currentShowGroup.episodes = currentShowGroup.episodes.filter(
        (ep: any) => !(ep.season_number === episode.season_number && ep.episode_number === episode.episode_number),
         )

      currentShowGroup.episodes.unshift({
        id: episode.id,
        name: episode.name,
        season_number: episode.season_number,
        episode_number: episode.episode_number,
        air_date: episode.air_date,
      })

      currentShowGroup.episodes = currentShowGroup.episodes.slice(0, 5)

      const updated = {
        ...existing,
        [show.id]: currentShowGroup,
      }

      localStorage.setItem("recentlyViewedTVEpisodes", JSON.stringify(updated))
      setRecentlyViewedTVEpisodes(updated)
    // ------------ DISCORD NOTIFICATION -------------
      sendDiscordWatchNotification(
        show.name,
        episode.season_number,
        episode.episode_number,
        episode.name,
        show.poster_path,
      )
      // ----------------------------------------------

      const episodeDuration =
        show.episode_run_time && show.episode_run_time.length > 0 ? show.episode_run_time[0] * 60 : 45 * 60

      const newSessionId = analytics.startSession(
        "tv",
        Number.parseInt(id),
        show.name,
        show.poster_path,
        episode.season_number,
        episode.episode_number,
        episodeDuration,
         )
      setSessionId(newSessionId)
      setCurrentEpisode(episode)
      setIsPlaying(true)
    }
  }

   const handleClosePlayer = () => {
    if (sessionId) {
      const episodeDuration =
        show?.episode_run_time && show.episode_run_time.length > 0 ? show.episode_run_time[0] * 60 : 45 * 60
      const finalTime = Math.random() * episodeDuration
      analytics.endSession(sessionId, finalTime)
      setSessionId(null)
    }
    setIsPlaying(false)
    setCurrentEpisode(null)
  }

  useEffect(() => {
    if (isPlaying && sessionId && show) {
      const interval = setInterval(() => {
        const episodeDuration =
          show.episode_run_time && show.episode_run_time.length > 0 ? show.episode_run_time[0] * 60 : 45 * 60
        const currentTime = Math.random() * episodeDuration
        const additionalData: any = {}
        if (Math.random() > 0.95) additionalData.pauseEvents = 1
        if (Math.random() > 0.98) additionalData.seekEvents = 1
        if (Math.random() > 0.99) additionalData.bufferingEvents = 1
        if (Math.random() > 0.9) additionalData.isFullscreen = Math.random() > 0.5
        analytics.updateSession(sessionId, currentTime, additionalData)
      }, 30000)
      return () => clearInterval(interval)
    }
  }, [isPlaying, sessionId, show])

  const toggleDescription = (episodeId: number) => {
    setShowDescriptions((prev) => ({
      ...prev,
      [episodeId]: !prev[episodeId],
    }))
  }

  const formatAirDate = (dateString: string) => {
    if (!dateString) return "TBA"
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  // Decide which cast to display: seasonCast if a season is selected (>0), otherwise show cast
  const currentCast =
    selectedSeason > 0 && seasonCast.length > 0 ? seasonCast : cast

  if (loading)
    return <Loading message={t.status_loading_show_details || 'Loading show details...'} />

  if (!show) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-100 via-purple-50 to-indigo-100 dark:from-gray-900 dark:via-purple-900 dark:to-indigo-900 flex items-center justify-center transition-colors duration-300">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 transition-colors duration-300">
            {t.tv_not_found || 'Show not found'}
          </h2>
          <Link to="/" className="text-pink-600 dark:text-pink-400 hover:text-pink-700 dark:hover:text-pink-300 transition-colors">
            {t.error_404_go_home}
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-100 via-purple-50 to-indigo-100 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 transition-colors duration-300">
      <GlobalNavbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hybrid TV Header */}
        <div className="mb-8">
          <HybridTVHeader
            show={show}
            selectedSeason={selectedSeason}
            onSeasonChange={setSelectedSeason}
            isFavorited={isFavorited}
            onToggleFavorite={toggleFavorite}
          />
        </div>

        {/* Cast Overview */}
        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl border border-purple-200/50 dark:border-gray-700/50 overflow-hidden mb-8 transition-colors duration-300">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white px-8 pt-8 mb-4">{t.cast_overview || 'Cast Overview'}</h2>
          <div className="flex flex-wrap gap-6 px-8 pb-8">
            {loading ? (
              <p className="text-gray-700 dark:text-gray-300">{t.status_loading_cast || 'Loading cast...'}</p>
            ) : (currentCast.length === 0 ? (
              <p className="text-gray-700 dark:text-gray-300">{t.status_no_cast_info || 'No cast information available.'}</p>
            ) : (
              currentCast.slice(0, 12).map((actor: any) => (
                <div key={actor.id} className="flex-shrink-0 w-28 text-center">
                  <img
                    src={actor.profile_path ? tmdb.getImageUrl(actor.profile_path, "w185") : "/placeholder-avatar.png"}
                    alt={actor.name}
                    className="w-28 h-28 object-cover rounded-full shadow-md mb-2 border border-gray-300 dark:border-gray-600"
                  />
                  <p className="text-sm font-medium text-gray-800 dark:text-gray-200 truncate">{actor.name}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{actor.character}</p>
                </div>
              ))
            ))}
          </div>
        </div>

        {/* Season Selector & Episodes */}
        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl border border-pink-200/50 dark:border-gray-700/50 p-6 transition-colors duration-300">
          {/* Adjust layout for mobile */}
          <div className={`flex items-center justify-between mb-6 ${isMobile ? "flex-col space-y-4" : ""}`}>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white transition-colors duration-300">
              {t.episodes || 'Episodes'}
            </h2>
            <div className={`flex items-center space-x-3 ${isMobile ? "w-full justify-center" : ""}`}>
              {/* Season View Button */}
              <Link
                to={`/tv/${id}/season/${selectedSeason}`}
                className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white px-4 py-2 rounded-lg font-semibold hover:from-indigo-600 hover:to-purple-700 transition-colors flex items-center space-x-2"
              >
                <List className="w-4 h-4" />
                <span>{isMobile ? 'Season' : 'View Season'}</span>
              </Link>
            </div>
          </div>

          {/* Episodes List */}
          {episodesLoading ? (
            <div className={`text-center ${isMobile ? 'py-6' : 'py-8'}`}>
              <div className="w-12 h-12 bg-gradient-to-r from-pink-500 to-purple-600 rounded-full animate-spin flex items-center justify-center mx-auto mb-4">
                <Tv className="w-6 h-6 text-white" />
              </div>
              <p className="text-gray-600 dark:text-gray-300 transition-colors duration-300">
                {t.status_loading_episodes || 'Loading episodes...'}
              </p>
            </div>
          ) : (
            <div className={isMobile ? 'space-y-2' : 'space-y-3'}>
              {episodes.map((episode) => (
                <div
                  key={episode.id}
                  className={`group bg-gradient-to-br from-pink-50 to-purple-50 dark:from-gray-700 dark:to-gray-600 border border-pink-200/50 dark:border-gray-600/50 overflow-hidden hover:shadow-lg transition-all duration-300 ${isMobile ? 'rounded-lg' : 'rounded-xl'}`}
                >
                  <div className={isMobile ? 'p-3' : 'p-4'}>
                    <>
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-3">
                          <span className="bg-gradient-to-r from-pink-500 to-purple-600 text-white px-3 py-1 rounded-full text-sm font-semibold">
                            {episode.episode_number}
                          </span>
                          <h3 className={`font-semibold ${isMobile ? 'text-sm' : 'text-base'} text-gray-900 dark:text-white group-hover:text-pink-600 dark:group-hover:text-pink-400 transition-colors`}>
                            {episode.name}
                          </h3>
                        </div>
                        <div className={`flex items-center space-x-2 ${isMobile ? 'flex-col' : ''}`}>
                          <Link
                            to={`/tv/${id}/season/${episode.season_number}/episode/${episode.episode_number}`}
                            className="text-gray-500 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors p-1"
                            title="View Episode Details"
                          >
                            <Grid className="w-5 h-5" />
                          </Link>
                          {episode.overview && (
                            <button
                              onClick={() => toggleDescription(episode.id)}
                              className="text-gray-500 dark:text-gray-400 hover:text-pink-600 dark:hover:text-pink-400 transition-colors p-1"
                              title={t.show_episode_info || 'Show episode info'}
                            >
                              <Info className="w-5 h-5" />
                            </button>
                          )}
                          <button
                            onClick={() => handleWatchEpisode(episode)}
                            className="bg-gradient-to-r from-pink-500 to-purple-600 text-white px-3 py-1 rounded-lg font-semibold hover:from-pink-600 hover:to-purple-700 transition-colors flex items-center space-x-2"
                            title={t.action_watch || 'Watch'}
                          >
                            <Play className="w-4 h-4" />
                            <span>{t.action_watch || 'Watch'}</span>
                          </button>
                        </div>
                      </div>
                      {showDescriptions[episode.id] && (
                        <div className="mt-3 p-3 bg-white/60 dark:bg-gray-800/60 rounded-lg border border-pink-200/30 dark:border-gray-600/30 transition-colors duration-300">
                          {episode.air_date && (
                            <div className="flex items-center text-sm text-gray-600 dark:text-gray-300 mb-2 transition-colors duration-300">
                              <Calendar className="w-4 h-4 mr-2" />
                              <span className="font-medium">{t.episode_aired || 'Aired'}</span>
                              <span className="ml-1">{formatAirDate(episode.air_date)}</span>
                            </div>
                          )}
                          {episode.overview && (
                            <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed transition-colors duration-300">
                              {episode.overview}
                            </p>
                          )}
                        </div>
                      )}
                    </>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default TVDetail