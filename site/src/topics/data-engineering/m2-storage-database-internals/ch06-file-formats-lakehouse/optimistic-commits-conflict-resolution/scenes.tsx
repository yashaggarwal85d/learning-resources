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
/** A snapshot box: its name on top, then one row per file it lists, each row drawn in after the box. */
function Snap({
  x,
  y,
  w = 150,
  name,
  files,
  o = 1,
  fo = 1,
  stroke = C.mocha,
  f = C.crema,
}: {
  x: number;
  y: number;
  w?: number;
  name: string;
  files: string[];
  o?: number;
  fo?: number;
  stroke?: string;
  f?: string;
}) {
  const h = 30 + files.length * 22;
  return (
    <g opacity={o}>
      <rect x={x} y={y} width={w} height={h} rx={5} fill={C.cocoa} stroke={stroke} strokeWidth={1.6} />
      <T x={x + 10} y={y + 19} s={12} f={f}>
        {name}
      </T>
      {files.map((fl, i) => (
        <T key={fl} x={x + 14} y={y + 41 + i * 22} s={11} f={C.latte} o={seg(fo * files.length, i, i + 1)}>
          {fl}
        </T>
      ))}
    </g>
  );
}

// 1 · Hook. Two writers run at one commit gate; one passes and an arrow carries it on; the other halts before a fork of
// two dashed branches, retry and give up, with a question over it.
export function Hook({ t }: StepCtx) {
  const run = easeInOut(seg(t, 0.6, 1.4));
  return (
    <Svg label="exactly one writer wins a race -- this topic is what the loser must do next." h={200}>
      <Cell x={25} y={30} w={100} h={28} label="writer A" o={easeOut(seg(t, 0.1, 0.4))} />
      <Cell x={25} y={110} w={100} h={28} label="writer B" o={easeOut(seg(t, 0.2, 0.5))} />
      <line x1={127} y1={44} x2={lerp(127, 250, run)} y2={lerp(44, 84, run)} stroke={C.focus} strokeWidth={2} opacity={run > 0 ? 1 : 0} />
      <line x1={127} y1={124} x2={lerp(127, 210, run)} y2={lerp(124, 104, run)} stroke={C.cherryText} strokeWidth={2} opacity={run > 0 ? 1 : 0} />
      <rect x={250} y={66} width={14} height={36} rx={2} fill={C.focus} opacity={easeOut(seg(t, 0.4, 0.7))} />
      <Req x1={266} x2={380} y={84} k={easeOut(seg(t, 1.5, 1.9))} f={C.focus} label="wins" />
      <path d="M210 112 q30 40 100 46" fill="none" stroke={C.latte} strokeWidth={1.6} strokeDasharray="5 4" opacity={easeOut(seg(t, 2.2, 2.6))} />
      <path d="M210 112 q-20 50 -60 70" fill="none" stroke={C.latte} strokeWidth={1.6} strokeDasharray="5 4" opacity={easeOut(seg(t, 2.5, 2.9))} />
      <T x={318} y={162} s={12} f={C.crema} o={easeOut(seg(t, 2.4, 2.8))}>
        retry?
      </T>
      <T x={30} y={192} s={12} f={C.crema} o={easeOut(seg(t, 2.7, 3.1))}>
        give up?
      </T>
      <T x={300} y={200} s={15} f={C.second} o={easeOut(seg(t, 3.4, 3.8))}>
        the loser's move
      </T>
    </Svg>
  );
}

// 2 · Predict. The loser's change, staged on v0; the table now at v1; the answer: it depends on the operation.
export function PredictRetryRule({ t, answer }: StepCtx) {
  return (
    <Svg label="a writer loses the race for a commit slot -- what should it do next?" h={200}>
      <Cell x={25} y={40} w={180} label="staged on v0" o={easeOut(seg(t, 0.1, 0.4))} />
      <Cross x={115} y={95} k={easeOut(seg(t, 1.0, 1.3))} />
      <T x={130} y={100} s={11} f={C.cherryText} o={easeOut(seg(t, 1.0, 1.3))}>
        stale base
      </T>
      <Cell x={395} y={40} w={180} label="current: v1" stroke={C.focus} f={C.focus} o={easeOut(seg(t, 0.5, 0.8))} />
      <Req x1={207} x2={393} y={54} k={easeOut(seg(t, 0.6, 1.0))} label="moved on" f={C.latte} />
      <AnswerRow y={145} label="what it does next" answer={answer} value="depends on the op" k={easeOut(seg(t, 1.6, 2.1))} />
      <Verdict answer={answer} y={188} text="the check decides the concurrency" />
    </Svg>
  );
}

