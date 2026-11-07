import { useEffect, useState } from 'react';
import type { StepCtx } from '../../../../../reels/types';
import { clamp, easeInOut, easeOut, easeOutBack, lerp, seg } from '../../../../../reels/anim';
import { C, Draw, Svg, T } from '../../../../../reels/kit';

// Colour grammar (CHAPTER.md): crema = stored bytes (keys, tuples); taupe = empty space; caramel = the
// thing to look at (the bytes kept, the page being written, the pass that runs); cinnamon = the compared
// alternative (the full key, one-at-a-time insert); cherryText = the waste or the wrong order. Byte sizes
// follow examples.py's composite key (an 8-byte integer, then "row", then "payload"); every printed
// number is printed by examples.py.

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

/** A composite key drawn to byte scale: int (8 B), "row" (3 B), "payload" (7 B). */
const SEG = [
  { name: 'int', b: 8 },
  { name: 'row', b: 3 },
  { name: 'payload', b: 7 },
];
const BX = 12; // units per byte

function KeyBar({ x, y, upto = 3, f = C.crema, o = 1, dimFrom = 9, h = 22, labels = false }: { x: number; y: number; upto?: number; f?: string; o?: number; dimFrom?: number; h?: number; labels?: boolean }) {
  let cx = x;
  return (
    <g opacity={o}>
      {SEG.slice(0, upto).map((sg, i) => {
        const w = sg.b * BX;
        const el = (
          <g key={i} opacity={i >= dimFrom ? 0.25 : 1}>
            <rect x={cx} y={y} width={w - 2} height={h} rx={2} fill={i === 0 ? f : C.mocha} stroke={i === 0 ? f : C.taupe} strokeWidth={1} />
            {labels && <T x={cx + (w - 2) / 2} y={y + h / 2 + 4} s={12} f={i === 0 ? C.espresso : C.crema} a="middle">{sg.name}</T>}
          </g>
        );
        cx += w;
        return el;
      })}
    </g>
  );
}

function Check({ x, y, t, at, f = C.caramel }: { x: number; y: number; t: number; at: number; f?: string }) {
  return <Draw pts={[[x - 6, y], [x - 2, y + 5], [x + 7, y - 6]]} t={t} from={at} to={at + 0.25} stroke={f} w={2} pen={false} />;
}

// 1 · Bytes spent well or not. Two pages of the same size fill with routing entries: on the left each entry
// is the full composite key, so only a few fit; on the right each keeps just its 8-byte integer, so more than
// twice as many fit. Same page, same formula, a very different fanout.
export function Opening({ t }: StepCtx) {
  const full = 81, short = 36;
  const nL = Math.floor(clamp(seg(t, 0.4, 2.0)) * 3 + 1e-9);
  const nR = Math.floor(clamp(seg(t, 0.4, 2.0)) * 7 + 1e-9);
  return (
    <Svg label="Two equal pages: filled with full keys only a few routing entries fit, filled with just the distinguishing bytes more than twice as many fit" h={300}>
      <T x={30} y={30} s={13} f={C.cinnamon}>spent carelessly</T>
      <T x={316} y={30} s={13} f={C.caramel}>spent well</T>
      {[30, 316].map((x, side) => (
        <rect key={side} x={x} y={44} width={254} height={40} rx={4} fill={C.roast} stroke={side ? C.caramel : C.cinnamon} strokeWidth={1.6} />
      ))}
      {Array.from({ length: nL }, (_, i) => (
        <g key={i}>
          <rect x={36 + i * (full + 6)} y={50} width={full * (8 / 18)} height={28} rx={2} fill={C.cinnamon} />
          <rect x={36 + i * (full + 6) + full * (8 / 18)} y={50} width={full * (10 / 18)} height={28} rx={2} fill={C.mocha} stroke={C.cherryText} strokeWidth={1} />
        </g>
      ))}
      {Array.from({ length: nR }, (_, i) => <rect key={i} x={322 + i * (short + 6)} y={50} width={short} height={28} rx={2} fill={C.caramel} />)}
      <T x={30} y={112} s={13} f={C.cherryText} o={easeOut(seg(t, 2.0, 2.3))}>bytes no route ever reads</T>
      <g opacity={easeOut(seg(t, 2.3, 2.7))}>
        {[[157, 3], [443, 7]].map(([cx, n], i) => (
          <g key={i}>
            <line x1={cx} y1={150} x2={cx} y2={170} stroke={C.mocha} strokeWidth={1.2} />
            {Array.from({ length: n + 1 }, (_, j) => {
              const x = cx - 110 + (220 * j) / n;
              return <line key={j} x1={cx} y1={170} x2={x} y2={210} stroke={i ? C.caramel : C.cinnamon} strokeWidth={1.2} />;
            })}
            <rect x={cx - 20} y={136} width={40} height={14} rx={3} fill="none" stroke={i ? C.caramel : C.cinnamon} strokeWidth={1.4} />
          </g>
        ))}
      </g>
      <T x={30} y={260} s={13} f={C.crema} o={easeOut(seg(t, 2.8, 3.2))}>the same fanout formula, a very different fanout</T>
    </Svg>
  );
}

