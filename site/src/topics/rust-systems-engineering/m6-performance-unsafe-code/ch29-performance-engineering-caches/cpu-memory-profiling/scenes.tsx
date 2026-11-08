import type { StepCtx } from '../../../../../reels/types';
import { easeOut, seg, lerp, clamp } from '../../../../../reels/anim';
import { Code } from '../../../../../reels/Code';
import { Stack, Svg, T, C, Draw, Reticle } from '../../../../../reels/kit';

// Profiling genuinely attributes the real majority of a program's own
// cost to one specific function, often several calls deep, not an even
// split; an allocator's own overhead is itself a real, measured cost.
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


// ── 1 · Does cost spread evenly or pile up in one place (predict, hook) ──
export function SpreadPredict({ t }: StepCtx) {
  return (
    <Stack>
      <Code
        title="a real call tree, six functions, one program"
        lines={['sum_self_cost(&tree);', '// spread evenly, or piled up in one place?']}
        t={t}
        start={0.1}
        end={2.6}
        highlight={[1]}
      />
    </Stack>
  );
}

// ── 2 · Measured: one function holds the real majority (takeaway) ───────
export function HotFunctionReveal({ t }: StepCtx) {
  const fns = [0, 1, 2, 3, 4, 5];
  const widths = [40, 32, 28, 150, 22, 18];
  return (
    <Svg label="profiling_attributes_cost_to_the_real_hot_path.rs" h={200}>
      <T x={60} y={50} s={14} f={C.crema} o={fa(t, 0.3, 0.4)}>an even split: one sixth, per function</T>
      {fns.map((i) => {
        const grow = easeOut(seg(t, 0.4 + i * 0.1, 0.65 + i * 0.1));
        return (
          <rect
            key={i}
            x={60}
            y={70 + i * 14}
            width={widths[i] * grow}
            height={10}
            rx={2}
            fill={i === 3 ? C.cherry : C.caramel}
            opacity={i === 3 ? 0.9 : fa(t, 0.4 + i * 0.1, 0.2)}
          />
        );
      })}
      {fa(t, 1.3, 0.4) > 0.85 && <T x={190} y={168} s={13} a="middle" f={C.mocha}>run_model alone: most of the real cost</T>}
      <T x={60} y={190} s={13} f={C.latte} o={fa(t, 1.6, 0.3)}>cost piles up; it never spreads evenly</T>
    </Svg>
  );
}

// ── 3 · Does the top frame alone find the hot function (predict) ─────────
export function DepthPredict({ t }: StepCtx) {
  return (
    <Stack>
      <Code
        title="the hot function, several real calls deep"
        lines={['depth(&tree, run_model);', '// found by reading just the top frame?']}
        t={t}
        start={0.1}
        end={2.6}
        highlight={[1]}
      />
    </Stack>
  );
}

// The example's call tree, as a flamegraph: each frame's width is its inclusive cost (self plus callees), out of the
// whole tree's total, so run_model's frame is most of the width two levels up from the top-level handler.
const FRAMES = [
  { name: 'request_handler', x: 0, w: 100, row: 0 },
  { name: '', x: 0, w: 3, row: 1 },
  { name: 'business_logic', x: 3, w: 95, row: 1 },
  { name: '', x: 3, w: 4, row: 2 },
  { name: 'run_model', x: 7, w: 85, row: 2 },
  { name: '', x: 92, w: 5, row: 2 },
];

// ── 4 · Measured: the hot function is deep ─────────────────────────────────
// The flamegraph builds from the bottom, each row of frames growing out to its width. A probe then walks down the
// stack from the top-level handler, through business_logic, to run_model, which is locked on: the real hot frame.
export function DepthReveal({ t }: StepCtx) {
  const sx = 5.2;
  const y = (row: number) => 128 - row * 36;
  return (
    <Svg label="profiling_attributes_cost_to_the_real_hot_path.rs" h={250}>
      {FRAMES.map((f, i) => {
        const k = easeOut(seg(t, 0.1 + f.row * 0.35, 0.5 + f.row * 0.35));
        const hot = f.name === 'run_model';
        return (
          <g key={i}>
            <rect x={40 + f.x * sx} y={y(f.row)} width={Math.max(0, f.w * sx * k - 2)} height={30} rx={3} fill={hot && t > 1.9 ? C.cherry : C.cocoa} stroke={C.mocha} />
            {f.name && (
              <T x={50 + f.x * sx} y={y(f.row) + 20} s={13} f={C.crema} o={ez(t, 0.4 + f.row * 0.35)}>
                {f.name}
              </T>
            )}
          </g>
        );
      })}
      <Draw pts={[[300, 172], [300, 143], [300, 107], [300, 71]]} t={t} from={1.3} to={1.9} stroke={C.second} w={2} />
      <Reticle x={40 + 49.5 * 5.2} y={y(2) + 15} w={450} h={40} t={t} at={2.0} />
      <Line t={t} at={1.3} y={200} text="request_handler, then business_logic" />
      <Line t={t} at={1.9} y={236} text="then run_model: the real hot function" mf={C.cherryText} />
    </Svg>
  );
}

