import { useEffect, useState } from 'react';
import type { StepCtx } from '../../../../../reels/types';
import { clamp, easeInOut, easeOut, easeOutBack, lerp, seg } from '../../../../../reels/anim';
import { C, Decode, Draw, Reticle, Svg, T } from '../../../../../reels/kit';

// Colour grammar (CHAPTER.md): caramel = the mechanism in focus (the builder, byte indexing);
// cinnamon = the compared alternative (the naive loop, code-point indexing); cherryText = the one
// failure/discard; taupe/latte = axes, quiet labels; crema = records/bytes. Every printed number is
// asserted in examples.py; the benchmark is drawn as shape only (its timings are machine-dependent).

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

/** A plain cell. */
function Box({ x, y, w, h = 24, f = C.crema, o = 1, fill = C.cocoa, dash, sw = 1.4 }: { x: number; y: number; w: number; h?: number; f?: string; o?: number; fill?: string; dash?: string; sw?: number }) {
  return <rect x={x} y={y} width={w} height={h} rx={3} fill={fill} stroke={f} strokeWidth={sw} strokeDasharray={dash} opacity={o} />;
}

/** A short arrow that draws itself. */
function Arrow({ a, b, t, from, to, f = C.latte, w = 1.6 }: { a: [number, number]; b: [number, number]; t: number; from: number; to: number; f?: string; w?: number }) {
  const k = easeInOut(seg(t, from, to));
  if (k <= 0) return null;
  const tip = [lerp(a[0], b[0], k), lerp(a[1], b[1], k)];
  const ang = Math.atan2(b[1] - a[1], b[0] - a[0]);
  const h = (da: number) => `${tip[0] - 7 * Math.cos(ang + da)} ${tip[1] - 7 * Math.sin(ang + da)}`;
  return (
    <g>
      <line x1={a[0]} y1={a[1]} x2={tip[0]} y2={tip[1]} stroke={f} strokeWidth={w} />
      <path d={`M${tip[0]} ${tip[1]} L${h(0.45)} M${tip[0]} ${tip[1]} L${h(-0.45)}`} stroke={f} strokeWidth={w} fill="none" />
    </g>
  );
}

// The byte widths of the code points U+0041, U+00E9, U+65E5, U+1F600 (examples.py: 1, 2, 3, 4 bytes).
const CP = [
  { name: 'U+0041', bytes: 1 },
  { name: 'U+00E9', bytes: 2 },
  { name: 'U+65E5', bytes: 3 },
  { name: 'U+1F600', bytes: 4 },
];
const BW = 22; // one byte cell

/** Byte cells for a run of code points (byte widths `ws`), grouped with a bracket per code point. */
function ByteRow({ ws, x0, y, o = 1, hi = -1, k = 1 }: { ws: number[]; x0: number; y: number; o?: number; hi?: number; k?: number }) {
  let x = x0;
  return (
    <g opacity={o}>
      {ws.map((w, i) => {
        const gx = x;
        x += w * BW;
        const on = easeOut(clamp(k * ws.length - i));
        return (
          <g key={i} opacity={on}>
            {Array.from({ length: w }, (_, b) => <Box key={b} x={gx + b * BW} y={y} w={BW - 3} h={20} f={i === hi ? C.caramel : C.crema} fill={i === hi ? C.mocha : C.cocoa} sw={1.2} />)}
            <path d={`M ${gx + 1} ${y + 26} L ${gx + (w * BW - 3) / 2} ${y + 32} L ${gx + w * BW - 4} ${y + 26}`} fill="none" stroke={w > 1 ? C.caramel : C.taupe} strokeWidth={1.2} />
          </g>
        );
      })}
    </g>
  );
}

