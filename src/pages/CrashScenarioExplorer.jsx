import React, { useState, useMemo } from 'react';

// Era-specific intercepts from the 2016-2018 and 2021-2023 training windows
const BIAS = { pre: 0.5154, post: 0.1845 };

// Raw injury rates per period, computed from actual LAPD collision records
const RAW_RATES = {
  pre: {
    is_pedestrian: 0.9728, is_bike: 0.9487, is_motorcycle: 0.9468,
    is_multi_vehicle: 0.605, is_fixed_object: 0.3135, is_parked_vehicle: 0.1188,
    is_hit_and_run: 0.2203, is_intersection: 0.7668,
    is_unlicensed: 0.8268, is_dui_alcohol: 0.974, is_dui_drugs: 0.215,
    is_late_night: 0.414, is_rush_hour: 0.5615, is_weekend: 0.4917,
  },
  post: {
    is_pedestrian: 0.9808, is_bike: 0.9695, is_motorcycle: 0.9477,
    is_multi_vehicle: 0.5665, is_fixed_object: 0.2235, is_parked_vehicle: 0.1566,
    is_hit_and_run: 0.465, is_intersection: 0.7253,
    is_unlicensed: 0.6266, is_dui_alcohol: 0.975, is_dui_drugs: 0.218,
    is_late_night: 0.4304, is_rush_hour: 0.529, is_weekend: 0.493,
  },
};

const WEIGHTS = {
  pre: {
    // Collision type
    is_pedestrian: 1.0146, is_bike: 0.6061, is_motorcycle: 0.3639,
    is_multi_vehicle: 0.309, is_fixed_object: -0.2534, is_parked_vehicle: -0.5531,
    // Circumstances
    is_hit_and_run: -1.4499, is_intersection: 0.3163,
    is_unlicensed: 0.1195, is_dui_alcohol: 0.1404, is_dui_drugs: -0.0936,
    // Time
    is_late_night: 0.0567, is_rush_hour: 0.01, is_weekend: 0.0398,
    // Demographics
    sex_F: 0.1006, sex_M: -0.0391, sex_X: 0.0086,
    descent_A: 0.012, descent_B: 0.1208, descent_H: 0.0966,
    descent_O: -0.0286, descent_W: -0.0021, descent_X: -0.168,
    // LAPD divisions
    'area_77th Street': -0.1142, area_Central: 0.2949, area_Devonshire: -0.02,
    area_Foothill: -0.0686, area_Harbor: -0.0639, area_Hollenbeck: 0.2991,
    area_Hollywood: -0.1385, area_Mission: -0.0166, 'area_N Hollywood': -0.0545,
    area_Newton: 0.426, area_Northeast: 0.3894, area_Olympic: -0.134,
    area_Pacific: -0.0779, area_Rampart: 0.4458, area_Southeast: -0.069,
    area_Southwest: -0.1447, area_Topanga: -0.0337, 'area_Van Nuys': -0.0235,
    'area_West LA': -0.0638, 'area_West Valley': -0.0347, area_Wilshire: -0.0915,
    // Corridors
    is_broadway: 0.003, is_figueroa_st: -0.0187, is_olympic_blvd: 0.0185,
    is_pico_blvd: 0.0085, is_sepulveda_blvd: 0.0032, is_sunset_blvd: 0.0226,
    is_van_nuys_blvd: 0.0014, is_venice_blvd: 0.0166, is_vermont_ave: 0.0071,
    is_victory_blvd: 0.0286, is_western_ave: 0.0086,
  },
  post: {
    // Collision type
    is_pedestrian: 1.1453, is_bike: 0.6108, is_motorcycle: 0.4129,
    is_multi_vehicle: 0.0611, is_fixed_object: -0.3765, is_parked_vehicle: -0.6283,
    // Circumstances
    is_hit_and_run: -0.1528, is_intersection: 0.3777,
    is_unlicensed: 0.1275, is_dui_alcohol: 0.6981, is_dui_drugs: -0.2438,
    // Time
    is_late_night: 0.0694, is_rush_hour: 0.0122, is_weekend: 0.0858,
    // Demographics
    sex_F: 0.1467, sex_M: -0.0185, sex_X: -0.0622,
    descent_A: 0.0179, descent_B: 0.1223, descent_H: 0.0691,
    descent_O: -0.0496, descent_W: -0.0318, descent_X: -0.0351,
    // LAPD divisions
    'area_77th Street': -0.0186, area_Central: -0.0151, area_Devonshire: 0.0268,
    area_Foothill: 0.003, area_Harbor: 0.003, area_Hollenbeck: 0.0243,
    area_Hollywood: -0.0345, area_Mission: -0.0004, 'area_N Hollywood': -0.005,
    area_Newton: 0.024, area_Northeast: 0.0091, area_Olympic: -0.017,
    area_Pacific: 0.0279, area_Rampart: 0.0113, area_Southeast: -0.0059,
    area_Southwest: -0.0061, area_Topanga: 0.0698, 'area_Van Nuys': -0.0253,
    'area_West LA': -0.0399, 'area_West Valley': -0.0065, area_Wilshire: -0.0083,
    // Corridors
    is_broadway: 0.0058, is_figueroa_st: 0.0135, is_olympic_blvd: 0.0166,
    is_pico_blvd: 0.0155, is_sepulveda_blvd: 0.0264, is_sunset_blvd: 0.0395,
    is_van_nuys_blvd: -0.0086, is_venice_blvd: 0.0173, is_vermont_ave: 0.0116,
    is_victory_blvd: 0.0619, is_western_ave: 0.0341,
  },
};

