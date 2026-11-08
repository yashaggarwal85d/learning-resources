import type { StepCtx } from '../../../../../reels/types';
import { easeOut, seg, lerp, clamp, easeInOut } from '../../../../../reels/anim';
import { Code } from '../../../../../reels/Code';
import { Reticle, Decode, Draw, Stack, Svg, T, C } from '../../../../../reels/kit';

// A pinned frame is never evicted, a dirty frame is always written back
// before its frame is reused, and a real CLOCK sweep genuinely favors the
// frame touched more recently. Unlike mmap, which hands control of when a
// dirty page is flushed to the OS, an explicit buffer pool decides that
// for itself.
const fa = (t: number, a: number, d = 0.4) => easeOut(seg(t, a, a + d));

// A list row that lands on its beat: its text slides in from the left while its marker draws
// (a tick for a recap point, a growing dot for one of several names, a cross for a failure).
function Row({ t, at, y, text, mark = 'tick' }: { t: number; at: number; y: number; text: string; mark?: 'tick' | 'dot' | 'cross' }) {
  const k = easeOut(seg(t, at, at + 0.45));
  return (
    <g>
      {mark === 'tick' && <Draw pts={[[23, y], [28, y + 5], [37, y - 6]]} t={t} from={at + 0.1} to={at + 0.4} stroke={C.caramel} w={2} />}
      {mark === 'cross' && <Draw pts={[[25, y - 5], [35, y + 5]]} t={t} from={at + 0.1} to={at + 0.3} stroke={C.cherryText} w={2} />}
      {mark === 'cross' && <Draw pts={[[35, y - 5], [25, y + 5]]} t={t} from={at + 0.25} to={at + 0.45} stroke={C.cherryText} w={2} />}
      {mark === 'dot' && <circle cx={30} cy={y} r={5 * k} fill={C.caramel} />}
      <g opacity={k} transform={`translate(${((1 - k) * -28).toFixed(1)} 0)`}>
        <T x={48} y={y + 6} s={13} f={C.crema}>{text}</T>
      </g>
    </g>
  );
}

// ── 1 · Can a fully pinned pool evict anything (predict, hook) ───────────────────────────────────
export function PinPredict({ t }: StepCtx) {
  return (
    <Stack>
      <Code
        title="every frame pinned, one more page arriving"
        lines={['pool.load_and_pin(new_page);', '// genuinely rejected, or something gets evicted?']}
        t={t}
        start={0.1}
        end={2.6}
        highlight={[1]}
      />
    </Stack>
  );
}

// ── 2 · Measured: rejected outright (swipe test's "from" step) ───────────────────────────────────
export function PinReveal({ t }: StepCtx) {
  // A new page arrives at a pool where every frame is pinned. The eviction hand sweeps across the frames looking
  // for a victim, finds a pin on each one, and the new page is pushed back out: rejected, nothing evicted.
  const frames = [0, 1, 2, 3];
  const fx = (i: number) => 150 + i * 90;
  const hand = clamp((t - 0.9) / 0.9);
  const handX = lerp(fx(0) + 35, fx(3) + 35, easeInOut(hand));
  const arrive = easeOut(seg(t, 0.3, 0.8));
  const back = easeOut(seg(t, 1.9, 2.3));
  return (
    <Svg label="pin_dirty_and_clock_decide_eviction.rs, measured" h={220}>
      <T x={150} y={30} s={13} f={C.taupe}>buffer pool</T>
      {frames.map((i) => (
        <g key={i}>
          <rect x={fx(i)} y={50} width={70} height={50} rx={5} fill="none" stroke={C.latte} strokeWidth={1.5} />
          <rect x={fx(i) + 8} y={58} width={54} height={34} rx={3} fill={C.mocha} />
          <Draw pts={[[fx(i) + 35, 40], [fx(i) + 35, 64]]} t={t} from={0.2 + i * 0.1} to={0.4 + i * 0.1} stroke={C.caramel} w={3} />
          <circle cx={fx(i) + 35} cy={38} r={5 * fa(t, 0.2 + i * 0.1, 0.2)} fill={C.caramel} />
        </g>
      ))}
      <T x={30} y={80} s={13} f={C.taupe} o={fa(t, 0.1, 0.3)}>pinned</T>
      {hand > 0 && hand < 1 && <path d={`M${handX} 108 l-7 12 h14 z`} fill={C.cherryText} />}
      <rect x={lerp(600, 40, arrive) - lerp(0, 160, back)} y={140} width={90} height={30} rx={4} fill={C.cinnamon} />
      <Decode text="rejected" t={t} at={2.0} x={190} y={160} s={14} f={C.cherryText} w={600} />
      <T x={300} y={205} s={13} a="middle" f={C.latte} o={fa(t, 2.3, 0.3)}>nothing evicted: nothing could be</T>
    </Svg>
  );
}

