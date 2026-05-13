import React, { useState } from 'react';

// ── Pipeline steps ────────────────────────────────────────────────────────────

const steps = [
  {
    number: '01',
    title: 'Collecting the Data',
    plain: 'Raw traffic collision data was downloaded from the LA City open data portal (data.lacity.org). Because the full dataset exceeded single-download limits, records were retrieved in batches of 50,000 at a time and assembled into one CSV file per calendar year, covering 2010 through 2024. Each raw record contains 18 columns: report number (dr_no), date reported (date_rptd), date of occurrence (date_occ), time of occurrence (time_occ), LAPD division number (area), division name (area_name), reporting district (rpt_dist_no), crime code (crm_cd), crime code description (crm_cd_desc), MO circumstance codes (mocodes), victim age (vict_age), victim sex (vict_sex), victim descent (vict_descent), premises code (premis_cd), premises description (premis_desc), street address (location), cross-street (cross_street), and a JSON coordinate field (location_1).',
    highlight: '621,677 records pulled across 15 yearly files (2010–2024)',
  },
  {
    number: '02',
    title: 'Dropping Unused Columns',
    plain: 'Of the 18 raw columns, 8 were dropped before any analysis began. The report number (dr_no) and reporting date (date_rptd) are administrative identifiers with no predictive value. The reporting district number (rpt_dist_no) was redundant with division name. The crime code (crm_cd) and crime code description (crm_cd_desc) were always set to "TRAFFIC COLLISION" for every record — no signal. The premises code (premis_cd) and premises description (premis_desc) were excluded due to inconsistent coding across years. The cross-street (cross_street) field was too sparsely populated to be useful. The numeric area code (area) was also dropped in favor of the text area name (area_name), which was more reliably formatted for one-hot encoding. The JSON coordinate field (location_1) and the text address field (location) were retained temporarily to extract latitude, longitude, and street corridor flags, then dropped after extraction.',
    highlight: '8 columns dropped · 10 columns retained for analysis',
  },
  {
    number: '03',
    title: 'Labeling Each Collision: Did an injury occur?',
    plain: 'Each collision was labeled using LAPD\'s MO (Modus Operandi) circumstance codes — a list of 4-digit codes appended to each record by the reporting officer. Four MO codes indicate an injury outcome: 3024 (complaint of pain), 3025 (other injury), 3026 (serious injury), and 3027 (fatality). One code — 3028 — indicates a property-damage-only collision with no injury. Any record that contained none of these five codes was removed from the dataset entirely, as the injury outcome could not be determined. This excluded records where officers either omitted the injury severity code or used a non-standard entry.',
    highlight: '201,422 records dropped (ambiguous outcome) · 417,675 labeled and retained',
  },
  {
    number: '04',
    title: 'Cleaning Missing Values and Inconsistent Codes',
    plain: 'Three data quality issues were corrected before feature engineering. First, victim age (vict_age) had missing values for some records. Rather than dropping those records, missing ages were replaced with the column median — preserving those records while avoiding distortion from imputed values. Second, victim sex included two non-standard codes ("H" and "N") that do not correspond to standard LAPD sex classifications. Both were remapped to "X" (unknown/other) rather than dropped. Third, after one-hot encoding victim descent, a column named "descent_−" was found (representing an invalid or blank descent code) and was removed as a column. The records themselves were retained.',
    highlight: 'vict_age median-imputed · sex H/N → X · descent_− column removed',
  },
  {
    number: '05',
    title: 'Engineering Features',
    plain: 'Each collision record was converted into numerical signals a model can read. All features were derived from the retained raw columns:\n\nCollision type (from mocodes): is_pedestrian (MO 3003), is_bike (3008 or 3016), is_motorcycle (3009 or 3013), is_fixed_object (3011), is_parked_vehicle (3006), is_multi_vehicle (3004 or 3005).\n\nCircumstances (from mocodes): is_hit_and_run (3029 or 3030), is_dui_alcohol (3038), is_dui_drugs (3039), is_intersection (3036), is_unlicensed (3602).\n\nTime of day (from time_occ): hour_of_day (0–23, numeric), is_rush_hour (7–9am or 4–7pm), is_late_night (10pm–4am), is_weekend (Saturday or Sunday).\n\nGeographic grid (from location_1 lat/lon): latitude and longitude were rounded to the nearest 0.05° to create grid cells roughly 3.5 miles × 3.5 miles. Each collision was assigned a cell label and the full set was one-hot encoded as grid_<lat>_<lon> columns.\n\nStreet corridors (from location text): 11 binary flags for major LA arterials — Figueroa St, Western Ave, Vermont Ave, Sepulveda Blvd, Broadway, Sunset Blvd, Olympic Blvd, Victory Blvd, Van Nuys Blvd, Venice Blvd, and Pico Blvd.\n\nLAPD division (from area_name): one-hot encoded into 21 area columns.\n\nVictim demographics: vict_age (numeric), four age-bracket bins (age_16_25, age_26_40, age_41_64, age_65_plus), vict_sex one-hot (sex_M, sex_F, sex_X), vict_descent one-hot (~20 descent code columns).',
    highlight: '155 features engineered across collision type, circumstances, time, geography, and demographics',
  },
  {
    number: '06',
    title: 'Feature Selection',
    plain: 'Not every engineered feature was passed to the model. The selection criteria required that a column name start with one of five prefixes (area_, sex_, descent_, is_, grid_) or appear in a short explicit list (vict_age, hour_of_day, latitude, longitude). Features that were engineered but did not meet this criteria were excluded. The four age-bracket bins (age_16_25, age_26_40, age_41_64, age_65_plus) were generated but excluded — victim age was represented by the raw numeric vict_age instead, which carries more information than a discretized bin. The day_of_week column (0–6 numeric) was also generated but excluded, as is_weekend already captured the weekday/weekend split in binary form. All is_* flags, all grid_* cells, all one-hot encoded area/sex/descent columns, and the four explicit numeric columns were included.',
    highlight: '155 features selected · age bracket bins and day_of_week excluded',
  },
  {
    number: '07',
    title: 'Scaling the Numbers',
    plain: 'Some features span large numeric ranges — victim age runs from 0 to 99, hour_of_day from 0 to 23 — while binary features are always 0 or 1. If fed directly into the model, large-range features would dominate simply because of their scale, not because they are more predictive. To correct for this, every feature was rescaled to a mean of 0 and a standard deviation of 1 using standard normalization. This scaling was fit on the training data only, then applied to the test data using the same parameters — ensuring no information from the test year leaked into the scaling step.',
    highlight: 'All 155 features rescaled to mean=0, standard deviation=1 · scaler fit on training data only',
  },
  {
    number: '08',
    title: 'Training the Model',
    plain: 'The model was trained using logistic regression with gradient descent — an iterative process where the model starts with all feature weights set to zero, makes a prediction for each training example, measures how wrong it was, and adjusts the weights slightly to reduce that error. This process ran for 1,000 iterations at a learning rate of 0.1. After training, the model outputs two things: a weight (w) for each of the 155 features, and a single bias term (b). The bias is the model\'s default starting probability before any feature values are considered. The weight on each feature reflects how much that feature shifts the predicted injury probability — upward if positive, downward if negative.',
    highlight: 'Logistic regression · gradient descent · 1,000 iterations · learning rate 0.1',
  },
  {
    number: '09',
    title: 'The Sliding Window',
    plain: 'A model trained on historical data will naturally struggle when the world changes. To measure exactly when and how much collision patterns shifted over 15 years, 91 different training and test year combinations were evaluated. For each window, a start year and end year defined the training data, and the immediately following year was the test year. Every combination of start year (2010–2022) and end year (start+1 to 2023) was tested, with the test year always set to train_end+1. This revealed that models trained on any pre-2020 data lost approximately 15 percentage points of accuracy when tested on 2021 collisions — a structural break, not gradual drift.',
    highlight: '91 window combinations tested · COVID accuracy cliff identified at 2020',
  },
  {
    number: '10',
    title: 'The Formula Explorer',
    plain: 'To make the model\'s predictions interpretable at the individual feature level, a formula explorer was built. The logistic regression output is σ(z), where z is the sum of each feature value multiplied by its learned weight, plus the era-specific bias term. The explorer allows any combination of the 155 features to be toggled on or off, applying weights and bias from either the pre-COVID era (representative window: 2016–2018) or the post-COVID era (representative window: 2021–2023). For each combination, it computes the predicted injury probability, displays the raw injury rate for each selected feature, and shows the range of raw rates across all selected features.\n\nThis tool was used to manually probe which feature combinations produce the most extreme predictions, to verify that model weights align with raw injury rates in a coherent way, and to identify potential artifacts — such as the Rampart division\'s near-perfect pre-COVID injury rate, which surfaced as an anomalously high weight that warranted further investigation.',
    highlight: 'Pre-COVID bias: +0.5154 · Post-COVID bias: +0.1845 · 155 features explorable',
  },
  {
    number: '11',
    title: 'Reading the Results',
    plain: 'After training, the model assigns a weight to every feature. A large positive weight means that feature is associated with a higher probability of injury. A large negative weight means it is associated with a lower probability. Tracking how these weights change across different training windows — and across pre- and post-COVID eras — reveals which risk factors have grown stronger, which have collapsed, and which have remained stable over 15 years. The model also stores a bias term per window, which captures the baseline injury probability before any feature is considered. Pre-COVID windows produced a bias of +0.5154; post-COVID windows produced +0.1845, reflecting the lower average injury rate in the smaller post-COVID crash pool.\n\nTo move from raw model output to interpretable findings, several layers of analysis were applied. Feature weights from all 91 windows were compared across eras to identify trends — not just point-in-time values. The Formula Explorer was used to probe specific feature combinations, cross-check model weights against raw injury rates, and surface anomalies. Features were grouped by category (collision type, circumstances, time, geography, demographics) and each group was examined for consistent patterns versus era-specific shifts. The five findings on this page are the result of that holistic review across all 91 windows, both eras, and all 155 features.',
    highlight: '91 windows analyzed · pre- and post-COVID eras compared across all 155 features',
  },
];

