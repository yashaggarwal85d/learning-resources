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
    <Svg label="hidden partitioning prunes whole files -- a single file's own rows still need deletes." h={200}>
      <TallRow y={40} label="hidden partitioning" value="prunes whole files" o={easeOut(seg(t, 0, 0.3))} />
      <TallRow y={100} label="this topic" value="deleting rows inside one file" valueColor={C.focus} o={easeOut(seg(t, 0.25, 0.65))} />
    </Svg>
  );
}

export function PredictUpsertNoPosition({ t }: StepCtx) {
  return (
    <Svg label="a streaming upsert writer deletes a row it never rewrote -- it has no position for it." h={200}>
      <TallRow y={40} label="a streaming upsert writer" value="deletes a row, re-inserts it" o={easeOut(seg(t, 0, 0.5))} />
      <TallRow y={100} label="never rewrote the file" value="what can it write instead?" valueColor={C.focus} o={easeOut(seg(t, 0.4, 1))} />
    </Svg>
  );
}

export function RevealEqualityDeleteBuilt({ t }: StepCtx) {
  return (
    <Svg label="reproduced for real: an equality delete file, naming column values instead of a position." h={230}>
      <TallRow y={40} label="equality delete file" value="id = 4, id = 8" o={easeOut(seg(t, 0, 0.35))} />
      <TallRow y={100} label="matches by value" value="not by file and position" valueColor={C.focus} o={easeOut(seg(t, 0.3, 0.7))} />
    </Svg>
  );
}

export function RevealPositionDeleteReadBack({ t }: StepCtx) {
  return (
    <Svg label="reproduced for real: a position delete, committed and read back through pyiceberg's own scan." h={230}>
      <TallRow y={40} label="real measured result" value="positions 3 and 7 removed" o={easeOut(seg(t, 0, 0.35))} />
      <TallRow y={100} label="read back correctly" value="through table.scan() itself" valueColor={C.focus} o={easeOut(seg(t, 0.3, 0.7))} />
    </Svg>
  );
}

export function PredictEqualityDeleteCost({ t }: StepCtx) {
  return (
    <Svg label="a position delete is a direct offset lookup. what does an equality delete cost to read?" h={200}>
      <TallRow y={40} label="a position delete" value="a direct offset lookup" o={easeOut(seg(t, 0, 0.5))} />
      <TallRow y={100} label="an equality delete" value="what does reading it cost?" valueColor={C.focus} o={easeOut(seg(t, 0.4, 1))} />
    </Svg>
  );
}

export function RevealJoinCostMeasured({ t }: StepCtx) {
  return (
    <Svg label="reproduced for real: every column value has to be read and compared, a real join." h={230}>
      <TallRow y={40} label="real measured result" value="every row's value compared" o={easeOut(seg(t, 0, 0.35))} />
      <TallRow y={100} label="a position delete" value="touches zero column values" valueColor={C.focus} o={easeOut(seg(t, 0.3, 0.7))} />
    </Svg>
  );
}

export function RevealScanRefusesEquality({ t }: StepCtx) {
  return (
    <Svg label="pyiceberg's own table.scan() refuses to read this table -- an open gap, disclosed here." h={230}>
      <TallRow y={40} label="pyiceberg's table.scan()" value="refuses to read this table" o={easeOut(seg(t, 0, 0.35))} />
      <TallRow y={100} label="the join above" value="was done by hand instead" valueColor={C.focus} o={easeOut(seg(t, 0.3, 0.7))} />
    </Svg>
  );
}

export function RevealV3DeprecatesPosition({ t }: StepCtx) {
  return (
    <Svg label="v3 deprecates position delete files outright, replacing them with deletion vectors." h={230}>
      <TallRow y={40} label="v3 deprecates" value="position delete files" o={easeOut(seg(t, 0, 0.35))} />
      <TallRow y={100} label="replaced by" value="this chapter's deletion vectors" valueColor={C.focus} o={easeOut(seg(t, 0.3, 0.7))} />
    </Svg>
  );
}

export function RevealV4ForbidsEquality({ t }: StepCtx) {
  return (
    <Svg label="v4 drafts forbid adding any new equality delete file at all -- the cost measured here is why." h={230}>
      <TallRow y={40} label="v4 drafts forbid" value="any new equality delete" o={easeOut(seg(t, 0, 0.35))} />
      <TallRow y={100} label="the reason" value="the read-side cost just measured" valueColor={C.focus} o={easeOut(seg(t, 0.3, 0.7))} />
    </Svg>
  );
}

export function Recap({ t }: StepCtx) {
  return (
    <Svg label="position deletes are a lookup; equality deletes are a join -- that cost is why v3 and v4 move away." h={300}>
      <TallRow y={35} label="a position delete" value="a direct offset lookup" o={easeOut(seg(t, 0, 0.3))} />
      <TallRow y={100} label="an equality delete" value="a join over every row's value" o={easeOut(seg(t, 0.1, 0.4))} />
      <TallRow y={165} label="that cost" value="is why v3 and v4 move away from it" valueColor={C.focus} o={easeOut(seg(t, 0.25, 0.6))} />
      <g opacity={easeOut(seg(t, 0.55, 1))}>
        <T x={25} y={230} s={14} f={C.latte}>
          the rule
        </T>
        <T x={25} y={256} s={16} f={C.focus} w={600}>
          both delete mechanisms here are v2;
        </T>
        <T x={25} y={280} s={16} f={C.focus} w={600}>
          next is v3 as a whole
        </T>
      </g>
    </Svg>
  );
}
