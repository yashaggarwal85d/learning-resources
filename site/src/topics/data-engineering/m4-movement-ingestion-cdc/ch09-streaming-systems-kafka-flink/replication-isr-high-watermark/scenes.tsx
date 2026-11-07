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

/** A row of `n` record pips from x at y; `fill(i)` gives each pip's colour, or null for an empty outline. */
function Pips({ x, y, n, gap = 22, fill, o = 1 }: { x: number; y: number; n: number; gap?: number; fill: (i: number) => string | null; o?: number }) {
  return (
    <g opacity={o}>
      {Array.from({ length: n }, (_, i) => {
        const f = fill(i);
        return <rect key={i} x={x + i * gap} y={y} width={16} height={14} rx={2} fill={f ?? C.cocoa} stroke={f ?? C.mocha} strokeWidth={1} />;
      })}
    </g>
  );
}

/** A replica's log as a bar from x0 growing to `w`, with a tick at its end. */
function LogBar({ x0, y, w, f = C.latte, h = 20 }: { x0: number; y: number; w: number; f?: string; h?: number }) {
  return (
    <g>
      <rect x={x0} y={y} width={Math.max(0, w)} height={h} rx={3} fill={f} opacity={0.55} />
      {w > 2 && <line x1={x0 + w} y1={y - 5} x2={x0 + w} y2={y + h + 5} stroke={f} strokeWidth={2} />}
    </g>
  );
}

// 0 · Hook. Two toy crashes. Leader-only acks: ten records called safe, the follower holds three; the crash takes the
// rest, in cherry. Full in-sync acks: only the three the follower holds were ever called safe; nothing is lost.
export function Hook({ t }: StepCtx) {
  const runs: [string, number, boolean][] = [
    ['leader-only ack', 0.2, false],
    ['full in-sync ack', 2.2, true],
  ];
  return (
    <Svg label="a real toy leader crash — records one acknowledgement choice believed were safe, against records the other choice believed were safe" h={200}>
      {runs.map(([name, k0, full], r) => {
        const y = 40 + r * 80;
        const crash = easeOut(seg(t, k0 + 1.0, k0 + 1.3));
        return (
          <g key={name}>
            <T x={25} y={y - 10} s={12} f={C.crema} o={easeOut(seg(t, k0, k0 + 0.3))}>
              {name}
            </T>
            <Pips x={25} y={y} n={10} o={easeOut(seg(t, k0 + 0.1, k0 + 0.5))} fill={(i) => (i < 3 ? (full ? C.focus : C.latte) : full ? null : crash > 0 ? C.cherryText : C.latte)} />
            <rect x={25} y={y + 20} width={60 * easeOut(seg(t, k0 + 0.4, k0 + 0.7))} height={4} rx={1} fill={C.second} />
            <Cross x={250} y={y + 7} k={crash} />
            <T x={550} y={y + 12} s={12} f={full ? C.focus : C.cherryText} a="end" o={easeOut(seg(t, k0 + 1.3, k0 + 1.6))}>
              {full ? 'none lost' : 'mostly lost'}
            </T>
          </g>
        );
      })}
      <T x={25} y={190} s={11} f={C.second} o={easeOut(seg(t, 0.6, 0.9))}>
        blue: what the follower already holds
      </T>
    </Svg>
  );
}

const RX = (pos: number) => 200 + pos * 1.6;

// 1 · Setup. Three logs grow along one ruler and stop at three different marks.
export function Setup({ t }: StepCtx) {
  const reps: [string, number][] = [
    ['leader', 200],
    ['follower A', 180],
    ['follower B', 150],
  ];
  return (
    <Svg label="a leader and its followers, each at a different position on a shared ruler" h={200}>
      {reps.map(([n, p], i) => (
        <g key={n}>
          <T x={25} y={50 + i * 45} s={12} f={C.crema} o={easeOut(seg(t, 0.1 + i * 0.2, 0.4 + i * 0.2))}>
            {n}
          </T>
          <LogBar x0={200} y={36 + i * 45} w={(RX(p) - 200) * easeInOut(seg(t, 0.6 + i * 0.3, 2.4 + i * 0.3))} f={i === 0 ? C.focus : C.latte} />
        </g>
      ))}
      <line x1={200} y1={176} x2={520} y2={176} stroke={C.mocha} strokeWidth={1.2} opacity={easeOut(seg(t, 0.3, 0.6))} />
      {[0, 1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
        <line key={i} x1={200 + i * 40} y1={172} x2={200 + i * 40} y2={180} stroke={C.mocha} strokeWidth={1} opacity={easeOut(seg(t, 0.3, 0.6))} />
      ))}
      <T x={200} y={196} s={11} f={C.latte} o={easeOut(seg(t, 3.4, 3.8))}>
        one ruler, three different marks
      </T>
    </Svg>
  );
}

