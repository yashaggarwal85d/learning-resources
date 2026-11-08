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

/** One index page drawn as a box whose fill shows how full it is. */
function PageBox({ x, y, w = 60, h = 22, full, o = 1, stroke = C.mocha }: { x: number; y: number; w?: number; h?: number; full: number; o?: number; stroke?: string }) {
  return (
    <g opacity={o}>
      <rect x={x} y={y} width={w} height={h} rx={3} fill={C.cocoa} stroke={stroke} strokeWidth={1.5} />
      <rect x={x + 2} y={y + 2} width={(w - 4) * clamp(full)} height={h - 4} rx={2} fill={C.second} opacity={0.7} />
    </g>
  );
}

// 1 · Hook. A long run of pages and one wanted row; a scan checks page after page in order, the question being what finds the
// right page without that walk.
export function Hook({ t }: StepCtx) {
  const n = Math.floor(clamp(seg(t, 0.8, 3.0)) * 18);
  return (
    <Svg label="every topic so far assumed you know which page holds the row — what finds it fast?" h={220}>
      <Row y={40} label="many pages, one row" value="check them all?" k={easeOut(seg(t, 0.3, 0.8))} />
      {Array.from({ length: 18 }, (_, i) => (
        <rect
          key={i}
          x={25 + i * 30.5}
          y={80}
          width={26}
          height={30}
          rx={3}
          fill={i === 15 ? C.focus : C.cocoa}
          stroke={i < n ? C.cherryText : C.mocha}
          strokeWidth={1.5}
          opacity={easeOut(seg(t, 0.4, 0.7))}
        />
      ))}
      <T x={25 + 15 * 30.5 + 13} y={130} s={11} f={C.focus} a="middle" o={easeOut(seg(t, 0.6, 0.9))}>
        the row
      </T>
      <Row y={185} label="instead of a walk" value="a structure" valueColor={C.focus} k={easeOut(seg(t, 3.3, 3.8))} />
    </Svg>
  );
}

// 2 · Fanout. A root fans out to many leaves below it; 50,000 rows, and the real index is two levels deep.
export function RevealFanout({ t }: StepCtx) {
  const f = easeOut(seg(t, 1.0, 2.0));
  return (
    <Svg label="a real index on fifty thousand rows, read directly — how deep is it?" h={230}>
      <Row y={40} label="50,000 rows" value="two levels deep" valueColor={C.focus} k={easeOut(seg(t, 2.8, 3.3))} />
      <PageBox x={260} y={66} w={80} full={0.6} stroke={C.focus} o={easeOut(seg(t, 0.4, 0.8))} />
      <T x={360} y={82} s={11} f={C.focus} o={easeOut(seg(t, 0.6, 0.9))}>
        root
      </T>
      {Array.from({ length: 12 }, (_, i) => {
        const x = 25 + i * 46;
        const k = clamp(f * 12 - i);
        return (
          <g key={i} opacity={k}>
            <path d={`M300 88 L${x + 20} 136`} stroke={C.latte} strokeWidth={1} />
            <PageBox x={x} y={136} w={40} full={0.9} />
          </g>
        );
      })}
      <T x={25} y={180} s={11} f={C.latte} o={easeOut(seg(t, 2.0, 2.3))}>
        leaves, many per root
      </T>
      <Row y={215} label="fanout" value="depth barely grows" valueColor={C.focus} k={easeOut(seg(t, 3.4, 3.9))} />
    </Svg>
  );
}

