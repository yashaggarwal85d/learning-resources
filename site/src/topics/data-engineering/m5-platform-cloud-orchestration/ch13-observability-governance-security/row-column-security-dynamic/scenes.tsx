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
    <Svg label="email is masked for analysts, and an analyst still recovers addresses. Which path leaked?" h={200}>
      <Row y={70} label="masked column query" value="covered" o={easeOut(seg(t, 0, 0.6))} />
      <Row y={130} label="derived table, raw file" value="covered or not?" valueColor={C.focus} o={easeOut(seg(t, 0.4, 1))} />
    </Svg>
  );
}

export function RevealEngineVsApp({ t }: StepCtx) {
  return (
    <Svg label="engine policy: every query. Application filter: only requests through that app" h={200}>
      <Row y={70} label="application filter" value="one path only" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="engine policy" value="every query, always" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function PredictBeforePolicy({ t }: StepCtx) {
  return (
    <Svg label="query as the restricted role, before any row policy exists. How many rows?" h={200}>
      <Row y={70} label="restricted role, no policy" value="3,000 rows exist" />
      <Row y={130} label="rows returned?" value="not yet revealed" valueColor={C.focus} />
    </Svg>
  );
}

export function RevealBeforePolicy({ t }: StepCtx) {
  return (
    <Svg label="measured: all 3,000 rows, nothing stops the query yet" h={200}>
      <Row y={70} label="no policy applied" value="query runs plain" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="rows returned" value="all 3,000, measured" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function ElaboratePolicyExpression({ t }: StepCtx) {
  return (
    <Svg label="a row policy is an expression, evaluated before the user's own query conditions" h={200}>
      <Row y={70} label="policy expression" value="evaluated per row" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="before" value="the user's own WHERE" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function PredictAfterPolicy({ t }: StepCtx) {
  return (
    <Svg label="same query, same role, after the policy. How many rows now?" h={200}>
      <Row y={70} label="policy: region = us" value="1,000 of 3,000 match" />
      <Row y={130} label="rows returned?" value="not yet revealed" valueColor={C.focus} />
    </Svg>
  );
}

export function RevealAfterPolicy({ t }: StepCtx) {
  return (
    <Svg label="measured: exactly 1,000 rows -- the policy, not the query, decided" h={200}>
      <Row y={70} label="same query" value="no change to it" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="rows returned" value="1,000, measured" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function ElaboratePlanChanges({ t }: StepCtx) {
  return (
    <Svg label="EXPLAIN: no Filter node before the policy, an explicit one after it" h={200}>
      <Row y={70} label="before policy" value="no Filter node" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="after policy" value="Filter node appears" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function RevealBypassPaths({ t }: StepCtx) {
  return (
    <Svg label="a superuser bypasses the policy; so does anyone reading the file directly" h={200}>
      <Row y={70} label="superuser bypass" value="all 3,000, measured" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="direct file read" value="same bypass" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function Recap({ t }: StepCtx) {
  return (
    <Svg label="engine policies cover every query; they don't cover a bypass around the engine" h={280}>
      <Row y={50} label="engine policy" value="every query, measured" o={easeOut(seg(t, 0, 0.3))} />
      <Row y={100} label="plan cost" value="rises, measured" o={easeOut(seg(t, 0.15, 0.45))} />
      <Row y={150} label="bypass paths" value="untouched by the policy" valueColor={C.focus} o={easeOut(seg(t, 0.4, 0.75))} />
    </Svg>
  );
}
