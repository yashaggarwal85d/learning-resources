import type { StepCtx } from '../../../../../reels/types';
import { clamp, easeOut, seg } from '../../../../../reels/anim';
import { C, Svg, T } from '../../../../../reels/kit';

// Colour grammar: caramel = the pairing or path that is right, cherryText = the wrong pairing or the costly path,
// crema = data, latte = labels, taupe = structure. Order 42: tags [bogo, winter, vip], discounts [5, 10, 15].

const TAGS = ['bogo', 'winter', 'vip'];
const DISC = ['5', '10', '15'];

function Chip({ x, y, w = 76, label, hi = false, bad = false, o = 1 }: { x: number; y: number; w?: number; label: string; hi?: boolean; bad?: boolean; o?: number }) {
  return (
    <g opacity={o}>
      <rect x={x} y={y} width={w} height={32} rx={8} fill={C.cocoa} stroke={bad ? C.cherryText : hi ? C.caramel : C.mocha} strokeWidth={hi || bad ? 2 : 1} />
      <T x={x + w / 2} y={y + 21} s={13} f={C.crema} a="middle">{label}</T>
    </g>
  );
}

// 1 · Not flat.
export function NotFlat({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.3, 1.1));
  const b = easeOut(seg(t, 1.0, 1.8));
  const c = easeOut(seg(t, 1.7, 2.5));
  return (
    <Svg label="Order 42 has an array of tags, an array of discounts and a JSON document" h={300}>
      <T x={25} y={36} s={14} f={C.latte}>order 42</T>
      <T x={25} y={76} s={13} f={C.latte} o={a}>tags</T>
      {TAGS.map((s, i) => <Chip key={s} x={110 + i * 90} y={58} label={s} o={a} />)}
      <T x={25} y={140} s={13} f={C.latte} o={b}>discounts</T>
      {DISC.map((s, i) => <Chip key={s} x={110 + i * 90} y={122} label={s} o={b} w={60} />)}
      <T x={25} y={204} s={13} f={C.latte} o={c}>metadata</T>
      <rect x={110} y={186} width={300} height={72} rx={8} fill={C.roast} stroke={C.mocha} opacity={c} />
      <T x={124} y={212} s={13} f={C.crema} o={c}>{'{ "device": "ios",'}</T>
      <T x={124} y={236} s={13} f={C.crema} o={c}>{'  "utm": { "source": "email" } }'}</T>
    </Svg>
  );
}

// 2 · Three shapes.
export function Shapes({ t }: StepCtx) {
  const items = [
    { k: 'array', v: '[bogo, winter, vip]', n: 'ordered, same type' },
    { k: 'struct', v: '(city, zip)', n: 'labelled fields' },
    { k: 'map', v: '{ key: value }', n: 'JSON plays this part in PostgreSQL' },
  ];
  return (
    <Svg label="Arrays, structs and maps" h={300}>
      {items.map((it, i) => (
        <g key={it.k} opacity={easeOut(seg(t, i * 0.7, i * 0.7 + 0.7))}>
          <T x={25} y={60 + i * 80} s={18} f={C.caramel} w={700}>{it.k}</T>
          <T x={150} y={60 + i * 80} s={15} f={C.crema}>{it.v}</T>
          <T x={150} y={84 + i * 80} s={13} f={C.latte}>{it.n}</T>
        </g>
      ))}
    </Svg>
  );
}

// 3 · One unnest.
export function OneUnnest({ t }: StepCtx) {
  return (
    <Svg label="unnest expands one array of 3 tags into 3 rows" h={300}>
      <T x={25} y={36} s={14} f={C.latte}>unnest(tags)</T>
      {TAGS.map((s, i) => <Chip key={s} x={25 + i * 90} y={50} label={s} o={0.6} />)}
      {TAGS.map((s, i) => {
        const a = easeOut(seg(t, 0.6 + i * 0.5, 1.2 + i * 0.5));
        return <g key={s} transform={`translate(0 ${(1 - a) * -30})`} opacity={clamp(a)}><Chip x={25} y={120 + i * 46} w={120} label={s} hi /></g>;
      })}
      <T x={200} y={142} s={14} f={C.latte} o={easeOut(seg(t, 2.4, 3.0))}>3 rows, in storage order</T>
    </Svg>
  );
}

