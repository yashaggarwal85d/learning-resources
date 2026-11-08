import type { StepCtx } from '../../../../../reels/types';
import { easeInOut, easeOut, easeOutBack, lerp, seg } from '../../../../../reels/anim';
import { Code } from '../../../../../reels/Code';
import { C, Draw, Reticle, Stack, Svg, T } from '../../../../../reels/kit';

// The publication pattern (Release store, Acquire load) and the SeqCst-only store-buffering
// litmus test are both executed for real by examples.py — loom model-checked where loom can be
// trusted (release_acquire_fix, half_fixed_still_races, store_buffering_acqrel) and compiled-only
// where loom's own tests document a known gap for this exact shape (store_buffering_seqcst).
const fa = (t: number, a: number, d = 0.4) => easeOut(seg(t, a, a + d));

const threadDot = (cx: number, cy: number, label: string, opacity = 1) => (
  <g opacity={opacity}>
    <circle cx={cx} cy={cy} r={14} fill="none" stroke={C.taupe} strokeWidth={1.5} />
    <T x={cx} y={cy + 4} s={10} a="middle" f={C.crema}>{label}</T>
  </g>
);

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

/** Writer and reader lanes for a flag handoff: the data store, the flag store, the flag load and the data load.
 * `sync` draws the release→acquire edge (or a broken one when `broken`), `carry` rides the data along it, `seen` is the
 * value the reader's data load returns. */
function Handoff({ t, from, broken, readOrder }: { t: number; from: number; broken: boolean; readOrder: string }) {
  const sync = easeInOut(seg(t, from, from + 0.6));
  const carry = easeInOut(seg(t, from + 0.1, from + 0.8));
  const fall = broken ? easeOut(seg(t, from + 0.6, from + 1.0)) : 0;
  const land = !broken && carry >= 1;
  const ks = broken ? Math.min(sync, 0.55) : sync;
  const kc = broken ? Math.min(carry, 0.55) : carry;
  return (
    <g>
      <T x={20} y={30} s={13} f={C.latte}>writer</T>
      <Box x={90} y={14} w={130} h={26} label="data = 42" />
      <Box x={90} y={44} w={130} h={26} label="Release" hot />
      <T x={20} y={140} s={13} f={C.latte}>reader</T>
      <Box x={350} y={112} w={130} h={26} label={readOrder} hot={!broken} dim={broken} />
      <Box x={350} y={142} w={130} h={26} label={broken && t >= from + 0.9 ? 'data: 0' : land ? 'data: 42' : 'data: ?'} f={broken && t >= from + 0.9 ? C.cherryText : land ? C.caramel : undefined} />
      {sync > 0 && <line x1={220} y1={57} x2={lerp(220, 350, ks)} y2={lerp(57, 125, ks)} stroke={broken ? C.cherryText : C.caramel} strokeWidth={2.5} strokeDasharray={broken ? '6 4' : undefined} />}
      {carry > 0 && (broken ? fall < 1 : carry < 1) && <circle cx={lerp(220, 350, kc)} cy={lerp(27, 155, kc) + fall * 50} r={6} fill={C.crema} opacity={1 - fall} />}
    </g>
  );
}

/** A labelled box. */
function Box({ x, y, w, h = 36, label, hot = false, dim = false, f }: { x: number; y: number; w: number; h?: number; label: string; hot?: boolean; dim?: boolean; f?: string }) {
  return (
    <g>
      <rect x={x} y={y} width={w} height={h} rx={6} fill={hot ? C.cocoa : 'none'} stroke={hot ? C.caramel : C.mocha} strokeWidth={hot ? 2 : 1.5} strokeDasharray={dim ? '4 3' : undefined} />
      <T x={x + w / 2} y={y + h / 2 + 5} s={13} a="middle" f={f ?? (hot ? C.caramel : dim ? C.taupe : C.crema)}>{label}</T>
    </g>
  );
}

