import { useEffect, useState } from 'react';
import type { StepCtx } from '../../../../../reels/types';
import { easeInOut, easeOut, easeOutBack, lerp, seg } from '../../../../../reels/anim';
import { Code } from '../../../../../reels/Code';
import { C, Draw, Reticle, Stack, Svg, T } from '../../../../../reels/kit';

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


// This chapter's cycle-loop and refcount-dial visual language (CHAPTER.md §A.5): two node boxes
// pointing at each other in a closed loop, redrawn with one arrow turned dashed and hollow-headed
// for Weak, to show the identical shape no longer leaking. Every snippet is an exact line of
// examples/*.rs; every claim is executed by examples.py. No digits in any caption text.

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

// ── 1 · A cycle that never closes ───────────────────────────────────────────────────────────────────
export function CycleLeak({ t }: StepCtx) {
  return (
    <Svg label="a parent and child each hold a strong Rc to the other; neither one's count ever reaches zero" h={300}>
      <g opacity={fa(t, 0.1, 0.4)}>
        <rect x={80} y={100} width={150} height={56} rx={8} fill="none" stroke={C.caramel} strokeWidth={2} />
        <T x={155} y={134} s={13} a="middle" f={C.crema}>parent</T>
      </g>
      <g opacity={fa(t, 0.6, 0.4)}>
        <rect x={370} y={100} width={150} height={56} rx={8} fill="none" stroke={C.caramel} strokeWidth={2} />
        <T x={445} y={134} s={13} a="middle" f={C.crema}>child</T>
      </g>
      <g opacity={fa(t, 1.1, 0.4)}>
        <Draw pts={[[230, 115], [370, 115]]} t={t} from={1.1} to={1.3} stroke={C.mocha} w={2} pen={false} />
        <Draw pts={[[370, 141], [230, 141]]} t={t} from={1.3} to={1.5} stroke={C.mocha} w={2} pen={false} />
      </g>
      <T x={60} y={220} s={13} f={C.mocha} o={fa(t, 1.7, 0.4)}>both strong, so neither count ever reaches zero</T>
    </Svg>
  );
}

// ── 2 · Does this reject at compile time? (predict) ─────────────────────────────────────────────────
export function CompilePredict({ t, answer }: StepCtx) {
  const ans = answer !== null;
  const s = useSinceAnswer(ans);
  return (
    <Stack>
      <Code
        title="examples/rc_cycle_leak.rs"
        lines={['parent.children.borrow_mut().push(Rc::clone(&child));', '*child.parent.borrow_mut() = Some(Rc::clone(&parent));']}
        t={t}
        start={0.1}
        end={1.6}
        highlight={[0, 1]}
      />
      {ans && (
        <div style={{ opacity: fa(s, 0, 0.3) }}>
          <Code title="counting allocator" lines={['allocations never freed after both drop out of scope']} t={s} start={0.1} end={0.5} highlight={[0]} />
        </div>
      )}
    </Stack>
  );
}

// ── 3 · Weak: a reference that owns nothing ─────────────────────────────────────────────────────────
export function WeakConcept({ t }: StepCtx) {
  return (
    <Svg label="Weak points at the same value an Rc manages, but carries no ownership at all" h={260}>
      <rect x={200} y={30} width={200} height={54} rx={8} fill="none" stroke={C.caramel} strokeWidth={2} />
      <T x={300} y={62} s={13} a="middle" f={C.crema}>the shared value</T>
      <g opacity={fa(t, 0.5, 0.4)}>
        <Draw pts={[[300, 84], [300, 130]]} t={t} from={0.5} to={0.7} stroke={C.taupe} w={2} pen={false} />
        <rect x={210} y={136} width={180} height={46} rx={8} fill="none" stroke={C.taupe} strokeWidth={1.5} strokeDasharray="6 5" />
        <T x={300} y={164} s={13} a="middle" f={C.crema}>Weak, no ownership</T>
      </g>
      <T x={60} y={220} s={12} f={C.taupe} o={fa(t, 1.2, 0.4)}>its count never keeps anything alive</T>
    </Svg>
  );
}

// ── 4 · The same shape, with one link made Weak ─────────────────────────────────────────────────────
export function WeakFixesCycle({ t }: StepCtx) {
  return (
    <Svg label="the identical parent and child, parent held by Weak instead of Rc; the counting allocator shows nothing leaked" h={300}>
      <g opacity={fa(t, 0.1, 0.4)}>
        <rect x={80} y={100} width={150} height={56} rx={8} fill="none" stroke={C.caramel} strokeWidth={2} />
        <T x={155} y={134} s={13} a="middle" f={C.crema}>parent</T>
      </g>
      <g opacity={fa(t, 0.6, 0.4)}>
        <rect x={370} y={100} width={150} height={56} rx={8} fill="none" stroke={C.caramel} strokeWidth={2} />
        <T x={445} y={134} s={13} a="middle" f={C.crema}>child</T>
      </g>
      <g opacity={fa(t, 1.1, 0.4)}>
        <Draw pts={[[230, 115], [370, 115]]} t={t} from={1.1} to={1.3} stroke={C.mocha} w={2} pen={false} />
        <Draw pts={[[370, 141], [230, 141]]} t={t} from={1.3} to={1.5} stroke={C.taupe} w={2} pen={false} dash="6 5" />
      </g>
      <T x={60} y={220} s={13} f={C.mocha} o={fa(t, 1.7, 0.4)}>one link weak now, and nothing leaks</T>
    </Svg>
  );
}

