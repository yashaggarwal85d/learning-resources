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
    <Svg label="a schedule says when a plan reruns. This is the bound on its state." h={200}>
      <Row y={70} label="micro-batch" value="runs on schedule" o={easeOut(seg(t, 0, 0.6))} />
      <Row y={130} label="this topic" value="bounds its state" valueColor={C.focus} o={easeOut(seg(t, 0.4, 1))} />
    </Svg>
  );
}

export function RevealWatermarkByHand({ t }: StepCtx) {
  return (
    <Svg label="measured: max event seen, minus delay -- lagging one trigger behind." h={200}>
      <Row y={70} label="watermark" value="max minus delay" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="applied" value="one trigger late" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function PredictLateCounted({ t }: StepCtx) {
  return (
    <Svg label="an event arrives late, inside the delay window. Counted, or dropped?" h={200}>
      <Row y={70} label="late event" value="inside delay" />
      <Row y={130} label="counted?" value="not yet revealed" valueColor={C.focus} />
    </Svg>
  );
}

export function RevealCounted({ t }: StepCtx) {
  return (
    <Svg label="measured: counted. Late, but its window hasn't been evicted yet." h={200}>
      <Row y={70} label="late event" value="still counted" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="its window" value="still alive" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function ElaborateNotLatenessAlone({ t }: StepCtx) {
  return (
    <Svg label="lateness alone isn't the test -- whether the window's state is alive is." h={200}>
      <Row y={70} label="not" value="how late" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="but" value="window alive?" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function PredictSameLatenessLater({ t }: StepCtx) {
  return (
    <Svg label="same lateness, one trigger later, past that window's own end. Counted?" h={200}>
      <Row y={70} label="same lateness" value="one trigger later" />
      <Row y={130} label="counted this time?" value="not yet revealed" valueColor={C.focus} />
    </Svg>
  );
}

export function RevealDropped({ t }: StepCtx) {
  return (
    <Svg label="measured: dropped. Never counted, in no window, anywhere." h={200}>
      <Row y={70} label="same lateness" value="dropped this time" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="its window" value="already evicted" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function ElaborateStateDies({ t }: StepCtx) {
  return (
    <Svg label="a window's state dies exactly when the watermark passes its own end." h={260}>
      <Row y={60} label="watermark" value="passes window end" o={easeOut(seg(t, 0, 0.4))} />
      <Row y={120} label="that window" value="state cleared" valueColor={C.focus} o={easeOut(seg(t, 0.25, 0.7))} />
      <Row y={180} label="not before" value="not later" valueColor={C.focus} o={easeOut(seg(t, 0.5, 1))} />
    </Svg>
  );
}

export function RevealGlobalWatermark({ t }: StepCtx) {
  return (
    <Svg label="multiple inputs: the minimum by default; configurable to the maximum." h={260}>
      <Row y={60} label="default" value="minimum, slowest wins" o={easeOut(seg(t, 0, 0.4))} />
      <Row y={120} label="configurable" value="maximum, faster output" valueColor={C.focus} o={easeOut(seg(t, 0.25, 0.7))} />
      <Row y={180} label="that tradeoff" value="data dropped regardless" valueColor={C.focus} o={easeOut(seg(t, 0.5, 1))} />
    </Svg>
  );
}

export function Recap({ t }: StepCtx) {
  return (
    <Svg label="a watermark bounds state by a window's own end, not by raw lateness." h={280}>
      <Row y={50} label="the watermark" value="max minus delay" o={easeOut(seg(t, 0, 0.3))} />
      <Row y={100} label="the real test" value="window alive?" o={easeOut(seg(t, 0.15, 0.45))} />
      <Row y={150} label="multiple inputs" value="slowest sets pace" valueColor={C.focus} o={easeOut(seg(t, 0.4, 0.75))} />
    </Svg>
  );
}
