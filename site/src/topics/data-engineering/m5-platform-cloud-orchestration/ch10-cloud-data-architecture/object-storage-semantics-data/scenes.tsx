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

/** The tall key box both clients write into, with its current contents centred. */
function KeyBox({ label, body, o = 1, stroke = C.mocha, f = C.crema }: { label: string; body?: string; o?: number; stroke?: string; f?: string }) {
  return (
    <g opacity={o}>
      <T x={400} y={32} s={11} f={C.latte}>
        {label}
      </T>
      <rect x={400} y={40} width={175} height={138} rx={6} fill={C.cocoa} stroke={stroke} strokeWidth={1.5} />
      {body && (
        <T x={487} y={114} s={13} f={f} a="middle">
          {body}
        </T>
      )}
    </g>
  );
}

// 0 · Hook. Both clients ask whether the key exists, both hear "absent", both PUT and both get a 200. The key holds A's
// commit for a moment; then B's commit replaces it and A's slides away with no error to anyone.
export function TwoWritersOneKey({ t }: StepCtx) {
  const c = easeOut(seg(t, 0, 0.3));
  const ask = (d: number) => easeInOut(seg(t, 0.3 + d, 0.8 + d));
  const put = (d: number) => easeInOut(seg(t, 1.3 + d, 1.8 + d));
  const aIn = t > 1.8 && t < 2.5;
  const bIn = t >= 2.5;
  const gone = easeOut(seg(t, 2.5, 3.0));
  return (
    <Svg label="Two clients both check a key, both find it absent, and both write it; the second write silently overwrites the first" h={250}>
      <Cell x={25} y={40} w={130} label="Client A" o={c} />
      <Cell x={25} y={150} w={130} label="Client B" o={c} />
      <KeyBox label="naive/commit-log" o={c} body={aIn ? "A's commit" : bIn ? "B's commit" : undefined} f={bIn ? C.caramel : C.crema} />
      {t < 1.3 ? (
        <>
          <Req x1={160} x2={395} y={54} k={ask(0)} label={t > 0.9 ? 'exists? absent' : 'exists?'} />
          <Req x1={160} x2={395} y={164} k={ask(0.1)} label={t > 1.0 ? 'exists? absent' : 'exists?'} />
        </>
      ) : (
        <>
          <Req x1={160} x2={395} y={54} k={put(0)} label={t > 1.8 ? 'PUT, 200' : 'PUT'} />
          <Req x1={160} x2={395} y={164} k={put(0.7)} label={t > 2.5 ? 'PUT, 200' : 'PUT'} />
        </>
      )}
      {bIn && (
        <T x={487} y={lerp(96, 70, gone)} s={12} f={C.cherryText} a="middle" o={1 - 0.4 * gone}>
          A's commit: gone
        </T>
      )}
      {t > 3.1 && (
        <T x={300} y={225} s={12} f={C.latte} a="middle" o={easeOut(seg(t, 3.1, 3.5))}>
          no error reached either client
        </T>
      )}
    </Svg>
  );
}

// 1 · Predict. The first writer's PUT has landed; the second writer's arrow is on its way, carrying a question mark.
// Once answered, a precondition badge clips onto it and the store answers 412; the key keeps the first writer.
export function WhichGuaranteeCloses({ t, answer }: StepCtx) {
  const s = useSinceAnswer(answer !== null);
  const v = answer !== null ? easeOut(seg(s, 0.1, 0.6)) : 0;
  const k = easeInOut(seg(t, 0.1, 0.7));
  const k2 = easeInOut(seg(t, 0.5, 1.1));
  return (
    <Svg label="A precondition badge attaches to the second write and it flips from succeeding to a rejected precondition, with the first write staying intact" h={250}>
      <Cell x={25} y={40} w={130} label="first writer" />
      <Cell x={25} y={150} w={130} label="second writer" />
      <KeyBox label="cas/commit-log-entry-1" body={k >= 1 ? 'first writer' : undefined} stroke={v > 0.5 ? C.focus : C.mocha} />
      <Req x1={160} x2={395} y={54} k={k} label={k >= 1 ? 'PUT, 200' : 'PUT'} />
      <Req x1={160} x2={395} y={164} k={k2} label={v > 0.5 ? '412' : '?'} f={v > 0.5 ? C.cherryText : C.crema} />
      {v > 0 && <Cell x={190} y={lerp(210, 180, v)} w={170} h={24} label="If-None-Match: *" o={v} stroke={C.focus} f={C.focus} />}
      <Verdict answer={answer} text="a condition the store checks as it writes" y={232} />
    </Svg>
  );
}

