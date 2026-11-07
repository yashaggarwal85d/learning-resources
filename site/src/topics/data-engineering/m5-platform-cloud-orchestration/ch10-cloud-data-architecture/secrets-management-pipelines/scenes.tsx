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

/** A pointer from (x1, y) back toward x2 < x1, drawn by `k`. */
function Back({ x1, x2, y, k, f = C.crema }: { x1: number; x2: number; y: number; k: number; f?: string }) {
  const x = lerp(x1, x2, k);
  return (
    <g opacity={k > 0 ? 1 : 0}>
      <line x1={x1} y1={y} x2={x} y2={y} stroke={f} strokeWidth={1.8} />
      <path d={`M${x} ${y} l8 -5 v10 z`} fill={f} />
    </g>
  );
}

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

// 0 · The naive rotation. A time cursor runs along one password's life: old_pw_123 ends at the rotation and new_pw_456
// begins there. Three in-flight requests run underneath; the two still open at the cut fail moments after it.
export function OnePasswordRevoked({ t }: StepCtx) {
  const cx = lerp(25, 575, easeInOut(seg(t, 0.2, 3.4)));
  const spans: [number, number][] = [
    [60, 240],
    [200, 380],
    [250, 470],
  ];
  return (
    <Svg label="A naive rotation's two validity bars meet exactly with a failure mark at the join; a dual-credential rotation's bars overlap with no mark landing in a gap" h={250}>
      <T x={300} y={30} s={11} f={C.cherryText} a="middle" o={cx > 300 ? 1 : 0.35}>
        write new, kill old
      </T>
      <Cell x={25} y={42} w={273} label="old_pw_123" o={cx > 300 ? 0.45 : 1} />
      <Cell x={302} y={42} w={273} label="new_pw_456" o={cx > 300 ? 1 : 0.25} stroke={cx > 300 ? C.focus : C.mocha} />
      <line x1={300} y1={38} x2={300} y2={200} stroke={C.cherryText} strokeWidth={1.5} strokeDasharray="4 3" />
      <T x={25} y={100} s={11} f={C.latte}>
        in flight, old password
      </T>
      {spans.map(([a, b], i) => {
        const y = 122 + i * 30;
        const end = Math.min(cx, b);
        const cut = a < 300 && b > 300 && cx > 300;
        const failAt = 300 + 14 + i * 12;
        return (
          <g key={i} opacity={cx > a ? 1 : 0}>
            <line x1={a} y1={y} x2={cut ? Math.min(end, failAt) : end} y2={y} stroke={cut ? C.cherryText : C.second} strokeWidth={6} strokeLinecap="round" />
            {cut && cx > failAt && <Cross x={failAt + 14} y={y} k={1} />}
            {!cut && b < 300 && cx > b && <MiniTick x={b + 8} y={y - 2} k={1} />}
          </g>
        );
      })}
      <path d={`M${cx} 200 l-6 9 h12 z`} fill={C.second} />
      {t > 3.0 && (
        <T x={300} y={232} s={12} f={C.cherryText} a="middle" o={easeOut(seg(t, 3.0, 3.4))}>
          no warning: whatever was mid-request fails
        </T>
      )}
    </Svg>
  );
}

// 1 · Predict. The script's two steps, mint new and kill old at once, with the second one questioned. Once answered, the old
// credential's bar stretches past the new one's start and the overlap is lit; the kill moves to the end of it.
export function WhatPreventsFailures({ t, answer }: StepCtx) {
  const s = useSinceAnswer(answer !== null);
  const v = answer !== null ? easeInOut(seg(s, 0.1, 0.8)) : 0;
  const k = (d: number) => easeOut(seg(t, d, d + 0.3));
  const oldEnd = lerp(300, 460, v);
  return (
    <Svg label="The hook's two timelines, now with the overlap window itself highlighted and labeled" h={250}>
      <rect x={25} y={40} width={oldEnd - 25} height={26} rx={4} fill={C.cocoa} stroke={C.mocha} strokeWidth={1.5} opacity={k(0)} />
      <T x={40} y={57} s={12} f={C.crema} o={k(0)}>
        old credential
      </T>
      <rect x={300} y={76} width={275} height={26} rx={4} fill={C.cocoa} stroke={C.focus} strokeWidth={1.5} opacity={k(0.2)} />
      <T x={315} y={93} s={12} f={C.focus} o={k(0.2)}>
        new credential
      </T>
      {v > 0 && <rect x={300} y={34} width={(oldEnd - 300) * 1} height={74} rx={4} fill="none" stroke={C.focus} strokeWidth={1.5} strokeDasharray="4 3" opacity={v} />}
      {v > 0.5 && (
        <T x={380} y={128} s={11} f={C.focus} a="middle" o={v}>
          overlap window
        </T>
      )}
      <Cell x={25} y={150} w={150} label="mint new" o={k(0.4)} />
      <MiniTick x={186} y={162} k={k(0.7)} />
      <Cell x={225} y={150} w={200} label={v > 0.5 ? 'kill old, last' : 'kill old, at once'} o={k(0.6)} stroke={v > 0.5 ? C.focus : C.cherryText} f={v > 0.5 ? C.focus : C.crema} />
      {answer === null && (
        <T x={445} y={169} s={14} f={C.crema} o={k(0.8)}>
          ?
        </T>
      )}
      <Verdict answer={answer} text="keep both valid; cut the old one last" y={225} />
    </Svg>
  );
}

