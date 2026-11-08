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

// Every value here is examples.py's own or SOURCES.md's: the gate's three rules (column_name and data_type, owner and sla,
// sensitivity_tier), orders.daily_summary admitted, customers.raw_signups rejected with "classification missing:
// sensitivity_tier", and Conway's 1968.

const DOMAINS = ['orders', 'customers', 'payments'];

// 0 · Hook. The regulator's ask lands over three domains. First the central team tries: its progress bar crawls and ends
// crossed, wrong. Then each domain answers alone: three mismatched answers. A question mark sits in the middle.
export function Hook({ t }: StepCtx) {
  const k = (d: number) => easeOut(seg(t, d, d + 0.35));
  const c = easeOut(seg(t, 1.4, 1.8)) * (1 - easeOut(seg(t, 3.0, 3.3)));
  const crawl = clamp((t - 1.6) / 1.4);
  return (
    <Svg label="a regulator wants every table holding restricted data, with its owner, by tomorrow" h={250}>
      <Cell x={100} y={26} w={400} label="every sensitive table, and its owner" o={k(0)} stroke={C.second} />
      {DOMAINS.map((n, i) => (
        <Cell key={n} x={25 + i * 190} y={96} w={170} label={n} o={k(0.4 + i * 0.15)} />
      ))}
      {t < 3.3 && (
        <g opacity={c}>
          <Cell x={25} y={160} w={170} label="central team" />
          <rect x={210} y={168} width={Math.max(0, 200 * crawl * 0.6)} height={12} rx={2} fill={C.taupe} />
          <Cross x={430} y={174} k={k(2.8)} />
          {t > 2.8 && (
            <T x={450} y={179} s={11} f={C.cherryText}>
              weeks, wrong
            </T>
          )}
        </g>
      )}
      {DOMAINS.map((n, i) => {
        const o = k(3.3 + i * 0.2);
        const x = 25 + i * 190;
        return (
          <g key={n} opacity={o}>
            {i === 0 && <rect x={x + 50} y={160} width={70} height={30} rx={3} fill="none" stroke={C.cherryText} strokeWidth={1.4} />}
            {i === 1 && <circle cx={x + 85} cy={175} r={16} fill="none" stroke={C.cherryText} strokeWidth={1.4} />}
            {i === 2 && <path d={`M${x + 85} 158 l18 32 h-36 z`} fill="none" stroke={C.cherryText} strokeWidth={1.4} />}
          </g>
        );
      })}
      {t > 4.0 && (
        <T x={300} y={232} s={11} f={C.taupe} a="middle" o={k(4.0)}>
          three stories. What has to sit in the middle?
        </T>
      )}
    </Svg>
  );
}

// 1 · The mesh shape. Each domain owns its data product. The platform bar slides in underneath and pushes tooling up to all
// three. The policy is written once at the top and routed into the platform, which then ticks every domain.
export function RevealMeshShape({ t }: StepCtx) {
  const k = (d: number) => easeOut(seg(t, d, d + 0.35));
  return (
    <Svg label="domains own data products; a platform self-serves; policy is central and automated" h={250}>
      {DOMAINS.map((n, i) => (
        <g key={n}>
          <Cell x={25 + i * 190} y={90} w={170} label={n} o={k(0.2 + i * 0.15)} />
          <Pip x={110 + i * 190} y={136} f={C.crema} o={k(0.6 + i * 0.15)} s={10} />
          <line x1={110 + i * 190} y1={180} x2={110 + i * 190} y2={180 - 36 * k(1.8 + i * 0.15)} stroke={C.second} strokeWidth={1.4} />
          <MiniTick x={150 + i * 190} y={136} k={k(3.8 + i * 0.15)} />
        </g>
      ))}
      <rect x={25} y={180} width={550} height={36} rx={5} fill={C.cocoa} stroke={C.second} strokeWidth={1.4} opacity={k(1.4)} />
      <T x={300} y={203} s={11} f={C.second} a="middle" o={k(1.4)}>
        platform: self-serve tooling
      </T>
      <Cell x={225} y={24} w={150} label="policy, once" o={k(2.8)} stroke={C.focus} />
      <path d={`M375 38 H405 V${38 + 142 * k(3.2)}`} fill="none" stroke={C.focus} strokeWidth={1.4} />
    </Svg>
  );
}

const THINGS = ['policy', 'ownership', 'tooling'];

