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

const RX = (i: number) => 25 + i * 52;

/** The data file's ten rows, ids 0 to 9 in positions 0 to 9; `st(i)` gives a row's state: plain, hit (struck) or scan. */
function Rows({ y, o = 1, st }: { y: number; o?: number; st?: (i: number) => 'hit' | 'scan' | 'keep' | undefined }) {
  return (
    <g opacity={o}>
      {Array.from({ length: 10 }, (_, i) => {
        const s = st?.(i);
        const stroke = s === 'hit' ? C.cherryText : s === 'scan' ? C.second : s === 'keep' ? C.focus : C.latte;
        return (
          <g key={i}>
            <rect x={RX(i)} y={y} width={44} height={30} rx={3} fill={C.cocoa} stroke={stroke} strokeWidth={s ? 2 : 1.2} />
            <T x={RX(i) + 22} y={y + 19.5} s={12} f={s === 'hit' ? C.cherryText : C.crema} a="middle">
              {String(i)}
            </T>
            {s === 'hit' && <line x1={RX(i) + 4} y1={y + 15} x2={RX(i) + 40} y2={y + 15} stroke={C.cherryText} strokeWidth={2} />}
          </g>
        );
      })}
    </g>
  );
}

// 1 · Hook. Several files; one is pruned whole and crossed; a surviving file opens to its rows, and one row inside it turns
// red: it has to go without the file being rewritten.
export function Hook({ t }: StepCtx) {
  return (
    <Svg label="hidden partitioning prunes whole files -- a single file's own rows still need deletes." h={200}>
      {[0, 1, 2].map((i) => (
        <rect
          key={i}
          x={25 + i * 60}
          y={30}
          width={45}
          height={55}
          rx={3}
          fill={C.cocoa}
          stroke={C.latte}
          strokeWidth={1.4}
          opacity={easeOut(seg(t, 0.1 + i * 0.1, 0.4 + i * 0.1)) * (i === 0 && t > 1.0 ? 0.4 : 1)}
        />
      ))}
      <Cross x={47} y={57} k={easeOut(seg(t, 0.8, 1.1))} />
      <T x={25} y={110} s={11} f={C.latte} o={easeOut(seg(t, 0.9, 1.2))}>
        a whole file, pruned
      </T>
      <rect x={250} y={25} width={300} height={95} rx={4} fill="none" stroke={C.latte} strokeWidth={1.4} opacity={easeOut(seg(t, 1.6, 2.0))} />
      {Array.from({ length: 6 }, (_, i) => (
        <rect key={i} x={262} y={33 + i * 14} width={276} height={9} rx={1} fill={i === 3 && t > 2.6 ? C.cherryText : C.mocha} opacity={easeOut(seg(t, 1.8 + i * 0.06, 2.0 + i * 0.06))} />
      ))}
      <T x={250} y={145} s={12} f={C.cherryText} o={easeOut(seg(t, 2.7, 3.0))}>
        one row has to go
      </T>
      <T x={250} y={180} s={13} f={C.crema} o={easeOut(seg(t, 3.5, 3.9))}>
        without rewriting the file
      </T>
    </Svg>
  );
}

// 2 · Predict. An upsert writer knows only a value, id 4; the file's positions are hidden from it; the answer: the value.
export function PredictUpsertNoPosition({ t, answer }: StepCtx) {
  return (
    <Svg label="a streaming upsert writer deletes a row it never rewrote -- it has no position for it." h={200}>
      <Cell x={25} y={30} w={150} h={30} label="upsert writer" o={easeOut(seg(t, 0.1, 0.4))} />
      <T x={25} y={85} s={12} f={C.focus} o={easeOut(seg(t, 0.6, 0.9))}>
        knows: id = 4
      </T>
      <rect x={260} y={25} width={315} height={40} rx={4} fill={C.cocoa} stroke={C.mocha} strokeWidth={1.4} strokeDasharray="5 4" opacity={easeOut(seg(t, 0.9, 1.2))} />
      <T x={417} y={50} s={12} f={C.latte} a="middle" o={easeOut(seg(t, 1.0, 1.3))}>
        the file it never opened
      </T>
      <T x={260} y={95} s={16} f={C.second} o={easeOut(seg(t, 1.6, 2.0))}>
        position: unknown
      </T>
      <AnswerRow y={140} label="it writes" answer={answer} value="the value, id = 4" k={easeOut(seg(t, 2.2, 2.7))} />
      <Verdict answer={answer} y={188} text="the burden moves to the reader" />
    </Svg>
  );
}

