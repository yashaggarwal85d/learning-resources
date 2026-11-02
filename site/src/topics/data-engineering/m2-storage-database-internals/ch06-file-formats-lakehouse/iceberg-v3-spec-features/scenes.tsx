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
    <Svg label="both delete mechanisms from the last topic are v2 features -- v3 is a whole version bump." h={200}>
      <TallRow y={40} label="v2 features" value="position and equality deletes" o={easeOut(seg(t, 0, 0.3))} />
      <TallRow y={100} label="this topic" value="v3 as one coherent version bump" valueColor={C.focus} o={easeOut(seg(t, 0.25, 0.65))} />
    </Svg>
  );
}

export function PredictWhatTiesThemTogether({ t }: StepCtx) {
  return (
    <Svg label="deletion vectors, row lineage, and variant were each taught separately. what ties them together?" h={200}>
      <TallRow y={40} label="taught separately, one at a time" value="deletion vectors, row lineage, variant" o={easeOut(seg(t, 0, 0.5))} />
      <TallRow y={100} label="what actually ties them together" value="as one single thing?" valueColor={C.focus} o={easeOut(seg(t, 0.4, 1))} />
    </Svg>
  );
}

export function RevealOneVersionBump({ t }: StepCtx) {
  return (
    <Svg label="they're all one coherent version bump: v3." h={230}>
      <TallRow y={40} label="already built, separately" value="deletion vectors, row lineage, variant" o={easeOut(seg(t, 0, 0.35))} />
      <TallRow y={100} label="all one thing" value="named together here: v3" valueColor={C.focus} o={easeOut(seg(t, 0.3, 0.7))} />
    </Svg>
  );
}

export function RevealFiveMoreFeatures({ t }: StepCtx) {
  return (
    <Svg label="v3 also adds geometry, geography, nanosecond timestamps, the unknown type, defaults, multi-argument transforms, encryption keys." h={230}>
      <TallRow y={40} label="v3 also adds" value="geometry, geography, nanosecond time" o={easeOut(seg(t, 0, 0.35))} />
      <TallRow y={100} label="and also" value="defaults, multi-argument, encryption keys" valueColor={C.focus} o={easeOut(seg(t, 0.3, 0.7))} />
    </Svg>
  );
}

export function PredictOldReaderMeetsDefault({ t }: StepCtx) {
  return (
    <Svg label="a v2-only reader opens a table with a required column filled by a v3 default. what happens?" h={200}>
      <TallRow y={40} label="a v2-only reader" value="opens a table with a v3 default value" o={easeOut(seg(t, 0, 0.5))} />
      <TallRow y={100} label="reads it right, gets it wrong, or fails?" value="which one?" valueColor={C.focus} o={easeOut(seg(t, 0.4, 1))} />
    </Svg>
  );
}

export function RevealDefaultFallbackMeasured({ t }: StepCtx) {
  return (
    <Svg label="reproduced for real: an optional default reads correctly even on a v2-format table." h={230}>
      <TallRow y={40} label="real measured result" value="old rows read the default correctly" o={easeOut(seg(t, 0, 0.35))} />
      <TallRow y={100} label="a required field's default" value="is the one case that fails outright" valueColor={C.focus} o={easeOut(seg(t, 0.3, 0.7))} />
    </Svg>
  );
}

export function RevealV3WriteBlocked({ t }: StepCtx) {
  return (
    <Svg label="reproduced for real: writing an actual v3 table fails outright, with this library's own real error." h={230}>
      <TallRow y={40} label="real measured result" value="creating a v3 table fails outright" o={easeOut(seg(t, 0, 0.35))} />
      <TallRow y={100} label="this library's own error" value="names a real, open issue" valueColor={C.focus} o={easeOut(seg(t, 0.3, 0.7))} />
    </Svg>
  );
}

export function RevealVendorSupportsThree({ t }: StepCtx) {
  return (
    <Svg label="a real, dated engine announcement lists exactly three v3 features as supported today." h={230}>
      <TallRow y={40} label="a real engine's own announcement" value="supports three v3 features today" o={easeOut(seg(t, 0, 0.35))} />
      <TallRow y={100} label="the other five" value="go unmentioned" valueColor={C.focus} o={easeOut(seg(t, 0.3, 0.7))} />
    </Svg>
  );
}

export function RevealEngineLagGates({ t }: StepCtx) {
  return (
    <Svg label="engine support lag, not the spec itself, is what actually gates adopting v3 today." h={230}>
      <TallRow y={40} label="not the spec" value="engine support lag" o={easeOut(seg(t, 0, 0.35))} />
      <TallRow y={100} label="is the real constraint" value="on adopting v3 today" valueColor={C.focus} o={easeOut(seg(t, 0.3, 0.7))} />
    </Svg>
  );
}

export function Recap({ t }: StepCtx) {
  return (
    <Svg label="v3 is one coherent version bump -- partly already built here, mostly still waiting on engines to catch up." h={300}>
      <TallRow y={35} label="v3 is a version bump" value="not a pile of unrelated features" o={easeOut(seg(t, 0, 0.3))} />
      <TallRow y={100} label="this sandbox" value="writes around it, not fully onto it" o={easeOut(seg(t, 0.1, 0.4))} />
      <TallRow y={165} label="the real gate" value="engine support, not the spec itself" valueColor={C.focus} o={easeOut(seg(t, 0.25, 0.6))} />
      <g opacity={easeOut(seg(t, 0.55, 1))}>
        <T x={25} y={230} s={14} f={C.latte}>
          the rule
        </T>
        <T x={25} y={256} s={16} f={C.focus} w={600}>
          column statistics are per-file;
        </T>
        <T x={25} y={280} s={16} f={C.focus} w={600}>
          next is whole-table statistics
        </T>
      </g>
    </Svg>
  );
}
