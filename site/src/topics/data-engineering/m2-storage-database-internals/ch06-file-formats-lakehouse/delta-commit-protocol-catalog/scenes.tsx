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

/** A version marker on a timeline at (x, y), labelled v{n}, with an optional caption beneath. */
function Ver({ x, y, n, cap, o = 1, stroke = C.latte, f = C.latte }: { x: number; y: number; n: number; cap?: string; o?: number; stroke?: string; f?: string }) {
  return (
    <g opacity={o}>
      <circle cx={x} cy={y} r={14} fill={C.cocoa} stroke={stroke} strokeWidth={2} />
      <T x={x} y={y + 4.5} s={11} f={C.crema} a="middle">
        {`v${n}`}
      </T>
      {cap && (
        <T x={x} y={y + 34} s={11} f={f} a="middle">
          {cap}
        </T>
      )}
    </g>
  );
}

// 1 · Hook. A JSON entry card; the rule lands beside it; the entry drops into the next version's slot and is padlocked.
export function Hook({ t }: StepCtx) {
  const d = easeInOut(seg(t, 1.8, 2.5));
  return (
    <Svg label="a json entry is only a commit once it's atomic. this topic is exactly that, for real." h={200}>
      <Cell x={lerp(25, 330, d)} y={lerp(40, 100, d)} w={160} h={30} label="a JSON entry" o={easeOut(seg(t, 0.1, 0.4))} />
      <rect x={325} y={95} width={170} height={40} rx={4} fill="none" stroke={C.second} strokeWidth={1.6} strokeDasharray="5 4" opacity={easeOut(seg(t, 0.8, 1.1))} />
      <T x={325} y={160} s={11} f={C.second} o={easeOut(seg(t, 0.9, 1.2))}>
        the next version's file
      </T>
      <Lock x={505} y={108} k={easeOut(seg(t, 2.7, 3.0))} f={C.focus} />
      <T x={25} y={110} s={12} f={C.latte} o={easeOut(seg(t, 0.5, 0.8)) * (1 - d)}>
        not yet a commit
      </T>
      <T x={25} y={190} s={13} f={C.focus} o={easeOut(seg(t, 3.3, 3.7))}>
        written atomically: now a commit
      </T>
    </Svg>
  );
}

// 2 · Predict. Writers A and B both aim at the v1 file; A's arrow lands first; the answer: B is rejected.
export function PredictRaceOutcome({ t, answer }: StepCtx) {
  return (
    <Svg label="two writers race for the same next version. writer a's write lands first. what happens to writer b's?" h={200}>
      <Cell x={25} y={25} w={110} h={28} label="writer A" o={easeOut(seg(t, 0.1, 0.4))} />
      <Cell x={25} y={75} w={110} h={28} label="writer B" o={easeOut(seg(t, 0.2, 0.5))} />
      <Cell x={330} y={48} w={245} h={30} label="...0001.json" stroke={C.second} o={easeOut(seg(t, 0.3, 0.6))} />
      <line x1={137} y1={39} x2={lerp(137, 328, easeOut(seg(t, 0.7, 1.2)))} y2={lerp(39, 58, easeOut(seg(t, 0.7, 1.2)))} stroke={C.focus} strokeWidth={2} />
      <line x1={137} y1={89} x2={lerp(137, 300, easeOut(seg(t, 1.1, 1.6)))} y2={lerp(89, 70, easeOut(seg(t, 1.1, 1.6)))} stroke={C.second} strokeWidth={2} />
      <T x={200} y={118} s={13} f={C.second} o={easeOut(seg(t, 1.7, 2.1))}>
        B: overwrite, merge, or rejected?
      </T>
      <AnswerRow y={150} label="writer B's write" answer={answer} value="rejected" k={easeOut(seg(t, 2.3, 2.8))} f={C.cherryText} />
      <Verdict answer={answer} y={190} text="one winner: whoever lands first" />
    </Svg>
  );
}

