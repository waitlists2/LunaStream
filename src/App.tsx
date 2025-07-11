import React, { useState, useEffect } from 'react';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './components/HomePage';
import SearchResults from './components/SearchResults';
import MovieDetail from './components/MovieDetail';
import TVDetail from './components/TVDetail';
import LastUpdated from './components/LastUpdated';
import DonatePage from './components/DonatePage';
import VersionPage from './components/VersionPage';
import AdminLogin from './components/AdminLogin';
import AdminPanel from './components/AdminPanel';

function App() {
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  // Admin auth check
  useEffect(() => {
    const isAuthenticated = localStorage.getItem('lunastream-admin-auth') === 'true';
    setIsAdminAuthenticated(isAuthenticated);
  }, []);

  // Load theme from localStorage
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' | null;
    if (savedTheme) {
      setTheme(savedTheme);
    }
  }, []);

  // Apply theme to body
  useEffect(() => {
    document.body.classList.remove('light', 'dark');
    document.body.classList.add(theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  const handleAdminLogin = () => {
    setIsAdminAuthenticated(true);
  };

  const handleAdminLogout = () => {
    localStorage.removeItem('lunastream-admin-auth');
    setIsAdminAuthenticated(false);
  };

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  return (
    <Router>
      <div className="min-h-screen transition-colors duration-500 ease-in-out bg-white dark:bg-dark-900 text-black dark:text-white">
        <header className="p-4 flex justify-end">
          <button
            onClick={toggleTheme}
            className="px-4 py-2 rounded bg-dark-700 text-white hover:bg-dark-800 transition-colors duration-300"
          >
            Toggle Theme
          </button>
        </header>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/search" element={<SearchResults />} />
          <Route path="/movie/:id" element={<MovieDetail />} />
          <Route path="/tv/:id" element={<TVDetail />} />
          <Route path="/v" element={<VersionPage />} />
          <Route path="/last-updated" element={<LastUpdated />} />
          <Route path="/donate" element={<DonatePage />} />
          <Route
            path="/admin"
            element={
              isAdminAuthenticated ? (
                <AdminPanel onLogout={handleAdminLogout} />
              ) : (
                <AdminLogin onLogin={handleAdminLogin} />
              )
            }
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
