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
    <Svg label="one backfill job takes production down, then dies with nothing saved" h={270}>
      <T x={300} y={50} s={14} f={C.taupe} a="middle" o={easeOut(seg(t, 0, 0.5))}>
        years of history, one single job
      </T>
      <T x={300} y={90} s={17} f={C.crema} a="middle" w={600} serif italic o={easeOut(seg(t, 0.15, 0.6))}>
        and it dies with nothing checkpointed
      </T>
      <Row y={150} label="the job" value="one long run" o={easeOut(seg(t, 0.35, 0.65))} />
      <Row y={195} label="finance" value="concurrency drops" valueColor={C.focus} o={easeOut(seg(t, 0.5, 0.8))} />
      <Row y={240} label="the crash" value="nothing saved" o={easeOut(seg(t, 0.65, 1))} />
    </Svg>
  );
}

export function Predict1({ t }: StepCtx) {
  return (
    <Svg label="what four decisions turn this into an unremarkable week?" h={210}>
      <Row y={75} label="bigger machine" value="dies the same" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={150} label="five decisions" value="fix five failures" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function RevealChunkGrid({ t }: StepCtx) {
  return (
    <Svg label="history cut into a grid of independent chunks; the backfill advances across it" h={240}>
      <Row y={55} label="history" value="cut into chunks" o={easeOut(seg(t, 0, 0.3))} />
      <Row y={105} label="each chunk" value="independent" o={easeOut(seg(t, 0.15, 0.45))} />
      <Row y={155} label="the backfill" value="one chunk only" valueColor={C.focus} o={easeOut(seg(t, 0.35, 0.65))} />
    </Svg>
  );
}

export function RevealCheckpointResume({ t }: StepCtx) {
  return (
    <Svg label="a crash mid-run; the checkpoint lets resume start right after it" h={210}>
      <Row y={75} label="the crash" value="stops one cell" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={150} label="resume" value="first incomplete chunk" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function RevealThrottleSignal({ t }: StepCtx) {
  return (
    <Svg label="a concurrency cap and a rate limit, both leaving headroom for production" h={210}>
      <Row y={75} label="concurrency" value="capped" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={150} label="the real question" value="which signal" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function RevealThrottleReacts({ t }: StepCtx) {
  return (
    <Svg label="latency rising pulls concurrency down; latency falling lets it recover" h={210}>
      <Row y={75} label="latency rises" value="concurrency drops" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={150} label="latency falls" value="concurrency recovers" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function RevealShadowSwap({ t }: StepCtx) {
  return (
    <Svg label="output fills a shadow table; one atomic swap promotes it to live" h={210}>
      <Row y={75} label="the shadow" value="fills quietly" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={150} label="promotion" value="one atomic swap" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function RevealDataDiff({ t }: StepCtx) {
  return (
    <Svg label="a diff panel compares shadow against live; only the intended rows differ" h={210}>
      <Row y={75} label="the diff" value="checked first" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={150} label="only" value="the intended change" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function Recap({ t }: StepCtx) {
  return (
    <Svg label="chunks, checkpoint, throttle, shadow-and-swap, and the diff gate, side by side" h={290}>
      <Row y={45} label="history" value="chunked, independent" o={easeOut(seg(t, 0, 0.3))} />
      <Row y={100} label="crash" value="resumes past it" o={easeOut(seg(t, 0.15, 0.45))} />
      <Row y={155} label="throttle" value="reacts to latency" valueColor={C.focus} o={easeOut(seg(t, 0.35, 0.65))} />
      <Row y={210} label="swap" value="diff-gated" o={easeOut(seg(t, 0.55, 0.85))} />
    </Svg>
  );
}

export function ProveIt({ t }: StepCtx) {
  return (
    <Svg label="a throttle disabled to go faster; latency already climbing" h={250}>
      <Row y={65} label="throttle off" value="latency climbing" o={easeOut(seg(t, 0, 0.4))} />
      <Row y={140} label="the fix" value="re-enable it now" valueColor={C.focus} o={easeOut(seg(t, 0.3, 0.7))} />
      <Row y={215} label="not" value="full speed" o={easeOut(seg(t, 0.55, 1))} />
    </Svg>
  );
}
