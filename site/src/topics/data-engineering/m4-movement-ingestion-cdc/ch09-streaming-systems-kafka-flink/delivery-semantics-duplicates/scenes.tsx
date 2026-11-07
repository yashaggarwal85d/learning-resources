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

/** A lightning-bolt crash mark at (x, y), drawn in by `k`. */
function Bolt({ x, y, k }: { x: number; y: number; k: number }) {
  return <path d={`M${x + 4} ${y - 12} l-8 12 h7 l-5 12 l11 -15 h-7 l5 -9 z`} fill={C.cherryText} opacity={k} />;
}

/** A pip travelling from (x1, y1) to (x2, y2) while 0 < p < 1. */
function Pip({ x1, y1, x2, y2, p, f = C.latte }: { x1: number; y1: number; x2: number; y2: number; p: number; f?: string }) {
  if (p <= 0 || p >= 1) return null;
  return <rect x={lerp(x1, x2, p) - 6} y={lerp(y1, y2, p) - 6} width={12} height={12} rx={2} fill={f} />;
}

// 0 · Hook. Two mini-timelines. Producer side: send, commit, the ack lost to a bolt, a resend, two copies. Consumer
// side: process, effect, a bolt before the commit, the same record again, two effects.
export function Hook({ t }: StepCtx) {
  const lines: [string, string, number][] = [
    ['producer side', 'duplicate payment', 0.2],
    ['consumer side', 'duplicate order', 2.2],
  ];
  return (
    <Svg label="two parallel mini-timelines, one per crash window, each marked by a lightning-bolt crash icon" h={200}>
      {lines.map(([name, out, k0], r) => {
        const y = 50 + r * 80;
        const draw = easeInOut(seg(t, k0 + 0.1, k0 + 1.4));
        return (
          <g key={name}>
            <T x={25} y={y - 14} s={11} f={C.latte} o={easeOut(seg(t, k0, k0 + 0.3))}>
              {name}
            </T>
            <line x1={25} y1={y} x2={lerp(25, 380, draw)} y2={y} stroke={C.mocha} strokeWidth={1.5} />
            {[0.15, 0.55, 0.85].map((f, i) => (
              <circle key={i} cx={25 + 355 * f} cy={y} r={6} fill={i === 2 ? C.cherryText : C.latte} opacity={draw >= f ? 1 : 0} />
            ))}
            <Bolt x={25 + 355 * 0.35} y={y} k={draw >= 0.35 ? 1 : 0} />
            <T x={550} y={y + 5} s={12} f={C.cherryText} a="end" o={easeOut(seg(t, k0 + 1.4, k0 + 1.7))}>
              {out}
            </T>
          </g>
        );
      })}
      <T x={25} y={190} s={11} f={C.latte} o={easeOut(seg(t, 4.0, 4.4))}>
        two moments, one shape
      </T>
    </Svg>
  );
}

// 1 · Setup. Three promises, each a count of how many times the effect lands: at most once, at least once, exactly
// once, drawn as effect pips.
export function Setup({ t }: StepCtx) {
  const rows: [string, number[], string][] = [
    ['at-most-once', [0, 1], 'zero or one'],
    ['at-least-once', [1, 2], 'one or more'],
    ['exactly-once', [1], 'exactly one'],
  ];
  return (
    <Svg label="three semantics, stated as promises about the effect, not the delivery attempt" h={200}>
      <T x={25} y={24} s={11} f={C.latte} o={easeOut(seg(t, 0, 0.3))}>
        counted: how many times the effect lands
      </T>
      {rows.map(([name, counts, words], i) => {
        const y = 56 + i * 46;
        const k = easeOut(seg(t, 0.4 + i * 0.9, 0.8 + i * 0.9));
        const n = Math.max(...counts);
        return (
          <g key={name} opacity={k}>
            <T x={25} y={y} s={12} f={i === 2 ? C.focus : C.crema}>
              {name}
            </T>
            {Array.from({ length: n }, (_, j) => (
              <rect
                key={j}
                x={lerp(190, 200, k) + j * 22}
                y={y - 12}
                width={16}
                height={14}
                rx={2}
                fill={i === 2 ? C.focus : C.latte}
                stroke={j >= Math.min(...counts) ? C.latte : 'none'}
                fillOpacity={j >= Math.min(...counts) ? 0 : 1}
              />
            ))}
            <T x={300} y={y} s={11} f={C.latte}>
              {words}
            </T>
          </g>
        );
      })}
      <T x={25} y={190} s={11} f={C.latte} o={easeOut(seg(t, 3.4, 3.8))}>
        not how many times it was attempted
      </T>
    </Svg>
  );
}

