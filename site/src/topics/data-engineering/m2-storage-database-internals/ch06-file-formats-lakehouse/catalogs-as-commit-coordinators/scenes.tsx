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

/** The catalog: a box with its name and, inside, the current pointer's version, `v`. */
function Catalog({ x, y, w = 170, v, k = 1, stroke = C.focus }: { x: number; y: number; w?: number; v?: string; k?: number; stroke?: string }) {
  return (
    <g opacity={k}>
      <rect x={x} y={y} width={w} height={60} rx={5} fill={C.cocoa} stroke={stroke} strokeWidth={1.8} />
      <T x={x + 12} y={y + 22} s={12} f={C.latte}>
        catalog
      </T>
      {v && (
        <T x={x + 12} y={y + 46} s={12} f={C.crema}>
          {v}
        </T>
      )}
    </g>
  );
}

/** A thin gate (an access-control check) at x, from y1 to y2, with a padlock on top. */
function Gate({ x, y1, y2, k }: { x: number; y1: number; y2: number; k: number }) {
  return (
    <g opacity={k}>
      <line x1={x} y1={y1} x2={x} y2={y2} stroke={C.second} strokeWidth={3} />
      <Lock x={x - 8} y={y1 - 16} k={1} />
    </g>
  );
}

// 1 · Hook. Iceberg and Delta, each with its pointer arrow; both arrows converge on one box: the catalog, where the pointer lives.
export function Hook({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.9, 1.6));
  return (
    <Svg label="both iceberg and delta commit by their own atomic pointer move. this topic names that pointer's home." h={200}>
      <Cell x={25} y={40} w={120} h={30} label="Iceberg" o={easeOut(seg(t, 0.1, 0.4))} />
      <Cell x={25} y={120} w={120} h={30} label="Delta" o={easeOut(seg(t, 0.4, 0.7))} />
      <Req x1={147} x2={lerp(147, 338, a)} y={55} k={a > 0 ? 1 : 0} f={C.second} />
      <Req x1={147} x2={lerp(147, 338, a)} y={135} k={a > 0 ? 1 : 0} f={C.second} />
      <Catalog x={340} y={65} v="the pointer" k={easeOut(seg(t, 1.8, 2.3))} />
      <T x={340} y={175} s={12} f={C.focus} o={easeOut(seg(t, 2.8, 3.2))}>
        built right here
      </T>
    </Svg>
  );
}

// 2 · Predict. The catalog with its pointer, and three dashed empty slots beside it: is there more?
export function PredictCatalogJob({ t, answer }: StepCtx) {
  return (
    <Svg label="a catalog tracks the current-metadata pointer. is that the whole job, or does it do more?" h={200}>
      <Catalog x={25} y={20} v="→ v0.json" k={easeOut(seg(t, 0.1, 0.5))} />
      {[0, 1, 2].map((i) => (
        <g key={i} opacity={easeOut(seg(t, 1.0 + i * 0.3, 1.3 + i * 0.3))}>
          <rect x={220 + i * 115} y={30} width={100} height={40} rx={4} fill="none" stroke={C.mocha} strokeDasharray="4 3" />
          <T x={270 + i * 115} y={56} s={14} f={C.latte} a="middle">
            ?
          </T>
        </g>
      ))}
      <AnswerRow y={130} label="a catalog's job" answer={answer} value="more than the pointer" k={easeOut(seg(t, 2.2, 2.7))} />
      <Verdict answer={answer} y={180} text="who changes it, who reads it, where it lives" />
    </Svg>
  );
}

