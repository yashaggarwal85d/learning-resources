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
    <Svg label="1000 rows, sorted and shuffled, 10 row groups. One query, two very different reads." h={200}>
      <TallRow y={40} label="1000 rows, 10 row groups" value="sorted and shuffled" o={easeOut(seg(t, 0, 0.3))} />
      <TallRow y={100} label="one query, 250 to 270" value="two very different reads" o={easeOut(seg(t, 0.25, 0.65))} />
      <TallRow y={160} label="same data, same query" value="how much gets read?" valueColor={C.focus} o={easeOut(seg(t, 0.55, 1))} />
    </Svg>
  );
}

export function PredictRowGroups({ t }: StepCtx) {
  return (
    <Svg label="every row group carries its own min and max. How many of 10 get skipped for 250-270?" h={200}>
      <TallRow y={40} label="query" value="250 to 270" o={easeOut(seg(t, 0, 0.5))} />
      <TallRow y={100} label="10 row groups" value="how many get skipped?" valueColor={C.focus} o={easeOut(seg(t, 0.4, 1))} />
    </Svg>
  );
}

export function RevealSortedSkip({ t }: StepCtx) {
  return (
    <Svg label="only row group 2 (200-299) can hold 250-270. The other 9 are provably out of range." h={230}>
      <TallRow y={40} label="row group 2, min-max" value="200 to 299" o={easeOut(seg(t, 0, 0.35))} />
      <TallRow y={100} label="row groups read" value="1 of 10" valueColor={C.focus} o={easeOut(seg(t, 0.3, 0.7))} />
    </Svg>
  );
}

export function RevealShuffledNoSkip({ t }: StepCtx) {
  return (
    <Svg label="the same query, shuffled: every row group's min-max spans nearly the whole range." h={230}>
      <TallRow y={40} label="shuffled, row groups read" value="10 of 10" o={easeOut(seg(t, 0, 0.4))} />
      <TallRow y={100} label="row groups skipped" value="0 — stats prune nothing" valueColor={C.focus} o={easeOut(seg(t, 0.4, 1))} />
    </Svg>
  );
}

export function RevealPageIndex({ t }: StepCtx) {
  return (
    <Svg label="inside row group 2, 4 pages of 25 rows each. Only one page overlaps 250-270." h={230}>
      <TallRow y={40} label="4 pages, row group 2" value="200-224, 225-249, 250-274, 275-299" o={easeOut(seg(t, 0, 0.35))} />
      <TallRow y={100} label="pages read" value="1 of 4 — only 250-274" valueColor={C.focus} o={easeOut(seg(t, 0.3, 0.7))} />
    </Svg>
  );
}

export function PredictHighCardinality({ t }: StepCtx) {
  return (
    <Svg label="a column of unique session ids spans the whole range in every row group. Can min-max help?" h={200}>
      <TallRow y={40} label="session id column" value="every value unique" o={easeOut(seg(t, 0, 0.5))} />
      <TallRow y={100} label="min-max statistics" value="can they help at all?" valueColor={C.focus} o={easeOut(seg(t, 0.4, 1))} />
    </Svg>
  );
}

export function RevealBloomFilter({ t }: StepCtx) {
  return (
    <Svg label="a real split-block bloom filter: 1024 blocks, 26,214 real keys inserted." h={230}>
      <TallRow y={40} label="bloom filter" value="1024 blocks, 26214 keys" o={easeOut(seg(t, 0, 0.4))} />
      <TallRow y={100} label="present key checks" value="true, every time" valueColor={C.focus} o={easeOut(seg(t, 0.4, 1))} />
    </Svg>
  );
}

export function RevealMeasuredFpr({ t }: StepCtx) {
  return (
    <Svg label="the spec states around 1.26% false positives for this size. This filter measures 1.25%." h={230}>
      <TallRow y={40} label="spec's own number" value="around 1.26%" o={easeOut(seg(t, 0, 0.35))} />
      <TallRow y={100} label="measured, 50000 checks" value="1.25%" valueColor={C.focus} o={easeOut(seg(t, 0.3, 0.7))} />
    </Svg>
  );
}

export function RevealTruncationBug({ t }: StepCtx) {
  return (
    <Svg label="shortening the max to 'B' instead of 'C' makes a real matching row invisible." h={230}>
      <TallRow y={40} label="correct truncated max" value="'C' — row group kept" o={easeOut(seg(t, 0, 0.4))} />
      <TallRow y={100} label="buggy truncated max" value="'B' — row wrongly skipped" valueColor={C.focus} o={easeOut(seg(t, 0.4, 1))} />
    </Svg>
  );
}

export function Recap({ t }: StepCtx) {
  return (
    <Svg label="statistics, the page index, and bloom filters all prune by proof, not guesswork." h={300}>
      <TallRow y={35} label="row group, page stats" value="skip by proof, not luck" o={easeOut(seg(t, 0, 0.3))} />
      <TallRow y={100} label="bloom filter" value="for columns stats can't help" o={easeOut(seg(t, 0.1, 0.4))} />
      <TallRow y={165} label="it all depends on" value="sorted, complete, true bounds" valueColor={C.focus} o={easeOut(seg(t, 0.25, 0.6))} />
      <g opacity={easeOut(seg(t, 0.55, 1))}>
        <T x={25} y={230} s={14} f={C.latte}>
          the rule
        </T>
        <T x={25} y={256} s={16} f={C.focus} w={600}>
          a reader can only skip what a writer —
        </T>
        <T x={25} y={280} s={16} f={C.focus} w={600}>
          proved it never needs to read
        </T>
      </g>
    </Svg>
  );
}