// 2 · The slotted page. A header on the left; a slot array of fixed-size offsets grows rightward after it;
// variable-length tuples grow leftward from the far end; free space sits between. Four inserts land: each
// tuple takes the free end, each slot points at it. A fifth key belongs mid-order: only its small slot is
// placed in order; no tuple moves.
export function SlottedLayout({ t }: StepCtx) {
  const TW = [60, 34, 70, 44];
  const tupleX = (i: number) => 568 - TW.slice(0, i + 1).reduce((a, b) => a + b + 4, 0);
  const at = (i: number) => 0.4 + i * 0.45;
  const fifth = easeInOut(seg(t, 2.4, 3.0));
  // slot order: the fifth tuple (index 4) sorts between slots 1 and 2
  const slotX = (i: number) => {
    const order = [0, 1, 4, 2, 3];
    const pos = order.indexOf(i);
    const before = pos >= 3 ? lerp(pos - 1, pos, fifth) : pos;
    return 104 + before * 30;
  };
  const tx5 = tupleX(3) - 64;
  return (
    <Svg label="A slotted page: a header, an array of fixed-size slots growing from one end, and variable-length tuples growing from the other; a new tuple never shifts an existing one" h={300}>
      <rect x={30} y={70} width={540} height={80} rx={4} fill={C.roast} stroke={C.crema} strokeWidth={1.6} />
      <rect x={34} y={74} width={62} height={72} rx={3} fill={C.cocoa} stroke={C.latte} strokeWidth={1.2} />
      <T x={65} y={114} s={12} f={C.latte} a="middle">header</T>
      <T x={104} y={56} s={13} f={C.crema}>slots &rarr;</T>
      <T x={566} y={56} s={13} f={C.crema} a="end">&larr; tuples</T>
      {TW.map((w, i) => {
        const o = easeOut(seg(t, at(i), at(i) + 0.3));
        const sx = slotX(i);
        return (
          <g key={i} opacity={o}>
            <rect x={tupleX(i)} y={96} width={w} height={44} rx={3} fill={C.mocha} stroke={C.crema} strokeWidth={1.2} />
            <rect x={sx} y={78} width={24} height={14} rx={2} fill={C.crema} />
            <path d={`M ${sx + 12} 92 Q ${sx + 12} ${168} ${tupleX(i) + w / 2} 140`} fill="none" stroke={C.latte} strokeWidth={1} strokeDasharray="2 3" />
          </g>
        );
      })}
      <g opacity={easeOut(seg(t, 2.4, 2.7))}>
        <rect x={tx5} y={96} width={60} height={44} rx={3} fill={C.mocha} stroke={C.caramel} strokeWidth={1.8} />
        <rect x={slotX(4)} y={78} width={24} height={14} rx={2} fill={C.caramel} />
        <path d={`M ${slotX(4) + 12} 92 Q ${slotX(4) + 12} 178 ${tx5 + 30} 140`} fill="none" stroke={C.caramel} strokeWidth={1.4} strokeDasharray="2 3" />
      </g>
      <T x={296} y={124} s={12} f={C.taupe} a="middle" o={1 - easeOut(seg(t, 2.4, 2.7))}>free space</T>
      <T x={30} y={200} s={13} f={C.caramel} o={easeOut(seg(t, 2.9, 3.2))}>a key sorting mid-page: only its slot goes in order</T>
      <T x={30} y={240} s={13} f={C.crema} o={easeOut(seg(t, 3.2, 3.6))}>no tuple ever shifts; a slot just points to it</T>
    </Svg>
  );
}

