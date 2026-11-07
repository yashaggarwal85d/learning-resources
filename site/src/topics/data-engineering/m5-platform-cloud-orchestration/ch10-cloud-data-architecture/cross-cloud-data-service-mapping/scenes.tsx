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

// Every product name here is quoted from that vendor's own current documentation; see SOURCES.md.

// 0 · Hook. The posting's two unfamiliar names drop out of it and land in a familiar two-row table, each beside the AWS
// name the engineer already knows for the same job.
export function UnrelatedJobPosting({ t }: StepCtx) {
  const k = (d: number) => easeOut(seg(t, d, d + 0.35));
  const d1 = easeInOut(seg(t, 1.0, 1.7));
  const d2 = easeInOut(seg(t, 1.5, 2.2));
  return (
    <Svg label="A job posting's unfamiliar names resolving into a familiar two-row table" h={250}>
      <rect x={25} y={20} width={550} height={52} rx={6} fill="none" stroke={C.mocha} strokeWidth={1.5} opacity={k(0)} />
      <T x={37} y={40} s={11} f={C.latte} o={k(0)}>
        wanted: experience with
      </T>
      {d1 < 1 ? <Cell x={lerp(37, 400, clamp(d1 * 2))} y={lerp(46, 116, clamp(d1 * 2 - 1))} w={150} h={22} label="OneLake" o={k(0.3)} stroke={C.cherryText} /> : null}
      {d2 < 1 ? <Cell x={lerp(200, 400, clamp(d2 * 2))} y={lerp(46, 166, clamp(d2 * 2 - 1))} w={170} h={22} label="Knowledge Catalog" o={k(0.5)} stroke={C.cherryText} /> : null}
      {t > 2.3 && (
        <>
          <T x={25} y={100} s={11} f={C.latte} o={k(2.3)}>
            the job
          </T>
          <T x={190} y={100} s={11} f={C.latte} o={k(2.3)}>
            already known
          </T>
          <T x={400} y={100} s={11} f={C.latte} o={k(2.3)}>
            the posting's name
          </T>
        </>
      )}
      {[
        ['storage', 'S3', 'OneLake', d1],
        ['catalog', 'Lake Formation', 'Knowledge Catalog', d2],
      ].map(([job, known, name, d], i) => (
        <g key={job as string}>
          <T x={25} y={130 + i * 50} s={12} f={C.crema} o={k(0.7)}>
            {job as string}
          </T>
          <Cell x={190} y={112 + i * 50} w={170} label={known as string} o={k(0.8)} />
          {(d as number) >= 1 ? <Cell x={400} y={112 + i * 50} w={170} label={name as string} stroke={C.focus} f={C.focus} /> : <Hole x={400} y={112 + i * 50} w={170} o={k(0.8)} />}
        </g>
      ))}
      {t > 2.6 && (
        <T x={300} y={234} s={12} f={C.focus} a="middle" o={k(2.6)}>
          two rows you already understand
        </T>
      )}
    </Svg>
  );
}

// 1 · Predict. Four layers move from one cloud to another, each as a pip crossing the gap; all stop at the border, waiting.
// Once answered, compute, storage and streaming cross over, and catalog plus identity stays locked behind.
export function WhichLayerCarriesCost({ t, answer }: StepCtx) {
  const s = useSinceAnswer(answer !== null);
  const v = answer !== null ? easeInOut(seg(s, 0.1, 0.8)) : 0;
  const k = (d: number) => easeOut(seg(t, d, d + 0.3));
  const layers = ['compute', 'catalog + identity', 'storage', 'streaming'];
  const go = easeInOut(seg(t, 0.2, 1.0));
  return (
    <Svg label="Four candidate layers in a grid, with catalog and identity lit once the answer is revealed" h={250}>
      <T x={25} y={28} s={12} f={C.latte} o={k(0)}>
        cloud A
      </T>
      <T x={415} y={28} s={12} f={C.latte} o={k(0)}>
        cloud B
      </T>
      <line x1={300} y1={36} x2={300} y2={204} stroke={C.mocha} strokeWidth={1.5} strokeDasharray="4 4" />
      {layers.map((l, i) => {
        const y = 40 + i * 42;
        const hit = i === 1;
        const x = hit ? lerp(195, 285, go) : lerp(195, 285, go) + 115 * v;
        return (
          <g key={l}>
            <Cell x={25} y={y} w={160} label={l} o={k(i * 0.1)} stroke={hit && v > 0.5 ? C.cherryText : C.mocha} f={hit && v > 0.5 ? C.cherryText : C.crema} />
            {!hit && v >= 1 ? <Cell x={415} y={y} w={160} label={l} stroke={C.focus} f={C.focus} /> : <Hole x={415} y={y} w={160} o={k(i * 0.1)} />}
            {!(v >= 1 && !hit) && <Pip x={x} y={y + 14} s={9} f={hit && v > 0.5 ? C.cherryText : C.second} o={go > 0 ? 1 : 0} />}
            {hit && v > 0 && <Lock x={306} y={y + 10} k={v} f={C.cherryText} />}
          </g>
        );
      })}
      <Verdict answer={answer} text="policy and role graphs don't export" y={234} />
    </Svg>
  );
}

