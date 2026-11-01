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
    <Svg label="a customer exists in the CRM with one key and credit limit, and in the ERP with a different key and credit limit, and a report double-counts it." h={200}>
      <Row y={70} label="in the CRM" value="one key, one limit" valueColor={C.focus} o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="in the ERP" value="a different key, limit" valueColor={C.badText} o={easeOut(seg(t, 0.25, 0.65))} />
    </Svg>
  );
}

export function Predict({ t }: StepCtx) {
  return (
    <Svg label="does fixing a duplicate like this always mean rewriting the CRM's or the ERP's own data, or can a style fix it without touching either source?" h={200}>
      <Row y={70} label="rewrite a source directly" value="one way to fix it" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="fix it without touching either" value="not yet revealed" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function RevealRegistry({ t }: StepCtx) {
  return (
    <Svg label="a registry cross-references keys across sources without changing them; no master copy exists anywhere, and sources stay authoritative." h={200}>
      <Row y={70} label="master copy" value="none — only a cross-reference" valueColor={C.focus} o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="who writes" value="the sources, unchanged" o={easeOut(seg(t, 0.25, 0.65))} />
    </Svg>
  );
}

export function RevealConsolidation({ t }: StepCtx) {
  return (
    <Svg label="consolidation assembles a golden copy from the sources for reporting; the sources stay authoritative, and nothing is written back to them." h={200}>
      <Row y={70} label="the golden copy" value="assembled for reporting" valueColor={C.focus} o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="written back to sources" value="never" valueColor={C.badText} o={easeOut(seg(t, 0.25, 0.65))} />
    </Svg>
  );
}

export function RevealCoexistence({ t }: StepCtx) {
  return (
    <Svg label="coexistence keeps a master copy that is also synchronised back to the sources, which stay writable on their own." h={200}>
      <Row y={70} label="the master copy" value="synced back to sources" valueColor={C.focus} o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="the sources" value="still writable" o={easeOut(seg(t, 0.25, 0.65))} />
    </Svg>
  );
}

export function RevealCentralized({ t }: StepCtx) {
  return (
    <Svg label="a centralised, transactional hub is the only place master data is created or changed; sources consume it rather than write it." h={200}>
      <Row y={70} label="who writes" value="only the hub" valueColor={C.focus} o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="the sources" value="consume, never write" valueColor={C.badText} o={easeOut(seg(t, 0.25, 0.65))} />
    </Svg>
  );
}

export function RevealMatchMerge({ t }: StepCtx) {
  return (
    <Svg label="standardise, match, merge by survivorship, publish — and whatever the rules can't resolve waits in a steward's own queue." h={220}>
      <Row y={60} label="standardise, match, merge" value="automatic, by rule" o={easeOut(seg(t, 0, 0.4))} />
      <Row y={110} label="survivorship" value="decides which value wins" valueColor={C.focus} o={easeOut(seg(t, 0.2, 0.6))} />
      <Row y={160} label="what the rules can't resolve" value="a steward's own queue" valueColor={C.badText} o={easeOut(seg(t, 0.4, 0.8))} />
    </Svg>
  );
}

export function RevealAcrossErpCrm({ t }: StepCtx) {
  return (
    <Svg label="the same customer, product or plant can sit in an ERP and a CRM at once; each style gives that pair a different kind of consistency." h={200}>
      <Row y={70} label="customer, product, plant" value="in both systems at once" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="consistency" value="depends on the style chosen" valueColor={C.focus} o={easeOut(seg(t, 0.25, 0.65))} />
    </Svg>
  );
}

export function Recap({ t }: StepCtx) {
  return (
    <Svg label="registry, consolidation, coexistence, centralised — four answers to who writes and where the master lives, plus the pipeline that builds one." h={260}>
      <Row y={50} label="registry" value="cross-reference only" o={easeOut(seg(t, 0, 0.3))} />
      <Row y={95} label="consolidation" value="golden copy, read-only" o={easeOut(seg(t, 0.15, 0.45))} />
      <Row y={140} label="coexistence" value="synced both ways" valueColor={C.focus} o={easeOut(seg(t, 0.25, 0.55))} />
      <Row y={185} label="centralised" value="the hub, and only the hub" valueColor={C.badText} o={easeOut(seg(t, 0.4, 0.75))} />
    </Svg>
  );
}

export function ProveIt({ t }: StepCtx) {
  return (
    <Svg label="a company wants every order system to keep writing its own orders, with no single new system of record, but still wants one queryable, de-duplicated customer list for reporting. Which style fits?" h={200}>
      <Row y={70} label="sources keep writing" value="required" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="the style that fits" value="not yet revealed" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}
