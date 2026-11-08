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

// Every claim here traces to SAP's own notes and documentation, Databricks' own announcement, or SAP's knowledge-base
// articles on effective dating (SOURCES.md); the record ids and dates are examples.py's own.

// 0 · SAP, an undocumented endpoint, the lake. Runs flow through it again and again, every one correct. Then SAP's own
// support note lands on the endpoint and the auditor's cross goes up, while the runs carry on exactly as before.
export function UndocumentedEndpoint({ t }: StepCtx) {
  const k = (d: number) => easeOut(seg(t, d, d + 0.35));
  const note = easeOut(seg(t, 2.4, 2.8));
  return (
    <Svg label="A pipeline against an undocumented SAP endpoint, fine for years, flagged on audit" h={250}>
      <Cell x={25} y={86} w={140} label="SAP" o={k(0)} />
      <Hole x={235} y={86} w={110} o={k(0.1)} stroke={C.caramel} />
      <T x={290} y={76} s={11} f={C.caramel} a="middle" o={k(0.1)}>
        undocumented endpoint
      </T>
      <Cell x={425} y={86} w={150} label="the lake" o={k(0.2)} />
      {Array.from({ length: 7 }, (_, j) => {
        const m = seg(t, 0.4 + j * 0.6, 1.2 + j * 0.6);
        return m > 0 && m < 1 ? <Pip key={j} x={lerp(175, 415, m)} y={100} s={10} f={C.second} /> : null;
      })}
      {t > 1.3 && (
        <T x={425} y={136} s={11} f={C.focus} o={k(1.3)}>
          every run correct
        </T>
      )}
      <g opacity={note}>
        <path d="M220 150 h130 l14 14 v40 h-144 z" fill="none" stroke={C.cherryText} strokeWidth={1.5} />
        <T x={232} y={182} s={11} f={C.cherryText}>
          SAP Note 3255746
        </T>
      </g>
      <Fan x1={290} y1={148} x2={290} y2={118} k={easeOut(seg(t, 2.8, 3.1))} f={C.cherryText} />
      <Cross x={385} y={178} k={k(3.3)} />
      {t > 3.5 && (
        <T x={405} y={183} s={11} f={C.cherryText} o={k(3.5)}>
          never licensed
        </T>
      )}
      {t > 4.0 && (
        <T x={25} y={236} s={12} f={C.crema} o={k(4.0)}>
          nothing technical broke; the licensing did
        </T>
      )}
    </Svg>
  );
}

// 1 · Predict. Four tokens in a row: ODP, over RFC, a non-SAP tool, moving data out. Once answered, a bracket closes round
// all four as the one restricted combination, and the untouched mechanisms tick in below.
export function PredictWhichMechanism({ t, answer }: StepCtx) {
  const s = useSinceAnswer(answer !== null);
  const v = answer !== null ? easeOut(seg(s, 0.1, 0.6)) : 0;
  const w = answer !== null ? easeOut(seg(s, 0.6, 1.1)) : 0;
  const k = (d: number) => easeOut(seg(t, d, d + 0.3));
  const toks = ['ODP', 'over RFC', 'non-SAP tool', 'moving data out'];
  const fine = ['RFC itself', 'CDS extraction', 'OData'];
  return (
    <Svg label="Nothing about the pipeline's behavior changed — so what did?" h={250}>
      {toks.map((x, i) => (
        <Cell key={x} x={25 + i * 140} y={56} w={130} label={x} o={k(i * 0.15)} stroke={v > 0.5 ? C.cherryText : C.mocha} />
      ))}
      <rect x={20} y={48} width={555} height={44} rx={6} fill="none" stroke={C.cherryText} strokeWidth={1.8} strokeDasharray="1300" strokeDashoffset={1300 * (1 - v)} />
      {v > 0.5 && (
        <T x={25} y={40} s={11} f={C.cherryText} o={v}>
          restricted only together
        </T>
      )}
      {answer === null && t > 0.7 && (
        <T x={300} y={130} s={15} f={C.taupe} a="middle" o={k(0.7)}>
          ?
        </T>
      )}
      {fine.map((x, i) => (
        <g key={x} opacity={w}>
          <Cell x={25 + i * 190} y={130} w={160} label={x} stroke={C.focus} />
          <MiniTick x={170 + i * 190} y={174} k={w} />
        </g>
      ))}
      <Verdict answer={answer} text="ODP over RFC, from a non-SAP tool" y={230} />
    </Svg>
  );
}

