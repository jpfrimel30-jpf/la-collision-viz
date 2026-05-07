import React, { useState } from 'react';

const findings = [
  {
    number: '01',
    title: 'Pedestrian involvement is the strongest injury predictor — and has been growing for 13 years.',
    summary: 'Of all 67 features tested, pedestrian involvement carries the highest positive weight in every single model window — pre-COVID, during COVID, and post-COVID. The signal has not only held but strengthened. In 2012 windows the weight was +0.58; by 2024 windows it had risen to +1.00.',
    stats: [
      { value: '+0.58', label: 'Weight in 2012 windows' },
      { value: '+1.00', label: 'Weight in 2024 windows' },
      { value: '#1',    label: 'Rank in every window' },
      { value: '13 yr', label: 'Consistent trend duration' },
    ],
    body: 'Bicycle and motorcycle involvement are the second and third strongest positive predictors respectively, creating a consistent pattern: collisions involving unprotected road users — those without the structural protection of a vehicle frame — are dramatically more likely to result in injury regardless of any other circumstance. This finding is robust across all eras and all training window configurations.',
    contrast: 'By comparison, collisions involving parked vehicles carry a weight of approximately −0.70, meaning they are associated with meaningfully lower injury probability. The physical interpretation is straightforward: parked vehicle collisions occur at low speeds, while pedestrian collisions frequently involve full-speed vehicle impacts with a person on foot.',
  },
  {
    number: '02',
    title: 'Hit-and-run as an injury signal has nearly collapsed. Fleeing the scene no longer means what it used to.',
    summary: 'Hit-and-run involvement was historically the strongest negative predictor in the model — meaning crashes where the driver fled were consistently associated with lower injury probability. The interpretation: fleeing drivers tend to be involved in minor fender-benders, not serious crashes. That relationship has nearly disappeared post-COVID.',
    stats: [
      { value: '−0.78', label: 'Weight in 2012 windows (strong)' },
      { value: '−0.09', label: 'Weight in 2024 windows (near zero)' },
      { value: '88%',   label: 'Drop in signal magnitude' },
      { value: '2020',  label: 'Year the collapse accelerated' },
    ],
    body: 'From 2010 to 2019, is_hit_and_run was consistently the single largest negative predictor — regularly around −1.4 to −1.5. After 2020, the weight began a rapid descent. By 2021–2022 windows it had fallen to around −0.23. By 2024 windows it sits at −0.09, barely above noise. The behavioral assumption that made this signal reliable — that drivers who flee are involved in minor collisions — appears to have broken down.',
    contrast: 'The collapse coincides with the post-COVID crash volume drop of ~63%. If the crash pool shifted to include proportionally more serious incidents, hit-and-run may no longer serve as a reliable proxy for collision severity. Whatever the mechanism, the signal the model learned for a decade is no longer there.',
  },
  {
    number: '03',
    title: 'The COVID accuracy cliff: model performance dropped 15 points in 2021 and old data now actively hurts.',
    summary: 'Every model trained on any combination of pre-2020 data — regardless of how many years — loses approximately 15 percentage points of accuracy the moment it is tested on 2021 collision data. The drop is not a gradual drift. It is a cliff. And more strikingly: shorter, more recent training windows now outperform 13 years of historical data.',
    stats: [
      { value: '82.6%', label: 'Avg pre-COVID accuracy' },
      { value: '68.9%', label: 'Avg post-COVID accuracy' },
      { value: '75.0%', label: '2yr window → 2024 accuracy' },
      { value: '66.6%', label: '14yr window → 2024 accuracy' },
    ],
    body: 'When testing on 2024 collisions, a model trained on just 2022–2023 data (2 years) achieves 75.0% accuracy. A model trained on 2010–2023 data (14 years) achieves only 66.6%. The additional 12 years of pre-COVID data actively reduces predictive performance. This is consistent with a structural break in the underlying data-generating process rather than gradual behavioral drift.',
    contrast: 'In pre-COVID years, longer windows performed comparably to shorter ones — 10-year models were about as good as 3-year models on pre-2020 test years. The recency advantage is specifically a post-2020 phenomenon. This suggests that whatever changed in 2020 was not a continuation of prior trends but a genuine discontinuity in how collisions happen and who gets injured.',
  },
  {
    number: '04',
    title: 'Geographic signals have lost a third of their predictive power. East LA divisions weakened most.',
    summary: 'LAPD division and geographic grid features were meaningful injury predictors throughout the 2010s. By 2024 windows, the average weight of division-level geographic features has dropped by 33.5%. Grid cell features have declined even more sharply, by 45.2%.',
    stats: [
      { value: '−33.5%', label: 'Division signal collapse' },
      { value: '−45.2%', label: 'Grid cell signal collapse' },
      { value: '2020',   label: 'Year decline accelerated' },
      { value: 'East LA', label: 'Hardest hit divisions' },
    ],
    body: 'In early windows (2010–2014), several LAPD divisions carried weights above +0.50 — area_Newton, area_Northeast, area_Rampart, and area_Hollenbeck were consistently strong positive predictors, suggesting that geography served as a proxy for road infrastructure, traffic density, and local driving patterns. By 2022–2024 windows, those same divisions have weights in the 0.10–0.25 range, much closer to zero.',
    contrast: 'The geographic weakening is consistent with either post-COVID traffic redistribution across the city, or with the model increasingly explaining injury through crash-type features (pedestrian, bicycle, motorcycle) that have become stronger. When crash type dominates, location matters less. The two effects are not mutually exclusive and both likely contribute.',
  },
  {
    number: '05',
    title: 'Rush hour is essentially a zero signal today. Late night is the real temporal predictor of injury.',
    summary: 'A reasonable assumption would be that rush hour — the highest traffic volume period — correlates with more severe collisions. The data consistently contradicts this. Rush hour has carried near-zero predictive weight throughout the full study period and has declined to essentially nothing. Late night collisions, by contrast, remain a meaningful positive predictor.',
    stats: [
      { value: '+0.32', label: 'Rush hour weight in 2012' },
      { value: '+0.007', label: 'Rush hour weight in 2024' },
      { value: '+0.19', label: 'Late night weight in 2012' },
      { value: '+0.076', label: 'Late night weight in 2024' },
    ],
    body: 'Rush hour collisions likely involve many drivers paying close attention, driving at moderate speeds due to congestion, and with rapid emergency response times due to traffic density and proximity to hospitals. Late night collisions more frequently involve impaired driving, higher vehicle speeds on emptier roads, and delayed emergency response — all factors that increase injury severity independent of other crash characteristics.',
    contrast: 'Both signals have weakened over the 15-year period. Rush hour went from a modest +0.32 in early windows to effectively zero. Late night dropped from +0.19 to +0.076. The late night signal has proven more persistent, remaining detectable even in the most recent windows where many geographic and temporal features have faded.',
  },
  {
    number: '06',
    title: 'Unlicensed drivers: a stable crash share, but a rapidly growing injury signal.',
    summary: 'Crashes involving unlicensed drivers have consistently represented 3–5% of all LAPD-logged collisions since 2014. That rate has not changed meaningfully. What has changed is the model\'s weight on this feature: from essentially zero in 2012 to +0.134 in 2024 — now nearly twice as strong as the late-night injury signal.',
    stats: [
      { value: '0.000', label: 'Unlicensed weight in 2012' },
      { value: '+0.134', label: 'Unlicensed weight in 2024' },
      { value: '1.76×', label: 'Ratio vs. late-night signal' },
      { value: '3–5%', label: 'Consistent share of collisions' },
    ],
    body: 'The LAPD MO code for unlicensed drivers (3602) was not used consistently before 2013, which explains the near-zero early weights. From 2014 onward, as coding became more consistent, the model could finally learn from this signal. The growing weight likely reflects a combination of genuinely more dangerous unlicensed-driver crashes in the post-COVID crash pool, and better data coverage allowing the model to distinguish unlicensed involvement as a conditional injury predictor — independent of crash type or location.',
    contrast: 'The unlicensed signal now outweighs late-night crashes as an injury predictor by a factor of roughly 1.76. Both represent roughly similar conditional injury risks based on raw data, but the unlicensed signal appears stronger after the model controls for other factors. Whether this reflects true behavioral differences or post-COVID reporting patterns is an open question that cannot be resolved with the available data.',
  },
];

