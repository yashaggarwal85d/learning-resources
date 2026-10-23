import { Bar, C, Svg, T } from '../../../../../reels/kit';
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
    <Svg label="the first library built on arrow — do its own changes actually come from those buffers?" h={200}>
      <Row y={70} label="built on arrow" value="claimed" o={easeOut(seg(t, 0, 0.6))} />
      <Row y={130} label="actually changed?" value="not yet checked" valueColor={C.focus} o={easeOut(seg(t, 0.4, 1))} />
    </Svg>
  );
}

export function RevealDefaultStringDtype({ t }: StepCtx) {
  return (
    <Svg label="a plain list of strings now infers its own dedicated type, not the old catch-all one" h={200}>
      <Row y={70} label="old default" value="catch-all type" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="new default" value="dedicated string type" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function PredictSentinelMatch({ t }: StepCtx) {
  return (
    <Svg label="backed by the strict buffers — does its missing marker match the strict tools, or the old loose one?" h={200}>
      <Row y={70} label="new type" value="strict buffers underneath" />
      <Row y={130} label="missing marker" value="strict, or old and loose?" valueColor={C.focus} />
    </Svg>
  );
}

export function RevealCopyOnWrite({ t }: StepCtx) {
  return (
    <Svg label="a subset shares the same memory as the original, right up until it gets mutated" h={220}>
      <Row y={55} label="subset taken" value="shares memory" o={easeOut(seg(t, 0, 0.4))} />
      <Row y={110} label="still unmutated" value="still shared" o={easeOut(seg(t, 0.25, 0.65))} />
      <Row y={165} label="now mutated" value="copies, only now" valueColor={C.focus} o={easeOut(seg(t, 0.55, 1))} />
    </Svg>
  );
}

export function RevealChainedAssignment({ t }: StepCtx) {
  return (
    <Svg label="the two-step shortcut never silently works — measured, and a different warning replaces the old one" h={220}>
      <Row y={55} label="two-step update" value="attempted" o={easeOut(seg(t, 0, 0.4))} />
      <Row y={110} label="original table" value="unchanged" valueColor={C.focus} o={easeOut(seg(t, 0.25, 0.65))} />
      <Row y={165} label="old warning" value="replaced, not silent" o={easeOut(seg(t, 0.55, 1))} />
    </Svg>
  );
}

export function RevealTwoStringDtypes({ t }: StepCtx) {
  return (
    <Svg label="two similarly-named string types, measured side by side — different names, different markers" h={220}>
      <Row y={55} label="new default type" value='"str"' o={easeOut(seg(t, 0, 0.4))} />
      <Row y={110} label="older opt-in type" value='"string"' valueColor={C.focus} o={easeOut(seg(t, 0.25, 0.65))} />
      <Row y={165} label="missing markers" value="also different" valueColor={C.focus} o={easeOut(seg(t, 0.55, 1))} />
    </Svg>
  );
}

export function RevealNumericSentinelMatch({ t }: StepCtx) {
  return (
    <Svg label="old storage, new buffers — the same missing-value marker either way, measured identical" h={200}>
      <Row y={70} label="old storage, nullable" value="one marker" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="new buffers, nullable" value="same marker" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function RevealMicrosecondResolution({ t }: StepCtx) {
  return (
    <Svg label="resolution now follows what the input actually carries, instead of always assuming the finest one" h={200}>
      <Row y={70} label="old default" value="always finest" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="new default" value="follows the input" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function RevealMigrationFlags({ t }: StepCtx) {
  return (
    <Svg label="two rehearsal switches from the release before — one still warns here, one goes quiet" h={220}>
      <Row y={55} label="rehearsal switch one" value="still warns" valueColor={C.focus} o={easeOut(seg(t, 0, 0.4))} />
      <Row y={110} label="rehearsal switch two" value="silent now" o={easeOut(seg(t, 0.25, 0.65))} />
      <Row y={165} label="both pre-dated" value="this breaking release" o={easeOut(seg(t, 0.55, 1))} />
    </Svg>
  );
}

export function Recap({ t }: StepCtx) {
  return (
    <Svg label="a new string type, lazy copies, a shortcut gone for good, real differences in one place and none in another" h={260}>
      <Row y={50} label="string type" value="dedicated, kept compatible" o={easeOut(seg(t, 0, 0.3))} />
      <Row y={95} label="every subset" value="a lazy copy" o={easeOut(seg(t, 0.1, 0.4))} />
      <Row y={140} label="two-step update" value="gone for good" o={easeOut(seg(t, 0.25, 0.6))} />
      <Row y={185} label="strings vs numbers" value="differ, then don't" valueColor={C.focus} o={easeOut(seg(t, 0.5, 0.85))} />
    </Svg>
  );
}

export function ProveIt({ t }: StepCtx) {
  return (
    <Svg label="an old type check and a two-step shortcut, both quietly broken — what's the one-line fix for each?" h={220}>
      <Row y={55} label="old type check" value="stops matching" o={easeOut(seg(t, 0, 0.4))} />
      <Row y={110} label="two-step shortcut" value="never worked" o={easeOut(seg(t, 0.25, 0.65))} />
      <Row y={165} label="defensive copy call" value="now pointless" valueColor={C.focus} o={easeOut(seg(t, 0.55, 1))} />
    </Svg>
  );
}