// 4 · Predict: product.
export function ProductPredict({ t, answer }: StepCtx) {
  const answered = answer !== null;
  return (
    <Svg label="Two unnest calls in FROM pair every tag with every discount" h={340}>
      {TAGS.map((s, i) => <Chip key={s} x={25} y={50 + i * 84} w={76} label={s} />)}
      {DISC.map((s, i) => <Chip key={s} x={270} y={50 + i * 84} w={60} label={s} />)}
      {answered && TAGS.flatMap((_, i) => DISC.map((__, j) => {
        const right = i === j;
        return <line key={`${i}-${j}`} x1={101} y1={66 + i * 84} x2={270} y2={66 + j * 84} stroke={right ? C.caramel : C.cherryText} strokeWidth={right ? 3 : 1.5} opacity={easeOut(seg(t, 0.2 + (i * 3 + j) * 0.1, 0.6 + (i * 3 + j) * 0.1)) * (right ? 1 : 0.7)} />;
      }))}
      {!answered && <T x={440} y={160} s={52} f={C.caramel} a="middle" o={0.75 + 0.25 * Math.sin(t * 3)}>?</T>}
      {answered && <T x={450} y={160} s={22} f={C.cherryText} a="middle" w={700}>9 pairs</T>}
    </Svg>
  );
}

// 5 · Zip.
export function Zip({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.4, 1.6));
  const b = easeOut(seg(t, 2.4, 3.4));
  return (
    <Svg label="One multi-argument unnest pairs by position; a shorter array is padded with NULLs" h={340}>
      {TAGS.map((s, i) => (
        <g key={s}>
          <Chip x={25} y={30 + i * 44} w={76} label={s} hi />
          <line x1={101} y1={46 + i * 44} x2={190} y2={46 + i * 44} stroke={C.caramel} strokeWidth={3} opacity={a} />
          <Chip x={190} y={30 + i * 44} w={60} label={DISC[i]} hi />
        </g>
      ))}
      <T x={300} y={52} s={14} f={C.caramel} o={a}>3 rows</T>
      <g opacity={b}>
        {['bogo', 'winter', 'vip', 'new'].map((s, i) => (
          <g key={s}>
            <Chip x={25} y={190 + i * 36 - 10} w={76} label={s} />
            {i < 3 ? <Chip x={190} y={190 + i * 36 - 10} w={60} label={DISC[i]} /> : <rect x={190} y={190 + i * 36 - 10} width={60} height={32} rx={8} fill="none" stroke={C.latte} strokeDasharray="5 4" />}
          </g>
        ))}
        <T x={290} y={232} s={14} f={C.latte}>4 tags, 3 discounts: 4 rows,</T>
        <T x={290} y={252} s={14} f={C.latte}>last discount NULL</T>
      </g>
    </Svg>
  );
}

// 6 · Ordinality.
export function Ordinality({ t }: StepCtx) {
  return (
    <Svg label="WITH ORDINALITY adds the position of each element" h={280}>
      {TAGS.map((s, i) => (
        <g key={s} opacity={easeOut(seg(t, 0.3 + i * 0.5, 0.8 + i * 0.5))}>
          <Chip x={25} y={50 + i * 56} w={90} label={s} />
          <Chip x={140} y={50 + i * 56} w={60} label={DISC[i]} />
          <rect x={225} y={50 + i * 56} width={48} height={32} rx={8} fill={C.caramel} />
          <T x={249} y={71 + i * 56} s={14} f={C.espresso} a="middle" w={700}>{String(i + 1)}</T>
        </g>
      ))}
      <T x={300} y={50} s={13} f={C.latte}>position</T>
    </Svg>
  );
}

// 7 · Arrows.
export function Arrows({ t }: StepCtx) {
  const steps = [
    { e: "metadata", r: 'the whole document', f: C.crema },
    { e: "metadata -> 'utm'", r: '{ "source": "email" }  (json)', f: C.crema },
    { e: "metadata -> 'utm' ->> 'source'", r: "email  (text)", f: C.caramel },
  ];
  return (
    <Svg label="Arrow operators drill into JSON" h={280}>
      {steps.map((s, i) => (
        <g key={s.e} opacity={easeOut(seg(t, i * 0.9, i * 0.9 + 0.7))}>
          <T x={25} y={56 + i * 70} s={14} f={C.latte}>{s.e}</T>
          <T x={25} y={82 + i * 70} s={15} f={s.f} w={600}>{s.r}</T>
        </g>
      ))}
    </Svg>
  );
}

// 8 · JSON_TABLE.
export function JsonTable({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.4, 1.6));
  return (
    <Svg label="JSON_TABLE turns a document into rows and typed columns" h={300}>
      <rect x={25} y={40} width={200} height={110} rx={8} fill={C.roast} stroke={C.mocha} />
      <T x={40} y={72} s={13} f={C.crema}>{'{ "device": "ios",'}</T>
      <T x={40} y={96} s={13} f={C.crema}>{'  "utm": { … } }'}</T>
      <line x1={225} y1={95} x2={310} y2={95} stroke={C.caramel} strokeWidth={3} opacity={a} />
      <T x={268} y={84} s={13} f={C.caramel} a="middle" o={a}>COLUMNS</T>
      <g opacity={a}>
        <T x={320} y={58} s={13} f={C.latte}>device</T>
        <T x={430} y={58} s={13} f={C.latte}>source</T>
        <rect x={320} y={68} width={100} height={30} rx={6} fill={C.cocoa} stroke={C.mocha} />
        <T x={370} y={88} s={13} f={C.crema} a="middle">ios</T>
        <rect x={430} y={68} width={100} height={30} rx={6} fill={C.cocoa} stroke={C.mocha} />
        <T x={480} y={88} s={13} f={C.crema} a="middle">email</T>
      </g>
      <T x={25} y={210} s={14} f={C.caramel} o={easeOut(seg(t, 2.2, 3.0))}>joined laterally to the row that held the JSON</T>
      <T x={25} y={238} s={13} f={C.latte} o={easeOut(seg(t, 2.6, 3.4))}>PostgreSQL 17 and later</T>
    </Svg>
  );
}

