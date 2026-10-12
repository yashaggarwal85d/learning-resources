import { useEffect, useState, type ReactNode } from 'react';
import type { StepCtx } from '../../../../../reels/types';
import { easeInOut, easeOut, easeOutBack, fmt, lerp, seg } from '../../../../../reels/anim';
import { Bar, C, Stack, Svg, T } from '../../../../../reels/kit';
import { Code } from '../../../../../reels/Code';

// Every number shown here is computed or asserted by examples.py.
// The model: the chapter's vector of 64-bit keys (empty capacity 0; the first append allocates 1; an append to a full vector
// doubles the capacity, copies the n keys, then writes). One unit of cost = one element write; for trees, one node written.
// The time model of this topic: one server, requests in arrival order, one tick = one element write, a request every 4 ticks.

const at = (t: number, s: number, e: number) => easeOut(seg(t, s, e));

/** Text with real subscripts: `log_{1.5} n` draws a small lowered 1.5 (the Unicode subscript glyphs are too small on phones). */
const fx = (s: string) =>
  s.split(/_\{([^}]*)\}/).map((p, i) =>
    i % 2 ? (
      <tspan key={i} dy={4} style={{ fontSize: '0.75em' }}>
        {p}
      </tspan>
    ) : p === '' ? null : i > 0 ? (
      <tspan key={i} dy={-4}>
        {p}
      </tspan>
    ) : (
      p
    ),
  );

/** A straight arrow with a small head. */
const Arrow = ({ x1, y1, x2, y2, f, o = 1, w = 2 }: { x1: number; y1: number; x2: number; y2: number; f: string; o?: number; w?: number }) => {
  const a = Math.atan2(y2 - y1, x2 - x1);
  const hx = (d: number) => x2 - 9 * Math.cos(a + d);
  const hy = (d: number) => y2 - 9 * Math.sin(a + d);
  return (
    <g opacity={o}>
      <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={f} strokeWidth={w} />
      <polygon points={`${x2},${y2} ${hx(0.45)},${hy(0.45)} ${hx(-0.45)},${hy(-0.45)}`} fill={f} />
    </g>
  );
};

/** Phone layout of a question step: a narrow 360-unit canvas that stays short, so the drawing is not shrunk when the explanation grows under it. */
const PSvg = ({ label, h, children }: { label: string; h: number; children: ReactNode }) => (
  <svg viewBox={`0 0 360 ${h}`} className="h-full w-full" role="img" aria-label={label}>
    {children}
  </svg>
);

/** Seconds since the learner answered a predict step (the player's clock is already finished by then), so reveals can animate. */
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
      if (d < 5) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [on]);
  return s;
}

/** A square cell of the vector: a crema key (when wide enough to print it), or an empty taupe slot. `faded` is a moved old cell. */
const Cell = ({ x, y, w, h = w, label, filled = true, faded = false, o = 1, fs = 13, stroke }: { x: number; y: number; w: number; h?: number; label?: ReactNode; filled?: boolean; faded?: boolean; o?: number; fs?: number; stroke?: string }) => (
  <g opacity={o}>
    <rect x={x} y={y} width={w} height={h} rx={3} fill={filled && !faded ? C.crema : 'none'} stroke={stroke ?? (filled && !faded ? C.crema : C.taupe)} strokeWidth={1.5} />
    {filled && label !== undefined && w >= 22 && (
      <T x={x + w / 2} y={y + h / 2 + 5} s={fs} f={faded ? C.taupe : C.espresso} a="middle" w={700}>
        {label}
      </T>
    )}
  </g>
);

// ---- the models: the same rules as examples.py -------------------------------------------------------------------------
/** The plain vector (g = 2): the write cost of each of the first n appends. */
function plainCosts(n: number) {
  const out: number[] = [];
  let size = 0;
  let cap = 0;
  for (let i = 0; i < n; i++) {
    let c = 1;
    if (size === cap) {
      if (cap === 0) cap = 1;
      else {
        c += size;
        cap *= 2;
      }
    }
    size++;
    out.push(c);
  }
  return out;
}
type Inc = { cost: number; n: number; cap: number; m: number; k: number; migrating: boolean };
/** The incremental vector, appends only, 2 moves per append: its state after each of the first `count` appends. */
function incTrace(count: number) {
  const out: Inc[] = [];
  let n = 0;
  let cap = 0;
  let m = 0;
  let k = 0;
  let migrating = false;
  for (let i = 0; i < count; i++) {
    if (n === cap) {
      if (cap === 0) cap = 1;
      else {
        migrating = true;
        m = n;
        k = 0;
        cap *= 2;
      }
    }
    n++;
    let cost = 1;
    while (migrating && cost < 3 && k < m) {
      k++;
      cost++;
    }
    if (migrating && k >= m) migrating = false;
    out.push({ cost, n, cap, m, k, migrating });
  }
  return out;
}
const PLAIN16 = plainCosts(16);
const INC16 = incTrace(16);

// ---- shared pieces ------------------------------------------------------------------------------------------------------
/** The percentile ladder's column centres. */
const COLS = [90, 220, 350, 480];

/** A request dot. */
const Dot = ({ x, y, r = 5, f = C.crema, o = 1 }: { x: number; y: number; r?: number; f?: string; o?: number }) => <circle cx={x} cy={y} r={r} fill={f} opacity={o} />;

// 1 · One request behind half a million copies: the spike, drawn as time that requests spend waiting.
export function Opening({ t }: StepCtx) {
  const fill = easeOut(seg(t, 1.6, 3.8));
  const W = 330 * fill; // the queue band
  const dots = [0, 1, 2, 3, 4].map((i) => {
    const st = 0.2 + 0.25 * i;
    return { x: lerp(520, 150, seg(t, st, st + 0.9)), flash: seg(t, st + 0.7, st + 0.9) * (1 - seg(t, st + 0.9, st + 1.2)) };
  });
  const flash = Math.max(...dots.map((d) => d.flash));
  return (
    <Svg label="A server box holding the vector with a lane of requests arriving every 4 ticks; append 524,289 fills the box with a copy of 524,288 keys, and the arriving requests stop and pile up in a queue that grows to 131,072" h={360}>
      <T x={40} y={26} s={15} f={C.latte}>each request appends one key</T>
      <T x={40} y={46} s={13} f={C.taupe}>1 tick = 1 element write · a request every 4 ticks</T>
      <rect x={40} y={86} width={110} height={100} rx={8} fill="none" stroke={flash > 0.2 ? C.latte : C.crema} strokeWidth={1.5 + 2 * flash} />
      <rect x={43} y={116} width={104 * fill} height={67} rx={4} fill={C.cherry} />
      <T x={95} y={106} s={13} f={C.latte} a="middle">vector</T>
      <line x1={170} y1={136} x2={520} y2={136} stroke={C.taupe} strokeWidth={1} opacity={0.6} />
      {t < 1.8 && dots.map((d, i) => d.x > 153 && <Dot key={i} x={d.x} y={136} />)}
      {fill > 0 && (
        <g>
          <rect x={170} y={126} width={Math.max(2, W)} height={20} rx={6} fill={C.cherry} opacity={0.22} stroke={C.cherry} strokeWidth={1.5} />
          {Array.from({ length: Math.floor(W / 11) }, (_, j) => (
            <Dot key={j} x={178 + 11 * j} y={136} r={4} />
          ))}
        </g>
      )}
      <T x={40} y={214} s={15} f={C.cherryText} w={600} o={at(t, 1.6, 2.0)}>append 524,289</T>
      <T x={40} y={240} s={13} f={C.taupe} o={at(t, 1.6, 2.0)}>copies 524,288 keys</T>
      <T x={40} y={286} s={26} f={C.cherryText} w={700} serif o={at(t, 1.6, 2.0)}>{fmt(131072 * fill)}</T>
      <T x={40} y={312} s={13} f={C.latte} o={at(t, 1.6, 2.0)}>requests arrive while it copies</T>
      <T x={40} y={348} s={13} f={C.taupe} o={at(t, 4.0, 4.4)}>1,000,000 requests in all</T>
    </Svg>
  );
}

// 2 · What is the p99 of an append? The ladder, asked of the appends themselves.
export function AppendP99({ t, answer, portrait }: StepCtx) {
  const shown = answer !== null;
  const s = useSinceAnswer(shown);
  const q = at(t, 0.1, 0.6);
  const vals = ['1', '1', '1', '524,289'];
  const heads = ['p50', 'p99', 'p99.9', 'max'];
  if (portrait) {
    const cols = [110, 260];
    return (
      <PSvg label="Of 1,000,000 appends, 20 resize. The p99 and the maximum cost of an append, to be guessed" h={240}>
        <T x={20} y={30} s={15} f={C.crema}>1,000,000 appends</T>
        <T x={20} y={52} s={13} f={C.taupe}>20 of them resize</T>
        {[1, 3].map((c, k) => (
          <g key={k}>
            <T x={cols[k]} y={104} s={15} f={C.taupe} a="middle" o={q}>{heads[c]}</T>
            {!shown && <T x={cols[k]} y={150} s={22} f={C.crema} a="middle" w={700} o={q}>?</T>}
            {shown && (
              <T x={cols[k]} y={150} s={22} f={k === 1 ? C.cherryText : C.crema} a="middle" w={700} o={at(s, 0.2 + 0.4 * k, 0.5 + 0.4 * k)}>
                {vals[c]}
              </T>
            )}
          </g>
        ))}
        <T x={20} y={210} s={15} f={C.taupe} o={q}>p99: 99 in 100 at or under</T>
      </PSvg>
    );
  }
  return (
    <Svg label="The percentile ladder p50, p99, p99.9 and max for the cost of an append in a million appends to the doubling vector: 20 appends resize; the values are to be guessed, then they are 1, 1, 1 and 524,289" h={340}>
      <T x={40} y={30} s={15} f={C.crema}>1,000,000 appends, doubling from empty</T>
      <T x={40} y={52} s={13} f={C.taupe}>p99: the cost 99 of every 100 appends stay at or under</T>
      {COLS.map((x, i) => (
        <g key={i}>
          <T x={x} y={100} s={13} f={C.taupe} a="middle" o={q}>{heads[i]}</T>
          {!shown && <T x={x} y={150} s={20} f={C.crema} a="middle" w={700} o={q}>?</T>}
          {shown && (
            <T x={x} y={150} s={20} f={i === 3 ? C.cherryText : C.crema} a="middle" w={700} o={at(s, 0.2 + 0.3 * i, 0.5 + 0.3 * i)}>
              {vals[i]}
            </T>
          )}
        </g>
      ))}
      <T x={40} y={124} s={13} f={C.latte} o={q}>append cost (writes)</T>
      <T x={40} y={210} s={13} f={C.latte} o={q}>20 appends resize</T>
      <T x={40} y={236} s={13} f={C.taupe} o={q}>mean: 2.05 writes</T>
      {shown && (
        <T x={40} y={290} s={13} f={C.latte} o={at(s, 1.6, 2.0)}>p99.99 is 1 too: 99.998% cost 1</T>
      )}
    </Svg>
  );
}

