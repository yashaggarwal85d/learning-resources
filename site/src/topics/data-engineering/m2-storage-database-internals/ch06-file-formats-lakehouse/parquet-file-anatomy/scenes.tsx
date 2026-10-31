import { C, Svg, T } from '../../../../../reels/kit';
import { easeOut, seg } from '../../../../../reels/anim';
import type { StepCtx } from '../../../../../reels/types';

function Row({ y, label, value, valueColor = C.crema, o = 1 }: { y: number; label: string; value: string; valueColor?: string; o?: number }) {
  return (
    <g opacity={o}>
      <T x={25} y={y} s={15} f={C.latte}>
        {label}
      </T>
      <T x={575} y={y} a="end" s={17} f={valueColor} w={600}>
        {value}
      </T>
    </g>
  );
}

function TallRow({ y, label, value, valueColor = C.crema, o = 1 }: { y: number; label: string; value: string; valueColor?: string; o?: number }) {
  return (
    <g opacity={o}>
      <T x={25} y={y} s={14} f={C.latte}>
        {label}
      </T>
      <T x={25} y={y + 26} s={16} f={valueColor} w={600}>
        {value}
      </T>
    </g>
  );
}

function Strip({ y, h = 36, segments }: { y: number; h?: number; segments: { w: number; label: string; color: string; textColor?: string }[] }) {
  let x = 25;
  const total = segments.reduce((s, seg) => s + seg.w, 0);
  const scale = 550 / total;
  return (
    <g>
      {segments.map((s, i) => {
        const w = s.w * scale;
        const rect = (
          <g key={i}>
            <rect x={x} y={y} width={w} height={h} fill={s.color} stroke={C.line} strokeWidth={1} />
            <T x={x + w / 2} y={y + h / 2 + 5} a="middle" s={12} f={s.textColor ?? C.focus}>
              {s.label}
            </T>
          </g>
        );
        x += w;
        return rect;
      })}
    </g>
  );
}

export function Hook({ t }: StepCtx) {
  return (
    <Svg label="a 941-byte file, written one struct at a time, in this sandbox: PAR1 ... data ... PAR1." h={200}>
      <Row y={50} label="magic, start" value='"PAR1"' o={easeOut(seg(t, 0, 0.3))} />
      <Row y={95} label="row groups, column chunks, pages" value="the data" o={easeOut(seg(t, 0.25, 0.65))} />
      <Row y={140} label="magic, end" value='"PAR1"' valueColor={C.focus} o={easeOut(seg(t, 0.55, 1))} />
    </Svg>
  );
}

export function PredictFooterOrder({ t }: StepCtx) {
  return (
    <Svg label="a reader needs the schema before any row makes sense. Where did this file put it?" h={200}>
      <Row y={50} label="file layout" value='"PAR1" ... ? ... "PAR1"' o={easeOut(seg(t, 0, 0.5))} />
      <Row y={100} label="the footer (schema + offsets)" value="first, or last?" valueColor={C.focus} o={easeOut(seg(t, 0.4, 1))} />
    </Svg>
  );
}

export function RevealFooterLast({ t }: StepCtx) {
  return (
    <Svg label="the footer comes after every byte of data — so a single streaming pass can write it." h={230}>
      <TallRow y={40} label="data, written first" value="row groups, column chunks, pages" o={easeOut(seg(t, 0, 0.4))} />
      <TallRow y={105} label="footer, written last" value="schema + every offset" valueColor={C.focus} o={easeOut(seg(t, 0.4, 1))} />
    </Svg>
  );
}

export function RevealHierarchy({ t }: StepCtx) {
  return (
    <Svg label="read straight from this file's own footer: 2 row groups, 5 columns, one page per chunk." h={240}>
      <Row y={40} label="row groups" value="2" o={easeOut(seg(t, 0, 0.3))} />
      <Row y={85} label="columns per row group" value="5" o={easeOut(seg(t, 0.2, 0.55))} />
      <Row y={130} label="rows per row group" value="2" o={easeOut(seg(t, 0.4, 0.75))} />
      <Row y={175} label="total rows" value="4" valueColor={C.focus} o={easeOut(seg(t, 0.6, 1))} />
    </Svg>
  );
}

