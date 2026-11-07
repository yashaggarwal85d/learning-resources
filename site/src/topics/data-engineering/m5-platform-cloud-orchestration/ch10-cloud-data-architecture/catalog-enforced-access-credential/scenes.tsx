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

/** The real local table, as examples.py inserts it. */
const ROWS: [string, string, string][] = [
  ['east', 'Amara', '118000'],
  ['east', 'Deepak', '97000'],
  ['west', 'Lin', '142000'],
  ['west', 'Sofia', '88000'],
];

// 0 · Two engines reach the bucket through the catalog and come back masked. The quick-fix engine is handed the storage
// role and goes straight underneath the catalog to the bucket; nothing it holds ever asks.
export function QuietlySkipsMask({ t }: StepCtx) {
  const k = (d: number) => easeOut(seg(t, d, d + 0.35));
  const r = (d: number) => easeInOut(seg(t, d, d + 0.45));
  return (
    <Svg label="Two arrows from an engine to the bucket: one through the catalog (masked), one straight past it (unmasked)" h={250}>
      <Cell x={25} y={40} w={120} label="engine A" o={k(0)} />
      <Cell x={25} y={85} w={120} label="engine B" o={k(0)} />
      <Cell x={25} y={150} w={120} label="quick fix" o={k(1.8)} stroke={C.cherryText} />
      <rect x={230} y={36} width={140} height={82} rx={6} fill={C.cocoa} stroke={C.second} strokeWidth={1.5} opacity={k(0)} />
      <T x={300} y={82} s={12} f={C.second} a="middle" o={k(0)}>
        catalog
      </T>
      <rect x={455} y={36} width={120} height={150} rx={6} fill={C.cocoa} stroke={C.mocha} strokeWidth={1.5} opacity={k(0)} />
      <T x={515} y={116} s={12} f={C.crema} a="middle" o={k(0)}>
        bucket
      </T>
      <Req x1={150} x2={225} y={54} k={r(0.3)} />
      <Req x1={375} x2={450} y={54} k={r(0.7)} f={C.focus} />
      <Req x1={150} x2={225} y={99} k={r(0.6)} />
      <Req x1={375} x2={450} y={99} k={r(1.0)} f={C.focus} />
      <T x={412} y={136} s={11} f={C.focus} a="middle" o={k(1.3)}>
        scoped
      </T>
      <Req x1={150} x2={450} y={164} k={r(2.2)} f={C.cherryText} label="storage role, no catalog" />
      {t > 3.0 && (
        <T x={25} y={220} s={12} f={C.cherryText} o={k(3.0)}>
          never told a mask exists: nothing to disobey
        </T>
      )}
    </Svg>
  );
}

// 1 · Predict. The files, the table and the query are ticked as constant. One credential came through the catalog; the
// other's door is a question. Once answered, it turns out to be a bulk key that predates the catalog.
export function WhatMakesTheMaskApply({ t, answer }: StepCtx) {
  const s = useSinceAnswer(answer !== null);
  const v = answer !== null ? easeOut(seg(s, 0.1, 0.6)) : 0;
  const k = (d: number) => easeOut(seg(t, d, d + 0.3));
  return (
    <Svg label="A catalog-vended credential and a bulk credential, with the bulk one lit once revealed" h={250}>
      {['same files', 'same table', 'same query'].map((c, i) => (
        <g key={c}>
          <Cell x={25 + i * 190} y={30} w={150} label={c} o={k(i * 0.15)} />
          <MiniTick x={180 + i * 190} y={42} k={k(0.3 + i * 0.15)} />
        </g>
      ))}
      <T x={25} y={100} s={11} f={C.latte} o={k(0.5)}>
        masked engines
      </T>
      <Cell x={25} y={110} w={260} label="catalog-vended, scoped" o={k(0.5)} stroke={C.focus} f={C.focus} />
      <T x={315} y={100} s={11} f={C.latte} o={k(0.6)}>
        the engine that skipped it
      </T>
      {v > 0 ? <Cell x={315} y={110} w={260} label="bulk key, predates the catalog" o={v} stroke={C.cherryText} f={C.cherryText} /> : <Hole x={315} y={110} w={260} o={k(0.6)} />}
      {answer === null && (
        <T x={445} y={129} s={14} f={C.crema} a="middle" o={k(0.8)}>
          ?
        </T>
      )}
      <Verdict answer={answer} text="the catalog binds only reads that pass through it" y={200} />
    </Svg>
  );
}

