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

// Every value here is examples.py's own: three replicas named pod-0, pod-1 and pod-2, the deleted pod-1 coming back under
// the same name on the next tick, and the taint dedicated=gpu. No cluster ran; the loop and the taint gate are modelled.
// These steps are short, so each scene runs its own clock a little faster (t = t0 times a factor).

const PODS = ['pod-0', 'pod-1', 'pod-2'];

// 0 · Hook. Three pods. A hand deletes pod-1: crossed out, it falls away, and a new pod-1 drops into its place. Then a setting
// on pod-0 is edited, turning red, and quietly reverts.
export function Hook({ t: t0 }: StepCtx) {
  const t = t0 * 1.95;
  const k = (d: number) => easeOut(seg(t, d, d + 0.35));
  const gone = easeIn2(seg(t, 0.7, 1.1));
  const back = easeOutBack(seg(t, 1.4, 1.9));
  const edited = t > 2.4 && t < 3.2;
  return (
    <Svg label="Delete a pod by hand; a replacement appears seconds later" h={250}>
      {PODS.map((p, i) => {
        const x = 60 + i * 170;
        if (i === 1) {
          return (
            <g key={p}>
              {t < 1.1 && <Cell x={x} y={60 + gone * 40} w={140} label={p} o={k(0) * (1 - gone)} stroke={t > 0.4 ? C.cherryText : C.mocha} />}
              <Cross x={x + 70} y={74} k={k(0.4) * (1 - gone)} />
              {t > 1.4 && <Cell x={x} y={lerp(20, 60, back)} w={140} label={p} stroke={C.focus} />}
            </g>
          );
        }
        return <Cell key={p} x={x} y={60} w={140} label={p} o={k(i * 0.1)} />;
      })}
      {t > 1.9 && (
        <T x={300} y={116} s={11} f={C.focus} a="middle" o={k(1.9)}>
          replaced, unasked
        </T>
      )}
      <Cell x={60} y={140} w={140} label={edited ? 'setting: edited' : 'setting'} o={k(2.2)} stroke={edited ? C.cherryText : C.mocha} f={edited ? C.cherryText : C.crema} />
      {t > 3.2 && (
        <T x={215} y={159} s={11} f={C.focus} o={k(3.2)}>
          set back
        </T>
      )}
      {t > 3.7 && (
        <T x={25} y={226} s={12} f={C.crema} o={k(3.7)}>
          a decision you did not make, enforced
        </T>
      )}
    </Svg>
  );
}

// 1 · Predict. The spec says replicas: 3. Of three pods, pod-1 is crossed out by hand, and a minute passes: "?". Once
// answered, pod-1 drops back in, ticked, and the controller's arrow points at it.
export function PredictReplace({ t, answer }: StepCtx) {
  const s = useSinceAnswer(answer !== null);
  const v = answer !== null ? easeOutBack(seg(s, 0.1, 0.6)) : 0;
  const k = (d: number) => easeOut(seg(t, d, d + 0.3));
  return (
    <Svg label="Three replicas; delete one by hand. A minute later, how many, and who replaced it?" h={250}>
      <Cell x={25} y={30} w={140} label="replicas: 3" o={k(0)} stroke={C.second} />
      {PODS.map((p, i) => {
        const x = 60 + i * 170;
        if (i === 1) {
          return (
            <g key={p}>
              {answer === null ? <Hole x={x} y={90} w={140} o={k(0.3)} /> : <Cell x={x} y={lerp(60, 90, v)} w={140} label={p} stroke={C.focus} o={clamp(v)} />}
              {answer === null && <Cross x={x + 70} y={104} k={k(0.4)} />}
              {answer === null && t > 0.8 && (
                <T x={x + 70} y={150} s={15} f={C.taupe} a="middle" o={k(0.8)}>
                  ?
                </T>
              )}
            </g>
          );
        }
        return <Cell key={p} x={x} y={90} w={140} label={p} o={k(0.1 + i * 0.05)} />;
      })}
      {answer !== null && (
        <T x={300} y={150} s={11} f={C.focus} a="middle" o={clamp(v)}>
          the controller closed the gap
        </T>
      )}
      <Verdict answer={answer} text="three, by the controller" y={222} />
    </Svg>
  );
}