// 2 · What the money buys. The string alone sits on top, free in any config file. Under it the store's three capabilities
// each come alive: a read log filling in, a leaked version rolled back, a gate turning a reader away.
export function NotJustAPlaceToPut({ t }: StepCtx) {
  const k = (d: number) => easeOut(seg(t, d, d + 0.35));
  const back = easeInOut(seg(t, 2.2, 2.8));
  const bounce = easeInOut(seg(t, 3.2, 3.8));
  return (
    <Svg label="One box labeled the string itself, next to three labeled capabilities a secret store or Vault adds on top of it" h={250}>
      <Cell x={200} y={26} w={200} label="the string itself" o={k(0)} />
      <T x={300} y={74} s={11} f={C.latte} a="middle" o={k(0.3)}>
        a config file holds this for free
      </T>
      {['audit log', 'rollback', 'access gate'].map((h, i) => (
        <g key={h} opacity={k(0.8 + i * 0.8)}>
          <rect x={25 + i * 190} y={92} width={170} height={110} rx={6} fill="none" stroke={C.focus} strokeWidth={1.5} />
          <T x={110 + i * 190} y={112} s={12} f={C.focus} a="middle">
            {h}
          </T>
        </g>
      ))}
      {[0, 1, 2].map((j) => (
        <rect key={j} x={40} y={126 + j * 20} width={140 * k(1.0 + j * 0.25)} height={8} rx={2} fill={C.latte} opacity={0.6} />
      ))}
      {[0, 1, 2].map((j) => (
        <rect key={j} x={232 + j * 46} y={150} width={36} height={22} rx={3} fill={j === 2 && t > 2.0 ? C.cherryText : 'none'} fillOpacity={0.6} stroke={C.mocha} strokeWidth={1.2} opacity={k(1.8)} />
      ))}
      <path d={`M${lerp(342, 296, back)} 186 l-5 -8 h10 z`} fill={C.focus} opacity={k(1.8)} />
      <Lock x={445} y={150} k={k(2.6)} f={C.focus} />
      <Pip x={lerp(520, 478, Math.sin(Math.PI * bounce))} y={156} s={9} f={C.latte} o={k(3.0)} />
      {t > 3.8 && (
        <T x={300} y={235} s={12} f={C.latte} a="middle" o={k(3.8)}>
          you pay for these three, not for the string
        </T>
      )}
    </Svg>
  );
}

