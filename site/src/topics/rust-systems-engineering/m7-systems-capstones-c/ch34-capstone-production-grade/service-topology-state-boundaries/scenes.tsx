import type { StepCtx } from '../../../../../reels/types';
import { easeOut, seg } from '../../../../../reels/anim';
import { Code } from '../../../../../reels/Code';
import { Draw, Stack, Svg, T, C } from '../../../../../reels/kit';

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
  const ids = [0, 1, 2];
  return (
    <Svg label="service_demo, captured" h={210}>
      <rect x={200} y={30} width={14} height={120} fill="none" stroke={C.latte} strokeWidth={1.5} opacity={fa(t, 0.1, 0.2)} />
      <T x={207} y={25} s={10} a="middle" f={C.latte}>boundary</T>
      {ids.map((i) => {
        const admitted = i < 2;
        const start = 0.2 + i * 0.15;
        const travel = easeOut(seg(t, start, start + (admitted ? 0.4 : 0.2)));
        const y0 = 45 + i * 40;
        return admitted ? (
          <g key={i}>
            <Draw pts={[[40, y0], [320, y0]]} t={t} from={start} to={start + 0.4} stroke={C.caramel} w={2} pen />
            <circle cx={40 + travel * 280} cy={y0} r={5} fill={C.caramel} opacity={fa(t, start, 0.15)} />
          </g>
        ) : (
          <g key={i}>
            <Draw pts={[[40, y0], [207, y0]]} t={t} from={start} to={start + 0.2} stroke={C.latte} w={2} pen />
            <circle cx={40 + travel * 167} cy={y0} r={5} fill="none" stroke={C.cherry} strokeWidth={1.5} opacity={fa(t, start, 0.15)} />
          </g>
        );
      })}
      <g opacity={fa(t, 0.9, 0.3)}>
        <rect x={220} y={75} width={130} height={40} rx={6} fill="none" stroke={C.caramel} strokeWidth={2} />
        <T x={285} y={100} s={11} a="middle" f={C.mocha}>storage</T>
      </g>
      <T x={60} y={165} s={13} f={C.latte} o={fa(t, 1.2, 0.3)}>holds: one, two. never: three</T>
      <T x={60} y={190} s={13} f={C.latte} o={fa(t, 1.6, 0.3)}>the boundary sits in front of storage</T>
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
  const drain0 = easeOut(seg(t, 0.2, 0.55));
  const drain1 = easeOut(seg(t, 0.35, 0.7));
  const newReq = easeOut(seg(t, 0.25, 0.4));
  return (
    <Svg label="service_demo, captured" h={215}>
      <T x={30} y={30} s={11} f={C.latte} o={fa(t, 0.05, 0.2)}>a second instance, shutting down</T>
      <Draw pts={[[40, 55], [320, 55]]} t={t} from={0.2} to={0.55} stroke={C.caramel} w={2} pen />
      <circle cx={40 + drain0 * 280} cy={55} r={5} fill={C.caramel} opacity={fa(t, 0.2, 0.15)} />
      <Draw pts={[[40, 85], [320, 85]]} t={t} from={0.35} to={0.7} stroke={C.caramel} w={2} pen />
      <circle cx={40 + drain1 * 280} cy={85} r={5} fill={C.caramel} opacity={fa(t, 0.35, 0.15)} />
      <circle cx={40 + newReq * 60} cy={115} r={5} fill="none" stroke={C.cherry} strokeWidth={1.5} opacity={fa(t, 0.25, 0.15)} />
      <T x={40} y={135} s={11} f={C.latte} o={fa(t, 0.45, 0.2)}>new request: rejected at the door</T>
      <g opacity={fa(t, 0.85, 0.3)}>
        <rect x={60} y={150} width={290} height={34} rx={6} fill="none" stroke={C.caramel} strokeWidth={2} />
        <T x={205} y={172} s={12} a="middle" f={C.mocha}>new work: rejected. queued work: drained</T>
      </g>
      <T x={40} y={193} s={11} f={C.latte} o={fa(t, 1.3, 0.3)}>closes the door, finishes what got in</T>
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