// 3 · A page split, cascading. A full leaf takes one more tuple and splits in two; its parent, also full, splits too; at the root
// the split adds a new level on top.
export function RevealPageSplit({ t }: StepCtx) {
  const s1 = easeInOut(seg(t, 0.8, 1.4));
  const s2 = easeInOut(seg(t, 1.8, 2.4));
  const s3 = easeOut(seg(t, 2.8, 3.3));
  return (
    <Svg label="a leaf that can't fit a new tuple splits, and the split can cascade up to the root" h={240}>
      <PageBox x={lerp(270, 210, s3)} y={lerp(30, 30, s3)} w={60} full={1} stroke={C.focus} o={s3} />
      <T x={290} y={24} s={11} f={C.focus} o={s3} a="end">
        new root
      </T>
      <PageBox x={lerp(270, 230, s2)} y={90} w={60} full={s2 > 0 ? 0.5 : 1} stroke={s2 > 0 ? C.second : C.cherryText} />
      <PageBox x={310} y={90} w={60} full={0.5} o={s2} stroke={C.second} />
      <PageBox x={lerp(270, 200, s1)} y={150} w={60} full={s1 > 0 ? 0.5 : 1} stroke={s1 > 0 ? C.second : C.cherryText} />
      <PageBox x={lerp(270, 340, s1)} y={150} w={60} full={0.5} o={s1} stroke={C.second} />
      <path d={`M300 112 V150`} stroke={C.latte} strokeWidth={1} opacity={1 - s1} />
      {s1 > 0 && <path d={`M260 112 L230 150 M300 112 L370 150`} stroke={C.latte} strokeWidth={1} />}
      {s3 > 0 && <path d={`M240 52 L260 90 M240 52 L340 90`} stroke={C.latte} strokeWidth={1} opacity={s3} />}
      <circle cx={lerp(560, 300, easeOut(seg(t, 0.2, 0.8)))} cy={161} r={5} fill={C.focus} opacity={1 - s1} />
      <T x={25} y={165} s={11} f={C.latte}>
        leaf
      </T>
      <T x={25} y={105} s={11} f={C.latte}>
        parent
      </T>
      <Row y={220} label="a split at the root" value="a new level" valueColor={C.focus} k={easeOut(seg(t, 3.4, 3.9))} />
    </Svg>
  );
}

// 4 · Predict: pack tight or leave room? A new index's pages, either filled to the brim or half empty; then the question.
export function PredictFillfactor({ t, answer }: StepCtx) {
  return (
    <Svg label="a brand-new index: pack every page full, or leave real room on purpose?" h={210}>
      <Row y={40} label="50,000 rows, a new index" value="pack it full?" k={easeOut(seg(t, 0.1, 0.5))} />
      {Array.from({ length: 4 }, (_, i) => (
        <PageBox key={i} x={25 + i * 66} y={64} full={easeOut(seg(t, 0.3, 0.8))} o={easeOut(seg(t, 0.2, 0.5))} />
      ))}
      {Array.from({ length: 4 }, (_, i) => (
        <PageBox key={i} x={315 + i * 66} y={64} full={0.4 * easeOut(seg(t, 0.3, 0.8))} o={easeOut(seg(t, 0.4, 0.7))} />
      ))}
      <AnswerRow y={140} label="as full as possible" answer={answer} value="no, leave room" k={easeOut(seg(t, 1.2, 1.7))} />
      <Verdict answer={answer} text="room now means fewer splits later" />
    </Svg>
  );
}

// 5 · The fillfactor measurement. 4,000 inserts land inside the existing key range of two indexes: fillfactor 100 keeps splitting
// and adds pages; fillfactor 10 absorbs them in place.
export function RevealFillfactorMeasurement({ t }: StepCtx) {
  const g = clamp(seg(t, 0.8, 2.8));
  const added = Math.floor(g * 5);
  return (
    <Svg label="the identical mid-range inserts against a tight and a loose index — which one grows?" h={240}>
      <Row y={40} label="4,000 mid-range inserts" value="two indexes" k={easeOut(seg(t, 0.2, 0.7))} />
      <T x={25} y={86} s={12} f={C.latte} o={easeOut(seg(t, 0.4, 0.7))}>
        fillfactor 100
      </T>
      {Array.from({ length: 4 + added }, (_, i) => (
        <PageBox key={i} x={160 + i * 46} y={72} w={40} full={1} stroke={i >= 4 ? C.cherryText : C.mocha} />
      ))}
      <T x={25} y={136} s={12} f={C.latte} o={easeOut(seg(t, 0.4, 0.7))}>
        fillfactor 10
      </T>
      {Array.from({ length: 4 }, (_, i) => (
        <PageBox key={i} x={160 + i * 46} y={122} w={40} full={0.1 + 0.6 * g} stroke={C.focus} />
      ))}
      <Row y={185} label="tight" value="grows by real pages" valueColor={C.cherryText} k={easeOut(seg(t, 3.0, 3.4))} />
      <Row y={225} label="loose" value="absorbs them in place" valueColor={C.focus} k={easeOut(seg(t, 3.5, 3.9))} />
    </Svg>
  );
}

