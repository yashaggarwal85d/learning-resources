import { useEffect, useState } from 'react';
import type { StepCtx } from '../../../../../reels/types';
import { clamp, easeInOut, easeOut, lerp, seg } from '../../../../../reels/anim';
import { C, Draw, Svg, T } from '../../../../../reels/kit';

// Colour grammar (CHAPTER.md): crema = a value or container; latte = labels; caramel = the thing to look at (the
// container that wins, the shared chunk); cinnamon = the alternative being compared (the plain bitmap, the plain merge);
// cherryText = the bad outcome (a container that costs far too much).
// Every printed number is examples.py's: the plain bitmap's 536,870,912 bytes and its crossing with a plain array at
// 134,217,728 ids; the 4,096 threshold (2 x 4,096 = 8,192); the worked chunks (100 scattered: array 200 B, bitmap 8,192,
// run 402; 4,097 in one run: run 6 B, array 8,194; 30,000 in 15,000 runs: bitmap 8,192, run 60,002; the whole chunk: 6 B);
// the three predicates (dense, sparse, clustered: ids, plain bitmap, plain array, Roaring bytes, containers); the first
// AND's 22 of 64 chunk pairs; merge 3,218 against galloping 559 at 50 vs 3,200, and 100,050 against 663 at 50 vs 100,000.
// Value positions inside a chunk are drawn as shape only.

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

type Pt = [number, number];

/** A chunk drawn as a strip with value ticks: scattered, one run, or many short runs. */
function Chunk({ x, y, w, kind, c = C.crema, o = 1 }: { x: number; y: number; w: number; kind: 'scattered' | 'run' | 'runs' | 'full' | 'none'; c?: string; o?: number }) {
  return (
    <g opacity={o}>
      <rect x={x} y={y} width={w} height={20} rx={2} fill={C.roast} stroke={C.mocha} strokeWidth={1} />
      {kind === 'scattered' && Array.from({ length: 22 }, (_, i) => <line key={i} x1={x + 4 + ((i * 37) % 23) * (w - 8) / 23} y1={y + 3} x2={x + 4 + ((i * 37) % 23) * (w - 8) / 23} y2={y + 17} stroke={c} strokeWidth={1.2} />)}
      {kind === 'run' && <rect x={x + w * 0.3} y={y + 3} width={w * 0.18} height={14} fill={c} />}
      {kind === 'runs' && Array.from({ length: 14 }, (_, i) => <rect key={i} x={x + 4 + i * ((w - 8) / 14)} y={y + 3} width={(w - 8) / 28} height={14} fill={c} />)}
      {kind === 'full' && <rect x={x + 2} y={y + 3} width={w - 4} height={14} fill={c} />}
    </g>
  );
}

