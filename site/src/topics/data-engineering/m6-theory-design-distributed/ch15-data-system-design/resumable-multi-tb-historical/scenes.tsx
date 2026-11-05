import { useEffect, useState } from 'react';
import { C, Svg, T } from '../../../../../reels/kit';
import { easeInOut, easeOut, easeOutBack, lerp, seg } from '../../../../../reels/anim';
import type { StepCtx } from '../../../../../reels/types';

// CHAPTER.md, topic 16: a five-year timeline cut into a grid of chunks with the backfill advancing across it; a crash
// at a cell and the checkpoint bar letting it resume at the next incomplete cell; a throttle gauge dropping the
// concurrency when the production-latency line rises; the shadow table filling beside the live one, and the swap as
// one arrow flipping after the diff panel shows only the intended change. Numbers are examples.py's: 1,825 days in
// 30-day chunks is 61 chunks; a crash after 40 resumes at chunk 41; concurrency 10 against a 100 ms threshold drops
// to 1 at 200 ms and recovers at 90 ms; order_42 is the intended diff, order_99 would block the swap.

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

/** A plain box with a centred label. */
const Box = ({ x, y, w, h = 32, label, lit = false, o = 1, dash, stroke, f, fill }: { x: number; y: number; w: number; h?: number; label: string; lit?: boolean; o?: number; dash?: string; stroke?: string; f?: string; fill?: string }) =>
  o <= 0 ? null : (
    <g opacity={Math.min(1, o)}>
      <rect x={x} y={y} width={w} height={h} rx={4} fill={fill ?? C.panel} stroke={stroke ?? (lit ? C.focus : C.line)} strokeWidth={lit ? 1.8 : 1.1} strokeDasharray={dash} />
      <T x={x + w / 2} y={y + h / 2 + 5} s={13} f={f ?? (lit ? C.focus : C.primary)} a="middle">
        {label}
      </T>
    </g>
  );

/** A label-left / value-right line under a drawing. */
const Line2 = ({ y, l, r, o, rc = C.focus, lc = C.secondary, lx = 30 }: { y: number; l: string; r: string; o: number; rc?: string; lc?: string; lx?: number }) =>
  o <= 0 ? null : (
    <g opacity={Math.min(1, o)}>
      <T x={lx} y={y} s={14} f={lc}>
        {l}
      </T>
      <T x={575} y={y} s={14} f={rc} a="end">
        {r}
      </T>
    </g>
  );

/** A check mark. */
const Tick = ({ x, y, k, color = C.focus }: { x: number; y: number; k: number; color?: string }) =>
  k <= 0 ? null : <path d={`M${x - 5} ${y} l4 4 l8 -9`} fill="none" stroke={color} strokeWidth={2} opacity={k} />;

/** A red ✕. */
const Cross = ({ x, y, k }: { x: number; y: number; k: number }) =>
  k <= 0 ? null : (
    <g stroke={C.badText} strokeWidth={2.4} opacity={k}>
      <line x1={x - 7} y1={y - 7} x2={x + 7} y2={y + 7} />
      <line x1={x + 7} y1={y - 7} x2={x - 7} y2={y + 7} />
    </g>
  );

/** Concurrency under examples.py's throttle: 10 at or under 100 ms, one fewer per 10 ms over, never below 1. */
const conc = (ms: number) => (ms <= 100 ? 10 : Math.max(1, 10 - Math.min(9, Math.floor((ms - 100) / 10))));

/** Ten worker slots in a row, `n` lit. */
function Slots({ x, y, n, o = 1 }: { x: number; y: number; n: number; o?: number }) {
  return (
    <g opacity={o}>
      {Array.from({ length: 10 }, (_, i) => (
        <rect key={i} x={x + i * 14} y={y} width={10} height={26} rx={2} fill={i < n ? C.focus : C.band} stroke={i < n ? 'none' : C.line} />
      ))}
    </g>
  );
}

