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
    <Svg label="the bytes replicated. the catalog did not." h={200}>
      <Row y={70} label="bucket replication" value="ran every night" o={easeOut(seg(t, 0, 0.6))} />
      <Row y={130} label="catalog database" value="never backed up" valueColor={C.focus} o={easeOut(seg(t, 0.4, 1))} />
    </Svg>
  );
}

export function PredictBytesEnough({ t }: StepCtx) {
  return (
    <Svg label="if the bytes all replicated cleanly, is the table safe?" h={200}>
      <Row y={70} label="data files" value="all present" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="whole table?" value="not yet revealed" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function RevealManifestPaths({ t }: StepCtx) {
  return (
    <Svg label="the manifest still points at the old region." h={200}>
      <Row y={70} label="manifest path" value="old region, absolute" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="after rewrite" value="resolves, new region" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function RevealCatalog({ t }: StepCtx) {
  return (
    <Svg label="same files, same bytes -- but no catalog, no table." h={200}>
      <Row y={70} label="data files" value="byte-identical, both regions" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="catalog lookup" value="found nothing" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function PredictKeyMatters({ t }: StepCtx) {
  return (
    <Svg label="the bytes replicated. did the key?" h={200}>
      <Row y={70} label="ciphertext" value="replicated fine" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="the key" value="not yet revealed" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function RevealMultiRegionKey({ t }: StepCtx) {
  return (
    <Svg label="same ciphertext. one key fails. one key works." h={200}>
      <Row y={70} label="region-scoped key" value="decrypt fails" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="multi-region key" value="decrypt succeeds" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function RevealImmutableBackup({ t }: StepCtx) {
  return (
    <Svg label="stolen admin credentials delete one backup, not the other." h={200}>
      <Row y={70} label="mutable backup" value="deleted outright" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="WORM backup" value="delete refused" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function RevealRestoreDrill({ t }: StepCtx) {
  return (
    <Svg label="a number on a page, or a number from a real drill." h={200}>
      <Row y={70} label="RTO target" value="written down" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="drill result" value="measured, met it" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function Recap({ t }: StepCtx) {
  return (
    <Svg label="four failure modes. one proof: a timed drill." h={260}>
      <Row y={40} label="paths, catalog, key" value="separate systems" o={easeOut(seg(t, 0, 0.25))} />
      <Row y={85} label="immutable backup" value="survives a breach" o={easeOut(seg(t, 0.12, 0.37))} />
      <Row y={130} label="proof" value="a timed drill" valueColor={C.focus} o={easeOut(seg(t, 0.3, 0.6))} />
    </Svg>
  );
}

export function ProveIt({ t }: StepCtx) {
  return (
    <Svg label="real files, real keys, real failures -- and real fixes." h={200}>
      <Row y={70} label="region-scoped key" value="a real error" o={easeOut(seg(t, 0, 0.4))} />
      <Row y={130} label="multi-region key" value="not yet revealed" valueColor={C.focus} o={easeOut(seg(t, 0.25, 0.65))} />
    </Svg>
  );
}