// 1 · How much smaller, and by how much? Three conditions over the row ids, each a set of marks, and their AND. A plain
// bitmap costs 536,870,912 bytes however few ids match; a sorted array costs 4 bytes per id; they cross at 134,217,728
// ids. Then a set that is crowded here, empty there, and in long runs elsewhere: which is honest about that?
export function Hook({ t }: StepCtx) {
  const ROWS = [
    { lab: 'level = ERROR', marks: [40, 90, 150, 210, 300, 360, 430, 470] },
    { lab: 'service = auth', marks: [88, 92, 96, 150, 152, 154, 300, 302, 470] },
    { lab: 'hour = 13', marks: [80, 90, 100, 150, 160, 290, 300, 310] },
  ];
  const X0 = 170;
  const W = 380;
  const chart = easeOut(seg(t, 1.8, 2.1));
  const arr = easeOut(seg(t, 2.1, 2.9));
  const mixed = easeOut(seg(t, 3.6, 4.0));
  const andX = [90, 150, 300];
  return (
    <Svg label="Three conditions over the row ids and their intersection; a plain bitmap costs 536,870,912 bytes regardless, a sorted array 4 bytes per id, crossing at 134,217,728 ids; a set crowded in one place, empty in another and in long runs elsewhere fits neither" h={330}>
      {ROWS.map((r, i) => (
        <g key={r.lab} opacity={easeOut(seg(t, 0.1 + i * 0.25, 0.4 + i * 0.25))}>
          <T x={30} y={34 + i * 26} s={12} f={C.latte}>{r.lab}</T>
          <rect x={X0} y={22 + i * 26} width={W} height={16} rx={2} fill={C.roast} stroke={C.mocha} strokeWidth={1} />
          {r.marks.map((m, j) => <line key={j} x1={X0 + m * (W / 500)} y1={25 + i * 26} x2={X0 + m * (W / 500)} y2={35 + i * 26} stroke={C.crema} strokeWidth={1.6} />)}
        </g>
      ))}
      <g opacity={easeOut(seg(t, 1.0, 1.3))}>
        <T x={30} y={112} s={12} f={C.caramel}>all three</T>
        <rect x={X0} y={100} width={W} height={16} rx={2} fill={C.roast} stroke={C.caramel} strokeWidth={1.2} />
        {andX.map((m, j) => <line key={j} x1={X0 + m * (W / 500)} y1={103} x2={X0 + m * (W / 500)} y2={113} stroke={C.caramel} strokeWidth={2} />)}
      </g>
      <g opacity={chart}>
        <line x1={60} y1={240} x2={540} y2={240} stroke={C.mocha} strokeWidth={1.2} />
        <T x={540} y={256} s={12} f={C.latte} a="end">ids matched →</T>
        <line x1={60} y1={176} x2={540} y2={176} stroke={C.cinnamon} strokeWidth={2} />
        <T x={540} y={196} s={12} f={C.cinnamon} a="end">plain bitmap: 536,870,912 B</T>
      </g>
      <Draw pts={[[60, 240], [300, 176], [360, 160]]} t={t} from={2.1} to={2.9} stroke={C.crema} w={2} pen={false} />
      <T x={150} y={236} s={12} f={C.crema} o={arr}>sorted array: 4 B per id</T>
      <circle cx={300} cy={176} r={5} fill={C.caramel} opacity={easeOut(seg(t, 2.8, 3.0))} />
      <T x={300} y={140} s={12} f={C.caramel} a="middle" o={easeOut(seg(t, 2.9, 3.2))}>cross: 134,217,728 ids</T>
      <g opacity={mixed}>
        <T x={30} y={288} s={12} f={C.latte}>a real set</T>
        <rect x={X0} y={276} width={W} height={16} rx={2} fill={C.roast} stroke={C.mocha} strokeWidth={1} />
        {Array.from({ length: 30 }, (_, j) => <line key={j} x1={X0 + 8 + j * 3} y1={279} x2={X0 + 8 + j * 3} y2={289} stroke={C.crema} strokeWidth={1.2} />)}
        <rect x={X0 + 230} y={279} width={110} height={10} fill={C.crema} />
        <T x={30} y={318} s={13} f={C.caramel}>crowded, empty, long runs: which is honest?</T>
      </g>
    </Svg>
  );
}

// 2 · The two-level structure. The id range is cut into chunks of 65,536; a set's marks fall into only a few. The top
// level is a short sorted list of the chunks touched, each pointing to a small container of that chunk's own values.
// Untouched chunks fade: they cost nothing.
export function TwoLevel({ t }: StepCtx) {
  const N = 16;
  const CW = 32;
  const X0 = 32;
  const TOUCHED = [1, 4, 5, 11];
  const KIND: Record<number, 'scattered' | 'run' | 'runs'> = { 1: 'scattered', 4: 'runs', 5: 'run', 11: 'scattered' };
  const cut = easeOut(seg(t, 0.2, 0.8));
  const fade = easeOut(seg(t, 2.8, 3.3));
  const top = (i: number) => easeOut(seg(t, 1.3 + i * 0.25, 1.6 + i * 0.25));
  return (
    <Svg label="The id range is cut into sixteen equal chunks; the set touches four; the top level lists just those four, each pointing to a small container of its own values; untouched chunks cost nothing" h={310}>
      <T x={30} y={26} s={12} f={C.latte}>row ids, cut into chunks of 65,536</T>
      {Array.from({ length: N }, (_, i) => {
        const used = TOUCHED.includes(i);
        return (
          <g key={i} opacity={used ? 1 : 1 - 0.75 * fade}>
            <rect x={X0 + i * CW} y={42} width={CW - 3} height={26} rx={2} fill={C.roast} stroke={used ? C.crema : C.mocha} strokeWidth={1.1} opacity={cut} />
            {used && <Chunk x={X0 + i * CW + 2} y={45} w={CW - 7} kind={KIND[i]} o={cut} />}
          </g>
        );
      })}
      {TOUCHED.map((c, i) => (
        <g key={c} opacity={top(i)}>
          <line x1={X0 + c * CW + (CW - 3) / 2} y1={70} x2={60 + i * 130 + 22} y2={118} stroke={C.latte} strokeWidth={1.1} />
          <rect x={60 + i * 130} y={118} width={44} height={26} rx={3} fill={C.roast} stroke={C.caramel} strokeWidth={1.4} />
          <circle cx={82 + i * 130} cy={131} r={4} fill={C.caramel} />
          <line x1={82 + i * 130} y1={144} x2={82 + i * 130} y2={170} stroke={C.latte} strokeWidth={1.1} />
          <Chunk x={40 + i * 130} y={172} w={90} kind={KIND[c]} />
        </g>
      ))}
      <T x={30} y={112} s={12} f={C.caramel} o={top(0)}>top</T>
      <T x={30} y={230} s={12} f={C.latte} o={top(3)}>one small container per touched chunk</T>
      <T x={30} y={274} s={13} f={C.caramel} o={fade}>an untouched chunk costs nothing at all</T>
    </Svg>
  );
}

