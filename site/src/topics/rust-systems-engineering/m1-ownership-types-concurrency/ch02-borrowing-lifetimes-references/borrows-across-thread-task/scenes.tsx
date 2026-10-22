import type { StepCtx } from '../../../../../reels/types';
import { easeOut, seg } from '../../../../../reels/anim';
import { Code } from '../../../../../reels/Code';
import { C, Draw, Stack, Svg, T } from '../../../../../reels/kit';

// The topic's own idea: a caller's stack frame drawn as a bracket that closes, against a thread's own
// timeline drawn as a line that keeps going past it. thread::scope redraws the same bracket so it only
// closes once the thread's line has already stopped. The Drop-guard steps reuse a small "guard box" that
// either fires (prints "joined") or is forgotten (greyed out, no print). Every snippet is an exact line
// of examples/*.rs or the quoted std/tokio signature; every claim is executed by examples.py.

const fa = (t: number, a: number, d = 0.4) => easeOut(seg(t, a, a + d));

function FrameBracket({ x1, x2, y, t, from, to, label }: { x1: number; x2: number; y: number; t: number; from: number; to: number; label: string }) {
  const k = fa(t, from, 0.4);
  return (
    <g opacity={k}>
      <line x1={x1} y1={y} x2={x2} y2={y} stroke={C.mocha} strokeWidth={2} />
      <line x1={x1} y1={y - 8} x2={x1} y2={y + 8} stroke={C.mocha} strokeWidth={2} />
      <line x1={x2} y1={y - 8} x2={x2} y2={y + 8} stroke={C.mocha} strokeWidth={2} />
      <T x={(x1 + x2) / 2} y={y - 16} s={13} a="middle" f={C.taupe}>{label}</T>
    </g>
  );
}

function ThreadLine({ x1, x2, y, t, from, to, stopAt, color = C.caramel }: { x1: number; x2: number; y: number; t: number; from: number; to: number; stopAt?: number; color?: string }) {
  const end = stopAt ?? x2;
  const k = easeOut(seg(t, from, to));
  if (k <= 0) return null;
  const xk = x1 + (end - x1) * k;
  return (
    <g>
      <line x1={x1} y1={y} x2={xk} y2={y} stroke={color} strokeWidth={3} />
      <circle cx={x1} cy={y} r={4} fill={color} />
      {k >= 0.98 && end === x2 && <circle cx={x2} cy={y} r={4} fill={color} />}
    </g>
  );
}

// ── 1 · A thread can outlive the frame that made it ─────────────────────────────────────────────────────────────
export function ThreadOutlivesFrame({ t }: StepCtx) {
  return (
    <Svg label="the caller's stack frame closes while the spawned thread's own timeline keeps running" h={340}>
      <T x={40} y={36} s={14} f={C.crema}>caller's stack frame</T>
      <FrameBracket x1={40} x2={300} y={90} t={t} from={0.1} to={0.5} label="main() returns here" />
      <T x={40} y={170} s={14} f={C.crema} o={fa(t, 0.9, 0.4)}>the spawned thread</T>
      <g opacity={fa(t, 0.9, 0.4)}>
        <ThreadLine x1={40} x2={520} y={210} t={t} from={1.3} to={3.0} />
      </g>
      <T x={40} y={250} s={13} f={C.cherryText} o={fa(t, 2.0, 0.4)}>still running after the frame above has closed</T>
      <T x={40} y={300} s={14} f={C.caramel} o={fa(t, 2.6, 0.4)}>F: Send + 'static — enforced, not a preference</T>
    </Svg>
  );
}

// ── 2 · Borrow a local, then spawn (predict) ─────────────────────────────────────────────────────────────────────
export function SpawnBorrow({ t }: StepCtx) {
  return (
    <Stack>
      <Code title="the attempt" lines={['let count = 42;', 'thread::spawn(|| {', '    println!("{count}");', '});']} t={t} start={0.1} end={1.8} highlight={[1, 2]} />
    </Stack>
  );
}