// 3 · Percentiles of requests, not of appends: the same ladder twice, then the share that waited.
export function Requests({ t }: StepCtx) {
  const heads = ['p50', 'p99', 'p99.9', 'max'];
  const r1 = ['1', '1', '1', '524,289'];
  const r2 = ['1', '494,289', '521,289', '524,289'];
  const bar = easeOut(seg(t, 2.6, 3.4));
  return (
    <Svg label="Two rows of the percentile ladder for the same million requests: the append cost stays at 1 until its maximum of 524,289, while the request latency, wait included, is 1 at p50 then 494,289, 521,289 and 524,289; a bar shows that 349,515 requests, 35 percent, waited behind a resize" h={380}>
      <T x={40} y={26} s={13} f={C.latte}>same million requests, one every 4 ticks</T>
      {COLS.map((x, i) => (
        <T key={i} x={x} y={58} s={13} f={C.taupe} a="middle" o={at(t, 0.1, 0.4)}>{heads[i]}</T>
      ))}
      <T x={40} y={92} s={13} f={C.latte} o={at(t, 0.3, 0.6)}>append cost (writes)</T>
      {r1.map((v, i) => (
        <T key={i} x={COLS[i]} y={118} s={17} f={i === 3 ? C.cherryText : C.crema} a="middle" w={600} o={at(t, 0.3, 0.6)}>{v}</T>
      ))}
      <T x={40} y={160} s={13} f={C.latte} o={at(t, 1.0, 1.3)}>request latency (ticks): wait + own append</T>
      {r2.map((v, i) => (
        <T key={i} x={COLS[i]} y={186} s={17} f={i === 0 ? C.crema : C.cherryText} a="middle" w={600} o={at(t, 1.0 + 0.4 * i, 1.3 + 0.4 * i)}>{v}</T>
      ))}
      <Bar x={40} y={230} w={480 * 0.35 * bar} h={18} full={480} fill={C.cherry} />
      <T x={40} y={276} s={15} f={C.cherryText} w={600} o={at(t, 3.6, 3.9)}>349,515 requests waited behind a resize</T>
      <T x={40} y={296} s={13} f={C.taupe} o={at(t, 3.6, 3.9)}>35% of all</T>
      <T x={40} y={344} s={15} f={C.crema} o={at(t, 4.0, 4.4)}>the copy is one append; the wait is everyone’s</T>
    </Svg>
  );
}

// 4 · A rare stall becomes common at scale: one slow leaf makes the whole request slow.
const LEAVES = Array.from({ length: 100 }, (_, i) => ({ x: 44 + 9.63 * (i % 50), y: i < 50 ? 176 : 196 }));
const SLOW = 37;
export function FanOut({ t }: StepCtx) {
  const lines = at(t, 0.2, 0.9);
  const slow = at(t, 1.1, 1.4);
  const root = at(t, 1.4, 1.7);
  return (
    <Svg label="A request fans out from a root to 100 leaf servers; one leaf is slow, and that is enough to make the whole request slow. With a 1 in 100 chance per server, 63 percent of requests to 100 servers are slow" h={360}>
      <T x={40} y={26} s={13} f={C.latte}>Dean and Barroso, The Tail at Scale</T>
      <T x={40} y={44} s={13} f={C.taupe}>each server: 10 ms typical, 1 s at its p99</T>
      {LEAVES.map((l, i) => (
        <line key={i} x1={300} y1={84} x2={l.x} y2={l.y} stroke={i === SLOW ? C.cherry : C.taupe} strokeWidth={i === SLOW ? 2 : 1} opacity={i === SLOW ? Math.max(0.35 * lines, slow) : 0.35 * lines} />
      ))}
      {LEAVES.map((l, i) => (
        <circle key={i} cx={l.x} cy={l.y} r={i === SLOW ? 5.5 : 3.5} fill={i === SLOW ? C.cherry : C.crema} opacity={i === SLOW ? 0.25 + 0.75 * slow : lines} />
      ))}
      <circle cx={300} cy={84} r={9} fill={C.crema} />
      <circle cx={300} cy={84} r={9} fill={C.cherry} opacity={root} />
      <T x={40} y={250} s={26} f={C.cherryText} w={700} serif o={at(t, 2.0, 2.4)}>63%</T>
      <T x={40} y={272} s={13} f={C.latte} o={at(t, 2.0, 2.4)}>of requests to 100 servers take over 1 s</T>
      <T x={40} y={316} s={15} f={C.crema} o={at(t, 2.8, 3.2)}>2,000 servers, 1 in 10,000 slow:</T>
      <T x={40} y={344} s={15} f={C.cherryText} w={600} o={at(t, 3.0, 3.4)}>almost 1 request in 5</T>
    </Svg>
  );
}

// 5 · Spend the coins as you earn them: the 16-append strips, the gauge draining over appends 9 to 12.
const UNIT = 10;
export function Installments({ t }: StepCtx) {
  const bx = (i: number) => 90 + 27.5 * i;
  const TB = 140;
  const BB = 322;
  const T9 = [2.1, 2.55, 3.0, 3.45]; // appends 9 to 12
  const barT = (i: number) => (i < 8 ? 1.4 + 0.075 * i : i < 12 ? T9[i - 8] : 3.7 + 0.1 * (i - 12));
  const drained = T9.filter((x) => t >= x + 0.1).length; // 0..4
  const left = 8 - 2 * drained;
  const level = 8 - 2 * T9.reduce((a, x) => a + at(t, x, x + 0.25), 0);
  const gaugeOn = at(t, 1.2, 1.6);
  return (
    <Svg label="The first 16 appends twice. Plain doubling: bars of 1, 2, 3, 1, 5, 1, 1, 1, 9 and seven 1s, 31 writes, largest 9. With 2 moves per append: bars of 1, 2 or 3, never more than 3, also 31 writes. A gauge of keys left to copy drains from 8 by 2 on each of appends 9 to 12" h={380}>
      <T x={90} y={28} s={15} f={C.latte}>plain doubling</T>
      {PLAIN16.map((c, i) => {
        const g = at(t, 0.2 + 0.06 * i, 0.4 + 0.06 * i);
        const h = c * UNIT * g;
        return (
          <g key={i}>
            <rect x={bx(i)} y={TB - h} width={24} height={h} rx={2} fill={c > 1 ? C.cherry : C.crema} />
            {c > 1 && g > 0.9 && (
              <T x={bx(i) + 12} y={TB - h - 5} s={13} f={C.cherryText} a="middle" w={700}>{c}</T>
            )}
          </g>
        );
      })}
      <line x1={90} y1={TB} x2={530} y2={TB} stroke={C.mocha} />
      <T x={90} y={160} s={13} f={C.latte} o={at(t, 1.2, 1.5)}>31 writes · max 9</T>

      <T x={40} y={208} s={13} f={C.latte} o={gaugeOn}>left to copy</T>
      <T x={176} y={208} s={17} f={C.caramel} w={700} o={gaugeOn}>{left}</T>
      <T x={250} y={208} s={15} f={C.caramel} o={gaugeOn}>2 moves per append</T>
      <g opacity={gaugeOn}>
        <rect x={40} y={218} width={22} height={96} rx={7} fill="none" stroke={C.taupe} strokeWidth={1} />
        <rect x={41} y={314 - 12 * level - 0.5} width={20} height={Math.max(0.1, 12 * level)} rx={5} fill={C.caramel} />
        <T x={70} y={228} s={13} f={C.taupe} o={at(t, 3.7, 4.0)}>was 8</T>
        <line x1={36} y1={218} x2={66} y2={218} stroke={C.taupe} strokeDasharray="3 3" opacity={at(t, 3.7, 4.0)} />
      </g>
      <T x={40} y={342} s={13} f={C.taupe} o={gaugeOn}>the last reel’s Φ = 8</T>
      {INC16.map((v, i) => {
        const g = at(t, barT(i), barT(i) + 0.2);
        return (
          <g key={i}>
            <rect x={bx(i)} y={BB - UNIT * g} width={24} height={UNIT * g} rx={2} fill={C.crema} />
            {v.cost > 1 && <rect x={bx(i)} y={BB - UNIT * v.cost * g} width={24} height={UNIT * (v.cost - 1) * g} rx={2} fill={C.caramel} />}
          </g>
        );
      })}
      <line x1={90} y1={BB} x2={530} y2={BB} stroke={C.mocha} />
      <line x1={90} y1={BB - 3 * UNIT} x2={lerp(90, 530, easeOut(seg(t, 4.2, 4.7)))} y2={BB - 3 * UNIT} stroke={C.caramel} strokeWidth={2} strokeDasharray="6 5" />
      <T x={534} y={BB - 3 * UNIT - 6} s={13} f={C.caramel} a="end" o={at(t, 4.5, 4.8)}>3</T>
      <T x={530} y={342} s={13} f={C.crema} a="end" o={at(t, 4.9, 5.2)}>31 writes · max 3</T>
    </Svg>
  );
}

