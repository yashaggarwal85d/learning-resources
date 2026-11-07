import { useEffect, useState, type ReactElement } from 'react';
import type { StepCtx } from '../../../../../reels/types';
import { clamp, easeInOut, easeOut, easeOutBack, lerp, seg } from '../../../../../reels/anim';
import { C, Decode, Draw, Svg, T } from '../../../../../reels/kit';

// Colour grammar (CHAPTER.md): crema = data blocks; latte = hashes; taupe = quiet structure;
// caramel = the hash path being recomputed or walked; cinnamon = the compared alternative (a full
// scan, fixed-offset chunking); cherryText = a mismatched hash proving two copies disagree. Every
// printed number is asserted in examples.py.

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

/** Node position in a perfect binary tree with `leaves` leaves: level 0 = leaves, top = root. */
function nodePos(x0: number, w: number, yTop: number, h: number, leaves: number, level: number, i: number): [number, number] {
  const levels = Math.log2(leaves);
  const n = leaves >> level;
  const step = w / n;
  return [x0 + step * (i + 0.5), yTop + h * (1 - level / levels)];
}

type Colour = (level: number, i: number) => string | undefined;

/**
 * A Merkle tree: leaves as data blocks, every other node a small hash pill. `upTo(level)` gives each level's
 * appearance (0..1), `col` overrides a node's stroke colour, `dim` fades nodes.
 */
function Tree({ x0, w, yTop, h, leaves, upTo = () => 1, col, dim, r = 7 }: { x0: number; w: number; yTop: number; h: number; leaves: number; upTo?: (l: number) => number; col?: Colour; dim?: (l: number, i: number) => number; r?: number }) {
  const levels = Math.log2(leaves);
  const els: ReactElement[] = [];
  for (let l = levels; l >= 0; l--) {
    const n = leaves >> l;
    for (let i = 0; i < n; i++) {
      const [x, y] = nodePos(x0, w, yTop, h, leaves, l, i);
      const k = upTo(l);
      const d = dim?.(l, i) ?? 1;
      const c = col?.(l, i) ?? (l === 0 ? C.crema : C.latte);
      if (l > 0) {
        const [ax, ay] = nodePos(x0, w, yTop, h, leaves, l - 1, 2 * i);
        const [bx, by] = nodePos(x0, w, yTop, h, leaves, l - 1, 2 * i + 1);
        els.push(<line key={`a${l}-${i}`} x1={x} y1={y + r} x2={lerp(x, ax, k)} y2={lerp(y + r, ay - r, k)} stroke={c === C.latte ? C.mocha : c} strokeWidth={1.2} opacity={d} />);
        els.push(<line key={`b${l}-${i}`} x1={x} y1={y + r} x2={lerp(x, bx, k)} y2={lerp(y + r, by - r, k)} stroke={c === C.latte ? C.mocha : c} strokeWidth={1.2} opacity={d} />);
      }
      els.push(
        l === 0 ? (
          <rect key={`n${l}-${i}`} x={x - r} y={y - r} width={2 * r} height={2 * r} rx={2} fill={C.mocha} stroke={c} strokeWidth={1.6} opacity={d * (k > 0 ? 1 : 0)} />
        ) : (
          <rect key={`n${l}-${i}`} x={x - r * 1.4} y={y - r} width={r * 2.8} height={2 * r} rx={r} fill={C.cocoa} stroke={c} strokeWidth={1.6} opacity={d * k} />
        ),
      );
    }
  }
  return <g>{els}</g>;
}

