import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import './App.css';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import PredictionModel from './pages/PredictionModel';
import FindingsAndProcess from './pages/FindingsAndProcess';
import Map from './pages/Map';
import CrashScenarioExplorer from './pages/CrashScenarioExplorer';

function ScrollToTop() {
  const { pathname } = useLocation();
  React.useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [pathname]);
  return null;
}

function AppLayout() {
  const [mapStartYear, setMapStartYear] = useState(2010);
  const [mapEndYear,   setMapEndYear]   = useState(2024);
  const [mapFilter,    setMapFilter]    = useState('all');

  return (
    <div className="App">
      <ScrollToTop />
      <Navbar />
      <main>
        <Routes>
          <Route path="/"                        element={<Home />} />
          <Route path="/prediction-model"        element={<PredictionModel />} />
          <Route path="/crash-scenario-explorer" element={<CrashScenarioExplorer />} />
          <Route path="/findings-and-process"    element={<FindingsAndProcess />} />
          <Route path="/map"                     element={
            <Map
              startYear={mapStartYear} setStartYear={setMapStartYear}
              endYear={mapEndYear}     setEndYear={setMapEndYear}
              filter={mapFilter}       setFilter={setMapFilter}
            />
          } />
          <Route path="*" element={<Home />} />
        </Routes>
      </main>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AppLayout />
    </BrowserRouter>
  );
}

export default App;
