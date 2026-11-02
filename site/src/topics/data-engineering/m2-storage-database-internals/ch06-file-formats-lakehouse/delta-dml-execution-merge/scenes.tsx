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
    <Svg label="a commit protocol only matters because of what produces commits. this topic: delta's own dml." h={200}>
      <TallRow y={40} label="topic 28 ended on" value="what produces commits" o={easeOut(seg(t, 0, 0.3))} />
      <TallRow y={100} label="this topic" value="delta's own dml, starting with merge" valueColor={C.focus} o={easeOut(seg(t, 0.25, 0.65))} />
    </Svg>
  );
}

export function PredictRewriteScope({ t }: StepCtx) {
  return (
    <Svg label="merge matches 11 rows out of 1000 in one file. how much of that file gets rewritten?" h={200}>
      <TallRow y={40} label="11 of 1000 rows match" value="in one real file" o={easeOut(seg(t, 0, 0.5))} />
      <TallRow y={100} label="how much gets rewritten?" value="just the 11, or the whole file?" valueColor={C.focus} o={easeOut(seg(t, 0.4, 1))} />
    </Svg>
  );
}

export function RevealFullRewrite({ t }: StepCtx) {
  return (
    <Svg label="the whole file, for real: 17834 bytes written to change 11 rows out of 1000." h={230}>
      <TallRow y={40} label="deletion vectors off" value="whole file rewritten" o={easeOut(seg(t, 0, 0.35))} />
      <TallRow y={100} label="real bytes written" value="17834 bytes, for 11 changed rows" valueColor={C.focus} o={easeOut(seg(t, 0.3, 0.7))} />
    </Svg>
  );
}

export function RevealDeletionVectorMode({ t }: StepCtx) {
  return (
    <Svg label="deletion vectors on: a real bitmap plus a small new-rows file. 70.8x less." h={230}>
      <TallRow y={40} label="deletion vectors on" value="old file never rewritten" o={easeOut(seg(t, 0, 0.35))} />
      <TallRow y={100} label="real bytes written" value="70.8x less, for real" valueColor={C.focus} o={easeOut(seg(t, 0.3, 0.7))} />
    </Svg>
  );
}

export function PredictMergeCompactionRace({ t }: StepCtx) {
  return (
    <Svg label="merge plans to touch file 1. a concurrent compaction removes it first. what happens to merge?" h={200}>
      <TallRow y={40} label="merge plans to touch file 1" value="compaction removes it first" o={easeOut(seg(t, 0, 0.5))} />
      <TallRow y={100} label="merge's commit" value="succeeds, fails, or retries?" valueColor={C.focus} o={easeOut(seg(t, 0.4, 1))} />
    </Svg>
  );
}

export function RevealConflictAndRetry({ t }: StepCtx) {
  return (
    <Svg label="a real conflict, the exact pair delta's docs name. merge re-reads and retries, for real." h={230}>
      <TallRow y={40} label="real conflict detected" value="merge vs. compaction" o={easeOut(seg(t, 0, 0.35))} />
      <TallRow y={100} label="merge retries" value="commits against the new tip" valueColor={C.focus} o={easeOut(seg(t, 0.3, 0.7))} />
    </Svg>
  );
}

export function RevealRowTrackingSplit({ t }: StepCtx) {
  return (
    <Svg label="the same row, rewritten: its stable id survives exactly; its fresh id comes out different." h={230}>
      <TallRow y={40} label="stable (materialized) id" value="500, unchanged after rewrite" o={easeOut(seg(t, 0, 0.35))} />
      <TallRow y={100} label="fresh (default) id" value="500 before, different after" valueColor={C.focus} o={easeOut(seg(t, 0.3, 0.7))} />
    </Svg>
  );
}

export function RevealWhySplitExists({ t }: StepCtx) {
  return (
    <Svg label="a fresh id is free but unstable; a stable id costs a column but survives a rewrite." h={230}>
      <TallRow y={40} label="fresh id" value="cheap, no extra storage" o={easeOut(seg(t, 0, 0.35))} />
      <TallRow y={100} label="stable id" value="costs a materialized column" valueColor={C.focus} o={easeOut(seg(t, 0.3, 0.7))} />
    </Svg>
  );
}

export function RevealNamedNotBuilt({ t }: StepCtx) {
  return (
    <Svg label="named, not rebuilt here: low-shuffle merge, inside a real engine. change data feed, already real." h={230}>
      <TallRow y={40} label="low-shuffle merge" value="a real engine's shuffle planner" o={easeOut(seg(t, 0, 0.35))} />
      <TallRow y={100} label="change data feed" value="already built, back in topic 20" valueColor={C.focus} o={easeOut(seg(t, 0.3, 0.7))} />
    </Svg>
  );
}

export function Recap({ t }: StepCtx) {
  return (
    <Svg label="merge finds touched files, rewrites whole or in part; conflicts retry; row identity survives rewrites." h={300}>
      <TallRow y={35} label="merge" value="finds files, rewrites whole or in part" o={easeOut(seg(t, 0, 0.3))} />
      <TallRow y={100} label="a conflict" value="detected and retried, not lost" o={easeOut(seg(t, 0.1, 0.4))} />
      <TallRow y={165} label="row tracking" value="stable identity across a rewrite" valueColor={C.focus} o={easeOut(seg(t, 0.25, 0.6))} />
      <g opacity={easeOut(seg(t, 0.55, 1))}>
        <T x={25} y={230} s={14} f={C.latte}>
          the rule
        </T>
        <T x={25} y={256} s={16} f={C.focus} w={600}>
          everything so far is the protocol as it
        </T>
        <T x={25} y={280} s={16} f={C.focus} w={600}>
          stands today -- next: the release that ships it
        </T>
      </g>
    </Svg>
  );
}
