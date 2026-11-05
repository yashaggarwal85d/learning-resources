import { useEffect, useState } from 'react';
import { C, Draw, Reticle, Svg, T } from '../../../../../reels/kit';
import { easeInOut, easeOut, easeOutBack, lerp, seg } from '../../../../../reels/anim';
import type { StepCtx } from '../../../../../reels/types';

// CHAPTER.md, topic 6: the pipeline strip with a replay arrow looping back to the source — a deterministic,
// idempotent pipeline lands two equal bars, one with a hidden now() lands a different one (red) and the diff is
// counted; a window strip with the watermark as a moving vertical line and late events as dots behind it that
// either vanish (red, dropped) or enter a correction window and amend the published bar with a version tag
// (v1 → v2). Numbers are examples.py's: orders of 100, 250 and 75 sum to 425; the hidden clock gives 425.03 and
// 425.02; a late order of 40 amends 425 to 465; a 2% late-data rate needs a window of 149 units to catch 95% of
// late events, holding 1,490,000 events of state.

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

/** A box on the pipeline strip. */
const Box = ({ x, y, w = 110, label, f = C.primary, o = 1 }: { x: number; y: number; w?: number; label: string; f?: string; o?: number }) => (
  <g opacity={o}>
    <rect x={x} y={y} width={w} height={40} rx={4} fill={C.panel} stroke={f === C.primary ? C.line : f} strokeWidth={1.2} />
    <T x={x + w / 2} y={y + 25} s={13} f={f} a="middle">
      {label}
    </T>
  </g>
);

/** Dots travelling along a straight segment while `on`. */
const Flow = ({ a, b, t, from, n = 3, f = C.primary }: { a: [number, number]; b: [number, number]; t: number; from: number; n?: number; f?: string }) => (
  <g>
    {t > from &&
      Array.from({ length: n }, (_, i) => {
        const u = ((t - from) * 0.9 + i / n) % 1;
        return <circle key={i} cx={lerp(a[0], b[0], u)} cy={lerp(a[1], b[1], u)} r={3} fill={f} />;
      })}
  </g>
);

// 1 · The strip: orders → nightly job → revenue. Run one lands 425.03; a replay arrow loops back to the source; run two
// lands 425.02 beside it, and the 0.01 between them is counted.
export function Hook({ t }: StepCtx) {
  const loop = easeInOut(seg(t, 1.3, 2.0));
  return (
    <Svg label="the nightly job re-runs to fix a bug — last Tuesday's revenue changes by a small fraction, though nobody touched the data" h={280}>
      <Box x={30} y={40} label="orders" o={easeOut(seg(t, 0, 0.3))} />
      <Box x={230} y={40} w={140} label="nightly job" o={easeOut(seg(t, 0.1, 0.4))} />
      <Draw pts={[[140, 60], [230, 60]]} t={t} from={0.2} to={0.5} stroke={C.line} w={1.4} pen={false} />
      <Draw pts={[[370, 60], [440, 60]]} t={t} from={0.4} to={0.7} stroke={C.line} w={1.4} pen={false} />
      <Flow a={[140, 60]} b={[230, 60]} t={t} from={0.5} />
      <T x={450} y={48} s={13} f={C.secondary} o={easeOut(seg(t, 0.6, 0.9))}>
        run one
      </T>
      <T x={450} y={86} s={18} f={C.primary} w={700} o={easeOut(seg(t, 0.8, 1.1))}>
        425.03
      </T>
      {/* replay arrow loops back to the source */}
      {loop > 0 && (
        <path d={`M300 80 C300 ${lerp(80, 130, loop)} 85 ${lerp(80, 130, loop)} 85 ${lerp(80, 84, loop)}`} fill="none" stroke={C.focus} strokeWidth={1.6} strokeDasharray="5 4" />
      )}
      <T x={190} y={140} s={13} f={C.focus} a="middle" o={easeOut(seg(t, 1.5, 1.8))}>
        re-run, bug fixed
      </T>
      <T x={450} y={128} s={13} f={C.secondary} o={easeOut(seg(t, 2.0, 2.3))}>
        run two
      </T>
      <T x={450} y={166} s={18} f={C.badText} w={700} o={easeOut(seg(t, 2.2, 2.5))}>
        425.02
      </T>
      <Reticle x={480} y={160} w={86} h={30} t={t} at={2.6} color={C.badText} />
      <T x={40} y={204} s={14} f={C.primary} o={easeOut(seg(t, 0.9, 1.2))}>
        run one
      </T>
      <T x={575} y={204} s={14} f={C.secondary} a="end" o={easeOut(seg(t, 1.0, 1.3))}>
        one revenue figure
      </T>
      <T x={40} y={230} s={14} f={C.badText} o={easeOut(seg(t, 2.4, 2.7))}>
        run two, re-run
      </T>
      <T x={575} y={230} s={14} f={C.badText} a="end" o={easeOut(seg(t, 2.5, 2.8))}>
        a different figure
      </T>
      <T x={40} y={256} s={14} f={C.primary} o={easeOut(seg(t, 3.0, 3.3))}>
        the input
      </T>
      <T x={575} y={256} s={14} f={C.focus} a="end" o={easeOut(seg(t, 3.1, 3.4))}>
        confirmed, unchanged
      </T>
    </Svg>
  );
}