// 2 · A dated timeline. A pointer slides past December twenty twenty: before it, a listing right after a write misses
// it; after it, both the listing and the single-key read see it. The single-key row was never the hard case.
export function ConsistencyTimeline({ t }: StepCtx) {
  const a = easeOut(seg(t, 0, 0.4));
  const p = easeInOut(seg(t, 0.4, 2.6));
  const px = lerp(260, 560, p);
  const before = easeOut(seg(t, 0.8, 1.2));
  const after = easeOut(seg(t, 2.0, 2.4));
  const note = easeOut(seg(t, 3.0, 3.4));
  return (
    <Svg label="Before December two thousand twenty, a read right after a write could be stale; since then every read or list request on S3 immediately reflects the most recent write" h={240}>
      <T x={335} y={32} s={12} f={C.latte} a="middle" o={a}>
        before Dec 2020
      </T>
      <T x={490} y={32} s={12} f={C.focus} a="middle" o={a}>
        since Dec 2020
      </T>
      <line x1={260} y1={48} x2={575} y2={48} stroke={C.mocha} strokeWidth={1.5} opacity={a} />
      <line x1={412} y1={40} x2={412} y2={190} stroke={C.mocha} strokeWidth={1.5} strokeDasharray="4 4" opacity={a} />
      <path d={`M${px} 48 l-6 -9 h12 z`} fill={C.second} opacity={a} />
      <T x={25} y={100} s={13} f={C.crema} o={a}>
        list right after a write
      </T>
      <T x={25} y={160} s={13} f={C.crema} o={a}>
        read the key you wrote
      </T>
      <Cross x={335} y={95} k={before} />
      <MiniTick x={329} y={153} k={before} />
      <MiniTick x={484} y={93} k={after} />
      <MiniTick x={484} y={153} k={after} />
      {t > 3.0 && <rect x={18} y={136} width={562} height={36} rx={6} fill="none" stroke={C.focus} strokeWidth={1.5} opacity={note} />}
      {t > 3.0 && (
        <T x={300} y={210} s={12} f={C.focus} a="middle" o={note}>
          the single key was never the hard case
        </T>
      )}
      {t > 2.4 && (
        <T x={300} y={232} s={11} f={C.latte} a="middle" o={after}>
          every customer, no setting, no extra charge
        </T>
      )}
    </Svg>
  );
}

