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

/** A hash drawn as a deterministic little barcode: the same `n` always gives the same marks. */
function Blob({ x, y, n, o = 1, f = C.latte }: { x: number; y: number; n: number; o?: number; f?: string }) {
  return (
    <g opacity={o}>
      {[0, 1, 2, 3, 4, 5, 6, 7].map((j) => (
        <rect key={j} x={x + j * 12} y={y + 2 + ((n * 7 + j * 3) % 5) * 1.5} width={8} height={12 - ((n * 7 + j * 3) % 5) * 1.5} rx={1} fill={f} />
      ))}
    </g>
  );
}

// Every value here is examples.py's own: the 0.95 and 0.10 thresholds, HMAC's 0 recovered, the quasi-identifier columns and
// the 1950 birth-year floor. The measured recovery and re-identification rates are computed, so they are drawn as lengths.

// 0 · Hook. Known emails run through the same hash; each one's barcode comes out identical to a row of the "anonymous"
// table, and a line snaps across for every match. Then the question lands.
export function Hook({ t }: StepCtx) {
  const k = (d: number) => easeOut(seg(t, d, d + 0.3));
  return (
    <Svg label="hashed, so it's anonymous? ten minutes and a known email list says otherwise" h={250}>
      <T x={400} y={26} s={11} f={C.taupe} o={k(0)}>
        the hashed table
      </T>
      {[0, 1, 2, 3, 4, 5].map((i) => {
        const tr = (i * 4 + 1) % 6;
        return (
          <g key={i}>
            <Blob x={400} y={36 + tr * 28} n={i} o={k(0.1 + tr * 0.05)} />
            <rect x={25} y={40 + i * 28} width={100 + ((i * 29) % 30)} height={8} rx={2} fill={C.crema} opacity={k(1.2 + i * 0.08)} />
            <Req x1={160} x2={190} y={44 + i * 28} k={k(1.6 + i * 0.08)} />
            <Blob x={195} y={36 + i * 28} n={i} o={k(1.9 + i * 0.08)} f={t > 2.6 + i * 0.15 ? C.second : C.latte} />
            <line x1={295} y1={44 + i * 28} x2={lerp(295, 396, k(2.6 + i * 0.15))} y2={lerp(44 + i * 28, 44 + tr * 28, k(2.6 + i * 0.15))} stroke={C.second} strokeWidth={1.4} />
          </g>
        );
      })}
      <T x={25} y={26} s={11} f={C.taupe} o={k(1.2)}>
        emails you already know
      </T>
      {t > 4.0 && (
        <T x={25} y={232} s={12} f={C.cherryText} o={k(4.0)}>
          every one matches back. Anonymous?
        </T>
      )}
    </Svg>
  );
}

// 1 · Still personal for the key holder. A person becomes a pseudonym; the extra piece lives apart, in its own vault. Then the
// key holder's path runs back from pseudonym to person: protected, still personal data.
export function RevealStillPersonalForKeyHolder({ t }: StepCtx) {
  const k = (d: number) => easeOut(seg(t, d, d + 0.35));
  const back = easeInOut(seg(t, 2.6, 3.6));
  return (
    <Svg label="pseudonymised data is still personal data for whoever holds the key or the dictionary" h={250}>
      <Cell x={25} y={50} w={140} label="a person" o={k(0)} stroke={t > 3.6 ? C.second : C.mocha} />
      <Req x1={165} x2={260} y={64} k={k(0.5)} label="pseudonymise" />
      <Cell x={260} y={50} w={140} label="pseudonym" o={k(0.8)} />
      <rect x={430} y={120} width={145} height={60} rx={5} fill={C.cocoa} stroke={C.latte} strokeWidth={1.4} opacity={k(1.4)} />
      <Key x={448} y={150} f={C.second} o={k(1.6)} />
      <T x={476} y={154} s={11} f={C.second} o={k(1.6)}>
        held apart
      </T>
      <path d="M430 150 C 300 150, 160 150, 95 82" fill="none" stroke={C.second} strokeWidth={1.6} strokeDasharray="5 4" opacity={back} />
      {t > 3.6 && (
        <T x={25} y={214} s={12} f={C.crema} o={k(3.6)}>
          protected, not changed: still personal data
        </T>
      )}
      {t > 3.8 && (
        <T x={25} y={236} s={11} f={C.taupe} o={k(3.8)}>
          for whoever holds the extra piece
        </T>
      )}
    </Svg>
  );
}

