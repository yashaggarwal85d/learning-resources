import { Bar, C, Svg, T } from '../../../../../reels/kit';
import { easeOut, seg } from '../../../../../reels/anim';
import type { StepCtx } from '../../../../../reels/types';

/** A label-left / value-right row, stacked vertically with generous gaps (DESIGN.md, phone text scaling). */
function Row({ y, label, value, valueColor = C.crema, o = 1 }: { y: number; label: string; value: string; valueColor?: string; o?: number }) {
  return (
    <g opacity={o}>
      <T x={25} y={y} s={15} f={C.latte}>
        {label}
      </T>
      <T x={575} y={y} s={17} f={valueColor} a="end" w={600}>
        {value}
      </T>
    </g>
  );
}

function bar(x: number, y: number, frac: number, display: string, label: string, fill: string) {
  return (
    <g key={label}>
      <T x={x} y={y - 20} s={13} f={C.latte}>
        {label}
      </T>
      <Bar x={x} y={y} w={340 * frac} h={20} full={340} fill={fill} />
      <T x={x} y={y + 38} s={13} f={C.crema}>
        {display}
      </T>
    </g>
  );
}

export function Hook({ t }: StepCtx) {
  return (
    <Svg label="natural key blocks the update. surrogate key absorbs it." h={370}>
      {bar(30, 90, 1, 'update refused', 'natural key', C.cherryText)}
      {bar(30, 210, 0.2, 'one row changed', 'surrogate key', C.focus)}
    </Svg>
  );
}

export function PredictEmailChanges({ t }: StepCtx) {
  return (
    <Svg label="email is the key everywhere — then it changes" h={200}>
      <Row y={70} label="email is the key" value="referenced everywhere" />
      <Row y={130} label="customer changes it" value="?" />
    </Svg>
  );
}

export function RevealNaturalKeyBreaks({ t }: StepCtx) {
  return (
    <Svg label="orders still reference the email about to change" h={200}>
      <Row y={70} label="update customer_email" value="attempted" o={easeOut(seg(t, 0, 0.6))} />
      <Row y={130} label="still referenced" value="update refused" valueColor={C.cherryText} o={easeOut(seg(t, 0.4, 1))} />
    </Svg>
  );
}

export function RevealSurrogateKeyAbsorbs({ t }: StepCtx) {
  return (
    <Svg label="one row changes, every order still resolves" h={200}>
      <Row y={70} label="update customer_email" value="succeeds" o={easeOut(seg(t, 0, 0.6))} />
      <Row y={130} label="orders resolve by" value="customer_id, unchanged" valueColor={C.focus} o={easeOut(seg(t, 0.4, 1))} />
    </Svg>
  );
}

export function RevealNaturalVsSurrogate({ t }: StepCtx) {
  return (
    <Svg label="a business attribute vs. a meaningless identifier" h={200}>
      <Row y={70} label="natural key" value="a business attribute" o={easeOut(seg(t, 0, 0.6))} />
      <Row y={130} label="surrogate key" value="no business meaning" valueColor={C.focus} o={easeOut(seg(t, 0.4, 1))} />
    </Svg>
  );
}

export function PredictSequenceDistributed({ t }: StepCtx) {
  return (
    <Svg label="several writers, no shared coordinator" h={200}>
      <Row y={70} label="independent writers" value="one shared sequence?" />
      <Row y={130} label="still safe?" value="?" />
    </Svg>
  );
}

export function RevealSequenceGaps({ t }: StepCtx) {
  return (
    <Svg label="never rolled back, caching breaks strict order" h={200}>
      <Row y={70} label="nextval" value="never rolled back" o={easeOut(seg(t, 0, 0.6))} />
      <Row y={130} label="a cache setting" value="breaks cross-session order" valueColor={C.cherryText} o={easeOut(seg(t, 0.4, 1))} />
    </Svg>
  );
}

export function RevealGenerationCost({ t }: StepCtx) {
  return (
    <Svg label="same inserts, same index, three generators" h={320}>
      {bar(30, 70, 0.5, 'fastest', 'sequence', C.focus)}
      {bar(30, 170, 0.78, 'next', 'uuidv7', C.second)}
      {bar(30, 270, 1, 'slowest', 'uuidv4', C.cherryText)}
    </Svg>
  );
}

export function RevealIndexLocality({ t }: StepCtx) {
  return (
    <Svg label="leaf-page density after the same inserts" h={320}>
      {bar(30, 70, 0.9, 'dense, few pages', 'sequence', C.focus)}
      {bar(30, 170, 0.9, 'dense, few pages', 'uuidv7', C.second)}
      {bar(30, 270, 0.65, 'emptier, more pages', 'uuidv4', C.cherryText)}
    </Svg>
  );
}

export function RevealUUIDv7BitLayout({ t }: StepCtx) {
  return (
    <Svg label="a shared timestamp prefix, then randomness" h={200}>
      <Row y={70} label="uuidv7 prefix" value="shared, back to back" o={easeOut(seg(t, 0, 0.6))} />
      <Row y={130} label="uuidv4 prefix" value="never shared" valueColor={C.cherryText} o={easeOut(seg(t, 0.4, 1))} />
    </Svg>
  );
}

export function RevealDurableKey({ t }: StepCtx) {
  return (
    <Svg label="constant across versions, unlike the surrogate" h={200}>
      <Row y={70} label="durable key" value="constant across versions" o={easeOut(seg(t, 0, 0.6))} />
      <Row y={130} label="surrogate key" value="changes per version" valueColor={C.second} o={easeOut(seg(t, 0.4, 1))} />
    </Svg>
  );
}

export function PredictHashCollision({ t }: StepCtx) {
  return (
    <Svg label="a hash of a business key — a real risk?" h={200}>
      <Row y={70} label="hash as surrogate" value="collision risk?" />
      <Row y={130} label="quantifiable, or a caveat" value="?" />
    </Svg>
  );
}

export function RevealBirthdayBound({ t }: StepCtx) {
  const rows: [string, string][] = [
    ['narrow hash', 'even odds, early'],
    ['mid-width hash', 'a real risk at scale'],
    ['full-width hash', 'negligible'],
  ];
  return (
    <Svg label="collision odds, computed by width" h={240}>
      {rows.map(([label, value], i) => (
        <Row key={label} y={60 + i * 65} label={label} value={value} o={easeOut(seg(t, i * 0.25, i * 0.25 + 0.6))} />
      ))}
    </Svg>
  );
}

export function Recap({ t }: StepCtx) {
  return (
    <Svg label="natural breaks, surrogate absorbs; cost and locality traded off" h={240}>
      <Row y={55} label="natural vs. surrogate" value="breaks vs. absorbs" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={115} label="three generators" value="coordination vs. locality" o={easeOut(seg(t, 0.2, 0.7))} />
      <Row y={175} label="hash width" value="a computed risk" o={easeOut(seg(t, 0.4, 0.9))} />
    </Svg>
  );
}

export function ProveUUIDv7Choice({ t }: StepCtx) {
  return (
    <Svg label="no coordinator, still sorts near insertion order" h={200}>
      <Row y={70} label="no coordinator" value="sorts near insertion order" />
      <Row y={130} label="the right key is" value="?" />
    </Svg>
  );
}