// 6 · Two buffers and a frontier: the state after append 10, and the one comparison that picks the buffer.
const TB_CODE = [
  'def append(x):',
  '  if n == cap: grow()   # 2x, old = buf',
  '  buf[n] = x; n += 1',
  '  move(2)   # old[k] → buf[k], k += 1',
  'def get(i):',
  '  if old and k <= i < m:',
  '    return old[i]',
  '  return buf[i]',
];
const AFTER10 = INC16[9]; // n 10, cap 16, m 8, k 4
const Ring = ({ x, y, w, h, o = 1, f = C.caramel }: { x: number; y: number; w: number; h: number; o?: number; f?: string }) => (
  <rect x={x - 3} y={y - 3} width={w + 6} height={h + 6} rx={5} fill="none" stroke={f} strokeWidth={2.5} opacity={o} />
);
export function TwoBuffers({ t, portrait }: StepCtx) {
  const { k, m, n } = AFTER10;
  const fx0 = 40 + 30 * k - 2;
  const reads = [
    { label: 'get(1) → new', x: 40, ring: [40 + 30 * 1, 92], t: 1.4 },
    { label: 'get(5) → old', x: 215, ring: [40 + 30 * 5, 24], t: 2.0 },
    { label: 'get(9) → new', x: 390, ring: [40 + 30 * 9, 92], t: 2.6 },
  ];
  return (
    <Stack>
      {!(portrait && t > 1.7) && <Code title="the incremental vector" t={t} start={0.1} end={1.3} lines={TB_CODE} highlight={[3, 5]} />}
      <Svg fill label="After append 10: the old buffer of 8 slots and the new buffer of 16, with the frontier k = 4 splitting the old keys into moved (faded) and still waiting; three reads show which buffer each index uses: get(1) new, get(5) old, get(9) new" h={210}>
        <T x={40} y={14} s={13} f={C.latte} o={at(t, 0.3, 0.6)}>old · 8 slots</T>
        {Array.from({ length: m }, (_, i) => (
          <Cell key={i} x={40 + 30 * i} y={24} w={26} label={i + 1} faded={i < k} o={at(t, 0.3, 0.6)} />
        ))}
        <T x={40} y={82} s={13} f={C.latte} o={at(t, 0.3, 0.6)}>new · 16 slots</T>
        {Array.from({ length: 16 }, (_, i) => {
          const has = i < k || (i >= m && i < n);
          return <Cell key={i} x={40 + 30 * i} y={92} w={26} label={i + 1} filled={has} o={at(t, 0.3, 0.6)} />;
        })}
        <line x1={fx0} y1={18} x2={fx0} y2={64} stroke={C.caramel} strokeWidth={2} strokeDasharray="5 4" opacity={at(t, 0.8, 1.1)} />
        <line x1={fx0} y1={90} x2={fx0} y2={124} stroke={C.caramel} strokeWidth={2} strokeDasharray="5 4" opacity={at(t, 0.8, 1.1)} />
        <T x={fx0} y={146} s={15} f={C.caramel} a="middle" w={600} o={at(t, 0.8, 1.1)}>k = {k}</T>
        {reads.map((r, i) => (
          <g key={i}>
            <T x={r.x} y={186} s={13} f={C.latte} o={at(t, r.t, r.t + 0.3)}>{r.label}</T>
            <Ring x={r.ring[0]} y={r.ring[1]} w={26} h={26} o={at(t, r.t, r.t + 0.3)} />
          </g>
        ))}
      </Svg>
    </Stack>
  );
}

// 7 · Does the copy finish in time? Two bars race: keys left to copy (falls by 2) and free slots (falls by 1).
export function Race({ t, answer, portrait }: StepCtx) {
  const shown = answer !== null;
  const s = useSinceAnswer(shown);
  const q = at(t, 0.1, 0.6);
  // after appends 10, 11, 12 (local clock): left 6 -> 4 -> 2 -> 0, free 7 -> 6 -> 5 -> 4
  const steps = [0.3, 0.8, 1.3].map((x) => (shown ? at(s, x, x + 0.4) : 0));
  const done = steps.reduce((a, b) => a + b, 0);
  const left = 6 - 2 * done;
  const free = 7 - done;
  const lc = Math.round(left);
  const fc = Math.round(free);
  const U = portrait ? 18.75 : 25;
  const X = portrait ? 20 : 40;
  const L = portrait ? 300 : 400;
  const rev = at(s, 1.9, 2.3);
  if (portrait) {
    return (
      <PSvg label="After append 9 of 16 slots, keys left to copy fall from 6 to 0 and free slots from 7 to 4: the copy ends with 12 of 16 slots in use" h={250}>
        <T x={X} y={24} s={15} f={C.crema}>after append 9: n = 9 of 16</T>
        <T x={X} y={62} s={15} f={C.latte}>old keys left to copy</T>
        <Bar x={X} y={70} w={U * left} h={20} full={L} fill={C.caramel} o={q} />
        <T x={X + L + 12} y={86} s={17} f={C.caramel} w={700} o={q}>{lc}</T>
        <T x={X} y={122} s={15} f={C.latte}>free slots, new buffer</T>
        <Bar x={X} y={130} w={U * free} h={20} full={L} fill={C.crema} o={q} />
        <T x={X + L + 12} y={146} s={17} f={C.crema} w={700} o={q}>{fc}</T>
        {!shown && <T x={X} y={200} s={17} f={C.crema} w={600} o={q}>in use when the copy ends: ?</T>}
        {shown && (
          <g>
            <T x={X} y={200} s={20} f={C.caramel} w={700} o={rev}>12 of 16 in use</T>
            <T x={X} y={226} s={15} f={C.latte} o={rev}>4 slots spare</T>
          </g>
        )}
      </PSvg>
    );
  }
  return (
    <Svg label="After append 9 of 16 slots, two bars race: the old keys left to copy fall from 6 to 0 by 2 per append, and the free slots in the new buffer fall from 7 to 4 by 1 per append; the copy ends with 12 of 16 slots in use" h={340}>
      <T x={40} y={30} s={15} f={C.crema}>after append 9: n = 9 of 16</T>
      <T x={X} y={74} s={13} f={C.latte}>old keys left to copy</T>
      <Bar x={X} y={82} w={U * left} h={22} full={L} fill={C.caramel} o={q} />
      <T x={X + L + 14} y={100} s={17} f={C.caramel} w={700} o={q}>{lc}</T>
      <T x={X} y={140} s={13} f={C.latte}>free slots in the new buffer</T>
      <Bar x={X} y={148} w={U * free} h={22} full={L} fill={C.crema} o={q} />
      <T x={X + L + 14} y={166} s={17} f={C.crema} w={700} o={q}>{fc}</T>
      <T x={40} y={214} s={13} f={C.taupe} o={q}>each append: 1 new key, 2 old keys moved</T>
      {!shown && <T x={40} y={262} s={17} f={C.crema} w={600} o={q}>in use when the copy ends: ?</T>}
      {shown && (
        <g>
          <T x={40} y={262} s={20} f={C.caramel} w={700} o={rev}>12 of 16 in use</T>
          <T x={40} y={288} s={13} f={C.latte} o={rev}>4 slots spare</T>
          <T x={40} y={310} s={13} f={C.taupe} o={at(s, 2.1, 2.5)}>1 key per append would end at 16 of 16</T>
        </g>
      )}
    </Svg>
  );
}

// 8 · What the installments cost: four ledger rows, each with a tiny picture.
export function Costs({ t }: StepCtx) {
  const rows = [
    { y: 44, a: 'both buffers stay alive for longer', b: <>c = 524,288: the same 12 MiB peak,<tspan x={40} dy={18}>held 262,144 appends, not 1</tspan></>, t: 0.3 },
    { y: 124, a: 'every read checks the frontier', b: <>old if k ≤ i &lt; m, else new</>, t: 1.1 },
    { y: 204, a: 'the median append got slower', b: <>p50: 1 → <tspan fill={C.cherryText} fontWeight={700}>3</tspan> writes (524,287 appends cost 3)</>, t: 1.9 },
    { y: 284, a: 'O(1) only if allocation is O(1)', b: <>the analysis assumes the allocator is O(1)</>, t: 2.7 },
  ];
  const o = (i: number) => at(t, rows[i].t, rows[i].t + 0.4);
  return (
    <Svg label="Four costs of incremental copying: both buffers alive for 262,144 appends instead of one, the same 12 MiB peak as plain doubling at c = 524,288; a frontier comparison on every read; the median append rising from 1 to 3 writes; and the O(1) worst case holding only if allocation is O(1)" h={350}>
      {rows.map((r, i) => (
        <g key={i} opacity={o(i)}>
          <T x={40} y={r.y} s={15} f={C.crema}>{r.a}</T>
          <T x={40} y={r.y + 22} s={13} f={C.latte}>{r.b}</T>
        </g>
      ))}
      {/* 1 · two buffers along a time arrow */}
      <g opacity={o(0)}>
        <rect x={420} y={30} width={36} height={12} rx={2} fill="none" stroke={C.taupe} strokeWidth={1.5} />
        <rect x={420} y={46} width={72} height={12} rx={2} fill={C.crema} />
        <Arrow x1={420} y1={70} x2={500} y2={70} f={C.taupe} w={1.5} />
      </g>
      {/* 2 · the comparison */}
      <g opacity={o(1)}>
        <polygon points="456,106 478,124 456,142 434,124" fill="none" stroke={C.caramel} strokeWidth={2} />
        <Arrow x1={478} y1={124} x2={514} y2={112} f={C.taupe} w={1.5} />
        <Arrow x1={478} y1={124} x2={514} y2={140} f={C.taupe} w={1.5} />
      </g>
      {/* 3 · the median moving up a short ladder */}
      <g opacity={o(2)}>
        <line x1={470} y1={186} x2={470} y2={226} stroke={C.taupe} strokeWidth={1.5} />
        <circle cx={470} cy={222} r={5} fill={C.crema} opacity={0.5} />
        <circle cx={470} cy={190} r={6} fill={C.cherry} />
        <Arrow x1={490} y1={218} x2={490} y2={194} f={C.taupe} w={1.5} />
      </g>
      {/* 4 · an empty buffer, waiting to be allocated */}
      <g opacity={o(3)}>
        <rect x={420} y={270} width={86} height={26} rx={3} fill="none" stroke={C.taupe} strokeWidth={1.5} strokeDasharray="5 4" />
      </g>
    </Svg>
  );
}

