import { Bar, C, Svg, T } from '../../../../../reels/kit';
import type { StepCtx } from '../../../../../reels/types';

/** A label-left / value-right row, stacked vertically with generous gaps (DESIGN.md, phone text scaling). */
function Row({ y, label, value, valueColor = C.crema, big = false }: { y: number; label: string; value: string; valueColor?: string; big?: boolean }) {
  return (
    <g>
      <T x={25} y={y} s={15} f={C.latte}>
        {label}
      </T>
      <T x={575} y={y} s={big ? 22 : 17} f={valueColor} a="end" w={600}>
        {value}
      </T>
    </g>
  );
}

/** A label above a bar, with its display value below — safe for long labels. */
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
    <Svg label="same filter, same column back — one extra column indexed" h={370}>
      {timeBar(30, 90, 855 / 20809, '855 buffers', 'with INCLUDE', C.focus)}
      {timeBar(30, 210, 20809 / 20809, '20,809 buffers', 'without INCLUDE', C.cherryText)}
    </Svg>
  );
}

export function PredictWhyExtraColumn({ t }: StepCtx) {
  return (
    <Svg label="amount isn't filtered on — why index it?" h={200}>
      <Row y={70} label="filter column" value="status" />
      <Row y={130} label="selected column" value="amount — ?" />
    </Svg>
  );
}

export function RevealIncludeScan({ t }: StepCtx) {
  return (
    <Svg label="the index alone answers the whole query" h={200}>
      <Row y={70} label="plan" value="Index Only Scan" valueColor={C.focus} />
      <Row y={130} label="Heap Fetches" value="0" valueColor={C.focus} />
    </Svg>
  );
}

export function RevealVisibilityMap({ t }: StepCtx) {
  return (
    <Svg label="one bit per heap page makes the shortcut safe" h={200}>
      <Row y={70} label="visibility map bit" value="set = all visible" valueColor={C.focus} />
      <Row y={130} label="index-only scan" value="trusts that bit" />
    </Svg>
  );
}

export function PredictSurvivesUpdate({ t }: StepCtx) {
  return (
    <Svg label="UPDATE every matching row — same index" h={200}>
      <Row y={70} label="index structure" value="unchanged" />
      <Row y={130} label="index-only scan advantage" value="?" />
    </Svg>
  );
}

export function RevealHeapFetchesJump({ t }: StepCtx) {
  return (
    <Svg label="same index, same query — after the update" h={200}>
      <Row y={70} label="Heap Fetches, before" value="0" valueColor={C.focus} />
      <Row y={130} label="Heap Fetches, after" value="444,014" valueColor={C.cherryText} />
    </Svg>
  );
}

export function RevealVacuumRestores({ t }: StepCtx) {
  return (
    <Svg label="VACUUM — the index never moved" h={200}>
      <Row y={70} label="Heap Fetches, after VACUUM" value="0" valueColor={C.focus} />
      <Row y={130} label="the index itself" value="untouched" />
    </Svg>
  );
}

export function PredictHotSubset({ t }: StepCtx) {
  return (
    <Svg label="98% one value, 2% what queries search for" h={200}>
      <Row y={70} label="common value" value="98% of rows" />
      <Row y={130} label="rare, searched-for value" value="2% of rows" valueColor={C.focus} />
    </Svg>
  );
}

export function RevealPartialIndex({ t }: StepCtx) {
  return (
    <Svg label="indexing only the rare 2%" h={200}>
      <Row y={70} label="partial index" value="896 KB" valueColor={C.focus} />
      <Row y={130} label="full index, same column" value="43 MB" valueColor={C.cherryText} />
    </Svg>
  );
}

export function RevealPartialWriteSaving({ t }: StepCtx) {
  return (
    <Svg label="writes to the common 98% touch nothing here" h={200}>
      <Row y={70} label="write to the common 98%" value="nothing to update" valueColor={C.focus} />
      <Row y={130} label="write to the rare 2%" value="index updates" />
    </Svg>
  );
}

export function PredictExpressionMatch({ t }: StepCtx) {
  return (
    <Svg label="same value, two different expressions" h={200}>
      <Row y={70} label="indexed expression" value="a || ' ' || b" />
      <Row y={130} label="query expression" value="concat(a, ' ', b) — ?" />
    </Svg>
  );
}

export function RevealExpressionMismatch({ t }: StepCtx) {
  return (
    <Svg label="exact match vs. concat() instead of ||" h={200}>
      <Row y={70} label="exact expression" value="0.043 ms" valueColor={C.focus} />
      <Row y={130} label="concat() instead" value="399.183 ms" valueColor={C.cherryText} />
    </Svg>
  );
}

export function RevealSyntaxNotSemantics({ t }: StepCtx) {
  return (
    <Svg label="the planner matches text, not computed value" h={200}>
      <Row y={70} label="planner compares" value="the written expression" />
      <Row y={130} label="planner ignores" value="the resulting value" valueColor={C.cherryText} />
    </Svg>
  );
}

export function Recap({ t }: StepCtx) {
  const lines = [
    'INCLUDE makes an index-only scan possible',
    'the visibility map decides if it pays off',
    'a partial index shrinks size and write cost',
    'an expression index matches syntax, not meaning',
  ];
  return (
    <Svg label="recap: what an index needs to visit at all" h={240}>
      {lines.map((l, i) => t > i * 0.6 && (
        <T key={l} x={300} y={55 + i * 42} s={14} f={i === lines.length - 1 ? C.focus : C.crema} a="middle">
          {l}
        </T>
      ))}
    </Svg>
  );
}

export function ProveHeapFetchesChange({ t }: StepCtx) {
  return (
    <Svg label="Heap Fetches: 0 → 50,000 — did the index change?" h={200}>
      <Row y={70} label="Monday" value="Heap Fetches: 0" valueColor={C.focus} />
      <Row y={130} label="Friday, same index" value="Heap Fetches: 50,000" valueColor={C.cherryText} />
    </Svg>
  );
}