// 3 · The real database, twice. Top: one role, password changed in place; the in-flight job's old password is rejected.
// Bottom: role b is added beside role a; the job reaches both through the overlap, then role a is cut deliberately.
export function TwoRolesNotOnePassword({ t }: StepCtx) {
  const k = (d: number) => easeOut(seg(t, d, d + 0.35));
  const alter = t > 1.0;
  const bIn = easeOut(seg(t, 2.4, 2.8));
  const cutA = k(3.9);
  return (
    <Svg
      label="A real local database rotation run twice: one role's password changed in place breaks the old connection instantly; a second role with the same access keeps both valid until a deliberate cutover"
      h={250}
    >
      <T x={25} y={28} s={12} f={C.latte} o={k(0)}>
        one role, password changed in place
      </T>
      <Cell x={25} y={40} w={200} label={alter ? 'new_pw_456' : 'old_pw_123'} o={k(0)} stroke={alter ? C.focus : C.mocha} />
      <Lock x={235} y={52} k={k(0)} f={alter ? C.focus : C.latte} />
      <Cell x={400} y={40} w={175} label="job, old_pw_123" o={k(0.2)} />
      <Back x1={395} x2={262} y={54} k={easeInOut(seg(t, 1.2, 1.7))} f={C.cherryText} />
      {t > 1.7 && (
        <T x={400} y={90} s={11} f={C.cherryText} o={k(1.7)}>
          rejected at once
        </T>
      )}
      <T x={25} y={126} s={12} f={C.latte} o={k(2.0)}>
        two roles, same access
      </T>
      <Cell x={25} y={140} w={170} label="role a, pw_a_123" o={k(2.0) * (1 - 0.5 * cutA)} />
      <Lock x={205} y={152} k={k(2.0) * (1 - cutA)} />
      {bIn > 0 && <Cell x={25} y={lerp(210, 180, bIn)} w={170} label="role b, pw_b_456" o={bIn} stroke={C.focus} />}
      {bIn > 0 && <Lock x={205} y={lerp(222, 192, bIn)} k={bIn} f={C.focus} />}
      <rect x={400} y={140} width={175} height={68} rx={4} fill={C.cocoa} stroke={C.mocha} strokeWidth={1.5} opacity={k(2.0)} />
      <T x={487} y={178} s={12} f={C.crema} a="middle" o={k(2.0)}>
        job
      </T>
      <Back x1={395} x2={232} y={154} k={k(2.2) * (1 - cutA)} />
      <Back x1={395} x2={232} y={194} k={easeInOut(seg(t, 2.9, 3.4))} f={C.focus} />
      {t > 3.4 && t < 3.9 && (
        <T x={300} y={126} s={11} f={C.focus} a="middle">
          both valid
        </T>
      )}
      {t > 3.9 && (
        <T x={575} y={238} s={11} f={C.latte} a="end" o={cutA}>
          role a cut only once the job has moved
        </T>
      )}
    </Svg>
  );
}

// 4 · A lease on a clock. dynamic_pw_123's lease drains on its own; connection attempts land in order, the early ones
// ticked, and the identical attempt after the lease runs out refused, with no revoke ever issued.
export function ExpiresWithoutRevoking({ t }: StepCtx) {
  const k = (d: number) => easeOut(seg(t, d, d + 0.3));
  const lease = clamp(seg(t, 0.2, 2.6));
  return (
    <Svg label="A dynamic database credential connects successfully before its expiry and fails the identical attempt after it, with no revoke command run in between" h={250}>
      <Cell x={25} y={30} w={200} label="dynamic_pw_123" o={k(0)} />
      <T x={240} y={48} s={11} f={C.latte} o={k(0)}>
        born with its own lease
      </T>
      <rect x={25} y={74} width={550} height={10} rx={3} fill="none" stroke={C.mocha} strokeWidth={1.2} />
      <rect x={25} y={74} width={550 * (1 - lease)} height={10} rx={3} fill={lease >= 1 ? C.cherryText : C.focus} />
      {lease >= 1 && (
        <T x={25} y={104} s={11} f={C.cherryText}>
          lease ran out
        </T>
      )}
      {[0, 1, 2, 3, 4].map((i) => {
        const at = 0.4 + i * 0.8;
        const ok = at < 2.6;
        const shown = k(at);
        return (
          <g key={i}>
            <Cell x={25 + i * 112} y={134} w={78} label="connect" o={shown} stroke={shown > 0.5 ? (ok ? C.focus : C.cherryText) : C.mocha} />
            {ok ? <MiniTick x={109 + i * 112} y={146} k={k(at + 0.2)} /> : <Cross x={115 + i * 112} y={148} k={k(at + 0.2)} />}
          </g>
        );
      })}
      {t > 3.0 && (
        <T x={300} y={210} s={12} f={C.cherryText} a="middle" o={k(3.0)}>
          the same attempt, now refused
        </T>
      )}
      {t > 3.4 && (
        <T x={300} y={236} s={11} f={C.latte} a="middle" o={k(3.4)}>
          no one ran a revoke
        </T>
      )}
    </Svg>
  );
}

