import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './components/HomePage';
import SearchResults from './components/SearchResults';
import MovieDetail from './components/MovieDetail';
import TVDetail from './components/TVDetail';
import LastUpdated from './components/LastUpdated';
import DonatePage from './components/DonatePage';
import VersionPage from './components/VersionPage';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/search" element={<SearchResults />} />
        <Route path="/movie/:id" element={<MovieDetail />} />
        <Route path="/tv/:id" element={<TVDetail />} />
        <Route path="/tv/:id/:season/:episode" element={<TVDetail />} />
        <Route path="/v" element={<VersionPage />} />
        <Route path="/last-updated" element={<LastUpdated />} />
        <Route path="/donate" element={<DonatePage />} />
      </Routes>
    </Router>
  );
}

export default App;