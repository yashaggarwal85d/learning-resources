import { C, Svg, T, Draw } from '../../../../../reels/kit';
import { easeOut, seg } from '../../../../../reels/anim';
import type { StepCtx } from '../../../../../reels/types';

function Row({ y, label, value, valueColor = C.crema, o = 1 }: { y: number; label: string; value: string; valueColor?: string; o?: number }) {
  return (
    <g opacity={o}>
      <T x={25} y={y} s={14} f={C.latte}>
        {label}
      </T>
      <T x={575} y={y} s={16} f={valueColor} a="end">
        {value}
      </T>
    </g>
  );
}

function Hist({ x, y, bars, color = C.focus }: { x: number; y: number; bars: number[]; color?: string }) {
  const w = 18;
  const gap = 4;
  const maxH = 60;
  const maxBar = Math.max(...bars, 1);
  return (
    <g>
      {bars.map((h, i) => (
        <rect
          key={i}
          x={x + i * (w + gap)}
          y={y + maxH - (h / maxBar) * maxH}
          width={w}
          height={(h / maxBar) * maxH}
          fill={color}
          opacity={0.85}
        />
      ))}
    </g>
  );
}

export function Hook({ t }: StepCtx) {
  return (
    <Svg label="PSI stays under 0.05 for months while live precision quietly halves." h={220}>
      <T x={25} y={40} s={13} f={C.latte}>
        PSI, every month
      </T>
      <Draw pts={[[25, 60], [560, 60]]} t={t} from={0.1} to={0.6} stroke={C.focus} w={1.5} />
      <T x={300} y={50} s={11} f={C.taupe} a="middle">
        flat, under 0.05
      </T>
      <T x={25} y={110} s={13} f={C.latte}>
        live precision, every month
      </T>
      <Draw pts={[[25, 130], [560, 175]]} t={t} from={0.3} to={0.8} stroke={C.cherryText} w={1.5} />
      <T x={300} y={200} s={13} f={C.taupe} a="middle">
        no drift, by that number. The model quietly got worse anyway.
      </T>
    </Svg>
  );
}

export function PredictWhatItMisses({ t }: StepCtx) {
  return (
    <Svg label="what kind of drift does a per-feature distribution test structurally miss?" h={220}>
      <Row y={60} label="the input distribution" value="flat" valueColor={C.focus} o={easeOut(seg(t, 0, 0.3))} />
      <Row y={105} label="what the input predicts" value="?" valueColor={C.cherryText} o={easeOut(seg(t, 0.15, 0.45))} />
    </Svg>
  );
}

export function RevealDataVsConceptDrift({ t }: StepCtx) {
  return (
    <Svg label="data drift: the input moves. Concept drift: the relationship to the label moves." h={240}>
      <T x={25} y={35} s={13} f={C.latte}>
        data drift
      </T>
      <Hist x={25} y={45} bars={[4, 8, 10, 6, 2]} color={C.focus} />
      <Hist x={25} y={45} bars={[1, 3, 8, 10, 7]} color={C.cherryText} />
      <T x={300} y={35} s={13} f={C.latte}>
        concept drift
      </T>
      <Hist x={300} y={45} bars={[4, 8, 10, 6, 2]} color={C.focus} />
      <Hist x={300} y={45} bars={[4, 8, 10, 6, 2]} color={C.cherryText} />
      <T x={340} y={130} s={11} f={C.taupe} a="middle">
        same shape, different meaning
      </T>
    </Svg>
  );
}

export function RevealThreeTestsAgree({ t }: StepCtx) {
  return (
    <Svg label="PSI, KS and Jensen-Shannon, run on the same obvious shift — all three agree." h={220}>
      <Row y={55} label="PSI" value="1.631 (flagged)" valueColor={C.cherryText} o={easeOut(seg(t, 0, 0.3))} />
      <Row y={95} label="KS statistic" value="0.499 (flagged)" valueColor={C.cherryText} o={easeOut(seg(t, 0.15, 0.45))} />
      <Row y={135} label="Jensen-Shannon distance" value="0.512 (flagged)" valueColor={C.cherryText} o={easeOut(seg(t, 0.3, 0.6))} />
    </Svg>
  );
}

export function RevealDisagreementCase({ t }: StepCtx) {
  return (
    <Svg label="a narrow, concentrated shift: PSI's coarse deciles stay quiet, KS registers more." h={220}>
      <Row y={55} label="PSI, decile bins" value="0.012 (quiet)" valueColor={C.focus} o={easeOut(seg(t, 0, 0.3))} />
      <Row y={95} label="KS, every point" value="0.022" valueColor={C.cherryText} o={easeOut(seg(t, 0.15, 0.45))} />
      <T x={300} y={145} s={12} f={C.taupe} a="middle">
        the same shift, read at two different resolutions
      </T>
    </Svg>
  );
}

