import type { StepCtx } from '../../../../../reels/types';
import { easeInOut, easeOut, easeOutBack, lerp, seg } from '../../../../../reels/anim';
import { Code } from '../../../../../reels/Code';
import { C, decodeText, Draw, Reticle, Stack, Svg, T } from '../../../../../reels/kit';

// Atomicity (no torn updates) and ordering (visibility between threads) are separate concerns.
// The exact count and the loom-found ordering violation are both executed for real by
// examples.py (rustc 1.97.0, edition 2024, x86_64 Linux; the loom example is built via cargo).
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

// ── 1 · Two separate questions about the same shared memory (hook) ─────────────────────────────
export function TwoQuestionsHook({ t }: StepCtx) {
  // One line, then one, traces out of the shared location toward each separate question in turn.
  return (
    <Svg label="one shared location, two separate questions about it" h={240}>
      <rect x={220} y={30} width={160} height={50} rx={8} fill="none" stroke={C.caramel} strokeWidth={2} />
      <T x={300} y={60} s={13} a="middle" f={C.crema}>shared memory</T>
      <Draw pts={[[260, 80], [90, 132]]} t={t} from={0.3} to={0.5} stroke={C.latte} w={1.5} pen={false} />
      <T x={60} y={140} s={14} f={C.latte} o={fa(t, 0.5, 0.3)}>did this update tear?</T>
      <Draw pts={[[340, 80], [90, 182]]} t={t} from={0.8} to={1.0} stroke={C.mocha} w={1.5} pen={false} />
      <T x={60} y={190} s={14} f={C.mocha} o={fa(t, 1.0, 0.3)}>what order do others see it in?</T>
    </Svg>
  );
}

// ── 2 · Eight threads, one counter (predict) ────────────────────────────────────────────────────
export function EightThreadsPredict({ t }: StepCtx) {
  const positions: [number, number][] = [[60, 180], [150, 200], [240, 180], [330, 200], [420, 180], [510, 200]];
  return (
    <Svg label="eight threads, one AtomicU64, fifty thousand relaxed increments each" h={260}>
      <rect x={250} y={40} width={100} height={50} rx={8} fill="none" stroke={C.caramel} strokeWidth={2} />
      <T x={300} y={70} s={13} a="middle" f={C.crema}>counter</T>
      {positions.map(([x, y], i) => (
        <g key={i} opacity={fa(t, 0.3 + i * 0.12, 0.4)}>
          <Draw pts={[[x, y], [300, 96]]} t={t} from={0.3 + i * 0.12} to={0.5 + i * 0.12} stroke={C.mocha} w={1.5} pen={false} />
          {threadDot(x, y, `t${i + 1}`)}
        </g>
      ))}
      <T x={60} y={240} s={13} f={C.latte} o={fa(t, 1.4, 0.4)}>does the final count come out exact?</T>
    </Svg>
  );
}

// ── 3 · Exact (no takeaway: the reel's "from" step) ─────────────────────────────────────────────
export function ExactCountReveal({ t }: StepCtx) {
  const fill = (i: number) => easeInOut(seg(t, 0.5 + i * 0.05, 1.9 + i * 0.05));
  const total = Array.from({ length: 8 }, (_, i) => fill(i)).reduce((a, b) => a + b, 0) / 8;
  const n = Math.round(400000 * total);
  return (
    <Stack>
      <Code title="examples/atomic_no_torn_updates.rs" lines={['counter.fetch_add(1, Ordering::Relaxed);', '// eight threads, fifty thousand times each', 'println!("{}", counter.load(Ordering::Relaxed));', '// measured: exact, every run']} t={t} start={0.1} end={0.5} highlight={t > 2.2 ? [3] : [0]} />
      <Svg label="eight threads each pour fifty thousand relaxed increments into one atomic counter; it lands on exactly 400,000" h={180} fill>
        {Array.from({ length: 8 }, (_, i) => (
          <g key={i}>
            <rect x={30} y={14 + i * 19} width={260} height={11} rx={3} fill={C.cocoa} />
            <rect x={30} y={14 + i * 19} width={Math.max(2, 260 * fill(i))} height={11} rx={3} fill={C.crema} />
            {fill(i) > 0 && fill(i) < 1 && <circle cx={lerp(300, 380, (t * 3 + i * 0.37) % 1)} cy={lerp(20 + i * 19, 86, (t * 3 + i * 0.37) % 1)} r={3} fill={C.caramel} />}
          </g>
        ))}
        <rect x={390} y={56} width={190} height={62} rx={10} fill={C.cocoa} stroke={total >= 1 ? C.caramel : C.mocha} strokeWidth={2} />
        <T x={485} y={96} s={20} a="middle" f={total >= 1 ? C.caramel : C.crema} w={700}>{n.toLocaleString('en-US')}</T>
        <T x={485} y={142} s={13} a="middle" f={C.latte} o={easeOut(seg(t, 2.0, 2.3))}>exact, every run</T>
        <Reticle x={485} y={87} w={206} h={78} t={t} at={2.1} />
      </Svg>
    </Stack>
  );
}

