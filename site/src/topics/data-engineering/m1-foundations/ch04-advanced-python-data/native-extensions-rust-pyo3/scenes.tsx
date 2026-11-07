import { useEffect, useState } from 'react';
import { Bar, C, Plot, Svg, T } from '../../../../../reels/kit';
import type { StepCtx } from '../../../../../reels/types';
import { clamp, easeInOut, easeOut, easeOutBack, lerp, seg } from '../../../../../reels/anim';

/** Seconds since the learner answered a predict step (the player's clock has stopped by then), so reveals can animate. */
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
      if (d < 4) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [on]);
  return s;
}

/** A number counted up to its final value, with fixed decimals and thousands separators. */
function num(v: number, d = 0) {
  return v.toLocaleString('en-US', { minimumFractionDigits: d, maximumFractionDigits: d });
}

/** A label-left / value-right row, stacked vertically with generous gaps (DESIGN.md, phone text scaling).
 * `k` fades it in and slides it up a little; the value is whatever string the scene passes (a count in progress). */
function Row({ y, label, value, valueColor = C.crema, big = false, k = 1 }: { y: number; label: string; value: string; valueColor?: string; big?: boolean; k?: number }) {
  return (
    <g opacity={k} transform={`translate(0 ${((1 - k) * 10).toFixed(2)})`}>
      <T x={25} y={y} s={15} f={C.latte}>
        {label}
      </T>
      <T x={575} y={y} s={big ? 22 : 17} f={valueColor} a="end" w={600}>
        {value}
      </T>
    </g>
  );
}

/** A verdict tick at the right edge, drawn in by `k`. */
function Tick({ y, k, f = C.focus }: { y: number; k: number; f?: string }) {
  return <path d={`M540 ${y} l8 8 l16 -18`} fill="none" stroke={f} strokeWidth={3} strokeDasharray="40" strokeDashoffset={40 * (1 - k)} />;
}

/** A time bar that grows to its share over `k`; its figure fades in once the bar is most of the way there. */
function timeBar(x: number, y: number, frac: number, display: string, label: string, fill: string, k: number) {
  return (
    <g key={label} opacity={k > 0 ? 1 : 0}>
      <T x={x} y={y - 20} s={13} f={C.latte} o={clamp(k * 3, 0, 1)}>
        {label}
      </T>
      <Bar x={x} y={y} w={340 * frac * k} h={20} full={340} fill={fill} />
      <T x={x} y={y + 38} s={13} f={C.crema} o={seg(k, 0.6, 1)}>
        {display}
      </T>
    </g>
  );
}

/** Two timed rows that count up, each with a bar under it scaled to the slower one. */
function TwoTimes({ t, rows, max }: { t: number; rows: [string, number, number, string][]; max: number }) {
  return (
    <g>
      {rows.map(([label, ms, d, color], i) => {
        const k = easeOut(seg(t, 0.2 + i * 1.1, 0.8 + i * 1.1));
        const c = easeOut(seg(t, 0.3 + i * 1.1, 1.3 + i * 1.1));
        const y = 60 + i * 60;
        return (
          <g key={label}>
            <Row y={y} label={label} value={`${num(ms * c, d)} ms`} valueColor={color} big k={k} />
            <rect x={25} y={y + 14} width={k > 0 ? Math.max(3, 550 * (ms / max) * c) : 0} height={6} rx={3} fill={color} opacity={0.8} />
          </g>
        );
      })}
    </g>
  );
}

/** A predict step's verdict, sliding up into place once the learner has answered. */
function Verdict({ answer, text, y = 184, f = C.focus }: { answer: number | null; text: string; y?: number; f?: string }) {
  const s = useSinceAnswer(answer !== null);
  const v = answer !== null ? easeOut(seg(s, 0.1, 0.6)) : 0;
  if (answer === null) return null;
  return (
    <T x={300} y={lerp(y + 8, y, v)} s={15} f={f} a="middle" o={v}>
      {text}
    </T>
  );
}

/** A Row whose "?" becomes the answer once the learner has answered, underlined as it lands. */
function AnswerRow({ y, label, answer, value, k, f = C.focus }: { y: number; label: string; answer: number | null; value: string; k: number; f?: string }) {
  const s = useSinceAnswer(answer !== null);
  const u = answer !== null ? easeOut(seg(s, 0.2, 0.7)) : 0;
  const uw = Math.min(250, value.length * 10.7);
  return (
    <g>
      <Row y={y} label={label} value={answer !== null ? value : '?'} valueColor={answer !== null ? f : C.crema} k={k} />
      {answer !== null && <rect x={575 - uw * u} y={y + 12} width={uw * u} height={3} fill={f} />}
    </g>
  );
}