// 2 · Two jobs, three vendors. Each row's job is named on the left; the three vendors' product names drop into it one by
// one, and a single underline then ties each row together as one job.
export function StorageAndIdentityRow({ t }: StepCtx) {
  const k = (d: number) => easeOut(seg(t, d, d + 0.35));
  const vendors = ['AWS', 'Azure', 'GCP'];
  const rows: [string, string[]][] = [
    ['store it, get it back', ['S3', 'Blob Storage', 'Cloud Storage']],
    ['who may touch it', ['IAM', 'Entra ID', 'Cloud IAM']],
  ];
  return (
    <Svg label="Storage and identity, three vendor columns each resolving to the same two jobs" h={250}>
      {vendors.map((v, i) => (
        <T key={v} x={252 + i * 130} y={30} s={12} f={C.latte} a="middle" o={k(0)}>
          {v}
        </T>
      ))}
      {rows.map(([job, names], r) => {
        const d = 0.3 + r * 1.8;
        const y = 50 + r * 80;
        const tie = easeInOut(seg(t, d + 1.2, d + 1.7));
        return (
          <g key={job}>
            <T x={25} y={y + 18} s={12} f={C.crema} o={k(d)}>
              {job}
            </T>
            {names.map((n, i) => {
              const kk = easeOut(seg(t, d + 0.3 + i * 0.25, d + 0.6 + i * 0.25));
              return <Cell key={n} x={190 + i * 130} y={lerp(y - 10, y, kk)} w={125} label={n} o={kk} stroke={r === 0 ? C.second : C.caramel} />;
            })}
            <rect x={190} y={y + 36} width={385 * tie} height={3} rx={1} fill={r === 0 ? C.second : C.caramel} />
            {tie >= 1 && (
              <T x={575} y={y + 56} s={11} f={r === 0 ? C.second : C.caramel} a="end">
                one job
              </T>
            )}
          </g>
        );
      })}
      {t > 4.0 && (
        <T x={300} y={236} s={12} f={C.focus} a="middle" o={k(4.0)}>
          three names, one job each
        </T>
      )}
    </Svg>
  );
}

// 3 · The catalog layer. Four products wire into the same three jobs on the right. Then GCP's own row renames itself in
// place, Dataplex Universal Catalog struck through and Knowledge Catalog written in, while the jobs don't move.
export function CatalogRow({ t }: StepCtx) {
  const k = (d: number) => easeOut(seg(t, d, d + 0.35));
  const products = ['Lake Formation', 'Unity Catalog', 'Purview / OneLake Catalog'];
  const strike = easeInOut(seg(t, 2.2, 2.8));
  const renamed = t > 3.0;
  return (
    <Svg label="Catalog and governance products stacked vertically, with GCP's own row shown mid-rename" h={250}>
      {products.map((p, i) => (
        <Cell key={p} x={25} y={30 + i * 40} w={250} label={p} o={k(0.1 + i * 0.2)} />
      ))}
      {renamed ? (
        <Cell x={25} y={150} w={250} label="Knowledge Catalog" stroke={C.focus} f={C.focus} o={k(3.0)} />
      ) : (
        <g>
          <Cell x={25} y={150} w={250} label="Dataplex Universal Catalog" o={k(0.7)} />
          <line x1={45} y1={164} x2={lerp(45, 255, strike)} y2={164} stroke={C.cherryText} strokeWidth={2} opacity={strike > 0 ? 1 : 0} />
        </g>
      )}
      <rect x={350} y={44} width={225} height={120} rx={6} fill="none" stroke={C.second} strokeWidth={1.5} opacity={k(1.0)} />
      {['policy', 'discovery', 'lineage'].map((j, i) => (
        <T key={j} x={370} y={78 + i * 30} s={12} f={C.second} o={k(1.1 + i * 0.15)}>
          {j}
        </T>
      ))}
      {[0, 1, 2, 3].map((i) => (
        <line
          key={i}
          x1={280}
          y1={44 + i * 40}
          x2={lerp(280, 345, k(1.4 + i * 0.1))}
          y2={lerp(44 + i * 40, 104, k(1.4 + i * 0.1))}
          stroke={i === 3 && strike > 0 && !renamed ? C.cherryText : C.mocha}
          strokeWidth={1.2}
        />
      ))}
      {renamed && <MiniTick x={540} y={70} k={k(3.4)} />}
      {t > 3.6 && (
        <T x={300} y={226} s={12} f={C.caramel} a="middle" o={k(3.6)}>
          renamed mid-research; the job never changed
        </T>
      )}
    </Svg>
  );
}

