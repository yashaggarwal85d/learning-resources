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
function Pip({ x, y, o = 1, f = C.second, s = 10 }: { x: number; y: number; o?: number; f?: string; s?: number }) {
  return <rect x={x - s / 2} y={y - s / 2} width={s} height={s} rx={2} fill={f} opacity={o} />;
}

function Hole({ x, y, w, h = 28, o = 1, stroke = C.mocha }: { x: number; y: number; w: number; h?: number; o?: number; stroke?: string }) {
  return <rect x={x} y={y} width={w} height={h} rx={4} fill="none" stroke={stroke} strokeWidth={1.5} strokeDasharray="4 3" opacity={o} />;
}
/** A fan line from (x1, y1) to (x2, y2), drawn by `k`, ending in a dot. */
/** A fan line from (x1, y1) to (x2, y2), drawn by `k`, ending in a dot. */
function Fan({ x1, y1, x2, y2, k, f = C.crema }: { x1: number; y1: number; x2: number; y2: number; k: number; f?: string }) {
  if (k <= 0) return null;
  const x = lerp(x1, x2, k);
  const y = lerp(y1, y2, k);
  return (
    <g>
      <line x1={x1} y1={y1} x2={x} y2={y} stroke={f} strokeWidth={1.6} />
      <circle cx={x} cy={y} r={3} fill={f} />
    </g>
  );
}

// Every value here is examples.py's own: the table's part-0 to part-2 files and manifest.json, the 3 files missing before
// the path rewrite and 0 after, the catalog lookup for orders returning None, the Fernet ciphertext of customer-order-row
// failing with InvalidToken under the wrong key, the 20-second RTO target, and the 300 and 86,400-second tier RPO targets.

const PARTS = ['part-0', 'part-1', 'part-2'];

/** A small key: a ring and a toothed shaft, drawn by `k`. */
function Key({ x, y, k, f = C.caramel }: { x: number; y: number; k: number; f?: string }) {
  return (
    <g opacity={k}>
      <circle cx={x} cy={y} r={6} fill="none" stroke={f} strokeWidth={2} />
      <path d={`M${x + 6} ${y} h16 m-5 0 v5 m-4 -5 v4`} fill="none" stroke={f} strokeWidth={2} />
    </g>
  );
}

/** Ciphertext as scrambled bars. */
function Cipher({ x, y, o }: { x: number; y: number; o: number }) {
  const w = [40, 22, 55, 30, 46, 18];
  return (
    <g opacity={o}>
      {w.map((ww, i) => (
        <rect key={i} x={x + (i % 3) * 50} y={y + Math.floor(i / 3) * 14} width={ww * 0.8} height={6} rx={1} fill={C.caramel} />
      ))}
    </g>
  );
}

// 0 · Nightly copies fly from the primary region's files to the second region. The catalog never goes. The primary region
// fails: every byte survived, and nothing points at it.
export function Hook({ t }: StepCtx) {
  const k = (d: number) => easeOut(seg(t, d, d + 0.35));
  const down = t > 2.6;
  return (
    <Svg label="the bytes replicated. the catalog did not." h={250}>
      <T x={25} y={32} s={11} f={C.taupe} o={k(0)}>
        primary region
      </T>
      <rect x={25} y={40} width={240} height={130} rx={6} fill="none" stroke={down ? C.cherryText : C.mocha} strokeWidth={1.5} opacity={k(0)} />
      <g opacity={down ? 0.35 : 1}>
        {PARTS.map((p, i) => (
          <Cell key={p} x={38 + i * 74} y={60} w={66} label={p} o={k(0.1)} />
        ))}
        <Cell x={38} y={120} w={214} label="catalog database" o={k(0.2)} />
      </g>
      <Cross x={250} y={52} k={k(2.6)} />
      <T x={335} y={32} s={11} f={C.taupe} o={k(0.3)}>
        second region
      </T>
      <rect x={335} y={40} width={240} height={130} rx={6} fill="none" stroke={C.mocha} strokeWidth={1.5} opacity={k(0.3)} />
      {PARTS.map((p, i) => {
        const m = easeInOut(seg(t, 0.5 + i * 0.3, 1.1 + i * 0.3));
        return (
          <g key={p}>
            {m > 0 && m < 1 && <Pip x={lerp(71 + i * 74, 381 + i * 74, m)} y={lerp(74, 40 + 34 * (1 - Math.sin(Math.PI * m)), m) - 20 * Math.sin(Math.PI * m)} s={9} f={C.second} />}
            <Cell x={348 + i * 74} y={60} w={66} label={p} o={m >= 1 ? 1 : 0} stroke={C.second} />
          </g>
        );
      })}
      <Hole x={348} y={120} w={214} o={k(1.8)} stroke={C.cherryText} />
      {t > 2.0 && (
        <T x={455} y={138} s={11} f={C.cherryText} a="middle" o={k(2.0)}>
          never backed up
        </T>
      )}
      {t > 3.2 && (
        <T x={25} y={210} s={12} f={C.focus} o={k(3.2)}>
          every byte survived
        </T>
      )}
      {t > 3.8 && (
        <T x={25} y={234} s={12} f={C.cherryText} o={k(3.8)}>
          none of it points at anything usable
        </T>
      )}
    </Svg>
  );
}