// 2 · The control loop. Spec above, status below, the controller between with its arrow turning. status is one short; the
// arrow pulls a pip up into the gap. Later a pip drops out of status by itself, and the arrow pulls it back again.
export function ControlLoop({ t: t0 }: StepCtx) {
  const t = t0 * 1.95;
  const k = (d: number) => easeOut(seg(t, d, d + 0.35));
  const fill1 = easeOutBack(seg(t, 1.0, 1.5));
  const drift = t > 2.4 ? easeIn2(seg(t, 2.4, 2.8)) : 0;
  const fill2 = easeOutBack(seg(t, 3.0, 3.5));
  const ang = t * 2.4;
  const slot = (i: number) => 200 + i * 60;
  return (
    <Svg label="A controller continuously narrows the gap between desired and actual state" h={250}>
      <T x={25} y={56} s={11} f={C.second} o={k(0)}>
        spec
      </T>
      <T x={25} y={176} s={11} f={C.latte} o={k(0)}>
        status
      </T>
      {[0, 1, 2].map((i) => (
        <g key={i}>
          <Pip x={slot(i)} y={52} s={22} f={C.second} o={k(0.1)} />
          <rect x={slot(i) - 11} y={161} width={22} height={22} rx={2} fill="none" stroke={C.mocha} strokeWidth={1.2} opacity={k(0.2)} />
        </g>
      ))}
      <Pip x={slot(0)} y={172} s={22} f={C.latte} o={k(0.2)} />
      <Pip x={slot(1)} y={172 + drift * 30} s={22} f={C.latte} o={k(0.2) * (1 - drift)} />
      {t > 1.0 && <Pip x={slot(2)} y={lerp(120, 172, fill1)} s={22} f={C.latte} o={clamp(fill1)} />}
      {t > 3.0 && <Pip x={slot(1)} y={lerp(120, 172, fill2)} s={22} f={C.latte} o={clamp(fill2)} />}
      <circle cx={450} cy={112} r={24} fill="none" stroke={C.mocha} strokeWidth={1.4} opacity={k(0.4)} />
      <circle cx={450 + 24 * Math.cos(ang)} cy={112 + 24 * Math.sin(ang)} r={4} fill={C.focus} opacity={k(0.4)} />
      <T x={450} y={160} s={11} f={C.focus} a="middle" o={k(0.4)}>
        controller
      </T>
      {t > 3.6 && (
        <T x={25} y={232} s={12} f={C.crema} o={k(3.6)}>
          it never waits to be told
        </T>
      )}
    </Svg>
  );
}

// 3 · Three shapes. A Pod, two containers inside it. A Deployment's three identical copies swap places, interchangeable. A
// StatefulSet's pod-0, pod-1 and pod-2 each sit on their own disk; pod-1 restarts and comes back to the same disk.
export function PodDeployStateful({ t: t0 }: StepCtx) {
  const t = t0 * 1.55;
  const k = (d: number) => easeOut(seg(t, d, d + 0.35));
  const sh = easeInOut(seg(t, 1.2, 1.9));
  const rs = t > 2.6 && t < 3.2 ? 0.15 : 1;
  const dx = [0, 1, 2].map((i) => [0, 2, 1][i] * sh + i * (1 - sh));
  return (
    <Svg label="A Pod, a Deployment's replicas, and a StatefulSet's sticky identity" h={250}>
      <T x={25} y={32} s={11} f={C.taupe} o={k(0)}>
        Pod
      </T>
      <rect x={25} y={46} width={120} height={90} rx={4} fill="none" stroke={C.mocha} strokeWidth={1.5} opacity={k(0)} />
      {[0, 1].map((i) => (
        <rect key={i} x={37} y={58 + i * 36} width={96} height={28} rx={3} fill="none" stroke={C.latte} strokeWidth={1.3} opacity={k(0.2 + i * 0.1)} />
      ))}
      <T x={175} y={32} s={11} f={C.taupe} o={k(0.6)}>
        Deployment
      </T>
      {[0, 1, 2].map((i) => (
        <rect key={i} x={180 + dx[i] * 60} y={60} width={44} height={44} rx={4} fill="none" stroke={C.latte} strokeWidth={1.5} opacity={k(0.7 + i * 0.1)} />
      ))}
      {t > 1.9 && (
        <T x={175} y={130} s={11} f={C.latte} o={k(1.9)}>
          any copy answers
        </T>
      )}
      <T x={385} y={32} s={11} f={C.taupe} o={k(2.0)}>
        StatefulSet
      </T>
      {PODS.map((p, i) => {
        const x = 385 + i * 67;
        return (
          <g key={p}>
            <Cell x={x} y={60} w={56} label={p} o={k(2.1 + i * 0.1) * (i === 1 ? rs : 1)} />
            <line x1={x + 28} y1={88} x2={x + 28} y2={110} stroke={C.mocha} strokeWidth={1.3} opacity={k(2.2)} />
            <rect x={x} y={110} width={56} height={18} rx={9} fill="none" stroke={i === 1 && t > 3.2 ? C.focus : C.second} strokeWidth={1.5} opacity={k(2.2)} />
          </g>
        );
      })}
      {t > 3.3 && (
        <T x={385} y={152} s={11} f={C.focus} o={k(3.3)}>
          same name, same disk
        </T>
      )}
      {t > 3.8 && (
        <T x={25} y={226} s={12} f={C.crema} o={k(3.8)}>
          one blueprint, two different shapes
        </T>
      )}
    </Svg>
  );
}