/** Three small icons for hidden non-determinism: a clock, swapped order arrows, a die. */
function Hidden({ x, y, k }: { x: number; y: number; k: number }) {
  return (
    <g opacity={k} fill="none" stroke={C.focus} strokeWidth={1.5}>
      <circle cx={x} cy={y} r={11} />
      <path d={`M${x} ${y - 7} V${y} L${x + 5} ${y + 3}`} />
      <path d={`M${x + 34} ${y - 5} h18 l-4 -4 M${x + 52} ${y + 5} h-18 l4 4`} />
      <rect x={x + 68} y={y - 10} width={20} height={20} rx={3} />
      <circle cx={x + 74} cy={y - 4} r={1.6} fill={C.focus} />
      <circle cx={x + 82} cy={y + 4} r={1.6} fill={C.focus} />
    </g>
  );
}

// 2 · The same three orders feed both runs (an equals sign between them); the job box is closed with a question mark.
// After the pick, the box opens to show what it was secretly reading: a clock, input order, an unseeded sample.
export function Predict1({ t, answer }: StepCtx) {
  const s = useSinceAnswer(answer !== null);
  const on = answer !== null;
  const open = on ? easeOutBack(seg(s, 0.3, 0.8)) : 0;
  return (
    <Svg label="which hidden non-determinism did the run actually depend on?" h={250}>
      {[0, 1].map((run) => (
        <g key={run} opacity={easeOut(seg(t, run * 0.2, run * 0.2 + 0.4))}>
          <T x={40} y={34 + run * 70} s={13} f={C.secondary}>
            run {run ? 'two' : 'one'}
          </T>
          {[100, 250, 75].map((v, i) => (
            <g key={v}>
              <rect x={120 + i * 52} y={18 + run * 70} width={44} height={26} rx={3} fill={C.band} stroke={C.line} />
              <T x={142 + i * 52} y={36 + run * 70} s={13} f={C.primary} a="middle">
                {v}
              </T>
            </g>
          ))}
        </g>
      ))}
      <T x={198} y={74} s={18} f={C.focus} a="middle" w={700} o={easeOut(seg(t, 0.6, 0.9))}>
        =
      </T>
      <g opacity={easeOut(seg(t, 0.5, 0.8))}>
        <rect x={340} y={20} width={210} height={94} rx={5} fill={C.panel} stroke={on ? C.focus : C.line} strokeWidth={on ? 1.6 : 1} />
        <T x={445} y={44} s={13} f={C.primary} a="middle">
          the job's own logic
        </T>
        {!on && (
          <T x={445} y={86} s={22} f={C.secondary} a="middle" w={700}>
            ?
          </T>
        )}
        {on && <Hidden x={400} y={80} k={Math.min(1, open)} />}
      </g>
      {!on && (
        <T x={300} y={180} s={15} f={C.secondary} a="middle" o={easeOut(seg(t, 1.0, 1.4))}>
          what else did it read?
        </T>
      )}
      {on && (
        <>
          <T x={40} y={176} s={14} f={C.primary} o={easeOut(seg(s, 0.2, 0.5))}>
            the data changed
          </T>
          <T x={575} y={176} s={14} f={C.secondary} a="end" o={easeOut(seg(s, 0.3, 0.6))}>
            confirmed, it didn't
          </T>
          <T x={40} y={210} s={14} f={C.focus} o={easeOut(seg(s, 0.9, 1.2))}>
            hidden non-determinism
          </T>
          <T x={575} y={236} s={14} f={C.focus} a="end" o={easeOut(seg(s, 1.0, 1.3))}>
            time, order, or sample
          </T>
        </>
      )}
    </Svg>
  );
}

