import type { StepCtx } from '../../../../../reels/types';
import { easeOut, seg } from '../../../../../reels/anim';
import { C, Svg, T, Bar, Draw } from '../../../../../reels/kit';

// Colour grammar (CHAPTER.md, chapter 37): crema = the textbook structure as drawn earlier, and
// data in memory; latte = secondary labels; taupe = data on disk, not yet read back; caramel =
// the thing to look at; cinnamon (rare) = the system's modification set against the textbook;
// cherry/cherryText = the bad outcome.

// 1 · Hook: a filter block far larger than the data block it protects
export function FilterHook({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.1, 1.1));
  const b = easeOut(seg(t, 1.2, 2.4));
  const barW = 10 + 270 * easeOut(seg(t, 1.2, 2.6));
  return (
    <Svg label="A filter block can be over a thousand times the size of the data block it protects" h={250}>
      <g opacity={a}>
        <T x={300} y={55} s={13} a="middle" f={C.crema}>a lookup for a missing key should touch no data block</T>
      </g>
      <T x={120} y={100} s={11} a="middle" f={C.latte}>data block</T>
      <Bar x={90} y={110} w={60} h={16} full={1} fill={C.crema} />
      <T x={300} y={100} s={11} a="middle" f={C.latte} o={b}>filter block</T>
      <Bar x={165} y={110} w={barW} h={16} full={1} fill={C.cinnamon} o={b} />
      <T x={300} y={175} s={13} a="middle" f={C.caramel} o={b}>over a thousand times the size, unread</T>
    </Svg>
  );
}

// 2 · Two-column strip: the Chapter 5 B+-tree, key only, vs a storage engine's leaf entry
export function BTreeTwoColumn({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.1, 1.0));
  const b = easeOut(seg(t, 1.0, 2.0));
  return (
    <Svg label="The chapter 5 B+-tree, key only, and a storage engine's leaf entry beside it" h={260}>
      <g opacity={a}>
        <T x={300} y={60} s={13} a="middle" f={C.crema}>Chapter 5: a leaf entry is just a key</T>
      </g>
      <T x={300} y={115} s={12} a="middle" f={C.caramel}>constraint: logical duplicates still have to sort somewhere</T>
      <g opacity={b}>
        <T x={300} y={170} s={13} a="middle" f={C.cinnamon}>the engine's leaf entry: a key, and a second value</T>
        <T x={300} y={195} s={11} a="middle" f={C.latte}>the second value makes every entry unique</T>
      </g>
    </Svg>
  );
}

// 3 · The tiebreaker: heap TID
export function TidTiebreaker({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.1, 1.2));
  const b = easeOut(seg(t, 1.3, 2.3));
  return (
    <Svg label="The heap tuple identifier is a tiebreaker, so every entry is unique" h={240}>
      <g opacity={a}>
        <T x={300} y={85} s={13} a="middle" f={C.crema}>every btree key must be unique</T>
      </g>
      <T x={300} y={135} s={13} a="middle" f={C.caramel} o={b}>the heap tuple identifier breaks every tie</T>
      <T x={300} y={165} s={11} a="middle" f={C.latte} o={b}>duplicates sort in heap-TID order</T>
    </Svg>
  );
}

// 4 · Measured: five duplicate-key rows, five unique entries
export function DuplicateEntries({ t }: StepCtx) {
  const rows = [0, 1, 2, 3, 4];
  const shown = Math.min(rows.length, Math.floor(seg(t, 0.2, 2.2) * rows.length) + 1);
  return (
    <Svg label="Five rows share one key; their tuple identifiers keep every entry unique" h={260}>
      <T x={300} y={55} s={12} a="middle" f={C.latte}>one key, repeated; a different tuple id each time</T>
      {rows.slice(0, shown).map((i) => (
        <g key={i}>
          <T x={220} y={100 + i * 26} s={13} a="end" f={C.crema}>key</T>
          <T x={260} y={100 + i * 26} s={13} a="start" f={C.caramel}>tid {i}</T>
        </g>
      ))}
      <T x={300} y={240} s={12} a="middle" f={C.caramel} o={shown >= rows.length ? 1 : 0}>five entries, all unique</T>
    </Svg>
  );
}

