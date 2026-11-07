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

/** An empty dashed slot. */
function Hole({ x, y, w, h = 28, o = 1, stroke = C.mocha }: { x: number; y: number; w: number; h?: number; o?: number; stroke?: string }) {
  return <rect x={x} y={y} width={w} height={h} rx={4} fill="none" stroke={stroke} strokeWidth={1.5} strokeDasharray="4 3" opacity={o} />;
}

/** A pip travelling from (x1, y1) to (x2, y2) while 0 < p < 1. */
function Pip({ x1, y1, x2, y2, p, f = C.latte }: { x1: number; y1: number; x2: number; y2: number; p: number; f?: string }) {
  if (p <= 0 || p >= 1) return null;
  return <rect x={lerp(x1, x2, p) - 6} y={lerp(y1, y2, p) - 6} width={12} height={12} rx={2} fill={f} />;
}

/** The two sources, CRM above and ERP below, on the left; `lock` draws a padlock on each: still authoritative. */
function Sources({ t, lock = 0, crm = 'CRM', erp = 'ERP', stroke = C.mocha }: { t: number; lock?: number; crm?: string; erp?: string; stroke?: string }) {
  return (
    <g>
      <Cell x={25} y={40} w={150} label={crm} o={easeOut(seg(t, 0, 0.3))} stroke={stroke} />
      <Cell x={25} y={120} w={150} label={erp} o={easeOut(seg(t, 0.1, 0.4))} stroke={stroke} />
      <Lock x={5} y={52} k={lock} />
      <Lock x={5} y={132} k={lock} />
    </g>
  );
}

/** A line between a source's right edge and the hub's left edge, drawn by `k`. */
function Link({ y1, y2, k, dashed = false, f = C.mocha }: { y1: number; y2: number; k: number; dashed?: boolean; f?: string }) {
  return <line x1={175} y1={y1} x2={lerp(175, 370, k)} y2={lerp(y1, y2, k)} stroke={f} strokeWidth={1.5} strokeDasharray={dashed ? '4 3' : undefined} />;
}

// 0 · Hook. The same customer in the CRM and the ERP, each with its own key and limit; both flow into the report, which
// counts two customers, the second in cherry.
export function Hook({ t }: StepCtx) {
  const a = easeInOut(seg(t, 1.0, 1.7));
  const b = easeInOut(seg(t, 1.6, 2.3));
  return (
    <Svg label="a customer exists in the CRM with one key and credit limit, and in the ERP with a different key and credit limit, and a report double-counts it." h={200}>
      <Sources t={t} crm="CRM: Acme Co" erp="ERP: ACME Corp" />
      <T x={25} y={88} s={11} f={C.latte} o={easeOut(seg(t, 0.4, 0.7))}>
        own key, own limit
      </T>
      <T x={25} y={168} s={11} f={C.latte} o={easeOut(seg(t, 0.5, 0.8))}>
        own key, own limit
      </T>
      <Link y1={54} y2={84} k={easeOut(seg(t, 0.7, 1.0))} />
      <Link y1={134} y2={104} k={easeOut(seg(t, 0.7, 1.0))} />
      <Pip x1={185} y1={56} x2={360} y2={84} p={a} />
      <Pip x1={185} y1={132} x2={360} y2={104} p={b} f={C.cherryText} />
      <rect x={380} y={66} width={170} height={56} rx={6} fill="none" stroke={C.mocha} strokeWidth={1.5} opacity={easeOut(seg(t, 0.6, 0.9))} />
      <T x={392} y={60} s={11} f={C.latte} o={easeOut(seg(t, 0.6, 0.9))}>
        report: customers
      </T>
      <rect x={400} y={86} width={16} height={16} rx={2} fill={C.latte} opacity={a >= 1 ? 1 : 0} />
      <rect x={426} y={86} width={16} height={16} rx={2} fill={C.cherryText} opacity={b >= 1 ? 1 : 0} />
      <T x={300} y={192} s={12} f={C.crema} a="middle" o={easeOut(seg(t, 3.0, 3.5))}>
        one customer, counted twice
      </T>
    </Svg>
  );
}

