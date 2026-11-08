import { useEffect, useState } from 'react';
import { Bar, C, Plot, Reticle, Svg, T } from '../../../../../reels/kit';
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
/** A small padlock at (x, y), drawn in by `k`. */
function Lock({ x, y, k, f = C.second }: { x: number; y: number; k: number; f?: string }) {
  return (
    <g opacity={k}>
      <path d={`M${x + 3} ${y} v-4 a5 5 0 0 1 10 0 v4`} fill="none" stroke={f} strokeWidth={2} />
      <rect x={x} y={y} width={16} height={12} rx={2} fill={f} />
    </g>
  );
}
/** A request arrow from (x1, y) toward x2, drawn by `k`, with a small label above it. */
function Req({ x1, x2, y, k, label, f = C.crema, back = 0 }: { x1: number; x2: number; y: number; k: number; label?: string; f?: string; back?: number }) {
  const x = lerp(x1, x2, k) - (x2 - x1) * 0.35 * back;
  return (
    <g opacity={k > 0 ? 1 : 0}>
      <line x1={x1} y1={y} x2={x} y2={y} stroke={f} strokeWidth={1.8} />
      <path d={`M${x} ${y} l${back > 0 ? 8 : -8} -5 v10 z`} fill={f} />
      {label && (
        <T x={(x1 + x2) / 2} y={y - 9} s={11} f={f} a="middle">
          {label}
        </T>
      )}
    </g>
  );
}
function Pip({ x, y, o = 1, f = C.second, s = 10 }: { x: number; y: number; o?: number; f?: string; s?: number }) {
  return <rect x={x - s / 2} y={y - s / 2} width={s} height={s} rx={2} fill={f} opacity={o} />;
}

function Hole({ x, y, w, h = 28, o = 1, stroke = C.mocha }: { x: number; y: number; w: number; h?: number; o?: number; stroke?: string }) {
  return <rect x={x} y={y} width={w} height={h} rx={4} fill="none" stroke={stroke} strokeWidth={1.5} strokeDasharray="4 3" opacity={o} />;
}
/** A fan line from (x1, y1) to (x2, y2), drawn by `k`, ending in a dot. */

/** A vertical arrow from (x, y1) toward y2, drawn by `k`. */
function VArrow({ x, y1, y2, k, f = C.crema }: { x: number; y1: number; y2: number; k: number; f?: string }) {
  if (k <= 0) return null;
  const y = lerp(y1, y2, k);
  const d = y2 > y1 ? 1 : -1;
  return (
    <g>
      <line x1={x} y1={y1} x2={x} y2={y} stroke={f} strokeWidth={1.8} />
      <path d={`M${x} ${y} l-5 ${-8 * d} h10 z`} fill={f} />
    </g>
  );
}

/** The chapter's control loop: a thin rail between the desired strip and the live strip, with a dot running round it. */
function Loop({ x, y1, y2, t, o = 1, f = C.latte }: { x: number; y1: number; y2: number; t: number; o?: number; f?: string }) {
  const p = (t * 0.9) % 1;
  const y = p < 0.5 ? lerp(y2, y1, p * 2) : lerp(y1, y2, (p - 0.5) * 2);
  return (
    <g opacity={o}>
      <line x1={x} y1={y1} x2={x} y2={y2} stroke={C.mocha} strokeWidth={1.4} />
      <circle cx={x} cy={y} r={4} fill={f} />
    </g>
  );
}

// Every value on screen is examples.py's own: the hand-edited timeout (10 in git, 30 live), the image going v1 to v2, the
// replica count of 3 against the autoscaler's 7 (and the 5 of its plain out-of-sync case), resources a and b, the
// Synced and OutOfSync statuses, and the allow-empty guard. Desired state is always the upper strip, live state the lower.

