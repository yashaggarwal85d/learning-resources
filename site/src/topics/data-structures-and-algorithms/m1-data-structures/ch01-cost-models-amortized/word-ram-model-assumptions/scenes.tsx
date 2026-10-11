import type { ReactNode } from 'react';
import type { StepCtx } from '../../../../../reels/types';
import { clamp, easeOut, lerp, rng, seg } from '../../../../../reels/anim';
import { C, Svg, T } from '../../../../../reels/kit';

// Every number shown here is computed or asserted by examples.py. Colour grammar (CHAPTER.md): caramel = what is counted and the
// answer, cinnamon = the comparison model, cherry = the cache miss and the flush, crema = data, latte/taupe = labels.
const N = 1_000_000;
const FIXED = 653_159; // examples.py: the fixed query lies just above keys[FIXED]
const KEY = 12_884_901_895; // x = 3 * 2^32 + 7
const bitOf = (v: number, i: number) => Math.floor(v / 2 ** i) % 2; // bit i of v, 0 = rightmost
const f = (n: number) => Math.round(n).toLocaleString('en-US');

/** A row of bit cells, most significant bit left: a 1 is a filled square, a 0 an outline. `tint` colours chosen cells. */
function Bits({ x, y, n = 64, cw = 7.5, h = 16, value = KEY, tint, o = 1 }: { x: number; y: number; n?: number; cw?: number; h?: number; value?: number; tint?: (i: number) => string | null; o?: number }) {
  return (
    <g opacity={o}>
      {Array.from({ length: n }, (_, j) => {
        const i = n - 1 - j; // bit index
        const one = bitOf(value, i) === 1;
        const col = tint?.(i);
        return (
          <rect key={j} x={x + j * cw + 0.6} y={y} width={cw - 1.2} height={h} rx={1.5} fill={col ?? (one ? C.crema : 'none')} stroke={col ?? (one ? C.crema : C.taupe)} strokeWidth={one || col ? 0 : 1} opacity={col || one ? 1 : 0.7} />
        );
      })}
    </g>
  );
}

/** A bracket under cells from x1 to x2 at height y. */
const Bracket = ({ x1, x2, y, c = C.caramel, o = 1 }: { x1: number; x2: number; y: number; c?: string; o?: number }) => (
  <path d={`M${x1} ${y - 6} V${y} H${x2} V${y - 6}`} stroke={c} strokeWidth={2} fill="none" opacity={o} />
);

const Arrow = ({ x1, y1, x2, y2, c = C.caramel, o = 1 }: { x1: number; y1: number; x2: number; y2: number; c?: string; o?: number }) => {
  const a = Math.atan2(y2 - y1, x2 - x1);
  const h = (d: number) => `${x2 - 9 * Math.cos(a + d)} ${y2 - 9 * Math.sin(a + d)}`;
  return (
    <g opacity={o}>
      <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={c} strokeWidth={2.5} />
      <path d={`M${x2} ${y2} L${h(0.45)} M${x2} ${y2} L${h(-0.45)}`} stroke={c} strokeWidth={2.5} fill="none" />
    </g>
  );
};

const fadeIn = (t: number, a: number, d = 0.5) => easeOut(seg(t, a, a + d));

