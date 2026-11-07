import { useEffect, useState } from 'react';
import type { StepCtx } from '../../../../../reels/types';
import { clamp, easeInOut, easeOut, lerp, seg } from '../../../../../reels/anim';
import { C, Draw, Svg, T } from '../../../../../reels/kit';

// Colour grammar (CHAPTER.md): crema = runs on disk; caramel = the thing to look at (the merge happening, the
// tracked key, the chosen point); cinnamon = the compared alternative (tiered, the uniform filter split, a
// read probe); cherryText = the cost that grows (runs piling up, a level over its target, the unreachable
// corner). Level sizes and every printed number come from examples.py; shapes without numbers are
// illustrations.

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

function Run({ x, y, w, f = C.crema, o = 1, h = 16, fillC }: { x: number; y: number; w: number; f?: string; o?: number; h?: number; fillC?: string }) {
  if (o <= 0 || w <= 0) return null;
  return <rect x={x} y={y} width={w} height={h} rx={3} fill={fillC ?? C.mocha} stroke={f} strokeWidth={1.4} opacity={o} />;
}

function Check({ x, y, t, at, f = C.caramel }: { x: number; y: number; t: number; at: number; f?: string }) {
  return <Draw pts={[[x - 6, y], [x - 2, y + 5], [x + 7, y - 6]]} t={t} from={at} to={at + 0.25} stroke={f} w={2} pen={false} />;
}

// 1 · The bill. A memtable flushes again and again; each flush stacks one more run on disk. A read probe beside
// the stack has to pass through every run, so its cost bar grows with the pile.
export function Opening({ t }: StepCtx) {
  const n = Math.floor(clamp(seg(t, 0.3, 2.6)) * 6 + 1e-9);
  const flash = (i: number) => clamp(1 - (t - (0.3 + (i / 6) * 2.3)) / 0.4);
  return (
    <Svg label="Each memtable flush adds one more run on disk, and every read has to check every run, so read cost grows with the pile" h={320}>
      <T x={30} y={24} s={13} f={C.cinnamon}>memtable, flushing again and again</T>
      <rect x={30} y={34} width={220} height={22} rx={4} fill="none" stroke={C.cinnamon} strokeWidth={1.4} strokeDasharray="4 3" />
      <T x={30} y={92} s={13} f={C.latte}>runs on disk</T>
      {Array.from({ length: n }, (_, i) => {
        const y = 104 + (n - 1 - i) * 24;
        return <Run key={i} x={30} y={y} w={220} fillC={flash(i) > 0 ? C.cherry : C.mocha} f={i === n - 1 ? C.caramel : C.crema} />;
      })}
      <T x={330} y={92} s={13} f={C.cinnamon}>one read checks</T>
      {Array.from({ length: n }, (_, i) => <rect key={i} x={330 + i * 30} y={104} width={24} height={24} rx={3} fill={C.cinnamon} opacity={0.85} />)}
      <path d={`M 270 ${108} v ${Math.max(0, n * 24 - 8)}`} stroke={C.cinnamon} strokeWidth={2} />
      <T x={30} y={272} s={13} f={C.cherryText} o={easeOut(seg(t, 2.6, 3.0))}>every run flushed: one more run to check</T>
      <T x={30} y={296} s={13} f={C.crema} o={easeOut(seg(t, 3.0, 3.4))}>this topic: what happens to the pile</T>
    </Svg>
  );
}

// 2 · Predict: the pile. Seven runs stacked, a read probe walking down through all of them. After the answer,
// pairs of runs merge into wider single runs and the stack shrinks.
export function CompactionPredict({ t, answer }: StepCtx) {
  const answered = answer !== null;
  const s = useSinceAnswer(answered);
  const m = answered ? easeInOut(seg(s, 0.2, 1.2)) : 0;
  const probe = (t * 0.6) % 1;
  // seven runs; after merging: runs 0+1, 2+3, 4+5 combine; 6 stays
  const rows = [0, 1, 2, 3, 4, 5, 6];
  const target = [0, 0, 1, 1, 2, 2, 3];
  return (
    <Svg label="A growing pile of runs that every read must check; after answering, some runs merge together into fewer, larger runs" h={300}>
      <T x={30} y={24} s={13} f={C.latte}>runs keep piling up</T>
      {rows.map((i) => {
        const y = lerp(40 + i * 24, 40 + target[i] * 34, m);
        const merged = m >= 1 && i % 2 === 1 && i < 6;
        return merged ? null : <Run key={i} x={30} y={y} w={lerp(200, i < 6 ? 260 : 200, m)} h={lerp(16, i < 6 ? 26 : 16, m)} f={m > 0 && i < 6 ? C.caramel : C.crema} />;
      })}
      {!answered && <circle cx={300} cy={48 + probe * 6 * 24} r={6} fill={C.cinnamon} />}
      {!answered && <T x={30} y={262} s={15} f={C.caramel} o={0.7 + 0.3 * Math.sin(t * 3)}>what should happen to this pile?</T>}
      {answered && <T x={30} y={238} s={13} f={C.caramel} o={easeOut(seg(s, 1.2, 1.6))}>merge some runs, sometimes</T>}
      {answered && <T x={30} y={262} s={13} f={C.latte} o={easeOut(seg(s, 1.5, 1.9))}>disk work now, less per read later</T>}
    </Svg>
  );
}