// 5 · The metastore is just a database: anyone who can query it reads the connection string. Then the lookup order: the
// task asks the secrets backend first, it answers, and the two later sources are never reached.
export function AsksTheRealStore({ t }: StepCtx) {
  const k = (d: number) => easeOut(seg(t, d, d + 0.35));
  const steps = ['secrets backend', 'environment variables', 'metastore database'];
  const ask = easeInOut(seg(t, 2.4, 2.9));
  const lit = k(2.9);
  return (
    <Svg label="A task's lookup order drawn as three stacked boxes checked in a fixed sequence, with the secrets backend lit up as the one actually answering" h={250}>
      <Cell x={25} y={30} w={230} label="metastore database" o={k(0)} stroke={k(0.8) > 0.5 && t < 2.2 ? C.cherryText : C.mocha} />
      <Cell x={400} y={30} w={175} label="anyone who queries it" o={k(0.3)} />
      <Back x1={395} x2={260} y={44} k={easeInOut(seg(t, 0.5, 1.0))} f={C.cherryText} />
      <T x={25} y={78} s={11} f={C.cherryText} o={k(1.0)}>
        a typed-in connection string, in plain sight
      </T>
      <Cell x={25} y={161} w={130} label="task runs" o={k(1.8)} />
      {steps.map((st, i) => (
        <g key={st}>
          <Cell
            x={330}
            y={116 + i * 40}
            w={245}
            label={st}
            o={k(2.0 + i * 0.1) * (i === 0 ? 1 : 1 - 0.55 * lit)}
            stroke={i === 0 && lit > 0.5 ? C.focus : C.mocha}
            f={i === 0 && lit > 0.5 ? C.focus : C.crema}
          />
        </g>
      ))}
      <Fan x1={160} y1={175} x2={325} y2={130} k={ask} f={C.focus} />
      {t > 3.2 && (
        <T x={25} y={214} s={11} f={C.focus} o={k(3.2)}>
          asked fresh, first, at run time
        </T>
      )}
      {t > 3.6 && (
        <T x={575} y={244} s={11} f={C.latte} a="end" o={k(3.6)}>
          the other two never reached
        </T>
      )}
    </Svg>
  );
}

// 6 · Three surfaces. An image layer's ENV line ships to every machine that pulls it; a notebook's code is clean but its
// saved output holds the key; DAG code drops the line today but its history keeps it. The scan then catches the first two.
export function ThreeSurfacesOneMistake({ t }: StepCtx) {
  const k = (d: number) => easeOut(seg(t, d, d + 0.35));
  const spread = easeInOut(seg(t, 0.6, 1.4));
  const scan = easeInOut(seg(t, 3.0, 4.0));
  const sx = lerp(25, 385, scan);
  const heads = ['image layer', 'notebook output', 'DAG code'];
  return (
    <Svg label="A scanner run over an image layer and a notebook's committed output, both lighting up as a caught credential, with DAG code named alongside them" h={250}>
      {heads.map((h, i) => (
        <T key={h} x={25 + i * 190} y={28} s={12} f={C.crema} o={k(i * 0.9)}>
          {h}
        </T>
      ))}
      <g opacity={k(0)}>
        {[0, 1, 2].map((j) => (
          <rect key={j} x={25} y={40 + j * 20} width={170} height={16} rx={3} fill={j === 1 ? C.cherryText : 'none'} fillOpacity={0.5} stroke={C.mocha} strokeWidth={1.2} />
        ))}
        <T x={25} y={116} s={11} f={C.cherryText}>
          ENV DATABASE_PASSWORD
        </T>
        {[0, 1, 2, 3].map((j) => (
          <Pip key={j} x={lerp(110, 40 + j * 46, spread)} y={lerp(128, 150, spread)} s={9} f={C.cherryText} o={spread > 0 ? 1 : 0} />
        ))}
        <T x={25} y={176} s={11} f={C.latte} o={k(1.4)}>
          every pull, forever
        </T>
      </g>
      <g opacity={k(0.9)}>
        <Cell x={215} y={40} w={170} h={24} label="code: clean" />
        <Cell x={215} y={70} w={170} h={24} label="api_key=sk_live_…" stroke={C.cherryText} f={C.cherryText} />
        <T x={215} y={116} s={11} f={C.latte}>
          rides in saved output
        </T>
      </g>
      <g opacity={k(1.8)}>
        <line x1={415} y1={56} x2={565} y2={56} stroke={C.mocha} strokeWidth={1.5} />
        {[0, 1, 2, 3].map((j) => (
          <circle
            key={j}
            cx={420 + j * 46}
            cy={56}
            r={7}
            fill={j < 3 ? C.cherryText : C.cocoa}
            fillOpacity={j < 3 ? 0.7 : 1}
            stroke={j < 3 ? C.cherryText : C.focus}
            strokeWidth={1.5}
            opacity={j < 3 ? 1 : k(2.3)}
          />
        ))}
        <T x={405} y={94} s={11} f={C.latte}>
          deleted today,
        </T>
        <T x={405} y={120} s={11} f={C.cherryText} o={k(2.4)}>
          kept in history
        </T>
      </g>
      {t > 3.0 && (
        <g>
          <line x1={25} y1={212} x2={385} y2={212} stroke={C.mocha} strokeWidth={1.2} strokeDasharray="3 4" />
          <Pip x={sx} y={212} s={10} f={C.focus} />
          <MiniTick x={100} y={196} k={sx > 110 ? 1 : 0} />
          <MiniTick x={290} y={196} k={sx > 300 ? 1 : 0} />
        </g>
      )}
      {t > 4.0 && (
        <T x={25} y={244} s={11} f={C.focus} o={k(4.0)}>
          a pattern scan catches both
        </T>
      )}
    </Svg>
  );
}

