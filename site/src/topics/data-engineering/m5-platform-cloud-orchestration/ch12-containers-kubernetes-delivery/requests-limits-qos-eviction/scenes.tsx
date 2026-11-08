import { useEffect, useState } from 'react';
import { Bar, C, Plot, Svg, T } from '../../../../../reels/kit';
import type { StepCtx } from '../../../../../reels/types';
import { clamp, easeInOut, easeOut, easeOutBack, lerp, seg } from '../../../../../reels/anim';

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

/** A number counted up to its final value, with fixed decimals and thousands separators. */
function num(v: number, d = 0) {
  return v.toLocaleString('en-US', { minimumFractionDigits: d, maximumFractionDigits: d });
}

/** A label-left / value-right row, stacked vertically with generous gaps (DESIGN.md, phone text scaling).
 * `k` fades it in and slides it up a little; the value is whatever string the scene passes (a count in progress). */
function Row({ y, label, value, valueColor = C.crema, big = false, k = 1 }: { y: number; label: string; value: string; valueColor?: string; big?: boolean; k?: number }) {
  return (
    <g opacity={k} transform={`translate(0 ${((1 - k) * 10).toFixed(2)})`}>
      <T x={25} y={y} s={15} f={C.latte}>
        {label}
      </T>
      <T x={575} y={y} s={big ? 22 : 17} f={valueColor} a="end" w={600}>
        {value}
      </T>
    </g>
  );
}

/** A verdict tick at the right edge, drawn in by `k`. */
function Tick({ y, k, f = C.focus }: { y: number; k: number; f?: string }) {
  return <path d={`M540 ${y} l8 8 l16 -18`} fill="none" stroke={f} strokeWidth={3} strokeDasharray="40" strokeDashoffset={40 * (1 - k)} />;
}

/** A time bar that grows to its share over `k`; its figure fades in once the bar is most of the way there. */
function timeBar(x: number, y: number, frac: number, display: string, label: string, fill: string, k: number) {
  return (
    <g key={label} opacity={k > 0 ? 1 : 0}>
      <T x={x} y={y - 20} s={13} f={C.latte} o={clamp(k * 3, 0, 1)}>
        {label}
      </T>
      <Bar x={x} y={y} w={340 * frac * k} h={20} full={340} fill={fill} />
      <T x={x} y={y + 38} s={13} f={C.crema} o={seg(k, 0.6, 1)}>
        {display}
      </T>
    </g>
  );
}

/** Two timed rows that count up, each with a bar under it scaled to the slower one. */
function TwoTimes({ t, rows, max }: { t: number; rows: [string, number, number, string][]; max: number }) {
  return (
    <g>
      {rows.map(([label, ms, d, color], i) => {
        const k = easeOut(seg(t, 0.2 + i * 1.1, 0.8 + i * 1.1));
        const c = easeOut(seg(t, 0.3 + i * 1.1, 1.3 + i * 1.1));
        const y = 60 + i * 60;
        return (
          <g key={label}>
            <Row y={y} label={label} value={`${num(ms * c, d)} ms`} valueColor={color} big k={k} />
            <rect x={25} y={y + 14} width={k > 0 ? Math.max(3, 550 * (ms / max) * c) : 0} height={6} rx={3} fill={color} opacity={0.8} />
          </g>
        );
      })}
    </g>
  );
}

/** A predict step's verdict, sliding up into place once the learner has answered. */
function Verdict({ answer, text, y = 184, f = C.focus }: { answer: number | null; text: string; y?: number; f?: string }) {
  const s = useSinceAnswer(answer !== null);
  const v = answer !== null ? easeOut(seg(s, 0.1, 0.6)) : 0;
  if (answer === null) return null;
  return (
    <T x={300} y={lerp(y + 8, y, v)} s={15} f={f} a="middle" o={v}>
      {text}
    </T>
  );
}

/** A Row whose "?" becomes the answer once the learner has answered, underlined as it lands. */
function AnswerRow({ y, label, answer, value, k, f = C.focus }: { y: number; label: string; answer: number | null; value: string; k: number; f?: string }) {
  const s = useSinceAnswer(answer !== null);
  const u = answer !== null ? easeOut(seg(s, 0.2, 0.7)) : 0;
  const uw = Math.min(250, value.length * 10.7);
  return (
    <g>
      <Row y={y} label={label} value={answer !== null ? value : '?'} valueColor={answer !== null ? f : C.crema} k={k} />
      {answer !== null && <rect x={575 - uw * u} y={y + 12} width={uw * u} height={3} fill={f} />}
    </g>
  );
}

