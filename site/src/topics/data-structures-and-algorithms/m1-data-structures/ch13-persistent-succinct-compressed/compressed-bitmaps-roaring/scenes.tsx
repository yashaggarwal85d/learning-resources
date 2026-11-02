import type { StepCtx } from '../../../../../reels/types';
import { easeOut, seg } from '../../../../../reels/anim';
import { C, Svg, T, Bar } from '../../../../../reels/kit';

// Colour grammar (CHAPTER.md): crema = a stored value, an id, a bit that is one; latte =
// secondary labels (a size in bytes, a bit width, a chunk number, a gap); taupe = a bit that is
// zero, an empty chunk, unused bits; caramel = the thing to look at (the chunk or container
// chosen, the smallest size); cinnamon (rare) = the alternative being compared (plain vs.
// compressed); cherry/cherryText = the bad outcome (an oversized container, a wasted branch).

function box(x: number, y: number, label: string, colour = C.crema, w = 60) {
  return (
    <g key={`${x}-${y}`}>
      <rect x={x} y={y} width={w} height={36} rx={4} fill="none" stroke={colour} strokeWidth={1.6} />
      <T x={x + w / 2} y={y + 23} s={13} a="middle" f={colour}>{label}</T>
    </g>
  );
}

// 1 · How much smaller, and by how much?
export function Hook({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.1, 1.2));
  const aQ = easeOut(seg(t, 1.5, 2.4));
  return (
    <Svg label="A fixed-size bitmap bar beside a smaller array bar for a thousand matches, with a question about a mixed-shape set" h={320}>
      <T x={30} y={24} s={13} f={C.latte}>a thousand matches, out of four billion</T>
      <g opacity={a}>
        <T x={60} y={80} s={13} f={C.cinnamon}>bitmap</T>
        <Bar x={160} y={68} w={300} h={14} full={300} fill={C.cinnamon} />
        <T x={60} y={126} s={13} f={C.caramel}>array</T>
        <Bar x={160} y={114} w={2} h={14} full={300} fill={C.caramel} />
      </g>
      <g opacity={aQ}>
        <T x={300} y={210} s={13} a="middle" f={C.latte}>dense here, sparse there, one long run elsewhere</T>
        <T x={300} y={236} s={14} a="middle" f={C.caramel}>what does one structure do?</T>
      </g>
    </Svg>
  );
}

// 2 · The two-level structure
export function TwoLevel({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.1, 1.4));
  return (
    <Svg label="A strip of chunks along the top, one key per chunk, each key paired with a container below it" h={320}>
      <T x={30} y={24} s={13} f={C.latte}>a strip of chunks</T>
      <g opacity={a}>
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <rect key={i} x={70 + i * 75} y={50} width={65} height={30} fill="none" stroke={i === 2 ? C.caramel : C.taupe} strokeWidth={1.4} />
        ))}
        <T x={200} y={100} s={13} a="middle" f={C.latte}>key</T>
        <path d="M200 110 L200 150" stroke={C.caramel} strokeWidth={1.4} fill="none" />
        {box(140, 160, 'container', C.crema, 120)}
      </g>
    </Svg>
  );
}

// 3 · Does the same container win both? (predict)
export function ShapePredict({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.1, 1.2));
  return (
    <Svg label="A scattered chunk and a bunched chunk side by side, with a question about whether one container wins both" h={300}>
      <g opacity={a}>
        <T x={150} y={60} s={13} a="middle" f={C.latte}>scattered</T>
        {Array.from({ length: 10 }, (_, i) => (
          <circle key={i} cx={80 + ((i * 37) % 140)} cy={90 + ((i * 53) % 60)} r={3} fill={C.crema} />
        ))}
        <T x={450} y={60} s={13} a="middle" f={C.latte}>bunched</T>
        <rect x={400} y={85} width={100} height={10} fill={C.crema} />
        <rect x={400} y={105} width={100} height={10} fill={C.crema} />
      </g>
      <T x={300} y={220} s={14} a="middle" f={C.caramel}>same container, or different?</T>
    </Svg>
  );
}

// 4 · Three containers, one honest size (takeaway)
export function ThreeContainers({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.1, 1.3));
  const rows: [string, number, string][] = [
    ['array', 200, C.crema],
    ['bitmap', 8192, C.taupe],
    ['run', 402, C.taupe],
  ];
  return (
    <Svg label="Three bars, array, bitmap and run, for a hundred scattered values, the array shortest and caramel" h={300}>
      <T x={30} y={24} s={13} f={C.latte}>a hundred scattered values</T>
      {rows.map(([name, size, colour], i) => (
        <g key={name} opacity={a}>
          <T x={60} y={68 + i * 48} s={13} f={i === 0 ? C.caramel : colour}>{name}</T>
          <Bar x={170} y={56 + i * 48} w={(size / 8192) * 300} h={14} full={300} fill={i === 0 ? C.caramel : colour} />
        </g>
      ))}
    </Svg>
  );
}

// 5 · The 4,096 threshold
export function Threshold({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.1, 1.4));
  const rise = easeOut(seg(t, 0.3, 2.2));
  return (
    <Svg label="A rising array-size line crossing a flat bitmap line at their one meeting point" h={300}>
      <T x={30} y={24} s={13} f={C.latte}>array size, rising, against a flat bitmap</T>
      <line x1={60} y1={80} x2={60 + rise * 420} y2={80 - rise * 160} stroke={C.crema} strokeWidth={1.8} />
      <line x1={60} y1={80 - 80} x2={480} y2={80 - 80} stroke={C.taupe} strokeWidth={1.8} />
      <circle cx={60 + 0.5 * 420} cy={80 - 0.5 * 160} r={5} fill={C.caramel} opacity={a} />
      <T x={300} y={220} s={13} a="middle" f={C.caramel}>exactly where two bytes meets eight kilobytes</T>
    </Svg>
  );
}

