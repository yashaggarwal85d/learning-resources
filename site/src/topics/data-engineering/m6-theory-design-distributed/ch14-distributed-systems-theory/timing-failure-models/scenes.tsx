import { useEffect, useState } from 'react';
import { C, Decode, Draw, Plot, Reticle, Svg, T } from '../../../../../reels/kit';
import { easeInOut, easeOut, easeOutBack, lerp, seg } from '../../../../../reels/anim';
import type { StepCtx } from '../../../../../reels/types';

// The chapter's recurring figure (CHAPTER.md): one lane per process, time left to right, a message as an arrow
// between lanes. A filled square under an event is a durable (fsync'd) copy, a hollow one is still in memory.
// Red only for a broken invariant, a crash or a lie. Outcomes follow examples.py: loss breaks write one,
// reordering leaves write two stale, an unflushed restart loses write two.

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

/** A process lane: its name above the left end, a rule that draws itself from x0 to x1. `dead` (0..1) reddens the rest of it from `deadAt`. */
function Lane({ y, name, t, from = 0, x0 = 90, x1 = 580, dead = 0, deadAt = 0, s = 13 }: { y: number; name: string; t: number; from?: number; x0?: number; x1?: number; dead?: number; deadAt?: number; s?: number }) {
  return (
    <g>
      <T x={x0 - 12} y={y + 5} s={s} a="end" f={C.secondary} o={easeOut(seg(t, from, from + 0.4))}>
        {name}
      </T>
      <Draw pts={[[x0, y], [x1, y]]} t={t} from={from} to={from + 0.6} stroke={C.line} w={1.5} pen={false} />
      {dead > 0 && <line x1={deadAt} y1={y} x2={lerp(deadAt, x1, dead)} y2={y} stroke={C.badText} strokeWidth={1.5} strokeDasharray="5 5" />}
    </g>
  );
}

/** A message arrow from a to b over [from, to], a pellet on its tip, a head when it lands. `cut` stops it at that fraction with a red cross. */
function Msg({ a, b, t, from, to, color = C.crema, cut }: { a: Pt; b: Pt; t: number; from: number; to: number; color?: string; cut?: number }) {
  const k = easeInOut(seg(t, from, to)) * (cut ?? 1);
  if (k <= 0) return null;
  const tip: Pt = [lerp(a[0], b[0], k), lerp(a[1], b[1], k)];
  const ang = Math.atan2(b[1] - a[1], b[0] - a[0]);
  const head = (s: number) => `${(b[0] - 9 * Math.cos(ang + s)).toFixed(1)} ${(b[1] - 9 * Math.sin(ang + s)).toFixed(1)}`;
  const done = seg(t, from, to) >= 1;
  return (
    <g>
      <line x1={a[0]} y1={a[1]} x2={tip[0]} y2={tip[1]} stroke={color} strokeWidth={1.6} strokeDasharray={cut !== undefined ? '5 4' : undefined} />
      {!done && <circle cx={tip[0]} cy={tip[1]} r={4.5} fill={C.focus} />}
      {done && cut === undefined && <path d={`M${head(0.45)} L${b[0]} ${b[1]} L${head(-0.45)}`} fill="none" stroke={color} strokeWidth={1.6} />}
      {done && cut !== undefined && <Cross at={tip} />}
    </g>
  );
}

const Cross = ({ at: [x, y], o = 1, r = 7 }: { at: Pt; o?: number; r?: number }) => (
  <path d={`M${x - r} ${y - r} L${x + r} ${y + r} M${x + r} ${y - r} L${x - r} ${y + r}`} stroke={C.badText} strokeWidth={2.2} opacity={o} />
);

/** A write landing on a lane: a dot, and under it a square — filled when durable, hollow while only in memory. `gone` fades the square red. */
function Write({ at: [x, y], k, durable = true, gone = 0 }: { at: Pt; k: number; durable?: boolean; gone?: number }) {
  if (k <= 0) return null;
  const col = gone > 0.5 ? C.badText : C.focus;
  return (
    <g opacity={k * (1 - gone * 0.55)} transform={`translate(0 ${((1 - k) * 6).toFixed(2)})`}>
      <circle cx={x} cy={y} r={5} fill={col} />
      <rect x={x - 6} y={y + 11} width={12} height={12} rx={1.5} fill={durable ? col : 'none'} stroke={col} strokeWidth={1.5} />
    </g>
  );
}

