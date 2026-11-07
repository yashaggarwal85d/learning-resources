import { useEffect, useState } from 'react';
import type { StepCtx } from '../../../../../reels/types';
import { clamp, easeInOut, easeOut, easeOutBack, lerp, seg } from '../../../../../reels/anim';
import { C, Svg, T } from '../../../../../reels/kit';

// Colour grammar: caramel = the pairing or path that is right, cherryText = the wrong pairing or the costly path,
// crema = data, latte = labels, taupe = structure. Order 42: tags [bogo, winter, vip], discounts [5, 10, 15].

const TAGS = ['bogo', 'winter', 'vip'];
const DISC = ['5', '10', '15'];

function Chip({ x, y, w = 76, label, hi = false, bad = false, o = 1 }: { x: number; y: number; w?: number; label: string; hi?: boolean; bad?: boolean; o?: number }) {
  return (
    <g opacity={o}>
      <rect x={x} y={y} width={w} height={32} rx={8} fill={C.cocoa} stroke={bad ? C.cherryText : hi ? C.caramel : C.mocha} strokeWidth={hi || bad ? 2 : 1} />
      <T x={x + w / 2} y={y + 21} s={13} f={C.crema} a="middle">
        {label}
      </T>
    </g>
  );
}

/** Seconds since the learner answered a predict step (the player's clock has stopped by then), so reveals can animate. */
function useSinceAnswer(on: boolean) {
  const [s, setS] = useState(0);
  useEffect(() => {
    if (!on) {
      setS(0);
      return;
    }
    if (typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) {
      setS(99);
      return;
    }
    let raf = 0;
    const t0 = performance.now();
    const tick = () => {
      const d = (performance.now() - t0) / 1000;
      setS(d);
      if (d < 4) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [on]);
  return s;
}

// 1 · Not flat. Order 42 arrives; its tags slide into their list, then the discounts into theirs, then the metadata
// document types itself out line by line.
export function NotFlat({ t }: StepCtx) {
  const doc1 = '{ "device": "ios",';
  const doc2 = '  "utm": { "source": "email" } }';
  const n1 = Math.floor(seg(t, 1.7, 2.2) * doc1.length);
  const n2 = Math.floor(seg(t, 2.2, 2.9) * doc2.length);
  const c = easeOut(seg(t, 1.6, 1.8));
  return (
    <Svg label="Order 42 has an array of tags, an array of discounts and a JSON document" h={300}>
      <T x={25} y={36} s={14} f={C.latte}>
        order 42
      </T>
      <T x={25} y={76} s={13} f={C.latte} o={easeOut(seg(t, 0.2, 0.4))}>
        tags
      </T>
      {TAGS.map((s, i) => {
        const a = easeOutBack(seg(t, 0.3 + i * 0.15, 0.7 + i * 0.15));
        return <Chip key={s} x={lerp(600, 110 + i * 90, clamp(a))} y={58} label={s} o={clamp(a)} />;
      })}
      <T x={25} y={140} s={13} f={C.latte} o={easeOut(seg(t, 0.9, 1.1))}>
        discounts
      </T>
      {DISC.map((s, i) => {
        const a = easeOutBack(seg(t, 1.0 + i * 0.15, 1.4 + i * 0.15));
        return <Chip key={s} x={lerp(600, 110 + i * 90, clamp(a))} y={122} label={s} o={clamp(a)} w={60} />;
      })}
      <T x={25} y={204} s={13} f={C.latte} o={c}>
        metadata
      </T>
      <rect x={110} y={186} width={300} height={72} rx={8} fill={C.roast} stroke={C.mocha} opacity={c} />
      <T x={124} y={212} s={13} f={C.crema}>
        {doc1.slice(0, n1)}
      </T>
      <T x={124} y={236} s={13} f={C.crema}>
        {doc2.slice(0, n2)}
      </T>
    </Svg>
  );
}

// 2 · Three shapes, each drawn as it is named: an array's equal-typed slots slide in, a struct's labelled fields
// split by a divider, a map's keys point at their values.
export function Shapes({ t }: StepCtx) {
  const k = [0, 1, 2].map((i) => easeOut(seg(t, 0.2 + i * 1.0, 0.6 + i * 1.0)));
  const g = [0, 1, 2].map((i) => easeInOut(seg(t, 0.5 + i * 1.0, 1.1 + i * 1.0)));
  const items = [
    { k: 'array', n: 'ordered, same type' },
    { k: 'struct', n: 'labelled fields' },
    { k: 'map', n: 'JSON plays this part in PostgreSQL' },
  ];
  return (
    <Svg label="Arrays, structs and maps: a list of one type, a bundle of labelled fields, key and value pairs" h={300}>
      {items.map((it, i) => (
        <g key={it.k} opacity={k[i]}>
          <T x={25} y={60 + i * 80} s={18} f={C.caramel} w={700}>
            {it.k}
          </T>
          <T x={150} y={84 + i * 80} s={13} f={C.latte}>
            {it.n}
          </T>
        </g>
      ))}
      {TAGS.map((s, j) => {
        const a = seg(g[0] * 3, j, j + 1);
        return a > 0 ? (
          <g key={s} opacity={a} transform={`translate(${(1 - a) * 30} 0)`}>
            <rect x={150 + j * 78} y={42} width={72} height={24} rx={5} fill={C.cocoa} stroke={C.mocha} />
            <T x={186 + j * 78} y={59} s={13} f={C.crema} a="middle">
              {s}
            </T>
          </g>
        ) : null;
      })}
      <g opacity={k[1]}>
        <rect x={150} y={122} width={220} height={24} rx={5} fill={C.cocoa} stroke={C.mocha} />
        <line x1={260} y1={122} x2={260} y2={122 + 24 * g[1]} stroke={C.latte} strokeWidth={1.5} />
        <T x={160} y={139} s={13} f={C.crema} o={g[1]}>
          city: …
        </T>
        <T x={270} y={139} s={13} f={C.crema} o={g[1]}>
          zip: …
        </T>
      </g>
      {[0, 1].map((j) => (
        <g key={j} opacity={k[2]}>
          <rect x={150 + j * 170} y={202} width={50} height={24} rx={5} fill={C.cocoa} stroke={C.mocha} />
          <T x={175 + j * 170} y={219} s={13} f={C.crema} a="middle">
            key
          </T>
          <line x1={200 + j * 170} y1={214} x2={200 + j * 170 + 40 * g[2]} y2={214} stroke={C.caramel} strokeWidth={2} />
          <rect x={244 + j * 170} y={202} width={60} height={24} rx={5} fill="none" stroke={C.caramel} opacity={g[2]} />
          <T x={274 + j * 170} y={219} s={13} f={C.caramel} a="middle" o={g[2]}>
            value
          </T>
        </g>
      ))}
    </Svg>
  );
}

// 3 · One unnest.
export function OneUnnest({ t }: StepCtx) {
  return (
    <Svg label="unnest expands one array of 3 tags into 3 rows" h={300}>
      <T x={25} y={36} s={14} f={C.latte}>
        unnest(tags)
      </T>
      {TAGS.map((s, i) => (
        <Chip key={s} x={25 + i * 90} y={50} label={s} o={0.6} />
      ))}
      {TAGS.map((s, i) => {
        const a = easeOut(seg(t, 0.6 + i * 0.5, 1.2 + i * 0.5));
        return (
          <g key={s} transform={`translate(0 ${(1 - a) * -30})`} opacity={clamp(a)}>
            <Chip x={25} y={120 + i * 46} w={120} label={s} hi />
          </g>
        );
      })}
      <T x={200} y={142} s={14} f={C.latte} o={easeOut(seg(t, 2.4, 3.0))}>
        3 rows, in storage order
      </T>
    </Svg>
  );
}

// 4 · Predict: product. Before the answer the tags and discounts wait in two columns. After it the nine pairings draw
// one by one, the count climbing; the three right ones are thick and white, the six wrong ones red.
export function ProductPredict({ t, answer }: StepCtx) {
  const answered = answer !== null;
  const s = useSinceAnswer(answered);
  const n = answered ? Math.min(9, Math.floor(seg(s, 0.1, 1.9) * 9 + 0.0001)) : 0;
  return (
    <Svg label="Two unnest calls in FROM pair every tag with every discount: nine pairs, three of them right" h={340}>
      {TAGS.map((tg, i) => (
        <Chip key={tg} x={25} y={50 + i * 84} w={76} label={tg} />
      ))}
      {DISC.map((d, i) => (
        <Chip key={d} x={270} y={50 + i * 84} w={60} label={d} />
      ))}
      {answered &&
        TAGS.flatMap((_, i) =>
          DISC.map((__, j) => {
            const idx = i * 3 + j;
            const k = easeOut(seg(s, 0.1 + idx * 0.2, 0.3 + idx * 0.2));
            if (k <= 0) return null;
            const right = i === j;
            return (
              <line
                key={`${i}-${j}`}
                x1={101}
                y1={66 + i * 84}
                x2={lerp(101, 270, k)}
                y2={lerp(66 + i * 84, 66 + j * 84, k)}
                stroke={right ? C.caramel : C.cherryText}
                strokeWidth={right ? 3 : 1.5}
                opacity={right ? 1 : 0.7}
              />
            );
          }),
        )}
      {!answered && (
        <T x={440} y={160} s={52} f={C.caramel} a="middle" o={0.75 + 0.25 * Math.sin(t * 3)}>
          ?
        </T>
      )}
      {answered && (
        <T x={450} y={160} s={22} f={C.cherryText} a="middle" w={700}>
          {n} {n === 1 ? 'pair' : 'pairs'}
        </T>
      )}
      <T x={450} y={196} s={13} f={C.latte} a="middle" o={answered ? easeOut(seg(s, 2.0, 2.4)) : 0}>
        only 3 are right
      </T>
    </Svg>
  );
}

// 5 · Zip. Each discount slides in from the right to meet the tag in its own slot, and a link draws between them:
// three rows. Then the second case: four tags, and the fourth finds no partner, so a dashed NULL drops in beside it.
export function Zip({ t }: StepCtx) {
  const b = easeOut(seg(t, 2.4, 2.8));
  const nul = easeOutBack(seg(t, 3.2, 3.6));
  return (
    <Svg label="One multi-argument unnest pairs by position; a shorter array is padded with NULLs" h={340}>
      {TAGS.map((s, i) => {
        const m = easeInOut(seg(t, 0.3 + i * 0.4, 0.8 + i * 0.4));
        return (
          <g key={s}>
            <Chip x={25} y={30 + i * 44} w={76} label={s} hi />
            <line x1={101} y1={46 + i * 44} x2={101 + 89 * m} y2={46 + i * 44} stroke={C.caramel} strokeWidth={3} />
            <Chip x={lerp(420, 190, m)} y={30 + i * 44} w={60} label={DISC[i]} hi o={easeOut(seg(t, 0.2 + i * 0.4, 0.4 + i * 0.4))} />
          </g>
        );
      })}
      <T x={300} y={52} s={14} f={C.caramel} o={easeOut(seg(t, 1.6, 1.9))}>
        3 rows
      </T>
      <g opacity={b}>
        {['bogo', 'winter', 'vip', 'new'].map((s, i) => (
          <g key={s}>
            <Chip x={25} y={180 + i * 36} w={76} label={s} />
            {i < 3 && <Chip x={190} y={180 + i * 36} w={60} label={DISC[i]} />}
          </g>
        ))}
        {nul > 0 && <rect x={190} y={180 + 3 * 36 - (1 - clamp(nul)) * 20} width={60} height={32} rx={8} fill="none" stroke={C.latte} strokeDasharray="5 4" opacity={clamp(nul)} />}
        <T x={290} y={232} s={14} f={C.latte}>
          4 tags, 3 discounts: 4 rows,
        </T>
        <T x={290} y={256} s={14} f={C.latte} o={clamp(nul)}>
          last discount NULL
        </T>
      </g>
    </Svg>
  );
}

// 6 · Ordinality. Each row gets its position badge, 1, 2, 3. Then the rows shuffle (no row order is promised) and
// the badges travel with their rows, so the position survives.
export function Ordinality({ t }: StepCtx) {
  const sh = easeInOut(seg(t, 2.2, 3.0));
  const order = [2, 0, 1];
  return (
    <Svg label="WITH ORDINALITY adds the position of each element, which stays with its row even when row order changes" h={280}>
      <T x={300} y={44} s={13} f={C.latte}>
        position
      </T>
      {TAGS.map((s, i) => {
        const a = easeOut(seg(t, 0.2 + i * 0.4, 0.6 + i * 0.4));
        const b = easeOutBack(seg(t, 0.6 + i * 0.4, 1.0 + i * 0.4));
        const y = lerp(60 + i * 56, 60 + order[i] * 56, sh);
        const dx = 300 * Math.sin(Math.PI * sh) * (i === 0 ? 1 : 0);
        return (
          <g key={s} opacity={a} transform={`translate(${dx} 0)`}>
            <Chip x={25} y={y} w={90} label={s} />
            <Chip x={140} y={y} w={60} label={DISC[i]} />
            {b > 0 && (
              <g opacity={clamp(b)} transform={`translate(0 ${(1 - clamp(b)) * -14})`}>
                <rect x={225} y={y} width={48} height={32} rx={8} fill={C.caramel} />
                <T x={249} y={y + 21} s={14} f={C.espresso} a="middle" w={700}>
                  {String(i + 1)}
                </T>
              </g>
            )}
          </g>
        );
      })}
      <T x={25} y={250} s={13} f={C.latte} o={easeOut(seg(t, 2.8, 3.2))}>
        rows reorder; the position stays
      </T>
    </Svg>
  );
}

// 7 · Arrows. The document sits at the top with its nested utm object. Each expression arrives in turn and a ring
// moves to what it returns: the whole document, then the utm object (still JSON), then the string email (text).
export function Arrows({ t }: StepCtx) {
  const steps = [
    { e: 'metadata', r: 'document' },
    { e: "metadata -> 'utm'", r: 'json' },
    { e: "metadata -> 'utm' ->> 'source'", r: 'text' },
  ];
  const ph = [easeOut(seg(t, 0.3, 0.7)), easeOut(seg(t, 1.3, 1.7)), easeOut(seg(t, 2.3, 2.7))];
  const cur = ph[2] > 0 ? 2 : ph[1] > 0 ? 1 : 0;
  const rings = [
    { x: 21, y: 20, w: 368, h: 104 },
    { x: 36, y: 60, w: 300, h: 50 },
    { x: 192, y: 70, w: 70, h: 30 },
  ];
  const r = rings[cur];
  const k = ph[cur];
  return (
    <Svg label="Arrow operators drill into JSON: the single arrow keeps JSON, the double arrow returns text and ends the chain" h={300}>
      <rect x={25} y={24} width={360} height={96} rx={8} fill={C.roast} stroke={C.mocha} />
      <T x={40} y={48} s={13} f={C.crema}>
        {'{ "device": "ios",'}
      </T>
      <rect x={40} y={64} width={292} height={42} rx={6} fill="none" stroke={C.mocha} strokeDasharray="4 3" />
      <T x={50} y={90} s={13} f={C.crema}>
        {'"utm": { "source": "email" } }'}
      </T>
      {k > 0 && <rect x={r.x} y={r.y} width={r.w} height={r.h} rx={8} fill="none" stroke={C.caramel} strokeWidth={2.5} opacity={k} />}
      {steps.map((st, i) => (
        <g key={st.e} opacity={ph[i]}>
          <T x={25} y={170 + i * 40} s={14} f={i === cur ? C.crema : C.latte}>
            {st.e}
          </T>
          <T x={575} y={170 + i * 40} s={14} f={i === 2 ? C.caramel : C.latte} a="end" w={600}>
            {st.r}
          </T>
        </g>
      ))}
    </Svg>
  );
}

// 8 · JSON_TABLE. COLUMNS draws an arrow, and the values ios and email fly out of the document into typed cells; then
// a link draws from the new row back to order 42's row: it is joined laterally to the row that held the JSON.
export function JsonTable({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.3, 0.8));
  const fly = easeInOut(seg(t, 0.9, 1.9));
  const lat = easeInOut(seg(t, 2.2, 2.9));
  return (
    <Svg label="JSON_TABLE turns a document into rows with typed columns, joined laterally to the row that held it" h={300}>
      <rect x={25} y={40} width={200} height={110} rx={8} fill={C.roast} stroke={C.mocha} />
      <T x={40} y={72} s={13} f={C.crema}>
        {'{ "device": "ios",'}
      </T>
      <T x={40} y={96} s={13} f={C.crema}>
        {'  "utm": { … } }'}
      </T>
      <line x1={225} y1={95} x2={225 + 85 * a} y2={95} stroke={C.caramel} strokeWidth={3} />
      <T x={268} y={84} s={13} f={C.caramel} a="middle" o={a}>
        COLUMNS
      </T>
      <g opacity={a}>
        <T x={320} y={58} s={13} f={C.latte}>
          device
        </T>
        <T x={430} y={58} s={13} f={C.latte}>
          source
        </T>
        <rect x={320} y={68} width={100} height={30} rx={6} fill={C.cocoa} stroke={C.mocha} />
        <rect x={430} y={68} width={100} height={30} rx={6} fill={C.cocoa} stroke={C.mocha} />
      </g>
      {fly > 0 && fly < 1 && (
        <>
          <rect x={lerp(140, 350, fly)} y={lerp(62, 74, fly) - 40 * Math.sin(Math.PI * fly)} width={40} height={18} rx={4} fill={C.caramel} />
          <rect x={lerp(110, 460, fly)} y={lerp(86, 74, fly) - 50 * Math.sin(Math.PI * fly)} width={40} height={18} rx={4} fill={C.caramel} />
        </>
      )}
      {fly >= 1 && (
        <>
          <T x={370} y={88} s={13} f={C.caramel} a="middle">
            ios
          </T>
          <T x={480} y={88} s={13} f={C.caramel} a="middle">
            email
          </T>
        </>
      )}
      <g opacity={easeOut(seg(t, 2.0, 2.3))}>
        <rect x={25} y={170} width={120} height={30} rx={6} fill={C.cocoa} stroke={C.mocha} />
        <T x={85} y={190} s={13} f={C.crema} a="middle">
          order 42
        </T>
      </g>
      {lat > 0 && (
        <path d={`M 145 185 L ${lerp(145, 420, lat)} 185 L ${lerp(145, 420, lat)} ${lerp(185, 100, seg(lat, 0.6, 1))}`} fill="none" stroke={C.cinnamon} strokeWidth={2} strokeDasharray="5 4" />
      )}
      <T x={25} y={240} s={14} f={C.caramel} o={easeOut(seg(t, 2.8, 3.2))}>
        joined laterally to the row that held it
      </T>
      <T x={25} y={268} s={13} f={C.latte} o={easeOut(seg(t, 3.2, 3.6))}>
        PostgreSQL 17 and later
      </T>
    </Svg>
  );
}

// 9 · Text cost.
export function TextCost({ t }: StepCtx) {
  const p = clamp(t / 3.4);
  return (
    <Svg label="Reading one field from JSON text parses the whole document" h={280}>
      <T x={25} y={40} s={14} f={C.latte}>
        JSON text: to read one field
      </T>
      <rect x={25} y={54} width={480} height={26} rx={6} fill={C.cocoa} />
      <rect x={25} y={54} width={480 * p} height={26} rx={6} fill={C.cherry} />
      <T x={25} y={106} s={13} f={C.cherryText} o={p}>
        parse every byte
      </T>
      <T x={25} y={170} s={14} f={C.latte}>
        binary variant: to read one field
      </T>
      <rect x={25} y={184} width={480} height={26} rx={6} fill={C.cocoa} />
      <rect x={25 + 200} y={184} width={26} height={26} rx={6} fill={C.caramel} opacity={easeOut(seg(t, 2.0, 2.6))} />
      <T x={25} y={236} s={13} f={C.caramel} o={easeOut(seg(t, 2.2, 2.9))}>
        jump to it
      </T>
    </Svg>
  );
}

// 10 · Shredding.
export function Shredding({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.6, 1.8));
  return (
    <Svg label="Shredding extracts common fields into their own columns with statistics" h={300}>
      <rect x={25} y={40} width={200} height={190} rx={8} fill={C.roast} stroke={C.mocha} />
      <T x={125} y={64} s={13} f={C.latte} a="middle">
        variant column
      </T>
      <g transform={`translate(${a * 150} 0)`} opacity={0.5 + 0.5 * a}>
        <rect x={50} y={90} width={150} height={32} rx={6} fill={C.caramel} />
        <T x={125} y={111} s={13} f={C.espresso} a="middle" w={700}>
          event_ts
        </T>
      </g>
      <rect x={50} y={140} width={150} height={32} rx={6} fill={C.cocoa} stroke={C.mocha} />
      <T x={125} y={161} s={13} f={C.crema} a="middle">
        everything else
      </T>
      <T x={430} y={108} s={13} f={C.caramel} a="middle" o={a}>
        its own column
      </T>
      <T x={430} y={134} s={13} f={C.latte} a="middle" o={a}>
        min / max, pruning
      </T>
      <T x={300} y={268} s={14} f={C.crema} a="middle" o={easeOut(seg(t, 3.0, 3.8))}>
        read one field: load one column
      </T>
    </Svg>
  );
}