// 3 · Predict: what goes up after a split? Left leaf's last key and right leaf's first key, each a three-part
// composite key drawn to byte scale; the new routing slot above waits, empty. After the answer only the first
// part (the part where they differ) rises; the rest dims.
export function PrefixSuffixPredict({ t, answer }: StepCtx) {
  const answered = answer !== null;
  const s = useSinceAnswer(answered);
  const up = answered ? easeInOut(seg(s, 0.4, 1.1)) : 0;
  const pulse = 0.6 + 0.4 * Math.sin(t * 4);
  return (
    <Svg label="After a leaf split, the routing entry above needs only the bytes that tell the last key on the left from the first key on the right" h={300}>
      <T x={30} y={24} s={13} f={C.latte}>a leaf just split; the routing entry above waits</T>
      <rect x={220} y={44} width={170} height={34} rx={4} fill={C.roast} stroke={answered ? C.caramel : C.latte} strokeWidth={1.6} strokeDasharray={answered ? undefined : '4 3'} opacity={answered ? 1 : pulse} />
      <T x={30} y={190} s={13} f={C.latte}>left&apos;s last key</T>
      <KeyBar x={30} y={146} labels f={C.cinnamon} dimFrom={answered ? 1 : 9} />
      <T x={320} y={190} s={13} f={C.latte}>right&apos;s first key</T>
      <KeyBar x={320} y={146} labels f={C.caramel} dimFrom={answered ? 1 : 9} />
      {answered && <rect x={lerp(320, 226, up)} y={lerp(146, 50, up)} width={8 * BX - 2} height={22} rx={2} fill={C.caramel} />}
      {!answered && <T x={30} y={270} s={15} f={C.caramel} o={0.7 + 0.3 * Math.sin(t * 3)}>what gets copied up?</T>}
      {answered && <T x={30} y={246} s={13} f={C.caramel} o={easeOut(seg(s, 1.1, 1.5))}>only the bytes that still tell them apart</T>}
      {answered && <T x={30} y={270} s={13} f={C.latte} o={easeOut(seg(s, 1.4, 1.8))}>the rest is dropped, for free</T>}
    </Svg>
  );
}

