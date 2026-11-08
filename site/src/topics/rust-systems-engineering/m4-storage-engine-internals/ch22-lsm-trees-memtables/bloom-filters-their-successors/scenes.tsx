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

// A Bloom filter never forgets a key it was actually given, so a
// negative result is always proof of absence; a positive result only
// grants permission to go look, never a guarantee. Spending more bits
// per key genuinely lowers the real false-positive rate, though with
// diminishing returns.
const fa = (t: number, a: number, d = 0.4) => easeOut(seg(t, a, a + d));

// ── 1 · Could an inserted key ever come back absent (predict, hook) ──────
export function NeverForgetsPredict({ t }: StepCtx) {
  return (
    <Stack>
      <Code
        title="one key, genuinely inserted, checked again"
        lines={['filter.insert(key); filter.might_contain(key);', '// could this ever come back false?']}
        t={t}
        start={0.1}
        end={2.6}
        highlight={[1]}
      />
    </Stack>
  );
}

// ── 2 · Measured: zero false negatives (takeaway) ─────────────────────────
export function NeverForgetsReveal({ t }: StepCtx) {
  const row = (y: number, cells: number, hits: number[], label: string) => {
    const x0 = 90, cw = 480 / cells;
    return (
      <g>
        <T x={x0} y={y - 46} s={13} f={C.latte}>{label}</T>
        <circle cx={46} cy={y + 10} r={11} fill="none" stroke={C.caramel} strokeWidth={2} />
        <T x={46} y={y + 15} s={13} a="middle" f={C.caramel}>k</T>
        {Array.from({ length: cells }, (_, i) => {
          const hi = hits.indexOf(i);
          const on = hi >= 0 ? easeOut(seg(t, 0.55 + hi * 0.12, 0.75 + hi * 0.12)) : 0;
          return (
            <g key={i}>
              <rect x={x0 + i * cw + 1} y={y} width={cw - 2} height={20} rx={2} fill={C.cocoa} stroke={C.mocha} strokeWidth={1} />
              {on > 0 && <rect x={x0 + i * cw + 1 + (cw - 2) * (1 - on) / 2} y={y} width={(cw - 2) * on} height={20} rx={2} fill={C.crema} />}
            </g>
          );
        })}
        {hits.map((h, j) => {
          const cx = x0 + h * cw + cw / 2;
          return (
            <g key={h}>
              <Draw pts={[[58, y + 4], [cx, y - 28], [cx, y - 4]]} t={t} from={0.2 + j * 0.12} to={0.6 + j * 0.12} stroke={C.crema} w={1.5} pen={false} />
              <Draw pts={[[58, y + 16], [cx, y + 48], [cx, y + 24]]} t={t} from={1.2 + j * 0.12} to={1.6 + j * 0.12} stroke={C.cinnamon} w={1.5} dash="4 3" pen={false} />
            </g>
          );
        })}
        <Tick x={548} y={y - 46} k={easeOut(seg(t, 1.9, 2.2))} />
        <T x={540} y={y - 40} s={13} a="end" f={C.crema} o={seg(t, 1.9, 2.2)}>maybe present</T>
      </g>
    );
  };
  return (
    <Svg label="bloom_filter_false_positive_tradeoff.rs, measured" h={300}>
      {row(80, 10, [1, 4, 8], 'tight budget')}
      {row(200, 20, [3, 11, 16], 'generous budget')}
      <Decode text="false negatives: none" t={t} at={2.3} dur={0.45} x={300} y={288} s={15} a="middle" f={C.caramel} w={700} />
    </Svg>
  );
}
// ── 8 · Measured, in RocksDB's own numbers: diminishing returns (takeaway) ──
// The false-positive rate falls as bits per key rise, steeply at first,
// then barely. Two equal steps along the axis: the drop each buys grows
// as a bar beside it, one tall, one almost nothing.

// ── 3 · Can a never-inserted key come back positive (predict) ────────────
export function FalsePositivesPredict({ t }: StepCtx) {
  return (
    <Stack>
      <Code
        title="a tight budget, a key never inserted"
        lines={['filter.might_contain(never_inserted_key);', '// could this ever come back true?']}
        t={t}
        start={0.1}
        end={2.6}
        highlight={[1]}
      />
    </Stack>
  );
}

