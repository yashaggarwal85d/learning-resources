import { useEffect, useState } from 'react';
import { C, Decode, Draw, Reticle, Svg, T } from '../../../../../reels/kit';
import { clamp, easeInOut, easeOut, easeOutBack, lerp, seg } from '../../../../../reels/anim';
import type { StepCtx } from '../../../../../reels/types';

// Series cardinality, drawn from examples.py's own plant: 3 sites, 8 lines, 12 machines, 5 sensor kinds, 3 statuses;
// 1,297 real series against a 4,320 worst case; a postings intersection of 66; a 40,000-batch label.

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
const Box = ({
  x,
  y,
  w,
  h = 32,
  label,
  lit = false,
  o = 1,
  dash,
  stroke,
  f,
  fill,
}: {
  x: number;
  y: number;
  w: number;
  h?: number;
  label: string;
  lit?: boolean;
  o?: number;
  dash?: string;
  stroke?: string;
  f?: string;
  fill?: string;
}) =>
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
      <line x1={x - 6} y1={y - 6} x2={x + 6} y2={y + 6} />
      <line x1={x + 6} y1={y - 6} x2={x - 6} y2={y + 6} />
    </g>
  );

type Pt = readonly [number, number];

// The plant from examples.py: 1,297 series with ids 0–1,296; plantA owns ids 0–425; these are the 202 ids of the
// sensor="temperature" postings list (random.Random(7)).
// prettier-ignore
const TEMP = [3, 6, 9, 13, 16, 23, 25, 32, 40, 53, 56, 65, 73, 84, 87, 95, 99, 116, 122, 130, 136, 143, 149, 154, 158, 161, 166, 169, 176, 178, 184, 191, 208, 215, 222, 225, 234, 237, 246, 251, 255, 262, 264, 273, 284, 290, 293, 297, 305, 309, 314, 319, 330, 340, 346, 351, 354, 366, 369, 376, 383, 399, 404, 414, 416, 422, 427, 440, 442, 449, 456, 465, 470, 477, 485, 492, 497, 505, 508, 513, 526, 532, 535, 539, 543, 549, 564, 570, 576, 590, 604, 612, 620, 625, 630, 636, 643, 650, 663, 668, 675, 693, 696, 703, 707, 712, 718, 725, 732, 741, 747, 753, 758, 761, 773, 775, 780, 782, 788, 793, 796, 801, 808, 816, 825, 830, 840, 846, 852, 857, 859, 867, 871, 874, 881, 888, 892, 896, 900, 911, 916, 918, 927, 930, 941, 945, 947, 953, 964, 969, 979, 987, 993, 995, 1002, 1016, 1020, 1024, 1036, 1043, 1048, 1055, 1061, 1067, 1072, 1077, 1083, 1092, 1094, 1099, 1103, 1116, 1122, 1126, 1129, 1135, 1144, 1154, 1157, 1163, 1168, 1172, 1175, 1185, 1190, 1204, 1208, 1212, 1216, 1219, 1226, 1229, 1234, 1240, 1254, 1257, 1260, 1268, 1273, 1279, 1286, 1293];
const IS_TEMP = new Set(TEMP);
const SERIES = 1297;
const PLANT_A = 426;