// 3 · Predict. Chunk A: 100 values, scattered. Chunk B: 4,097 values, one unbroken run. Does the same container win
// both? After answering: A's winner, an array, 200 bytes; B's, a run, 6 bytes.
export function ShapePredict({ t, answer }: StepCtx) {
  const answered = answer !== null;
  const s = useSinceAnswer(answered);
  const pulse = 0.6 + 0.4 * Math.sin(t * 4);
  const a = easeOut(seg(t, 0.1, 0.5));
  const w1 = answered ? easeOut(seg(s, 0.2, 0.6)) : 0;
  const w2 = answered ? easeOut(seg(s, 0.7, 1.1)) : 0;
  return (
    <Svg label="Chunk A holds 100 scattered values and chunk B 4,097 values in one run; after answering, A's smallest container is an array of 200 bytes and B's is a run of 6 bytes" h={280}>
      <g opacity={a}>
        <T x={30} y={34} s={13} f={C.crema}>A: 100 values, scattered</T>
        <Chunk x={30} y={46} w={300} kind="scattered" />
        <T x={30} y={114} s={13} f={C.crema}>B: 4,097 values, one run</T>
        <Chunk x={30} y={126} w={300} kind="run" />
      </g>
      {answered && <T x={350} y={62} s={13} f={C.caramel} o={w1}>array, 200 B</T>}
      {answered && <T x={350} y={142} s={13} f={C.caramel} o={w2}>run, 6 B</T>}
      {!answered && <T x={30} y={220} s={15} f={C.cherryText} o={pulse}>the same container for both?</T>}
      {answered && <T x={30} y={220} s={13} f={C.caramel} o={easeOut(seg(s, 1.2, 1.5))}>no: the shape decides, not the count</T>}
    </Svg>
  );
}

// 4 · Three containers, one honest size. Three worked chunks, each priced three ways on a log scale (array, bitmap,
// run); the smallest lights up and its bytes print: 100 scattered → array 200 B; 4,097 in one run → run 6 B; 30,000 in
// 15,000 runs → bitmap 8,192 B.
export function ThreeContainers({ t }: StepCtx) {
  const LX = (v: number) => 210 + Math.log10(v) * 66;
  const ROWS: { lab: string; kind: 'scattered' | 'run' | 'runs'; cost: [number, number, number]; win: number; winLab: string }[] = [
    { lab: '100 scattered', kind: 'scattered', cost: [200, 8192, 402], win: 0, winLab: 'array 200 B' },
    { lab: '4,097, one run', kind: 'run', cost: [8194, 8192, 6], win: 2, winLab: 'run 6 B' },
    { lab: '30,000, 15,000 runs', kind: 'runs', cost: [60000, 8192, 60002], win: 1, winLab: 'bitmap 8,192 B' },
  ];
  const NAMES = ['array', 'bitmap', 'run'];
  return (
    <Svg label="Three chunks priced three ways on a log scale: 100 scattered values cost least as an array, 200 bytes; 4,097 values in one run least as a run, 6 bytes; 30,000 values in 15,000 runs least as a bitmap, 8,192 bytes" h={330}>
      <T x={30} y={22} s={12} f={C.latte}>bytes, log scale: array · bitmap · run</T>
      {ROWS.map((r, i) => {
        const y = 48 + i * 94;
        const g = easeOut(seg(t, 0.4 + i * 1.1, 1.0 + i * 1.1));
        const pick = t >= 1.0 + i * 1.1;
        return (
          <g key={r.lab} opacity={easeOut(seg(t, 0.2 + i * 1.1, 0.5 + i * 1.1))}>
            <T x={30} y={y + 4} s={12} f={C.crema}>{r.lab}</T>
            <Chunk x={30} y={y + 14} w={120} kind={r.kind} />
            {r.cost.map((v, j) => {
              const win = pick && j === r.win;
              const off = v > 50000;
              return (
                <g key={j}>
                  <rect x={210} y={y - 6 + j * 18} width={(LX(Math.min(v, 50000)) - 210) * g} height={12} rx={2} fill={win ? C.caramel : C.mocha} />
                  {off && <T x={LX(50000) + 6} y={y + 4 + j * 18} s={12} f={C.cherryText} o={g}>›</T>}
                  {j !== r.win && <T x={216} y={y + 4 + j * 18} s={12} f={C.latte} o={g * 0.9}>{NAMES[j]}</T>}
                </g>
              );
            })}
            {pick && <T x={30} y={y + 58} s={13} f={C.caramel}>→ {r.winLab}</T>}
          </g>
        );
      })}
    </Svg>
  );
}

