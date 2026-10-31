import { C, Svg, T } from '../../../../../reels/kit';
import { easeOut, seg } from '../../../../../reels/anim';
import type { StepCtx } from '../../../../../reels/types';

function TallRow({ y, label, value, valueColor = C.crema, o = 1 }: { y: number; label: string; value: string; valueColor?: string; o?: number }) {
  return (
    <g opacity={o}>
      <T x={25} y={y} s={14} f={C.latte}>
        {label}
      </T>
      <T x={25} y={y + 26} s={16} f={valueColor} w={600}>
        {value}
      </T>
    </g>
  );
}

export function Hook({ t }: StepCtx) {
  return (
    <Svg label="merge-on-read's own delete files deserve their own topic -- the deletion vector, built for real." h={200}>
      <TallRow y={40} label="last topic" value="a small log file, merged at read time" o={easeOut(seg(t, 0, 0.3))} />
      <TallRow y={100} label="this topic" value="the deletion vector itself, built for real" valueColor={C.focus} o={easeOut(seg(t, 0.25, 0.65))} />
      <TallRow y={160} label="compared across" value="Delta, Iceberg v3, and Hudi" o={easeOut(seg(t, 0.55, 1))} />
    </Svg>
  );
}

export function PredictArrayOrBitmap({ t }: StepCtx) {
  return (
    <Svg label="1,200 of 50,000 rows need marking deleted, without rewriting the file -- cheapest way to record it?" h={200}>
      <TallRow y={40} label="1,200 of 50,000 rows deleted" value="without rewriting the file" o={easeOut(seg(t, 0, 0.5))} />
      <TallRow y={100} label="cheapest way to record it?" value="a list of positions, or a bitmap?" valueColor={C.focus} o={easeOut(seg(t, 0.4, 1))} />
    </Svg>
  );
}

export function RevealBitmapNotList({ t }: StepCtx) {
  return (
    <Svg label="a deletion vector is a bitmap, one bit per row position -- not a list of deleted rows." h={230}>
      <TallRow y={40} label="a deletion vector" value="a bitmap, one bit per row position" o={easeOut(seg(t, 0, 0.35))} />
      <TallRow y={100} label="a set bit at position P" value="means the row at P is deleted" valueColor={C.focus} o={easeOut(seg(t, 0.3, 0.7))} />
    </Svg>
  );
}

export function RevealSmallStaysArray({ t }: StepCtx) {
  return (
    <Svg label="reproduced for real: 1,200 deletions stay under the threshold -- stored as a plain array." h={230}>
      <TallRow y={40} label="1,200 positions deleted" value="under the real format's own threshold" o={easeOut(seg(t, 0, 0.35))} />
      <TallRow y={100} label="real measured container" value="array, 2 bytes per deleted position" valueColor={C.focus} o={easeOut(seg(t, 0.3, 0.7))} />
    </Svg>
  );
}

export function PredictArrayGrowsOrSwitches({ t }: StepCtx) {
  return (
    <Svg label="what happens once the deletion count crosses that threshold?" h={200}>
      <TallRow y={40} label="deletion count keeps climbing" value="past the array's own threshold" o={easeOut(seg(t, 0, 0.5))} />
      <TallRow y={100} label="what happens to the container?" value="keeps growing, or switches shape?" valueColor={C.focus} o={easeOut(seg(t, 0.4, 1))} />
    </Svg>
  );
}

export function RevealLargeBecomesBitset({ t }: StepCtx) {
  return (
    <Svg label="reproduced for real: past the threshold, the same container becomes a fixed-size bitset." h={230}>
      <TallRow y={40} label="5,000 positions deleted" value="over the real format's own threshold" o={easeOut(seg(t, 0, 0.35))} />
      <TallRow y={100} label="real measured container" value="a fixed bitset, same size either way" valueColor={C.focus} o={easeOut(seg(t, 0.3, 0.7))} />
    </Svg>
  );
}

export function RevealRealReadCost({ t }: StepCtx) {
  return (
    <Svg label="reproduced for real: applying the deletion vector at read time costs measurably more." h={230}>
      <TallRow y={40} label="plain scan, no deletes" value="real measured baseline read cost" o={easeOut(seg(t, 0, 0.35))} />
      <TallRow y={100} label="scan applying the deletion vector" value="real measured cost, higher every time" valueColor={C.focus} o={easeOut(seg(t, 0.3, 0.7))} />
    </Svg>
  );
}

export function RevealCompactionPaysItBack({ t }: StepCtx) {
  return (
    <Svg label="reproduced for real: compaction purges the deleted rows -- the read cost drops back down." h={230}>
      <TallRow y={40} label="compaction purges deleted rows" value="physically, for good" o={easeOut(seg(t, 0, 0.35))} />
      <TallRow y={100} label="real measured result" value="faster than the deletion-vector-applied scan" valueColor={C.focus} o={easeOut(seg(t, 0.3, 0.7))} />
    </Svg>
  );
}

export function RevealThreeFormatsOneDifference({ t }: StepCtx) {
  return (
    <Svg label="Delta and Iceberg v3 share the bitmap; Hudi answers the same question a different way." h={230}>
      <TallRow y={40} label="Delta and Iceberg v3" value="the same bitmap, built for compatibility" o={easeOut(seg(t, 0, 0.35))} />
      <TallRow y={100} label="Hudi" value="no bitmap -- delete markers in its log files" valueColor={C.focus} o={easeOut(seg(t, 0.3, 0.7))} />
    </Svg>
  );
}

export function Recap({ t }: StepCtx) {
  return (
    <Svg label="a deletion vector is a real bitmap with a real size tradeoff and a real cost compaction pays back." h={300}>
      <TallRow y={35} label="a deletion vector" value="a bitmap indexed by row position" o={easeOut(seg(t, 0, 0.3))} />
      <TallRow y={100} label="the size tradeoff" value="array below the threshold, bitset above it" o={easeOut(seg(t, 0.1, 0.4))} />
      <TallRow y={165} label="the read-time cost" value="real, measured, and paid back by compaction" valueColor={C.focus} o={easeOut(seg(t, 0.25, 0.6))} />
      <g opacity={easeOut(seg(t, 0.55, 1))}>
        <T x={25} y={230} s={14} f={C.latte}>
          the rule
        </T>
        <T x={25} y={256} s={16} f={C.focus} w={600}>
          a bitmap buys you no-rewrite deletes, but every
        </T>
        <T x={25} y={280} s={16} f={C.focus} w={600}>
          read pays for it until compaction purges it
        </T>
      </g>
    </Svg>
  );
}