// 4 · Suffix truncation, step by step. The two keys are compared part by part: the integer already differs,
// so a cut lands right after it; the trailing parts fall away and the 8-byte prefix rises into the routing
// entry. Below, the leaf keeps its full 18-byte key: a leaf answers "is this exactly the key?".
export function PrefixSuffixReveal({ t }: StepCtx) {
  const cmp = easeOut(seg(t, 0.3, 0.8));
  const cut = easeInOut(seg(t, 0.9, 1.3));
  const fall = easeInOut(seg(t, 1.4, 2.0));
  const up = easeInOut(seg(t, 2.0, 2.6));
  const leaf = easeOut(seg(t, 2.8, 3.2));
  const bars = easeInOut(seg(t, 3.3, 3.9));
  const cutX = 160 + 8 * BX - 1;
  return (
    <Svg label="Comparing the two keys part by part: the first part already differs, so everything after it is cut and only the 8-byte prefix becomes the routing entry; the leaf keeps the full 18-byte key" h={320}>
      <T x={30} y={24} s={13} f={C.caramel}>routing entry: what distinguishes</T>
      <rect x={376} y={10} width={190} height={34} rx={4} fill={C.roast} stroke={C.caramel} strokeWidth={1.6} />
      <KeyBar x={160} y={78} labels f={C.cinnamon} />
      <g transform={`translate(0 ${fall * 40})`} opacity={1}>
        <KeyBar x={160} y={110} labels f={C.caramel} dimFrom={fall > 0 ? 1 : 9} />
      </g>
      {up < 1 && <rect x={lerp(160, 382, up)} y={lerp(110, 16, up)} width={8 * BX - 2} height={22} rx={2} fill={C.caramel} opacity={fall > 0 ? 1 : 0} />}
      {up >= 1 && <rect x={382} y={16} width={8 * BX - 2} height={22} rx={2} fill={C.caramel} />}
      <T x={30} y={94} s={12} f={C.latte}>left&apos;s last</T>
      <T x={30} y={126} s={12} f={C.latte}>right&apos;s first</T>
      <T x={160 + 4 * BX} y={150 + fall * 40} s={13} f={C.cherryText} a="middle" o={cmp * (1 - fall)}>&ne;</T>
      <line x1={cutX + 2} y1={70} x2={cutX + 2} y2={lerp(70, 140, cut)} stroke={C.caramel} strokeWidth={2} strokeDasharray="4 3" opacity={cut > 0 ? 1 - fall * 0.6 : 0} />
      <g opacity={leaf}>
        <T x={30} y={214} s={13} f={C.crema}>the leaf keeps it all: exact match</T>
        <KeyBar x={30} y={224} labels f={C.crema} />
      </g>
      <g opacity={bars > 0 ? 1 : 0}>
        <rect x={30} y={268} width={18 * BX * 1.4 * bars} height={12} rx={2} fill={C.cinnamon} />
        <T x={30 + 18 * BX * 1.4 + 8} y={279} s={13} f={C.cinnamon} o={bars}>full key</T>
        <rect x={30} y={290} width={8 * BX * 1.4 * bars} height={12} rx={2} fill={C.caramel} />
        <T x={30 + 8 * BX * 1.4 + 8} y={301} s={13} f={C.caramel} o={bars}>pivot</T>
      </g>
    </Svg>
  );
}

