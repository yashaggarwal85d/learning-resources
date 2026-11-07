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

/** Two nodes with a partition line between them; `cut` draws the jagged line in. */
function Split({ x, y, cut, o = 1, w = 140 }: { x: number; y: number; cut: number; o?: number; w?: number }) {
  return (
    <g opacity={o}>
      <circle cx={x} cy={y} r={16} fill={C.cocoa} stroke={C.latte} strokeWidth={2} />
      <circle cx={x + w} cy={y} r={16} fill={C.cocoa} stroke={C.latte} strokeWidth={2} />
      <path d={`M${x + w / 2} ${y - 30} l-6 12 l12 12 l-12 12 l12 12 l-6 12`} fill="none" stroke={C.cherryText} strokeWidth={2} strokeDasharray="90" strokeDashoffset={90 * (1 - cut)} />
    </g>
  );
}

// 1 · Hook. Two split systems: the first answers on both sides; the second goes quiet on one side. Both are right.
export function Hook({ t }: StepCtx) {
  const cut = easeOut(seg(t, 0.6, 1.0));
  return (
    <Svg label="both handle partitions. One answers, one stops. Both are right." h={230}>
      <T x={150} y={45} s={13} f={C.crema} a="middle" o={easeOut(seg(t, 0.1, 0.4))}>
        system one
      </T>
      <T x={450} y={45} s={13} f={C.crema} a="middle" o={easeOut(seg(t, 0.1, 0.4))}>
        system two
      </T>
      <Split x={80} y={105} cut={cut} o={easeOut(seg(t, 0.2, 0.5))} />
      <Split x={380} y={105} cut={cut} o={easeOut(seg(t, 0.2, 0.5))} />
      <MiniTick x={74} y={140} k={easeOut(seg(t, 1.3, 1.6))} />
      <MiniTick x={214} y={140} k={easeOut(seg(t, 1.5, 1.8))} />
      <T x={150} y={178} s={12} f={C.focus} a="middle" o={easeOut(seg(t, 1.7, 2.0))}>
        keeps answering
      </T>
      <MiniTick x={374} y={140} k={easeOut(seg(t, 2.2, 2.5))} />
      <Cross x={520} y={145} k={easeOut(seg(t, 2.4, 2.7))} />
      <T x={450} y={178} s={12} f={C.cherryText} a="middle" o={easeOut(seg(t, 2.6, 2.9))}>
        one side goes quiet
      </T>
      <T x={300} y={216} s={13} f={C.focus} a="middle" o={easeOut(seg(t, 3.3, 3.7))}>
        both are telling the truth
      </T>
    </Svg>
  );
}

// 2 · Predict. A self-described CA pair; the link between them is cut. The answer: it has to pick.
export function PredictCaSystemDuringPartition({ t, answer }: StepCtx) {
  return (
    <Svg label="it claims CA. What happens when a partition hits?" h={200}>
      <Row y={40} label="it claims" value="consistent and available" k={easeOut(seg(t, 0.1, 0.5))} />
      <Split x={230} y={88} cut={easeOut(seg(t, 0.7, 1.1))} o={easeOut(seg(t, 0.3, 0.6))} />
      <AnswerRow y={140} label="partitioned, it" answer={answer} value="must pick one" k={easeOut(seg(t, 1.3, 1.8))} />
      <Verdict answer={answer} text="consistent or available, not both" />
    </Svg>
  );
}

// 3 · CAP, precisely. A timeline with one partition window; outside it, no trade; inside it, pick one.
export function RevealCapStatedPrecisely({ t }: StepCtx) {
  const w = easeOut(seg(t, 1.0, 1.5));
  return (
    <Svg label="not permanent. Only forced while a partition happens." h={230}>
      <line x1={25} y1={120} x2={25 + 550 * easeOut(seg(t, 0.2, 0.8))} y2={120} stroke={C.latte} strokeWidth={1.5} />
      <rect x={230} y={96} width={140} height={48} rx={4} fill="none" stroke={C.cherryText} strokeWidth={2} strokeDasharray="5 4" opacity={w} />
      <T x={300} y={84} s={13} f={C.cherryText} a="middle" o={easeOut(seg(t, 1.4, 1.7))}>
        pick one
      </T>
      <T x={120} y={84} s={12} f={C.latte} a="middle" o={easeOut(seg(t, 2.2, 2.5))}>
        no trade
      </T>
      <T x={480} y={84} s={12} f={C.latte} a="middle" o={easeOut(seg(t, 2.5, 2.8))}>
        no trade
      </T>
      <T x={300} y={164} s={11} f={C.cherryText} a="middle" o={w}>
        a partition
      </T>
      <Row y={210} label="the choice exists" value="only during a partition" valueColor={C.focus} k={easeOut(seg(t, 3.2, 3.7))} />
    </Svg>
  );
}