// 3 · Three stages. Read, stage, validate-and-commit boxes; a token runs along under them; staged files appear beside
// the stage box with no lock; a conflict mark appears only as the token reaches the last box.
export function RevealThreeStages({ t }: StepCtx) {
  const run = easeInOut(seg(t, 0.8, 2.8));
  const labels = ['read latest', 'stage files', 'validate, commit'];
  return (
    <Svg label="Delta's own shape: read, stage, then validate at commit -- conflicts are caught at the last step." h={230}>
      {labels.map((l, i) => (
        <Cell key={l} x={25 + i * 190} y={40} w={170} h={36} label={l} stroke={i === 2 ? C.focus : C.mocha} o={easeOut(seg(t, 0.1 + i * 0.2, 0.4 + i * 0.2))} />
      ))}
      <line x1={110} y1={105} x2={490} y2={105} stroke={C.mocha} strokeWidth={1.5} opacity={easeOut(seg(t, 0.6, 0.9))} />
      <circle cx={lerp(110, 490, run)} cy={105} r={7} fill={C.second} opacity={seg(t, 0.8, 0.9)} />
      {[0, 1, 2].map((j) => (
        <rect key={j} x={260 + j * 30} y={122} width={20} height={26} rx={2} fill={C.cocoa} stroke={C.latte} strokeWidth={1.3} opacity={easeOut(seg(t, 1.6 + j * 0.15, 1.8 + j * 0.15))} />
      ))}
      <T x={250} y={168} s={11} f={C.latte} o={easeOut(seg(t, 1.7, 2.0))}>
        off to the side
      </T>
      <path d="M490 118 l-8 16 h10 l-6 16" fill="none" stroke={C.cherryText} strokeWidth={2.5} opacity={easeOut(seg(t, 2.9, 3.2))} />
      <T x={440} y={172} s={12} f={C.cherryText} o={easeOut(seg(t, 3.0, 3.3))}>
        conflicts here
      </T>
      <T x={25} y={215} s={14} f={C.focus} o={easeOut(seg(t, 3.6, 4.0))}>
        never while staging
      </T>
    </Svg>
  );
}

// 4 · Rule per operation. An append runs straight through to a retry tick; a delete stops at a check of its own files.
export function RevealRetryDependsOnOp({ t }: StepCtx) {
  return (
    <Svg label="the retry rule depends on the operation -- an append has nothing to re-check; a delete does." h={230}>
      <Cell x={25} y={40} w={110} h={30} label="append" stroke={C.focus} o={easeOut(seg(t, 0.2, 0.5))} />
      <Req x1={137} x2={185} y={55} k={easeOut(seg(t, 0.6, 0.9))} f={C.focus} />
      <T x={195} y={60} s={12} f={C.crema} o={easeOut(seg(t, 0.8, 1.1))}>
        nothing to re-check
      </T>
      <MiniTick x={380} y={52} k={easeOut(seg(t, 1.2, 1.5))} />
      <T x={400} y={60} s={12} f={C.focus} o={easeOut(seg(t, 1.3, 1.6))}>
        just retry
      </T>
      <Cell x={25} y={115} w={110} h={30} label="delete" stroke={C.cherryText} o={easeOut(seg(t, 1.9, 2.2))} />
      <Req x1={137} x2={185} y={130} k={easeOut(seg(t, 2.3, 2.6))} f={C.cherryText} />
      <T x={195} y={135} s={12} f={C.crema} o={easeOut(seg(t, 2.5, 2.8))}>
        my files still there?
      </T>
      <T x={400} y={135} s={12} f={C.cherryText} o={easeOut(seg(t, 3.0, 3.3))}>
        check first
      </T>
      <T x={25} y={205} s={13} f={C.latte} o={easeOut(seg(t, 3.6, 4.0))}>
        adding steps on nobody; removing might
      </T>
    </Svg>
  );
}