// 3 · Left: f(x) runs three times on the same input and stamps the same 425 each time. Right: the same keyed write
// lands twice on Tuesday's row; the row count stays at one.
export function RevealDeterministicIdempotent({ t }: StepCtx) {
  const runs = Math.min(3, Math.floor(Math.max(0, t - 0.5) / 0.5) + (t > 0.5 ? 1 : 0));
  const w1 = easeOutBack(seg(t, 2.0, 2.4));
  const w2 = easeOutBack(seg(t, 2.8, 3.2));
  return (
    <Svg label="deterministic output from input alone, idempotent writes that don't change on repeat — together, a trustworthy re-run" h={250}>
      {/* deterministic */}
      <g opacity={easeOut(seg(t, 0, 0.3))}>
        <rect x={90} y={20} width={70} height={26} rx={3} fill={C.band} stroke={C.line} />
        <T x={125} y={38} s={13} f={C.primary} a="middle">
          orders
        </T>
        <Draw pts={[[160, 33], [190, 33]]} t={t} from={0.2} to={0.4} stroke={C.line} w={1.4} pen={false} />
        <rect x={190} y={16} width={50} height={34} rx={4} fill={C.panel} stroke={C.focus} />
        <T x={215} y={38} s={14} f={C.focus} a="middle" serif italic>
          f
        </T>
      </g>
      {Array.from({ length: runs }, (_, i) => (
        <g key={i} opacity={easeOut(seg(t, 0.5 + i * 0.5, 0.8 + i * 0.5))}>
          <Draw pts={[[240, 33], [262, 66 + i * 30 - 6]]} t={t} from={0.5 + i * 0.5} to={0.7 + i * 0.5} stroke={C.line} w={1.2} pen={false} />
          <T x={270} y={66 + i * 30} s={14} f={C.primary} w={600}>
            425
          </T>
        </g>
      ))}
      <T x={40} y={180} s={14} f={C.primary} o={easeOut(seg(t, 1.6, 1.9))}>
        deterministic
      </T>
      <T x={40} y={204} s={13} f={C.secondary} o={easeOut(seg(t, 1.7, 2.0))}>
        same input, same output
      </T>
      {/* idempotent */}
      <g opacity={easeOut(seg(t, 1.6, 1.9))}>
        <rect x={360} y={20} width={210} height={100} rx={4} fill={C.panel} stroke={C.line} />
        <T x={372} y={42} s={13} f={C.secondary}>
          key
        </T>
        <T x={560} y={42} s={13} f={C.secondary} a="end">
          revenue
        </T>
        <line x1={360} y1={50} x2={570} y2={50} stroke={C.line} />
        <T x={372} y={74} s={14} f={C.primary}>
          tuesday
        </T>
        <T x={560} y={74} s={14} f={C.primary} a="end" o={Math.min(1, w1)}>
          425
        </T>
        <T x={372} y={106} s={13} f={C.quiet}>
          rows: 1
        </T>
      </g>
      {w1 > 0 && w1 < 1 && <rect x={470} y={58} width={96} height={22} fill="none" stroke={C.focus} strokeWidth={1.4} />}
      {w2 > 0 && (
        <g opacity={Math.min(1, w2) * (1 - easeOut(seg(t, 3.4, 3.8)))} transform={`translate(0 ${(1 - Math.min(1, w2)) * -26})`}>
          <rect x={470} y={58} width={96} height={22} fill="none" stroke={C.focus} strokeWidth={1.4} strokeDasharray="4 3" />
        </g>
      )}
      <T x={575} y={140} s={13} f={C.focus} a="end" o={easeOut(seg(t, 3.2, 3.5))}>
        written twice, still one row
      </T>
      <T x={575} y={180} s={14} f={C.focus} a="end" o={easeOut(seg(t, 3.3, 3.6))}>
        idempotent
      </T>
      <T x={575} y={204} s={13} f={C.secondary} a="end" o={easeOut(seg(t, 3.4, 3.7))}>
        write twice, same result
      </T>
      <T x={300} y={240} s={14} f={C.focus} a="middle" o={easeOut(seg(t, 3.8, 4.2))}>
        together: a re-run you can trust
      </T>
    </Svg>
  );
}

