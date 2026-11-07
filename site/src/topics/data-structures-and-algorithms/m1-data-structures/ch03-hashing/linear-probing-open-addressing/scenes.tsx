import { useEffect, useState } from 'react';
import type { StepCtx } from '../../../../../reels/types';
import { clamp, easeInOut, easeOut, easeOutBack, lerp, rng, seg } from '../../../../../reels/anim';
import { C, Decode, Draw, Reticle, Svg, T } from '../../../../../reels/kit';

// Colour grammar (CHAPTER.md): crema = keys; latte = slot indices; taupe = empty slots; caramel =
// the probe sequence and the slot it is testing; cinnamon = the compared alternative (double
// hashing's second path); cherryText = a probe rejected by an occupied slot, primary clustering,
// and the broken search. Every printed number is asserted in examples.py; the probe averages
// depend on Python's per-process hash seed, so they are drawn as shape only.

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

type Cell = { k?: string; f?: string; tomb?: boolean; flash?: number };

/** A row of slots: empty ones taupe outlines, occupied ones crema-filled with a short key label. */
function Slots({ x0, y, cells, w = 40, idx = true, o = 1 }: { x0: number; y: number; cells: Cell[]; w?: number; idx?: boolean; o?: number }) {
  return (
    <g opacity={o}>
      {cells.map((c, i) => {
        const x = x0 + i * w;
        const occ = c.k !== undefined;
        const stroke = c.flash ? C.cherryText : c.f ?? (occ ? C.crema : C.taupe);
        return (
          <g key={i}>
            <rect x={x} y={y} width={w - 4} height={30} rx={3} fill={occ ? C.mocha : C.cocoa} stroke={stroke} strokeWidth={c.flash || c.f ? 2 : 1.3} />
            {occ && <T x={x + (w - 4) / 2} y={y + 20} s={13} f={c.f ?? C.crema} a="middle">{c.k}</T>}
            {c.tomb && <T x={x + (w - 4) / 2} y={y + 20} s={13} f={C.latte} a="middle">&dagger;</T>}
            {idx && <T x={x + (w - 4) / 2} y={y + 48} s={13} f={C.latte} a="middle">{i}</T>}
          </g>
        );
      })}
    </g>
  );
}

/** A dotted caramel hop path visiting slot centres in order, drawn over [from, to]. */
function Hops({ x0, y, w = 40, path, t, from, to, f = C.caramel, lift = 18 }: { x0: number; y: number; w?: number; path: number[]; t: number; from: number; to: number; f?: string; lift?: number }) {
  const cx = (i: number) => x0 + i * w + (w - 4) / 2;
  const segs = path.length - 1;
  return (
    <g>
      {path.slice(1).map((p, k) => {
        const a = cx(path[k]), b = cx(p);
        const h = lift + Math.abs(b - a) * 0.12;
        const pts: [number, number][] = Array.from({ length: 9 }, (_, j) => {
          const u = j / 8;
          return [lerp(a, b, u), y - h * Math.sin(Math.PI * u)];
        });
        const f0 = from + ((to - from) * k) / segs;
        return <Draw key={k} pts={pts} t={t} from={f0} to={f0 + (to - from) / segs} stroke={f} w={1.8} dash="3 3" pen={false} />;
      })}
    </g>
  );
}

/** Index of the hop currently arriving (for flashing rejected slots). */
const hopAt = (t: number, from: number, to: number, n: number) => Math.floor(clamp(seg(t, from, to)) * n + 1e-9);