// 1 · Predict. The two sources; a dashed layer outside them. On answer, lines reach the layer and both sources lock:
// fixed outside, neither touched.
export function Predict({ t, answer }: StepCtx) {
  const s = useSinceAnswer(answer !== null);
  const v = answer !== null ? easeOut(seg(s, 0.2, 0.8)) : 0;
  return (
    <Svg label="does fixing a duplicate like this always mean rewriting the CRM's or the ERP's own data, or can a style fix it without touching either source?" h={200}>
      <Sources t={t} lock={v} />
      <Hole x={380} y={80} w={170} o={easeOut(seg(t, 0.4, 0.7))} stroke={v > 0 ? C.focus : C.mocha} />
      <T x={465} y={99} s={11} f={C.latte} a="middle" o={easeOut(seg(t, 0.4, 0.7))}>
        a layer outside?
      </T>
      <Link y1={54} y2={88} k={v} f={C.focus} />
      <Link y1={134} y2={100} k={v} f={C.focus} />
      <AnswerRow y={185} label="must rewrite?" answer={answer} value="no, fix outside" k={easeOut(seg(t, 1.6, 2.2))} />
    </Svg>
  );
}

// 2 · Registry. Dashed key-only lines to a registry that pairs the two keys; a dashed empty slot beside it: no master
// copy. Both sources lock: still authoritative.
export function RevealRegistry({ t }: StepCtx) {
  return (
    <Svg label="a registry cross-references keys across sources without changing them; no master copy exists anywhere, and sources stay authoritative." h={200}>
      <Sources t={t} crm="CRM: key A" erp="ERP: key B" lock={easeOut(seg(t, 3.4, 3.8))} />
      <Link y1={54} y2={88} k={easeOut(seg(t, 0.5, 1.1))} dashed />
      <Link y1={134} y2={100} k={easeOut(seg(t, 0.7, 1.3))} dashed />
      <Cell x={380} y={80} w={170} label="registry: A = B" o={easeOut(seg(t, 1.2, 1.6))} stroke={C.focus} />
      <Hole x={380} y={140} w={170} o={easeOut(seg(t, 2.2, 2.6))} />
      <T x={465} y={159} s={11} f={C.latte} a="middle" o={easeOut(seg(t, 2.2, 2.6))}>
        no master copy
      </T>
      <T x={380} y={50} s={11} f={C.latte} o={easeOut(seg(t, 1.6, 2.0))}>
        keys only, no data
      </T>
      <T x={25} y={190} s={11} f={C.second} o={easeOut(seg(t, 3.6, 4.0))}>
        both sources stay authoritative
      </T>
    </Svg>
  );
}

// 3 · Consolidation. Records flow from both sources into a golden copy, which feeds reports; an arrow back toward the
// sources is struck: nothing written back.
export function RevealConsolidation({ t }: StepCtx) {
  const flow = seg(t, 0.6, 1.6);
  return (
    <Svg label="consolidation assembles a golden copy from the sources for reporting; the sources stay authoritative, and nothing is written back to them." h={200}>
      <Sources t={t} lock={easeOut(seg(t, 3.6, 4.0))} />
      <Link y1={54} y2={88} k={easeOut(seg(t, 0.3, 0.6))} />
      <Link y1={134} y2={100} k={easeOut(seg(t, 0.3, 0.6))} />
      <Pip x1={185} y1={56} x2={360} y2={86} p={flow} />
      <Pip x1={185} y1={132} x2={360} y2={102} p={clamp(flow * 1.2 - 0.2, 0, 1)} />
      <Cell x={380} y={80} w={170} label="golden copy" o={easeOut(seg(t, 1.4, 1.8))} stroke={C.focus} />
      <Cell x={380} y={150} w={170} label="reports" o={easeOut(seg(t, 2.0, 2.3))} />
      <line x1={465} y1={110} x2={465} y2={lerp(110, 148, easeOut(seg(t, 1.9, 2.2)))} stroke={C.mocha} strokeWidth={1.5} />
      <Cross x={278} y={30} k={easeOut(seg(t, 3.0, 3.3))} />
      <T x={296} y={34} s={11} f={C.cherryText} o={easeOut(seg(t, 2.8, 3.1))}>
        nothing written back
      </T>
    </Svg>
  );
}

