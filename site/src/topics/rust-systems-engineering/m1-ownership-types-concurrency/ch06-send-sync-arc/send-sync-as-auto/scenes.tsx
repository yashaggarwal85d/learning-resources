import type { ReactNode } from 'react';
import type { StepCtx } from '../../../../../reels/types';
import { easeInOut, easeOut, easeOutBack, lerp, seg } from '../../../../../reels/anim';
import { Code } from '../../../../../reels/Code';
import { C, Draw, Reticle, Stack, Svg, T } from '../../../../../reels/kit';

// The chapter's shared job counter, built three ways (Cell, RefCell, a held MutexGuard) and tested
// against the compiler's own Send/Sync auto-trait inference. Every error shown is the real,
// unedited rustc/cargo diagnostic text; every run (the four-worker Mutex counter, the Carton, the
// two PhantomData variants, the two tokio tasks) is executed for real by examples.py.
const fa = (t: number, a: number, d = 0.4) => easeOut(seg(t, a, a + d));

const threadDot = (cx: number, cy: number, label: string, opacity = 1) => (
  <g opacity={opacity}>
    <circle cx={cx} cy={cy} r={14} fill="none" stroke={C.taupe} strokeWidth={1.5} />
    <T x={cx} y={cy + 4} s={10} a="middle" f={C.crema}>{label}</T>
  </g>
);

function traitBadge(x: number, y: number, label: string, ok: boolean, opacity = 1): ReactNode {
  const w = 58;
  return (
    <g opacity={opacity}>
      <rect x={x} y={y} width={w} height={22} rx={11} fill="none" stroke={ok ? C.caramel : C.mocha} strokeWidth={1.5} />
      <T x={x + w / 2} y={y + 15} s={11} a="middle" f={ok ? C.crema : C.mocha}>{ok ? label : `!${label}`}</T>
      {!ok && <line x1={x + 4} y1={y + 18} x2={x + w - 4} y2={y + 4} stroke={C.mocha} strokeWidth={1.2} />}
    </g>
  );
}

