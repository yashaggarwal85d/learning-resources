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
const MATCHED = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];

/** A small chip with a centred name. */
function Chip({
  x,
  y,
  w,
  h = 28,
  label,
  o = 1,
  stroke = C.mocha,
  f = C.crema,
  fill = C.cocoa,
}: {
  x: number;
  y: number;
  w: number;
  h?: number;
  label: string;
  o?: number;
  stroke?: string;
  f?: string;
  fill?: string;
}) {
  return (
    <g opacity={o}>
      <rect x={x} y={y} width={w} height={h} rx={5} fill={fill} stroke={stroke} strokeWidth={1.5} />
      <T x={x + w / 2} y={y + h / 2 + 4.5} s={12} f={f} a="middle">
        {label}
      </T>
    </g>
  );
}

/** A customer row and three orders pointing back at it. With a natural key the orders point at the email itself;
 * with a surrogate key they point at a separate id. `k` fades it in, `ch` flashes the email change, `res` colours
 * the outcome: refused (natural) or every order still resolving (surrogate, one link at a time). */
function KeyPic({ y, natural, k, ch, res }: { y: number; natural: boolean; k: number; ch: number; res: number }) {
  const flash = ch > 0 && ch < 1 ? 1 : 0;
  const keyX = natural ? 25 : 25;
  const keyW = natural ? 230 : 100;
  return (
    <g opacity={k}>
      {natural ? (
        <Chip x={keyX} y={y} w={keyW} h={34} label="email (the key)" stroke={flash ? C.focus : res > 0 ? C.cherryText : C.mocha} />
      ) : (
        <>
          <Chip x={25} y={y} w={100} h={34} label="id" stroke={res > 0 ? C.focus : C.mocha} />
          <Chip x={130} y={y} w={125} h={34} label="email" stroke={ch >= 1 ? C.focus : C.mocha} fill={flash ? C.mocha : C.cocoa} />
        </>
      )}
      {[0, 1, 2].map((i) => {
        const oy = y + i * 32 - 4;
        const lit = natural ? res : seg(res, i / 3, (i + 1) / 3);
        const col = lit > 0 ? (natural ? C.cherryText : C.focus) : C.mocha;
        return (
          <g key={i}>
            <rect x={360} y={oy} width={215} height={24} rx={4} fill={C.cocoa} stroke={C.mocha} />
            <T x={372} y={oy + 16} s={11} f={C.latte}>
              order
            </T>
            <T x={565} y={oy + 16} s={11} f={lit > 0 ? col : C.crema} a="end">
              {natural ? '→ email' : '→ id'}
            </T>
            <path d={`M360 ${oy + 12} C 320 ${oy + 12} 300 ${y + 17} 255 ${y + 17}`} fill="none" stroke={col} strokeWidth={lit > 0 ? 2 : 1.2} />
          </g>
        );
      })}
    </g>
  );
}

// 1 · Hook. The same email change, twice. Natural key: the change is refused, every reference turning red. Surrogate
// key: one row changes and every order still resolves through the untouched id.
export function Hook({ t }: StepCtx) {
  const r1 = easeOut(seg(t, 1.4, 1.9));
  const r2 = seg(t, 3.0, 3.9);
  return (
    <Svg label="natural key blocks the update. surrogate key absorbs it." h={290}>
      <T x={25} y={22} s={13} f={C.latte} o={easeOut(seg(t, 0.1, 0.4))}>
        natural key
      </T>
      <KeyPic y={40} natural k={easeOut(seg(t, 0.1, 0.5))} ch={seg(t, 0.7, 1.2)} res={r1} />
      <T x={25} y={lerp(108, 102, r1)} s={13} f={C.cherryText} o={r1}>
        update refused
      </T>
      <T x={25} y={162} s={13} f={C.latte} o={easeOut(seg(t, 2.0, 2.3))}>
        surrogate key
      </T>
      <KeyPic y={180} natural={false} k={easeOut(seg(t, 2.0, 2.4))} ch={seg(t, 2.4, 2.9)} res={r2} />
      <T x={25} y={lerp(248, 242, easeOut(seg(t, 3.6, 4.0)))} s={13} f={C.focus} o={easeOut(seg(t, 3.6, 4.0))}>
        one row changed
      </T>
    </Svg>
  );
}

