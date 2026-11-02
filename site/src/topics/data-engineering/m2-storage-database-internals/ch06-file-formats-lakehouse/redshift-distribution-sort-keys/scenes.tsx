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
    <Svg label="two warehouses joined storage and compute over a network. a third lineage: redshift's shared-nothing mpp." h={200}>
      <TallRow y={40} label="two warehouses, joined over a network" value="storage and compute, split then rejoined" o={easeOut(seg(t, 0, 0.3))} />
      <TallRow y={100} label="a third lineage entirely" value="redshift's classic shared-nothing design" valueColor={C.focus} o={easeOut(seg(t, 0.25, 0.65))} />
    </Svg>
  );
}

export function PredictRowPlacement({ t }: StepCtx) {
  return (
    <Svg label="a table's rows across the cluster: a full copy on every node, or split up somehow?" h={200}>
      <TallRow y={40} label="rows have to land somewhere" value="across every node in the cluster" o={easeOut(seg(t, 0, 0.5))} />
      <TallRow y={100} label="a full copy on each node, or split up?" value="which is it, here?" valueColor={C.focus} o={easeOut(seg(t, 0.4, 1))} />
    </Svg>
  );
}

export function RevealLeaderComputeSlices({ t }: StepCtx) {
  return (
    <Svg label="a leader node coordinates; each compute node splits into slices; rows land by distribution style." h={230}>
      <TallRow y={40} label="a leader node coordinates" value="compute nodes do the work" o={easeOut(seg(t, 0, 0.35))} />
      <TallRow y={100} label="each compute node splits into slices" value="rows land by distribution style" valueColor={C.focus} o={easeOut(seg(t, 0.3, 0.7))} />
    </Svg>
  );
}

export function RevealDistributionStyles({ t }: StepCtx) {
  return (
    <Svg label="auto, even, key, all -- four styles, each placing rows differently, each with a different join cost." h={230}>
      <TallRow y={40} label="auto, even, key, all" value="four distribution styles" o={easeOut(seg(t, 0, 0.35))} />
      <TallRow y={100} label="each places rows differently" value="each carries a different join cost" valueColor={C.focus} o={easeOut(seg(t, 0.3, 0.7))} />
    </Svg>
  );
}

export function RevealSortKeysBlockSkip({ t }: StepCtx) {
  return (
    <Svg label="a compound or interleaved sort key orders rows; the engine tracks each block's range and skips what can't match." h={230}>
      <TallRow y={40} label="compound or interleaved sort key" value="orders rows inside each block" o={easeOut(seg(t, 0, 0.35))} />
      <TallRow y={100} label="tracked min and max, per block" value="blocks outside the range get skipped" valueColor={C.focus} o={easeOut(seg(t, 0.3, 0.7))} />
    </Svg>
  );
}

export function PredictStorageComputeCoupling({ t }: StepCtx) {
  return (
    <Svg label="the last two topics split storage from compute. does scaling one here force scaling the other too?" h={200}>
      <TallRow y={40} label="the last two topics split storage from compute" value="joined back together over a network" o={easeOut(seg(t, 0, 0.5))} />
      <TallRow y={100} label="does scaling one force scaling the other, here?" value="or does this lineage avoid that?" valueColor={C.focus} o={easeOut(seg(t, 0.4, 1))} />
    </Svg>
  );
}

export function RevealRa3Serverless({ t }: StepCtx) {
  return (
    <Svg label="ra3 nodes decouple storage and compute through managed storage; serverless goes further, billing compute alone." h={230}>
      <TallRow y={40} label="ra3 managed storage" value="scales storage apart from compute" o={easeOut(seg(t, 0, 0.35))} />
      <TallRow y={100} label="serverless goes further" value="no nodes to size, at all" valueColor={C.focus} o={easeOut(seg(t, 0.3, 0.7))} />
    </Svg>
  );
}

export function RevealWlmConcurrencyScaling({ t }: StepCtx) {
  return (
    <Svg label="automatic wlm adjusts concurrency to the workload on its own; concurrency scaling adds a second cluster when needed." h={230}>
      <TallRow y={40} label="automatic wlm" value="adjusts concurrency on its own" o={easeOut(seg(t, 0, 0.35))} />
      <TallRow y={100} label="concurrency scaling" value="adds a second cluster when queries would queue" valueColor={C.focus} o={easeOut(seg(t, 0.3, 0.7))} />
    </Svg>
  );
}

export function RevealSpectrumAutoOptimization({ t }: StepCtx) {
  return (
    <Svg label="spectrum queries files sitting in s3 directly; automatic table optimization picks sort and distribution keys itself." h={230}>
      <TallRow y={40} label="spectrum" value="queries files in s3, no load step" o={easeOut(seg(t, 0, 0.35))} />
      <TallRow y={100} label="automatic table optimization" value="picks keys itself, no admin needed" valueColor={C.focus} o={easeOut(seg(t, 0.3, 0.7))} />
    </Svg>
  );
}

export function Recap({ t }: StepCtx) {
  return (
    <Svg label="a third lineage: nodes and slices, distribution styles, sort keys, ra3 and serverless, automatic tuning. next: warehouse or lakehouse." h={300}>
      <TallRow y={35} label="a third lineage: shared-nothing mpp" value="leader, compute nodes, and their slices" o={easeOut(seg(t, 0, 0.3))} />
      <TallRow y={100} label="distribution styles, sort keys, block skipping" value="ra3 and serverless decouple storage anyway" o={easeOut(seg(t, 0.1, 0.4))} />
      <TallRow y={165} label="three proprietary engines, now all taught" value="on their own terms, from their own docs" valueColor={C.focus} o={easeOut(seg(t, 0.25, 0.6))} />
      <g opacity={easeOut(seg(t, 0.55, 1))}>
        <T x={25} y={230} s={14} f={C.latte}>
          the handoff
        </T>
        <T x={25} y={256} s={16} f={C.focus} w={600}>
          one question left --
        </T>
        <T x={25} y={280} s={16} f={C.focus} w={600}>
          warehouse or lakehouse, and when
        </T>
      </g>
    </Svg>
  );
}
