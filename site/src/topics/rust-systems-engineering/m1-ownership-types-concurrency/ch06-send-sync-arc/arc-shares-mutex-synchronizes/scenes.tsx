import type { StepCtx } from '../../../../../reels/types';
import { easeInOut, easeOut, easeOutBack, lerp, seg } from '../../../../../reels/anim';
import { Code } from '../../../../../reels/Code';
import { C, Decode, Draw, Reticle, Stack, Svg, T } from '../../../../../reels/kit';

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
      <T x={60} y={230} s={13} f={C.taupe} o={fa(t, 1.3, 0.4)}>two threads, one pointer, no way to mutate</T>
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
        <T x={40} y={28} s={13} f={C.mocha} o={fa(t, 2.0, 0.4)}>writing through the pointer, no lock</T>
      </Svg>
    </Stack>
  );
}

// ── 3 · The real compiler verdict (no takeaway: the reel's "from" step) ────────────────────────
export function BareArcReveal({ t }: StepCtx) {
  const read = easeOut(seg(t, 0.6, 1.0));
  const write = easeInOut(seg(t, 1.1, 1.6));
  const shut = easeOutBack(seg(t, 1.6, 1.9));
  const mutex = easeInOut(seg(t, 2.0, 2.6));
  return (
    <Stack>
      <Code title="the real compiler verdict" dim={t < 0.1} lines={['error[E0594]: cannot assign to data in an `Arc`', 'help: trait `DerefMut` is required', 'to modify through a dereference,', 'but it is not implemented for `Arc<u64>`']} t={t} start={0.1} end={0.6} highlight={t > 1.6 ? [1] : [0]} />
      <Svg label="Arc offers a shared view through Deref; a write needs DerefMut, which Arc does not have, so the ability to mutate must come from something else, like a Mutex" h={170} fill>
        <rect x={200} y={30} width={200} height={110} rx={10} fill={C.cocoa} stroke={C.mocha} strokeWidth={1.5} />
        <T x={300} y={22} s={13} a="middle" f={C.taupe}>Arc&lt;u64&gt;</T>
        {mutex < 0.5 && <T x={300} y={92} s={14} a="middle" f={C.crema}>u64</T>}
        <line x1={40} y1={60} x2={lerp(40, 198, read)} y2={60} stroke={C.caramel} strokeWidth={2} />
        <T x={40} y={50} s={13} f={C.caramel} o={read}>read: Deref</T>
        <line x1={40} y1={112} x2={lerp(40, 190, write) - shut * 30} y2={112} stroke={shut > 0 ? C.cherryText : C.latte} strokeWidth={2} opacity={write > 0 ? 1 : 0} />
        <T x={40} y={102} s={13} f={shut > 0 ? C.cherryText : C.latte} o={write}>write: DerefMut</T>
        {shut > 0 && (
          <g transform={`translate(200 112) scale(${shut.toFixed(3)}) translate(-200 -112)`}>
            <path d="M190 102 l20 20 M210 102 l-20 20" stroke={C.cherryText} strokeWidth={3} strokeLinecap="round" />
          </g>
        )}
        {mutex > 0 && (
          <g transform={`translate(${lerp(260, 0, mutex).toFixed(1)} 0)`} opacity={mutex}>
            <rect x={230} y={70} width={140} height={36} rx={7} fill={C.roast} stroke={C.cinnamon} strokeWidth={2} />
            <T x={300} y={93} s={13} a="middle" f={C.cinnamon}>Mutex&lt;u64&gt;</T>
          </g>
        )}
        <T x={300} y={164} s={13} a="middle" f={C.cinnamon} o={easeOut(seg(t, 2.5, 2.8))}>mutation comes from elsewhere</T>
      </Svg>
    </Stack>
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
        <T x={40} y={100} s={13} f={C.taupe} o={fa(t, 2.4, 0.4)}>the value is still reachable, on purpose</T>
      </Svg>
    </Stack>
  );
}

