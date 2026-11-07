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

/** A snapshot circle at (x, y). */
function Snap({ x, y, o = 1, stroke = C.latte }: { x: number; y: number; o?: number; stroke?: string }) {
  return <circle cx={x} cy={y} r={12} fill={C.cocoa} stroke={stroke} strokeWidth={2} opacity={o} />;
}

/** A named reference: a label at (x, y) with a short stem down to (x, y + 14). */
function Ref({ x, y, name, f, o = 1 }: { x: number; y: number; name: string; f: string; o?: number }) {
  return (
    <g opacity={o}>
      <T x={x} y={y} s={11} f={f} a="middle">
        {name}
      </T>
      <line x1={x} y1={y + 4} x2={x} y2={y + 16} stroke={f} strokeWidth={1.6} />
    </g>
  );
}

// 1 · Hook. A row of snapshots, each addressed by id; then names land on two of them; one name begins to slide forward.
export function Hook({ t }: StepCtx) {
  const mv = easeInOut(seg(t, 2.6, 3.4));
  return (
    <Svg label="snapshots are already addressable by id. this topic gives some of them names, and motion." h={200}>
      <line x1={25} y1={100} x2={560} y2={100} stroke={C.mocha} strokeWidth={1.5} opacity={easeOut(seg(t, 0.1, 0.4))} />
      {[0, 1, 2, 3].map((i) => (
        <g key={i}>
          <Snap x={80 + i * 130} y={100} o={easeOut(seg(t, 0.2 + i * 0.15, 0.5 + i * 0.15))} />
        </g>
      ))}
      <T x={25} y={25} s={11} f={C.latte} o={easeOut(seg(t, 0.6, 0.9))}>
        each snapshot: reachable by id
      </T>
      <Ref x={210} y={62} name="released-v1" f={C.second} o={easeOut(seg(t, 1.4, 1.8))} />
      <T x={lerp(210, 340, mv)} y={160} s={11} f={C.focus} a="middle" o={easeOut(seg(t, 1.9, 2.3))}>
        audit
      </T>
      <line x1={lerp(210, 340, mv)} y1={146} x2={lerp(210, 340, mv)} y2={114} stroke={C.focus} strokeWidth={1.6} opacity={easeOut(seg(t, 1.9, 2.3))} />
      <T x={300} y={192} s={13} f={C.crema} a="middle" o={easeOut(seg(t, 3.6, 4.0))}>
        names people use, and one that moves
      </T>
    </Svg>
  );
}

// 2 · Predict. One snapshot; a tag and a branch both land on it; the answer: the branch moves.
export function PredictTagVsBranch({ t, answer }: StepCtx) {
  return (
    <Svg label="a tag and a branch are both created from the same snapshot. what's the real difference?" h={200}>
      <Snap x={300} y={80} o={easeOut(seg(t, 0.1, 0.4))} />
      <Cell x={95} y={50} w={130} h={28} label="a tag" stroke={C.second} o={easeOut(seg(t, 0.5, 0.8))} />
      <Cell x={375} y={50} w={130} h={28} label="a branch" stroke={C.focus} o={easeOut(seg(t, 0.8, 1.1))} />
      <Req x1={227} x2={286} y={72} k={easeOut(seg(t, 0.7, 1.0))} f={C.second} />
      <Req x1={373} x2={314} y={72} k={easeOut(seg(t, 1.0, 1.3))} f={C.focus} />
      <T x={300} y={122} s={14} f={C.crema} a="middle" o={easeOut(seg(t, 1.6, 2.0))}>
        same place right now
      </T>
      <AnswerRow y={158} label="the difference" answer={answer} value="a branch moves" k={easeOut(seg(t, 2.2, 2.7))} />
      <Verdict answer={answer} y={192} text="a tag stays put for good" />
    </Svg>
  );
}

// 3 · Created for real. The table's one snapshot, holding ids 0 to 4; three refs land on it in turn: main, the tag
// released-v1, the branch audit.
export function RevealCreatedForReal({ t }: StepCtx) {
  return (
    <Svg label="created for real: a tag and a branch, both pointing at this table's one snapshot." h={230}>
      <Snap x={300} y={130} o={easeOut(seg(t, 0.1, 0.4))} />
      <T x={300} y={170} s={11} f={C.latte} a="middle" o={easeOut(seg(t, 0.3, 0.6))}>
        rows: ids 0 to 4
      </T>
      <Ref x={160} y={70} name="main" f={C.crema} o={easeOut(seg(t, 0.8, 1.1))} />
      <line x1={160} y1={86} x2={288} y2={124} stroke={C.crema} strokeWidth={1.4} opacity={easeOut(seg(t, 0.9, 1.2))} />
      <Ref x={300} y={40} name="released-v1 (tag)" f={C.second} o={easeOut(seg(t, 1.5, 1.8))} />
      <line x1={300} y1={56} x2={300} y2={116} stroke={C.second} strokeWidth={1.4} opacity={easeOut(seg(t, 1.6, 1.9))} />
      <Ref x={440} y={70} name="audit (branch)" f={C.focus} o={easeOut(seg(t, 2.2, 2.5))} />
      <line x1={440} y1={86} x2={312} y2={124} stroke={C.focus} strokeWidth={1.4} opacity={easeOut(seg(t, 2.3, 2.6))} />
      <T x={300} y={215} s={12} f={C.latte} a="middle" o={easeOut(seg(t, 3.2, 3.6))}>
        through pyiceberg's own snapshot-management API
      </T>
    </Svg>
  );
}