// 2 · Predict: the dictionary attack. A guessed email goes through the same plain hash; its barcode sits next to the table's.
// Once answered, the two barcodes light together and snap into one: same input, same hash.
export function PredictDictionaryAttack({ t, answer }: StepCtx) {
  const s = useSinceAnswer(answer !== null);
  const k = (d: number) => easeOut(seg(t, d, d + 0.3));
  const a = answer !== null ? easeOut(seg(s, 0.2, 0.8)) : 0;
  return (
    <Svg label="hash a candidate email list with the same plain function used on a pseudonymised table. Recovers most of it?" h={250}>
      <rect x={25} y={60} width={120} height={8} rx={2} fill={C.crema} opacity={k(0)} />
      <T x={25} y={46} s={11} f={C.taupe} o={k(0)}>
        a guessed email
      </T>
      <Req x1={150} x2={200} y={64} k={k(0.4)} />
      <Cell x={200} y={50} w={110} label="plain hash" o={k(0.5)} />
      <Blob x={lerp(330, 430, a)} y={56} n={3} o={k(0.9)} f={a > 0.5 ? C.focus : C.latte} />
      <T x={430} y={140} s={11} f={C.taupe} o={k(1.2)}>
        the table's row
      </T>
      <Blob x={430} y={110} n={3} o={k(1.2)} f={a > 0.5 ? C.focus : C.latte} />
      {answer === null && t > 1.6 && (
        <T x={470} y={92} s={15} f={C.taupe} a="middle" o={k(1.6)}>
          ?
        </T>
      )}
      <Verdict answer={answer} text="deterministic: same email, same hash" y={214} />
    </Svg>
  );
}

// 3 · The dictionary recovers. Candidate after candidate runs through the public hash, and each output lands on a table slot,
// lighting it. The recovered bar grows past the dashed 0.95 line.
export function RevealDictionaryRecovers({ t }: StepCtx) {
  const k = (d: number) => easeOut(seg(t, d, d + 0.3));
  const g = easeInOut(seg(t, 1.4, 3.6));
  return (
    <Svg label="measured: the dictionary attack recovers the large majority of the table" h={250}>
      {[0, 1, 2, 3, 4, 5].map((i) => (
        <g key={i}>
          <rect x={25} y={36 + i * 22} width={90 + ((i * 23) % 30)} height={7} rx={2} fill={C.crema} opacity={k(0.2 + i * 0.05)} />
          <Fan x1={150} y1={40 + i * 22} x2={198} y2={96} k={k(0.6 + i * 0.05)} f={C.mocha} />
        </g>
      ))}
      <Cell x={200} y={82} w={120} label="SHA-256" o={k(0.5)} />
      {t > 0.8 && (
        <T x={200} y={130} s={11} f={C.taupe} o={k(0.8)}>
          public, deterministic
        </T>
      )}
      {Array.from({ length: 40 }, (_, n) => (
        <rect key={n} x={360 + (n % 10) * 21} y={40 + Math.floor(n / 10) * 26} width={16} height={18} rx={2} fill={n / 40 < g ? C.second : C.cocoa} stroke={C.mocha} strokeWidth={1} opacity={k(0.3)} />
      ))}
      <Fan x1={320} y1={96} x2={356} y2={lerp(49, 127, (g * 40) % 1)} k={g > 0 && g < 1 ? 1 : 0} f={C.second} />
      <T x={25} y={200} s={11} f={C.latte} o={k(1.2)}>
        recovered
      </T>
      <rect x={120} y={188} width={Math.max(0, 420 * g)} height={16} rx={2} fill={C.cherryText} />
      <line x1={120 + 420 * 0.95} y1={180} x2={120 + 420 * 0.95} y2={212} stroke={C.taupe} strokeWidth={1.2} strokeDasharray="3 3" opacity={k(1.2)} />
      <T x={120 + 420 * 0.95} y={232} s={11} f={C.taupe} a="middle" o={k(1.2)}>
        0.95
      </T>
    </Svg>
  );
}