// 3 · Equality delete, built. The ten-row data file; an equality delete file lands beside it with two entries, id = 4 and
// id = 8; no position anywhere.
export function RevealEqualityDeleteBuilt({ t }: StepCtx) {
  return (
    <Svg label="reproduced for real: an equality delete file, naming column values instead of a position." h={230}>
      <T x={25} y={25} s={11} f={C.latte} o={easeOut(seg(t, 0.1, 0.4))}>
        data file, ten rows by id
      </T>
      <Rows y={35} o={easeOut(seg(t, 0.1, 0.4))} />
      <T x={25} y={108} s={11} f={C.cherryText} o={easeOut(seg(t, 0.9, 1.2))}>
        equality delete file
      </T>
      <Cell x={25} y={118} w={130} h={30} label="id = 4" stroke={C.cherryText} o={easeOut(seg(t, 1.2, 1.5))} />
      <Cell x={170} y={118} w={130} h={30} label="id = 8" stroke={C.cherryText} o={easeOut(seg(t, 1.6, 1.9))} />
      <T x={330} y={138} s={12} f={C.latte} o={easeOut(seg(t, 2.4, 2.7))}>
        no position recorded
      </T>
      <T x={25} y={200} s={13} f={C.crema} o={easeOut(seg(t, 3.2, 3.6))}>
        only the values that disqualify a row
      </T>
    </Svg>
  );
}

// 4 · Position delete, read back. A position delete file with pos 3 and pos 7; arrows drop straight to those two slots, the
// rows strike through, and the scan returns the other eight.
export function RevealPositionDeleteReadBack({ t }: StepCtx) {
  const hit = (i: number) => (i === 3 && t > 1.8) || (i === 7 && t > 2.2);
  return (
    <Svg label="reproduced for real: a position delete, committed and read back through pyiceberg's own scan." h={230}>
      <Cell x={25} y={20} w={130} h={28} label="pos 3" stroke={C.second} o={easeOut(seg(t, 0.2, 0.5))} />
      <Cell x={170} y={20} w={130} h={28} label="pos 7" stroke={C.second} o={easeOut(seg(t, 0.4, 0.7))} />
      <T x={320} y={38} s={11} f={C.latte} o={easeOut(seg(t, 0.4, 0.7))}>
        file path + row ordinal
      </T>
      <line x1={90} y1={48} x2={lerp(90, RX(3) + 22, easeOut(seg(t, 1.0, 1.6)))} y2={lerp(48, 98, easeOut(seg(t, 1.0, 1.6)))} stroke={C.second} strokeWidth={1.8} />
      <line x1={235} y1={48} x2={lerp(235, RX(7) + 22, easeOut(seg(t, 1.4, 2.0)))} y2={lerp(48, 98, easeOut(seg(t, 1.4, 2.0)))} stroke={C.second} strokeWidth={1.8} />
      <Rows y={100} o={easeOut(seg(t, 0.1, 0.4))} st={(i) => (hit(i) ? 'hit' : t > 2.8 ? 'keep' : undefined)} />
      <T x={25} y={170} s={12} f={C.focus} o={easeOut(seg(t, 2.8, 3.1))}>
        table.scan(): the other eight, first try
      </T>
      <T x={25} y={205} s={12} f={C.latte} o={easeOut(seg(t, 3.5, 3.9))}>
        straight to the address, nothing else read
      </T>
    </Svg>
  );
}

