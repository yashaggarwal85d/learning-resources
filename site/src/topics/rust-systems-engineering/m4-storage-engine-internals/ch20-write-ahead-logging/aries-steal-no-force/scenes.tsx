import type { StepCtx } from '../../../../../reels/types';
import { easeInOut, easeOut, lerp, seg } from '../../../../../reels/anim';
import { Code } from '../../../../../reels/Code';
import { Draw, Reticle, Stack, Svg, T, C } from '../../../../../reels/kit';


/** A check mark that draws itself over `k` (0..1). */
const Tick = ({ x, y, k, f = C.focus }: { x: number; y: number; k: number; f?: string }) =>
  k > 0 ? <path d={`M${x} ${y} l6 6 l12 -14`} fill="none" stroke={f} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" strokeDasharray={30} strokeDashoffset={30 * (1 - k)} /> : null;
/** A cross that draws itself over `k`. */
const Cross = ({ x, y, k, f = C.cherryText }: { x: number; y: number; k: number; f?: string }) =>
  k > 0 ? (
    <g stroke={f} strokeWidth={2.5} strokeLinecap="round">
      <line x1={x} y1={y - 7} x2={x + 14 * Math.min(1, k * 2)} y2={y - 7 + 14 * Math.min(1, k * 2)} />
      {k > 0.5 && <line x1={x + 14} y1={y - 7} x2={x + 14 - 14 * (k - 0.5) * 2} y2={y - 7 + 14 * (k - 0.5) * 2} />}
    </g>
  ) : null;

/** Recap rows: each slides in on its beat with its verdict drawing at the right; a spine draws down the left
 * through them, and the lock-on lands on row `lock` at `lockAt` (finished 0.55 s later, inside the step). `y0` is the first row's centre. */
function RecapRows({ t, rows, y0 = 40, gap = 56, start = 0.2, beat = 0.45, lock = 0, lockAt }: { t: number; rows: [string, boolean][]; y0?: number; gap?: number; start?: number; beat?: number; lock?: number; lockAt: number }) {
  const yEnd = y0 + (rows.length - 1) * gap;
  return (
    <g>
      <Draw pts={[[30, y0 - 6], [30, yEnd + 6]]} t={t} from={start - 0.05} to={start + (rows.length - 1) * beat + 0.3} stroke={C.mocha} w={1.5} pen={false} />
      {rows.map(([r, good], i) => {
        const a = start + i * beat;
        const k = easeOut(seg(t, a, a + 0.45));
        const y = y0 + i * gap;
        const hot = i === lock;
        return (
          <g key={r}>
            <g opacity={k} transform={`translate(${((1 - k) * -24).toFixed(1)} 0)`}>
              <circle cx={30} cy={y} r={hot ? 6 : 4.5} fill={hot ? C.caramel : C.crema} />
              <T x={50} y={y + 5} s={13} f={hot ? C.caramel : C.crema} w={hot ? 700 : 500}>{r}</T>
            </g>
            {good ? <Tick x={548} y={y} k={easeOut(seg(t, a + 0.3, a + 0.65))} /> : <Cross x={548} y={y} k={easeOut(seg(t, a + 0.3, a + 0.65))} />}
          </g>
        );
      })}
      <Reticle x={292} y={y0 + lock * gap} w={556} h={gap - 14} t={t} at={lockAt} />
    </g>
  );
}

// Redo repeats history for everyone first, winners and losers alike. A
// fuzzy checkpoint's own dirty-page bound lets it skip what's already
// durable without skipping anything it needs. And a compensation log
// record bounds undo's own work across repeated failures, which is
// exactly what makes steal and no-force, the high-performance buffer
// policy, safe.
const fa = (t: number, a: number, d = 0.4) => easeOut(seg(t, a, a + d));

// ── 1 · Does redo apply committed, uncommitted, or both (predict, hook) ──
export function RedoScopePredict({ t }: StepCtx) {
  return (
    <Stack>
      <Code
        title="one committed txn, one that never did"
        lines={['redo(&wal, start_lsn, &mut pages);', "// which transaction's own updates land?"]}
        t={t}
        start={0.1}
        end={2.6}
        highlight={[1]}
      />
    </Stack>
  );
}