// 6 · Deduplication. Ten distinct values over 50,000 rows: with deduplication off, every duplicate is its own entry; on, each
// value's duplicates pack into one posting list, and the index shrinks.
export function RevealDeduplicationMeasurement({ t }: StepCtx) {
  const p = easeInOut(seg(t, 1.4, 2.4));
  return (
    <Svg label="ten distinct values across fifty thousand rows, indexed with and without deduplication" h={240}>
      <Row y={40} label="50,000 rows, 10 values" value="indexed twice" k={easeOut(seg(t, 0.2, 0.7))} />
      <T x={25} y={86} s={12} f={C.latte} o={easeOut(seg(t, 0.4, 0.7))}>
        dedup off
      </T>
      {Array.from({ length: 30 }, (_, i) => (
        <rect key={i} x={160 + i * 13.5} y={74} width={10} height={16} rx={1} fill={[C.crema, C.second, C.focus][i % 3]} opacity={0.75 * easeOut(seg(t, 0.5 + i * 0.02, 0.8 + i * 0.02))} />
      ))}
      <T x={25} y={136} s={12} f={C.latte} o={easeOut(seg(t, 1.3, 1.6))}>
        dedup on
      </T>
      {Array.from({ length: 30 }, (_, i) => {
        const g = i % 3;
        const j = Math.floor(i / 3);
        return (
          <rect
            key={i}
            x={lerp(160 + i * 13.5, 160 + g * 60 + j * 4, p)}
            y={124}
            width={lerp(10, 4, p)}
            height={16}
            rx={1}
            fill={[C.crema, C.second, C.focus][g]}
            opacity={0.75 * easeOut(seg(t, 1.3, 1.6))}
          />
        );
      })}
      <T x={360} y={136} s={11} f={C.focus} o={easeOut(seg(t, 2.4, 2.7))}>
        one posting list per value
      </T>
      <Row y={200} label="deduplicated index" value="a fraction the size" valueColor={C.focus} k={easeOut(seg(t, 3.2, 3.7))} />
    </Svg>
  );
}

// 7 · Lehman-Yao. A search reaches a page just as it splits; its key is above the page's high key, so it follows the right-link to
// the new sibling, with no lock on the tree.
export function RevealLehmanYao({ t }: StepCtx) {
  const s = easeInOut(seg(t, 0.8, 1.4));
  const m = easeInOut(seg(t, 2.0, 2.8));
  return (
    <Svg label="a search reading a page exactly as it splits — a right-link and a high key, instead of a whole-tree lock" h={240}>
      <Row y={40} label="Lehman–Yao 1981" value="right-link, high key" k={easeOut(seg(t, 0.2, 0.7))} />
      <PageBox x={120} y={80} w={160} full={s > 0 ? 0.5 : 1} />
      <T x={200} y={124} s={11} f={C.second} a="middle" o={s}>
        high key
      </T>
      <line x1={278} y1={76} x2={278} y2={106} stroke={C.second} strokeWidth={2} opacity={s} />
      <PageBox x={340} y={80} w={160} full={0.5} o={s} />
      <path d="M282 91 H336" stroke={C.focus} strokeWidth={1.5} opacity={s} />
      <T x={309} y={74} s={10} f={C.focus} a="middle" o={s}>
        right-link
      </T>
      <circle cx={lerp(200, 420, m)} cy={91} r={6} fill={C.cherryText} opacity={easeOut(seg(t, 0.4, 0.7))} />
      <T x={25} y={95} s={11} f={C.latte} o={easeOut(seg(t, 0.4, 0.7))}>
        search
      </T>
      <T x={25} y={160} s={11} f={C.latte} o={easeOut(seg(t, 2.0, 2.3))}>
        key above the high key: the page split, so follow the link
      </T>
      <Row y={215} label="a whole-tree lock" value="not needed" valueColor={C.focus} k={easeOut(seg(t, 3.2, 3.7))} />
    </Svg>
  );
}

