import React, { useState } from 'react';
import './App.css';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import SlidingWindow from './pages/SlidingWindow';
import HowItWorks from './pages/HowItWorks';
import MapPage from './pages/MapPage';
import FormulaExplorer from './pages/FormulaExplorer';

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
      case 'formula-explorer': return <FormulaExplorer setCurrentPage={setCurrentPage} />;
      case 'sliding-window':   return <SlidingWindow setCurrentPage={setCurrentPage} />;
      case 'map':              return (
        <MapPage
          startYear={mapStartYear} setStartYear={setMapStartYear}
          endYear={mapEndYear}     setEndYear={setMapEndYear}
          filter={mapFilter}       setFilter={setMapFilter}
        />
      );
      case 'process':          return <HowItWorks setCurrentPage={setCurrentPage} />;
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
