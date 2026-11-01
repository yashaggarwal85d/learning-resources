import type { StepCtx } from '../../../../../reels/types';
import { easeOut, seg } from '../../../../../reels/anim';
import { C, Svg, T, Bar } from '../../../../../reels/kit';

// Colour grammar (CHAPTER.md, continuing ch13's grammar): crema = a stored value, a bit, a
// payload; latte = secondary labels (a width, a count, a byte); taupe = a continuation flag or
// an empty slot; caramel = the thing to look at (the chosen width, the measured bar, the
// decision point); cinnamon (rare) = the alternative being compared; cherry/cherryText = the
// bad outcome (a mispredicted branch, an outlier forcing a block wide).

function byte(x: number, y: number, label: string, colour = C.crema, flag = false, w = 34) {
  return (
    <g key={`${x}-${y}`}>
      <rect x={x} y={y} width={w} height={28} rx={3} fill="none" stroke={colour} strokeWidth={1.6} />
      <T x={x + w / 2} y={y + 19} s={12} a="middle" f={colour}>{label}</T>
      {flag && <circle cx={x + w - 4} cy={y + 6} r={3} fill={C.cherryText} />}
    </g>
  );
}

// 1 · Is the smallest encoding also the fastest?
export function Hook({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.1, 1.2));
  const aQ = easeOut(seg(t, 1.5, 2.4));
  return (
    <Svg label="A bar for the counting floor, shorter bars for varint and frame of reference, both taller than the floor" h={320}>
      <T x={30} y={24} s={13} f={C.latte}>bits per id, several encodings</T>
      <g opacity={a}>
        <T x={60} y={80} s={13} f={C.caramel}>floor</T>
        <Bar x={160} y={68} w={180} h={14} full={300} fill={C.caramel} />
        <T x={60} y={126} s={13} f={C.crema}>varint</T>
        <Bar x={160} y={114} w={215} h={14} full={300} fill={C.crema} />
        <T x={60} y={172} s={13} f={C.cinnamon}>blocks of 128</T>
        <Bar x={160} y={160} w={230} h={14} full={300} fill={C.cinnamon} />
      </g>
      <g opacity={aQ}>
        <T x={300} y={230} s={13} a="middle" f={C.latte}>smallest, fastest — same thing?</T>
      </g>
    </Svg>
  );
}

// 2 · Varint, the whole mechanism
export function VarintMechanism({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.1, 1.2));
  const b = easeOut(seg(t, 1.3, 2.3));
  return (
    <Svg label="One byte for the value one, two bytes with continuation flags for the value a hundred and fifty" h={300}>
      <g opacity={a}>
        <T x={120} y={60} s={13} a="middle" f={C.latte}>one</T>
        {byte(90, 80, 'byte', C.crema)}
      </g>
      <g opacity={b}>
        <T x={400} y={60} s={13} a="middle" f={C.latte}>a hundred and fifty</T>
        {byte(310, 80, 'byte', C.crema, true)}
        {byte(380, 80, 'byte', C.crema)}
      </g>
      <T x={300} y={180} s={13} a="middle" f={C.caramel}>the flag says: one more byte</T>
    </Svg>
  );
}

// 3 · Known in advance, or not? (predict)
export function VarintBranchPredict({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.1, 1.2));
  return (
    <Svg label="A row of bytes with question marks over each continuation flag" h={280}>
      <g opacity={a}>
        {[0, 1, 2, 3].map((i) => byte(90 + i * 60, 90, '?', C.latte, i < 3))}
      </g>
      <T x={300} y={200} s={14} a="middle" f={C.caramel}>known ahead, or found out byte by byte?</T>
    </Svg>
  );
}

// 4 · The cost of that branch (takeaway)
export function BranchCost({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.1, 1.3));
  return (
    <Svg label="A row of ids each with close to two flashing branch marks beneath it" h={300}>
      <T x={30} y={24} s={13} f={C.latte}>branches, per id decoded</T>
      {[0, 1, 2, 3, 4].map((i) => (
        <g key={i} opacity={a}>
          <circle cx={100 + i * 90} cy={90} r={14} fill="none" stroke={C.crema} strokeWidth={1.6} />
          <circle cx={100 + i * 90 - 6} cy={130} r={4} fill={C.cherryText} />
          <circle cx={100 + i * 90 + 6} cy={130} r={4} fill={C.cherryText} opacity={i % 2 === 0 ? 1 : 0.4} />
        </g>
      ))}
      <T x={300} y={200} s={13} a="middle" f={C.latte}>almost every id, two guesses</T>
    </Svg>
  );
}

// 5 · Frame of reference
export function FrameOfReference({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.1, 1.3));
  return (
    <Svg label="A block of equal-width columns, one shared width label above the whole block" h={300}>
      <T x={300} y={50} s={13} a="middle" f={C.caramel}>one width, the whole block</T>
      <g opacity={a}>
        {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
          <rect key={i} x={80 + i * 45} y={80} width={36} height={60} fill="none" stroke={C.crema} strokeWidth={1.6} />
        ))}
      </g>
      <T x={300} y={200} s={13} a="middle" f={C.latte}>no per-value flag inside it</T>
    </Svg>
  );
}

