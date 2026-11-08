import type { StepCtx } from '../../../../../reels/types';
import { easeOut, seg, lerp, easeInOut } from '../../../../../reels/anim';
import { Code } from '../../../../../reels/Code';
import { Reticle, Decode, Draw, Stack, Svg, T, C } from '../../../../../reels/kit';

// A real page's checksum genuinely catches a corrupted byte anywhere in its
// body, but a checksum alone can't catch a deliberate, consistent format
// change -- only a magic number check does. A page's own byte order has to
// be explicit and enforced, matching PostgreSQL's own self-describing header
// and its line pointers' own permanence guarantee.
const fa = (t: number, a: number, d = 0.4) => easeOut(seg(t, a, a + d));

function Sweep({ t, from, to }: { t: number; from: number; to: number }) {
  const k = seg(t, from, to);
  if (k <= 0 || k >= 1) return null;
  return <rect x={lerp(40, 540, easeInOut(k))} y={56} width={4} height={44} fill={C.caramel} />;
}

// A page as a header cell (the magic number) and a row of body bytes, with a checksum box. A scan bar sweeps
// the bytes between `from` and `to` seconds, computing the checksum as it goes.
function PageBytes({ t, flip, magicSwap }: { t: number; flip?: number; magicSwap?: number }) {
  const cells = Array.from({ length: 14 }, (_, i) => i);
  return (
    <g>
      <rect x={40} y={60} width={70} height={36} rx={3} fill="none" stroke={C.latte} strokeWidth={1.5} />
      <T x={75} y={50} s={13} a="middle" f={C.taupe}>magic</T>
      {magicSwap !== undefined && (
        <g>
          <rect x={48} y={lerp(68, 30, magicSwap)} width={54} height={20} rx={2} fill={C.mocha} opacity={1 - magicSwap} />
          <rect x={48} y={lerp(106, 68, magicSwap)} width={54} height={20} rx={2} fill={C.cinnamon} opacity={magicSwap} />
        </g>
      )}
      {magicSwap === undefined && <rect x={48} y={68} width={54} height={20} rx={2} fill={C.mocha} />}
      <T x={330} y={50} s={13} a="middle" f={C.taupe}>page body</T>
      {cells.map((i) => {
        const hit = flip !== undefined && i === 8;
        const pop = hit ? flip! : 0;
        return <rect key={i} x={124 + i * 30} y={68 - Math.sin(Math.PI * Math.min(1, pop * 2)) * 18} width={24} height={20} rx={2} fill={hit && pop > 0.5 ? C.cherryText : C.mocha} />;
      })}
    </g>
  );
}

// A list row that lands on its beat: its text slides in from the left while its marker draws
// (a tick for a recap point, a growing dot for one of several names, a cross for a failure).
function Row({ t, at, y, text, mark = 'tick' }: { t: number; at: number; y: number; text: string; mark?: 'tick' | 'dot' | 'cross' }) {
  const k = easeOut(seg(t, at, at + 0.45));
  return (
    <g>
      {mark === 'tick' && <Draw pts={[[23, y], [28, y + 5], [37, y - 6]]} t={t} from={at + 0.1} to={at + 0.4} stroke={C.caramel} w={2} />}
      {mark === 'cross' && <Draw pts={[[25, y - 5], [35, y + 5]]} t={t} from={at + 0.1} to={at + 0.3} stroke={C.cherryText} w={2} />}
      {mark === 'cross' && <Draw pts={[[35, y - 5], [25, y + 5]]} t={t} from={at + 0.25} to={at + 0.45} stroke={C.cherryText} w={2} />}
      {mark === 'dot' && <circle cx={30} cy={y} r={5 * k} fill={C.caramel} />}
      <g opacity={k} transform={`translate(${((1 - k) * -28).toFixed(1)} 0)`}>
        <T x={48} y={y + 6} s={13} f={C.crema}>{text}</T>
      </g>
    </g>
  );
}

// ── 1 · Does a corrupted byte get caught (predict, hook) ─────────────────────────────────────────
export function CorruptionPredict({ t }: StepCtx) {
  return (
    <Stack>
      <Code
        title="a real page, one byte flipped somewhere in its body"
        lines={['page.bytes[offset] ^= 0xFF;', '// does the page catch this, or hand back bad data?']}
        t={t}
        start={0.1}
        end={2.6}
        highlight={[1]}
      />
    </Stack>
  );
}

