import { useEffect, useState } from 'react';
import type { StepCtx } from '../../../../../reels/types';
import { easeInOut, easeOut, easeOutBack, lerp, seg } from '../../../../../reels/anim';
import { Code } from '../../../../../reels/Code';
import { C, Draw, Reticle, Stack, Svg, T } from '../../../../../reels/kit';

// This topic's own shape (CHAPTER.md §A.5): a fat pointer as two adjacent small boxes (data, vtable)
// drawn as one unit, the vtable box carrying its own rows for each method's function pointer. Reused
// across every dyn Trait step. Every snippet is an exact line of examples/*.rs; every claim is
// executed by examples.py. No digits in any caption text (house style: numbers are spelled, not shown).

const fa = (t: number, a: number, d = 0.4) => easeOut(seg(t, a, a + d));

/** A thin, one-word pointer box. */
function ThinPointer({ x, y, label }: { x: number; y: number; label: string }) {
  return (
    <g>
      <rect x={x} y={y} width={90} height={46} rx={8} fill="none" stroke={C.taupe} strokeWidth={1.5} />
      <T x={x + 45} y={y + 29} s={12} a="middle" f={C.taupe}>{label}</T>
    </g>
  );
}

/** The fat pointer: a data-pointer box and a vtable box drawn as one unit, the vtable with its own
 * rows for each method's function pointer. */
function FatPointerDiagram({ t, from = 0.3, showRows = false }: { t: number; from?: number; showRows?: boolean }) {
  const k = fa(t, from, 0.4);
  // The vtable pointer box docks onto the data pointer box by sliding in from the right (position);
  // its method table then unfolds downward from the vtable box's own bottom edge (grow), one row
  // fading in just after the box has grown enough to hold it (staggered reveal, not all at once).
  const dock = easeOut(seg(t, from, from + 0.4));
  const vtx = 260 + (1 - dock) * 160;
  const unfold = showRows ? easeOut(seg(t, from + 0.5, from + 0.8)) : 0;
  const rowsH = unfold * 120;
  return (
    <Svg label="a dyn Trait reference is a fat pointer: a data pointer and a vtable pointer drawn as one unit" h={300}>
      <g opacity={k > 0 ? 1 : 0}>
        <rect x={120} y={30} width={130} height={56} rx={8} fill="none" stroke={C.caramel} strokeWidth={2} opacity={k} />
        <T x={185} y={62} s={13} a="middle" f={C.crema} o={k}>data pointer</T>
        <rect x={vtx} y={30} width={130} height={56} rx={8} fill="none" stroke={C.caramel} strokeWidth={2} opacity={k} />
        <T x={vtx + 65} y={62} s={13} a="middle" f={C.crema} o={k}>vtable pointer</T>
        <T x={252} y={25} s={12} a="middle" f={C.taupe} o={k}>one fat pointer</T>
      </g>
      {showRows && (
        <g>
          <rect x={260} y={100} width={220} height={rowsH} rx={8} fill="none" stroke={C.mocha} strokeWidth={1.5} />
          <T x={280} y={124} s={12} f={C.taupe} o={fa(t, from + 0.55, 0.25)}>encode fn pointer</T>
          <T x={280} y={150} s={12} f={C.taupe} o={fa(t, from + 0.65, 0.25)}>drop fn pointer</T>
          <T x={280} y={176} s={12} f={C.taupe} o={fa(t, from + 0.75, 0.25)}>size, align</T>
          <T x={325} y={238} s={13} a="middle" f={C.caramel} o={fa(t, from + 0.9, 0.3)}>one slot per method</T>
        </g>
      )}
    </Svg>
  );
}

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

