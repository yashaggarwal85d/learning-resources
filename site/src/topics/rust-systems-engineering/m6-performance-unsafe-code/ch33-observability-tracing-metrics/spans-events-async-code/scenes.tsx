import type { StepCtx } from '../../../../../reels/types';
import { easeOut, seg, lerp, clamp, easeOutBack } from '../../../../../reels/anim';
import { Code } from '../../../../../reels/Code';
import { Draw, Stack, Svg, T, C, Reticle, Decode } from '../../../../../reels/kit';

// Holding a span's own guard across an await lets it leak onto
// whatever runs next on the same thread; .instrument(span) and
// #[instrument] both fix it the identical, correct way, by exiting
// and re-entering the span around every real await instead.
const fa = (t: number, a: number, d = 0.4) => easeOut(seg(t, a, a + d));
// ── Moves shared by this topic's measured, quoted and recap figures ─────────
/** Eased 0..1 from `a` over `d` seconds. */
const ez = (t: number, a: number, d = 0.4) => easeOut(seg(t, a, a + d));

/** A caption line that slides in from the left on its beat; its marker draws itself (tick, cross) or grows (dot). */
function Line({ t, at, y, text, mark = 'dot', mf = C.caramel, f = C.crema }: { t: number; at: number; y: number; text: string; mark?: 'dot' | 'tick' | 'cross'; mf?: string; f?: string }) {
  const k = ez(t, at, 0.45);
  const m = ez(t, at + 0.2, 0.35);
  if (k <= 0) return null;
  return (
    <g opacity={k} transform={`translate(${(-28 * (1 - k)).toFixed(2)} 0)`}>
      {mark === 'dot' && <circle cx={30} cy={y - 5} r={5 * m} fill={mf} />}
      {mark === 'tick' && <path d={`M23 ${y - 5} l5 5 l10 -11`} fill="none" stroke={mf} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" strokeDasharray={24} strokeDashoffset={24 * (1 - m)} />}
      {mark === 'cross' && <path d={`M24 ${y - 11} l12 12 M36 ${y - 11} l-12 12`} fill="none" stroke={mf} strokeWidth={2.5} strokeLinecap="round" strokeDasharray={34} strokeDashoffset={34 * (1 - m)} />}
      <T x={48} y={y} s={13} f={f}>
        {text}
      </T>
    </g>
  );
}

/**
 * A quoted source: the quote panel rises into place, a rule draws down its left edge, each quoted line slides in on
 * its beat, and the line that carries the point gets an underline drawn under it once the quote has landed.
 */
function Quote({ t, lines, y0 = 40, gap = 40, hot, at = 0.25, beat = 0.55 }: { t: number; lines: string[]; y0?: number; gap?: number; hot: number; at?: number; beat?: number }) {
  const k = ez(t, 0, 0.5);
  const top = y0 - 26;
  const bottom = y0 + (lines.length - 1) * gap + 16;
  const u = at + lines.length * beat;
  return (
    <g>
      <rect x={14} y={top + (1 - k) * 14} width={572} height={bottom - top} rx={6} fill={C.roast} opacity={k} />
      <Draw pts={[[26, top + 8], [26, bottom - 8]]} t={t} from={0.15} to={0.15 + beat * lines.length} stroke={C.taupe} w={2} pen={false} />
      {lines.map((l, i) => {
        const s = ez(t, at + i * beat, 0.45);
        return (
          <g key={l} opacity={s} transform={`translate(${(-22 * (1 - s)).toFixed(2)} 0)`}>
            <T x={42} y={y0 + i * gap} s={14} f={i === hot ? C.focus : C.crema} serif italic>
              {l}
            </T>
          </g>
        );
      })}
      <Draw pts={[[42, y0 + hot * gap + 8], [42 + Math.min(520, lines[hot].length * 7.2), y0 + hot * gap + 8]]} t={t} from={u} to={u + 0.5} stroke={C.focus} w={1.5} />
    </g>
  );
}

/**
 * The recap as a payoff: a spine draws down the left, each point's tick is drawn as the spine reaches it and the
 * point slides in beside it, and the last point, the one the topic stands on, is locked on once it lands.
 */
function RecapList({ t, rows, label, y0 = 50, gap = 58, h = 300 }: { t: number; rows: string[]; label: string; y0?: number; gap?: number; h?: number }) {
  const beat = 2.2 / rows.length;
  const at = (i: number) => 0.2 + i * beat;
  const last = rows.length - 1;
  return (
    <Svg label={label} h={h}>
      <Draw pts={[[30, y0 - 5], [30, y0 - 5 + last * gap]]} t={t} from={at(0)} to={at(last)} stroke={C.mocha} w={2} pen={false} />
      {rows.map((r, i) => {
        const k = ez(t, at(i), 0.45);
        const m = ez(t, at(i) + 0.1, 0.35);
        const y = y0 + i * gap;
        const f = i === last ? C.focus : C.caramel;
        return (
          <g key={r}>
            <circle cx={30} cy={y - 5} r={11 * m} fill={C.espresso} stroke={f} strokeWidth={1.5} opacity={m} />
            <path d={`M24 ${y - 5} l4 4 l8 -9`} fill="none" stroke={f} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" strokeDasharray={20} strokeDashoffset={20 * (1 - m)} />
            <g opacity={k} transform={`translate(${(-24 * (1 - k)).toFixed(2)} 0)`}>
              <T x={52} y={y} s={13} f={i === last ? C.focus : C.crema} w={i === last ? 600 : 500}>
                {r}
              </T>
            </g>
          </g>
        );
      })}
      <Reticle x={300} y={y0 + last * gap - 5} w={576} h={38} t={t} at={at(last) + 0.45} />
    </Svg>
  );
}


// ── 1 · Does the guard leak onto task_b (predict) ────────────────────────
export function BadPredict({ t }: StepCtx) {
  return (
    <Stack>
      <Code
        title="task_a holds the guard, then awaits"
        lines={['let _entered = span.enter();', 'sleep(50ms).await; // task_b runs meanwhile']}
        t={t}
        start={0.1}
        end={2.6}
        highlight={[1]}
      />
    </Stack>
  );
}

// ── 2 · Measured: the held guard mislabels task_b ──────────────────────────
// Two tasks on one thread. task_a enters its span and holds the guard across an await: its bracket keeps drawing on
// while task_a sits paused. task_b runs in that gap and emits its event, which drops inside task_a's open bracket
// and decodes with the wrong span's name.
export function BadReveal({ t }: StepCtx) {
  const drop = easeOutBack(seg(t, 1.4, 1.8));
  return (
    <Svg label="span_demo, captured" h={240}>
      <T x={30} y={55} s={13} f={C.crema} o={ez(t, 0)}>task_a</T>
      <T x={30} y={115} s={13} f={C.crema} o={ez(t, 0)}>task_b</T>
      <Draw pts={[[120, 50], [230, 50]]} t={t} from={0.1} to={0.5} stroke={C.caramel} w={8} pen={false} />
      <Draw pts={[[230, 50], [440, 50]]} t={t} from={0.5} to={1.3} stroke={C.mocha} w={2} dash="4 4" pen={false} />
      <T x={335} y={40} s={13} a="middle" f={C.taupe} o={ez(t, 0.6)}>await</T>
      <Draw pts={[[250, 110], [420, 110]]} t={t} from={0.8} to={1.3} stroke={C.second} w={8} pen={false} />
      <Draw pts={[[120, 76], [120, 84], [470, 84], [470, 76]]} t={t} from={0.2} to={1.4} stroke={C.cherryText} w={2} />
      <T x={480} y={89} s={13} f={C.cherryText} o={ez(t, 1.2)}>span a</T>
      <circle cx={335} cy={lerp(110, 84, clamp(drop))} r={7} fill={C.focus} opacity={ez(t, 1.3, 0.1)} />
      <Decode text="span: task_a" t={t} at={1.8} dur={0.4} x={335} y={146} s={13} a="middle" f={C.cherryText} w={600} />
      <Line t={t} at={1.2} y={196} text="task_b emits its own, real event" />
      <Line t={t} at={1.9} y={230} text="current span: task_a (wrong)" mark="cross" mf={C.cherryText} />
    </Svg>
  );
}

// ── 3 · Does .instrument(span) still leak it (predict) ───────────────────
export function InstrumentPredict({ t }: StepCtx) {
  return (
    <Stack>
      <Code
        title="task_a wraps the future instead of entering by hand"
        lines={['async { sleep(50ms).await }', '    .instrument(span).await // still leaks?']}
        t={t}
        start={0.1}
        end={2.6}
        highlight={[1]}
      />
    </Stack>
  );
}

// ── 4 · Measured: instrument(span) genuinely fixes it (takeaway) ────────
export function InstrumentReveal({ t }: StepCtx) {
  const exitX = easeOut(seg(t, 0.2, 0.4)) * 90 + 50;
  const travel = easeOut(seg(t, 0.45, 0.75));
  return (
    <Svg label="span_demo, captured" h={200}>
      <rect x={50} y={30} width={90} height={36} rx={6} fill="none" stroke={C.caramel} strokeWidth={1.5} opacity={fa(t, 0.1, 0.2)} />
      <T x={95} y={52} s={11} a="middle" f={C.crema} o={fa(t, 0.1, 0.2)}>task_a span</T>
      <circle cx={exitX} cy={48} r={5} fill={C.caramel} opacity={fa(t, 0.2, 0.2)} />
      <Draw pts={[[140, 48], [260, 48]]} t={t} from={0.45} to={0.75} stroke={C.latte} w={2} pen />
      <circle cx={140 + travel * 120} cy={48} r={5} fill={C.cherry} opacity={fa(t, 0.45, 0.2)} />
      <g opacity={fa(t, 0.85, 0.3)}>
        <rect x={160} y={80} width={180} height={40} rx={6} fill="none" stroke={C.caramel} strokeWidth={2} />
        <T x={250} y={105} s={12} a="middle" f={C.mocha}>current span: none, correct</T>
      </g>
      <T x={60} y={150} s={13} f={C.latte} o={fa(t, 1.4, 0.4)}>exited and re-entered around the await</T>
    </Svg>
  );
}

// ── 5 · Does the macro behave the same, correct way (predict) ───────────
export function MacroPredict({ t }: StepCtx) {
  return (
    <Stack>
      <Code
        title="the plain function, written with the attribute"
        lines={['#[tracing::instrument]', 'async fn task_a() { sleep(50ms).await } // same fix?']}
        t={t}
        start={0.1}
        end={2.6}
        highlight={[1]}
      />
    </Stack>
  );
}

// ── 6 · Measured: the macro matches instrument(span) exactly (takeaway) ─
export function MacroReveal({ t }: StepCtx) {
  const travelA = easeOut(seg(t, 0.25, 0.55));
  const travelB = easeOut(seg(t, 0.4, 0.7));
  return (
    <Svg label="span_demo, captured" h={200}>
      <T x={50} y={35} s={11} f={C.latte} o={fa(t, 0.1, 0.2)}>.instrument(span)</T>
      <T x={50} y={70} s={11} f={C.latte} o={fa(t, 0.25, 0.2)}>#[instrument]</T>
      <Draw pts={[[150, 30], [250, 95]]} t={t} from={0.25} to={0.55} stroke={C.caramel} w={2} pen />
      <Draw pts={[[150, 65], [250, 95]]} t={t} from={0.4} to={0.7} stroke={C.caramel} w={2} pen />
      <circle cx={150 + travelA * 100} cy={30 + travelA * 65} r={5} fill={C.caramel} opacity={fa(t, 0.25, 0.2)} />
      <circle cx={150 + travelB * 100} cy={65 + travelB * 30} r={5} fill={C.caramel} opacity={fa(t, 0.4, 0.2)} />
      <g opacity={fa(t, 0.85, 0.3)}>
        <rect x={190} y={95} width={160} height={40} rx={6} fill="none" stroke={C.caramel} strokeWidth={2} />
        <T x={270} y={120} s={12} a="middle" f={C.mocha}>current span: none, identical</T>
      </g>
      <T x={60} y={160} s={13} f={C.latte} o={fa(t, 1.3, 0.4)}>generated code, not a different mechanism</T>
    </Svg>
  );
}

// ── 7 · tracing's own docs, quoted (connecting) ────────────────────────────
// The quote lands; under it, the instrumented task runs in polls. Its span bracket now opens at the start of each
// poll and closes as it pauses, so the gaps where other tasks run are left outside it.
export function DocsReveal({ t }: StepCtx) {
  const polls = [
    [130, 210],
    [290, 360],
    [440, 540],
  ];
  return (
    <Svg label="tracing's own docs, quoted" h={220}>
      <Quote t={t} lines={['holding the guard: incorrect traces', 'entered every time the future is polled']} hot={1} y0={40} gap={38} beat={0.45} />
      <T x={30} y={146} s={13} f={C.crema} o={ez(t, 0.7)}>task</T>
      {polls.map(([a, b], i) => {
        const at = 1.0 + i * 0.45;
        return (
          <g key={a}>
            <Draw pts={[[a, 141], [b, 141]]} t={t} from={at} to={at + 0.3} stroke={C.caramel} w={8} pen={false} />
            <Draw pts={[[a, 160], [a, 168], [b, 168], [b, 160]]} t={t} from={at} to={at + 0.35} stroke={C.second} w={2} pen={false} />
          </g>
        );
      })}
      <T x={250} y={192} s={13} a="middle" f={C.taupe} o={ez(t, 1.4)}>other</T>
      <T x={400} y={192} s={13} a="middle" f={C.taupe} o={ez(t, 1.9)}>other</T>
    </Svg>
  );
}

// ── 8 · Recap ──────────────────────────────────────────────────────────────
export function Recap({ t }: StepCtx) {
  return (
    <RecapList
      t={t}
      label="recap: a span tied to being polled"
      rows={['a held guard leaks onto whatever runs next', 'instrument(span): exit and re-enter it', 'the attribute macro: the identical fix']}
      gap={70}
      y0={60}
    />
  );
}