// 0 · The one-line change. A label set {site, line, equipment, sensor} gains a red "batch". The memory line beside it,
// flat for a while, turns upward the moment the label lands, climbs through the dashed limit, and the process is
// crossed out: killed.
export function Hook({ t }: StepCtx) {
  const keys = ['site', 'line', 'equipment', 'sensor'];
  const kx = [25, 95, 160, 285];
  const add = easeOutBack(seg(t, 1.0, 1.5));
  const mem: Pt[] = Array.from({ length: 41 }, (_, i) => {
    const u = i / 40;
    const x = 40 + u * 360;
    const y = u < 0.3 ? 170 : 170 - Math.pow((u - 0.3) / 0.7, 2) * 120;
    return [x, y] as const;
  });
  return (
    <Svg label="a team adds a batch label to every sensor series, and within a day the metrics server's memory climbs far past its usual size and gets killed, from a one-line change" h={200}>
      {keys.map((k, i) => (
        <T key={k} x={kx[i]} y={30} s={13} f={C.primary} o={easeOut(seg(t, i * 0.12, 0.3 + i * 0.12))}>
          {k}
        </T>
      ))}
      <T x={385} y={30} s={13} f={C.badText} w={600} o={add}>
        + batch
      </T>
      <line x1={385} y1={36} x2={385 + 70 * add} y2={36} stroke={C.badText} strokeWidth={1.4} />
      <line x1={40} y1={70} x2={400} y2={70} stroke={C.badText} strokeWidth={1} strokeDasharray="4 4" opacity={easeOut(seg(t, 1.6, 2.0))} />
      <T x={412} y={74} s={12} f={C.badText} o={easeOut(seg(t, 1.6, 2.0))}>
        memory limit
      </T>
      <T x={40} y={192} s={12} f={C.quiet} o={easeOut(seg(t, 1.8, 2.1))}>
        memory over one day
      </T>
      <Draw pts={mem} t={t} from={2.0} to={4.2} stroke={seg(t, 4.0, 4.02) > 0 ? C.badText : C.focus} w={2.2} />
      <Cross x={420} y={52} k={easeOutBack(seg(t, 4.3, 4.7))} />
      <T x={438} y={57} s={14} f={C.badText} w={600} o={easeOut(seg(t, 4.4, 4.8))}>
        killed
      </T>
    </Svg>
  );
}

// 1 · Series identity, slot by slot. A reading's labels plantA line1 eq1 temperature are series 3. A second reading with
// the same four values joins series 3. One with line2 instead — the changed slot turns red — is a new series. One with
// an extra batch label is a new series too. Each new reading drops in and a cursor compares it slot by slot with the
// first, stopping red at the first slot that differs; the verdict decodes; brackets lock onto the last "new".
export function RevealSeriesIdentity({ t }: StepCtx) {
  const sx = [25, 130, 225, 290, 455];
  const sw = [40, 40, 40, 90, 40];
  const rows: { v: string[]; bad: number; r: string; at: number }[] = [
    { v: ['plantA', 'line1', 'eq1', 'temperature'], bad: -1, r: 'series 3', at: 0 },
    { v: ['plantA', 'line1', 'eq1', 'temperature'], bad: -1, r: 'same: 3', at: 1.0 },
    { v: ['plantA', 'line2', 'eq1', 'temperature'], bad: 1, r: 'new', at: 2.2 },
    { v: ['plantA', 'line1', 'eq1', 'temperature', 'batch'], bad: 4, r: 'new', at: 3.5 },
  ];
  return (
    <Svg label="two readings are the same series only if every label matches exactly; changing one label's value, or adding one, creates a brand new series" h={200}>
      {rows.map((r, i) => {
        const y = 36 + i * 44;
        const k = easeOut(seg(t, r.at, r.at + 0.4));
        // the comparison: a cursor runs slot by slot against the first reading and stops at the first slot that differs
        const last = r.bad >= 0 ? r.bad : 3;
        const scan = i === 0 ? 0 : clamp((t - r.at - 0.3) / 0.15, 0, last);
        const j0 = Math.floor(scan);
        const cx = lerp(sx[j0], sx[Math.min(last, j0 + 1)], easeInOut(scan - j0));
        const cw = lerp(sw[j0], sw[Math.min(last, j0 + 1)], easeInOut(scan - j0));
        const scanning = i > 0 && t > r.at + 0.3;
        const mark = easeOut(seg(t, r.at + 0.3 + last * 0.15 + 0.1, r.at + 0.3 + last * 0.15 + 0.4));
        return (
          <g key={i} opacity={k} transform={`translate(0 ${((1 - k) * -16).toFixed(1)})`}>
            {r.v.map((v, j) => {
              const bad = j === r.bad;
              const extra = j === 4 ? easeOutBack(seg(t, r.at + 0.2, r.at + 0.6)) : 1;
              return (
                <g key={j} transform={j === 4 ? `translate(${((1 - clamp(extra, 0, 1.1)) * 60).toFixed(1)} 0)` : undefined}>
                  <T x={sx[j]} y={y} s={13} f={bad && mark > 0.5 ? C.badText : C.primary}>
                    {v}
                  </T>
                  <line x1={sx[j]} y1={y + 7} x2={sx[j] + sw[j]} y2={y + 7} stroke={bad && mark > 0.5 ? C.badText : C.line} strokeWidth={1.4} />
                </g>
              );
            })}
            {scanning && <rect x={cx} y={y + 5} width={cw} height={4} rx={2} fill={r.bad >= 0 && mark > 0.5 ? C.badText : C.focus} />}
            <Decode text={r.r} t={t} at={i === 0 ? 0.3 : r.at + 0.3 + last * 0.15 + 0.1} x={575} y={y} s={14} f={r.r === 'new' ? C.badText : C.focus} a="end" w={600} />
          </g>
        );
      })}
      <Reticle x={548} y={163} w={64} h={30} t={t} at={4.6} color={C.badText} />
    </Svg>
  );
}

