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

/** A small key glyph: a ring at (x, y) and a shaft with one tooth to the right. */
function Key({ x, y, f = C.second, o = 1 }: { x: number; y: number; f?: string; o?: number }) {
  return (
    <g opacity={o}>
      <circle cx={x} cy={y} r={5} fill="none" stroke={f} strokeWidth={2} />
      <path d={`M${x + 5} ${y} h14 m-4 0 v5 m-4 -5 v4`} fill="none" stroke={f} strokeWidth={2} />
    </g>
  );
}

// Every value here is examples.py's own: the stand-in DEK 123456789 and kek-1, the 50 blocks a rotation leaves at 0
// re-encryptions and a leak forces to all 50, the four models' control and risk scores (1 to 4), and the 10 customers of
// 5 blocks each with customer 3's key destroyed.

// 0 · Hook. A log scrolls in, line by line. One line carries the data key in the clear; it lights red and a red key lifts out
// of it. Then the reassurance arrives underneath, quoted.
export function Hook({ t }: StepCtx) {
  const k = (d: number) => easeOut(seg(t, d, d + 0.3));
  return (
    <Svg label="a data key, leaked. Yearly rotation, they say." h={250}>
      {[0, 1, 2, 3, 4].map((i) => {
        const y = 36 + i * 26;
        return i === 2 ? (
          <g key={i} opacity={k(i * 0.25)}>
            <rect x={25} y={y - 6} width={360} height={22} rx={3} fill="none" stroke={t > 1.4 ? C.cherryText : C.mocha} strokeWidth={1.3} />
            <T x={35} y={y + 9} s={11} f={t > 1.4 ? C.cherryText : C.latte}>
              INFO export ok dek=123456789
            </T>
          </g>
        ) : (
          <rect key={i} x={35} y={y + 2} width={200 + ((i * 37) % 120)} height={6} rx={2} fill={C.latte} opacity={k(i * 0.25) * 0.7} />
        );
      })}
      <Key x={lerp(300, 470, easeOut(seg(t, 1.6, 2.4)))} y={lerp(88, 70, easeOut(seg(t, 1.6, 2.4)))} f={C.cherryText} o={k(1.6)} />
      {t > 2.4 && (
        <T x={455} y={100} s={11} f={C.cherryText} o={k(2.4)}>
          leaked
        </T>
      )}
      {t > 3.0 && (
        <T x={25} y={210} s={12} f={C.taupe} o={k(3.0)}>
          “we rotate our keys every year, so this is fine”
        </T>
      )}
    </Svg>
  );
}

const OPS = ['rotate', 're-encrypt', 'delete key'];

// 1 · Predict. Two requests on the left, a leaked key and an erasure, three operations on the right. Once answered, the leak
// wires to re-encrypt, the erasure to delete key, and rotate is crossed.
export function Predict({ t, answer }: StepCtx) {
  const s = useSinceAnswer(answer !== null);
  const k = (d: number) => easeOut(seg(t, d, d + 0.3));
  const a = answer !== null ? easeOut(seg(s, 0.1, 0.6)) : 0;
  const b = answer !== null ? easeOut(seg(s, 0.5, 1.0)) : 0;
  return (
    <Svg label="one leak, one erasure request." h={250}>
      <Cell x={25} y={50} w={180} label="a leaked key" o={k(0.2)} stroke={C.cherryText} />
      <Cell x={25} y={130} w={180} label="erase one customer" o={k(1.4)} />
      {OPS.map((n, i) => (
        <Cell
          key={n}
          x={370}
          y={30 + i * 60}
          w={150}
          label={n}
          o={k(2.6 + i * 0.2)}
          stroke={(i === 1 && a > 0.5) || (i === 2 && b > 0.5) ? C.focus : C.mocha}
          f={i === 0 && a > 0.5 ? C.taupe : C.crema}
        />
      ))}
      {answer === null && t > 3.4 && (
        <T x={287} y={110} s={15} f={C.taupe} a="middle" o={k(3.4)}>
          ?
        </T>
      )}
      <Fan x1={205} y1={64} x2={368} y2={104} k={a} f={C.focus} />
      <Fan x1={205} y1={144} x2={368} y2={164} k={b} f={C.focus} />
      <Cross x={540} y={44} k={a} />
      <Verdict answer={answer} text="re-encrypt for the leak; delete a key to erase" y={228} />
    </Svg>
  );
}