// ── 4 · Atomicity bought that, but nothing about order (takeaway) ──────────────────────────────
export function AtomicityOnlyReveal({ t }: StepCtx) {
  // A check mark lands below the proven claim; a bare question mark lands below the untouched one.
  const check = easeOut(seg(t, 0.6, 0.8));
  const mark = easeOut(seg(t, 1.3, 1.5));
  return (
    <Svg label="every access was atomic — nothing here claimed anything about visibility" h={240}>
      <T x={60} y={60} s={14} f={C.crema} o={fa(t, 0.3, 0.3)}>no torn value, ever — that's atomicity</T>
      <g transform={`translate(0,${(1 - check) * -14})`}>
        <T x={60} y={84} s={15} f={C.caramel} o={check}>✓ proven</T>
      </g>
      <T x={60} y={130} s={14} f={C.mocha} o={fa(t, 1.0, 0.3)}>when another thread sees it — that's ordering</T>
      <g transform={`translate(0,${(1 - mark) * -14})`}>
        <T x={60} y={154} s={15} f={C.mocha} o={mark}>? open</T>
      </g>
      <T x={60} y={200} s={13} f={C.taupe} o={fa(t, 1.8, 0.4)}>this step only proved the first one</T>
    </Svg>
  );
}

// ── 5 · One thread publishes a value, then a flag (predict) ────────────────────────────────────
export function PublicationPredict({ t }: StepCtx) {
  return (
    <Stack>
      <Code
        title="the relaxed publication shape"
        lines={['data.store(42, Ordering::Relaxed);', 'ready.store(true, Ordering::Relaxed);', '// --- another thread ---', 'if ready.load(Ordering::Relaxed) {', '    data.load(Ordering::Relaxed)', '}']}
        t={t}
        start={0.1}
        end={2.4}
        highlight={[0, 1, 3, 4]}
      />
      <Svg label="can the reader see the flag before the value?" h={46}>
        <T x={40} y={28} s={13} f={C.mocha} o={fa(t, 2.6, 0.4)}>both stores are Relaxed — no ordering requested</T>
      </Svg>
    </Stack>
  );
}

// ── 6 · loom found it (takeaway) ────────────────────────────────────────────────────────────────
export function LoomViolationReveal({ t, portrait }: StepCtx) {
  const ready = easeInOut(seg(t, 0.6, 1.1)); // the flag's store reaches the reader first
  const data = easeInOut(seg(t, 0.6, 2.3)); // the value's store arrives late
  const look = t >= 1.3;
  const bad = easeOutBack(seg(t, 1.6, 1.9));
  return (
    <Stack>
      {!portrait && <Code title="loom-check: model-checked, not a one-off hardware fluke" dim={t < 0.1} lines={['assertion `left == right` failed', '  left: 0', ' right: 42', '// the reader saw ready == true,', '// but data had not arrived yet']} t={t} start={0.1} end={0.6} highlight={t > 1.6 ? [1, 2] : []} />}
      <Svg label="the writer stores data = 42 then ready = true; loom finds an ordering where ready reaches the reader first, so the reader reads data as 0, not 42" h={176} fill>
        <T x={20} y={30} s={13} f={C.latte}>writer</T>
        <T x={20} y={150} s={13} f={C.latte}>reader sees</T>
        <rect x={110} y={14} width={140} height={28} rx={6} fill="none" stroke={C.mocha} />
        <T x={180} y={33} s={13} a="middle" f={C.crema}>data = 42</T>
        <rect x={280} y={14} width={150} height={28} rx={6} fill="none" stroke={C.mocha} />
        <T x={355} y={33} s={13} a="middle" f={C.crema}>ready = true</T>
        <rect x={150} y={128} width={150} height={32} rx={6} fill={C.cocoa} stroke={bad > 0 ? C.cherryText : C.mocha} strokeWidth={1.5} />
        <T x={225} y={149} s={13} a="middle" f={bad > 0 ? C.cherryText : C.crema}>{data >= 1 ? 'data: 42' : look ? 'data: 0' : 'data: ?'}</T>
        <rect x={340} y={128} width={150} height={32} rx={6} fill={C.cocoa} stroke={ready >= 1 ? C.caramel : C.mocha} strokeWidth={1.5} />
        <T x={415} y={149} s={13} a="middle" f={ready >= 1 ? C.caramel : C.crema}>{ready >= 1 ? 'ready: true' : 'ready: false'}</T>
        {ready > 0 && ready < 1 && <circle cx={355} cy={lerp(42, 128, ready)} r={6} fill={C.caramel} />}
        {data > 0 && data < 1 && <circle cx={lerp(180, 225, data)} cy={lerp(42, 128, data)} r={6} fill={C.crema} />}
        {bad > 0 && (
          <g transform={`translate(520 90) scale(${bad.toFixed(3)}) translate(-520 -90)`}>
            <T x={520} y={95} s={14} a="middle" f={C.cherryText} w={700}>flag first</T>
          </g>
        )}
      </Svg>
    </Stack>
  );
}

