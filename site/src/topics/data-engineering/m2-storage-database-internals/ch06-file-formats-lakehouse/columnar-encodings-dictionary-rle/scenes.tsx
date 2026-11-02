import { C, Svg, T } from '../../../../../reels/kit';
import { easeOut, seg } from '../../../../../reels/anim';
import type { StepCtx } from '../../../../../reels/types';

function TallRow({ y, label, value, valueColor = C.crema, o = 1 }: { y: number; label: string; value: string; valueColor?: string; o?: number }) {
  return (
    <g opacity={o}>
      <T x={25} y={y} s={14} f={C.latte}>
        {label}
      </T>
      <T x={25} y={y + 26} s={16} f={valueColor} w={600}>
        {value}
      </T>
    </g>
  );
}

function Strip({ y, h = 36, segments }: { y: number; h?: number; segments: { w: number; label: string; color: string; textColor?: string }[] }) {
  let x = 25;
  const total = segments.reduce((s, seg) => s + seg.w, 0);
  const scale = 550 / total;
  return (
    <g>
      {segments.map((s, i) => {
        const w = s.w * scale;
        const rect = (
          <g key={i}>
            <rect x={x} y={y} width={w} height={h} fill={s.color} stroke={C.line} strokeWidth={1} />
            <T x={x + w / 2} y={y + h / 2 + 5} a="middle" s={12} f={s.textColor ?? C.focus}>
              {s.label}
            </T>
          </g>
        );
        x += w;
        return rect;
      })}
    </g>
  );
}

export function Hook({ t }: StepCtx) {
  return (
    <Svg label="five encodings, five columns, 200 rows each." h={200}>
      <TallRow y={40} label="zone column" value="400 -> 113 bytes" o={easeOut(seg(t, 0, 0.3))} />
      <TallRow y={100} label="shipment ids" value="1600 -> 60 bytes" o={easeOut(seg(t, 0.25, 0.65))} />
      <TallRow y={160} label="five columns" value="five different bets" valueColor={C.focus} o={easeOut(seg(t, 0.55, 1))} />
    </Svg>
  );
}

export function PredictZoneColumn({ t }: StepCtx) {
  return (
    <Svg label="zone only ever holds one of 6 warehouse codes, across 200 rows. Stored 200 times over?" h={200}>
      <TallRow y={40} label="zone column" value="6 codes, 200 rows" o={easeOut(seg(t, 0, 0.5))} />
      <TallRow y={100} label="on disk" value="200 copies, or smaller?" valueColor={C.focus} o={easeOut(seg(t, 0.4, 1))} />
    </Svg>
  );
}

export function RevealDictionaryRLE({ t }: StepCtx) {
  return (
    <Svg label="a dictionary page of 6 strings, then a data page of RLE/bit-packed indexes: 400 becomes 113." h={230}>
      <TallRow y={40} label="dictionary page" value="6 unique codes" o={easeOut(seg(t, 0, 0.35))} />
      <TallRow y={100} label="data page" value="RLE/bit-packed indexes" valueColor={C.focus} o={easeOut(seg(t, 0.3, 0.7))} />
      <Strip y={155} segments={[
        { w: 1, label: '113 bytes', color: C.cinnamon, textColor: C.ink },
        { w: 1.5, label: 'saved vs PLAIN', color: C.quiet, textColor: C.focus },
      ]} />
    </Svg>
  );
}

export function RevealFallback({ t }: StepCtx) {
  return (
    <Svg label="the real fallback: 200 distinct values past a 40-entry limit falls back to PLAIN." h={230}>
      <TallRow y={40} label="high-cardinality column" value="200 of 200 distinct" o={easeOut(seg(t, 0, 0.4))} />
      <TallRow y={100} label="limit 40 — strategy chosen" value="PLAIN" valueColor={C.focus} o={easeOut(seg(t, 0.4, 1))} />
    </Svg>
  );
}

