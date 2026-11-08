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

// Processing a batch at a time instead of one row at a time cuts the
// real per-row dispatch overhead by exactly the batch size chosen,
// without changing the real result at all, and two real, independent
// vectorized query engines both name this batch-at-a-time approach
// directly in their own words.
const fa = (t: number, a: number, d = 0.4) => easeOut(seg(t, a, a + d));

// ── 1 · Does batching cut dispatches (predict) ────────────────────────────
export function DispatchPredict({ t }: StepCtx) {
  return (
    <Stack>
      <Code
        title="the identical filter-then-sum, two ways"
        lines={['row_at_a_time_filter_sum(&column) vs vectorized_filter_sum(&column);', '// far fewer dispatches in the batched version?']}
        t={t}
        start={0.1}
        end={2.6}
        highlight={[1]}
      />
    </Stack>
  );
}

// ── 2 · Measured: far fewer dispatches (no takeaway, the test's own "from" step) ──
export function DispatchReveal({ t }: StepCtx) {
  const n = 24, b = 8, cw = 21, x0 = 40;
  const lane = (y: number, batch: boolean, label: string) => {
    const steps = batch ? n / b : n;
    const p = seg(t, 0.3, batch ? 1.0 : 2.1);
    const done = Math.floor(p * steps + 1e-6);
    const cur = Math.min(steps - 1, done);
    return (
      <g>
        <T x={x0} y={y - 14} s={13} f={C.latte}>{label}</T>
        {Array.from({ length: n }, (_, i) => {
          const seen = batch ? Math.floor(i / b) < done : i < done;
          return <rect key={i} x={x0 + i * cw} y={y} width={cw - 4} height={22} rx={2} fill={seen ? C.crema : 'none'} stroke={C.mocha} strokeWidth={1.2} />;
        })}
        {p > 0 && p < 1 && <rect x={x0 + cur * (batch ? b : 1) * cw - 3} y={y - 4} width={(batch ? b : 1) * cw + 2} height={30} rx={4} fill="none" stroke={C.cinnamon} strokeWidth={2} />}
        {/* the dispatch tally */}
        {Array.from({ length: done }, (_, i) => (
          <line key={i} x1={x0 + i * cw + 8} y1={y + 36} x2={x0 + i * cw + 8} y2={y + 52} stroke={batch ? C.caramel : C.latte} strokeWidth={3} strokeLinecap="round" />
        ))}
      </g>
    );
  };
  return (
    <Svg label="vectorized_vs_compiled_execution_tradeoff.rs, measured" h={260}>
      {lane(40, false, 'row at a time')}
      {lane(150, true, 'batch at a time')}
      <Decode text="far fewer dispatches" t={t} at={2.15} dur={0.4} x={x0 + 110} y={200} s={15} f={C.caramel} w={700} />
      <Reticle x={x0 + 52} y={194} w={84} h={30} t={t} at={2.35} />
    </Svg>
  );
}
// ── 8 · DataFusion's own words (connecting) ───────────────────────────────
// Batches stream left to right through a pipeline on several threads at
// once; the documentation's own words land one by one beneath, and the
// lock-on settles on "vectorized".

// ── 3 · Does the result stay identical (predict) ──────────────────────────
export function CorrectnessPredict({ t }: StepCtx) {
  return (
    <Stack>
      <Code
        title="both paths, the identical filter and sum"
        lines={['row_sum == vec_sum?', '// still the exact same answer?']}
        t={t}
        start={0.1}
        end={2.6}
        highlight={[1]}
      />
    </Stack>
  );
}

// ── 4 · Measured: the identical result (takeaway) ─────────────────────────
export function CorrectnessReveal({ t }: StepCtx) {
  const n = 24, b = 8, cw = 18, x0 = 40;
  const vals = Array.from({ length: n }, (_, i) => ((i * 37) % 11) / 10 + 0.1);
  const keep = (i: number) => i % 5 !== 2;
  const total = vals.reduce((a, v, i) => a + (keep(i) ? v : 0), 0);
  const upto = (m: number) => vals.slice(0, m).reduce((a, v, i) => a + (keep(i) ? v : 0), 0);
  const rows = Math.floor(seg(t, 0.3, 1.9) * n + 1e-6);
  const batches = Math.floor(seg(t, 0.3, 1.1) * (n / b) + 1e-6);
  const lane = (y: number, label: string, done: number, f: string) => (
    <g>
      <T x={x0} y={y - 10} s={13} f={C.latte}>{label}</T>
      {vals.map((v, i) => (
        <rect key={i} x={x0 + i * cw} y={y + 24 - 24 * v} width={cw - 4} height={24 * v} rx={2} fill={i < done ? (keep(i) ? f : 'none') : C.mocha} stroke={!keep(i) && i < done ? C.taupe : 'none'} strokeDasharray="2 2" />
      ))}
      <rect x={x0 + n * cw + 10} y={y + 24 - 60 * (upto(done) / total)} width={30} height={Math.max(2, 60 * (upto(done) / total))} rx={2} fill={f} />
    </g>
  );
  return (
    <Svg label="vectorized_vs_compiled_execution_tradeoff.rs, measured" h={260}>
      {lane(80, 'row at a time', rows, C.latte)}
      {lane(190, 'batch at a time', batches * b, C.caramel)}
      <Draw pts={[[x0 + n * cw + 50, 44], [x0 + n * cw + 50, 154]]} t={t} from={2.0} to={2.3} stroke={C.crema} w={1.5} dash="3 3" pen={false} />
      <Decode text="identical" t={t} at={2.2} dur={0.4} x={x0 + n * cw + 2} y={250} s={15} f={C.caramel} w={700} />
    </Svg>
  );
}
// ── 6 · Measured: an exact match with the batch arithmetic (takeaway) ────
// The column's length is cut by a ruler into batch-sized pieces, one cut
// per beat; that's the arithmetic. Beneath it, the measured dispatches land
// one by one, each lining up under exactly one piece: no more, no fewer.

