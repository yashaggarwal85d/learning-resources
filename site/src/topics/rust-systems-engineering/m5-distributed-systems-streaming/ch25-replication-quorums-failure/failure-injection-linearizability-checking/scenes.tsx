import type { StepCtx } from '../../../../../reels/types';
import { easeOut, seg, lerp, easeInOut } from '../../../../../reels/anim';
import { Code } from '../../../../../reels/Code';
import { Draw, Stack, Svg, T, C, Reticle } from '../../../../../reels/kit';

// A recorded history gathered under several real, independent failures can
// be mechanically checked for linearizability; only the failures an actual
// read observes ever show up as a violation, and a brute-force checker
// finds the real answer by genuine enumeration, never by assumption.
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

/** A small boxed label that rises into place on its beat (a stage in a pipeline, a node, an artifact). */
function Box({ t, at, x, y, w, label, f = C.crema, stroke = C.caramel }: { t: number; at: number; x: number; y: number; w: number; label: string; f?: string; stroke?: string }) {
  const k = ez(t, at, 0.4);
  return (
    <g opacity={k} transform={`translate(0 ${((1 - k) * 12).toFixed(2)})`}>
      <rect x={x} y={y} width={w} height={36} rx={6} fill="none" stroke={stroke} strokeWidth={2} />
      <T x={x + w / 2} y={y + 23} s={13} a="middle" f={f}>
        {label}
      </T>
    </g>
  );
}


// ── 1 · Does the failure history check out (predict) ──────────────────────
export function FailureHistoryPredict({ t }: StepCtx) {
  return (
    <Stack>
      <Code
        title="a delayed ack and a duplicated message, injected together"
        lines={['let history = build_history_with_failures(true);', 'check_linearizability(&history) -- consistent with any real order?']}
        t={t}
        start={0.1}
        end={2.6}
        highlight={[1]}
      />
    </Stack>
  );
}

// ── 2 · Measured: not linearizable ────────────────────────────────────────
// The recorded history draws on a timeline: a write finishes, then a read returns the stale value. The checker's
// cursor then sweeps every candidate order; each one is struck out as it fails, and the verdict decodes.
export function FailureHistoryReveal({ t }: StepCtx) {
  const sweep = easeInOut(seg(t, 0.9, 2.1));
  const chips = [0, 1, 2, 3, 4, 5];
  return (
    <Svg label="failure_injection_linearizability_checker.rs, measured" h={230}>
      <Draw pts={[[40, 34], [250, 34]]} t={t} from={0.1} to={0.5} stroke={C.caramel} w={8} pen={false} />
      <T x={40} y={22} s={13} f={C.latte} o={ez(t, 0.1)}>write</T>
      <Draw pts={[[320, 34], [540, 34]]} t={t} from={0.45} to={0.85} stroke={C.cherryText} w={8} pen={false} />
      <T x={320} y={22} s={13} f={C.cherryText} o={ez(t, 0.45)}>stale read</T>
      {chips.map((i) => {
        const x = 70 + i * 82;
        const hit = sweep * 520 + 40 > x + 20;
        return (
          <g key={i} opacity={ez(t, 0.6 + i * 0.05)}>
            <rect x={x} y={62} width={44} height={30} rx={4} fill="none" stroke={hit ? C.mocha : C.latte} strokeWidth={1.5} />
            <rect x={x + 6} y={70} width={14} height={5} rx={1} fill={C.latte} />
            <rect x={x + 24} y={79} width={14} height={5} rx={1} fill={C.latte} />
            {hit && <path d={`M${x + 12} 67 l20 20 m0 -20 l-20 20`} stroke={C.cherryText} strokeWidth={2.2} />}
          </g>
        );
      })}
      {sweep > 0 && sweep < 1 && <line x1={40 + sweep * 520} y1={56} x2={40 + sweep * 520} y2={98} stroke={C.focus} strokeWidth={2} />}
      <Line t={t} at={1.0} y={140} text="candidates checked: every real total order" />
      <Line t={t} at={2.0} y={180} text="genuinely not linearizable" mark="cross" mf={C.cherryText} f={C.focus} />
      <Reticle x={165} y={175} w={320} h={32} t={t} at={2.3} color={C.cherryText} />
    </Svg>
  );
}

// ── 3 · Which failure does the checker name (predict) ──────────────────────
export function AttributionPredict({ t }: StepCtx) {
  return (
    <Stack>
      <Code
        title="two failures injected, only one shows up"
        lines={['// delayed ack: a read sees a stale value', '// duplicated message: applied twice, idempotent']}
        t={t}
        start={0.1}
        end={2.6}
        highlight={[1]}
      />
    </Stack>
  );
}