// 5 · Predict. A position lookup beside a bare value; the answer: a join over every row.
export function PredictEqualityDeleteCost({ t, answer }: StepCtx) {
  return (
    <Svg label="a position delete is a direct offset lookup. what does an equality delete cost to read?" h={200}>
      <Cell x={25} y={30} w={250} h={30} label="position: go to slot 3" stroke={C.second} o={easeOut(seg(t, 0.1, 0.4))} />
      <MiniTick x={285} y={42} k={easeOut(seg(t, 0.6, 0.9))} />
      <Cell x={25} y={75} w={250} h={30} label="equality: id = 4" stroke={C.cherryText} o={easeOut(seg(t, 1.0, 1.3))} />
      <T x={300} y={95} s={16} f={C.second} o={easeOut(seg(t, 1.6, 2.0))}>
        cost to read?
      </T>
      <AnswerRow y={145} label="an equality delete" answer={answer} value="a join, every row" k={easeOut(seg(t, 2.2, 2.7))} f={C.cherryText} />
      <Verdict answer={answer} y={188} text="every value read and compared" f={C.cherryText} />
    </Svg>
  );
}

// 6 · The join cost, measured. A comparer walks all ten rows, checking each id against the set {4, 8}, and strikes the two
// that match; a counter of compared values climbs to 10; the position delete's count sits at 0 beside it.
export function RevealJoinCostMeasured({ t }: StepCtx) {
  const n = Math.min(10, Math.floor(10 * seg(t, 0.8, 3.0) + 0.0001));
  return (
    <Svg label="reproduced for real: every column value has to be read and compared, a real join." h={230}>
      <Cell x={25} y={20} w={150} h={28} label="delete set: 4, 8" stroke={C.cherryText} o={easeOut(seg(t, 0.1, 0.4))} />
      <Rows y={75} o={easeOut(seg(t, 0.2, 0.5))} st={(i) => (i < n ? (i === 4 || i === 8 ? 'hit' : 'scan') : undefined)} />
      <T x={25} y={150} s={13} f={C.cherryText} o={easeOut(seg(t, 0.8, 1.1))}>
        {`equality: ${n} of 10 values compared`}
      </T>
      <T x={25} y={180} s={13} f={C.second} o={easeOut(seg(t, 3.2, 3.5))}>
        position, same ten rows: 0 compared
      </T>
      <T x={25} y={215} s={12} f={C.latte} o={easeOut(seg(t, 3.8, 4.2))}>
        a join against a predicate, not a lookup
      </T>
    </Svg>
  );
}

// 7 · The library gap. table.scan() runs at a table carrying an equality delete and is refused; then a hand merge, the
// way a conformant v2 reader does it, gets the right rows.
export function RevealScanRefusesEquality({ t }: StepCtx) {
  return (
    <Svg label="pyiceberg's own table.scan() refuses to read this table -- an open gap, disclosed here." h={230}>
      <Cell x={25} y={30} w={170} h={30} label="table.scan()" o={easeOut(seg(t, 0.1, 0.4))} />
      <Req x1={197} x2={318} y={45} k={easeOut(seg(t, 0.5, 1.0))} />
      <Cell x={320} y={30} w={255} h={30} label="has an equality delete" o={easeOut(seg(t, 0.3, 0.6))} />
      <Cross x={258} y={70} k={easeOut(seg(t, 1.2, 1.5))} />
      <T x={278} y={76} s={12} f={C.cherryText} o={easeOut(seg(t, 1.3, 1.6))}>
        refused
      </T>
      <T x={25} y={115} s={11} f={C.latte} o={easeOut(seg(t, 1.9, 2.2))}>
        an open gap in this library, not in the delete
      </T>
      <Cell x={25} y={135} w={250} h={30} label="merged by hand, as v2 says" stroke={C.focus} o={easeOut(seg(t, 2.6, 2.9))} />
      <MiniTick x={290} y={146} k={easeOut(seg(t, 3.1, 3.4))} />
      <T x={310} y={155} s={12} f={C.focus} o={easeOut(seg(t, 3.2, 3.5))}>
        the right eight rows
      </T>
    </Svg>
  );
}

