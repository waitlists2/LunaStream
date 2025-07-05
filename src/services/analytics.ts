// Analytics service for tracking user behavior and streaming data
export interface StreamingSession {
  id: string;
  userId: string;
  mediaType: 'movie' | 'tv';
  mediaId: number;
  mediaTitle: string;
  startTime: Date;
  lastActivity: Date;
  currentTime: number;
  duration?: number;
  season?: number;
  episode?: number;
  userAgent: string;
  location?: string;
}

export interface ViewingStats {
  totalViews: number;
  uniqueViewers: number;
  totalWatchTime: number;
  averageSessionLength: number;
  topMovies: Array<{
    id: number;
    title: string;
    views: number;
    totalWatchTime: number;
  }>;
  topTVShows: Array<{
    id: number;
    title: string;
    views: number;
    totalWatchTime: number;
  }>;
  currentlyWatching: StreamingSession[];
  dailyStats: Array<{
    date: string;
    views: number;
    uniqueViewers: number;
    watchTime: number;
  }>;
}

class AnalyticsService {
  private sessions: Map<string, StreamingSession> = new Map();
  private viewHistory: StreamingSession[] = [];
  private readonly STORAGE_KEY = 'lunastream-analytics';
  private readonly SESSION_TIMEOUT = 30 * 60 * 1000; // 30 minutes

  constructor() {
    this.loadFromStorage();
    this.startCleanupInterval();
  }

