import type { StepCtx } from '../../../../../reels/types';
import { easeOut, seg, lerp, easeInOut } from '../../../../../reels/anim';
import { Code } from '../../../../../reels/Code';
import { Draw, Stack, Svg, T, C, Reticle } from '../../../../../reels/kit';

// A documented safety contract plus a real guard that genuinely
// enforces it is what makes unsafe code sound: no safe caller can ever
// reach undefined behavior through it.
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


// ── 1 · Does a real guard keep a contract sound (predict, hook) ─────────
export function GuardPredict({ t }: StepCtx) {
  return (
    <Stack>
      <Code
        title="an unsafe function, a documented contract, a guard"
        lines={['buf.get_guarded(index);', '// a real guard in front -- still unsound?']}
        t={t}
        start={0.1}
        end={2.6}
        highlight={[1]}
      />
    </Stack>
  );
}

// ── 2 · Measured: every in-contract call correct ───────────────────────────
// The buffer's slots sit behind a guard that checks the index against the length. Three in-contract indices travel
// to it one after another; the gate lifts for each, the index drops onto its slot, and that slot's value is ticked.
export function InContractReveal({ t }: StepCtx) {
  const idx = [0, 3, 7];
  const sx = (i: number) => 150 + i * 50;
  return (
    <Svg label="safety_contracts_bound_what_a_caller_can_trigger.rs" h={240}>
      {Array.from({ length: 8 }, (_, i) => (
        <rect key={i} x={sx(i) - 20} y={100} width={40} height={34} rx={4} fill="none" stroke={idx.includes(i) && t > 0.9 + idx.indexOf(i) * 0.5 ? C.focus : C.mocha} strokeWidth={2} opacity={ez(t, i * 0.04)} />
      ))}
      <T x={20} y={122} s={13} f={C.latte} o={ez(t, 0)}>buffer</T>
      <g opacity={ez(t, 0.1)}>
        <rect x={20} y={30} width={86} height={34} rx={6} fill="none" stroke={C.second} strokeWidth={2} />
        <T x={63} y={52} s={13} a="middle" f={C.second}>guard</T>
      </g>
      {idx.map((i, n) => {
        const a = 0.3 + n * 0.5;
        const go = easeInOut(seg(t, a, a + 0.45));
        const drop = easeInOut(seg(t, a + 0.45, a + 0.6));
        return (
          <g key={i}>
            {go > 0 && <circle cx={lerp(106, sx(i), go)} cy={lerp(47, 80, drop)} r={6} fill={C.second} opacity={1 - ez(t, a + 0.6, 0.2)} />}
            <path d={`M${sx(i) - 8} 152 l5 5 l10 -11`} fill="none" stroke={C.focus} strokeWidth={2.5} strokeDasharray={24} strokeDashoffset={24 * (1 - ez(t, a + 0.6, 0.25))} />
          </g>
        );
      })}
      <Line t={t} at={1.3} y={196} text="three real indices: every value correct" mark="tick" />
      <Line t={t} at={2.0} y={230} text="the guard let every one of them through" mf={C.second} />
    </Svg>
  );
}

// ── 3 · Does the guard still let bad requests through (predict) ─────────
export function RejectPredict({ t }: StepCtx) {
  return (
    <Stack>
      <Code
        title="three real requests, outside the real contract"
        lines={['buf.get_guarded(8); buf.get_guarded(9); buf.get_guarded(100);', '// any of them reach the unsafe code?']}
        t={t}
        start={0.1}
        end={2.6}
        highlight={[1]}
      />
    </Stack>
  );
}

// ── 4 · Measured: every out-of-contract request rejected ───────────────────
// Three out-of-contract requests fly at the guard and each bounces back, struck out. Behind the guard, the unsafe
// function's call counter is an empty tally that never gains a mark.
export function RejectReveal({ t }: StepCtx) {
  return (
    <Svg label="safety_contracts_bound_what_a_caller_can_trigger.rs" h={250}>
      <rect x={290} y={20} width={10} height={90} rx={2} fill={C.second} opacity={ez(t, 0.1)} />
      <T x={295} y={128} s={13} a="middle" f={C.second} o={ez(t, 0.1)}>guard</T>
      <rect x={400} y={36} width={170} height={60} rx={6} fill="none" stroke={C.cherryText} strokeWidth={2} strokeDasharray="5 4" opacity={ez(t, 0.1)} />
      <T x={485} y={60} s={13} a="middle" f={C.crema} o={ez(t, 0.1)}>unsafe calls</T>
      <rect x={445} y={70} width={80} height={14} rx={3} fill="none" stroke={C.mocha} strokeWidth={1.5} opacity={ez(t, 0.1)} />
      {[0, 1, 2].map((i) => {
        const a = 0.3 + i * 0.35;
        const go = easeInOut(seg(t, a, a + 0.3));
        const back = easeOut(seg(t, a + 0.3, a + 0.6));
        const y = 40 + i * 25;
        return (
          <g key={i}>
            {go > 0 && back < 1 && <circle cx={lerp(60, 282, go) - back * 120} cy={y} r={6} fill={C.cherryText} />}
            <path d={`M${250} ${y - 6} l12 12 m0 -12 l-12 12`} stroke={C.cherryText} strokeWidth={2} strokeDasharray={34} strokeDashoffset={34 * (1 - ez(t, a + 0.3, 0.25))} />
          </g>
        );
      })}
      <Reticle x={485} y={77} w={96} h={28} t={t} at={1.6} />
      <Line t={t} at={0.4} y={170} text="three real requests, outside the contract" mark="cross" mf={C.cherryText} />
      <Line t={t} at={1.3} y={204} text="the unsafe call counter: unmoved, genuinely" />
      <Line t={t} at={1.9} y={238} text="a sound guard rejects all of it, not most" mark="tick" />
    </Svg>
  );
}