// 2 · Predict: the split. Three things above two columns, central and domain. Once answered, policy and tooling drop into
// central and ownership into domain.
export function PredictSplit({ t, answer }: StepCtx) {
  const s = useSinceAnswer(answer !== null);
  const k = (d: number) => easeOut(seg(t, d, d + 0.25));
  return (
    <Svg label="policy, ownership, tooling -- central, domain-local, or split which way?" h={250}>
      <rect x={25} y={110} width={260} height={90} rx={5} fill="none" stroke={C.focus} strokeWidth={1.4} opacity={k(0.6)} />
      <T x={39} y={192} s={11} f={C.focus} o={k(0.6)}>
        central
      </T>
      <rect x={315} y={110} width={260} height={90} rx={5} fill="none" stroke={C.latte} strokeWidth={1.4} opacity={k(0.7)} />
      <T x={329} y={192} s={11} f={C.latte} o={k(0.7)}>
        domain
      </T>
      {THINGS.map((n, i) => {
        const m = answer !== null ? easeInOut(seg(s, 0.2 + i * 0.2, 0.7 + i * 0.2)) : 0;
        const tx = i === 1 ? 330 : i === 0 ? 40 : 160;
        return <Cell key={n} x={lerp(25 + i * 190, tx, m)} y={lerp(40, 124, m)} w={110} label={n} o={k(i * 0.2)} stroke={m > 0.5 ? (i === 1 ? C.latte : C.focus) : C.mocha} />;
      })}
      {answer === null && t > 1.0 && (
        <T x={300} y={96} s={15} f={C.taupe} a="middle" o={k(1.0)}>
          ?
        </T>
      )}
      <Verdict answer={answer} text="a split, not one answer" y={234} />
    </Svg>
  );
}

// 3 · The split, landed. Policy is one central document. Each domain gets its own owner tag. The central tooling sweeps a
// check across every domain's tables, ticking each, with no domain having to remember to run it.
export function RevealSplitAnswer({ t }: StepCtx) {
  const k = (d: number) => easeOut(seg(t, d, d + 0.35));
  const sweep = clamp((t - 3.0) / 1.2);
  return (
    <Svg label="policy: central. ownership: stays local. tooling: central, enforces the policy" h={250}>
      <rect x={25} y={26} width={140} height={60} rx={4} fill={C.cocoa} stroke={C.focus} strokeWidth={1.4} opacity={k(0.4)} />
      <T x={39} y={48} s={11} f={C.focus} o={k(0.4)}>
        the rule, once
      </T>
      {[0, 1, 2].map((j) => (
        <rect key={j} x={39} y={58 + j * 8} width={100 - j * 20} height={3} rx={1} fill={C.latte} opacity={k(0.6)} />
      ))}
      {DOMAINS.map((n, i) => (
        <g key={n}>
          <Cell x={200 + i * 125} y={40} w={115} label={n} o={k(1.2 + i * 0.15)} />
          <Cell x={200 + i * 125} y={78} w={115} h={24} label="owner" o={k(1.6 + i * 0.2)} stroke={C.second} />
          {[0, 1].map((j) => (
            <rect
              key={j}
              x={210 + i * 125 + j * 50}
              y={130}
              width={40}
              height={30}
              rx={3}
              fill={C.cocoa}
              stroke={sweep * 3 > i + j * 0.5 ? C.focus : C.mocha}
              strokeWidth={1.4}
              opacity={k(2.2 + i * 0.1)}
            />
          ))}
          <MiniTick x={248 + i * 125} y={176} k={clamp(sweep * 3 - i)} />
        </g>
      ))}
      <rect x={25} y={200} width={550} height={30} rx={5} fill={C.cocoa} stroke={C.focus} strokeWidth={1.4} opacity={k(2.8)} />
      <T x={39} y={220} s={11} f={C.focus} o={k(2.8)}>
        shared tooling: checks every table, automatically
      </T>
      <line x1={200 + 375 * sweep} y1={122} x2={200 + 375 * sweep} y2={168} stroke={C.focus} strokeWidth={1.4} opacity={sweep > 0 && sweep < 1 ? 1 : 0} />
    </Svg>
  );
}

