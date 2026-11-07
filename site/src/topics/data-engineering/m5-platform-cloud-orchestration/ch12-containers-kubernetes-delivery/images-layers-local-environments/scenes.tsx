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

// Every value here is examples.py's own or its SOURCES.md's: the naive and reordered Dockerfiles' six instructions, the
// four and two layers a source edit rebuilds, the 4,096-byte config.old and its whiteout, Distroless's 2, alpine's 5 and
// debian's 124 MiB, and Postgres turning healthy at 3.0 seconds. No Docker daemon was reachable, so nothing is a timed build.
// These steps are short, so each scene runs its own clock a little faster (t = t0 times a factor).

/** One slab of a layer stack: index 0 is the base, drawn at the bottom. `state` 0 is cached, 1 is rebuilding. */
function Slab({ x, y, w, h = 22, label, o = 1, hot = 0, mark = false }: { x: number; y: number; w: number; h?: number; label?: string; o?: number; hot?: number; mark?: boolean }) {
  return (
    <g opacity={o}>
      <rect x={x} y={y} width={w} height={h} rx={3} fill={C.cocoa} stroke={mark ? C.cherryText : hot > 0.5 ? C.cherryText : C.mocha} strokeWidth={mark || hot > 0.5 ? 2 : 1.4} />
      {hot > 0 && <rect x={x + 2} y={y + 2} width={(w - 4) * hot} height={h - 4} rx={2} fill="none" stroke={C.cherryText} strokeWidth={1} strokeDasharray="3 3" />}
      {label && (
        <T x={x + 10} y={y + h / 2 + 4} s={11} f={C.crema}>
          {label}
        </T>
      )}
    </g>
  );
}

/** A six-slab stack from y0 (the top slab) down; slab i's y. */
const slabY = (y0: number, i: number, n = 6, step = 28) => y0 + (n - 1 - i) * step;

// 0 · Opening. A gate tick: the change passed. Then the image builds itself slab by slab from the base up. One slab, the
// fourth, flashes as the changed line; a wave climbs from it to the top and an arrow carries those slabs off: pushed again.
export function Opening({ t: t0 }: StepCtx) {
  const t = t0 * 2;
  const k = (d: number) => easeOut(seg(t, d, d + 0.35));
  return (
    <Svg label="A six-layer PySpark image; a one-line source change re-pushes most of it" h={250}>
      <MiniTick x={25} y={30} k={k(0)} />
      <T x={45} y={38} s={11} f={C.focus} o={k(0)}>
        every gate passed
      </T>
      {Array.from({ length: 6 }, (_, i) => {
        const a = easeOut(seg(t, 0.4 + i * 0.25, 0.7 + i * 0.25));
        const hot = i >= 3 ? easeOut(seg(t, 2.8 + (i - 3) * 0.3, 3.1 + (i - 3) * 0.3)) : 0;
        return <Slab key={i} x={160} y={slabY(66, i) - (1 - a) * 16} w={240} o={a} label={i === 0 ? 'FROM python:3.13-slim' : i === 3 ? 'COPY . .' : undefined} hot={hot} mark={i === 3 && t > 2.4} />;
      })}
      {t > 2.4 && (
        <T x={415} y={137} s={11} f={C.cherryText} o={k(2.4)}>
          one changed line
        </T>
      )}
      <path d={`M408 ${lerp(150, 80, k(3.7))} v-10`} stroke={C.cherryText} strokeWidth={2} opacity={k(3.7)} />
      {t > 3.7 && (
        <T x={455} y={90} s={11} f={C.cherryText} o={k(3.7)}>
          pushed again
        </T>
      )}
    </Svg>
  );
}