// 2 · The cross product, factor by factor: 3 sites × 8 lines × 12 equipment × 5 sensors × 3 statuses = 4,320 —
// the worst-case bar. Then the actual bar fills only to 1,297, because each machine has only the sensors it was fitted
// with and status is one series per machine: 30% of the worst case.
export function RevealWorstVsActual({ t }: StepCtx) {
  const f = [
    { n: '3', l: 'sites' },
    { n: '8', l: 'lines' },
    { n: '12', l: 'equip' },
    { n: '5', l: 'sensors' },
    { n: '3', l: 'status' },
  ];
  const fx = (i: number) => 40 + i * 92;
  const W = 450;
  const worst = easeOut(seg(t, 2.1, 2.7));
  const act = easeInOut(seg(t, 3.0, 4.2));
  return (
    <Svg label="the worst-case cross product of every label's distinct values is large; the plant's actual series count, built from real equipment fitment, lands well below it" h={200}>
      {f.map((x, i) => (
        <g key={i} opacity={easeOut(seg(t, i * 0.3, i * 0.3 + 0.35))}>
          <T x={fx(i)} y={36} s={18} f={C.focus} a="middle" w={600}>
            {x.n}
          </T>
          <T x={fx(i)} y={56} s={11} f={C.quiet} a="middle">
            {x.l}
          </T>
          {i < 4 && (
            <T x={fx(i) + 46} y={35} s={14} f={C.quiet} a="middle">
              ×
            </T>
          )}
        </g>
      ))}
      <T x={575} y={36} s={18} f={C.focus} a="end" w={600} o={easeOut(seg(t, 1.6, 2.0))}>
        = 4,320
      </T>

      <T x={25} y={98} s={13} f={C.secondary} o={worst}>
        worst case
      </T>
      <rect x={25} y={106} width={W * worst} height={14} fill={C.quiet} />
      <T x={575} y={118} s={14} f={C.secondary} a="end" o={worst}>
        4,320
      </T>
      <T x={25} y={150} s={13} f={C.secondary} o={easeOut(seg(t, 2.8, 3.1))}>
        actual, fitted sensors
      </T>
      <rect x={25} y={158} width={W * 0.3 * act} height={14} fill={C.focus} />
      <T x={575} y={170} s={14} f={C.focus} a="end" w={600} o={easeOut(seg(t, 4.1, 4.4))}>
        1,297
      </T>
      <T x={300} y={196} s={12} f={C.quiet} a="middle" o={easeOut(seg(t, 4.5, 5.0))}>
        30% of the worst case
      </T>
    </Svg>
  );
}

// The 1,297-series grid shared by the prediction: 72 columns of 6.5-unit cells.
const GX = 66;
const GY = 54;
const GC = 6.5;
const cellXY = (id: number) => [GX + (id % 72) * GC, GY + Math.floor(id / 72) * GC] as const;