// 1 · A million keys, twenty probes.
const PROBES: { lo: number; hi: number; mid: number }[] = (() => {
  const out = [];
  let lo = 0, hi = N;
  while (lo < hi) {
    const mid = Math.floor((lo + hi) / 2);
    out.push({ lo, hi, mid });
    if (mid <= FIXED) lo = mid + 1;
    else hi = mid;
  }
  out.push({ lo, hi, mid: -1 });
  return out;
})();
const probeTime = (k: number) => (k < 6 ? 0.5 + 0.55 * k : 3.8 + 0.17 * (k - 6));
export function TwentyProbes({ t, portrait }: StepCtx) {
  let k = 0; // probes made so far
  while (k < 20 && t >= probeTime(k)) k++;
  const live = PROBES[k]; // range after k probes
  const SX = 40, SW = 520, SEG = 100;
  const xm = SX + (SW * FIXED) / N;
  const flash = k > 0 && k <= 20 ? clamp(1 - (t - probeTime(k - 1)) / 0.4) : 0;
  const mid = k < 20 ? (live.lo + live.hi) / 2 : -1;
  const done = k === 20;
  const nominal = k <= 6 ? N / 2 ** k : null;
  return (
    <Svg label="A strip of a million sorted keys halved by twenty comparisons, a counter rising to 20" h={portrait ? 340 : 330}>
      <T x={SX} y={46} s={13} f={C.taupe}>1,000,000 sorted 64-bit keys</T>
      {Array.from({ length: SEG }, (_, i) => {
        const a = (i * N) / SEG, b = ((i + 1) * N) / SEG;
        const inside = a < live.hi && b > live.lo;
        const isTarget = done && i === Math.floor((FIXED / N) * SEG);
        return <rect key={i} x={SX + (SW * i) / SEG} y={116} width={SW / SEG - 0.8} height={44} rx={1.5} fill={isTarget ? C.caramel : inside ? C.crema : C.taupe} opacity={isTarget ? 1 : inside ? 0.95 : 0.22} />;
      })}
      <path d={`M${xm} 104 l-7 -14 h14 Z`} fill={C.caramel} />
      <T x={xm} y={80} s={15} f={C.caramel} a="middle" w={700}>x</T>
      {k < 20 && k > 0 && (
        <T x={SX + (SW * mid) / N} y={196} s={22} f={C.cinnamon} a="middle" w={700} o={0.4 + 0.6 * flash}>{'<'}</T>
      )}
      {nominal !== null && (
        <T x={SX} y={222} s={15} f={C.crema}>live range: {f(nominal)}</T>
      )}
      <T x={560} y={262} s={15} f={C.latte} a="end">comparisons</T>
      <T x={560} y={304} s={34} f={C.cinnamon} a="end" w={700}>{k}</T>
      <T x={SX} y={304} s={13} f={C.taupe}>unit: one comparison</T>
      {done && <T x={SX} y={326} s={13} f={C.taupe} o={fadeIn(t, probeTime(19) + 0.2)}>log₂ 1,000,000 ≈ 19.9, so 20 probes</T>}
    </Svg>
  );
}

// 2 · The word-RAM: five different operations, five units.
const OPS = ['load a[mid]', 'compare <', 'add +', 'shift >> 1', 'store a[0]'];
export function WordRam({ t }: StepCtx) {
  const k = Math.min(5, Math.max(0, Math.floor((t - 0.5) / 0.7) + 1)); // operations lit so far
  const cur = k > 0 ? OPS[k - 1] : '';
  const row = (y: number, a: string, lit: boolean) => (
    <g key={a}>
      <T x={128} y={y + 11} s={15} f={C.taupe} a="end">{a}</T>
      <Bits x={140} y={y} cw={5} h={14} value={KEY} o={lit ? 1 : 0.6} />
    </g>
  );
  return (
    <Svg label="A 64-bit word, memory cells addressed by a word, and five different operations that each count one unit" h={390}>
      <T x={300} y={32} s={15} f={C.latte} a="middle">one word: w = 64 bits</T>
      <Bits x={60} y={42} />
      <T x={140} y={104} s={13} f={C.taupe}>memory: cells of w bits, addressed by a word</T>
      {row(116, '0', k === 1 || k === 5)}
      {row(140, '1', false)}
      {row(164, '2', false)}
      <T x={128} y={198} s={15} f={C.taupe} a="end">…</T>
      <T x={40} y={236} s={15} f={C.latte}>+ − × ÷ % &amp; | ^ {'<<'} {'>>'}</T>
      <T x={40} y={260} s={15} f={C.latte}>{'<  >  load  store'}</T>
      <T x={40} y={312} s={17} f={C.caramel} w={600}>{cur}</T>
      <T x={560} y={316} s={26} f={C.caramel} a="end" w={700}>units {k}</T>
      <T x={40} y={366} s={13} f={C.taupe}>every C-style operation, load and store: one unit</T>
    </Svg>
  );
}

// 3 · Predict: can anything beat twenty?
export function BeatTwenty({ t, answer }: StepCtx) {
  const shown = answer !== null;
  const chain = [64, 32, 16, 8, 4, 2, 1];
  return (
    <Svg label="Comparison model: 20. Word-RAM: a question mark that becomes 6 after the answer" h={300}>
      <T x={150} y={60} s={15} f={C.cinnamon} a="middle">comparison model</T>
      <T x={150} y={124} s={34} f={C.cinnamon} a="middle" w={700}>20</T>
      <T x={450} y={60} s={15} f={C.caramel} a="middle">word-RAM</T>
      <T x={450} y={124} s={34} f={C.caramel} a="middle" w={700} o={shown ? 1 : 0.7 + 0.3 * Math.sin(t * 4)}>{shown ? '6' : '?'}</T>
      {shown && (
        <>
          <T x={450} y={150} s={13} f={C.taupe} a="middle" o={fadeIn(t, 0.1)}>halvings, each a few</T>
          <T x={450} y={174} s={13} f={C.taupe} a="middle" o={fadeIn(t, 0.1)}>word operations</T>
          <T x={300} y={236} s={17} f={C.caramel} a="middle" w={600}>
            {chain.slice(0, Math.min(7, Math.floor(t / 0.3) + 1)).join(' → ')}
          </T>
        </>
      )}
    </Svg>
  );
}