// 1 · Opening. A row of fixed slots: a pointer jumps straight to slot 3. Then a string's row looks the same on
// top, but its bytes underneath unfold at uneven widths; three costs decode in.
export function Opening({ t }: StepCtx) {
  const jump = easeOutBack(seg(t, 0.4, 0.8));
  const unfold = easeInOut(seg(t, 1.2, 2.0));
  const ws = [1, 2, 3, 4, 1, 3];
  let acc = 0;
  const starts = ws.map((w) => {
    const s = acc;
    acc += w;
    return s;
  });
  return (
    <Svg label="Fixed-size slots where a pointer jumps straight to an index, then a string whose characters look equal but whose bytes have uneven widths" h={300}>
      <T x={30} y={26} s={13} f={C.latte}>so far: fixed-size slots, known offsets</T>
      {Array.from({ length: 6 }, (_, i) => <Box key={i} x={30 + i * 44} y={40} w={38} h={28} o={easeOut(seg(t, i * 0.04, 0.2 + i * 0.04))} />)}
      <Arrow a={[30 + 3 * 44 + 19, 100]} b={[30 + 3 * 44 + 19, 74]} t={t} from={0.4} to={0.7} f={C.caramel} />
      <T x={330} y={62} s={13} f={C.caramel} o={jump}>slot 3: one jump</T>
      <T x={30} y={128} s={13} f={C.caramel} o={easeOut(seg(t, 1.0, 1.3))}>a string: looks the same, isn&apos;t</T>
      {ws.map((w, i) => <Box key={i} x={30 + i * 44} y={140} w={38} h={28} f={C.caramel} o={easeOut(seg(t, 1.0, 1.3))} />)}
      {ws.map((w, i) => (
        <g key={`b${i}`} opacity={unfold}>
          <line x1={30 + i * 44 + 19} y1={170} x2={lerp(30 + i * 44 + 19, 30 + (starts[i] + w / 2) * 22, unfold)} y2={196} stroke={C.taupe} strokeWidth={1} />
          {Array.from({ length: w }, (_, b) => <Box key={b} x={lerp(30 + i * 44, 30 + (starts[i] + b) * 22, unfold)} y={198} w={19} h={18} sw={1.1} />)}
        </g>
      ))}
      <Decode text="every edit copies" t={t} at={2.3} dur={0.4} x={30} y={242} s={13} f={C.crema} />
      <Decode text="1 to 4 bytes each" t={t} at={2.5} dur={0.4} x={30} y={264} s={13} f={C.crema} />
      <Decode text="no O(1) nth char" t={t} at={2.7} dur={0.4} x={30} y={286} s={13} f={C.crema} />
    </Svg>
  );
}

// 2 · Immutability. s and a second reference point at one "hello" box. s + " world" builds a NEW box (the old
// bytes are copied across), s's arrow swings to it, and the original stays put, still shared, padlocked. Then
// the locked box drops into a dict bucket as a key.
export function Immutability({ t }: StepCtx) {
  const make = easeOutBack(seg(t, 0.8, 1.4));
  const copy = easeInOut(seg(t, 0.9, 1.5));
  const swing = easeInOut(seg(t, 1.6, 2.1));
  const lock = easeOut(seg(t, 2.2, 2.5));
  const key = easeInOut(seg(t, 2.8, 3.5));
  return (
    <Svg label="A string with two references; concatenating builds a separate new string and leaves the original untouched and still shared, safe as a dictionary key" h={320}>
      <T x={30} y={30} s={13} f={C.latte}>s = &quot;hello&quot;</T>
      <Box x={200} y={60} w={150} h={30} />
      <T x={275} y={80} s={14} f={C.crema} a="middle">hello</T>
      <T x={30} y={80} s={14} f={C.caramel}>s</T>
      <line x1={50} y1={75} x2={lerp(196, 196, swing)} y2={lerp(75, 145, swing)} stroke={C.caramel} strokeWidth={1.6} />
      <T x={470} y={80} s={14} f={C.cinnamon}>other</T>
      <Arrow a={[464, 75]} b={[354, 75]} t={t} from={0.2} to={0.5} f={C.cinnamon} />
      <T x={30} y={126} s={13} f={C.cinnamon} o={easeOut(seg(t, 0.6, 0.9))}>s + &quot; world&quot;</T>
      <g opacity={clamp(make)}>
        <Box x={200} y={130} w={260} h={30} f={C.caramel} />
        <T x={330} y={150} s={14} f={C.caramel} a="middle">hello world</T>
      </g>
      {copy > 0 && copy < 1 && <Box x={200} y={lerp(60, 130, copy)} w={150} h={30} f={C.latte} fill="none" dash="3 3" o={1 - copy} />}
      <T x={470} y={150} s={13} f={C.caramel} o={easeOut(seg(t, 1.3, 1.6))}>a new object</T>
      <g opacity={lock}>
        <rect x={268} y={42} width={14} height={12} rx={2} fill="none" stroke={C.crema} strokeWidth={1.4} />
        <path d="M 271 42 v -4 a 4 4 0 0 1 8 0 v 4" fill="none" stroke={C.crema} strokeWidth={1.4} />
      </g>
      <T x={30} y={200} s={13} f={C.latte} o={lock}>the original &quot;hello&quot; is untouched</T>
      <g opacity={easeOut(seg(t, 2.7, 3.0))}>
        {[0, 1, 2].map((i) => <Box key={i} x={400 + i * 58} y={236} w={52} h={30} f={C.mocha} />)}
        <T x={400} y={290} s={13} f={C.taupe}>dict buckets</T>
      </g>
      {key > 0 && <Box x={lerp(200, 458, key)} y={lerp(60, 236, key)} w={lerp(150, 52, key)} h={30} f={C.crema} o={0.9} />}
      <T x={30} y={254} s={13} f={C.crema} o={easeOut(seg(t, 3.2, 3.6))}>buys: safe sharing, a dict key</T>
      <T x={30} y={278} s={13} f={C.crema} o={easeOut(seg(t, 3.4, 3.8))}>costs: every edit copies</T>
    </Svg>
  );
}

