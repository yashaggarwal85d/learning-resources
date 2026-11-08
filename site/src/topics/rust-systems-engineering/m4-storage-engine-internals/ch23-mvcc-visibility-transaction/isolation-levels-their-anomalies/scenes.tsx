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

// Snapshot isolation's own commit rule only checks for same-key writes,
// so it genuinely lets write skew through even while two transactions
// each individually preserve a shared invariant; a stricter,
// dependency-graph check catches exactly that pattern, while correctly
// leaving unrelated transactions alone.
const fa = (t: number, a: number, d = 0.4) => easeOut(seg(t, a, a + d));

// ── 1 · Does the shared rule survive (predict, hook) ─────────────────────
export function WriteSkewPredict({ t }: StepCtx) {
  return (
    <Stack>
      <Code
        title="two doctors, each sees one other still on call"
        lines={['doctor_a.go_off_call(); doctor_b.go_off_call();', "// does 'at least one on call' survive?"]}
        t={t}
        start={0.1}
        end={2.6}
        highlight={[1]}
      />
    </Stack>
  );
}

// ── 2 · Measured: it breaks (no takeaway, the test's own "from" step) ────
export function WriteSkewReveal({ t }: StepCtx) {
  const off = easeInOut(seg(t, 1.2, 1.6));
  const count = 2 - 2 * off;
  return (
    <Svg label="isolation_level_permitted_anomaly.rs, measured" h={270}>
      {[0, 1].map((i) => {
        const x = 110 + i * 240;
        return (
          <g key={i}>
            <T x={x} y={28} s={13} a="middle" f={C.latte}>{i === 0 ? 'doctor A' : 'doctor B'}</T>
            <circle cx={x} cy={64} r={22} fill="none" stroke={C.crema} strokeWidth={1.5} opacity={seg(t, 0.05, 0.3)} />
            <circle cx={x} cy={64} r={18 * (1 - off)} fill={C.caramel} opacity={seg(t, 0.05, 0.3)} />
          </g>
        );
      })}
      {/* each reads the other's lamp: still on, so it's safe to leave */}
      <Draw pts={[[134, 52], [230, 40], [326, 52]]} t={t} from={0.4} to={0.8} stroke={C.cinnamon} w={1.5} dash="4 3" />
      <Draw pts={[[326, 76], [230, 88], [134, 76]]} t={t} from={0.6} to={1.0} stroke={C.cinnamon} w={1.5} dash="4 3" />
      <T x={230} y={110} s={13} a="middle" f={C.cinnamon} o={seg(t, 0.8, 1.1)}>each reads: other on call</T>
      {/* the on-call count against the rule's floor */}
      <T x={480} y={28} s={13} a="middle" f={C.latte}>on call</T>
      <rect x={460} y={50} width={40} height={130} rx={3} fill={C.cocoa} />
      <rect x={460} y={180 - 60 * count} width={40} height={Math.max(2, 60 * count)} rx={3} fill={count >= 1 ? C.crema : C.cherryText} />
      <line x1={448} y1={120} x2={512} y2={120} stroke={C.cherryText} strokeWidth={2} strokeDasharray="5 4" />
      <T x={448} y={204} s={13} f={C.cherryText} o={seg(t, 1.4, 1.6)}>floor</T>
      <Decode text="rule broken" t={t} at={1.7} dur={0.4} x={60} y={170} s={17} f={C.cherryText} w={700} />
      <T x={60} y={204} s={13} f={C.latte} o={seg(t, 2.0, 2.3)}>write conflicts found: none</T>
      <Reticle x={480} y={150} w={64} h={74} t={t} at={2.2} color={C.cherryText} />
    </Svg>
  );
}
// ── 6 · Measured: a real two-edge cycle (takeaway) ────────────────────────
// The dependency graph builds itself: an edge from A to B because B's write
// invalidated A's read, then one back from B to A for the same reason.
// A token runs the loop: a cycle, the signature of write skew.

