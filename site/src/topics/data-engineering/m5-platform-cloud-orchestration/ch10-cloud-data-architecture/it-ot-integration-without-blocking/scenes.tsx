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
function Pip({ x, y, o = 1, f = C.second, s = 10 }: { x: number; y: number; o?: number; f?: string; s?: number }) {
  return <rect x={x - s / 2} y={y - s / 2} width={s} height={s} rx={2} fill={f} opacity={o} />;
}

function Hole({ x, y, w, h = 28, o = 1, stroke = C.mocha }: { x: number; y: number; w: number; h?: number; o?: number; stroke?: string }) {
  return <rect x={x} y={y} width={w} height={h} rx={4} fill="none" stroke={stroke} strokeWidth={1.5} strokeDasharray="4 3" opacity={o} />;
}

/** A pointer from (x1, y) back toward x2 < x1, drawn by `k`. */
function Back({ x1, x2, y, k, f = C.crema }: { x1: number; x2: number; y: number; k: number; f?: string }) {
  const x = lerp(x1, x2, k);
  return (
    <g opacity={k > 0 ? 1 : 0}>
      <line x1={x1} y1={y} x2={x} y2={y} stroke={f} strokeWidth={1.8} />
      <path d={`M${x} ${y} l8 -5 v10 z`} fill={f} />
    </g>
  );
}

// Every claim here traces to the Purdue reference model, Rockwell's and Cisco's iDMZ guidance, the OPC Foundation's and
// Eclipse Sparkplug's own specifications (SOURCES.md), or to examples.py's local queue standing in for a broker.

// 0 · SCADA running a production line below it, and a dashboard wired straight in. Queries flow along the bare line; one
// long query parks on it, the line below slows, an alarm's acknowledgement lags. Between the two: nothing at all.
export function DirectDashboardHook({ t }: StepCtx) {
  const k = (d: number) => easeOut(seg(t, d, d + 0.35));
  const dist = t < 2.2 ? t * 60 : 132 + (t - 2.2) * 14;
  const long = easeOut(seg(t, 2.0, 2.4));
  return (
    <Svg label="A dashboard reading SCADA directly, until its own query slows SCADA down" h={250}>
      <Cell x={25} y={60} w={170} label="SCADA" o={k(0)} />
      <line x1={25} y1={150} x2={250} y2={150} stroke={C.mocha} strokeWidth={2} opacity={k(0.1)} />
      {t > 0.2 &&
        [0, 1, 2, 3, 4].map((j) => {
          const x = 25 + ((dist + j * 45) % 225);
          return <Pip key={j} x={x} y={140} s={10} f={C.second} />;
        })}
      <T x={25} y={176} s={11} f={C.taupe} o={k(0.2)}>
        the production line
      </T>
      <Cell x={405} y={60} w={170} label="dashboard" o={k(0.3)} />
      <line x1={200} y1={74} x2={lerp(400, 200, k(0.4))} y2={74} stroke={C.crema} strokeWidth={1.5} />
      {[0, 1, 2].map((j) => {
        const m = seg(t, 0.8 + j * 0.4, 1.3 + j * 0.4);
        return m > 0 && m < 1 ? <Pip key={j} x={lerp(395, 205, m)} y={74} s={8} f={C.caramel} /> : null;
      })}
      <rect x={lerp(395, 215, long)} y={68} width={110} height={12} rx={2} fill={C.cherryText} opacity={long > 0 ? 0.9 : 0} />
      {t > 2.4 && (
        <T x={270} y={56} s={11} f={C.cherryText} a="middle" o={k(2.4)}>
          left running overnight
        </T>
      )}
      <Cell x={25} y={196} w={110} label="alarm" o={k(2.8) * (t > 2.8 ? 0.6 + 0.4 * Math.abs(Math.sin(t * 6)) : 1)} stroke={C.cherryText} f={C.cherryText} />
      {t > 3.2 && (
        <T x={145} y={215} s={11} f={C.cherryText} o={k(3.2)}>
          acknowledged late
        </T>
      )}
      {t > 3.8 && (
        <T x={575} y={140} s={12} f={C.crema} a="end" o={k(3.8)}>
          nothing between them
        </T>
      )}
    </Svg>
  );
}