/** Twelve rows' values in physical order: one column matched to row order, one scattered across it. */
/** A cell with a centred label. */
function Cell({ x, y, w, h = 28, label, o = 1, stroke = C.mocha, f = C.crema }: { x: number; y: number; w: number; h?: number; label: string; o?: number; stroke?: string; f?: string }) {
  return (
    <g opacity={o}>
      <rect x={x} y={y} width={w} height={h} rx={4} fill={C.cocoa} stroke={stroke} strokeWidth={1.5} />
      <T x={x + w / 2} y={y + h / 2 + 4.5} s={12} f={f} a="middle">
        {label}
      </T>
    </g>
  );
}
/** A small cross drawn by `k`. */
function Cross({ x, y, k }: { x: number; y: number; k: number }) {
  return <path d={`M${x - 7} ${y - 7} l14 14 m0 -14 l-14 14`} stroke={C.cherryText} strokeWidth={2.5} opacity={k} />;
}

/** A small tick at (x, y), drawn by `k`. */
function MiniTick({ x, y, k, f = C.focus }: { x: number; y: number; k: number; f?: string }) {
  return <path d={`M${x} ${y} l4 4 l8 -9`} fill="none" stroke={f} strokeWidth={2} strokeDasharray="20" strokeDashoffset={20 * (1 - k)} />;
}
/** A small padlock at (x, y), drawn in by `k`. */
function Lock({ x, y, k, f = C.second }: { x: number; y: number; k: number; f?: string }) {
  return (
    <g opacity={k}>
      <path d={`M${x + 3} ${y} v-4 a5 5 0 0 1 10 0 v4`} fill="none" stroke={f} strokeWidth={2} />
      <rect x={x} y={y} width={16} height={12} rx={2} fill={f} />
    </g>
  );
}
/** A request arrow from (x1, y) toward x2, drawn by `k`, with a small label above it. */
function Req({ x1, x2, y, k, label, f = C.crema, back = 0 }: { x1: number; x2: number; y: number; k: number; label?: string; f?: string; back?: number }) {
  const x = lerp(x1, x2, k) - (x2 - x1) * 0.35 * back;
  return (
    <g opacity={k > 0 ? 1 : 0}>
      <line x1={x1} y1={y} x2={x} y2={y} stroke={f} strokeWidth={1.8} />
      <path d={`M${x} ${y} l${back > 0 ? 8 : -8} -5 v10 z`} fill={f} />
      {label && (
        <T x={(x1 + x2) / 2} y={y - 9} s={11} f={f} a="middle">
          {label}
        </T>
      )}
    </g>
  );
}
function Pip({ x, y, o = 1, f = C.second, s = 10 }: { x: number; y: number; o?: number; f?: string; s?: number }) {
  return <rect x={x - s / 2} y={y - s / 2} width={s} height={s} rx={2} fill={f} opacity={o} />;
}

function Hole({ x, y, w, h = 28, o = 1, stroke = C.mocha }: { x: number; y: number; w: number; h?: number; o?: number; stroke?: string }) {
  return <rect x={x} y={y} width={w} height={h} rx={4} fill="none" stroke={stroke} strokeWidth={1.5} strokeDasharray="4 3" opacity={o} />;
}
/** A fan line from (x1, y1) to (x2, y2), drawn by `k`, ending in a dot. */
/** A fan line from (x1, y1) to (x2, y2), drawn by `k`, ending in a dot. */
function Fan({ x1, y1, x2, y2, k, f = C.crema }: { x1: number; y1: number; x2: number; y2: number; k: number; f?: string }) {
  if (k <= 0) return null;
  const x = lerp(x1, x2, k);
  const y = lerp(y1, y2, k);
  return (
    <g>
      <line x1={x1} y1={y1} x2={x} y2={y} stroke={f} strokeWidth={1.6} />
      <circle cx={x} cy={y} r={3} fill={f} />
    </g>
  );
}

