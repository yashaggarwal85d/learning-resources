import type { StepCtx } from '../../../../../reels/types';
import { easeInOut, easeOut, easeOutBack, lerp, seg } from '../../../../../reels/anim';
import { Code } from '../../../../../reels/Code';
import { Bar, C, Decode, Draw, Reticle, Stack, Svg, T } from '../../../../../reels/kit';

// A critical section's only real job is synchronizing a few memory operations. Every timing
// number shown (~160ms inside the lock, ~40ms outside it) and the deadlock/no-deadlock contrast
// are executed for real by examples.py (rustc 1.97.0, edition 2024, x86_64 Linux); the lock
// convoy and priority inversion steps are cited only, not independently executed (see
// coverage.json's gapReview and post-notes.md's Frontier note).
const fa = (t: number, a: number, d = 0.4) => easeOut(seg(t, a, a + d));

const threadDot = (cx: number, cy: number, label: string, opacity = 1) => (
  <g opacity={opacity}>
    <circle cx={cx} cy={cy} r={14} fill="none" stroke={C.taupe} strokeWidth={1.5} />
    <T x={cx} y={cy + 4} s={10} a="middle" f={C.crema}>{label}</T>
  </g>
);

function timeBar(x: number, y: number, frac: number, display: string, label: string, fill: string, t: number, start: number) {
  // The bar grows from zero to its measured width as time passes, instead of appearing already
  // full — the growth itself is the measurement being shown, not just a static comparison.
  const grow = easeOut(seg(t, start, start + 0.6));
  return (
    <g key={label} opacity={fa(t, start, 0.2)}>
      <T x={x} y={y - 20} s={13} f={C.latte}>{label}</T>
      <Bar x={x} y={y} w={380 * frac * grow} h={20} full={380} fill={fill} />
      <T x={x} y={y + 38} s={13} f={C.crema} o={fa(t, start + 0.5, 0.3)}>{display}</T>
    </g>
  );
}

/** A recap as a payoff: each point slides in from the left on its beat (fitted to the step's `end`), its tick draws as it
 * lands, a spine grows down to meet it, and the last point (where the topic leads next) lights up and is locked on. */
function RecapList({ t, rows, label, end, step = 50, s = 15 }: { t: number; rows: string[]; label: string; end: number; step?: number; s?: number }) {
  const y0 = 40;
  const n = rows.length;
  const start = 0.15;
  const beat = Math.min(0.42, Math.max(0.2, (end - start - 1.15) / Math.max(1, n - 1)));
  const h = y0 + (n - 1) * step + 40;
  const lastY = y0 + (n - 1) * step;
  return (
    <Svg label={label} h={Math.max(300, h)}>
      <Draw pts={[[29, y0 - 5], [29, lastY - 5]]} t={t} from={start + 0.1} to={start + 0.1 + (n - 1) * beat} stroke={C.mocha} w={1.5} pen={false} />
      {rows.map((r, i) => {
        const at = start + i * beat;
        const k = easeOut(seg(t, at, at + 0.45));
        const d = easeOut(seg(t, at + 0.2, at + 0.55));
        const y = y0 + i * step;
        const last = i === n - 1;
        if (k <= 0) return null;
        return (
          <g key={r} opacity={k} transform={`translate(${((1 - k) * -44).toFixed(1)} 0)`}>
            <circle cx={29} cy={y - 5} r={11} fill={C.espresso} stroke={last ? C.caramel : C.mocha} strokeWidth={1.5} />
            <path d={`M23 ${y - 5} l4 4 l8 -9`} fill="none" stroke={C.caramel} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" strokeDasharray="20" strokeDashoffset={20 * (1 - d)} />
            <T x={46} y={y} s={s} f={last ? C.caramel : C.crema}>{r}</T>
          </g>
        );
      })}
      <Reticle x={300} y={lastY - 5} w={576} h={36} t={t} at={Math.max(start + (n - 1) * beat + 0.3, end - 0.6)} />
    </Svg>
  );
}