// 1 · One long job bar crawls toward the end; finance's query lane beside it chokes to red; near the end the bar dies
// with a red ✕, and the saved row underneath is an empty dashed outline.
export function Hook({ t }: StepCtx) {
  const run = Math.min(0.9, 0.9 * easeInOut(seg(t, 0.3, 2.6)));
  const choke = easeOut(seg(t, 1.0, 1.5));
  const dead = easeOut(seg(t, 2.6, 2.9));
  return (
    <Svg label="one backfill job takes production down, then dies with nothing saved" h={270}>
      <T x={30} y={44} s={14} f={C.primary} o={easeOut(seg(t, 0, 0.3))}>
        one job
      </T>
      <rect x={140} y={28} width={420} height={22} fill={C.band} opacity={easeOut(seg(t, 0, 0.3))} />
      <rect x={140} y={28} width={Math.max(0, 420 * run)} height={22} fill={dead > 0.5 ? C.bad : C.primary} opacity={1 - 0.4 * dead} />
      <Cross x={140 + 420 * 0.9} y={39} k={dead} />
      <T x={30} y={104} s={14} f={choke > 0.5 ? C.badText : C.primary} o={easeOut(seg(t, 0.4, 0.7))}>
        finance
      </T>
      <line x1={140} y1={100} x2={560} y2={100} stroke={choke > 0.5 ? C.badText : C.line} opacity={easeOut(seg(t, 0.4, 0.7))} />
      {Array.from({ length: 6 }, (_, i) => {
        const p = ((t * 0.5 * (1 - choke) + i / 6) % 1);
        return <circle key={i} cx={140 + p * 420} cy={100} r={4} fill={C.primary} opacity={easeOut(seg(t, 0.4, 0.7)) * (1 - 0.7 * choke)} />;
      })}
      <T x={575} y={124} s={13} f={C.badText} a="end" o={choke}>
        concurrency gone
      </T>
      <T x={30} y={164} s={14} f={C.primary} o={easeOut(seg(t, 0.6, 0.9))}>
        saved
      </T>
      <rect x={140} y={148} width={420} height={22} fill="none" stroke={dead > 0.5 ? C.badText : C.line} strokeDasharray="4 4" opacity={easeOut(seg(t, 0.6, 0.9))} />
      <Line2 y={214} l="most of a day" r="then a crash" rc={C.badText} o={easeOut(seg(t, 2.8, 3.2))} />
      <Line2 y={240} l="checkpointed" r="nothing" rc={C.badText} o={easeOut(seg(t, 3.3, 3.7))} />
    </Svg>
  );
}

const FAILS = ['one unit of work', 'starved production', 'nothing saved'];
const FIXES = ['chunks, idempotent', 'a throttle', 'checkpoint, shadow'];

// 2 · Three red failures down the left, three dashed slots on the right. After the pick, each slot fills with the
// decisions that answer it, a line runs across, and the failure turns white.
export function Predict1({ t, answer }: StepCtx) {
  const s = useSinceAnswer(answer !== null);
  const on = answer !== null;
  return (
    <Svg label="what four decisions turn this into an unremarkable week?" h={210}>
      {FAILS.map((f, i) => {
        const k = on ? easeOut(seg(s, 0.3 + i * 0.5, 0.7 + i * 0.5)) : 0;
        const y = 20 + i * 50;
        return (
          <g key={f}>
            <Box x={30} y={y} w={220} label={f} o={easeOut(seg(t, 0.2 + i * 0.2, 0.5 + i * 0.2))} stroke={k > 0.5 ? C.focus : C.badText} f={k > 0.5 ? C.focus : C.badText} />
            {k < 1 && <Box x={330} y={y} w={240} label="?" dash="4 3" o={easeOut(seg(t, 0.8, 1.1)) * (1 - k)} />}
            {k > 0 && <Box x={330} y={y} w={240} label={FIXES[i]} lit o={k} />}
            {k > 0 && <line x1={330} y1={y + 16} x2={lerp(330, 250, k)} y2={y + 16} stroke={C.focus} strokeWidth={1.4} />}
          </g>
        );
      })}
      <T x={300} y={196} s={14} f={C.secondary} a="middle" o={easeOut(seg(t, 1.2, 1.6))}>
        decided before the first chunk runs
      </T>
    </Svg>
  );
}

const CELL = (i: number): [number, number] => [30 + (i % 12) * 45, 20 + Math.floor(i / 12) * 30];

