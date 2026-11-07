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
/** A fan line from (x1, y1) to (x2, y2), drawn by `k`, ending in a dot. */
/** A fan line from (x1, y1) to (x2, y2), drawn by `k`, ending in a dot. */
function Fan({ x1, y1, x2, y2, k, f = C.crema }: { x1: number; y1: number; x2: number; y2: number; k: number; f?: string }) {
  if (k <= 0) return null;
  const x = lerp(x1, x2, k);
  const y = lerp(y1, y2, k);
  return (
    <g>
      <line x1={x1} y1={y1} x2={x} y2={y} stroke={f} strokeWidth={1.6} />
      <circle cx={x} cy={y} r={3} fill={f} />
    </g>
  );
}

// Every value here is examples.py's own: brokers 1, 2 and 3 with a replication factor of 3 and min.insync.replicas of 2,
// the in-sync sets the roller checks, whenDeleted and whenScaled as Retain or Delete, and the stateless, last-state and
// savepoint upgrade modes with the savepoint fallback. No cluster ran; these rules are modelled from the sources. These
// steps are short, so each scene runs its own clock a little faster (t = t0 times a factor).

const B = [1, 2, 3];

/** A replica pip: one copy of the partition. */
function Copy({ x, y, o = 1, f = C.second }: { x: number; y: number; o?: number; f?: string }) {
  return <Pip x={x} y={y} s={14} f={f} o={o} />;
}

/** An in-sync set as three slots, filled for the brokers in `isr`. */
function Isr({ x, y, isr, o = 1 }: { x: number; y: number; isr: number[]; o?: number }) {
  return (
    <g opacity={o}>
      {B.map((b, i) => (
        <g key={b}>
          <rect x={x + i * 34} y={y} width={26} height={26} rx={3} fill="none" stroke={isr.includes(b) ? C.focus : C.mocha} strokeWidth={1.5} strokeDasharray={isr.includes(b) ? undefined : '3 3'} />
          <T x={x + i * 34 + 13} y={y + 17} s={11} f={isr.includes(b) ? C.crema : C.taupe} a="middle">
            {`${b}`}
          </T>
        </g>
      ))}
    </g>
  );
}

// 0 · Hook. Three nodes, one broker each, each holding one copy of the same partition. A drain marks nodes 1 and 2, their
// outlines turning dashed red: two of the three copies sit on the nodes being drained.
export function Hook({ t: t0 }: StepCtx) {
  const t = t0 * 1.65;
  const k = (d: number) => easeOut(seg(t, d, d + 0.35));
  return (
    <Svg label="A drain takes two of three brokers at once. Replication factor three, min insync replicas two" h={250}>
      <T x={25} y={34} s={11} f={C.taupe} o={k(0)}>
        min.insync.replicas: 2, three copies
      </T>
      {B.map((b, i) => {
        const x = 25 + i * 190;
        const dr = i < 2 && t > 1.2 + i * 0.4;
        return (
          <g key={b}>
            <rect x={x} y={56} width={170} height={100} rx={6} fill="none" stroke={dr ? C.cherryText : C.mocha} strokeWidth={1.6} strokeDasharray={dr ? '6 4' : undefined} opacity={k(i * 0.15)} />
            <Cell x={x + 20} y={72} w={130} label={`broker ${b}`} o={k(0.1 + i * 0.15)} />
            <Copy x={x + 85} y={130} o={k(0.6 + i * 0.1)} />
            {dr && (
              <T x={x + 85} y={176} s={11} f={C.cherryText} a="middle" o={k(1.2 + i * 0.4)}>
                draining
              </T>
            )}
          </g>
        );
      })}
      {t > 2.6 && (
        <T x={25} y={226} s={12} f={C.crema} o={k(2.6)}>
          two of the three copies, drained at once
        </T>
      )}
    </Svg>
  );
}

