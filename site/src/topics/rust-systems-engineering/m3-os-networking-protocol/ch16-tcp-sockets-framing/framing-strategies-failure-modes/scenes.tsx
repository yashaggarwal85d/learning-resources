import type { StepCtx } from '../../../../../reels/types';
import { easeOut, lerp, seg } from '../../../../../reels/anim';
import { Code } from '../../../../../reels/Code';
import { Stack, Svg, T, C, Bar, Reticle } from '../../../../../reels/kit';

// A capped length-prefixed frame decodes correctly and extracts without copying a
// single byte; an uncapped claim is rejected before any large buffer is ever
// allocated — the real denial-of-service vector a length prefix needs a cap to avoid.
// Each of the three framing strategies the syllabus names fails in its own distinct way.
const fa = (t: number, a: number, d = 0.4) => easeOut(seg(t, a, a + d));

// ── 1 · A frame over the cap (predict, hook) ────────────────────────────────────────────────────
export function CapPredict({ t }: StepCtx) {
  return (
    <Stack>
      <Code
        title="a real decoder, a 1024-byte cap"
        lines={['if len > MAX_FRAME { return Err(..); }', '// a frame claims a length of 1 GiB', '// what happens?']}
        t={t}
        start={0.1}
        end={2.6}
        highlight={[0]}
      />
    </Stack>
  );
}

// ── 2 · Measured: rejected before allocation (swipe test's "from" step — NO takeaway) ───────────
export function CapReveal({ t }: StepCtx) {
  const capAt = 0.4;
  const w = lerp(6, 400, easeOut(seg(t, 0.15, capAt)));
  return (
    <Svg label="capped_length_prefix_framing.rs, measured" h={200}>
      <T x={60} y={30} s={13} f={C.quiet}>a frame claims a length of 1 GiB</T>
      <line x1={260} y1={20} x2={260} y2={56} stroke={C.cherryText} strokeWidth={2} />
      <T x={260} y={70} s={11} a="middle" f={C.cherryText}>cap</T>
      <Bar x={60} y={35} w={Math.min(w, 200)} h={18} full={400} fill={w > 195 ? C.cherryText : C.caramel} />
      <Reticle x={260} y={44} w={30} h={34} t={t} at={capAt} />
      <T x={60} y={100} s={13} f={C.mocha} o={fa(t, 0.5, 0.3)}>rejected, no such buffer allocated</T>
      <T x={60} y={130} s={13} f={C.latte} o={fa(t, 0.8, 0.3)}>the cap check runs before allocation</T>
    </Svg>
  );
}

// ── 3 · split_to: copy or not? (predict) ────────────────────────────────────────────────────────
export function SplitToPredict({ t }: StepCtx) {
  return (
    <Stack>
      <Code
        title="a frame under the cap, extracted with split_to"
        lines={['let frame = buf.split_to(len);', '// a fresh copy, or the same bytes, split?']}
        t={t}
        start={0.1}
        end={2.4}
        highlight={[0]}
      />
    </Stack>
  );
}

// ── 4 · Measured: zero-copy, confirmed by pointer (takeaway) ────────────────────────────────────
export function SplitToReveal({ t }: StepCtx) {
  const x = lerp(90, 260, easeOut(seg(t, 0.2, 0.6)));
  return (
    <Svg label="the frame's own pointer, checked directly" h={200}>
      <rect x={60} y={40} width={300} height={40} rx={6} fill="none" stroke={C.taupe} strokeWidth={1.5} />
      <T x={70} y={65} s={11} f={C.quiet}>buffer</T>
      <rect x={x} y={44} width={90} height={32} rx={4} fill={C.caramel} opacity={fa(t, 0.2, 0.3)} />
      <T x={x + 45} y={65} s={11} a="middle" f={C.mocha}>frame</T>
      <T x={60} y={110} s={13} f={C.mocha} o={fa(t, 0.7, 0.3)}>lands at the payload's own address</T>
      <T x={60} y={140} s={13} f={C.latte} o={fa(t, 1.0, 0.3)}>split in place, never copied</T>
    </Svg>
  );
}

