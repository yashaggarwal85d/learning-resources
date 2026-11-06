import { useEffect, useState } from 'react';
import { C, Draw, Svg, T } from '../../../../../reels/kit';
import { easeInOut, easeOut, easeOutBack, lerp, seg } from '../../../../../reels/anim';
import type { StepCtx } from '../../../../../reels/types';

// CHAPTER.md, topic 1 (chapter opener): the five levels as a pyramid with each level's time horizon as a bar from
// milliseconds to weeks; the hierarchy with a machine sliding from one line to another on a dated timeline, and two
// totals for line 4 (joined as-of, joined to today) side by side with the difference in red. examples.py: press7 moves
// from L4 to L6 on 2026-03-15 inside a 1 January to 31 May window; as-of totals L4 34,933 and L6 29,057, current-row
// totals L4 23,940 and L6 40,050; L4 loses 10,993 good parts, 31 percent; press7's two rows carry keys 1 and 2.

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

const n0 = (v: number) => Math.round(v).toLocaleString('en-US');

// 1 · Two line lanes over January to May. press7 rides the L4 lane, then on 15 March drops to the L6 lane and carries
// on. The dashboard's L4 total counts up to 23,940 with a tick; then a question mark lands beside it.
export function Hook({ t }: StepCtx) {
  const X = (d: number) => 90 + (d / 151) * 480;
  const MOVE = 73;
  const run = seg(t, 0.5, 2.6);
  const day = run * 151;
  const dropped = day >= MOVE;
  const px = X(day);
  const py = dropped ? lerp(56, 116, easeInOut(Math.min(1, (day - MOVE) / 8))) : 56;
  const tot = easeOut(seg(t, 2.8, 3.6));
  const q = easeOutBack(seg(t, 3.9, 4.3));
  return (
    <Svg label="a line's performance total looks solid on its own, but one of its machines moved to another line partway through the window — which total is real?" h={200}>
      {['L4', 'L6'].map((l, i) => (
        <g key={l} opacity={easeOut(seg(t, i * 0.1, 0.3 + i * 0.1))}>
          <T x={30} y={61 + i * 60} s={14} f={C.primary}>
            {l}
          </T>
          <line x1={90} y1={56 + i * 60} x2={570} y2={56 + i * 60} stroke={C.line} strokeWidth={8} strokeLinecap="round" opacity={0.5} />
        </g>
      ))}
      <T x={90} y={26} s={13} f={C.secondary} o={easeOut(seg(t, 0.2, 0.4))}>
        January
      </T>
      <T x={570} y={26} s={13} f={C.secondary} a="end" o={easeOut(seg(t, 0.2, 0.4))}>
        May
      </T>
      {run > 0 && (
        <g>
          <line x1={90} y1={56} x2={Math.min(px, X(MOVE))} y2={56} stroke={C.focus} strokeWidth={3} />
          {dropped && <line x1={X(MOVE)} y1={116} x2={px} y2={116} stroke={C.focus} strokeWidth={3} />}
          <circle cx={px} cy={py} r={7} fill={C.focus} />
        </g>
      )}
      {dropped && (
        <g opacity={easeOut(seg(day, MOVE, MOVE + 10))}>
          <line x1={X(MOVE)} y1={60} x2={X(MOVE)} y2={112} stroke={C.second} strokeDasharray="3 3" />
          <T x={X(MOVE) + 8} y={90} s={13} f={C.second}>
            press7 moves, 15 March
          </T>
        </g>
      )}
      <T x={30} y={176} s={14} f={C.secondary} o={tot}>
        L4 on the dashboard
      </T>
      <T x={520} y={176} s={14} f={C.focus} a="end" o={tot}>
        {n0(23940 * tot)}
      </T>
      {q > 0 && (
        <T x={548} y={178} s={18} f={C.badText} a="middle" o={Math.min(1, q)}>
          ?
        </T>
      )}
    </Svg>
  );
}

