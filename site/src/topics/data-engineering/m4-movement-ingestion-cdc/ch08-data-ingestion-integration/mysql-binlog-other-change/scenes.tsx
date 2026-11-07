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

/** A reply arrow from x1 back left toward x2, drawn by `k`. */
function Back({ x1, x2, y, k, f = C.crema }: { x1: number; x2: number; y: number; k: number; f?: string }) {
  if (k <= 0) return null;
  const x = lerp(x1, x2, k);
  return (
    <g>
      <line x1={x1} y1={y} x2={x} y2={y} stroke={f} strokeWidth={1.8} />
      <path d={`M${x} ${y} l8 -5 v10 z`} fill={f} />
    </g>
  );
}

/** A binlog file as a strip of transaction blocks [x, w, name] at y, each name left-aligned in its block. */
function Strip({ y, blocks, k = 1, hot = '', hotColor = C.cherryText }: { y: number; blocks: [number, number, string][]; k?: number; hot?: string; hotColor?: string }) {
  return (
    <g opacity={k}>
      {blocks.map(([x, w, n], i) => (
        <g key={i}>
          <rect x={x} y={y} width={w} height={24} rx={3} fill={C.cocoa} stroke={n === hot ? hotColor : C.mocha} strokeWidth={n === hot ? 2 : 1.2} />
          <T x={x + 10} y={y + 16} s={11} f={C.crema}>
            {n}
          </T>
        </g>
      ))}
    </g>
  );
}
const PRI: [number, number, string][] = [
  [25, 95, 'A'],
  [125, 135, 'B'],
  [265, 135, 'C'],
  [405, 140, 'D'],
];
const REP: [number, number, string][] = [
  [25, 65, 'P'],
  [95, 75, 'Q'],
  [175, 155, 'R'],
  [335, 210, 'S'],
];

// 0 · Hook. The primary fails and the replica is promoted. The connector reconnects with its remembered file and
// offset and lands on a different moment; only the GTID still matches.
export function Hook({ t }: StepCtx) {
  const fail = easeOut(seg(t, 0.4, 0.8));
  const prom = t >= 1.0;
  const back = easeOut(seg(t, 1.6, 2.2));
  return (
    <Svg label="a replica is promoted; the connector reconnects with a file-and-offset position that means nothing there, but the GTID still matches." h={220}>
      <Cell x={25} y={30} w={150} label="primary" stroke={fail > 0 ? C.cherryText : C.mocha} o={1 - 0.5 * fail} />
      <Cross x={192} y={44} k={fail} />
      <Cell x={25} y={110} w={150} label={prom ? 'promoted replica' : 'replica'} stroke={prom ? C.focus : C.mocha} />
      <T x={475} y={58} s={11} f={C.latte} a="middle" o={easeOut(seg(t, 0.2, 0.5))}>
        remembers 000003:154
      </T>
      <Cell x={400} y={70} w={150} label="connector" />
      <Back x1={395} x2={180} y={124} k={back} f={C.cherryText} />
      {t >= 2.4 && (
        <T x={25} y={162} s={11} f={C.cherryText} o={easeOut(seg(t, 2.4, 2.7))}>
          same offset, a different moment
        </T>
      )}
      {t >= 3.3 && (
        <T x={300} y={205} s={13} f={C.focus} a="middle" o={easeOut(seg(t, 3.3, 3.7))}>
          but the GTID still matches
        </T>
      )}
    </Svg>
  );
}