// 5 · Key normalization. Two signed integers as bytes: a negative one starts with a 1 bit, so a plain byte
// compare sorts it after the positive one (red, wrong). Flip the sign bit and the bytes compare in the right
// order; reorder bytes big-endian and one memcmp works for every type.
export function KeyNormalization({ t }: StepCtx) {
  const neg = '11111110'.split('');
  const pos = '00000011'.split('');
  const flip = easeInOut(seg(t, 1.5, 2.1));
  const wrong = easeOut(seg(t, 0.7, 1.0));
  const right = easeOut(seg(t, 2.2, 2.5));
  const swap = easeInOut(seg(t, 2.7, 3.3));
  const bit = (b: string, i: number, x: number, y: number, hot: boolean) => {
    const v = i === 0 ? (flip >= 0.5 ? (b === '1' ? '0' : '1') : b) : b;
    return (
      <g key={i}>
        <rect x={x + i * 26} y={y} width={22} height={26} rx={2} fill={hot && i === 0 ? C.cocoa : C.roast} stroke={hot && i === 0 && flip > 0 ? C.caramel : C.mocha} strokeWidth={hot && i === 0 && flip > 0 ? 2 : 1} />
        <T x={x + i * 26 + 11} y={y + 18} s={13} f={i === 0 ? C.caramel : C.crema} a="middle">{v}</T>
      </g>
    );
  };
  return (
    <Svg label="A negative integer's leading 1 bit makes plain byte comparison put it after a positive one; flipping the sign bit fixes the order, and big-endian byte order makes one byte compare work for every type" h={320}>
      <T x={30} y={24} s={13} f={C.latte}>typed compare: parse the type, then compare</T>
      <T x={30} y={60} s={13} f={C.latte}>negative</T>
      {neg.map((b, i) => bit(b, i, 130, 42, true))}
      <T x={30} y={100} s={13} f={C.latte}>positive</T>
      {pos.map((b, i) => bit(b, i, 130, 82, true))}
      <T x={360} y={70} s={13} f={C.cherryText} o={wrong * (1 - right)}>bytes say: negative</T>
      <T x={360} y={90} s={13} f={C.cherryText} o={wrong * (1 - right)}>sorts last. wrong.</T>
      <T x={360} y={70} s={13} f={C.caramel} o={right}>flip the sign bit:</T>
      <T x={360} y={90} s={13} f={C.caramel} o={right}>order now right</T>
      <Check x={520} y={86} t={t} at={2.4} />
      <T x={30} y={150} s={13} f={C.crema} o={easeOut(seg(t, 2.6, 2.9))}>then most significant byte first</T>
      {['lo', 'hi'].map((l, i) => {
        const x = 130 + lerp(i, 1 - i, swap) * 96;
        const dy = (i ? -1 : 1) * Math.sin(Math.PI * swap) * 20;
        return (
          <g key={l} opacity={easeOut(seg(t, 2.6, 2.9))} transform={`translate(0 ${dy})`}>
            <rect x={x} y={164} width={80} height={26} rx={3} fill={C.roast} stroke={l === 'hi' ? C.caramel : C.crema} strokeWidth={1.4} />
            <T x={x + 40} y={182} s={12} f={l === 'hi' ? C.caramel : C.crema} a="middle">{l} byte</T>
          </g>
        );
      })}
      <T x={30} y={240} s={13} f={C.caramel} o={easeOut(seg(t, 3.3, 3.7))}>one plain byte compare, whatever the type</T>
    </Svg>
  );
}

// 6 · Predict: a sorted load. A long row of keys, already in order, waits above an empty area. After the answer
// they drop into leaf pages three at a time, left to right, and a parent page starts above them.
export function BulkLoadPredict({ t, answer }: StepCtx) {
  const answered = answer !== null;
  const s = useSinceAnswer(answered);
  const N = 18;
  const fillU = answered ? clamp(seg(s, 0.2, 1.6)) : 0;
  return (
    <Svg label="A million already-sorted keys need to become a B+Tree; after answering, they fill leaf pages directly from left to right" h={300}>
      <T x={30} y={24} s={13} f={C.latte}>already sorted: nothing left to discover</T>
      {Array.from({ length: N }, (_, i) => {
        const leaf = Math.floor(i / 3), j = i % 3;
        const k = clamp(fillU * N - i);
        const from: [number, number] = [36 + i * 30, 46];
        const to: [number, number] = [34 + leaf * 92 + 6 + j * 22, 180];
        return <rect key={i} x={lerp(from[0], to[0], easeInOut(k))} y={lerp(from[1], to[1], easeInOut(k))} width={14} height={12} rx={2} fill={k >= 1 ? C.caramel : C.crema} />;
      })}
      {answered && Array.from({ length: 6 }, (_, l) => <rect key={l} x={34 + l * 92} y={172} width={72} height={28} rx={4} fill="none" stroke={C.caramel} strokeWidth={1.4} opacity={clamp(fillU * 6 - l + 0.5)} />)}
      {!answered && <T x={30} y={260} s={15} f={C.caramel} o={0.7 + 0.3 * Math.sin(t * 3)}>one at a time, or something else?</T>}
      {answered && <T x={30} y={260} s={13} f={C.caramel} o={easeOut(seg(s, 1.6, 2.0))}>build the leaf level directly, then link up</T>}
    </Svg>
  );
}

