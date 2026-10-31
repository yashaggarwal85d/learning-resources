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
    <Svg label="a tiny bit array, far smaller than the set it describes, answers one question about a value it never stored" h={200}>
      <Row y={70} label="tiny array" value="far smaller" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="one answer" value="maybe present" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function PredictFalseNegative({ t }: StepCtx) {
  return (
    <Svg label="can the filter ever wrongly say a value is absent when it was actually added?" h={200}>
      <Row y={70} label="key was added" value="ever says absent?" />
      <Row y={130} label="key never added" value="ever says present?" valueColor={C.focus} />
    </Svg>
  );
}

export function RevealSamePositions({ t }: StepCtx) {
  return (
    <Svg label="the guarantee comes from using the exact same hash positions for insertion and lookup" h={200}>
      <Row y={70} label="insert" value="sets bit positions" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="lookup" value="checks same positions" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function RevealSizing({ t }: StepCtx) {
  return (
    <Svg label="sizing is a trade a target false-positive rate dictates: fewer bits per key, more false positives" h={200}>
      <Row y={70} label="fewer bits" value="more false positives" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="target rate" value="sets bit count" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function RevealMeasured({ t }: StepCtx) {
  return (
    <Svg label="a real filter, built and queried, with its measured false-positive rate checked against the formula's own predicted rate" h={200}>
      <Row y={70} label="predicted rate" value="from the formula" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="measured rate" value="matches closely" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function RevealCuckooDeletes({ t }: StepCtx) {
  return (
    <Svg label="a standard filter can never delete one item without rebuilding; a cuckoo filter removes a stored fingerprint directly" h={200}>
      <Row y={70} label="bloom filter" value="can't delete one" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="cuckoo filter" value="deletes a fingerprint" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function RevealXorRibbon({ t }: StepCtx) {
  return (
    <Svg label="xor and ribbon filters need the whole set known up front, trading that build cost for an even smaller footprint" h={200}>
      <Row y={70} label="xor filter" value="smaller, built once" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="ribbon filter" value="costs more build" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function Recap({ t }: StepCtx) {
  return (
    <Svg label="no false negatives ever, sizing driven by a target rate, cuckoo adds real deletes, xor and ribbon trade build cost for space" h={260}>
      <Row y={50} label="bloom filter" value="no false negatives" o={easeOut(seg(t, 0, 0.3))} />
      <Row y={95} label="sizing" value="target rate driven" o={easeOut(seg(t, 0.1, 0.4))} />
      <Row y={140} label="cuckoo" value="adds real deletes" valueColor={C.focus} o={easeOut(seg(t, 0.25, 0.6))} />
      <Row y={185} label="xor, ribbon" value="build cost traded" o={easeOut(seg(t, 0.5, 0.85))} />
    </Svg>
  );
}

export function ProveIt({ t }: StepCtx) {
  return (
    <Svg label="an existing per-file filter already skips files that can't hold a key — would switching it to a cuckoo filter help?" h={200}>
      <Row y={70} label="this system" value="never deletes filters" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="cuckoo filter" value="adds nothing here" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}
