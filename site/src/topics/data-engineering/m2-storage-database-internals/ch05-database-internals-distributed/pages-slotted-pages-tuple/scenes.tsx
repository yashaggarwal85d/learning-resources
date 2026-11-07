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

/** The chapter's page primitive: an outline, a header strip at the left, `lps` line pointers growing right from it and `tups`
 * tuples growing left from the end, free space between. */
function Page({ y, h = 50, lps, tups, o = 1, tw = 60 }: { y: number; h?: number; lps: number; tups: number; o?: number; tw?: number }) {
  return (
    <g opacity={o}>
      <rect x={25} y={y} width={550} height={h} rx={4} fill="none" stroke={C.mocha} strokeWidth={1.5} />
      <rect x={25} y={y} width={60} height={h} rx={4} fill={C.second} opacity={0.5} />
      {Array.from({ length: Math.ceil(lps) }, (_, i) => (
        <rect key={i} x={89 + i * 22} y={y + 6} width={18 * clamp(lps - i)} height={h - 12} rx={2} fill={C.focus} opacity={0.75} />
      ))}
      {Array.from({ length: Math.ceil(tups) }, (_, i) => (
        <rect key={i} x={571 - (i + 1) * (tw + 4) + tw * (1 - clamp(tups - i))} y={y + 6} width={tw * clamp(tups - i)} height={h - 12} rx={2} fill={C.crema} opacity={0.75} />
      ))}
    </g>
  );
}

// 1 · Hook. Three tools from earlier chapters each point down into the same engine; under all three sits one unit, still
// unopened.
export function Hook({ t }: StepCtx) {
  const l = easeOut(seg(t, 1.2, 2.0));
  return (
    <Svg label="every engine this course has used — Postgres, RocksDB, Polars reading Parquet — reads and writes the exact same physical unit. What is it?" h={220}>
      <Row y={40} label="every engine underneath" value="one physical unit" k={easeOut(seg(t, 0.3, 0.8))} />
      {['a dataframe library', 'an extension', 'a database client'].map((n, i) => (
        <g key={n}>
          <Cell x={25 + i * 190} y={62} w={170} label={n} o={easeOut(seg(t, 0.4 + i * 0.2, 0.7 + i * 0.2))} />
          <path d={`M${110 + i * 190} 90 L300 ${lerp(90, 132, l)}`} stroke={C.latte} strokeWidth={1.2} opacity={l > 0 ? 1 : 0} />
        </g>
      ))}
      <rect x={225} y={134} width={150} height={44} rx={4} fill={C.cocoa} stroke={C.focus} strokeWidth={1.5} strokeDasharray="5 4" opacity={easeOut(seg(t, 1.9, 2.3))} />
      <T x={300} y={162} s={16} f={C.focus} a="middle" o={easeOut(seg(t, 2.6, 3.0))}>
        ?
      </T>
    </Svg>
  );
}

// 2 · Five parts of a real page. The header strip lands, then line pointers grow rightward while tuples grow leftward from the
// end, the free space between them shrinking.
export function RevealFiveParts({ t }: StepCtx) {
  const g = clamp(seg(t, 1.0, 2.8)) * 3;
  return (
    <Svg label="a real page, read directly from this sandbox's own Postgres cluster — what are its five parts, and which direction does each one grow?" h={240}>
      <Row y={40} label="one page" value="8,192 bytes" k={easeOut(seg(t, 0.2, 0.7))} />
      <Page y={70} lps={g} tups={g} o={easeOut(seg(t, 0.4, 0.8))} />
      <T x={55} y={142} s={11} f={C.second} a="middle" o={easeOut(seg(t, 0.6, 0.9))}>
        header
      </T>
      <T x={95} y={160} s={11} f={C.focus} o={easeOut(seg(t, 1.2, 1.5))}>
        line pointers →
      </T>
      <T x={300} y={142} s={11} f={C.latte} a="middle" o={easeOut(seg(t, 2.2, 2.5))}>
        free space
      </T>
      <T x={575} y={160} s={11} f={C.crema} a="end" o={easeOut(seg(t, 1.4, 1.7))}>
        ← tuples
      </T>
      <Row y={210} label="pd_lower, pd_upper" value="where they meet" valueColor={C.focus} k={easeOut(seg(t, 3.2, 3.7))} />
    </Svg>
  );
}