// 4 · A word must hold a pointer.
export function PointerFits({ t }: StepCtx) {
  const lit = Math.floor(easeOut(seg(t, 0.2, 1.4)) * 20);
  const x0 = 60;
  const cw = 7.5;
  const arrow = easeOut(seg(t, 1.6, 2.4));
  const small = fadeIn(t, 3.0);
  return (
    <Svg label="Twenty of the sixty-four bits of a word are enough to address a million cells; an 8-bit word reaches only 256" h={360}>
      <Bits x={x0} y={36} tint={(i) => (i < lit ? C.caramel : null)} value={0} o={1} />
      <Bracket x1={x0 + 44 * cw} x2={x0 + 64 * cw} y={72} o={fadeIn(t, 1.2)} />
      <T x={x0 + 64 * cw} y={96} s={15} f={C.caramel} a="end" o={fadeIn(t, 1.3)}>20 bits: 1,048,576 addresses</T>
      <T x={x0 + 64 * cw} y={116} s={13} f={C.taupe} a="end" o={fadeIn(t, 1.4)}>0 to 1,048,575 · 44 bits to spare</T>
      {[['0', 150], ['1', 176], ['2', 202]].map(([a, y]) => (
        <g key={a}>
          <T x={110} y={Number(y) + 15} s={13} f={C.taupe} a="end">{a}</T>
          <rect x={120} y={Number(y)} width={120} height={20} rx={4} fill="none" stroke={C.taupe} />
        </g>
      ))}
      <T x={180} y={246} s={15} f={C.taupe} a="middle">…</T>
      <T x={110} y={278} s={13} f={C.taupe} a="end">999,999</T>
      <rect x={120} y={262} width={120} height={20} rx={4} fill={C.cocoa} stroke={C.caramel} strokeWidth={2} opacity={lerp(1, 0.35, small)} />
      <Arrow x1={x0 + 56 * cw} y1={124} x2={246} y2={272} o={arrow} />
      <g opacity={small}>
        <Bits x={330} y={200} n={8} cw={20} h={20} value={255} tint={() => null} />
        <T x={330} y={248} s={13} f={C.taupe}>8 bits reach 256 cells</T>
      </g>
      <T x={300} y={332} s={22} f={C.caramel} a="middle" w={700} o={fadeIn(t, 3.6)}>w ≥ log₂ n: 64 ≥ 20</T>
    </Svg>
  );
}

// 5 · Big numbers pay by the word.
export function BigNumber({ t }: StepCtx) {
  const per = 0.045;
  const n = Math.min(64, Math.max(0, Math.floor((t - 0.4) / per) + 1));
  const lattice = fadeIn(t, 3.6, 0.6);
  return (
    <Svg label="A 4,096-bit number folded into 64 word cells; a carry visits all 64 of them, so adding costs 64 word additions" h={370}>
      <T x={300} y={32} s={15} f={C.latte} a="middle">a 4,096-bit number = 64 words of 64 bits</T>
      {Array.from({ length: 64 }, (_, i) => {
        const r = Math.floor(i / 8), c = i % 8;
        const x = 108 + c * 48, y = 50 + r * 26;
        return (
          <g key={i}>
            <rect x={x} y={y} width={44} height={22} rx={4} fill={i < n ? C.caramel : C.cocoa} stroke={C.mocha} />
            {lattice > 0 && <circle cx={x + 22} cy={y + 11} r={3} fill={C.taupe} opacity={lattice} />}
          </g>
        );
      })}
      <T x={300} y={296} s={22} f={C.caramel} a="middle" w={700}>word additions {n}</T>
      <T x={300} y={330} s={13} f={C.taupe} a="middle" o={lattice}>schoolbook ×: 64 × 64 = 4,096 word multiplies</T>
    </Svg>
  );
}