// 4 · A Service. A caller sends three requests to one stable name; each lands on a different pod, and between them one pod
// is swapped for a new one. The name in front never moves.
export function ServiceDns({ t: t0 }: StepCtx) {
  const t = t0 * 2.15;
  const k = (d: number) => easeOut(seg(t, d, d + 0.35));
  const hit = t < 1.4 ? 0 : t < 2.4 ? 2 : 1;
  const swap = easeInOut(seg(t, 1.6, 2.1));
  return (
    <Svg label="A Service's name resolves the same way, whichever pod answers" h={250}>
      <Cell x={25} y={96} w={90} label="caller" o={k(0)} />
      <Req x1={120} x2={215} y={110} k={k(0.2)} />
      <Cell x={220} y={96} w={130} label="a stable name" o={k(0.1)} stroke={C.focus} />
      {[0, 1, 2].map((i) => {
        const y = 40 + i * 60;
        const on = i === hit && t > 0.4;
        return (
          <g key={i}>
            <Cell x={440} y={y} w={135} label={i === 2 && swap > 0.5 ? 'a new pod' : 'a pod'} o={k(0.3) * (i === 2 ? 1 - 0.8 * Math.sin(Math.PI * swap) : 1)} stroke={on ? C.focus : C.mocha} />
            <Fan x1={350} y1={110} x2={438} y2={y + 14} k={on ? k(hit === 0 ? 0.4 : hit === 2 ? 1.4 : 2.4) : 0} f={C.focus} />
          </g>
        );
      })}
      {t > 3.4 && (
        <T x={25} y={226} s={12} f={C.crema} o={k(3.4)}>
          the caller never knows which copy picked up
        </T>
      )}
    </Svg>
  );
}

// 5 · ConfigMap and Secret, side by side in the cluster's data store. The Secret's value reads base64 behind what looks like
// a lock. An API-access arrow reaches it, the lock is crossed out, and the value turns red: plain text.
export function ConfigSecrets({ t: t0 }: StepCtx) {
  const t = t0 * 1.65;
  const k = (d: number) => easeOut(seg(t, d, d + 0.35));
  const read = t > 2.0;
  return (
    <Svg label="A Secret is stored unencrypted by default; base64 obscures, it does not secure" h={250}>
      <rect x={25} y={40} width={330} height={150} rx={8} fill="none" stroke={C.mocha} strokeWidth={1.5} opacity={k(0)} />
      <T x={40} y={62} s={11} f={C.taupe} o={k(0)}>
        the data store: unencrypted by default
      </T>
      <Cell x={40} y={90} w={140} label="ConfigMap" o={k(0.2)} />
      <Cell x={200} y={90} w={140} label="Secret" o={k(0.4)} stroke={read ? C.cherryText : C.mocha} />
      <T x={270} y={150} s={11} f={read ? C.cherryText : C.latte} a="middle" o={k(0.6)}>
        {read ? 'plain text' : 'value: base64'}
      </T>
      <Lock x={318} y={66} k={k(0.8) * (read ? 0.4 : 1)} f={C.latte} />
      <Cross x={326} y={66} k={k(2.0)} />
      <T x={470} y={92} s={11} f={C.cherryText} a="middle" o={k(1.3)}>
        API access
      </T>
      <path d={`M${lerp(540, 345, k(1.3))} 110 H540`} stroke={C.cherryText} strokeWidth={1.8} opacity={k(1.3)} />
      <circle cx={lerp(540, 345, k(1.3))} cy={110} r={3.5} fill={C.cherryText} opacity={k(1.3)} />
      {t > 3.2 && (
        <T x={25} y={226} s={12} f={C.crema} o={k(3.2)}>
          exposed until encryption at rest is on
        </T>
      )}
    </Svg>
  );
}