// 5 · The 4,096 threshold. Bytes against values in one chunk: the array's line climbs 2 bytes per value; the bitmap's
// is flat at 8,192. They meet at 4,096 values: below it, array; above it, bitmap.
export function Threshold({ t }: StepCtx) {
  const X = (n: number) => 60 + (n / 8192) * 470;
  const Y = (b: number) => 250 - (b / 16384) * 200;
  const flat = easeOut(seg(t, 0.3, 0.8));
  const meet = easeOut(seg(t, 2.0, 2.4));
  const sides = easeOut(seg(t, 2.8, 3.2));
  return (
    <Svg label="Bytes against values in one chunk: an array climbs two bytes per value and a bitmap stays flat at 8,192 bytes; they meet at 4,096 values, below which the array wins and above which the bitmap does" h={310}>
      <line x1={60} y1={250} x2={540} y2={250} stroke={C.mocha} strokeWidth={1.2} />
      <line x1={60} y1={40} x2={60} y2={250} stroke={C.mocha} strokeWidth={1.2} />
      <T x={540} y={270} s={12} f={C.latte} a="end">values in the chunk →</T>
      <line x1={60} y1={Y(8192)} x2={60 + 470 * flat} y2={Y(8192)} stroke={C.cinnamon} strokeWidth={2.2} />
      <T x={70} y={Y(8192) - 8} s={12} f={C.cinnamon} o={flat}>bitmap: 8,192 B, always</T>
      <Draw pts={[[X(0), Y(0)], [X(8192), Y(16384)]]} t={t} from={0.9} to={2.0} stroke={C.crema} w={2.2} pen={false} />
      <T x={X(6200)} y={Y(15000)} s={12} f={C.crema} a="end" o={easeOut(seg(t, 1.6, 1.9))}>array: 2 B per value</T>
      <circle cx={X(4096)} cy={Y(8192)} r={6} fill={C.caramel} opacity={meet} />
      <line x1={X(4096)} y1={Y(8192)} x2={X(4096)} y2={250} stroke={C.caramel} strokeWidth={1.2} strokeDasharray="4 4" opacity={meet} />
      <T x={X(4096)} y={270} s={13} f={C.caramel} a="middle" o={meet}>4,096</T>
      <T x={30} y={300} s={13} f={C.crema} o={sides}>below: array · above: bitmap</T>
    </Svg>
  );
}

