import type { StepCtx } from '../../../../../reels/types';
import { easeOut, seg } from '../../../../../reels/anim';
import { Code } from '../../../../../reels/Code';
import { C, Draw, Stack, Svg, T } from '../../../../../reels/kit';

// One primitive (UnsafeCell) with three safe wrappers fanning out from it: Cell (copy), RefCell
// (tracked borrow, checked at run time), OnceCell/LazyLock (written or computed once). Every
// snippet is an exact line of examples/*.rs; every claim is executed by examples.py. No digits in
// any caption text.

const fa = (t: number, a: number, d = 0.4) => easeOut(seg(t, a, a + d));

// ── 1 · The one legal way to mutate through &T ──────────────────────────────────────────────────────
export function UnsafeCellFig({ t }: StepCtx) {
  return (
    <Svg label="UnsafeCell is the one legal way to get a mutable pointer from a shared reference" h={320}>
      <rect x={170} y={30} width={260} height={56} rx={8} fill="none" stroke={C.caramel} strokeWidth={2} />
      <T x={300} y={64} s={13} a="middle" f={C.crema}>&amp;self, a shared reference</T>
      <g opacity={fa(t, 0.5, 0.4)}>
        <Draw pts={[[300, 86], [300, 140]]} t={t} from={0.5} to={0.7} stroke={C.mocha} w={2} pen={false} />
        <rect x={190} y={146} width={220} height={54} rx={8} fill="none" stroke={C.taupe} strokeWidth={1.5} />
        <T x={300} y={178} s={13} a="middle" f={C.crema}>UnsafeCell::get</T>
      </g>
      <g opacity={fa(t, 1.0, 0.4)}>
        <Draw pts={[[300, 200], [300, 240]]} t={t} from={1.0} to={1.2} stroke={C.mocha} w={2} pen={false} />
        <T x={300} y={268} s={13} a="middle" f={C.caramel}>a mutable pointer, legally</T>
      </g>
      <T x={60} y={300} s={12} f={C.taupe} o={fa(t, 1.5, 0.4)}>every safe wrapper is built on exactly this</T>
    </Svg>
  );
}

// ── 2 · Mutate through &self, with no cell type at all (predict) ───────────────────────────────────
export function NoCellFail({ t }: StepCtx) {
  return (
    <Stack>
      <Code title="examples/counter_without_unsafecell_fail.rs" lines={['struct Counter { value: u32 }', 'fn increment(&self) { self.value += 1; }']} t={t} start={0.1} end={1.8} highlight={[0, 1]} />
      <div style={{ opacity: fa(t, 2.0, 0.4) }}>
        <Code title="rustc" lines={['error[E0594]: cannot assign to `self.value`,', 'which is behind a `&` reference']} t={t} start={2.0} end={2.6} highlight={[0, 1]} />
      </div>
    </Stack>
  );
}

// ── 3 · Cell copies the whole value, in and out ─────────────────────────────────────────────────────
export function CellCopy({ t }: StepCtx) {
  return (
    <Svg label="Cell copies a whole value in and out; a reference to the inside is never handed out" h={280}>
      <rect x={220} y={30} width={160} height={54} rx={8} fill="none" stroke={C.caramel} strokeWidth={2} />
      <T x={300} y={62} s={13} a="middle" f={C.crema}>Cell&lt;u32&gt;</T>
      <T x={90} y={150} s={13} f={C.taupe} o={fa(t, 0.5, 0.4)}>set copies a value in</T>
      <T x={340} y={150} s={13} f={C.taupe} o={fa(t, 1.0, 0.4)}>get copies a value out</T>
      <T x={90} y={210} s={12} f={C.mocha} o={fa(t, 1.6, 0.4)}>no reference handed out, nothing to track</T>
    </Svg>
  );
}

// ── 4 · RefCell tracks borrows while the program runs ───────────────────────────────────────────────
export function RefCellTracked({ t }: StepCtx) {
  return (
    <Stack>
      <Code
        title="examples/refcell_children.rs"
        lines={['node.children.borrow_mut().push(leaf_one);', 'node.children.borrow_mut().push(leaf_two);', 'let count = node.children.borrow().len();']}
        t={t}
        start={0.1}
        end={2.4}
        highlight={[0, 1, 2]}
      />
    </Stack>
  );
}

// ── 5 · A shared borrow is still alive — then borrow_mut (predict) ─────────────────────────────────
export function DoubleBorrowFail({ t }: StepCtx) {
  return (
    <Stack>
      <Code title="examples/refcell_double_borrow_fail.rs" lines={['let shared = cell.borrow();', 'let exclusive = cell.borrow_mut();   // shared is still alive']} t={t} start={0.1} end={1.8} highlight={[0, 1]} />
      <div style={{ opacity: fa(t, 2.0, 0.4) }}>
        <Code title="run" lines={['thread panicked: RefCell already borrowed']} t={t} start={2.0} end={2.4} highlight={[0]} />
      </div>
    </Stack>
  );
}

// ── 6 · Written once, computed once ─────────────────────────────────────────────────────────────────
export function OnceLazy({ t }: StepCtx) {
  return (
    <Svg label="OnceLock writes once then reads freely; LazyLock computes once, the first time it is touched" h={320}>
      <g opacity={fa(t, 0.2, 0.4)}>
        <rect x={60} y={30} width={260} height={54} rx={8} fill="none" stroke={C.caramel} strokeWidth={2} />
        <T x={190} y={62} s={13} a="middle" f={C.crema}>OnceLock::get_or_init</T>
        <T x={60} y={108} s={12} f={C.taupe}>written once, read freely after</T>
      </g>
      <g opacity={fa(t, 0.8, 0.4)}>
        <rect x={60} y={150} width={260} height={54} rx={8} fill="none" stroke={C.taupe} strokeWidth={1.5} />
        <T x={190} y={182} s={13} a="middle" f={C.crema}>LazyLock::new</T>
        <T x={60} y={228} s={12} f={C.taupe}>computed once, on first touch</T>
      </g>
      <T x={60} y={280} s={13} f={C.mocha} o={fa(t, 1.5, 0.4)}>both reads see the same value back</T>
    </Svg>
  );
}

// ── 7 · Recap ────────────────────────────────────────────────────────────────────────────────────────
export function Recap({ t }: StepCtx) {
  const rows = [
    'the one legal way to mutate through &T',
    'Cell copies values whole, needing no tracking',
    'RefCell tracks borrows, panics on conflict',
    'OnceLock writes once, then reads freely after',
    'LazyLock computes once, on first touch',
  ];
  return (
    <Svg label="recap: UnsafeCell, Cell, RefCell, OnceLock, and LazyLock" h={320}>
      {rows.map((r, i) => (
        <g key={r} opacity={fa(t, 0.2 + i * 0.4, 0.4)}>
          <circle cx={30} cy={40 + i * 50} r={5} fill={C.caramel} />
          <T x={48} y={46 + i * 50} s={15} f={C.crema}>{r}</T>
        </g>
      ))}
    </Svg>
  );
}
