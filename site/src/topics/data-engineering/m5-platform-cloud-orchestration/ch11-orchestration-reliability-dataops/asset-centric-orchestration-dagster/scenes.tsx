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

// Every value here is examples.py's own: the assets raw_orders, stg_orders and fct_orders, the check no_negative_amounts,
// the planted amount of -50 and its fix to 50, the one bad row, the three wiring lines this file uses against the four in
// the TaskFlow version, and the ancestors the graph returns.

const ASSETS = ['raw_orders', 'stg_orders', 'fct_orders'];

// 0 · Left: a hand-kept spreadsheet of which table feeds which, one row going stale. Right: three assets, and the edges
// drawing themselves when the graph is asked what each depends on.
export function Hook({ t }: StepCtx) {
  const k = (d: number) => easeOut(seg(t, d, d + 0.35));
  return (
    <Svg label="a hand-kept lineage spreadsheet vs. asking the asset itself." h={250}>
      <rect x={25} y={36} width={240} height={130} rx={6} fill="none" stroke={C.mocha} strokeWidth={1.5} opacity={k(0)} />
      {Array.from({ length: 5 }, (_, i) => {
        const stale = i === 2 && t > 1.0;
        return (
          <g key={i} opacity={k(0.2 + i * 0.1)}>
            <rect x={40} y={52 + i * 22} width={80} height={7} rx={2} fill={stale ? C.cherryText : C.mocha} />
            <rect x={140} y={52 + i * 22} width={100} height={7} rx={2} fill={stale ? C.cherryText : C.mocha} />
          </g>
        );
      })}
      {t > 1.4 && (
        <T x={25} y={190} s={11} f={C.cherryText} o={k(1.4)}>
          updated by hand, trusted by no one
        </T>
      )}
      {ASSETS.map((a, i) => (
        <Cell key={a} x={360} y={30 + i * 70} w={160} label={a} o={k(1.8 + i * 0.1)} stroke={t > 3.2 ? C.focus : C.mocha} />
      ))}
      <Fan x1={440} y1={168} x2={440} y2={130} k={k(2.4)} f={C.focus} />
      <Fan x1={440} y1={98} x2={440} y2={60} k={k(2.8)} f={C.focus} />
      {t > 3.6 && (
        <T x={25} y={236} s={12} f={C.focus} o={k(3.6)}>
          or ask the data itself what it depends on
        </T>
      )}
    </Svg>
  );
}

// 1 · The asset graph's three real wiring lines appear one by one; beside them the TaskFlow version's four wiring lines,
// drawn as code bars. Then the counts.
export function RevealWiringMeasured({ t }: StepCtx) {
  const k = (d: number) => easeOut(seg(t, d, d + 0.35));
  const lines = ['@dg.asset(deps=[raw_orders])', '@dg.asset_check(asset=stg_orders)', '@dg.asset(deps=[stg_orders])'];
  return (
    <Svg label="same pipeline, two shapes. dependency lines counted for real." h={250}>
      <T x={25} y={36} s={12} f={C.focus} o={k(0)}>
        asset graph
      </T>
      {lines.map((l, i) => (
        <T key={l} x={25} y={64 + i * 24} s={11} f={C.crema} o={k(0.4 + i * 0.5)}>
          {l}
        </T>
      ))}
      <T x={320} y={36} s={12} f={C.caramel} o={k(0.1)}>
        TaskFlow DAG
      </T>
      {[180, 150, 200, 230].map((w, i) => (
        <rect key={i} x={320} y={56 + i * 24} width={w * easeOut(seg(t, 0.5 + i * 0.45, 0.9 + i * 0.45))} height={10} rx={2} fill="none" stroke={C.caramel} strokeWidth={1.3} />
      ))}
      {t > 3.0 && (
        <T x={25} y={176} s={15} f={C.focus} o={k(3.0)}>
          3 wiring lines
        </T>
      )}
      {t > 3.2 && (
        <T x={320} y={176} s={15} f={C.caramel} o={k(3.2)}>
          4 wiring lines
        </T>
      )}
      {t > 3.9 && (
        <T x={25} y={226} s={11} f={C.taupe} o={k(3.9)}>
          counted from both real files
        </T>
      )}
    </Svg>
  );
}