// 1 · Do two copies agree? Two machines' copies of the same data appear side by side; a naive check sweeps both,
// block by block, and the end of the row is still a long way off.
export function Opening({ t }: StepCtx) {
  const sweep = clamp(seg(t, 1.2, 3.6)) * 16;
  return (
    <Svg label="Two copies of the same data on two machines; checking that they agree by reading both block by block is slow" h={300}>
      <T x={30} y={26} s={13} f={C.latte}>before: where does this key live?</T>
      <T x={30} y={70} s={13} f={C.caramel} o={easeOut(seg(t, 0.8, 1.1))}>now: do these two copies even agree?</T>
      {[0, 1].map((m) => (
        <g key={m} opacity={easeOut(seg(t, 0.3 + m * 0.2, 0.6 + m * 0.2))}>
          <T x={30} y={118 + m * 60} s={13} f={C.latte}>{m === 0 ? 'copy A' : 'copy B'}</T>
          {Array.from({ length: 16 }, (_, i) => <rect key={i} x={110 + i * 28} y={102 + m * 60} width={24} height={24} rx={2} fill={C.mocha} stroke={i < sweep ? C.cinnamon : C.crema} strokeWidth={i < sweep ? 2 : 1.1} />)}
        </g>
      ))}
      {sweep > 0 && <line x1={110 + sweep * 28} y1={94} x2={110 + sweep * 28} y2={194} stroke={C.cinnamon} strokeWidth={2} />}
      <T x={30} y={250} s={13} f={C.cinnamon} o={easeOut(seg(t, 1.6, 2.0))}>reading both all the way through?</T>
      <T x={560} y={250} s={18} f={C.cherryText} a="end" o={easeOut(seg(t, 2.4, 2.8)) * (0.6 + 0.4 * Math.sin(t * 4))}>?</T>
    </Svg>
  );
}

// 2 · Build the tree. Eight data blocks get leaf hashes; then pairs are hashed level by level, the lines
// drawing upward, until one root hash sits on top, glowing.
export function TreeBuilt({ t }: StepCtx) {
  const up = (l: number) => easeOut(seg(t, 0.3 + l * 0.6, 0.8 + l * 0.6));
  const glow = easeOut(seg(t, 2.4, 2.8));
  return (
    <Svg label="Each data block is hashed, then the hashes are hashed in pairs level by level until one root hash speaks for every block" h={300}>
      <Tree x0={60} w={480} yTop={50} h={170} leaves={8} upTo={up} col={(l) => (l === 3 && glow > 0 ? C.caramel : undefined)} r={10} />
      <T x={300} y={30} s={13} f={C.caramel} a="middle" o={glow}>root hash</T>
      <T x={30} y={256} s={13} f={C.latte} o={easeOut(seg(t, 0.4, 0.8))}>hash each block, then hash the hashes, two at a time</T>
      <T x={30} y={280} s={13} f={C.caramel} o={easeOut(seg(t, 2.8, 3.2))}>one root hash speaks for every leaf beneath it</T>
    </Svg>
  );
}

// 3 · Predict: matching roots. Two independent trees with equal roots. After the answer, a caramel wave runs
// down both trees from the roots to every leaf: every leaf identical.
export function RootMatchPredict({ t, answer }: StepCtx) {
  const answered = answer !== null;
  const s = useSinceAnswer(answered);
  const wave = answered ? clamp(seg(s, 0.1, 1.0)) * 4 : 0;
  const col: Colour = (l) => (answered && 3 - l < wave ? C.caramel : undefined);
  return (
    <Svg label="Two independently built trees whose root hashes match: every leaf underneath is guaranteed identical" h={290}>
      <Tree x0={30} w={250} yTop={44} h={140} leaves={8} col={col} />
      <Tree x0={320} w={250} yTop={44} h={140} leaves={8} col={col} />
      <T x={300} y={50} s={18} f={C.caramel} a="middle">=</T>
      {!answered && <T x={30} y={262} s={15} f={C.caramel} o={0.7 + 0.3 * Math.sin(t * 3)}>roots match: what does it guarantee?</T>}
      {answered && (
        <>
          <Decode text="every leaf identical" t={s} at={1.0} dur={0.4} x={30} y={238} s={14} f={C.caramel} />
          <T x={30} y={262} s={13} f={C.latte} o={easeOut(seg(s, 1.4, 1.8))}>one comparison, as strong as comparing them all</T>
        </>
      )}
    </Svg>
  );
}

