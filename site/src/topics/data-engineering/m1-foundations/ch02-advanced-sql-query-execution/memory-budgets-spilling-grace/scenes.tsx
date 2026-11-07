import { useEffect, useState } from 'react';
import { Bar, C, Plot, Svg, T } from '../../../../../reels/kit';
import type { StepCtx } from '../../../../../reels/types';
import { clamp, easeInOut, easeOut, easeOutBack, lerp, seg } from '../../../../../reels/anim';

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

/** A number counted up to its final value, with fixed decimals and thousands separators. */
function num(v: number, d = 0) {
  return v.toLocaleString('en-US', { minimumFractionDigits: d, maximumFractionDigits: d });
}

/** A label-left / value-right row, stacked vertically with generous gaps (DESIGN.md, phone text scaling).
 * `k` fades it in and slides it up a little; the value is whatever string the scene passes (a count in progress). */
function Row({ y, label, value, valueColor = C.crema, big = false, k = 1 }: { y: number; label: string; value: string; valueColor?: string; big?: boolean; k?: number }) {
  return (
    <g opacity={k} transform={`translate(0 ${((1 - k) * 10).toFixed(2)})`}>
      <T x={25} y={y} s={15} f={C.latte}>
        {label}
      </T>
      <T x={575} y={y} s={big ? 22 : 17} f={valueColor} a="end" w={600}>
        {value}
      </T>
    </g>
  );
}

/** A verdict tick at the right edge, drawn in by `k`. */
function Tick({ y, k, f = C.focus }: { y: number; k: number; f?: string }) {
  return <path d={`M540 ${y} l8 8 l16 -18`} fill="none" stroke={f} strokeWidth={3} strokeDasharray="40" strokeDashoffset={40 * (1 - k)} />;
}

/** A time bar that grows to its share over `k`; its figure fades in once the bar is most of the way there. */
function timeBar(x: number, y: number, frac: number, display: string, label: string, fill: string, k: number) {
  return (
    <g key={label} opacity={k > 0 ? 1 : 0}>
      <T x={x} y={y - 20} s={13} f={C.latte} o={clamp(k * 3, 0, 1)}>
        {label}
      </T>
      <Bar x={x} y={y} w={340 * frac * k} h={20} full={340} fill={fill} />
      <T x={x} y={y + 38} s={13} f={C.crema} o={seg(k, 0.6, 1)}>
        {display}
      </T>
    </g>
  );
}

/** Two timed rows that count up, each with a bar under it scaled to the slower one. */
function TwoTimes({ t, rows, max }: { t: number; rows: [string, number, number, string][]; max: number }) {
  return (
    <g>
      {rows.map(([label, ms, d, color], i) => {
        const k = easeOut(seg(t, 0.2 + i * 1.1, 0.8 + i * 1.1));
        const c = easeOut(seg(t, 0.3 + i * 1.1, 1.3 + i * 1.1));
        const y = 60 + i * 60;
        return (
          <g key={label}>
            <Row y={y} label={label} value={`${num(ms * c, d)} ms`} valueColor={color} big k={k} />
            <rect x={25} y={y + 14} width={k > 0 ? Math.max(3, 550 * (ms / max) * c) : 0} height={6} rx={3} fill={color} opacity={0.8} />
          </g>
        );
      })}
    </g>
  );
}

/** A predict step's verdict, sliding up into place once the learner has answered. */
function Verdict({ answer, text, y = 184, f = C.focus }: { answer: number | null; text: string; y?: number; f?: string }) {
  const s = useSinceAnswer(answer !== null);
  const v = answer !== null ? easeOut(seg(s, 0.1, 0.6)) : 0;
  if (answer === null) return null;
  return (
    <T x={300} y={lerp(y + 8, y, v)} s={15} f={f} a="middle" o={v}>
      {text}
    </T>
  );
}