// 1 · Pointers out. Three chains with red next-pointers; the pointers fade one by one, and every entry slides
// up into a slot of the table itself. Then two keys aim at the same slot.
export function Opening({ t }: StepCtx) {
  const keys = ['a', 'b', 'c', 'd', 'e', 'f'];
  const chain: [number, number][] = [[1, 0], [1, 1], [4, 0], [6, 0], [6, 1], [6, 2]];
  const target = [1, 2, 4, 6, 7, 8];
  const move = easeInOut(seg(t, 1.2, 2.0));
  return (
    <Svg label="A chain's pointers fade out one by one as each entry slides directly into the table itself" h={300}>
      <T x={30} y={26} s={13} f={C.latte}>{move < 0.5 ? 'before: chaining' : 'now: every entry lives in the table itself'}</T>
      <Slots x0={60} y={50} cells={Array.from({ length: 12 }, (_, i) => {
        const j = target.indexOf(i);
        return j >= 0 && move >= 1 ? { k: keys[j] } : {};
      })} />
      {keys.map((k, j) => {
        const [b, d] = chain[j];
        const fx = 60 + b * 40 + 4, fy = 120 + d * 40;
        const tx = 60 + target[j] * 40, ty = 50;
        const x = lerp(fx, tx, move), y = lerp(fy, ty, move);
        const ptr = 1 - easeOut(seg(t, 0.3 + j * 0.12, 0.6 + j * 0.12));
        return move < 1 ? (
          <g key={k}>
            <rect x={x} y={y} width={36} height={30} rx={3} fill={C.mocha} stroke={C.crema} strokeWidth={1.3} />
            <T x={x + 18} y={y + 20} s={13} f={C.crema} a="middle">{k}</T>
            {d < 2 && (j === 0 || j === 3 || j === 4) && <line x1={fx + 18} y1={fy + 30} x2={fx + 18} y2={fy + 40} stroke={C.cherryText} strokeWidth={2} opacity={ptr * (1 - move)} />}
          </g>
        ) : null;
      })}
      <T x={30} y={278} s={13} f={C.cherryText} o={easeOut(seg(t, 0.4, 0.8)) * (1 - move)}>a next pointer per entry</T>
      <Draw pts={[[200, 220], [300, 220], [380, 84]]} t={t} from={2.3} to={2.6} stroke={C.crema} w={1.4} pen={false} />
      <Draw pts={[[560, 220], [460, 220], [380, 84]]} t={t} from={2.4} to={2.7} stroke={C.crema} w={1.4} pen={false} />
      <T x={380} y={250} s={13} f={C.cherryText} a="middle" o={easeOut(seg(t, 2.7, 3.0))}>two keys, one slot?</T>
    </Svg>
  );
}

// 2 · Linear probing. A key hashes to slot 3, finds it full (red flash), tries 4 (full), 5 (full), and lands in
// the first empty slot, 6. The rule decodes in.
export function ProbeMechanism({ t }: StepCtx) {
  const occ = [1, 3, 4, 5, 9];
  const path = [3, 4, 5, 6];
  const h = hopAt(t, 0.6, 2.2, 3);
  const land = t >= 2.2;
  const cells: Cell[] = Array.from({ length: 12 }, (_, i) => {
    if (i === 6 && land) return { k: 'k', f: C.caramel };
    if (occ.includes(i)) return { k: '·', flash: path.indexOf(i) >= 0 && path.indexOf(i) <= h && path.indexOf(i) === h ? 1 : 0 };
    return {};
  });
  return (
    <Svg label="A key hashes to an occupied slot and steps to the next one, and the next, until it lands in the first empty slot" h={260}>
      <Decode text="h(k,i) = (h'(k) + i) mod m" t={t} at={0.1} dur={0.5} x={30} y={26} s={14} f={C.crema} />
      <Slots x0={60} y={110} cells={cells} />
      <T x={60 + 3 * 40 + 18} y={74} s={13} f={C.caramel} a="middle" o={easeOut(seg(t, 0.3, 0.6))}>h(k)</T>
      <Hops x0={60} y={104} path={path} t={t} from={0.6} to={2.2} />
      <T x={30} y={216} s={13} f={C.caramel} o={easeOut(seg(t, 2.2, 2.6))}>full? try the next slot; first empty stops it</T>
    </Svg>
  );
}