// 2 · Four module tables, each a block of coded columns. A CDS view drops in above them, edges reach down to each, and an
// extraction tool reads the view instead of the raw tables.
export function ModuleTablesAndCds({ t }: StepCtx) {
  const k = (d: number) => easeOut(seg(t, d, d + 0.35));
  const mods = ['finance', 'materials', 'production', 'quality'];
  const drop = easeOutBack(seg(t, 1.6, 2.1));
  return (
    <Svg label="Raw, densely coded module tables, with CDS views adding names and relationships" h={250}>
      {mods.map((m, i) => {
        const x = 25 + i * 140;
        return (
          <g key={m}>
            <T x={x} y={166} s={11} f={C.taupe} o={k(0.2 + i * 0.2)}>
              {m}
            </T>
            <rect x={x} y={174} width={120} height={56} rx={4} fill="none" stroke={C.mocha} strokeWidth={1.5} opacity={k(0.2 + i * 0.2)} />
            {[0, 1, 2].map((r) => (
              <g key={r} opacity={k(0.4 + i * 0.2)}>
                <rect x={x + 10} y={184 + r * 14} width={30} height={6} rx={1} fill={C.taupe} />
                <rect x={x + 46} y={184 + r * 14} width={22} height={6} rx={1} fill={C.taupe} />
                <rect x={x + 74} y={184 + r * 14} width={36} height={6} rx={1} fill={C.taupe} />
              </g>
            ))}
          </g>
        );
      })}
      {t > 1.2 && (
        <T x={575} y={246} s={11} f={C.taupe} a="end" o={k(1.2)}>
          coded names, built for the application
        </T>
      )}
      {drop > 0 && <Cell x={25} y={lerp(40, 70, drop)} w={400} h={32} label="CDS view: names, relationships" o={clamp(drop * 2)} stroke={C.second} f={C.second} />}
      {mods.map((m, i) => (
        <line key={m} x1={85 + i * 140} y1={104} x2={85 + i * 140} y2={lerp(104, 152, easeOut(seg(t, 2.2 + i * 0.12, 2.6 + i * 0.12)))} stroke={C.second} strokeWidth={1.5} />
      ))}
      <Req x1={430} x2={448} y={86} k={k(3.2)} />
      <Cell x={455} y={72} w={120} label="extraction" o={k(3.2)} />
      {t > 3.7 && (
        <T x={25} y={40} s={12} f={C.focus} o={k(3.7)}>
          the tool reads the view, not the raw tables
        </T>
      )}
    </Svg>
  );
}