// 8 · Two production features. PostgreSQL 18's skip scan uses an (a, b) index for a query on b alone; InnoDB's clustered table
// makes a secondary lookup walk two trees.
export function RevealProductionFeatures({ t }: StepCtx) {
  const a = easeOut(seg(t, 2.0, 2.6));
  return (
    <Svg label="PostgreSQL 18's skip scan, and a clustered table's extra traversal on a secondary lookup" h={240}>
      <Row y={40} label="PostgreSQL 18" value="skip scan" k={easeOut(seg(t, 0.2, 0.7))} />
      <Cell x={25} y={60} w={170} label="index on (a, b)" o={easeOut(seg(t, 0.4, 0.8))} />
      <path d="M195 74 H230" stroke={C.latte} strokeWidth={1.5} opacity={easeOut(seg(t, 0.8, 1.1))} />
      <Cell x={230} y={60} w={200} label="WHERE b = …" stroke={C.focus} f={C.focus} o={easeOut(seg(t, 1.0, 1.4))} />
      <T x={445} y={79} s={11} f={C.focus} o={easeOut(seg(t, 1.4, 1.7))}>
        still used
      </T>
      <Row y={125} label="InnoDB, clustered" value="two traversals" valueColor={C.second} k={easeOut(seg(t, 1.8, 2.3))} />
      <Cell x={25} y={146} w={170} label="secondary index" o={a} />
      <path d="M195 160 H230" stroke={C.latte} strokeWidth={1.5} opacity={a} />
      <Cell x={230} y={146} w={200} label="primary-key tree" stroke={C.second} f={C.second} o={easeOut(seg(t, 2.6, 3.0))} />
      <T x={445} y={165} s={11} f={C.second} o={easeOut(seg(t, 3.0, 3.3))}>
        then the row
      </T>
      <Row y={220} label="a heap table" value="skips the second" k={easeOut(seg(t, 3.5, 4.0))} />
    </Svg>
  );
}

// 9 · Recap. Four rows land one per beat.
export function Recap({ t }: StepCtx) {
  return (
    <Svg label="fanout keeps depth small; fillfactor and deduplication are measured trade-offs; no whole-tree lock" h={240}>
      <Row y={40} label="fanout" value="two levels, 50,000 rows" k={easeOut(seg(t, 0.4, 0.9))} />
      <Row y={95} label="fillfactor" value="room now, fewer splits" valueColor={C.focus} k={easeOut(seg(t, 1.3, 1.8))} />
      <Row y={150} label="deduplication" value="a fraction the size" k={easeOut(seg(t, 2.2, 2.7))} />
      <Row y={205} label="concurrent writes" value="no whole-tree lock" valueColor={C.focus} k={easeOut(seg(t, 3.1, 3.6))} />
    </Svg>
  );
}

// 10 · Prove: dedup on unique values. Packed posting lists; after the answer the values turn unique and the lists unpack into
// single entries, the saving gone.
export function ProveIt({ t, answer }: StepCtx) {
  const s = useSinceAnswer(answer !== null);
  const u = answer !== null ? easeInOut(seg(s, 0.1, 0.7)) : 0;
  const v = answer !== null ? easeOut(seg(s, 0.8, 1.2)) : 0;
  return (
    <Svg label="the column becomes nearly all unique — what happens to deduplication's benefit?" h={230}>
      <Row y={40} label="values made unique" value="still saving?" k={easeOut(seg(t, 0.1, 0.5))} />
      <AnswerRow y={90} label="the same saving" answer={answer} value="no, it disappears" f={C.cherryText} k={easeOut(seg(t, 0.4, 0.9))} />
      {Array.from({ length: 24 }, (_, i) => {
        const g = i % 3;
        const j = Math.floor(i / 3);
        return (
          <rect
            key={i}
            x={lerp(25 + g * 60 + j * 4, 25 + i * 22, u)}
            y={120}
            width={lerp(4, 18, u)}
            height={16}
            rx={1}
            fill={u > 0.5 ? C.crema : [C.crema, C.second, C.focus][g]}
            opacity={0.75 * easeOut(seg(t, 0.6, 0.9))}
          />
        );
      })}
      {answer !== null && (
        <>
          <T x={300} y={lerp(198, 190, v)} s={15} f={C.focus} a="middle" o={v}>
            nothing left to pack together
          </T>
          <rect x={150} y={202} width={300 * v} height={3} fill={C.focus} />
        </>
      )}
    </Svg>
  );
}
