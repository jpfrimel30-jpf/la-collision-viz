import React, { useState } from 'react';
import CarAnimation from '../components/CarAnimation';
import GradientDescentViz from '../components/GradientDescentViz';

// ── Findings data ─────────────────────────────────────────────────────────────

const findings = [
  {
    number: '01',
    title: 'Predicting car crash injuries became measurably harder after the pandemic: post-COVID models are 9 points less accurate than pre-COVID ones.',
    summary: 'Models trained and tested on pre-pandemic data consistently achieved ~85.7% accuracy. Models trained and tested on post-pandemic data achieved only ~76.4% — a 9-point gap. The drop reflects a structural shift in the collision data between the two eras, driven largely by changes in LAPD reporting practices rather than gradual drift in driving behavior or crash composition.',
    stats: [
      { value: '85.7%',  label: '2016–2018 trained, tested 2019' },
      { value: '76.4%',  label: '2021–2023 trained, tested 2024' },
      { value: '−9.3pp', label: 'Accuracy decline' },
      { value: '91',     label: 'Total windows evaluated' },
    ],
    body: 'When testing on 2024 collisions, a model trained on just 2022–2023 data (2 years) achieves 77.0% accuracy. A model trained on 2010–2023 data (14 years) achieves only 68.2%. The additional 12 years of pre-COVID data actively reduces predictive performance. This is consistent with a structural break in the underlying data-generating process rather than gradual behavioral drift. Five LAPD divisions recorded near-100% injury rates pre-COVID, a spurious pattern the model weighted heavily that disappeared when those rates normalized post-COVID.',
  },
  {
    number: '02',
    title: 'Pre-COVID, a hit-and-run was the strongest signal that a crash would not result in injury. Post-COVID, that signal nearly vanished.',
    summary: 'Hit-and-run involvement shifted from the single largest negative injury predictor to a near-zero weight between representative pre- and post-COVID windows. The signal measured −1.45 in the 2016–2018 window and −0.15 in the 2021–2023 window.',
    stats: [
      { value: '−1.45', label: 'Pre-COVID weight (2016–2018 → 2019)' },
      { value: '−0.15', label: 'Post-COVID weight (2021–2023 → 2024)' },
      { value: '89%',   label: 'Drop in signal magnitude' },
      { value: '2020',  label: 'Year decline began' },
    ],
    body: 'From 2010 to 2019, is_hit_and_run was consistently the single largest negative predictor — regularly around −1.4 to −1.5. After 2020, the weight began a rapid descent. By 2021–2022 windows, it had fallen to around −0.21, and even reached −0.05 in 2024. A large negative weight meant hit-and-run involvement was one of the strongest signals that a crash would not result in injury — the model consistently learned that fleeing drivers tend to be involved in less severe collisions. As that weight collapsed toward zero, this relationship effectively disappeared from the model\'s predictions. The behavioral assumption that made this signal reliable — that drivers who flee are involved in minor collisions — appears to have broken down.',
    contrast: 'The collapse coincides with the post-COVID crash volume drop of ~63%. If only more serious crashes were being reported post-COVID, hit-and-run may no longer serve as a reliable proxy for collision severity. An alternative interpretation is that post-COVID hit-and-run crashes are genuinely more dangerous. Both explanations are consistent with the data, and the two cannot be distinguished with the available information.',
  },
  {
    number: '03',
    title: 'No neighborhood in Los Angeles consistently stood out as higher or lower injury risk once crash circumstances were accounted for.',
    summary: 'To test whether location affects injury risk, Los Angeles was divided into a geographic grid using each collision\'s GPS coordinates. 83 distinct zones were created by rounding latitude and longitude to the nearest 0.05 degrees, each roughly 3.5 miles wide. Each zone was ranked by its model weight across every two-year training window, and those ranks were averaged to find which areas consistently appeared at the top or bottom. Across the 60 zones with sufficient data, model weights clustered tightly. The average absolute weight was just 0.02, with most zones falling between +0.05 and −0.07. No cluster of zones stood out as dramatically riskier than another. A small group of zones in the South Bay and Pico-Union areas showed the most consistent signal, averaging around −0.07, while the rest of the city produced weights close to zero. In addition, 24 zones were excluded from this analysis because they fell within five LAPD divisions that recorded pre-COVID injury rates of 99–100%, compared to a citywide average of roughly 57%. The most likely explanation is that those divisions only filed formal reports for injury crashes before 2020, omitting minor incidents entirely. However this cannot be verified from the records alone.',
    stats: [
      { value: '60',     label: 'Clean grid cells after removing reporting-artifact zones' },
      { value: '0.02',   label: 'Avg absolute weight across all clean cells' },
      { value: '+0.01',  label: 'Avg post-COVID weight — West LA and Valley top cluster' },
      { value: '−0.07',  label: 'Avg post-COVID weight — South Bay and Pico-Union bottom cluster' },
    ],
    body: 'After excluding the 24 grid cells that drew the majority of their collisions from the five outlier LAPD divisions, the remaining 60 clean cells told a very different story. The top-ranked cells shifted to the West LA and northern Valley areas, but their average weights were negligible — the top five cells averaged only +0.01 post-COVID. The average absolute weight across all 60 clean cells was 0.02, which is small enough that location adds almost no predictive power once crash type, time of day, and other factors are already in the model. The bottom of the distribution was more consistent. Cells covering the South Bay and Harbor area and the Pico-Union corridor consistently ranked lowest, with average weights around −0.07 and lower rank variability than the rest of the city.',
    contrast: 'To put the magnitude in perspective, a crash at an intersection carried a model weight of +0.37 post-COVID, and a multi-vehicle crash carried +0.24. The average location grid cell weight of 0.02 is roughly ten to eighteen times smaller than those. The South Bay and Pico-Union cells at around -0.07 are more meaningful in comparison, but still a fraction of what crash circumstances contribute. The geographic signal also collapsed 45% post-COVID overall, meaning even the modest bottom-cluster signal weakened further after the pandemic. Location in Los Angeles is a weak predictor of whether a crash results in an injury.',
  },
  {
    number: '04',
    title: 'Rush hour driving is not a meaningful injury predictor, but late night driving carries a small, consistent signal.',
    summary: 'Rush hour (7–9am and 4–7pm), when roads are congested, might seem like the most dangerous time for a serious crash injury. More cars on the road means more chances for a collision, and busier roads might imply more serious outcomes. The data consistently contradicts this intuition. Across every 2-year training window from 2013 through 2024, rush hour remained effectively flat, fluctuating between −0.001 and +0.024 with no directional trend. Late night collisions (10pm–4am), were a slightly stronger predictor throughout the same period, with the weight growing gradually from +0.046 in 2013 to +0.067 in 2024. Even so, both signals are small in absolute terms compared to other factors in the model. Late night driving as an injury predictor is real but modest. The 2012 test year is excluded from these comparisons since both factors registered abnormally high in that window relative to every subsequent year.',
    stats: [
      { value: '+0.025', label: 'Rush hour weight in 2013' },
      { value: '+0.016', label: 'Rush hour weight in 2024' },
      { value: '+0.046', label: 'Late night weight in 2013' },
      { value: '+0.067', label: 'Late night weight in 2024' },
    ],
    body: 'Rush hour congestion may limit collision severity through lower vehicle speeds and higher driver alertness, while late night conditions like emptier roads and potential impairment could contribute to more serious outcomes. These explanations are consistent with the data but cannot be confirmed from collision records alone. Despite the intuitive case for late night as a risk factor, its model weight remains modest, consistently present across every 2-year window in the study period, but not a dominant predictor.',
    contrast: 'By 2024, late night outpaced rush hour by a factor of roughly 4, and was the only temporal feature to show a gradual upward trajectory over the study period. At +0.067, however, it remained a fraction of unlicensed driver involvement (+0.132 in 2024), itself not a top-tier predictor. The late night signal is real and worth noting, but small relative to what the model actually weighs most heavily.',
  },
  {
    number: '05',
    title: 'Unlicensed drivers have been consistently dangerous for a decade, even as raw injury rates fell and obscured it.',
    summary: "On the surface, crashes involving unlicensed drivers look like they have become less dangerous over time. The raw injury rate — simply how often an unlicensed driver crash resulted in injury — dropped from 80.3% in 2017 to 57.1% in 2024. However, once the model controls for everything else happening in the crash, the independent injury penalty attached to unlicensed driver involvement barely moved, holding between +0.11 and +0.13 for nearly a decade. The raw rate fell because the crashes around unlicensed drivers changed — not because unlicensed drivers themselves became less dangerous.",
    stats: [
      { value: '80.3%',  label: 'Raw injury rate (2017)' },
      { value: '57.1%',  label: 'Raw injury rate (2024)' },
      { value: '+0.107', label: 'Model weight (2017, earliest reliable window)' },
      { value: '+0.132', label: 'Model weight (2024)' },
    ],
    body: "Between 2017 and 2024, the raw injury rate for unlicensed driver crashes fell from 80.3% to 57.1% — a drop of more than 23 percentage points. But licensed driver crashes became less dangerous over the same period too, falling from 50.7% to 45.1%. The gap between the two groups — how much worse unlicensed crashes were compared to licensed crashes — shrank from roughly 30 percentage points to just 12. That closing gap is what drove the raw rate decline. Unlicensed crashes did not become dramatically safer on their own. The entire crash pool shifted underneath them.\n\nThe model sees through this. Once crash type, location, time of day, and every other variable are held constant, the independent injury penalty attached to unlicensed driver involvement held between +0.11 and +0.13 from 2017 through 2024 — essentially unchanged. One likely explanation is that the composition of crashes around unlicensed drivers shifted post-COVID, rather than unlicensed drivers themselves becoming meaningfully less dangerous — though this cannot be confirmed from the available data alone. It is worth noting that the MO code used to flag unlicensed drivers (3602) was not consistently applied before 2016, making weights from earlier windows unreliable.",
  },
];