// Every value here is examples.py's own or its SOURCES.md's: the Guaranteed container's request and limit of 200, the
// Burstable one's 100 against 200, oom_score_adj of -997 for Guaranteed and 1000 for BestEffort with Burstable between, the
// pending priority 10 against victims at 1 and 2 and the refused 5 against 5, and in-place resize stable since 1.35. Memory
// heights are drawn as shapes. These steps are short, so each scene runs its own clock a little faster (t = t0 times a factor).

/** A pod in a node bin: a dashed request outline, a usage fill drawn as a thick-stroked block, a limit tick above. */
function PodCol({ x, base, req, use, lim, o = 1, f = C.latte }: { x: number; base: number; req: number; use: number; lim: number; o?: number; f?: string }) {
  return (
    <g opacity={o}>
      <line x1={x - 6} y1={base - lim} x2={x + 86} y2={base - lim} stroke={C.cherryText} strokeWidth={1.4} strokeDasharray="5 3" />
      {use > 0 && <rect x={x + 8} y={base - use} width={64} height={use} rx={2} fill={C.cocoa} stroke={f} strokeWidth={2} />}
      {req > 0 && <rect x={x} y={base - req} width={80} height={req} rx={2} fill="none" stroke={C.second} strokeWidth={1.4} strokeDasharray="3 3" />}
    </g>
  );
}

const QOS = ['Guaranteed', 'Burstable', 'BestEffort'];

// 0 · Hook. A node bin, three pods under one shared limit line: Guaranteed using exactly its request, Burstable over its own,
// BestEffort with no request at all. The node's outline turns red, low on memory, and two deciders appear: kubelet, kernel.
export function Hook({ t: t0 }: StepCtx) {
  const t = t0 * 1.8;
  const k = (d: number) => easeOut(seg(t, d, d + 0.35));
  const g = easeOut(seg(t, 0.3, 1.0));
  const low = t > 1.4;
  return (
    <Svg label="A node runs low on memory; three pods carry the same limit. Who dies first?" h={250}>
      <rect x={25} y={40} width={400} height={160} rx={6} fill="none" stroke={low ? C.cherryText : C.mocha} strokeWidth={1.6} opacity={k(0)} />
      {low && (
        <T x={25} y={30} s={11} f={C.cherryText} o={k(1.4)}>
          node memory running low
        </T>
      )}
      <PodCol x={60} base={196} req={100} use={100 * g} lim={130} o={k(0.1)} />
      <PodCol x={180} base={196} req={50} use={80 * g} lim={130} o={k(0.2)} />
      <PodCol x={300} base={196} req={0} use={40 * g} lim={130} o={k(0.3)} />
      {QOS.map((q, i) => (
        <T key={q} x={100 + i * 120} y={218} s={11} f={C.latte} a="middle" o={k(0.5 + i * 0.1)}>
          {q}
        </T>
      ))}
      <Cell x={450} y={70} w={125} label="kubelet" o={k(2.2)} />
      <Cell x={450} y={130} w={125} label="kernel" o={k(2.6)} />
      {t > 3.0 && (
        <T x={512} y={180} s={15} f={C.taupe} a="middle" o={k(3.0)}>
          ?
        </T>
      )}
      {t > 3.6 && (
        <T x={25} y={242} s={12} f={C.crema} o={k(3.6)}>
          two systems, two separate decisions
        </T>
      )}
    </Svg>
  );
}