// 3 · Put-if-absent, for real. A's PUT with If-None-Match: * goes through and the file appears; B's identical PUT comes
// back with 412 PreconditionFailed.
export function RevealPutIfAbsentCommit({ t }: StepCtx) {
  return (
    <Svg label="a real put-if-absent write of _delta_log/...0001.json. writer b's identical attempt gets a real 412." h={230}>
      <T x={25} y={25} s={11} f={C.latte} o={easeOut(seg(t, 0.1, 0.4))}>
        PUT _delta_log/00000000000000000001.json, If-None-Match: *
      </T>
      <Cell x={25} y={45} w={110} h={30} label="writer A" o={easeOut(seg(t, 0.2, 0.5))} />
      <Req x1={137} x2={318} y={60} k={easeOut(seg(t, 0.5, 1.0))} f={C.focus} />
      <Cell x={320} y={45} w={255} h={30} label="v1: part-a-00001" stroke={C.focus} o={easeOut(seg(t, 1.0, 1.3))} />
      <Cell x={25} y={115} w={110} h={30} label="writer B" o={easeOut(seg(t, 1.5, 1.8))} />
      <Req x1={137} x2={318} y={130} k={easeOut(seg(t, 1.8, 2.3))} f={C.second} back={easeOut(seg(t, 2.4, 2.8))} />
      <Cell x={320} y={115} w={255} h={30} label="412 PreconditionFailed" stroke={C.cherryText} f={C.cherryText} o={easeOut(seg(t, 2.6, 2.9))} />
      <T x={25} y={200} s={12} f={C.latte} o={easeOut(seg(t, 3.4, 3.8))}>
        the same conditional write from the object-storage topic
      </T>
    </Svg>
  );
}

// 4 · The retry. A timeline: v0, then v1 held by A; B's rejected proposal lifts and re-aims at v2, which it wins.
export function RevealAppendRetrySucceeds({ t }: StepCtx) {
  const r = easeInOut(seg(t, 1.6, 2.4));
  return (
    <Svg label="writer b's append has no requirements. it re-proposes against the new tip and wins version 2." h={230}>
      <line x1={25} y1={90} x2={560} y2={90} stroke={C.mocha} strokeWidth={1.5} opacity={easeOut(seg(t, 0.1, 0.3))} />
      <Ver x={90} y={90} n={0} o={easeOut(seg(t, 0.1, 0.4))} />
      <Ver x={260} y={90} n={1} cap="writer A" stroke={C.focus} o={easeOut(seg(t, 0.4, 0.7))} />
      <Ver x={430} y={90} n={2} cap="writer B" f={C.focus} stroke={C.focus} o={easeOut(seg(t, 2.4, 2.8))} />
      <path d={`M260 60 Q${lerp(260, 345, r)} ${lerp(30, 20, r)} ${lerp(262, 428, r)} 74`} fill="none" stroke={C.second} strokeWidth={1.8} strokeDasharray="5 4" opacity={easeOut(seg(t, 1.2, 1.5))} />
      <T x={290} y={30} s={11} f={C.second} o={easeOut(seg(t, 1.0, 1.3))}>
        B: an append, nothing to re-check
      </T>
      <T x={25} y={190} s={13} f={C.focus} o={easeOut(seg(t, 3.0, 3.4))}>
        re-proposed at the new tip, wins v2
      </T>
      <T x={25} y={218} s={11} f={C.latte} o={easeOut(seg(t, 3.6, 4.0))}>
        the same retry rule as Iceberg's appends
      </T>
    </Svg>
  );
}

// 5 · Predict. The delete reads at v2; an insert commits v3; the delete tries for v4; the answer: it commits.
export function PredictIsolationLevel({ t, answer }: StepCtx) {
  return (
    <Svg label="a concurrent insert lands first. a delete that didn't see it tries to commit next. does it commit?" h={200}>
      <line x1={25} y1={50} x2={560} y2={50} stroke={C.mocha} strokeWidth={1.5} opacity={easeOut(seg(t, 0.1, 0.3))} />
      <Ver x={100} y={50} n={2} cap="delete reads" f={C.second} o={easeOut(seg(t, 0.2, 0.5))} />
      <Ver x={290} y={50} n={3} cap="insert lands" o={easeOut(seg(t, 0.7, 1.0))} />
      <Ver x={480} y={50} n={4} cap="delete?" f={C.second} stroke={C.second} o={easeOut(seg(t, 1.2, 1.5))} />
      <AnswerRow y={145} label="under the default level" answer={answer} value="it commits" k={easeOut(seg(t, 2.0, 2.5))} />
      <Verdict answer={answer} y={188} text="some valid order is enough" />
    </Svg>
  );
}