// 2 · The pyramid builds from the process up, one level at a time. Then each level's reaction time grows as a bar on a
// log scale, from milliseconds at the bottom to weeks at the top.
export function RevealLevels({ t }: StepCtx) {
  const LV: [string, string, number][] = [
    ['0 · process', 'the process itself', -1],
    ['1 · sensors', 'milliseconds', -3],
    ['2 · PLC', 'seconds', 0],
    ['3 · MES', 'hours', 3.56],
    ['4 · ERP', 'weeks', 5.78],
  ];
  const XL = (lg: number) => 330 + ((lg + 3) / 8.78) * 240;
  return (
    <Svg label="five levels, from the physical process to business planning, split by how fast each one has to react rather than by which department owns it" h={226}>
      {LV.map(([l, h, lg], i) => {
        const y = 174 - i * 37;
        const w = 270 - i * 30;
        const x = 30 + (270 - w) / 2;
        const k = easeOutBack(seg(t, 0.2 + i * 0.3, 0.5 + i * 0.3));
        const bar = easeInOut(seg(t, 2.0 + i * 0.25, 2.5 + i * 0.25));
        return (
          <g key={l}>
            {k > 0 && (
              <g opacity={Math.min(1, k)}>
                <rect x={x} y={y} width={w} height={33} rx={3} fill={C.panel} stroke={i === 0 ? C.line : C.primary} />
                <T x={x + w / 2} y={y + 22} s={14} f={C.focus} a="middle">
                  {l}
                </T>
              </g>
            )}
            <T x={330} y={y + 14} s={13} f={i === 0 ? C.quiet : C.secondary} o={easeOut(seg(t, 2.0 + i * 0.25, 2.3 + i * 0.25))}>
              {h}
            </T>
            {i > 0 && <rect x={330} y={y + 21} width={Math.max(0, (XL(lg) - 330 + 6) * bar)} height={6} rx={2} fill={C.focus} />}
          </g>
        );
      })}
      <T x={450} y={222} s={13} f={C.second} a="middle" o={easeOut(seg(t, 3.6, 4.0))}>
        how fast it must react
      </T>
      <T x={165} y={224} s={13} f={C.secondary} a="middle" o={easeOut(seg(t, 4.0, 4.4))}>
        not a department
      </T>
    </Svg>
  );
}

// 3 · Two level stacks side by side. A SCADA chip pops onto level 3 in the standard's stack, another onto level 2 in
// the practitioners' stack, and a red "≠" sits between them. Both stacks dim, and what survives lights up.
export function RevealScadaTrap({ t }: StepCtx) {
  const split = easeInOut(seg(t, 0.9, 1.8));
  const dim = easeOut(seg(t, 3.0, 3.5));
  const keep = easeOut(seg(t, 3.6, 4.1));
  const stack = (x0: number, title: string, tc: string, scadaRow: number, o: number) => (
    <g opacity={o}>
      <T x={x0} y={24} s={13} f={tc}>
        {title}
      </T>
      {[4, 3, 2, 1].map((lv, r) => (
        <g key={lv}>
          <rect x={x0} y={36 + r * 34} width={240} height={28} rx={3} fill={C.panel} stroke={lv === scadaRow && split >= 1 ? tc : C.line} />
          <T x={x0 + 12} y={55 + r * 34} s={13} f={C.secondary}>
            {`level ${lv}`}
          </T>
        </g>
      ))}
    </g>
  );
  const chip = (x: number, y: number, c: string) => (
    <g>
      <rect x={x} y={y} width={84} height={22} rx={3} fill={C.panel} stroke={c} strokeWidth={1.6} />
      <T x={x + 42} y={y + 16} s={13} f={c} a="middle">
        SCADA
      </T>
    </g>
  );
  return (
    <Svg label="the standard's own page and common practitioner diagrams disagree about which level houses supervisory control and data acquisition — what survives the disagreement?" h={220}>
      {stack(30, "the standard's page", C.focus, 3, easeOut(seg(t, 0, 0.3)) * (1 - dim * 0.7))}
      {stack(330, 'many diagrams', C.second, 2, easeOut(seg(t, 0.2, 0.5)) * (1 - dim * 0.7))}
      {t > 0.9 && (
        <g opacity={Math.min(1, easeOutBack(seg(t, 0.9, 1.3))) * (1 - dim * 0.7)}>
          {chip(108, 39 + 34, C.focus)}
        </g>
      )}
      {t > 1.4 && (
        <g opacity={Math.min(1, easeOutBack(seg(t, 1.4, 1.8))) * (1 - dim * 0.7)}>
          {chip(408, 39 + 68, C.second)}
        </g>
      )}
      {split >= 1 && (
        <T x={300} y={124} s={16} f={C.badText} a="middle" o={easeOut(seg(t, 1.8, 2.2)) * (1 - dim)}>
          ≠
        </T>
      )}
      {keep > 0 && (
        <g opacity={keep}>
          <rect x={30} y={180} width={540} height={32} rx={4} fill={C.panel} stroke={C.focus} strokeWidth={1.8} />
          <T x={300} y={201} s={14} f={C.focus} a="middle">
            what survives: a level is a time horizon
          </T>
        </g>
      )}
    </Svg>
  );
}

