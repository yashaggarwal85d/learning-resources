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
    <Svg label="two doctors, one rule, two clean commits. Zero doctors left on call." h={200}>
      <Row y={70} label="doctor one commits" value="no error" o={easeOut(seg(t, 0, 0.6))} />
      <Row y={130} label="doctor two commits" value="no error — zero on call" valueColor={C.focus} o={easeOut(seg(t, 0.4, 1))} />
    </Svg>
  );
}

export function RevealSnapshotMechanism({ t }: StepCtx) {
  return (
    <Svg label="one fixed snapshot per transaction, taken at its own start." h={200}>
      <Row y={70} label="every read" value="from one fixed snapshot" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="on commit" value="fails if a touched row changed" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function PredictTwoDoctorsOneRule({ t }: StepCtx) {
  return (
    <Svg label="one row, caught. Two different rows, caught too?" h={200}>
      <Row y={70} label="same row, two writers" value="caught" />
      <Row y={130} label="two rows, one shared rule" value="not yet revealed" valueColor={C.focus} />
    </Svg>
  );
}

export function RevealPreventsReadSkew({ t }: StepCtx) {
  return (
    <Svg label="topic 11's own scenario, rerun with a real snapshot." h={200}>
      <Row y={70} label="T1 reads x" value="50" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="T1 rereads y, same snapshot" value="50" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function RevealCatchesWriteWriteConflict({ t }: StepCtx) {
  return (
    <Svg label="same row, same snapshot, both try to write." h={200}>
      <Row y={70} label="T1 commits" value="110" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="T2's own write" value="serialization failure" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function RevealWriteSkewSurvives({ t }: StepCtx) {
  return (
    <Svg label="the hook's own doctors, reproduced for real." h={200}>
      <Row y={70} label="both doctors read" value="on-call count: 2" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="both commit, own row" value="on-call count: 0" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function RevealVendorNamingTraps({ t }: StepCtx) {
  return (
    <Svg label="three vendors, three names for the same mechanism." h={260}>
      <Row y={50} label="Postgres Repeatable Read" value="is SI" o={easeOut(seg(t, 0, 0.3))} />
      <Row y={95} label="Oracle Serializable" value="is SI" o={easeOut(seg(t, 0.15, 0.45))} />
      <Row y={140} label="MySQL Repeatable Read" value="mixes two read kinds" valueColor={C.focus} o={easeOut(seg(t, 0.35, 0.7))} />
    </Svg>
  );
}

export function PredictFixWithoutChangingLevels({ t }: StepCtx) {
  return (
    <Svg label="same isolation level. Any fix at all, without raising it?" h={200}>
      <Row y={70} label="same two transactions" value="same isolation level" />
      <Row y={130} label="any fix at all" value="not yet revealed" valueColor={C.focus} />
    </Svg>
  );
}

export function RevealMaterializingConflict({ t }: StepCtx) {
  return (
    <Svg label="a real lock on a shared row, for this one case." h={200}>
      <Row y={70} label="lock a shared row" value="this case: closed" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="a different query, same rule" value="open again" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function Recap({ t }: StepCtx) {
  return (
    <Svg label="one mechanism, two anomalies prevented, one that survives." h={260}>
      <Row y={50} label="one mechanism" value="snapshot, first wins" o={easeOut(seg(t, 0, 0.3))} />
      <Row y={95} label="read skew, lost update" value="prevented" o={easeOut(seg(t, 0.15, 0.45))} />
      <Row y={140} label="write skew" value="survives" valueColor={C.focus} o={easeOut(seg(t, 0.35, 0.7))} />
    </Svg>
  );
}

export function ProveIt({ t }: StepCtx) {
  return (
    <Svg label="shared read, separate writes, no error from either commit." h={200}>
      <Row y={70} label="shared read, separate writes" value="no error" o={easeOut(seg(t, 0, 0.4))} />
      <Row y={130} label="which of the three" value="not yet revealed" valueColor={C.focus} o={easeOut(seg(t, 0.25, 0.65))} />
    </Svg>
  );
}
