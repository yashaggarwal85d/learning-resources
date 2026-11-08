import { useEffect, useState } from 'react';
import type { StepCtx } from '../../../../../reels/types';
import { easeInOut, easeOut, easeOutBack, lerp, seg } from '../../../../../reels/anim';
import { Code } from '../../../../../reels/Code';
import { C, Decode, Draw, Reticle, Stack, Svg, T } from '../../../../../reels/kit';

// The topic's own idea: a caller's stack frame drawn as a bracket that closes, against a thread's own
// timeline drawn as a line that keeps going past it. thread::scope redraws the same bracket so it only
// closes once the thread's line has already stopped. The Drop-guard steps reuse a small "guard box" that
// either fires (prints "joined") or is forgotten (greyed out, no print). Every snippet is an exact line
// of examples/*.rs or the quoted std/tokio signature; every claim is executed by examples.py.

const fa = (t: number, a: number, d = 0.4) => easeOut(seg(t, a, a + d));

function FrameBracket({ x1, x2, y, t, from, to, label }: { x1: number; x2: number; y: number; t: number; from: number; to: number; label: string }) {
  const k = fa(t, from, 0.4);
  return (
    <g opacity={k}>
      <line x1={x1} y1={y} x2={x2} y2={y} stroke={C.mocha} strokeWidth={2} />
      <line x1={x1} y1={y - 8} x2={x1} y2={y + 8} stroke={C.mocha} strokeWidth={2} />
      <line x1={x2} y1={y - 8} x2={x2} y2={y + 8} stroke={C.mocha} strokeWidth={2} />
      <T x={(x1 + x2) / 2} y={y - 16} s={13} a="middle" f={C.taupe}>{label}</T>
    </g>
  );
}