// 3 · The query site="plantA", sensor="temperature" above a grid of all 1,297 series. Before the answer a scan band
// sweeps down the grid, row by row, with "?" — one at a time? After it, plantA's block is outlined, the temperature
// series glow pale blue, and only the 66 in both stay white: the index went straight there.
export function PredictScan({ t, answer }: StepCtx) {
  const s = useSinceAnswer(answer !== null);
  const on = answer !== null;
  const grid = easeOut(seg(t, 0.4, 1.2));
  const sweep = on ? 0 : seg(t, 1.6, 4.2);
  const rowsN = Math.ceil(SERIES / 72);
  const lit = on ? easeOut(seg(s, 0.2, 0.9)) : 0;
  const hit = on ? easeOut(seg(s, 0.9, 1.5)) : 0;
  return (
    <Svg label="a query names several labels at once — does answering it mean checking every single series in the system one at a time?" h={200}>
      <T x={25} y={28} s={13} f={C.focus} o={easeOut(seg(t, 0, 0.3))}>
        site=plantA, sensor=temperature
      </T>
      <g opacity={grid}>
        {Array.from({ length: SERIES }, (_, id) => {
          const [x, y] = cellXY(id);
          const temp = IS_TEMP.has(id);
          const both = temp && id < PLANT_A;
          const fill = on ? (both && hit > 0.5 ? C.focus : temp && lit > 0.5 ? C.second : C.line) : C.line;
          return <rect key={id} x={x} y={y} width={GC - 1.2} height={GC - 1.2} fill={fill} opacity={on && !temp && lit > 0.5 ? 0.45 : 1} />;
        })}
      </g>
      {!on && sweep > 0 && sweep < 1 && <rect x={GX - 3} y={GY - 2 + Math.floor(sweep * rowsN) * GC} width={72 * GC + 6} height={GC + 3} fill="none" stroke={C.focus} strokeWidth={1.4} />}
      {on && (
        <path
          d={`M${GX - 2} ${GY - 2} H${GX + 72 * GC + 1} V${GY + 5 * GC + 1} H${GX + 66 * GC + 1} V${GY + 6 * GC + 1} H${GX - 2} Z`}
          fill="none"
          stroke={C.focus}
          strokeWidth={1.2}
          strokeDasharray="4 3"
          opacity={lit}
        />
      )}
      {!on ? (
        <T x={300} y={194} s={13} f={C.focus} a="middle" o={easeOut(seg(t, 1.8, 2.2))}>
          all 1,297, one at a time?
        </T>
      ) : (
        <T x={300} y={194} s={13} f={C.focus} a="middle" w={600} o={hit}>
          66 match, straight from the index
        </T>
      )}
    </Svg>
  );
}

// 4 · Two postings lists aligned by series id 0–32: plantA holds every id, temperature only 3 6 9 13 16 23 25 32. A
// merge pointer walks both; every id on both lists drops into the result row. The full intersection is 66 series.
// Then a regex matcher, equipment=~"eq1.*", has no list: a bar sweeps across all 1,297 series to find 436.
export function RevealPostings({ t }: StepCtx) {
  const vx = (v: number) => 150 + v * 13;
  const ptr = seg(t, 0.9, 2.7);
  const pv = ptr * 32;
  const scan = seg(t, 3.6, 4.9);
  return (
    <Svg label="intersecting two sorted postings lists finds the matching series without touching the rest, while a regex matcher has no postings list and must check every series" h={200}>
      <T x={25} y={32} s={13} f={C.secondary} o={easeOut(seg(t, 0, 0.3))}>
        plantA
      </T>
      <T x={25} y={58} s={13} f={C.second} o={easeOut(seg(t, 0.2, 0.5))}>
        temp
      </T>
      <T x={25} y={88} s={13} f={C.focus} o={easeOut(seg(t, 0.8, 1.1))}>
        both
      </T>
      {Array.from({ length: 33 }, (_, v) => {
        const temp = IS_TEMP.has(v);
        const passed = ptr > 0 && pv >= v;
        return (
          <g key={v}>
            <rect x={vx(v) - 4} y={22} width={8} height={12} fill={C.secondary} opacity={easeOut(seg(t, 0.05 + v * 0.012, 0.3 + v * 0.012))} />
            {temp && <rect x={vx(v) - 4} y={48} width={8} height={12} fill={C.second} opacity={easeOut(seg(t, 0.3, 0.6))} />}
            {temp && passed && <rect x={vx(v) - 4} y={78} width={8} height={12} fill={C.focus} />}
          </g>
        );
      })}
      {ptr > 0 && ptr < 1 && <line x1={vx(pv)} y1={16} x2={vx(pv)} y2={96} stroke={C.focus} strokeWidth={1.2} />}
      <T x={150} y={112} s={11} f={C.quiet} o={easeOut(seg(t, 0.4, 0.8))}>
        ids 0 to 32
      </T>
      <T x={575} y={112} s={14} f={C.focus} a="end" w={600} o={easeOut(seg(t, 2.7, 3.1))}>
        66 series
      </T>

      <T x={25} y={150} s={13} f={C.badText} o={easeOut(seg(t, 3.2, 3.5))}>
        eq1.*
      </T>
      <rect x={150} y={140} width={420} height={12} fill="none" stroke={C.line} strokeWidth={1} opacity={easeOut(seg(t, 3.2, 3.5))} />
      <rect x={150} y={140} width={420 * scan} height={12} fill={C.bad} />
      <T x={150} y={182} s={13} f={C.badText} o={easeOut(seg(t, 4.8, 5.2))}>
        all 1,297 checked
      </T>
      <T x={575} y={182} s={13} f={C.secondary} a="end" o={easeOut(seg(t, 4.9, 5.3))}>
        436 match
      </T>
    </Svg>
  );
}