// ── 2 · Measured: round-trip clean, corruption caught (swipe test's "from" step — NO takeaway) ──
export function CorruptionReveal({ t }: StepCtx) {
  // The checksum sweep runs over the untouched page: valid. One byte pops and comes back flipped; the same sweep
  // runs again and the checksum fails, found from inside the page alone.
  const flip = easeOut(seg(t, 1.2, 1.6));
  return (
    <Svg label="self_describing_page_catches_corruption.rs, measured" h={200}>
      <PageBytes t={t} flip={flip} />
      <Sweep t={t} from={0.3} to={1.0} />
      <Sweep t={t} from={1.7} to={2.3} />
      <T x={40} y={140} s={13} f={C.taupe}>checksum</T>
      <Decode text="valid" t={t} at={0.95} x={140} y={140} s={14} f={C.caramel} w={600} />
      <Draw pts={[[134, 135], [190, 135]]} t={t} from={2.3} to={2.45} stroke={C.cherryText} w={2} pen={false} />
      <Decode text="invalid" t={t} at={2.3} x={210} y={140} s={14} f={C.cherryText} w={600} />
      <Reticle x={375} y={78} w={40} h={40} t={t} at={2.45} color={C.cherryText} />
      <T x={40} y={185} s={13} f={C.latte} o={fa(t, 2.4, 0.3)}>caught from inside the page</T>
    </Svg>
  );
}

// ── 3 · Change the magic number, recompute the checksum (predict) ────────────────────────────────
export function MagicPredict({ t }: StepCtx) {
  return (
    <Stack>
      <Code
        title="a changed magic number, checksum recomputed over it"
        lines={['page.bytes[0..4] = WRONG_MAGIC; recompute_checksum();', '// does the checksum alone catch this?']}
        t={t}
        start={0.1}
        end={2.6}
        highlight={[1]}
      />
    </Stack>
  );
}

// ── 4 · Measured: checksum valid, format invalid (takeaway) ──────────────────────────────────────
export function MagicReveal({ t }: StepCtx) {
  // The magic number slides out and a new one slides in; the checksum is honestly recomputed (the sweep) and
  // passes. Then the magic check's pointer drops onto the header cell, and that check is what fails.
  const swap = easeOut(seg(t, 0.3, 0.7));
  return (
    <Svg label="self_describing_page_catches_corruption.rs, measured" h={200}>
      <PageBytes t={t} magicSwap={swap} />
      <Sweep t={t} from={0.8} to={1.4} />
      <T x={40} y={140} s={13} f={C.taupe}>checksum</T>
      <Decode text="valid" t={t} at={1.35} x={140} y={140} s={14} f={C.caramel} w={600} />
      <T x={40} y={170} s={13} f={C.taupe} o={fa(t, 1.5, 0.3)}>magic check</T>
      <Draw pts={[[30, 165], [22, 165], [22, 78], [38, 78]]} t={t} from={1.6} to={1.9} stroke={C.cherryText} w={2} />
      <Decode text="format changed" t={t} at={1.9} x={160} y={170} s={14} f={C.cherryText} w={600} />
      <Reticle x={75} y={78} w={80} h={46} t={t} at={2.2} color={C.cherryText} />
    </Svg>
  );
}

// ── 5 · Read the same bytes in the opposite byte order (predict) ─────────────────────────────────
export function EndiannessPredict({ t }: StepCtx) {
  return (
    <Stack>
      <Code
        title="the same raw bytes, read two different ways"
        lines={['u64::from_le_bytes(bytes); u64::from_be_bytes(bytes);', '// does the byte order actually matter?']}
        t={t}
        start={0.1}
        end={2.6}
        highlight={[1]}
      />
    </Stack>
  );
}

