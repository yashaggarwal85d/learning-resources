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
    <Svg label="DELETE runs, the row is gone from every query. An auditor still finds the name three places." h={200}>
      <Row y={70} label="DELETE ran" value="gone from queries" o={easeOut(seg(t, 0, 0.6))} />
      <Row y={130} label="table, topic, backup" value="SQL fixes, or a key?" valueColor={C.focus} o={easeOut(seg(t, 0.4, 1))} />
    </Svg>
  );
}

export function RevealNewSnapshot({ t }: StepCtx) {
  return (
    <Svg label="a DELETE writes a new snapshot; the old one still references the old file, untouched" h={200}>
      <Row y={70} label="DELETE" value="new snapshot, new marker" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="old snapshot" value="old file, untouched" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function PredictTimeTravel({ t }: StepCtx) {
  return (
    <Svg label="time-travel to the snapshot from before the DELETE. Still shows the subject?" h={200}>
      <Row y={70} label="old snapshot" value="before the DELETE" />
      <Row y={130} label="subject visible?" value="not yet revealed" valueColor={C.focus} />
    </Svg>
  );
}

export function RevealTimeTravelShows({ t }: StepCtx) {
  return (
    <Svg label="measured: yes -- the current read hides them, the old snapshot does not" h={200}>
      <Row y={70} label="current read" value="subject hidden" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="time-travel read" value="subject returns, measured" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function ElaborateExpireCompact({ t }: StepCtx) {
  return (
    <Svg label="expiring snapshots and compacting physically removes the row" h={200}>
      <Row y={70} label="expire snapshots" value="old metadata gone" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="compact" value="file rewritten, row gone" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function PredictTombstone({ t }: StepCtx) {
  return (
    <Svg label="a Kafka tombstone removes the value. Does it remove the record a deletion happened?" h={200}>
      <Row y={70} label="tombstone written" value="value gone" />
      <Row y={130} label="deletion record itself?" value="not yet revealed" valueColor={C.focus} />
    </Svg>
  );
}

export function RevealTombstoneExpires({ t }: StepCtx) {
  return (
    <Svg label="measured: not immediately -- the tombstone itself expires after delete.retention.ms" h={200}>
      <Row y={70} label="right after" value="marker still present" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="after the window" value="marker gone too, measured" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function ElaborateLaggingConsumer({ t }: StepCtx) {
  return (
    <Svg label="a lagging consumer can miss the delete marker entirely" h={200}>
      <Row y={70} label="consumer lags" value="past the retention window" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="result" value="no trace of the deletion" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function RevealCryptoShredding({ t }: StepCtx) {
  return (
    <Svg label="delete one key: every copy unreadable at once, measured, including the backup" h={200}>
      <Row y={70} label="subject's key deleted" value="table, topic, backup" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="all unreadable, measured" value="other subjects: fine" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function RevealProvingDeletion({ t }: StepCtx) {
  return (
    <Svg label="evidence for an auditor: the snapshot list, the file listing, the key store's own record" h={200}>
      <Row y={70} label="evidence" value="snapshots, files, key store" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="retention rule" value="versioned, checkable code" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function Recap({ t }: StepCtx) {
  return (
    <Svg label="a SQL delete leaves the old snapshot untouched; a key deletion reaches every copy at once" h={280}>
      <Row y={50} label="DELETE alone" value="old snapshot remains" o={easeOut(seg(t, 0, 0.3))} />
      <Row y={100} label="expire + compact" value="physically gone, measured" o={easeOut(seg(t, 0.15, 0.45))} />
      <Row y={150} label="crypto-shredding" value="every copy, at once" valueColor={C.focus} o={easeOut(seg(t, 0.4, 0.75))} />
    </Svg>
  );
}
