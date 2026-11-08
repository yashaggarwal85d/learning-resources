import type { StepCtx } from '../../../../../reels/types';
import { easeOut, seg, lerp, easeInOut } from '../../../../../reels/anim';
import { Code } from '../../../../../reels/Code';
import { Draw, Stack, Svg, T, C, Reticle } from '../../../../../reels/kit';

// Two unrelated counters sharing one real cache line genuinely pay a
// real, growing invalidation cost; padding each counter onto its own
// real cache line genuinely removes that cost entirely.
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

/**
 * Two cores take turns writing their own counter. Each write travels from its core into the counter's slot. With one
 * shared line, every write that follows the other core's knocks the line out of that core's cache: a red ripple
 * runs back to it and a tally mark lands. Padded, each counter has its own line, so nothing ripples and the tally
 * stays empty.
 */
function Cores({ t, padded }: { t: number; padded: boolean }) {
  const writes = [0, 1, 2, 3];
  const at = (i: number) => 0.5 + i * 0.35;
  const la = padded ? 200 : 230;
  const lb = padded ? 330 : 300;
  return (
    <g>
      {[
        { x: 30, label: 'core a' },
        { x: 470, label: 'core b' },
      ].map((c) => (
        <g key={c.label} opacity={ez(t, 0)}>
          <rect x={c.x} y={40} width={100} height={40} rx={6} fill="none" stroke={C.latte} strokeWidth={2} />
          <T x={c.x + 50} y={65} s={13} a="middle" f={C.crema}>
            {c.label}
          </T>
        </g>
      ))}
      <g opacity={ez(t, 0.2)}>
        {padded ? (
          <>
            <rect x={lerp(200, 170, ez(t, 0.2, 0.5))} y={45} width={100} height={30} rx={4} fill="none" stroke={C.caramel} strokeWidth={2} />
            <rect x={lerp(200, 330, ez(t, 0.2, 0.5))} y={45} width={100} height={30} rx={4} fill="none" stroke={C.caramel} strokeWidth={2} />
          </>
        ) : (
          <rect x={200} y={45} width={200} height={30} rx={4} fill="none" stroke={C.caramel} strokeWidth={2} />
        )}
        <rect x={la - 8} y={52} width={16} height={16} rx={2} fill={C.latte} />
        <rect x={lb + 54} y={52} width={16} height={16} rx={2} fill={C.latte} />
      </g>
      {writes.map((i) => {
        const fromA = i % 2 === 0;
        const go = easeInOut(seg(t, at(i), at(i) + 0.22));
        const hit = !padded && i > 0;
        const rip = seg(t, at(i) + 0.22, at(i) + 0.5);
        const x0 = fromA ? 130 : 470;
        const x1 = fromA ? la : lb + 62;
        return (
          <g key={i}>
            {go > 0 && go < 1 && <circle cx={lerp(x0, x1, go)} cy={60} r={5} fill={C.focus} />}
            {hit && rip > 0 && rip < 1 && <circle cx={300} cy={60} r={lerp(20, 190, rip)} fill="none" stroke={C.cherryText} strokeWidth={2} opacity={1 - rip} />}
            {hit && <line x1={250 + i * 14} y1={98} x2={250 + i * 14} y2={98 + 22 * ez(t, at(i) + 0.3, 0.2)} stroke={C.cherryText} strokeWidth={3} strokeLinecap="round" />}
          </g>
        );
      })}
      <T x={300} y={140} s={13} a="middle" f={padded ? C.focus : C.cherryText} o={ez(t, 1.9)}>
        {padded ? 'no invalidations' : 'invalidations'}
      </T>
    </g>
  );
}


// ── 1 · Does sharing a line cost the other core anything (predict, hook) ─
export function SharedPredict({ t }: StepCtx) {
  return (
    <Stack>
      <Code
        title="two unrelated counters, one real cache line"
        lines={['count_invalidations_shared(&alternating_writes);', '// costs the other core anything?']}
        t={t}
        start={0.1}
        end={2.6}
        highlight={[1]}
      />
    </Stack>
  );
}

// ── 2 · Measured: a real invalidation cost ─────────────────────────────────
export function SharedReveal({ t }: StepCtx) {
  return (
    <Svg label="false_sharing_costs_a_shared_cache_line.rs" h={220}>
      <Cores t={t} padded={false} />
      <Line t={t} at={1.2} y={176} text="an invalidation on every alternating write" mark="cross" mf={C.cherryText} />
      <Line t={t} at={1.9} y={208} text="unrelated data still pays a real, shared cost" />
    </Svg>
  );
}

// ── 3 · Does padding remove the cost entirely (predict) ──────────────────
export function PaddedPredict({ t }: StepCtx) {
  return (
    <Stack>
      <Code
        title="the identical counters, each its own real line"
        lines={['count_invalidations_padded(&alternating_writes);', '// only reduces the cost, or removes it?']}
        t={t}
        start={0.1}
        end={2.6}
        highlight={[1]}
      />
    </Stack>
  );
}