// 0 · Hook. Git and the cluster agree. At three in the morning the live timeout turns red by hand; git never hears of it.
// Three weeks tick by, then an unrelated deploy comes down the arrow.
export function Hook({ t: t0 }: StepCtx) {
  const t = t0 * 1.55;
  const k = (d: number) => easeOut(seg(t, d, d + 0.35));
  const edited = t > 0.8;
  return (
    <Svg label="Someone fixes an incident by hand at three in the morning, and never tells anyone" h={250}>
      <T x={25} y={58} s={12} f={C.latte} o={k(0)}>
        git
      </T>
      <Cell x={120} y={40} w={130} label="timeout: 10" o={k(0)} />
      <Cell x={270} y={40} w={110} label="image: v1" o={k(0)} />
      <T x={25} y={168} s={12} f={C.latte} o={k(0.2)}>
        cluster
      </T>
      <Cell x={120} y={150} w={130} label={edited ? 'timeout: 30' : 'timeout: 10'} stroke={edited ? C.cherryText : C.mocha} o={k(0.2)} />
      <Cell x={270} y={150} w={110} label="image: v1" o={k(0.2)} />
      <rect x={120} y={184} width={Math.max(0, 130 * easeOut(seg(t, 0.8, 1.2)))} height={2} fill={C.cherryText} />
      {t > 1.0 && (
        <T x={120} y={204} s={11} f={C.cherryText} o={k(1.0)}>
          by hand, 3 a.m.
        </T>
      )}
      {t > 1.6 && (
        <T x={400} y={58} s={11} f={C.taupe} o={k(1.6)}>
          never told
        </T>
      )}
      {[0, 1, 2].map((i) => (
        <Pip key={i} x={lerp(400, 430 + i * 40, k(2.1 + i * 0.3))} y={232} o={k(2.1 + i * 0.3)} f={C.latte} />
      ))}
      {t > 2.2 && (
        <T x={540} y={236} s={11} f={C.taupe} a="end" o={k(2.2)}>
          weeks
        </T>
      )}
      <VArrow x={325} y1={70} y2={146} k={k(3.3)} f={C.focus} />
      {t > 3.4 && (
        <T x={340} y={114} s={11} f={C.focus} o={k(3.4)}>
          an unrelated deploy
        </T>
      )}
    </Svg>
  );
}

// 1 · Predict. Automated sync on, self-heal off. Git's image moves to v2 and the deploy comes down; the red timeout sits
// beside it. Once answered, the sync applies the whole object: the image goes to v2 and the timeout goes back to git's 10,
// and the reticle locks on the edit that is gone.
export function PredictSelfHeal({ t: t0, answer }: StepCtx) {
  const t = t0 * 1.55;
  const s = useSinceAnswer(answer !== null);
  const k = (d: number) => easeOut(seg(t, d, d + 0.3));
  const a = answer !== null ? easeOut(seg(s, 0.2, 0.8)) : 0;
  return (
    <Svg label="Automated sync is on, self heal is off. A git change lands that does not touch the edited field" h={250}>
      <T x={25} y={28} s={11} f={C.latte} o={k(0)}>
        automated sync
      </T>
      <MiniTick x={150} y={20} k={k(0.2)} />
      <T x={260} y={28} s={11} f={C.latte} o={k(0.3)}>
        self-heal
      </T>
      <Cross x={350} y={24} k={k(0.5)} />
      <Cell x={120} y={60} w={130} label="timeout: 10" o={k(0)} />
      <Cell x={270} y={60} w={110} label={t > 0.9 ? 'image: v2' : 'image: v1'} stroke={t > 0.9 ? C.focus : C.mocha} o={k(0)} />
      <Cell x={120} y={150} w={130} label={a > 0.5 ? 'timeout: 10' : 'timeout: 30'} stroke={a > 0.5 ? C.mocha : C.cherryText} o={k(0.1)} />
      <Cell x={270} y={150} w={110} label={a > 0.5 ? 'image: v2' : 'image: v1'} o={k(0.1)} />
      <VArrow x={325} y1={90} y2={146} k={k(1.2)} f={C.focus} />
      {answer === null && t > 1.6 && (
        <T x={185} y={212} s={15} f={C.taupe} a="middle" o={k(1.6)}>
          ?
        </T>
      )}
      {answer !== null && <Reticle x={116} y={146} w={138} h={36} t={s} at={0.3} />}
      <Verdict answer={answer} text="this deploy reverts it: git declares it" y={228} />
    </Svg>
  );
}

