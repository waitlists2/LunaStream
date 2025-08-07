import React from "react"
import TVDetailMobile from "./TVDetailMobile"
import TVDetail from "./TVDetail"
import { useIsMobile } from "../hooks/useIsMobile"

const TVDetailWrapper: React.FC = () => {
  const isMobile = useIsMobile()

  return isMobile ? <TVDetailMobile /> : <TVDetail />
}

export default TVDetailWrapper
