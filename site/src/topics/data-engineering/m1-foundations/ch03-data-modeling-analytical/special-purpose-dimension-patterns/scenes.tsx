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
    <Svg label="degenerate, role-playing, junk, outrigger" h={240}>
      <Row y={55} label="degenerate" value="no table at all" />
      <Row y={115} label="role-playing" value="one table, two roles" />
      <Row y={175} label="junk, outrigger" value="collapsed; chained" />
    </Svg>
  );
}

export function RevealDegenerateQuote({ t }: StepCtx) {
  return (
    <Svg label="no content left, except the key itself" h={200}>
      <Row y={70} label="invoice number" value="no descriptive content" o={easeOut(seg(t, 0, 0.6))} />
      <Row y={130} label="still a valid" value="dimension key" valueColor={C.focus} o={easeOut(seg(t, 0.4, 1))} />
    </Svg>
  );
}

export function PredictDegenerateGrouping({ t }: StepCtx) {
  return (
    <Svg label="no dimension table behind it — groups correctly?" h={200}>
      <Row y={70} label="bare order number" value="no table behind it" />
      <Row y={130} label="group by it" value="still correct?" />
    </Svg>
  );
}

export function RevealDegenerateMeasured({ t }: StepCtx) {
  return (
    <Svg label="grouped by a bare key, correctly" h={200}>
      <Row y={70} label="two lines" value="shared one order number" o={easeOut(seg(t, 0, 0.6))} />
      <Row y={130} label="grouped correctly" value="no dimension table used" valueColor={C.focus} o={easeOut(seg(t, 0.4, 1))} />
    </Svg>
  );
}

export function RevealRolePlayingQuote({ t }: StepCtx) {
  return (
    <Svg label="one table, referenced more than once" h={200}>
      <Row y={70} label="one physical table" value="referenced twice" o={easeOut(seg(t, 0, 0.6))} />
      <Row y={130} label="each reference" value="its own logical role" valueColor={C.focus} o={easeOut(seg(t, 0.4, 1))} />
    </Svg>
  );
}

export function RevealRolePlayingMeasured({ t }: StepCtx) {
  return (
    <Svg label="one dim_date, joined twice, two distinct dates" h={200}>
      <Row y={70} label="one shared table" value="joined in two roles" o={easeOut(seg(t, 0, 0.6))} />
      <Row y={130} label="order date, ship date" value="both came back distinct" valueColor={C.focus} o={easeOut(seg(t, 0.4, 1))} />
    </Svg>
  );
}

export function RevealJunkQuote({ t }: StepCtx) {
  return (
    <Svg label="only the combinations that actually occur" h={200}>
      <Row y={70} label="low-card. flags" value="collapsed into one table" o={easeOut(seg(t, 0, 0.6))} />
      <Row y={130} label="stores only" value="combinations that occur" valueColor={C.focus} o={easeOut(seg(t, 0.4, 1))} />
    </Svg>
  );
}

export function RevealJunkMeasured({ t }: StepCtx) {
  return (
    <Svg label="three stored, against eight possible" h={200}>
      <Row y={70} label="three flags" value="eight possible combinations" o={easeOut(seg(t, 0, 0.6))} />
      <Row y={130} label="rows actually stored" value="far fewer than that" valueColor={C.focus} o={easeOut(seg(t, 0.4, 1))} />
    </Svg>
  );
}

export function PredictOutriggerCost({ t }: StepCtx) {
  return (
    <Svg label="a dimension pointing at a dimension — free?" h={200}>
      <Row y={70} label="outrigger" value="points at another dimension" />
      <Row y={130} label="any real cost" value="to query it?" />
    </Svg>
  );
}

export function RevealOutriggerQuote({ t }: StepCtx) {
  return (
    <Svg label="permissible, sparingly — demote instead" h={200}>
      <Row y={70} label="outrigger" value="a dimension on a dimension" o={easeOut(seg(t, 0, 0.6))} />
      <Row y={130} label="mostly" value="demote to the fact table" valueColor={C.focus} o={easeOut(seg(t, 0.4, 1))} />
    </Svg>
  );
}

export function RevealOutriggerMeasured({ t }: StepCtx) {
  return (
    <Svg label="an extra table touched, every single query" h={200}>
      <Row y={70} label="through the outrigger" value="three tables touched" valueColor={C.cherryText} o={easeOut(seg(t, 0, 0.6))} />
      <Row y={130} label="a flattened design" value="would need one fewer" valueColor={C.focus} o={easeOut(seg(t, 0.4, 1))} />
    </Svg>
  );
}

export function Recap({ t }: StepCtx) {
  return (
    <Svg label="four patterns, four honest costs" h={240}>
      <Row y={55} label="degenerate" value="groups fine, no attributes" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={115} label="role-playing" value="named roles; junk: real combos" o={easeOut(seg(t, 0.2, 0.7))} />
      <Row y={175} label="outrigger" value="works, but costs a join" o={easeOut(seg(t, 0.4, 0.9))} />
    </Svg>
  );
}

export function ProveTicketDates({ t }: StepCtx) {
  return (
    <Svg label="opened date, closed date — which pattern?" h={200}>
      <Row y={70} label="support ticket" value="opened date, closed date" />
      <Row y={130} label="which pattern" value="actually fits?" />
    </Svg>
  );
}