// 4 · PA vs PC. A request reaches one side of the split; it branches to answer-and-risk or refuse-and-stay-correct.
export function RevealPaVsPc({ t }: StepCtx) {
  const r = clamp(seg(t, 0.3, 0.9));
  return (
    <Svg label="answer and risk wrong, or refuse and stay correct." h={240}>
      <circle cx={90} cy={112} r={18} fill={C.cocoa} stroke={C.latte} strokeWidth={2} opacity={easeOut(seg(t, 0.1, 0.3))} />
      <circle cx={lerp(25, 72, r)} cy={112} r={5} fill={C.focus} opacity={r > 0 && r < 1 ? 1 : 0} />
      <path d="M160 70 l-6 12 l12 12 l-12 12 l12 12 l-6 12 l6 12" fill="none" stroke={C.cherryText} strokeWidth={2} opacity={easeOut(seg(t, 0.1, 0.3))} />
      <line x1={108} y1={104} x2={230} y2={74} stroke={C.second} strokeWidth={1.5} opacity={easeOut(seg(t, 1.0, 1.3))} />
      <Cell x={230} y={60} w={345} label="PA: answer, risk being wrong" stroke={C.second} f={C.second} o={easeOut(seg(t, 1.2, 1.5))} />
      <line x1={108} y1={120} x2={230} y2={150} stroke={C.focus} strokeWidth={1.5} opacity={easeOut(seg(t, 2.0, 2.3))} />
      <Cell x={230} y={136} w={345} label="PC: refuse, stay correct" stroke={C.focus} f={C.focus} o={easeOut(seg(t, 2.2, 2.5))} />
      <Row y={215} label="that choice" value="the whole theorem" valueColor={C.focus} k={easeOut(seg(t, 3.4, 3.9))} />
    </Svg>
  );
}

// 5 · PACELC. A healthy link with replication flowing; even so, each request picks EC (wait) or EL (answer fast).
export function RevealPacelcAddition({ t }: StepCtx) {
  return (
    <Svg label="no partition at all, still a trade: latency vs consistency." h={240}>
      <Row y={40} label="no partition" value="still a trade" k={easeOut(seg(t, 0.2, 0.7))} />
      <circle cx={100} cy={90} r={14} fill={C.cocoa} stroke={C.latte} strokeWidth={2} opacity={easeOut(seg(t, 0.3, 0.6))} />
      <circle cx={500} cy={90} r={14} fill={C.cocoa} stroke={C.latte} strokeWidth={2} opacity={easeOut(seg(t, 0.3, 0.6))} />
      <line x1={114} y1={90} x2={486} y2={90} stroke={C.mocha} strokeWidth={1.5} opacity={easeOut(seg(t, 0.3, 0.6))} />
      <circle cx={lerp(118, 482, t > 0.6 ? ((t - 0.6) / 1.2) % 1 : 0)} cy={90} r={4} fill={C.second} opacity={t > 0.6 ? 1 : 0} />
      <Row y={150} label="EC" value="wait, stay consistent" valueColor={C.focus} k={easeOut(seg(t, 1.8, 2.3))} />
      <Row y={205} label="EL" value="answer fast, maybe behind" valueColor={C.second} k={easeOut(seg(t, 2.8, 3.3))} />
    </Svg>
  );
}

// 6 · Predict #2. Dynamo's two situations side by side; after the answer both carry the same tick: one design, one bet.
export function PredictChoiceCarriesOver({ t, answer }: StepCtx) {
  const s = useSinceAnswer(answer !== null);
  const a = answer !== null ? easeOut(seg(s, 0.2, 0.6)) : 0;
  return (
    <Svg label="gives up consistency under partition. What about without one?" h={200}>
      <Row y={40} label="Dynamo, partitioned" value="picks availability" k={easeOut(seg(t, 0.1, 0.5))} />
      <Cell x={25} y={64} w={250} h={28} label="during a partition" stroke={C.second} o={easeOut(seg(t, 0.4, 0.7))} />
      <Cell x={325} y={64} w={250} h={28} label="with no partition" stroke={a > 0.5 ? C.second : C.mocha} o={easeOut(seg(t, 0.7, 1.0))} />
      <MiniTick x={250} y={102} k={easeOut(seg(t, 0.6, 0.9))} f={C.second} />
      <MiniTick x={550} y={102} k={a} f={C.second} />
      <AnswerRow y={140} label="the same trade?" answer={answer} value="yes, both times" k={easeOut(seg(t, 1.3, 1.8))} />
      <Verdict answer={answer} text="one design, the same bet" />
    </Svg>
  );
}