/** The three assets in a row with their edges and a check hanging off the middle one. */
function Pipeline({ k, check, checkLabel, checkColor }: { k: number; check: number; checkLabel: string; checkColor: string }) {
  return (
    <g>
      {ASSETS.map((a, i) => (
        <Cell key={a} x={25 + i * 200} y={80} w={150} label={a} o={k} />
      ))}
      <Fan x1={180} y1={94} x2={219} y2={94} k={k} />
      <Fan x1={380} y1={94} x2={419} y2={94} k={k} />
      <line x1={300} y1={108} x2={300} y2={140} stroke={checkColor} strokeWidth={1.5} opacity={check} />
      <Cell x={225} y={140} w={150} h={24} label={checkLabel} o={check} stroke={checkColor} f={checkColor} />
    </g>
  );
}

// 2 · Predict. A bad row sits in the data; the check on the middle asset will catch it. Does the run stop? Once answered,
// the check turns failed while a pulse still runs on into fct_orders.
export function PredictCheckBlocks({ t, answer }: StepCtx) {
  const s = useSinceAnswer(answer !== null);
  const v = answer !== null ? easeInOut(seg(s, 0.3, 0.9)) : 0;
  const k = (d: number) => easeOut(seg(t, d, d + 0.3));
  const failed = answer !== null && s > 0.2;
  return (
    <Svg label="does a failing check stop the rest of the pipeline?" h={250}>
      <T x={25} y={60} s={11} f={C.cherryText} o={k(0.4)}>
        amount: -50
      </T>
      <Pipeline k={k(0)} check={k(0.6)} checkLabel={failed ? 'check: failed' : 'check'} checkColor={failed ? C.cherryText : C.mocha} />
      {v > 0 && v < 1 && <Pip x={lerp(380, 420, v)} y={94} s={9} f={C.focus} />}
      {v >= 1 && <MiniTick x={550} y={92} k={easeOut(seg(s, 0.9, 1.2))} />}
      {answer === null && t > 1.1 && (
        <T x={300} y={200} s={15} f={C.taupe} a="middle" o={k(1.1)}>
          ?
        </T>
      )}
      <Verdict answer={answer} text="the run still succeeds" y={222} />
    </Svg>
  );
}

// 3 · Run one, bad row intact: the three assets light in turn, the check fails with one bad row, and the run succeeds. Run
// two, the row fixed to 50: the same check passes.
export function RevealCheckLive({ t }: StepCtx) {
  const k = (d: number) => easeOut(seg(t, d, d + 0.35));
  return (
    <Svg label="an asset check, run live, with a bad row planted." h={250}>
      <T x={25} y={30} s={11} f={C.taupe} o={k(0)}>
        with the bad row
      </T>
      {ASSETS.map((a, i) => (
        <Cell key={a} x={25 + i * 180} y={40} w={160} label={a} o={k(0.2 + i * 0.35)} stroke={t > 0.5 + i * 0.35 ? C.second : C.mocha} />
      ))}
      <Cell x={205} y={80} w={160} h={24} label="check" o={k(1.3)} stroke={t > 1.6 ? C.cherryText : C.mocha} />
      {t > 1.6 && (
        <T x={375} y={97} s={11} f={C.cherryText} o={k(1.6)}>
          failed: bad_rows 1
        </T>
      )}
      {t > 2.0 && (
        <T x={25} y={128} s={11} f={C.focus} o={k(2.0)}>
          the run: success
        </T>
      )}
      <T x={25} y={156} s={11} f={C.taupe} o={k(2.6)}>
        row fixed: amount 50
      </T>
      <Cell x={25} y={166} w={160} label="raw_orders_fixed" o={k(2.8)} />
      <Cell x={205} y={166} w={160} label="stg_orders_fixed" o={k(3.0)} />
      <Cell x={385} y={166} w={160} label="check: passed" o={k(3.6)} stroke={C.focus} f={C.focus} />
      {t > 4.1 && (
        <T x={25} y={232} s={11} f={C.crema} o={k(4.1)}>
          a report on the asset, not a gate in front of it
        </T>
      )}
    </Svg>
  );
}