// 2 · Predict. The three marks; a dashed line flickers between the candidates. On answer it settles on the slowest
// in-sync mark.
export function PredictHW({ t, answer }: StepCtx) {
  const s = useSinceAnswer(answer !== null);
  const v = answer !== null ? easeInOut(seg(s, 0.1, 0.7)) : 0;
  const ends = [RX(200), RX(180), RX(150)];
  return (
    <Svg label="the leader furthest along the ruler, followers trailing — which position is the committed one?" h={200}>
      {['leader', 'follower A', 'follower B'].map((n, i) => (
        <g key={n}>
          <T x={25} y={44 + i * 36} s={12} f={C.crema} o={easeOut(seg(t, 0, 0.3))}>
            {n}
          </T>
          <LogBar x0={200} y={30 + i * 36} w={(ends[i] - 200) * easeOut(seg(t, 0.1, 0.6))} h={18} f={i === 0 ? C.focus : C.latte} />
        </g>
      ))}
      {answer === null ? (
        ends.map((x, i) => <line key={i} x1={x} y1={22} x2={x} y2={136} stroke={C.mocha} strokeWidth={1.2} strokeDasharray="3 3" opacity={easeOut(seg(t, 0.7 + i * 0.15, 1.0 + i * 0.15))} />)
      ) : (
        <line x1={lerp(RX(200), RX(150), v)} y1={22} x2={lerp(RX(200), RX(150), v)} y2={136} stroke={C.focus} strokeWidth={2} strokeDasharray="5 3" />
      )}
      <AnswerRow y={182} label="committed line" answer={answer} value="the slowest in-sync" k={easeOut(seg(t, 1.6, 2.2))} />
    </Svg>
  );
}

// 3 · High watermark. The three logs grow to two hundred, one eighty, one fifty; the committed line slides in from the
// leader's end and stops at the slowest one; a cherry bracket marks the gap a crash exposes.
export function RevealHW({ t }: StepCtx) {
  const reps: [string, number][] = [
    ['leader: two hundred', 200],
    ['fast: one eighty', 180],
    ['slow: one fifty', 150],
  ];
  const line = easeInOut(seg(t, 2.4, 3.2));
  const lx = lerp(RX(200), RX(150), line);
  const gap = easeOut(seg(t, 3.4, 3.8));
  return (
    <Svg label="the leader's own tick, each follower's tick, and the line sitting at the slowest one" h={260}>
      {reps.map(([n, p], i) => (
        <g key={n}>
          <T x={25} y={54 + i * 50} s={11} f={i === 2 ? C.focus : C.crema} o={easeOut(seg(t, 0.1 + i * 0.3, 0.4 + i * 0.3))}>
            {n}
          </T>
          <LogBar x0={200} y={40 + i * 50} w={(RX(p) - 200) * easeInOut(seg(t, 0.3 + i * 0.3, 1.6 + i * 0.3))} f={i === 0 ? C.focus : C.latte} />
        </g>
      ))}
      {line > 0 && <line x1={lx} y1={28} x2={lx} y2={176} stroke={C.focus} strokeWidth={2} strokeDasharray="5 3" />}
      <T x={RX(150)} y={196} s={11} f={C.focus} a="middle" o={easeOut(seg(t, 3.1, 3.4))}>
        committed: one fifty
      </T>
      <path d={`M${RX(150)} 208 v6 h${(RX(200) - RX(150)) * gap} v-6`} fill="none" stroke={C.cherryText} strokeWidth={1.5} />
      <T x={470} y={236} s={11} f={C.cherryText} a="middle" o={gap}>
        the gap a crash exposes
      </T>
    </Svg>
  );
}

