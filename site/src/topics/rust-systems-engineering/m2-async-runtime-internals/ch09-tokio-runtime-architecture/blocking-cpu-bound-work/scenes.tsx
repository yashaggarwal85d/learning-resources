import type { StepCtx } from '../../../../../reels/types';
import { easeInOut, easeOut, easeOutBack, lerp, seg } from '../../../../../reels/anim';
import { Code } from '../../../../../reels/Code';
import { C, Draw, Reticle, Stack, Svg, T } from '../../../../../reels/kit';

// spawn_blocking (a dedicated, dynamically-sized blocking pool), block_in_place (hand other
// tasks to a new worker before blocking this one; panics with no other worker to hand off to),
// and the named alternative for genuinely CPU-bound work.
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

// ── 1 · A direct blocking call, one worker (predict, hook) ──────────────────────────────────────
export function BaselinePredict({ t }: StepCtx) {
  return (
    <Stack>
      <Code
        title="a direct blocking call, inside a spawned task"
        lines={['tokio::spawn(async {', '    std::thread::sleep(dur);', '});']}
        t={t}
        start={0.1}
        end={2.2}
        highlight={[1]}
      />
    </Stack>
  );
}

// ── 2 · Measured baseline (no takeaway, re-confirming "from" step) ──────────────────────────────
export function BaselineReveal({ t }: StepCtx) {
  const grow = easeOut(seg(t, 0.9, 1.3));
  const w = grow * 220;
  return (
    <Svg label="blocking_call_stalls_worker.rs: the same baseline, reconfirmed" h={200}>
      <T x={60} y={60} s={14} f={C.crema} o={fa(t, 0.3, 0.4)}>one worker, one blocking call</T>
      <rect x={60} y={85} width={w} height={44} rx={6} fill="none" stroke={C.caramel} strokeWidth={2} />
      {grow > 0.85 && <T x={170} y={112} s={13} a="middle" f={C.mocha}>waited: the full 300ms</T>}
      <T x={60} y={160} s={13} f={C.latte} o={fa(t, 1.5, 0.4)}>the exact starting point every fix is measured against</T>
    </Svg>
  );
}

// ── 3 · Move the call to spawn_blocking (predict) ────────────────────────────────────────────────
export function SpawnBlockingPredict({ t }: StepCtx) {
  return (
    <Stack>
      <Code
        title="the identical call, moved to spawn_blocking"
        lines={['task::spawn_blocking(|| {', '    std::thread::sleep(dur);', '});']}
        t={t}
        start={0.1}
        end={2.2}
        highlight={[0]}
      />
    </Stack>
  );
}

// ── 4 · Measured: isolated (takeaway) ────────────────────────────────────────────────────────────
export function SpawnBlockingReveal({ t }: StepCtx) {
  return (
    <Svg label="spawn_blocking_isolates_it.rs: a separate pool entirely" h={220}>
      <g opacity={fa(t, 0.1, 0.4)}>
        <rect x={60} y={40} width={160} height={50} rx={6} fill="none" stroke={C.taupe} strokeWidth={1.5} />
        <T x={140} y={70} s={12} a="middle" f={C.crema}>worker pool</T>
      </g>
      <g opacity={fa(t, 0.4, 0.4)}>
        <rect x={280} y={40} width={200} height={50} rx={6} fill="none" stroke={C.caramel} strokeWidth={2} />
        <T x={380} y={70} s={12} a="middle" f={C.mocha}>blocking pool, separate</T>
      </g>
      <Draw pts={[[220, 65], [280, 65]]} t={t} from={0.6} to={0.85} stroke={C.caramel} w={2} pen />
      <T x={60} y={125} s={13} f={C.crema} o={fa(t, 0.9, 0.4)}>sibling ran after roughly 0ms</T>
      <T x={60} y={160} s={13} f={C.latte} o={fa(t, 1.4, 0.4)}>the worker never touched the call at all</T>
    </Svg>
  );
}

// ── 5 · block_in_place (predict) ─────────────────────────────────────────────────────────────────
export function BlockInPlacePredict({ t }: StepCtx) {
  return (
    <Stack>
      <Code
        title="the identical call, inside block_in_place"
        lines={['tokio::spawn(async {', '    task::block_in_place(|| {', '        std::thread::sleep(dur);', '    });', '});']}
        t={t}
        start={0.1}
        end={2.4}
        highlight={[1]}
      />
    </Stack>
  );
}

// ── 6 · Measured: handed off (takeaway) ──────────────────────────────────────────────────────────
export function BlockInPlaceReveal({ t }: StepCtx) {
  const move = easeOut(seg(t, 0.5, 0.9));
  const dx = move * 220;
  return (
    <Svg label="block_in_place_hands_off.rs: everything else moves instead" h={220}>
      <g opacity={fa(t, 0.1, 0.4)}>
        <rect x={60} y={40} width={160} height={50} rx={6} fill="none" stroke={C.caramel} strokeWidth={2} />
        <T x={140} y={70} s={12} a="middle" f={C.mocha}>this worker, now blocked</T>
      </g>
      <g transform={`translate(${dx},0)`} opacity={move}>
        <rect x={60} y={40} width={200} height={50} rx={6} fill="none" stroke={C.taupe} strokeWidth={1.5} />
        <T x={160} y={70} s={12} a="middle" f={C.crema}>sibling, handed off here</T>
      </g>
      <T x={60} y={125} s={13} f={C.crema} o={fa(t, 1.0, 0.4)}>sibling ran after roughly 0ms</T>
      <T x={60} y={160} s={13} f={C.latte} o={fa(t, 1.5, 0.4)}>moved before the blocking call even started</T>
    </Svg>
  );
}

