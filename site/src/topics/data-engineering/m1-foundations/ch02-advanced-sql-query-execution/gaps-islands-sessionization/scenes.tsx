import { useEffect, useState } from 'react';
import type { StepCtx } from '../../../../../reels/types';
import { clamp, easeInOut, easeOut, easeOutBack, lerp, seg } from '../../../../../reels/anim';
import { C, Svg, T } from '../../../../../reels/kit';

// Colour grammar: caramel = a session start / the id, cherryText = a gap over the threshold, crema = data, latte = labels.
// One customer's clicks at minutes 0, 12, 25, 80, 95, 200, 202, 230; threshold 30 minutes.

const TIMES = [0, 12, 25, 80, 95, 200, 202, 230];
const GAP = [null, 12, 13, 55, 15, 105, 2, 28];
const FLAG = [1, 0, 0, 1, 0, 1, 0, 0];
const SESS = [1, 1, 1, 2, 2, 3, 3, 3];
// Events are spaced evenly, not by clock time: two clicks two minutes apart (200 and 202) would sit on top of each other.
const px = (m: number) => 50 + TIMES.indexOf(m) * (500 / 7);

function Axis({ y = 120, upTo = 8, color = (i: number) => C.crema }: { y?: number; upTo?: number; color?: (i: number) => string }) {
  return (
    <g>
      <line x1={25} y1={y} x2={575} y2={y} stroke={C.taupe} strokeWidth={2} />
      {TIMES.slice(0, upTo).map((m, i) => (
        <g key={i}>
          <circle cx={px(m)} cy={y} r={8} fill={color(i)} />
          <T x={px(m)} y={y + 28} s={13} f={C.latte} a="middle">
            {String(m)}
          </T>
        </g>
      ))}
    </g>
  );
}

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

// 1 · Timeline: the eight clicks drop onto the line one by one, then three outlines draw round the visits with the two long pauses between.
export function Timeline({ t }: StepCtx) {
  const g = easeInOut(seg(t, 2.3, 2.9));
  const visits = [
    [0, 25],
    [80, 95],
    [200, 230],
  ];
  return (
    <Svg label="Eight clicks land on a timeline and turn out to be three visits separated by two long gaps" h={260}>
      <line x1={25} y1={120} x2={575} y2={120} stroke={C.taupe} strokeWidth={2} />
      {TIMES.map((m, i) => {
        const d = seg(t, 0.15 + i * 0.25, 0.5 + i * 0.25);
        return (
          <g key={i} opacity={d > 0 ? 1 : 0}>
            <circle cx={px(m)} cy={lerp(30, 120, easeOutBack(d))} r={8} fill={C.crema} />
            <T x={px(m)} y={148} s={13} f={C.latte} a="middle" o={easeOut(d)}>
              {String(m)}
            </T>
          </g>
        );
      })}
      {visits.map((r, i) => (
        <rect
          key={i}
          x={px(r[0]) - 16}
          y={92}
          width={px(r[1]) - px(r[0]) + 32}
          height={70}
          rx={14}
          fill="none"
          stroke={C.caramel}
          strokeWidth={2}
          pathLength={1}
          strokeDasharray="1"
          strokeDashoffset={1 - g}
        />
      ))}
      {[
        [25, 80],
        [95, 200],
      ].map(([a, b], i) => (
        <line key={i} x1={px(a) + 18} y1={104} x2={px(b) - 18} y2={104} stroke={C.cherryText} strokeWidth={2} strokeDasharray="4 4" opacity={easeOut(seg(t, 2.8, 3.1))} />
      ))}
      <T x={300} y={210} s={15} f={C.caramel} a="middle" o={easeOut(seg(t, 2.9, 3.3))}>
        3 visits, 2 gaps
      </T>
    </Svg>
  );
}

