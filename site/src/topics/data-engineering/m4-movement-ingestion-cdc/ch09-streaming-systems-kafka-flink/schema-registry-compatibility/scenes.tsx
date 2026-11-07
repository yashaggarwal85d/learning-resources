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

/** A vertical gate bar at x, from y to y + h, drawn by `k`. */
function Gate({ x, y, h, k, f = C.focus }: { x: number; y: number; h: number; k: number; f?: string }) {
  return <rect x={x - 3} y={y} width={6} height={h * k} rx={2} fill={f} />;
}

// 0 · Hook. A schema of three fields; currency is struck through and drops away, with no gate in the way. Downstream,
// day after day, the currency column fills with blanks.
export function Hook({ t }: StepCtx) {
  const drop = easeInOut(seg(t, 0.6, 1.3));
  const days = Math.floor(easeInOut(seg(t, 1.8, 3.8)) * 5);
  return (
    <Svg label="a field quietly dropped, a dashboard broken three days later" h={200}>
      <Cell x={25} y={20} w={150} label="order_id" o={easeOut(seg(t, 0, 0.3))} />
      <Cell x={25} y={54} w={150} label="amount" o={easeOut(seg(t, 0.1, 0.4))} />
      <Cell x={25} y={lerp(88, 150, drop)} w={150} label="currency" o={easeOut(seg(t, 0.2, 0.5)) * (1 - drop)} stroke={C.cherryText} />
      <Cross x={190} y={102} k={easeOut(seg(t, 0.4, 0.6)) * (1 - drop)} />
      <T x={200} y={72} s={11} f={C.latte} o={easeOut(seg(t, 1.1, 1.4))}>
        no warning
      </T>
      <T x={330} y={28} s={11} f={C.latte} o={easeOut(seg(t, 1.6, 1.9))}>
        a dashboard, reading currency
      </T>
      {Array.from({ length: days }, (_, i) => (
        <g key={i}>
          <rect x={330} y={40 + i * 26} width={90} height={20} rx={3} fill={C.cocoa} stroke={C.mocha} />
          <rect x={430} y={40 + i * 26} width={110} height={20} rx={3} fill="none" stroke={C.cherryText} strokeDasharray="4 3" />
        </g>
      ))}
      <T x={25} y={192} s={12} f={C.cherryText} o={easeOut(seg(t, 3.8, 4.2))}>
        days of blanks, and nobody noticed
      </T>
    </Svg>
  );
}

// 1 · Setup. A record's fields carry their meaning from writer to reader; a registry box draws in between them, and every
// new schema must pass through it before it reaches the topic.
export function Setup({ t }: StepCtx) {
  const reg = easeOut(seg(t, 1.6, 2.1));
  const pass = easeInOut(seg(t, 2.6, 3.6));
  return (
    <Svg label="a record's fields still mean what they meant when it was first written" h={200}>
      <Cell x={25} y={60} w={120} label="writer" o={easeOut(seg(t, 0, 0.3))} />
      <Cell x={435} y={60} w={120} label="reader" o={easeOut(seg(t, 0.2, 0.5))} />
      <line x1={150} y1={74} x2={150 + 280 * easeInOut(seg(t, 0.4, 1.2))} y2={74} stroke={C.latte} strokeWidth={1.4} strokeDasharray="4 3" />
      <T x={290} y={48} s={11} f={C.latte} a="middle" o={easeOut(seg(t, 0.8, 1.1)) * (1 - reg)}>
        same fields, same meaning: hoped
      </T>
      <rect x={235} y={50} width={110} height={48} rx={6} fill={C.cocoa} stroke={C.focus} strokeWidth={1.8} opacity={reg} />
      <T x={290} y={79} s={12} f={C.focus} a="middle" o={reg}>
        registry
      </T>
      {pass > 0 && pass < 1 && <rect x={lerp(150, 220, pass)} y={118} width={12} height={12} rx={2} fill={C.second} />}
      <T x={150} y={150} s={11} f={C.second} o={easeOut(seg(t, 2.6, 2.9))}>
        every new schema, checked first
      </T>
      <T x={25} y={190} s={12} f={C.crema} o={easeOut(seg(t, 3.8, 4.2))}>
        enforced, not hoped for
      </T>
    </Svg>
  );
}

