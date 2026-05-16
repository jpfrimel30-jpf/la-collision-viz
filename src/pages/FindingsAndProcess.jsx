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
    plain: 'To make the model\'s predictions interpretable at the individual feature level, a formula explorer was built. The logistic regression output is σ(z), where z is the sum of each feature value multiplied by its learned weight, plus the era-specific bias term. The explorer allows any combination of the 155 features to be toggled on or off, applying weights and bias from either the pre-COVID era (2016–2018 trained, tested on 2019) or the post-COVID era (2021–2023 trained, tested on 2024). For each combination, it computes the predicted injury probability, displays the raw injury rate for each selected feature, and shows the range of raw rates across all selected features.\n\nThis tool was used to manually probe which feature combinations produce the most extreme predictions, to verify that model weights align with raw injury rates in a coherent way, and to identify potential artifacts — such as the Rampart division\'s near-perfect pre-COVID injury rate, which surfaced as an anomalously high weight that warranted further investigation.',
    highlight: 'Pre-COVID bias: +0.5154 · Post-COVID bias: +0.1845 · 155 features explorable',
  },
  {
    number: '11',
    title: 'Reading the Results',
    plain: 'After training, the model assigns a weight to every feature. A large positive weight means that feature is associated with a higher probability of injury. A large negative weight means it is associated with a lower probability. Tracking how these weights change across different training windows — and across pre- and post-COVID eras — reveals which risk factors have grown stronger, which have collapsed, and which have remained stable over 15 years. The model also stores a bias term per window, which captures the baseline injury probability before any feature is considered. The pre-COVID era model (2016–2018 trained, tested on 2019) achieved 85.7% accuracy; the post-COVID era model (2021–2023 trained, tested on 2024) achieved 76.4% — a 9-point gap that reflects the structural shift in collision patterns after the pandemic.\n\nTo move from raw model output to interpretable findings, several layers of analysis were applied. Feature weights from all 91 windows were compared across eras to identify trends — not just point-in-time values. The Formula Explorer was used to probe specific feature combinations, cross-check model weights against raw injury rates, and surface anomalies. Features were grouped by category (collision type, circumstances, time, geography, demographics) and each group was examined for consistent patterns versus era-specific shifts. The five findings on this page are the result of that holistic review across all 91 windows, both eras, and all 155 features.',
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

          <div className="finding-body-grid" style={{ display: 'grid', gridTemplateColumns: f.contrast ? '1fr 1fr' : '1fr', gap: '1.5rem', marginBottom: '2rem' }}>
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

          <div className="finding-stats-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1px', border: '1px solid var(--border)', borderRadius: 'var(--radius)', overflow: 'hidden', marginBottom: '1.5rem' }}>
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


// ── Page ──────────────────────────────────────────────────────────────────────

const FindingsAndProcess = ({ setCurrentPage }) => {
  const [activeStep, setActiveStep] = useState(0);

  return (
    <div style={{ paddingTop: '3.75rem' }}>

      {/* ── Header ── */}
      <section className="section page-hero" style={{ paddingTop: '5rem', paddingBottom: '1.5rem', borderBottom: '1px solid var(--border)' }}>
        <div className="container">
          <h1 style={{ marginBottom: '1.25rem', fontSize: 'clamp(2rem, 4vw, 3.5rem)' }}>Findings and Process</h1>
          <p style={{ fontSize: '1.05rem', lineHeight: 1.8, maxWidth: 'none' }}>
            Below are the major findings that emerged from the analysis and a step-by-step account of how
            621,000 collision records were cleaned, prepared, and used to train a logistic regression model.
          </p>
        </div>
      </section>

      {/* ── Findings ── */}
      <section id="findings" className="section" style={{ paddingTop: '3.5rem', paddingBottom: '2.5rem' }}>
        <div className="container">
          <h2 style={{ marginBottom: '2.5rem', fontSize: 'clamp(1.9rem, 3.2vw, 2.6rem)' }}>1. Findings from Analysis</h2>
        </div>
      </section>

      <section style={{ paddingTop: '0', paddingBottom: '0' }}>
        <div className="container">
          {findings.map(f => <FindingCard key={f.number} f={f} />)}
        </div>
      </section>

      {/* ── Correlation vs Causation ── */}
      <section className="section" style={{ paddingTop: '3.5rem' }}>
        <div className="container">
          <h2 style={{ marginBottom: '1.25rem', fontSize: 'clamp(1.4rem, 2.2vw, 2.0rem)' }}>The Limits of Raw Counts</h2>
          <p style={{ marginBottom: '2.5rem', maxWidth: 'none' }}>
            Raw collision counts can mislead — when multiple factors move together, a simple tally cannot determine which one actually matters. Finding 3 shows how this plays out when the raw injury rate and the model's signal point in opposite directions.
          </p>

          <div className="limits-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '2.5rem' }}>
            <div className="card" style={{ borderLeft: '3px solid var(--red)' }}>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6rem', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--red)', marginBottom: '1rem' }}>
                Traditional raw-count analysis
              </div>
              <p style={{ maxWidth: 'none', fontSize: '0.95rem', lineHeight: 1.8 }}>
                "Pedestrian crashes and nighttime crashes both increased from 2015 to 2019, with injuries
                climbing in tandem — so low-visibility nighttime conditions must be the primary driver
                of serious injuries."
              </p>
              <p style={{ maxWidth: 'none', fontSize: '0.85rem', marginTop: '0.75rem', fontStyle: 'italic' }}>
                This ignores that pedestrian collisions disproportionately happen at night. The injury
                signal may come entirely from pedestrian involvement, not the hour. Raw counts cannot
                separate the two.
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

      {/* ── Confusion Matrix ── */}
      <section className="section" style={{ paddingTop: '0.25rem' }}>
        <div className="container" style={{ borderTop: '1px solid var(--border)', paddingTop: '0.75rem' }}>
          <h2 style={{ marginBottom: '1rem', fontSize: 'clamp(1.4rem, 2.2vw, 2.0rem)' }}>Confusion matrix: pre vs. post COVID</h2>
          <p style={{ marginBottom: '2.5rem', maxWidth: 'none' }}>
            Averaged across all rolling 2-year windows. The shift reflects how the model became
            less precise in both directions: both fewer true positives caught (lower recall) and
            a much higher rate of false positives.
          </p>

          <div className="cm-overflow" style={{ overflowX: 'auto', marginBottom: '2rem' }}>
          <div style={{ border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', overflow: 'hidden', minWidth: '520px' }}>
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

      <div className="divider" />

      {/* ── Pipeline Steps ── */}
      <section className="section" style={{ paddingTop: '3.5rem' }}>
        <div className="container">
          <h2 style={{ marginBottom: '2.5rem', fontSize: 'clamp(1.9rem, 3.2vw, 2.6rem)' }}>2. Process</h2>

          <div className="process-grid" style={{ display: 'grid', gridTemplateColumns: '260px 1fr', gap: '2.5rem', alignItems: 'start' }}>
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

      {/* ── Disclosures ── */}
      <section className="section" style={{ paddingTop: '3rem', borderTop: '1px solid var(--border)', background: 'var(--bg-subtle)' }}>
        <div className="container">
          <h2 style={{ marginBottom: '2.5rem', fontSize: 'clamp(1.9rem, 3.2vw, 2.6rem)' }}>Disclosures and Limitations</h2>

          <div className="disclosure-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1.25rem' }}>
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

export default FindingsAndProcess;
