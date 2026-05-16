import React, { useState } from 'react';
import './App.css';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import PredictionModel from './pages/PredictionModel';
import FindingsAndProcess from './pages/FindingsAndProcess';
import Map from './pages/Map';
import CrashScenarioExplorer from './pages/CrashScenarioExplorer';

function App() {
  const [currentPage, setCurrentPage] = useState('home');
  const [mapStartYear, setMapStartYear] = useState(2010);
  const [mapEndYear,   setMapEndYear]   = useState(2024);
  const [mapFilter,    setMapFilter]    = useState('all');

  React.useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [currentPage]);

  const renderPage = () => {
    switch (currentPage) {
      case 'home':             return <Home setCurrentPage={setCurrentPage} />;
      case 'formula-explorer': return <CrashScenarioExplorer setCurrentPage={setCurrentPage} />;
      case 'sliding-window':   return <PredictionModel setCurrentPage={setCurrentPage} />;
      case 'map':              return (
        <Map
          startYear={mapStartYear} setStartYear={setMapStartYear}
          endYear={mapEndYear}     setEndYear={setMapEndYear}
          filter={mapFilter}       setFilter={setMapFilter}
        />
      );
      case 'process':          return <FindingsAndProcess setCurrentPage={setCurrentPage} />;
      default:                 return <Home setCurrentPage={setCurrentPage} />;
    }
  };

  return (
    <div className="App">
      <Navbar currentPage={currentPage} setCurrentPage={setCurrentPage} />
      <main>{renderPage()}</main>
    </div>
  );
}

export default App;
