import { C, Svg, T } from '../../../../../reels/kit';
import { easeOut, seg } from '../../../../../reels/anim';
import type { StepCtx } from '../../../../../reels/types';

function TallRow({ y, label, value, valueColor = C.crema, o = 1 }: { y: number; label: string; value: string; valueColor?: string; o?: number }) {
  return (
    <g opacity={o}>
      <T x={25} y={y} s={14} f={C.latte}>
        {label}
      </T>
      <T x={25} y={y + 26} s={16} f={valueColor} w={600}>
        {value}
      </T>
    </g>
  );
}

export function Hook({ t }: StepCtx) {
  return (
    <Svg label="a column's identity survives change -- how far back can you see a table, and when does it forget?" h={200}>
      <TallRow y={40} label="last topic" value="a column's identity, across the table" o={easeOut(seg(t, 0, 0.3))} />
      <TallRow y={100} label="this topic" value="how far back a table lets you go" valueColor={C.focus} o={easeOut(seg(t, 0.25, 0.65))} />
      <TallRow y={160} label="and" value="how it eventually forgets" o={easeOut(seg(t, 0.55, 1))} />
    </Svg>
  );
}

export function PredictTimeTravelAfterCommits({ t }: StepCtx) {
  return (
    <Svg label="after three more commits, can you still read the table as it looked right after the first one?" h={200}>
      <TallRow y={40} label="three commits happen after the first one" value="each adding a new file" o={easeOut(seg(t, 0, 0.5))} />
      <TallRow y={100} label="can you still read it as it looked" value="right after that first commit?" valueColor={C.focus} o={easeOut(seg(t, 0.4, 1))} />
    </Svg>
  );
}

export function RevealTimeTravelAndRollback({ t }: StepCtx) {
  return (
    <Svg label="reproduced for real: time travel by snapshot id, by timestamp, and rollback." h={230}>
      <TallRow y={40} label="a real chain of snapshots" value="time travel by id and by timestamp" o={easeOut(seg(t, 0, 0.35))} />
      <TallRow y={100} label="real measured result" value="both resolve correctly; rollback works too" valueColor={C.focus} o={easeOut(seg(t, 0.3, 0.7))} />
    </Svg>
  );
}

export function RevealSnapshotsKeepFilesAlive({ t }: StepCtx) {
  return (
    <Svg label="Iceberg's own words: data files stay until no snapshot references them any more." h={230}>
      <TallRow y={40} label="a superseded file" value="isn't deleted when a new commit replaces it" o={easeOut(seg(t, 0, 0.35))} />
      <TallRow y={100} label="it stays" value="until every snapshot referencing it is expired" valueColor={C.focus} o={easeOut(seg(t, 0.3, 0.7))} />
    </Svg>
  );
}

export function RevealExpireReclaimsStorage({ t }: StepCtx) {
  return (
    <Svg label="reproduced for real: expiring old snapshots and vacuuming reclaims real, measured storage." h={230}>
      <TallRow y={40} label="two old snapshots expired" value="their files are now unreferenced" o={easeOut(seg(t, 0, 0.35))} />
      <TallRow y={100} label="real measured result" value="40,000 bytes each reclaimed; time travel fails" valueColor={C.focus} o={easeOut(seg(t, 0.3, 0.7))} />
    </Svg>
  );
}

export function RevealGdprConflict({ t }: StepCtx) {
  return (
    <Svg label="a hard delete rewrites the current snapshot -- the old file survives until vacuum." h={230}>
      <TallRow y={40} label="a delete commits a redacted file" value="but the original file isn't removed" o={easeOut(seg(t, 0, 0.35))} />
      <TallRow y={100} label="real measured result" value="still time-travelable until vacuum runs" valueColor={C.focus} o={easeOut(seg(t, 0.3, 0.7))} />
    </Svg>
  );
}

export function PredictRetentionTooShort({ t }: StepCtx) {
  return (
    <Svg label="maintenance expires a snapshot a reader is still mid-read on -- what happens?" h={200}>
      <TallRow y={40} label="a reader is still mid-read" value="on a snapshot maintenance just expired" o={easeOut(seg(t, 0, 0.5))} />
      <TallRow y={100} label="what happens to that read?" value="nothing, or does it fail?" valueColor={C.focus} o={easeOut(seg(t, 0.4, 1))} />
    </Svg>
  );
}

export function RevealReaderCorrupted({ t }: StepCtx) {
  return (
    <Svg label="reproduced for real: a too-short retention window corrupts a reader mid-read." h={230}>
      <TallRow y={40} label="retention shorter than the read's duration" value="expires the reader's own snapshot" o={easeOut(seg(t, 0, 0.35))} />
      <TallRow y={100} label="real measured result" value="the read fails; a long-enough window succeeds" valueColor={C.focus} o={easeOut(seg(t, 0.3, 0.7))} />
    </Svg>
  );
}

export function RevealRetentionTradeoff({ t }: StepCtx) {
  return (
    <Svg label="the one knob: retention must outlast every reader and writer, yet short enough to reclaim storage or honor a delete." h={230}>
      <TallRow y={40} label="retention too long" value="storage and PII both linger" o={easeOut(seg(t, 0, 0.35))} />
      <TallRow y={100} label="retention too short" value="a reader or writer gets corrupted" valueColor={C.focus} o={easeOut(seg(t, 0.3, 0.7))} />
    </Svg>
  );
}

export function Recap({ t }: StepCtx) {
  return (
    <Svg label="time travel and rollback read the same chain; expiry reclaims storage and finally makes a delete real." h={300}>
      <TallRow y={35} label="time travel and rollback" value="both read from the same snapshot chain" o={easeOut(seg(t, 0, 0.3))} />
      <TallRow y={100} label="expiring old snapshots" value="reclaims storage and makes a delete real" o={easeOut(seg(t, 0.1, 0.4))} />
      <TallRow y={165} label="retention window" value="the one knob trading all of it off" valueColor={C.focus} o={easeOut(seg(t, 0.25, 0.6))} />
      <g opacity={easeOut(seg(t, 0.55, 1))}>
        <T x={25} y={230} s={14} f={C.latte}>
          the rule
        </T>
        <T x={25} y={256} s={16} f={C.focus} w={600}>
          a snapshot isn't really gone
        </T>
        <T x={25} y={280} s={16} f={C.focus} w={600}>
          until expiry and vacuum say so
        </T>
      </g>
    </Svg>
  );
}
