import { useEffect, useState } from 'react';
import type { StepCtx } from '../../../../../reels/types';
import { easeInOut, easeOut, easeOutBack, lerp, seg } from '../../../../../reels/anim';
import { Code } from '../../../../../reels/Code';
import { C, Decode, Draw, Reticle, Stack, Svg, T } from '../../../../../reels/kit';

/** Seconds since the learner answered a predict step (the player's clock has stopped by then), so a reveal can still move. */
function useSinceAnswer(on: boolean) {
  const [s, setS] = useState(0);
  useEffect(() => {
    if (!on) {
      setS(0);
      return;
    }
    if (typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) {
      setS(99);
      return;
    }
    let raf = 0;
    const t0 = performance.now();
    const tick = () => {
      const d = (performance.now() - t0) / 1000;
      setS(d);
      if (d < 4.5) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [on]);
  return s;
}


// One primitive (UnsafeCell) with three safe wrappers fanning out from it: Cell (copy), RefCell
// (tracked borrow, checked at run time), OnceCell/LazyLock (written or computed once). Every
// snippet is an exact line of examples/*.rs; every claim is executed by examples.py. No digits in
// any caption text.

const fa = (t: number, a: number, d = 0.4) => easeOut(seg(t, a, a + d));

/** A recap as a payoff: each point slides in from the left on its beat (fitted to the step's `end`), its tick draws as it
 * lands, a spine grows down to meet it, and the last point (where the topic leads next) lights up and is locked on. */
function RecapList({ t, rows, label, end, step = 50, s = 15 }: { t: number; rows: string[]; label: string; end: number; step?: number; s?: number }) {
  const y0 = 40;
  const n = rows.length;
  const start = 0.15;
  const beat = Math.min(0.42, Math.max(0.2, (end - start - 1.15) / Math.max(1, n - 1)));
  const h = y0 + (n - 1) * step + 40;
  const lastY = y0 + (n - 1) * step;
  return (
    <Svg label={label} h={Math.max(300, h)}>
      <Draw pts={[[29, y0 - 5], [29, lastY - 5]]} t={t} from={start + 0.1} to={start + 0.1 + (n - 1) * beat} stroke={C.mocha} w={1.5} pen={false} />
      {rows.map((r, i) => {
        const at = start + i * beat;
        const k = easeOut(seg(t, at, at + 0.45));
        const d = easeOut(seg(t, at + 0.2, at + 0.55));
        const y = y0 + i * step;
        const last = i === n - 1;
        if (k <= 0) return null;
        return (
          <g key={r} opacity={k} transform={`translate(${((1 - k) * -44).toFixed(1)} 0)`}>
            <circle cx={29} cy={y - 5} r={11} fill={C.espresso} stroke={last ? C.caramel : C.mocha} strokeWidth={1.5} />
            <path d={`M23 ${y - 5} l4 4 l8 -9`} fill="none" stroke={C.caramel} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" strokeDasharray="20" strokeDashoffset={20 * (1 - d)} />
            <T x={46} y={y} s={s} f={last ? C.caramel : C.crema}>{r}</T>
          </g>
        );
      })}
      <Reticle x={300} y={lastY - 5} w={576} h={36} t={t} at={Math.max(start + (n - 1) * beat + 0.3, end - 0.6)} />
    </Svg>
  );
}

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
export function NoCellFail({ t, answer }: StepCtx) {
  const ans = answer !== null;
  const s = useSinceAnswer(ans);
  return (
    <Stack>
      <Code title="examples/counter_without_unsafecell_fail.rs" lines={['struct Counter { value: u32 }', 'fn increment(&self) { self.value += 1; }']} t={t} start={0.1} end={1.8} highlight={[0, 1]} />
      {ans && (
        <div style={{ opacity: fa(s, 0, 0.3) }}>
          <Code title="rustc" lines={['error[E0594]: cannot assign to `self.value`,', 'which is behind a `&` reference']} t={s} start={0.1} end={0.7} highlight={[0, 1]} />
        </div>
      )}
    </Stack>
  );
}

// ── 3 · Cell copies the whole value, in and out ─────────────────────────────────────────────────────
export function CellCopy({ t }: StepCtx) {
  // A value token slides into the Cell (set), then a second, separate token slides back out of it
  // (get) — two different tokens, because what moves each time is a copy, never a shared pointer.
  const inT = easeOut(seg(t, 0.4, 0.75));
  const inX = 150 + inT * 90;
  const outT = easeOut(seg(t, 1.0, 1.35));
  const outX = 380 + outT * 90;
  return (
    <Svg label="Cell copies a whole value in and out; a reference to the inside is never handed out" h={280}>
      <rect x={220} y={30} width={160} height={54} rx={8} fill="none" stroke={C.caramel} strokeWidth={2} />
      <T x={300} y={62} s={13} a="middle" f={C.crema}>Cell&lt;u32&gt;</T>
      <circle cx={inX} cy={57} r={7} fill={C.taupe} opacity={inT > 0 && inT < 1 ? 1 : 0} />
      <circle cx={outX} cy={57} r={7} fill={C.mocha} opacity={outT > 0 && outT < 1 ? 1 : 0} />
      <T x={90} y={150} s={13} f={C.taupe} o={fa(t, 0.4, 0.3)}>set copies a value in</T>
      <T x={340} y={150} s={13} f={C.taupe} o={fa(t, 1.0, 0.3)}>get copies a value out</T>
      <T x={90} y={210} s={12} f={C.mocha} o={fa(t, 1.6, 0.4)}>no reference handed out, nothing to track</T>
    </Svg>
  );
}

// ── 4 · RefCell tracks borrows while the program runs ───────────────────────────────────────────────
export function RefCellTracked({ t, portrait }: StepCtx) {
  // Three runtime borrows, one after another: a writer token goes in and comes back twice, then a reader token.
  const phases = [
    { a: 0.8, kind: 'mut' },
    { a: 1.6, kind: 'mut' },
    { a: 2.4, kind: 'ref' },
  ];
  const active = phases.findIndex((p) => t >= p.a && t < p.a + 0.65);
  const flag = active < 0 ? 'free' : phases[active].kind === 'mut' ? 'one writer' : 'reading';
  const leaves = [easeOutBack(seg(t, 1.05, 1.35)), easeOutBack(seg(t, 1.85, 2.15))];
  return (
    <Stack>
      {!portrait && <Code
        title="examples/refcell_children.rs"
        lines={['node.children.borrow_mut().push(leaf_one);', 'node.children.borrow_mut().push(leaf_two);', 'let count = node.children.borrow().len();']}
        t={t}
        start={0.1}
        end={0.7}
        highlight={active >= 0 ? [active] : []}
      />}
      <Svg label="each borrow_mut hands out a tracked writer token that the RefCell's runtime flag records and takes back; then borrow hands out a reader and reads the count, 2" h={190} fill>
        <rect x={20} y={40} width={250} height={110} rx={10} fill="none" stroke={C.mocha} strokeWidth={1.5} />
        <T x={34} y={30} s={13} f={C.taupe}>RefCell: children</T>
        {[0, 1].map((i) => (
          <g key={i}>
            <rect x={40 + i * 110} y={60} width={100} height={36} rx={6} fill="none" stroke={C.mocha} strokeDasharray="4 3" />
            {leaves[i] > 0 && (
              <g transform={`translate(${90 + i * 110} 78) scale(${leaves[i].toFixed(3)}) translate(${-(90 + i * 110)} -78)`}>
                <rect x={40 + i * 110} y={60} width={100} height={36} rx={6} fill={C.cocoa} stroke={C.crema} strokeWidth={1.5} />
                <T x={90 + i * 110} y={83} s={13} a="middle" f={C.crema}>{i ? 'leaf_two' : 'leaf_one'}</T>
              </g>
            )}
          </g>
        ))}
        <T x={40} y={130} s={13} f={C.taupe}>flag:</T>
        <Decode key={flag} text={flag} x={104} y={130} s={13} f={active < 0 ? C.latte : phases[active].kind === 'mut' ? C.caramel : C.cinnamon} t={t} at={active < 0 ? 0 : phases[active].a} dur={0.25} />
        {phases.map((p, i) => {
          const k = easeInOut(seg(t, p.a, p.a + 0.3));
          const back = easeInOut(seg(t, p.a + 0.4, p.a + 0.65));
          const x = lerp(lerp(440, 290, k), 440, back);
          if (k <= 0 || back >= 1) return null;
          return (
            <g key={i} transform={`translate(${x.toFixed(1)} 78)`}>
              <rect x={0} y={-16} width={110} height={32} rx={16} fill={p.kind === 'mut' ? C.caramel : C.cinnamon} />
              <T x={55} y={5} s={13} a="middle" f={C.espresso} w={700}>{p.kind === 'mut' ? '&mut' : '&'}</T>
            </g>
          );
        })}
        <T x={440} y={150} s={13} f={C.latte} o={easeOut(seg(t, 0.6, 0.9))}>run-time check</T>
        <T x={300} y={182} s={14} a="middle" f={C.caramel} o={easeOut(seg(t, 2.8, 3.1))}>count = 2</T>
      </Svg>
    </Stack>
  );
}

// ── 5 · A shared borrow is still alive — then borrow_mut (predict) ─────────────────────────────────
export function DoubleBorrowFail({ t, answer }: StepCtx) {
  const ans = answer !== null;
  const s = useSinceAnswer(ans);
  return (
    <Stack>
      <Code title="examples/refcell_double_borrow_fail.rs" lines={['let shared = cell.borrow();', 'let exclusive = cell.borrow_mut();   // shared is still alive']} t={t} start={0.1} end={1.8} highlight={[0, 1]} />
      {ans && (
        <div style={{ opacity: fa(s, 0, 0.3) }}>
          <Code title="run" lines={['thread panicked: RefCell already borrowed']} t={s} start={0.1} end={0.5} highlight={[0]} />
        </div>
      )}
    </Stack>
  );
}

// ── 6 · Written once, computed once ─────────────────────────────────────────────────────────────────
export function OnceLazy({ t }: StepCtx) {
  // The first touch of each cell carries a filled "write/compute" token that lands and stays
  // (position, then it settles); every touch after that is a hollow "read" token that arrives and
  // leaves again without changing the cell, showing why only the first touch does real work.
  const write = easeOut(seg(t, 0.2, 0.5));
  const writeX = 150 + write * 200;
  const read1 = easeOut(seg(t, 0.6, 0.85));
  const read1X = 400 + read1 * 60;
  const compute = easeOut(seg(t, 0.9, 1.2));
  const computeX = 150 + compute * 200;
  const read2 = easeOut(seg(t, 1.3, 1.55));
  const read2X = 400 + read2 * 60;
  return (
    <Svg label="OnceLock writes once then reads freely; LazyLock computes once, the first time it is touched" h={320}>
      <rect x={60} y={30} width={260} height={54} rx={8} fill="none" stroke={C.caramel} strokeWidth={2} opacity={fa(t, 0.1, 0.3)} />
      <T x={190} y={62} s={13} a="middle" f={C.crema} o={fa(t, 0.1, 0.3)}>OnceLock::get_or_init</T>
      <circle cx={writeX} cy={57} r={7} fill={C.caramel} opacity={write > 0 ? 1 : 0} />
      <circle cx={read1X} cy={57} r={6} fill="none" stroke={C.taupe} strokeWidth={1.5} opacity={read1 > 0 && read1 < 1 ? 1 : 0} />
      <T x={60} y={108} s={12} f={C.taupe} o={fa(t, 0.6, 0.3)}>written once, read freely after</T>

      <rect x={60} y={150} width={260} height={54} rx={8} fill="none" stroke={C.taupe} strokeWidth={1.5} opacity={fa(t, 0.8, 0.3)} />
      <T x={190} y={182} s={13} a="middle" f={C.crema} o={fa(t, 0.8, 0.3)}>LazyLock::new</T>
      <circle cx={computeX} cy={177} r={7} fill={C.caramel} opacity={compute > 0 ? 1 : 0} />
      <circle cx={read2X} cy={177} r={6} fill="none" stroke={C.taupe} strokeWidth={1.5} opacity={read2 > 0 && read2 < 1 ? 1 : 0} />
      <T x={60} y={228} s={12} f={C.taupe} o={fa(t, 1.3, 0.3)}>computed once, on first touch</T>
      <T x={60} y={280} s={13} f={C.mocha} o={fa(t, 1.9, 0.4)}>both reads see the same value back</T>
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
  return <RecapList t={t} end={3} label="recap: UnsafeCell, Cell, RefCell, OnceLock, and LazyLock" rows={rows} />;
}
