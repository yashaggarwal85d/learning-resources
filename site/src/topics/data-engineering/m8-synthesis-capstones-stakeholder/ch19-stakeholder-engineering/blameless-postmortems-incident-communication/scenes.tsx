import { C, Svg, T } from '../../../../../reels/kit';
import { easeOut, seg } from '../../../../../reels/anim';
import type { StepCtx } from '../../../../../reels/types';

export function Hook({ t }: StepCtx) {
  return (
    <Svg label="two companies suffer the identical stale-data incident; one disciplines the engineer and the mistake recurs, the other fixes the contributing factors for good." h={220}>
      <T x={25} y={40} s={14} f={C.latte}>
        company one: names the engineer
      </T>
      <T x={25} y={65} s={16} f={C.cherryText}>
        the same mistake recurs
      </T>
      <T x={25} y={120} s={14} f={C.latte}>
        company two: names the factors
      </T>
      <T x={25} y={145} s={16} f={C.crema}>
        the gap closes for good
      </T>
      <T x={25} y={195} s={13} f={C.taupe}>
        the identical incident. Two very different outcomes.
      </T>
    </Svg>
  );
}

export function PredictWhyOneHeld({ t }: StepCtx) {
  return (
    <Svg label="why did one company's fix hold, and the other's didn't?" h={180}>
      <T x={300} y={70} s={14} f={C.latte} a="middle" o={easeOut(seg(t, 0, 0.3))}>
        why one fix held
      </T>
      <T x={300} y={110} s={16} f={C.focus} a="middle" o={easeOut(seg(t, 0.2, 0.5))}>
        ?
      </T>
    </Svg>
  );
}

export function RevealTimeline({ t }: StepCtx) {
  const rows = ['detection', 'confirmation', 'fix deployed', 'resolved'];
  return (
    <Svg label="a real, timestamped timeline for the shop's own simulated incident, from first detection to resolution." h={220}>
      {rows.map((r, i) => (
        <g key={r} opacity={easeOut(seg(t, 0.04 + i * 0.2, 0.2 + i * 0.2))}>
          <T x={25} y={40 + i * 40} s={14} f={C.crema}>
            {r}
          </T>
        </g>
      ))}
    </Svg>
  );
}

export function RevealImpactInDataTerms({ t }: StepCtx) {
  return (
    <Svg label="not CPU or error rate; a number of stale rows, and a named list of plant decisions actually made on them." h={200}>
      <T x={25} y={45} s={14} f={C.latte}>
        not: CPU, error rate
      </T>
      <T x={25} y={70} s={16} f={C.cherryText}>
        infrastructure metrics
      </T>
      <T x={25} y={130} s={14} f={C.latte}>
        instead: stale rows, plant decisions
      </T>
      <T x={25} y={155} s={16} f={C.crema}>
        the terms the stakeholder judges by
      </T>
    </Svg>
  );
}

export function RevealContributingFactors({ t }: StepCtx) {
  return (
    <Svg label="a person who expects to be blamed won't tell you what really happened; looking for conditions instead of a culprit gets the honest version." h={200}>
      <T x={25} y={45} s={14} f={C.latte}>
        blame a person
      </T>
      <T x={25} y={70} s={16} f={C.cherryText}>
        the honest version stays hidden
      </T>
      <T x={25} y={130} s={14} f={C.latte}>
        name the conditions instead
      </T>
      <T x={25} y={155} s={16} f={C.crema}>
        the honest version comes out
      </T>
    </Svg>
  );
}

export function RevealActionItems({ t }: StepCtx) {
  return (
    <Svg label="every contributing factor gets a specific, owned action item, not a vague promise to be more careful." h={200}>
      <T x={25} y={45} s={14} f={C.latte}>
        not: "we'll be more careful"
      </T>
      <T x={25} y={70} s={16} f={C.cherryText}>
        a vague promise
      </T>
      <T x={25} y={130} s={14} f={C.latte}>
        instead: one owner, one fix
      </T>
      <T x={25} y={155} s={16} f={C.crema}>
        per contributing factor
      </T>
    </Svg>
  );
}

export function RevealLiveUpdate({ t }: StepCtx) {
  return (
    <Svg label="what gets told to the stakeholder while the incident is still live is a different document from the post-mortem written after." h={200}>
      <T x={25} y={45} s={14} f={C.latte}>
        while it's still live
      </T>
      <T x={25} y={70} s={16} f={C.crema}>
        what's broken, what's being done
      </T>
      <T x={25} y={130} s={14} f={C.latte}>
        after it's resolved
      </T>
      <T x={25} y={155} s={16} f={C.cherryText}>
        the post-mortem, a different document
      </T>
    </Svg>
  );
}

export function Recap({ t }: StepCtx) {
  return (
    <Svg label="a timestamped timeline, impact in data terms, contributing factors instead of blame, owned action items, and a live update that isn't the post-mortem." h={300}>
      <g opacity={easeOut(seg(t, 0, 0.3))}>
        <T x={25} y={36} s={14} f={C.latte}>impact, in data terms</T>
        <T x={25} y={62} s={15} f={C.crema}>stale rows, not CPU or error rate</T>
      </g>
      <g opacity={easeOut(seg(t, 0.15, 0.45))}>
        <T x={25} y={96} s={14} f={C.latte}>contributing factors, not blame</T>
        <T x={25} y={122} s={15} f={C.crema}>the only version that's actually honest</T>
      </g>
      <g opacity={easeOut(seg(t, 0.3, 0.6))}>
        <T x={25} y={156} s={14} f={C.latte}>action items, owned</T>
        <T x={25} y={182} s={15} f={C.crema}>one fix per factor, never a vague promise</T>
      </g>
      <g opacity={easeOut(seg(t, 0.45, 0.75))}>
        <T x={25} y={216} s={14} f={C.latte}>the live update, kept separate</T>
        <T x={25} y={242} s={15} f={C.crema}>not the same document as the post-mortem</T>
      </g>
    </Svg>
  );
}

export function ProveIt({ t }: StepCtx) {
  return (
    <Svg label="a post-mortem names one contributing factor, the on-call engineer deployed a bad config, and closes with one action item: retrain the engineer. What's missing?" h={200}>
      <T x={25} y={50} s={13} f={C.latte} o={easeOut(seg(t, 0, 0.3))}>
        one factor, one person
      </T>
      <T x={25} y={75} s={15} f={C.focus} o={easeOut(seg(t, 0, 0.3))}>
        retrain the engineer
      </T>
      <T x={25} y={130} s={13} f={C.latte} o={easeOut(seg(t, 0.2, 0.5))}>
        what question never gets asked
      </T>
      <T x={25} y={155} s={15} f={C.cherryText} o={easeOut(seg(t, 0.2, 0.5))}>
        ?
      </T>
    </Svg>
  );
}