// 4 · Two pairs of bars. The fixed pipeline's replay lands exactly on the first bar. The hidden now() lands its second
// bar a hair off (drawn exaggerated, magnified), red, and the difference is counted to 0.01.
export function RevealReplayedTwice({ t }: StepCtx) {
  const base = 210, H = 140;
  const a = easeOut(seg(t, 0.2, 0.8)), b = easeOut(seg(t, 0.8, 1.4));
  const c = easeOut(seg(t, 1.8, 2.4)), d = easeOut(seg(t, 2.4, 3.0));
  const off = 10; // the exaggerated gap that stands for 0.01
  return (
    <Svg label="a deterministic, idempotent pipeline replayed lands identical bars — a hidden now() lands a different one, counted" h={290}>
      <line x1={40} y1={base} x2={570} y2={base} stroke={C.line} opacity={easeOut(seg(t, 0, 0.3))} />
      <rect x={80} y={base - H * a} width={60} height={H * a} fill={C.primary} />
      <rect x={160} y={base - H * b} width={60} height={H * b} fill={C.primary} />
      <T x={150} y={base + 22} s={13} f={C.primary} a="middle" o={easeOut(seg(t, 0.2, 0.5))}>
        fixed pipeline
      </T>
      <T x={150} y={base - H - 10} s={13} f={C.focus} a="middle" o={easeOut(seg(t, 1.4, 1.7))}>
        425 = 425
      </T>
      <rect x={340} y={base - H * c} width={60} height={H * c} fill={C.primary} />
      <rect x={420} y={base - (H - off) * d} width={60} height={(H - off) * d} fill={C.bad} stroke={C.badText} />
      <T x={410} y={base + 22} s={13} f={C.primary} a="middle" o={easeOut(seg(t, 1.8, 2.1))}>
        hidden now()
      </T>
      {d > 0.98 && (
        <g>
          <line x1={404} y1={base - H} x2={490} y2={base - H} stroke={C.focus} strokeDasharray="3 3" />
          <line x1={486} y1={base - H} x2={486} y2={base - H + off} stroke={C.badText} strokeWidth={2} />
        </g>
      )}
      <T x={498} y={base - H + 10} s={14} f={C.badText} w={700} o={easeOut(seg(t, 3.0, 3.3))}>
        Δ {(0.01 * easeInOut(seg(t, 3.0, 3.6))).toFixed(2)}
      </T>
      <T x={410} y={base - H - 24} s={13} f={C.secondary} a="middle" o={easeOut(seg(t, 2.6, 2.9))}>
        425.03 vs 425.02
      </T>
      <T x={40} y={256} s={14} f={C.primary} o={easeOut(seg(t, 1.2, 1.5))}>
        fixed pipeline
      </T>
      <T x={575} y={256} s={14} f={C.primary} a="end" o={easeOut(seg(t, 1.3, 1.6))}>
        two identical bars
      </T>
      <T x={40} y={282} s={14} f={C.badText} o={easeOut(seg(t, 3.2, 3.5))}>
        hidden now()
      </T>
      <T x={575} y={282} s={14} f={C.badText} a="end" o={easeOut(seg(t, 3.3, 3.6))}>
        a different bar, red
      </T>
    </Svg>
  );
}

// event times (0..1 along the axis) and the moment each arrives; the last two arrive after the watermark passed them
const EVENTS: [number, number][] = [
  [0.08, 0.3],
  [0.18, 0.7],
  [0.3, 1.1],
  [0.42, 1.5],
  [0.55, 1.9],
  [0.66, 2.3],
  [0.2, 2.7],
  [0.38, 3.2],
];

/** The watermark's position (0..1) at time t. */
const wm = (t: number) => Math.min(0.85, Math.max(0, (t - 0.4) * 0.26));

// 5 · An event-time axis; dots drop onto it as they arrive; the watermark line sweeps right; the two dots that land
// behind it after it passed are late and ring in pale blue.
export function RevealWatermarkLateEvents({ t }: StepCtx) {
  const X0 = 40, X1 = 560, AY = 140;
  const w = wm(t);
  return (
    <Svg label="the watermark asserts input is complete up to here — events behind it arrive late" h={250}>
      <line x1={X0} y1={AY} x2={X1} y2={AY} stroke={C.line} opacity={easeOut(seg(t, 0, 0.3))} />
      <T x={X1} y={AY + 22} s={13} f={C.quiet} a="end" o={easeOut(seg(t, 0, 0.3))}>
        event time →
      </T>
      <rect x={X0} y={AY - 80} width={(X1 - X0) * w} height={80} fill={C.band} opacity={0.6} />
      <line x1={lerp(X0, X1, w)} y1={AY - 96} x2={lerp(X0, X1, w)} y2={AY + 8} stroke={C.focus} strokeWidth={2} opacity={easeOut(seg(t, 0.3, 0.6))} />
      <T x={lerp(X0, X1, w)} y={AY - 102} s={13} f={C.focus} a="middle" o={easeOut(seg(t, 0.3, 0.6))}>
        watermark
      </T>
      {EVENTS.map(([et, arrive], i) => {
        const k = easeOut(seg(t, arrive, arrive + 0.4));
        if (k <= 0) return null;
        const late = et < wm(arrive);
        const x = lerp(X0, X1, et);
        return (
          <g key={i}>
            <circle cx={x} cy={lerp(AY - 70, AY - 8, k)} r={6} fill={late ? C.second : C.primary} />
            {late && k > 0.9 && <circle cx={x} cy={AY - 8} r={11} fill="none" stroke={C.second} strokeWidth={1.4} />}
          </g>
        );
      })}
      <T x={40} y={204} s={14} f={C.primary} o={easeOut(seg(t, 0.6, 0.9))}>
        the watermark
      </T>
      <T x={575} y={204} s={14} f={C.primary} a="end" o={easeOut(seg(t, 0.7, 1.0))}>
        a moving line
      </T>
      <T x={40} y={232} s={14} f={C.second} o={easeOut(seg(t, 3.0, 3.3))}>
        late events
      </T>
      <T x={575} y={232} s={14} f={C.second} a="end" o={easeOut(seg(t, 3.1, 3.4))}>
        trail behind it
      </T>
    </Svg>
  );
}

