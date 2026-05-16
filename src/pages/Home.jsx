import React from 'react';
import CarAnimation from '../components/CarAnimation';
import GradientDescentViz from '../components/GradientDescentViz';

const Home = ({ setCurrentPage }) => {
  const [activeTab, setActiveTab] = React.useState(0);

  const tabs = ['The Dataset', 'Prediction & Analysis', 'How the Model Learns', 'The Trained Model'];


  return (
    <div style={{ paddingTop: '3.75rem' }}>

      {/* ── Hero ── */}
      <section className="section page-hero" style={{ paddingTop: '3rem', paddingBottom: '4rem', borderBottom: '1px solid var(--border)' }}>
        <div className="container">
          <div className="hero-grid">

            {/* Left: text */}
            <div>
              <h1 style={{ maxWidth: '22ch', marginBottom: '2rem', fontSize: 'clamp(1.6rem, 3vw, 2.6rem)' }}>
                What car crashes in the City of Los Angeles end in injury — and which don't?
              </h1>

              <p style={{ fontSize: '1.05rem', lineHeight: 1.8, marginBottom: '1.25rem', maxWidth: '58ch' }}>
                When I moved to Los Angeles in 2024, I noticed that there were billboards
                everywhere — not just for movies, but for personal injury attorneys. "Why are
                these advertisements everywhere you turn?" I soon learned that car crashes are
                overwhelmingly common in Los Angeles.
              </p>
              <p style={{ fontSize: '1.05rem', lineHeight: 1.8, marginBottom: '0.75rem', maxWidth: '58ch' }}>
                After completing a supervised machine learning introductory course from Stanford
                and DeepLearning.AI, I wanted to apply what I learned to a real world data set.
                I found that the Los Angeles Police Department has kept detailed public car crash
                records for over a decade. This discovery led me to a simple question: can logistic
                regression accurately predict whether a car crash results in an injury?
              </p>
              <p style={{ fontSize: '1.05rem', lineHeight: 1.8, marginBottom: '0.6rem', maxWidth: '58ch' }}>
                Through my analysis, I discovered that predicting crash injuries became measurably
                harder after the pandemic, that LAPD's reporting left structural gaps which were a
                key driver of model variability over time, that some of the strongest signals shifted
                dramatically after 2020, and more.
              </p>
              <div style={{ maxWidth: '58ch', display: 'flex', justifyContent: 'flex-end', marginBottom: '2.5rem' }}>
                <button
                  onClick={() => {
                    setCurrentPage('process');
                    setTimeout(() => document.getElementById('findings')?.scrollIntoView({ behavior: 'smooth' }), 100);
                  }}
                  style={{
                    background: 'none',
                    border: '1px solid var(--border)',
                    borderRadius: 'var(--radius)',
                    padding: '0.2rem 0.6rem',
                    fontSize: '0.78rem',
                    fontFamily: 'var(--font-mono)',
                    color: 'var(--text-muted)',
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                  }}
                >
                  Skip to findings →
                </button>
              </div>

            </div>

            {/* Right: animation — hidden on very small screens via .hero-animation class */}
            <div className="hero-animation">
              <CarAnimation />
            </div>

          </div>
        </div>
      </section>

      {/* ── Tabbed Section ── */}
      <section className="section" style={{ paddingTop: '3.5rem', paddingBottom: '3.5rem', borderBottom: '1px solid var(--border)' }}>
        <div className="container">

          {/* Tab buttons */}
          <div className="tab-buttons" style={{ display: 'flex', gap: '0', borderBottom: '1px solid var(--border)', marginBottom: '0' }}>
            {tabs.map((tab, i) => (
              <button
                key={i}
                onClick={() => setActiveTab(i)}
                style={{
                  flex: 1,
                  background: activeTab === i ? 'var(--bg-card)' : 'transparent',
                  border: '1px solid var(--border)',
                  borderBottom: activeTab === i ? '1px solid var(--bg-card)' : '1px solid var(--border)',
                  borderRadius: '12px 12px 0 0',
                  marginBottom: activeTab === i ? '-1px' : '0',
                  padding: '0.85rem 1.5rem',
                  cursor: 'pointer',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.82rem',
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                  color: activeTab === i ? 'var(--text)' : 'var(--text-muted)',
                  fontWeight: activeTab === i ? 600 : 400,
                  transition: 'all 180ms',
                  marginRight: i < tabs.length - 1 ? '0.35rem' : '0',
                }}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Tab panel */}
          <div className="card" style={{ borderRadius: '0 var(--radius) var(--radius) var(--radius)', padding: '2.5rem', minHeight: '420px' }}>

            {/* Tab 0 — The Dataset */}
            {activeTab === 0 && (
              <div>
                <p style={{ marginBottom: '3rem', maxWidth: '62ch' }}>
                  Every record comes from the{' '}
                  <a href="https://data.lacity.org/Transportation/Traffic-Collision-Data-from-2010-to-Present/d5tf-ez2w" target="_blank" rel="noopener noreferrer">
                    LA City Open Data Portal
                  </a>
                  {' '}— collision reports filed by LAPD officers from January 2010 through December 2024.
                  {' '}This analysis reflects the data as filed. Crashes may go unreported, records may be mislabeled,
                  and classifications may vary across officers and precincts. These are limitations inherent to any
                  administrative dataset. The models here are only as accurate as the underlying reports allow.
                </p>
                <div className="home-stats-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0' }}>
                  {[
                    { n: '621,677', label: 'Collision records',    sub: '2010 – 2024' },
                    { n: '15',      label: 'Years of data',        sub: 'Jan 2010 – Dec 2024' },
                    { n: '417,675', label: 'Labeled collisions',   sub: 'Injury or no injury confirmed' },
                    { n: '155',     label: 'Features engineered',  sub: 'Derived from 18 raw data columns' },
                  ].map((s, i) => (
                    <div key={s.label} style={{ borderTop: '2px solid var(--text)', borderRight: i < 3 ? '1px solid var(--border)' : 'none', paddingTop: '1.5rem', paddingRight: i < 3 ? '2rem' : '0', paddingLeft: i > 0 ? '2rem' : '0' }}>
                      <div style={{ fontFamily: 'var(--font-serif)', fontSize: 'clamp(2.2rem, 3.5vw, 3.2rem)', fontWeight: 700, color: 'var(--text)', lineHeight: 1, marginBottom: '0.6rem' }}>{s.n}</div>
                      <div style={{ fontFamily: 'var(--font-serif)', fontSize: '1rem', fontWeight: 500, color: 'var(--text)', marginBottom: '0.3rem' }}>{s.label}</div>
                      <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6rem', letterSpacing: '0.1em', color: 'var(--text-muted)', textTransform: 'uppercase' }}>{s.sub}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Tab 1 — Prediction & Analysis */}
            {activeTab === 1 && (
              <div className="home-ml-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '3rem' }}>
                <div>
                  <svg viewBox="0 0 180 110" width="100%" height="160" aria-hidden="true">
                    <line x1="10" y1="92" x2="172" y2="92" stroke="#ddd" strokeWidth="1"/>
                    <line x1="10" y1="8"  x2="10"  y2="94" stroke="#ddd" strokeWidth="1"/>
                    <polyline points="10,89 25,88 45,83 65,72 90,52 115,32 135,18 158,12 172,10" fill="none" stroke="#1a1a1a" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                    <text x="14" y="90" fontSize="9" fill="#bbb">0</text>
                    <text x="14" y="20" fontSize="9" fill="#bbb">1</text>
                    <text x="91" y="106" fontSize="9" fill="#bbb" textAnchor="middle">inputs →</text>
                  </svg>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.68rem', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--text)', fontWeight: 500, margin: '1.1rem 0 0.5rem' }}>Logistic Regression</div>
                  <p style={{ maxWidth: 'none', fontSize: '0.95rem', lineHeight: 1.75 }}>Takes facts about a crash and outputs a single number between 0 and 1 — the estimated probability of injury.</p>
                  <p style={{ maxWidth: 'none', fontSize: '0.82rem', lineHeight: 1.7, color: 'var(--text-muted)', marginTop: '0.65rem', fontStyle: 'italic' }}>Example: was a pedestrian involved? 0 = no, 1 = yes. Was it after midnight? 0 = no, 1 = yes. The model weighs dozens of inputs like this simultaneously.</p>
                </div>
                <div>
                  <svg viewBox="0 0 180 110" width="100%" height="160" aria-hidden="true">
                    <line x1="10" y1="92" x2="172" y2="92" stroke="#ddd" strokeWidth="1"/>
                    <line x1="10" y1="8"  x2="10"  y2="94" stroke="#ddd" strokeWidth="1"/>
                    <polyline points="10,12 25,19 45,30 65,44 85,56 105,66 125,73 145,78 165,81 172,83" fill="none" stroke="#1a1a1a" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                    <text x="3"  y="16" fontSize="9" fill="#bbb">↑</text>
                    <text x="14" y="90" fontSize="9" fill="#bbb">0</text>
                    <text x="91" y="106" fontSize="9" fill="#bbb" textAnchor="middle">iterations →</text>
                    <text x="3"  y="30" fontSize="8" fill="#bbb" writingMode="vertical-lr" transform="rotate(-90,8,55)">error</text>
                  </svg>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.68rem', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--text)', fontWeight: 500, margin: '1.1rem 0 0.5rem' }}>Gradient Descent</div>
                  <p style={{ maxWidth: 'none', fontSize: '0.95rem', lineHeight: 1.75 }}>The model starts with random guesses and makes thousands of small corrections, each time reducing its prediction error.</p>
                  <p style={{ maxWidth: 'none', fontSize: '0.82rem', lineHeight: 1.7, color: 'var(--text-muted)', marginTop: '0.65rem', fontStyle: 'italic' }}>Example: iteration 1 → 42% error. Iteration 100 → 24% error. Iteration 1,000 → 16% error. Each pass nudges the model closer to the right answer.</p>
                </div>
                <div>
                  <svg viewBox="0 0 180 110" width="100%" height="160" aria-hidden="true">
                    <rect x="5"   y="10" width="68" height="26" rx="2" fill="#f2f2ee" stroke="#ddd" strokeWidth="0.9"/>
                    <text x="39"  y="26" fontSize="9" fill="#555" textAnchor="middle">Crash data</text>
                    <rect x="107" y="10" width="68" height="26" rx="2" fill="#f2f2ee" stroke="#ddd" strokeWidth="0.9"/>
                    <text x="141" y="26" fontSize="9" fill="#555" textAnchor="middle">Predict</text>
                    <rect x="107" y="74" width="68" height="26" rx="2" fill="#f2f2ee" stroke="#ddd" strokeWidth="0.9"/>
                    <text x="141" y="88" fontSize="8" fill="#555" textAnchor="middle">Compare to reality</text>
                    <rect x="5"   y="74" width="68" height="26" rx="2" fill="#1a1a1a" stroke="#1a1a1a" strokeWidth="0.9"/>
                    <text x="39"  y="88" fontSize="8.5" fill="white" textAnchor="middle">Adjust weights</text>
                    <line x1="73"  y1="23" x2="105" y2="23" stroke="#bbb" strokeWidth="0.9"/>
                    <polygon points="105,20.5 109,23 105,25.5" fill="#bbb"/>
                    <line x1="141" y1="36" x2="141" y2="72" stroke="#bbb" strokeWidth="0.9"/>
                    <polygon points="138.5,72 141,76 143.5,72" fill="#bbb"/>
                    <line x1="107" y1="87" x2="75"  y2="87" stroke="#bbb" strokeWidth="0.9"/>
                    <polygon points="75,84.5 71,87 75,89.5" fill="#bbb"/>
                    <line x1="39"  y1="74" x2="39"  y2="38" stroke="#bbb" strokeWidth="0.9"/>
                    <polygon points="36.5,38 39,34 41.5,38" fill="#bbb"/>
                  </svg>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.68rem', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--text)', fontWeight: 500, margin: '1.1rem 0 0.5rem' }}>Training Loop</div>
                  <p style={{ maxWidth: 'none', fontSize: '0.95rem', lineHeight: 1.75 }}>The model sees thousands of real crashes with known outcomes, compares its guesses to reality, and adjusts until accurate.</p>
                  <p style={{ maxWidth: 'none', fontSize: '0.82rem', lineHeight: 1.7, color: 'var(--text-muted)', marginTop: '0.65rem', fontStyle: 'italic' }}>Example: model predicts "no injury" → actual outcome was injury → weights for pedestrian involvement increase → repeat 385,000 times.</p>
                </div>
              </div>
            )}

            {/* Tab 2 — How the Model Learns */}
            {activeTab === 2 && (
              <div>
                <p style={{ marginBottom: '2rem', maxWidth: '62ch' }}>
                  A weight is the model's estimate of how much influence a given feature has on the outcome.
                  A large weight means that feature matters a lot, and a weight near zero means it contributes little.
                  The model starts with zero knowledge: every weight is set to 0. Over 1,000 passes through the
                  training data, it makes a prediction, measures how wrong it is, and takes a small step in
                  the direction that reduces error. This process is called gradient descent.
                </p>
                <GradientDescentViz />
              </div>
            )}

            {/* Tab 3 — The Formula */}
            {activeTab === 3 && (
              <div>
                <p style={{ marginBottom: '1.75rem', maxWidth: '62ch', fontSize: '0.95rem', lineHeight: 1.75 }}>
                  After training, the model assigns a weight to each of the 155 features. The final
                  prediction is the sigmoid function applied to the weighted sum — compressing it to
                  a probability between 0 and 1. Below are four of the top weights from the
                  2016–2018 training window (85.7% accuracy on 2019 collisions).
                </p>
                <div style={{ overflowX: 'auto', marginBottom: '1.5rem' }}>
                  <svg viewBox="0 0 610 115" width="100%" style={{ minWidth: '480px' }} aria-label="Trained logistic regression formula with annotated weights from 2016-2018 window">

                    {/* ── Formula row ── */}
                    <text fontFamily="monospace" fontSize="13.5" fill="#666" x="10" y="38">p(injury) = σ(</text>

                    <text fontFamily="monospace" fontSize="13.5" fill="#666" fontWeight="700" x="140" y="38">+1.01</text>
                    <text fontFamily="monospace" fontSize="13.5" fill="#666" fontWeight="700" x="181" y="38">·ped</text>

                    <text fontFamily="monospace" fontSize="13.5" fill="#666" x="222" y="38">−1.45</text>
                    <text fontFamily="monospace" fontSize="13.5" fill="#666" x="263" y="38">·hit_run</text>

                    <text fontFamily="monospace" fontSize="13.5" fill="#666" x="338" y="38">+0.61</text>
                    <text fontFamily="monospace" fontSize="13.5" fill="#666" x="379" y="38">·bike</text>

                    <text fontFamily="monospace" fontSize="13.5" fill="#666" x="420" y="38">−0.55</text>
                    <text fontFamily="monospace" fontSize="13.5" fill="#666" x="461" y="38">·parked</text>

                    <text fontFamily="monospace" fontSize="13.5" fill="#666" x="526" y="38"> + … )</text>

                    {/* ── Annotation: +1.01·ped ── */}
                    <line x1="160" y1="45" x2="160" y2="78" stroke="#ddd" strokeWidth="1"/>
                    <polygon points="157,75 160,81 163,75" fill="#ddd"/>
                    <text fontFamily="monospace" fontSize="9" fill="#555" textAnchor="middle" x="160" y="93">pedestrian involved</text>
                    <text fontFamily="monospace" fontSize="8.5" fill="#1a1a1a" fontWeight="600" textAnchor="middle" x="160" y="107">→ strongly predicts injury</text>

                  </svg>
                </div>
                <p style={{ maxWidth: 'none', fontSize: '0.82rem', lineHeight: 1.75, fontStyle: 'italic', color: 'var(--text-muted)' }}>
                  σ (sigma) is the sigmoid function — it maps any weighted sum to a value between 0 and 1,
                  interpreted as a probability. The model evaluates all 155 features, sums their weighted
                  values, and applies σ to produce p(injury).
                </p>
              </div>
            )}

          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="section" style={{ paddingTop: '3rem', paddingBottom: '3rem' }}>
        <div className="container" style={{ textAlign: 'center' }}>
          <button
            onClick={() => setCurrentPage('sliding-window')}
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
            Click to test trained model
          </button>
        </div>
      </section>

    </div>
  );
};

export default Home;