// 2 · Predict. The same change, currency dropped, travels toward a stricter gate. On answer the gate holds: a cross,
// and the change goes back.
export function PredictGate({ t, answer }: StepCtx) {
  const s = useSinceAnswer(answer !== null);
  const v = answer !== null ? easeOut(seg(s, 0.1, 0.6)) : 0;
  const go = easeInOut(seg(t, 0.4, 1.4));
  return (
    <Svg label="the same field removal, checked under a stricter compatibility mode" h={200}>
      <Cell x={lerp(25, 170, go) - 40 * v} y={50} w={150} label="drop currency" stroke={C.cherryText} />
      <Gate x={350} y={30} h={70} k={easeOut(seg(t, 0.2, 0.6))} />
      <T x={365} y={70} s={11} f={C.focus} o={easeOut(seg(t, 0.4, 0.7))}>
        stricter rule
      </T>
      <Cross x={335} y={116} k={v} />
      <AnswerRow y={170} label="the stricter rule" answer={answer} value="rejects it" k={easeOut(seg(t, 1.6, 2.2))} />
    </Svg>
  );
}

// 3 · Modes. Backward: a new reader reads old data, the arrow pointing back. Forward: an old reader reads new data.
// Full: both arrows at once. Transitive: the check runs against every version in the chain, not just the last.
export function RevealModes({ t }: StepCtx) {
  const b = easeInOut(seg(t, 0.2, 0.9));
  const f = easeInOut(seg(t, 1.2, 1.9));
  const tr = easeOut(seg(t, 2.8, 3.2));
  return (
    <Svg label="backward, forward, full, and transitive — four modes, two directions" h={200}>
      <T x={25} y={34} s={12} f={C.crema} o={easeOut(seg(t, 0, 0.3))}>
        backward
      </T>
      <Cell x={130} y={18} w={120} label="old data" o={easeOut(seg(t, 0, 0.3))} />
      <Cell x={390} y={18} w={150} label="new reader" o={easeOut(seg(t, 0, 0.3))} stroke={C.focus} />
      <Req x1={255} x2={380} y={32} k={b} />
      <T x={25} y={84} s={12} f={C.crema} o={easeOut(seg(t, 1.0, 1.3))}>
        forward
      </T>
      <Cell x={130} y={68} w={120} label="new data" o={easeOut(seg(t, 1.0, 1.3))} stroke={C.focus} />
      <Cell x={390} y={68} w={150} label="old reader" o={easeOut(seg(t, 1.0, 1.3))} />
      <Req x1={255} x2={380} y={82} k={f} />
      <rect x={120} y={10} width={430} height={94} rx={8} fill="none" stroke={C.second} strokeWidth={1.4} opacity={easeOut(seg(t, 2.1, 2.5))} />
      <T x={555} y={124} s={11} f={C.second} a="end" o={easeOut(seg(t, 2.1, 2.5))}>
        full: both
      </T>
      <T x={25} y={164} s={12} f={C.crema} o={tr}>
        transitive
      </T>
      {['x2', 'x1', 'x'].map((n, i) => (
        <Cell key={n} x={130 + i * 110} y={148} w={70} label={n} o={easeOut(seg(t, 2.9 + i * 0.15, 3.2 + i * 0.15))} stroke={i === 2 ? C.focus : C.mocha} />
      ))}
      <path d={`M385 148 C 360 128, 190 128, 165 148`} fill="none" stroke={C.focus} strokeWidth={1.4} strokeDasharray="240" strokeDashoffset={240 * (1 - easeInOut(seg(t, 3.5, 4.0)))} />
      <path d={`M385 148 C 375 136, 285 136, 275 148`} fill="none" stroke={C.focus} strokeWidth={1.4} strokeDasharray="140" strokeDashoffset={140 * (1 - easeInOut(seg(t, 3.4, 3.8)))} />
      <T x={470} y={168} s={11} f={C.focus} o={easeOut(seg(t, 3.9, 4.3))}>
        every one
      </T>
    </Svg>
  );
}

