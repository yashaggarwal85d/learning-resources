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

/** A label above a bar, with its display value below — safe for long labels (topic 21's looks-review fix). */
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

export function TwoAggregates({ t }: StepCtx) {
  return (
    <Svg label="100 groups, hash wins; 1,500,000 groups, hash is not the faster plan" h={220}>
      <Row y={70} label="100 groups" value="HashAggregate wins" valueColor={C.focus} />
      <Row y={130} label="1,500,000 groups" value="not HashAggregate" valueColor={C.cherryText} />
      {t > 2 && (
        <T x={300} y={185} s={15} f={C.latte} a="middle">
          same table, same row count, same shape of query
        </T>
      )}
    </Svg>
  );
}

export function PredictLowCard({ t }: StepCtx) {
  return (
    <Svg label="100 distinct groups out of 2,000,000 rows" h={200}>
      <Row y={70} label="distinct groups" value="100" />
      <Row y={130} label="total rows" value="2,000,000" />
    </Svg>
  );
}

export function RevealLowCard({ t }: StepCtx) {
  return (
    <Svg label="558.673ms hash vs 1174.777ms forced sort" h={240}>
      <Row y={60} label="default: HashAggregate" value="558.673 ms" valueColor={C.focus} big />
      <Row y={120} label="forced: sort, then group" value="1174.777 ms" valueColor={C.cherryText} big />
      {t > 1.5 && (
        <T x={300} y={175} s={15} f={C.latte} a="middle">
          about 2.1× slower, same table, same data
        </T>
      )}
    </Svg>
  );
}

export function HashAggMechanism({ t }: StepCtx) {
  return (
    <Svg label="one hash table entry per distinct group" h={220}>
      {t > 0 && (
        <T x={300} y={55} s={16} f={C.crema} a="middle">
          one scan, one hash table —
        </T>
      )}
      {t > 1 && (
        <T x={300} y={100} s={15} f={C.latte} a="middle">
          one entry per distinct group
        </T>
      )}
      {t > 2 && (
        <>
          <T x={300} y={150} s={15} f={C.focus} a="middle">
            cost scales with group count,
          </T>
          <T x={300} y={173} s={15} f={C.focus} a="middle">
            not with row count
          </T>
        </>
      )}
    </Svg>
  );
}

export function SortAggMechanism({ t }: StepCtx) {
  return (
    <Svg label="sort rows on the group key, then walk the sorted stream" h={220}>
      {t > 0 && (
        <T x={300} y={55} s={16} f={C.crema} a="middle">
          sort every row on the group key —
        </T>
      )}
      {t > 1 && (
        <T x={300} y={100} s={15} f={C.latte} a="middle">
          then walk the sorted stream
        </T>
      )}
      {t > 2 && (
        <>
          <T x={300} y={150} s={15} f={C.latte} a="middle">
            no hash table — but the sort</T>
          <T x={300} y={173} s={15} f={C.latte} a="middle">
            gets paid for no matter the group count
          </T>
        </>
      )}
    </Svg>
  );
}

export function PredictHighCard({ t }: StepCtx) {
  return (
    <Svg label="1,500,000 distinct groups out of 2,000,000 rows" h={200}>
      <Row y={70} label="distinct groups" value="1,500,000" valueColor={C.cherryText} />
      <Row y={130} label="total rows" value="2,000,000" />
    </Svg>
  );
}

export function RevealHighCard({ t }: StepCtx) {
  const maxMs = 2479.537;
  return (
    <Svg label="2479.537ms spilling hash (64 partitions, 321 batches) vs 1737.653ms forced sort" h={340}>
      {t > 0.2 && timeBar(130, 60, maxMs / maxMs, '2479.537 ms', 'HashAggregate (default, spills)', C.cherryText)}
      {t > 0.5 && (
        <T x={130} y={118} s={13} f={C.cherryText}>
          64 partitions, 321 batches
        </T>
      )}
      {t > 1.2 && timeBar(130, 180, 1737.653 / maxMs, '1737.653 ms', 'GroupAggregate (forced)', C.focus)}
      {t > 2.2 && (
        <>
          <T x={300} y={300} s={14} f={C.latte} a="middle">
            sort wins here — about 1.43× faster,
          </T>
          <T x={300} y={322} s={14} f={C.latte} a="middle">
            the opposite of the 100-group case
          </T>
        </>
      )}
    </Svg>
  );
}