// 7 · The bulk load. Leaves fill left to right; each closes with a check and is never touched again. Their
// separators stream into the right-most parent page; when it fills, a new one starts to its right. The root is
// a dashed page held in memory. A root-to-leaf descent arrow is drawn and struck out: never needed.
export function BulkLoadReveal({ t }: StepCtx) {
  const L = 6;
  const done = clamp(seg(t, 0.3, 2.7)) * L;
  const cur = Math.min(L - 1, Math.floor(done));
  const parents = done >= 4 ? 2 : 1;
  const strike = easeOut(seg(t, 3.2, 3.6));
  return (
    <Svg label="A bulk load fills leaves left to right, never revisiting a full page; only the right-most page at each level is open, and the root stays in memory" h={320}>
      <rect x={250} y={30} width={100} height={30} rx={5} fill="none" stroke={C.latte} strokeWidth={1.4} strokeDasharray="4 3" opacity={easeOut(seg(t, 0.3, 0.6))} />
      <T x={360} y={50} s={12} f={C.latte} o={easeOut(seg(t, 0.3, 0.6))}>root, in memory</T>
      {Array.from({ length: parents }, (_, p) => (
        <g key={p} opacity={easeOut(seg(t, p === 0 ? 0.8 : 2.0, p === 0 ? 1.1 : 2.3))}>
          <rect x={120 + p * 230} y={100} width={130} height={28} rx={4} fill={C.roast} stroke={p === parents - 1 ? C.caramel : C.crema} strokeWidth={1.6} />
          {Array.from({ length: Math.min(3, Math.max(0, Math.floor(done) - 1 - p * 4 + (p ? 1 : 0))) }, (_, j) => <rect key={j} x={128 + p * 230 + j * 26} y={107} width={18} height={14} rx={2} fill={C.crema} />)}
          <line x1={185 + p * 230} y1={60} x2={185 + p * 230} y2={100} stroke={C.mocha} strokeWidth={1.2} />
        </g>
      ))}
      {Array.from({ length: L }, (_, l) => {
        const k = clamp(done - l);
        const open = l === cur && done < L;
        const x = 22 + l * 94;
        return (
          <g key={l} opacity={done >= l ? 1 : 0.2}>
            <rect x={x} y={190} width={78} height={30} rx={4} fill={C.roast} stroke={open ? C.caramel : k >= 1 ? C.crema : C.taupe} strokeWidth={open ? 2 : 1.2} />
            {Array.from({ length: Math.floor(k * 3 + 1e-9) }, (_, j) => <rect key={j} x={x + 7 + j * 24} y={198} width={18} height={14} rx={2} fill={open ? C.caramel : C.crema} />)}
            {l < L - 1 && <line x1={x + 78} y1={205} x2={x + 94} y2={205} stroke={C.latte} strokeWidth={1.1} opacity={k >= 1 ? 1 : 0} />}
            <line x1={x + 39} y1={190} x2={l < 4 ? 185 : 415} y2={128} stroke={C.mocha} strokeWidth={1} opacity={k >= 1 ? 1 : 0} />
            <Check x={x + 39} y={236} t={t} at={0.3 + ((l + 1) / L) * 2.4} f={C.latte} />
          </g>
        );
      })}
      <T x={30} y={270} s={13} f={C.caramel} o={easeOut(seg(t, 2.6, 2.9))}>only the right-most page is ever still being written</T>
      <g opacity={easeOut(seg(t, 2.9, 3.2))}>
        <path d="M 520 40 C 560 90 560 150 540 186" fill="none" stroke={C.cinnamon} strokeWidth={1.6} strokeDasharray="4 3" />
        <line x1={520} y1={100} x2={572} y2={130} stroke={C.cherryText} strokeWidth={2.2} opacity={strike} />
      </g>
      <T x={30} y={296} s={13} f={C.latte} o={strike}>no root-to-leaf descent, ever</T>
    </Svg>
  );
}