// 1 · Predict. The same three pods: which is evicted first? Once answered, BestEffort and Burstable fall into one dashed
// bucket, over request, sorted by priority then overage, and Guaranteed is labelled last.
export function PredictEvictFirst({ t, answer }: StepCtx) {
  const s = useSinceAnswer(answer !== null);
  const v = answer !== null ? easeOut(seg(s, 0.1, 0.6)) : 0;
  const w = answer !== null ? easeOut(seg(s, 0.6, 1.0)) : 0;
  const k = (d: number) => easeOut(seg(t, d, d + 0.3));
  return (
    <Svg label="Guaranteed, Burstable over its request, BestEffort — which does the kubelet evict first?" h={250}>
      <rect x={25} y={40} width={400} height={150} rx={6} fill="none" stroke={C.mocha} strokeWidth={1.5} opacity={k(0)} />
      <PodCol x={60} base={186} req={100} use={100} lim={126} o={k(0.1)} f={v > 0.5 ? C.focus : C.latte} />
      <PodCol x={180} base={186} req={50} use={80} lim={126} o={k(0.2)} f={v > 0.5 ? C.cherryText : C.latte} />
      <PodCol x={300} base={186} req={0} use={40} lim={126} o={k(0.3)} f={v > 0.5 ? C.cherryText : C.latte} />
      {QOS.map((q, i) => (
        <T key={q} x={100 + i * 120} y={208} s={11} f={C.latte} a="middle" o={k(0.4)}>
          {q}
        </T>
      ))}
      {answer === null && t > 0.8 && (
        <T x={500} y={120} s={15} f={C.taupe} a="middle" o={k(0.8)}>
          ?
        </T>
      )}
      <rect x={170} y={44} width={225} height={150} rx={6} fill="none" stroke={C.cherryText} strokeWidth={1.6} strokeDasharray="5 4" opacity={v} />
      {answer !== null && (
        <T x={440} y={100} s={11} f={C.cherryText} o={w}>
          over request:
        </T>
      )}
      {answer !== null && (
        <T x={440} y={122} s={11} f={C.cherryText} o={w}>
          priority, overage
        </T>
      )}
      <Verdict answer={answer} text="one bucket, then priority decides" y={236} />
    </Svg>
  );
}

// 2 · Request and limit. Left: the scheduler drops three requests into a node bin until they fit; their dashed limits stack
// up past the bin's top, overcommit. Right: one pod's usage climbs to its red limit line and is stopped there.
export function RequestVsLimit({ t: t0 }: StepCtx) {
  const t = t0 * 1.8;
  const k = (d: number) => easeOut(seg(t, d, d + 0.35));
  const reqs = [40, 50, 30];
  let acc = 0;
  const climb = easeInOut(seg(t, 2.0, 3.0));
  return (
    <Svg label="The scheduler places by request; the kubelet and kernel enforce the limit" h={250}>
      <T x={25} y={32} s={11} f={C.second} o={k(0)}>
        scheduler: requests
      </T>
      <rect x={25} y={70} width={200} height={130} rx={4} fill="none" stroke={C.mocha} strokeWidth={1.5} opacity={k(0)} />
      {reqs.map((r, i) => {
        const y = 200 - acc - r;
        acc += r;
        const d = easeOutBack(seg(t, 0.2 + i * 0.35, 0.6 + i * 0.35));
        return (
          <g key={i}>
            <rect x={35} y={lerp(30, y, d)} width={180} height={r} rx={2} fill="none" stroke={C.second} strokeWidth={1.5} opacity={clamp(d)} />
          </g>
        );
      })}
      <rect x={45} y={20} width={160} height={50} rx={2} fill="none" stroke={C.cherryText} strokeWidth={1.4} strokeDasharray="4 3" opacity={k(1.6)} />
      {t > 1.7 && (
        <T x={232} y={62} s={11} f={C.cherryText} o={k(1.7)}>
          limits: overcommit
        </T>
      )}
      <T x={380} y={32} s={11} f={C.cherryText} o={k(1.8)}>
        the limit
      </T>
      <line x1={360} y1={90} x2={560} y2={90} stroke={C.cherryText} strokeWidth={1.8} opacity={k(1.8)} />
      <rect x={420} y={lerp(200, 92, climb)} width={70} height={lerp(0, 108, climb)} rx={2} fill={C.cocoa} stroke={C.latte} strokeWidth={2} />
      {t > 3.0 && (
        <T x={360} y={226} s={11} f={C.cherryText} o={k(3.0)}>
          never past the line
        </T>
      )}
    </Svg>
  );
}

