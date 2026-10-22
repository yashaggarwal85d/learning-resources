import { Bar, C, Svg, T } from '../../../../../reels/kit';
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

function timeBar(x: number, y: number, frac: number, display: string, label: string, fill: string) {
  return (
    <g key={label}>
      <T x={x} y={y - 20} s={13} f={C.latte}>
        {label}
      </T>
      <Bar x={x} y={y} w={340 * frac} h={20} full={340} fill={fill} />
      <T x={x} y={y + 38} s={13} f={C.crema}>
        {display}
      </T>
    </g>
  );
}

export function Hook({ t }: StepCtx) {
  return (
    <Svg label="same data, two schemas: one update vs. several" h={370}>
      {timeBar(30, 90, 1 / 5, 'one row updated', 'normalized', C.focus)}
      {timeBar(30, 210, 5 / 5, 'five rows updated', 'denormalized', C.cherryText)}
    </Svg>
  );
}

export function PredictNormalizingCostsJoin({ t }: StepCtx) {
  return (
    <Svg label="does splitting always cost a join later" h={200}>
      <Row y={70} label="normalize" value="always a join cost?" />
      <Row y={130} label="depends on" value="?" />
    </Svg>
  );
}

export function RevealFunctionalDependency({ t }: StepCtx) {
  return (
    <Svg label="X determines Y: one X value, one Y value" h={200}>
      <Row y={70} label="order_id →" value="customer_id, amount" o={easeOut(seg(t, 0, 0.6))} />
      <Row y={130} label="customer_id →" value="customer_email" o={easeOut(seg(t, 0.4, 1))} />
    </Svg>
  );
}

export function RevealClosureComputation({ t }: StepCtx) {
  const stages: [string, string][] = [
    ['start', 'order_id'],
    ['fires order_id →', '+ customer_id, amount'],
    ['fires customer_id →', '+ customer_email'],
  ];
  return (
    <Svg label="each firing lights up new attributes" h={220}>
      {stages.map(([label, value], i) => (
        <Row key={label} y={55 + i * 60} label={label} value={value} o={easeOut(seg(t, i * 0.25, i * 0.25 + 0.6))} />
      ))}
    </Svg>
  );
}

export function RevealCandidateKey({ t }: StepCtx) {
  return (
    <Svg label="order_id's closure reaches everything" h={200}>
      <Row y={70} label="order_id's closure" value="every attribute" o={easeOut(seg(t, 0, 0.6))} />
      <Row y={130} label="candidate key" value="order_id alone" valueColor={C.focus} o={easeOut(seg(t, 0.4, 1))} />
    </Svg>
  );
}

export function PredictCustomerIdKey({ t }: StepCtx) {
  return (
    <Svg label="does customer_id qualify too" h={200}>
      <Row y={70} label="customer_id →" value="customer_email" />
      <Row y={130} label="a candidate key too" value="?" />
    </Svg>
  );
}

export function RevealWhyNotCandidateKey({ t }: StepCtx) {
  return (
    <Svg label="its closure stops short of the whole relation" h={200}>
      <Row y={70} label="its closure" value="just itself, customer_email" o={easeOut(seg(t, 0, 0.6))} />
      <Row y={130} label="never reaches" value="order_id, amount" valueColor={C.cherryText} o={easeOut(seg(t, 0.4, 1))} />
    </Svg>
  );
}

export function RevealFirstToThird({ t }: StepCtx) {
  const rows: [string, string][] = [
    ['first', 'atomic values, no repeats'],
    ['second', 'depends on the whole key'],
    ['third', 'no transitive dependence'],
  ];
  return (
    <Svg label="each form adds one more guarantee" h={240}>
      {rows.map(([label, value], i) => (
        <Row key={label} y={60 + i * 65} label={label} value={value} o={easeOut(seg(t, i * 0.25, i * 0.25 + 0.6))} />
      ))}
    </Svg>
  );
}

export function RevealBCNF({ t }: StepCtx) {
  return (
    <Svg label="every determinant must be a full candidate key" h={200}>
      <Row y={70} label="third form allows" value="a weak determinant" o={easeOut(seg(t, 0, 0.6))} />
      <Row y={130} label="stricter form needs" value="determinant is a key" valueColor={C.focus} o={easeOut(seg(t, 0.4, 1))} />
    </Svg>
  );
}

export function RevealFourthNormalForm({ t }: StepCtx) {
  return (
    <Svg label="one value, many facts, not one" h={200}>
      <Row y={70} label="functional dependency" value="one value → one value" o={easeOut(seg(t, 0, 0.6))} />
      <Row y={130} label="multivalued dependency" value="one value → many facts" valueColor={C.second} o={easeOut(seg(t, 0.4, 1))} />
    </Svg>
  );
}

export function RevealLosslessDecomposition({ t }: StepCtx) {
  return (
    <Svg label="split on a real dependency, join back loses nothing" h={200}>
      <Row y={70} label="split on a real FD" value="joined back exactly" o={easeOut(seg(t, 0, 0.6))} />
      <Row y={130} label="every decomposition" value="must clear this first" o={easeOut(seg(t, 0.4, 1))} />
    </Svg>
  );
}

export function RevealDependencyPreservation({ t }: StepCtx) {
  return (
    <Svg label="lossless and dependency-preserving are separate" h={200}>
      <Row y={70} label="lossless" value="never optional" o={easeOut(seg(t, 0, 0.6))} />
      <Row y={130} label="dependency-preserving" value="sometimes sacrificed" valueColor={C.cherryText} o={easeOut(seg(t, 0.4, 1))} />
    </Svg>
  );
}

export function RevealMeasuredAnomaly({ t }: StepCtx) {
  return (
    <Svg label="one update vs. several, then a real inconsistency" h={370}>
      {timeBar(30, 90, 1 / 5, 'one row updated', 'normalized', C.focus)}
      {timeBar(30, 210, 5 / 5, 'five rows, two emails on file', 'denormalized, missed a row', C.cherryText)}
    </Svg>
  );
}

export function RevealDenormalizationTrade({ t }: StepCtx) {
  return (
    <Svg label="a trade made on purpose, not a mistake" h={200}>
      <Row y={70} label="scan-heavy workload" value="pays for joins every row" o={easeOut(seg(t, 0, 0.6))} />
      <Row y={130} label="denormalize on purpose" value="fewer joins, more risk" valueColor={C.second} o={easeOut(seg(t, 0.4, 1))} />
    </Svg>
  );
}

export function Recap({ t }: StepCtx) {
  return (
    <Svg label="FD, closure, key; four rungs; two separate guarantees" h={240}>
      <Row y={55} label="FD, closure, key" value="one value at a time" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={115} label="four rungs" value="each adds one guarantee" o={easeOut(seg(t, 0.2, 0.7))} />
      <Row y={175} label="lossless" value="mandatory, unlike preserving" o={easeOut(seg(t, 0.4, 0.9))} />
    </Svg>
  );
}

export function ProveCandidateKey({ t }: StepCtx) {
  return (
    <Svg label="order_id determines everything directly" h={200}>
      <Row y={70} label="order_id →" value="every other attribute" />
      <Row y={130} label="the candidate key is" value="?" />
    </Svg>
  );
}
