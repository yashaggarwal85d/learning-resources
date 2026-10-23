import type { StepCtx } from '../../../../../reels/types';
import { easeOut, seg } from '../../../../../reels/anim';
import { Code } from '../../../../../reels/Code';
import { C, Draw, Stack, Svg, T } from '../../../../../reels/kit';

// This topic's own shape: one impl box (associated type, chosen once) against several impl boxes
// fanning from one trait-with-parameter (generic parameter, chosen many times) — the opposite
// cardinality from topic 9's monomorphization fan-out. Every snippet is an exact line of
// examples/*.rs; every claim is executed by examples.py. No digits in any caption text.

const fa = (t: number, a: number, d = 0.4) => easeOut(seg(t, a, a + d));

// ── 1 · Chosen once, or chosen many times ───────────────────────────────────────────────────────────
export function AssocVsGeneric({ t }: StepCtx) {
  return (
    <Svg label="an associated type is chosen once per impl; a generic parameter on the trait lets the same type implement it many times" h={340}>
      <T x={40} y={30} s={13} f={C.taupe}>Codec::Output, an associated type</T>
      <g opacity={fa(t, 0.2, 0.4)}>
        <rect x={60} y={44} width={200} height={46} rx={8} fill="none" stroke={C.caramel} strokeWidth={2} />
        <T x={160} y={72} s={13} a="middle" f={C.crema}>impl Codec for A</T>
        <T x={60} y={108} s={12} f={C.caramel}>chosen once, right here</T>
      </g>
      <T x={40} y={160} s={13} f={C.taupe}>Meters: From&lt;T&gt;, a generic parameter</T>
      <g opacity={fa(t, 0.8, 0.4)}>
        <rect x={60} y={174} width={150} height={44} rx={8} fill="none" stroke={C.taupe} strokeWidth={1.5} />
        <T x={135} y={201} s={12} a="middle" f={C.crema}>From&lt;i32&gt;</T>
        <rect x={230} y={174} width={150} height={44} rx={8} fill="none" stroke={C.taupe} strokeWidth={1.5} />
        <T x={305} y={201} s={12} a="middle" f={C.crema}>From&lt;f64&gt;</T>
        <T x={60} y={238} s={12} f={C.taupe}>two impls, one per source type</T>
      </g>
    </Svg>
  );
}

// ── 2 · Can the same type pick Output twice? (predict) ────────────────────────────────────────────
export function DuplicateImpl({ t }: StepCtx) {
  return (
    <Stack>
      <Code
        title="examples/assoc_type_duplicate_fail.rs"
        lines={['impl Codec for A { type Output = u8; ... }', 'impl Codec for A { type Output = u16; ... }']}
        t={t}
        start={0.1}
        end={1.4}
        highlight={[0, 1]}
      />
      <div style={{ opacity: fa(t, 1.6, 0.4) }}>
        <Code title="rustc" lines={['error[E0119]: conflicting implementations', 'of trait Codec for type A']} t={t} start={1.6} end={2.2} highlight={[0, 1]} />
      </div>
    </Stack>
  );
}

// ── 3 · A generic parameter dodges that limit (no takeaway: the reel's "from" step) ────────────────
export function GenericMultiple({ t }: StepCtx) {
  return (
    <Stack>
      <Code
        title="examples/generic_param_multiple_impls.rs"
        lines={['impl CodecGeneric<u8> for A { ... }', 'impl CodecGeneric<u16> for A { ... }   // compiles']}
        t={t}
        start={0.1}
        end={1.6}
        highlight={[0, 1]}
      />
      <Svg label="CodecGeneric of u8 and CodecGeneric of u16 are different traits as far as coherence cares" h={46}>
        <T x={40} y={28} s={13} f={C.taupe} o={fa(t, 1.8, 0.4)}>different traits as far as coherence cares</T>
      </Svg>
    </Stack>
  );
}