/** A dot travelling along a polyline as `k` goes 0 → 1 (a call, a value, a lookup in flight). */
function Pulse({ pts, k, r = 6, f = C.caramel }: { pts: [number, number][]; k: number; r?: number; f?: string }) {
  if (k <= 0 || k >= 1) return null;
  const lens = [0];
  for (let i = 1; i < pts.length; i++) lens.push(lens[i - 1] + Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]));
  const goal = k * lens[lens.length - 1];
  let i = 1;
  while (i < pts.length - 1 && lens[i] < goal) i++;
  const u = (goal - lens[i - 1]) / Math.max(1e-9, lens[i] - lens[i - 1]);
  return <circle cx={lerp(pts[i - 1][0], pts[i][0], u)} cy={lerp(pts[i - 1][1], pts[i][1], u)} r={r} fill={f} />;
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

// ── 1 · Two words, not one ──────────────────────────────────────────────────────────────────────────
export function FatPointer({ t }: StepCtx) {
  // The vtable half of each dyn pointer slides in and docks next to its data-pointer half (position),
  // arriving right as the caption that names it appears.
  const dock = easeOut(seg(t, 0.7, 1.1));
  const vdx = (1 - dock) * 140;
  return (
    <Svg label="a reference or Box to a concrete type is one word; to a dyn Trait it is two words, a data pointer plus a vtable pointer" h={300}>
      <ThinPointer x={60} y={40} label="&A" />
      <ThinPointer x={60} y={110} label="Box<A>" />
      <T x={40} y={190} s={13} f={C.taupe} o={fa(t, 0.2, 0.4)}>one word: just the data</T>
      <g opacity={fa(t, 0.7, 0.3)}>
        <rect x={320} y={40} width={90} height={46} rx={8} fill="none" stroke={C.caramel} strokeWidth={2} />
        <T x={365} y={69} s={12} a="middle" f={C.crema}>&dyn Codec</T>
        <rect x={320} y={110} width={90} height={46} rx={8} fill="none" stroke={C.caramel} strokeWidth={2} />
        <T x={365} y={139} s={12} a="middle" f={C.crema}>Box dyn</T>
      </g>
      <g transform={`translate(${vdx},0)`} opacity={fa(t, 0.7, 0.3)}>
        <rect x={420} y={40} width={90} height={46} rx={8} fill="none" stroke={C.caramel} strokeWidth={2} />
        <T x={465} y={69} s={12} a="middle" f={C.crema}>vtable</T>
        <rect x={420} y={110} width={90} height={46} rx={8} fill="none" stroke={C.caramel} strokeWidth={2} />
        <T x={465} y={139} s={12} a="middle" f={C.crema}>vtable</T>
      </g>
      <T x={320} y={190} s={13} f={C.caramel} o={fa(t, 1.1, 0.3)}>two words: data plus vtable</T>
    </Svg>
  );
}

// ── 2 · What's actually inside the second word? (predict) ──────────────────────────────────────────
export function VtableContents({ t }: StepCtx) {
  return <FatPointerDiagram t={t} from={0.2} showRows />;
}

// ── 3 · Calling through it is late binding (no takeaway: the reel's "from" step) ────────────────────
export function LateBinding({ t }: StepCtx) {
  const k = easeOut(seg(t, 0.3, 0.7));
  const look = seg(t, 1.3, 2.4);
  const atRow = look > 0.35;
  const landed = look >= 1;
  return (
    <Stack>
      <Code title="calling c.encode() through &dyn Codec" lines={['let ptr = vtable.encode;', 'ptr(data_ptr)   // resolved right now, not before']} t={t} start={0.1} end={0.7} highlight={t > 1.3 ? (landed ? [1] : [0]) : []} />
      <Svg label="late binding: at the moment of the call, the vtable pointer is followed to the encode slot, and that slot's function pointer is called" h={180} fill>
        <g opacity={k}>
          <Box x={20} y={30} w={100} label="data" />
          <Box x={120} y={30} w={100} label="vtable" hot={look > 0 && !atRow} />
          <T x={300} y={20} s={13} f={C.taupe}>vtable</T>
          <Box x={300} y={30} w={120} label="encode" hot={atRow && !landed} />
          <Box x={300} y={66} w={120} label="drop" dim />
          <Box x={460} y={30} w={120} label="A::encode" hot={landed} dim={!landed} />
          <Box x={460} y={100} w={120} label="B::encode" dim />
          <T x={520} y={160} s={13} a="middle" f={C.taupe} o={1 - easeOut(seg(t, 1.0, 1.3))}>which one?</T>
        </g>
        <Draw pts={[[220, 48], [300, 48]]} t={t} from={1.3} to={1.7} stroke={C.latte} w={1.5} pen={false} />
        <Draw pts={[[420, 48], [460, 48]]} t={t} from={1.9} to={2.3} stroke={C.caramel} w={2} pen={false} />
        <Pulse pts={[[170, 48], [300, 48], [420, 48], [520, 48]]} k={look} />
        <T x={20} y={150} s={14} f={C.caramel} o={easeOut(seg(t, 2.4, 2.8))}>resolved at the call</T>
        <Reticle x={520} y={48} w={136} h={50} t={t} at={2.4} />
      </Svg>
    </Stack>
  );
}