/** Twelve rows' values in physical order: one column matched to row order, one scattered across it. */
/** A cell with a centred label. */
function Cell({ x, y, w, h = 28, label, o = 1, stroke = C.mocha, f = C.crema }: { x: number; y: number; w: number; h?: number; label: string; o?: number; stroke?: string; f?: string }) {
  return (
    <g opacity={o}>
      <rect x={x} y={y} width={w} height={h} rx={4} fill={C.cocoa} stroke={stroke} strokeWidth={1.5} />
      <T x={x + w / 2} y={y + h / 2 + 4.5} s={12} f={f} a="middle">
        {label}
      </T>
    </g>
  );
}

/** A small cross drawn by `k`. */
function Cross({ x, y, k }: { x: number; y: number; k: number }) {
  return <path d={`M${x - 7} ${y - 7} l14 14 m0 -14 l-14 14`} stroke={C.cherryText} strokeWidth={2.5} opacity={k} />;
}

/** A small tick at (x, y), drawn by `k`. */
function MiniTick({ x, y, k, f = C.focus }: { x: number; y: number; k: number; f?: string }) {
  return <path d={`M${x} ${y} l4 4 l8 -9`} fill="none" stroke={f} strokeWidth={2} strokeDasharray="20" strokeDashoffset={20 * (1 - k)} />;
}

/** A library box whose Python lid lifts by `k` to show what sits underneath. */
function Lid({ x, y, w, name, under, k, uk }: { x: number; y: number; w: number; name: string; under: string; k: number; uk: number }) {
  return (
    <g>
      <rect x={x} y={y + 26} width={w} height={28} rx={4} fill={C.cocoa} stroke={C.second} strokeWidth={1.5} opacity={uk} />
      <T x={x + w / 2} y={y + 45} s={12} f={C.second} a="middle" o={uk}>
        {under}
      </T>
      <g transform={`translate(0 ${(-14 * k).toFixed(1)})`}>
        <rect x={x} y={y} width={w} height={26} rx={4} fill={C.cocoa} stroke={C.mocha} strokeWidth={1.5} />
        <T x={x + w / 2} y={y + 17} s={12} f={C.crema} a="middle">
          {name}
        </T>
      </g>
    </g>
  );
}

// 1 · Hook. Three of the chapter's fast libraries sit as closed boxes; each lid lifts a little, and what's underneath stays a
// question.
export function Hook({ t }: StepCtx) {
  const k = easeOut(seg(t, 1.6, 2.2));
  return (
    <Svg label="Polars, Pydantic's validation core, the ADBC driver — this chapter called all three fast. What are they actually written in?" h={220}>
      <Row y={40} label="called fast" value="written in what?" k={easeOut(seg(t, 0.3, 0.8))} />
      {['Polars', 'Pydantic', 'ADBC driver'].map((n, i) => (
        <g key={n} opacity={easeOut(seg(t, 0.5 + i * 0.25, 0.8 + i * 0.25))}>
          <Lid x={25 + i * 190} y={86} w={170} name={n} under="?" k={k} uk={easeOut(seg(t, 2.2, 2.6))} />
        </g>
      ))}
      <Row y={195} label="never opened" value="until now" valueColor={C.focus} k={easeOut(seg(t, 3.3, 3.8))} />
    </Svg>
  );
}

// 2 · Named directly. Polars' lid lifts on a Rust core; Pydantic's lifts on pydantic-core, Rust too, with its docs' own reason
// beside it.
export function RevealNamedDirectly({ t }: StepCtx) {
  return (
    <Svg label="Polars' own documentation, Pydantic's own documentation — what do they say they're written in?" h={220}>
      <Row y={40} label="their own docs" value="a Rust core" valueColor={C.second} k={easeOut(seg(t, 0.2, 0.7))} />
      <Lid x={25} y={86} w={250} name="Polars" under="core: Rust" k={easeOut(seg(t, 0.8, 1.3))} uk={easeOut(seg(t, 1.2, 1.6))} />
      <Lid x={325} y={86} w={250} name="Pydantic" under="pydantic-core: Rust" k={easeOut(seg(t, 2.0, 2.5))} uk={easeOut(seg(t, 2.4, 2.8))} />
      <Row y={195} label="named as" value="why they're fast" valueColor={C.focus} k={easeOut(seg(t, 3.3, 3.8))} />
    </Svg>
  );
}