// 2 · Predict. A batch travels to the broker and lands; the ack heads back and a bolt stops it. On answer a resend
// travels out and a second copy lands in cherry.
export function PredictProducerRetry({ t, answer }: StepCtx) {
  const s = useSinceAnswer(answer !== null);
  const v = answer !== null ? seg(s, 0.1, 0.7) : 0;
  return (
    <Svg label="a batch is sent, the broker commits it, the ack is lost on the way back" h={200}>
      <Cell x={25} y={50} w={120} label="producer" o={easeOut(seg(t, 0, 0.3))} />
      <rect x={390} y={40} width={160} height={50} rx={5} fill="none" stroke={C.mocha} strokeWidth={1.3} opacity={easeOut(seg(t, 0.1, 0.4))} />
      <T x={390} y={108} s={11} f={C.latte} o={easeOut(seg(t, 0.1, 0.4))}>
        broker log
      </T>
      <Pip x1={155} y1={58} x2={395} y2={58} p={seg(t, 0.2, 0.6)} />
      <rect x={400} y={58} width={14} height={14} rx={2} fill={C.latte} opacity={t >= 0.6 ? 1 : 0} />
      <Pip x1={385} y1={82} x2={270} y2={82} p={seg(t, 0.7, 1.0)} f={C.second} />
      <Bolt x={265} y={82} k={easeOut(seg(t, 1.0, 1.2))} />
      <Pip x1={155} y1={58} x2={395} y2={58} p={v} />
      <rect x={422} y={58} width={14} height={14} rx={2} fill={C.cherryText} opacity={v >= 1 ? 1 : 0} />
      <AnswerRow y={178} label="the producer" answer={answer} value="retries: a duplicate" k={easeOut(seg(t, 1.6, 2.2))} />
    </Svg>
  );
}

// 3 · Producer retry. No ack comes back; the producer resends; the broker writes a second copy beside the first.
// With idempotence turned on, the same resend is recognised and dropped.
export function RevealProducerRetry({ t }: StepCtx) {
  return (
    <Svg label="seeing no ack, the producer retries — without idempotence, the retry duplicates the write" h={200}>
      {[0, 1].map((r) => {
        const y = 40 + r * 80;
        const k0 = 0.3 + r * 2.0;
        const p1 = seg(t, k0, k0 + 0.5);
        const p2 = seg(t, k0 + 0.8, k0 + 1.3);
        return (
          <g key={r}>
            <T x={25} y={y - 8} s={11} f={C.latte} o={easeOut(seg(t, k0 - 0.2, k0))}>
              {r === 0 ? 'no idempotence' : 'idempotence on'}
            </T>
            <Cell x={25} y={y} w={120} label="producer" o={easeOut(seg(t, k0 - 0.2, k0))} />
            <rect x={390} y={y} width={160} height={30} rx={5} fill="none" stroke={C.mocha} strokeWidth={1.3} opacity={easeOut(seg(t, k0 - 0.2, k0))} />
            <Pip x1={155} y1={y + 15} x2={395} y2={y + 15} p={p1} />
            <rect x={400} y={y + 8} width={14} height={14} rx={2} fill={C.latte} opacity={p1 >= 1 ? 1 : 0} />
            <Pip x1={155} y1={y + 15} x2={395} y2={y + 15} p={p2} f={r === 0 ? C.cherryText : C.second} />
            {r === 0 ? <rect x={422} y={y + 8} width={14} height={14} rx={2} fill={C.cherryText} opacity={p2 >= 1 ? 1 : 0} /> : <Cross x={380} y={y + 15} k={easeOut(seg(t, k0 + 1.3, k0 + 1.5))} />}
            <T x={550} y={y + 48} s={11} f={r === 0 ? C.cherryText : C.focus} a="end" o={easeOut(seg(t, k0 + 1.3, k0 + 1.6))}>
              {r === 0 ? 'a second copy lands' : 'recognised, dropped'}
            </T>
          </g>
        );
      })}
    </Svg>
  );
}

