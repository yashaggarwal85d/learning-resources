import type { StepCtx } from '../../../../../reels/types';
import { easeOut, seg } from '../../../../../reels/anim';
import { Code } from '../../../../../reels/Code';
import { Stack, Svg, T, C } from '../../../../../reels/kit';

// A column-major layout touches far fewer bytes scanning one column and
// skips exactly the rows its packed validity bitmap marks absent, but it
// pays for that by scattering a single logical row's own update across
// every column's own separate buffer instead of touching one contiguous
// region.
const fa = (t: number, a: number, d = 0.4) => easeOut(seg(t, a, a + d));

// ── 1 · Does the column-major table touch fewer bytes scanning one column (predict) ──
export function ScanPredict({ t }: StepCtx) {
  return (
    <Stack>
      <Code
        title="the identical rows, row-major and column-major"
        lines={['narrow_scan(&row_major) vs narrow_scan(&col_major);', '// fewer bytes touched in the column-major table?']}
        t={t}
        start={0.1}
        end={2.6}
        highlight={[1]}
      />
    </Stack>
  );
}

// ── 2 · Measured: far fewer bytes (no takeaway, the test's own "from" step) ──
export function ScanReveal({ t }: StepCtx) {
  const rows = ['row-major scan: every row\'s full struct touched', 'column-major scan: only that column\'s own bytes'];
  return (
    <Svg label="columnar_layout_locality_tradeoff.rs, measured" h={180}>
      {rows.map((r, i) => (
        <g key={r} opacity={fa(t, 0.2 + i * 0.4, 0.4)}>
          <circle cx={30} cy={40 + i * 45} r={5} fill={C.caramel} />
          <T x={48} y={46 + i * 45} s={13} f={C.crema}>{r}</T>
        </g>
      ))}
    </Svg>
  );
}

// ── 3 · Does the column-major table touch more regions on a wide update (predict) ──
export function UpdatePredict({ t }: StepCtx) {
  return (
    <Stack>
      <Code
        title="one logical row, every field updated"
        lines={['wide_update(&mut row_major) vs wide_update(&mut col_major);', '// more separate regions touched in the column-major table?']}
        t={t}
        start={0.1}
        end={2.6}
        highlight={[1]}
      />
    </Stack>
  );
}

// ── 4 · Measured: four regions vs one (takeaway) ──────────────────────────
export function UpdateReveal({ t }: StepCtx) {
  return (
    <Svg label="columnar_layout_locality_tradeoff.rs, measured" h={200}>
      <T x={60} y={50} s={14} f={C.crema} o={fa(t, 0.3, 0.4)}>the identical logical row, updated in full</T>
      <g opacity={fa(t, 0.9, 0.4)}>
        <rect x={60} y={75} width={260} height={44} rx={6} fill="none" stroke={C.caramel} strokeWidth={2} />
        <T x={190} y={102} s={13} a="middle" f={C.mocha}>row-major: one region; column-major: four</T>
      </g>
      <T x={60} y={150} s={13} f={C.latte} o={fa(t, 1.5, 0.4)}>scattered across every column's own buffer</T>
    </Svg>
  );
}

// ── 5 · Does the packed bitmap correctly skip marked rows (predict) ──────
export function BitmapPredict({ t }: StepCtx) {
  return (
    <Stack>
      <Code
        title="a packed bitmap, one bit per row"
        lines={['set_bit(&mut validity, i, i % 7 != 0);', '// does the scan correctly skip the unset rows?']}
        t={t}
        start={0.1}
        end={2.6}
        highlight={[1]}
      />
    </Stack>
  );
}

// ── 6 · Measured: exactly those rows skipped (takeaway) ───────────────────
export function BitmapReveal({ t }: StepCtx) {
  return (
    <Svg label="columnar_layout_locality_tradeoff.rs, measured" h={200}>
      <T x={60} y={50} s={14} f={C.crema} o={fa(t, 0.3, 0.4)}>every marked row skipped, none missed</T>
      <g opacity={fa(t, 0.9, 0.4)}>
        <rect x={60} y={75} width={260} height={44} rx={6} fill="none" stroke={C.caramel} strokeWidth={2} />
        <T x={190} y={102} s={13} a="middle" f={C.mocha}>one bit per row, not one byte</T>
      </g>
      <T x={60} y={150} s={13} f={C.latte} o={fa(t, 1.5, 0.4)}>a fraction of a byte-per-row bitmap's size</T>
    </Svg>
  );
}

// ── 7 · Does Arrow name the mutation cost directly (predict) ─────────────
export function TradeoffPredict({ t }: StepCtx) {
  return (
    <Stack>
      <Code
        title="Apache Arrow's own format documentation"
        lines={['// does it name mutation as the real cost of locality?', '// or claim both scans and mutations are equally cheap?']}
        t={t}
        start={0.1}
        end={2.6}
        highlight={[1]}
      />
    </Stack>
  );
}

// ── 8 · Arrow's own trade-off, quoted (takeaway) ──────────────────────────
export function TradeoffReveal({ t }: StepCtx) {
  const rows = ['analytical performance, data locality guarantees', 'in exchange for: more expensive mutation'];
  return (
    <Svg label="Apache Arrow Docs: Arrow Columnar Format, quoted" h={180}>
      {rows.map((r, i) => (
        <g key={r} opacity={fa(t, 0.2 + i * 0.4, 0.4)}>
          <circle cx={30} cy={40 + i * 45} r={5} fill={C.caramel} />
          <T x={48} y={46 + i * 45} s={13} f={C.crema}>{r}</T>
        </g>
      ))}
    </Svg>
  );
}

// ── 9 · arrow-buffer's own words on the null mask (connecting) ───────────
export function NullMaskReveal({ t }: StepCtx) {
  const rows = ['NullBuffer: encodes validity, kept separate', 'handling it separately: real measured speedup'];
  return (
    <Svg label="arrow-buffer crate docs: NullBuffer, quoted" h={180}>
      {rows.map((r, i) => (
        <g key={r} opacity={fa(t, 0.2 + i * 0.4, 0.4)}>
          <circle cx={30} cy={40 + i * 45} r={5} fill={C.caramel} />
          <T x={48} y={46 + i * 45} s={13} f={C.crema}>{r}</T>
        </g>
      ))}
    </Svg>
  );
}

// ── 10 · Recap ─────────────────────────────────────────────────────────────
export function Recap({ t }: StepCtx) {
  const rows = [
    'scan: column-major touches far fewer bytes',
    'bitmap: skips exactly the marked rows, cheaply',
    'update: column-major scatters across buffers',
    'the trade: cheap scanning for expensive mutation',
  ];
  return (
    <Svg label="recap: what column-major buys, what it costs" h={300}>
      {rows.map((r, i) => (
        <g key={r} opacity={fa(t, 0.2 + i * 0.4, 0.4)}>
          <circle cx={30} cy={40 + i * 55} r={5} fill={C.caramel} />
          <T x={48} y={46 + i * 55} s={13} f={C.crema}>{r}</T>
        </g>
      ))}
    </Svg>
  );
}