// 1 · Predict. The source and the consumer with an empty slot between them; a faster query only shifts the odds. Once
// answered, a buffer drops into the slot and the consumer's trouble, reaching back, stops at it.
export function PredictWhatChanges({ t, answer }: StepCtx) {
  const s = useSinceAnswer(answer !== null);
  const v = answer !== null ? easeOutBack(seg(s, 0.1, 0.5)) : 0;
  const w = answer !== null ? easeOut(seg(s, 0.6, 1.0)) : 0;
  const k = (d: number) => easeOut(seg(t, d, d + 0.3));
  return (
    <Svg label="A faster query only lowers the odds — what removes the failure entirely?" h={250}>
      <T x={25} y={30} s={11} f={C.taupe} o={k(0)}>
        a faster query: lower odds, same risk
      </T>
      <Cell x={25} y={90} w={150} label="OT source" o={k(0.1)} />
      <Cell x={425} y={90} w={150} label="consumer" o={k(0.2)} />
      <Hole x={225} y={90} w={150} o={k(0.3) * (1 - clamp(v))} />
      {answer === null && t > 0.5 && (
        <T x={300} y={109} s={15} f={C.taupe} a="middle" o={k(0.5)}>
          ?
        </T>
      )}
      {v > 0 && <Cell x={225} y={lerp(60, 90, v)} w={150} label="buffer" o={clamp(v * 2)} stroke={C.focus} f={C.focus} />}
      <Back x1={420} x2={382} y={140} k={w} f={C.cherryText} />
      <Cross x={368} y={140} k={w} />
      <Verdict answer={answer} text="a buffer in between" y={200} />
    </Svg>
  );
}

// 2 · The ladder builds from the bottom: level 0, the physical process, up through controllers, supervisory systems,
// manufacturing operations and the site business layer, to the corporate layer at level 5.
export function PurdueLevels({ t }: StepCtx) {
  const rungs = ['physical process: sensors, actuators', 'controllers: PLCs, transmitters', 'supervisory: SCADA, HMI', 'operations: MES, historians', 'site business: ERP', 'enterprise, corporate'];
  return (
    <Svg label="The five Purdue levels, stacked from the physical process up to the enterprise" h={250}>
      {rungs.map((r, i) => {
        const a = easeOut(seg(t, 0.3 + i * 0.7, 0.75 + i * 0.7));
        const y = 214 - i * 37;
        return (
          <g key={r} opacity={a}>
            <T x={36} y={y + 19} s={13} f={C.caramel} a="middle">
              {String(i)}
            </T>
            <Cell x={60} y={y + (1 - a) * 10} w={515} label={r} />
          </g>
        );
      })}
    </Svg>
  );
}

// 3 · Three zones: OT, the iDMZ between, IT. Data crosses only by stopping in the middle; a direct line around it is
// struck off. Below, a diode: a forward wire carrying data, and for the reverse direction no wire at all.
export function DmzAndDiode({ t }: StepCtx) {
  const k = (d: number) => easeOut(seg(t, d, d + 0.35));
  const zones = [
    { x: 25, label: 'OT', f: C.crema },
    { x: 225, label: 'iDMZ', f: C.caramel },
    { x: 425, label: 'IT', f: C.crema },
  ];
  const a = easeInOut(seg(t, 0.6, 1.1));
  const b = easeInOut(seg(t, 1.3, 1.8));
  const rev = easeOut(seg(t, 3.8, 4.4));
  return (
    <Svg label="A zone of its own between OT and IT, and a diode whose one-way rule is physical" h={250}>
      {zones.map((z, i) => (
        <g key={z.label} opacity={k(i * 0.15)}>
          <rect x={z.x} y={30} width={150} height={76} rx={6} fill="none" stroke={z.f === C.caramel ? C.caramel : C.mocha} strokeWidth={1.5} />
          <T x={z.x + 12} y={50} s={12} f={z.f}>
            {z.label}
          </T>
        </g>
      ))}
      {a > 0 && b < 1 && <Pip x={b > 0 ? lerp(300, 500, b) : lerp(100, 300, a)} y={84} s={12} f={C.second} />}
      {b >= 1 && <Pip x={500} y={84} s={12} f={C.second} />}
      {t > 1.0 && t < 1.4 && <circle cx={300} cy={84} r={11} fill="none" stroke={C.caramel} strokeWidth={1.5} />}
      <line x1={100} y1={124} x2={lerp(100, 500, k(2.0))} y2={124} stroke={C.cherryText} strokeWidth={1.5} strokeDasharray="4 3" opacity={k(2.0) * (1 - 0.5 * k(2.5))} />
      <Cross x={300} y={124} k={k(2.5)} />
      {t > 2.6 && (
        <T x={325} y={146} s={11} f={C.cherryText} o={k(2.6)}>
          nothing goes around it
        </T>
      )}
      <T x={25} y={180} s={12} f={C.crema} o={k(3.0)}>
        a data diode
      </T>
      <Req x1={140} x2={570} y={180} k={easeInOut(seg(t, 3.1, 3.6))} f={C.second} />
      {rev > 0 && rev < 1 && <Pip x={lerp(560, 470, rev)} y={214} s={10} f={C.cherryText} o={1 - rev} />}
      {t > 4.2 && (
        <T x={140} y={218} s={11} f={C.cherryText} o={k(4.2)}>
          reverse: no wire exists at all
        </T>
      )}
    </Svg>
  );
}

