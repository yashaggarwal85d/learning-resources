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

// An explicit SIMD kernel, called only once the real CPU's own support
// is checked at runtime, computes the exact identical answer as its
// scalar equivalent while processing far fewer real operations, by
// exactly the real lane width, and that runtime check is the genuine
// safety contract making any of it sound to call at all.
const fa = (t: number, a: number, d = 0.4) => easeOut(seg(t, a, a + d));

// ── 1 · Does the real CPU support AVX2 (predict) ──────────────────────────
export function DetectPredict({ t }: StepCtx) {
  return (
    <Stack>
      <Code
        title="checked at runtime, before the kernel ever runs"
        lines={['is_x86_feature_detected!("avx2")', '// genuinely supported, or always falls back?']}
        t={t}
        start={0.1}
        end={2.6}
        highlight={[1]}
      />
    </Stack>
  );
}

// ── 2 · Measured: genuinely supported (no takeaway, the test's own "from" step) ──
export function DetectReveal({ t }: StepCtx) {
  return (
    <Svg label="simd_autovectorization_verification.rs, measured" h={270}>
      <rect x={130} y={16} width={340} height={36} rx={5} fill="none" stroke={C.crema} strokeWidth={1.5} opacity={seg(t, 0.05, 0.3)} />
      <T x={300} y={39} s={13} a="middle" f={C.crema} o={seg(t, 0.05, 0.3)}>is_x86_feature_detected!("avx2")</T>
      <Decode text="true" t={t} at={0.6} dur={0.3} x={490} y={39} s={15} f={C.caramel} w={700} />
      {/* the fallback: drawn, never taken */}
      <path d="M220 54 L120 120" fill="none" stroke={C.mocha} strokeWidth={1.5} strokeDasharray="4 4" opacity={seg(t, 0.2, 0.4)} />
      <rect x={40} y={124} width={160} height={40} rx={4} fill="none" stroke={C.mocha} strokeWidth={1.5} opacity={seg(t, 0.2, 0.4)} />
      <T x={120} y={149} s={13} a="middle" f={C.taupe} o={seg(t, 0.2, 0.4)}>scalar fallback</T>
      {/* the kernel: taken */}
      <Draw pts={[[380, 54], [440, 120]]} t={t} from={0.9} to={1.25} stroke={C.caramel} w={2.5} />
      <rect x={300} y={124} width={260} height={40} rx={4} fill="none" stroke={C.caramel} strokeWidth={2} opacity={seg(t, 0.2, 0.4)} />
      {Array.from({ length: 8 }, (_, i) => {
        const k = easeOut(seg(t, 1.3, 1.6));
        return <rect key={i} x={308 + i * 31} y={132 + 24 * (1 - k)} width={26} height={24 * k} rx={2} fill={C.caramel} />;
      })}
      <T x={430} y={190} s={13} a="middle" f={C.caramel} o={seg(t, 1.5, 1.8)}>AVX2 kernel, eight lanes</T>
      <Decode text="the kernel ran for real" t={t} at={1.9} dur={0.45} x={300} y={240} s={15} a="middle" f={C.caramel} w={700} />
      <Reticle x={430} y={144} w={276} h={56} t={t} at={2.3} />
    </Svg>
  );
}
// ── 8 · The standard library's own words on safety (takeaway) ────────────
// Two calls into a CPU that lacks AVX2. Unchecked, the call flies straight
// in and breaks: unsafe. Checked first, it's stopped at the gate and sent
// to the scalar path instead.

// ── 3 · Does the kernel match the scalar sum exactly (predict) ───────────
export function CorrectnessPredict({ t }: StepCtx) {
  return (
    <Stack>
      <Code
        title="the identical column, both paths"
        lines={['scalar_sum(&column) == simd_sum(&column).0?', '// the exact identical sum?']}
        t={t}
        start={0.1}
        end={2.6}
        highlight={[1]}
      />
    </Stack>
  );
}

