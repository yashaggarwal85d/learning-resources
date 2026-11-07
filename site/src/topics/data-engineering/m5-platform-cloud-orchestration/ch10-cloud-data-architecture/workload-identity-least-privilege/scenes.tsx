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

function Bolt({ x, y, k }: { x: number; y: number; k: number }) {
  return <path d={`M${x + 4} ${y - 12} l-8 12 h7 l-5 12 l11 -15 h-7 l5 -9 z`} fill={C.cherryText} opacity={k} />;
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

// 0 · Same theft, two designs. Top: a static key's validity bar runs unbroken, and once stolen it opens raw and curated
// alike. Bottom: short credentials are minted and expire one after another, scoped to raw; the stolen one is already dead.
export function StolenKeyVsCredential({ t }: StepCtx) {
  const k = (d: number) => easeOut(seg(t, d, d + 0.35));
  const bar = easeInOut(seg(t, 0.2, 1.0));
  const stolen1 = k(1.3);
  const slot = Math.floor(clamp(seg(t, 2.0, 3.6)) * 9.99);
  const stolen2 = k(3.0);
  return (
    <Svg
      label="A static key's validity bar stretches unbroken across one wide box labeled raw and curated; a federated credential's validity bar is a row of short ticks, each scoped to a narrow raw-only box"
      h={250}
    >
      <T x={25} y={30} s={12} f={C.latte} o={k(0)}>
        static key
      </T>
      <rect x={25} y={38} width={550 * bar} height={8} rx={2} fill={C.cherryText} opacity={0.75} />
      <Cell x={25} y={56} w={150} label="access key" o={k(0)} />
      <Req x1={180} x2={325} y={70} k={k(0.6)} f={stolen1 > 0.5 ? C.cherryText : C.crema} />
      <Cell x={330} y={56} w={110} label="raw" o={k(0.6)} stroke={stolen1 > 0.5 ? C.cherryText : C.mocha} />
      <Cell x={460} y={56} w={115} label="curated" o={k(0.6)} stroke={stolen1 > 0.5 ? C.cherryText : C.mocha} />
      {t > 1.3 && (
        <T x={25} y={104} s={11} f={C.cherryText} o={stolen1}>
          stolen years later: still works, reaches both
        </T>
      )}
      <T x={25} y={140} s={12} f={C.latte} o={k(1.8)}>
        federated credential
      </T>
      {Array.from({ length: 10 }, (_, i) => {
        const live = t > 2.0 && i === slot;
        const past = t > 2.0 && i < slot;
        return (
          <rect
            key={i}
            x={25 + i * 55}
            y={148}
            width={45}
            height={8}
            rx={2}
            fill={live ? C.focus : 'none'}
            stroke={past ? C.mocha : live ? C.focus : C.mocha}
            strokeWidth={1.2}
            opacity={k(1.8) * (past ? 0.5 : 1)}
          />
        );
      })}
      <Cell x={25} y={166} w={150} label="role credential" o={k(1.8)} stroke={stolen2 > 0.5 ? C.cherryText : C.mocha} />
      <Req x1={180} x2={325} y={180} k={k(2.0) * (1 - 0.6 * stolen2)} />
      <Cell x={330} y={166} w={110} label="raw" o={k(2.0)} />
      <Cell x={460} y={166} w={115} label="curated" o={k(2.0) * 0.35} />
      {t > 3.0 && (
        <T x={25} y={232} s={11} f={C.focus} o={stolen2}>
          the stolen copy expired minutes ago, and never reached curated
        </T>
      )}
    </Svg>
  );
}

// 1 · Predict. The laptop's own defenses are crossed out on the left, failed both times. The second credential waits on the
// right with a question; once answered, its short validity window and single-role scope appear.
export function WhatMadeTheDifference({ t, answer }: StepCtx) {
  const s = useSinceAnswer(answer !== null);
  const v = answer !== null ? easeOut(seg(s, 0.1, 0.6)) : 0;
  const k = (d: number) => easeOut(seg(t, d, d + 0.3));
  return (
    <Svg label="The federated credential's validity window is highlighted and labeled with its own lifetime, separate from the laptop's own defenses" h={250}>
      <T x={25} y={30} s={12} f={C.latte} o={k(0)}>
        the laptop's own defenses
      </T>
      <Cell x={25} y={44} w={125} label="encrypted disk" o={k(0.1)} />
      <Cross x={162} y={58} k={k(0.5)} />
      <Cell x={180} y={44} w={95} label="firewall" o={k(0.2)} />
      <Cross x={287} y={58} k={k(0.7)} />
      <T x={25} y={98} s={11} f={C.latte} o={k(0.8)}>
        failed both times
      </T>
      <T x={325} y={30} s={12} f={C.latte} o={k(0)}>
        the second credential
      </T>
      {answer === null ? (
        <T x={450} y={64} s={14} f={C.crema} a="middle" o={k(0.4)}>
          ?
        </T>
      ) : (
        <g opacity={v}>
          <rect x={325} y={44} width={70 * v} height={28} rx={4} fill={C.focus} opacity={0.8} />
          <T x={325} y={92} s={11} f={C.focus}>
            short-lived
          </T>
          <Cell x={430} y={44} w={145} label="one role" stroke={C.focus} f={C.focus} />
          <T x={430} y={92} s={11} f={C.focus}>
            scoped
          </T>
        </g>
      )}
      <AnswerRow y={170} label="the difference" answer={answer} value="short-lived, one role" k={k(0.9)} />
    </Svg>
  );
}

// 2 · One exchange. The workload hands its proof to the broker; the broker mints a credential whose validity bar starts
// draining at once. Then each vendor's name for the same exchange, AWS's two first.
export function ThreeCloudsBrokerPattern({ t }: StepCtx) {
  const k = (d: number) => easeOut(seg(t, d, d + 0.35));
  const life = clamp(seg(t, 1.6, 4.8));
  const names = ['AWS: IRSA, via an identity provider', 'AWS: Pod Identity, newer, skips that step', 'GKE: Workload Identity Federation', 'Azure: Entra workload identity'];
  return (
    <Svg label="One shared diagram: a workload proves its identity to a broker, and the broker hands back a short-lived credential, with each cloud's own name filled in underneath" h={250}>
      <Cell x={25} y={30} w={140} label="workload" o={k(0)} />
      <Cell x={230} y={30} w={140} label="broker" o={k(0.2)} stroke={k(0.7) > 0.5 ? C.focus : C.mocha} />
      <Cell x={435} y={30} w={140} label="credential" o={k(1.1)} stroke={C.focus} f={C.focus} />
      <Req x1={170} x2={225} y={44} k={easeInOut(seg(t, 0.4, 0.9))} label="proof" />
      <Req x1={375} x2={430} y={44} k={easeInOut(seg(t, 0.9, 1.4))} label="mints" f={C.focus} />
      <rect x={435} y={64} width={Math.max(0, 140 * (1 - life)) * k(1.3)} height={6} rx={2} fill={C.focus} />
      <T x={435} y={86} s={11} f={C.latte} o={k(1.6)}>
        expires soon
      </T>
      {names.map((n, i) => (
        <g key={n} opacity={k(2.0 + i * 0.6)}>
          <Pip x={31} y={128 + i * 32} s={8} f={i < 2 ? C.second : C.latte} />
          <T x={45} y={132 + i * 32} s={12} f={C.crema}>
            {n}
          </T>
        </g>
      ))}
    </Svg>
  );
}

// 3 · Two gates in a row. One principal stops at the trust gate (can't become the role); one gets through it but stops at
// the permission gate for an action it isn't allowed; one passes both.
export function TrustVsPermission({ t }: StepCtx) {
  const lanes: [number, string, string][] = [
    [190, 'not trusted: never becomes the role', C.cherryText],
    [390, 'became the role, action denied', C.cherryText],
    [470, 'became the role, action allowed', C.focus],
  ];
  const g = easeOut(seg(t, 0, 0.4));
  return (
    <Svg label="Two independent gates in sequence on one role: who may assume it, then what it may do, both required before a credential does anything" h={250}>
      <T x={200} y={20} s={12} f={C.crema} a="middle" o={g}>
        trust policy
      </T>
      <T x={200} y={44} s={11} f={C.latte} a="middle" o={g}>
        who may become it
      </T>
      <T x={400} y={20} s={12} f={C.crema} a="middle" o={g}>
        permission policy
      </T>
      <T x={400} y={44} s={11} f={C.latte} a="middle" o={g}>
        what it may do
      </T>
      {[200, 400].map((x) => (
        <rect key={x} x={x - 3} y={54} width={6} height={150} rx={2} fill={C.mocha} opacity={g} />
      ))}
      {lanes.map(([stop, text, f], i) => {
        const d = 0.4 + i * 1.0;
        const p = easeInOut(seg(t, d, d + 0.8));
        const y = 76 + i * 50;
        const done = p >= 1;
        return (
          <g key={text}>
            <Pip x={lerp(40, stop, p)} y={y} s={10} f={i === 2 ? C.focus : C.latte} o={p > 0 ? 1 : 0} />
            {done && i < 2 && <Cross x={stop + 25} y={y} k={easeOut(seg(t, d + 0.8, d + 1.0))} />}
            {done && i === 2 && <MiniTick x={stop + 18} y={y - 2} k={easeOut(seg(t, d + 0.8, d + 1.0))} />}
            <T x={575} y={y + 22} s={11} f={f} a="end" o={easeOut(seg(t, d + 0.8, d + 1.1))}>
              {text}
            </T>
          </g>
        );
      })}
      {t > 3.6 && (
        <T x={300} y={238} s={12} f={C.focus} a="middle" o={easeOut(seg(t, 3.6, 4.0))}>
          both gates must open
        </T>
      )}
    </Svg>
  );
}

// 4 · Same cap, two sizes. Top: the identity policy and the boundary overlap; s3:GetObject slides into the overlap and
// stays, iam:CreateUser is cut. Bottom: a full-access catalog meets an account's SCP; only s3:* and ec2:* survive.
export function BoundaryAndGuardrail({ t }: StepCtx) {
  const k = (d: number) => easeOut(seg(t, d, d + 0.35));
  const slide = easeInOut(seg(t, 0.9, 1.6));
  const cut = k(1.7);
  const cut2 = k(3.6);
  const cat: [string, number, number, boolean][] = [
    ['s3:*', 35, 60, true],
    ['ec2:*', 105, 60, true],
    ['iam:*', 185, 60, false],
    ['rds:DeleteDBInstance', 275, 170, false],
  ];
  return (
    <Svg label="A permission policy's region shrinks once intersected with a smaller permission-boundary region, then the same cap is redrawn at account scale as an SCP" h={250}>
      <rect x={25} y={38} width={320} height={76} rx={6} fill="none" stroke={C.latte} strokeWidth={1.5} opacity={k(0)} />
      <T x={25} y={32} s={11} f={C.latte} o={k(0)}>
        identity policy
      </T>
      <rect x={225} y={38} width={350} height={76} rx={6} fill={C.second} fillOpacity={0.12 * k(0.3)} stroke={C.second} strokeWidth={1.5} opacity={k(0.3)} />
      <T x={575} y={32} s={11} f={C.second} a="end" o={k(0.3)}>
        boundary
      </T>
      <Cell x={35} y={48} w={125} label="iam:CreateUser" o={k(0.1) * (1 - 0.6 * cut)} />
      {cut > 0 && <Cross x={172} y={62} k={cut} />}
      <Cell x={lerp(35, 232, slide)} y={80} w={106} label="s3:GetObject" o={k(0.1)} stroke={cut > 0.5 ? C.focus : C.mocha} f={cut > 0.5 ? C.focus : C.crema} />
      <Cell x={360} y={48} w={105} label="cloudwatch:*" o={k(0.4)} />
      <Cell x={480} y={48} w={80} label="ec2:*" o={k(0.4)} />
      <Cell x={360} y={80} w={60} label="s3:*" o={k(0.4)} />
      {t > 2.6 && (
        <g opacity={k(2.6)}>
          <T x={25} y={146} s={11} f={C.cherryText}>
            SCP: the whole account, root included
          </T>
          <rect x={25} y={154} width={550} height={50} rx={6} fill="none" stroke={C.cherryText} strokeWidth={1.5} />
          {cat.map(([label, x, w, keep]) => (
            <g key={label}>
              <Cell x={x} y={165} w={w} label={label} o={keep ? 1 : 1 - 0.6 * cut2} stroke={keep && cut2 > 0.5 ? C.focus : C.mocha} f={keep && cut2 > 0.5 ? C.focus : C.crema} />
              {!keep && <Cross x={x + w + 12} y={179} k={cut2} />}
            </g>
          ))}
          <rect x={30} y={160} width={140} height={38} rx={5} fill="none" stroke={C.focus} strokeWidth={1.5} strokeDasharray="4 3" opacity={k(3.2)} />
        </g>
      )}
      {t > 4.0 && (
        <T x={300} y={236} s={12} f={C.focus} a="middle" o={k(4.0)}>
          neither one ever grants; both only cap
        </T>
      )}
    </Svg>
  );
}

// 5 · The escalation, run twice. Top (Resource: *): alice launches an instance and passes it admin-role, so the instance
// holds s3:*, ec2:* and iam:*. Bottom (Resource: role/limited-*): the same pass of admin-role is refused mid-way, and
// limited-reader still goes through.
export function EscalationReproduced({ t }: StepCtx) {
  const k = (d: number) => easeOut(seg(t, d, d + 0.35));
  const pass1 = easeInOut(seg(t, 0.8, 1.4));
  const tryAdmin = easeInOut(seg(t, 2.8, 3.3)) * 0.5;
  const passLim = easeInOut(seg(t, 3.6, 4.2));
  return (
    <Svg
      label="A policy evaluator runs twice: wide PassRole lets a launch escalate to an admin role's permissions; scoped PassRole rejects the same admin role while still allowing an approved one"
      h={250}
    >
      <T x={25} y={28} s={12} f={C.latte} o={k(0)}>
        PassRole, Resource: *
      </T>
      <Cell x={25} y={40} w={100} label="alice" o={k(0)} />
      <Req x1={130} x2={195} y={54} k={k(0.3)} label="launch" />
      <Cell x={200} y={40} w={110} label="instance" o={k(0.3)} stroke={pass1 >= 1 ? C.cherryText : C.mocha} />
      <Cell x={420} y={40} w={155} label="admin-role" o={k(0.5)} />
      <Back x1={415} x2={315} y={54} k={pass1} f={C.cherryText} />
      {t > 1.5 && (
        <T x={200} y={92} s={11} f={C.cherryText} o={k(1.5)}>
          instance now holds s3:*, ec2:*, iam:*
        </T>
      )}
      <T x={25} y={138} s={12} f={C.latte} o={k(2.2)}>
        PassRole, Resource: role/limited-*
      </T>
      <Cell x={25} y={150} w={100} label="alice" o={k(2.2)} />
      <Req x1={130} x2={195} y={164} k={k(2.4)} label="launch" />
      <Cell x={200} y={150} w={110} label="instance" o={k(2.4)} />
      <Cell x={420} y={150} w={155} label="admin-role" o={k(2.6)} />
      <Back x1={415} x2={315} y={164} k={tryAdmin} f={C.cherryText} />
      {t > 3.3 && <Cross x={355} y={182} k={k(3.3)} />}
      <Cell x={420} y={196} w={155} label="limited-reader" o={k(3.4)} stroke={passLim >= 1 ? C.focus : C.mocha} />
      <path d={`M415 210 H${lerp(415, 330, passLim)} V178`} fill="none" stroke={C.focus} strokeWidth={1.8} opacity={passLim > 0 ? 1 : 0} />
      {passLim >= 1 && <MiniTick x={318} y={226} k={k(4.2)} />}
    </Svg>
  );
}

// 6 · Raw and curated as two companies in one building. A breach strikes the raw role and floods it; its permissions
// try for the curated role and stop dead at the wall between them. The two sets share nothing.
export function RawVsCuratedRoles({ t }: StepCtx) {
  const k = (d: number) => easeOut(seg(t, d, d + 0.35));
  const hit = k(1.0);
  const push = easeInOut(seg(t, 1.5, 2.0)) * 0.55;
  return (
    <Svg label="A breach arrow hits a raw-role box and visibly stops at its boundary, never reaching a separate curated-role box" h={250}>
      <T x={25} y={30} s={12} f={hit > 0.5 ? C.cherryText : C.latte} o={k(0)}>
        raw role
      </T>
      <T x={325} y={30} s={12} f={C.latte} o={k(0.2)}>
        curated role
      </T>
      <rect x={25} y={40} width={250} height={110} rx={8} fill={C.bad} fillOpacity={0.18 * hit} stroke={hit > 0.5 ? C.cherryText : C.mocha} strokeWidth={1.5} opacity={k(0)} />
      <rect x={325} y={40} width={250} height={110} rx={8} fill="none" stroke={C.mocha} strokeWidth={1.5} opacity={k(0.2)} />
      <Cell x={40} y={60} w={195} label="s3:GetObject:raw/*" o={k(0.3)} />
      <Cell x={40} y={104} w={195} label="s3:PutObject:raw/*" o={k(0.4)} />
      <Cell x={340} y={80} w={220} label="s3:GetObject:curated/*" o={k(0.5)} />
      <Bolt x={255} y={lerp(18, 60, easeIn2(seg(t, 0.7, 1.0)))} k={t > 0.7 ? 1 - 0.4 * hit : 0} />
      <Req x1={278} x2={322} y={95} k={push} f={C.cherryText} />
      {t > 2.0 && <Cross x={300} y={122} k={k(2.0)} />}
      {t > 2.6 && (
        <T x={300} y={196} s={13} f={C.focus} a="middle" o={k(2.6)}>
          shared permissions: none
        </T>
      )}
      {t > 3.1 && (
        <T x={300} y={226} s={12} f={C.latte} a="middle" o={k(3.1)}>
          the stolen key opens nothing next door
        </T>
      )}
    </Svg>
  );
}

function easeIn2(x: number) {
  return x * x;
}

// 7 · Recap: four lines, each beside a small moving picture of its idea, then what comes next.
export function Recap({ t }: StepCtx) {
  const k = (i: number) => easeOut(seg(t, 0.1 + i * 0.5, 0.5 + i * 0.5));
  const lines = ['Roles instead of static keys, everywhere', 'Trust, permission, boundary, guardrail: four gates', 'Scope which roles a principal may pass', 'Raw and curated roles share nothing'];
  return (
    <Svg
      label="A CI service account is given permission to pass any role in the account, reasoning that today's roles are already scoped tightly; the gap reopens the moment a higher-privileged role is created later"
      h={250}
    >
      {lines.map((l, i) => (
        <T key={l} x={110} y={44 + i * 48} s={13} f={C.crema} o={k(i)}>
          {l}
        </T>
      ))}
      <g opacity={k(0)}>
        {[0, 1, 2].map((j) => (
          <rect key={j} x={25 + j * 22} y={32} width={16} height={8} rx={2} fill={j <= Math.floor(clamp(seg(t, 0.2, 1.4)) * 2.99) ? C.focus : 'none'} stroke={C.mocha} />
        ))}
      </g>
      <g opacity={k(1)}>
        {[0, 1, 2, 3].map((j) => (
          <rect key={j} x={30 + j * 16} y={76} width={5} height={20} rx={1} fill={C.mocha} />
        ))}
        <Pip x={lerp(25, 90, easeInOut(seg(t, 0.8, 1.8)))} y={86} s={7} f={C.focus} />
      </g>
      <Lock x={40} y={130} k={k(2)} f={C.focus} />
      <g opacity={k(3)}>
        <rect x={25} y={170} width={26} height={18} rx={3} fill="none" stroke={C.cherryText} />
        <rect x={59} y={170} width={26} height={18} rx={3} fill="none" stroke={C.focus} />
      </g>
      {t > 2.4 && (
        <T x={300} y={240} s={12} f={C.focus} a="middle" o={easeOut(seg(t, 2.4, 2.8))}>
          next: the secret a role can't replace
        </T>
      )}
    </Svg>
  );
}

// 8 · Prove it. The pipeline may pass any role; today it fans out to three tight roles, each ticked. Once answered, a new,
// far stronger role appears below and the same fan reaches it too.
export function ProveIt({ t, answer }: StepCtx) {
  const s = useSinceAnswer(answer !== null);
  const v = answer !== null ? easeOut(seg(s, 0.1, 0.6)) : 0;
  const reach = answer !== null ? easeInOut(seg(s, 0.6, 1.2)) : 0;
  const k = (d: number) => easeOut(seg(t, d, d + 0.4));
  return (
    <Svg
      label="A CI service account is given permission to pass any role in the account, reasoning that today's roles are already scoped tightly; the gap reopens the moment a higher-privileged role is created later"
      h={250}
    >
      <Cell x={25} y={66} w={150} label="CI pipeline" />
      <T x={25} y={58} s={11} f={C.latte}>
        may pass any role
      </T>
      {[0, 1, 2].map((i) => (
        <g key={i}>
          <Fan x1={175} y1={80} x2={375} y2={34 + i * 34} k={k(0.3 + i * 0.4)} />
          <Cell x={380} y={20 + i * 34} w={150} h={26} label="tight role" o={k(0.3 + i * 0.4)} />
          <MiniTick x={545} y={32 + i * 34} k={k(0.6 + i * 0.4)} />
        </g>
      ))}
      {v > 0 && <Cell x={380} y={130} w={150} h={26} label="new admin role" o={v} stroke={C.cherryText} f={C.cherryText} />}
      <Fan x1={175} y1={80} x2={375} y2={143} k={reach} f={C.cherryText} />
      <AnswerRow y={190} label="safe for good?" answer={answer} value="no" k={k(1.8)} f={C.cherryText} />
      <Verdict answer={answer} text="any role includes roles made later" y={232} />
    </Svg>
  );
}
