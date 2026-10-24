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
    <Svg label="arrow, pandas and polars all stayed in-process — does a real connection actually cost something?" h={200}>
      <Row y={70} label="in-process so far" value="claimed" o={easeOut(seg(t, 0, 0.6))} />
      <Row y={130} label="a real connection costs?" value="not yet measured" valueColor={C.focus} o={easeOut(seg(t, 0.4, 1))} />
    </Svg>
  );
}

export function RevealSetupCost({ t }: StepCtx) {
  return (
    <Svg label="a fresh connection vs. reusing one already open — measured on this sandbox's own cluster" h={200}>
      <Row y={70} label="fresh connect, each time" value="measurably slower" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="one connection, reused" value="far faster" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function RevealLittlesLaw({ t }: StepCtx) {
  return (
    <Svg label="a measured hold time, fed into one formula, gives a concrete pool size" h={220}>
      <Row y={55} label="measured hold time" value="real, not assumed" o={easeOut(seg(t, 0, 0.4))} />
      <Row y={110} label="target throughput" value="a chosen number" valueColor={C.focus} o={easeOut(seg(t, 0.25, 0.65))} />
      <Row y={165} label="pool size needed" value="the formula's answer" valueColor={C.focus} o={easeOut(seg(t, 0.55, 1))} />
    </Svg>
  );
}

export function PredictPreparedStatement({ t }: StepCtx) {
  return (
    <Svg label="the same client, prepares now, asks again later — does transaction pooling remember?" h={200}>
      <Row y={70} label="prepares now" value="one backend" />
      <Row y={130} label="asks again later" value="same backend?" valueColor={C.focus} />
    </Svg>
  );
}

export function RevealPreparedStatementCaveat({ t }: StepCtx) {
  return (
    <Svg label="prepared here, cleared by someone else, denied here — the exact failure, reproduced" h={220}>
      <Row y={55} label="client prepares" value="on one backend" o={easeOut(seg(t, 0, 0.4))} />
      <Row y={110} label="another client resets it" value="same shared backend" valueColor={C.focus} o={easeOut(seg(t, 0.25, 0.65))} />
      <Row y={165} label="client re-asks" value="statement gone" valueColor={C.focus} o={easeOut(seg(t, 0.55, 1))} />
    </Svg>
  );
}

export function RevealSessionPoolingSurvives({ t }: StepCtx) {
  return (
    <Svg label="the identical test, over session pooling instead — the statement survives" h={200}>
      <Row y={70} label="session pooling" value="one backend, whole session" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="same prepare, then run" value="always succeeds" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function RevealServerCursor({ t }: StepCtx) {
  return (
    <Svg label="the same large result, pulled whole vs. pulled in batches — measured peak memory" h={200}>
      <Row y={70} label="pulled whole" value="higher peak memory" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="pulled in batches" value="lower peak, measured" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function RevealBulkLoad({ t }: StepCtx) {
  return (
    <Svg label="the same rows, loaded three ways — row-by-row, a bulk-copy path, and an arrow-native driver" h={220}>
      <Row y={55} label="row-by-row" value="slowest, measured" o={easeOut(seg(t, 0, 0.4))} />
      <Row y={110} label="bulk-copy path" value="fastest, measured" valueColor={C.focus} o={easeOut(seg(t, 0.25, 0.65))} />
      <Row y={165} label="arrow-native driver" value="close behind, same path" o={easeOut(seg(t, 0.55, 1))} />
    </Svg>
  );
}

export function Recap({ t }: StepCtx) {
  return (
    <Svg label="a real setup cost, a formula for pool size, a reproduced caveat and its fix, and three measured bulk paths" h={260}>
      <Row y={50} label="setup cost" value="measured, not assumed" o={easeOut(seg(t, 0, 0.3))} />
      <Row y={95} label="pool size" value="measured hold time × rate" o={easeOut(seg(t, 0.1, 0.4))} />
      <Row y={140} label="prepared statement" value="caveat, reproduced" valueColor={C.focus} o={easeOut(seg(t, 0.25, 0.6))} />
      <Row y={185} label="cursor, bulk load" value="measured, both ways" o={easeOut(seg(t, 0.5, 0.85))} />
    </Svg>
  );
}

export function ProveIt({ t }: StepCtx) {
  return (
    <Svg label="a service pools in transaction mode and relies on a prepared statement surviving — what breaks, and why?" h={220}>
      <Row y={55} label="transaction pooling" value="backend not fixed" o={easeOut(seg(t, 0, 0.4))} />
      <Row y={110} label="prepared statement" value="assumed to survive" valueColor={C.focus} o={easeOut(seg(t, 0.25, 0.65))} />
      <Row y={165} label="the fix" value="tracking, or session mode" valueColor={C.focus} o={easeOut(seg(t, 0.55, 1))} />
    </Svg>
  );
}
