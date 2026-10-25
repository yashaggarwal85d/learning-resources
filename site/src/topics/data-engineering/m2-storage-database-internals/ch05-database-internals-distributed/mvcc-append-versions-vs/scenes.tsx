import { C, Svg, T } from '../../../../../reels/kit';
import { easeOut, seg } from '../../../../../reels/anim';
import type { StepCtx } from '../../../../../reels/types';

/** A label-left / value-right row, stacked vertically with generous gaps (DESIGN.md, phone text scaling). */
function Row({ y, label, value, valueColor = C.crema, o = 1 }: { y: number; label: string; value: string; valueColor?: string; o?: number }) {
  return (
    <g opacity={o}>
      <T x={25} y={y} s={15} f={C.latte}>
        {label}
      </T>
      <T x={575} y={y} s={17} f={valueColor} a="end" w={600}>
        {value}
      </T>
    </g>
  );
}

export function Hook({ t }: StepCtx) {
  return (
    <Svg label="a B-tree finds the row fast. It says nothing about two transactions that both want to change it at once." h={200}>
      <Row y={70} label="two writers" value="same row" o={easeOut(seg(t, 0, 0.6))} />
      <Row y={130} label="a reader, mid-query" value="sees what?" valueColor={C.focus} o={easeOut(seg(t, 0.4, 1))} />
    </Svg>
  );
}

export function RevealRealUpdate({ t }: StepCtx) {
  return (
    <Svg label="a real row, updated on this sandbox's own cluster, read directly with pageinspect: both tuples, side by side." h={200}>
      <Row y={70} label="old tuple" value="xmax: the updater" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="new tuple" value="xmin: the updater" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function RevealVisibility({ t }: StepCtx) {
  return (
    <Svg label="the tuple's own header isn't enough. A reader checks two more things before it counts a version as visible." h={200}>
      <Row y={70} label="a snapshot" value="in-progress XIDs" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="a commit-log lookup" value="did it commit?" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function PredictOtherFamily({ t }: StepCtx) {
  return (
    <Svg label="InnoDB and Oracle update a row's one physical copy in place. Where does a concurrent reader's old value come from?" h={200}>
      <Row y={70} label="update in place" value="then what?" />
      <Row y={130} label="the old value" value="not yet revealed" valueColor={C.focus} />
    </Svg>
  );
}

export function RevealUndoLogFamily({ t }: StepCtx) {
  return (
    <Svg label="the same update, under the other family's model — sourced directly from InnoDB's and Oracle's own documentation." h={200}>
      <Row y={70} label="the row" value="updated in place" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="the undo log" value="old value, pushed out" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function RevealAppendCost({ t }: StepCtx) {
  return (
    <Svg label="repeated updates to one indexed row, no vacuum running: measured directly on this sandbox's own cluster." h={200}>
      <Row y={70} label="repeated updates" value="real page growth" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="nothing vacuumed yet" value="the cost sits there" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function RevealNoBlock({ t }: StepCtx) {
  return (
    <Svg label="an open transaction's own reads, measured directly against a real concurrent commit to the same row." h={200}>
      <Row y={70} label="a reader's own snapshot" value="unchanged" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="a concurrent commit" value="never blocked it" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function RevealSnapshotTooOld({ t }: StepCtx) {
  return (
    <Svg label="the undo-log family's own failure mode, sourced from Oracle's documentation: a direct consequence of its bounded log." h={200}>
      <Row y={70} label="the undo log" value="circular, bounded" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="a long reader's own undo" value="overwritten, gone" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function Recap({ t }: StepCtx) {
  return (
    <Svg label="two physically different answers to one problem, and the one failure mode only one of them has." h={260}>
      <Row y={50} label="the two families" value="append vs. in-place + undo" o={easeOut(seg(t, 0, 0.3))} />
      <Row y={95} label="update cost" value="a new tuple vs. in-place" o={easeOut(seg(t, 0.1, 0.4))} />
      <Row y={140} label="long reads" value="never blocked vs. rebuilt" valueColor={C.focus} o={easeOut(seg(t, 0.25, 0.6))} />
      <Row y={185} label="the undo family's limit" value="snapshot too old" o={easeOut(seg(t, 0.5, 0.85))} />
    </Svg>
  );
}

export function ProveIt({ t }: StepCtx) {
  return (
    <Svg label="a team on Oracle sees frequent snapshot-too-old errors on a nightly report and raises undo_retention to fix it." h={220}>
      <Row y={55} label="undo_retention" value="raised" o={easeOut(seg(t, 0, 0.4))} />
      <Row y={110} label="the structural risk" value="gone?" valueColor={C.focus} o={easeOut(seg(t, 0.25, 0.65))} />
      <Row y={165} label="really" value="only delayed" valueColor={C.focus} o={easeOut(seg(t, 0.55, 1))} />
    </Svg>
  );
}
