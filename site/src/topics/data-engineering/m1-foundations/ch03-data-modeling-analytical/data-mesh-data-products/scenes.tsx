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

const DOMAINS = ['orders', 'payments', 'shipping'];
const DX = [25, 215, 405];

/** The three business domains in a row at `y`. */
function Domains({ y, k, f = () => C.mocha, h = 30 }: { y: number; k: (i: number) => number; f?: (i: number) => string; h?: number }) {
  return (
    <g>
      {DOMAINS.map((d, i) => (
        <Cell key={d} x={DX[i]} y={y} w={170} h={h} label={d} o={k(i)} stroke={f(i)} />
      ))}
    </g>
  );
}

// 1 · Hook. Three domains each hand their data up to one central team; the orders line lights, handed to a team that has never
// touched an order.
export function Hook({ t }: StepCtx) {
  const l = (i: number) => easeInOut(seg(t, 1.0 + i * 0.3, 1.5 + i * 0.3));
  const hi = easeOut(seg(t, 2.6, 3.0));
  return (
    <Svg label="one central team, every domain — does it still own the pipeline it understands least?" h={250}>
      <Row y={40} label="one central team" value="owns every pipeline" k={easeOut(seg(t, 0.3, 0.8))} />
      <Row y={85} label="orders, handed off" value="the right owner?" k={easeOut(seg(t, 3.0, 3.5))} />
      <Cell x={200} y={118} w={200} h={30} label="central team" o={easeOut(seg(t, 0.4, 0.8))} stroke={hi > 0 ? C.cherryText : C.mocha} />
      <Domains y={205} k={(i) => easeOut(seg(t, 0.6 + i * 0.15, 0.9 + i * 0.15))} f={(i) => (i === 0 && hi > 0 ? C.cherryText : C.mocha)} />
      {DX.map((x, i) => (
        <line key={i} x1={x + 85} y1={205} x2={lerp(x + 85, 300, l(i))} y2={lerp(205, 148, l(i))} stroke={i === 0 && hi > 0 ? C.cherryText : C.latte} strokeWidth={i === 0 && hi > 0 ? 2 : 1.2} />
      ))}
    </Svg>
  );
}

// 2 · Domain ownership. The central team fades; each domain grows its own served data beside it, reached directly.
export function RevealDomainOwnershipQuote({ t }: StepCtx) {
  const f = easeInOut(seg(t, 0.8, 1.4));
  const d = (i: number) => easeOut(seg(t, 1.6 + i * 0.35, 2.0 + i * 0.35));
  return (
    <Svg label="each domain hosts, serves its own data — not a centrally owned lake" h={250}>
      <Row y={40} label="each domain" value="keeps its own data" k={easeOut(seg(t, 0.3, 0.8))} />
      <Row y={85} label="and serves it" value="directly, on its terms" valueColor={C.focus} k={easeOut(seg(t, 3.0, 3.5))} />
      <Cell x={200} y={115} w={200} h={26} label="central team" o={(1 - f) * easeOut(seg(t, 0.2, 0.5))} />
      <Domains y={160} k={() => easeOut(seg(t, 0.3, 0.6))} />
      {DX.map((x, i) => (
        <g key={i} opacity={d(i)} transform={`translate(0 ${((1 - d(i)) * -12).toFixed(1)})`}>
          <Cell x={x + 20} y={205} w={130} h={24} label={`${DOMAINS[i]} data`} stroke={C.focus} f={C.focus} />
          <line x1={x + 85} y1={190} x2={x + 85} y2={205} stroke={C.focus} strokeWidth={1.5} />
        </g>
      ))}
    </Svg>
  );
}

