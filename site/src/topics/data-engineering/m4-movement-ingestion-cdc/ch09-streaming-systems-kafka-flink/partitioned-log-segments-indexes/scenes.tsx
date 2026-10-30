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
    <Svg label="a toy partition, 400 real records in — a naive scan to the last few records scans 396 of them; a sparse-index seek for the same record scans 4. Which one is Kafka's own design?" h={200}>
      <Row y={70} label="naive scan, to offset 395" value="396 records scanned" o={easeOut(seg(t, 0, 0.6))} />
      <Row y={130} label="sparse-index seek, same offset" value="4 records scanned" valueColor={C.focus} o={easeOut(seg(t, 0.4, 1))} />
    </Svg>
  );
}

export function Setup({ t }: StepCtx) {
  return (
    <Svg label="one partition, read directly as files on this sandbox's own disk — segment zero sealed, segment one still open" h={200}>
      <Row y={70} label="00000000000000000000.log" value="sealed segment" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="00000000000000000171.log" value="open, still growing" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function PredictSegmentFull({}: StepCtx) {
  return (
    <Svg label="the open segment just crossed its size limit — what happens to the very next record appended?" h={200}>
      <Row y={70} label="the open segment" value="just hit its limit" />
      <Row y={130} label="the next record" value="goes... where?" valueColor={C.focus} />
    </Svg>
  );
}

export function RevealSegmentRoll({ t }: StepCtx) {
  return (
    <Svg label="a real toy log, 400 records appended — the open segment rolls three separate times as it crosses its byte limit" h={200}>
      <Row y={70} label="segment size limit" value="4,096 bytes" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="400 records appended" value="3 rolls, 4 segments" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function RevealSparseIndex({ t }: StepCtx) {
  return (
    <Svg label="400 real records, one real sparse index — far fewer entries than records, and still enough to seek fast" h={200}>
      <Row y={70} label="records in the toy log" value="400" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="index entries" value="50 — sparse, not 400" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function PredictIndexCorrectness({}: StepCtx) {
  return (
    <Svg label="the index checks in only every so often — can a seek that relies on it ever come back with the wrong record?" h={200}>
      <Row y={70} label="the index" value="checks in rarely" />
      <Row y={130} label="a seek using it" value="ever wrong?" valueColor={C.focus} />
    </Svg>
  );
}

export function RevealZeroCopy({ t }: StepCtx) {
  return (
    <Svg label="two data paths from disk to a consumer's socket: a naive one with four copies, Kafka's own with effectively one" h={200}>
      <Row y={70} label="naive path" value="disk → kernel → user → kernel → NIC" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="sendfile path" value="disk → pagecache → NIC" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function RevealOffsetOwnership({ t }: StepCtx) {
  return (
    <Svg label="a consumer rewinds its own stored offset from 5 back to 0 and re-reads — the partition's segments and index are measured identical, byte for byte, before and after" h={200}>
      <Row y={70} label="consumer offset" value="5, rewound to 0" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="partition state" value="unchanged, measured" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function ProveIt({ t }: StepCtx) {
  return (
    <Svg label="every number from this reel, read straight off the real run of examples.py just now" h={260}>
      <Row y={50} label="segment roll trigger" value="4,096 bytes, real" o={easeOut(seg(t, 0, 0.3))} />
      <Row y={95} label="records vs index entries" value="400 vs 50" o={easeOut(seg(t, 0.1, 0.4))} />
      <Row y={140} label="records scanned, naive vs sparse" value="396 vs 4" valueColor={C.focus} o={easeOut(seg(t, 0.25, 0.6))} />
      <Row y={185} label="rewind-and-reread" value="0 bytes of state changed" o={easeOut(seg(t, 0.5, 0.85))} />
    </Svg>
  );
}

export function Recap({ t }: StepCtx) {
  return (
    <Svg label="a segment that rolls at a size limit, a sparse index that still seeks fast, a zero-copy read path, and an offset the consumer owns, not the broker" h={260}>
      <Row y={50} label="a partition" value="segments on real disk" o={easeOut(seg(t, 0, 0.3))} />
      <Row y={95} label="a sparse index" value="a few entries, fast seeks" o={easeOut(seg(t, 0.1, 0.4))} />
      <Row y={140} label="zero-copy reads" value="pagecache straight to the NIC" valueColor={C.focus} o={easeOut(seg(t, 0.25, 0.6))} />
      <Row y={185} label="an offset" value="the consumer's own integer" o={easeOut(seg(t, 0.5, 0.85))} />
    </Svg>
  );
}