// 3 · Four jobs, built one at a time: four cards in a two by two grid, each with its own small mark.
export function RevealFourJobs({ t }: StepCtx) {
  const jobs: [string, string][] = [
    ['namespaces', 'analytics.events'],
    ['the pointer', 'compare-and-swap'],
    ['access control', 'who may change it'],
    ['credentials', 'who may read files'],
  ];
  return (
    <Svg label="four real jobs: namespace, the pointer by compare-and-swap, access control, credential issuance." h={250}>
      {jobs.map(([a, b], i) => {
        const k = easeOut(seg(t, 0.3 + i * 0.8, 0.8 + i * 0.8));
        const x = 25 + (i % 2) * 280;
        const y = 20 + Math.floor(i / 2) * 110;
        return (
          <g key={a} opacity={k} transform={`translate(0 ${((1 - k) * 10).toFixed(2)})`}>
            <rect x={x} y={y} width={265} height={90} rx={5} fill={C.cocoa} stroke={i === 1 ? C.focus : C.mocha} strokeWidth={1.6} />
            <T x={x + 14} y={y + 34} s={14} f={C.crema}>
              {a}
            </T>
            <T x={x + 14} y={y + 66} s={11} f={C.latte}>
              {b}
            </T>
            {i === 2 && <Lock x={x + 230} y={y + 20} k={1} />}
            {i === 3 && <rect x={x + 228} y={y + 18} width={22} height={14} rx={2} fill="none" stroke={C.second} strokeWidth={2} />}
            {i === 1 && <path d={`M${x + 222} ${y + 26} h24 l-6 -5 m6 5 l-6 5`} fill="none" stroke={C.focus} strokeWidth={2} />}
            {i === 0 && [0, 1, 2].map((j) => <circle key={j} cx={x + 226 + j * 10} cy={y + 26} r={3} fill={C.latte} />)}
          </g>
        );
      })}
    </Svg>
  );
}

// 4 · The CAS race, for real. The table registered at v0; engines A and B both write for v1; A lands, B bounces with a conflict and
// retries to v2.
export function RevealCasRace({ t }: StepCtx) {
  const a = easeInOut(seg(t, 1.0, 1.8));
  const b = easeInOut(seg(t, 1.0, 1.9));
  const bounce = easeOut(seg(t, 1.9, 2.4));
  const r = easeInOut(seg(t, 3.0, 3.8));
  return (
    <Svg label="a real table, registered. two engines race for the pointer's next version, for real." h={230}>
      <Cell x={25} y={40} w={110} h={30} label="engine A" o={easeOut(seg(t, 0.5, 0.8))} />
      <Cell x={25} y={140} w={110} h={30} label="engine B" o={easeOut(seg(t, 0.5, 0.8))} />
      <Cell x={400} y={20} w={150} h={30} label="v0 · registered" o={easeOut(seg(t, 0.1, 0.4))} />
      <Cell x={400} y={90} w={150} h={30} label="v1 · A wins" stroke={C.focus} o={easeOut(seg(t, 1.8, 2.1))} />
      <Cell x={400} y={160} w={150} h={30} label="v2 · B, retried" stroke={C.second} o={easeOut(seg(t, 3.8, 4.1))} />
      <Req x1={137} x2={395} y={55} k={a} label="put v1" f={C.focus} />
      {r === 0 && <Req x1={137} x2={395} y={155} k={b} label="put v1" back={bounce} f={C.latte} />}
      {bounce > 0 && r === 0 && <Cross x={300} y={130} k={bounce} />}
      <T x={160} y={205} s={11} f={C.cherryText} o={bounce > 0 && r === 0 ? bounce : 0}>
        conflict: re-read, retry
      </T>
      {r > 0 && <Req x1={137} x2={395} y={175} k={r} label="put v2" f={C.second} />}
    </Svg>
  );
}

// 5 · Predict. untrusted-script's request heads for the pointer; a gate stands before the CAS: where is it stopped?
export function PredictAccessBeforeCas({ t, answer }: StepCtx) {
  return (
    <Svg label="should an unauthorized caller's request even reach the compare-and-swap?" h={200}>
      <Cell x={25} y={40} w={150} h={30} label="untrusted-script" stroke={C.cherryText} o={easeOut(seg(t, 0.1, 0.4))} />
      <Gate x={300} y1={30} y2={80} k={easeOut(seg(t, 0.6, 1.0))} />
      <Cell x={420} y={40} w={130} h={30} label="the CAS" o={easeOut(seg(t, 0.8, 1.1))} />
      <Req x1={177} x2={290} y={55} k={easeInOut(seg(t, 1.3, 2.1))} f={C.latte} />
      <AnswerRow y={135} label="it is stopped at" answer={answer} value="access control" k={easeOut(seg(t, 2.4, 2.9))} />
      <Verdict answer={answer} y={180} text="the attempt never begins" />
    </Svg>
  );
}