// 3 · Sixty-one cells are cut row by row; then the backfill's cursor advances across the grid, filling each cell white.
export function RevealChunkGrid({ t }: StepCtx) {
  const cut = seg(t, 0.1, 1.4);
  const done = Math.floor(easeInOut(seg(t, 1.6, 4.2)) * 61);
  return (
    <Svg label="history cut into a grid of independent chunks; the backfill advances across it" h={240}>
      {Array.from({ length: 61 }, (_, i) => {
        const [x, y] = CELL(i);
        const k = easeOut(seg(cut, i / 61 - 0.05, i / 61 + 0.1));
        if (k <= 0) return null;
        const isCur = i === done && done < 61;
        return <rect key={i} x={x} y={y} width={40} height={24} rx={2} fill={i < done ? C.focus : C.panel} stroke={isCur ? C.focus : C.line} strokeWidth={isCur ? 2 : 1} opacity={k} />;
      })}
      <Line2 y={208} l="61 chunks" r="30 days each" o={easeOut(seg(t, 1.0, 1.4))} />
      <T x={30} y={232} s={13} f={C.secondary} o={easeOut(seg(t, 2.0, 2.4))}>
        each independent of its neighbours
      </T>
    </Svg>
  );
}

const SW = 540 / 61;

// 4 · A strip of 61 chunks fills to 40 and the run dies red on the 41st. The checkpoint bar draws under the 40 done;
// the resume arrow drops at chunk 41 and the strip fills on to the end. A rerun pulse on chunk 40 overwrites its slot.
export function RevealCheckpointResume({ t }: StepCtx) {
  const first = Math.floor(easeInOut(seg(t, 0.2, 1.4)) * 40);
  const crash = easeOut(seg(t, 1.4, 1.7));
  const ck = easeOut(seg(t, 1.8, 2.3));
  const arrow = easeOutBack(seg(t, 2.4, 2.8));
  const second = Math.floor(easeInOut(seg(t, 2.9, 3.9)) * 21);
  const filled = first + second;
  const pulse = seg(t, 4.0, 4.5);
  return (
    <Svg label="a crash mid-run; the checkpoint lets resume start right after it" h={210}>
      {Array.from({ length: 61 }, (_, i) => {
        const x = 30 + i * SW;
        const bad = i === 40 && crash > 0.5 && second === 0;
        return <rect key={i} x={x} y={46} width={Math.max(0, SW - 1.5)} height={30} fill={bad ? C.bad : i < filled ? C.focus : C.band} stroke={bad ? C.badText : 'none'} opacity={easeOut(seg(t, 0, 0.3))} />;
      })}
      <Cross x={30 + 40.5 * SW} y={30} k={crash * (second > 0 ? 0.3 : 1)} />
      {ck > 0 && (
        <g opacity={ck}>
          <rect x={30} y={86} width={Math.max(0, 40 * SW * ck - 1.5)} height={8} fill={C.second} />
          <T x={30} y={114} s={13} f={C.second}>
            checkpoint: 40 done
          </T>
        </g>
      )}
      {arrow > 0 && (
        <g opacity={Math.min(1, arrow)}>
          <path d={`M${30 + 40.5 * SW} ${130 - 10 * Math.min(1, arrow)} L${30 + 40.5 * SW} 100`} stroke={C.focus} strokeWidth={1.6} />
          <path d={`M${30 + 40.5 * SW - 5} 106 L${30 + 40.5 * SW} 99 L${30 + 40.5 * SW + 5} 106`} fill="none" stroke={C.focus} strokeWidth={1.6} />
          <T x={575} y={114} s={13} f={C.focus} a="end">
            resume at chunk 41
          </T>
        </g>
      )}
      {pulse > 0 && pulse < 1 && <rect x={30 + 39 * SW - 3} y={43} width={SW + 4.5} height={36} fill="none" stroke={C.focus} strokeWidth={2} opacity={1 - pulse} />}
      <Line2 y={164} l="not from chunk 1" r="from the first incomplete" o={easeOut(seg(t, 2.8, 3.2))} />
      <Line2 y={192} l="a rerun" r="overwrites its own slot" o={easeOut(seg(t, 4.0, 4.4))} />
    </Svg>
  );
}

