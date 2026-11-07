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

/** An empty dashed slot. */
function Hole({ x, y, w, h = 28, o = 1, stroke = C.mocha }: { x: number; y: number; w: number; h?: number; o?: number; stroke?: string }) {
  return <rect x={x} y={y} width={w} height={h} rx={4} fill="none" stroke={stroke} strokeWidth={1.5} strokeDasharray="4 3" opacity={o} />;
}

// 0 · Hook. A snapshot read and a real insert, each a card with op, values and source. The op and source cells are
// struck and fall away; the two value cells rise into their place, and an equals sign lands between them.
export function Hook({ t }: StepCtx) {
  const cols: [string, string][] = [
    ['snapshot read', 'op: read'],
    ['real insert', 'op: c'],
  ];
  const strike = easeOut(seg(t, 1.4, 1.8));
  const gone = 1 - easeOut(seg(t, 1.9, 2.4));
  const rise = easeInOut(seg(t, 2.5, 3.2));
  return (
    <Svg label="a team unwraps a Debezium topic to simplify it for a sink; the op field goes with it, and a re-snapshot read event now looks exactly like a real insert." h={220}>
      {cols.map(([name, op], c) => {
        const x = 25 + c * 280;
        const k = easeOut(seg(t, 0.2 + c * 0.4, 0.6 + c * 0.4));
        return (
          <g key={name}>
            <T x={x} y={20} s={12} f={C.crema} o={k}>
              {name}
            </T>
            {gone > 0 && (
              <g opacity={gone}>
                <Cell x={x} y={34} w={250} label={op} o={k} />
                <Cell x={x} y={110} w={250} label="source" o={k} />
                <Cross x={x + 232} y={48} k={strike} />
                <Cross x={x + 232} y={124} k={strike} />
              </g>
            )}
            <Cell x={x} y={lerp(72, 34, rise)} w={250} label={rise < 0.5 ? 'after: id 1, pending' : 'id 1, pending'} o={k} stroke={rise >= 1 ? C.focus : C.mocha} />
          </g>
        );
      })}
      <T x={290} y={54} s={15} f={C.focus} a="middle" o={easeOut(seg(t, 3.3, 3.7))}>
        =
      </T>
      <T x={300} y={190} s={12} f={C.latte} a="middle" o={easeOut(seg(t, 3.8, 4.3))}>
        one row, two stories, no way to tell
      </T>
    </Svg>
  );
}

// 1 · Predict. One bare record; two lines up to the two cases it might have been; the op slot beside it is empty.
export function Predict({ t, answer }: StepCtx) {
  const s = useSinceAnswer(answer !== null);
  const v = answer !== null ? easeOut(seg(s, 0.2, 0.8)) : 0;
  const k = easeOut(seg(t, 0.5, 1.1));
  return (
    <Svg label="unwrapping a change event keeps only its column values. Can a consumer still tell a re-snapshot read apart from a genuine insert once that happens?" h={200}>
      <Cell x={150} y={100} w={200} label="id 1, pending" o={easeOut(seg(t, 0, 0.3))} />
      <Hole x={370} y={100} w={90} o={easeOut(seg(t, 0.2, 0.5))} stroke={v > 0 ? C.cherryText : C.mocha} />
      <T x={415} y={119} s={11} f={C.latte} a="middle" o={easeOut(seg(t, 0.2, 0.5))}>
        op
      </T>
      <Cross x={475} y={114} k={v} />
      <line x1={250} y1={100} x2={lerp(250, 110, k)} y2={lerp(100, 58, k)} stroke={C.mocha} strokeWidth={1.5} />
      <line x1={250} y1={100} x2={lerp(250, 390, k)} y2={lerp(100, 58, k)} stroke={C.mocha} strokeWidth={1.5} />
      <Cell x={25} y={30} w={170} label="snapshot read?" o={easeOut(seg(t, 0.9, 1.2))} />
      <Cell x={305} y={30} w={170} label="real insert?" o={easeOut(seg(t, 1.0, 1.3))} />
      <AnswerRow y={178} label="tell them apart?" answer={answer} value="no, identical" k={easeOut(seg(t, 1.6, 2.2))} />
    </Svg>
  );
}