// ── 4 · The cost isn't the indirect call ────────────────────────────────────────────────────────────
export function LostInlining({ t }: StepCtx) {
  return (
    <Stack>
      <Code title="sum_generic, optimized" lines={['; encode() inlined away entirely', '; no call left in the loop at all']} t={t} start={0.1} end={1.2} highlight={[0, 1]} />
      <div style={{ opacity: fa(t, 1.4, 0.4) }}>
        <Code title="sum_dyn, optimized" lines={['%f = load ptr, vtable_slot', 'invoke %f(data_ptr)   // still a real call']} t={t} start={1.4} end={2.2} highlight={[0, 1]} />
      </div>
    </Stack>
  );
}

// ── 5 · A method that takes Self by value can't go in the vtable (predict) ─────────────────────────
export function DynIncompatible({ t, answer }: StepCtx) {
  const ans = answer !== null;
  const s = useSinceAnswer(ans);
  return (
    <Stack>
      <Code title="examples/dyn_incompatible_fail.rs" lines={['fn loud(self) -> Self;', 'let d: Box<dyn Greet> = Box::new(Dog);']} t={t} start={0.1} end={1.4} highlight={[0, 1]} />
      {ans && (
        <div style={{ opacity: fa(s, 0, 0.3) }}>
          <Code title="rustc" lines={['error[E0038]: Greet is not dyn compatible', 'loud references the Self type']} t={s} start={0.1} end={0.7} highlight={[0, 1]} />
        </div>
      )}
    </Stack>
  );
}

// ── 6 · One bound excludes just that method ─────────────────────────────────────────────────────────
export function SizedEscape({ t }: StepCtx) {
  const tag = easeOutBack(seg(t, 0.8, 1.2));
  const out = easeInOut(seg(t, 1.4, 2.1)); // loud leaves the table
  const call = easeOut(seg(t, 2.3, 2.8));
  const ok = easeOut(seg(t, 2.8, 3.1));
  const tableH = lerp(92, 52, out);
  return (
    <Stack>
      <Code
        title="examples/sized_escape_hatch.rs"
        lines={['fn loud(self) -> Self where Self: Sized;', 'fn hi(&self) -> &\'static str { "hi" }', 'let d: Box<dyn Greet> = Box::new(Dog);   // compiles']}
        t={t}
        start={0.1}
        end={0.7}
        highlight={t > 2.3 ? [2] : [0]}
      />
      <Svg label="where Self: Sized lifts loud out of Greet's vtable; the table keeps hi, and Box<dyn Greet> now compiles and calls hi" h={190} fill>
        <T x={260} y={22} s={13} f={C.taupe}>Greet's vtable</T>
        <rect x={250} y={32} width={170} height={tableH} rx={8} fill="none" stroke={C.mocha} strokeWidth={1.5} />
        <g transform={`translate(${(out * 170).toFixed(1)} ${(out * 60).toFixed(1)})`} opacity={1 - out * 0.6}>
          <Box x={260} y={80} w={150} h={34} label="loud" dim={out > 0.5} />
          {tag > 0 && (
            <g transform={`translate(335 74) scale(${tag.toFixed(3)}) translate(-335 -74)`}>
              <rect x={270} y={62} width={130} height={22} rx={5} fill={C.cinnamon} />
              <T x={335} y={78} s={13} a="middle" f={C.espresso} w={700}>Self: Sized</T>
            </g>
          )}
        </g>
        <Box x={260} y={42} w={150} h={34} label="hi" hot={ok > 0.5} />
        {call > 0 && (
          <g opacity={call}>
            <Box x={20} y={42} w={170} label="Box<dyn Greet>" />
            <line x1={190} y1={60} x2={lerp(190, 258, call)} y2={60} stroke={C.caramel} strokeWidth={2} />
          </g>
        )}
        <T x={20} y={120} s={14} f={C.caramel} o={ok}>compiles: "hi"</T>
      </Svg>
    </Stack>
  );
}