// 2 · LAG: from each dot an arc reaches back to the one before and the gap pops out underneath; the first has nothing behind it.
export function Lag({ t }: StepCtx) {
  return (
    <Svg label="LAG reads the previous row; subtracting gives the gap since the last event; the first event has no previous row, so NULL" h={300}>
      <Axis />
      {TIMES.map((m, i) => {
        if (i === 0) return null;
        const d = easeInOut(seg(t, 0.6 + (i - 1) * 0.38, 0.9 + (i - 1) * 0.38));
        const x0 = px(TIMES[i - 1]);
        const x1 = px(m);
        return <path key={i} d={`M${x1} 108 Q ${(x0 + x1) / 2} 70 ${x0} 108`} fill="none" stroke={C.caramel} strokeWidth={2} pathLength={1} strokeDasharray="1" strokeDashoffset={1 - d} />;
      })}
      {GAP.map((gp, i) => {
        const k = easeOutBack(seg(t, i === 0 ? 0.2 : 0.85 + (i - 1) * 0.38, i === 0 ? 0.5 : 1.15 + (i - 1) * 0.38));
        return (
          <T key={i} x={px(TIMES[i])} y={200} s={14} f={gp === null || gp > 30 ? C.cherryText : C.caramel} a="middle" w={gp !== null && gp > 30 ? 700 : 400} o={clamp(k)}>
            {gp === null ? 'NULL' : String(gp)}
          </T>
        );
      })}
      <T x={25} y={176} s={13} f={C.latte}>
        gap since the previous event (minutes)
      </T>
    </Svg>
  );
}

// 3 · Predict: the first event reaches back into nothing. After the answer, NULL lands and the dot lights as a visit start.
export function FirstPredict({ t, answer }: StepCtx) {
  const answered = answer !== null;
  const s = useSinceAnswer(answered);
  const reach = easeInOut(seg(t, 0.2, 0.9));
  const lit = answered ? easeOut(seg(s, 0.7, 1.1)) : 0;
  return (
    <Svg label="LAG for the first event of a customer returns NULL, the signal that a visit starts here" h={240}>
      <line x1={80} y1={100} x2={lerp(80, 30, reach)} y2={100} stroke={C.latte} strokeWidth={1.5} strokeDasharray="4 4" />
      <circle cx={80} cy={100} r={9 + 3 * lit} fill={lit > 0 ? C.caramel : C.crema} />
      <T x={80} y={130} s={13} f={C.latte} a="middle">
        first event
      </T>
      {!answered ? (
        <T x={300} y={110} s={48} f={C.caramel} a="middle" o={0.75 + 0.25 * Math.sin(t * 3)}>
          ?
        </T>
      ) : (
        <>
          <T x={300} y={lerp(80, 110, easeOutBack(seg(s, 0.1, 0.5)))} s={30} f={C.cherryText} a="middle" w={700} o={easeOut(seg(s, 0.1, 0.3))}>
            NULL
          </T>
          <T x={80} y={190} s={14} f={C.caramel} o={lit}>
            a visit starts here
          </T>
        </>
      )}
    </Svg>
  );
}