// 4 · The spec's line. The tag pins to the first snapshot with a padlock; new snapshots commit; the branch's label slides
// with each one while the tag stays.
export function RevealSpecDistinguishesThem({ t }: StepCtx) {
  const step = easeInOut(seg(t, 1.8, 2.4)) + easeInOut(seg(t, 2.8, 3.4));
  const bx = 100 + step * 170;
  return (
    <Svg label="the spec says it directly: tags are fixed labels, branches are mutable references that move." h={230}>
      <line x1={25} y1={120} x2={560} y2={120} stroke={C.mocha} strokeWidth={1.5} opacity={easeOut(seg(t, 0.1, 0.4))} />
      <Snap x={100} y={120} o={easeOut(seg(t, 0.1, 0.4))} />
      <Snap x={270} y={120} o={easeOut(seg(t, 1.6, 1.9))} />
      <Snap x={440} y={120} o={easeOut(seg(t, 2.6, 2.9))} />
      <Ref x={100} y={70} name="tag" f={C.second} o={easeOut(seg(t, 0.4, 0.7))} />
      <Lock x={120} y={60} k={easeOut(seg(t, 0.8, 1.1))} />
      <line x1={100} y1={86} x2={100} y2={106} stroke={C.second} strokeWidth={1.4} opacity={easeOut(seg(t, 0.4, 0.7))} />
      <T x={bx} y={164} s={11} f={C.focus} a="middle" o={easeOut(seg(t, 0.9, 1.2))}>
        branch
      </T>
      <line x1={bx} y1={150} x2={bx} y2={134} stroke={C.focus} strokeWidth={1.6} opacity={easeOut(seg(t, 0.9, 1.2))} />
      <T x={25} y={30} s={12} f={C.second} o={easeOut(seg(t, 1.2, 1.5))}>
        tag: a label on one snapshot
      </T>
      <T x={25} y={215} s={12} f={C.focus} o={easeOut(seg(t, 3.5, 3.9))}>
        branch: moves as new snapshots commit
      </T>
    </Svg>
  );
}

// 5 · Predict. Rows land on the audit lane; main's lane sits above; the answer: main stays put.
export function PredictBranchWritesIsolated({ t, answer }: StepCtx) {
  return (
    <Svg label="new rows are written to the audit branch. what happens to main?" h={200}>
      <T x={25} y={44} s={11} f={C.crema} o={easeOut(seg(t, 0.1, 0.4))}>
        main
      </T>
      <line x1={90} y1={40} x2={560} y2={40} stroke={C.mocha} strokeWidth={1.5} opacity={easeOut(seg(t, 0.1, 0.4))} />
      <Snap x={130} y={40} o={easeOut(seg(t, 0.1, 0.4))} />
      <T x={25} y={99} s={11} f={C.focus} o={easeOut(seg(t, 0.4, 0.7))}>
        audit
      </T>
      <path d="M130 52 Q140 95 200 95 H560" fill="none" stroke={C.focus} strokeWidth={1.5} opacity={easeOut(seg(t, 0.4, 0.7))} />
      {[0, 1, 2].map((i) => (
        <rect
          key={i}
          x={240 + i * 26}
          y={lerp(60, 85, easeOut(seg(t, 0.9 + i * 0.2, 1.2 + i * 0.2)))}
          width={18}
          height={18}
          rx={2}
          fill={C.cocoa}
          stroke={C.focus}
          strokeWidth={1.4}
          opacity={easeOut(seg(t, 0.9 + i * 0.2, 1.2 + i * 0.2))}
        />
      ))}
      <T x={360} y={30} s={14} f={C.second} o={easeOut(seg(t, 1.8, 2.2))}>
        main too?
      </T>
      <AnswerRow y={145} label="main" answer={answer} value="stays put" k={easeOut(seg(t, 2.3, 2.8))} />
      <Verdict answer={answer} y={188} text="nothing moves a ref but its own commit" />
    </Svg>
  );
}