// 3 · A real extension. lib.rs goes through maturin into a wheel; a plain import hot_transform pulls it in, and the call returns
// a checked answer.
export function RevealExtensionBuilds({ t }: StepCtx) {
  const steps = ['lib.rs', 'maturin build', 'a wheel', 'import hot_transform'];
  const w = [80, 125, 80, 215];
  const xs = [25, 120, 265, 360];
  return (
    <Svg label="a Rust function, compiled into Python with one build tool — does the import actually work?" h={220}>
      <Row y={40} label="one Rust function" value="one build tool" k={easeOut(seg(t, 0.2, 0.7))} />
      {steps.map((s, i) => {
        const k = easeOut(seg(t, 0.6 + i * 0.6, 1.0 + i * 0.6));
        return (
          <g key={s}>
            <Cell x={xs[i]} y={76} w={w[i]} label={s} o={k} stroke={i === 3 ? C.focus : C.mocha} f={i === 3 ? C.focus : C.crema} />
            {i > 0 && <path d={`M${xs[i - 1] + w[i - 1]} 90 H${xs[i]}`} stroke={C.latte} strokeWidth={1.5} opacity={k} />}
          </g>
        );
      })}
      <Cell x={360} y={124} w={215} h={24} label="normalize_and_sum_py" o={easeOut(seg(t, 3.0, 3.3))} />
      <MiniTick x={340} y={133} k={easeOut(seg(t, 3.3, 3.6))} />
      <Row y={195} label="the import" value="works, result correct" valueColor={C.focus} k={easeOut(seg(t, 3.6, 4.1))} />
    </Svg>
  );
}

// 4 · Predict: does releasing the lock let Python work? A Rust call holds the lock bar; beside it a Python thread waits; the bar
// opens mid-call; then the question.
export function PredictGilRelease({ t, answer }: StepCtx) {
  const o = easeOut(seg(t, 0.8, 1.2));
  return (
    <Svg label="a Rust extension explicitly releases the GIL mid-call — does a separate Python thread actually get to run, or is that just a formality?" h={210}>
      <Row y={40} label="the GIL released" value="real work, or show?" k={easeOut(seg(t, 0.1, 0.5))} />
      <rect x={25} y={60} width={300} height={12} rx={2} fill={C.second} opacity={0.75 * easeOut(seg(t, 0.2, 0.5))} />
      <rect x={25 + 100 * o} y={60} width={300 - 100 * o} height={12} rx={2} fill={C.cocoa} opacity={o > 0 ? 0.85 : 0} />
      <T x={25} y={94} s={11} f={C.latte} o={easeOut(seg(t, 0.3, 0.6))}>
        Rust call
      </T>
      <Cell x={400} y={58} w={175} h={24} label="a Python thread" o={easeOut(seg(t, 0.5, 0.8))} />
      <AnswerRow y={140} label="mostly a formality" answer={answer} value="no, real work" k={easeOut(seg(t, 1.2, 1.7))} />
      <Verdict answer={answer} text="the lock is real time, handed over" />
    </Svg>
  );
}