/** A lock: a small box with a shackle, at (x, y), outlined in `f`. */
function LockBox({ x, y, label, f = C.crema }: { x: number; y: number; label: string; f?: string }) {
  return (
    <g>
      <path d={`M${x - 9} ${y - 14} v-6 a9 9 0 0 1 18 0 v6`} fill="none" stroke={f} strokeWidth={2} />
      <rect x={x - 20} y={y - 14} width={40} height={30} rx={5} fill={C.cocoa} stroke={f} strokeWidth={1.5} />
      <T x={x} y={y + 6} s={13} a="middle" f={f} w={700}>{label}</T>
    </g>
  );
}

/** An underline drawn under a phrase of centred quote text; it stretches with the text on phones (--svg-text-scale). */
function Underline({ x1, x2, y, t, from, to, cx = 300 }: { x1: number; x2: number; y: number; t: number; from: number; to: number; cx?: number }) {
  return (
    <g style={{ transform: 'scale(var(--svg-text-scale, 1), 1)', transformOrigin: `${cx}px 0px` }}>
      <Draw pts={[[x1, y], [x2, y]]} t={t} from={from} to={to} stroke={C.caramel} w={2} />
    </g>
  );
}

// ── 1 · A lock's only job is synchronizing memory (hook) ───────────────────────────────────────
export function CriticalSectionHook({ t }: StepCtx) {
  // A read token enters the section and a write token leaves it, tracing the only two memory
  // operations a critical section's own job actually requires.
  const read = easeOut(seg(t, 0.1, 0.35));
  const write = easeOut(seg(t, 0.4, 0.65));
  return (
    <Svg label="a critical section, holding only a memory read and a memory write" h={260}>
      <rect x={200} y={70} width={200} height={70} rx={8} fill="none" stroke={C.caramel} strokeWidth={2} />
      <T x={300} y={100} s={13} a="middle" f={C.crema}>critical section</T>
      <T x={300} y={122} s={11} a="middle" f={C.taupe}>read memory, write memory</T>
      <circle cx={150 + read * 60} cy={105} r={6} fill={C.taupe} opacity={read > 0 && read < 1 ? 1 : 0} />
      <circle cx={400 - write * 60} cy={105} r={6} fill={C.mocha} opacity={write > 0 && write < 1 ? 1 : 0} />
      <T x={60} y={200} s={13} f={C.latte} o={fa(t, 0.6, 0.4)}>that's the whole job, nothing more</T>
      <T x={60} y={226} s={13} f={C.mocha} o={fa(t, 1.1, 0.4)}>what if something else goes in there?</T>
    </Svg>
  );
}

// ── 2 · Four threads, one "network call" each, inside the lock (predict) ───────────────────────
export function FourThreadsPredict({ t }: StepCtx) {
  const positions: [number, number][] = [[90, 190], [220, 190], [380, 190], [510, 190]];
  return (
    <Svg label="four threads, each needing a simulated 40ms external call while holding the one lock" h={260}>
      <rect x={250} y={40} width={100} height={50} rx={8} fill="none" stroke={C.caramel} strokeWidth={2} />
      <T x={300} y={70} s={13} a="middle" f={C.crema}>lock</T>
      {positions.map(([x, y], i) => (
        <g key={i} opacity={fa(t, 0.3 + i * 0.2, 0.4)}>
          <Draw pts={[[x, y], [300, 96]]} t={t} from={0.3 + i * 0.2} to={0.55 + i * 0.2} stroke={C.mocha} w={1.5} pen={false} />
          {threadDot(x, y, `t${i + 1}`)}
        </g>
      ))}
      <T x={60} y={230} s={13} f={C.latte} o={fa(t, 1.3, 0.4)}>each thread holds the lock during its own call</T>
    </Svg>
  );
}

// ── 3 · Measured: about 160 milliseconds (no takeaway: the reel's "from" step) ───────────────────────
export function MeasuredReveal({ t }: StepCtx) {
  return (
    <Stack>
      <Code
        title="examples/io_inside_critical_section.rs"
        lines={['let mut guard = lock.lock().unwrap();', 'fake_network_call(); // the mistake', '*guard += 1;']}
        t={t}
        start={0.1}
        end={1.8}
        highlight={[0, 1]}
      />
      <Svg label="measured: four 40ms calls, serialized by the lock" h={90}>
        {timeBar(30, 50, 1, '160 ms, measured', 'four 40ms calls, one at a time', C.mocha, t, 0.3)}
      </Svg>
    </Stack>
  );
}

