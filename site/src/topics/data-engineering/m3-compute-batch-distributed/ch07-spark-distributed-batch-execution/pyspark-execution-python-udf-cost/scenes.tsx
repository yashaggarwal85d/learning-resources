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
    <Svg label="codegen just fused three operators into one loop. What happens the moment one of them is your own Python function?" h={200}>
      <Row y={70} label="a user's own function" value="still fused in?" o={easeOut(seg(t, 0, 0.6))} />
      <Row y={130} label="what actually happens" value="not yet revealed" valueColor={C.focus} o={easeOut(seg(t, 0.4, 1))} />
    </Svg>
  );
}

export function PredictCanFuse({ t }: StepCtx) {
  return (
    <Svg label="Catalyst fuses operators it understands. Can it fuse a plain Python function the same way?" h={200}>
      <Row y={70} label="a plain Python function" value="fusable, or not?" />
      <Row y={130} label="codegen's own reach" value="not yet revealed" valueColor={C.focus} />
    </Svg>
  );
}

export function RevealOpaque({ t }: StepCtx) {
  return (
    <Svg label="measured: the pickled UDF's own path pickles every row, one at a time, to send it to a separate process." h={200}>
      <Row y={70} label="Python UDF to Catalyst" value="opaque, unreadable" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="each row crossing over" value="pickled, one by one" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function RevealThreeTimes({ t }: StepCtx) {
  return (
    <Svg label="measured: the identical doubling computation, timed three ways on the same three million rows." h={200}>
      <Row y={70} label="built-in expression" value="fastest, by far" o={easeOut(seg(t, 0, 0.4))} />
      <Row y={120} label="Arrow pandas UDF" value="several times slower" o={easeOut(seg(t, 0.2, 0.6))} />
      <Row y={170} label="pickled Python UDF" value="slowest of the three" valueColor={C.focus} o={easeOut(seg(t, 0.4, 1))} />
    </Svg>
  );
}

export function PredictWhyArrowFaster({ t }: StepCtx) {
  return (
    <Svg label="both UDFs leave the JVM for Python. Why is the Arrow one still so much faster than the pickled one?" h={200}>
      <Row y={70} label="both cross the boundary" value="so why the gap?" />
      <Row y={130} label="the real difference" value="not yet revealed" valueColor={C.focus} />
    </Svg>
  );
}

export function RevealBatchVsRow({ t }: StepCtx) {
  return (
    <Svg label="measured: Arrow crosses the boundary once per batch of rows. Pickling crosses it once per single row." h={200}>
      <Row y={70} label="Arrow UDF crossing" value="one whole batch" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="pickled UDF crossing" value="one row, every time" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function Recap({ t }: StepCtx) {
  return (
    <Svg label="three real speeds for the identical computation, and the one structural reason behind the whole gap." h={260}>
      <Row y={50} label="built-in expression" value="fully fused, fastest" o={easeOut(seg(t, 0, 0.3))} />
      <Row y={95} label="Arrow pandas UDF" value="batched crossing" o={easeOut(seg(t, 0.15, 0.45))} />
      <Row y={140} label="pickled Python UDF" value="per-row crossing" o={easeOut(seg(t, 0.25, 0.55))} />
      <Row y={185} label="rule of thumb" value="never pickled" valueColor={C.focus} o={easeOut(seg(t, 0.4, 0.75))} />
    </Svg>
  );
}