// 1 · Predict. The in-sync set holds 1, 2 and 3; an acks=all producer writes into it, and the drain tries to take 1 and 2. Once
// answered, 1 leaves (allowed), 2's eviction is crossed out and held, and the producer's arrow pauses: stalled, nothing lost.
export function PredictDrain({ t, answer }: StepCtx) {
  const s = useSinceAnswer(answer !== null);
  const a = answer !== null ? easeOut(seg(s, 0.1, 0.5)) : 0;
  const b = answer !== null ? easeOut(seg(s, 0.6, 1.0)) : 0;
  const k = (d: number) => easeOut(seg(t, d, d + 0.3));
  return (
    <Svg label="If the drain evicts both at once, what happens to a producer using acks all?" h={250}>
      <Cell x={25} y={60} w={165} label="acks=all producer" o={k(0)} />
      <Req x1={195} x2={290} y={74} k={k(0.3)} f={b > 0.5 ? C.taupe : C.crema} />
      <Isr x={300} y={61} isr={a > 0.5 ? [2, 3] : [1, 2, 3]} o={k(0.2)} />
      <T x={300} y={48} s={11} f={C.taupe} o={k(0.2)}>
        in sync
      </T>
      {answer === null && t > 0.8 && (
        <T x={480} y={80} s={15} f={C.taupe} a="middle" o={k(0.8)}>
          ?
        </T>
      )}
      {answer !== null && (
        <T x={300} y={120} s={11} f={C.focus} o={a}>
          broker 1 leaves: still 2 in sync
        </T>
      )}
      <Cross x={351} y={74} k={b} />
      {answer !== null && (
        <T x={300} y={146} s={11} f={C.cherryText} o={b}>
          broker 2 held back
        </T>
      )}
      <Verdict answer={answer} text="writes stall; nothing is lost" y={204} />
    </Svg>
  );
}

// 2 · Broker or executor. Left: an executor is crossed out and a fresh, nameless one drops in, no disk. Right: broker 1 goes
// down and comes back under the same name, reattached to the same disk.
export function BrokerVsExecutor({ t: t0 }: StepCtx) {
  const t = t0 * 1.55;
  const k = (d: number) => easeOut(seg(t, d, d + 0.35));
  const gone = easeIn2(seg(t, 0.5, 0.9));
  const back = easeOutBack(seg(t, 1.0, 1.5));
  const bdown = t > 2.0 && t < 2.6;
  return (
    <Svg label="A Spark executor is disposable. A broker owns a name and a disk that must follow it" h={250}>
      <T x={25} y={34} s={11} f={C.taupe} o={k(0)}>
        an executor
      </T>
      {t < 0.9 && <Cell x={25} y={60 + gone * 30} w={150} label="executor" o={1 - gone} />}
      <Cross x={100} y={74} k={k(0.3) * (1 - gone)} />
      {t > 1.0 && <Cell x={25} y={lerp(20, 60, back)} w={150} label="a fresh one" o={clamp(back)} stroke={C.focus} />}
      {t > 1.5 && (
        <T x={25} y={120} s={11} f={C.taupe} o={k(1.5)}>
          no memory of the old
        </T>
      )}
      <T x={330} y={34} s={11} f={C.taupe} o={k(1.6)}>
        a broker
      </T>
      <Cell x={330} y={60} w={150} label="broker 1" o={k(1.7) * (bdown ? 0.2 : 1)} stroke={t > 2.6 ? C.focus : C.mocha} />
      <line x1={405} y1={88} x2={405} y2={112} stroke={C.mocha} strokeWidth={1.4} opacity={k(1.8)} />
      <rect x={345} y={112} width={120} height={22} rx={11} fill="none" stroke={C.second} strokeWidth={1.6} opacity={k(1.8)} />
      <T x={405} y={127} s={11} f={C.second} a="middle" o={k(1.8)}>
        its disk
      </T>
      {t > 2.7 && (
        <T x={330} y={166} s={11} f={C.focus} o={k(2.7)}>
          same name, same disk
        </T>
      )}
      {t > 3.4 && (
        <T x={25} y={226} s={12} f={C.crema} o={k(3.4)}>
          a sticky identity, for a workload that needs one
        </T>
      )}
    </Svg>
  );
}