// 9 · Global rebuilding: let it go stale, then rebuild. A sorted vector deletes by tombstone.
const SEQ9 = [3, 6, 10, 14, 2, 15, 8, 11];
const LIVE9 = [1, 4, 5, 7, 9, 12, 13, 16];
const Cross = ({ x, y, w, o }: { x: number; y: number; w: number; o: number }) => (
  <g opacity={o} stroke={C.taupe} strokeWidth={1.5}>
    <line x1={x + 4} y1={y + 4} x2={x + w - 4} y2={y + w - 4} />
    <line x1={x + w - 4} y1={y + 4} x2={x + 4} y2={y + w - 4} />
  </g>
);
export function Stale({ t }: StepCtx) {
  const td = (i: number) => 0.5 + 0.3 * i;
  const dead = (key: number) => {
    const i = SEQ9.indexOf(key);
    return i < 0 ? 0 : at(t, td(i), td(i) + 0.2);
  };
  const count = SEQ9.filter((_, i) => t >= td(i) + 0.1).length;
  const reb = seg(t, 2.9, 3.7);
  const fade = 1 - 0.55 * at(t, 3.7, 4.0);
  return (
    <Svg label="A sorted vector of keys 1 to 16: eight deletes each leave a tombstone at cost 1; when 8 of 16 slots are tombstones the 8 live keys are copied into a compact vector at cost 9; at 1,048,576 keys that delete would copy 524,288 keys" h={380}>
      <T x={40} y={24} s={13} f={C.latte}>sorted keys · a delete leaves a tombstone</T>
      <T x={40} y={50} s={15} f={count >= 8 ? C.caramel : C.crema} w={600}>tombstones: {count} of 16</T>
      <g opacity={fade}>
        {Array.from({ length: 16 }, (_, i) => {
          const d = dead(i + 1);
          return (
            <g key={i}>
              <rect x={40 + 30 * i} y={62} width={26} height={26} rx={3} fill={C.crema} opacity={1 - d} stroke={d > 0.5 ? C.taupe : C.crema} strokeWidth={1.5} />
              <rect x={40 + 30 * i} y={62} width={26} height={26} rx={3} fill="none" stroke={C.taupe} strokeWidth={1.5} opacity={d} />
              <T x={40 + 30 * i + 13} y={80} s={13} f={d > 0.5 ? C.taupe : C.espresso} a="middle" w={700}>{i + 1}</T>
              <Cross x={40 + 30 * i} y={62} w={26} o={d} />
            </g>
          );
        })}
      </g>
      {LIVE9.map((key, j) => {
        const a = at(t, 2.9 + 0.06 * j, 3.2 + 0.06 * j);
        const ox = 40 + 30 * (key - 1) + 13;
        const nx = 160 + 30 * j + 13;
        return (
          <g key={key}>
            <Arrow x1={ox} y1={90} x2={lerp(ox, nx, a)} y2={lerp(90, 138, a)} f={C.caramel} w={1.5} o={a > 0.02 && reb < 1 ? 1 : 0} />
            <Cell x={160 + 30 * j} y={140} w={26} label={key} o={at(t, 3.1 + 0.06 * j, 3.4 + 0.06 * j)} />
          </g>
        );
      })}
      <T x={160} y={186} s={13} f={C.latte} o={at(t, 3.7, 4.0)}>compact copy: 8 live keys</T>
      <T x={40} y={214} s={13} f={C.latte}>writes per delete</T>
      {SEQ9.map((_, i) => {
        const c = i === 7 ? 9 : 1;
        const h = c * 10 * at(t, td(i) + 0.1, td(i) + 0.3);
        return (
          <g key={i}>
            <rect x={40 + 34 * i} y={316 - h} width={28} height={h} rx={2} fill={c > 1 ? C.cherry : C.crema} />
            {c > 1 && h > 80 && <T x={40 + 34 * i + 14} y={316 - h - 5} s={15} f={C.cherryText} a="middle" w={700}>{c}</T>}
          </g>
        );
      })}
      <line x1={40} y1={316} x2={312} y2={316} stroke={C.mocha} />
      <T x={40} y={342} s={13} f={C.latte} o={at(t, 4.0, 4.4)}>at 1,048,576 keys, the 524,288th delete</T>
      <T x={40} y={370} s={15} f={C.cherryText} w={600} o={at(t, 4.0, 4.4)}>copies 524,288 keys</T>
    </Svg>
  );
}

// 10 · Rebuild in the background: start at a quarter, serve from the old copy, log what is behind the scan, swap.
const SEQ10 = [3, 6, 10, 14, 2, 15];
const TD10 = [0.3, 0.7, 1.1, 1.5, 2.4, 3.3];
const SRC10 = [0, 1, 3, 4, 6, 7, 8, 10, 11, 12, 14, 15]; // old slots copied, in scan order (keys 1,2,4,5,7,8,9,11,12,13,15,16)
const COST10 = [1, 1, 1, 7, 8, 4];
export function Background({ t }: StepCtx) {
  const scan = t < 1.5 ? 0 : t < 2.4 ? 8 * seg(t, 1.5, 2.3) : 8 + 8 * seg(t, 2.4, 3.2);
  const swap = easeInOut(seg(t, 4.0, 4.6));
  const deadAt = (key: number) => {
    const i = SEQ10.indexOf(key);
    return i < 0 ? 0 : at(t, TD10[i], TD10[i] + 0.2);
  };
  const log = [t >= TD10[4] + 0.1 && t < 3.6 ? 2 : 0, t >= TD10[5] + 0.1 && t < 3.8 ? 15 : 0].filter(Boolean);
  const replayed2 = at(t, 3.5, 3.7);
  const replayed15 = at(t, 3.7, 3.9);
  const oldY = lerp(56, 126, swap);
  const newY = lerp(126, 56, swap);
  const ptr = Math.min(15, Math.floor(scan));
  const ox = (i: number) => 40 + 30 * i;
  return (
    <Svg label="The 16 keys rebuilt in the background: at 4 tombstones a new copy is started; every delete also scans 8 old slots and copies the live keys, queries use the old copy; deletes behind the scan go in a log and are replayed before the swap. The delete costs are 1, 1, 1, 7, 8 and 4, never over 10" h={400}>
      <T x={40} y={20} s={13} f={C.latte}>start at a quarter · 8 slots of work per delete</T>
      <T x={40} y={44} s={13} f={C.latte}>{swap > 0.5 ? 'serves queries now' : 'old: serves queries'}</T>
      {/* the old copy */}
      <g opacity={lerp(1, 0.3, swap)}>
        {Array.from({ length: 16 }, (_, i) => {
          const d = deadAt(i + 1);
          return (
            <g key={i}>
              <rect x={ox(i)} y={oldY} width={26} height={26} rx={3} fill={C.crema} opacity={1 - d} stroke={d > 0.5 ? C.taupe : C.crema} strokeWidth={1.5} />
              <rect x={ox(i)} y={oldY} width={26} height={26} rx={3} fill="none" stroke={C.taupe} strokeWidth={1.5} opacity={d} />
              {swap < 0.5 && <T x={ox(i) + 13} y={oldY + 18} s={13} f={d > 0.5 ? C.taupe : C.espresso} a="middle" w={700}>{i + 1}</T>}
              <Cross x={ox(i)} y={oldY} w={26} o={d} />
            </g>
          );
        })}
      </g>
      {/* the scan pointer */}
      {scan > 0 && scan < 16 && (
        <g>
          <polygon points={`${ox(ptr) + 13},86 ${ox(ptr) + 6},98 ${ox(ptr) + 20},98`} fill={C.caramel} />
          <T x={ox(ptr) + 28} y={98} s={13} f={C.caramel} w={600}>scan</T>
        </g>
      )}
      {/* the new copy */}
      <T x={40} y={newY - 8} s={13} f={C.latte} o={at(t, 1.5, 1.8)}>{swap > 0.5 ? '' : 'new'}</T>
      <g opacity={at(t, 1.5, 1.8)}>
        {Array.from({ length: 12 }, (_, j) => {
          const has = scan > SRC10[j];
          const r = j === 1 ? replayed2 : j === 10 ? replayed15 : 0;
          return (
            <g key={j}>
              <Cell x={ox(j)} y={newY} w={26} label={SRC10[j] + 1} filled={has} />
              {has && r > 0 && <Cross x={ox(j)} y={newY} w={26} o={r} />}
            </g>
          );
        })}
      </g>
      <T x={420} y={newY + 18} s={13} f={C.caramel} w={600} o={at(t, 4.4, 4.7)}>swap</T>
      <T x={40} y={oldY + 46} s={13} f={C.taupe} o={at(t, 4.6, 4.9)}>old copy: freed</T>
      {/* the log */}
      <T x={400} y={160} s={13} f={C.latte} o={at(t, 1.5, 1.8)}>log</T>
      <rect x={400} y={168} width={120} height={32} rx={5} fill="none" stroke={C.taupe} strokeWidth={1.5} opacity={at(t, 1.5, 1.8)} />
      {log.map((k, i) => (
        <T key={k} x={414 + 36 * i} y={190} s={15} f={C.crema} w={600}>{k}</T>
      ))}
      {/* the cost of each delete */}
      <T x={40} y={218} s={13} f={C.latte}>writes per delete</T>
      {COST10.map((c, i) => {
        const h = c * 10 * at(t, TD10[i] + 0.1, TD10[i] + 0.4);
        return (
          <g key={i}>
            <rect x={40 + 40 * i} y={330 - h} width={32} height={h} rx={2} fill={C.crema} />
            {c >= 4 && h > c * 9 && <T x={40 + 40 * i + 16} y={330 - h - 5} s={13} f={C.crema} a="middle" w={600}>{c}</T>}
          </g>
        );
      })}
      <line x1={40} y1={330} x2={520} y2={330} stroke={C.mocha} />
      <line x1={40} y1={230} x2={lerp(40, 520, at(t, 4.4, 4.9))} y2={230} stroke={C.caramel} strokeWidth={2} strokeDasharray="6 5" />
      <T x={520} y={224} s={13} f={C.caramel} a="end" o={at(t, 4.7, 5.0)}>10</T>
      <T x={40} y={358} s={15} f={C.crema} o={at(t, 4.9, 5.3)}>at any size: every delete ≤ 10 writes</T>
      <T x={40} y={378} s={13} f={C.taupe} o={at(t, 4.9, 5.3)}>old copy never past 39% tombstones</T>
    </Svg>
  );
}

