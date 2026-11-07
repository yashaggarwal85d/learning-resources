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

/** A small coin at (x, y), drawn in by `k`. */
function Coin({ x, y, k, f = C.caramel }: { x: number; y: number; k: number; f?: string }) {
  return <circle cx={x} cy={y} r={5 * k} fill="none" stroke={f} strokeWidth={2} opacity={k} />;
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

// 0 · Hook. A snapshot points at a ninety-five-day-old file. The lifecycle rule (age 90 or more: delete) reaches up from
// below and takes the file; the snapshot's pointer turns red and dangles at an empty slot. Time travel now errors.
export function LifecycleHook({ t }: StepCtx) {
  const a = easeOut(seg(t, 0, 0.4));
  const reach = easeInOut(seg(t, 0.9, 1.5));
  const gone = easeOut(seg(t, 1.5, 1.9));
  const dang = gone > 0.5;
  return (
    <Svg label="A lifecycle rule sweeps and deletes a file that a table's manifest still points at; the arrow is left dangling" h={250}>
      <Cell x={25} y={60} w={150} label="snapshot snap-1" o={a} />
      {gone < 1 ? <Cell x={350} y={60} w={225} label="part-00000.parquet" o={a * (1 - gone)} /> : <Hole x={350} y={60} w={225} stroke={C.cherryText} />}
      {gone >= 1 && <Cross x={462} y={74} k={1} />}
      <T x={350} y={106} s={11} f={C.latte} o={a}>
        age 95 days
      </T>
      <Req x1={180} x2={345} y={74} k={a} label={dang ? 'points at nothing' : 'points at'} f={dang ? C.cherryText : C.crema} />
      <Cell x={350} y={180} w={225} label="rule: age 90+ → delete" o={easeOut(seg(t, 0.4, 0.7))} />
      {reach > 0 && (
        <g opacity={1 - gone}>
          <line x1={540} y1={176} x2={540} y2={lerp(176, 92, reach)} stroke={C.cherryText} strokeWidth={1.8} />
          <path d={`M540 ${lerp(176, 92, reach)} l-5 8 h10 z`} fill={C.cherryText} />
        </g>
      )}
      {t > 2.4 && (
        <T x={25} y={150} s={12} f={C.cherryText} o={easeOut(seg(t, 2.4, 2.8))}>
          time travel to last month: error
        </T>
      )}
      {t > 3.1 && (
        <T x={25} y={240} s={12} f={C.latte} o={easeOut(seg(t, 3.1, 3.5))}>
          nobody touched the table
        </T>
      )}
    </Svg>
  );
}

// 1 · Predict. Rule and table both did their jobs (ticks); the file between them carries a question. Once answered, the
// table's snapshot pointer lights up, a wall separates it from the rule, and the rule's own view is spelled out.
export function WhatIsItBlindTo({ t, answer }: StepCtx) {
  const s = useSinceAnswer(answer !== null);
  const v = answer !== null ? easeOut(seg(s, 0.1, 0.6)) : 0;
  const k = (d: number) => easeOut(seg(t, d, d + 0.3));
  return (
    <Svg label="A snapshot's own reference to the file lights up, visibly independent of the rule's age-based sweep" h={250}>
      <Cell x={25} y={60} w={150} label="lifecycle rule" o={k(0)} />
      <Cell x={225} y={60} w={150} label="the file" o={k(0.1)} stroke={v > 0.5 ? C.focus : C.mocha} />
      <Cell x={425} y={60} w={150} label="the table" o={k(0.2)} />
      <MiniTick x={30} y={110} k={k(0.5)} />
      <T x={48} y={114} s={11} f={C.latte} o={k(0.5)}>
        ran on schedule
      </T>
      <MiniTick x={430} y={110} k={k(0.7)} />
      <T x={448} y={114} s={11} f={C.latte} o={k(0.7)}>
        as designed
      </T>
      {answer === null && (
        <T x={300} y={114} s={14} f={C.crema} a="middle" o={k(0.8)}>
          ?
        </T>
      )}
      <Back x1={420} x2={380} y={74} k={v} f={C.focus} />
      {v > 0 && (
        <>
          <T x={400} y={150} s={11} f={C.focus} a="middle" o={v}>
            a live snapshot points here
          </T>
          <line x1={200} y1={44} x2={200} y2={160} stroke={C.cherryText} strokeWidth={1.5} strokeDasharray="4 3" opacity={v} />
          <T x={25} y={150} s={11} f={C.latte} o={v}>
            sees age, tags, prefix
          </T>
        </>
      )}
      <AnswerRow y={205} label="the rule never saw" answer={answer} value="the snapshot" k={k(0.9)} />
    </Svg>
  );
}

// 2 · Three clouds, one shape: each column of hot, infrequent and archive cells fades in with its minimum stay. Then
// Azure's own worked example: held 21 days of a 30-day minimum, the remaining 9 still billed.
export function ThreeCloudsThreeTiers({ t }: StepCtx) {
  const cols = [
    { cloud: 'S3', mins: ['none', 'thirty days', 'ninety–one eighty'] },
    { cloud: 'GCS', mins: ['none', 'thirty days', 'three sixty-five'] },
    { cloud: 'Azure Blob', mins: ['none', 'thirty–ninety', 'one eighty'] },
  ];
  const tiers = ['hot', 'infrequent', 'archive'];
  const ex = easeOut(seg(t, 3.0, 3.4));
  const held = easeInOut(seg(t, 3.3, 4.1));
  const bill = easeOut(seg(t, 4.1, 4.5));
  const W = 550;
  return (
    <Svg label="Three clouds, each with hot, infrequent and archive tiers, each stating its own minimum storage duration" h={250}>
      {cols.map((c, i) => {
        const x = 25 + i * 187;
        return (
          <g key={c.cloud}>
            <T x={x + 88} y={30} s={12} f={C.crema} a="middle" o={easeOut(seg(t, 0.1 + i * 0.5, 0.4 + i * 0.5))}>
              {c.cloud}
            </T>
            {tiers.map((tier, j) => {
              const k = easeOut(seg(t, 0.2 + i * 0.5 + j * 0.15, 0.5 + i * 0.5 + j * 0.15));
              const y = 38 + j * 50;
              return (
                <g key={tier} opacity={k} transform={`translate(0 ${((1 - k) * 8).toFixed(2)})`}>
                  <rect x={x} y={y} width={176} height={46} rx={5} fill={C.second} fillOpacity={0.35 - j * 0.12} stroke={C.mocha} strokeWidth={1.5} />
                  <T x={x + 88} y={y + 18} s={12} f={C.crema} a="middle">
                    {tier}
                  </T>
                  <T x={x + 88} y={y + 38} s={11} f={C.caramel} a="middle">
                    {c.mins[j]}
                  </T>
                </g>
              );
            })}
          </g>
        );
      })}
      <g opacity={ex}>
        <T x={25} y={202} s={11} f={C.latte}>
          Azure cool: deleted at day 21 of 30
        </T>
        <rect x={25} y={210} width={W} height={12} rx={3} fill="none" stroke={C.mocha} strokeWidth={1.2} />
        <rect x={25} y={210} width={W * (21 / 30) * held} height={12} rx={3} fill={C.second} opacity={0.8} />
        <rect x={25 + W * (21 / 30)} y={210} width={W * (9 / 30) * bill} height={12} rx={3} fill={C.cherryText} opacity={0.8} />
      </g>
      {t > 4.1 && (
        <T x={575} y={242} s={11} f={C.cherryText} a="end" o={bill}>
          9 more days billed anyway
        </T>
      )}
    </Svg>
  );
}

// 3 · The retrieval ladder. Each row's wait bar grows to its documented ceiling while its fee coins appear: expedited
// short and dear, standard hours, bulk longest and cheapest. Deep archive's longer ceilings follow.
export function RetrievalLadder({ t }: StepCtx) {
  const rows: [string, number, string, number][] = [
    ['expedited', 0.08, 'up to 5 min', 3],
    ['standard', 0.42, 'up to 5 h', 2],
    ['bulk', 1, 'up to 12 h', 1],
  ];
  return (
    <Svg label="Expedited is fastest and costliest, standard takes hours, bulk is cheapest and slowest, each a longer wait than the one before it" h={250}>
      <T x={25} y={28} s={12} f={C.latte} o={easeOut(seg(t, 0, 0.3))}>
        one file back from Flexible Retrieval
      </T>
      <T x={545} y={52} s={11} f={C.caramel} a="middle" o={easeOut(seg(t, 0, 0.3))}>
        fee
      </T>
      {rows.map(([label, frac, wait, coins], i) => {
        const g = easeInOut(seg(t, 0.3 + i * 0.8, 1.1 + i * 0.8));
        const y = 80 + i * 46;
        const w = 290 * frac;
        return (
          <g key={label} opacity={easeOut(seg(t, 0.2 + i * 0.8, 0.5 + i * 0.8))}>
            <T x={25} y={y + 12} s={12} f={C.crema}>
              {label}
            </T>
            <rect x={120} y={y} width={Math.max(3, w * g)} height={16} rx={3} fill={C.second} opacity={0.8} />
            <T x={128 + w} y={y + 12} s={11} f={C.latte} o={seg(g, 0.8, 1)}>
              {wait}
            </T>
            {Array.from({ length: coins }, (_, j) => (
              <Coin key={j} x={529 + j * 16} y={y + 8} k={easeOutBack(seg(t, 0.9 + i * 0.8 + j * 0.1, 1.2 + i * 0.8 + j * 0.1))} />
            ))}
          </g>
        );
      })}
      {t > 3.2 && (
        <T x={25} y={232} s={11} f={C.latte} o={easeOut(seg(t, 3.2, 3.6))}>
          deep archive: up to 12 h standard, 48 h bulk
        </T>
      )}
    </Svg>
  );
}

// 4 · Automated tiering. Reads on the object thin out along the top; the object slides along and steps down a lane each
// time access cools. A monitoring-fee coin drops for that one object at every step, whatever lane it is in.
export function AutomatedTiering({ t }: StepCtx) {
  const reads = [140, 165, 185, 210, 235, 270, 330, 420];
  const p = easeInOut(seg(t, 0.4, 3.4));
  const x = lerp(140, 560, p);
  const lane = x < 300 ? 0 : x < 450 ? 1 : 2;
  const laneY = (j: number) => 100 + j * 40;
  const y = x < 300 ? laneY(0) : x < 450 ? lerp(laneY(0), laneY(1), clamp((x - 300) / 20)) : lerp(laneY(1), laneY(2), clamp((x - 450) / 20));
  const tiers = ['hot', 'infrequent', 'archive'];
  return (
    <Svg label="An object's access pattern cools over time; automated tiering moves it down through the tiers on its own, with its own monitoring fee" h={250}>
      <T x={25} y={52} s={11} f={C.latte}>
        reads
      </T>
      {reads.map((r) => (
        <line key={r} x1={r} y1={40} x2={r} y2={56} stroke={C.second} strokeWidth={2} opacity={x >= r ? 1 : 0.15} />
      ))}
      {tiers.map((tier, j) => (
        <g key={tier}>
          <T x={25} y={laneY(j) + 4} s={12} f={lane === j ? C.focus : C.latte}>
            {tier}
          </T>
          <line x1={130} y1={laneY(j)} x2={575} y2={laneY(j)} stroke={C.mocha} strokeWidth={1.2} strokeDasharray="3 4" />
        </g>
      ))}
      <Pip x={x} y={y} s={14} f={C.focus} />
      {[200, 300, 400, 500].map((cx) => (
        <Coin key={cx} x={cx} y={214} k={x >= cx ? 1 : 0} />
      ))}
      {t > 1.2 && (
        <T x={25} y={244} s={11} f={C.caramel} o={easeOut(seg(t, 1.2, 1.6))}>
          a monitoring fee for this one object, every month
        </T>
      )}
    </Svg>
  );
}

// 5 · The same delete in two orders. Top: the file goes first, the snapshot still points at the gap: corrupted. Bottom:
// the snapshot lets go first, then the identical delete: intact.
export function OrderingFix({ t }: StepCtx) {
  const k = (d: number) => easeOut(seg(t, d, d + 0.35));
  const del1 = k(0.5);
  const exp2 = k(2.5);
  const del2 = k(3.2);
  const Lane = ({ y, title, del, released }: { y: number; title: string; del: number; released: number }) => (
    <g>
      <T x={25} y={y - 10} s={12} f={C.latte}>
        {title}
      </T>
      <Cell x={25} y={y} w={130} label="snapshot" />
      {del < 1 ? <Cell x={260} y={y} w={170} label="the file" o={1 - del} /> : <Hole x={260} y={y} w={170} stroke={released > 0.5 ? C.mocha : C.cherryText} />}
      {released < 1 && <Req x1={160} x2={255} y={y + 14} k={1 - released} f={del >= 1 ? C.cherryText : C.crema} />}
    </g>
  );
  return (
    <Svg label="Delete-before-expire corrupts the table; expire-before-delete leaves it intact, reproduced on a local stand-in twice" h={250}>
      <Lane y={44} title="delete, then expire" del={del1} released={0} />
      <T x={440} y={62} s={11} f={C.latte} o={k(1.0)}>
        expire: too late
      </T>
      {t > 1.6 && (
        <T x={445} y={86} s={13} f={C.cherryText} w={700} o={k(1.6)}>
          corrupted
        </T>
      )}
      <Lane y={144} title="expire, then delete" del={del2} released={exp2} />
      <T x={445} y={162} s={11} f={C.latte} o={k(3.2)}>
        unreferenced now
      </T>
      {t > 3.8 && (
        <>
          <MiniTick x={445} y={180} k={k(3.8)} />
          <T x={465} y={186} s={13} f={C.focus} w={700} o={k(3.8)}>
            intact
          </T>
        </>
      )}
      {t > 4.2 && (
        <T x={300} y={238} s={12} f={C.latte} a="middle" o={k(4.2)}>
          only the order changed
        </T>
      )}
    </Svg>
  );
}

// 6 · Object Lock's two modes. Users try a locked object on each side and are stopped. In governance mode, the one
// permission walks through and the lock lifts; in compliance mode even root is stopped, and nothing lifts.
export function ObjectLockModes({ t }: StepCtx) {
  const k = (d: number) => easeOut(seg(t, d, d + 0.35));
  const pass = easeInOut(seg(t, 1.8, 2.5));
  const Side = ({ cx, title }: { cx: number; title: string }) => (
    <g opacity={k(0)}>
      <T x={cx} y={30} s={12} f={C.crema} a="middle">
        {title}
      </T>
      <Cell x={cx - 60} y={44} w={120} label="object" />
    </g>
  );
  const tries = (cx: number, d: number) =>
    [0, 1, 2].map((i) => {
      const b = easeInOut(seg(t, d + i * 0.2, d + 0.4 + i * 0.2));
      const yy = 150 - 30 * Math.sin(Math.PI * b);
      return (
        <g key={i}>
          <Pip x={cx - 40 + i * 40} y={yy} s={9} f={C.latte} />
          <Cross x={cx - 40 + i * 40} y={98} k={b >= 1 ? 1 : 0} />
        </g>
      );
    });
  return (
    <Svg label="Governance mode blocks most users but one permission can override it; compliance mode blocks everyone including the account root" h={250}>
      <Side cx={155} title="governance" />
      <Side cx={445} title="compliance" />
      <Lock x={200} y={36} k={k(0.2) * (1 - pass)} />
      <Lock x={490} y={36} k={k(0.2)} f={C.cherryText} />
      {tries(155, 0.5)}
      {tries(445, 0.5)}
      {t > 1.6 && <Pip x={235} y={lerp(160, 82, pass)} s={11} f={C.focus} />}
      <T x={155} y={190} s={11} f={C.focus} a="middle" o={k(1.6)}>
        one permission lifts it
      </T>
      {t > 2.6 && <Pip x={355} y={150 - 30 * Math.sin(Math.PI * easeInOut(seg(t, 2.6, 3.0)))} s={11} f={C.cherryText} />}
      <T x={445} y={190} s={11} f={C.cherryText} a="middle" o={k(2.8)}>
        root is blocked too
      </T>
      {t > 3.5 && (
        <T x={300} y={235} s={12} f={C.cherryText} a="middle" o={k(3.5)}>
          compliance, early exit: delete the whole account
        </T>
      )}
    </Svg>
  );
}

// 7 · Recap: four lines, each beside a small moving picture of its idea, then what comes next.
export function Recap({ t }: StepCtx) {
  const k = (i: number) => easeOut(seg(t, 0.1 + i * 0.55, 0.5 + i * 0.55));
  const lines = [
    'Hot, infrequent, archive: each has a minimum stay',
    'Cheaper to store, slower and costlier to read',
    'Auto-tiering saves guesswork, not the bill',
    'Expire the snapshot before any age rule',
  ];
  return (
    <Svg label="A nightly snapshot-expiry job at two and a lifecycle rule at one; the rule runs first, so it can still delete a file the previous day's snapshot needs" h={250}>
      {lines.map((l, i) => (
        <T key={l} x={110} y={44 + i * 48} s={13} f={C.crema} o={k(i)}>
          {l}
        </T>
      ))}
      <g opacity={k(0)}>
        {[0, 1, 2].map((j) => (
          <rect key={j} x={25 + j * 20} y={30 + j * 6} width={18} height={14} rx={2} fill={C.second} fillOpacity={0.5 - j * 0.15} stroke={C.mocha} />
        ))}
      </g>
      <g opacity={k(1)}>
        <rect x={25} y={84} width={40 * easeOut(seg(t, 0.7, 1.4))} height={10} rx={2} fill={C.second} />
        <Coin x={78} y={89} k={k(1.3)} />
      </g>
      <g opacity={k(2)}>
        <line x1={25} y1={136} x2={85} y2={136} stroke={C.mocha} strokeDasharray="3 3" />
        <Pip x={lerp(28, 70, easeInOut(seg(t, 1.2, 2.0)))} y={136} s={9} f={C.focus} />
        <Coin x={80} y={126} k={k(2.4)} />
      </g>
      <g opacity={k(3)}>
        <rect x={25} y={176} width={26} height={14} rx={2} fill="none" stroke={C.focus} />
        <rect x={59} y={176} width={26} height={14} rx={2} fill="none" stroke={C.mocha} strokeDasharray="3 2" />
        <Req x1={51} x2={57} y={183} k={k(3)} f={C.focus} />
      </g>
      {t > 2.6 && (
        <T x={300} y={240} s={12} f={C.focus} a="middle" o={easeOut(seg(t, 2.6, 3.0))}>
          next: who may touch any of this
        </T>
      )}
    </Svg>
  );
}

// 8 · Prove it. A night's clock: the lifecycle rule fires at one, the snapshot expiry at two. A pointer sweeps the night;
// once answered, the file under the rule's mark is gone an hour before the expiry could release it.
export function ProveIt({ t, answer }: StepCtx) {
  const s = useSinceAnswer(answer !== null);
  const v = answer !== null ? easeOut(seg(s, 0.1, 0.6)) : 0;
  const p = easeInOut(seg(t, 0.4, 2.6));
  const ax = (h: number) => 80 + h * 160;
  return (
    <Svg label="A nightly snapshot-expiry job at two and a lifecycle rule at one; the rule runs first, so it can still delete a file the previous day's snapshot needs" h={250}>
      <Cell x={ax(1) - 75} y={30} w={150} label="lifecycle rule" stroke={v > 0.5 ? C.cherryText : C.mocha} />
      <Cell x={ax(2) - 75} y={30} w={150} label="snapshot expiry" />
      <line x1={60} y1={90} x2={560} y2={90} stroke={C.mocha} strokeWidth={1.5} />
      {[1, 2].map((h) => (
        <line key={h} x1={ax(h)} y1={62} x2={ax(h)} y2={96} stroke={C.mocha} strokeWidth={1.5} />
      ))}
      <T x={ax(1)} y={114} s={11} f={C.latte} a="middle">
        one a.m.
      </T>
      <T x={ax(2)} y={114} s={11} f={C.latte} a="middle">
        two a.m.
      </T>
      <path d={`M${lerp(60, 540, p)} 90 l-6 -9 h12 z`} fill={C.second} />
      {v > 0 && (
        <g opacity={v}>
          <rect x={ax(1)} y={84} width={ax(2) - ax(1)} height={12} fill={C.cherryText} opacity={0.35} />
          <T x={(ax(1) + ax(2)) / 2} y={136} s={11} f={C.cherryText} a="middle">
            file already gone
          </T>
        </g>
      )}
      <AnswerRow y={180} label="the hook's risk again?" answer={answer} value="yes" k={easeOut(seg(t, 1.6, 2.0))} f={C.cherryText} />
      <Verdict answer={answer} text="the rule runs before the expiry" y={228} />
    </Svg>
  );
}