// 6 · Access control, for real. The request hits the gate and bounces; the CAS box stays untouched; the ACL holds table-owner only.
export function RevealAccessControlReal({ t }: StepCtx) {
  const go = easeInOut(seg(t, 0.6, 1.4));
  const bounce = easeOut(seg(t, 1.4, 2.0));
  return (
    <Svg label="no -- rejected for real, before the compare-and-swap is ever attempted." h={230}>
      <Cell x={25} y={40} w={150} h={30} label="untrusted-script" stroke={C.cherryText} o={easeOut(seg(t, 0.1, 0.4))} />
      <Gate x={300} y1={30} y2={80} k={1} />
      <Cell x={420} y={40} w={130} h={30} label="the CAS" o={0.5} />
      <Req x1={177} x2={290} y={55} k={go} back={bounce} f={C.latte} />
      <Cross x={290} y={100} k={bounce} />
      <T x={25} y={130} s={12} f={C.cherryText} o={easeOut(seg(t, 1.8, 2.2))}>
        PermissionError: no access
      </T>
      <T x={420} y={100} s={11} f={C.latte} o={easeOut(seg(t, 2.4, 2.8))}>
        never attempted
      </T>
      <Row y={190} label="access list" value="table-owner" valueColor={C.second} k={easeOut(seg(t, 3.0, 3.4))} />
    </Svg>
  );
}

// 7 · Credential issuance. reporting-job asks and a credential card slides out (scope, a 900-second bar that starts to drain);
// untrusted-script asks and gets a cross.
export function RevealCredentialIssuance({ t }: StepCtx) {
  const c = easeOut(seg(t, 1.0, 1.6));
  const ttl = 1 - 0.25 * easeInOut(seg(t, 2.6, 4.6));
  return (
    <Svg label="a real scoped, time-limited credential, naming exactly one table's own prefix, issued only to a real principal." h={230}>
      <Cell x={25} y={20} w={150} h={30} label="reporting-job" stroke={C.focus} o={easeOut(seg(t, 0.1, 0.4))} />
      <g opacity={c} transform={`translate(${((1 - c) * -30).toFixed(2)} 0)`}>
        <rect x={210} y={14} width={350} height={100} rx={5} fill={C.cocoa} stroke={C.focus} strokeWidth={1.6} />
        <T x={224} y={42} s={12} f={C.crema}>
          s3://lakehouse/analytics/events/*
        </T>
        <T x={224} y={72} s={11} f={C.latte}>
          expires in 900 s
        </T>
        <rect x={224} y={86} width={320 * ttl} height={8} fill={C.second} />
      </g>
      <T x={210} y={140} s={11} f={C.latte} o={easeOut(seg(t, 1.8, 2.2))}>
        one table's prefix, nothing broader
      </T>
      <Cell x={25} y={170} w={150} h={30} label="untrusted-script" stroke={C.cherryText} o={easeOut(seg(t, 3.0, 3.3))} />
      <Cross x={200} y={185} k={easeOut(seg(t, 3.4, 3.7))} />
      <T x={225} y={190} s={12} f={C.cherryText} o={easeOut(seg(t, 3.5, 3.9))}>
        no credential issued
      </T>
    </Svg>
  );
}