// 1 · Two spills. Both times count up with a bar each; the same spill, two costs.
export function TwoSpills({ t }: StepCtx) {
  const q = easeOut(seg(t, 3.0, 3.6));
  return (
    <Svg label="the same ~35 megabyte spill, two very different outcomes" h={220}>
      <TwoTimes
        t={t}
        max={1089}
        rows={[
          ['work_mem = 4 MB, spills 35 MB', 785, 0, C.focus],
          ['work_mem = 64 kB, spills 35 MB', 1089, 0, C.cherryText],
        ]}
      />
      <T x={300} y={190} s={15} f={C.latte} a="middle" o={q}>
        same query, same disk written — not the same cost
      </T>
    </Svg>
  );
}

// 2 · Predict: does spilling slow it down? The row count counts up; after the answer the verdict slides in.
export function PredictSpillSlower({ t, answer }: StepCtx) {
  return (
    <Svg label="2,000,000 rows, ORDER BY sort_key, no LIMIT" h={210}>
      <Row y={70} label="rows to sort" value={num(2000000 * easeOut(seg(t, 0.2, 1.1)))} k={easeOut(seg(t, 0.1, 0.6))} />
      <Row y={130} label="work_mem" value="4 MB (the default)" k={easeOut(seg(t, 0.5, 1.0))} />
      <Verdict answer={answer} text="only once the budget is starved" />
    </Svg>
  );
}

// 3 · Reveal: not necessarily. The in-memory bar and the spilling bar grow; the spilling one stops shorter.
export function RevealNotNecessarily({ t }: StepCtx) {
  const k = (i: number) => easeOut(seg(t, 0.2 + i * 1.0, 1.1 + i * 1.0));
  return (
    <Svg label="quicksort in memory vs external merge, nearly the same time" h={370}>
      {timeBar(30, 110, 849 / 849, '849 ms, quicksort, 111,653 kB memory', 'work_mem = 256 MB', C.latte, k(0))}
      {timeBar(30, 230, 785 / 849, '785 ms, external merge, 35,248 kB disk', 'work_mem = 4 MB (default)', C.focus, k(1))}
      <T x={300} y={330} s={15} f={C.latte} a="middle" o={easeOut(seg(t, 2.8, 3.4))}>
        spilling 35 MB measured faster here, not slower
      </T>
    </Svg>
  );
}

// 4 · How work_mem budgets. One session's query holds three operations, each filling its own budget bar;
// a second session slides in beside it with three more.
export function HowWorkMemBudgets({ t }: StepCtx) {
  const head = easeOut(seg(t, 0, 0.4));
  const own = easeOut(seg(t, 1.0, 1.5));
  const two = easeInOut(seg(t, 2.2, 2.8));
  const many = easeOut(seg(t, 2.6, 3.2));
  const ops = ['sort', 'hash', 'sort'];
  const session = (x: number, label: string, o: number, fillAt: number) => (
    <g opacity={o}>
      <rect x={x} y={50} width={265} height={100} rx={6} fill="none" stroke={C.mocha} />
      <T x={x + 12} y={70} s={12} f={C.taupe}>
        {label}
      </T>
      {ops.map((op, i) => {
        const f = easeOut(seg(t, fillAt + i * 0.2, fillAt + 0.6 + i * 0.2));
        return (
          <g key={i}>
            <rect x={x + 12 + i * 84} y={82} width={74} height={26} rx={4} fill={C.cocoa} stroke={C.mocha} />
            <T x={x + 49 + i * 84} y={100} s={13} f={C.latte} a="middle">
              {op}
            </T>
            <rect x={x + 12 + i * 84} y={118} width={74} height={8} rx={2} fill="none" stroke={C.mocha} />
            <rect x={x + 12 + i * 84} y={118} width={74 * f} height={8} rx={2} fill={C.focus} />
          </g>
        );
      })}
    </g>
  );
  return (
    <Svg label="work_mem budgets one operation, not one query or one session" h={270}>
      <T x={300} y={28} s={16} f={C.crema} a="middle" o={head}>
        every sort or hash in a query —
      </T>
      {session(25, 'session 1', head, 0.6)}
      <g transform={`translate(0 ${((1 - two) * 12).toFixed(2)})`}>{session(310, 'session 2', two, 2.4)}</g>
      <T x={300} y={185} s={15} f={C.latte} a="middle" o={own}>
        gets its own work_mem budget
      </T>
      <T x={300} y={228} s={15} f={C.focus} a="middle" o={many}>
        several operations, or several sessions,
      </T>
      <T x={300} y={251} s={15} f={C.focus} a="middle" o={many}>
        can each spend it at once
      </T>
    </Svg>
  );
}

