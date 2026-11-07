import { useEffect, useState } from 'react';
import { Bar, C, Plot, Svg, T } from '../../../../../reels/kit';
import type { StepCtx } from '../../../../../reels/types';
import { clamp, easeInOut, easeOut, easeOutBack, lerp, seg } from '../../../../../reels/anim';

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

/** A number counted up to its final value, with fixed decimals and thousands separators. */
function num(v: number, d = 0) {
  return v.toLocaleString('en-US', { minimumFractionDigits: d, maximumFractionDigits: d });
}

/** A label-left / value-right row, stacked vertically with generous gaps (DESIGN.md, phone text scaling).
 * `k` fades it in and slides it up a little; the value is whatever string the scene passes (a count in progress). */
function Row({ y, label, value, valueColor = C.crema, big = false, k = 1 }: { y: number; label: string; value: string; valueColor?: string; big?: boolean; k?: number }) {
  return (
    <g opacity={k} transform={`translate(0 ${((1 - k) * 10).toFixed(2)})`}>
      <T x={25} y={y} s={15} f={C.latte}>
        {label}
      </T>
      <T x={575} y={y} s={big ? 22 : 17} f={valueColor} a="end" w={600}>
        {value}
      </T>
    </g>
  );
}

/** A verdict tick at the right edge, drawn in by `k`. */
function Tick({ y, k, f = C.focus }: { y: number; k: number; f?: string }) {
  return <path d={`M540 ${y} l8 8 l16 -18`} fill="none" stroke={f} strokeWidth={3} strokeDasharray="40" strokeDashoffset={40 * (1 - k)} />;
}

/** A time bar that grows to its share over `k`; its figure fades in once the bar is most of the way there. */
function timeBar(x: number, y: number, frac: number, display: string, label: string, fill: string, k: number) {
  return (
    <g key={label} opacity={k > 0 ? 1 : 0}>
      <T x={x} y={y - 20} s={13} f={C.latte} o={clamp(k * 3, 0, 1)}>
        {label}
      </T>
      <Bar x={x} y={y} w={340 * frac * k} h={20} full={340} fill={fill} />
      <T x={x} y={y + 38} s={13} f={C.crema} o={seg(k, 0.6, 1)}>
        {display}
      </T>
    </g>
  );
}

/** Two timed rows that count up, each with a bar under it scaled to the slower one. */
function TwoTimes({ t, rows, max }: { t: number; rows: [string, number, number, string][]; max: number }) {
  return (
    <g>
      {rows.map(([label, ms, d, color], i) => {
        const k = easeOut(seg(t, 0.2 + i * 1.1, 0.8 + i * 1.1));
        const c = easeOut(seg(t, 0.3 + i * 1.1, 1.3 + i * 1.1));
        const y = 60 + i * 60;
        return (
          <g key={label}>
            <Row y={y} label={label} value={`${num(ms * c, d)} ms`} valueColor={color} big k={k} />
            <rect x={25} y={y + 14} width={k > 0 ? Math.max(3, 550 * (ms / max) * c) : 0} height={6} rx={3} fill={color} opacity={0.8} />
          </g>
        );
      })}
    </g>
  );
}

/** A predict step's verdict, sliding up into place once the learner has answered. */
function Verdict({ answer, text, y = 184, f = C.focus }: { answer: number | null; text: string; y?: number; f?: string }) {
  const s = useSinceAnswer(answer !== null);
  const v = answer !== null ? easeOut(seg(s, 0.1, 0.6)) : 0;
  if (answer === null) return null;
  return (
    <T x={300} y={lerp(y + 8, y, v)} s={15} f={f} a="middle" o={v}>
      {text}
    </T>
  );
}