const cmMetrics = [
  { label: 'Accuracy',  pre: '82.6%', post: '68.9%', delta: '−13.7pp', worse: true },
  { label: 'Precision', pre: '92.1%', post: '68.2%', delta: '−23.9pp', worse: true },
  { label: 'Recall',    pre: '76.0%', post: '65.9%', delta: '−10.1pp', worse: true },
  { label: 'F1 Score',  pre: '82.9%', post: '67.1%', delta: '−15.8pp', worse: true },
  { label: 'False Positive Rate', pre: '8.1%',  post: '28.4%', delta: '+20.3pp', worse: true },
  { label: 'False Negative Rate', pre: '24.0%', post: '34.1%', delta: '+10.1pp', worse: true },
];

const disclosures = [
  {
    title: 'Correlation, not causation',
    body: 'All findings describe statistical associations between crash features and injury outcomes. A high feature weight means that feature correlates with injury in this dataset — it does not prove that feature causes injury. Findings should not be interpreted as causal claims.',
  },
  {
    title: 'Post-COVID crash volume drop',
    body: 'Total LAPD-logged collisions fell approximately 63% from 2019 to 2021 and have only partially recovered. The cause is unknown — it may reflect real behavioral change, reduced driving, underreporting, or policy changes in what LAPD logged. All post-2020 findings should be interpreted in this context.',
  },
  {
    title: 'Selection bias possibility',
    body: 'The smaller post-COVID crash pool may mean that only more serious incidents are being reported, which could artificially inflate the weight of features associated with serious crashes. The raw overall injury rate went down post-COVID (not up), which is inconsistent with a pure selection bias story — but this possibility cannot be definitively ruled out.',
  },
  {
    title: 'MO code reliability',
    body: 'LAPD\'s circumstance codes (MO codes) were not consistently applied across years. DUI codes 3038/3039 appear in essentially zero records before 2018, making the DUI feature unreliable and excluded from findings. Unlicensed code 3602 was used sporadically from 2013, with stable usage from 2014 onward.',
  },
  {
    title: 'Reporting bias',
    body: 'This dataset contains only collisions reported to LAPD. Minor collisions, collisions in areas with lower police presence, and collisions involving individuals reluctant to involve law enforcement may be systematically underrepresented.',
  },
  {
    title: 'Demographic feature limitations',
    body: 'Sex and descent features are derived from victim records classified by LAPD officers and may not accurately represent driver demographics. They reflect LAPD classification, not self-identified identity, and should be interpreted with this limitation in mind.',
  },
  {
    title: 'Model accuracy ceiling',
    body: 'The model correctly predicts injury outcomes approximately 67–75% of the time on unseen data. Human behavior in traffic collisions involves factors — speed, road condition, weather, medical history, vehicle condition — that are absent from the LAPD dataset and place a practical ceiling on what any logistic model can achieve with this data.',
  },
  {
    title: '2012 data anomaly',
    body: 'The 2012 test year shows unusually low accuracy (~62%), likely due to limited training data (only 2011 records available) and potential coding inconsistencies in early LAPD records. Findings from that specific window are not highlighted.',
  },
];

