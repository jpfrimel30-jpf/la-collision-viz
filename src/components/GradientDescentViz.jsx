import React, { useEffect, useState } from 'react';

// Five dot positions: start, early, middle, late, minimum
const DOT_POS = [
  { x: 22,  y: 22  },
  { x: 98,  y: 93  },
  { x: 161, y: 135 },
  { x: 241, y: 164 },
  { x: 296, y: 170 },
];

const SNAPS = [
  { iter: 1,    pred: '0.31', err: '0.69', loss: '1.17', pedW: '0.00', nightW: '0.00', prevPed: '—',    prevNight: '—'    },
  { iter: 280,  pred: '0.45', err: '0.55', loss: '0.80', pedW: '0.51', nightW: '0.38', prevPed: '0.00', prevNight: '0.00' },
  { iter: 540,  pred: '0.58', err: '0.42', loss: '0.54', pedW: '1.18', nightW: '0.88', prevPed: '0.51', prevNight: '0.38' },
  { iter: 850,  pred: '0.72', err: '0.28', loss: '0.33', pedW: '2.02', nightW: '1.51', prevPed: '1.18', prevNight: '0.88' },
  { iter: 1000, pred: '0.89', err: '0.11', loss: '0.24', pedW: '2.41', nightW: '1.79', prevPed: '2.02', prevNight: '1.51' },
];

const PHASE_LABELS = ['Predict', 'Check result', 'Estimate cost', 'Adjust weights'];
const PHASE_DELAYS = [4500, 4500, 4500, 4500];

