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

  const renderPage = () => {
    switch (currentPage) {
      case 'home':             return <Home setCurrentPage={setCurrentPage} />;
      case 'formula-explorer': return <FormulaExplorer />;
      case 'sliding-window':   return <SlidingWindow />;
      case 'map':              return <MapPage />;
      case 'process':          return <HowItWorks />;
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