// 8 · Fill factor. Four leaves of 20 slots packed to 50, 70, 90 and 100 per cent, with examples.py's keys
// per leaf and leaves needed for 200 keys. Then one more key arrives at the full page (it must split, red)
// and at the 70 per cent page (it simply fits).
export function FillFactor({ t }: StepCtx) {
  const rows: [string, number, number][] = [
    ['0.5', 10, 20],
    ['0.7', 14, 15],
    ['0.9', 18, 12],
    ['1.0', 20, 10],
  ];
  const arrive = easeInOut(seg(t, 2.4, 3.0));
  return (
    <Svg label="Pages packed to fill factors 0.5, 0.7, 0.9 and 1.0 hold 10, 14, 18 and 20 keys and need 20, 15, 12 and 10 leaves for 200 keys; a new key splits the full page but fits the 70 per cent one" h={320}>
      {rows.map(([ff, keys, leaves], i) => {
        const y = 30 + i * 52;
        const k = clamp(seg(t, 0.3 + i * 0.3, 1.0 + i * 0.3)) * keys;
        const full = i === 3, room = i === 1;
        return (
          <g key={ff}>
            <T x={30} y={y + 18} s={13} f={C.latte}>{ff}</T>
            <rect x={70} y={y} width={20 * 13 + 6} height={26} rx={3} fill={C.roast} stroke={full && arrive > 0.6 ? C.cherryText : room && arrive > 0.9 ? C.caramel : C.mocha} strokeWidth={1.4} />
            {Array.from({ length: Math.floor(k + 1e-9) }, (_, j) => <rect key={j} x={74 + j * 13} y={y + 5} width={10} height={16} rx={1} fill={C.crema} />)}
            <T x={350} y={y + 18} s={13} f={C.crema} o={easeOut(seg(t, 1.0 + i * 0.3, 1.3 + i * 0.3))}>{keys} keys, {leaves} leaves</T>
            {(full || room) && <rect x={74 + keys * 13} y={lerp(y - 26, y + 5, arrive)} width={10} height={16} rx={1} fill={full ? C.cherryText : C.caramel} opacity={arrive > 0 ? 1 : 0} />}
          </g>
        );
      })}
      <T x={30} y={248} s={13} f={C.cherryText} o={easeOut(seg(t, 3.0, 3.3))}>packed full: the next write splits</T>
      <T x={30} y={272} s={13} f={C.caramel} o={easeOut(seg(t, 3.2, 3.5))}>room left: the next write just fits</T>
    </Svg>
  );
}

// 9 · Deduplication, lazily. Key-pointer tuples stream into a page; the size gauge climbs toward capacity.
// Only when the next insert would overflow does the merge run: equal keys collapse into one key with a
// posting list of pointers, the gauge drops, and no split is needed.
export function Deduplication({ t }: StepCtx) {
  const KEYS = [0, 2, 1, 0, 3, 2, 0, 4, 1, 2, 0, 3];
  const cols = [C.crema, C.caramel, C.cinnamon, C.latte, C.taupe];
  const n = Math.floor(clamp(seg(t, 0.3, 1.9)) * KEYS.length + 1e-9);
  const merge = easeInOut(seg(t, 2.1, 2.9));
  const raw = n * 16;
  const capacity = 180;
  const ded = 5 * 8 + KEYS.length * 8;
  const gauge = lerp(raw, ded, merge) / capacity;
  return (
    <Svg label="Key and pointer pairs fill a page toward capacity; only at the moment it would overflow, equal keys merge into one key with a list of pointers and the page has room again" h={320}>
      <T x={30} y={24} s={13} f={C.latte}>without dedup: one tuple per occurrence</T>
      {KEYS.slice(0, n).map((k, i) => {
        const g = KEYS.filter((x, j) => x === k && j < i).length;
        const fx = 30 + i * 44, fy = 40;
        const tx = 30 + k * 108 + 20 + g * 14, ty = 150;
        const x = lerp(fx, tx, merge), y = lerp(fy, ty, merge);
        return (
          <g key={i}>
            <rect x={x} y={y} width={merge > 0.5 ? 0 : 18} height={18} rx={2} fill={cols[k]} />
            <rect x={x + (merge > 0.5 ? 0 : 20)} y={y} width={12} height={18} rx={2} fill="none" stroke={C.latte} strokeWidth={1} />
          </g>
        );
      })}
      {merge > 0.5 && [0, 1, 2, 3, 4].map((k) => <rect key={k} x={30 + k * 108} y={150} width={18} height={18} rx={2} fill={cols[k]} opacity={clamp(merge * 2 - 1)} />)}
      <T x={30} y={134} s={13} f={C.caramel} o={easeOut(seg(t, 2.6, 2.9))}>with dedup: one key, a list of pointers</T>
      <rect x={30} y={214} width={360} height={16} rx={3} fill={C.cocoa} stroke={C.mocha} />
      <rect x={30} y={214} width={360 * Math.min(1, gauge)} height={16} rx={3} fill={gauge > 0.95 ? C.cherryText : C.crema} />
      <line x1={30 + 360} y1={206} x2={30 + 360} y2={238} stroke={C.cherryText} strokeWidth={1.4} />
      <T x={400} y={227} s={13} f={C.cherryText}>capacity</T>
      <T x={30} y={262} s={13} f={C.cherryText} o={n >= KEYS.length && merge <= 0 ? 1 : 0}>about to split: this is when it runs</T>
      <T x={30} y={262} s={13} f={C.caramel} o={easeOut(seg(t, 2.9, 3.2))}>merged at the one moment a split loomed</T>
      <T x={30} y={290} s={13} f={C.latte} o={easeOut(seg(t, 3.3, 3.7))}>no background sweep rewrites quiet pages</T>
    </Svg>
  );
}