// 3 · Predict: does owning it make it trusted? The orders domain serves its own data; other teams look on; then the question.
export function PredictOwnershipEqualsTrust({ t, answer }: StepCtx) {
  return (
    <Svg label="a domain hosting its own data — trustworthy to everyone else, just by owning it?" h={210}>
      <Row y={40} label="owned, so trusted?" value="by everyone else" k={easeOut(seg(t, 0.1, 0.5))} />
      <Cell x={25} y={60} w={200} h={26} label="orders data, owned" o={easeOut(seg(t, 0.2, 0.5))} stroke={C.focus} />
      {[0, 1].map((i) => (
        <g key={i} opacity={easeOut(seg(t, 0.6 + i * 0.2, 0.9 + i * 0.2))}>
          <line x1={225} y1={73} x2={315 + i * 135} y2={73} stroke={C.latte} strokeWidth={1.2} strokeDasharray="4 3" />
          <Cell x={315 + i * 135} y={60} w={125} h={26} label={`other team ${i + 1}`} />
        </g>
      ))}
      <AnswerRow y={140} label="trusted, just owned" answer={answer} value="no, its own standard" k={easeOut(seg(t, 1.4, 1.9))} />
      <Verdict answer={answer} text="trust is a separate, explicit bar" />
    </Svg>
  );
}

// 4 · Data as a product. The orders data gets a product frame round it; the teams reading it are relabelled customers.
export function RevealDataAsProductQuote({ t }: StepCtx) {
  const p = easeOutBack(seg(t, 1.0, 1.6));
  const c = (i: number) => easeOut(seg(t, 2.4 + i * 0.3, 2.8 + i * 0.3));
  return (
    <Svg label="domain data, treated as a product — its consumers treated as customers" h={250}>
      <Row y={40} label="domain data" value="treated as a product" k={easeOut(seg(t, 0.3, 0.8))} />
      <Row y={85} label="its consumers" value="treated as customers" valueColor={C.focus} k={easeOut(seg(t, 3.0, 3.5))} />
      <Cell x={45} y={150} w={160} h={30} label="orders data" o={easeOut(seg(t, 0.4, 0.8))} />
      <rect x={35 - 6 * (1 - clamp(p))} y={128} width={180} height={70} rx={6} fill="none" stroke={C.focus} strokeWidth={2} opacity={clamp(p * 2)} />
      <T x={125} y={218} s={11} f={C.focus} a="middle" o={clamp(p * 2)}>
        a product
      </T>
      {[0, 1, 2].map((i) => (
        <g key={i}>
          <line x1={215} y1={163} x2={355} y2={125 + i * 40} stroke={c(i) > 0.5 ? C.focus : C.latte} strokeWidth={1.2} opacity={easeOut(seg(t, 0.8, 1.1))} />
          <Cell x={355} y={112 + i * 40} w={110} h={26} label={`team ${i + 1}`} o={easeOut(seg(t, 0.8, 1.1))} stroke={c(i) > 0.5 ? C.focus : C.mocha} />
          <T x={575} y={lerp(134, 129, c(i)) + i * 40} s={11} f={C.focus} a="end" o={c(i)}>
            customer
          </T>
        </g>
      ))}
    </Svg>
  );
}

const QUALITIES = ['discoverable', 'addressable', 'trustworthy', 'inter-operable'];

// 5 · The four qualities. A checklist of four, each ticked in turn; the count lands at 4.
export function RevealFourQualitiesQuote({ t }: StepCtx) {
  const k = (i: number) => easeOut(seg(t, 0.8 + i * 0.7, 1.3 + i * 0.7));
  const n = QUALITIES.filter((_, i) => k(i) > 0.5).length;
  return (
    <Svg label="discoverable, addressable, trustworthy, inter-operable — a checklist, not a slogan" h={250}>
      <Row y={40} label="a data product" value={`${n} of 4 qualities`} valueColor={n === 4 ? C.focus : C.crema} big k={easeOut(seg(t, 0.3, 0.8))} />
      {QUALITIES.map((q, i) => (
        <g key={q} opacity={easeOut(seg(t, 0.4 + i * 0.1, 0.7 + i * 0.1))}>
          <rect x={25} y={76 + i * 40} width={26} height={26} rx={4} fill={C.cocoa} stroke={k(i) > 0 ? C.focus : C.mocha} strokeWidth={1.5} />
          <path d={`M30 ${89 + i * 40} l6 6 l11 -12`} fill="none" stroke={C.focus} strokeWidth={2.5} strokeDasharray="30" strokeDashoffset={30 * (1 - k(i))} />
          <T x={65} y={94 + i * 40} s={14} f={k(i) > 0 ? C.crema : C.latte}>
            {q}
          </T>
        </g>
      ))}
    </Svg>
  );
}