// ── 2 · Measured: both, genuinely (takeaway) ───────────────────────────────
export function RedoScopeReveal({ t }: StepCtx) {
  const cells: { kind: 'upd' | 'commit'; win: boolean }[] = [
    { kind: 'upd', win: true },
    { kind: 'upd', win: false },
    { kind: 'commit', win: true },
    { kind: 'upd', win: false },
    { kind: 'upd', win: true },
  ];
  const x0 = 70, cw = 92;
  const sweep = easeInOut(seg(t, 0.4, 2.2));
  const cursor = lerp(x0 - 10, x0 + cells.length * cw, sweep);
  let page = 0;
  return (
    <Svg label="aries_analysis_redo_undo.rs, measured" h={270}>
      <T x={x0} y={28} s={13} f={C.taupe}>log</T>
      <T x={x0} y={168} s={13} f={C.taupe}>pages, after redo</T>
      {cells.map((c, i) => {
        const x = x0 + i * cw;
        const col = c.win ? C.crema : C.cinnamon;
        const landed = c.kind === 'upd' ? page++ : -1;
        const hit = easeOut(seg(cursor, x + cw / 2 - 20, x + cw / 2 + 40));
        const px = x0 + landed * 115;
        return (
          <g key={i} opacity={easeOut(seg(t, 0.05 + i * 0.06, 0.35 + i * 0.06))}>
            <rect x={x + 4} y={42} width={cw - 8} height={40} rx={4} fill="none" stroke={col} strokeWidth={1.5} />
            <T x={x + cw / 2} y={67} s={13} a="middle" f={col}>{c.kind}</T>
            {c.kind === 'upd' && hit > 0 && (
              <rect x={lerp(x + cw / 2 - 12, px + 44, hit)} y={lerp(52, 186, hit)} width={24} height={20} rx={3} fill={col} />
            )}
            {c.kind === 'upd' && <rect x={px + 30} y={180} width={52} height={32} rx={4} fill="none" stroke={C.mocha} />}
          </g>
        );
      })}
      {sweep > 0 && sweep < 1 && <line x1={cursor} y1={34} x2={cursor} y2={92} stroke={C.caramel} strokeWidth={2} />}
      {sweep > 0 && <T x={Math.min(cursor, 520)} y={110} s={13} a="middle" f={C.caramel} o={1 - seg(t, 2.1, 2.3)}>redo</T>}
      <circle cx={x0 + 6} cy={242} r={5} fill={C.crema} opacity={seg(t, 2.2, 2.5)} />
      <T x={x0 + 18} y={247} s={13} f={C.crema} o={seg(t, 2.2, 2.5)}>committed</T>
      <circle cx={x0 + 206} cy={242} r={5} fill={C.cinnamon} opacity={seg(t, 2.3, 2.6)} />
      <T x={x0 + 218} y={247} s={13} f={C.cinnamon} o={seg(t, 2.3, 2.6)}>uncommitted: reapplied too</T>
      <Reticle x={x0 + 171} y={196} w={70} h={46} t={t} at={2.4} />
    </Svg>
  );
}
// ── 8 · The paper's own words on CLRs (connecting step, NO takeaway) ──────
// An update, then the CLR that undoes it: the undo arrow draws back from the
// CLR onto the update. Then a later undo pass reaches the CLR itself and is
// turned away, and a redo arrow runs straight through it instead.

// ── 3 · Does a checkpoint-bounded redo still reach the right state (predict) ──
export function CheckpointPredict({ t }: StepCtx) {
  return (
    <Stack>
      <Code
        title="one page already durable at checkpoint time"
        lines={['redo(&wal, checkpoint_redo_lsn, &mut pages);', '// correct, or missing something older?']}
        t={t}
        start={0.1}
        end={2.6}
        highlight={[1]}
      />
    </Stack>
  );
}

