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

/** A labelled lane and its bar; the bar's length is a schematic share, never a figure. */
function Lane({ y, label, frac, k, f = C.crema }: { y: number; label: string; frac: number; k: number; f?: string }) {
  return (
    <g opacity={k > 0 ? 1 : 0}>
      <T x={25} y={y + 10} s={12} f={C.latte} o={clamp(k * 3)}>
        {label}
      </T>
      <rect x={180} y={y} width={Math.max(3, 380 * frac * k)} height={14} rx={2} fill={f} opacity={0.8} />
    </g>
  );
}

/** A client box on the left, the pool in the middle, one physical backend on the right, with a link drawn by `k`. */
function Link({ y, k, f = C.focus }: { y: number; k: number; f?: string }) {
  return <path d={`M195 ${y} L${lerp(195, 440, k)} ${lerp(y, 130, k)}`} stroke={f} strokeWidth={1.5} fill="none" opacity={k > 0 ? 1 : 0} />;
}

// 1 · Hook. Everything so far stayed inside one process box; a connection is the first line that leaves it, crossing to a
// database on the other side, and its cost is the question.
export function Hook({ t }: StepCtx) {
  const l = easeInOut(seg(t, 1.6, 2.6));
  return (
    <Svg label="arrow, pandas and polars all stayed in-process — does a real connection actually cost something?" h={220}>
      <Row y={40} label="leaving the process" value="a real cost?" k={easeOut(seg(t, 0.3, 0.8))} />
      <rect x={25} y={70} width={220} height={100} rx={6} fill="none" stroke={C.mocha} strokeWidth={1.5} opacity={easeOut(seg(t, 0.4, 0.7))} />
      {['Arrow', 'pandas', 'Polars'].map((l2, i) => (
        <Cell key={l2} x={45} y={78 + i * 30} w={180} h={24} label={l2} o={easeOut(seg(t, 0.6 + i * 0.2, 0.9 + i * 0.2))} />
      ))}
      <path d={`M245 120 H${245 + 200 * l}`} stroke={C.focus} strokeWidth={2} strokeDasharray="6 5" />
      <Cell x={455} y={106} w={120} label="PostgreSQL" stroke={C.second} f={C.second} o={easeOut(seg(t, 2.4, 2.8))} />
      <T x={345} y={110} s={16} f={C.focus} a="middle" o={easeOut(seg(t, 2.8, 3.2))}>
        ?
      </T>
    </Svg>
  );
}

// 2 · Setup cost. Twenty fresh connections, each a long bar of connect + auth before its tiny query; twenty reuses of one
// open connection, each only the query. The fresh lane runs far longer.
export function RevealSetupCost({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.6, 2.2));
  const b = easeOut(seg(t, 0.6, 1.0));
  return (
    <Svg label="a fresh connection vs. reusing one already open — measured on this sandbox's own cluster" h={230}>
      <Row y={40} label="select 1, 20 times" value="two ways" k={easeOut(seg(t, 0.2, 0.7))} />
      <T x={25} y={86} s={12} f={C.latte} o={easeOut(seg(t, 0.4, 0.7))}>
        fresh each time
      </T>
      {Array.from({ length: 20 }, (_, i) => (
        <g key={i} opacity={clamp(a * 20 - i)}>
          <rect x={170 + i * 20} y={76} width={15} height={14} rx={1} fill={C.cherryText} opacity={0.7} />
          <rect x={185 + i * 20} y={76} width={3} height={14} fill={C.crema} />
        </g>
      ))}
      <T x={25} y={126} s={12} f={C.latte} o={easeOut(seg(t, 0.4, 0.7))}>
        reused
      </T>
      {Array.from({ length: 20 }, (_, i) => (
        <rect key={i} x={170 + i * 4} y={116} width={3} height={14} fill={C.crema} opacity={clamp(b * 20 - i)} />
      ))}
      <T x={25} y={160} s={11} f={C.cherryText} o={easeOut(seg(t, 1.2, 1.5))}>
        connect + auth
      </T>
      <Row y={205} label="fresh connection" value="slower every time" valueColor={C.cherryText} k={easeOut(seg(t, 3.0, 3.5))} />
    </Svg>
  );
}

