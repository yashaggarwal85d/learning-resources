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

/** A row version in a chain: a box with its label, the newest drawn dashed while uncommitted. */
function Version({ x, y, label, sub, f = C.crema, dashed = false, o = 1, w = 150 }: { x: number; y: number; label: string; sub?: string; f?: string; dashed?: boolean; o?: number; w?: number }) {
  return (
    <g opacity={o}>
      <rect x={x} y={y} width={w} height={46} rx={5} fill="none" stroke={f} strokeWidth={1.8} strokeDasharray={dashed ? '5 4' : undefined} />
      <T x={x + w / 2} y={y + 28} s={14} a="middle" f={f}>{label}</T>
      {sub && <T x={x + w / 2} y={y + 68} s={13} a="middle" f={C.taupe}>{sub}</T>}
    </g>
  );
}
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

// Visibility is a function of a version's own metadata and a reader's
// fixed snapshot, never the newest row written; a writer appends a
// new version instead of overwriting one a reader may still need,
// which is exactly what lets reading never block writing and writing
// never block reading.
const fa = (t: number, a: number, d = 0.4) => easeOut(seg(t, a, a + d));

// ── 1 · Which version does an existing reader see (predict, hook) ───────
export function OldVersionPredict({ t }: StepCtx) {
  return (
    <Stack>
      <Code
        title="an old committed version, a new uncommitted one"
        lines={['reader.snapshot.visible_version(&chain);', '// old, or the chain\'s own newest row?']}
        t={t}
        start={0.1}
        end={2.6}
        highlight={[1]}
      />
    </Stack>
  );
}

// ── 2 · Measured: the old version, not the newest row (takeaway) ────────
export function OldVersionReveal({ t }: StepCtx) {
  const probe1 = easeInOut(seg(t, 0.5, 0.9));
  const probe2 = easeInOut(seg(t, 1.3, 1.7));
  const lift = easeOut(seg(t, 1.9, 2.4));
  const px = t < 1.3 ? lerp(300, 465, probe1) : lerp(465, 155, probe2);
  return (
    <Svg label="snapshot_visibility_version_chain.rs, measured" h={270}>
      <Version x={80} y={150} label="old" sub="committed" o={seg(t, 0.05, 0.3)} />
      <Draw pts={[[232, 173], [386, 173]]} t={t} from={0.15} to={0.4} stroke={C.mocha} w={1.5} pen={false} />
      <Version x={390} y={150} label="new" sub="uncommitted" dashed f={C.latte} o={seg(t, 0.2, 0.45)} />
      {/* the reader, its snapshot fixed */}
      <rect x={250} y={22} width={100} height={34} rx={17} fill="none" stroke={C.caramel} strokeWidth={2} />
      <T x={300} y={44} s={13} a="middle" f={C.caramel}>reader</T>
      {probe1 > 0 && lift <= 0 && <Draw pts={[[300, 58], [px, 140]]} t={t} from={0} to={0.01} stroke={C.cinnamon} w={1.5} dash="4 3" pen={false} />}
      {probe1 > 0 && lift <= 0 && <circle cx={px} cy={140} r={5} fill={C.cinnamon} />}
      <Cross x={458} y={126} k={easeOut(seg(t, 0.95, 1.25))} />
      <T x={465} y={104} s={13} a="middle" f={C.cherryText} o={seg(t, 1.0, 1.25)}>not in snapshot</T>
      <Tick x={146} y={124} k={easeOut(seg(t, 1.7, 1.95))} />
      {/* the old value lifts out to the reader */}
      {lift > 0 && <rect x={lerp(140, 286, lift)} y={lerp(162, 64, lift)} width={28} height={22} rx={3} fill={C.caramel} />}
      <Reticle x={155} y={173} w={170} h={64} t={t} at={2.4} />
    </Svg>
  );
}
// ── 6 · Measured: never touched, a new version appended (takeaway) ──────
// An update drops toward the existing version, but doesn't land on it:
// the chain grows instead, a new version sliding in at its end. The old
// version keeps its own fields, and a tick confirms it was never touched.