/** The three assets stacked, fct_orders at the bottom, with their declared edges pointing upstream. */
function Stack({ x, k, lit }: { x: number; k: number; lit: number }) {
  return (
    <g>
      {ASSETS.map((a, i) => (
        <Cell key={a} x={x} y={30 + i * 60} w={160} label={a} o={k} stroke={lit > (2 - i) * 0.33 + 0.01 && lit > 0 ? C.focus : C.mocha} />
      ))}
      <Fan x1={x + 80} y1={148} x2={x + 80} y2={122} k={k} f={lit > 0.33 ? C.focus : C.crema} />
      <Fan x1={x + 80} y1={88} x2={x + 80} y2={62} k={k} f={lit > 0.66 ? C.focus : C.crema} />
    </g>
  );
}

// 4 · Predict. Three assets with their declared edges, and a dashed lineage tool beside them. Once answered, the dashed box
// fades and the path from fct_orders back to raw_orders lights.
export function PredictLineageTooling({ t, answer }: StepCtx) {
  const s = useSinceAnswer(answer !== null);
  const v = answer !== null ? easeInOut(seg(s, 0.1, 0.9)) : 0;
  const k = (d: number) => easeOut(seg(t, d, d + 0.3));
  return (
    <Svg label="does a lineage graph need separate tooling to maintain?" h={250}>
      <Stack x={60} k={k(0)} lit={v} />
      <Hole x={340} y={80} w={200} h={40} o={k(0.5) * (1 - v)} />
      {v < 1 && (
        <T x={440} y={105} s={11} f={C.taupe} a="middle" o={k(0.5) * (1 - v)}>
          lineage tool?
        </T>
      )}
      {answer === null && t > 1.0 && (
        <T x={440} y={190} s={15} f={C.taupe} a="middle" o={k(1.0)}>
          ?
        </T>
      )}
      <Verdict answer={answer} text="the asset graph already is the lineage" y={226} />
    </Svg>
  );
}

// 5 · The real query against the asset graph. The path lights from fct_orders back to raw_orders, the answer prints, and
// the lineage tool that was never built stays dashed and crossed.
export function RevealLineageFree({ t }: StepCtx) {
  const k = (d: number) => easeOut(seg(t, d, d + 0.35));
  return (
    <Svg label="lineage, asked for rather than hand-maintained." h={250}>
      <Stack x={25} k={k(0)} lit={clamp(seg(t, 0.8, 1.8))} />
      <Cell x={230} y={30} w={345} label="get_ancestor_asset_keys(fct_orders)" o={k(0.3)} stroke={C.second} />
      {t > 2.0 && (
        <T x={230} y={96} s={12} f={C.focus} o={k(2.0)}>
          raw_orders, stg_orders
        </T>
      )}
      <Hole x={230} y={130} w={200} o={k(2.6)} />
      <T x={330} y={148} s={11} f={C.taupe} a="middle" o={k(2.6)}>
        a lineage tool
      </T>
      <Cross x={450} y={144} k={k(2.9)} />
      {t > 3.2 && (
        <T x={230} y={190} s={11} f={C.taupe} o={k(3.2)}>
          none built, run, or kept in sync
        </T>
      )}
      {t > 3.9 && (
        <T x={25} y={236} s={12} f={C.crema} o={k(3.9)}>
          the answer is the graph it already declared
        </T>
      )}
    </Svg>
  );
}