// 4 · Three rows. OPC UA asks a PLC and gets a value straight back, under its own lock. Sparkplug B: a new subscriber
// joins and births light at once, a death marks one offline. A historian API reads only from the stored past.
export function ThreeMechanisms({ t }: StepCtx) {
  const k = (d: number) => easeOut(seg(t, d, d + 0.35));
  const hist = easeInOut(seg(t, 3.6, 4.3));
  return (
    <Svg label="Three different ways to read the plant floor, each for something different" h={250}>
      <Cell x={25} y={30} w={150} label="OPC UA" o={k(0)} />
      <Cell x={420} y={30} w={155} label="PLC / SCADA" o={k(0.1)} />
      <Req x1={185} x2={414} y={40} k={easeInOut(seg(t, 0.4, 0.9))} />
      <Back x1={414} x2={185} y={52} k={easeInOut(seg(t, 0.9, 1.4))} f={C.second} />
      <Lock x={290} y={64} k={k(1.2)} f={C.focus} />
      {t > 1.4 && (
        <T x={315} y={76} s={11} f={C.taupe} o={k(1.4)}>
          live, direct, secured
        </T>
      )}
      <Cell x={25} y={108} w={150} label="Sparkplug B" o={k(1.6)} />
      <Cell x={190} y={108} w={150} label="new subscriber" o={k(2.0)} />
      {[0, 1, 2].map((j) => (
        <Pip key={j} x={430 + j * 40} y={122} s={12} f={t > 2.4 ? (j === 2 ? C.cherryText : C.focus) : C.mocha} o={k(1.8)} />
      ))}
      {t > 2.6 && (
        <T x={400} y={152} s={11} f={C.focus} o={k(2.6)}>
          who's online, unasked
        </T>
      )}
      <Cell x={25} y={180} w={150} label="historian API" o={k(3.2)} />
      <rect x={190} y={188} width={330} height={12} rx={2} fill={C.second} opacity={k(3.3) * 0.8} />
      <Back x1={520} x2={200} y={220} k={hist} f={C.caramel} />
      {t > 4.4 && (
        <T x={575} y={244} s={11} f={C.caramel} a="end" o={k(4.4)}>
          only what already happened
        </T>
      )}
    </Svg>
  );
}