// ── Findings ──────────────────────────────────────────────────────────────────

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
    title: 'No area of Los Angeles stands out as consistently more or less dangerous for car crash injuries.',
    summary: '83 geographic grid cells were engineered — each roughly 3.5 miles wide — to test whether finer neighborhood-level bucketing would reveal local injury risk patterns beyond what division-level features capture. Post-COVID injury rates across cells converged to the citywide average and no cell produced a dramatically higher or lower risk signal. Pre-COVID cells from several divisions did surface a systematic LAPD reporting artifact.',
    stats: [
      { value: '83',      label: 'Grid cells in the model' },
      { value: '~3.5 mi', label: 'Approximate cell width' },
      { value: '50–99%',  label: 'Pre-COVID injury rate range' },
      { value: '40–55%',  label: 'Post-COVID rate range' },
    ],
    body: 'Grid cells covering the Rampart, Newton, Northeast, Central, and Hollenbeck division areas logged near-perfect injury rates across all pre-2020 collisions — every crash in those areas was coded as an injury, against a citywide average of approximately 57%. The interpretation: those five divisions systematically filed formal reports only for injury crashes prior to 2020, omitting minor incidents from the record entirely.',
    contrast: 'Post-COVID, those same cells normalized to 40–55%, indistinguishable from the rest of the city. Because of this artifact, geographic weight overlays were not added to the map — pre-COVID grid weights were learned from biased data and would be misleading to display as a risk surface. The practical conclusion: controlling for crash type, time of day, and other factors, location in Los Angeles appears to be a relatively weak predictor of whether a given collision results in injury.',
  },
  {
    number: '04',
    title: 'Rush hour is essentially a zero signal today. Late night is the real temporal predictor of injury.',
    summary: 'A reasonable assumption would be that rush hour — the highest traffic volume period — correlates with more severe collisions. The data consistently contradicts this. Rush hour has carried near-zero predictive weight throughout the full study period and has declined to essentially nothing. Late night collisions, by contrast, remain a meaningful positive predictor.',
    stats: [
      { value: '+0.42',  label: 'Rush hour weight in 2012' },
      { value: '+0.016', label: 'Rush hour weight in 2024' },
      { value: '+0.29',  label: 'Late night weight in 2012' },
      { value: '+0.067', label: 'Late night weight in 2024' },
    ],
    body: 'Rush hour collisions likely involve many drivers paying close attention, driving at moderate speeds due to congestion, and with rapid emergency response times due to traffic density and proximity to hospitals. Late night collisions more frequently involve impaired driving, higher vehicle speeds on emptier roads, and delayed emergency response — all factors that increase injury severity independent of other crash characteristics.',
    contrast: 'Both signals have weakened over the 15-year period. Rush hour went from a modest +0.42 in early windows to effectively zero. Late night dropped from +0.29 to +0.067. The late night signal has proven more persistent, remaining detectable even in the most recent windows where many geographic and temporal features have faded.',
  },
  {
    number: '05',
    title: 'Unlicensed drivers: a stable crash share, but a rapidly growing injury signal.',
    summary: "Crashes involving unlicensed drivers have consistently represented 3–5% of all LAPD-logged collisions since 2014. That rate has not changed meaningfully. What has changed is the model's weight on this feature: from essentially zero in 2012 to +0.132 in 2024 — now nearly twice as strong as the late-night injury signal.",
    stats: [
      { value: '0.000',  label: 'Unlicensed weight in 2012' },
      { value: '+0.132', label: 'Unlicensed weight in 2024' },
      { value: '1.97×',  label: 'Ratio vs. late-night signal' },
      { value: '3–5%',   label: 'Consistent share of collisions' },
    ],
    body: "The LAPD MO code for unlicensed drivers (3602) was not used consistently before 2013, which explains the near-zero early weights. From 2014 onward, as coding became more consistent, the model could finally learn from this signal. The growing weight likely reflects a combination of genuinely more dangerous unlicensed-driver crashes in the post-COVID crash pool, and better data coverage allowing the model to distinguish unlicensed involvement as a conditional injury predictor — independent of crash type or location.",
    contrast: "The unlicensed signal now outweighs late-night crashes as an injury predictor by a factor of roughly 1.97. One possible explanation is that total crash volume fell ~63% post-COVID while unlicensed driver crashes held steady at 3–5% of the pool — meaning the absolute number of logged unlicensed crashes dropped sharply, and the ones that remained may skew more serious simply because minor incidents were no longer being filed. Whether the growing weight reflects a genuine behavioral shift or a change in which unlicensed crashes make it into the record cannot be determined from this data alone.",
  },
];

