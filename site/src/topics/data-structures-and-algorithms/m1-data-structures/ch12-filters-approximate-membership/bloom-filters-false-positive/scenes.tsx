import type { StepCtx } from '../../../../../reels/types';
import { easeOut, seg } from '../../../../../reels/anim';
import { C, Svg, T, Bar } from '../../../../../reels/kit';

// Colour grammar (CHAPTER.md): crema = a stored bit that is one, and a key; latte = secondary
// labels (k, m, a rate, bits per key); taupe = a bit that is zero; caramel = the thing to look
// at (the probes of the key being inserted or queried, the bit that decides the answer);
// cinnamon (rare) = the alternative being compared (measured vs. formula, derived vs.
// independent); cherry/cherryText = the bad outcome (a false positive, a false negative).

function bit(x: number, y: number, on: boolean, colour = on ? C.crema : C.taupe) {
  return (
    <rect key={`${x}-${y}`} x={x} y={y} width={22} height={22} rx={3} fill="none" stroke={colour} strokeWidth={1.6} />
  );
}

function box(x: number, y: number, label: string, colour = C.crema, w = 60) {
  return (
    <g key={`${x}-${y}`}>
      <rect x={x} y={y} width={w} height={36} rx={4} fill="none" stroke={colour} strokeWidth={1.6} />
      <T x={x + w / 2} y={y + 23} s={13} a="middle" f={colour}>{label}</T>
    </g>
  );
}

// 1 · How wrong is nearly free allowed to be?
export function Hook({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.1, 1.2));
  const aQ = easeOut(seg(t, 1.5, 2.4));
  return (
    <Svg label="A disk icon crossed out beside a small filter, with a question about how rare a wrong answer needs to be" h={320}>
      <T x={30} y={24} s={13} f={C.latte}>a read for an absent key</T>
      <g opacity={a}>
        {box(80, 60, 'disk read', C.taupe, 110)}
        <T x={135} y={115} s={12} a="middle" f={C.taupe}>skipped, almost always</T>
        {box(330, 60, 'filter', C.crema, 100)}
      </g>
      <g opacity={aQ}>
        <T x={300} y={200} s={13} a="middle" f={C.latte}>one in a hundred slips through</T>
        <T x={300} y={226} s={14} a="middle" f={C.caramel}>how much more, for one in a million?</T>
      </g>
    </Svg>
  );
}

// 2 · The structure
export function Structure({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.1, 1.3));
  const probe = easeOut(seg(t, 1.5, 2.6));
  const cells = [true, false, true, true, false, true, true];
  return (
    <Svg label="A row of bits, most zero, with a key's probes landing on three of them and setting them to one" h={320}>
      <T x={30} y={24} s={13} f={C.latte}>a row of bits</T>
      <g>
        {cells.map((on, i) => bit(80 + i * 30, 50, on))}
      </g>
      <g opacity={a}>
        {box(260, 150, 'key', C.crema, 50)}
      </g>
      <g opacity={probe}>
        <path d="M285 150 L95 72" stroke={C.caramel} strokeWidth={1.4} fill="none" />
        <path d="M285 150 L215 72" stroke={C.caramel} strokeWidth={1.4} fill="none" />
        <path d="M285 150 L275 72" stroke={C.caramel} strokeWidth={1.4} fill="none" />
        <T x={300} y={210} s={13} a="middle" f={C.latte}>insert sets k bits</T>
        <T x={300} y={236} s={13} a="middle" f={C.taupe}>any zero means a certain "absent"</T>
      </g>
    </Svg>
  );
}

// 3 · A bit that's already one (predict)
export function AlreadyOne({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.1, 1.2));
  return (
    <Svg label="Two keys both landing on the same already-set bit, with a question about what happens" h={280}>
      <g opacity={a}>
        {box(140, 60, 'key A', C.crema, 70)}
        {box(140, 150, 'key B', C.crema, 70)}
        {bit(380, 95, true, C.caramel)}
        <path d="M210 78 L380 100" stroke={C.caramel} strokeWidth={1.4} fill="none" />
        <path d="M210 168 L380 112" stroke={C.caramel} strokeWidth={1.4} fill="none" />
      </g>
      <T x={300} y={220} s={13} a="middle" f={C.latte}>B sets a bit A already set</T>
      <T x={300} y={246} s={14} a="middle" f={C.caramel}>what happens to the bit?</T>
    </Svg>
  );
}