// 2 · The loop. A desired strip above, a live strip below, a dot running between them. The live replica count slips to 5
// and turns red; the loop pulls it back to 3. Then the upper strip's label becomes git, with a commit history beside it.
export function LoopGitSpec({ t: t0 }: StepCtx) {
  const t = t0 * 1.55;
  const k = (d: number) => easeOut(seg(t, d, d + 0.35));
  const off = t > 0.8 && t < 1.5;
  const back = easeOut(seg(t, 1.5, 1.9));
  const g = easeOut(seg(t, 2.0, 2.5));
  return (
    <Svg label="A controller continuously compares live state against a desired state taken from git" h={250}>
      {t < 2.0 && (
        <T x={25} y={98} s={12} f={C.latte} o={k(0)}>
          spec
        </T>
      )}
      {t >= 2.0 && (
        <T x={25} y={98} s={12} f={C.second} o={g}>
          git
        </T>
      )}
      <Cell x={120} y={80} w={130} label="replicas: 3" o={k(0)} />
      <Cell x={270} y={80} w={110} label="image: v1" o={k(0)} />
      <T x={25} y={198} s={12} f={C.latte} o={k(0.2)}>
        live
      </T>
      <Cell x={120} y={180} w={130} label={off ? 'replicas: 5' : 'replicas: 3'} stroke={off ? C.cherryText : C.mocha} o={k(0.2)} />
      <Cell x={270} y={180} w={110} label="image: v1" o={k(0.2)} />
      <Loop x={420} y1={94} y2={194} t={t} o={k(0.4)} />
      {back > 0 && <MiniTick x={260} y={190} k={back} />}
      <line x1={120} y1={40} x2={lerp(120, 300, g)} y2={40} stroke={C.second} strokeWidth={1.4} opacity={g > 0 ? 1 : 0} />
      {[0, 1, 2].map((i) => (
        <circle key={i} cx={120 + i * 90} cy={40} r={5} fill={C.second} opacity={k(2.2 + i * 0.2)} />
      ))}
      {t > 2.8 && (
        <T x={320} y={44} s={11} f={C.second} o={k(2.8)}>
          a separate repository
        </T>
      )}
    </Svg>
  );
}

// 3 · Two real tools. Git feeds Argo CD, git feeds Flux, each reconciling a cluster. Then Flux's source swaps: git slides
// away and an image registry takes its place, the thing being watched.
export function FluxOci({ t: t0 }: StepCtx) {
  const t = t0 * 1.55;
  const k = (d: number) => easeOut(seg(t, d, d + 0.35));
  const sw = easeInOut(seg(t, 2.2, 2.9));
  return (
    <Svg label="Argo CD and Flux are two separate real projects. Flux now also reconciles from an image registry, not only git" h={250}>
      <Cell x={25} y={50} w={100} label="git" o={k(0)} />
      <Req x1={125} x2={196} y={64} k={k(0.3)} />
      <Cell x={200} y={50} w={110} label="Argo CD" o={k(0.4)} />
      <Req x1={310} x2={416} y={64} k={k(0.6)} />
      <Cell x={420} y={50} w={110} label="cluster" o={k(0.7)} />
      <Cell x={25} y={lerp(140, 200, sw)} w={100} label="git" o={k(1.0) * (1 - sw * 0.7)} />
      {sw > 0 && <Cell x={25} y={lerp(100, 140, sw)} w={100} label="registry" o={sw} stroke={C.second} f={C.second} />}
      <Req x1={125} x2={196} y={154} k={k(1.3)} f={sw > 0.5 ? C.second : C.crema} />
      <Cell x={200} y={140} w={110} label="Flux" o={k(1.4)} />
      <Req x1={310} x2={416} y={154} k={k(1.6)} />
      <Cell x={420} y={140} w={110} label="cluster" o={k(1.7)} />
      {t > 3.1 && (
        <T x={200} y={204} s={11} f={C.second} o={k(3.1)}>
          the registry itself is watched
        </T>
      )}
    </Svg>
  );
}