// ── 5 · Would an unguarded caller violate the contract (predict) ────────
export function UnguardedPredict({ t }: StepCtx) {
  return (
    <Stack>
      <Code
        title="the identical inputs, no real guard this time"
        lines={['8 >= buf.data.len(); 9 >= buf.data.len(); 100 >= buf.data.len();', '// genuinely outside the contract?']}
        t={t}
        start={0.1}
        end={2.6}
        highlight={[1]}
      />
    </Stack>
  );
}

// ── 6 · Measured: the identical inputs are out of contract ─────────────────
// No guard this time, just the documented bound: the buffer ends at its length line. Each of the identical inputs
// is drawn as an index arrow reaching along the buffer, and every one overshoots the bound and is struck out.
export function UnguardedReveal({ t }: StepCtx) {
  const reach = [380, 420, 540];
  return (
    <Svg label="safety_contracts_bound_what_a_caller_can_trigger.rs" h={250}>
      {Array.from({ length: 8 }, (_, i) => (
        <rect key={i} x={40 + i * 40} y={40} width={34} height={30} rx={3} fill="none" stroke={C.mocha} strokeWidth={1.5} opacity={ez(t, i * 0.03)} />
      ))}
      <Draw pts={[[360, 28], [360, 140]]} t={t} from={0.2} to={0.4} stroke={C.focus} w={2} dash="4 3" pen={false} />
      <T x={366} y={26} s={13} f={C.focus} o={ez(t, 0.3)}>len</T>
      {reach.map((x, i) => {
        const a = 0.5 + i * 0.3;
        return (
          <g key={x}>
            <Draw pts={[[40, 90 + i * 18], [x, 90 + i * 18]]} t={t} from={a} to={a + 0.35} stroke={C.cherryText} w={2} />
            <path d={`M${x + 6} ${84 + i * 18} l12 12 m0 -12 l-12 12`} stroke={C.cherryText} strokeWidth={2} strokeDasharray={34} strokeDashoffset={34 * (1 - ez(t, a + 0.35, 0.2))} />
          </g>
        );
      })}
      <Line t={t} at={0.3} y={170} text="the identical inputs, checked directly" />
      <Line t={t} at={1.4} y={204} text="every one: genuinely outside the contract" mark="cross" mf={C.cherryText} />
      <Line t={t} at={1.9} y={238} text={'"my callers don\'t" is weaker than a guard'} />
    </Svg>
  );
}

// ── 7 · Two sources agree (connecting) ─────────────────────────────────────
// The quote lands; under it, safe callers throw every index they like at the guarded function. In-range ones pass
// through to the unsafe core; out-of-range ones bounce off the guard. No safe call ever reaches the core wrongly.
export function DocsReveal({ t }: StepCtx) {
  const shots = [
    { ok: true, y: 136 },
    { ok: false, y: 150 },
    { ok: true, y: 164 },
    { ok: false, y: 178 },
  ];
  return (
    <Svg label="Rust Reference / API Guidelines, quoted" h={220}>
      <Quote t={t} lines={['sound: no safe caller can trigger real UB', 'a Safety section writes down the contract']} hot={0} y0={40} gap={38} beat={0.45} />
      <T x={30} y={162} s={13} f={C.latte} o={ez(t, 0.6)}>safe callers</T>
      <rect x={290} y={122} width={10} height={70} rx={2} fill={C.second} opacity={ez(t, 0.7)} />
      <rect x={420} y={130} width={150} height={56} rx={6} fill="none" stroke={C.cherryText} strokeWidth={2} strokeDasharray="5 4" opacity={ez(t, 0.7)} />
      <T x={495} y={163} s={13} a="middle" f={C.cherryText} o={ez(t, 0.7)}>unsafe core</T>
      {shots.map((s, i) => {
        const a = 0.9 + i * 0.35;
        const go = easeInOut(seg(t, a, a + 0.35));
        const back = easeOut(seg(t, a + 0.35, a + 0.6));
        const x = s.ok ? lerp(175, 420, go) : lerp(175, 284, go) - back * 70;
        return go > 0 && (s.ok ? go < 1 : back < 1) ? <circle key={i} cx={x} cy={s.y} r={5} fill={s.ok ? C.focus : C.cherryText} /> : null;
      })}
      <Reticle x={295} y={157} w={40} h={84} t={t} at={2.4} color={C.second} />
    </Svg>
  );
}

// ── 8 · Recap ──────────────────────────────────────────────────────────────
export function Recap({ t }: StepCtx) {
  return (
    <RecapList
      t={t}
      label="recap: a real contract, a real guard, measured"
      rows={['a documented contract names the real rule', 'a real guard enforces it, before any call', 'no safe caller can ever trigger real UB']}
      gap={70}
      y0={60}
    />
  );
}
