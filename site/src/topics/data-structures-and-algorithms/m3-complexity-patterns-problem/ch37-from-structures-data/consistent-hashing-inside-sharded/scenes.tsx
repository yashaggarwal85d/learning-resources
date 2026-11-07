import type { StepCtx } from '../../../../../reels/types';
import { easeOut, seg } from '../../../../../reels/anim';
import { C, Svg, T, Bar } from '../../../../../reels/kit';

// Colour grammar (CHAPTER.md, chapter 37): crema = the textbook structure as drawn earlier, and
// data in memory; latte = secondary labels; taupe = data on disk, not yet read back; caramel =
// the thing to look at; cinnamon (rare) = the system's modification set against the textbook;
// cherry/cherryText = the bad outcome.

// 1 · Hook: three schemes, one hot key none of them notices
export function GrowthHook({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.1, 1.2));
  const b = easeOut(seg(t, 1.3, 2.5));
  return (
    <Svg label="Three placement schemes, one hot key none of them notices" h={250}>
      <g opacity={a}>
        <T x={300} y={70} s={13} a="middle" f={C.crema}>ten nodes become eleven</T>
        <T x={300} y={98} s={12} a="middle" f={C.latte}>ring, slot table, modulo: each moves a different share</T>
      </g>
      <T x={300} y={160} s={13} a="middle" f={C.caramel} o={b}>does a thousand points per node help one hot key?</T>
    </Svg>
  );
}

// 2 · Three real choices, named together
export function ThreeChoices({ t }: StepCtx) {
  const names = ['Cassandra: token ring', 'Redis Cluster: slot table', 'Kafka: modulo hashing'];
  const shown = Math.min(names.length, Math.floor(seg(t, 0.2, 2.2) * names.length) + 1);
  return (
    <Svg label="Three systems, three different answers to the same placement question" h={230}>
      <T x={300} y={55} s={12} a="middle" f={C.latte}>which machine owns this key?</T>
      {names.slice(0, shown).map((n, i) => (
        <T key={n} x={300} y={105 + i * 32} s={13} a="middle" f={C.crema}>{n}</T>
      ))}
    </Svg>
  );
}

// 3 · Cassandra: token ring, named directly, with virtual nodes
export function CassandraRing({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.1, 1.2));
  const b = easeOut(seg(t, 1.3, 2.3));
  return (
    <Svg label="Cassandra names its own mechanism: consistent hashing using a token ring" h={240}>
      <g opacity={a}>
        <T x={300} y={80} s={13} a="middle" f={C.crema}>consistent hashing using a token ring</T>
      </g>
      <T x={300} y={135} s={13} a="middle" f={C.caramel} o={b}>virtual nodes: several tokens per physical node</T>
      <T x={300} y={163} s={11} a="middle" f={C.latte} o={b}>fixes a small cluster's imbalance under one token each</T>
    </Svg>
  );
}

// 4 · Redis Cluster: fixed slot table, not a ring
export function RedisSlotTable({ t }: StepCtx) {
  const slots = [0, 1, 2, 3, 4, 5, 6, 7];
  const shown = Math.min(slots.length, Math.floor(seg(t, 0.3, 2.2) * slots.length) + 1);
  return (
    <Svg label="Redis Cluster: a fixed table of slots, not a ring" h={260}>
      <T x={300} y={55} s={12} a="middle" f={C.latte}>a fixed table of slots</T>
      {slots.slice(0, shown).map((i) => (
        <Bar key={i} x={70 + i * 62} y={90} w={48} h={30} full={1} fill={i < 4 ? C.crema : C.cinnamon} />
      ))}
      <T x={300} y={155} s={12} a="middle" f={C.caramel} o={shown >= slots.length ? 1 : 0}>a key's slot: a hash of the key, modulo the slot count</T>
      <T x={300} y={183} s={11} a="middle" f={C.latte} o={shown >= slots.length ? 1 : 0}>each master owns a subset of slots, not a range</T>
    </Svg>
  );
}

// 5 · Kafka: plain modulo hashing
export function KafkaModulo({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.1, 1.2));
  const b = easeOut(seg(t, 1.3, 2.3));
  return (
    <Svg label="Kafka: a hash of the key, modulo the partition count, with no stability property" h={230}>
      <g opacity={a}>
        <T x={300} y={85} s={13} a="middle" f={C.crema}>partition: a hash of the key, modulo the partition count</T>
      </g>
      <T x={300} y={135} s={13} a="middle" f={C.cherryText} o={b}>change the count, the mapping changes almost everywhere</T>
    </Svg>
  );
}

// 6 · Predict: how much moves on growth?
export function PredictGrowth({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.1, 1.2));
  return (
    <Svg label="Growing ten nodes to eleven: how much of the key space moves, per scheme?" h={220}>
      <g opacity={a}>
        <T x={300} y={90} s={13} a="middle" f={C.crema}>ten nodes become eleven</T>
      </g>
      <T x={300} y={140} s={13} a="middle" f={C.caramel}>ring, slot table, modulo: how much actually moves?</T>
    </Svg>
  );
}

