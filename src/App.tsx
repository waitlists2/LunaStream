import React from 'react';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './components/HomePage';
import SearchResults from './components/SearchResults';
import MovieDetail from './components/MovieDetail';
import TVDetail from './components/TVDetail';
import LastUpdated from './components/LastUpdated'; 

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/search" element={<SearchResults />} />
        <Route path="/movie/:id" element={<MovieDetail />} />
        <Route path="/tv/:id" element={<TVDetail />} />
        <Route path="/v" element={<LastUpdated />} />
      </Routes>
    </Router>
  );
}

export default App;