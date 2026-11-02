import { C, Svg, T } from '../../../../../reels/kit';
import { easeOut, seg } from '../../../../../reels/anim';
import type { StepCtx } from '../../../../../reels/types';

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
    <Svg label="renaming one column. the catalog undercounts; one reader is never seen at all" h={200}>
      <Row y={70} label="catalog says" value="three tables use it" o={easeOut(seg(t, 0, 0.6))} />
      <Row y={130} label="the planted truth" value="far more, one unwired" valueColor={C.focus} o={easeOut(seg(t, 0.4, 1))} />
    </Svg>
  );
}

export function RevealBlastRadius({ t }: StepCtx) {
  return (
    <Svg label="blast radius: walk the graph downstream from the change, list what it touches" h={200}>
      <Row y={70} label="a proposed change" value="one node, lit" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="the walk" value="every node it reaches, downstream" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function PredictColumnVsTable({ t }: StepCtx) {
  return (
    <Svg label="dropping a column: table-level, column-level, or neither finds every dependent?" h={200}>
      <Row y={70} label="table-level lineage" value="finds every dependent?" />
      <Row y={130} label="column-level lineage" value="finds fewer, or more?" valueColor={C.focus} />
    </Svg>
  );
}

export function RevealColumnNarrows({ t }: StepCtx) {
  return (
    <Svg label="measured: column-level finds fewer, more precise dependents than table-level" h={200}>
      <Row y={70} label="table-level" value="every table reading it at all" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="column-level" value="only those deriving from it" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function ElaborateStalePropagation({ t }: StepCtx) {
  return (
    <Svg label="the same walk, run forward: mark every downstream dataset potentially stale" h={200}>
      <Row y={70} label="upstream run fails" value="marks readers downstream" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="stale, labeled why" value="not found on their own" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function ElaborateOwnerNotification({ t }: StepCtx) {
  return (
    <Svg label="resolve each affected node to its owner, dedupe to one notice per owner" h={200}>
      <Row y={70} label="ten affected tables" value="one owner" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="that owner" value="gets one notice, not ten" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function PredictPlantedTruth({ t }: StepCtx) {
  return (
    <Svg label="eleven real dependents, two dashboards, one reader no tool instruments -- how many missed?" h={200}>
      <Row y={70} label="a perfect walk" value="notifies how many owners?" />
      <Row y={130} label="the unwired export" value="notified, or missed?" valueColor={C.focus} />
    </Svg>
  );
}

export function RevealPlantedTruthAnswer({ t }: StepCtx) {
  return (
    <Svg label="measured: every reachable owner notified; the unwired export was never recorded at all" h={200}>
      <Row y={70} label="reachable readers" value="every owner notified" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="the unwired export" value="missed, never recorded" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function Recap({ t }: StepCtx) {
  return (
    <Svg label="blast radius is a graph walk; the graph is only as complete as what it records" h={280}>
      <Row y={50} label="blast radius" value="a downstream walk, scored" o={easeOut(seg(t, 0, 0.3))} />
      <Row y={100} label="column-level" value="narrower, more precise" o={easeOut(seg(t, 0.15, 0.45))} />
      <Row y={150} label="the honest gap" value="never zero missed readers" valueColor={C.focus} o={easeOut(seg(t, 0.4, 0.75))} />
    </Svg>
  );
}