// 4 · Flags: each gap rises as a bar against a dashed 30-minute line; bars over it and the NULL turn red, and the flags 1 or 0 drop in under the dots.
export function Flags({ t }: StepCtx) {
  const base = 190;
  const line = easeInOut(seg(t, 1.4, 1.8));
  return (
    <Svg label="Rows with a NULL gap or a gap over 30 minutes are flagged 1 as session starts: 1, 0, 0, 1, 0, 1, 0, 0" h={300}>
      <T x={25} y={30} s={13} f={C.latte}>
        new session? gap NULL or over 30
      </T>
      <line x1={25} y1={base + 10} x2={575} y2={base + 10} stroke={C.taupe} strokeWidth={2} />
      {TIMES.map((m, i) => {
        const gp = GAP[i];
        const g = easeOut(seg(t, 0.2 + i * 0.12, 0.7 + i * 0.12));
        const h = gp === null ? 40 : Math.min(gp, 110) * 0.8;
        const over = gp === null || gp > 30;
        const f = easeOutBack(seg(t, 1.9 + i * 0.18, 2.2 + i * 0.18));
        return (
          <g key={i}>
            <rect
              x={px(m) - 9}
              y={base - h * g}
              width={18}
              height={h * g}
              rx={3}
              fill={gp === null ? 'none' : over && line > 0 ? C.cherry : C.mocha}
              stroke={gp === null ? C.cherryText : 'none'}
              strokeDasharray={gp === null ? '3 3' : undefined}
            />
            <circle cx={px(m)} cy={base + 10} r={7} fill={FLAG[i] && f > 0 ? C.caramel : C.crema} />
            <T x={px(m)} y={base + 40} s={13} f={C.latte} a="middle">
              {String(m)}
            </T>
            <T x={px(m)} y={base + 72} s={18} f={FLAG[i] ? C.caramel : C.taupe} a="middle" w={700} o={clamp(f)}>
              {String(FLAG[i])}
            </T>
          </g>
        );
      })}
      <line x1={25} y1={base - 24} x2={lerp(25, 575, line)} y2={base - 24} stroke={C.cherryText} strokeWidth={1.5} strokeDasharray="6 4" />
      <T x={575} y={base - 32} s={13} f={C.cherryText} a="end" o={easeOut(seg(t, 1.7, 2.0))}>
        30
      </T>
    </Svg>
  );
}

// 5 · Running sum: a counter chip walks the dots, ticking up by one at each flag; the ids land under the dots and the three visits are bracketed.
export function RunningSum({ t }: StepCtx) {
  let pos = 0;
  for (let j = 1; j < 8; j++) pos += easeInOut(seg(t, 0.4 + (j - 1) * 0.42, 0.7 + (j - 1) * 0.42));
  const at = Math.round(pos);
  const brk = easeOut(seg(t, 3.6, 4.1));
  const groups = [
    [0, 2],
    [3, 4],
    [5, 7],
  ];
  return (
    <Svg label="The running sum of the flags is the session id: 1, 1, 1, 2, 2, 3, 3, 3" h={300}>
      <Axis color={(i) => (i <= at && t > 0.3 ? C.caramel : C.cocoa)} />
      <g opacity={easeOut(seg(t, 0.1, 0.3))}>
        <rect x={50 + pos * (500 / 7) - 24} y={64} width={48} height={28} rx={8} fill={C.roast} stroke={C.caramel} strokeWidth={FLAG[at] && Math.abs(pos - at) < 0.1 ? 3 : 1.5} />
        <T x={50 + pos * (500 / 7)} y={83} s={14} f={C.caramel} a="middle" w={700}>
          {`Σ ${SESS[at]}`}
        </T>
      </g>
      {FLAG.map((f, i) => (
        <T key={i} x={px(TIMES[i])} y={186} s={14} f={C.taupe} a="middle">
          {String(f)}
        </T>
      ))}
      {SESS.map((s, i) => (
        <T key={i} x={px(TIMES[i])} y={226} s={20} f={C.caramel} a="middle" w={700} o={t > 0.3 && i <= at ? 1 : 0.1}>
          {String(s)}
        </T>
      ))}
      {groups.map(([a, b], k) => (
        <path key={k} d={`M${px(TIMES[a]) - 12} 234 v6 H${px(TIMES[b]) + 12} v-6`} fill="none" stroke={C.caramel} strokeWidth={1.5} opacity={brk} />
      ))}
      <T x={25} y={274} s={13} f={C.latte} o={brk}>
        session id = running sum of the flags
      </T>
    </Svg>
  );
}