// 3 · Leveled. Each level has one run and a dashed size target four times the last. New data merges into L1's
// run until it overshoots its target (red); then the whole run merges into L2, rewriting every key there. A
// caramel key rides down, and its rewrite counter ticks at every level it crosses.
export function LeveledReveal({ t }: StepCtx) {
  const TG = [120, 300, 520];
  const grow1 = clamp(seg(t, 0.3, 1.4));
  const over = t >= 1.3;
  const down1 = easeInOut(seg(t, 1.6, 2.3));
  const grow2 = clamp(seg(t, 2.4, 3.1));
  const down2 = easeInOut(seg(t, 3.2, 3.8));
  const l1w = down1 > 0 ? lerp(TG[0] * 1.15, 0, down1) + (down1 >= 1 ? TG[0] * 0.4 * grow2 : 0) : TG[0] * 1.15 * grow1;
  const l2w = lerp(TG[1] * 0.6, TG[1] * 0.6 + TG[0] * 1.15, down1);
  const l3w = TG[2] * 0.5 + down2 * TG[1] * 0.4;
  const keyY = down1 < 1 ? 70 : down2 < 1 ? lerp(140, 210, down2) : 210;
  const keyLvl = down1 < 0.5 ? 1 : down2 < 0.5 ? 2 : 3;
  const rewrite = (y: number, wTot: number, at: number) => <rect x={30} y={y} width={wTot} height={18} rx={3} fill={C.caramel} opacity={0.35 * clamp(1 - Math.abs(t - at) / 0.35)} />;
  return (
    <Svg label="Leveled compaction: each level holds one sorted run with a size target; when a level outgrows it, its run merges into the next level, rewriting every key there, so a key can be rewritten at every level" h={320}>
      {['L1', 'L2', 'L3'].map((l, i) => (
        <g key={l}>
          <T x={30} y={58 + i * 70} s={13} f={C.latte}>{l}</T>
          <rect x={30} y={66 + i * 70} width={TG[i]} height={18} rx={3} fill="none" stroke={C.taupe} strokeWidth={1.1} strokeDasharray="4 3" />
        </g>
      ))}
      <Run x={30} y={66} w={l1w} h={18} f={over && down1 <= 0 ? C.cherryText : C.crema} />
      <Run x={30} y={136} w={Math.min(l2w, TG[1] * 1.1)} h={18} f={down2 > 0 && down2 < 1 ? C.caramel : C.crema} />
      <Run x={30} y={206} w={l3w} h={18} />
      {rewrite(136, TG[1], 2.3)}
      {rewrite(206, TG[2] * 0.9, 3.8)}
      <circle cx={lerp(70, 60, down1)} cy={keyY + 9 - (down1 > 0 && down1 < 1 ? 0 : 0)} r={5} fill={C.caramel} opacity={t > 0.5 ? 1 : 0} />
      <T x={360} y={58} s={13} f={C.caramel} o={easeOut(seg(t, 0.6, 0.9))}>this key, rewritten:</T>
      {Array.from({ length: keyLvl }, (_, i) => <rect key={i} x={360 + i * 22} y={68} width={16} height={16} rx={2} fill={C.caramel} />)}
      <T x={330} y={110} s={13} f={C.cherryText} o={over && down1 < 1 ? 1 : 0}>over its target</T>
      <T x={30} y={270} s={13} f={C.crema} o={easeOut(seg(t, 3.4, 3.7))}>a read checks one run per level</T>
      <T x={30} y={294} s={13} f={C.cherryText} o={easeOut(seg(t, 3.7, 4.0))}>a key is rewritten at every level it crosses</T>
    </Svg>
  );
}