// 6 · One outlier, one whole block (predict)
export function OutlierPredict({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.1, 1.2));
  return (
    <Svg label="A row of narrow columns and one tall column standing out, with a question about the block's own width" h={300}>
      <g opacity={a}>
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <rect key={i} x={80 + i * 60} y={120} width={44} height={30} fill="none" stroke={C.crema} strokeWidth={1.6} />
        ))}
        <rect x={80 + 2 * 60} y={70} width={44} height={80} fill="none" stroke={C.cherryText} strokeWidth={1.8} />
      </g>
      <T x={300} y={220} s={14} a="middle" f={C.caramel}>does the whole block widen?</T>
    </Svg>
  );
}

// 7 · Patching (takeaway)
export function Patching({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.1, 1.3));
  return (
    <Svg label="A narrow block with the outlier lifted out to a side row, patched back in after decoding" h={320}>
      <T x={30} y={24} s={13} f={C.latte}>width chosen for most, outliers set aside</T>
      <g opacity={a}>
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <rect key={i} x={80 + i * 60} y={70} width={44} height={30} fill="none" stroke={C.crema} strokeWidth={1.6} />
        ))}
        <path d="M200 100 L200 150" stroke={C.caramel} strokeWidth={1.6} fill="none" />
        <rect x={160} y={160} width={80} height={30} fill="none" stroke={C.caramel} strokeWidth={1.8} />
        <T x={200} y={210} s={12} a="middle" f={C.latte}>exception, patched back</T>
      </g>
    </Svg>
  );
}

// 8 · Grouped control bytes
export function GroupedControl({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.1, 1.3));
  return (
    <Svg label="One control byte above four data bytes, one arrow from the control byte to all four" h={300}>
      <g opacity={a}>
        {byte(230, 60, 'ctrl', C.caramel, false, 54)}
        {[0, 1, 2, 3].map((i) => (
          <g key={i}>
            <path d={`M257 88 L${110 + i * 90} 130`} stroke={C.latte} strokeWidth={1.2} fill="none" />
            {byte(93 + i * 90, 140, 'data', C.crema)}
          </g>
        ))}
      </g>
      <T x={300} y={210} s={13} a="middle" f={C.latte}>one flag, four integers described</T>
    </Svg>
  );
}

// 9 · Does separating the streams change the size? (predict)
export function StreamSeparationPredict({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.1, 1.3));
  return (
    <Svg label="A control-byte strip moved above a data strip, same total bytes in both arrangements" h={300}>
      <g opacity={a}>
        <T x={60} y={70} s={12} f={C.latte}>before</T>
        {byte(130, 55, 'c', C.caramel)}
        {byte(166, 55, 'd', C.crema)}
        {byte(202, 55, 'd', C.crema)}
        <T x={60} y={150} s={12} f={C.latte}>after</T>
        {byte(130, 135, 'c', C.caramel)}
        {byte(166, 135, 'c', C.caramel)}
        <path d="M130 170 L130 185" stroke={C.latte} strokeWidth={1.2} fill="none" />
        {byte(130, 190, 'd', C.crema)}
        {byte(166, 190, 'd', C.crema)}
      </g>
      <T x={300} y={230} s={13} a="middle" f={C.caramel}>same bits, moved — or fewer?</T>
    </Svg>
  );
}

// 10 · Branches against bits, together (takeaway)
export function BitsVsBranches({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.1, 1.3));
  const rows: [string, number, number, string][] = [
    ['varint', 0.72, 0.9, C.crema],
    ['grouped', 0.8, 0.11, C.cinnamon],
    ['frame of ref.', 0.77, 0.01, C.cherryText],
    ['patched FOR', 0.69, 0.01, C.caramel],
  ];
  return (
    <Svg label="Four rows, a bits bar and a branches bar each, the orders not matching" h={340}>
      <T x={30} y={24} s={12} f={C.latte}>bits (top) and branches (bottom), per row</T>
      {rows.map(([name, bits, branches, colour], i) => (
        <g key={name} opacity={a}>
          <T x={60} y={60 + i * 68} s={12} f={colour}>{name}</T>
          <Bar x={170} y={50 + i * 68} w={bits * 260} h={12} full={260} fill={colour} />
          <Bar x={170} y={66 + i * 68} w={branches * 260} h={12} full={260} fill={C.latte} />
        </g>
      ))}
    </Svg>
  );
}

// 11 · Where this is used
export function Adoption({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.2, 1.4));
  return (
    <Svg label="Two labels naming a search engine and a columnar format, each with its own encoding named" h={300}>
      <g opacity={a}>
        <T x={180} y={90} s={13} a="middle" f={C.crema}>search</T>
        <T x={180} y={114} s={11} a="middle" f={C.latte}>fixed blocks, patched</T>
        <T x={420} y={90} s={13} a="middle" f={C.crema}>columnar</T>
        <T x={420} y={114} s={11} a="middle" f={C.latte}>delta and run-length</T>
      </g>
    </Svg>
  );
}

// 12 · Recap
export function Recap({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.2, 1.4));
  return (
    <Svg label="Two short labels: fewest branches, not fewest bits, beside a pointer to the next topic" h={300}>
      <g opacity={a}>
        <T x={180} y={90} s={13} a="middle" f={C.caramel}>fewest branches</T>
        <T x={180} y={114} s={11} a="middle" f={C.latte}>wins the decode</T>
        <T x={420} y={90} s={13} a="middle" f={C.crema}>not</T>
        <T x={420} y={114} s={11} a="middle" f={C.latte}>fewest bits</T>
      </g>
      <T x={300} y={200} s={13} a="middle" f={C.latte}>an immutable block, next: who else can read it</T>
    </Svg>
  );
}