// ── 4 · Measured: the checker names the delayed-ack read ───────────────────
// The history's two suspect reads sit on its timeline. The checker's cursor sweeps them: the delayed-ack read turns
// red and is locked on as the violation; the duplicated message's read passes with a quiet tick, idempotent.
export function AttributionReveal({ t }: StepCtx) {
  const sweep = easeInOut(seg(t, 0.5, 1.5));
  const cx = lerp(40, 560, sweep);
  const reads = [
    { x: 170, label: 'delayed-ack read', bad: true },
    { x: 410, label: 'duplicated message', bad: false },
  ];
  return (
    <Svg label="failure_injection_linearizability_checker.rs, measured" h={250}>
      <Draw pts={[[40, 70], [560, 70]]} t={t} from={0} to={0.4} stroke={C.mocha} w={1.5} pen={false} />
      {reads.map((r) => {
        const hit = cx > r.x;
        return (
          <g key={r.label} opacity={ez(t, 0.2)}>
            <rect x={r.x - 60} y={58} width={120} height={24} rx={4} fill="none" stroke={hit ? (r.bad ? C.cherryText : C.latte) : C.mocha} strokeWidth={2} />
            <T x={r.x} y={110} s={13} a="middle" f={hit && r.bad ? C.cherryText : C.latte}>
              {r.label}
            </T>
            {!r.bad && <path d={`M${r.x - 8} 70 l5 5 l10 -11`} fill="none" stroke={C.latte} strokeWidth={2} strokeDasharray={24} strokeDashoffset={24 * (1 - ez(t, 0.5 + ((r.x - 40) / 520) * 1.0, 0.25))} />}
          </g>
        );
      })}
      {sweep > 0 && sweep < 1 && <line x1={cx} y1={46} x2={cx} y2={94} stroke={C.focus} strokeWidth={2} />}
      <Reticle x={170} y={70} w={136} h={40} t={t} at={1.6} color={C.cherryText} />
      <Line t={t} at={0.3} y={170} text="the checker names the real violation directly" />
      <Line t={t} at={1.2} y={204} text="the delayed-ack read, not the duplicated one" mark="cross" mf={C.cherryText} />
      <Line t={t} at={1.9} y={238} text="idempotent, so the duplicate was harmless" mark="tick" />
    </Svg>
  );
}

// ── 5 · Does fixing the stale read fix the history (predict) ───────────────
export function FixedHistoryPredict({ t }: StepCtx) {
  return (
    <Stack>
      <Code
        title="the identical failures, the lagging replica now caught up"
        lines={['let history = build_history_with_failures(false);', '// the duplicated message is still injected -- fixed now?']}
        t={t}
        start={0.1}
        end={2.6}
        highlight={[1]}
      />
    </Stack>
  );
}

// ── 6 · Measured: genuinely linearizable now (takeaway) ────────────────────
export function FixedHistoryReveal({ t }: StepCtx) {
  const catchUp = easeOut(seg(t, 0.5, 0.85));
  return (
    <Svg label="failure_injection_linearizability_checker.rs, measured" h={200}>
      <T x={60} y={50} s={14} f={C.crema} o={fa(t, 0.3, 0.4)}>the lagging replica caught up before any read</T>
      <T x={70} y={80} s={12} f={C.latte} o={fa(t, 0.4, 0.3)}>replica, catching up</T>
      <circle cx={190 + catchUp * 90} cy={76} r={5} fill={C.caramel} opacity={fa(t, 0.4, 0.2)} />
      <T x={70} y={115} s={12} f={C.latte} o={fa(t, 0.9, 0.3)}>duplicated message: still injected</T>
      <circle cx={260} cy={111} r={5} fill={C.taupe} opacity={fa(t, 0.9, 0.2)} />
      {fa(t, 1.2, 0.4) > 0.85 && <T x={190} y={140} s={13} a="middle" f={C.mocha}>linearizable, failure still injected</T>}
      <T x={60} y={170} s={13} f={C.latte} o={fa(t, 1.6, 0.3)}>unobserved failures never show up at all</T>
    </Svg>
  );
}

// ── 7 · How many orders does a concurrent pair allow (predict) ─────────────
export function ConcurrentPredict({ t }: StepCtx) {
  return (
    <Stack>
      <Code
        title="a read genuinely overlapping a write, in real time"
        lines={['// read starts before the write ends, ends before it ends too', 'check_linearizability(&concurrent_history) -- how many real orders?']}
        t={t}
        start={0.1}
        end={2.6}
        highlight={[1]}
      />
    </Stack>
  );
}