// ── FindingCard ───────────────────────────────────────────────────────────────

const FindingCard = ({ f }) => {
  const [expanded, setExpanded] = useState(false);

  return (
    <div style={{ paddingTop: '1.5rem', paddingBottom: '1.5rem', borderBottom: '1px solid var(--border)' }}>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: '1.5rem', marginBottom: '1.25rem' }}>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.85rem', letterSpacing: '0.15em', color: 'var(--text)', fontWeight: 700 }}>
          Finding {f.number}
        </span>
      </div>
      <h2 style={{ fontSize: 'clamp(1.3rem, 2.5vw, 1.9rem)', maxWidth: '75ch', marginBottom: '1.5rem', fontWeight: 700, lineHeight: 1.3 }}>
        {f.title}
      </h2>

      {expanded && (
        <>
          <p style={{ fontSize: '1rem', maxWidth: 'none', marginBottom: '2rem', lineHeight: 1.8 }}>
            {f.summary}
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: f.contrast ? '1fr 1fr' : '1fr', gap: '1.5rem', marginBottom: '2rem' }}>
            <div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.58rem', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>What the data shows</div>
              <p style={{ maxWidth: 'none', fontSize: '0.95rem', lineHeight: 1.8 }}>{f.body}</p>
            </div>
            {f.contrast && (
              <div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.58rem', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>Notable contrast</div>
                <p style={{ maxWidth: 'none', fontSize: '0.95rem', lineHeight: 1.8 }}>{f.contrast}</p>
              </div>
            )}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1px', border: '1px solid var(--border)', borderRadius: 'var(--radius)', overflow: 'hidden', marginBottom: '1.5rem' }}>
            {f.stats.map((s, i) => (
              <div key={i} style={{ padding: '1.25rem', background: 'var(--bg-subtle)', borderRight: i < 3 ? '1px solid var(--border)' : 'none' }}>
                <div style={{ fontFamily: 'var(--font-serif)', fontSize: '1.9rem', fontWeight: 700, color: 'var(--text)', lineHeight: 1, marginBottom: '0.4rem' }}>{s.value}</div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.58rem', letterSpacing: '0.08em', color: 'var(--text-muted)', lineHeight: 1.4 }}>{s.label}</div>
              </div>
            ))}
          </div>
        </>
      )}

      <button
        onClick={() => setExpanded(v => !v)}
        style={{
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: '0.4rem',
          fontFamily: 'var(--font-mono)',
          fontSize: '0.72rem',
          color: 'var(--text-sec)',
          padding: 0,
          letterSpacing: '0.04em',
        }}
      >
        {expanded ? 'Learn less' : 'Learn more'}
        <span style={{ display: 'inline-block', transition: 'transform 180ms ease', transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)', fontSize: '1rem', lineHeight: 1 }}>▾</span>
      </button>
    </div>
  );
};