// 4 · The rate, derived (takeaway)
export function RateDerived({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.1, 1.3));
  const rows: [string, number, number][] = [
    [' 8', 2.158, 2.177],
    ['10', 0.819, 0.876],
    ['12', 0.314, 0.317],
    ['16', 0.046, 0.042],
    ['20', 0.007, 0.006],
  ];
  return (
    <Svg label="Five rows, bits per key against formula rate and measured rate, closely matching" h={340}>
      <T x={30} y={24} s={13} f={C.latte}>bits per key, formula vs. measured</T>
      {rows.map(([bpk, formula, measured], i) => (
        <g key={bpk}>
          <T x={60} y={64 + i * 48} s={13} f={C.latte}>{bpk} bits</T>
          <T x={160} y={56 + i * 48} s={12} f={C.cinnamon}>formula</T>
          <Bar x={160} y={64 + i * 48} w={formula * 12} h={12} full={30} fill={C.cinnamon} />
          <T x={340} y={56 + i * 48} s={12} f={C.caramel}>measured</T>
          <Bar x={340} y={64 + i * 48} w={measured * 12} h={12} full={30} fill={C.caramel} />
        </g>
      ))}
    </Svg>
  );
}

// 5 · The optimum
export function Optimum({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.1, 1.4));
  const ks = [1, 2, 4, 6, 7, 8, 10, 14];
  const rates = [9.46, 3.22, 1.16, 0.82, 0.82, 0.88, 1.03, 1.91];
  const maxR = Math.max(...rates);
  return (
    <Svg label="A bar per number of hash positions, dipping to a flat valley around the middle, then rising again" h={320}>
      <T x={30} y={24} s={13} f={C.latte}>rate against hash positions, at ten bits per key</T>
      {ks.map((k, i) => {
        const h = (rates[i] / maxR) * 160;
        const isOpt = k === 7;
        return (
          <g key={k}>
            <rect x={70 + i * 58} y={220 - h} width={30} height={h} fill="none" stroke={isOpt ? C.caramel : C.crema} strokeWidth={1.6} />
            <T x={85 + i * 58} y={238} s={11} a="middle" f={C.latte}>{k}</T>
          </g>
        );
      })}
      <T x={300} y={280} s={13} a="middle" f={C.latte}>the valley is flat near the optimum</T>
    </Svg>
  );
}

// 6 · Not ten thousand times (predict)
export function NotTenThousand({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.1, 1.2));
  return (
    <Svg label="A rate shrinking from one in a hundred to one in a million, beside a question about how much more memory that needs" h={280}>
      <g opacity={a}>
        <T x={150} y={90} s={13} a="middle" f={C.crema}>one in a hundred</T>
        <T x={150} y={120} s={12} a="middle" f={C.latte}>ten bits per key</T>
        <T x={450} y={90} s={13} a="middle" f={C.caramel}>one in a million</T>
        <T x={450} y={120} s={12} a="middle" f={C.latte}>how many bits?</T>
      </g>
      <T x={300} y={210} s={14} a="middle" f={C.latte}>ten thousand times rarer —</T>
      <T x={300} y={236} s={14} a="middle" f={C.caramel}>ten thousand times the memory?</T>
    </Svg>
  );
}

// 7 · The bound (takeaway)
export function Bound({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.1, 1.4));
  const rows: [string, number, number][] = [
    ['1%', 6.64, 9.59],
    ['1 in a million', 19.93, 28.76],
  ];
  return (
    <Svg label="Two pairs of bars, the best possible bound and this filter's own bits per key, at a fixed gap apart each time" h={300}>
      <T x={30} y={24} s={13} f={C.latte}>bits per key: the floor, and this filter</T>
      {rows.map(([label, floor, bloom], i) => (
        <g key={label}>
          <T x={60} y={70 + i * 90} s={13} f={C.latte}>{label}</T>
          <T x={60} y={92 + i * 90} s={12} f={C.cinnamon}>floor</T>
          <Bar x={160} y={84 + i * 90} w={floor * 10} h={14} full={300} fill={C.cinnamon} />
          <T x={60} y={126 + i * 90} s={12} f={C.caramel}>this filter</T>
          <Bar x={160} y={118 + i * 90} w={bloom * 10} h={14} full={300} fill={C.caramel} />
        </g>
      ))}
      <T x={300} y={270} s={13} a="middle" f={C.latte}>the same fixed gap, every time</T>
    </Svg>
  );
}

