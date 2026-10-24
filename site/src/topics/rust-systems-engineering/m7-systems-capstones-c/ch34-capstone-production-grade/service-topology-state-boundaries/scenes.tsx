import type { StepCtx } from '../../../../../reels/types';
import { easeOut, seg } from '../../../../../reels/anim';
import { Code } from '../../../../../reels/Code';
import { Stack, Svg, T, C } from '../../../../../reels/kit';

// A real, bounded queue behind a real Axum edge rejects a request at
// the boundary once full, and that request never reaches the worker
// pool or storage; a real shutdown coordinator closes the door to new
// work immediately while draining whatever had already gotten in.
const fa = (t: number, a: number, d = 0.4) => easeOut(seg(t, a, a + d));

// ── 1 · Does the third request get queued too (predict) ────────────────
export function BoundaryPredict({ t }: StepCtx) {
  return (
    <Stack>
      <Code
        title="a bounded queue, capacity one, behind the edge"
        lines={['tx.try_send(job) // three real requests, fast', '// does the third one get queued too?']}
        t={t}
        start={0.1}
        end={2.6}
        highlight={[1]}
      />
    </Stack>
  );
}

// ── 2 · Measured: the third request is rejected at the boundary ────────
export function BoundaryReveal({ t }: StepCtx) {
  const rows = ['request one, two: queued', 'request three: rejected, queue full'];
  return (
    <Svg label="service_demo, captured" h={180}>
      {rows.map((r, i) => (
        <g key={r} opacity={fa(t, 0.2 + i * 0.4, 0.4)}>
          <circle cx={30} cy={40 + i * 45} r={5} fill={C.caramel} />
          <T x={48} y={46 + i * 45} s={13} f={C.crema}>{r}</T>
        </g>
      ))}
    </Svg>
  );
}

// ── 3 · Does the rejected request still reach storage (predict) ────────
export function StoragePredict({ t }: StepCtx) {
  return (
    <Stack>
      <Code
        title="the worker pool finishes; storage is checked"
        lines={['storage.lock().unwrap().push(job.id)', '// does the rejected request show up here too?']}
        t={t}
        start={0.1}
        end={2.6}
        highlight={[1]}
      />
    </Stack>
  );
}

// ── 4 · Measured: storage holds only the two admitted requests ─────────
export function StorageReveal({ t }: StepCtx) {
  return (
    <Svg label="service_demo, captured" h={200}>
      <T x={60} y={50} s={14} f={C.crema} o={fa(t, 0.3, 0.4)}>storage, once the worker finishes</T>
      <g opacity={fa(t, 0.9, 0.4)}>
        <rect x={60} y={75} width={300} height={44} rx={6} fill="none" stroke={C.caramel} strokeWidth={2} />
        <T x={210} y={102} s={13} a="middle" f={C.mocha}>holds: one, two. never: three</T>
      </g>
      <T x={60} y={150} s={13} f={C.latte} o={fa(t, 1.5, 0.4)}>the boundary sits in front of storage</T>
    </Svg>
  );
}

// ── 5 · Does shutdown finish the queued work or drop it (predict) ──────
export function ShutdownPredict({ t }: StepCtx) {
  return (
    <Stack>
      <Code
        title="shutdown begins; two requests already queued"
        lines={['state.accepting.store(false, ..) // then drop(tx)', '// finished, or dropped along with shutdown?']}
        t={t}
        start={0.1}
        end={2.6}
        highlight={[1]}
      />
    </Stack>
  );
}

// ── 6 · Measured: queued work drains; new work is rejected (takeaway) ──
export function ShutdownReveal({ t }: StepCtx) {
  return (
    <Svg label="service_demo, captured" h={200}>
      <T x={60} y={50} s={14} f={C.crema} o={fa(t, 0.3, 0.4)}>a second instance, shutting down</T>
      <g opacity={fa(t, 0.9, 0.4)}>
        <rect x={60} y={75} width={300} height={44} rx={6} fill="none" stroke={C.caramel} strokeWidth={2} />
        <T x={210} y={102} s={13} a="middle" f={C.mocha}>new work: rejected. queued work: drained</T>
      </g>
      <T x={60} y={150} s={13} f={C.latte} o={fa(t, 1.5, 0.4)}>closes the door, finishes what got in</T>
    </Svg>
  );
}

// ── 7 · mpsc and CancellationToken's own words (connecting) ────────────
export function DocsReveal({ t }: StepCtx) {
  const rows = ['mpsc: at capacity, a send is rejected', 'CancellationToken: signals a real request'];
  return (
    <Svg label="mpsc and CancellationToken's own docs" h={180}>
      {rows.map((r, i) => (
        <g key={r} opacity={fa(t, 0.2 + i * 0.4, 0.4)}>
          <circle cx={30} cy={40 + i * 45} r={5} fill={C.caramel} />
          <T x={48} y={46 + i * 45} s={13} f={C.crema}>{r}</T>
        </g>
      ))}
    </Svg>
  );
}

// ── 8 · Recap ─────────────────────────────────────────────────────────────
export function Recap({ t }: StepCtx) {
  const rows = ['a rejected request never reaches storage', 'shutdown closes that same door to new work', 'but still drains whatever already got in'];
  return (
    <Svg label="recap: a topology with real boundaries" h={300}>
      {rows.map((r, i) => (
        <g key={r} opacity={fa(t, 0.2 + i * 0.4, 0.4)}>
          <circle cx={30} cy={40 + i * 55} r={5} fill={C.caramel} />
          <T x={48} y={46 + i * 55} s={13} f={C.crema}>{r}</T>
        </g>
      ))}
    </Svg>
  );
}