// 3 · The quadratic cost. Each loop turn builds a buffer one piece wider, copies everything built so far into it
// (the copied cells fly down), and discards the old one (red, dashed). The discards stack into a triangle.
export function QuadraticCost({ t }: StepCtx) {
  const K = 6, P = 34;
  const p = seg(t, 0.2, 3.2) * K;
  const n = Math.min(K, Math.floor(p) + 1);
  const f = easeInOut(clamp(p - (n - 1)));
  const tri = easeOut(seg(t, 3.3, 3.7));
  return (
    <Svg label="Each loop turn builds a wider buffer, copies everything built so far into it and discards the old one; the discards stack into a triangle" h={320}>
      <T x={30} y={26} s={13} f={C.latte}>s = s + piece: each + copies everything so far</T>
      {Array.from({ length: n }, (_, i) => {
        const cur = i === n - 1;
        const y = 50 + i * 34;
        return (
          <g key={i}>
            {Array.from({ length: i + 1 }, (_, c) => {
              const isNew = c === i;
              const fly = cur && !isNew ? f : 1;
              return (
                <Box key={c} x={30 + c * P} y={cur && !isNew ? lerp(y - 34, y, fly) : y} w={P - 4} h={26} f={cur ? (isNew ? C.caramel : C.crema) : C.cherryText} fill={cur ? C.cocoa : 'none'} dash={cur ? undefined : '4 3'} o={cur ? (isNew ? f : 1) : 0.6} />
              );
            })}
          </g>
        );
      })}
      <Draw pts={[[30 + 2 * P, 50 + 13], [30 + K * P + 6, 50 + (K - 1) * 34 + 13]]} t={t} from={3.3} to={3.7} stroke={C.cherryText} w={1.6} dash="4 4" pen={false} />
      <T x={30 + K * P + 20} y={250} s={13} f={C.cherryText} o={tri}>discarded,</T>
      <T x={30 + K * P + 20} y={270} s={13} f={C.cherryText} o={tri}>every time</T>
      <T x={30} y={312} s={13} f={C.cherryText} o={easeOut(seg(t, 3.6, 4.0))}>total copies grow like k squared</T>
    </Svg>
  );
}

// 4 · Predict: what fixes the loop? Before the answer the discard pile pulses. After it, one mutable buffer
// collects every piece in place (no copies), and one final arrow turns it into an immutable string, once.
export function FixPredictViz({ t, answer }: StepCtx) {
  const answered = answer !== null;
  const s = useSinceAnswer(answered);
  const pieces = answered ? Math.min(6, Math.floor(seg(s, 0.2, 1.6) * 6 + 1e-9)) : 0;
  const fin = answered ? easeOutBack(seg(s, 1.9, 2.4)) : 0;
  return (
    <Svg label="The quadratic loop's discard pile, then the fix: one mutable buffer collecting the pieces and a single conversion to an immutable string at the end" h={300}>
      {!answered && (
        <>
          {Array.from({ length: 4 }, (_, i) => <Box key={i} x={30} y={40 + i * 32} w={60 + i * 44} h={26} f={C.cherryText} fill="none" dash="4 3" o={0.4 + 0.25 * Math.sin(t * 4 + i)} />)}
          <T x={30} y={270} s={15} f={C.caramel} o={0.7 + 0.3 * Math.sin(t * 3)}>what actually fixes this?</T>
        </>
      )}
      {answered && (
        <>
          <T x={30} y={44} s={13} f={C.caramel}>one mutable buffer, built once</T>
          <Box x={30} y={60} w={6 * 40 + 8} h={34} f={C.caramel} fill="none" />
          {Array.from({ length: 6 }, (_, i) => {
            const k = answered ? easeOutBack(seg(s, 0.2 + i * 0.23, 0.45 + i * 0.23)) : 0;
            return <Box key={i} x={34 + i * 40} y={64 - 40 * (1 - clamp(k))} w={36} h={26} o={i < pieces || k > 0 ? clamp(k) : 0} />;
          })}
          <Arrow a={[290, 77]} b={[360, 77]} t={s} from={1.8} to={2.1} f={C.caramel} />
          <g opacity={clamp(fin)}>
            <Box x={370} y={60} w={180} h={34} f={C.crema} />
            <T x={460} y={82} s={13} f={C.crema} a="middle">immutable, once</T>
          </g>
          <T x={30} y={150} s={13} f={C.latte} o={easeOut(seg(s, 1.6, 2.0))}>no copy per piece</T>
          <T x={30} y={270} s={13} f={C.latte} o={easeOut(seg(s, 2.3, 2.7))}>convert to an immutable string only at the end</T>
        </>
      )}
    </Svg>
  );
}

