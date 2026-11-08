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
const SHADE = [C.caramel, C.latte, C.taupe, C.crema];

// A lightweight encoding like run-length can win hugely on repetitive
// data and lose outright on random data, in both compression ratio and
// decode work, so the real choice has to follow the real data's own
// shape, not be applied by default.
const fa = (t: number, a: number, d = 0.4) => easeOut(seg(t, a, a + d));

// ── 1 · Does RLE win big on a skewed column (predict) ────────────────────
export function SkewedPredict({ t }: StepCtx) {
  return (
    <Stack>
      <Code
        title="a skewed column, long runs of one value"
        lines={['rle_encode(&skewed_column);', '// a huge compression ratio, or close to even?']}
        t={t}
        start={0.1}
        end={2.6}
        highlight={[1]}
      />
    </Stack>
  );
}

// ── 2 · Measured: a huge ratio (no takeaway, the test's own "from" step) ──
export function SkewedReveal({ t }: StepCtx) {
  const runs = [9, 6, 8, 5];
  const cw = 18, x0 = 40;
  const fold = easeInOut(seg(t, 0.6, 1.5));
  const total = runs.reduce((a, b) => a + b, 0);
  let i0 = 0;
  return (
    <Svg label="lightweight_encoding_decode_cost_tradeoff.rs, measured" h={260}>
      <T x={x0} y={34} s={13} f={C.latte}>raw column</T>
      {runs.map((len, r) => {
        const start = i0;
        i0 += len;
        const hx = x0 + r * 60;
        return (
          <g key={r}>
            {Array.from({ length: len }, (_, j) => {
              const rawX = x0 + (start + j) * cw;
              const x = lerp(rawX, hx, fold);
              return <rect key={j} x={x + (j === 0 ? 3 * fold : 0)} y={46 + (j === 0 ? 3 * fold : 0)} width={j === 0 ? lerp(cw - 3, 38, fold) : cw - 3} height={26 - (j === 0 ? 6 * fold : 0)} rx={2} fill={SHADE[r]} opacity={j === 0 ? 1 : 1 - seg(fold, 0.7, 1)} />;
            })}
            {fold >= 1 && <rect x={hx} y={44} width={44} height={30} rx={3} fill="none" stroke={C.caramel} strokeWidth={2} />}
          </g>
        );
      })}
      <T x={x0} y={108} s={13} f={C.latte} o={seg(t, 1.3, 1.5)}>one header per run</T>
      <T x={x0} y={150} s={13} f={C.taupe}>size</T>
      <rect x={x0} y={160} width={total * cw - 3} height={14} rx={3} fill={C.cocoa} />
      <rect x={x0} y={160} width={Math.max(3, lerp(total * cw - 3, runs.length * 30, easeInOut(seg(t, 1.2, 1.9))))} height={14} rx={3} fill={C.caramel} />
      <Decode text="a huge real win" t={t} at={1.9} dur={0.45} x={x0} y={214} s={17} f={C.caramel} w={700} />
      <Reticle x={x0 + 60} y={167} w={136} h={30} t={t} at={2.3} />
    </Svg>
  );
}
// ── 8 · Measured: a real codec spectrum (takeaway) ────────────────────────
// A frontier draws from cheap-but-light to costly-but-tight; codecs drop
// onto it at different points. No single default: each sits in its own
// area of the trade.

// ── 3 · Does RLE lose on random data (predict) ────────────────────────────
export function RandomPredict({ t }: StepCtx) {
  return (
    <Stack>
      <Code
        title="the identical length, uniformly random column"
        lines={['rle_encode(&random_column);', '// still wins, or genuinely loses?']}
        t={t}
        start={0.1}
        end={2.6}
        highlight={[1]}
      />
    </Stack>
  );
}

// ── 4 · Measured: genuinely loses (takeaway) ──────────────────────────────
export function RandomReveal({ t }: StepCtx) {
  const n = 16, x0 = 40;
  const grow = easeInOut(seg(t, 0.6, 1.4));
  const cw = lerp(22, 33, grow);
  return (
    <Svg label="lightweight_encoding_decode_cost_tradeoff.rs, measured" h={260}>
      <T x={x0} y={30} s={13} f={C.latte}>random column</T>
      {Array.from({ length: n }, (_, i) => (
        <g key={i}>
          {grow > 0 && <rect x={x0 + i * cw} y={44} width={Math.max(0, cw - 22)} height={26} rx={2} fill="none" stroke={C.cherryText} strokeWidth={1.2} />}
          <rect x={x0 + i * cw + (cw - 22)} y={44} width={19} height={26} rx={2} fill={SHADE[(i * 7 + 3) % 4]} />
        </g>
      ))}
      <T x={x0} y={98} s={13} f={C.cherryText} o={seg(t, 1.0, 1.3)}>a header for every value</T>
      <T x={x0} y={150} s={13} f={C.taupe}>size</T>
      <line x1={x0 + 352} y1={152} x2={x0 + 352} y2={192} stroke={C.latte} strokeDasharray="3 3" />
      <T x={x0 + 352} y={210} s={13} a="middle" f={C.taupe}>raw</T>
      <rect x={x0} y={162} width={lerp(352, 520, easeInOut(seg(t, 1.3, 2.0)))} height={14} rx={3} fill={C.cherryText} />
      <Decode text="larger, not smaller" t={t} at={2.0} dur={0.45} x={x0} y={248} s={15} f={C.cherryText} w={700} />
    </Svg>
  );
}
// ── 6 · Measured: decode work rides on the data's shape (takeaway) ───────
// Two decoders at work. On the skewed column each header hands back a long
// run in one go; on the random column every value needs a header of its
// own. The header tallies race: the random one runs far longer. Both
// outputs come back exactly equal to their originals.