// 4 · Conway, reversed. Left, a three-team org chart; right, the system it produced, the same three-box shape, an arrow
// carrying the shape across. Then the arrow flips: pick the structure first, and the system follows it.
export function ElaborateConway({ t }: StepCtx) {
  const k = (d: number) => easeOut(seg(t, d, d + 0.35));
  const flip = easeInOut(seg(t, 2.8, 3.4));
  const tree = (x: number, label: string, o: number, f: string) => (
    <g opacity={o}>
      <T x={x + 90} y={36} s={11} f={C.taupe} a="middle">
        {label}
      </T>
      <rect x={x + 65} y={46} width={50} height={22} rx={3} fill="none" stroke={f} strokeWidth={1.4} />
      {[0, 1, 2].map((i) => (
        <g key={i}>
          <line x1={x + 90} y1={68} x2={x + 25 + i * 65} y2={110} stroke={C.mocha} strokeWidth={1.2} />
          <rect x={x + i * 65} y={110} width={50} height={22} rx={3} fill="none" stroke={f} strokeWidth={1.4} />
        </g>
      ))}
    </g>
  );
  return (
    <Svg label="Conway, 1968: a design copies the org's own communication structure, reversed" h={250}>
      {tree(25, 'the teams', k(0.2), flip > 0.5 ? C.focus : C.latte)}
      {tree(375, 'the system', k(1.2), C.latte)}
      <path d={`M${lerp(235, 365, flip)} 90 L${lerp(365, 235, flip)} 90`} stroke={C.second} strokeWidth={1.6} opacity={k(1.0)} />
      <path d={flip < 0.5 ? 'M357 84 l8 6 l-8 6' : 'M243 84 l-8 6 l8 6'} fill="none" stroke={C.second} strokeWidth={1.6} opacity={k(1.0)} />
      {t > 1.6 && (
        <T x={25} y={176} s={11} f={C.taupe} o={k(1.6)}>
          Conway, 1968: the system copies the org
        </T>
      )}
      {t > 3.4 && (
        <T x={25} y={210} s={12} f={C.focus} o={k(3.4)}>
          reversed: pick the structure first
        </T>
      )}
    </Svg>
  );
}

const CALLS = ['mask a tagged column', 'a table with no owner', 'a legal retention exception'];

// 5 · Predict: automate or a person. Three calls above two columns. Once answered, the first two drop into automate and the
// legal exception into a person.
export function PredictStewardship({ t, answer }: StepCtx) {
  const s = useSinceAnswer(answer !== null);
  const k = (d: number) => easeOut(seg(t, d, d + 0.25));
  return (
    <Svg label="a mask, an ownerless table, a retention exception -- automate, or human?" h={250}>
      <rect x={25} y={130} width={260} height={74} rx={5} fill="none" stroke={C.second} strokeWidth={1.4} opacity={k(0.6)} />
      <T x={39} y={196} s={11} f={C.second} o={k(0.6)}>
        automate
      </T>
      <rect x={315} y={130} width={260} height={74} rx={5} fill="none" stroke={C.focus} strokeWidth={1.4} opacity={k(0.7)} />
      <T x={329} y={196} s={11} f={C.focus} o={k(0.7)}>
        a person
      </T>
      {CALLS.map((n, i) => {
        const m = answer !== null ? easeInOut(seg(s, 0.2 + i * 0.2, 0.7 + i * 0.2)) : 0;
        const tx = i === 2 ? 325 : 30 + i * 128;
        const ty = i === 2 ? 140 : 140;
        return (
          <Cell
            key={n}
            x={lerp(25, tx, m)}
            y={lerp(30 + i * 32, ty, m)}
            w={lerp(250, i === 2 ? 245 : 122, m)}
            h={26}
            label={m > 0.25 && i < 2 ? ['mask', 'no owner'][i] : m > 0.25 ? 'legal exception' : n}
            o={k(i * 0.2)}
            stroke={m > 0.5 ? (i === 2 ? C.focus : C.second) : C.mocha}
          />
        );
      })}
      {answer === null && t > 1.0 && (
        <T x={430} y={80} s={15} f={C.taupe} a="middle" o={k(1.0)}>
          ?
        </T>
      )}
      <Verdict answer={answer} text="rules automate; a legal reason needs a judge" y={236} />
    </Svg>
  );
}