// 4 · Mismatch. One leaf of the right-hand tree changes; its new hash climbs level by level (red) to the root,
// and the two roots no longer match.
export function RootMismatch({ t }: StepCtx) {
  const BAD = 5;
  const climb = clamp(seg(t, 0.6, 2.0)) * 4;
  const onPath = (l: number, i: number) => i === BAD >> l;
  const col: Colour = (l, i) => (onPath(l, i) && l < climb ? C.cherryText : undefined);
  return (
    <Svg label="One leaf changes; its hash change climbs every level to the root, so the two roots disagree" h={290}>
      <Tree x0={30} w={250} yTop={44} h={140} leaves={8} />
      <Tree x0={320} w={250} yTop={44} h={140} leaves={8} col={col} />
      <T x={300} y={50} s={18} f={climb >= 4 ? C.cherryText : C.caramel} a="middle">{climb >= 4 ? '≠' : '='}</T>
      <T x={30} y={240} s={13} f={C.cherryText} o={easeOut(seg(t, 2.1, 2.5))}>the roots disagree, but not yet where</T>
    </Svg>
  );
}

// 5 · Predict: which leaf changed? Mismatched roots over eight leaves. After answering, the walk compares the two
// children at each level, follows the red one and greys the matching sibling, down to the exact leaf.
export function WalkDownPredict({ t, answer }: StepCtx) {
  const answered = answer !== null;
  const s = useSinceAnswer(answered);
  const BAD = 5;
  const depth = answered ? clamp(seg(s, 0.1, 1.6)) * 3 : 0;
  const col: Colour = (l, i) => (l === 3 ? C.cherryText : answered && 3 - l <= depth && i === BAD >> l ? C.cherryText : undefined);
  const dim = (l: number, i: number) => {
    if (!answered || l === 3) return 1;
    const lvl = 3 - l;
    if (lvl > depth + 1e-9) return 1;
    return i === BAD >> l || (i ^ 1) === BAD >> l ? (i === BAD >> l ? 1 : 0.35) : 0.35;
  };
  return (
    <Svg label="Mismatched roots: comparing two children per level and following the one that differs reaches the changed leaf in about log n checks" h={290}>
      <Tree x0={60} w={480} yTop={44} h={150} leaves={8} col={col} dim={dim} r={9} />
      {!answered && <T x={30} y={262} s={15} f={C.caramel} o={0.7 + 0.3 * Math.sin(t * 3)}>how many hashes to find it?</T>}
      {answered && (
        <>
          <Decode text="one path: about log n" t={s} at={1.6} dur={0.4} x={30} y={238} s={14} f={C.caramel} />
          <T x={30} y={262} s={13} f={C.latte} o={easeOut(seg(s, 2.0, 2.4))}>every sibling path stays untouched</T>
        </>
      )}
    </Svg>
  );
}

// 6 · Halving downward. A 16-leaf tree: at each level the matching half greys out (falls away) and the walk
// follows the red half, until a reticle lands on the exact leaf.
export function ProofPath({ t }: StepCtx) {
  const BAD = 11;
  const depth = clamp(seg(t, 0.4, 2.8)) * 4;
  const fallen = (l: number, i: number) => {
    // a node falls away once the walk has passed its level's decision and it is not on the path's subtree
    for (let d = 1; d <= Math.floor(depth + 1e-9); d++) {
      const lvl = 4 - d;
      if (l <= lvl && (i >> (lvl - l)) !== BAD >> lvl) return true;
    }
    return false;
  };
  const col: Colour = (l, i) => (i === BAD >> l && 4 - l <= depth ? C.cherryText : undefined);
  return (
    <Svg label="At each level only one child can be wrong; following it halves the remaining tree until the exact changed leaf is reached" h={290}>
      <Tree x0={30} w={540} yTop={40} h={170} leaves={16} col={col} dim={(l, i) => (fallen(l, i) ? 0.18 : 1)} r={8} />
      <T x={30} y={250} s={13} f={C.latte} o={easeOut(seg(t, 0.6, 1.0))}>each level: half the tree falls away</T>
      <T x={30} y={274} s={13} f={C.caramel} o={easeOut(seg(t, 2.8, 3.2))}>the same halving as divide and conquer, downward</T>
    </Svg>
  );
}