// 3 · A grid: four mechanisms against insert, update, delete and intermediate states, filled a column at a time. In the
// delete column OData's cell crosses and its row is ringed: the REST-based one can quietly miss a delete.
export function FourMechanisms({ t }: StepCtx) {
  const k = (d: number) => easeOut(seg(t, d, d + 0.35));
  const rows = [
    { name: 'ODP delta queue', v: [true, true, true, false] },
    { name: 'SLT trigger', v: [true, true, true, true] },
    { name: 'OData', v: [true, true, false, false] },
    { name: 'database CDC', v: [true, true, true, true] },
  ];
  const cols = [
    { x: 220, label: 'insert', d: 1.0 },
    { x: 300, label: 'update', d: 1.6 },
    { x: 380, label: 'delete', d: 2.2 },
    { x: 490, label: 'intermediate', d: 3.4 },
  ];
  const ring = easeOut(seg(t, 2.6, 3.0));
  return (
    <Svg label="Four extraction mechanisms, compared by what each can actually see" h={250}>
      {cols.map((c) => (
        <T key={c.label} x={c.x} y={40} s={11} f={C.taupe} a="middle" o={k(c.d - 0.3)}>
          {c.label}
        </T>
      ))}
      {rows.map((r, i) => {
        const y = 70 + i * 38;
        return (
          <g key={r.name}>
            <T x={25} y={y + 4} s={12} f={i === 2 && ring > 0.5 ? C.cherryText : C.crema} o={k(0.2 + i * 0.15)}>
              {r.name}
            </T>
            {cols.map((c, j) => (r.v[j] ? <MiniTick key={j} x={c.x - 6} y={y} k={k(c.d + i * 0.08)} /> : <Cross key={j} x={c.x} y={y} k={k(c.d + i * 0.08) * (j === 3 ? 0.5 : 1)} />))}
          </g>
        );
      })}
      <rect x={18} y={136} width={400} height={30} rx={6} fill="none" stroke={C.cherryText} strokeWidth={1.8} strokeDasharray="900" strokeDashoffset={900 * (1 - ring)} />
      {t > 3.0 && (
        <T x={25} y={230} s={12} f={C.cherryText} o={k(3.0)}>
          OData can quietly miss a delete
        </T>
      )}
    </Svg>
  );
}

// 4 · SAP Note 3255746 moving through its own history along a timeline: 2022, unsupported; version 4 on 2 February 2024,
// prohibited; 7 July 2024, use Datasphere. A ring steps from stage to stage while the connector below never moves.
export function NoteHistory({ t }: StepCtx) {
  const k = (d: number) => easeOut(seg(t, d, d + 0.35));
  const stages = [
    { x: 100, date: '2022', word: 'unsupported', f: C.caramel, d: 0.6 },
    { x: 300, date: '2 February 2024', word: 'prohibited', f: C.cherryText, d: 1.8 },
    { x: 500, date: '7 July 2024', word: 'use Datasphere', f: C.second, d: 3.0 },
  ];
  const line = easeInOut(seg(t, 0.3, 3.0));
  const rx = t < 1.8 ? 100 : t < 3.0 ? lerp(100, 300, easeInOut(seg(t, 1.6, 1.9))) : lerp(300, 500, easeInOut(seg(t, 2.8, 3.1)));
  return (
    <Svg label="SAP's own support note, moving through three named stages" h={250}>
      <T x={25} y={30} s={12} f={C.crema} o={k(0)}>
        SAP Note 3255746
      </T>
      <line x1={60} y1={110} x2={lerp(60, 540, line)} y2={110} stroke={C.mocha} strokeWidth={1.5} />
      {stages.map((s) => (
        <g key={s.date}>
          <Pip x={s.x} y={110} s={10} f={s.f} o={k(s.d)} />
          <T x={s.x} y={88} s={11} f={C.taupe} a="middle" o={k(s.d)}>
            {s.date}
          </T>
          <T x={s.x} y={138} s={12} f={s.f} a="middle" o={k(s.d + 0.15)}>
            {s.word}
          </T>
        </g>
      ))}
      <circle cx={rx} cy={110} r={11} fill="none" stroke={C.crema} strokeWidth={1.5} opacity={k(0.6)} />
      <Cell x={150} y={180} w={200} label="the connector" o={k(0.4)} />
      {t > 3.7 && (
        <T x={365} y={199} s={11} f={C.focus} o={k(3.7)}>
          never moved
        </T>
      )}
      <MiniTick x={460} y={190} k={k(3.9)} />
    </Svg>
  );
}