// 3 · QoS classes. Three rows compare request and limit: 200 and 200 meet with an equals sign, Guaranteed; 100 and 200
// differ, Burstable; nothing set, BestEffort.
export function ThreeQosClasses({ t: t0 }: StepCtx) {
  const t = t0 * 1.65;
  const k = (d: number) => easeOut(seg(t, d, d + 0.35));
  const rows: [string, number, number, string, number][] = [
    ['req 200, lim 200', 200, 200, 'Guaranteed', 0.2],
    ['req 100, lim 200', 100, 200, 'Burstable', 1.4],
    ['none set', 0, 0, 'BestEffort', 2.6],
  ];
  return (
    <Svg label="Guaranteed, Burstable, BestEffort — one rule, three classes" h={250}>
      {rows.map(([l, r, lim, cls, d], i) => {
        const y = 46 + i * 62;
        const g = easeOut(seg(t, d + 0.2, d + 0.7));
        return (
          <g key={cls}>
            <T x={25} y={y} s={11} f={C.latte} o={k(d)}>
              {l}
            </T>
            {r > 0 && <rect x={25} y={y + 10} width={r * 1.4 * g} height={12} rx={2} fill="none" stroke={C.second} strokeWidth={1.5} />}
            {lim > 0 && <line x1={25 + lim * 1.4} y1={y + 4} x2={25 + lim * 1.4} y2={y + 28} stroke={C.cherryText} strokeWidth={2} opacity={k(d + 0.2)} />}
            {r === 0 && <Hole x={25} y={y + 8} w={280} h={16} o={k(d + 0.2)} />}
            <T x={330} y={y + 21} s={15} f={C.crema} a="middle" o={k(d + 0.7)}>
              {r === lim && r > 0 ? '=' : r > 0 ? '<' : ''}
            </T>
            <T x={lerp(400, 380, k(d + 0.8))} y={y + 21} s={12} f={i === 0 ? C.focus : i === 1 ? C.second : C.cherryText} o={k(d + 0.8)}>
              {cls}
            </T>
          </g>
        );
      })}
    </Svg>
  );
}

// 4 · Two rankings. Left, the kubelet's list: BestEffort and Burstable in one over-request bracket, Guaranteed last; the two
// in the bracket swap, as priority decides. Right, the kernel's oom_score_adj list, fixed. Lines link them, then cross.
export function TwoRankings({ t: t0 }: StepCtx) {
  const t = t0 * 1.43;
  const k = (d: number) => easeOut(seg(t, d, d + 0.35));
  const sw = easeInOut(seg(t, 2.6, 3.2));
  const left = (i: number) => (i === 0 ? lerp(0, 1, sw) : i === 1 ? lerp(1, 0, sw) : 2);
  const kern: [string, string][] = [
    ['BestEffort', '1000'],
    ['Burstable', '2 to 999'],
    ['Guaranteed', '-997'],
  ];
  return (
    <Svg label="The kubelet's eviction ranking and the kernel's OOM score are two different lists" h={250}>
      <T x={25} y={30} s={11} f={C.taupe} o={k(0)}>
        kubelet's list
      </T>
      {['BestEffort', 'Burstable', 'Guaranteed'].map((q, i) => (
        <Cell key={q} x={25} y={lerp(30, 48 + left(i) * 44, k(0.3 + i * 0.2))} w={150} label={q} o={k(0.3 + i * 0.2)} />
      ))}
      <rect x={18} y={42} width={164} height={84} rx={5} fill="none" stroke={C.cherryText} strokeWidth={1.4} strokeDasharray="4 3" opacity={k(1.0)} />
      <T x={330} y={30} s={11} f={C.taupe} o={k(1.3)}>
        kernel: oom_score_adj
      </T>
      {kern.map(([q, sc], i) => (
        <g key={q}>
          <Cell x={330} y={48 + i * 44} w={130} label={q} o={k(1.5 + i * 0.2)} />
          <T x={575} y={67 + i * 44} s={11} f={i === 0 ? C.cherryText : i === 2 ? C.focus : C.latte} a="end" o={k(1.7 + i * 0.2)}>
            {sc}
          </T>
          <line x1={185} y1={62 + left(i) * 44} x2={325} y2={62 + i * 44} stroke={C.latte} strokeWidth={1.2} opacity={k(2.2) * 0.8} />
        </g>
      ))}
      {t > 3.3 && (
        <T x={25} y={226} s={12} f={C.cherryText} o={k(3.3)}>
          nothing promises the two lists agree
        </T>
      )}
    </Svg>
  );
}

