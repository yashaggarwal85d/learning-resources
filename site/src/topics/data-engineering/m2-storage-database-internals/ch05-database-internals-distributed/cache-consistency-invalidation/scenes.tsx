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
    <Svg label="a reader's stale read lands in the cache right after a writer already deleted that same key" h={200}>
      <Row y={70} label="the writer" value="deletes the key" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="the reader" value="writes stale back" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function PredictUpdateVsDelete({ t }: StepCtx) {
  return (
    <Svg label="would updating the cache instead of deleting it have prevented this race?" h={200}>
      <Row y={70} label="update instead" value="prevents this?" />
      <Row y={130} label="a different fix" value="prevents this?" valueColor={C.focus} />
    </Svg>
  );
}

export function RevealDeleteNotUpdate({ t }: StepCtx) {
  return (
    <Svg label="delete, not update: a delete is idempotent, an update is not" h={200}>
      <Row y={70} label="a delete, twice" value="same result" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="an update, twice" value="order can lose" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function RevealRaceReproduced({ t }: StepCtx) {
  return (
    <Svg label="the exact interleaving, reproduced for real — does deleting on write actually close the gap?" h={200}>
      <Row y={70} label="database holds" value="new value" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="cache holds" value="stale value" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function RevealLeasesClose({ t }: StepCtx) {
  return (
    <Svg label="a lease token, invalidated by the writer's delete, rejects the reader's own stale write-back" h={200}>
      <Row y={70} label="reader's lease" value="now invalid" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="stale write-back" value="rejected" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function RevealCdcInvalidation({ t }: StepCtx) {
  return (
    <Svg label="a daemon reads the database's own commit log directly and extracts the deletes itself" h={200}>
      <Row y={70} label="application code" value="can forget" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="the commit log" value="cannot forget" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function RevealPerFieldStaleness({ t }: StepCtx) {
  return (
    <Svg label="not every field needs the same consistency — one real system marks a critical few differently" h={200}>
      <Row y={70} label="most reads" value="tolerate staleness" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="credentials" value="marked critical" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function Recap({ t }: StepCtx) {
  return (
    <Svg label="delete beats update, leases close the race, a commit-log daemon never forgets, and staleness tolerance is a per-field decision" h={260}>
      <Row y={50} label="delete" value="not update" o={easeOut(seg(t, 0, 0.3))} />
      <Row y={95} label="a lease" value="closes the race" o={easeOut(seg(t, 0.1, 0.4))} />
      <Row y={140} label="the commit log" value="never forgets" valueColor={C.focus} o={easeOut(seg(t, 0.25, 0.6))} />
      <Row y={185} label="staleness" value="per-field choice" o={easeOut(seg(t, 0.5, 0.85))} />
    </Svg>
  );
}

export function ProveIt({ t }: StepCtx) {
  return (
    <Svg label="a new write path never calls the cache-invalidation code — which fix catches this automatically?" h={200}>
      <Row y={70} label="new write path" value="skips invalidation" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="the commit log" value="catches it anyway" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}