// 5 · The builder: spare room, then double. Pieces fill a buffer with dashed spare slots; when it is full, a
// buffer twice the size appears and the contents move across once; it happens again at the next overflow.
export function Builder({ t }: StepCtx) {
  const caps = [4, 8, 16];
  const filled = Math.floor(seg(t, 0.3, 2.6) * 11 + 1e-9);
  const level = filled > 8 ? 2 : filled > 4 ? 1 : 0;
  const W = 28;
  return (
    <Svg label="A string builder: pieces fill a buffer with spare room, and when it runs out the buffer doubles, the same policy as topic one's growing array" h={300}>
      <T x={30} y={26} s={13} f={C.latte}>a string builder: one buffer,</T>
      <T x={30} y={44} s={13} f={C.latte}>capacity doubles on overflow</T>
      {caps.map((c, r) => {
        const on = r <= level;
        const y = 60 + r * 36;
        const inThis = r === level ? filled : r < level ? caps[r] : 0;
        return (
          <g key={c} opacity={on ? (r === level ? 1 : 0.35) : 0}>
            {Array.from({ length: c }, (_, i) => (
              <Box key={i} x={30 + i * W} y={y} w={W - 4} h={24} f={i < inThis ? (r === level ? C.caramel : C.taupe) : C.taupe} fill={i < inThis ? C.mocha : 'none'} dash={i < inThis ? undefined : '3 3'} sw={1.1} />
            ))}
            {r > 0 && on && <T x={30 + c * W + 10} y={y + 17} s={13} f={C.caramel}>&times;2</T>}
          </g>
        );
      })}
      <T x={30} y={190} s={13} f={C.crema} o={easeOut(seg(t, 2.6, 3.0))}>&quot;every string builder has a capacity...</T>
      <T x={30} y={210} s={13} f={C.crema} o={easeOut(seg(t, 2.6, 3.0))}>the buffer is automatically made larger&quot;</T>
      <T x={30} y={230} s={13} f={C.crema} o={easeOut(seg(t, 2.6, 3.0))}>&mdash; Java&apos;s own StringBuilder docs</T>
      <Decode text="topic 1's doubling array" t={t} at={3.2} dur={0.5} x={30} y={266} s={13} f={C.caramel} />
      <T x={30} y={288} s={13} f={C.caramel} o={easeOut(seg(t, 3.5, 3.9))}>specialized to bytes</T>
    </Svg>
  );
}

// 6 · One character, one to four bytes. Four code points appear one by one; under each, its byte cells unfold
// and a counter names the width: 1, 2, 3, 4 bytes.
export function Utf8Bytes({ t }: StepCtx) {
  const xs = CP.map((_, i) => 30 + i * 135);
  return (
    <Svg label="Four characters, each one code point, whose UTF-8 encodings take one, two, three and four bytes" h={300}>
      <T x={30} y={26} s={13} f={C.latte}>one character each; look at the widths</T>
      {CP.map((c, i) => {
        const at = 0.3 + i * 0.55;
        const k = easeOut(seg(t, at, at + 0.3));
        const u = seg(t, at + 0.15, at + 0.5);
        return (
          <g key={c.name} opacity={k}>
            <T x={xs[i]} y={70} s={13} f={C.crema}>{c.name}</T>
            {Array.from({ length: c.bytes }, (_, b) => <Box key={b} x={xs[i] + b * BW} y={86} w={BW - 3} h={22} f={c.bytes > 1 ? C.caramel : C.crema} o={easeOut(clamp(u * c.bytes - b))} sw={1.2} />)}
            <T x={xs[i]} y={134} s={14} f={c.bytes > 1 ? C.caramel : C.crema} o={easeOut(seg(t, at + 0.4, at + 0.6))}>{c.bytes} {c.bytes === 1 ? 'byte' : 'bytes'}</T>
          </g>
        );
      })}
      <T x={30} y={190} s={13} f={C.latte} o={easeOut(seg(t, 2.6, 3.0))}>ASCII stays one byte; accents, CJK,</T>
      <T x={30} y={212} s={13} f={C.latte} o={easeOut(seg(t, 2.6, 3.0))}>emoji take more</T>
      <Draw pts={[[30, 150], [xs[3] + 4 * BW, 150]]} t={t} from={2.6} to={3.2} stroke={C.taupe} w={1} pen={false} />
    </Svg>
  );
}