/** A Row whose "?" becomes the answer once the learner has answered, underlined as it lands. */
function AnswerRow({ y, label, answer, value, k, f = C.focus }: { y: number; label: string; answer: number | null; value: string; k: number; f?: string }) {
  const s = useSinceAnswer(answer !== null);
  const u = answer !== null ? easeOut(seg(s, 0.2, 0.7)) : 0;
  const uw = Math.min(250, value.length * 10.7);
  return (
    <g>
      <Row y={y} label={label} value={answer !== null ? value : '?'} valueColor={answer !== null ? f : C.crema} k={k} />
      {answer !== null && <rect x={575 - uw * u} y={y + 12} width={uw * u} height={3} fill={f} />}
    </g>
  );
}

/** Twelve rows' values in physical order: one column matched to row order, one scattered across it. */
/** A cell with a centred label. */
function Cell({ x, y, w, h = 28, label, o = 1, stroke = C.mocha, f = C.crema }: { x: number; y: number; w: number; h?: number; label: string; o?: number; stroke?: string; f?: string }) {
  return (
    <g opacity={o}>
      <rect x={x} y={y} width={w} height={h} rx={4} fill={C.cocoa} stroke={stroke} strokeWidth={1.5} />
      <T x={x + w / 2} y={y + h / 2 + 4.5} s={12} f={f} a="middle">
        {label}
      </T>
    </g>
  );
}
/** A small cross drawn by `k`. */
function Cross({ x, y, k }: { x: number; y: number; k: number }) {
  return <path d={`M${x - 7} ${y - 7} l14 14 m0 -14 l-14 14`} stroke={C.cherryText} strokeWidth={2.5} opacity={k} />;
}

/** A small tick at (x, y), drawn by `k`. */
function MiniTick({ x, y, k, f = C.focus }: { x: number; y: number; k: number; f?: string }) {
  return <path d={`M${x} ${y} l4 4 l8 -9`} fill="none" stroke={f} strokeWidth={2} strokeDasharray="20" strokeDashoffset={20 * (1 - k)} />;
}
/** A small padlock at (x, y), drawn in by `k`. */
function Lock({ x, y, k, f = C.second }: { x: number; y: number; k: number; f?: string }) {
  return (
    <g opacity={k}>
      <path d={`M${x + 3} ${y} v-4 a5 5 0 0 1 10 0 v4`} fill="none" stroke={f} strokeWidth={2} />
      <rect x={x} y={y} width={16} height={12} rx={2} fill={f} />
    </g>
  );
}
/** A request arrow from (x1, y) toward x2, drawn by `k`, with a small label above it. */
function Req({ x1, x2, y, k, label, f = C.crema, back = 0 }: { x1: number; x2: number; y: number; k: number; label?: string; f?: string; back?: number }) {
  const x = lerp(x1, x2, k) - (x2 - x1) * 0.35 * back;
  return (
    <g opacity={k > 0 ? 1 : 0}>
      <line x1={x1} y1={y} x2={x} y2={y} stroke={f} strokeWidth={1.8} />
      <path d={`M${x} ${y} l${back > 0 ? 8 : -8} -5 v10 z`} fill={f} />
      {label && (
        <T x={(x1 + x2) / 2} y={y - 9} s={11} f={f} a="middle">
          {label}
        </T>
      )}
    </g>
  );
}

/** A batch of `n` file squares in rows of ten from (x, y), `filled` of them landed (the first `shown` drawn in), the
 * rest dashed holes. */
function Files({
  x,
  y,
  n,
  filled,
  shown = filled,
  sz = 16,
  gap = 22,
  o = 1,
  f = C.latte,
}: {
  x: number;
  y: number;
  n: number;
  filled: number;
  shown?: number;
  sz?: number;
  gap?: number;
  o?: number;
  f?: string;
}) {
  return (
    <g opacity={o}>
      {Array.from({ length: n }, (_, i) => {
        const fx = x + (i % 10) * gap;
        const fy = y + Math.floor(i / 10) * gap;
        if (i < filled) return <rect key={i} x={fx} y={fy} width={sz} height={sz} rx={2} fill={f} opacity={clamp(shown - i, 0, 1)} />;
        return <rect key={i} x={fx} y={fy} width={sz} height={sz} rx={2} fill="none" stroke={C.mocha} strokeWidth={1} strokeDasharray="3 2" />;
      })}
    </g>
  );
}

