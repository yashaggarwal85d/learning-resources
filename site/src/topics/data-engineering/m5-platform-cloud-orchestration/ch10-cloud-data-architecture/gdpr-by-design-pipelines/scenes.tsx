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

// Every rule here traces to the GDPR's own Article text (5, 30, 33, 35) or OpenLineage's own specification (SOURCES.md);
// every value is examples.py's own synthetic record, tag, date or hour.

// 0 · The regulator's request and five business days ticking off, met by an onboarding slide deck years out of date.
// Then the alternative: the pipeline's lineage, tagged, feeding a record that fills in row by row, fresh, right now.
export function RegulatorHook({ t }: StepCtx) {
  const k = (d: number) => easeOut(seg(t, d, d + 0.35));
  const fresh = (j: number) => easeOut(seg(t, 3.3 + j * 0.25, 3.7 + j * 0.25));
  return (
    <Svg label="A regulator's request, met with a stale slide deck, then a record built fresh" h={250}>
      <Cell x={25} y={30} w={200} label="regulator: the record" o={k(0)} />
      {[0, 1, 2, 3, 4].map((j) => (
        <g key={j}>
          <rect x={245 + j * 28} y={35} width={18} height={18} rx={3} fill="none" stroke={C.mocha} strokeWidth={1.5} opacity={k(0.2)} />
          <Pip x={254 + j * 28} y={44} s={10} f={C.caramel} o={easeOut(seg(t, 0.5 + j * 0.2, 0.7 + j * 0.2))} />
        </g>
      ))}
      {t > 1.5 && (
        <T x={395} y={49} s={11} f={C.caramel} o={k(1.5)}>
          business days
        </T>
      )}
      <Cell x={25} y={90} w={200} label="onboarding slide deck" o={k(1.7)} stroke={C.cherryText} />
      {t > 2.0 && (
        <T x={245} y={109} s={11} f={C.cherryText} o={k(2.0)}>
          years out of date
        </T>
      )}
      {[0, 1, 2].map((j) => (
        <g key={j}>
          {j > 0 && <line x1={40 + (j - 1) * 60} y1={184} x2={lerp(40 + (j - 1) * 60, 40 + j * 60, k(2.7 + j * 0.2))} y2={184} stroke={C.mocha} strokeWidth={1.5} />}
          <Pip x={40 + j * 60} y={184} s={14} f={j === 1 ? C.caramel : C.second} o={k(2.6 + j * 0.2)} />
        </g>
      ))}
      {t > 2.8 && (
        <T x={25} y={160} s={11} f={C.taupe} o={k(2.8)}>
          lineage, tagged
        </T>
      )}
      <Req x1={180} x2={350} y={184} k={easeInOut(seg(t, 3.0, 3.4))} f={C.focus} />
      <rect x={360} y={150} width={215} height={68} rx={6} fill="none" stroke={C.focus} strokeWidth={1.5} opacity={k(3.2)} />
      {[0, 1, 2].map((j) => (
        <line key={j} x1={372} y1={168 + j * 16} x2={lerp(372, 560, fresh(j))} y2={168 + j * 16} stroke={C.focus} strokeWidth={2} />
      ))}
      {t > 4.2 && (
        <T x={575} y={242} s={12} f={C.focus} a="end" o={k(4.2)}>
          built fresh, on demand
        </T>
      )}
    </Svg>
  );
}

// 1 · Predict. Data collected for one reason, and four principles. Once answered, purpose limitation lights and reaches the
// data; minimisation is marked as volume, storage limitation as time.
export function PredictWhichPrinciple({ t, answer }: StepCtx) {
  const s = useSinceAnswer(answer !== null);
  const v = answer !== null ? easeOut(seg(s, 0.1, 0.6)) : 0;
  const k = (d: number) => easeOut(seg(t, d, d + 0.3));
  const ps = ['minimisation', 'purpose limitation', 'storage limitation', 'accountability'];
  return (
    <Svg label="Reusing data for a new purpose — which principle actually governs it?" h={250}>
      <Cell x={25} y={94} w={160} label="one stated reason" o={k(0)} stroke={C.caramel} f={C.caramel} />
      {ps.map((p, i) => {
        const hit = i === 1;
        return (
          <Cell
            key={p}
            x={215}
            y={34 + i * 40}
            w={190}
            label={p}
            o={k(0.2 + i * 0.15) * (v > 0 && !hit ? 1 - 0.5 * v : 1)}
            stroke={hit && v > 0.5 ? C.focus : C.mocha}
            f={hit && v > 0.5 ? C.focus : C.crema}
          />
        );
      })}
      <Fan x1={190} y1={106} x2={210} y2={88} k={v} f={C.focus} />
      {v > 0.5 && (
        <g>
          <T x={420} y={53} s={11} f={C.taupe} o={v}>
            how much
          </T>
          <T x={420} y={133} s={11} f={C.taupe} o={v}>
            how long
          </T>
          <T x={420} y={93} s={11} f={C.focus} o={v}>
            if reuse is allowed
          </T>
        </g>
      )}
      <Verdict answer={answer} text="the reason it was collected" y={230} />
    </Svg>
  );
}