// 8 · The legacy options. Hive Metastore: a token that reaches the metastore and stops short of storage; Glue: a Lake Formation box
// bolted on; JDBC: one CAS row.
export function RevealLegacyOptions({ t }: StepCtx) {
  const h = easeOut(seg(t, 0.2, 0.6));
  const tok = easeInOut(seg(t, 0.8, 1.6));
  const g = easeOut(seg(t, 2.2, 2.6));
  const lf = easeOut(seg(t, 2.8, 3.3));
  const j = easeOut(seg(t, 3.6, 4.0));
  return (
    <Svg label="the legacy options, named with their real limits: hive metastore, glue data catalog, a jdbc catalog." h={250}>
      <Cell x={25} y={20} w={150} h={30} label="Hive Metastore" o={h} />
      <Req x1={177} x2={300} y={35} k={tok} label="token" f={C.second} />
      <Cell x={305} y={20} w={90} h={30} label="metastore" stroke={C.second} o={tok > 0.9 ? 1 : 0} />
      <Cell x={450} y={20} w={100} h={30} label="storage" o={0.5 * h} />
      <Cross x={423} y={35} k={easeOut(seg(t, 1.6, 2.0))} />
      <Cell x={25} y={100} w={150} h={30} label="Glue" o={g} />
      <Cell x={lerp(260, 185, lf)} y={100} w={160} h={30} label="+ Lake Formation" stroke={C.second} o={lf} />
      <T x={360} y={120} s={11} f={C.latte} o={easeOut(seg(t, 3.2, 3.6))}>
        bolted on for access
      </T>
      <Cell x={25} y={180} w={150} h={30} label="JDBC catalog" o={j} />
      <rect x={200} y={182} width={240} height={26} fill="none" stroke={C.focus} strokeWidth={1.4} opacity={easeOut(seg(t, 3.9, 4.3))} />
      <T x={210} y={200} s={11} f={C.crema} o={easeOut(seg(t, 3.9, 4.3))}>
        one row: table → pointer
      </T>
    </Svg>
  );
}

// 9 · Three limits, each with its own mark: an engine padlock, a missing credential, one region lit among dim ones.
export function RevealMultiCloudLimits({ t }: StepCtx) {
  const lims = ['lock-in to one engine', 'no credentials, unless bolted on', 'one account, one region'];
  return (
    <Svg label="why this matters for a multi-engine, multi-cloud estate: three real, named limits." h={250}>
      {lims.map((l, i) => {
        const k = easeOut(seg(t, 0.3 + i * 1.1, 0.8 + i * 1.1));
        const y = 50 + i * 70;
        return (
          <g key={l} opacity={k}>
            <circle cx={36} cy={y - 5} r={5} fill={C.cherryText} />
            <T x={55} y={y} s={14} f={C.crema}>
              {l}
            </T>
          </g>
        );
      })}
      <Lock x={480} y={38} k={easeOut(seg(t, 0.8, 1.1))} f={C.cherryText} />
      <g opacity={easeOut(seg(t, 1.9, 2.2))}>
        <rect x={476} y={102} width={24} height={14} rx={2} fill="none" stroke={C.mocha} strokeWidth={2} strokeDasharray="3 3" />
      </g>
      {[0, 1, 2, 3].map((i) => (
        <circle key={i} cx={470 + i * 20} cy={185} r={6} fill={i === 0 ? C.cherryText : C.mocha} opacity={easeOut(seg(t, 3.0 + i * 0.1, 3.3 + i * 0.1)) * (i === 0 ? 1 : 0.5)} />
      ))}
    </Svg>
  );
}

// 10 · Recap. The four jobs ticked, one by one.
export function Recap({ t }: StepCtx) {
  const rows = ['namespaces', 'pointer, by CAS', 'access control', 'credentials'];
  return (
    <Svg label="a minimal catalog, for real, doing all four jobs. next: a real, vendor-neutral protocol for one." h={250}>
      {rows.map((r, i) => (
        <g key={r}>
          <T x={25} y={40 + i * 50} s={15} f={C.crema} o={easeOut(seg(t, 0.2 + i * 0.6, 0.6 + i * 0.6))}>
            {r}
          </T>
          <MiniTick x={540} y={34 + i * 50} k={easeOut(seg(t, 0.5 + i * 0.6, 0.9 + i * 0.6))} />
        </g>
      ))}
    </Svg>
  );
}
