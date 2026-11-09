import type { StepCtx } from '../../../../../reels/types';
import { easeOut, lerp, seg } from '../../../../../reels/anim';
import { Code } from '../../../../../reels/Code';
import { Stack, Svg, T, C, Bar, Reticle } from '../../../../../reels/kit';

// A task is multiplexed onto a small, fixed worker pool, never mapped 1:1 onto a real thread;
// a worker fully occupied by a non-yielding call stalls everything else scheduled there,
// measured directly. tokio is this chapter's first real, chapter-wide crate dependency.
const fa = (t: number, a: number, d = 0.4) => easeOut(seg(t, a, a + d));

// ── 1 · A hundred tasks, two real threads? (predict, hook) ─────────────────────────────────────
export function MultiplexPredict({ t }: StepCtx) {
  return (
    <Stack>
      <Code
        title="a hundred tasks, two worker threads"
        lines={['let rt = Builder::new_multi_thread()', '    .worker_threads(2).build()?;', 'for _ in 0..100 { rt.spawn(work()); }']}
        t={t}
        start={0.1}
        end={2.4}
        highlight={[2]}
      />
    </Stack>
  );
}

// ── 2 · A task is a state machine, not a thread (no takeaway, "from" step) ─────────────────────
export function MultiplexReveal({ t }: StepCtx) {
  const n = 10;
  return (
    <Svg label="a hundred tasks, two real worker threads" h={220}>
      {[0, 1].map((w) => (
        <g key={w}>
          <rect x={60 + w * 240} y={40} width={200} height={60} rx={6} fill="none" stroke={C.taupe} strokeWidth={1.5} />
          <T x={160 + w * 240} y={75} s={13} a="middle" f={C.crema}>worker thread</T>
        </g>
      ))}
      {Array.from({ length: n }).map((_, i) => {
        const start = 0.15 + i * 0.08;
        const k = easeOut(seg(t, start, start + 0.5));
        if (k <= 0) return null;
        const tx = i % 2 === 0 ? 160 : 400;
        const x = lerp(300, tx, k);
        const y = lerp(170, 70, k);
        return <circle key={i} cx={x} cy={y} r={3} fill={C.caramel} />;
      })}
      <T x={60} y={200} s={13} f={C.latte} o={fa(t, 1.3, 0.4)}>a hundred lightweight tasks, flowing through both</T>
    </Svg>
  );
}

// ── 3 · One worker, one blocking call (predict) ─────────────────────────────────────────────────
export function StallPredict({ t }: StepCtx) {
  return (
    <Stack>
      <Code
        title="one worker, a non-yielding call"
        lines={['tokio::spawn(async {', '    std::thread::sleep(dur);', '});', '// a trivial task, queued right behind it']}
        t={t}
        start={0.1}
        end={2.6}
        highlight={[3]}
      />
    </Stack>
  );
}

// ── 4 · Measured stall (takeaway) ───────────────────────────────────────────────────────────────
export function StallMeasuredReveal({ t }: StepCtx) {
  const stallAt = 0.5;
  const w = lerp(6, 220, easeOut(seg(t, 0.2, stallAt)));
  return (
    <Svg label="blocking_stalls_worker.rs: a real, measured wait" h={200}>
      <T x={60} y={45} s={13} f={C.quiet}>trivial task, queued behind the blocking call</T>
      <Bar x={60} y={55} w={w} h={22} full={220} fill={C.caramel} />
      <Reticle x={170} y={66} w={230} h={40} t={t} at={stallAt} />
      <T x={60} y={120} s={13} f={C.latte} o={fa(t, 0.6, 0.4)}>waited: the full call, stalled right there</T>
      <T x={60} y={160} s={13} f={C.taupe} o={fa(t, 1.1, 0.4)}>measured directly, not assumed</T>
    </Svg>
  );
}

// ── 5 · Style choice? (predict) ──────────────────────────────────────────────────────────────────
export function RuntimeChoicePredict({ t }: StepCtx) {
  return (
    <Stack>
      <Code
        title="two ways to build a runtime"
        lines={['Builder::new_current_thread()', 'Builder::new_multi_thread()', '// just a style choice?']}
        t={t}
        start={0.1}
        end={2.2}
        highlight={[2]}
      />
    </Stack>
  );
}