// 7 · Recap: four lines, each beside a small moving picture of its idea.
export function Recap({ t }: StepCtx) {
  const k = (i: number) => easeOut(seg(t, 0.1 + i * 0.55, 0.5 + i * 0.55));
  const lines = [
    'A store earns its keep: access, audit, rollback',
    'Rotate by adding a credential, never overwriting',
    "Let a credential's own clock revoke it",
    'A secret outlives the one line you deleted',
  ];
  return (
    <Svg label="A rotation script creates a second role, waits a fixed delay, then revokes the first role's login, while one long-running batch job is still mid-run on the old role" h={230}>
      {lines.map((l, i) => (
        <T key={l} x={110} y={44 + i * 50} s={13} f={C.crema} o={k(i)}>
          {l}
        </T>
      ))}
      <Lock x={40} y={34} k={k(0)} f={C.focus} />
      <g opacity={k(1)}>
        <rect x={25} y={80} width={50} height={8} rx={2} fill={C.latte} />
        <rect x={45} y={92} width={lerp(0, 45, easeOut(seg(t, 0.8, 1.4)))} height={8} rx={2} fill={C.focus} />
      </g>
      <g opacity={k(2)}>
        <rect x={25} y={136} width={70} height={8} rx={2} fill="none" stroke={C.mocha} />
        <rect x={25} y={136} width={70 * (1 - clamp(seg(t, 1.2, 2.4)))} height={8} rx={2} fill={C.focus} />
      </g>
      <g opacity={k(3)}>
        {[0, 1, 2].map((j) => (
          <circle key={j} cx={30 + j * 24} cy={190} r={6} fill={j < 2 ? C.cherryText : 'none'} stroke={j < 2 ? C.cherryText : C.focus} strokeWidth={1.5} />
        ))}
      </g>
    </Svg>
  );
}

// 8 · Prove it. Role a and role b overlap; a fixed delay is measured off from role b's creation and role a is cut at its
// end, while a long batch on role a is still running. Once answered, the cut is crossed and the right cut point, zero
// connections left on role a, is marked where the batch actually ends.
export function ProveIt({ t, answer }: StepCtx) {
  const s = useSinceAnswer(answer !== null);
  const v = answer !== null ? easeOut(seg(s, 0.1, 0.6)) : 0;
  const cx = lerp(25, 575, easeInOut(seg(t, 0.2, 2.4)));
  return (
    <Svg label="A rotation script creates a second role, waits a fixed delay, then revokes the first role's login, while one long-running batch job is still mid-run on the old role" h={250}>
      <rect x={25} y={30} width={335} height={24} rx={4} fill={C.cocoa} stroke={C.mocha} strokeWidth={1.5} />
      <T x={37} y={46} s={12} f={C.crema}>
        role a
      </T>
      <rect x={200} y={62} width={375} height={24} rx={4} fill={C.cocoa} stroke={C.focus} strokeWidth={1.5} />
      <T x={212} y={78} s={12} f={C.focus}>
        role b
      </T>
      <line x1={200} y1={100} x2={360} y2={100} stroke={C.latte} strokeWidth={1.5} />
      <path d="M200 94 v12 M360 94 v12" stroke={C.latte} strokeWidth={1.5} />
      <T x={280} y={118} s={11} f={C.latte} a="middle">
        fixed delay
      </T>
      <T x={150} y={136} s={11} f={C.latte}>
        long batch, on role a
      </T>
      <line x1={150} y1={150} x2={Math.max(150, Math.min(cx, 480))} y2={150} stroke={v > 0.5 ? C.cherryText : C.second} strokeWidth={6} strokeLinecap="round" />
      {v > 0 && <Cross x={360} y={166} k={v} />}
      {v > 0 && <line x1={480} y1={26} x2={480} y2={158} stroke={C.focus} strokeWidth={1.5} strokeDasharray="4 3" opacity={v} />}
      <path d={`M${cx} 26 l-6 -9 h12 z`} fill={C.second} />
      <AnswerRow y={196} label="what failed" answer={answer} value="the window" k={easeOut(seg(t, 1.6, 2.0))} f={C.cherryText} />
      <Verdict answer={answer} text="cut at zero connections, not a guess" y={236} />
    </Svg>
  );
}