// 1 · Predict. Six slabs, the fourth marked COPY . . and ringed. How many rebuild? Once answered, a wave fills that slab and
// the two above it, and the three below take ticks: cached.
export function PredictInvalidation({ t, answer }: StepCtx) {
  const s = useSinceAnswer(answer !== null);
  const k = (d: number) => easeOut(seg(t, d, d + 0.3));
  return (
    <Svg label="A six-layer image; the COPY . . instruction, fourth from the base, changes. Which layers rebuild?" h={250}>
      {Array.from({ length: 6 }, (_, i) => {
        const hot = answer !== null && i >= 3 ? easeOut(seg(s, 0.1 + (i - 3) * 0.25, 0.4 + (i - 3) * 0.25)) : 0;
        return (
          <g key={i}>
            <Slab x={160} y={slabY(30, i)} w={240} o={k(i * 0.08)} label={i === 3 ? 'COPY . .' : undefined} hot={hot} mark={i === 3} />
            {answer !== null && i < 3 && <MiniTick x={412} y={slabY(30, i) + 11} k={easeOut(seg(s, 0.9 + i * 0.1, 1.2 + i * 0.1))} />}
          </g>
        );
      })}
      <rect x={152} y={slabY(30, 3) - 5} width={256} height={32} rx={5} fill="none" stroke={C.second} strokeWidth={1.6} opacity={k(0.6)} />
      {answer === null && t > 0.9 && (
        <T x={460} y={124} s={15} f={C.taupe} a="middle" o={k(0.9)}>
          ?
        </T>
      )}
      <Verdict answer={answer} text="that layer and everything above it" y={222} />
    </Svg>
  );
}

// 2 · The wave. It climbs from the changed slab to the top, one slab at a time; a downward arrow tries the other way and is
// crossed out, and the three slabs below take ticks: reused from cache.
export function CacheWave({ t: t0 }: StepCtx) {
  const t = t0 * 1.8;
  const k = (d: number) => easeOut(seg(t, d, d + 0.35));
  return (
    <Svg label="The rebuild wave plays from the changed layer upward; layers below stay cached" h={250}>
      {Array.from({ length: 6 }, (_, i) => {
        const hot = i >= 3 ? easeOut(seg(t, 0.3 + (i - 3) * 0.45, 0.7 + (i - 3) * 0.45)) : 0;
        return (
          <g key={i}>
            <Slab x={160} y={slabY(30, i)} w={240} label={i === 3 ? 'COPY . .' : undefined} hot={hot} mark={i === 3} />
            {i < 3 && <MiniTick x={412} y={slabY(30, i) + 11} k={k(2.4 + i * 0.15)} />}
          </g>
        );
      })}
      <path d={`M130 ${slabY(30, 3) + 11} V${lerp(slabY(30, 3) + 11, 30, k(0.3))}`} stroke={C.cherryText} strokeWidth={2} />
      <path d={`M130 ${slabY(30, 3) + 11} V${lerp(slabY(30, 3) + 11, slabY(30, 0) + 11, k(1.7))}`} stroke={C.taupe} strokeWidth={2} strokeDasharray="4 3" opacity={k(1.7)} />
      <Cross x={130} y={slabY(30, 1) + 11} k={k(2.1)} />
      {t > 2.4 && (
        <T x={440} y={slabY(30, 1) + 15} s={11} f={C.focus} o={k(2.4)}>
          cached
        </T>
      )}
      {t > 3.4 && (
        <T x={25} y={226} s={12} f={C.crema} o={k(3.4)}>
          every layer after it runs again, even if nothing would differ
        </T>
      )}
    </Svg>
  );
}

const NAIVE = ['FROM python:3.13-slim', 'WORKDIR /app', 'COPY . .', 'RUN pip install', 'COPY run.py .', 'CMD'];
const REORDERED = ['FROM python:3.13-slim', 'WORKDIR /app', 'COPY requirements.txt .', 'RUN pip install', 'COPY . .', 'CMD'];

// 3 · Ordering. The naive file and the reordered one side by side. The same source edit hits COPY . . in each; in the naive
// stack the wave climbs four slabs, through pip install, and in the reordered stack only two.
export function BuildCacheOrdering({ t: t0 }: StepCtx) {
  const t = t0 * 1.65;
  const k = (d: number) => easeOut(seg(t, d, d + 0.35));
  const stack = (x: number, rows: string[], from: number, d: number) =>
    rows.map((r, i) => {
      const hot = i >= from ? easeOut(seg(t, d + (i - from) * 0.35, d + 0.3 + (i - from) * 0.35)) : 0;
      return <Slab key={r + i} x={x} y={slabY(40, i)} w={255} label={r} hot={hot} mark={i === from && t > d} o={k(0.1 + i * 0.05)} />;
    });
  return (
    <Svg label="A naive build re-installs dependencies on every source edit; reordering keeps the install layer cached" h={250}>
      <T x={25} y={30} s={11} f={C.taupe} o={k(0)}>
        naive
      </T>
      <T x={320} y={30} s={11} f={C.taupe} o={k(0)}>
        manifest first, source last
      </T>
      {stack(25, NAIVE, 2, 0.6)}
      {stack(320, REORDERED, 4, 2.2)}
      {t > 2.1 && (
        <T x={25} y={226} s={11} f={C.cherryText} o={k(2.1)}>
          four rebuild
        </T>
      )}
      {t > 3.2 && (
        <T x={320} y={226} s={11} f={C.focus} o={k(3.2)}>
          two rebuild; pip install cached
        </T>
      )}
    </Svg>
  );
}