// 6 · The same late order of 40 arrives at two pipelines. Without a window it falls through and fades (red, dropped)
// while the published bar stays at 425. With a correction window it lands in the shaded band and the bar grows to
// 465, tagged v2, with v1 kept as a ghost beside it.
export function RevealCorrectionWindow({ t }: StepCtx) {
  const drop1 = easeIn(seg(t, 0.6, 1.4));
  const drop2 = easeInOut(seg(t, 1.8, 2.5));
  const amend = easeInOut(seg(t, 2.5, 3.2));
  return (
    <Svg label="a late event either vanishes, dropped, or lands in a correction window and amends the published result" h={270}>
      {[
        ['no window', 40],
        ['correction window', 320],
      ].map(([name, x], i) => (
        <g key={name as string} opacity={easeOut(seg(t, i * 0.15, i * 0.15 + 0.3))}>
          <T x={(x as number) + 120} y={24} s={14} f={i ? C.focus : C.primary} a="middle" w={600}>
            {name}
          </T>
          <line x1={x as number} y1={150} x2={(x as number) + 140} y2={150} stroke={C.line} />
        </g>
      ))}
      {/* no window: the dot falls through the line and fades */}
      {drop1 < 1 && <circle cx={110} cy={lerp(50, 200, drop1)} r={7} fill={drop1 > 0.6 ? C.badText : C.second} opacity={1 - Math.max(0, drop1 - 0.6) * 2.5} />}
      <rect x={200} y={150 - 80} width={40} height={80} fill={C.primary} opacity={easeOut(seg(t, 0.2, 0.5))} />
      <T x={220} y={60} s={13} f={C.primary} a="middle" o={easeOut(seg(t, 0.2, 0.5))}>
        425
      </T>
      <T x={110} y={186} s={14} f={C.badText} a="middle" o={easeOut(seg(t, 1.3, 1.6))}>
        dropped, lost
      </T>
      {/* correction window */}
      <rect x={330} y={100} width={90} height={50} fill={C.band} stroke={C.focus} strokeDasharray="4 3" opacity={easeOut(seg(t, 0.4, 0.7))} />
      <T x={375} y={170} s={13} f={C.secondary} a="middle" o={easeOut(seg(t, 0.5, 0.8))}>
        window
      </T>
      {drop2 > 0 && amend < 1 && <circle cx={375} cy={lerp(50, 128, drop2)} r={7} fill={C.second} opacity={1 - amend} />}
      <rect x={470} y={150 - 80} width={34} height={80} fill={C.primary} opacity={0.35 * easeOut(seg(t, 0.2, 0.5))} />
      <T x={487} y={166} s={13} f={C.quiet} a="middle" o={easeOut(seg(t, 0.2, 0.5))}>
        v1
      </T>
      <rect x={512} y={150 - 80 - 8 * amend} width={34} height={80 + 8 * amend} fill={amend > 0 ? C.focus : C.primary} opacity={amend > 0 ? 1 : 0} />
      <T x={529} y={166} s={13} f={C.focus} a="middle" o={amend}>
        v2
      </T>
      <T x={510} y={56} s={13} f={C.focus} a="middle" o={easeOut(seg(t, 2.6, 2.9))}>
        {Math.round(425 + 40 * amend)}
      </T>
      <T x={40} y={226} s={14} f={C.primary} o={easeOut(seg(t, 1.4, 1.7))}>
        no window
      </T>
      <T x={575} y={226} s={14} f={C.badText} a="end" o={easeOut(seg(t, 1.5, 1.8))}>
        dropped, lost
      </T>
      <T x={40} y={254} s={14} f={C.focus} o={easeOut(seg(t, 3.1, 3.4))}>
        correction window
      </T>
      <T x={575} y={254} s={14} f={C.focus} a="end" o={easeOut(seg(t, 3.2, 3.5))}>
        amended, v1 to v2
      </T>
    </Svg>
  );
}

const easeIn = (x: number) => x * x;