/** A restart on a lane: a gap with a small return arrow. */
const Restart = ({ at: [x, y], k }: { at: Pt; k: number }) =>
  k > 0 ? (
    <g opacity={k}>
      <rect x={x - 14} y={y - 4} width={28} height={8} fill={C.ink} />
      <path d={`M${x - 12} ${y - 10} a12 12 0 1 1 6 10`} fill="none" stroke={C.badText} strokeWidth={1.6} />
      <path d={`M${x - 10} ${y + 2} l4 -2 l-1 5`} fill="none" stroke={C.badText} strokeWidth={1.6} />
    </g>
  ) : null;

// 1 · The protocol in its own lanes: the write lands on the primary, the client hears "acknowledged", the copy
// heads for the backup. Then production supplies a fault the tests never did, and the acknowledgement turns false.
export function Hook({ t }: StepCtx) {
  const ack = easeOut(seg(t, 1.9, 2.3));
  const wrong = easeOut(seg(t, 3.8, 4.1));
  const crash = easeOut(seg(t, 3.3, 3.8));
  return (
    <Svg label="a primary-backup register passes every test and still loses an acknowledged write in production — which untested assumption is the real cause?" h={300}>
      <Lane y={50} name="client" t={t} />
      <Lane y={140} name="primary" t={t} from={0.15} dead={crash} deadAt={330} />
      <Lane y={230} name="backup" t={t} from={0.3} />
      <Msg a={[130, 50]} b={[180, 140]} t={t} from={0.7} to={1.2} />
      <Write at={[180, 140]} k={easeOutBack(seg(t, 1.2, 1.5))} />
      <Msg a={[200, 140]} b={[250, 50]} t={t} from={1.5} to={1.9} />
      <Decode text="acknowledged" t={t} at={1.9} x={262} y={40} s={14} f={wrong > 0.5 ? C.badText : C.focus} w={600} o={ack} />
      {wrong > 0 && <line x1={262} y1={35} x2={262 + 128 * wrong} y2={35} stroke={C.badText} strokeWidth={2} />}
      <Msg a={[210, 140]} b={[400, 230]} t={t} from={2.2} to={3.0} cut={0.55} color={C.secondary} />
      <Cross at={[330, 140]} o={crash} r={9} />
      <T x={300} y={288} s={15} a="middle" f={C.focus} o={easeOut(seg(t, 4.1, 4.6))}>
        which assumption broke?
      </T>
    </Svg>
  );
}

// 2 · The one fault, alone: the copy to the backup is dropped; the client already heard "acknowledged". After the
// pick, the primary goes down, its square reddens, and the lock-on lands on the backup's empty lane.
export function PredictMessageLoss({ t, answer }: StepCtx) {
  const s = useSinceAnswer(answer !== null);
  const on = answer !== null;
  const crash = on ? easeOut(seg(s, 0.2, 0.7)) : 0;
  const gone = on ? easeOut(seg(s, 0.7, 1.1)) : 0;
  return (
    <Svg label="the backup never hears about one write at all, but the client was already told it's acknowledged — does that single fault already lose the write for good?" h={300}>
      <Lane y={50} name="client" t={99} />
      <Lane y={140} name="primary" t={99} dead={crash} deadAt={300} />
      <Lane y={230} name="backup" t={99} />
      <Msg a={[130, 50]} b={[180, 140]} t={99} from={0} to={0.1} />
      <Write at={[180, 140]} k={1} gone={gone} />
      <Msg a={[200, 140]} b={[250, 50]} t={99} from={0} to={0.1} />
      <T x={262} y={40} s={14} f={gone > 0.5 ? C.badText : C.focus} w={600}>
        acknowledged
      </T>
      <Msg a={[210, 140]} b={[400, 230]} t={t} from={0.3} to={1.4} cut={0.55} color={C.secondary} />
      <T x={330} y={182} s={13} f={C.badText} o={easeOut(seg(t, 1.4, 1.8))}>
        dropped
      </T>
      <Cross at={[300, 140]} o={crash} r={9} />
      <T x={300} y={288} s={15} a="middle" f={on ? C.badText : C.focus} o={easeOut(seg(t, 1.8, 2.4))}>
        {on ? 'no copy left anywhere' : 'safe, or already gone?'}
      </T>
      {on && <Reticle x={420} y={230} w={200} h={36} t={s} at={1.3} color={C.badText} />}
    </Svg>
  );
}