// 6 · Volumes. Two PersistentVolumes already exist, built by hand. A claim appears, a request. It reaches the StorageClass,
// which builds a new volume on demand; the volume drops in and binds to the claim.
export function PvPvcStorageClass({ t: t0 }: StepCtx) {
  const t = t0 * 1.8;
  const k = (d: number) => easeOut(seg(t, d, d + 0.35));
  const made = easeOutBack(seg(t, 1.9, 2.5));
  return (
    <Svg label="A StorageClass provisions a PersistentVolume to match a PersistentVolumeClaim" h={250}>
      <T x={25} y={32} s={11} f={C.taupe} o={k(0)}>
        PersistentVolume: already exists
      </T>
      {[0, 1].map((i) => (
        <rect key={i} x={25 + i * 70} y={46} width={56} height={24} rx={12} fill="none" stroke={C.second} strokeWidth={1.5} opacity={k(0.1 + i * 0.1)} />
      ))}
      <Cell x={25} y={120} w={200} label="PersistentVolumeClaim" o={k(0.8)} />
      <T x={25} y={166} s={11} f={C.latte} o={k(0.9)}>
        a request for some
      </T>
      <Req x1={230} x2={345} y={134} k={k(1.3)} />
      <Cell x={350} y={120} w={140} label="StorageClass" o={k(1.1)} stroke={C.focus} />
      {t > 1.9 && <rect x={395} y={lerp(170, 60, made)} width={56} height={24} rx={12} fill="none" stroke={C.focus} strokeWidth={1.8} opacity={clamp(made)} />}
      <path d={`M${125} 118 Q 260 ${lerp(118, 72, k(2.6))} 393 72`} fill="none" stroke={C.focus} strokeWidth={1.6} strokeDasharray="4 3" opacity={k(2.6)} />
      {t > 2.6 && (
        <T x={460} y={76} s={11} f={C.focus} o={k(2.6)}>
          bound
        </T>
      )}
      {t > 3.4 && (
        <T x={25} y={226} s={12} f={C.crema} o={k(3.4)}>
          provisioned on demand, not pre-built by hand
        </T>
      )}
    </Svg>
  );
}

