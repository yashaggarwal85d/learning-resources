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
    <Svg label="two sessions, each holding what the other wants." h={200}>
      <Row y={70} label="session one holds" value="table A, wants B" o={easeOut(seg(t, 0, 0.6))} />
      <Row y={130} label="session two holds" value="table B, wants A" valueColor={C.focus} o={easeOut(seg(t, 0.4, 1))} />
    </Svg>
  );
}

export function RevealLockModes({ t }: StepCtx) {
  return (
    <Svg label="from blocking one write, to blocking every read." h={200}>
      <Row y={70} label="a lighter mode" value="blocks a conflicting write" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="the strictest mode" value="blocks every read too" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function RevealIntentionLocks({ t }: StepCtx) {
  return (
    <Svg label="intent, marked at the table level first." h={200}>
      <Row y={70} label="before a row lock" value="an intent lock, table-level" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="checking safety" value="one flag, not every row" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function PredictFinerAlwaysBetter({ t }: StepCtx) {
  return (
    <Svg label="finest granularity, most concurrency. Always the right call?" h={200}>
      <Row y={70} label="row-level locks" value="least blocked, most tracked" />
      <Row y={130} label="always the better choice" value="not yet revealed" valueColor={C.focus} />
    </Svg>
  );
}

export function RevealDeadlockForReal({ t }: StepCtx) {
  return (
    <Svg label="the hook's own two sessions, reproduced for real." h={200}>
      <Row y={70} label="one session" value="a real deadlock error" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="the other session" value="proceeds, finally" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function RevealDetectionVsPrevention({ t }: StepCtx) {
  return (
    <Svg label="wait and check, or decide from priority first." h={200}>
      <Row y={70} label="detection" value="waits, then checks for a cycle" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="prevention" value="decides from priority, first" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function RevealConsistentOrder({ t }: StepCtx) {
  return (
    <Svg label="same contention, same order every time." h={200}>
      <Row y={70} label="same two locks" value="acquired in the same order" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="repeated, for real" value="zero deadlocks" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function RevealLockEscalation({ t }: StepCtx) {
  return (
    <Svg label="thousands of fine-grained locks, traded for one." h={200}>
      <Row y={70} label="many small locks" value="tracked, one by one" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="past a real threshold" value="traded for one table lock" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function RevealMigrationHazard({ t }: StepCtx) {
  return (
    <Svg label="the DDL lock level, held briefly. A read, blocked that whole time." h={200}>
      <Row y={70} label="the DDL lock, held briefly" value="a fraction of a second" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="a plain read, meanwhile" value="blocked, measured" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function Recap({ t }: StepCtx) {
  return (
    <Svg label="lock modes, a deadlock caught, one avoided, one hazard measured." h={260}>
      <Row y={50} label="real lock modes" value="named precisely" o={easeOut(seg(t, 0, 0.3))} />
      <Row y={95} label="a deadlock" value="caught, and avoided" o={easeOut(seg(t, 0.15, 0.45))} />
      <Row y={140} label="a DDL lock" value="stalls every read" valueColor={C.focus} o={easeOut(seg(t, 0.35, 0.7))} />
    </Svg>
  );
}

export function ProveIt({ t }: StepCtx) {
  return (
    <Svg label="an ALTER TABLE, an expensive default, a busy table." h={200}>
      <Row y={70} label="ALTER TABLE, a busy table" value="an expensive default" o={easeOut(seg(t, 0, 0.4))} />
      <Row y={130} label="what's actually at risk" value="not yet revealed" valueColor={C.focus} o={easeOut(seg(t, 0.25, 0.65))} />
    </Svg>
  );
}