const GradientDescentViz = () => {
  const [step,      setStep]      = useState(0);
  const [phase,     setPhase]     = useState(0);
  const [converged, setConverged] = useState(false);

  useEffect(() => {
    if (converged) {
      const t = setTimeout(() => { setStep(0); setPhase(0); setConverged(false); }, 5500);
      return () => clearTimeout(t);
    }
    const t = setTimeout(() => {
      if (phase < 3) {
        setPhase(p => p + 1);
      } else if (step < DOT_POS.length - 1) {
        setStep(s => s + 1);
        setPhase(0);
      } else {
        setConverged(true);
      }
    }, PHASE_DELAYS[phase]);
    return () => clearTimeout(t);
  }, [step, phase, converged]);

  const dot  = DOT_POS[step];
  const snap = SNAPS[step];

  return (
    <div className="gd-grid" style={{ display: 'grid', gridTemplateColumns: '55% 45%', gap: '3rem', alignItems: 'center' }}>

      {/* ── Loss curve ── */}
      <div>
        <svg viewBox="0 0 360 210" width="100%" aria-label="Loss curve showing gradient descent">

          {/* Axes */}
          <line x1="22" y1="10"  x2="22"  y2="184" stroke="#e0e0db" strokeWidth="1"/>
          <line x1="20" y1="184" x2="345" y2="184" stroke="#e0e0db" strokeWidth="1"/>

          {/* Axis labels */}
          <text x="8" y="100" fontSize="8" fill="#888" textAnchor="middle" transform="rotate(-90 8 100)">Loss</text>
          <text x="183" y="202" fontSize="8" fill="#888" textAnchor="middle">weight value →</text>

          {/* Parabola: half-bowl from top-left to minimum */}
          <path d="M 22,22 Q 157,170 296,170 L 340,163" fill="none" stroke="#ddddd8" strokeWidth="2.5" strokeLinecap="round"/>

          {/* Optimal weight marker */}
          <line x1="296" y1="170" x2="296" y2="186" stroke="#ccc" strokeWidth="1" strokeDasharray="3,2"/>
          <text x="296" y="199" fontSize="7.5" fill="#888" textAnchor="middle">optimal weight</text>

          {/* Trail of previous positions */}
          {DOT_POS.slice(0, step).map((p, i) => (
            <circle key={i} cx={p.x} cy={p.y} r={3}
              fill="#aaa" opacity={(i + 1) / Math.max(step, 1) * 0.55}
            />
          ))}

          {/* Active dot */}
          {!converged && (
            <circle cx={dot.x} cy={dot.y} r={6.5} fill="#1a1a1a"/>
          )}

          {/* Converged state */}
          {converged && (
            <>
              <circle cx={296} cy={170} r={7} fill="#1a1a1a"/>
              <text x="296" y="157" fontSize="8.5" fill="#1a1a1a" textAnchor="middle"
                fontFamily="monospace" fontWeight="600">converged</text>
            </>
          )}

          {/* Iteration counter */}
          {!converged && (
            <text x="338" y="22" fontSize="8" fill="#888" textAnchor="end" fontFamily="monospace">
              iter {snap.iter} / 1,000
            </text>
          )}
        </svg>
      </div>

      {/* ── Computation panel ── */}
      <div style={{ fontFamily: 'var(--font-mono)' }}>

        {converged ? (
          <div>
            <div style={{ fontSize: '0.58rem', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
              Training complete · 1,000 iterations
            </div>
            {[
              { name: 'Pedestrian involved', weight: '+2.41', muted: false, desc: 'strongly predicts injury' },
              { name: 'After midnight',       weight: '+1.79', muted: false, desc: 'moderately predicts injury' },
              { name: 'Hit-and-run',          weight: '−0.43', muted: true,  desc: 'slightly predicts no injury' },
            ].map(w => (
              <div key={w.name} style={{ display: 'flex', gap: '1rem', marginBottom: '1.25rem', alignItems: 'flex-start' }}>
                <span style={{
                  fontWeight: 700,
                  fontSize: '1.15rem',
                  color: w.muted ? 'var(--text-muted)' : 'var(--text)',
                  minWidth: '4rem',
                  lineHeight: 1,
                  paddingTop: '0.1rem',
                }}>
                  {w.weight}
                </span>
                <div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text)', marginBottom: '0.25rem' }}>{w.name}</div>
                  <div style={{ fontSize: '0.62rem', color: 'var(--text-muted)', letterSpacing: '0.04em' }}>{w.desc}</div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div>
            {PHASE_LABELS.map((label, i) => {
              const isActive = i === phase;
              const isDone   = i <  phase;
              return (
                <div key={label} style={{
                  marginBottom: '1.2rem',
                  opacity: isActive ? 1 : isDone ? 0.4 : 0.15,
                  transition: 'opacity 280ms ease',
                }}>
                  <div style={{
                    display: 'flex', alignItems: 'center', gap: '0.5rem',
                    marginBottom: isActive ? '0.5rem' : 0,
                    color: isActive ? 'var(--text)' : 'var(--text-muted)',
                  }}>
                    <span style={{ fontSize: '0.55rem', opacity: 0.55 }}>0{i + 1}</span>
                    <span style={{
                      fontSize: '0.62rem',
                      letterSpacing: '0.1em',
                      textTransform: 'uppercase',
                      fontWeight: isActive ? 600 : 400,
                    }}>
                      {label}
                    </span>
                    {isDone && <span style={{ fontSize: '0.6rem' }}>✓</span>}
                  </div>

                  {isActive && (
                    <div style={{ paddingLeft: '1.4rem', fontSize: '0.82rem', color: 'var(--text-sec)', lineHeight: 2.2 }}>
                      {i === 0 && <>
                        <div>pedestrian involved: <b style={{ color: 'var(--text)' }}>1</b></div>
                        <div>p(injury) = <b style={{ color: 'var(--text)' }}>{snap.pred}</b></div>
                      </>}
                      {i === 1 && <>
                        <div>actual outcome: <b style={{ color: 'var(--text)' }}>INJURY</b></div>
                        <div>error = 1 − {snap.pred} = <b style={{ color: 'var(--text)' }}>{snap.err}</b></div>
                      </>}
                      {i === 2 && <>
                        <div>log-loss = <b style={{ color: 'var(--text)' }}>{snap.loss}</b></div>
                        <div>nudge direction: <b style={{ color: 'var(--text)' }}>↓ toward minimum</b></div>
                      </>}
                      {i === 3 && <>
                        <div>pedestrian weight: {snap.prevPed} → <b style={{ color: 'var(--text)' }}>{snap.pedW}</b></div>
                      </>}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default GradientDescentViz;