// 2 · Three shapes. A connector inside a Connect cluster; a standalone server; an engine inside your own code.
// Each drops the same event card below it.
export function RevealThreeShapes({ t }: StepCtx) {
  const cols: [string, string, boolean][] = [
    ['Kafka Connect', 'connector', true],
    ['standalone', 'Server', false],
    ['your own code', 'Engine', true],
  ];
  const drop = easeInOut(seg(t, 3.9, 4.4));
  return (
    <Svg label="Debezium deploys three ways: a Kafka Connect connector, the standalone Debezium Server streaming straight to a messaging system, or the Debezium Engine embedded as a library." h={220}>
      {cols.map(([outer, inner, box], c) => {
        const x = 25 + c * 190;
        const k0 = 0.3 + c * 1.2;
        const kb = easeOut(seg(t, k0, k0 + 0.3));
        const ki = easeOut(seg(t, k0 + 0.3, k0 + 0.7));
        return (
          <g key={inner}>
            {box && <rect x={x} y={28} width={170} height={84} rx={6} fill="none" stroke={C.mocha} strokeWidth={1.5} strokeDasharray="5 3" opacity={kb} />}
            <T x={x + 10} y={46} s={11} f={C.latte} o={kb}>
              {outer}
            </T>
            <Cell x={x + 15} y={lerp(54, 66, ki)} w={140} label={inner} o={ki} stroke={C.focus} />
            {drop > 0 && <rect x={x + 60} y={lerp(96, 150, drop)} width={50} height={20} rx={3} fill={C.latte} opacity={drop} />}
          </g>
        );
      })}
      <T x={300} y={200} s={12} f={C.crema} a="middle" o={easeOut(seg(t, 4.3, 4.7))}>
        all three emit one event card
      </T>
    </Svg>
  );
}

// 3 · Envelope, measured. The insert card fills in: before empty, after pending, op c. Then the update card: before
// pending, after shipped, op u.
export function RevealEnvelopeMeasured({ t }: StepCtx) {
  const cols: [string, string | null, string, string][] = [
    ['insert', null, 'after: id 1, pending', 'op: c'],
    ['update', 'before: id 1, pending', 'after: id 1, shipped', 'op: u'],
  ];
  return (
    <Svg label="the real run: a real insert and a real update, each rebuilt by hand into the full envelope; the insert's own before is empty, the update carries both before and after." h={200}>
      {cols.map(([name, before, after, op], c) => {
        const x = 25 + c * 280;
        const k0 = 0.3 + c * 1.7;
        const kb = easeOut(seg(t, k0 + 0.2, k0 + 0.6));
        const ka = easeOut(seg(t, k0 + 0.6, k0 + 1.0));
        const ko = easeOut(seg(t, k0 + 1.0, k0 + 1.4));
        return (
          <g key={name}>
            <T x={x} y={20} s={12} f={C.crema} o={easeOut(seg(t, k0, k0 + 0.3))}>
              {name}
            </T>
            {before === null ? (
              <g>
                <Hole x={x} y={lerp(26, 34, kb)} w={250} o={kb} />
                <T x={x + 125} y={lerp(26, 34, kb) + 18.5} s={11} f={C.latte} a="middle" o={kb}>
                  before: empty
                </T>
              </g>
            ) : (
              <Cell x={x} y={lerp(26, 34, kb)} w={250} label={before} o={kb} stroke={C.second} />
            )}
            <Cell x={x} y={lerp(64, 72, ka)} w={250} label={after} o={ka} stroke={C.focus} />
            <Cell x={x} y={lerp(102, 110, ko)} w={250} label={op} o={ko} />
          </g>
        );
      })}
      <T x={300} y={180} s={12} f={C.latte} a="middle" o={easeOut(seg(t, 4.0, 4.4))}>
        both rebuilt from real decoded rows
      </T>
    </Svg>
  );
}

