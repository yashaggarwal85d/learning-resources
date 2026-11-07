import type { StepCtx } from '../../../../../reels/types';
import { easeOut, seg } from '../../../../../reels/anim';
import { Code } from '../../../../../reels/Code';
import { Draw, Stack, Svg, T, C } from '../../../../../reels/kit';

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
  const bounce = easeOut(seg(t, 0.5, 0.75));
  const dx = (1 - Math.abs(bounce - 0.5) * 2) * 20;
  return (
    <Svg label="capped_length_prefix_framing.rs, measured" h={200}>
      <T x={60} y={60} s={14} f={C.crema} o={fa(t, 0.3, 0.4)}>a frame claims a length of 1 GiB</T>
      <circle cx={280 + dx} cy={57} r={4} fill={C.cherry} opacity={fa(t, 0.5, 0.2)} />
      <rect x={60} y={85} width={260} height={44} rx={6} fill="none" stroke={C.caramel} strokeWidth={2} />
      {fa(t, 1.0, 0.4) > 0.85 && <T x={190} y={112} s={13} a="middle" f={C.mocha}>rejected, no such buffer allocated</T>}
      <T x={60} y={160} s={13} f={C.latte} o={fa(t, 1.5, 0.4)}>the cap check runs before allocation</T>
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
  const land = easeOut(seg(t, 0.5, 0.8));
  const dy = (1 - land) * -24;
  return (
    <Svg label="the frame's own pointer, checked directly" h={200}>
      <T x={60} y={60} s={14} f={C.crema} o={fa(t, 0.3, 0.4)}>the frame's own data pointer, checked</T>
      <Draw pts={[[240, 50], [240, 85]]} t={t} from={0.5} to={0.8} stroke={C.caramel} w={2} pen />
      <rect x={60} y={85} width={260} height={44} rx={6} fill="none" stroke={C.caramel} strokeWidth={2} />
      <g transform={`translate(0,${dy})`} opacity={land}>
        <T x={190} y={112} s={13} a="middle" f={C.mocha}>lands at the payload's own address</T>
      </g>
      <T x={60} y={160} s={13} f={C.latte} o={fa(t, 1.5, 0.4)}>split in place, never copied</T>
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
  const slide1 = easeOut(seg(t, 0.2, 0.55));
  const slide2 = easeOut(seg(t, 0.7, 1.05));
  return (
    <Svg label="the codec documentation, quoted directly" h={160}>
      <g transform={`translate(${(1 - slide1) * -70},0)`} opacity={slide1}>
        <T x={60} y={70} s={13} f={C.crema}>turn bytes into frames, find the boundaries</T>
      </g>
      <g transform={`translate(${(1 - slide2) * -70},0)`} opacity={slide2}>
        <T x={60} y={100} s={13} f={C.latte}>exactly the problem a byte stream creates</T>
      </g>
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
  const slide1 = easeOut(seg(t, 0.2, 0.55));
  const slide2 = easeOut(seg(t, 0.7, 1.05));
  return (
    <Svg label="capped, and extracted without copying" h={160}>
      <g transform={`translate(${(1 - slide1) * -70},0)`} opacity={slide1}>
        <T x={60} y={70} s={13} f={C.crema}>cap the claim before trusting it</T>
      </g>
      <g transform={`translate(${(1 - slide2) * -70},0)`} opacity={slide2}>
        <T x={60} y={100} s={13} f={C.latte}>then split the buffer in place</T>
      </g>
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