// ── 4 · Measured: real false positives exist (takeaway) ───────────────────
export function FalsePositivesReveal({ t }: StepCtx) {
  const cells = 12, x0 = 60, cw = 40;
  const set = [0, 2, 3, 5, 6, 8, 9, 11];
  const probe = [2, 6, 9];
  return (
    <Svg label="bloom_filter_false_positive_tradeoff.rs, measured" h={260}>
      <T x={x0} y={60} s={13} f={C.latte}>tight budget, other keys' bits</T>
      {Array.from({ length: cells }, (_, i) => {
        const si = set.indexOf(i);
        const on = si >= 0 ? easeOut(seg(t, 0.15 + si * 0.08, 0.35 + si * 0.08)) : 0;
        return (
          <g key={i}>
            <rect x={x0 + i * cw + 1} y={80} width={cw - 4} height={26} rx={2} fill={C.cocoa} stroke={C.mocha} />
            {on > 0 && <rect x={x0 + i * cw + 1} y={80 + 26 * (1 - on)} width={cw - 4} height={26 * on} rx={2} fill={C.latte} />}
          </g>
        );
      })}
      <circle cx={300} cy={196} r={14} fill="none" stroke={C.cherryText} strokeWidth={2} opacity={seg(t, 0.9, 1.1)} />
      <T x={300} y={201} s={13} a="middle" f={C.cherryText} o={seg(t, 0.9, 1.1)}>q</T>
      <T x={330} y={201} s={13} f={C.latte} o={seg(t, 0.9, 1.1)}>never inserted</T>
      {probe.map((c, j) => (
        <g key={c}>
          <Draw pts={[[300, 180], [x0 + c * cw + 18, 112]]} t={t} from={1.1 + j * 0.15} to={1.45 + j * 0.15} stroke={C.cherryText} w={1.5} dash="4 3" />
          {t > 1.45 + j * 0.15 && <rect x={x0 + c * cw - 1} y={78} width={cw} height={30} rx={3} fill="none" stroke={C.cherryText} strokeWidth={2.5} />}
        </g>
      ))}
      <Decode text="maybe present: false positive" t={t} at={2.2} dur={0.5} x={300} y={246} s={15} a="middle" f={C.cherryText} w={700} />
    </Svg>
  );
}
// ── 6 · Measured: more bits per key, fewer false positives (takeaway) ────
// The same keys go into a tight filter and a far roomier one. Then the
// same stream of never-inserted keys tests each: in the tight one, many
// come back "maybe" (red); in the roomy one, almost none do.

// ── 5 · Does more budget change the rate (predict) ────────────────────────
export function MoreBitsPredict({ t }: StepCtx) {
  return (
    <Stack>
      <Code
        title="the same filter, a far larger budget"
        lines={['BloomFilter::with_bits_per_key(n, 4, hashes);', 'BloomFilter::with_bits_per_key(n, 12, hashes);']}
        t={t}
        start={0.1}
        end={2.6}
        highlight={[1]}
      />
    </Stack>
  );
}

// ── 6 · Measured: the rate genuinely drops (takeaway) ─────────────────────
export function MoreBitsReveal({ t }: StepCtx) {
  const n = 14;
  const tightFp = [1, 4, 6, 9, 11, 13];
  const roomyFp = [8];
  const lane = (y: number, label: string, fp: number[], density: number) => (
    <g>
      <T x={40} y={y - 14} s={13} f={C.latte}>{label}</T>
      {Array.from({ length: 30 }, (_, i) => (
        <rect key={i} x={40 + i * 17} y={y} width={14} height={14} rx={2} fill={(i * 7) % 10 < density * 10 ? C.latte : C.cocoa} opacity={seg(t, 0.1, 0.4)} />
      ))}
      {Array.from({ length: n }, (_, i) => {
        const a = 0.5 + i * 0.11;
        const k = easeOut(seg(t, a, a + 0.25));
        const bad = fp.includes(i);
        return k > 0 ? <circle key={i} cx={50 + i * 36} cy={y + 40 - (1 - k) * 12} r={7} fill={bad ? C.cherryText : 'none'} stroke={bad ? C.cherryText : C.taupe} strokeWidth={1.5} opacity={k} /> : null;
      })}
    </g>
  );
  return (
    <Svg label="bloom_filter_false_positive_tradeoff.rs, measured" h={260}>
      {lane(46, 'tight budget', tightFp, 0.7)}
      {lane(146, 'far more bits per key', roomyFp, 0.2)}
      <Decode text="false positives: far fewer" t={t} at={2.2} dur={0.45} x={40} y={246} s={15} f={C.caramel} w={700} />
    </Svg>
  );
}