// ── 8 · Measured: exactly two orders ───────────────────────────────────────
// A write and a read overlap in time. The checker pulls each into a sequence both ways round: write first, then
// read first. Both orders respect real-time precedence, so both get a tick.
export function ConcurrentReveal({ t }: StepCtx) {
  const a = easeInOut(seg(t, 0.7, 1.3));
  const b = easeInOut(seg(t, 1.3, 1.9));
  const chip = (x: number, y: number, label: string, f: string) => (
    <g transform={`translate(${x.toFixed(1)} ${y.toFixed(1)})`}>
      <rect x={-34} y={-14} width={68} height={26} rx={4} fill="none" stroke={f} strokeWidth={1.5} />
      <T x={0} y={4} s={13} a="middle" f={f}>
        {label}
      </T>
    </g>
  );
  return (
    <Svg label="failure_injection_linearizability_checker.rs, measured" h={230}>
      <Draw pts={[[60, 30], [330, 30]]} t={t} from={0.1} to={0.5} stroke={C.caramel} w={8} pen={false} />
      <Draw pts={[[200, 54], [470, 54]]} t={t} from={0.25} to={0.65} stroke={C.second} w={8} pen={false} />
      <T x={340} y={35} s={13} f={C.latte} o={ez(t, 0.4)}>write</T>
      <T x={480} y={59} s={13} f={C.latte} o={ez(t, 0.55)}>read</T>
      <g opacity={ez(t, 0.7, 0.2)}>
        {chip(lerp(195, 160, a), lerp(54, 100, a), 'write', C.caramel)}
        {chip(lerp(335, 240, a), lerp(54, 100, a), 'read', C.second)}
      </g>
      <g opacity={ez(t, 1.3, 0.2)}>
        {chip(lerp(335, 440, b), lerp(54, 100, b), 'write', C.caramel)}
        {chip(lerp(195, 360, b), lerp(54, 100, b), 'read', C.second)}
      </g>
      <path d="M192 128 l6 6 l12 -13" fill="none" stroke={C.focus} strokeWidth={2.5} strokeDasharray={30} strokeDashoffset={30 * (1 - ez(t, 1.4, 0.3))} />
      <path d="M392 128 l6 6 l12 -13" fill="none" stroke={C.focus} strokeWidth={2.5} strokeDasharray={30} strokeDashoffset={30 * (1 - ez(t, 2.0, 0.3))} />
      <Line t={t} at={1.2} y={178} text="write first or read first: both real orders" />
      <Line t={t} at={2.0} y={214} text="both genuinely respect real-time precedence" mark="tick" />
    </Svg>
  );
}

// ── 9 · Jepsen's own structure (connecting) ──────────────────────────────
// The quote lands line by line, and its structure assembles under it on the same beats: the generator's ops flow
// into a recorded history, a nemesis strikes the flow with a fault, and the checker at the end decides.
export function JepsenReveal({ t }: StepCtx) {
  const op = (seg(t, 0.9, 2.6) * 3) % 1;
  return (
    <Svg label="Jepsen README, quoted" h={270}>
      <Quote t={t} lines={['a generator makes ops; a history records them', 'a nemesis injects real faults', 'a checker decides correctness']} hot={2} y0={38} gap={34} beat={0.5} />
      <Box t={t} at={0.35} x={20} y={160} w={140} label="generator" />
      <Draw pts={[[162, 178], [228, 178]]} t={t} from={0.6} to={0.8} stroke={C.latte} w={2} />
      <Box t={t} at={0.7} x={230} y={160} w={140} label="history" />
      <Draw pts={[[372, 178], [438, 178]]} t={t} from={1.6} to={1.8} stroke={C.latte} w={2} />
      <Box t={t} at={1.6} x={440} y={160} w={140} label="checker" />
      {t > 0.9 && t < 2.6 && <circle cx={lerp(165, 225, op)} cy={178} r={4} fill={C.focus} />}
      <Draw pts={[[195, 248], [185, 228], [203, 214], [193, 190]]} t={t} from={1.1} to={1.4} stroke={C.cherryText} w={2.5} />
      <T x={215} y={250} s={13} f={C.cherryText} o={ez(t, 1.1)}>nemesis</T>
      <Reticle x={510} y={178} w={150} h={50} t={t} at={2.2} />
    </Svg>
  );
}

// ── 10 · Recap ─────────────────────────────────────────────────────────────
export function Recap({ t }: StepCtx) {
  return (
    <RecapList
      t={t}
      label="recap: checking a real history, not assuming it"
      rows={['two failures injected together: one shows up', 'the checker names the real one, mechanically', 'same duplicate, fixed replica: linearizable', 'a concurrent pair: exactly two real orders']}
    />
  );
}
