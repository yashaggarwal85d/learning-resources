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

/** Key shades for generated write attempts: each key gets its own fill. */
const KEYS = [C.focus, C.second, C.crema, C.cherryText, C.latte];

// 1 · Hook. The last topic's client wears six failure-handling tags, each ticked on the happy path; whether any of it is
// actually correct stays an open question.
export function Hook({ t }: StepCtx) {
  const tags = ['timeout', 'deadline', 'jitter', 'budget', 'breaker', 'key'];
  return (
    <Svg label="a retry client that looks correct — which test actually catches the bug that isn't on the happy path?" h={220}>
      <Row y={40} label="handles failure well" value="but correct?" k={easeOut(seg(t, 0.3, 0.8))} />
      {tags.map((l, i) => {
        const k = easeOut(seg(t, 0.6 + i * 0.25, 0.9 + i * 0.25));
        return (
          <g key={l}>
            <Cell x={25 + (i % 3) * 140} y={64 + Math.floor(i / 3) * 40} w={120} label={l} o={k} />
            <MiniTick x={150 + (i % 3) * 140 - 12} y={70 + Math.floor(i / 3) * 40} k={easeOut(seg(t, 0.9 + i * 0.25, 1.2 + i * 0.25))} />
          </g>
        );
      })}
      <T x={510} y={112} s={30} f={C.focus} a="middle" o={easeOut(seg(t, 2.8, 3.3))}>
        ?
      </T>
      <Row y={190} label="what proves it" value="five kinds of test" valueColor={C.focus} k={easeOut(seg(t, 3.5, 4.0))} />
    </Svg>
  );
}

// 2 · A unit test. One minimal raw event goes into normalize_event, and the one assertion checks the exact shape that comes out.
export function RevealUnitTest({ t }: StepCtx) {
  return (
    <Svg label="one minimal input, not a full dataset — does the function do the one thing it claims?" h={240}>
      <Cell x={25} y={30} w={550} label='{"id": 42, "type": "charge", "amount": 19.99}' o={easeOut(seg(t, 0.3, 0.7))} />
      <path d={`M300 58 V${58 + 22 * easeOut(seg(t, 0.8, 1.1))}`} stroke={C.latte} strokeWidth={1.5} />
      <Cell x={200} y={82} w={200} label="normalize_event" stroke={C.second} f={C.second} o={easeOut(seg(t, 1.0, 1.4))} />
      <path d={`M300 110 V${110 + 22 * easeOut(seg(t, 1.5, 1.8))}`} stroke={C.latte} strokeWidth={1.5} />
      <Cell x={25} y={134} w={550} label='{"id": "42", "kind": "charge", "amount_cents": 1999}' stroke={C.focus} f={C.focus} o={easeOut(seg(t, 1.8, 2.2))} />
      <Row y={210} label="one fixture, one assert" value="passes" valueColor={C.focus} k={easeOut(seg(t, 2.8, 3.3))} />
    </Svg>
  );
}

// 3 · A property test. One generated sequence of write attempts shows its keys as shades; the effects collapse to one per
// distinct key; then a grid of a hundred generated cases fills, every one holding.
export function RevealPropertyTest({ t }: StepCtx) {
  const seq = [0, 1, 0, 2, 1, 1, 3, 0];
  const c = easeInOut(seg(t, 0.9, 1.6));
  const n = Math.floor(clamp(seg(t, 1.8, 3.4)) * 100);
  return (
    <Svg label="one generated sequence of write attempts, a hundred times — does the invariant hold every time?" h={250}>
      <Row y={40} label="effects recorded" value="= distinct keys" valueColor={C.focus} k={easeOut(seg(t, 0.2, 0.7))} />
      {seq.map((k, i) => {
        const first = seq.indexOf(k) === i;
        const tx = first ? lerp(40 + i * 24, 360 + seq.slice(0, i).filter((v, j) => seq.indexOf(v) === j).length * 24, c) : 40 + i * 24;
        return <circle key={i} cx={tx} cy={72} r={7} fill={KEYS[k]} opacity={easeOut(seg(t, 0.3 + i * 0.05, 0.5 + i * 0.05)) * (first ? 1 : 1 - 0.6 * c)} />;
      })}
      <T x={360} y={98} s={11} f={C.latte} o={c}>
        one effect per key
      </T>
      {Array.from({ length: 100 }, (_, i) => (
        <rect key={i} x={25 + (i % 25) * 22} y={116 + Math.floor(i / 25) * 18} width={16} height={12} rx={2} fill={C.focus} opacity={i < n ? 0.75 : 0.12} />
      ))}
      <Row y={210} label="100 generated cases" value="every one held" valueColor={C.focus} k={easeOut(seg(t, 3.4, 3.9))} />
    </Svg>
  );
}