// ── 5 · Does swapping allocators matter (predict) ────────────────────────
export function AllocatorPredict({ t }: StepCtx) {
  return (
    <Stack>
      <Code
        title="the identical allocation count, two allocators"
        lines={['default_total_ns > specialized_total_ns;', '// a real, measurable difference?']}
        t={t}
        start={0.1}
        end={2.6}
        highlight={[1]}
      />
    </Stack>
  );
}

// ── 6 · Measured: the specialized allocator cuts the cost ──────────────────
// The same allocation count through two allocators: both bars grow at the same rate, cost per allocation drawn to
// the example's real ratio. The specialized one stops well short of the dashed half-way mark of the default's
// total, and its finish is locked on.
export function AllocatorReveal({ t }: StepCtx) {
  const full = 400;
  const g = easeOut(seg(t, 0.3, 1.5));
  const def = Math.min(1, g) * full;
  const spec = Math.min(g * full, full * (35 / 120));
  return (
    <Svg label="profiling_attributes_cost_to_the_real_hot_path.rs" h={250}>
      <T x={40} y={36} s={13} f={C.latte} o={ez(t, 0.1)}>default allocator</T>
      <rect x={40} y={46} width={Math.max(2, def)} height={18} rx={3} fill={C.caramel} />
      <T x={40} y={100} s={13} f={C.latte} o={ez(t, 0.1)}>specialized allocator</T>
      <rect x={40} y={110} width={Math.max(2, spec)} height={18} rx={3} fill={C.second} />
      <line x1={40 + full / 2} y1={40} x2={40 + full / 2} y2={136} stroke={C.taupe} strokeWidth={1.5} strokeDasharray="4 3" opacity={ez(t, 1.4)} />
      <T x={46 + full / 2} y={148} s={13} f={C.taupe} o={ez(t, 1.4)}>half</T>
      <Reticle x={40 + full * (35 / 120)} y={119} w={26} h={34} t={t} at={1.6} />
      <Line t={t} at={1.3} y={204} text="the specialized one: cost cut by over half" mark="tick" />
      <Line t={t} at={1.9} y={238} text="allocator choice is a real, measured decision" />
    </Svg>
  );
}

// ── 7 · Two sources agree (connecting) ─────────────────────────────────────
// The quote lands; under it, stack samples land one per beat on a frame and the frame widens with every one, its
// width is its count. Below, the allocator's own slice grows out of the total, a measured share of the cost.
export function DocsReveal({ t }: StepCtx) {
  const n = 8;
  const got = clamp(seg(t, 0.9, 1.9) * n, 0, n);
  const alloc = easeOut(seg(t, 1.9, 2.4));
  return (
    <Svg label="Brendan Gregg / mimalloc README, quoted" h={240}>
      <Quote t={t} lines={['a frame’s width: how often it was on stack', 'the allocator’s own share: a measured cost']} hot={0} y0={40} gap={38} beat={0.45} />
      {Array.from({ length: n }, (_, i) => {
        const k = ez(t, 0.9 + (i / n) * 1.0, 0.15);
        return <rect key={i} x={60 + i * 30 + 6} y={lerp(104, 116, k)} width={14} height={8} rx={2} fill={C.second} opacity={k} />;
      })}
      <rect x={60} y={130} width={Math.max(0, got * 30 - 2)} height={26} rx={3} fill={C.cocoa} stroke={C.second} />
      <T x={68} y={148} s={13} f={C.crema} o={ez(t, 1.2)}>frame</T>
      <rect x={60} y={176} width={480} height={24} rx={3} fill={C.cocoa} opacity={ez(t, 1.8)} />
      <rect x={60} y={176} width={Math.max(0, 160 * alloc)} height={24} rx={3} fill={C.second} opacity={ez(t, 1.8)} />
      <T x={230} y={193} s={13} f={C.second} o={alloc}>allocator</T>
    </Svg>
  );
}

// ── 8 · Recap ──────────────────────────────────────────────────────────────
export function Recap({ t }: StepCtx) {
  return (
    <RecapList
      t={t}
      label="recap: a real call tree, measured"
      rows={['one function holds the real majority of cost', 'often several calls deep, not top level', 'allocator overhead is a real, measured cost']}
      gap={70}
      y0={60}
    />
  );
}
