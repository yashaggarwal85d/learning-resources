import type { StepCtx } from '../../../../../reels/types';
import { easeOut, seg } from '../../../../../reels/anim';
import { Code } from '../../../../../reels/Code';
import { Stack, Svg, T, C } from '../../../../../reels/kit';

// A full page doesn't reject or overwrite a new entry; it splits in two
// and hands a new key up. High fanout is exactly why that keeps the tree
// only a few levels deep, even at a huge record count. Packing a page
// less than completely full on purpose smooths out how often it has to
// split again, and a separator key only needs the shortest piece that
// still tells two sides apart.
const fa = (t: number, a: number, d = 0.4) => easeOut(seg(t, a, a + d));

// ── 1 · A full page, one more entry arriving (predict, hook) ─────────────
export function SplitPredict({ t }: StepCtx) {
  return (
    <Stack>
      <Code
        title="a full leaf page, one more entry"
        lines={['insert_into_leaf(&mut store, leaf, key, value, fill);', '// rejected, overwritten, or split?']}
        t={t}
        start={0.1}
        end={2.6}
        highlight={[1]}
      />
    </Stack>
  );
}

// ── 2 · Measured: it splits, a real separator goes up (takeaway) ────────
export function SplitReveal({ t }: StepCtx) {
  return (
    <Svg label="btree_fanout_split_depth_truncation.rs, measured" h={220}>
      <T x={60} y={44} s={14} f={C.crema} o={fa(t, 0.2, 0.4)}>one full leaf page, before the insert</T>
      <g opacity={fa(t, 0.7, 0.4)}>
        <rect x={60} y={64} width={150} height={38} rx={6} fill="none" stroke={C.caramel} strokeWidth={2} />
        <T x={135} y={88} s={12} a="middle" f={C.mocha}>seven entries, full</T>
      </g>
      <g opacity={fa(t, 1.2, 0.4)}>
        <rect x={60} y={130} width={150} height={38} rx={6} fill="none" stroke={C.caramel} strokeWidth={2} />
        <rect x={230} y={130} width={150} height={38} rx={6} fill="none" stroke={C.caramel} strokeWidth={2} />
        <T x={135} y={154} s={12} a="middle" f={C.mocha}>left page</T>
        <T x={305} y={154} s={12} a="middle" f={C.mocha}>right page</T>
      </g>
      <T x={60} y={200} s={13} f={C.latte} o={fa(t, 1.8, 0.4)}>a new separator now lives in the parent</T>
    </Svg>
  );
}

// ── 3 · Depth versus record count (predict) ──────────────────────────────
export function DepthPredict({ t }: StepCtx) {
  return (
    <Stack>
      <Code
        title="record count climbing into the thousands"
        lines={['build_tree(&keys, fill_factor); // tree_height(&store, root)', '// grows with the count, or stays shallow?']}
        t={t}
        start={0.1}
        end={2.6}
        highlight={[1]}
      />
    </Stack>
  );
}

// ── 4 · Measured: depth stays within a handful of levels (takeaway) ──────
export function DepthReveal({ t }: StepCtx) {
  const rows = ['root', 'branch', 'branch', 'leaves, thousands of records'];
  return (
    <Svg label="btree_fanout_split_depth_truncation.rs, measured" h={240}>
      {rows.map((r, i) => (
        <g key={r} opacity={fa(t, 0.2 + i * 0.35, 0.4)}>
          <rect x={60 + i * 18} y={30 + i * 48} width={300 - i * 36} height={34} rx={6} fill="none" stroke={C.caramel} strokeWidth={2} />
          <T x={75 + i * 18} y={52 + i * 48} s={12} f={C.crema}>{r}</T>
        </g>
      ))}
      <T x={60} y={230} s={13} f={C.latte} o={fa(t, 1.7, 0.4)}>still only a handful of levels deep</T>
    </Svg>
  );
}