// 10 · Prove it: examples.py's numbers, as bars to scale. Pivot tuples: 18.0 bytes full, 8.0 truncated. Page
// writes for the same 200 sorted keys: 1,164 one at a time, 92 bulk-loaded. Storage for 60 inserts of 5
// distinct keys: 960 bytes raw, 520 deduplicated. And 300 ints plus 300 floats sort identically as bytes.
export function ProveIt({ t }: StepCtx) {
  const pair = (y: number, label: string, a: number, b: number, la: string, lb: string, max: number, at: number) => {
    const g = easeInOut(seg(t, at, at + 0.7));
    const o = easeOut(seg(t, at + 0.6, at + 0.9));
    return (
      <g>
        <T x={30} y={y} s={13} f={C.crema} o={easeOut(seg(t, at - 0.2, at))}>{label}</T>
        <rect x={30} y={y + 8} width={(a / max) * 380 * g} height={14} rx={2} fill={C.cinnamon} />
        <T x={30 + (a / max) * 380 + 8} y={y + 20} s={13} f={C.cinnamon} o={o}>{la}</T>
        <rect x={30} y={y + 26} width={(b / max) * 380 * g} height={14} rx={2} fill={C.caramel} />
        <T x={30 + (b / max) * 380 + 8} y={y + 38} s={13} f={C.caramel} o={o}>{lb}</T>
      </g>
    );
  };
  return (
    <Svg label="Measured: pivot tuples 18.0 bytes full versus 8.0 truncated; 1,164 page writes one at a time versus 92 bulk-loaded; 960 bytes raw versus 520 deduplicated; normalized bytes sort exactly like the typed values" h={320}>
      {pair(24, 'pivot tuple, bytes', 18, 8, '18.0', '8.0', 18, 0.3)}
      {pair(96, 'page writes, 200 sorted keys', 1164, 92, '1,164', '92', 1164, 1.1)}
      {pair(168, 'bytes, 60 inserts of 5 keys', 960, 520, '960', '520', 960, 1.9)}
      <T x={30} y={262} s={13} f={C.crema} o={easeOut(seg(t, 2.9, 3.2))}>300 ints, 300 floats: byte order = typed order</T>
      <Check x={492} y={257} t={t} at={3.2} />
      <T x={30} y={300} s={13} f={C.latte} o={easeOut(seg(t, 3.4, 3.8))}>every number from one run of examples.py</T>
    </Svg>
  );
}