// 4 · HMAC needs the secret. The table's slots are locked with a key the attacker never has. The same candidates run through
// HMAC with no key; every output misses, crossed, and the recovered bar stays at 0.
export function ElaborateHMACNeedsSecret({ t }: StepCtx) {
  const k = (d: number) => easeOut(seg(t, d, d + 0.3));
  return (
    <Svg label="a keyed hash needs a secret the attacker never has; the same attack recovers nothing" h={250}>
      <Cell x={200} y={82} w={120} label="HMAC" o={k(0)} stroke={C.second} />
      <Key x={420} y={34} f={C.second} o={k(0.4)} />
      <T x={448} y={38} s={11} f={C.second} o={k(0.4)}>
        the secret
      </T>
      {Array.from({ length: 40 }, (_, n) => (
        <rect key={n} x={360 + (n % 10) * 21} y={54 + Math.floor(n / 10) * 22} width={16} height={14} rx={2} fill={C.cocoa} stroke={t > 0.8 ? C.second : C.mocha} strokeWidth={1} opacity={k(0.2)} />
      ))}
      {[0, 1, 2, 3, 4, 5].map((i) => (
        <g key={i}>
          <rect x={25} y={36 + i * 22} width={90 + ((i * 23) % 30)} height={7} rx={2} fill={C.crema} opacity={k(1.4 + i * 0.05)} />
          <Fan x1={150} y1={40 + i * 22} x2={198} y2={96} k={k(1.8 + i * 0.05)} f={C.mocha} />
        </g>
      ))}
      <Key x={170} y={170} f={C.taupe} o={k(1.6)} />
      <Cross x={178} y={170} k={k(1.9)} />
      {t > 1.9 && (
        <T x={200} y={174} s={11} f={C.taupe} o={k(1.9)}>
          attacker: no key
        </T>
      )}
      {[0, 1, 2].map((i) => (
        <g key={i}>
          <Fan x1={320} y1={96} x2={340} y2={150 + i * 20} k={k(2.6 + i * 0.25)} f={C.cherryText} />
          <Cross x={348} y={150 + i * 20} k={k(2.8 + i * 0.25)} />
        </g>
      ))}
      <T x={25} y={226} s={11} f={C.latte} o={k(3.4)}>
        recovered
      </T>
      {t > 3.8 && (
        <T x={120} y={226} s={12} f={C.focus} o={k(3.8)}>
          0, measured
        </T>
      )}
    </Svg>
  );
}

const QI = ['postcode', 'birth year', 'category'];

// 5 · Predict: the linkage attack. The release has no names, only three detail columns; the outside list has the same columns
// plus a name. Once answered, the matching rows join across and a name arrives beside the release row.
export function PredictLinkageAttack({ t, answer }: StepCtx) {
  const s = useSinceAnswer(answer !== null);
  const k = (d: number) => easeOut(seg(t, d, d + 0.3));
  const a = answer !== null ? easeOut(seg(s, 0.2, 0.8)) : 0;
  return (
    <Svg label="no names, just quasi-identifiers, joined to an outside list that has names. Anyone re-identified?" h={250}>
      <T x={25} y={30} s={11} f={C.taupe} o={k(0)}>
        the release
      </T>
      <T x={330} y={30} s={11} f={C.taupe} o={k(0.6)}>
        an outside list
      </T>
      {QI.map((n, i) => (
        <g key={n}>
          <Cell x={25} y={42 + i * 34} w={120} label={n} o={k(0.1 + i * 0.1)} stroke={a > 0.5 ? C.second : C.mocha} />
          <Cell x={330} y={42 + i * 34} w={120} label={n} o={k(0.6 + i * 0.1)} stroke={a > 0.5 ? C.second : C.mocha} />
          <line x1={145} y1={56 + i * 34} x2={lerp(145, 330, a)} y2={56 + i * 34} stroke={C.second} strokeWidth={1.4} strokeDasharray="4 3" />
        </g>
      ))}
      <Cell x={465} y={76} w={110} label="name" o={k(0.8)} />
      {answer === null && t > 1.2 && (
        <T x={237} y={100} s={15} f={C.taupe} a="middle" o={k(1.2)}>
          ?
        </T>
      )}
      <Verdict answer={answer} text="together, unique enough to name someone" y={214} />
    </Svg>
  );
}

