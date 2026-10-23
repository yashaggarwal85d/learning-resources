import type { ReactNode } from 'react';
import type { StepCtx } from '../../../../../reels/types';
import { easeOut, seg } from '../../../../../reels/anim';
import { Code } from '../../../../../reels/Code';
import { C, Stack, Svg, T } from '../../../../../reels/kit';

// The same packet header from the previous topic, now read back from a byte buffer: the padded
// field order's padding cells are the exact bytes that make a raw reinterpret unsound; the
// padding-free order is exactly what bytemuck's derive can prove safe. Every value drawn here
// comes from examples.py's own output.
const fa = (t: number, a: number, d = 0.4) => easeOut(seg(t, a, a + d));

type Field = { name: string; bytes: number; padding?: boolean; value?: string };

function byteRuler(x0: number, y: number, cellW: number, fields: Field[], t: number, start: number, cellH = 28) {
  let x = x0;
  const nodes: ReactNode[] = [];
  fields.forEach((f, i) => {
    const w = f.bytes * cellW;
    const op = fa(t, start + i * 0.15);
    nodes.push(
      <g key={i} opacity={op}>
        <rect x={x} y={y} width={w} height={cellH} fill={f.padding ? C.cocoa : 'none'} stroke={f.padding ? C.mocha : C.caramel} strokeWidth={1.3} strokeDasharray={f.padding ? '3 3' : undefined} />
        <T x={x + w / 2} y={y + cellH / 2 + 4} s={11} a="middle" f={f.padding ? C.taupe : C.crema}>
          {f.padding ? '?' : f.value ?? f.name}
        </T>
      </g>,
    );
    x += w;
  });
  return { nodes, end: x };
}

// ── 1 · The same padding that cost bytes now costs soundness ───────────────────────────
export function PaddingIsUB({ t }: StepCtx) {
  const ruler = byteRuler(
    90,
    90,
    30,
    [{ name: 'v', bytes: 1 }, { name: '', bytes: 1, padding: true }, { name: 'len', bytes: 2 }, { name: 'f', bytes: 1 }, { name: '', bytes: 3, padding: true }, { name: 'seq', bytes: 4 }],
    t,
    0.3,
  );
  return (
    <Svg label="the padded header's own padding cells are never guaranteed to hold any particular value, written or not" h={260}>
      <T x={90} y={60} s={13} f={C.taupe}>the padded header, byte by byte</T>
      {ruler.nodes}
      <T x={90} y={160} s={13} f={C.cherryText} o={fa(t, 1.6)}>the hatched cells: never written, not just unused</T>
      <T x={90} y={200} s={13} f={C.taupe} o={fa(t, 2.0)}>reading them as a value is undefined behaviour</T>
    </Svg>
  );
}

// ── 2 · Does a derive-checked view accept the padded header? (predict) ──────────────
export function PodDerivePredict({ t }: StepCtx) {
  return (
    <Stack>
      <Code
        title="the padded header, with a derive-checked trait added"
        lines={['#[derive(Clone, Copy, Pod, Zeroable)]', 'struct BadHeader { version: u8, length: u16, flags: u8, seq: u32 }']}
        t={t}
        start={0.1}
        end={2.0}
        highlight={[0, 1]}
      />
      <Svg label="does a derive-checked view accept this padded struct?" h={46}>
        <T x={40} y={28} s={13} f={C.mocha} o={fa(t, 2.2, 0.4)}>does a checked view accept this, padding and all?</T>
      </Svg>
    </Stack>
  );
}

