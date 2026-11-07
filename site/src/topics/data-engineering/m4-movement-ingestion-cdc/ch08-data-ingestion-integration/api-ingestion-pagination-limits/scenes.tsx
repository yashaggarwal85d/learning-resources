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

/** Slot i's left edge in a row of eleven list boxes. */
const SX = (i: number) => 25 + i * 48;

/** One row of a list: a small box with its letter, or a dashed hole once deleted. */
function LBox({ x, y, id, o = 1, stroke = C.mocha, f = C.crema, hole = false }: { x: number; y: number; id: string; o?: number; stroke?: string; f?: string; hole?: boolean }) {
  return (
    <g opacity={o}>
      <rect x={x} y={y} width={40} height={28} rx={3} fill={hole ? 'none' : C.cocoa} stroke={stroke} strokeWidth={1.5} strokeDasharray={hole ? '3 2' : undefined} />
      {!hole && (
        <T x={x + 20} y={y + 18.5} s={12} f={f} a="middle">
          {id}
        </T>
      )}
    </g>
  );
}

/** A page window: an outline over five slots from slot `a`, with its name above, shown by `k`. */
function Win({ a, y, k, label, f = C.focus }: { a: number; y: number; k: number; label: string; f?: string }) {
  if (k <= 0) return null;
  return (
    <g opacity={k}>
      <rect x={SX(a) - 4} y={y - 4} width={240} height={36} rx={5} fill="none" stroke={f} strokeWidth={2} />
      <T x={SX(a) + 116} y={y - 10} s={11} f={f} a="middle">
        {label}
      </T>
    </g>
  );
}

/** A small upward caret under a box at x, marking where the cursor sits. */
function Caret({ x, y, k }: { x: number; y: number; k: number }) {
  return <path d={`M${x} ${y} l-6 9 h12 z`} fill={C.focus} opacity={k} />;
}

/** A reply arrow from x1 back left toward x2, drawn by `k`, with a small label above it. */
function Back({ x1, x2, y, k, label, f = C.crema }: { x1: number; x2: number; y: number; k: number; label?: string; f?: string }) {
  if (k <= 0) return null;
  const x = lerp(x1, x2, k);
  return (
    <g>
      <line x1={x1} y1={y} x2={x} y2={y} stroke={f} strokeWidth={1.8} />
      <path d={`M${x} ${y} l8 -5 v10 z`} fill={f} />
      {label && (
        <T x={(x1 + x2) / 2} y={y + 18} s={11} f={f} a="middle">
          {label}
        </T>
      )}
    </g>
  );
}

const LET = 'ABCDEFGHIJ'.split('');

// 0 · Hook. A source list of fifteen rows; three page windows step across it while the pulled copy builds below:
// one row lands twice, one is never read, and the run still reports success.
export function Hook({ t }: StepCtx) {
  const pulled = [0, 1, 2, 3, 4, 4, 5, 6, 7, 8, 10, 11, 12, 13, 14];
  const pg = (p: number) => easeOut(seg(t, 0.4 + p * 0.8, 0.8 + p * 0.8));
  const flag = easeOut(seg(t, 2.8, 3.2));
  return (
    <Svg label="an offset-paged nightly pull over a live, growing list: rows duplicated, rows missing, counted directly." h={200}>
      <T x={25} y={36} s={11} f={C.latte}>
        source list
      </T>
      {Array.from({ length: 15 }, (_, i) => (
        <rect
          key={i}
          x={25 + i * 34}
          y={46}
          width={28}
          height={22}
          rx={3}
          fill={C.cocoa}
          stroke={i === 9 && flag > 0 ? C.cherryText : C.mocha}
          strokeWidth={1.5}
          strokeDasharray={i === 9 && flag > 0 ? '3 2' : undefined}
        />
      ))}
      {[0, 1, 2].map((p) => {
        const k = seg(t, 0.4 + p * 0.8, 1.2 + p * 0.8);
        return k > 0 && k < 1 ? <rect key={p} x={22 + p * 170} y={42} width={168} height={30} rx={4} fill="none" stroke={C.focus} strokeWidth={2} /> : null;
      })}
      {flag > 0 && (
        <T x={345} y={36} s={11} f={C.cherryText} a="middle" o={flag}>
          never read
        </T>
      )}
      <T x={25} y={106} s={11} f={C.latte} o={pg(0)}>
        pulled
      </T>
      {pulled.map((r, j) => (
        <rect key={j} x={25 + j * 34} y={116} width={28} height={22} rx={3} fill={C.cocoa} stroke={j === 5 && flag > 0 ? C.cherryText : C.mocha} strokeWidth={1.5} opacity={pg(Math.floor(j / 5))} />
      ))}
      {flag > 0 && (
        <T x={209} y={158} s={11} f={C.cherryText} a="middle" o={flag}>
          read twice
        </T>
      )}
      {t >= 3.5 && (
        <g opacity={easeOut(seg(t, 3.5, 3.9))}>
          <MiniTick x={25} y={184} k={easeOut(seg(t, 3.6, 4.0))} />
          <T x={45} y={190} s={13} f={C.focus}>
            pull reports success
          </T>
        </g>
      )}
    </Svg>
  );
}

