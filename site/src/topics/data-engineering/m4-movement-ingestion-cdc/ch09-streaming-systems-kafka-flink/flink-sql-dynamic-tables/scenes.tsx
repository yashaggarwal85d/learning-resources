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
    <Svg label="a stream is secretly a table the whole time — what if sql saw it that way?" h={200}>
      <Row y={70} label="a stream" value="already a table" o={easeOut(seg(t, 0, 0.6))} />
      <Row y={130} label="what if sql" value="just saw it" valueColor={C.focus} o={easeOut(seg(t, 0.4, 1))} />
    </Svg>
  );
}

export function Setup({ t }: StepCtx) {
  return (
    <Svg label="operators and state so far, underneath any particular api" h={200}>
      <Row y={70} label="so far" value="operators, state" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="this topic" value="the sql layer" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function PredictChangelogModes({}: StepCtx) {
  return (
    <Svg label="a stream of inserts and updates is read as a table — encoded how?" h={200}>
      <Row y={70} label="inserts, updates" value="now a table" />
      <Row y={130} label="a change" value="encoded how?" valueColor={C.focus} />
    </Svg>
  );
}

export function RevealThreeModes({ t }: StepCtx) {
  return (
    <Svg label="append, upsert, retract — three ways to encode the same changing table" h={200}>
      <Row y={70} label="append" value="insert only" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="upsert, retract" value="replace, or pair" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function RevealUpsertVsRetract({ t }: StepCtx) {
  return (
    <Svg label="the same final table, but retract pays double the messages for an update" h={200}>
      <Row y={70} label="upsert" value="needs a key" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="retract" value="costs more, always" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function RevealRegularJoinState({ t }: StepCtx) {
  return (
    <Svg label="any future row on either side could still match — state never shrinks" h={200}>
      <Row y={70} label="a regular join" value="keeps everything" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="forever" value="state only grows" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function PredictBoundedJoinState({}: StepCtx) {
  return (
    <Svg label="a join only matches rows close in time — what happens to its state?" h={200}>
      <Row y={70} label="only rows" value="close in time" />
      <Row y={130} label="the join's state" value="does what?" valueColor={C.focus} />
    </Svg>
  );
}

export function RevealIntervalTemporal({ t }: StepCtx) {
  return (
    <Svg label="a window bounds one; a versioned match needs no window at all" h={200}>
      <Row y={70} label="interval join" value="bounded window" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="temporal join" value="matches a version" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function RevealLookupDelta({ t }: StepCtx) {
  return (
    <Svg label="a lookup reaches out; a delta join reuses the source instead of state" h={200}>
      <Row y={70} label="lookup join" value="an external table" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="delta join" value="reuses the source" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function RevealMaterializedPtf({ t }: StepCtx) {
  return (
    <Svg label="freshness drives the refresh mode; a process table function is the escape hatch" h={200}>
      <Row y={70} label="freshness" value="picks the mode" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="a table function" value="the escape hatch" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function ProveIt({ t }: StepCtx) {
  return (
    <Svg label="this topic's own real run, every number read straight off it" h={260}>
      <Row y={50} label="changelog modes" value="message counts differ" o={easeOut(seg(t, 0, 0.3))} />
      <Row y={95} label="regular join" value="state climbs" o={easeOut(seg(t, 0.1, 0.4))} />
      <Row y={140} label="interval join" value="state plateaus" valueColor={C.focus} o={easeOut(seg(t, 0.25, 0.6))} />
    </Svg>
  );
}

export function Recap({ t }: StepCtx) {
  return (
    <Svg label="same table, different encodings; every join answers one question: how much state?" h={260}>
      <Row y={50} label="append, upsert" value="same table, differently" o={easeOut(seg(t, 0, 0.3))} />
      <Row y={95} label="every join type" value="a state trade-off" o={easeOut(seg(t, 0.1, 0.4))} />
      <Row y={140} label="tables, functions" value="sit on top" valueColor={C.focus} o={easeOut(seg(t, 0.25, 0.6))} />
    </Svg>
  );
}