// 4 · Predict. A restarted follower holds two messages; its recorded line sits after the first. On answer an epoch-end
// marker appears after the second, and the follower's question goes to the leader.
export function PredictTruncation({ t, answer }: StepCtx) {
  const s = useSinceAnswer(answer !== null);
  const v = answer !== null ? easeOut(seg(s, 0.1, 0.6)) : 0;
  return (
    <Svg label="a restarted follower holding more than its own recorded line says is safe — trust the line, or ask for something else?" h={200}>
      <T x={25} y={58} s={12} f={C.crema} o={easeOut(seg(t, 0, 0.3))}>
        follower
      </T>
      <Cell x={110} y={40} w={100} label="message 1" o={easeOut(seg(t, 0.1, 0.4))} />
      <Cell x={220} y={40} w={100} label="message 2" o={easeOut(seg(t, 0.3, 0.6))} />
      <line x1={215} y1={30} x2={215} y2={80} stroke={C.cherryText} strokeWidth={1.5} strokeDasharray="4 3" opacity={easeOut(seg(t, 0.6, 0.9))} />
      <T x={215} y={98} s={11} f={C.cherryText} a="middle" o={easeOut(seg(t, 0.6, 0.9))}>
        recorded line
      </T>
      <line x1={325} y1={30} x2={325} y2={80} stroke={C.second} strokeWidth={2} opacity={v} />
      {v > 0 && (
        <T x={330} y={118} s={11} f={C.second} a="middle" o={v}>
          epoch end
        </T>
      )}
      <Req x1={340} x2={415} y={54} k={v} label="asks" f={C.second} />
      <Cell x={425} y={40} w={125} label="leader" o={easeOut(seg(t, 0.4, 0.7))} />
      <AnswerRow y={178} label="trust the line?" answer={answer} value="no, ask for epoch end" k={easeOut(seg(t, 1.6, 2.2))} />
    </Svg>
  );
}

// 5 · Truncation, played out. Cut at the recorded line: message 2 falls away in cherry. Cut at the epoch end: both stay.
export function RevealTruncation({ t }: StepCtx) {
  const fall = easeInOut(seg(t, 1.4, 2.0));
  return (
    <Svg label="the same two-message log, truncated two ways — one drops the second message, one keeps it" h={200}>
      <T x={25} y={30} s={11} f={C.latte} o={easeOut(seg(t, 0, 0.3))}>
        cut at the recorded line
      </T>
      <Cell x={25} y={40} w={110} label="message 1" o={easeOut(seg(t, 0.1, 0.4))} />
      {fall < 1 && <Cell x={145} y={lerp(40, 70, fall)} w={110} label="message 2" o={easeOut(seg(t, 0.2, 0.5)) * (1 - fall)} stroke={fall > 0 ? C.cherryText : C.mocha} />}
      <line x1={140} y1={32} x2={140} y2={76} stroke={C.cherryText} strokeWidth={2} opacity={easeOut(seg(t, 0.8, 1.1))} />
      <T x={550} y={58} s={12} f={C.cherryText} a="end" o={easeOut(seg(t, 2.0, 2.3))}>
        message 2 dropped
      </T>
      <T x={25} y={120} s={11} f={C.latte} o={easeOut(seg(t, 2.5, 2.8))}>
        cut at the epoch end
      </T>
      <Cell x={25} y={130} w={110} label="message 1" o={easeOut(seg(t, 2.6, 2.9))} />
      <Cell x={145} y={130} w={110} label="message 2" o={easeOut(seg(t, 2.7, 3.0))} stroke={t > 3.6 ? C.focus : C.mocha} />
      <line x1={260} y1={122} x2={260} y2={166} stroke={C.second} strokeWidth={2} opacity={easeOut(seg(t, 3.1, 3.4))} />
      <T x={550} y={148} s={12} f={C.focus} a="end" o={easeOut(seg(t, 3.6, 3.9))}>
        message 2 kept
      </T>
    </Svg>
  );
}

// 6 · Predict. Two followers drop out of the in-sync set; the leader stands alone as writes arrive. On answer they are
// taken in anyway.
export function PredictLastStanding({ t, answer }: StepCtx) {
  const s = useSinceAnswer(answer !== null);
  const v = answer !== null ? easeOut(seg(s, 0.1, 0.8)) : 0;
  const out = easeInOut(seg(t, 0.4, 1.0));
  return (
    <Svg label="only one replica left in sync — does it keep accepting writes meant to wait for every in-sync replica?" h={200}>
      <rect x={300} y={24} width={250} height={lerp(124, 44, out)} rx={6} fill="none" stroke={C.second} strokeWidth={1.5} strokeDasharray="5 3" opacity={easeOut(seg(t, 0, 0.3))} />
      <Cell x={315} y={32} w={220} label="leader" o={easeOut(seg(t, 0, 0.3))} stroke={C.focus} />
      {[0, 1].map((i) => (
        <Cell key={i} x={lerp(315, 335, out)} y={lerp(72 + i * 40, 92 + i * 40, out)} w={200} label="follower" o={1 - 0.6 * out} />
      ))}
      {[0, 1, 2].map((i) => {
        const p = answer !== null ? easeInOut(seg(s, 0.1 + i * 0.15, 0.6 + i * 0.15)) : 0;
        return <rect key={i} x={lerp(25 + i * 24, 280, p)} y={39} width={14} height={14} rx={2} fill={C.latte} opacity={easeOut(seg(t, 1.1, 1.4)) * (p >= 1 ? 0 : 1)} />;
      })}
      {v > 0 && (
        <T x={25} y={90} s={11} f={C.latte} o={v}>
          still accepted
        </T>
      )}
      <AnswerRow y={182} label="writes accepted?" answer={answer} value="yes, classically" k={easeOut(seg(t, 1.6, 2.2))} />
    </Svg>
  );
}