// 4 · Tiered. Runs of similar size pile up side by side at L1, untouched; a read probe has to check each one.
// When the fourth arrives, all four merge in one pass into a single wider run at L2: the tracked key is
// rewritten once.
export function TieredReveal({ t }: StepCtx) {
  const n = Math.floor(clamp(seg(t, 0.3, 1.8)) * 4 + 1e-9);
  const m = easeInOut(seg(t, 2.1, 2.9));
  const probe = clamp(seg(t, 1.0, 1.9));
  return (
    <Svg label="Tiered compaction: similar-sized runs accumulate unmerged and every read checks each one; once enough pile up they merge together once into a wider run" h={320}>
      <T x={30} y={58} s={13} f={C.latte}>L1</T>
      <T x={30} y={198} s={13} f={C.latte}>L2</T>
      {Array.from({ length: n }, (_, i) => (
        <Run key={i} x={lerp(30 + i * 132, 30 + i * 60, m)} y={lerp(66, 206, m)} w={lerp(120, 60, m)} h={18} f={m > 0 ? C.caramel : C.cinnamon} o={m >= 1 ? 0 : 1} />
      ))}
      {m >= 1 && <Run x={30} y={206} w={240} h={18} f={C.caramel} />}
      <circle cx={70} cy={lerp(75, 215, m)} r={5} fill={C.caramel} opacity={t > 0.5 ? 1 : 0} />
      {probe > 0 && m <= 0 && <circle cx={30 + 60 + probe * 3 * 132} cy={100} r={6} fill={C.cinnamon} />}
      {Array.from({ length: Math.min(n, Math.floor(probe * 4 + 1e-9)) }, (_, i) => <Check key={i} x={90 + i * 132} y={104} t={t} at={1.0 + i * 0.22} f={C.cinnamon} />)}
      <T x={30} y={130} s={13} f={C.cinnamon} o={easeOut(seg(t, 1.1, 1.4))}>a read checks every unmerged run</T>
      <T x={360} y={160} s={13} f={C.caramel} o={easeOut(seg(t, 2.1, 2.4))}>this key, rewritten:</T>
      <rect x={360} y={170} width={16} height={16} rx={2} fill={C.caramel} opacity={m >= 1 ? 1 : 0} />
      <T x={30} y={270} s={13} f={C.caramel} o={easeOut(seg(t, 3.0, 3.3))}>merged once, when enough have piled up</T>
      <T x={30} y={294} s={13} f={C.latte} o={easeOut(seg(t, 3.4, 3.8))}>cheap to write, costly to read</T>
    </Svg>
  );
}

// 5 · Three costs, defined. Write: one logical write (one block) against the stack of physical bytes it causes.
// Read: the one run that holds the answer against the runs a read opens. Space: the live data against what is
// actually on disk. Each "extra" grows in beside its baseline.
export function AmplificationDefine({ t }: StepCtx) {
  const rows = [
    { name: 'write', base: 'one logical write', extra: 'bytes actually written', n: 4 },
    { name: 'read', base: 'the run with the key', extra: 'runs actually checked', n: 3 },
    { name: 'space', base: 'the live data', extra: 'bytes on disk', n: 2 },
  ];
  return (
    <Svg label="Write amplification: bytes written per logical write; read amplification: runs checked per lookup; space amplification: bytes on disk per byte of live data" h={320}>
      {rows.map((r, i) => {
        const y = 30 + i * 92;
        const at = 0.3 + i * 1.1;
        const ext = clamp(seg(t, at + 0.3, at + 0.9)) * r.n;
        return (
          <g key={r.name} opacity={easeOut(seg(t, at - 0.1, at + 0.2))}>
            <T x={30} y={y} s={14} f={C.caramel}>{r.name}</T>
            <rect x={30} y={y + 12} width={30} height={26} rx={3} fill={C.crema} />
            {Array.from({ length: Math.floor(ext + 1e-9) }, (_, j) => <rect key={j} x={66 + j * 36} y={y + 12} width={30} height={26} rx={3} fill="none" stroke={C.cherryText} strokeWidth={1.6} />)}
            <T x={30} y={y + 58} s={12} f={C.latte}>{r.base}</T>
            <T x={250} y={y + 30} s={13} f={C.cherryText} o={ext > 0 ? 1 : 0}>&rarr; {r.extra}</T>
          </g>
        );
      })}
    </Svg>
  );
}