// 2 · A record arrives and is stored; the fraud_detection tag is stamped on it as it lands. A query for the same purpose
// passes the check. A query for marketing_campaign hits it and bounces, blocked.
export function PurposeTagEnforced({ t }: StepCtx) {
  const k = (d: number) => easeOut(seg(t, d, d + 0.35));
  const arrive = easeInOut(seg(t, 0.2, 0.8));
  const tag = easeOutBack(seg(t, 0.9, 1.3));
  const qa = easeInOut(seg(t, 2.0, 2.4));
  const qb = easeOut(seg(t, 3.0, 3.4));
  const bb = easeOut(seg(t, 3.4, 3.7));
  return (
    <Svg label="A purpose tag checked before a query runs, allowing a match and blocking a mismatch" h={250}>
      <Cell x={lerp(25, 300, arrive)} y={30} w={180} label="incoming record" o={k(0)} />
      {tag > 0 && <Cell x={300} y={lerp(48, 64, tag)} w={180} h={22} label="fraud_detection" o={clamp(tag)} stroke={C.caramel} f={C.caramel} />}
      {t > 1.4 && (
        <T x={25} y={80} s={11} f={C.caramel} o={k(1.4)}>
          written as it arrives
        </T>
      )}
      <Cell x={25} y={130} w={210} label="query: fraud_detection" o={k(1.8)} />
      <Req x1={240} x2={295} y={144} k={qa} f={C.focus} />
      <MiniTick x={305} y={142} k={k(2.4)} />
      {t > 2.5 && (
        <T x={325} y={149} s={12} f={C.focus} o={k(2.5)}>
          allowed
        </T>
      )}
      <Cell x={25} y={180} w={235} label="query: marketing_campaign" o={k(2.8)} />
      <Req x1={265} x2={295} y={194} k={qb} back={bb} f={C.cherryText} />
      <Cross x={315} y={194} k={k(3.6)} />
      {t > 3.7 && (
        <T x={335} y={199} s={12} f={C.cherryText} o={k(3.7)}>
          blocked, not flagged
        </T>
      )}
    </Svg>
  );
}

// 3 · A raw record's three fields ride up to the ingestion gate for marketing_consent. Email and consent_ts pass through
// into storage; phone, which that purpose never needs, falls away at the gate and is never stored.
export function MinimiseAtIngestion({ t }: StepCtx) {
  const k = (d: number) => easeOut(seg(t, d, d + 0.35));
  const toGate = easeInOut(seg(t, 0.4, 1.0));
  const through = easeInOut(seg(t, 1.4, 2.0));
  const fall = easeIn2(seg(t, 2.1, 2.6));
  const fields = ['email', 'phone', 'consent_ts'];
  return (
    <Svg label="A field with no use for the stated purpose, dropped before it is ever stored" h={250}>
      <T x={285} y={30} s={11} f={C.caramel} a="middle" o={k(0)}>
        purpose: marketing_consent
      </T>
      <line x1={285} y1={40} x2={285} y2={170} stroke={C.caramel} strokeWidth={2} strokeDasharray="5 4" opacity={k(0)} />
      <Hole x={405} y={40} w={170} h={130} o={k(0.1)} stroke={C.focus} />
      <T x={490} y={190} s={11} f={C.focus} a="middle" o={k(0.1)}>
        stored
      </T>
      {fields.map((f, i) => {
        const y = 50 + i * 40;
        const phone = i === 1;
        const x = lerp(25, 150, toGate) + (phone ? 0 : lerp(0, 270, through));
        if (phone && fall >= 1) return null;
        return <Cell key={f} x={x} y={phone ? lerp(y, 200, fall) : y} w={120} label={f} o={k(i * 0.1) * (phone ? 1 - fall : 1)} stroke={phone && t > 1.2 ? C.cherryText : C.mocha} />;
      })}
      {t > 2.6 && (
        <T x={150} y={232} s={12} f={C.cherryText} o={k(2.6)}>
          phone: never stored at all
        </T>
      )}
      {t > 3.3 && (
        <T x={575} y={212} s={11} f={C.focus} a="end" o={k(3.3)}>
          decided once, at ingestion
        </T>
      )}
    </Svg>
  );
}

