import { useEffect, useState } from 'react';
import type { StepCtx } from '../../../../../reels/types';
import { clamp, easeInOut, easeOut, easeOutBack, lerp, seg } from '../../../../../reels/anim';
import { C, Svg, T } from '../../../../../reels/kit';

// Colour grammar: caramel = the optimizer can see inside / the guarantee, cherryText = the sealed box or the repeated work,
// crema = data, latte = labels, taupe = structure.

function Box({
  x,
  y,
  w,
  h = 44,
  label,
  hi = false,
  bad = false,
  dashed = false,
  o = 1,
}: {
  x: number;
  y: number;
  w: number;
  h?: number;
  label: string;
  hi?: boolean;
  bad?: boolean;
  dashed?: boolean;
  o?: number;
}) {
  return (
    <g opacity={o}>
      <rect
        x={x}
        y={y}
        width={w}
        height={h}
        rx={8}
        fill={dashed ? 'none' : C.cocoa}
        stroke={bad ? C.cherryText : hi ? C.caramel : C.mocha}
        strokeWidth={hi || bad ? 2 : 1}
        strokeDasharray={dashed ? '5 4' : undefined}
      />
      <T x={x + w / 2} y={y + h / 2 + 5} s={13} f={bad ? C.cherryText : C.crema} a="middle">
        {label}
      </T>
    </g>
  );
}