// 6 · Predict: is ownership free? A domain's existing systems; a data pipeline is bolted on beside them; then the question.
export function PredictOwnershipIsFree({ t, answer }: StepCtx) {
  const p = easeOut(seg(t, 0.7, 1.2));
  return (
    <Svg label="a domain, already operational — its own data pipeline too, free of extra cost?" h={210}>
      <Row y={40} label="plus its own pipeline" value="free of extra cost?" k={easeOut(seg(t, 0.1, 0.5))} />
      <Cell x={25} y={60} w={240} h={26} label="orders' own systems" o={easeOut(seg(t, 0.2, 0.5))} />
      <g opacity={p} transform={`translate(${((1 - p) * 20).toFixed(1)} 0)`}>
        <Cell x={285} y={60} w={200} h={26} label="+ a data pipeline" stroke={C.focus} />
      </g>
      <AnswerRow y={140} label="costs nothing extra" answer={answer} value="no, it costs" f={C.cherryText} k={easeOut(seg(t, 1.4, 1.9))} />
      <Verdict answer={answer} text="specialized skill, in every domain" f={C.cherryText} />
    </Svg>
  );
}

/** One block of specialized infrastructure skill. */
function Skill({ x, y, o, f = C.cherryText }: { x: number; y: number; o: number; f?: string }) {
  return <Cell x={x} y={y} w={130} h={24} label="infra skill" o={o} stroke={f} f={f} />;
}

// 7 · The cost. Nothing shared beneath the domains; the same block of specialized skill appears under each one, again and again.
export function RevealOwnershipCostQuote({ t }: StepCtx) {
  return (
    <Svg label="ownership, distributed — specialized effort, duplicated in every domain's own pipeline" h={250}>
      <Row y={40} label="nothing shared below" value="every domain rebuilds" k={easeOut(seg(t, 0.3, 0.8))} />
      <Row y={85} label="the same skill" value="in every domain" valueColor={C.cherryText} k={easeOut(seg(t, 2.8, 3.3))} />
      <Domains y={125} k={() => easeOut(seg(t, 0.4, 0.8))} />
      {DX.map((x, i) => (
        <Skill key={i} x={x + 20} y={175} o={easeOutBack(seg(t, 1.2 + i * 0.5, 1.6 + i * 0.5)) > 0 ? clamp(easeOut(seg(t, 1.2 + i * 0.5, 1.6 + i * 0.5))) : 0} />
      ))}
      <rect x={25} y={218} width={550} height={14} rx={3} fill="none" stroke={C.latte} strokeWidth={1.2} strokeDasharray="5 4" opacity={easeOut(seg(t, 0.6, 1.0))} />
      <T x={300} y={246} s={11} f={C.latte} a="middle" o={easeOut(seg(t, 0.6, 1.0))}>
        nothing shared
      </T>
    </Svg>
  );
}

const PRINCIPLES = ['domain ownership', 'data as a product', 'self-serve platform', 'federated governance'];

// 8 · The four principles. Four cells land one by one, then a bracket closes round all four: together, not any one alone.
export function RevealFourPrinciplesQuote({ t }: StepCtx) {
  const b = easeInOut(seg(t, 3.0, 3.6));
  return (
    <Svg label="four named principles, together — collectively necessary and sufficient, Dehghani's own claim" h={250}>
      <Row y={40} label="four principles" value="named together" k={easeOut(seg(t, 0.3, 0.8))} />
      <Row y={85} label="all four" value="together, not one alone" valueColor={C.focus} k={easeOut(seg(t, 3.2, 3.7))} />
      {PRINCIPLES.map((p, i) => (
        <Cell key={p} x={25 + (i % 2) * 280} y={120 + Math.floor(i / 2) * 44} w={270} h={34} label={p} o={easeOut(seg(t, 0.8 + i * 0.5, 1.2 + i * 0.5))} stroke={b > 0 ? C.focus : C.mocha} />
      ))}
      <rect x={18} y={113} width={564} height={92 * b} rx={8} fill="none" stroke={C.focus} strokeWidth={2} opacity={b} />
    </Svg>
  );
}