/** An empty dashed slot the size of a Cell, for an object that was never written. */
function Hole({ x, y, w, h = 28, o = 1, stroke = C.mocha }: { x: number; y: number; w: number; h?: number; o?: number; stroke?: string }) {
  return <rect x={x} y={y} width={w} height={h} rx={4} fill="none" stroke={stroke} strokeWidth={1.5} strokeDasharray="4 3" opacity={o} />;
}

// 0 · Hook. A partner job drops files into a prefix one by one; it crashes at thirty-one of forty. The reader reads
// what is there and its revenue bar stops short of the dashed truth.
export function Hook({ t }: StepCtx) {
  const shown = 31 * easeInOut(seg(t, 0.3, 2.2));
  const crash = easeOut(seg(t, 2.2, 2.5));
  const r = easeOut(seg(t, 2.8, 3.6));
  return (
    <Svg label="a producer crashes partway through a batch; a naive reader reads what landed and reports a wrong number." h={220}>
      <Cell x={25} y={56} w={150} label="partner job" stroke={crash > 0 ? C.cherryText : C.mocha} />
      <Cross x={100} y={102} k={crash} />
      {crash > 0 && (
        <T x={115} y={107} s={11} f={C.cherryText} o={crash}>
          crashed
        </T>
      )}
      <T x={200} y={22} s={11} f={C.latte}>
        landing/batch-1/
      </T>
      <Files x={200} y={30} n={40} filled={31} shown={shown} gap={24} sz={18} />
      {r > 0 && (
        <g>
          <T x={25} y={152} s={11} f={C.latte} o={r}>
            revenue the reader reports
          </T>
          <rect x={25} y={160} width={400} height={14} fill="none" stroke={C.latte} strokeWidth={1.2} strokeDasharray="4 3" />
          <rect x={25} y={160} width={310 * r} height={14} fill={C.latte} />
        </g>
      )}
      {r >= 1 && (
        <T x={435} y={172} s={11} f={C.cherryText} o={easeOut(seg(t, 3.6, 3.9))}>
          22.5% short
        </T>
      )}
      {t >= 4.0 && (
        <T x={25} y={208} s={13} f={C.latte} o={easeOut(seg(t, 4.0, 4.4))}>
          run status: no error raised
        </T>
      )}
    </Svg>
  );
}

// 1 · Predict. The same thirty-one files; the reader points only at the manifest's slot, which is empty. Once answered,
// the slot crosses out and the files dim: nothing is trusted.
export function PredictManifestGate({ t, answer }: StepCtx) {
  const s = useSinceAnswer(answer !== null);
  const v = answer !== null ? easeOut(seg(s, 0.2, 0.8)) : 0;
  const look = easeOut(seg(t, 1.0, 1.5));
  return (
    <Svg label="the identical crash, but this reader waits for a manifest written strictly last. What does it see?" h={200}>
      <Files x={25} y={30} n={40} filled={31} o={easeOut(seg(t, 0, 0.5)) * (1 - 0.65 * v)} />
      <Hole x={270} y={40} w={150} o={easeOut(seg(t, 0.4, 0.8))} stroke={v > 0 ? C.cherryText : C.mocha} />
      <T x={345} y={90} s={11} f={C.latte} a="middle" o={easeOut(seg(t, 0.5, 0.9))}>
        _manifest.json
      </T>
      <Cell x={460} y={40} w={100} label="reader" o={easeOut(seg(t, 0.6, 1.0))} />
      <Back x1={455} x2={425} y={54} k={look} />
      <Cross x={345} y={54} k={v} />
      <AnswerRow y={175} label="reader sees" answer={answer} value="nothing at all" k={easeOut(seg(t, 1.6, 2.2))} />
    </Svg>
  );
}

