import type { StepCtx } from '../../../../../reels/types';
import { easeInOut, easeOut, easeOutBack, lerp, seg } from '../../../../../reels/anim';
import { Code } from '../../../../../reels/Code';
import { C, Draw, Reticle, Stack, Svg, T } from '../../../../../reels/kit';

// This topic's own shape: one impl box (associated type, chosen once) against several impl boxes
// fanning from one trait-with-parameter (generic parameter, chosen many times) — the opposite
// cardinality from topic 9's monomorphization fan-out. Every snippet is an exact line of
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

/** A labelled box. */
function Box({ x, y, w, h = 36, label, hot = false, dim = false, f }: { x: number; y: number; w: number; h?: number; label: string; hot?: boolean; dim?: boolean; f?: string }) {
  return (
    <g>
      <rect x={x} y={y} width={w} height={h} rx={7} fill={hot ? C.cocoa : 'none'} stroke={hot ? C.caramel : C.mocha} strokeWidth={hot ? 2 : 1.5} strokeDasharray={dim ? '4 3' : undefined} />
      <T x={x + w / 2} y={y + h / 2 + 5} s={13} a="middle" f={f ?? (hot ? C.caramel : dim ? C.taupe : C.crema)}>{label}</T>
    </g>
  );
}

/** A small tick at (x, y), drawn by `k`. */
function Tick({ x, y, k }: { x: number; y: number; k: number }) {
  return <path d={`M${x} ${y} l5 5 l10 -12`} fill="none" stroke={C.caramel} strokeWidth={2.5} strokeLinecap="round" strokeDasharray="24" strokeDashoffset={24 * (1 - k)} opacity={k > 0 ? 1 : 0} />;
}