// 4 · Predict. A consumer reads a record, writes its effect to the sink, and a bolt strikes before the offset commit.
// On answer the restart's cursor points back at the same record.
export function PredictConsumerCrash({ t, answer }: StepCtx) {
  const s = useSinceAnswer(answer !== null);
  const v = answer !== null ? easeInOut(seg(s, 0.1, 0.6)) : 0;
  return (
    <Svg label="a consumer processes a record, writes its effect, and crashes before committing its offset" h={200}>
      {[0, 1, 2, 3, 4].map((i) => (
        <rect key={i} x={25 + i * 30} y={50} width={22} height={14} rx={2} fill={i === 2 ? C.focus : C.latte} opacity={easeOut(seg(t, 0, 0.3))} />
      ))}
      <path d={`M${lerp(106, 81, v)} 84 l6 -10 l6 10 z`} fill={v > 0 ? C.cherryText : C.focus} opacity={easeOut(seg(t, 0.2, 0.4))} />
      <Req x1={180} x2={370} y={57} k={easeOut(seg(t, 0.4, 0.8))} label="effect written" />
      <Cell x={380} y={43} w={170} label="sink" o={easeOut(seg(t, 0.3, 0.6))} />
      <Bolt x={240} y={110} k={easeOut(seg(t, 0.9, 1.1))} />
      <T x={260} y={115} s={11} f={C.cherryText} o={easeOut(seg(t, 1.0, 1.3))}>
        before the offset commit
      </T>
      <AnswerRow y={178} label="on restart" answer={answer} value="the same record again" k={easeOut(seg(t, 1.6, 2.2))} />
    </Svg>
  );
}

// 5 · Consumer crash. The cursor sits at the old saved offset; it reads the record again; a second effect pip lands in
// the sink in cherry.
export function RevealConsumerCrash({ t }: StepCtx) {
  const again = seg(t, 1.6, 2.3);
  return (
    <Svg label="on restart, the consumer starts from the old offset and reprocesses the same record" h={200}>
      {[0, 1, 2, 3, 4].map((i) => (
        <rect key={i} x={25 + i * 30} y={50} width={22} height={14} rx={2} fill={i === 2 ? C.focus : C.latte} opacity={easeOut(seg(t, 0, 0.3))} />
      ))}
      <path d="M81 84 l6 -10 l6 10 z" fill={C.cherryText} opacity={easeOut(seg(t, 0.3, 0.6))} />
      <T x={25} y={106} s={11} f={C.latte} o={easeOut(seg(t, 0.5, 0.8))}>
        restart: the last saved offset
      </T>
      <Cell x={380} y={43} w={170} label="sink" o={easeOut(seg(t, 0.1, 0.4))} />
      <rect x={390} y={84} width={14} height={14} rx={2} fill={C.latte} opacity={easeOut(seg(t, 0.2, 0.5))} />
      <Pip x1={185} y1={57} x2={372} y2={57} p={again} f={C.cherryText} />
      <rect x={412} y={84} width={14} height={14} rx={2} fill={C.cherryText} opacity={again >= 1 ? 1 : 0} />
      <T x={380} y={124} s={11} f={C.cherryText} o={easeOut(seg(t, 2.4, 2.8))}>
        the effect, a second time
      </T>
    </Svg>
  );
}

// 6 · Incomplete claim. The pipeline's middle sits in a focus box, outlined as handled; the sink's door at the end is
// not; a duplicate slips through it, in cherry.
export function RevealIncompleteClaim({ t }: StepCtx) {
  const slip = seg(t, 2.4, 3.2);
  return (
    <Svg label="the broker's own guarantee stops at the sink's own door" h={200}>
      <rect x={25} y={40} width={340} height={60} rx={6} fill="none" stroke={C.focus} strokeWidth={1.5} strokeDasharray="5 3" opacity={easeOut(seg(t, 0.4, 0.8))} />
      <Cell x={40} y={56} w={140} label="producer" o={easeOut(seg(t, 0, 0.3))} />
      <Cell x={210} y={56} w={140} label="broker" o={easeOut(seg(t, 0.1, 0.4))} />
      <T x={35} y={122} s={11} f={C.focus} o={easeOut(seg(t, 0.8, 1.1))}>
        the middle: behaving perfectly
      </T>
      <Cell x={410} y={56} w={140} label="sink" o={easeOut(seg(t, 1.2, 1.5))} stroke={slip >= 1 ? C.cherryText : C.mocha} />
      <line x1={405} y1={46} x2={405} y2={94} stroke={C.cherryText} strokeWidth={2} strokeDasharray="3 3" opacity={easeOut(seg(t, 1.5, 1.8))} />
      <Pip x1={360} y1={110} x2={470} y2={110} p={slip} f={C.cherryText} />
      <T x={410} y={150} s={11} f={C.cherryText} o={easeOut(seg(t, 3.2, 3.6))}>
        no repeat check here
      </T>
      <T x={25} y={190} s={11} f={C.latte} o={easeOut(seg(t, 3.8, 4.2))}>
        a claim is only as good as the boundary it names
      </T>
    </Svg>
  );
}

