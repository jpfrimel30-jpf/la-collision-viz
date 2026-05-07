import React, { useState } from 'react';

const features = [
  { category: 'Collision Type', items: [
    { name: 'Pedestrian Involved', description: 'Collision involved a pedestrian on foot' },
    { name: 'Bicycle Involved', description: 'Collision involved a cyclist' },
    { name: 'Motorcycle Involved', description: 'Collision involved a motorcycle' },
    { name: 'Hit & Run', description: 'Driver fled the scene after collision' },
    { name: 'Fixed Object', description: 'Vehicle struck a stationary object (pole, wall, etc.)' },
    { name: 'Parked Vehicle', description: 'Vehicle struck a parked car' },
  ]},
  { category: 'Circumstances', items: [
    { name: 'DUI Involved', description: 'Driver was under the influence of alcohol or drugs' },
    { name: 'At Intersection', description: 'Collision occurred at a street intersection' },
    { name: 'Street Racing', description: 'Collision resulted from street racing or speed exhibition' },
    { name: 'Road Rage', description: 'Collision was road rage related' },
    { name: 'Private Property', description: 'Collision occurred on private property (e.g. parking lot)' },
    { name: 'Unlicensed Driver', description: 'Driver did not have a valid license' },
    { name: 'Weather Related', description: 'Weather or road conditions were a factor' },
    { name: 'Officer Involved', description: 'A law enforcement officer was involved' },
  ]},
  { category: 'People', items: [
    { name: 'Victim Age', description: 'Age of the primary collision victim' },
    { name: 'Hour of Day', description: 'Hour (0–23) when the collision occurred' },
    { name: 'Victim Intoxicated', description: 'The victim was under the influence' },
    { name: 'Suspect Intoxicated', description: 'The suspect was under the influence' },
    { name: 'Victim Unconscious', description: 'Victim was asleep or unconscious at time of collision' },
  ]},
  { category: 'Location', items: [
    { name: 'Latitude & Longitude', description: 'GPS coordinates of the collision' },
    { name: 'LAPD Division', description: 'Which of the 21 LAPD divisions the collision occurred in (one-hot encoded)' },
  ]},
];

const cleaningSteps = [
  {
    number: '01',
    title: 'Pulling the Data',
    plain: 'We connected directly to the LA City open data portal and downloaded all collision records from 2010 to 2024 — over 621,000 incidents in total.',
    detail: 'Used the Socrata SODA API with pagination (50,000 rows per request) to pull all records. Saved as individual yearly CSV files for flexible window analysis.',
    before: '621,677 rows',
    after: '621,677 rows',
    change: 'No rows removed',
  },
  {
    number: '02',
    title: 'Identifying Injuries',
    plain: 'Each collision record contains a list of circumstance codes. We scanned those codes to determine whether the collision resulted in an injury or not. Records where we couldn\'t determine injury status were removed.',
    detail: 'MO codes 3024 (Severe), 3025 (Visible), 3026 (Complaint), 3027 (Fatal) → injury=1. Code 3028 (Non-Injury) → injury=0. All other rows returned None and were dropped.',
    before: '585,916 rows (2010–2022)',
    after: '385,450 rows',
    change: '200,466 rows removed (no injury code found)',
  },
  {
    number: '03',
    title: 'Building Features',
    plain: 'We transformed raw collision descriptions into 67 yes/no and numeric signals the model can learn from — things like "was a pedestrian involved?" or "what hour did this happen?"',
    detail: 'Extracted 19 binary MO code flags using string matching, parsed lat/long from nested JSON strings, extracted hour from military time integer, imputed missing ages with median (38).',
    before: '18 raw columns',
    after: '67 engineered features',
    change: '+49 new feature columns',
  },
  {
    number: '04',
    title: 'Encoding Categories',
    plain: 'Text categories like neighborhood names can\'t be fed directly into a math model. We converted them into groups of yes/no columns — one for each unique value.',
    detail: 'One-hot encoded area_name (21 LAPD divisions), vict_sex (3 values), vict_descent (22 values). Replaced rare sex codes H and N with X (unknown). Dropped the single erroneous descent_- row.',
    before: '3 text columns',
    after: '46 binary columns',
    change: 'Each category gets its own 0/1 column',
  },
  {
    number: '05',
    title: 'Scaling the Numbers',
    plain: 'Some numbers in our data are large (like age: 10–99) and some are tiny (like a 0 or 1 flag). We rescaled everything to the same range so no single feature dominates just because its numbers happen to be bigger.',
    detail: 'Applied StandardScaler (z-score normalization): subtract mean, divide by standard deviation. Fit only on training data, then apply same scale to test data to prevent data leakage.',
    before: 'Features on wildly different scales',
    after: 'All features: mean≈0, std=1',
    change: 'Training scaler saved and reused for all test years',
  },
];