// 6 · Six bytes, or sixty-five thousand? (predict)
export function FullChunkPredict({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.1, 1.2));
  return (
    <Svg label="One giant run spanning a whole chunk, with a question about whether it costs six bytes or one per value" h={280}>
      <g opacity={a}>
        <rect x={80} y={100} width={440} height={20} fill={C.crema} />
        <T x={300} y={85} s={13} a="middle" f={C.latte}>every value, start to end</T>
      </g>
      <T x={300} y={180} s={14} a="middle" f={C.caramel}>six bytes, or one per value?</T>
    </Svg>
  );
}

// 7 · Run containers, and runOptimize (takeaway)
export function RunOptimize({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.1, 1.3));
  return (
    <Svg label="A bar for run container size staying flat as run count grows, unlike array and bitmap" h={300}>
      <T x={30} y={24} s={13} f={C.latte}>run size, against how many separate runs</T>
      {[1, 10, 100, 1000].map((r, i) => {
        const size = 2 + 4 * r;
        return (
          <g key={r} opacity={a}>
            <T x={60} y={68 + i * 48} s={12} f={C.latte}>{r} run{r > 1 ? 's' : ''}</T>
            <Bar x={170} y={56 + i * 48} w={Math.min(size, 8192) / 8192 * 300} h={14} full={300} fill={size < 8192 ? C.caramel : C.cherryText} />
          </g>
        );
      })}
    </Svg>
  );
}

// 8 · Three predicates, measured
export function ThreeMeasured({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.1, 1.3));
  const rows: [string, string][] = [
    ['dense', 'bitmap'],
    ['sparse', 'array'],
    ['clustered', 'run'],
  ];
  return (
    <Svg label="Three predicates, each with a plain bitmap bar, a plain array bar, and a shorter picked-per-chunk bar" h={340}>
      {rows.map(([name, kind], i) => (
        <g key={name} opacity={a}>
          <T x={60} y={50 + i * 90} s={13} f={C.latte}>{name}</T>
          <Bar x={60} y={60 + i * 90} w={300} h={10} full={300} fill={C.cinnamon} />
          <Bar x={60} y={74 + i * 90} w={200} h={10} full={300} fill={C.taupe} />
          <Bar x={60} y={88 + i * 90} w={20} h={10} full={300} fill={C.caramel} />
          <T x={380} y={88 + i * 90} s={11} f={C.caramel}>{kind}</T>
        </g>
      ))}
    </Svg>
  );
}

// 9 · What does a missing chunk cost? (predict)
export function MissingChunkPredict({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.1, 1.2));
  return (
    <Svg label="A chunk key present on one side with no matching container on the other, and a question about its cost" h={280}>
      <g opacity={a}>
        <T x={150} y={60} s={13} a="middle" f={C.latte}>side A</T>
        {box(100, 80, 'key 7', C.crema, 100)}
        <T x={450} y={60} s={13} a="middle" f={C.latte}>side B</T>
        {box(400, 80, 'absent', C.taupe, 100)}
      </g>
      <T x={300} y={200} s={14} a="middle" f={C.caramel}>what does key 7 cost?</T>
    </Svg>
  );
}

// 10 · Chunk-by-chunk AND, and galloping (takeaway)
export function GallopReveal({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.1, 1.3));
  return (
    <Svg label="A merge-cost line rising steadily beside a galloping-cost line staying low as the size gap grows" h={320}>
      <T x={30} y={24} s={13} f={C.latte}>cost, as one side grows much larger</T>
      <g opacity={a}>
        <T x={60} y={80} s={13} f={C.cinnamon}>merge</T>
        <Bar x={160} y={68} w={300} h={14} full={300} fill={C.cinnamon} />
        <T x={60} y={126} s={13} f={C.caramel}>galloping</T>
        <Bar x={160} y={114} w={10} h={14} full={300} fill={C.caramel} />
      </g>
      <T x={300} y={200} s={13} a="middle" f={C.latte}>wins decisively once one side dwarfs the other</T>
    </Svg>
  );
}

// 11 · Where Roaring is used
export function Adoption({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.2, 1.4));
  return (
    <Svg label="Four short labels naming four systems and how each one uses this design" h={300}>
      <g opacity={a}>
        <T x={90} y={90} s={13} a="middle" f={C.crema}>search</T>
        <T x={90} y={114} s={11} a="middle" f={C.latte}>inspired by</T>
        <T x={230} y={90} s={13} a="middle" f={C.crema}>compute</T>
        <T x={230} y={114} s={11} a="middle" f={C.latte}>uses it directly</T>
        <T x={370} y={90} s={13} a="middle" f={C.crema}>analytics</T>
        <T x={370} y={114} s={11} a="middle" f={C.latte}>its index</T>
        <T x={510} y={90} s={13} a="middle" f={C.crema}>store</T>
        <T x={510} y={114} s={11} a="middle" f={C.latte}>its default</T>
      </g>
    </Svg>
  );
}

// 12 · Recap
export function Recap({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.2, 1.4));
  return (
    <Svg label="Two short labels: no false answers, close to the honest minimum, beside a pointer to the next topic" h={300}>
      <g opacity={a}>
        <T x={180} y={90} s={13} a="middle" f={C.crema}>exact</T>
        <T x={180} y={114} s={11} a="middle" f={C.latte}>no false answers</T>
        <T x={420} y={90} s={13} a="middle" f={C.caramel}>honest</T>
        <T x={420} y={114} s={11} a="middle" f={C.latte}>close to the minimum</T>
      </g>
      <T x={300} y={200} s={13} a="middle" f={C.latte}>a sorted list, compressible further</T>
    </Svg>
  );
}
