import { C, Svg, T } from '../../../../../reels/kit';
import { easeOut, seg } from '../../../../../reels/anim';
import type { StepCtx } from '../../../../../reels/types';

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
    <Svg label="this chapter's one model, named by what it chose not to be." h={200}>
      <Row y={70} label="this chapter" value="one model, always" o={easeOut(seg(t, 0, 0.6))} />
      <Row y={130} label="this topic" value="what it isn't" valueColor={C.focus} o={easeOut(seg(t, 0.4, 1))} />
    </Svg>
  );
}

export function RevealTradeLatencyForRecovery({ t }: StepCtx) {
  return (
    <Svg label="Spark trades latency for recoverability -- every stage writes to disk first." h={200}>
      <Row y={70} label="Spark" value="writes first" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="a pipelined engine" value="stays in memory" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function PredictBatchVsRow({ t }: StepCtx) {
  return (
    <Svg label="the same computation, large batches vs one row at a time. Which is faster, per row?" h={200}>
      <Row y={70} label="same computation" value="batch, or row?" />
      <Row y={130} label="faster per row?" value="not yet revealed" valueColor={C.focus} />
    </Svg>
  );
}

export function RevealBatchFaster({ t }: StepCtx) {
  return (
    <Svg label="measured: the batched version is faster, by a wide margin, per row." h={200}>
      <Row y={70} label="one row" value="slower, measured" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="large batches" value="faster, measured" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function ElaborateGiveUpOnFailure({ t }: StepCtx) {
  return (
    <Svg label="that speed is what a row-at-a-time exchange gives up on failure." h={200}>
      <Row y={70} label="no stage boundary" value="nothing to retry" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="one failed task" value="fails the query" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function PredictMemoryGrowth({ t }: StepCtx) {
  return (
    <Svg label="streaming row by row vs materialising the whole result. Whose memory grows with row count?" h={200}>
      <Row y={70} label="streaming, or" value="materialising?" />
      <Row y={130} label="memory grows?" value="not yet revealed" valueColor={C.focus} />
    </Svg>
  );
}

export function RevealMemoryGrows({ t }: StepCtx) {
  return (
    <Svg label="measured: materialising grows with row count. Streaming stays flat." h={200}>
      <Row y={70} label="materialising" value="grows, measured" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="streaming" value="flat, measured" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function ElaborateFTEConverges({ t }: StepCtx) {
  return (
    <Svg label="fault-tolerant execution is the convergence point -- spooling exchange data on purpose." h={200}>
      <Row y={70} label="TASK retry" value="spools on purpose" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="buys back" value="Spark's own recovery" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function RevealThreeModels({ t }: StepCtx) {
  return (
    <Svg label="three real models, three different trades." h={260}>
      <Row y={60} label="Spark" value="recoverable, slower" o={easeOut(seg(t, 0, 0.4))} />
      <Row y={120} label="pipelined exchange" value="fast, fragile" valueColor={C.focus} o={easeOut(seg(t, 0.25, 0.7))} />
      <Row y={180} label="Ray Data" value="streams, bounded" valueColor={C.focus} o={easeOut(seg(t, 0.5, 1))} />
    </Svg>
  );
}

export function Recap({ t }: StepCtx) {
  return (
    <Svg label="one chapter, one model -- now named against two others, by what each gives up." h={280}>
      <Row y={50} label="Spark" value="materialised, recoverable" o={easeOut(seg(t, 0, 0.3))} />
      <Row y={100} label="pipelined exchange" value="in-memory, fragile" o={easeOut(seg(t, 0.15, 0.45))} />
      <Row y={150} label="Ray Data" value="streamed, bounded" valueColor={C.focus} o={easeOut(seg(t, 0.4, 0.75))} />
    </Svg>
  );
}
