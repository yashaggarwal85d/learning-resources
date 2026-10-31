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
    <Svg label="exactly one writer wins a race -- this topic is what the loser must do next." h={200}>
      <TallRow y={40} label="last topic" value="exactly one writer wins the swap" o={easeOut(seg(t, 0, 0.3))} />
      <TallRow y={100} label="this topic" value="what the loser does next" valueColor={C.focus} o={easeOut(seg(t, 0.25, 0.65))} />
      <TallRow y={160} label="the answer" value="it depends what the write touched" o={easeOut(seg(t, 0.55, 1))} />
    </Svg>
  );
}

export function PredictRetryRule({ t }: StepCtx) {
  return (
    <Svg label="a writer loses the race for a commit slot -- what should it do next?" h={200}>
      <TallRow y={40} label="writer loses the commit race" value="base snapshot is now stale" o={easeOut(seg(t, 0, 0.5))} />
      <TallRow y={100} label="what happens next?" value="always retry, or does it depend?" valueColor={C.focus} o={easeOut(seg(t, 0.4, 1))} />
    </Svg>
  );
}

export function RevealThreeStages({ t }: StepCtx) {
  return (
    <Svg label="Delta's own shape: read, stage, then validate at commit -- conflicts are caught at the last step." h={230}>
      <TallRow y={40} label="read, then write" value="stage new files, no lock needed" o={easeOut(seg(t, 0, 0.35))} />
      <TallRow y={100} label="validate and commit" value="conflicts are caught right here" valueColor={C.focus} o={easeOut(seg(t, 0.3, 0.7))} />
    </Svg>
  );
}

export function RevealRetryDependsOnOp({ t }: StepCtx) {
  return (
    <Svg label="the retry rule depends on the operation -- an append has nothing to re-check; a delete does." h={230}>
      <TallRow y={40} label="an append" value="no requirements -- always re-appliable" o={easeOut(seg(t, 0, 0.35))} />
      <TallRow y={100} label="a delete or replace" value="must verify its files are still there" valueColor={C.focus} o={easeOut(seg(t, 0.3, 0.7))} />
    </Svg>
  );
}

export function PredictAppendRetry({ t }: StepCtx) {
  return (
    <Svg label="two writers append disjoint files from the same base -- can the loser always retry?" h={200}>
      <TallRow y={40} label="writer A and writer B, same base" value="each appends a different new file" o={easeOut(seg(t, 0, 0.5))} />
      <TallRow y={100} label="B loses the race" value="can B still succeed on retry?" valueColor={C.focus} o={easeOut(seg(t, 0.4, 1))} />
    </Svg>
  );
}

export function RevealAppendRetrySucceeds({ t }: StepCtx) {
  return (
    <Svg label="reproduced for real: the losing append restages against the new base and wins." h={230}>
      <TallRow y={40} label="writer A wins version 1" value="writer B loses -- nothing to re-check" o={easeOut(seg(t, 0, 0.35))} />
      <TallRow y={100} label="B restages against the new base" value="retries as version 2 -- succeeds" valueColor={C.focus} o={easeOut(seg(t, 0.3, 0.7))} />
    </Svg>
  );
}

export function RevealDeleteRetryFails({ t }: StepCtx) {
  return (
    <Svg label="reproduced for real: two writers delete the same file -- the loser's retry fails for good." h={230}>
      <TallRow y={40} label="writer A and writer B" value="both remove the same file, same base" o={easeOut(seg(t, 0, 0.35))} />
      <TallRow y={100} label="B loses, revalidates" value="the file is already gone -- fails for good" valueColor={C.focus} o={easeOut(seg(t, 0.3, 0.7))} />
    </Svg>
  );
}

export function RevealDeltaTaxonomy({ t }: StepCtx) {
  return (
    <Svg label="Delta names the exact same distinction as typed exceptions, not just prose." h={230}>
      <TallRow y={40} label="ConcurrentAppendException" value="a concurrent write added files you read" o={easeOut(seg(t, 0, 0.35))} />
      <TallRow y={100} label="ConcurrentDeleteReadException" value="a concurrent write deleted files you read" valueColor={C.focus} o={easeOut(seg(t, 0.3, 0.7))} />
    </Svg>
  );
}

export function RevealIsolationIsAChoice({ t }: StepCtx) {
  return (
    <Svg label="isolation isn't a fixed property of the storage -- it's what a writer chooses to validate." h={230}>
      <TallRow y={40} label="validate only 'my files still exist'" value="more concurrency, looser isolation" o={easeOut(seg(t, 0, 0.35))} />
      <TallRow y={100} label="validate 'nothing in the table changed'" value="less concurrency, stricter isolation" valueColor={C.focus} o={easeOut(seg(t, 0.3, 0.7))} />
    </Svg>
  );
}

export function Recap({ t }: StepCtx) {
  return (
    <Svg label="stage first, validate at commit; retry safely or fail for good depending on the operation; isolation is that choice." h={300}>
      <TallRow y={35} label="writers" value="stage first, validate only at commit" o={easeOut(seg(t, 0, 0.3))} />
      <TallRow y={100} label="an append" value="always safe to revalidate and retry" o={easeOut(seg(t, 0.1, 0.4))} />
      <TallRow y={165} label="a delete on a gone file" value="fails for good, not retried" valueColor={C.focus} o={easeOut(seg(t, 0.25, 0.6))} />
      <g opacity={easeOut(seg(t, 0.55, 1))}>
        <T x={25} y={230} s={14} f={C.latte}>
          the rule
        </T>
        <T x={25} y={256} s={16} f={C.focus} w={600}>
          what you choose to validate at commit
        </T>
        <T x={25} y={280} s={16} f={C.focus} w={600}>
          is the isolation level itself
        </T>
      </g>
    </Svg>
  );
}