// 7 · Measured: growth comparison, three bars
export function GrowthMeasured({ t }: StepCtx) {
  const rows = [
    { label: 'ring', frac: 0.11, c: C.crema },
    { label: 'slot table', frac: 0.09, c: C.crema },
    { label: 'modulo', frac: 0.91, c: C.cherry },
  ];
  const shown = Math.min(rows.length, Math.floor(seg(t, 0.3, 2.4) * rows.length) + 1);
  return (
    <Svg label="The ring and the slot table move a small share; modulo moves almost everything" h={250}>
      {rows.slice(0, shown).map((r, i) => (
        <g key={r.label}>
          <T x={60} y={75 + i * 50} s={12} a="start" f={C.latte}>{r.label}</T>
          <Bar x={160} y={62 + i * 50} w={280} h={22} full={1} fill={C.taupe} />
          <Bar x={160} y={62 + i * 50} w={280 * r.frac} h={22} full={1} fill={r.c} />
        </g>
      ))}
    </Svg>
  );
}

// 8 · Rebalancing: automatic ranges vs explicit slot moves
export function Rebalancing({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.1, 1.2));
  const b = easeOut(seg(t, 1.3, 2.3));
  return (
    <Svg label="A ring claims a range automatically; a slot table moves slots one at a time" h={250}>
      <g opacity={a}>
        <T x={300} y={75} s={13} a="middle" f={C.crema}>ring: the new node claims a token range automatically</T>
      </g>
      <g opacity={b}>
        <T x={300} y={130} s={13} a="middle" f={C.cinnamon}>slot table: an operator moves slots, one at a time</T>
        <T x={300} y={158} s={11} a="middle" f={C.latte}>migrating, then importing, before a slot fully moves</T>
      </g>
    </Svg>
  );
}

// 9 · The shared blind spot: load, not keys
export function SharedBlindSpot({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.1, 1.2));
  const b = easeOut(seg(t, 1.3, 2.3));
  return (
    <Svg label="All three balance keys, never load; a hot key lands on exactly one node" h={230}>
      <g opacity={a}>
        <T x={300} y={85} s={13} a="middle" f={C.crema}>every scheme above balances keys, never load</T>
      </g>
      <T x={300} y={135} s={13} a="middle" f={C.cherryText} o={b}>one hot key still lands on exactly one node</T>
    </Svg>
  );
}

// 10 · Measured: virtual nodes don't systematically help the hot key
export function VirtualNodesDontHelp({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.2, 2.0));
  return (
    <Svg label="A thousand points per node changes who owns the key, not how overloaded they get" h={240}>
      <T x={300} y={55} s={12} a="middle" f={C.latte}>hot key's share of traffic on its node</T>
      <T x={180} y={100} s={12} a="middle" f={C.latte}>one point</T>
      <Bar x={110} y={110} w={140} h={26} full={1} fill={C.cherry} o={a} />
      <T x={420} y={100} s={12} a="middle" f={C.latte}>a thousand points</T>
      <Bar x={350} y={110} w={132} h={26} full={1} fill={C.cherry} o={a} />
      <T x={300} y={175} s={13} a="middle" f={C.caramel} o={a}>no systematic improvement either way</T>
    </Svg>
  );
}

// 11 · HAProxy's bounded-load rule
export function BoundedLoadRule({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.1, 1.2));
  const b = easeOut(seg(t, 1.3, 2.3));
  return (
    <Svg label="A server over its share is skipped for the next candidate the hash would pick" h={240}>
      <g opacity={a}>
        <T x={300} y={80} s={13} a="middle" f={C.crema}>hash-balance-factor: a cap on load, as a share of the average</T>
      </g>
      <T x={300} y={130} s={13} a="middle" f={C.caramel} o={b}>over the cap: skipped for the next candidate on the ring</T>
      <T x={300} y={158} s={11} a="middle" f={C.latte} o={b}>off by default</T>
    </Svg>
  );
}

// 12 · Measured: bounded load caps the hot key
export function BoundedLoadMeasured({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.2, 2.0));
  return (
    <Svg label="Bounded load caps the busiest node's share near the factor itself" h={240}>
      <T x={300} y={55} s={12} a="middle" f={C.latte}>busiest node's share of the average</T>
      <T x={180} y={100} s={12} a="middle" f={C.latte}>plain placement</T>
      <Bar x={110} y={110} w={140} h={26} full={1} fill={C.cherry} o={a} />
      <T x={420} y={100} s={12} a="middle" f={C.latte}>bounded load</T>
      <Bar x={350} y={110} w={58} h={26} full={1} fill={C.crema} o={a} />
      <T x={300} y={175} s={13} a="middle" f={C.caramel} o={a}>capped near the factor, not several times over it</T>
    </Svg>
  );
}

// 13 · Recap
export function Recap({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.1, 1.2));
  const b = easeOut(seg(t, 1.3, 2.2));
  return (
    <Svg label="One shared vulnerability; the fix is a cap on load, not a better placement" h={230}>
      <g opacity={a}>
        <T x={300} y={85} s={13} a="middle" f={C.crema}>three placements, one shared vulnerability</T>
      </g>
      <T x={300} y={135} s={13} a="middle" f={C.caramel} o={b}>the fix: a cap on load, not a better placement</T>
    </Svg>
  );
}

// 14 · Handoff
export function Handoff({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.1, 1.2));
  const b = easeOut(seg(t, 1.3, 2.2));
  return (
    <Svg label="Each machine answers for its own part; the system must combine the answers" h={230}>
      <g opacity={a}>
        <T x={300} y={85} s={13} a="middle" f={C.crema}>each machine answers only for its own part</T>
      </g>
      <T x={300} y={135} s={13} a="middle" f={C.caramel} o={b}>next: combining partial answers, without the raw rows</T>
    </Svg>
  );
}