// ── 3 · Is a dirty frame written back before reuse (predict) ─────────────────────────────────────
export function DirtyPredict({ t }: StepCtx) {
  return (
    <Stack>
      <Code
        title="a dirty frame, about to be evicted"
        lines={['if frame.dirty { write_back(frame); }', '// written back first, or simply discarded?']}
        t={t}
        start={0.1}
        end={2.6}
        highlight={[1]}
      />
    </Stack>
  );
}

// ── 4 · Measured: written back before reuse (takeaway) ───────────────────────────────────────────
export function DirtyReveal({ t }: StepCtx) {
  // The dirty frame's data travels down to disk first (the write-back); only once it has landed does the new
  // page slide into that same frame.
  const write = easeOut(seg(t, 0.4, 1.0));
  const reuse = easeOut(seg(t, 1.3, 1.8));
  return (
    <Svg label="pin_dirty_and_clock_decide_eviction.rs, measured" h={230}>
      <T x={240} y={32} s={13} a="middle" f={C.taupe}>frame</T>
      <rect x={190} y={42} width={100} height={46} rx={5} fill="none" stroke={C.latte} strokeWidth={1.5} />
      <rect x={198} y={lerp(50, 172, write)} width={84} height={30} rx={3} fill={C.cherryText} />
      <rect x={130} y={164} width={220} height={46} rx={5} fill="none" stroke={C.mocha} strokeWidth={1.5} />
      <T x={360} y={194} s={13} f={C.taupe}>disk</T>
      <rect x={lerp(600, 198, reuse)} y={50} width={84} height={30} rx={3} fill={C.cinnamon} />
      <Decode text="written back first" t={t} at={0.95} x={240} y={128} s={13} a="middle" f={C.cherryText} />
      <Decode text="then reused" t={t} at={1.75} x={330} y={70} s={13} f={C.cinnamon} />
      <Reticle x={240} y={65} w={116} h={58} t={t} at={2.1} />
    </Svg>
  );
}

// ── 5 · Which frame does CLOCK evict (predict) ────────────────────────────────────────────────────
export function ClockPredict({ t }: StepCtx) {
  return (
    <Stack>
      <Code
        title="one frame touched again, one left alone"
        lines={['pool.pin(touched); pool.unpin(touched, false);', '// does CLOCK evict the touched one, or the other?']}
        t={t}
        start={0.1}
        end={2.6}
        highlight={[1]}
      />
    </Stack>
  );
}

// ── 6 · Measured: the untouched frame is evicted (takeaway) ──────────────────────────────────────
export function ClockReveal({ t }: StepCtx) {
  const sweep = easeOut(seg(t, 0.5, 0.9));
  const dx = sweep * 220;
  return (
    <Svg label="pin_dirty_and_clock_decide_eviction.rs, measured" h={200}>
      <T x={60} y={60} s={14} f={C.crema} o={fa(t, 0.3, 0.4)}>one frame touched again, one left alone</T>
      <Draw pts={[[60, 76], [280, 76]]} t={t} from={0.5} to={0.9} stroke={C.taupe} w={1.5} />
      <circle cx={60 + dx} cy={76} r={4} fill={C.cherry} />
      <rect x={60} y={85} width={260} height={44} rx={6} fill="none" stroke={C.caramel} strokeWidth={2} />
      {fa(t, 1.1, 0.4) > 0.85 && <T x={190} y={112} s={13} a="middle" f={C.mocha}>evicted: the untouched, not the touched</T>}
      <T x={60} y={160} s={13} f={C.latte} o={fa(t, 1.5, 0.4)}>being touched again bought a second chance</T>
    </Svg>
  );
}

