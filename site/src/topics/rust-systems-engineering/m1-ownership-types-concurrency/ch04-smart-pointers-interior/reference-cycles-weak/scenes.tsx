import type { StepCtx } from '../../../../../reels/types';
import { easeOut, seg } from '../../../../../reels/anim';
import { Code } from '../../../../../reels/Code';
import { C, Draw, Stack, Svg, T } from '../../../../../reels/kit';

// This chapter's cycle-loop and refcount-dial visual language (CHAPTER.md §A.5): two node boxes
// pointing at each other in a closed loop, redrawn with one arrow turned dashed and hollow-headed
// for Weak, to show the identical shape no longer leaking. Every snippet is an exact line of
// examples/*.rs; every claim is executed by examples.py. No digits in any caption text.

const fa = (t: number, a: number, d = 0.4) => easeOut(seg(t, a, a + d));

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
export function CompilePredict({ t }: StepCtx) {
  return (
    <Stack>
      <Code
        title="examples/rc_cycle_leak.rs"
        lines={['parent.children.borrow_mut().push(Rc::clone(&child));', '*child.parent.borrow_mut() = Some(Rc::clone(&parent));']}
        t={t}
        start={0.1}
        end={2.0}
        highlight={[0, 1]}
      />
      <div style={{ opacity: fa(t, 2.2, 0.4) }}>
        <Code title="counting allocator" lines={['allocations never freed after both drop out of scope']} t={t} start={2.2} end={2.6} highlight={[0]} />
      </div>
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
export function UpgradeAfterDrop({ t }: StepCtx) {
  return (
    <Stack>
      <Code
        title="examples/weak_upgrade_after_drop.rs"
        lines={['let weak = Rc::downgrade(&strong);', 'drop(strong);', 'weak.upgrade()   // ?']}
        t={t}
        start={0.1}
        end={2.2}
        highlight={[0, 1, 2]}
      />
      <div style={{ opacity: fa(t, 2.4, 0.4) }}>
        <Code title="result" lines={['None']} t={t} start={2.4} end={2.6} highlight={[0]} />
      </div>
    </Stack>
  );
}

// ── 6 · Built with a Weak to itself ─────────────────────────────────────────────────────────────────
export function NewCyclic({ t }: StepCtx) {
  return (
    <Stack>
      <Code
        title="examples/rc_new_cyclic.rs"
        lines={['Rc::new_cyclic(|weak_self| Node {', '    self_ref: RefCell::new(weak_self.clone()),', '})']}
        t={t}
        start={0.1}
        end={2.2}
        highlight={[0, 1, 2]}
      />
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
  return (
    <Svg label="recap: a cycle leaks, Weak breaks it, new_cyclic builds it in" h={320}>
      {rows.map((r, i) => (
        <g key={r} opacity={fa(t, 0.2 + i * 0.4, 0.4)}>
          <circle cx={30} cy={40 + i * 50} r={5} fill={C.caramel} />
          <T x={48} y={46 + i * 50} s={15} f={C.crema}>{r}</T>
        </g>
      ))}
    </Svg>
  );
}