// 6 · One load, two prices.
export function OneLoad({ t }: StepCtx) {
  const bands = [
    { name: 'registers', y: 46, h: 30 },
    { name: 'L1', y: 82, h: 30 },
    { name: 'L2', y: 118, h: 30 },
    { name: 'main memory', y: 154, h: 56 },
  ];
  const hit = easeOut(seg(t, 0.2, 0.9));
  const climb = easeOut(seg(t, 1.8, 4.2));
  const missY = lerp(176, 58, climb); // from main memory up to the registers
  const flash = t > 1.5 && t < 2.1 ? 1 - (t - 1.5) / 0.6 : 0;
  const axis = (c: number) => 40 + (520 * Math.log10(c)) / 3;
  return (
    <Svg label="The same load hops one band when it hits the cache and climbs from main memory when it misses; the ratio is 80 times" h={410}>
      <T x={580} y={30} s={15} f={C.crema} a="end">model: 1 unit</T>
      {bands.map((b) => (
        <g key={b.name}>
          <rect x={150} y={b.y} width={400} height={b.h} rx={6} fill={C.roast} stroke={C.mocha} />
          <T x={140} y={b.y + b.h / 2 + 5} s={13} f={C.latte} a="end">{b.name}</T>
        </g>
      ))}
      <rect x={236} y={lerp(88, 52, hit)} width={30} height={18} rx={4} fill={C.crema} />
      <rect x={436} y={missY} width={30} height={18} rx={4} fill={flash > 0 ? C.cherry : C.crema} stroke={C.cherry} strokeWidth={flash > 0 ? 3 : 0} />
      <T x={251} y={242} s={17} f={C.crema} a="middle" o={fadeIn(t, 0.9)}>≈ 3 cycles</T>
      <T x={451} y={242} s={17} f={C.cherryText} a="middle" o={fadeIn(t, 4.0)}>≈ 240 cycles</T>
      <T x={351} y={290} s={30} f={C.crema} a="middle" serif w={700} o={fadeIn(t, 4.4)}>80×</T>
      <path d={`M40 330 H560`} stroke={C.taupe} />
      {[1, 10, 100, 1000].map((c) => (
        <g key={c}>
          <line x1={axis(c)} y1={326} x2={axis(c)} y2={334} stroke={C.taupe} />
          <T x={axis(c)} y={352} s={13} f={C.taupe} a="middle">{f(c)}</T>
        </g>
      ))}
      {[3, 14, 240].map((c) => (
        <circle key={c} cx={axis(c)} cy={330} r={4.5} fill={c === 240 ? C.cherryText : C.caramel} opacity={fadeIn(t, c === 240 ? 4 : 0.9)} />
      ))}
      <T x={40} y={374} s={13} f={C.taupe}>cycles, log scale. Pentium M figures listed</T>
      <T x={40} y={394} s={13} f={C.taupe}>by Drepper (2007): 3, 14 and 240</T>
    </Svg>
  );
}

// 7 · A wrong guess flushes the pipeline.
export function Flush({ t }: StepCtx) {
  const FLUSH = 3.2;
  const chips: ReactNode[] = [];
  for (let j = 0; j < 16; j++) {
    const start = j < 8 ? 0.35 * j : FLUSH + 0.5 + 0.35 * (j - 8);
    if (t < start) continue;
    let stage = Math.min(7, Math.floor((t - start) / 0.35));
    const dead = j < 8 && t > FLUSH;
    if (j < 8 && t <= FLUSH) stage = Math.min(7 - 0, stage);
    const o = dead ? clamp(1 - (t - FLUSH) / 0.4) : 1;
    if (o <= 0) continue;
    chips.push(<rect key={j} x={66 + stage * 64} y={128} width={48} height={28} rx={5} fill={dead ? C.cherry : C.crema} opacity={o} />);
  }
  return (
    <Svg label="A pipeline of eight stages fills with guessed work, then empties in one flush when the branch resolves the other way" h={340}>
      <T x={60} y={104} s={13} f={C.latte}>pipeline</T>
      <T x={572} y={104} s={15} f={C.crema} a="end">model: 1 unit</T>
      {Array.from({ length: 8 }, (_, i) => (
        <rect key={i} x={60 + i * 64} y={120} width={60} height={44} rx={6} fill="none" stroke={C.taupe} />
      ))}
      {chips}
      <T x={60} y={184} s={13} f={C.taupe}>8 of about 15–25 stages drawn</T>
      <T x={60} y={210} s={15} f={C.latte}>x &lt; a[mid]? predicted: yes</T>
      <T x={572} y={250} s={15} f={C.caramel} a="end" o={fadeIn(t, FLUSH - 0.1, 0.2)}>resolved: no</T>
      <T x={60} y={296} s={17} f={C.cherryText} o={fadeIn(t, FLUSH + 0.3)}>lost: 15–25 cycles ≈ pipeline length</T>
      <T x={60} y={326} s={13} f={C.taupe}>Zen 5, Agner Fog’s manual (2026)</T>
    </Svg>
  );
}