// 3 · Three rows. A single PUT flips old to new in one stroke. A rename on a flat store copies first (both keys exist,
// the window outlined in red), then deletes. A hierarchical namespace updates one directory entry instead.
export function AtomicPutVsRename({ t }: StepCtx) {
  const r = (d: number) => easeOut(seg(t, d, d + 0.3));
  const flip = t > 0.9;
  const copy = easeInOut(seg(t, 1.5, 2.1));
  const win = easeOut(seg(t, 2.1, 2.4));
  const del = easeOut(seg(t, 2.9, 3.3));
  const dir = easeInOut(seg(t, 3.9, 4.4));
  return (
    <Svg
      label="A single PUT is one indivisible operation; a rename on a flat store is a copy then a delete with a real gap between them; a hierarchical namespace updates one directory entry instead"
      h={255}
    >
      <g opacity={r(0)}>
        <T x={25} y={48} s={12} f={C.latte}>
          PUT one key
        </T>
        <Cell x={200} y={30} w={170} label={flip ? 'new bytes' : 'old bytes'} stroke={flip ? C.focus : C.mocha} f={flip ? C.focus : C.crema} />
        <MiniTick x={384} y={44} k={r(0.9)} />
        <T x={405} y={48} s={11} f={C.latte} o={r(0.9)}>
          all or nothing
        </T>
      </g>
      <g opacity={r(1.2)}>
        <T x={25} y={100} s={12} f={C.latte}>
          rename, flat store
        </T>
        <Cell x={200} y={82} w={170} label="_tmp/part-00000" o={1 - 0.7 * del} />
        {copy > 0 && <Cell x={200} y={lerp(82, 122, copy)} w={170} label="final/part-00000" o={copy} />}
        <T x={385} y={100} s={11} f={C.latte} o={r(1.5)}>
          copy
        </T>
        {t > 2.1 && <rect x={194} y={77} width={182} height={78} rx={6} fill="none" stroke={C.cherryText} strokeWidth={1.5} opacity={win * (1 - del)} />}
        <T x={385} y={122} s={11} f={C.cherryText} o={win}>
          both exist
        </T>
        <T x={385} y={145} s={11} f={C.latte} o={del}>
          then delete
        </T>
      </g>
      <g opacity={r(3.6)}>
        <T x={25} y={198} s={12} f={C.latte}>
          with a hierarchy
        </T>
        <T x={25} y={224} s={11} f={C.taupe}>
          ADLS Gen2
        </T>
        <Cell x={200} y={180} w={170} label={dir > 0.5 ? 'final/' : '_tmp/'} stroke={dir > 0.5 ? C.focus : C.mocha} f={dir > 0.5 ? C.focus : C.crema} />
        {[0, 1, 2].map((i) => (
          <Pip key={i} x={230 + i * 20 + 40 * dir} y={226} s={8} f={C.second} />
        ))}
        <MiniTick x={384} y={192} k={easeOut(seg(t, 4.4, 4.7))} />
        <T x={405} y={198} s={11} f={C.focus} o={easeOut(seg(t, 4.4, 4.7))}>
          one entry updated
        </T>
      </g>
    </Svg>
  );
}

// 4 · Two locks from one primitive. Top: create-if-absent, first writer 200, second 412. Bottom: a lease renewed with the
// current tag (200, until t+60s), then worker-12 with the old tag (412). Finally both checks light up inside the store.
export function ConditionalLock({ t }: StepCtx) {
  const k = (d: number) => easeInOut(seg(t, d, d + 0.5));
  const lit = easeOut(seg(t, 4.4, 4.8));
  const st = lit > 0 ? C.focus : C.mocha;
  return (
    <Svg label="Two clients race to create the same key with if-none-match; the first succeeds, the second is rejected. A lease key renewed with if-match rejects a stale holder" h={255}>
      <T x={25} y={28} s={12} f={C.focus} o={k(0)}>
        create if absent
      </T>
      <Cell x={25} y={40} w={130} label="first writer" o={k(0)} />
      <Cell x={25} y={78} w={130} label="second writer" o={k(0)} />
      <rect x={380} y={36} width={195} height={74} rx={6} fill={C.cocoa} stroke={st} strokeWidth={1.5} opacity={k(0)} />
      <T x={477} y={78} s={12} f={C.crema} a="middle" o={k(0.7)}>
        {t > 0.9 ? 'entry-1: first writer' : 'entry-1'}
      </T>
      <Req x1={160} x2={375} y={54} k={k(0.4)} label={t > 0.9 ? '200' : 'If-None-Match: *'} f={t > 0.9 ? C.focus : C.crema} />
      <Req x1={160} x2={375} y={92} k={k(1.2)} label={t > 1.7 ? '412' : 'If-None-Match: *'} f={t > 1.7 ? C.cherryText : C.crema} />
      <T x={25} y={140} s={12} f={C.focus} o={k(2.2)}>
        update if unchanged
      </T>
      <Cell x={25} y={152} w={130} label="worker-7" o={k(2.2)} />
      <Cell x={25} y={192} w={130} label="worker-12" o={k(2.2)} />
      <rect x={380} y={148} width={195} height={76} rx={6} fill={C.cocoa} stroke={st} strokeWidth={1.5} opacity={k(2.2)} />
      <T x={477} y={191} s={12} f={C.crema} a="middle" o={k(2.2)}>
        {t > 3.1 ? 'worker-7, until t+60s' : 'worker-7, until t+30s'}
      </T>
      <Req x1={160} x2={375} y={166} k={k(2.6)} label={t > 3.1 ? '200' : 'If-Match, current tag'} f={t > 3.1 ? C.focus : C.crema} />
      <Req x1={160} x2={375} y={206} k={k(3.4)} label={t > 3.9 ? '412' : 'If-Match, old tag'} f={t > 3.9 ? C.cherryText : C.crema} />
      {t > 4.4 && (
        <T x={477} y={244} s={11} f={C.focus} a="middle" o={lit}>
          both checked inside the store
        </T>
      )}
    </Svg>
  );
}

