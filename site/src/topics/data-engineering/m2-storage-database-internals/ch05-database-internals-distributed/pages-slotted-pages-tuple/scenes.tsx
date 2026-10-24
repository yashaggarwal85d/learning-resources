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
    <Svg label="every engine this course has used — Postgres, RocksDB, Polars reading Parquet — reads and writes the exact same physical unit. What is it?" h={200}>
      <Row y={70} label="every engine, so far" value="assumed, not opened" o={easeOut(seg(t, 0, 0.6))} />
      <Row y={130} label="the one physical unit" value="not yet named" valueColor={C.focus} o={easeOut(seg(t, 0.4, 1))} />
    </Svg>
  );
}

export function RevealFiveParts({ t }: StepCtx) {
  return (
    <Svg label="a real page, read directly from this sandbox's own Postgres cluster — what are its five parts, and which direction does each one grow?" h={200}>
      <Row y={70} label="the header" value="24 bytes, fixed" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="pointers, then items" value="grow together" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function RevealLinePointer({ t }: StepCtx) {
  return (
    <Svg label="the line-pointer array's own entries, read directly — what does each one actually store?" h={200}>
      <Row y={70} label="each line pointer" value="an offset, and a length" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="four bytes" value="one per row" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function PredictCtidStability({ t }: StepCtx) {
  return (
    <Svg label="VACUUM physically moves a surviving row to a new offset inside the page — does that row's own CTID change along with it, or stay exactly where it was?" h={200}>
      <Row y={70} label="the row, moved" value="a new offset?" />
      <Row y={130} label="its own CTID" value="changed too?" valueColor={C.focus} />
    </Svg>
  );
}

export function RevealVacuumMove({ t }: StepCtx) {
  return (
    <Svg label="a real row, deleted neighbors reclaimed by a real VACUUM — does its CTID survive the move, or does the move break it?" h={200}>
      <Row y={70} label="before VACUUM" value="offset A" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="after VACUUM" value="offset B, same CTID" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function RevealNullBitmap({ t }: StepCtx) {
  return (
    <Svg label="a row with one null column, read directly — does the bitmap actually mark which column is missing?" h={200}>
      <Row y={70} label="no nulls at all" value="no bitmap at all" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="one null column" value="one bit, off" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function RevealToastMove({ t }: StepCtx) {
  return (
    <Svg label="an incompressible value far past the TOAST threshold, inserted for real — how much smaller is the row that's actually left in the main table?" h={200}>
      <Row y={70} label="a short value" value="stored inline" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="a large value" value="a pointer, chunks away" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function RevealInnodbOverflow({ t }: StepCtx) {
  return (
    <Svg label="InnoDB's own documentation, on the identical fixed-page problem — does it solve it the same way TOAST does, or differently?" h={200}>
      <Row y={70} label="Postgres" value="a separate TOAST table" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="InnoDB" value="overflow pages, same row" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function Recap({ t }: StepCtx) {
  return (
    <Svg label="a page's own five parts, a line pointer decoded, a CTID surviving a real VACUUM, a real null bitmap, a real TOAST move, and InnoDB's own different answer to the same problem" h={260}>
      <Row y={50} label="a page's five parts" value="read off a real table" o={easeOut(seg(t, 0, 0.3))} />
      <Row y={95} label="a CTID, held" value="survives a real VACUUM" o={easeOut(seg(t, 0.1, 0.4))} />
      <Row y={140} label="a null bitmap" value="names the missing one" valueColor={C.focus} o={easeOut(seg(t, 0.25, 0.6))} />
      <Row y={185} label="a large value" value="moved out of line" o={easeOut(seg(t, 0.5, 0.85))} />
    </Svg>
  );
}

export function ProveIt({ t }: StepCtx) {
  return (
    <Svg label="a script holds a row's CTID across a batch of updates while a VACUUM runs in the middle — does the held CTID still point at the right row, and why?" h={220}>
      <Row y={55} label="a script holds a CTID" value="across a batch" o={easeOut(seg(t, 0, 0.4))} />
      <Row y={110} label="a VACUUM runs" value="mid-batch" valueColor={C.focus} o={easeOut(seg(t, 0.25, 0.65))} />
      <Row y={165} label="the held CTID" value="still correct" valueColor={C.focus} o={easeOut(seg(t, 0.55, 1))} />
    </Svg>
  );
}
