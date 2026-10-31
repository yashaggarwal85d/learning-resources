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
    <Svg label="a real toy leader crash — records one acknowledgement choice believed were safe, against records the other choice believed were safe" h={200}>
      <Row y={70} label="leader-only ack" value="mostly lost" o={easeOut(seg(t, 0, 0.6))} />
      <Row y={130} label="full in-sync ack" value="none lost" valueColor={C.focus} o={easeOut(seg(t, 0.4, 1))} />
    </Svg>
  );
}

export function Setup({ t }: StepCtx) {
  return (
    <Svg label="a leader and its followers, each at a different position on a shared ruler" h={200}>
      <Row y={70} label="leader" value="furthest along" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="followers" value="trailing behind" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function PredictHW({}: StepCtx) {
  return (
    <Svg label="the leader furthest along the ruler, followers trailing — which position is the committed one?" h={200}>
      <Row y={70} label="leader's tick" value="furthest along" />
      <Row y={130} label="committed position" value="which one?" valueColor={C.focus} />
    </Svg>
  );
}

export function RevealHW({ t }: StepCtx) {
  return (
    <Svg label="the leader's own tick, each follower's tick, and the line sitting at the slowest one" h={260}>
      <Row y={50} label="leader" value="two hundred" o={easeOut(seg(t, 0, 0.3))} />
      <Row y={95} label="fast follower" value="one eighty" o={easeOut(seg(t, 0.15, 0.5))} />
      <Row y={140} label="slow follower" value="one fifty" valueColor={C.focus} o={easeOut(seg(t, 0.3, 0.65))} />
      <Row y={185} label="committed line" value="one fifty" valueColor={C.focus} o={easeOut(seg(t, 0.5, 0.9))} />
    </Svg>
  );
}

export function PredictTruncation({}: StepCtx) {
  return (
    <Svg label="a restarted follower holding more than its own recorded line says is safe — trust the line, or ask for something else?" h={200}>
      <Row y={70} label="follower's log" value="two messages" />
      <Row y={130} label="recorded line" value="says far less" valueColor={C.focus} />
    </Svg>
  );
}

export function RevealTruncation({ t }: StepCtx) {
  return (
    <Svg label="the same two-message log, truncated two ways — one drops the second message, one keeps it" h={200}>
      <Row y={70} label="recorded-line cut" value="message dropped" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="epoch-marker cut" value="message kept" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function PredictLastStanding({}: StepCtx) {
  return (
    <Svg label="only one replica left in sync — does it keep accepting writes meant to wait for every in-sync replica?" h={200}>
      <Row y={70} label="in-sync set" value="down to one" />
      <Row y={130} label="full-ack writes" value="still accepted?" valueColor={C.focus} />
    </Svg>
  );
}

export function RevealLastStanding({ t }: StepCtx) {
  return (
    <Svg label="writes made while the in-sync set is shrunk, later lost, under two different rules for moving the line" h={200}>
      <Row y={70} label="not-empty rule" value="writes lost" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="minimum-checked rule" value="none lost" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function ProveIt({ t }: StepCtx) {
  return (
    <Svg label="every number from this reel, read straight off the real run of examples.py just now" h={260}>
      <Row y={50} label="committed line" value="one fifty" o={easeOut(seg(t, 0, 0.3))} />
      <Row y={95} label="recorded-line cut" value="message dropped" o={easeOut(seg(t, 0.1, 0.4))} />
      <Row y={140} label="epoch-marker cut" value="message kept" valueColor={C.focus} o={easeOut(seg(t, 0.25, 0.6))} />
      <Row y={185} label="shrink-window loss" value="some vs none" o={easeOut(seg(t, 0.5, 0.85))} />
    </Svg>
  );
}

export function Recap({ t }: StepCtx) {
  return (
    <Svg label="a replica column racing toward a line that only moves at the slowest in-sync pace, a truncation marker, and a checked minimum" h={260}>
      <Row y={50} label="committed line" value="slowest replica" o={easeOut(seg(t, 0, 0.3))} />
      <Row y={95} label="truncation" value="epoch marker" o={easeOut(seg(t, 0.1, 0.4))} />
      <Row y={140} label="in-sync minimum" value="checked, not assumed" valueColor={C.focus} o={easeOut(seg(t, 0.25, 0.6))} />
    </Svg>
  );
}