// ── 3 · Does a same-key-only check notice this (predict) ─────────────────
export function NoConflictPredict({ t }: StepCtx) {
  return (
    <Stack>
      <Code
        title="two writes, two different doctors' own rows"
        lines={['txn_a.writes(doctor_0); txn_b.writes(doctor_1);', '// same key anywhere? or genuinely disjoint?']}
        t={t}
        start={0.1}
        end={2.6}
        highlight={[1]}
      />
    </Stack>
  );
}

// ── 4 · Measured: no conflict at all (takeaway) ───────────────────────────
export function NoConflictReveal({ t }: StepCtx) {
  const rows = ['doctor A', 'doctor B', 'doctor C'];
  const scan = seg(t, 1.0, 1.9) * rows.length;
  return (
    <Svg label="isolation_level_permitted_anomaly.rs, measured" h={260}>
      <T x={200} y={30} s={13} a="middle" f={C.crema}>txn A writes</T>
      <T x={420} y={30} s={13} a="middle" f={C.cinnamon}>txn B writes</T>
      {rows.map((r, i) => {
        const y = 50 + i * 46;
        const hit = scan > i + 0.5;
        return (
          <g key={r}>
            <T x={40} y={y + 22} s={13} f={C.latte}>{r}</T>
            <rect x={150} y={y} width={100} height={32} rx={3} fill="none" stroke={C.mocha} />
            <rect x={370} y={y} width={100} height={32} rx={3} fill="none" stroke={C.mocha} />
            {i === 0 && <rect x={lerp(150, 185, 1)} y={lerp(-30, y + 6, easeOut(seg(t, 0.2, 0.6)))} width={30} height={20} rx={3} fill={C.crema} />}
            {i === 1 && <rect x={405} y={lerp(-30, y + 6, easeOut(seg(t, 0.45, 0.85)))} width={30} height={20} rx={3} fill={C.cinnamon} />}
            {hit && <Tick x={500} y={y + 16} k={easeOut(seg(scan, i + 0.5, i + 0.9))} f={C.latte} />}
          </g>
        );
      })}
      {scan > 0 && scan < rows.length && <rect x={144} y={44 + Math.floor(scan) * 46} width={332} height={44} rx={4} fill="none" stroke={C.caramel} strokeWidth={1.5} />}
      <Decode text="no conflict found" t={t} at={2.0} dur={0.45} x={300} y={214} s={15} a="middle" f={C.caramel} w={700} />
      <T x={300} y={240} s={13} a="middle" f={C.latte} o={seg(t, 2.3, 2.6)}>never the same row twice</T>
    </Svg>
  );
}
// ── 8 · Measured: no cycle for unrelated transactions (takeaway) ─────────
// Two unrelated transactions. The graph builder tries both directions in
// turn: each probe finds nothing either one read from the other, so no
// edge is drawn, and there's no cycle to flag.

// ── 5 · Does a dependency graph catch it (predict) ────────────────────────
export function CyclePredict({ t }: StepCtx) {
  return (
    <Stack>
      <Code
        title="the same two transactions, a dependency graph"
        lines={['rw_antidependency(txn_a, txn_b) && rw_antidependency(txn_b, txn_a)', '// a real cycle, or nothing at all?']}
        t={t}
        start={0.1}
        end={2.6}
        highlight={[1]}
      />
    </Stack>
  );
}