// 4 · The hierarchy as it stands now, ticking "now". A question about last quarter arrives at it. After the answer, the
// press7 row goes red: in that quarter press7 was on L4, so its current row is the wrong row to ask.
export function PredictCurrentTable({ t, answer }: StepCtx) {
  const s = useSinceAnswer(answer !== null);
  const on = answer !== null;
  const red = on ? easeOut(seg(s, 0.3, 0.7)) : 0;
  const fix = on ? easeOut(seg(s, 1.1, 1.5)) : 0;
  const ROWS: [string, string][] = [
    ['press7', 'L6'],
    ['press12', 'L4'],
    ['press9', 'L6'],
  ];
  return (
    <Svg label="a perfectly up-to-date hierarchy table says where every machine sits right now — does looking a machine up in it correctly answer a question about last quarter?" h={200}>
      <T x={30} y={24} s={13} f={C.secondary} o={easeOut(seg(t, 0, 0.3))}>
        hierarchy, right now
      </T>
      {ROWS.map(([m, l], i) => {
        const bad = i === 0 && red > 0.5;
        return (
          <g key={m} opacity={easeOut(seg(t, 0.1 + i * 0.1, 0.4 + i * 0.1))}>
            <rect x={30} y={34 + i * 32} width={230} height={26} rx={3} fill={bad ? C.bad : C.panel} stroke={bad ? C.badText : C.line} />
            <T x={42} y={52 + i * 32} s={13} f={bad ? C.focus : C.primary}>
              {m}
            </T>
            <T x={248} y={52 + i * 32} s={13} f={bad ? C.focus : C.focus} a="end">
              {l}
            </T>
          </g>
        );
      })}
      <Box x={330} y={58} w={240} h={30} label="last quarter, by line?" o={easeOut(seg(t, 0.8, 1.1))} />
      <Draw pts={[[330, 73], [264, 73]]} t={t} from={1.1} to={1.5} stroke={C.secondary} w={1.4} pen={false} />
      {!on && (
        <T x={450} y={130} s={16} f={C.secondary} a="middle" o={easeOut(seg(t, 1.6, 2.0))}>
          ?
        </T>
      )}
      {red > 0 && (
        <T x={330} y={130} s={13} f={C.badText} o={red}>
          press7 was on L4 then
        </T>
      )}
      {fix > 0 && (
        <T x={30} y={186} s={14} f={C.focus} o={fix}>
          carry the reading's time into the join
        </T>
      )}
    </Svg>
  );
}