// 5 · The Guaranteed exception. A node of two Guaranteed pods under a band reserved for system daemons. A daemon's usage
// grows down past its band, red; the lower-priority Guaranteed pod drops out of the node.
export function GuaranteedException({ t: t0 }: StepCtx) {
  const t = t0 * 1.8;
  const k = (d: number) => easeOut(seg(t, d, d + 0.35));
  const grow = easeInOut(seg(t, 0.4, 1.6));
  const lift = easeInOut(seg(t, 2.0, 2.8));
  return (
    <Svg label="A Guaranteed pod is never evicted for another pod's usage — but a system daemon can still force it" h={250}>
      <rect x={25} y={40} width={400} height={160} rx={6} fill="none" stroke={C.mocha} strokeWidth={1.5} opacity={k(0)} />
      <rect x={30} y={45} width={390} height={30} rx={3} fill="none" stroke={C.mocha} strokeWidth={1.2} strokeDasharray="4 3" opacity={k(0)} />
      <T x={40} y={65} s={11} f={C.taupe} o={k(0)}>
        reserved for the system
      </T>
      <rect x={250} y={47} width={160} height={26 + 50 * grow} rx={2} fill="none" stroke={grow > 0.6 ? C.cherryText : C.latte} strokeWidth={2} />
      {t > 1.6 && (
        <T x={250} y={142} s={11} f={C.cherryText} o={k(1.6)}>
          a daemon outgrows it
        </T>
      )}
      <Cell x={45} y={lerp(150, 206, lift)} w={135} label="lower priority" o={k(0.2) * (1 - 0.5 * lift)} stroke={lift > 0.1 ? C.cherryText : C.mocha} />
      <Cell x={200} y={150} w={145} label="higher priority" o={k(0.2)} />
      <T x={45} y={140} s={11} f={C.latte} o={k(0.2) * (1 - lift)}>
        Guaranteed, both
      </T>
      {t > 2.8 && (
        <T x={200} y={228} s={11} f={C.cherryText} o={k(2.8)}>
          evicted: by priority, not by its tier
        </T>
      )}
    </Svg>
  );
}

// 6 · Predict. The kubelet's polls tick along a timeline; between two of them, usage spikes through the limit line. Who acts?
// Once answered, the kernel's cross lands at the crossing, before the next poll tick.
export function PredictRace({ t, answer }: StepCtx) {
  const s = useSinceAnswer(answer !== null);
  const v = answer !== null ? easeOut(seg(s, 0.1, 0.5)) : 0;
  const k = (d: number) => easeOut(seg(t, d, d + 0.3));
  const spike = easeIn2(seg(t, 0.4, 1.2));
  return (
    <Svg label="A memory spike outruns the kubelet's polling interval. Who kills the pod?" h={250}>
      <line x1={25} y1={180} x2={575} y2={180} stroke={C.mocha} strokeWidth={1.4} opacity={k(0)} />
      {[0, 1, 2].map((i) => (
        <g key={i}>
          <line x1={80 + i * 220} y1={170} x2={80 + i * 220} y2={190} stroke={C.second} strokeWidth={2} opacity={k(0.1)} />
          <T x={80 + i * 220} y={206} s={11} f={C.second} a="middle" o={k(0.1)}>
            poll
          </T>
        </g>
      ))}
      <line x1={25} y1={70} x2={575} y2={70} stroke={C.cherryText} strokeWidth={1.6} opacity={k(0.2)} />
      <T x={575} y={62} s={11} f={C.cherryText} a="end" o={k(0.2)}>
        limit
      </T>
      <path d={`M80 160 L300 150 L${lerp(300, 370, spike)} ${lerp(150, 50, spike)}`} fill="none" stroke={C.latte} strokeWidth={2} opacity={k(0.3)} />
      {answer === null && t > 1.2 && (
        <T x={420} y={130} s={15} f={C.taupe} a="middle" o={k(1.2)}>
          ?
        </T>
      )}
      <Cross x={356} y={70} k={v} />
      {answer !== null && (
        <T x={380} y={110} s={11} f={C.cherryText} o={v}>
          the kernel acts first
        </T>
      )}
      <Verdict answer={answer} text="the kernel's OOM killer wins the race" y={238} f={C.cherryText} />
    </Svg>
  );
}