// 6 · Predict: the flags in boxes. After the answer, the running total writes under the first four and the fourth box lights.
export function FourthPredict({ t, answer }: StepCtx) {
  const answered = answer !== null;
  const s = useSinceAnswer(answered);
  const run = [1, 1, 1, 2];
  return (
    <Svg label="Flags 1, 0, 0, 1, 0, 1, 0, 0; the running sum through the fourth row is 2, the second session" h={240}>
      {FLAG.map((f, i) => (
        <g key={i} opacity={easeOut(seg(t, i * 0.08, i * 0.08 + 0.3))}>
          <rect x={30 + i * 66} y={50} width={54} height={44} rx={8} fill={C.cocoa} stroke={i === 3 ? C.caramel : C.mocha} strokeWidth={i === 3 ? 3 : 1} />
          <T x={57 + i * 66} y={79} s={18} f={C.crema} a="middle">
            {String(f)}
          </T>
        </g>
      ))}
      {answered &&
        run.map((r, i) => (
          <T key={i} x={57 + i * 66} y={128} s={16} f={C.caramel} a="middle" w={700} o={easeOut(seg(s, 0.1 + i * 0.25, 0.3 + i * 0.25))}>
            {String(r)}
          </T>
        ))}
      {!answered ? (
        <T x={228} y={190} s={44} f={C.caramel} a="middle" o={0.75 + 0.25 * Math.sin(t * 3)}>
          ?
        </T>
      ) : (
        <T x={228} y={190} s={22} f={C.caramel} a="middle" w={700} o={easeOut(seg(s, 1.1, 1.5))}>
          1 + 0 + 0 + 1 = 2
        </T>
      )}
    </Svg>
  );
}

// 7 · Difference trick: day, row number and their difference fill column by column; a day ruler shows the missing days, and each island is bracketed.
export function Difference({ t }: StepCtx) {
  const days = [1, 2, 3, 5, 6, 9];
  const rn = [1, 2, 3, 4, 5, 6];
  const col = (diff: number) => (diff === 0 ? C.caramel : diff === 1 ? C.cinnamon : C.cherryText);
  const ruler = easeOut(seg(t, 2.6, 3.0));
  const isl = [
    [1, 3, 0],
    [5, 6, 1],
    [9, 9, 3],
  ];
  return (
    <Svg label="Day minus row number is constant inside a run of consecutive days: 0, 0, 0, 1, 1, 3, three islands" h={300}>
      <T x={25} y={36} s={13} f={C.latte}>
        day
      </T>
      <T x={25} y={84} s={13} f={C.latte}>
        row number
      </T>
      <T x={25} y={132} s={13} f={C.caramel}>
        day − row number
      </T>
      {days.map((d, i) => {
        const a = easeOut(seg(t, 0.3 + i * 0.35, 0.6 + i * 0.35));
        const b = easeOutBack(seg(t, 0.55 + i * 0.35, 0.85 + i * 0.35));
        const diff = d - rn[i];
        return (
          <g key={i} opacity={clamp(a)}>
            <T x={205 + i * 62} y={36} s={16} f={C.crema} a="middle">
              {String(d)}
            </T>
            <T x={205 + i * 62} y={84} s={16} f={C.crema} a="middle">
              {String(rn[i])}
            </T>
            <g opacity={clamp(b)}>
              <rect x={181 + i * 62} y={100} width={48} height={42} rx={8} fill="none" stroke={col(diff)} strokeWidth={2} />
              <T x={205 + i * 62} y={128} s={18} f={col(diff)} a="middle" w={700}>
                {String(diff)}
              </T>
            </g>
          </g>
        );
      })}
      {Array.from({ length: 9 }, (_, k) => {
        const on = days.includes(k + 1);
        return (
          <g key={k} opacity={ruler}>
            <rect x={170 + k * 44} y={190} width={38} height={26} rx={5} fill={on ? C.cocoa : 'none'} stroke={on ? C.crema : C.taupe} strokeDasharray={on ? undefined : '3 3'} />
            <T x={189 + k * 44} y={208} s={13} f={on ? C.crema : C.taupe} a="middle">
              {String(k + 1)}
            </T>
          </g>
        );
      })}
      {isl.map(([a, b, diff], k) => {
        const d = easeInOut(seg(t, 3.0 + k * 0.25, 3.4 + k * 0.25));
        return <path key={k} d={`M${170 + (a - 1) * 44 + 2} 224 v6 H${170 + (b - 1) * 44 + 36} v-6`} fill="none" stroke={col(diff)} strokeWidth={2} opacity={d} />;
      })}
      <T x={25} y={274} s={15} f={C.caramel} o={easeOut(seg(t, 3.8, 4.2))}>
        same value = same unbroken run
      </T>
    </Svg>
  );
}