// 3 · Little's Law. Requests arrive at 50 a second; each one holds a connection for its measured time W; the product stacks
// up as the connections the pool must keep open at once.
export function RevealLittlesLaw({ t }: StepCtx) {
  const p = clamp(seg(t, 0.8, 3.0));
  return (
    <Svg label="a measured hold time, fed into one formula, gives a concrete pool size" h={240}>
      <Row y={40} label="pool size" value="50/s × hold time W" valueColor={C.focus} k={easeOut(seg(t, 0.2, 0.7))} />
      <line x1={25} y1={150} x2={575} y2={150} stroke={C.mocha} strokeWidth={1} opacity={easeOut(seg(t, 0.5, 0.8))} />
      {Array.from({ length: 12 }, (_, i) => {
        const start = i / 12;
        const k = clamp((p - start) * 6);
        const lane = i % 3;
        return <rect key={i} x={25 + start * 450} y={86 + lane * 20} width={100 * k} height={14} rx={2} fill={C.second} opacity={k > 0 ? 0.8 : 0} />;
      })}
      <T x={25} y={172} s={11} f={C.latte} o={easeOut(seg(t, 1.0, 1.3))}>
        each bar: one request holding a connection for W
      </T>
      <Row y={215} label="W, measured" value="0.05 s of work, held" k={easeOut(seg(t, 3.2, 3.7))} />
    </Svg>
  );
}

// 4 · Predict: does the prepared statement survive? One client, one steady line into the pool; behind the pool the backend it
// reaches is drawn as a question; then the question.
export function PredictPreparedStatement({ t, answer }: StepCtx) {
  return (
    <Svg label="the same client, prepares now, asks again later — does transaction pooling remember?" h={210}>
      <Row y={40} label="prepare, then later" value="still there?" k={easeOut(seg(t, 0.1, 0.5))} />
      <Cell x={25} y={64} w={120} label="client" o={easeOut(seg(t, 0.2, 0.5))} />
      <path d={`M145 78 H${145 + 100 * easeOut(seg(t, 0.4, 0.8))}`} stroke={C.focus} strokeWidth={2} />
      <Cell x={245} y={64} w={140} label="pool, per txn" o={easeOut(seg(t, 0.5, 0.8))} />
      <path d="M385 78 H425" stroke={C.latte} strokeWidth={1.5} strokeDasharray="4 4" opacity={easeOut(seg(t, 0.8, 1.1))} />
      <T x={440} y={83} s={12} f={C.focus} o={easeOut(seg(t, 1.0, 1.3))}>
        which backend?
      </T>
      <AnswerRow y={140} label="it survives" answer={answer} value="not always" f={C.cherryText} k={easeOut(seg(t, 1.2, 1.7))} />
      <Verdict answer={answer} text="the next request can land elsewhere" f={C.cherryText} />
    </Svg>
  );
}

// 5 · The caveat reproduced. Client A prepares stmt_a on the one backend; client B lands on the same backend and runs DISCARD
// ALL; client C, same backend, asks to EXECUTE stmt_a and is refused.
export function RevealPreparedStatementCaveat({ t }: StepCtx) {
  const k = [easeOut(seg(t, 0.4, 0.9)), easeOut(seg(t, 1.4, 1.9)), easeOut(seg(t, 2.4, 2.9))];
  const gone = easeOut(seg(t, 1.9, 2.3));
  return (
    <Svg label="prepared here, cleared by someone else, denied here — the exact failure, reproduced" h={240}>
      {['A: PREPARE stmt_a', 'B: DISCARD ALL', 'C: EXECUTE stmt_a'].map((l, i) => (
        <Cell key={l} x={25} y={50 + i * 50} w={170} label={l} o={k[i]} stroke={i === 2 ? C.cherryText : C.mocha} />
      ))}
      <Link y={64} k={k[0]} f={C.second} />
      <Link y={114} k={k[1]} f={C.latte} />
      <Link y={164} k={k[2]} f={C.cherryText} />
      <Cell x={440} y={116} w={135} label="one backend" o={easeOut(seg(t, 0.3, 0.6))} />
      <g opacity={k[0] * (1 - gone)}>
        <Cell x={440} y={80} w={135} h={24} label="stmt_a" stroke={C.second} f={C.second} />
      </g>
      <Cross x={555} y={176} k={easeOut(seg(t, 3.0, 3.3))} />
      <T x={440} y={180} s={11} f={C.cherryText} o={easeOut(seg(t, 3.0, 3.3))}>
        refused
      </T>
      <Row y={225} label="same backend, all three" value="stmt_a gone" valueColor={C.cherryText} k={easeOut(seg(t, 3.5, 4.0))} />
    </Svg>
  );
}