// 3 · One line pointer decoded. The first pointer in the array draws an arrow out to its tuple; zoomed below, it is nothing but
// an offset and a length, four bytes in all.
export function RevealLinePointer({ t }: StepCtx) {
  const a = easeInOut(seg(t, 0.8, 1.6));
  const z = easeOut(seg(t, 1.8, 2.4));
  return (
    <Svg label="the line-pointer array's own entries, read directly — what does each one actually store?" h={230}>
      <Page y={30} h={40} lps={3} tups={3} />
      <path d={`M98 70 C 98 ${lerp(70, 96, a)}, ${lerp(98, 541, a)} ${lerp(70, 96, a)}, ${lerp(98, 541, a)} 70`} fill="none" stroke={C.focus} strokeWidth={1.5} opacity={a > 0 ? 1 : 0} />
      <path d="M98 70 L98 112" stroke={C.latte} strokeWidth={1} strokeDasharray="3 3" opacity={z} />
      <g opacity={z}>
        <Cell x={25} y={112} w={140} label="lp_off" stroke={C.focus} f={C.focus} />
        <Cell x={170} y={112} w={140} label="lp_len" stroke={C.focus} f={C.focus} />
      </g>
      <T x={330} y={131} s={12} f={C.latte} o={easeOut(seg(t, 2.4, 2.7))}>
        4 bytes in all
      </T>
      <Row y={200} label="one per row" value="offset + length only" valueColor={C.focus} k={easeOut(seg(t, 3.2, 3.7))} />
    </Svg>
  );
}

// 4 · Predict: does the CTID move with the row? Slot 4 points at its tuple; the tuple slides to a new offset; the slot's own
// number is the question.
export function PredictCtidStability({ t, answer }: StepCtx) {
  const m = easeInOut(seg(t, 0.6, 1.2));
  return (
    <Svg label="VACUUM physically moves a surviving row to a new offset inside the page — does that row's own CTID change along with it, or stay exactly where it was?" h={210}>
      <Row y={40} label="VACUUM moves a row" value="CTID changes?" k={easeOut(seg(t, 0.1, 0.5))} />
      <Cell x={25} y={62} w={80} label="slot 4" stroke={C.focus} f={C.focus} o={easeOut(seg(t, 0.2, 0.5))} />
      <Cell x={lerp(300, 480, m)} y={62} w={95} label="row 4" o={easeOut(seg(t, 0.2, 0.5))} />
      <path d={`M105 76 H${lerp(300, 480, m)}`} stroke={C.latte} strokeWidth={1.5} strokeDasharray="4 4" />
      <AnswerRow y={140} label="the CTID changes" answer={answer} value="no, it stays" k={easeOut(seg(t, 1.2, 1.7))} />
      <Verdict answer={answer} text="a CTID names the slot, not the offset" />
    </Svg>
  );
}

// 5 · A real VACUUM. Five rows, five slots; rows 1 to 3 are deleted; VACUUM slides rows 4 and 5 to the page's end and their
// slots re-aim, while the CTIDs (0,4) and (0,5) stay exactly as they were.
export function RevealVacuumMove({ t }: StepCtx) {
  const d = easeOut(seg(t, 0.8, 1.3));
  const m = easeInOut(seg(t, 1.8, 2.6));
  const tupX = (i: number) => 515 - i * 62;
  const finalX = (i: number) => (i === 3 ? 515 : i === 4 ? 453 : tupX(i));
  return (
    <Svg label="a real row, deleted neighbors reclaimed by a real VACUUM — does its CTID survive the move, or does the move break it?" h={240}>
      <Row y={40} label="rows 1 to 3 deleted" value="then VACUUM" k={easeOut(seg(t, 0.2, 0.7))} />
      {[0, 1, 2, 3, 4].map((i) => {
        const dead = i < 3;
        const x = dead ? tupX(i) : lerp(tupX(i), finalX(i), m);
        return (
          <g key={i}>
            <Cell x={25 + i * 46} y={64} w={40} h={24} label={String(i + 1)} stroke={dead ? C.mocha : C.focus} f={dead ? C.latte : C.focus} o={dead ? 1 - 0.6 * d : 1} />
            <Cell x={x} y={128} w={58} h={24} label={`row ${i + 1}`} o={dead ? 1 - d : 1} />
            {(!dead || d < 1) && <path d={`M${45 + i * 46} 88 L${x + 29} 128`} stroke={dead ? C.mocha : C.focus} strokeWidth={1.2} opacity={dead ? 1 - d : 1} />}
          </g>
        );
      })}
      <T x={300} y={78} s={11} f={C.latte} o={easeOut(seg(t, 0.4, 0.7))}>
        slots
      </T>
      <T x={25} y={176} s={12} f={C.focus} o={easeOut(seg(t, 2.8, 3.1))}>
        CTIDs (0,4), (0,5): before = after
      </T>
      <MiniTick x={345} y={170} k={easeOut(seg(t, 3.1, 3.4))} />
      <Row y={220} label="the offsets" value="moved; the CTIDs did not" valueColor={C.focus} k={easeOut(seg(t, 3.4, 3.9))} />
    </Svg>
  );
}