/** A reply arrow from x1 back left toward x2, drawn by `k`. */
function Back({ x1, x2, y, k, f = C.crema }: { x1: number; x2: number; y: number; k: number; f?: string }) {
  if (k <= 0) return null;
  const x = lerp(x1, x2, k);
  return (
    <g>
      <line x1={x1} y1={y} x2={x} y2={y} stroke={f} strokeWidth={1.8} />
      <path d={`M${x} ${y} l8 -5 v10 z`} fill={f} />
    </g>
  );
}

// 2 · No rename. The store's one atomic act, a single object write, locks in. Then a folder "rename" unfolds into a
// copy per file; it crashes halfway and the final folder holds half a batch.
export function RevealRenameUnsafe({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.2, 0.6));
  const copied = 4 * clamp(seg(t, 1.8, 3.2) * 1.0, 0, 1);
  const crash = easeOut(seg(t, 3.3, 3.6));
  return (
    <Svg label="an object store has an atomic write per object and no rename at all." h={200}>
      <T x={25} y={24} s={11} f={C.latte} o={a}>
        the only atomic operation
      </T>
      <Cell x={25} y={34} w={190} label="write one object" o={a} stroke={C.focus} />
      <Lock x={228} y={50} k={easeOut(seg(t, 0.6, 1.0))} f={C.focus} />
      <MiniTick x={256} y={46} k={easeOut(seg(t, 0.9, 1.3))} />
      <T x={25} y={100} s={11} f={C.latte} o={easeOut(seg(t, 1.3, 1.7))}>
        a folder rename becomes: copy each, then delete
      </T>
      <T x={25} y={130} s={11} f={C.latte} o={easeOut(seg(t, 1.4, 1.8))}>
        staging/
      </T>
      <T x={25} y={162} s={11} f={C.latte} o={easeOut(seg(t, 1.4, 1.8))}>
        final/
      </T>
      {Array.from({ length: 8 }, (_, i) => (
        <g key={i}>
          <rect x={110 + i * 26} y={116} width={18} height={18} rx={2} fill={C.latte} opacity={easeOut(seg(t, 1.4, 1.8))} />
          {i < copied ? (
            <rect x={110 + i * 26} y={148} width={18} height={18} rx={2} fill={C.latte} opacity={clamp(copied - i, 0, 1)} />
          ) : (
            <rect x={110 + i * 26} y={148} width={18} height={18} rx={2} fill="none" stroke={C.mocha} strokeDasharray="3 2" opacity={easeOut(seg(t, 1.4, 1.8))} />
          )}
        </g>
      ))}
      <Cross x={340} y={157} k={crash} />
      {crash > 0 && (
        <T x={355} y={162} s={11} f={C.cherryText} o={crash}>
          half a batch visible
        </T>
      )}
    </Svg>
  );
}

// 3 · Measured. Left, the crashed run: thirty-one files, no manifest, the reader trusts none. Right, the finished run:
// forty files, the manifest lands last and lists all forty.
export function RevealManifestMeasured({ t }: StepCtx) {
  const l = easeOut(seg(t, 0.2, 0.7));
  const rf = 40 * easeInOut(seg(t, 2.2, 3.2));
  const man = easeOutBack(seg(t, 3.3, 3.7));
  return (
    <Svg label="the real run: no manifest means nothing trusted; a finished batch's manifest matches it exactly." h={220}>
      <T x={25} y={24} s={11} f={C.latte} o={l}>
        crashed run
      </T>
      <Files x={25} y={36} n={40} filled={31} sz={14} gap={18} o={l} />
      <Hole x={25} y={118} w={150} o={l} />
      <T x={25} y={168} s={11} f={C.latte} o={easeOut(seg(t, 0.8, 1.2))}>
        31 files sitting there
      </T>
      <T x={25} y={192} s={13} f={C.focus} o={easeOut(seg(t, 1.3, 1.7))}>
        reader trusts none
      </T>
      <T x={320} y={24} s={11} f={C.latte} o={easeOut(seg(t, 2.0, 2.3))}>
        finished run
      </T>
      {t >= 2.0 && <Files x={320} y={36} n={40} filled={40} shown={rf} sz={14} gap={18} />}
      {t >= 2.0 && man <= 0 && <Hole x={320} y={118} w={150} />}
      {man > 0 && <Cell x={320} y={118} w={150} label="_manifest.json" o={clamp(man, 0, 1)} stroke={C.focus} />}
      {t >= 3.9 && (
        <T x={320} y={168} s={11} f={C.focus} o={easeOut(seg(t, 3.9, 4.2))}>
          lists 40 of 40
        </T>
      )}
      {t >= 3.9 && <MiniTick x={445} y={160} k={easeOut(seg(t, 4.0, 4.4))} />}
    </Svg>
  );
}