// ---- the scapegoat example tree (steps 11 to 13): built from the same insertion order as examples.py ------------------------
type TN = { key: number; l?: TN; r?: TN };
const ins = (r: TN | undefined, k: number): TN => (!r ? { key: k } : k < r.key ? { ...r, l: ins(r.l, k) } : { ...r, r: ins(r.r, k) });
const keysOf = (r?: TN): number[] => (r ? [...keysOf(r.l), r.key, ...keysOf(r.r)] : []);
/** A perfectly balanced tree over sorted keys; the root is the lower middle, index floor((s - 1) / 2). */
const buildLow = (a: number[]): TN | undefined => {
  if (!a.length) return undefined;
  const mid = Math.floor((a.length - 1) / 2);
  return { key: a[mid], l: buildLow(a.slice(0, mid)), r: buildLow(a.slice(mid + 1)) };
};
const subOf = (r: TN | undefined, k: number): TN | undefined => (!r ? undefined : r.key === k ? r : subOf(r.l, k) ?? subOf(r.r, k));
const replaceAt = (r: TN | undefined, k: number, w: TN | undefined): TN | undefined => (!r ? undefined : r.key === k ? w : { ...r, l: replaceAt(r.l, k, w), r: replaceAt(r.r, k, w) });
const ORDER9 = [22, 31, 18, 87, 54, 51, 80, 63, 69];
const TREE_BEFORE = ORDER9.reduce<TN | undefined>(ins, undefined)!;
const SCAPEGOAT = 87;
const REBUILT = keysOf(subOf(TREE_BEFORE, SCAPEGOAT)); // 51, 54, 63, 69, 80, 87
const TREE_AFTER = replaceAt(TREE_BEFORE, SCAPEGOAT, buildLow(REBUILT))!;
type Pos = { key: number; depth: number; rank: number; parent?: number };
function layout(root: TN): Pos[] {
  const all = keysOf(root);
  const out: Pos[] = [];
  const walk = (n: TN | undefined, d: number, p?: number) => {
    if (!n) return;
    out.push({ key: n.key, depth: d, rank: all.indexOf(n.key), parent: p });
    walk(n.l, d + 1, n.key);
    walk(n.r, d + 1, n.key);
  };
  walk(root, 0);
  return out;
}
const POS_BEFORE = layout(TREE_BEFORE);
const POS_AFTER = layout(TREE_AFTER);
const pOf = (P: Pos[], k: number) => P.find((p) => p.key === k)!;
const height = (P: Pos[]) => Math.max(...P.map((p) => p.depth));
const ANC = [63, 80, 54, 87, 31, 22]; // the ancestors of 69, nearest first
const sizeOf = (r: TN | undefined): number => (r ? 1 + sizeOf(r.l) + sizeOf(r.r) : 0);
/** The heavier child's share of an ancestor of 69: "1 of 2". */
const share = (k: number) => {
  const n = subOf(TREE_BEFORE, k)!;
  return `${Math.max(sizeOf(n.l), sizeOf(n.r))} of ${sizeOf(n)}`;
};

/** A tree node: a ring with its key; `ring` overrides the outline colour. */
const TNode = ({ x, y, k, ring = C.crema, rw = 1.5, o = 1, fill = C.roast, f = C.crema }: { x: number; y: number; k: number; ring?: string; rw?: number; o?: number; fill?: string; f?: string }) => (
  <g opacity={o}>
    <circle cx={x} cy={y} r={17} fill={fill} stroke={ring} strokeWidth={rw} />
    <T x={x} y={y + 5} s={15} f={f} a="middle" w={600}>{k}</T>
  </g>
);
const Edge = ({ x1, y1, x2, y2, o = 1, f = C.latte }: { x1: number; y1: number; x2: number; y2: number; o?: number; f?: string }) => <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={f} strokeWidth={1.5} opacity={o} />;

// 11 · A tree that stores no balance: a plain binary search tree, a limit line at h(n), and an insert that lands below it.
const SX = (rank: number) => 64 + 54 * rank;
const SY = (depth: number) => 52 + 46 * depth;
export function Scapegoat({ t }: StepCtx) {
  const wp = [22, 31, 87, 54, 80, 63, 69];
  const u = 6 * seg(t, 2.0, 3.4);
  const idx = Math.min(5, Math.floor(u));
  const a = wp[idx];
  const b = wp[idx + 1];
  const f = easeInOut(u - idx);
  const pa = pOf(POS_BEFORE, a);
  const pb = pOf(POS_BEFORE, b);
  const mx = lerp(SX(pa.rank), SX(pb.rank), f);
  const my = lerp(SY(pa.depth), SY(pb.depth), f);
  const landed = seg(t, 3.4, 3.6);
  const p69 = pOf(POS_BEFORE, 69);
  const counts = t >= 4.0 ? '9 · max 9' : '8 · max 8';
  return (
    <Svg label="A plain binary search tree of 8 keys with a dashed limit line at depth 5 for alpha 2/3; inserting 69 lands at depth 6, below the line, and lights up. The root keeps only two counts, the size and the largest size since the last full rebuild" h={400}>
      <T x={40} y={22} s={13} f={C.latte}>alpha = 2/3 · {fx('h(n) = ⌊log_{1.5} n⌋')}</T>
      {Array.from({ length: 7 }, (_, d) => (
        <line key={d} x1={30} y1={SY(d)} x2={536} y2={SY(d)} stroke={C.mocha} strokeWidth={1} opacity={0.35} />
      ))}
      {POS_BEFORE.filter((p) => p.key !== 69 && p.parent !== undefined).map((p) => {
        const par = pOf(POS_BEFORE, p.parent!);
        return <Edge key={p.key} x1={SX(par.rank)} y1={SY(par.depth)} x2={SX(p.rank)} y2={SY(p.depth)} o={at(t, 0.3 + 0.15 * p.depth, 0.55 + 0.15 * p.depth)} />;
      })}
      <Edge x1={SX(pOf(POS_BEFORE, 63).rank)} y1={SY(pOf(POS_BEFORE, 63).depth)} x2={SX(p69.rank)} y2={SY(p69.depth)} o={landed} />
      {POS_BEFORE.filter((p) => p.key !== 69).map((p) => (
        <TNode key={p.key} x={SX(p.rank)} y={SY(p.depth)} k={p.key} o={at(t, 0.3 + 0.15 * p.depth, 0.55 + 0.15 * p.depth)} />
      ))}
      <line x1={30} y1={305} x2={lerp(30, 536, at(t, 1.5, 1.9))} y2={305} stroke={C.caramel} strokeWidth={2} strokeDasharray="7 5" />
      <T x={40} y={299} s={13} f={C.caramel} w={600} o={at(t, 1.7, 2.0)}>h(9) = 5</T>
      <T x={142} y={56} s={13} f={C.taupe} o={at(t, 0.6, 0.9)}>size {counts}</T>
      {t >= 2.0 && t < 3.4 && <TNode x={mx} y={my} k={69} fill={C.crema} f={C.espresso} ring={C.crema} />}
      {landed > 0 && (
        <g>
          <TNode x={SX(p69.rank)} y={SY(p69.depth)} k={69} ring={C.cherry} rw={3.5} />
          <T x={SX(p69.rank) + 24} y={SY(p69.depth) + 5} s={13} f={C.cherryText} w={600} o={at(t, 3.6, 3.9)}>69 · depth 6</T>
        </g>
      )}
    </Svg>
  );
}