// 3 · Predict: two runs, one new collision. Before answering, a key hovers over the long run. After it, the key
// probes across the run and lands on its end, and the run grows by one.
export function ClusterPredictViz({ t, answer }: StepCtx) {
  const answered = answer !== null;
  const s = useSinceAnswer(answered);
  const runs = [2, 3, 4, 8, 9, 10, 11];
  const h = answered ? hopAt(s, 0.2, 1.4, 3) : 0;
  const land = answered && s >= 1.4;
  const cells: Cell[] = Array.from({ length: 13 }, (_, i) => {
    if (i === 12 && land) return { k: 'n', f: C.caramel };
    if (runs.includes(i)) return { k: '·', flash: answered && !land && i === 9 + h ? 1 : 0, f: land && i >= 8 ? C.cherryText : undefined };
    return {};
  });
  return (
    <Svg label="Two runs of occupied slots; a colliding key walks across a run and lands at its end, making it longer" h={280}>
      <T x={30} y={24} s={13} f={C.latte}>two runs already formed</T>
      <Slots x0={40} y={110} cells={cells} />
      {!answered && <T x={40 + 9 * 40 + 18} y={84 + 4 * Math.sin(t * 5)} s={16} f={C.caramel} a="middle">&darr;</T>}
      {answered && <Hops x0={40} y={104} path={[9, 10, 11, 12]} t={s} from={0.2} to={1.4} />}
      {!answered && <T x={30} y={262} s={15} f={C.caramel} o={0.7 + 0.3 * Math.sin(t * 3)}>where does the next collision land?</T>}
      {answered && (
        <>
          <Decode text="at the end of a run" t={s} at={1.5} dur={0.5} x={30} y={222} s={14} f={C.caramel} />
          <T x={30} y={246} s={13} f={C.cherryText} o={easeOut(seg(s, 1.8, 2.2))}>making that run longer</T>
        </>
      )}
    </Svg>
  );
}

// 4 · Primary clustering. Keys with scattered home slots are inserted one after another; each probe that hits
// a run extends it, runs merge, and the longest run turns red. The original wording types in below.
export function ClusteringReveal({ t }: StepCtx) {
  const M = 24, N = 17;
  const r = rng(42);
  const homes = Array.from({ length: N }, () => Math.floor(r() * M));
  const placed: number[] = [];
  const nIns = Math.floor(seg(t, 0.2, 2.4) * N + 1e-9);
  homes.slice(0, nIns).forEach((h) => {
    let p = h;
    while (placed.includes(p)) p = (p + 1) % M;
    placed.push(p);
  });
  // runs
  const occ = (i: number) => placed.includes(i);
  let best = [0, 0], cur = 0;
  for (let i = 0; i < M; i++) {
    cur = occ(i) ? cur + 1 : 0;
    if (cur > best[1]) best = [i - cur + 1, cur];
  }
  const inBest = (i: number) => i >= best[0] && i < best[0] + best[1] && best[1] >= 4;
  const q1 = '"long runs of occupied slots build up...';
  const q2 = 'the long runs tend to get longer"';
  const typed = (q: string, a: number, b: number) => q.slice(0, Math.floor(clamp(seg(t, a, b)) * q.length));
  return (
    <Svg label="Keys inserted with linear probing: runs of occupied slots merge and the longest run keeps growing, primary clustering" h={260}>
      <T x={30} y={24} s={13} f={C.latte}>primary clustering</T>
      {Array.from({ length: M }, (_, i) => (
        <rect key={i} x={30 + i * 22.5} y={60} width={19} height={30} rx={2} fill={occ(i) ? (inBest(i) ? C.cherry : C.mocha) : C.cocoa} stroke={occ(i) ? (inBest(i) ? C.cherryText : C.crema) : C.taupe} strokeWidth={1.2} />
      ))}
      {nIns > 0 && nIns <= N && <circle cx={30 + homes[nIns - 1] * 22.5 + 9.5} cy={50} r={4} fill={C.caramel} />}
      <T x={30} y={128} s={13} f={C.latte}>longest run</T>
      <rect x={150} y={118} width={best[1] * 22} height={12} rx={2} fill={best[1] >= 4 ? C.cherryText : C.crema} />
      <T x={30} y={190} s={13} f={C.cherryText}>{typed(q1, 2.2, 2.9)}</T>
      <T x={30} y={212} s={13} f={C.cherryText}>{typed(q2, 2.8, 3.4)}</T>
      <T x={30} y={244} s={13} f={C.latte} o={easeOut(seg(t, 3.3, 3.7))}>the probing rule itself does it</T>
    </Svg>
  );
}

