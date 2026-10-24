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
    <Svg label="four threads, four cores, in most languages — often just one core in plain Python" h={200}>
      <Row y={70} label="four threads" value="four cores, usually" />
      <Row y={130} label="plain python" value="often just one" valueColor={C.focus} />
    </Svg>
  );
}

export function RevealGilQuote({ t }: StepCtx) {
  return (
    <Svg label="only one thread executes python bytecode at a time, by design" h={200}>
      <Row y={70} label="one thread" value="python bytecode" o={easeOut(seg(t, 0, 0.6))} />
      <Row y={130} label="by design" value="not an accident" valueColor={C.focus} o={easeOut(seg(t, 0.4, 1))} />
    </Svg>
  );
}

export function PredictGilRelease({ t }: StepCtx) {
  return (
    <Svg label="a thread calling into C instead of python bytecode — still serialized the same way?" h={200}>
      <Row y={70} label="thread calls C" value="not python code" />
      <Row y={130} label="still serialized" value="the same way?" />
    </Svg>
  );
}

export function RevealGilReleaseMeasured({ t }: StepCtx) {
  return (
    <Svg label="the same total work, threaded — a C hash function parallelizes, a python loop does not" h={200}>
      <Row y={70} label="C hash function" value="genuinely parallel" o={easeOut(seg(t, 0, 0.6))} />
      <Row y={130} label="python loop" value="no speedup at all" valueColor={C.focus} o={easeOut(seg(t, 0.4, 1))} />
    </Svg>
  );
}

export function RevealForkVsSpawnMeasured({ t }: StepCtx) {
  return (
    <Svg label="fork inherits the parent's memory; spawn starts fresh and never sees it at all" h={260}>
      <Row y={60} label="fork child" value="inherits memory" o={easeOut(seg(t, 0, 0.4))} />
      <Row y={120} label="spawn child" value="starts fresh" valueColor={C.focus} o={easeOut(seg(t, 0.2, 0.6))} />
      <Row y={180} label="spawn sees" value="none of it" o={easeOut(seg(t, 0.4, 1))} />
    </Svg>
  );
}

export function RevealPicklingMeasured({ t }: StepCtx) {
  return (
    <Svg label="anything a fresh child needs must be serialized first — a real, measured cost of its own" h={200}>
      <Row y={70} label="fresh child needs" value="data serialized first" o={easeOut(seg(t, 0, 0.6))} />
      <Row y={130} label="pickling" value="a real, measured cost" valueColor={C.focus} o={easeOut(seg(t, 0.4, 1))} />
    </Svg>
  );
}

export function PredictFreeThreadingCost({ t }: StepCtx) {
  return (
    <Svg label="remove the gil entirely — same single-thread speed, plus parallelism for free?" h={200}>
      <Row y={70} label="gil removed" value="entirely" />
      <Row y={130} label="same speed" value="plus free parallelism?" />
    </Svg>
  );
}

export function RevealFreeThreadingCostQuote({ t }: StepCtx) {
  return (
    <Svg label="a real single-thread penalty and real added memory — disclosed directly, not hidden" h={200}>
      <Row y={70} label="single-thread" value="measurably slower" o={easeOut(seg(t, 0, 0.6))} />
      <Row y={130} label="memory use" value="measurably higher" valueColor={C.focus} o={easeOut(seg(t, 0.4, 1))} />
    </Svg>
  );
}

export function RevealSubinterpreterMeasured({ t }: StepCtx) {
  return (
    <Svg label="a lower-level mechanism, run for real on this sandbox, genuinely scales across cores" h={200}>
      <Row y={70} label="subinterpreters" value="run for real here" o={easeOut(seg(t, 0, 0.6))} />
      <Row y={130} label="pure python work" value="genuinely scales" valueColor={C.focus} o={easeOut(seg(t, 0.4, 1))} />
    </Svg>
  );
}

export function RevealSubinterpreterTradeoffQuote({ t }: StepCtx) {
  return (
    <Svg label="isolated by default, no automatic threads, no shared gil — parallelism built on top" h={260}>
      <Row y={60} label="isolated" value="by default" o={easeOut(seg(t, 0, 0.4))} />
      <Row y={120} label="no shared gil" value="real cores" valueColor={C.focus} o={easeOut(seg(t, 0.2, 0.6))} />
      <Row y={180} label="parallelism" value="built on top" o={easeOut(seg(t, 0.4, 1))} />
    </Svg>
  );
}

export function Recap({ t }: StepCtx) {
  return (
    <Svg label="the gil, multiprocessing, free-threading, subinterpreters — each trade named plainly" h={260}>
      <Row y={60} label="gil" value="serializes bytecode" o={easeOut(seg(t, 0, 0.4))} />
      <Row y={120} label="multiprocessing" value="memory for a slow start" valueColor={C.focus} o={easeOut(seg(t, 0.2, 0.6))} />
      <Row y={180} label="subinterpreters" value="sharing for cores" o={easeOut(seg(t, 0.4, 1))} />
    </Svg>
  );
}

export function ProveIt({ t }: StepCtx) {
  return (
    <Svg label="four independent transforms, today, on a non-free-threaded python — subinterpreters alone enough?" h={200}>
      <Row y={70} label="four transforms" value="today, this sandbox" />
      <Row y={130} label="interpreters alone" value="enough by themselves?" />
    </Svg>
  );
}