// 8 · Predict: two techniques and a 45-minute silence between two consecutive rows. After the answer, the difference trick is crossed out and the flag ticked.
export function TechniquePredict({ t, answer }: StepCtx) {
  const answered = answer !== null;
  const s = useSinceAnswer(answered);
  const x = answered ? easeOut(seg(s, 0.2, 0.6)) : 0;
  const tick = answered ? easeOut(seg(s, 0.6, 1.0)) : 0;
  const line = easeInOut(seg(t, 0.2, 0.9));
  return (
    <Svg label="For a visit that ends after 30 minutes of silence, the running sum of a flag fits; the row-number difference cannot express a threshold" h={260}>
      <rect x={25} y={40} width={250} height={50} rx={8} fill={C.cocoa} stroke={answered ? C.cherryText : C.mocha} />
      <T x={150} y={70} s={14} f={C.crema} a="middle">
        row-number difference
      </T>
      <rect x={325} y={40} width={250} height={50} rx={8} fill={C.cocoa} stroke={answered ? C.caramel : C.mocha} strokeWidth={answered ? 3 : 1} />
      <T x={450} y={70} s={14} f={C.crema} a="middle">
        running sum of a flag
      </T>
      <g stroke={C.cherryText} strokeWidth={3} opacity={x}>
        <line x1={137} y1={98} x2={137 + 26 * x} y2={98 + 26 * x} />
        <line x1={163} y1={98} x2={163 - 26 * x} y2={98 + 26 * x} />
      </g>
      <path d="M440 108 l7 7 l14 -16" fill="none" stroke={C.caramel} strokeWidth={3} strokeDasharray="40" strokeDashoffset={40 * (1 - tick)} />
      <line x1={150} y1={150} x2={lerp(150, 450, line)} y2={150} stroke={C.taupe} strokeWidth={2} strokeDasharray="5 5" />
      <circle cx={150} cy={150} r={8} fill={C.crema} />
      <circle cx={450} cy={150} r={8} fill={C.crema} opacity={line >= 1 ? 1 : 0} />
      <T x={300} y={136} s={13} f={C.cherryText} a="middle" o={easeOut(seg(t, 0.8, 1.1))}>
        45 min of silence
      </T>
      {!answered ? (
        <T x={300} y={220} s={40} f={C.caramel} a="middle" o={0.75 + 0.25 * Math.sin(t * 3)}>
          ?
        </T>
      ) : (
        <T x={300} y={214} s={14} f={C.latte} a="middle" o={easeOut(seg(s, 0.9, 1.3))}>
          a threshold needs the gap itself
        </T>
      )}
    </Svg>
  );
}

