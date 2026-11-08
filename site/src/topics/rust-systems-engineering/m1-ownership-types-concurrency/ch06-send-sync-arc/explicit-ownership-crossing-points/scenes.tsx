import type { StepCtx } from '../../../../../reels/types';
import { easeInOut, easeOut, easeOutBack, lerp, seg } from '../../../../../reels/anim';
import { Code } from '../../../../../reels/Code';
import { C, Decode, Draw, Reticle, Stack, Svg, T } from '../../../../../reels/kit';

// Four places, and only four, change which thread owns a value: thread::spawn, thread::scope,
// tokio::spawn, and a channel send. Every measured number and every compiler error shown is
// executed for real by examples.py (rustc 1.97.0, edition 2024, x86_64 Linux; the tokio example
// is built via cargo).
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

// ── 1 · Four places, and only four, change which thread owns a value (hook) ────────────────────
export function FourPlacesHook({ t }: StepCtx) {
  const rows = ['thread::spawn', 'thread::scope', 'tokio::spawn', 'a channel send'];
  const X = 330;
  const wall = easeOut(seg(t, 2.1, 2.5));
  return (
    <Svg label="the only four places a value's ownership crosses a thread boundary: four gates in one wall, and nowhere else" h={260}>
      <T x={X - 60} y={16} s={13} a="end" f={C.taupe} o={fa(t, 0.1, 0.3)}>this thread</T>
      <T x={X + 60} y={16} s={13} f={C.taupe} o={fa(t, 0.1, 0.3)}>another thread</T>
      {[0, 1, 2, 3, 4].map((i) => {
        const y1 = i === 0 ? 26 : 40 + (i - 1) * 50 + 14;
        const y2 = i === 4 ? 224 : 40 + i * 50 - 22;
        return <line key={i} x1={X} y1={y1} x2={X} y2={lerp(y1, y2, wall)} stroke={C.crema} strokeWidth={3} opacity={wall > 0 ? 1 : 0} />;
      })}
      {rows.map((r, i) => {
        const a = 0.3 + i * 0.42;
        const k = fa(t, a, 0.3);
        const go = easeInOut(seg(t, a + 0.1, a + 0.5));
        const y = 40 + i * 50;
        return (
          <g key={r} opacity={k}>
            <T x={30} y={y + 1} s={14} f={C.crema} serif>{r}</T>
            <line x1={X - 10} y1={y - 22} x2={X + 10} y2={y - 22} stroke={C.caramel} strokeWidth={2} />
            <line x1={X - 10} y1={y + 14} x2={X + 10} y2={y + 14} stroke={C.caramel} strokeWidth={2} />
            <rect x={lerp(220, 410, go) - 14} y={y - 13} width={28} height={20} rx={4} fill={go >= 1 ? C.caramel : C.crema} />
          </g>
        );
      })}
      <T x={X + 30} y={246} s={14} f={C.caramel} o={fa(t, 2.3, 0.4)}>nowhere else</T>
    </Svg>
  );
}

// ── 2 · Move a String into a new thread (predict) ──────────────────────────────────────────────
export function MoveStringPredict({ t, portrait }: StepCtx) {
  return (
    <Stack>
      <Code
        title="examples/thread_spawn_owns.rs"
        lines={['let message = String::from("...");', 'thread::spawn(move || {', '    message.len()', '});']}
        t={t}
        start={0.1}
        end={2.0}
        highlight={[0, 1, 2]}
      />
      {!portrait && (
        <Svg label="does the caller still have message afterward?" h={34}>
          <T x={40} y={24} s={16} f={C.mocha} o={fa(t, 1.7, 0.4)}>the closure captured message with `move`</T>
        </Svg>
      )}
    </Stack>
  );
}