// Radio groups — selecting one deselects siblings in the same group
const RADIO_GROUPS = {
  sex:      ['sex_F', 'sex_M', 'sex_X'],
  descent:  ['descent_A', 'descent_B', 'descent_H', 'descent_K', 'descent_O', 'descent_W', 'descent_X'],
  area:     ['area_77th Street','area_Central','area_Devonshire','area_Foothill','area_Harbor',
              'area_Hollenbeck','area_Hollywood','area_Mission','area_N Hollywood','area_Newton',
              'area_Northeast','area_Olympic','area_Pacific','area_Rampart','area_Southeast',
              'area_Southwest','area_Topanga','area_Van Nuys','area_West LA','area_West Valley',
              'area_Wilshire'],
  corridor: ['is_broadway','is_figueroa_st','is_olympic_blvd','is_pico_blvd',
              'is_sepulveda_blvd','is_sunset_blvd','is_van_nuys_blvd','is_venice_blvd',
              'is_vermont_ave','is_victory_blvd','is_western_ave'],
};

// Time feature pairs that cannot both be active
const MUTEX_PAIRS = [
  ['is_rush_hour', 'is_late_night'],
];


const FEATURE_GROUPS = [
  {
    label: 'Collision type',
    features: [
      { id: 'is_pedestrian',     label: 'Pedestrian involved' },
      { id: 'is_bike',           label: 'Bicyclist involved' },
      { id: 'is_motorcycle',     label: 'Motorcycle involved' },
      { id: 'is_multi_vehicle',  label: 'Multiple vehicles' },
      { id: 'is_fixed_object',   label: 'Hit fixed object' },
      { id: 'is_parked_vehicle', label: 'Hit parked vehicle' },
    ],
  },
  {
    label: 'Circumstances',
    features: [
      { id: 'is_hit_and_run',  label: 'Hit-and-run' },
      { id: 'is_intersection', label: 'At an intersection' },
      { id: 'is_unlicensed',   label: 'Unlicensed driver' },
      { id: 'is_dui_alcohol',  label: 'DUI — alcohol', footnote: 3 },
      { id: 'is_dui_drugs',    label: 'DUI — drugs',   footnote: 3 },
    ],
  },
  {
    label: 'Time',
    note: 'Late night and rush hour are mutually exclusive.',
    features: [
      { id: 'is_late_night', label: 'Late night (10pm–4am)' },
      { id: 'is_rush_hour',  label: 'Rush hour (7–9a, 4–7p)' },
      { id: 'is_weekend',    label: 'Weekend' },
    ],
  },
  {
    label: 'Victim — sex',
    footnote: 2,
    radioGroup: 'sex',
    note: 'Sex and descent reflect the injured party or primary victim of the crash.',
    features: [
      { id: 'sex_F', label: 'Female' },
      { id: 'sex_M', label: 'Male' },
      { id: 'sex_X', label: 'Unknown / Other' },
    ],
  },
  {
    label: 'Victim — descent',
    footnote: 2,
    radioGroup: 'descent',
    features: [
      { id: 'descent_A', label: 'Asian' },
      { id: 'descent_B', label: 'Black' },
      { id: 'descent_H', label: 'Hispanic / Latino' },
      { id: 'descent_O', label: 'Other' },
      { id: 'descent_W', label: 'White' },
      { id: 'descent_X', label: 'Unknown' },
    ],
  },
  {
    label: 'Location — LAPD division',
    radioGroup: 'area',
    note: 'Selecting a division clears any corridor selection, and vice versa.',
    grid: true,
    features: [
      { id: 'area_77th Street', label: '77th Street' },
      { id: 'area_Central',     label: 'Central',    footnote: 4 },
      { id: 'area_Devonshire',  label: 'Devonshire' },
      { id: 'area_Foothill',    label: 'Foothill' },
      { id: 'area_Harbor',      label: 'Harbor' },
      { id: 'area_Hollenbeck',  label: 'Hollenbeck', footnote: 4 },
      { id: 'area_Hollywood',   label: 'Hollywood' },
      { id: 'area_Mission',     label: 'Mission' },
      { id: 'area_N Hollywood', label: 'N Hollywood' },
      { id: 'area_Newton',      label: 'Newton',     footnote: 4 },
      { id: 'area_Northeast',   label: 'Northeast',  footnote: 4 },
      { id: 'area_Olympic',     label: 'Olympic' },
      { id: 'area_Pacific',     label: 'Pacific' },
      { id: 'area_Rampart',     label: 'Rampart',    footnote: 4 },
      { id: 'area_Southeast',   label: 'Southeast' },
      { id: 'area_Southwest',   label: 'Southwest' },
      { id: 'area_Topanga',     label: 'Topanga' },
      { id: 'area_Van Nuys',    label: 'Van Nuys' },
      { id: 'area_West LA',     label: 'West LA' },
      { id: 'area_West Valley', label: 'West Valley' },
      { id: 'area_Wilshire',    label: 'Wilshire' },
    ],
  },
  {
    label: 'Street corridor',
    footnote: 2,
    radioGroup: 'corridor',
    grid: true,
    features: [
      { id: 'is_broadway',       label: 'Broadway' },
      { id: 'is_figueroa_st',    label: 'Figueroa St' },
      { id: 'is_olympic_blvd',   label: 'Olympic Blvd' },
      { id: 'is_pico_blvd',      label: 'Pico Blvd' },
      { id: 'is_sepulveda_blvd', label: 'Sepulveda Blvd' },
      { id: 'is_sunset_blvd',    label: 'Sunset Blvd' },
      { id: 'is_van_nuys_blvd',  label: 'Van Nuys Blvd' },
      { id: 'is_venice_blvd',    label: 'Venice Blvd' },
      { id: 'is_vermont_ave',    label: 'Vermont Ave' },
      { id: 'is_victory_blvd',   label: 'Victory Blvd' },
      { id: 'is_western_ave',    label: 'Western Ave' },
    ],
  },
];