// 5 · Ten worker slots fill up to a cap line, leaving the warehouse's headroom free for production; source reads pass
// a rate-limit gate at an even spacing. Then a question mark: what signal says slow down?
export function RevealThrottleSignal({ t }: StepCtx) {
  const fill = Math.floor(easeOut(seg(t, 0.3, 1.2)) * 10);
  const gate = easeOut(seg(t, 1.6, 2.0));
  return (
    <Svg label="a concurrency cap and a rate limit, both leaving headroom for production" h={210}>
      <T x={30} y={44} s={13} f={C.primary} o={easeOut(seg(t, 0, 0.3))}>
        concurrency cap
      </T>
      <Slots x={180} y={26} n={fill} o={easeOut(seg(t, 0, 0.3))} />
      <rect x={322} y={26} width={250} height={26} rx={2} fill="none" stroke={C.secondary} strokeDasharray="4 3" opacity={easeOut(seg(t, 0.8, 1.1))} />
      <T x={447} y={44} s={13} f={C.secondary} a="middle" o={easeOut(seg(t, 0.8, 1.1))}>
        production's headroom
      </T>
      <T x={30} y={104} s={13} f={C.primary} o={easeOut(seg(t, 1.4, 1.7))}>
        source reads
      </T>
      <line x1={180} y1={100} x2={570} y2={100} stroke={C.line} opacity={gate} />
      <rect x={300} y={84} width={14} height={32} fill={C.panel} stroke={C.focus} opacity={gate} />
      <T x={307} y={134} s={13} f={C.secondary} a="middle" o={gate}>
        rate limit
      </T>
      {gate > 0 &&
        Array.from({ length: 6 }, (_, i) => {
          const p = ((t * 0.4 + i / 6) % 1);
          const x = 180 + p * 390;
          const queued = x < 300;
          return <circle key={i} cx={queued ? 180 + p * 120 * 0.8 + 10 : x} cy={100} r={4} fill={C.primary} opacity={gate} />;
        })}
      <T x={300} y={186} s={15} f={C.focus} a="middle" o={easeOut(seg(t, 2.8, 3.2))}>
        which signal says slow down?
      </T>
    </Svg>
  );
}

const LX = (u: number) => 60 + u * 320;
const LY = (ms: number) => 140 - (ms / 250) * 110;
const lat = (u: number) => (u < 0.5 ? lerp(50, 200, easeInOut(u / 0.5)) : lerp(200, 90, easeInOut((u - 0.5) / 0.5)));

// 6 · Production latency runs from 50 ms up through the 100 ms threshold to 200 ms and back down to 90 ms; a playhead
// rides it, and the ten worker slots drop to one and climb back to ten, the number beside them tracking.
export function RevealThrottleReacts({ t }: StepCtx) {
  const u = easeInOut(seg(t, 0.4, 3.8));
  const ms = lat(u);
  const n = conc(ms);
  const pts: string[] = [];
  const hot: string[] = [];
  for (let i = 0; i <= 80; i++) {
    const v = (i / 80) * u;
    pts.push(`${LX(v)},${LY(lat(v))}`);
    if (lat(v) > 100) hot.push(`${LX(v)},${LY(lat(v))}`);
  }
  return (
    <Svg label="latency rising pulls concurrency down; latency falling lets it recover" h={210}>
      <g opacity={easeOut(seg(t, 0, 0.3))}>
        <line x1={60} y1={140} x2={380} y2={140} stroke={C.line} />
        <line x1={60} y1={LY(100)} x2={380} y2={LY(100)} stroke={C.secondary} strokeDasharray="4 4" />
        <T x={66} y={LY(100) - 6} s={13} f={C.secondary}>
          100 ms
        </T>
        <T x={60} y={24} s={13} f={C.secondary}>
          production latency
        </T>
      </g>
      {u > 0 && <polyline points={pts.join(' ')} fill="none" stroke={C.focus} strokeWidth={2} />}
      {hot.length > 1 && <polyline points={hot.join(' ')} fill="none" stroke={C.badText} strokeWidth={2.4} />}
      {u > 0 && <circle cx={LX(u)} cy={LY(ms)} r={5} fill={ms > 100 ? C.badText : C.focus} />}
      <T x={220} y={164} s={14} f={ms > 100 ? C.badText : C.focus} a="middle" o={easeOut(seg(t, 0.4, 0.7))}>
        {`${Math.round(ms)} ms`}
      </T>
      <T x={430} y={44} s={13} f={C.secondary} o={easeOut(seg(t, 0.2, 0.5))}>
        concurrency
      </T>
      <Slots x={430} y={60} n={n} o={easeOut(seg(t, 0.2, 0.5))} />
      <T x={500} y={114} s={16} f={C.focus} a="middle" o={easeOut(seg(t, 0.2, 0.5))}>
        {`${n}`}
      </T>
      <T x={30} y={198} s={14} f={C.secondary} o={easeOut(seg(t, 3.8, 4.2))}>
        no one has to watch it
      </T>
    </Svg>
  );
}

