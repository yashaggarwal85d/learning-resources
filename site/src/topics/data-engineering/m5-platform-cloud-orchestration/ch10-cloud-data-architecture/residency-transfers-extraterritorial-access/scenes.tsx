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

/** A small bytes grid at (x, y): six pips, two rows. */
function Bytes({ x, y, o = 1, f = C.second }: { x: number; y: number; o?: number; f?: string }) {
  return (
    <g opacity={o}>
      {[0, 1, 2, 3, 4, 5].map((j) => (
        <Pip key={j} x={x + (j % 3) * 22} y={y + Math.floor(j / 3) * 20} s={12} f={f} />
      ))}
    </g>
  );
}

// Every claim here traces to the GDPR, the CLOUD Act's own statutory text, the CJEU's and General Court's own rulings and
// the EDPB's own recommendations (SOURCES.md). No real cross-border system runs in this sandbox.

// 0 · The EU region with its bytes inside, locked by the region pin; they never move. Then a support engineer outside the
// EU looks in along a dashed line: the bytes stay put, and the look itself is the transfer.
export function PinnedButReachable({ t }: StepCtx) {
  const k = (d: number) => easeOut(seg(t, d, d + 0.35));
  const look = easeInOut(seg(t, 2.6, 3.2));
  return (
    <Svg label="Storage pinned to the EU, reached anyway by a remote support session" h={250}>
      <rect x={25} y={40} width={250} height={130} rx={8} fill="none" stroke={C.second} strokeWidth={1.8} opacity={k(0)} />
      <T x={37} y={62} s={12} f={C.second} o={k(0)}>
        EU region
      </T>
      <Bytes x={90} y={100} o={k(0.3)} />
      <Lock x={245} y={52} k={k(1.0)} f={C.focus} />
      {t > 1.3 && (
        <T x={37} y={158} s={11} f={C.focus} o={k(1.3)}>
          pinned; the bytes never move
        </T>
      )}
      <Cell x={385} y={90} w={190} label="support engineer" o={k(2.0)} stroke={C.cherryText} />
      {t > 2.2 && (
        <T x={385} y={138} s={11} f={C.taupe} o={k(2.2)}>
          outside the EU
        </T>
      )}
      <line x1={380} y1={110} x2={lerp(380, 160, look)} y2={110} stroke={C.cherryText} strokeWidth={1.8} strokeDasharray="5 4" opacity={look > 0 ? 1 : 0} />
      {look > 0 && <circle cx={lerp(380, 160, look)} cy={110} r={3} fill={C.cherryText} />}
      {t > 3.4 && (
        <T x={330} y={80} s={11} f={C.cherryText} a="middle" o={k(3.4)}>
          a remote view
        </T>
      )}
      {t > 3.9 && (
        <T x={25} y={214} s={13} f={C.cherryText} o={k(3.9)}>
          that view is a transfer, whatever the region says
        </T>
      )}
    </Svg>
  );
}

// 1 · Predict. Two words on the left, two questions on the right, a "?" between. Once answered, each word links to its
// question: residency to where the bytes are, sovereignty to who can compel them.
export function PredictThreeQuestions({ t, answer }: StepCtx) {
  const s = useSinceAnswer(answer !== null);
  const v = answer !== null ? easeOut(seg(s, 0.1, 0.6)) : 0;
  const w = answer !== null ? easeOut(seg(s, 0.5, 1.0)) : 0;
  const k = (d: number) => easeOut(seg(t, d, d + 0.3));
  return (
    <Svg label="Three words, one commonly blurred — which question does compelled access ask?" h={250}>
      <Cell x={25} y={50} w={150} label="residency" o={k(0)} />
      <Cell x={25} y={120} w={150} label="sovereignty" o={k(0.15)} stroke={w > 0.5 ? C.focus : C.mocha} f={w > 0.5 ? C.focus : C.crema} />
      <Cell x={330} y={50} w={245} label="where are the bytes?" o={k(0.3)} />
      <Cell x={330} y={120} w={245} label="who can compel them?" o={k(0.45)} stroke={w > 0.5 ? C.focus : C.mocha} f={w > 0.5 ? C.focus : C.crema} />
      {answer === null && t > 0.6 && (
        <T x={252} y={104} s={15} f={C.taupe} a="middle" o={k(0.6)}>
          ?
        </T>
      )}
      <Req x1={180} x2={322} y={64} k={v} />
      <Req x1={180} x2={322} y={134} k={w} f={C.focus} />
      <Verdict answer={answer} text="sovereignty: compelled access" y={200} />
    </Svg>
  );
}

