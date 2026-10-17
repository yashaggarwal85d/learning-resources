import type { StepCtx } from '../../../../../reels/types';
import { clamp, easeOut, easeOutBack, lerp, rng, seg } from '../../../../../reels/anim';
import { C, Svg, T } from '../../../../../reels/kit';

// Colour grammar: caramel = the thing counted (blocks, transfers), cinnamon = the comparison-model
// alternative, cherry/cherryText = the expensive case (random access), taupe/latte = labels, crema = data.
const fmt = (n: number) => Math.round(n).toLocaleString('en-US');

// 1 · What the word-RAM hid.
export function Problem({ t }: StepCtx) {
  const grow = easeOut(seg(t, 0.3, 1.6));
  const outgrow = easeOut(seg(t, 1.8, 2.8));
  return (
    <Svg label="A one gibibyte vector of sixty four bit keys no longer fits in the memory the program is given" h={320}>
      <T x={25} y={34} s={14} f={C.latte}>vector of 64-bit keys</T>
      <rect x={25} y={48} width={lerp(60, 500, grow)} height={30} rx={7} fill={C.caramel} opacity={0.85} />
      <T x={25} y={110} s={14} f={C.latte} o={outgrow}>memory the program is given</T>
      <rect x={25} y={124} width={150} height={30} rx={7} fill={C.cocoa} stroke={C.cherry} strokeWidth={2} opacity={outgrow} />
      <T x={300} y={200} s={15} f={C.cherryText} a="middle" o={outgrow}>one unit per access was always a fiction</T>
    </Svg>
  );
}

// 2 · Predict: sorted sweep vs random visit.
export function SweepVsRandomPredict({ t, answer }: StepCtx) {
  const answered = answer !== null;
  const N = 20;
  const sweep = easeOut(seg(t, 0.3, 1.8));
  return (
    <Svg label="A sorted sweep rides the blocks together; a random visit lands each key in its own block" h={320}>
      <T x={25} y={34} s={13} f={C.latte}>sorted sweep</T>
      {Array.from({ length: N }, (_, i) => (
        <rect key={i} x={25 + i * 27} y={48} width={22} height={22} rx={4} fill={C.caramel} opacity={clamp(sweep * N - i)} />
      ))}
      <T x={25} y={120} s={13} f={C.latte}>random visit</T>
      {Array.from({ length: 10 }, (_, i) => {
        const r = rng(i + 1)();
        return <rect key={i} x={25 + r * 480} y={134} width={22} height={22} rx={4} fill={C.cherry} opacity={answered ? 1 : 0.6} />;
      })}
      {!answered && <T x={300} y={220} s={40} f={C.caramel} a="middle" o={0.75 + 0.25 * Math.sin(t * 3)}>?</T>}
      {answered && <T x={300} y={220} s={17} f={C.crema} a="middle">about 512 times fewer transfers, swept</T>}
    </Svg>
  );
}

// 3 · The model: Aggarwal and Vitter, 1988.
export function ModelIntro({ t }: StepCtx) {
  const appear = easeOut(seg(t, 0.3, 1.4));
  const move = easeOut(seg(t, 1.8, 2.8));
  return (
    <Svg label="A fast memory holding M items and a slow disk moving blocks of B items; only block transfers are counted" h={320}>
      <rect x={40} y={60} width={160} height={120} rx={14} fill={C.roast} stroke={C.caramel} strokeWidth={2} opacity={appear} />
      <T x={120} y={128} s={16} f={C.crema} a="middle" o={appear}>M items</T>
      <rect x={380} y={60} width={180} height={120} rx={14} fill={C.cocoa} stroke={C.mocha} strokeWidth={1.5} opacity={appear} />
      <T x={470} y={128} s={16} f={C.crema} a="middle" o={appear}>disk, B per block</T>
      <rect x={lerp(380, 220, move)} y={100} width={40} height={28} rx={6} fill={C.caramel} opacity={move} />
      <T x={300} y={250} s={14} f={C.taupe} a="middle" o={appear}>work in memory: free · only transfers are counted</T>
    </Svg>
  );
}

// 4 · Three numbers describe the job.
export function ThreeNumbers({ t }: StepCtx) {
  const cards = [
    { k: 'N', v: '134,217,728', d: 'keys in the vector' },
    { k: 'M', v: '8,388,608', d: 'keys that fit in memory' },
    { k: 'B', v: '512', d: 'keys per block' },
  ];
  return (
    <Svg label="N is one hundred thirty four million keys, M is eight million keys, B is five hundred twelve keys per block" h={320}>
      {cards.map((c, i) => {
        const a = easeOutBack(seg(t, i * 0.3, i * 0.3 + 0.7));
        const x = 25 + i * 190;
        return (
          <g key={c.k} transform={`translate(${x} ${70 + (1 - a) * 20})`} opacity={clamp(a)}>
            <rect width={170} height={170} rx={16} fill={C.roast} stroke={C.caramel} strokeWidth={1.5} />
            <T x={20} y={60} s={40} f={C.caramel} w={700}>{c.k}</T>
            <T x={20} y={100} s={16} f={C.crema} w={600}>{c.v}</T>
            <T x={20} y={130} s={12} f={C.taupe}>{c.d}</T>
          </g>
        );
      })}
    </Svg>
  );
}

