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

export function PartitionwiseHook({ t }: StepCtx) {
  return (
    <Svg label="same join, same answer, same memory setting — different plan shape" h={370}>
      {timeBar(30, 90, 4619.117 / 4619.117, '4619.117 ms, combined', 'partition-wise off', C.cherryText)}
      {timeBar(30, 210, 3684.680 / 4619.117, '3684.680 ms, per-partition', 'partition-wise on', C.focus)}
      {t > 2.4 && (
        <T x={300} y={330} s={15} f={C.latte} a="middle">
          same answer, same work_mem
        </T>
      )}
    </Svg>
  );
}

export function PredictWhyPartitionsHelp({ t }: StepCtx) {
  return (
    <Svg label="the same work, divided one way or divided another" h={200}>
      <Row y={70} label="one combined hash table" value="2,000,000 rows" valueColor={C.cherryText} />
      <Row y={130} label="four separate hash tables" value="500,000 rows each" valueColor={C.focus} />
    </Svg>
  );
}

export function RevealPlanShape({ t }: StepCtx) {
  return (
    <Svg label="1 Hash Join over everything, or 4 independent ones" h={240}>
      {t > 0 && (
        <T x={300} y={55} s={16} f={C.crema} a="middle">
          off: one Hash Join —
        </T>
      )}
      {t > 1 && (
        <T x={300} y={100} s={15} f={C.latte} a="middle">
          over an Append of every partition, both sides
        </T>
      )}
      {t > 2 && (
        <>
          <T x={300} y={150} s={15} f={C.focus} a="middle">
            on: an Append of 4 Hash Joins,
          </T>
          <T x={300} y={173} s={15} f={C.focus} a="middle">
            each over just its own matching pair
          </T>
        </>
      )}
    </Svg>
  );
}

export function HowPartitionwiseWorks({ t }: StepCtx) {
  return (
    <Svg label="same partition keys, same boundaries, on both sides" h={200}>
      <Row y={70} label="join condition covers" value="every partition key" />
      <Row y={130} label="both tables share" value="the same boundaries" valueColor={C.focus} />
    </Svg>
  );
}

export function RevealMemoryWin({ t }: StepCtx) {
  return (
    <Svg label="one hash table spills; four smaller ones don't" h={200}>
      <Row y={70} label="combined, 2,000,000 rows" value="spills to disk" valueColor={C.cherryText} />
      <Row y={130} label="per-partition, 500,000 rows" value="fits in memory" valueColor={C.focus} />
    </Svg>
  );
}

export function PredictAcrossMachines({ t }: StepCtx) {
  return (
    <Svg label="two tables, several machines, not aligned the same way" h={200}>
      <Row y={70} label="one machine" value="nothing to move" valueColor={C.focus} />
      <Row y={130} label="several machines" value="?" />
    </Svg>
  );
}

export function RevealExchangeOperators({ t }: StepCtx) {
  return (
    <Svg label="RemoteExchange: HASH or BROADCAST, named in the plan itself" h={200}>
      <Row y={70} label="HASH fragment" value="redistribute by key" />
      <Row y={130} label="BROADCAST fragment" value="send to every node" valueColor={C.focus} />
    </Svg>
  );
}

export function HowShuffleWorks({ t }: StepCtx) {
  return (
    <Svg label="both sides redistributed by the join key, across the network" h={240}>
      {t > 0 && (
        <T x={300} y={55} s={16} f={C.crema} a="middle">
          hash-redistribute both sides —
        </T>
      )}
      {t > 1 && (
        <T x={300} y={100} s={15} f={C.latte} a="middle">
          by the join key, across every node
        </T>
      )}
      {t > 2 && (
        <T x={300} y={150} s={15} f={C.focus} a="middle">
          rebuilding what partitions already had, for free
        </T>
      )}
    </Svg>
  );
}

export function HowBroadcastWorks({ t }: StepCtx) {
  return (
    <Svg label="copy the small side everywhere, move nothing else" h={200}>
      <Row y={70} label="the smaller side" value="copied to every node" valueColor={C.focus} />
      <Row y={130} label="the larger side" value="doesn't move at all" />
    </Svg>
  );
}

export function PredictBroadcastThreshold({ t }: StepCtx) {
  return (
    <Svg label="a broadcast side, growing past the engine's own limit" h={200}>
      <Row y={70} label="broadcast side, growing" value="past the limit" valueColor={C.cherryText} />
      <Row y={130} label="what the engine should do" value="?" />
    </Svg>
  );
}

export function RevealBroadcastThreshold({ t }: StepCtx) {
  return (
    <Svg label="10 MB default threshold — switchable, even at run time" h={200}>
      <Row y={70} label="Spark's default broadcast limit" value="10 MB" valueColor={C.focus} />
      <Row y={130} label="above it" value="switches to a shuffle join" />
    </Svg>
  );
}

export function CoLocatedJoins({ t }: StepCtx) {
  return (
    <Svg label="the same alignment, one machine's partitions or a cluster's nodes" h={240}>
      {t > 0 && (
        <T x={300} y={55} s={16} f={C.crema} a="middle">
          both already split the same way —
        </T>
      )}
      {t > 1 && (
        <T x={300} y={100} s={15} f={C.latte} a="middle">
          across partitions, or across nodes
        </T>
      )}
      {t > 2 && (
        <T x={300} y={150} s={15} f={C.focus} a="middle">
          the exchange step just disappears
        </T>
      )}
    </Svg>
  );
}

export function Recap({ t }: StepCtx) {
  const lines = [
    'matching partitions avoid redundant work on one machine',
    'across machines, an exchange moves data first',
    'shuffle moves both sides; broadcast copies one side',
    'the broadcast threshold is a real, switchable line',
  ];
  return (
    <Svg label="recap: partitions, exchanges, shuffle vs broadcast, the threshold" h={240}>
      {lines.map((l, i) => t > i * 0.6 && (
        <T key={l} x={300} y={55 + i * 42} s={14} f={i === lines.length - 1 ? C.focus : C.crema} a="middle">
          {l}
        </T>
      ))}
    </Svg>
  );
}

export function ProveExchangeType({ t }: StepCtx) {
  return (
    <Svg label="a plan fragment's exchange type reads HASH" h={200}>
      <Row y={70} label="exchange type" value="HASH" />
      <Row y={130} label="copy one side, or redistribute both?" value="?" />
    </Svg>
  );
}

export function ProveBroadcastDecision({ t }: StepCtx) {
  return (
    <Svg label="6 MB join side, 10 MB broadcast threshold" h={200}>
      <Row y={70} label="join side size" value="6 MB" />
      <Row y={130} label="broadcast threshold" value="10 MB" valueColor={C.focus} />
    </Svg>
  );
}