// ── 3 · Moved for good (no takeaway: the reel's "from" step) ────────────────────────────────────
export function MovedForGoodReveal({ t }: StepCtx) {
  const move = easeInOut(seg(t, 0.6, 1.2)); // message moves into the new thread
  const count = easeOut(seg(t, 1.3, 1.9));
  const back = easeInOut(seg(t, 2.0, 2.5)); // only the number comes back, through join
  return (
    <Stack>
      <Code title="the new thread owns message now" lines={['thread::spawn(move || {', '    message.len() // owned here', '});', '// message is gone from main']} t={t} start={0.1} end={0.6} highlight={t > 1.3 ? [1] : t > 0.6 ? [3] : []} />
      <Svg label="message moves into the new thread and is gone from main; the new thread measures it, 27, and only that number travels back through the join handle" h={170} fill>
        <T x={20} y={44} s={13} f={C.latte}>main</T>
        <line x1={90} y1={40} x2={580} y2={40} stroke={C.mocha} strokeWidth={1.5} />
        <T x={20} y={134} s={13} f={C.latte}>new thread</T>
        <line x1={130} y1={130} x2={580} y2={130} stroke={C.mocha} strokeWidth={1.5} />
        <rect x={110} y={24} width={130} height={32} rx={7} fill="none" stroke={C.taupe} strokeDasharray="4 3" opacity={move > 0.5 ? 1 : 0} />
        {move > 0.5 && <T x={175} y={45} s={13} a="middle" f={C.taupe}>gone</T>}
        <g transform={`translate(${lerp(0, 90, move).toFixed(1)} ${lerp(0, 90, move).toFixed(1)})`}>
          <rect x={110} y={24} width={130} height={32} rx={7} fill={C.cocoa} stroke={C.caramel} strokeWidth={1.5} />
          <T x={175} y={45} s={13} a="middle" f={C.crema}>message</T>
        </g>
        {count > 0 && <T x={360} y={135} s={16} a="middle" f={C.caramel} w={700}>{back > 0 ? '' : `len ${Math.round(27 * count)}`}</T>}
        {back > 0 && (
          <g transform={`translate(${lerp(360, 480, back).toFixed(1)} ${lerp(130, 40, back).toFixed(1)})`}>
            <rect x={-26} y={-15} width={52} height={30} rx={15} fill={C.caramel} />
            <T x={0} y={5} s={14} a="middle" f={C.espresso} w={700}>27</T>
          </g>
        )}
        <T x={480} y={90} s={13} a="middle" f={C.latte} o={easeOut(seg(t, 2.0, 2.3))}>join()</T>
      </Svg>
    </Stack>
  );
}

// ── 4 · Try to only borrow into a plain spawn (takeaway) ────────────────────────────────────────
export function BorrowFailsReveal({ t, portrait }: StepCtx) {
  const frame = easeOut(seg(t, 0.5, 0.9));
  const run = easeOut(seg(t, 0.9, 1.9));
  const snap = run > 0.55;
  const fix = easeOutBack(seg(t, 2.2, 2.6));
  return (
    <Stack>
      {!portrait && <Code title="the real compiler verdict" dim={t < 0.1} lines={['error[E0373]: closure may outlive', 'the current function, but it borrows', '`data`, which is owned by the', 'current function', 'help: use the `move` keyword']} t={t} start={0.1} end={0.6} highlight={t > 2.2 ? [4] : [0, 1]} />}
      <Svg label="the function's frame ends while the spawned closure can still be running, so its borrow of data would dangle; the help is to move data in instead" h={150} fill>
        <T x={40} y={22} s={13} f={C.taupe} o={frame}>current function</T>
        <line x1={40} y1={40} x2={lerp(40, 300, frame)} y2={40} stroke={C.mocha} strokeWidth={2} />
        {frame > 0.98 && <line x1={300} y1={32} x2={300} y2={48} stroke={snap ? C.cherryText : C.mocha} strokeWidth={2.5} />}
        <rect x={60} y={56} width={90} height={30} rx={6} fill={C.cocoa} stroke={C.mocha} opacity={frame} />
        <T x={105} y={76} s={13} a="middle" f={C.crema} o={frame}>data</T>
        {run > 0 && <line x1={180} y1={120} x2={lerp(180, 560, run)} y2={120} stroke={C.caramel} strokeWidth={3} />}
        <T x={180} y={144} s={13} f={C.taupe} o={run}>closure, still running</T>
        <Draw pts={[[200, 120], [200, 100], [105, 100], [105, 86]]} t={t} from={0.9} to={1.3} stroke={snap ? C.cherryText : C.latte} w={2} dash="5 4" pen={false} />
        {fix > 0 && (
          <g transform={`translate(470 90) scale(${fix.toFixed(3)}) translate(-470 -90)`}>
            <rect x={420} y={76} width={100} height={28} rx={14} fill={C.caramel} />
            <T x={470} y={95} s={13} a="middle" f={C.espresso} w={700}>move</T>
          </g>
        )}
      </Svg>
    </Stack>
  );
}