// 12 · Which ancestor is the scapegoat? Climb from 69, reading one share per ancestor.
const SHARE_AT: Record<number, { dx: number; dy: number; a: 'start' | 'middle' | 'end' }> = {
  63: { dx: 22, dy: 4, a: 'start' },
  80: { dx: 22, dy: 4, a: 'start' },
  54: { dx: -22, dy: 4, a: 'end' },
  87: { dx: 0, dy: 38, a: 'middle' },
  31: { dx: -22, dy: 4, a: 'end' },
  22: { dx: 22, dy: 4, a: 'start' },
};
export function WhichScapegoat({ t, answer, portrait }: StepCtx) {
  const shown = answer !== null;
  const s = useSinceAnswer(shown);
  const q = at(t, 0.1, 0.6);
  const tick = (i: number) => (shown ? at(s, 0.2 + 0.4 * i, 0.4 + 0.4 * i) : 0); // ancestor i has been cleared (or is the scapegoat)
  if (portrait) {
    return (
      <PSvg label="The ancestors of 69 from the nearest up, each with its heavier child's share: 63 1 of 2, 80 2 of 3, 54 3 of 5, 87 5 of 6, 31 6 of 7, 22 7 of 9. The first over 2/3 is 87" h={270}>
        <T x={20} y={22} s={15} f={C.crema}>scapegoat: the first ancestor</T>
        <T x={20} y={42} s={15} f={C.crema}>with a child over 2/3 of it</T>
        {ANC.map((k, i) => {
          const y = 80 + 28 * i;
          const isGoat = k === SCAPEGOAT;
          return (
            <g key={k} opacity={q}>
              <T x={50} y={y} s={17} f={isGoat && tick(i) > 0.5 ? C.cherryText : C.crema} w={600}>{k}</T>
              <T x={110} y={y} s={15} f={C.latte}>{share(k)}</T>
              {i < 3 && tick(i) > 0.3 && <T x={230} y={y} s={15} f={C.caramel} w={700}>ok</T>}
              {isGoat && tick(i) > 0.3 && <T x={230} y={y} s={15} f={C.cherryText} w={700} o={tick(i)}>scapegoat</T>}
            </g>
          );
        })}
        {shown && s > 1.4 && <T x={20} y={262} s={13} f={C.taupe}>80: exactly 2/3 is still allowed</T>}
      </PSvg>
    );
  }
  return (
    <Svg label="The binary search tree with 69 at depth 6 and, beside each ancestor on its path, the heavier child's share of its subtree: 63 1 of 2, 80 2 of 3, 54 3 of 5, 87 5 of 6, 31 6 of 7, 22 7 of 9. The climb passes 63, 80 and 54 and stops at 87, the first ancestor over 2/3" h={400}>
      <T x={40} y={22} s={15} f={C.crema}>scapegoat: first ancestor with a child over 2/3 of it</T>
      {POS_BEFORE.filter((p) => p.parent !== undefined).map((p) => {
        const par = pOf(POS_BEFORE, p.parent!);
        return <Edge key={p.key} x1={SX(par.rank)} y1={SY(par.depth)} x2={SX(p.rank)} y2={SY(p.depth)} o={q} />;
      })}
      {tick(3) > 0 &&
        REBUILT.map((k) => {
          const p = pOf(POS_BEFORE, k);
          return <circle key={k} cx={SX(p.rank)} cy={SY(p.depth)} r={27} fill={C.cherry} opacity={0.16 * tick(3)} />;
        })}
      {POS_BEFORE.map((p) => {
        const i = ANC.indexOf(p.key);
        const goat = p.key === SCAPEGOAT && tick(3) > 0.5;
        const cleared = i >= 0 && i < 3 && tick(i) > 0.5;
        return (
          <g key={p.key} opacity={q}>
            <TNode x={SX(p.rank)} y={SY(p.depth)} k={p.key} ring={goat || p.key === 69 ? C.cherry : cleared ? C.caramel : C.crema} rw={goat || cleared || p.key === 69 ? 3 : 1.5} />
            {i >= 0 && (
              <T x={SX(p.rank) + SHARE_AT[p.key].dx} y={SY(p.depth) + SHARE_AT[p.key].dy} s={13} f={C.latte} a={SHARE_AT[p.key].a}>{share(p.key)}</T>
            )}
          </g>
        );
      })}
      {tick(3) > 0.3 && <T x={536} y={118} s={15} f={C.cherryText} w={700} a="end" o={tick(3)}>scapegoat</T>}
      {tick(1) > 0.5 && <T x={40} y={372} s={13} f={C.taupe}>80: exactly 2/3 is still allowed</T>}
    </Svg>
  );
}

// 13 · Rebuild the subtree, perfectly balanced: flatten in order, build the lower middle as root, recurse.
const RX = (rank: number) => 60 + 50 * rank;
export function Rebuild({ t }: StepCtx) {
  const p1 = easeInOut(seg(t, 0.4, 1.4));
  const p2 = easeOutBack(seg(t, 1.8, 2.8));
  const rowX = (k: number) => 150 + 60 * REBUILT.indexOf(k);
  const ROWY = 316;
  const pos = (k: number) => {
    const b = pOf(POS_BEFORE, k);
    const a = pOf(POS_AFTER, k);
    if (!REBUILT.includes(k)) return { x: RX(b.rank), y: SY(b.depth) };
    const bx = RX(b.rank);
    const by = SY(b.depth);
    const x1 = lerp(bx, rowX(k), p1);
    const y1 = lerp(by, ROWY, p1);
    return { x: lerp(x1, RX(a.rank), p2), y: lerp(y1, SY(a.depth), p2) };
  };
  const edges: { from: number; to: number; o: number }[] = [
    ...POS_BEFORE.filter((p) => p.parent !== undefined && !REBUILT.includes(p.key)).map((p) => ({ from: p.parent!, to: p.key, o: 1 })),
    ...POS_BEFORE.filter((p) => p.parent !== undefined && REBUILT.includes(p.key)).map((p) => ({ from: p.parent!, to: p.key, o: 1 - seg(t, 0.4, 0.9) })),
    ...POS_AFTER.filter((p) => p.parent !== undefined && REBUILT.includes(p.key)).map((p) => ({ from: p.parent!, to: p.key, o: seg(t, 2.5, 2.9) })),
  ];
  const gauge = 5 * (1 - at(t, 1.8, 2.8));
  const goatRing = 1 - seg(t, 2.6, 3.0);
  return (
    <Svg label="The six nodes of the scapegoat's subtree, 51, 54, 63, 69, 80 and 87, flatten into a sorted row and snap back as a perfectly balanced subtree rooted at 63; the tree's height falls from 6 to 4, paid by the potential at 87: 3 times its 5 is 15, against 6 writes and a climb of 6" h={400}>
      {edges.map((e, i) => {
        const a = pos(e.from);
        const b = pos(e.to);
        return <Edge key={i} x1={a.x} y1={a.y} x2={b.x} y2={b.y} o={e.o} />;
      })}
      {REBUILT.map((k) => (
        <circle key={'g' + k} cx={rowX(k)} cy={ROWY} r={17} fill="none" stroke={C.taupe} strokeWidth={1} strokeDasharray="3 3" opacity={0.5 * seg(t, 2.6, 3.0)} />
      ))}
      {POS_BEFORE.map((p) => {
        const c = pos(p.key);
        const goat = p.key === SCAPEGOAT;
        return <TNode key={p.key} x={c.x} y={c.y} k={p.key} ring={goat && goatRing > 0.05 ? C.cherry : C.crema} rw={goat && goatRing > 0.05 ? 3 : 1.5} />;
      })}
      <T x={40} y={ROWY + 5} s={13} f={C.latte} o={seg(t, 0.8, 1.2)}>in order</T>
      <g opacity={at(t, 0.2, 0.5)}>
        <rect x={490} y={68} width={14} height={48} rx={5} fill="none" stroke={C.taupe} strokeWidth={1} />
        <rect x={491} y={116 - 9.6 * gauge} width={12} height={Math.max(0.1, 9.6 * gauge)} rx={4} fill={C.caramel} />
        <T x={480} y={96} s={13} f={C.caramel} a="end">Φ at 87: 3 × 5 = 15 → 0</T>
      </g>
      <T x={40} y={360} s={15} f={C.crema} o={at(t, 3.0, 3.4)}>rebuilt: 6 nodes · height {height(POS_BEFORE)} → {height(POS_AFTER)}</T>
      <T x={40} y={380} s={13} f={C.caramel} o={at(t, 3.2, 3.6)}>paid by c × 5 = 15 ≥ 12 of work (c = 3)</T>
    </Svg>
  );
}

// 14 · Deletes rebuild the whole tree: the root's size against alpha times the largest size.
export function DeleteRebuild({ t }: StepCtx) {
  const TDL = [0.4, 0.9, 1.4, 1.9];
  const size = 9 - TDL.filter((x) => t >= x + 0.1).length;
  const sizeW = (360 * (9 - TDL.reduce((a, x) => a + at(t, x, x + 0.2), 0))) / 9;
  const under = size < 6;
  const flash = seg(t, 2.0, 2.2) * (1 - seg(t, 2.6, 3.0));
  return (
    <Svg label="The tree's root keeps the size and the largest size, 9. Four deletes take the size from 9 to 5, which is below 2/3 of 9, which is 6, so the whole tree is rebuilt; the delete that triggers it costs 1 plus 5 node writes. At a million keys, delete 333,334 rebuilds 666,666 nodes" h={370}>
      <T x={40} y={26} s={13} f={C.latte}>the root keeps size and max size</T>
      <T x={280} y={50} s={13} f={C.caramel} a="middle" w={600} o={at(t, 0.3, 0.6)}>2/3 × 9 = 6</T>
      <T x={40} y={72} s={13} f={C.latte}>max size</T>
      <Bar x={40} y={78} w={360} h={20} full={360} fill={C.taupe} />
      <T x={414} y={94} s={15} f={C.crema} w={600}>9</T>
      <T x={40} y={124} s={13} f={C.latte}>size</T>
      <Bar x={40} y={130} w={sizeW} h={20} full={360} fill={under ? C.cherry : C.crema} />
      <T x={414} y={146} s={15} f={under ? C.cherryText : C.crema} w={600}>{size}</T>
      <line x1={280} y1={56} x2={280} y2={156} stroke={C.caramel} strokeWidth={2} opacity={at(t, 0.3, 0.6)} />
      <rect x={40} y={130} width={360} height={20} rx={7} fill="none" stroke={C.cherry} strokeWidth={3} opacity={flash} />
      <T x={40} y={170} s={13} f={C.latte}>writes per delete</T>
      {[1, 1, 1, 6].map((c, i) => {
        const h = c * 12 * at(t, TDL[i] + 0.1, TDL[i] + 0.35 + (c > 1 ? 0.4 : 0));
        return (
          <g key={i}>
            <rect x={40 + 50 * i} y={272 - h} width={40} height={h} rx={2} fill={c > 1 ? C.cherry : C.crema} />
            {c > 1 && h > 60 && <T x={60 + 50 * i} y={272 - h - 5} s={15} f={C.cherryText} a="middle" w={700}>{c}</T>}
          </g>
        );
      })}
      <line x1={40} y1={272} x2={240} y2={272} stroke={C.mocha} />
      <T x={40} y={294} s={13} f={C.latte} o={at(t, 2.4, 2.8)}>size 5 &lt; 6: rebuild all 5 nodes, max size := 5</T>
      <T x={40} y={322} s={13} f={C.latte} o={at(t, 3.2, 3.6)}>at a million keys:</T>
      <T x={40} y={350} s={15} f={C.cherryText} w={600} o={at(t, 3.2, 3.6)}>delete 333,334 rebuilds 666,666 nodes</T>
    </Svg>
  );
}