// 5 · Reveal: what gets slow. Three bars grow in turn, each longer as the budget starves.
export function RevealWhatGetsSlow({ t }: StepCtx) {
  const k = (i: number) => easeOut(seg(t, 0.2 + i * 0.9, 1.0 + i * 0.9));
  return (
    <Svg label="785ms at the default vs over 1000ms once work_mem is starved" h={410}>
      {timeBar(30, 100, 785 / 1089, '785 ms, 35,248 kB spilled', 'work_mem = 4 MB (default)', C.focus, k(0))}
      {timeBar(30, 210, 1066 / 1089, '1066 ms, 35,288 kB spilled', 'work_mem = 128 kB', C.cherryText, k(1))}
      {timeBar(30, 320, 1089 / 1089, '1089 ms, 35,296 kB spilled', 'work_mem = 64 kB', C.cherryText, k(2))}
      <T x={300} y={390} s={14} f={C.latte} a="middle" o={easeOut(seg(t, 3.0, 3.6))}>
        almost the same disk — the merge passes cost time
      </T>
    </Svg>
  );
}

// 6 · More room for hash. Each row's batches pop in as squares: eight at ×1.0, two at ×4.0.
export function HowHashGetsMoreRoom({ t }: StepCtx) {
  const sq = (n: number, y: number, start: number, f: string) =>
    Array.from({ length: n }, (_, i) => {
      const k = easeOutBack(seg(t, start + i * 0.1, start + 0.35 + i * 0.1));
      return <rect key={i} x={25 + i * 22} y={y} width={16 * Math.max(0, k)} height={16} rx={3} fill={f} opacity={clamp(k, 0, 1)} />;
    });
  return (
    <Svg label="hash_mem_multiplier gives hash tables more room than sort gets" h={240}>
      <Row y={50} label="work_mem 4 MB, multiplier ×1.0" value="8 batches" valueColor={C.cherryText} k={easeOut(seg(t, 0.2, 0.7))} />
      {sq(8, 64, 0.6, C.cherryText)}
      <Row y={125} label="work_mem 4 MB, multiplier ×4.0" value="2 batches" valueColor={C.focus} k={easeOut(seg(t, 1.6, 2.1))} />
      {sq(2, 139, 2.0, C.focus)}
      <T x={300} y={205} s={15} f={C.latte} a="middle" o={easeOut(seg(t, 2.8, 3.4))}>
        same work_mem — hash gets 4× the room, not 1×
      </T>
    </Svg>
  );
}

// 7 · Predict: the budget shrinks under a hash join. The budget bar shrinks; after the answer the verdict slides in.
export function PredictHashShrink({ t, answer }: StepCtx) {
  const sh = easeInOut(seg(t, 0.8, 1.6));
  return (
    <Svg label="a 500,000-row build side, work_mem shrinking" h={210}>
      <Row y={60} label="build side" value="500,000 rows" k={easeOut(seg(t, 0.1, 0.6))} />
      <Row y={115} label="work_mem" value="256 MB → 64 kB" k={easeOut(seg(t, 0.4, 0.9))} />
      <rect x={25} y={130} width={lerp(550, 6, sh)} height={8} rx={3} fill={sh > 0 ? C.cherryText : C.focus} opacity={easeOut(seg(t, 0.4, 0.9))} />
      <Verdict answer={answer} text="still runs, split into more partitions" />
    </Svg>
  );
}

