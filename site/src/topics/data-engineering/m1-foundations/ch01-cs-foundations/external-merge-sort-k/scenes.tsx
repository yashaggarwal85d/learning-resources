import type { StepCtx } from '../../../../../reels/types';
import { clamp, easeOut, easeOutBack, lerp, rng, seg } from '../../../../../reels/anim';
import { C, Svg, T } from '../../../../../reels/kit';

// Colour grammar: caramel = quicksort / the chosen path, cinnamon = replacement selection / the
// alternative, cherry/cherryText = a cost that bites (seeks, extra passes), taupe = quiet/waiting,
// latte = labels, crema = data.
const fmt = (n: number) => Math.round(n).toLocaleString('en-US');

// 1 · A sort never has to fit.
export function Problem({ t }: StepCtx) {
  const spill = easeOut(seg(t, 0.3, 1.4));
  const split = easeOut(seg(t, 1.8, 2.8));
  return (
    <Svg label="A hash table that outgrows memory must spill and recurse; a sort splits into making runs and merging them instead" h={300}>
      <T x={25} y={40} s={14} f={C.latte}>hash table, outgrowing memory</T>
      <rect x={25} y={54} width={200} height={30} rx={7} fill={C.cherry} opacity={spill} />
      <T x={240} y={76} s={13} f={C.cherryText} o={spill}>spills and recurses</T>

      <T x={25} y={140} s={14} f={C.latte} o={split}>a sort, instead</T>
      <rect x={25} y={154} width={95} height={30} rx={7} fill={C.caramel} opacity={split} />
      <T x={72} y={176} s={12} f={C.espresso} a="middle" w={600} o={split}>runs</T>
      <rect x={130} y={154} width={95} height={30} rx={7} fill={C.cinnamon} opacity={split} />
      <T x={177} y={176} s={12} f={C.espresso} a="middle" w={600} o={split}>merge</T>
    </Svg>
  );
}

// 2 · Two phases: make runs, then merge them.
export function TwoPhases({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.3, 1.2));
  const b = easeOut(seg(t, 1.4, 2.4));
  return (
    <Svg label="One terabyte, sixteen gibibytes of memory, one mebibyte blocks: phase one makes runs, phase two merges them" h={280}>
      {['1 TiB', '16 GiB', '1 MiB'].map((v, i) => (
        <g key={v} opacity={a}>
          <T x={25 + i * 190} y={44} s={14} f={C.latte}>{['data', 'memory', 'block'][i]}</T>
          <T x={25 + i * 190} y={74} s={20} f={C.crema} w={700}>{v}</T>
        </g>
      ))}
      <T x={25} y={150} s={15} f={C.caramel} w={600} o={b}>phase one: unsorted file → sorted runs</T>
      <T x={25} y={186} s={15} f={C.cinnamon} w={600} o={b}>phase two: runs → one sorted output</T>
    </Svg>
  );
}

// 3 · Load, sort, spill: quicksort runs.
export function QuicksortRuns({ t }: StepCtx) {
  const N = 64;
  const cols = 16;
  const written = Math.floor(easeOut(seg(t, 0.3, 2.6)) * N);
  return (
    <Svg label="Loading memory, sorting it, and spilling it as one run, repeated: a terabyte over sixteen gibibyte loads gives sixty-four runs" h={320}>
      <T x={25} y={34} s={14} f={C.latte}>runs written</T>
      <T x={25} y={70} s={30} f={C.caramel} w={700}>{written}</T>
      {Array.from({ length: N }, (_, i) => {
        const r = Math.floor(i / cols);
        const c = i % cols;
        const on = i < written;
        return <rect key={i} x={25 + c * 34} y={100 + r * 34} width={28} height={28} rx={5} fill={on ? C.caramel : C.cocoa} opacity={on ? 1 : 0.5} />;
      })}
      <T x={300} y={290} s={15} f={C.crema} a="middle" o={clamp(written / N)}>1 TiB / 16 GiB = 64 runs</T>
    </Svg>
  );
}