// 3 · Four rows, x is how long each message took. A known cap is a solid fence; a hidden cap is a fence the
// protocol can't see; the third row's cap only holds after an unknown moment; the last row has no fence at all.
export function RevealTimingModels({ t }: StepCtx) {
  const rows = [
    { name: 'synchronous', fence: 'solid', d: [222, 260, 236, 290, 248, 300] },
    { name: 'hidden cap', fence: 'hidden', d: [230, 284, 250, 296, 240, 270] },
    { name: 'cap, later', fence: 'later', d: [520, 440, 556, 262, 236, 288] },
    { name: 'asynchronous', fence: 'none', d: [250, 410, 300, 548, 360, 470] },
  ] as const;
  const FX = 330;
  return (
    <Svg label="between a known delay cap and no cap at all, partial synchrony comes in two different shapes — a hidden cap, or a cap that only starts holding after an undetectable moment" h={300}>
      <T x={580} y={24} s={13} a="end" f={C.quiet} o={easeOut(seg(t, 0, 0.4))}>
        delay →
      </T>
      {rows.map((r, i) => {
        const y = 70 + i * 62;
        const start = 0.3 + i * 0.85;
        const fk = easeOut(seg(t, start, start + 0.4));
        return (
          <g key={r.name}>
            <T x={20} y={y + 5} s={13} f={i === 1 || i === 2 ? C.primary : C.secondary} o={easeOut(seg(t, start - 0.2, start + 0.2))}>
              {r.name}
            </T>
            <Draw pts={[[200, y], [580, y]]} t={t} from={start - 0.2} to={start + 0.3} stroke={C.band} w={1.5} pen={false} />
            {r.fence === 'solid' && <line x1={FX} y1={y - 20} x2={FX} y2={lerp(y - 20, y + 20, fk)} stroke={C.focus} strokeWidth={2.5} />}
            {r.fence === 'hidden' && <line x1={FX} y1={y - 20} x2={FX} y2={lerp(y - 20, y + 20, fk)} stroke={C.quiet} strokeWidth={1.5} strokeDasharray="2 5" />}
            {r.fence === 'later' && <line x1={FX} y1={y - 20} x2={FX} y2={lerp(y - 20, y + 20, fk)} stroke={C.focus} strokeWidth={2.5} opacity={easeOut(seg(t, start + 0.5, start + 0.8))} />}
            <Plot pts={r.d.map((x) => [x, y] as Pt)} t={t} start={start} beat={0.11} r={4.5} fill={r.fence === 'none' ? C.secondary : C.focus} />
          </g>
        );
      })}
      <Reticle x={390} y={163} w={380} h={110} t={t} at={4.1} />
    </Svg>
  );
}