// ── 5 · thread::scope makes the identical borrow sound (takeaway) ──────────────────────────────
export function ScopeBorrowsReveal({ t, portrait }: StepCtx) {
  const vals = [10, 20, 30];
  const open = easeOut(seg(t, 0.5, 0.8));
  const th = [easeOut(seg(t, 0.8, 1.6)), easeOut(seg(t, 1.0, 1.9))];
  const close = easeOutBack(seg(t, 2.0, 2.3));
  const sum = easeOut(seg(t, 1.1, 1.9));
  return (
    <Stack>
      {!portrait && <Code title="examples/thread_scope_borrows.rs" lines={['thread::scope(|s| {', '    s.spawn(|| { /* borrows data */ });', '    s.spawn(|| { total += ... });', '});']} t={t} start={0.1} end={0.6} highlight={t > 2.0 ? [3] : [0, 1, 2]} />}
      <Svg label="inside thread::scope two threads borrow data and add up 10, 20 and 30; both end before the scope's closing brace, and the sum is 60" h={170} fill>
        {vals.map((v, i) => (
          <g key={v}>
            <rect x={30 + i * 56} y={24} width={50} height={32} rx={6} fill={C.cocoa} stroke={C.mocha} strokeWidth={1.5} />
            <T x={55 + i * 56} y={45} s={13} a="middle" f={C.crema}>{String(v)}</T>
          </g>
        ))}
        <T x={30} y={76} s={13} f={C.taupe}>data</T>
        <line x1={220} y1={14} x2={220} y2={160} stroke={C.caramel} strokeWidth={2.5} opacity={open} />
        <T x={228} y={28} s={14} f={C.caramel} o={open}>{'scope {'}</T>
        {th.map((k, i) => (
          <g key={i}>
            <line x1={240} y1={80 + i * 40} x2={lerp(240, 470, k)} y2={80 + i * 40} stroke={C.crema} strokeWidth={3} opacity={k > 0 ? 1 : 0} />
            <Draw pts={[[250, 80 + i * 40], [140, 56]]} t={t} from={0.9 + i * 0.2} to={1.2 + i * 0.2} stroke={C.latte} w={1.5} dash="4 3" pen={false} />
          </g>
        ))}
        {close > 0 && (
          <g transform={`translate(510 90) scale(${close.toFixed(3)}) translate(-510 -90)`}>
            <line x1={510} y1={14} x2={510} y2={160} stroke={C.caramel} strokeWidth={2.5} />
            <T x={500} y={156} s={14} a="end" f={C.caramel}>{'}'}</T>
          </g>
        )}
        <T x={575} y={90} s={16} a="end" f={C.caramel} w={700} o={sum}>{t >= 1.9 ? '60' : String(Math.round(60 * sum))}</T>
      </Svg>
    </Stack>
  );
}

// ── 6 · tokio::spawn asks for the identical contract (predict) ─────────────────────────────────
export function TokioSpawnPredict({ t }: StepCtx) {
  return (
    <Stack>
      <Code
        title="examples/src/bin/tokio_spawn_owns.rs"
        lines={['tokio::spawn(async move {', '    message.len()', '});']}
        t={t}
        start={0.1}
        end={1.6}
        highlight={[0]}
      />
      <Svg label="does a non-Send future compile here?" h={46}>
        <T x={40} y={28} s={13} f={C.mocha} o={fa(t, 1.8, 0.4)}>the signature needs F: Future + Send + 'static</T>
      </Svg>
    </Stack>
  );
}

// ── 7 · Same contract, same reason (takeaway) ───────────────────────────────────────────────────
export function TokioSpawnReveal({ t }: StepCtx) {
  return (
    <Svg label="the runtime, not the caller, decides which thread runs the task" h={220}>
      <rect x={200} y={30} width={200} height={50} rx={8} fill="none" stroke={C.caramel} strokeWidth={2} />
      <T x={300} y={60} s={13} a="middle" f={C.crema}>spawned task</T>
      {threadDot(140, 160, 'this', fa(t, 0.4, 0.4))}
      {threadDot(460, 160, 'or this', fa(t, 0.8, 0.4))}
      <Draw pts={[[200, 55], [154, 146]]} t={t} from={0.4} to={0.6} stroke={C.mocha} w={1.5} pen={false} />
      <Draw pts={[[400, 55], [446, 146]]} t={t} from={0.8} to={1.0} stroke={C.mocha} w={1.5} pen={false} />
      <T x={40} y={200} s={13} f={C.taupe} o={fa(t, 1.3, 0.4)}>measured: the moved String's length is 29</T>
    </Svg>
  );
}