// 4 · Rendered first. A chart with values and a base with an overlay fan into one document, written line by line. The two
// tools fade back; only the rendered document goes on to the cluster.
export function HelmKustomize({ t: t0 }: StepCtx) {
  const t = t0 * 1.55;
  const k = (d: number) => easeOut(seg(t, d, d + 0.35));
  const dim = 1 - 0.65 * easeOut(seg(t, 2.0, 2.4));
  const lines = [90, 70, 84, 56, 78, 64];
  return (
    <Svg label="Helm and Kustomize only render the manifest. The reconciler owns everything after that" h={250}>
      <Cell x={25} y={50} w={150} label="chart + values" o={k(0) * dim} />
      <Cell x={25} y={160} w={150} label="base + overlay" o={k(0.3) * dim} />
      <Fan x1={175} y1={64} x2={256} y2={110} k={k(0.6)} f={C.latte} />
      <Fan x1={175} y1={174} x2={256} y2={130} k={k(0.7)} f={C.latte} />
      <rect x={260} y={50} width={130} height={150} rx={4} fill={C.cocoa} stroke={C.crema} strokeWidth={1.5} opacity={k(0.8)} />
      {lines.map((w, i) => (
        <rect key={i} x={275} y={70 + i * 20} width={Math.max(0, w * easeOut(seg(t, 1.0 + i * 0.15, 1.3 + i * 0.15)))} height={4} rx={2} fill={C.crema} />
      ))}
      <Req x1={390} x2={456} y={124} k={k(2.4)} f={C.focus} />
      <Cell x={460} y={110} w={110} label="cluster" o={k(2.5)} stroke={C.focus} />
      {t > 2.8 && (
        <T x={260} y={226} s={11} f={C.focus} o={k(2.8)}>
          only this is applied
        </T>
      )}
    </Svg>
  );
}

// 5 · Promotion by pull request. A commit lands on staging and its image goes to v2; a pull request carries the same
// commit down to production. Then one revert commit walks production back to v1.
export function PromotionByPr({ t: t0 }: StepCtx) {
  const t = t0 * 1.55;
  const k = (d: number) => easeOut(seg(t, d, d + 0.35));
  const c1 = easeInOut(seg(t, 0.3, 0.9));
  const pr = easeInOut(seg(t, 1.2, 2.0));
  const rv = easeInOut(seg(t, 2.6, 3.3));
  const prod = t > 2.0 && t < 3.3 ? 'image: v2' : 'image: v1';
  return (
    <Svg label="Staging to production is a commit changing a version or an overlay" h={250}>
      <T x={25} y={74} s={12} f={C.latte} o={k(0)}>
        staging
      </T>
      <Cell x={160} y={56} w={130} label={t > 0.9 ? 'image: v2' : 'image: v1'} stroke={t > 0.9 ? C.focus : C.mocha} o={k(0)} />
      <T x={25} y={184} s={12} f={C.latte} o={k(0.1)}>
        production
      </T>
      <Cell x={160} y={166} w={130} label={prod} stroke={t > 2.0 && t < 3.3 ? C.focus : t > 3.3 ? C.second : C.mocha} o={k(0.1)} />
      {c1 > 0 && c1 < 1 && <Pip x={lerp(470, 300, c1)} y={70} f={C.focus} />}
      {pr > 0 && pr < 1 && <Pip x={300} y={lerp(70, 180, pr)} f={C.focus} />}
      {t > 1.2 && (
        <T x={312} y={130} s={11} f={C.focus} o={k(1.2)}>
          pull request
        </T>
      )}
      <line x1={420} y1={230} x2={lerp(420, 560, k(0.2))} y2={230} stroke={C.mocha} strokeWidth={1.4} />
      <circle cx={450} cy={230} r={5} fill={C.focus} opacity={k(0.9)} />
      <circle cx={520} cy={230} r={5} fill={C.second} opacity={k(3.3)} />
      {rv > 0 && rv < 1 && <Pip x={lerp(520, 300, rv)} y={lerp(230, 180, rv)} f={C.second} />}
      {t > 3.3 && (
        <T x={312} y={184} s={11} f={C.second} o={k(3.3)}>
          revert: back to v1
        </T>
      )}
    </Svg>
  );
}

