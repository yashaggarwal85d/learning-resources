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
    <Svg label="Postgres never overwrites a row in place. Every update leaves an old version behind." h={200}>
      <Row y={70} label="every update" value="an old version stays" o={easeOut(seg(t, 0, 0.6))} />
      <Row y={130} label="who cleans it up" value="and what stops it?" valueColor={C.focus} o={easeOut(seg(t, 0.4, 1))} />
    </Svg>
  );
}

export function RevealDeadTuple({ t }: StepCtx) {
  return (
    <Svg label="half of 300 rows, deleted on this sandbox's own cluster: a real dead-tuple count, then VACUUM." h={200}>
      <Row y={70} label="half the rows deleted" value="dead tuples, counted" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="VACUUM runs" value="reclaimed, not before" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function RevealHotUpdate({ t }: StepCtx) {
  return (
    <Svg label="the same 300 updates, same table, measured: the index's own size depends on which column changed." h={200}>
      <Row y={70} label="unindexed column" value="index: unchanged" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="indexed column" value="index: doubled" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function PredictPinned({ t }: StepCtx) {
  return (
    <Svg label="a table keeps growing. Autovacuum is running. What's actually holding it back?" h={200}>
      <Row y={70} label="autovacuum" value="running, not stuck" />
      <Row y={130} label="the real cause" value="not yet revealed" valueColor={C.focus} />
    </Svg>
  );
}

export function RevealXminHorizon({ t }: StepCtx) {
  return (
    <Svg label="three real, named things pin the same horizon, sourced directly from Postgres's own documentation." h={260}>
      <Row y={50} label="a long transaction" value="snapshot held open" o={easeOut(seg(t, 0, 0.35))} />
      <Row y={95} label="a prepared transaction" value="left uncommitted" o={easeOut(seg(t, 0.15, 0.5))} />
      <Row y={140} label="a replication slot" value="abandoned" o={easeOut(seg(t, 0.3, 0.65))} />
      <Row y={185} label="one horizon" value="VACUUM can't tell why" valueColor={C.focus} o={easeOut(seg(t, 0.55, 0.9))} />
    </Svg>
  );
}

export function RevealBloatCharted({ t }: StepCtx) {
  return (
    <Svg label="one transaction held open through 600 real updates on this sandbox's own cluster, then released." h={260}>
      <Row y={50} label="baseline" value="no dead tuples" o={easeOut(seg(t, 0, 0.3))} />
      <Row y={95} label="600 updates, held open" value="VACUUM: reclaims none" valueColor={C.focus} o={easeOut(seg(t, 0.2, 0.55))} />
      <Row y={140} label="transaction released" value="VACUUM: all clear" o={easeOut(seg(t, 0.45, 0.8))} />
    </Svg>
  );
}

export function RevealAutovacuumKnobs({ t }: StepCtx) {
  return (
    <Svg label="autovacuum reacts to a threshold built from the table itself, not a fixed schedule." h={200}>
      <Row y={70} label="dead tuples pile up" value="cross a threshold" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="a worker starts" value="not on a clock" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function RevealWraparound({ t }: StepCtx) {
  return (
    <Svg label="a real freeze age, reset by VACUUM FREEZE, next to the real outage it exists to prevent." h={200}>
      <Row y={70} label="freeze age, measured" value="reset to zero" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="ignored at scale" value="Sentry, 2015: outage" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function Recap({ t }: StepCtx) {
  return (
    <Svg label="one mechanism, three scales: a dead tuple, a held-open horizon, an unfrozen counter." h={260}>
      <Row y={50} label="one row" value="a dead tuple" o={easeOut(seg(t, 0, 0.3))} />
      <Row y={95} label="one table" value="a held-open horizon" o={easeOut(seg(t, 0.15, 0.45))} />
      <Row y={140} label="one cluster" value="an unfrozen counter" valueColor={C.focus} o={easeOut(seg(t, 0.35, 0.7))} />
      <Row y={185} label="nothing stops it" value="a real outage" o={easeOut(seg(t, 0.55, 0.9))} />
    </Svg>
  );
}

export function ProveIt({ t }: StepCtx) {
  return (
    <Svg label="Sentry's own cluster just hit wraparound protection. Disable autovacuum to stop it interfering?" h={220}>
      <Row y={55} label="disable autovacuum" value="stop it interfering?" o={easeOut(seg(t, 0, 0.4))} />
      <Row y={110} label="the real fix" value="not yet revealed" valueColor={C.focus} o={easeOut(seg(t, 0.25, 0.65))} />
      <Row y={165} label="really" value="find the pin, then tune" valueColor={C.focus} o={easeOut(seg(t, 0.55, 1))} />
    </Svg>
  );
}