// 1 · Predict. Ten rows and a cursor parked under the fifth; once answered, a row ahead of the cursor is deleted and
// leaves a hole the cursor can never name.
export function PredictKeysetFix({ t, answer }: StepCtx) {
  const s = useSinceAnswer(answer !== null);
  const gone = answer !== null ? easeOut(seg(s, 0.2, 0.8)) : 0;
  return (
    <Svg label="a keyset cursor pages the identical list under the identical writes. Which problem does it fix?" h={200}>
      {LET.map((id, i) => (
        <g key={i}>
          {i === 7 && gone > 0 && <LBox x={SX(i)} y={50} id={id} hole stroke={C.cherryText} o={gone} />}
          <LBox x={SX(i)} y={50} id={id} o={easeOut(seg(t, 0.1 + i * 0.06, 0.4 + i * 0.06)) * (i === 7 ? 1 - gone : 1)} />
        </g>
      ))}
      <Win a={0} y={50} k={easeOut(seg(t, 0.8, 1.2))} label="read so far" />
      <Caret x={SX(4) + 20} y={84} k={easeOut(seg(t, 1.2, 1.6))} />
      {gone <= 0 && (
        <T x={SX(4) + 20} y={112} s={11} f={C.focus} a="middle" o={easeOut(seg(t, 1.3, 1.7))}>
          cursor: last row seen
        </T>
      )}
      {gone > 0 && (
        <T x={SX(7) + 20} y={112} s={11} f={C.cherryText} a="middle" o={gone}>
          deleted unread
        </T>
      )}
      <AnswerRow y={175} label="it fixes" answer={answer} value="duplicates only" k={easeOut(seg(t, 1.8, 2.4))} />
    </Svg>
  );
}