// ── 1 · Chosen once, or chosen many times ───────────────────────────────────────────────────────────
export function AssocVsGeneric({ t }: StepCtx) {
  // The associated-type impl drops into place once and locks (position, then stays put). The
  // generic-parameter impls arrive one at a time, each sliding in from its own side, showing the
  // same type gaining a second implementation instead of being limited to the first.
  const drop = easeOut(seg(t, 0.2, 0.5));
  const boxDy = (1 - drop) * -30;
  const lockOn = fa(t, 0.5, 0.3);
  const slide1 = easeOut(seg(t, 0.8, 1.1));
  const slide2 = easeOut(seg(t, 1.2, 1.5));
  const dx1 = (1 - slide1) * -180;
  const dx2 = (1 - slide2) * 180;
  return (
    <Svg label="an associated type is chosen once per impl; a generic parameter on the trait lets the same type implement it many times" h={340}>
      <T x={40} y={30} s={13} f={C.taupe}>Codec::Output, an associated type</T>
      <g transform={`translate(0,${boxDy})`} opacity={fa(t, 0.2, 0.3)}>
        <rect x={60} y={44} width={200} height={46} rx={8} fill="none" stroke={C.caramel} strokeWidth={2} />
        <T x={160} y={72} s={13} a="middle" f={C.crema}>impl Codec for A</T>
      </g>
      <rect x={252} y={50} width={14} height={14} fill={C.caramel} opacity={lockOn} />
      <T x={60} y={108} s={12} f={C.caramel} o={lockOn}>chosen once, right here</T>
      <T x={40} y={160} s={13} f={C.taupe}>Meters: From&lt;T&gt;, a generic parameter</T>
      <g transform={`translate(${dx1},0)`} opacity={fa(t, 0.8, 0.3)}>
        <rect x={60} y={174} width={150} height={44} rx={8} fill="none" stroke={C.taupe} strokeWidth={1.5} />
        <T x={135} y={201} s={12} a="middle" f={C.crema}>From&lt;i32&gt;</T>
      </g>
      <g transform={`translate(${dx2},0)`} opacity={fa(t, 1.2, 0.3)}>
        <rect x={230} y={174} width={150} height={44} rx={8} fill="none" stroke={C.taupe} strokeWidth={1.5} />
        <T x={305} y={201} s={12} a="middle" f={C.crema}>From&lt;f64&gt;</T>
      </g>
      <T x={60} y={238} s={12} f={C.taupe} o={fa(t, 1.5, 0.3)}>two impls, one per source type</T>
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
  const one = easeOut(seg(t, 0.4, 0.8));
  const split = easeInOut(seg(t, 0.9, 1.6)); // one trait becomes two distinct traits
  const e1 = easeOut(seg(t, 1.7, 2.1));
  const e2 = easeOut(seg(t, 2.0, 2.4));
  return (
    <Stack>
      <Code title="examples/generic_param_multiple_impls.rs" lines={['impl CodecGeneric<u8> for A { ... }', 'impl CodecGeneric<u16> for A { ... }   // compiles']} t={t} start={0.1} end={0.7} highlight={t > 1.7 ? [0, 1] : []} />
      <Svg label="CodecGeneric with a parameter splits into two distinct traits, CodecGeneric of u8 and of u16; type A implements each once, and both compile" h={190} fill>
        <g opacity={one}>
          <Box x={30} y={72} w={100} h={40} label="A" hot />
        </g>
        {[0, 1].map((i) => {
          const dy = (i ? 1 : -1) * 48 * split;
          const label = split < 0.5 ? 'CodecGeneric<T>' : i ? 'CodecGeneric<u16>' : 'CodecGeneric<u8>';
          if (i === 1 && split <= 0) return null;
          return (
            <g key={i} transform={`translate(0 ${dy.toFixed(1)})`} opacity={one}>
              <Box x={340} y={72} w={220} h={40} label={label} hot={(i ? e2 : e1) > 0.95} />
            </g>
          );
        })}
        <Draw pts={[[130, 86], [240, 44], [340, 44]]} t={t} from={1.7} to={2.1} stroke={C.caramel} w={2} />
        <Draw pts={[[130, 98], [240, 140], [340, 140]]} t={t} from={2.0} to={2.4} stroke={C.caramel} w={2} />
        <Tick x={210} y={34} k={easeOut(seg(t, 2.1, 2.3))} />
        <Tick x={210} y={160} k={easeOut(seg(t, 2.4, 2.6))} />
        <T x={300} y={184} s={13} a="middle" f={C.latte} o={easeOut(seg(t, 2.5, 2.9))}>two traits, as far as coherence cares</T>
      </Svg>
    </Stack>
  );
}

// ── 4 · An item that borrows from the call itself ───────────────────────────────────────────────────
export function GatLending({ t, portrait }: StepCtx) {
  const fixed = easeOut(seg(t, 0.6, 1.1));
  const unpin = easeOut(seg(t, 1.3, 1.6));
  const callA = easeOut(seg(t, 1.7, 2.2));
  const back = easeInOut(seg(t, 2.4, 2.8));
  const callB = easeOut(seg(t, 2.7, 3.2));
  return (
    <Stack>
      {!portrait && <Code title="examples/gat_lending_iterator.rs" lines={['trait LendingIterator {', "    type Item<'a> where Self: 'a;", "    fn next(&mut self) -> Option<Self::Item<'_>>;", '}']} t={t} start={0.1} end={0.7} highlight={t > 1.3 ? [1, 2] : []} />}
      <Svg label="an ordinary associated type is fixed for the whole impl; a generic associated type lends each item from one call's own borrow, handed back before the next call" h={200} fill>
        <rect x={30} y={60} width={160} height={70} rx={10} fill={C.cocoa} stroke={C.mocha} strokeWidth={1.5} />
        <T x={110} y={100} s={14} a="middle" f={C.crema}>the iterator</T>
        {fixed > 0 && unpin < 1 && (
          <g opacity={fixed * (1 - unpin)}>
            <line x1={30} y1={42} x2={570} y2={42} stroke={C.taupe} strokeWidth={2} />
            <T x={300} y={30} s={13} a="middle" f={C.taupe}>type Item: fixed for the whole impl</T>
          </g>
        )}
        {[
          { k: callA, x: 260, gone: back },
          { k: callB, x: 410, gone: 0 },
        ].map((c, i) =>
          c.k > 0 ? (
            <g key={i} opacity={1 - c.gone * 0.75}>
              <line x1={c.x} y1={42} x2={c.x + 130 * c.k} y2={42} stroke={C.caramel} strokeWidth={2.5} />
              <line x1={c.x} y1={35} x2={c.x} y2={49} stroke={C.caramel} strokeWidth={2} />
              {c.k > 0.98 && <line x1={c.x + 130} y1={35} x2={c.x + 130} y2={49} stroke={C.caramel} strokeWidth={2} />}
              <T x={c.x + 65} y={30} s={14} a="middle" f={C.caramel} serif italic>{"'a"}</T>
              <T x={c.x + 65} y={180} s={13} a="middle" f={C.latte}>next()</T>
              <g transform={`translate(${lerp(110 - c.x - 65, 0, c.k * (1 - c.gone)).toFixed(1)} 0)`} opacity={1 - c.gone} display={c.gone > 0.98 ? 'none' : undefined}>
                <rect x={c.x + 15} y={74} width={100} height={42} rx={7} fill={C.cocoa} stroke={c.gone > 0.5 ? C.mocha : C.caramel} strokeWidth={1.5} />
                <T x={c.x + 65} y={100} s={13} a="middle" f={c.gone > 0.5 ? C.taupe : C.caramel}>{"Item<'a>"}</T>
              </g>
              <line x1={c.x + 65} y1={49} x2={c.x + 65} y2={74} stroke={C.caramel} strokeWidth={1.5} strokeDasharray="3 3" opacity={c.k * (1 - c.gone)} />
            </g>
          ) : null,
        )}
        <T x={30} y={160} s={13} f={C.latte} o={easeOut(seg(t, 3.2, 3.5))}>each item borrows one call</T>
      </Svg>
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
  const regions = easeOut(seg(t, 0.4, 0.8));
  const wrap = easeInOut(seg(t, 0.9, 1.7)); // Vec<u8> moves inside a local Bytes
  const shell = easeOutBack(seg(t, 1.5, 1.9));
  const ok = easeOut(seg(t, 2.5, 2.8));
  const vx = lerp(370, 120, wrap);
  return (
    <Stack>
      <Code title="examples/newtype_fix.rs" lines={['struct Bytes(Vec<u8>);', 'impl fmt::Display for Bytes { ... }   // compiles']} t={t} start={0.1} end={0.7} highlight={t > 2.0 ? [1] : [0]} />
      <Svg label="Vec<u8> is foreign, so it is wrapped in the local Bytes; the impl of Display now targets a local type and compiles, printing [1, 2, 3]" h={200} fill>
        <g opacity={regions}>
          <rect x={20} y={20} width={260} height={150} rx={10} fill="none" stroke={C.caramel} strokeWidth={1.5} strokeDasharray="6 4" />
          <T x={34} y={42} s={13} f={C.caramel}>this crate</T>
          <rect x={320} y={20} width={260} height={150} rx={10} fill="none" stroke={C.mocha} strokeWidth={1.5} strokeDasharray="6 4" />
          <T x={334} y={42} s={13} f={C.taupe}>std (foreign)</T>
          <Box x={370} y={110} w={150} label="fmt::Display" />
        </g>
        {shell > 0 && (
          <g transform={`translate(${(vx + 75).toFixed(1)} 75) scale(${shell.toFixed(3)}) translate(${(-(vx + 75)).toFixed(1)} -75)`}>
            <rect x={vx - 15} y={50} width={180} height={50} rx={9} fill="none" stroke={C.caramel} strokeWidth={2} />
            <T x={vx - 5} y={115} s={13} f={C.caramel}>Bytes</T>
          </g>
        )}
        <g opacity={regions}>
          <Box x={vx} y={57} w={150} label="Vec<u8>" />
        </g>
        <Draw pts={[[370, 128], [200, 128], [200, 100]]} t={t} from={2.0} to={2.5} stroke={C.caramel} w={2} />
        <T x={270} y={190} s={13} a="middle" f={C.caramel} o={ok}>compiles: [1, 2, 3]</T>
        <Reticle x={195} y={75} w={196} h={66} t={t} at={2.6} />
      </Svg>
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
  return (
    <RecapList
      t={t}
      end={2.8}
      label="recap: associated types, generic parameters, GATs, the orphan rule, newtype, and blanket impls"
      rows={['an associated type is chosen once per impl', 'a generic parameter on the trait allows many', 'a GAT ties the item to the call itself', 'the orphan rule needs the trait or type local', 'a newtype wrapper satisfies that rule', 'a blanket impl covers every qualifying type']}
    />
  );
}