// ── 7 · What is pinning_backends actually for (predict) ───────────────────────────────────────────
export function PgBufferPredict({ t }: StepCtx) {
  return (
    <Stack>
      <Code
        title="pg_buffercache's own real fields"
        lines={['isdirty, usagecount, pinning_backends', '// what does pinning_backends actually protect?']}
        t={t}
        start={0.1}
        end={2.6}
        highlight={[1]}
      />
    </Stack>
  );
}

// ── 8 · PostgreSQL's own words on pinning (connecting step, NO takeaway) ─────────────────────────
export function PgBufferReveal({ t }: StepCtx) {
  // Each buffer's pinning_backends drawn as a stack of pins over it. The eviction sweep passes every buffer whose
  // stack isn't empty and stops on the one nobody pins — the quoted rule, then underlined.
  const pins = [2, 1, 3, 0, 1];
  const bx = (i: number) => 90 + i * 90;
  const stops = 3;
  const sweep = easeInOut(seg(t, 0.9, 1.8));
  const handX = lerp(bx(0) + 30, bx(stops) + 30, sweep);
  return (
    <Svg label="PostgreSQL docs, quoted" h={220}>
      <T x={30} y={30} s={13} f={C.taupe}>pinning_backends</T>
      {pins.map((p, i) => (
        <g key={i}>
          {Array.from({ length: p }, (_, j) => (
            <circle key={j} cx={bx(i) + 30} cy={lerp(30, 88 - j * 14, fa(t, 0.2 + i * 0.08 + j * 0.05, 0.3))} r={5} fill={C.crema} opacity={fa(t, 0.2 + i * 0.08 + j * 0.05, 0.3)} />
          ))}
          <rect x={bx(i)} y={100} width={60} height={34} rx={4} fill="none" stroke={i === stops ? C.caramel : C.latte} strokeWidth={1.5} />
        </g>
      ))}
      {sweep > 0 && <path d={`M${handX} 140 l-7 12 h14 z`} fill={C.cherryText} />}
      <Reticle x={bx(stops) + 30} y={117} w={76} h={48} t={t} at={1.85} />
      <T x={30} y={186} s={13} f={C.crema} o={fa(t, 1.9, 0.3)}>evicts only an</T>
      <T x={180} y={186} s={13} f={C.caramel} w={600} o={fa(t, 1.9, 0.3)}>unpinned buffer</T>
      <Draw pts={[[180, 194], [300, 194]]} t={t} from={2.2} to={2.6} stroke={C.caramel} w={2} />
    </Svg>
  );
}

// ── 9 · mmap hands this decision to the OS instead (surprising fact, takeaway) ───────────────────
export function MmapContrastReveal({ t }: StepCtx) {
  const cyclePos = t > 0.9 ? ((t - 0.9) % 0.8) / 0.8 : 0;
  const drift = cyclePos < 0.5 ? cyclePos * 2 : (1 - cyclePos) * 2;
  return (
    <Svg label="CIDR 2022 paper, quoted" h={200}>
      <T x={60} y={60} s={14} f={C.crema} o={fa(t, 0.3, 0.4)}>a buffer pool's own dirty bit, explicit</T>
      <rect x={60} y={85} width={260} height={44} rx={6} fill="none" stroke={C.caramel} strokeWidth={2} />
      {fa(t, 1.3, 0.4) > 0.85 && <T x={190} y={112} s={13} a="middle" f={C.mocha}>mmap: the OS flushes dirty pages anytime</T>}
      <circle cx={70 + drift * 240} cy={76} r={3} fill={C.taupe} opacity={fa(t, 0.9, 0.3)} />
      <T x={60} y={160} s={13} f={C.latte} o={fa(t, 1.5, 0.4)}>with mmap, the DBMS gets no say in when</T>
    </Svg>
  );
}

// ── 10 · Recap ─────────────────────────────────────────────────────────────────────────────────────
export function Recap({ t }: StepCtx) {
  const rows = [
    'a pinned frame is never a candidate',
    'a dirty frame is written back before reuse',
    "CLOCK's reference bit buys a second chance",
    'a buffer pool decides when; mmap lets the OS',
  ];
  return (
    <Svg label="recap: who decides, and when" h={240}>
      {rows.map((r, i) => (
        <Row key={r} t={t} at={0.2 + i * 0.45} y={40 + i * 50} text={r} />
      ))}
      <Reticle x={290} y={190} w={556} h={36} t={t} at={2.25} />
    </Svg>
  );
}