// 8 · The comparison model: one bit per question.
export function OneBit({ t }: StepCtx) {
  const probes = [3, 5, 6, 7]; // examples.py: places left after each answer are 9, 5, 3, 2, 1
  const lefts = [9, 5, 3, 2, 1];
  const lows = [0, 4, 6, 7, 8];
  const k = Math.min(4, Math.max(0, Math.floor((t - 0.6) / 0.8) + 1));
  const cur = k > 0 ? probes[Math.min(3, k - 1)] : -1;
  const cx = (j: number) => 60 + j * 60;
  return (
    <Svg label="Eight face-down cards and nine places for x; each comparison rules out part of them, four answers in all" h={360}>
      {Array.from({ length: 8 }, (_, j) => (
        <g key={j}>
          <rect x={cx(j)} y={100} width={50} height={70} rx={8} fill={C.roast} stroke={j === cur ? C.cinnamon : C.mocha} strokeWidth={j === cur ? 3 : 1.5} />
          <T x={cx(j) + 25} y={144} s={22} f={C.taupe} a="middle">?</T>
        </g>
      ))}
      {Array.from({ length: 9 }, (_, g) => (
        <circle key={g} cx={cx(g) - 5} cy={196} r={6} fill={C.crema} opacity={g >= lows[k] ? 1 : 0.15} />
      ))}
      <rect x={cx(cur >= 0 ? cur : 7) + 0} y={34} width={50} height={40} rx={8} fill={C.caramel} />
      <T x={cx(cur >= 0 ? cur : 7) + 25} y={61} s={17} f={C.espresso} a="middle" w={700}>x</T>
      <T x={300} y={252} s={17} f={C.cinnamon} a="middle">x {'<'} this card? yes or no: 1 bit</T>
      <T x={60} y={308} s={24} f={C.cinnamon} w={700}>answers {k}</T>
      <T x={540} y={308} s={17} f={C.crema} a="end">places left {lefts[k]}</T>
      {k === 4 && <T x={300} y={346} s={15} f={C.latte} a="middle" o={fadeIn(t, 4.0)}>9 places: 4 answers. 1,000,001 places: 20.</T>}
    </Svg>
  );
}

// 9 · On the word-RAM, a key is a number: three cuts.
export function KeyIsNumber({ t }: StepCtx) {
  const cw = 7.5, x0 = 60;
  const cuts = [
    { y: 36, parts: 1, label: 'the whole key as an address: index an array' },
    { y: 126, parts: 2, label: 'two halves of 32 → van Emde Boas' },
    { y: 216, parts: 4, label: 'four digits of 16 → radix sort' },
  ];
  return (
    <Svg label="One 64-bit key cut three ways: used whole as an address, in two halves, and in four digits" h={350}>
      {cuts.map((c, i) => {
        const a = fadeIn(t, 0.2 + i * 0.9);
        const w = 64 / c.parts;
        return (
          <g key={i} opacity={a}>
            <Bits x={x0} y={c.y} />
            {Array.from({ length: c.parts }, (_, p) => (
              <Bracket key={p} x1={x0 + p * w * cw + 2} x2={x0 + (p + 1) * w * cw - 2} y={c.y + 40} />
            ))}
            <T x={x0} y={c.y + 66} s={15} f={C.crema}>{c.label}</T>
          </g>
        );
      })}
      <T x={x0} y={330} s={13} f={C.latte} o={fadeIn(t, 3.4)}>many keys’ sketches in one word → fusion trees</T>
    </Svg>
  );
}

// 10 · Radix sort: digits as addresses.
export function RadixPasses({ t }: StepCtx) {
  const pass = Math.min(4, Math.floor(t / 1.4) + 1);
  const local = (t % 1.4) / 1.4;
  const r = rng(11);
  const dots = Array.from({ length: 28 }, () => ({ slot: Math.floor(r() * 60), x: 60 + r() * 480 }));
  const done = t > 5.6;
  return (
    <Svg label="A 64-bit key as four 16-bit digits; each pass scatters a million keys into 65,536 buckets and collects them, four passes in all" h={390}>
      <T x={60} y={30} s={15} f={C.latte}>pass {pass} of 4</T>
      <Bits x={60} y={40} />
      {[0, 1, 2, 3].map((p) => (
        <Bracket key={p} x1={62 + p * 120} x2={58 + (p + 1) * 120} y={78} c={p === 4 - pass ? C.caramel : C.taupe} />
      ))}
      <T x={60} y={118} s={13} f={C.taupe}>65,536 buckets, one per digit value</T>
      {Array.from({ length: 60 }, (_, s) => (
        <rect key={s} x={60 + s * 8} y={130} width={6.5} height={44} rx={1.5} fill={C.cocoa} />
      ))}
      {!done && dots.map((d, i) => {
        const y = lerp(96, 160, easeOut(clamp(local * 1.6 - i * 0.015)));
        return <circle key={i} cx={lerp(d.x, 60 + d.slot * 8 + 3, easeOut(clamp(local * 1.6 - i * 0.015)))} cy={y} r={2.4} fill={C.crema} opacity={local < 0.9 ? 1 : 0.2} />;
      })}
      <rect x={60} y={196} width={480} height={10} rx={3} fill={done ? C.crema : C.cocoa} opacity={done ? 0.9 : 0.8} />
      <T x={60} y={246} s={13} f={C.taupe}>lowest digit first; collected in bucket order, stably</T>
      <T x={40} y={290} s={18} f={C.caramel} w={600} o={fadeIn(t, 5.4)}>4 passes × 1,000,000 keys</T>
      <T x={40} y={322} s={18} f={C.caramel} w={600} o={fadeIn(t, 5.4)}>= 4,000,000 placements</T>
      <T x={40} y={366} s={17} f={C.cinnamon} o={fadeIn(t, 5.8)}>n · log₂ n ≈ 20,000,000 comparisons</T>
    </Svg>
  );
}