function ThreadLine({ x1, x2, y, t, from, to, stopAt, color = C.caramel }: { x1: number; x2: number; y: number; t: number; from: number; to: number; stopAt?: number; color?: string }) {
  const end = stopAt ?? x2;
  const k = easeOut(seg(t, from, to));
  if (k <= 0) return null;
  const xk = x1 + (end - x1) * k;
  return (
    <g>
      <line x1={x1} y1={y} x2={xk} y2={y} stroke={color} strokeWidth={3} />
      <circle cx={x1} cy={y} r={4} fill={color} />
      {k >= 0.98 && end === x2 && <circle cx={x2} cy={y} r={4} fill={color} />}
    </g>
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

// ── 1 · A thread can outlive the frame that made it ─────────────────────────────────────────────────────────────
export function ThreadOutlivesFrame({ t }: StepCtx) {
  return (
    <Svg label="the caller's stack frame closes while the spawned thread's own timeline keeps running" h={340}>
      <T x={40} y={36} s={14} f={C.crema}>caller's stack frame</T>
      <FrameBracket x1={40} x2={300} y={90} t={t} from={0.1} to={0.5} label="main() returns here" />
      <T x={40} y={170} s={14} f={C.crema} o={fa(t, 0.9, 0.4)}>the spawned thread</T>
      <g opacity={fa(t, 0.9, 0.4)}>
        <ThreadLine x1={40} x2={520} y={210} t={t} from={1.3} to={3.0} />
      </g>
      <T x={40} y={250} s={13} f={C.cherryText} o={fa(t, 2.0, 0.4)}>still running after the frame above has closed</T>
      <T x={40} y={300} s={14} f={C.caramel} o={fa(t, 2.6, 0.4)}>F: Send + 'static — enforced, not a preference</T>
    </Svg>
  );
}

// ── 2 · Borrow a local, then spawn (predict) ─────────────────────────────────────────────────────────────────────
export function SpawnBorrow({ t, answer, portrait }: StepCtx) {
  const ans = answer !== null;
  const s = useSinceAnswer(ans);
  const frame = easeOut(seg(t, 0.3, 0.8));
  const thr = easeOut(seg(t, 0.8, 1.55));
  const past = ans ? easeOut(seg(s, 0.1, 0.6)) : 0;
  const flag = ans ? easeOutBack(seg(s, 0.6, 0.9)) : 0;
  return (
    <Stack>
      {!portrait && <Code title="the attempt" lines={['let count = 42;', 'thread::spawn(|| {', '    println!("{count}");', '});']} t={t} start={0.1} end={0.8} highlight={[1, 2]} />}
      <Svg label="count lives in the function's frame; the spawned thread borrows it and may keep running after the frame closes, so the compiler rejects it with E0373" h={190} fill>
        <T x={40} y={24} s={13} f={C.taupe} o={frame}>the function's frame</T>
        <line x1={40} y1={44} x2={lerp(40, 330, frame)} y2={44} stroke={C.mocha} strokeWidth={2} />
        <line x1={40} y1={36} x2={40} y2={52} stroke={C.mocha} strokeWidth={2} opacity={frame} />
        {frame > 0.98 && <line x1={330} y1={36} x2={330} y2={52} stroke={past > 0.5 ? C.cherryText : C.mocha} strokeWidth={2} />}
        <rect x={60} y={64} width={110} height={34} rx={7} fill={C.cocoa} stroke={C.mocha} strokeWidth={1.5} opacity={frame} />
        <T x={115} y={86} s={14} a="middle" f={C.crema} o={frame}>count</T>
        <T x={200} y={176} s={13} f={C.taupe} o={thr}>spawned thread</T>
        {thr > 0 && (
          <g>
            <line x1={200} y1={146} x2={lerp(200, 560, thr)} y2={146} stroke={C.caramel} strokeWidth={3} />
            <circle cx={200} cy={146} r={4} fill={C.caramel} />
            <Draw pts={[[230, 146], [230, 120], [115, 120], [115, 98]]} t={t} from={1.0} to={1.5} stroke={past > 0.5 ? C.cherryText : C.latte} w={2} dash="5 4" pen={false} />
          </g>
        )}
        {ans && (
          <g>
            <line x1={330} y1={56} x2={330} y2={lerp(56, 160, past)} stroke={C.cherryText} strokeWidth={1.5} strokeDasharray="4 4" />
            {flag > 0 && (
              <g transform={`translate(460 92) scale(${flag.toFixed(3)}) translate(-460 -92)`}>
                <T x={460} y={98} s={15} a="middle" f={C.cherryText} w={700}>E0373</T>
              </g>
            )}
            <Reticle x={460} y={92} w={120} h={40} t={s} at={0.7} color={C.cherryText} />
          </g>
        )}
      </Svg>
    </Stack>
  );
}

// ── 3 · The compiler's own reason ────────────────────────────────────────────────────────────────────────────────
export function SpawnBorrowError({ t }: StepCtx) {
  return (
    <Stack>
      <Code title="examples/spawn_borrow_fail.rs" lines={['thread::spawn(|| {', '    println!("{count}");', '});']} t={t} start={0.1} end={1.1} highlight={[0]} />
      <div style={{ opacity: fa(t, 1.3, 0.4) }}>
        <Code title="rustc" lines={['error[E0373]: closure may outlive the current function', 'count is borrowed here; it is owned by the current function']} t={t} start={1.3} end={2.2} highlight={[0, 1]} />
      </div>
    </Stack>
  );
}

// ── 4 · thread::scope makes the same borrow sound ───────────────────────────────────────────────────────────────
export function ScopeBorrow({ t }: StepCtx) {
  return (
    <Svg label="thread::scope widens the caller's own frame until every scoped thread has joined" h={340}>
      <T x={40} y={36} s={14} f={C.crema}>thread::scope(|s| ...)</T>
      <g opacity={fa(t, 0.2, 0.4)}>
        <ThreadLine x1={160} x2={420} y={110} t={t} from={0.5} to={1.6} stopAt={420} />
        <T x={430} y={115} s={13} f={C.taupe}>s.spawn(...)</T>
      </g>
      <FrameBracket x1={40} x2={500} y={170} t={t} from={2.0} to={2.4} label="scope() does not return until this line" />
      <T x={40} y={230} s={13} f={C.caramel} o={fa(t, 2.6, 0.4)}>the borrow outlives the thread, not the other way around</T>
      <T x={40} y={270} s={13} f={C.taupe} o={fa(t, 3.0, 0.4)}>count is still readable once scope() returns</T>
    </Svg>
  );
}

// ── 5 · Needs to outlive the function? Clone an Arc instead (predict) ──────────────────────────────────────────────
export function ArcMove({ t, answer, portrait }: StepCtx) {
  const ans = answer !== null;
  const s = useSinceAnswer(ans);
  const heap = easeOut(seg(t, 0.4, 0.8));
  const clone = easeOutBack(seg(t, 0.9, 1.3));
  const go = ans ? easeInOut(seg(s, 0.1, 0.8)) : 0; // the clone moves into the thread
  const close = ans ? easeOut(seg(s, 0.9, 1.3)) : 0; // the function returns
  const run = ans ? easeOut(seg(s, 1.0, 2.2)) : 0;
  const hx = lerp(150, 470, go);
  const hy = lerp(100, 150, go);
  return (
    <Stack>
      {!portrait && <Code
        title="examples/arc_move_ok.rs"
        lines={['fn spawn_incrementer(counter: Arc<Mutex<i32>>) -> JoinHandle<()> {', '    let counter = Arc::clone(&counter);', '    thread::spawn(move || {', '        *counter.lock().unwrap() += 1;', '    })', '}']}
        t={t}
        start={0.1}
        end={0.9}
        highlight={[1, 2]}
      />}
      <Svg label="the Arc clone is moved into the thread; the function returns and its frame closes, while the thread keeps its own owned handle to the shared counter" h={200} fill>
        <g opacity={heap}>
          <rect x={250} y={14} width={150} height={38} rx={8} fill={C.cocoa} stroke={C.caramel} strokeWidth={1.5} />
          <T x={325} y={38} s={13} a="middle" f={C.crema}>Mutex&lt;i32&gt;</T>
        </g>
        <g opacity={1 - close * 0.75}>
          <rect x={30} y={76} width={240} height={50} rx={8} fill="none" stroke={close > 0.5 ? C.taupe : C.mocha} strokeWidth={1.5} strokeDasharray={close > 0.5 ? '5 4' : undefined} />
          <T x={40} y={146} s={13} f={C.taupe}>{close > 0.5 ? 'frame: returned' : 'spawn_incrementer'}</T>
          <circle cx={60} cy={100} r={7} fill={C.latte} />
          <line x1={60} y1={93} x2={280} y2={52} stroke={C.latte} strokeWidth={1.5} />
        </g>
        {clone > 0 && (
          <g>
            <line x1={hx} y1={hy - 7} x2={325} y2={52} stroke={C.caramel} strokeWidth={2} />
            <g transform={`translate(${hx} ${hy}) scale(${clone.toFixed(3)})`}>
              <circle r={8} fill={C.caramel} />
            </g>
            <T x={hx + 14} y={hy + 5} s={13} f={C.caramel}>clone</T>
          </g>
        )}
        {ans && (
          <g opacity={go > 0.6 ? 1 : 0}>
            <line x1={470} y1={176} x2={lerp(470, 580, run)} y2={176} stroke={C.caramel} strokeWidth={3} />
            <line x1={330} y1={176} x2={470} y2={176} stroke={C.caramel} strokeWidth={3} />
            <circle cx={330} cy={176} r={4} fill={C.caramel} />
            <T x={330} y={196} s={13} f={C.latte}>thread, still running</T>
          </g>
        )}
      </Svg>
    </Stack>
  );
}

// ── 6 · An owned Arc already satisfies 'static ──────────────────────────────────────────────────────────────────
export function ArcSatisfiesStatic({ t }: StepCtx) {
  return (
    <Svg label="a moved, owned Arc has no borrow inside it, so the static bound costs nothing" h={340}>
      <rect x={60} y={40} width={200} height={90} rx={10} fill="none" stroke={C.mocha} strokeWidth={1.5} />
      <T x={160} y={75} s={14} a="middle" f={C.crema}>Arc&lt;Mutex&lt;i32&gt;&gt;</T>
      <T x={160} y={98} s={12} a="middle" f={C.taupe}>owned, not borrowed</T>
      <g opacity={fa(t, 0.4, 0.4)}>
        <Draw pts={[[280, 85], [380, 85]]} t={t} from={0.4} to={0.8} stroke={C.caramel} w={2.5} pen={false} />
        <T x={330} y={70} s={12} a="middle" f={C.caramel}>move</T>
      </g>
      <rect x={380} y={40} width={200} height={90} rx={10} fill="none" stroke={C.caramel} strokeWidth={2} opacity={fa(t, 0.8, 0.4)} />
      <T x={480} y={75} s={14} a="middle" f={C.crema} o={fa(t, 0.8, 0.4)}>spawned thread</T>
      <T x={480} y={98} s={12} a="middle" f={C.taupe} o={fa(t, 0.8, 0.4)}>same Arc, refcount 2</T>
      <T x={60} y={190} s={13} f={C.caramel} o={fa(t, 1.4, 0.4)}>'static asks what is owned, not when it returns</T>
      <T x={60} y={230} s={13} f={C.taupe} o={fa(t, 2.0, 0.4)}>no reference inside, so the bound was already true</T>
    </Svg>
  );
}

// ── 7 · tokio::spawn asks for the identical bound ───────────────────────────────────────────────────────────────
export function TokioSpawn({ t }: StepCtx) {
  const copy = easeInOut(seg(t, 1.0, 1.7));
  const scope = easeOut(seg(t, 1.9, 2.4));
  const miss = easeOutBack(seg(t, 2.4, 2.8));
  return (
    <Stack>
      <Code
        title="tokio::task::spawn's own signature"
        lines={['pub fn spawn<F>(future: F) -> JoinHandle<F::Output>', 'where', "    F: Future + Send + 'static,", "    F::Output: Send + 'static,"]}
        t={t}
        start={0.1}
        end={0.9}
        highlight={t > 1.0 ? [2, 3] : []}
      />
      <Svg label="the Send plus 'static bound slides from thread::spawn to tokio::spawn unchanged; threads have thread::scope, async has no sound equivalent" h={160} fill>
        <T x={20} y={46} s={13} f={C.latte}>threads</T>
        <T x={20} y={116} s={13} f={C.latte}>async</T>
        <rect x={120} y={22} width={160} height={36} rx={7} fill={C.cocoa} stroke={C.caramel} strokeWidth={1.5} />
        <T x={200} y={45} s={13} a="middle" f={C.crema}>{"Send + 'static"}</T>
        {copy > 0 && (
          <g transform={`translate(0 ${(copy * 70).toFixed(1)})`} opacity={copy}>
            <rect x={120} y={22} width={160} height={36} rx={7} fill={C.cocoa} stroke={C.caramel} strokeWidth={1.5} />
            <T x={200} y={45} s={13} a="middle" f={C.crema}>{"Send + 'static"}</T>
          </g>
        )}
        <g transform={`translate(${((1 - scope) * 30).toFixed(1)} 0)`} opacity={scope}>
          <rect x={320} y={22} width={200} height={36} rx={7} fill={C.cocoa} stroke={C.mocha} strokeWidth={1.5} />
          <T x={420} y={45} s={13} a="middle" f={C.crema}>thread::scope</T>
        </g>
        <rect x={320} y={92} width={200} height={36} rx={7} fill="none" stroke={miss > 0 ? C.cherryText : C.mocha} strokeWidth={1.5} strokeDasharray="5 4" opacity={scope} />
        {miss > 0 && (
          <g transform={`translate(420 110) scale(${miss.toFixed(3)}) translate(-420 -110)`}>
            <T x={420} y={115} s={14} a="middle" f={C.cherryText} w={700}>no sound scope</T>
          </g>
        )}
      </Svg>
    </Stack>
  );
}

// ── 8 · Could a scoped async spawn ever be sound? (predict) ────────────────────────────────────────────────────
export function AsyncScopeGuard({ t }: StepCtx) {
  return (
    <Svg label="a hypothetical async scope promises the spawned task is done once its guard drops" h={340}>
      <rect x={60} y={60} width={220} height={80} rx={10} fill="none" stroke={C.mocha} strokeWidth={1.5} />
      <T x={170} y={95} s={14} a="middle" f={C.crema}>guard: JoinOnDrop</T>
      <T x={170} y={118} s={12} a="middle" f={C.taupe}>Drop prints "joined"</T>
      <g opacity={fa(t, 0.5, 0.4)}>
        <Draw pts={[[300, 100], [400, 100]]} t={t} from={0.5} to={0.9} stroke={C.taupe} w={2} dash="4 4" pen={false} />
        <T x={350} y={85} s={12} a="middle" f={C.taupe}>promises</T>
      </g>
      <T x={60} y={180} s={14} f={C.crema} o={fa(t, 0.9, 0.4)}>the spawned task has finished</T>
      <T x={60} y={220} s={14} f={C.caramel} o={fa(t, 1.6, 0.4)}>can ordinary safe code break that promise?</T>
    </Svg>
  );
}

// ── 9 · mem::forget is exactly the hole ─────────────────────────────────────────────────────────────────────────
export function ForgetDefeatsGuard({ t }: StepCtx) {
  const make = easeOutBack(seg(t, 0.4, 0.8));
  const pull = easeInOut(seg(t, 1.2, 2.0)); // mem::forget swallows it
  const out1 = easeOut(seg(t, 1.0, 1.3));
  const gap = easeOut(seg(t, 2.2, 2.6));
  const k = make * (1 - pull);
  return (
    <Stack>
      <Code title="examples/forget_defeats_guard.rs" lines={['let guard = JoinOnDrop { label: "scoped-task" };', 'mem::forget(guard);']} t={t} start={0.1} end={0.7} highlight={t > 1.2 ? [1] : []} />
      <Svg label="mem::forget swallows the guard without running its Drop, so the joined line never prints: safe code skipped the join" h={200} fill>
        <circle cx={480} cy={60} r={30} fill={C.void} stroke={C.mocha} strokeWidth={1.5} strokeDasharray="4 3" opacity={easeOut(seg(t, 0.9, 1.2))} />
        <T x={480} y={112} s={13} a="middle" f={C.taupe} o={easeOut(seg(t, 0.9, 1.2))}>mem::forget</T>
        {k > 0.01 && (
          <g transform={`translate(${lerp(140, 480, pull).toFixed(1)} 60) scale(${k.toFixed(3)})`}>
            <rect x={-90} y={-24} width={180} height={48} rx={8} fill={C.cocoa} stroke={C.caramel} strokeWidth={1.5} />
            <T x={0} y={5} s={13} a="middle" f={C.crema}>guard: Drop joins</T>
          </g>
        )}
        <rect x={20} y={130} width={560} height={62} rx={6} fill={C.panel} stroke={C.mocha} strokeWidth={1} opacity={out1} />
        <T x={34} y={154} s={13} f={C.latte} o={out1}>about to forget the guard</T>
        {gap > 0 && (
          <g>
            <rect x={34} y={166} width={lerp(0, 200, gap)} height={16} rx={2} fill="none" stroke={C.cherryText} strokeDasharray="4 3" />
            <T x={250} y={180} s={13} f={C.cherryText} o={gap}>no "joined" line</T>
          </g>
        )}
        <Reticle x={134} y={174} w={220} h={30} t={t} at={2.7} color={C.cherryText} />
      </Svg>
    </Stack>
  );
}

// ── 10 · Recap ──────────────────────────────────────────────────────────────────────────────────────────────────
export function Recap({ t }: StepCtx) {
  return (
    <RecapList
      t={t}
      end={2.8}
      label="recap: static on spawn, thread::scope's join guarantee, Arc, and why async has no sound scope"
      rows={["spawn needs 'static: threads outlive their frame", 'thread::scope: sound by joining before it returns', "an owned Arc satisfies 'static for free", 'tokio::spawn: same bound, no sound scope', 'mem::forget defeats any Drop-based join']}
      s={14}
    />
  );
}