// 5 · Three ways, measured. 2,000,000 prices; all three answers are checked equal first, an equals sign joining them; only then
// do the timing bars grow, pure Python longest.
export function RevealThreeWays({ t }: StepCtx) {
  const e = easeOut(seg(t, 0.8, 1.4));
  return (
    <Svg label="the identical transformation, run as pure Python, as a compiled extension, and as a Polars expression — how do the real times compare?" h={250}>
      <Row y={40} label="2,000,000 prices" value="normalize and sum" k={easeOut(seg(t, 0.2, 0.7))} />
      {['pure Python', 'PyO3 extension', 'Polars'].map((l, i) => (
        <Cell key={l} x={25 + i * 190} y={64} w={170} label={l} o={easeOut(seg(t, 0.4 + i * 0.1, 0.7 + i * 0.1))} />
      ))}
      <T x={205} y={83} s={14} f={C.focus} a="middle" o={e}>
        =
      </T>
      <T x={395} y={83} s={14} f={C.focus} a="middle" o={e}>
        =
      </T>
      <T x={25} y={116} s={11} f={C.focus} o={e}>
        all three agree on the sum first
      </T>
      {[
        ['pure Python', 1, C.cherryText],
        ['PyO3', 0.2, C.focus],
      ].map(([l, f, c], i) => {
        const k = easeOut(seg(t, 1.8 + i * 0.4, 2.6 + i * 0.4));
        return (
          <g key={l as string} opacity={k > 0 ? 1 : 0}>
            <T x={25} y={146 + i * 22} s={11} f={C.latte}>
              {l as string}
            </T>
            <rect x={130} y={136 + i * 22} width={430 * (f as number) * k} height={12} rx={2} fill={c as string} opacity={0.8} />
          </g>
        );
      })}
      <Row y={215} label="the extension" value="well ahead of Python" valueColor={C.focus} k={easeOut(seg(t, 3.4, 3.9))} />
    </Svg>
  );
}

// 6 · The GIL, measured. The same 200 ms of busy work twice: holding the lock, the Python thread's counter barely moves;
// releasing it, the same thread's counter climbs far higher.
export function RevealGilMeasured({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.6, 1.4));
  const b = easeOut(seg(t, 1.8, 3.0));
  return (
    <Svg label="the identical busy work, once holding the GIL and once releasing it — how much does a separate Python thread actually get done?" h={230}>
      <Row y={40} label="200 ms of busy work" value="a Python thread counts" k={easeOut(seg(t, 0.2, 0.7))} />
      <T x={25} y={86} s={12} f={C.latte} o={easeOut(seg(t, 0.4, 0.7))}>
        GIL held
      </T>
      <rect x={160} y={76} width={60 * a} height={14} rx={2} fill={C.cherryText} opacity={0.8} />
      <T x={25} y={126} s={12} f={C.latte} o={easeOut(seg(t, 1.6, 1.9))}>
        GIL released
      </T>
      <rect x={160} y={116} width={400 * b} height={14} rx={2} fill={C.focus} opacity={0.85} />
      <T x={160} y={154} s={11} f={C.latte} o={easeOut(seg(t, 0.6, 0.9))}>
        the other thread's increments
      </T>
      <Row y={200} label="released vs held" value="over 3× the progress" valueColor={C.focus} k={easeOut(seg(t, 3.2, 3.7))} />
    </Svg>
  );
}

// 7 · abi3. The same source builds twice: the plain build's wheel is tagged to this one interpreter; with --features abi3 the
// wheel is tagged cp39-abi3, good from 3.9 upward.
export function RevealAbi3({ t }: StepCtx) {
  const r = easeOut(seg(t, 2.4, 3.2));
  return (
    <Svg label="the identical extension, built once per-version and once as abi3 — do the two wheel files actually differ, or is abi3 just a label?" h={230}>
      <Cell x={200} y={30} w={200} label="one crate" o={easeOut(seg(t, 0.2, 0.5))} />
      <path d={`M250 58 L${lerp(250, 150, easeOut(seg(t, 0.6, 1.0)))} 86 M350 58 L${lerp(350, 450, easeOut(seg(t, 1.4, 1.8)))} 86`} stroke={C.latte} strokeWidth={1.5} fill="none" />
      <Cell x={25} y={88} w={250} label="maturin build" o={easeOut(seg(t, 0.7, 1.0))} />
      <Cell x={325} y={88} w={250} label="--features abi3" stroke={C.focus} f={C.focus} o={easeOut(seg(t, 1.5, 1.8))} />
      <Cell x={25} y={136} w={250} label="tagged: this Python only" o={easeOut(seg(t, 1.1, 1.5))} />
      <Cell x={325} y={136} w={250} label="tagged: cp39-abi3" stroke={C.focus} f={C.focus} o={easeOut(seg(t, 1.9, 2.3))} />
      {[0, 1, 2, 3, 4].map((i) => (
        <rect key={i} x={335 + i * 48} y={174} width={40} height={8} rx={2} fill={C.focus} opacity={0.7 * clamp(r * 5 - i)} />
      ))}
      <Row y={212} label="abi3 covers" value="3.9 and every one after" valueColor={C.focus} k={easeOut(seg(t, 3.3, 3.8))} />
    </Svg>
  );
}