// 5 · A scan touches every block once.
export function ScanBound({ t }: StepCtx) {
  const n = 24 * 12;
  const lit = easeOut(seg(t, 0.3, 2.4)) * n;
  const cols = 24;
  return (
    <Svg label="A scan reads every block once; for the vector, two hundred sixty two thousand one hundred forty four sequential transfers" h={320}>
      {Array.from({ length: n }, (_, i) => {
        const x = 60 + (i % cols) * 20;
        const y = 44 + Math.floor(i / cols) * 20;
        const on = clamp(lit - i);
        return <rect key={i} x={x} y={y} width={16} height={16} rx={3} fill={on > 0 ? C.caramel : C.cocoa} opacity={on > 0 ? 0.4 + 0.6 * on : 1} />;
      })}
      <T x={300} y={300} s={16} f={C.crema} a="middle" o={easeOut(seg(t, 2.2, 3.0))}>N / B = 262,144 transfers, all sequential</T>
    </Svg>
  );
}

// 6 · Search costs log base B.
export function SearchBound({ t }: StepCtx) {
  const binaryProbes = easeOut(seg(t, 0.3, 2.0));
  const blockProbes = easeOut(seg(t, 2.2, 3.0));
  return (
    <Svg label="Binary search over sorted blocks needs twenty seven probes; one transfer per block cuts it to three" h={320}>
      <T x={25} y={34} s={13} f={C.latte}>binary search, one key at a time</T>
      <T x={300} y={110} s={46} f={C.cinnamon} a="middle" w={700} o={binaryProbes}>27</T>
      <T x={25} y={180} s={13} f={C.latte}>block search, B keys at a time</T>
      <T x={300} y={250} s={46} f={C.caramel} a="middle" w={700} o={blockProbes}>3</T>
    </Svg>
  );
}

// 7 · Predict: how many passes to sort it?
export function SortPassesPredict({ t, answer }: StepCtx) {
  const answered = answer !== null;
  const N = 16;
  const merge = easeOut(seg(t, 0.3, 2.0));
  return (
    <Svg label="Sixteen sorted runs, a fan-in of sixteen thousand three hundred eighty four; one merge pass swallows them all" h={320}>
      <T x={25} y={34} s={13} f={C.latte}>16 sorted runs</T>
      {Array.from({ length: N }, (_, i) => {
        const x = lerp(30 + i * 34, 300, merge);
        const y = lerp(50, 160, merge);
        return <rect key={i} x={x} y={y} width={26} height={26} rx={5} fill={C.caramel} opacity={0.9} />;
      })}
      {!answered && <T x={300} y={240} s={40} f={C.caramel} a="middle" o={0.75 + 0.25 * Math.sin(t * 3)}>?</T>}
      {answered && <T x={300} y={240} s={26} f={C.caramel} a="middle" w={700}>2 passes</T>}
    </Svg>
  );
}

// 8 · The sort bound is a pass count.
export function PassCountExplain({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.3, 1.4));
  const b = easeOut(seg(t, 1.6, 2.6));
  return (
    <Svg label="A multiway merge with a fan-in in the thousands finishes in two or three passes; a two-way merge of the same runs needs four" h={300}>
      <T x={25} y={44} s={14} f={C.latte} o={a}>multiway merge, fan-in M / B</T>
      <rect x={25} y={58} width={120} height={30} rx={7} fill={C.caramel} opacity={a} />
      <T x={155} y={78} s={14} f={C.crema} o={a}>2 passes</T>

      <T x={25} y={140} s={14} f={C.latte} o={b}>two-way merge, same 16 runs</T>
      <rect x={25} y={154} width={240} height={30} rx={7} fill={C.cinnamon} opacity={b} />
      <T x={275} y={174} s={14} f={C.crema} o={b}>4 passes</T>
    </Svg>
  );
}

// 9 · Count the same sort twice.
export function CountTwice({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.3, 1.6));
  const b = easeOut(seg(t, 1.8, 3.0));
  return (
    <Svg label="Comparisons spin into the billions; block transfers tick a few hundred thousand times for the same sort" h={300}>
      <T x={25} y={40} s={14} f={C.latte}>comparisons</T>
      <rect x={25} y={54} width={420 * a} height={30} rx={7} fill={C.cinnamon} />
      <T x={455} y={74} s={15} f={C.crema} o={a}>3.6 billion</T>

      <T x={25} y={140} s={14} f={C.latte}>block transfers</T>
      <rect x={25} y={154} width={Math.max(4, 420 * a * 0.0002)} height={30} rx={7} fill={C.caramel} />
      <T x={60} y={210} s={15} f={C.crema} o={b}>524,288</T>
      <T x={300} y={260} s={14} f={C.taupe} a="middle" o={b}>the clock follows the transfers, not the comparisons</T>
    </Svg>
  );
}