const DataPage = () => {
  const [activeStep, setActiveStep] = useState(0);
  const [activeCategory, setActiveCategory] = useState(0);

  return (
    <div style={{ paddingTop: '5rem' }}>

      {/* ── Hero ── */}
      <section className="section" style={{ paddingBottom: '3rem' }}>
        <div className="container">
          <div className="section-label">The Dataset</div>
          <h2>15 years of LA collision<br />data, made useful</h2>
          <p style={{ marginTop: '1rem', fontSize: '1.1rem', lineHeight: 1.8 }}>
            This project uses publicly available data from the Los Angeles Police Department,
            published on the LA City Open Data Portal. Every traffic collision reported
            in the city from 2010 through 2024 is included — over 621,000 incidents.
          </p>

          {/* Source card */}
          <div className="card" style={{ marginTop: '2.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1.5rem' }}>
            <div>
              <div className="result-label">Data Source</div>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.3rem', fontWeight: 700, color: 'var(--white)', marginTop: '0.25rem' }}>
                LA City Open Data Portal
              </div>
              <p style={{ fontSize: '0.85rem', marginTop: '0.5rem', maxWidth: 'none' }}>
                LAPD Traffic Collision Data · Dataset ID: d5tf-ez2w · Updated through 2025
              </p>
            </div>
            <a
              href="https://data.lacity.org/Public-Safety/Traffic-Collision-Data-from-2010-to-Present/d5tf-ez2w"
              target="_blank"
              rel="noopener noreferrer"
              className="btn"
              style={{ display: 'inline-block' }}
            >
              View Source Data →
            </a>
          </div>

          {/* Stats row */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.5rem', marginTop: '2rem' }}>
            {[
              { n: '621,677', l: 'Total collisions' },
              { n: '2010–2024', l: 'Years covered' },
              { n: '385,450', l: 'Records used in model' },
              { n: '67', l: 'Features engineered' },
            ].map((s, i) => (
              <div key={i} className="card" style={{ textAlign: 'center', padding: '1.5rem' }}>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', fontWeight: 700, color: 'var(--teal)' }}>{s.n}</div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--white-muted)', marginTop: '0.4rem' }}>{s.l}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="divider" />

      {/* ── Cleaning Steps ── */}
      <section className="section" style={{ paddingTop: '3rem' }}>
        <div className="container">
          <div className="section-label">Data Preparation</div>
          <h2>From raw records<br />to model-ready data</h2>
          <p style={{ marginTop: '1rem', marginBottom: '2.5rem' }}>
            Raw collision data can't be fed directly into a machine learning model.
            Here's exactly how we transformed 621,000 messy records into clean,
            structured inputs — and why each step matters.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: '2rem', alignItems: 'start' }}>
            {/* Step list */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {cleaningSteps.map((step, i) => (
                <button
                  key={i}
                  onClick={() => setActiveStep(i)}
                  style={{
                    background: activeStep === i ? 'var(--navy-card)' : 'transparent',
                    border: `1px solid ${activeStep === i ? 'var(--teal-border)' : 'transparent'}`,
                    borderRadius: 'var(--radius)',
                    padding: '1rem 1.25rem',
                    cursor: 'pointer',
                    textAlign: 'left',
                    transition: 'all 200ms',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '1rem',
                  }}
                >
                  <span style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.7rem',
                    color: activeStep === i ? 'var(--teal)' : 'var(--white-muted)',
                    minWidth: '24px',
                  }}>
                    {step.number}
                  </span>
                  <span style={{
                    fontFamily: 'var(--font-body)',
                    fontSize: '0.9rem',
                    fontWeight: 500,
                    color: activeStep === i ? 'var(--white)' : 'var(--white-dim)',
                  }}>
                    {step.title}
                  </span>
                </button>
              ))}
            </div>

            {/* Step detail */}
            <div className="card" style={{ padding: '2.5rem' }}>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--teal)', marginBottom: '0.75rem' }}>
                Step {cleaningSteps[activeStep].number}
              </div>
              <h3 style={{ marginBottom: '1.25rem' }}>{cleaningSteps[activeStep].title}</h3>

              {/* Plain English explanation */}
              <p style={{ fontSize: '1rem', lineHeight: 1.8, marginBottom: '1.5rem', maxWidth: 'none', color: 'var(--white-dim)' }}>
                {cleaningSteps[activeStep].plain}
              </p>

              {/* Before / After */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
                {[
                  { label: 'Before', value: cleaningSteps[activeStep].before, color: 'var(--white-muted)' },
                  { label: 'After', value: cleaningSteps[activeStep].after, color: 'var(--teal)' },
                  { label: 'Change', value: cleaningSteps[activeStep].change, color: 'var(--gold)' },
                ].map((item, i) => (
                  <div key={i} style={{ background: 'var(--navy)', borderRadius: 'var(--radius)', padding: '1rem' }}>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6rem', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--white-muted)', marginBottom: '0.4rem' }}>{item.label}</div>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.85rem', color: item.color, fontWeight: 500 }}>{item.value}</div>
                  </div>
                ))}
              </div>

              {/* Technical detail */}
              <div style={{ borderTop: '1px solid rgba(45,212,191,0.1)', paddingTop: '1.25rem' }}>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6rem', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--white-muted)', marginBottom: '0.5rem' }}>Technical Detail</div>
                <p style={{ fontSize: '0.85rem', maxWidth: 'none', color: 'var(--white-muted)', fontFamily: 'var(--font-mono)', lineHeight: 1.7 }}>
                  {cleaningSteps[activeStep].detail}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="divider" />

      {/* ── Features ── */}
      <section className="section" style={{ paddingTop: '3rem', paddingBottom: '6rem' }}>
        <div className="container">
          <div className="section-label">Feature Engineering</div>
          <h2>67 signals the model<br />learns from</h2>
          <p style={{ marginTop: '1rem', marginBottom: '2.5rem' }}>
            We transformed raw collision reports into structured yes/no questions and
            numeric values. Each "feature" is one input the model weighs when
            predicting whether a collision resulted in injury.
          </p>

          {/* Category tabs */}
          <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '2rem', flexWrap: 'wrap' }}>
            {features.map((cat, i) => (
              <button
                key={i}
                onClick={() => setActiveCategory(i)}
                style={{
                  background: activeCategory === i ? 'var(--teal)' : 'var(--navy-card)',
                  border: `1px solid ${activeCategory === i ? 'var(--teal)' : 'rgba(45,212,191,0.15)'}`,
                  borderRadius: '100px',
                  padding: '0.5rem 1.25rem',
                  cursor: 'pointer',
                  fontFamily: 'var(--font-body)',
                  fontSize: '0.8rem',
                  fontWeight: 500,
                  color: activeCategory === i ? 'var(--navy-deep)' : 'var(--white-dim)',
                  transition: 'all 200ms',
                }}
              >
                {cat.category}
              </button>
            ))}
          </div>

          {/* Feature grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem' }}>
            {features[activeCategory].items.map((item, i) => (
              <div key={i} className="card" style={{ padding: '1.25rem 1.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                  <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--teal)', flexShrink: 0 }} />
                  <div style={{ fontFamily: 'var(--font-body)', fontSize: '0.9rem', fontWeight: 600, color: 'var(--white)' }}>
                    {item.name}
                  </div>
                </div>
                <p style={{ fontSize: '0.85rem', maxWidth: 'none', paddingLeft: '1.5rem' }}>
                  {item.description}
                </p>
              </div>
            ))}
          </div>

          {/* Why not more note */}
          <div className="card" style={{ marginTop: '2.5rem', borderColor: 'rgba(232, 200, 122, 0.2)', background: 'rgba(232, 200, 122, 0.04)' }}>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--gold)', marginBottom: '0.75rem' }}>
              A note on what we excluded
            </div>
            <p style={{ maxWidth: 'none', fontSize: '0.95rem', lineHeight: 1.8 }}>
              We intentionally excluded raw street addresses and exact timestamps — these are too specific for the model to learn meaningful patterns from.
              We also excluded the "premise description" column (e.g. street vs. parking lot) after finding it was 95% the same value across all records,
              making it effectively useless as a predictor. Every feature included was chosen because it carries genuine predictive signal.
            </p>
          </div>
        </div>
      </section>

    </div>
  );
};

export default DataPage;