// ── 6 · The identical panic, and parking_lot's opposite choice (takeaway) ──────────────────────
export function ParkingLotNoPoison({ t, portrait }: StepCtx) {
  const t1 = easeInOut(seg(t, 0.4, 0.9)); // thread one walks in and takes the lock
  const boom = easeOutBack(seg(t, 1.0, 1.3));
  const gone = easeOut(seg(t, 1.4, 1.8));
  const t2 = easeInOut(seg(t, 1.9, 2.5)); // the next thread walks straight in
  const read = t >= 2.5;
  return (
    <Stack>
      {!portrait && <Code title="examples/src/bin/parking_lot_no_poison.rs" lines={['let _guard = m2.lock();', 'panic!("boom while holding the lock");', 'let value = *m.lock();']} t={t} start={0.1} end={0.6} highlight={t > 1.9 ? [2] : t > 1.0 ? [1] : [0]} />}
      <Svg label="thread one takes the parking_lot lock and panics; the lock is left clean, with no poison flag, and the next thread takes it and reads 7 directly" h={150} fill>
        <rect x={240} y={40} width={120} height={60} rx={10} fill={C.cocoa} stroke={C.caramel} strokeWidth={1.5} />
        {padlock(300, 28)}
        {read ? <Decode text="7" x={300} y={78} s={18} a="middle" f={C.caramel} t={t} at={2.5} dur={0.3} /> : <T x={300} y={78} s={18} a="middle" f={C.crema}>7</T>}
        <g opacity={1 - gone}>
          {threadDot(lerp(40, 200, t1), 70, 'T1')}
          {boom > 0 && (
            <g transform={`translate(200 70) scale(${boom.toFixed(3)})`}>
              {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
                <line key={i} x1={Math.cos((i * Math.PI) / 4) * 18} y1={Math.sin((i * Math.PI) / 4) * 18} x2={Math.cos((i * Math.PI) / 4) * 30} y2={Math.sin((i * Math.PI) / 4) * 30} stroke={C.cherryText} strokeWidth={2.5} />
              ))}
            </g>
          )}
        </g>
        {gone < 0.95 && <T x={200} y={130} s={13} a="middle" f={C.cherryText} o={boom * (1 - gone)}>panic!</T>}
        {t2 > 0 && threadDot(lerp(560, 400, t2), 70, 'T2')}
        <T x={300} y={140} s={13} a="middle" f={C.caramel} o={easeOut(seg(t, 2.6, 2.9))}>never poisoned, by design</T>
      </Svg>
    </Stack>
  );
}

// ── 7 · Does holding a lock across an await compile? (predict) ─────────────────────────────────
export function GuardAwaitPredict({ t }: StepCtx) {
  return (
    <Stack>
      <Code
        title="std_guard_across_await_fails.rs"
        lines={['let mut guard = m.lock().unwrap();', 'tokio::task::yield_now().await;', '*guard += 1;']}
        t={t}
        start={0.1}
        end={2.0}
        highlight={[0, 1, 2]}
      />
      <Svg label="does this whole task still qualify to be spawned?" h={46}>
        <T x={40} y={28} s={13} f={C.mocha} o={fa(t, 2.2, 0.4)}>guard made before the pause, used after</T>
      </Svg>
    </Stack>
  );
}

// ── 8 · The real failure, and the one lock built to survive it (no takeaway) ───────────────────
export function GuardAwaitReveal({ t, portrait }: StepCtx) {
  const P = 330;
  const r1 = easeOut(seg(t, 0.4, 1.3));
  const r2 = easeOut(seg(t, 2.0, 2.9));
  return (
    <Stack>
      {!portrait && <Code title="the real compiler verdict, for the std guard" dim={t < 0.1} lines={['error: future cannot be sent', 'between threads safely', 'note: future is not `Send` as this', "value is used across an await point:", "`MutexGuard<'_, u64>`"]} t={t} start={0.1} end={0.7} highlight={[0, 1]} />}
      <Svg label="the std guard's hold runs across the await and the task is rejected; tokio's guard holds across the same await and the task runs, printing 1" h={124} fill>
        <line x1={P} y1={8} x2={P} y2={104} stroke={C.taupe} strokeWidth={1.5} strokeDasharray="4 4" />
        <T x={P} y={120} s={13} a="middle" f={C.taupe}>.await</T>
        <T x={20} y={40} s={13} f={C.latte}>std</T>
        <line x1={100} y1={36} x2={lerp(100, 470, r1)} y2={36} stroke={lerp(100, 470, r1) > P ? C.cherryText : C.caramel} strokeWidth={8} strokeLinecap="round" opacity={r1 > 0 ? 1 : 0} />
        <T x={575} y={41} s={13} a="end" f={C.cherryText} o={easeOut(seg(t, 1.3, 1.6))}>rejected</T>
        <T x={20} y={86} s={13} f={C.latte}>tokio</T>
        <line x1={100} y1={82} x2={lerp(100, 470, r2)} y2={82} stroke={C.caramel} strokeWidth={8} strokeLinecap="round" opacity={r2 > 0 ? 1 : 0} />
        <T x={575} y={87} s={13} a="end" f={C.caramel} o={easeOut(seg(t, 2.9, 3.2))}>runs: 1</T>
      </Svg>
      <Code title="tokio_mutex_across_await_works.rs — builds and runs" lines={['let mut guard = m.lock().await;', 'tokio::task::yield_now().await;', '*guard += 1;']} t={t} start={1.9} end={2.5} highlight={[0]} />
    </Stack>
  );
}

// ── 9 · Recap ────────────────────────────────────────────────────────────────────────────────────
export function Recap({ t }: StepCtx) {
  const rows = [
    'a shared pointer shares — nothing more',
    'a lock is a separate, synchronizing job',
    'one poisons on panic, one never does',
    'one lock survives a pause while held',
  ];
  return <RecapList t={t} end={3} label="recap: two jobs, two choices each" rows={rows} step={55} />;
}