// ── 3 · Does commit change what the reader sees (predict) ───────────────
export function AfterCommitPredict({ t }: StepCtx) {
  return (
    <Stack>
      <Code
        title="the writer commits, the reader still waits"
        lines={['writer.commit(); reader.snapshot.visible_version(&chain);', '// unchanged, or now the new version?']}
        t={t}
        start={0.1}
        end={2.6}
        highlight={[1]}
      />
    </Stack>
  );
}

// ── 4 · Measured: unchanged, even after the commit (takeaway) ───────────
export function AfterCommitReveal({ t }: StepCtx) {
  const commit = easeOut(seg(t, 1.0, 1.3));
  const look = (a: number) => {
    const p = easeInOut(seg(t, a, a + 0.35));
    const q = easeInOut(seg(t, a + 0.45, a + 0.8));
    return p <= 0 || q >= 1 ? null : <circle cx={q > 0 ? lerp(465, 155, q) : lerp(300, 465, p)} cy={140} r={5} fill={C.cinnamon} />;
  };
  return (
    <Svg label="snapshot_visibility_version_chain.rs, measured" h={270}>
      <Version x={80} y={150} label="old" sub="committed" o={seg(t, 0.05, 0.3)} />
      <line x1={232} y1={173} x2={386} y2={173} stroke={C.mocha} strokeWidth={1.5} opacity={seg(t, 0.05, 0.3)} />
      <Version x={390} y={150} label="new" sub={commit > 0.5 ? 'now committed' : 'uncommitted'} dashed={commit <= 0} f={commit > 0 ? C.crema : C.latte} o={seg(t, 0.05, 0.3)} />
      <rect x={250} y={22} width={100} height={34} rx={17} fill="none" stroke={C.caramel} strokeWidth={2} />
      <T x={300} y={44} s={13} a="middle" f={C.caramel}>reader</T>
      {look(0.2)}
      {look(1.4)}
      <Tick x={146} y={124} k={easeOut(seg(t, 0.95, 1.2))} />
      <T x={40} y={100} s={13} f={C.latte} o={seg(t, 0.9, 1.1)}>before</T>
      <Tick x={170} y={124} k={easeOut(seg(t, 2.15, 2.4))} f={C.caramel} />
      <T x={40} y={124} s={13} f={C.caramel} o={seg(t, 2.15, 2.35)}>after</T>
      <Decode text="the same old version, both times" t={t} at={2.3} dur={0.5} x={300} y={260} s={13} a="middle" f={C.caramel} />
    </Svg>
  );
}

// ── 5 · Does an update overwrite the old version (predict) ──────────────
export function NoOverwritePredict({ t }: StepCtx) {
  return (
    <Stack>
      <Code
        title="an update, the existing version right there"
        lines={['chain.update(txn, new_value);', '// rewritten in place, or a new version?']}
        t={t}
        start={0.1}
        end={2.6}
        highlight={[1]}
      />
    </Stack>
  );
}

// ── 6 · Measured: never touched, a new version appended (takeaway) ──────
export function NoOverwriteReveal({ t }: StepCtx) {
  const drop = easeInOut(seg(t, 0.4, 0.95));
  const grow = easeOut(seg(t, 0.95, 1.45));
  return (
    <Svg label="snapshot_visibility_version_chain.rs, measured" h={270}>
      <Version x={60} y={130} label="old fields" sub="untouched" o={seg(t, 0.05, 0.3)} w={170} />
      <T x={300} y={30} s={13} a="middle" f={C.latte} o={seg(t, 0.2, 0.4)}>update</T>
      {grow <= 0 && <rect x={286} y={lerp(40, 140, drop)} width={28} height={22} rx={3} fill={C.caramel} opacity={seg(t, 0.3, 0.45)} />}
      <Draw pts={[[232, 153], [366, 153]]} t={t} from={0.95} to={1.25} stroke={C.caramel} w={2} />
      <g opacity={grow} transform={`translate(${((1 - grow) * 60).toFixed(1)} 0)`}>
        <Version x={370} y={130} label="new version" sub="appended" f={C.caramel} w={170} />
      </g>
      <Tick x={136} y={110} k={easeOut(seg(t, 1.6, 1.95))} />
      <Decode text="appended, never overwritten" t={t} at={2.0} dur={0.5} x={300} y={250} s={15} a="middle" f={C.caramel} w={700} />
    </Svg>
  );
}
// ── 8 · Reading never blocks writing, the reverse too (takeaway) ────────
// A long write runs across the time line; reads start and finish right
// through it, never pausing. Then the quote lands under the overlap.