// 3 · Stable storage. broker 1 moves from node A to node B and its volume follows it. Then the retention choice: with
// whenDeleted Retain the volume stays, ticked; with Delete it is crossed out.
export function StableStorage({ t: t0 }: StepCtx) {
  const t = t0 * 1.55;
  const k = (d: number) => easeOut(seg(t, d, d + 0.35));
  const mv = easeInOut(seg(t, 0.5, 1.5));
  const px = lerp(45, 335, mv);
  return (
    <Svg label="volumeClaimTemplates gives each pod its own volume; a retention policy decides if deleting or scaling keeps it" h={250}>
      {['node A', 'node B'].map((n, i) => (
        <g key={n}>
          <rect x={25 + i * 290} y={36} width={260} height={84} rx={6} fill="none" stroke={C.mocha} strokeWidth={1.5} opacity={k(0)} />
          <T x={35 + i * 290} y={54} s={11} f={C.taupe} o={k(0)}>
            {n}
          </T>
        </g>
      ))}
      <Cell x={px} y={64} w={110} label="broker 1" o={k(0.1)} />
      <line x1={px + 110} y1={78} x2={px + 130} y2={78} stroke={C.second} strokeWidth={1.6} opacity={k(0.2)} />
      <rect x={px + 130} y={68} width={70} height={20} rx={10} fill="none" stroke={C.second} strokeWidth={1.6} opacity={k(0.2)} />
      {t > 1.6 && (
        <T x={315} y={136} s={11} f={C.second} o={k(1.6)}>
          its volume followed it
        </T>
      )}
      <T x={25} y={176} s={11} f={C.latte} o={k(2.0)}>
        whenDeleted: Retain
      </T>
      <rect x={200} y={164} width={70} height={18} rx={9} fill="none" stroke={C.focus} strokeWidth={1.6} opacity={k(2.2)} />
      <MiniTick x={282} y={170} k={k(2.6)} />
      <T x={330} y={176} s={11} f={C.latte} o={k(2.4)}>
        whenDeleted: Delete
      </T>
      <rect x={500} y={164} width={70} height={18} rx={9} fill="none" stroke={C.cherryText} strokeWidth={1.6} strokeDasharray="4 3" opacity={k(2.6) * (1 - 0.5 * k(3.0))} />
      <Cross x={535} y={173} k={k(3.0)} />
    </Svg>
  );
}

// 4 · Strimzi's own resources. A plain StatefulSet holds three equal disks. One broker needs a bigger disk, and it does not
// fit: crossed out. Two new cards slide in, StrimziPodSet and KafkaNodePool, fed from the same idea.
export function StrimziResources({ t: t0 }: StepCtx) {
  const t = t0 * 1.43;
  const k = (d: number) => easeOut(seg(t, d, d + 0.35));
  const big = easeInOut(seg(t, 0.8, 1.4));
  return (
    <Svg label="Strimzi uses its own StrimziPodSet and KafkaNodePool resources, not a plain StatefulSet" h={250}>
      <rect x={25} y={36} width={250} height={140} rx={6} fill="none" stroke={C.mocha} strokeWidth={1.5} opacity={k(0)} />
      <T x={40} y={58} s={11} f={C.taupe} o={k(0)}>
        a plain StatefulSet
      </T>
      {[0, 1, 2].map((i) => {
        const w = i === 2 ? lerp(60, 110, big) : 60;
        return <rect key={i} x={45} y={76 + i * 30} width={w} height={20} rx={10} fill="none" stroke={i === 2 && big > 0.5 ? C.cherryText : C.second} strokeWidth={1.6} opacity={k(0.2 + i * 0.1)} />;
      })}
      {t > 1.4 && (
        <T x={170} y={152} s={11} f={C.cherryText} o={k(1.4)}>
          uneven
        </T>
      )}
      <Cross x={250} y={58} k={k(1.7)} />
      <Req x1={285} x2={345} y={106} k={k(2.0)} />
      <Cell x={350} y={60} w={225} label="StrimziPodSet" o={k(2.2)} stroke={C.focus} />
      <Cell x={350} y={120} w={225} label="KafkaNodePool" o={k(2.6)} stroke={C.focus} />
      {t > 3.2 && (
        <T x={25} y={222} s={12} f={C.crema} o={k(3.2)}>
          the same idea, shaped to what Kafka needs
        </T>
      )}
    </Svg>
  );
}

