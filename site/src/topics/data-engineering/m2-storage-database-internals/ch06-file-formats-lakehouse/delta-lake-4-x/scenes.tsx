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
    <Svg label="everything so far is the protocol as it stands. this topic: the release that ships it, and the library that reads it." h={200}>
      <TallRow y={40} label="the delta arc so far" value="the protocol, as it stands" o={easeOut(seg(t, 0, 0.3))} />
      <TallRow y={100} label="this topic closes it" value="the release line, and delta kernel" valueColor={C.focus} o={easeOut(seg(t, 0.25, 0.65))} />
    </Svg>
  );
}

export function PredictSharedLibrary({ t }: StepCtx) {
  return (
    <Svg label="flink, trino, duckdb, this script all want to read delta. does each reimplement the protocol?" h={200}>
      <TallRow y={40} label="four different engines" value="all want to read delta" o={easeOut(seg(t, 0, 0.5))} />
      <TallRow y={100} label="each reimplements it, or" value="one shared library?" valueColor={C.focus} o={easeOut(seg(t, 0.4, 1))} />
    </Svg>
  );
}

export function RevealDeltaKernel({ t }: StepCtx) {
  return (
    <Svg label="delta kernel: a rust library that handles the protocol, so a connector doesn't have to. query-engine agnostic." h={230}>
      <TallRow y={40} label="delta kernel" value="handles the protocol for you" o={easeOut(seg(t, 0, 0.35))} />
      <TallRow y={100} label="query-engine agnostic" value="rust api, plus a c/c++ layer" valueColor={C.focus} o={easeOut(seg(t, 0.3, 0.7))} />
    </Svg>
  );
}

export function RevealDeltaRsRealTable({ t }: StepCtx) {
  return (
    <Svg label="delta-rs: a separate, real implementation, not a kernel connector. a real table, written and appended, no spark." h={230}>
      <TallRow y={40} label="delta-rs" value="separate from kernel, real on its own" o={easeOut(seg(t, 0, 0.35))} />
      <TallRow y={100} label="this script, right now" value="writes and appends a real table" valueColor={C.focus} o={easeOut(seg(t, 0.3, 0.7))} />
    </Svg>
  );
}

export function PredictTimeTravel({ t }: StepCtx) {
  return (
    <Svg label="the table has already moved to version one. can delta-rs still read version zero, alone?" h={200}>
      <TallRow y={40} label="table is already at version one" value="no spark, no catalog session" o={easeOut(seg(t, 0, 0.5))} />
      <TallRow y={100} label="can it still read version zero?" value="alone, with delta-rs only" valueColor={C.focus} o={easeOut(seg(t, 0.4, 1))} />
    </Svg>
  );
}

export function RevealTimeTravelReal({ t }: StepCtx) {
  return (
    <Svg label="yes, for real: a time-travel read by version number, delta-rs alone, no spark session anywhere." h={230}>
      <TallRow y={40} label="real time travel" value="version zero, read directly" o={easeOut(seg(t, 0, 0.35))} />
      <TallRow y={100} label="multi-version support" value="delta-rs alone, no spark" valueColor={C.focus} o={easeOut(seg(t, 0.3, 0.7))} />
    </Svg>
  );
}

export function RevealFeaturesEnabled({ t }: StepCtx) {
  return (
    <Svg label="one call enables deletion vectors and row tracking for real. the table's own protocol numbers jump." h={230}>
      <TallRow y={40} label="deletion vectors, row tracking" value="enabled with one real call" o={easeOut(seg(t, 0, 0.35))} />
      <TallRow y={100} label="protocol numbers" value="jump from one, two to three, seven" valueColor={C.focus} o={easeOut(seg(t, 0.3, 0.7))} />
    </Svg>
  );
}

export function RevealVariantFeature({ t }: StepCtx) {
  return (
    <Svg label="the same switch enables variant, back to topic eight. collations and geospatial land the same way, in kernel." h={230}>
      <TallRow y={40} label="variant type, same switch" value="connects back to topic eight" o={easeOut(seg(t, 0, 0.35))} />
      <TallRow y={100} label="collations, geospatial" value="both landed in kernel at four two" valueColor={C.focus} o={easeOut(seg(t, 0.3, 0.7))} />
    </Svg>
  );
}

export function RevealReleaseLinePrecise({ t }: StepCtx) {
  return (
    <Svg label="the 4.x line, precisely: spark compatibility, identity columns, type widening since four oh, and variant shredding -- still preview-named in 4.3." h={260}>
      <TallRow y={35} label="4.4 spark compatibility" value="4.0.1, 4.1.0, 4.2.0" o={easeOut(seg(t, 0, 0.3))} />
      <TallRow y={100} label="type widening" value="full support since 4.0" o={easeOut(seg(t, 0.1, 0.4))} />
      <TallRow y={165} label="variant shredding in 4.3" value="still named preview, not fully out" valueColor={C.focus} o={easeOut(seg(t, 0.25, 0.6))} />
    </Svg>
  );
}

export function Recap({ t }: StepCtx) {
  return (
    <Svg label="delta kernel is the shared library; delta-rs is a separate real one, used right here; the 4.x line's features are real and versioned." h={300}>
      <TallRow y={35} label="delta kernel" value="the shared, protocol-handling library" o={easeOut(seg(t, 0, 0.3))} />
      <TallRow y={100} label="delta-rs" value="separate, real, used right here" o={easeOut(seg(t, 0.1, 0.4))} />
      <TallRow y={165} label="the 4.x line" value="real, versioned, mostly kernel features" valueColor={C.focus} o={easeOut(seg(t, 0.25, 0.6))} />
      <g opacity={easeOut(seg(t, 0.55, 1))}>
        <T x={25} y={230} s={14} f={C.latte}>
          the handoff
        </T>
        <T x={25} y={256} s={16} f={C.focus} w={600}>
          iceberg and delta both exist as real,
        </T>
        <T x={25} y={280} s={16} f={C.focus} w={600}>
          full arcs now -- next: the catalog above them
        </T>
      </g>
    </Svg>
  );
}