// 7 · Captured fraction against window width for a 2% late rate: the curve climbs to the 95% target at 149 units;
// underneath, the state held grows with the width to 1,490,000 events.
export function RevealWindowSizing({ t }: StepCtx) {
  const X0 = 70, X1 = 540, Y0 = 150, H = 110, WMAX = 200;
  const pts = Array.from({ length: 41 }, (_, i) => {
    const w = (i / 40) * WMAX;
    return [lerp(X0, X1, w / WMAX), Y0 - H * (1 - Math.pow(0.98, w))] as const;
  });
  const hit = easeInOut(seg(t, 1.8, 2.4));
  const xHit = lerp(X0, X1, 149 / WMAX);
  const yT = Y0 - H * 0.95;
  const state = easeInOut(seg(t, 2.4, 3.4));
  return (
    <Svg label="a stated late-data rate sets how wide the window must be — a real cost in state and in visible change" h={300}>
      <T x={X0} y={24} s={13} f={C.secondary} o={easeOut(seg(t, 0, 0.3))}>
        late events caught · late-data rate 2%
      </T>
      <line x1={X0} y1={Y0} x2={X1} y2={Y0} stroke={C.line} opacity={easeOut(seg(t, 0, 0.3))} />
      <line x1={X0} y1={Y0} x2={X0} y2={Y0 - H - 6} stroke={C.line} opacity={easeOut(seg(t, 0, 0.3))} />
      <Draw pts={pts} t={t} from={0.3} to={1.6} stroke={C.primary} w={2} pen={false} />
      <line x1={X0} y1={yT} x2={X1} y2={yT} stroke={C.focus} strokeDasharray="4 4" opacity={easeOut(seg(t, 1.2, 1.5))} />
      <T x={X0 - 8} y={yT + 5} s={13} f={C.focus} a="end" o={easeOut(seg(t, 1.2, 1.5))}>
        95%
      </T>
      <line x1={xHit} y1={yT} x2={xHit} y2={lerp(yT, Y0, hit)} stroke={C.focus} strokeWidth={1.6} />
      <T x={xHit} y={Y0 + 20} s={13} f={C.focus} a="middle" o={easeOut(seg(t, 2.2, 2.5))}>
        {Math.round(149 * hit)} units wide
      </T>
      <T x={X1} y={Y0 - 8} s={13} f={C.quiet} a="end" o={easeOut(seg(t, 0, 0.3))}>
        width →
      </T>
      {/* state held */}
      <T x={X0} y={198} s={13} f={C.secondary} o={easeOut(seg(t, 2.4, 2.7))}>
        state held
      </T>
      <rect x={X0 + 100} y={186} width={(X1 - X0 - 100) * 0.745 * state} height={14} fill={C.second} opacity={0.85} />
      <T x={X1} y={224} s={13} f={C.second} a="end" o={easeOut(seg(t, 2.6, 2.9))}>
        {Math.round(1_490_000 * state).toLocaleString('en-US')} events
      </T>
      <T x={40} y={260} s={14} f={C.primary} o={easeOut(seg(t, 1.0, 1.3))}>
        late-data rate
      </T>
      <T x={575} y={260} s={14} f={C.primary} a="end" o={easeOut(seg(t, 1.1, 1.4))}>
        sets window width
      </T>
      <T x={40} y={288} s={14} f={C.focus} o={easeOut(seg(t, 3.3, 3.6))}>
        wider window
      </T>
      <T x={575} y={288} s={14} f={C.focus} a="end" o={easeOut(seg(t, 3.4, 3.7))}>
        more state, more cost
      </T>
    </Svg>
  );
}