// 6 · Drift correction, and the guard. Self-heal on: the loop runs and the red live timeout is pulled back to git's 10.
// Below, prune on: b leaves git, and b is lifted out of the cluster. A dashed safety net is drawn under what remains.
export function DriftCorrection({ t: t0 }: StepCtx) {
  const t = t0 * 1.55;
  const k = (d: number) => easeOut(seg(t, d, d + 0.35));
  const fixed = t > 1.3;
  const lift = easeInOut(seg(t, 2.6, 3.2));
  return (
    <Svg label="Self heal pulls live drift back to git. Pruning deletes what git no longer lists, guarded against deleting everything" h={250}>
      <T x={25} y={44} s={11} f={C.latte} o={k(0)}>
        git
      </T>
      <Cell x={120} y={26} w={130} label="timeout: 10" o={k(0)} />
      <T x={25} y={104} s={11} f={C.latte} o={k(0)}>
        cluster
      </T>
      <Cell x={120} y={86} w={130} label={fixed ? 'timeout: 10' : 'timeout: 30'} stroke={fixed ? C.mocha : C.cherryText} o={k(0)} />
      <VArrow x={270} y1={100} y2={44} k={easeOut(seg(t, 0.5, 1.2))} f={C.focus} />
      {fixed && <MiniTick x={256} y={96} k={k(1.3)} />}
      <T x={300} y={70} s={11} f={C.focus} o={k(0.3)}>
        self-heal: on
      </T>
      {t > 1.8 && (
        <T x={300} y={178} s={11} f={C.latte} o={k(1.8)}>
          prune: on
        </T>
      )}
      <Cell x={120} y={150} w={50} label="a" o={k(1.8)} />
      <Cell x={180} y={150} w={50} label="b" o={k(1.8) * (1 - 0.6 * k(2.2))} />
      <Cross x={205} y={164} k={k(2.2)} />
      <Cell x={120} y={200} w={50} label="a" o={k(1.9)} />
      <Cell x={180} y={lerp(200, 160, lift)} w={50} label="b" o={k(1.9) * (1 - lift)} />
      <line x1={110} y1={240} x2={lerp(110, 240, k(3.4))} y2={240} stroke={C.second} strokeWidth={1.6} strokeDasharray="5 4" />
      {t > 3.6 && (
        <T x={260} y={244} s={11} f={C.second} o={k(3.6)}>
          and a safety net
        </T>
      )}
    </Svg>
  );
}

// 7 · Predict. Prune on, allow-empty off. Both a and b are struck from git at once; the cluster still holds both, with a
// "?" beside them. Once answered, the guard line glows under them and each gets a tick: refused.
export function PredictPruneEverything({ t: t0, answer }: StepCtx) {
  const t = t0 * 1.55;
  const s = useSinceAnswer(answer !== null);
  const k = (d: number) => easeOut(seg(t, d, d + 0.3));
  const a = answer !== null ? easeOut(seg(s, 0.2, 0.8)) : 0;
  return (
    <Svg label="Every resource is removed from git at once, by a mistake. Pruning is on. What happens?" h={250}>
      <T x={25} y={28} s={11} f={C.latte} o={k(0)}>
        prune: on
      </T>
      <T x={180} y={28} s={11} f={C.latte} o={k(0.2)}>
        allow-empty: off
      </T>
      <T x={25} y={78} s={11} f={C.latte} o={k(0)}>
        git
      </T>
      <Cell x={120} y={60} w={50} label="a" o={k(0) * (1 - 0.6 * k(0.6))} />
      <Cell x={180} y={60} w={50} label="b" o={k(0) * (1 - 0.6 * k(0.6))} />
      <Cross x={145} y={74} k={k(0.6)} />
      <Cross x={205} y={74} k={k(0.6)} />
      <T x={25} y={158} s={11} f={C.latte} o={k(0.3)}>
        cluster
      </T>
      <Cell x={120} y={140} w={50} label="a" o={k(0.3)} />
      <Cell x={180} y={140} w={50} label="b" o={k(0.3)} />
      {answer === null && t > 1.2 && (
        <T x={280} y={160} s={15} f={C.taupe} a="middle" o={k(1.2)}>
          ?
        </T>
      )}
      {answer !== null && <rect x={110} y={182} width={Math.max(0, 130 * a)} height={3} fill={C.focus} />}
      {answer !== null && <MiniTick x={250} y={150} k={a} />}
      <Verdict answer={answer} text="refused: emptying needs allow-empty" y={226} />
    </Svg>
  );
}