// ── 4 · Measured: padding avoids it entirely (takeaway) ──────────────────────
export function PaddedReveal({ t }: StepCtx) {
  return (
    <Svg label="false_sharing_costs_a_shared_cache_line.rs" h={220}>
      <Cores t={t} padded />
      <Line t={t} at={1.2} y={176} text="zero cross-core invalidations, genuinely" mark="tick" />
      <Line t={t} at={1.9} y={208} text="padding removes the whole cost, not a share" />
    </Svg>
  );
}

// ── 5 · Does the shared cost grow with more work (predict) ───────────────
export function ScalePredict({ t }: StepCtx) {
  return (
    <Stack>
      <Code
        title="the identical two layouts, far more operations"
        lines={['shared_cost(long_run) vs shared_cost(short_run);', '// grows, or stays fixed?']}
        t={t}
        start={0.1}
        end={2.6}
        highlight={[1]}
      />
    </Stack>
  );
}

// ── 6 · Measured: cost grows with the runs ─────────────────────────────────
// Cost against the number of operations: the shared layout's line draws upward as the runs get longer, while the
// padded layout's line draws flat along zero the whole way, its pen racing level with the other.
export function ScaleReveal({ t }: StepCtx) {
  const ox = 70;
  const oy = 130;
  return (
    <Svg label="false_sharing_costs_a_shared_cache_line.rs" h={230}>
      <Draw pts={[[ox, 20], [ox, oy], [560, oy]]} t={t} from={0} to={0.4} stroke={C.mocha} w={1.5} pen={false} />
      <T x={ox - 10} y={30} s={13} a="end" f={C.taupe} o={ez(t, 0.2)}>cost</T>
      <T x={560} y={oy + 22} s={13} a="end" f={C.taupe} o={ez(t, 0.2)}>operations</T>
      <Draw pts={[[ox, oy], [540, 30]]} t={t} from={0.5} to={1.9} stroke={C.cherryText} w={2.5} />
      <Draw pts={[[ox, oy - 2], [540, oy - 2]]} t={t} from={0.5} to={1.9} stroke={C.second} w={2.5} />
      <T x={430} y={44} s={13} a="end" f={C.cherryText} o={ez(t, 1.6)}>shared</T>
      <T x={540} y={oy - 12} s={13} a="end" f={C.second} o={ez(t, 1.6)}>padded</T>
      <Line t={t} at={1.0} y={186} text="shared layout: cost rises with every run" mf={C.cherryText} />
      <Line t={t} at={1.8} y={218} text="padded layout: stays at zero, every run" mf={C.second} />
    </Svg>
  );
}

// ── 7 · Two sources agree (connecting) ─────────────────────────────────────
// The quote lands; under it, one write lands in a single word of a cache line and the invalidation sweeps across
// the whole line, not just that word. Then padding splits the neighbour off onto a line of its own.
export function DocsReveal({ t }: StepCtx) {
  const sweep = easeInOut(seg(t, 1.1, 1.6));
  const split = easeInOut(seg(t, 1.9, 2.4));
  return (
    <Svg label="crossbeam_utils Docs / Wikipedia, quoted" h={200}>
      <Quote t={t} lines={['one write invalidates the whole real line', 'padding is the real, standard fix']} hot={0} y0={40} gap={38} beat={0.45} />
      <rect x={120} y={130} width={320 * sweep} height={34} rx={4} fill={C.cherry} opacity={(1 - split) * 0.9} />
      {Array.from({ length: 8 }, (_, i) => (
        <rect key={i} x={124 + i * 40 + (i === 7 ? split * 70 : 0)} y={134} width={32} height={26} rx={3} fill="none" stroke={i === 1 ? C.focus : i === 7 ? C.second : C.latte} strokeWidth={i === 1 || i === 7 ? 2.5 : 1.2} opacity={ez(t, 0.7)} />
      ))}
      <rect x={120} y={130} width={320} height={34} rx={4} fill="none" stroke={C.caramel} strokeWidth={2} opacity={ez(t, 0.7)} />
      <rect x={400 + split * 70} y={130} width={40} height={34} rx={4} fill="none" stroke={C.second} strokeWidth={2} opacity={split} />
      <circle cx={180} cy={lerp(100, 147, easeInOut(seg(t, 0.8, 1.1)))} r={5} fill={C.focus} opacity={ez(t, 0.8, 0.2) * (1 - sweep)} />
    </Svg>
  );
}

// ── 8 · Recap ──────────────────────────────────────────────────────────────
export function Recap({ t }: StepCtx) {
  return (
    <RecapList
      t={t}
      label="recap: a real cache line, shared and padded"
      rows={['a shared cache line costs both cores, always', 'that cost grows, it never plateaus', 'padding removes it, down to zero']}
      gap={70}
      y0={60}
    />
  );
}