// 2 · Offset drift. Top: an insert at the head shifts every row one slot right, so page two re-reads E. Bottom: a
// delete inside the read part shifts every row left, so F slides into the read zone and is never shown.
export function RevealOffsetMeasured({ t }: StepCtx) {
  const sh = easeInOut(seg(t, 1.0, 1.6));
  const nk = easeOut(seg(t, 1.3, 1.8));
  const dup = t >= 2.3;
  const del = easeOut(seg(t, 3.3, 3.7));
  const back = easeInOut(seg(t, 3.7, 4.1));
  const miss = t >= 4.3;
  return (
    <Svg label="an insert re-reads a row already seen; a delete skips a row that never gets read." h={220}>
      {t >= 0.9 && (
        <T x={25} y={22} s={11} f={C.latte} o={easeOut(seg(t, 0.9, 1.2))}>
          insert at the head
        </T>
      )}
      {nk > 0 && <LBox x={SX(0)} y={lerp(14, 32, nk)} id="N" o={nk} stroke={C.second} />}
      {LET.map((id, i) => (
        <LBox key={i} x={SX(i + sh)} y={32} id={id} stroke={i === 4 && dup ? C.cherryText : C.mocha} />
      ))}
      <Win a={0} y={32} k={t < 0.9 ? easeOut(seg(t, 0.2, 0.5)) : 0} label="page 1" />
      <Win a={5} y={32} k={t < 2.7 ? easeOut(seg(t, 1.9, 2.2)) : 0} label="page 2" f={C.cherryText} />
      {dup && (
        <T x={SX(5) + 20} y={84} s={11} f={C.cherryText} a="middle" o={easeOut(seg(t, 2.3, 2.6))}>
          E read twice
        </T>
      )}
      {t >= 2.7 && t < 4.0 && (
        <T x={575} y={122} s={11} f={C.latte} a="end" o={easeOut(seg(t, 2.7, 3.0))}>
          delete, already read
        </T>
      )}
      {t >= 2.7 &&
        LET.map((id, i) => {
          if (i === 1) return <LBox key={i} x={SX(1)} y={132} id={id} o={(1 - del) * easeOut(seg(t, 2.7, 3.0))} />;
          const x = i > 1 ? SX(i - back) : SX(i);
          return <LBox key={i} x={x} y={132} id={id} o={easeOut(seg(t, 2.7, 3.0))} stroke={i === 5 && miss ? C.cherryText : C.mocha} />;
        })}
      <Win a={0} y={132} k={t < 3.3 ? easeOut(seg(t, 2.9, 3.2)) : 0} label="page 1" />
      <Win a={5} y={132} k={easeOut(seg(t, 4.1, 4.4))} label="page 2" />
      {miss && (
        <T x={SX(4) + 20} y={184} s={11} f={C.cherryText} a="middle" o={easeOut(seg(t, 4.3, 4.6))}>
          F never read
        </T>
      )}
    </Svg>
  );
}

// 3 · Keyset. Top: the cursor rides under E through the insert, so page two starts after E: no duplicate. Bottom: G
// is deleted ahead of the cursor and page two simply never sees it.
export function RevealKeysetMeasured({ t }: StepCtx) {
  const sh = easeInOut(seg(t, 1.0, 1.6));
  const nk = easeOut(seg(t, 1.3, 1.8));
  const ok = t >= 2.3;
  const on2 = t >= 2.7;
  const del = easeOut(seg(t, 3.3, 3.7));
  const miss = t >= 4.2;
  return (
    <Svg label="the identical writes, read by a cursor naming the last row seen instead of a position." h={220}>
      {t >= 0.9 && (
        <T x={25} y={22} s={11} f={C.latte} o={easeOut(seg(t, 0.9, 1.2))}>
          insert at the head
        </T>
      )}
      {nk > 0 && <LBox x={SX(0)} y={lerp(14, 32, nk)} id="N" o={nk} stroke={C.second} />}
      {LET.map((id, i) => (
        <LBox key={i} x={SX(i + sh)} y={32} id={id} />
      ))}
      <Win a={0} y={32} k={t < 0.9 ? easeOut(seg(t, 0.2, 0.5)) : 0} label="page 1" />
      <Caret x={SX(4 + sh) + 20} y={66} k={easeOut(seg(t, 0.5, 0.8))} />
      <Win a={6} y={32} k={t < 2.7 ? easeOut(seg(t, 1.9, 2.2)) : 0} label="after E" />
      {ok && (
        <T x={SX(6) + 116} y={84} s={11} f={C.focus} a="middle" o={easeOut(seg(t, 2.3, 2.6))}>
          no duplicates
        </T>
      )}
      {on2 && t < 3.8 && (
        <T x={575} y={122} s={11} f={C.latte} a="end" o={easeOut(seg(t, 2.7, 3.0))}>
          delete, not yet read
        </T>
      )}
      {on2 &&
        LET.map((id, i) =>
          i === 6 ? (
            <g key={i}>
              {del > 0 && <LBox x={SX(i)} y={132} id={id} hole stroke={C.cherryText} o={del} />}
              <LBox x={SX(i)} y={132} id={id} o={(1 - del) * easeOut(seg(t, 2.7, 3.0))} />
            </g>
          ) : (
            <LBox key={i} x={SX(i)} y={132} id={id} o={easeOut(seg(t, 2.7, 3.0))} />
          ),
        )}
      <Win a={0} y={132} k={t >= 2.9 && t < 3.3 ? easeOut(seg(t, 2.9, 3.1)) : 0} label="page 1" />
      {on2 && <Caret x={SX(4) + 20} y={166} k={easeOut(seg(t, 3.0, 3.3))} />}
      <Win a={5} y={132} k={easeOut(seg(t, 3.9, 4.2))} label="after E" />
      {miss && (
        <T x={SX(6) + 20} y={190} s={11} f={C.cherryText} a="middle" o={easeOut(seg(t, 4.2, 4.5))}>
          G still missed
        </T>
      )}
    </Svg>
  );
}