// 6 · Staged, main untouched. The audit lane gains a snapshot holding ids 5, 6 and 7; main's pointer stays on the first
// snapshot, and its check, ids 0 to 4, lands ticked.
export function RevealMainProvablyUntouched({ t }: StepCtx) {
  return (
    <Svg label="staged for real: three new rows on the audit branch; main's own snapshot id, unchanged." h={230}>
      <T x={25} y={64} s={11} f={C.crema} o={easeOut(seg(t, 0.1, 0.4))}>
        main
      </T>
      <line x1={90} y1={60} x2={560} y2={60} stroke={C.mocha} strokeWidth={1.5} opacity={easeOut(seg(t, 0.1, 0.4))} />
      <Snap x={130} y={60} o={easeOut(seg(t, 0.1, 0.4))} stroke={C.crema} />
      <T x={25} y={134} s={11} f={C.focus} o={easeOut(seg(t, 0.1, 0.4))}>
        audit
      </T>
      <path d="M130 72 Q140 130 200 130 H560" fill="none" stroke={C.focus} strokeWidth={1.5} opacity={easeOut(seg(t, 0.1, 0.4))} />
      <Snap x={330} y={130} o={easeOut(seg(t, 0.8, 1.1))} stroke={C.focus} />
      <T x={330} y={170} s={12} f={C.focus} a="middle" o={easeOut(seg(t, 1.1, 1.4))}>
        + ids 5, 6, 7
      </T>
      <T x={130} y={30} s={11} f={C.crema} a="middle" o={easeOut(seg(t, 1.8, 2.1))}>
        main's snapshot id
      </T>
      <MiniTick x={215} y={20} k={easeOut(seg(t, 2.3, 2.6))} />
      <T x={25} y={210} s={13} f={C.crema} o={easeOut(seg(t, 2.8, 3.2))}>
        main still shows ids 0 to 4, unchanged
      </T>
    </Svg>
  );
}

// 7 · Validated, published. The duplicate-id check runs over the staged snapshot and passes; main's pointer slides along
// to the audit snapshot; the tag stays where it was.
export function RevealValidatedThenPublished({ t }: StepCtx) {
  const ff = easeInOut(seg(t, 2.2, 3.0));
  return (
    <Svg label="validated, then published: a real check passes, and main is fast-forwarded for real." h={230}>
      <line x1={25} y1={110} x2={560} y2={110} stroke={C.mocha} strokeWidth={1.5} opacity={easeOut(seg(t, 0.1, 0.4))} />
      <Snap x={130} y={110} o={easeOut(seg(t, 0.1, 0.4))} />
      <Snap x={360} y={110} o={easeOut(seg(t, 0.1, 0.4))} stroke={C.focus} />
      <T x={130} y={160} s={11} f={C.second} a="middle" o={easeOut(seg(t, 0.1, 0.4))}>
        released-v1
      </T>
      <line x1={130} y1={145} x2={130} y2={124} stroke={C.second} strokeWidth={1.4} opacity={easeOut(seg(t, 0.1, 0.4))} />
      <Ref x={lerp(130, 360, ff)} y={62} name="main" f={C.crema} o={easeOut(seg(t, 0.1, 0.4))} />
      <line x1={lerp(130, 360, ff)} y1={78} x2={lerp(130, 360, ff)} y2={96} stroke={C.crema} strokeWidth={1.4} opacity={easeOut(seg(t, 0.1, 0.4))} />
      <Cell x={420} y={20} w={155} h={28} label="duplicate ids?" stroke={C.second} o={easeOut(seg(t, 0.6, 0.9))} />
      <MiniTick x={430} y={62} k={easeOut(seg(t, 1.3, 1.6))} />
      <T x={450} y={70} s={12} f={C.focus} o={easeOut(seg(t, 1.4, 1.7))}>
        none: pass
      </T>
      <T x={25} y={210} s={13} f={C.focus} o={easeOut(seg(t, 3.2, 3.6))}>
        main fast-forwarded; the tag never moved
      </T>
    </Svg>
  );
}

