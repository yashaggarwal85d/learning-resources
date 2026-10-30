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
    <Svg label="one renamed column. is the catalog's count right?" h={200}>
      <Row y={70} label="catalog says" value="a small handful" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="the real count" value="not yet revealed" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function Predict({ t }: StepCtx) {
  return (
    <Svg label="catalog, or graph. which number wins?" h={200}>
      <Row y={70} label="catalog's count" value="static, one-hop" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="the graph's count" value="not yet revealed" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function RevealTableLevel({ t }: StepCtx) {
  return (
    <Svg label="every downstream edge. far more than the catalog knew." h={200}>
      <Row y={70} label="catalog" value="a static few" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="table-level walk" value="many more found" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function RevealColumnLevel({ t }: StepCtx) {
  return (
    <Svg label="only where the column lands. named exclusions." h={200}>
      <Row y={70} label="table-level" value="counts every table" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="column-level" value="excludes named tables" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function RevealStalePropagation({ t }: StepCtx) {
  return (
    <Svg label="a failed partition. every downstream table, stale." h={200}>
      <Row y={70} label="blast radius" value="one column" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="stale propagation" value="the whole table" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function RevealNotification({ t }: StepCtx) {
  return (
    <Svg label="many tables, one message per owner." h={200}>
      <Row y={70} label="affected tables" value="eleven, total" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="notifications sent" value="one per owner" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function RevealDeprecationBlocked({ t }: StepCtx) {
  return (
    <Svg label="dependents still here. refused, naming who's missing." h={200}>
      <Row y={70} label="dependents remain" value="sign-offs missing" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="deprecation" value="blocked, named reason" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function RevealDeprecationCleared({ t }: StepCtx) {
  return (
    <Svg label="every owner signed off. it proceeds." h={200}>
      <Row y={70} label="every sign-off" value="now in hand" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="deprecation" value="proceeds cleanly" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function Recap({ t }: StepCtx) {
  return (
    <Svg label="catalog, table-level, column-level; stale; one notice; sign-off." h={260}>
      <Row y={50} label="catalog, table-level" value="under, or over" o={easeOut(seg(t, 0, 0.3))} />
      <Row y={95} label="column-level" value="named and precise" o={easeOut(seg(t, 0.15, 0.45))} />
      <Row y={140} label="stale, notice, sign-off" value="its own rule" valueColor={C.focus} o={easeOut(seg(t, 0.35, 0.7))} />
    </Svg>
  );
}

export function ProveIt({ t }: StepCtx) {
  return (
    <Svg label="a reader with no edge. will better coverage find it?" h={200}>
      <Row y={70} label="no edge exists" value="for any walk" o={easeOut(seg(t, 0, 0.4))} />
      <Row y={130} label="the answer" value="not yet revealed" valueColor={C.focus} o={easeOut(seg(t, 0.25, 0.65))} />
    </Svg>
  );
}
