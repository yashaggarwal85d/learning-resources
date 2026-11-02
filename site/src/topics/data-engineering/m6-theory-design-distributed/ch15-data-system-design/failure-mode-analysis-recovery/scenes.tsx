import { C, Svg, T } from '../../../../../reels/kit';
import { easeOut, seg } from '../../../../../reels/anim';
import type { StepCtx } from '../../../../../reels/types';

/** A label-left / value-right row (DESIGN.md, phone text scaling). Keep each
 * side to 1-3 words: longer pairs overlap on phone widths. */
function Row({ y, label, value, valueColor = C.crema, o = 1 }: { y: number; label: string; value: string; valueColor?: string; o?: number }) {
  return (
    <g opacity={o}>
      <T x={25} y={y} s={15} f={C.latte}>
        {label}
      </T>
      <T x={575} y={y} s={16} f={valueColor} a="end" w={600}>
        {value}
      </T>
    </g>
  );
}

export function Hook({ t }: StepCtx) {
  return (
    <Svg label="one partition crash-loops on a bad record at 2am — every other partition keeps going, and the averaged dashboard reads fine" h={270}>
      <T x={300} y={50} s={14} f={C.taupe} a="middle" o={easeOut(seg(t, 0, 0.5))}>
        five partitions, one stuck
      </T>
      <T x={300} y={90} s={17} f={C.crema} a="middle" w={600} serif italic o={easeOut(seg(t, 0.15, 0.6))}>
        the dashboard still reads fine
      </T>
      <Row y={150} label="dashboard" value="100% fine, averaged" o={easeOut(seg(t, 0.35, 0.65))} />
      <Row y={195} label="partition three" value="stuck, restarting" valueColor={C.focus} o={easeOut(seg(t, 0.5, 0.8))} />
      <Row y={240} label="time stuck" value="unbounded so far" o={easeOut(seg(t, 0.65, 1))} />
    </Svg>
  );
}

export function Predict1({ t }: StepCtx) {
  return (
    <Svg label="what actually ends the crash loop?" h={210}>
      <Row y={75} label="the pipeline" value="sorts itself out" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={150} label="a human" value="notices, quarantines it" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function RevealFailureTable({ t }: StepCtx) {
  return (
    <Svg label="failure, blast radius, detection, recovery, data lost, time to recover — one row, filled in left to right" h={240}>
      <Row y={60} label="failure" value="one partition, crash loop" o={easeOut(seg(t, 0, 0.3))} />
      <Row y={105} label="detection" value="per-partition lag" o={easeOut(seg(t, 0.15, 0.45))} />
      <Row y={150} label="dashboard's own view" value="never shows it" valueColor={C.focus} o={easeOut(seg(t, 0.35, 0.65))} />
      <Row y={195} label="recovery" value="empty, so far" o={easeOut(seg(t, 0.55, 0.85))} />
    </Svg>
  );
}

export function RevealBlastRadius({ t }: StepCtx) {
  return (
    <Svg label="the dashboard's blast radius buries one partition inside 100% fine — the real radius is that partition's own orders" h={210}>
      <Row y={75} label="dashboard's radius" value="buried, averaged away" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={150} label="real radius" value="one partition's orders" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function RevealRecoveryGap({ t }: StepCtx) {
  return (
    <Svg label="no dead-letter path leaves the recovery cell empty — add one, and the same row has an answer" h={210}>
      <Row y={75} label="no dead-letter queue" value="recovery cell, empty" valueColor={C.focus} o={easeOut(seg(t, 0, 0.5))} />
      <Row y={150} label="with a dead-letter queue" value="one cycle, resumes" o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function RevealRpoRto({ t }: StepCtx) {
  return (
    <Svg label="RPO: how much data this class can lose. RTO: how long it can stay down. Two numbers, two separate costs" h={210}>
      <Row y={75} label="RPO" value="data loss, bounded" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={150} label="RTO" value="downtime, bounded" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function RevealRpoRtoPerClass({ t }: StepCtx) {
  return (
    <Svg label="orders, clickstream, audit log — each data class gets its own RPO and RTO, not one target for the whole system" h={240}>
      <Row y={60} label="orders" value="near-zero loss" o={easeOut(seg(t, 0, 0.3))} />
      <Row y={105} label="audit log" value="near-zero loss" o={easeOut(seg(t, 0.15, 0.45))} />
      <Row y={150} label="clickstream" value="loose, cheaper" valueColor={C.focus} o={easeOut(seg(t, 0.35, 0.65))} />
      <Row y={195} label="one target for all" value="overpays for clickstream" o={easeOut(seg(t, 0.55, 0.85))} />
    </Svg>
  );
}

export function RevealDegradedModes({ t }: StepCtx) {
  return (
    <Svg label="two degraded modes under overload: keep every record but delay the poisoned ones, or keep serving but go stale" h={210}>
      <Row y={75} label="dead-letter mode" value="keeps every record" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={150} label="freshness-flag mode" value="keeps serving, stale" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function Recap({ t }: StepCtx) {
  return (
    <Svg label="the failure table finds the gap, RPO and RTO price it per class, two degraded modes are the designed fallback" h={290}>
      <Row y={45} label="failure table" value="failure to recovery" o={easeOut(seg(t, 0, 0.3))} />
      <Row y={100} label="blast radius" value="failure domain, not dashboard" o={easeOut(seg(t, 0.15, 0.45))} />
      <Row y={155} label="RPO, RTO" value="priced, per data class" valueColor={C.focus} o={easeOut(seg(t, 0.35, 0.65))} />
      <Row y={210} label="degraded modes" value="a designed trade" o={easeOut(seg(t, 0.55, 0.85))} />
    </Svg>
  );
}

export function ProveIt({ t }: StepCtx) {
  return (
    <Svg label="a second pipeline loses its whole message broker, not one partition — does the same failure table still find the gap?" h={250}>
      <Row y={65} label="broker loss" value="a different failure" o={easeOut(seg(t, 0, 0.4))} />
      <Row y={140} label="same five columns" value="apply to any failure" valueColor={C.focus} o={easeOut(seg(t, 0.3, 0.7))} />
      <Row y={215} label="filling them in" value="surfaces the gap again" o={easeOut(seg(t, 0.55, 1))} />
    </Svg>
  );
}
