import { Bar, C, Svg, T } from '../../../../../reels/kit';
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

/** One lane's fill bar: a track that fills toward the right as it finishes its share of the work. */
function LaneBar({ y, frac, t, from, to, fill = C.crema }: { y: number; frac: number; t: number; from: number; to: number; fill?: string }) {
  const k = easeOut(seg(t, from, to));
  return <Bar x={25} y={y} w={frac * k * 500} h={10} full={500} fill={fill} />;
}

export function Hook({ t }: StepCtx) {
  return (
    <Svg label="sixteen lanes, fifteen finished. One still running at hour three, while dead tuples climb underneath." h={260}>
      {Array.from({ length: 16 }).map((_, i) => (
        <LaneBar key={i} y={20 + i * 13} frac={1} t={t} from={0} to={i === 15 ? 0.9 : 0.1 + i * 0.02} fill={i === 15 ? C.badText : C.crema} />
      ))}
      <Row y={245} label="dead tuples" value="still growing" valueColor={C.badText} o={easeOut(seg(t, 0.5, 0.9))} />
    </Svg>
  );
}

export function PredictStride({ t }: StepCtx) {
  return (
    <Svg label="the key is skewed. With sixteen equal-width partitions, which one does the real work?" h={200}>
      <Row y={70} label="numPartitions" value="sixteen, equal width" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="hardest-working partition" value="not yet revealed" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function RevealStrideNotFilter({ t }: StepCtx) {
  return (
    <Svg label="sixteen equal-width slices over the id range, with the real histogram underneath." h={240}>
      {Array.from({ length: 16 }).map((_, i) => {
        const h = i === 15 ? 180 : i === 0 ? 10 : 1;
        const k = easeOut(seg(t, i * 0.04, i * 0.04 + 0.3));
        return <Bar key={i} x={25 + i * 35} y={210 - h * k} w={28} h={h * k} full={200} fill={i === 15 ? C.focus : C.crema} />;
      })}
      <T x={300} y={230} s={13} f={C.taupe} a="middle">
        sixteen equal-width strides over the full id range
      </T>
    </Svg>
  );
}

export function RevealMeasuredSkew({ t }: StepCtx) {
  return (
    <Svg label="the real sixteen-partition count: two thousand rows, fourteen partitions at zero, forty-eight thousand in one." h={220}>
      <Row y={60} label="first partition" value="two thousand rows" o={easeOut(seg(t, 0, 0.4))} />
      <Row y={110} label="middle partitions" value="zero rows" valueColor={C.taupe} o={easeOut(seg(t, 0.15, 0.55))} />
      <Row y={160} label="last partition" value="forty-eight thousand rows" valueColor={C.focus} o={easeOut(seg(t, 0.3, 0.7))} />
    </Svg>
  );
}

export function RevealSnapshot({ t }: StepCtx) {
  return (
    <Svg label="one exported snapshot, imported by a second worker, unmoved by a concurrent insert." h={220}>
      <Row y={60} label="exporter sees" value="fifty thousand rows" o={easeOut(seg(t, 0, 0.4))} />
      <Row y={110} label="importer, same snapshot" value="unchanged" valueColor={C.focus} o={easeOut(seg(t, 0.2, 0.6))} />
      <Row y={160} label="fresh connection" value="one row more" valueColor={C.second} o={easeOut(seg(t, 0.4, 0.8))} />
    </Svg>
  );
}

export function RevealCopyVsSelect({ t }: StepCtx) {
  return (
    <Svg label="the same fifty thousand rows, two ways: row-by-row SELECT against COPY TO, best of several trials." h={200}>
      <LaneBar y={70} frac={1} t={t} from={0.1} to={0.6} fill={C.badText} />
      <T x={25} y={60} s={13} f={C.taupe}>row-by-row SELECT</T>
      <LaneBar y={130} frac={0.55} t={t} from={0.2} to={0.7} fill={C.focus} />
      <T x={25} y={120} s={13} f={C.taupe}>COPY TO</T>
    </Svg>
  );
}

export function RevealReplicaCost({ t }: StepCtx) {
  return (
    <Svg label="hot_standby_feedback stops the standby's own query from being cancelled — by holding back cleanup on the primary instead." h={220}>
      <Row y={60} label="no feedback setting" value="risks cancellation" valueColor={C.badText} o={easeOut(seg(t, 0, 0.4))} />
      <Row y={110} label="feedback setting on" value="cancellation stops" valueColor={C.focus} o={easeOut(seg(t, 0.2, 0.6))} />
      <Row y={160} label="cost moves to" value="delayed on primary" valueColor={C.second} o={easeOut(seg(t, 0.4, 0.8))} />
    </Svg>
  );
}

export function RevealVacuumMeasured({ t }: StepCtx) {
  return (
    <Svg label="a long extract's open snapshot, measured directly: VACUUM reclaims nothing while it's open." h={260}>
      <Row y={50} label="before the extract" value="zero dead tuples" o={easeOut(seg(t, 0, 0.3))} />
      <Row y={95} label="after the update" value="ten thousand dead tuples" valueColor={C.badText} o={easeOut(seg(t, 0.15, 0.45))} />
      <Row y={140} label="VACUUM, still open" value="unchanged, pinned" valueColor={C.badText} o={easeOut(seg(t, 0.3, 0.6))} />
      <Row y={185} label="commits, VACUUM again" value="reclaimed, zero" valueColor={C.focus} o={easeOut(seg(t, 0.5, 0.85))} />
    </Svg>
  );
}

export function Recap({ t }: StepCtx) {
  return (
    <Svg label="stride not filter. One shared snapshot. COPY ahead. A vacuum cost, measured." h={260}>
      <Row y={50} label="bounds" value="stride, not filter" o={easeOut(seg(t, 0, 0.3))} />
      <Row y={95} label="snapshot" value="exported, imported" o={easeOut(seg(t, 0.15, 0.45))} />
      <Row y={140} label="bulk path" value="COPY measured ahead" o={easeOut(seg(t, 0.25, 0.55))} />
      <Row y={185} label="quiet cost" value="pinned until done" valueColor={C.focus} o={easeOut(seg(t, 0.4, 0.75))} />
    </Svg>
  );
}

export function ProveIt({ t }: StepCtx) {
  return (
    <Svg label="the same skewed key, now with sixty-four partitions instead of sixteen." h={200}>
      <Row y={70} label="sixty-four partitions" value="narrower strides" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="slowest share" value="not yet revealed" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}