const PRESETS = [
  {
    label: 'Hit-and-run',
    ids: ['is_hit_and_run'],
    insight: 'The single largest weight change in the model: −1.45 pre-COVID → −0.15 post-COVID. The raw injury rate for hit-and-runs simultaneously doubled (22% → 47%). Two interpretations are both plausible and cannot be separated from this data alone: hit-and-runs may have genuinely become more dangerous post-COVID due to higher speeds and changed driver behavior, or LAPD may have shifted toward filing reports only for more serious hit-and-runs as capacity decreased — inflating the recorded injury rate without a change in actual danger. The model reports the weight shift; it cannot distinguish the cause.',
  },
  {
    label: 'Unlicensed driver',
    ids: ['is_unlicensed'],
    insight: 'The model weight for unlicensed driver involvement held between +0.11 and +0.13 from 2017 through 2024 — essentially unchanged. Yet the raw injury rate fell from 80.3% to 57.1% over the same period. The raw rate declined because the crashes around unlicensed drivers changed, not because unlicensed drivers themselves became less dangerous. The model controls for everything else and finds a stable, persistent injury penalty that raw statistics obscure.',
  },
  {
    label: 'Rush hour',
    ids: ['is_rush_hour'],
    insight: 'Rush hour (7–9am and 4–7pm) is one of the most counterintuitive results in the model. Despite being the time when roads are most congested and collisions most frequent, the injury weight has stayed effectively flat near zero across every training window — ranging between −0.001 and +0.024 with no directional trend. Congestion may actually limit severity by keeping speeds low.',
  },
  {
    label: 'Late night crash',
    ids: ['is_late_night'],
    insight: 'Late night (10pm–4am) is the only time-of-day feature that shows a consistent, gradual upward trend across the full study period — growing from +0.046 in 2013 to +0.067 in 2024. The signal is real but modest: empty roads and potential impairment likely contribute to more serious outcomes, but the weight remains a fraction of what crash type or circumstances contribute.',
  },
];