// ── 7 · Does the low end of the table buy more (predict) ─────────────────
export function TablePredict({ t }: StepCtx) {
  return (
    <Stack>
      <Code
        title="RocksDB's own bits-per-key table"
        lines={['// going from 2 to 5 bits per key, versus', '// going from 10 to 13: same gain, or not?']}
        t={t}
        start={0.1}
        end={2.6}
        highlight={[1]}
      />
    </Stack>
  );
}

// ── 8 · Measured, in RocksDB's own numbers: diminishing returns (takeaway) ──
export function TableReveal({ t }: StepCtx) {
  const x0 = 60, x1 = 380, y0 = 40, y1 = 220;
  const bMax = 16;
  const f = (b: number) => Math.pow(0.6185, b);
  const X = (b: number) => x0 + ((b - 1) / (bMax - 1)) * (x1 - x0);
  const Y = (b: number) => y1 - (f(b) / f(1)) * (y1 - y0);
  const pts = Array.from({ length: 61 }, (_, i) => {
    const b = 1 + (i / 60) * (bMax - 1);
    return [X(b), Y(b)] as const;
  });
  const step = (a: number, at: number, bx: number, label: string, hot: boolean) => {
    const k = easeOut(seg(t, at, at + 0.5));
    const drop = Y(a + 3) - Y(a);
    return (
      <g>
        <Draw pts={[[X(a), Y(a)], [X(a + 3), Y(a)], [X(a + 3), Y(a + 3)]]} t={t} from={at - 0.3} to={at} stroke={hot ? C.caramel : C.latte} w={2} pen={false} />
        <rect x={bx} y={y1 - drop * k} width={44} height={Math.max(2, drop * k)} rx={3} fill={hot ? C.caramel : C.latte} />
        <T x={bx + 22} y={y1 + 22} s={13} a="middle" f={hot ? C.caramel : C.latte}>{label}</T>
      </g>
    );
  };
  return (
    <Svg label="RocksDB Wiki: RocksDB Bloom Filter, quoted" h={280}>
      <line x1={x0} y1={y1} x2={x1} y2={y1} stroke={C.mocha} />
      <line x1={x0} y1={y0 - 10} x2={x0} y2={y1} stroke={C.mocha} />
      <T x={x0} y={y1 + 22} s={13} f={C.taupe}>bits per key →</T>
      <T x={x0 + 8} y={y0 - 16} s={13} f={C.taupe}>false positives</T>
      <Draw pts={pts} t={t} from={0.1} to={0.9} stroke={C.crema} w={2} />
      {step(2, 1.2, 410, 'low end', true)}
      {step(10, 1.8, 515, 'higher', false)}
      <T x={470} y={y1 + 46} s={13} a="middle" f={C.latte} o={seg(t, 2.2, 2.5)}>same step, its drop</T>
      <Reticle x={432} y={y1 - (Y(5) - Y(2)) / 2} w={64} h={Y(5) - Y(2) + 16} t={t} at={2.35} />
    </Svg>
  );
}
// ── 9 · RocksDB's own words on cutting disk reads (connecting) ───────────
// One lookup, two ways down the same files. Without a filter it opens
// every one, a read each. With one, each filter turns the lookup away at
// the door, and only the file that may hold the key gets opened.