// ── Confusion matrix ──────────────────────────────────────────────────────────

const cmMetrics = [
  { label: 'Accuracy',            note: 'share of all predictions correct',           pre: '84.3%', post: '73.5%', delta: '−10.9pp', worse: true },
  { label: 'Precision',           note: 'of injury predictions, share that were real', pre: '87.0%', post: '73.0%', delta: '−14.1pp', worse: true },
  { label: 'Recall',              note: 'of real injuries, share the model caught',    pre: '87.3%', post: '72.0%', delta: '−15.4pp', worse: true },
  { label: 'F1 Score',            note: 'balance of precision and recall',             pre: '86.9%', post: '72.4%', delta: '−14.5pp', worse: true },
  { label: 'False Positive Rate', note: 'non-injury crashes called injury',            pre: '24.1%', post: '25.3%', delta: '+1.1pp',  worse: true },
  { label: 'False Negative Rate', note: 'real injuries the model missed',              pre: '12.7%', post: '28.0%', delta: '+15.4pp', worse: true },
];


// ── Disclosures ───────────────────────────────────────────────────────────────

const disclosures = [
  {
    id: 'disclosure-1',
    number: 1,
    title: 'Correlation, not causation',
    body: 'All findings describe statistical associations between crash features and injury outcomes. A high feature weight means that feature correlates with injury in this dataset — it does not prove that feature causes injury. Findings should not be interpreted as causal claims.',
  },
  {
    id: 'disclosure-2',
    number: 2,
    title: 'Post-COVID crash volume drop',
    body: 'Total LAPD-logged collisions fell approximately 63% from 2019 to 2021 and have only partially recovered. The cause is unknown — it may reflect real behavioral change, reduced driving, underreporting, or policy changes in what LAPD logged. All post-2020 findings should be interpreted in this context.',
  },
  {
    id: 'disclosure-3',
    number: 3,
    title: 'Selection bias possibility',
    body: 'The smaller post-COVID crash pool may mean that only more serious incidents are being reported, which could artificially inflate the weight of features associated with serious crashes. The raw overall injury rate went down post-COVID (not up), which is inconsistent with a pure selection bias story — but this possibility cannot be definitively ruled out.',
  },
  {
    id: 'disclosure-4',
    number: 4,
    title: 'LAPD pre-COVID reporting artifact',
    body: 'Analysis of geographic grid cells and division-level features revealed that Rampart, Newton, Northeast, Central, and Hollenbeck divisions logged injury rates of 99–100% in pre-2020 records — far above the citywide ~57% average. This is interpreted as evidence that those divisions only filed formal collision reports for injury crashes prior to 2020, omitting minor incidents entirely. Geographic weights from pre-2020 training windows that include these divisions should be interpreted in light of this documentation gap. Post-COVID, injury rates in those same areas normalized to 43–53%.',
  },
  {
    id: 'disclosure-5',
    number: 5,
    title: 'MO code reliability',
    body: "LAPD's circumstance codes (MO codes) were not consistently applied across years. DUI codes 3038/3039 appear in essentially zero records before 2018, making the DUI feature unreliable in early windows. Unlicensed code 3602 was used sporadically from 2013, with stable usage from 2014 onward.",
  },
  {
    id: 'disclosure-6',
    number: 6,
    title: 'Reporting bias',
    body: 'This dataset contains only collisions reported to LAPD. Minor collisions, collisions in areas with lower police presence, and collisions involving individuals reluctant to involve law enforcement may be systematically underrepresented.',
  },
  {
    id: 'disclosure-7',
    number: 7,
    title: 'Demographic feature limitations',
    body: 'Sex and descent features are derived from victim records classified by LAPD officers and may not accurately represent driver demographics. They reflect LAPD classification, not self-identified identity, and should be interpreted with this limitation in mind.',
  },
  {
    id: 'disclosure-8',
    number: 8,
    title: 'Model accuracy ceiling',
    body: 'The model correctly predicts injury outcomes approximately 67–75% of the time on unseen data. Human behavior in traffic collisions involves factors — speed, road condition, weather, medical history, vehicle condition — that are absent from the LAPD dataset and place a practical ceiling on what any logistic model can achieve with this data.',
  },
  {
    id: 'disclosure-9',
    number: 9,
    title: '2012 data anomaly',
    body: 'The 2012 test year shows unusually low accuracy (~62%), likely due to limited training data (only 2011 records available) and potential coding inconsistencies in early LAPD records. Findings from that specific window are not highlighted.',
  },
  {
    id: 'disclosure-10',
    number: 10,
    title: 'Geographic risk overlays intentionally omitted from the map',
    body: 'The interactive map does not display a neighborhood-level injury risk layer. Pre-COVID geographic weights — both division-level and grid cell — were learned from data containing the LAPD reporting artifact described above, making them unreliable as a risk surface. Post-COVID weights show no meaningful geographic differentiation once other crash features are controlled for. Displaying either set of weights as a spatial risk overlay would be misleading.',
  },
];

