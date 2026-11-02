import { C, Svg, T } from '../../../../../reels/kit';
import { easeOut, seg } from '../../../../../reels/anim';
import type { StepCtx } from '../../../../../reels/types';

export function Hook({ t }: StepCtx) {
  return (
    <Svg label="six months after the medium tier was chosen, a new engineer asks why not the fast tier, and nobody in the room was there for the original decision." h={220}>
      <T x={25} y={40} s={14} f={C.latte}>
        six months later
      </T>
      <T x={25} y={65} s={16} f={C.crema}>
        why didn't we pick the fast tier
      </T>
      <T x={25} y={120} s={14} f={C.latte}>
        nobody in the room
      </T>
      <T x={25} y={145} s={16} f={C.cherryText}>
        was there for the original decision
      </T>
      <T x={25} y={195} s={13} f={C.taupe}>
        only a document answers this now, not a memory.
      </T>
    </Svg>
  );
}

export function PredictWhatSurvives({ t }: StepCtx) {
  return (
    <Svg label="what would have survived everyone who made the decision leaving the room?" h={180}>
      <T x={300} y={70} s={14} f={C.latte} a="middle" o={easeOut(seg(t, 0, 0.3))}>
        what survives
      </T>
      <T x={300} y={110} s={16} f={C.focus} a="middle" o={easeOut(seg(t, 0.2, 0.5))}>
        ?
      </T>
    </Svg>
  );
}

export function RevealDesignDocSections({ t }: StepCtx) {
  const rows = ['context', 'goals & non-goals', 'alternatives', 'estimates', 'risks'];
  return (
    <Svg label="a real, documented design-doc structure, filled in for the shop's own request: context, goals and non-goals, alternatives, estimates, risks." h={240}>
      {rows.map((r, i) => (
        <g key={r} opacity={easeOut(seg(t, 0.04 + i * 0.16, 0.2 + i * 0.16))}>
          <T x={25} y={35 + i * 40} s={14} f={C.crema}>
            {r}
          </T>
        </g>
      ))}
    </Svg>
  );
}

export function RevealNonGoalNotNegated({ t }: StepCtx) {
  return (
    <Svg label="a non-goal is not a negated goal; it's something the team could reasonably have chosen, and chose not to." h={200}>
      <T x={25} y={45} s={14} f={C.latte}>
        not: "the system must not"
      </T>
      <T x={25} y={70} s={16} f={C.crema}>
        a negated goal
      </T>
      <T x={25} y={130} s={14} f={C.latte}>
        instead: deliberately chosen out
      </T>
      <T x={25} y={155} s={16} f={C.cherryText}>
        a real non-goal
      </T>
    </Svg>
  );
}

export function RevealRfcReview({ t }: StepCtx) {
  return (
    <Svg label="a time-boxed, widely advertised review period every affected team has to sign off on before the decision is final." h={200}>
      <T x={25} y={45} s={14} f={C.latte}>
        one team's own design doc
      </T>
      <T x={25} y={70} s={16} f={C.crema}>
        can still miss a consequence
      </T>
      <T x={25} y={130} s={14} f={C.latte}>
        the RFC's review period
      </T>
      <T x={25} y={155} s={16} f={C.cherryText}>
        every affected team signs off
      </T>
    </Svg>
  );
}

export function RevealAdr({ t }: StepCtx) {
  const parts = ['context', 'decision', 'status', 'consequences'];
  return (
    <Svg label="four parts, one ADR, written for a future developer who wasn't in the room: context, decision, status, consequences." h={220}>
      {parts.map((p, i) => (
        <g key={p} opacity={easeOut(seg(t, 0.05 + i * 0.2, 0.3 + i * 0.2))}>
          <rect x={30 + i * 115} y={70} width={100} height={60} fill={i === 1 ? C.focus : C.taupe} opacity={0.4} />
          <T x={30 + i * 115} y={150} s={12} f={C.crema}>
            {p}
          </T>
        </g>
      ))}
    </Svg>
  );
}

export function RevealSuperseded({ t }: StepCtx) {
  return (
    <Svg label="when a later decision reverses an earlier one, the old ADR stays, its status changed to superseded by, not deleted." h={200}>
      <g opacity={easeOut(seg(t, 0, 0.4))}>
        <rect x={25} y={20} width={220} height={24} fill={C.taupe} opacity={0.35} />
        <T x={25} y={62} s={13} f={C.crema}>
          ADR-1: superseded by ADR-2
        </T>
      </g>
      <g opacity={easeOut(seg(t, 0.35, 0.7))}>
        <rect x={25} y={100} width={160} height={24} fill={C.focus} opacity={0.5} />
        <T x={25} y={142} s={13} f={C.cherryText}>
          ADR-2: accepted
        </T>
      </g>
    </Svg>
  );
}

export function Recap({ t }: StepCtx) {
  return (
    <Svg label="a design doc's five sections, a non-goal that's a real choice, what an RFC's review adds, a four-part ADR, and the superseded-not-deleted convention." h={300}>
      <g opacity={easeOut(seg(t, 0, 0.3))}>
        <T x={25} y={36} s={14} f={C.latte}>a design doc, five sections</T>
        <T x={25} y={62} s={15} f={C.crema}>context, goals, alternatives, estimates, risks</T>
      </g>
      <g opacity={easeOut(seg(t, 0.15, 0.45))}>
        <T x={25} y={96} s={14} f={C.latte}>the RFC's review period</T>
        <T x={25} y={122} s={15} f={C.crema}>every affected team signs off, not just one</T>
      </g>
      <g opacity={easeOut(seg(t, 0.3, 0.6))}>
        <T x={25} y={156} s={14} f={C.latte}>an ADR, four parts</T>
        <T x={25} y={182} s={15} f={C.crema}>written for a developer who wasn't there</T>
      </g>
      <g opacity={easeOut(seg(t, 0.45, 0.75))}>
        <T x={25} y={216} s={14} f={C.latte}>superseded, never deleted</T>
        <T x={25} y={242} s={15} f={C.crema}>the old decision stays on the record</T>
      </g>
    </Svg>
  );
}

export function ProveIt({ t }: StepCtx) {
  return (
    <Svg label="a team deletes an old ADR after a decision changes, reasoning that the wrong decision shouldn't confuse anyone. What's lost by deleting it?" h={200}>
      <T x={25} y={50} s={13} f={C.latte} o={easeOut(seg(t, 0, 0.3))}>
        the old ADR, deleted
      </T>
      <T x={25} y={75} s={15} f={C.focus} o={easeOut(seg(t, 0, 0.3))}>
        instead of marked superseded
      </T>
      <T x={25} y={130} s={13} f={C.latte} o={easeOut(seg(t, 0.2, 0.5))}>
        what does the next reader lose
      </T>
      <T x={25} y={155} s={15} f={C.cherryText} o={easeOut(seg(t, 0.2, 0.5))}>
        ?
      </T>
    </Svg>
  );
}