export function CrossoverMechanism({ t }: StepCtx) {
  return (
    <Svg label="sort tracks rows; hash tracks groups under memory pressure" h={240}>
      <Row y={60} label="sort-based cost" value="tracks rows (fixed)" valueColor={C.latte} />
      <Row y={120} label="hash-based cost" value="tracks groups ÷ memory" valueColor={C.cherryText} />
      {t > 1.5 && (
        <T x={300} y={175} s={15} f={C.latte} a="middle">
          more groups: hash keeps paying, sort doesn't
        </T>
      )}
    </Svg>
  );
}

export function ParallelAggMechanism({ t }: StepCtx) {
  return (
    <Svg label="2 workers, partial aggregates merged by a finalize step" h={260}>
      {t > 0 && (
        <T x={300} y={50} s={15} f={C.latte} a="middle">
          worker 1 → partial hash table
        </T>
      )}
      {t > 0.6 && (
        <T x={300} y={78} s={15} f={C.latte} a="middle">
          worker 2 → partial hash table
        </T>
      )}
      {t > 1.4 && (
        <T x={300} y={120} s={16} f={C.crema} a="middle">
          leader merges both — Finalize Aggregate
        </T>
      )}
      {t > 2.2 && (
        <Row y={180} label="2 workers, 100 groups" value="260.757 ms" valueColor={C.focus} big />
      )}
    </Svg>
  );
}

export function PredictDistinct({ t }: StepCtx) {
  return (
    <Svg label="COUNT(DISTINCT low_card), no parallel workers" h={200}>
      <Row y={70} label="aggregate" value="COUNT(DISTINCT ...)" />
      <Row y={130} label="parallel aggregation" value="not supported" valueColor={C.cherryText} />
    </Svg>
  );
}

export function RevealDistinct({ t }: StepCtx) {
  return (
    <Svg label="a plain Aggregate over a Sort, 651.016ms" h={220}>
      <Row y={60} label="plan shape" value="Sort, then Aggregate" valueColor={C.focus} />
      <Row y={120} label="execution time" value="651.016 ms" valueColor={C.crema} big />
      {t > 1.5 && (
        <T x={300} y={175} s={15} f={C.latte} a="middle">
          no hash table anywhere in this plan
        </T>
      )}
    </Svg>
  );
}

export function DistinctMechanism({ t }: StepCtx) {
  return (
    <Svg label="DISTINCT needs rows deduplicated before the aggregate runs" h={220}>
      {t > 0 && (
        <T x={300} y={55} s={16} f={C.crema} a="middle">
          DISTINCT needs rows deduplicated —
        </T>
      )}
      {t > 1 && (
        <T x={300} y={100} s={15} f={C.latte} a="middle">
          before the aggregate runs at all
        </T>
      )}
      {t > 2 && (
        <>
          <T x={300} y={150} s={15} f={C.latte} a="middle">
            sorting does that for free —
          </T>
          <T x={300} y={173} s={15} f={C.latte} a="middle">
            the same role work_mem assigns sorts
          </T>
        </>
      )}
    </Svg>
  );
}

export function Recap({ t }: StepCtx) {
  const lines = ['how many groups, relative', 'to how many rows?', 'is the query running', 'in parallel at all?', 'does any aggregate carry', 'a DISTINCT?'];
  return (
    <Svg label="three questions before trusting an aggregate plan" h={260}>
      {lines.map((line, i) => (t > i * 0.5 ? (
        <T key={i} x={300} y={40 + i * 36} s={15} f={i % 2 === 0 ? C.crema : C.latte} a="middle">
          {line}
        </T>
      ) : null))}
    </Svg>
  );
}

export function ProveLowCard({ t, answer }: StepCtx) {
  return (
    <Svg label="10,000,000 rows, 20 distinct groups" h={200}>
      <Row y={70} label="total rows" value="10,000,000" />
      <Row y={130} label="distinct groups" value="20" />
      {answer !== null && (
        <T x={300} y={180} s={16} f={C.focus} a="middle">
          tiny hash table, no matter the row count
        </T>
      )}
    </Svg>
  );
}

export function ProveBatches({ t, answer }: StepCtx) {
  return (
    <Svg label="HashAggregate reports 9 batches" h={200}>
      <Row y={70} label="HashAggregate batches" value="9" />
      <Row y={130} label="hash table fit in memory?" value="no" valueColor={C.cherryText} />
      {answer !== null && (
        <T x={300} y={180} s={15} f={C.focus} a="middle">
          more than 1 batch = spilled to disk
        </T>
      )}
    </Svg>
  );
}