// 4 · Coexistence. A master copy in the middle; pips run both ways along each link; each source still takes its own
// write.
export function RevealCoexistence({ t }: StepCtx) {
  const up = seg(t, 1.2, 2.0);
  const dn = seg(t, 2.2, 3.0);
  return (
    <Svg label="coexistence keeps a master copy that is also synchronised back to the sources, which stay writable on their own." h={200}>
      <Sources t={t} />
      <Link y1={54} y2={88} k={easeOut(seg(t, 0.3, 0.6))} />
      <Link y1={134} y2={100} k={easeOut(seg(t, 0.3, 0.6))} />
      <Cell x={380} y={80} w={170} label="master copy" o={easeOut(seg(t, 0.5, 0.9))} stroke={C.focus} />
      <Pip x1={185} y1={56} x2={360} y2={86} p={up} />
      <Pip x1={185} y1={132} x2={360} y2={102} p={up} />
      <Pip x1={360} y1={86} x2={185} y2={56} p={dn} f={C.second} />
      <Pip x1={360} y1={102} x2={185} y2={132} p={dn} f={C.second} />
      <T x={278} y={160} s={11} f={C.second} a="middle" o={easeOut(seg(t, 2.6, 3.0))}>
        synced both ways
      </T>
      <T x={25} y={190} s={11} f={C.latte} o={easeOut(seg(t, 3.4, 3.8))}>
        each source still writes on its own
      </T>
      <MiniTick x={180} y={28} k={easeOut(seg(t, 3.6, 4.0))} />
      <MiniTick x={180} y={108} k={easeOut(seg(t, 3.7, 4.1))} />
    </Svg>
  );
}

// 5 · Centralised. The hub is the only writer; pips flow out to both sources; their own write slots are struck. A
// control bar grows as the sources' freedom bar shrinks.
export function RevealCentralized({ t }: StepCtx) {
  const out = seg(t, 1.0, 1.8);
  const strike = easeOut(seg(t, 2.0, 2.4));
  const trade = easeInOut(seg(t, 3.0, 4.0));
  return (
    <Svg label="a centralised, transactional hub is the only place master data is created or changed; sources consume it rather than write it." h={200}>
      <Sources t={t} />
      <Cross x={160} y={54} k={strike} />
      <Cross x={160} y={134} k={strike} />
      <Link y1={54} y2={88} k={easeOut(seg(t, 0.3, 0.6))} />
      <Link y1={134} y2={100} k={easeOut(seg(t, 0.3, 0.6))} />
      <Cell x={380} y={80} w={170} label="hub: only writer" o={easeOut(seg(t, 0.4, 0.8))} stroke={C.focus} />
      <Pip x1={360} y1={86} x2={185} y2={56} p={out} f={C.focus} />
      <Pip x1={360} y1={102} x2={185} y2={132} p={out} f={C.focus} />
      <T x={25} y={176} s={11} f={C.latte} o={easeOut(seg(t, 2.8, 3.1))}>
        hub control
      </T>
      <rect x={130} y={167} width={lerp(60, 220, trade)} height={10} rx={2} fill={C.focus} opacity={easeOut(seg(t, 2.8, 3.1))} />
      <T x={25} y={196} s={11} f={C.latte} o={easeOut(seg(t, 2.9, 3.2))}>
        source freedom
      </T>
      <rect x={130} y={187} width={lerp(220, 40, trade)} height={10} rx={2} fill={C.second} opacity={easeOut(seg(t, 2.9, 3.2))} />
    </Svg>
  );
}

// 6 · Match and merge. A record pip runs along the four stages; at merge, one it can't resolve drops into the steward's
// queue.
export function RevealMatchMerge({ t }: StepCtx) {
  const stages = ['standardise', 'match', 'merge', 'publish'];
  const run = seg(t, 1.2, 3.0);
  const drop = easeInOut(seg(t, 3.0, 3.6));
  return (
    <Svg label="standardise, match, merge by survivorship, publish — and whatever the rules can't resolve waits in a steward's own queue." h={220}>
      <line x1={25} y1={30} x2={lerp(25, 541, easeOut(seg(t, 0.8, 1.2)))} y2={30} stroke={C.mocha} strokeWidth={1.2} />
      {stages.map((s, i) => (
        <Cell key={s} x={25 + i * 132} y={44} w={120} label={s} o={easeOut(seg(t, 0.1 + i * 0.2, 0.4 + i * 0.2))} stroke={run * 4 > i + 0.5 ? C.focus : C.mocha} />
      ))}
      <Pip x1={40} y1={30} x2={530} y2={30} p={run} f={C.focus} />
      {drop > 0 && drop < 1 && <rect x={343} y={lerp(76, 124, drop)} width={12} height={12} rx={2} fill={C.cherryText} />}
      <Cell x={274} y={136} w={150} label="steward queue" o={easeOut(seg(t, 2.8, 3.1))} stroke={drop >= 1 ? C.cherryText : C.mocha} />
      <T x={25} y={110} s={11} f={C.latte} o={easeOut(seg(t, 2.2, 2.6))}>
        merge: a fixed rule per field
      </T>
      <T x={25} y={200} s={11} f={C.latte} o={easeOut(seg(t, 3.8, 4.2))}>
        what the rule can't decide, a person resolves
      </T>
    </Svg>
  );
}