// 7 · Taints. A node carries dedicated=gpu. A pod with no toleration runs at it and bounces back, crossed out. A pod that
// tolerates it passes the taint, ticked, but stops at the door: allowed, not sent. Then a separate pull, affinity, tugs at
// the other node.
export function TaintsAffinity({ t: t0 }: StepCtx) {
  const t = t0 * 1.65;
  const k = (d: number) => easeOut(seg(t, d, d + 0.35));
  const a = Math.sin(Math.PI * seg(t, 0.4, 1.4));
  const b = easeInOut(seg(t, 1.7, 2.4));
  return (
    <Svg label="A taint repels; only a matching toleration lets a pod land anyway" h={250}>
      <rect x={330} y={36} width={245} height={86} rx={6} fill="none" stroke={C.mocha} strokeWidth={1.5} opacity={k(0)} />
      <line x1={330} y1={36} x2={330} y2={122} stroke={C.cherryText} strokeWidth={2.2} opacity={k(0)} />
      <T x={345} y={58} s={11} f={C.cherryText} o={k(0)}>
        taint: dedicated=gpu
      </T>
      <rect x={330} y={146} width={245} height={60} rx={6} fill="none" stroke={C.mocha} strokeWidth={1.5} opacity={k(0.2)} />
      <T x={345} y={168} s={11} f={C.taupe} o={k(0.2)}>
        another node
      </T>
      <Cell x={25} y={50} w={150} label="no toleration" o={k(0.3)} />
      <Pip x={190 + a * 125} y={64} s={14} f={C.latte} o={k(0.3)} />
      <Cross x={320} y={64} k={t > 0.9 ? k(0.9) : 0} />
      <Cell x={25} y={100} w={150} label="tolerates it" o={k(1.5)} />
      <Pip x={190 + b * 165} y={114} s={14} f={C.focus} o={k(1.5)} />
      <MiniTick x={340} y={92} k={k(2.4)} />
      {t > 2.5 && (
        <T x={380} y={106} s={11} f={C.focus} o={k(2.5)}>
          allowed, not sent
        </T>
      )}
      <path d={`M${lerp(575, 470, k(3.2))} 190 H575`} stroke={C.second} strokeWidth={1.8} opacity={k(3.2)} />
      {t > 3.3 && (
        <T x={345} y={194} s={11} f={C.second} o={k(3.3)}>
          affinity: a pull
        </T>
      )}
    </Svg>
  );
}

// 8 · The one loop. The spec-status loop on the left, its marker turning; one by one the rest of the chapter lights up on the
// right, each fed from the same loop: a different gap each time.
export function ReconciliationRestated({ t: t0 }: StepCtx) {
  const t = t0 * 1.8;
  const k = (d: number) => easeOut(seg(t, d, d + 0.35));
  const ang = t * 2.4;
  const next = ['requests and limits', 'Jobs that must finish', "Spark's own pods", 'stateful sets', 'GitOps'];
  return (
    <Svg label="Every object here is a spec a controller works to match; the rest of the chapter is this loop from new angles" h={250}>
      <circle cx={120} cy={120} r={44} fill="none" stroke={C.mocha} strokeWidth={1.5} opacity={k(0)} />
      <circle cx={120 + 44 * Math.cos(ang)} cy={120 + 44 * Math.sin(ang)} r={5} fill={C.focus} opacity={k(0)} />
      <T x={120} y={124} s={11} f={C.focus} a="middle" o={k(0)}>
        spec, status
      </T>
      {next.map((n, i) => (
        <g key={n}>
          <Fan x1={166} y1={120} x2={318} y2={44 + i * 40} k={k(0.6 + i * 0.5)} f={C.latte} />
          <Cell x={320} y={30 + i * 40} w={255} label={n} o={k(0.7 + i * 0.5)} />
        </g>
      ))}
    </Svg>
  );
}

// 9 · Recap. What these objects say, ticked: what to run, roughly where. Then three questions slide in with a "?" each: how
// much to reserve, how much to allow, who dies first. That is next.
export function Recap({ t: t0 }: StepCtx) {
  const t = t0 * 1.95;
  const k = (d: number) => easeOut(seg(t, d, d + 0.35));
  const qs = ['how much to reserve', 'how much to allow', 'who dies first'];
  return (
    <Svg label="Five things to keep from this refresher" h={250}>
      <Cell x={25} y={36} w={270} label="what to run, roughly where" o={k(0)} stroke={C.focus} />
      <MiniTick x={305} y={50} k={k(0.4)} />
      {qs.map((q, i) => {
        const a = easeOut(seg(t, 1.0 + i * 0.6, 1.45 + i * 0.6));
        return (
          <g key={q}>
            {a > 0 && <Cell x={lerp(9, 25, a)} y={90 + i * 44} w={270} label={q} o={a} stroke={C.second} />}
            <T x={320} y={109 + i * 44} s={15} f={C.taupe} o={a}>
              ?
            </T>
          </g>
        );
      })}
      {t > 3.4 && (
        <T x={575} y={232} s={12} f={C.crema} a="end" o={k(3.4)}>
          that is next
        </T>
      )}
    </Svg>
  );
}
function easeIn2(x: number) {
  return x * x;
}