// ── 4 · An item that borrows from the call itself ───────────────────────────────────────────────────
export function GatLending({ t }: StepCtx) {
  return (
    <Stack>
      <Code
        title="examples/gat_lending_iterator.rs"
        lines={['trait LendingIterator {', "    type Item<'a> where Self: 'a;", "    fn next(&mut self) -> Option<Self::Item<'_>>;", '}']}
        t={t}
        start={0.1}
        end={2.2}
        highlight={[1]}
      />
    </Stack>
  );
}

// ── 5 · Implementing a foreign trait for a foreign type (predict) ──────────────────────────────────
export function OrphanFail({ t }: StepCtx) {
  return (
    <Stack>
      <Code title="examples/orphan_rule_fail.rs" lines={['impl fmt::Display for Vec<u8> { ... }']} t={t} start={0.1} end={1.2} highlight={[0]} />
      <div style={{ opacity: fa(t, 1.4, 0.4) }}>
        <Code title="rustc" lines={['error[E0117]: only traits defined in the', 'current crate can be implemented here']} t={t} start={1.4} end={2.0} highlight={[0, 1]} />
      </div>
    </Stack>
  );
}

// ── 6 · A local wrapper satisfies the rule ──────────────────────────────────────────────────────────
export function NewtypeFix({ t }: StepCtx) {
  return (
    <Stack>
      <Code
        title="examples/newtype_fix.rs"
        lines={['struct Bytes(Vec<u8>);', 'impl fmt::Display for Bytes { ... }   // compiles']}
        t={t}
        start={0.1}
        end={1.6}
        highlight={[0, 1]}
      />
    </Stack>
  );
}

// ── 7 · One impl, every type that qualifies ─────────────────────────────────────────────────────────
export function BlanketImpl({ t }: StepCtx) {
  return (
    <Svg label="one blanket impl covers every type that satisfies the bound, the same shape as std's own impl of Display for ToString" h={300}>
      <rect x={120} y={30} width={360} height={56} rx={10} fill="none" stroke={C.caramel} strokeWidth={2} />
      <T x={300} y={64} s={13} a="middle" f={C.crema}>impl&lt;T: Debug&gt; Describe for T</T>
      <g opacity={fa(t, 0.5, 0.4)}>
        <Draw pts={[[220, 86], [160, 170]]} t={t} from={0.5} to={0.8} stroke={C.mocha} w={2} pen={false} />
        <rect x={80} y={176} width={160} height={50} rx={8} fill="none" stroke={C.mocha} strokeWidth={1.5} />
        <T x={160} y={206} s={13} a="middle" f={C.taupe}>a plain integer</T>
      </g>
      <g opacity={fa(t, 0.9, 0.4)}>
        <Draw pts={[[380, 86], [440, 170]]} t={t} from={0.9} to={1.2} stroke={C.mocha} w={2} pen={false} />
        <rect x={360} y={176} width={160} height={50} rx={8} fill="none" stroke={C.mocha} strokeWidth={1.5} />
        <T x={440} y={206} s={13} a="middle" f={C.taupe}>a custom struct</T>
      </g>
      <T x={300} y={260} s={14} a="middle" f={C.caramel} o={fa(t, 1.5, 0.4)}>one declaration, every qualifying type</T>
    </Svg>
  );
}

// ── 8 · Recap ────────────────────────────────────────────────────────────────────────────────────────
export function Recap({ t }: StepCtx) {
  const rows = [
    'an associated type is chosen once per impl',
    'a generic parameter on the trait allows many',
    'a GAT ties the item to the call itself',
    'the orphan rule needs the trait or type local',
    'a newtype wrapper satisfies that rule',
    'a blanket impl covers every qualifying type',
  ];
  return (
    <Svg label="recap: associated types, generic parameters, GATs, the orphan rule, newtype, and blanket impls" h={380}>
      {rows.map((r, i) => (
        <g key={r} opacity={fa(t, 0.2 + i * 0.4, 0.4)}>
          <circle cx={30} cy={40 + i * 50} r={5} fill={C.caramel} />
          <T x={48} y={46 + i * 50} s={15} f={C.crema}>{r}</T>
        </g>
      ))}
    </Svg>
  );
}