// 8 · Checked, not assumed. The interpreter is asked for Py_GIL_DISABLED; the answer comes back off, and the free-threaded
// build is crossed out for this sandbox.
export function RevealFreeThreadingChecked({ t }: StepCtx) {
  return (
    <Svg label="this sandbox's own interpreter, checked directly — is it actually a free-threaded build, or not?" h={220}>
      <Row y={40} label="asked directly" value="its build config" k={easeOut(seg(t, 0.2, 0.7))} />
      <Cell x={25} y={66} w={330} label='sysconfig: "Py_GIL_DISABLED"' o={easeOut(seg(t, 0.6, 1.0))} />
      <path d="M360 80 H395" stroke={C.latte} strokeWidth={1.5} opacity={easeOut(seg(t, 1.2, 1.5))} />
      <Cell x={400} y={66} w={175} label="off" stroke={C.second} f={C.second} o={easeOut(seg(t, 1.5, 1.9))} />
      <Cell x={25} y={116} w={330} label="free-threaded build" f={C.latte} o={easeOut(seg(t, 2.2, 2.6))} />
      <Cross x={375} y={130} k={easeOut(seg(t, 2.7, 3.0))} />
      <Row y={195} label="this sandbox" value="the GIL stays in" valueColor={C.focus} k={easeOut(seg(t, 3.3, 3.8))} />
    </Svg>
  );
}

// 9 · Recap. Five rows land one per beat.
export function Recap({ t }: StepCtx) {
  return (
    <Svg label="two libraries naming Rust directly, a real extension built and measured, a measured GIL release, two real wheels, one checked build fact" h={250}>
      <Row y={35} label="two fast libraries" value="a Rust core" valueColor={C.second} k={easeOut(seg(t, 0.4, 0.9))} />
      <Row y={80} label="a PyO3 extension" value="beats pure Python" valueColor={C.focus} k={easeOut(seg(t, 1.1, 1.6))} />
      <Row y={125} label="releasing the GIL" value="real progress elsewhere" k={easeOut(seg(t, 1.8, 2.3))} />
      <Row y={170} label="one feature flag" value="a wheel for many versions" valueColor={C.focus} k={easeOut(seg(t, 2.5, 3.0))} />
      <Row y={215} label="free-threading" value="checked, not guessed" k={easeOut(seg(t, 3.2, 3.7))} />
    </Svg>
  );
}

// 10 · Prove: one wheel per version. A single version-locked wheel, then three more versions each wanting their own; after the
// answer one abi3 wheel spans all four.
export function ProveIt({ t, answer }: StepCtx) {
  const s = useSinceAnswer(answer !== null);
  const k = answer !== null ? easeOut(seg(s, 0.1, 0.6)) : 0;
  const v = answer !== null ? easeOut(seg(s, 0.8, 1.2)) : 0;
  return (
    <Svg label="a team shipped a per-version wheel and now needs three more versions covered — what should they have chosen upfront, and why does it matter now?" h={230}>
      <Row y={40} label="3 more versions" value="3 more wheels?" k={easeOut(seg(t, 0.1, 0.5))} />
      <AnswerRow y={90} label="a wheel per version" answer={answer} value="no, abi3 upfront" k={easeOut(seg(t, 0.4, 0.9))} />
      {[0, 1, 2, 3].map((i) => (
        <rect
          key={i}
          x={25 + i * 70}
          y={112}
          width={60}
          height={14}
          rx={2}
          fill={i === 0 ? C.crema : 'none'}
          stroke={C.latte}
          strokeWidth={1}
          strokeDasharray={i === 0 ? undefined : '4 3'}
          opacity={easeOut(seg(t, 0.6 + i * 0.1, 0.9 + i * 0.1))}
        />
      ))}
      <rect x={25} y={136} width={270 * k} height={14} rx={2} fill={C.focus} opacity={0.85} />
      <T x={315} y={148} s={12} f={C.focus} o={k}>
        one abi3 wheel
      </T>
      {answer !== null && (
        <>
          <T x={300} y={lerp(198, 190, v)} s={15} f={C.focus} a="middle" o={v}>
            one wheel from its minimum up
          </T>
          <rect x={150} y={202} width={300 * v} height={3} fill={C.focus} />
        </>
      )}
    </Svg>
  );
}