// ── 4 · Move the call outside the lock (takeaway) ───────────────────────────────────────────────
export function MoveOutsideLock({ t }: StepCtx) {
  return (
    <Stack>
      <Code
        title="examples/io_outside_critical_section.rs"
        lines={['fake_network_call(); // the fix: first', 'let mut guard = lock.lock().unwrap();', '*guard += 1;']}
        t={t}
        start={0.1}
        end={1.8}
        highlight={[0, 1]}
      />
      <Svg label="the same four calls, now running concurrently" h={220}>
        {timeBar(30, 30, 1, '160 ms, inside the lock', 'before: serialized', C.mocha, t, 0.3)}
        {timeBar(30, 150, 40 / 160, '40 ms, measured', 'after: concurrent', C.caramel, t, 1.1)}
      </Svg>
    </Stack>
  );
}

// ── 5 · Two locks, two threads, opposite acquisition order (predict) ───────────────────────────
export function TwoLocksPredict({ t }: StepCtx) {
  return (
    <Svg label="lock A and lock B; thread 1 takes A then B, thread 2 takes B then A" h={260}>
      <rect x={110} y={40} width={90} height={44} rx={8} fill="none" stroke={C.caramel} strokeWidth={2} />
      <T x={155} y={66} s={13} a="middle" f={C.crema}>lock A</T>
      <rect x={400} y={40} width={90} height={44} rx={8} fill="none" stroke={C.caramel} strokeWidth={2} />
      <T x={445} y={66} s={13} a="middle" f={C.crema}>lock B</T>
      <g opacity={fa(t, 0.3, 0.4)}>
        {threadDot(155, 170, 't1')}
        <Draw pts={[[155, 156], [155, 90]]} t={t} from={0.3} to={0.5} stroke={C.mocha} w={1.5} pen={false} />
        <T x={70} y={210} s={12} f={C.taupe}>t1: A, then B</T>
      </g>
      <g opacity={fa(t, 0.6, 0.4)}>
        {threadDot(445, 170, 't2')}
        <Draw pts={[[445, 156], [445, 90]]} t={t} from={0.6} to={0.8} stroke={C.mocha} w={1.5} pen={false} />
        <T x={400} y={210} s={12} f={C.taupe}>t2: B, then A</T>
      </g>
      <T x={60} y={245} s={13} f={C.latte} o={fa(t, 1.1, 0.4)}>does this program ever finish?</T>
    </Svg>
  );
}

// ── 6 · A real deadlock, proven by timing out (no takeaway) ────────────────────────────────────
export function DeadlockReveal({ t }: StepCtx) {
  const ring = seg(t, 1.3, 2.5); // the timeout running out
  const r = 22;
  const a = ring * Math.PI * 2;
  return (
    <Stack>
      <Code title="examples/lock_ordering_deadlock.rs" lines={['let _ga = a1.lock().unwrap();', '// t1 holds A, waits for B', 'let _gb = b2.lock().unwrap();', '// t2 holds B, waits for A']} t={t} start={0.1} end={0.6} highlight={[0, 2]} />
      <Svg label="t1 holds A and waits for B while t2 holds B and waits for A: a circle; the timeout runs out and the program is still waiting" h={176} fill>
        <LockBox x={200} y={50} label="A" />
        <LockBox x={360} y={50} label="B" />
        {threadDot(120, 140, 't1')}
        {threadDot(440, 140, 't2')}
        <Draw pts={[[130, 128], [190, 70]]} t={t} from={0.5} to={0.8} stroke={C.caramel} w={2.5} pen={false} />
        <Draw pts={[[430, 128], [370, 70]]} t={t} from={0.6} to={0.9} stroke={C.caramel} w={2.5} pen={false} />
        <Draw pts={[[136, 136], [345, 66]]} t={t} from={0.9} to={1.2} stroke={C.cherryText} w={2} dash="5 4" />
        <Draw pts={[[424, 136], [215, 66]]} t={t} from={1.0} to={1.3} stroke={C.cherryText} w={2} dash="5 4" />
        <circle cx={540} cy={60} r={r} fill="none" stroke={C.mocha} strokeWidth={3} opacity={ring > 0 ? 1 : 0} />
        {ring > 0 && <path d={`M540 ${60 - r} A${r} ${r} 0 ${a > Math.PI ? 1 : 0} 1 ${(540 + r * Math.sin(Math.min(a, 6.28))).toFixed(1)} ${(60 - r * Math.cos(Math.min(a, 6.28))).toFixed(1)}`} fill="none" stroke={ring >= 1 ? C.cherryText : C.crema} strokeWidth={3} />}
        <T x={540} y={102} s={13} a="middle" f={C.taupe} o={ring > 0 ? 1 : 0}>3s</T>
        {t >= 2.5 && <Decode text="TimeoutExpired" x={300} y={170} s={14} a="middle" f={C.cherryText} t={t} at={2.5} dur={0.4} />}
      </Svg>
    </Stack>
  );
}