// 4 · Token bucket. Five tokens; each call spends one and the arrow fires; the sixth call finds the bucket empty and
// comes back 429 with a retry-after; then one token drips back in.
export function RevealTokenBucket({ t }: StepCtx) {
  const call = (i: number) => seg(t, 0.4 + i * 0.35, 0.7 + i * 0.35);
  const spent = [0, 1, 2, 3, 4].map((i) => (t >= 0.7 + i * 0.35 ? 1 : 0)).reduce((a: number, b: number) => a + b, 0);
  const active = [0, 1, 2, 3, 4, 5].find((i) => call(i) > 0 && call(i) < 1);
  const refused = t >= 2.5;
  const drip = easeOut(seg(t, 3.3, 3.9));
  return (
    <Svg label="a token-bucket limiter: a token removed per call, refilled at a fixed rate, empty means a four twenty-nine." h={200}>
      <T x={120} y={30} s={11} f={C.latte} a="middle">
        bucket
      </T>
      <path d="M70 40 v130 h100 v-130" fill="none" stroke={C.mocha} strokeWidth={2} />
      {[0, 1, 2, 3, 4].map((i) => (
        <circle key={i} cx={120} cy={155 - i * 26} r={10} fill={C.latte} opacity={i >= 5 - spent ? 0 : easeOutBack(seg(t, 0, 0.3 + i * 0.05))} />
      ))}
      {drip > 0 && <circle cx={120} cy={lerp(50, 155, drip)} r={10} fill={C.focus} />}
      {active !== undefined && <Req x1={180} x2={420} y={100} k={easeOut(call(active))} label="call" f={active === 5 ? C.cherryText : C.crema} />}
      <Cell x={430} y={86} w={130} label="API" />
      {t >= 0.7 && !refused && (
        <T x={495} y={140} s={13} f={C.focus} a="middle">
          200
        </T>
      )}
      {refused && (
        <g opacity={easeOut(seg(t, 2.5, 2.8))}>
          <T x={495} y={140} s={13} f={C.cherryText} a="middle">
            429
          </T>
          <T x={495} y={160} s={11} f={C.cherryText} a="middle">
            + retry-after
          </T>
        </g>
      )}
      {drip > 0 && (
        <T x={120} y={192} s={11} f={C.focus} a="middle" o={drip}>
          refill: 2 per second
        </T>
      )}
    </Svg>
  );
}