export function RevealNullRateCreep({ t }: StepCtx) {
  const n = easeOut(seg(t, 0.2, 0.9));
  return (
    <Svg label="mean-imputation absorbs a null-rate creep; the null-rate check still catches it." h={220}>
      <T x={25} y={40} s={13} f={C.latte}>
        PSI on the imputed column
      </T>
      <rect x={25} y={55} width={520} height={20} rx={4} fill={C.cocoa} />
      <rect x={25} y={55} width={520 * 0.091 * 5} height={20} rx={4} fill={C.focus} opacity={0.85} />
      <T x={575} y={70} s={12} f={C.taupe} a="end">
        0.091, just under the flag
      </T>
      <T x={25} y={115} s={13} f={C.latte}>
        the null rate itself
      </T>
      <rect x={25} y={130} width={520} height={20} rx={4} fill={C.cocoa} />
      <rect x={25} y={130} width={520 * 0.118 * n * 5} height={20} rx={4} fill={C.cherryText} opacity={0.9} />
      <T x={575} y={145} s={12} f={C.cherryText} a="end">
        11.8%, clearly elevated
      </T>
    </Svg>
  );
}

export function RevealProxyMetrics({ t }: StepCtx) {
  const proxies = ['input distribution', 'output distribution', 'confidence scores', 'downstream signals'];
  return (
    <Svg label="while the true label is weeks away, a team watches named proxies instead." h={220}>
      {proxies.map((p, i) => (
        <g key={p} opacity={easeOut(seg(t, 0.1 + i * 0.15, 0.3 + i * 0.15))}>
          <circle cx={40} cy={45 + i * 35} r={4} fill={C.focus} />
          <T x={55} y={50 + i * 35} s={13} f={C.crema}>
            {p}
          </T>
        </g>
      ))}
    </Svg>
  );
}

export function RevealProxyDoesNotProve({ t }: StepCtx) {
  return (
    <Svg label="PSI on the feature stayed near zero while real precision collapsed from 1.00 to 0.00." h={220}>
      <Row y={60} label="PSI on the feature" value="0.007 (quiet)" valueColor={C.focus} o={easeOut(seg(t, 0, 0.35))} />
      <Row y={105} label="real precision" value="1.00 → 0.00" valueColor={C.cherryText} o={easeOut(seg(t, 0.25, 0.6))} />
      <T x={300} y={150} s={12} f={C.taupe} a="middle" o={easeOut(seg(t, 0.6, 0.85))}>
        the proxy stayed quiet while the real thing failed
      </T>
    </Svg>
  );
}

export function Recap({ t }: StepCtx) {
  return (
    <Svg label="data drift vs. concept drift. Three tests that disagree on purpose. A null-rate check. Proxies that only partly prove." h={270}>
      <g opacity={easeOut(seg(t, 0, 0.3))}>
        <T x={25} y={36} s={14} f={C.latte}>drift, two kinds</T>
        <T x={25} y={62} s={15} f={C.crema}>the input moving, or its meaning moving</T>
      </g>
      <g opacity={easeOut(seg(t, 0.15, 0.45))}>
        <T x={25} y={96} s={14} f={C.latte}>three tests</T>
        <T x={25} y={122} s={15} f={C.crema}>PSI, KS, Jensen-Shannon — disagree on purpose</T>
      </g>
      <g opacity={easeOut(seg(t, 0.3, 0.6))}>
        <T x={25} y={156} s={14} f={C.latte}>null-rate creep</T>
        <T x={25} y={182} s={15} f={C.crema}>checked directly, not inferred from a distribution</T>
      </g>
      <g opacity={easeOut(seg(t, 0.45, 0.75))}>
        <T x={25} y={216} s={14} f={C.latte}>a proxy's movement</T>
        <T x={25} y={242} s={15} f={C.crema}>suggestive, never proof, of real performance</T>
      </g>
    </Svg>
  );
}

export function ProveIt({ t }: StepCtx) {
  return (
    <Svg label="PSI, KS and JS all agree there's no drift; precision has visibly dropped anyway." h={220}>
      <Row y={55} label="PSI, KS, Jensen-Shannon" value="no drift" valueColor={C.focus} o={easeOut(seg(t, 0, 0.3))} />
      <Row y={95} label="live precision" value="visibly down" valueColor={C.cherryText} o={easeOut(seg(t, 0.15, 0.45))} />
      <T x={300} y={150} s={13} f={C.taupe} a="middle" w={560}>
        trust the three tests, or the proxy you can observe sooner?
      </T>
    </Svg>
  );
}