export function RevealRLEScope({ t }: StepCtx) {
  return (
    <Svg label="RLE/bit-packing is scoped to levels, dictionary indices, and booleans — one bit width per page." h={230}>
      <TallRow y={40} label="used for" value="levels, indices, booleans" o={easeOut(seg(t, 0, 0.4))} />
      <TallRow y={100} label="bit width" value="one per page" valueColor={C.focus} o={easeOut(seg(t, 0.35, 0.75))} />
    </Svg>
  );
}

export function PredictShipmentIds({ t }: StepCtx) {
  return (
    <Svg label="200 near-sorted shipment ids, consecutive differences of 1 or 2. Which encoding wins?" h={200}>
      <TallRow y={40} label="shipment ids" value="200 rows, near-sorted" o={easeOut(seg(t, 0, 0.5))} />
      <TallRow y={100} label="PLAIN" value="1600 bytes" valueColor={C.focus} o={easeOut(seg(t, 0.4, 1))} />
    </Svg>
  );
}

export function RevealDeltaBinaryPacked({ t }: StepCtx) {
  return (
    <Svg label="block size 128, 4 miniblocks, a frame-of-reference minimum subtracted per miniblock." h={230}>
      <TallRow y={40} label="block size 128" value="4 miniblocks" o={easeOut(seg(t, 0, 0.35))} />
      <TallRow y={100} label="PLAIN 1600 bytes" value="60 bytes" valueColor={C.focus} o={easeOut(seg(t, 0.3, 0.7))} />
      <Strip y={155} segments={[
        { w: 1, label: '60 bytes', color: C.cinnamon, textColor: C.ink },
        { w: 1.5, label: '96% smaller', color: C.quiet, textColor: C.focus },
      ]} />
    </Svg>
  );
}

export function RevealTwoBets({ t }: StepCtx) {
  return (
    <Svg label="DELTA_BYTE_ARRAY bets on shared prefixes; BYTE_STREAM_SPLIT bets on the compressor after it." h={230}>
      <TallRow y={40} label="tracking codes" value="shared prefixes" o={easeOut(seg(t, 0, 0.4))} />
      <TallRow y={100} label="float weights" value="same size as PLAIN" valueColor={C.focus} o={easeOut(seg(t, 0.4, 1))} />
    </Svg>
  );
}

export function RevealEncodeCompress({ t }: StepCtx) {
  return (
    <Svg label="PLAIN and BYTE_STREAM_SPLIT are both 800 bytes raw; zlib shrinks the split version further." h={230}>
      <TallRow y={40} label="weights, raw" value="800 bytes either way" o={easeOut(seg(t, 0, 0.35))} />
      <TallRow y={100} label="after zlib" value="307 vs 234 bytes" valueColor={C.focus} o={easeOut(seg(t, 0.3, 0.7))} />
    </Svg>
  );
}

export function Recap({ t }: StepCtx) {
  return (
    <Svg label="dictionary trades repetition for indirection; delta bets on nearby values; split bets on what's next." h={300}>
      <TallRow y={35} label="dictionary + RLE" value="indirection, real fallback" o={easeOut(seg(t, 0, 0.3))} />
      <TallRow y={100} label="delta encodings" value="nearby values, shared prefixes" o={easeOut(seg(t, 0.1, 0.4))} />
      <TallRow y={165} label="byte-stream-split" value="same size, until compressed" valueColor={C.focus} o={easeOut(seg(t, 0.25, 0.6))} />
      <g opacity={easeOut(seg(t, 0.55, 1))}>
        <T x={25} y={230} s={14} f={C.latte}>
          the rule
        </T>
        <T x={25} y={256} s={16} f={C.focus} w={600}>
          every encoding bets on a shape in the data —
        </T>
        <T x={25} y={280} s={16} f={C.focus} w={600}>
          picking wrong just means falling back to PLAIN
        </T>
      </g>
    </Svg>
  );
}