// 8 · An append-only version log: v1 written, then a correction appended as v2 (v1 stays). A consumer pins v1; an
// auditor's lens rebuilds what was reported.
export function RevealVersionedOutputs({ t }: StepCtx) {
  const ROWS: [string, string, string, string][] = [
    ['v1', 'logic a', 'cut-off tue', '425'],
    ['v2', 'logic a', 'tue + late', '465'],
  ];
  return (
    <Svg label="every published result carries the version of logic and data that produced it — a correction appends, never overwrites" h={270}>
      <g opacity={easeOut(seg(t, 0, 0.3))}>
        <rect x={40} y={20} width={400} height={128} rx={4} fill={C.panel} stroke={C.line} />
        {['ver', 'logic', 'data cut-off', 'revenue'].map((h, i) => (
          <T key={h} x={[56, 120, 220, 425][i]} y={44} s={13} f={C.quiet} a={i === 3 ? 'end' : 'start'}>
            {h}
          </T>
        ))}
        <line x1={40} y1={54} x2={440} y2={54} stroke={C.line} />
      </g>
      {ROWS.map((r, i) => {
        const at = 0.4 + i * 1.2;
        const k = easeOutBack(seg(t, at, at + 0.4));
        if (k <= 0) return null;
        return (
          <g key={r[0]} opacity={Math.min(1, k)} transform={`translate(0 ${(1 - Math.min(1, k)) * 20})`}>
            {r.map((c, j) => (
              <T key={j} x={[56, 120, 220, 425][j]} y={82 + i * 36} s={14} f={i === 1 ? C.focus : C.primary} a={j === 3 ? 'end' : 'start'} w={j === 0 ? 700 : 500}>
                {c}
              </T>
            ))}
          </g>
        );
      })}
      <T x={300} y={168} s={13} f={C.secondary} a="middle" o={easeOut(seg(t, 1.8, 2.1))}>
        appended, nothing overwritten
      </T>
      {/* consumer pin */}
      <g opacity={easeOut(seg(t, 2.4, 2.7))}>
        <Draw pts={[[500, 70], [446, 78]]} t={t} from={2.4} to={2.7} stroke={C.focus} w={1.4} pen={false} />
        <circle cx={510} cy={66} r={7} fill="none" stroke={C.focus} strokeWidth={1.6} />
        <line x1={510} y1={73} x2={510} y2={86} stroke={C.focus} strokeWidth={1.6} />
        <T x={510} y={106} s={13} f={C.focus} a="middle">
          pin v1
        </T>
      </g>
      {/* auditor lens */}
      <g opacity={easeOut(seg(t, 3.0, 3.3))}>
        <circle cx={510} cy={136} r={10} fill="none" stroke={C.primary} strokeWidth={1.6} />
        <line x1={517} y1={143} x2={527} y2={153} stroke={C.primary} strokeWidth={1.6} />
        <T x={510} y={176} s={13} f={C.primary} a="middle">
          rebuild
        </T>
      </g>
      <T x={40} y={222} s={14} f={C.primary} o={easeOut(seg(t, 1.9, 2.2))}>
        each version
      </T>
      <T x={575} y={222} s={14} f={C.primary} a="end" o={easeOut(seg(t, 2.0, 2.3))}>
        a new append
      </T>
      <T x={40} y={252} s={14} f={C.focus} o={easeOut(seg(t, 3.2, 3.5))}>
        a consumer, auditor
      </T>
      <T x={575} y={252} s={14} f={C.focus} a="end" o={easeOut(seg(t, 3.3, 3.6))}>
        pin it, reconstruct it
      </T>
    </Svg>
  );
}

// 9 · The four ideas return as small marks beside their captions: two equal bars, a watermark with a late dot, a bar
// growing v1 → v2, a stack of version rows.
export function Recap({ t }: StepCtx) {
  const rows: [string, string][] = [
    ['replay', 'deterministic, idempotent'],
    ['late events', 'watermark, then window'],
    ['corrections', 'amend, never drop'],
    ['outputs', 'versioned, pinnable'],
  ];
  return (
    <Svg label="deterministic and idempotent for trustworthy replay, the watermark and correction window for late data, versioned outputs tying it together" h={280}>
      {rows.map(([label, value], i) => {
        const y = 44 + i * 64;
        const k = easeOut(seg(t, 0.2 + i * 0.7, 0.55 + i * 0.7));
        return (
          <g key={label} opacity={k}>
            <T x={100} y={y} s={14} f={i === 2 ? C.focus : C.primary}>
              {label}
            </T>
            <T x={575} y={y} s={14} f={i === 2 ? C.focus : C.secondary} a="end">
              {value}
            </T>
          </g>
        );
      })}
      <g opacity={easeOut(seg(t, 0.2, 0.5))}>
        <rect x={34} y={26} width={14} height={22} fill={C.primary} />
        <rect x={54} y={26} width={14} height={22} fill={C.primary} />
      </g>
      <g opacity={easeOut(seg(t, 0.9, 1.2))}>
        <line x1={28} y1={110} x2={80} y2={110} stroke={C.line} />
        <line x1={lerp(40, 66, easeInOut(seg(t, 0.9, 1.6)))} y1={88} x2={lerp(40, 66, easeInOut(seg(t, 0.9, 1.6)))} y2={112} stroke={C.focus} strokeWidth={1.6} />
        <circle cx={36} cy={104} r={4} fill={C.second} />
      </g>
      <g opacity={easeOut(seg(t, 1.6, 1.9))}>
        <rect x={34} y={174 - 16 - 6 * easeInOut(seg(t, 1.7, 2.3))} width={14} height={16 + 6 * easeInOut(seg(t, 1.7, 2.3))} fill={C.focus} />
        <rect x={54} y={158} width={14} height={16} fill={C.primary} opacity={0.4} />
      </g>
      <g opacity={easeOut(seg(t, 2.3, 2.6))}>
        {[0, 1, 2].map((i) => (
          <rect key={i} x={30} y={218 + i * 9} width={44} height={6} fill={i === 2 ? C.focus : C.secondary} opacity={easeOut(seg(t, 2.3 + i * 0.2, 2.5 + i * 0.2))} />
        ))}
      </g>
    </Svg>
  );
}