/** Seconds since the learner answered a predict step (the player's clock has stopped by then), so reveals can animate. */
function useSinceAnswer(on: boolean) {
  const [s, setS] = useState(0);
  useEffect(() => {
    if (!on) {
      setS(0);
      return;
    }
    if (typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) {
      setS(99);
      return;
    }
    let raf = 0;
    const t0 = performance.now();
    const tick = () => {
      const d = (performance.now() - t0) / 1000;
      setS(d);
      if (d < 4) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [on]);
  return s;
}

// 1 · Choice: the WITH box branches two ways; a filter dot passes into the inline box but bounces off the sealed one.
export function Choice({ t }: StepCtx) {
  const br = easeInOut(seg(t, 0.3, 0.9));
  const a = easeOutBack(seg(t, 0.9, 1.2));
  const b = easeOutBack(seg(t, 1.2, 1.5));
  const d1 = seg(t, 1.8, 2.4);
  const d2 = seg(t, 2.0, 2.8);
  const bounce = d2 < 0.5 ? d2 * 2 : 2 - d2 * 2;
  return (
    <Svg label="A CTE can be inlined so the optimizer sees inside, or materialised as a sealed copy; each is right sometimes" h={260}>
      <Box x={25} y={60} w={240} h={70} label="WITH w AS (…)" />
      <path d="M265 95 C 290 95 290 62 310 62" fill="none" stroke={C.caramel} strokeWidth={2} pathLength={1} strokeDasharray="1" strokeDashoffset={1 - br} />
      <path d="M265 95 C 290 95 290 132 310 132" fill="none" stroke={C.cherryText} strokeWidth={2} pathLength={1} strokeDasharray="1" strokeDashoffset={1 - br} />
      <Box x={310} y={40} w={260} label="inline: see inside" hi o={clamp(a)} />
      <Box x={310} y={110} w={260} label="materialise: sealed copy" bad o={clamp(b)} />
      {d1 > 0 && d1 < 1 && <circle cx={lerp(270, 440, d1)} cy={62 + 0 * d1} r={5} fill={C.caramel} />}
      {d2 > 0 && d2 < 1 && <circle cx={lerp(270, 306, bounce)} cy={132} r={5} fill={C.cherryText} />}
      <T x={300} y={210} s={14} f={C.latte} a="middle" o={easeOut(seg(t, 2.8, 3.3))}>
        each is right sometimes
      </T>
    </Svg>
  );
}

// 2 · Fence: a red bar rises; the filter pushes toward it and bounces back; behind it the whole table is scanned and copied before filtering.
export function Fence({ t }: StepCtx) {
  const rise = easeOutBack(seg(t, 0.5, 1.1));
  const push = seg(t, 1.3, 2.0);
  const dx = 30 * Math.sin(Math.PI * push);
  const scan = seg(t, 2.1, 2.9);
  const copy = easeOut(seg(t, 2.9, 3.2));
  return (
    <Svg label="A fenced CTE cannot receive the WHERE filter or use the index: the whole table is scanned and copied, then filtered" h={300}>
      <g transform={`translate(${dx} 0)`}>
        <Box x={25} y={50} w={150} label="WHERE key = 123" />
      </g>
      <rect x={215} y={140 - 100 * clamp(rise)} width={16} height={100 * clamp(rise)} rx={4} fill={C.cherryText} />
      <T x={223} y={32} s={13} f={C.cherryText} a="middle" o={clamp(rise)}>
        fence
      </T>
      <Box x={250} y={50} w={165} label="scan all of big" bad o={easeOut(seg(t, 1.9, 2.1))} />
      <rect x={250} y={100} width={165 * scan} height={6} rx={3} fill={C.cherry} />
      <Box x={425} y={50} w={145} label="copy, filter" bad o={copy} />
      <T x={25} y={190} s={14} f={C.latte} o={easeOut(seg(t, 3.3, 3.7))}>
        the index on key is unreachable through the fence
      </T>
      <T x={25} y={220} s={13} f={C.cherryText} o={easeOut(seg(t, 3.7, 4.1))}>
        before PostgreSQL 12 this was every CTE
      </T>
    </Svg>
  );
}

// 3 · Default: the three conditions tick one by one; then the filter slides through and the index scan lights; used twice, it flips back.
export function Default({ t }: StepCtx) {
  const a = easeInOut(seg(t, 1.8, 2.5));
  const ix = easeOutBack(seg(t, 2.4, 2.8));
  return (
    <Svg label="A single-reference, side-effect-free, non-recursive CTE is inlined and the filter reaches the index" h={300}>
      <Box x={25} y={50} w={150} label="WHERE key = 123" hi />
      <line x1={175} y1={72} x2={lerp(175, 260, a)} y2={72} stroke={C.caramel} strokeWidth={3} opacity={a > 0 ? 1 : 0} />
      <g opacity={clamp(ix)}>
        <Box x={260} y={50} w={160} label="Index Scan key" hi />
      </g>
      <T x={25} y={150} s={14} f={C.caramel} w={700}>
        inlined when:
      </T>
      {['no side effects', 'not recursive', 'referenced once'].map((c, i) => {
        const k = easeOut(seg(t, 0.3 + i * 0.4, 0.6 + i * 0.4));
        return (
          <g key={c} opacity={k}>
            <path d={`M25 ${172 + i * 26} l5 5 l10 -12`} fill="none" stroke={C.caramel} strokeWidth={2.5} strokeDasharray="30" strokeDashoffset={30 * (1 - k)} />
            <T x={46} y={178 + i * 26} s={14} f={C.crema}>
              {c}
            </T>
          </g>
        );
      })}
      <T x={25} y={276} s={13} f={C.cherryText} o={easeOut(seg(t, 3.4, 3.9))}>
        used twice: computed once again
      </T>
    </Svg>
  );
}

// 4 · Predict: once versus twice. After the answer, a probe hits the index for the single use, and the double use reads a stacked copy.
export function RefPredict({ t, answer }: StepCtx) {
  const answered = answer !== null;
  const s = useSinceAnswer(answered);
  const probe = answered ? seg(s, 0.2, 0.7) : 0;
  const stack = answered ? easeOut(seg(s, 0.6, 1.0)) : 0;
  return (
    <Svg label="With one reference the CTE is inlined and uses the index; with two it is materialised as a copy with no index" h={300}>
      <T x={25} y={36} s={14} f={C.latte}>
        referenced once
      </T>
      <Box x={25} y={48} w={170} label="Index Scan" hi={answered} />
      {probe > 0 && probe < 1 && <circle cx={lerp(195, 260, probe)} cy={70} r={5} fill={C.caramel} />}
      <T x={25} y={140} s={14} f={C.latte}>
        referenced twice
      </T>
      {[2, 1].map((k) => (
        <rect key={k} x={25 + k * 6 * stack} y={152 - k * 6 * stack} width={170} height={44} rx={8} fill={C.cocoa} stroke={C.cherryText} opacity={stack * 0.5} />
      ))}
      <Box x={25} y={152} w={170} label="Materialised copy" bad={answered} />
      {!answered ? (
        <T x={430} y={140} s={48} f={C.caramel} a="middle" o={0.75 + 0.25 * Math.sin(t * 3)}>
          ?
        </T>
      ) : (
        <T x={230} y={252} s={16} f={C.caramel} w={700} o={easeOut(seg(s, 0.9, 1.3))}>
          only one uses the index
        </T>
      )}
    </Svg>
  );
}

// 5 · NOT MATERIALIZED: both references light and each sends its own probe to the big table; the read counter goes to 2.
export function NotMat({ t }: StepCtx) {
  const a = easeOutBack(seg(t, 0.3, 0.6));
  const b = easeOutBack(seg(t, 0.6, 0.9));
  const p1 = seg(t, 1.0, 1.6);
  const p2 = seg(t, 1.7, 2.3);
  const reads = (p1 >= 1 ? 1 : 0) + (p2 >= 1 ? 1 : 0);
  return (
    <Svg label="NOT MATERIALIZED inlines each reference so both use the index, at the cost of reading big once per reference" h={300}>
      <g opacity={clamp(a)}>
        <Box x={25} y={50} w={170} label="w1 → Index Scan" hi />
      </g>
      <g opacity={clamp(b)}>
        <Box x={25} y={110} w={170} label="w2 → Index Scan" hi />
      </g>
      <rect x={380} y={66} width={160} height={74} rx={10} fill={C.roast} stroke={C.mocha} />
      <T x={460} y={108} s={14} f={C.crema} a="middle">
        big
      </T>
      <line x1={195} y1={72} x2={380} y2={90} stroke={C.taupe} strokeDasharray="4 4" opacity={a} />
      <line x1={195} y1={132} x2={380} y2={116} stroke={C.taupe} strokeDasharray="4 4" opacity={b} />
      {p1 > 0 && p1 < 1 && <circle cx={lerp(195, 380, p1)} cy={lerp(72, 90, p1)} r={5} fill={C.caramel} />}
      {p2 > 0 && p2 < 1 && <circle cx={lerp(195, 380, p2)} cy={lerp(132, 116, p2)} r={5} fill={C.caramel} />}
      <T x={460} y={164} s={13} f={reads === 2 ? C.cherryText : C.latte} a="middle" o={t > 1.0 ? 1 : 0}>
        {`reads of big: ${reads}`}
      </T>
      <T x={25} y={190} s={14} f={C.caramel} o={easeOut(seg(t, 2.0, 2.4))}>
        index used for both
      </T>
      <T x={25} y={218} s={14} f={C.cherryText} o={easeOut(seg(t, 2.6, 3.0))}>
        price: big is read once per reference
      </T>
      <T x={25} y={246} s={13} f={C.latte} o={easeOut(seg(t, 3.3, 3.7))}>
        wins when each use needs only a small part
      </T>
    </Svg>
  );
}

// 6 · Expensive: each row's function call fills a cell; the materialised row needs one per base row, the inlined one needs two, and the call counters say 12 and 24.
export function Expensive({ t }: StepCtx) {
  const a = seg(t, 0.3, 3.0);
  const n = Math.min(12, Math.floor(a * 12.001));
  return (
    <Svg label="Materialising evaluates an expensive function once per base row; NOT MATERIALIZED evaluates it once per reference" h={300}>
      <T x={25} y={36} s={14} f={C.caramel} w={700}>
        MATERIALIZED: once per row
      </T>
      <T x={575} y={36} s={13} f={C.caramel} a="end">
        {`calls: ${n}`}
      </T>
      {Array.from({ length: 12 }, (_, i) => (
        <rect key={i} x={25 + i * 44} y={50} width={36} height={24} rx={5} fill={C.caramel} opacity={clamp(a * 12 - i)} />
      ))}
      <T x={25} y={140} s={14} f={C.cherryText} w={700}>
        NOT MATERIALIZED: once per reference
      </T>
      <T x={575} y={140} s={13} f={C.cherryText} a="end">
        {`calls: ${n * 2}`}
      </T>
      {Array.from({ length: 12 }, (_, i) => (
        <g key={i} opacity={clamp(a * 12 - i)}>
          <rect x={25 + i * 44} y={154} width={36} height={24} rx={5} fill={C.cherry} />
          <rect x={25 + i * 44} y={184} width={36} height={24} rx={5} fill={C.cherry} />
        </g>
      ))}
      <T x={300} y={254} s={13} f={C.latte} a="middle" o={easeOut(seg(t, 3.4, 3.9))}>
        write MATERIALIZED so a later edit cannot undo this
      </T>
    </Svg>
  );
}

// 7 · Predict: two references. After the answer, an f badge pops on each, one after the other.
export function CallsPredict({ t, answer }: StepCtx) {
  const answered = answer !== null;
  const s = useSinceAnswer(answered);
  return (
    <Svg label="An expensive function in a CTE referenced twice and marked NOT MATERIALIZED runs twice per base row" h={260}>
      <Box x={25} y={60} w={200} label="w1 → f(val)" bad={answered} />
      <Box x={25} y={120} w={200} label="w2 → f(val)" bad={answered} />
      {answered &&
        [0, 1].map((i) => {
          const k = easeOutBack(seg(s, 0.2 + i * 0.4, 0.5 + i * 0.4));
          return (
            <g key={i} opacity={clamp(k)} transform={`translate(255 ${82 + i * 60}) scale(${0.5 + 0.5 * clamp(k)}) translate(-255 ${-(82 + i * 60)})`}>
              <circle cx={255} cy={82 + i * 60} r={16} fill={C.cherry} />
              <T x={255} y={87 + i * 60} s={14} f={C.crema} a="middle" w={700}>
                f
              </T>
            </g>
          );
        })}
      {!answered ? (
        <T x={380} y={116} s={48} f={C.caramel} a="middle" o={0.75 + 0.25 * Math.sin(t * 3)}>
          ?
        </T>
      ) : (
        <T x={300} y={222} s={22} f={C.cherryText} a="middle" w={700} o={easeOut(seg(s, 1.0, 1.4))}>
          2 calls per base row
        </T>
      )}
    </Svg>
  );
}

// 8 · Recompute: each reference runs the whole definition in turn (two red bars); then a temp table is computed once and both references read it.
export function Recompute({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.2, 0.5));
  const r1 = seg(t, 0.6, 1.3);
  const r2 = seg(t, 1.3, 2.0);
  const b = easeOut(seg(t, 2.3, 2.6));
  const once = seg(t, 2.6, 3.2);
  const after = easeOut(seg(t, 3.2, 3.6));
  return (
    <Svg label="SQL Server re-executes the CTE for every reference; a temporary table computes it once, the documented fix" h={300}>
      <g opacity={a}>
        <Box x={25} y={50} w={180} label="reference 1 → run" bad={after < 1} hi={after >= 1} />
        <Box x={25} y={110} w={180} label="reference 2 → run" bad={after < 1} hi={after >= 1} />
      </g>
      <rect x={29} y={86} width={172 * r1} height={4} rx={2} fill={after >= 1 ? C.caramel : C.cherry} />
      <rect x={29} y={146} width={172 * r2} height={4} rx={2} fill={after >= 1 ? C.caramel : C.cherry} />
      <T x={230} y={90} s={13} f={C.cherryText} o={a}>
        no materialisation switch
      </T>
      <g opacity={b}>
        <Box x={25} y={200} w={220} label="temp table: computed once" hi />
      </g>
      <rect x={29} y={236} width={212 * once} height={4} rx={2} fill={C.caramel} />
      <T x={270} y={228} s={13} f={C.caramel} o={easeOut(seg(t, 3.0, 3.4))}>
        the documented fix
      </T>
    </Svg>
  );
}

// 9 · Want fence: three cases, each with its glyph: a red fence rising for the first two, a gate opening for the third.
export function WantFence({ t }: StepCtx) {
  const rows = [
    ['repeat would duplicate real work', 'fence it'],
    ['side effects: once is a requirement', 'fence it'],
    ['optimizer reaching inside saves more', 'inline it'],
  ];
  return (
    <Svg label="Fence a CTE when repeating it would duplicate real work or when side effects must happen once; inline it when the optimizer reaching inside saves more" h={280}>
      {rows.map((r, i) => {
        const k = easeOut(seg(t, i * 1.0, i * 1.0 + 0.5));
        const g = easeOutBack(seg(t, i * 1.0 + 0.5, i * 1.0 + 0.9));
        const y = 30 + i * 80;
        return (
          <g key={r[0]} opacity={k}>
            <T x={25} y={y + 20} s={14} f={C.latte}>
              {r[0]}
            </T>
            <T x={25} y={y + 50} s={20} f={i === 2 ? C.caramel : C.cherryText} w={700}>
              {r[1]}
            </T>
            {i < 2 ? (
              <rect x={540} y={y + 56 - 46 * clamp(g)} width={12} height={46 * clamp(g)} rx={3} fill={C.cherryText} />
            ) : (
              <g>
                <rect x={526} y={y + 10} width={6} height={46} rx={2} fill={C.caramel} />
                <rect x={0} y={0} width={30} height={6} rx={2} fill={C.caramel} transform={`translate(532 ${y + 10}) rotate(${90 * clamp(g)})`} />
              </g>
            )}
          </g>
        );
      })}
    </Svg>
  );
}

// 10 · Verdict: three habits, each underlined and ticked.
export function Verdict({ t }: StepCtx) {
  const rows = [
    ['know your regime', 'engine and version'],
    ['say it explicitly', 'MATERIALIZED or NOT'],
    ['test single evaluation', 'do not just read the plan'],
  ];
  return (
    <Svg label="Three habits for CTEs: know your engine and version, say MATERIALIZED or NOT explicitly, test single evaluation rather than just reading the plan" h={280}>
      {rows.map((r, i) => {
        const k = easeOut(seg(t, i * 0.9, i * 0.9 + 0.5));
        const bar = easeInOut(seg(t, i * 0.9 + 0.3, i * 0.9 + 0.9));
        const tick = easeOut(seg(t, i * 0.9 + 0.8, i * 0.9 + 1.1));
        return (
          <g key={r[0]} opacity={k}>
            <T x={25} y={50 + i * 80} s={14} f={C.latte}>
              {r[0]}
            </T>
            <T x={25} y={82 + i * 80} s={20} f={C.caramel} w={700}>
              {r[1]}
            </T>
            <rect x={25} y={92 + i * 80} width={360 * bar} height={3} fill={C.caramel} />
            <path d={`M540 ${70 + i * 80} l8 8 l16 -18`} fill="none" stroke={C.caramel} strokeWidth={3} strokeDasharray="40" strokeDashoffset={40 * (1 - tick)} />
          </g>
        );
      })}
    </Svg>
  );
}

export function ProveRelease({ t, answer }: StepCtx) {
  const answered = answer !== null;
  const s = useSinceAnswer(answered);
  const n = answered ? Math.round(lerp(9, 12, easeOut(seg(s, 0.1, 0.8)))) : 9;
  const bar = answered ? easeOut(seg(s, 0.8, 1.2)) : 0;
  return (
    <Svg label="Single-reference CTEs are inlined by default from PostgreSQL 12" h={240}>
      <T x={40} y={84} s={18} f={C.latte}>
        inlined by default from PostgreSQL
      </T>
      {answered ? (
        <>
          <T x={40} y={140} s={26} f={C.caramel} w={700}>
            {String(n)}
          </T>
          <rect x={40} y={152} width={40 * bar} height={3} fill={C.caramel} />
        </>
      ) : (
        <T x={40} y={150} s={40} f={C.caramel} o={0.75 + 0.25 * Math.sin(t * 3)}>
          ?
        </T>
      )}
    </Svg>
  );
}
export function ProveSqlServer({ t, answer }: StepCtx) {
  const answered = answer !== null;
  const s = useSinceAnswer(answered);
  return (
    <Svg label="A twice-referenced CTE on SQL Server executes twice" h={240}>
      <T x={40} y={100} s={18} f={C.latte}>
        executes
      </T>
      {answered ? (
        <>
          <T x={160} y={104} s={24} f={C.cherryText} w={700} o={easeOut(seg(s, 0.1, 0.4))}>
            twice
          </T>
          {[0, 1].map((i) => (
            <rect key={i} x={40} y={140 + i * 22} width={260 * seg(s, 0.4 + i * 0.5, 0.9 + i * 0.5)} height={12} rx={3} fill={C.cherry} />
          ))}
        </>
      ) : (
        <T x={180} y={110} s={40} f={C.caramel} o={0.75 + 0.25 * Math.sin(t * 3)}>
          ?
        </T>
      )}
    </Svg>
  );
}
