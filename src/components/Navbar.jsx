import React from 'react';

const Navbar = ({ currentPage, setCurrentPage }) => {
  const links = [
    { id: 'home',             label: 'Home' },
    { id: 'sliding-window',   label: 'Prediction Model' },
    { id: 'formula-explorer', label: 'Formula Explorer' },
    { id: 'process',          label: 'Process & Findings' },
    { id: 'map',              label: 'Map' },
  ];

  return (
    <nav className="navbar">
      <div
        className="navbar-logo"
        onClick={() => setCurrentPage('home')}
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
              onClick={e => { e.preventDefault(); setCurrentPage(link.id); }}
            >
              {link.label}
            </a>
          </li>
        ))}

        <li>
          <div className="navbar-external">
            <a
              href="https://github.com"
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
    </nav>
  );
};

export default Navbar;
