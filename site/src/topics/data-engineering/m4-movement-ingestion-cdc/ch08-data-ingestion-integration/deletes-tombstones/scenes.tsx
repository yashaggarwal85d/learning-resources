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

/** A reply arrow from x1 back left toward x2, drawn by `k`. */
function Back({ x1, x2, y, k, f = C.crema }: { x1: number; x2: number; y: number; k: number; f?: string }) {
  if (k <= 0) return null;
  const x = lerp(x1, x2, k);
  return (
    <g>
      <line x1={x1} y1={y} x2={x} y2={y} stroke={f} strokeWidth={1.8} />
      <path d={`M${x} ${y} l8 -5 v10 z`} fill={f} />
    </g>
  );
}

// 0 · Hook. A compacted topic holds customer-9001's record and, after it, a tombstone. Days pass; the tombstone is
// cleaned away. A brand-new sink reads from the start and gets the customer back, present.
export function Hook({ t }: StepCtx) {
  const clean = easeOut(seg(t, 1.4, 1.9));
  const rd = easeOut(seg(t, 2.3, 3.0));
  return (
    <Svg label="a new sink is bootstrapped from a compacted topic days after a customer was deleted; the delete's own marker was already cleaned up, and the customer comes back." h={220}>
      <T x={25} y={22} s={11} f={C.latte}>
        compacted topic
      </T>
      {[0, 1, 2].map((i) => (
        <rect key={i} x={25 + i * 38} y={30} width={30} height={28} rx={3} fill={C.cocoa} stroke={C.mocha} strokeWidth={1.2} opacity={easeOut(seg(t, 0, 0.3))} />
      ))}
      <Cell x={145} y={30} w={140} label="customer-9001" o={easeOut(seg(t, 0.2, 0.5))} />
      {clean > 0 && <Hole x={295} y={30} w={110} o={clean} stroke={C.cherryText} />}
      <Cell x={295} y={30} w={110} label="tombstone" o={easeOut(seg(t, 0.5, 0.8)) * (1 - clean)} stroke={C.focus} />
      {t >= 1.0 && (
        <T x={420} y={49} s={11} f={C.latte} o={easeOut(seg(t, 1.0, 1.3))}>
          days pass
        </T>
      )}
      {clean > 0 && (
        <T x={350} y={80} s={11} f={C.cherryText} a="middle" o={clean}>
          cleaned up
        </T>
      )}
      <Cell x={25} y={130} w={160} label="new sink" o={easeOut(seg(t, 2.0, 2.3))} />
      <Req x1={190} x2={255} y={144} k={rd} />
      <Cell x={260} y={130} w={260} label="customer-9001: present" o={easeOut(seg(t, 3.0, 3.3))} stroke={C.cherryText} f={C.cherryText} />
      {t >= 3.6 && (
        <T x={25} y={200} s={13} f={C.cherryText} o={easeOut(seg(t, 3.6, 4.0))}>
          deleted days ago, back in the sink
        </T>
      )}
    </Svg>
  );
}

// 1 · Predict. One delete gives two records with one key: the delete event, then a tombstone. The rule keeps the latest
// per key. Once answered, the first record fades to an empty slot.
export function Predict({ t, answer }: StepCtx) {
  const s = useSinceAnswer(answer !== null);
  const v = answer !== null ? easeOut(seg(s, 0.2, 0.8)) : 0;
  return (
    <Svg label="a delete produces two records sharing one key, one after the other. Does compaction's keep-the-latest rule keep both, or only the newest of the two?" h={200}>
      {v > 0 && <Hole x={25} y={40} w={240} o={v} />}
      <Cell x={25} y={40} w={240} label="key 9001: delete event" o={easeOut(seg(t, 0.1, 0.4)) * (1 - v)} />
      <Cell x={285} y={40} w={240} label="key 9001: tombstone" o={easeOut(seg(t, 0.4, 0.7))} stroke={v > 0 ? C.focus : C.mocha} />
      <T x={25} y={110} s={13} f={C.latte} o={easeOut(seg(t, 0.9, 1.3))}>
        the rule: keep the latest record per key
      </T>
      <AnswerRow y={178} label="it keeps" answer={answer} value="only the newer" k={easeOut(seg(t, 1.6, 2.2))} />
    </Svg>
  );
}