// 5 · One series fans out into many lines — one per batch. The arithmetic writes itself: 1,009 sensor series × 40,000
// batches = 40,360,000. On a log axis the count jumps from 1,297 to 40,360,000, and the stated per-series memory
// estimate goes from 4.5 MB to 141 GB.
export function RevealBlowup({ t }: StepCtx) {
  const fan = easeOut(seg(t, 0.3, 1.5));
  const lx = (v: number) => 40 + ((Math.log10(v) - 3) / 5) * 520;
  const jump = easeInOut(seg(t, 3.0, 4.2));
  const cur = Math.pow(10, lerp(Math.log10(1297), Math.log10(40360000), jump));
  return (
    <Svg label="giving every sensor series its own batch label multiplies the series count by the number of distinct batches, because an unbounded label has no bound on the series it creates" h={200}>
      <circle cx={40} cy={60} r={5} fill={C.focus} opacity={easeOut(seg(t, 0, 0.3))} />
      {Array.from({ length: 21 }, (_, i) => {
        const y = 20 + i * 4;
        return <line key={i} x1={44} y1={60} x2={44 + 170 * fan} y2={lerp(60, y, fan)} stroke={C.second} strokeWidth={1} opacity={0.8} />;
      })}
      <T x={225} y={44} s={14} f={C.primary} o={easeOut(seg(t, 1.2, 1.6))}>
        1,009 sensor series
      </T>
      <T x={225} y={68} s={14} f={C.second} o={easeOut(seg(t, 1.6, 2.0))}>
        × 40,000 batches
      </T>
      <T x={225} y={94} s={15} f={C.badText} w={600} o={easeOut(seg(t, 2.1, 2.5))}>
        = 40,360,000
      </T>

      <g opacity={easeOut(seg(t, 2.5, 2.9))}>
        <line x1={40} y1={140} x2={560} y2={140} stroke={C.line} strokeWidth={1.2} />
        {[3, 4, 5, 6, 7, 8].map((e) => (
          <g key={e}>
            <line x1={lx(10 ** e)} y1={136} x2={lx(10 ** e)} y2={144} stroke={C.line} strokeWidth={1} />
            <T x={lx(10 ** e)} y={158} s={11} f={C.quiet} a="middle">
              {`10^${e}`}
            </T>
          </g>
        ))}
        <rect x={40} y={128} width={lx(cur) - 40} height={10} fill={jump > 0.98 ? C.bad : C.focus} />
        <T x={lx(1297)} y={120} s={13} f={C.focus} w={600} o={1 - easeOut(seg(t, 3.0, 3.3))}>
          1,297
        </T>
        <T x={lx(40360000)} y={120} s={13} f={C.badText} a="end" w={600} o={easeOut(seg(t, 4.1, 4.4))}>
          40,360,000
        </T>
      </g>
      <T x={300} y={190} s={12} f={C.quiet} a="middle" o={easeOut(seg(t, 4.3, 4.8))}>
        est. memory 4.5 MB → 141 GB
      </T>
    </Svg>
  );
}