// 5 · Rack awareness. Three zones, one copy in each. Zone A fails, crossed out; the two other copies remain, ticked. Then
// replication traffic pulses between the zones without stopping: the price, paid on every write.
export function RackAwareness({ t: t0 }: StepCtx) {
  const t = t0 * 1.55;
  const k = (d: number) => easeOut(seg(t, d, d + 0.35));
  const fail = k(1.0);
  const ph = (t * 1.2) % 1;
  return (
    <Svg label="Spreading replicas across racks or zones improves fault tolerance, at the cost of cross zone traffic" h={250}>
      {['zone A', 'zone B', 'zone C'].map((z, i) => {
        const x = 25 + i * 190;
        return (
          <g key={z}>
            <rect
              x={x}
              y={36}
              width={170}
              height={110}
              rx={6}
              fill="none"
              stroke={i === 0 && fail > 0.5 ? C.cherryText : C.mocha}
              strokeWidth={1.5}
              opacity={k(i * 0.15) * (i === 0 ? 1 - 0.5 * fail : 1)}
            />
            <T x={x + 12} y={56} s={11} f={C.taupe} o={k(i * 0.15)}>
              {z}
            </T>
            <Copy x={x + 85} y={96} o={k(0.4 + i * 0.1) * (i === 0 ? 1 - 0.7 * fail : 1)} />
            {i > 0 && <MiniTick x={x + 100} y={90} k={k(1.5)} />}
          </g>
        );
      })}
      <Cross x={110} y={96} k={fail} />
      {t > 2.0 &&
        [0, 1].map((i) => {
          const x1 = 300 + i * 190 - 190 + 100;
          const x = lerp(x1, x1 + 170, ph);
          return <circle key={i} cx={x} cy={170} r={4} fill={C.second} opacity={k(2.0)} />;
        })}
      {t > 2.0 && <line x1={125} y1={170} x2={500} y2={170} stroke={C.second} strokeWidth={1.2} strokeDasharray="4 4" opacity={k(2.0) * 0.6} />}
      {t > 2.4 && (
        <T x={25} y={206} s={11} f={C.second} o={k(2.4)}>
          replication crosses zones on every write
        </T>
      )}
    </Svg>
  );
}

// 6 · The roller's rule. Two in-sync sets. With 1, 2 and 3 in sync, restarting broker 1 leaves two: ticked, it rolls. With only
// 1 and 2 in sync, restarting broker 1 would leave one: crossed out, it waits.
export function RollerRule({ t: t0 }: StepCtx) {
  const t = t0 * 1.55;
  const k = (d: number) => easeOut(seg(t, d, d + 0.35));
  const r1 = easeInOut(seg(t, 0.6, 1.1));
  return (
    <Svg label="The roller checks the ISR before every restart: would this drop a topic below its minimum in sync replicas?" h={250}>
      <T x={25} y={34} s={11} f={C.taupe} o={k(0)}>
        min.insync.replicas: 2
      </T>
      <Isr x={25} y={56} isr={r1 > 0.5 ? [2, 3] : [1, 2, 3]} o={k(0.1)} />
      <T x={150} y={74} s={11} f={C.latte} o={k(0.3)}>
        restart broker 1
      </T>
      <MiniTick x={290} y={66} k={k(1.2)} />
      {t > 1.2 && (
        <T x={310} y={74} s={11} f={C.focus} o={k(1.2)}>
          still 2 in sync: it rolls
        </T>
      )}
      <Isr x={25} y={130} isr={[1, 2]} o={k(1.6)} />
      <T x={150} y={148} s={11} f={C.latte} o={k(1.8)}>
        restart broker 1
      </T>
      <Cross x={296} y={144} k={k(2.4)} />
      {t > 2.4 && (
        <T x={310} y={148} s={11} f={C.cherryText} o={k(2.4)}>
          would leave 1: it waits
        </T>
      )}
      {t > 3.1 && (
        <T x={25} y={222} s={12} f={C.crema} o={k(3.1)}>
          the real in-sync set, checked before every restart
        </T>
      )}
    </Svg>
  );
}