// ── 4 · Measured: the identical sum (takeaway) ────────────────────────────
export function CorrectnessReveal({ t }: StepCtx) {
  const vals = [0.6, 0.3, 0.9, 0.4, 0.7, 0.2, 0.8, 0.5];
  const sum = vals.reduce((a, b) => a + b, 0);
  const sc = Math.floor(seg(t, 0.3, 1.5) * 8 + 1e-6);
  const scalarTot = vals.slice(0, sc).reduce((a, b) => a + b, 0);
  const simd = easeOut(seg(t, 0.6, 0.9));
  const cols = (y: number, lit: (i: number) => boolean, f: string) =>
    vals.map((v, i) => <rect key={i} x={40 + i * 34} y={y + 30 - 30 * v} width={28} height={30 * v} rx={2} fill={lit(i) ? f : C.mocha} />);
  return (
    <Svg label="simd_autovectorization_verification.rs, measured" h={260}>
      <T x={40} y={26} s={13} f={C.latte}>scalar loop</T>
      {cols(36, (i) => i < sc, C.latte)}
      <rect x={330} y={50} width={Math.max(3, 220 * (scalarTot / sum))} height={16} rx={3} fill={C.latte} />
      <T x={40} y={126} s={13} f={C.caramel}>SIMD kernel</T>
      {cols(136, () => simd > 0, C.caramel)}
      {simd > 0 && <rect x={36} y={132} width={8 * 34 + 2} height={40} rx={4} fill="none" stroke={C.caramel} strokeWidth={1.5} opacity={simd} />}
      <rect x={330} y={150} width={Math.max(3, 220 * simd)} height={16} rx={3} fill={C.caramel} />
      <Draw pts={[[440, 76], [440, 140]]} t={t} from={1.6} to={1.9} stroke={C.crema} w={1.5} dash="3 3" pen={false} />
      <Decode text="exactly identical" t={t} at={1.9} dur={0.45} x={330} y={214} s={15} f={C.caramel} w={700} />
      <Reticle x={440} y={108} w={240} h={84} t={t} at={2.2} />
    </Svg>
  );
}
// ── 6 · Measured: far fewer ops, by the lane width exactly (takeaway) ────
// The scalar loop's operations tally up one per value; the kernel's tally
// one per eight. Then each group of eight scalar marks draws a line to the
// single vector op that replaced it: an exact match, every group.

// ── 5 · Does SIMD process far fewer operations (predict) ─────────────────
export function OpCountPredict({ t }: StepCtx) {
  return (
    <Stack>
      <Code
        title="scalar operations vs vector operations"
        lines={['scalar_ops vs simd_ops, the identical column', '// far fewer in the SIMD kernel?']}
        t={t}
        start={0.1}
        end={2.6}
        highlight={[1]}
      />
    </Stack>
  );
}

// ── 6 · Measured: far fewer, exact match (takeaway) ───────────────────────
export function OpCountReveal({ t }: StepCtx) {
  const groups = 4, lane = 8, x0 = 40, w = 15;
  const sc = Math.floor(seg(t, 0.2, 1.3) * groups * lane + 1e-6);
  const vc = Math.floor(seg(t, 0.2, 1.3) * groups + 1e-6);
  return (
    <Svg label="simd_autovectorization_verification.rs, measured" h={240}>
      <T x={x0} y={30} s={13} f={C.latte}>scalar ops</T>
      {Array.from({ length: sc }, (_, i) => <line key={i} x1={x0 + i * w + 4} y1={44} x2={x0 + i * w + 4} y2={70} stroke={C.latte} strokeWidth={3} strokeLinecap="round" />)}
      <T x={x0} y={160} s={13} f={C.caramel}>vector ops</T>
      {Array.from({ length: vc }, (_, i) => {
        const cx = x0 + i * lane * w + (lane * w) / 2;
        return <line key={i} x1={cx} y1={174} x2={cx} y2={200} stroke={C.caramel} strokeWidth={4} strokeLinecap="round" />;
      })}
      {Array.from({ length: groups }, (_, i) => {
        const gx = x0 + i * lane * w;
        const cx = gx + (lane * w) / 2;
        const a = 1.4 + i * 0.15;
        return (
          <g key={i}>
            <Draw pts={[[gx, 78], [gx + lane * w - 8, 78]]} t={t} from={a} to={a + 0.2} stroke={C.crema} w={1.5} pen={false} />
            <Draw pts={[[cx - 4, 82], [cx, 166]]} t={t} from={a + 0.15} to={a + 0.45} stroke={C.crema} w={1.5} dash="3 3" />
          </g>
        );
      })}
      <Decode text="one per lane width, exactly" t={t} at={2.2} dur={0.45} x={x0} y={232} s={15} f={C.caramel} w={700} />
    </Svg>
  );
}

