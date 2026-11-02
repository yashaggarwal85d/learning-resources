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
    <Svg label="both iceberg and delta commit by their own atomic pointer move. this topic names that pointer's home." h={200}>
      <TallRow y={40} label="iceberg and delta, both real now" value="each with its own atomic pointer move" o={easeOut(seg(t, 0, 0.3))} />
      <TallRow y={100} label="this topic" value="the pointer's own home, built for real" valueColor={C.focus} o={easeOut(seg(t, 0.25, 0.65))} />
    </Svg>
  );
}

export function PredictCatalogJob({ t }: StepCtx) {
  return (
    <Svg label="a catalog tracks the current-metadata pointer. is that the whole job, or does it do more?" h={200}>
      <TallRow y={40} label="a catalog tracks the pointer" value="that much is obvious" o={easeOut(seg(t, 0, 0.5))} />
      <TallRow y={100} label="is that the whole job" value="or does it do more?" valueColor={C.focus} o={easeOut(seg(t, 0.4, 1))} />
    </Svg>
  );
}

export function RevealFourJobs({ t }: StepCtx) {
  return (
    <Svg label="four real jobs: namespace, the pointer by compare-and-swap, access control, credential issuance." h={260}>
      <TallRow y={35} label="namespace" value="where a table lives" o={easeOut(seg(t, 0, 0.3))} />
      <TallRow y={100} label="the pointer" value="moved by compare-and-swap" o={easeOut(seg(t, 0.1, 0.4))} />
      <TallRow y={165} label="access control, credentials" value="two more real jobs" valueColor={C.focus} o={easeOut(seg(t, 0.25, 0.6))} />
    </Svg>
  );
}

export function RevealCasRace({ t }: StepCtx) {
  return (
    <Svg label="a real table, registered. two engines race for the pointer's next version, for real." h={230}>
      <TallRow y={40} label="table registered" value="real pointer, version zero" o={easeOut(seg(t, 0, 0.35))} />
      <TallRow y={100} label="two engines race" value="one wins, one conflicts and retries" valueColor={C.focus} o={easeOut(seg(t, 0.3, 0.7))} />
    </Svg>
  );
}

export function PredictAccessBeforeCas({ t }: StepCtx) {
  return (
    <Svg label="should an unauthorized caller's request even reach the compare-and-swap?" h={200}>
      <TallRow y={40} label="an unauthorized caller" value="tries a pointer update" o={easeOut(seg(t, 0, 0.5))} />
      <TallRow y={100} label="does it reach the cas at all" value="or get stopped first?" valueColor={C.focus} o={easeOut(seg(t, 0.4, 1))} />
    </Svg>
  );
}

export function RevealAccessControlReal({ t }: StepCtx) {
  return (
    <Svg label="no -- rejected for real, before the compare-and-swap is ever attempted." h={230}>
      <TallRow y={40} label="unauthorized request" value="rejected for real" o={easeOut(seg(t, 0, 0.35))} />
      <TallRow y={100} label="before the cas" value="never even attempted" valueColor={C.focus} o={easeOut(seg(t, 0.3, 0.7))} />
    </Svg>
  );
}

export function RevealCredentialIssuance({ t }: StepCtx) {
  return (
    <Svg label="a real scoped, time-limited credential, naming exactly one table's own prefix, issued only to a real principal." h={230}>
      <TallRow y={40} label="authorized principal" value="gets a real scoped credential" o={easeOut(seg(t, 0, 0.35))} />
      <TallRow y={100} label="scope" value="exactly this one table's prefix" valueColor={C.focus} o={easeOut(seg(t, 0.3, 0.7))} />
    </Svg>
  );
}

export function RevealLegacyOptions({ t }: StepCtx) {
  return (
    <Svg label="the legacy options, named with their real limits: hive metastore, glue data catalog, a jdbc catalog." h={260}>
      <TallRow y={35} label="hive metastore" value="schema and location, no credentials" o={easeOut(seg(t, 0, 0.3))} />
      <TallRow y={100} label="glue data catalog" value="needs lake formation bolted on" o={easeOut(seg(t, 0.1, 0.4))} />
      <TallRow y={165} label="a jdbc catalog" value="just a cas row, nothing more" valueColor={C.focus} o={easeOut(seg(t, 0.25, 0.6))} />
    </Svg>
  );
}

export function RevealMultiCloudLimits({ t }: StepCtx) {
  return (
    <Svg label="why this matters for a multi-engine, multi-cloud estate: three real, named limits." h={260}>
      <TallRow y={35} label="vendor lock-in" value="one engine's own metastore" o={easeOut(seg(t, 0, 0.3))} />
      <TallRow y={100} label="no credential vending" value="a real, documented gap" o={easeOut(seg(t, 0.1, 0.4))} />
      <TallRow y={165} label="single region or account" value="without a service bolted on" valueColor={C.focus} o={easeOut(seg(t, 0.25, 0.6))} />
    </Svg>
  );
}

export function Recap({ t }: StepCtx) {
  return (
    <Svg label="a minimal catalog, for real, doing all four jobs. next: a real, vendor-neutral protocol for one." h={300}>
      <TallRow y={35} label="a minimal catalog" value="all four jobs, built for real" o={easeOut(seg(t, 0, 0.3))} />
      <TallRow y={100} label="the legacy options" value="named, with real, sourced limits" o={easeOut(seg(t, 0.1, 0.4))} />
      <TallRow y={165} label="this proves the idea" value="a real catalog, minimal, working" valueColor={C.focus} o={easeOut(seg(t, 0.25, 0.6))} />
      <g opacity={easeOut(seg(t, 0.55, 1))}>
        <T x={25} y={230} s={14} f={C.latte}>
          the handoff
        </T>
        <T x={25} y={256} s={16} f={C.focus} w={600}>
          a vendor-neutral protocol for talking to
        </T>
        <T x={25} y={280} s={16} f={C.focus} w={600}>
          one is next -- the iceberg rest catalog
        </T>
      </g>
    </Svg>
  );
}