// 6 · Predict. One chunk where every one of its 65,536 values is present: one run end to end. Six bytes, or something
// per value? After answering: the run container, one start and one length, 6 bytes; the bitmap beside it, 8,192.
export function FullChunkPredict({ t, answer }: StepCtx) {
  const answered = answer !== null;
  const s = useSinceAnswer(answered);
  const pulse = 0.6 + 0.4 * Math.sin(t * 4);
  const fill = easeInOut(seg(t, 0.1, 1.2));
  const g = answered ? easeOut(seg(s, 0.4, 1.0)) : 0;
  return (
    <Svg label="A chunk with all 65,536 values present, a single run; after answering, the run container is one start and one length, 6 bytes, against the bitmap's 8,192" h={280}>
      <T x={30} y={30} s={12} f={C.latte}>all 65,536 values in one chunk</T>
      <rect x={30} y={44} width={520} height={24} rx={2} fill={C.roast} stroke={C.mocha} strokeWidth={1} />
      <rect x={32} y={47} width={516 * fill} height={18} fill={C.crema} />
      {!answered && <T x={30} y={200} s={15} f={C.cherryText} o={pulse}>a few bytes, or one per value?</T>}
      {answered && (
        <g opacity={easeOut(seg(s, 0.1, 0.4))}>
          <rect x={30} y={96} width={64} height={28} rx={3} fill={C.roast} stroke={C.caramel} strokeWidth={1.6} />
          <T x={62} y={115} s={12} f={C.caramel} a="middle">start</T>
          <rect x={98} y={96} width={64} height={28} rx={3} fill={C.roast} stroke={C.caramel} strokeWidth={1.6} />
          <T x={130} y={115} s={12} f={C.caramel} a="middle">length</T>
          <T x={180} y={115} s={13} f={C.caramel}>one run: 6 B</T>
          <rect x={30} y={146} width={4 * g} height={12} rx={1} fill={C.caramel} />
          <rect x={30} y={166} width={520 * g} height={12} rx={2} fill={C.cinnamon} />
          <T x={30} y={198} s={12} f={C.cinnamon} o={g}>bitmap: 8,192 B</T>
        </g>
      )}
      {answered && <T x={30} y={240} s={13} f={C.caramel} o={easeOut(seg(s, 1.2, 1.5))}>a run costs per run, never per value</T>}
    </Svg>
  );
}

// 7 · Run containers, and runOptimize. A set built from arrays and bitmaps; a pass sweeps it once before it is queried.
// A chunk with one long run converts: 8,192 bytes down to 6. A chunk of 15,000 short runs stays a bitmap (as runs it
// would be 60,002).
export function RunOptimize({ t }: StepCtx) {
  const sweep = clamp(seg(t, 0.6, 3.0));
  const sx = lerp(30, 560, sweep);
  const conv = easeInOut(seg(t, 1.3, 1.8));
  const stay = t >= 2.4;
  return (
    <Svg label="A pass sweeps the set once before it is queried; a chunk with one long run converts from an 8,192-byte bitmap to a 6-byte run, while a chunk of 15,000 short runs stays a bitmap since as runs it would cost 60,002 bytes" h={300}>
      <T x={30} y={24} s={12} f={C.latte}>runOptimize: one pass, before queries</T>
      <Chunk x={30} y={50} w={240} kind="run" />
      <Chunk x={310} y={50} w={240} kind="runs" />
      <T x={30} y={98} s={12} f={C.crema}>one long run</T>
      <T x={310} y={98} s={12} f={C.crema}>15,000 short runs</T>
      <line x1={sx} y1={40} x2={sx} y2={80} stroke={C.caramel} strokeWidth={2} opacity={t >= 0.6 && t < 3.0 ? 1 : 0} />
      <rect x={30} y={120} width={lerp(240, 2, conv)} height={14} rx={2} fill={conv > 0.5 ? C.caramel : C.cinnamon} />
      <T x={30} y={156} s={12} f={conv > 0.5 ? C.caramel : C.cinnamon}>{conv > 0.5 ? 'run: 6 B' : 'bitmap: 8,192 B'}</T>
      <rect x={310} y={120} width={240} height={14} rx={2} fill={C.cinnamon} />
      <T x={310} y={156} s={12} f={C.cinnamon}>bitmap: 8,192 B</T>
      {stay && <T x={310} y={180} s={12} f={C.cherryText}>as runs: 60,002 B · keep</T>}
      <T x={30} y={234} s={13} f={C.caramel} o={easeOut(seg(t, 3.2, 3.6))}>few long runs: a big win</T>
      <T x={30} y={260} s={12} f={C.latte} o={easeOut(seg(t, 3.6, 4.0))}>many short runs: nothing to gain</T>
    </Svg>
  );
}

const PRED = [
  { lab: 'dense', ids: '1,297,443', arr: 5189772, roar: 180312, roarLab: '180,312', cont: '22 bitmaps' },
  { lab: 'sparse', ids: '12,768', arr: 51072, roar: 25792, roarLab: '25,792', cont: '64 arrays' },
  { lab: 'clustered', ids: '828,317', arr: 3313268, roar: 1680, roarLab: '1,680', cont: '64 runs' },
];