// 1 · Predict. Both servers' binlogs, cut into different transactions; offset 154 drops as one line through both. Once
// answered, the replica's block under the line outlines cherry: it just reads that.
export function Predict({ t, answer }: StepCtx) {
  const s = useSinceAnswer(answer !== null);
  const v = answer !== null ? easeOut(seg(s, 0.2, 0.8)) : 0;
  const ln = easeOut(seg(t, 0.9, 1.4));
  return (
    <Svg label="the connector above just reconnected using only the old file-and-offset position. Does it notice it landed in the wrong place?" h={200}>
      <T x={25} y={34} s={11} f={C.latte} o={easeOut(seg(t, 0, 0.3))}>
        primary binlog
      </T>
      <Strip y={40} blocks={PRI} k={easeOut(seg(t, 0, 0.4))} />
      <T x={25} y={94} s={11} f={C.latte} o={easeOut(seg(t, 0.3, 0.6))}>
        replica binlog
      </T>
      <Strip y={100} blocks={REP} k={easeOut(seg(t, 0.3, 0.7))} hot={v > 0 ? 'R' : ''} />
      {ln > 0 && <line x1={210} y1={30} x2={210} y2={lerp(30, 132, ln)} stroke={C.focus} strokeWidth={2} strokeDasharray="5 4" />}
      <T x={210} y={22} s={11} f={C.focus} a="middle" o={ln}>
        offset 154
      </T>
      {v > 0 && (
        <T x={230} y={150} s={11} f={C.cherryText} o={v}>
          reads R instead
        </T>
      )}
      <AnswerRow y={182} label="it notices?" answer={answer} value="no, reads on" k={easeOut(seg(t, 1.6, 2.2))} />
    </Svg>
  );
}

// 2 · Row format. The statement entry types out its SQL text and nothing else. The row entry shows the old values,
// an arrow, and the new ones.
export function RevealRowFormat({ t }: StepCtx) {
  const sql = "UPDATE orders SET status = 'shipped' WHERE id = 1";
  const typed = Math.round(sql.length * seg(t, 0.3, 1.5));
  const r = easeOut(seg(t, 2.0, 2.4));
  const n = easeOut(seg(t, 2.8, 3.2));
  return (
    <Svg label="a statement-format entry logs only the SQL text; a row-format entry logs the actual column values a statement changed." h={200}>
      <T x={25} y={22} s={11} f={C.latte}>
        statement format
      </T>
      <rect x={25} y={30} width={530} height={30} rx={4} fill={C.cocoa} stroke={C.mocha} strokeWidth={1.5} />
      {typed > 0 && (
        <T x={37} y={49} s={11} f={C.crema}>
          {sql.slice(0, typed)}
        </T>
      )}
      <T x={25} y={92} s={11} f={C.latte} o={easeOut(seg(t, 1.8, 2.1))}>
        row format
      </T>
      <Cell x={25} y={100} w={70} label="id: 1" o={r} stroke={C.second} />
      <Cell x={105} y={100} w={130} label="status: paid" o={r} stroke={C.second} />
      <Req x1={240} x2={274} y={114} k={easeOut(seg(t, 2.4, 2.8))} />
      <Cell x={280} y={100} w={70} label="id: 1" o={n} />
      <Cell x={360} y={100} w={160} label="status: shipped" o={n} />
      {t >= 3.5 && (
        <T x={25} y={170} s={13} f={C.focus} o={easeOut(seg(t, 3.5, 3.9))}>
          only the row entry says what changed
        </T>
      )}
    </Svg>
  );
}

// 3 · Row image, measured. Under MINIMAL the before-image holds only id, and the old status is a cherry hole; under
// FULL it holds id, status and note.
export function RevealRowImageMeasured({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.3, 0.7));
  const h = easeOut(seg(t, 0.9, 1.3));
  const b = (i: number) => easeOut(seg(t, 2.0 + i * 0.3, 2.4 + i * 0.3));
  return (
    <Svg label="the same update, logged under a minimal image and a full image; only one of them keeps every old column." h={220}>
      <T x={25} y={22} s={11} f={C.latte}>
        MINIMAL before-image
      </T>
      <Cell x={25} y={30} w={70} label="id: 1" o={a} stroke={C.second} />
      <Hole x={105} y={30} w={130} o={h} stroke={C.cherryText} />
      {h > 0 && (
        <T x={105} y={80} s={11} f={C.cherryText} o={h}>
          the old status is gone
        </T>
      )}
      <T x={25} y={112} s={11} f={C.latte} o={easeOut(seg(t, 1.8, 2.1))}>
        FULL before-image
      </T>
      <Cell x={25} y={120} w={70} label="id: 1" o={b(0)} stroke={C.second} />
      <Cell x={105} y={120} w={130} label="status: paid" o={b(1)} stroke={C.second} />
      <Cell x={245} y={120} w={120} label="note: gift" o={b(2)} stroke={C.second} />
      {t >= 3.4 && (
        <T x={25} y={190} s={13} f={C.focus} o={easeOut(seg(t, 3.4, 3.8))}>
          full keeps every old column
        </T>
      )}
    </Svg>
  );
}

