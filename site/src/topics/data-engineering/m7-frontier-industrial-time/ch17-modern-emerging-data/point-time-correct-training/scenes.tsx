import { C, Svg, T, Draw, Plot, Reticle } from '../../../../../reels/kit';
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

/** The chapter's shared timeline: a baseline, a fixed label mark, and a feature point every beat. */
const BASE_Y = 180;
const LABEL_X = 330;
const FEATURE_PTS: [number, number][] = [
  [80, BASE_Y],
  [150, BASE_Y],
  [220, BASE_Y],
  [290, BASE_Y],
  [400, BASE_Y],
  [470, BASE_Y],
  [540, BASE_Y],
];

function Timeline({ t, drawFrom = 0 }: { t: number; drawFrom?: number }) {
  return (
    <g>
      <Draw pts={[[40, BASE_Y], [560, BASE_Y]]} t={t} from={drawFrom} to={drawFrom + 0.4} stroke={C.line} w={1.5} pen={false} />
      <line x1={LABEL_X} y1={BASE_Y - 55} x2={LABEL_X} y2={BASE_Y + 15} stroke={C.focus} strokeWidth={2} />
      <T x={LABEL_X} y={BASE_Y - 62} s={13} f={C.focus} a="middle">
        label moment
      </T>
    </g>
  );
}

export function Hook({ t }: StepCtx) {
  return (
    <Svg label="strong offline AUC. Barely better live. What got joined?" h={260}>
      <Row y={50} label="offline AUC" value="high" o={easeOut(seg(t, 0, 0.3))} />
      <Row y={95} label="live performance" value="barely better than chance" valueColor={C.badText} o={easeOut(seg(t, 0.15, 0.45))} />
      <Timeline t={t} drawFrom={0.4} />
      <Plot pts={FEATURE_PTS.filter((p) => p[0] < 400)} t={t} start={0.9} beat={0.15} r={4} fill={C.latte} />
      <Reticle x={540} y={BASE_Y} w={40} h={40} t={t} at={1.7} color={C.badText} />
      <T x={540} y={BASE_Y + 30} s={13} f={C.badText} a="middle">
        today
      </T>
    </Svg>
  );
}

export function PredictNaiveVsAsof({ t }: StepCtx) {
  return (
    <Svg label="current value, or value as of the label? Which AUC is real?" h={260}>
      <Timeline t={t} />
      <Plot pts={FEATURE_PTS} t={t} start={0.3} beat={0.08} r={4} fill={C.latte} />
      <Reticle x={540} y={BASE_Y} w={40} h={40} t={t} at={1.1} color={C.badText} />
      <T x={540} y={BASE_Y + 30} s={13} f={C.badText} a="middle">
        naive: today
      </T>
      <Reticle x={290} y={BASE_Y} w={40} h={40} t={t} at={1.4} color={C.focus} />
      <T x={290} y={BASE_Y + 30} s={13} f={C.focus} a="middle">
        as-of: label time
      </T>
    </Svg>
  );
}

export function RevealAsOfMechanism({ t }: StepCtx) {
  return (
    <Svg label="scan backward from the label. Stop at the first point at or before it." h={260}>
      <Timeline t={t} />
      <Plot pts={FEATURE_PTS.filter((p) => p[0] <= LABEL_X)} t={t} start={0.2} beat={0.12} r={4} fill={C.latte} />
      <Draw pts={[[LABEL_X, BASE_Y - 40], [290, BASE_Y - 10], [290, BASE_Y]]} t={t} from={0.8} to={1.3} stroke={C.focus} w={2} />
      <Reticle x={290} y={BASE_Y} w={36} h={36} t={t} at={1.3} color={C.focus} />
      <T x={300} y={40} s={13} f={C.crema} a="middle" w={600}>
        latest value at or before the label
      </T>
    </Svg>
  );
}

export function RevealTemporalLeakageMeasured({ t }: StepCtx) {
  const n = easeOut(seg(t, 0.2, 1));
  const a = easeOut(seg(t, 0.5, 1.3));
  return (
    <Svg label="naive AUC inflated by leakage; as-of AUC the honest number." h={220}>
      <T x={25} y={40} s={14} f={C.latte}>
        naive join (current value)
      </T>
      <rect x={25} y={55} width={520} height={28} rx={4} fill={C.cocoa} />
      <rect x={25} y={55} width={520 * n} height={28} rx={4} fill={C.cherry} />
      <T x={555} y={75} s={16} f={C.cherryText} a="end">
        inflated
      </T>
      <T x={25} y={125} s={14} f={C.latte}>
        as-of join (value at label time)
      </T>
      <rect x={25} y={140} width={520} height={28} rx={4} fill={C.cocoa} />
      <rect x={25} y={140} width={520 * 0.7 * a} height={28} rx={4} fill={C.focus} />
      <T x={555} y={160} s={16} f={C.crema} a="end">
        honest
      </T>
    </Svg>
  );
}