// 4 · Three tagged records and today's date. The job's marker steps down them: r1, marketing_consent past its 30 days, is
// deleted; r2, fraud_detection inside its 365, stays; r3, ingested days ago, stays.
export function RetentionJobRuns({ t }: StepCtx) {
  const k = (d: number) => easeOut(seg(t, d, d + 0.35));
  const rows = [
    { id: 'r1', p: 'marketing_consent', d: '2026-01-01', w: '30 days', del: true },
    { id: 'r2', p: 'fraud_detection', d: '2026-01-01', w: '365 days', del: false },
    { id: 'r3', p: 'marketing_consent', d: '2026-10-20', w: '30 days', del: false },
  ];
  const pos = easeInOut(seg(t, 1.0, 3.2));
  return (
    <Svg label="A scheduled job checking each record's age against its own tagged retention window" h={250}>
      <T x={25} y={28} s={12} f={C.crema} o={k(0)}>
        today: 2026-10-31
      </T>
      <path d={`M8 ${lerp(62, 150, pos) - 6} l10 6 l-10 6 z`} fill={C.caramel} opacity={k(0.9)} />
      {rows.map((r, i) => {
        const y = 66 + i * 44;
        const when = 1.0 + i * 1.1;
        const done = t > when + 0.2;
        const gone = r.del ? easeOut(seg(t, when + 0.3, when + 0.7)) : 0;
        const o = k(0.2 + i * 0.15) * (1 - 0.65 * gone);
        return (
          <g key={r.id}>
            <T x={25} y={y} s={12} f={C.crema} o={o}>
              {r.id}
            </T>
            <T x={60} y={y} s={11} f={C.caramel} o={o}>
              {r.p}
            </T>
            <T x={210} y={y} s={11} f={C.taupe} o={o}>
              {r.d}
            </T>
            <T x={310} y={y} s={11} f={C.taupe} o={o}>
              {r.w}
            </T>
            {r.del ? <Cross x={410} y={y - 4} k={gone} /> : <MiniTick x={404} y={y - 6} k={done ? k(when + 0.2) : 0} />}
            {done && (
              <T x={430} y={y} s={12} f={r.del ? C.cherryText : C.focus} o={k(when + 0.3)}>
                {r.del ? 'deleted' : 'kept'}
              </T>
            )}
          </g>
        );
      })}
      {t > 3.8 && (
        <T x={25} y={222} s={12} f={C.crema} o={k(3.8)}>
          the policy states it; the job does it
        </T>
      )}
    </Svg>
  );
}

// 5 · Two lineage rows, each a job, the dataset it writes and that dataset's purpose tag. Down the right edge each feeds
// one row of the record of processing, which assembles itself and then refreshes: regenerated, not remembered.
export function RecordFromLineage({ t }: StepCtx) {
  const k = (d: number) => easeOut(seg(t, d, d + 0.35));
  const lin = [
    { job: 'ingest_signups', ds: 'signups', tag: 'marketing_consent', row: 'ingest_signups · contact_details · 30 days' },
    { job: 'score_fraud', ds: 'fraud_scores', tag: 'fraud_detection', row: 'score_fraud · behavioural · 365 days' },
  ];
  const redo = easeInOut(seg(t, 4.0, 4.6));
  return (
    <Svg label="A record of processing assembled automatically from the pipeline's own lineage and tags" h={250}>
      {lin.map((l, i) => {
        const y = 24 + i * 46;
        const d = 0.2 + i * 0.6;
        const ry = 156 + i * 32;
        const build = easeOut(seg(t, 2.2 + i * 0.6, 2.7 + i * 0.6));
        return (
          <g key={l.job}>
            <Cell x={25} y={y} w={140} label={l.job} o={k(d)} />
            <Req x1={170} x2={205} y={y + 14} k={k(d + 0.2)} />
            <Cell x={210} y={y} w={120} label={l.ds} o={k(d + 0.3)} />
            <Cell x={340} y={y + 3} w={160} h={22} label={l.tag} o={k(d + 0.45)} stroke={C.caramel} f={C.caramel} />
            <Fan x1={520 + i * 25} y1={y + 14} x2={520 + i * 25} y2={ry - 4} k={easeOut(seg(t, 1.8 + i * 0.6, 2.3 + i * 0.6))} f={C.focus} />
            {build > 0 && (
              <T x={lerp(60, 25, build)} y={ry} s={12} f={C.crema} o={build * (redo > 0 && redo < 1 ? 0.4 + 0.6 * Math.abs(1 - 2 * redo) : 1)}>
                {l.row}
              </T>
            )}
          </g>
        );
      })}
      {t > 1.8 && (
        <T x={25} y={132} s={11} f={C.focus} o={k(1.8)}>
          record of processing
        </T>
      )}
      {t > 4.2 && (
        <T x={25} y={238} s={12} f={C.focus} o={k(4.2)}>
          current, because it is regenerated
        </T>
      )}
    </Svg>
  );
}