// 11 · van Emde Boas: halve the bits.
export function HalveBits({ t }: StepCtx) {
  const chain = [64, 32, 16, 8, 4, 2, 1];
  const links = Math.min(7, Math.max(1, Math.floor((t - 1.6) / 0.6) + 1));
  const halves = fadeIn(t, 0.4);
  const lit = fadeIn(t, 1.0);
  return (
    <Svg label="A 64-bit key split into a high half that picks a cluster and a low half that picks a position, halved six times down to one bit" h={390}>
      <Bits x={60} y={36} />
      <Bracket x1={62} x2={298} y={74} o={halves} />
      <Bracket x1={302} x2={538} y={74} o={halves} />
      <T x={180} y={98} s={15} f={C.caramel} a="middle" o={halves}>x = 3·2³² + 7: high 32 = cluster 3</T>
      <T x={420} y={98} s={15} f={C.latte} a="middle" o={halves}>low 32 = position 7</T>
      <T x={60} y={134} s={13} f={C.taupe}>summary</T>
      {Array.from({ length: 16 }, (_, i) => (
        <rect key={i} x={140 + i * 26} y={122} width={22} height={14} rx={3} fill={i === 3 ? C.caramel : C.cocoa} opacity={i === 3 ? lit : 1} />
      ))}
      <T x={60} y={172} s={13} f={C.taupe}>clusters</T>
      {Array.from({ length: 16 }, (_, i) => (
        <rect key={i} x={140 + i * 26} y={152} width={22} height={28} rx={3} fill="none" stroke={i === 3 ? C.caramel : C.mocha} strokeWidth={i === 3 ? 2.5 : 1} opacity={i === 3 ? 1 : 0.9} />
      ))}
      <T x={140} y={204} s={13} f={C.taupe}>16 slots drawn of 2³² per level</T>
      <T x={60} y={246} s={20} f={C.caramel} w={600}>{chain.slice(0, links).join(' → ')}</T>
      <T x={60} y={312} s={26} f={C.caramel} w={700} o={fadeIn(t, 1.6 + 0.6 * 6)}>halvings 6</T>
      <T x={560} y={312} s={17} f={C.cinnamon} a="end" o={fadeIn(t, 1.6 + 0.6 * 6)}>vs 20 comparisons</T>
      <T x={60} y={352} s={13} f={C.taupe}>the cluster’s min says: answer inside, or before it,</T>
      <T x={60} y={372} s={13} f={C.taupe}>so a query recurses once</T>
    </Svg>
  );
}

// 12 · The price: Theta(U) space, unless you hash.
export function SpacePrice({ t }: StepCtx) {
  const collapse = easeOut(seg(t, 2.4, 3.6));
  const dots = [0, 1, 2, 3, 4, 5, 6, 7];
  return (
    <Svg label="An array of 2 to the 64 cluster slots dwarfs a million keys; hashing keeps only the non-empty clusters, Theta of n" h={340}>
      <T x={40} y={90} s={15} f={C.latte}>array of clusters: 2⁶⁴ slots</T>
      <T x={560} y={90} s={22} f={C.taupe} a="end" w={700} o={1 - 0.5 * collapse}>Θ(U)</T>
      <rect x={40} y={104} width={520} height={34} rx={6} fill={C.cocoa} stroke={C.mocha} opacity={1 - 0.8 * collapse} />
      <rect x={299} y={104} width={2} height={34} fill={C.crema} opacity={fadeIn(t, 0.6) * (1 - collapse)} />
      <path d="M300 140 V168" stroke={C.crema} opacity={fadeIn(t, 0.8) * (1 - collapse)} />
      <T x={300} y={188} s={15} f={C.crema} a="middle" o={fadeIn(t, 0.9) * (1 - collapse)}>1,000,000 keys</T>
      {dots.map((i) => (
        <circle key={i} cx={120 + i * 52} cy={248} r={7} fill={C.caramel} opacity={collapse} />
      ))}
      <T x={40} y={290} s={15} f={C.latte} o={collapse}>only the non-empty clusters</T>
      <T x={560} y={290} s={22} f={C.caramel} a="end" w={700} o={collapse}>Θ(n)</T>
    </Svg>
  );
}