// 4 · A whiteout. The base slab holds config.old. A later instruction deletes it: a new slab drops on top carrying the
// marker .wh.config.old, the file below goes dashed, hidden, and the image-size bar beside it does not move.
export function Whiteout({ t: t0 }: StepCtx) {
  const t = t0 * 1.95;
  const k = (d: number) => easeOut(seg(t, d, d + 0.35));
  const drop = easeOutBack(seg(t, 1.0, 1.6));
  const hide = k(2.0);
  return (
    <Svg label="Deleting a file in a later layer adds a whiteout slab; the file's bytes stay in the layer underneath" h={250}>
      <Slab x={25} y={150} w={300} h={40} o={k(0)} />
      <rect x={40} y={158} width={110} height={24} rx={3} fill="none" stroke={hide > 0.5 ? C.taupe : C.latte} strokeWidth={1.4} strokeDasharray={hide > 0.5 ? '4 3' : undefined} opacity={k(0.1)} />
      <T x={95} y={174} s={11} f={hide > 0.5 ? C.taupe : C.crema} a="middle" o={k(0.1)}>
        config.old
      </T>
      <T x={25} y={36} s={11} f={C.taupe} o={k(0.5)}>
        a later instruction deletes it
      </T>
      {drop > 0 && <Slab x={25} y={lerp(50, 116, drop)} w={300} h={26} label=".wh.config.old" />}
      {t > 2.0 && (
        <T x={25} y={214} s={11} f={C.taupe} o={hide}>
          hidden, not removed
        </T>
      )}
      <T x={380} y={110} s={11} f={C.latte} o={k(0.3)}>
        image size
      </T>
      <rect x={380} y={122} width={160 * k(0.3)} height={16} rx={2} fill={C.latte} />
      <rect x={380} y={118} width={160} height={24} rx={3} fill="none" stroke={C.second} strokeWidth={1.4} opacity={k(2.6) * (1 - k(3.4))} />
      {t > 2.6 && (
        <T x={380} y={164} s={11} f={C.crema} o={k(2.6)}>
          still 4,096 bytes
        </T>
      )}
      {t > 3.6 && (
        <T x={380} y={214} s={11} f={C.cherryText} o={k(3.6)}>
          a slab added
        </T>
      )}
    </Svg>
  );
}

// 5 · Multi-stage. A build stage of three slabs; the finished program slides across into a fresh minimal base, and the
// build stage's slabs fall away. Below, the three published base sizes grow as bars.
export function MultiStage({ t: t0 }: StepCtx) {
  const t = t0 * 1.43;
  const k = (d: number) => easeOut(seg(t, d, d + 0.35));
  const mv = easeInOut(seg(t, 0.8, 1.6));
  const fall = easeIn2(seg(t, 1.8, 2.4));
  const sizes: [string, number][] = [
    ['distroless 2 MiB', 2],
    ['alpine 5 MiB', 5],
    ['debian 124 MiB', 124],
  ];
  return (
    <Svg label="A multi-stage build keeps the runtime stage only; the build stage's layers never ship" h={250}>
      <T x={25} y={30} s={11} f={C.taupe} o={k(0) * (1 - fall)}>
        build stage
      </T>
      <Slab x={25} y={40 + fall * 40} w={220} label="compiler toolchain" o={k(0) * (1 - fall)} />
      <Slab x={25} y={66 + fall * 40} w={220} label="package cache" o={k(0.1) * (1 - fall)} />
      <Slab x={25} y={92 + fall * 40} w={220} label="build" o={k(0.2) * (1 - fall)} />
      <T x={355} y={30} s={11} f={C.taupe} o={k(0.4)}>
        runtime stage
      </T>
      <Slab x={355} y={92} w={220} label="minimal base" o={k(0.4)} />
      {t > 0.8 && <Slab x={lerp(25, 355, mv)} y={lerp(92, 66, mv)} w={220} label="finished program" />}
      {sizes.map(([l, v], i) => {
        const g = easeOut(seg(t, 2.6 + i * 0.35, 3.2 + i * 0.35));
        return (
          <g key={l} opacity={g > 0 ? 1 : 0}>
            <T x={25} y={162 + i * 26} s={11} f={C.latte}>
              {l}
            </T>
            <rect x={160} y={152 + i * 26} width={Math.max(3, (v / 124) * 400) * g} height={12} rx={2} fill={i === 0 ? C.focus : C.latte} />
          </g>
        );
      })}
    </Svg>
  );
}

