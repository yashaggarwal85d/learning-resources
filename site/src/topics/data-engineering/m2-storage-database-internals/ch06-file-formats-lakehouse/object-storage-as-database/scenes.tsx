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
    <Svg label="a table needs atomic commits, but the storage underneath has no file you can edit in place." h={200}>
      <TallRow y={40} label="Parquet, ORC" value="one immutable file at a time" o={easeOut(seg(t, 0, 0.3))} />
      <TallRow y={100} label="object storage underneath" value="no file to edit, ever" valueColor={C.focus} o={easeOut(seg(t, 0.25, 0.65))} />
      <TallRow y={160} label="what does 'a table' even mean here?" value="this topic opens that question" o={easeOut(seg(t, 0.55, 1))} />
    </Svg>
  );
}

export function PredictConsistency({ t }: StepCtx) {
  return (
    <Svg label="write an object to S3, then read it back immediately — does the read see it?" h={200}>
      <TallRow y={40} label="write succeeds" value="server returns 200 OK" o={easeOut(seg(t, 0, 0.5))} />
      <TallRow y={100} label="read, right after" value="sees the new object, or stale data?" valueColor={C.focus} o={easeOut(seg(t, 0.4, 1))} />
    </Svg>
  );
}

export function RevealConsistency({ t }: StepCtx) {
  return (
    <Svg label="strong read-after-write consistency, since December 2020 — no wait, no stale read, ever." h={230}>
      <TallRow y={40} label="before December 2020" value="eventually consistent" o={easeOut(seg(t, 0, 0.35))} />
      <TallRow y={100} label="since December 2020" value="any read after a success response sees it" valueColor={C.focus} o={easeOut(seg(t, 0.3, 0.7))} />
    </Svg>
  );
}

export function RevealNoAtomicRename({ t }: StepCtx) {
  return (
    <Svg label="a real local S3 server: copy, then stop before the delete — both objects exist at once." h={230}>
      <TallRow y={40} label="rename = copy, then delete" value="two separate real requests" o={easeOut(seg(t, 0, 0.35))} />
      <TallRow y={100} label="stopped after the copy" value="2 objects exist — original and copy" valueColor={C.focus} o={easeOut(seg(t, 0.3, 0.7))} />
    </Svg>
  );
}

export function PredictRace({ t }: StepCtx) {
  return (
    <Svg label="two writers race to create the same key at once — can they both succeed?" h={200}>
      <TallRow y={40} label="writer A and writer B" value="both PUT the same key, same instant" o={easeOut(seg(t, 0, 0.5))} />
      <TallRow y={100} label="no lock service, no coordinator" value="does object storage pick a winner?" valueColor={C.focus} o={easeOut(seg(t, 0.4, 1))} />
    </Svg>
  );
}

export function RevealConditionalCreate({ t }: StepCtx) {
  return (
    <Svg label="a real If-None-Match request, twice, against a real local server — the second one really fails." h={230}>
      <TallRow y={40} label="writer A: PUT, If-None-Match: *" value="200 OK — commits" o={easeOut(seg(t, 0, 0.35))} />
      <TallRow y={100} label="writer B: PUT, If-None-Match: *" value="412 Precondition Failed — rejected" valueColor={C.focus} o={easeOut(seg(t, 0.3, 0.7))} />
    </Svg>
  );
}

export function RevealConditionalUpdate({ t }: StepCtx) {
  return (
    <Svg label="If-Match is the same primitive for updates — a real compare-and-swap on the ETag." h={230}>
      <TallRow y={40} label="update with the current ETag" value="200 OK — commits, ETag changes" o={easeOut(seg(t, 0, 0.35))} />
      <TallRow y={100} label="update with the old, stale ETag" value="412 — rejected, same as before" valueColor={C.focus} o={easeOut(seg(t, 0.3, 0.7))} />
    </Svg>
  );
}

export function RevealListCost({ t }: StepCtx) {
  return (
    <Svg label="a real paginated LIST of 250 objects takes 5 separate round trips, not 1." h={230}>
      <TallRow y={40} label="250 objects, 50 per page" value="5 real HTTP round trips" o={easeOut(seg(t, 0, 0.4))} />
      <TallRow y={100} label="per-prefix request limits" value="thousands/second — not unlimited" valueColor={C.focus} o={easeOut(seg(t, 0.4, 1))} />
    </Svg>
  );
}

export function RevealWhatThisBuys({ t }: StepCtx) {
  return (
    <Svg label="conditional writes turn 'whoever writes last wins' into 'exactly one commit survives.'" h={230}>
      <TallRow y={40} label="no conditional write" value="last writer silently overwrites" o={easeOut(seg(t, 0, 0.35))} />
      <TallRow y={100} label="with If-None-Match / If-Match" value="exactly one commit survives, no coordinator" valueColor={C.focus} o={easeOut(seg(t, 0.3, 0.7))} />
    </Svg>
  );
}

export function Recap({ t }: StepCtx) {
  return (
    <Svg label="object storage: strongly consistent reads, no atomic rename, and conditional writes as the real commit primitive." h={300}>
      <TallRow y={35} label="reads" value="strongly consistent since 2020" o={easeOut(seg(t, 0, 0.3))} />
      <TallRow y={100} label="rename" value="not atomic — copy, then delete" o={easeOut(seg(t, 0.1, 0.4))} />
      <TallRow y={165} label="the commit primitive" value="a real compare-and-swap" valueColor={C.focus} o={easeOut(seg(t, 0.25, 0.6))} />
      <g opacity={easeOut(seg(t, 0.55, 1))}>
        <T x={25} y={230} s={14} f={C.latte}>
          the rule
        </T>
        <T x={25} y={256} s={16} f={C.focus} w={600}>
          object storage isn't a database —
        </T>
        <T x={25} y={280} s={16} f={C.focus} w={600}>
          conditional writes are its one commit primitive
        </T>
      </g>
    </Svg>
  );
}
