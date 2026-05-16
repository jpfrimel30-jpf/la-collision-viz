import React, { useState } from 'react';

const Navbar = ({ currentPage, setCurrentPage }) => {
  const [menuOpen, setMenuOpen] = useState(false);

  const links = [
    { id: 'home',             label: 'Home' },
    { id: 'sliding-window',   label: 'Prediction Model' },
    { id: 'formula-explorer', label: 'Crash Scenario Explorer' },
    { id: 'process',          label: 'Findings and Process' },
    { id: 'map',              label: 'Map' },
  ];

  const navigate = (id) => {
    setCurrentPage(id);
    setMenuOpen(false);
  };

  return (
    <nav className="navbar">
      <div
        className="navbar-logo"
        onClick={() => navigate('home')}
      >
        Los Angeles Car Crash Analysis
      </div>

      <ul className="navbar-links">
        {links.map(link => (
          <li key={link.id} className={link.id === 'map' ? 'nav-hide' : ''}>
            {/* eslint-disable-next-line jsx-a11y/anchor-is-valid */}
            <a
              href="#"
              className={currentPage === link.id ? 'active' : ''}
              onClick={e => { e.preventDefault(); navigate(link.id); }}
            >
              {link.label}
            </a>
          </li>
        ))}

        <li>
          <div className="navbar-external">
            <a
              href="https://github.com/jpfrimel30-jpf"
              target="_blank"
              rel="noopener noreferrer"
              className="navbar-btn"
            >
              GitHub ↗
            </a>
            <a
              href="https://data.lacity.org/Transportation/Traffic-Collision-Data-from-2010-to-Present/d5tf-ez2w"
              target="_blank"
              rel="noopener noreferrer"
              className="navbar-btn"
            >
              LA Data ↗
            </a>
          </div>
        </li>
      </ul>

      {/* Hamburger button — mobile only */}
      <button
        className="nav-hamburger"
        onClick={() => setMenuOpen(v => !v)}
        aria-label="Toggle menu"
      >
        <span />
        <span />
        <span />
      </button>

      {/* Mobile dropdown */}
      {menuOpen && (
        <div className="nav-mobile-menu">
          {links.filter(l => l.id !== 'map').map(link => (
            // eslint-disable-next-line jsx-a11y/anchor-is-valid
            <a
              key={link.id}
              href="#"
              className={currentPage === link.id ? 'active' : ''}
              onClick={e => { e.preventDefault(); navigate(link.id); }}
            >
              {link.label}
            </a>
          ))}
          <div className="nav-mobile-external">
            <a href="https://github.com/jpfrimel30-jpf" target="_blank" rel="noopener noreferrer">GitHub ↗</a>
            <a href="https://data.lacity.org/Transportation/Traffic-Collision-Data-from-2010-to-Present/d5tf-ez2w" target="_blank" rel="noopener noreferrer">LA Data ↗</a>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
