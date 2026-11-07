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

/** A small upward caret at (x, y). */
function Caret({ x, y, k, f = C.latte }: { x: number; y: number; k: number; f?: string }) {
  return <path d={`M${x} ${y} l-6 9 h12 z`} fill={f} opacity={k} />;
}

const SEG = (i: number) => 25 + i * 37;

// 0 · Hook. Across a weekend the connector tile keeps its green tick; the WAL strip grows behind a slot marker that
// never moves, and the disk gauge climbs to nearly full.
export function Hook({ t }: StepCtx) {
  const p = easeInOut(seg(t, 0.4, 3.6));
  const days = ['Fri', 'Sat', 'Sun', 'Mon'];
  return (
    <Svg label="the connector shows healthy all weekend; the primary's disk climbs to nearly full; the slot's own marker sat frozen the whole time." h={220}>
      <Cell x={25} y={24} w={200} label="connector: healthy" stroke={C.focus} />
      <MiniTick x={234} y={34} k={easeOut(seg(t, 0.2, 0.5))} />
      <rect x={25} y={76} width={380 * p} height={20} rx={3} fill={C.cocoa} stroke={C.cherryText} strokeWidth={1.4} />
      <Caret x={32} y={100} k={easeOut(seg(t, 0.3, 0.6))} />
      <T x={45} y={124} s={11} f={C.latte} o={easeOut(seg(t, 0.4, 0.7))}>
        slot marker, frozen
      </T>
      {days.map((d, i) => (
        <T key={i} x={25 + i * 120} y={156} s={11} f={C.latte} o={p >= i / 3 - 0.01 ? 1 : 0}>
          {d}
        </T>
      ))}
      <rect x={470} y={30} width={40} height={150} rx={4} fill="none" stroke={C.mocha} strokeWidth={1.5} />
      <rect x={474} y={176 - 142 * p} width={32} height={142 * p} fill={C.bad} />
      <T x={490} y={198} s={11} f={C.latte} a="middle">
        disk
      </T>
      {t >= 3.8 && (
        <T x={25} y={205} s={13} f={C.cherryText} o={easeOut(seg(t, 3.8, 4.2))}>
          green all weekend, disk nearly full
        </T>
      )}
    </Svg>
  );
}

// 1 · Predict. A healthy, connected connector over a quiet captured table; other tables' writes keep growing the WAL
// while the slot's caret stays put. Once answered, the pinned stretch outlines cherry.
export function Predict({ t, answer }: StepCtx) {
  const s = useSinceAnswer(answer !== null);
  const v = answer !== null ? easeOut(seg(s, 0.2, 0.8)) : 0;
  const g = easeInOut(seg(t, 0.6, 2.0));
  return (
    <Svg label="that connector never crashed and never disconnected. Can a connector that looks healthy still be the reason WAL keeps growing?" h={200}>
      <Cell x={25} y={30} w={200} label="connected, healthy" stroke={C.focus} o={easeOut(seg(t, 0, 0.3))} />
      <Cell x={25} y={80} w={200} label="captured table: quiet" o={easeOut(seg(t, 0.2, 0.5))} />
      <T x={250} y={26} s={11} f={C.latte} o={easeOut(seg(t, 0.4, 0.7))}>
        other tables' writes
      </T>
      <rect x={250} y={36} width={295 * g} height={22} rx={3} fill={C.cocoa} stroke={v > 0 ? C.cherryText : C.mocha} strokeWidth={v > 0 ? 2 : 1.2} />
      <Caret x={258} y={62} k={easeOut(seg(t, 0.6, 0.9))} />
      <T x={272} y={78} s={11} f={C.latte} o={easeOut(seg(t, 0.7, 1.0))}>
        slot, not moving
      </T>
      {v > 0 && (
        <T x={250} y={120} s={11} f={C.cherryText} o={v}>
          all of it pinned
        </T>
      )}
      <AnswerRow y={178} label="can it?" answer={answer} value="yes" k={easeOut(seg(t, 1.6, 2.2))} />
    </Svg>
  );
}

