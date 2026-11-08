import type { StepCtx } from '../../../../../reels/types';
import { easeInOut, easeOut, lerp, seg } from '../../../../../reels/anim';
import { Code } from '../../../../../reels/Code';
import { Decode, Draw, Reticle, Stack, Svg, T, C } from '../../../../../reels/kit';


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
      <Draw pts={[[26, y0 - 6], [26, yEnd + 6]]} t={t} from={start - 0.05} to={start + (rows.length - 1) * beat + 0.3} stroke={C.mocha} w={1.5} pen={false} />
      {rows.map(([r, good], i) => {
        const a = start + i * beat;
        const k = easeOut(seg(t, a, a + 0.45));
        const y = y0 + i * gap;
        const hot = i === lock;
        return (
          <g key={r}>
            <g opacity={k} transform={`translate(${((1 - k) * -24).toFixed(1)} 0)`}>
              <circle cx={26} cy={y} r={hot ? 6 : 4.5} fill={hot ? C.caramel : C.crema} />
              <T x={44} y={y + 5} s={13} f={hot ? C.caramel : C.crema} w={hot ? 700 : 500}>{r}</T>
            </g>
            {good ? <Tick x={554} y={y} k={easeOut(seg(t, a + 0.3, a + 0.65))} /> : <Cross x={556} y={y} k={easeOut(seg(t, a + 0.3, a + 0.65))} />}
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
  const n = 12, x0 = 40, cw = 42, cp = 5;
  const lane = (y: number, from: number, label: string, f: string) => {
    const p = seg(t, 0.3, 1.7);
    const reach = lerp(from, n, p);
    return (
      <g>
        <T x={x0} y={y - 10} s={13} f={f}>{label}</T>
        {Array.from({ length: n }, (_, i) => (
          <rect key={i} x={x0 + i * cw} y={y} width={cw - 6} height={22} rx={2} fill={i >= from && i < reach ? f : 'none'} stroke={C.mocha} />
        ))}
        {p > 0 && p < 1 && <line x1={x0 + reach * cw} y1={y - 4} x2={x0 + reach * cw} y2={y + 26} stroke={C.cinnamon} strokeWidth={2} />}
      </g>
    );
  };
  return (
    <Svg label="aries_analysis_redo_undo.rs, measured" h={260}>
      {lane(46, 0, 'full scan', C.latte)}
      {lane(126, cp, 'from the checkpoint', C.caramel)}
      <line x1={x0 + cp * cw - 3} y1={110} x2={x0 + cp * cw - 3} y2={156} stroke={C.caramel} strokeWidth={2.5} />
      <T x={x0 + cp * cw + 4} y={176} s={13} f={C.caramel} o={seg(t, 0.2, 0.4)}>checkpoint's bound</T>
      <Decode text="fewer records, same final state" t={t} at={1.9} dur={0.5} x={x0} y={232} s={15} f={C.caramel} w={700} />
      <Tick x={540} y={226} k={easeOut(seg(t, 2.3, 2.6))} />
    </Svg>
  );
}
// ── 6 · Measured: resumes exactly, one CLR per update (takeaway) ──────────
// Undo walks back over the loser's updates, writing a CLR for each. A second
// crash cuts it off partway. The next recovery reads the last CLR, jumps
// straight to where it stopped and carries on: no update is undone twice,
// so each one ends with exactly one CLR.

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
  const n = 4, x0 = 80, cw = 110;
  const undo1 = seg(t, 0.2, 0.9) * 2;
  const crash = 0.95;
  const undo2 = seg(t, 1.4, 2.1) * 2;
  const done = Math.floor(undo1) + Math.floor(undo2);
  return (
    <Svg label="aries_analysis_redo_undo.rs, measured" h={270}>
      <T x={x0} y={30} s={13} f={C.latte}>the loser's updates</T>
      {Array.from({ length: n }, (_, i) => {
        const x = x0 + (n - 1 - i) * cw;
        const undone = i < done;
        return (
          <g key={i}>
            <rect x={x} y={42} width={90} height={34} rx={4} fill="none" stroke={undone ? C.taupe : C.crema} strokeWidth={1.5} strokeDasharray={undone ? '4 3' : undefined} />
            {undone && <rect x={x + 30} y={lerp(42, 120, easeOut(seg(i < 2 ? undo1 : undo2, (i % 2) + 0.2, (i % 2) + 0.8)))} width={30} height={22} rx={3} fill="none" stroke={C.caramel} strokeWidth={2} />}
          </g>
        );
      })}
      <T x={x0} y={170} s={13} f={C.caramel} o={seg(t, 0.4, 0.6)}>one CLR each</T>
      <Draw pts={[[290, 20], [290, 200]]} t={t} from={crash} to={crash + 0.25} stroke={C.cherryText} w={2} />
      {t > crash + 0.25 && <T x={298} y={198} s={13} f={C.cherryText}>crash</T>}
      <Draw pts={[[290, 100], [235, 100], [235, 82]]} t={t} from={1.2} to={1.4} stroke={C.cinnamon} w={2} />
      <T x={150} y={216} s={13} f={C.cinnamon} o={seg(t, 1.2, 1.4)}>resumed right here</T>
      <Decode text="exactly one CLR per update" t={t} at={2.15} dur={0.45} x={x0} y={252} s={15} f={C.caramel} w={700} />
    </Svg>
  );
}
// ── 9 · Why steal + no-force is safe (surprising fact, takeaway) ──────────
// Two pages, two timings. An uncommitted page is stolen: written back
// early. A committed one is not forced: it stays only in memory. A crash
// hits; undo cleans the early page, redo rebuilds the late one, and both
// end correct.

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
  const steal = easeInOut(seg(t, 0.3, 0.8));
  const crash = 1.0;
  const fix1 = easeInOut(seg(t, 1.4, 1.9));
  const fix2 = easeInOut(seg(t, 1.7, 2.2));
  return (
    <Svg label="ARIES paper, quoted" h={260}>
      <T x={40} y={30} s={13} f={C.latte}>memory</T>
      <T x={40} y={170} s={13} f={C.latte}>disk</T>
      <line x1={40} y1={120} x2={560} y2={120} stroke={C.mocha} />
      {/* steal: the uncommitted page goes to disk early */}
      <rect x={120} y={lerp(46, 180, steal)} width={110} height={40} rx={4} fill="none" stroke={fix1 > 0 ? C.caramel : C.cinnamon} strokeWidth={2} />
      <T x={175} y={lerp(46, 180, steal) + 25} s={13} a="middle" f={fix1 > 0 ? C.caramel : C.cinnamon}>{fix1 >= 1 ? 'undone' : 'steal'}</T>
      {/* no-force: the committed page stays in memory, lost at the crash, then rebuilt on disk */}
      {t < crash + 0.2 && <rect x={360} y={46} width={110} height={40} rx={4} fill="none" stroke={C.crema} strokeWidth={2} opacity={1 - seg(t, crash, crash + 0.2)} />}
      {t < crash + 0.2 && <T x={415} y={71} s={13} a="middle" f={C.crema}>no-force</T>}
      {fix2 > 0 && <rect x={360} y={180} width={110 * fix2} height={40} rx={4} fill="none" stroke={C.caramel} strokeWidth={2} />}
      {fix2 >= 1 && <T x={415} y={205} s={13} a="middle" f={C.caramel}>redone</T>}
      <Draw pts={[[40, 100], [560, 100]]} t={t} from={crash} to={crash + 0.25} stroke={C.cherryText} w={2} />
      <T x={560} y={92} s={13} a="end" f={C.cherryText} o={seg(t, crash + 0.2, crash + 0.3)}>crash</T>
      <Decode text="both fixed up" t={t} at={2.2} dur={0.4} x={300} y={252} s={15} a="middle" f={C.caramel} w={700} />
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