// 4 · Marker and condition. Top: twenty files, then a _SUCCESS marker drops in last. Bottom: two producers race for one
// manifest key; the condition lets A in and turns B away.
export function RevealMarkerAndConditional({ t }: StepCtx) {
  const f = 20 * easeInOut(seg(t, 0.2, 1.4));
  const mk = easeOutBack(seg(t, 1.5, 1.9));
  const race = easeOut(seg(t, 2.4, 3.0));
  const res = easeOut(seg(t, 3.1, 3.5));
  return (
    <Svg label="a marker written strictly last; a conditional write that lets only one of two racing writers win." h={220}>
      <T x={25} y={24} s={11} f={C.latte}>
        marker, written last
      </T>
      {Array.from({ length: 20 }, (_, i) => (
        <rect key={i} x={25 + i * 20} y={36} width={14} height={14} rx={2} fill={C.latte} opacity={clamp(f - i, 0, 1)} />
      ))}
      {mk <= 0 ? <Hole x={440} y={29} w={120} /> : <Cell x={440} y={29} w={120} label="_SUCCESS" o={clamp(mk, 0, 1)} stroke={C.focus} />}
      <T x={25} y={100} s={11} f={C.latte} o={easeOut(seg(t, 2.0, 2.3))}>
        conditional write
      </T>
      <Cell x={25} y={110} w={130} label="producer A" o={easeOut(seg(t, 2.0, 2.3))} />
      <Cell x={25} y={160} w={130} label="producer B" o={easeOut(seg(t, 2.0, 2.3))} stroke={res > 0 ? C.cherryText : C.mocha} />
      <Cell x={400} y={135} w={160} label="_manifest.json" o={easeOut(seg(t, 2.1, 2.4))} stroke={res > 0 ? C.focus : C.mocha} />
      <Req x1={160} x2={395} y={124} k={race} f={res > 0 ? C.focus : C.crema} />
      <Req x1={160} x2={lerp(395, 300, res)} y={174} k={race} f={res > 0 ? C.cherryText : C.crema} />
      <Cross x={315} y={174} k={res} />
      {t >= 3.6 && (
        <T x={300} y={212} s={13} f={C.focus} a="middle" o={easeOut(seg(t, 3.6, 4.0))}>
          exactly one winner
        </T>
      )}
    </Svg>
  );
}