// 2 · Indifference. The server crashes and comes back; its slot is still there under a lock. Where a consumer would
// confirm, an empty slot and a crossed line: nothing tells the server to let go.
export function RevealSlotIndifference({ t }: StepCtx) {
  const crash = easeOut(seg(t, 0.6, 0.9));
  const back = easeOut(seg(t, 1.3, 1.6));
  const down = crash * (1 - back);
  return (
    <Svg label="a slot persists across crashes and knows nothing about its consumer; with no reader, nothing tells the server it can reclaim anything." h={200}>
      <Cell x={25} y={36} w={200} label={down > 0.5 ? 'server: crashed' : 'server'} stroke={down > 0.5 ? C.cherryText : C.mocha} />
      <Cell x={25} y={84} w={200} label="slot" stroke={C.focus} />
      <Lock x={236} y={96} k={easeOut(seg(t, 1.6, 2.0))} f={C.focus} />
      {t >= 1.8 && (
        <T x={25} y={136} s={11} f={C.focus} o={easeOut(seg(t, 1.8, 2.1))}>
          survives the crash
        </T>
      )}
      <Hole x={380} y={84} w={170} o={easeOut(seg(t, 2.2, 2.5))} stroke={C.cherryText} />
      {t >= 2.3 && (
        <T x={465} y={136} s={11} f={C.cherryText} a="middle" o={easeOut(seg(t, 2.3, 2.6))}>
          no reader
        </T>
      )}
      <line x1={262} y1={98} x2={lerp(262, 375, easeOut(seg(t, 2.6, 3.0)))} y2={98} stroke={C.latte} strokeWidth={1.5} strokeDasharray="4 3" />
      <Cross x={318} y={98} k={easeOut(seg(t, 3.0, 3.3))} />
      {t >= 3.4 && (
        <T x={300} y={180} s={13} f={C.latte} a="middle" o={easeOut(seg(t, 3.4, 3.8))}>
          nothing tells the server it can let go
        </T>
      )}
    </Svg>
  );
}

// 3 · Growth, measured. The retained gap before as a short bar; a batch of writes fills in; the gap after, read again,
// is a long cherry bar.
export function RevealGrowthMeasured({ t }: StepCtx) {
  const w = 20 * easeInOut(seg(t, 0.9, 2.3));
  const after = easeOut(seg(t, 2.5, 3.3));
  return (
    <Svg label="the real run: a slot with no reader, a real write load, the retained gap read before and after." h={220}>
      <T x={25} y={24} s={11} f={C.latte}>
        a slot with no reader
      </T>
      <T x={25} y={64} s={11} f={C.latte} o={easeOut(seg(t, 0.2, 0.5))}>
        gap before
      </T>
      <rect x={120} y={54} width={60 * easeOut(seg(t, 0.2, 0.7))} height={14} fill={C.latte} />
      <T x={25} y={110} s={11} f={C.latte} o={easeOut(seg(t, 0.8, 1.1))}>
        writes
      </T>
      {Array.from({ length: 20 }, (_, i) => (
        <rect key={i} x={120 + i * 21} y={98} width={16} height={16} rx={2} fill={C.latte} opacity={clamp(w - i, 0, 1)} />
      ))}
      <T x={25} y={160} s={11} f={C.cherryText} o={after}>
        gap after
      </T>
      <rect x={120} y={150} width={360 * after} height={14} fill={C.cherryText} />
      {t >= 3.6 && (
        <T x={300} y={205} s={13} f={C.cherryText} a="middle" o={easeOut(seg(t, 3.6, 4.0))}>
          nothing ever shrinks it
        </T>
      )}
    </Svg>
  );
}

// 4 · Confirmation matters. Two lanes take the same five pieces of writing. The top slot's caret never moves and its gap
// outline stretches; the bottom slot confirms after each piece and its caret hops to the end.
export function RevealConfirmationMatters({ t }: StepCtx) {
  const piece = (i: number) => easeOut(seg(t, 0.3 + i * 0.55, 0.6 + i * 0.55));
  const ok = (i: number) => easeOut(seg(t, 0.65 + i * 0.55, 0.85 + i * 0.55));
  const n = [0, 1, 2, 3, 4].filter((i) => ok(i) >= 1).length;
  const filled = [0, 1, 2, 3, 4].filter((i) => piece(i) > 0).length;
  const end = (k: number) => 25 + k * 86 - 6;
  return (
    <Svg label="the identical write volume, split into pieces; one consumer never confirms between pieces, the other confirms after every one." h={200}>
      <T x={25} y={24} s={11} f={C.latte}>
        never confirms
      </T>
      {[0, 1, 2, 3, 4].map((i) => (
        <rect key={i} x={25 + i * 86} y={32} width={80} height={20} rx={3} fill={C.cocoa} stroke={C.mocha} strokeWidth={1.2} opacity={piece(i)} />
      ))}
      {filled > 0 && <rect x={22} y={29} width={end(filled) - 19} height={26} rx={4} fill="none" stroke={C.cherryText} strokeWidth={1.8} />}
      <Caret x={32} y={58} k={easeOut(seg(t, 0.1, 0.4))} />
      <T x={25} y={104} s={11} f={C.latte}>
        confirms after every piece
      </T>
      {[0, 1, 2, 3, 4].map((i) => (
        <g key={i}>
          <rect x={25 + i * 86} y={112} width={80} height={20} rx={3} fill={C.cocoa} stroke={C.mocha} strokeWidth={1.2} opacity={piece(i)} />
          <MiniTick x={58 + i * 86} y={118} k={ok(i)} />
        </g>
      ))}
      <Caret x={n === 0 ? 32 : end(n)} y={138} k={easeOut(seg(t, 0.1, 0.4))} f={C.focus} />
      {t >= 3.4 && (
        <T x={25} y={185} s={13} f={C.focus} o={easeOut(seg(t, 3.4, 3.8))}>
          like a heartbeat: confirm, even with nothing new
        </T>
      )}
    </Svg>
  );
}