// 6 · The linkage re-identifies. Release rows on the left, the outside list's rows shuffled on the right; lines join every row
// whose details are unique, while the shared ones stay unjoined. The re-identified bar grows well past the dashed 0.10 line.
export function RevealLinkageReidentifies({ t }: StepCtx) {
  const k = (d: number) => easeOut(seg(t, d, d + 0.3));
  const g = easeInOut(seg(t, 1.2, 3.2));
  const order = [3, 7, 0, 9, 5, 1, 8, 2, 6, 4];
  const unique = [true, true, false, true, true, true, false, true, true, true];
  return (
    <Svg label="measured: a real, measurable fraction gets re-identified, key never compromised" h={250}>
      {order.map((r, i) => (
        <g key={i}>
          <rect x={25} y={34 + i * 15} width={150} height={9} rx={2} fill={C.latte} opacity={k(0.1 + i * 0.03)} />
          <rect x={400} y={34 + r * 15} width={150} height={9} rx={2} fill={C.latte} opacity={k(0.4 + i * 0.03)} />
          {unique[i] && i / 10 < g && <line x1={180} y1={38 + i * 15} x2={396} y2={38 + r * 15} stroke={C.second} strokeWidth={1.2} />}
        </g>
      ))}
      <rect x={25} y={196} width={Math.max(0, 400 * 0.752 * g)} height={14} rx={2} fill={C.cherryText} />
      <line x1={65} y1={190} x2={65} y2={214} stroke={C.taupe} strokeWidth={1.2} strokeDasharray="3 3" opacity={k(1.0)} />
      <T x={65} y={186} s={11} f={C.taupe} a="middle" o={k(1.0)}>
        0.10
      </T>
      <T x={440} y={208} s={11} f={C.latte} o={k(1.0)}>
        re-identified
      </T>
      {t > 3.6 && (
        <T x={25} y={238} s={11} f={C.focus} o={k(3.6)}>
          no key cracked, no dictionary run
        </T>
      )}
    </Svg>
  );
}

// 7 · Relative identifiability. One pseudonymised file. The controller holds the extra piece: personal data. The recipient,
// with no realistic means to get it: not personal data. Same file, two verdicts.
export function ElaborateRelativeIdentifiability({ t }: StepCtx) {
  const k = (d: number) => easeOut(seg(t, d, d + 0.35));
  return (
    <Svg label="EDPS v SRB: pseudonymised data isn't personal data in all cases, for every person" h={250}>
      <Cell x={205} y={36} w={190} label="pseudonymised file" o={k(0)} />
      <Fan x1={260} y1={64} x2={110} y2={124} k={k(1.0)} f={C.latte} />
      <Fan x1={340} y1={64} x2={490} y2={124} k={k(1.0)} f={C.latte} />
      <Cell x={25} y={126} w={170} label="controller" o={k(1.2)} />
      <Key x={206} y={140} f={C.second} o={k(1.6)} />
      <Cell x={405} y={126} w={170} label="recipient" o={k(1.4)} />
      <Key x={386} y={140} f={C.taupe} o={k(2.2) * 0.6} />
      <Cross x={394} y={140} k={k(2.4)} />
      <Cell x={25} y={186} w={170} label="personal data" o={k(3.0)} stroke={C.second} />
      <Cell x={405} y={186} w={170} label="not personal data" o={k(3.6)} stroke={C.focus} />
      {t > 4.0 && (
        <T x={300} y={240} s={11} f={C.taupe} a="middle" o={k(4.0)}>
          same file, judged by each party's means
        </T>
      )}
    </Svg>
  );
}