// 5 · Retry-after, measured. Two call lanes drawn left to right: the obedient client spends its burst, takes one 429,
// sleeps as told, and calls again; the guesser fills its lane with cherry 429s.
export function RevealRetryAfterMeasured({ t }: StepCtx) {
  const X = 25 + 520 * easeInOut(seg(t, 0.4, 3.6));
  const ob: { x: number; bad: boolean }[] = [];
  const nv: { x: number; bad: boolean }[] = [];
  for (let i = 0; i < 5; i++) {
    ob.push({ x: 30 + i * 10, bad: false });
    nv.push({ x: 30 + i * 10, bad: false });
  }
  for (let x = 80; x <= 540; x += 32) {
    ob.push({ x, bad: true });
    ob.push({ x: x + 28, bad: false });
  }
  for (let x = 80; x <= 540; x += 4) nv.push({ x, bad: (x - 80) % 32 !== 28 });
  const lane = (arr: { x: number; bad: boolean }[], y: number) =>
    arr.filter((p) => p.x <= X && p.x <= 545).map((p, i) => <line key={i} x1={p.x} y1={y - 12} x2={p.x} y2={y + 12} stroke={p.bad ? C.cherryText : C.focus} strokeWidth={p.bad ? 1.2 : 2.4} />);
  return (
    <Svg label="obeying retry-after wastes close to the minimum calls; a short fixed guess wastes far more." h={220}>
      <T x={25} y={36} s={11} f={C.latte}>
        obeys retry-after
      </T>
      {lane(ob, 66)}
      <T x={25} y={116} s={11} f={C.latte}>
        guesses a short fixed pause
      </T>
      {lane(nv, 146)}
      {t >= 3.7 && (
        <T x={300} y={200} s={13} f={C.cherryText} a="middle" o={easeOut(seg(t, 3.7, 4.1))}>
          the guess wastes over 5× the calls
        </T>
      )}
    </Svg>
  );
}

const NC = 12;
// 6 · Contention. Twelve clients fan in on one slot; one wins, the rest back off by the same amount together and
// return together, colliding on the same later round.
export function RevealContention({ t }: StepCtx) {
  const r1 = easeOut(seg(t, 0.4, 1.0));
  const off = easeInOut(seg(t, 1.4, 2.0)) - easeInOut(seg(t, 2.4, 3.0));
  const r2 = easeOut(seg(t, 3.0, 3.5));
  const fan = t < 1.4 ? r1 : t >= 3.0 ? r2 : 0;
  const round = t >= 3.0 ? 1 : 0;
  return (
    <Svg label="many clients competing for one resource; every round's losers back off before trying again." h={200}>
      <T x={25} y={20} s={11} f={C.latte}>
        {NC} clients
      </T>
      {Array.from({ length: NC }, (_, i) => {
        const y = 34 + i * 11;
        const win = i === round;
        const x = 120 - (win ? 0 : 70 * off);
        return (
          <g key={i}>
            {fan > 0 && <line x1={x + 6} y1={y} x2={lerp(x + 6, 300, fan)} y2={lerp(y, 94, fan)} stroke={fan >= 1 && win ? C.focus : C.cherryText} strokeWidth={1.2} />}
            <circle cx={x} cy={y} r={4} fill={t >= 1.0 && win && t < 1.4 ? C.focus : C.latte} />
          </g>
        );
      })}
      <Cell x={300} y={80} w={130} label="one slot" />
      {t >= 1.6 && t < 3.0 && (
        <T x={445} y={64} s={11} f={C.latte} o={easeOut(seg(t, 1.6, 1.9))}>
          all back off
        </T>
      )}
      {t >= 1.6 && t < 3.0 && (
        <T x={445} y={80} s={11} f={C.latte} o={easeOut(seg(t, 1.6, 1.9))}>
          the same amount
        </T>
      )}
      {t >= 3.6 && (
        <T x={300} y={190} s={13} f={C.cherryText} a="middle" o={easeOut(seg(t, 3.6, 4.0))}>
          same backoff, same collision
        </T>
      )}
    </Svg>
  );
}