// 5 · Predict: does a duplicate-packed page split evenly?
export function PredictSplit({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.1, 1.2));
  return (
    <Svg label="Does a leaf page packed with one repeated key split down the middle?" h={230}>
      <g opacity={a}>
        <T x={300} y={90} s={13} a="middle" f={C.crema}>a leaf page fills up with one repeated key</T>
        <T x={300} y={120} s={12} a="middle" f={C.latte}>it must split</T>
      </g>
      <T x={300} y={170} s={13} a="middle" f={C.caramel}>half on each side, the way ordinary keys would?</T>
    </Svg>
  );
}

// 6 · Measured: the lopsided split
export function LopsidedSplit({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.2, 2.0));
  return (
    <Svg label="The left page keeps every slot full; the right page holds almost nothing" h={260}>
      <T x={180} y={60} s={12} a="middle" f={C.latte}>left page</T>
      <Bar x={110} y={85} w={140} h={120} full={1} fill={C.crema} o={a} />
      <T x={420} y={60} s={12} a="middle" f={C.latte}>right page</T>
      <Bar x={350} y={85} w={140} h={30} full={1} fill={C.taupe} o={a} />
      <T x={300} y={230} s={13} a="middle" f={C.caramel}>full, then almost empty: the fallback's own assumption</T>
    </Svg>
  );
}

// 7 · Two-column strip, second structure: the Chapter 5 LSM tree vs RocksDB's stored key
export function LsmTwoColumn({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.1, 1.0));
  const b = easeOut(seg(t, 1.0, 2.0));
  return (
    <Svg label="The chapter 5 LSM tree, user key only, and RocksDB's stored key beside it" h={250}>
      <g opacity={a}>
        <T x={300} y={60} s={13} a="middle" f={C.crema}>Chapter 5: a stored entry is a user key and a value</T>
      </g>
      <T x={300} y={110} s={12} a="middle" f={C.caramel}>constraint: more than one version of a key can exist at once</T>
      <g opacity={b}>
        <T x={300} y={165} s={13} a="middle" f={C.cinnamon}>RocksDB's stored key: a user key, and a sequence number</T>
      </g>
    </Svg>
  );
}

// 8 · The comparator: key ascending, sequence descending
export function SequenceOrder({ t }: StepCtx) {
  const versions = [3, 2, 1];
  const shown = Math.min(versions.length, Math.floor(seg(t, 0.2, 2.2) * versions.length) + 1);
  return (
    <Svg label="Among entries for one key, the newest write sorts first, drawn as a stack" h={260}>
      <T x={300} y={50} s={12} a="middle" f={C.latte}>one key, three writes, stacked newest on top</T>
      {versions.slice(0, shown).map((v, i) => (
        <T key={v} x={300} y={90 + i * 34} s={13} a="middle" f={i === 0 ? C.caramel : C.crema}>write {v}</T>
      ))}
      <T x={300} y={225} s={12} a="middle" f={C.latte} o={shown >= versions.length ? 1 : 0}>key ascending, sequence number descending</T>
    </Svg>
  );
}

// 9 · Measured: snapshot read vs live read
export function SnapshotRead({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.1, 1.2));
  const b = easeOut(seg(t, 1.3, 2.3));
  return (
    <Svg label="A snapshot reads the version current when it was taken; a live read sees the delete" h={260}>
      <g opacity={a}>
        <T x={300} y={70} s={13} a="middle" f={C.crema}>three writes, then a delete</T>
        <T x={300} y={98} s={11} a="middle" f={C.latte}>a snapshot taken right after the second write</T>
      </g>
      <T x={300} y={145} s={13} a="middle" f={C.caramel} o={b}>the snapshot still reads the second write's value</T>
      <T x={300} y={173} s={12} a="middle" f={C.cherryText} o={b}>a read with no snapshot sees the delete instead</T>
    </Svg>
  );
}