// 2 · Predict: the key changes. The email, with references arriving from everywhere; then the question.
export function PredictEmailChanges({ t, answer }: StepCtx) {
  return (
    <Svg label="email is the key everywhere — then it changes" h={210}>
      <Row y={40} label="email is the key" value="referenced everywhere" k={easeOut(seg(t, 0.1, 0.5))} />
      <Chip x={240} y={66} w={120} h={30} label="email" o={easeOut(seg(t, 0.2, 0.5))} />
      {[0, 1, 2, 3, 4, 5].map((i) => {
        const left = i < 3;
        const x = left ? 40 + i * 50 : 410 + (i - 3) * 50;
        const d = easeInOut(seg(t, 0.4 + i * 0.08, 0.8 + i * 0.08));
        return (
          <g key={i}>
            <circle cx={x + 10} cy={81} r={5} fill={C.latte} opacity={d > 0 ? 1 : 0} />
            <line x1={x + 10} y1={81} x2={lerp(x + 10, left ? 240 : 360, d)} y2={81} stroke={C.mocha} strokeWidth={1.5} />
          </g>
        );
      })}
      <AnswerRow y={140} label="customer changes it" answer={answer} value="blocked, or rewrite all" f={C.cherryText} k={easeOut(seg(t, 1.3, 1.8))} />
      <Verdict answer={answer} text="every reference has to move with it" f={C.cherryText} />
    </Svg>
  );
}

// 3 · The refusal. The email change is attempted; the orders still point at it; the database refuses.
export function RevealNaturalKeyBreaks({ t }: StepCtx) {
  return (
    <Svg label="orders still reference the email about to change" h={250}>
      <Row y={40} label="update customer_email" value="attempted" k={easeOut(seg(t, 0.3, 0.8))} />
      <KeyPic y={110} natural k={easeOut(seg(t, 0.1, 0.5))} ch={seg(t, 0.9, 1.5)} res={easeOut(seg(t, 2.2, 2.8))} />
      <Row y={235} label="still referenced" value="update refused" valueColor={C.cherryText} k={easeOut(seg(t, 2.6, 3.1))} />
    </Svg>
  );
}

// 4 · The surrogate absorbs it. A separate id carries the links; the email changes in its one row; each order
// resolves through the untouched id, one by one.
export function RevealSurrogateKeyAbsorbs({ t }: StepCtx) {
  return (
    <Svg label="one row changes, every order still resolves" h={250}>
      <Row y={40} label="update customer_email" value="succeeds" k={easeOut(seg(t, 1.6, 2.1))} />
      <KeyPic y={110} natural={false} k={easeOut(seg(t, 0.2, 0.7))} ch={seg(t, 1.2, 1.8)} res={seg(t, 2.2, 3.4)} />
      <Row y={235} label="orders resolve by" value="customer_id, unchanged" valueColor={C.focus} k={easeOut(seg(t, 3.2, 3.7))} />
    </Svg>
  );
}

// 5 · The difference. The natural key carries business meaning, so its outline shakes as that meaning shifts; the
// surrogate has nothing to lose and holds still.
export function RevealNaturalVsSurrogate({ t }: StepCtx) {
  const shake = seg(t, 2.2, 3.2);
  const dx = shake > 0 && shake < 1 ? Math.sin(shake * Math.PI * 8) * 4 * (1 - shake) : 0;
  const a = easeOut(seg(t, 2.6, 3.0));
  const b = easeOut(seg(t, 3.2, 3.6));
  return (
    <Svg label="a business attribute vs. a meaningless identifier" h={230}>
      <Row y={40} label="natural key" value="a business attribute" k={easeOut(seg(t, 0.2, 0.7))} />
      <Row y={85} label="surrogate key" value="no business meaning" valueColor={C.focus} k={easeOut(seg(t, 0.8, 1.3))} />
      <g transform={`translate(${dx.toFixed(2)} 0)`}>
        <Chip x={25} y={125} w={250} h={36} label="email" o={easeOut(seg(t, 0.3, 0.7))} stroke={shake > 0 ? C.cherryText : C.mocha} />
      </g>
      <Chip x={325} y={125} w={250} h={36} label="customer_id" o={easeOut(seg(t, 0.9, 1.3))} stroke={b > 0 ? C.focus : C.mocha} />
      <T x={150} y={lerp(204, 196, a)} s={13} f={C.cherryText} a="middle" o={a}>
        inherits its instability
      </T>
      <T x={450} y={lerp(204, 196, b)} s={13} f={C.focus} a="middle" o={b}>
        nothing to lose
      </T>
    </Svg>
  );
}