// 4 · Predict: does generating find more? The handwritten test's one sequence, the same key three times, beside a faint field of
// other sequences nobody wrote; then the question.
export function PredictGenerated({ t, answer }: StepCtx) {
  return (
    <Svg label="a handwritten replay test with three retries — does a generated test find anything it misses?" h={210}>
      <Row y={40} label="one key, sent 3 times" value="finds it all?" k={easeOut(seg(t, 0.1, 0.5))} />
      {[0, 1, 2].map((i) => (
        <circle key={i} cx={40 + i * 24} cy={78} r={7} fill={KEYS[0]} opacity={easeOut(seg(t, 0.2 + i * 0.1, 0.4 + i * 0.1))} />
      ))}
      {Array.from({ length: 30 }, (_, i) => (
        <circle key={i} cx={200 + (i % 15) * 25} cy={68 + Math.floor(i / 15) * 20} r={5} fill={KEYS[(i * 7) % 5]} opacity={0.35 * easeOut(seg(t, 0.6 + i * 0.02, 0.9 + i * 0.02))} />
      ))}
      <AnswerRow y={140} label="it finds nothing more" answer={answer} value="no, it finds more" k={easeOut(seg(t, 1.2, 1.7))} />
      <Verdict answer={answer} text="it tries patterns nobody typed" />
    </Svg>
  );
}

// 5 · A contract test. The interaction is written once; a mock provider is built from it; the consumer's own fetch_user calls
// that server and gets back exactly the described reply.
export function RevealContractTest({ t }: StepCtx) {
  const b = easeOut(seg(t, 1.0, 1.4));
  const q = easeInOut(seg(t, 1.8, 2.3));
  const r = easeInOut(seg(t, 2.4, 2.9));
  return (
    <Svg label="a consumer client, calling a mock provider that was built from the exact interaction it's expected to send" h={240}>
      <Cell x={25} y={30} w={550} label="GET /users/123  →  200, Ada" stroke={C.second} f={C.second} o={easeOut(seg(t, 0.3, 0.7))} />
      <path d={`M125 58 V${58 + 36 * b}`} stroke={C.second} strokeWidth={1.5} />
      <Cell x={25} y={96} w={200} label="mock provider" o={b} />
      <Cell x={375} y={96} w={200} label="fetch_user(…, 123)" o={easeOut(seg(t, 1.4, 1.8))} />
      <path d={`M375 104 H${lerp(375, 225, q)}`} stroke={C.latte} strokeWidth={1.5} opacity={q > 0 ? 1 : 0} />
      <path d={`M225 116 H${lerp(225, 375, r)}`} stroke={C.focus} strokeWidth={1.5} opacity={r > 0 ? 1 : 0} />
      <T x={300} y={150} s={12} f={C.focus} a="middle" o={easeOut(seg(t, 2.8, 3.1))}>
        {'{"id": 123, "name": "Ada"}'}
      </T>
      <Tick y={150} k={easeOut(seg(t, 3.1, 3.5))} />
      <Row y={210} label="the reply" value="exactly as described" valueColor={C.focus} k={easeOut(seg(t, 3.4, 3.9))} />
    </Svg>
  );
}

// 6 · An integration test. The disposable-container tool is drawn dashed, with no Docker daemon here; the real, running
// Postgres beside it takes the insert of "gear" and hands "gear" back on the read.
export function RevealIntegrationTest({ t }: StepCtx) {
  return (
    <Svg label="the same insert-then-read, run against an in-memory stub vs. a real running database" h={240}>
      <Row y={40} label="insert, then read" value="a real database" k={easeOut(seg(t, 0.2, 0.7))} />
      <g opacity={easeOut(seg(t, 0.6, 1.0))}>
        <rect x={25} y={64} width={220} height={28} rx={4} fill="none" stroke={C.latte} strokeWidth={1.5} strokeDasharray="5 4" />
        <T x={135} y={82} s={12} f={C.latte} a="middle">
          Testcontainers
        </T>
      </g>
      <T x={25} y={112} s={11} f={C.latte} o={easeOut(seg(t, 1.0, 1.3))}>
        no Docker daemon here
      </T>
      <Cross x={258} y={78} k={easeOut(seg(t, 1.2, 1.5))} />
      <Cell x={325} y={64} w={250} label="Postgres, running" stroke={C.focus} f={C.focus} o={easeOut(seg(t, 1.5, 1.9))} />
      <Cell x={325} y={112} w={250} h={24} label="INSERT 'gear'" o={easeOut(seg(t, 2.0, 2.4))} />
      <Cell x={325} y={142} w={250} h={24} label="SELECT id 1  →  'gear'" stroke={C.focus} o={easeOut(seg(t, 2.6, 3.0))} />
      <MiniTick x={290} y={150} k={easeOut(seg(t, 3.0, 3.3))} />
      <Row y={215} label="a dependency" value="that can disagree" valueColor={C.focus} k={easeOut(seg(t, 3.4, 3.9))} />
    </Svg>
  );
}