// ── 5 · Does the dispatch count match the arithmetic exactly (predict) ───
export function ArithmeticPredict({ t }: StepCtx) {
  return (
    <Stack>
      <Code
        title="the predicted dispatch count, against the real one"
        lines={['vec_dispatches == column.len().div_ceil(batch_size)?', '// an exact match, or merely close?']}
        t={t}
        start={0.1}
        end={2.6}
        highlight={[1]}
      />
    </Stack>
  );
}

// ── 6 · Measured: an exact match (takeaway) ───────────────────────────────
export function ArithmeticReveal({ t }: StepCtx) {
  const n = 24, b = 8, cw = 21, x0 = 40;
  const batches = n / b;
  return (
    <Svg label="vectorized_vs_compiled_execution_tradeoff.rs, measured" h={250}>
      <T x={x0} y={28} s={13} f={C.latte}>column, cut by batch size</T>
      {Array.from({ length: n }, (_, i) => <rect key={i} x={x0 + i * cw} y={40} width={cw - 4} height={22} rx={2} fill="none" stroke={C.latte} strokeWidth={1.2} opacity={seg(t, 0.05, 0.3)} />)}
      {Array.from({ length: batches + 1 }, (_, i) => (
        <Draw key={i} pts={[[x0 + i * b * cw - 2, 32], [x0 + i * b * cw - 2, 72]]} t={t} from={0.3 + i * 0.25} to={0.5 + i * 0.25} stroke={C.caramel} w={2.5} pen={false} />
      ))}
      <T x={x0} y={120} s={13} f={C.latte} o={seg(t, 1.2, 1.4)}>measured dispatches</T>
      {Array.from({ length: batches }, (_, i) => {
        const a = 1.3 + i * 0.25;
        const k = easeOut(seg(t, a, a + 0.3));
        const cx = x0 + i * b * cw + (b * cw) / 2;
        return (
          <g key={i}>
            {k > 0 && <rect x={cx - 14} y={lerp(100, 134, k)} width={28} height={28} rx={4} fill="none" stroke={C.caramel} strokeWidth={2} opacity={k} />}
            <Draw pts={[[cx, 74], [cx, 130]]} t={t} from={a + 0.2} to={a + 0.45} stroke={C.crema} w={1.2} dash="3 3" pen={false} />
            <Tick x={cx - 9} y={148} k={easeOut(seg(t, a + 0.3, a + 0.55))} />
          </g>
        );
      })}
      <Decode text="an exact match" t={t} at={2.2} dur={0.4} x={300} y={218} s={15} a="middle" f={C.caramel} w={700} />
    </Svg>
  );
}

// ── 7 · Does DataFusion name itself vectorized (predict) ──────────────────
export function DataFusionPredict({ t }: StepCtx) {
  return (
    <Stack>
      <Code
        title="Apache DataFusion's own documentation"
        lines={['// does it name itself a vectorized engine directly?', '// or a row-at-a-time engine instead?']}
        t={t}
        start={0.1}
        end={2.6}
        highlight={[1]}
      />
    </Stack>
  );
}

