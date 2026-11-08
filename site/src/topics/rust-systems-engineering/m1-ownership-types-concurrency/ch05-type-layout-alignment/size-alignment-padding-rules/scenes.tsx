import type { ReactNode } from 'react';
import type { StepCtx } from '../../../../../reels/types';
import { easeOut, seg } from '../../../../../reels/anim';
import { Code } from '../../../../../reels/Code';
import { C, Draw, Reticle, Stack, Svg, T } from '../../../../../reels/kit';

// A byte ruler: one cell per byte, field spans bracketed above, padding cells hatched rather
// than left blank. Every size and offset drawn here comes straight from examples.py's own
// output (printed in post-notes.md where the exact run matters, e.g. the randomize-layout seeds).
const fa = (t: number, a: number, d = 0.4) => easeOut(seg(t, a, a + d));

type Field = { name: string; bytes: number; padding?: boolean };

function byteRuler(x0: number, y: number, cellW: number, fields: Field[], t: number, start: number, cellH = 28) {
  // Each cell drops into its slot from above, one after another in declaration order, so the
  // struct visibly gets laid out byte by byte instead of popping in all at once.
  let x = x0;
  const nodes: ReactNode[] = [];
  fields.forEach((f, i) => {
    const w = f.bytes * cellW;
    const cellT = start + i * 0.15;
    const op = fa(t, cellT);
    const drop = easeOut(seg(t, cellT, cellT + 0.3));
    const dy = (1 - drop) * -26;
    const cx = x;
    nodes.push(
      <g key={i} opacity={op} transform={`translate(0,${dy})`}>
        <rect x={cx} y={y} width={w} height={cellH} fill={f.padding ? C.cocoa : 'none'} stroke={f.padding ? C.mocha : C.caramel} strokeWidth={1.3} strokeDasharray={f.padding ? '3 3' : undefined} />
        <T x={cx + w / 2} y={y + cellH / 2 + 4} s={11} a="middle" f={f.padding ? C.taupe : C.crema}>
          {f.padding ? '···' : f.name}
        </T>
      </g>,
    );
    x += w;
  });
  return { nodes, end: x };
}

/** A recap as a payoff: each point slides in from the left on its beat (fitted to the step's `end`), its tick draws as it
 * lands, a spine grows down to meet it, and the last point (where the topic leads next) lights up and is locked on. */
function RecapList({ t, rows, label, end, step = 50, s = 15 }: { t: number; rows: string[]; label: string; end: number; step?: number; s?: number }) {
  const y0 = 40;
  const n = rows.length;
  const start = 0.15;
  const beat = Math.min(0.42, Math.max(0.2, (end - start - 1.15) / Math.max(1, n - 1)));
  const h = y0 + (n - 1) * step + 40;
  const lastY = y0 + (n - 1) * step;
  return (
    <Svg label={label} h={Math.max(300, h)}>
      <Draw pts={[[29, y0 - 5], [29, lastY - 5]]} t={t} from={start + 0.1} to={start + 0.1 + (n - 1) * beat} stroke={C.mocha} w={1.5} pen={false} />
      {rows.map((r, i) => {
        const at = start + i * beat;
        const k = easeOut(seg(t, at, at + 0.45));
        const d = easeOut(seg(t, at + 0.2, at + 0.55));
        const y = y0 + i * step;
        const last = i === n - 1;
        if (k <= 0) return null;
        return (
          <g key={r} opacity={k} transform={`translate(${((1 - k) * -44).toFixed(1)} 0)`}>
            <circle cx={29} cy={y - 5} r={11} fill={C.espresso} stroke={last ? C.caramel : C.mocha} strokeWidth={1.5} />
            <path d={`M23 ${y - 5} l4 4 l8 -9`} fill="none" stroke={C.caramel} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" strokeDasharray="20" strokeDashoffset={20 * (1 - d)} />
            <T x={46} y={y} s={s} f={last ? C.caramel : C.crema}>{r}</T>
          </g>
        );
      })}
      <Reticle x={300} y={lastY - 5} w={576} h={36} t={t} at={Math.max(start + (n - 1) * beat + 0.3, end - 0.6)} />
    </Svg>
  );
}

// ── 1 · Same four fields, two orders — one repr(Rust) layout ────────────────────────────────────────────
export function ReprRustSame({ t }: StepCtx) {
  const row = (label: string, y: number, start: number) => {
    const { nodes, end } = byteRuler(60, y + 22, 36, [{ name: 'A', bytes: 1 }, { name: 'B', bytes: 1 }, { name: 'C', bytes: 2 }, { name: 'D', bytes: 4 }], t, start);
    return (
      <g>
        <T x={60} y={y} s={12} f={C.taupe} o={fa(t, start)}>{label}</T>
        {nodes}
        <T x={end + 15} y={y + 41} s={13} f={C.crema} o={fa(t, start + 0.9)}>size = 8</T>
      </g>
    );
  };
  return (
    <Svg label="two struct declarations with the same four fields in opposite written order both produce the identical eight-byte layout" h={260}>
      {row('order A → B → C → D', 60, 0.3)}
      {row('order D → C → B → A', 150, 0.9)}
      <T x={60} y={230} s={13} f={C.taupe} o={fa(t, 1.9)}>repr(Rust) picked the same layout either way</T>
    </Svg>
  );
}