// 5 · One open row for press7 on L4. The move does not overwrite it: its window closes at 15 March and a second row,
// key 2 on L6, slides in beneath. The timeline under the table splits into the two windows.
export function RevealScdRows({ t }: StepCtx) {
  const close = easeOut(seg(t, 1.4, 1.8));
  const add = easeOutBack(seg(t, 1.9, 2.4));
  const line = seg(t, 2.8, 4.0);
  const COLS = [30, 120, 220, 410];
  const HEAD = ['key', 'line', 'valid_from', 'valid_to'];
  const row = (y: number, cells: string[], o: number, lit: boolean) => (
    <g opacity={o}>
      <rect x={24} y={y - 18} width={552} height={26} rx={3} fill={C.panel} stroke={lit ? C.focus : C.line} strokeWidth={lit ? 1.6 : 1} />
      {cells.map((c, i) => (
        <T key={i} x={COLS[i]} y={y} s={13} f={i === 3 && c === '2026-03-15' && close < 1 ? C.second : C.primary}>
          {c}
        </T>
      ))}
    </g>
  );
  return (
    <Svg label="one physical press gets two separate hierarchy rows across its move, each with its own validity window and its own surrogate key" h={220}>
      <T x={575} y={24} s={13} f={C.secondary} a="end" o={easeOut(seg(t, 0, 0.3))}>
        press7
      </T>
      {HEAD.map((h, i) => (
        <T key={h} x={COLS[i]} y={24} s={13} f={C.quiet} o={easeOut(seg(t, 0, 0.3))}>
          {h}
        </T>
      ))}
      {row(56, ['1', 'L4', '2026-01-01', close > 0.5 ? '2026-03-15' : '9999-12-31'], easeOut(seg(t, 0.2, 0.5)), false)}
      {add > 0 && row(90, ['2', 'L6', '2026-03-15', '9999-12-31'], Math.min(1, add), true)}
      {line > 0 && (
        <g>
          <line x1={30} y1={150} x2={lerp(30, 330, Math.min(1, line * 2))} y2={150} stroke={C.primary} strokeWidth={6} />
          {line > 0.5 && <line x1={330} y1={150} x2={lerp(330, 570, (line - 0.5) * 2)} y2={150} stroke={C.focus} strokeWidth={6} />}
          <line x1={330} y1={138} x2={330} y2={162} stroke={C.second} strokeWidth={1.6} />
          <T x={180} y={180} s={13} f={C.primary} a="middle">
            key 1 · L4
          </T>
          {line > 0.5 && (
            <T x={450} y={180} s={13} f={C.focus} a="middle">
              key 2 · L6
            </T>
          )}
        </g>
      )}
      <T x={300} y={210} s={13} f={C.secondary} a="middle" o={easeOut(seg(t, 4.0, 4.4))}>
        a new row, not an edit
      </T>
    </Svg>
  );
}

// 6 · The same readings joined two ways. The as-of bars land at 34,933 for L4 and 29,057 for L6; the current-row bars at
// 23,940 and 40,050. The 10,993 gap shows as a dashed hole in L4 and the same red block stacked onto L6.
export function RevealJoinBug({ t }: StepCtx) {
  const W = (v: number) => (v / 40050) * 300;
  const a = easeInOut(seg(t, 0.4, 1.4));
  const c = easeInOut(seg(t, 1.8, 2.8));
  const gap = easeOut(seg(t, 3.2, 3.8));
  const bar = (y: number, v: number, k: number, col: string) => (
    <g>
      <rect x={140} y={y - 12} width={Math.max(0, W(v) * k)} height={14} rx={2} fill={col} />
      <T x={575} y={y} s={14} f={col === C.second ? C.second : C.focus} a="end" o={k > 0 ? 1 : 0}>
        {n0(v * k)}
      </T>
    </g>
  );
  return (
    <Svg label="the identical stream of readings, joined by event time against joined to the machine's latest row — the two totals for each line come out measurably different" h={260}>
      <T x={30} y={24} s={13} f={C.focus} o={easeOut(seg(t, 0.2, 0.5))}>
        joined as of each reading
      </T>
      <T x={90} y={52} s={14} f={C.primary} o={easeOut(seg(t, 0.2, 0.5))}>
        L4
      </T>
      <T x={90} y={80} s={14} f={C.primary} o={easeOut(seg(t, 0.2, 0.5))}>
        L6
      </T>
      {bar(52, 34933, a, C.focus)}
      {bar(80, 29057, a, C.focus)}
      <T x={30} y={118} s={13} f={C.second} o={easeOut(seg(t, 1.6, 1.9))}>
        joined to the current row
      </T>
      <T x={90} y={146} s={14} f={C.primary} o={easeOut(seg(t, 1.6, 1.9))}>
        L4
      </T>
      <T x={90} y={174} s={14} f={C.primary} o={easeOut(seg(t, 1.6, 1.9))}>
        L6
      </T>
      {bar(146, 23940, c, C.second)}
      {bar(174, 29057 * Math.min(1, c) + 10993 * gap, c > 0 ? 1 : 0, C.second)}
      {gap > 0 && (
        <g opacity={gap}>
          <rect x={140 + W(23940)} y={134} width={W(10993)} height={14} rx={2} fill="none" stroke={C.badText} strokeDasharray="4 3" />
          <rect x={140 + W(29057)} y={162} width={W(10993)} height={14} rx={2} fill={C.badText} />
        </g>
      )}
      <T x={30} y={216} s={14} f={C.badText} o={easeOut(seg(t, 3.8, 4.2))}>
        L4 loses 10,993 · 31%
      </T>
      <T x={30} y={244} s={13} f={C.secondary} o={easeOut(seg(t, 4.3, 4.7))}>
        not one reading changed
      </T>
    </Svg>
  );
}

