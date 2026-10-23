import type { StepCtx } from '../../../../../reels/types';
import { easeOut, seg } from '../../../../../reels/anim';
import { Code } from '../../../../../reels/Code';
import { C, Draw, Stack, Svg, T } from '../../../../../reels/kit';

// Four places, and only four, change which thread owns a value: thread::spawn, thread::scope,
// tokio::spawn, and a channel send. Every measured number and every compiler error shown is
// executed for real by examples.py (rustc 1.97.0, edition 2024, x86_64 Linux; the tokio example
// is built via cargo).
const fa = (t: number, a: number, d = 0.4) => easeOut(seg(t, a, a + d));

const threadDot = (cx: number, cy: number, label: string, opacity = 1) => (
  <g opacity={opacity}>
    <circle cx={cx} cy={cy} r={14} fill="none" stroke={C.taupe} strokeWidth={1.5} />
    <T x={cx} y={cy + 4} s={10} a="middle" f={C.crema}>{label}</T>
  </g>
);

// ── 1 · Four places, and only four, change which thread owns a value (hook) ────────────────────
export function FourPlacesHook({ t }: StepCtx) {
  const rows = ['thread::spawn', 'thread::scope', 'tokio::spawn', 'a channel send'];
  return (
    <Svg label="the only four places a value's ownership crosses a thread boundary" h={260}>
      {rows.map((r, i) => (
        <g key={r} opacity={fa(t, 0.3 + i * 0.3, 0.4)}>
          <circle cx={30} cy={40 + i * 50} r={5} fill={C.caramel} />
          <T x={48} y={46 + i * 50} s={14} f={C.crema} serif>{r}</T>
        </g>
      ))}
      <T x={60} y={240} s={13} f={C.taupe} o={fa(t, 1.6, 0.4)}>nowhere else</T>
    </Svg>
  );
}

// ── 2 · Move a String into a new thread (predict) ──────────────────────────────────────────────
export function MoveStringPredict({ t }: StepCtx) {
  return (
    <Stack>
      <Code
        title="examples/thread_spawn_owns.rs"
        lines={['let message = String::from("...");', 'thread::spawn(move || {', '    message.len()', '});']}
        t={t}
        start={0.1}
        end={2.0}
        highlight={[0, 1, 2]}
      />
      <Svg label="does the caller still have message afterward?" h={46}>
        <T x={40} y={28} s={13} f={C.mocha} o={fa(t, 2.2, 0.4)}>the closure captured message with `move`</T>
      </Svg>
    </Stack>
  );
}

// ── 3 · Moved for good (no takeaway: the reel's "from" step) ────────────────────────────────────
export function MovedForGoodReveal({ t }: StepCtx) {
  return (
    <Stack>
      <Code
        title="the new thread owns message now"
        lines={['thread::spawn(move || {', '    message.len() // owned here', '});', '// message is gone from main']}
        t={t}
        start={0.1}
        end={2.2}
        highlight={[1, 3]}
      />
      <Svg label="measured: the moved String's own length" h={60}>
        <T x={40} y={34} s={13} f={C.caramel} o={fa(t, 2.4, 0.4)}>measured length, computed on the new thread: 27</T>
      </Svg>
    </Stack>
  );
}

// ── 4 · Try to only borrow into a plain spawn (takeaway) ────────────────────────────────────────
export function BorrowFailsReveal({ t }: StepCtx) {
  return (
    <Code
      title="the real compiler verdict"
      dim
      lines={['error[E0373]: closure may outlive', 'the current function, but it borrows', '`data`, which is owned by the', 'current function', 'help: use the `move` keyword']}
      t={t}
      start={0.1}
      end={2.6}
      highlight={[0, 1, 4]}
    />
  );
}

// ── 5 · thread::scope makes the identical borrow sound (takeaway) ──────────────────────────────
export function ScopeBorrowsReveal({ t }: StepCtx) {
  return (
    <Stack>
      <Code
        title="examples/thread_scope_borrows.rs"
        lines={['thread::scope(|s| {', '    s.spawn(|| { /* borrows data */ });', '    s.spawn(|| { total += ... });', '});']}
        t={t}
        start={0.1}
        end={2.2}
        highlight={[0, 1, 2]}
      />
      <Svg label="measured: the borrowed sum, after every thread joined" h={60}>
        <T x={40} y={34} s={13} f={C.caramel} o={fa(t, 2.4, 0.4)}>measured sum, borrowed the whole time: 60</T>
      </Svg>
    </Stack>
  );
}