// ── 4 · Measured: fewer records, identical state (takeaway) ───────────────
export function CheckpointReveal({ t }: StepCtx) {
  const full = easeOut(seg(t, 0.4, 0.7));
  const bounded = easeOut(seg(t, 0.8, 1.1));
  return (
    <Svg label="aries_analysis_redo_undo.rs, measured" h={200}>
      <T x={60} y={60} s={14} f={C.crema} o={fa(t, 0.3, 0.4)}>a full scan, and a bounded one</T>
      <rect x={60} y={68} width={full * 260} height={8} rx={2} fill={C.taupe} opacity={0.7} />
      <rect x={60} y={79} width={bounded * 90} height={8} rx={2} fill={C.caramel} opacity={0.8} />
      <rect x={60} y={90} width={260} height={39} rx={6} fill="none" stroke={C.caramel} strokeWidth={2} />
      {fa(t, 1.2, 0.4) > 0.85 && <T x={190} y={114} s={13} a="middle" f={C.mocha}>fewer records, same final state</T>}
      <T x={60} y={160} s={13} f={C.latte} o={fa(t, 1.6, 0.4)}>skips only what's already durable</T>
    </Svg>
  );
}

// ── 5 · Does a second crash mid-undo repeat, skip, or resume (predict) ────
export function ClrPredict({ t }: StepCtx) {
  return (
    <Stack>
      <Code
        title="one CLR written, then a second crash"
        lines={['undo_one_txn(&mut wal, t2, cursor, &mut pages);', '// repeats, skips ahead, or resumes exactly?']}
        t={t}
        start={0.1}
        end={2.6}
        highlight={[1]}
      />
    </Stack>
  );
}

// ── 6 · Measured: resumes exactly, one CLR per update (takeaway) ──────────
export function ClrReveal({ t }: StepCtx) {
  const resume = easeOut(seg(t, 0.5, 0.85));
  const dx = resume * 60;
  return (
    <Svg label="aries_analysis_redo_undo.rs, measured" h={200}>
      <T x={60} y={60} s={14} f={C.crema} o={fa(t, 0.3, 0.4)}>two recovery attempts, one loser txn</T>
      <circle cx={200} cy={76} r={4} fill={C.taupe} />
      <circle cx={200 + dx} cy={76} r={4} fill="none" stroke={C.caramel} strokeWidth={1.5} opacity={fa(t, 0.5, 0.2)} />
      <rect x={60} y={85} width={260} height={44} rx={6} fill="none" stroke={C.caramel} strokeWidth={2} />
      {fa(t, 1.0, 0.4) > 0.85 && <T x={190} y={112} s={13} a="middle" f={C.mocha}>exactly one CLR per update, total</T>}
      <T x={60} y={160} s={13} f={C.latte} o={fa(t, 1.5, 0.4)}>resumed right where the first one stopped</T>
    </Svg>
  );
}

// ── 7 · Is a CLR's own effect ever itself undone (predict) ────────────────
export function PaperClrPredict({ t }: StepCtx) {
  return (
    <Stack>
      <Code
        title="the paper's own term for this record"
        lines={['// compensation log record (CLR)', '// is a CLR itself ever undone later?']}
        t={t}
        start={0.1}
        end={2.6}
        highlight={[1]}
      />
    </Stack>
  );
}

