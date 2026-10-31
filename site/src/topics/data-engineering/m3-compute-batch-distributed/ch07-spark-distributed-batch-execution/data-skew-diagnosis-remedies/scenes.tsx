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
    <Svg label="one key holds twice the rows of the other 999 combined. What happens to the one task that gets it?" h={200}>
      <Row y={70} label="one key's row share" value="2x the rest, combined" o={easeOut(seg(t, 0, 0.6))} />
      <Row y={130} label="one task's workload" value="not yet revealed" valueColor={C.focus} o={easeOut(seg(t, 0.4, 1))} />
    </Svg>
  );
}

export function RevealBaseline({ t }: StepCtx) {
  return (
    <Svg label="measured: a straggler shows up as a ratio, not a look at the raw data." h={200}>
      <Row y={70} label="max/median shuffle bytes" value="12.2x" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="max/median task duration" value="~4x" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function PredictAqeDefault({ t }: StepCtx) {
  return (
    <Svg label="AQE already splits skewed partitions automatically. Does turning it on, with defaults, fix this?" h={200}>
      <Row y={70} label="AQE skew-join, defaults" value="fixes it?" />
      <Row y={130} label="bytes ratio after" value="not yet revealed" valueColor={C.focus} />
    </Svg>
  );
}

export function RevealAqeDefaultFails({ t }: StepCtx) {
  return (
    <Svg label="measured: unchanged. The default skew threshold never triggers at this data's scale." h={200}>
      <Row y={70} label="default skew threshold" value="256 MB" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="this partition's real size" value="~155 MB, too small" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function ElaborateAqeTuned({ t }: StepCtx) {
  return (
    <Svg label="retuned to the data's own scale, the same rule actually splits the skewed partition." h={200}>
      <Row y={70} label="threshold retuned to data" value="partition splits" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="bytes ratio after" value="1.1x, confirmed" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function PredictBroadcast({ t }: StepCtx) {
  return (
    <Svg label="a much blunter tool, with no AQE config involved at all. Does it fix the skew too?" h={200}>
      <Row y={70} label="broadcast the small side" value="fixes it?" />
      <Row y={130} label="shuffle on the fact table" value="not yet revealed" valueColor={C.focus} />
    </Svg>
  );
}

export function RevealBroadcastWorks({ t }: StepCtx) {
  return (
    <Svg label="measured: no shuffle join of any kind in the plan. Nothing left to be skewed." h={200}>
      <Row y={70} label="join strategy" value="broadcast hash join" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="shuffle on the fact side" value="none, confirmed" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function ElaborateIsolate({ t }: StepCtx) {
  return (
    <Svg label="when the small side itself won't fit whole, isolate just the hot keys' rows instead." h={200}>
      <Row y={70} label="dim table too big" value="broadcast it all?" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="isolate hot keys" value="broadcast just those" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function RevealSaltingCost({ t }: StepCtx) {
  return (
    <Svg label="measured: salting helps, but it isn't free. Replicating the small side costs real bytes." h={200}>
      <Row y={70} label="salting bytes ratio" value="3.2x" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="total shuffled bytes" value="goes up" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function RevealCombinableNotSkewed({ t }: StepCtx) {
  return (
    <Svg label="measured: a sum over the same hot key isn't skewed at the shuffle at all." h={200}>
      <Row y={70} label="hot key's own shuffle write" value="59 bytes" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="a diverse-key partition" value="12,750 bytes, more" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function RevealNonCombinableSkewed({ t }: StepCtx) {
  return (
    <Svg label="measured: a list of the same hot key's values has nowhere to hide. AQE's rule never reaches it." h={200}>
      <Row y={70} label="one task's duration" value="over 10x median" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="AQE's skew rule matches" value="join nodes only" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function ElaborateTwoPhase({ t }: StepCtx) {
  return (
    <Svg label="salt the key, aggregate partially, then re-aggregate by the real key alone." h={200}>
      <Row y={70} label="before: one task" value="ratio: over 10x" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="after: salted" value="ratio: ~2.3x" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function Recap({ t }: StepCtx) {
  return (
    <Svg label="diagnose from the ratios first, then reach for the ladder in order — and remember what it was built for." h={280}>
      <Row y={50} label="evidence" value="ratio, one straggler" o={easeOut(seg(t, 0, 0.3))} />
      <Row y={100} label="join remedies" value="AQE, broadcast, salt" o={easeOut(seg(t, 0.15, 0.45))} />
      <Row y={150} label="never a join" value="aggregations, outer joins" valueColor={C.focus} o={easeOut(seg(t, 0.4, 0.75))} />
    </Svg>
  );
}
