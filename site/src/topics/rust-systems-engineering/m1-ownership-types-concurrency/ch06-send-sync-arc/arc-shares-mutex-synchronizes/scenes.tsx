import type { StepCtx } from '../../../../../reels/types';
import { easeOut, seg } from '../../../../../reels/anim';
import { Code } from '../../../../../reels/Code';
import { C, Draw, Stack, Svg, T } from '../../../../../reels/kit';

// Arc and Mutex are two unrelated tools: Arc shares ownership, Mutex/parking_lot/tokio::sync add
// synchronization. Every error shown is the real, unedited rustc/cargo diagnostic text; every run
// (the four-worker Mutex counter, the std poison, the parking_lot non-poison, the tokio guard
// across await) is executed for real by examples.py.
const fa = (t: number, a: number, d = 0.4) => easeOut(seg(t, a, a + d));

const threadDot = (cx: number, cy: number, label: string, opacity = 1) => (
  <g opacity={opacity}>
    <circle cx={cx} cy={cy} r={14} fill="none" stroke={C.taupe} strokeWidth={1.5} />
    <T x={cx} y={cy + 4} s={10} a="middle" f={C.crema}>{label}</T>
  </g>
);

const padlock = (cx: number, cy: number, cracked = false, opacity = 1) => (
  <g opacity={opacity}>
    <rect x={cx - 8} y={cy - 2} width={16} height={13} rx={2} fill="none" stroke={cracked ? C.mocha : C.caramel} strokeWidth={1.5} />
    {cracked ? (
      <path d={`M ${cx - 5} ${cy - 2} V ${cy - 5} L ${cx} ${cy - 7} L ${cx + 5} ${cy - 2}`} fill="none" stroke={C.mocha} strokeWidth={1.5} />
    ) : (
      <path d={`M ${cx - 5} ${cy - 2} V ${cy - 7} A 5 5 0 0 1 ${cx + 5} ${cy - 7} V ${cy - 2}`} fill="none" stroke={C.caramel} strokeWidth={1.5} />
    )}
  </g>
);

// ── 1 · A bare Arc shares the counter — and that's all (takeaway) ──────────────────────────────
export function BareArcShares({ t }: StepCtx) {
  return (
    <Svg label="an Arc<u64>, cloned to a second thread; both threads can see it, neither can write through it" h={280}>
      <rect x={250} y={60} width={100} height={50} rx={8} fill="none" stroke={C.caramel} strokeWidth={2} />
      <T x={300} y={90} s={13} a="middle" f={C.crema}>Arc&lt;u64&gt;</T>
      <g opacity={fa(t, 0.3, 0.4)}>
        {threadDot(180, 180, 't1')}
        <Draw pts={[[180, 166], [270, 112]]} t={t} from={0.3} to={0.55} stroke={C.mocha} w={1.5} pen={false} />
      </g>
      <g opacity={fa(t, 0.7, 0.4)}>
        {threadDot(420, 180, 't2')}
        <Draw pts={[[420, 166], [330, 112]]} t={t} from={0.7} to={0.95} stroke={C.mocha} w={1.5} pen={false} />
      </g>
      <T x={60} y={230} s={13} f={C.taupe} o={fa(t, 1.3, 0.4)}>two threads, one shared pointer — but no way in to mutate</T>
    </Svg>
  );
}

// ── 2 · Does assigning through a bare Arc<u64> compile? (predict) ──────────────────────────────
export function BareArcPredict({ t }: StepCtx) {
  return (
    <Stack>
      <Code
        title="examples/bare_arc_no_mutation.rs"
        lines={['let c2 = Arc::clone(&counter);', '*counter += 1;', 'println!("{} {}", counter, c2);']}
        t={t}
        start={0.1}
        end={1.8}
        highlight={[0, 1]}
      />
      <Svg label="does this build?" h={46}>
        <T x={40} y={28} s={13} f={C.mocha} o={fa(t, 2.0, 0.4)}>writing straight through the shared pointer, no lock anywhere</T>
      </Svg>
    </Stack>
  );
}

// ── 3 · The real compiler verdict (no takeaway: the reel's "from" step) ────────────────────────
export function BareArcReveal({ t }: StepCtx) {
  return (
    <Code
      title="the real compiler verdict"
      dim
      lines={['error[E0594]: cannot assign to data in an `Arc`', 'help: trait `DerefMut` is required to modify through a dereference, but it is not implemented for `Arc<u64>`']}
      t={t}
      start={0.1}
      end={2.2}
      highlight={[0, 1]}
    />
  );
}

