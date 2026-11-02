import { C, Svg, T } from '../../../../../reels/kit';
import { easeOut, seg } from '../../../../../reels/anim';
import type { StepCtx } from '../../../../../reels/types';

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
    <Svg label="a colleague's promise of a twelve-times reduction from Gorilla's encoder measures barely better than one on this plant's own data, with no bug in the code" h={200}>
      <Row y={70} label="promised ratio" value="twelve times" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="measured ratio" value="barely better" valueColor={C.badText} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function RevealGorillaEncoders({ t }: StepCtx) {
  return (
    <Svg label="Gorilla stores the delta of deltas between timestamps and the XOR between successive floats, and this topic's encoder reproduces the paper's own worked bit counts exactly" h={200}>
      <Row y={70} label="timestamps" value="delta of deltas" valueColor={C.second} o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="floats" value="XOR'd together" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function PredictSameEncoder({ t }: StepCtx) {
  return (
    <Svg label="the same Gorilla encoder runs on a noisy, frequently changing signal instead of a slow, regular one — does it still compress as well?" h={200}>
      <Row y={70} label="same encoder" value="new signal" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="same ratio" value="or not?" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function RevealThreeRegimes({ t }: StepCtx) {
  return (
    <Svg label="the same Gorilla encoder shrinks a slow, regular signal by far while barely helping a noisy, high-precision signal — the ratio is a property of the data" h={260}>
      <Row y={50} label="slow, regular" value="shrinks far" valueColor={C.focus} o={easeOut(seg(t, 0, 0.3))} />
      <Row y={95} label="noisy float" value="barely helps" valueColor={C.badText} o={easeOut(seg(t, 0.2, 0.5))} />
      <Row y={140} label="decimal signal" value="in between" valueColor={C.second} o={easeOut(seg(t, 0.4, 0.7))} />
      <Row y={190} label="the ratio" value="is the data" o={easeOut(seg(t, 0.65, 1))} />
    </Svg>
  );
}

export function RevealChimp({ t }: StepCtx) {
  return (
    <Svg label="Chimp spends fewer bits on a short trailing-zero run, and Chimp128's wider comparison against many earlier values wins specifically when a signal repeats" h={200}>
      <Row y={70} label="short runs" value="fewer bits" valueColor={C.second} o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="wider search" value="wins on repeats" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function RevealALP({ t }: StepCtx) {
  return (
    <Svg label="a decimal sensor reading's low bits are measurement noise to a bit-pattern codec; ALP encodes it as a small exact integer instead, and is DuckDB's own default float codec" h={200}>
      <Row y={70} label="low bits" value="just noise" valueColor={C.badText} o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="ALP" value="exact integer" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function RevealDictionaryRLE({ t }: StepCtx) {
  return (
    <Svg label="a dictionary plus run-length encoding collapses the repeated equipment and signal names to almost nothing, leaving the compressed size dominated by values" h={200}>
      <Row y={70} label="tag names" value="almost nothing" valueColor={C.focus} o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="compressed size" value="mostly values" o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function Recap({ t }: StepCtx) {
  return (
    <Svg label="delta-of-delta and XOR win on slow regular data, Chimp's wider search wins on repeating data, ALP wins on decimal data, and a lossy codec trades accuracy for a stated error band" h={260}>
      <Row y={50} label="delta, XOR" value="slow, regular" o={easeOut(seg(t, 0, 0.3))} />
      <Row y={95} label="wider search" value="repeating data" valueColor={C.second} o={easeOut(seg(t, 0.15, 0.45))} />
      <Row y={140} label="ALP" value="decimal data" valueColor={C.focus} o={easeOut(seg(t, 0.35, 0.65))} />
      <Row y={185} label="lossy codecs" value="stated error" valueColor={C.badText} o={easeOut(seg(t, 0.55, 0.85))} />
    </Svg>
  );
}

export function ProveIt({ t }: StepCtx) {
  return (
    <Svg label="a vendor claims one codec beats every other codec on every workload — should that claim survive contact with this plant's own data?" h={200}>
      <Row y={70} label="vendor claim" value="wins everywhere" o={easeOut(seg(t, 0, 0.4))} />
      <Row y={130} label="each codec" value="won, then lost" valueColor={C.badText} o={easeOut(seg(t, 0.25, 0.65))} />
    </Svg>
  );
}