// 8 · Three predicates, measured. For each, three bars on a log scale: the plain bitmap (536,870,912 bytes every time),
// the plain array, and Roaring, with the containers it chose. Roaring is smallest all three times.
export function ThreeMeasured({ t }: StepCtx) {
  const LX = (v: number) => 30 + (Math.log10(v) - 2.5) * 80;
  return (
    <Svg label="Three predicates on a log scale: dense, sparse and clustered; against the plain bitmap's 536,870,912 bytes and the plain array, Roaring is smallest every time, 180,312, 25,792 and 1,680 bytes" h={340}>
      <T x={30} y={22} s={12} f={C.latte}>bytes, log scale: bitmap · array · Roaring</T>
      {PRED.map((p, i) => {
        const y = 52 + i * 96;
        const g = easeOut(seg(t, 0.3 + i * 1.0, 0.9 + i * 1.0));
        return (
          <g key={p.lab} opacity={easeOut(seg(t, 0.2 + i * 1.0, 0.5 + i * 1.0))}>
            <T x={30} y={y} s={13} f={C.crema}>{p.lab}: {p.ids} ids</T>
            <rect x={30} y={y + 8} width={(LX(536870912) - 30) * g} height={10} rx={2} fill={C.cinnamon} />
            <rect x={30} y={y + 22} width={(LX(p.arr) - 30) * g} height={10} rx={2} fill={C.mocha} />
            <rect x={30} y={y + 36} width={(LX(p.roar) - 30) * g} height={10} rx={2} fill={C.caramel} />
            <T x={LX(p.roar) + 8} y={y + 46} s={12} f={C.caramel} o={g}>{p.roarLab} B · {p.cont}</T>
          </g>
        );
      })}
      <T x={30} y={334} s={13} f={C.caramel} o={easeOut(seg(t, 3.4, 3.8))}>per-chunk choice wins every time</T>
    </Svg>
  );
}

// 9 · Predict. Two sets' top-level chunk lists, side by side over the same sixteen chunk slots. A chunk that one side
// holds and the other doesn't: what does it cost the AND? After answering: the merge walks both lists; unmatched chunks
// are passed by, grey; only shared ones are opened. Measured: the first AND examined 22 of 64 chunk pairs.
export function MissingChunkPredict({ t, answer }: StepCtx) {
  const answered = answer !== null;
  const s = useSinceAnswer(answered);
  const pulse = 0.6 + 0.4 * Math.sin(t * 4);
  const A = [1, 3, 4, 7, 9, 12];
  const B = [3, 4, 6, 9, 13];
  const X = (c: number) => 120 + c * 27;
  const walk = answered ? clamp(seg(s, 0.2, 1.6)) * 16 : -1;
  return (
    <Svg label="Two sets' chunk lists over sixteen slots; a chunk held on one side only is skipped by the merge at no cost, and only shared chunks are opened; measured, the first AND examined 22 of 64 chunk pairs" h={280}>
      <T x={30} y={60} s={13} f={C.crema}>set 1</T>
      <T x={30} y={110} s={13} f={C.crema}>set 2</T>
      {Array.from({ length: 16 }, (_, c) => {
        const inA = A.includes(c);
        const inB = B.includes(c);
        const both = inA && inB;
        const passed = answered && walk >= c;
        const col = passed ? (both ? C.caramel : C.mocha) : C.crema;
        return (
          <g key={c}>
            {inA && <rect x={X(c)} y={44} width={22} height={22} rx={2} fill={C.roast} stroke={col} strokeWidth={both && passed ? 2 : 1.2} />}
            {inB && <rect x={X(c)} y={94} width={22} height={22} rx={2} fill={C.roast} stroke={col} strokeWidth={both && passed ? 2 : 1.2} />}
            {!answered && c === 7 && <rect x={X(c) - 3} y={41} width={28} height={28} rx={3} fill="none" stroke={C.cherryText} strokeWidth={1.6} opacity={pulse} />}
          </g>
        );
      })}
      {answered && walk < 16 && <line x1={X(walk) + 11} y1={36} x2={X(walk) + 11} y2={124} stroke={C.caramel} strokeWidth={1.6} />}
      {!answered && <T x={30} y={190} s={15} f={C.cherryText} o={pulse}>only one side has it: the cost?</T>}
      {answered && <T x={30} y={170} s={13} f={C.caramel} o={easeOut(seg(s, 1.6, 1.9))}>nothing: never even opened</T>}
      {answered && <T x={30} y={198} s={12} f={C.latte} o={easeOut(seg(s, 2.0, 2.3))}>measured: 22 of 64 chunk pairs examined</T>}
    </Svg>
  );
}