// 11 · Verdict with underlines and ticks; then the two prove-it checks.
export function Verdict({ t }: StepCtx) {
  const rows = [
    ['two arrays', 'one unnest, with ordinality', 360],
    ['many JSON fields', 'JSON_TABLE', 130],
    ['queried constantly', 'real typed columns or shredding', 420],
  ] as const;
  return (
    <Svg label="Three habits for nested data" h={280}>
      {rows.map((r, i) => {
        const a = easeOut(seg(t, 0.1 + i * 0.6, 0.6 + i * 0.6));
        const u = easeInOut(seg(t, 0.5 + i * 0.6, 1.0 + i * 0.6));
        const y = 50 + i * 80;
        return (
          <g key={r[0]} opacity={clamp(a)} transform={`translate(${(1 - a) * -20} 0)`}>
            <T x={25} y={y} s={14} f={C.latte}>
              {r[0]}
            </T>
            <T x={25} y={y + 30} s={18} f={C.caramel} w={700}>
              {r[1]}
            </T>
            <rect x={25} y={y + 40} width={r[2] * u} height={3} rx={1.5} fill={C.caramel} />
            {u >= 1 && <path d={`M 545 ${y + 20} l 6 6 l 12 -14`} fill="none" stroke={C.caramel} strokeWidth={2.5} />}
          </g>
        );
      })}
    </Svg>
  );
}