// 6 · Predict: a counter for many writers? Three writers, each line running to one shared counter; then the question.
export function PredictSequenceDistributed({ t, answer }: StepCtx) {
  return (
    <Svg label="several writers, no shared coordinator" h={210}>
      <Row y={40} label="independent writers" value="one shared sequence?" k={easeOut(seg(t, 0.1, 0.5))} />
      {[0, 1, 2].map((i) => {
        const x = 25 + i * 200;
        const d = easeInOut(seg(t, 0.6 + i * 0.15, 1.0 + i * 0.15));
        return (
          <g key={i}>
            <Chip x={x} y={58} w={150} h={24} label="writer" o={easeOut(seg(t, 0.2 + i * 0.1, 0.5 + i * 0.1))} />
            <line x1={x + 75} y1={82} x2={lerp(x + 75, 300, d)} y2={lerp(82, 96, d)} stroke={C.latte} strokeWidth={1.5} />
          </g>
        );
      })}
      <Chip x={240} y={96} w={120} h={24} label="counter" o={easeOut(seg(t, 0.5, 0.8))} stroke={C.cherryText} />
      <AnswerRow y={150} label="still safe?" answer={answer} value="not safely" f={C.cherryText} k={easeOut(seg(t, 1.3, 1.8))} />
      <Verdict answer={answer} text="every writer must ask the one counter" y={190} f={C.cherryText} />
    </Svg>
  );
}

// 7 · Gaps and order. Values are handed out in turn; one is rolled back and its slot stays a gap. With a cache, two
// sessions take blocks of values, and their commits interleave out of order.
const MERGED = [3, 0, 4, 1, 5, 2];
export function RevealSequenceGaps({ t }: StepCtx) {
  const gone = easeInOut(seg(t, 1.6, 2.0));
  return (
    <Svg label="never rolled back, caching breaks strict order" h={270}>
      <Row y={40} label="nextval" value="never rolled back" k={easeOut(seg(t, 0.3, 0.8))} />
      <Row y={85} label="a cache setting" value="breaks cross-session order" valueColor={C.cherryText} k={easeOut(seg(t, 2.6, 3.1))} />
      {[0, 1, 2, 3, 4, 5].map((i) => {
        const k = easeOutBack(seg(t, 0.6 + i * 0.2, 0.9 + i * 0.2));
        const rolled = i === 2;
        return (
          <g key={i}>
            <rect x={25 + i * 60} y={110} width={50} height={26} rx={4} fill="none" stroke={rolled && gone > 0 ? C.cherryText : C.mocha} strokeDasharray={rolled && gone > 0 ? '4 3' : undefined} />
            <g opacity={clamp(k) * (rolled ? 1 - gone : 1)}>
              <rect x={25 + i * 60} y={110} width={50} height={26} rx={4} fill={C.cocoa} stroke={C.latte} />
              <T x={50 + i * 60} y={128} s={12} f={C.crema} a="middle">
                {i + 1}
              </T>
            </g>
          </g>
        );
      })}
      <T x={420} y={128} s={12} f={C.cherryText} o={gone}>
        rolled back: a gap
      </T>
      {['A', 'B'].map((s, j) => (
        <T key={s} x={25 + j * 290} y={176} s={12} f={C.latte} o={easeOut(seg(t, 2.6, 2.9))}>
          {`session ${s}`}
        </T>
      ))}
      {[0, 1, 2, 3, 4, 5].map((v) => {
        const j = v < 3 ? 0 : 1;
        const lx = 110 + j * 290 + (v % 3) * 50;
        const slot = MERGED.indexOf(v);
        const m = easeInOut(seg(t, 3.3 + slot * 0.12, 3.7 + slot * 0.12));
        const x = lerp(lx, 25 + slot * 60, m);
        const y = lerp(162, 220, m);
        const bad = m > 0.9 && slot < 5 && MERGED[slot] > MERGED[slot + 1];
        return (
          <g key={v} opacity={easeOut(seg(t, 2.8 + j * 0.2, 3.1 + j * 0.2))}>
            <rect x={x} y={y} width={44} height={24} rx={4} fill={C.cocoa} stroke={bad ? C.cherryText : C.latte} />
            <T x={x + 22} y={y + 17} s={12} f={C.crema} a="middle">
              {v + 1}
            </T>
          </g>
        );
      })}
    </Svg>
  );
}

