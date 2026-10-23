import type { ReactNode } from 'react';
import type { StepCtx } from '../../../../../reels/types';
import { easeOut, seg } from '../../../../../reels/anim';
import { Code } from '../../../../../reels/Code';
import { C, Draw, Stack, Svg, T } from '../../../../../reels/kit';

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
      <T x={60} y={230} s={13} f={C.taupe} o={fa(t, 1.3, 0.4)}>one thread, one cell — nothing here is in question yet</T>
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
  return (
    <Stack>
      <Code
        title="the real compiler verdict, for Cell<u64>"
        dim
        lines={['error[E0277]: `Cell<u64>` cannot be shared between threads safely', 'help: the trait `Sync` is not implemented for `Cell<u64>`']}
        t={t}
        start={0.1}
        end={1.6}
        highlight={[0, 1]}
      />
      <Code
        title="the real compiler verdict, for RefCell<u64>"
        dim
        lines={['error[E0277]: `RefCell<u64>` cannot be shared between threads safely', 'help: the trait `Sync` is not implemented for `RefCell<u64>`']}
        t={t}
        start={1.9}
        end={3.4}
        highlight={[0, 1]}
      />
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
export function GuardNotSendFig({ t }: StepCtx) {
  return (
    <Stack>
      <Code
        title="examples/mutexguard_not_send.rs"
        lines={['let guard = m.lock().unwrap();', 'let handle = thread::spawn(move || {', '    drop(guard);', '});']}
        t={t}
        start={0.1}
        end={1.8}
        highlight={[0, 1, 2]}
      />
      <Code
        title="the real compiler verdict"
        dim
        lines={["error[E0277]: `MutexGuard<'_, u64>` cannot be sent between threads safely"]}
        t={t}
        start={2.0}
        end={3.0}
        highlight={[0]}
      />
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
      <T x={40} y={270} s={13} f={C.taupe} o={fa(t, 2.3, 0.4)}>one unsafe line opens a door the compiler could never prove</T>
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
        <T x={40} y={28} s={13} f={C.mocha} o={fa(t, 2.4, 0.4)}>the pointer is created before the pause, and used again after it</T>
      </Svg>
    </Stack>
  );
}

// ── 8 · The same Rc, dropped before the await, and held across it (no takeaway) ────────────────
export function RcAwaitReveal({ t }: StepCtx) {
  return (
    <Stack>
      <Code
        title="dropped before the pause — builds and runs"
        lines={['{ let rc = Rc::new(()); use_rc(rc.clone()); }', 'task::yield_now().await;']}
        t={t}
        start={0.1}
        end={1.6}
        highlight={[0]}
      />
      <Code
        title="held across the pause — the real compiler verdict"
        dim
        lines={['error: future cannot be sent between threads safely', 'note: future is not `Send` as this value is used across an await']}
        t={t}
        start={1.9}
        end={3.4}
        highlight={[0, 1]}
      />
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
  return (
    <Svg label="recap: two structural facts, and the compiler's only two overrides" h={300}>
      {rows.map((r, i) => (
        <g key={r} opacity={fa(t, 0.2 + i * 0.4, 0.4)}>
          <circle cx={30} cy={40 + i * 55} r={5} fill={C.caramel} />
          <T x={48} y={46 + i * 55} s={14} f={C.crema}>{r}</T>
        </g>
      ))}
    </Svg>
  );
}