// ── 7 · The missing piece has a name: happens-before (takeaway) ────────────────────────────────
export function HappensBeforeReveal({ t }: StepCtx) {
  // An arrow draws from one event dot to the next, tracing the happens-before relation itself.
  return (
    <Svg label="the C++20 memory model Rust's atomics follow, minus consume" h={220}>
      <rect x={120} y={30} width={360} height={50} rx={8} fill="none" stroke={C.taupe} strokeWidth={1.5} />
      <T x={300} y={60} s={12} a="middle" f={C.latte}>"Rust atomics currently follow the same rules as C++20"</T>
      <circle cx={120} cy={130} r={5} fill={C.crema} />
      <T x={135} y={134} s={12} f={C.crema}>event A</T>
      <Draw pts={[[195, 130], [405, 130]]} t={t} from={0.6} to={0.9} stroke={C.caramel} w={2} pen />
      <circle cx={480} cy={130} r={5} fill={C.crema} opacity={fa(t, 0.9, 0.2)} />
      <T x={430} y={110} s={12} f={C.crema} o={fa(t, 0.9, 0.2)}>event B</T>
      <T x={60} y={170} s={13} f={C.mocha} o={fa(t, 1.2, 0.4)}>every ordering is built from this one relation</T>
    </Svg>
  );
}

// ── 8 · Unsynchronized conflicting access is UB (takeaway) ─────────────────────────────────────
export function DataRaceUbReveal({ t, portrait }: StepCtx) {
  const a = easeOut(seg(t, 0.5, 1.1));
  const b = easeOut(seg(t, 0.6, 1.2));
  const hit = t >= 1.2;
  const ub = easeOutBack(seg(t, 1.8, 2.2));
  return (
    <Stack>
      {!portrait && <Code title="the std library's own definition" lines={['// data races are undefined behavior', '// conflicting, non-synchronized accesses', '// where at least one is a write']} t={t} start={0.1} end={0.5} highlight={t > 1.8 ? [0] : t > 0.5 ? [1, 2] : []} />}
      <Svg label="two threads write the same memory with no synchronization between them; the result is not a wrong value but undefined behavior" h={160} fill>
        {threadDot(60, 40, 'T1')}
        {threadDot(60, 120, 'T2')}
        <line x1={76} y1={44} x2={lerp(76, 268, a)} y2={lerp(44, 76, a)} stroke={C.crema} strokeWidth={2} opacity={a > 0 ? 1 : 0} />
        <line x1={76} y1={116} x2={lerp(76, 268, b)} y2={lerp(116, 84, b)} stroke={C.crema} strokeWidth={2} opacity={b > 0 ? 1 : 0} />
        <T x={170} y={40} s={13} a="middle" f={C.latte} o={a}>write</T>
        <T x={170} y={134} s={13} a="middle" f={C.latte} o={b}>write</T>
        <rect x={270} y={60} width={110} height={40} rx={7} fill={C.cocoa} stroke={hit ? C.cherryText : C.mocha} strokeWidth={2} />
        <T x={325} y={86} s={14} a="middle" f={hit ? C.cherryText : C.crema}>{hit ? decodeText('#####', 0.5 + ((Math.floor(t * 12) % 7) / 20)) : 'x'}</T>
        {ub > 0 && (
          <g transform={`translate(490 80) scale(${ub.toFixed(3)}) translate(-490 -80)`}>
            <T x={490} y={74} s={14} a="middle" f={C.cherryText} w={700}>undefined</T>
            <T x={490} y={94} s={14} a="middle" f={C.cherryText} w={700}>behavior</T>
          </g>
        )}
        <Reticle x={325} y={80} w={126} h={56} t={t} at={2.2} color={C.cherryText} />
      </Svg>
    </Stack>
  );
}

// ── 9 · The kernel has its own, stricter model (takeaway) ──────────────────────────────────────
export function LkmmReveal({ t }: StepCtx) {
  // A dividing line draws itself between the two models, setting LKMM apart rather than just
  // naming it in text.
  return (
    <Svg label="LKMM: a distinct, stricter model, named and set aside" h={200}>
      <T x={60} y={50} s={13} a="middle" f={C.taupe}>C++20 / Rust</T>
      <Draw pts={[[180, 30], [180, 160]]} t={t} from={0.2} to={0.5} stroke={C.mocha} w={2} dash="4 4" pen={false} />
      <T x={300} y={50} s={13} a="middle" f={C.taupe}>LKMM</T>
      <T x={60} y={100} s={14} f={C.crema} o={fa(t, 0.6, 0.3)}>the Linux kernel's own memory model is different</T>
      <T x={60} y={150} s={13} f={C.mocha} o={fa(t, 1.2, 0.4)}>it matters only for kernel Rust</T>
    </Svg>
  );
}

// ── 10 · Recap ───────────────────────────────────────────────────────────────────────────────────
export function Recap({ t }: StepCtx) {
  const rows = [
    'atomicity: no torn updates, proven exact',
    'ordering: a real violation, found by loom',
    'Rust follows C++20, minus consume',
    'a data race is real undefined behavior',
  ];
  return <RecapList t={t} end={3} label="recap: atomicity and ordering, each proven separately" rows={rows} step={55} />;
}