// 5 · Inside SAP Business Data Cloud: Datasphere, the steer, and SAP Databricks, made with Databricks. Data flows both ways
// between SAP Databricks and the customer's own Databricks, and Unity Catalog spans both sides beneath them.
export function DatasphereAndDatabricks({ t }: StepCtx) {
  const k = (d: number) => easeOut(seg(t, d, d + 0.35));
  const there = easeInOut(seg(t, 2.3, 2.8));
  const back = easeInOut(seg(t, 2.8, 3.3));
  const uc = easeOut(seg(t, 3.6, 4.1));
  return (
    <Svg label="SAP's vendor-preferred path, and a named outside partner inside the same platform" h={250}>
      <T x={25} y={24} s={11} f={C.caramel} o={k(0)}>
        the vendor's steer
      </T>
      <rect x={25} y={36} width={330} height={116} rx={8} fill="none" stroke={C.mocha} strokeWidth={1.5} opacity={k(0)} />
      <T x={37} y={58} s={12} f={C.crema} o={k(0)}>
        SAP Business Data Cloud
      </T>
      <Cell x={40} y={76} w={140} label="Datasphere" o={k(0.4)} stroke={C.caramel} f={C.caramel} />
      <Cell x={195} y={76} w={145} label="SAP Databricks" o={k(1.0)} stroke={C.second} f={C.second} />
      {t > 1.4 && (
        <T x={195} y={128} s={11} f={C.second} o={k(1.4)}>
          with Databricks
        </T>
      )}
      <Cell x={420} y={76} w={155} label="your Databricks" o={k(1.8)} />
      <Req x1={345} x2={414} y={84} k={there} f={C.second} />
      <Back x1={414} x2={345} y={98} k={back} f={C.second} />
      {t > 3.3 && (
        <T x={420} y={128} s={11} f={C.second} o={k(3.3)}>
          both directions
        </T>
      )}
      <line x1={330} y1={104} x2={330} y2={lerp(104, 184, uc)} stroke={C.focus} strokeWidth={1.5} opacity={uc > 0 ? 1 : 0} />
      <line x1={560} y1={104} x2={560} y2={lerp(104, 184, uc)} stroke={C.focus} strokeWidth={1.5} opacity={uc > 0 ? 1 : 0} />
      <Cell x={195} y={184} w={380} label="Unity Catalog: who sees what, both sides" o={k(3.9)} stroke={C.focus} f={C.focus} />
    </Svg>
  );
}

// 6 · Two effective-dated versions of one position as bars on a date line. The as-of cursor sits at 2026-03-15 and
// pos-1-v1 lights; it moves to 2026-08-01 and pos-1-v2 lights; it moves to 2025-12-31, before both, and nothing comes back.
export function EffectiveDatedCursor({ t }: StepCtx) {
  const k = (d: number) => easeOut(seg(t, d, d + 0.35));
  const m1 = easeInOut(seg(t, 1.6, 2.1));
  const m2 = easeInOut(seg(t, 3.0, 3.6));
  const cx = t < 3.0 ? lerp(180, 360, m1) : lerp(360, 80, m2);
  const still = (t > 0.4 && t < 1.6) || (t > 2.1 && t < 3.0) || t > 3.6;
  const phase = t < 1.6 ? 0 : t < 3.0 ? 1 : 2;
  const dates = ['2026-03-15', '2026-08-01', '2025-12-31'];
  const res = ['pos-1-v1', 'pos-1-v2', 'nothing at all'];
  const v1 = phase === 0 && still;
  const v2 = phase === 1 && still;
  return (
    <Svg label="An as-of date outside a record's effective window returns nothing, not a stale row" h={250}>
      <rect x={110} y={110} width={190} height={16} rx={2} fill={v1 ? C.second : 'none'} stroke={C.second} strokeWidth={1.5} opacity={k(0)} />
      <T x={110} y={100} s={11} f={C.second} o={k(0)}>
        pos-1-v1
      </T>
      <rect x={310} y={150} width={250} height={16} rx={2} fill={v2 ? C.second : 'none'} stroke={C.second} strokeWidth={1.5} opacity={k(0.15)} />
      <T x={420} y={140} s={11} f={C.second} o={k(0.15)}>
        pos-1-v2
      </T>
      <line x1={cx} y1={104} x2={cx} y2={180} stroke={phase === 2 && still ? C.cherryText : C.caramel} strokeWidth={2} opacity={k(0.3)} />
      {still && (
        <T x={cx + 6} y={72} s={11} f={C.caramel} o={k(0.4)}>
          as of {dates[phase]}
        </T>
      )}
      {still && (
        <T x={25} y={214} s={12} f={phase === 2 ? C.cherryText : C.focus} o={1}>
          returns: {res[phase]}
        </T>
      )}
      {t > 4.0 && (
        <T x={25} y={240} s={11} f={C.taupe} o={k(4.0)}>
          not a stale row: as if it never existed
        </T>
      )}
    </Svg>
  );
}