// ── 5 · Is decode work itself distribution-dependent (predict) ───────────
export function DecodeWorkPredict({ t }: StepCtx) {
  return (
    <Stack>
      <Code
        title="run-headers processed per output value"
        lines={['rle_decode(&skewed_encoded) vs rle_decode(&random_encoded);', '// far fewer headers per value on the skewed column?']}
        t={t}
        start={0.1}
        end={2.6}
        highlight={[1]}
      />
    </Stack>
  );
}

// ── 6 · Measured: far fewer headers, correct round trip (takeaway) ───────
export function DecodeWorkReveal({ t }: StepCtx) {
  const n = 20, cw = 24, x0 = 40;
  const lane = (y: number, label: string, runs: number[], f: string) => {
    const p = seg(t, 0.3, 1.9) * runs.length;
    const k = Math.floor(p);
    let filled = 0;
    for (let i = 0; i < Math.min(k, runs.length); i++) filled += runs[i];
    return (
      <g>
        <T x={x0} y={y - 10} s={13} f={C.latte}>{label}</T>
        {Array.from({ length: n }, (_, i) => (
          <rect key={i} x={x0 + i * cw} y={y} width={cw - 4} height={22} rx={2} fill={i < filled ? f : 'none'} stroke={C.mocha} />
        ))}
        {Array.from({ length: Math.min(k, runs.length) }, (_, i) => (
          <line key={i} x1={x0 + i * 9 + 3} y1={y + 32} x2={x0 + i * 9 + 3} y2={y + 46} stroke={f} strokeWidth={3} strokeLinecap="round" />
        ))}
        <Tick x={x0 + n * cw + 4} y={y + 11} k={easeOut(seg(t, 2.0, 2.3))} />
      </g>
    );
  };
  return (
    <Svg label="lightweight_encoding_decode_cost_tradeoff.rs, measured" h={260}>
      {lane(46, 'skewed: a few headers', [8, 5, 7], C.caramel)}
      {lane(146, 'random: a header each', Array.from({ length: n }, () => 1), C.latte)}
      <T x={x0} y={246} s={13} f={C.crema} o={seg(t, 2.1, 2.4)}>both decode back exactly</T>
    </Svg>
  );
}

// ── 7 · Does Parquet name a ratio/cost spectrum (predict) ────────────────
export function SpectrumPredict({ t }: StepCtx) {
  return (
    <Stack>
      <Code
        title="Apache Parquet's own compression documentation"
        lines={['// does it name several codecs on a ratio/cost spectrum?', '// or one single best codec for every case?']}
        t={t}
        start={0.1}
        end={2.6}
        highlight={[1]}
      />
    </Stack>
  );
}

// ── 8 · Measured: a real codec spectrum (takeaway) ────────────────────────
export function SpectrumReveal({ t }: StepCtx) {
  const x0 = 70, x1 = 540, y0 = 190, y1 = 40;
  const curve = Array.from({ length: 41 }, (_, i) => {
    const u = i / 40;
    return [lerp(x0, x1, u), lerp(y0, y1, Math.sqrt(u))] as const;
  });
  const at = [0.12, 0.38, 0.66, 0.92];
  return (
    <Svg label="Apache Parquet Docs: Compression, quoted" h={290}>
      <line x1={x0} y1={y0 + 10} x2={x1 + 10} y2={y0 + 10} stroke={C.mocha} />
      <line x1={x0 - 10} y1={y1 - 10} x2={x0 - 10} y2={y0 + 10} stroke={C.mocha} />
      <T x={x1 + 10} y={y0 + 32} s={13} a="end" f={C.taupe}>processing cost →</T>
      <T x={x0} y={y1 - 18} s={13} f={C.taupe}>compression ratio</T>
      <Draw pts={curve} t={t} from={0.15} to={0.8} stroke={C.latte} w={1.5} />
      {at.map((u, i) => {
        const k = easeOut(seg(t, 0.8 + i * 0.22, 1.1 + i * 0.22));
        const x = lerp(x0, x1, u), y = lerp(y0, y1, Math.sqrt(u));
        return (
          <g key={i} opacity={k} transform={`translate(0 ${((1 - k) * -26).toFixed(1)})`}>
            <circle cx={x} cy={y} r={8} fill={C.caramel} />
          </g>
        );
      })}
      <Decode text="several codecs" t={t} at={1.7} dur={0.4} x={300} y={y0 - 20} s={13} f={C.caramel} />
      <T x={40} y={242} s={13} f={C.crema} o={seg(t, 1.9, 2.2)}>“covering different areas in the compression</T>
      <T x={40} y={264} s={13} f={C.crema} o={seg(t, 1.9, 2.2)}>ratio / processing cost spectrum”</T>
      <Draw pts={[[40, 272], [300, 272]]} t={t} from={2.1} to={2.55} stroke={C.caramel} w={1.5} pen={false} />
    </Svg>
  );
}
// ── 9 · Parquet's own name for RLE/bit-packing (connecting) ──────────────
// One stretch of values. The repeated run collapses to a single header
// (run-length); the varied values that follow keep their order but each
// narrows to only the bits it needs (bit-packing). Both tricks, one encoding.