// 1 · Predict. Every file now sits in the second region. Is the table safe? Once answered, the files are ticked and the
// metadata that finds them shows up as a dashed gap.
export function PredictBytesEnough({ t, answer }: StepCtx) {
  const s = useSinceAnswer(answer !== null);
  const v = answer !== null ? easeOut(seg(s, 0.1, 0.6)) : 0;
  const k = (d: number) => easeOut(seg(t, d, d + 0.3));
  return (
    <Svg label="if the bytes all replicated cleanly, is the table safe?" h={250}>
      <T x={25} y={56} s={11} f={C.taupe} o={k(0)}>
        every file, copied
      </T>
      {PARTS.map((p, i) => (
        <g key={p}>
          <Cell x={25 + i * 80} y={70} w={70} label={p} o={k(0.1 + i * 0.1)} stroke={C.second} />
          <MiniTick x={52 + i * 80} y={116} k={v} />
        </g>
      ))}
      {v <= 0.5 && <Cell x={330} y={70} w={245} label="the table, safe?" o={k(0.5)} />}
      {v > 0.5 && <Cell x={330} y={70} w={245} label="data files: here" stroke={C.focus} f={C.focus} />}
      <Hole x={330} y={110} w={245} o={v} stroke={C.cherryText} />
      {v > 0.5 && (
        <T x={452} y={128} s={11} f={C.cherryText} a="middle" o={v}>
          the metadata that finds them
        </T>
      )}
      {answer === null && t > 1.0 && (
        <T x={300} y={190} s={15} f={C.taupe} a="middle" o={k(1.0)}>
          ?
        </T>
      )}
      <Verdict answer={answer} text="no: a table needs more than its files" y={222} />
    </Svg>
  );
}

// 2 · The copied manifest's three paths still name the primary region, so their arrows end at a dead box: 3 missing. The
// paths are rewritten to the second region and the arrows land on the local files: 0 missing.
export function RevealManifestPaths({ t }: StepCtx) {
  const k = (d: number) => easeOut(seg(t, d, d + 0.35));
  const fixed = t > 2.6;
  return (
    <Svg label="the manifest still points at the old region." h={250}>
      <T x={25} y={36} s={11} f={C.taupe} o={k(0)}>
        manifest.json, in the second region
      </T>
      {PARTS.map((p, i) => (
        <g key={p}>
          {!fixed && (
            <T x={25} y={64 + i * 22} s={11} f={C.cherryText} o={k(0.2 + i * 0.1)}>
              {`primary-region/data/${p}.parquet`}
            </T>
          )}
          {fixed && (
            <T x={25} y={64 + i * 22} s={11} f={C.focus} o={k(2.6 + i * 0.1)}>
              {`secondary-region/data/${p}.parquet`}
            </T>
          )}
          <Fan x1={330} y1={60 + i * 22} x2={474} y2={fixed ? 140 + i * 26 : 75} k={fixed ? k(2.8 + i * 0.1) : k(0.8 + i * 0.1)} f={fixed ? C.focus : C.cherryText} />
          <Cell x={480} y={130 + i * 26} w={95} h={20} label={p} o={k(0.4)} stroke={fixed ? C.focus : C.mocha} />
        </g>
      ))}
      <rect x={480} y={40} width={95} height={70} rx={4} fill="none" stroke={C.cherryText} strokeWidth={1.5} strokeDasharray="4 3" opacity={k(0.6) * (fixed ? 0.3 : 1)} />
      <T x={527} y={80} s={11} f={C.cherryText} a="middle" o={k(0.6) * (fixed ? 0.3 : 1)}>
        gone
      </T>
      {!fixed && t > 1.4 && (
        <T x={25} y={150} s={12} f={C.cherryText} o={k(1.4)}>
          3 files missing
        </T>
      )}
      {fixed && (
        <T x={25} y={150} s={12} f={C.focus} o={k(3.1)}>
          0 missing, after the rewrite
        </T>
      )}
      {t > 3.9 && (
        <T x={25} y={226} s={12} f={C.crema} o={k(3.9)}>
          copy the bytes, and the paths still name the old region
        </T>
      )}
    </Svg>
  );
}