// 4 · A position is local. The pointer 000003:154 sits under transaction B on the primary's file; the file swaps for
// the replica's, the pointer stays put, and now sits under R.
export function RevealPositionIsLocal({ t }: StepCtx) {
  const sw = easeInOut(seg(t, 1.8, 2.4));
  return (
    <Svg label="the identical transaction's byte position is only ever meaningful on the server that wrote it." h={200}>
      {sw < 0.5 && (
        <T x={25} y={30} s={11} f={C.latte} o={1 - 2 * sw}>
          primary: mysql-bin.000003
        </T>
      )}
      {sw >= 0.5 && (
        <T x={25} y={30} s={11} f={C.latte} o={2 * sw - 1}>
          replica: mysql-bin.000009
        </T>
      )}
      {sw < 0.5 && <Strip y={40} blocks={PRI} k={easeOut(seg(t, 0, 0.4)) * (1 - 2 * sw)} hot="B" hotColor={C.focus} />}
      {sw >= 0.5 && <Strip y={40} blocks={REP} k={2 * sw - 1} hot="R" />}
      <path d="M210 70 l-6 9 h12 z" fill={C.focus} opacity={easeOut(seg(t, 0.5, 0.8))} />
      <T x={210} y={98} s={11} f={C.focus} a="middle" o={easeOut(seg(t, 0.5, 0.8))}>
        000003 : 154
      </T>
      {t >= 3.0 && (
        <T x={300} y={150} s={13} f={C.cherryText} a="middle" o={easeOut(seg(t, 3.0, 3.4))}>
          a location, never a transaction
        </T>
      )}
    </Svg>
  );
}

// 5 · GTID, measured. One transaction, two servers: the positions differ and outline cherry; the GTIDs match and tick.
export function RevealGtidMeasured({ t }: StepCtx) {
  const r = (i: number) => easeOut(seg(t, 0.3 + i * 0.6, 0.7 + i * 0.6));
  const cmp = t >= 2.2;
  return (
    <Svg label="the same transaction's GTID, compared against both servers' own byte positions for it." h={220}>
      <T x={255} y={22} s={11} f={C.latte} a="middle">
        position
      </T>
      <T x={465} y={22} s={11} f={C.latte} a="middle">
        GTID
      </T>
      {[
        ['primary', 'mysql-bin.000003 : 154'],
        ['replica', 'mysql-bin.000009 : 982'],
      ].map(([n, p], i) => (
        <g key={i} opacity={r(i)}>
          <Cell x={25} y={30 + i * 46} w={110} label={n} />
          <Cell x={145} y={30 + i * 46} w={220} label={p} stroke={cmp ? C.cherryText : C.mocha} />
          <Cell x={380} y={30 + i * 46} w={170} label="3E11FA47…:23" stroke={t >= 2.8 ? C.focus : C.mocha} />
        </g>
      ))}
      {cmp && (
        <T x={255} y={140} s={11} f={C.cherryText} a="middle" o={easeOut(seg(t, 2.2, 2.5))}>
          differs
        </T>
      )}
      {t >= 2.8 && (
        <T x={465} y={140} s={11} f={C.focus} a="middle" o={easeOut(seg(t, 2.8, 3.1))}>
          same transaction
        </T>
      )}
      {t >= 3.4 && (
        <T x={300} y={190} s={13} f={C.focus} a="middle" o={easeOut(seg(t, 3.4, 3.8))}>
          the GTID names the transaction itself
        </T>
      )}
    </Svg>
  );
}