// ── 7 · Same program, one consistent order: it finishes (takeaway) ─────────────────────────────
export function LockOrderingFixed({ t }: StepCtx) {
  const path = (a: number) => {
    const k1 = easeInOut(seg(t, a, a + 0.3));
    const k2 = easeInOut(seg(t, a + 0.4, a + 0.7));
    const k3 = easeInOut(seg(t, a + 0.8, a + 1.0));
    return lerp(lerp(lerp(70, 200, k1), 380, k2), 540, k3);
  };
  const x1 = path(0.5);
  const x2 = path(1.3);
  const done = easeOut(seg(t, 2.3, 2.6));
  return (
    <Stack>
      <Code title="examples/lock_ordering_fixed.rs" lines={['let _ga = a2.lock().unwrap();', '// t2 now takes A first too', 'let _gb = b2.lock().unwrap();']} t={t} start={0.1} end={0.5} highlight={[0, 2]} />
      <Svg label="both threads take A, then B, in the same order: t1 passes through both and leaves, t2 follows, and the program prints done" h={160} fill>
        <Draw pts={[[70, 110], [540, 110]]} t={t} from={0.3} to={0.7} stroke={C.mocha} w={1.5} pen={false} />
        <T x={290} y={140} s={13} a="middle" f={C.latte} o={easeOut(seg(t, 0.4, 0.7))}>always A, then B</T>
        <LockBox x={200} y={50} label="A" f={(x1 > 180 && x1 < 220) || (x2 > 180 && x2 < 220) ? C.caramel : C.crema} />
        <LockBox x={380} y={50} label="B" f={(x1 > 360 && x1 < 400) || (x2 > 360 && x2 < 400) ? C.caramel : C.crema} />
        {threadDot(x2, 96, 't2')}
        {x2 < 500 && <g opacity={1 - seg(x2, 420, 500)}>{threadDot(x1, 96, 't1')}</g>}
        <T x={560} y={56} s={14} a="end" f={C.caramel} o={done}>"done"</T>
      </Svg>
    </Stack>
  );
}