// 7 · Across ERP and CRM. Customer, product and plant each sit in both systems; a link draws between each pair, and the
// style decides what kind of agreement the link is.
export function RevealAcrossErpCrm({ t }: StepCtx) {
  const rows = ['customer', 'product', 'plant'];
  return (
    <Svg label="the same customer, product or plant can sit in an ERP and a CRM at once; each style gives that pair a different kind of consistency." h={200}>
      {rows.map((r, i) => {
        const y = 24 + i * 46;
        const k = easeOut(seg(t, 0.3 + i * 0.6, 0.7 + i * 0.6));
        const l = easeOut(seg(t, 2.4 + i * 0.3, 2.9 + i * 0.3));
        return (
          <g key={r}>
            <T x={25} y={y + 19} s={12} f={C.crema} o={k}>
              {r}
            </T>
            <Cell x={130} y={y} w={110} label="ERP" o={k} />
            <Cell x={440} y={y} w={110} label="CRM" o={k} />
            <line x1={240} y1={y + 14} x2={lerp(240, 440, l)} y2={y + 14} stroke={C.focus} strokeWidth={1.5} strokeDasharray={i === 0 ? '4 3' : i === 1 ? '10 4' : undefined} />
          </g>
        );
      })}
      <T x={300} y={185} s={12} f={C.latte} a="middle" o={easeOut(seg(t, 3.6, 4.1))}>
        the style decides how each pair agrees
      </T>
    </Svg>
  );
}

// 8 · Recap. Five lines, one by one; the shared question outlined.
export function Recap({ t }: StepCtx) {
  const rows = [
    'registry: cross-reference the keys',
    'consolidation: a golden copy for reports',
    'coexistence: a master synced both ways',
    'centralised: one hub writes, all read',
    'who writes, and where the master lives',
  ];
  return (
    <Svg label="registry, consolidation, coexistence, centralised — four answers to who writes and where the master lives, plus the pipeline that builds one." h={260}>
      {rows.map((r, i) => {
        const k = easeOut(seg(t, 0.2 + i * 0.75, 0.6 + i * 0.75));
        return <Cell key={i} x={25} y={lerp(20, 28, k) + i * 46} w={530} label={r} o={k} stroke={i === 4 ? C.focus : C.mocha} />;
      })}
    </Svg>
  );
}

// 9 · Prove it. Three order systems each keep writing; a dashed list waits on the right. On answer, it fills as the
// consolidated golden list.
export function ProveIt({ t, answer }: StepCtx) {
  const s = useSinceAnswer(answer !== null);
  const v = answer !== null ? easeOut(seg(s, 0.2, 0.8)) : 0;
  return (
    <Svg
      label="a company wants every order system to keep writing its own orders, with no single new system of record, but still wants one queryable, de-duplicated customer list for reporting. Which style fits?"
      h={200}
    >
      {[0, 1, 2].map((i) => (
        <g key={i}>
          <Cell x={25} y={20 + i * 40} w={150} label="order system" o={easeOut(seg(t, i * 0.15, 0.3 + i * 0.15))} />
          <MiniTick x={185} y={32 + i * 40} k={easeOut(seg(t, 0.5 + i * 0.1, 0.8 + i * 0.1))} />
        </g>
      ))}
      {v > 0 ? (
        <Cell x={380} y={60} w={170} label="golden list" o={v} stroke={C.focus} />
      ) : (
        <g opacity={easeOut(seg(t, 0.8, 1.1))}>
          <Hole x={380} y={60} w={170} />
          <T x={465} y={79} s={11} f={C.latte} a="middle">
            one clean list?
          </T>
        </g>
      )}
      <AnswerRow y={178} label="the style" answer={answer} value="consolidation" k={easeOut(seg(t, 1.6, 2.2))} />
    </Svg>
  );
}