// 7 · Last standing, run. Not-empty rule: writes during the shrink are taken in, then the lone replica fails and they
// turn cherry. Minimum-checked rule: the same writes hit a closed gate; none are taken, none are lost.
export function RevealLastStanding({ t }: StepCtx) {
  const rows: [string, number, boolean][] = [
    ['not-empty rule', 0.2, false],
    ['minimum-checked rule', 2.4, true],
  ];
  return (
    <Svg label="writes made while the in-sync set is shrunk, later lost, under two different rules for moving the line" h={200}>
      {rows.map(([name, k0, gate], r) => {
        const y = 40 + r * 80;
        const go = easeInOut(seg(t, k0 + 0.4, k0 + 1.1));
        const fail = easeOut(seg(t, k0 + 1.3, k0 + 1.6));
        return (
          <g key={name}>
            <T x={25} y={y - 10} s={11} f={C.latte} o={easeOut(seg(t, k0, k0 + 0.3))}>
              {name}
            </T>
            <Cell x={260} y={y} w={140} label="lone replica" o={easeOut(seg(t, k0, k0 + 0.3))} stroke={!gate && fail > 0 ? C.cherryText : C.mocha} />
            {[0, 1, 2].map((i) => {
              const x = gate ? lerp(25 + i * 24, 180 + i * 18, go) : lerp(25 + i * 24, 415 + i * 20, go);
              const lost = !gate && fail > 0;
              return (
                <rect
                  key={i}
                  x={x}
                  y={y + 7}
                  width={14}
                  height={14}
                  rx={2}
                  fill={lost ? C.cherryText : C.latte}
                  opacity={easeOut(seg(t, k0 + 0.2, k0 + 0.4)) * (gate || go < 0.55 || go > 0.97 ? 1 : 0)}
                />
              );
            })}
            {gate && <line x1={245} y1={y - 4} x2={245} y2={y + 32} stroke={C.focus} strokeWidth={3} opacity={easeOut(seg(t, k0 + 0.2, k0 + 0.4))} />}
            {!gate && <Cross x={530} y={y + 14} k={fail} />}
            <T x={25} y={y + 52} s={12} f={gate ? C.focus : C.cherryText} o={easeOut(seg(t, k0 + 1.6, k0 + 1.9))}>
              {gate ? 'none taken, none lost' : 'taken, then every one lost'}
            </T>
          </g>
        );
      })}
    </Svg>
  );
}

// 8 · Prove it. The run's results, one by one, each sliding up into place.
export function ProveIt({ t }: StepCtx) {
  return (
    <Svg label="every number from this reel, read straight off the real run of examples.py just now" h={260}>
      <Row y={50} label="committed line" value="one fifty" valueColor={C.focus} k={easeOut(seg(t, 0.2, 0.7))} />
      <Row y={95} label="recorded-line cut" value="message dropped" valueColor={C.cherryText} k={easeOut(seg(t, 1.0, 1.5))} />
      <Row y={140} label="epoch-marker cut" value="message kept" valueColor={C.focus} k={easeOut(seg(t, 1.8, 2.3))} />
      <Row y={185} label="shrink-window loss" value="some vs none" k={easeOut(seg(t, 2.6, 3.1))} />
      <Tick y={222} k={easeOut(seg(t, 3.5, 4.0))} />
    </Svg>
  );
}

// 9 · Recap. Three lines, one by one; the checked minimum outlined.
export function Recap({ t }: StepCtx) {
  const rows = ['committed line: the slowest in-sync replica', 'truncation: ask for the epoch end', 'the in-sync minimum: checked, not assumed'];
  return (
    <Svg label="a replica column racing toward a line that only moves at the slowest in-sync pace, a truncation marker, and a checked minimum" h={260}>
      {rows.map((r, i) => {
        const k = easeOut(seg(t, 0.3 + i * 1.1, 0.8 + i * 1.1));
        return <Cell key={i} x={25} y={lerp(30, 40, k) + i * 60} w={530} label={r} o={k} stroke={i === 2 ? C.focus : C.mocha} />;
      })}
    </Svg>
  );
}