// 7 · Two rows share the id press7; a reading looked up by id alone lights both, and a red "?" hangs between them. Then
// the key and its window take over: the February reading lands on key 1, the April one on key 2.
export function RevealDurableKey({ t }: StepCtx) {
  const both = easeOut(seg(t, 0.8, 1.2));
  const pick = easeOut(seg(t, 2.2, 2.6));
  const r1 = easeInOut(seg(t, 2.6, 3.2));
  const r2 = easeInOut(seg(t, 3.4, 4.0));
  const ROW = (y: number, k: string, l: string, w: string, lit: boolean) => (
    <g>
      <rect x={200} y={y} width={370} height={30} rx={3} fill={C.panel} stroke={lit ? C.focus : C.line} strokeWidth={lit ? 1.6 : 1} />
      <T x={212} y={y + 20} s={13} f={pick > 0 ? C.focus : C.secondary}>
        {k}
      </T>
      <rect x={270} y={y + 6} width={70} height={18} rx={2} fill={both > 0 && pick < 1 ? C.band : 'none'} />
      <T x={276} y={y + 20} s={13} f={C.primary}>
        press7
      </T>
      <T x={356} y={y + 20} s={13} f={C.primary}>
        {l}
      </T>
      <T x={560} y={y + 20} s={13} f={pick > 0 ? C.focus : C.secondary} a="end">
        {w}
      </T>
    </g>
  );
  return (
    <Svg label="the machine's own identifier is identical across both hierarchy rows — what actually tells the join which row answers for which reading?" h={220}>
      {ROW(40, 'key 1', 'L4', 'Jan 1 → Mar 15', r1 >= 1)}
      {ROW(90, 'key 2', 'L6', 'Mar 15 → open', r2 >= 1)}
      <Box x={30} y={64} w={140} h={30} label="press7 only" o={easeOut(seg(t, 0.2, 0.5)) * (1 - pick)} />
      {both > 0 && pick < 1 && (
        <g opacity={both * (1 - pick)}>
          <line x1={170} y1={79} x2={200} y2={55} stroke={C.badText} />
          <line x1={170} y1={79} x2={200} y2={105} stroke={C.badText} />
          <T x={185} y={150} s={16} f={C.badText} a="middle">
            ?
          </T>
          <T x={30} y={150} s={13} f={C.badText}>
            two rows match
          </T>
        </g>
      )}
      {r1 > 0 && <Box x={lerp(30, 30, r1)} y={lerp(140, 40, r1)} w={150} h={30} label="reading, 1 Feb" lit={r1 >= 1} />}
      {r2 > 0 && <Box x={30} y={lerp(140, 90, r2)} w={150} h={30} label="reading, 1 Apr" lit={r2 >= 1} />}
      <T x={575} y={200} s={13} f={C.focus} a="end" o={easeOut(seg(t, 4.0, 4.4))}>
        the key and its window pick the row
      </T>
    </Svg>
  );
}

