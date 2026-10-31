import { C, Svg, T } from '../../../../../reels/kit';
import { easeOut, seg } from '../../../../../reels/anim';
import type { StepCtx } from '../../../../../reels/types';

export function Hook({ t }: StepCtx) {
  return (
    <Svg label="the same recommendation, the medium tier, read by two different rooms; the short one gets approved in five minutes, the long one tables the decision for two weeks." h={220}>
      <T x={25} y={40} s={14} f={C.latte}>
        one page
      </T>
      <T x={25} y={65} s={16} f={C.crema}>
        approved in five minutes
      </T>
      <T x={25} y={120} s={14} f={C.latte}>
        twelve pages, same decision
      </T>
      <T x={25} y={145} s={16} f={C.cherryText}>
        tabled for two weeks
      </T>
      <T x={25} y={195} s={13} f={C.taupe}>
        the facts didn't change. The document did.
      </T>
    </Svg>
  );
}

export function PredictWhyDifferent({ t }: StepCtx) {
  return (
    <Svg label="why did the identical recommendation land so differently in the same room?" h={180}>
      <T x={300} y={70} s={14} f={C.latte} a="middle" o={easeOut(seg(t, 0, 0.3))}>
        why so different
      </T>
      <T x={300} y={110} s={16} f={C.focus} a="middle" o={easeOut(seg(t, 0.2, 0.5))}>
        ?
      </T>
    </Svg>
  );
}

export function RevealCostInBusinessTerms({ t }: StepCtx) {
  return (
    <Svg label="the same three tiers, restated in dollars and in the risk of a wrong number reaching a plant manager, not the terms that built them." h={200}>
      <T x={25} y={45} s={14} f={C.latte}>
        built in compute, storage, pipelines
      </T>
      <T x={25} y={70} s={16} f={C.crema}>
        the engineering terms
      </T>
      <T x={25} y={130} s={14} f={C.latte}>
        weighed in dollars, in risk
      </T>
      <T x={25} y={155} s={16} f={C.cherryText}>
        the terms a decision-maker uses
      </T>
    </Svg>
  );
}

export function RevealDominantLever({ t }: StepCtx) {
  const rows = ['base infrastructure', 'recompute + streaming'];
  return (
    <Svg label="of everything that makes the fast tier expensive, one lever — how often it recomputes — drives nearly all of the gap." h={200}>
      {rows.map((r, i) => (
        <g key={r} opacity={easeOut(seg(t, 0.05 + i * 0.25, 0.3 + i * 0.25))}>
          <rect x={30} y={30 + i * 70} width={i === 1 ? 260 : 60} height={26} fill={i === 1 ? C.focus : C.taupe} opacity={0.5} />
          <T x={30} y={76 + i * 70} s={14} f={C.crema}>
            {r}
          </T>
        </g>
      ))}
    </Svg>
  );
}

export function RevealBoringChoice({ t }: StepCtx) {
  return (
    <Svg label="the medium tier isn't the fastest option, and that's the argument for it, stated in terms a non-engineer weighs." h={200}>
      <T x={25} y={45} s={14} f={C.latte}>
        not the fastest option
      </T>
      <T x={25} y={70} s={16} f={C.crema}>
        the medium tier
      </T>
      <T x={25} y={130} s={14} f={C.latte}>
        cheaper, lower risk, defended
      </T>
      <T x={25} y={155} s={16} f={C.cherryText}>
        in the room's own terms
      </T>
    </Svg>
  );
}

export function RevealBluf({ t }: StepCtx) {
  const w1 = 200;
  const w2 = 340;
  return (
    <Svg label="a one-page summary for the room with five minutes, decoded away to reveal the much longer document behind it for the review that checks the reasoning." h={220}>
      <g opacity={easeOut(seg(t, 0, 0.35))}>
        <rect x={25} y={20} width={w1} height={24} fill={C.focus} opacity={0.5} />
        <T x={25} y={62} s={14} f={C.crema}>
          one page, bottom line first
        </T>
      </g>
      <g opacity={easeOut(seg(t, 0.35, 0.7))}>
        <rect x={25} y={100} width={w2} height={24} fill={C.taupe} opacity={0.35} />
        <T x={25} y={142} s={14} f={C.cherryText}>
          the deep dive behind it
        </T>
      </g>
    </Svg>
  );
}

export function RevealWhatBelongsWhere({ t }: StepCtx) {
  return (
    <Svg label="the one-pager carries the recommendation, the cost, and the one dominant lever; the deep dive carries the full comparison, the non-goals and the error-budget math." h={200}>
      <T x={25} y={45} s={14} f={C.latte}>
        the one-pager
      </T>
      <T x={25} y={70} s={16} f={C.crema}>
        recommendation, cost, the lever
      </T>
      <T x={25} y={130} s={14} f={C.latte}>
        the deep dive
      </T>
      <T x={25} y={155} s={16} f={C.cherryText}>
        the full comparison, every non-goal
      </T>
    </Svg>
  );
}

export function Recap({ t }: StepCtx) {
  return (
    <Svg label="the same decision, restated in business terms, its one dominant lever named, a boring choice defended, and a one-page summary paired with the deep dive behind it." h={300}>
      <g opacity={easeOut(seg(t, 0, 0.3))}>
        <T x={25} y={36} s={14} f={C.latte}>cost, in business terms</T>
        <T x={25} y={62} s={15} f={C.crema}>dollars and risk, not compute and storage</T>
      </g>
      <g opacity={easeOut(seg(t, 0.15, 0.45))}>
        <T x={25} y={96} s={14} f={C.latte}>one dominant lever, named</T>
        <T x={25} y={122} s={15} f={C.crema}>not a list of five equal factors</T>
      </g>
      <g opacity={easeOut(seg(t, 0.3, 0.6))}>
        <T x={25} y={156} s={14} f={C.latte}>the boring choice, defended</T>
        <T x={25} y={182} s={15} f={C.crema}>not the fastest option, and that's the point</T>
      </g>
      <g opacity={easeOut(seg(t, 0.45, 0.75))}>
        <T x={25} y={216} s={14} f={C.latte}>one page, then the deep dive</T>
        <T x={25} y={242} s={15} f={C.crema}>the top of a curve, not the only option</T>
      </g>
    </Svg>
  );
}

export function ProveIt({ t }: StepCtx) {
  return (
    <Svg label="a stakeholder reads only the one-pager's bottom line and approves the fastest tier because faster sounds strictly better. What's missing from the one-pager itself?" h={200}>
      <T x={25} y={50} s={13} f={C.latte} o={easeOut(seg(t, 0, 0.3))}>
        the bottom line, read alone
      </T>
      <T x={25} y={75} s={15} f={C.focus} o={easeOut(seg(t, 0, 0.3))}>
        the fast tier, approved
      </T>
      <T x={25} y={130} s={13} f={C.latte} o={easeOut(seg(t, 0.2, 0.5))}>
        what's missing from the page itself
      </T>
      <T x={25} y={155} s={15} f={C.cherryText} o={easeOut(seg(t, 0.2, 0.5))}>
        ?
      </T>
    </Svg>
  );
}