// 6 · Volumes and networks. The container, with its thin writable layer, is crossed out and fades; the named volume under it
// stays, ticked. On the right, kafka, postgres and minio join a bridge, and kafka reaches postgres by name.
export function VolumesNetworks({ t: t0 }: StepCtx) {
  const t = t0 * 1.8;
  const k = (d: number) => easeOut(seg(t, d, d + 0.35));
  const die = k(1.0);
  const svc: [string, number, number][] = [
    ['kafka', 300, 80],
    ['postgres', 395, 95],
    ['minio', 505, 70],
  ];
  return (
    <Svg label="A container's writable layer dies with it; a named volume and a bridge network outlive the container" h={250}>
      <Cell x={25} y={46} w={200} label="container" o={k(0) * (1 - 0.7 * die)} />
      <rect x={25} y={38} width={200} height={6} rx={2} fill={C.latte} opacity={k(0) * (1 - die)} />
      <Cross x={125} y={60} k={die} />
      <line x1={125} y1={76} x2={125} y2={130} stroke={C.mocha} strokeWidth={1.4} strokeDasharray="4 3" opacity={k(0.3)} />
      <Cell x={25} y={130} w={200} label="named volume" o={k(0.3)} stroke={die > 0.5 ? C.focus : C.mocha} />
      <MiniTick x={235} y={140} k={k(1.5)} />
      {svc.map(([n, x, w], i) => (
        <g key={n}>
          <Cell x={x} y={60} w={w} label={n} o={k(1.8 + i * 0.15)} />
          <line x1={x + w / 2} y1={88} x2={x + w / 2} y2={150} stroke={C.mocha} strokeWidth={1.4} opacity={k(2.2)} />
        </g>
      ))}
      <line x1={300} y1={150} x2={lerp(300, 575, k(2.2))} y2={150} stroke={C.second} strokeWidth={2} />
      <path d={`M340 150 Q 391 ${lerp(150, 186, k(3.0))} 442 150`} fill="none" stroke={C.focus} strokeWidth={1.8} opacity={k(3.0)} />
      {t > 3.2 && (
        <T x={391} y={204} s={11} f={C.focus} a="middle" o={k(3.2)}>
          by name, not address
        </T>
      )}
    </Svg>
  );
}

// 7 · Startup order. Two lanes on one clock. Postgres's bar grows to its healthcheck at 3.0 seconds in both. With plain
// depends_on the app starts at 0 and is crossed out; with service_healthy it starts at the healthy mark, ticked.
export function ComposeHealthy({ t: t0 }: StepCtx) {
  const t = t0 * 1.55;
  const k = (d: number) => easeOut(seg(t, d, d + 0.35));
  const grow = easeInOut(seg(t, 0.3, 1.6));
  const hx = 150 + 300;
  return (
    <Svg label="Three services start; the consumer waits for each one's own healthcheck before it starts" h={250}>
      {[0, 1].map((l) => (
        <g key={l}>
          <T x={25} y={52 + l * 90} s={11} f={C.taupe} o={k(0)}>
            {l === 0 ? 'depends_on' : 'service_healthy'}
          </T>
          <T x={25} y={74 + l * 90} s={11} f={C.latte} o={k(0)}>
            postgres
          </T>
          <rect x={150} y={62 + l * 90} width={300 * grow} height={16} rx={2} fill={C.latte} />
          <line x1={hx} y1={56 + l * 90} x2={hx} y2={84 + l * 90} stroke={C.focus} strokeWidth={2} opacity={k(1.6)} />
        </g>
      ))}
      <T x={150} y={214} s={11} f={C.taupe} a="middle" o={k(0)}>
        0
      </T>
      <T x={hx} y={214} s={11} f={C.focus} a="middle" o={k(1.6)}>
        healthy at 3.0 s
      </T>
      <Cell x={150} y={88} w={60} h={22} label="app" o={k(1.9)} stroke={C.cherryText} f={C.cherryText} />
      <Cross x={225} y={99} k={k(2.3)} />
      {t > 2.3 && (
        <T x={245} y={104} s={11} f={C.cherryText} o={k(2.3)}>
          greets an unready database
        </T>
      )}
      <Cell x={lerp(150, hx, k(2.9))} y={178} w={60} h={22} label="app" o={k(2.9)} stroke={C.focus} f={C.focus} />
      <MiniTick x={hx + 72} y={186} k={k(3.5)} />
    </Svg>
  );
}