// ── 4 · Wrap it in a lock, and both jobs get done (takeaway) ───────────────────────────────────
export function ArcMutexWorks({ t }: StepCtx) {
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
      <T x={60} y={260} s={13} f={C.taupe} o={fa(t, 1.7, 0.4)}>the pointer shares it; the lock is what made this safe</T>
    </Svg>
  );
}

// ── 5 · A panic while the lock is held really poisons it (takeaway) ────────────────────────────
export function StdMutexPoisons({ t }: StepCtx) {
  return (
    <Stack>
      <Code
        title="examples/std_mutex_poisons.rs"
        lines={['let _guard = m2.lock().unwrap();', 'panic!("boom while holding the lock");']}
        t={t}
        start={0.1}
        end={1.6}
        highlight={[0, 1]}
      />
      <Svg label="poisoned, recovered through into_inner" h={120}>
        {padlock(60, 60, true, fa(t, 1.9, 0.4))}
        <T x={90} y={64} s={13} f={C.mocha} o={fa(t, 1.9, 0.4)}>m.lock() now returns Err — poisoned</T>
        <T x={40} y={100} s={13} f={C.taupe} o={fa(t, 2.4, 0.4)}>the value, 7, is still reachable through unwrap_err().into_inner()</T>
      </Svg>
    </Stack>
  );
}

// ── 6 · The identical panic, and parking_lot's opposite choice (takeaway) ──────────────────────
export function ParkingLotNoPoison({ t }: StepCtx) {
  return (
    <Stack>
      <Code
        title="examples/src/bin/parking_lot_no_poison.rs"
        lines={['let _guard = m2.lock();', 'panic!("boom while holding the lock");', 'let value = *m.lock();']}
        t={t}
        start={0.1}
        end={2.0}
        highlight={[0, 1, 2]}
      />
      <Svg label="no Result anywhere; the second lock() just succeeds" h={100}>
        {padlock(60, 50)}
        <T x={90} y={54} s={13} f={C.caramel} o={fa(t, 2.3, 0.4)}>never poisoned, by design — value recovered directly</T>
      </Svg>
    </Stack>
  );
}

// ── 7 · Does holding a lock across an await compile? (predict) ─────────────────────────────────
export function GuardAwaitPredict({ t }: StepCtx) {
  return (
    <Stack>
      <Code
        title="examples/src/bin/std_guard_across_await_fails.rs"
        lines={['let mut guard = m.lock().unwrap();', 'tokio::task::yield_now().await;', '*guard += 1;']}
        t={t}
        start={0.1}
        end={2.0}
        highlight={[0, 1, 2]}
      />
      <Svg label="does this whole task still qualify to be spawned?" h={46}>
        <T x={40} y={28} s={13} f={C.mocha} o={fa(t, 2.2, 0.4)}>the guard is created before the pause, and used again after it</T>
      </Svg>
    </Stack>
  );
}

// ── 8 · The real failure, and the one lock built to survive it (no takeaway) ───────────────────
export function GuardAwaitReveal({ t }: StepCtx) {
  return (
    <Stack>
      <Code
        title="the real compiler verdict, for the std guard"
        dim
        lines={['error: future cannot be sent between threads safely', "note: future is not `Send` as this value is used across an await point: `MutexGuard<'_, u64>`"]}
        t={t}
        start={0.1}
        end={1.8}
        highlight={[0, 1]}
      />
      <Code
        title="examples/src/bin/tokio_mutex_across_await_works.rs — builds and runs"
        lines={['let mut guard = m.lock().await;', 'tokio::task::yield_now().await;', '*guard += 1;']}
        t={t}
        start={2.1}
        end={3.4}
        highlight={[0]}
      />
    </Stack>
  );
}

// ── 9 · Recap ────────────────────────────────────────────────────────────────────────────────────
export function Recap({ t }: StepCtx) {
  const rows = [
    'a shared pointer shares — nothing more',
    'a lock is the separate job of synchronizing',
    "one library's lock poisons on panic, another's never does",
    'one lock exists to survive a pause while held',
  ];
  return (
    <Svg label="recap: two jobs, two choices each" h={300}>
      {rows.map((r, i) => (
        <g key={r} opacity={fa(t, 0.2 + i * 0.4, 0.4)}>
          <circle cx={30} cy={40 + i * 55} r={5} fill={C.caramel} />
          <T x={48} y={46 + i * 55} s={14} f={C.crema}>{r}</T>
        </g>
      ))}
    </Svg>
  );
}