// 2 · Three strips drawn one at a time, each with its own small picture: bytes resting in a region, an arrow compelling
// them from outside, a lock a law puts on the location. A single box tries to merge them and is struck off.
export function ThreeStrips({ t }: StepCtx) {
  const k = (d: number) => easeOut(seg(t, d, d + 0.35));
  const strips = [
    { label: 'residency: where the bytes rest', d: 0.3 },
    { label: 'sovereignty: who can compel them', d: 1.3 },
    { label: 'localisation: a law requiring the place', d: 2.3 },
  ];
  const merge = easeInOut(seg(t, 3.5, 3.9));
  const drop = easeOut(seg(t, 4.1, 4.5));
  return (
    <Svg label="Three separate strips, each answering one question, never merged into one box" h={250}>
      {strips.map((st, i) => {
        const y = 36 + i * 56;
        return (
          <g key={st.label}>
            <rect x={25} y={y} width={550} height={44} rx={6} fill="none" stroke={C.mocha} strokeWidth={1.5} opacity={k(st.d)} />
            <T x={40} y={y + 27} s={12} f={C.crema} o={k(st.d)}>
              {st.label}
            </T>
            <rect x={470} y={y + 8} width={60} height={28} rx={4} fill="none" stroke={C.second} strokeWidth={1.5} opacity={k(st.d + 0.2)} />
            <Pip x={500} y={y + 22} s={10} f={C.second} o={k(st.d + 0.3)} />
          </g>
        );
      })}
      <Back x1={565} x2={512} y={114} k={easeOut(seg(t, 1.7, 2.1))} f={C.cherryText} />
      <Lock x={537} y={158} k={k(2.7)} f={C.caramel} />
      <rect x={20} y={30} width={555} height={168} rx={8} fill="none" stroke={C.cherryText} strokeWidth={1.8} strokeDasharray="6 4" opacity={merge * (1 - drop)} />
      {t > 4.1 && (
        <T x={25} y={228} s={12} f={C.cherryText} o={k(4.1)}>
          never one blurred box
        </T>
      )}
      <Cross x={232} y={223} k={k(4.3)} />
    </Svg>
  );
}

// 3 · A US provider above two hosts. A lawful order reaches the data in the EU host: must disclose. The data moves to the
// US host and the order reaches it there too, the same answer. Possession, custody or control is the test.
export function CloudActTest({ t }: StepCtx) {
  const k = (d: number) => easeOut(seg(t, d, d + 0.35));
  const move = easeInOut(seg(t, 1.8, 2.4));
  return (
    <Svg label="A US provider compelled to disclose, whether the data sits in the EU or the US" h={250}>
      <Cell x={200} y={30} w={200} label="US provider" o={k(0)} />
      <rect x={25} y={120} width={200} height={70} rx={6} fill="none" stroke={C.mocha} strokeWidth={1.5} opacity={k(0.2)} />
      <T x={37} y={140} s={11} f={C.taupe} o={k(0.2)}>
        EU host
      </T>
      <rect x={375} y={120} width={200} height={70} rx={6} fill="none" stroke={C.mocha} strokeWidth={1.5} opacity={k(0.3)} />
      <T x={387} y={140} s={11} f={C.taupe} o={k(0.3)}>
        US host
      </T>
      <Pip x={lerp(125, 475, move)} y={164} s={16} f={C.second} o={k(0.4)} />
      <Fan x1={260} y1={60} x2={130} y2={150} k={easeOut(seg(t, 0.9, 1.3))} f={C.cherryText} />
      {t > 1.3 && (
        <T x={25} y={106} s={11} f={C.cherryText} o={k(1.3)}>
          must disclose
        </T>
      )}
      <Fan x1={340} y1={60} x2={470} y2={150} k={easeOut(seg(t, 2.5, 2.9))} f={C.cherryText} />
      {t > 2.9 && (
        <T x={575} y={106} s={11} f={C.cherryText} a="end" o={k(2.9)}>
          must disclose
        </T>
      )}
      {t > 3.3 && (
        <T x={300} y={222} s={12} f={C.focus} a="middle" o={k(3.3)}>
          possession, custody or control is the test
        </T>
      )}
      {t > 3.9 && (
        <T x={300} y={244} s={11} f={C.taupe} a="middle" o={k(3.9)}>
          not geography
        </T>
      )}
    </Svg>
  );
}