/** An envelope at (x, y). */
const Env = ({ x, y, f, o = 1 }: { x: number; y: number; f: string; o?: number }) => (
  <g opacity={o} fill="none" stroke={f} strokeWidth={1.6}>
    <rect x={x - 16} y={y - 11} width={32} height={22} rx={2} />
    <path d={`M${x - 16} ${y - 11} L${x} ${y + 2} L${x + 16} ${y - 11}`} />
  </g>
);

// 10 · The strip forks: the idempotent table on one branch, an email receipt on the other. After the pick, a replay
// runs: the table keeps one row, the email goes out a second time in red, and then a dedup key at the email blocks it.
export function ProveIt({ t, answer }: StepCtx) {
  const s = useSinceAnswer(answer !== null);
  const on = answer !== null;
  const replay = on ? easeInOut(seg(s, 0.2, 1.0)) : 0;
  const second = on ? easeOutBack(seg(s, 1.0, 1.4)) : 0;
  const keyed = on ? easeOutBack(seg(s, 2.0, 2.4)) : 0;
  return (
    <Svg label="the pipeline also sends an email receipt — does a deterministic, idempotent pipeline make that side effect safe to replay too?" h={290}>
      <Box x={30} y={70} w={130} label="pipeline" o={easeOut(seg(t, 0, 0.3))} />
      <Draw pts={[[160, 90], [220, 50], [320, 50]]} t={t} from={0.2} to={0.5} stroke={C.line} w={1.4} pen={false} />
      <Draw pts={[[160, 90], [220, 130], [320, 130]]} t={t} from={0.3} to={0.6} stroke={C.line} w={1.4} pen={false} />
      <Box x={320} y={30} w={130} label="revenue table" o={easeOut(seg(t, 0.4, 0.7))} />
      <Box x={320} y={110} w={130} label="email receipt" o={easeOut(seg(t, 0.5, 0.8))} />
      <T x={470} y={56} s={13} f={C.secondary} o={easeOut(seg(t, 0.6, 0.9))}>
        rows: 1
      </T>
      <Env x={490} y={130} f={C.primary} o={easeOut(seg(t, 0.8, 1.1))} />
      {replay > 0 && (
        <path d={`M95 110 C95 ${lerp(110, 160, replay)} 60 ${lerp(110, 160, replay)} 60 ${lerp(110, 112, replay)}`} fill="none" stroke={C.focus} strokeWidth={1.6} strokeDasharray="5 4" />
      )}
      <T x={95} y={178} s={13} f={C.focus} a="middle" o={on ? easeOut(seg(s, 0.4, 0.7)) : 0}>
        replay
      </T>
      {second > 0 && <Env x={540} y={130} f={keyed > 0.5 ? C.quiet : C.badText} o={Math.min(1, second) * (keyed > 0.5 ? 0.4 : 1)} />}
      {second > 0 && keyed <= 0.5 && (
        <T x={540} y={164} s={13} f={C.badText} a="middle" o={Math.min(1, second)}>
          sent twice
        </T>
      )}
      {keyed > 0 && (
        <g opacity={Math.min(1, keyed)} transform={`translate(0 ${(1 - Math.min(1, keyed)) * -14})`}>
          <rect x={330} y={156} width={110} height={22} rx={11} fill={C.ink} stroke={C.focus} />
          <T x={385} y={172} s={13} f={C.focus} a="middle">
            dedup key
          </T>
          <line x1={526} y1={116} x2={554} y2={144} stroke={C.focus} strokeWidth={2} />
        </g>
      )}
      {!on && (
        <T x={300} y={226} s={15} f={C.secondary} a="middle" o={easeOut(seg(t, 1.0, 1.4))}>
          safe to replay the email too?
        </T>
      )}
      {on && (
        <>
          <T x={40} y={214} s={14} f={C.primary} o={easeOut(seg(s, 0.3, 0.6))}>
            an email receipt
          </T>
          <T x={575} y={214} s={14} f={C.secondary} a="end" o={easeOut(seg(s, 0.4, 0.7))}>
            an external effect
          </T>
          <T x={40} y={242} s={14} f={C.badText} o={easeOut(seg(s, 1.2, 1.5))}>
            pipeline's own safety
          </T>
          <T x={575} y={242} s={14} f={C.badText} a="end" o={easeOut(seg(s, 1.3, 1.6))}>
            doesn't reach outside
          </T>
          <T x={40} y={270} s={14} f={C.focus} o={easeOut(seg(s, 2.2, 2.5))}>
            the fix
          </T>
          <T x={575} y={270} s={14} f={C.focus} a="end" o={easeOut(seg(s, 2.3, 2.6))}>
            the effect needs its own key
          </T>
        </>
      )}
    </Svg>
  );
}