// ── 7 · Try it on current-thread (predict) ───────────────────────────────────────────────────────
export function PanicPredict({ t }: StepCtx) {
  return (
    <Stack>
      <Code
        title="the identical call, on a current-thread runtime"
        lines={['Builder::new_current_thread()', '    .build()?;', '// task::block_in_place(...) ?']}
        t={t}
        start={0.1}
        end={2.2}
        highlight={[0]}
      />
    </Stack>
  );
}

// ── 8 · Measured: panics (takeaway) ──────────────────────────────────────────────────────────────
export function PanicReveal({ t }: StepCtx) {
  const lane = easeOut(seg(t, 0.4, 0.8));
  const reach = easeInOut(seg(t, 1.0, 1.6)); // block_in_place looks for another worker to take over
  const boom = easeOutBack(seg(t, 1.7, 2.1));
  return (
    <Stack>
      <Code title="block_in_place_panics_on_current_thread.rs" dim={t < 0.1} lines={['thread panicked:', '  can call blocking only when', '  running on the multi-threaded runtime']} t={t} start={0.1} end={0.5} highlight={t > 1.7 ? [0, 1, 2] : []} />
      <Svg label="on a current-thread runtime there is only one worker; block_in_place reaches for a second worker to hand the other tasks to, finds none, and panics" h={170} fill>
        <g opacity={lane}>
          <T x={30} y={40} s={13} f={C.latte}>the only worker</T>
          <rect x={30} y={50} width={300} height={34} rx={8} fill={C.cocoa} stroke={C.crema} strokeWidth={1.5} />
          {[0, 1, 2, 3].map((i) => (
            <circle key={i} cx={60 + i * 34} cy={67} r={8} fill={i ? C.latte : C.caramel} />
          ))}
          <T x={250} y={72} s={13} a="middle" f={C.caramel}>blocking</T>
        </g>
        <rect x={30} y={118} width={300} height={34} rx={8} fill="none" stroke={boom > 0 ? C.cherryText : C.mocha} strokeWidth={1.5} strokeDasharray="6 4" opacity={reach > 0 ? 1 : 0} />
        <T x={180} y={140} s={13} a="middle" f={C.taupe} o={reach}>no other worker</T>
        {reach > 0 && (
          <g>
            <line x1={150} y1={84} x2={150} y2={lerp(84, 118, reach)} stroke={boom > 0 ? C.cherryText : C.latte} strokeWidth={2} />
            {[1, 2, 3].map((i) => (
              <circle key={i} cx={60 + i * 34} cy={lerp(67, 100, reach * (boom > 0 ? 1 - boom : 1))} r={5} fill={C.latte} opacity={0.8} />
            ))}
          </g>
        )}
        {boom > 0 && (
          <g transform={`translate(460 100) scale(${boom.toFixed(3)})`}>
            {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
              <line key={i} x1={Math.cos((i * Math.PI) / 4) * 26} y1={Math.sin((i * Math.PI) / 4) * 26} x2={Math.cos((i * Math.PI) / 4) * 40} y2={Math.sin((i * Math.PI) / 4) * 40} stroke={C.cherryText} strokeWidth={2.5} />
            ))}
            <T x={0} y={5} s={14} a="middle" f={C.cherryText} w={700}>panic</T>
          </g>
        )}
      </Svg>
    </Stack>
  );
}

// ── 9 · Named alternatives for CPU-heavy work (no takeaway, naming step) ────────────────────────
export function AlternativesReveal({ t }: StepCtx) {
  const slide1 = easeOut(seg(t, 0.2, 0.55));
  const slide2 = easeOut(seg(t, 0.7, 1.05));
  return (
    <Svg label="for genuinely CPU-heavy work, no blocking at all" h={240}>
      <g transform={`translate(${(1 - slide1) * -80},0)`} opacity={slide1}>
        <T x={60} y={55} s={14} f={C.crema}>rayon, or a dedicated runtime</T>
      </g>
      <g transform={`translate(${(1 - slide2) * -80},0)`} opacity={slide2}>
        <T x={60} y={100} s={14} f={C.mocha}>glommio, monoio, compio</T>
      </g>
      <T x={60} y={135} s={13} f={C.latte} o={fa(t, 1.2, 0.4)}>one worker per core, no borrowing at all</T>
    </Svg>
  );
}

// ── 10 · Recap ───────────────────────────────────────────────────────────────────────────────────
export function Recap({ t }: StepCtx) {
  const rows = [
    'a direct blocking call stalls that one worker',
    'spawn_blocking moves the call off the pool',
    'block_in_place moves everything else, or panics',
    'CPU-heavy work has its own named answers',
  ];
  return <RecapList t={t} end={3} label="recap: two real fixes, two different promises" rows={rows} step={55}
      s={14}
    />;
}