// 6 · Session pooling. The same prepare-then-execute, but the client keeps one dedicated backend for the whole session: the
// statement stays put, and EXECUTE stmt_b(7) returns 7.
export function RevealSessionPoolingSurvives({ t }: StepCtx) {
  const l = easeOut(seg(t, 0.5, 1.1));
  return (
    <Svg label="the identical test, over session pooling instead — the statement survives" h={220}>
      <Row y={40} label="session pooling" value="one backend, kept" k={easeOut(seg(t, 0.2, 0.7))} />
      <Cell x={25} y={80} w={120} label="client" o={easeOut(seg(t, 0.3, 0.6))} />
      <path d={`M145 94 H${145 + 295 * l}`} stroke={C.focus} strokeWidth={3} />
      <Cell x={440} y={80} w={135} label="its backend" stroke={C.focus} o={l} />
      <Cell x={160} y={110} w={260} h={24} label="PREPARE stmt_b" o={easeOut(seg(t, 1.3, 1.7))} />
      <Cell x={160} y={142} w={260} h={24} label="EXECUTE stmt_b(7)  →  7" stroke={C.focus} f={C.focus} o={easeOut(seg(t, 2.3, 2.7))} />
      <Tick y={150} k={easeOut(seg(t, 2.8, 3.2))} />
      <Row y={200} label="the statement" value="survives every time" valueColor={C.focus} k={easeOut(seg(t, 3.3, 3.8))} />
    </Svg>
  );
}

// 7 · Server-side cursor. The 50,000-row result lands in client memory all at once, one tall bar; through the cursor it arrives
// 1,000 rows at a time, and the client's bar never climbs as high.
export function RevealServerCursor({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.6, 1.4));
  const p = clamp(seg(t, 1.6, 3.2));
  const batch = p > 0 && p < 1 ? 0.5 + 0.5 * Math.abs(Math.sin(p * Math.PI * 10)) : p >= 1 ? 0.5 : 0;
  return (
    <Svg label="the same large result, pulled whole vs. pulled in batches — measured peak memory" h={230}>
      <Row y={40} label="50,000 rows" value="1,000 per batch" k={easeOut(seg(t, 0.2, 0.7))} />
      <T x={25} y={86} s={12} f={C.latte} o={easeOut(seg(t, 0.4, 0.7))}>
        fetchall
      </T>
      <rect x={180} y={76} width={380 * a} height={14} rx={2} fill={C.cherryText} opacity={0.75} />
      <T x={25} y={126} s={12} f={C.latte} o={easeOut(seg(t, 1.4, 1.7))}>
        server cursor
      </T>
      <rect x={180} y={116} width={160 * batch} height={14} rx={2} fill={C.focus} opacity={0.85} />
      <T x={180} y={150} s={11} f={C.latte} o={easeOut(seg(t, 1.6, 1.9))}>
        client memory, as rows arrive
      </T>
      <Row y={200} label="batched fetch" value="peaks lower" valueColor={C.focus} k={easeOut(seg(t, 3.3, 3.8))} />
    </Svg>
  );
}