// 8 · The rejected attempt. A wap-bad branch off main stages ids 3 and 9; the check finds 3 already present and fails;
// the branch fades away and main's pointer is ticked unmoved.
export function RevealSecondAttemptRejected({ t }: StepCtx) {
  const gone = easeOut(seg(t, 2.8, 3.4));
  return (
    <Svg label="a second attempt, for real, fails the same check and never reaches main." h={230}>
      <T x={25} y={64} s={11} f={C.crema} o={easeOut(seg(t, 0.1, 0.4))}>
        main
      </T>
      <line x1={90} y1={60} x2={560} y2={60} stroke={C.mocha} strokeWidth={1.5} opacity={easeOut(seg(t, 0.1, 0.4))} />
      <Snap x={130} y={60} o={easeOut(seg(t, 0.1, 0.4))} stroke={C.crema} />
      <g opacity={1 - gone * 0.8}>
        <T x={25} y={134} s={11} f={C.cherryText} o={easeOut(seg(t, 0.3, 0.6))}>
          wap-bad
        </T>
        <path d="M130 72 Q140 130 200 130 H400" fill="none" stroke={C.cherryText} strokeWidth={1.5} strokeDasharray="5 4" opacity={easeOut(seg(t, 0.3, 0.6))} />
        <Snap x={300} y={130} o={easeOut(seg(t, 0.8, 1.1))} stroke={C.cherryText} />
        <T x={300} y={170} s={12} f={C.cherryText} a="middle" o={easeOut(seg(t, 1.1, 1.4))}>
          + ids 3, 9
        </T>
      </g>
      <Cell x={420} y={110} w={155} h={28} label="duplicate ids?" stroke={C.second} o={easeOut(seg(t, 1.5, 1.8))} />
      <Cross x={440} y={160} k={easeOut(seg(t, 2.0, 2.3))} />
      <T x={458} y={165} s={12} f={C.cherryText} o={easeOut(seg(t, 2.1, 2.4))}>
        3: fail
      </T>
      <MiniTick x={200} y={22} k={easeOut(seg(t, 3.5, 3.8))} />
      <T x={220} y={30} s={12} f={C.focus} o={easeOut(seg(t, 3.5, 3.8))}>
        main never moved
      </T>
      <T x={25} y={215} s={12} f={C.latte} o={easeOut(seg(t, 3.0, 3.3))}>
        branch discarded: a hard stop
      </T>
    </Svg>
  );
}

// 9 · One table. A table box with its branches; a view box apart from it, own metadata, no data; a catalog box above two
// tables, the layer that branches them together.
export function RevealOneTableViewsAndCatalog({ t }: StepCtx) {
  return (
    <Svg label="this is one table. views are a separate object entirely; more than one table at once is the catalog's job." h={230}>
      <Cell x={25} y={110} w={160} h={34} label="one table" stroke={C.focus} o={easeOut(seg(t, 0.2, 0.5))} />
      <T x={25} y={165} s={11} f={C.latte} o={easeOut(seg(t, 0.4, 0.7))}>
        tags, branches, WAP
      </T>
      <Cell x={215} y={110} w={160} h={34} label="a view" stroke={C.second} o={easeOut(seg(t, 1.0, 1.3))} />
      <T x={215} y={165} s={11} f={C.latte} o={easeOut(seg(t, 1.2, 1.5))}>
        own metadata, no data
      </T>
      <Cell x={405} y={20} w={170} h={30} label="catalog" stroke={C.second} o={easeOut(seg(t, 2.0, 2.3))} />
      <Cell x={405} y={110} w={78} h={34} label="table" o={easeOut(seg(t, 2.2, 2.5))} />
      <Cell x={497} y={110} w={78} h={34} label="table" o={easeOut(seg(t, 2.3, 2.6))} />
      <line x1={490} y1={50} x2={lerp(490, 444, easeOut(seg(t, 2.5, 2.9)))} y2={lerp(50, 108, easeOut(seg(t, 2.5, 2.9)))} stroke={C.second} strokeWidth={1.4} />
      <line x1={490} y1={50} x2={lerp(490, 536, easeOut(seg(t, 2.5, 2.9)))} y2={lerp(50, 108, easeOut(seg(t, 2.5, 2.9)))} stroke={C.second} strokeWidth={1.4} />
      <T x={405} y={165} s={11} f={C.latte} o={easeOut(seg(t, 2.9, 3.2))}>
        many tables at once
      </T>
      <T x={25} y={215} s={12} f={C.crema} o={easeOut(seg(t, 3.6, 4.0))}>
        multi-table branching is the catalog's job
      </T>
    </Svg>
  );
}

// 10 · Recap.
export function Recap({ t }: StepCtx) {
  return (
    <Svg label="a fixed pointer, a movable one, and a full publish flow run twice -- once in, once rejected." h={250}>
      <Row y={40} label="a tag" value="fixed for good" valueColor={C.second} k={easeOut(seg(t, 0.2, 0.6))} />
      <Row y={100} label="a branch" value="moves with commits" valueColor={C.focus} k={easeOut(seg(t, 1.2, 1.6))} />
      <Row y={160} label="audit passed" value="main fast-forwarded" valueColor={C.focus} k={easeOut(seg(t, 2.2, 2.6))} />
      <Row y={220} label="audit failed" value="main never moved" valueColor={C.cherryText} k={easeOut(seg(t, 3.2, 3.6))} />
    </Svg>
  );
}