// 6 · WriteSerializable. Insert and delete cards in log order; the delete card rises and the insert card sinks as they
// trade places into a valid logical order; WriteSerializable commits; beneath, Serializable checks the insert's file and,
// finding it outside the delete's condition, commits too.
export function RevealWriteSerializableAllows({ t }: StepCtx) {
  const sw = easeInOut(seg(t, 0.9, 1.8));
  return (
    <Svg label="writeserializable (databricks' default) lets it commit: the two can still be ordered." h={230}>
      <T x={25} y={25} s={11} f={C.latte} o={easeOut(seg(t, 0.1, 0.4))}>
        log order, then a valid logical order
      </T>
      <Cell x={lerp(25, 245, sw)} y={lerp(70, 40, sw)} w={200} h={28} label="insert part-00003" o={easeOut(seg(t, 0.2, 0.5))} />
      <Cell x={lerp(245, 25, sw)} y={lerp(70, 100, sw)} w={200} h={28} label="delete part-00000" stroke={C.second} o={easeOut(seg(t, 0.3, 0.6))} />
      <MiniTick x={470} y={60} k={easeOut(seg(t, 2.1, 2.4))} />
      <T x={490} y={68} s={11} f={C.focus} o={easeOut(seg(t, 2.1, 2.4))}>
        commits
      </T>
      <T x={25} y={160} s={12} f={C.focus} o={easeOut(seg(t, 2.0, 2.3))}>
        WriteSerializable, Databricks' default: commits
      </T>
      <T x={25} y={195} s={12} f={C.second} o={easeOut(seg(t, 3.0, 3.4))}>
        Serializable: outside the delete's condition, commits too
      </T>
    </Svg>
  );
}

// 7 · The overlapping case. The insert's new row matches the delete's condition, joined by a line; WriteSerializable
// ticks; Serializable is crossed.
export function RevealOverlappingCase({ t }: StepCtx) {
  return (
    <Svg label="now the insert's new row matches the delete's condition. writeserializable still allows it." h={230}>
      <Cell x={25} y={30} w={230} h={30} label="insert adds part-00003" o={easeOut(seg(t, 0.2, 0.5))} />
      <Cell x={330} y={30} w={245} h={30} label="delete's condition matches" stroke={C.second} o={easeOut(seg(t, 0.6, 0.9))} />
      <line x1={257} y1={45} x2={lerp(257, 328, easeOut(seg(t, 1.1, 1.5)))} y2={45} stroke={C.cherryText} strokeWidth={2.2} />
      <T x={292} y={85} s={11} f={C.cherryText} a="middle" o={easeOut(seg(t, 1.4, 1.7))}>
        a row it would delete
      </T>
      <Cell x={25} y={110} w={260} h={30} label="WriteSerializable" stroke={C.focus} o={easeOut(seg(t, 1.9, 2.2))} />
      <MiniTick x={300} y={120} k={easeOut(seg(t, 2.3, 2.6))} />
      <T x={320} y={130} s={12} f={C.focus} o={easeOut(seg(t, 2.4, 2.7))}>
        still commits
      </T>
      <Cell x={25} y={160} w={260} h={30} label="Serializable" stroke={C.cherryText} o={easeOut(seg(t, 2.9, 3.2))} />
      <Cross x={307} y={175} k={easeOut(seg(t, 3.3, 3.6))} />
      <T x={325} y={180} s={12} f={C.cherryText} o={easeOut(seg(t, 3.4, 3.7))}>
        refused
      </T>
    </Svg>
  );
}

