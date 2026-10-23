import type { StepCtx } from '../../../../../reels/types';
import { easeOut, seg } from '../../../../../reels/anim';
import { Code } from '../../../../../reels/Code';
import { Bar, C, Draw, Stack, Svg, T } from '../../../../../reels/kit';

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

function timeBar(x: number, y: number, frac: number, display: string, label: string, fill: string) {
  return (
    <g key={label}>
      <T x={x} y={y - 20} s={13} f={C.latte}>{label}</T>
      <Bar x={x} y={y} w={380 * frac} h={20} full={380} fill={fill} />
      <T x={x} y={y + 38} s={13} f={C.crema}>{display}</T>
    </g>
  );
}

// ── 1 · A lock's only job is synchronizing memory (hook) ───────────────────────────────────────
export function CriticalSectionHook({ t }: StepCtx) {
  return (
    <Svg label="a critical section, holding only a memory read and a memory write" h={260}>
      <rect x={200} y={70} width={200} height={70} rx={8} fill="none" stroke={C.caramel} strokeWidth={2} />
      <T x={300} y={100} s={13} a="middle" f={C.crema}>critical section</T>
      <T x={300} y={122} s={11} a="middle" f={C.taupe}>read memory, write memory</T>
      <T x={60} y={200} s={13} f={C.latte} o={fa(t, 0.6, 0.4)}>that is the whole job — two memory operations, nothing else</T>
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
      <T x={60} y={230} s={13} f={C.latte} o={fa(t, 1.3, 0.4)}>each thread's own 40ms "network call" happens while it holds the lock</T>
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
        {timeBar(30, 50, 1, '160 ms, measured', 'four 40ms calls, one at a time', C.mocha)}
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
      <Svg label="the same four calls, now running concurrently" h={150}>
        {timeBar(30, 30, 1, '160 ms, inside the lock', 'before: serialized', C.mocha)}
        {timeBar(30, 100, 40 / 160, '40 ms, measured', 'after: concurrent', C.caramel)}
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
  return (
    <Stack>
      <Code
        title="examples/lock_ordering_deadlock.rs"
        lines={['let _ga = a1.lock().unwrap();', '// t1 holds A, waits for B', 'let _gb = b2.lock().unwrap();', '// t2 holds B, waits for A']}
        t={t}
        start={0.1}
        end={2.0}
        highlight={[0, 2]}
      />
      <Svg label="run under a 3-second timeout — the real proof it hangs" h={80}>
        <T x={40} y={35} s={13} f={C.mocha} o={fa(t, 2.2, 0.4)}>subprocess.TimeoutExpired after 3s</T>
        <T x={40} y={60} s={13} f={C.taupe} o={fa(t, 2.6, 0.4)}>never finishes — a circular wait, proven, not described</T>
      </Svg>
    </Stack>
  );
}

// ── 7 · Same program, one consistent order: it finishes (takeaway) ─────────────────────────────
export function LockOrderingFixed({ t }: StepCtx) {
  return (
    <Stack>
      <Code
        title="examples/lock_ordering_fixed.rs"
        lines={['let _ga = a2.lock().unwrap();', '// t2 now takes A first too', 'let _gb = b2.lock().unwrap();']}
        t={t}
        start={0.1}
        end={1.8}
        highlight={[0, 2]}
      />
      <Svg label="both threads take A, then B — no circle, no wait" h={80}>
        <T x={40} y={40} s={13} f={C.caramel} o={fa(t, 2.0, 0.4)}>prints "done" — finishes cleanly, every run</T>
      </Svg>
    </Stack>
  );
}

// ── 8 · A lock convoy: everyone still moves, just badly (takeaway, cited only) ─────────────────
export function LockConvoy({ t }: StepCtx) {
  return (
    <Svg label="a lock convoy: equal-priority threads, repeated forced context switches" h={260}>
      <rect x={160} y={40} width={280} height={60} rx={8} fill="none" stroke={C.taupe} strokeWidth={1.5} />
      <T x={300} y={64} s={12} a="middle" f={C.latte}>"threads of equal priority contend</T>
      <T x={300} y={82} s={12} a="middle" f={C.latte}>repeatedly for the same lock"</T>
      <T x={60} y={140} s={12} f={C.taupe} o={fa(t, 0.6, 0.4)}>— Wikipedia, "Lock convoy"</T>
      <T x={60} y={190} s={13} f={C.crema} o={fa(t, 1.1, 0.4)}>unlike a deadlock, these threads still make progress</T>
      <T x={60} y={216} s={13} f={C.mocha} o={fa(t, 1.6, 0.4)}>the cost is wasted context switches, not a permanent stall</T>
    </Svg>
  );
}

// ── 9 · Priority inversion (takeaway, cited only) ───────────────────────────────────────────────
export function PriorityInversion({ t }: StepCtx) {
  return (
    <Svg label="a low-priority holder blocks a higher-priority waiter; priority inheritance is the fix" h={260}>
      <rect x={140} y={40} width={320} height={70} rx={8} fill="none" stroke={C.taupe} strokeWidth={1.5} />
      <T x={300} y={64} s={12} a="middle" f={C.latte}>"A low priority owner ... inherits the priority</T>
      <T x={300} y={84} s={12} a="middle" f={C.latte}>of a higher priority waiter"</T>
      <T x={60} y={150} s={12} f={C.taupe} o={fa(t, 0.6, 0.4)}>— Linux kernel docs, rt-mutex.html</T>
      <T x={60} y={200} s={13} f={C.crema} o={fa(t, 1.1, 0.4)}>none of this is something the type system checks</T>
      <T x={60} y={226} s={13} f={C.mocha} o={fa(t, 1.6, 0.4)}>the borrow checker's guarantees stop at memory safety</T>
    </Svg>
  );
}

// ── 10 · Recap ───────────────────────────────────────────────────────────────────────────────────
export function Recap({ t }: StepCtx) {
  const rows = [
    'I/O inside a lock serializes that call too (measured: ~4x slower)',
    'lock ordering removes the circular wait a deadlock needs',
    'a convoy still progresses; a deadlock never does',
    'priority inversion needs priority inheritance — none of this is checked by the type system',
  ];
  return (
    <Svg label="recap: four failure modes, none of them caught by the compiler" h={300}>
      {rows.map((r, i) => (
        <g key={r} opacity={fa(t, 0.2 + i * 0.4, 0.4)}>
          <circle cx={30} cy={40 + i * 55} r={5} fill={C.caramel} />
          <T x={48} y={46 + i * 55} s={13} f={C.crema}>{r}</T>
        </g>
      ))}
    </Svg>
  );
}
