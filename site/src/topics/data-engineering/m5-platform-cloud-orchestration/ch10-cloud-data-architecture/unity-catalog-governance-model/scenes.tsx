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

/** A pointer from (x1, y) back toward x2 < x1, drawn by `k`. */
function Back({ x1, x2, y, k, f = C.crema }: { x1: number; x2: number; y: number; k: number; f?: string }) {
  const x = lerp(x1, x2, k);
  return (
    <g opacity={k > 0 ? 1 : 0}>
      <line x1={x1} y1={y} x2={x} y2={y} stroke={f} strokeWidth={1.8} />
      <path d={`M${x} ${y} l8 -5 v10 z`} fill={f} />
    </g>
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

/** An elbow edge in a namespace tree, drawn by `k`. */
function Edge({ x1, y1, x2, y2, k }: { x1: number; y1: number; x2: number; y2: number; k: number }) {
  const mx = (x1 + x2) / 2;
  return <path d={`M${x1} ${y1} H${mx} V${y2} H${x2}`} fill="none" stroke={C.mocha} strokeWidth={1.5} strokeDasharray="400" strokeDashoffset={400 * (1 - k)} />;
}

// Every behaviour here traces to Databricks' own current documentation or the Delta Sharing protocol's own specification
// (SOURCES.md), or to examples.py's local simulation of inheritance and tag policies.

// 0 · A schema already tagged pii-restricted, with a row filter and a column mask written against the tag. A new table,
// profiles, appears inside it; the tag arrives on it and the policy's locks land the instant it exists.
export function TableGovernedInstantly({ t }: StepCtx) {
  const k = (d: number) => easeOut(seg(t, d, d + 0.35));
  const born = k(1.2);
  const tag = easeOut(seg(t, 1.8, 2.2));
  const gov = k(2.5);
  return (
    <Svg label="A new table created inside an already-tagged schema, inheriting its policy instantly" h={250}>
      <Cell x={25} y={40} w={150} label="prod.customers" o={k(0)} />
      <Cell x={25} y={76} w={150} h={22} label="pii-restricted" o={k(0.2)} stroke={C.caramel} f={C.caramel} />
      <rect x={360} y={30} width={215} height={60} rx={6} fill="none" stroke={C.caramel} strokeWidth={1.5} opacity={k(0.4)} />
      <T x={372} y={52} s={12} f={C.crema} o={k(0.4)}>
        row filter + column mask
      </T>
      <T x={372} y={74} s={11} f={C.caramel} o={k(0.5)}>
        written on the tag
      </T>
      <Edge x1={100} y1={98} x2={220} y2={144} k={born} />
      <Cell x={220} y={130} w={130} label="profiles" o={born} stroke={gov > 0.5 ? C.focus : C.mocha} />
      {tag > 0 && <Cell x={360} y={lerp(118, 132, tag)} w={130} h={24} label="pii-restricted" o={tag} stroke={C.caramel} f={C.caramel} />}
      <Fan x1={467} y1={90} x2={467} y2={128} k={gov} f={C.caramel} />
      <Lock x={510} y={140} k={gov} f={C.focus} />
      {t > 2.9 && (
        <T x={220} y={186} s={12} f={C.focus} o={k(2.9)}>
          governed the instant it exists
        </T>
      )}
      {t > 3.5 && (
        <T x={25} y={232} s={11} f={C.cherryText} o={k(3.5)}>
          per-table grants would leave it ungoverned until someone remembered
        </T>
      )}
    </Svg>
  );
}

// 1 · Predict. A timeline: the policy is written first, the table appears later. Once answered, the table's tag lights
// and a live check runs from the policy to that tag.
export function PredictTagMechanism({ t, answer }: StepCtx) {
  const s = useSinceAnswer(answer !== null);
  const v = answer !== null ? easeOut(seg(s, 0.1, 0.6)) : 0;
  const k = (d: number) => easeOut(seg(t, d, d + 0.3));
  return (
    <Svg label="A policy checking a tag at query time instead of a fixed list of table names" h={250}>
      <line x1={25} y1={60} x2={575} y2={60} stroke={C.mocha} strokeWidth={1.5} />
      <Pip x={120} y={60} s={10} f={C.caramel} o={k(0)} />
      <T x={120} y={44} s={11} f={C.caramel} a="middle" o={k(0)}>
        policy written
      </T>
      <Pip x={430} y={60} s={10} f={C.crema} o={k(0.6)} />
      <T x={430} y={44} s={11} f={C.crema} a="middle" o={k(0.6)}>
        table created, later
      </T>
      <Cell x={25} y={100} w={200} label="policy" o={k(0.2)} stroke={C.caramel} />
      <Cell x={350} y={100} w={225} label="profiles" o={k(0.7)} />
      {v > 0 && <Cell x={350} y={140} w={160} h={24} label="pii-restricted" o={v} stroke={C.focus} f={C.focus} />}
      <Fan x1={225} y1={114} x2={345} y2={152} k={v} f={C.focus} />
      {v > 0.5 && (
        <T x={25} y={160} s={11} f={C.focus} o={v}>
          checked live, at every query
        </T>
      )}
      <Verdict answer={answer} text="a tag, not a list of names" y={222} />
    </Svg>
  );
}

// 2 · Two levels against three. With two, prod's sales.orders takes the only slot and staging's identical name bounces
// off it. With three, a catalog segment slides in front of each and both names stand side by side.
export function ThreeLevelNamespace({ t }: StepCtx) {
  const k = (d: number) => easeOut(seg(t, d, d + 0.35));
  const a = easeInOut(seg(t, 0.3, 0.9));
  const b = easeInOut(seg(t, 0.9, 1.4));
  const front = easeInOut(seg(t, 2.4, 3.0));
  return (
    <Svg label="A two-level namespace against the three-level catalog.schema.object namespace" h={250}>
      <T x={25} y={26} s={12} f={C.crema} o={k(0)}>
        two levels: schema.object
      </T>
      <Hole x={225} y={38} w={150} o={k(0)} />
      <Cell x={lerp(25, 225, a)} y={38} w={150} label="sales.orders" o={k(0)} stroke={C.second} />
      <Cell x={lerp(425, 385, b)} y={38} w={150} label="sales.orders" o={k(0.8)} stroke={b >= 1 ? C.cherryText : C.mocha} />
      {b >= 1 && <Cross x={380} y={84} k={k(1.4)} />}
      {t > 1.5 && (
        <T x={225} y={88} s={11} f={C.cherryText} o={k(1.5)}>
          one name, one slot
        </T>
      )}
      <T x={25} y={128} s={12} f={C.crema} o={k(2.0)}>
        three levels: catalog.schema.object
      </T>
      {['prod', 'staging'].map((c, i) => (
        <g key={c} opacity={k(2.1 + i * 0.1)}>
          <Cell x={lerp(25, 110, 1)} y={140 + i * 40} w={150} label="sales.orders" stroke={front >= 1 ? C.focus : C.mocha} />
          <Cell x={25} y={140 + i * 40} w={lerp(0, 80, front)} label={front > 0.9 ? c : ''} o={front} stroke={C.focus} f={C.focus} />
          <MiniTick x={272} y={150 + i * 40} k={k(3.1 + i * 0.15)} />
        </g>
      ))}
      {t > 3.5 && (
        <T x={300} y={192} s={11} f={C.focus} o={k(3.5)}>
          same metastore, no collision
        </T>
      )}
    </Svg>
  );
}

// 3 · Four kinds of securable, each with its own small picture and its own lock. Then a tables-only outline shows what a
// catalog scoped to tables alone would leave outside.
export function FourSecurableTypes({ t }: StepCtx) {
  const k = (d: number) => easeOut(seg(t, d, d + 0.35));
  const kinds: [string, string][] = [
    ['Tables', 'rows, columns'],
    ['Volumes', 'files'],
    ['Functions', 'one by one'],
    ['Models', 'the same way'],
  ];
  const out = k(3.3);
  return (
    <Svg label="One securable type at a time, each individually permissioned" h={240}>
      {kinds.map(([name, trait], i) => {
        const x = 25 + i * 140;
        const d = 0.2 + i * 0.75;
        return (
          <g key={name} opacity={k(d)}>
            {i === 0 && [0, 1, 2].map((r) => [0, 1, 2].map((c) => <rect key={`${r}${c}`} x={x + 20 + c * 26} y={40 + r * 18} width={22} height={14} rx={2} fill="none" stroke={C.second} />))}
            {i === 1 && (
              <g>
                <path d={`M${x + 20} 46 h30 l8 8 h42 v42 h-80 z`} fill="none" stroke={C.second} strokeWidth={1.5} />
                {[0, 1, 2].map((j) => (
                  <rect key={j} x={x + 30 + j * 22} y={66} width={14} height={20} rx={2} fill={C.second} opacity={0.6} />
                ))}
              </g>
            )}
            {i === 2 && (
              <T x={x + 60} y={80} s={18} f={C.second} a="middle">
                f(x)
              </T>
            )}
            {i === 3 && (
              <g>
                {[0, 1, 2].map((j) => (
                  <circle key={j} cx={x + 30 + j * 30} cy={52 + (j % 2) * 30} r={7} fill="none" stroke={C.second} strokeWidth={1.5} />
                ))}
                <path d={`M${x + 37} 52 L${x + 53} 82 L${x + 83} 52`} fill="none" stroke={C.second} strokeWidth={1.2} />
              </g>
            )}
            <Lock x={x + 106} y={36} k={k(d + 0.3)} f={C.focus} />
            <T x={x + 10} y={130} s={12} f={C.crema}>
              {name}
            </T>
            <T x={x + 10} y={148} s={11} f={C.latte}>
              {trait}
            </T>
          </g>
        );
      })}
      {out > 0 && <rect x={28} y={26} width={128} height={132} rx={6} fill="none" stroke={C.cherryText} strokeWidth={1.5} strokeDasharray="4 3" opacity={out} />}
      {t > 3.6 && (
        <T x={25} y={196} s={11} f={C.cherryText} o={k(3.6)}>
          a catalog scoped to tables alone leaves the other three outside
        </T>
      )}
    </Svg>
  );
}

// 4 · The real permission tree. SELECT is granted once on prod.sales; it reaches orders, which existed already, then
// returns, created afterwards, with no second grant. The catalog prod itself stays uncovered.
export function InheritanceTreeReal({ t }: StepCtx) {
  const k = (d: number) => easeOut(seg(t, d, d + 0.35));
  const grant = easeOut(seg(t, 0.8, 1.2));
  const born = k(2.2);
  return (
    <Svg label="A schema-level grant reaching a table that existed before it and one created after" h={250}>
      <Cell x={25} y={100} w={100} label="prod" o={k(0)} />
      <Edge x1={125} y1={114} x2={175} y2={114} k={k(0.1)} />
      <Cell x={175} y={100} w={120} label="sales" o={k(0.1)} stroke={grant > 0.5 ? C.focus : C.mocha} />
      <Cell x={175} y={lerp(52, 66, grant)} w={120} h={24} label="SELECT" o={grant} stroke={C.focus} f={C.focus} />
      <Edge x1={295} y1={114} x2={380} y2={74} k={k(0.2)} />
      <Cell x={380} y={60} w={140} label="orders" o={k(0.2)} />
      <MiniTick x={532} y={70} k={k(1.6)} />
      <T x={380} y={106} s={11} f={C.latte} o={k(1.6)}>
        existed before
      </T>
      <Edge x1={295} y1={114} x2={380} y2={154} k={born} />
      <Cell x={380} y={140} w={140} label="returns" o={born} />
      <MiniTick x={532} y={150} k={k(2.9)} />
      <T x={380} y={186} s={11} f={C.latte} o={k(2.9)}>
        created after the grant
      </T>
      {t > 3.4 && (
        <>
          <Cross x={75} y={150} k={k(3.4)} />
          <T x={25} y={176} s={11} f={C.cherryText} o={k(3.4)}>
            prod itself: not covered
          </T>
        </>
      )}
      {t > 3.9 && (
        <T x={300} y={232} s={12} f={C.focus} a="middle" o={k(3.9)}>
          granted once, never repeated
        </T>
      )}
    </Svg>
  );
}

// 5 · The real tag policy. profiles is created inside the tagged schema with no tag of its own: the policy's check runs
// and misses it. Then the tag is inherited onto profiles, the check runs again and covers it: ssn masked.
export function TagPolicyReal({ t }: StepCtx) {
  const k = (d: number) => easeOut(seg(t, d, d + 0.35));
  const c1 = easeInOut(seg(t, 1.1, 1.6));
  const tag = easeInOut(seg(t, 2.4, 3.0));
  const c2 = easeInOut(seg(t, 3.2, 3.7));
  return (
    <Svg label="A tag policy missing a table before tagging and covering it right after" h={250}>
      <Cell x={25} y={24} w={210} label="policy: mask ssn column" o={k(0)} stroke={C.caramel} />
      <Cell x={250} y={24} w={210} label="needs: pii-restricted" o={k(0.2)} stroke={C.caramel} f={C.caramel} />
      <Cell x={25} y={100} w={150} label="customers" o={k(0.3)} />
      <Cell x={25} y={136} w={150} h={24} label="pii-restricted" o={k(0.4)} stroke={C.caramel} f={C.caramel} />
      <Cell x={300} y={100} w={150} label="profiles" o={k(0.7)} stroke={c2 >= 1 ? C.focus : C.mocha} />
      {tag > 0 ? <Cell x={lerp(180, 300, tag)} y={136} w={150} h={24} label="pii-restricted" o={tag} stroke={C.caramel} f={C.caramel} /> : <Hole x={300} y={136} w={150} h={24} o={k(0.7)} />}
      {t < 2.4 && <Fan x1={130} y1={52} x2={370} y2={96} k={c1} f={C.cherryText} />}
      {t >= 1.6 && t < 2.4 && <Cross x={466} y={114} k={1} />}
      {t >= 1.6 && t < 2.4 && (
        <T x={300} y={186} s={11} f={C.cherryText}>
          no tag yet: not covered
        </T>
      )}
      {t >= 3.2 && <Fan x1={130} y1={52} x2={370} y2={96} k={c2} f={C.focus} />}
      {c2 >= 1 && <MiniTick x={460} y={110} k={1} />}
      {c2 >= 1 && (
        <T x={300} y={186} s={11} f={C.focus}>
          tag inherited: ssn masked
        </T>
      )}
      {t > 4.0 && (
        <T x={300} y={232} s={12} f={C.latte} a="middle" o={k(4.0)}>
          the tag is the trigger, not the location
        </T>
      )}
    </Svg>
  );
}

// 6 · Lineage and audit as tables. A lineage table fills with column-to-column links; an audit table fills with
// who-what-when rows; then one query pip visits both, like any other table.
export function LineageAuditTables({ t }: StepCtx) {
  const k = (d: number) => easeOut(seg(t, d, d + 0.35));
  const q = easeInOut(seg(t, 3.0, 4.0));
  return (
    <Svg label="Column-level lineage and audit logs both living as ordinary queryable tables" h={250}>
      {['lineage, per column', 'audit log'].map((h, i) => (
        <g key={h} opacity={k(i * 0.8)}>
          <T x={25 + i * 290} y={26} s={12} f={C.crema}>
            {h}
          </T>
          <rect x={25 + i * 290} y={36} width={260} height={130} rx={6} fill="none" stroke={C.second} strokeWidth={1.5} />
          {[0, 1, 2, 3].map((r) => {
            const kk = k(0.3 + i * 0.8 + r * 0.25);
            const y = 52 + r * 28;
            const x = 40 + i * 290;
            return i === 0 ? (
              <g key={r} opacity={kk}>
                <rect x={x} y={y} width={70} height={14} rx={2} fill={C.latte} opacity={0.5} />
                <path d={`M${x + 78} ${y + 7} h40`} stroke={C.second} strokeWidth={1.5} />
                <path d={`M${x + 118} ${y + 7} l-6 -4 v8 z`} fill={C.second} />
                <rect x={x + 126} y={y} width={90} height={14} rx={2} fill={C.second} opacity={0.6} />
              </g>
            ) : (
              <g key={r} opacity={kk}>
                <rect x={x} y={y} width={60} height={14} rx={2} fill={C.latte} opacity={0.5} />
                <rect x={x + 70} y={y} width={90} height={14} rx={2} fill={C.latte} opacity={0.35} />
                <rect x={x + 170} y={y} width={50} height={14} rx={2} fill={C.caramel} opacity={0.6} />
              </g>
            );
          })}
        </g>
      ))}
      {t > 3.0 && (
        <g>
          <line x1={155} y1={196} x2={445} y2={196} stroke={C.mocha} strokeDasharray="3 4" />
          <Pip x={lerp(155, 445, q)} y={196} s={10} f={C.focus} />
        </g>
      )}
      {t > 3.4 && (
        <T x={300} y={232} s={12} f={C.focus} a="middle" o={k(3.4)}>
          queried like any other table
        </T>
      )}
    </Svg>
  );
}

// 7 · Two ways to reach data without copying it. Top: Federation, your own users querying another system live through the
// catalog. Bottom: Delta Sharing, a recipient with no account presenting a bearer token and getting pre-signed URLs back.
export function FederationAndSharing({ t }: StepCtx) {
  const k = (d: number) => easeOut(seg(t, d, d + 0.35));
  return (
    <Svg label="Lakehouse Federation querying another system live against Delta Sharing's own bearer-token protocol" h={250}>
      <T x={25} y={24} s={11} f={C.latte} o={k(0)}>
        Federation
      </T>
      <Cell x={25} y={34} w={130} label="your users" o={k(0)} />
      <Cell x={210} y={34} w={150} label="Unity Catalog" o={k(0.2)} stroke={C.focus} />
      <Lock x={370} y={44} k={k(0.6)} f={C.focus} />
      <Cell x={425} y={34} w={150} label="another system" o={k(0.4)} />
      <Req x1={160} x2={205} y={48} k={easeInOut(seg(t, 0.5, 0.9))} />
      <Req x1={395} x2={420} y={48} k={easeInOut(seg(t, 0.9, 1.3))} />
      <T x={425} y={82} s={11} f={C.latte} o={k(1.3)}>
        queried live, governed
      </T>
      <T x={25} y={126} s={11} f={C.latte} o={k(2.0)}>
        Delta Sharing
      </T>
      <Cell x={25} y={136} w={130} label="your table" o={k(2.0)} />
      <Cell x={190} y={136} w={170} label="sharing server" o={k(2.1)} />
      <Cell x={400} y={136} w={175} label="recipient, no account" o={k(2.2)} stroke={C.second} />
      <Back x1={395} x2={365} y={144} k={easeInOut(seg(t, 2.6, 3.0))} f={C.second} />
      <T x={400} y={184} s={11} f={C.second} o={k(2.8)}>
        bearer token
      </T>
      <Req x1={365} x2={395} y={158} k={easeInOut(seg(t, 3.2, 3.6))} f={C.focus} />
      <T x={190} y={184} s={11} f={C.focus} o={k(3.6)}>
        pre-signed URLs back
      </T>
      {t > 4.0 && (
        <T x={300} y={232} s={12} f={C.focus} a="middle" o={k(4.0)}>
          no account on your platform needed
        </T>
      )}
    </Svg>
  );
}

// 8 · Recap: three lines, each beside a small moving picture of its idea.
export function Recap({ t }: StepCtx) {
  const k = (i: number) => easeOut(seg(t, 0.1 + i * 0.8, 0.5 + i * 0.8));
  const items = ['three levels, four securable types', 'one grant or tag, never repeated', 'a recipient needs only a bearer token'];
  return (
    <Svg label="The three-part recap of this topic's point" h={230}>
      {items.map((l, i) => (
        <T key={l} x={110} y={48 + i * 60} s={13} f={C.crema} o={k(i)}>
          {l}
        </T>
      ))}
      <g opacity={k(0)}>
        {[0, 1, 2].map((j) => (
          <rect key={j} x={25 + j * 22} y={36} width={18} height={14} rx={2} fill="none" stroke={C.second} />
        ))}
      </g>
      <g opacity={k(1)}>
        <rect x={25} y={92} width={30} height={12} rx={2} fill={C.caramel} />
        <rect x={60} y={lerp(80, 108, easeOut(seg(t, 1.0, 1.6)))} width={30} height={12} rx={2} fill={C.caramel} opacity={0.7} />
      </g>
      <g opacity={k(2)}>
        <rect x={25} y={156} width={lerp(0, 60, easeInOut(seg(t, 1.8, 2.6)))} height={10} rx={2} fill={C.second} />
      </g>
    </Svg>
  );
}

// 9 · Prove it. A partner with nothing in common with you, a question over their head. Once answered, their bearer
// token goes to the sharing server and pre-signed URLs come back; they read the table.
export function ProveIt({ t, answer }: StepCtx) {
  const s = useSinceAnswer(answer !== null);
  const v = answer !== null ? easeOut(seg(s, 0.1, 0.5)) : 0;
  const tok = answer !== null ? easeInOut(seg(s, 0.4, 0.9)) : 0;
  const url = answer !== null ? easeInOut(seg(s, 0.9, 1.4)) : 0;
  const k = (d: number) => easeOut(seg(t, d, d + 0.3));
  return (
    <Svg label="A partner with no Databricks account reading a shared table via a bearer token" h={250}>
      <Cell x={25} y={60} w={170} label="sharing server" o={k(0)} />
      <Cell x={380} y={60} w={195} label="partner, no account" o={k(0.3)} stroke={v > 0.5 ? C.focus : C.mocha} />
      {['no shared account', 'no shared platform'].map((c, i) => (
        <T key={c} x={380} y={112 + i * 18} s={11} f={C.latte} o={k(0.6 + i * 0.3)}>
          {c}
        </T>
      ))}
      {answer === null && (
        <T x={290} y={79} s={14} f={C.crema} a="middle" o={k(1.2)}>
          ?
        </T>
      )}
      <Back x1={375} x2={200} y={68} k={tok} f={C.second} />
      <Req x1={200} x2={375} y={84} k={url} f={C.focus} />
      {url >= 1 && <MiniTick x={556} y={70} k={1} />}
      <Verdict answer={answer} text="a bearer token and pre-signed URLs are enough" y={210} />
    </Svg>
  );
}
