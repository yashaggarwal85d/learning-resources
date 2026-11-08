import type { StepCtx } from '../../../../../reels/types';
import { easeOut, seg } from '../../../../../reels/anim';
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

// A column-major layout touches far fewer bytes scanning one column and
// skips exactly the rows its packed validity bitmap marks absent, but it
// pays for that by scattering a single logical row's own update across
// every column's own separate buffer instead of touching one contiguous
// region.
const fa = (t: number, a: number, d = 0.4) => easeOut(seg(t, a, a + d));

// ── 1 · Does the column-major table touch fewer bytes scanning one column (predict) ──
export function ScanPredict({ t }: StepCtx) {
  return (
    <Stack>
      <Code
        title="the identical rows, row-major and column-major"
        lines={['narrow_scan(&row_major) vs narrow_scan(&col_major);', '// fewer bytes touched in the column-major table?']}
        t={t}
        start={0.1}
        end={2.6}
        highlight={[1]}
      />
    </Stack>
  );
}

// ── 2 · Measured: far fewer bytes (no takeaway, the test's own "from" step) ──
export function ScanReveal({ t }: StepCtx) {
  const rows = 5, cols = 4, cw = 22;
  const x0 = 40;
  const n = rows * cols;
  const strip = (y: number, colMajor: boolean, label: string) => {
    const total = colMajor ? rows : n;
    const sweep = seg(t, 0.4, 0.4 + (total / n) * 1.6) * total;
    return (
      <g>
        <T x={x0} y={y - 12} s={13} f={C.latte}>{label}</T>
        {Array.from({ length: n }, (_, i) => {
          const col = colMajor ? Math.floor(i / rows) : i % cols;
          const touched = i < sweep;
          return (
            <rect key={i} x={x0 + i * cw} y={y} width={cw - 3} height={24} rx={2}
              fill={touched ? (col === 0 ? C.caramel : C.latte) : 'none'} stroke={col === 0 ? C.crema : C.mocha} strokeWidth={1.2} />
          );
        })}
        {sweep > 0 && sweep < total && <line x1={x0 + sweep * cw} y1={y - 6} x2={x0 + sweep * cw} y2={y + 30} stroke={C.cinnamon} strokeWidth={2} />}
        <rect x={x0} y={y + 36} width={Math.max(3, Math.min(sweep, total) * cw - 3)} height={8} rx={2} fill={colMajor ? C.caramel : C.latte} />
      </g>
    );
  };
  return (
    <Svg label="columnar_layout_locality_tradeoff.rs, measured" h={260}>
      {strip(46, false, 'row-major')}
      {strip(150, true, 'column-major')}
      <Decode text="far fewer bytes" t={t} at={2.1} dur={0.4} x={x0 + 5 * cw + 16} y={192} s={15} f={C.caramel} w={700} />
      <Reticle x={x0 + (5 * cw) / 2} y={176} w={5 * cw + 16} h={60} t={t} at={2.3} />
    </Svg>
  );
}
// ── 8 · Arrow's own trade-off, quoted (takeaway) ──────────────────────────
// Two races, the same two layouts. Scanning, the column-major bar stops
// short; mutating one row, it runs long past the row-major one. Then
// Arrow's own sentence lands under the trade.

// ── 3 · Does the column-major table touch more regions on a wide update (predict) ──
export function UpdatePredict({ t }: StepCtx) {
  return (
    <Stack>
      <Code
        title="one logical row, every field updated"
        lines={['wide_update(&mut row_major) vs wide_update(&mut col_major);', '// more separate regions touched in the column-major table?']}
        t={t}
        start={0.1}
        end={2.6}
        highlight={[1]}
      />
    </Stack>
  );
}