// 8 · The field another controller owns. Git says 3 replicas; the autoscaler pushes the live count to 7, the loop drags it
// back to 3, the autoscaler pushes again: a red tug of war, OutOfSync. Then the field is masked and the status reads Synced.
export function IgnoreDifferences({ t: t0 }: StepCtx) {
  const t = t0 * 1.55;
  const k = (d: number) => easeOut(seg(t, d, d + 0.35));
  const tug = t > 0.9 && t < 2.2;
  const flip = tug ? Math.floor((t - 0.9) * 3) % 2 === 1 : false;
  const live = t < 0.6 ? 'replicas: 3' : flip ? 'replicas: 3' : 'replicas: 7';
  const masked = t > 2.2;
  return (
    <Svg label="An autoscaler changes replica count live. Telling the reconciler to ignore that field stops a fight over it" h={250}>
      <T x={25} y={58} s={11} f={C.latte} o={k(0)}>
        git
      </T>
      <Cell x={120} y={40} w={130} label="replicas: 3" o={k(0)} />
      <T x={25} y={148} s={11} f={C.latte} o={k(0)}>
        live
      </T>
      <Cell x={120} y={130} w={130} label={live} stroke={tug ? C.cherryText : masked ? C.second : C.mocha} o={k(0)} />
      <Cell x={360} y={130} w={120} label="autoscaler" o={k(0.2)} />
      <Req x1={360} x2={254} y={144} k={k(0.4)} f={C.latte} />
      {tug && <VArrow x={185} y1={74} y2={126} k={1} f={C.cherryText} />}
      {masked && <Hole x={112} y={34} w={146} h={130} o={k(2.2)} stroke={C.second} />}
      {t > 2.4 && (
        <T x={270} y={60} s={11} f={C.second} o={k(2.4)}>
          ignored
        </T>
      )}
      {t > 1.0 && t < 2.2 && (
        <T x={120} y={220} s={12} f={C.cherryText} o={k(1.0)}>
          OutOfSync
        </T>
      )}
      {t > 2.6 && (
        <T x={120} y={220} s={12} f={C.focus} o={k(2.6)}>
          Synced
        </T>
      )}
      {t > 2.6 && <MiniTick x={190} y={210} k={k(2.8)} />}
    </Svg>
  );
}

// 9 · Secrets. Three lanes, each a git history rail and a cluster. In the clear: the key is committed and stays in history
// after a removing commit. From a store: the key goes store to cluster, the rail stays empty. Encrypted: a locked key sits
// in git, and once applied it lies open in the cluster.
export function SecretsGitops({ t: t0 }: StepCtx) {
  const t = t0 * 1.55;
  const k = (d: number) => easeOut(seg(t, d, d + 0.35));
  const rail = (y: number, d: number) => <line x1={150} y1={y} x2={lerp(150, 380, k(d))} y2={y} stroke={C.mocha} strokeWidth={1.4} />;
  const go = easeInOut(seg(t, 1.8, 2.5));
  const ap = easeInOut(seg(t, 3.2, 3.8));
  return (
    <Svg label="A secret committed in the clear is a leak. Syncing from a store, or committing it encrypted, are the two fixes" h={250}>
      <T x={25} y={54} s={11} f={C.latte} o={k(0)}>
        in the clear
      </T>
      {rail(50, 0)}
      <Pip x={230} y={50} f={C.cherryText} o={k(0.4)} />
      <circle cx={320} cy={50} r={5} fill={C.latte} opacity={k(0.9)} />
      {t > 1.1 && (
        <T x={400} y={54} s={11} f={C.cherryText} o={k(1.1)}>
          still in history
        </T>
      )}
      <T x={25} y={134} s={11} f={C.latte} o={k(1.4)}>
        from a store
      </T>
      <line x1={150} y1={110} x2={lerp(150, 380, k(1.4))} y2={110} stroke={C.mocha} strokeWidth={1.4} strokeDasharray="4 4" />
      <Cell x={150} y={124} w={80} label="store" o={k(1.5)} />
      <Cell x={440} y={124} w={100} label="cluster" o={k(1.5)} />
      {go > 0 && <Pip x={lerp(230, 436, go)} y={138} f={C.focus} />}
      <T x={25} y={214} s={11} f={C.latte} o={k(2.7)}>
        encrypted
      </T>
      {rail(190, 2.7)}
      <Lock x={222} y={184} k={k(2.9)} />
      <Cell x={440} y={196} w={100} label="cluster" o={k(2.8)} />
      {ap > 0 && ap < 1 && <Pip x={lerp(240, 436, ap)} y={lerp(190, 210, ap)} f={C.second} />}
      {t > 3.8 && <Pip x={560} y={210} f={C.cherryText} o={k(3.8)} />}
      {t > 3.9 && (
        <T x={575} y={244} s={11} f={C.cherryText} a="end" o={k(3.9)}>
          open once applied
        </T>
      )}
    </Svg>
  );
}