// 5 · The race, measured. Plain write: B's write replaces A's in the slot with a 200 and no complaint. Conditional:
// B gets 412 and A's manifest stays.
export function RevealRaceMeasured({ t }: StepCtx) {
  const a1 = easeOut(seg(t, 0.3, 0.8));
  const b1 = easeOut(seg(t, 1.0, 1.5));
  const a2 = easeOut(seg(t, 2.3, 2.8));
  const b2 = easeOut(seg(t, 3.0, 3.5));
  return (
    <Svg label="the real run: a plain overwrite lets the second writer win silently; a conditional write rejects it." h={220}>
      <T x={25} y={22} s={11} f={C.latte}>
        plain write
      </T>
      <Cell x={25} y={32} w={70} label="A" />
      <Cell x={25} y={70} w={70} label="B" />
      <Req x1={100} x2={325} y={46} k={a1} />
      <Req x1={100} x2={325} y={84} k={b1} label={b1 >= 1 ? 'B: 200, no error' : undefined} f={b1 >= 1 ? C.cherryText : C.crema} />
      {a1 >= 1 && <Cell x={330} y={50} w={220} label={b1 >= 1 ? 'producer-B-manifest' : 'producer-A-manifest'} stroke={b1 >= 1 ? C.cherryText : C.mocha} />}
      {b1 >= 1 && (
        <T x={440} y={100} s={11} f={C.cherryText} a="middle" o={easeOut(seg(t, 1.5, 1.8))}>
          A's work gone
        </T>
      )}
      {t >= 2.0 && (
        <g opacity={easeOut(seg(t, 2.0, 2.3))}>
          <T x={25} y={132} s={11} f={C.latte}>
            conditional write
          </T>
          <Cell x={25} y={142} w={70} label="A" />
          <Cell x={25} y={180} w={70} label="B" />
        </g>
      )}
      <Req x1={100} x2={325} y={156} k={a2} />
      <Req x1={100} x2={lerp(325, 250, easeOut(seg(t, 3.5, 3.8)))} y={194} k={b2} label={b2 >= 1 ? 'B: 412, rejected' : undefined} f={b2 >= 1 ? C.focus : C.crema} />
      {a2 >= 1 && <Cell x={330} y={160} w={220} label="producer-A-manifest" stroke={b2 >= 1 ? C.focus : C.mocha} />}
    </Svg>
  );
}

// 6 · Poison files. Files ride to a validation gate; good ones pass to landed, the bad one drops into quarantine with
// its reason tag. Then the two wrong answers cross out: retry forever, skip and keep going.
export function RevealPoisonFiles({ t }: StepCtx) {
  const mv = (i: number) => easeInOut(seg(t, 0.3 + i * 0.5, 1.0 + i * 0.5));
  const bad = 1;
  const drop = easeInOut(seg(t, 1.5, 2.1));
  return (
    <Svg label="a file that fails validation is moved aside with its own reason, never retried forever." h={200}>
      <T x={220} y={22} s={11} f={C.latte} a="middle">
        validate
      </T>
      <line x1={220} y1={30} x2={220} y2={96} stroke={C.focus} strokeWidth={2} strokeDasharray="5 4" />
      <Cell x={420} y={48} w={130} label="landed" stroke={C.focus} />
      {[0, 1, 2].map((i) => {
        const p = mv(i);
        if (i === bad) {
          const x = lerp(40, 205, Math.min(p, 1));
          return p > 0 && drop < 1 ? <rect key={i} x={lerp(x, 160, drop)} y={lerp(55, 135, drop)} width={18} height={18} rx={2} fill={C.bad} stroke={C.cherryText} /> : null;
        }
        const x = lerp(40, 395, p);
        return p < 1 ? <rect key={i} x={x} y={55} width={18} height={18} rx={2} fill={C.latte} opacity={p > 0 ? 1 : 0.6} /> : null;
      })}
      <Cell x={150} y={130} w={150} label="quarantine" o={easeOut(seg(t, 1.3, 1.6))} stroke={C.cherryText} />
      {drop >= 1 && (
        <T x={225} y={180} s={11} f={C.cherryText} a="middle" o={easeOut(seg(t, 2.1, 2.4))}>
          + the reason it failed
        </T>
      )}
      {t >= 2.9 && (
        <g opacity={easeOut(seg(t, 2.9, 3.2))}>
          <T x={430} y={140} s={11} f={C.latte}>
            retry forever
          </T>
          <T x={430} y={170} s={11} f={C.latte}>
            skip, keep going
          </T>
        </g>
      )}
      <Cross x={415} y={136} k={easeOut(seg(t, 3.3, 3.6))} />
      <Cross x={415} y={166} k={easeOut(seg(t, 3.7, 4.0))} />
    </Svg>
  );
}

