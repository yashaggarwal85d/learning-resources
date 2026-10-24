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
    <Svg label="thousands of waiting connections, one thread — how does it serve all of them at once?" h={200}>
      <Row y={70} label="many connections" value="mostly waiting" />
      <Row y={130} label="one thread" value="serves all of them" valueColor={C.focus} />
    </Svg>
  );
}

export function RevealEventLoopQuote({ t }: StepCtx) {
  return (
    <Svg label="the core of every asyncio app: tasks, callbacks, network i/o, all on one thread" h={200}>
      <Row y={70} label="event loop" value="core of the app" o={easeOut(seg(t, 0, 0.6))} />
      <Row y={130} label="tasks, i/o" value="one thread" valueColor={C.focus} o={easeOut(seg(t, 0.4, 1))} />
    </Svg>
  );
}

export function PredictInterleaving({ t }: StepCtx) {
  return (
    <Svg label="many separate waits, one thread — does the total time add up, or stay close to one wait?" h={200}>
      <Row y={70} label="many waits" value="one thread" />
      <Row y={130} label="total time" value="adds up, or not?" />
    </Svg>
  );
}

export function RevealInterleavingMeasured({ t }: StepCtx) {
  return (
    <Svg label="many real waits, run concurrently — the measured total stays close to just one" h={200}>
      <Row y={70} label="real waits" value="run concurrently" o={easeOut(seg(t, 0, 0.6))} />
      <Row y={130} label="measured total" value="close to one wait" valueColor={C.focus} o={easeOut(seg(t, 0.4, 1))} />
    </Svg>
  );
}

export function RevealTaskGroupMeasured({ t }: StepCtx) {
  return (
    <Svg label="a real sibling failure cancels the rest of the group — measured, not assumed" h={200}>
      <Row y={70} label="sibling fails" value="for real" o={easeOut(seg(t, 0, 0.6))} />
      <Row y={130} label="rest of group" value="cancelled, measured" valueColor={C.focus} o={easeOut(seg(t, 0.4, 1))} />
    </Svg>
  );
}

export function RevealSemaphoreMeasured({ t }: StepCtx) {
  return (
    <Svg label="a real measured cap on concurrent requests — never past the semaphore's own limit" h={200}>
      <Row y={70} label="semaphore" value="a real cap" o={easeOut(seg(t, 0, 0.6))} />
      <Row y={130} label="peak measured" value="never past the limit" valueColor={C.focus} o={easeOut(seg(t, 0.4, 1))} />
    </Svg>
  );
}

export function PredictBlockingCost({ t }: StepCtx) {
  return (
    <Svg label="one coroutine blocks for real — does the cost stay with it, or reach every other one?" h={200}>
      <Row y={70} label="one coroutine" value="blocks for real" />
      <Row y={130} label="the cost" value="stays, or spreads?" />
    </Svg>
  );
}

export function RevealBlockingMeasured({ t }: StepCtx) {
  return (
    <Svg label="a real blocking call delays every sibling by its own full duration — then measurably fixed" h={260}>
      <Row y={60} label="blocking call" value="stalls every sibling" o={easeOut(seg(t, 0, 0.4))} />
      <Row y={120} label="run in executor" value="siblings freed" valueColor={C.focus} o={easeOut(seg(t, 0.2, 0.6))} />
      <Row y={180} label="measured" value="not assumed" o={easeOut(seg(t, 0.4, 1))} />
    </Svg>
  );
}

export function RevealTimeoutMeasured({ t }: StepCtx) {
  return (
    <Svg label="a slow task, wrapped in a deadline — cancelled near the deadline, measured for real" h={200}>
      <Row y={70} label="slow task" value="wrapped in a deadline" o={easeOut(seg(t, 0, 0.6))} />
      <Row y={130} label="cancelled" value="near the deadline" valueColor={C.focus} o={easeOut(seg(t, 0.4, 1))} />
    </Svg>
  );
}

export function RevealAsyncVsThreadsMeasured({ t }: StepCtx) {
  return (
    <Svg label="same fan-out, both ways — latency close; memory held per unit of concurrency is not" h={260}>
      <Row y={60} label="latency" value="close, both ways" o={easeOut(seg(t, 0, 0.4))} />
      <Row y={120} label="memory held" value="not close at all" valueColor={C.focus} o={easeOut(seg(t, 0.2, 0.6))} />
      <Row y={180} label="async db driver" value="real rows, measured" o={easeOut(seg(t, 0.4, 1))} />
    </Svg>
  );
}

export function Recap({ t }: StepCtx) {
  return (
    <Svg label="one loop, many waits, a real cap, a real stall, a real deadline, a real memory gap" h={260}>
      <Row y={60} label="one loop" value="interleaves for free" o={easeOut(seg(t, 0, 0.4))} />
      <Row y={120} label="semaphore, timeout" value="real limits" valueColor={C.focus} o={easeOut(seg(t, 0.2, 0.6))} />
      <Row y={180} label="threads vs async" value="memory, not latency" o={easeOut(seg(t, 0.4, 1))} />
    </Svg>
  );
}

export function ProveIt({ t }: StepCtx) {
  return (
    <Svg label="fan out to a flaky service, without one failure taking the batch down — which mechanisms combine?" h={200}>
      <Row y={70} label="flaky service" value="fan out, no overload" />
      <Row y={130} label="which mechanisms" value="combine to do it?" />
    </Svg>
  );
}
