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
    <Svg label="same stream, same key, four different window shapes drawn under one time axis" h={200}>
      <Row y={70} label="tumbling to sliding" value="pane count jumps" o={easeOut(seg(t, 0, 0.6))} />
      <Row y={130} label="two sessions" value="merge into one" valueColor={C.focus} o={easeOut(seg(t, 0.4, 1))} />
    </Svg>
  );
}

export function Setup({ t }: StepCtx) {
  return (
    <Svg label="a window is the concrete chunk of time a watermark's claim gets applied to" h={200}>
      <Row y={70} label="watermark" value="says when enough" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="window" value="the chunk itself" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function PredictStateCost({}: StepCtx) {
  return (
    <Svg label="same stream, same window size — does the shape change the cost?" h={200}>
      <Row y={70} label="tumbling" value="one copy each" />
      <Row y={130} label="sliding" value="same cost?" valueColor={C.focus} />
    </Svg>
  );
}

export function RevealStateCost({ t }: StepCtx) {
  return (
    <Svg label="tumbling assigns once; sliding duplicates into every window it overlaps" h={200}>
      <Row y={70} label="tumbling" value="one copy each" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="sliding, half overlap" value="nearly double" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function RevealSessionMerge({ t }: StepCtx) {
  return (
    <Svg label="no fixed shape — a late record inside the gap pulls two sessions into one" h={200}>
      <Row y={70} label="two sessions" value="stay separate" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="one late record" value="merges them" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function PredictGlobalFires({}: StepCtx) {
  return (
    <Svg label="one window, the whole stream, no end at all — does the default trigger ever fire?" h={200}>
      <Row y={70} label="global window" value="no natural end" />
      <Row y={130} label="default trigger" value="ever fires?" valueColor={C.focus} />
    </Svg>
  );
}

export function RevealGlobalInert({ t }: StepCtx) {
  return (
    <Svg label="the default trigger waits for the watermark to pass the window's end, which never comes" h={200}>
      <Row y={70} label="default trigger" value="zero fires" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="custom trigger" value="fires on demand" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function RevealPaneCleanup({ t }: StepCtx) {
  return (
    <Svg label="every pane closes once the watermark, plus lateness, passes its window's end" h={200}>
      <Row y={70} label="live panes" value="rise, then fall" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="source goes idle" value="all panes close" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function ProveIt({ t }: StepCtx) {
  return (
    <Svg label="this topic's own real run, every number read straight off it" h={260}>
      <Row y={50} label="state cost" value="measured, not guessed" o={easeOut(seg(t, 0, 0.3))} />
      <Row y={95} label="session merge" value="two became one" o={easeOut(seg(t, 0.1, 0.4))} />
      <Row y={140} label="pane cleanup" value="peak, then zero" valueColor={C.focus} o={easeOut(seg(t, 0.25, 0.6))} />
    </Svg>
  );
}

export function Recap({ t }: StepCtx) {
  return (
    <Svg label="four shapes, four notions of an end, a cost that scales, state that must die" h={260}>
      <Row y={50} label="tumbling, sliding" value="cost scales up" o={easeOut(seg(t, 0, 0.3))} />
      <Row y={95} label="session, global" value="no fixed end" o={easeOut(seg(t, 0.1, 0.4))} />
      <Row y={140} label="every pane" value="must eventually close" valueColor={C.focus} o={easeOut(seg(t, 0.25, 0.6))} />
    </Svg>
  );
}