// 15 · Partial rebuilds are still amortized: a million inserts in increasing order.
export const SG_SPIKES: [number, number][] = [[15848,13329],[21794,12611],[24566,22047],[30892,11838],[33809,20267],[42280,13538],[44876,21201],[49488,35946],[54451,13950],[59496,8533],[61160,13684],[63866,23365],[66822,8798],[68335,36820],[73435,14305],[75915,62373],[81265,13147],[84037,23716],[90766,12658],[93587,21408],[98183,37862],[103040,14323],[105520,60792],[110926,13005],[113727,23405],[116622,103080],[122671,12492],[125467,21730],[132484,12450],[135265,20663],[139869,36132],[145013,14177],[147487,56635],[153298,12891],[156108,22780],[159070,8657],[160597,95515],[167273,12646],[170094,21437],[173170,8436],[174690,37972],[179561,14364],[182012,168470],[188990,12243],[195769,12901],[198579,21832],[201758,8637],[203285,31803],[208627,13293],[211478,24095],[214505,9051],[215598,54645],[221461,12694],[224282,22346],[227269,8574],[228933,89039],[235635,12267],[238495,20692],[243088,36415],[247943,13959],[250419,152642],[257558,11910],[260493,19615],[265341,34003],[270597,13757],[273304,61046],[278710,13037],[281511,23469],[284611,8968],[285714,272172],[293645,10058],[298462,17001],[303718,13757],[306425,29217],[312220,13100],[315001,23185],[317933,8729],[319446,50743],[325397,12294],[328304,21544],[331393,8475],[332895,38821],[337736,86044],[344640,12282],[347549,20569],[352297,36072],[357441,14162],[359915,65201],[365233,13469],[367957,150286],[375099,11839],[378016,19452],[382857,33686],[388115,13680],[390821,60436],[396228,12962],[399029,23317],[401985,8786],[403498,253870],[410886,11355],[414027,8819],[415540,19976],[420354,32723],[425671,13498],[428395,56631],[436036,11181],[439023,8578],[440685,19369],[445526,31289],[450877,13174],[453649,23768],[456547,56468],[462485,12997],[465286,22856],[468222,8650],[469749,97985],[475944,12320],[478851,21351],[481951,8438],[483471,38219],[488325,14409],[490778,150748],[497920,11853],[500818,19462],[505659,33725],[510917,13690],[513623,60532],[519030,12974],[521831,23341],[524787,8792],[526300,249737],[533618,11221],[536605,8598],[538102,19607],[542950,32259],[548273,13388],[551050,24230],[553936,58854],[559731,13152],[562503,23281],[565503,8821],[566606,102741],[572655,12471],[575436,21673],[578515,8498],[580017,39097],[584865,435237],[592357,10893],[595441,8531],[597105,19041],[601976,14392],[604429,33166],[609696,13559],[612292,54630],[618155,12692],[620976,22342],[623963,8573],[625627,95167],[632303,12624],[635075,21344],[638175,8436],[639695,37860],[644552,14322],[647032,170977],[654689,10329],[659293,17605],[664330,13840],[667037,30692],[672442,13078],[675223,23532],[678141,52482],[684142,12562],[686914,21894],[690093,8653],[691620,39720],[696442,92155],[703190,12508],[705986,21064],[709208,8488],[710710,37307],[715725,14342],[718176,156633],[725306,12025],[728333,9040],[729426,21040],[732648,8482],[734150,35554],[739124,13863],[741835,62818],[747187,13205],[749959,23829],[752894,276839],[760206,11638],[763206,8819],[764719,20477],[769352,33761],[774610,13699],[777316,59027],[783093,13156],[785865,23306],[788821,8783],[790334,106650],[796271,12603],[799043,22041],[802085,8553],[803749,40078],[808561,441315],[815934,10821],[819013,8490],[820515,18850],[825372,14282],[827854,33085],[833161,13579],[835867,54889],[841686,12681],[844507,22363],[847494,8578],[849156,95760],[855832,12661],[858653,21467],[861729,8443],[863419,38203],[868289,14421],[870742,172510],[877646,12295],[880553,20593],[885301,36123],[890445,14175],[892919,65305],[898237,13482],[900961,751333],[908577,10551],[913188,18097],[918234,14095],[920700,31479],[926052,13222],[928832,23872],[931760,54279],[937734,12759],[940529,22339],[943516,8572],[945180,91178],[951890,12409],[954696,20914],[959303,36918],[964325,14252],[966807,159763],[975062,10752],[978128,8442],[979818,18004],[984962,14146],[987436,30615],[992841,13059],[995622,23494],[998722,8974],[999825,52989]];
export function StillAmortized({ t }: StepCtx) {
  const p = seg(t, 0.2, 1.8);
  const X = (i: number) => 40 + (480 * i) / 1_000_000;
  const heads = ['p50', 'p99', 'p99.9', 'max'];
  const vals = ['5', '246', '2,460', '751,333'];
  return (
    <Svg label="A million inserts in increasing order into a scapegoat tree: almost every insert writes a node or a few, a forest of spikes are rebuilds, and insert 900,961 rebuilds 751,332 nodes. The writes per insert are 5 at p50, 246 at p99, 2,460 at p99.9 and 751,333 at most; the average is 28, and searches never restructure" h={380}>
      <T x={40} y={26} s={13} f={C.latte}>1,000,000 inserts in increasing order · alpha = 2/3</T>
      <rect x={40} y={188} width={480 * p} height={2} fill={C.crema} />
      {SG_SPIKES.filter(([i]) => X(i) <= 40 + 480 * p).map(([i, c]) => (
        <rect key={i} x={X(i) - 1} y={190 - (130 * c) / 751_333} width={2} height={(130 * c) / 751_333} fill={C.cherry} />
      ))}
      <T x={40} y={208} s={13} f={C.taupe}>insert 1</T>
      <T x={520} y={208} s={13} f={C.taupe} a="end">1,000,000</T>
      <T x={466} y={72} s={15} f={C.cherryText} a="end" w={600} o={at(t, 2.0, 2.4)}>insert 900,961</T>
      <T x={466} y={90} s={13} f={C.taupe} a="end" o={at(t, 2.0, 2.4)}>rebuilds 751,332 nodes</T>
      <T x={40} y={232} s={13} f={C.latte} o={at(t, 2.6, 2.9)}>writes per insert</T>
      {COLS.map((x, i) => (
        <g key={i} opacity={at(t, 2.6, 2.9)}>
          <T x={x} y={256} s={13} f={C.taupe} a="middle">{heads[i]}</T>
          <T x={x} y={286} s={17} f={i === 0 ? C.crema : C.cherryText} a="middle" w={600}>{vals[i]}</T>
        </g>
      ))}
      <T x={40} y={322} s={15} f={C.crema} o={at(t, 3.2, 3.6)}>average: 28 per insert, O(log n)</T>
      <T x={40} y={352} s={15} f={C.caramel} o={at(t, 3.8, 4.2)}>search: never restructures, depth ≤ 34</T>
    </Svg>
  );
}

// 16 · Back to the problem: the service again, with 2 moves per append. No queue ever forms.
export function Back({ t }: StepCtx) {
  const flash = ((t * 1.25) % 1) < 0.25 ? 1 : 0;
  const dots = Array.from({ length: 5 }, (_, j) => 520 - ((t * 90 + 80 * j) % 400));
  const row = (i: number, st: number) => at(t, st, st + 0.3);
  const heads = ['p50', 'p99', 'p99.9', 'max'];
  const plain = ['1', '494,289', '521,289', '524,289'];
  return (
    <Svg label="The service again, with 2 moves per append: requests flow through the server and no queue forms. The ladder of request latencies, plain doubling against incremental copying: p50 1 against 3, p99 494,289 against 3, p99.9 521,289 against 3, max 524,289 against 3. Requests that waited fall from 349,515 to 0; total writes are 2,048,575 for both; the price is a median of 3 instead of 1" h={360}>
      <rect x={40} y={30} width={90} height={70} rx={8} fill="none" stroke={flash ? C.caramel : C.crema} strokeWidth={flash ? 3 : 1.5} />
      <T x={85} y={70} s={13} f={C.latte} a="middle">vector</T>
      <line x1={150} y1={65} x2={520} y2={65} stroke={C.taupe} strokeWidth={1} opacity={0.6} />
      {dots.map((x, j) => x > 140 && <Dot key={j} x={x} y={65} />)}
      <T x={150} y={112} s={15} f={C.crema} w={600}>queue: 0</T>
      {COLS.map((x, i) => (
        <T key={i} x={x} y={150} s={13} f={C.taupe} a="middle" o={row(0, 0.4)}>{heads[i]}</T>
      ))}
      <T x={40} y={178} s={13} f={C.latte} o={row(0, 0.6)}>plain</T>
      {plain.map((v, i) => (
        <T key={i} x={COLS[i]} y={202} s={17} f={i === 0 ? C.crema : C.cherryText} a="middle" w={600} o={row(0, 0.6)}>{v}</T>
      ))}
      <T x={40} y={234} s={13} f={C.caramel} o={row(0, 1.4)}>incremental</T>
      {COLS.map((x, i) => (
        <T key={i} x={x} y={258} s={17} f={C.caramel} a="middle" w={600} o={row(0, 1.4)}>3</T>
      ))}
      <T x={40} y={300} s={15} f={C.crema} o={row(0, 2.2)}>requests that waited: 349,515 → 0</T>
      <T x={40} y={326} s={13} f={C.latte} o={row(0, 2.8)}>total writes: 2,048,575 for both</T>
      <T x={40} y={350} s={13} f={C.taupe} o={row(0, 3.4)}>the price: median 1 → 3</T>
    </Svg>
  );
}

