import React, { useState } from 'react';

const findings = [
  {
    number: '01',
    tag: 'Vulnerable Road Users',
    title: 'Pedestrian involvement is the strongest and most consistent injury predictor across all 15 years of data.',
    summary: 'Of all 67 features in the model, pedestrian involvement carries the highest positive weight in every single time window tested — pre-COVID, during COVID, and post-COVID. This signal has not only persisted but strengthened over time.',
    data: [
      { label: 'Weight in 2010–2014 window', value: '+1.18', note: 'Strongest predictor' },
      { label: 'Weight in 2016–2018 window', value: '+1.31', note: 'Growing stronger' },
      { label: 'Weight in 2022–2023 window', value: '+1.20', note: 'Still #1 predictor' },
      { label: 'Rank among all 67 features', value: '#1', note: 'Every single window' },
    ],
    context: 'Bicycle and motorcycle involvement are the second and third strongest positive predictors respectively, suggesting a consistent pattern: collisions involving unprotected road users — those without the structural protection of a vehicle — are dramatically more likely to result in injury regardless of any other circumstance.',
    contrast: 'By comparison, collisions involving parked vehicles carry a weight of -0.71, meaning they are associated with significantly lower injury probability. The physical interpretation is straightforward: parked car collisions typically occur at low speeds, while pedestrian collisions frequently involve full-speed vehicle impacts.',
    implication: 'The data consistently identifies unprotected road users as the highest-risk collision type across 15 years. Infrastructure and enforcement strategies targeting pedestrian, cyclist, and motorcyclist safety appear to address the single largest driver of collision injuries in the dataset.',
    color: 'var(--teal)',
  },
  {
    number: '02',
    tag: 'Temporal Patterns',
    title: 'COVID-19 produced a permanent and measurable shift in LA collision patterns that pre-2020 models cannot account for.',
    summary: 'Models trained exclusively on pre-2020 data achieve 83–86% accuracy on pre-2020 test years. When those same models are applied to 2021 data, accuracy drops to approximately 68% — a loss of roughly 15–18 percentage points that does not recover even as the pandemic recedes.',
    data: [
      { label: 'Pre-COVID peak accuracy', value: '86.4%', note: '2016–17 trained, 2018 tested' },
      { label: 'First post-COVID test', value: '68.3%', note: '2010–19 trained, 2021 tested' },
      { label: 'Recent window accuracy', value: '74.6%', note: '2022–23 trained, 2024 tested' },
      { label: 'Accuracy gap vs pre-COVID', value: '−11.8pp', note: 'Permanent shift' },
    ],
    context: 'The accuracy drop is not a gradual drift — it is a cliff. Every model trained on any combination of years through 2019, regardless of how many years of data are included, loses approximately the same 15 percentage points when first tested on 2021 data. This pattern is consistent with a structural break rather than gradual change.',
    contrast: 'Notably, models trained on post-COVID data (2021 onward) stabilize at approximately 74–75% accuracy — meaningfully higher than the 67% achieved by long-horizon historical models on the same test years. A model trained on 2022–2023 data outperforms a model trained on 13 years of 2010–2022 data when tested on 2024 collisions.',
    implication: 'These findings suggest that historical collision data from before 2020 may have limited utility for predicting injury outcomes in current conditions. Safety strategies and resource allocation models built on pre-COVID assumptions warrant re-examination against post-2020 behavioral patterns.',
    color: 'var(--gold)',
  },
  {
    number: '03',
    tag: 'Model Architecture',
    title: 'Shorter, more recent training windows consistently outperform long historical windows for predicting current collision outcomes.',
    summary: 'Across all 91 window combinations tested, models trained on 2–3 recent years of data outperform models trained on 10+ years of historical data when predicting outcomes in the most recent test years. The relationship between training data volume and predictive accuracy is not linear — recency matters more than quantity.',
    data: [
      { label: '2022–23 trained → 2024 tested', value: '74.6%', note: '2 year window' },
      { label: '2021–23 trained → 2024 tested', value: '73.9%', note: '3 year window' },
      { label: '2010–23 trained → 2024 tested', value: '66.6%', note: '14 year window' },
      { label: 'Accuracy gain from recency', value: '+8.0pp', note: '2yr vs 14yr window' },
    ],
    context: 'This finding holds across multiple test years. When testing on 2023, a model trained on 2021–2022 data (74%) outperforms one trained on 2010–2022 data (68%). When testing on 2024, a model trained on 2022–2023 (75%) outperforms one trained on 2011–2023 (66%). The pattern is robust and consistent.',
    contrast: 'The exception to this pattern appears in pre-COVID years, where longer windows perform comparably to shorter ones — suggesting that pre-2020 collision patterns were stable enough that historical data remained relevant. The recency advantage appears to be a post-COVID phenomenon driven by the structural break identified in Finding 02.',
    implication: 'Predictive models for traffic safety that rely primarily on multi-decade historical datasets may be systematically underperforming relative to what is achievable with recent data. A rolling 2–3 year training window, updated annually, appears to represent the most predictively efficient use of available collision data in the current environment.',
    color: '#A78BFA',
  },
];