// 4 · Each fault class contains the ones before it, drawn as rings growing outward; then the price: outlasting
// silent failures takes one count of machines, outvoting liars takes one more.
export function RevealFaultHierarchy({ t }: StepCtx) {
  const rings = [
    { name: 'crash-stop', box: [190, 128, 220, 46] },
    { name: 'crash-recovery', box: [140, 94, 320, 88] },
    { name: 'omission', box: [90, 60, 420, 130] },
    { name: 'byzantine', box: [40, 26, 520, 172] },
  ];
  return (
    <Svg label="crash-stop, crash-recovery, omission and Byzantine each contain the ones before them — a lying witness costs a protocol strictly more spare machines to outvote than a silent one" h={300}>
      {rings.map((r, i) => {
        const [x, y, w, h] = r.box;
        const k = easeOutBack(seg(t, i * 0.45, i * 0.45 + 0.5));
        const cx = x + w / 2, cy = y + h / 2;
        const red = i === 3;
        return (
          <g key={r.name} opacity={easeOut(seg(t, i * 0.45, i * 0.45 + 0.3))} transform={`translate(${cx} ${cy}) scale(${(0.85 + 0.15 * k).toFixed(3)}) translate(${-cx} ${-cy})`}>
            <rect x={x} y={y} width={w} height={h} rx={8} fill="none" stroke={red ? C.badText : i === 0 ? C.focus : C.secondary} strokeWidth={red ? 2 : 1.5} />
            <T x={x + 12} y={y + 22} s={13} f={red ? C.badText : i === 0 ? C.focus : C.secondary}>
              {r.name}
            </T>
          </g>
        );
      })}
      <T x={20} y={244} s={13} f={C.secondary} o={easeOut(seg(t, 2.2, 2.6))}>
        outlast silence
      </T>
      <T x={20} y={284} s={13} f={C.badText} o={easeOut(seg(t, 2.2, 2.6))}>
        outvote a liar
      </T>
      {[0, 1, 2].map((i) => (
        <rect key={`s${i}`} x={330 + i * 46} y={226} width={28} height={28} rx={3} fill={C.panel} stroke={C.crema} strokeWidth={1.5} opacity={easeOutBack(seg(t, 2.5 + i * 0.2, 2.8 + i * 0.2))} />
      ))}
      {[0, 1, 2, 3].map((i) => (
        <rect key={`l${i}`} x={330 + i * 46} y={264} width={28} height={28} rx={3} fill={i === 3 ? C.focus : C.panel} stroke={C.crema} strokeWidth={1.5} opacity={easeOutBack(seg(t, 3.0 + i * 0.2, 3.3 + i * 0.2))} />
      ))}
      <Reticle x={482} y={278} w={44} h={44} t={t} at={4.1} />
    </Svg>
  );
}

// 5 · A fair-loss link tries the same message three times: one vanishes, two arrive, so the receiver sees it
// twice. Underneath, the bolted-on layer drops the duplicate and hands the app exactly one.
export function RevealLinkModels({ t }: StepCtx) {
  const dedup = easeOut(seg(t, 3.0, 3.4));
  return (
    <Svg label="a fair-loss link only promises an endlessly retried message eventually gets through once — a reliable link's stronger promise is built on top of it, by retrying and deduplicating, not granted by the wire" h={300}>
      <Lane y={40} name="sender" t={t} x0={110} />
      <Lane y={140} name="receiver" t={t} x0={110} from={0.15} />
      {[150, 260, 370].map((x, i) => (
        <Msg key={x} a={[x, 40]} b={[x + 60, 140]} t={t} from={0.6 + i * 0.6} to={1.1 + i * 0.6} cut={i === 0 ? 0.5 : undefined} />
      ))}
      <Write at={[320, 140]} k={easeOut(seg(t, 1.7, 1.9))} />
      <Write at={[430, 140]} k={easeOut(seg(t, 2.3, 2.5))} gone={dedup} />
      <T x={580} y={96} s={13} a="end" f={C.secondary} o={easeOut(seg(t, 1.4, 1.8))}>
        fair-loss
      </T>
      <g opacity={easeOut(seg(t, 2.7, 3.0))}>
        <rect x={110} y={186} width={470} height={34} rx={4} fill={C.panel} stroke={C.line} />
        <T x={345} y={208} s={14} a="middle" f={C.primary}>
          retry + dedup
        </T>
      </g>
      <Lane y={268} name="app" t={t} x0={110} from={2.8} />
      <Msg a={[320, 166]} b={[320, 262]} t={t} from={3.4} to={3.9} color={C.focus} />
      <Draw pts={[[430, 166], [430, 184]]} t={t} from={3.4} to={3.6} stroke={C.badText} w={1.6} pen={false} />
      <Cross at={[430, 178]} o={easeOut(seg(t, 3.6, 3.8))} r={6} />
      <Reticle x={320} y={260} w={40} h={34} t={t} at={4.2} />
    </Svg>
  );
}

