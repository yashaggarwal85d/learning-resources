import type { StepCtx } from '../../../../../reels/types';
import { easeInOut, easeOut, easeOutBack, lerp, seg } from '../../../../../reels/anim';
import { Code } from '../../../../../reels/Code';
import { C, Draw, Reticle, Stack, Svg, T } from '../../../../../reels/kit';

// A task is multiplexed onto a small, fixed worker pool, never mapped 1:1 onto a real thread;
// a worker fully occupied by a non-yielding call stalls everything else scheduled there,
// measured directly. tokio is this chapter's first real, chapter-wide crate dependency.
const fa = (t: number, a: number, d = 0.4) => easeOut(seg(t, a, a + d));

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
  const flowStart = 1.0;
  return (
    <Svg label="a hundred tasks, two real worker threads" h={220}>
      {[0, 1].map((w) => (
        <g key={w} opacity={fa(t, 0.2 + w * 0.3, 0.4)}>
          <rect x={60 + w * 240} y={40} width={200} height={60} rx={6} fill="none" stroke={C.taupe} strokeWidth={1.5} />
          <T x={160 + w * 240} y={75} s={13} a="middle" f={C.crema}>worker thread</T>
        </g>
      ))}
      {[0, 1].map((w) =>
        [0, 1, 2].map((d) => {
          const cycleT = flowStart + d * 0.25;
          const cyclePos = t > cycleT ? ((t - cycleT) % 0.75) / 0.75 : -1;
          if (cyclePos < 0) return null;
          const cx = 60 + w * 240 + cyclePos * 200;
          return <circle key={`${w}-${d}`} cx={cx} cy={70} r={4} fill={C.caramel} />;
        })
      )}
      <T x={60} y={150} s={13} f={C.latte} o={fa(t, flowStart, 0.4)}>a hundred lightweight tasks, flowing through both</T>
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
  const grow = easeOut(seg(t, 0.9, 1.3));
  const w = grow * 220;
  return (
    <Svg label="blocking_stalls_worker.rs: a real, measured wait" h={200}>
      <T x={60} y={60} s={14} f={C.crema} o={fa(t, 0.3, 0.4)}>created, then queued behind the blocking call</T>
      <rect x={60} y={85} width={w} height={44} rx={6} fill="none" stroke={C.caramel} strokeWidth={2} />
      {grow > 0.85 && <T x={170} y={112} s={13} a="middle" f={C.mocha}>waited: 300ms, the full call</T>}
      <T x={60} y={160} s={13} f={C.latte} o={fa(t, 1.5, 0.4)}>measured directly, not assumed</T>
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
  const cyclePos = t > 0.3 ? ((t - 0.3) % 0.9) / 0.9 : 0;
  const spin = cyclePos < 0.5 ? cyclePos * 2 : (1 - cyclePos) * 2;
  const poked = t > 0.9 && (t - 0.9) % 1.2 < 0.15;
  return (
    <Svg label="the docs' own words" h={200}>
      <T x={60} y={60} s={14} f={C.crema} o={fa(t, 0.3, 0.4)}>multi-thread: spawns its own pool, always running</T>
      <circle cx={420} cy={56} r={4} fill={C.caramel} opacity={fa(t, 0.3, 0.4)} transform={`translate(${spin * 18},0)`} />
      <T x={60} y={110} s={14} f={C.mocha} o={fa(t, 0.9, 0.4)}>current-thread: no pool, runs only while driven</T>
      <circle cx={420} cy={106} r={4} fill={poked ? C.caramel : C.taupe} opacity={fa(t, 0.9, 0.4)} />
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
  const box = easeOut(seg(t, 0.4, 0.8));
  const scan = seg(t, 1.0, 1.8);
  const go = easeInOut(seg(t, 1.8, 2.2));
  const bounce = easeOutBack(seg(t, 2.2, 2.6));
  const fx = lerp(0, 120, go) - bounce * 120;
  const chips = [
    { x: 70, label: 'String', ok: true },
    { x: 170, label: 'Rc<String>', ok: false },
  ];
  return (
    <Stack>
      <Code title="not_send_rejected_by_spawn.rs" dim={t < 0.1} lines={['error: future cannot be sent', '  between threads safely', '// Rc<String> is not Send']} t={t} start={0.1} end={0.5} highlight={t > 2.2 ? [0, 1] : t > 1.4 ? [2] : []} />
      <Svg label="tokio::spawn checks everything the future holds across its await; the Rc<String> fails the Send check, and the future is turned back at spawn" h={160} fill>
        <g transform={`translate(${fx.toFixed(1)} 0)`} opacity={box}>
          <rect x={40} y={40} width={250} height={70} rx={12} fill="none" stroke={bounce > 0 ? C.cherryText : C.crema} strokeWidth={1.5} />
          <T x={54} y={32} s={13} f={C.latte}>the future</T>
          {chips.map((c, i) => {
            const checked = scan * 2 > i + 0.6;
            return (
              <g key={c.label}>
                <rect x={c.x - 15} y={58} width={c.label.length * 10 + 14} height={32} rx={16} fill={checked && !c.ok ? C.cherry : C.cocoa} stroke={checked ? (c.ok ? C.caramel : C.cherryText) : C.mocha} strokeWidth={1.5} />
                <T x={c.x - 8} y={79} s={13} f={C.crema}>{c.label}</T>
              </g>
            );
          })}
        </g>
        {scan > 0 && scan < 1 && <rect x={lerp(50, 290, scan)} y={46} width={3} height={58} fill={C.focus} />}
        <line x1={430} y1={20} x2={430} y2={130} stroke={bounce > 0 ? C.cherryText : C.caramel} strokeWidth={3} opacity={box} />
        <T x={440} y={60} s={13} f={C.caramel} o={box}>tokio::spawn</T>
        <T x={440} y={80} s={13} f={C.latte} o={box}>needs Send</T>
        <T x={440} y={130} s={13} f={C.cherryText} o={bounce}>rejected</T>
      </Svg>
    </Stack>
  );
}

// ── 9 · LocalSet runs it for real (takeaway) ────────────────────────────────────────────────────
export function LocalSetReveal({ t }: StepCtx) {
  const land = easeOut(seg(t, 0.9, 1.3));
  const dy = (1 - land) * -40;
  return (
    <Svg label="localset_runs_not_send.rs: the identical value, run for real" h={200}>
      <T x={60} y={60} s={14} f={C.crema} o={fa(t, 0.3, 0.4)}>through LocalSet and spawn_local</T>
      <rect x={60} y={85} width={240} height={44} rx={6} fill="none" stroke={C.taupe} strokeWidth={1.5} />
      <g transform={`translate(0,${dy})`} opacity={land}>
        <T x={180} y={112} s={13} a="middle" f={C.mocha}>runs correctly, same thread</T>
      </g>
      <T x={60} y={160} s={13} f={C.latte} o={fa(t, 1.5, 0.4)}>a different promise, not a relaxed one</T>
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
  return <RecapList t={t} end={3} label="recap: multiplexing, a real stall, and LocalSet" rows={rows} step={55}
      s={14}
    />;
}