const padlock = (cx: number, cy: number, opacity = 1) => (
  <g opacity={opacity}>
    <rect x={cx - 8} y={cy - 2} width={16} height={13} rx={2} fill="none" stroke={C.caramel} strokeWidth={1.5} />
    <path d={`M ${cx - 5} ${cy - 2} V ${cy - 7} A 5 5 0 0 1 ${cx + 5} ${cy - 7} V ${cy - 2}`} fill="none" stroke={C.caramel} strokeWidth={1.5} />
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

/** A small tick or cross at (x, y), drawn by `k`. */
function Mark({ x, y, k, ok }: { x: number; y: number; k: number; ok: boolean }) {
  if (k <= 0) return null;
  return ok ? (
    <path d={`M${x - 7} ${y} l5 5 l10 -12`} fill="none" stroke={C.caramel} strokeWidth={2.5} strokeLinecap="round" strokeDasharray="24" strokeDashoffset={24 * (1 - k)} />
  ) : (
    <path d={`M${x - 7} ${y - 7} l14 14 M${x + 7} ${y - 7} l-14 14`} stroke={C.cherryText} strokeWidth={2.5} strokeLinecap="round" opacity={k} />
  );
}

// ── 1 · A single Cell<u64> counts correctly, alone (takeaway) ──────────────────────────────────
export function CellAloneWorks({ t }: StepCtx) {
  return (
    <Svg label="a Cell<u64> job counter, touched by one thread, counting up correctly" h={280}>
      <rect x={250} y={60} width={100} height={50} rx={8} fill="none" stroke={C.caramel} strokeWidth={2} />
      <T x={300} y={90} s={13} a="middle" f={C.crema}>Cell&lt;u64&gt;</T>
      <g opacity={fa(t, 0.3, 0.4)}>
        {threadDot(300, 180, 't1')}
        <Draw pts={[[300, 166], [300, 112]]} t={t} from={0.3} to={0.55} stroke={C.mocha} w={1.5} pen={false} />
      </g>
      <g opacity={fa(t, 0.9, 0.4)}>{traitBadge(380, 75, 'Send', true)}</g>
      <T x={60} y={230} s={13} f={C.taupe} o={fa(t, 1.3, 0.4)}>one thread, one cell: nothing in question</T>
    </Svg>
  );
}

// ── 2 · Does Arc<Cell<u64>>, cloned into a second thread, compile? (predict) ────────────────────
export function CellSyncPredict({ t }: StepCtx) {
  return (
    <Stack>
      <Code
        title="examples/cell_not_sync.rs"
        lines={['let c2 = Arc::clone(&counter);', 'let handle = thread::spawn(move || {', '    c2.set(c2.get() + 1);', '});']}
        t={t}
        start={0.1}
        end={2.0}
        highlight={[0, 1]}
      />
      <Svg label="does this build?" h={46}>
        <T x={40} y={28} s={13} f={C.mocha} o={fa(t, 2.2, 0.4)}>a second thread, reached through a cloned shared pointer</T>
      </Svg>
    </Stack>
  );
}

// ── 3 · Cell and RefCell fail identically (no takeaway: the reel's "from" step) ─────────────────
export function CellRefCellFailReveal({ t }: StepCtx) {
  const move = easeInOut(seg(t, 0.4, 1.1)); // one thread hands the cell to the other: not what the errors forbid
  const centre = easeInOut(seg(t, 1.4, 1.7));
  const share = easeOut(seg(t, 1.7, 2.2)); // both reach it at once: that is what they forbid
  const bad = easeOutBack(seg(t, 2.2, 2.5));
  const cx = centre > 0 ? lerp(470, 300, centre) : lerp(130, 470, move);
  return (
    <Stack>
      <Code title="the real compiler verdict, for Cell<u64>" dim={t < 0.1} lines={['error[E0277]: `Cell<u64>` cannot be shared between threads safely', 'help: the trait `Sync` is not implemented for `Cell<u64>`']} t={t} start={0.1} end={0.8} highlight={t > 2.2 ? [0, 1] : []} />
      <Svg label="handing the cell from one thread to the other is not what fails; two threads reaching the same cell at once is, and Sync is the missing trait in both errors" h={120} fill>
        {threadDot(50, 60, 'A')}
        {threadDot(550, 60, 'B')}
        <rect x={cx - 45} y={44} width={90} height={32} rx={7} fill={C.cocoa} stroke={bad > 0 ? C.cherryText : C.crema} strokeWidth={1.5} />
        <T x={cx} y={65} s={13} a="middle" f={C.crema}>cell</T>
        <T x={470} y={104} s={13} a="middle" f={C.latte} o={easeOut(seg(t, 1.0, 1.2)) * (1 - centre)}>moving: fine</T>
        <Mark x={548} y={100} k={easeOut(seg(t, 1.0, 1.25)) * (1 - centre)} ok />
        {share > 0 && (
          <g>
            <line x1={64} y1={60} x2={lerp(64, 255, share)} y2={60} stroke={bad > 0 ? C.cherryText : C.latte} strokeWidth={2} />
            <line x1={536} y1={60} x2={lerp(536, 345, share)} y2={60} stroke={bad > 0 ? C.cherryText : C.latte} strokeWidth={2} />
          </g>
        )}
        {bad > 0 && (
          <g transform={`translate(300 104) scale(${bad.toFixed(3)}) translate(-300 -104)`}>
            <T x={300} y={108} s={14} a="middle" f={C.cherryText} w={700}>shared: no Sync</T>
          </g>
        )}
      </Svg>
      <Code title="the real compiler verdict, for RefCell<u64>" dim={t < 1.9} lines={['error[E0277]: `RefCell<u64>` cannot be shared between threads safely', 'help: the trait `Sync` is not implemented for `RefCell<u64>`']} t={t} start={1.9} end={2.6} highlight={t > 2.2 ? [0, 1] : []} />
    </Stack>
  );
}

// ── 4 · Arc<Mutex<u64>> compiles and really synchronizes four workers (takeaway) ────────────────
export function MutexSynchronizesFig({ t }: StepCtx) {
  const positions: [number, number][] = [[90, 190], [220, 190], [380, 190], [510, 190]];
  return (
    <Svg label="four real worker threads increment a shared counter through one Arc<Mutex<u64>>; the final count is exact" h={300}>
      <rect x={250} y={40} width={100} height={50} rx={8} fill="none" stroke={C.caramel} strokeWidth={2} />
      <T x={300} y={70} s={13} a="middle" f={C.crema}>Mutex&lt;u64&gt;</T>
      {padlock(300, 46)}
      {positions.map(([x, y], i) => (
        <g key={i} opacity={fa(t, 0.4 + i * 0.25, 0.4)}>
          <Draw pts={[[x, y], [300, 96]]} t={t} from={0.4 + i * 0.25} to={0.65 + i * 0.25} stroke={C.mocha} w={1.5} pen={false} />
          {threadDot(x, y, `t${i + 1}`)}
        </g>
      ))}
      <T x={60} y={260} s={13} f={C.taupe} o={fa(t, 1.7, 0.4)}>every increment lands; the count comes out exact</T>
    </Svg>
  );
}

// ── 5 · MutexGuard is Sync but never Send (takeaway) ────────────────────────────────────────────
export function GuardNotSendFig({ t, portrait }: StepCtx) {
  const take = easeOutBack(seg(t, 0.4, 0.8));
  const tryGo = easeInOut(seg(t, 1.2, 1.7));
  const snap = easeOutBack(seg(t, 1.8, 2.2));
  const gx = lerp(lerp(180, 400, tryGo), 180, snap);
  const blocked = tryGo > 0.95;
  return (
    <Stack>
      {!portrait && <Code title="examples/mutexguard_not_send.rs" lines={['let guard = m.lock().unwrap();', 'let handle = thread::spawn(move || {', '    drop(guard);', '});']} t={t} start={0.1} end={0.7} highlight={t > 1.2 ? [1, 2] : [0]} />}
      <Svg label="the guard is tied to the thread that took the lock; moving it to a second thread is stopped, because MutexGuard is not Send" h={120} fill>
        {threadDot(50, 60, 'T1')}
        {threadDot(550, 60, 'T2')}
        <line x1={64} y1={60} x2={gx - 40} y2={60} stroke={C.caramel} strokeWidth={2} strokeDasharray="4 3" opacity={take} />
        {take > 0 && (
          <g transform={`translate(${gx.toFixed(1)} 60) scale(${Math.min(1, take).toFixed(3)})`}>
            <rect x={-40} y={-16} width={80} height={32} rx={7} fill={C.cocoa} stroke={blocked && snap < 0.5 ? C.cherryText : C.caramel} strokeWidth={1.5} />
            <T x={0} y={5} s={13} a="middle" f={C.crema}>guard</T>
          </g>
        )}
        <line x1={450} y1={30} x2={450} y2={90} stroke={C.cherryText} strokeWidth={2.5} opacity={easeOut(seg(t, 1.6, 1.8))} />
        <T x={450} y={112} s={13} a="middle" f={C.cherryText} o={easeOut(seg(t, 1.7, 1.9))}>not Send</T>
        <T x={180} y={112} s={13} a="middle" f={C.latte} o={easeOut(seg(t, 2.1, 2.4))}>tied to T1</T>
      </Svg>
      <Code title="the real compiler verdict" dim={t < 2.0} lines={["error[E0277]: `MutexGuard<'_, u64>` cannot be sent between threads safely"]} t={t} start={2.0} end={2.6} highlight={[0]} />
    </Stack>
  );
}

// ── 6 · PhantomData opt-out and unsafe impl Send opt-in (takeaway) ──────────────────────────────
export function OverridesFig({ t }: StepCtx) {
  return (
    <Svg label="a plain marker field inherits Send; a raw-pointer marker refuses it regardless; unsafe impl Send grants it back by hand" h={340}>
      <g opacity={fa(t, 0.2, 0.4)}>
        <T x={40} y={36} s={13} f={C.crema}>PhantomData&lt;T&gt;</T>
        {traitBadge(40, 48, 'Send', true)}
      </g>
      <g opacity={fa(t, 0.7, 0.4)}>
        <T x={220} y={36} s={13} f={C.crema}>PhantomData&lt;*const T&gt;</T>
        {traitBadge(220, 48, 'Send', false)}
      </g>
      <g opacity={fa(t, 1.3, 0.4)}>
        <T x={40} y={130} s={13} f={C.crema}>unsafe impl&lt;T: Send&gt; Send for Carton&lt;T&gt;</T>
        <Draw pts={[[60, 170], [180, 170]]} t={t} from={1.5} to={1.7} stroke={C.caramel} w={1.5} pen={false} />
        {threadDot(205, 170, 't2')}
      </g>
      <T x={40} y={240} s={13} f={C.taupe} o={fa(t, 2.0, 0.4)}>one marker closes a door the compiler opens on its own</T>
      <T x={40} y={270} s={13} f={C.taupe} o={fa(t, 2.3, 0.4)}>one unsafe line: a promise it never proved</T>
    </Svg>
  );
}

// ── 7 · Can an Rc be held across an await and still compile? (predict) ─────────────────────────
export function RcAwaitPredict({ t }: StepCtx) {
  return (
    <Stack>
      <Code
        title="examples/src/bin/tokio_rc_across_await_fails.rs"
        lines={['tokio::spawn(async {', '    let rc = Rc::new(());', '    task::yield_now().await;', '    use_rc(rc.clone());', '})']}
        t={t}
        start={0.1}
        end={2.2}
        highlight={[1, 2, 3]}
      />
      <Svg label="does this whole task still qualify to be spawned?" h={46}>
        <T x={40} y={28} s={13} f={C.mocha} o={fa(t, 2.4, 0.4)}>pointer made before the pause, used after</T>
      </Svg>
    </Stack>
  );
}

// ── 8 · The same Rc, dropped before the await, and held across it (no takeaway) ────────────────
export function RcAwaitReveal({ t }: StepCtx) {
  const P = 330; // the pause
  const r1 = easeOut(seg(t, 0.4, 1.0));
  const r2 = easeOut(seg(t, 1.6, 2.5));
  const crossed = lerp(90, 470, r2) > P;
  return (
    <Stack>
      <Code title="dropped before the pause — builds and runs" lines={['{ let rc = Rc::new(()); use_rc(rc.clone()); }', 'task::yield_now().await;']} t={t} start={0.1} end={0.7} highlight={[0]} />
      <Svg label="the Rc's lifetime bar ends before the await in the first task, which stays Send; in the second it runs across the await, and the whole task loses Send" h={130} fill>
        <line x1={P} y1={8} x2={P} y2={110} stroke={C.taupe} strokeWidth={1.5} strokeDasharray="4 4" />
        <T x={P} y={126} s={13} a="middle" f={C.taupe}>.await</T>
        <T x={20} y={42} s={13} f={C.latte}>before</T>
        <line x1={90} y1={38} x2={lerp(90, 260, r1)} y2={38} stroke={C.caramel} strokeWidth={8} strokeLinecap="round" opacity={r1 > 0 ? 1 : 0} />
        <T x={575} y={43} s={13} a="end" f={C.caramel} o={easeOut(seg(t, 1.0, 1.3))}>Send</T>
        <T x={20} y={92} s={13} f={C.latte}>across</T>
        <line x1={90} y1={88} x2={lerp(90, 470, r2)} y2={88} stroke={crossed ? C.cherryText : C.caramel} strokeWidth={8} strokeLinecap="round" opacity={r2 > 0 ? 1 : 0} />
        <T x={575} y={93} s={13} a="end" f={C.cherryText} o={easeOut(seg(t, 2.5, 2.8))}>not Send</T>
        <Reticle x={P} y={88} w={40} h={30} t={t} at={2.6} color={C.cherryText} />
      </Svg>
      <Code title="held across the pause — the real compiler verdict" dim={t < 1.9} lines={['error: future cannot be sent between threads safely', 'note: future is not `Send` as this value is used across an await']} t={t} start={1.9} end={2.6} highlight={[0, 1]} />
    </Stack>
  );
}

// ── 9 · Recap ────────────────────────────────────────────────────────────────────────────────────
export function Recap({ t }: StepCtx) {
  const rows = [
    'move and share are two separate questions',
    'a lock adds sync a bare cell never has',
    'a guard stays tied to its own thread',
    'only two deliberate overrides exist here',
  ];
  return <RecapList t={t} end={3} label="recap: two structural facts, and the compiler's only two overrides" rows={rows} step={55} />;
}