// 7 · The CPU-limit debate. A lane throttles on an idle node. An opinion card slides in, labelled one practitioner's stance.
// Then the mechanism: three bursts rise and each stops at its cap, so the node's total stays plannable.
export function CpuLimitDebate({ t: t0 }: StepCtx) {
  const t = t0 * 1.55;
  const k = (d: number) => easeOut(seg(t, d, d + 0.35));
  const pw = 550 / 3;
  const cur = easeInOut(seg(t, 0.2, 1.2)) * 550;
  return (
    <Svg label="A limit caps a burst, which helps capacity planning; one practitioner opinion says drop it" h={250}>
      {[0, 1, 2].map((p) => {
        const x0 = 25 + p * pw;
        const work = clamp(cur - p * pw, 0, pw * 0.3);
        const thr = clamp(cur - p * pw - pw * 0.3, 0, pw * 0.7);
        return (
          <g key={p}>
            {work > 0 && <rect x={x0} y={30} width={work} height={18} rx={2} fill={C.latte} />}
            {thr > 4 && <rect x={x0 + pw * 0.3} y={33} width={thr - 4} height={12} rx={2} fill="none" stroke={C.cherryText} strokeWidth={1.4} strokeDasharray="4 3" />}
          </g>
        );
      })}
      {t > 1.2 && (
        <T x={25} y={68} s={11} f={C.cherryText} o={k(1.2)}>
          throttled, even on an idle node
        </T>
      )}
      <rect x={lerp(41, 25, k(1.5))} y={84} width={300} height={28} rx={4} fill="none" stroke={C.taupe} strokeWidth={1.4} strokeDasharray="5 4" opacity={k(1.5)} />
      <T x={lerp(51, 35, k(1.5))} y={102} s={11} f={C.taupe} o={k(1.5)}>
        drop the limit: one practitioner
      </T>
      <T x={345} y={102} s={11} f={C.taupe} o={k(1.9)}>
        an opinion
      </T>
      <line x1={25} y1={150} x2={330} y2={150} stroke={C.focus} strokeWidth={1.6} opacity={k(2.3)} />
      <T x={345} y={154} s={11} f={C.focus} o={k(2.3)}>
        a cap per burst
      </T>
      {[0, 1, 2].map((i) => {
        const h = Math.min(easeOut(seg(t, 2.5 + i * 0.3, 3.1 + i * 0.3)) * (70 + i * 20), 56);
        return <rect key={i} x={60 + i * 90} y={206 - h} width={50} height={h} rx={2} fill={C.cocoa} stroke={C.latte} strokeWidth={2} />;
      })}
      {t > 3.6 && (
        <T x={345} y={196} s={11} f={C.crema} o={k(3.6)}>
          so the node is plannable
        </T>
      )}
    </Svg>
  );
}

// 8 · The PDB's scope. A PodDisruptionBudget shields the pod's left side: a drain arrow meets it and is held, ticked. A
// node-pressure arrow comes in from the right, untouched by the budget, and the pod lifts away.
export function PdbScope({ t: t0 }: StepCtx) {
  const t = t0 * 1.65;
  const k = (d: number) => easeOut(seg(t, d, d + 0.35));
  const lift = easeInOut(seg(t, 2.6, 3.3));
  return (
    <Svg label="A PodDisruptionBudget governs a drain; it never reaches node-pressure eviction" h={250}>
      <Cell x={240} y={lerp(100, 40, lift)} w={120} label="pod" o={1 - 0.6 * lift} stroke={lift > 0.1 ? C.cherryText : C.mocha} />
      <path d="M220 80 Q 200 114 220 148" fill="none" stroke={C.focus} strokeWidth={3} opacity={k(0.2)} />
      <T x={210} y={174} s={11} f={C.focus} a="middle" o={k(0.2)}>
        PodDisruptionBudget
      </T>
      <Req x1={25} x2={200} y={114} k={k(0.6)} label="a drain" />
      <MiniTick x={40} y={140} k={k(1.3)} />
      {t > 1.3 && (
        <T x={60} y={148} s={11} f={C.focus} o={k(1.3)}>
          governed
        </T>
      )}
      <path d={`M575 114 H${lerp(575, 365, k(1.8))}`} stroke={C.cherryText} strokeWidth={1.8} opacity={k(1.8)} />
      <circle cx={lerp(575, 365, k(1.8))} cy={114} r={3.5} fill={C.cherryText} opacity={k(1.8)} />
      <T x={470} y={104} s={11} f={C.cherryText} a="middle" o={k(1.8)}>
        node pressure
      </T>
      {t > 3.3 && (
        <T x={380} y={150} s={11} f={C.cherryText} o={k(3.3)}>
          never watched by it
        </T>
      )}
      {t > 3.7 && (
        <T x={25} y={226} s={12} f={C.crema} o={k(3.7)}>
          only the disruptions someone chose to start
        </T>
      )}
    </Svg>
  );
}