// ── 7 · Does a write ever force a read to wait (predict) ────────────────
export function NeverBlockPredict({ t }: StepCtx) {
  return (
    <Stack>
      <Code
        title="PostgreSQL's own words on reading and writing"
        lines={['// does a long write force a read to wait,', '// a long read force a write to wait, or neither?']}
        t={t}
        start={0.1}
        end={2.6}
        highlight={[1]}
      />
    </Stack>
  );
}

// ── 8 · Reading never blocks writing, the reverse too (takeaway) ────────
export function NeverBlockReveal({ t }: StepCtx) {
  const x0 = 40, x1 = 560;
  const reads: [number, number][] = [[0.3, 0.75], [0.9, 1.35], [1.5, 1.95]];
  const X = (s: number) => x0 + (s / 2.1) * (x1 - x0);
  return (
    <Svg label="PostgreSQL Docs: 13.1. Introduction, quoted" h={270}>
      <T x={x0} y={30} s={13} f={C.latte}>a long write</T>
      <rect x={X(0.15)} y={40} width={Math.max(0, X(Math.min(t, 2.0)) - X(0.15))} height={22} rx={3} fill={C.crema} opacity={t > 0.15 ? 1 : 0} />
      <T x={x0} y={100} s={13} f={C.latte}>reads, meanwhile</T>
      {reads.map(([a, b], i) => (
        <g key={i}>
          {t > a && <rect x={X(a)} y={110} width={Math.max(0, X(Math.min(t, b)) - X(a))} height={22} rx={3} fill={C.cinnamon} />}
          <Tick x={X(b) - 6} y={150} k={easeOut(seg(t, b, b + 0.25))} f={C.cinnamon} />
        </g>
      ))}
      {t < 2.1 && <line x1={X(Math.min(t, 2.0))} y1={34} x2={X(Math.min(t, 2.0))} y2={138} stroke={C.caramel} strokeWidth={1.5} />}
      <T x={x0} y={206} s={13} f={C.crema} o={seg(t, 1.9, 2.2)}>“reading never blocks writing and</T>
      <T x={x0} y={228} s={13} f={C.crema} o={seg(t, 1.9, 2.2)}>writing never blocks reading”</T>
      <Draw pts={[[x0, 236], [x0 + 250, 236]]} t={t} from={2.2} to={2.65} stroke={C.caramel} w={1.5} pen={false} />
    </Svg>
  );
}
// ── 9 · PostgreSQL's own xmin/xmax columns (connecting) ─────────────────
// One row version with its two system columns. The inserting transaction
// flies in and stamps xmin; xmax reads zero while the version lives. Then
// a deleting transaction stamps xmax, and zero gives way to its identity.