// 10 · Chunk-by-chunk AND, and galloping. Two bitmap rows AND together in one pass, word against word. Then a small
// sorted list against a huge one: from the last match, the probe leaps 1, 2, 4, 8, 16 ahead, overshoots, and narrows
// back in. Measured comparisons: 50 vs 3,200, merge 3,218 against galloping 559; 50 vs 100,000, 100,050 against 663.
export function GallopReveal({ t }: StepCtx) {
  const W1 = [1, 0, 1, 1, 0, 1, 0, 1, 1, 1, 0, 0, 1, 0, 1, 1];
  const W2 = [1, 1, 0, 1, 0, 1, 1, 0, 1, 0, 0, 1, 1, 1, 1, 0];
  const pass = clamp(seg(t, 0.3, 1.2)) * 16;
  const JUMPS = [1, 2, 4, 8, 16];
  const gl = (i: number) => t >= 1.6 + i * 0.25;
  const back = easeInOut(seg(t, 2.9, 3.3));
  const bars = easeOut(seg(t, 3.6, 4.2));
  const LX = (v: number) => 150 + Math.log10(v) * 78;
  const GX = (k: number) => 40 + k * 16;
  return (
    <Svg label="Two bitmap words AND together in one pass; a small list against a huge one gallops ahead 1, 2, 4, 8, 16 then narrows back; measured, 3,218 merge comparisons against 559 galloping at 50 versus 3,200, and 100,050 against 663 at 50 versus 100,000" h={340}>
      <T x={30} y={22} s={12} f={C.latte}>bitmap AND bitmap: one pass</T>
      {W1.map((b, i) => {
        const done = pass > i;
        const both = b && W2[i];
        return (
          <g key={i}>
            <rect x={30 + i * 22} y={32} width={18} height={14} fill={b ? C.crema : C.roast} stroke={C.mocha} strokeWidth={0.8} />
            <rect x={30 + i * 22} y={50} width={18} height={14} fill={W2[i] ? C.crema : C.roast} stroke={C.mocha} strokeWidth={0.8} />
            <rect x={30 + i * 22} y={72} width={18} height={14} fill={done && both ? C.caramel : C.roast} stroke={done ? C.latte : C.mocha} strokeWidth={0.8} />
          </g>
        );
      })}
      <T x={30} y={108} s={12} f={C.latte} o={easeOut(seg(t, 1.4, 1.6))}>small list vs huge list: gallop</T>
      <g opacity={easeOut(seg(t, 1.4, 1.6))}>
        {Array.from({ length: 33 }, (_, k) => <rect key={k} x={GX(k)} y={142} width={13} height={14} fill={C.roast} stroke={C.mocha} strokeWidth={0.8} />)}
        {JUMPS.map((j, i) => {
          const from = i === 0 ? 0 : JUMPS[i - 1];
          return gl(i) ? <path key={j} d={`M ${GX(from) + 6} 140 Q ${(GX(from) + GX(j)) / 2 + 6} ${128 - i * 2} ${GX(j) + 6} 140`} fill="none" stroke={C.caramel} strokeWidth={1.4} /> : null;
        })}
        {gl(4) && <rect x={lerp(GX(16), GX(11), back)} y={140} width={17} height={18} fill="none" stroke={C.caramel} strokeWidth={2} />}
      </g>
      <g opacity={bars}>
        <T x={30} y={186} s={12} f={C.latte}>comparisons, log scale</T>
        <T x={30} y={214} s={12} f={C.crema}>50 vs 3,200</T>
        <rect x={150} y={204} width={(LX(3218) - 150) * bars} height={11} rx={2} fill={C.cinnamon} />
        <T x={LX(3218) + 6} y={214} s={12} f={C.cinnamon}>merge 3,218</T>
        <rect x={150} y={220} width={(LX(559) - 150) * bars} height={11} rx={2} fill={C.caramel} />
        <T x={LX(559) + 6} y={230} s={12} f={C.caramel}>gallop 559</T>
        <T x={30} y={270} s={12} f={C.crema}>50 vs 100,000</T>
        <rect x={150} y={260} width={(LX(100050) - 150) * bars} height={11} rx={2} fill={C.cinnamon} />
        <T x={LX(100050) - 6} y={290} s={12} f={C.cinnamon} a="end">merge 100,050</T>
        <rect x={150} y={300} width={(LX(663) - 150) * bars} height={11} rx={2} fill={C.caramel} />
        <T x={LX(663) + 6} y={310} s={12} f={C.caramel}>gallop 663</T>
      </g>
      <T x={30} y={334} s={12} f={C.latte} o={easeOut(seg(t, 4.4, 4.8))}>the wider the gap, the further ahead it pulls</T>
    </Svg>
  );
}

