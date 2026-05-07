import React from 'react';
import CarAnimation from '../components/CarAnimation';
import GradientDescentViz from '../components/GradientDescentViz';

const Home = ({ setCurrentPage }) => {


  return (
    <div style={{ paddingTop: '3.75rem' }}>

      {/* ── Hero ── */}
      <section className="section" style={{ paddingTop: '3rem', paddingBottom: '4rem', borderBottom: '1px solid var(--border)' }}>
        <div className="container">
          <div className="hero-grid">

            {/* Left: text */}
            <div>
              <h1 style={{ maxWidth: '22ch', marginBottom: '2rem', fontSize: 'clamp(1.6rem, 3vw, 2.6rem)' }}>
                What car crashes in the City of Los Angeles end in injury — and which don't?
              </h1>

              <p style={{ fontSize: '1.05rem', lineHeight: 1.8, marginBottom: '1.25rem', maxWidth: '58ch' }}>
                When I moved to Los Angeles in the summer of 2024, I noticed that there were
                billboards everywhere — not just for movies, but for personal injury attorneys.
                "Why are these advertisements everywhere you turn?" I soon realized
                that car crashes aren't just common in Los Angeles, they are almost a guarantee.
              </p>
              <p style={{ fontSize: '1.05rem', lineHeight: 1.8, marginBottom: '2.5rem', maxWidth: '58ch' }}>
                After completing a supervised machine learning introductory course from Stanford
                and DeepLearning.AI, I wanted to try applying what I learned to a real world
                data set. I kept running into car crash data everywhere I looked. This led me
                to a simple question: can logistic regression accurately predict whether a car crash
                results in an injury?
              </p>

            </div>

            {/* Right: animation — hidden on very small screens via .hero-animation class */}
            <div className="hero-animation">
              <CarAnimation />
            </div>

          </div>
        </div>
      </section>

      {/* ── ML Concepts ── */}
      <section className="section" style={{ paddingTop: '3.5rem', paddingBottom: '3.5rem', borderBottom: '1px solid var(--border)' }}>
        <div className="container">
          <div className="section-label" style={{ marginBottom: '2rem' }}>Prediction and Analysis Process</div>
          <div className="home-ml-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '3rem' }}>

            {/* 1 — Logistic Regression */}
            <div>
              <svg viewBox="0 0 180 110" width="100%" height="160" aria-hidden="true">
                <line x1="10" y1="92" x2="172" y2="92" stroke="#ddd" strokeWidth="1"/>
                <line x1="10" y1="8"  x2="10"  y2="94" stroke="#ddd" strokeWidth="1"/>
                <polyline
                  points="10,89 25,88 45,83 65,72 90,52 115,32 135,18 158,12 172,10"
                  fill="none" stroke="#1a1a1a" strokeWidth="2.5"
                  strokeLinecap="round" strokeLinejoin="round"
                />
                <text x="14" y="90" fontSize="9" fill="#bbb">0</text>
                <text x="14" y="20" fontSize="9" fill="#bbb">1</text>
                <text x="91" y="106" fontSize="9" fill="#bbb" textAnchor="middle">inputs →</text>
              </svg>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.68rem', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--text)', fontWeight: 500, margin: '1.1rem 0 0.5rem' }}>Logistic Regression</div>
              <p style={{ maxWidth: 'none', fontSize: '0.95rem', lineHeight: 1.75 }}>Takes facts about a crash and outputs a single number between 0 and 1 — the estimated probability of injury.</p>
              <p style={{ maxWidth: 'none', fontSize: '0.82rem', lineHeight: 1.7, color: 'var(--text-muted)', marginTop: '0.65rem', fontStyle: 'italic' }}>Example: was a pedestrian involved? 0 = no, 1 = yes. Was it after midnight? 0 = no, 1 = yes. The model weighs dozens of inputs like this simultaneously.</p>
            </div>

            {/* 2 — Gradient Descent */}
            <div>
              <svg viewBox="0 0 180 110" width="100%" height="160" aria-hidden="true">
                <line x1="10" y1="92" x2="172" y2="92" stroke="#ddd" strokeWidth="1"/>
                <line x1="10" y1="8"  x2="10"  y2="94" stroke="#ddd" strokeWidth="1"/>
                <polyline
                  points="10,12 25,19 45,30 65,44 85,56 105,66 125,73 145,78 165,81 172,83"
                  fill="none" stroke="#1a1a1a" strokeWidth="2.5"
                  strokeLinecap="round" strokeLinejoin="round"
                />
                <text x="3"  y="16" fontSize="9" fill="#bbb">↑</text>
                <text x="14" y="90" fontSize="9" fill="#bbb">0</text>
                <text x="91" y="106" fontSize="9" fill="#bbb" textAnchor="middle">iterations →</text>
                <text x="3"  y="30" fontSize="8" fill="#bbb" writingMode="vertical-lr" transform="rotate(-90,8,55)">error</text>
              </svg>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.68rem', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--text)', fontWeight: 500, margin: '1.1rem 0 0.5rem' }}>Gradient Descent</div>
              <p style={{ maxWidth: 'none', fontSize: '0.95rem', lineHeight: 1.75 }}>The model starts with random guesses and makes thousands of small corrections, each time reducing its prediction error.</p>
              <p style={{ maxWidth: 'none', fontSize: '0.82rem', lineHeight: 1.7, color: 'var(--text-muted)', marginTop: '0.65rem', fontStyle: 'italic' }}>Example: iteration 1 → 42% error. Iteration 100 → 24% error. Iteration 1,000 → 16% error. Each pass nudges the model closer to the right answer.</p>
            </div>

            {/* 3 — Training Loop */}
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
        </div>
      </section>

      {/* ── The Data ── */}
      <section className="section" style={{ paddingTop: '4rem', paddingBottom: '4rem', borderBottom: '1px solid var(--border)' }}>
        <div className="container">
          <div className="section-label">The data: 15 years of LAPD collision reports</div>
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
              { n: '621,677', label: 'Collision records', sub: '2010 – 2024' },
              { n: '15',      label: 'Years of data',     sub: 'Jan 2010 – Dec 2024' },
              { n: '417,675', label: 'Labeled collisions', sub: 'Injury or no injury confirmed' },
              { n: '155',     label: 'Features engineered', sub: 'Per collision record' },
            ].map((s, i) => (
              <div
                key={s.label}
                style={{
                  borderTop: '2px solid var(--text)',
                  borderRight: i < 3 ? '1px solid var(--border)' : 'none',
                  paddingTop: '1.5rem',
                  paddingRight: i < 3 ? '2rem' : '0',
                  paddingLeft: i > 0 ? '2rem' : '0',
                }}
              >
                <div style={{ fontFamily: 'var(--font-serif)', fontSize: 'clamp(2.2rem, 3.5vw, 3.2rem)', fontWeight: 700, color: 'var(--text)', lineHeight: 1, marginBottom: '0.6rem' }}>{s.n}</div>
                <div style={{ fontFamily: 'var(--font-serif)', fontSize: '1rem', fontWeight: 500, color: 'var(--text)', marginBottom: '0.3rem' }}>{s.label}</div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6rem', letterSpacing: '0.1em', color: 'var(--text-muted)', textTransform: 'uppercase' }}>{s.sub}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How the model learns ── */}
      <section className="section" style={{ paddingTop: '4rem', paddingBottom: '5rem' }}>
        <div className="container">
          <div className="section-label">How the model learns by finding the weights</div>
          <p style={{ marginBottom: '3rem', maxWidth: '62ch' }}>
            A weight is the model's estimate of how much influence a given feature has on the outcome. 
            A large weight means that feature matters a lot, and a weight near zero means it contributes little.
            The model starts with zero knowledge: every weight is set to 0. Through 1,000 passes over the
            training data it makes a prediction, measures how wrong it is, and takes a small step in
            the direction that reduces error. This process is called gradient descent.
          </p>

          <GradientDescentViz />

          <div style={{ marginTop: '2.5rem', borderTop: '1px solid var(--border)', paddingTop: '1.75rem', maxWidth: '68ch' }}>
            <p style={{ fontSize: '0.95rem', lineHeight: 1.85 }}>
              A positive weight means that feature pushes the model toward predicting injury. A negative
              weight pushes toward no injury. The sign tells you the direction and the size tells you the
              strength.
            </p>
          </div>

          {/* ── Formula visualization ── */}
          <div style={{ marginTop: '2.5rem' }}>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.58rem', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '1rem' }}>
              The trained formula
            </div>
            <div style={{ background: 'var(--bg-subtle)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '2rem 2rem 2.25rem', overflowX: 'auto' }}>
              <svg viewBox="0 0 625 115" width="100%" style={{ minWidth: '480px' }} aria-label="Trained logistic regression formula with annotated weights">

                {/* ── Formula row ── */}
                <text fontFamily="monospace" fontSize="13.5" fill="#999" x="10" y="38">p(injury) = σ(</text>

                {/* +2.41·ped — black, annotated */}
                <text fontFamily="monospace" fontSize="13.5" fill="#1a1a1a" fontWeight="700" x="140" y="38">+2.41</text>
                <text fontFamily="monospace" fontSize="13.5" fill="#666" x="181" y="38">·ped</text>

                {/* +1.79·night */}
                <text fontFamily="monospace" fontSize="13.5" fill="#bbb" x="214" y="38"> + </text>
                <text fontFamily="monospace" fontSize="13.5" fill="#555" x="238" y="38">+1.79</text>
                <text fontFamily="monospace" fontSize="13.5" fill="#888" x="279" y="38">·night</text>

                {/* +0.62·bike */}
                <text fontFamily="monospace" fontSize="13.5" fill="#bbb" x="328" y="38"> + </text>
                <text fontFamily="monospace" fontSize="13.5" fill="#555" x="352" y="38">+0.62</text>
                <text fontFamily="monospace" fontSize="13.5" fill="#888" x="393" y="38">·bike</text>

                {/* −0.59·parked — muted, annotated */}
                <text fontFamily="monospace" fontSize="13.5" fill="#bbb" x="434" y="38"> − </text>
                <text fontFamily="monospace" fontSize="13.5" fill="#aaa" fontWeight="700" x="458" y="38">0.59</text>
                <text fontFamily="monospace" fontSize="13.5" fill="#ccc" x="491" y="38">·parked</text>

                {/* + … ) */}
                <text fontFamily="monospace" fontSize="13.5" fill="#ccc" x="556" y="38"> + … )</text>

                {/* ── Annotation 1: +2.41 (center x=160) ── */}
                <line x1="160" y1="45" x2="160" y2="78" stroke="#ddd" strokeWidth="1"/>
                <polygon points="157,75 160,81 163,75" fill="#ddd"/>
                <text fontFamily="monospace" fontSize="9" fill="#555" textAnchor="middle" x="160" y="93">pedestrian involved</text>
                <text fontFamily="monospace" fontSize="8.5" fill="#1a1a1a" fontWeight="600" textAnchor="middle" x="160" y="107">→ strongly predicts injury</text>

                {/* ── Annotation 2: −0.59 (center x=474) ── */}
                <line x1="474" y1="45" x2="474" y2="78" stroke="#ddd" strokeWidth="1"/>
                <polygon points="471,75 474,81 477,75" fill="#ddd"/>
                <text fontFamily="monospace" fontSize="9" fill="#777" textAnchor="middle" x="474" y="93">hit parked vehicle</text>
                <text fontFamily="monospace" fontSize="8.5" fill="#aaa" fontWeight="600" textAnchor="middle" x="474" y="107">→ predicts no injury</text>

              </svg>
            </div>
            <p style={{ marginTop: '0.85rem', maxWidth: 'none', fontSize: '0.82rem', lineHeight: 1.75, fontStyle: 'italic' }}>
              σ (sigma) denotes the sigmoid function, which maps a weighted sum to a value between 0 and 1,
              often interpreted as a probability. The model evaluates all 155 weighted features, adds the
              values together, and applies σ to compress the result to p(injury).
            </p>
          </div>
        </div>
      </section>

    </div>
  );
};

export default Home;