// 2 · The shape under five names. A request pip walks metadata, check policy, credentials and data; at the credentials
// step a scoped east-only, 900-second credential comes back, never a master key. Then the five catalog names light in turn.
export function OneDiagramFiveNames({ t }: StepCtx) {
  const k = (d: number) => easeOut(seg(t, d, d + 0.35));
  const steps = ['metadata', 'check policy', 'credentials', 'data'];
  const p = clamp(seg(t, 0.3, 2.0)) * 3;
  const names = ['Lake Formation', 'Unity Catalog', 'BigLake', 'OneLake', 'Polaris'];
  const active = Math.floor(clamp(seg(t, 2.5, 5.0)) * 4.999);
  return (
    <Svg label="The catalog-and-vending diagram, relabelled under five vendor names in turn" h={250}>
      {steps.map((st, i) => (
        <Cell key={st} x={25 + i * 143} y={30} w={120} label={st} o={k(i * 0.1)} stroke={p >= i ? C.second : C.mocha} />
      ))}
      <line x1={85} y1={72} x2={514} y2={72} stroke={C.mocha} strokeWidth={1.2} strokeDasharray="3 4" opacity={k(0)} />
      <Pip x={85 + p * 143} y={72} s={10} f={C.second} />
      <Cell x={311} y={86} w={120} h={24} label="east, 900 s" o={k(1.4)} stroke={C.focus} f={C.focus} />
      <T x={311} y={126} s={11} f={C.focus} o={k(1.6)}>
        scoped, never a master key
      </T>
      {names.map((n, i) => {
        const x = i < 3 ? 25 + i * 190 : 120 + (i - 3) * 190;
        const y = i < 3 ? 150 : 192;
        const lit = t > 2.5 && i <= active;
        return <Cell key={n} x={x} y={y} w={170} label={n} o={k(2.3)} stroke={lit ? C.caramel : C.mocha} f={lit && i === active ? C.caramel : C.crema} />;
      })}
    </Svg>
  );
}

// 3 · The real table, as the east analyst queries it. The row filter drops the west rows before the query ever sees them;
// then the mask swaps each returned salary for null.
export function RowFilterColumnMask({ t }: StepCtx) {
  const k = (d: number) => easeOut(seg(t, d, d + 0.35));
  const filt = easeOut(seg(t, 0.8, 1.4));
  const masked = t > 2.6;
  return (
    <Svg label="A row of data filtered by region, then a column masked for salary, both against a real local table" h={250}>
      {['region', 'employee', 'salary'].map((h, i) => (
        <T key={h} x={35 + i * 150} y={30} s={11} f={C.latte} o={k(0)}>
          {h}
        </T>
      ))}
      {ROWS.map(([reg, emp, sal], i) => {
        const y = 40 + i * 32;
        const west = reg === 'west';
        const o = k(0.1 + i * 0.1) * (west ? 1 - 0.8 * filt : 1);
        return (
          <g key={emp} opacity={o}>
            <rect x={25} y={y} width={450} height={26} rx={4} fill={C.cocoa} stroke={C.mocha} strokeWidth={1.2} />
            <T x={35} y={y + 17} s={12} f={C.crema}>
              {reg}
            </T>
            <T x={185} y={y + 17} s={12} f={C.crema}>
              {emp}
            </T>
            <T x={335} y={y + 17} s={12} f={!west && masked ? C.caramel : C.crema}>
              {!west && masked ? 'null' : sal}
            </T>
            {west && filt > 0 && <line x1={30} y1={y + 13} x2={lerp(30, 470, filt)} y2={y + 13} stroke={C.cherryText} strokeWidth={1.5} />}
          </g>
        );
      })}
      <T x={25} y={200} s={11} f={C.second} o={k(1.2)}>
        row filter: west rows never reach the query
      </T>
      {t > 2.6 && (
        <T x={25} y={226} s={11} f={C.caramel} o={k(2.6)}>
          column mask: each returned salary swapped for null
        </T>
      )}
    </Svg>
  );
}