// 7 · Drain Cleaner and the PDB. A node's eviction arrow is caught by Drain Cleaner and handed on to the roller's same check,
// which holds it. Beside it, a disruption budget shield draws: the Kubernetes side of the same promise.
export function DrainCleanerPdb({ t: t0 }: StepCtx) {
  const t = t0 * 1.65;
  const k = (d: number) => easeOut(seg(t, d, d + 0.35));
  return (
    <Svg label="Strimzi Drain Cleaner turns a node eviction into that same safe roll; a pod disruption budget is Kubernetes's half" h={250}>
      <Cell x={25} y={60} w={130} label="a node drain" o={k(0)} />
      <Req x1={160} x2={215} y={74} k={k(0.3)} />
      <Cell x={220} y={60} w={140} label="Drain Cleaner" o={k(0.5)} stroke={C.second} />
      <Req x1={365} x2={425} y={74} k={k(1.0)} />
      <Cell x={430} y={60} w={145} label="the roller's check" o={k(1.2)} stroke={C.focus} />
      {t > 1.8 && (
        <T x={430} y={110} s={11} f={C.focus} o={k(1.8)}>
          held until safe
        </T>
      )}
      <path d="M200 150 Q 180 178 200 206" fill="none" stroke={C.second} strokeWidth={3} opacity={k(2.3)} />
      <T x={225} y={182} s={11} f={C.second} o={k(2.4)}>
        a disruption budget: the same promise
      </T>
    </Svg>
  );
}

// 8 · KRaft only. A ZooKeeper cluster's arrow straight to the current release is crossed out. The path that works draws
// instead: to KRaft first, on an earlier release, then on to the current one, ticked.
export function KraftOnly({ t: t0 }: StepCtx) {
  const t = t0 * 1.65;
  const k = (d: number) => easeOut(seg(t, d, d + 0.35));
  return (
    <Svg label="The current Strimzi release removed ZooKeeper based clusters and the migration path to KRaft entirely" h={250}>
      <Cell x={25} y={60} w={150} label="on ZooKeeper" o={k(0)} />
      <Req x1={180} x2={415} y={74} k={k(0.3)} f={C.cherryText} />
      <Cell x={420} y={60} w={155} label="current Strimzi" o={k(0.3)} />
      <Cross x={300} y={74} k={k(1.0)} />
      <path d={`M100 90 V${lerp(90, 150, k(1.4))}`} stroke={C.focus} strokeWidth={1.8} />
      <Cell x={25} y={150} w={260} label="KRaft, on an earlier release" o={k(1.7)} stroke={C.focus} />
      <path d={`M285 164 H${lerp(285, 495, k(2.2))} V${lerp(164, 92, k(2.6))}`} fill="none" stroke={C.focus} strokeWidth={1.8} />
      <MiniTick x={510} y={100} k={k(2.9)} />
      {t > 3.1 && (
        <T x={25} y={226} s={12} f={C.crema} o={k(3.1)}>
          no in-place path left from ZooKeeper
        </T>
      )}
    </Svg>
  );
}

// 9 · Flink, declared. A FlinkDeployment spec above, the running job's status below, and the operator's loop between them,
// its marker turning; the status bar drifts short and the operator pulls it back to match.
export function FlinkDeclared({ t: t0 }: StepCtx) {
  const t = t0 * 1.8;
  const k = (d: number) => easeOut(seg(t, d, d + 0.35));
  const st = easeInOut(seg(t, 0.4, 1.2)) * (1 - 0.5 * easeInOut(seg(t, 1.6, 2.0))) + 0.5 * easeInOut(seg(t, 2.4, 3.0));
  const ang = t * 2.4;
  return (
    <Svg label="The Flink Kubernetes Operator reconciles a job declared as a custom resource" h={250}>
      <T x={25} y={62} s={11} f={C.second} o={k(0)}>
        FlinkDeployment
      </T>
      <rect x={170} y={50} width={250} height={18} rx={2} fill="none" stroke={C.second} strokeWidth={1.5} opacity={k(0)} />
      <T x={25} y={152} s={11} f={C.latte} o={k(0.2)}>
        the running job
      </T>
      <rect x={170} y={140} width={250 * st} height={18} rx={2} fill={C.latte} />
      <circle cx={500} cy={104} r={26} fill="none" stroke={C.mocha} strokeWidth={1.4} opacity={k(0.3)} />
      <circle cx={500 + 26 * Math.cos(ang)} cy={104 + 26 * Math.sin(ang)} r={4} fill={C.focus} opacity={k(0.3)} />
      <T x={500} y={150} s={11} f={C.focus} a="middle" o={k(0.3)}>
        operator
      </T>
      {t > 3.0 && (
        <T x={25} y={222} s={12} f={C.crema} o={k(3.0)}>
          reconciled, not a one-off command
        </T>
      )}
    </Svg>
  );
}

