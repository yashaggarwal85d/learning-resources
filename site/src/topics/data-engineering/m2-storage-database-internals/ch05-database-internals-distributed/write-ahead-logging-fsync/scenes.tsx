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
    <Svg label="a dirty page sitting in the buffer pool is lost the instant the process crashes, unless something records the write durably first. What's that something?" h={200}>
      <Row y={70} label="a dirty page" value="lost on crash" o={easeOut(seg(t, 0, 0.6))} />
      <Row y={130} label="something, first" value="not yet named" valueColor={C.focus} o={easeOut(seg(t, 0.4, 1))} />
    </Svg>
  );
}

export function RevealLsn({ t }: StepCtx) {
  return (
    <Svg label="a real write's own position in the log, read directly — what does it actually measure?" h={200}>
      <Row y={70} label="before a write" value="one log position" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="after a write" value="a position further on" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function RevealGroupCommit({ t }: StepCtx) {
  return (
    <Svg label="the log gets flushed before the data does — but does every single commit really pay for its own separate flush?" h={200}>
      <Row y={70} label="many real commits" value="far fewer real flushes" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="one flush" value="covers several at once" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function PredictTornPage({ t }: StepCtx) {
  return (
    <Svg label="a disk write happens in fixed-size physical chunks, not all at once — if power fails mid-write, is the result always either the whole page or none of it?" h={200}>
      <Row y={70} label="a page, mid-write" value="power fails" />
      <Row y={130} label="the result" value="all, or none?" valueColor={C.focus} />
    </Svg>
  );
}

export function RevealFullPageWrite({ t }: StepCtx) {
  return (
    <Svg label="a real page, changed twice after a real checkpoint — does the full defense against a torn page fire both times, or just the first?" h={200}>
      <Row y={70} label="first change" value="a full defense, fired" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="second change" value="no defense needed" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function RevealSyncMethod({ t }: StepCtx) {
  return (
    <Svg label="this sandbox's own cluster, read directly — which of three real system calls does it actually use to force the log out to disk?" h={200}>
      <Row y={70} label="three real options" value="named by the engine" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="this sandbox's setting" value="one specific answer" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function RevealInnodbDoublewrite({ t }: StepCtx) {
  return (
    <Svg label="a different engine's own documentation, on the identical torn-page problem — does it solve it the same way, or differently?" h={200}>
      <Row y={70} label="this engine" value="a full page, logged" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="a different engine" value="a safety copy, kept apart" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function RevealFsyncgate({ t }: StepCtx) {
  return (
    <Svg label="a failed attempt to force data out to disk turned out to be lying about having failed at all — what's the only safe response once that's discovered?" h={200}>
      <Row y={70} label="a failed attempt" value="silently lost, not retried" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="the only safe response" value="crash, then replay" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function Recap({ t }: StepCtx) {
  return (
    <Svg label="a real log position, a measured group-commit saving, a torn-page defense fired once per checkpoint, a chosen sync method, and the crash-don't-retry lesson" h={260}>
      <Row y={50} label="a log position" value="only ever moves forward" o={easeOut(seg(t, 0, 0.3))} />
      <Row y={95} label="group commit" value="fewer flushes, measured" o={easeOut(seg(t, 0.1, 0.4))} />
      <Row y={140} label="a torn page" value="defended once, measured" valueColor={C.focus} o={easeOut(seg(t, 0.25, 0.6))} />
      <Row y={185} label="a failed force-out" value="never safely retried" o={easeOut(seg(t, 0.5, 0.85))} />
    </Svg>
  );
}

export function ProveIt({ t }: StepCtx) {
  return (
    <Svg label="a monitoring script sees a force-out call fail once, logs a warning, and lets the process keep running rather than crashing it — is that safe?" h={220}>
      <Row y={55} label="a force-out call fails" value="once, observed" o={easeOut(seg(t, 0, 0.4))} />
      <Row y={110} label="log it and keep running" value="feels reasonable" valueColor={C.focus} o={easeOut(seg(t, 0.25, 0.65))} />
      <Row y={165} label="the only safe answer" value="crash and replay instead" valueColor={C.focus} o={easeOut(seg(t, 0.55, 1))} />
    </Svg>
  );
}