// 2 · Before-image mechanism. A delete event's before field under DEFAULT holds only the key; under FULL it holds the
// whole row, the same rule an update follows.
export function RevealBeforeImageMechanism({ t }: StepCtx) {
  return (
    <Svg label="a delete's before field answers to the same REPLICA IDENTITY setting an update's before field does: DEFAULT carries only the key, FULL carries the whole row." h={200}>
      <T x={260} y={22} s={11} f={C.latte} a="middle">
        a delete's before field
      </T>
      {[
        ['DEFAULT', 1],
        ['FULL', 2],
      ].map(([n, c], i) => {
        const y = 34 + i * 56;
        const k = easeOut(seg(t, 0.3 + i * 1.0, 0.7 + i * 1.0));
        const f = easeOut(seg(t, 0.7 + i * 1.0, 1.2 + i * 1.0));
        return (
          <g key={i} opacity={k}>
            <Cell x={25} y={y} w={120} label={n as string} stroke={C.focus} />
            <Hole x={170} y={y - 4} w={180} h={36} />
            <Cell x={178} y={y} w={76} label="id" o={f} stroke={C.second} />
            {(c as number) >= 2 && <Cell x={264} y={y} w={76} label="note" o={f} stroke={C.second} />}
          </g>
        );
      })}
      {t >= 2.8 && (
        <T x={25} y={180} s={13} f={C.focus} o={easeOut(seg(t, 2.8, 3.2))}>
          the same setting an update's before field obeys
        </T>
      )}
    </Svg>
  );
}

// 3 · Before-image, measured. The delete of id 1 under DEFAULT types out a before-image of id alone; the delete of id 2
// under FULL types out id and note 'beta'.
export function RevealBeforeImageMeasured({ t }: StepCtx) {
  const rows: [string, string, string, string][] = [
    ['DEFAULT', 'DELETE ... WHERE id = 1', 'before: id only', C.crema],
    ['FULL', 'DELETE ... WHERE id = 2', "before: id, note 'beta'", C.focus],
  ];
  return (
    <Svg
      label="the real run: the identical delete against a table at its default identity, then against one set to full; the first before-image carried only the key, the second the whole row."
      h={220}
    >
      {rows.map(([n, q, r, f], i) => {
        const y = 30 + i * 80;
        const k = easeOut(seg(t, 0.2 + i * 1.6, 0.6 + i * 1.6));
        const typed = Math.round(r.length * seg(t, 0.7 + i * 1.6, 1.4 + i * 1.6));
        return (
          <g key={i} opacity={k}>
            <Cell x={25} y={y} w={120} label={n} stroke={C.focus} />
            <T x={165} y={y + 10} s={11} f={C.latte}>
              {q}
            </T>
            {typed > 0 && (
              <T x={165} y={y + 34} s={13} f={f}>
                {r.slice(0, typed)}
              </T>
            )}
          </g>
        );
      })}
    </Svg>
  );
}

// 4 · Soft vs hard. Row 1's status flips to cancelled and its stamp moves: the cursor's arrow finds it. Row 2 is removed
// to an empty slot: the arrow finds nothing. Only the log keeps the hard delete.
export function RevealSoftHardMechanism({ t }: StepCtx) {
  const soft = t >= 0.8;
  const hard = easeOut(seg(t, 1.2, 1.6));
  const cur = easeOut(seg(t, 2.0, 2.6));
  return (
    <Svg label="a soft delete is just another update, so a cursor query polling for recent changes sees it like any other row; a hard delete leaves the log as its only trace." h={200}>
      <Cell x={25} y={30} w={220} label={soft ? '1 · status: cancelled' : '1 · status: active'} stroke={soft ? C.second : C.mocha} />
      {hard > 0 && <Hole x={25} y={74} w={220} o={hard} stroke={C.cherryText} />}
      <Cell x={25} y={74} w={220} label="2 · status: active" o={1 - hard} />
      <Cell x={430} y={52} w={120} label="cursor" o={easeOut(seg(t, 1.8, 2.1))} />
      <Back x1={425} x2={250} y={44} k={cur} f={C.focus} />
      <Back x1={425} x2={250} y={88} k={cur} f={C.cherryText} />
      {cur >= 1 && (
        <g opacity={easeOut(seg(t, 2.6, 2.9))}>
          <T x={265} y={36} s={11} f={C.focus}>
            sees it
          </T>
          <T x={265} y={110} s={11} f={C.cherryText}>
            nothing to find
          </T>
        </g>
      )}
      <Cell x={25} y={140} w={220} label="the log: DELETE 2" o={easeOut(seg(t, 3.1, 3.4))} stroke={C.second} />
      {t >= 3.4 && (
        <T x={260} y={159} s={11} f={C.second} o={easeOut(seg(t, 3.4, 3.7))}>
          the hard delete's only trace
        </T>
      )}
    </Svg>
  );
}

