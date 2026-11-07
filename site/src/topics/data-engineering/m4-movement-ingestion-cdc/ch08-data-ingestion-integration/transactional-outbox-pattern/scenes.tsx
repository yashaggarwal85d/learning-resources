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

// 0 · Hook. The service commits its order down into the database; the publish arrow toward the warehouse starts, is
// cut by a crash, and the warehouse never hears. The order lives only in the database.
export function Hook({ t }: StepCtx) {
  const drop = easeInOut(seg(t, 0.6, 1.3));
  const pub = easeOut(seg(t, 1.6, 2.0)) * 0.35;
  const crash = easeOut(seg(t, 2.0, 2.3));
  const only = easeOut(seg(t, 3.6, 4.1));
  return (
    <Svg label="an order service commits the order and crashes before publishing OrderPlaced; the warehouse never hears about the order, and it exists only in the database." h={220}>
      <Cell x={25} y={40} w={150} label="order service" o={easeOut(seg(t, 0, 0.3))} stroke={crash > 0 ? C.cherryText : C.mocha} />
      <Cell x={25} y={130} w={150} label={drop >= 1 ? 'order 9001' : 'database'} o={easeOut(seg(t, 0.1, 0.4))} stroke={only > 0 ? C.focus : C.mocha} />
      {drop > 0 && drop < 1 && <rect x={93} y={lerp(74, 112, drop)} width={14} height={14} rx={2} fill={C.latte} />}
      <Cell x={390} y={40} w={160} label="warehouse" o={easeOut(seg(t, 0.2, 0.5))} />
      {pub > 0 && <Req x1={185} x2={380} y={54} k={pub / 0.35 < 1 ? pub : 0.35} label="OrderPlaced" />}
      <Cross x={270} y={54} k={crash} />
      <T x={470} y={95} s={11} f={C.cherryText} a="middle" o={easeOut(seg(t, 2.8, 3.2))}>
        never hears
      </T>
      <T x={195} y={149} s={11} f={C.focus} o={only}>
        the order lives only here
      </T>
    </Svg>
  );
}

// 1 · Predict. The committed order on the left; the publish arrow stubs out and is struck; the publish slot stays empty.
export function Predict({ t, answer }: StepCtx) {
  const s = useSinceAnswer(answer !== null);
  const v = answer !== null ? easeOut(seg(s, 0.2, 0.8)) : 0;
  return (
    <Svg label="the order was committed, and the separate publish step crashed before it ever ran. Is that event recoverable anywhere, or is it simply gone?" h={200}>
      <Cell x={25} y={40} w={200} label="order committed" o={easeOut(seg(t, 0, 0.3))} stroke={C.focus} />
      <Req x1={235} x2={340} y={54} k={easeOut(seg(t, 0.4, 0.8)) * 0.5} />
      <Cross x={300} y={54} k={easeOut(seg(t, 0.8, 1.1))} />
      <Hole x={350} y={40} w={200} o={easeOut(seg(t, 0.3, 0.6))} stroke={v > 0 ? C.cherryText : C.mocha} />
      <T x={450} y={59} s={11} f={C.latte} a="middle" o={easeOut(seg(t, 0.3, 0.6))}>
        publish
      </T>
      {v > 0 && (
        <T x={450} y={100} s={11} f={C.cherryText} a="middle" o={v}>
          no record it was owed
        </T>
      )}
      <AnswerRow y={178} label="recoverable?" answer={answer} value="no, gone" k={easeOut(seg(t, 1.6, 2.2))} />
    </Svg>
  );
}