// 4 · Safe Harbor, then Privacy Shield, struck down by Schrems II. The surveillance-law concern that struck it slides over
// to the SCCs and becomes their required transfer-impact assessment: clauses now signed, filed and assessed.
export function SchremsAndScc({ t }: StepCtx) {
  const k = (d: number) => easeOut(seg(t, d, d + 0.35));
  const slide = easeInOut(seg(t, 2.0, 2.7));
  return (
    <Svg label="A struck-down framework, replaced by SCCs, now carrying their own required assessment" h={250}>
      <Cell x={25} y={40} w={140} label="Safe Harbor" o={k(0) * (t > 0.8 ? 0.5 : 1)} />
      <Req x1={170} x2={192} y={54} k={k(0.4)} />
      <Cell x={200} y={40} w={160} label="Privacy Shield" o={k(0.5)} stroke={t > 1.3 ? C.cherryText : C.mocha} />
      <Cross x={372} y={54} k={k(1.3)} />
      {t > 1.4 && (
        <T x={280} y={96} s={11} f={C.cherryText} a="middle" o={k(1.4)}>
          struck down: Schrems II
        </T>
      )}
      <Req x1={386} x2={432} y={54} k={k(1.7)} />
      <Cell x={440} y={40} w={135} label="SCCs" o={k(1.8)} stroke={C.second} f={C.second} />
      {t > 1.9 && slide < 1 && <Cell x={lerp(170, 330, slide)} y={130} w={220} h={24} label="surveillance-law concern" o={k(1.9) * (1 - slide * 0.6)} stroke={C.cherryText} f={C.cherryText} />}
      {slide >= 1 && <Cell x={330} y={130} w={245} label="transfer-impact assessment" o={k(2.7)} stroke={C.focus} f={C.focus} />}
      <Fan x1={507} y1={128} x2={507} y2={72} k={easeOut(seg(t, 2.9, 3.3))} f={C.focus} />
      {t > 3.5 && (
        <T x={25} y={200} s={12} f={C.crema} o={k(3.5)}>
          not just signed and filed:
        </T>
      )}
      {t > 3.9 && (
        <T x={25} y={224} s={12} f={C.focus} o={k(3.9)}>
          what the destination's surveillance law really permits
        </T>
      )}
    </Svg>
  );
}