// 10 · Progressive delivery. Traffic: a small slice moves to the new version, then slides back, undone for almost nothing.
// Below, a stream job's state bar fills as it accumulates; a naive redeploy empties it in one move, in red.
export function ProgressiveDelivery({ t: t0 }: StepCtx) {
  const t = t0 * 1.55;
  const k = (d: number) => easeOut(seg(t, d, d + 0.35));
  const slice = easeOut(seg(t, 0.3, 1.0)) * (1 - easeInOut(seg(t, 1.4, 1.9)));
  const fill = easeInOut(seg(t, 2.0, 2.8));
  const wipe = easeInOut(seg(t, 3.1, 3.5));
  const st = fill * (1 - wipe);
  return (
    <Svg label="Canary and blue green shift traffic gradually. A stateful stream job redeployed from empty state is not a traffic shift, it's a data incident" h={250}>
      <T x={25} y={44} s={11} f={C.latte} o={k(0)}>
        traffic
      </T>
      <rect x={130} y={30} width={445} height={20} rx={3} fill={C.cocoa} opacity={k(0)} />
      <rect x={130} y={30} width={Math.max(0, 445 * (1 - 0.15 * slice))} height={20} rx={3} fill={C.latte} opacity={k(0)} />
      <rect x={130 + 445 * (1 - 0.15 * slice)} y={30} width={Math.max(0, 445 * 0.15 * slice)} height={20} rx={3} fill={C.second} />
      {t > 0.6 && t < 1.6 && (
        <T x={575} y={74} s={11} f={C.second} a="end" o={k(0.6)}>
          a slice, watched
        </T>
      )}
      {t > 1.9 && <MiniTick x={540} y={64} k={k(1.9)} />}
      {t > 1.9 && (
        <T x={530} y={74} s={11} f={C.latte} a="end" o={k(1.9)}>
          undone, cheaply
        </T>
      )}
      <T x={25} y={154} s={11} f={C.latte} o={k(1.8)}>
        job state
      </T>
      <rect x={130} y={140} width={445} height={20} rx={3} fill={C.cocoa} stroke={wipe > 0.5 ? C.cherryText : 'none'} strokeWidth={1.5} opacity={k(1.8)} />
      <rect x={130} y={140} width={Math.max(0, 445 * st)} height={20} rx={3} fill={C.crema} />
      {t > 3.0 && (
        <T x={130} y={190} s={11} f={C.latte} o={k(3.0)}>
          redeployed the naive way
        </T>
      )}
      {t > 3.5 && (
        <T x={130} y={214} s={12} f={C.cherryText} o={k(3.5)}>
          starts over with nothing
        </T>
      )}
    </Svg>
  );
}