// 6 · Predict: win on all three? Three cost bars for one policy. Before the answer they sit level. After it,
// pushing write and read down drives space up.
export function TradeoffPredict({ t, answer }: StepCtx) {
  const answered = answer !== null;
  const s = useSinceAnswer(answered);
  const p = answered ? easeInOut(seg(s, 0.2, 1.2)) : 0;
  const hs = [lerp(100, 40, p), lerp(100, 40, p), lerp(100, 180, p)];
  const names = ['write', 'read', 'space'];
  return (
    <Svg label="Three cost bars for one policy; pushing two of them down forces the third up" h={300}>
      <T x={30} y={24} s={13} f={C.latte}>one policy&apos;s three costs</T>
      <line x1={30} y1={230} x2={330} y2={230} stroke={C.mocha} strokeWidth={1.2} />
      {hs.map((h, i) => (
        <g key={i}>
          <rect x={60 + i * 90} y={230 - h} width={50} height={h} rx={2} fill={i === 2 && p > 0 ? C.cherryText : C.crema} />
          <T x={85 + i * 90} y={252} s={13} f={C.latte} a="middle">{names[i]}</T>
        </g>
      ))}
      {!answered && <T x={350} y={140} s={15} f={C.caramel} o={0.7 + 0.3 * Math.sin(t * 3)}>all three low?</T>}
      {answered && <T x={350} y={120} s={13} f={C.caramel} o={easeOut(seg(s, 1.0, 1.4))}>push two down,</T>}
      {answered && <T x={350} y={142} s={13} f={C.cherryText} o={easeOut(seg(s, 1.2, 1.6))}>the third goes up</T>}
    </Svg>
  );
}

// 7 · The shape of the trade. A curve of reachable designs: leveled sits at the low-space end, tiered at the
// low-write end; the corner where both are low is shaded red, unreachable. A hybrid slides along the curve
// between them; it never leaves it.
export function TradeoffReveal({ t }: StepCtx) {
  const curve = (u: number): [number, number] => [90 + 400 * u, 248 - 168 / (1 + 4 * u)];
  const draw = clamp(seg(t, 0.3, 1.2));
  const pts: [number, number][] = Array.from({ length: 31 }, (_, i) => curve(i / 30));
  const hyb = easeInOut(seg(t, 2.6, 3.6));
  const hp = curve(lerp(0.2, 0.55, hyb));
  return (
    <Svg label="Designs lie on one trade-off curve: leveled at the low-space end, tiered at the low-write end; no design reaches the corner where every cost is low, and a hybrid moves along the curve" h={320}>
      <line x1={60} y1={250} x2={560} y2={250} stroke={C.mocha} strokeWidth={1.2} />
      <line x1={60} y1={40} x2={60} y2={250} stroke={C.mocha} strokeWidth={1.2} />
      <T x={560} y={272} s={12} f={C.latte} a="end">space cost &rarr;</T>
      <T x={68} y={36} s={12} f={C.latte}>write cost &uarr;</T>
      <rect x={62} y={170} width={120} height={78} fill={C.cherry} opacity={0.5 * easeOut(seg(t, 1.3, 1.7))} />
      <T x={72} y={236} s={12} f={C.cherryText} o={easeOut(seg(t, 1.3, 1.7))}>no policy here</T>
      <Draw pts={pts} t={t} from={0.3} to={1.2} stroke={C.crema} w={2} pen={false} />
      {draw >= 1 && (
        <>
          <circle cx={curve(0)[0]} cy={curve(0)[1]} r={7} fill={C.crema} opacity={easeOut(seg(t, 1.6, 1.9))} />
          <T x={curve(0)[0] + 14} y={curve(0)[1] - 8} s={13} f={C.crema} o={easeOut(seg(t, 1.6, 1.9))}>leveled: low space</T>
          <circle cx={curve(1)[0]} cy={curve(1)[1]} r={7} fill={C.cinnamon} opacity={easeOut(seg(t, 2.0, 2.3))} />
          <T x={curve(1)[0]} y={curve(1)[1] + 24} s={13} f={C.cinnamon} a="end" o={easeOut(seg(t, 2.0, 2.3))}>tiered: low write</T>
        </>
      )}
      <circle cx={hp[0]} cy={hp[1]} r={7} fill="none" stroke={C.caramel} strokeWidth={2.4} opacity={easeOut(seg(t, 2.5, 2.7))} />
      <T x={hp[0] + 12} y={hp[1] - 14} s={13} f={C.caramel} o={easeOut(seg(t, 2.6, 2.9))}>hybrid</T>
      <T x={30} y={304} s={13} f={C.caramel} o={easeOut(seg(t, 3.6, 4.0))}>a hybrid relocates the trade, never escapes it</T>
    </Svg>
  );
}

