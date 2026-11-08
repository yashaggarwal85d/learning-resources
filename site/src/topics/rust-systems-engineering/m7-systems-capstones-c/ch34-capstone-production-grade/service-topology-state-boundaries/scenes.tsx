import type { StepCtx } from '../../../../../reels/types';
import { Code } from '../../../../../reels/Code';
import { clamp, easeInOut, easeOut, lerp, seg } from '../../../../../reels/anim';
import { Decode, Draw, Reticle, Stack, Svg, T, C } from '../../../../../reels/kit';

// A real, bounded queue behind a real Axum edge rejects a request at
// the boundary once full, and that request never reaches the worker
// pool or storage; a real shutdown coordinator closes the door to new
// work immediately while draining whatever had already gotten in.
const fa = (t: number, a: number, d = 0.4) => easeOut(seg(t, a, a + d));

// One mono character at s=13 in canvas units; text scales by 1.22 in portrait (global.css), so underlines follow it.
const cw13 = (portrait: boolean) => 8.2 * (portrait ? 1.22 : 1);

// A check mark that draws itself, for a recap point landing.
const Tick = ({ x, y, t, at, color = C.caramel }: { x: number; y: number; t: number; at: number; color?: string }) => (
  <Draw pts={[[x - 6, y], [x - 1, y + 5], [x + 8, y - 7]]} t={t} from={at} to={at + 0.3} stroke={color} w={2} />
);

// A recap point: slides in from the right and its check mark draws as it lands.
const Point = ({ y, text, t, at }: { y: number; text: string; t: number; at: number }) => {
  const k = easeOut(seg(t, at, at + 0.45));
  return (
    <g>
      <Tick x={30} y={y - 4} t={t} at={at + 0.25} />
      <g transform={`translate(${((1 - k) * 36).toFixed(1)} 0)`} opacity={k}>
        <T x={52} y={y} s={13} f={C.crema}>{text}</T>
      </g>
    </g>
  );
};

