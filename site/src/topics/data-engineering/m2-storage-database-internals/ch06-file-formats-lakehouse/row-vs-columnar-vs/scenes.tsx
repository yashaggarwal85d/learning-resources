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
      <T x={575} y={y} a="end" s={17} f={valueColor} w={600}>
        {value}
      </T>
    </g>
  );
}

/** A label stacked above its value (for a value too long to sit beside the label on one line). */
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

/** A horizontal strip of equal-width cells, some shaded to show "bytes touched" out of a total. */
function Strip({ y, cells, touched, color = C.focus, w = 550 }: { y: number; cells: number; touched: number; color?: string; w?: number }) {
  const cw = w / cells;
  const items = [];
  for (let i = 0; i < cells; i++) {
    items.push(<rect key={i} x={25 + i * cw} y={y} width={cw - 2} height={26} fill={i < touched ? color : C.line} opacity={i < touched ? 1 : 0.35} />);
  }
  return <g>{items}</g>;
}

export function Hook({ t }: StepCtx) {
  return (
    <Svg label="one row, one contiguous read: NSM's point lookup touches 32 bytes." h={220}>
      <T x={25} y={40} s={15} f={C.quiet}>
        row 42 of 1,000, four attributes packed together
      </T>
      <Strip y={65} cells={4} touched={4} o={easeOut(seg(t, 0.1, 0.6))} />
      <Row y={130} label="NSM point lookup" value="32 bytes, 1 read" valueColor={C.focus} o={easeOut(seg(t, 0.4, 1))} />
    </Svg>
  );
}

export function PredictScan({ t }: StepCtx) {
  return (
    <Svg label="row storage wins the point lookup. Does it also win a scan of one column?" h={200}>
      <Row y={50} label="NSM point lookup" value="32 bytes, 1 read" o={easeOut(seg(t, 0, 0.4))} />
      <Row y={100} label="NSM scan of one column, 1,000 rows" value="?" valueColor={C.focus} o={easeOut(seg(t, 0.4, 1))} />
    </Svg>
  );
}

export function RevealNsmScan({ t }: StepCtx) {
  return (
    <Svg label="every byte of every row is touched, even for one column." h={240}>
      <T x={25} y={40} s={14} f={C.latte}>
        scanning "age" across 1,000 packed rows
      </T>
      <Strip y={65} cells={32} touched={32} o={easeOut(seg(t, 0.1, 0.7))} />
      <Row y={130} label="NSM column scan" value="32,000 bytes touched" valueColor={C.focus} o={easeOut(seg(t, 0.4, 1))} />
    </Svg>
  );
}

export function RevealDsm({ t }: StepCtx) {
  return (
    <Svg label="DSM's scan touches a quarter of the bytes; its point lookup needs four separate reads." h={260}>
      <Row y={40} label="DSM column scan" value="8,000 bytes touched" valueColor={C.focus} o={easeOut(seg(t, 0.05, 0.5))} />
      <Strip y={70} cells={32} touched={8} color={C.focus} o={easeOut(seg(t, 0.1, 0.55))} />
      <Row y={140} label="DSM point lookup" value="4 separate reads" o={easeOut(seg(t, 0.5, 1))} />
      <T x={25} y={185} s={13} f={C.quiet} o={easeOut(seg(t, 0.55, 1))}>
        one read per sub-relation, joined back into a row
      </T>
    </Svg>
  );
}

export function RevealPax({ t }: StepCtx) {
  return (
    <Svg label="PAX groups columns inside a page: one page for a lookup, one minipage for a scan." h={260}>
      <T x={25} y={35} s={13} f={C.quiet}>
        one page, four attribute minipages grouped inside it
      </T>
      <Strip y={55} cells={4} touched={4} color={C.quiet} o={easeOut(seg(t, 0.05, 0.4))} />
      <Row y={115} label="PAX point lookup" value="1 page, like NSM" valueColor={C.focus} o={easeOut(seg(t, 0.2, 0.65))} />
      <Row y={160} label="PAX scan touches, per page" value="1 of 4 minipages" valueColor={C.focus} o={easeOut(seg(t, 0.45, 1))} />
    </Svg>
  );
}

export function RevealSurprisingNumber({ t }: StepCtx) {
  return (
    <Svg label="PAX still opens all ten pages to scan one column — same I/O as NSM, a quarter of the bytes." h={260}>
      <T x={25} y={25} s={13} f={C.quiet}>
        ten pages, each one quarter shaded:
      </T>
      <T x={25} y={45} s={13} f={C.quiet}>
        the column actually needed
      </T>
      <Strip y={65} cells={10} touched={10} color={C.line} o={easeOut(seg(t, 0.05, 0.4))} />
      <TallRow y={110} label="pages opened for the scan" value="10, the same as NSM" o={easeOut(seg(t, 0.2, 0.6))} />
      <TallRow y={175} label="useful bytes per page" value="25% — one of four minipages" valueColor={C.focus} o={easeOut(seg(t, 0.5, 1))} />
    </Svg>
  );
}

export function RevealParquet({ t }: StepCtx) {
  return (
    <Svg label="Parquet is column-oriented and compresses per column — the payoff of a PAX-shaped page." h={220}>
      <Row y={40} label="Parquet" value="column-oriented file format" o={easeOut(seg(t, 0, 0.4))} />
      <Row y={85} label="compression / encoding" value="set per column" valueColor={C.focus} o={easeOut(seg(t, 0.25, 0.65))} />
      <T x={25} y={140} s={13} f={C.quiet} o={easeOut(seg(t, 0.5, 1))}>
        the same minipage grouping this topic
      </T>
      <T x={25} y={160} s={13} f={C.quiet} o={easeOut(seg(t, 0.5, 1))}>
        just measured, built into a real file format
      </T>
    </Svg>
  );
}

export function Recap({ t }: StepCtx) {
  return (
    <Svg label="three layouts, three trade-offs: NSM, DSM, PAX." h={300}>
      <Row y={35} label="NSM" value="wins lookup, loses scan" o={easeOut(seg(t, 0, 0.3))} />
      <Row y={75} label="DSM" value="wins scan, loses lookup" o={easeOut(seg(t, 0.1, 0.4))} />
      <Row y={115} label="PAX" value="NSM's I/O, DSM's bytes" valueColor={C.focus} o={easeOut(seg(t, 0.25, 0.6))} />
      <g opacity={easeOut(seg(t, 0.55, 1))}>
        <T x={25} y={190} s={14} f={C.latte}>
          the rule
        </T>
        <T x={25} y={216} s={16} f={C.focus} w={600}>
          group columns inside the page, not across
        </T>
        <T x={25} y={240} s={16} f={C.focus} w={600}>
          separate files
        </T>
      </g>
    </Svg>
  );
}