// ── 4 · Measured: four regions vs one (takeaway) ──────────────────────────
export function UpdateReveal({ t }: StepCtx) {
  const rows = 5, cols = 4, cw = 22, x0 = 40;
  const n = rows * cols;
  const target = 2;
  const strip = (y: number, colMajor: boolean, label: string, at: number) => {
    const hits = Array.from({ length: n }, (_, i) => (colMajor ? i % rows === target : Math.floor(i / cols) === target));
    const k = easeOut(seg(t, at, at + 0.4));
    const regions: number[] = colMajor ? [0, 1, 2, 3].map((c) => c * rows + target) : [target * cols];
    const rw = colMajor ? 1 : cols;
    return (
      <g>
        <T x={x0} y={y - 12} s={13} f={C.latte}>{label}</T>
        {Array.from({ length: n }, (_, i) => (
          <rect key={i} x={x0 + i * cw} y={y} width={cw - 3} height={24} rx={2} fill={hits[i] && k > 0 ? C.caramel : 'none'} fillOpacity={k} stroke={C.mocha} strokeWidth={1.2} />
        ))}
        {regions.map((r, j) => {
          const b = easeOut(seg(t, at + 0.4 + j * 0.2, at + 0.7 + j * 0.2));
          const cx = x0 + r * cw + (rw * cw - 3) / 2;
          return b > 0 ? <rect key={r} x={cx - (rw * cw) / 2 - 3 - 8 * (1 - b)} y={y - 5 - 8 * (1 - b)} width={rw * cw + 3 + 16 * (1 - b)} height={34 + 16 * (1 - b)} rx={4} fill="none" stroke={colMajor ? C.cherryText : C.caramel} strokeWidth={2} opacity={b} /> : null;
        })}
        <Decode text={colMajor ? 'four regions' : 'one region'} t={t} at={at + 0.6 + (colMajor ? 0.6 : 0)} dur={0.4} x={x0} y={y + 56} s={15} f={colMajor ? C.cherryText : C.caramel} w={700} />
      </g>
    );
  };
  return (
    <Svg label="columnar_layout_locality_tradeoff.rs, measured" h={260}>
      {strip(46, false, 'row-major', 0.3)}
      {strip(160, true, 'column-major', 1.0)}
    </Svg>
  );
}
// ── 6 · Measured: exactly the marked rows skipped (takeaway) ──────────────
// A packed validity bitmap sits over the values: every seventh bit is off.
// The scan reads a bit, then its value; at each unset bit it skips the
// value. Then the bitmap's size races a byte-per-row one: an eighth of it.

// ── 5 · Does the packed bitmap correctly skip marked rows (predict) ──────
export function BitmapPredict({ t }: StepCtx) {
  return (
    <Stack>
      <Code
        title="a packed bitmap, one bit per row"
        lines={['set_bit(&mut validity, i, i % 7 != 0);', '// does the scan correctly skip the unset rows?']}
        t={t}
        start={0.1}
        end={2.6}
        highlight={[1]}
      />
    </Stack>
  );
}

// ── 6 · Measured: exactly those rows skipped (takeaway) ───────────────────
export function BitmapReveal({ t }: StepCtx) {
  const n = 15, cw = 34, x0 = 45;
  const sc = seg(t, 0.3, 1.6) * n;
  return (
    <Svg label="columnar_layout_locality_tradeoff.rs, measured" h={260}>
      <T x={x0} y={24} s={13} f={C.latte}>validity bits</T>
      {Array.from({ length: n }, (_, i) => {
        const valid = i % 7 !== 0;
        const read = sc > i + 0.5;
        return (
          <g key={i}>
            <rect x={x0 + i * cw + 10} y={34} width={10} height={14} rx={1} fill={valid ? C.crema : 'none'} stroke={valid ? C.crema : C.cherryText} strokeWidth={1.2} />
            <rect x={x0 + i * cw} y={60} width={cw - 4} height={26} rx={2} fill={read && valid ? C.latte : 'none'} stroke={valid ? C.mocha : C.cherryText} strokeWidth={1.2} />
            {read && !valid && <Cross x={x0 + i * cw + 8} y={73} k={easeOut(seg(sc, i + 0.5, i + 0.9))} />}
          </g>
        );
      })}
      {sc > 0 && sc < n && <line x1={x0 + sc * cw} y1={28} x2={x0 + sc * cw} y2={92} stroke={C.cinnamon} strokeWidth={2} />}
      <T x={x0} y={120} s={13} f={C.latte} o={seg(t, 1.6, 1.8)}>skipped: exactly the marked rows</T>
      <T x={x0} y={164} s={13} f={C.taupe} o={seg(t, 1.7, 1.9)}>a byte per row</T>
      <rect x={x0} y={172} width={Math.max(3, 480 * easeOut(seg(t, 1.8, 2.3)))} height={12} rx={2} fill={C.latte} />
      <T x={x0} y={212} s={13} f={C.caramel} o={seg(t, 1.7, 1.9)}>a bit per row</T>
      <rect x={x0} y={220} width={Math.max(3, 60 * easeOut(seg(t, 1.8, 2.3)))} height={12} rx={2} fill={C.caramel} />
    </Svg>
  );
}