// 10 · Upgrade modes. Three lanes, each with a state bar and a restart line. stateless: the bar drops to nothing after the
// restart. last-state: it resumes from the latest checkpoint mark. savepoint: a fresh mark is taken just before, with the
// job's health ticked first.
export function UpgradeModes({ t: t0 }: StepCtx) {
  const t = t0 * 1.43;
  const k = (d: number) => easeOut(seg(t, d, d + 0.35));
  const pre = easeInOut(seg(t, 0.2, 1.0));
  const post = easeInOut(seg(t, 1.4, 2.4));
  const rx = 320;
  return (
    <Svg label="Three upgrade modes carry state across a restart differently: stateless, last state, savepoint" h={250}>
      {['stateless', 'last-state', 'savepoint'].map((m, i) => {
        const y = 40 + i * 62;
        const resume = i === 0 ? 0 : i === 1 ? 120 : 160;
        return (
          <g key={m}>
            <T x={25} y={y + 14} s={12} f={C.crema} o={k(i * 0.1)}>
              {m}
            </T>
            <rect x={130} y={y + 2} width={(rx - 130) * pre} height={16} rx={2} fill={C.latte} />
            <line x1={rx} y1={y - 6} x2={rx} y2={y + 26} stroke={C.second} strokeWidth={1.8} opacity={k(1.0)} />
            {i === 1 && <line x1={250} y1={y - 2} x2={250} y2={y + 22} stroke={C.focus} strokeWidth={2} opacity={k(0.8)} />}
            {i === 2 && <line x1={rx - 6} y1={y - 2} x2={rx - 6} y2={y + 22} stroke={C.focus} strokeWidth={2} opacity={k(1.1)} />}
            <rect
              x={rx + 10}
              y={y + 2}
              width={Math.max(0, (resume + (575 - rx - 10 - resume) * post) * (post > 0 ? 1 : 0))}
              height={16}
              rx={2}
              fill={i === 0 ? C.taupe : C.latte}
              opacity={post > 0 ? 1 : 0}
            />
            {i === 0 && post > 0 && (
              <T x={rx + 14} y={y + 40} s={11} f={C.cherryText} o={k(1.6)}>
                starts from nothing
              </T>
            )}
            {i === 1 && post > 0 && (
              <T x={rx + 14} y={y + 40} s={11} f={C.focus} o={k(1.8)}>
                from the latest checkpoint
              </T>
            )}
            {i === 2 && post > 0 && (
              <T x={rx + 14} y={y + 40} s={11} f={C.focus} o={k(2.0)}>
                fresh point; job must run
              </T>
            )}
          </g>
        );
      })}
    </Svg>
  );
}

