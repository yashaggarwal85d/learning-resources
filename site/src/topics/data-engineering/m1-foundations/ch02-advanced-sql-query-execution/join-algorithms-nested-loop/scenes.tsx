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

export function TwoQueries({ t }: StepCtx) {
  return (
    <Svg label="9.681ms vs 383.6ms, same two tables" h={220}>
      <Row y={70} label="one customer's orders" value="9.681 ms" valueColor={C.focus} big />
      <Row y={130} label="every order, every customer" value="383.6 ms" valueColor={C.focus} big />
      {t > 2 && (
        <T x={300} y={185} s={15} f={C.latte} a="middle">
          same two tables, different algorithms
        </T>
      )}
    </Svg>
  );
}

export function PredictFiltered({ t }: StepCtx) {
  return (
    <Svg label="1 of 100,000 customers, orders2 indexed on customer_id" h={200}>
      <Row y={70} label="customers matching the filter" value="1 of 100,000" />
      <Row y={130} label="orders2.customer_id" value="indexed" valueColor={C.focus} />
    </Svg>
  );
}

export function RevealFiltered({ t }: StepCtx) {
  return (
    <Svg label="9.681ms nested loop vs 141.187ms forced hash join" h={240}>
      <Row y={60} label="default: Nested Loop" value="9.681 ms" valueColor={C.focus} big />
      <Row y={120} label="forced: Hash Join" value="141.187 ms" valueColor={C.cherryText} big />
      {t > 1.5 && (
        <T x={300} y={175} s={15} f={C.latte} a="middle">
          about 14.6× slower, same query, same data
        </T>
      )}
    </Svg>
  );
}

export function NestedLoopMechanism({ t }: StepCtx) {
  return (
    <Svg label="nested loop: outer drives an inner index lookup, once per row" h={220}>
      {t > 0 && (
        <T x={300} y={55} s={16} f={C.crema} a="middle">
          for each outer row —
        </T>
      )}
      {t > 1 && (
        <T x={300} y={100} s={15} f={C.latte} a="middle">
          run the inner scan again
        </T>
      )}
      {t > 2 && (
        <>
          <T x={300} y={150} s={15} f={C.focus} a="middle">
            an index on the inner side
          </T>
          <T x={300} y={173} s={15} f={C.focus} a="middle">
            turns that into one lookup
          </T>
        </>
      )}
    </Svg>
  );
}

export function HashJoinMechanism({ t }: StepCtx) {
  return (
    <Svg label="hash join: build a hash table on one side, probe with the other" h={220}>
      {t > 0 && (
        <T x={300} y={55} s={16} f={C.crema} a="middle">
          build: one side → hash table
        </T>
      )}
      {t > 1 && (
        <T x={300} y={100} s={15} f={C.latte} a="middle">
          probe: scan the other side once
        </T>
      )}
      {t > 2 && (
        <>
          <T x={300} y={150} s={15} f={C.latte} a="middle">
            needs an equality condition,
          </T>
          <T x={300} y={173} s={15} f={C.latte} a="middle">
            and the table has to fit (work_mem)
          </T>
        </>
      )}
    </Svg>
  );
}

export function PredictFull({ t }: StepCtx) {
  return (
    <Svg label="every row of orders2, no filter" h={200}>
      <Row y={70} label="orders2 rows joined" value="2,000,000" />
      <Row y={130} label="filter applied" value="none" valueColor={C.cherryText} />
    </Svg>
  );
}

export function RevealFull({ t }: StepCtx) {
  const maxMs = 543.876;
  return (
    <Svg label="hash 339.6-383.6ms, nested loop 431.269ms, merge join 543.876ms" h={370}>
      {t > 0.2 && timeBar(130, 60, 383.6 / maxMs, '339.6-383.6 ms', 'Hash Join (default)', C.focus)}
      {t > 1.0 && timeBar(130, 150, 431.269 / maxMs, '431.269 ms', 'Nested Loop (forced)', C.cherryText)}
      {t > 1.8 && timeBar(130, 240, 543.876 / maxMs, '543.876 ms', 'Merge Join (forced)', C.cherryText)}
      {t > 2.6 && (
        <>
          <T x={300} y={330} s={14} f={C.latte} a="middle">
            hash wins here — no sort to pay for,
          </T>
          <T x={300} y={352} s={14} f={C.latte} a="middle">
            no repeated inner scans
          </T>
        </>
      )}
    </Svg>
  );
}

export function MergeJoinMechanism({ t }: StepCtx) {
  return (
    <Svg label="merge join: both inputs already sorted on the join key" h={220}>
      {t > 0 && (
        <T x={300} y={55} s={16} f={C.crema} a="middle">
          both sides sorted on the join key —
        </T>
      )}
      {t > 1 && (
        <T x={300} y={100} s={15} f={C.latte} a="middle">
          by an index, or an explicit sort
        </T>
      )}
      {t > 2 && (
        <>
          <T x={300} y={150} s={15} f={C.latte} a="middle">
            no hash table, no repeated scans —
          </T>
          <T x={300} y={173} s={15} f={C.latte} a="middle">
            but someone has to pay for the sort
          </T>
        </>
      )}
    </Svg>
  );
}