// 2 · The hierarchy. Storage holds the data blocks; the DEK locks them in place, locally. The KMS appears with its KEK. The DEK
// travels up, comes back wrapped with a lock on it; the blocks never move.
export function RevealHierarchy({ t }: StepCtx) {
  const k = (d: number) => easeOut(seg(t, d, d + 0.35));
  const go = easeInOut(seg(t, 3.0, 3.6));
  const back = easeInOut(seg(t, 3.8, 4.4));
  const p = go - back;
  return (
    <Svg label="the KMS wraps a key. Never the data." h={250}>
      <T x={25} y={30} s={11} f={C.taupe} o={k(0)}>
        storage, local
      </T>
      <rect x={25} y={40} width={250} height={180} rx={5} fill="none" stroke={C.mocha} strokeWidth={1.4} opacity={k(0)} />
      {[0, 1, 2, 3, 4, 5].map((i) => (
        <rect
          key={i}
          x={40 + (i % 3) * 56}
          y={56 + Math.floor(i / 3) * 56}
          width={44}
          height={40}
          rx={3}
          fill={t > 1.2 + i * 0.12 ? C.second : C.cocoa}
          stroke={C.latte}
          strokeWidth={1.2}
          opacity={k(0.2 + i * 0.05)}
        />
      ))}
      <Key x={lerp(60, 430, p)} y={lerp(190, 98, p)} f={C.focus} o={k(0.9)} />
      <Lock x={lerp(80, 450, p) + 2} y={lerp(186, 94, p) + 14} k={back > 0.3 ? 1 : 0} />
      {t > 1.0 && (
        <T x={100} y={194} s={11} f={C.focus} o={k(1.0) * (1 - k(2.9))}>
          DEK
        </T>
      )}
      <T x={360} y={30} s={11} f={C.taupe} o={k(2.2)}>
        KMS
      </T>
      <rect x={360} y={40} width={215} height={100} rx={5} fill={C.cocoa} stroke={C.latte} strokeWidth={1.4} opacity={k(2.2)} />
      <Key x={380} y={64} f={C.second} o={k(2.4)} />
      <T x={410} y={68} s={11} f={C.second} o={k(2.4)}>
        KEK, kek-1
      </T>
      {t > 4.4 && (
        <T x={360} y={170} s={11} f={C.focus} o={k(4.4)}>
          a key, never the data
        </T>
      )}
    </Svg>
  );
}

// 3 · Rotation versus compromise. Top: the KEK spins forward and three DEKs re-wrap under it, while the 50 blocks stay grey:
// 0 touched. Bottom: a DEK leaks; the KEK spins again and the key stays red. A fresh key sweeps every block, all 50.
export function RevealRotationVsCompromise({ t }: StepCtx) {
  const k = (d: number) => easeOut(seg(t, d, d + 0.3));
  const sweep = clamp((t - 3.6) / 1.4);
  const grid = (y: number, f: (n: number) => string, o: number) => {
    const out = [];
    for (let n = 0; n < 50; n++) out.push(<rect key={n} x={330 + (n % 10) * 24} y={y + Math.floor(n / 10) * 14} width={16} height={9} rx={2} fill={f(n)} opacity={o} />);
    return out;
  };
  const spin = (d: number) => `rotate(${(360 * easeInOut(seg(t, d, d + 0.6))).toFixed(1)} 40 0)`;
  return (
    <Svg label="rotation: zero blocks. A leak: every block." h={250}>
      <g transform={`translate(0 52) ${spin(0.4)}`}>
        <Key x={34} y={0} f={C.second} o={k(0)} />
      </g>
      <T x={70} y={40} s={11} f={C.crema} o={k(0)}>
        rotate the KEK
      </T>
      {[0, 1, 2].map((i) => (
        <g key={i}>
          <Key x={90 + i * 50} y={76} f={C.focus} o={k(0.6)} />
          <Lock x={104 + i * 50} y={88} k={easeOut(seg(t, 1.0 + i * 0.15, 1.3 + i * 0.15))} />
        </g>
      ))}
      {grid(38, () => C.mocha, k(0.2))}
      {t > 1.8 && (
        <T x={25} y={118} s={11} f={C.focus} o={k(1.8)}>
          re-wrapped; 0 blocks touched
        </T>
      )}
      <Key x={40} y={170} f={C.cherryText} o={k(2.4)} />
      <T x={70} y={174} s={11} f={C.cherryText} o={k(2.4)}>
        a DEK leaks
      </T>
      <g transform={`translate(0 200) ${spin(2.8)}`}>
        <Key x={34} y={0} f={C.second} o={k(2.8)} />
      </g>
      {t > 3.0 && (
        <T x={70} y={204} s={11} f={C.taupe} o={k(3.0)}>
          rotation: no help
        </T>
      )}
      {grid(150, (n) => (n / 50 < sweep ? C.focus : C.cherryText), k(2.4))}
      {t > 4.6 && (
        <T x={330} y={236} s={11} f={C.focus} o={k(4.6)}>
          fresh key: all 50 re-encrypted
        </T>
      )}
    </Svg>
  );
}