// 7 · Readers point at the live table while the shadow beside it fills chunk by chunk. One arrow flips from live to
// shadow in a single move. Then a failed run's shadow is drawn red and discarded.
export function RevealShadowSwap({ t }: StepCtx) {
  const rows = Math.floor(easeInOut(seg(t, 0.4, 2.0)) * 6);
  const flip = easeInOut(seg(t, 2.4, 2.8));
  const fail = easeOut(seg(t, 3.3, 3.6));
  const gone = easeOut(seg(t, 3.9, 4.3));
  const tx = lerp(150, 450, flip);
  return (
    <Svg label="output fills a shadow table; one atomic swap promotes it to live" h={210}>
      <Box x={240} y={14} w={120} h={30} label="readers" lit o={easeOut(seg(t, 0, 0.3))} />
      <path d={`M300 44 L${tx} 86`} stroke={C.focus} strokeWidth={2} opacity={easeOut(seg(t, 0, 0.3))} />
      <circle cx={tx} cy={86} r={4} fill={C.focus} opacity={easeOut(seg(t, 0, 0.3))} />
      <g opacity={easeOut(seg(t, 0, 0.3))}>
        <rect x={60} y={90} width={180} height={76} rx={4} fill={C.panel} stroke={flip > 0.5 ? C.line : C.focus} />
        <T x={70} y={108} s={13} f={flip > 0.5 ? C.quiet : C.focus}>
          {flip > 0.5 ? 'old live' : 'live'}
        </T>
        {[0, 1, 2, 3].map((i) => (
          <rect key={i} x={70 + i * 42} y={124} width={36} height={30} fill={C.line} />
        ))}
      </g>
      <g opacity={easeOut(seg(t, 0.2, 0.5))}>
        <rect x={360} y={90} width={180} height={76} rx={4} fill={C.panel} stroke={flip > 0.5 ? C.focus : C.line} strokeDasharray={flip > 0.5 ? undefined : '4 3'} />
        <T x={370} y={108} s={13} f={flip > 0.5 ? C.focus : C.secondary}>
          {flip > 0.5 ? 'live' : 'shadow'}
        </T>
        {Array.from({ length: rows }, (_, i) => (
          <rect key={i} x={370 + (i % 3) * 56} y={118 + Math.floor(i / 3) * 22} width={50} height={16} fill={C.primary} />
        ))}
      </g>
      {fail > 0 && gone < 1 && (
        <g opacity={fail * (1 - gone)} transform={`translate(0 ${gone * 10})`}>
          <rect x={250} y={176} width={100} height={22} rx={3} fill={C.bad} stroke={C.badText} />
          <T x={300} y={192} s={13} f={C.focus} a="middle">
            failed run
          </T>
        </g>
      )}
      <T x={575} y={194} s={13} f={C.secondary} a="end" o={easeOut(seg(t, 3.9, 4.3))}>
        discarded, not repaired
      </T>
      <T x={30} y={194} s={13} f={C.secondary} o={easeOut(seg(t, 2.8, 3.1))}>
        one atomic swap
      </T>
    </Svg>
  );
}

