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
    <Svg label="deleted everywhere, readable in three places." h={200}>
      <Row y={70} label="every query" value="row is gone" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="table, topic, backup" value="not yet revealed" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function Predict({ t }: StepCtx) {
  return (
    <Svg label="one fix, or three different ones?" h={260}>
      <Row y={50} label="table" value="covered?" o={easeOut(seg(t, 0, 0.3))} />
      <Row y={95} label="topic" value="covered?" o={easeOut(seg(t, 0.15, 0.45))} />
      <Row y={140} label="backup" value="not yet revealed" valueColor={C.focus} o={easeOut(seg(t, 0.35, 0.7))} />
    </Svg>
  );
}

export function RevealSnapshotNotErasure({ t }: StepCtx) {
  return (
    <Svg label="a new snapshot, leaving the row out." h={200}>
      <Row y={70} label="delete" value="writes a snapshot" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="old snapshot" value="still on disk" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function RevealMergeOnRead({ t }: StepCtx) {
  return (
    <Svg label="marked removed, bytes untouched." h={200}>
      <Row y={70} label="delete file" value="marks row gone" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="the bytes" value="stay, until rewritten" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function RevealMaintenanceOps({ t }: StepCtx) {
  return (
    <Svg label="expire, vacuum, remove orphans." h={260}>
      <Row y={50} label="expire snapshots" value="frees old files" o={easeOut(seg(t, 0, 0.3))} />
      <Row y={95} label="vacuum" value="removes unreferenced ones" o={easeOut(seg(t, 0.15, 0.45))} />
      <Row y={140} label="shorten the window" value="breaks readers" valueColor={C.focus} o={easeOut(seg(t, 0.35, 0.7))} />
    </Svg>
  );
}

export function RevealSurvivalPoints({ t }: StepCtx) {
  return (
    <Svg label="outside every table operation." h={260}>
      <Row y={50} label="replica" value="a separate copy" o={easeOut(seg(t, 0, 0.3))} />
      <Row y={95} label="backup" value="taken, untouched since" o={easeOut(seg(t, 0.15, 0.45))} />
      <Row y={140} label="Kafka topic" value="waits on retention" valueColor={C.focus} o={easeOut(seg(t, 0.35, 0.7))} />
    </Svg>
  );
}

export function RevealCryptoShredding({ t }: StepCtx) {
  return (
    <Svg label="one key, three copies, unreadable at once." h={260}>
      <Row y={50} label="one key" value="per subject" o={easeOut(seg(t, 0, 0.3))} />
      <Row y={95} label="delete the key" value="once" o={easeOut(seg(t, 0.15, 0.45))} />
      <Row y={140} label="table, topic, backup" value="all unreadable" valueColor={C.focus} o={easeOut(seg(t, 0.35, 0.7))} />
    </Svg>
  );
}

export function RevealShredCost({ t }: StepCtx) {
  return (
    <Svg label="a key per subject, and its limit." h={260}>
      <Row y={50} label="key to store" value="per subject" o={easeOut(seg(t, 0, 0.3))} />
      <Row y={95} label="a lookup" value="on every read" o={easeOut(seg(t, 0.15, 0.45))} />
      <Row y={140} label="untouched plaintext" value="still readable" valueColor={C.focus} o={easeOut(seg(t, 0.35, 0.7))} />
    </Svg>
  );
}

export function RevealProvingErasure({ t }: StepCtx) {
  return (
    <Svg label="metadata, not a memory of a command." h={200}>
      <Row y={70} label="table metadata" value="no active snapshot" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="key store record" value="its own timestamp" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function RevealPolicyAsCode({ t }: StepCtx) {
  return (
    <Svg label="the policy, written down." h={200}>
      <Row y={70} label="windows, choices" value="version-controlled" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="not" value="a fresh call" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function Recap({ t }: StepCtx) {
  return (
    <Svg label="hidden, then freed; outside the table; one key." h={260}>
      <Row y={50} label="delete" value="a snapshot only" o={easeOut(seg(t, 0, 0.3))} />
      <Row y={95} label="replica, backup, topic" value="all outside it" o={easeOut(seg(t, 0.15, 0.45))} />
      <Row y={140} label="one key" value="proof, in metadata" valueColor={C.focus} o={easeOut(seg(t, 0.35, 0.7))} />
    </Svg>
  );
}

export function ProveIt({ t }: StepCtx) {
  return (
    <Svg label="key shredded, row never deleted." h={200}>
      <Row y={70} label="table delete" value="never ran" o={easeOut(seg(t, 0, 0.4))} />
      <Row y={130} label="the query now" value="not yet revealed" valueColor={C.focus} o={easeOut(seg(t, 0.25, 0.65))} />
    </Svg>
  );
}