// 13 · Fusion trees: one subtraction compares against all keys.
const FK = [21, 27, 100, 110];
const SK = ['00', '01', '10', '11'];
export function Sketch({ t }: StepCtx) {
  const cells = (bits: string, x: number, y: number, cw: number, o: number, lit: (i: number) => boolean = () => false) => (
    <g opacity={o}>
      {bits.split('').map((b, i) => (
        <g key={i}>
          <rect x={x + i * cw} y={y} width={cw - 2} height={20} rx={3} fill={lit(i) ? C.caramel : C.roast} stroke={C.mocha} />
          <T x={x + i * cw + (cw - 2) / 2} y={y + 15} s={13} f={lit(i) ? C.espresso : C.crema} a="middle" w={700}>{b}</T>
        </g>
      ))}
    </g>
  );
  const cols = fadeIn(t, 0.8);
  const form = fadeIn(t, 1.6);
  const node = fadeIn(t, 2.6);
  const query = fadeIn(t, 3.4);
  const diff = fadeIn(t, 4.4);
  const verdict = fadeIn(t, 5.6);
  const binary = (v: number) => v.toString(2).padStart(8, '0');
  return (
    <Svg label="Four 8-bit keys shrink to two-bit sketches that sit side by side in one word; one subtraction compares the query against all of them" h={410}>
      <T x={40} y={22} s={13} f={C.taupe}>key</T>
      <T x={300} y={22} s={13} f={C.taupe}>sketch</T>
      {FK.map((k, r) => {
        const y = 30 + r * 28;
        return (
          <g key={k}>
            {binary(k).split('').map((b, i) => (
              <g key={i}>
                <rect x={40 + i * 22} y={y} width={20} height={20} rx={3} fill={(i === 1 || i === 4) && cols > 0 ? C.caramel : C.roast} stroke={C.mocha} opacity={1} />
                <T x={50 + i * 22} y={y + 15} s={13} f={(i === 1 || i === 4) && cols > 0 ? C.espresso : C.crema} a="middle" w={700}>{b}</T>
              </g>
            ))}
            <T x={226} y={y + 15} s={15} f={C.crema}>{k}</T>
            {cells(SK[r], 300, y, 22, form)}
          </g>
        );
      })}
      <T x={40} y={168} s={13} f={C.latte} o={node}>node word: a 1 before each sketch</T>
      {cells('100101110111', 40, 174, 22, node, (i) => i % 3 === 0)}
      <T x={40} y={216} s={13} f={C.latte} o={query}>query 25 (sketch 01), repeated, with a 0 before each</T>
      {cells('001001001001', 40, 222, 22, query)}
      <T x={40} y={264} s={13} f={C.latte} o={diff}>node − query: leading bit of each block</T>
      {cells('011100101110', 40, 270, 22, diff, (i) => i % 3 === 0)}
      <T x={40} y={332} s={18} f={C.caramel} w={600} o={verdict}>3 sketches ≥ sketch(q): predecessor 21</T>
      <T x={40} y={368} s={13} f={C.taupe}>8-bit keys; the node word is 12 bits,</T>
      <T x={40} y={388} s={13} f={C.taupe}>inside one 64-bit word</T>
    </Svg>
  );
}