// 7 · Classified. A two-by-two grid fills in: Dynamo's row PA and EL, then Spanner's row PC and EC.
export function RevealDynamoSpannerClassified({ t }: StepCtx) {
  const cells: [number, number, string, number, string][] = [
    [190, 70, 'PA', 0.8, C.second],
    [385, 70, 'EL', 1.4, C.second],
    [190, 130, 'PC', 2.4, C.focus],
    [385, 130, 'EC', 3.0, C.focus],
  ];
  return (
    <Svg label="Dynamo: PA/EL. Spanner: PC/EC. Opposite, both documented." h={240}>
      <T x={260} y={52} s={12} f={C.latte} a="middle" o={easeOut(seg(t, 0.2, 0.5))}>
        during a partition
      </T>
      <T x={455} y={52} s={12} f={C.latte} a="middle" o={easeOut(seg(t, 0.2, 0.5))}>
        otherwise
      </T>
      <T x={25} y={90} s={13} f={C.crema} o={easeOut(seg(t, 0.5, 0.8))}>
        Dynamo
      </T>
      <T x={25} y={150} s={13} f={C.crema} o={easeOut(seg(t, 2.1, 2.4))}>
        Spanner
      </T>
      {cells.map(([x, y, l, a, f]) => (
        <Cell key={l} x={x} y={y} w={140} h={30} label={l} stroke={f} f={f} o={easeOut(seg(t, a, a + 0.3))} />
      ))}
      <Row y={215} label="opposite choices" value="on both axes" valueColor={C.focus} k={easeOut(seg(t, 3.9, 4.4))} />
    </Svg>
  );
}

// 8 · Failure domains. Boxes draw from the inside out, in the narration's order: process, host, rack, zone, region.
export function RevealFailureDomainsPhysically({ t }: StepCtx) {
  const boxes: [number, number, number, number, string, number][] = [
    [200, 132, 200, 42, 'process', 0.4],
    [145, 104, 310, 88, 'host', 1.2],
    [100, 80, 400, 126, 'rack', 2.0],
    [60, 54, 480, 166, 'availability zone', 2.8],
    [25, 30, 550, 200, 'region', 3.6],
  ];
  return (
    <Svg label="process, host, rack, zone, region: real ways to partition." h={240}>
      {boxes.map(([x, y, w, h, l, a], i) => {
        const k = easeOut(seg(t, a, a + 0.4));
        return (
          <g key={l} opacity={k}>
            <rect x={x} y={y} width={w} height={h} rx={5} fill="none" stroke={i === 0 ? C.focus : C.latte} strokeWidth={1.5} />
            <T x={i === 0 ? 300 : x + 10} y={i === 0 ? 158 : y + 16} s={11} f={i === 0 ? C.focus : C.latte} a={i === 0 ? 'middle' : 'start'}>
              {l}
            </T>
          </g>
        );
      })}
    </Svg>
  );
}

// 9 · Recap. Three rows, one per beat.
export function Recap({ t }: StepCtx) {
  return (
    <Svg label="partition forces PA or PC. PACELC adds the always-there trade." h={200}>
      <Row y={40} label="a partition forces" value="PA or PC" k={easeOut(seg(t, 0.4, 0.9))} />
      <Row y={100} label="PACELC adds" value="EL or EC, always" valueColor={C.second} k={easeOut(seg(t, 1.6, 2.1))} />
      <Row y={160} label="both come from" value="real, physical failures" valueColor={C.focus} k={easeOut(seg(t, 2.8, 3.3))} />
    </Svg>
  );
}

// 10 · Prove. Five domain chips, innermost first; after the answer process and host are crossed and the other three tick.
export function ProveIt({ t, answer }: StepCtx) {
  const s = useSinceAnswer(answer !== null);
  const a = answer !== null ? easeOut(seg(s, 0.2, 0.6)) : 0;
  const v = answer !== null ? easeOut(seg(s, 0.8, 1.2)) : 0;
  const chips = ['process', 'host', 'rack', 'zone', 'region'];
  return (
    <Svg label="one host crashes. What does that partition?" h={220}>
      <Row y={40} label="one host crashes" value="in one zone" k={easeOut(seg(t, 0.1, 0.5))} />
      <AnswerRow y={90} label="partitioned" answer={answer} value="process and host" k={easeOut(seg(t, 0.4, 0.9))} />
      {chips.map((c, i) => (
        <Cell key={c} x={25 + i * 112} y={118} w={104} h={26} label={c} stroke={a > 0.5 ? (i < 2 ? C.cherryText : C.focus) : C.mocha} o={easeOut(seg(t, 0.8 + i * 0.1, 1.1 + i * 0.1))} />
      ))}
      <Cross x={77} y={160} k={a} />
      <Cross x={189} y={160} k={a} />
      {answer !== null && (
        <>
          <T x={300} y={lerp(198, 190, v)} s={15} f={C.focus} a="middle" o={v}>
            a crash takes only what's inside it
          </T>
          <rect x={150} y={202} width={300 * v} height={3} fill={C.focus} />
        </>
      )}
    </Svg>
  );
}