// 8 · Generation cost. Same inserts into an indexed table: the sequence, then UUIDv7, then UUIDv4, each bar timed.
export function RevealGenerationCost({ t }: StepCtx) {
  const max = 444.299;
  return (
    <Svg label="same inserts, same index, three generators" h={320}>
      {timeBar(30, 70, 221.876 / max, '221.876 ms', 'sequence', C.focus, easeOut(seg(t, 1.2, 2.0)))}
      {timeBar(30, 170, 347.448 / max, '347.448 ms', 'uuidv7', C.second, easeOut(seg(t, 2.0, 2.8)))}
      {timeBar(30, 270, 1, '444.299 ms', 'uuidv4', C.cherryText, easeOut(seg(t, 2.8, 3.6)))}
    </Svg>
  );
}

// 9 · Index locality. Each generator's leaf pages laid out (width = page count); then each fills to its measured
// density: tight for the sequence and UUIDv7, visibly emptier for UUIDv4.
export function RevealIndexLocality({ t }: StepCtx) {
  const rows: [string, number, number, string][] = [
    ['sequence', 274, 89.78, C.focus],
    ['uuidv7', 384, 89.79, C.second],
    ['uuidv4', 527, 65.52, C.cherryText],
  ];
  return (
    <Svg label="leaf-page density after the same inserts" h={300}>
      {rows.map(([label, pages, dens, col], i) => {
        const y = 50 + i * 90;
        const w = (550 * pages) / 527;
        const kw = easeOut(seg(t, 0.4 + i * 0.3, 1.0 + i * 0.3));
        const kf = easeOut(seg(t, 1.8 + i * 0.35, 2.5 + i * 0.35));
        return (
          <g key={label}>
            <T x={25} y={y - 10} s={13} f={C.latte} o={kw}>
              {label}
            </T>
            <rect x={25} y={y} width={w * kw} height={30} rx={3} fill="none" stroke={C.mocha} />
            <rect x={25} y={y + 30 - 30 * (dens / 100) * kf} width={w * kw} height={30 * (dens / 100) * kf} rx={2} fill={col} opacity={0.6} />
            <T x={25} y={y + 50} s={12} f={C.crema} o={seg(kf, 0.6, 1)}>
              {`${dens}% full, ${pages} leaf pages`}
            </T>
          </g>
        );
      })}
    </Svg>
  );
}

/** A 128-bit id as 32 cells. With `prefix`, the first 12 cells are the shared timestamp; the rest follow `seed`. */
function IdStrip({ y, seed, prefix, k, hi }: { y: number; seed: number; prefix: boolean; k: number; hi: number }) {
  return (
    <g opacity={k}>
      {Array.from({ length: 32 }, (_, i) => {
        const p = prefix && i < 12;
        const v = p ? (i * 7 + 3) % 5 : (i * 13 + seed * 17 + ((i * seed) % 7)) % 5;
        return <rect key={i} x={25 + i * 17.2} y={y} width={15} height={18} rx={2} fill={p && hi > 0 ? C.focus : C.latte} opacity={p && hi > 0 ? 0.4 + 0.12 * v + 0.2 * hi : 0.2 + 0.15 * v} />;
      })}
    </g>
  );
}