const FindingCard = ({ f }) => (
  <div style={{ paddingTop: '3rem', paddingBottom: '3rem', borderBottom: '1px solid var(--border)' }}>
    <div style={{ display: 'flex', alignItems: 'baseline', gap: '1.5rem', marginBottom: '1.25rem' }}>
      <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.62rem', letterSpacing: '0.2em', color: 'var(--text-muted)' }}>
        Finding {f.number}
      </span>
    </div>
    <h2 style={{ fontSize: 'clamp(1.3rem, 2.5vw, 1.9rem)', maxWidth: '75ch', marginBottom: '1.25rem', fontWeight: 700, lineHeight: 1.3 }}>
      {f.title}
    </h2>
    <p style={{ fontSize: '1rem', maxWidth: '70ch', marginBottom: '2rem', lineHeight: 1.8 }}>
      {f.summary}
    </p>

    {/* Stats */}
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1px', border: '1px solid var(--border)', borderRadius: 'var(--radius)', overflow: 'hidden', marginBottom: '2rem' }}>
      {f.stats.map((s, i) => (
        <div key={i} style={{ padding: '1.25rem', background: 'var(--bg-subtle)', borderRight: i < 3 ? '1px solid var(--border)' : 'none' }}>
          <div style={{ fontFamily: 'var(--font-serif)', fontSize: '1.9rem', fontWeight: 700, color: 'var(--text)', lineHeight: 1, marginBottom: '0.4rem' }}>{s.value}</div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.58rem', letterSpacing: '0.08em', color: 'var(--text-muted)', lineHeight: 1.4 }}>{s.label}</div>
        </div>
      ))}
    </div>

    {/* Body */}
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
      <div>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.58rem', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>What the data shows</div>
        <p style={{ maxWidth: 'none', fontSize: '0.95rem', lineHeight: 1.8 }}>{f.body}</p>
      </div>
      <div>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.58rem', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>Notable contrast</div>
        <p style={{ maxWidth: 'none', fontSize: '0.95rem', lineHeight: 1.8 }}>{f.contrast}</p>
      </div>
    </div>
  </div>
);

