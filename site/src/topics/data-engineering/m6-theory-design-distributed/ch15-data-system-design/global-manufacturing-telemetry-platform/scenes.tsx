import { C, Svg, T } from '../../../../../reels/kit';
import { easeOut, seg } from '../../../../../reels/anim';
import type { StepCtx } from '../../../../../reels/types';

/** A label-left / value-right row (DESIGN.md, phone text scaling). Keep each
 * side to 1-3 words: longer pairs overlap on phone widths. */
function Row({ y, label, value, valueColor = C.crema, o = 1 }: { y: number; label: string; value: string; valueColor?: string; o?: number }) {
  return (
    <g opacity={o}>
      <T x={25} y={y} s={15} f={C.latte}>
        {label}
      </T>
      <T x={575} y={y} s={16} f={valueColor} a="end" w={600}>
        {value}
      </T>
    </g>
  );
}

export function Hook({ t }: StepCtx) {
  return (
    <Svg label="a WAN outage blanks the plants, then the flood" h={270}>
      <T x={300} y={50} s={14} f={C.taupe} a="middle" o={easeOut(seg(t, 0, 0.5))}>
        a cloud-only streaming pipeline
      </T>
      <T x={300} y={90} s={17} f={C.crema} a="middle" w={600} serif italic o={easeOut(seg(t, 0.15, 0.6))}>
        goes dark the moment the link does
      </T>
      <Row y={150} label="the outage" value="dashboards go dark" o={easeOut(seg(t, 0.35, 0.65))} />
      <Row y={195} label="on reconnect" value="the backlog floods" valueColor={C.focus} o={easeOut(seg(t, 0.5, 0.8))} />
      <Row y={240} label="the afternoon" value="stays stale anyway" o={easeOut(seg(t, 0.65, 1))} />
    </Svg>
  );
}

export function Predict1({ t }: StepCtx) {
  return (
    <Svg label="which two decisions would have kept the plants running?" h={210}>
      <Row y={75} label="a bigger link" value="doesn't help down" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={150} label="local autonomy" value="plus a throttle" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function RevealCapacityEstimate({ t }: StepCtx) {
  return (
    <Svg label="rate, peak, bytes, a year — one reference point for compression" h={240}>
      <Row y={55} label="per-plant rate" value="sums to total" o={easeOut(seg(t, 0, 0.3))} />
      <Row y={105} label="shift change" value="the real peak" valueColor={C.focus} o={easeOut(seg(t, 0.15, 0.45))} />
      <Row y={155} label="compression" value="a cited reference" o={easeOut(seg(t, 0.35, 0.65))} />
    </Svg>
  );
}

export function RevealBufferSizing({ t }: StepCtx) {
  return (
    <Svg label="outage length times rate, held durably at the edge" h={210}>
      <Row y={75} label="outage length" value="hours, not minutes" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={150} label="the buffer" value="length times rate" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function RevealProtocolDelivery({ t }: StepCtx) {
  return (
    <Svg label="a delivery level per signal, one durable log for all" h={210}>
      <Row y={75} label="a safety alarm" value="exactly once" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={150} label="a routine reading" value="at most once" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function RevealHotVsLakehouse({ t }: StepCtx) {
  return (
    <Svg label="recent and fast, historical and cheap, a join priced two ways" h={240}>
      <Row y={45} label="hot store" value="seconds, operators" o={easeOut(seg(t, 0, 0.3))} />
      <Row y={95} label="lakehouse" value="years, analysts" o={easeOut(seg(t, 0.15, 0.45))} />
      <Row y={145} label="cardinality" value="its own limit" valueColor={C.focus} o={easeOut(seg(t, 0.35, 0.65))} />
      <Row y={195} label="asset context" value="early or late" o={easeOut(seg(t, 0.5, 0.8))} />
    </Svg>
  );
}

export function RevealPlantAutonomy({ t }: StepCtx) {
  return (
    <Svg label="local broker, local store, local alarms, and data that stays put" h={240}>
      <Row y={55} label="a safety alarm" value="a tight bound" valueColor={C.focus} o={easeOut(seg(t, 0, 0.3))} />
      <Row y={105} label="a quality metric" value="a looser one" o={easeOut(seg(t, 0.15, 0.45))} />
      <Row y={155} label="some sites" value="data stays local" o={easeOut(seg(t, 0.35, 0.65))} />
    </Svg>
  );
}

export function RevealThrottledCatchUp({ t }: StepCtx) {
  return (
    <Svg label="the backlog replays, capped, through the same idempotent ingest" h={210}>
      <Row y={75} label="no throttle" value="a damaging spike" valueColor={C.focus} o={easeOut(seg(t, 0, 0.5))} />
      <Row y={150} label="throttled" value="a boring replay" o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function Recap({ t }: StepCtx) {
  return (
    <Svg label="an estimate, a buffer, a delivery choice, autonomy, a throttle" h={290}>
      <Row y={45} label="estimate" value="rate, bytes, year" o={easeOut(seg(t, 0, 0.3))} />
      <Row y={100} label="buffer" value="sized by outage" o={easeOut(seg(t, 0.15, 0.45))} />
      <Row y={155} label="autonomy" value="a degraded mode" valueColor={C.focus} o={easeOut(seg(t, 0.35, 0.65))} />
      <Row y={210} label="catch-up" value="throttled, boring" o={easeOut(seg(t, 0.55, 0.85))} />
    </Svg>
  );
}

export function ProveIt({ t }: StepCtx) {
  return (
    <Svg label="ten times the sensors; what actually moves?" h={250}>
      <Row y={65} label="the WAN link" value="still buffers fine" o={easeOut(seg(t, 0, 0.4))} />
      <Row y={140} label="cardinality" value="the real bottleneck" valueColor={C.focus} o={easeOut(seg(t, 0.3, 0.7))} />
      <Row y={215} label="series count" value="climbs tenfold" o={easeOut(seg(t, 0.55, 1))} />
    </Svg>
  );
}