// 4 · Nine names, three jobs. Each category's column fills with its three vendor names in turn; then one band beneath
// all three, the open format each engine reads.
export function ComputeWarehouseStreamingRow({ t }: StepCtx) {
  const k = (d: number) => easeOut(seg(t, d, d + 0.35));
  const groups: [string, string[]][] = [
    ['Spark', ['AWS: Glue / EMR', 'Azure: Fabric Spark', 'GCP: Dataproc']],
    ['warehouse', ['AWS: Redshift', 'Azure: Synapse', 'GCP: BigQuery']],
    ['streaming', ['AWS: Kinesis', 'Azure: Event Hubs', 'GCP: Pub/Sub']],
  ];
  const band = easeInOut(seg(t, 3.9, 4.5));
  return (
    <Svg label="One category at a time (Spark, warehouse, streaming), its three vendor names stacked vertically" h={250}>
      {groups.map(([g, names], c) => {
        const d = 0.2 + c * 1.2;
        const x = 25 + c * 190;
        return (
          <g key={g}>
            <T x={x} y={30} s={13} f={C.crema} o={k(d)}>
              {g}
            </T>
            {names.map((n, i) => (
              <Cell key={n} x={x} y={44 + i * 38} w={170} label={n} o={k(d + 0.25 + i * 0.2)} stroke={C.second} />
            ))}
            <Pip x={x + 85} y={172} s={8} f={C.focus} o={k(d + 0.9)} />
            <line x1={x + 85} y1={176} x2={x + 85} y2={lerp(176, 196, band)} stroke={C.focus} strokeWidth={1.5} opacity={band > 0 ? 1 : 0} />
          </g>
        );
      })}
      <rect x={25} y={198} width={550 * band} height={22} rx={4} fill="none" stroke={C.focus} strokeWidth={1.5} />
      {band >= 1 && (
        <T x={300} y={213} s={11} f={C.focus} a="middle">
          an open format or protocol underneath
        </T>
      )}
    </Svg>
  );
}

// 5 · Recap. Storage, identity and compute slide across to the other cloud with a tick each; the catalog's policy and the
// role graph stay behind under locks. Then what comes next.
export function Recap({ t }: StepCtx) {
  const k = (d: number) => easeOut(seg(t, d, d + 0.35));
  const go = ['storage', 'identity', 'compute'];
  const stay = ['catalog policy', 'role graph'];
  return (
    <Svg label="The recap's two-line summary of where lock-in actually lives" h={250}>
      <T x={25} y={28} s={12} f={C.latte} o={k(0)}>
        comes with you, with a rewrite
      </T>
      {go.map((g, i) => {
        const m = easeInOut(seg(t, 0.3 + (2 - i) * 0.4, 0.9 + (2 - i) * 0.4));
        return (
          <g key={g}>
            <Cell x={lerp(25 + i * 120, 215 + i * 120, m)} y={40} w={110} label={g} stroke={m >= 1 ? C.focus : C.mocha} f={m >= 1 ? C.focus : C.crema} />
          </g>
        );
      })}
      <T x={25} y={118} s={12} f={C.cherryText} o={k(1.8)}>
        stays behind
      </T>
      {stay.map((g, i) => (
        <g key={g} opacity={k(2.0 + i * 0.3)}>
          <Cell x={25 + i * 190} y={130} w={160} label={g} stroke={C.cherryText} />
          <Lock x={192 + i * 190} y={140} k={k(2.3 + i * 0.3)} f={C.cherryText} />
        </g>
      ))}
      {t > 3.0 && (
        <T x={300} y={226} s={12} f={C.focus} a="middle" o={k(3.0)}>
          next: one mechanism, four product names
        </T>
      )}
    </Svg>
  );
}