// 8 · Four rows, each with the glyph of the move it names.
export function Recap({ t }: StepCtx) {
  const ROWS: [string, string, string?][] = [
    ['five levels', 'by time horizon'],
    ['SCADA', 'the idea survives', C.second],
    ['hierarchy', 'a new row per move'],
    ['join bug', '10,993 moved', C.badText],
  ];
  return (
    <Svg label="five levels by time horizon, the SCADA disagreement resolved, a versioned hierarchy, and a measured join bug that moves output between lines without touching a reading" h={260}>
      {ROWS.map(([l, r, c], i) => {
        const y = 44 + i * 60;
        const at = i * 0.9;
        return (
          <g key={l} opacity={easeOut(seg(t, at, at + 0.4))}>
            {i === 0 && [0, 1, 2, 3, 4].map((j) => <rect key={j} x={30 + j * 6} y={y - 4 - j * 5} width={78 - j * 12} height={4} fill={C.focus} />)}
            {i === 1 && (
              <g>
                <rect x={30} y={y - 16} width={34} height={14} rx={2} fill="none" stroke={C.focus} />
                <rect x={72} y={y - 8} width={34} height={14} rx={2} fill="none" stroke={C.second} />
              </g>
            )}
            {i === 2 && (
              <g>
                <rect x={30} y={y - 18} width={78} height={8} fill={C.primary} />
                <rect x={30} y={y - 6} width={78} height={8} fill={C.focus} />
              </g>
            )}
            {i === 3 && (
              <g>
                <rect x={30} y={y - 16} width={40} height={7} fill={C.focus} />
                <rect x={70} y={y - 16} width={20} height={7} fill="none" stroke={C.badText} strokeDasharray="2 2" />
                <rect x={30} y={y - 5} width={56} height={7} fill={C.focus} />
                <rect x={86} y={y - 5} width={20} height={7} fill={C.badText} />
              </g>
            )}
            <Line2 y={y} l={l} r={r} lx={125} lc={C.primary} rc={c ?? C.focus} o={easeOut(seg(t, at + 0.2, at + 0.5))} />
          </g>
        );
      })}
    </Svg>
  );
}

// 9 · A reading taken before press7's move arrives after the daily cache already learned the move. Joined to the cache
// it lands on L6. After the answer, that landing is struck and the as-of join sends it to L4.
export function ProveIt({ t, answer }: StepCtx) {
  const s = useSinceAnswer(answer !== null);
  const on = answer !== null;
  const arrive = easeInOut(seg(t, 1.2, 2.2));
  const wrong = easeOut(seg(t, 2.2, 2.6));
  const cut = on ? easeOut(seg(s, 0.3, 0.7)) : 0;
  const fix = on ? easeOut(seg(s, 0.9, 1.4)) : 0;
  const EV: [number, string][] = [
    [110, 'reading taken'],
    [270, 'press7 moves'],
    [430, 'cache refresh'],
  ];
  return (
    <Svg label="a dashboard caches each machine's current line once a day and joins every incoming reading to that cache — is an older reading guaranteed to land on the right line?" h={220}>
      <line x1={30} y1={50} x2={570} y2={50} stroke={C.line} opacity={easeOut(seg(t, 0, 0.3))} />
      {EV.map(([x, l], i) => (
        <g key={l} opacity={easeOut(seg(t, 0.2 + i * 0.25, 0.5 + i * 0.25))}>
          <circle cx={x} cy={50} r={5} fill={i === 0 ? C.focus : C.secondary} />
          <T x={x} y={32} s={13} f={i === 0 ? C.focus : C.secondary} a="middle">
            {l}
          </T>
        </g>
      ))}
      <Box x={330} y={100} w={240} h={30} label="cache: press7 → L6" o={easeOut(seg(t, 0.9, 1.2))} />
      {arrive > 0 && <circle cx={lerp(110, 330, arrive)} cy={lerp(50, 115, arrive)} r={6} fill={C.focus} />}
      {wrong > 0 && (
        <g opacity={wrong}>
          <Box x={330} y={150} w={240} h={30} label="lands on L6" stroke={C.badText} f={C.badText} />
          <Cross x={556} y={165} k={cut} />
        </g>
      )}
      {fix > 0 && <Box x={30} y={150} w={270} h={30} label="as of its own time → L4" lit o={fix} />}
      {!on && (
        <T x={165} y={170} s={16} f={C.secondary} a="middle" o={easeOut(seg(t, 2.6, 3.0))}>
          ?
        </T>
      )}
      {on && (
        <T x={30} y={208} s={13} f={C.focus} o={easeOut(seg(s, 1.4, 1.8))}>
          the reading's timestamp goes into the lookup
        </T>
      )}
    </Svg>
  );
}
