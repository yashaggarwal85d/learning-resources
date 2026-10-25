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
    <Svg label="two commits, no errors. Ten dollars, gone anyway." h={200}>
      <Row y={70} label="T1 commits" value="no error" o={easeOut(seg(t, 0, 0.6))} />
      <Row y={130} label="T2 commits" value="no error — ten dollars, gone" valueColor={C.focus} o={easeOut(seg(t, 0.4, 1))} />
    </Svg>
  );
}

export function RevealAnsiVocabulary({ t }: StepCtx) {
  return (
    <Svg label="four named phenomena, stated precisely by ANSI SQL-92." h={260}>
      <Row y={50} label="dirty write" value="P0" o={easeOut(seg(t, 0, 0.3))} />
      <Row y={95} label="dirty read" value="P1" o={easeOut(seg(t, 0.15, 0.45))} />
      <Row y={140} label="non-repeatable read" value="P2" o={easeOut(seg(t, 0.35, 0.7))} />
      <Row y={185} label="phantom" value="P3" valueColor={C.focus} o={easeOut(seg(t, 0.55, 0.9))} />
    </Svg>
  );
}

export function PredictSameRuleSameWay({ t }: StepCtx) {
  return (
    <Svg label="two engineers, one English sentence. Same rule, or two different ones?" h={200}>
      <Row y={70} label="engineer one" value="reads the definition" />
      <Row y={130} label="engineer two" value="not yet revealed" valueColor={C.focus} />
    </Svg>
  );
}

export function RevealAmbiguityExposed({ t }: StepCtx) {
  return (
    <Svg label="the same sentence, two defensible readings — different rules." h={200}>
      <Row y={70} label="narrow" value="blocks aborted-write reads" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="broad" value="blocks any read before a decision" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function RevealLostUpdate({ t }: StepCtx) {
  return (
    <Svg label="a real forced timeline against a real Postgres table." h={200}>
      <Row y={70} label="T1 commits" value="110" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="T2 commits, final balance" value="120" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function RevealReadWriteSkew({ t }: StepCtx) {
  return (
    <Svg label="one transaction, two reads, an inconsistent pair." h={200}>
      <Row y={70} label="T1 reads x" value="50" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="T1 rereads y, after T2 commits" value="80" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function RevealDirtyWriteBlocked({ t }: StepCtx) {
  return (
    <Svg label="a second writer to the same row, measured." h={200}>
      <Row y={70} label="T2's own write" value="blocks" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="once T1 commits" value="T2 applies, finally" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function PredictReadOnlyAnomaly({ t }: StepCtx) {
  return (
    <Svg label="a transaction that only reads. Can it still see an impossible state?" h={200}>
      <Row y={70} label="this transaction" value="writes nothing at all" />
      <Row y={130} label="what it sees" value="not yet revealed" valueColor={C.focus} />
    </Svg>
  );
}

export function RevealReadOnlyAnomaly({ t }: StepCtx) {
  return (
    <Svg label="a reader, no writes of its own, sees an impossible state." h={200}>
      <Row y={70} label="the reader" value="wrote nothing" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="what it saw" value="no serial order could reach" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function RevealAdyaFormalization({ t }: StepCtx) {
  return (
    <Svg label="a dependency graph between transactions, not an English sentence." h={200}>
      <Row y={70} label="an anomaly" value="a cycle in the graph" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="checkable" value="not arguable" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function Recap({ t }: StepCtx) {
  return (
    <Svg label="eight anomalies, one ambiguity, one graph that made each one checkable." h={260}>
      <Row y={50} label="eight anomalies" value="named precisely" o={easeOut(seg(t, 0, 0.3))} />
      <Row y={95} label="ANSI's own English" value="genuinely ambiguous" o={easeOut(seg(t, 0.15, 0.45))} />
      <Row y={140} label="Adya's graph" value="closed the gap" valueColor={C.focus} o={easeOut(seg(t, 0.35, 0.7))} />
    </Svg>
  );
}

export function ProveIt({ t }: StepCtx) {
  return (
    <Svg label="two independent commits, a shared invariant broken across both. Which anomaly?" h={200}>
      <Row y={70} label="two reads, two commits" value="no value overwritten" o={easeOut(seg(t, 0, 0.4))} />
      <Row y={130} label="which anomaly" value="not yet revealed" valueColor={C.focus} o={easeOut(seg(t, 0.25, 0.65))} />
    </Svg>
  );
}