/** loom's sweep over every interleaving: a scan line crosses a strip of paths, each ticked (or one crossed) as it passes. */
function Sweep({ t, from, to, y, bad = -1 }: { t: number; from: number; to: number; y: number; bad?: number }) {
  const k = seg(t, from, to);
  const n = 14;
  return (
    <g>
      <T x={20} y={y + 5} s={13} f={C.taupe}>loom</T>
      {Array.from({ length: n }, (_, i) => {
        const x = 90 + i * 34;
        const on = k * n > i + 0.5;
        const isBad = i === bad;
        return <rect key={i} x={x} y={y - 7} width={26} height={14} rx={3} fill={on ? (isBad ? C.cherryText : C.crema) : C.cocoa} opacity={on ? 1 : 0.6} />;
      })}
      {k > 0 && k < 1 && <rect x={88 + k * n * 34} y={y - 12} width={3} height={24} fill={C.focus} />}
    </g>
  );
}

// ── 1 · Last topic's race, fixed with two words (hook) ──────────────────────────────────────────
export function RaceRecapHook({ t }: StepCtx) {
  // The crack in the pairing draws itself open, then the fix lands on top of it.
  const crack = easeOut(seg(t, 1.0, 1.3));
  const fixLand = easeOut(seg(t, 1.6, 1.9));
  return (
    <Svg label="the relaxed publication race from last topic, and the two words that fix it" h={220}>
      <T x={60} y={60} s={14} f={C.mocha} o={fa(t, 0.3, 0.4)}>data.store(42, Relaxed);</T>
      <T x={60} y={90} s={14} f={C.mocha} o={fa(t, 0.6, 0.4)}>ready.store(true, Relaxed);</T>
      <line x1={60} y1={115} x2={60 + crack * 460} y2={115} stroke={C.cherryText} strokeWidth={2} strokeDasharray="5 4" />
      <T x={60} y={130} s={13} f={C.taupe} o={fa(t, 1.0, 0.4)}>loom found: the flag seen before the value</T>
      <T x={60} y={180} s={16} f={C.caramel} o={fixLand}>Release. Acquire.</T>
    </Svg>
  );
}

// ── 2 · Release-store, acquire-load it back (predict) ───────────────────────────────────────────
export function ReleaseAcquirePredict({ t }: StepCtx) {
  return (
    <Stack>
      <Code
        title="the same pair, now paired properly"
        lines={['data.store(42, Ordering::Relaxed);', 'ready.store(true, Ordering::Release);', '// --- another thread ---', 'if ready.load(Ordering::Acquire) {', '    data.load(Ordering::Relaxed)', '}']}
        t={t}
        start={0.1}
        end={2.4}
        highlight={[1, 3]}
      />
      <Svg label="does this fix the race loom found last topic?" h={46}>
        <T x={40} y={28} s={13} f={C.mocha} o={fa(t, 2.6, 0.4)}>only the flag's ordering changed; data stays Relaxed</T>
      </Svg>
    </Stack>
  );
}

// ── 3 · Fixed: loom finds no violation (no takeaway: the reel's "from" step) ────────────────────
export function FixedReveal({ t }: StepCtx) {
  return (
    <Stack>
      <Code title="ordering-check/release_acquire_fix.rs — loom explored every interleaving" lines={['ready.store(true, Ordering::Release);', '// --- another thread ---', 'if ready.load(Ordering::Acquire) {', '    assert_eq!(data.load(Ordering::Relaxed), 42);', '}', '// loom: no violation found']} t={t} start={0.1} end={0.5} highlight={t > 2.4 ? [5] : [0, 2]} />
      <Svg label="the Release store and the Acquire load form a handoff edge that carries data = 42 across to the reader; loom sweeps every interleaving and finds no violation" h={210} fill>
        <Handoff t={t} from={0.6} broken={false} readOrder="Acquire" />
        <Sweep t={t} from={1.5} to={2.5} y={196} />
        <T x={575} y={30} s={13} a="end" f={C.caramel} o={easeOut(seg(t, 2.4, 2.7))}>no violation</T>
      </Svg>
    </Stack>
  );
}

