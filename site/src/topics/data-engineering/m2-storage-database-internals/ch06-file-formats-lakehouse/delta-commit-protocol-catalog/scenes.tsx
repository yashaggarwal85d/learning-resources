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
    <Svg label="a json entry is only a commit once it's atomic. this topic is exactly that, for real." h={200}>
      <TallRow y={40} label="topic 27 left off at" value="atomic, as the next version" o={easeOut(seg(t, 0, 0.3))} />
      <TallRow y={100} label="topic 10's own primitive" value="reused, named as a commit" valueColor={C.focus} o={easeOut(seg(t, 0.25, 0.65))} />
    </Svg>
  );
}

export function PredictRaceOutcome({ t }: StepCtx) {
  return (
    <Svg label="two writers race for the same next version. writer a's write lands first. what happens to writer b's?" h={200}>
      <TallRow y={40} label="writer a commits first" value="version 1, for real" o={easeOut(seg(t, 0, 0.5))} />
      <TallRow y={100} label="writer b's write" value="overwrite, merge, or rejected?" valueColor={C.focus} o={easeOut(seg(t, 0.4, 1))} />
    </Svg>
  );
}

export function RevealPutIfAbsentCommit({ t }: StepCtx) {
  return (
    <Svg label="a real put-if-absent write of _delta_log/...0001.json. writer b's identical attempt gets a real 412." h={230}>
      <TallRow y={40} label="writer a's put" value="IfNoneMatch, succeeds" o={easeOut(seg(t, 0, 0.35))} />
      <TallRow y={100} label="writer b's put" value="rejected, 412 for real" valueColor={C.focus} o={easeOut(seg(t, 0.3, 0.7))} />
    </Svg>
  );
}

export function RevealAppendRetrySucceeds({ t }: StepCtx) {
  return (
    <Svg label="writer b's append has no requirements. it re-proposes against the new tip and wins version 2." h={230}>
      <TallRow y={40} label="an append" value="always safe to retry" o={easeOut(seg(t, 0, 0.35))} />
      <TallRow y={100} label="writer b retries" value="wins version 2, for real" valueColor={C.focus} o={easeOut(seg(t, 0.3, 0.7))} />
    </Svg>
  );
}

export function PredictIsolationLevel({ t }: StepCtx) {
  return (
    <Svg label="a concurrent insert lands first. a delete that didn't see it tries to commit next. does it commit?" h={200}>
      <TallRow y={40} label="insert commits at v3" value="delete read before it" o={easeOut(seg(t, 0, 0.5))} />
      <TallRow y={100} label="delete tries v4" value="commits, or conflict?" valueColor={C.focus} o={easeOut(seg(t, 0.4, 1))} />
    </Svg>
  );
}

export function RevealWriteSerializableAllows({ t }: StepCtx) {
  return (
    <Svg label="writeserializable (the default) lets it commit: the two can still be ordered." h={230}>
      <TallRow y={40} label="writeserializable" value="allows the commit" o={easeOut(seg(t, 0, 0.35))} />
      <TallRow y={100} label="serializable would" value="refuse it as a conflict" valueColor={C.focus} o={easeOut(seg(t, 0.3, 0.7))} />
    </Svg>
  );
}

export function RevealOverlappingCase({ t }: StepCtx) {
  return (
    <Svg label="now the delete targets the exact row the insert just added. writeserializable still allows it." h={230}>
      <TallRow y={40} label="same target row" value="writeserializable: still allows" o={easeOut(seg(t, 0, 0.35))} />
      <TallRow y={100} label="serializable" value="now refuses, for real" valueColor={C.focus} o={easeOut(seg(t, 0.3, 0.7))} />
    </Svg>
  );
}

export function RevealWhyDynamoDbExisted({ t }: StepCtx) {
  return (
    <Svg label="before s3 had conditional writes, two writers could both win the same version. that needed an external lock." h={230}>
      <TallRow y={40} label="no if-none-match" value="both writers could win" o={easeOut(seg(t, 0, 0.35))} />
      <TallRow y={100} label="delta's answer" value="a dynamodb commit coordinator" valueColor={C.focus} o={easeOut(seg(t, 0.3, 0.7))} />
    </Svg>
  );
}

export function RevealCatalogManagedTimeline({ t }: StepCtx) {
  return (
    <Svg label="4.0 previews the catalog as source of truth; 4.2 moves commits under it; 4.3 moves everything else." h={260}>
      <TallRow y={35} label="4.0, sep 2025" value="catalog-managed tables, preview" o={easeOut(seg(t, 0, 0.3))} />
      <TallRow y={100} label="4.2" value="commits, catalog-coordinated" o={easeOut(seg(t, 0.2, 0.5))} />
      <TallRow y={165} label="4.3" value="every operation, same catalog api" valueColor={C.focus} o={easeOut(seg(t, 0.4, 0.75))} />
    </Svg>
  );
}

export function Recap({ t }: StepCtx) {
  return (
    <Svg label="a commit is a put-if-absent write; isolation decides what races may commit; the catalog takes over both." h={300}>
      <TallRow y={35} label="a commit" value="a put-if-absent write" o={easeOut(seg(t, 0, 0.3))} />
      <TallRow y={100} label="isolation level" value="decides which races may commit" o={easeOut(seg(t, 0.1, 0.4))} />
      <TallRow y={165} label="catalog-managed" value="moves both into the catalog" valueColor={C.focus} o={easeOut(seg(t, 0.25, 0.6))} />
      <g opacity={easeOut(seg(t, 0.55, 1))}>
        <T x={25} y={230} s={14} f={C.latte}>
          the rule
        </T>
        <T x={25} y={256} s={16} f={C.focus} w={600}>
          a commit protocol only matters because
        </T>
        <T x={25} y={280} s={16} f={C.focus} w={600}>
          of what produces commits -- next: delta's dml
        </T>
      </g>
    </Svg>
  );
}