// 4 · A snowplow heap makes longer runs.
export function ReplacementSelection({ t }: StepCtx) {
  const N = 32;
  const cols = 16;
  const written = Math.floor(easeOut(seg(t, 0.5, 2.8)) * N);
  const pop = easeOut(seg(t, 0.2, 0.5));
  return (
    <Svg label="Popping the smallest from a heap and still fitting in the new item if it is larger makes runs about twice as long, so half as many runs" h={320}>
      <T x={25} y={34} s={14} f={C.latte}>heap pops smallest, pulls in one more</T>
      <circle cx={60} cy={70} r={16} fill={C.cinnamon} opacity={pop} />
      <T x={60} y={75} s={13} f={C.espresso} a="middle" w={600}>min</T>
      {Array.from({ length: N }, (_, i) => {
        const r = Math.floor(i / cols);
        const c = i % cols;
        const on = i < written;
        return <rect key={i} x={25 + c * 34} y={110 + r * 34} width={28} height={28} rx={5} fill={on ? C.cinnamon : C.cocoa} opacity={on ? 1 : 0.5} />;
      })}
      <T x={300} y={210} s={15} f={C.crema} a="middle" o={clamp(written / N)}>about 2M per run → 32 runs</T>
    </Svg>
  );
}

// 5 · Predict: why give up the longer runs?
export function WhyQuicksortPredict({ t, answer }: StepCtx) {
  const answered = answer !== null;
  return (
    <Svg label="A heap sift scatters across memory one item at a time; a quicksort partition stays inside the cache" h={300}>
      {!answered && <T x={300} y={120} s={46} f={C.caramel} a="middle" o={0.75 + 0.25 * Math.sin(t * 3)}>?</T>}
      {answered && (
        <>
          <T x={160} y={70} s={14} f={C.latte} a="middle">heap sift</T>
          <T x={160} y={110} s={16} f={C.cherryText} a="middle" w={600}>scattered, one item</T>
          <T x={440} y={70} s={14} f={C.latte} a="middle">quicksort partition</T>
          <T x={440} y={110} s={16} f={C.caramel} a="middle" w={600}>cache-resident</T>
          <T x={300} y={200} s={15} f={C.crema} a="middle">transfers were counted; the cache miss was the real cost</T>
        </>
      )}
    </Svg>
  );
}

// 6 · Merge all the runs at once, not two at a time.
export function KWayMerge({ t }: StepCtx) {
  const N = 6;
  const merge = easeOut(seg(t, 0.4, 2.0));
  return (
    <Svg label="A min-heap holds every run's front item and pops the smallest to the output, folding all runs down in a single pass" h={320}>
      <T x={25} y={34} s={14} f={C.latte}>runs, each contributing its front item</T>
      {Array.from({ length: N }, (_, i) => {
        const a = easeOut(seg(t, 0.2 + i * 0.1, 0.6 + i * 0.1));
        const x = lerp(60 + i * 85, 300, merge);
        const y = lerp(60, 180, merge);
        return <circle key={i} cx={x} cy={y} r={14} fill={C.cinnamon} opacity={clamp(a)} />;
      })}
      <rect x={250} y={220} width={100} height={30} rx={7} fill={C.caramel} opacity={merge} />
      <T x={300} y={242} s={13} f={C.espresso} a="middle" w={600} o={merge}>output</T>
      <T x={300} y={280} s={14} f={C.crema} a="middle" o={merge}>one read, one write of every block</T>
    </Svg>
  );
}

// 7 · The merge barely touches memory.
export function HeapqMerge({ t }: StepCtx) {
  const streams = 5;
  const yield_ = easeOut(seg(t, 0.5, 2.4));
  return (
    <Svg label="Holding one record per stream and yielding the smallest forever merges any number of sorted streams in bounded memory" h={300}>
      {Array.from({ length: streams }, (_, i) => (
        <g key={i}>
          <T x={25} y={44 + i * 36} s={13} f={C.latte}>stream {i + 1}</T>
          <circle cx={160} cy={38 + i * 36} r={8} fill={C.cinnamon} opacity={0.6 + 0.4 * Math.sin(t * 2 + i)} />
        </g>
      ))}
      <path d="M180 40 Q 260 110 350 110" stroke={C.taupe} strokeWidth={2} fill="none" opacity={yield_} />
      <rect x={350} y={94} width={120} height={32} rx={8} fill={C.caramel} opacity={yield_} />
      <T x={410} y={116} s={13} f={C.espresso} a="middle" w={600} o={yield_}>yielded, in order</T>
      <T x={300} y={200} s={14} f={C.crema} a="middle" o={yield_}>one item per stream:</T>
      <T x={300} y={222} s={14} f={C.crema} a="middle" o={yield_}>M tuples for an M-way merge</T>
    </Svg>
  );
}