// ── 6 · Measured: a real two-edge cycle (takeaway) ────────────────────────
export function CycleReveal({ t }: StepCtx) {
  const ax = 140, bx = 460, y = 120;
  const top: [number, number][] = Array.from({ length: 25 }, (_, i) => {
    const a = Math.PI + (i / 24) * Math.PI;
    return [300 + 150 * Math.cos(a), y + 70 * Math.sin(a)];
  });
  const bot: [number, number][] = Array.from({ length: 25 }, (_, i) => {
    const a = (i / 24) * Math.PI;
    return [300 + 150 * Math.cos(a), y + 70 * Math.sin(a)];
  });
  const loop = [...top, ...bot.slice(1)];
  const run = seg(t, 1.6, 2.4);
  const idx = Math.min(loop.length - 1, Math.floor(run * (loop.length - 1)));
  return (
    <Svg label="isolation_level_permitted_anomaly.rs, measured" h={260}>
      {[['A', ax], ['B', bx]].map(([n, x]) => (
        <g key={n as string} opacity={seg(t, 0.05, 0.3)}>
          <circle cx={x as number} cy={y} r={26} fill="none" stroke={C.caramel} strokeWidth={2} />
          <T x={x as number} y={y + 6} s={17} a="middle" f={C.caramel} w={700}>{n}</T>
        </g>
      ))}
      <Draw pts={top.slice(2, -2)} t={t} from={0.3} to={0.8} stroke={C.crema} w={2} />
      <T x={300} y={36} s={13} a="middle" f={C.crema} o={seg(t, 0.7, 0.9)}>B's write breaks A's read</T>
      <Draw pts={bot.slice(2, -2)} t={t} from={0.9} to={1.4} stroke={C.crema} w={2} />
      <T x={300} y={216} s={13} a="middle" f={C.crema} o={seg(t, 1.3, 1.5)}>A's write breaks B's read</T>
      {run > 0 && run < 1 && <circle cx={loop[idx][0]} cy={loop[idx][1]} r={6} fill={C.cherryText} />}
      <Decode text="a cycle" t={t} at={2.2} dur={0.4} x={300} y={y + 6} s={17} a="middle" f={C.cherryText} w={700} />
      <Reticle x={300} y={y} w={340} h={160} t={t} at={2.35} />
    </Svg>
  );
}
// ── 9 · PostgreSQL's own words on the serialization anomaly (connecting) ──
// Run the two transactions one at a time, in either order: each serial
// order leaves one doctor on call. The real, concurrent result leaves none,
// and it matches neither order: a serialization anomaly.

// ── 7 · Does the check over-flag unrelated transactions (predict) ────────
export function NoCyclePredict({ t }: StepCtx) {
  return (
    <Stack>
      <Code
        title="two unrelated transactions, nobody reads the other"
        lines={['rw_antidependency(txn_c, txn_d) && rw_antidependency(txn_d, txn_c)', '// still flagged, or correctly left alone?']}
        t={t}
        start={0.1}
        end={2.6}
        highlight={[1]}
      />
    </Stack>
  );
}

// ── 8 · Measured: no cycle for unrelated transactions (takeaway) ─────────
export function NoCycleReveal({ t }: StepCtx) {
  const cx = 160, dx = 440, y = 110;
  return (
    <Svg label="isolation_level_permitted_anomaly.rs, measured" h={260}>
      {[['C', cx], ['D', dx]].map(([n, x]) => (
        <g key={n as string} opacity={seg(t, 0.05, 0.3)}>
          <circle cx={x as number} cy={y} r={26} fill="none" stroke={C.crema} strokeWidth={2} />
          <T x={x as number} y={y + 6} s={17} a="middle" f={C.crema} w={700}>{n}</T>
        </g>
      ))}
      <Draw pts={[[cx + 30, y - 16], [300, y - 50], [dx - 30, y - 16]]} t={t} from={0.4} to={0.9} stroke={C.latte} w={1.5} dash="4 4" />
      <Cross x={293} y={y - 58} k={easeOut(seg(t, 0.95, 1.2))} f={C.latte} />
      <Draw pts={[[dx - 30, y + 16], [300, y + 50], [cx + 30, y + 16]]} t={t} from={1.2} to={1.7} stroke={C.latte} w={1.5} dash="4 4" />
      <Cross x={293} y={y + 58} k={easeOut(seg(t, 1.75, 2.0))} f={C.latte} />
      <T x={300} y={30} s={13} a="middle" f={C.latte} o={seg(t, 0.95, 1.2)}>no read-write edge</T>
      <Decode text="no cycle, left alone" t={t} at={2.0} dur={0.45} x={300} y={222} s={15} a="middle" f={C.caramel} w={700} />
    </Svg>
  );
}