// 6 · The three named triggers appear one by one; nothing else qualifies. A small-scale profiling project matches none:
// no DPIA. A large-scale one matches the first: required.
export function DpiaTriggers({ t }: StepCtx) {
  const k = (d: number) => easeOut(seg(t, d, d + 0.35));
  const trig = ['large-scale profiling, legal effect', 'large-scale special-category data', 'large-scale public monitoring'];
  const hit = easeOut(seg(t, 3.4, 3.9));
  return (
    <Svg label="The three specifically named categories that trigger a DPIA" h={250}>
      {trig.map((g, i) => (
        <Cell key={g} x={25} y={30 + i * 40} w={320} label={g} o={k(0.3 + i * 0.5)} stroke={i === 0 && hit > 0.5 ? C.focus : C.mocha} f={i === 0 && hit > 0.5 ? C.focus : C.crema} />
      ))}
      {t > 1.9 && (
        <T x={25} y={158} s={11} f={C.caramel} o={k(1.9)}>
          these three, nothing else
        </T>
      )}
      <Cell x={25} y={170} w={200} label="small-scale profiling" o={k(2.4)} />
      {t > 2.8 && (
        <T x={25} y={220} s={12} f={C.taupe} o={k(2.8)}>
          matches none: no DPIA
        </T>
      )}
      <Cell x={330} y={170} w={200} label="large-scale profiling" o={k(3.1)} stroke={hit > 0.5 ? C.focus : C.mocha} />
      <Fan x1={430} y1={166} x2={350} y2={50} k={hit} f={C.focus} />
      {t > 3.9 && (
        <T x={330} y={220} s={12} f={C.focus} o={k(3.9)}>
          DPIA required
        </T>
      )}
    </Svg>
  );
}

// 7 · A timeline. The breach happens and goes unnoticed; the clock only starts at awareness. The 72-hour window fills:
// notified at hour 48 is on time, at hour 96 late. Below, what has to exist before the clock: access logs and the record.
export function BreachClock({ t }: StepCtx) {
  const k = (d: number) => easeOut(seg(t, d, d + 0.35));
  const hx = (h: number) => 200 + h * 3.5;
  const fill = easeInOut(seg(t, 1.5, 2.5));
  return (
    <Svg label="The notification clock starting at awareness, and what has to already be ready" h={250}>
      <line x1={25} y1={100} x2={575} y2={100} stroke={C.mocha} strokeWidth={1.5} opacity={k(0)} />
      <Pip x={80} y={100} s={12} f={C.cherryText} o={k(0.3)} />
      <T x={80} y={84} s={11} f={C.cherryText} a="middle" o={k(0.3)}>
        breach
      </T>
      {t > 0.8 && (
        <T x={140} y={124} s={11} f={C.taupe} a="middle" o={k(0.8)}>
          unnoticed
        </T>
      )}
      <line x1={hx(0)} y1={78} x2={hx(0)} y2={112} stroke={C.focus} strokeWidth={2} opacity={k(1.2)} />
      <T x={hx(0)} y={70} s={11} f={C.focus} a="middle" o={k(1.2)}>
        aware: clock starts
      </T>
      <rect x={hx(0)} y={94} width={(hx(72) - hx(0)) * fill} height={12} rx={2} fill={C.second} opacity={fill > 0 ? 0.85 : 0} />
      <line x1={hx(72)} y1={86} x2={hx(72)} y2={114} stroke={C.caramel} strokeWidth={2} opacity={k(2.4)} />
      {t > 2.4 && (
        <T x={hx(72) + 6} y={84} s={11} f={C.caramel} o={k(2.4)}>
          72 hours
        </T>
      )}
      <MiniTick x={hx(48) - 6} y={124} k={k(2.8)} />
      {t > 2.9 && (
        <T x={hx(48)} y={150} s={11} f={C.focus} a="middle" o={k(2.9)}>
          hour 48: on time
        </T>
      )}
      <Cross x={hx(96)} y={100} k={k(3.2)} />
      {t > 3.3 && (
        <T x={575} y={150} s={11} f={C.cherryText} a="end" o={k(3.3)}>
          96: late
        </T>
      )}
      <Cell x={25} y={170} w={150} label="access logs" o={k(3.6)} stroke={C.focus} />
      <Cell x={25} y={206} w={150} label="Art. 30 record" o={k(3.8)} stroke={C.focus} />
      {t > 4.1 && (
        <T x={190} y={210} s={12} f={C.focus} o={k(4.1)}>
          ready before the clock starts
        </T>
      )}
    </Svg>
  );
}

