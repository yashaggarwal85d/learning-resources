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
    <Svg label="both handle partitions. One answers, one stops. Both are right." h={200}>
      <Row y={70} label="system one" value="keeps answering" o={easeOut(seg(t, 0, 0.6))} />
      <Row y={130} label="system two" value="stops on one side" valueColor={C.focus} o={easeOut(seg(t, 0.4, 1))} />
    </Svg>
  );
}

export function PredictCaSystemDuringPartition({ t }: StepCtx) {
  return (
    <Svg label="it claims CA. What happens when a partition hits?" h={200}>
      <Row y={70} label="claimed" value="consistent and available" />
      <Row y={130} label="a real partition hits" value="not yet revealed" valueColor={C.focus} />
    </Svg>
  );
}

export function RevealCapStatedPrecisely({ t }: StepCtx) {
  return (
    <Svg label="not permanent. Only forced while a partition happens." h={200}>
      <Row y={70} label="outside a partition" value="nothing forces a trade" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="during a partition" value="a trade is forced" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function RevealPaVsPc({ t }: StepCtx) {
  return (
    <Svg label="answer and risk wrong, or refuse and stay correct." h={200}>
      <Row y={70} label="answer anyway" value="risk being wrong" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="refuse instead" value="stay correct" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function RevealPacelcAddition({ t }: StepCtx) {
  return (
    <Svg label="no partition at all, still a trade: latency vs consistency." h={200}>
      <Row y={70} label="no partition at all" value="still trading something" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="the trade" value="latency against consistency" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function PredictChoiceCarriesOver({ t }: StepCtx) {
  return (
    <Svg label="gives up consistency under partition. What about without one?" h={200}>
      <Row y={70} label="under partition" value="gives up consistency" />
      <Row y={130} label="with no partition" value="not yet revealed" valueColor={C.focus} />
    </Svg>
  );
}

export function RevealDynamoSpannerClassified({ t }: StepCtx) {
  return (
    <Svg label="Dynamo: PA/EL. Spanner: PC/EC. Opposite, both documented." h={260}>
      <Row y={50} label="Dynamo" value="PA / EL, own design" o={easeOut(seg(t, 0, 0.3))} />
      <Row y={95} label="Spanner" value="PC / EC, own design" o={easeOut(seg(t, 0.15, 0.45))} />
      <Row y={140} label="both axes" value="opposite choices" valueColor={C.focus} o={easeOut(seg(t, 0.35, 0.7))} />
    </Svg>
  );
}

export function RevealFailureDomainsPhysically({ t }: StepCtx) {
  return (
    <Svg label="process, host, rack, zone, region: real ways to partition." h={260}>
      <Row y={50} label="process, inside host" value="the smallest domain" o={easeOut(seg(t, 0, 0.3))} />
      <Row y={95} label="rack, inside zone" value="wider domains" o={easeOut(seg(t, 0.15, 0.45))} />
      <Row y={140} label="region" value="contains all of it" valueColor={C.focus} o={easeOut(seg(t, 0.35, 0.7))} />
    </Svg>
  );
}

export function Recap({ t }: StepCtx) {
  return (
    <Svg label="partition forces PA or PC. PACELC adds the always-there trade." h={260}>
      <Row y={50} label="during a partition" value="PA or PC, forced" o={easeOut(seg(t, 0, 0.3))} />
      <Row y={95} label="without one" value="PACELC's own trade" o={easeOut(seg(t, 0.15, 0.45))} />
      <Row y={140} label="both" value="real physical failures" valueColor={C.focus} o={easeOut(seg(t, 0.35, 0.7))} />
    </Svg>
  );
}

export function ProveIt({ t }: StepCtx) {
  return (
    <Svg label="one host crashes. What does that partition?" h={200}>
      <Row y={70} label="one host crashes" value="in one zone" o={easeOut(seg(t, 0, 0.4))} />
      <Row y={130} label="what it partitions" value="not yet revealed" valueColor={C.focus} o={easeOut(seg(t, 0.25, 0.65))} />
    </Svg>
  );
}