// ── Sub-components ────────────────────────────────────────────────────────────

const FindingCard = ({ f }) => {
  const [expanded, setExpanded] = useState(false);

  return (
    <div style={{ paddingTop: '3rem', paddingBottom: '3rem', borderBottom: '1px solid var(--border)' }}>
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

// ── Page ──────────────────────────────────────────────────────────────────────

const HowItWorks = ({ setCurrentPage }) => {
  const [activeStep, setActiveStep] = useState(0);

  return (
    <div style={{ paddingTop: '3.75rem' }}>

      {/* ── Header ── */}
      <section className="section" style={{ paddingTop: '5rem', paddingBottom: '3rem', borderBottom: '1px solid var(--border)' }}>
        <div className="container">
          <h1 style={{ marginBottom: '1.25rem', fontSize: 'clamp(2rem, 4vw, 3.5rem)' }}>Process & Findings</h1>
          <p style={{ fontSize: '1.05rem', lineHeight: 1.8, maxWidth: 'none' }}>
            A step-by-step account of how 621,000 collision records were cleaned, prepared, and used
            to train a logistic regression model — and the major findings that emerged from the analysis.
          </p>
        </div>
      </section>

      {/* ── Pipeline Steps ── */}
      <section className="section" style={{ paddingTop: '3.5rem' }}>
        <div className="container">
          <h2 style={{ marginBottom: '2.5rem' }}>1. Process</h2>

          <div style={{ display: 'grid', gridTemplateColumns: '260px 1fr', gap: '2.5rem', alignItems: 'start' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
              {steps.map((step, i) => (
                <button
                  key={i}
                  onClick={() => setActiveStep(i)}
                  style={{
                    background: activeStep === i ? 'var(--bg-card)' : 'transparent',
                    border: `1px solid ${activeStep === i ? 'var(--border)' : 'transparent'}`,
                    borderRadius: 'var(--radius)',
                    padding: '0.85rem 1rem',
                    cursor: 'pointer',
                    textAlign: 'left',
                    transition: 'all 180ms',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.85rem',
                  }}
                >
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.62rem', color: activeStep === i ? 'var(--text)' : 'var(--text-muted)', minWidth: '22px' }}>
                    {step.number}
                  </span>
                  <span style={{ fontFamily: 'var(--font-serif)', fontSize: '0.95rem', fontWeight: activeStep === i ? 600 : 400, color: activeStep === i ? 'var(--text)' : 'var(--text-sec)' }}>
                    {step.title}
                  </span>
                </button>
              ))}
            </div>

            <div className="card" style={{ padding: '2.5rem' }}>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.62rem', letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>
                Step {steps[activeStep].number}
              </div>
              <h3 style={{ marginBottom: '1.5rem' }}>{steps[activeStep].title}</h3>

              <p style={{ fontSize: '0.97rem', lineHeight: 1.82, marginBottom: '1.5rem', maxWidth: 'none', whiteSpace: 'pre-line' }}>
                {steps[activeStep].plain}
              </p>

              <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '0.85rem 1.1rem', display: 'flex', alignItems: 'center', gap: '0.7rem' }}>
                <div style={{ width: '5px', height: '5px', borderRadius: '50%', background: 'var(--text)', flexShrink: 0 }} />
                <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--text-sec)', maxWidth: 'none', margin: 0 }}>
                  {steps[activeStep].highlight}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="divider" />

      {/* ── Correlation vs Causation ── */}
      <section className="section" style={{ paddingTop: '3.5rem' }}>
        <div className="container">
          <h2 style={{ marginBottom: '1.25rem' }}>The Limits of Raw Counts</h2>
          <p style={{ marginBottom: '2.5rem', maxWidth: 'none' }}>
            Raw collision counts can mislead — when multiple factors move together, a simple tally cannot determine which one actually matters.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '2.5rem' }}>
            <div className="card" style={{ borderLeft: '3px solid var(--red)' }}>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6rem', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--red)', marginBottom: '1rem' }}>
                Traditional raw-count analysis
              </div>
              <p style={{ maxWidth: 'none', fontSize: '0.95rem', lineHeight: 1.8 }}>
                "Pedestrian collisions and intersection collisions both rose 18% from 2015 to 2019,
                and injuries rose alongside them — so intersections must be driving the injury increase."
              </p>
              <p style={{ maxWidth: 'none', fontSize: '0.85rem', marginTop: '0.75rem', fontStyle: 'italic' }}>
                This ignores that pedestrian collisions are far more likely to happen at intersections
                in the first place. The injury signal may come entirely from the pedestrian involvement,
                not the intersection. Raw counts cannot separate the two.
              </p>
            </div>

            <div className="card" style={{ borderLeft: '3px solid var(--green)' }}>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6rem', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--green)', marginBottom: '1rem' }}>
                Logistic regression with 155 features
              </div>
              <p style={{ maxWidth: 'none', fontSize: '0.95rem', lineHeight: 1.8 }}>
                "Even after controlling for crash location, time of day, and 154 other variables —
                pedestrian involvement ranks as the strongest injury predictor in every one of
                the 91 training windows, across all 15 years of data."
              </p>
              <p style={{ maxWidth: 'none', fontSize: '0.85rem', marginTop: '0.75rem', fontStyle: 'italic' }}>
                All 155 features are considered simultaneously, isolating each
                factor's independent contribution to injury probability.
              </p>
            </div>
          </div>
        </div>
      </section>

      <div className="divider" />

      {/* ── Findings ── */}
      <section className="section" style={{ paddingTop: '5rem', paddingBottom: '3rem', borderBottom: '1px solid var(--border)' }}>
        <div className="container">
          <h2 style={{ marginBottom: '1.25rem', fontSize: 'clamp(1.6rem, 3vw, 2.5rem)' }}>2. Findings from Analysis</h2>
        </div>
      </section>

      <section style={{ paddingBottom: '0' }}>
        <div className="container">
          {findings.map(f => <FindingCard key={f.number} f={f} />)}
        </div>
      </section>

      {/* ── Confusion Matrix ── */}
      <section className="section" style={{ paddingTop: '4rem', borderTop: '1px solid var(--border)' }}>
        <div className="container">
          <div className="section-label">Model Performance</div>
          <h2 style={{ marginBottom: '1rem' }}>Confusion matrix: pre vs. post COVID</h2>
          <p style={{ marginBottom: '2.5rem', maxWidth: 'none' }}>
            Averaged across all rolling 2-year windows. The shift reflects both fewer
            true positives caught (lower recall) and a much higher rate of false positives
            — the model became less precise in both directions.
          </p>

          <div style={{ border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', overflow: 'hidden', marginBottom: '2rem' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', background: 'var(--bg-card)', borderBottom: '1px solid var(--border)' }}>
              {['Metric', 'Pre-COVID avg', 'Post-COVID avg', 'Delta'].map((h, i) => (
                <div key={h} style={{ padding: '0.75rem 1.25rem', fontFamily: 'var(--font-mono)', fontSize: '0.6rem', letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--text-muted)', borderRight: i < 3 ? '1px solid var(--border)' : 'none' }}>{h}</div>
              ))}
            </div>
            {cmMetrics.map((m, i) => (
              <div key={m.label} style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', borderBottom: i < cmMetrics.length - 1 ? '1px solid var(--border-light)' : 'none' }}>
                <div style={{ padding: '0.9rem 1.25rem', borderRight: '1px solid var(--border)' }}>
                  <span style={{ fontFamily: 'var(--font-serif)', fontSize: '1rem', color: 'var(--text)' }}>{m.label}</span>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: 'var(--text-muted)', marginLeft: '0.5rem' }}>({m.note})</span>
                </div>
                <div style={{ padding: '0.9rem 1.25rem', fontFamily: 'var(--font-mono)', fontSize: '0.85rem', color: 'var(--text-sec)', borderRight: '1px solid var(--border)' }}>{m.pre}</div>
                <div style={{ padding: '0.9rem 1.25rem', fontFamily: 'var(--font-mono)', fontSize: '0.85rem', color: 'var(--text-sec)', borderRight: '1px solid var(--border)' }}>{m.post}</div>
                <div style={{ padding: '0.9rem 1.25rem', fontFamily: 'var(--font-mono)', fontSize: '0.85rem', color: m.worse ? 'var(--red)' : 'var(--green)' }}>{m.delta}</div>
              </div>
            ))}
          </div>

          <div style={{ textAlign: 'center', marginTop: '2.5rem' }}>
            <button
              onClick={() => setCurrentPage('map')}
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
              Click to visualize the data on a Los Angeles map
            </button>
          </div>

        </div>
      </section>

      {/* ── Disclosures ── */}
      <section className="section" style={{ paddingTop: '3rem', borderTop: '1px solid var(--border)', background: 'var(--bg-subtle)' }}>
        <div className="container">
          <h2 style={{ marginBottom: '2.5rem' }}>Disclosures and Limitations</h2>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1.25rem' }}>
            {disclosures.map(d => (
              <div key={d.id} id={d.id} className="card" style={{ background: 'var(--bg)' }}>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.6rem', marginBottom: '0.6rem' }}>
                  <span style={{ fontFamily: 'var(--font-serif)', fontWeight: 700, fontSize: '1rem', color: 'var(--text)' }}>{d.number}.</span>
                  <h4 style={{ fontFamily: 'var(--font-serif)', fontWeight: 700, fontSize: '1rem', color: 'var(--text)', margin: 0 }}>{d.title}</h4>
                </div>
                <p style={{ maxWidth: 'none', fontSize: '0.9rem', lineHeight: 1.75 }}>{d.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

    </div>
  );
};

export default HowItWorks;