// 14 · Back to the problem.
export function BackToProblem({ t }: StepCtx) {
  const cols = [
    { x: 100, head: 'comparison model', big: '20', color: C.cinnamon, size: 34, unit: 'comparisons', note1: 'a floor,', note2: 'proved in topic 4' },
    { x: 300, head: 'van Emde Boas', big: '6', color: C.caramel, size: 34, unit: 'halvings', note1: 'Θ(U) space,', note2: 'or hash' },
    { x: 500, head: 'fusion tree', big: 'log n / log w', color: C.caramel, size: 17, unit: '', note1: 'theory only', note2: '' },
  ];
  return (
    <Svg label="Three counts for the opening problem: 20 comparisons, 6 halvings, and log n over log w, each with its model and its price" h={380}>
      {cols.map((c, i) => {
        const a = fadeIn(t, 0.2 + i * 0.8);
        return (
          <g key={c.head} opacity={a} transform={`translate(0 ${(1 - a) * 14})`}>
            <T x={c.x} y={50} s={15} f={C.latte} a="middle">{c.head}</T>
            <T x={c.x} y={120} s={c.size} f={c.color} a="middle" w={700}>{c.big}</T>
            <T x={c.x} y={150} s={13} f={C.latte} a="middle">{c.unit}</T>
            <T x={c.x} y={196} s={13} f={C.taupe} a="middle">{c.note1}</T>
            <T x={c.x} y={216} s={13} f={C.taupe} a="middle">{c.note2}</T>
          </g>
        );
      })}
      <g opacity={fadeIn(t, 2.8)}>
        <line x1={40} y1={262} x2={560} y2={262} stroke={C.mocha} />
        <T x={300} y={296} s={15} f={C.latte} a="middle">every unit step: a load, hit or miss;</T>
        <T x={300} y={320} s={15} f={C.latte} a="middle">a compare, predicted or flushed</T>
      </g>
    </Svg>
  );
}

// 15 · Prove it 1: halvings for a billion keys.
export function Quiz1({ t, answer }: StepCtx) {
  const shown = answer !== null;
  const chain = [64, 32, 16, 8, 4, 2, 1];
  return (
    <Svg label="A 64-bit key and a billion keys; the answer is the chain of six halvings" h={300}>
      <Bits x={60} y={40} />
      <T x={300} y={110} s={17} f={C.crema} a="middle">n = 10⁹ keys</T>
      {shown && (
        <>
          <T x={300} y={180} s={20} f={C.caramel} a="middle" w={600}>{chain.slice(0, Math.min(7, Math.floor(t / 0.3) + 1)).join(' → ')}</T>
          <T x={300} y={230} s={17} f={C.cinnamon} a="middle" o={fadeIn(t, 1.2)}>log₂ 10⁹ ≈ 29.9 → 30 comparisons</T>
        </>
      )}
    </Svg>
  );
}

// 16 · Prove it 2: which model is the claim in?
export function Quiz2({ t, answer }: StepCtx) {
  const shown = answer !== null;
  return (
    <Svg label="A design document claims predecessor search is O(log n) and cannot be beaten" h={300}>
      <rect x={40} y={36} width={520} height={80} rx={12} fill="none" stroke={C.crema} />
      <T x={60} y={70} s={15} f={C.latte}>“finding the predecessor in our sorted</T>
      <T x={60} y={94} s={15} f={C.latte}>index is O(log n) and cannot be beaten”</T>
      {shown && (
        <>
          <g opacity={fadeIn(t, 0.1)} transform={`translate(0 ${(1 - fadeIn(t, 0.1)) * -12})`}>
            <rect x={40} y={140} width={520} height={50} rx={10} fill={C.roast} stroke={C.cinnamon} strokeWidth={2} />
            <T x={60} y={171} s={15} f={C.cinnamon} w={600}>comparison model: Ω(log n), topic 4</T>
          </g>
          <g opacity={fadeIn(t, 0.7)} transform={`translate(0 ${(1 - fadeIn(t, 0.7)) * -12})`}>
            <rect x={40} y={204} width={520} height={50} rx={10} fill={C.roast} stroke={C.caramel} strokeWidth={2} />
            <T x={60} y={235} s={15} f={C.caramel} w={600}>word-RAM: O(log w), O(log n / log w)</T>
          </g>
        </>
      )}
    </Svg>
  );
}

// 17 · Prove it 3: word additions for two 4,096-bit integers.
export function Quiz3({ t, answer }: StepCtx) {
  const shown = answer !== null;
  const n = shown ? Math.min(64, Math.floor(t / 0.045) + 1) : 0;
  return (
    <Svg label="Two 4,096-bit integers as a grid of 64 word cells; the carry visits every cell" h={320}>
      <T x={300} y={28} s={15} f={C.latte} a="middle">two 4,096-bit integers, w = 64</T>
      {Array.from({ length: 64 }, (_, i) => {
        const r = Math.floor(i / 8), c = i % 8;
        return <rect key={i} x={108 + c * 48} y={42 + r * 26} width={44} height={22} rx={4} fill={i < n ? C.caramel : C.cocoa} stroke={C.mocha} />;
      })}
      {shown && <T x={300} y={296} s={22} f={C.caramel} a="middle" w={700}>word additions {n}</T>}
    </Svg>
  );
}
