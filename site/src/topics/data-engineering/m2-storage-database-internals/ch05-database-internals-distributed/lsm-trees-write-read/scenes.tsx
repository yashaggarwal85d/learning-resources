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
    <Svg label="MVCC never updates in place. What if a structure did that on purpose, from the start?" h={200}>
      <Row y={70} label="MVCC" value="updates, pays later" o={easeOut(seg(t, 0, 0.6))} />
      <Row y={130} label="the LSM tree" value="never updates in place, ever" valueColor={C.focus} o={easeOut(seg(t, 0.4, 1))} />
    </Svg>
  );
}

export function RevealMemtableFlush({ t }: StepCtx) {
  return (
    <Svg label="a write hits the WAL, then the memtable; a flush turns it into one new, immutable file." h={260}>
      <Row y={50} label="a write" value="the WAL first" o={easeOut(seg(t, 0, 0.3))} />
      <Row y={95} label="then" value="the memtable" o={easeOut(seg(t, 0.15, 0.45))} />
      <Row y={140} label="flush it" value="one new file, on disk" valueColor={C.focus} o={easeOut(seg(t, 0.35, 0.7))} />
      <Row y={185} label="that file" value="never edited again" o={easeOut(seg(t, 0.55, 0.9))} />
    </Svg>
  );
}

export function PredictNewestFirst({ t }: StepCtx) {
  return (
    <Svg label="a key, flushed, then overwritten again, unflushed. Does the read touch the file?" h={200}>
      <Row y={70} label="file on disk" value="an older value" />
      <Row y={130} label="the read" value="not yet revealed" valueColor={C.focus} />
    </Svg>
  );
}

export function RevealPointReadNewestFirst({ t }: StepCtx) {
  return (
    <Svg label="measured directly: the memtable alone answers it, the older file never opened." h={200}>
      <Row y={70} label="memtable hits" value="one" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="file hits" value="zero — never opened" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function RevealRangeReadMerge({ t }: StepCtx) {
  return (
    <Svg label="a file's own sorted run and the memtable's own sorted run, merged into one." h={200}>
      <Row y={70} label="the file's run" value="sorted, on disk" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="merged with the memtable" value="newest value wins" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function RevealBloomFilterGate({ t }: StepCtx) {
  return (
    <Svg label="five hundred lookups for keys that don't exist, checked against a real Bloom filter." h={200}>
      <Row y={70} label="most lookups" value="rejected in one shot" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="the rest" value="wasted read, never wrong" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function RevealBlockIndex({ t }: StepCtx) {
  return (
    <Svg label="when the filter can't rule a key out, the file's own index finds the one block." h={200}>
      <Row y={70} label="the filter says maybe" value="the file isn't skipped" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="the index" value="one data block, not the file" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function RevealTombstoneGrowth({ t }: StepCtx) {
  return (
    <Svg label="deleting a batch of keys and flushing: a second file appears, of tombstones." h={200}>
      <Row y={70} label="a batch of keys, deleted" value="flushed again" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="disk usage" value="grows, not shrinks" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function Recap({ t }: StepCtx) {
  return (
    <Svg label="one rule, five consequences: never update a file in place." h={260}>
      <Row y={50} label="the write path" value="memtable, then a new file" o={easeOut(seg(t, 0, 0.3))} />
      <Row y={95} label="the read path" value="newest first, or merged" o={easeOut(seg(t, 0.15, 0.45))} />
      <Row y={140} label="the filter and the index" value="skip, then narrow" valueColor={C.focus} o={easeOut(seg(t, 0.35, 0.7))} />
      <Row y={185} label="a delete" value="a tombstone, not an erase" o={easeOut(seg(t, 0.55, 0.9))} />
    </Svg>
  );
}

export function ProveIt({ t }: StepCtx) {
  return (
    <Svg label="a tombstone, and two stale copies behind it. Why does the disk not shrink right now?" h={220}>
      <Row y={55} label="three shadowed copies" value="one key" o={easeOut(seg(t, 0, 0.4))} />
      <Row y={110} label="the disk" value="not yet revealed" valueColor={C.focus} o={easeOut(seg(t, 0.25, 0.65))} />
      <Row y={165} label="really" value="only a later merge discards them" valueColor={C.focus} o={easeOut(seg(t, 0.55, 1))} />
    </Svg>
  );
}