// ── 9 · RocksDB's own words on cutting disk reads (connecting) ───────────
export function DiskReadsReveal({ t }: StepCtx) {
  const n = 7;
  const hitFile = 5;
  const lane = (y: number, filtered: boolean) => {
    const sweep = seg(t, 0.3, 1.9) * n;
    let reads = 0;
    return (
      <g>
        <T x={40} y={y - 24} s={13} f={C.latte}>{filtered ? 'with a filter' : 'no filter'}</T>
        {Array.from({ length: n }, (_, i) => {
          const x = 40 + i * 62;
          const reached = sweep > i + 0.5;
          const opened = reached && (!filtered || i === hitFile);
          if (opened) reads++;
          return (
            <g key={i}>
              {filtered && <rect x={x} y={y - 8} width={46} height={5} rx={1} fill={reached ? (i === hitFile ? C.caramel : C.latte) : C.mocha} />}
              <rect x={x} y={y} width={46} height={30} rx={3} fill="none" stroke={opened ? C.caramel : C.mocha} strokeWidth={opened ? 2.5 : 1.5} />
              {filtered && reached && i !== hitFile && <Cross x={x + 16} y={y + 15} k={easeOut(seg(sweep, i + 0.5, i + 0.9))} f={C.latte} />}
              {opened && <Tick x={x + 14} y={y + 14} k={easeOut(seg(sweep, i + 0.5, i + 0.9))} f={C.caramel} />}
            </g>
          );
        })}
        {sweep > 0 && sweep < n && <circle cx={40 + Math.min(sweep, n - 0.01) * 62 - 8} cy={y + 15} r={5} fill={C.cinnamon} />}
        <rect x={488} y={y + 4} width={Math.max(3, reads * 11)} height={22} rx={3} fill={filtered ? C.caramel : C.latte} />
      </g>
    );
  };
  return (
    <Svg label="RocksDB Wiki: Basic Operations, quoted" h={270}>
      <T x={488} y={26} s={13} f={C.taupe}>reads</T>
      {lane(60, false)}
      {lane(150, true)}
      <T x={40} y={226} s={13} f={C.crema} o={seg(t, 2.0, 2.3)}>“reduce the number of disk reads substantially”</T>
      <Draw pts={[[40, 234], [420, 234]]} t={t} from={2.2} to={2.65} stroke={C.caramel} w={1.5} pen={false} />
    </Svg>
  );
}
// ── 10 · Recap ─────────────────────────────────────────────────────────────
// Two lookups reach the filter: one is turned back for good (absent, and
// that's proof); the other is waved through to go check the file. Then the
// lessons land.

// ── 10 · Recap ─────────────────────────────────────────────────────────────
export function Recap({ t }: StepCtx) {
  const a = easeInOut(seg(t, 0.2, 0.7));
  const back = easeInOut(seg(t, 0.7, 1.0));
  const b = easeInOut(seg(t, 0.5, 1.2));
  const gx = 260;
  return (
    <Svg label="recap: what a filter guarantees, what it budgets" h={330}>
      <rect x={gx} y={12} width={12} height={74} rx={3} fill={C.crema} opacity={seg(t, 0, 0.2)} />
      <T x={gx + 6} y={104} s={13} a="middle" f={C.taupe}>filter</T>
      <rect x={470} y={50} width={90} height={34} rx={4} fill="none" stroke={C.mocha} strokeWidth={1.5} />
      <T x={515} y={72} s={13} a="middle" f={C.taupe}>file</T>
      <circle cx={lerp(lerp(60, gx - 12, a), 90, back)} cy={30} r={7} fill={C.crema} />
      <T x={100} y={22} s={13} f={C.crema} o={seg(t, 0.9, 1.1)}>absent: proof</T>
      <circle cx={lerp(60, 450, b)} cy={67} r={7} fill={C.cinnamon} />
      <T x={300} y={60} s={13} f={C.cinnamon} o={seg(t, 1.0, 1.2)}>maybe: go look</T>
      <RecapRows
        t={t}
        y0={142}
        gap={50}
        start={1.0}
        beat={0.3}
        lockAt={2.4}
        rows={[
          ['a negative is always proof of absence', true],
          ['a positive is only permission to look', true],
          ['more bits per key: a real, lower rate', true],
          ['the whole point: fewer disk reads', true],
        ]}
        lock={0}
      />
    </Svg>
  );
}
