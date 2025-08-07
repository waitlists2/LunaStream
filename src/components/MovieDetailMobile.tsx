"use client"

import React, { useState, useEffect } from "react"
import { useParams, Link } from "react-router-dom"
import { Play, Heart, ChevronLeft } from "lucide-react"
import { tmdb } from "../services/tmdb"
import { analytics } from "../services/analytics"
import type { MovieDetails } from "../types"
import { watchlistService } from "../services/watchlist"
import GlobalNavbar from "./GlobalNavbar"
import { getPlayerUrl, playerConfigs } from "../utils/playerUtils"
import { useLanguage } from "./LanguageContext"
import { translations } from "../data/i18n"
import Loading from "./Loading"
import HybridMovieHeader from "./HybridMovieHeader" // import your header component

const MovieDetailMobile: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const [movie, setMovie] = useState<MovieDetails | null>(null)
  const [loading, setLoading] = useState(true)
  const [isPlaying, setIsPlaying] = useState(false)
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [isFavorited, setIsFavorited] = useState(false)
  const [cast, setCast] = useState<any[]>([])
  const { language } = useLanguage()
  const t = translations[language]

  useEffect(() => {
    const fetchMovie = async () => {
      if (!id) return
      setLoading(true)
      try {
        const data = await tmdb.getMovieDetails(Number(id))
        setMovie(data)
        // Fetch cast info
        const credits = await tmdb.getMovieCredits(data.id)
        setCast(credits.cast || [])
      } catch (error) {
        console.error("Failed to fetch movie:", error)
      } finally {
        setLoading(false)
      }
    }
    fetchMovie()
  }, [id])

  useEffect(() => {
    if (!movie) return
    const favorites = JSON.parse(localStorage.getItem("favoriteMovies") || "[]")
    setIsFavorited(favorites.some((fav: any) => fav.id === movie.id))
  }, [movie])

  const toggleFavorite = () => {
    if (!movie) return
    const favorites = JSON.parse(localStorage.getItem("favoriteMovies") || "[]")
    const index = favorites.findIndex((fav: any) => fav.id === movie.id)
    if (index !== -1) {
      favorites.splice(index, 1)
      setIsFavorited(false)
    } else {
      favorites.unshift(movie)
      setIsFavorited(true)
    }
    localStorage.setItem("favoriteMovies", JSON.stringify(favorites))
  }

  const handleWatchMovie = () => {
    if (movie && id) {
      watchlistService.addMovieToWatchlist({
        id: movie.id,
        title: movie.title,
        poster_path: movie.poster_path,
        release_date: movie.release_date,
      })

      const sessionId = analytics.startSession(
        "movie",
        Number(id),
        movie.title,
        movie.poster_path,
        undefined,
        undefined,
        movie.runtime ? movie.runtime * 60 : undefined
      )
      setSessionId(sessionId)
      setIsPlaying(true)
    }
  }

  const handleClosePlayer = () => {
    if (sessionId) {
      analytics.endSession(sessionId, Math.random() * (movie?.runtime ? movie.runtime * 60 : 7200))
      setSessionId(null)
    }
    setIsPlaying(false)
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
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-100 via-purple-50 to-indigo-100 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950">
        <Loading message={t.status_loading_movie_details || 'Loading movie details...'} />
      </div>
    )
  }

  if (!movie) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-100 via-purple-50 to-indigo-100 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950">
        <div className="text-center p-4">
          <h2 className="text-xl font-bold mb-4">{t.movie_not_found || 'Movie not found'}</h2>
          <Link to="/" className="text-pink-600">{t.go_home || 'Go Home'}</Link>
        </div>
      </div>
    )
  }

  if (isPlaying && sessionId && movie) {
    return (
      <div className="fixed inset-0 bg-black z-50 flex flex-col">
        <div className="absolute top-4 right-4 z-10">
          <button onClick={handleClosePlayer} className="text-white bg-black/50 rounded-full p-2">
            <ChevronLeft className="w-6 h-6" />
          </button>
        </div>
        <iframe
          src={getPlayerUrl("default", id!, "movie")}
          className="w-full h-full"
          allowFullScreen
        />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-100 via-purple-50 to-indigo-100 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 flex flex-col">
      <GlobalNavbar />

      {/* Back Button */}
      <div className="p-4 flex items-center">
        <Link to="/" className="flex items-center text-pink-600">
          <ChevronLeft className="w-5 h-5 mr-2" />
          {t.back || 'Back'}
        </Link>
      </div>
      
      {/* Header using HybridMovieHeader */}
      <HybridMovieHeader
        show={movie}
        isFavorited={isFavorited}
        onToggleFavorite={toggleFavorite}
      />

      {/* Watch Button */}
      <div className="px-4 mb-4">
        <button
          onClick={handleWatchMovie}
          className="w-full bg-pink-600 hover:bg-pink-700 text-white px-4 py-3 rounded-lg font-semibold shadow-md transition-colors"
        >
          <Play className="w-5 h-5 inline-block mr-2" />
          {t.action_watch_movie || 'Watch Movie'}
        </button>
      </div>

      {/* Cast Section */}
      <div className="px-4 mb-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Cast</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {cast.slice(0, 6).map((person) => (
            <div key={person.id} className="text-center">
              <img
                src={
                  person.profile_path
                    ? tmdb.getImageUrl(person.profile_path, "w185")
                    : "/placeholder-profile.png"
                }
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
  )
}

export default MovieDetailMobile