// 5 · One prefix takes a burst of 4,000 against a 3,500 baseline; the last 500 spill past the line in red. The same burst
// split four ways gives each prefix 1,000, every bar well short of the line, and nothing throttled.
export function HotPrefixThrottle({ t }: StepCtx) {
  const a = easeOut(seg(t, 0, 0.4));
  const g1 = easeInOut(seg(t, 0.4, 1.8));
  const spill = easeOut(seg(t, 1.8, 2.2));
  const g2 = (i: number) => easeInOut(seg(t, 2.6 + i * 0.15, 3.6 + i * 0.15));
  const done = easeOut(seg(t, 3.9, 4.3));
  const sx = (n: number) => 150 + (n / 4000) * 400;
  return (
    <Svg label="A burst of four thousand requests against one prefix throttles five hundred of them; the same burst spread across four prefixes throttles none" h={250}>
      <T x={500} y={28} s={11} f={C.latte} a="middle" o={a}>
        3,500 / sec baseline
      </T>
      <line x1={sx(3500)} y1={36} x2={sx(3500)} y2={210} stroke={C.latte} strokeWidth={1.5} strokeDasharray="4 4" opacity={a} />
      <T x={25} y={70} s={12} f={C.crema} o={a}>
        one prefix
      </T>
      <rect x={150} y={58} width={sx(Math.min(4000 * g1, 3500)) - 150} height={16} rx={3} fill={C.second} opacity={0.8} />
      {g1 > 0.875 && <rect x={sx(3500)} y={58} width={sx(4000 * g1) - sx(3500)} height={16} rx={3} fill={C.cherryText} />}
      <T x={150} y={96} s={11} f={C.latte} o={spill}>
        4,000 requests
      </T>
      <T x={575} y={96} s={11} f={C.cherryText} a="end" o={spill}>
        500 get 503 Slow Down
      </T>
      <T x={25} y={160} s={12} f={C.crema} o={easeOut(seg(t, 2.4, 2.7))}>
        four prefixes
      </T>
      {[0, 1, 2, 3].map((i) => (
        <rect key={i} x={150} y={124 + i * 22} width={(sx(1000) - 150) * g2(i)} height={12} rx={3} fill={C.second} opacity={0.8} />
      ))}
      {t > 3.9 && (
        <T x={300} y={235} s={12} f={C.focus} a="middle" o={done}>
          1,000 each, 0 throttled
        </T>
      )}
    </Svg>
  );
}