// 11 · Where Roaring is used. Four cards, each at its own source's strength: Lucene (two classes inspired by it), Spark
// (imports the library for its shuffle bookkeeping), Pinot (its inverted index returns Roaring bitmaps), Druid (Roaring
// is its default bitmap compression).
export function Adoption({ t }: StepCtx) {
  const CARDS = [
    { name: 'Lucene', note: 'inspired: its own two classes' },
    { name: 'Spark', note: 'imports it: shuffle bookkeeping' },
    { name: 'Pinot', note: 'its inverted index' },
    { name: 'Druid', note: 'default bitmap compression' },
  ];
  return (
    <Svg label="Four systems at four strengths: Lucene's own classes inspired by Roaring, Spark importing the library for shuffle bookkeeping, Pinot's inverted index returning Roaring bitmaps, and Druid's default bitmap compression" h={300}>
      {CARDS.map((c, i) => {
        const k = easeOut(seg(t, 0.3 + i * 0.8, 0.7 + i * 0.8));
        const y = 30 + i * 62;
        return (
          <g key={c.name} opacity={k} transform={`translate(${lerp(-30, 0, k)} 0)`}>
            <rect x={30} y={y} width={520} height={46} rx={6} fill={C.roast} stroke={i === 0 ? C.latte : C.crema} strokeWidth={1.3} strokeDasharray={i === 0 ? '5 4' : undefined} />
            <T x={48} y={y + 29} s={14} f={C.caramel}>{c.name}</T>
            <T x={150} y={y + 29} s={13} f={C.crema}>{c.note}</T>
          </g>
        );
      })}
      <T x={30} y={292} s={12} f={C.latte} o={easeOut(seg(t, 3.6, 4.0))}>dashed: a reimplementation, not the library</T>
    </Svg>
  );
}

// 12 · Recap. The Bloom filter's row (a wrong yes now and then, ×1.44 the floor) beside Roaring's (no wrong answers, each
// chunk near its own honest size); then a sorted list of small numbers waiting to be squeezed further.
export function Recap({ t }: StepCtx) {
  const r = (i: number) => easeOut(seg(t, 0.2 + i * 0.9, 0.5 + i * 0.9));
  const sq = easeInOut(seg(t, 2.3, 3.2));
  const NUMS = [3, 9, 14, 22, 27, 41];
  return (
    <Svg label="Recap: the Bloom filter gives an occasional wrong yes; Roaring gives no wrong answers in close to each chunk's honest size; its sorted lists of small numbers compress further still" h={270}>
      <g opacity={r(0)}>
        <T x={30} y={40} s={13} f={C.cinnamon}>Bloom: small, and sometimes a wrong yes</T>
      </g>
      <g opacity={r(1)}>
        <T x={30} y={90} s={13} f={C.caramel}>Roaring: never wrong, near each chunk&apos;s shape</T>
      </g>
      <g opacity={r(2)}>
        {NUMS.map((n, i) => (
          <g key={n}>
            <rect x={30 + i * lerp(52, 36, sq)} y={140} width={lerp(46, 30, sq)} height={26} rx={3} fill={C.roast} stroke={C.crema} strokeWidth={1.2} />
            <rect x={30 + i * lerp(52, 36, sq) + 6} y={160 - n * 0.4 - 4} width={lerp(34, 18, sq)} height={n * 0.4} rx={1} fill={C.crema} />
          </g>
        ))}
        <T x={30} y={210} s={13} f={C.crema}>a sorted list of small numbers…</T>
        <T x={30} y={236} s={13} f={C.caramel} o={easeOut(seg(t, 3.2, 3.6))}>squeezes further still</T>
      </g>
    </Svg>
  );
}
