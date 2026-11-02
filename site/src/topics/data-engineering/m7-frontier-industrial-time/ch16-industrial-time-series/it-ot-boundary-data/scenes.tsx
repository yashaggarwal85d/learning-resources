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
    <Svg label="an analyst polls three thousand tags once a second against a PLC; the scan time stretches and a conveyor faults, with nothing ever written to the PLC" h={200}>
      <Row y={70} label="read only" value="never writes" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="scan time" value="stretches, faults" valueColor={C.badText} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function RevealSegmentation({ t }: StepCtx) {
  return (
    <Svg label="the Purdue and ISA-95 levels drawn as zones with a DMZ band enforcing the boundary between the corporate network and the one running the floor" h={200}>
      <Row y={70} label="the floor" value="segmented, on purpose" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="every path" value="crosses a DMZ" valueColor={C.second} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function PredictReadOnly({ t }: StepCtx) {
  return (
    <Svg label="a script that never writes a value to the PLC — can a read that never writes still disturb the process it reads from?" h={200}>
      <Row y={70} label="never writes" value="safe?" />
      <Row y={130} label="load itself" value="or not?" valueColor={C.focus} />
    </Svg>
  );
}

export function RevealLoadBudget({ t }: StepCtx) {
  return (
    <Svg label="polling three thousand tags once a second against a PLC rated for five hundred requests a second is six times the budget, before a value has even changed" h={200}>
      <Row y={70} label="the poll" value="six times budget" valueColor={C.badText} o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="the PLC" value="its scan stretches" o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function RevealSubscription({ t }: StepCtx) {
  return (
    <Svg label="a change-of-value subscription over the same tag mix cuts the load sharply, and it is still over this plant's own tight budget" h={200}>
      <Row y={70} label="subscribe" value="load drops sharply" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="still over" value="the stated budget" valueColor={C.badText} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function RevealHistorianReplica({ t }: StepCtx) {
  return (
    <Svg label="the same tags read from a historian or a replica instead of the PLC — the load on the PLC drops to the full budget, untouched" h={200}>
      <Row y={70} label="read from" value="the historian" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="the PLC" value="untouched" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function RevealBuffer({ t }: StepCtx) {
  return (
    <Svg label="a bounded buffer between the extractor and a stalled consumer drops its own oldest item once full, so the producer side never stalls" h={200}>
      <Row y={70} label="buffer full" value="drops oldest" valueColor={C.second} o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="the producer" value="never stalls" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function RevealOwnership({ t }: StepCtx) {
  return (
    <Svg label="operational copies and the analytical copy each have an owner; a field's definition keeps the operational side's owner even in the analytical copy" h={220}>
      <Row y={55} label="operational" value="plant engineering" o={easeOut(seg(t, 0, 0.4))} />
      <Row y={110} label="analytical" value="the data platform" valueColor={C.second} o={easeOut(seg(t, 0.25, 0.65))} />
      <Row y={170} label="a definition" value="owner stays put" valueColor={C.focus} o={easeOut(seg(t, 0.55, 1))} />
    </Svg>
  );
}

export function RevealRename({ t }: StepCtx) {
  return (
    <Svg label="a tag renamed after a firmware re-scale: a reader keyed only on the new name misses the old readings, an alias-contract reader catches both" h={200}>
      <Row y={70} label="naive reader" value="misses old name" valueColor={C.badText} o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="alias reader" value="catches both" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function Recap({ t }: StepCtx) {
  return (
    <Svg label="a segmented floor, a load budget, a buffer protecting the producer, assigned ownership, and a rename only the naive reader did not survive" h={260}>
      <Row y={50} label="the floor" value="segmented" o={easeOut(seg(t, 0, 0.3))} />
      <Row y={95} label="a read" value="has a cost" o={easeOut(seg(t, 0.15, 0.45))} />
      <Row y={140} label="the producer" value="never blocked" valueColor={C.focus} o={easeOut(seg(t, 0.35, 0.65))} />
      <Row y={185} label="a rename" value="naive reader missed" valueColor={C.badText} o={easeOut(seg(t, 0.55, 0.85))} />
    </Svg>
  );
}

export function ProveIt({ t }: StepCtx) {
  return (
    <Svg label="a new consumer subscribes straight to the PLC's own OPC UA server for live tag values — is that the same risk as the script that polled it?" h={200}>
      <Row y={70} label="subscribe" value="to the PLC" o={easeOut(seg(t, 0, 0.4))} />
      <Row y={130} label="same budget" value="still applies" valueColor={C.focus} o={easeOut(seg(t, 0.25, 0.65))} />
    </Svg>
  );
}
