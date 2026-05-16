import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';

const Navbar = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();

  const links = [
    { path: '/',                        label: 'Home' },
    { path: '/prediction-model',        label: 'Prediction Model' },
    { path: '/crash-scenario-explorer', label: 'Crash Scenario Explorer' },
    { path: '/findings-and-process',    label: 'Findings and Process' },
  ];

  const closeMenu = () => setMenuOpen(false);

  return (
    <nav className="navbar">
      <div
        className="navbar-logo"
        onClick={() => { navigate('/'); closeMenu(); }}
      >
        Los Angeles Car Crash Analysis
      </div>

      <ul className="navbar-links">
        {links.map(link => (
          <li key={link.path}>
            <NavLink
              to={link.path}
              end={link.path === '/'}
              className={({ isActive }) => isActive ? 'active' : ''}
            >
              {link.label}
            </NavLink>
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
          {links.map(link => (
            <NavLink
              key={link.path}
              to={link.path}
              end={link.path === '/'}
              className={({ isActive }) => isActive ? 'active' : ''}
              onClick={closeMenu}
            >
              {link.label}
            </NavLink>
          ))}
          <NavLink to="/map" onClick={closeMenu}>Map</NavLink>
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