// 8 · A diff panel scans shadow against live row by row: equal rows stay grey, order_42 lights as the intended change
// and gets a check, and a sampled recompute matches. Then order_99 appears red: it would block the swap.
export function RevealDataDiff({ t }: StepCtx) {
  const scan = easeInOut(seg(t, 0.3, 1.8));
  const ROWS = ['=', '=', 'order_42', '=', '='];
  const samp = easeOut(seg(t, 2.1, 2.5));
  const bad = easeOutBack(seg(t, 3.2, 3.6));
  return (
    <Svg label="a diff panel compares shadow against live; only the intended rows differ" h={210}>
      <T x={30} y={22} s={13} f={C.secondary} o={easeOut(seg(t, 0, 0.3))}>
        shadow against live
      </T>
      {ROWS.map((r, i) => {
        const k = easeOut(seg(scan, i / 5, i / 5 + 0.2));
        const y = 32 + i * 22;
        const hit = r !== '=';
        return (
          <g key={i} opacity={easeOut(seg(t, 0, 0.3))}>
            <rect x={30} y={y} width={300} height={18} rx={2} fill={hit && k > 0.5 ? C.panel : C.band} stroke={hit && k > 0.5 ? C.focus : 'none'} />
            {k > 0.5 && (
              <T x={40} y={y + 14} s={13} f={hit ? C.focus : C.quiet}>
                {hit ? 'order_42 · intended' : '='}
              </T>
            )}
            {hit && <Tick x={346} y={y + 7} k={k > 0.5 ? easeOut(seg(t, 1.2, 1.5)) : 0} />}
          </g>
        );
      })}
      <line x1={30 + 300 * scan} y1={28} x2={30 + 300 * scan} y2={144} stroke={C.focus} strokeWidth={1.4} opacity={scan > 0 && scan < 1 ? 1 : 0} />
      <T x={380} y={60} s={13} f={C.secondary} o={samp}>
        sample recompute
      </T>
      <T x={380} y={82} s={14} f={C.focus} o={samp}>
        matches
      </T>
      <Tick x={460} y={78} k={easeOut(seg(t, 2.4, 2.7))} />
      {bad > 0 && (
        <g opacity={Math.min(1, bad)}>
          <rect x={30} y={154} width={300} height={22} rx={2} fill={C.bad} stroke={C.badText} />
          <T x={40} y={170} s={13} f={C.focus}>
            order_99 · not meant
          </T>
          <T x={575} y={170} s={13} f={C.badText} a="end">
            blocks the swap
          </T>
        </g>
      )}
      <T x={30} y={202} s={13} f={C.secondary} o={easeOut(seg(t, 3.8, 4.2))}>
        only the intended change, or no swap
      </T>
    </Svg>
  );
}

// 9 · Five glyph rows, each drawing its picture and then its line.
export function Recap({ t }: StepCtx) {
  const ROWS: [string, string, string?][] = [
    ['chunks', 'independent'],
    ['checkpoint', 'resumes past the crash', C.second],
    ['throttle', 'reacts to latency'],
    ['shadow', 'one atomic swap'],
    ['diff', 'only the intended change'],
  ];
  return (
    <Svg label="chunks, checkpoint, throttle, shadow-and-swap, and the diff gate, side by side" h={290}>
      {ROWS.map(([l, r, c], i) => {
        const y = 40 + i * 55;
        const at = i * 0.65;
        return (
          <g key={l} opacity={easeOut(seg(t, at, at + 0.4))}>
            {i === 0 && [0, 1, 2, 3, 4, 5, 6, 7].map((j) => <rect key={j} x={30 + (j % 4) * 20} y={y - 16 + Math.floor(j / 4) * 10} width={16} height={8} fill={j < 5 ? C.focus : C.line} />)}
            {i === 1 && (
              <g>
                <rect x={30} y={y - 14} width={78} height={8} fill={C.line} />
                <rect x={30} y={y - 14} width={50} height={8} fill={C.focus} />
                <rect x={30} y={y - 3} width={50} height={4} fill={C.second} />
              </g>
            )}
            {i === 2 && [0, 1, 2, 3, 4, 5].map((j) => <rect key={j} x={30 + j * 13} y={y - 16} width={9} height={18} fill={j < 3 ? C.focus : C.band} stroke={j < 3 ? 'none' : C.line} />)}
            {i === 3 && (
              <g>
                <rect x={30} y={y - 16} width={32} height={18} rx={2} fill="none" stroke={C.line} />
                <rect x={76} y={y - 16} width={32} height={18} rx={2} fill="none" stroke={C.focus} strokeWidth={1.6} />
                <line x1={62} y1={y - 22} x2={76} y2={y - 22} stroke={C.focus} />
              </g>
            )}
            {i === 4 && [0, 1, 2].map((j) => <rect key={j} x={30} y={y - 16 + j * 7} width={78} height={5} fill={j === 1 ? C.focus : C.line} />)}
            <Line2 y={y} l={l} r={r} lx={125} lc={C.primary} rc={c ?? C.focus} o={easeOut(seg(t, at + 0.2, at + 0.5))} />
          </g>
        );
      })}
    </Svg>
  );
}