// 5 · Confirmation, measured. The same total writing; the never-confirmed gap draws long in cherry, the confirmed one
// barely starts.
export function RevealConfirmationMeasured({ t }: StepCtx) {
  const a = easeInOut(seg(t, 0.6, 1.8));
  const b = easeOut(seg(t, 2.0, 2.4));
  return (
    <Svg label="the real run: the same total volume, one slot's gap left unconfirmed, the other's gap left after confirming every piece." h={220}>
      <T x={25} y={24} s={11} f={C.latte}>
        same total: 5 pieces of 400 rows
      </T>
      <T x={25} y={64} s={11} f={C.cherryText} o={easeOut(seg(t, 0.4, 0.7))}>
        never confirmed
      </T>
      <rect x={25} y={74} width={480 * a} height={16} fill={C.cherryText} />
      <T x={25} y={124} s={11} f={C.focus} o={easeOut(seg(t, 1.9, 2.2))}>
        confirmed after every piece
      </T>
      <rect x={25} y={134} width={20 * b} height={16} fill={C.focus} />
      {t >= 3.2 && (
        <T x={300} y={195} s={13} f={C.focus} a="middle" o={easeOut(seg(t, 3.2, 3.6))}>
          confirming, not running, moves the marker
        </T>
      )}
    </Svg>
  );
}

// 6 · The valve. A limit bracket reaches from the slot; the WAL keeps growing past it; the oldest segments the slot
// still needed are removed. The disk is saved and the stream is broken.
export function RevealSafetyValveTrade({ t }: StepCtx) {
  const g = 14 * easeInOut(seg(t, 0.2, 2.2));
  const lim = easeOut(seg(t, 0.6, 1.0));
  const rm = (i: number) => (i < 4 ? easeOut(seg(t, 2.4 + i * 0.15, 2.7 + i * 0.15)) : 0);
  const lost = t >= 3.0;
  return (
    <Svg label="a real limit set on how much WAL a slot may keep; past it, the server may remove WAL the slot still needed." h={200}>
      {lim > 0 && <path d={`M${SEG(1) + 15} 44 v-8 h${(SEG(8) - SEG(1)) * lim} v8`} fill="none" stroke={C.latte} strokeWidth={1.8} />}
      <T x={(SEG(1) + SEG(8)) / 2 + 15} y={26} s={11} f={C.latte} a="middle" o={lim}>
        the limit
      </T>
      {Array.from({ length: 14 }, (_, i) => (
        <g key={i}>
          {rm(i) > 0 && <Hole x={SEG(i)} y={50} w={30} h={22} o={rm(i)} stroke={C.cherryText} />}
          <rect x={SEG(i)} y={50} width={30} height={22} rx={3} fill={C.cocoa} stroke={C.mocha} strokeWidth={1.2} opacity={clamp(g - i, 0, 1) * (1 - rm(i))} />
        </g>
      ))}
      <Caret x={SEG(1) + 15} y={78} k={easeOut(seg(t, 0.2, 0.5))} f={lost ? C.cherryText : C.latte} />
      <T x={25} y={104} s={11} f={lost ? C.cherryText : C.latte} o={easeOut(seg(t, 0.3, 0.6))}>
        {lost ? 'slot: its WAL is gone' : 'slot'}
      </T>
      {t >= 3.4 && (
        <g opacity={easeOut(seg(t, 3.4, 3.8))}>
          <T x={25} y={160} s={13} f={C.focus}>
            disk saved
          </T>
          <T x={300} y={160} s={13} f={C.cherryText}>
            stream broken
          </T>
        </g>
      )}
    </Svg>
  );
}

