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
    <Svg label="every commit so far touched whole files -- this topic is a commit that only changes some rows." h={200}>
      <TallRow y={40} label="last topic" value="whole files, appended or overwritten" o={easeOut(seg(t, 0, 0.3))} />
      <TallRow y={100} label="this topic" value="a commit touching some rows, not all" valueColor={C.focus} o={easeOut(seg(t, 0.25, 0.65))} />
      <TallRow y={160} label="two real strategies" value="rewrite the file, or log the change" o={easeOut(seg(t, 0.55, 1))} />
    </Svg>
  );
}

export function PredictCheapestCommit({ t }: StepCtx) {
  return (
    <Svg label="a 1% row update, scattered across many files -- what's the cheapest way to commit it?" h={200}>
      <TallRow y={40} label="1% of rows change" value="scattered across every data file" o={easeOut(seg(t, 0, 0.5))} />
      <TallRow y={100} label="cheapest way to commit it?" value="rewrite the files, or log the change?" valueColor={C.focus} o={easeOut(seg(t, 0.4, 1))} />
    </Svg>
  );
}

export function RevealCowRewritesWhole({ t }: StepCtx) {
  return (
    <Svg label="copy-on-write: any touched file gets a brand new version, in full -- no log files at all." h={230}>
      <TallRow y={40} label="copy-on-write" value="a touched file gets rewritten whole" o={easeOut(seg(t, 0, 0.35))} />
      <TallRow y={100} label="no log files" value="the new base file IS the new version" valueColor={C.focus} o={easeOut(seg(t, 0.3, 0.7))} />
    </Svg>
  );
}

export function RevealCowRealWriteCost({ t }: StepCtx) {
  return (
    <Svg label="reproduced for real: a 1% update rewrites every touched file, at a real measured cost." h={230}>
      <TallRow y={40} label="1% of rows touched" value="every file holding one gets rewritten" o={easeOut(seg(t, 0, 0.35))} />
      <TallRow y={100} label="real measured write cost" value="milliseconds, for a one-percent change" valueColor={C.focus} o={easeOut(seg(t, 0.3, 0.7))} />
    </Svg>
  );
}

export function PredictCowReadPayoff({ t }: StepCtx) {
  return (
    <Svg label="does copy-on-write's expensive rewrite buy anything back when you read?" h={200}>
      <TallRow y={40} label="copy-on-write pays at write time" value="every touched file, fully rewritten" o={easeOut(seg(t, 0, 0.5))} />
      <TallRow y={100} label="does that buy anything at read time?" value="same cost either way, or cheaper reads?" valueColor={C.focus} o={easeOut(seg(t, 0.4, 1))} />
    </Svg>
  );
}

export function RevealMorDefersToLog({ t }: StepCtx) {
  return (
    <Svg label="merge-on-read: the change goes to a small log file, merged with the base only when you read." h={230}>
      <TallRow y={40} label="merge-on-read" value="the change goes to a small log file" o={easeOut(seg(t, 0, 0.35))} />
      <TallRow y={100} label="merged in at query time" value="base files stay completely untouched" valueColor={C.focus} o={easeOut(seg(t, 0.3, 0.7))} />
    </Svg>
  );
}

export function RevealMorRealCostGrows({ t }: StepCtx) {
  return (
    <Svg label="reproduced for real: the write is nearly free, but every read now pays a cost that keeps growing." h={230}>
      <TallRow y={40} label="real measured write cost" value="a small fraction of copy-on-write's" o={easeOut(seg(t, 0, 0.35))} />
      <TallRow y={100} label="real measured read cost" value="grows round over round as logs pile up" valueColor={C.focus} o={easeOut(seg(t, 0.3, 0.7))} />
    </Svg>
  );
}

export function RevealCompactionResetsCost({ t }: StepCtx) {
  return (
    <Svg label="reproduced for real: folding the logs into the base files resets the read cost right back down." h={230}>
      <TallRow y={40} label="compaction: fold logs into base files" value="then discard the logs entirely" o={easeOut(seg(t, 0, 0.35))} />
      <TallRow y={100} label="real measured result" value="read cost drops back to near zero" valueColor={C.focus} o={easeOut(seg(t, 0.3, 0.7))} />
    </Svg>
  );
}

export function RevealSameChoiceEveryFormat({ t }: StepCtx) {
  return (
    <Svg label="Iceberg, Delta and Hudi all name the identical trade, under different words for it." h={230}>
      <TallRow y={40} label="Iceberg" value="position deletes / deletion vectors" o={easeOut(seg(t, 0, 0.35))} />
      <TallRow y={100} label="Delta and Hudi" value="deletion vectors; CoW and MoR tables" valueColor={C.focus} o={easeOut(seg(t, 0.3, 0.7))} />
    </Svg>
  );
}

export function Recap({ t }: StepCtx) {
  return (
    <Svg label="copy-on-write pays once at write time; merge-on-read defers that cost until you compact." h={300}>
      <TallRow y={35} label="copy-on-write" value="expensive, predictable writes; cheap reads" o={easeOut(seg(t, 0, 0.3))} />
      <TallRow y={100} label="merge-on-read" value="cheap writes; reads that grow until compacted" o={easeOut(seg(t, 0.1, 0.4))} />
      <TallRow y={165} label="the choice" value="update rate, update spread, read freshness" valueColor={C.focus} o={easeOut(seg(t, 0.25, 0.6))} />
      <g opacity={easeOut(seg(t, 0.55, 1))}>
        <T x={25} y={230} s={14} f={C.latte}>
          the rule
        </T>
        <T x={25} y={256} s={16} f={C.focus} w={600}>
          pay for a change at write time, or defer it
        </T>
        <T x={25} y={280} s={16} f={C.focus} w={600}>
          to read time and pay compaction later
        </T>
      </g>
    </Svg>
  );
}