// 6 · The null bitmap. Row 1 has a null note: its header carries a bitmap, 1 1 0, the 0 under note. Row 2 has every column
// filled and carries no bitmap at all.
export function RevealNullBitmap({ t }: StepCtx) {
  const cols = ['id', 'name', 'note'];
  return (
    <Svg label="a row with one null column, read directly — does the bitmap actually mark which column is missing?" h={230}>
      <Row y={40} label="a null column" value="one bit marks it" k={easeOut(seg(t, 0.2, 0.7))} />
      <Cell x={25} y={64} w={250} label="(1, 'alice', NULL)" o={easeOut(seg(t, 0.4, 0.8))} />
      {cols.map((c, i) => (
        <g key={c} opacity={easeOut(seg(t, 1.0 + i * 0.3, 1.3 + i * 0.3))}>
          <Cell x={330 + i * 82} y={64} w={74} label={i === 2 ? '0' : '1'} stroke={i === 2 ? C.cherryText : C.second} f={i === 2 ? C.cherryText : C.second} />
          <T x={367 + i * 82} y={108} s={11} f={C.latte} a="middle">
            {c}
          </T>
        </g>
      ))}
      <Cell x={25} y={124} w={250} label="(2, 'bob', 'has a note')" o={easeOut(seg(t, 2.4, 2.8))} />
      <Cell x={330} y={124} w={238} label="no bitmap at all" f={C.latte} o={easeOut(seg(t, 2.8, 3.2))} />
      <Row y={200} label="a bitmap" value="only when a null exists" valueColor={C.focus} k={easeOut(seg(t, 3.4, 3.9))} />
    </Svg>
  );
}

// 7 · TOAST. A short value sits inline. The 8,000-byte value is far too long for the page: it is chopped into chunks that slide
// down into the TOAST table, and the main-table row keeps only a small pointer.
export function RevealToastMove({ t }: StepCtx) {
  const c = easeInOut(seg(t, 1.8, 2.8));
  return (
    <Svg label="an incompressible value far past the TOAST threshold, inserted for real — how much smaller is the row that's actually left in the main table?" h={240}>
      <Row y={40} label="an 8,000-byte value" value="too big to stay" k={easeOut(seg(t, 0.2, 0.7))} />
      <T x={25} y={82} s={11} f={C.latte} o={easeOut(seg(t, 0.4, 0.7))}>
        main table
      </T>
      <rect x={110} y={70} width={465} height={18} rx={3} fill="none" stroke={C.mocha} strokeWidth={1.2} opacity={easeOut(seg(t, 0.4, 0.7))} />
      {Array.from({ length: 6 }, (_, i) => (
        <rect key={i} x={lerp(114 + i * 76, 114 + i * 76, c)} y={lerp(74, 142, c)} width={72} height={10} rx={2} fill={C.crema} opacity={easeOut(seg(t, 0.8, 1.2)) * (c > 0 ? 1 : 0.8)} />
      ))}
      <rect x={114} y={74} width={40 * easeOut(seg(t, 2.6, 3.0))} height={10} rx={2} fill={C.focus} />
      <T x={162} y={83} s={11} f={C.focus} o={easeOut(seg(t, 2.8, 3.1))}>
        pointer
      </T>
      <T x={25} y={150} s={11} f={C.latte} o={easeOut(seg(t, 2.0, 2.3))}>
        TOAST
      </T>
      <Row y={210} label="the main-table row" value="far smaller" valueColor={C.focus} k={easeOut(seg(t, 3.4, 3.9))} />
    </Svg>
  );
}