// 7 · Predict: is the nth character O(1)? The byte pointer jumps straight to byte 5. After the answer, a walker
// decodes code points from the start, one step each, counting to 5 before it reaches the fifth character.
export function IndexPredictViz({ t, answer }: StepCtx) {
  const answered = answer !== null;
  const s = useSinceAnswer(answered);
  const ws = [1, 2, 3, 4, 1, 2, 3];
  const starts: number[] = [];
  let acc = 0;
  ws.forEach((w) => {
    starts.push(acc);
    acc += w;
  });
  const x0 = 30;
  const steps = answered ? Math.min(5, Math.floor(seg(s, 0.2, 1.8) * 5 + 1e-9)) : 0;
  const walkCp = answered ? Math.min(4, seg(s, 0.2, 1.8) * 5) : 0;
  const wi = Math.min(ws.length - 1, Math.floor(walkCp));
  const wx = x0 + lerp(starts[wi], wi + 1 < ws.length ? starts[wi + 1] : acc, walkCp - wi) * BW + 10;
  return (
    <Svg label="A byte row of mixed-width characters: jumping to a byte is direct, but reaching the fifth character means decoding every character before it" h={300}>
      <ByteRow ws={ws} x0={x0} y={80} hi={steps >= 5 ? 4 : -1} />
      <Arrow a={[x0 + 5 * BW + 10, 40]} b={[x0 + 5 * BW + 10, 76]} t={t} from={0.2} to={0.5} f={C.caramel} />
      <T x={x0 + 5 * BW + 22} y={50} s={13} f={C.caramel} o={easeOut(seg(t, 0.4, 0.7))}>byte 5: one jump</T>
      {!answered && <T x={30} y={270} s={15} f={C.caramel} o={0.7 + 0.3 * Math.sin(t * 3)}>and the 5th character?</T>}
      {answered && (
        <>
          <circle cx={wx} cy={136} r={6} fill={C.cinnamon} />
          <T x={30} y={170} s={13} f={C.cinnamon}>decode steps</T>
          <T x={160} y={171} s={16} f={C.cinnamon}>{steps}</T>
          {steps >= 5 && <Reticle x={x0 + starts[4] * BW + 10} y={90} w={34} h={34} t={s} at={1.9} />}
          <T x={30} y={214} s={13} f={C.caramel} o={easeOut(seg(s, 2.0, 2.4))}>depends on every earlier character&apos;s width</T>
          <T x={30} y={236} s={13} f={C.latte} o={easeOut(seg(s, 2.3, 2.7))}>no way to know without walking and decoding</T>
        </>
      )}
    </Svg>
  );
}