// ── 7 · Does Arrow name the mutation cost directly (predict) ─────────────
export function TradeoffPredict({ t }: StepCtx) {
  return (
    <Stack>
      <Code
        title="Apache Arrow's own format documentation"
        lines={['// does it name mutation as the real cost of locality?', '// or claim both scans and mutations are equally cheap?']}
        t={t}
        start={0.1}
        end={2.6}
        highlight={[1]}
      />
    </Stack>
  );
}

// ── 8 · Arrow's own trade-off, quoted (takeaway) ──────────────────────────
export function TradeoffReveal({ t }: StepCtx) {
  const race = (y: number, label: string, row: number, col: number, at: number) => {
    const k = easeOut(seg(t, at, at + 0.7));
    return (
      <g>
        <T x={40} y={y} s={13} f={C.crema} o={seg(t, at - 0.2, at)}>{label}</T>
        <rect x={160} y={y - 26} width={Math.max(3, 360 * row * k)} height={12} rx={3} fill={C.latte} />
        <rect x={160} y={y - 8} width={Math.max(3, 360 * col * k)} height={12} rx={3} fill={C.caramel} />
      </g>
    );
  };
  return (
    <Svg label="Apache Arrow Docs: Arrow Columnar Format, quoted" h={260}>
      <rect x={160} y={18} width={12} height={8} rx={2} fill={C.latte} />
      <T x={178} y={27} s={13} f={C.latte}>row-major</T>
      <rect x={320} y={18} width={12} height={8} rx={2} fill={C.caramel} />
      <T x={338} y={27} s={13} f={C.caramel}>column-major</T>
      {race(80, 'scan', 1, 0.22, 0.3)}
      {race(140, 'mutation', 0.25, 1, 1.0)}
      <T x={40} y={204} s={13} f={C.crema} o={seg(t, 1.7, 2.0)}>“in exchange for comparatively</T>
      <T x={40} y={226} s={13} f={C.crema} o={seg(t, 1.7, 2.0)}>more expensive mutation operations”</T>
      <Draw pts={[[40, 234], [330, 234]]} t={t} from={2.0} to={2.5} stroke={C.caramel} w={1.5} pen={false} />
    </Svg>
  );
}
// ── 9 · arrow-buffer's own words on the null mask (connecting) ───────────
// The same column, its validity bits kept in their own buffer. Checking
// validity value by value, a cursor steps one cell at a time; handling the
// mask on its own, a whole word of bits goes at once. The second race ends
// long before the first.