// 5 · Predict. One base, v0; A adds its file, B adds a different one; A wins v1; the answer: the retry always lands.
export function PredictAppendRetry({ t, answer }: StepCtx) {
  return (
    <Svg label="two writers append disjoint files from the same base -- can the loser always retry?" h={200}>
      <Cell x={25} y={55} w={70} label="v0" o={easeOut(seg(t, 0.1, 0.4))} />
      <Cell x={150} y={25} w={150} label="A: + a-0003" stroke={C.focus} o={easeOut(seg(t, 0.4, 0.7))} />
      <Cell x={150} y={85} w={150} label="B: + b-0003" o={easeOut(seg(t, 0.6, 0.9))} />
      <line x1={95} y1={65} x2={150} y2={40} stroke={C.mocha} strokeWidth={1.5} opacity={easeOut(seg(t, 0.4, 0.7))} />
      <line x1={95} y1={75} x2={150} y2={100} stroke={C.mocha} strokeWidth={1.5} opacity={easeOut(seg(t, 0.6, 0.9))} />
      <Req x1={302} x2={420} y={39} k={easeOut(seg(t, 1.0, 1.4))} f={C.focus} label="wins v1" />
      <T x={330} y={104} s={18} f={C.second} o={easeOut(seg(t, 1.5, 1.9))}>
        B now?
      </T>
      <AnswerRow y={145} label="the loser's retry" answer={answer} value="always lands" k={easeOut(seg(t, 2.0, 2.5))} />
      <Verdict answer={answer} y={188} text="two additions never conflict" />
    </Svg>
  );
}

// 6 · Append vs append, for real. v0's two files; v1 is A's commit with a-0003; B is rejected at v1, finds nothing to
// re-check, and lands v2 with all four files.
export function RevealAppendRetrySucceeds({ t }: StepCtx) {
  return (
    <Svg label="reproduced for real: the losing append restages against the new base and wins." h={230}>
      <Snap x={25} y={20} w={175} name="v0" files={['data-0001', 'data-0002']} fo={seg(t, 0.2, 0.7)} o={easeOut(seg(t, 0.1, 0.3))} />
      <Snap x={210} y={20} w={175} name="v1: A wins" files={['data-0001', 'data-0002', 'data-a-0003']} fo={seg(t, 0.9, 1.5)} o={easeOut(seg(t, 0.7, 1.0))} stroke={C.focus} />
      <Cross x={225} y={145} k={easeOut(seg(t, 1.7, 2.0))} />
      <T x={240} y={150} s={11} f={C.cherryText} o={easeOut(seg(t, 1.7, 2.0))}>
        B loses v1
      </T>
      <T x={210} y={175} s={11} f={C.latte} o={easeOut(seg(t, 2.2, 2.5))}>
        append: nothing to check
      </T>
      <Snap x={395} y={20} w={175} name="v2: B's retry" files={['data-0001', 'data-0002', 'data-a-0003', 'data-b-0003']} fo={seg(t, 2.8, 3.6)} o={easeOut(seg(t, 2.6, 2.9))} stroke={C.second} />
      <T x={25} y={215} s={14} f={C.focus} o={easeOut(seg(t, 3.9, 4.3))}>
        lands cleanly: both writers' files present
      </T>
    </Svg>
  );
}

// 7 · Delete vs delete, for real. v0's three files; both writers remove data-0002; A wins v1 without it; B checks for
// its target, finds it gone, and stops; the v2 slot stays an empty dashed box.
export function RevealDeleteRetryFails({ t }: StepCtx) {
  const v2 = easeOut(seg(t, 3.4, 3.8));
  return (
    <Svg label="reproduced for real: two writers delete the same file -- the loser's retry fails for good." h={230}>
      <Snap x={25} y={20} w={175} name="v0" files={['data-0001', 'data-0002', 'data-0003']} fo={seg(t, 0.2, 0.8)} o={easeOut(seg(t, 0.1, 0.3))} />
      <T x={25} y={150} s={11} f={C.latte} o={easeOut(seg(t, 0.9, 1.2))}>
        both remove data-0002
      </T>
      <Snap x={210} y={20} w={175} name="v1: A wins" files={['data-0001', 'data-0003']} fo={seg(t, 1.4, 1.9)} o={easeOut(seg(t, 1.2, 1.5))} stroke={C.focus} />
      <T x={210} y={150} s={11} f={C.crema} o={easeOut(seg(t, 2.1, 2.4))}>
        B: is data-0002 here?
      </T>
      <Cross x={225} y={170} k={easeOut(seg(t, 2.6, 2.9))} />
      <T x={240} y={175} s={11} f={C.cherryText} o={easeOut(seg(t, 2.6, 2.9))}>
        gone
      </T>
      <rect x={395} y={20} width={175} height={52} rx={5} fill="none" stroke={C.mocha} strokeWidth={1.5} strokeDasharray="5 4" opacity={v2} />
      <T x={405} y={50} s={11} f={C.latte} o={v2}>
        v2: never claimed
      </T>
      <T x={25} y={215} s={14} f={C.cherryText} o={easeOut(seg(t, 3.9, 4.3))}>
        B stops for good, by design
      </T>
    </Svg>
  );
}

