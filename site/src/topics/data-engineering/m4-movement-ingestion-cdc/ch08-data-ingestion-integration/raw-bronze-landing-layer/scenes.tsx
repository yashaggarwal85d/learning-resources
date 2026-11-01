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
    <Svg label="a currency bug is found a year later; silver was overwritten, raw was already deleted; the rebuild arrow points at an empty box." h={220}>
      <Row y={50} label="raw layer" value="deleted after thirty days" valueColor={C.badText} o={easeOut(seg(t, 0, 0.4))} />
      <Row y={100} label="silver table" value="overwritten in place" valueColor={C.badText} o={easeOut(seg(t, 0.2, 0.6))} />
      <Row y={150} label="rebuild" value="points at nothing" valueColor={C.badText} o={easeOut(seg(t, 0.4, 0.8))} />
    </Svg>
  );
}

export function Predict({ t }: StepCtx) {
  return (
    <Svg label="this raw layer was never deleted. Can a replay with a fixed transform alone reproduce the correct numbers?" h={200}>
      <Row y={70} label="raw layer" value="still sitting there" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="fix without re-extracting" value="not yet revealed" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function RevealAppendOnly({ t }: StepCtx) {
  return (
    <Svg label="the real run: a correction arrives as a brand-new record; the first three stay byte for byte unmutated." h={220}>
      <Row y={60} label="correction arrives" value="as a new record" valueColor={C.focus} o={easeOut(seg(t, 0, 0.4))} />
      <Row y={110} label="earlier records" value="untouched" valueColor={C.focus} o={easeOut(seg(t, 0.2, 0.6))} />
    </Svg>
  );
}

export function RevealRebuildMeasured({ t }: StepCtx) {
  return (
    <Svg label="the real run: silver built twice from the identical raw layer, checksummed both times." h={200}>
      <Row y={70} label="first build" value="one checksum" valueColor={C.focus} o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="second build" value="the identical checksum" valueColor={C.focus} o={easeOut(seg(t, 0.25, 0.65))} />
    </Svg>
  );
}

export function RevealMetadataFields({ t }: StepCtx) {
  return (
    <Svg label="every raw record carries three fields: when it arrived, where from, and under which schema." h={200}>
      <Row y={60} label="when it arrived" value="ingest time" o={easeOut(seg(t, 0, 0.4))} />
      <Row y={105} label="where from" value="source offset" o={easeOut(seg(t, 0.15, 0.5))} />
      <Row y={150} label="under which schema" value="schema version" o={easeOut(seg(t, 0.3, 0.65))} />
    </Svg>
  );
}

export function RevealBugFixMeasured({ t }: StepCtx) {
  return (
    <Svg label="the real run: the identical raw layer rebuilt once buggy, once fixed. Only the rows the bug touched differ." h={220}>
      <Row y={60} label="rows the bug touched" value="differ between builds" valueColor={C.focus} o={easeOut(seg(t, 0, 0.4))} />
      <Row y={110} label="every other row" value="identical in both" valueColor={C.focus} o={easeOut(seg(t, 0.2, 0.6))} />
    </Svg>
  );
}

export function RevealRetentionTension({ t }: StepCtx) {
  return (
    <Svg label="an append-only strip that never shrinks, against a duty to keep personal data no longer than necessary." h={200}>
      <Row y={70} label="raw, kept forever" value="for replay" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="storage-limitation duty" value="pulls the other way" valueColor={C.badText} o={easeOut(seg(t, 0.25, 0.65))} />
    </Svg>
  );
}

export function RevealTokenization({ t }: StepCtx) {
  return (
    <Svg label="an email in every raw record is replaced by a token; a small, separate vault maps it back." h={200}>
      <Row y={70} label="raw record holds" value="a token, not an email" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="vault holds" value="the real mapping" valueColor={C.focus} o={easeOut(seg(t, 0.25, 0.65))} />
    </Svg>
  );
}

export function RevealErasureMeasured({ t }: StepCtx) {
  return (
    <Svg label="the real run: a plaintext erasure mutates three historical records; a tokenized erasure leaves raw's own checksum unchanged." h={220}>
      <Row y={60} label="plaintext erasure" value="three records mutated" valueColor={C.badText} o={easeOut(seg(t, 0, 0.4))} />
      <Row y={110} label="tokenized erasure" value="raw checksum unchanged" valueColor={C.focus} o={easeOut(seg(t, 0.2, 0.6))} />
    </Svg>
  );
}

export function Recap({ t }: StepCtx) {
  return (
    <Svg label="an append-only strip, three metadata fields, a replay that rebuilds silver, and a vault for the one thing allowed to change." h={260}>
      <Row y={50} label="raw layer" value="append-only, replayable" o={easeOut(seg(t, 0, 0.3))} />
      <Row y={95} label="metadata" value="ingest, offset, schema" o={easeOut(seg(t, 0.15, 0.45))} />
      <Row y={140} label="erasure" value="handled by the vault" o={easeOut(seg(t, 0.25, 0.55))} />
      <Row y={185} label="only mutable thing" value="the token vault" valueColor={C.focus} o={easeOut(seg(t, 0.4, 0.75))} />
    </Svg>
  );
}

export function ProveIt({ t }: StepCtx) {
  return (
    <Svg label="an erasure request arrives for a tokenized raw layer. What has to change, and what must not?" h={200}>
      <Row y={70} label="erasure requested" value="for one person" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="what changes" value="not yet revealed" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}