// 8 · Why DynamoDB. Without a conditional write, both writers' PUTs to the v1 file succeed and the second silently replaces
// the first; then a DynamoDB coordinator box sits between them and the store, letting one through at a time.
export function RevealWhyDynamoDbExisted({ t }: StepCtx) {
  const lost = easeOut(seg(t, 1.6, 2.0));
  return (
    <Svg label="before s3 had conditional writes, two writers could both win the same version. that needed an external lock." h={230}>
      <T x={25} y={25} s={11} f={C.latte} o={easeOut(seg(t, 0.1, 0.4))}>
        before conditional writes: a plain PUT
      </T>
      <Cell x={25} y={40} w={100} h={28} label="A" o={easeOut(seg(t, 0.2, 0.5))} />
      <Cell x={25} y={90} w={100} h={28} label="B" o={easeOut(seg(t, 0.3, 0.6))} />
      <line x1={127} y1={54} x2={lerp(127, 398, easeOut(seg(t, 0.6, 1.0)))} y2={lerp(54, 72, easeOut(seg(t, 0.6, 1.0)))} stroke={C.latte} strokeWidth={1.8} />
      <line x1={127} y1={104} x2={lerp(127, 398, easeOut(seg(t, 1.0, 1.4)))} y2={lerp(104, 86, easeOut(seg(t, 1.0, 1.4)))} stroke={C.latte} strokeWidth={1.8} />
      <Cell x={400} y={60} w={175} h={36} label={lost > 0.5 ? "v1: B's" : "v1: A's"} stroke={lost > 0.5 ? C.cherryText : C.latte} o={easeOut(seg(t, 0.8, 1.1))} />
      <T x={330} y={120} s={11} f={C.cherryText} o={lost}>
        both won; A silently lost
      </T>
      <Cell x={175} y={160} w={250} h={30} label="DynamoDB commit coordinator" stroke={C.second} o={easeOut(seg(t, 2.6, 3.0))} />
      <T x={25} y={218} s={12} f={C.focus} o={easeOut(seg(t, 3.4, 3.8))}>
        an external lock, one writer at a time
      </T>
    </Svg>
  );
}

// 9 · The catalog takes over. A release timeline: 4.0 in September 2025, the catalog as source of truth; 4.2, the commit
// itself; 4.3, every other operation, listed.
export function RevealCatalogManagedTimeline({ t }: StepCtx) {
  const rel = [
    { v: '4.0', note: 'preview: catalog is the source of truth', sub: 'September 2025' },
    { v: '4.2', note: 'the commit moves under the catalog', sub: '' },
    { v: '4.3', note: 'loads, CREATE, REPLACE, schema writes', sub: '' },
  ];
  return (
    <Svg label="4.0 previews the catalog as source of truth; 4.2 moves commits under it; 4.3 moves everything else." h={260}>
      <line x1={60} y1={30} x2={60} y2={lerp(30, 220, easeInOut(seg(t, 0.1, 2.8)))} stroke={C.mocha} strokeWidth={2} />
      {rel.map((r, i) => {
        const y = 40 + i * 75;
        const b = 0.3 + i * 1.1;
        return (
          <g key={r.v} opacity={easeOut(seg(t, b, b + 0.4))}>
            <circle cx={60} cy={y} r={16} fill={C.cocoa} stroke={i === 2 ? C.focus : C.second} strokeWidth={2} />
            <T x={60} y={y + 4.5} s={11} f={C.crema} a="middle">
              {r.v}
            </T>
            <T x={95} y={y + 5} s={12} f={C.crema}>
              {r.note}
            </T>
            {r.sub && (
              <T x={95} y={y + 29} s={11} f={C.latte}>
                {r.sub}
              </T>
            )}
          </g>
        );
      })}
      <T x={25} y={250} s={12} f={C.focus} o={easeOut(seg(t, 3.8, 4.2))}>
        one place that answers for the whole table
      </T>
    </Svg>
  );
}

// 10 · Recap.
export function Recap({ t }: StepCtx) {
  return (
    <Svg label="a commit is a put-if-absent write; isolation decides what races may commit; the catalog takes over both." h={250}>
      <Row y={40} label="a commit" value="put-if-absent" valueColor={C.focus} k={easeOut(seg(t, 0.2, 0.6))} />
      <Row y={100} label="isolation" value="which races stand" valueColor={C.second} k={easeOut(seg(t, 1.2, 1.6))} />
      <Row y={160} label="the catalog" value="takes over the commit" k={easeOut(seg(t, 2.2, 2.6))} />
    </Svg>
  );
}