// 5 · Two fixes. Top: quadratic probing from home slot 2 jumps +1, +4, +9, leaping clear of the run. Bottom:
// double hashing: two keys colliding at slot 2 take different steps (3 and 5) and part ways at once.
export function TwoFixes({ t }: StepCtx) {
  const run = [2, 3, 4, 5, 6];
  const top: Cell[] = Array.from({ length: 13 }, (_, i) => (run.includes(i) && i !== 2 ? { k: '·' } : i === 2 ? { k: '·' } : {}));
  return (
    <Svg label="Quadratic probing jumps one, four, nine slots away from a run; double hashing sends two colliding keys on different step sizes" h={326}>
      <T x={30} y={20} s={13} f={C.caramel}>quadratic probing: offsets 1, 4, 9</T>
      <Slots x0={40} y={104} cells={top} idx={false} />
      <Hops x0={40} y={98} path={[2, 3]} t={t} from={0.4} to={0.7} />
      <Hops x0={40} y={98} path={[2, 6]} t={t} from={0.8} to={1.1} lift={22} />
      <Hops x0={40} y={98} path={[2, 11]} t={t} from={1.2} to={1.6} lift={22} />
      {['+1', '+4', '+9'].map((l, i) => <T key={l} x={40 + [3, 6, 11][i] * 40 + 18} y={158} s={13} f={C.caramel} a="middle" o={easeOut(seg(t, 0.7 + i * 0.4, 0.9 + i * 0.4))}>{l}</T>)}
      <T x={30} y={190} s={13} f={C.cinnamon} o={easeOut(seg(t, 1.8, 2.1))}>double hashing: step = h2(key)</T>
      <Slots x0={40} y={262} cells={Array.from({ length: 13 }, (_, i) => (i === 2 ? { k: '·' } : {}))} idx={false} o={easeOut(seg(t, 1.8, 2.1))} />
      <Hops x0={40} y={256} path={[2, 5, 8, 11]} t={t} from={2.1} to={3.0} />
      <Hops x0={40} y={256} path={[2, 7, 12]} t={t} from={2.1} to={3.0} f={C.cinnamon} lift={26} />
      <T x={30} y={314} s={13} f={C.latte} o={easeOut(seg(t, 3.0, 3.4))}>same start, different steps: they diverge at once</T>
    </Svg>
  );
}

// 6 · Quadratic's fine print. On a prime table of 11 slots, quadratic offsets from slot 0 land on distinct slots
// for the first half of the probes; then two keys starting at the same slot trace the identical path (red).
export function QuadraticCaveat({ t }: StepCtx) {
  const M = 11;
  const offs = [0, 1, 4, 9, 16, 25].map((v) => v % M);
  const shown = Math.floor(seg(t, 0.3, 1.6) * offs.length + 1e-9);
  const twin = easeOut(seg(t, 2.0, 2.4));
  return (
    <Svg label="On a prime-sized table, quadratic probing's first half of probes land on distinct slots; two keys with the same starting slot still follow the same sequence" h={300}>
      <T x={30} y={24} s={13} f={C.caramel}>prime table size, &alpha; &lt; 0.5:</T>
      <T x={30} y={46} s={13} f={C.latte}>first m/2 probes guaranteed distinct</T>
      <Slots x0={60} y={130} w={44} cells={Array.from({ length: M }, (_, i) => (offs.slice(0, shown).includes(i) ? { k: '·', f: C.caramel } : {}))} />
      <Hops x0={60} y={124} w={44} path={offs} t={t} from={0.3} to={1.6} />
      <g opacity={twin}>
        <Hops x0={60} y={124} w={44} path={offs} t={t} from={2.0} to={3.0} f={C.cherryText} lift={30} />
      </g>
      <T x={30} y={214} s={13} f={C.cherryText} o={twin}>same starting slot &rarr; same sequence after that</T>
      <Decode text="secondary clustering" t={t} at={2.8} dur={0.5} x={30} y={240} s={14} f={C.cherryText} />
    </Svg>
  );
}