// 7 · Three production uses. Three cards, each with its own small tree drawing in: two replicas' trees exchanging
// a repair arrow, a commit's tree, and an append-only log whose root is re-signed.
export function ProductionUses({ t }: StepCtx) {
  const cards = ['database repair', 'version control', 'certificate log'];
  return (
    <Svg label="A database's replica repair, a version-control system and a public certificate log all built on the same tree" h={300}>
      {cards.map((c, i) => {
        const k = easeOut(seg(t, 0.3 + i * 0.7, 0.8 + i * 0.7));
        const x0 = 30 + i * 186;
        return (
          <g key={c} opacity={k}>
            <rect x={x0} y={30} width={170} height={190} rx={6} fill={C.cocoa} stroke={C.mocha} strokeWidth={1.2} />
            <Tree x0={x0 + 10} w={150} yTop={56} h={90} leaves={4} upTo={(l) => easeOut(seg(t, 0.4 + i * 0.7 + l * 0.15, 0.7 + i * 0.7 + l * 0.15))} col={(l) => (l === 2 ? C.caramel : undefined)} r={7} />
            <T x={x0 + 85} y={198} s={13} f={C.latte} a="middle">{c}</T>
          </g>
        );
      })}
      <Draw pts={[[110, 172], [130, 182], [150, 172]]} t={t} from={0.9} to={1.2} stroke={C.caramel} w={1.6} pen={false} />
      <T x={30} y={262} s={13} f={C.caramel} o={easeOut(seg(t, 2.6, 3.0))}>three systems, one tree</T>
    </Svg>
  );
}

// 8 · Chunking. Top: a byte stream cut every N bytes; a byte inserted near the front shoves every later boundary
// over, and they all flash red. Bottom: cuts placed where the content says; the insert moves only the one
// nearby boundary.
export function ContentDefinedChunking({ t }: StepCtx) {
  const ins = easeInOut(seg(t, 0.8, 1.4));
  const fixed = Array.from({ length: 9 }, (_, i) => 60 + i * 60);
  const content = [60, 115, 190, 230, 300, 370, 420, 500, 560];
  const shiftFlash = ins >= 1;
  return (
    <Svg label="Fixed-size chunks: one inserted byte shifts every later boundary; content-defined chunks: only the one nearby boundary moves" h={300}>
      <T x={30} y={24} s={13} f={C.cinnamon}>fixed offset: every later boundary shifts</T>
      <rect x={40} y={44} width={520} height={30} rx={3} fill={C.mocha} />
      {fixed.map((x, i) => {
        const moved = i >= 1 && shiftFlash;
        return <line key={i} x1={x + (i >= 1 ? 0 : 0)} y1={40} x2={x} y2={78} stroke={moved ? C.cherryText : C.cinnamon} strokeWidth={2} transform={`translate(${i >= 1 ? -8 * ins : 0} 0)`} />;
      })}
      <rect x={84} y={lerp(34, 44, ins)} width={8} height={30} fill={C.caramel} opacity={ins} />
      <T x={40} y={100} s={13} f={C.cherryText} o={shiftFlash ? 1 : 0}>every chunk after it re-hashes</T>
      <T x={30} y={150} s={13} f={C.caramel} o={easeOut(seg(t, 1.8, 2.1))}>content-defined: only the one nearby chunk</T>
      <g opacity={easeOut(seg(t, 1.8, 2.1))}>
        <rect x={40} y={170} width={520} height={30} rx={3} fill={C.mocha} />
        {content.map((x, i) => <line key={i} x1={x} y1={166} x2={x} y2={204} stroke={i === 1 && t > 2.8 ? C.cherryText : C.caramel} strokeWidth={2} />)}
        <rect x={84} y={lerp(160, 170, easeInOut(seg(t, 2.3, 2.8)))} width={8} height={30} fill={C.caramel} opacity={easeInOut(seg(t, 2.3, 2.8))} />
      </g>
      <T x={40} y={228} s={13} f={C.caramel} o={easeOut(seg(t, 2.9, 3.2))}>one boundary moves; the rest stay put</T>
      <T x={30} y={274} s={13} f={C.latte} o={easeOut(seg(t, 3.2, 3.6))}>boundaries set by content, not a byte count</T>
    </Svg>
  );
}