const Findings = () => {
  const [showAll, setShowAll] = useState(false);

  return (
    <div style={{ paddingTop: '3.75rem' }}>

      {/* ── Header ── */}
      <section className="section" style={{ paddingTop: '5rem', paddingBottom: '3rem', borderBottom: '1px solid var(--border)' }}>
        <div className="container">
          <div className="section-label">Analysis</div>
          <h1 style={{ marginBottom: '1.25rem', fontSize: 'clamp(2rem, 4vw, 3.5rem)' }}>Six findings from 15 years of data</h1>
          <p style={{ fontSize: '1.05rem', maxWidth: '65ch', lineHeight: 1.8 }}>
            The following findings emerge from logistic regression analysis of 621,677
            LA traffic collisions across 91 sliding window model configurations, spanning 2010 to 2024.
            Each finding is grounded in model weight data cross-validated across multiple
            training and test year combinations.
          </p>
        </div>
      </section>

      {/* ── Findings ── */}
      <section style={{ paddingBottom: '0' }}>
        <div className="container">
          {findings.map(f => <FindingCard key={f.number} f={f} />)}
        </div>
      </section>

      {/* ── Model Reports / Confusion Matrix ── */}
      <section className="section" style={{ paddingTop: '4rem', borderTop: '1px solid var(--border)' }}>
        <div className="container">
          <div className="section-label">Model Performance</div>
          <h2 style={{ marginBottom: '1rem' }}>Confusion matrix: pre vs. post COVID</h2>
          <p style={{ marginBottom: '2.5rem', maxWidth: '65ch' }}>
            Averaged across all rolling 2-year windows. The shift reflects both fewer
            true positives caught (lower recall) and a much higher rate of false positives
            — the model became less precise in both directions.
          </p>

          <div style={{ border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', overflow: 'hidden', marginBottom: '2rem' }}>
            {/* Header row */}
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', background: 'var(--bg-card)', borderBottom: '1px solid var(--border)' }}>
              {['Metric', 'Pre-COVID avg', 'Post-COVID avg', 'Delta'].map((h, i) => (
                <div key={h} style={{ padding: '0.75rem 1.25rem', fontFamily: 'var(--font-mono)', fontSize: '0.6rem', letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--text-muted)', borderRight: i < 3 ? '1px solid var(--border)' : 'none' }}>{h}</div>
              ))}
            </div>
            {/* Data rows */}
            {cmMetrics.map((m, i) => (
              <div key={m.label} style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', borderBottom: i < cmMetrics.length - 1 ? '1px solid var(--border-light)' : 'none' }}>
                <div style={{ padding: '0.9rem 1.25rem', fontFamily: 'var(--font-serif)', fontSize: '1rem', color: 'var(--text)', borderRight: '1px solid var(--border)' }}>{m.label}</div>
                <div style={{ padding: '0.9rem 1.25rem', fontFamily: 'var(--font-mono)', fontSize: '0.85rem', color: 'var(--text-sec)', borderRight: '1px solid var(--border)' }}>{m.pre}</div>
                <div style={{ padding: '0.9rem 1.25rem', fontFamily: 'var(--font-mono)', fontSize: '0.85rem', color: 'var(--text-sec)', borderRight: '1px solid var(--border)' }}>{m.post}</div>
                <div style={{ padding: '0.9rem 1.25rem', fontFamily: 'var(--font-mono)', fontSize: '0.85rem', color: m.worse ? 'var(--red)' : 'var(--green)' }}>{m.delta}</div>
              </div>
            ))}
          </div>

          <p style={{ fontSize: '0.875rem', fontStyle: 'italic', color: 'var(--text-muted)', maxWidth: '65ch' }}>
            FPR = false positive rate (safe crashes the model called injuries).
            FNR = false negative rate (real injuries the model missed).
            Averages computed across all rolling 2-year windows in each era.
          </p>
        </div>
      </section>

      {/* ── Disclosures ── */}
      <section className="section" style={{ paddingTop: '3rem', borderTop: '1px solid var(--border)', background: 'var(--bg-subtle)' }}>
        <div className="container">
          <div className="section-label">Disclosures</div>
          <h2 style={{ marginBottom: '1rem' }}>What this analysis cannot tell us</h2>
          <p style={{ marginBottom: '2.5rem', maxWidth: '65ch' }}>
            Responsible analysis requires clearly stating the boundaries of what the data can and
            cannot support. The following limitations apply to all findings on this page.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1.25rem' }}>
            {disclosures.map(d => (
              <div key={d.title} className="card" style={{ background: 'var(--bg)' }}>
                <h4 style={{ fontFamily: 'var(--font-serif)', fontWeight: 700, fontSize: '1rem', marginBottom: '0.6rem', color: 'var(--text)' }}>{d.title}</h4>
                <p style={{ maxWidth: 'none', fontSize: '0.9rem', lineHeight: 1.75 }}>{d.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

    </div>
  );
};

export default Findings;