// 9 · Ties: the two tied events land on the same spot; the start ring hops between them as the read order flips, and the session id under both never changes.
export function Ties({ t }: StepCtx) {
  const a = easeOutBack(seg(t, 0.4, 0.8));
  const b = easeOutBack(seg(t, 0.8, 1.2));
  const flip = t > 1.8 && t < 3.4 ? Math.floor((t - 1.8) / 0.4) % 2 : 0;
  return (
    <Svg label="Two events with the same timestamp: the gap between them is 0, so both get the same session id in any order" h={260}>
      <line x1={25} y1={110} x2={575} y2={110} stroke={C.taupe} strokeWidth={2} />
      <circle cx={100} cy={110} r={8} fill={C.crema} />
      <T x={250} y={92} s={13} f={C.cherryText} a="middle" o={easeOut(seg(t, 0.2, 0.5))}>
        gap over 30
      </T>
      <circle cx={400} cy={lerp(40, 102, clamp(a))} r={8} fill={C.caramel} opacity={a > 0 ? 1 : 0} />
      <circle cx={400} cy={lerp(40, 120, clamp(b))} r={8} fill={C.caramel} opacity={b > 0 ? 1 : 0} />
      <circle cx={400} cy={flip ? 120 : 102} r={13} fill="none" stroke={C.crema} strokeWidth={2} opacity={easeOut(seg(t, 1.5, 1.8))} />
      <T x={425} y={98} s={13} f={C.latte} o={easeOut(seg(t, 1.2, 1.5))}>
        gap 0
      </T>
      <T x={400} y={152} s={13} f={C.latte} a="middle" o={easeOut(seg(t, 1.2, 1.5))}>
        same timestamp
      </T>
      <T x={400} y={182} s={15} f={C.caramel} a="middle" w={700} o={easeOut(seg(t, 1.6, 1.9))}>
        session 2
      </T>
      <T x={300} y={230} s={15} f={C.caramel} a="middle" o={easeOut(seg(t, 3.4, 3.9))}>
        same session id, in any order
      </T>
    </Svg>
  );
}

// 10 · Compress: the time labels fade, the eight dots fly down into three session rows as pips, and each row's start, end and count appear.
export function Compress({ t }: StepCtx) {
  const lab = 1 - easeOut(seg(t, 0.2, 0.6));
  const head = easeOut(seg(t, 0.6, 1.0));
  const rows = [
    ['1', '0 – 25', '3'],
    ['2', '80 – 95', '2'],
    ['3', '200 – 230', '3'],
  ];
  const slot = [0, 1, 2, 0, 1, 0, 1, 2];
  return (
    <Svg label="Grouping by session turns eight events into three session rows, each with a start, an end and a count" h={300}>
      <line x1={25} y1={60} x2={575} y2={60} stroke={C.taupe} strokeWidth={2} opacity={1 - 0.8 * head} />
      {TIMES.map((m, i) => {
        const f = easeInOut(seg(t, 0.8 + i * 0.12, 1.5 + i * 0.12));
        return (
          <g key={i}>
            {lab > 0 && (
              <T x={px(m)} y={88} s={13} f={C.latte} a="middle" o={lab}>
                {String(m)}
              </T>
            )}
            <circle cx={lerp(px(m), 470 + slot[i] * 22, f)} cy={lerp(60, 181 + (SESS[i] - 1) * 36, f)} r={lerp(8, 6, f)} fill={f >= 1 ? C.caramel : C.crema} />
          </g>
        );
      })}
      <T x={25} y={150} s={13} f={C.latte} o={head}>
        session
      </T>
      <T x={150} y={150} s={13} f={C.latte} o={head}>
        start – end
      </T>
      <T x={330} y={150} s={13} f={C.latte} o={head}>
        events
      </T>
      {rows.map((r, i) => (
        <g key={r[0]} opacity={easeOut(seg(t, 2.4 + i * 0.3, 2.8 + i * 0.3))}>
          <T x={25} y={186 + i * 36} s={16} f={C.caramel} w={700}>
            {r[0]}
          </T>
          <T x={150} y={186 + i * 36} s={16} f={C.crema}>
            {r[1]}
          </T>
          <T x={330} y={186 + i * 36} s={16} f={C.crema}>
            {r[2]}
          </T>
        </g>
      ))}
    </Svg>
  );
}