  private loadFromStorage() {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (stored) {
        const data = JSON.parse(stored);
        this.viewHistory = data.viewHistory || [];
        // Don't restore active sessions on page load
      }
    } catch (error) {
      console.error('Failed to load analytics data:', error);
    }
  }

  private saveToStorage() {
    try {
      const data = {
        viewHistory: this.viewHistory.slice(-1000), // Keep last 1000 sessions
      };
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(data));
    } catch (error) {
      console.error('Failed to save analytics data:', error);
    }
  }

  private startCleanupInterval() {
    setInterval(() => {
      this.cleanupInactiveSessions();
    }, 60000); // Check every minute
  }

  private cleanupInactiveSessions() {
    const now = Date.now();
    const toRemove: string[] = [];

    this.sessions.forEach((session, sessionId) => {
      if (now - session.lastActivity.getTime() > this.SESSION_TIMEOUT) {
        // Move to history before removing
        this.viewHistory.push({
          ...session,
          lastActivity: new Date(session.lastActivity)
        });
        toRemove.push(sessionId);
      }
    });

    toRemove.forEach(id => this.sessions.delete(id));
    
    if (toRemove.length > 0) {
      this.saveToStorage();
    }
  }

  private generateSessionId(): string {
    return Math.random().toString(36).substring(2) + Date.now().toString(36);
  }

  private generateUserId(): string {
    let userId = localStorage.getItem('lunastream-user-id');
    if (!userId) {
      userId = 'user_' + Math.random().toString(36).substring(2) + Date.now().toString(36);
      localStorage.setItem('lunastream-user-id', userId);
    }
    return userId;
  }

  startSession(mediaType: 'movie' | 'tv', mediaId: number, mediaTitle: string, season?: number, episode?: number): string {
    const sessionId = this.generateSessionId();
    const userId = this.generateUserId();
    
    const session: StreamingSession = {
      id: sessionId,
      userId,
      mediaType,
      mediaId,
      mediaTitle,
      startTime: new Date(),
      lastActivity: new Date(),
      currentTime: 0,
      season,
      episode,
      userAgent: navigator.userAgent,
    };

    this.sessions.set(sessionId, session);
    return sessionId;
  }

  updateSession(sessionId: string, currentTime: number) {
    const session = this.sessions.get(sessionId);
    if (session) {
      session.currentTime = currentTime;
      session.lastActivity = new Date();
    }
  }

  endSession(sessionId: string, finalTime?: number) {
    const session = this.sessions.get(sessionId);
    if (session) {
      if (finalTime !== undefined) {
        session.currentTime = finalTime;
      }
      session.lastActivity = new Date();
      
      // Move to history
      this.viewHistory.push({
        ...session,
        lastActivity: new Date(session.lastActivity)
      });
      
      this.sessions.delete(sessionId);
      this.saveToStorage();
    }
  }

  getCurrentlyWatching(): StreamingSession[] {
    this.cleanupInactiveSessions();
    return Array.from(this.sessions.values()).sort((a, b) => 
      b.lastActivity.getTime() - a.lastActivity.getTime()
    );
  }

  getViewingStats(): ViewingStats {
    const now = new Date();
    const last30Days = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    
    // Filter recent sessions
    const recentSessions = this.viewHistory.filter(session => 
      session.startTime >= last30Days
    );

    // Calculate basic stats
    const totalViews = recentSessions.length;
    const uniqueViewers = new Set(recentSessions.map(s => s.userId)).size;
    const totalWatchTime = recentSessions.reduce((sum, session) => 
      sum + session.currentTime, 0
    );
    const averageSessionLength = totalViews > 0 ? totalWatchTime / totalViews : 0;

    // Top movies
    const movieStats = new Map<number, { title: string; views: number; totalWatchTime: number }>();
    recentSessions
      .filter(s => s.mediaType === 'movie')
      .forEach(session => {
        const existing = movieStats.get(session.mediaId) || { 
          title: session.mediaTitle, 
          views: 0, 
          totalWatchTime: 0 
        };
        existing.views++;
        existing.totalWatchTime += session.currentTime;
        movieStats.set(session.mediaId, existing);
      });

    const topMovies = Array.from(movieStats.entries())
      .map(([id, stats]) => ({ id, ...stats }))
      .sort((a, b) => b.views - a.views)
      .slice(0, 10);

    // Top TV shows
    const tvStats = new Map<number, { title: string; views: number; totalWatchTime: number }>();
    recentSessions
      .filter(s => s.mediaType === 'tv')
      .forEach(session => {
        const existing = tvStats.get(session.mediaId) || { 
          title: session.mediaTitle, 
          views: 0, 
          totalWatchTime: 0 
        };
        existing.views++;
        existing.totalWatchTime += session.currentTime;
        tvStats.set(session.mediaId, existing);
      });

    const topTVShows = Array.from(tvStats.entries())
      .map(([id, stats]) => ({ id, ...stats }))
      .sort((a, b) => b.views - a.views)
      .slice(0, 10);

    // Daily stats for last 7 days
    const dailyStats: Array<{
      date: string;
      views: number;
      uniqueViewers: number;
      watchTime: number;
    }> = [];

    for (let i = 6; i >= 0; i--) {
      const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      const dateStr = date.toISOString().split('T')[0];
      const dayStart = new Date(date.getFullYear(), date.getMonth(), date.getDate());
      const dayEnd = new Date(dayStart.getTime() + 24 * 60 * 60 * 1000);

      const daySessions = recentSessions.filter(session => 
        session.startTime >= dayStart && session.startTime < dayEnd
      );

      dailyStats.push({
        date: dateStr,
        views: daySessions.length,
        uniqueViewers: new Set(daySessions.map(s => s.userId)).size,
        watchTime: daySessions.reduce((sum, s) => sum + s.currentTime, 0)
      });
    }

    return {
      totalViews,
      uniqueViewers,
      totalWatchTime,
      averageSessionLength,
      topMovies,
      topTVShows,
      currentlyWatching: this.getCurrentlyWatching(),
      dailyStats
    };
  }

  // Simulate some demo data for testing
  generateDemoData() {
    const demoMovies = [
      { id: 550, title: "Fight Club" },
      { id: 13, title: "Forrest Gump" },
      { id: 155, title: "The Dark Knight" },
      { id: 497, title: "The Green Mile" },
      { id: 680, title: "Pulp Fiction" }
    ];

    const demoTVShows = [
      { id: 1399, title: "Game of Thrones" },
      { id: 1396, title: "Breaking Bad" },
      { id: 60735, title: "The Flash" },
      { id: 1402, title: "The Walking Dead" },
      { id: 46648, title: "Squid Game" }
    ];

    // Generate some historical data
    const now = Date.now();
    for (let i = 0; i < 50; i++) {
      const isMovie = Math.random() > 0.5;
      const media = isMovie ? 
        demoMovies[Math.floor(Math.random() * demoMovies.length)] :
        demoTVShows[Math.floor(Math.random() * demoTVShows.length)];

      const startTime = new Date(now - Math.random() * 7 * 24 * 60 * 60 * 1000);
      const watchTime = Math.random() * 7200; // 0-2 hours

      this.viewHistory.push({
        id: this.generateSessionId(),
        userId: 'demo_user_' + Math.floor(Math.random() * 20),
        mediaType: isMovie ? 'movie' : 'tv',
        mediaId: media.id,
        mediaTitle: media.title,
        startTime,
        lastActivity: new Date(startTime.getTime() + watchTime * 1000),
        currentTime: watchTime,
        season: isMovie ? undefined : Math.floor(Math.random() * 5) + 1,
        episode: isMovie ? undefined : Math.floor(Math.random() * 20) + 1,
        userAgent: navigator.userAgent
      });
    }

    // Generate some current sessions
    for (let i = 0; i < 5; i++) {
      const isMovie = Math.random() > 0.5;
      const media = isMovie ? 
        demoMovies[Math.floor(Math.random() * demoMovies.length)] :
        demoTVShows[Math.floor(Math.random() * demoTVShows.length)];

      const sessionId = this.generateSessionId();
      this.sessions.set(sessionId, {
        id: sessionId,
        userId: 'live_user_' + Math.floor(Math.random() * 10),
        mediaType: isMovie ? 'movie' : 'tv',
        mediaId: media.id,
        mediaTitle: media.title,
        startTime: new Date(now - Math.random() * 60 * 60 * 1000),
        lastActivity: new Date(now - Math.random() * 5 * 60 * 1000),
        currentTime: Math.random() * 3600,
        season: isMovie ? undefined : Math.floor(Math.random() * 5) + 1,
        episode: isMovie ? undefined : Math.floor(Math.random() * 20) + 1,
        userAgent: navigator.userAgent
      });
    }

    this.saveToStorage();
  }
}

export const analytics = new AnalyticsService();