// 2 · Outbox. One transaction box holds the order row and the outbox row together; a lock closes it, both or neither.
// Then CDC reads the log and a record drops into the topic; the app never publishes.
export function RevealOutboxMechanism({ t }: StepCtx) {
  const box = easeOut(seg(t, 0.1, 0.4));
  const lock = easeOut(seg(t, 1.4, 1.8));
  const read = easeOut(seg(t, 2.4, 2.9));
  const drop = easeInOut(seg(t, 3.2, 3.8));
  return (
    <Svg label="an outbox writes the event in the exact same transaction as the state change, so both exist or neither does; CDC, not the application, does the publishing." h={200}>
      <rect x={25} y={30} width={300} height={96} rx={6} fill="none" stroke={lock > 0 ? C.focus : C.mocha} strokeWidth={1.5} strokeDasharray="5 3" opacity={box} />
      <T x={35} y={48} s={11} f={C.latte} o={box}>
        one transaction
      </T>
      <Cell x={35} y={lerp(64, 72, easeOut(seg(t, 0.4, 0.9)))} w={135} label="order row" o={easeOut(seg(t, 0.4, 0.9))} />
      <Cell x={180} y={lerp(64, 72, easeOut(seg(t, 0.6, 1.1)))} w={135} label="outbox row" o={easeOut(seg(t, 0.6, 1.1))} stroke={C.focus} />
      <Lock x={297} y={44} k={lock} />
      <T x={175} y={150} s={12} f={C.crema} a="middle" o={easeOut(seg(t, 1.6, 2.0))}>
        both, or neither
      </T>
      <Req x1={330} x2={372} y={86} k={read} />
      <Cell x={380} y={72} w={170} label="CDC reads log" o={read} />
      {drop > 0 && drop < 1 && <rect x={458} y={lerp(104, 124, drop)} width={14} height={14} rx={2} fill={C.latte} />}
      <Cell x={380} y={140} w={170} label="topic" o={easeOut(seg(t, 3.0, 3.3))} stroke={drop >= 1 ? C.focus : C.mocha} />
      <T x={300} y={192} s={12} f={C.latte} a="middle" o={easeOut(seg(t, 3.9, 4.4))}>
        the app never publishes
      </T>
    </Svg>
  );
}

// 3 · Dual write vs outbox, measured. Separate publish: the order lands, the publish is struck, zero rows to decode.
// Same transaction: the order and its outbox row land together, one row to decode.
export function RevealDualWriteMeasured({ t }: StepCtx) {
  const rows: [string, string, string, string, number, boolean][] = [
    ['separate publish', 'order 9001', 'publish', 'decoded: 0', 0.3, false],
    ['same transaction', 'order 9002', 'outbox row', 'decoded: 1', 2.2, true],
  ];
  return (
    <Svg
      label="the real run: a crash after commit but before a separate publish leaves nothing decodable to recover; an outbox row written in the same transaction as the order is always there to decode."
      h={220}
    >
      {rows.map(([name, order, second, out, k0, ok], i) => {
        const y = 34 + i * 90;
        const k2 = easeOut(seg(t, k0 + 0.5, k0 + 0.9));
        const ko = easeOut(seg(t, k0 + 1.1, k0 + 1.5));
        return (
          <g key={name}>
            <T x={25} y={y - 10} s={11} f={C.latte} o={easeOut(seg(t, k0, k0 + 0.3))}>
              {name}
            </T>
            <Cell x={25} y={y} w={150} label={order} o={easeOut(seg(t, k0 + 0.1, k0 + 0.4))} />
            {ok ? (
              <Cell x={lerp(170, 190, k2)} y={y} w={160} label={second} o={k2} stroke={C.focus} />
            ) : (
              <g>
                <Hole x={190} y={y} w={160} o={k2} stroke={C.cherryText} />
                <T x={270} y={y + 18.5} s={11} f={C.latte} a="middle" o={k2}>
                  {second}
                </T>
                <Cross x={338} y={y + 14} k={easeOut(seg(t, k0 + 0.8, k0 + 1.1))} />
              </g>
            )}
            <Cell x={370} y={lerp(y - 8, y, ko)} w={180} label={out} o={ko} stroke={ok ? C.focus : C.cherryText} f={ok ? C.focus : C.cherryText} />
          </g>
        );
      })}
      <T x={300} y={205} s={12} f={C.crema} a="middle" o={easeOut(seg(t, 4.0, 4.4))}>
        one commit carries both rows
      </T>
    </Svg>
  );
}