// ── 3 · A padding-free header, read with no unsafe code at all (no takeaway: the reel's "from" step) ──
export function BytemuckSafeRead({ t }: StepCtx) {
  const buffer = byteRuler(90, 70, 30, [{ name: '', bytes: 1, value: '1' }, { name: '', bytes: 1, value: '0' }, { name: '', bytes: 2, value: '10' }, { name: '', bytes: 4, value: '42' }], t, 0.2);
  const struct_ = byteRuler(90, 170, 30, [{ name: 'v', bytes: 1 }, { name: 'f', bytes: 1 }, { name: 'len', bytes: 2 }, { name: 'seq', bytes: 4 }], t, 1.0);
  return (
    <Svg label="a raw byte buffer, viewed directly as the padding-free header, with no copy and no unsafe code" h={260}>
      <T x={90} y={50} s={13} f={C.taupe}>raw byte buffer</T>
      {buffer.nodes}
      <T x={90} y={150} s={13} f={C.taupe} o={fa(t, 0.9)}>viewed as ↓</T>
      {struct_.nodes}
      <T x={90} y={230} s={13} f={C.taupe} o={fa(t, 1.9)}>no copy, no unsafe block, anywhere</T>
    </Svg>
  );
}

// ── 4 · What derive(Pod) actually checks ──────────────────────────────────
export function PodDeriveRejects({ t }: StepCtx) {
  return (
    <Stack>
      <Code
        title="the padded header, for real"
        lines={['#[derive(Clone, Copy, Pod, Zeroable)]', 'struct BadHeader { version: u8, length: u16, flags: u8, seq: u32 }']}
        t={t}
        start={0.1}
        end={1.6}
        highlight={[0]}
      />
      <Code
        title="the real compiler verdict"
        dim
        lines={['error: derive(Pod) was applied to a type with padding']}
        t={t}
        start={1.8}
        end={3.0}
        highlight={[0]}
      />
    </Stack>
  );
}

// ── 5 · Read the same two wire bytes without choosing a byte order (predict) ──────────────────
export function EndiannessPredict({ t }: StepCtx) {
  return (
    <Stack>
      <Code title="two wire bytes" lines={['let wire_bytes: [u8; 2] = [0x27, 0x10];', 'let value = u16::from_ne_bytes(wire_bytes);  // native order']} t={t} start={0.1} end={2.0} highlight={[0, 1]} />
      <Svg label="what number comes out, read this way, on this machine?" h={46}>
        <T x={40} y={28} s={13} f={C.mocha} o={fa(t, 2.2, 0.4)}>what comes out, read this way, on this machine?</T>
      </Svg>
    </Stack>
  );
}

// ── 6 · Big-endian, little-endian, and the one wrong default ────────────────────────
export function EndiannessFig({ t }: StepCtx) {
  const panel = (label: string, value: string, y: number, start: number, good: boolean) => (
    <g opacity={fa(t, start)}>
      <rect x={90} y={y} width={420} height={70} rx={8} fill="none" stroke={good ? C.caramel : C.cherryText} strokeWidth={1.5} />
      <T x={110} y={y + 26} s={12} f={C.taupe}>{label}</T>
      <T x={110} y={y + 52} s={15} f={good ? C.crema : C.cherryText}>{value}</T>
    </g>
  );
  return (
    <Svg label="the same two wire bytes decode to a correct number read as big-endian, and a wrong one read in this platform's native order" h={280}>
      {panel('read as big-endian — the wire’s own choice', 'correct', 40, 0.2, true)}
      {panel('read in this platform’s native order', 'wrong, a different number', 130, 0.9, false)}
      <T x={90} y={230} s={13} f={C.taupe} o={fa(t, 1.7)}>same two bytes; the reading code chose wrong</T>
    </Svg>
  );
}

// ── 7 · Recap ─────────────────────────────────────────────────────
export function Recap({ t }: StepCtx) {
  const rows = [
    'padding bytes are never guaranteed initialized',
    'a checked derive refuses a type with padding',
    'reading that way needs no unsafe code at all',
    'a wire format’s byte order is its own choice',
  ];
  return (
    <Svg label="recap: padding is real, and bytes need a byte order" h={280}>
      {rows.map((r, i) => (
        <g key={r} opacity={fa(t, 0.2 + i * 0.4, 0.4)}>
          <circle cx={30} cy={40 + i * 50} r={5} fill={C.caramel} />
          <T x={48} y={46 + i * 50} s={15} f={C.crema}>{r}</T>
        </g>
      ))}
    </Svg>
  );
}
