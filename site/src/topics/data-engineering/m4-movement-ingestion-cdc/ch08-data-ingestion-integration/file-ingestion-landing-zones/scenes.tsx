import { Bar, C, Svg, T } from '../../../../../reels/kit';
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

/** A row of small slot squares standing in for files in a prefix, some filled, some empty. */
function Shelf({ y, filled, empty, t, from, to }: { y: number; filled: number; empty: number; t: number; from: number; to: number }) {
  const k = easeOut(seg(t, from, to));
  const total = filled + empty;
  const w = Math.min(28, 440 / total);
  return (
    <g>
      {Array.from({ length: total }).map((_, i) => (
        <Bar key={i} x={25 + i * (w + 4)} y={y} w={w * Math.min(1, k * total - i)} h={22} full={w} fill={i < filled ? C.crema : C.badText} />
      ))}
    </g>
  );
}

export function Hook({ t }: StepCtx) {
  return (
    <Svg label="a producer crashes partway through a batch; a naive reader reads what landed and reports a wrong number." h={220}>
      <T x={25} y={40} s={13} f={C.taupe}>landing prefix</T>
      <Shelf y={50} filled={8} empty={2} t={t} from={0} to={0.6} />
      <Row y={120} label="reader reports" value="a number, confidently" valueColor={C.badText} o={easeOut(seg(t, 0.3, 0.7))} />
      <Row y={165} label="error raised" value="none" valueColor={C.badText} o={easeOut(seg(t, 0.4, 0.8))} />
    </Svg>
  );
}

export function PredictManifestGate({ t }: StepCtx) {
  return (
    <Svg label="the identical crash, but this reader waits for a manifest written strictly last. What does it see?" h={200}>
      <Row y={70} label="reader waits for" value="the manifest itself" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="what it sees" value="not yet revealed" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function RevealRenameUnsafe({ t }: StepCtx) {
  return (
    <Svg label="an object store has an atomic write per object and no rename at all." h={200}>
      <Row y={70} label="atomic write" value="one object at a time" valueColor={C.focus} o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="rename" value="does not exist here" valueColor={C.badText} o={easeOut(seg(t, 0.25, 0.65))} />
    </Svg>
  );
}

export function RevealManifestMeasured({ t }: StepCtx) {
  return (
    <Svg label="the real run: no manifest means nothing trusted; a finished batch's manifest matches it exactly." h={220}>
      <Row y={60} label="crash, no manifest" value="reader trusts nothing" valueColor={C.focus} o={easeOut(seg(t, 0, 0.4))} />
      <Row y={110} label="finished batch" value="manifest matches exactly" valueColor={C.focus} o={easeOut(seg(t, 0.2, 0.6))} />
    </Svg>
  );
}

export function RevealMarkerAndConditional({ t }: StepCtx) {
  return (
    <Svg label="a marker written strictly last; a conditional write that lets only one of two racing writers win." h={220}>
      <Row y={60} label="success marker" value="written strictly last" o={easeOut(seg(t, 0, 0.4))} />
      <Row y={110} label="conditional write" value="one winner only" o={easeOut(seg(t, 0.2, 0.6))} />
    </Svg>
  );
}

export function RevealRaceMeasured({ t }: StepCtx) {
  return (
    <Svg label="the real run: a plain overwrite lets the second writer win silently; a conditional write rejects it." h={220}>
      <Row y={60} label="plain overwrite" value="silent, no complaint" valueColor={C.badText} o={easeOut(seg(t, 0, 0.4))} />
      <Row y={110} label="conditional write" value="rejected, loudly" valueColor={C.focus} o={easeOut(seg(t, 0.2, 0.6))} />
      <Row y={160} label="winner recorded" value="the first writer" valueColor={C.focus} o={easeOut(seg(t, 0.4, 0.8))} />
    </Svg>
  );
}

export function RevealPoisonFiles({ t }: StepCtx) {
  return (
    <Svg label="a file that fails validation is moved aside with its own reason, never retried forever." h={200}>
      <Row y={70} label="validation fails" value="moved aside, with a reason" valueColor={C.badText} o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="silent skip" value="the anti-pattern" valueColor={C.badText} o={easeOut(seg(t, 0.25, 0.65))} />
    </Svg>
  );
}

export function RevealQuarantineMeasured({ t }: StepCtx) {
  return (
    <Svg label="the real run: one file fails on its own field and is quarantined with that exact reason." h={220}>
      <Row y={60} label="files landed" value="pass validation" valueColor={C.focus} o={easeOut(seg(t, 0, 0.4))} />
      <Row y={110} label="one file" value="quarantined, with reason" valueColor={C.badText} o={easeOut(seg(t, 0.2, 0.6))} />
    </Svg>
  );
}

export function RevealSchemaTiming({ t }: StepCtx) {
  return (
    <Svg label="the identical malformed file, caught immediately in one case, left untouched in the other." h={200}>
      <Row y={70} label="schema-on-write" value="caught at landing" valueColor={C.focus} o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="schema-on-read" value="detection, deferred" valueColor={C.badText} o={easeOut(seg(t, 0.25, 0.65))} />
    </Svg>
  );
}

export function RevealTimingMeasured({ t }: StepCtx) {
  return (
    <Svg label="the real run: caught instantly at landing versus unnoticed for dozens of runs before detection." h={220}>
      <Row y={60} label="schema-on-write" value="caught, run zero" valueColor={C.focus} o={easeOut(seg(t, 0, 0.4))} />
      <Row y={110} label="schema-on-read" value="caught, many runs later" valueColor={C.badText} o={easeOut(seg(t, 0.2, 0.6))} />
    </Svg>
  );
}

export function Recap({ t }: StepCtx) {
  return (
    <Svg label="three commit protocols, one quarantine rule, one timing tradeoff — the shared property underneath." h={260}>
      <Row y={50} label="commit" value="manifest, marker, condition" o={easeOut(seg(t, 0, 0.3))} />
      <Row y={95} label="poison files" value="quarantined, with a reason" o={easeOut(seg(t, 0.15, 0.45))} />
      <Row y={140} label="schema timing" value="landing, or read, time" o={easeOut(seg(t, 0.25, 0.55))} />
      <Row y={185} label="shared property" value="not yet named" valueColor={C.focus} o={easeOut(seg(t, 0.4, 0.75))} />
    </Svg>
  );
}

export function ProveIt({ t }: StepCtx) {
  return (
    <Svg label="notifications arrive at least once; listing pays a cost that grows with the prefix. Which wins?" h={200}>
      <Row y={70} label="notifications" value="need their own dedup" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="which is better" value="not yet revealed" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}