// ── 9 · arrow-buffer's own words on the null mask (connecting) ───────────
export function NullMaskReveal({ t }: StepCtx) {
  const n = 16, cw = 30, x0 = 40;
  const valid = (i: number) => i % 7 !== 0;
  const lane = (y: number, words: boolean, label: string) => {
    const done = words ? seg(t, 0.4, 0.9) : seg(t, 0.4, 2.2);
    const cur = words ? Math.floor(done * 2) * 8 + (done >= 1 ? 0 : 8) : Math.floor(done * n);
    const reach = Math.min(n, words ? (done >= 1 ? n : cur) : cur);
    return (
      <g>
        <T x={x0} y={y - 10} s={13} f={C.latte}>{label}</T>
        {Array.from({ length: n }, (_, i) => (
          <rect key={i} x={x0 + i * cw} y={y} width={cw - 4} height={20} rx={2}
            fill={i < reach ? (valid(i) ? C.crema : 'none') : 'none'} stroke={valid(i) ? C.mocha : C.cherryText} strokeWidth={1.2} />
        ))}
        {done > 0 && done < 1 && (
          <rect x={x0 + (words ? Math.floor(done * 2) * 8 : Math.floor(done * n)) * cw - 2} y={y - 4} width={(words ? 8 : 1) * cw} height={28} rx={3} fill="none" stroke={C.cinnamon} strokeWidth={2} />
        )}
        <Tick x={x0 + n * cw + 2} y={y + 10} k={easeOut(seg(t, words ? 0.9 : 2.2, words ? 1.2 : 2.5))} />
        {/* how long it took: the timing bar stops when the pass ends */}
        <rect x={x0} y={y + 28} width={Math.max(3, 480 * (Math.min(t, words ? 0.9 : 2.2) - 0.4) / 1.8)} height={6} rx={2} fill={words ? C.caramel : C.latte} opacity={t > 0.4 ? 1 : 0} />
      </g>
    );
  };
  return (
    <Svg label="arrow-buffer crate docs: NullBuffer, quoted" h={260}>
      {lane(50, false, 'value by value')}
      {lane(124, true, 'mask handled separately')}
      <T x={x0} y={208} s={13} f={C.crema} o={seg(t, 1.3, 1.6)}>“significant performance improvements”</T>
      <Draw pts={[[x0, 216], [x0 + 330, 216]]} t={t} from={1.6} to={2.1} stroke={C.caramel} w={1.5} pen={false} />
    </Svg>
  );
}
// ── 10 · Recap ─────────────────────────────────────────────────────────────
// A small table: one column lights up as a single run of its own bytes
// (the scan), then one row lights up scattered across every column (the
// update). Then the lessons land.

// ── 10 · Recap ─────────────────────────────────────────────────────────────
export function Recap({ t }: StepCtx) {
  const r = 4, c = 4;
  const col = easeOut(seg(t, 0.2, 0.6));
  const row = easeOut(seg(t, 0.6, 1.0));
  return (
    <Svg label="recap: what column-major buys, what it costs" h={340}>
      {Array.from({ length: c }, (_, j) => (
        <g key={j}>
          {Array.from({ length: r }, (_, i) => {
            const x = 40 + j * 132 + i * 28;
            const isCol = j === 0;
            const isRow = i === 2;
            const f = isRow && row > 0 ? C.cherryText : isCol && col > 0 ? C.caramel : 'none';
            const o = isRow && row > 0 ? row : isCol ? col : 1;
            return <rect key={i} x={x} y={30} width={24} height={24} rx={2} fill={f} fillOpacity={f === 'none' ? 1 : o} stroke={C.mocha} strokeWidth={1.2} />;
          })}
        </g>
      ))}
      <T x={40} y={78} s={13} f={C.caramel} o={seg(t, 0.4, 0.6)}>one column: one run</T>
      <T x={560} y={78} s={13} a="end" f={C.cherryText} o={seg(t, 0.8, 1.0)}>one row: four places</T>
      <RecapRows
        t={t}
        y0={128}
        gap={54}
        start={1.0}
        beat={0.3}
        lockAt={2.4}
        rows={[
          ['scan: column-major touches far fewer bytes', true],
          ['bitmap: skips exactly the marked rows, cheaply', true],
          ['update: column-major scatters across buffers', false],
          ['the trade: cheap scanning for expensive mutation', true],
        ]}
        lock={3}
      />
    </Svg>
  );
}