// ── 6 · Measured: wrong byte order, wrong value (takeaway) ───────────────────────────────────────
export function EndiannessReveal({ t }: StepCtx) {
  const bytes = [0, 1, 2, 3];
  const flip = easeOut(seg(t, 0.5, 0.85));
  return (
    <Svg label="self_describing_page_catches_corruption.rs, measured" h={200}>
      <T x={60} y={60} s={14} f={C.crema} o={fa(t, 0.3, 0.4)}>same raw bytes, read in two different orders</T>
      {bytes.map((i) => {
        const x1 = 220 + i * 20;
        const x2 = 220 + (3 - i) * 20;
        const x = x1 + (x2 - x1) * flip;
        return <rect key={i} x={x} y={70} width={16} height={10} rx={2} fill={C.caramel} opacity={fa(t, 0.5, 0.2)} />;
      })}
      <rect x={60} y={85} width={260} height={44} rx={6} fill="none" stroke={C.caramel} strokeWidth={2} />
      {fa(t, 1.1, 0.4) > 0.85 && <T x={190} y={112} s={13} a="middle" f={C.mocha}>chosen order: correct. reversed: wrong</T>}
      <T x={60} y={160} s={13} f={C.latte} o={fa(t, 1.5, 0.4)}>the order itself had to be picked and kept</T>
    </Svg>
  );
}

// ── 7 · What does the header's first field track (predict) ───────────────────────────────────────
export function FieldPredict({ t }: StepCtx) {
  return (
    <Stack>
      <Code
        title="PostgreSQL's own page header, first field"
        lines={['struct PageHeaderData { pd_lsn: PageXLogRecPtr, .. }', '// what does the documentation say it tracks?']}
        t={t}
        start={0.1}
        end={2.6}
        highlight={[1]}
      />
    </Stack>
  );
}

// ── 8 · The documentation quoted directly (connecting step — NO takeaway) ────────────────────────
export function FieldReveal({ t }: StepCtx) {
  const slide1 = easeOut(seg(t, 0.2, 0.55));
  const slide2 = easeOut(seg(t, 0.7, 1.05));
  return (
    <Svg label="PostgreSQL docs, quoted" h={180}>
      <g transform={`translate(${(1 - slide1) * -70},0)`} opacity={slide1}>
        <T x={60} y={60} s={14} f={C.crema}>first field: the most recent log entry</T>
      </g>
      <g transform={`translate(${(1 - slide2) * -70},0)`} opacity={slide2}>
        <T x={60} y={100} s={14} f={C.crema}>second field: the page checksum, when enabled</T>
      </g>
    </Svg>
  );
}

// ── 9 · Item identifiers outlive being moved (surprising fact, takeaway) ─────────────────────────
export function PermanenceReveal({ t }: StepCtx) {
  const move = easeOut(seg(t, 0.5, 0.85));
  const dx = move * 60;
  return (
    <Svg label="PostgreSQL docs, quoted" h={200}>
      <T x={60} y={60} s={14} f={C.crema} o={fa(t, 0.3, 0.4)}>an item identifier is never moved until freed</T>
      <circle cx={200} cy={76} r={4} fill={C.taupe} />
      <circle cx={200 + dx} cy={76} r={4} fill="none" stroke={C.caramel} strokeWidth={1.5} />
      <rect x={60} y={85} width={260} height={44} rx={6} fill="none" stroke={C.caramel} strokeWidth={2} />
      {fa(t, 1.0, 0.4) > 0.85 && <T x={190} y={112} s={13} a="middle" f={C.mocha}>its index references an item long term</T>}
      <T x={60} y={160} s={13} f={C.latte} o={fa(t, 1.5, 0.4)}>even while the item moves to compact space</T>
    </Svg>
  );
}

// ── 10 · Recap ─────────────────────────────────────────────────────────────────────────────────────
export function Recap({ t }: StepCtx) {
  const rows = [
    'a checksum catches damage, not a format change',
    'a magic number catches what a checksum misses',
    'byte order must be explicit, never assumed',
    'line pointers let identity outlive a move',
  ];
  return (
    <Svg label="recap: a page that can tell its own story" h={240}>
      {rows.map((r, i) => (
        <Row key={r} t={t} at={0.2 + i * 0.45} y={40 + i * 50} text={r} />
      ))}
      <Reticle x={290} y={90} w={556} h={36} t={t} at={2.25} />
    </Svg>
  );
}