// ── 7 · Does Rust name it unsafe without the check (predict) ─────────────
export function SafetyPredict({ t }: StepCtx) {
  return (
    <Stack>
      <Code
        title="the Rust standard library's own safety contract"
        lines={['// does it name calling without the check as unsafe?', '// or merely slower, without real risk?']}
        t={t}
        start={0.1}
        end={2.6}
        highlight={[1]}
      />
    </Stack>
  );
}

// ── 8 · Measured: unsafe without the check (takeaway) ─────────────────────
export function SafetyReveal({ t }: StepCtx) {
  return (
    <Svg label="Rust Standard Library Docs: std::arch, quoted" h={280}>
      <rect x={440} y={24} width={120} height={130} rx={6} fill="none" stroke={C.latte} strokeWidth={1.5} opacity={seg(t, 0.05, 0.3)} />
      <T x={500} y={84} s={13} a="middle" f={C.latte} o={seg(t, 0.05, 0.3)}>CPU</T>
      <T x={500} y={104} s={13} a="middle" f={C.taupe} o={seg(t, 0.05, 0.3)}>no AVX2</T>
      <T x={40} y={44} s={13} f={C.latte} o={seg(t, 0.1, 0.3)}>unchecked</T>
      <Draw pts={[[40, 60], [436, 60]]} t={t} from={0.3} to={0.8} stroke={C.cherryText} w={2.5} />
      <Cross x={410} y={60} k={easeOut(seg(t, 0.8, 1.05))} />
      <Decode text="unsafe" t={t} at={0.9} dur={0.35} x={330} y={44} s={15} f={C.cherryText} w={700} />
      <T x={40} y={118} s={13} f={C.latte} o={seg(t, 1.0, 1.2)}>checked first</T>
      <Draw pts={[[40, 134], [300, 134]]} t={t} from={1.1} to={1.5} stroke={C.crema} w={2.5} />
      <rect x={304} y={114} width={10} height={40} rx={2} fill={C.caramel} opacity={seg(t, 1.0, 1.2)} />
      <Draw pts={[[300, 134], [300, 176], [380, 176]]} t={t} from={1.5} to={1.85} stroke={C.crema} w={2.5} />
      <T x={388} y={181} s={13} f={C.crema} o={seg(t, 1.8, 2.0)}>scalar path</T>
      <T x={40} y={226} s={13} f={C.crema} o={seg(t, 1.9, 2.2)}>“it is unsafe to call an AVX2 function</T>
      <T x={40} y={248} s={13} f={C.crema} o={seg(t, 1.9, 2.2)}>on a CPU that doesn’t actually support AVX2”</T>
      <Draw pts={[[48, 232], [152, 232]]} t={t} from={2.15} to={2.55} stroke={C.caramel} w={1.5} pen={false} />
    </Svg>
  );
}
// ── 9 · The standard library's own words on cpuid (connecting) ───────────
// The macro asks; underneath, one instruction answers: cpuid hands back a
// register of feature bits, and the check reads just the one it needs.