/** Prove it 1: four tags zip with three discounts; the fourth gets a dashed NULL; four rows. */
export function ProveZip({ t, answer }: StepCtx) {
  const answered = answer !== null;
  const s = useSinceAnswer(answered);
  return (
    <Svg label="4 tags and 3 discounts into one unnest give 4 rows" h={240}>
      <T x={40} y={50} s={18} f={C.latte}>
        unnest(4 tags, 3 discounts) →
      </T>
      {answered ? (
        <>
          {[0, 1, 2, 3].map((i) => {
            const k = easeOutBack(seg(s, 0.1 + i * 0.2, 0.4 + i * 0.2));
            return k > 0 ? (
              <g key={i} opacity={clamp(k)} transform={`translate(${40 + i * 90} ${80 + (1 - clamp(k)) * -12})`}>
                <rect width={80} height={26} rx={5} fill={C.cocoa} stroke={C.caramel} />
                <rect y={32} width={80} height={26} rx={5} fill={i < 3 ? C.cocoa : 'none'} stroke={i < 3 ? C.mocha : C.latte} strokeDasharray={i < 3 ? undefined : '4 3'} />
              </g>
            ) : null;
          })}
          <T x={420} y={112} s={28} f={C.caramel} w={700} o={easeOut(seg(s, 1.0, 1.3))}>
            4 rows
          </T>
        </>
      ) : (
        <T x={40} y={130} s={40} f={C.caramel} o={0.75 + 0.25 * Math.sin(t * 3)}>
          ?
        </T>
      )}
    </Svg>
  );
}
/** Prove it 2: a release ruler 14 to 18; after the answer the marker slides to 17. */
export function ProveVersion({ t, answer }: StepCtx) {
  const answered = answer !== null;
  const s = useSinceAnswer(answered);
  const m = answered ? easeInOut(seg(s, 0.1, 0.9)) : 0;
  const X = (v: number) => 60 + (v - 14) * 110;
  return (
    <Svg label="The PostgreSQL release that added JSON_TABLE: 17" h={240}>
      <T x={40} y={50} s={18} f={C.latte}>
        JSON_TABLE arrived in PostgreSQL
      </T>
      <line x1={X(14)} y1={130} x2={X(18)} y2={130} stroke={C.mocha} strokeWidth={2} />
      {[14, 15, 16, 17, 18].map((v) => (
        <g key={v}>
          <line x1={X(v)} y1={122} x2={X(v)} y2={138} stroke={C.mocha} strokeWidth={2} />
          <T x={X(v)} y={162} s={14} f={answered && v === 17 && m >= 1 ? C.caramel : C.latte} a="middle" w={answered && v === 17 ? 700 : 400}>
            {v}
          </T>
        </g>
      ))}
      {answered ? (
        <circle cx={lerp(X(14), X(17), m)} cy={130} r={9} fill={C.caramel} />
      ) : (
        <T x={X(16)} y={108} s={36} f={C.caramel} a="middle" o={0.75 + 0.25 * Math.sin(t * 3)}>
          ?
        </T>
      )}
      <T x={40} y={210} s={14} f={C.latte} o={answered ? easeOut(seg(s, 0.9, 1.3)) : 0}>
        September 2024; earlier: arrows and path functions
      </T>
    </Svg>
  );
}