// 8 · Monkey. Four levels of 100, 400, 1,600 and 6,400 keys. Bits per key start equal at every level
// (uniform); then they shift: more bits per key on the small levels, fewer on the big one, with the total
// memory (85,000 bits) unchanged. The summed false-positive rate drops from 0.0300 to 0.0178.
export function MonkeyReveal({ t }: StepCtx) {
  const LS = [100, 400, 1600, 6400];
  const MB = [17.74, 14.85, 11.97, 9.08]; // examples.py's Monkey bits/key, drawn as lengths only
  const shift = easeInOut(seg(t, 1.4, 2.5));
  const sum = easeInOut(seg(t, 2.8, 3.6));
  return (
    <Svg label="Four levels of growing size; moving filter bits per key from the large level to the small ones, at the same total memory, lowers the summed false-positive rate from 0.0300 to 0.0178" h={320}>
      <T x={30} y={24} s={13} f={C.latte}>level size</T>
      <T x={330} y={24} s={13} f={shift > 0 ? C.caramel : C.cinnamon}>{shift > 0.5 ? 'bits per key: Monkey' : 'bits per key: uniform'}</T>
      {LS.map((n, i) => {
        const y = 40 + i * 40;
        return (
          <g key={n}>
            <rect x={30} y={y} width={Math.max(6, (n / 6400) * 250) * easeOut(seg(t, 0.2 + i * 0.15, 0.6 + i * 0.15))} height={22} rx={3} fill={C.mocha} stroke={C.crema} strokeWidth={1.2} />
            <T x={36 + Math.max(6, (n / 6400) * 250)} y={y + 16} s={12} f={C.latte} o={easeOut(seg(t, 0.5 + i * 0.15, 0.8 + i * 0.15))}>{n.toLocaleString('en-US')}</T>
            <rect x={330} y={y + 3} width={lerp(10, MB[i], shift) * 12 * easeOut(seg(t, 0.8, 1.2))} height={16} rx={2} fill={shift > 0 ? C.caramel : C.cinnamon} />
          </g>
        );
      })}
      <T x={30} y={222} s={13} f={C.latte} o={easeOut(seg(t, 1.5, 1.8))}>same total memory: 85,000 bits</T>
      <T x={30} y={256} s={13} f={C.crema} o={easeOut(seg(t, 2.7, 3.0))}>summed false positives</T>
      <rect x={260} y={244} width={lerp(300, 300 * (0.0178 / 0.03), sum)} height={16} rx={2} fill={sum > 0 ? C.caramel : C.cinnamon} opacity={easeOut(seg(t, 2.7, 3.0))} />
      <T x={260} y={286} s={13} f={C.cinnamon} o={easeOut(seg(t, 2.8, 3.1))}>uniform 0.0300</T>
      <T x={420} y={286} s={13} f={C.caramel} o={easeOut(seg(t, 3.5, 3.8))}>Monkey 0.0178</T>
    </Svg>
  );
}

// 9 · Dostoevsky. A slider from tiered to leveled. Beside it, a stack of levels: by default the top levels stay
// tiered (several runs side by side) and only the largest level merges to one run. Two workloads move the
// slider and the stack reshapes to match, merging more only where that workload pays for it.
export function DostoevskyReveal({ t }: StepCtx) {
  const presets = [0.25, 0.6, 0.35];
  const k = t < 1.8 ? presets[0] : t < 3.0 ? lerp(presets[0], presets[1], easeInOut(seg(t, 1.8, 2.4))) : lerp(presets[1], presets[2], easeInOut(seg(t, 3.0, 3.6)));
  const runsAt = (lvl: number) => {
    if (lvl === 3) return 1;
    const lev = k * 4 - (2 - lvl);
    return lev > 1 ? 1 : lev > 0.4 ? 2 : 4;
  };
  return (
    <Svg label="Tiered and leveled as two ends of one slider: by default only the largest level is fully merged; a workload that needs faster reads moves the slider and more levels merge" h={320}>
      <T x={30} y={24} s={13} f={C.cinnamon}>tiered</T>
      <T x={570} y={24} s={13} f={C.crema} a="end">leveled</T>
      <line x1={30} y1={40} x2={570} y2={40} stroke={C.mocha} strokeWidth={2} />
      <circle cx={lerp(30, 570, k)} cy={40} r={9} fill={C.caramel} />
      <T x={30} y={72} s={13} f={C.latte} o={easeOut(seg(t, 0.2, 0.5))}>{t < 1.8 ? 'default' : t < 3.0 ? 'a read-heavy workload' : 'a write-heavy workload'}</T>
      {[0, 1, 2, 3].map((lvl) => {
        const n = runsAt(lvl);
        const w = 60 + lvl * 120;
        const y = 96 + lvl * 44;
        return (
          <g key={lvl}>
            <T x={30} y={y + 15} s={12} f={C.latte}>L{lvl + 1}</T>
            {Array.from({ length: n }, (_, i) => <Run key={i} x={70 + (i * w) / n} y={y} w={w / n - 4} h={20} f={n === 1 ? C.caramel : C.cinnamon} />)}
          </g>
        );
      })}
      <T x={30} y={290} s={13} f={C.caramel} o={easeOut(seg(t, 0.6, 1.0))}>by default, only the largest level merges fully</T>
      <T x={30} y={312} s={13} f={C.latte} o={easeOut(seg(t, 3.6, 4.0))}>a better spot on the same trade</T>
    </Svg>
  );
}