// 11 · Predict. The job is unhealthy, red, and savepoint mode wants a fresh point: "?". Once answered, an arrow runs back to
// the last checkpoint mark, ticked; a dashed branch notes that with no checkpoint at all, the upgrade fails.
export function PredictSavepointHealth({ t, answer }: StepCtx) {
  const s = useSinceAnswer(answer !== null);
  const v = answer !== null ? easeOut(seg(s, 0.1, 0.7)) : 0;
  const w = answer !== null ? easeOut(seg(s, 0.8, 1.2)) : 0;
  const k = (d: number) => easeOut(seg(t, d, d + 0.3));
  return (
    <Svg label="The job is unhealthy right now. Does the savepoint upgrade still happen, fall back, or simply fail?" h={250}>
      <rect x={130} y={60} width={300} height={16} rx={2} fill={C.cocoa} stroke={C.cherryText} strokeWidth={1.6} opacity={k(0)} />
      <T x={25} y={73} s={11} f={C.cherryText} o={k(0)}>
        unhealthy job
      </T>
      <line x1={260} y1={50} x2={260} y2={86} stroke={C.focus} strokeWidth={2} opacity={k(0.2)} />
      <T x={260} y={42} s={11} f={C.focus} a="middle" o={k(0.2)}>
        last checkpoint
      </T>
      <Cell x={440} y={54} w={135} label="savepoint mode" o={k(0.4)} />
      {answer === null && t > 0.9 && (
        <T x={300} y={140} s={15} f={C.taupe} a="middle" o={k(0.9)}>
          ?
        </T>
      )}
      <path d={`M450 100 Q 360 ${lerp(100, 130, v)} ${lerp(450, 266, v)} 92`} fill="none" stroke={C.focus} strokeWidth={1.8} opacity={v} />
      <MiniTick x={240} y={104} k={v} />
      {answer !== null && (
        <T x={25} y={160} s={11} f={C.taupe} o={w}>
          no checkpoint at all: only then does it fail
        </T>
      )}
      <Verdict answer={answer} text="it falls back to the last checkpoint" y={206} />
    </Svg>
  );
}

// 12 · Who deletes what. Along a job's timeline Flink drops checkpoint pips and clears the older ones as it goes; when the job
// ends, its checkpoints all fade. The user's savepoint, marked earlier, stays after the end, locked.
export function LifecycleOwnership({ t: t0 }: StepCtx) {
  const t = t0 * 1.55;
  const k = (d: number) => easeOut(seg(t, d, d + 0.35));
  const end = t > 2.4;
  return (
    <Svg label="A checkpoint's lifecycle belongs to Flink and is deleted automatically. A savepoint belongs to the user, kept forever" h={250}>
      <line x1={25} y1={100} x2={lerp(25, 420, easeInOut(seg(t, 0, 2.4)))} y2={100} stroke={C.latte} strokeWidth={2} />
      <T x={25} y={70} s={11} f={C.latte} o={k(0)}>
        the job
      </T>
      {[0, 1, 2, 3, 4, 5].map((i) => {
        const x = 60 + i * 60;
        const born = 0.2 + i * 0.35;
        const live = t > born && (i === 5 || t < born + 0.6) && !end;
        return <Pip key={i} x={x} y={100} s={12} f={C.focus} o={live ? 1 : t > born && !end ? 0.25 : 0} />;
      })}
      <line x1={420} y1={84} x2={420} y2={116} stroke={C.cherryText} strokeWidth={2} opacity={k(2.4)} />
      {end && (
        <T x={430} y={104} s={11} f={C.cherryText} o={k(2.4)}>
          job ends
        </T>
      )}
      <T x={25} y={146} s={11} f={C.focus} o={k(0.4)}>
        checkpoints: Flink makes and deletes them
      </T>
      <Pip x={200} y={180} s={14} f={C.second} o={k(1.2)} />
      <Lock x={545} y={174} k={k(2.8)} />
      <T x={225} y={185} s={11} f={C.second} o={k(1.4)}>
        a savepoint: yours, never auto-deleted
      </T>
    </Svg>
  );
}

