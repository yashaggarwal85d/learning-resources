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
    <Svg label="the connector shows healthy all weekend; the primary's disk climbs to nearly full; the slot's own marker sat frozen the whole time." h={220}>
      <Row y={60} label="connector status" value="healthy, all weekend" valueColor={C.focus} o={easeOut(seg(t, 0, 0.4))} />
      <Row y={110} label="the slot's marker" value="never moved" valueColor={C.badText} o={easeOut(seg(t, 0.2, 0.6))} />
      <Row y={160} label="the disk" value="nearly full" valueColor={C.badText} o={easeOut(seg(t, 0.4, 0.8))} />
    </Svg>
  );
}

export function Predict({ t }: StepCtx) {
  return (
    <Svg label="that connector never crashed and never disconnected. Can a connector that looks healthy still be the reason WAL keeps growing?" h={200}>
      <Row y={70} label="the connector" value="alive and connected" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="still the cause" value="not yet revealed" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function RevealSlotIndifference({ t }: StepCtx) {
  return (
    <Svg label="a slot persists across crashes and knows nothing about its consumer; with no reader, nothing tells the server it can reclaim anything." h={200}>
      <Row y={70} label="the slot" value="knows nothing" valueColor={C.badText} o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="the server" value="can't reclaim WAL" valueColor={C.badText} o={easeOut(seg(t, 0.25, 0.65))} />
    </Svg>
  );
}

export function RevealGrowthMeasured({ t }: StepCtx) {
  return (
    <Svg label="the real run: a slot with no reader, a real write load, the retained gap read before and after." h={220}>
      <Row y={60} label="before the load" value="one retained gap" o={easeOut(seg(t, 0, 0.4))} />
      <Row y={110} label="after the load" value="a larger gap" valueColor={C.badText} o={easeOut(seg(t, 0.2, 0.6))} />
    </Svg>
  );
}

export function RevealConfirmationMatters({ t }: StepCtx) {
  return (
    <Svg label="the identical write volume, split into pieces; one consumer never confirms between pieces, the other confirms after every one." h={200}>
      <Row y={70} label="never confirms" value="the gap grows" valueColor={C.badText} o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="confirms each piece" value="stays small" valueColor={C.focus} o={easeOut(seg(t, 0.25, 0.65))} />
    </Svg>
  );
}

export function RevealConfirmationMeasured({ t }: StepCtx) {
  return (
    <Svg label="the real run: the same total volume, one slot's gap left unconfirmed, the other's gap left after confirming every piece." h={220}>
      <Row y={60} label="unconfirmed slot" value="a large gap" valueColor={C.badText} o={easeOut(seg(t, 0, 0.4))} />
      <Row y={110} label="confirming slot" value="a small gap" valueColor={C.focus} o={easeOut(seg(t, 0.2, 0.6))} />
    </Svg>
  );
}

export function RevealSafetyValveTrade({ t }: StepCtx) {
  return (
    <Svg label="a real limit set on how much WAL a slot may keep; past it, the server may remove WAL the slot still needed." h={200}>
      <Row y={70} label="the limit" value="caps retained WAL" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="past it" value="the stream breaks" valueColor={C.badText} o={easeOut(seg(t, 0.25, 0.65))} />
    </Svg>
  );
}

export function RevealLostSlotMeasured({ t }: StepCtx) {
  return (
    <Svg label="the real run: the limit set, enough writes to exceed it, the slot's own status read before and after." h={220}>
      <Row y={60} label="status, before" value="reserved" valueColor={C.focus} o={easeOut(seg(t, 0, 0.4))} />
      <Row y={110} label="status, after" value="lost" valueColor={C.badText} o={easeOut(seg(t, 0.2, 0.6))} />
    </Svg>
  );
}

export function Recap({ t }: StepCtx) {
  return (
    <Svg label="a slot pinning WAL regardless of connector health, confirmation as the only thing that moves the marker, and the valve's own trade." h={260}>
      <Row y={50} label="a stalled slot" value="pins WAL, unaware" valueColor={C.badText} o={easeOut(seg(t, 0, 0.3))} />
      <Row y={95} label="what moves it" value="a confirmed read" valueColor={C.focus} o={easeOut(seg(t, 0.15, 0.45))} />
      <Row y={140} label="the safety valve" value="saves disk" o={easeOut(seg(t, 0.25, 0.55))} />
      <Row y={185} label="at what cost" value="the stream itself" valueColor={C.badText} o={easeOut(seg(t, 0.4, 0.75))} />
    </Svg>
  );
}

export function ProveIt({ t }: StepCtx) {
  return (
    <Svg label="none of this gave a number worth alerting on before the disk was already in trouble. What should trigger the alarm?" h={200}>
      <Row y={70} label="shown so far" value="growth, then loss" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="the real alert" value="not yet revealed" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}