// 10 · Prove it, examples.py's numbers on one workload (6,000 writes over 300 keys): write amplification leveled
// 3.46x vs tiered 2.39x; read amplification 2 runs vs 5; space amplification 1.17x vs 3.62x. Then the filter
// split at the same 85,000 bits: summed false positives 0.0300 uniform vs 0.0178 Monkey.
export function ProveIt({ t }: StepCtx) {
  const rows: [string, number, number, string, string, number][] = [
    ['write amplification', 3.46, 2.39, '3.46x', '2.39x', 4],
    ['read amplification, runs', 2, 5, '2', '5', 5],
    ['space amplification', 1.17, 3.62, '1.17x', '3.62x', 4],
  ];
  return (
    <Svg label="Measured on 6,000 writes over 300 keys: write amplification 3.46x leveled versus 2.39x tiered, read 2 runs versus 5, space 1.17x versus 3.62x; filter split 0.0300 uniform versus 0.0178 Monkey" h={320}>
      <T x={30} y={24} s={13} f={C.crema}>6,000 writes, 300 keys:</T>
      <T x={290} y={24} s={13} f={C.crema}>leveled</T>
      <T x={370} y={24} s={13} f={C.cinnamon}>vs tiered</T>
      {rows.map(([name, a, b, la, lb, max], i) => {
        const y = 50 + i * 56;
        const g = easeInOut(seg(t, 0.3 + i * 0.5, 0.9 + i * 0.5));
        const o = easeOut(seg(t, 0.8 + i * 0.5, 1.1 + i * 0.5));
        return (
          <g key={name}>
            <T x={30} y={y + 12} s={13} f={C.latte}>{name}</T>
            <rect x={30} y={y + 20} width={(a / max) * 300 * g} height={10} rx={2} fill={C.crema} />
            <T x={30 + (a / max) * 300 + 8} y={y + 30} s={12} f={C.crema} o={o}>{la}</T>
            <rect x={30} y={y + 34} width={(b / max) * 300 * g} height={10} rx={2} fill={C.cinnamon} />
            <T x={30 + (b / max) * 300 + 8} y={y + 44} s={12} f={C.cinnamon} o={o}>{lb}</T>
          </g>
        );
      })}
      <T x={30} y={236} s={13} f={C.crema} o={easeOut(seg(t, 2.2, 2.5))}>filters, same 85,000 bits: summed false positives</T>
      <rect x={30} y={246} width={300 * easeInOut(seg(t, 2.5, 3.1))} height={10} rx={2} fill={C.cinnamon} />
      <T x={340} y={256} s={12} f={C.cinnamon} o={easeOut(seg(t, 3.0, 3.3))}>uniform 0.0300</T>
      <rect x={30} y={262} width={300 * (0.0178 / 0.03) * easeInOut(seg(t, 2.5, 3.1))} height={10} rx={2} fill={C.caramel} />
      <T x={30 + 300 * (0.0178 / 0.03) + 8} y={272} s={12} f={C.caramel} o={easeOut(seg(t, 3.0, 3.3))}>Monkey 0.0178</T>
      <T x={30} y={306} s={13} f={C.latte} o={easeOut(seg(t, 3.4, 3.8))}>every number from one run of examples.py</T>
    </Svg>
  );
}