// 3 · The bucket's files replicate to the second region; the catalog, sitting outside the bucket, never does. Looked up
// there, orders returns None.
export function RevealCatalog({ t }: StepCtx) {
  const k = (d: number) => easeOut(seg(t, d, d + 0.35));
  return (
    <Svg label="same files, same bytes -- but no catalog, no table." h={250}>
      <T x={25} y={32} s={11} f={C.taupe} o={k(0)}>
        the bucket
      </T>
      <rect x={25} y={40} width={250} height={80} rx={6} fill="none" stroke={C.mocha} strokeWidth={1.5} opacity={k(0)} />
      <Cell x={38} y={52} w={125} label="manifest.json" o={k(0.1)} />
      {[0, 1, 2].map((i) => (
        <Pip key={i} x={185 + i * 26} y={66} s={12} f={C.crema} o={k(0.2)} />
      ))}
      <Cell x={25} y={150} w={250} label="catalog: orders, manifest" o={k(0.4)} stroke={C.focus} />
      <Fan x1={280} y1={80} x2={329} y2={80} k={k(0.8)} f={C.second} />
      <rect x={335} y={40} width={240} height={80} rx={6} fill="none" stroke={C.second} strokeWidth={1.5} opacity={k(0.9)} />
      <Cell x={348} y={52} w={125} label="manifest.json" o={k(1.2)} stroke={C.second} />
      {[0, 1, 2].map((i) => (
        <Pip key={i} x={495 + i * 26} y={66} s={12} f={C.second} o={k(1.3)} />
      ))}
      <Hole x={335} y={150} w={240} o={k(1.8)} stroke={C.cherryText} />
      {t > 1.8 && (
        <T x={455} y={168} s={11} f={C.cherryText} a="middle" o={k(1.8)}>
          catalog: never copied
        </T>
      )}
      {t > 2.6 && (
        <T x={335} y={210} s={12} f={C.cherryText} o={k(2.6)}>
          lookup orders: None
        </T>
      )}
      {t > 3.6 && (
        <T x={25} y={238} s={11} f={C.crema} o={k(3.6)}>
          the files are intact, and nothing can find them
        </T>
      )}
    </Svg>
  );
}

// 4 · Predict. The ciphertext made it to the second region; the key stayed in the first. Must it travel? Once answered, the
// key moves across and the scrambled bars resolve into the row.
export function PredictKeyMatters({ t, answer }: StepCtx) {
  const s = useSinceAnswer(answer !== null);
  const v = answer !== null ? easeInOut(seg(s, 0.1, 0.8)) : 0;
  const k = (d: number) => easeOut(seg(t, d, d + 0.3));
  return (
    <Svg label="the bytes replicated. did the key?" h={250}>
      <T x={25} y={42} s={11} f={C.taupe} o={k(0)}>
        primary
      </T>
      <rect x={25} y={50} width={200} height={100} rx={6} fill="none" stroke={C.mocha} strokeWidth={1.5} opacity={k(0)} />
      <T x={375} y={42} s={11} f={C.taupe} o={k(0.1)}>
        second region
      </T>
      <rect x={375} y={50} width={200} height={100} rx={6} fill="none" stroke={C.mocha} strokeWidth={1.5} opacity={k(0.1)} />
      <Key x={lerp(100, 400, v)} y={100} k={k(0.3)} />
      <Cipher x={440} y={88} o={k(0.4) * (1 - v)} />
      {v > 0.8 && (
        <T x={430} y={130} s={11} f={C.focus} o={v}>
          customer-order-row
        </T>
      )}
      {answer === null && t > 1.0 && (
        <T x={300} y={190} s={15} f={C.taupe} a="middle" o={k(1.0)}>
          ?
        </T>
      )}
      <Verdict answer={answer} text="yes: the key has to travel too" y={222} />
    </Svg>
  );
}

