import { Bar, C, Plot, Reticle, Svg, T } from '../../../../../reels/kit';
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

export function TwoTotals({ t }: StepCtx) {
  return (
    <Svg label="two totals, 23,837.70 and 1,697.40" h={220}>
      <Row y={70} label="written order, limit=1" value="23,837.70" valueColor={C.cherryText} big />
      <Row y={130} label="reordered, limit=20" value="1,697.40" valueColor={C.focus} big />
      {t > 2 && (
        <T x={300} y={185} s={15} f={C.latte} a="middle">
          same tables, same data
        </T>
      )}
    </Svg>
  );
}

export function PredictSeqScan({ t }: StepCtx) {
  return (
    <Svg label="orders: 46,484 pages, 2,400,000 rows" h={200}>
      <Row y={70} label="pages (pg_class.relpages)" value="46,484" />
      <Row y={130} label="rows (pg_class.reltuples)" value="2,400,000" />
    </Svg>
  );
}

export function RevealSeqScan({ t }: StepCtx) {
  return (
    <Svg label="46,484 x 1.0 + 2,400,000 x 0.01 = 70,484" h={260}>
      <Row y={60} label="46,484 pages x 1.0" value="46,484" />
      <Row y={110} label="2,400,000 rows x 0.01" value="24,000" />
      {t > 1.2 && (
        <>
          <T x={60} y={165} s={14} f={C.mocha}>
            ────────────
          </T>
          <Row y={210} label="total cost" value="70,484.00" valueColor={C.focus} big />
        </>
      )}
    </Svg>
  );
}

export function FiveConstants({ t }: StepCtx) {
  const rows: [string, string][] = [
    ['seq_page_cost', '1.0'],
    ['random_page_cost', '4.0'],
    ['cpu_tuple_cost', '0.01'],
    ['cpu_index_tuple_cost', '0.005'],
    ['cpu_operator_cost', '0.0025'],
  ];
  return (
    <Svg label="the five planner cost constants" h={260}>
      {rows.map(([label, value], i) => (t > i * 0.4 ? <Row key={label} y={40 + i * 42} label={label} value={value} /> : null))}
    </Svg>
  );
}

function logBar(x: number, y: number, value: number, display: string, maxLog: number, label: string) {
  const track = 230;
  const frac = Math.log10(value) / maxLog;
  return (
    <g key={label}>
      <T x={x - 5} y={y - 8} s={13} f={C.latte} a="end">
        {label}
      </T>
      <Bar x={x} y={y - 14} w={track * frac} h={20} full={track} fill={C.focus} />
      <T x={x + track + 10} y={y} s={13} f={C.crema}>
        {display}
      </T>
    </g>
  );
}

export function TreeCounts({ t }: StepCtx) {
  const maxLog = Math.log10(64_764_752_532_480_000);
  return (
    <Svg label="join-order tree counts, 8 to 14 tables" h={240}>
      {t > 0.2 && logBar(120, 60, 17_297_280, '17.3 million', maxLog, '8 tables')}
      {t > 1.0 && logBar(120, 120, 28_158_588_057_600, '28.2 trillion', maxLog, '12 tables')}
      {t > 1.8 && logBar(120, 180, 64_764_752_532_480_000, '64.8 quadrillion', maxLog, '14 tables')}
    </Svg>
  );
}

export function PredictCollapse({ t }: StepCtx) {
  const n = 9;
  const boxW = 50;
  const gap = 8;
  const totalW = n * boxW + (n - 1) * gap;
  const startX = 300 - totalW / 2;
  return (
    <Svg label="9 tables, filter on the last one, limit 8" h={200}>
      {Array.from({ length: n }).map((_, i) => {
        const x = startX + i * (boxW + gap);
        const isFiltered = i === n - 1;
        return (
          <g key={i}>
            <rect x={x} y={60} width={boxW} height={40} rx={4} fill={C.cocoa} stroke={isFiltered ? C.cherryText : C.mocha} strokeWidth={1.5} />
            <T x={x + boxW / 2} y={85} s={13} f={isFiltered ? C.cherryText : C.latte} a="middle">
              j{i + 1}
            </T>
          </g>
        );
      })}
      <T x={300} y={135} s={14} f={C.latte} a="middle">
        filter sits last, written order fixed
      </T>
      <T x={300} y={158} s={14} f={C.latte} a="middle">
        join_collapse_limit default: 8
      </T>
    </Svg>
  );
}

export function RevealCollapse({ t, answer }: StepCtx) {
  return (
    <Svg label="23,837.70 forced vs 1,697.40 free to reorder" h={240}>
      <Row y={60} label="limit=1, literal order" value="23,837.70" valueColor={C.cherryText} big />
      <Row y={120} label="limit=20, reordered" value="1,697.40" valueColor={C.focus} big />
      {t > 1.5 && (
        <>
          <T x={300} y={175} s={15} f={C.latte} a="middle">
            same query, same data —
          </T>
          <T x={300} y={198} s={15} f={C.latte} a="middle">
            14× apart on the collapse limit alone
          </T>
        </>
      )}
    </Svg>
  );
}