// 8 · Memory sets the fan-in.
export function FanInCalc({ t }: StepCtx) {
  const fill = easeOut(seg(t, 0.3, 1.8));
  return (
    <Svg label="Sixteen gibibytes of memory in one-mebibyte blocks gives sixteen thousand three hundred eighty four buffers; one goes to the output, leaving a fan-in of sixteen thousand three hundred eighty three" h={300}>
      <T x={25} y={34} s={14} f={C.latte}>16 GiB ÷ 1 MiB blocks</T>
      <T x={25} y={74} s={30} f={C.crema} w={700}>16,384 buffers</T>
      <rect x={25} y={100} width={420 * fill} height={26} rx={6} fill={C.caramel} />
      <rect x={25 + 420 * fill - 12} y={100} width={12} height={26} rx={3} fill={C.cherry} opacity={fill} />
      <T x={460} y={120} s={13} f={C.cherryText} o={fill}>− 1 for output</T>
      <T x={25} y={176} s={26} f={C.caramel} w={700} o={easeOut(seg(t, 1.4, 2.2))}>fan-in: 16,383</T>
    </Svg>
  );
}

// 9 · Predict: how many passes in total?
export function PassesPredict({ t, answer }: StepCtx) {
  const answered = answer !== null;
  return (
    <Svg label="One terabyte, sixteen gibibytes, one-mebibyte blocks: sixty four runs against a fan-in of sixteen thousand three hundred eighty three settles at two passes" h={300}>
      {!answered && <T x={300} y={120} s={46} f={C.caramel} a="middle" o={0.75 + 0.25 * Math.sin(t * 3)}>?</T>}
      {answered && (
        <>
          <T x={300} y={110} s={40} f={C.caramel} a="middle" w={700}>2 passes</T>
          <T x={300} y={150} s={15} f={C.crema} a="middle">64 runs, fan-in 16,383: one merge pass finishes it</T>
          <T x={300} y={190} s={14} f={C.cherryText} a="middle">two at a time instead: 7 passes</T>
        </>
      )}
    </Svg>
  );
}

// 10 · More fan-in, smaller buffers, more seeks.
export function BufferTension({ t }: StepCtx) {
  const shrink = easeOut(seg(t, 0.4, 2.2));
  return (
    <Svg label="Splitting a fixed memory budget across more runs shrinks each buffer, turning sequential reads into seeks" h={300}>
      <T x={25} y={34} s={14} f={C.latte}>fewer passes ←</T>
      <T x={575} y={34} s={14} f={C.latte} a="end">→ smaller buffers</T>
      <rect x={25} y={50} width={200 * (1 - 0.85 * shrink)} height={30} rx={6} fill={C.caramel} />
      <T x={300} y={140} s={16} f={C.cherryText} a="middle" o={shrink}>small buffers: seeking, not streaming</T>
    </Svg>
  );
}

// 11 · Predict: does maximizing fan-in make it faster?
export function MaxFanInPredict({ t, answer }: StepCtx) {
  const answered = answer !== null;
  return (
    <Svg label="Cranking the fan-in to its ceiling drops the pass count by one but can turn streaming reads into a storm of seeks" h={300}>
      {!answered && <T x={300} y={120} s={46} f={C.cinnamon} a="middle" o={0.75 + 0.25 * Math.sin(t * 3)}>?</T>}
      {answered && (
        <>
          <T x={300} y={110} s={22} f={C.cherryText} a="middle" w={600}>often, no: it gets slower</T>
          <T x={300} y={150} s={14} f={C.crema} a="middle">tiny buffers turn sequential reads into seeks</T>
          <T x={300} y={186} s={13} f={C.taupe} a="middle">real engines cap the fan-in at a few hundred</T>
        </>
      )}
    </Svg>
  );
}

// 12 · Back to the pipeline: one merge, everywhere.
export function Verdict({ t }: StepCtx) {
  const rows = ['ORDER BY spill', 'sort-merge join', 'LSM compaction'];
  const a = easeOut(seg(t, 0.3, 2.0));
  return (
    <Svg label="An order-by spill, a sort-merge join and compaction are the same k-way merge, tuned by run length and fan-in" h={280}>
      {rows.map((r, i) => {
        const o = easeOut(seg(t, 0.2 + i * 0.4, 0.8 + i * 0.4));
        return (
          <g key={r} opacity={o}>
            <T x={25} y={56 + i * 50} s={16} f={C.crema}>{r}</T>
          </g>
        );
      })}
      <T x={300} y={240} s={14} f={C.caramel} a="middle" w={600} o={a}>one mechanism, tuned once</T>
    </Svg>
  );
}