// 5 · The same ciphertext, two keys. A region-scoped key fails with InvalidToken. The multi-region key, the same material in
// both places, decrypts it to the row.
export function RevealMultiRegionKey({ t }: StepCtx) {
  const k = (d: number) => easeOut(seg(t, d, d + 0.35));
  return (
    <Svg label="same ciphertext. one key fails. one key works." h={250}>
      <Key x={36} y={60} k={k(0)} />
      <T x={70} y={64} s={12} f={C.crema} o={k(0)}>
        region-scoped key
      </T>
      <Fan x1={240} y1={60} x2={294} y2={60} k={k(0.5)} />
      <Cell x={300} y={46} w={130} label="ciphertext" o={k(0.3)} stroke={C.caramel} />
      <Fan x1={435} y1={60} x2={474} y2={60} k={k(0.9)} f={C.cherryText} />
      <Cross x={490} y={60} k={k(1.2)} />
      {t > 1.3 && (
        <T x={300} y={96} s={11} f={C.cherryText} o={k(1.3)}>
          InvalidToken: it fails
        </T>
      )}
      <Key x={36} y={150} k={k(1.8)} f={C.focus} />
      <T x={70} y={154} s={12} f={C.crema} o={k(1.8)}>
        multi-region key
      </T>
      <Fan x1={240} y1={150} x2={294} y2={150} k={k(2.3)} f={C.focus} />
      <Cell x={300} y={136} w={130} label="ciphertext" o={k(2.0)} stroke={C.caramel} />
      <Fan x1={435} y1={150} x2={474} y2={150} k={k(2.7)} f={C.focus} />
      <MiniTick x={484} y={150} k={k(3.0)} />
      {t > 3.0 && (
        <T x={300} y={186} s={11} f={C.focus} o={k(3.0)}>
          customer-order-row
        </T>
      )}
      {t > 3.8 && (
        <T x={25} y={232} s={12} f={C.crema} o={k(3.8)}>
          the same key material, in both places
        </T>
      )}
    </Svg>
  );
}

// 6 · A stolen admin reaches for two backups. The ordinary one is deleted outright; the compliance-mode WORM copy refuses
// the same request behind its lock.
export function RevealImmutableBackup({ t }: StepCtx) {
  const k = (d: number) => easeOut(seg(t, d, d + 0.35));
  const del = easeOut(seg(t, 1.4, 1.8));
  return (
    <Svg label="stolen admin credentials delete one backup, not the other." h={250}>
      <Cell x={25} y={100} w={150} label="stolen admin" o={k(0)} stroke={C.cherryText} />
      <Fan x1={180} y1={110} x2={374} y2={54} k={k(0.8)} f={C.cherryText} />
      <Cell x={380} y={40} w={195} label="ordinary backup" o={k(0.3) * (1 - del)} />
      <Hole x={380} y={40} w={195} o={del} stroke={C.cherryText} />
      {t > 1.6 && (
        <T x={380} y={92} s={11} f={C.cherryText} o={k(1.6)}>
          deleted
        </T>
      )}
      <Fan x1={180} y1={118} x2={374} y2={164} k={k(2.2)} f={C.cherryText} />
      <Cell x={380} y={150} w={195} label="compliance-mode WORM" o={k(0.5)} stroke={t > 2.6 ? C.focus : C.mocha} />
      <Lock x={278} y={198} k={k(2.6)} f={C.focus} />
      {t > 2.6 && (
        <T x={300} y={208} s={11} f={C.focus} o={k(2.6)}>
          refused, until retention runs out
        </T>
      )}
      {t > 3.9 && (
        <T x={25} y={240} s={11} f={C.taupe} o={k(3.9)}>
          built for the moment the access itself is stolen
        </T>
      )}
    </Svg>
  );
}