// 7 · Jitter, measured. Fixed backoff stacks every retry into tall spikes at the same instants; full jitter spreads
// them low and wide. Below, both totals shrink to roughly half under jitter.
export function RevealJitterMeasured({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.3, 1.2));
  const b = easeOut(seg(t, 1.3, 2.2));
  const spikes = [60, 130, 250, 420];
  const spread = Array.from({ length: 34 }, (_, i) => ({ x: 30 + i * 8, h: 6 + ((i * 7) % 5) * 3 }));
  const c = easeOut(seg(t, 2.6, 3.4));
  return (
    <Svg label="fixed backoff clusters every retry at the same instants; full jitter spreads them and costs less." h={220}>
      <T x={25} y={20} s={11} f={C.latte}>
        fixed backoff
      </T>
      <line x1={25} y1={74} x2={545} y2={74} stroke={C.mocha} strokeWidth={1.2} />
      {spikes.map((x, i) => (
        <rect key={i} x={x} y={74 - 44 * a} width={10} height={44 * a} fill={C.cherryText} />
      ))}
      <T x={25} y={96} s={11} f={C.latte} o={easeOut(seg(t, 1.2, 1.5))}>
        full jitter
      </T>
      <line x1={25} y1={140} x2={545} y2={140} stroke={C.mocha} strokeWidth={1.2} />
      {spread.map((p, i) => (
        <rect key={i} x={p.x} y={140 - p.h * b} width={5} height={p.h * b} fill={C.focus} />
      ))}
      <T x={25} y={175} s={11} f={C.latte} o={c}>
        requests
      </T>
      <rect x={150} y={162} width={290 * c} height={7} fill={C.latte} />
      <rect x={150} y={172} width={145 * c} height={7} fill={C.focus} />
      <T x={25} y={205} s={11} f={C.latte} o={c}>
        time to finish
      </T>
      <rect x={150} y={192} width={290 * c} height={7} fill={C.latte} />
      <rect x={150} y={202} width={145 * c} height={7} fill={C.focus} />
      {t >= 3.6 && (
        <T x={455} y={190} s={11} f={C.focus} o={easeOut(seg(t, 3.6, 4.0))}>
          about half
        </T>
      )}
    </Svg>
  );
}

// 8 · Idempotency key. The client sends a write with its key; the server does the work once and saves the reply; the
// retry with the same key gets the saved reply back and no second write happens.
export function RevealIdempotencyKey({ t }: StepCtx) {
  const w1 = easeOut(seg(t, 0.5, 1.1));
  const done = easeOut(seg(t, 1.2, 1.6));
  const r1 = easeOut(seg(t, 1.6, 2.1));
  const w2 = easeOut(seg(t, 2.6, 3.1));
  const r2 = easeOut(seg(t, 3.3, 3.8));
  return (
    <Svg label="a client-generated key up to two hundred fifty-five characters; the first response saved and replayed." h={200}>
      <Cell x={25} y={70} w={120} label="client" />
      <T x={25} y={128} s={11} f={C.latte} o={easeOut(seg(t, 0.2, 0.5))}>
        key: up to 255 chars
      </T>
      <Cell x={400} y={70} w={160} label="server" />
      {t < 2.5 && <Req x1={150} x2={395} y={78} k={w1} label="write + key" />}
      {t >= 2.5 && <Req x1={150} x2={395} y={78} k={w2} label="retry, same key" />}
      {t < 2.5 && <Back x1={395} x2={150} y={92} k={r1} label="reply" />}
      {t >= 2.5 && <Back x1={395} x2={150} y={92} k={r2} label="the saved reply" f={C.focus} />}
      <T x={480} y={54} s={11} f={C.focus} a="middle" o={done}>
        did the work once
      </T>
      <Cell x={400} y={140} w={160} label="saved reply" o={easeOut(seg(t, 1.8, 2.2))} stroke={C.focus} />
      {t >= 3.9 && (
        <T x={25} y={180} s={13} f={C.focus} o={easeOut(seg(t, 3.9, 4.3))}>
          no second write
        </T>
      )}
    </Svg>
  );
}

// 9 · Idempotency, measured. Three attempts with the same key; only the first writes, the other two are replayed;
// every reply identical, and the ledger records one charge.
export function RevealIdempotencyMeasured({ t }: StepCtx) {
  const at = (i: number) => easeOut(seg(t, 0.3 + i * 0.9, 0.9 + i * 0.9));
  return (
    <Svg label="the identical write retried three times with the same key: one charge, every time the same response." h={220}>
      {[0, 1, 2].map((i) => (
        <g key={i}>
          <Cell x={25} y={30 + i * 50} w={140} label={`attempt ${i + 1}`} o={at(i)} />
          <Req x1={170} x2={375} y={44 + i * 50} k={at(i)} label={i === 0 ? 'wrote it' : 'replayed'} f={i === 0 ? C.crema : C.focus} />
          <Cell x={380} y={30 + i * 50} w={170} label="identical reply" o={easeOut(seg(t, 0.7 + i * 0.9, 1.0 + i * 0.9))} />
        </g>
      ))}
      {t >= 3.3 && (
        <g opacity={easeOut(seg(t, 3.3, 3.7))}>
          <T x={25} y={200} s={13} f={C.focus}>
            charges recorded: 1
          </T>
          <circle cx={230} cy={195} r={6} fill={C.focus} />
        </g>
      )}
    </Svg>
  );
}