// 4 · Router. An outbox row enters the router and travels out along the line to its own aggregate's topic; its id
// becomes the dedup key. A delete on the outbox table reaches the router and is struck: filtered out.
export function RevealRouterMechanism({ t }: StepCtx) {
  const g1 = easeInOut(seg(t, 1.0, 1.3));
  const go = easeInOut(seg(t, 1.4, 1.9));
  const del = easeOut(seg(t, 3.6, 3.9));
  return (
    <Svg label="the router routes by aggregatetype to its own topic, and the outbox row's own id becomes the message's dedup key; a delete on the outbox table is filtered out automatically." h={220}>
      <Cell x={25} y={80} w={190} label="row: type order" o={easeOut(seg(t, 0, 0.3))} />
      <Cell x={245} y={80} w={100} label="router" o={easeOut(seg(t, 0.2, 0.5))} />
      <line x1={345} y1={94} x2={385} y2={54} stroke={C.mocha} strokeWidth={1.5} opacity={easeOut(seg(t, 0.5, 0.8))} />
      <line x1={345} y1={94} x2={385} y2={134} stroke={C.mocha} strokeWidth={1.5} opacity={easeOut(seg(t, 0.5, 0.8))} />
      <Cell x={385} y={40} w={165} label="topic: order" o={easeOut(seg(t, 0.5, 0.8))} stroke={go >= 1 ? C.focus : C.mocha} />
      <Cell x={385} y={120} w={165} label="topic: shipment" o={easeOut(seg(t, 0.6, 0.9))} />
      {g1 > 0 && g1 < 1 && <rect x={lerp(216, 228, g1)} y={87} width={14} height={14} rx={2} fill={C.focus} />}
      {go > 0 && go < 1 && <rect x={lerp(348, 368, go)} y={lerp(80, 56, go)} width={14} height={14} rx={2} fill={C.focus} />}
      <T x={385} y={98} s={11} f={C.focus} o={easeOut(seg(t, 2.2, 2.6))}>
        id becomes the dedup key
      </T>
      <Cell x={25} y={170} w={190} label="delete on outbox" o={easeOut(seg(t, 3.0, 3.3))} stroke={C.cherryText} />
      <Cross x={232} y={184} k={del} />
      <T x={252} y={188} s={11} f={C.cherryText} o={easeOut(seg(t, 3.8, 4.2))}>
        filtered out
      </T>
    </Svg>
  );
}

// 5 · Router, measured. The order row and the shipment row land at their two topics; their ids, 1 and 2, ride along.
export function RevealRouterMeasured({ t }: StepCtx) {
  return (
    <Svg label="the real run: two real decoded outbox inserts of different aggregate types route to two different topics, each carrying its own row's own id as a dedup key." h={200}>
      <Row y={45} label="order row" value="outbox.event.order" k={easeOut(seg(t, 0.4, 0.9))} />
      <Row y={95} label="shipment row" value="outbox.event.shipment" valueColor={C.second} k={easeOut(seg(t, 1.6, 2.1))} />
      <Row y={145} label="dedup keys" value="1 and 2" valueColor={C.focus} k={easeOut(seg(t, 2.8, 3.3))} />
      <MiniTick x={25} y={175} k={easeOut(seg(t, 3.6, 4.0))} />
      <T x={45} y={185} s={11} f={C.latte} o={easeOut(seg(t, 3.7, 4.1))}>
        two types, two topics, each its own id
      </T>
    </Svg>
  );
}

// 6 · Ordering, measured. Four interleaved rows in one table; they drop into two lanes by aggregate and slide together,
// each lane in the order it was written.
export function RevealOrderingMeasured({ t }: StepCtx) {
  const evs: [string, number][] = [
    ['A created', 0],
    ['B created', 1],
    ['A shipped', 0],
    ['B shipped', 1],
  ];
  const down = easeInOut(seg(t, 2.0, 2.6));
  const left = easeInOut(seg(t, 2.6, 3.2));
  const lanes = [0, 0];
  return (
    <Svg label="the real run: two aggregates' own events, written interleaved, still come apart cleanly by aggregateid into each one's own correctly ordered sequence." h={200}>
      <T x={25} y={26} s={11} f={C.latte} o={easeOut(seg(t, 0.1, 0.4))}>
        one outbox table, interleaved
      </T>
      {evs.map(([e, lane], i) => {
        const slot = lanes[lane]++;
        const x0 = 25 + i * 135;
        const x1 = 25 + slot * 135;
        return <Cell key={e} x={lerp(x0, x1, left)} y={lerp(36, 100 + lane * 50, down)} w={125} label={e} o={easeOut(seg(t, 0.3 + i * 0.3, 0.6 + i * 0.3))} stroke={lane === 0 ? C.focus : C.second} />;
      })}
      {[0, 1].map((lane) => (
        <g key={lane} opacity={easeOut(seg(t, 3.3 + lane * 0.3, 3.7 + lane * 0.3))}>
          <MiniTick x={300} y={110 + lane * 50} k={1} />
          <T x={320} y={119 + lane * 50} s={11} f={C.latte}>
            {lane === 0 ? 'A, in written order' : 'B, in written order'}
          </T>
        </g>
      ))}
    </Svg>
  );
}