// ── 6 · tokio::spawn asks for the identical contract (predict) ─────────────────────────────────
export function TokioSpawnPredict({ t }: StepCtx) {
  return (
    <Stack>
      <Code
        title="examples/src/bin/tokio_spawn_owns.rs"
        lines={['tokio::spawn(async move {', '    message.len()', '});']}
        t={t}
        start={0.1}
        end={1.6}
        highlight={[0]}
      />
      <Svg label="does a non-Send future compile here?" h={46}>
        <T x={40} y={28} s={13} f={C.mocha} o={fa(t, 1.8, 0.4)}>the signature needs F: Future + Send + 'static</T>
      </Svg>
    </Stack>
  );
}

// ── 7 · Same contract, same reason (takeaway) ───────────────────────────────────────────────────
export function TokioSpawnReveal({ t }: StepCtx) {
  return (
    <Svg label="the runtime, not the caller, decides which thread runs the task" h={220}>
      <rect x={200} y={30} width={200} height={50} rx={8} fill="none" stroke={C.caramel} strokeWidth={2} />
      <T x={300} y={60} s={13} a="middle" f={C.crema}>spawned task</T>
      {threadDot(140, 160, 'this', fa(t, 0.4, 0.4))}
      {threadDot(460, 160, 'or this', fa(t, 0.8, 0.4))}
      <Draw pts={[[200, 55], [154, 146]]} t={t} from={0.4} to={0.6} stroke={C.mocha} w={1.5} pen={false} />
      <Draw pts={[[400, 55], [446, 146]]} t={t} from={0.8} to={1.0} stroke={C.mocha} w={1.5} pen={false} />
      <T x={40} y={200} s={13} f={C.taupe} o={fa(t, 1.3, 0.4)}>measured: the moved String's length is 29</T>
    </Svg>
  );
}

// ── 8 · A channel send is the fourth crossing point (takeaway) ─────────────────────────────────
export function ChannelSendReveal({ t }: StepCtx) {
  const positions: [number, number][] = [[120, 190], [480, 190]];
  return (
    <Svg label="two producer threads, one channel, one receiver" h={260}>
      <rect x={250} y={60} width={100} height={50} rx={8} fill="none" stroke={C.caramel} strokeWidth={2} />
      <T x={300} y={90} s={13} a="middle" f={C.crema}>channel</T>
      {positions.map(([x, y], i) => (
        <g key={i} opacity={fa(t, 0.3 + i * 0.3, 0.4)}>
          <Draw pts={[[x, y], [300, 116]]} t={t} from={0.3 + i * 0.3} to={0.55 + i * 0.3} stroke={C.mocha} w={1.5} pen={false} />
          {threadDot(x, y, `p${i + 1}`)}
        </g>
      ))}
      <T x={60} y={240} s={13} f={C.taupe} o={fa(t, 1.3, 0.4)}>measured: both sent values received: 2</T>
    </Svg>
  );
}

// ── 9 · That channel's own implementation is borrowed (takeaway) ───────────────────────────────
export function CrossbeamSourceReveal({ t }: StepCtx) {
  return (
    <Code
      title="the std library's own source comment"
      lines={['// This module is used as the', '// implementation for sync::mpsc.', '// The implementation comes from', '// the crossbeam-channel crate:']}
      t={t}
      start={0.1}
      end={2.2}
      highlight={[2, 3]}
    />
  );
}

// ── 10 · Recap ───────────────────────────────────────────────────────────────────────────────────
export function Recap({ t }: StepCtx) {
  const rows = [
    'four crossing points, no more, no fewer',
    'spawn and tokio::spawn need Send + \'static',
    'scope trades that for a join guarantee',
    'mpsc is a crossbeam port, not bespoke',
  ];
  return (
    <Svg label="recap: where ownership crosses a thread boundary" h={300}>
      {rows.map((r, i) => (
        <g key={r} opacity={fa(t, 0.2 + i * 0.4, 0.4)}>
          <circle cx={30} cy={40 + i * 55} r={5} fill={C.caramel} />
          <T x={48} y={46 + i * 55} s={13} f={C.crema}>{r}</T>
        </g>
      ))}
    </Svg>
  );
}