const MODELS: [string, number, number][] = [
  ['provider', 1, 1],
  ['customer', 2, 1],
  ['BYOK', 3, 2],
  ['external', 4, 4],
];

// 4 · The control scale. Four key models left to right, each growing a control bar and an availability-risk bar from
// examples.py's scores. The last one's risk bar pulses: its outage is now yours.
export function RevealControlScale({ t }: StepCtx) {
  const k = (d: number) => easeOut(seg(t, d, d + 0.35));
  return (
    <Svg label="more control, more availability risk." h={250}>
      <rect x={200} y={24} width={10} height={10} rx={2} fill={C.second} opacity={k(0)} />
      <T x={216} y={33} s={11} f={C.latte} o={k(0)}>
        control
      </T>
      <rect x={300} y={24} width={10} height={10} rx={2} fill={C.cherryText} opacity={k(0)} />
      <T x={316} y={33} s={11} f={C.latte} o={k(0)}>
        availability risk
      </T>
      {MODELS.map(([n, c, r], i) => {
        const x = 50 + i * 135;
        const g = easeOut(seg(t, 0.4 + i * 0.8, 1.0 + i * 0.8));
        const pulse = i === 3 && t > 4.0 ? 0.7 + 0.3 * Math.cos((t - 4.0) * 8) : 1;
        return (
          <g key={n}>
            <rect x={x} y={190 - c * 30 * g} width={30} height={Math.max(0, c * 30 * g)} rx={2} fill={C.second} />
            <rect x={x + 36} y={190 - r * 30 * g} width={30} height={Math.max(0, r * 30 * g)} rx={2} fill={C.cherryText} opacity={pulse} />
            <T x={x + 33} y={212} s={11} f={C.crema} a="middle" o={k(0.3 + i * 0.8)}>
              {n}
            </T>
          </g>
        );
      })}
      <line x1={40} y1={190} x2={560} y2={190} stroke={C.mocha} strokeWidth={1.2} opacity={k(0.2)} />
      {t > 4.2 && (
        <T x={575} y={238} s={11} f={C.cherryText} a="end" o={k(4.2)}>
          its outage is your outage
        </T>
      )}
    </Svg>
  );
}

// 5 · TLS and mTLS. Two peers and a channel between them, packets flowing through it; both ends are proven, ticked. Then the
// data is written to a disk below one peer, and the channel's protection stops at the peer: the disk sits outside, dashed.
export function RevealTlsMtls({ t }: StepCtx) {
  const k = (d: number) => easeOut(seg(t, d, d + 0.35));
  return (
    <Svg label="a secure channel. Nothing about the disk." h={250}>
      <Cell x={25} y={60} w={110} label="peer A" o={k(0)} />
      <Cell x={465} y={60} w={110} label="peer B" o={k(0.1)} />
      <line x1={135} y1={66} x2={135 + 330 * k(0.5)} y2={66} stroke={C.second} strokeWidth={1.4} />
      <line x1={135} y1={82} x2={135 + 330 * k(0.5)} y2={82} stroke={C.second} strokeWidth={1.4} />
      <Lock x={292} y={60} k={k(0.9)} />
      {t > 1.0 && [0, 1, 2].map((j) => <Pip key={j} x={150 + (((((t - 1.0) * 160 + j * 110) % 300) + 300) % 300)} y={74} f={C.crema} s={7} o={k(1.0)} />)}
      <MiniTick x={74} y={44} k={k(1.8)} />
      <MiniTick x={514} y={44} k={k(2.0)} />
      {t > 2.0 && (
        <T x={300} y={110} s={11} f={C.second} a="middle" o={k(2.0)}>
          a secure channel, two peers
        </T>
      )}
      <line x1={520} y1={88} x2={520} y2={88 + 70 * k(3.0)} stroke={C.latte} strokeWidth={1.4} />
      <Cell x={465} y={160} w={110} label="disk" o={k(3.3)} />
      <Hole x={459} y={154} w={122} h={40} o={k(3.7)} stroke={C.cherryText} />
      {t > 3.8 && (
        <T x={25} y={180} s={11} f={C.cherryText} o={k(3.8)}>
          written down: outside the channel
        </T>
      )}
    </Svg>
  );
}