// 4 · Unwrap. A full card of four fields; before, op and source are struck and fall away; after slides right alone and
// becomes the record; dashed op and source slots appear under it, the variant that adds them back.
export function RevealUnwrapMechanism({ t }: StepCtx) {
  const fields = ['before', 'after', 'op', 'source'];
  const strike = easeOut(seg(t, 1.0, 1.4));
  const gone = 1 - easeOut(seg(t, 1.5, 2.0));
  const slide = easeInOut(seg(t, 2.1, 3.0));
  const back = easeOut(seg(t, 3.4, 3.9));
  return (
    <Svg label="the unwrap transform extracts only the after field from an envelope and replaces the whole record with it; before, op and source are gone unless a variant adds them back." h={200}>
      {fields.map((f, i) =>
        f === 'after' ? (
          <Cell key={f} x={lerp(25, 350, slide)} y={64} w={200} label={slide < 0.5 ? 'after' : 'the whole record'} o={easeOut(seg(t, 0.1 + i * 0.15, 0.4 + i * 0.15))} stroke={C.focus} />
        ) : (
          gone > 0 && (
            <g key={f} opacity={gone}>
              <Cell x={25} y={30 + i * 34} w={200} label={f} o={easeOut(seg(t, 0.1 + i * 0.15, 0.4 + i * 0.15))} />
              <Cross x={210} y={44 + i * 34} k={strike} />
            </g>
          )
        ),
      )}
      <Hole x={350} y={110} w={95} o={back} stroke={C.second} />
      <Hole x={455} y={110} w={95} o={back} stroke={C.second} />
      <T x={397} y={129} s={11} f={C.second} a="middle" o={back}>
        op
      </T>
      <T x={502} y={129} s={11} f={C.second} a="middle" o={back}>
        source
      </T>
      <T x={350} y={168} s={11} f={C.second} o={easeOut(seg(t, 3.8, 4.2))}>
        unless a variant adds them
      </T>
    </Svg>
  );
}

// 5 · Unwrap, measured. An update envelope unwraps to its bare columns; a delete envelope unwraps to its last-known
// columns plus a deleted flag.
export function RevealUnwrapMeasured({ t }: StepCtx) {
  const rows: [string, string, string, number][] = [
    ['update', 'op: u', 'id 1, shipped', 0.3],
    ['delete', 'op: d, after: none', 'id 1, pending', 2.0],
  ];
  return (
    <Svg label="the real run: unwrapping a real envelope keeps only its column values; a real delete, unwrapped, carries its last-known columns plus a deleted marker instead of vanishing." h={220}>
      {rows.map(([name, env, out, k0], i) => {
        const y = 30 + i * 80;
        const ko = easeOut(seg(t, k0 + 0.9, k0 + 1.3));
        return (
          <g key={name}>
            <T x={25} y={y + 19} s={12} f={C.crema} o={easeOut(seg(t, k0, k0 + 0.3))}>
              {name}
            </T>
            <Cell x={100} y={y} w={180} label={env} o={easeOut(seg(t, k0 + 0.1, k0 + 0.4))} />
            <Req x1={290} x2={340} y={y + 14} k={easeOut(seg(t, k0 + 0.4, k0 + 0.9))} />
            <Cell x={350} y={lerp(y - 8, y, ko)} w={200} label={out} o={ko} stroke={C.focus} />
          </g>
        );
      })}
      <Cell x={350} y={lerp(138, 146, easeOut(seg(t, 3.4, 3.8)))} w={200} label="__deleted: true" o={easeOut(seg(t, 3.4, 3.8))} stroke={C.cherryText} f={C.cherryText} />
      <T x={300} y={205} s={12} f={C.latte} a="middle" o={easeOut(seg(t, 4.0, 4.4))}>
        a delete is flagged, not missing
      </T>
    </Svg>
  );
}

// 6 · Upsert. One event travels to the sink table twice; the first arrival writes the row, the second finds the key
// and updates it in place. The table never grows a second row.
export function RevealUpsertMechanism({ t }: StepCtx) {
  const p1 = easeInOut(seg(t, 0.8, 1.6));
  const p2 = easeInOut(seg(t, 2.4, 3.2));
  const row = easeOut(seg(t, 1.6, 1.9));
  const hit = easeOut(seg(t, 3.2, 3.5));
  const trip = t < 2.0 ? p1 : p2;
  const showPip = (t >= 0.8 && t < 1.7) || (t >= 2.4 && t < 3.3);
  return (
    <Svg
      label="a JDBC sink configured for upsert mode makes writes idempotent: replaying an event always produces the same final row state, because an upsert updates an existing key instead of duplicating it."
      h={200}
    >
      <Cell x={25} y={40} w={140} label="id 1, shipped" o={easeOut(seg(t, 0, 0.3))} />
      <T x={257} y={36} s={11} f={C.latte} a="middle" o={easeOut(seg(t, 0.3, 0.6))}>
        upsert
      </T>
      {showPip && <rect x={lerp(175, 330, trip)} y={47} width={14} height={14} rx={2} fill={C.latte} />}
      <T x={350} y={22} s={11} f={C.latte} o={easeOut(seg(t, 0.2, 0.5))}>
        sink table
      </T>
      <rect x={350} y={30} width={200} height={90} rx={6} fill="none" stroke={C.mocha} strokeWidth={1.5} opacity={easeOut(seg(t, 0.2, 0.5))} />
      <Cell x={360} y={40} w={180} label="1, shipped" o={row} stroke={hit > 0 ? C.focus : C.mocha} />
      <Hole x={360} y={80} w={180} o={easeOut(seg(t, 0.4, 0.7)) * 0.6} />
      <T x={350} y={145} s={11} f={C.focus} o={hit}>
        key exists: update it
      </T>
      <T x={300} y={185} s={12} f={C.crema} a="middle" o={easeOut(seg(t, 3.8, 4.3))}>
        same state, every replay
      </T>
    </Svg>
  );
}