const Recommendations = () => {
  const [active, setActive] = useState(0);

  return (
    <div style={{ paddingTop: '5rem' }}>

      {/* ── Hero ── */}
      <section className="section" style={{ paddingBottom: '3rem' }}>
        <div className="container">
          <div className="section-label">Findings</div>
          <h2>Three findings from<br />15 years of data</h2>
          <p style={{ marginTop: '1rem', fontSize: '1.1rem', lineHeight: 1.8, maxWidth: '65ch' }}>
            The following findings emerge from logistic regression analysis of 621,677
            LA traffic collisions across 91 sliding window model configurations.
            Each finding is grounded in model weight data and cross-validated
            across multiple training and test year combinations.
          </p>

          {/* Disclaimer */}
          <div style={{
            marginTop: '2rem',
            padding: '1rem 1.5rem',
            background: 'rgba(167, 139, 250, 0.05)',
            border: '1px solid rgba(167, 139, 250, 0.2)',
            borderRadius: 'var(--radius)',
            maxWidth: '65ch',
          }}>
            <p style={{ maxWidth: 'none', fontSize: '0.85rem', color: 'var(--white-muted)', lineHeight: 1.7 }}>
              <span style={{ color: '#A78BFA', fontFamily: 'var(--font-mono)', fontSize: '0.7rem', letterSpacing: '0.1em', textTransform: 'uppercase' }}>Note · </span>
              This analysis identifies statistical associations between collision features
              and injury outcomes. Correlation does not imply causation. Findings should
              be interpreted alongside domain expertise and additional research before
              informing policy decisions.
            </p>
          </div>
        </div>
      </section>

      <div className="divider" />

      {/* ── Findings ── */}
      <section className="section" style={{ paddingTop: '3rem' }}>
        <div className="container">

          {/* Tab selector */}
          <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '2.5rem', flexWrap: 'wrap' }}>
            {findings.map((f, i) => (
              <button
                key={i}
                onClick={() => setActive(i)}
                style={{
                  background: active === i ? f.color : 'var(--navy-card)',
                  border: `1px solid ${active === i ? f.color : 'rgba(45,212,191,0.15)'}`,
                  borderRadius: '100px',
                  padding: '0.5rem 1.25rem',
                  cursor: 'pointer',
                  fontFamily: 'var(--font-body)',
                  fontSize: '0.8rem',
                  fontWeight: 500,
                  color: active === i ? 'var(--navy-deep)' : 'var(--white-dim)',
                  transition: 'all 200ms',
                }}
              >
                Finding {f.number} · {f.tag}
              </button>
            ))}
          </div>

          {/* Active finding */}
          <div>
            {/* Header */}
            <div style={{ marginBottom: '2rem' }}>
              <div style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '0.65rem',
                letterSpacing: '0.2em',
                textTransform: 'uppercase',
                color: findings[active].color,
                marginBottom: '1rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
              }}>
                <span style={{ display: 'inline-block', width: '1.5rem', height: '1px', background: findings[active].color }} />
                Finding {findings[active].number} · {findings[active].tag}
              </div>
              <h2 style={{ fontSize: 'clamp(1.4rem, 3vw, 2.2rem)', maxWidth: '75ch', lineHeight: 1.3 }}>
                {findings[active].title}
              </h2>
              <p style={{ marginTop: '1rem', fontSize: '1rem', lineHeight: 1.8, maxWidth: '70ch' }}>
                {findings[active].summary}
              </p>
            </div>

            {/* Data grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', marginBottom: '2rem' }}>
              {findings[active].data.map((d, i) => (
                <div key={i} style={{
                  background: 'var(--navy-card)',
                  border: `1px solid rgba(45,212,191,0.1)`,
                  borderRadius: 'var(--radius)',
                  padding: '1.25rem',
                }}>
                  <div style={{
                    fontFamily: 'var(--font-display)',
                    fontSize: '2rem',
                    fontWeight: 700,
                    color: findings[active].color,
                    lineHeight: 1,
                    marginBottom: '0.5rem',
                  }}>
                    {d.value}
                  </div>
                  <div style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.65rem',
                    color: 'var(--white-muted)',
                    letterSpacing: '0.05em',
                    marginBottom: '0.25rem',
                  }}>
                    {d.label}
                  </div>
                  <div style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.6rem',
                    color: findings[active].color,
                    letterSpacing: '0.05em',
                    opacity: 0.8,
                  }}>
                    {d.note}
                  </div>
                </div>
              ))}
            </div>

            {/* Three text sections */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
              <div className="card">
                <div style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.6rem',
                  letterSpacing: '0.15em',
                  textTransform: 'uppercase',
                  color: 'var(--white-muted)',
                  marginBottom: '0.75rem',
                }}>
                  What the data shows
                </div>
                <p style={{ maxWidth: 'none', fontSize: '0.92rem', lineHeight: 1.8 }}>
                  {findings[active].context}
                </p>
              </div>
              <div className="card">
                <div style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.6rem',
                  letterSpacing: '0.15em',
                  textTransform: 'uppercase',
                  color: 'var(--white-muted)',
                  marginBottom: '0.75rem',
                }}>
                  Notable contrast
                </div>
                <p style={{ maxWidth: 'none', fontSize: '0.92rem', lineHeight: 1.8 }}>
                  {findings[active].contrast}
                </p>
              </div>
            </div>

            {/* Implication */}
            <div style={{
              background: 'var(--navy-light)',
              border: `1px solid ${findings[active].color}33`,
              borderLeft: `3px solid ${findings[active].color}`,
              borderRadius: '0 var(--radius-lg) var(--radius-lg) 0',
              padding: '1.5rem 2rem',
            }}>
              <div style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '0.6rem',
                letterSpacing: '0.15em',
                textTransform: 'uppercase',
                color: findings[active].color,
                marginBottom: '0.75rem',
              }}>
                Implication
              </div>
              <p style={{ maxWidth: 'none', fontSize: '0.95rem', lineHeight: 1.8, fontStyle: 'italic', color: 'var(--white-dim)' }}>
                {findings[active].implication}
              </p>
            </div>
          </div>
        </div>
      </section>

      <div className="divider" />

      {/* ── Limitations ── */}
      <section className="section" style={{ paddingTop: '3rem', paddingBottom: '6rem' }}>
        <div className="container">
          <div className="section-label">Limitations</div>
          <h2 style={{ marginBottom: '1.5rem' }}>What this analysis<br />cannot tell us</h2>
          <p style={{ marginBottom: '2.5rem', fontSize: '1rem', lineHeight: 1.8 }}>
            Responsible data analysis requires acknowledging the boundaries of what
            the data can and cannot support.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem' }}>
            {[
              {
                title: 'Causation',
                body: 'The model identifies statistical associations, not causal relationships. A high feature weight means that feature correlates with injury in this dataset — it does not prove that feature causes injury. Physical intuition supports many findings (pedestrians have no protection), but correlation alone is not sufficient evidence for causal claims.',
              },
              {
                title: 'Reporting Bias',
                body: 'This dataset contains only collisions that were reported to LAPD. Minor collisions, collisions in areas with lower police presence, and collisions involving undocumented individuals may be systematically underrepresented. Findings reflect the reported collision record, not the complete collision landscape of Los Angeles.',
              },
              {
                title: 'Model Accuracy',
                body: 'The model correctly predicts injury outcomes approximately 67–75% of the time on unseen data. The remaining 25–33% of cases are incorrectly classified. Human behavior in traffic collisions involves factors that cannot be fully captured in a structured dataset, placing a practical ceiling on predictive accuracy.',
              },
            ].map((l, i) => (
              <div key={i} className="card">
                <h4 style={{ color: 'var(--white)', marginBottom: '0.75rem', fontFamily: 'var(--font-body)', fontSize: '0.9rem', letterSpacing: '0.06em' }}>
                  {l.title}
                </h4>
                <p style={{ maxWidth: 'none', fontSize: '0.875rem', lineHeight: 1.8 }}>
                  {l.body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

    </div>
  );
};

export default Recommendations;