// 8 · v3. The position delete file beside its data file is crossed out; a bitmap strip slides in under the data file in its
// place, with two bits lit.
export function RevealV3DeprecatesPosition({ t }: StepCtx) {
  const b = easeOut(seg(t, 1.6, 2.2));
  return (
    <Svg label="v3 deprecates position delete files outright, replacing them with deletion vectors." h={230}>
      <Rows y={30} o={easeOut(seg(t, 0.1, 0.4))} />
      <Cell x={25} y={85} w={200} h={28} label="position delete file" stroke={C.second} o={easeOut(seg(t, 0.3, 0.6)) * (1 - 0.6 * b)} />
      <Cross x={125} y={99} k={easeOut(seg(t, 1.0, 1.3))} />
      {Array.from({ length: 10 }, (_, i) => (
        <rect key={i} x={RX(i) + 14} y={lerp(170, 140, b)} width={16} height={16} rx={2} fill={i === 3 || i === 7 ? C.cherryText : C.cocoa} stroke={C.mocha} strokeWidth={1} opacity={b} />
      ))}
      <T x={25} y={190} s={12} f={C.focus} o={easeOut(seg(t, 2.4, 2.7))}>
        v3: a deletion vector, one bit per row
      </T>
      <T x={25} y={218} s={12} f={C.latte} o={easeOut(seg(t, 3.2, 3.6))}>
        cheaper than either delete file to apply
      </T>
    </Svg>
  );
}

// 9 · v4. A writer tries to add a new equality delete; the draft spec's gate is closed; the measured join cost sits beside it
// as the reason.
export function RevealV4ForbidsEquality({ t }: StepCtx) {
  return (
    <Svg label="v4 drafts forbid adding any new equality delete file at all -- the cost measured here is why." h={230}>
      <Cell x={25} y={40} w={200} h={30} label="new equality delete" stroke={C.cherryText} o={easeOut(seg(t, 0.2, 0.5))} />
      <Req x1={227} x2={300} y={55} k={easeOut(seg(t, 0.6, 1.0))} f={C.cherryText} />
      <rect x={305} y={30} width={10} height={50} rx={2} fill={C.cherryText} opacity={easeOut(seg(t, 1.0, 1.3))} />
      <T x={330} y={60} s={13} f={C.cherryText} o={easeOut(seg(t, 1.3, 1.6))}>
        v4 drafts: not allowed
      </T>
      <T x={25} y={125} s={11} f={C.latte} o={easeOut(seg(t, 2.0, 2.3))}>
        the reason, measured above
      </T>
      <rect x={25} y={140} width={400 * easeInOut(seg(t, 2.3, 3.2))} height={16} rx={2} fill={C.cherryText} />
      <T x={25} y={185} s={12} f={C.cherryText} o={easeOut(seg(t, 3.1, 3.4))}>
        every row's value, compared, every read
      </T>
    </Svg>
  );
}

// 10 · Recap.
export function Recap({ t }: StepCtx) {
  return (
    <Svg label="position deletes are a lookup; equality deletes are a join -- that cost is why v3 and v4 move away." h={250}>
      <Row y={40} label="position delete" value="a direct lookup" valueColor={C.second} k={easeOut(seg(t, 0.2, 0.6))} />
      <Row y={100} label="equality delete" value="a join, every row" valueColor={C.cherryText} k={easeOut(seg(t, 1.2, 1.6))} />
      <Row y={160} label="v3" value="deletion vectors" valueColor={C.focus} k={easeOut(seg(t, 2.2, 2.6))} />
      <Row y={220} label="v4 drafts" value="no new equality" k={easeOut(seg(t, 3.0, 3.4))} />
    </Svg>
  );
}