// 6 · Left: Components and the dg CLI move from release candidate to generally available. Right: three jobs with no data
// product to name, each beside an empty, crossed slot.
export function RevealComponentsAndLimits({ t }: StepCtx) {
  const k = (d: number) => easeOut(seg(t, d, d + 0.35));
  const ga = t > 1.4;
  const jobs = ['send an email', 'call a payment API', 'a deploy step'];
  return (
    <Svg label="components and dg, now ga. where the model fits poorly." h={250}>
      <T x={25} y={36} s={12} f={C.crema} o={k(0)}>
        Components and the dg CLI
      </T>
      {!ga && <Cell x={25} y={50} w={220} label="release candidate" o={k(0.3)} />}
      {ga && <Cell x={25} y={50} w={220} label="generally available" o={k(1.4)} stroke={C.focus} f={C.focus} />}
      {t > 1.8 && (
        <T x={25} y={102} s={11} f={C.taupe} o={k(1.8)}>
          per Dagster's release notes
        </T>
      )}
      <T x={300} y={36} s={12} f={C.crema} o={k(2.0)}>
        no data product to name
      </T>
      {jobs.map((j, i) => (
        <g key={j}>
          <Cell x={300} y={50 + i * 44} w={170} label={j} o={k(2.2 + i * 0.4)} />
          <Hole x={485} y={50 + i * 44} w={70} o={k(2.4 + i * 0.4)} stroke={C.cherryText} />
          <Cross x={520} y={64 + i * 44} k={k(2.6 + i * 0.4)} />
        </g>
      ))}
      {t > 3.9 && (
        <T x={25} y={222} s={12} f={C.crema} o={k(3.9)}>
          fits poorly, by design: handled outside it
        </T>
      )}
    </Svg>
  );
}

// 7 · Recap. Left, a task graph whose nodes are actions; right, the asset graph whose nodes are the data products, and
// whose edges light up as lineage for free.
export function Recap({ t }: StepCtx) {
  const k = (d: number) => easeOut(seg(t, d, d + 0.35));
  const acts = ['do this', 'then this', 'then that'];
  return (
    <Svg label="task graphs wire actions. asset graphs wire data products." h={250}>
      <T x={25} y={36} s={12} f={C.caramel} o={k(0)}>
        nodes are actions
      </T>
      {acts.map((a, i) => (
        <Cell key={a} x={25} y={50 + i * 46} w={160} label={a} o={k(0.3 + i * 0.25)} />
      ))}
      <T x={310} y={36} s={12} f={C.focus} o={k(1.2)}>
        nodes are data products
      </T>
      {ASSETS.map((a, i) => (
        <Cell key={a} x={310} y={50 + i * 46} w={160} label={a} o={k(1.5 + i * 0.25)} stroke={t > 2.6 ? C.focus : C.mocha} />
      ))}
      {t > 2.6 && (
        <T x={310} y={200} s={11} f={C.focus} o={k(2.6)}>
          lineage, for free
        </T>
      )}
      {t > 2.9 && (
        <T x={25} y={200} s={11} f={C.taupe} o={k(2.9)}>
          lineage: build it yourself
        </T>
      )}
      {t > 3.7 && (
        <T x={300} y={234} s={12} f={C.crema} a="middle" o={k(3.7)}>
          a different answer to what the nodes are
        </T>
      )}
    </Svg>
  );
}

// 8 · Prove it. A fourth asset joins after fct_orders. Once answered, its one declared edge draws in and the lineage path
// runs all the way back to raw_orders.
export function ProveIt({ t, answer }: StepCtx) {
  const s = useSinceAnswer(answer !== null);
  const v = answer !== null ? easeInOut(seg(s, 0.1, 1.0)) : 0;
  const k = (d: number) => easeOut(seg(t, d, d + 0.3));
  const names = [...ASSETS, 'a fourth asset'];
  return (
    <Svg label="add a fourth stage. does deriving lineage change?" h={250}>
      {names.map((n, i) => {
        const x = [25, 165, 305, 440][i];
        const lit = v > (3 - i) * 0.25;
        return <Cell key={n} x={x} y={80} w={i === 3 ? 135 : 120} label={n} o={k(i === 3 ? 0.6 : 0)} stroke={v > 0 && lit ? C.focus : C.mocha} />;
      })}
      {[145, 285].map((x) => (
        <line key={x} x1={x} y1={94} x2={x + 20} y2={94} stroke={C.crema} strokeWidth={1.5} opacity={k(0.1)} />
      ))}
      <line x1={425} y1={94} x2={440} y2={94} stroke={v > 0 ? C.focus : C.taupe} strokeWidth={1.5} strokeDasharray={v > 0 ? undefined : '3 2'} opacity={k(0.6)} />
      {answer === null && t > 1.0 && (
        <T x={300} y={180} s={15} f={C.taupe} a="middle" o={k(1.0)}>
          ?
        </T>
      )}
      <Verdict answer={answer} text="nothing new: its own dependency is enough" y={222} />
    </Svg>
  );
}