export function CollapseLimitMechanism({ t }: StepCtx) {
  return (
    <Svg label="from_collapse_limit and join_collapse_limit, default 8" h={220}>
      <Row y={60} label="from_collapse_limit (default)" value="8" />
      <Row y={110} label="join_collapse_limit (default)" value="8" />
      {t > 1 && (
        <>
          <T x={300} y={165} s={14} f={C.latte} a="middle">
            set join_collapse_limit = 1
          </T>
          <T x={300} y={188} s={14} f={C.latte} a="middle">
            to pin the order you wrote
          </T>
        </>
      )}
    </Svg>
  );
}

export function PredictGeqo({ t }: StepCtx) {
  const marks = [
    { n: 11, x: 150 },
    { n: 12, x: 300 },
    { n: 14, x: 480 },
  ];
  return (
    <Svg label="geqo_threshold = 12 FROM items" h={200}>
      <line x1={60} y1={100} x2={560} y2={100} stroke={C.mocha} strokeWidth={2} />
      {marks.map((m) => (
        <g key={m.n}>
          <circle cx={m.x} cy={100} r={5} fill={m.n >= 12 ? C.cherryText : C.focus} />
          <T x={m.x} y={128} s={14} f={C.latte} a="middle">
            {m.n} tables
          </T>
        </g>
      ))}
      <T x={300} y={60} s={14} f={C.latte} a="middle">
        geqo_threshold = 12
      </T>
    </Svg>
  );
}

export function RevealGeqo({ t }: StepCtx) {
  const pts: [number, number][] = [
    [90, 180],
    [180, 165],
    [330, 130],
    [400, 90],
    [470, 40],
  ];
  const labels = ['8: 36ms', '10: 224ms', '12: 1.74s', '13: 5.14s', '14: 36.1s'];
  return (
    <Svg label="planning time, 36ms to 36.1s, then GEQO at ~130ms" h={260}>
      <Plot pts={pts} t={t} start={0} base={200} labels={labels} fill={C.cherryText} />
      {t > 2.2 && (
        <T x={300} y={235} s={14} f={C.focus} a="middle">
          GEQO: 132ms / 125ms, same cost
        </T>
      )}
    </Svg>
  );
}

export function GeqoMechanism({ t }: StepCtx) {
  return (
    <Svg label="join orders as integer strings, bred and culled" h={240}>
      {t > 0 && (
        <T x={300} y={60} s={16} f={C.crema} a="middle">
          '4-1-3-2' = join order, one string
        </T>
      )}
      {t > 1 && (
        <T x={300} y={110} s={15} f={C.latte} a="middle">
          lower estimated cost = more fit
        </T>
      )}
      {t > 2 && (
        <>
          <T x={300} y={165} s={15} f={C.latte} a="middle">
            least fit discarded; new strings bred
          </T>
          <T x={300} y={188} s={15} f={C.latte} a="middle">
            from the fittest survivors
          </T>
        </>
      )}
    </Svg>
  );
}

export function InterestingOrders({ t }: StepCtx) {
  return (
    <Svg label="60,084.45 with a Sort node, 53.19 without" h={240}>
      <Row y={60} label="no index: scan + Sort" value="60,084.45" valueColor={C.cherryText} big />
      <Row y={120} label="indexed: scan already sorted" value="53.19" valueColor={C.focus} big />
      {t > 1.5 && (
        <>
          <T x={300} y={175} s={15} f={C.latte} a="middle">
            same query, same table —
          </T>
          <T x={300} y={198} s={15} f={C.latte} a="middle">
            the Sort step just isn't there anymore
          </T>
        </>
      )}
    </Svg>
  );
}

export function Recap({ t }: StepCtx) {
  const lines = ['what do the constants assume', 'about this hardware?', 'would a smaller limit have', 'blocked a better order?', 'is this past where GEQO', 'took over already?'];
  return (
    <Svg label="three questions before trusting a plan" h={260}>
      {lines.map((line, i) => (t > i * 0.5 ? (
        <T key={i} x={300} y={40 + i * 36} s={15} f={i % 2 === 0 ? C.crema : C.latte} a="middle">
          {line}
        </T>
      ) : null))}
    </Svg>
  );
}

export function ProveFormula({ t, answer }: StepCtx) {
  return (
    <Svg label="2,000 pages, 50,000 rows" h={200}>
      <Row y={70} label="pages" value="2,000" />
      <Row y={130} label="rows" value="50,000" />
      {answer !== null && (
        <T x={300} y={180} s={16} f={C.focus} a="middle">
          (2,000 × 1.0) + (50,000 × 0.01)
        </T>
      )}
    </Svg>
  );
}

export function ProveCollapse({ t, answer }: StepCtx) {
  return (
    <Svg label="7 tables, bad order, limit 8" h={200}>
      <Row y={70} label="FROM items" value="7" />
      <Row y={130} label="join_collapse_limit" value="8 (default)" />
      {answer !== null && (
        <T x={300} y={180} s={15} f={C.focus} a="middle">
          7 fits under 8 — the planner can reorder
        </T>
      )}
    </Svg>
  );
}
