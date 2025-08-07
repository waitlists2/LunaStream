import React from "react"
import MovieDetailMobile from "./MovieDetailMobile"
import MovieDetail from "./MovieDetail"
import { useIsMobile } from "../hooks/useIsMobile"

const TVDetailWrapper: React.FC = () => {
  const isMobile = useIsMobile()

  return isMobile ? <MovieDetailMobile /> : <MovieDetail />
}

export default TVDetailWrapper