// 5 · Soft vs hard, measured. One cursor query: it returns id 1, cancelled, and nothing at all for id 2.
export function RevealSoftHardMeasured({ t }: StepCtx) {
  return (
    <Svg label="the real run: a cursor query sees the soft-deleted row show up like any update; the same cursor query never finds the hard-deleted row, with no trace at all." h={220}>
      <Cell x={25} y={24} w={340} label="SELECT ... WHERE updated_at > cursor" o={easeOut(seg(t, 0.1, 0.5))} />
      <Row y={100} label="soft-deleted id 1" value="cancelled" valueColor={C.focus} k={easeOut(seg(t, 1.0, 1.4))} />
      <Row y={150} label="hard-deleted id 2" value="no trace" valueColor={C.cherryText} k={easeOut(seg(t, 2.0, 2.4))} />
      <Hole x={25} y={166} w={200} h={20} o={easeOut(seg(t, 2.4, 2.8))} stroke={C.cherryText} />
      {t >= 3.2 && (
        <T x={300} y={208} s={11} f={C.latte} a="middle" o={easeOut(seg(t, 3.2, 3.6))}>
          the same query, every single time
        </T>
      )}
    </Svg>
  );
}

// 6 · MERGE, measured. The landing table's three rows; the MERGE's two changes; row 2 updates in place, row 3 is
// removed to an empty slot, row 1 ticks untouched.
export function RevealMergeMeasured({ t }: StepCtx) {
  const ap = easeOut(seg(t, 1.4, 2.0));
  const done = t >= 2.1;
  return (
    <Svg label="the real run: one MERGE statement applied to a real landing table removes exactly the deleted row's own key, leaving every other row untouched." h={200}>
      <T x={25} y={22} s={11} f={C.latte}>
        landing table
      </T>
      <Cell x={25} y={30} w={170} label="1 · alpha" o={easeOut(seg(t, 0, 0.3))} />
      <Cell x={25} y={70} w={170} label={done ? '2 · beta-updated' : '2 · beta'} o={easeOut(seg(t, 0.1, 0.4))} stroke={done ? C.second : C.mocha} />
      {done && <Hole x={25} y={110} w={170} stroke={C.cherryText} o={easeOut(seg(t, 2.1, 2.4))} />}
      {!done && <Cell x={25} y={110} w={170} label="3 · gamma" o={easeOut(seg(t, 0.2, 0.5))} />}
      <MiniTick x={205} y={40} k={easeOut(seg(t, 2.5, 2.9))} />
      <T x={380} y={22} s={11} f={C.latte} o={easeOut(seg(t, 0.6, 0.9))}>
        MERGE changes
      </T>
      <Cell x={380} y={70} w={170} label="u: 2, beta-updated" o={easeOut(seg(t, 0.7, 1.0))} stroke={C.second} />
      <Cell x={380} y={110} w={170} label="d: 3" o={easeOut(seg(t, 0.9, 1.2))} stroke={C.cherryText} />
      <Back x1={375} x2={240} y={84} k={ap} f={C.second} />
      <Back x1={375} x2={240} y={124} k={ap} f={C.cherryText} />
      {t >= 3.0 && (
        <T x={25} y={180} s={13} f={C.focus} o={easeOut(seg(t, 3.0, 3.4))}>
          only id 3 is gone
        </T>
      )}
    </Svg>
  );
}