// 6 · The stewardship answer. Top: the platform runs the tag check and the empty-owner check itself, both ticked, no person in
// the loop. Bottom: the legal reason and the ambiguous column go to one named steward, revisited at each mark on a schedule.
export function RevealStewardshipAnswer({ t }: StepCtx) {
  const k = (d: number) => easeOut(seg(t, d, d + 0.35));
  return (
    <Svg label="a rule over a tag: automate. a legal reason, an ambiguous call: a named steward" h={250}>
      <Cell x={25} y={30} w={140} label="the platform" o={k(0)} stroke={C.second} />
      {['tag check', 'owner field empty?'].map((n, i) => (
        <g key={n}>
          <Fan x1={165} y1={44} x2={218} y2={30 + i * 38 + 14} k={k(0.6 + i * 0.3)} f={C.second} />
          <Cell x={220} y={30 + i * 38} w={190} h={28} label={n} o={k(0.7 + i * 0.3)} />
          <MiniTick x={425} y={40 + i * 38} k={k(1.2 + i * 0.3)} />
        </g>
      ))}
      {['legal reason', 'ambiguous column'].map((n, i) => (
        <g key={n}>
          <Cell x={25} y={130 + i * 38} w={170} h={28} label={n} o={k(2.2 + i * 0.3)} />
          <Fan x1={195} y1={144 + i * 38} x2={268} y2={160} k={k(2.6 + i * 0.3)} f={C.focus} />
        </g>
      ))}
      <Cell x={270} y={146} w={150} label="a named steward" o={k(2.8)} stroke={C.focus} />
      <line x1={440} y1={160} x2={575} y2={160} stroke={C.mocha} strokeWidth={1.2} opacity={k(3.2)} />
      {[0, 1, 2, 3].map((i) => (
        <MiniTick key={i} x={450 + i * 32} y={150} k={k(3.4 + i * 0.25)} f={C.focus} />
      ))}
      {t > 3.6 && (
        <T x={575} y={200} s={11} f={C.focus} a="end" o={k(3.6)}>
          reviewed on a schedule
        </T>
      )}
    </Svg>
  );
}

const RULES = ['schema', 'contract', 'tag'];

// 7 · The gate, run. orders.daily_summary meets all three rules, ticked one by one, and is admitted. customers.raw_signups
// passes schema and contract, fails the tag, and is rejected; the rejection names the rule.
export function RevealGateRuns({ t }: StepCtx) {
  const k = (d: number) => easeOut(seg(t, d, d + 0.3));
  return (
    <Svg label="measured: a compliant table is admitted; one missing its tag is rejected, by name" h={250}>
      {RULES.map((r, j) => (
        <T key={r} x={262 + j * 75} y={32} s={11} f={C.taupe} a="middle" o={k(0)}>
          {r}
        </T>
      ))}
      <Cell x={25} y={46} w={205} label="orders.daily_summary" o={k(0.2)} />
      {RULES.map((r, j) => (
        <MiniTick key={r} x={256 + j * 75} y={56} k={k(0.8 + j * 0.3)} />
      ))}
      <Cell x={430} y={46} w={145} label="admitted" o={k(1.8)} stroke={C.focus} />
      <Cell x={25} y={110} w={205} label="customers.raw_signups" o={k(2.4)} />
      {RULES.map((r, j) => (j < 2 ? <MiniTick key={r} x={256 + j * 75} y={120} k={k(2.8 + j * 0.3)} /> : <Cross key={r} x={412} y={124} k={k(3.4)} />))}
      <Cell x={430} y={110} w={145} label="rejected" o={k(3.6)} stroke={C.cherryText} />
      {t > 4.0 && (
        <T x={25} y={190} s={11} f={C.cherryText} o={k(4.0)}>
          classification missing: sensitivity_tier
        </T>
      )}
    </Svg>
  );
}

// 8 · Recap. The rule, once and central; ownership, local; and the dividing line between a rule a machine checks and a
// judgment a named person answers for.
export function Recap({ t }: StepCtx) {
  const k = (d: number) => easeOut(seg(t, d, d + 0.35));
  return (
    <Svg label="policy central, ownership local, tooling automates; judgment keeps a named steward" h={250}>
      <MiniTick x={25} y={40} k={k(0.6)} />
      <T x={50} y={48} s={12} f={C.crema} o={k(0.5)}>
        the rule: written once, centrally
      </T>
      <MiniTick x={25} y={84} k={k(1.6)} />
      <T x={50} y={92} s={12} f={C.crema} o={k(1.5)}>
        ownership: where the data lives
      </T>
      <line x1={300} y1={120} x2={300} y2={120 + 100 * k(2.6)} stroke={C.mocha} strokeWidth={1.2} strokeDasharray="4 4" />
      <Cell x={25} y={150} w={250} label="a rule on a label: machine" o={k(3.0)} stroke={C.second} />
      <Cell x={325} y={150} w={250} label="a judgment: a named person" o={k(3.6)} stroke={C.focus} />
    </Svg>
  );
}