export function PredictRepeatedString({ t }: StepCtx) {
  return (
    <Svg label="status only ever holds 'created' or 'shipped', four times over. Stored as four full copies?" h={230}>
      <TallRow y={40} label="status column, 4 values" value="created, shipped, created, shipped" o={easeOut(seg(t, 0, 0.5))} />
      <TallRow y={105} label="on disk" value="4 full strings, or something smaller?" valueColor={C.focus} o={easeOut(seg(t, 0.4, 1))} />
    </Svg>
  );
}

export function RevealDictionaryPage({ t }: StepCtx) {
  return (
    <Svg label="a dictionary page holds the 2 unique strings once; the data page holds 1-bit indexes." h={230}>
      <Row y={40} label="dictionary page" value='"created", "shipped"' o={easeOut(seg(t, 0, 0.35))} />
      <Row y={85} label="data page, 4 values" value="indexes: 0, 1, 0, 1" valueColor={C.focus} o={easeOut(seg(t, 0.3, 0.7))} />
      <Strip y={140} segments={[
        { w: 2, label: 'dict: 2 strings', color: C.quiet, textColor: C.focus },
        { w: 1, label: '4x 1-bit index', color: C.cinnamon, textColor: C.ink },
      ]} />
    </Svg>
  );
}

export function RevealV1VsV2({ t }: StepCtx) {
  return (
    <Svg label="the same column, one row group apart: the page header's own type field tells them apart." h={230}>
      <TallRow y={40} label="row group 0, status page header: type" value="0 (DATA_PAGE)" o={easeOut(seg(t, 0, 0.4))} />
      <TallRow y={105} label="row group 1, status page header: type" value="3 (DATA_PAGE_V2)" valueColor={C.focus} o={easeOut(seg(t, 0.4, 1))} />
    </Svg>
  );
}

export function RevealInt96Pitfall({ t }: StepCtx) {
  return (
    <Svg label="the same 12 written bytes, decoded two ways: a UTC instant, or an America/Los Angeles clock reading." h={220}>
      <Row y={40} label="written instant (UTC)" value="12:00:00" o={easeOut(seg(t, 0, 0.3))} />
      <Row y={85} label="decoded as UTC" value="12:00:00 (correct)" o={easeOut(seg(t, 0.2, 0.55))} />
      <TallRow y={130} label="decoded as America/Los Angeles local" value="same bytes, now 7 hours wrong" valueColor={C.focus} o={easeOut(seg(t, 0.5, 1))} />
    </Svg>
  );
}

export function RevealIsAdjusted({ t }: StepCtx) {
  return (
    <Svg label="isAdjustedToUTC turns that guess into a required flag the writer must set." h={230}>
      <TallRow y={40} label="INT96: timezone flag" value="none — a reader has to guess" o={easeOut(seg(t, 0, 0.4))} />
      <TallRow y={105} label="TIMESTAMP: isAdjustedToUTC" value="true — a required, explicit flag" valueColor={C.focus} o={easeOut(seg(t, 0.4, 1))} />
    </Svg>
  );
}

export function Recap({ t }: StepCtx) {
  return (
    <Svg label="file, row groups, column chunks, pages — a physical type and its logical type ride together." h={300}>
      <TallRow y={35} label="hierarchy" value="file -> row groups -> column chunks -> pages" o={easeOut(seg(t, 0, 0.3))} />
      <TallRow y={100} label="footer" value="written last, so one streaming pass can write it" o={easeOut(seg(t, 0.1, 0.4))} />
      <TallRow y={165} label="a type pair" value="physical type (bytes) + logical type (meaning)" valueColor={C.focus} o={easeOut(seg(t, 0.25, 0.6))} />
      <g opacity={easeOut(seg(t, 0.55, 1))}>
        <T x={25} y={230} s={14} f={C.latte}>
          the rule
        </T>
        <T x={25} y={256} s={16} f={C.focus} w={600}>
          the bytes are only half the schema —
        </T>
        <T x={25} y={280} s={16} f={C.focus} w={600}>
          the logical type is the other half
        </T>
      </g>
    </Svg>
  );
}