// 8 · InnoDB, sourced. On the left Postgres' answer: a pointer out to a separate TOAST table. On the right InnoDB's: overflow
// pages chained onto the row itself.
export function RevealInnodbOverflow({ t }: StepCtx) {
  const r = easeOut(seg(t, 1.8, 2.6));
  return (
    <Svg label="InnoDB's own documentation, on the identical fixed-page problem — does it solve it the same way TOAST does, or differently?" h={230}>
      <Row y={40} label="InnoDB, from its docs" value="overflow pages" valueColor={C.latte} k={easeOut(seg(t, 0.2, 0.7))} />
      <T x={25} y={76} s={11} f={C.latte} o={easeOut(seg(t, 0.4, 0.7))}>
        Postgres
      </T>
      <Cell x={25} y={86} w={110} label="row" o={easeOut(seg(t, 0.5, 0.8))} />
      <path d="M135 100 H170" stroke={C.latte} strokeWidth={1.5} opacity={easeOut(seg(t, 0.8, 1.1))} />
      <Cell x={170} y={86} w={110} label="TOAST table" o={easeOut(seg(t, 1.0, 1.3))} />
      <T x={325} y={76} s={11} f={C.second} o={easeOut(seg(t, 1.4, 1.7))}>
        InnoDB
      </T>
      <Cell x={325} y={86} w={90} label="row" stroke={C.second} o={easeOut(seg(t, 1.5, 1.8))} />
      {[0, 1, 2].map((i) => (
        <rect key={i} x={425 + i * 50} y={88} width={42} height={24} rx={3} fill="none" stroke={C.second} strokeWidth={1.5} strokeDasharray="4 3" opacity={clamp(r * 3 - i)} />
      ))}
      <T x={575} y={132} s={11} f={C.second} a="end" o={r}>
        overflow pages, on the row
      </T>
      <Row y={195} label="the same problem" value="a different fix" valueColor={C.focus} k={easeOut(seg(t, 3.3, 3.8))} />
    </Svg>
  );
}

// 9 · Recap. Six rows land one per beat.
export function Recap({ t }: StepCtx) {
  return (
    <Svg label="a page's own five parts, a line pointer decoded, a CTID surviving a real VACUUM, a real null bitmap, a real TOAST move, and InnoDB's own different answer to the same problem" h={260}>
      <Row y={30} label="a page" value="five parts, two growing" k={easeOut(seg(t, 0.4, 0.9))} />
      <Row y={70} label="a line pointer" value="offset + length" k={easeOut(seg(t, 1.0, 1.5))} />
      <Row y={110} label="VACUUM" value="moves rows, not CTIDs" valueColor={C.focus} k={easeOut(seg(t, 1.6, 2.1))} />
      <Row y={150} label="a null bitmap" value="only when needed" k={easeOut(seg(t, 2.2, 2.7))} />
      <Row y={190} label="TOAST" value="chunks, a pointer left" k={easeOut(seg(t, 2.8, 3.3))} />
      <Row y={230} label="InnoDB" value="a different fix" valueColor={C.second} k={easeOut(seg(t, 3.4, 3.9))} />
    </Svg>
  );
}

// 10 · Prove: a held CTID across a VACUUM. The script holds (0,4); VACUUM slides row 4 to a new offset; after the answer the
// slot's arrow follows it, and the held CTID still lands on row 4.
export function ProveIt({ t, answer }: StepCtx) {
  const s = useSinceAnswer(answer !== null);
  const m = answer !== null ? easeInOut(seg(s, 0.1, 0.7)) : 0;
  const v = answer !== null ? easeOut(seg(s, 0.8, 1.2)) : 0;
  return (
    <Svg label="a script holds a row's CTID across a batch of updates while a VACUUM runs in the middle — does the held CTID still point at the right row, and why?" h={230}>
      <Row y={40} label="a held CTID, then VACUUM" value="still right?" k={easeOut(seg(t, 0.1, 0.5))} />
      <AnswerRow y={90} label="it breaks" answer={answer} value="no, still right" k={easeOut(seg(t, 0.4, 0.9))} />
      <Cell x={25} y={112} w={110} label="script: (0,4)" o={easeOut(seg(t, 0.6, 0.9))} />
      <path d="M135 126 H190" stroke={C.focus} strokeWidth={1.5} opacity={easeOut(seg(t, 0.8, 1.1))} />
      <Cell x={190} y={112} w={70} label="slot 4" stroke={C.focus} f={C.focus} o={easeOut(seg(t, 0.8, 1.1))} />
      <path d={`M260 126 H${lerp(330, 470, m)}`} stroke={C.focus} strokeWidth={1.5} opacity={easeOut(seg(t, 1.0, 1.3))} />
      <Cell x={lerp(330, 470, m)} y={112} w={100} label="row 4" o={easeOut(seg(t, 1.0, 1.3))} />
      {answer !== null && (
        <>
          <T x={300} y={lerp(198, 190, v)} s={15} f={C.focus} a="middle" o={v}>
            only the slot's offset changed
          </T>
          <rect x={150} y={202} width={300 * v} height={3} fill={C.focus} />
        </>
      )}
    </Svg>
  );
}