// 7 · Quarantine, measured. Three real files checked in turn: two land, part-001 is quarantined, and its exact reason
// types out beneath.
export function RevealQuarantineMeasured({ t }: StepCtx) {
  const names = ['part-000.json', 'part-001.json', 'part-002.json'];
  const chk = (i: number) => easeOut(seg(t, 0.5 + i * 0.8, 1.0 + i * 0.8));
  const reason = 'amount field is not numeric';
  const typed = Math.round(reason.length * seg(t, 3.0, 4.0));
  return (
    <Svg label="the real run: one file fails on its own field and is quarantined with that exact reason." h={220}>
      {names.map((n, i) => (
        <g key={i}>
          <Cell x={25} y={20 + i * 45} w={170} label={n} o={easeOut(seg(t, i * 0.15, 0.4 + i * 0.15))} />
          <Req x1={200} x2={370} y={34 + i * 45} k={chk(i)} f={i === 1 ? C.cherryText : C.focus} />
          <Cell x={380} y={20 + i * 45} w={170} label={i === 1 ? 'quarantined' : 'landed'} o={easeOut(seg(t, 0.9 + i * 0.8, 1.2 + i * 0.8))} stroke={i === 1 ? C.cherryText : C.focus} />
        </g>
      ))}
      {typed > 0 && (
        <T x={25} y={180} s={13} f={C.cherryText}>
          {`reason: ${reason.slice(0, typed)}`}
        </T>
      )}
    </Svg>
  );
}

// 8 · Timing. Top lane: the bad file is caught the moment it lands. Bottom lane: it lands silently and run after run
// passes it by, until a late run finally touches the broken column.
export function RevealSchemaTiming({ t }: StepCtx) {
  const runs = Math.floor(30 * seg(t, 0.9, 3.6));
  const hit = easeOut(seg(t, 3.7, 4.1));
  return (
    <Svg label="the identical malformed file, caught immediately in one case, left untouched in the other." h={200}>
      <T x={25} y={24} s={11} f={C.latte}>
        check when it lands
      </T>
      <rect x={25} y={40} width={18} height={18} rx={2} fill={C.bad} stroke={C.cherryText} opacity={easeOut(seg(t, 0.2, 0.5))} />
      <circle cx={34} cy={49} r={16} fill="none" stroke={C.cherryText} strokeWidth={2} opacity={easeOut(seg(t, 0.6, 0.9))} />
      <T x={62} y={54} s={11} f={C.cherryText} o={easeOut(seg(t, 0.7, 1.0))}>
        caught now, context fresh
      </T>
      <T x={25} y={104} s={11} f={C.latte} o={easeOut(seg(t, 0.3, 0.6))}>
        check when it is read
      </T>
      <rect x={25} y={120} width={18} height={18} rx={2} fill={C.bad} stroke={C.cherryText} opacity={easeOut(seg(t, 0.4, 0.7))} />
      {Array.from({ length: runs }, (_, i) => (
        <circle key={i} cx={62 + i * 16} cy={129} r={4} fill={C.mocha} />
      ))}
      {hit > 0 && <circle cx={62 + 30 * 16} cy={129} r={7 * hit} fill={C.cherryText} />}
      {hit > 0 && (
        <T x={545} y={164} s={11} f={C.cherryText} a="end" o={hit}>
          found much later
        </T>
      )}
    </Svg>
  );
}

// 9 · Timing, measured. Caught at landing: zero runs, a single dot. Caught on read: a cherry bar counts up to ninety
// runs of delay.
export function RevealTimingMeasured({ t }: StepCtx) {
  const k = easeInOut(seg(t, 1.2, 3.4));
  return (
    <Svg label="the real run: caught instantly at landing versus unnoticed for dozens of runs before detection." h={220}>
      <Row y={50} label="caught at landing" value="0 runs" valueColor={C.focus} k={easeOut(seg(t, 0.1, 0.5))} />
      <circle cx={30} cy={72} r={5} fill={C.focus} opacity={easeOut(seg(t, 0.4, 0.7))} />
      <Row y={120} label="caught on read" value={`${num(90 * k)} runs`} valueColor={C.cherryText} k={easeOut(seg(t, 0.9, 1.2))} />
      <rect x={25} y={136} width={520 * k} height={12} fill={C.bad} stroke={C.cherryText} strokeWidth={1} opacity={k > 0 ? 1 : 0} />
      {t >= 3.6 && (
        <T x={300} y={195} s={13} f={C.latte} a="middle" o={easeOut(seg(t, 3.6, 4.0))}>
          the same bug, ninety runs apart
        </T>
      )}
    </Svg>
  );
}