// ── 9 · PostgreSQL's own xmin/xmax columns (connecting) ─────────────────
export function SystemColumnsReveal({ t }: StepCtx) {
  const ins = easeInOut(seg(t, 0.3, 0.8));
  const del = easeInOut(seg(t, 1.5, 2.0));
  return (
    <Svg label="PostgreSQL Docs: 5.6. System Columns, quoted" h={250}>
      <T x={60} y={30} s={13} f={C.taupe}>one row version</T>
      {[['xmin', 60], ['xmax', 230], ['data', 400]].map(([n, x]) => (
        <g key={n as string}>
          <rect x={x as number} y={110} width={150} height={50} rx={4} fill="none" stroke={C.latte} strokeWidth={1.5} opacity={seg(t, 0.05, 0.3)} />
          <T x={(x as number) + 75} y={98} s={13} a="middle" f={C.latte} o={seg(t, 0.05, 0.3)}>{n}</T>
        </g>
      ))}
      <T x={475} y={141} s={13} a="middle" f={C.taupe} o={seg(t, 0.05, 0.3)}>…</T>
      {/* the inserting transaction stamps xmin */}
      {ins < 1 && ins > 0 && <rect x={lerp(20, 121, ins)} y={lerp(40, 124, ins)} width={28} height={22} rx={3} fill={C.caramel} />}
      <Decode text="inserter" t={t} at={0.8} dur={0.4} x={135} y={141} s={14} a="middle" f={C.caramel} />
      {/* xmax: zero while undeleted, then the deleting transaction */}
      {t > 0.9 && del <= 0 && <T x={305} y={141} s={14} a="middle" f={C.crema}>zero</T>}
      {del < 1 && del > 0 && <rect x={lerp(560, 291, del)} y={lerp(40, 124, del)} width={28} height={22} rx={3} fill={C.cherryText} />}
      <Decode text="deleter" t={t} at={2.0} dur={0.4} x={305} y={141} s={14} a="middle" f={C.cherryText} />
      <T x={60} y={206} s={13} f={C.latte} o={seg(t, 0.9, 1.2)}>inserting transaction, per version</T>
      <T x={60} y={230} s={13} f={C.latte} o={seg(t, 2.1, 2.4)}>deleting transaction, or zero</T>
    </Svg>
  );
}
// ── 10 · Recap ────────────────────────────────────────────────────────────
// A chain of three versions; a snapshot's probe skips the newest and lands
// on the one it may see, while a write appends to the end without waiting.

// ── 10 · Recap ────────────────────────────────────────────────────────────
export function Recap({ t }: StepCtx) {
  const probe = easeInOut(seg(t, 0.3, 0.9));
  const add = easeOut(seg(t, 0.6, 1.0));
  return (
    <Svg label="recap: what a version chain guarantees" h={340}>
      {[0, 1, 2].map((i) => (
        <g key={i}>
          <rect x={40 + i * 130} y={30} width={100} height={34} rx={4} fill="none" stroke={i === 1 ? C.caramel : C.latte} strokeWidth={i === 1 && probe >= 1 ? 2.5 : 1.5} opacity={seg(t, 0.05 + i * 0.06, 0.25 + i * 0.06)} />
          {i < 2 && <line x1={140 + i * 130} y1={47} x2={170 + i * 130} y2={47} stroke={C.mocha} />}
        </g>
      ))}
      <g opacity={add} transform={`translate(${((1 - add) * 40).toFixed(1)} 0)`}>
        <line x1={400} y1={47} x2={430} y2={47} stroke={C.mocha} />
        <rect x={430} y={30} width={100} height={34} rx={4} fill="none" stroke={C.latte} strokeDasharray="5 4" strokeWidth={1.5} />
        <T x={480} y={86} s={13} a="middle" f={C.taupe}>appended</T>
      </g>
      {probe > 0 && <circle cx={lerp(350, 220, probe)} cy={20} r={5} fill={C.cinnamon} />}
      <T x={220} y={86} s={13} a="middle" f={C.caramel} o={seg(t, 0.9, 1.1)}>snapshot sees</T>
      <RecapRows
        t={t}
        y0={140}
        gap={52}
        start={1.0}
        beat={0.3}
        lockAt={2.4}
        rows={[
          ['visibility: version metadata plus the snapshot', true],
          ['never simply the newest row written', true],
          ['a writer appends, it never overwrites', true],
          ['the payoff: neither reads nor writes block', true],
        ]}
        lock={3}
      />
    </Svg>
  );
}