// 7 · Lost slot, measured. The setting flips from -1 to 1MB; writes run past it; wal_status flips from reserved to
// lost; a read from the slot is refused by the database itself.
export function RevealLostSlotMeasured({ t }: StepCtx) {
  const set = t >= 0.6;
  const w = easeInOut(seg(t, 1.0, 2.3));
  const lost = t >= 2.5;
  const rd = easeOut(seg(t, 3.0, 3.5));
  return (
    <Svg label="the real run: the limit set, enough writes to exceed it, the slot's own status read before and after." h={220}>
      <Cell x={25} y={24} w={320} label={set ? 'max_slot_wal_keep_size: 1MB' : 'max_slot_wal_keep_size: -1'} stroke={set ? C.second : C.mocha} />
      <Row y={86} label="wal_status" value={lost ? 'lost' : 'reserved'} valueColor={lost ? C.cherryText : C.focus} k={easeOut(seg(t, 0.4, 0.8))} />
      <rect x={25} y={104} width={520 * w} height={6} fill={C.latte} />
      <Cell x={25} y={140} w={170} label="read from slot" o={easeOut(seg(t, 2.8, 3.1))} />
      <Req x1={200} x2={380} y={154} k={rd} f={C.cherryText} />
      <Cross x={395} y={154} k={easeOut(seg(t, 3.5, 3.8))} />
      {t >= 3.6 && (
        <T x={25} y={205} s={13} f={C.cherryText} o={easeOut(seg(t, 3.6, 4.0))}>
          can no longer get changes
        </T>
      )}
    </Svg>
  );
}

// 8 · Recap. The three facts as rows; then the dashboard's status tile, crossed out: it shows none of them.
export function Recap({ t }: StepCtx) {
  const facts = ['no reader: the log stays pinned', 'only a confirmed read frees it', 'the valve: a full disk or a broken stream'];
  const d = easeOut(seg(t, 2.6, 3.0));
  return (
    <Svg label="a slot pinning WAL regardless of connector health, confirmation as the only thing that moves the marker, and the valve's own trade." h={260}>
      {facts.map((f, i) => (
        <Cell key={i} x={25} y={24 + i * 48} w={530} label={f} o={easeOut(seg(t, 0.2 + i * 0.6, 0.6 + i * 0.6))} />
      ))}
      <Cell x={25} y={184} w={200} label="connector status" o={d} />
      <Cross x={245} y={198} k={easeOut(seg(t, 3.0, 3.3))} />
      {t >= 3.3 && (
        <T x={265} y={203} s={13} f={C.cherryText} o={easeOut(seg(t, 3.3, 3.7))}>
          shows none of them
        </T>
      )}
    </Svg>
  );
}

// 9 · Prove it. Connector status runs flat; the retained gap climbs. Once answered, a threshold line crosses the gap's
// climb: alert there.
export function ProveIt({ t, answer }: StepCtx) {
  const s = useSinceAnswer(answer !== null);
  const v = answer !== null ? easeOut(seg(s, 0.2, 0.8)) : 0;
  const g = easeInOut(seg(t, 0.4, 1.6));
  return (
    <Svg label="none of this gave a number worth alerting on before the disk was already in trouble. What should trigger the alarm?" h={200}>
      <T x={25} y={24} s={11} f={C.latte}>
        connector status
      </T>
      <line x1={25} y1={70} x2={25 + 235 * g} y2={70} stroke={C.focus} strokeWidth={2.5} />
      <T x={300} y={24} s={11} f={C.latte}>
        retained WAL gap
      </T>
      <line x1={300} y1={110} x2={300 + 245 * g} y2={110 - 70 * g} stroke={C.cherryText} strokeWidth={2.5} />
      {v > 0 && <line x1={300} y1={70} x2={300 + 245 * v} y2={70} stroke={C.focus} strokeWidth={1.5} strokeDasharray="5 4" />}
      {v > 0 && (
        <T x={300} y={135} s={11} f={C.focus} o={v}>
          alert on this line
        </T>
      )}
      <AnswerRow y={178} label="alarm on" answer={answer} value="the retained gap" k={easeOut(seg(t, 1.6, 2.2))} />
    </Svg>
  );
}