// 8 · Env var or file. An inspect beam sweeps the container: it reads the environment variable in plain text, which turns
// red, and stops at the container's own filesystem, where the mounted file sits behind a lock.
export function ConfigEnvFile({ t: t0 }: StepCtx) {
  const t = t0 * 1.95;
  const k = (d: number) => easeOut(seg(t, d, d + 0.35));
  const beam = easeInOut(seg(t, 0.6, 1.8));
  const bx = lerp(25, 300, beam);
  return (
    <Svg label="An environment variable is visible to anyone who can inspect the container; a mounted file is only readable inside it" h={250}>
      <T x={25} y={36} s={11} f={C.taupe} o={k(0)}>
        docker inspect
      </T>
      <rect x={300} y={50} width={275} height={150} rx={6} fill="none" stroke={C.mocha} strokeWidth={1.5} opacity={k(0)} />
      <T x={310} y={70} s={11} f={C.taupe} o={k(0)}>
        the container's own filesystem
      </T>
      <Cell x={105} y={90} w={185} label="environment variable" o={k(0.2)} stroke={beam > 0.5 ? C.cherryText : C.mocha} />
      <Cell x={330} y={130} w={150} label="a mounted file" o={k(0.3)} />
      <Lock x={495} y={138} k={k(2.2)} />
      {beam > 0 && beam < 1 && <line x1={bx} y1={84} x2={bx} y2={190} stroke={C.second} strokeWidth={1.5} />}
      {beam >= 1 && <line x1={300} y1={84} x2={300} y2={200} stroke={C.second} strokeWidth={2} opacity={1 - k(3.0) * 0.5} />}
      {t > 1.8 && (
        <T x={105} y={146} s={11} f={C.cherryText} o={k(1.8)}>
          read in plain text
        </T>
      )}
      {t > 2.4 && (
        <T x={330} y={186} s={11} f={C.focus} o={k(2.4)}>
          readable only inside
        </T>
      )}
    </Svg>
  );
}

// 9 · Recap, and a bridge. The frozen stack locks; an arrow runs it as a process inside a dashed boundary, the memory.max
// file pinned to it. The process's usage bar climbs toward that line and stops just short with a "?": what happens next.
export function Recap({ t: t0 }: StepCtx) {
  const t = t0 * 1.95;
  const k = (d: number) => easeOut(seg(t, d, d + 0.35));
  const use = easeInOut(seg(t, 2.2, 3.6));
  return (
    <Svg label="Five things to keep from this refresher" h={250}>
      {Array.from({ length: 4 }, (_, i) => (
        <Slab key={i} x={25} y={slabY(60, i, 4)} w={150} o={k(i * 0.1)} />
      ))}
      <Lock x={92} y={40} k={k(0.6)} />
      <Req x1={185} x2={275} y={110} k={k(1.0)} label="run" />
      <rect x={285} y={50} width={290} height={150} rx={6} fill="none" stroke={C.latte} strokeWidth={1.5} strokeDasharray="5 4" opacity={k(1.4)} />
      <T x={300} y={72} s={11} f={C.latte} o={k(1.4)}>
        a process, in a kernel boundary
      </T>
      <line x1={300} y1={94} x2={560} y2={94} stroke={C.cherryText} strokeWidth={1.6} opacity={k(1.8)} />
      <T x={560} y={112} s={11} f={C.cherryText} a="end" o={k(1.8)}>
        memory.max
      </T>
      <rect x={360} y={lerp(186, 104, use)} width={60} height={lerp(0, 82, use)} fill={C.latte} />
      {t > 3.6 && (
        <T x={480} y={160} s={15} f={C.taupe} a="middle" o={k(3.6)}>
          ?
        </T>
      )}
    </Svg>
  );
}
function easeIn2(x: number) {
  return x * x;
}
