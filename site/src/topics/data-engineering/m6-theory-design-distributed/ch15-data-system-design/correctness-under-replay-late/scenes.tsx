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
    <Svg label="the nightly job re-runs to fix a bug — last Tuesday's revenue changes by a small fraction, though nobody touched the data" h={270}>
      <T x={300} y={50} s={14} f={C.taupe} a="middle" o={easeOut(seg(t, 0, 0.5))}>
        same input, same fix
      </T>
      <T x={300} y={90} s={17} f={C.crema} a="middle" w={600} serif italic o={easeOut(seg(t, 0.15, 0.6))}>
        two runs, two different revenue numbers
      </T>
      <Row y={150} label="run one" value="one revenue figure" o={easeOut(seg(t, 0.35, 0.65))} />
      <Row y={195} label="run two, re-run" value="a different figure" valueColor={C.focus} o={easeOut(seg(t, 0.5, 0.8))} />
      <Row y={240} label="the input" value="confirmed, unchanged" o={easeOut(seg(t, 0.65, 1))} />
    </Svg>
  );
}

export function Predict1({ t }: StepCtx) {
  return (
    <Svg label="which hidden non-determinism did the run actually depend on?" h={210}>
      <Row y={75} label="the data changed" value="confirmed, it didn't" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={150} label="hidden non-determinism" value="time, order, or sample" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function RevealDeterministicIdempotent({ t }: StepCtx) {
  return (
    <Svg label="deterministic output from input alone, idempotent writes that don't change on repeat — together, a trustworthy re-run" h={210}>
      <Row y={75} label="deterministic" value="same input, same output" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={150} label="idempotent" value="write twice, same result" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function RevealReplayedTwice({ t }: StepCtx) {
  return (
    <Svg label="a deterministic, idempotent pipeline replayed lands identical bars — a hidden now() lands a different one, counted" h={210}>
      <Row y={75} label="fixed pipeline" value="two identical bars" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={150} label="hidden now()" value="a different bar, red" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function RevealWatermarkLateEvents({ t }: StepCtx) {
  return (
    <Svg label="the watermark asserts input is complete up to here — events behind it arrive late" h={210}>
      <Row y={75} label="the watermark" value="a moving line" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={150} label="late events" value="trail behind it" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function RevealCorrectionWindow({ t }: StepCtx) {
  return (
    <Svg label="a late event either vanishes, dropped, or lands in a correction window and amends the published result" h={210}>
      <Row y={75} label="no window" value="dropped, lost" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={150} label="correction window" value="amended, v1 to v2" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function RevealWindowSizing({ t }: StepCtx) {
  return (
    <Svg label="a stated late-data rate sets how wide the window must be — a real cost in state and in visible change" h={210}>
      <Row y={75} label="late-data rate" value="sets window width" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={150} label="wider window" value="more state, more cost" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function RevealVersionedOutputs({ t }: StepCtx) {
  return (
    <Svg label="every published result carries the version of logic and data that produced it — a correction appends, never overwrites" h={210}>
      <Row y={75} label="each version" value="a new append" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={150} label="a consumer, auditor" value="pin it, reconstruct it" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function Recap({ t }: StepCtx) {
  return (
    <Svg label="deterministic and idempotent for trustworthy replay, the watermark and correction window for late data, versioned outputs tying it together" h={290}>
      <Row y={45} label="replay" value="deterministic, idempotent" o={easeOut(seg(t, 0, 0.3))} />
      <Row y={100} label="late events" value="watermark, then window" o={easeOut(seg(t, 0.15, 0.45))} />
      <Row y={155} label="corrections" value="amend, never drop" valueColor={C.focus} o={easeOut(seg(t, 0.35, 0.65))} />
      <Row y={210} label="outputs" value="versioned, pinnable" o={easeOut(seg(t, 0.55, 0.85))} />
    </Svg>
  );
}

export function ProveIt({ t }: StepCtx) {
  return (
    <Svg label="the pipeline also sends an email receipt — does a deterministic, idempotent pipeline make that side effect safe to replay too?" h={250}>
      <Row y={65} label="an email receipt" value="an external effect" o={easeOut(seg(t, 0, 0.4))} />
      <Row y={140} label="pipeline's own safety" value="doesn't reach outside" valueColor={C.focus} o={easeOut(seg(t, 0.3, 0.7))} />
      <Row y={215} label="the fix" value="the effect needs its own key" o={easeOut(seg(t, 0.55, 1))} />
    </Svg>
  );
}
