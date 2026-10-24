import type { StepCtx } from '../../../../../reels/types';
import { easeOut, seg } from '../../../../../reels/anim';
import { Code } from '../../../../../reels/Code';
import { Stack, Svg, T, C } from '../../../../../reels/kit';

// spawn_blocking (a dedicated, dynamically-sized blocking pool), block_in_place (hand other
// tasks to a new worker before blocking this one; panics with no other worker to hand off to),
// and the named alternative for genuinely CPU-bound work.
const fa = (t: number, a: number, d = 0.4) => easeOut(seg(t, a, a + d));

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
  return (
    <Svg label="blocking_call_stalls_worker.rs: the same baseline, reconfirmed" h={200}>
      <T x={60} y={60} s={14} f={C.crema} o={fa(t, 0.3, 0.4)}>one worker, one blocking call</T>
      <g opacity={fa(t, 0.9, 0.4)}>
        <rect x={60} y={85} width={220} height={44} rx={6} fill="none" stroke={C.caramel} strokeWidth={2} />
        <T x={170} y={112} s={13} a="middle" f={C.mocha}>waited: the full 300ms</T>
      </g>
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
  return (
    <Svg label="block_in_place_hands_off.rs: everything else moves instead" h={220}>
      <g opacity={fa(t, 0.1, 0.4)}>
        <rect x={60} y={40} width={160} height={50} rx={6} fill="none" stroke={C.caramel} strokeWidth={2} />
        <T x={140} y={70} s={12} a="middle" f={C.mocha}>this worker, now blocked</T>
      </g>
      <g opacity={fa(t, 0.5, 0.4)}>
        <rect x={280} y={40} width={200} height={50} rx={6} fill="none" stroke={C.taupe} strokeWidth={1.5} />
        <T x={380} y={70} s={12} a="middle" f={C.crema}>sibling, handed off here</T>
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
  return (
    <Code
      title="block_in_place_panics_on_current_thread.rs"
      dim
      lines={['thread panicked:', '  can call blocking only when', '  running on the multi-threaded runtime']}
      t={t}
      start={0.1}
      end={2.4}
      highlight={[0, 1, 2]}
    />
  );
}

// ── 9 · Named alternatives for CPU-heavy work (no takeaway, naming step) ────────────────────────
export function AlternativesReveal({ t }: StepCtx) {
  return (
    <Svg label="for genuinely CPU-heavy work, no blocking at all" h={240}>
      <T x={60} y={55} s={14} f={C.crema} o={fa(t, 0.2, 0.4)}>rayon, or a dedicated runtime</T>
      <T x={60} y={100} s={14} f={C.mocha} o={fa(t, 0.7, 0.4)}>glommio, monoio, compio</T>
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
  return (
    <Svg label="recap: two real fixes, two different promises" h={300}>
      {rows.map((r, i) => (
        <g key={r} opacity={fa(t, 0.2 + i * 0.4, 0.4)}>
          <circle cx={30} cy={40 + i * 55} r={5} fill={C.caramel} />
          <T x={48} y={46 + i * 55} s={13} f={C.crema}>{r}</T>
        </g>
      ))}
    </Svg>
  );
}