// ── 8 · A channel send is the fourth crossing point (takeaway) ─────────────────────────────────
export function ChannelSendReveal({ t }: StepCtx) {
  const positions: [number, number][] = [[120, 190], [480, 190]];
  return (
    <Svg label="two producer threads, one channel, one receiver" h={260}>
      <rect x={250} y={60} width={100} height={50} rx={8} fill="none" stroke={C.caramel} strokeWidth={2} />
      <T x={300} y={90} s={13} a="middle" f={C.crema}>channel</T>
      {positions.map(([x, y], i) => (
        <g key={i} opacity={fa(t, 0.3 + i * 0.3, 0.4)}>
          <Draw pts={[[x, y], [300, 116]]} t={t} from={0.3 + i * 0.3} to={0.55 + i * 0.3} stroke={C.mocha} w={1.5} pen={false} />
          {threadDot(x, y, `p${i + 1}`)}
        </g>
      ))}
      <T x={60} y={240} s={13} f={C.taupe} o={fa(t, 1.3, 0.4)}>measured: both sent values received: 2</T>
    </Svg>
  );
}

// ── 9 · That channel's own implementation is borrowed (takeaway) ───────────────────────────────
export function CrossbeamSourceReveal({ t, portrait }: StepCtx) {
  const left = easeOut(seg(t, 0.6, 1.0));
  const right = easeOut(seg(t, 0.8, 1.2));
  const port = easeInOut(seg(t, 1.4, 2.2));
  const lock = easeOut(seg(t, 2.2, 2.6));
  return (
    <Stack>
      {!portrait && <Code title="the std library's own source comment" lines={['// This module is used as the', '// implementation for sync::mpsc.', '// The implementation comes from', '// the crossbeam-channel crate:']} t={t} start={0.1} end={0.6} highlight={t > 1.4 ? [2, 3] : []} />}
      <Svg label="the channel core of the crossbeam-channel crate is carried into std as the implementation behind sync::mpsc" h={150} fill>
        <g transform={`translate(${((1 - left) * -30).toFixed(1)} 0)`} opacity={left}>
          <rect x={20} y={30} width={200} height={96} rx={10} fill="none" stroke={C.mocha} strokeWidth={1.5} />
          <T x={34} y={22} s={13} f={C.latte}>crossbeam-channel</T>
          <rect x={45} y={60} width={150} height={36} rx={7} fill={C.cocoa} stroke={C.crema} strokeWidth={1.5} />
          <T x={120} y={83} s={13} a="middle" f={C.crema}>channel core</T>
        </g>
        <g transform={`translate(${((1 - right) * 30).toFixed(1)} 0)`} opacity={right}>
          <rect x={380} y={30} width={200} height={96} rx={10} fill="none" stroke={lock > 0.5 ? C.caramel : C.mocha} strokeWidth={1.5} />
          <T x={394} y={22} s={13} f={C.latte}>std::sync::mpsc</T>
          <rect x={405} y={60} width={150} height={36} rx={7} fill="none" stroke={C.mocha} strokeDasharray="4 3" />
        </g>
        {port > 0 && (
          <g transform={`translate(${lerp(0, 360, port).toFixed(1)} ${(-Math.sin(port * Math.PI) * 30).toFixed(1)})`}>
            <rect x={45} y={60} width={150} height={36} rx={7} fill={C.cocoa} stroke={C.caramel} strokeWidth={2} />
            <T x={120} y={83} s={13} a="middle" f={C.caramel}>channel core</T>
          </g>
        )}
        <T x={300} y={146} s={13} a="middle" f={C.caramel} o={lock}>a direct port, not a new design</T>
      </Svg>
    </Stack>
  );
}

// ── 10 · Recap ───────────────────────────────────────────────────────────────────────────────────
export function Recap({ t }: StepCtx) {
  const rows = [
    'four crossing points, no more, no fewer',
    'spawn and tokio::spawn need Send + \'static',
    'scope trades that for a join guarantee',
    'mpsc is a crossbeam port, not bespoke',
  ];
  return <RecapList t={t} end={3} label="recap: where ownership crosses a thread boundary" rows={rows} step={55} />;
}
