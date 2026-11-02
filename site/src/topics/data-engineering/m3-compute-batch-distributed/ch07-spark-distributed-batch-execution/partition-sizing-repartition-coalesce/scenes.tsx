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
    <Svg label="the shuffle's own biggest lever: how many pieces is the work actually cut into?" h={200}>
      <Row y={70} label="the same shuffle" value="how many pieces?" o={easeOut(seg(t, 0, 0.6))} />
      <Row y={130} label="what sets that number" value="not yet revealed" valueColor={C.focus} o={easeOut(seg(t, 0.4, 1))} />
    </Svg>
  );
}

export function RevealShuffleConfig({ t }: StepCtx) {
  return (
    <Svg label="measured: the identical group-by produces exactly as many output partitions as one config says, every time." h={200}>
      <Row y={70} label="config set to 4" value="4 partitions out" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="config set to 17" value="17 partitions out" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function PredictRepartitionShuffle({ t }: StepCtx) {
  return (
    <Svg label="repartition asks for a new partition count. Does getting there require a real shuffle?" h={200}>
      <Row y={70} label="repartition to fewer pieces" value="a real shuffle?" />
      <Row y={130} label="its own plan" value="not yet revealed" valueColor={C.focus} />
    </Svg>
  );
}

export function RevealRepartitionShuffles({ t }: StepCtx) {
  return (
    <Svg label="measured: repartition's own plan carries a real Exchange node. Every row gets redistributed to land evenly." h={200}>
      <Row y={70} label="repartition(3)" value="3 even partitions" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="its own plan" value="a real Exchange" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function PredictCoalesceShuffle({ t }: StepCtx) {
  return (
    <Svg label="coalesce asks for the same lower count. Does it shuffle the exact same way repartition just did?" h={200}>
      <Row y={70} label="coalesce to the same count" value="shuffles too?" />
      <Row y={130} label="its own plan" value="not yet revealed" valueColor={C.focus} />
    </Svg>
  );
}

export function RevealCoalesceNoShuffle({ t }: StepCtx) {
  return (
    <Svg label="measured: coalesce reaches the same count with no Exchange at all, by merging pieces, not redistributing rows." h={200}>
      <Row y={70} label="coalesce(3)" value="3 partitions, no Exchange" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="coalesce(20), starting from 8" value="stays at 8" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function PredictCoalesceOneTrap({ t }: StepCtx) {
  return (
    <Svg label="coalesce(1) merges everything into one final piece. Does it only shrink that final output, or something upstream too?" h={200}>
      <Row y={70} label="coalesce down to one piece" value="just the output?" />
      <Row y={130} label="what it touches" value="not yet revealed" valueColor={C.focus} />
    </Svg>
  );
}

export function RevealCoalesceOneCollapse({ t }: StepCtx) {
  return (
    <Svg label="measured: all eight upstream partitions merge into that one task too. Every single row lands in one place." h={200}>
      <Row y={70} label="eight-partition read" value="collapsed to one task" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="rows inside it" value="all of them" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function Recap({ t }: StepCtx) {
  return (
    <Svg label="one config sets the count, one call shuffles to get there, one call merges instead, and one number can collapse everything upstream." h={260}>
      <Row y={50} label="shuffle partition count" value="a direct config" o={easeOut(seg(t, 0, 0.3))} />
      <Row y={95} label="repartition" value="real shuffle, even sizes" o={easeOut(seg(t, 0.15, 0.45))} />
      <Row y={140} label="coalesce" value="merge, no shuffle" o={easeOut(seg(t, 0.25, 0.55))} />
      <Row y={185} label="coalesce(1)" value="collapses it all upstream" valueColor={C.focus} o={easeOut(seg(t, 0.4, 0.75))} />
    </Svg>
  );
}