// 8 · Two hashes, or one each? (predict)
export function TwoHashesPredict({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.1, 1.2));
  return (
    <Svg label="Seven separate hash function boxes crossed out, beside two hash function boxes with a question mark" h={280}>
      <g opacity={a}>
        <T x={150} y={60} s={13} a="middle" f={C.taupe}>k separate hashes?</T>
        {[0, 1, 2, 3, 4].map((i) => box(90 + i * 40, 80, 'h', C.taupe, 30))}
        <T x={450} y={60} s={13} a="middle" f={C.caramel}>two hashes?</T>
        {box(420, 80, 'h1', C.caramel, 36)}
        {box(464, 80, 'h2', C.caramel, 36)}
      </g>
      <T x={300} y={200} s={14} a="middle" f={C.latte}>which one does the job?</T>
    </Svg>
  );
}

// 9 · Derived probes (takeaway)
export function DerivedProbes({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.1, 1.3));
  return (
    <Svg label="Two hash values combining into several probe positions, beside a bar comparing their rate to independent hashes' rate" h={320}>
      <g opacity={a}>
        {box(80, 70, 'h1', C.crema, 40)}
        {box(80, 130, 'h2', C.crema, 40)}
        <T x={260} y={110} s={13} a="middle" f={C.latte}>h1 + i · h2</T>
      </g>
      <T x={30} y={220} s={13} f={C.latte}>measured rate, ten bits per key, k = 7</T>
      <T x={60} y={252} s={12} f={C.cinnamon}>independent</T>
      <Bar x={200} y={244} w={0.817 * 30} h={12} full={30} fill={C.cinnamon} />
      <T x={60} y={282} s={12} f={C.caramel}>derived</T>
      <Bar x={200} y={274} w={0.836 * 30} h={12} full={30} fill={C.caramel} />
    </Svg>
  );
}

// 10 · No deletes
export function NoDeletes({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.1, 1.2));
  const clear = easeOut(seg(t, 1.4, 2.2));
  return (
    <Svg label="Clearing one key's bits also clears a bit a second key depends on, turning that second key's answer from present to absent" h={320}>
      <T x={30} y={24} s={13} f={C.latte}>two keys, one shared bit</T>
      <g>
        {box(70, 60, 'key A', C.crema, 70)}
        {box(70, 150, 'key B', C.crema, 70)}
        {bit(300, 95, true, clear > 0.5 ? C.cherry : C.caramel)}
      </g>
      <g opacity={a}>
        <path d="M140 78 L300 100" stroke={C.caramel} strokeWidth={1.4} fill="none" />
        <path d="M140 168 L300 112" stroke={C.caramel} strokeWidth={1.4} fill="none" />
      </g>
      <g opacity={clear}>
        <T x={300} y={200} s={13} a="middle" f={C.cherryText}>clearing A's bits</T>
        <T x={300} y={226} s={13} a="middle" f={C.cherryText}>B now answers "absent"</T>
      </g>
    </Svg>
  );
}

// 11 · Chapter 5 reconciliation
export function Reconciliation({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.1, 1.3));
  return (
    <Svg label="An earlier chapter's measured number, nine point nine bits per key and about one percent, matching this topic's formula at seven hash positions" h={300}>
      <g opacity={a}>
        <T x={150} y={90} s={13} a="middle" f={C.latte}>earlier chapter:</T>
        <T x={150} y={116} s={13} a="middle" f={C.crema}>9.9 bits/key, k = 7</T>
        <T x={450} y={90} s={13} a="middle" f={C.latte}>this formula:</T>
        <T x={450} y={116} s={13} a="middle" f={C.caramel}>same k, about 1%</T>
      </g>
      <T x={300} y={200} s={13} a="middle" f={C.latte}>one number, the same derivation</T>
    </Svg>
  );
}

// 12 · Recap
export function Recap({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.2, 1.4));
  return (
    <Svg label="Three short labels: the fixed overspend factor, the one-sided error, and the two things the structure cannot do" h={300}>
      <g opacity={a}>
        <T x={100} y={90} s={13} a="middle" f={C.crema}>1.44×</T>
        <T x={100} y={114} s={11} a="middle" f={C.latte}>the floor</T>
        <T x={300} y={90} s={13} a="middle" f={C.caramel}>one-sided</T>
        <T x={300} y={114} s={11} a="middle" f={C.latte}>a false "maybe"</T>
        <T x={500} y={90} s={13} a="middle" f={C.taupe}>can't delete</T>
        <T x={500} y={114} s={11} a="middle" f={C.taupe}>can't list</T>
      </g>
      <T x={300} y={200} s={13} a="middle" f={C.latte}>the cheapest honest answer to "maybe"</T>
    </Svg>
  );
}