// ── 7 · Widening to the parent trait, directly (predict) ───────────────────────────────────────────
export function Upcasting({ t, answer, portrait }: StepCtx) {
  const ans = answer !== null;
  const s = useSinceAnswer(ans);
  const k = easeOut(seg(t, 0.4, 0.9));
  const detour = easeOut(seg(t, 1.0, 1.6));
  const lift = ans ? easeOut(seg(s, 0.2, 0.7)) : 0;
  const direct = ans ? easeInOut(seg(s, 0.6, 1.3)) : 0;
  const strike = ans ? easeOut(seg(s, 1.3, 1.7)) : 0;
  return (
    <Stack>
      {!portrait && <Code title="examples/upcasting.rs" lines={['let sub_ref: &dyn Sub = &x;', 'let super_ref: &dyn Super = sub_ref;   // direct, no detour']} t={t} start={0.1} end={0.7} highlight={[0, 1]} />}
      <Svg label="&dyn Sub's vtable already holds Super's entries; the reference widens straight to &dyn Super, without the old detour through the concrete type X" h={196} fill>
        <g opacity={k}>
          <Box x={20} y={30} w={130} label="&dyn Sub" />
          <T x={200} y={22} s={13} f={C.taupe}>Sub's vtable</T>
          <rect x={190} y={30} width={150} height={88} rx={8} fill="none" stroke={C.mocha} strokeWidth={1.5} />
          <Box x={200} y={38} w={130} h={32} label="s (Super)" hot={lift > 0.5} />
          <Box x={200} y={78} w={130} h={32} label="sub" />
          <Box x={440} y={30} w={140} label="&dyn Super" hot={direct > 0.95} />
          <line x1={150} y1={48} x2={190} y2={48} stroke={C.latte} strokeWidth={1.5} />
        </g>
        <Draw pts={[[85, 66], [85, 160], [510, 160], [510, 66]]} t={t} from={1.0} to={1.6} stroke={C.taupe} w={1.5} dash="5 4" pen={false} />
        <g opacity={detour}>
          <rect x={250} y={146} width={100} height={28} rx={6} fill={C.espresso} stroke={C.taupe} strokeWidth={1.5} />
          <T x={300} y={165} s={13} a="middle" f={C.taupe}>X</T>
        </g>
        {strike > 0 && <line x1={240} y1={180} x2={lerp(240, 360, strike)} y2={140} stroke={C.cherryText} strokeWidth={2.5} />}
        {ans && <Draw pts={[[330, 54], [440, 48]]} t={s} from={0.6} to={1.3} stroke={C.caramel} w={2.5} />}
        {ans && <T x={385} y={190} s={13} a="middle" f={C.caramel} o={strike}>direct: "2 1"</T>}
      </Svg>
    </Stack>
  );
}

