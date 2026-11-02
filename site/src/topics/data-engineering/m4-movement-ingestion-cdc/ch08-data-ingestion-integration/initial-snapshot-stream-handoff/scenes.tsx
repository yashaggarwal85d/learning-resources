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
    <Svg label="a connector is killed most of the way through snapshotting a huge table; on restart the progress bar snaps back to empty while the retained-WAL bar keeps climbing." h={220}>
      <Row y={60} label="snapshot progress" value="nearly done" valueColor={C.focus} o={easeOut(seg(t, 0, 0.4))} />
      <Row y={110} label="the kill" value="back to zero" valueColor={C.badText} o={easeOut(seg(t, 0.2, 0.6))} />
      <Row y={160} label="retained WAL" value="keeps climbing" valueColor={C.badText} o={easeOut(seg(t, 0.4, 0.8))} />
    </Svg>
  );
}

export function Predict({ t }: StepCtx) {
  return (
    <Svg label="on restart, does the snapshot pick up close to where it was killed, or does it begin again from the very first row?" h={200}>
      <Row y={70} label="the restart" value="resumes, or restarts" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="which one" value="not yet revealed" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function RevealCompletionRecordedOnlyAtEnd({ t }: StepCtx) {
  return (
    <Svg label="a snapshot's own completion is written only at its very last step; a kill before that step leaves nothing recorded at all." h={200}>
      <Row y={70} label="any earlier step" value="leaves no record" valueColor={C.badText} o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="the last step" value="marks it done" valueColor={C.focus} o={easeOut(seg(t, 0.25, 0.65))} />
    </Svg>
  );
}

export function RevealExportedSnapshotMeasured({ t }: StepCtx) {
  return (
    <Svg label="the real run: a slot's own exported snapshot is read in a second session, while a row written right after the slot is checked against it." h={220}>
      <Row y={60} label="row written after" value="missing from snapshot" o={easeOut(seg(t, 0, 0.4))} />
      <Row y={110} label="the snapshot" value="pinned at start" valueColor={C.focus} o={easeOut(seg(t, 0.2, 0.6))} />
    </Svg>
  );
}

export function RevealNoGapNoOverlap({ t }: StepCtx) {
  return (
    <Svg label="the snapshot position and the stream's own start position are the same point in the log, by construction, not by coincidence." h={200}>
      <Row y={70} label="snapshot ends" value="exactly where" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="the stream begins" value="the same seam" valueColor={C.focus} o={easeOut(seg(t, 0.25, 0.65))} />
    </Svg>
  );
}

export function RevealOverlapMeasured({ t }: StepCtx) {
  return (
    <Svg label="the real run: a row written during the snapshot is missing from the dump and shows up in the decoded stream exactly once." h={220}>
      <Row y={60} label="snapshot dump" value="absent" valueColor={C.badText} o={easeOut(seg(t, 0, 0.4))} />
      <Row y={110} label="decoded stream" value="present, exactly once" valueColor={C.focus} o={easeOut(seg(t, 0.2, 0.6))} />
    </Svg>
  );
}

export function RevealKillMidSnapshotLab({ t }: StepCtx) {
  return (
    <Svg label="a hand-written snapshot loop, killed on purpose partway through copying rows, leaves a target table that is only partly filled." h={200}>
      <Row y={70} label="the loop" value="killed on purpose" valueColor={C.badText} o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="the target table" value="partly filled" valueColor={C.badText} o={easeOut(seg(t, 0.25, 0.65))} />
    </Svg>
  );
}

export function RevealRestartMeasured({ t }: StepCtx) {
  return (
    <Svg label="the real run: the killed attempt's partial rows are discarded, a fresh attempt restarts from the first row, and the final target is diffed row for row against the source." h={240}>
      <Row y={55} label="partial rows" value="discarded" valueColor={C.badText} o={easeOut(seg(t, 0, 0.3))} />
      <Row y={100} label="the new attempt" value="starts over, clean" o={easeOut(seg(t, 0.15, 0.45))} />
      <Row y={145} label="target, source" value="an exact match" valueColor={C.focus} o={easeOut(seg(t, 0.35, 0.7))} />
    </Svg>
  );
}

export function Recap({ t }: StepCtx) {
  return (
    <Svg label="a crash before the last step restarts the whole snapshot; the exported snapshot and the stream share one seam; several modes decide what a restart does." h={260}>
      <Row y={50} label="a kill mid-snapshot" value="restarts from zero" valueColor={C.badText} o={easeOut(seg(t, 0, 0.3))} />
      <Row y={95} label="snapshot, stream" value="one shared seam" valueColor={C.focus} o={easeOut(seg(t, 0.15, 0.45))} />
      <Row y={140} label="the mode" value="decides the restart" o={easeOut(seg(t, 0.25, 0.55))} />
      <Row y={185} label="a huge table" value="a costly kill" valueColor={C.badText} o={easeOut(seg(t, 0.4, 0.75))} />
    </Svg>
  );
}

export function ProveIt({ t }: StepCtx) {
  return (
    <Svg label="a brand-new connector, one just restarted, and one recovering from a gap each want a different snapshot mode. Which fits a connector that only ever needs fresh rows, never the old ones?" h={200}>
      <Row y={70} label="three connectors" value="three different needs" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="the right mode" value="not yet revealed" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}