// 10 · Recap. Four failures, each with an arrow to its one fix; then the credential underneath, rotated by accepting
// the old and the new together for a while.
export function Recap({ t }: StepCtx) {
  const fails = ['position drifts', 'limit ignored', 'lockstep clients', 'retry or repeat?'];
  const fixes = ['keyset cursor', 'retry-after', 'jitter', 'idempotency key'];
  const cr = easeOut(seg(t, 3.0, 3.4));
  const both = easeOut(seg(t, 3.9, 4.4));
  return (
    <Svg label="four fixes: keyset cursor, retry-after, jitter, idempotency key. One thing none of them touch." h={260}>
      {fails.map((f, i) => {
        const k = easeOut(seg(t, 0.2 + i * 0.6, 0.6 + i * 0.6));
        return (
          <g key={i}>
            <Cell x={25} y={20 + i * 40} w={210} label={f} o={k} stroke={C.cherryText} />
            <Req x1={240} x2={338} y={34 + i * 40} k={easeOut(seg(t, 0.4 + i * 0.6, 0.8 + i * 0.6))} />
            <Cell x={345} y={20 + i * 40} w={200} label={fixes[i]} o={easeOut(seg(t, 0.6 + i * 0.6, 0.9 + i * 0.6))} stroke={C.focus} />
          </g>
        );
      })}
      <Cell x={25} y={190} w={210} label="the credential" o={cr} />
      <Req x1={240} x2={338} y={204} k={easeOut(seg(t, 3.5, 3.9))} />
      <Cell x={345} y={190} w={90} label="old" o={both} />
      <Cell x={455} y={190} w={90} label="new" o={both} stroke={C.second} />
      {both > 0 && (
        <T x={445} y={242} s={11} f={C.latte} a="middle" o={both}>
          accept both for a while
        </T>
      )}
    </Svg>
  );
}

// 11 · Prove it. Two workers fire the same refresh token at once; once answered, the first gets a new token and the
// second is turned away with a 400.
export function ProveIt({ t, answer }: StepCtx) {
  const s = useSinceAnswer(answer !== null);
  const v = answer !== null ? easeOut(seg(s, 0.2, 0.8)) : 0;
  const go = easeOut(seg(t, 0.8, 1.5));
  return (
    <Svg label="two workers hold the same refresh token and race to refresh it at once. What happens?" h={200}>
      <Cell x={25} y={30} w={130} label="worker A" o={easeOut(seg(t, 0, 0.4))} />
      <Cell x={25} y={100} w={130} label="worker B" o={easeOut(seg(t, 0.1, 0.5))} stroke={v > 0 ? C.cherryText : C.mocha} />
      <Cell x={410} y={65} w={150} label="auth server" o={easeOut(seg(t, 0.3, 0.7))} />
      <Req x1={160} x2={405} y={44} k={go} label="refresh rt-v1" />
      <Req x1={160} x2={405} y={114} k={go} label="refresh rt-v1" />
      {v > 0 && (
        <T x={25} y={76} s={11} f={C.focus} o={v}>
          new token
        </T>
      )}
      {v > 0 && (
        <T x={25} y={146} s={11} f={C.cherryText} o={v}>
          400 invalid_grant
        </T>
      )}
      <AnswerRow y={182} label="second worker" answer={answer} value="locked out" f={C.cherryText} k={easeOut(seg(t, 1.6, 2.2))} />
    </Svg>
  );
}