// 6 · The same two lines, run three times. Dropped: write one never reaches B and A goes down. Reordered: the two
// copies cross, B keeps the stale one. Restarted: B's unflushed write two is gone after an ordinary restart.
export function RevealLabResults({ t }: StepCtx) {
  const panels = [
    { title: 'dropped', verdict: 'write one gone' },
    { title: 'reordered', verdict: 'write two stale' },
    { title: 'restarted', verdict: 'write two lost' },
  ];
  const X0 = 140, X1 = 420;
  return (
    <Svg label="the identical two-line protocol, run three times in the chapter's own simulator — dropped, reordered, or crash-recovered, it loses an acknowledged write for a different reason each time" h={300}>
      {panels.map((p, i) => {
        const y = i * 100;
        const b = i * 1.4;
        const v = easeOut(seg(t, b + 1.0, b + 1.3));
        return (
          <g key={p.title}>
            <T x={20} y={y + 18} s={13} f={C.primary} o={easeOut(seg(t, b, b + 0.3))}>
              {p.title}
            </T>
            <Lane y={y + 36} name="A" t={t} from={b} x0={X0} x1={X1} dead={i === 0 ? easeOut(seg(t, b + 0.8, b + 1.1)) : 0} deadAt={300} />
            <Lane y={y + 70} name="B" t={t} from={b + 0.1} x0={X0} x1={X1} />
            <T x={580} y={y + 58} s={13} a="end" f={C.badText} o={v}>
              {p.verdict}
            </T>
          </g>
        );
      })}
      {/* dropped */}
      <Write at={[170, 36]} k={easeOut(seg(t, 0.2, 0.4))} />
      <Msg a={[185, 36]} b={[300, 70]} t={t} from={0.3} to={0.8} cut={0.5} color={C.secondary} />
      <Cross at={[300, 36]} o={easeOut(seg(t, 0.8, 1.1))} r={8} />
      {/* reordered: write one leaves first and lands last */}
      <Write at={[170, 136]} k={easeOut(seg(t, 1.6, 1.8))} />
      <Write at={[220, 136]} k={easeOut(seg(t, 1.7, 1.9))} />
      <Msg a={[176, 136]} b={[370, 170]} t={t} from={1.8} to={2.6} color={C.secondary} />
      <Msg a={[226, 136]} b={[290, 170]} t={t} from={1.9} to={2.2} color={C.secondary} />
      <T x={380} y={192} s={13} f={C.badText} o={easeOut(seg(t, 2.4, 2.7))}>
        v1
      </T>
      {/* restarted: write two sits in memory on B, then B restarts */}
      <Write at={[200, 270]} k={easeOut(seg(t, 3.0, 3.2))} />
      <Write at={[270, 270]} k={easeOut(seg(t, 3.2, 3.4))} durable={false} gone={easeOut(seg(t, 3.8, 4.1))} />
      <Restart at={[330, 270]} k={easeOut(seg(t, 3.5, 3.8))} />
    </Svg>
  );
}

