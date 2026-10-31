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
    <Svg label="a directory listing broke as table state -- this topic is the fix: one immutable file, one pointer." h={200}>
      <TallRow y={40} label="last topic" value="a listing caught mid-write" o={easeOut(seg(t, 0, 0.3))} />
      <TallRow y={100} label="the fix" value="an explicit, versioned table state" valueColor={C.focus} o={easeOut(seg(t, 0.25, 0.65))} />
      <TallRow y={160} label="one word for that state" value="a snapshot" o={easeOut(seg(t, 0.55, 1))} />
    </Svg>
  );
}

export function PredictImmutable({ t }: StepCtx) {
  return (
    <Svg label="a snapshot is immutable -- so how does the table ever change at all?" h={200}>
      <TallRow y={40} label="a snapshot never gets edited" value="not even one byte, ever" o={easeOut(seg(t, 0, 0.5))} />
      <TallRow y={100} label="so how does a table change?" value="a new file, or an edit in place?" valueColor={C.focus} o={easeOut(seg(t, 0.4, 1))} />
    </Svg>
  );
}

export function RevealSnapshotIsWholeFile({ t }: StepCtx) {
  return (
    <Svg label="a snapshot is the complete file list at one moment -- the whole table, not a diff." h={230}>
      <TallRow y={40} label="a snapshot" value="the full set of data files, right now" o={easeOut(seg(t, 0, 0.35))} />
      <TallRow y={100} label="not a diff, not a delta" value="self-contained, read alone" valueColor={C.focus} o={easeOut(seg(t, 0.3, 0.7))} />
    </Svg>
  );
}

export function RevealAtomicPointerSwap({ t }: StepCtx) {
  return (
    <Svg label="the commit is one atomic swap of a pointer -- never an edit to the listing." h={230}>
      <TallRow y={40} label="a new snapshot file is written" value="the old one: untouched" o={easeOut(seg(t, 0, 0.35))} />
      <TallRow y={100} label="the commit" value="one atomic pointer swap" valueColor={C.focus} o={easeOut(seg(t, 0.3, 0.7))} />
    </Svg>
  );
}

export function PredictPinnedReader({ t }: StepCtx) {
  return (
    <Svg label="a reader pins a snapshot, then a second writer commits -- can the pinned reader ever see that change?" h={200}>
      <TallRow y={40} label="reader pins one snapshot" value="reads it, and only it" o={easeOut(seg(t, 0, 0.5))} />
      <TallRow y={100} label="a second writer commits meanwhile" value="does the pinned reader ever notice?" valueColor={C.focus} o={easeOut(seg(t, 0.4, 1))} />
    </Svg>
  );
}

export function RevealPinnedReaderUnaffected({ t }: StepCtx) {
  return (
    <Svg label="reproduced for real: the pinned reader's file list is identical before and after the second commit." h={230}>
      <TallRow y={40} label="pinned reader, before the 2nd commit" value="2 files" o={easeOut(seg(t, 0, 0.35))} />
      <TallRow y={100} label="pinned reader, read again after it" value="still 2 files -- unchanged" valueColor={C.focus} o={easeOut(seg(t, 0.3, 0.7))} />
    </Svg>
  );
}

export function RevealOptimisticCommit({ t }: StepCtx) {
  return (
    <Svg label="the protocol is optimistic by design: stage first, race to commit, retry on a stale base." h={230}>
      <TallRow y={40} label="writers stage files first" value="no lock, no waiting to write" o={easeOut(seg(t, 0, 0.35))} />
      <TallRow y={100} label="only the commit itself races" value="the loser just retries" valueColor={C.focus} o={easeOut(seg(t, 0.3, 0.7))} />
    </Svg>
  );
}

export function RevealCompareAndSwapRace({ t }: StepCtx) {
  return (
    <Svg label="reproduced for real: two writers race for the same slot -- exactly one wins." h={230}>
      <TallRow y={40} label="writer A and writer B, same base" value="both try to claim the same slot" o={easeOut(seg(t, 0, 0.35))} />
      <TallRow y={100} label="one commits, one gets a real error" value="the loser retries against the new base" valueColor={C.focus} o={easeOut(seg(t, 0.3, 0.7))} />
    </Svg>
  );
}

export function RevealDeltaSameShape({ t }: StepCtx) {
  return (
    <Svg label="Delta's own protocol: a single serial history of atomic versions, read through a log -- not a listing." h={230}>
      <TallRow y={40} label="Delta's table state" value="a serial history of atomic versions" o={easeOut(seg(t, 0, 0.35))} />
      <TallRow y={100} label="Delta's readers" value="use the log, never a directory listing" valueColor={C.focus} o={easeOut(seg(t, 0.3, 0.7))} />
    </Svg>
  );
}

export function Recap({ t }: StepCtx) {
  return (
    <Svg label="a snapshot is immutable, a commit is one atomic swap, and exactly one of two racing writers wins." h={300}>
      <TallRow y={35} label="a snapshot" value="the whole file list, immutable" o={easeOut(seg(t, 0, 0.3))} />
      <TallRow y={100} label="a commit" value="one atomic pointer swap" o={easeOut(seg(t, 0.1, 0.4))} />
      <TallRow y={165} label="two racing writers" value="exactly one wins, for real" valueColor={C.focus} o={easeOut(seg(t, 0.25, 0.6))} />
      <g opacity={easeOut(seg(t, 0.55, 1))}>
        <T x={25} y={230} s={14} f={C.latte}>
          the rule
        </T>
        <T x={25} y={256} s={16} f={C.focus} w={600}>
          replace the listing with an immutable version
        </T>
        <T x={25} y={280} s={16} f={C.focus} w={600}>
          and one pointer that moves atomically
        </T>
      </g>
    </Svg>
  );
}
