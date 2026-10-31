import { C, Svg, T } from '../../../../../reels/kit';
import { easeOut, seg } from '../../../../../reels/anim';
import type { StepCtx } from '../../../../../reels/types';

function TallRow({ y, label, value, valueColor = C.crema, o = 1 }: { y: number; label: string; value: string; valueColor?: string; o?: number }) {
  return (
    <g opacity={o}>
      <T x={25} y={y} s={14} f={C.latte}>
        {label}
      </T>
      <T x={25} y={y + 26} s={16} f={valueColor} w={600}>
        {value}
      </T>
    </g>
  );
}

export function Hook({ t }: StepCtx) {
  return (
    <Svg label="a row's identity survives inside one file -- what about a whole column, at the table level?" h={200}>
      <TallRow y={40} label="last topic" value="a row's identity, inside one file" o={easeOut(seg(t, 0, 0.3))} />
      <TallRow y={100} label="this topic" value="a column's identity, across the table" valueColor={C.focus} o={easeOut(seg(t, 0.25, 0.65))} />
      <TallRow y={160} label="topic 3's problem, now solved" value="field IDs and column mapping" o={easeOut(seg(t, 0.55, 1))} />
    </Svg>
  );
}

export function PredictPositionCorrupts({ t }: StepCtx) {
  return (
    <Svg label="a column gets renamed and a new one inserted -- what happens if a reader still matches by position?" h={200}>
      <TallRow y={40} label="a column renamed, a new one inserted" value="before it, in the schema" o={easeOut(seg(t, 0, 0.5))} />
      <TallRow y={100} label="a reader still matching by position" value="reads back correctly, or corrupts?" valueColor={C.focus} o={easeOut(seg(t, 0.4, 1))} />
    </Svg>
  );
}

export function RevealPositionCorruptsForReal({ t }: StepCtx) {
  return (
    <Svg label="reproduced for real: the inserted column silently takes the next column's real value." h={230}>
      <TallRow y={40} label="real on-disk table, read by position" value="after a rename and an insert" o={easeOut(seg(t, 0, 0.35))} />
      <TallRow y={100} label="real measured result" value="every later column shifts one slot wrong" valueColor={C.focus} o={easeOut(seg(t, 0.3, 0.7))} />
    </Svg>
  );
}

export function RevealFieldIdsAreTheFix({ t }: StepCtx) {
  return (
    <Svg label="Iceberg's fix: columns are selected by field ID, never by name or position." h={230}>
      <TallRow y={40} label="field IDs" value="assigned once, never reused or changed" o={easeOut(seg(t, 0, 0.35))} />
      <TallRow y={100} label="a rename" value="changes the name, never the field ID" valueColor={C.focus} o={easeOut(seg(t, 0.3, 0.7))} />
    </Svg>
  );
}

export function RevealFieldIdProjectionSurvives({ t }: StepCtx) {
  return (
    <Svg label="reproduced for real: the identical rename and insert, this time read by field ID." h={230}>
      <TallRow y={40} label="the same real on-disk table" value="read by field ID instead of position" o={easeOut(seg(t, 0, 0.35))} />
      <TallRow y={100} label="real measured result" value="rename survives; new column reads missing" valueColor={C.focus} o={easeOut(seg(t, 0.3, 0.7))} />
    </Svg>
  );
}

export function PredictDeltaRenameMechanism({ t }: StepCtx) {
  return (
    <Svg label="Delta's files use real column names -- how does it rename without rewriting the file?" h={200}>
      <TallRow y={40} label="Delta's data files use real column names" value="not field IDs" o={easeOut(seg(t, 0, 0.5))} />
      <TallRow y={100} label="how does a rename avoid a rewrite?" value="always rewrites, or a stable name in metadata?" valueColor={C.focus} o={easeOut(seg(t, 0.4, 1))} />
    </Svg>
  );
}

export function RevealNoMappingRewrites({ t }: StepCtx) {
  return (
    <Svg label="reproduced for real: without column mapping, a rename really does rewrite the file." h={230}>
      <TallRow y={40} label="without column mapping" value="the physical name IS the logical name" o={easeOut(seg(t, 0, 0.35))} />
      <TallRow y={100} label="real measured result" value="renaming really does rewrite the data file" valueColor={C.focus} o={easeOut(seg(t, 0.3, 0.7))} />
    </Svg>
  );
}

export function RevealMappingAvoidsRewrite({ t }: StepCtx) {
  return (
    <Svg label="reproduced for real: with column mapping, the data file's bytes never change." h={230}>
      <TallRow y={40} label="with column mapping" value="a stable physical name, kept in metadata" o={easeOut(seg(t, 0, 0.35))} />
      <TallRow y={100} label="real measured result" value="data file's bytes stay identical" valueColor={C.focus} o={easeOut(seg(t, 0.3, 0.7))} />
    </Svg>
  );
}

export function RevealThreeMoreMovesSafe({ t }: StepCtx) {
  return (
    <Svg label="the same stable-ID idea also covers adding, widening, and nested-struct evolution." h={230}>
      <TallRow y={40} label="a stable ID, once assigned" value="never changes and is never reused" o={easeOut(seg(t, 0, 0.35))} />
      <TallRow y={100} label="that's what makes safe" value="adding, widening a type, nested structs" valueColor={C.focus} o={easeOut(seg(t, 0.3, 0.7))} />
    </Svg>
  );
}

export function Recap({ t }: StepCtx) {
  return (
    <Svg label="a stable ID, not a name or a position, is what makes every one of these moves safe." h={300}>
      <TallRow y={35} label="the real failure" value="matching columns by name or position" o={easeOut(seg(t, 0, 0.3))} />
      <TallRow y={100} label="Iceberg's fix" value="a field ID, assigned once, never reused" o={easeOut(seg(t, 0.1, 0.4))} />
      <TallRow y={165} label="Delta's fix" value="a stable physical name, kept in metadata" valueColor={C.focus} o={easeOut(seg(t, 0.25, 0.6))} />
      <g opacity={easeOut(seg(t, 0.55, 1))}>
        <T x={25} y={230} s={14} f={C.latte}>
          the rule
        </T>
        <T x={25} y={256} s={16} f={C.focus} w={600}>
          a stable ID is what lets a column survive
        </T>
        <T x={25} y={280} s={16} f={C.focus} w={600}>
          a rename, a reorder, or a widened type
        </T>
      </g>
    </Svg>
  );
}