// 6 · Retention. MySQL lane: the consumer stops at segment three; a purge sweeps the oldest segments away, its own with
// them. PostgreSQL lane: the slot pins its segment, and it stays.
export function RevealRetentionContrast({ t }: StepCtx) {
  const pg = (i: number) => (i < 4 ? easeOut(seg(t, 1.2 + i * 0.3, 1.5 + i * 0.3)) : 0);
  return (
    <Svg label="a stopped consumer's own binlog segment gets purged; nothing on the MySQL side was pinning it, unlike a PostgreSQL slot." h={200}>
      <T x={25} y={22} s={11} f={C.latte}>
        MySQL binlog
      </T>
      {Array.from({ length: 10 }, (_, i) => (
        <g key={i}>
          {pg(i) > 0 && <Hole x={25 + i * 50} y={30} w={40} h={22} o={pg(i)} stroke={i === 2 ? C.cherryText : C.mocha} />}
          <rect x={25 + i * 50} y={30} width={40} height={22} rx={3} fill={C.cocoa} stroke={C.mocha} strokeWidth={1.2} opacity={easeOut(seg(t, i * 0.05, 0.3 + i * 0.05)) * (1 - pg(i))} />
        </g>
      ))}
      <path d="M145 58 l-6 9 h12 z" fill={C.latte} opacity={easeOut(seg(t, 0.5, 0.8))} />
      {t >= 2.5 && (
        <T x={165} y={70} s={11} f={C.cherryText} o={easeOut(seg(t, 2.5, 2.8))}>
          its position: purged
        </T>
      )}
      <T x={25} y={112} s={11} f={C.latte} o={easeOut(seg(t, 2.8, 3.1))}>
        PostgreSQL slot
      </T>
      {Array.from({ length: 10 }, (_, i) => (
        <rect
          key={i}
          x={25 + i * 50}
          y={120}
          width={40}
          height={22}
          rx={3}
          fill={C.cocoa}
          stroke={i >= 2 ? C.focus : C.mocha}
          strokeWidth={1.2}
          opacity={easeOut(seg(t, 2.9 + i * 0.03, 3.2 + i * 0.03))}
        />
      ))}
      <path d="M145 148 l-6 9 h12 z" fill={C.focus} opacity={easeOut(seg(t, 3.2, 3.5))} />
      <Lock x={160} y={152} k={easeOut(seg(t, 3.4, 3.8))} f={C.focus} />
      {t >= 3.7 && (
        <T x={185} y={163} s={11} f={C.focus} o={easeOut(seg(t, 3.7, 4.0))}>
          pinned until read
        </T>
      )}
    </Svg>
  );
}

// 7 · Retention, measured. The ten-day window as a bar; a one-hour downtime is a sliver inside it and resumes; a
// 900,000-second downtime runs past the window's end and needs a resnapshot.
export function RevealRetentionMeasured({ t }: StepCtx) {
  const px = 520 / 1000000;
  const w = easeOut(seg(t, 0.2, 0.9));
  const d1 = easeOut(seg(t, 1.2, 1.5));
  const d2 = easeInOut(seg(t, 2.2, 3.2));
  const endX = 25 + 864000 * px;
  return (
    <Svg label="a short downtime still finds its position; a downtime past the retention window does not." h={220}>
      <T x={25} y={30} s={11} f={C.latte} o={w}>
        retention: 864,000 s, ten days
      </T>
      <rect x={25} y={40} width={864000 * px * w} height={12} fill={C.latte} />
      {w >= 1 && <line x1={endX} y1={36} x2={endX} y2={150} stroke={C.latte} strokeWidth={1.5} strokeDasharray="4 3" />}
      <rect x={25} y={84} width={Math.max(2, 3600 * px) * d1} height={12} fill={C.focus} />
      {d1 > 0 && (
        <T x={25} y={114} s={11} f={C.focus} o={d1}>
          down 3,600 s: resumes from its offset
        </T>
      )}
      <rect x={25} y={134} width={900000 * px * d2} height={12} fill={C.cherryText} />
      {d2 >= 1 && (
        <T x={25} y={164} s={11} f={C.cherryText} o={easeOut(seg(t, 3.2, 3.5))}>
          down 900,000 s: resnapshot required
        </T>
      )}
      {t >= 3.7 && (
        <T x={300} y={205} s={13} f={C.latte} a="middle" o={easeOut(seg(t, 3.7, 4.1))}>
          a clock decides, not a pin
        </T>
      )}
    </Svg>
  );
}