// ── 8 · A closed list, matched by hand ──────────────────────────────────────────────────────────────
export function EnumDispatch({ t, portrait }: StepCtx) {
  const list = easeOut(seg(t, 0.6, 1.0));
  const fork = easeOut(seg(t, 1.0, 1.4));
  const go = easeInOut(seg(t, 1.4, 2.1));
  const gone = easeOut(seg(t, 2.2, 2.6));
  const lock = easeOutBack(seg(t, 2.6, 2.95));
  return (
    <Stack>
      {!portrait && <Code title="examples/enum_dispatch.rs" lines={['enum CodecKind { A(A), B(B) }', 'match self {', '    CodecKind::A(a) => a.encode(),', '    CodecKind::B(b) => b.encode(),', '}']} t={t} start={0.1} end={0.8} highlight={t > 1.4 ? [2] : [0]} />}
      <Svg label="CodecKind lists A and B; an ordinary match branches to A's encode directly; the vtable and second pointer are gone, and the list is closed" h={190} fill>
        <g opacity={list}>
          <rect x={20} y={30} width={160} height={84} rx={8} fill="none" stroke={C.mocha} strokeWidth={1.5} />
          <T x={30} y={22} s={13} f={C.taupe}>CodecKind</T>
          <Box x={30} y={40} w={140} h={30} label="A(A)" hot={go > 0} />
          <Box x={30} y={76} w={140} h={30} label="B(B)" />
        </g>
        {lock > 0 && (
          <g transform={`translate(172 30) scale(${lock.toFixed(3)})`}>
            <path d="M-6 0 v-5 a6 6 0 0 1 12 0 v5" fill="none" stroke={C.caramel} strokeWidth={2} />
            <rect x={-8} y={0} width={16} height={11} rx={2} fill={C.caramel} />
          </g>
        )}
        <Draw pts={[[180, 72], [260, 72]]} t={t} from={1.0} to={1.2} stroke={C.latte} w={1.5} pen={false} />
        <T x={262} y={62} s={13} f={C.latte} o={fork}>match</T>
        <Draw pts={[[260, 72], [330, 40], [420, 40]]} t={t} from={1.1} to={1.4} stroke={go > 0 ? C.caramel : C.latte} w={2} pen={false} />
        <Draw pts={[[260, 72], [330, 104], [420, 104]]} t={t} from={1.15} to={1.45} stroke={C.latte} w={1.5} pen={false} />
        <g opacity={fork}>
          <Box x={420} y={22} w={150} label="a.encode()" hot={go >= 1} />
          <Box x={420} y={86} w={150} label="b.encode()" />
        </g>
        <Pulse pts={[[100, 55], [260, 72], [330, 40], [420, 40]]} k={go} />
        <g opacity={1 - gone * 0.7} transform={`translate(0 ${(gone * 12).toFixed(1)})`}>
          <Box x={200} y={140} w={110} h={30} label="vtable" dim />
          <Box x={330} y={140} w={130} h={30} label="2nd pointer" dim />
        </g>
        {gone > 0 && <line x1={195} y1={lerp(167, 167, gone)} x2={lerp(195, 465, gone)} y2={lerp(167, 143, gone)} stroke={C.cherryText} strokeWidth={2.5} />}
      </Svg>
    </Stack>
  );
}

// ── 9 · Recap ────────────────────────────────────────────────────────────────────────────────────────
export function Recap({ t }: StepCtx) {
  return (
    <RecapList
      t={t}
      end={2.8}
      step={48}
      label="recap: fat pointers, late binding, lost inlining, dyn compatibility, the escape hatch, upcasting, and enum dispatch"
      rows={['dyn Trait: a fat pointer, data plus vtable', 'called through at run time, not before', 'the real cost is lost inlining, not the call', 'by-value Self blocks the vtable slot', 'where Self: Sized excludes just one method', 'a subtrait widens directly to its parent', 'a closed enum needs no vtable at all']}
    />
  );
}
