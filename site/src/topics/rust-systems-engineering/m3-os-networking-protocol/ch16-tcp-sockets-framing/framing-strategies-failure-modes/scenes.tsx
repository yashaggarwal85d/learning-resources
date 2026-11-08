import type { StepCtx } from '../../../../../reels/types';
import { easeOut, seg, lerp, clamp } from '../../../../../reels/anim';
import { Code } from '../../../../../reels/Code';
import { Reticle, Draw, Stack, Svg, T, C } from '../../../../../reels/kit';

// A capped length-prefixed frame decodes correctly and extracts without copying a
// single byte; an uncapped claim is rejected before any large buffer is ever
// allocated — the real denial-of-service vector a length prefix needs a cap to avoid.
// Each of the three framing strategies the syllabus names fails in its own distinct way.
const fa = (t: number, a: number, d = 0.4) => easeOut(seg(t, a, a + d));

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
  // Each strategy fails its own way. A length prefix claims a length nobody capped, and the claim runs off the
  // edge; a delimiter has to be found by a cursor scanning every byte; a fixed slot pads a short message.
  const scan = clamp((t - 1.0) / 0.9);
  const bytes = Array.from({ length: 12 }, (_, i) => i);
  const delim = [4, 9];
  return (
    <Svg label="three strategies, three distinct costs" h={240}>
      <T x={30} y={50} s={13} f={C.crema} o={fa(t, 0.1, 0.3)}>length-prefix</T>
      <T x={30} y={70} s={13} f={C.taupe} o={fa(t, 0.1, 0.3)}>needs a cap</T>
      <rect x={210} y={40} width={44} height={22} rx={3} fill="none" stroke={C.caramel} strokeWidth={1.5} />
      <T x={232} y={56} s={13} a="middle" f={C.crema}>len</T>
      <Draw pts={[[258, 51], [590, 51]]} t={t} from={0.3} to={0.9} stroke={C.cherryText} w={2} dash="6 4" />
      <T x={30} y={125} s={13} f={C.crema} o={fa(t, 0.9, 0.3)}>delimiter</T>
      <T x={30} y={145} s={13} f={C.taupe} o={fa(t, 0.9, 0.3)}>needs a scan</T>
      {bytes.map((i) => (
        <rect key={i} x={210 + i * 30} y={delim.includes(i) ? 112 : 118} width={delim.includes(i) ? 6 : 22} height={delim.includes(i) ? 30 : 18} rx={2} fill={delim.includes(i) ? C.caramel : C.mocha} opacity={fa(t, 0.9 + i * 0.02, 0.2)} />
      ))}
      <rect x={lerp(206, 206 + 11 * 30, scan)} y={108} width={30} height={38} rx={3} fill="none" stroke={C.caramel} strokeWidth={1.5} opacity={scan > 0 && scan < 1 ? 1 : 0} />
      <T x={30} y={200} s={13} f={C.crema} o={fa(t, 1.8, 0.3)}>fixed-size</T>
      <T x={30} y={220} s={13} f={C.taupe} o={fa(t, 1.8, 0.3)}>wastes bytes</T>
      {[0, 1, 2].map((i) => {
        const k = easeOut(seg(t, 1.9 + i * 0.15, 2.3 + i * 0.15));
        const used = [40, 70, 25][i];
        return (
          <g key={i}>
            <rect x={210 + i * 122} y={192} width={112} height={20} rx={3} fill="none" stroke={C.mocha} />
            <rect x={210 + i * 122} y={192} width={Math.max(2, used * k)} height={20} rx={3} fill={C.caramel} />
            <rect x={210 + i * 122 + used} y={196} width={Math.max(0, (112 - used - 3) * k)} height={12} rx={2} fill={C.cherry} />
          </g>
        );
      })}
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
    <Svg label="recap: a cap and a split, not a copy" h={240}>
      {rows.map((r, i) => (
        <Row key={r} t={t} at={0.2 + i * 0.45} y={40 + i * 50} text={r} />
      ))}
      <Reticle x={290} y={190} w={556} h={36} t={t} at={2.25} />
    </Svg>
  );
}