// 4 · The open protocol. A client asks an Iceberg REST catalog to load a table, offering vended credentials; the
// LoadTableResult comes back, and the client's pointer goes to storage-credentials first, config only after.
export function OpenProtocolVersion({ t }: StepCtx) {
  const k = (d: number) => easeOut(seg(t, d, d + 0.35));
  const fields = ['metadata', 'config', 'storage-credentials'];
  const look1 = k(2.4);
  const look2 = k(3.4);
  const py = look2 >= 1 ? 164 : look1 > 0 ? lerp(134, 194, look1) : 134;
  return (
    <Svg label="A LoadTableResult response with a storage-credentials field, checked before any other config" h={250}>
      <Cell x={25} y={30} w={130} label="client" o={k(0)} />
      <Cell x={445} y={30} w={130} label="REST catalog" o={k(0)} />
      <Req x1={160} x2={440} y={44} k={easeInOut(seg(t, 0.3, 0.9))} label="load table, vended-credentials" />
      <Back x1={440} x2={160} y={74} k={easeInOut(seg(t, 1.0, 1.6))} f={C.second} />
      <rect x={25} y={100} width={550} height={110} rx={6} fill={C.cocoa} stroke={C.second} strokeWidth={1.5} opacity={k(1.5)} />
      <T x={37} y={118} s={11} f={C.second} o={k(1.5)}>
        LoadTableResult
      </T>
      {fields.map((f, i) => (
        <T key={f} x={70} y={140 + i * 30} s={12} f={i === 2 && look1 >= 1 ? C.focus : C.crema} o={k(1.7 + i * 0.1)}>
          {f}
        </T>
      ))}
      {t > 2.4 && <Pip x={52} y={py} s={9} f={C.focus} />}
      {look1 >= 1 && <MiniTick x={250} y={190} k={look1} />}
      {look1 >= 1 && (
        <T x={270} y={200} s={11} f={C.focus}>
          checked first
        </T>
      )}
      {look2 >= 1 && (
        <T x={270} y={170} s={11} f={C.latte}>
          only then
        </T>
      )}
      {t > 3.8 && (
        <T x={300} y={238} s={12} f={C.latte} a="middle" o={k(3.8)}>
          an open spec any catalog can implement
        </T>
      )}
    </Svg>
  );
}

// 5 · A grant on a tag. It already covers table A; table B is created later with the same tag and the grant reaches it
// with nobody touching anything; then a mistagged table inherits the same grant, in red.
export function TagBasedGrant({ t }: StepCtx) {
  const k = (d: number) => easeOut(seg(t, d, d + 0.35));
  const tables: [string, number, string][] = [
    ['table A · pii', 0.3, C.crema],
    ['table B, new · pii', 1.2, C.focus],
    ['orders · mistagged pii', 2.5, C.cherryText],
  ];
  return (
    <Svg label="A tag-based grant automatically covering a new table created after the rule was written" h={250}>
      <Cell x={25} y={96} w={170} label="grant on tag: pii" o={k(0)} stroke={C.second} f={C.second} />
      {tables.map(([name, d, f], i) => (
        <g key={name}>
          <Cell x={380} y={lerp(26, 36, k(d)) + i * 60} w={195} label={name} o={k(d)} stroke={f === C.crema ? C.mocha : f} f={f} />
          <Fan x1={200} y1={110} x2={375} y2={50 + i * 60} k={easeInOut(seg(t, d + 0.3, d + 0.8))} f={f === C.crema ? C.second : f} />
        </g>
      ))}
      {t > 1.9 && (
        <T x={25} y={214} s={11} f={C.focus} o={k(1.9)}>
          nobody re-granted table B
        </T>
      )}
      {t > 3.2 && (
        <T x={25} y={238} s={11} f={C.cherryText} o={k(3.2)}>
          a wrong tag silently inherits every grant it carries
        </T>
      )}
    </Svg>
  );
}