const ICE = ['data', 'deletes', 'manifests'];

// 6 · Down to the file. Top: Iceberg's three file kinds each take a lock before the arrow on to storage. Bottom: a Parquet file
// with three columns, each column's key wired up into one master key: the same envelope, one layer down.
export function RevealClientServerSide({ t }: StepCtx) {
  const k = (d: number) => easeOut(seg(t, d, d + 0.35));
  return (
    <Svg label="the same wrap-a-key shape, at the file." h={250}>
      <T x={25} y={60} s={12} f={C.crema} o={k(0.2)}>
        Iceberg
      </T>
      {ICE.map((n, i) => (
        <g key={n}>
          <Cell x={110 + i * 112} y={42} w={100} label={n} o={k(0.6 + i * 0.15)} stroke={t > 1.2 + i * 0.2 ? C.second : C.mocha} />
          <Lock x={152 + i * 112} y={34} k={k(1.2 + i * 0.2)} />
        </g>
      ))}
      <Req x1={446} x2={470} y={56} k={k(1.9)} />
      <Cell x={470} y={42} w={105} label="storage" o={k(2.0)} />
      <T x={25} y={164} s={12} f={C.crema} o={k(2.6)}>
        Parquet
      </T>
      <rect x={110} y={118} width={210} height={96} rx={4} fill="none" stroke={C.latte} strokeWidth={1.4} opacity={k(2.6)} />
      {[0, 1, 2].map((i) => (
        <g key={i}>
          <rect x={122 + i * 66} y={150} width={54} height={56} rx={2} fill={C.cocoa} stroke={C.mocha} strokeWidth={1.2} opacity={k(2.8 + i * 0.1)} />
          <Key x={136 + i * 66} y={134} f={C.focus} o={k(3.1 + i * 0.15)} />
          <Fan x1={156 + i * 66} y1={134} x2={428} y2={166} k={k(3.6 + i * 0.1)} f={C.second} />
        </g>
      ))}
      <Key x={436} y={166} f={C.second} o={k(3.8)} />
      {t > 3.9 && (
        <T x={420} y={196} s={11} f={C.second} o={k(3.9)}>
          master key
        </T>
      )}
      {t > 4.4 && (
        <T x={25} y={240} s={11} f={C.taupe} o={k(4.4)}>
          the same envelope shape, one layer further down
        </T>
      )}
    </Svg>
  );
}