// ── 8 · The paper's own words on CLRs (connecting step, NO takeaway) ──────
export function PaperClrReveal({ t }: StepCtx) {
  const clrIn = easeOut(seg(t, 0.4, 0.8));
  const refused = easeOut(seg(t, 1.5, 1.8));
  return (
    <Svg label="ARIES paper, quoted" h={265}>
      <rect x={90} y={50} width={130} height={44} rx={5} fill="none" stroke={C.crema} strokeWidth={1.5} opacity={seg(t, 0.1, 0.4)} />
      <T x={155} y={77} s={13} a="middle" f={C.crema} o={seg(t, 0.1, 0.4)}>update</T>
      <g transform={`translate(${lerp(120, 0, clrIn).toFixed(1)} 0)`} opacity={clrIn}>
        <rect x={330} y={50} width={130} height={44} rx={5} fill="none" stroke={C.caramel} strokeWidth={2} />
        <T x={395} y={77} s={15} a="middle" f={C.caramel} w={700}>CLR</T>
      </g>
      {/* the CLR undoes the update */}
      <Draw pts={[[395, 48], [395, 28], [155, 28], [155, 46]]} t={t} from={0.8} to={1.25} stroke={C.crema} w={2} />
      {t > 1.25 && <T x={275} y={20} s={13} a="middle" f={C.latte}>undoes</T>}
      {/* a later undo pass is turned away at the CLR */}
      <Draw pts={[[575, 132], [468, 92]]} t={t} from={1.3} to={1.55} stroke={C.latte} w={2} dash="5 4" />
      <Cross x={505} y={116} k={refused} f={C.crema} />
      {/* ...and redo runs straight through it */}
      <Draw pts={[[60, 150], [520, 150]]} t={t} from={1.7} to={2.2} stroke={C.caramel} w={2} />
      {t > 2.2 && <T x={60} y={172} s={13} f={C.latte}>redo-only</T>}
      <T x={40} y={208} s={13} f={C.crema} o={seg(t, 1.3, 1.6)}>“never undone”</T>
      <Draw pts={[[40, 216], [168, 216]]} t={t} from={1.55} to={1.9} stroke={C.caramel} w={1.5} pen={false} />
      <T x={40} y={246} s={13} f={C.crema} o={seg(t, 1.9, 2.2)}>“redo-only log records”</T>
      <Draw pts={[[40, 254], [240, 254]]} t={t} from={2.1} to={2.5} stroke={C.caramel} w={1.5} pen={false} />
    </Svg>
  );
}
// ── 10 · Recap ──────────────────────────────────────────────────────────────
// The whole recovery on one log tape: redo sweeps forward from the
// checkpoint's bound, undo walks back over the loser leaving CLRs; then
// the lessons land beneath it, one per beat.

// ── 9 · Why steal + no-force is safe (surprising fact, takeaway) ──────────
export function StealNoForceReveal({ t }: StepCtx) {
  return (
    <Svg label="ARIES paper, quoted" h={200}>
      <T x={60} y={60} s={14} f={C.crema} o={fa(t, 0.3, 0.4)}>steal: early write-back. no-force: late</T>
      <Draw pts={[[200, 76], [240, 76]]} t={t} from={0.5} to={0.75} stroke={C.caramel} w={2} />
      <Draw pts={[[240, 76], [280, 76]]} t={t} from={0.75} to={1.0} stroke={C.taupe} w={2} />
      <rect x={60} y={85} width={260} height={44} rx={6} fill="none" stroke={C.caramel} strokeWidth={2} />
      {fa(t, 1.1, 0.4) > 0.85 && <T x={190} y={112} s={13} a="middle" f={C.mocha}>redo and undo fix up either case</T>}
      <T x={60} y={160} s={13} f={C.latte} o={fa(t, 1.5, 0.4)}>that freedom is why it's the fast policy</T>
    </Svg>
  );
}

// ── 10 · Recap ──────────────────────────────────────────────────────────────
export function Recap({ t }: StepCtx) {
  const redo = easeInOut(seg(t, 0.2, 0.9));
  const undo = easeInOut(seg(t, 0.9, 1.4));
  return (
    <Svg label="recap: who redoes, who undoes, and why" h={320}>
      <rect x={40} y={20} width={520} height={26} rx={4} fill="none" stroke={C.mocha} />
      <line x1={190} y1={14} x2={190} y2={52} stroke={C.latte} strokeWidth={1.5} />
      <T x={190} y={68} s={13} a="middle" f={C.latte}>checkpoint</T>
      {redo > 0 && <rect x={190} y={24} width={370 * redo} height={8} rx={2} fill={C.caramel} />}
      {undo > 0 && <rect x={560 - 150 * undo} y={35} width={150 * undo} height={8} rx={2} fill={C.cinnamon} />}
      <T x={555} y={68} s={13} a="end" f={C.cinnamon} o={seg(t, 1.2, 1.4)}>undo</T>
      <T x={300} y={68} s={13} a="middle" f={C.caramel} o={seg(t, 0.6, 0.8)}>redo</T>
      <RecapRows
        t={t}
        y0={112}
        gap={52}
        start={1.0}
        beat={0.3}
        lockAt={2.4}
        rows={[
          ['redo repeats history for everyone first', true],
          ["a checkpoint's bound skips only what's durable", true],
          ['a CLR bounds undo across repeated failures', true],
          ['that is why steal and no-force are safe', true],
        ]}
        lock={3}
      />
    </Svg>
  );
}