// ── 5 · The Decoder trait's actual job (predict) ────────────────────────────────────────────────
export function DecoderPredict({ t }: StepCtx) {
  return (
    <Stack>
      <Code
        title="the codec documentation's own description"
        lines={['trait Decoder {', '    fn decode(&mut self, src: &mut BytesMut) -> ..;', '} // what is this trait actually for?']}
        t={t}
        start={0.1}
        end={2.6}
        highlight={[1]}
      />
    </Stack>
  );
}

// ── 6 · The documentation's own words, quoted (no takeaway, connecting step) ────────────────────
export function DecoderReveal({ t }: StepCtx) {
  const x = lerp(60, 220, easeOut(seg(t, 0.2, 0.6)));
  return (
    <Svg label="the codec documentation, quoted directly" h={160}>
      <line x1={60} y1={25} x2={400} y2={25} stroke={C.mocha} strokeWidth={1.5} />
      <line x1={x} y1={10} x2={x} y2={40} stroke={C.caramel} strokeWidth={2} />
      <T x={60} y={65} s={13} f={C.crema} o={fa(t, 0.5, 0.4)}>turn bytes into frames, find the boundaries</T>
      <T x={60} y={95} s={13} f={C.latte} o={fa(t, 0.9, 0.4)}>exactly the problem a byte stream creates</T>
    </Svg>
  );
}

// ── 7 · Three strategies, three costs (predict) ─────────────────────────────────────────────────
export function StrategiesPredict({ t }: StepCtx) {
  return (
    <Stack>
      <Code
        title="length-prefix, delimiter-based, fixed-size"
        lines={['// length-prefix needs a cap', '// delimiter-based and fixed-size need what, instead?']}
        t={t}
        start={0.1}
        end={2.4}
        highlight={[1]}
      />
    </Stack>
  );
}

// ── 8 · Three distinct failure modes, shown together (takeaway) ────────────────────────────────
export function StrategiesReveal({ t }: StepCtx) {
  const rows = [
    'length-prefix: needs a cap, or a DoS risk',
    'delimiter: needs escaping and a real scan',
    'fixed-size: wastes real bandwidth sometimes',
  ];
  return (
    <Svg label="three strategies, three distinct costs" h={220}>
      {rows.map((r, i) => (
        <g key={r} opacity={fa(t, 0.2 + i * 0.35, 0.4)}>
          <circle cx={30} cy={40 + i * 45} r={5} fill={C.caramel} />
          <T x={48} y={46 + i * 45} s={13} f={C.crema}>{r}</T>
        </g>
      ))}
    </Svg>
  );
}

// ── 9 · The chapter's own chosen pattern (takeaway) ─────────────────────────────────────────────
export function PatternReveal({ t }: StepCtx) {
  const capK = easeOut(seg(t, 0.2, 0.4));
  const splitX = lerp(150, 260, easeOut(seg(t, 0.6, 0.9)));
  return (
    <Svg label="capped, and extracted without copying" h={160}>
      <line x1={150} y1={15} x2={150} y2={45} stroke={C.cherryText} strokeWidth={2} opacity={capK} />
      <rect x={60} y={20} width={90} height={30} rx={4} fill="none" stroke={C.caramel} strokeWidth={1.5} />
      <rect x={splitX} y={20} width={70} height={30} rx={4} fill={C.caramel} opacity={fa(t, 0.6, 0.3)} />
      <T x={60} y={75} s={13} f={C.crema} o={fa(t, 0.3, 0.4)}>cap the claim before trusting it</T>
      <T x={60} y={100} s={13} f={C.latte} o={fa(t, 0.7, 0.4)}>then split the buffer in place</T>
    </Svg>
  );
}

// ── 10 · Recap ────────────────────────────────────────────────────────────────────────────────────
export function Recap({ t }: StepCtx) {
  const rows = [
    'a capped frame decodes with no copy at all',
    'an oversized claim rejected before allocation',
    'three strategies, three distinct costs to pay',
    'cap the claim, then split in place',
  ];
  return (
    <Svg label="recap: a cap and a split, not a copy" h={300}>
      {rows.map((r, i) => (
        <g key={r} opacity={fa(t, 0.2 + i * 0.4, 0.4)}>
          <circle cx={30} cy={40 + i * 55} r={5} fill={C.caramel} />
          <T x={48} y={46 + i * 55} s={13} f={C.crema}>{r}</T>
        </g>
      ))}
    </Svg>
  );
}