// 8 · Reveal: batches double. Each budget row slides in with a bar that grows one step per doubling.
export function RevealBatchesDouble({ t }: StepCtx) {
  const rows: Array<[string, string, string, string, number]> = [
    ['256 MB', '1 batch', '524,288 buckets', C.latte, 0],
    ['4 MB', '4 batches', '262,144 buckets', C.crema, 2],
    ['1 MB', '16 batches', '65,536 buckets', C.crema, 4],
    ['256 kB', '64 batches', '16,384 buckets', C.focus, 6],
    ['64 kB', '256 batches', '4,096 buckets', C.cherryText, 8],
  ];
  return (
    <Svg label="batches climb from 1 to 256 as work_mem shrinks from 256MB to 64kB" h={330}>
      {rows.map(([wm, batches, buckets, color, l], i) => {
        const k = easeOut(seg(t, 0.2 + i * 0.5, 0.7 + i * 0.5));
        const b = easeOut(seg(t, 0.4 + i * 0.5, 1.0 + i * 0.5));
        return (
          <g key={wm} opacity={k} transform={`translate(0 ${((1 - k) * 10).toFixed(2)})`}>
            <T x={25} y={55 + i * 50} s={14} f={C.latte}>
              work_mem = {wm}
            </T>
            <rect x={210} y={45 + i * 50} width={(10 + l * 26) * b} height={10} rx={2} fill={color} opacity={0.8} />
            <T x={575} y={55 + i * 50} s={18} f={color} a="end" w={600}>
              {batches}
            </T>
            <T x={575} y={55 + i * 50 + 18} s={11} f={C.taupe} a="end" w={600}>
              {buckets}
            </T>
          </g>
        );
      })}
      <T x={300} y={315} s={14} f={C.latte} a="middle" o={easeOut(seg(t, 3.2, 3.8))}>
        half the budget, double the batches
      </T>
    </Svg>
  );
}

const SPILL: [number, number][] = [
  [0, 0],
  [2, 0],
  [1, 0],
  [0, 1],
  [3, 0],
  [1, 1],
  [2, 1],
  [0, 2],
  [3, 1],
];
// 9 · How batches spill. Rows stream in; the ones in the current slice drop into memory, the rest into
// numbered files; then each file is joined on its own, one at a time.
export function HowBatchesSpill({ t }: StepCtx) {
  const head = easeOut(seg(t, 0, 0.4));
  const box = easeOut(seg(t, 0.2, 0.6));
  const sub = easeOut(seg(t, 1.0, 1.5));
  const last = easeOut(seg(t, 2.4, 3.0));
  const fx = (f: number) => 100 + (f - 1) * 140;
  const turn = (f: number) => {
    const a = 2.6 + (f - 1) * 0.4;
    return t >= a && t < a + 0.4;
  };
  return (
    <Svg label="a row that doesn't fit the current batch goes to a numbered partition file" h={290}>
      <T x={300} y={28} s={16} f={C.crema} a="middle" o={head}>
        a row that misses the in-memory slice —
      </T>
      <g opacity={box}>
        <rect x={360} y={44} width={200} height={40} rx={6} fill={C.cocoa} stroke={C.focus} />
        <T x={460} y={69} s={13} f={C.focus} a="middle">
          in memory
        </T>
        {[1, 2, 3].map((f) => (
          <g key={f}>
            <rect x={fx(f)} y={124} width={110} height={34} rx={4} fill={C.cocoa} stroke={turn(f) ? C.focus : C.mocha} strokeWidth={turn(f) ? 2 : 1} />
            <T x={fx(f) + 55} y={146} s={13} f={C.latte} a="middle">
              file {f}
            </T>
          </g>
        ))}
      </g>
      {SPILL.map(([f, slot], i) => {
        const k = easeInOut(seg(t, 0.4 + i * 0.18, 0.8 + i * 0.18));
        const tx = f === 0 ? 372 + slot * 16 : fx(f) + 8 + slot * 14;
        const ty = f === 0 ? 50 : 128;
        return <circle key={i} cx={lerp(30, tx, k)} cy={lerp(64, ty, k) + (k >= 1 ? 0 : -18 * Math.sin(Math.PI * k))} r={5} fill={f === 0 ? C.focus : C.crema} opacity={head} />;
      })}
      <T x={300} y={195} s={15} f={C.latte} a="middle" o={sub}>
        goes to a numbered partition file instead
      </T>
      <T x={300} y={240} s={15} f={C.focus} a="middle" o={last}>
        each partition is joined on its own,
      </T>
      <T x={300} y={263} s={15} f={C.focus} a="middle" o={last}>
        one batch at a time
      </T>
    </Svg>
  );
}