// 8 · Three bulk paths. The same 20,000 rows: row-by-row inserts run longest; COPY finishes far sooner; the ADBC driver lands
// right beside COPY, because it runs COPY underneath.
export function RevealBulkLoad({ t }: StepCtx) {
  return (
    <Svg label="the same rows, loaded three ways — row-by-row, a bulk-copy path, and an arrow-native driver" h={240}>
      <Row y={40} label="20,000 rows" value="three ways in" k={easeOut(seg(t, 0.2, 0.7))} />
      <Lane y={70} label="row by row" frac={1} k={easeOut(seg(t, 0.5, 1.8))} f={C.cherryText} />
      <Lane y={104} label="COPY" frac={0.14} k={easeOut(seg(t, 1.9, 2.3))} />
      <Lane y={138} label="ADBC driver" frac={0.16} k={easeOut(seg(t, 2.4, 2.8))} f={C.focus} />
      <path d="M260 116 C 300 126, 300 138, 262 146" fill="none" stroke={C.latte} strokeWidth={1.2} opacity={easeOut(seg(t, 2.9, 3.2))} />
      <T x={312} y={135} s={11} f={C.latte} o={easeOut(seg(t, 2.9, 3.2))}>
        same path underneath
      </T>
      <Row y={210} label="ADBC vs row by row" value="over 3× faster" valueColor={C.focus} k={easeOut(seg(t, 3.4, 3.9))} />
    </Svg>
  );
}

// 9 · Recap. Five rows land one per beat.
export function Recap({ t }: StepCtx) {
  return (
    <Svg label="a real setup cost, a formula for pool size, a reproduced caveat and its fix, and three measured bulk paths" h={250}>
      <Row y={35} label="a fresh connection" value="costs more" valueColor={C.cherryText} k={easeOut(seg(t, 0.4, 0.9))} />
      <Row y={80} label="pool size" value="rate × hold time" k={easeOut(seg(t, 1.1, 1.6))} />
      <Row y={125} label="transaction pooling" value="can lose a PREPARE" valueColor={C.cherryText} k={easeOut(seg(t, 1.8, 2.3))} />
      <Row y={170} label="a server cursor" value="lower client memory" valueColor={C.focus} k={easeOut(seg(t, 2.5, 3.0))} />
      <Row y={215} label="ADBC" value="the COPY fast path" valueColor={C.focus} k={easeOut(seg(t, 3.2, 3.7))} />
    </Svg>
  );
}

// 10 · Prove: intermittent failures. Requests from one client fan out across backends; after the answer the one that never saw
// the PREPARE turns red, and the two fixes land.
export function ProveIt({ t, answer }: StepCtx) {
  const s = useSinceAnswer(answer !== null);
  const r = answer !== null ? easeOut(seg(s, 0.1, 0.5)) : 0;
  const v = answer !== null ? easeOut(seg(s, 0.7, 1.1)) : 0;
  return (
    <Svg label="a service pools in transaction mode and relies on a prepared statement surviving — what breaks, and why?" h={230}>
      <Row y={40} label="fails now and then" value="why?" k={easeOut(seg(t, 0.1, 0.5))} />
      <AnswerRow y={90} label="a flaky database" answer={answer} value="no, a new backend" f={C.cherryText} k={easeOut(seg(t, 0.4, 0.9))} />
      <Cell x={25} y={118} w={100} label="client" o={easeOut(seg(t, 0.6, 0.9))} />
      {[0, 1].map((i) => (
        <g key={i} opacity={easeOut(seg(t, 0.8 + i * 0.2, 1.1 + i * 0.2))}>
          <path d={`M125 132 L220 ${122 + i * 22}`} stroke={i === 1 && r > 0 ? C.cherryText : C.latte} strokeWidth={1.5} fill="none" />
          <circle cx={226} cy={122 + i * 22} r={5} fill={i === 1 && r > 0 ? C.cherryText : C.crema} />
        </g>
      ))}
      <T x={575} y={128} s={12} f={C.focus} a="end" o={v}>
        track prepared statements
      </T>
      <T x={575} y={152} s={12} f={C.focus} a="end" o={v}>
        or session pooling
      </T>
      {answer !== null && (
        <>
          <T x={300} y={lerp(198, 190, v)} s={15} f={C.focus} a="middle" o={v}>
            it never saw the PREPARE
          </T>
          <rect x={150} y={202} width={300 * v} height={3} fill={C.focus} />
        </>
      )}
    </Svg>
  );
}