// 9 · Predict: no platform yet? The domains, ownership and standard in place; the platform slab beneath them only dashed, not
// there; then the question.
export function PredictMeshWithoutPlatform({ t, answer }: StepCtx) {
  return (
    <Svg label="ownership, product standard adopted — platform still missing: does the mesh still work?" h={210}>
      <Row y={40} label="platform missing" value="mesh still works?" k={easeOut(seg(t, 0.1, 0.5))} />
      <Domains y={56} h={24} k={(i) => easeOut(seg(t, 0.2 + i * 0.15, 0.5 + i * 0.15))} />
      <rect x={25} y={88} width={550} height={16} rx={3} fill="none" stroke={C.latte} strokeWidth={1.2} strokeDasharray="5 4" opacity={easeOut(seg(t, 0.8, 1.1))} />
      <AnswerRow y={140} label="still works" answer={answer} value="no, each pays alone" f={C.cherryText} k={easeOut(seg(t, 1.4, 1.9))} />
      <Verdict answer={answer} text="the full specialized cost, alone" f={C.cherryText} />
    </Svg>
  );
}

// 10 · The platform. The three duplicated skill blocks slide down and merge into one shared platform beneath every domain.
export function RevealSelfServePlatformQuote({ t }: StepCtx) {
  const m = easeInOut(seg(t, 1.4, 2.4));
  const pl = easeOut(seg(t, 2.2, 2.7));
  return (
    <Svg label="specialized infrastructure skill, hard to replicate per domain — the platform's own reason to exist" h={250}>
      <Row y={40} label="specialized skill" value="hard to teach each one" k={easeOut(seg(t, 0.3, 0.8))} />
      <Row y={85} label="a shared platform" value="removes that burden" valueColor={C.focus} k={easeOut(seg(t, 3.0, 3.5))} />
      <Domains y={120} k={() => easeOut(seg(t, 0.4, 0.8))} />
      {DX.map((x, i) => (
        <g key={i} opacity={1 - pl} transform={`translate(${lerp(0, 235 - x, m).toFixed(1)} ${lerp(0, 40, m).toFixed(1)})`}>
          <Skill x={x + 20} y={160} o={easeOut(seg(t, 0.6, 1.0))} />
        </g>
      ))}
      <Cell x={25} y={200} w={550} h={30} label="one shared, self-serve platform" o={pl} stroke={C.focus} f={C.focus} />
    </Svg>
  );
}

// 11 · Federated governance. Each domain keeps its own local setting, sliding freely; from the platform below, one small set
// of shared rules runs up to every domain and ticks automatically.
export function RevealFederatedGovernanceQuote({ t }: StepCtx) {
  const sl = (i: number) => 0.3 + 0.4 * Math.sin(t * 2.2 + i * 1.7) * easeOut(seg(t, 0.8, 1.2));
  const r = easeInOut(seg(t, 2.0, 2.8));
  return (
    <Svg label="domain-local autonomy, global rules — enforced by the platform, automatically" h={250}>
      <Row y={40} label="each domain" value="free, locally" k={easeOut(seg(t, 0.3, 0.8))} />
      <Row y={85} label="a few shared rules" value="enforced automatically" valueColor={C.focus} k={easeOut(seg(t, 2.6, 3.1))} />
      <Domains y={115} k={() => easeOut(seg(t, 0.4, 0.8))} />
      {DX.map((x, i) => (
        <g key={i}>
          <line x1={x + 20} y1={160} x2={x + 150} y2={160} stroke={C.mocha} strokeWidth={2} opacity={easeOut(seg(t, 0.6, 0.9))} />
          <circle cx={x + 20 + 130 * clamp(sl(i))} cy={160} r={6} fill={C.crema} opacity={easeOut(seg(t, 0.6, 0.9))} />
          <line x1={x + 85} y1={205} x2={x + 85} y2={lerp(205, 147, r)} stroke={C.focus} strokeWidth={1.5} opacity={r > 0 ? 1 : 0} />
          <path d={`M${x + 140} ${120} l5 5 l10 -11`} fill="none" stroke={C.focus} strokeWidth={2.5} strokeDasharray="25" strokeDashoffset={25 * (1 - easeOut(seg(t, 2.8 + i * 0.2, 3.1 + i * 0.2)))} />
        </g>
      ))}
      <Cell x={25} y={205} w={550} h={28} label="platform · shared rules" o={easeOut(seg(t, 1.6, 2.0))} stroke={C.focus} />
    </Svg>
  );
}