// ── 9 · the real mechanism, cpuid (connecting) ────────────────────────────
export function CpuidReveal({ t }: StepCtx) {
  const bits = [1, 0, 1, 1, 0, 1, 0, 0, 1, 1, 1, 0, 1, 0, 1, 1];
  const pick = 10;
  return (
    <Svg label="Rust Standard Library Docs: is_x86_feature_detected!, quoted" h={280}>
      <T x={300} y={30} s={13} a="middle" f={C.crema} o={seg(t, 0.05, 0.3)}>is_x86_feature_detected!</T>
      <Draw pts={[[300, 40], [300, 76]]} t={t} from={0.3} to={0.6} stroke={C.latte} w={2} />
      <rect x={240} y={80} width={120} height={36} rx={5} fill="none" stroke={C.caramel} strokeWidth={2} opacity={seg(t, 0.5, 0.7)} />
      <Decode text="cpuid" t={t} at={0.6} dur={0.35} x={300} y={104} s={15} a="middle" f={C.caramel} w={700} />
      <Draw pts={[[300, 118], [300, 146]]} t={t} from={0.9} to={1.1} stroke={C.latte} w={2} />
      {bits.map((b, i) => {
        const k = easeOut(seg(t, 1.05 + i * 0.04, 1.25 + i * 0.04));
        const x = 60 + i * 30;
        return (
          <g key={i}>
            <rect x={x} y={150} width={26} height={26} rx={2} fill="none" stroke={C.mocha} strokeWidth={1.2} />
            {b === 1 && <rect x={x + 13 - 13 * k} y={150 + 13 - 13 * k} width={26 * k} height={26 * k} rx={2} fill={i === pick ? C.caramel : C.latte} />}
          </g>
        );
      })}
      <Reticle x={60 + pick * 30 + 13} y={163} w={38} h={38} t={t} at={1.8} />
      <T x={60 + pick * 30 + 13} y={204} s={13} a="middle" f={C.caramel} o={seg(t, 2.0, 2.2)}>avx2</T>
      <T x={40} y={248} s={13} f={C.crema} o={seg(t, 2.0, 2.3)}>“relies mostly on the cpuid instruction”</T>
      <Draw pts={[[40, 256], [370, 256]]} t={t} from={2.2} to={2.6} stroke={C.caramel} w={1.5} pen={false} />
    </Svg>
  );
}
// ── 10 · Recap ─────────────────────────────────────────────────────────────
// Eight values summed two ways: the scalar loop steps through them one at
// a time; the kernel takes all eight in one wide step. Then the lessons land.

// ── 10 · Recap ─────────────────────────────────────────────────────────────
export function Recap({ t }: StepCtx) {
  const scalar = Math.floor(seg(t, 0.2, 1.0) * 8 + 1e-6);
  const simd = seg(t, 0.4, 0.6) >= 1 ? 8 : 0;
  return (
    <Svg label="recap: what makes an explicit SIMD kernel sound" h={340}>
      <T x={40} y={30} s={13} f={C.latte}>scalar</T>
      <T x={40} y={74} s={13} f={C.caramel}>SIMD</T>
      {Array.from({ length: 8 }, (_, i) => (
        <g key={i}>
          <rect x={150 + i * 32} y={16} width={26} height={22} rx={2} fill={i < scalar ? C.latte : 'none'} stroke={C.mocha} />
          <rect x={150 + i * 32} y={60} width={26} height={22} rx={2} fill={i < simd ? C.caramel : 'none'} stroke={C.mocha} />
        </g>
      ))}
      {t > 0.6 && <rect x={146} y={56} width={8 * 32 + 2} height={30} rx={4} fill="none" stroke={C.caramel} strokeWidth={1.5} />}
      <RecapRows
        t={t}
        y0={130}
        gap={52}
        start={1.0}
        beat={0.3}
        lockAt={2.4}
        rows={[
          ['checked first: the real CPU genuinely supports it', true],
          ['the result: exact, identical to the scalar sum', true],
          ['the cost: far fewer ops, by the real lane width', true],
          ['the contract: the check is what makes it safe', true],
        ]}
        lock={3}
      />
    </Svg>
  );
}