// 5 · Left, no buffer: the consumer freezes and the next publish stalls against it, back into the OT source. Right, with a
// buffer: the same freeze, and the source keeps publishing; five messages wait in the buffer.
export function BufferIsolationProof({ t }: StepCtx) {
  const k = (d: number) => easeOut(seg(t, d, d + 0.35));
  const p1 = easeInOut(seg(t, 0.3, 0.8));
  const stall = t > 1.0;
  const p2 = easeOut(seg(t, 1.3, 1.7));
  const blocked = t > 1.9;
  const stall2 = t > 2.6;
  return (
    <Svg label="A stalled consumer blocks the source with no buffer, and doesn't with one" h={250}>
      <T x={25} y={30} s={11} f={C.taupe} o={k(0)}>
        no buffer
      </T>
      <Cell x={25} y={50} w={110} label="OT source" o={k(0)} stroke={blocked ? C.cherryText : C.mocha} />
      <Cell x={175} y={50} w={110} label={stall ? 'stalled' : 'consumer'} o={k(0.1)} stroke={stall ? C.taupe : C.mocha} f={stall ? C.taupe : C.crema} />
      {p1 > 0 && p1 < 1 && <Pip x={lerp(140, 170, p1)} y={64} s={8} f={C.second} />}
      {p2 > 0 && <Pip x={lerp(140, 162, p2)} y={64} s={8} f={C.cherryText} />}
      <Cross x={80} y={100} k={k(1.9)} />
      {t > 2.0 && (
        <T x={25} y={130} s={11} f={C.cherryText} o={k(2.0)}>
          the next publish blocks
        </T>
      )}
      <T x={315} y={30} s={11} f={C.taupe} o={k(2.3)}>
        with a buffer
      </T>
      <Cell x={315} y={50} w={110} label="OT source" o={k(2.3)} stroke={t > 4.4 ? C.focus : C.mocha} />
      <Hole x={440} y={50} w={135} o={k(2.4)} stroke={C.focus} />
      <Cell x={440} y={110} w={135} label={stall2 ? 'stalled' : 'consumer'} o={k(2.4)} stroke={stall2 ? C.taupe : C.mocha} f={stall2 ? C.taupe : C.crema} />
      {[0, 1, 2, 3, 4].map((j) => {
        const m = easeInOut(seg(t, 2.8 + j * 0.3, 3.1 + j * 0.3));
        const slot = 558 - j * 24;
        return m > 0 ? <Pip key={j} x={lerp(430, slot, m)} y={64} s={10} f={C.second} /> : null;
      })}
      {t > 4.3 && (
        <T x={440} y={160} s={11} f={C.focus} o={k(4.3)}>
          5 held, none lost
        </T>
      )}
      <MiniTick x={315} y={96} k={k(4.4)} />
      {t > 4.5 && (
        <T x={315} y={200} s={12} f={C.focus} o={k(4.5)}>
          the source never notices
        </T>
      )}
    </Svg>
  );
}

/** Where a link between two system cells leaves cell `a`: its side edge for a cell on the same row, else top or bottom. */
function anchor(a: { x: number; y: number }, b: { x: number; y: number }) {
  if (a.y === b.y) return [a.x < b.x ? a.x + 120 : a.x, a.y + 14];
  return [a.x + 60, a.y < b.y ? a.y + 28 : a.y];
}

// 6 · Four plant systems wired pair by pair, a tangle of six links. The tangle fades; one namespace appears in the middle
// and each system connects to it once. Above it, how systems talk; below it, ISA-95, what the data means.
export function UnifiedNamespace({ t }: StepCtx) {
  const k = (d: number) => easeOut(seg(t, d, d + 0.35));
  const sys = [
    { x: 30, y: 46, label: 'PLC' },
    { x: 450, y: 46, label: 'MES' },
    { x: 30, y: 176, label: 'historian' },
    { x: 450, y: 176, label: 'ERP' },
  ];
  const c = sys.map((s) => [s.x + 60, s.y + 14]);
  const pairs = [
    [0, 1],
    [0, 2],
    [0, 3],
    [1, 2],
    [1, 3],
    [2, 3],
  ];
  const fade = easeInOut(seg(t, 1.7, 2.1));
  const spokes = easeOut(seg(t, 2.5, 3.0));
  return (
    <Svg label="One shared namespace instead of wiring every pair of systems by hand" h={250}>
      {fade < 1 &&
        pairs.map(([a, b], i) => {
          const d = easeOut(seg(t, 0.3 + i * 0.15, 0.6 + i * 0.15));
          const [ax, ay] = anchor(sys[a], sys[b]);
          const [bx, by] = anchor(sys[b], sys[a]);
          return <line key={i} x1={ax} y1={ay} x2={lerp(ax, bx, d)} y2={lerp(ay, by, d)} stroke={C.cherryText} strokeWidth={1.3} opacity={(1 - fade) * (d > 0 ? 1 : 0)} />;
        })}
      {fade >= 1 && (
        <g>
          {c.map(([x, y], i) => (
            <line key={i} x1={x} y1={y + (i < 2 ? 14 : -14)} x2={lerp(x, 300, spokes)} y2={lerp(y + (i < 2 ? 14 : -14), 125, spokes)} stroke={C.focus} strokeWidth={1.5} />
          ))}
          <Cell x={200} y={111} w={200} label="unified namespace" o={k(2.2)} stroke={C.focus} f={C.focus} />
        </g>
      )}
      {sys.map((s) => (
        <Cell key={s.label} x={s.x} y={s.y} w={120} label={s.label} o={k(0)} />
      ))}
      {t > 3.3 && (
        <T x={300} y={92} s={11} f={C.focus} a="middle" o={k(3.3)}>
          how systems talk
        </T>
      )}
      {t > 3.8 && (
        <T x={300} y={166} s={11} f={C.caramel} a="middle" o={k(3.8)}>
          ISA-95: what the data means
        </T>
      )}
    </Svg>
  );
}

