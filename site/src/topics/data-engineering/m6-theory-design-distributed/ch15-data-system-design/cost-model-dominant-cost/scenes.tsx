import { C, Svg, T } from '../../../../../reels/kit';
import { easeOut, seg } from '../../../../../reels/anim';
import type { StepCtx } from '../../../../../reels/types';

/** A label-left / value-right row (DESIGN.md, phone text scaling). Keep each
 * side to 1-3 words: longer pairs overlap on phone widths. */
function Row({ y, label, value, valueColor = C.crema, o = 1 }: { y: number; label: string; value: string; valueColor?: string; o?: number }) {
  return (
    <g opacity={o}>
      <T x={25} y={y} s={15} f={C.latte}>
        {label}
      </T>
      <T x={575} y={y} s={16} f={valueColor} a="end" w={600}>
        {value}
      </T>
    </g>
  );
}

export function Hook({ t }: StepCtx) {
  return (
    <Svg label="the bill doubles while orders grow a fifth — a month of tuning saves little, one unwatched query dominates" h={270}>
      <T x={300} y={50} s={14} f={C.taupe} a="middle" o={easeOut(seg(t, 0, 0.5))}>
        a month of tuning
      </T>
      <T x={300} y={90} s={17} f={C.crema} a="middle" w={600} serif italic o={easeOut(seg(t, 0.15, 0.6))}>
        against one query's real share
      </T>
      <Row y={150} label="tuning effort" value="a month, small saving" o={easeOut(seg(t, 0.35, 0.65))} />
      <Row y={195} label="one dashboard query" value="most of the bill" valueColor={C.focus} o={easeOut(seg(t, 0.5, 0.8))} />
      <Row y={240} label="orders" value="up only a fifth" o={easeOut(seg(t, 0.65, 1))} />
    </Svg>
  );
}

export function Predict1({ t }: StepCtx) {
  return (
    <Svg label="which cost class does the waterfall actually show dominating?" h={210}>
      <Row y={75} label="compute" value="where the effort went" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={150} label="requests" value="one query's scan volume" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function RevealFiveClasses({ t }: StepCtx) {
  return (
    <Svg label="compute, storage, egress, requests, licence — each re-priced per thousand orders from a dated provider page" h={240}>
      <Row y={55} label="compute" value="instance-hours, scan-billed" o={easeOut(seg(t, 0, 0.3))} />
      <Row y={95} label="storage" value="GB-months, by tier" o={easeOut(seg(t, 0.12, 0.4))} />
      <Row y={135} label="egress" value="cross-AZ, cross-region" o={easeOut(seg(t, 0.24, 0.5))} />
      <Row y={175} label="requests" value="per-call, per-byte" valueColor={C.focus} o={easeOut(seg(t, 0.4, 0.68))} />
      <Row y={215} label="licence" value="per-seat, per-credit" o={easeOut(seg(t, 0.56, 0.85))} />
    </Svg>
  );
}

export function RevealWaterfall({ t }: StepCtx) {
  return (
    <Svg label="the five bars re-sorted by share of the bill — one bar, the query's own scan volume, towers over the rest" h={210}>
      <Row y={75} label="four classes" value="a small share, each" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={150} label="requests" value="most of the total" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function RevealThreeDominators({ t }: StepCtx) {
  return (
    <Svg label="scan volume, cross-AZ traffic, idle compute — the three shapes a dominating bar usually takes" h={210}>
      <Row y={75} label="scan volume" value="bytes read per query" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={150} label="cross-AZ, idle compute" value="the other two shapes" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function RevealLeverRatio({ t }: StepCtx) {
  return (
    <Svg label="a layout-and-pruning lever lands on the scan-volume bar — it shrinks by a measured ratio, not a guess" h={210}>
      <Row y={75} label="before the lever" value="the full scan bar" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={150} label="after the lever" value="a measured fraction left" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function RevealOtherLevers({ t }: StepCtx) {
  return (
    <Svg label="the same waterfall, redrawn for a design dominated instead by cross-AZ traffic, then by idle compute" h={210}>
      <Row y={75} label="cross-AZ dominant" value="fixed by locality" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={150} label="idle compute dominant" value="fixed by autoscaling" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function RevealSecondOrderCost({ t }: StepCtx) {
  return (
    <Svg label="the scan-volume lever's saving bar, with a thin second bar growing beside it: the cost the lever itself introduced" h={210}>
      <Row y={75} label="the lever's saving" value="a large bar, shrinking" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={150} label="write amplification" value="a thin bar, growing" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function Recap({ t }: StepCtx) {
  return (
    <Svg label="five classes, priced per unit; the waterfall finds the dominator; a lever moves it by a measured ratio; the lever has its own cost" h={290}>
      <Row y={45} label="five classes" value="priced per order" o={easeOut(seg(t, 0, 0.3))} />
      <Row y={100} label="waterfall" value="finds the dominator" o={easeOut(seg(t, 0.15, 0.45))} />
      <Row y={155} label="lever" value="a measured ratio" valueColor={C.focus} o={easeOut(seg(t, 0.35, 0.65))} />
      <Row y={210} label="every lever" value="its own second cost" o={easeOut(seg(t, 0.55, 0.85))} />
    </Svg>
  );
}

export function ProveIt({ t }: StepCtx) {
  return (
    <Svg label="a second price sheet cuts cross-AZ transfer sharply — does the same waterfall still show the same bar dominating?" h={250}>
      <Row y={65} label="a price sheet" value="cross-AZ cut sharply" o={easeOut(seg(t, 0, 0.4))} />
      <Row y={140} label="the dominator" value="not assumed, re-run" valueColor={C.focus} o={easeOut(seg(t, 0.3, 0.7))} />
      <Row y={215} label="the answer" value="it can move" o={easeOut(seg(t, 0.55, 1))} />
    </Svg>
  );
}
