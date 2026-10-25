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
    <Svg label="a transfer, crashed mid-flight. Four letters promise something about this." h={200}>
      <Row y={70} label="account A" value="ten dollars, gone" o={easeOut(seg(t, 0, 0.6))} />
      <Row y={130} label="account B" value="never arrived" valueColor={C.focus} o={easeOut(seg(t, 0.4, 1))} />
    </Svg>
  );
}

export function RevealAtomicity({ t }: StepCtx) {
  return (
    <Svg label="a real transfer, a real CHECK constraint, a transaction that fails partway." h={200}>
      <Row y={70} label="before" value="(40, 60)" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="after" value="(40, 60) — unchanged" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function PredictConsistencyOwner({ t }: StepCtx) {
  return (
    <Svg label="the engine checks some rules. Who owns 'correct': the engine, or the application?" h={200}>
      <Row y={70} label="declared rules" value="the engine checks these" />
      <Row y={130} label="everything else" value="not yet revealed" valueColor={C.focus} />
    </Svg>
  );
}

export function RevealConsistencySplit({ t }: StepCtx) {
  return (
    <Svg label="a declared rule, blocked outright. An undeclared rule, never even seen." h={200}>
      <Row y={70} label="declared rule" value="blocked" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="undeclared rule" value="53 > 10, committed anyway" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function RevealIsolation({ t }: StepCtx) {
  return (
    <Svg label="the identical interleaving, measured under two real isolation levels." h={200}>
      <Row y={70} label="Read Committed" value="100, then 110" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="Repeatable Read" value="100, then 100" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function RevealDurability({ t }: StepCtx) {
  return (
    <Svg label="a commit, measured: the WAL moves, and a brand new connection sees it too." h={200}>
      <Row y={70} label="on commit" value="the WAL position advances" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="a fresh connection" value="reads the committed value" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function RevealTenYearGap({ t }: StepCtx) {
  return (
    <Svg label="the guarantees ran for a decade before the acronym existed." h={200}>
      <Row y={70} label="1973" value="IBM IMS, running" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="1983" value="the acronym, finally" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function Recap({ t }: StepCtx) {
  return (
    <Svg label="four letters, four promises — one of them split between two layers." h={260}>
      <Row y={50} label="atomicity" value="all or nothing" o={easeOut(seg(t, 0, 0.3))} />
      <Row y={95} label="isolation" value="as if alone" o={easeOut(seg(t, 0.15, 0.45))} />
      <Row y={140} label="durability" value="survives a crash" o={easeOut(seg(t, 0.25, 0.55))} />
      <Row y={185} label="consistency" value="split: engine and application" valueColor={C.focus} o={easeOut(seg(t, 0.4, 0.75))} />
    </Svg>
  );
}