// 10 · Recap. Three problems, each with an arrow to its fix; a brace under all three gathers them into the one
// property every source needed.
export function Recap({ t }: StepCtx) {
  const probs = ['half-finished commit', 'a bad file', 'schema check'];
  const fixes = ['a commit signal', 'quarantine + reason', 'a timing choice'];
  const br = easeOut(seg(t, 2.5, 3.1));
  return (
    <Svg label="three commit protocols, one quarantine rule, one timing tradeoff — the shared property underneath." h={260}>
      {probs.map((p, i) => (
        <g key={i}>
          <Cell x={25} y={20 + i * 48} w={210} label={p} o={easeOut(seg(t, 0.2 + i * 0.6, 0.6 + i * 0.6))} stroke={C.cherryText} />
          <Req x1={240} x2={338} y={34 + i * 48} k={easeOut(seg(t, 0.4 + i * 0.6, 0.8 + i * 0.6))} />
          <Cell x={345} y={20 + i * 48} w={210} label={fixes[i]} o={easeOut(seg(t, 0.6 + i * 0.6, 0.9 + i * 0.6))} stroke={C.focus} />
        </g>
      ))}
      {br > 0 && <path d={`M25 172 v8 h${530 * br} v-8`} fill="none" stroke={C.focus} strokeWidth={2} />}
      {br >= 1 && <line x1={290} y1={180} x2={290} y2={196} stroke={C.focus} strokeWidth={2} />}
      <Cell x={175} y={198} w={230} label="one shared property" o={easeOut(seg(t, 3.2, 3.6))} stroke={C.focus} f={C.focus} />
    </Svg>
  );
}

// 11 · Prove it. Listing's LIST calls grow with the prefix: one call at five hundred objects, fifty at fifty thousand.
// Notifications name each object, with repeats; once answered, the repeats cross out under a dedup by key.
export function ProveIt({ t, answer }: StepCtx) {
  const s = useSinceAnswer(answer !== null);
  const v = answer !== null ? easeOut(seg(s, 0.2, 0.8)) : 0;
  const ev = ['obj-1', 'obj-2', 'obj-1', 'obj-3', 'obj-2', 'obj-2'];
  const dup = [false, false, true, false, true, true];
  const g = easeOut(seg(t, 0.4, 1.2));
  return (
    <Svg label="notifications arrive at least once; listing pays a cost that grows with the prefix. Which wins?" h={200}>
      <T x={25} y={20} s={11} f={C.latte}>
        listing: LIST calls
      </T>
      <rect x={25} y={30} width={8} height={10} fill={C.latte} opacity={g > 0 ? 1 : 0} />
      <T x={45} y={40} s={11} f={C.latte} o={g}>
        500 objects: 1
      </T>
      <rect x={25} y={52} width={400 * g} height={10} fill={C.cherryText} />
      <T x={435} y={62} s={11} f={C.cherryText} o={g}>
        50,000: 50
      </T>
      <T x={25} y={98} s={11} f={C.latte} o={easeOut(seg(t, 1.0, 1.3))}>
        notifications, at least once
      </T>
      {ev.map((e, i) => (
        <g key={i}>
          <Cell x={25 + i * 90} y={108} w={80} label={e} o={easeOut(seg(t, 1.1 + i * 0.1, 1.4 + i * 0.1)) * (dup[i] ? 1 - 0.6 * v : 1)} stroke={dup[i] && v > 0 ? C.cherryText : C.mocha} />
          {dup[i] && <Cross x={65 + i * 90} y={148} k={v} />}
        </g>
      ))}
      <AnswerRow y={182} label="safer choice" answer={answer} value="notifications" k={easeOut(seg(t, 1.8, 2.3))} />
    </Svg>
  );
}