// 10 · Seek, not scan
export function SeekNotScan({ t }: StepCtx) {
  const pts = [[80, 140], [220, 140], [220, 90]] as [number, number][];
  return (
    <Svg label="Because the newest version sorts first, a snapshot read is one seek, not a scan" h={240}>
      <T x={300} y={55} s={12} a="middle" f={C.latte}>every version of a key, oldest to newest</T>
      <Draw pts={pts} t={t} from={0.2} to={2.0} stroke={C.caramel} />
      <T x={300} y={190} s={13} a="middle" f={C.caramel} o={easeOut(seg(t, 1.8, 2.6))}>one seek finds the right version, nothing else is read</T>
    </Svg>
  );
}

// 11 · The filter problem in full: competing with the data it protects
export function FilterCompetesWithData({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.1, 1.2));
  const b = easeOut(seg(t, 1.3, 2.3));
  return (
    <Svg label="An uncached filter block competes with data blocks for the same cache space" h={250}>
      <g opacity={a}>
        <T x={300} y={75} s={13} a="middle" f={C.crema}>one filter block, far larger than a data block</T>
      </g>
      <T x={300} y={125} s={13} a="middle" f={C.cherryText} o={b}>kicks data blocks out of the cache when it is loaded</T>
      <T x={300} y={153} s={11} a="middle" f={C.latte} o={b}>the thing meant to protect the data competes with it</T>
    </Svg>
  );
}

// 12 · The fix: a partitioned filter with a top-level index
export function PartitionedFilter({ t }: StepCtx) {
  const parts = [0, 1, 2, 3, 4];
  const shown = Math.min(parts.length, Math.floor(seg(t, 0.6, 2.2) * parts.length) + 1);
  return (
    <Svg label="A tiny top-level index points at small filter partitions, loaded only on demand" h={260}>
      <T x={300} y={55} s={12} a="middle" f={C.latte}>a tiny top-level index, loaded once</T>
      <Bar x={250} y={70} w={100} h={14} full={1} fill={C.caramel} />
      <T x={300} y={110} s={11} a="middle" f={C.latte}>points at filter partitions</T>
      {parts.slice(0, shown).map((i) => (
        <Bar key={i} x={70 + i * 95} y={130} w={75} h={30} full={1} fill={i === 2 ? C.cinnamon : C.taupe} />
      ))}
      <T x={300} y={200} s={12} a="middle" f={C.caramel} o={shown >= parts.length ? 1 : 0}>one partition loaded on demand, the rest stay on disk</T>
    </Svg>
  );
}

// 13 · Four point-lookup cases, block reads counted
export function BlockReadCounts({ t }: StepCtx) {
  const cases = [
    { label: 'hit', n: 2, c: C.crema },
    { label: 'miss, no filter', n: 2, c: C.taupe },
    { label: 'filter cached', n: 1, c: C.crema },
    { label: 'partition uncached', n: 2, c: C.cherry },
  ];
  const shown = Math.min(cases.length, Math.floor(seg(t, 0.3, 2.8) * cases.length) + 1);
  return (
    <Svg label="Four lookups, counted in block reads: the uncached partition costs as much as no filter" h={280}>
      {cases.slice(0, shown).map((c, i) => (
        <g key={c.label}>
          <T x={225} y={70 + i * 42} s={11} a="end" f={C.latte}>{c.label}</T>
          <Bar x={260} y={58 + i * 42} w={c.n * 60} h={18} full={1} fill={c.c} />
        </g>
      ))}
      <T x={300} y={260} s={12} a="middle" f={C.cherryText} o={shown >= cases.length ? 1 : 0}>an uncached partition costs what no filter costs at all</T>
    </Svg>
  );
}

// 14 · Recap and handoff
export function Recap({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.1, 1.2));
  const b = easeOut(seg(t, 1.3, 2.2));
  return (
    <Svg label="A tiebreaker, a sequence number, a paged filter: three adaptations, one shape" h={240}>
      <g opacity={a}>
        <T x={300} y={85} s={13} a="middle" f={C.crema}>a tiebreaker, a sequence number, a paged filter</T>
      </g>
      <T x={300} y={140} s={13} a="middle" f={C.caramel} o={b}>next: which machine holds a key at all</T>
    </Svg>
  );
}
