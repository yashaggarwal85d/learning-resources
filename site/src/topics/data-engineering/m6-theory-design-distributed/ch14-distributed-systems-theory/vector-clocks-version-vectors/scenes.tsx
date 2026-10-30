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
    <Svg label="two customers add an item to the same cart on two replicas during a partition; reconnecting leaves two versions, and a scalar clock or timestamp would silently keep only one" h={200}>
      <Row y={70} label="two replicas" value="both accept a write" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="reconnecting" value="two cart versions" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function PredictWhichVersion({ t }: StepCtx) {
  return (
    <Svg label="does the store keep the version with the larger clock, both versions, or neither?" h={200}>
      <Row y={70} label="larger clock" value="wins, or keeps both?" />
      <Row y={130} label="neither dominates" value="what then?" valueColor={C.focus} />
    </Svg>
  );
}

export function RevealVectorRule({ t }: StepCtx) {
  return (
    <Svg label="a vector with one entry per process, bumped on its own events and merged by element-wise maximum on receipt; one vector dominates another exactly when it happened before it" h={200}>
      <Row y={70} label="bump own entry" value="on every event" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="merge by maximum" value="on receipt" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function RevealDynamoExample({ t }: StepCtx) {
  return (
    <Svg label="one coordinator writes the first two versions, two others each branch from the second concurrently, and a reconciling write dominates both branches" h={200}>
      <Row y={70} label="two branches" value="from one ancestor" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="the reconciling write" value="dominates both" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function RevealVersionVector({ t }: StepCtx) {
  return (
    <Svg label="a vector clock tracks events at processes; a version vector tracks versions of one data item at replicas, with the identical comparison rule — the form stores actually use" h={200}>
      <Row y={70} label="vector clock" value="events, at processes" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="version vector" value="versions, at replicas" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function RevealSiblings({ t }: StepCtx) {
  return (
    <Svg label="concurrent versions are kept as siblings for the application to merge; a client that never merges lets them multiply, and the vector grows with every new coordinator" h={200}>
      <Row y={70} label="concurrent versions" value="kept as siblings" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="never merged" value="siblings pile up" valueColor={C.cherryText} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function RevealDot({ t }: StepCtx) {
  return (
    <Svg label="two writes through the same coordinator can produce an identical plain vector and appear to merge; a dot, one event identifier per write, tells them apart and bounds sibling growth" h={200}>
      <Row y={70} label="same coordinator, twice" value="identical vector" valueColor={C.cherryText} o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="a dot" value="tells them apart" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function Recap({ t }: StepCtx) {
  return (
    <Svg label="a vector detects concurrency exactly; the Dynamo trace shows the full mechanism; siblings are the honest alternative to guessing, and a dot bounds their growth; truncation trades exactness away deliberately" h={260}>
      <Row y={50} label="a vector" value="detects concurrency exactly" o={easeOut(seg(t, 0, 0.3))} />
      <Row y={100} label="siblings" value="honest, not a failure" o={easeOut(seg(t, 0.2, 0.5))} />
      <Row y={150} label="a dot" value="bounds their growth" valueColor={C.focus} o={easeOut(seg(t, 0.4, 0.7))} />
      <Row y={200} label="truncation" value="trades exactness away" valueColor={C.cherryText} o={easeOut(seg(t, 0.6, 0.95))} />
    </Svg>
  );
}

export function ProveIt({ t }: StepCtx) {
  return (
    <Svg label="a store truncates vectors past a fixed size — can that ever make a genuinely ordered pair of versions look concurrent?" h={200}>
      <Row y={70} label="truncation" value="drops old entries" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="can an ordered pair" value="look concurrent after?" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}