// ── 4 · Why it works: release orders before, acquire orders after (takeaway) ───────────────────
export function WhyPairingWorks({ t }: StepCtx) {
  return (
    <Svg label="release orders everything before it; acquire orders everything after it" h={300}>
      <Draw pts={[[80, 60], [520, 60]]} t={t} from={0.1} to={0.5} stroke={C.taupe} w={1.5} pen={false} />
      <T x={60} y={46} s={11} f={C.taupe}>thread A</T>
      <T x={100} y={80} s={12} f={C.mocha} o={fa(t, 0.5, 0.4)}>store data</T>
      <T x={280} y={80} s={12} f={C.caramel} o={fa(t, 0.9, 0.4)}>Release: store ready</T>
      <Draw pts={[[80, 200], [520, 200]]} t={t} from={0.1} to={0.5} stroke={C.taupe} w={1.5} pen={false} />
      <T x={60} y={186} s={11} f={C.taupe}>thread B</T>
      <T x={100} y={230} s={12} f={C.caramel} o={fa(t, 1.4, 0.4)}>Acquire: load ready</T>
      <T x={340} y={230} s={12} f={C.mocha} o={fa(t, 1.8, 0.4)}>load data</T>
      <Draw pts={[[320, 70], [320, 190]]} t={t} from={1.4} to={1.8} stroke={C.caramel} w={2} pen={false} />
      <T x={60} y={280} s={13} f={C.crema} o={fa(t, 2.3, 0.4)}>a happens-before edge, both sides opted in</T>
    </Svg>
  );
}

// ── 5 · Fixing only the write side doesn't work either (takeaway) ──────────────────────────────
export function HalfFixedReveal({ t, portrait }: StepCtx) {
  return (
    <Stack>
      {!portrait && <Code title="ordering-check/half_fixed_still_races.rs — the load stayed Relaxed" dim={t < 0.1} lines={['ready.store(true, Ordering::Release);', '// --- another thread ---', 'if ready.load(Ordering::Relaxed) {', '    assert_eq!(data.load(Ordering::Relaxed), 42);', '}', '// assertion failed: left: 0, right: 42']} t={t} start={0.1} end={0.5} highlight={t > 2.4 ? [5] : [2]} />}
      <Svg label="with only the store made Release, the Relaxed load does not catch the handoff: the edge breaks off, data falls away, and the reader sees 0, not 42; loom finds that interleaving" h={210} fill>
        <Handoff t={t} from={0.6} broken readOrder="Relaxed" />
        <Sweep t={t} from={1.6} to={2.6} y={196} bad={8} />
        <T x={575} y={30} s={13} a="end" f={C.cherryText} o={easeOut(seg(t, 2.4, 2.7))}>found: 0, not 42</T>
      </Svg>
    </Stack>
  );
}

// ── 6 · Two threads, two flags, no shared leader (predict) ─────────────────────────────────────
export function StoreBufferingPredict({ t }: StepCtx) {
  return (
    <Svg label="each thread stores its own flag, then loads the other's" h={260}>
      <rect x={60} y={40} width={160} height={50} rx={8} fill="none" stroke={C.caramel} strokeWidth={2} />
      <T x={140} y={70} s={12} a="middle" f={C.crema}>thread 1: store x, load y</T>
      <rect x={380} y={40} width={160} height={50} rx={8} fill="none" stroke={C.caramel} strokeWidth={2} />
      <T x={460} y={70} s={12} a="middle" f={C.crema}>thread 2: store y, load x</T>
      {threadDot(140, 150, 'x,y', fa(t, 0.5, 0.4))}
      {threadDot(460, 150, 'y,x', fa(t, 0.9, 0.4))}
      <T x={60} y={220} s={13} f={C.latte} o={fa(t, 1.4, 0.4)}>every access is Release/Acquire — still safe?</T>
    </Svg>
  );
}