// ── 8 · Measured: DataFusion names itself vectorized (takeaway) ──────────
export function DataFusionReveal({ t }: StepCtx) {
  const lanes = 3;
  const words = ['blazingly fast', 'vectorized', 'multithreaded', 'streaming'];
  return (
    <Svg label="Apache DataFusion Docs: Introduction, quoted" h={280}>
      {[190, 360].map((x) => (
        <rect key={x} x={x} y={14} width={40} height={lanes * 36 + 4} rx={4} fill="none" stroke={C.latte} strokeWidth={1.5} opacity={seg(t, 0.05, 0.3)} />
      ))}
      {Array.from({ length: lanes }, (_, l) => (
        <g key={l}>
          <line x1={40} y1={34 + l * 36} x2={560} y2={34 + l * 36} stroke={C.band} strokeWidth={2} />
          {Array.from({ length: 6 }, (_, k) => {
            const x = 40 + (((t * 160 + k * 95 + l * 40) % 570) + 570) % 570 - 30;
            return x >= 40 && x <= 530 ? (
              <g key={k}>
                {[0, 1, 2, 3].map((c) => <rect key={c} x={x + c * 7} y={24 + l * 36} width={5} height={20} rx={1} fill={C.crema} opacity={seg(t, 0.1, 0.4)} />)}
              </g>
            ) : null;
          })}
        </g>
      ))}
      {words.map((w, i) => {
        const x = i % 2 === 0 ? 40 : 320;
        const y = 180 + Math.floor(i / 2) * 36;
        return <Decode key={w} text={w} t={t} at={0.6 + i * 0.35} dur={0.4} x={x} y={y} s={15} f={w === 'vectorized' ? C.caramel : C.crema} w={w === 'vectorized' ? 700 : 500} />;
      })}
      <Reticle x={372} y={175} w={130} h={30} t={t} at={2.2} />
    </Svg>
  );
}
// ── 9 · Polars's own words (connecting) ───────────────────────────────────
// All the data at once is one block too big for the box it has to pass
// through. Executed in batches, it slices into pieces that stream through
// one after another.

// ── 9 · Polars's own words on batching (connecting) ───────────────────────
export function PolarsReveal({ t }: StepCtx) {
  const slice = easeInOut(seg(t, 0.8, 1.2));
  const n = 5, w = 30;
  return (
    <Svg label="Polars User Guide: Streaming, quoted" h={260}>
      <rect x={250} y={44} width={100} height={102} rx={6} fill="none" stroke={C.crema} strokeWidth={1.5} />
      <T x={300} y={166} s={13} a="middle" f={C.taupe}>memory</T>
      <T x={40} y={30} s={13} f={slice > 0.5 ? C.caramel : C.cherryText} o={seg(t, 0.2, 0.4)}>{slice > 0.5 ? 'in batches' : 'all at once'}</T>
      {Array.from({ length: n }, (_, i) => {
        const go = easeInOut(seg(t, 1.2 + i * 0.2, 1.6 + i * 0.2));
        const x0 = 40 + i * (w + 8 * slice);
        const x1 = 400 + i * (w + 4);
        return <rect key={i} x={lerp(x0, x1, go)} y={60} width={w} height={70} rx={3} fill={go > 0 ? C.caramel : C.crema} />;
      })}
      {/* all at once: one block, too big for the box */}
      {slice <= 0 && <rect x={36} y={56} width={158} height={78} rx={4} fill="none" stroke={C.cherryText} strokeWidth={2} strokeDasharray="5 4" opacity={seg(t, 0.3, 0.6)} />}
      <T x={40} y={220} s={13} f={C.crema} o={seg(t, 1.9, 2.2)}>“Polars can execute the query in batches”</T>
      <Draw pts={[[40, 228], [380, 228]]} t={t} from={2.1} to={2.55} stroke={C.caramel} w={1.5} pen={false} />
    </Svg>
  );
}
// ── 10 · Recap ─────────────────────────────────────────────────────────────
// One dispatch per row against one per batch, drawn as their tallies; then
// the lessons land.

// ── 10 · Recap ─────────────────────────────────────────────────────────────
export function Recap({ t }: StepCtx) {
  const p = seg(t, 0.2, 0.9);
  return (
    <Svg label="recap: what batching buys, what it leaves unchanged" h={340}>
      <T x={40} y={30} s={13} f={C.latte}>per row</T>
      {Array.from({ length: Math.floor(p * 24) }, (_, i) => <line key={i} x1={150 + i * 16} y1={16} x2={150 + i * 16} y2={36} stroke={C.latte} strokeWidth={3} strokeLinecap="round" />)}
      <T x={40} y={72} s={13} f={C.caramel}>per batch</T>
      {Array.from({ length: Math.floor(p * 3) }, (_, i) => <line key={i} x1={150 + i * 16} y1={58} x2={150 + i * 16} y2={78} stroke={C.caramel} strokeWidth={3} strokeLinecap="round" />)}
      <RecapRows
        t={t}
        y0={130}
        gap={52}
        start={1.0}
        beat={0.3}
        lockAt={2.4}
        rows={[
          ['batching: one dispatch per batch, not per row', true],
          ['the result: unchanged, exactly identical', true],
          ['the cut: exact, not an estimate', true],
          ['real engines: both name batching directly', true],
        ]}
        lock={0}
      />
    </Svg>
  );
}