// 7 · The retention race. A one-day window opens at the tombstone. A consumer resuming inside it finds the tombstone and
// deletes the key; the window closes, the tombstone goes, and one resuming after keeps the customer present.
export function RevealRetentionRaceMeasured({ t }: StepCtx) {
  const w = easeInOut(seg(t, 0.3, 1.2));
  const a = easeOut(seg(t, 1.4, 1.8));
  const gone = easeOut(seg(t, 2.4, 2.8));
  const b = easeOut(seg(t, 3.0, 3.4));
  return (
    <Svg
      label="the real run: a consumer resuming before the retention window closes still finds the tombstone and applies the delete; one resuming after finds nothing at all and stays stale."
      h={220}
    >
      <T x={60} y={30} s={11} f={C.latte} o={w}>
        delete.retention.ms: one day
      </T>
      <rect x={60} y={38} width={400 * w} height={10} fill={C.latte} />
      <line x1={25} y1={70} x2={545} y2={70} stroke={C.mocha} strokeWidth={1.4} />
      {gone > 0 && <Hole x={45} y={78} w={110} o={gone} />}
      <Cell x={45} y={78} w={110} label="tombstone" o={easeOut(seg(t, 0.1, 0.4)) * (1 - gone)} stroke={C.focus} />
      <path d="M430 72 l-6 9 h12 z" fill={C.focus} opacity={a} />
      {a > 0 && (
        <T x={430} y={130} s={11} f={C.focus} a="middle" o={a}>
          inside: delete applied
        </T>
      )}
      <path d="M510 72 l-6 9 h12 z" fill={C.cherryText} opacity={b} />
      {b > 0 && (
        <T x={545} y={170} s={11} f={C.cherryText} a="end" o={b}>
          after: customer present
        </T>
      )}
      {t >= 3.6 && (
        <T x={25} y={208} s={13} f={C.cherryText} o={easeOut(seg(t, 3.6, 4.0))}>
          stale, and nothing left to correct it
        </T>
      )}
    </Svg>
  );
}

// 8 · Recap. Four questions about a delete, each answered by a different setting or clock; the last, tombstone
// retention, is the one that closes.
export function Recap({ t }: StepCtx) {
  const qs = ['its before-image', 'a cursor sees it?', 'into a table', 'a late consumer'];
  const as = ['REPLICA IDENTITY', 'soft yes, hard no', 'a MERGE', 'tombstone retention'];
  return (
    <Svg
      label="a delete's before-image follows REPLICA IDENTITY; soft deletes stay visible to a cursor and hard ones don't; a MERGE carries one into a table; and a tombstone outlives a delete only for so long."
      h={260}
    >
      {qs.map((q, i) => (
        <g key={i}>
          <Cell x={25} y={20 + i * 46} w={200} label={q} o={easeOut(seg(t, 0.2 + i * 0.6, 0.6 + i * 0.6))} />
          <Req x1={230} x2={308} y={34 + i * 46} k={easeOut(seg(t, 0.4 + i * 0.6, 0.8 + i * 0.6))} />
          <Cell x={315} y={20 + i * 46} w={240} label={as[i]} o={easeOut(seg(t, 0.6 + i * 0.6, 0.9 + i * 0.6))} stroke={i === 3 ? C.cherryText : C.focus} />
        </g>
      ))}
      {t >= 3.2 && (
        <T x={300} y={230} s={13} f={C.cherryText} a="middle" o={easeOut(seg(t, 3.2, 3.6))}>
          only that last window closes on you
        </T>
      )}
    </Svg>
  );
}

// 9 · Prove it. The sink's lag as a bar above two windows: the source log's long retention and the topic's tombstone
// window. Once answered, a limit line drops at the tombstone window's end.
export function ProveIt({ t, answer }: StepCtx) {
  const s = useSinceAnswer(answer !== null);
  const v = answer !== null ? easeOut(seg(s, 0.2, 0.8)) : 0;
  return (
    <Svg label="nothing stops a team from avoiding this race entirely. What's the one number a sink's own maximum lag has to stay under?" h={200}>
      <T x={25} y={22} s={11} f={C.latte}>
        the sink's lag
      </T>
      <rect x={25} y={30} width={220 * easeOut(seg(t, 0.2, 0.7))} height={10} fill={C.cherryText} />
      <T x={25} y={64} s={11} f={C.latte} o={easeOut(seg(t, 0.6, 0.9))}>
        source log retention
      </T>
      <rect x={25} y={72} width={480 * easeOut(seg(t, 0.7, 1.2))} height={10} fill={C.latte} />
      <T x={25} y={106} s={11} f={C.latte} o={easeOut(seg(t, 0.9, 1.2))}>
        tombstone window
      </T>
      <rect x={25} y={114} width={300 * easeOut(seg(t, 1.0, 1.5))} height={10} fill={C.focus} />
      {v > 0 && <line x1={325} y1={24} x2={325} y2={lerp(24, 132, v)} stroke={C.focus} strokeWidth={2} strokeDasharray="5 4" />}
      {v > 0 && (
        <T x={335} y={40} s={11} f={C.focus} o={v}>
          stay under this
        </T>
      )}
      <AnswerRow y={178} label="the number" answer={answer} value="delete.retention.ms" k={easeOut(seg(t, 1.6, 2.2))} />
    </Svg>
  );
}