// 9 · Priority and resize. Top: a pending priority 10 waits while victims at 1 and 2 run out a grace bar, then they leave and
// it moves in. Middle: priority 5 against 5 is crossed out. Bottom: a Burstable pod's bars resize in place, but its arrow to
// Guaranteed is crossed out.
export function PriorityResize({ t: t0 }: StepCtx) {
  const t = t0 * 1.65;
  const k = (d: number) => easeOut(seg(t, d, d + 0.35));
  const grace = easeInOut(seg(t, 0.5, 1.3));
  const out = easeIn2(seg(t, 1.3, 1.7));
  const rs = easeInOut(seg(t, 2.6, 3.3));
  return (
    <Svg label="Preemption only runs uphill; a resize never changes which class a pod belongs to" h={250}>
      <Cell x={25} y={36} w={190} label="pending, priority 10" o={k(0)} stroke={C.focus} />
      {['priority 1', 'priority 2'].map((p, i) => (
        <g key={p}>
          <Cell x={300 + i * 140 + out * 40} y={36} w={120} label={p} o={k(0.2) * (1 - out)} />
          <rect x={300 + i * 140} y={68} width={120 * (1 - grace)} height={4} rx={2} fill={C.second} opacity={k(0.4) * (1 - out)} />
        </g>
      ))}
      {t > 0.5 && t < 1.7 && (
        <T x={300} y={90} s={11} f={C.second} o={k(0.5) * (1 - out)}>
          their grace period first
        </T>
      )}
      <Cell x={25} y={100} w={190} label="pending, priority 5" o={k(1.8)} />
      <Cell x={300} y={100} w={120} label="priority 5" o={k(1.9)} />
      <Cross x={258} y={114} k={k(2.2)} />
      <Cell x={25} y={170} w={130} label="Burstable" o={k(2.4)} />
      <rect x={170} y={176} width={lerp(60, 110, rs)} height={14} rx={2} fill="none" stroke={C.second} strokeWidth={1.5} opacity={k(2.4)} />
      <Req x1={305} x2={395} y={184} k={k(3.3)} />
      <Cell x={400} y={170} w={130} label="Guaranteed" o={k(3.3)} f={C.taupe} />
      <Cross x={350} y={184} k={k(3.7)} />
      {t > 3.3 && (
        <T x={170} y={220} s={11} f={C.taupe} o={k(3.3)}>
          resized in place, stable since 1.35
        </T>
      )}
    </Svg>
  );
}

// 10 · Recap, and a bridge. A service's lane runs on past the edge, forever. A nightly run's lane runs, finishes with a tick,
// and a retry loop draws beside it: what the next topic builds.
export function Recap({ t: t0 }: StepCtx) {
  const t = t0 * 1.95;
  const k = (d: number) => easeOut(seg(t, d, d + 0.35));
  const svc = easeInOut(seg(t, 0.3, 1.8));
  const job = easeInOut(seg(t, 1.2, 2.2));
  return (
    <Svg label="Five things to keep from this topic" h={250}>
      <T x={25} y={56} s={11} f={C.latte} o={k(0)}>
        a service
      </T>
      <rect x={140} y={44} width={435 * svc} height={18} rx={2} fill={C.latte} />
      {svc > 0.95 && <path d="M560 44 l15 9 l-15 9" fill="none" stroke={C.cocoa} strokeWidth={2} />}
      <T x={25} y={126} s={11} f={C.latte} o={k(1.0)}>
        a nightly run
      </T>
      <rect x={140} y={114} width={220 * job} height={18} rx={2} fill={C.latte} />
      <MiniTick x={370} y={120} k={k(2.3)} />
      <path d={`M400 123 a14 14 0 1 1 0.1 0`} fill="none" stroke={C.second} strokeWidth={1.8} strokeDasharray="90" strokeDashoffset={90 * (1 - k(2.7))} />
      {t > 2.9 && (
        <T x={432} y={128} s={11} f={C.second} o={k(2.9)}>
          retried with care
        </T>
      )}
      {t > 3.4 && (
        <T x={25} y={220} s={12} f={C.crema} o={k(3.4)}>
          next: Jobs and CronJobs
        </T>
      )}
    </Svg>
  );
}
function easeIn2(x: number) {
  return x * x;
}