// ── 5 · The last strong owner is dropped — then upgrade (predict) ──────────────────────────────────
export function UpgradeAfterDrop({ t, answer, portrait }: StepCtx) {
  const ans = answer !== null;
  const s = useSinceAnswer(ans);
  return (
    <Stack>
      {!(portrait && ans) && (
        <Code
          title="examples/weak_upgrade_after_drop.rs"
          lines={['let weak = Rc::downgrade(&strong);', 'drop(strong);', 'weak.upgrade()   // ?']}
          t={t}
          start={0.1}
          end={1.8}
          highlight={[0, 1, 2]}
        />
      )}
      {ans && (
        <div style={{ opacity: fa(s, 0, 0.3) }}>
          <Code title="result" lines={['None']} t={s} start={0.1} end={0.3} highlight={[0]} />
        </div>
      )}
    </Stack>
  );
}

// ── 6 · Built with a Weak to itself ─────────────────────────────────────────────────────────────────
export function NewCyclic({ t, portrait }: StepCtx) {
  const alloc = easeOut(seg(t, 0.6, 1.0)); // the allocation exists, still unbuilt
  const hand = easeInOut(seg(t, 1.1, 1.7)); // its Weak is handed to the closure
  const tuck = easeInOut(seg(t, 1.9, 2.5)); // and tucked into self_ref
  const done = easeOut(seg(t, 2.5, 2.9));
  const wx = lerp(lerp(150, 420, hand), 300, tuck);
  const wy = lerp(lerp(110, 60, hand), 112, tuck);
  return (
    <Stack>
      {!portrait && <Code title="examples/rc_new_cyclic.rs" lines={['Rc::new_cyclic(|weak_self| Node {', '    self_ref: RefCell::new(weak_self.clone()),', '})']} t={t} start={0.1} end={0.6} highlight={t > 1.9 ? [1] : [0]} />}
      <Svg label="new_cyclic allocates the node first, hands the building closure a Weak pointing at that unfinished allocation, and the closure tucks it into self_ref, so the finished node points back at itself" h={190} fill>
        <g opacity={alloc}>
          <rect x={60} y={40} width={180} height={110} rx={10} fill={done > 0.5 ? C.cocoa : 'none'} stroke={done > 0.5 ? C.caramel : C.mocha} strokeWidth={1.5} strokeDasharray={done > 0.5 ? undefined : '6 5'} />
          <T x={74} y={30} s={13} f={C.taupe}>{done > 0.5 ? 'Node: built' : 'Node: being built'}</T>
          <rect x={240} y={92} width={130} height={40} rx={7} fill="none" stroke={C.mocha} strokeWidth={1.5} strokeDasharray="4 3" />
          <T x={305} y={150} s={13} a="middle" f={C.taupe}>self_ref</T>
        </g>
        <g opacity={easeOut(seg(t, 1.0, 1.3))}>
          <rect x={380} y={20} width={190} height={80} rx={10} fill="none" stroke={C.mocha} strokeWidth={1.5} />
          <T x={394} y={116} s={13} f={C.taupe}>the closure</T>
        </g>
        {hand > 0 && (
          <g transform={`translate(${wx.toFixed(1)} ${wy.toFixed(1)})`}>
            <rect x={-55} y={-14} width={110} height={28} rx={14} fill={C.cinnamon} />
            <T x={0} y={5} s={13} a="middle" f={C.espresso} w={700}>Weak</T>
          </g>
        )}
        {done > 0 && <Draw pts={[[300, 98], [300, 74], [250, 74], [240, 74]]} t={t} from={2.5} to={2.9} stroke={C.cinnamon} w={2} dash="5 4" />}
        <T x={60} y={182} s={13} f={C.cinnamon} o={easeOut(seg(t, 2.8, 3.1))}>points back at itself, without owning it</T>
      </Svg>
    </Stack>
  );
}

// ── 7 · Recap ────────────────────────────────────────────────────────────────────────────────────────
export function Recap({ t }: StepCtx) {
  const rows = [
    'a cycle of strong references leaks forever',
    'safe Rust compiles that cycle without complaint',
    'Weak carries no ownership, and breaks the cycle',
    'upgrade returns none once the owner is gone',
    'new_cyclic builds in a weak pointer to itself',
  ];
  return <RecapList t={t} end={3.2} label="recap: a cycle leaks, Weak breaks it, new_cyclic builds it in" rows={rows}
      s={14}
    />;
}