// ── 3 · The compiler's own reason ────────────────────────────────────────────────────────────────────────────────
export function SpawnBorrowError({ t }: StepCtx) {
  return (
    <Stack>
      <Code title="examples/spawn_borrow_fail.rs" lines={['thread::spawn(|| {', '    println!("{count}");', '});']} t={t} start={0.1} end={1.1} highlight={[0]} />
      <div style={{ opacity: fa(t, 1.3, 0.4) }}>
        <Code title="rustc" lines={['error[E0373]: closure may outlive the current function', 'count is borrowed here; it is owned by the current function']} t={t} start={1.3} end={2.2} highlight={[0, 1]} />
      </div>
    </Stack>
  );
}

// ── 4 · thread::scope makes the same borrow sound ───────────────────────────────────────────────────────────────
export function ScopeBorrow({ t }: StepCtx) {
  return (
    <Svg label="thread::scope widens the caller's own frame until every scoped thread has joined" h={340}>
      <T x={40} y={36} s={14} f={C.crema}>thread::scope(|s| ...)</T>
      <g opacity={fa(t, 0.2, 0.4)}>
        <ThreadLine x1={160} x2={420} y={110} t={t} from={0.5} to={1.6} stopAt={420} />
        <T x={430} y={115} s={13} f={C.taupe}>s.spawn(...)</T>
      </g>
      <FrameBracket x1={40} x2={500} y={170} t={t} from={2.0} to={2.4} label="scope() does not return until this line" />
      <T x={40} y={230} s={13} f={C.caramel} o={fa(t, 2.6, 0.4)}>the borrow outlives the thread, not the other way around</T>
      <T x={40} y={270} s={13} f={C.taupe} o={fa(t, 3.0, 0.4)}>count is still readable once scope() returns</T>
    </Svg>
  );
}

// ── 5 · Needs to outlive the function? Clone an Arc instead (predict) ──────────────────────────────────────────────
export function ArcMove({ t }: StepCtx) {
  return (
    <Stack>
      <Code
        title="examples/arc_move_ok.rs"
        lines={['fn spawn_incrementer(counter: Arc<Mutex<i32>>) -> JoinHandle<()> {', '    let counter = Arc::clone(&counter);', '    thread::spawn(move || {', '        *counter.lock().unwrap() += 1;', '    })', '}']}
        t={t}
        start={0.1}
        end={2.2}
        highlight={[1, 2]}
      />
    </Stack>
  );
}

// ── 6 · An owned Arc already satisfies 'static ──────────────────────────────────────────────────────────────────
export function ArcSatisfiesStatic({ t }: StepCtx) {
  return (
    <Svg label="a moved, owned Arc has no borrow inside it, so the static bound costs nothing" h={340}>
      <rect x={60} y={40} width={200} height={90} rx={10} fill="none" stroke={C.mocha} strokeWidth={1.5} />
      <T x={160} y={75} s={14} a="middle" f={C.crema}>Arc&lt;Mutex&lt;i32&gt;&gt;</T>
      <T x={160} y={98} s={12} a="middle" f={C.taupe}>owned, not borrowed</T>
      <g opacity={fa(t, 0.4, 0.4)}>
        <Draw pts={[[280, 85], [380, 85]]} t={t} from={0.4} to={0.8} stroke={C.caramel} w={2.5} pen={false} />
        <T x={330} y={70} s={12} a="middle" f={C.caramel}>move</T>
      </g>
      <rect x={380} y={40} width={200} height={90} rx={10} fill="none" stroke={C.caramel} strokeWidth={2} opacity={fa(t, 0.8, 0.4)} />
      <T x={480} y={75} s={14} a="middle" f={C.crema} o={fa(t, 0.8, 0.4)}>spawned thread</T>
      <T x={480} y={98} s={12} a="middle" f={C.taupe} o={fa(t, 0.8, 0.4)}>same Arc, refcount 2</T>
      <T x={60} y={190} s={13} f={C.caramel} o={fa(t, 1.4, 0.4)}>'static asks what is owned, not when it returns</T>
      <T x={60} y={230} s={13} f={C.taupe} o={fa(t, 2.0, 0.4)}>no reference inside, so the bound was already true</T>
    </Svg>
  );
}