// 10 · Why v7 stays tight. Two UUIDv7s made moments apart share their whole timestamp prefix, which lights up; two
// UUIDv4s share nothing.
export function RevealUUIDv7BitLayout({ t }: StepCtx) {
  const hi = easeOut(seg(t, 1.4, 2.0));
  const br = easeInOut(seg(t, 1.8, 2.4));
  return (
    <Svg label="a shared timestamp prefix, then randomness" h={250}>
      <Row y={40} label="uuidv7 prefix" value="shared, back to back" k={easeOut(seg(t, 0.2, 0.7))} />
      <Row y={85} label="uuidv4 prefix" value="never shared" valueColor={C.cherryText} k={easeOut(seg(t, 2.8, 3.3))} />
      <IdStrip y={110} seed={1} prefix k={easeOut(seg(t, 0.4, 0.8))} hi={hi} />
      <IdStrip y={134} seed={2} prefix k={easeOut(seg(t, 0.7, 1.1))} hi={hi} />
      <path d={`M25 158 l0 6 l${200 * br} 0`} fill="none" stroke={C.focus} strokeWidth={2} />
      <T x={125} y={180} s={12} f={C.focus} a="middle" o={easeOut(seg(t, 2.2, 2.6))}>
        timestamp
      </T>
      <IdStrip y={200} seed={3} prefix={false} k={easeOut(seg(t, 3.0, 3.4))} hi={0} />
      <IdStrip y={224} seed={5} prefix={false} k={easeOut(seg(t, 3.2, 3.6))} hi={0} />
    </Svg>
  );
}

// 11 · Durable key. Three versions of the same row arrive over time; each gets a new surrogate, while the durable key
// stays the same and a line threads through all three.
export function RevealDurableKey({ t }: StepCtx) {
  const th = easeInOut(seg(t, 3.0, 3.6));
  return (
    <Svg label="constant across versions, unlike the surrogate" h={230}>
      <Row y={40} label="durable key" value="constant across versions" k={easeOut(seg(t, 2.8, 3.3))} />
      <Row y={85} label="surrogate key" value="changes per version" valueColor={C.second} k={easeOut(seg(t, 2.0, 2.5))} />
      {[0, 1, 2].map((i) => {
        const k = easeOut(seg(t, 0.6 + i * 0.5, 1.0 + i * 0.5));
        const y = 110 + i * 38;
        return (
          <g key={i} opacity={k} transform={`translate(${((1 - k) * 16).toFixed(1)} 0)`}>
            <T x={25} y={y + 18} s={12} f={C.latte}>
              {`version ${i + 1}`}
            </T>
            <Chip x={160} y={y} w={190} h={26} label={`surrogate ${i + 1}`} stroke={C.second} />
            <Chip x={385} y={y} w={190} h={26} label="durable key" stroke={th > 0 ? C.focus : C.mocha} />
          </g>
        );
      })}
      <line x1={480} y1={136} x2={480} y2={136 + 38 * 2 * th - 26 * th} stroke={C.focus} strokeWidth={2} />
    </Svg>
  );
}

// 12 · Predict: is a hash collision real? A business key runs through a hash into a hash key; then the question.
export function PredictHashCollision({ t, answer }: StepCtx) {
  const a = easeInOut(seg(t, 0.5, 0.9));
  const b = easeInOut(seg(t, 0.9, 1.3));
  return (
    <Svg label="a hash of a business key — a real risk?" h={210}>
      <Row y={40} label="hash as surrogate" value="collision risk?" k={easeOut(seg(t, 0.1, 0.5))} />
      <Chip x={25} y={62} w={150} h={28} label="business key" o={easeOut(seg(t, 0.2, 0.5))} />
      <line x1={175} y1={76} x2={175 + 65 * a} y2={76} stroke={C.latte} strokeWidth={1.5} />
      <Chip x={240} y={62} w={120} h={28} label="hash()" o={a} />
      <line x1={360} y1={76} x2={360 + 65 * b} y2={76} stroke={C.latte} strokeWidth={1.5} />
      <Chip x={425} y={62} w={150} h={28} label="hash key" o={b} />
      <AnswerRow y={140} label="quantifiable, or a caveat" answer={answer} value="depends on width" k={easeOut(seg(t, 1.3, 1.8))} />
      <Verdict answer={answer} text="it's a number you can compute" />
    </Svg>
  );
}

