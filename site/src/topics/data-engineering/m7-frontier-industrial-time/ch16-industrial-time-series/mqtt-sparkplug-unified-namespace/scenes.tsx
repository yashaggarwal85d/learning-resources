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
    <Svg label="an edge node loses power mid-shift, the dashboard keeps showing the same stale reading for twenty minutes, then the node comes back and every metric is recorded twice" h={200}>
      <Row y={70} label="edge node" value="power lost" valueColor={C.badText} o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="dashboard" value="stale reading, 20 min" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function PredictFields({ t }: StepCtx) {
  return (
    <Svg label="the dashboard trusted a dead node for twenty minutes — what two Sparkplug fields tell a consumer that the node died, and that this is a restart rather than a duplicate?" h={200}>
      <Row y={70} label="dead node trusted" value="for 20 minutes" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="which two fields?" value="Will, bdSeq + seq" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function RevealQos({ t }: StepCtx) {
  return (
    <Svg label="killing a real connection to a real Mosquitto broker mid-stream — QoS 0 loses messages with zero duplicates, QoS 1 loses nothing but redelivers one unacknowledged message" h={200}>
      <Row y={70} label="QoS 0" value="lost, 0 duplicates" valueColor={C.badText} o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="QoS 1" value="0 lost, 1 duplicate" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function RevealRetainedWill({ t }: StepCtx) {
  return (
    <Svg label="a retained message is the broker's own stored last value, handed to anyone who asks; the Will is the death certificate the broker publishes only on an ungraceful disconnect" h={200}>
      <Row y={70} label="retained" value="broker's last value" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="Will" value="death certificate" valueColor={C.badText} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function RevealSparkplug({ t }: StepCtx) {
  return (
    <Svg label="NBIRTH includes every metric the node will ever report, sequence 0, and a bdSeq; NDATA's sequence number increments by one and wraps from 255 back to 0" h={260}>
      <Row y={50} label="NBIRTH" value="every metric, seq 0" o={easeOut(seg(t, 0, 0.3))} />
      <Row y={95} label="bdSeq" value="correlates birth, death" valueColor={C.second} o={easeOut(seg(t, 0.2, 0.5))} />
      <Row y={140} label="NDATA" value="seq +1, wraps 255→0" valueColor={C.focus} o={easeOut(seg(t, 0.4, 0.7))} />
    </Svg>
  );
}

export function RevealGap({ t }: StepCtx) {
  return (
    <Svg label="a host watching the sequence stream 0, 1, 2, 3, _, 5 detects the gap at 4 and asks for a rebirth; an unbroken stream raises nothing" h={200}>
      <Row y={70} label="seq stream" value="0, 1, 2, 3, _, 5" valueColor={C.badText} o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="gap at 4" value="rebirth requested" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function RevealUns({ t }: StepCtx) {
  return (
    <Svg label="one broker's topic tree mirrors the equipment hierarchy — every system publishes its state to one place, every consumer reads it from one place" h={200}>
      <Row y={70} label="topic tree" value="mirrors hierarchy" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="every system" value="one place, one hub" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function RevealLimits({ t }: StepCtx) {
  return (
    <Svg label="a UNS node's retained value is the current state and nothing before it — no history, no replay, so a durable log has to sit behind the broker" h={200}>
      <Row y={70} label="retained value" value="current state only" valueColor={C.badText} o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="history, replay" value="needs a log behind it" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function Recap({ t }: StepCtx) {
  return (
    <Svg label="QoS's three delivery guarantees, a retained value and a Will that explain the dead-node dashboard, a real Sparkplug birth/death cycle with sequence numbers, and a broker that needs a log behind it for anything but the present" h={260}>
      <Row y={50} label="QoS 0/1/2" value="three guarantees" o={easeOut(seg(t, 0, 0.3))} />
      <Row y={95} label="retained, Will" value="explain the dashboard" valueColor={C.second} o={easeOut(seg(t, 0.15, 0.45))} />
      <Row y={140} label="NBIRTH, bdSeq, seq" value="birth, death, rebirth" valueColor={C.focus} o={easeOut(seg(t, 0.35, 0.65))} />
      <Row y={185} label="broker alone" value="needs a log behind it" o={easeOut(seg(t, 0.55, 0.85))} />
    </Svg>
  );
}

export function ProveIt({ t }: StepCtx) {
  return (
    <Svg label="a consumer joins right after a ten-minute outage, with only the retained values and no durable log behind the broker — can it recover what it missed during the outage?" h={200}>
      <Row y={70} label="joins after outage" value="only retained values" o={easeOut(seg(t, 0, 0.4))} />
      <Row y={130} label="outage window" value="unrecoverable" valueColor={C.badText} o={easeOut(seg(t, 0.25, 0.65))} />
    </Svg>
  );
}