// 10 · The throttle switch is off; latency climbs past the threshold while all ten slots stay lit. After the pick, the
// switch flips on, the slots fall away as latency demands, and the latency line bends back under the threshold.
export function ProveIt({ t, answer }: StepCtx) {
  const s = useSinceAnswer(answer !== null);
  const on = answer !== null;
  const flip = on ? easeInOut(seg(s, 0.2, 0.5)) : 0;
  const climb = easeInOut(seg(t, 0.3, 1.6));
  const back = on ? easeInOut(seg(s, 0.6, 2.4)) : 0;
  const msNow = on ? lerp(180, 90, back) : lerp(50, 180, climb);
  const n = on && flip > 0.5 ? conc(msNow) : 10;
  const X = (u: number) => 160 + u * 230;
  const Yv = (ms: number) => 140 - (ms / 250) * 110;
  const pts: [number, number, number][] = [];
  for (let i = 0; i <= 40; i++) {
    const u = (i / 40) * (on ? 1 : climb) * 0.6;
    pts.push([X(u), Yv(lerp(50, 180, u / 0.6)), lerp(50, 180, u / 0.6)]);
  }
  if (on) for (let i = 1; i <= 30; i++) pts.push([X(0.6 + (i / 30) * 0.4 * back), Yv(lerp(180, 90, (i / 30) * back)), lerp(180, 90, (i / 30) * back)]);
  const all = pts.map((q) => `${q[0]},${q[1]}`).join(' ');
  const hot = pts.filter((q) => q[2] > 100).map((q) => `${q[0]},${q[1]}`);
  return (
    <Svg label="a throttle disabled to go faster; latency already climbing" h={250}>
      <g opacity={easeOut(seg(t, 0, 0.3))}>
        <T x={30} y={44} s={13} f={C.primary}>
          throttle
        </T>
        <rect x={30} y={56} width={48} height={24} rx={12} fill={flip > 0.5 ? C.focus : C.band} stroke={C.line} />
        <circle cx={lerp(42, 66, flip)} cy={68} r={9} fill={flip > 0.5 ? C.ink : C.secondary} />
        <T x={30} y={100} s={13} f={flip > 0.5 ? C.focus : C.badText}>
          {flip > 0.5 ? 'on' : 'off'}
        </T>
      </g>
      <g opacity={easeOut(seg(t, 0, 0.3))}>
        <line x1={160} y1={140} x2={390} y2={140} stroke={C.line} />
        <line x1={160} y1={Yv(100)} x2={390} y2={Yv(100)} stroke={C.secondary} strokeDasharray="4 4" />
        <T x={160} y={24} s={13} f={C.secondary}>
          latency
        </T>
      </g>
      <polyline points={all} fill="none" stroke={C.focus} strokeWidth={2} />
      {hot.length > 1 && <polyline points={hot.join(' ')} fill="none" stroke={C.badText} strokeWidth={2.4} />}
      <Slots x={430} y={60} n={n} o={easeOut(seg(t, 0, 0.3))} />
      <T x={500} y={44} s={13} f={C.secondary} a="middle" o={easeOut(seg(t, 0, 0.3))}>
        concurrency
      </T>
      <Box x={30} y={170} w={250} label="keep going full speed?" dash="4 3" o={easeOut(seg(t, 0.8, 1.2)) * (1 - 0.6 * flip)} />
      <Box x={320} y={170} w={250} label="throttle back on, now" lit o={on ? easeOut(seg(s, 0.4, 0.8)) : 0} />
      <T x={300} y={236} s={13} f={C.secondary} a="middle" o={on ? easeOut(seg(s, 2.2, 2.6)) : 0}>
        the latency signal governs again
      </T>
    </Svg>
  );
}