// 8 · Delta's taxonomy. Two causes on the left, each with an arrow to the exception Delta raises for it.
export function RevealDeltaTaxonomy({ t }: StepCtx) {
  const rows = [
    { cause: 'someone added a file you read', ex: ['ConcurrentAppendException'], f: C.focus },
    { cause: 'someone removed what you touch', ex: ['ConcurrentDeleteReadException', 'ConcurrentDeleteDeleteException'], f: C.cherryText },
  ];
  return (
    <Svg label="Delta names the exact same distinction as typed exceptions, not just prose." h={230}>
      {rows.map((r, i) => {
        const y = 40 + i * 80;
        const b = 0.3 + i * 1.6;
        return (
          <g key={r.cause}>
            <T x={25} y={y + 4} s={11} f={C.crema} o={easeOut(seg(t, b, b + 0.3))}>
              {r.cause}
            </T>
            <Req x1={25} x2={70} y={y + 26} k={easeOut(seg(t, b + 0.4, b + 0.7))} f={r.f} />
            {r.ex.map((e, j) => (
              <T key={e} x={80} y={y + 31 + j * 26} s={12} f={r.f} o={easeOut(seg(t, b + 0.6 + j * 0.4, b + 0.9 + j * 0.4))}>
                {e}
              </T>
            ))}
          </g>
        );
      })}
      <T x={25} y={215} s={13} f={C.latte} o={easeOut(seg(t, 3.8, 4.2))}>
        error types your own code catches
      </T>
    </Svg>
  );
}

// 9 · Isolation is a choice. Two gates: one checks a narrow slice, and most writer pips pass it; one checks the whole
// table, and only one pip passes while the rest wait.
export function RevealIsolationIsAChoice({ t }: StepCtx) {
  const pass = (i: number, ok: boolean, x0: number, x1: number, s0: number) => (ok ? lerp(x0, x1, easeInOut(seg(t, s0 + i * 0.2, s0 + 0.6 + i * 0.2))) : x0 - i * 14);
  return (
    <Svg label="isolation isn't a fixed property of the storage -- it's what a writer chooses to validate." h={230}>
      {[0, 1].map((p) => {
        const y = 45 + p * 80;
        const s0 = 0.8 + p * 1.5;
        const oks = p === 0 ? [true, true, true, true] : [true, false, false, false];
        return (
          <g key={p}>
            <T x={25} y={y - 12} s={11} f={C.latte} o={easeOut(seg(t, 0.2 + p * 1.4, 0.5 + p * 1.4))}>
              {p === 0 ? 'validate less: your own files' : 'validate more: the whole table'}
            </T>
            <rect x={270} y={y} width={p === 0 ? 10 : 30} height={30} rx={2} fill={p === 0 ? C.focus : C.second} opacity={easeOut(seg(t, 0.4 + p * 1.4, 0.7 + p * 1.4))} />
            {oks.map((ok, i) => (
              <circle key={i} cx={pass(i, ok, 200, 420 - i * 22, s0)} cy={y + 15} r={6} fill={ok ? C.crema : C.taupe} opacity={easeOut(seg(t, 0.5 + p * 1.4, 0.8 + p * 1.4))} />
            ))}
          </g>
        );
      })}
      <T x={25} y={215} s={14} f={C.focus} o={easeOut(seg(t, 3.9, 4.3))}>
        what you validate is the isolation level
      </T>
    </Svg>
  );
}

// 10 · Recap.
export function Recap({ t }: StepCtx) {
  return (
    <Svg label="stage first, validate at commit; retry safely or fail for good depending on the operation; isolation is that choice." h={260}>
      <Row y={35} label="stage" value="no coordination" k={easeOut(seg(t, 0.2, 0.6))} />
      <Row y={85} label="a losing append" value="retries, lands" valueColor={C.focus} k={easeOut(seg(t, 1.0, 1.4))} />
      <Row y={135} label="a losing delete" value="proves, or fails" valueColor={C.cherryText} k={easeOut(seg(t, 1.8, 2.2))} />
      <Row y={195} label="what you validate" value="isolation level" valueColor={C.second} big k={easeOut(seg(t, 2.8, 3.3))} />
    </Svg>
  );
}