// 7 · Predict: delete the middle of a run. k2 fades from the run k0..k4. After the answer the slot is emptied,
// and a later search for k4 walks in from k4's home slot, meets the empty slot, and stops: miss.
export function DeletionPredictViz({ t, answer }: StepCtx) {
  const answered = answer !== null;
  const s = useSinceAnswer(answered);
  const gone = easeOut(seg(t, 0.3, 0.9));
  const h = answered ? hopAt(s, 0.3, 1.0, 1) : 0;
  const cells: Cell[] = Array.from({ length: 10 }, (_, i) => {
    const k = ['k0', 'k1', 'k2', 'k3', 'k4'][i - 2];
    if (i === 4) return gone < 1 ? { k: 'k2', f: C.taupe } : {};
    return k ? { k } : {};
  });
  return (
    <Svg label="Deleting the middle of a run by emptying its slot breaks a later search, which stops at the hole and misses the entries beyond it" h={280}>
      <T x={30} y={24} s={13} f={C.latte}>deleting the middle of a run</T>
      <Slots x0={80} y={100} w={44} cells={cells} />
      {!answered && <T x={30} y={250} s={15} f={C.caramel} o={0.7 + 0.3 * Math.sin(t * 3)}>can you just empty it?</T>}
      {answered && (
        <>
          <T x={80 + 3 * 44 + 20} y={76} s={13} f={C.caramel} a="middle">find k4</T>
          <Hops x0={80} y={94} w={44} path={[3, 4]} t={s} from={0.3} to={1.0} />
          {h >= 1 && <Draw pts={[[80 + 4 * 44 + 8, 104], [80 + 4 * 44 + 32, 128]]} t={s} from={1.0} to={1.15} stroke={C.cherryText} w={2.4} pen={false} />}
          {h >= 1 && <Draw pts={[[80 + 4 * 44 + 32, 104], [80 + 4 * 44 + 8, 128]]} t={s} from={1.1} to={1.25} stroke={C.cherryText} w={2.4} pen={false} />}
          <Reticle x={80 + 6 * 44 + 20} y={115} w={52} h={44} t={s} at={1.5} color={C.cherryText} />
          <Decode text="empty: search stops here" t={s} at={1.3} dur={0.5} x={30} y={206} s={14} f={C.cherryText} />
          <T x={30} y={232} s={13} f={C.latte} o={easeOut(seg(s, 1.8, 2.2))}>and misses k4, sitting just beyond</T>
        </>
      )}
    </Svg>
  );
}