// 10 · Predict: two sessions at once. Both facts slide in; after the answer the verdict slides in.
export function PredictConcurrency({ t, answer }: StepCtx) {
  return (
    <Svg label="two sessions, same work_mem, running at the same time" h={210}>
      <Row y={70} label="sessions running at once" value="2" k={easeOut(seg(t, 0.1, 0.6))} />
      <Row y={130} label="work_mem, each session" value="4 MB" k={easeOut(seg(t, 0.5, 1.0))} />
      <Verdict answer={answer} text="each gets its own: the total multiplies" />
    </Svg>
  );
}

// 11 · Reveal: concurrency multiplies. One session's bar, then two overlapping sessions' bar at double.
export function RevealConcurrencyMultiplies({ t }: StepCtx) {
  const k = (i: number) => easeOut(seg(t, 0.2 + i * 1.1, 1.1 + i * 1.1));
  return (
    <Svg label="one spiller's 35MB vs two spillers' combined 69MB" h={370}>
      {timeBar(30, 110, 35 / 69, '35,248 kB, one session alone', 'one session', C.latte, k(0))}
      {timeBar(30, 230, 69 / 69, '69 MB combined, measured live', 'two sessions, overlapping', C.cherryText, k(1))}
      <T x={300} y={330} s={15} f={C.latte} a="middle" o={easeOut(seg(t, 3.0, 3.6))}>
        each session still only ever sees its own 4 MB
      </T>
    </Svg>
  );
}

// 12 · Skew. One hot key's rows hop from batch to batch, rewritten into every one; then they lift out into a
// dedicated in-memory bucket and the copies clear.
export function WhySkewNeedsProtection({ t }: StepCtx) {
  const head = easeOut(seg(t, 0, 0.4));
  const bat = easeOut(seg(t, 0.4, 0.9));
  const hop = seg(t, 1.0, 2.2) * 3;
  const sub = easeOut(seg(t, 1.0, 1.5));
  const lift = easeInOut(seg(t, 2.4, 3.0));
  const last = easeOut(seg(t, 2.8, 3.4));
  const bx = (i: number) => 25 + i * 140;
  const at = Math.min(3, hop);
  const i0 = Math.floor(at);
  const cx = t < 1.0 ? bx(0) + 45 : lerp(bx(Math.min(i0, 3)) + 45, bx(Math.min(i0 + 1, 3)) + 45, easeInOut(at - i0));
  const hopY = t < 2.2 && t >= 1.0 ? -16 * Math.sin(Math.PI * (at - i0)) : 0;
  const x = lerp(cx, 250, lift);
  const y = lerp(95 + hopY, 196, lift);
  return (
    <Svg label="one key carries 1% of all rows — it needs its own protection" h={290}>
      <T x={300} y={28} s={16} f={C.crema} a="middle" o={head}>
        one key, 20,000 of 2,000,000 rows —
      </T>
      {[0, 1, 2, 3].map((i) => (
        <g key={i} opacity={bat}>
          <rect x={bx(i)} y={88} width={120} height={34} rx={4} fill={C.cocoa} stroke={C.mocha} />
          {t >= 1.0 && i < Math.ceil(at) && i0 >= i && lift < 1 && <rect x={bx(i) + 45} y={95} width={30} height={20} rx={3} fill={C.cherryText} opacity={0.35 * (1 - lift)} />}
        </g>
      ))}
      <rect x={x} y={y} width={30} height={20} rx={3} fill={C.cherryText} opacity={bat} />
      <T x={300} y={160} s={15} f={C.latte} a="middle" o={sub * (1 - lift * 0.4)}>
        would get re-spilled into every batch
      </T>
      <g opacity={lift}>
        <rect x={235} y={188} width={130} height={36} rx={6} fill="none" stroke={C.focus} strokeWidth={2} />
      </g>
      <T x={300} y={248} s={15} f={C.focus} a="middle" o={last}>
        a dedicated in-memory bucket keeps it —
      </T>
      <T x={300} y={271} s={13} f={C.taupe} a="middle" o={last}>
        not independently visible in EXPLAIN on this version
      </T>
    </Svg>
  );
}