const Home = ({ setCurrentPage }) => {
  const [activeTab, setActiveTab] = React.useState(0);

  const tabs = ['Prediction & Analysis', 'The Dataset', 'How the Model Learns'];


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
                data set. I found that Los Angeles has kept detailed public car crash records for
                over a decade. This discovery led me to a simple question: can logistic regression
                accurately predict whether a car crash results in an injury?
              </p>

            </div>

            {/* Right: animation — hidden on very small screens via .hero-animation class */}
            <div className="hero-animation">
              <CarAnimation />
            </div>

          </div>
        </div>
      </section>

      {/* ── Findings ── */}
      <section className="section" style={{ paddingTop: '4rem', paddingBottom: '1rem', borderBottom: '1px solid var(--border)' }}>
        <div className="container">
          <div className="section-label" style={{ marginBottom: '0.5rem' }}>Findings from Analysis</div>
          {findings.map(f => <FindingCard key={f.number} f={f} />)}
        </div>
      </section>

      {/* ── Tabbed Section ── */}
      <section className="section" style={{ paddingTop: '3.5rem', paddingBottom: '3.5rem', borderBottom: '1px solid var(--border)' }}>
        <div className="container">

          {/* Tab buttons */}
          <div style={{ display: 'flex', gap: '0', borderBottom: '1px solid var(--border)', marginBottom: '0' }}>
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
                  fontSize: '0.68rem',
                  letterSpacing: '0.1em',
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

            {/* Tab 0 — Prediction & Analysis */}
            {activeTab === 0 && (
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

            {/* Tab 1 — The Dataset */}
            {activeTab === 1 && (
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