// 13 · Checkpoint storage. A pod's local disk holds the live state; checkpoint copies stream to object storage. The pod is
// crossed out, and the object store's copy remains, ticked. The live state was always on the pod's own disk.
export function CheckpointStorage({ t: t0 }: StepCtx) {
  const t = t0 * 1.55;
  const k = (d: number) => easeOut(seg(t, d, d + 0.35));
  const lost = k(2.2);
  return (
    <Svg label="The checkpoint directory is object storage. The live state RocksDB holds still sits on the pod's own disk" h={250}>
      <rect x={25} y={40} width={220} height={140} rx={6} fill="none" stroke={lost > 0.5 ? C.cherryText : C.mocha} strokeWidth={1.5} opacity={k(0) * (1 - 0.5 * lost)} />
      <T x={40} y={62} s={11} f={C.taupe} o={k(0)}>
        the pod
      </T>
      <Cell x={32} y={80} w={205} label="local disk: live state" o={k(0.2) * (1 - 0.5 * lost)} stroke={C.latte} />
      <Cross x={135} y={150} k={lost} />
      <rect x={355} y={40} width={220} height={140} rx={6} fill="none" stroke={C.focus} strokeWidth={1.5} opacity={k(0.4)} />
      <T x={370} y={62} s={11} f={C.focus} o={k(0.4)}>
        object storage
      </T>
      {[0, 1, 2].map((i) => {
        const m = easeInOut(seg(t, 0.6 + i * 0.4, 1.2 + i * 0.4));
        return <Pip key={i} x={lerp(230, 400 + i * 40, m)} y={lerp(94, 120, m)} s={12} f={C.second} o={m > 0 ? 1 : 0} />;
      })}
      <MiniTick x={520} y={150} k={k(2.6)} />
      {t > 3.0 && (
        <T x={25} y={222} s={12} f={C.crema} o={k(3.0)}>
          a copy taken from the disk, not a substitute for it
        </T>
      )}
    </Svg>
  );
}

// 14 · Managed or self-run. Three chores sit in your column: watch the in-sync set, roll brokers safely, pick upgrade modes.
// They slide across into a managed service's column, and a lock-in tag drops onto it.
export function ManagedVsSelfRun({ t: t0 }: StepCtx) {
  const t = t0 * 1.55;
  const k = (d: number) => easeOut(seg(t, d, d + 0.35));
  const chores = ['watch the in-sync set', 'roll brokers safely', 'pick upgrade modes'];
  return (
    <Svg label="Managed Kafka and managed Flink move the rolling, the ISR watch, and the upgrades off your plate" h={250}>
      <T x={25} y={32} s={11} f={C.taupe} o={k(0)}>
        you
      </T>
      <T x={340} y={32} s={11} f={C.taupe} o={k(0)}>
        a managed service
      </T>
      {chores.map((c, i) => {
        const m = easeInOut(seg(t, 1.0 + i * 0.35, 1.6 + i * 0.35));
        return <Cell key={c} x={lerp(25, 340, m)} y={44 + i * 44} w={235} label={c} o={k(0.1 + i * 0.1)} stroke={m > 0.5 ? C.focus : C.mocha} />;
      })}
      <Cell x={340} y={lerp(150, 182, k(2.8))} w={235} label="lock-in" o={k(2.8)} stroke={C.cherryText} f={C.cherryText} />
    </Svg>
  );
}

// 15 · Recap, and a bridge. An executor is crossed out and replaced. A broker and a Flink job take locks: state worth
// keeping. Then everything becomes a document, and a "?" asks who may change it.
export function Recap({ t: t0 }: StepCtx) {
  const t = t0 * 1.65;
  const k = (d: number) => easeOut(seg(t, d, d + 0.35));
  return (
    <Svg label="A broker and a job owned state that took effort to build. The next question is who may change the cluster at all" h={250}>
      <Cell x={25} y={40} w={150} label="executor" o={k(0)} stroke={C.cherryText} />
      <Cross x={100} y={54} k={k(0.3)} />
      <Cell x={25} y={90} w={150} label="a broker" o={k(0.8)} />
      <Lock x={190} y={102} k={k(1.1)} />
      <Cell x={25} y={136} w={150} label="a Flink job" o={k(1.2)} />
      <Lock x={190} y={148} k={k(1.5)} />
      <rect x={330} y={50} width={130} height={120} rx={4} fill="none" stroke={C.latte} strokeWidth={1.5} opacity={k(2.0)} />
      {[0, 1, 2, 3].map((j) => (
        <line key={j} x1={345} y1={78 + j * 22} x2={345 + [90, 70, 100, 60][j] * k(2.2 + j * 0.1)} y2={78 + j * 22} stroke={C.latte} strokeWidth={2} />
      ))}
      <T x={500} y={118} s={15} f={C.taupe} a="middle" o={k(2.8)}>
        ?
      </T>
      {t > 3.0 && (
        <T x={330} y={200} s={11} f={C.taupe} o={k(3.0)}>
          who may change it?
        </T>
      )}
    </Svg>
  );
}
function easeIn2(x: number) {
  return x * x;
}