// 7 · Recap. Four points slide in as four cards: views give tables meaning, a mechanism's limit is what it sees, a note's
// wording is a clock, a wrong date returns nothing.
export function Recap({ t }: StepCtx) {
  const k = (d: number) => easeOut(seg(t, d, d + 0.35));
  const pts = ['views give raw tables meaning', 'a limit is what it can see', "a note's wording is a clock", 'a wrong date returns nothing'];
  return (
    <Svg label="The four-part recap of this topic's point" h={250}>
      {pts.map((p, i) => {
        const d = 0.3 + i * 0.6;
        const a = easeOut(seg(t, d, d + 0.45));
        const x = 25 + (i % 2) * 285;
        const y = 50 + Math.floor(i / 2) * 60;
        return a > 0 ? <Cell key={p} x={lerp(x - 20, x, a)} y={y} w={265} label={p} o={a} stroke={i === 3 ? C.cherryText : C.mocha} /> : null;
      })}
      {t > 3.4 && (
        <T x={300} y={210} s={13} f={C.crema} a="middle" o={k(3.4)}>
          four points, kept separate
        </T>
      )}
    </Svg>
  );
}

// 8 · Prove it. A fixed as-of cursor, last month, re-run night after night; a new position's bar starts after it. Once
// answered, the bar is ringed outside the window: filtered out, a stale date.
export function ProveIt({ t, answer }: StepCtx) {
  const s = useSinceAnswer(answer !== null);
  const v = answer !== null ? easeOut(seg(s, 0.1, 0.6)) : 0;
  const k = (d: number) => easeOut(seg(t, d, d + 0.3));
  return (
    <Svg label="A fixed as-of date, run nightly, missing a position promoted since that date" h={250}>
      <line x1={25} y1={130} x2={575} y2={130} stroke={C.mocha} strokeWidth={1.5} opacity={k(0)} />
      <line x1={200} y1={70} x2={200} y2={150} stroke={C.caramel} strokeWidth={2} opacity={k(0.2)} />
      <T x={206} y={62} s={11} f={C.caramel} o={k(0.2)}>
        fixed as-of date, last month
      </T>
      {[0, 1, 2].map((j) => (
        <Pip key={j} x={200} y={170 + j * 16} s={8} f={C.caramel} o={k(0.5 + j * 0.2)} />
      ))}
      <T x={214} y={190} s={11} f={C.taupe} o={k(0.9)}>
        every night, the same date
      </T>
      <rect x={380} y={98} width={180} height={16} rx={2} fill="none" stroke={v > 0.5 ? C.cherryText : C.second} strokeWidth={1.8} opacity={k(1.1)} />
      <T x={380} y={90} s={11} f={C.second} o={k(1.1)}>
        promoted last week
      </T>
      {answer === null && t > 1.5 && (
        <T x={470} y={152} s={15} f={C.taupe} a="middle" o={k(1.5)}>
          ?
        </T>
      )}
      {v > 0.5 && (
        <T x={380} y={152} s={11} f={C.cherryText} o={v}>
          outside its window
        </T>
      )}
      <Verdict answer={answer} text="a stale as-of date" y={238} />
    </Svg>
  );
}
