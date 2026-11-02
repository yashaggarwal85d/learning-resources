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
    <Svg label="snapshots are already addressable by id. this topic gives some of them names, and motion." h={200}>
      <TallRow y={40} label="already true" value="snapshots are addressable by id" o={easeOut(seg(t, 0, 0.3))} />
      <TallRow y={100} label="this topic" value="names, and the ability to move" valueColor={C.focus} o={easeOut(seg(t, 0.25, 0.65))} />
    </Svg>
  );
}

export function PredictTagVsBranch({ t }: StepCtx) {
  return (
    <Svg label="a tag and a branch are both created from the same snapshot. what's the real difference?" h={200}>
      <TallRow y={40} label="both from the same snapshot" value="a tag and a branch" o={easeOut(seg(t, 0, 0.5))} />
      <TallRow y={100} label="the real difference" value="what is it?" valueColor={C.focus} o={easeOut(seg(t, 0.4, 1))} />
    </Svg>
  );
}

export function RevealCreatedForReal({ t }: StepCtx) {
  return (
    <Svg label="created for real: a tag and a branch, both pointing at this table's one snapshot." h={230}>
      <TallRow y={40} label="real pyiceberg manage_snapshots()" value="a tag and a branch, same snapshot" o={easeOut(seg(t, 0, 0.35))} />
      <TallRow y={100} label="two names" value="one snapshot, for now" valueColor={C.focus} o={easeOut(seg(t, 0.3, 0.7))} />
    </Svg>
  );
}

export function RevealSpecDistinguishesThem({ t }: StepCtx) {
  return (
    <Svg label="the spec says it directly: tags are fixed labels, branches are mutable references that move." h={230}>
      <TallRow y={40} label="the spec, directly" value="tags are fixed; branches are mutable" o={easeOut(seg(t, 0, 0.35))} />
      <TallRow y={100} label="fixed vs. movable" value="is the real difference" valueColor={C.focus} o={easeOut(seg(t, 0.3, 0.7))} />
    </Svg>
  );
}

export function PredictBranchWritesIsolated({ t }: StepCtx) {
  return (
    <Svg label="new rows are written to the audit branch. what happens to main?" h={200}>
      <TallRow y={40} label="new rows" value="written to the audit branch" o={easeOut(seg(t, 0, 0.5))} />
      <TallRow y={100} label="what happens to main?" value="moved too, or untouched?" valueColor={C.focus} o={easeOut(seg(t, 0.4, 1))} />
    </Svg>
  );
}

export function RevealMainProvablyUntouched({ t }: StepCtx) {
  return (
    <Svg label="staged for real: three new rows on the audit branch; main's own snapshot id, unchanged." h={230}>
      <TallRow y={40} label="staged on audit" value="three new rows, real branch write" o={easeOut(seg(t, 0, 0.35))} />
      <TallRow y={100} label="main, checked directly" value="unchanged" valueColor={C.focus} o={easeOut(seg(t, 0.3, 0.7))} />
    </Svg>
  );
}

export function RevealValidatedThenPublished({ t }: StepCtx) {
  return (
    <Svg label="validated, then published: a real check passes, and main is fast-forwarded for real." h={230}>
      <TallRow y={40} label="a real check" value="no duplicate ids, on the staged branch" o={easeOut(seg(t, 0, 0.35))} />
      <TallRow y={100} label="passes" value="main fast-forwarded for real" valueColor={C.focus} o={easeOut(seg(t, 0.3, 0.7))} />
    </Svg>
  );
}

export function RevealSecondAttemptRejected({ t }: StepCtx) {
  return (
    <Svg label="a second attempt, for real, fails the same check and never reaches main." h={230}>
      <TallRow y={40} label="a second batch" value="reintroduces an id already present" o={easeOut(seg(t, 0, 0.35))} />
      <TallRow y={100} label="the same real check" value="fails it; main never moves" valueColor={C.focus} o={easeOut(seg(t, 0.3, 0.7))} />
    </Svg>
  );
}

export function RevealOneTableViewsAndCatalog({ t }: StepCtx) {
  return (
    <Svg label="this is one table. views are a separate object entirely; more than one table at once is the catalog's job." h={230}>
      <TallRow y={40} label="views" value="a separate catalog object, no data of their own" o={easeOut(seg(t, 0, 0.35))} />
      <TallRow y={100} label="more than one table at once" value="belongs to the catalog, not here" valueColor={C.focus} o={easeOut(seg(t, 0.3, 0.7))} />
    </Svg>
  );
}

export function Recap({ t }: StepCtx) {
  return (
    <Svg label="a fixed pointer, a movable one, and a full publish flow run twice -- once in, once rejected." h={300}>
      <TallRow y={35} label="a tag" value="fixed, for retention and reproducibility" o={easeOut(seg(t, 0, 0.3))} />
      <TallRow y={100} label="a branch" value="movable, for isolated writes" o={easeOut(seg(t, 0.1, 0.4))} />
      <TallRow y={165} label="write-audit-publish" value="run twice: published, and rejected" valueColor={C.focus} o={easeOut(seg(t, 0.25, 0.6))} />
      <g opacity={easeOut(seg(t, 0.55, 1))}>
        <T x={25} y={230} s={14} f={C.latte}>
          the rule
        </T>
        <T x={25} y={256} s={16} f={C.focus} w={600}>
          this metadata tree is one mechanism;
        </T>
        <T x={25} y={280} s={16} f={C.focus} w={600}>
          next is a visibly different one: Delta's log
        </T>
      </g>
    </Svg>
  );
}
