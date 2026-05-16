import React, { useEffect, useRef, useState, useCallback } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

mapboxgl.accessToken = process.env.REACT_APP_MAPBOX_TOKEN;


const FILTER_TYPES = [
  { id: 'all',      label: 'All Crashes' },
  { id: 'injury',   label: 'Injury Only' },
  { id: 'noinjury', label: 'No Injury' },
];

const Map = ({ startYear, setStartYear, endYear, setEndYear, filter, setFilter }) => {
  const mapContainer = useRef(null);
  const map          = useRef(null);
  const [loading,     setLoading]     = useState(false);
  const [stats,       setStats]       = useState({ total: 0, injury: 0, noinjury: 0 });
  const [mapLoaded,   setMapLoaded]   = useState(false);
  const [legendOpen,  setLegendOpen]  = useState(false);

  // Initialize map
  useEffect(() => {
    if (map.current) return;

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/dark-v11',
      center: [-118.2437, 34.0522], // LA
      zoom: 10,
      minZoom: 8,
      maxZoom: 18,
    });

    map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');

    map.current.on('load', () => {
      // Add empty source
      map.current.addSource('collisions', {
        type: 'geojson',
        data: { type: 'FeatureCollection', features: [] },
        cluster: true,
        clusterMaxZoom: 13,
        clusterRadius: 50,
      });

      // ── Heatmap layer (zoomed out) ──
      map.current.addLayer({
        id: 'heatmap',
        type: 'heatmap',
        source: 'collisions',
        maxzoom: 13,
        paint: {
          'heatmap-weight': 1,
          'heatmap-intensity': ['interpolate', ['linear'], ['zoom'], 8, 0.6, 12, 1.5],
          'heatmap-color': [
            'interpolate', ['linear'], ['heatmap-density'],
            0,    'rgba(6,11,24,0)',
            0.2,  'rgba(45,212,191,0.3)',
            0.4,  'rgba(45,212,191,0.6)',
            0.6,  'rgba(232,200,122,0.8)',
            0.8,  'rgba(255,150,50,0.9)',
            1,    'rgba(255,80,80,1)',
          ],
          'heatmap-radius': ['interpolate', ['linear'], ['zoom'], 8, 15, 12, 25],
          'heatmap-opacity': ['interpolate', ['linear'], ['zoom'], 11, 1, 13, 0],
        },
      });

      // ── Cluster circles (mid zoom) ──
      map.current.addLayer({
        id: 'clusters',
        type: 'circle',
        source: 'collisions',
        filter: ['has', 'point_count'],
        minzoom: 10,
        maxzoom: 14,
        paint: {
          'circle-color': [
            'step', ['get', 'point_count'],
            '#2DD4BF', 50,
            '#E8C87A', 200,
            '#FF6B6B',
          ],
          'circle-radius': [
            'step', ['get', 'point_count'],
            18, 50, 25, 200, 32,
          ],
          'circle-opacity': 0.85,
        },
      });

      // ── Cluster count labels ──
      map.current.addLayer({
        id: 'cluster-count',
        type: 'symbol',
        source: 'collisions',
        filter: ['has', 'point_count'],
        minzoom: 10,
        maxzoom: 14,
        layout: {
          'text-field': '{point_count_abbreviated}',
          'text-font': ['DIN Offc Pro Medium', 'Arial Unicode MS Bold'],
          'text-size': 11,
        },
        paint: { 'text-color': '#060B18' },
      });

      // ── Individual pins (zoomed in) ──
      map.current.addLayer({
        id: 'unclustered',
        type: 'circle',
        source: 'collisions',
        filter: ['!', ['has', 'point_count']],
        minzoom: 13,
        paint: {
          'circle-color': [
            'case',
            ['==', ['get', 'injury'], true],  '#FF6B6B',
            ['==', ['get', 'injury'], false], '#2DD4BF',
            '#94A3B8',
          ],
          'circle-radius': 5,
          'circle-stroke-width': 1,
          'circle-stroke-color': '#060B18',
          'circle-opacity': 0.85,
        },
      });

      // ── Popup on individual pin click ──
      map.current.on('click', 'unclustered', (e) => {
        const props = e.features[0].properties;
        const coords = e.features[0].geometry.coordinates.slice();

        new mapboxgl.Popup({ offset: 10, className: 'collision-popup' })
          .setLngLat(coords)
          .setHTML(`
            <div style="font-family: 'Outfit', sans-serif; padding: 0.25rem;">
              <div style="font-size: 0.65rem; letter-spacing: 0.1em; text-transform: uppercase; color: ${(props.injury === true || props.injury === 'true') ? '#C0392B' : (props.injury === false || props.injury === 'false') ? '#0D7A6B' : '#555555'}; margin-bottom: 0.4rem; font-weight: 600;">
                ${(props.injury === true || props.injury === 'true') ? '⚠ Injury' : (props.injury === false || props.injury === 'false') ? '✓ No Injury' : '? Unknown'}
              </div>
              <div style="font-weight: 600; color: #1A1A1A; margin-bottom: 0.25rem;">${props.type || 'Collision'}</div>
              <div style="font-size: 0.8rem; color: #555555;">${props.area || ''}</div>
              <div style="font-size: 0.8rem; color: #555555;">${props.date || ''}</div>
            </div>
          `)
          .addTo(map.current);
      });

      // Zoom into cluster on click
      map.current.on('click', 'clusters', (e) => {
        const features = map.current.queryRenderedFeatures(e.point, { layers: ['clusters'] });
        const clusterId = features[0].properties.cluster_id;
        map.current.getSource('collisions').getClusterExpansionZoom(clusterId, (err, zoom) => {
          if (err) return;
          map.current.easeTo({ center: features[0].geometry.coordinates, zoom });
        });
      });

      // Cursor changes
      ['clusters', 'unclustered'].forEach(layer => {
        map.current.on('mouseenter', layer, () => { map.current.getCanvas().style.cursor = 'pointer'; });
        map.current.on('mouseleave', layer, () => { map.current.getCanvas().style.cursor = ''; });
      });

      setMapLoaded(true);
    });
  }, []);

  // Load GeoJSON data
  const loadData = useCallback(async () => {
    if (!map.current.getSource('collisions')) return;
    if (!mapLoaded || !map.current) return;
    setLoading(true);

    try {
      // Load all years in range
      const yearRange = [];
      for (let y = startYear; y <= endYear; y++) yearRange.push(y);

      const responses = await Promise.all(
        yearRange.map(y => fetch(`/data/collisions_${y}.geojson`).then(r => r.json()))
      );

      // Merge all features
      let allFeatures = responses.flatMap(r => r.features);

      // Apply injury filter
      if (filter === 'injury') {
        allFeatures = allFeatures.filter(f => f.properties.injury === true);
      } else if (filter === 'noinjury') {
        allFeatures = allFeatures.filter(f => f.properties.injury === false);
      }

      // Update stats
      const injuryCount   = allFeatures.filter(f => f.properties.injury === true).length;
      const noinjuryCount = allFeatures.filter(f => f.properties.injury === false).length;
      setStats({ total: allFeatures.length, injury: injuryCount, noinjury: noinjuryCount });

      // Update map source
      map.current.getSource('collisions').setData({
        type: 'FeatureCollection',
        features: allFeatures,
      });

    } catch (err) {
      console.error('Error loading GeoJSON:', err);
    }

    setLoading(false);
  }, [mapLoaded, startYear, endYear, filter]);

  // Reload when filters change
  useEffect(() => {
    loadData();
  }, [loadData]);

  return (
    <div className="map-page">

      {/* ── Controls ── */}
      <div className="map-controls">

        {/* Year range */}
        <div className="map-filter-group">
          <div className="map-filter-label">Start Year</div>
          <div className="map-range-slider">
            <input
              type="range"
              min={2010} max={2023}
              value={startYear}
              onChange={e => {
                const v = +e.target.value;
                setStartYear(v);
                if (v >= endYear) setEndYear(Math.min(v + 1, 2024));
              }}
            />
            <span className="map-range-value">{startYear}</span>
          </div>
        </div>

        <div className="map-filter-group">
          <div className="map-filter-label">End Year</div>
          <div className="map-range-slider">
            <input
              type="range"
              min={2011} max={2024}
              value={endYear}
              onChange={e => {
                const v = +e.target.value;
                setEndYear(v);
                if (v <= startYear) setStartYear(Math.max(v - 1, 2010));
              }}
            />
            <span className="map-range-value">{endYear}</span>
          </div>
        </div>

        {/* Injury filter */}
        <div className="map-filter-group">
          <div className="map-filter-label">Crash Type</div>
          <div className="map-filter-buttons">
            {FILTER_TYPES.map(f => (
              <button
                key={f.id}
                className={`map-filter-btn ${filter === f.id ? 'active' : ''}`}
                onClick={() => setFilter(f.id)}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* Stats */}
        <div className="map-stats">
          {loading ? (
  <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', color: 'var(--teal)' }}>
    Loading...
  </div>
    ) : (
      <>
        <div className="map-stat">
          <span className="map-stat-number">{stats.total.toLocaleString()}</span>
          <span className="map-stat-label">Total shown</span>
        </div>
        <div className="map-stat">
          <span className="map-stat-number" style={{ color: 'var(--red)' }}>
            {stats.injury.toLocaleString()}
          </span>
          <span className="map-stat-label">Confirmed injury</span>
        </div>
        <div className="map-stat">
          <span className="map-stat-number" style={{ color: 'var(--teal)' }}>
            {stats.noinjury.toLocaleString()}
          </span>
          <span className="map-stat-label">Confirmed no injury</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0' }}>
          <div className="map-stat">
            <span className="map-stat-number" style={{ color: 'var(--white-muted)' }}>
              {(stats.total - stats.injury - stats.noinjury).toLocaleString()}
            </span>
            <span className="map-stat-label">Unknown</span>
          </div>
          <span className="map-hint-mobile">Zoom in &amp; click a crash for details</span>
        </div>
      </>
    )}
        </div>
      </div>

      {/* ── Map ── */}
      <div className="map-container">
        <div ref={mapContainer} style={{ width: '100%', height: '100%' }} />

        {/* Hint box — hidden on mobile */}
        <div className="map-hint-box" style={{
          position: 'absolute',
          top: '1rem',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '20%',
          background: '#fff',
          borderRadius: '12px',
          padding: '0.65rem 1rem',
          zIndex: 10,
          textAlign: 'center',
          fontFamily: 'var(--font-sans)',
          fontSize: '0.8rem',
          color: '#333',
          lineHeight: 1.5,
          boxShadow: '0 2px 8px rgba(0,0,0,0.12)',
          pointerEvents: 'none',
        }}>
          Zoom in closely to find specific car crashes and click on them to see what happened
        </div>

        {/* Legend — always visible on desktop, collapsible on mobile */}
        <div className={`map-legend${legendOpen ? ' map-legend-open' : ''}`}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.6rem' }}>
            <div className="map-legend-title" style={{ margin: 0 }}>Clusters (zoomed out)</div>
            <button
              className="map-legend-close-btn"
              onClick={() => setLegendOpen(false)}
              style={{ background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'var(--font-mono)', fontSize: '1rem', color: 'var(--text-muted)', padding: 0, lineHeight: 1 }}
            >
              ×
            </button>
          </div>
          <div className="map-legend-item">
            <div className="map-legend-dot" style={{ background: '#2DD4BF' }} />
            Small (&lt;50 crashes)
          </div>
          <div className="map-legend-item">
            <div className="map-legend-dot" style={{ background: '#E8C87A' }} />
            Medium (50–200)
          </div>
          <div className="map-legend-item">
            <div className="map-legend-dot" style={{ background: '#FF6B6B' }} />
            Large (200+)
          </div>
          <div style={{ borderTop: '1px solid rgba(45,212,191,0.15)', marginTop: '0.75rem', paddingTop: '0.75rem' }}>
            <div className="map-legend-title">Individual Pins (zoom in)</div>
            <div className="map-legend-item">
              <div className="map-legend-dot" style={{ background: '#FF6B6B' }} />
              Injury collision
            </div>
            <div className="map-legend-item">
              <div className="map-legend-dot" style={{ background: '#2DD4BF' }} />
              No injury
            </div>
            <div className="map-legend-item">
              <div className="map-legend-dot" style={{ background: '#94A3B8' }} />
              Unknown
            </div>
          </div>
          <div style={{ borderTop: '1px solid rgba(45,212,191,0.15)', marginTop: '0.75rem', paddingTop: '0.75rem' }}>
            <div className="map-legend-item" style={{ fontSize: '0.65rem', color: 'var(--white-muted)' }}>
              Click any pin for details
            </div>
          </div>
        </div>

        {/* Toggle button — mobile only, shown when legend is closed */}
        {!legendOpen && (
          <button className="map-legend-toggle-btn" onClick={() => setLegendOpen(true)}>
            Click for key
          </button>
        )}
      </div>

    </div>
  );
};

export default Map;