// 7 · The four ideas as four small pictures, each replaying its one move: a fence the dots stay behind, the
// rings with the red outer one, a duplicate filtered to one delivery, and one protocol with three red crosses.
export function Recap({ t }: StepCtx) {
  const cell = (i: number) => [i % 2 === 0 ? 0 : 300, i < 2 ? 0 : 150] as const;
  const at = (i: number) => 0.2 + i * 0.9;
  const labels = ['a contract', 'liar, not silence', 'built, not given', 'three breaks'];
  return (
    <Svg label="a model is a contract, not a guess; a lying witness is a different problem than a silent one; a reliable link is built, not given; and one protocol broke three separate ways under three separate real-shaped faults" h={300}>
      {labels.map((l, i) => {
        const [x, y] = cell(i);
        return (
          <T key={l} x={x + 150} y={y + 136} s={13} a="middle" f={i === 2 ? C.focus : C.primary} o={easeOut(seg(t, at(i), at(i) + 0.4))}>
            {l}
          </T>
        );
      })}
      {/* a contract: dots land behind a fence */}
      <line x1={170} y1={30} x2={170} y2={lerp(30, 100, easeOut(seg(t, at(0), at(0) + 0.3)))} stroke={C.focus} strokeWidth={2.5} />
      <Plot pts={[[80, 65], [110, 65], [96, 65], [140, 65], [124, 65]]} t={t} start={at(0) + 0.2} beat={0.1} r={4.5} />
      {/* liar, not silence: nested rings, outer red */}
      {[0, 1, 2].map((j) => {
        const k = easeOut(seg(t, at(1) + j * 0.15, at(1) + j * 0.15 + 0.3));
        const w = 60 + j * 50, h = 30 + j * 26;
        return <rect key={j} x={450 - w / 2} y={65 - h / 2} width={w} height={h} rx={6} fill="none" stroke={j === 2 ? C.badText : C.secondary} strokeWidth={1.5} opacity={k} />;
      })}
      {/* built, not given: two arrivals, one passes the filter */}
      <line x1={40} y1={196} x2={260} y2={196} stroke={C.line} strokeWidth={6} opacity={easeOut(seg(t, at(2), at(2) + 0.3))} />
      <Msg a={[110, 160]} b={[110, 240]} t={t} from={at(2) + 0.1} to={at(2) + 0.6} color={C.focus} />
      <Msg a={[190, 160]} b={[190, 240]} t={t} from={at(2) + 0.2} to={at(2) + 0.7} cut={0.45} color={C.secondary} />
      {/* three breaks: one lane, three red crosses */}
      <Draw pts={[[340, 205], [560, 205]]} t={t} from={at(3)} to={at(3) + 0.3} stroke={C.line} w={1.5} pen={false} />
      {[390, 450, 510].map((x, j) => (
        <Cross key={x} at={[x, 205]} o={easeOut(seg(t, at(3) + 0.3 + j * 0.15, at(3) + 0.45 + j * 0.15))} r={9} />
      ))}
      <line x1={300} y1={14} x2={300} y2={290} stroke={C.band} strokeWidth={1} />
      <line x1={14} y1={150} x2={586} y2={150} stroke={C.band} strokeWidth={1} />
    </Svg>
  );
}

// 8 · The dashboard's two counters read "none" all week. After the pick, the lanes underneath play the two faults
// those counters can't see — crossed copies and an unflushed restart — while the counters stay at "none".
export function ProveIt({ t, answer }: StepCtx) {
  const s = useSinceAnswer(answer !== null);
  const on = answer !== null;
  const r1 = on ? s : -1;
  return (
    <Svg label="a dashboard reports zero dropped messages and zero crashes all week — does that prove the replication protocol's safety promise held the whole time?" h={300}>
      {['drops', 'crashes'].map((n, i) => (
        <g key={n} opacity={easeOut(seg(t, i * 0.3, i * 0.3 + 0.4))}>
          <rect x={40 + i * 280} y={14} width={240} height={74} rx={6} fill={C.panel} stroke={C.line} />
          <T x={60 + i * 280} y={40} s={13} f={C.secondary}>
            {n}
          </T>
          <T x={260 + i * 280} y={74} s={26} a="end" f={C.focus} serif>
            none
          </T>
        </g>
      ))}
      <Lane y={150} name="A" t={t} from={0.6} x0={120} />
      <Lane y={230} name="B" t={t} from={0.7} x0={120} />
      <Write at={[160, 150]} k={easeOut(seg(t, 1.0, 1.2))} />
      <Write at={[210, 150]} k={easeOut(seg(t, 1.1, 1.3))} />
      <T x={300} y={288} s={14} a="middle" f={C.secondary} o={easeOut(seg(t, 1.6, 2.2)) * (on ? 0 : 1)}>
        model held all week?
      </T>
      {on && (
        <g>
          <Msg a={[166, 150]} b={[330, 230]} t={r1} from={0.1} to={0.8} color={C.badText} />
          <Msg a={[216, 150]} b={[260, 230]} t={r1} from={0.2} to={0.5} color={C.badText} />
          <T x={200} y={288} s={13} a="middle" f={C.badText} o={easeOut(seg(s, 0.7, 1.0))}>
            reordered
          </T>
          <Write at={[440, 230]} k={easeOut(seg(s, 1.0, 1.2))} durable={false} gone={easeOut(seg(s, 1.6, 1.9))} />
          <Restart at={[500, 230]} k={easeOut(seg(s, 1.3, 1.6))} />
          <T x={470} y={288} s={13} a="middle" f={C.badText} o={easeOut(seg(s, 1.6, 1.9))}>
            unflushed
          </T>
          <Reticle x={300} y={51} w={540} h={86} t={s} at={2.1} />
        </g>
      )}
    </Svg>
  );
}