// ── 8 · A lock convoy: everyone still moves, just badly (takeaway, cited only) ─────────────────
export function LockConvoy({ t }: StepCtx) {
  const xs = [110, 200, 400, 490];
  const turns = Array.from({ length: 8 }, (_, i) => 0.9 + i * 0.27);
  const hop = (i: number) => {
    let d = 0;
    turns.forEach((a, j) => {
      if (j % 4 !== i) return;
      const k = seg(t, a, a + 0.27);
      d = Math.max(d, Math.sin(k * Math.PI));
    });
    return d;
  };
  const done = (i: number) => turns.filter((a, j) => j % 4 === i && t >= a + 0.27).length;
  return (
    <Svg label="a lock convoy: equal-priority threads take turns bouncing off one lock; each still makes progress, but every turn costs a switch" h={330}>
      <rect x={140} y={34} width={320} height={64} rx={8} fill="none" stroke={C.taupe} strokeWidth={1.5} />
      <T x={300} y={60} s={12} a="middle" f={C.latte}>"threads of equal priority contend</T>
      <T x={300} y={80} s={12} a="middle" f={C.latte}>repeatedly for the same lock"</T>
      <Underline x1={190} x2={402} y={88} t={t} from={0.4} to={0.8} />
      <T x={60} y={124} s={12} f={C.taupe} o={fa(t, 0.6, 0.4)}>— Wikipedia, "Lock convoy"</T>
      <LockBox x={300} y={180} label="L" />
      {xs.map((x, i) => {
        const h = hop(i);
        return (
          <g key={x}>
            {threadDot(lerp(x, x < 300 ? 262 : 338, h), 180, `t${i + 1}`)}
            <Bar x={x - 30} y={214} w={30 * done(i)} h={8} full={60} fill={C.crema} o={fa(t, 0.8, 0.3)} />
          </g>
        );
      })}
      <T x={60} y={270} s={13} f={C.crema} o={fa(t, 1.1, 0.4)}>unlike a deadlock, they still progress</T>
      <T x={60} y={296} s={13} f={C.latte} o={fa(t, 1.6, 0.4)}>the cost: wasted switches, not a stall</T>
    </Svg>
  );
}

// ── 9 · Priority inversion (takeaway, cited only) ───────────────────────────────────────────────
export function PriorityInversion({ t }: StepCtx) {
  const lend = easeInOut(seg(t, 1.5, 2.1)); // the holder inherits the waiter's priority
  const release = easeInOut(seg(t, 2.3, 2.8)); // and hands the lock over
  const lowH = lerp(14, 56, lend) * (1 - release) + 14 * release;
  return (
    <Svg label="a low-priority thread holds the lock a high-priority thread waits on; the kernel lends it the waiter's priority until it releases, then the waiter takes the lock" h={330}>
      <rect x={120} y={34} width={360} height={70} rx={8} fill="none" stroke={C.taupe} strokeWidth={1.5} />
      <T x={300} y={60} s={12} a="middle" f={C.latte}>"A low priority owner ... inherits the priority</T>
      <T x={300} y={80} s={12} a="middle" f={C.latte}>of a higher priority waiter"</T>
      <Underline x1={319} x2={478} y={68} t={t} from={0.4} to={0.8} />
      <Underline x1={232} x2={398} y={88} t={t} from={0.8} to={1.1} />
      <T x={60} y={130} s={12} f={C.taupe} o={fa(t, 0.6, 0.4)}>— Linux kernel docs, rt-mutex.html</T>
      <LockBox x={300} y={200} label="M" f={release > 0.9 ? C.caramel : C.crema} />
      {threadDot(lerp(260, 140, release), 200, 'low')}
      {threadDot(lerp(470, 340, release), 200, 'high')}
      <rect x={lerp(260, 140, release) - 26} y={240 - lowH + 0} width={8} height={lowH} fill={lend > 0 && release < 1 ? C.caramel : C.taupe} transform="translate(0 0)" />
      <rect x={lerp(470, 340, release) + 18} y={184} width={8} height={56} fill={C.cinnamon} />
      <T x={60} y={280} s={13} f={C.crema} o={fa(t, 1.1, 0.4)}>not something the type system checks</T>
      <T x={60} y={306} s={13} f={C.latte} o={fa(t, 1.6, 0.4)}>the borrow checker stops at memory safety</T>
    </Svg>
  );
}

// ── 10 · Recap ───────────────────────────────────────────────────────────────────────────────────
export function Recap({ t }: StepCtx) {
  const rows = [
    'I/O in a lock serializes that latency too',
    'lock ordering removes the circular wait',
    'a convoy progresses; a deadlock never does',
    'none of this is checked by the type system',
  ];
  return <RecapList t={t} end={3} label="recap: four failure modes, none of them caught by the compiler" rows={rows} step={55} />;
}