// ── 9 · PostgreSQL's own words on the serialization anomaly (connecting) ──
export function SerializationAnomalyReveal({ t }: StepCtx) {
  const rowY = [50, 110, 190];
  const lamps = (y: number, lit: [boolean, boolean], at: number) =>
    [0, 1].map((i) => (
      <g key={i}>
        <circle cx={420 + i * 50} cy={y} r={13} fill="none" stroke={C.latte} strokeWidth={1.5} opacity={seg(t, at, at + 0.2)} />
        {lit[i] && <circle cx={420 + i * 50} cy={y} r={10 * easeOut(seg(t, at + 0.1, at + 0.4))} fill={C.caramel} />}
      </g>
    ));
  return (
    <Svg label="PostgreSQL Docs: 13.2. Transaction Isolation, quoted" h={280}>
      <T x={40} y={rowY[0] + 5} s={13} f={C.crema} o={seg(t, 0.1, 0.3)}>A, then B</T>
      <Draw pts={[[150, rowY[0]], [380, rowY[0]]]} t={t} from={0.2} to={0.6} stroke={C.latte} w={1.5} />
      {lamps(rowY[0], [false, true], 0.6)}
      <T x={40} y={rowY[1] + 5} s={13} f={C.crema} o={seg(t, 0.5, 0.7)}>B, then A</T>
      <Draw pts={[[150, rowY[1]], [380, rowY[1]]]} t={t} from={0.6} to={1.0} stroke={C.latte} w={1.5} />
      {lamps(rowY[1], [true, false], 1.0)}
      <line x1={40} y1={148} x2={560} y2={148} stroke={C.mocha} opacity={seg(t, 1.2, 1.4)} />
      <T x={40} y={rowY[2] + 5} s={13} f={C.cherryText} o={seg(t, 1.3, 1.5)}>together</T>
      <Draw pts={[[150, rowY[2] - 8], [380, rowY[2] - 8]]} t={t} from={1.3} to={1.7} stroke={C.cherryText} w={1.5} />
      <Draw pts={[[150, rowY[2] + 8], [380, rowY[2] + 8]]} t={t} from={1.3} to={1.7} stroke={C.cherryText} w={1.5} />
      {lamps(rowY[2], [false, false], 1.7)}
      <Cross x={530} y={rowY[2]} k={easeOut(seg(t, 1.9, 2.2))} />
      <T x={40} y={250} s={13} f={C.crema} o={seg(t, 2.0, 2.3)}>“inconsistent with all possible orderings”</T>
      <Draw pts={[[40, 258], [400, 258]]} t={t} from={2.2} to={2.65} stroke={C.caramel} w={1.5} pen={false} />
    </Svg>
  );
}
// ── 10 · Recap ─────────────────────────────────────────────────────────────
// Two transactions, two edges: the same-key check sees nothing pass
// between them, while the dependency graph closes the loop. Then the
// lessons land.

// ── 10 · Recap ─────────────────────────────────────────────────────────────
export function Recap({ t }: StepCtx) {
  return (
    <Svg label="recap: what a stricter check catches and leaves alone" h={340}>
      {[['A', 200], ['B', 400]].map(([n, x]) => (
        <g key={n as string} opacity={seg(t, 0.05, 0.25)}>
          <circle cx={x as number} cy={56} r={20} fill="none" stroke={C.caramel} strokeWidth={2} />
          <T x={x as number} y={61} s={15} a="middle" f={C.caramel} w={700}>{n}</T>
        </g>
      ))}
      <Draw pts={[[220, 46], [300, 22], [380, 46]]} t={t} from={0.3} to={0.7} stroke={C.crema} w={2} />
      <Draw pts={[[380, 66], [300, 90], [220, 66]]} t={t} from={0.6} to={1.0} stroke={C.crema} w={2} />
      <T x={300} y={110} s={13} a="middle" f={C.cherryText} o={seg(t, 0.9, 1.1)}>a cycle</T>
      <RecapRows
        t={t}
        y0={152}
        gap={50}
        start={1.0}
        beat={0.3}
        lockAt={2.4}
        rows={[
          ['same-key writes: the only thing SI checks', true],
          ['write skew: genuinely let through', false],
          ["a dependency cycle: write skew's own signature", true],
          ['unrelated transactions: correctly left alone', true],
        ]}
        lock={2}
      />
    </Svg>
  );
}