// ── 7 · tokio::spawn asks for the identical bound ───────────────────────────────────────────────────────────────
export function TokioSpawn({ t }: StepCtx) {
  return (
    <Stack>
      <Code
        title="tokio::task::spawn's own signature"
        lines={['pub fn spawn<F>(future: F) -> JoinHandle<F::Output>', 'where', "    F: Future + Send + 'static,", "    F::Output: Send + 'static,"]}
        t={t}
        start={0.1}
        end={2.0}
        highlight={[2, 3]}
      />
      <Svg label="the same shape of bound as thread::spawn, but async has no built-in scope" h={80}>
        <T x={40} y={32} s={12} f={C.taupe} o={fa(t, 2.2, 0.4)}>the identical bound — no scope equivalent</T>
      </Svg>
    </Stack>
  );
}

// ── 8 · Could a scoped async spawn ever be sound? (predict) ────────────────────────────────────────────────────
export function AsyncScopeGuard({ t }: StepCtx) {
  return (
    <Svg label="a hypothetical async scope promises the spawned task is done once its guard drops" h={340}>
      <rect x={60} y={60} width={220} height={80} rx={10} fill="none" stroke={C.mocha} strokeWidth={1.5} />
      <T x={170} y={95} s={14} a="middle" f={C.crema}>guard: JoinOnDrop</T>
      <T x={170} y={118} s={12} a="middle" f={C.taupe}>Drop prints "joined"</T>
      <g opacity={fa(t, 0.5, 0.4)}>
        <Draw pts={[[300, 100], [400, 100]]} t={t} from={0.5} to={0.9} stroke={C.taupe} w={2} dash="4 4" pen={false} />
        <T x={350} y={85} s={12} a="middle" f={C.taupe}>promises</T>
      </g>
      <T x={60} y={180} s={14} f={C.crema} o={fa(t, 0.9, 0.4)}>the spawned task has finished</T>
      <T x={60} y={220} s={14} f={C.caramel} o={fa(t, 1.6, 0.4)}>can ordinary safe code break that promise?</T>
    </Svg>
  );
}

// ── 9 · mem::forget is exactly the hole ─────────────────────────────────────────────────────────────────────────
export function ForgetDefeatsGuard({ t }: StepCtx) {
  return (
    <Stack>
      <Code title="examples/forget_defeats_guard.rs" lines={['let guard = JoinOnDrop { label: "scoped-task" };', 'mem::forget(guard);']} t={t} start={0.1} end={1.4} highlight={[1]} />
      <Svg label="the guard's Drop never runs, so the join it was supposed to guarantee never happens" h={70}>
        <T x={40} y={28} s={13} f={C.cherryText} o={fa(t, 1.6, 0.4)}>output: no "joined" line — the guard's Drop never ran</T>
        <T x={40} y={52} s={12} f={C.taupe} o={fa(t, 2.2, 0.4)}>100% safe code, no unsafe block anywhere</T>
      </Svg>
    </Stack>
  );
}

// ── 10 · Recap ──────────────────────────────────────────────────────────────────────────────────────────────────
export function Recap({ t }: StepCtx) {
  const rows = [
    "spawn needs 'static: threads outlive their frame",
    'thread::scope: sound by joining before it returns',
    "an owned Arc satisfies 'static for free",
    'tokio::spawn: same bound, no sound scope',
    'mem::forget defeats any Drop-based join guarantee',
  ];
  return (
    <Svg label="recap: static on spawn, thread::scope's join guarantee, Arc, and why async has no sound scope" h={320}>
      {rows.map((r, i) => (
        <g key={r} opacity={fa(t, 0.2 + i * 0.4, 0.4)}>
          <circle cx={30} cy={40 + i * 50} r={5} fill={C.caramel} />
          <T x={48} y={46 + i * 50} s={15} f={C.crema}>{r}</T>
        </g>
      ))}
    </Svg>
  );
}