// 6 · The same readings as rows of a columnar table: site, equipment, sensor, batch, value. The batch column is just a
// column, pale blue. A scan band runs down the rows; the crossed-out box says there is no per-series index to blow up.
export function RevealColumnarScan({ t }: StepCtx) {
  const cols = [
    { k: 'site', x: 25 },
    { k: 'equip', x: 115 },
    { k: 'sensor', x: 190 },
    { k: 'batch', x: 315 },
    { k: 'value', x: 460 },
  ];
  const rows = [
    ['plantA', 'eq1', 'pressure', 'batch34834', '0.03'],
    ['plantA', 'eq1', 'pressure', 'batch12167', '0.24'],
    ['plantA', 'eq1', 'flow', 'batch17431', '0.64'],
    ['plantA', 'eq1', 'vibration', 'batch10604', '0.34'],
  ];
  const sc = seg(t, 2.2, 3.8);
  return (
    <Svg label="storing every reading as a row in a columnar table makes the batch label an ordinary column with no per-series index to blow up, only a scan that gets larger" h={200}>
      {cols.map((c, j) => (
        <T key={c.k} x={c.x} y={24} s={12} f={c.k === 'batch' ? C.second : C.quiet} w={c.k === 'batch' ? 600 : 400} o={easeOut(seg(t, j * 0.1, 0.3 + j * 0.1))}>
          {c.k}
        </T>
      ))}
      <rect x={305} y={8} width={140} height={142} rx={4} fill="none" stroke={C.second} strokeWidth={1.1} opacity={easeOut(seg(t, 1.2, 1.6))} />
      {rows.map((r, i) => (
        <g key={i} opacity={easeOut(seg(t, 0.4 + i * 0.15, 0.7 + i * 0.15))}>
          {r.map((v, j) => (
            <T key={j} x={cols[j].x} y={52 + i * 24} s={12} f={j === 3 ? C.second : C.primary}>
              {v}
            </T>
          ))}
        </g>
      ))}
      <T x={25} y={146} s={11} f={C.quiet} o={easeOut(seg(t, 1.0, 1.4))}>
        … 20,180 rows
      </T>
      {sc > 0 && sc < 1 && <rect x={20} y={36 + sc * 110} width={555} height={20} fill={C.focus} opacity={0.12} />}
      <Box x={25} y={164} w={180} h={28} label="series index" o={easeOut(seg(t, 3.8, 4.2))} />
      <Cross x={222} y={178} k={easeOutBack(seg(t, 4.2, 4.6))} />
      <T x={575} y={183} s={13} f={C.focus} a="end" o={easeOut(seg(t, 4.4, 4.8))}>
        just a longer scan
      </T>
    </Svg>
  );
}

