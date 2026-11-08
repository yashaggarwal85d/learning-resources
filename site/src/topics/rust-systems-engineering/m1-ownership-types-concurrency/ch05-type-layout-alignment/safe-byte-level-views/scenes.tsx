import type { ReactNode } from 'react';
import type { StepCtx } from '../../../../../reels/types';
import { easeOut, easeOutBack, lerp, seg } from '../../../../../reels/anim';
import { Code } from '../../../../../reels/Code';
import { C, Draw, Reticle, Stack, Svg, T } from '../../../../../reels/kit';

// The same packet header from the previous topic, now read back from a byte buffer: the padded
// field order's padding cells are the exact bytes that make a raw reinterpret unsound; the
// padding-free order is exactly what bytemuck's derive can prove safe. Every value drawn here
// comes from examples.py's own output.
const fa = (t: number, a: number, d = 0.4) => easeOut(seg(t, a, a + d));

type Field = { name: string; bytes: number; padding?: boolean; value?: string };

function byteRuler(x0: number, y: number, cellW: number, fields: Field[], t: number, start: number, cellH = 28) {
  // Each cell drops into its slot from above, one after another, so the buffer or struct visibly
  // gets laid out byte by byte instead of popping in all at once.
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
          {f.padding ? '?' : f.value ?? f.name}
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
export function PodDerivePredict({ t, portrait }: StepCtx) {
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
      {!portrait && (
        <Svg label="does a derive-checked view accept this padded struct?" h={34}>
          <T x={40} y={24} s={16} f={C.mocha} o={fa(t, 1.5, 0.4)}>does a checked view accept this, padding and all?</T>
        </Svg>
      )}
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
export function PodDeriveRejects({ t, portrait }: StepCtx) {
  const fields: Field[] = [
    { name: 'version', bytes: 1, value: 'ver' },
    { name: 'pad', bytes: 1, padding: true },
    { name: 'length', bytes: 2, value: 'length' },
    { name: 'flags', bytes: 1, value: 'flags' },
    { name: 'pad', bytes: 3, padding: true },
    { name: 'seq', bytes: 4, value: 'seq' },
  ];
  const W = 44;
  const x0 = 36;
  const ruler = byteRuler(x0, 30, W, fields, t, 0.35);
  const scan = seg(t, 1.3, 2.2);
  const sx = lerp(x0, x0 + 12 * W, scan);
  const pads = [
    { x: x0 + W, w: W },
    { x: x0 + 5 * W, w: 3 * W },
  ];
  return (
    <Stack>
      {!portrait && <Code title="the padded header, for real" lines={['#[derive(Clone, Copy, Pod, Zeroable)]', 'struct BadHeader { version: u8, length: u16, flags: u8, seq: u32 }']} t={t} start={0.1} end={0.6} highlight={[0]} />}
      <Svg label="derive(Pod) walks BadHeader's layout byte by byte and stops on the two padding gaps, which it names as the reason to refuse" h={110} fill>
        {ruler.nodes}
        {scan > 0 && scan < 1 && <rect x={sx - 2} y={22} width={4} height={44} fill={C.focus} />}
        {pads.map((p, i) => {
          const hit = easeOutBack(seg(t, 1.3 + ((p.x - x0) / (12 * W)) * 0.9, 1.6 + ((p.x - x0) / (12 * W)) * 0.9));
          if (hit <= 0) return null;
          return (
            <g key={i}>
              <rect x={p.x} y={30} width={p.w} height={28} fill="none" stroke={C.cherryText} strokeWidth={2.5} />
              <g transform={`translate(${p.x + p.w / 2} 86) scale(${hit.toFixed(3)}) translate(${-(p.x + p.w / 2)} -86)`}>
                <T x={p.x + p.w / 2} y={90} s={13} a="middle" f={C.cherryText} w={600}>padding</T>
              </g>
            </g>
          );
        })}
        <Reticle x={x0 + 6.5 * W} y={44} w={3 * W + 16} h={42} t={t} at={2.3} color={C.cherryText} />
      </Svg>
      <Code title="the real compiler verdict" dim={t < 2.3} lines={['error: derive(Pod) was applied to a type with padding']} t={t} start={2.3} end={2.9} highlight={[0]} />
    </Stack>
  );
}

// ── 5 · Read the same two wire bytes without choosing a byte order (predict) ──────────────────
export function EndiannessPredict({ t, portrait }: StepCtx) {
  return (
    <Stack>
      <Code title="two wire bytes" lines={['let wire_bytes: [u8; 2] = [0x27, 0x10];', 'let value = u16::from_ne_bytes(wire_bytes);  // native order']} t={t} start={0.1} end={2.0} highlight={[0, 1]} />
      {!portrait && (
        <Svg label="what number comes out, read this way, on this machine?" h={34}>
          <T x={40} y={24} s={16} f={C.mocha} o={fa(t, 1.5, 0.4)}>what comes out, read this way, on this machine?</T>
        </Svg>
      )}
    </Stack>
  );
}

// ── 6 · Big-endian, little-endian, and the one wrong default ────────────────────────
export function EndiannessFig({ t }: StepCtx) {
  // Both panels slide in from the same two wire-byte source instead of just fading into place,
  // so it reads as one pair of bytes taking two different paths rather than two static facts.
  const panel = (label: string, value: string, y: number, start: number, good: boolean) => {
    const slide = easeOut(seg(t, start, start + 0.35));
    const dx = (1 - slide) * -60;
    return (
      <g opacity={fa(t, start)} transform={`translate(${dx},0)`}>
        <rect x={90} y={y} width={420} height={70} rx={8} fill="none" stroke={good ? C.caramel : C.cherryText} strokeWidth={1.5} />
        <T x={110} y={y + 26} s={12} f={C.taupe}>{label}</T>
        <T x={110} y={y + 52} s={15} f={good ? C.crema : C.cherryText}>{value}</T>
      </g>
    );
  };
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
  return <RecapList t={t} end={3} label="recap: padding is real, and bytes need a byte order" rows={rows}
      s={14}
    />;
}
