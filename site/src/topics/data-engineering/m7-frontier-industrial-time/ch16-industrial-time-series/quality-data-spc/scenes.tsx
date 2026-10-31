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
    <Svg label="a coating-thickness chart trips a run rule four times in a week — split by tool, it's two in-control machines, not one unstable one" h={200}>
      <Row y={70} label="the chart" value="trips, again" o={easeOut(seg(t, 0, 0.6))} />
      <Row y={130} label="split by tool" value="two in-control machines?" valueColor={C.focus} o={easeOut(seg(t, 0.4, 1))} />
    </Svg>
  );
}

export function RevealLimits({ t }: StepCtx) {
  return (
    <Svg label="control limits ask whether the process is stable; specification limits ask whether the product will work" h={200}>
      <Row y={70} label="control limits" value="is the process stable" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="spec limits" value="will the part work" valueColor={C.second} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function RevealInSpec({ t }: StepCtx) {
  return (
    <Svg label="one real coating measurement sits inside the process's own control band and outside the customer's spec limit, at the same time" h={200}>
      <Row y={70} label="in control" value="true" valueColor={C.focus} o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="in spec" value="false" valueColor={C.badText} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function PredictRules({ t }: StepCtx) {
  return (
    <Svg label="Western Electric's zone rules catch patterns a lone three-sigma check misses — does adding rules like these to a chart ever cost anything?" h={200}>
      <Row y={70} label="more zone rules" value="catch more drift" />
      <Row y={130} label="catch more, for free?" value="or at a cost?" valueColor={C.focus} />
    </Svg>
  );
}

export function RevealPrice({ t }: StepCtx) {
  return (
    <Svg label="simulated false-alarm gaps: about 371 points for the three-sigma rule alone, about 91.75 once the zone rules are added, matching NIST almost exactly" h={200}>
      <Row y={70} label="three-sigma alone" value="~371 points" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="with the zone rules" value="~91.75 points" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function RevealEighth({ t }: StepCtx) {
  return (
    <Svg label="NIST's 91.75 belongs to exactly three zone rules; adding the eighth consecutive-points rule shortens the measured false-alarm gap again, on top of that" h={220}>
      <Row y={55} label="rules one, two, three" value="~91.75 points" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={110} label="add the eighth rule" value="shorter again" valueColor={C.focus} o={easeOut(seg(t, 0.3, 0.8))} />
      <Row y={170} label="more caught" value="more false alarms" valueColor={C.badText} o={easeOut(seg(t, 0.6, 1))} />
    </Svg>
  );
}

export function RevealCpCpk({ t }: StepCtx) {
  return (
    <Svg label="two processes of identical spread: close Cp values, but the off-centre process's Cpk trails its own Cp by a real, measured margin" h={220}>
      <Row y={55} label="centred: Cp, Cpk" value="close together" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={110} label="off-centre: Cp" value="close to centred" valueColor={C.second} o={easeOut(seg(t, 0.3, 0.8))} />
      <Row y={170} label="off-centre: Cpk" value="trails its own Cp" valueColor={C.badText} o={easeOut(seg(t, 0.6, 1))} />
    </Svg>
  );
}

export function RevealStratify({ t }: StepCtx) {
  return (
    <Svg label="the mixed series trips several run rules; split by tool, each tool's own series trips far fewer — the same measurements, a different grouping" h={200}>
      <Row y={70} label="mixed, no tool column" value="trips several rules" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="split by tool" value="each stays in control" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function RevealCapa({ t }: StepCtx) {
  return (
    <Svg label="an inspection carries its recipe version, tool and shift; a non-conformance keys to the inspection; a CAPA keys to the non-conformance and starts unverified" h={260}>
      <Row y={50} label="inspection" value="measurement + context" o={easeOut(seg(t, 0, 0.3))} />
      <Row y={95} label="non-conformance" value="keyed to the inspection" o={easeOut(seg(t, 0.2, 0.55))} />
      <Row y={140} label="CAPA" value="keyed to the non-conformance" valueColor={C.second} o={easeOut(seg(t, 0.45, 0.8))} />
      <Row y={185} label="verified" value="false, until checked" valueColor={C.badText} o={easeOut(seg(t, 0.6, 1))} />
    </Svg>
  );
}

export function Recap({ t }: StepCtx) {
  return (
    <Svg label="control vs. spec limits, the measured WECO price matching NIST, the eighth rule's own cost, the Cp/Cpk centring trap, and a chart split in two by tool" h={260}>
      <Row y={50} label="control vs. spec" value="two different questions" o={easeOut(seg(t, 0, 0.3))} />
      <Row y={95} label="WECO's price" value="matches NIST" o={easeOut(seg(t, 0.1, 0.4))} />
      <Row y={140} label="the eighth rule" value="a further cost" valueColor={C.focus} o={easeOut(seg(t, 0.25, 0.6))} />
      <Row y={185} label="Cp high, Cpk low" value="a centring problem" valueColor={C.badText} o={easeOut(seg(t, 0.4, 0.75))} />
    </Svg>
  );
}

export function ProveIt({ t }: StepCtx) {
  return (
    <Svg label="a supervisor turns off the extra zone rules, keeping only the three-sigma check — does that make the three-sigma rule itself any less trustworthy?" h={200}>
      <Row y={70} label="zone rules, off" value="one rule left" o={easeOut(seg(t, 0, 0.4))} />
      <Row y={130} label="three-sigma rule" value="unchanged, either way" valueColor={C.focus} o={easeOut(seg(t, 0.25, 0.65))} />
    </Svg>
  );
}
