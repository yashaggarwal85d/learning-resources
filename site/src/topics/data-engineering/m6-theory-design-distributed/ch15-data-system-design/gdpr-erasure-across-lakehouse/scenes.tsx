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
    <Svg label="the lakehouse delete was correct; the name is still findable" h={270}>
      <T x={300} y={50} s={14} f={C.taupe} a="middle" o={easeOut(seg(t, 0, 0.5))}>
        an erasure request, closed fast
      </T>
      <T x={300} y={90} s={17} f={C.crema} a="middle" w={600} serif italic o={easeOut(seg(t, 0.15, 0.6))}>
        and a name that never left
      </T>
      <Row y={150} label="the ticket" value="closed, minutes" o={easeOut(seg(t, 0.35, 0.65))} />
      <Row y={195} label="an audit later" value="name still found" valueColor={C.focus} o={easeOut(seg(t, 0.5, 0.8))} />
      <Row y={240} label="four places" value="still hold it" o={easeOut(seg(t, 0.65, 1))} />
    </Svg>
  );
}

export function Predict1({ t }: StepCtx) {
  return (
    <Svg label="which parts of the design were missing?" h={210}>
      <Row y={75} label="the delete itself" value="was correct" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={150} label="unreached places" value="plus legal call" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function RevealSubjectIndex({ t }: StepCtx) {
  return (
    <Svg label="an index maps the subject straight to their own files" h={210}>
      <Row y={75} label="scan the lake" value="far too slow" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={150} label="subject index" value="finds files fast" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function RevealBlindSpots({ t }: StepCtx) {
  return (
    <Svg label="a spreadsheet, a model, an export: a register names the owner" h={240}>
      <Row y={55} label="a spreadsheet" value="outside lineage" o={easeOut(seg(t, 0, 0.3))} />
      <Row y={105} label="a trained model" value="outside lineage" o={easeOut(seg(t, 0.15, 0.45))} />
      <Row y={155} label="the register" value="names an owner" valueColor={C.focus} o={easeOut(seg(t, 0.35, 0.65))} />
    </Svg>
  );
}

export function RevealDeleteExpire({ t }: StepCtx) {
  return (
    <Svg label="a delete writes a snapshot; expiry is the real deadline" h={210}>
      <Row y={75} label="the delete" value="a new snapshot" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={150} label="the old one" value="readable until expired" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function RevealCryptoShred({ t }: StepCtx) {
  return (
    <Svg label="one key deleted; every copy, including backups, goes unreadable" h={210}>
      <Row y={75} label="delete a key" value="one operation" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={150} label="every copy" value="unreadable at once" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function RevealCrossover({ t }: StepCtx) {
  return (
    <Svg label="delete-and-expire rises with backups kept; shredding stays flat" h={210}>
      <Row y={75} label="many requests" value="favors shredding" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={150} label="few requests" value="favors deleting" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function RevealProof({ t }: StepCtx) {
  return (
    <Svg label="an automated pipeline assembles proof for every request" h={240}>
      <Row y={55} label="snapshot list" value="after expiry" o={easeOut(seg(t, 0, 0.3))} />
      <Row y={105} label="key store" value="deletion record" o={easeOut(seg(t, 0.15, 0.45))} />
      <Row y={155} label="repeat search" value="comes up empty" valueColor={C.focus} o={easeOut(seg(t, 0.35, 0.65))} />
    </Svg>
  );
}

export function Recap({ t }: StepCtx) {
  return (
    <Svg label="an index, a register, a schedule, a shred option, and proof" h={290}>
      <Row y={45} label="locate" value="index, lineage, tags" o={easeOut(seg(t, 0, 0.3))} />
      <Row y={100} label="blind spots" value="named, owned" o={easeOut(seg(t, 0.15, 0.45))} />
      <Row y={155} label="delete or shred" value="a computed choice" valueColor={C.focus} o={easeOut(seg(t, 0.35, 0.65))} />
      <Row y={210} label="proof" value="emitted every time" o={easeOut(seg(t, 0.55, 0.85))} />
    </Svg>
  );
}

export function ProveIt({ t }: StepCtx) {
  return (
    <Svg label="a second request arrives; the data was replicated to a new region" h={250}>
      <Row y={65} label="same-region only" value="misses the copy" o={easeOut(seg(t, 0, 0.4))} />
      <Row y={140} label="check every region" value="the register catches" valueColor={C.focus} o={easeOut(seg(t, 0.3, 0.7))} />
      <Row y={215} label="not" value="assume one region" o={easeOut(seg(t, 0.55, 1))} />
    </Svg>
  );
}
