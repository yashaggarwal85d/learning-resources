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
    <Svg label="the same crash timeline from the last topic, with the rejection now intercepting the retry before it lands" h={200}>
      <Row y={70} label="idempotence off" value="duplicate lands" valueColor={C.focus} o={easeOut(seg(t, 0, 0.6))} />
      <Row y={130} label="idempotence on" value="rejected, logged" o={easeOut(seg(t, 0.4, 1))} />
    </Svg>
  );
}

export function Setup({ t }: StepCtx) {
  return (
    <Svg label="a producer stamping each batch with an id/epoch/sequence triple; a broker holding a last-seen table" h={200}>
      <Row y={70} label="producer" value="stamps each batch" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="broker" value="tracks last sequence" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function PredictDuplicate({}: StepCtx) {
  return (
    <Svg label="the exact same batch, same sequence number, arrives a second time — can the broker tell?" h={200}>
      <Row y={70} label="first batch" value="sequence two" />
      <Row y={130} label="resent batch" value="sequence two" valueColor={C.focus} />
    </Svg>
  );
}

export function RevealDuplicate({ t }: StepCtx) {
  return (
    <Svg label="the broker rejects anything that isn't exactly one greater than what it last accepted" h={200}>
      <Row y={70} label="expected next" value="one higher" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="resent batch" value="bounced off" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function PredictCrossPartition({}: StepCtx) {
  return (
    <Svg label="the same sequence number, sent to a different partition — does the same rule reject it too?" h={200}>
      <Row y={70} label="partition one" value="sequence zero" />
      <Row y={130} label="partition two" value="sequence zero too" valueColor={C.focus} />
    </Svg>
  );
}

export function RevealCrossPartition({ t }: StepCtx) {
  return (
    <Svg label="each partition keeps its own independent counter, so the same number elsewhere is a fresh, valid write" h={200}>
      <Row y={70} label="partition one" value="accepted" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="partition two" value="also accepted" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function RevealZombieFencing({ t }: StepCtx) {
  return (
    <Svg label="a producer restarts, gets a new session id, and a late write from the old one is fenced off" h={200}>
      <Row y={70} label="new session" value="accepted" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="stale session write" value="fenced off" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function RevealScope({ t }: StepCtx) {
  return (
    <Svg label="one producer session, one partition — nothing wider is covered without more work" h={200}>
      <Row y={70} label="covered" value="one session only" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="not covered" value="two producers" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function ProveIt({ t }: StepCtx) {
  return (
    <Svg label="this topic's own real run, every number read straight off it" h={260}>
      <Row y={50} label="replayed duplicate" value="rejected" o={easeOut(seg(t, 0, 0.3))} />
      <Row y={95} label="cross-partition write" value="accepted" o={easeOut(seg(t, 0.1, 0.4))} />
      <Row y={140} label="zombie session write" value="fenced off" valueColor={C.focus} o={easeOut(seg(t, 0.25, 0.6))} />
    </Svg>
  );
}

export function Recap({ t }: StepCtx) {
  return (
    <Svg label="an id, a session marker, and a per-lane counter — exactly scoped, nothing wider assumed" h={260}>
      <Row y={50} label="producer id" value="who's writing" o={easeOut(seg(t, 0, 0.3))} />
      <Row y={95} label="epoch" value="which session" o={easeOut(seg(t, 0.1, 0.4))} />
      <Row y={140} label="sequence number" value="duplicate check" valueColor={C.focus} o={easeOut(seg(t, 0.25, 0.6))} />
    </Svg>
  );
}