// 5 · A timeline: Safe Harbor and Privacy Shield, both struck; the current framework adopted, then upheld by the General
// Court; then an open, pending appeal. An arc from the appeal back to both crosses: the same court, both times.
export function LatombeTimeline({ t }: StepCtx) {
  const k = (d: number) => easeOut(seg(t, d, d + 0.35));
  const line = easeInOut(seg(t, 0.2, 1.8));
  const arc = easeInOut(seg(t, 2.8, 3.5));
  const marks = [
    { x: 80, label: 'Safe Harbor', up: true, kind: 'x' },
    { x: 180, label: 'Privacy Shield', up: false, kind: 'x' },
    { x: 300, label: 'framework', up: true, kind: 'pip' },
    { x: 410, label: 'upheld', up: false, kind: 'tick' },
    { x: 515, label: 'appeal pending', up: true, kind: 'open' },
  ];
  return (
    <Svg label="A timeline from Schrems II through the current framework's pending appeal" h={250}>
      <line x1={25} y1={130} x2={lerp(25, 560, line)} y2={130} stroke={C.mocha} strokeWidth={1.5} />
      {marks.map((m, i) => {
        const d = 0.3 + i * 0.35;
        return (
          <g key={m.label}>
            {m.kind === 'x' && <Cross x={m.x} y={130} k={k(d)} />}
            {m.kind === 'pip' && <Pip x={m.x} y={130} s={12} f={C.second} o={k(d)} />}
            {m.kind === 'tick' && <MiniTick x={m.x - 6} y={130} k={k(d)} />}
            {m.kind === 'open' && <circle cx={m.x} cy={130} r={7} fill="none" stroke={C.caramel} strokeWidth={2} strokeDasharray="3 2" opacity={k(d)} />}
            {t > d && (
              <T x={m.x} y={m.up ? 110 : 160} s={11} f={m.kind === 'x' ? C.cherryText : m.kind === 'open' ? C.caramel : C.crema} a="middle" o={k(d)}>
                {m.label}
              </T>
            )}
          </g>
        );
      })}
      <path d="M515 94 C 515 40, 180 40, 180 116" fill="none" stroke={C.caramel} strokeWidth={1.5} strokeDasharray="600" strokeDashoffset={600 * (1 - arc)} />
      <path d="M180 64 C 140 50, 80 60, 80 96" fill="none" stroke={C.caramel} strokeWidth={1.5} strokeDasharray="200" strokeDashoffset={200 * (1 - easeInOut(seg(t, 3.4, 3.8)))} />
      {t > 3.6 && (
        <T x={340} y={40} s={11} f={C.caramel} a="middle" o={k(3.6)}>
          the same court, both times
        </T>
      )}
      {t > 4.1 && (
        <T x={300} y={214} s={13} f={C.crema} a="middle" o={k(4.1)}>
          upheld once is not settled
        </T>
      )}
    </Svg>
  );
}

// 6 · The importer holds only locked bytes; the key sits with the customer, outside its reach: effective. Then a support
// session needs the data in the clear. The key has to travel over, the bytes open, and no placement of it helps.
export function KeysRealLimit({ t }: StepCtx) {
  const k = (d: number) => easeOut(seg(t, d, d + 0.35));
  const send = easeInOut(seg(t, 2.9, 3.4));
  const clear = t > 3.4;
  return (
    <Svg label="A key held outside the importer's custody works, until the processing itself needs the data in the clear" h={250}>
      <Cell x={25} y={40} w={170} label="customer-held key" o={k(0)} stroke={C.focus} f={C.focus} />
      <rect x={330} y={30} width={245} height={100} rx={6} fill="none" stroke={C.mocha} strokeWidth={1.5} opacity={k(0.2)} />
      <T x={342} y={50} s={11} f={C.taupe} o={k(0.2)}>
        importer
      </T>
      {[0, 1, 2, 3, 4].map((j) => (
        <g key={j}>
          <Pip x={370 + j * 34} y={90} s={14} f={clear ? C.crema : C.caramel} o={k(0.4)} />
          {!clear && <Lock x={363 + j * 34} y={104} k={k(0.6)} f={C.caramel} />}
        </g>
      ))}
      {t > 1.1 && (
        <T x={25} y={100} s={11} f={C.caramel} o={k(1.1)}>
          the importer sees ciphertext
        </T>
      )}
      <MiniTick x={25} y={122} k={k(1.6)} />
      {t > 1.7 && (
        <T x={45} y={130} s={12} f={C.focus} o={k(1.7)}>
          effective
        </T>
      )}
      <Cell x={330} y={180} w={245} label="support session" o={k(2.3)} stroke={C.cherryText} />
      <Fan x1={452} y1={176} x2={452} y2={136} k={easeOut(seg(t, 2.5, 2.9))} f={C.cherryText} />
      {t > 2.6 && (
        <T x={325} y={164} s={11} f={C.cherryText} a="end" o={k(2.6)}>
          needs the clear text
        </T>
      )}
      {send > 0 && send < 1 && <Lock x={lerp(200, 330, send)} y={60} k={1} f={C.focus} />}
      {t > 3.6 && (
        <T x={25} y={230} s={12} f={C.cherryText} o={k(3.6)}>
          no key placement prevents this access
        </T>
      )}
    </Svg>
  );
}