// ── 2 · Does field order ever change a struct's size? (predict) ───────────────
export function OrderMattersPredict({ t }: StepCtx) {
  return (
    <Stack>
      <Code title="the same four fields, reordered again" lines={['struct Header { version: u8, flags: u8, length: u16, seq: u32 }', 'struct Header { version: u8, length: u16, flags: u8, seq: u32 }']} t={t} start={0.1} end={2.0} highlight={[0, 1]} />
      <Svg label="does reordering these fields ever change the struct's size?" h={46}>
        <T x={40} y={28} s={13} f={C.mocha} o={fa(t, 2.2, 0.4)}>does this reorder ever cost real bytes?</T>
      </Svg>
    </Stack>
  );
}

// ── 3 · repr(C): the same reorder, now it costs four bytes (no takeaway: the reel's "from" step) ──
export function ReprCDiffers({ t }: StepCtx) {
  const good = byteRuler(100, 70, 30, [{ name: 'v', bytes: 1 }, { name: 'f', bytes: 1 }, { name: 'len', bytes: 2 }, { name: 'seq', bytes: 4 }], t, 0.2);
  const bad = byteRuler(
    100,
    150,
    30,
    [{ name: 'v', bytes: 1 }, { name: 'len', bytes: 2 }, { name: '', bytes: 1, padding: true }, { name: 'f', bytes: 1 }, { name: '', bytes: 3, padding: true }, { name: 'seq', bytes: 4 }],
    t,
    0.9,
  );
  return (
    <Svg label="under repr(C), one field order costs eight bytes and the other costs twelve, from padding alone" h={260}>
      <T x={60} y={60} s={13} f={C.taupe}>Good order</T>
      {good.nodes}
      <T x={good.end + 15} y={89} s={13} f={C.crema} o={fa(t, 0.9)}>8 bytes</T>
      <T x={60} y={140} s={13} f={C.taupe}>Bad order</T>
      {bad.nodes}
      <T x={bad.end + 15} y={169} s={13} f={C.cherryText} o={fa(t, 1.7)}>12 bytes</T>
      <T x={60} y={230} s={13} f={C.taupe} o={fa(t, 2.1)}>the hatched cells are padding, not fields</T>
    </Svg>
  );
}

// ── 4 · offset_of! and a compile-time assertion make the claim checkable ──────────────
export function OffsetsChecked({ t }: StepCtx) {
  const ruler = byteRuler(100, 60, 30, [{ name: 'v', bytes: 1 }, { name: 'f', bytes: 1 }, { name: 'len', bytes: 2 }, { name: 'seq', bytes: 4 }], t, 0.2);
  return (
    <Stack>
      <Svg label="each field's offset labelled by offset_of!, then two compile-time assertions checked against them" h={150}>
        {ruler.nodes}
        <T x={115} y={102} s={12} a="middle" f={C.taupe} o={fa(t, 1.0)}>0</T>
        <T x={145} y={102} s={12} a="middle" f={C.taupe} o={fa(t, 1.1)}>1</T>
        <T x={175} y={102} s={12} a="middle" f={C.taupe} o={fa(t, 1.2)}>2</T>
        <T x={235} y={102} s={12} a="middle" f={C.taupe} o={fa(t, 1.3)}>4</T>
      </Svg>
      <Code
        title="offsets_checked.rs"
        lines={['const _: () = assert!(size_of::<Header>() == 8);  // ✓', 'const _: () = assert!(offset_of!(Header, seq) == 4);  // ✓']}
        t={t}
        start={1.6}
        end={3.2}
        highlight={[0, 1]}
      />
    </Stack>
  );
}

// ── 5 · What happens when the claim is wrong? (predict) ─────────────────────────
export function AssertionFailPredict({ t }: StepCtx) {
  return (
    <Stack>
      <Code title="offset_assertion_fail.rs" lines={['const _: () = assert!(offset_of!(Header, seq) == 999);']} t={t} start={0.1} end={2.0} highlight={[0]} />
      <Svg label="what happens when this gets built?" h={46}>
        <T x={40} y={28} s={13} f={C.mocha} o={fa(t, 2.2, 0.4)}>what happens when this gets built?</T>
      </Svg>
    </Stack>
  );
}

// ── 6 · -Z randomize-layout: the same struct, shuffled on purpose ───────────────────
export function RandomizeLayout({ t }: StepCtx) {
  const fields = (order: number[]) => order.map((n) => ({ name: 'abcdefgh'[n], bytes: n < 4 ? 1 : n < 6 ? 2 : 4 }));
  const seed1 = byteRuler(60, 70, 24, fields([3, 0, 2, 6, 4, 5, 7, 1]), t, 0.3);
  const seed2 = byteRuler(60, 150, 24, fields([4, 6, 5, 0, 2, 7, 1, 3]), t, 1.0);
  return (
    <Svg label="the same eight-field struct, compiled twice with two different layout seeds, laid out two different ways" h={260}>
      <T x={60} y={50} s={13} f={C.taupe}>seed 1</T>
      {seed1.nodes}
      <T x={60} y={130} s={13} f={C.taupe}>seed 2</T>
      {seed2.nodes}
      <T x={60} y={230} s={13} f={C.taupe} o={fa(t, 1.9)}>same fields, same compiler, two different arrangements</T>
    </Svg>
  );
}

// ── 7 · Recap ─────────────────────────────────────────────────────
export function Recap({ t }: StepCtx) {
  const rows = [
    'size is always a multiple of alignment',
    'repr(Rust) picks the field order for you',
    'repr(C) fixes it to the order you write',
    'offset_of! plus an assertion checks the claim',
  ];
  return <RecapList t={t} end={3} label="recap: layout is the compiler's choice, until you fix it" rows={rows} />;
}