// 11 · The seam. A line down the middle. Left, infrastructure as code stacks up account, network, storage and the
// cluster itself. Right, the cluster fills with running objects. Then identity and a secret store slide onto the seam.
export function IacVsGitopsSeam({ t: t0 }: StepCtx) {
  const t = t0 * 1.55;
  const k = (d: number) => easeOut(seg(t, d, d + 0.35));
  const left = ['account', 'network', 'storage', 'cluster'];
  const sl = (d: number) => easeInOut(seg(t, d, d + 0.6));
  return (
    <Svg label="The cluster itself is infrastructure as code. What runs inside it is GitOps. The seam is identity and secrets" h={250}>
      <line x1={300} y1={20} x2={300} y2={lerp(20, 245, k(0))} stroke={C.mocha} strokeWidth={1.4} />
      <T x={25} y={30} s={11} f={C.latte} o={k(0.1)}>
        infrastructure as code
      </T>
      <T x={320} y={30} s={11} f={C.latte} o={k(1.5)}>
        GitOps
      </T>
      {left.map((l, i) => (
        <Cell key={l} x={25} y={lerp(30, 46 + i * 34, k(0.3 + i * 0.25))} w={130} h={26} label={l} o={k(0.3 + i * 0.25)} />
      ))}
      <rect x={320} y={46} width={255} height={100} rx={4} fill="none" stroke={C.crema} strokeWidth={1.5} opacity={k(1.6)} />
      {Array.from({ length: 8 }, (_, i) => (
        <rect key={i} x={340 + (i % 4) * 58} y={64 + Math.floor(i / 4) * 40} width={40} height={24} rx={3} fill={C.cocoa} stroke={C.latte} strokeWidth={1.2} opacity={k(1.8 + i * 0.1)} />
      ))}
      <Cell x={lerp(120, 240, sl(2.9))} y={172} w={120} label="identity" o={k(2.9)} stroke={C.focus} f={C.focus} />
      <Cell x={lerp(120, 240, sl(3.3))} y={212} w={120} label="secret store" o={k(3.3)} stroke={C.focus} f={C.focus} />
    </Svg>
  );
}

// 12 · Recap. Git and live agree, the loop dot keeps running, a tick: converged. Then a pulse line is drawn beside it,
// ending in a question: healthy?
export function Recap({ t: t0 }: StepCtx) {
  const t = t0 * 1.55;
  const k = (d: number) => easeOut(seg(t, d, d + 0.35));
  const p = easeInOut(seg(t, 1.8, 2.8));
  const pts = [25, 60, 80, 95, 110, 125, 160, 200, 215, 230, 245, 280, 320];
  const ys = [210, 210, 210, 190, 228, 210, 210, 210, 192, 226, 210, 210, 210];
  const n = Math.max(1, Math.round(p * (pts.length - 1)));
  const d = pts
    .slice(0, n + 1)
    .map((x, i) => `${i ? 'L' : 'M'}${x} ${ys[i]}`)
    .join(' ');
  return (
    <Svg label="The platform is delivered and kept converged. That says nothing about whether it is healthy" h={250}>
      <T x={25} y={58} s={11} f={C.latte} o={k(0)}>
        git
      </T>
      <Cell x={120} y={40} w={130} label="timeout: 10" o={k(0)} />
      <Cell x={270} y={40} w={110} label="image: v2" o={k(0)} />
      <T x={25} y={138} s={11} f={C.latte} o={k(0.1)}>
        live
      </T>
      <Cell x={120} y={120} w={130} label="timeout: 10" o={k(0.1)} />
      <Cell x={270} y={120} w={110} label="image: v2" o={k(0.1)} />
      <Loop x={420} y1={54} y2={134} t={t} o={k(0.3)} />
      <MiniTick x={450} y={88} k={k(0.8)} />
      {t > 1.0 && (
        <T x={470} y={98} s={11} f={C.focus} o={k(1.0)}>
          converged
        </T>
      )}
      {p > 0 && <path d={d} fill="none" stroke={C.latte} strokeWidth={1.6} />}
      {t > 2.8 && (
        <T x={340} y={215} s={15} f={C.taupe} o={k(2.8)}>
          healthy?
        </T>
      )}
    </Svg>
  );
}
/** A fan line from (x1, y1) to (x2, y2), drawn by `k`, ending in a dot. */
function Fan({ x1, y1, x2, y2, k, f = C.crema }: { x1: number; y1: number; x2: number; y2: number; k: number; f?: string }) {
  if (k <= 0) return null;
  const x = lerp(x1, x2, k);
  const y = lerp(y1, y2, k);
  return (
    <g>
      <line x1={x1} y1={y1} x2={x} y2={y} stroke={f} strokeWidth={1.6} />
      <circle cx={x} cy={y} r={3} fill={f} />
    </g>
  );
}