// 7 · Five lanes, each with a tiny picture: label slots for identity, two lists meeting for postings, a fan for the
// unbounded label, a scan band for the columnar model, and a batch column for where a batch ID belongs.
export function Recap({ t }: StepCtx) {
  const lane = (i: number) => 34 + i * 50;
  const k = (i: number) => easeOut(seg(t, i * 1.0, i * 1.0 + 0.5));
  const texts = [
    { l: 'a series', r: 'its full label set', c: C.focus },
    { l: 'postings', r: 'equality, not regex', c: C.focus },
    { l: 'unbounded label', r: '× series count', c: C.badText },
    { l: 'columnar', r: 'a scan, no index', c: C.second },
    { l: 'batch ID', r: 'a table column', c: C.focus },
  ];
  return (
    <Svg
      label="a series is defined by its full label set, a postings index helps equality but not regex matching, an unbounded label multiplies series count, and a scan-based model trades the index for a scan"
      h={260}
    >
      <g opacity={k(0)}>
        {[0, 1, 2, 3].map((j) => (
          <line key={j} x1={25 + j * 30} y1={lane(0) + 4} x2={47 + j * 30} y2={lane(0) + 4} stroke={C.focus} strokeWidth={2} />
        ))}
      </g>
      <g opacity={k(1)}>
        {[0, 1, 2, 3, 4, 5, 6, 7].map((j) => (
          <rect key={j} x={25 + j * 14} y={lane(1) - 8} width={8} height={6} fill={C.secondary} />
        ))}
        {[1, 4, 6].map((j) => (
          <rect key={j} x={25 + j * 14} y={lane(1) + 2} width={8} height={6} fill={C.focus} />
        ))}
      </g>
      <g opacity={k(2)}>
        {Array.from({ length: 9 }, (_, j) => (
          <line key={j} x1={28} y1={lane(2)} x2={28 + 100 * k(2)} y2={lane(2) - 14 + j * 3.5} stroke={C.second} strokeWidth={1} />
        ))}
      </g>
      <g opacity={k(3)}>
        {[0, 1, 2].map((j) => (
          <line key={j} x1={25} y1={lane(3) - 8 + j * 7} x2={135} y2={lane(3) - 8 + j * 7} stroke={C.line} strokeWidth={1.4} />
        ))}
        <rect x={25} y={lane(3) - 11 + 14 * seg(t, 3.0, 4.0)} width={110} height={6} fill={C.focus} opacity={0.35} />
      </g>
      <g opacity={k(4)}>
        <rect x={60} y={lane(4) - 12} width={36} height={22} fill="none" stroke={C.second} strokeWidth={1.4} />
      </g>
      {texts.map((x, i) => (
        <g key={i} opacity={k(i)}>
          <T x={165} y={lane(i) + 6} s={14} f={C.primary}>
            {x.l}
          </T>
          <T x={575} y={lane(i) + 6} s={14} f={x.c} a="end" w={600}>
            {x.r}
          </T>
        </g>
      ))}
    </Svg>
  );
}

// 8 · The exact count. 1,009 sensor series × 40,000 distinct batches. Before the answer the product is "?"; after it,
// 40,360,000 lands with a tick: no estimate needed, the identity rule makes it a multiplication.
export function ProveIt({ t, answer }: StepCtx) {
  const s = useSinceAnswer(answer !== null);
  const on = answer !== null;
  return (
    <Svg label="given the series-identity rule, can the exact new series count after adding the batch label be stated without guessing?" h={200}>
      <T x={25} y={50} s={14} f={C.secondary} o={easeOut(seg(t, 0, 0.4))}>
        sensor series
      </T>
      <T x={575} y={50} s={16} f={C.primary} a="end" w={600} o={easeOut(seg(t, 0.3, 0.7))}>
        1,009
      </T>
      <T x={25} y={90} s={14} f={C.secondary} o={easeOut(seg(t, 0.8, 1.2))}>
        distinct batches
      </T>
      <T x={575} y={90} s={16} f={C.second} a="end" w={600} o={easeOut(seg(t, 1.1, 1.5))}>
        × 40,000
      </T>
      <line x1={25} y1={108} x2={575} y2={108} stroke={C.line} strokeWidth={1.2} opacity={easeOut(seg(t, 1.6, 2.0))} />
      <T x={25} y={140} s={14} f={C.secondary} o={easeOut(seg(t, 1.8, 2.2))}>
        new series
      </T>
      {!on ? (
        <T x={575} y={142} s={20} f={C.focus} a="end" w={600} o={easeOut(seg(t, 2.2, 2.6))}>
          ?
        </T>
      ) : (
        <g>
          <T x={575} y={142} s={18} f={C.focus} a="end" w={600} o={easeOut(seg(s, 0.2, 0.7))}>
            40,360,000
          </T>
          <Tick x={380} y={136} k={easeOutBack(seg(s, 0.7, 1.1))} />
          <T x={300} y={186} s={12} f={C.quiet} a="middle" o={easeOut(seg(s, 1.0, 1.4))}>
            a multiplication, not a guess
          </T>
        </g>
      )}
    </Svg>
  );
}