const sigmoid = z => 1 / (1 + Math.exp(-z));
const fmt = (n, d = 1) => (n * 100).toFixed(d) + '%';
const fmtW = w => (w >= 0 ? '+' : '') + w.toFixed(4);
const mono = { fontFamily: 'var(--font-mono)' };

export default function CrashScenarioExplorer({ setCurrentPage }) {
  const [period, setPeriod]             = useState('post');
  const [active, setActive]             = useState(new Set());
  const [activePreset, setActivePreset] = useState(null);

  const toggle = id => {
    setActivePreset(null);
    setActive(prev => {
      const next = new Set(prev);

      if (next.has(id)) {
        next.delete(id);
        return next;
      }

      next.add(id);

      // Radio group: deselect siblings
      for (const members of Object.values(RADIO_GROUPS)) {
        if (members.includes(id)) {
          members.forEach(m => { if (m !== id) next.delete(m); });
          break;
        }
      }

      // Location mutex: LAPD division and corridor are mutually exclusive with each other
      if (RADIO_GROUPS.area.includes(id)) {
        RADIO_GROUPS.corridor.forEach(c => next.delete(c));
      } else if (RADIO_GROUPS.corridor.includes(id)) {
        RADIO_GROUPS.area.forEach(a => next.delete(a));
      }

      // Time mutex pairs
      for (const [a, b] of MUTEX_PAIRS) {
        if (id === a) next.delete(b);
        if (id === b) next.delete(a);
      }

      return next;
    });
  };

  const applyPreset = (preset, idx) => {
    setActivePreset(idx);
    setActive(new Set(preset.ids));
  };

  const computeForPeriod = p =>
    BIAS[p] + [...active].reduce((sum, id) => sum + (WEIGHTS[p][id] ?? 0), 0);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const zCurrent = useMemo(() => computeForPeriod(period), [active, period]);
  const pCurrent = sigmoid(zCurrent);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const pPre     = useMemo(() => sigmoid(computeForPeriod('pre')),  [active]);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const pPost    = useMemo(() => sigmoid(computeForPeriod('post')), [active]);

  const activeFeatures = FEATURE_GROUPS
    .flatMap(g => g.features)
    .filter(f => active.has(f.id));

  // Raw rates for selected period — only features with known rates contribute to naive average
  const featuresWithRates = activeFeatures.filter(f => RAW_RATES[period][f.id] != null);
  const naiveRates        = featuresWithRates.map(f => RAW_RATES[period][f.id]);
  const naiveAvg  = naiveRates.length > 0 ? naiveRates.reduce((s, r) => s + r, 0) / naiveRates.length : null;
  const naiveMin  = naiveRates.length > 0 ? Math.min(...naiveRates) : null;
  const naiveMax  = naiveRates.length > 0 ? Math.max(...naiveRates) : null;
  const naiveDiff = naiveAvg !== null ? pCurrent - naiveAvg : null;

  const diff          = pPost - pPre;
  const currentPreset = activePreset !== null ? PRESETS[activePreset] : null;

  return (
    <div style={{ paddingTop: '3.75rem', minHeight: '100vh', background: 'var(--bg)' }}>
      <div className="container section page-hero">

        {/* Header */}
        <div style={{ marginBottom: '2.5rem', maxWidth: '680px' }}>
          <h2 style={{ marginBottom: '1rem' }}>Crash Scenario Explorer</h2>
          <p>
            Toggle features to build a hypothetical crash. The model computes an injury probability
            from the selected features' weights and shows how that prediction would have differed
            between the pre-COVID era (2016–2018 model) and the post-COVID era (2021–2023 model).
          </p>
          <p style={{ marginTop: '0.75rem', fontSize: '0.88rem', fontStyle: 'italic', color: 'var(--text-muted)' }}>
            Weights reflect statistical associations in the training data, not causal relationships. Multiple interpretations of any result are often valid and cannot be distinguished from the data alone.
          </p>

        </div>

        {/* Period toggle */}
        <div style={{ marginBottom: '2rem' }}>
          <div style={{ ...mono, fontSize: '0.58rem', letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '0.65rem' }}>
            Weights displayed
          </div>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            {[
              { key: 'pre',  label: 'Pre-COVID (2016–2018)',  sub: 'tested on 2019' },
              { key: 'post', label: 'Post-COVID (2021–2023)', sub: 'tested on 2024' },
            ].map(({ key, label, sub }) => (
              <button
                key={key}
                onClick={() => setPeriod(key)}
                style={{
                  ...mono, fontSize: '0.65rem', letterSpacing: '0.04em',
                  padding: '0.5rem 1.1rem',
                  border: `1px solid ${period === key ? 'var(--text)' : 'var(--border)'}`,
                  borderRadius: '2px', cursor: 'pointer',
                  background: period === key ? 'var(--text)' : 'var(--bg)',
                  color: period === key ? 'var(--bg)' : 'var(--text-sec)',
                  transition: 'all 180ms ease',
                }}
              >
                {label}<sup style={{ fontSize: '0.65em', verticalAlign: 'super', marginLeft: '1px' }}>1</sup>
                <span style={{ display: 'block', fontSize: '0.55rem', opacity: 0.7, marginTop: '0.1rem' }}>
                  {sub}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Preset scenarios */}
        <div style={{ marginBottom: '2.5rem' }}>
          <div style={{ ...mono, fontSize: '0.58rem', letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>
            Try a scenario
          </div>
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            {PRESETS.map((p, i) => (
              <button
                key={i}
                onClick={() => applyPreset(p, i)}
                style={{
                  ...mono, fontSize: '0.62rem', letterSpacing: '0.06em',
                  padding: '0.35rem 0.9rem',
                  border: '1px solid var(--border)', borderRadius: '2px', cursor: 'pointer',
                  background: activePreset === i ? 'var(--text)' : 'var(--bg)',
                  color: activePreset === i ? 'var(--bg)' : 'var(--text-sec)',
                  transition: 'all 180ms ease',
                }}
              >
                {p.label}
              </button>
            ))}
            {active.size > 0 && (
              <button
                onClick={() => { setActive(new Set()); setActivePreset(null); }}
                style={{
                  ...mono, fontSize: '0.62rem', letterSpacing: '0.06em',
                  padding: '0.35rem 0.9rem',
                  border: '1px solid var(--border)', borderRadius: '2px', cursor: 'pointer',
                  background: 'none', color: 'var(--text-muted)',
                }}
              >
                Clear
              </button>
            )}
          </div>
        </div>

        {/* Main grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2.5rem', alignItems: 'start' }}>

          {/* Left: feature toggles */}
          <div>
            {FEATURE_GROUPS.map(group => (
              <div key={group.label} style={{ marginBottom: '2rem' }}>

                {/* Group header */}
                <div style={{ paddingBottom: '0.5rem', borderBottom: '1px solid var(--border-light)', marginBottom: '0.6rem' }}>
                  <div style={{ ...mono, fontSize: '0.58rem', letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--text-muted)' }}>
                    {group.label}
                    {group.footnote && <sup style={{ fontSize: '0.7em', verticalAlign: 'super', marginLeft: '1px' }}>{group.footnote}</sup>}
                    {group.radioGroup && (
                      <span style={{ marginLeft: '0.5rem', opacity: 0.55 }}>· select one</span>
                    )}
                  </div>
                  {group.note && (
                    <div style={{ ...mono, fontSize: '0.57rem', color: 'var(--text-muted)', opacity: 0.7, marginTop: '0.25rem', fontStyle: 'italic' }}>
                      {group.note}
                    </div>
                  )}
                </div>

                {/* Feature rows — 2-col grid for large radio groups */}
                <div style={group.grid ? { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.25rem' } : {}}>
                  {group.features.map(f => {
                    const on = active.has(f.id);
                    const w  = WEIGHTS[period][f.id] ?? 0;
                    const weightColor = w > 0.01 ? 'var(--green)' : w < -0.01 ? 'var(--red)' : 'var(--text-muted)';
                    const isRadio = !!group.radioGroup;

                    return (
                      <div
                        key={f.id}
                        onClick={() => toggle(f.id)}
                        style={{
                          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                          padding: group.grid ? '0.45rem 0.6rem' : '0.5rem 0.65rem',
                          marginBottom: group.grid ? 0 : '0.25rem',
                          borderRadius: 'var(--radius)',
                          border: `1px solid ${on ? 'var(--text)' : 'var(--border-light)'}`,
                          background: on ? 'var(--bg-subtle)' : 'transparent',
                          cursor: 'pointer', transition: 'all 180ms ease', userSelect: 'none',
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          {/* Radio circle vs checkbox square */}
                          <div style={{
                            width: '11px', height: '11px', flexShrink: 0, transition: 'all 180ms ease',
                            borderRadius: isRadio ? '50%' : '2px',
                            border: `2px solid ${on ? 'var(--text)' : 'var(--border)'}`,
                            background: on ? 'var(--text)' : 'transparent',
                          }} />
                          <span style={{ ...mono, fontSize: '0.63rem', color: on ? 'var(--text)' : 'var(--text-sec)' }}>
                            {f.label}
                            {f.footnote && <sup style={{ fontSize: '0.7em', verticalAlign: 'super', marginLeft: '1px' }}>{f.footnote}</sup>}
                          </span>
                        </div>
                        <div style={{
                          ...mono, fontSize: '0.7rem', fontWeight: 600,
                          minWidth: '3rem', textAlign: 'right',
                          color: on ? weightColor : 'var(--text-muted)',
                          transition: 'color 180ms ease',
                        }}>
                          {w >= 0 ? '+' : ''}{w.toFixed(2)}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          {/* Right: sticky computation + comparison panels */}
          <div style={{ position: 'sticky', top: '5rem' }}>

            {/* Formula buildup */}
            <div style={{
              background: 'var(--bg-subtle)', border: '1px solid var(--border)',
              borderRadius: 'var(--radius-lg)', padding: '1.75rem', marginBottom: '1.25rem',
            }}>
              <div style={{ ...mono, fontSize: '0.58rem', letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '1.25rem' }}>
                Model computation — {period === 'pre' ? 'pre-COVID weights' : 'post-COVID weights'}
              </div>

              <div style={{ ...mono, fontSize: '0.72rem', lineHeight: 2, color: 'var(--text-sec)' }}>
                <div><span style={{ color: 'var(--text-muted)' }}>p(injury) = σ(</span></div>
                <div style={{ paddingLeft: '1.5rem' }}>
                  <span style={{ color: 'var(--text-muted)' }}>baseline</span>
                  <span style={{ color: 'var(--text)', fontWeight: 600 }}> +{BIAS[period].toFixed(4)}</span>
                </div>
                {activeFeatures.length === 0 && (
                  <div style={{ paddingLeft: '1.5rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>
                    — select features above —
                  </div>
                )}
                {activeFeatures.map(f => {
                  const w = WEIGHTS[period][f.id] ?? 0;
                  return (
                    <div key={f.id} style={{ paddingLeft: '1.5rem', display: 'flex', gap: '0.5rem' }}>
                      <span style={{ color: w >= 0 ? 'var(--green)' : 'var(--red)', fontWeight: 600, minWidth: '3.5rem' }}>
                        {fmtW(w)}
                      </span>
                      <span style={{ color: 'var(--text-muted)' }}>·</span>
                      <span style={{ color: 'var(--text-sec)' }}>{f.label.toLowerCase()}</span>
                    </div>
                  );
                })}
                <div><span style={{ color: 'var(--text-muted)' }}>)</span></div>

                <div style={{ marginTop: '0.5rem', borderTop: '1px solid var(--border-light)', paddingTop: '0.75rem' }}>
                  <span style={{ color: 'var(--text-muted)' }}>z = </span>
                  <span style={{ color: 'var(--text)', fontWeight: 600 }}>{zCurrent.toFixed(4)}</span>
                </div>
                <div>
                  <span style={{ color: 'var(--text-muted)' }}>σ(z) = </span>
                  <span style={{ color: 'var(--text)', fontWeight: 700, fontSize: '0.9rem' }}>{fmt(pCurrent)}</span>
                  <span style={{ ...mono, fontSize: '0.6rem', color: 'var(--text-muted)', marginLeft: '0.5rem' }}>
                    estimated probability of injury
                  </span>
                </div>
              </div>

              <div style={{ marginTop: '1.25rem' }}>
                <div style={{ height: '6px', background: 'var(--border-light)', borderRadius: '3px', overflow: 'hidden' }}>
                  <div style={{
                    height: '100%', width: `${pCurrent * 100}%`,
                    background: pCurrent > 0.65 ? 'var(--red)' : pCurrent > 0.45 ? 'var(--amber)' : 'var(--text-muted)',
                    borderRadius: '3px', transition: 'width 350ms ease, background 350ms ease',
                  }} />
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.3rem', ...mono, fontSize: '0.58rem', color: 'var(--text-muted)' }}>
                  <span>0%</span><span>50%</span><span>100%</span>
                </div>
              </div>
            </div>

            {/* Raw rate vs model */}
            <div style={{
              background: 'var(--bg-subtle)', border: '1px solid var(--border)',
              borderRadius: 'var(--radius-lg)', padding: '1.75rem', marginBottom: '1.25rem',
            }}>
              <div style={{ ...mono, fontSize: '0.58rem', letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '1.25rem' }}>
                Raw rate vs model
              </div>
              {active.size === 0 ? (
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', ...mono }}>
                  Select features to see how the model diverges from raw rates.
                </p>
              ) : naiveAvg === null ? (
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', ...mono }}>
                  No raw rates available for the selected features.
                </p>
              ) : featuresWithRates.length === 1 ? (
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', ...mono }}>
                  With one feature the model and raw rate are close. Add a second to see them diverge.
                </p>
              ) : (
                <>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                    <div style={{ background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '1rem' }}>
                      <div style={{ ...mono, fontSize: '0.55rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
                        Raw rate avg ¹
                      </div>
                      <div style={{ fontFamily: 'var(--font-serif)', fontSize: '1.9rem', fontWeight: 700, color: 'var(--text-sec)', lineHeight: 1 }}>
                        {fmt(naiveAvg)}
                      </div>
                      <div style={{ ...mono, fontSize: '0.56rem', color: 'var(--text-muted)', marginTop: '0.4rem' }}>
                        range: {fmt(naiveMin)} – {fmt(naiveMax)}
                      </div>
                      <div style={{ ...mono, fontSize: '0.54rem', color: 'var(--text-muted)', marginTop: '0.3rem', opacity: 0.75, lineHeight: 1.45 }}>
                        spread of individual raw injury rates across the selected features
                      </div>
                    </div>
                    <div style={{ background: 'var(--bg)', border: '1px solid var(--text)', borderRadius: 'var(--radius)', padding: '1rem' }}>
                      <div style={{ ...mono, fontSize: '0.55rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
                        Model prediction ²
                      </div>
                      <div style={{ fontFamily: 'var(--font-serif)', fontSize: '1.9rem', fontWeight: 700, color: 'var(--text)', lineHeight: 1 }}>
                        {fmt(pCurrent)}
                      </div>
                      <div style={{
                        ...mono, fontSize: '0.56rem', marginTop: '0.4rem', fontWeight: Math.abs(naiveDiff) > 0.05 ? 600 : 400,
                        color: Math.abs(naiveDiff) > 0.05 ? (naiveDiff > 0 ? 'var(--red)' : 'var(--green)') : 'var(--text-muted)',
                      }}>
                        {naiveDiff >= 0 ? '+' : ''}{fmt(naiveDiff)} vs raw avg
                      </div>
                    </div>
                  </div>
                  {Math.abs(naiveDiff) > 0.08 && (
                    <div style={{ background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '0.9rem', ...mono, fontSize: '0.68rem', color: 'var(--text-sec)' }}>
                      {naiveDiff > 0
                        ? 'The model predicts higher injury probability than a simple average of raw rates — these features compound above the baseline when considered together.'
                        : 'The model predicts lower injury probability than a simple average of raw rates — one or more features carry strong negative weights that pull the prediction down.'
                      }
                    </div>
                  )}
                  <div style={{ ...mono, fontSize: '0.57rem', color: 'var(--text-muted)', marginTop: '1rem', borderTop: '1px solid var(--border-light)', paddingTop: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.5rem', lineHeight: 1.55 }}>
                    <div>¹ <strong style={{ fontWeight: 600 }}>Raw rate avg:</strong> the proportion of crashes involving each selected feature that resulted in injury, measured directly from LAPD records. No other variables are held constant — it simply reflects how often an injury occurred when that feature was present.</div>
                    <div>² <strong style={{ fontWeight: 600 }}>Model prediction:</strong> the logistic regression estimate, which weights each feature while holding all others constant. Because features can push in opposite directions simultaneously, this figure often diverges from a naive average of raw rates — particularly when a high-injury feature is combined with one carrying a strong negative weight.</div>
                  </div>
                </>
              )}
            </div>

            {/* Pre vs Post comparison */}
            <div style={{
              background: 'var(--bg-subtle)', border: '1px solid var(--border)',
              borderRadius: 'var(--radius-lg)', padding: '1.75rem', marginBottom: '1.25rem',
            }}>
              <div style={{ ...mono, fontSize: '0.58rem', letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '1.25rem' }}>
                Pre-COVID vs Post-COVID
              </div>

              {active.size === 0 ? (
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', ...mono }}>
                  Select features to compare predictions across eras.
                </p>
              ) : (
                <>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                    {[
                      { key: 'pre',  label: 'Pre-COVID',  sub: '2016–2018 model', p: pPre },
                      { key: 'post', label: 'Post-COVID', sub: '2021–2023 model', p: pPost },
                    ].map(({ key, label, sub, p }) => (
                      <div key={key} style={{
                        background: 'var(--bg)',
                        border: `1px solid ${period === key ? 'var(--text)' : 'var(--border)'}`,
                        borderRadius: 'var(--radius)', padding: '1rem',
                      }}>
                        <div style={{ ...mono, fontSize: '0.55rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
                          {label}
                        </div>
                        <div style={{ fontFamily: 'var(--font-serif)', fontSize: '1.9rem', fontWeight: 700, color: 'var(--text)', lineHeight: 1 }}>
                          {fmt(p)}
                        </div>
                        <div style={{ ...mono, fontSize: '0.56rem', color: 'var(--text-muted)', marginTop: '0.4rem' }}>
                          {sub}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Delta callout */}
                  {Math.abs(diff) > 0.02 && (
                    <div style={{
                      background: 'var(--bg)', border: '1px solid var(--border)',
                      borderRadius: 'var(--radius)', padding: '0.9rem', marginBottom: '0.75rem',
                      ...mono, fontSize: '0.68rem', color: 'var(--text-sec)',
                    }}>
                      <span style={{
                        fontWeight: 700,
                        color: Math.abs(diff) > 0.08
                          ? (diff > 0 ? 'var(--red)' : 'var(--green)')
                          : 'var(--text-sec)',
                      }}>
                        {diff > 0 ? '▲' : '▼'} {fmt(Math.abs(diff))} shift
                      </span>
                      {' '}post-COVID vs pre-COVID for this scenario.
                    </div>
                  )}

                  {/* Preset insight */}
                  {currentPreset && (
                    <div style={{
                      background: 'var(--bg)', border: '1px solid var(--border)',
                      borderRadius: 'var(--radius)', padding: '1rem',
                      fontFamily: 'var(--font-serif)', fontSize: '0.82rem',
                      color: 'var(--text-sec)', lineHeight: 1.65, fontStyle: 'italic',
                    }}>
                      {currentPreset.insight}
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Legend + disclosures */}
            <div style={{ ...mono, fontSize: '0.58rem', color: 'var(--text-muted)', display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
              <span><span style={{ color: 'var(--green)', fontWeight: 600 }}>+ weight</span> → increases injury probability</span>
              <span><span style={{ color: 'var(--red)', fontWeight: 600 }}>− weight</span> → decreases injury probability</span>
              <span style={{ marginTop: '0.4rem', opacity: 0.75, lineHeight: 1.5 }}>
                <sup style={{ fontSize: '0.8em', verticalAlign: 'super', marginRight: '2px', color: 'var(--text-sec)' }}>1</sup>
                Baseline is era-specific: pre-COVID +{BIAS.pre.toFixed(4)}, post-COVID +{BIAS.post.toFixed(4)}. Derived from the 2016–2018 and 2021–2023 training windows respectively.
              </span>
              <span style={{ opacity: 0.75, lineHeight: 1.5 }}>
                <sup style={{ fontSize: '0.8em', verticalAlign: 'super', marginRight: '2px', color: 'var(--text-sec)' }}>2</sup>
                Corridor features are derived from LAPD incident address strings. Sex and descent reflect the injured party or primary victim of the crash.
              </span>
              <span style={{ opacity: 0.75, lineHeight: 1.5 }}>
                <sup style={{ fontSize: '0.8em', verticalAlign: 'super', marginRight: '2px', color: 'var(--text-sec)' }}>3</sup>
                DUI — alcohol and DUI — drugs bookings increased roughly 7x in the post-COVID period (2021–2023 vs 2016–2018), while injury rates for each remained nearly identical across eras. The weight changes reflect the volume of additional evidence the model was trained on, not a change in the underlying association.
              </span>
              <span style={{ opacity: 0.75, lineHeight: 1.5 }}>
                <sup style={{ fontSize: '0.8em', verticalAlign: 'super', marginRight: '2px', color: 'var(--text-sec)' }}>4</sup>
                The Rampart, Newton, Northeast, Central, and Hollenbeck divisions recorded injury rates of 99–100% in the pre-COVID period, which is almost certainly a reporting artifact — those divisions likely filed formal reports only for crashes serious enough to result in injury, undercounting minor crashes. Weights for all five collapsed post-COVID as reported injury rates normalized to near the citywide average (43–53%).
              </span>
            </div>
            <div style={{ textAlign: 'center', marginTop: '2.5rem' }}>
              <button
                onClick={() => setCurrentPage('process')}
                style={{
                  background: '#1a1a1a',
                  color: '#fff',
                  border: 'none',
                  borderRadius: 'var(--radius)',
                  padding: '0.85rem 2rem',
                  fontSize: '0.95rem',
                  fontFamily: 'var(--font-sans)',
                  cursor: 'pointer',
                  letterSpacing: '0.02em',
                }}
              >
                Click to see the process and learn about the findings
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