// 13 · Recap. The five lines rise in one per beat; the last one is the one to remember.
export function Recap({ t }: StepCtx) {
  const lines = [
    'work_mem budgets one operation, not one query',
    'hash gets work_mem × hash_mem_multiplier',
    'spilling itself measured fine here, not slower',
    'a hash join partitions into batches instead of failing',
    'every concurrent spiller pays its own budget again',
  ];
  return (
    <Svg label="recap: budgets, spilling, batching, concurrency" h={260}>
      {lines.map((l, i) => {
        const k = easeOut(seg(t, 0.2 + i * 0.6, 0.7 + i * 0.6));
        return (
          <T key={l} x={300} y={55 + i * 40 + (1 - k) * 8} s={14} f={i === lines.length - 1 ? C.focus : C.crema} a="middle" o={k}>
            {l}
          </T>
        );
      })}
    </Svg>
  );
}

// 14 · Prove: batches. The plan lines arrive; after the answer "Batches: 64" is underlined and the question gets its answer.
export function ProveBatches({ t, answer }: StepCtx) {
  const answered = answer !== null;
  const s = useSinceAnswer(answered);
  const tick = answered ? easeOut(seg(s, 0.6, 1.0)) : 0;
  return (
    <Svg label="EXPLAIN snippet: Buckets: 16384  Batches: 64  Memory Usage: 256kB" h={220}>
      <T x={300} y={70} s={15} f={C.crema} a="middle" o={easeOut(seg(t, 0.1, 0.6))}>
        Buckets: 16384 Batches: 64
      </T>
      <T x={300} y={100} s={15} f={C.crema} a="middle" o={easeOut(seg(t, 0.4, 0.9))}>
        Memory Usage: 256kB
      </T>
      <Row y={160} label="is this hash join spilling?" value={answered ? 'yes' : '?'} valueColor={answered ? C.cherryText : C.crema} k={easeOut(seg(t, 0.8, 1.3))} />
      {answered && <rect x={575 - 40 * tick} y={172} width={40 * tick} height={3} fill={C.cherryText} />}
    </Svg>
  );
}

// 15 · Prove: concurrency. Six sessions' budgets stack up after the answer, and the total lands with rule and tick.
export function ProveConcurrency({ t, answer }: StepCtx) {
  const answered = answer !== null;
  const s = useSinceAnswer(answered);
  const k = answered ? easeOut(seg(s, 0.7, 1.1)) : 0;
  const tick = answered ? easeOut(seg(s, 1.1, 1.5)) : 0;
  return (
    <Svg label="6 concurrent sessions, each work_mem = 8MB — worst case?" h={240}>
      <Row y={60} label="concurrent sessions" value="6" k={easeOut(seg(t, 0.1, 0.6))} />
      <Row y={110} label="work_mem, each" value="8 MB" k={easeOut(seg(t, 0.5, 1.0))} />
      {answered &&
        Array.from({ length: 6 }, (_, i) => {
          const b = easeOutBack(seg(s, 0.05 + i * 0.08, 0.35 + i * 0.08));
          return <rect key={i} x={25 + i * 62} y={135} width={56 * Math.max(0, b)} height={14} rx={3} fill={C.cherryText} opacity={clamp(b, 0, 1)} />;
        })}
      {answered && (
        <>
          <T x={300} y={lerp(204, 194, k)} s={16} f={C.focus} a="middle" o={k}>
            6 × 8 MB = 48 MB
          </T>
          <rect x={220} y={206} width={160 * tick} height={3} fill={C.focus} />
          <Tick y={182} k={tick} />
        </>
      )}
    </Svg>
  );
}