// ── 7 · loom finds it: both loads see 0 (takeaway) ──────────────────────────────────────────────
export function StoreBufferingAcqRelReveal({ t, portrait }: StepCtx) {
  const st = easeInOut(seg(t, 0.6, 1.0)); // each store parks in its own thread's buffer
  const ld = easeInOut(seg(t, 1.2, 1.8)); // each load reads the other flag from memory: still 0
  const drain = easeInOut(seg(t, 2.2, 2.7)); // only afterwards do the stores reach memory
  const zero = easeOutBack(seg(t, 1.8, 2.1));
  return (
    <Stack>
      {!portrait && <Code title="ordering-check/store_buffering_acqrel.rs — a real found interleaving" dim={t < 0.1} lines={['x.store(1, Ordering::Release);', 'let r1 = y.load(Ordering::Acquire);', 'y.store(1, Ordering::Release);', 'let r2 = x.load(Ordering::Acquire);', 'assertion failed: r1 != 0 or r2 != 0', '  left: 0', ' right: 0']} t={t} start={0.1} end={0.5} highlight={t > 1.8 ? [4] : [1, 3]} />}
      <Svg label="each thread's store waits in its own buffer while its load reads the other flag from memory as 0; both loads see 0 at once, and only then do the stores land" h={190} fill>
        <T x={20} y={34} s={13} f={C.latte}>T1</T>
        <T x={20} y={164} s={13} f={C.latte}>T2</T>
        <Box x={60} y={16} w={120} h={28} label="buffer" dim />
        <Box x={60} y={146} w={120} h={28} label="buffer" dim />
        <Box x={330} y={60} w={110} h={30} label={drain >= 1 ? 'x = 1' : 'x = 0'} />
        <Box x={330} y={100} w={110} h={30} label={drain >= 1 ? 'y = 1' : 'y = 0'} />
        <T x={385} y={52} s={13} a="middle" f={C.taupe}>memory</T>
        {st > 0 && <circle cx={lerp(20, 160, st) + drain * 170} cy={lerp(30, 30, st) + drain * 45} r={7} fill={C.crema} opacity={drain >= 1 ? 0 : 1} />}
        {st > 0 && <circle cx={lerp(20, 160, st) + drain * 170} cy={160 - drain * 45} r={7} fill={C.cinnamon} opacity={drain >= 1 ? 0 : 1} />}
        {ld > 0 && ld < 1 && <circle cx={lerp(330, 190, ld)} cy={lerp(115, 30, ld)} r={5} fill={C.cherryText} />}
        {ld > 0 && ld < 1 && <circle cx={lerp(330, 190, ld)} cy={lerp(75, 160, ld)} r={5} fill={C.cherryText} />}
        {zero > 0 && (
          <g>
            <T x={200} y={36} s={14} f={C.cherryText} w={700}>r1 = 0</T>
            <T x={200} y={166} s={14} f={C.cherryText} w={700}>r2 = 0</T>
          </g>
        )}
        <T x={575} y={115} s={13} a="end" f={C.cherryText} o={zero}>both saw 0</T>
      </Svg>
    </Stack>
  );
}

// ── 8 · SeqCst adds the one missing thing (takeaway) ────────────────────────────────────────────
export function SeqCstReveal({ t }: StepCtx) {
  // Two separate pair-lines draw first (Release/Acquire, one pair at a time); then one line
  // sweeps across both, tying every thread to the same single order.
  return (
    <Svg label="SeqCst: one single order, every thread agrees" h={240}>
      <Draw pts={[[60, 50], [240, 50]]} t={t} from={0.1} to={0.35} stroke={C.taupe} w={2} pen={false} />
      <Draw pts={[[320, 50], [500, 50]]} t={t} from={0.35} to={0.6} stroke={C.taupe} w={2} pen={false} />
      <T x={60} y={75} s={14} f={C.crema} o={fa(t, 0.1, 0.3)}>Release/Acquire orders one pair at a time</T>
      <Draw pts={[[60, 120], [500, 120]]} t={t} from={0.9} to={1.3} stroke={C.caramel} w={2} pen />
      <T x={60} y={145} s={14} f={C.mocha} o={fa(t, 0.9, 0.3)}>SeqCst: every thread agrees on one global order</T>
      <T x={60} y={190} s={13} f={C.taupe} o={fa(t, 1.5, 0.4)}>that total order rules out both loads seeing nothing</T>
    </Svg>
  );
}