// 9 · Prove it. Left: 64 leaves, one changed (index 37): the full scan's counter runs to 64, the walk-down stops
// at 12. Right: a 20,000-byte stream with one inserted byte: 79 of 79 fixed chunks change, 1 of 76 content ones.
export function ProveIt({ t }: StepCtx) {
  const a = easeInOut(seg(t, 0.3, 1.6));
  const b = easeInOut(seg(t, 1.9, 3.2));
  const bar = (x: number, y: number, v: number, max: number, f: string, k: number) => <rect x={x} y={y - (v / max) * 130 * k} width={50} height={(v / max) * 130 * k} fill={f} />;
  return (
    <Svg label="Finding one changed leaf of 64 takes 12 hash checks against 64 for a full scan; one inserted byte changes 79 of 79 fixed chunks but 1 of 76 content-defined ones" h={300}>
      <T x={30} y={24} s={13} f={C.crema}>64 leaves</T>
      <T x={30} y={44} s={13} f={C.crema}>leaf 37 changed</T>
      <line x1={40} y1={210} x2={260} y2={210} stroke={C.mocha} strokeWidth={1.2} />
      {bar(60, 210, 64, 64, C.cinnamon, a)}
      {bar(170, 210, 12, 64, C.caramel, a)}
      <T x={85} y={232} s={13} f={C.cinnamon} a="middle">scan</T>
      <T x={195} y={232} s={13} f={C.caramel} a="middle">walk</T>
      <T x={85} y={204 - 130} s={14} f={C.cinnamon} a="middle" o={easeOut(seg(t, 1.5, 1.8))}>64</T>
      <T x={195} y={204 - (12 / 64) * 130} s={14} f={C.caramel} a="middle" o={easeOut(seg(t, 1.5, 1.8))}>12</T>
      <T x={320} y={24} s={13} f={C.crema} o={easeOut(seg(t, 1.7, 2.0))}>20,000 bytes</T>
      <T x={320} y={44} s={13} f={C.crema} o={easeOut(seg(t, 1.7, 2.0))}>one byte inserted</T>
      <line x1={310} y1={210} x2={560} y2={210} stroke={C.mocha} strokeWidth={1.2} opacity={easeOut(seg(t, 1.7, 2.0))} />
      {bar(330, 210, 79, 79, C.cherryText, b)}
      {bar(460, 210, 1, 79, C.caramel, b)}
      <T x={355} y={232} s={13} f={C.cherryText} a="middle" o={easeOut(seg(t, 1.7, 2.0))}>fixed</T>
      <T x={485} y={232} s={13} f={C.caramel} a="middle" o={easeOut(seg(t, 1.7, 2.0))}>content</T>
      <T x={355} y={204 - 130} s={14} f={C.cherryText} a="middle" o={easeOut(seg(t, 3.1, 3.4))}>79 of 79</T>
      <T x={485} y={193} s={14} f={C.caramel} a="middle" o={easeOut(seg(t, 3.1, 3.4))}>1 of 76</T>
      <T x={30} y={278} s={13} f={C.latte} o={easeOut(seg(t, 3.3, 3.7))}>both measured, on the same tree and the same stream</T>
    </Svg>
  );
}