// 17 · Prove it 1: the migration window at the next scale.
export function Q1({ t, answer, portrait }: StepCtx) {
  const shown = answer !== null;
  const s = useSinceAnswer(shown);
  const q = at(t, 0.1, 0.6);
  const fill = at(s, 0.1, 1.5);
  const rev = at(s, 1.6, 2.0);
  if (portrait) {
    return (
      <PSvg label="A full vector of 1,048,576 keys with 2 moves per append: a new buffer of 2,097,152 slots is filled from the old one; how many appends are both buffers alive, and what does the costliest append write?" h={250}>
        <T x={20} y={24} s={15} f={C.crema}>1,048,576 keys, full</T>
        <T x={20} y={44} s={13} f={C.taupe}>2 moves per append</T>
        <T x={20} y={76} s={13} f={C.latte} o={q}>old: 1,048,576 slots</T>
        <rect x={20} y={82} width={100} height={20} rx={4} fill={C.taupe} opacity={q} />
        <T x={20} y={128} s={13} f={C.latte} o={q}>new: 2,097,152 slots</T>
        <rect x={20} y={134} width={200} height={20} rx={4} fill="none" stroke={C.crema} strokeWidth={1.5} opacity={q} />
        <rect x={20} y={134} width={100 * fill} height={20} rx={4} fill={C.caramel} />
        <T x={20} y={192} s={15} f={C.crema} o={q}>alive for {shown ? <tspan fill={C.caramel} fontWeight={700}>524,288</tspan> : '?'} appends</T>
        <T x={20} y={216} s={15} f={C.crema} o={q}>costliest: {shown ? <tspan fill={C.caramel} fontWeight={700}>3</tspan> : '?'} writes</T>
        {shown && <T x={20} y={240} s={13} f={C.taupe} o={rev}>24 MiB at the peak</T>}
      </PSvg>
    );
  }
  return (
    <Svg label="A full vector of 1,048,576 keys with 2 moves per append: a new buffer of 2,097,152 slots is filled from the old one. How many appends are both buffers alive, and what does the costliest append write? Answer: 524,288 appends and 3 writes" h={330}>
      <T x={40} y={30} s={15} f={C.crema}>1,048,576 keys, full · 2 moves per append</T>
      <T x={40} y={74} s={13} f={C.taupe} o={q}>old · 1,048,576 slots</T>
      <rect x={40} y={82} width={150} height={26} rx={4} fill={C.taupe} opacity={q} />
      <T x={40} y={134} s={13} f={C.latte} o={q}>new · 2,097,152 slots</T>
      <rect x={40} y={142} width={300} height={26} rx={4} fill="none" stroke={C.crema} strokeWidth={1.5} opacity={q} />
      <rect x={40} y={142} width={150 * fill} height={26} rx={4} fill={C.caramel} />
      <T x={40} y={218} s={17} f={C.crema} o={q}>both alive for {shown ? <tspan fill={C.caramel} fontWeight={700} style={{ fontSize: 'calc(20px * var(--svg-text-scale, 1))' }}>524,288</tspan> : '?'} appends</T>
      <T x={40} y={246} s={17} f={C.crema} o={q}>costliest append: {shown ? <tspan fill={C.caramel} fontWeight={700} style={{ fontSize: 'calc(20px * var(--svg-text-scale, 1))' }}>3</tspan> : '?'} writes</T>
      {shown && <T x={40} y={290} s={13} f={C.taupe} o={rev}>3,145,728 slots, 24 MiB, until n = 1,572,864</T>}
    </Svg>
  );
}

// 18 · Prove it 2: a buggy read that always uses the new buffer, right after append 9.
export function Q2({ t, answer, portrait }: StepCtx) {
  const shown = answer !== null;
  const s = useSinceAnswer(shown);
  const q = at(t, 0.1, 0.6);
  const bug = at(s, 0.2, 0.6);
  const fixd = at(s, 1.0, 1.4);
  const P = portrait ? { x0: 20, pitch: 20, w: 17, oy: 94, ny: 142, fs: 15 } : { x0: 40, pitch: 30, w: 26, oy: 56, ny: 112, fs: 13 };
  const fxk = P.x0 + P.pitch * 2 - 2;
  const px = (i: number) => P.x0 + P.pitch * i;
  const rows = (
    <g opacity={q}>
      <T x={P.x0} y={P.oy - 10} s={13} f={C.latte}>old</T>
      {Array.from({ length: 8 }, (_, i) => (
        <Cell key={i} x={px(i)} y={P.oy} w={P.w} h={P.w} label={i + 1} faded={i < 2} />
      ))}
      <T x={P.x0} y={P.ny - 10} s={13} f={C.latte}>new</T>
      {Array.from({ length: 16 }, (_, i) => (
        <Cell key={i} x={px(i)} y={P.ny} w={P.w} h={P.w} label={i + 1} filled={i < 2 || i === 8} />
      ))}
      <line x1={fxk} y1={P.oy - 8} x2={fxk} y2={P.ny + P.w + 8} stroke={C.caramel} strokeWidth={2} strokeDasharray="5 4" />
    </g>
  );
  if (portrait) {
    return (
      <PSvg label="Right after append 9 the old buffer holds keys 1 to 8 with the first 2 moved, and the new buffer has keys 1 and 2 and key 9 at slot 8. A buggy get(5) reading the new buffer finds an empty slot; the right read is the old buffer, key 6" h={280}>
        <T x={20} y={24} s={15} f={C.crema}>buggy get(i): always</T>
        <T x={20} y={52} s={15} f={C.crema}>reads the new buffer</T>
        {rows}
        <T x={fxk} y={192} s={13} f={C.caramel} a="middle" w={600}>k = 2</T>
        <Ring x={px(5)} y={P.ny} w={P.w} h={P.w} o={bug} f={C.cherry} />
        <T x={20} y={218} s={15} f={C.cherryText} w={600} o={bug}>new[5] is empty</T>
        <Ring x={px(5)} y={P.oy} w={P.w} h={P.w} o={fixd} />
        <T x={20} y={246} s={15} f={C.caramel} w={600} o={fixd}>fix: old[5] = key 6</T>
        <T x={20} y={272} s={17} f={C.crema} w={600}>{shown ? '' : 'get(5) = ?'}</T>
      </PSvg>
    );
  }
  return (
    <Svg label="Right after append 9 the old buffer holds keys 1 to 8 with the first 2 moved, and the new buffer has keys 1 and 2 and key 9 at slot 8. A buggy get(5) that always reads the new buffer finds an empty slot; the right read is the old buffer, key 6" h={330}>
      {rows}
      <T x={fxk} y={170} s={13} f={C.caramel} a="middle" w={600}>k = 2</T>
      <Ring x={px(5)} y={P.ny} w={P.w} h={P.w} o={bug} f={C.cherry} />
      <T x={px(5) + 13} y={160} s={15} f={C.cherryText} a="middle" w={600} o={bug}>empty</T>
      <Ring x={px(5)} y={P.oy} w={P.w} h={P.w} o={fixd} />
      <T x={300} y={74} s={15} f={C.caramel} w={600} o={fixd}>old[5] = key 6</T>
      <T x={40} y={214} s={15} f={C.crema}>buggy get(i): always reads the new buffer</T>
      <T x={40} y={244} s={17} f={shown ? C.cherryText : C.crema} w={600}>{shown ? 'get(5) = an empty slot' : 'get(5) = ?'}</T>
      <T x={40} y={282} s={15} f={C.caramel} w={600} o={fixd}>fix: k ≤ i &lt; m → old</T>
    </Svg>
  );
}

// 19 · Prove it 3: a batch job, judged on total time only.
export function Q3({ t, answer, portrait }: StepCtx) {
  const shown = answer !== null;
  const s = useSinceAnswer(shown);
  const q = at(t, 0.1, 0.6);
  const grow = at(s, 0.2, 1.4);
  const rev = at(s, 1.5, 1.9);
  const last = at(s, 2.0, 2.4);
  if (portrait) {
    return (
      <PSvg label="A nightly batch job appends a billion keys and is judged on total time only: the plain and the incremental vector write the same 2,073,741,823 elements" h={280}>
        <T x={20} y={24} s={15} f={C.crema}>nightly batch: a billion</T>
        <T x={20} y={52} s={15} f={C.crema}>appends, total time only</T>
        <T x={20} y={94} s={15} f={C.latte} o={q}>plain</T>
        <Bar x={20} y={102} w={320 * grow} h={20} full={320} fill={C.crema} o={q} />
        <T x={20} y={150} s={15} f={C.caramel} o={q}>incremental</T>
        <Bar x={20} y={158} w={320 * grow} h={20} full={320} fill={C.caramel} o={q} />
        {shown && <T x={20} y={206} s={15} f={C.crema} o={rev}>2,073,741,823 writes each</T>}
        {shown && <T x={20} y={234} s={13} f={C.latte} o={last}>largest append: 536,870,913 vs 3</T>}
        {shown && <T x={20} y={258} s={13} f={C.latte} o={last}>and nothing waits on it</T>}
      </PSvg>
    );
  }
  return (
    <Svg label="A nightly batch job appends a billion keys and is judged on total time only. The plain and the incremental vector write the same 2,073,741,823 elements; the largest append is 536,870,913 writes against 3, and nothing waits on it" h={330}>
      <T x={40} y={30} s={15} f={C.crema}>nightly batch: 1,000,000,000 appends</T>
      <T x={40} y={52} s={13} f={C.taupe}>judged on total time only</T>
      <T x={40} y={100} s={15} f={C.latte} o={q}>plain</T>
      <Bar x={40} y={108} w={440 * grow} h={24} full={440} fill={C.crema} o={q} />
      {shown && <T x={40} y={158} s={15} f={C.crema} o={rev}>2,073,741,823 writes</T>}
      <T x={40} y={198} s={15} f={C.caramel} o={q}>incremental</T>
      <Bar x={40} y={206} w={440 * grow} h={24} full={440} fill={C.caramel} o={q} />
      {shown && <T x={40} y={256} s={15} f={C.crema} o={rev}>2,073,741,823 writes</T>}
      {shown && <T x={40} y={298} s={13} f={C.latte} o={last}>largest append: 536,870,913 vs 3, and nothing waits on it</T>}
    </Svg>
  );
}