// A quoted source: the card slides in, its rule grows, the source name decodes, and a pen underlines the phrase that matters.
function Quote({ y, src, quote, mark, t, at, portrait }: { y: number; src: string; quote: string; mark: string; t: number; at: number; portrait: boolean }) {
  const k = easeOut(seg(t, at, at + 0.45));
  const cw = cw13(portrait);
  const i = Math.max(0, quote.indexOf(mark));
  const x0 = 50 + i * cw;
  const x1 = x0 + mark.length * cw;
  const lit = seg(t, at + 0.55, at + 0.95);
  return (
    <g transform={`translate(${((1 - k) * 48).toFixed(1)} 0)`} opacity={k}>
      <rect x={30} y={y} width={3} height={58 * k} fill={C.caramel} />
      <Decode text={src} t={t} at={at + 0.1} dur={0.5} x={50} y={y + 18} s={11} f={C.latte} />
      <T x={50} y={y + 42} s={13} f={C.crema}>
        {quote.slice(0, i)}
        <tspan fill={lit > 0.5 ? C.caramel : C.crema}>{mark}</tspan>
        {quote.slice(i + mark.length)}
      </T>
      <Draw pts={[[x0, y + 50], [x1, y + 50]]} t={t} from={at + 0.55} to={at + 0.95} stroke={C.caramel} w={2} />
    </g>
  );
}

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
  // Three requests fire at once: one reaches the worker, one waits in the queue's only slot, the third hits the full door and bounces back.
  const r1 = easeOut(seg(t, 0.1, 0.8));
  const r2 = easeOut(seg(t, 0.25, 0.95));
  const r3in = easeOut(seg(t, 0.4, 0.95));
  const r3out = easeOut(seg(t, 0.95, 1.4));
  const r3x = lerp(lerp(40, 268, r3in), 190, r3out);
  const hit = clamp(1 - Math.abs(t - 0.95) / 0.15);
  const lane = 70;
  return (
    <Svg label="service_demo, captured" h={210}>
      <Draw pts={[[40, lane], [520, lane]]} t={t} from={0} to={0.3} stroke={C.mocha} w={1} pen={false} />
      <rect x={274} y={lane - 30 - hit * 4} width={6 + hit * 3} height={60 + hit * 8} fill={C.caramel} opacity={fa(t, 0, 0.2)} />
      <rect x={300} y={lane - 18} width={70} height={36} rx={5} fill="none" stroke={C.latte} strokeWidth={1.5} opacity={fa(t, 0, 0.2)} />
      <T x={335} y={lane - 26} s={11} a="middle" f={C.latte} o={fa(t, 0, 0.2)}>queue</T>
      <rect x={410} y={lane - 18} width={90} height={36} rx={5} fill="none" stroke={C.latte} strokeWidth={1.5} opacity={fa(t, 0, 0.2)} />
      <T x={455} y={lane - 26} s={11} a="middle" f={C.latte} o={fa(t, 0, 0.2)}>worker</T>
      <circle cx={lerp(40, 455, r1)} cy={lane} r={6} fill={C.caramel} opacity={fa(t, 0.1, 0.1)} />
      <circle cx={lerp(40, 335, r2)} cy={lane} r={6} fill={C.caramel} opacity={fa(t, 0.25, 0.1)} />
      <circle cx={r3x} cy={lane} r={6} fill="none" stroke={C.cherryText} strokeWidth={2} opacity={fa(t, 0.4, 0.1)} />
      <Decode text="rejected" t={t} at={1.2} x={190} y={lane + 32} s={12} a="middle" f={C.cherryText} />
      <Reticle x={190} y={lane} w={28} h={28} t={t} at={2.2} color={C.cherryText} />
      {rows.map((r, i) => {
        const k = fa(t, 1.4 + i * 0.4, 0.45);
        return (
          <g key={r} transform={`translate(${((1 - k) * 36).toFixed(1)} 0)`} opacity={k}>
            <circle cx={30} cy={150 + i * 32} r={5} fill={i ? 'none' : C.caramel} stroke={C.cherryText} strokeWidth={i ? 2 : 0} />
            <T x={48} y={155 + i * 32} s={13} f={C.crema}>{r}</T>
          </g>
        );
      })}
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
export function DocsReveal({ t, portrait }: StepCtx) {
  return (
    <Svg label="mpsc and CancellationToken's own docs" h={190}>
      <Quote y={14} src="tokio::sync::mpsc" quote="at capacity, a send is rejected" mark="a send is rejected" t={t} at={0.1} portrait={portrait} />
      <Quote y={94} src="CancellationToken" quote="signals a real request" mark="signals" t={t} at={1.0} portrait={portrait} />
      <Draw pts={[[575, 30], [585, 30], [585, 150], [575, 150]]} t={t} from={2.0} to={2.4} stroke={C.latte} w={1.5} pen={false} />
      <Decode text="both, measured here" t={t} at={2.2} dur={0.5} x={570} y={180} s={11} a="end" f={C.caramel} />
    </Svg>
  );
}

// ── 8 · Recap ─────────────────────────────────────────────────────────────
export function Recap({ t }: StepCtx) {
  const rows = ['a rejected request never reaches storage', 'shutdown closes that same door to new work', 'but still drains whatever already got in'];
  // The payoff, replayed small under the points: a request bounces off the door, the door shuts, what got in drains to storage.
  const lane = 232;
  const bounceIn = easeOut(seg(t, 0.3, 0.7));
  const bounceOut = easeOut(seg(t, 0.7, 1.0));
  const shut = easeOut(seg(t, 0.95, 1.35));
  const drain = (d: number) => easeOut(seg(t, 1.55 + d, 2.25 + d));
  return (
    <Svg label="recap: a topology with real boundaries" h={300}>
      {rows.map((r, i) => (
        <Point key={r} y={44 + i * 44} text={r} t={t} at={0.15 + i * 0.7} />
      ))}
      <g opacity={fa(t, 0.1, 0.3)}>
        <line x1={60} y1={lane} x2={430} y2={lane} stroke={C.mocha} />
        <rect x={430} y={lane - 20} width={110} height={40} rx={6} fill="none" stroke={C.caramel} strokeWidth={1.5} />
        <T x={485} y={lane - 28} s={11} a="middle" f={C.crema}>storage</T>
        <T x={244} y={lane - 40} s={11} a="middle" f={C.latte}>door</T>
      </g>
      {/* the door: a frame, and a gate that drops shut at shutdown */}
      <line x1={244} y1={lane - 30} x2={244} y2={lane + 30} stroke={C.latte} strokeWidth={1} opacity={fa(t, 0.1, 0.3)} />
      <rect x={240} y={lane - 30} width={8} height={60 * shut} fill={C.caramel} />
      <circle cx={lerp(lerp(70, 234, bounceIn), 150, bounceOut)} cy={lane} r={6} fill="none" stroke={C.cherryText} strokeWidth={2} opacity={fa(t, 0.3, 0.1)} />
      {[0, 1].map((d) => (
        <circle key={d} cx={lerp(280 + d * 40, 460 + d * 50, drain(d * 0.2))} cy={lane} r={6} fill={C.caramel} opacity={fa(t, 1.4, 0.2)} />
      ))}
      <Reticle x={485} y={lane} w={124} h={52} t={t} at={2.4} />
    </Svg>
  );
}