export function DecisionFactors({ t }: StepCtx) {
  const rows: [string, string][] = [
    ['cardinality / selectivity', 'tiny outer + index → nested loop'],
    ['existing sort order', 'already sorted → merge join'],
    ['memory', 'hash table has to fit'],
    ['predicate type', 'hash & merge need equality'],
  ];
  return (
    <Svg label="four factors that decide the join algorithm" h={300}>
      {rows.map(([label, value], i) => {
        const y = 40 + i * 65;
        return t > i * 0.5 ? (
          <g key={label}>
            <T x={25} y={y} s={15} f={C.crema}>
              {label}
            </T>
            <T x={25} y={y + 24} s={14} f={C.latte}>
              {value}
            </T>
          </g>
        ) : null;
      })}
    </Svg>
  );
}

export function PredictWorkMem({ t }: StepCtx) {
  return (
    <Svg label="work_mem cut from 4MB default to 64kB, same forced hash join" h={200}>
      <Row y={70} label="work_mem (default)" value="4 MB" />
      <Row y={130} label="work_mem (reduced)" value="64 kB" valueColor={C.cherryText} />
    </Svg>
  );
}

export function RevealWorkMem({ t }: StepCtx) {
  return (
    <Svg label="1 batch at 383.577ms, 64 batches at 413.237ms" h={240}>
      <Row y={60} label="work_mem=4MB: 1 batch" value="383.577 ms" valueColor={C.focus} big />
      <Row y={120} label="work_mem=64kB: 64 batches" value="413.237 ms" valueColor={C.cherryText} big />
      {t > 1.5 && (
        <T x={300} y={175} s={15} f={C.latte} a="middle">
          about 7.7% slower — spilling, not a cliff
        </T>
      )}
    </Svg>
  );
}

export function WorkMemMechanism({ t }: StepCtx) {
  return (
    <Svg label="work_mem: the budget before a hash table spills to disk" h={220}>
      <Row y={60} label="work_mem (default)" value="4 MB" />
      {t > 1 && (
        <>
          <T x={300} y={110} s={14} f={C.latte} a="middle">
            too small to fit → spill to disk,
          </T>
          <T x={300} y={133} s={14} f={C.latte} a="middle">
            as more batches instead of one
          </T>
        </>
      )}
      {t > 2 && (
        <T x={300} y={180} s={14} f={C.second} a="middle">
          hash_mem_multiplier gives hash ops extra room
        </T>
      )}
    </Svg>
  );
}

export function PredictInequality({ t }: StepCtx) {
  return (
    <Svg label="a range predicate, enable_nestloop = off" h={200}>
      <Row y={70} label="join condition" value="a range, not equality" valueColor={C.cherryText} />
      <Row y={130} label="enable_nestloop" value="off" />
    </Svg>
  );
}

export function RevealInequality({ t }: StepCtx) {
  return (
    <Svg label="still a Nested Loop — the alternatives were priced near 1e10" h={240}>
      <Row y={60} label="plan chosen anyway" value="Nested Loop" valueColor={C.focus} big />
      <Row y={120} label="alternative paths priced at" value="~1e10" valueColor={C.cherryText} />
      {t > 1.5 && (
        <T x={300} y={175} s={15} f={C.latte} a="middle">
          discouraged, not disallowed — it can't be turned off
        </T>
      )}
    </Svg>
  );
}

export function Recap({ t }: StepCtx) {
  const lines = ['does one side have an index', 'the other side can drive into?', 'is either side already sorted', 'on the join key?', 'is this even an equality', 'condition at all?'];
  return (
    <Svg label="three questions before trusting a join algorithm" h={260}>
      {lines.map((line, i) => (t > i * 0.5 ? (
        <T key={i} x={300} y={40 + i * 36} s={15} f={i % 2 === 0 ? C.crema : C.latte} a="middle">
          {line}
        </T>
      ) : null))}
    </Svg>
  );
}

export function ProveFiltered({ t, answer }: StepCtx) {
  return (
    <Svg label="1 of a million rows, indexed join column" h={200}>
      <Row y={70} label="outer side rows" value="1" />
      <Row y={130} label="inner join column" value="indexed" />
      {answer !== null && (
        <T x={300} y={180} s={16} f={C.focus} a="middle">
          one outer row → one indexed lookup
        </T>
      )}
    </Svg>
  );
}

export function ProveBatches({ t, answer }: StepCtx) {
  return (
    <Svg label="EXPLAIN (ANALYZE) reports 12 batches" h={200}>
      <Row y={70} label="Hash Batches" value="12" />
      <Row y={130} label="hash table fit in work_mem?" value="no" valueColor={C.cherryText} />
      {answer !== null && (
        <T x={300} y={180} s={15} f={C.focus} a="middle">
          more than 1 batch = spilled to disk
        </T>
      )}
    </Svg>
  );
}