// 7 · A golden-output test. Run one writes the seed-100 report to report.golden.txt; run two produces the same five lines, each
// compared to the file, and the diff comes back empty.
export function RevealGoldenMaster({ t }: StepCtx) {
  const lines = ['widget-0: 19', 'widget-1: 59', 'widget-2: 59', 'widget-3: 99', 'widget-4: 23'];
  return (
    <Svg label="the same deterministic report, generated twice — does it still match the file recorded the first time?" h={240}>
      <T x={25} y={36} s={12} f={C.latte} o={easeOut(seg(t, 0.2, 0.5))}>
        report.golden.txt
      </T>
      <T x={345} y={36} s={12} f={C.latte} o={easeOut(seg(t, 1.4, 1.7))}>
        run two, seed 100
      </T>
      <rect x={25} y={46} width={200} height={108} rx={4} fill={C.cocoa} stroke={C.mocha} strokeWidth={1.5} opacity={easeOut(seg(t, 0.2, 0.5))} />
      {lines.map((l, i) => (
        <g key={l}>
          <T x={40} y={66 + i * 20} s={12} f={C.crema} o={easeOut(seg(t, 0.4 + i * 0.12, 0.6 + i * 0.12))}>
            {l}
          </T>
          <T x={345} y={66 + i * 20} s={12} f={C.crema} o={easeOut(seg(t, 1.6 + i * 0.12, 1.8 + i * 0.12))}>
            {l}
          </T>
          <T x={285} y={66 + i * 20} s={13} f={C.focus} a="middle" o={easeOut(seg(t, 2.4 + i * 0.15, 2.6 + i * 0.15))}>
            =
          </T>
        </g>
      ))}
      <Row y={210} label="the diff" value="empty" valueColor={C.focus} k={easeOut(seg(t, 3.4, 3.9))} />
    </Svg>
  );
}

// 8 · Five layers, run together. Each layer passes in turn, a dot lighting beside it, and each names the one claim it alone
// was checking.
export function RevealFiveLayers({ t }: StepCtx) {
  const rows: [string, string][] = [
    ['unit', 'one shape'],
    ['property', 'the dedup rule'],
    ['contract', 'the agreed reply'],
    ['integration', 'a real database'],
    ['golden', 'the recorded output'],
  ];
  return (
    <Svg label="the same client from five angles — unit, property, contract, integration, golden — run end to end" h={250}>
      {rows.map(([l, v], i) => {
        const k = easeOut(seg(t, 0.4 + i * 0.6, 0.9 + i * 0.6));
        return (
          <g key={l}>
            <Row y={35 + i * 45} label={l} value={v} k={k} />
            <circle cx={240} cy={30 + i * 45} r={6} fill={C.focus} opacity={easeOut(seg(t, 0.7 + i * 0.6, 1.0 + i * 0.6))} />
          </g>
        );
      })}
    </Svg>
  );
}

// 9 · Recap. Five rows land one per beat.
export function Recap({ t }: StepCtx) {
  return (
    <Svg label="five layers: a minimal fixture, a hundred generated cases, a real mock provider, a real dependency, a recorded diff" h={250}>
      <Row y={35} label="a unit test" value="the smallest fixture" k={easeOut(seg(t, 0.4, 0.9))} />
      <Row y={80} label="a property test" value="100 generated inputs" valueColor={C.focus} k={easeOut(seg(t, 1.1, 1.6))} />
      <Row y={125} label="a contract test" value="a mock from the pact" k={easeOut(seg(t, 1.8, 2.3))} />
      <Row y={170} label="an integration test" value="a real dependency" valueColor={C.focus} k={easeOut(seg(t, 2.5, 3.0))} />
      <Row y={215} label="a golden test" value="record once, then diff" k={easeOut(seg(t, 3.2, 3.7))} />
    </Svg>
  );
}

// 10 · Prove: all green, still broken. Four passing hand-picked tests tick in a row, yet one key shows two effects; after the
// answer the missing layer, the generated test, lands under them.
export function ProveIt({ t, answer }: StepCtx) {
  const s = useSinceAnswer(answer !== null);
  const v = answer !== null ? easeOut(seg(s, 0.4, 0.9)) : 0;
  return (
    <Svg label="a team ships on all-green unit tests and still ships a dedup bug a property test would have caught — what was missing?" h={230}>
      <Row y={40} label="all-green unit tests" value="one key, 2 effects" valueColor={C.cherryText} k={easeOut(seg(t, 0.1, 0.5))} />
      <AnswerRow y={90} label="nothing was missing" answer={answer} value="a property test" k={easeOut(seg(t, 0.4, 0.9))} />
      {[0, 1, 2, 3].map((i) => (
        <MiniTick key={i} x={30 + i * 28} y={126} k={easeOut(seg(t, 0.6 + i * 0.1, 0.8 + i * 0.1))} />
      ))}
      <circle cx={420} cy={128} r={7} fill={KEYS[0]} opacity={easeOut(seg(t, 0.9, 1.2))} />
      <circle cx={444} cy={128} r={7} fill={C.cherryText} opacity={easeOut(seg(t, 1.0, 1.3))} />
      {answer !== null && (
        <>
          <T x={300} y={lerp(198, 190, v)} s={15} f={C.focus} a="middle" o={v}>
            hand-picked tests check one sequence
          </T>
          <rect x={150} y={202} width={300 * v} height={3} fill={C.focus} />
        </>
      )}
    </Svg>
  );
}