// 7 · Cleanup, measured. The insert reaches the slot first; only then the delete runs, is decoded, reaches the router,
// and nothing comes out the other side.
export function RevealCleanupMeasured({ t }: StepCtx) {
  return (
    <Svg label="the real run: the slot captures the insert first; the later delete on the outbox table produces no routed event at all, confirming cleanup is both invisible and already safe." h={220}>
      <Cell x={25} y={30} w={160} label="insert row 1" o={easeOut(seg(t, 0.1, 0.4))} />
      <Req x1={195} x2={330} y={44} k={easeOut(seg(t, 0.5, 1.1))} label="captured" />
      <Cell x={340} y={30} w={210} label="slot: insert seen" o={easeOut(seg(t, 1.0, 1.3))} stroke={C.focus} />
      <Cell x={25} y={100} w={160} label="then delete row 1" o={easeOut(seg(t, 1.9, 2.2))} stroke={C.cherryText} />
      <Req x1={195} x2={330} y={114} k={easeOut(seg(t, 2.3, 2.9))} label="decoded: d" />
      <Cell x={340} y={100} w={210} label="router" o={easeOut(seg(t, 2.8, 3.1))} />
      <Hole x={340} y={165} w={210} o={easeOut(seg(t, 3.4, 3.8))} />
      <T x={445} y={184} s={11} f={C.latte} a="middle" o={easeOut(seg(t, 3.4, 3.8))}>
        routed: none
      </T>
      <MiniTick x={25} y={175} k={easeOut(seg(t, 3.9, 4.3))} />
      <T x={45} y={184} s={11} f={C.focus} o={easeOut(seg(t, 4.0, 4.4))}>
        already safe
      </T>
    </Svg>
  );
}

// 8 · Recap. Four lines, one by one; the last, the condition cleanup depends on, outlined.
export function Recap({ t }: StepCtx) {
  const rows = ['outbox: publish becomes commit', 'router: topic by type, dedup by id', 'aggregateid keeps each order', 'cleanup safe once captured'];
  return (
    <Svg
      label="the outbox turns publish into commit; the router routes by aggregatetype and dedups by id; aggregateid keeps order; and cleanup is safe only once the slot has already moved past a row."
      h={260}
    >
      {rows.map((r, i) => {
        const k = easeOut(seg(t, 0.2 + i * 0.9, 0.6 + i * 0.9));
        return <Cell key={i} x={25} y={lerp(22, 30, k) + i * 50} w={530} label={r} o={k} stroke={i === 3 ? C.focus : C.mocha} />;
      })}
    </Svg>
  );
}

// 9 · Prove it. A new outbox row is deleted at once; on answer, the slot comes up empty in cherry.
export function ProveIt({ t, answer }: StepCtx) {
  const s = useSinceAnswer(answer !== null);
  const v = answer !== null ? easeOut(seg(s, 0.2, 0.8)) : 0;
  return (
    <Svg label="a team deletes old outbox rows the moment they're written, without ever checking whether the slot has actually captured them yet. Is that cleanup still safe?" h={200}>
      <Cell x={25} y={40} w={160} label="new outbox row" o={easeOut(seg(t, 0, 0.3))} />
      <Cross x={170} y={54} k={easeOut(seg(t, 0.5, 0.8))} />
      <T x={25} y={90} s={11} f={C.latte} o={easeOut(seg(t, 0.6, 0.9))}>
        deleted at once
      </T>
      <Hole x={340} y={40} w={210} o={easeOut(seg(t, 0.8, 1.1))} stroke={v > 0 ? C.cherryText : C.mocha} />
      <T x={445} y={59} s={11} f={v > 0 ? C.cherryText : C.latte} a="middle" o={easeOut(seg(t, 0.8, 1.1))}>
        {v > 0 ? 'slot: never saw it' : 'slot'}
      </T>
      <AnswerRow y={178} label="safe?" answer={answer} value="no, rows lost" k={easeOut(seg(t, 1.6, 2.2))} />
    </Svg>
  );
}