// 4 · Gates. Under backward, "drop a field" walks through the gate with a tick. "Require currency, no default" walks up
// to the same gate and is refused with a cross.
export function RevealGates({ t }: StepCtx) {
  const a = easeInOut(seg(t, 0.3, 1.3));
  const b = easeInOut(seg(t, 2.0, 2.8));
  return (
    <Svg label="the same removal passes backward, but a required addition fails it" h={200}>
      <Gate x={330} y={20} h={130} k={easeOut(seg(t, 0, 0.4))} />
      <T x={330} y={170} s={11} f={C.focus} a="middle" o={easeOut(seg(t, 0, 0.4))}>
        backward
      </T>
      <Cell x={a < 1 ? lerp(25, 170, Math.min(1, a * 2)) : 370} y={30} w={150} label="drop a field" o={a < 0.5 || a >= 1 ? 1 : 0} />
      <MiniTick x={530} y={44} k={easeOut(seg(t, 1.3, 1.6))} />
      <Cell x={lerp(25, 140, b)} y={100} w={180} label="require one, no default" stroke={C.cherryText} />
      <Cross x={540} y={114} k={easeOut(seg(t, 2.8, 3.1))} />
      <T x={370} y={119} s={11} f={C.cherryText} o={easeOut(seg(t, 2.9, 3.2))}>
        refused
      </T>
      <T x={25} y={194} s={12} f={C.crema} o={easeOut(seg(t, 3.6, 4.0))}>
        same rule watching, different outcome
      </T>
    </Svg>
  );
}

// 5 · Predict. Field 2 renamed from amount to total_amount, same spot. Three formats each hold a question mark; on
// answer Protobuf's lights: it only reads the number.
export function PredictFormats({ t, answer }: StepCtx) {
  const s = useSinceAnswer(answer !== null);
  const v = answer !== null ? easeOut(seg(s, 0.1, 0.6)) : 0;
  const ren = easeInOut(seg(t, 0.3, 0.9));
  const fm = ['Avro', 'Protobuf', 'JSON Schema'];
  return (
    <Svg label="the same renamed field, checked by three different schema formats" h={200}>
      <T x={25} y={36} s={12} f={C.latte} o={easeOut(seg(t, 0, 0.3))}>
        field 2
      </T>
      {ren < 1 && <Cell x={100} y={18} w={180} label="amount" o={1 - ren} />}
      {ren > 0 && <Cell x={100} y={18} w={180} label="total_amount" o={ren} stroke={C.second} />}
      {fm.map((n, i) => (
        <g key={n} opacity={easeOut(seg(t, 1.0 + i * 0.2, 1.3 + i * 0.2))}>
          <Cell x={25 + i * 180} y={74} w={165} label={n} stroke={v > 0 && i === 1 ? C.focus : C.mocha} f={v > 0 && i === 1 ? C.focus : C.crema} />
          <T x={107 + i * 180} y={124} s={12} f={v > 0 && i === 1 ? C.focus : C.latte} a="middle">
            {v > 0 && i === 1 ? 'number only' : '?'}
          </T>
        </g>
      ))}
      <AnswerRow y={170} label="all the same?" answer={answer} value="no: one ignores names" k={easeOut(seg(t, 1.8, 2.4))} />
    </Svg>
  );
}

// 6 · Formats. Avro: a missing name falls back to its default. Protobuf: field 2 renamed passes with a tick, but field 2
// reused as shipping_label is crossed. JSON Schema: a dashed slot, rules someone else has to write.
export function RevealFormats({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.2, 0.6));
  const p1 = easeOut(seg(t, 1.4, 1.8));
  const p2 = easeOut(seg(t, 2.3, 2.7));
  const j = easeOut(seg(t, 3.4, 3.8));
  return (
    <Svg label="Avro resolves by name, Protobuf by number, JSON Schema natively by neither" h={200}>
      <T x={25} y={34} s={12} f={C.crema} o={a}>
        Avro
      </T>
      <Cell x={150} y={16} w={180} label="by name" o={a} />
      <T x={345} y={34} s={11} f={C.latte} o={easeOut(seg(t, 0.7, 1.0))}>
        missing: use the default
      </T>
      <T x={25} y={84} s={12} f={C.crema} o={p1}>
        Protobuf
      </T>
      <Cell x={150} y={66} w={180} label="2: total_amount" o={p1} stroke={C.focus} />
      <MiniTick x={340} y={80} k={easeOut(seg(t, 1.8, 2.1))} />
      <Cell x={150} y={102} w={180} label="2: shipping_label" o={p2} stroke={C.cherryText} f={C.cherryText} />
      <Cross x={350} y={116} k={easeOut(seg(t, 2.7, 3.0))} />
      <T x={370} y={120} s={11} f={C.cherryText} o={easeOut(seg(t, 2.8, 3.1))}>
        number reused
      </T>
      <T x={25} y={170} s={12} f={C.crema} o={j}>
        JSON Schema
      </T>
      <Hole x={150} y={152} w={180} o={j} />
      <T x={345} y={170} s={11} f={C.latte} o={easeOut(seg(t, 3.8, 4.1))}>
        rules made up elsewhere
      </T>
    </Svg>
  );
}