// 8 · Two languages. Go: s[i] jumps to a byte at once; for range walks rune by rune. Rust: str[0] is crossed
// out (does not compile); a byte slice on a boundary passes, the same slice moved inside a character panics.
export function TwoTradeoffs({ t }: StepCtx) {
  const ws = [1, 2, 3, 1, 4];
  const walk = seg(t, 0.9, 2.0) * ws.length;
  const starts: number[] = [];
  let acc = 0;
  ws.forEach((w) => {
    starts.push(acc);
    acc += w;
  });
  const wi = Math.min(ws.length - 1, Math.floor(walk));
  const rx = 30 + lerp(starts[wi], wi + 1 < ws.length ? starts[wi + 1] : acc, clamp(walk - wi)) * BW;
  const slide = easeInOut(seg(t, 3.4, 3.9));
  const sx = lerp(30 + starts[1] * BW, 30 + (starts[2] + 1) * BW, slide);
  const bad = slide > 0.95;
  return (
    <Svg label="Go indexes bytes directly and decodes one rune per loop step; Rust refuses single-character indexing and panics when a slice boundary falls inside a character" h={330}>
      <T x={30} y={24} s={14} f={C.caramel} serif>Go</T>
      <ByteRow ws={ws} x0={30} y={36} />
      <Arrow a={[30 + 4 * BW + 10, 96]} b={[30 + 4 * BW + 10, 62]} t={t} from={0.3} to={0.5} f={C.caramel} />
      <T x={30 + 4 * BW + 22} y={92} s={13} f={C.caramel} o={easeOut(seg(t, 0.4, 0.6))}>s[i]: byte, O(1)</T>
      <circle cx={rx + 8} cy={112} r={5} fill={C.cinnamon} opacity={walk > 0 ? 1 : 0} />
      <T x={30} y={136} s={13} f={C.cinnamon} o={easeOut(seg(t, 0.9, 1.2))}>for range: one rune per step</T>
      <T x={30} y={180} s={14} f={C.cinnamon} serif o={easeOut(seg(t, 2.1, 2.4))}>Rust</T>
      <g opacity={easeOut(seg(t, 2.2, 2.5))}>
        <T x={30} y={204} s={13} f={C.crema}>str[0]</T>
        <Draw pts={[[26, 199], [92, 199]]} t={t} from={2.5} to={2.7} stroke={C.cherryText} w={2} pen={false} />
        <T x={110} y={204} s={13} f={C.cherryText} o={easeOut(seg(t, 2.6, 2.9))}>does not compile</T>
      </g>
      <ByteRow ws={ws} x0={30} y={222} o={easeOut(seg(t, 2.8, 3.1))} />
      <g opacity={easeOut(seg(t, 3.0, 3.3))}>
        <rect x={sx} y={216} width={BW * 3} height={32} rx={3} fill="none" stroke={bad ? C.cherryText : C.caramel} strokeWidth={2} />
        <T x={30} y={284} s={13} f={C.crema} o={1 - slide}>&amp;s[i..j]: byte indices, &quot;to be constant-time&quot;</T>
        <T x={30} y={284} s={13} f={C.cherryText} o={bad ? 1 : 0}>panics: boundary inside a character</T>
      </g>
      <T x={30} y={316} s={13} f={C.latte} o={easeOut(seg(t, 4.0, 4.4))}>each honest about which promise it keeps</T>
    </Svg>
  );
}

// 9 · Prove it. Naive concatenation's bar roughly quadruples per doubling of n (the last one runs off the
// chart); the builder's, at inputs a hundred times larger, roughly doubles. Shape only.
export function ProveIt({ t }: StepCtx) {
  const naive = ['4,000', '8,000', '16,000', '32,000', '64,000'];
  const build = ['500,000', '1,000,000', '2,000,000', '4,000,000', '8,000,000'];
  const nW = [6, 24, 96, 384, 520];
  const bW = [24, 48, 96, 192, 384];
  const row = (labels: string[], ws: number[], y0: number, at: number, f: string, lx: number) =>
    labels.map((l, i) => {
      const k = easeOut(seg(t, at + i * 0.25, at + i * 0.25 + 0.3));
      const y = y0 + i * 20;
      return (
        <g key={l} opacity={k > 0 ? 1 : 0}>
          <T x={lx} y={y + 11} s={13} f={C.taupe} a="end">{l}</T>
          <rect x={lx + 10} y={y} width={Math.min(ws[i], 570 - lx - 10) * k} height={12} rx={2} fill={f} />
        </g>
      );
    });
  const off = easeOut(seg(t, 1.5, 1.8));
  return (
    <Svg label="Naive concatenation's time roughly quadruples each time n doubles, running off the chart; the string builder's roughly doubles at inputs a hundred times larger" h={330}>
      <T x={30} y={22} s={14} f={C.cinnamon} serif>naive s = s + piece</T>
      {row(naive, nW, 36, 0.3, C.cinnamon, 110)}
      <T x={570} y={156} s={13} f={C.cherryText} a="end" o={off}>&times;4 per doubling, off the chart</T>
      <T x={30} y={190} s={14} f={C.caramel} serif o={easeOut(seg(t, 1.9, 2.2))}>string builder, 100&times; larger n</T>
      {row(build, bW, 202, 2.1, C.caramel, 110)}
      <T x={570} y={322} s={13} f={C.caramel} a="end" o={easeOut(seg(t, 3.5, 3.9))}>&times;2 per doubling: linear</T>
    </Svg>
  );
}