// ── 9 · Parquet's own name for RLE/bit-packing (connecting) ──────────────
export function RleDefinitionReveal({ t }: StepCtx) {
  const run = 8, varied = 6;
  const x0 = 40, cw = 30;
  const rle = easeInOut(seg(t, 0.4, 1.0));
  const pack = easeInOut(seg(t, 1.1, 1.7));
  const vStart = lerp(x0 + run * cw, x0 + 60, rle);
  return (
    <Svg label="Apache Parquet Docs: Encodings, quoted" h={260}>
      {Array.from({ length: run }, (_, j) => (
        <rect key={j} x={lerp(x0 + j * cw, x0, rle)} y={50} width={cw - 4} height={30} rx={2} fill={C.latte} opacity={j === 0 ? 1 : 1 - seg(rle, 0.7, 1)} />
      ))}
      {rle >= 1 && <rect x={x0 - 2} y={48} width={50} height={34} rx={3} fill="none" stroke={C.caramel} strokeWidth={2} />}
      <T x={x0} y={36} s={13} f={C.latte} o={seg(t, 0.1, 0.3)}>repeats</T>
      <T x={x0} y={110} s={13} f={C.caramel} o={seg(t, 0.9, 1.1)}>run-length</T>
      {Array.from({ length: varied }, (_, j) => {
        const w = lerp(cw - 4, 12, pack);
        const x = vStart + j * lerp(cw, 16, pack);
        return <rect key={j} x={x} y={50} width={w} height={30} rx={2} fill={SHADE[j % 4]} />;
      })}
      <T x={x0 + run * cw} y={36} s={13} f={C.latte} o={seg(t, 0.1, 0.3) * (1 - rle)}>varied</T>
      <T x={170} y={110} s={13} f={C.caramel} o={seg(t, 1.6, 1.8)}>bit-packed</T>
      <T x={40} y={190} s={13} f={C.crema} o={seg(t, 1.8, 2.1)}>“a combination of bit-packing and</T>
      <T x={40} y={212} s={13} f={C.crema} o={seg(t, 1.8, 2.1)}>run length encoding”</T>
      <Draw pts={[[40, 220], [300, 220]]} t={t} from={2.1} to={2.55} stroke={C.caramel} w={1.5} pen={false} />
    </Svg>
  );
}
// ── 10 · Recap ─────────────────────────────────────────────────────────────
// The same encoding, two columns: the skewed one folds down to almost
// nothing; the random one grows past its raw size. Then the lessons land.

// ── 10 · Recap ─────────────────────────────────────────────────────────────
export function Recap({ t }: StepCtx) {
  const k = easeInOut(seg(t, 0.3, 1.0));
  return (
    <Svg label="recap: why an encoding has to follow the data" h={340}>
      <T x={40} y={28} s={13} f={C.latte}>skewed</T>
      <rect x={150} y={16} width={300} height={16} rx={3} fill={C.cocoa} />
      <rect x={150} y={16} width={lerp(300, 40, k)} height={16} rx={3} fill={C.caramel} />
      <T x={40} y={68} s={13} f={C.latte}>random</T>
      <rect x={150} y={56} width={300} height={16} rx={3} fill={C.cocoa} />
      <rect x={150} y={56} width={lerp(300, 390, k)} height={16} rx={3} fill={C.cherryText} />
      <line x1={450} y1={8} x2={450} y2={80} stroke={C.latte} strokeDasharray="3 3" />
      <T x={446} y={98} s={13} a="end" f={C.taupe}>raw size</T>
      <RecapRows
        t={t}
        y0={140}
        gap={52}
        start={1.0}
        beat={0.3}
        lockAt={2.4}
        rows={[
          ['skewed data: RLE wins by a huge ratio', true],
          ['random data: the identical RLE genuinely loses', false],
          ["decode work: also rides on the data's own shape", true],
          ['the rule: follow the real data, never a default', true],
        ]}
        lock={3}
      />
    </Svg>
  );
}