// 8 · The Omnibus, pending. The law today sits on the right. A dashed proposal slides toward it carrying the relative
// definition and a later act, and stops short of merging; the two regulators push back against it.
export function RevealDigitalOmnibusPending({ t }: StepCtx) {
  const k = (d: number) => easeOut(seg(t, d, d + 0.35));
  const mv = easeInOut(seg(t, 0.8, 2.2));
  const x = lerp(25, 150, mv);
  return (
    <Svg label="the Digital Omnibus would write this relative approach into law -- not yet adopted" h={250}>
      <rect x={360} y={36} width={215} height={110} rx={5} fill={C.cocoa} stroke={C.latte} strokeWidth={1.4} opacity={k(0)} />
      <T x={374} y={58} s={11} f={C.crema} o={k(0)}>
        the law today
      </T>
      {[0, 1, 2].map((i) => (
        <rect key={i} x={374} y={76 + i * 20} width={150 - i * 30} height={6} rx={2} fill={C.latte} opacity={k(0.2) * 0.7} />
      ))}
      <rect x={x} y={50} width={180} height={82} rx={5} fill="none" stroke={C.second} strokeWidth={1.4} strokeDasharray="5 4" opacity={k(0.4)} />
      <T x={x + 12} y={72} s={11} f={C.second} o={k(0.4)}>
        proposal
      </T>
      <T x={x + 12} y={96} s={11} f={C.crema} o={k(1.2)}>
        a relative definition
      </T>
      <T x={x + 12} y={118} s={11} f={C.taupe} o={k(1.8)}>
        details by later act
      </T>
      {t > 2.6 && (
        <T x={150} y={156} s={11} f={C.cherryText} o={k(2.6)}>
          not yet adopted
        </T>
      )}
      {['EDPB', 'EDPS'].map((n, i) => (
        <g key={n}>
          <Cell x={370 + i * 110} y={190} w={90} label={n} o={k(3.2 + i * 0.2)} stroke={C.cherryText} />
          <Fan x1={400 + i * 110} y1={190} x2={300 + i * 10} y2={140} k={k(3.6 + i * 0.2)} f={C.cherryText} />
        </g>
      ))}
      {t > 4.0 && (
        <T x={25} y={208} s={11} f={C.cherryText} o={k(4.0)}>
          urged against it
        </T>
      )}
    </Svg>
  );
}

// 9 · Recap. A plain hash falls, crossed; a keyed hash holds, ticked; quasi-identifiers still re-identify, crossed. Last, the
// rule underneath all three.
export function Recap({ t }: StepCtx) {
  const k = (d: number) => easeOut(seg(t, d, d + 0.35));
  const rows: [string, boolean][] = [
    ['a plain hash: a dictionary waiting', false],
    ['a keyed hash: the attack comes back empty', true],
    ['no names: the details can still betray', false],
  ];
  return (
    <Svg label="plain hash falls to dictionaries, HMAC holds, quasi-identifiers still re-identify" h={250}>
      {rows.map(([n, ok], i) => (
        <g key={n}>
          {ok ? <MiniTick x={25} y={44 + i * 44} k={k(0.6 + i * 0.9)} /> : <Cross x={32} y={46 + i * 44} k={k(0.6 + i * 0.9)} />}
          <T x={55} y={50 + i * 44} s={12} f={C.crema} o={k(0.5 + i * 0.9)}>
            {n}
          </T>
        </g>
      ))}
      {t > 3.6 && (
        <T x={25} y={200} s={12} f={C.focus} o={k(3.6)}>
          anonymous is about what someone can still do
        </T>
      )}
    </Svg>
  );
}
