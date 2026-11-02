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
    <Svg label="a line's performance total looks solid on its own, but one of its machines moved to another line partway through the window — which total is real?" h={200}>
      <Row y={70} label="quarterly total" value="looks solid" o={easeOut(seg(t, 0, 0.6))} />
      <Row y={130} label="one machine" value="moved mid-quarter" valueColor={C.focus} o={easeOut(seg(t, 0.4, 1))} />
    </Svg>
  );
}

export function RevealLevels({ t }: StepCtx) {
  const rows = [
    { label: 'level four', value: 'business, weeks' },
    { label: 'level three', value: 'operations, hours' },
    { label: 'level two', value: 'control, seconds' },
    { label: 'level one', value: 'sensing, millis' },
    { label: 'level zero', value: 'the process itself' },
  ];
  return (
    <Svg label="five levels, from the physical process to business planning, split by how fast each one has to react rather than by which department owns it" h={280}>
      {rows.map((r, i) => (
        <Row key={r.label} y={40 + i * 48} label={r.label} value={r.value} valueColor={i === 4 ? C.focus : C.crema} o={easeOut(seg(t, i * 0.18, i * 0.18 + 0.5))} />
      ))}
    </Svg>
  );
}

export function RevealScadaTrap({ t }: StepCtx) {
  return (
    <Svg label="the standard's own page and common practitioner diagrams disagree about which level houses supervisory control and data acquisition — what survives the disagreement?" h={220}>
      <Row y={55} label="the standard" value="SCADA at level three" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={110} label="many diagrams" value="SCADA at level two" valueColor={C.second} o={easeOut(seg(t, 0.3, 0.8))} />
      <Row y={170} label="what survives" value="time horizon, not the box" valueColor={C.focus} o={easeOut(seg(t, 0.6, 1))} />
    </Svg>
  );
}

export function PredictCurrentTable({ t }: StepCtx) {
  return (
    <Svg label="a perfectly up-to-date hierarchy table says where every machine sits right now — does looking a machine up in it correctly answer a question about last quarter?" h={200}>
      <Row y={70} label="hierarchy, right now" value="perfectly current" />
      <Row y={130} label="last quarter's question" value="answered right?" valueColor={C.focus} />
    </Svg>
  );
}

export function RevealScdRows({ t }: StepCtx) {
  return (
    <Svg label="one physical press gets two separate hierarchy rows across its move, each with its own validity window and its own surrogate key" h={220}>
      <Row y={55} label="press7, key one" value="line L4, before" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={110} label="press7, key two" value="line L6, after" valueColor={C.second} o={easeOut(seg(t, 0.3, 0.8))} />
      <Row y={170} label="the move" value="a new row" valueColor={C.focus} o={easeOut(seg(t, 0.6, 1))} />
    </Svg>
  );
}

export function RevealJoinBug({ t }: StepCtx) {
  return (
    <Svg label="the identical stream of readings, joined by event time against joined to the machine's latest row — the two totals for each line come out measurably different" h={260}>
      <Row y={40} label="line L4, by event time" value="the true total" o={easeOut(seg(t, 0, 0.4))} />
      <Row y={90} label="line L4, by latest row" value="understated" valueColor={C.badText} o={easeOut(seg(t, 0.2, 0.6))} />
      <Row y={150} label="line L6, by event time" value="the true total" o={easeOut(seg(t, 0.35, 0.75))} />
      <Row y={200} label="line L6, by latest row" value="overstated to match" valueColor={C.badText} o={easeOut(seg(t, 0.55, 1))} />
    </Svg>
  );
}

export function RevealDurableKey({ t }: StepCtx) {
  return (
    <Svg label="the machine's own identifier is identical across both hierarchy rows — what actually tells the join which row answers for which reading?" h={220}>
      <Row y={55} label="equipment_id" value="identical, either row" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={110} label="surrogate key" value="different per row" valueColor={C.second} o={easeOut(seg(t, 0.3, 0.8))} />
      <Row y={170} label="the validity window" value="what the join needs" valueColor={C.focus} o={easeOut(seg(t, 0.6, 1))} />
    </Svg>
  );
}

export function Recap({ t }: StepCtx) {
  return (
    <Svg label="five levels by time horizon, the SCADA disagreement resolved, a versioned hierarchy, and a measured join bug that moves output between lines without touching a reading" h={260}>
      <Row y={50} label="five levels" value="by time horizon" o={easeOut(seg(t, 0, 0.3))} />
      <Row y={95} label="SCADA's level" value="resolved" o={easeOut(seg(t, 0.1, 0.4))} />
      <Row y={140} label="the hierarchy" value="versions on every move" valueColor={C.focus} o={easeOut(seg(t, 0.25, 0.6))} />
      <Row y={185} label="the join bug" value="moves real output" o={easeOut(seg(t, 0.5, 0.85))} />
    </Svg>
  );
}

export function ProveIt({ t }: StepCtx) {
  return (
    <Svg label="a dashboard caches each machine's current line once a day and joins every incoming reading to that cache — is an older reading guaranteed to land on the right line?" h={220}>
      <Row y={55} label="a daily cache" value="refreshed once a day" o={easeOut(seg(t, 0, 0.4))} />
      <Row y={110} label="an older reading" value="feels close enough" valueColor={C.focus} o={easeOut(seg(t, 0.25, 0.65))} />
      <Row y={165} label="the only safe join" value="carries its own time" valueColor={C.focus} o={easeOut(seg(t, 0.55, 1))} />
    </Svg>
  );
}