// 10 · Repricing the doubling vector.
export function DoublingVectorRepriced({ t }: StepCtx) {
  const resizes = 6;
  const a = easeOut(seg(t, 0.3, 2.4));
  return (
    <Svg label="Each resize copies the contents as a scan; summed over all resizes, fewer than two N items move, so at most two N over B transfers" h={320}>
      {Array.from({ length: resizes }, (_, i) => {
        const w = 20 * Math.pow(2, i);
        const o = easeOut(seg(t, i * 0.3, i * 0.3 + 0.6));
        return <rect key={i} x={25} y={40 + i * 36} width={Math.min(500, w)} height={26} rx={6} fill={C.caramel} opacity={clamp(o)} />;
      })}
      <T x={300} y={290} s={16} f={C.crema} a="middle" o={easeOut(seg(t, 2.2, 3.0))}>≤ 2N / B transfers → O(1 / B) per append</T>
    </Svg>
  );
}

// 11 · The same model at every boundary.
export function EveryLevel({ t }: StepCtx) {
  const tiers = [
    { name: 'disk', b: 'B = 512 keys' },
    { name: 'CPU cache', b: 'B = 8 keys (64-byte line)' },
  ];
  return (
    <Svg label="At the disk boundary a block is five hundred twelve keys; at the cache boundary a block is eight keys, a cache line" h={300}>
      {tiers.map((tier, i) => {
        const a = easeOut(seg(t, 0.3 + i * 0.8, 1.1 + i * 0.8));
        const y = 70 + i * 110;
        return (
          <g key={tier.name} opacity={clamp(a * 1.5)}>
            <T x={25} y={y} s={18} f={C.crema}>{tier.name}</T>
            <T x={25} y={y + 30} s={15} f={C.caramel}>{tier.b}</T>
          </g>
        );
      })}
      <T x={300} y={280} s={14} f={C.taupe} a="middle" o={easeOut(seg(t, 2.0, 2.8))}>only M and B change; the counting is identical</T>
    </Svg>
  );
}

// 12 · Predict: lookups vs sort-then-scan.
export function LookupPredict({ t, answer }: StepCtx) {
  const answered = answer !== null;
  return (
    <Svg label="N random lookups cost about N transfers; sorting first and scanning costs only a couple of passes of N over B" h={300}>
      <T x={25} y={40} s={14} f={C.latte}>N one-at-a-time lookups</T>
      <rect x={25} y={54} width={420} height={30} rx={7} fill={C.cherry} opacity={answered ? 1 : 0.6} />
      <T x={25} y={140} s={14} f={C.latte}>sort, then scan</T>
      <rect x={25} y={154} width={Math.max(4, 420 * 0.02)} height={30} rx={7} fill={C.caramel} opacity={answered ? 1 : 0.6} />
      {!answered && <T x={300} y={240} s={34} f={C.caramel} a="middle" o={0.75 + 0.25 * Math.sin(t * 3)}>?</T>}
      {answered && <T x={300} y={240} s={16} f={C.crema} a="middle">sorting first wins by a factor close to B</T>}
    </Svg>
  );
}

// 13 · Predict: does it stay two passes forever?
export function GrowthPredict({ t, answer }: StepCtx) {
  const answered = answer !== null;
  const steps = 6;
  return (
    <Svg label="The pass count stays at two for a long way, and only ticks up once the run count first exceeds the fan-in" h={300}>
      {Array.from({ length: steps }, (_, i) => {
        const o = easeOut(seg(t, 0.2 + i * 0.3, 0.6 + i * 0.3));
        const bump = i === steps - 1 && answered;
        return <rect key={i} x={25 + i * 85} y={bump ? 60 : 100} width={70} height={30} rx={7} fill={bump ? C.cinnamon : C.caramel} opacity={clamp(o)} />;
      })}
      <T x={300} y={200} s={15} f={C.crema} a="middle" o={easeOut(seg(t, 2.2, 3.0))}>flat for a long way, then up by one</T>
    </Svg>
  );
}

// 14 · The honest caveat: measure the constant.
export function Verdict({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.2, 1.0));
  const b = easeOut(seg(t, 1.1, 1.9));
  return (
    <Svg label="The model predicts the shape of the cost; device latency, bandwidth and prefetching set the constant that measurement must find" h={280}>
      <T x={25} y={70} s={16} f={C.caramel} w={600} o={a}>the model: the shape of the cost</T>
      <T x={25} y={130} s={16} f={C.cinnamon} w={600} o={b}>measurement: the constant</T>
      <T x={25} y={190} s={14} f={C.taupe} o={easeOut(seg(t, 2.0, 2.8))}>every level of the hierarchy has its own M and B</T>
    </Svg>
  );
}