// 7 · Recap. The arrow first: data flows from the OT source to the consumer, and an arrow pointing back upstream is struck
// off. Then the four points as four cards.
export function Recap({ t }: StepCtx) {
  const k = (d: number) => easeOut(seg(t, d, d + 0.35));
  const pts = ['five levels: the vocabulary', "a diode's rule is physical", 'each mechanism: one question', 'a namespace is not a model'];
  return (
    <Svg label="The four-part recap of this topic's point" h={250}>
      <Cell x={25} y={30} w={150} label="upstream" o={k(0)} />
      <Cell x={425} y={30} w={150} label="downstream" o={k(0.1)} />
      <Req x1={180} x2={419} y={40} k={easeInOut(seg(t, 0.3, 0.8))} f={C.focus} />
      <Back x1={419} x2={320} y={54} k={easeOut(seg(t, 0.9, 1.3))} f={C.cherryText} />
      <Cross x={300} y={54} k={k(1.3)} />
      {pts.map((p, i) => {
        const d = 1.8 + i * 0.5;
        const a = easeOut(seg(t, d, d + 0.4));
        const x = 25 + (i % 2) * 285;
        const y = 110 + Math.floor(i / 2) * 50;
        return a > 0 ? <Cell key={p} x={lerp(x - 16, x, a)} y={y} w={265} label={p} o={a} /> : null;
      })}
    </Svg>
  );
}

// 8 · Prove it. MES polling a PLC directly, no buffer. A maintenance window opens on MES and the PLC's loop ticks start to
// drift apart. Once answered, the empty slot between them is named: the missing buffer.
export function ProveIt({ t, answer }: StepCtx) {
  const s = useSinceAnswer(answer !== null);
  const v = answer !== null ? easeOut(seg(s, 0.1, 0.6)) : 0;
  const k = (d: number) => easeOut(seg(t, d, d + 0.3));
  const drift = clamp(seg(t, 1.4, 2.4));
  const gaps = [0, 1, 2, 3, 4, 5, 6].map((j) => 25 + j * 20 + drift * j * j * 1.6);
  return (
    <Svg label="MES polls a PLC directly, with nothing buffering the connection between them" h={250}>
      <Cell x={25} y={80} w={150} label="PLC" o={k(0)} />
      <Cell x={425} y={80} w={150} label="MES" o={k(0.1)} stroke={t > 0.8 ? C.caramel : C.mocha} />
      <Back x1={420} x2={182} y={94} k={k(0.3)} />
      {t > 0.9 && (
        <T x={425} y={70} s={11} f={C.caramel} o={k(0.9)}>
          maintenance window
        </T>
      )}
      {gaps.map((x, j) => (
        <line key={j} x1={x} y1={132} x2={x} y2={148} stroke={drift > 0.3 ? C.cherryText : C.crema} strokeWidth={1.5} opacity={k(0.5)} />
      ))}
      {t > 2.0 && (
        <T x={25} y={172} s={11} f={C.cherryText} o={k(2.0)}>
          loop timing drifts
        </T>
      )}
      {v > 0 && <Hole x={250} y={80} w={100} o={v} stroke={C.focus} />}
      {v > 0.5 && (
        <T x={300} y={132} s={11} f={C.focus} a="middle" o={v}>
          a buffer, missing
        </T>
      )}
      <Verdict answer={answer} text="a missing edge buffer" y={230} />
    </Svg>
  );
}