// 6 · Recap: four lines, each beside a small moving picture of its idea.
export function Recap({ t }: StepCtx) {
  const k = (i: number) => easeOut(seg(t, 0.1 + i * 0.55, 0.5 + i * 0.55));
  const lines = [
    'Read or list after write: accurate since Dec 2020',
    'One key is atomic; a two-key rename is not',
    'A conditional write is a real compare-and-swap',
    'A busy prefix throttles on its own',
  ];
  return (
    <Svg
      label="A client holds a tag it read three refreshes ago; the key has been written twice since by someone else; its conditional write is checked against the key's current tag, not the client's memory of it"
      h={250}
    >
      {lines.map((l, i) => (
        <g key={l} opacity={k(i)}>
          <T x={110} y={44 + i * 50} s={12} f={C.crema}>
            {l}
          </T>
        </g>
      ))}
      <g opacity={k(0)}>
        <line x1={25} y1={40} x2={85} y2={40} stroke={C.mocha} strokeWidth={1.5} />
        <path d={`M${lerp(25, 85, easeInOut(seg(t, 0.2, 1.0)))} 40 l-5 -8 h10 z`} fill={C.second} />
      </g>
      <g opacity={k(1)}>
        <rect x={25} y={80} width={26} height={16} rx={3} fill={C.second} fillOpacity={0.5} stroke={C.mocha} />
        <rect x={59} y={80} width={26} height={16} rx={3} fill="none" stroke={C.cherryText} strokeDasharray="3 2" />
      </g>
      <Lock x={47} y={138} k={k(2)} f={C.focus} />
      <g opacity={k(3)}>
        {[0, 1, 2].map((i) => (
          <rect
            key={i}
            x={25 + i * 22}
            y={196 - (i === 0 ? 20 * easeOut(seg(t, 1.9, 2.4)) : 8)}
            width={16}
            height={i === 0 ? 20 * easeOut(seg(t, 1.9, 2.4)) : 8}
            fill={i === 0 ? C.cherryText : C.second}
          />
        ))}
      </g>
      {t > 2.4 && (
        <T x={300} y={240} s={12} f={C.focus} a="middle" o={easeOut(seg(t, 2.4, 2.8))}>
          next: what those two primitives still leave out
        </T>
      )}
    </Svg>
  );
}

// 7 · Prove it. Two other writers drop new tags onto the key while the client keeps carrying the old one. The client's
// If-Match goes out; once answered, the store compares it with the current tag and returns 412.
export function ProveIt({ t, answer }: StepCtx) {
  const tags = ['old', 'newer', 'now'];
  const tk = (i: number) => easeOut(seg(t, 0.2 + i * 0.6, 0.5 + i * 0.6));
  const send = easeInOut(seg(t, 1.8, 2.4));
  const v = useSinceAnswer(answer !== null);
  const r = answer !== null ? easeOut(seg(v, 0.1, 0.6)) : 0;
  return (
    <Svg
      label="A client holds a tag it read three refreshes ago; the key has been written twice since by someone else; its conditional write is checked against the key's current tag, not the client's memory of it"
      h={250}
    >
      <Cell x={25} y={46} w={140} label="client: old tag" />
      <rect x={400} y={36} width={175} height={100} rx={6} fill={C.cocoa} stroke={r > 0.5 ? C.cherryText : C.mocha} strokeWidth={1.5} />
      <T x={410} y={30} s={11} f={C.latte}>
        the key's tags
      </T>
      {tags.map((g, i) => (
        <Cell key={g} x={408 + i * 56} y={lerp(70, 96, tk(i))} w={50} h={26} label={g} o={tk(i)} stroke={i === 2 ? C.focus : C.mocha} f={i === 2 ? C.focus : C.crema} />
      ))}
      {[1, 2].map((i) => (
        <Pip key={i} x={433 + i * 56} y={lerp(44, 88, tk(i))} s={8} f={C.second} o={tk(i) > 0 && tk(i) < 1 ? 1 : 0} />
      ))}
      <Req x1={170} x2={395} y={60} k={send} label={r > 0.5 ? '412' : 'If-Match: old tag'} f={r > 0.5 ? C.cherryText : C.crema} />
      <AnswerRow y={180} label="the conditional write" answer={answer} value="rejected" k={easeOut(seg(t, 2.0, 2.4))} f={C.cherryText} />
      <Verdict answer={answer} text="checked against the current tag" y={225} />
    </Svg>
  );
}