// 7 · Upsert, measured. The row's state after the first write, then after the replay, the same; the row count stays 1.
export function RevealUpsertMeasured({ t }: StepCtx) {
  return (
    <Svg label="the real run: applying the identical unwrapped record twice, by a real upsert, leaves the row in the exact same state both times, and never inserts a second row." h={200}>
      <Row y={50} label="after the first write" value="(1, shipped)" k={easeOut(seg(t, 0.4, 0.9))} />
      <Row y={100} label="after the replay" value="(1, shipped)" valueColor={C.focus} k={easeOut(seg(t, 1.6, 2.1))} />
      <Row y={150} label="rows in the table" value="1" valueColor={C.focus} k={easeOut(seg(t, 2.8, 3.3))} />
      <Tick y={136} k={easeOut(seg(t, 3.6, 4.1))} />
    </Svg>
  );
}

// 8 · Recap. Four lines, one by one; the last, the setting that makes replay safe, outlined.
export function Recap({ t }: StepCtx) {
  const rows = ['three shapes: connector, server, engine', 'one card: before, after, op, source', 'unwrap: fewer fields, less to tell', 'replay-safe only with upsert'];
  return (
    <Svg label="three deployment shapes, one envelope card, an unwrap transform that trades fields for simplicity, and a sink that only stays safe to replay if it upserts." h={260}>
      {rows.map((r, i) => {
        const k = easeOut(seg(t, 0.2 + i * 0.9, 0.6 + i * 0.9));
        return <Cell key={i} x={25} y={lerp(22, 30, k) + i * 50} w={530} label={r} o={k} stroke={i === 3 ? C.focus : C.mocha} />;
      })}
    </Svg>
  );
}

// 9 · Prove it. One event into a sink with no upsert; on answer, a second identical row lands in cherry.
export function ProveIt({ t, answer }: StepCtx) {
  const s = useSinceAnswer(answer !== null);
  const v = answer !== null ? easeOut(seg(s, 0.2, 0.8)) : 0;
  return (
    <Svg label="a team configures a JDBC sink without ever setting insert mode to upsert. Is replaying one already-applied event still guaranteed to leave the table in the same state?" h={200}>
      <Cell x={25} y={40} w={140} label="id 1, shipped" o={easeOut(seg(t, 0, 0.3))} />
      <Req x1={175} x2={335} y={54} k={easeOut(seg(t, 0.4, 0.9))} label="replay" />
      <T x={350} y={22} s={11} f={C.latte} o={easeOut(seg(t, 0.2, 0.5))}>
        sink, no upsert
      </T>
      <rect x={350} y={30} width={200} height={90} rx={6} fill="none" stroke={C.mocha} strokeWidth={1.5} opacity={easeOut(seg(t, 0.2, 0.5))} />
      <Cell x={360} y={40} w={180} label="1, shipped" o={easeOut(seg(t, 0.6, 0.9))} />
      {v > 0 && <Cell x={360} y={lerp(72, 80, v)} w={180} label="1, shipped" o={v} stroke={C.cherryText} f={C.cherryText} />}
      <AnswerRow y={178} label="same state?" answer={answer} value="no, a duplicate" k={easeOut(seg(t, 1.6, 2.2))} />
    </Svg>
  );
}