// 8 · Two ways to delete. Top: a tombstone † takes k2's slot and a search for k4 walks past it ("keep going").
// Bottom: cluster-rehash: k3 and k4 slide back to close the hole at once, and the search finds k4 sooner.
export function DeletionTwoWays({ t }: StepCtx) {
  const tomb = easeOut(seg(t, 0.3, 0.6));
  const shift = easeInOut(seg(t, 2.0, 2.6));
  const keysTop: Cell[] = Array.from({ length: 9 }, (_, i) => {
    if (i === 3) return tomb > 0.5 ? { tomb: true, f: C.latte } : { k: 'k2' };
    const k = ['k0', 'k1', '', 'k3', 'k4'][i - 1];
    return k ? { k } : {};
  });
  return (
    <Svg label="A tombstone keeps the deleted slot occupied so searches keep going; cluster rehashing moves the later entries back and frees the slot at once" h={300}>
      <T x={30} y={24} s={13} f={C.latte}>tombstone: slot stays occupied, forever</T>
      <Slots x0={80} y={62} w={44} cells={keysTop} idx={false} />
      <Hops x0={80} y={56} w={44} path={[2, 3, 4, 5]} t={t} from={0.8} to={1.6} />
      <T x={80 + 3 * 44 + 20} y={118} s={13} f={C.caramel} a="middle" o={easeOut(seg(t, 1.0, 1.3))}>keep going</T>
      <T x={30} y={160} s={13} f={C.caramel} o={easeOut(seg(t, 1.8, 2.1))}>cluster-rehash: later entries shift back</T>
      <g opacity={easeOut(seg(t, 1.8, 2.1))}>
        {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => <rect key={i} x={80 + i * 44} y={184} width={40} height={30} rx={3} fill={C.cocoa} stroke={C.taupe} strokeWidth={1.3} />)}
        {[['k0', 1, 1], ['k1', 2, 2], ['k3', 4, 3], ['k4', 5, 4]].map(([k, from, to]) => {
          const x = 80 + lerp(from as number, to as number, shift) * 44;
          return (
            <g key={k as string}>
              <rect x={x} y={184} width={40} height={30} rx={3} fill={C.mocha} stroke={(from as number) !== (to as number) ? C.caramel : C.crema} strokeWidth={1.6} />
              <T x={x + 20} y={204} s={13} f={(from as number) !== (to as number) ? C.caramel : C.crema} a="middle">{k}</T>
            </g>
          );
        })}
      </g>
      <T x={30} y={270} s={13} f={C.latte} o={easeOut(seg(t, 3.0, 3.4))}>both keep every surviving key findable</T>
      <T x={30} y={292} s={13} f={C.taupe} o={easeOut(seg(t, 3.2, 3.6))}>more work now, nothing left behind</T>
    </Svg>
  );
}

// 9 · Prove it. Three load factors on a prime table of 2,003 slots: linear probing's bar climbs fastest while
// double hashing's stays nearer flat, and the gap bracket between them widens (shape only).
export function ProveIt({ t }: StepCtx) {
  const rows: [string, string, number, number][] = [
    ['0.50', '1,002', 1.4, 1.3],
    ['0.75', '1,502', 2.7, 1.9],
    ['0.90', '1,803', 4.8, 2.5],
  ];
  const U = 70;
  return (
    <Svg label="Average probes at three load factors: linear probing climbs fastest while double hashing stays nearer flat, and the gap widens" h={300}>
      <T x={30} y={22} s={13} f={C.taupe}>m = 2,003 slots, average probes</T>
      {rows.map(([a, n, lin, dbl], r) => {
        const y = 52 + r * 70;
        const k = easeInOut(seg(t, 0.3 + r * 0.6, 1.0 + r * 0.6));
        return (
          <g key={a} opacity={easeOut(seg(t, 0.3 + r * 0.6, 0.5 + r * 0.6))}>
            <T x={30} y={y + 12} s={13} f={C.crema}>&alpha; = {a}</T>
            <T x={30} y={y + 32} s={13} f={C.taupe}>n = {n}</T>
            <rect x={160} y={y} width={lin * U * k} height={14} rx={2} fill={C.cherryText} />
            <rect x={160} y={y + 20} width={dbl * U * k} height={14} rx={2} fill={C.cinnamon} />
            <path d={`M ${160 + dbl * U} ${y + 40} v 6 H ${160 + lin * U} v -6`} fill="none" stroke={C.latte} strokeWidth={1.2} opacity={easeOut(seg(t, 1.0 + r * 0.6, 1.3 + r * 0.6))} />
          </g>
        );
      })}
      <T x={30} y={262} s={13} f={C.cherryText} o={easeOut(seg(t, 2.6, 3.0))}>linear</T>
      <T x={110} y={262} s={13} f={C.cinnamon} o={easeOut(seg(t, 2.6, 3.0))}>double hashing</T>
      <T x={30} y={288} s={13} f={C.latte} o={easeOut(seg(t, 3.0, 3.4))}>the gap widens: primary clustering, measured</T>
    </Svg>
  );
}