// 13 · The birthday bound. For each width, a bar fills to its collision odds: 50% for a 32-bit hash by about 77,000
// values; about 2.7% for 64 bits at a billion rows; nothing visible for 128 bits.
export function RevealBirthdayBound({ t }: StepCtx) {
  const rows: [string, string, number, string][] = [
    ['32-bit hash', 'even odds by ~77,000', 0.5, C.cherryText],
    ['64-bit hash', '~2.7% at a billion rows', 0.0267, C.second],
    ['128-bit hash', 'negligible', 0, C.focus],
  ];
  return (
    <Svg label="collision odds, computed by width" h={230}>
      {rows.map(([label, value, p, col], i) => {
        const k = easeOut(seg(t, 0.6 + i * 1.0, 1.1 + i * 1.0));
        const b = easeOut(seg(t, 0.9 + i * 1.0, 1.6 + i * 1.0));
        const y = 45 + i * 70;
        return (
          <g key={label}>
            <Row y={y} label={label} value={value} valueColor={col} k={k} />
            <rect x={25} y={y + 14} width={550} height={6} rx={3} fill={C.cocoa} opacity={k} />
            <rect x={25} y={y + 14} width={Math.max(p > 0 ? 3 : 0, 550 * p * b)} height={6} rx={3} fill={col} opacity={k} />
          </g>
        );
      })}
    </Svg>
  );
}

// 14 · Recap. Three rows land one per beat.
export function Recap({ t }: StepCtx) {
  return (
    <Svg label="natural breaks, surrogate absorbs; cost and locality traded off" h={220}>
      <Row y={50} label="natural vs. surrogate" value="breaks vs. absorbs" k={easeOut(seg(t, 0.2, 0.7))} />
      <Row y={110} label="three generators" value="coordination vs. locality" k={easeOut(seg(t, 1.4, 1.9))} />
      <Row y={170} label="hash width" value="a computed risk" valueColor={C.focus} k={easeOut(seg(t, 2.8, 3.3))} />
    </Svg>
  );
}

// 15 · Prove: which key? Three generators; after the answer UUIDv7 lights and the others dim, and the verdict lands
// with a tick.
export function ProveUUIDv7Choice({ t, answer }: StepCtx) {
  const s = useSinceAnswer(answer !== null);
  const pr = answer !== null ? easeInOut(seg(s, 0.1, 0.6)) : 0;
  const k = answer !== null ? easeOut(seg(s, 0.6, 1.0)) : 0;
  const tick = answer !== null ? easeOut(seg(s, 1.0, 1.4)) : 0;
  const gens = ['sequence', 'uuidv7', 'uuidv4'];
  return (
    <Svg label="no coordinator, still sorts near insertion order" h={230}>
      <Row y={40} label="no coordinator" value="sorts near insertion order" k={easeOut(seg(t, 0.1, 0.5))} />
      <AnswerRow y={90} label="the right key is" answer={answer} value="uuidv7" k={easeOut(seg(t, 0.4, 0.9))} />
      {gens.map((g, i) => (
        <Chip
          key={g}
          x={25 + i * 190}
          y={115}
          w={170}
          h={30}
          label={g}
          o={easeOut(seg(t, 0.6 + i * 0.1, 0.9 + i * 0.1)) * (i === 1 ? 1 : 1 - 0.6 * pr)}
          stroke={i === 1 && pr > 0 ? C.focus : C.mocha}
        />
      ))}
      {answer !== null && (
        <>
          <T x={300} y={lerp(198, 190, k)} s={15} f={C.focus} a="middle" o={k}>
            no coordinator, and it lands near its neighbours
          </T>
          <rect x={110} y={202} width={380 * tick} height={3} fill={C.focus} />
          <Tick y={176} k={tick} />
        </>
      )}
    </Svg>
  );
}