// 7 · Wire. Topic orders carries OrderPlaced and OrderCancelled: under TopicNameStrategy both merge into one subject;
// under RecordNameStrategy they split into two. Then a wire record: a version byte, a schema id, the payload; the
// id goes to the registry and comes back as OrderPlaced-v3.
export function RevealWire({ t }: StepCtx) {
  const m = easeInOut(seg(t, 0.4, 1.1));
  const sp = easeInOut(seg(t, 1.3, 2.0));
  const w = easeOut(seg(t, 2.4, 2.8));
  const look = easeInOut(seg(t, 3.0, 3.6));
  return (
    <Svg label="a naming strategy sets the check scope; the wire record carries only a schema id" h={200}>
      <Cell x={25} y={14} w={130} label="OrderPlaced" o={easeOut(seg(t, 0, 0.3))} />
      <Cell x={25} y={48} w={130} label="OrderCancelled" o={easeOut(seg(t, 0, 0.3))} />
      <Cell x={lerp(160, 200, m)} y={31} w={150} label="orders-value" o={m} stroke={C.second} />
      <T x={200} y={84} s={11} f={C.latte} o={m}>
        TopicName: 1 subject
      </T>
      <Cell x={380} y={lerp(31, 14, sp)} w={170} label="OrderPlaced" o={sp} stroke={C.focus} />
      <Cell x={380} y={lerp(31, 48, sp)} w={170} label="OrderCancelled" o={sp} stroke={C.focus} />
      <T x={380} y={98} s={11} f={C.latte} o={sp}>
        RecordName: 2 subjects
      </T>
      <rect x={25} y={130} width={24} height={28} rx={3} fill={C.cocoa} stroke={C.mocha} opacity={w} />
      <T x={37} y={149} s={12} f={C.latte} a="middle" o={w}>
        0
      </T>
      <Cell x={52} y={130} w={80} label="schema id" o={w} stroke={C.focus} />
      <Cell x={135} y={130} w={170} label="order-data-bytes" o={w} />
      <T x={25} y={180} s={11} f={C.focus} o={easeOut(seg(t, 2.8, 3.1))}>
        5 bytes of overhead
      </T>
      <Req x1={310} x2={380} y={144} k={look} />
      <Cell x={390} y={130} w={160} label="OrderPlaced-v3" o={easeOut(seg(t, 3.6, 3.9))} stroke={C.focus} />
    </Svg>
  );
}

// 8 · Prove it. The run's results, one by one.
export function ProveIt({ t }: StepCtx) {
  return (
    <Svg label="this topic's own real run, every number read straight off it" h={260}>
      <Row y={30} label="needed currency gone" value="rejected" valueColor={C.cherryText} k={easeOut(seg(t, 0.2, 0.6))} />
      <Row y={70} label="optional currency" value="passes both ways" valueColor={C.focus} k={easeOut(seg(t, 0.7, 1.1))} />
      <Row y={110} label="field 2 renamed" value="wire-safe" k={easeOut(seg(t, 1.2, 1.6))} />
      <Row y={150} label="field 2 reused" value="unsafe" valueColor={C.cherryText} k={easeOut(seg(t, 1.8, 2.2))} />
      <Row y={190} label="wire overhead" value="5 bytes" k={easeOut(seg(t, 2.4, 2.8))} />
      <Row y={230} label="decoded as" value="OrderPlaced-v3" valueColor={C.focus} k={easeOut(seg(t, 3.0, 3.4))} />
    </Svg>
  );
}

// 9 · Recap. Three lines, one by one; the passing-isn't-right line outlined.
export function Recap({ t }: StepCtx) {
  const rows = ['pick the rule for who upgrades first', 'formats disagree on what the same field is', 'passing every check still isn’t being right'];
  return (
    <Svg label="pick the mode, know the format, pick the strategy, and what a contract adds" h={260}>
      {rows.map((r, i) => {
        const k = easeOut(seg(t, 0.3 + i * 1.1, 0.8 + i * 1.1));
        return <Cell key={i} x={25} y={lerp(30, 40, k) + i * 60} w={530} label={r} o={k} stroke={i === 2 ? C.focus : C.mocha} />;
      })}
    </Svg>
  );
}