// ── 5 · Which tree splits more, less-full or fuller packing (predict) ────
export function FillFactorPredict({ t }: StepCtx) {
  return (
    <Stack>
      <Code
        title="identical inserts, different packing per split"
        lines={['build_tree(&keys, 0.5); build_tree(&keys, 0.9);', '// which one splits more overall?']}
        t={t}
        start={0.1}
        end={2.6}
        highlight={[1]}
      />
    </Stack>
  );
}

// ── 6 · Measured: less-full packing splits more often (takeaway) ─────────
export function FillFactorReveal({ t }: StepCtx) {
  return (
    <Svg label="btree_fanout_split_depth_truncation.rs, measured" h={200}>
      <T x={60} y={50} s={14} f={C.crema} o={fa(t, 0.3, 0.4)}>same inserts, two packing choices</T>
      <g opacity={fa(t, 0.9, 0.4)}>
        <rect x={60} y={75} width={260} height={44} rx={6} fill="none" stroke={C.caramel} strokeWidth={2} />
        <T x={190} y={102} s={13} a="middle" f={C.mocha}>packed less full: more splits</T>
      </g>
      <T x={60} y={150} s={13} f={C.latte} o={fa(t, 1.5, 0.4)}>packed fuller: fewer splits, same inserts</T>
    </Svg>
  );
}

// ── 7 · Can a shorter separator still route correctly (predict) ──────────
export function TruncationPredict({ t }: StepCtx) {
  return (
    <Stack>
      <Code
        title="a full key beside a shortened separator"
        lines={['truncate_separator(left_last, right_first);', '// smaller, and still routes correctly?']}
        t={t}
        start={0.1}
        end={2.6}
        highlight={[1]}
      />
    </Stack>
  );
}

// ── 8 · Measured: shorter, and routes identically (takeaway) ─────────────
export function TruncationReveal({ t }: StepCtx) {
  return (
    <Svg label="btree_fanout_split_depth_truncation.rs, measured" h={200}>
      <T x={60} y={50} s={14} f={C.crema} o={fa(t, 0.3, 0.4)}>a full key versus a truncated one</T>
      <g opacity={fa(t, 0.9, 0.4)}>
        <rect x={60} y={75} width={260} height={44} rx={6} fill="none" stroke={C.caramel} strokeWidth={2} />
        <T x={190} y={102} s={13} a="middle" f={C.mocha}>truncated: fewer bytes, same routing</T>
      </g>
      <T x={60} y={150} s={13} f={C.latte} o={fa(t, 1.5, 0.4)}>kept only the first real difference</T>
    </Svg>
  );
}

// ── 9 · PostgreSQL's nbtree README on suffix truncation (connecting) ─────
export function NbtreeReveal({ t }: StepCtx) {
  const rows = [
    'the goal of suffix truncation of key',
    'attributes is to improve index fan-out',
  ];
  return (
    <Svg label="PostgreSQL nbtree README, quoted" h={180}>
      {rows.map((r, i) => (
        <g key={r} opacity={fa(t, 0.2 + i * 0.4, 0.4)}>
          <circle cx={30} cy={40 + i * 45} r={5} fill={C.caramel} />
          <T x={48} y={46 + i * 45} s={13} f={C.crema}>{r}</T>
        </g>
      ))}
    </Svg>
  );
}

// ── 10 · Recap ────────────────────────────────────────────────────────────
export function Recap({ t }: StepCtx) {
  const rows = [
    'a full page splits, a key goes up',
    'high fanout keeps depth shallow',
    'fill factor smooths how often it splits',
    'truncation keeps separators small',
  ];
  return (
    <Svg label="recap: what fanout buys, what keeps it cheap" h={300}>
      {rows.map((r, i) => (
        <g key={r} opacity={fa(t, 0.2 + i * 0.4, 0.4)}>
          <circle cx={30} cy={40 + i * 55} r={5} fill={C.caramel} />
          <T x={48} y={46 + i * 55} s={13} f={C.crema}>{r}</T>
        </g>
      ))}
    </Svg>
  );
}