export function RevealPostOutcomeField({ t }: StepCtx) {
  const cells = Array.from({ length: 10 }, (_, i) => i);
  return (
    <Svg label="a field only churners have. No join timing fixes this." h={220}>
      <T x={300} y={40} s={14} f={C.crema} a="middle" w={600}>
        cancellation reason column
      </T>
      <g>
        {cells.map((i) => {
          const filled = i % 3 === 0;
          const k = easeOut(seg(t, 0.15 + i * 0.07, 0.15 + i * 0.07 + 0.3));
          return <rect key={i} x={30 + i * 55} y={70} width={44} height={44} rx={4} fill={filled ? C.cherry : C.cocoa} opacity={k} />;
        })}
      </g>
      <g opacity={easeOut(seg(t, 0.9, 1.2))}>
        <rect x={150} y={135} width={18} height={18} rx={3} fill={C.cherry} />
        <T x={174} y={149} s={12} f={C.cherryText}>
          churned
        </T>
        <rect x={330} y={135} width={18} height={18} rx={3} fill={C.cocoa} />
        <T x={354} y={149} s={12} f={C.taupe}>
          stayed
        </T>
      </g>
      <T x={300} y={190} s={13} f={C.taupe} a="middle" w={600}>
        the field exists only where the label does
      </T>
    </Svg>
  );
}

export function PredictTtlEdges({ t }: StepCtx) {
  return (
    <Svg label="too early, or past the TTL. What does each join to?" h={220}>
      <Row y={60} label="label older than any feature row" value="joins to?" o={easeOut(seg(t, 0, 0.3))} />
      <Row y={110} label="label past a 14-day TTL" value="joins to?" o={easeOut(seg(t, 0.15, 0.45))} />
      <Row y={160} label="guess" value="nearest value, or nothing" valueColor={C.focus} o={easeOut(seg(t, 0.3, 0.6))} />
    </Svg>
  );
}

export function RevealTtlMeasured({ t }: StepCtx) {
  return (
    <Svg label="both join to nothing, not the nearest guess." h={260}>
      <Timeline t={t} />
      <rect x={220} y={BASE_Y - 10} width={70} height={20} fill={C.cinnamon} opacity={0.18} />
      <Plot pts={[[220, BASE_Y]]} t={t} start={0.3} beat={0.1} r={4} fill={C.latte} />
      <Reticle x={LABEL_X} y={BASE_Y} w={36} h={36} t={t} at={0.9} color={C.badText} />
      <T x={LABEL_X} y={BASE_Y + 30} s={12} f={C.badText} a="middle">
        past TTL: null
      </T>
      <T x={150} y={BASE_Y - 30} s={12} f={C.taupe} a="middle">
        TTL window
      </T>
      <Reticle x={60} y={BASE_Y} w={36} h={36} t={t} at={1.2} color={C.badText} />
      <T x={60} y={BASE_Y + 30} s={12} f={C.badText} a="middle">
        too early: null
      </T>
    </Svg>
  );
}

export function RevealBackfillSameLogic({ t }: StepCtx) {
  const k = easeOut(seg(t, 0.2, 0.7));
  return (
    <Svg label="one transformation, two pipes. Not two transformations." h={240}>
      <rect x={220} y={30} width={160} height={40} rx={6} fill={C.panel} stroke={C.line} />
      <T x={300} y={54} s={13} f={C.crema} a="middle">
        one transformation
      </T>
      <Draw pts={[[300, 70], [150, 120], [150, 160]]} t={t} from={0.3} to={0.8} stroke={C.focus} w={2} />
      <Draw pts={[[300, 70], [450, 120], [450, 160]]} t={t} from={0.3} to={0.8} stroke={C.focus} w={2} />
      <T x={150} y={180} s={13} f={C.crema} a="middle">
        historical backfill
      </T>
      <T x={450} y={180} s={13} f={C.crema} a="middle">
        live serving
      </T>
      <g opacity={k}>
        <line x1={60} y1={220} x2={540} y2={220} stroke={C.badText} strokeWidth={1.5} strokeDasharray="4 4" />
        <T x={300} y={236} s={12} f={C.badText} a="middle">
          two separate boxes: a second feature, same name
        </T>
      </g>
    </Svg>
  );
}

export function Recap({ t }: StepCtx) {
  return (
    <Svg label="read as of the label; drop post-outcome fields; respect the TTL." h={260}>
      <Row y={50} label="as-of join" value="value at the label's moment" o={easeOut(seg(t, 0, 0.3))} />
      <Row y={95} label="post-outcome field" value="no join timing fixes it" o={easeOut(seg(t, 0.15, 0.45))} />
      <Row y={140} label="feature TTL" value="too old joins to nothing" valueColor={C.focus} o={easeOut(seg(t, 0.35, 0.7))} />
    </Svg>
  );
}

export function ProveIt({ t }: StepCtx) {
  const a = easeOut(seg(t, 0, 0.4));
  const b = easeOut(seg(t, 0.3, 0.7));
  return (
    <Svg label="backfilled from the warehouse, not the online code. Trustworthy?" h={220}>
      <g opacity={a}>
        <T x={25} y={60} s={15} f={C.latte}>
          new feature, backfilled
        </T>
        <T x={25} y={85} s={17} f={C.crema}>
          approximated from warehouse tables
        </T>
      </g>
      <g opacity={b}>
        <T x={25} y={140} s={15} f={C.latte}>
          is it the same feature
        </T>
        <T x={25} y={165} s={17} f={C.focus}>
          not yet revealed
        </T>
      </g>
    </Svg>
  );
}