// 7 · Crypto-shredding. Ten customers, each with a key and five blocks, in the primary and in a backup. Customer 3's key is
// destroyed: its five blocks go unreadable in both copies at once, and every other row stays intact.
export function RevealCryptoShredding({ t }: StepCtx) {
  const k = (d: number) => easeOut(seg(t, d, d + 0.3));
  const gone = t > 2.0;
  const shred = easeOut(seg(t, 2.0, 2.6));
  return (
    <Svg label="one key, destroyed. Everything under it, gone." h={250}>
      <T x={90} y={24} s={11} f={C.taupe} o={k(0)}>
        primary
      </T>
      <T x={230} y={24} s={11} f={C.taupe} o={k(0.2)}>
        backup
      </T>
      {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((c) => {
        const y = 34 + c * 20;
        const me = c === 3;
        return (
          <g key={c}>
            <Key x={36} y={y + 5} f={me ? (gone ? C.cherryText : C.focus) : C.second} o={k(c * 0.05) * (me ? 1 - 0.7 * shred : 1)} />
            {me && <Cross x={42} y={y + 5} k={shred} />}
            {[0, 1, 2, 3, 4].map((b) => (
              <g key={b}>
                <rect x={90 + b * 22} y={y} width={16} height={11} rx={2} fill={me && gone ? C.cherryText : C.latte} opacity={k(0.1 + c * 0.04) * (me ? 1 - 0.5 * shred : 0.8)} />
                <rect x={230 + b * 22} y={y} width={16} height={11} rx={2} fill={me && gone ? C.cherryText : C.latte} opacity={k(0.4 + c * 0.04) * (me ? 1 - 0.5 * shred : 0.8)} />
              </g>
            ))}
          </g>
        );
      })}
      {t > 1.2 && (
        <T x={370} y={80} s={11} f={C.focus} o={k(1.2)}>
          customer 3's key
        </T>
      )}
      {t > 2.4 && (
        <T x={370} y={110} s={11} f={C.cherryText} o={k(2.4)}>
          unreadable, everywhere
        </T>
      )}
      {t > 3.0 && (
        <T x={370} y={140} s={11} f={C.focus} o={k(3.0)}>
          every other row intact
        </T>
      )}
      {t > 3.8 && (
        <T x={370} y={180} s={11} f={C.crema} o={k(3.8)}>
          the erasure reaches
        </T>
      )}
      {t > 3.8 && (
        <T x={370} y={200} s={11} f={C.crema} o={k(3.9)}>
          exactly the key's reach
        </T>
      )}
    </Svg>
  );
}

const RECAP = [
  'a DEK does the work; a KEK wraps it',
  'rotation re-wraps; a leak needs re-encryption',
  'more control, more availability risk',
  'TLS guards the wire, not the disk',
  'deleting a key erases what it protected',
];

// 8 · Recap. The five rules land in order, each ticked.
export function Recap({ t }: StepCtx) {
  const k = (d: number) => easeOut(seg(t, d, d + 0.35));
  return (
    <Svg label="wrap, rotate, control, wire vs. disk, delete." h={250}>
      {RECAP.map((n, i) => (
        <g key={n}>
          <MiniTick x={25} y={40 + i * 42} k={k(0.4 + i * 0.95)} />
          <T x={50} y={46 + i * 42} s={12} f={C.crema} o={k(0.3 + i * 0.95)}>
            {n}
          </T>
        </g>
      ))}
    </Svg>
  );
}

// 9 · Prove it. The KEK spins forward twice, a pip for each rotation. Below it, the leaked DEK stays red, its lines still
// reaching every block. Once answered, those blocks flash red: still exposed.
export function ProveIt({ t, answer }: StepCtx) {
  const s = useSinceAnswer(answer !== null);
  const k = (d: number) => easeOut(seg(t, d, d + 0.3));
  const a = answer !== null ? easeOut(seg(s, 0.2, 0.7)) : 0;
  const rot = (360 * (easeInOut(seg(t, 0.6, 1.2)) + easeInOut(seg(t, 1.6, 2.2)))).toFixed(1);
  return (
    <Svg label="rotated twice since the leak. Still exposed?" h={250}>
      <g transform={`rotate(${rot} 300 50)`}>
        <Key x={292} y={50} f={C.second} o={k(0)} />
      </g>
      <T x={330} y={54} s={11} f={C.second} o={k(0)}>
        KEK
      </T>
      <Pip x={380} y={50} f={C.second} o={k(1.2)} s={8} />
      <Pip x={396} y={50} f={C.second} o={k(2.2)} s={8} />
      <line x1={300} y1={60} x2={300} y2={108} stroke={C.mocha} strokeWidth={1.2} opacity={k(0.2)} />
      <Key x={292} y={120} f={C.cherryText} o={k(0.3)} />
      <T x={330} y={124} s={11} f={C.cherryText} o={k(0.3)}>
        the leaked DEK
      </T>
      {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
        <g key={i}>
          <line x1={300} y1={130} x2={95 + i * 60} y2={170} stroke={a > 0.5 ? C.cherryText : C.mocha} strokeWidth={1} opacity={k(2.6)} />
          <rect x={80 + i * 60} y={170} width={30} height={20} rx={2} fill={a > 0.5 ? C.cherryText : C.latte} opacity={k(2.6 + i * 0.05) * 0.85} />
        </g>
      ))}
      <Verdict answer={answer} text="still exposed: re-encrypt under a fresh key" y={228} />
    </Svg>
  );
}