// 7 · Recap. The three questions as three chips; under each, the limit worth saying out loud: the CLOUD Act's possession
// test, a framework under appeal, a key that stops at plaintext.
export function Recap({ t }: StepCtx) {
  const k = (d: number) => easeOut(seg(t, d, d + 0.35));
  const top = ['residency', 'sovereignty', 'localisation'];
  const low = ['possession', 'under appeal', 'key, until read'];
  return (
    <Svg label="The three-part recap of this topic's point" h={250}>
      {top.map((m, i) => (
        <Cell key={m} x={25 + i * 190} y={40} w={170} label={m} o={k(0.2 + i * 0.3)} />
      ))}
      {low.map((m, i) => {
        const d = 1.5 + i * 0.5;
        return (
          <g key={m}>
            <line x1={110 + i * 190} y1={70} x2={110 + i * 190} y2={lerp(70, 108, k(d))} stroke={C.mocha} strokeWidth={1.5} />
            <Cell x={25 + i * 190} y={110} w={170} label={m} o={k(d + 0.2)} stroke={C.caramel} f={C.caramel} />
          </g>
        );
      })}
      {t > 3.4 && (
        <T x={300} y={200} s={13} f={C.crema} a="middle" o={k(3.4)}>
          three questions, each with a stated limit
        </T>
      )}
    </Svg>
  );
}

// 8 · Prove it. The EU region with its bytes and both residency and localisation already ticked; an engineer outside looks
// in. Once answered, the look itself lights up as the question.
export function ProveIt({ t, answer }: StepCtx) {
  const s = useSinceAnswer(answer !== null);
  const v = answer !== null ? easeOut(seg(s, 0.1, 0.6)) : 0;
  const k = (d: number) => easeOut(seg(t, d, d + 0.3));
  return (
    <Svg label="Storage never leaves the EU, but a non-EU engineer views it remotely — what's the real question?" h={250}>
      <rect x={25} y={40} width={230} height={110} rx={8} fill="none" stroke={C.second} strokeWidth={1.8} opacity={k(0)} />
      <T x={37} y={62} s={12} f={C.second} o={k(0)}>
        EU region
      </T>
      <Bytes x={80} y={92} o={k(0.2)} />
      <MiniTick x={25} y={176} k={k(0.5)} />
      <T x={45} y={184} s={11} f={C.taupe} o={k(0.5)}>
        residency: fine
      </T>
      <MiniTick x={25} y={198} k={k(0.7)} />
      <T x={45} y={206} s={11} f={C.taupe} o={k(0.7)}>
        localisation: fine
      </T>
      <Cell x={405} y={80} w={170} label="engineer, outside" o={k(0.9)} />
      <line x1={400} y1={94} x2={lerp(400, 160, k(1.1))} y2={94} stroke={v > 0.5 ? C.focus : C.cherryText} strokeWidth={v > 0.5 ? 2.5 : 1.5} strokeDasharray="5 4" />
      {v > 0.5 && (
        <T x={330} y={80} s={11} f={C.focus} a="middle" o={v}>
          the question
        </T>
      )}
      <Verdict answer={answer} text="is the remote view a transfer?" y={238} />
    </Svg>
  );
}