// ── 9 · A fence carries the same handoff (takeaway) ─────────────────────────────────────────────
export function FenceSpinlockReveal({ t, portrait }: StepCtx) {
  const spin = seg(t, 0.5, 1.4);
  const win = t >= 1.4;
  const fence = easeOutBack(seg(t, 1.5, 1.85));
  const crit = easeInOut(seg(t, 1.9, 2.3));
  const rel = easeOut(seg(t, 2.4, 2.8));
  const ang = spin * Math.PI * 6;
  const tx = win ? lerp(140, 400, crit) : 90 + Math.cos(ang) * 32;
  const ty = win ? lerp(80, 80, crit) : 80 + Math.sin(ang) * 32;
  return (
    <Stack>
      {!portrait && <Code title="fence_spinlock.rs — Relaxed CAS, a standalone Acquire fence" lines={['while flag.compare_exchange_weak(false, true,', '    Ordering::Relaxed, Ordering::Relaxed).is_err() {}', 'fence(Ordering::Acquire);', '// ... critical section ...', 'flag.store(false, Ordering::Release);']} t={t} start={0.1} end={0.5} highlight={t > 2.4 ? [4] : t > 1.5 ? [2] : [0, 1]} />}
      <Svg label="the thread spins on a Relaxed compare-and-swap; once it wins, a standalone Acquire fence drops in behind it, it runs the critical section, and a Release store hands the lock back" h={170} fill>
        <circle cx={90} cy={80} r={32} fill="none" stroke={C.mocha} strokeWidth={1.5} strokeDasharray="4 4" />
        <T x={90} y={140} s={13} a="middle" f={C.latte}>Relaxed CAS</T>
        <g opacity={fence > 0 ? 1 : 0} transform={`translate(0 ${((1 - Math.min(1, fence)) * -50).toFixed(1)})`}>
          <line x1={170} y1={40} x2={170} y2={120} stroke={C.caramel} strokeWidth={4} />
          <T x={170} y={34} s={13} a="middle" f={C.caramel}>Acquire fence</T>
        </g>
        <rect x={240} y={56} width={200} height={48} rx={8} fill={crit > 0 ? C.cocoa : 'none'} stroke={C.mocha} strokeWidth={1.5} />
        <T x={340} y={124} s={13} a="middle" f={C.latte}>critical section</T>
        <g opacity={rel}>
          <line x1={470} y1={40} x2={470} y2={120} stroke={C.cinnamon} strokeWidth={4} />
          <T x={470} y={140} s={13} a="middle" f={C.cinnamon}>Release store</T>
        </g>
        <circle cx={tx + (rel > 0 ? rel * 90 : 0)} cy={ty} r={8} fill={win ? C.caramel : C.crema} />
      </Svg>
    </Stack>
  );
}

// ── 10 · Relaxed is still right for independent counters (takeaway) ────────────────────────────
export function RelaxedCountersReveal({ t }: StepCtx) {
  const xs = [70, 160, 250, 340, 430, 520];
  const rate = [1.0, 0.8, 1.15, 0.9, 1.05, 0.85];
  return (
    <Svg label="independent counters, each fed only by its own threads with Relaxed increments; nothing passes between them, so there is nothing for a stronger ordering to protect" h={250}>
      {xs.map((x, i) => {
        const k = easeOut(seg(t, 0.4 + i * 0.05, 0.4 + i * 0.05 + 2.0 * rate[i]));
        const hopK = ((t * 2.6 + i * 0.31) % 1);
        return (
          <g key={x} opacity={fa(t, 0.2 + i * 0.1, 0.4)}>
            <rect x={x - 18} y={50} width={36} height={130} rx={4} fill={C.cocoa} />
            <rect x={x - 18} y={180 - 130 * k} width={36} height={130 * k} rx={4} fill={C.crema} />
            {k > 0 && k < 1 && <circle cx={x} cy={lerp(28, 180 - 130 * k, hopK)} r={4} fill={C.caramel} />}
            <T x={x} y={204} s={12} a="middle" f={C.latte}>{`c${i + 1}`}</T>
          </g>
        );
      })}
      <T x={60} y={238} s={13} f={C.latte} o={fa(t, 1.1, 0.4)}>each counter only depends on operations on itself</T>
    </Svg>
  );
}

// ── 11 · Recap ────────────────────────────────────────────────────────────────────────────────────
export function Recap({ t }: StepCtx) {
  const rows = [
    'release + acquire, both sides, closes the race',
    'Release/Acquire orders a pair, not every thread',
    'SeqCst: one total order, needed for store-load patterns',
    'fences carry the same handoff off the atomic op',
    'Relaxed is still correct with no publication involved',
  ];
  return <RecapList t={t} end={3} label="recap: publication, SeqCst, fences, and when Relaxed is still right" rows={rows} step={55}
      s={13}
    />;
}
