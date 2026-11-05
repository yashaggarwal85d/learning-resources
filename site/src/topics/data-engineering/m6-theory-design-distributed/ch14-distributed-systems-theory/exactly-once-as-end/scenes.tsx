import { useEffect, useState } from 'react';
import { C, Decode, Draw, Reticle, Svg, T } from '../../../../../reels/kit';
import { easeInOut, easeOut, easeOutBack, lerp, seg } from '../../../../../reels/anim';
import type { StepCtx } from '../../../../../reels/types';

// The chapter's space-time diagram for the retry (CHAPTER.md, topic 14): a payment-service lane and a card-processor
// lane; the charge goes down, the processor applies it (a dot), the acknowledgement stops short (lost), the service
// retries and the processor applies it again; the card's charge counter goes to two in red. With an idempotency key
// chip on both requests the second apply is a hollow dot, a no-op. The last strips draw the pipeline as a dashed
// boundary its atomic commit covers, and an email crossing it. Every case is one of examples.py's functions.

type Pt = readonly [number, number];

/** Seconds since the learner answered a predict step (the player's clock has stopped by then), so reveals can animate. */
function useSinceAnswer(on: boolean) {
  const [s, setS] = useState(0);
  useEffect(() => {
    if (!on) {
      setS(0);
      return;
    }
    if (typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) {
      setS(99);
      return;
    }
    let raf = 0;
    const t0 = performance.now();
    const tick = () => {
      const d = (performance.now() - t0) / 1000;
      setS(d);
      if (d < 4) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [on]);
  return s;
}

const Check = ({ at: [x, y], t, from, f = C.focus }: { at: Pt; t: number; from: number; f?: string }) => (
  <Draw pts={[[x - 8, y], [x - 2, y + 7], [x + 10, y - 8]]} t={t} from={from} to={from + 0.3} stroke={f} w={2.4} pen={false} />
);
const Cross = ({ at: [x, y], o }: { at: Pt; o: number }) => (o > 0 ? <path d={`M${x - 7} ${y - 7} l14 14 M${x + 7} ${y - 7} l-14 14`} stroke={C.badText} strokeWidth={2.4} opacity={o} /> : null);

function Lane({ y, name, x0 = 150, x1 = 580, k = 1 }: { y: number; name: string; x0?: number; x1?: number; k?: number }) {
  return (
    <g opacity={k}>
      <T x={x0 - 12} y={y + 5} s={13} a="end" f={C.secondary}>
        {name}
      </T>
      <line x1={x0} y1={y} x2={x1} y2={y} stroke={C.band} strokeWidth={1.2} />
    </g>
  );
}

/** A message from a to b; `stop` < 1 makes it die partway (lost), with a red cross at the stopping point. */
function Msg({ a, b, t, from, to, f = C.secondary, stop = 1, chip }: { a: Pt; b: Pt; t: number; from: number; to: number; f?: string; stop?: number; chip?: string }) {
  const k = Math.min(stop, easeInOut(seg(t, from, to)));
  if (k <= 0) return null;
  const tip: Pt = [lerp(a[0], b[0], k), lerp(a[1], b[1], k)];
  const ang = Math.atan2(b[1] - a[1], b[0] - a[0]);
  const head = (s: number) => `${(b[0] - 8 * Math.cos(ang + s)).toFixed(1)} ${(b[1] - 8 * Math.sin(ang + s)).toFixed(1)}`;
  const done = k >= 1;
  const mid: Pt = [lerp(a[0], b[0], 0.45), lerp(a[1], b[1], 0.45)];
  return (
    <g>
      <line x1={a[0]} y1={a[1]} x2={tip[0]} y2={tip[1]} stroke={f} strokeWidth={1.6} />
      {done && <path d={`M${head(0.45)} L${b[0]} ${b[1]} L${head(-0.45)}`} fill="none" stroke={f} strokeWidth={1.6} />}
      {stop < 1 && k >= stop && <Cross at={tip} o={1} />}
      {chip && k > 0.3 && (
        <g>
          <rect x={mid[0] + 6} y={mid[1] - 10} width={44} height={20} rx={10} fill={C.second} />
          <T x={mid[0] + 28} y={mid[1] + 5} s={13} a="middle" f={C.void} w={600}>
            {chip}
          </T>
        </g>
      )}
    </g>
  );
}

/** An apply on the processor lane: solid when it takes effect, hollow when it is recognised as a repeat. */
const Apply = ({ at: [x, y], k, hollow = false, f = C.focus }: { at: Pt; k: number; hollow?: boolean; f?: string }) =>
  k > 0 ? <circle cx={x} cy={y} r={7 * Math.min(1, k)} fill={hollow ? C.panel : f} stroke={f} strokeWidth={2} /> : null;

function Counter({ at: [x, y], label, n, f = C.focus, k = 1, w = 120 }: { at: Pt; label: string; n: number; f?: string; k?: number; w?: number }) {
  return (
    <g opacity={k}>
      <rect x={x - w / 2} y={y - 30} width={w} height={60} rx={6} fill={C.panel} stroke={f} strokeWidth={1.5} />
      <T x={x} y={y - 8} s={13} a="middle" f={C.secondary}>
        {label}
      </T>
      <T x={x} y={y + 18} s={18} a="middle" f={f} w={600}>
        {String(n)}
      </T>
    </g>
  );
}

const YS = 70, YP = 170;

// 1 · The charge goes down and the processor applies it; the acknowledgement heads back and dies halfway. A timeout
// bar fills on the service lane; the retry goes down and is applied again. The card's counter ticks to two, in red,
// under a pipeline badge that still reads "exactly-once".
export function Hook({ t }: StepCtx) {
  const n = (t > 0.9 ? 1 : 0) + (t > 2.9 ? 1 : 0);
  return (
    <Svg label="a payment request succeeds but its acknowledgement is lost; the client retries believing it failed, and the customer is charged twice" h={300}>
      <Lane y={YS} name="payment service" x1={450} k={easeOut(seg(t, 0, 0.3))} />
      <Lane y={YP} name="card processor" x1={450} k={easeOut(seg(t, 0.1, 0.4))} />
      <Msg a={[170, YS]} b={[220, YP]} t={t} from={0.4} to={0.8} />
      <Apply at={[220, YP]} k={easeOutBack(seg(t, 0.8, 1.0))} />
      <Msg a={[230, YP]} b={[290, YS]} t={t} from={1.0} to={1.6} f={C.focus} stop={0.5} />
      <rect x={170} y={YS - 20} width={170 * easeInOut(seg(t, 0.5, 2.2))} height={6} rx={2} fill={C.second} opacity={0.7} />
      <T x={255} y={YS - 28} s={13} a="middle" f={C.second} o={easeOut(seg(t, 1.6, 1.9))}>
        timeout
      </T>
      <Msg a={[350, YS]} b={[400, YP]} t={t} from={2.4} to={2.8} />
      <T x={360} y={YS + 40} s={13} f={C.secondary} o={easeOut(seg(t, 2.4, 2.7))}>
        retry
      </T>
      <Apply at={[400, YP]} k={easeOutBack(seg(t, 2.8, 3.0))} f={C.badText} />
      <Counter at={[520, 120]} label="charges" n={n} f={n > 1 ? C.badText : C.focus} k={easeOut(seg(t, 0.6, 0.9))} />
      <g opacity={easeOut(seg(t, 3.3, 3.6))}>
        <rect x={140} y={224} width={210} height={28} rx={14} fill="none" stroke={C.quiet} />
        <T x={245} y={243} s={13} a="middle" f={C.quiet}>
          pipeline: exactly-once
        </T>
      </g>
      <Reticle x={520} y={120} w={136} h={76} t={t} at={3.1} color={C.badText} />
    </Svg>
  );
}

// 2 · The hook's last frame, frozen. After the pick, a key chip rides both requests; the second apply turns hollow
// (recognised, a no-op), and the counter falls back to one.
export function PredictFix({ t, answer }: StepCtx) {
  const s = useSinceAnswer(answer !== null);
  const on = answer !== null;
  const fixed = on && s > 1.2;
  return (
    <Svg label="is the pipeline's exactly-once guarantee broken here, or does it simply not cover this failure — and what value would make the retry harmless?" h={300}>
      <Lane y={YS} name="payment service" x1={450} />
      <Lane y={YP} name="card processor" x1={450} />
      <Msg a={[170, YS]} b={[220, YP]} t={1} from={0} to={0.1} chip={on && s > 0.3 ? 'key' : undefined} />
      <Apply at={[220, YP]} k={1} />
      <Msg a={[230, YP]} b={[290, YS]} t={1} from={0} to={0.1} f={C.focus} stop={0.5} />
      <Msg a={[350, YS]} b={[400, YP]} t={1} from={0} to={0.1} chip={on && s > 0.6 ? 'key' : undefined} />
      <Apply at={[400, YP]} k={1} hollow={fixed} f={fixed ? C.focus : C.badText} />
      <Counter at={[520, 120]} label="charges" n={fixed ? 1 : 2} f={fixed ? C.focus : C.badText} />
      {!on && (
        <T x={300} y={250} s={15} a="middle" f={C.secondary} o={easeOut(seg(t, 0.6, 1.1))}>
          what would make the retry harmless?
        </T>
      )}
      {on && (
        <g>
          <T x={400} y={YP + 30} s={13} a="middle" f={C.focus} o={easeOut(seg(s, 1.2, 1.5))}>
            repeat: no-op
          </T>
          <Decode text="a key on the retry, not a stronger broker" t={s} at={1.6} x={300} y={260} s={15} a="middle" f={C.focus} w={600} />
          <Reticle x={400} y={YP} w={44} h={44} t={s} at={1.4} />
        </g>
      )}
    </Svg>
  );
}

// 3 · Two endpoints, each a stack of application, broker and link layers. A message travels down the left stack,
// across, and up the right; the lower layers tick their own small checks as it passes ("faster"), but the one check
// that decides correctness lights only at the application endpoint.
export function RevealE2E({ t }: StepCtx) {
  const L = ['application', 'broker', 'link'];
  const XL = 130, XR = 470, Y = (i: number) => 60 + i * 60;
  const path: Pt[] = [[XL + 70, Y(0)], [XL + 86, Y(0)], [XL + 86, Y(2) + 34], [XR - 86, Y(2) + 34], [XR - 86, Y(0)], [XR - 70, Y(0)]];
  return (
    <Svg label="a function correct only with the application's own knowledge can be implemented only at the endpoints; a lower layer's reliability is at best a performance optimisation" h={300}>
      {L.map((n, i) => (
        <g key={n} opacity={easeOut(seg(t, i * 0.15, 0.3 + i * 0.15))}>
          {[XL, XR].map((x) => (
            <g key={x}>
              <rect x={x - 70} y={Y(i) - 20} width={140} height={40} rx={5} fill={C.panel} stroke={i === 0 ? C.focus : C.line} strokeWidth={i === 0 ? 1.6 : 1} />
              <T x={x} y={Y(i) + 5} s={13} a="middle" f={i === 0 ? C.focus : C.secondary}>
                {n}
              </T>
            </g>
          ))}
        </g>
      ))}
      <Draw pts={path} t={t} from={0.6} to={2.4} stroke={C.focus} w={2} />
      <T x={300} y={Y(1) + 5} s={13} a="middle" f={C.secondary} o={easeOut(seg(t, 1.5, 1.8))}>
        lower checks: faster
      </T>
      <Check at={[XL + 110, Y(2) + 14]} t={t} from={1.2} f={C.secondary} />
      <Check at={[XR - 110, Y(2) + 14]} t={t} from={1.8} f={C.secondary} />
      <Check at={[XR + 92, Y(0)]} t={t} from={2.5} />
      <T x={XR} y={Y(0) - 30} s={13} a="middle" f={C.focus} o={easeOut(seg(t, 2.6, 2.9))}>
        correct here
      </T>
      <Reticle x={XR} y={Y(0)} w={156} h={56} t={t} at={2.8} />
      <Decode text="only the endpoints know" t={t} at={3.4} x={300} y={270} s={15} a="middle" f={C.focus} w={600} />
    </Svg>
  );
}

// 4 · Three rows. Retry: the ack is lost, the message is resent, and two arrive. Never retry: the one send is lost and
// nothing arrives. A third row offers "a third option?" and is struck through.
export function RevealAtLeastOnce({ t }: StepCtx) {
  const yA = 70, yB = 160;
  return (
    <Svg label="on a lossy link, retrying risks a duplicate; not retrying risks losing the message; there is no third option" h={300}>
      <T x={20} y={yA + 5} s={13} f={C.primary}>
        retry
      </T>
      <line x1={110} y1={yA + 20} x2={560} y2={yA + 20} stroke={C.band} />
      <Msg a={[130, yA - 10]} b={[260, yA + 20]} t={t} from={0.2} to={0.6} />
      <Apply at={[260, yA + 20]} k={easeOutBack(seg(t, 0.6, 0.8))} />
      <Msg a={[270, yA + 20]} b={[400, yA - 10]} t={t} from={0.8} to={1.3} f={C.focus} stop={0.45} />
      <Msg a={[330, yA - 10]} b={[460, yA + 20]} t={t} from={1.4} to={1.8} />
      <Apply at={[460, yA + 20]} k={easeOutBack(seg(t, 1.8, 2.0))} f={C.badText} />
      <T x={480} y={yA - 6} s={13} f={C.badText} o={easeOut(seg(t, 1.9, 2.2))}>
        maybe twice
      </T>
      <T x={20} y={yB + 5} s={13} f={C.primary} o={easeOut(seg(t, 2.0, 2.3))}>
        never retry
      </T>
      <line x1={110} y1={yB + 20} x2={560} y2={yB + 20} stroke={C.band} opacity={easeOut(seg(t, 2.0, 2.3))} />
      <Msg a={[130, yB - 10]} b={[260, yB + 20]} t={t} from={2.3} to={2.8} stop={0.55} />
      <circle cx={260} cy={yB + 20} r={7} fill="none" stroke={C.badText} strokeDasharray="3 3" opacity={easeOut(seg(t, 2.8, 3.0))} />
      <T x={480} y={yB - 6} s={13} f={C.badText} o={easeOut(seg(t, 2.9, 3.2))}>
        maybe never
      </T>
      <T x={300} y={250} s={14} a="middle" f={C.secondary} o={easeOut(seg(t, 3.3, 3.6))}>
        a third option?
      </T>
      <Draw pts={[[230, 245], [370, 245]]} t={t} from={3.7} to={4.0} stroke={C.badText} w={2.2} pen={false} />
    </Svg>
  );
}

/** One mini run of the hook: request, apply, lost ack, retry, second apply; `key` puts chips on both and hollows the second. */
function MiniRun({ x0, t, withKey, from }: { x0: number; t: number; withKey: boolean; from: number }) {
  const ys = 80, yp = 170;
  const f = (d: number) => from + d;
  const second = easeOutBack(seg(t, f(1.6), f(1.8)));
  return (
    <g>
      <line x1={x0} y1={ys} x2={x0 + 240} y2={ys} stroke={C.band} />
      <line x1={x0} y1={yp} x2={x0 + 240} y2={yp} stroke={C.band} />
      <Msg a={[x0 + 20, ys]} b={[x0 + 60, yp]} t={t} from={f(0)} to={f(0.4)} chip={withKey ? 'key' : undefined} />
      <Apply at={[x0 + 60, yp]} k={easeOutBack(seg(t, f(0.4), f(0.6)))} />
      <Msg a={[x0 + 70, yp]} b={[x0 + 120, ys]} t={t} from={f(0.6)} to={f(1.0)} f={C.focus} stop={0.5} />
      <Msg a={[x0 + 140, ys]} b={[x0 + 180, yp]} t={t} from={f(1.2)} to={f(1.6)} chip={withKey ? 'key' : undefined} />
      <Apply at={[x0 + 180, yp]} k={second} hollow={withKey} f={withKey ? C.focus : C.badText} />
    </g>
  );
}

// 5 · The hook's retry run twice, side by side: on the left with no key, two solid applies and a red "charged twice";
// on the right with the same key on both requests, the second apply hollow and "charged once".
export function RevealShopCharge({ t }: StepCtx) {
  return (
    <Svg label="the identical retry run twice: without a key both requests charge; with the same key on both, the second is recognized as a repeat" h={300}>
      <T x={150} y={36} s={14} a="middle" f={C.primary} w={600}>
        no key
      </T>
      <T x={450} y={36} s={14} a="middle" f={C.primary} w={600}>
        same key on both
      </T>
      <MiniRun x0={30} t={t} withKey={false} from={0.2} />
      <MiniRun x0={330} t={t} withKey from={1.6} />
      <T x={150} y={220} s={13} a="middle" f={C.badText} o={easeOut(seg(t, 2.0, 2.3))}>
        charged twice
      </T>
      <T x={450} y={220} s={13} a="middle" f={C.focus} o={easeOut(seg(t, 3.4, 3.7))}>
        charged once
      </T>
      <Reticle x={510} y={170} w={40} h={40} t={t} at={3.5} />
      <Decode text="one difference: the key" t={t} at={3.8} x={300} y={270} s={15} a="middle" f={C.focus} w={600} />
    </Svg>
  );
}

// 6 · The same message arrives again and again at a ledger. A "deliveries" counter climbs with every arrival; the
// ledger's "effect" counter takes the first and stays at one while each later arrival bounces off its key check.
export function RevealEffect({ t }: StepCtx) {
  const arrivals = [0.4, 1.2, 2.0, 2.8];
  const n = arrivals.filter((a) => t > a + 0.4).length;
  return (
    <Svg label="delivery stays at-least-once throughout; applying the message twice now has the same effect as once, which is what exactly-once actually names" h={300}>
      <T x={40} y={40} s={13} f={C.secondary}>
        at-least-once delivery
      </T>
      {arrivals.map((a, i) => {
        const k = easeInOut(seg(t, a, a + 0.4));
        const x = lerp(60, 270, k);
        const bounce = i > 0 ? easeOut(seg(t, a + 0.4, a + 0.7)) : easeOut(seg(t, a + 0.4, a + 0.6)) * 0.01;
        const gone = i > 0 ? bounce >= 1 : t > a + 0.6;
        return k > 0 && !gone ? (
          <g key={i} opacity={1 - bounce * 0.8}>
            <rect x={x - 22 - bounce * 30} y={100 - 10} width={44} height={20} rx={10} fill={C.second} />
            <T x={x - bounce * 30} y={105} s={13} a="middle" f={C.void} w={600}>
              key
            </T>
          </g>
        ) : null;
      })}
      <rect x={300} y={60} width={110} height={80} rx={6} fill={C.panel} stroke={C.focus} strokeWidth={1.6} />
      <T x={355} y={92} s={13} a="middle" f={C.focus}>
        ledger
      </T>
      <T x={355} y={116} s={13} a="middle" f={C.secondary}>
        checks the key
      </T>
      <Counter at={[180, 210]} label="deliveries" n={n} f={C.second} w={130} />
      <Counter at={[420, 210]} label="effect" n={Math.min(1, n)} f={C.focus} w={130} />
      <Decode text="twice costs the same as once" t={t} at={3.4} x={300} y={286} s={15} a="middle" f={C.focus} w={600} />
      <Reticle x={420} y={210} w={146} h={76} t={t} at={3.8} />
    </Svg>
  );
}

// 7 · Top: a Kafka transaction box holding "output" and "offset"; the commit line sweeps and both turn solid at the
// same instant. Beside it the non-atomic version: output lands, a crash hits, the offset never does (red). Bottom: a
// Flink lane with checkpoint barriers; an external write pre-commits at one barrier and commits when that checkpoint
// completes.
export function RevealAtomicCommit({ t }: StepCtx) {
  const both = t > 1.3;
  const chip = (x: number, y: number, label: string, solid: boolean, f = C.focus, dashed = false, k = 1) =>
    k > 0 ? (
      <g opacity={k}>
        <rect x={x - 42} y={y - 13} width={84} height={26} rx={4} fill={solid ? f : C.panel} stroke={f} strokeWidth={1.4} strokeDasharray={dashed ? '4 3' : undefined} />
        <T x={x} y={y + 5} s={13} a="middle" f={solid ? C.void : f} w={solid ? 600 : 400}>
          {label}
        </T>
      </g>
    ) : null;
  const yF = 210;
  return (
    <Svg label="Kafka transactions commit output and offsets as one atomic unit; Flink's two-phase-commit sink pre-commits at a checkpoint and commits once it succeeds" h={300}>
      <T x={30} y={30} s={13} f={C.primary}>
        Kafka transaction
      </T>
      <rect x={30} y={44} width={230} height={70} rx={6} fill="none" stroke={C.focus} strokeWidth={1.4} />
      {chip(95, 79, 'output', both, C.focus, false, easeOut(seg(t, 0.2, 0.5)))}
      {chip(195, 79, 'offset', both, C.focus, false, easeOut(seg(t, 0.4, 0.7)))}
      <line x1={lerp(30, 260, easeInOut(seg(t, 0.8, 1.3)))} y1={44} x2={lerp(30, 260, easeInOut(seg(t, 0.8, 1.3)))} y2={114} stroke={C.focus} strokeWidth={2} opacity={t > 0.8 && t < 1.4 ? 1 : 0} />
      <T x={145} y={134} s={13} a="middle" f={C.focus} o={easeOut(seg(t, 1.3, 1.6))}>
        both or neither
      </T>
      <T x={330} y={30} s={13} f={C.secondary} o={easeOut(seg(t, 1.6, 1.9))}>
        without it
      </T>
      {chip(385, 79, 'output', true, C.secondary, false, easeOut(seg(t, 1.8, 2.0)))}
      <line x1={438} y1={56} x2={438} y2={102} stroke={C.badText} strokeWidth={2.4} opacity={easeOut(seg(t, 2.1, 2.3))} />
      {chip(500, 79, 'offset', false, C.badText, true, easeOut(seg(t, 2.3, 2.5)))}
      <T x={440} y={134} s={13} a="middle" f={C.badText} o={easeOut(seg(t, 2.4, 2.7))}>
        crash: output, no offset
      </T>
      <line x1={20} y1={156} x2={580} y2={156} stroke={C.band} opacity={easeOut(seg(t, 2.6, 2.8))} />
      <g opacity={easeOut(seg(t, 2.7, 3.0))}>
        <T x={30} y={yF + 5} s={13} f={C.primary}>
          Flink sink
        </T>
        <line x1={130} y1={yF} x2={570} y2={yF} stroke={C.band} />
        {[200, 340, 480].map((x) => (
          <line key={x} x1={x} y1={yF - 18} x2={x} y2={yF + 18} stroke={C.secondary} strokeWidth={2} />
        ))}
        <T x={200} y={yF + 36} s={13} a="middle" f={C.secondary}>
          checkpoint
        </T>
      </g>
      {chip(270, yF, t > 3.8 ? 'commit' : 'pre-commit', t > 3.8, C.focus, t <= 3.8, easeOutBack(seg(t, 3.0, 3.3)))}
      <Check at={[340, yF - 30]} t={t} from={3.6} />
      <T x={410} y={yF + 36} s={13} a="middle" f={C.focus} o={easeOut(seg(t, 3.7, 4.0))}>
        checkpoint done
      </T>
    </Svg>
  );
}

// 8 · The pipeline as a dashed boundary holding three small marks: a transaction, a checkpointed sink, a table
// pointer swap. An email leaves across the boundary; a rollback arrow inside reaches for it and stops at the line.
export function RevealBoundary({ t }: StepCtx) {
  const out = easeInOut(seg(t, 1.6, 2.2));
  return (
    <Svg label="a table-format commit is the third atomic-commit route; none of the three reach an effect already outside the pipeline's own transaction" h={300}>
      <rect x={30} y={40} width={330} height={190} rx={10} fill="none" stroke={C.focus} strokeWidth={1.6} strokeDasharray="8 6" opacity={easeOut(seg(t, 0, 0.4))} />
      <T x={46} y={64} s={13} f={C.focus} o={easeOut(seg(t, 0.1, 0.4))}>
        the atomic commit covers this
      </T>
      {['transaction', 'checkpoint', 'pointer swap'].map((n, i) => (
        <g key={n} opacity={easeOutBack(seg(t, 0.4 + i * 0.3, 0.7 + i * 0.3))}>
          <rect x={60 + i * 98} y={100} width={88} height={34} rx={5} fill={C.panel} stroke={C.secondary} />
          <T x={104 + i * 98} y={122} s={13} a="middle" f={C.secondary}>
            {n === 'pointer swap' ? 'pointer' : n === 'transaction' ? 'txn' : 'sink'}
          </T>
        </g>
      ))}
      <Check at={[80, 170]} t={t} from={1.3} />
      <line x1={250} y1={190} x2={lerp(250, 500, out)} y2={190} stroke={C.badText} strokeWidth={2} />
      {out > 0 && (
        <g transform={`translate(${lerp(250, 500, out).toFixed(1)} 190)`}>
          <rect x={-20} y={-13} width={40} height={26} rx={3} fill={C.panel} stroke={C.badText} strokeWidth={1.6} />
          <path d="M-20 -13 L0 2 L20 -13" fill="none" stroke={C.badText} strokeWidth={1.4} />
        </g>
      )}
      <T x={500} y={226} s={13} a="middle" f={C.badText} o={easeOut(seg(t, 2.1, 2.4))}>
        email sent
      </T>
      <Draw pts={[[200, 170], [356, 170]]} t={t} from={2.6} to={3.1} stroke={C.secondary} w={1.6} dash="4 4" />
      <Cross at={[362, 170]} o={easeOut(seg(t, 3.1, 3.3))} />
      <T x={200} y={160} s={13} f={C.secondary} o={easeOut(seg(t, 2.6, 2.9))}>
        rollback
      </T>
      <Decode text="outside the boundary, nothing reaches" t={t} at={3.5} x={300} y={278} s={15} a="middle" f={C.focus} w={600} />
      <Reticle x={362} y={190} w={44} h={80} t={t} at={3.4} color={C.badText} />
    </Svg>
  );
}

// 9 · Four panels build in turn: two arrivals of one message; a solid and a hollow apply; two chips joined by one
// commit line; a red arrow crossing a dashed boundary.
export function Recap({ t }: StepCtx) {
  const P = [[20, 14], [310, 14], [20, 140], [310, 140]] as const;
  const k = (i: number) => easeOut(seg(t, 0.2 + i * 0.7, 0.6 + i * 0.7));
  const box = (i: number, label: string) => (
    <g opacity={k(i)}>
      <rect x={P[i][0]} y={P[i][1]} width={270} height={112} rx={6} fill="none" stroke={C.line} />
      <T x={P[i][0] + 135} y={P[i][1] + 100} s={13} a="middle" f={C.primary}>
        {label}
      </T>
    </g>
  );
  return (
    <Svg label="delivery is at-least-once at best; exactly-once is that plus an idempotent write; an atomic commit closes the crash window inside the pipeline, not outside it" h={300}>
      {box(0, 'at-least-once, at best')}
      <g opacity={k(0)}>
        <circle cx={P[0][0] + 110} cy={P[0][1] + 44} r={8} fill={C.focus} />
        <circle cx={P[0][0] + 160} cy={P[0][1] + 44} r={8} fill={C.second} opacity={easeOut(seg(t, 0.6, 0.8))} />
      </g>
      {box(1, 'plus an idempotent write')}
      <g opacity={k(1)}>
        <circle cx={P[1][0] + 110} cy={P[1][1] + 44} r={8} fill={C.focus} />
        <circle cx={P[1][0] + 160} cy={P[1][1] + 44} r={8} fill={C.panel} stroke={C.focus} strokeWidth={2} />
      </g>
      {box(2, 'atomic commit, inside')}
      <g opacity={k(2)}>
        <rect x={P[2][0] + 60} y={P[2][1] + 30} width={64} height={24} rx={4} fill={t > 2.0 ? C.focus : C.panel} stroke={C.focus} />
        <rect x={P[2][0] + 146} y={P[2][1] + 30} width={64} height={24} rx={4} fill={t > 2.0 ? C.focus : C.panel} stroke={C.focus} />
      </g>
      {box(3, 'outside: it does not reach')}
      <g opacity={k(3)}>
        <line x1={P[3][0] + 135} y1={P[3][1] + 16} x2={P[3][0] + 135} y2={P[3][1] + 76} stroke={C.focus} strokeDasharray="6 5" />
        <Draw pts={[[P[3][0] + 70, P[3][1] + 46], [P[3][0] + 210, P[3][1] + 46]]} t={t} from={2.5} to={2.9} stroke={C.badText} w={2} />
      </g>
      <Reticle x={P[1][0] + 135} y={P[1][1] + 56} w={276} h={118} t={t} at={3.6} />
    </Svg>
  );
}

// 10 · The retry fans out to two places: the database, which checks the key and turns the repeat hollow, and an
// email service, which checks nothing. After the pick, the email service's second send lands solid and red.
export function ProveIt({ t, answer }: StepCtx) {
  const s = useSinceAnswer(answer !== null);
  const on = answer !== null;
  const src: Pt = [110, 150];
  return (
    <Svg label="a team adds an idempotency key to every write and declares every retry safe everywhere — is that true?" h={300}>
      <rect x={40} y={128} width={140} height={44} rx={6} fill={C.panel} stroke={C.primary} strokeWidth={1.4} />
      <T x={110} y={155} s={13} a="middle" f={C.primary}>
        retried step
      </T>
      <rect x={400} y={48} width={160} height={50} rx={6} fill={C.panel} stroke={C.focus} strokeWidth={1.4} opacity={easeOut(seg(t, 0.2, 0.5))} />
      <T x={480} y={78} s={13} a="middle" f={C.focus}>
        database: checks key
      </T>
      <rect x={400} y={200} width={160} height={50} rx={6} fill={C.panel} stroke={C.secondary} strokeWidth={1.4} opacity={easeOut(seg(t, 0.3, 0.6))} />
      <T x={480} y={230} s={13} a="middle" f={C.secondary}>
        email: checks nothing
      </T>
      <Msg a={[src[0] + 70, src[1] - 10]} b={[398, 73]} t={t} from={0.6} to={1.1} chip="key" />
      <Msg a={[src[0] + 70, src[1] + 10]} b={[398, 225]} t={t} from={0.8} to={1.3} />
      <Apply at={[380, 30]} k={easeOutBack(seg(t, 1.1, 1.3))} />
      <Apply at={[352, 30]} k={easeOutBack(seg(t, 1.4, 1.6))} hollow />
      <T x={330} y={35} s={13} a="end" f={C.focus} o={easeOut(seg(t, 1.5, 1.8))}>
        repeat ignored
      </T>
      <Apply at={[380, 268]} k={easeOutBack(seg(t, 1.3, 1.5))} f={C.secondary} />
      {!on && (
        <T x={210} y={260} s={15} a="middle" f={C.secondary} o={easeOut(seg(t, 1.8, 2.3))}>
          every retry safe?
        </T>
      )}
      {on && (
        <g>
          <Apply at={[352, 268]} k={easeOutBack(seg(s, 0.4, 0.6))} f={C.badText} />
          <T x={330} y={273} s={13} a="end" f={C.badText} o={easeOut(seg(s, 0.6, 0.9))}>
            second email sent
          </T>
          <Decode text="a key helps only where it is checked" t={s} at={1.0} x={300} y={294} s={14} a="middle" f={C.focus} w={600} />
          <Reticle x={366} y={268} w={60} h={34} t={s} at={1.2} color={C.badText} />
        </g>
      )}
    </Svg>
  );
}