// 7 · Effect count. The same crash, three promises: zero effect pips, two pips (the second cherry), exactly one.
export function RevealEffectCount({ t }: StepCtx) {
  const rows: [string, number, string][] = [
    ['at-most-once', 0, 'zero effects'],
    ['at-least-once', 2, 'two effects'],
    ['exactly-once', 1, 'one effect'],
  ];
  return (
    <Svg label="the same crash, counted three different ways depending on which semantics applied" h={200}>
      <Bolt x={30} y={30} k={easeOut(seg(t, 0, 0.3))} />
      <T x={48} y={34} s={11} f={C.latte} o={easeOut(seg(t, 0.1, 0.4))}>
        the same crash, three times
      </T>
      {rows.map(([name, n, words], i) => {
        const y = 80 + i * 45;
        const k0 = 0.6 + i * 1.1;
        return (
          <g key={name}>
            <T x={25} y={y} s={12} f={i === 2 ? C.focus : C.crema} o={easeOut(seg(t, k0, k0 + 0.3))}>
              {name}
            </T>
            {n === 0 && <rect x={200} y={y - 12} width={16} height={14} rx={2} fill="none" stroke={C.mocha} strokeDasharray="3 2" opacity={easeOut(seg(t, k0 + 0.3, k0 + 0.6))} />}
            {Array.from({ length: n }, (_, j) => (
              <rect
                key={j}
                x={200 + j * 22}
                y={lerp(y - 22, y - 12, easeOut(seg(t, k0 + 0.3 + j * 0.2, k0 + 0.6 + j * 0.2)))}
                width={16}
                height={14}
                rx={2}
                fill={j === 1 ? C.cherryText : i === 2 ? C.focus : C.latte}
                opacity={easeOut(seg(t, k0 + 0.3 + j * 0.2, k0 + 0.6 + j * 0.2))}
              />
            ))}
            <T x={550} y={y} s={12} f={i === 2 ? C.focus : i === 1 ? C.cherryText : C.latte} a="end" o={easeOut(seg(t, k0 + 0.7, k0 + 1.0))}>
              {words}
            </T>
          </g>
        );
      })}
    </Svg>
  );
}

// 8 · Prove it. The run's results, one by one.
export function ProveIt({ t }: StepCtx) {
  return (
    <Svg label="this topic's own real run, every number read straight off it" h={260}>
      <Row y={50} label="producer retry" value="duplicate confirmed" valueColor={C.cherryText} k={easeOut(seg(t, 0.2, 0.7))} />
      <Row y={95} label="consumer crash" value="reprocess confirmed" valueColor={C.cherryText} k={easeOut(seg(t, 1.0, 1.5))} />
      <Row y={140} label="effect count" value="zero, two, one" valueColor={C.focus} k={easeOut(seg(t, 1.8, 2.3))} />
      <Tick y={176} k={easeOut(seg(t, 2.8, 3.3))} />
    </Svg>
  );
}

// 9 · Recap. Three lines, one by one; the boundary line outlined.
export function Recap({ t }: StepCtx) {
  const rows = ['three semantics: counts of the effect', 'two crash windows: producer and consumer', 'exactly-once names a boundary'];
  return (
    <Svg label="three semantics, two crash windows, and why exactly-once names a boundary, not a broker feature" h={260}>
      {rows.map((r, i) => {
        const k = easeOut(seg(t, 0.3 + i * 1.1, 0.8 + i * 1.1));
        return <Cell key={i} x={25} y={lerp(30, 40, k) + i * 60} w={530} label={r} o={k} stroke={i === 2 ? C.focus : C.mocha} />;
      })}
    </Svg>
  );
}