// 7 · The RTO target is a dashed line on a page; a real timed restore bar grows and stops short of it. Then DORA turns the
// drill into a row of recurring ticks.
export function RevealRestoreDrill({ t }: StepCtx) {
  const k = (d: number) => easeOut(seg(t, d, d + 0.35));
  const run = easeOut(seg(t, 0.8, 2.2));
  return (
    <Svg label="a number on a page, or a number from a real drill." h={250}>
      <T x={25} y={40} s={12} f={C.taupe} o={k(0)}>
        a target on a page
      </T>
      <line x1={400} y1={50} x2={400} y2={120} stroke={C.caramel} strokeWidth={1.8} strokeDasharray="4 3" opacity={k(0.3)} />
      <T x={400} y={138} s={11} f={C.caramel} a="middle" o={k(0.3)}>
        RTO: 20 seconds
      </T>
      <rect x={25} y={70} width={300 * run} height={18} rx={2} fill={C.second} opacity={run > 0 ? 1 : 0} />
      {t > 2.2 && (
        <T x={25} y={110} s={11} f={C.focus} o={k(2.2)}>
          a real, timed restore
        </T>
      )}
      <T x={25} y={176} s={12} f={C.crema} o={k(2.8)}>
        DORA: the drill, as a standing obligation
      </T>
      {Array.from({ length: 8 }, (_, i) => (
        <line key={i} x1={30 + i * 40} y1={192} x2={30 + i * 40} y2={204} stroke={C.focus} strokeWidth={2} opacity={k(3.2 + i * 0.1)} />
      ))}
      {t > 4.0 && (
        <T x={25} y={236} s={11} f={C.taupe} o={k(4.0)}>
          routine proof, not theory
        </T>
      )}
    </Svg>
  );
}

// 8 · Recap. Tier targets across the top, then four systems that each need their own plan, ticked one by one.
export function Recap({ t }: StepCtx) {
  const k = (d: number) => easeOut(seg(t, d, d + 0.35));
  const pts = ['manifest paths', 'the catalog', 'the encryption key', 'stream offsets'];
  return (
    <Svg label="four failure modes. one proof: a timed drill." h={250}>
      <T x={25} y={36} s={12} f={C.crema} o={k(0)}>
        RPO by tier
      </T>
      <T x={150} y={36} s={12} f={C.caramel} o={k(0.2)}>
        critical: 300 s
      </T>
      <T x={330} y={36} s={12} f={C.second} o={k(0.4)}>
        analytics: 86,400 s
      </T>
      {pts.map((p, i) => {
        const d = 0.8 + i * 0.5;
        const x = 25 + (i % 2) * 285;
        const y = 60 + Math.floor(i / 2) * 50;
        return (
          <g key={p}>
            <Cell x={x} y={y} w={265} label={p} o={k(d)} />
            <MiniTick x={x + 238} y={y + 14} k={k(d + 1.2)} />
          </g>
        );
      })}
      {t > 2.8 && (
        <T x={25} y={180} s={11} f={C.focus} o={k(2.8)}>
          each needs its own plan; a bucket copy is not one
        </T>
      )}
      {t > 3.6 && (
        <T x={300} y={226} s={12} f={C.crema} a="middle" o={k(3.6)}>
          proven only by a timed restore
        </T>
      )}
    </Svg>
  );
}

// 9 · Prove it. A region-scoped key against the real ciphertext. Once answered, it fails with InvalidToken, and the
// multi-region key appears beneath it and decrypts the same bytes.
export function ProveIt({ t, answer }: StepCtx) {
  const s = useSinceAnswer(answer !== null);
  const v = answer !== null ? easeOut(seg(s, 0.1, 0.5)) : 0;
  const w = answer !== null ? easeOut(seg(s, 0.6, 1.0)) : 0;
  const k = (d: number) => easeOut(seg(t, d, d + 0.3));
  return (
    <Svg label="real files, real keys, real failures -- and real fixes." h={250}>
      <Key x={36} y={80} k={k(0)} />
      <T x={70} y={84} s={12} f={C.crema} o={k(0)}>
        region-scoped key
      </T>
      <Fan x1={240} y1={80} x2={294} y2={80} k={k(0.4)} />
      <Cell x={300} y={66} w={130} label="ciphertext" o={k(0.3)} stroke={C.caramel} />
      <Cross x={460} y={80} k={v} />
      {v > 0.5 && (
        <T x={300} y={116} s={11} f={C.cherryText} o={v}>
          InvalidToken
        </T>
      )}
      <Key x={36} y={150} k={w} f={C.focus} />
      <T x={70} y={154} s={12} f={C.focus} o={w}>
        multi-region key
      </T>
      <MiniTick x={454} y={150} k={w} />
      {w > 0.5 && (
        <T x={300} y={176} s={11} f={C.focus} o={w}>
          customer-order-row
        </T>
      )}
      {answer === null && t > 1.0 && (
        <T x={480} y={90} s={15} f={C.taupe} a="middle" o={k(1.0)}>
          ?
        </T>
      )}
      <Verdict answer={answer} text="it fails, exactly as claimed" y={222} />
    </Svg>
  );
}
