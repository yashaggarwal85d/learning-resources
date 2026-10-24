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
    <Svg label="recovery doesn't replay a crashed engine's entire history. Something marks a more recent, trustworthy point to start from instead." h={200}>
      <Row y={70} label="start of the log" value="dimmed out" o={easeOut(seg(t, 0, 0.6))} />
      <Row y={130} label="a more recent point" value="not yet named" valueColor={C.focus} o={easeOut(seg(t, 0.4, 1))} />
    </Svg>
  );
}

export function RevealRedoLsn({ t }: StepCtx) {
  return (
    <Svg label="the redo record names exactly where recovery starts; the live gap behind it is exactly how much a crash this instant would force a replay of." h={200}>
      <Row y={70} label="redo_lsn" value="where recovery resumes" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="current_wal_lsn minus redo_lsn" value="the live replay gap" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function RevealFrequencyTradeoff({ t }: StepCtx) {
  return (
    <Svg label="checkpoint more often, and there's less to redo after a crash — but also more full-page images logged along the way." h={200}>
      <Row y={70} label="checkpoint more often" value="less to redo" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="checkpoint more often" value="more full-page images" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function PredictTornPage({ t }: StepCtx) {
  return (
    <Svg label="a torn page is possible because a disk write isn't atomic at the page level — only a full before/after copy can repair whatever the tear left behind." h={200}>
      <Row y={70} label="why log the whole page" value="instead of just the change?" />
      <Row y={130} label="the real reason" value="not yet revealed" valueColor={C.focus} />
    </Svg>
  );
}

export function RevealFrequentMeasurement({ t }: StepCtx) {
  return (
    <Svg label="checkpointing every round, measured directly on this sandbox's own cluster: far more full-page images, a far smaller live replay gap." h={200}>
      <Row y={70} label="checkpoint every round" value="many full-page images" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="checkpoint every round" value="a small replay gap" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function RevealInfrequentMeasurement({ t }: StepCtx) {
  return (
    <Svg label="the same workload, checkpointed once instead of ten times: far fewer full-page images, a far larger live replay gap." h={200}>
      <Row y={70} label="checkpoint once" value="far fewer full-page images" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="checkpoint once" value="a far larger replay gap" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function RevealRedoVsUndo({ t }: StepCtx) {
  return (
    <Svg label="Postgres redoes once; a row's own transaction status decides what's visible. ARIES also undoes the losers directly." h={200}>
      <Row y={70} label="Postgres" value="one pass: redo" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="ARIES" value="three passes: analysis, redo, undo" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function RevealSubstrate({ t }: StepCtx) {
  return (
    <Svg label="the same WAL and the same checkpoint-bounded recovery, pointed at three different jobs: stop early, ship continuously, or decode into rows." h={260}>
      <Row y={55} label="stop replay early" value="point-in-time recovery" o={easeOut(seg(t, 0, 0.4))} />
      <Row y={110} label="ship the same bytes" value="physical replication" o={easeOut(seg(t, 0.25, 0.65))} />
      <Row y={165} label="decode the same bytes" value="logical decoding, CDC" valueColor={C.focus} o={easeOut(seg(t, 0.5, 1))} />
    </Svg>
  );
}

export function Recap({ t }: StepCtx) {
  return (
    <Svg label="a checkpoint's own redo record, a real trade-off measured almost twenty times in one direction and seven in the other, and a redo-only recovery that needs no undo pass." h={260}>
      <Row y={50} label="the redo record" value="recovery's real starting point" o={easeOut(seg(t, 0, 0.3))} />
      <Row y={95} label="checkpoint frequency" value="a measured, real trade-off" o={easeOut(seg(t, 0.1, 0.4))} />
      <Row y={140} label="Postgres recovery" value="redo-only, measured by design" valueColor={C.focus} o={easeOut(seg(t, 0.25, 0.6))} />
      <Row y={185} label="this same WAL" value="reused three more times" o={easeOut(seg(t, 0.5, 0.85))} />
    </Svg>
  );
}

export function ProveIt({ t }: StepCtx) {
  return (
    <Svg label="a system claims instant crash recovery no matter how long it's been running, with no checkpoint mentioned — what would have to be true?" h={220}>
      <Row y={55} label="the claim" value="instant recovery, any uptime" o={easeOut(seg(t, 0, 0.4))} />
      <Row y={110} label="no stated bound" value="feels too good to check" valueColor={C.focus} o={easeOut(seg(t, 0.25, 0.65))} />
      <Row y={165} label="the real answer" value="some checkpoint-like bound, hidden" valueColor={C.focus} o={easeOut(seg(t, 0.55, 1))} />
    </Svg>
  );
}