// 12 · Recap. Four rows land one per beat.
export function Recap({ t }: StepCtx) {
  return (
    <Svg label="ownership reversed; a real checklist; a shared platform; governance that keeps it together" h={240}>
      <Row y={40} label="ownership" value="out to each domain" k={easeOut(seg(t, 0.6, 1.1))} />
      <Row y={95} label="data as a product" value="a real standard" k={easeOut(seg(t, 1.5, 2.0))} />
      <Row y={150} label="not free" value="without a platform" valueColor={C.cherryText} k={easeOut(seg(t, 2.4, 2.9))} />
      <Row y={205} label="shared rules" value="keep it together" valueColor={C.focus} k={easeOut(seg(t, 3.3, 3.8))} />
    </Svg>
  );
}

// 13 · Prove: rolled out now, platform months away. A time line: rollout now, the platform far ahead; after the answer the gap
// between them turns red, and the verdict lands with a tick.
export function ProveIt({ t, answer }: StepCtx) {
  const s = useSinceAnswer(answer !== null);
  const g = answer !== null ? easeOut(seg(s, 0.1, 0.5)) : 0;
  const k = answer !== null ? easeOut(seg(s, 0.4, 0.8)) : 0;
  const tick = answer !== null ? easeOut(seg(s, 0.8, 1.2)) : 0;
  return (
    <Svg label="ownership and the standard, rolled out now — the shared platform, still far from ready" h={230}>
      <Row y={40} label="rolled out now" value="platform months away" k={easeOut(seg(t, 0.1, 0.5))} />
      <AnswerRow y={90} label="meanwhile" answer={answer} value="each pays alone" f={C.cherryText} k={easeOut(seg(t, 0.4, 0.9))} />
      <line x1={25} y1={130} x2={575} y2={130} stroke={C.latte} strokeWidth={1.5} opacity={easeOut(seg(t, 0.3, 0.6))} />
      <circle cx={60} cy={130} r={7} fill={C.crema} opacity={easeOut(seg(t, 0.4, 0.7))} />
      <circle cx={540} cy={130} r={7} fill="none" stroke={C.focus} strokeWidth={2} opacity={easeOut(seg(t, 0.6, 0.9))} />
      <rect x={67} y={126} width={466 * g} height={8} rx={2} fill={C.cherryText} opacity={0.6} />
      <T x={60} y={156} s={11} f={C.latte} a="middle" o={easeOut(seg(t, 0.4, 0.7))}>
        now
      </T>
      <T x={540} y={156} s={11} f={C.focus} a="middle" o={easeOut(seg(t, 0.6, 0.9))}>
        platform
      </T>
      {answer !== null && (
        <>
          <T x={300} y={lerp(198, 190, k)} s={15} f={C.focus} a="middle" o={k}>
            full specialized cost, every domain
          </T>
          <rect x={150} y={202} width={300 * tick} height={3} fill={C.focus} />
          <Tick y={170} k={tick} />
        </>
      )}
    </Svg>
  );
}