// 6 · The bypass, for real. The same table read twice: the scoped connection returns Amara and Deepak with salary null;
// the bulk connection returns all four rows, every salary in the clear.
export function BypassReproduced({ t }: StepCtx) {
  const k = (d: number) => easeOut(seg(t, d, d + 0.35));
  return (
    <Svg label="A scoped read and a bypass read of the identical table, side by side" h={250}>
      <T x={25} y={28} s={12} f={C.focus} o={k(0)}>
        scoped credential
      </T>
      <T x={315} y={28} s={12} f={C.cherryText} o={k(1.6)}>
        bulk credential
      </T>
      {ROWS.map(([reg, emp, sal], i) => {
        const y = 40 + i * 34;
        const left = reg === 'east';
        return (
          <g key={emp}>
            {left ? (
              <g opacity={k(0.3 + i * 0.25)}>
                <Cell x={25} y={y} w={130} label={emp} />
                <Cell x={165} y={y} w={110} label="null" f={C.caramel} />
              </g>
            ) : (
              <Hole x={25} y={y} w={250} o={k(0.8) * 0.6} />
            )}
            <g opacity={k(1.9 + i * 0.3)}>
              <Cell x={315} y={y} w={130} label={emp} stroke={C.cherryText} />
              <Cell x={455} y={y} w={120} label={sal} stroke={C.cherryText} f={C.cherryText} />
            </g>
          </g>
        );
      })}
      <T x={25} y={200} s={11} f={C.focus} o={k(1.2)}>
        two rows, salary blank
      </T>
      <T x={315} y={200} s={11} f={C.cherryText} o={k(3.2)}>
        all four rows, unmasked
      </T>
      {t > 3.8 && (
        <T x={300} y={236} s={12} f={C.latte} a="middle" o={k(3.8)}>
          nothing it held was ever checked
        </T>
      )}
    </Svg>
  );
}

// 7 · Recap: three lines, each beside a small moving picture, ending on the sixth name still to come.
export function Recap({ t }: StepCtx) {
  const k = (i: number) => easeOut(seg(t, 0.1 + i * 0.7, 0.5 + i * 0.7));
  const lines = ['The policy lives in the catalog, not the files', 'Skip the catalog, and you skip the policy', 'Five names today; expect a sixth'];
  return (
    <Svg label="The three-part recap of the catalog-and-vending mechanism" h={230}>
      {lines.map((l, i) => (
        <T key={l} x={110} y={48 + i * 60} s={13} f={C.crema} o={k(i)}>
          {l}
        </T>
      ))}
      <g opacity={k(0)}>
        <rect x={25} y={30} width={60} height={26} rx={4} fill="none" stroke={C.second} strokeWidth={1.5} />
        <Lock x={47} y={40} k={k(0.3)} f={C.second} />
      </g>
      <g opacity={k(1)}>
        <rect x={40} y={86} width={30} height={14} rx={3} fill="none" stroke={C.second} />
        <line x1={25} y1={110} x2={lerp(25, 90, easeInOut(seg(t, 0.8, 1.6)))} y2={110} stroke={C.cherryText} strokeWidth={1.8} />
      </g>
      <g opacity={k(2)}>
        {[0, 1, 2, 3, 4, 5].map((j) => (
          <circle key={j} cx={28 + j * 12} cy={163} r={4} fill={j < 5 ? C.caramel : 'none'} stroke={C.caramel} strokeDasharray={j === 5 ? '2 2' : undefined} />
        ))}
      </g>
    </Svg>
  );
}

// 8 · Prove it. The bypass path runs under the catalog to the bucket; the old bulk account on it is deleted. Once answered,
// a next bulk role appears in the same spot and walks the same open path.
export function ProveIt({ t, answer }: StepCtx) {
  const s = useSinceAnswer(answer !== null);
  const v = answer !== null ? easeOut(seg(s, 0.1, 0.5)) : 0;
  const walk = answer !== null ? easeInOut(seg(s, 0.5, 1.2)) : 0;
  const del = easeOut(seg(t, 0.6, 1.4));
  return (
    <Svg label="Deleting one account versus closing the bypass path itself" h={250}>
      <Cell x={230} y={30} w={140} label="catalog" stroke={C.second} f={C.second} />
      <rect x={455} y={30} width={120} height={140} rx={6} fill={C.cocoa} stroke={C.mocha} strokeWidth={1.5} />
      <T x={515} y={104} s={12} f={C.crema} a="middle">
        bucket
      </T>
      <line x1={150} y1={134} x2={450} y2={134} stroke={C.cherryText} strokeWidth={1.5} strokeDasharray="4 4" />
      <T x={300} y={124} s={11} f={C.cherryText} a="middle">
        a path that skips the catalog
      </T>
      {v > 0 ? <Cell x={25} y={120} w={120} label="next bulk role" o={v} stroke={C.cherryText} f={C.cherryText} /> : <Cell x={25} y={120} w={120} label="bulk_engine" o={1 - 0.7 * del} />}
      {v === 0 && <Cross x={157} y={110} k={del} />}
      {walk > 0 && <Pip x={lerp(150, 445, walk)} y={134} s={10} f={C.cherryText} />}
      <Verdict answer={answer} text="the path stays open for the next credential" y={220} />
    </Svg>
  );
}