// 8 · Recap. Three questions, each with an arrow to what answers it; the retention row lights as the one to remember.
export function Recap({ t }: StepCtx) {
  const qs = ['what gets logged', 'what survives failover', 'a stalled consumer'];
  const as = ['the row image', 'a GTID, not a position', 'a retention clock'];
  const hl = t >= 3.0;
  return (
    <Svg label="row image deciding what a row event carries, a GTID surviving a failover, retention expiry with nothing pinning the log." h={260}>
      {qs.map((q, i) => (
        <g key={i}>
          <Cell x={25} y={20 + i * 48} w={210} label={q} o={easeOut(seg(t, 0.2 + i * 0.6, 0.6 + i * 0.6))} />
          <Req x1={240} x2={338} y={34 + i * 48} k={easeOut(seg(t, 0.4 + i * 0.6, 0.8 + i * 0.6))} />
          <Cell x={345} y={20 + i * 48} w={210} label={as[i]} o={easeOut(seg(t, 0.6 + i * 0.6, 0.9 + i * 0.6))} stroke={i === 2 && hl ? C.cherryText : C.focus} />
        </g>
      ))}
      {hl && (
        <T x={300} y={210} s={13} f={C.focus} a="middle" o={easeOut(seg(t, 3.0, 3.4))}>
          MySQL never pins disk for you
        </T>
      )}
    </Svg>
  );
}

// 9 · Prove it. An old row event of bare values at position 200, and today's three-column schema. Once answered, the
// schema history lays out along the positions: id, status from 100; region added at 500.
export function ProveIt({ t, answer }: StepCtx) {
  const s = useSinceAnswer(answer !== null);
  const v = answer !== null ? easeOut(seg(s, 0.2, 0.8)) : 0;
  const X = (p: number) => 25 + (p / 600) * 520;
  return (
    <Svg label="none of this says how an old row event, logged by column position, gets read correctly after the schema changes." h={200}>
      <Cell x={25} y={24} w={210} label="values: 1, 'paid'" o={easeOut(seg(t, 0, 0.4))} />
      {['id', 'status', 'region'].map((c, i) => (
        <Cell key={i} x={[280, 360, 460][i]} y={24} w={[70, 90, 90][i]} label={c} o={easeOut(seg(t, 0.3 + i * 0.1, 0.6 + i * 0.1))} />
      ))}
      <line x1={25} y1={118} x2={545} y2={118} stroke={C.mocha} strokeWidth={1.4} />
      <path d={`M${X(200)} 120 l-6 9 h12 z`} fill={C.second} opacity={easeOut(seg(t, 0.8, 1.1))} />
      <T x={X(200)} y={146} s={11} f={C.second} a="middle" o={easeOut(seg(t, 0.8, 1.1))}>
        event at 200
      </T>
      {v > 0 && (
        <g opacity={v}>
          <rect x={X(100)} y={98} width={X(500) - X(100)} height={10} fill={C.focus} />
          <T x={(X(100) + X(500)) / 2} y={90} s={11} f={C.focus} a="middle">
            from 100: id, status
          </T>
          <rect x={X(500)} y={98} width={545 - X(500)} height={10} fill={C.latte} />
          <T x={545} y={90} s={11} f={C.latte} a="end">
            500: + region
          </T>
        </g>
      )}
      <AnswerRow y={182} label="it needs" answer={answer} value="its own DDL history" k={easeOut(seg(t, 1.6, 2.2))} />
    </Svg>
  );
}