// 8 · Recap. Six mechanisms in two rows; the tag, the retention job and the self-assembling record light in turn. All six
// rest on one base: law enforced by the pipeline itself.
export function Recap({ t }: StepCtx) {
  const k = (d: number) => easeOut(seg(t, d, d + 0.35));
  const ms = ['purpose tag', 'minimisation', 'retention job', 'the record', 'DPIA trigger', 'breach clock'];
  const lit = [1.8, 99, 2.3, 2.8, 99, 99];
  return (
    <Svg label="The three-part recap of this topic's point" h={250}>
      {ms.map((m, i) => {
        const x = 25 + (i % 3) * 190;
        const y = 40 + Math.floor(i / 3) * 50;
        const on = t > lit[i];
        return (
          <g key={m}>
            <Cell x={x} y={y} w={170} label={m} o={k(0.2 + i * 0.2)} stroke={on ? C.focus : C.mocha} f={on ? C.focus : C.crema} />
            {i >= 3 && <line x1={x + 85} y1={y + 30} x2={x + 85} y2={168} stroke={C.mocha} strokeWidth={1.5} opacity={k(3.2)} />}
          </g>
        );
      })}
      <Cell x={25} y={170} w={550} h={32} label="law enforced by the pipeline, not by memory" o={k(3.4)} stroke={C.focus} f={C.focus} />
    </Svg>
  );
}

// 9 · Prove it. Fraud-detection data and a marketing use, four principles between. Once answered, purpose limitation
// lights and the reuse is crossed; age and field count are beside the point.
export function ProveIt({ t, answer }: StepCtx) {
  const s = useSinceAnswer(answer !== null);
  const v = answer !== null ? easeOut(seg(s, 0.1, 0.6)) : 0;
  const k = (d: number) => easeOut(seg(t, d, d + 0.3));
  const ps = ['storage limitation', 'purpose limitation', 'accountability', 'minimisation'];
  return (
    <Svg label="Fraud-detection data reused for marketing, with no new tag — which principle breaks?" h={250}>
      <Cell x={25} y={94} w={160} label="fraud_detection" o={k(0)} stroke={C.caramel} f={C.caramel} />
      {ps.map((p, i) => {
        const hit = i === 1;
        return (
          <Cell
            key={p}
            x={215}
            y={34 + i * 40}
            w={190}
            label={p}
            o={k(0.2 + i * 0.15) * (v > 0 && !hit ? 1 - 0.5 * v : 1)}
            stroke={hit && v > 0.5 ? C.focus : C.mocha}
            f={hit && v > 0.5 ? C.focus : C.crema}
          />
        );
      })}
      <Cell x={445} y={94} w={130} label="marketing use" o={k(1.0)} />
      <Fan x1={190} y1={106} x2={210} y2={88} k={v} f={C.focus} />
      <Cross x={425} y={88} k={v} />
      {v > 0.5 && (
        <T x={215} y={208} s={11} f={C.taupe} o={v}>
          age, field count: beside the point
        </T>
      )}
      <Verdict answer={answer} text="purpose limitation" y={238} />
    </Svg>
  );
}

function easeIn2(x: number) {
  return x * x;
}