// 11 · Verdict: three steps, each underlined and ticked.
export function Verdict({ t }: StepCtx) {
  const rows = [
    ['LAG + threshold', 'flag the starts'],
    ['running sum', 'number the visits'],
    ['GROUP BY', 'one row per visit'],
  ];
  return (
    <Svg label="Three steps from events to sessions: LAG and a threshold flag the starts, a running sum numbers the visits, GROUP BY gives one row per visit" h={280}>
      {rows.map((r, i) => {
        const k = easeOut(seg(t, i * 0.9, i * 0.9 + 0.5));
        const bar = easeInOut(seg(t, i * 0.9 + 0.3, i * 0.9 + 0.9));
        const tick = easeOut(seg(t, i * 0.9 + 0.8, i * 0.9 + 1.1));
        return (
          <g key={r[0]} opacity={k}>
            <T x={25} y={50 + i * 80} s={14} f={C.latte}>
              {r[0]}
            </T>
            <T x={25} y={82 + i * 80} s={22} f={C.caramel} w={700}>
              {r[1]}
            </T>
            <rect x={25} y={92 + i * 80} width={360 * bar} height={3} fill={C.caramel} />
            <path d={`M540 ${70 + i * 80} l8 8 l16 -18`} fill="none" stroke={C.caramel} strokeWidth={3} strokeDasharray="40" strokeDashoffset={40 * (1 - tick)} />
          </g>
        );
      })}
    </Svg>
  );
}

export function ProveLag({ t, answer }: StepCtx) {
  const answered = answer !== null;
  const s = useSinceAnswer(answered);
  const k = answered ? easeOut(seg(s, 0.1, 0.5)) : 0;
  const arc = answered ? easeInOut(seg(s, 0.4, 0.9)) : 0;
  return (
    <Svg label="LAG is the function that reads the previous row" h={240}>
      <T x={40} y={100} s={18} f={C.latte}>
        previous row →
      </T>
      {answered ? (
        <>
          <T x={300} y={lerp(120, 104, k)} s={26} f={C.caramel} w={700} o={k}>
            LAG
          </T>
          <circle cx={120} cy={170} r={7} fill={C.crema} />
          <circle cx={260} cy={170} r={7} fill={C.caramel} />
          <path d="M260 160 Q 190 120 120 160" fill="none" stroke={C.caramel} strokeWidth={2} pathLength={1} strokeDasharray="1" strokeDashoffset={1 - arc} />
        </>
      ) : (
        <T x={300} y={110} s={40} f={C.caramel} o={0.75 + 0.25 * Math.sin(t * 3)}>
          ?
        </T>
      )}
    </Svg>
  );
}
export function ProveSessions({ t, answer }: StepCtx) {
  const answered = answer !== null;
  const s = useSinceAnswer(answered);
  const xs = [80, 130, 400, 480];
  const gaps = ['5', '45', '10'];
  const cut = answered ? easeOut(seg(s, 0.2, 0.6)) : 0;
  const br = answered ? easeOut(seg(s, 0.7, 1.1)) : 0;
  return (
    <Svg label="Gaps of 5, 45 and 10 minutes with a 30-minute threshold make 2 sessions" h={240}>
      <T x={40} y={60} s={18} f={C.latte}>
        gaps 5 · 45 · 10 →
      </T>
      <line x1={50} y1={140} x2={550} y2={140} stroke={C.taupe} strokeWidth={2} />
      {xs.map((x, i) => (
        <circle key={i} cx={x} cy={140} r={7} fill={C.crema} />
      ))}
      {gaps.map((g, i) => (
        <T key={g} x={(xs[i] + xs[i + 1]) / 2} y={124} s={13} f={g === '45' && answered ? C.cherryText : C.latte} a="middle">
          {g}
        </T>
      ))}
      <line x1={265} y1={lerp(140, 112, cut)} x2={265} y2={lerp(140, 168, cut)} stroke={C.cherryText} strokeWidth={3} opacity={cut > 0 ? 1 : 0} />
      {answered ? (
        <>
          <path d="M72 156 v6 H138 v-6" fill="none" stroke={C.caramel} strokeWidth={2} opacity={br} />
          <path d="M392 156 v6 H488 v-6" fill="none" stroke={C.caramel} strokeWidth={2} opacity={br} />
          <T x={300} y={210} s={24} f={C.caramel} a="middle" w={700} o={br}>
            2 sessions
          </T>
        </>
      ) : (
        <T x={300} y={214} s={40} f={C.caramel} a="middle" o={0.75 + 0.25 * Math.sin(t * 3)}>
          ?
        </T>
      )}
    </Svg>
  );
}