// 9 · Text cost.
export function TextCost({ t }: StepCtx) {
  const p = clamp(t / 3.4);
  return (
    <Svg label="Reading one field from JSON text parses the whole document" h={280}>
      <T x={25} y={40} s={14} f={C.latte}>JSON text: to read one field</T>
      <rect x={25} y={54} width={480} height={26} rx={6} fill={C.cocoa} />
      <rect x={25} y={54} width={480 * p} height={26} rx={6} fill={C.cherry} />
      <T x={25} y={106} s={13} f={C.cherryText} o={p}>parse every byte</T>
      <T x={25} y={170} s={14} f={C.latte}>binary variant: to read one field</T>
      <rect x={25} y={184} width={480} height={26} rx={6} fill={C.cocoa} />
      <rect x={25 + 200} y={184} width={26} height={26} rx={6} fill={C.caramel} opacity={easeOut(seg(t, 2.0, 2.6))} />
      <T x={25} y={236} s={13} f={C.caramel} o={easeOut(seg(t, 2.2, 2.9))}>jump to it</T>
    </Svg>
  );
}

// 10 · Shredding.
export function Shredding({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.6, 1.8));
  return (
    <Svg label="Shredding extracts common fields into their own columns with statistics" h={300}>
      <rect x={25} y={40} width={200} height={190} rx={8} fill={C.roast} stroke={C.mocha} />
      <T x={125} y={64} s={13} f={C.latte} a="middle">variant column</T>
      <g transform={`translate(${a * 150} 0)`} opacity={0.5 + 0.5 * a}>
        <rect x={50} y={90} width={150} height={32} rx={6} fill={C.caramel} />
        <T x={125} y={111} s={13} f={C.espresso} a="middle" w={700}>event_ts</T>
      </g>
      <rect x={50} y={140} width={150} height={32} rx={6} fill={C.cocoa} stroke={C.mocha} />
      <T x={125} y={161} s={13} f={C.crema} a="middle">everything else</T>
      <T x={430} y={108} s={13} f={C.caramel} a="middle" o={a}>its own column</T>
      <T x={430} y={134} s={13} f={C.latte} a="middle" o={a}>min / max, pruning</T>
      <T x={300} y={268} s={14} f={C.crema} a="middle" o={easeOut(seg(t, 3.0, 3.8))}>read one field: load one column</T>
    </Svg>
  );
}

// 11 · Verdict.
export function Verdict({ t }: StepCtx) {
  const rows = [['two arrays', 'one unnest, with ordinality'], ['many JSON fields', 'JSON_TABLE'], ['queried constantly', 'real typed columns or shredding']];
  return (
    <Svg label="Three habits for nested data" h={280}>
      {rows.map((r, i) => (
        <g key={r[0]} opacity={easeOut(seg(t, i * 0.6, i * 0.6 + 0.7))}>
          <T x={25} y={60 + i * 76} s={14} f={C.latte}>{r[0]}</T>
          <T x={25} y={92 + i * 76} s={18} f={C.caramel} w={700}>{r[1]}</T>
        </g>
      ))}
    </Svg>
  );
}

export function ProveZip({ t, answer }: StepCtx) {
  const answered = answer !== null;
  return (
    <Svg label="4 tags and 3 discounts into one unnest" h={240}>
      <T x={40} y={84} s={18} f={C.latte}>unnest(4 tags, 3 discounts) →</T>
      {answered ? <T x={40} y={140} s={28} f={C.caramel} w={700}>4 rows</T> : <T x={40} y={150} s={40} f={C.caramel} o={0.75 + 0.25 * Math.sin(t * 3)}>?</T>}
    </Svg>
  );
}
export function ProveVersion({ t, answer }: StepCtx) {
  const answered = answer !== null;
  return (
    <Svg label="The PostgreSQL release that added JSON_TABLE" h={240}>
      <T x={40} y={84} s={18} f={C.latte}>JSON_TABLE arrived in PostgreSQL</T>
      {answered ? <T x={40} y={140} s={28} f={C.caramel} w={700}>17</T> : <T x={40} y={150} s={40} f={C.caramel} o={0.75 + 0.25 * Math.sin(t * 3)}>?</T>}
    </Svg>
  );
}