// ── 6 · Always running vs. only while driven (takeaway) ─────────────────────────────────────────
export function RuntimeChoiceReveal({ t }: StepCtx) {
  const x1 = 60 + ((t * 90) % 400);
  const driven = Math.floor(t / 0.8) % 2 === 0;
  return (
    <Svg label="the docs' own words" h={200}>
      <line x1={60} y1={55} x2={460} y2={55} stroke={C.mocha} strokeWidth={1.5} />
      <circle cx={x1} cy={55} r={4} fill={C.caramel} />
      <T x={60} y={40} s={13} f={C.crema}>multi-thread: spawns its own pool, always running</T>
      <line x1={60} y1={115} x2={460} y2={115} stroke={C.mocha} strokeWidth={1.5} strokeDasharray="4 4" />
      {driven && <circle cx={260} cy={115} r={4} fill={C.taupe} opacity={fa(t, 0.9, 0.3)} />}
      <T x={60} y={100} s={13} f={C.mocha} o={fa(t, 0.9, 0.4)}>current-thread: no pool, runs only while driven</T>
      <T x={60} y={160} s={13} f={C.taupe} o={fa(t, 1.5, 0.4)}>a workload-shape decision, not a default</T>
    </Svg>
  );
}

// ── 7 · Can a non-Send value be spawned? (predict) ──────────────────────────────────────────────
export function NotSendSpawnPredict({ t }: StepCtx) {
  return (
    <Stack>
      <Code
        title="a non-portable value, held across an await"
        lines={['let data = Rc::new(String::from("x"));', 'tokio::spawn(async move {', '    println!("{}", data);', '});']}
        t={t}
        start={0.1}
        end={2.4}
        highlight={[0]}
      />
    </Stack>
  );
}

// ── 8 · rustc's own diagnostic (takeaway) ───────────────────────────────────────────────────────
export function SpawnFailReveal({ t }: StepCtx) {
  return (
    <Code
      title="not_send_rejected_by_spawn.rs"
      dim
      lines={['error: future cannot be sent', '  between threads safely', '// Rc<String> is not Send']}
      t={t}
      start={0.1}
      end={2.2}
      highlight={[0, 1]}
    />
  );
}

// ── 9 · LocalSet runs it for real (takeaway) ────────────────────────────────────────────────────
export function LocalSetReveal({ t }: StepCtx) {
  const bounce = 0.5 + 0.5 * Math.sin(t * 3);
  const bx = 80 + bounce * 200;
  return (
    <Svg label="localset_runs_not_send.rs: the identical value, run for real" h={200}>
      <T x={60} y={40} s={13} f={C.quiet}>through LocalSet and spawn_local</T>
      <line x1={60} y1={95} x2={300} y2={95} stroke={C.mocha} strokeWidth={1.5} />
      <circle cx={bx} cy={95} r={4} fill={C.caramel} opacity={fa(t, 0.3, 0.3)} />
      <T x={60} y={125} s={12} f={C.taupe}>same thread, every time — never moves across</T>
      <T x={60} y={165} s={13} f={C.latte} o={fa(t, 1.1, 0.4)}>a different promise, not a relaxed one</T>
    </Svg>
  );
}

// ── 10 · Recap ───────────────────────────────────────────────────────────────────────────────────
export function Recap({ t }: StepCtx) {
  const rows = [
    'tasks multiplex onto a small, fixed worker pool',
    'a stalled worker stalls everything behind it',
    'runtime choice is a workload-shape decision',
    'LocalSet runs the future spawn must refuse',
  ];
  return (
    <Svg label="recap: multiplexing, a real stall, and LocalSet" h={300}>
      {rows.map((r, i) => (
        <g key={r} opacity={fa(t, 0.2 + i * 0.4, 0.4)}>
          <circle cx={30} cy={40 + i * 55} r={5} fill={C.caramel} />
          <T x={48} y={46 + i * 55} s={13} f={C.crema}>{r}</T>
        </g>
      ))}
    </Svg>
  );
}
