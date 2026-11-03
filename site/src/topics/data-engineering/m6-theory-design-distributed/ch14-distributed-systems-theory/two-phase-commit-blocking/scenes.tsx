import { useEffect, useState } from 'react';
import { C, Decode, Draw, Reticle, Svg, T } from '../../../../../reels/kit';
import { easeInOut, easeOut, easeOutBack, lerp, seg } from '../../../../../reels/anim';
import type { StepCtx } from '../../../../../reels/types';

// One small world runs through the whole reel: a coordinator with its log tape at the top, two shards with padlocks
// at the bottom, and messages that travel between them. Red only for a crash or a wrong outcome; pale blue only for
// the second timeline in the production step. Outcomes match examples.py (commit logged before the crash; the
// partitioned 3PC groups finish commit and abort).

type Pt = readonly [number, number];
const H = 320;
const COORD: Pt = [300, 58];
const LEFT: Pt = [150, 250];
const RIGHT: Pt = [450, 250];

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

/** A labelled box; `crash` (0..1) turns it red, breaks its outline and lets it sink. `solid` fills it white. */
function Node({ at, label, w = 150, h = 44, o = 1, crash = 0, solid = 0, s = 14 }: { at: Pt; label: string; w?: number; h?: number; o?: number; crash?: number; solid?: number; s?: number }) {
  const [x, y] = at;
  const dy = crash * 6;
  const stroke = crash > 0.5 ? C.badText : solid > 0.5 ? C.focus : C.crema;
  const text = crash > 0.5 ? C.badText : solid > 0.5 ? C.ink : C.primary;
  return (
    <g opacity={o} transform={`translate(0 ${dy.toFixed(2)})`}>
      <rect x={x - w / 2} y={y - h / 2} width={w} height={h} rx={4} fill={C.panel} stroke={stroke} strokeWidth={1.5} strokeDasharray={crash > 0.5 ? '6 5' : undefined} />
      {solid > 0 && <rect x={x - w / 2} y={y - h / 2} width={w} height={h} rx={4} fill={C.focus} opacity={solid} />}
      <T x={x} y={y + 5} s={s} a="middle" f={text}>
        {label}
      </T>
    </g>
  );
}

/** A log strip under a node; its entry decodes at `at`. `hide` (0..1) puts a grey cover over it that lifts away. */
function Tape({ at: [x, y], text, t, when, w = 120, color = C.focus, o = 1, cover = 0, dy = 0 }: { at: Pt; text: string; t: number; when: number; w?: number; color?: string; o?: number; cover?: number; dy?: number }) {
  const shown = cover < 0.5;
  return (
    <g opacity={o} transform={`translate(0 ${dy.toFixed(2)})`}>
      <rect x={x - w / 2} y={y - 12} width={w} height={24} rx={2} fill={C.band} stroke={C.line} />
      {shown && <Decode text={text} t={t} at={when} x={x} y={y + 5} s={14} a="middle" f={color} w={600} />}
      {cover > 0 && <rect x={x - w / 2 - 2} y={y - 14 - (1 - cover) * 18} width={w + 4} height={28} rx={2} fill={C.mocha} opacity={cover} />}
    </g>
  );
}

/** A padlock: `shut` 0..1 drops the shackle home; it is white while shut, grey while open. */
function Lock({ at: [x, y], shut, o = 1 }: { at: Pt; shut: number; o?: number }) {
  const lift = (1 - shut) * 6;
  const col = shut > 0.5 ? C.focus : C.taupe;
  return (
    <g opacity={o}>
      <path d={`M${x - 5} ${y - lift} V${y - 6 - lift} a5 5 0 0 1 10 0 V${y - lift}`} fill="none" stroke={col} strokeWidth={2} />
      <rect x={x - 8} y={y} width={16} height={12} rx={2} fill={col} />
    </g>
  );
}

/** A check mark that draws itself. */
const Tick = ({ at: [x, y], t, from, color = C.focus }: { at: Pt; t: number; from: number; color?: string }) => (
  <Draw pts={[[x - 9, y], [x - 3, y + 7], [x + 10, y - 8]]} t={t} from={from} to={from + 0.4} stroke={color} w={2.5} pen={false} />
);

/** A message: the arrow draws from a to b over [from, to], a pellet rides its tip, and a head lands at b. */
function Msg({ a, b, t, from, to, color = C.crema, back = false }: { a: Pt; b: Pt; t: number; from: number; to: number; color?: string; back?: boolean }) {
  const [p, q] = back ? [b, a] : [a, b];
  const k = easeInOut(seg(t, from, to));
  if (k <= 0) return null;
  const ang = Math.atan2(q[1] - p[1], q[0] - p[0]);
  const tip: Pt = [lerp(p[0], q[0], k), lerp(p[1], q[1], k)];
  const head = (s: number) => `${(q[0] - 9 * Math.cos(ang + s)).toFixed(1)} ${(q[1] - 9 * Math.sin(ang + s)).toFixed(1)}`;
  return (
    <g>
      <Draw pts={[p, q]} t={t} from={from} to={to} stroke={color} w={1.6} pen={false} />
      {k < 1 && <circle cx={tip[0]} cy={tip[1]} r={4.5} fill={C.focus} />}
      {k >= 1 && <path d={`M${head(0.45)} L${q[0]} ${q[1]} L${head(-0.45)}`} fill="none" stroke={color} strokeWidth={1.6} />}
    </g>
  );
}

const Question = ({ at: [x, y], o }: { at: Pt; o: number }) => (
  <T x={x} y={y} s={24} a="middle" f={C.quiet} o={o} serif>
    ?
  </T>
);

/** The opening world: coordinator with its tape, two shards with locks. */
function World({ t, k = 1, crash = 0, tape = 'COMMIT', tapeAt = 0, cover = 0, lockL = 1, lockR = 1 }: { t: number; k?: number; crash?: number; tape?: string; tapeAt?: number; cover?: number; lockL?: number; lockR?: number }) {
  return (
    <g>
      <Node at={COORD} label="coordinator" w={170} o={k} crash={crash} />
      <Tape at={[COORD[0], COORD[1] + 40]} text={tape} t={t} when={tapeAt} o={k * (1 - crash * 0.45)} cover={cover} dy={crash * 6} />
      <Node at={LEFT} label="inventory" o={k} />
      <Node at={RIGHT} label="payments" o={k} />
      <Lock at={[LEFT[0] + 62, LEFT[1] - 40]} shut={lockL} o={k} />
      <Lock at={[RIGHT[0] + 62, RIGHT[1] - 40]} shut={lockR} o={k} />
    </g>
  );
}

const PREP_L: [Pt, Pt] = [[270, 112], [172, 226]];
const PREP_R: [Pt, Pt] = [[330, 112], [428, 226]];

// 1 · The coordinator logs commit, then dies holding the only copy; both shards sit locked with a question mark.
export function Hook({ t }: StepCtx) {
  const k = easeOut(seg(t, 0, 0.8));
  const lockL = easeOutBack(seg(t, 1.5, 1.8));
  const lockR = easeOutBack(seg(t, 1.7, 2.0));
  const crash = easeOut(seg(t, 3.0, 3.4));
  const doubt = easeOut(seg(t, 3.4, 3.9));
  const ring = easeInOut(seg(t, 3.6, 4.7));
  const arc = Array.from({ length: 49 }, (_, i) => {
    const a = -Math.PI / 2 + (i / 48) * Math.PI * 2;
    return [300 + 30 * Math.cos(a), 250 + 30 * Math.sin(a)] as Pt;
  });
  return (
    <Svg label="a coordinator collects two prepare votes, logs commit, then crashes before announcing it; both participants voted yes and hold locks for an hour" h={H}>
      <World t={t} k={k} crash={crash} tapeAt={2.4} lockL={lockL} lockR={lockR} />
      <Msg a={PREP_L[0]} b={PREP_L[1]} t={t} from={0.6} to={1.2} />
      <Msg a={PREP_R[0]} b={PREP_R[1]} t={t} from={0.8} to={1.4} />
      <Msg a={[262, 112]} b={[164, 226]} t={t} from={1.5} to={2.1} back color={C.quiet} />
      <Msg a={[338, 112]} b={[436, 226]} t={t} from={1.7} to={2.3} back color={C.quiet} />
      <T x={205} y={170} s={13} a="end" f={C.secondary} o={easeOut(seg(t, 0.8, 1.2))}>
        prepare
      </T>
      <T x={398} y={170} s={13} f={C.secondary} o={easeOut(seg(t, 1.8, 2.2))}>
        yes
      </T>
      <Question at={[LEFT[0], 214]} o={doubt} />
      <Question at={[RIGHT[0], 214]} o={doubt} />
      <Draw pts={arc} t={t} from={3.6} to={4.7} stroke={C.secondary} w={1.5} pen={false} />
      {ring > 0 && <line x1={300} y1={250} x2={300 + 22 * Math.cos(-Math.PI / 2 + ring * Math.PI * 2)} y2={250 + 22 * Math.sin(-Math.PI / 2 + ring * Math.PI * 2)} stroke={C.secondary} strokeWidth={1.5} />}
      <T x={300} y={304} s={13} a="middle" f={C.secondary} o={easeOut(seg(t, 4.0, 4.6))}>
        one hour
      </T>
    </Svg>
  );
}

// 2 · The hook's scene, the decision hidden under a cover; three ways out. After the pick: the cover lifts on COMMIT,
// abort is struck red, commit greys out, and the lock-on closes on wait.
export function PredictWait({ t, answer }: StepCtx) {
  const s = useSinceAnswer(answer !== null);
  const on = answer !== null;
  const lift = on ? easeOut(seg(s, 0.1, 0.6)) : 0;
  const strike = on ? easeOut(seg(s, 0.6, 1.0)) : 0;
  const ringA = (t * 0.6) % 1;
  const opts: { x: number; label: string }[] = [
    { x: 150, label: 'abort?' },
    { x: 300, label: 'wait?' },
    { x: 450, label: 'commit?' },
  ];
  return (
    <Svg label="a prepared shard has waited an hour with no word from the coordinator — abort, commit, or wait?" h={H}>
      <World t={on ? lerp(0, 0.6, lift) + 0.6 : 0} crash={1} tapeAt={0.6} cover={1 - lift} />
      <Question at={[LEFT[0], 214]} o={1} />
      <Question at={[RIGHT[0], 214]} o={1} />
      <circle cx={300} cy={250} r={30} fill="none" stroke={C.line} strokeWidth={1.5} />
      <line x1={300} y1={250} x2={300 + 22 * Math.cos(-Math.PI / 2 + ringA * Math.PI * 2)} y2={250 + 22 * Math.sin(-Math.PI / 2 + ringA * Math.PI * 2)} stroke={C.secondary} strokeWidth={1.5} />
      {opts.map((op, i) => {
        const appear = easeOut(seg(t, 0.4 + i * 0.4, 0.9 + i * 0.4));
        const isAbort = i === 0, isWait = i === 1;
        const col = on ? (isAbort ? C.badText : isWait ? C.focus : C.taupe) : C.primary;
        return (
          <g key={op.label} opacity={appear}>
            <T x={op.x} y={306} s={15} a="middle" f={col} w={isWait && on ? 700 : 500}>
              {op.label}
            </T>
            {!isWait && strike > 0 && <line x1={op.x - 34} y1={301} x2={op.x - 34 + 68 * strike} y2={301} stroke={isAbort ? C.badText : C.taupe} strokeWidth={2} />}
          </g>
        );
      })}
      {on && <Reticle x={300} y={300} w={90} h={30} t={s} at={1.1} />}
    </Svg>
  );
}

// 3 · One shard: its own tape records PREPARED, the yes rides up, a gate drops behind it; the coordinator logs
// COMMIT first and only then announces it.
export function RevealPrepare({ t }: StepCtx) {
  const k = easeOut(seg(t, 0, 0.6));
  const lock = easeOutBack(seg(t, 0.6, 0.9));
  const gate = easeOutBack(seg(t, 1.8, 2.2));
  const SH: Pt = [340, 238];
  return (
    <Svg label="prepare asks every participant to durably promise it can commit; once every vote is yes, the coordinator durably logs the decision and only then announces it" h={H}>
      <Node at={COORD} label="coordinator" w={170} o={k} />
      <Tape at={[COORD[0], COORD[1] + 40]} text="COMMIT" t={t} when={2.4} o={k} />
      <Node at={SH} label="shard" w={130} o={k} />
      <Lock at={[SH[0] + 54, SH[1] - 38]} shut={lock} o={k} />
      <Tape at={[SH[0], 286]} text="PREPARED" t={t} when={0.3} w={130} o={k} />
      <Msg a={[340, 112]} b={[340, 214]} t={t} from={1.0} to={1.8} back />
      <T x={356} y={140} s={13} f={C.secondary} o={easeOut(seg(t, 1.2, 1.6))}>
        yes
      </T>
      <g opacity={gate} transform={`translate(${((1 - gate) * -30).toFixed(1)} 0)`}>
        <rect x={318} y={192} width={44} height={6} rx={2} fill={C.focus} />
      </g>
      <T x={372} y={178} s={13} f={C.primary} o={easeOut(seg(t, 2.0, 2.4))}>
        no take-back
      </T>
      <Msg a={[262, 112]} b={[262, 238]} t={t} from={3.4} to={4.3} color={C.focus} />
      <T x={248} y={180} s={13} a="end" f={C.secondary} o={easeOut(seg(t, 3.6, 4.0))}>
        then told
      </T>
      <T x={142} y={104} s={13} a="end" f={C.secondary} o={easeOut(seg(t, 2.6, 3.0))}>
        logged first
      </T>
      <Reticle x={340} y={195} w={70} h={28} t={t} at={4.2} />
    </Svg>
  );
}

// 4 · The shard can't see the coordinator's log; commit and abort both stay possible, flickering in turn, while the
// lock-held bar keeps growing.
export function RevealInDoubt({ t }: StepCtx) {
  const k = easeOut(seg(t, 0, 0.6));
  const fork = easeOut(seg(t, 0.8, 1.4));
  const settle = seg(t, 2.4, 2.8);
  const wave = (ph: number) => lerp(0.35 + 0.65 * (0.5 + 0.5 * Math.cos(t * Math.PI * 2 + ph)), 0.7, settle);
  const bar = easeInOut(seg(t, 2.6, 4.6));
  const SH: Pt = [300, 160];
  return (
    <Svg label="a participant that voted yes is in doubt; it holds its locks until the announcement arrives, which is the lock-hold time" h={H}>
      <g opacity={k}>
        <rect x={210} y={22} width={180} height={34} rx={3} fill={C.mocha} />
        <T x={300} y={44} s={13} a="middle" f={C.secondary}>
          log out of sight
        </T>
      </g>
      <Node at={SH} label="shard" w={130} o={k} />
      <Lock at={[SH[0] + 54, SH[1] - 38]} shut={1} o={k} />
      <Draw pts={[[235, 160], [140, 160]]} t={t} from={0.8} to={1.3} stroke={C.line} w={1.5} pen={false} dash="5 5" />
      <Draw pts={[[365, 160], [460, 160]]} t={t} from={0.8} to={1.3} stroke={C.line} w={1.5} pen={false} dash="5 5" />
      <T x={130} y={165} s={15} a="end" f={C.primary} o={fork * wave(0)}>
        commit
      </T>
      <T x={470} y={165} s={15} f={C.primary} o={fork * wave(Math.PI)}>
        abort
      </T>
      <T x={40} y={252} s={13} f={C.secondary} o={easeOut(seg(t, 2.4, 2.8))}>
        lock held
      </T>
      <rect x={160} y={241} width={380} height={14} rx={3} fill={C.band} opacity={easeOut(seg(t, 2.4, 2.8))} />
      {bar > 0 && <rect x={160} y={241} width={Math.max(3, 380 * bar)} height={14} rx={3} fill={C.focus} />}
      <Reticle x={350} y={248} w={404} h={30} t={t} at={4.2} />
    </Svg>
  );
}

// 5 · 3PC: pre-commit reaches all four, the coordinator dies, one participant finishes alone. Then a partition cuts
// the group, each side promotes a stand-in, and the two sides finish differently.
export function RevealThreePc({ t }: StepCtx) {
  const k = easeOut(seg(t, 0, 0.5));
  const crash = easeOut(seg(t, 1.0, 1.3));
  const cut = seg(t, 2.2, 3.0);
  const standB = easeOut(seg(t, 3.0, 3.4));
  const standC = easeOut(seg(t, 3.3, 3.7));
  const xs = [90, 230, 370, 510];
  const names = ['A', 'B', 'C', 'D'];
  const top: Pt = [300, 46];
  return (
    <Svg label="3PC's pre-commit phase assumes a timeout means a crash, which fails under partition: two separate groups can each finish, differently" h={H}>
      <Node at={top} label="coordinator" w={170} h={40} o={k} crash={crash} />
      <T x={400} y={51} s={13} f={C.secondary} o={easeOut(seg(t, 0.2, 0.6)) * (1 - crash * 0.6)}>
        pre-commit
      </T>
      {xs.map((x, i) => (
        <Msg key={x} a={[300 + (i - 1.5) * 30, 68]} b={[x, 176]} t={t} from={0.2 + i * 0.12} to={0.8 + i * 0.12} color={C.quiet} />
      ))}
      {xs.map((x, i) => (
        <Node key={x} at={[x, 198]} label={names[i]} w={96} h={40} o={k} solid={i === 1 ? standB : i === 2 ? standC : 0} />
      ))}
      <Tick at={[xs[0], 158]} t={t} from={1.4} />
      <Draw pts={[[300, 92], [300, 300]]} t={t} from={2.2} to={3.0} stroke={C.secondary} w={1.5} pen={cut < 1} dash="7 6" />
      <T x={308} y={310} s={13} f={C.secondary} o={easeOut(seg(t, 2.8, 3.2))}>
        partition
      </T>
      <Tape at={[160, 258]} text="COMMIT" t={t} when={4.0} w={130} o={easeOut(seg(t, 3.8, 4.0))} />
      <Tape at={[440, 258]} text="ABORT" t={t} when={4.3} w={130} color={C.badText} o={easeOut(seg(t, 4.1, 4.3))} />
      <Reticle x={300} y={258} w={440} h={36} t={t} at={4.6} />
    </Svg>
  );
}

// 6 · Paxos Commit: the coordinator splits into three acceptors each carrying COMMIT; one dies, a survivor answers
// the shard, which unlocks. Inset: the three fold back into one box, the classic 2PC case.
export function RevealPaxosCommit({ t }: StepCtx) {
  const k = easeOut(seg(t, 0, 0.4));
  const spread = easeInOut(seg(t, 0.2, 1.2));
  const crash = easeOut(seg(t, 1.4, 1.8));
  const resolved = easeOut(seg(t, 2.8, 3.2));
  const unlock = 1 - easeOutBack(seg(t, 2.9, 3.2));
  const fold = easeInOut(seg(t, 3.6, 4.4));
  const xs = [150, 300, 450];
  const SH: Pt = [300, 238];
  return (
    <Svg label="Paxos Commit runs consensus on each prepare vote, surviving the loss of a minority of coordinators; classic 2PC is its own zero-fault special case" h={H}>
      {xs.map((x, i) => {
        const cx = lerp(300, x, spread);
        const c = i === 0 ? crash : 0;
        return (
          <g key={x}>
            <Node at={[cx, 50]} label="acceptor" w={120} h={36} o={i === 1 ? k : k * spread} crash={c} />
            <Tape at={[cx, 88]} text="COMMIT" t={t} when={0.9} w={104} o={(i === 1 ? k : spread) * (1 - c * 0.5)} dy={c * 6} />
          </g>
        );
      })}
      <Msg a={[300, 102]} b={[300, 214]} t={t} from={2.2} to={2.8} color={C.focus} />
      <Node at={SH} label="shard" w={130} o={k} />
      <Lock at={[SH[0] + 54, SH[1] - 38]} shut={unlock} o={k} />
      <Question at={[230, 200]} o={k * (1 - resolved)} />
      <Tick at={[230, 192]} t={t} from={3.0} />
      <g opacity={easeOut(seg(t, 3.4, 3.7))}>
        {[-26, 0, 26].map((d) => (
          <rect key={d} x={500 + d * (1 - fold) - 9} y={262} width={18} height={18} rx={2} fill="none" stroke={C.crema} strokeWidth={1.3} />
        ))}
        <T x={500} y={304} s={13} a="middle" f={C.primary}>
          classic 2PC
        </T>
      </g>
    </Svg>
  );
}

// 7 · Two separate wins. Top: the leader mark leaves a dead replica, the decision stays put. Bottom: the same three
// rounds run one after another (white) against all at once (pale blue), and the gap is the latency saved.
export function RevealProduction({ t }: StepCtx) {
  const k = easeOut(seg(t, 0, 0.5));
  const crash = easeOut(seg(t, 0.8, 1.1));
  const move = easeInOut(seg(t, 1.2, 2.0));
  const xs = [190, 300, 410];
  const markX = lerp(xs[0], xs[1], move);
  const seq = [0, 1, 2].map((i) => easeInOut(seg(t, 2.3 + i * 0.6, 2.9 + i * 0.6)));
  const par = easeInOut(seg(t, 2.3, 2.9));
  const BX = 180, BW = 110;
  return (
    <Svg label="a transaction manager's state lives inside its own replicated consensus group; running every participant's round at once instead of in sequence cuts commit latency" h={H}>
      <g opacity={k}>
        <rect x={110} y={22} width={380} height={130} rx={8} fill="none" stroke={C.line} strokeDasharray="4 5" />
        <T x={122} y={42} s={13} f={C.secondary}>
          tx manager
        </T>
      </g>
      {xs.map((x, i) => (
        <Node key={x} at={[x, 78]} label="replica" w={96} h={34} o={k} crash={i === 0 ? crash : 0} s={13} />
      ))}
      <path d={`M${markX - 8} 52 L${markX} 60 L${markX + 8} 52 Z`} fill={C.focus} opacity={k} />
      <Tape at={[300, 124]} text="COMMIT" t={t} when={0.3} w={130} o={k} />
      <T x={40} y={214} s={13} f={C.secondary} o={easeOut(seg(t, 2.1, 2.4))}>
        in sequence
      </T>
      {seq.map((p, i) => (p > 0 ? <rect key={i} x={BX + i * (BW + 4)} y={200} width={BW * p} height={18} rx={2} fill={C.focus} /> : null))}
      <T x={40} y={270} s={13} f={C.second} o={easeOut(seg(t, 2.1, 2.4))}>
        in parallel
      </T>
      {par > 0 && [0, 1, 2].map((i) => <rect key={i} x={BX} y={252 + i * 7} width={BW * par} height={5} rx={1} fill={C.second} />)}
      <line x1={BX + BW} y1={190} x2={BX + BW} y2={290} stroke={C.second} strokeWidth={1} strokeDasharray="3 4" opacity={easeOut(seg(t, 2.9, 3.2))} />
      <Reticle x={(BX + BW + BX + 3 * BW + 8) / 2} y={240} w={2 * BW + 20} h={84} t={t} at={4.3} />
    </Svg>
  );
}

// 8 · A saga commits step by step and undoes with compensations when one fails; an outbox commits the write and its
// event together, and a relay delivers the event later.
export function RevealSagas({ t }: StepCtx) {
  const k = easeOut(seg(t, 0, 0.4));
  const fail = easeOut(seg(t, 1.3, 1.6));
  const xs = [120, 300, 480];
  const names = ['reserve', 'charge', 'ship'];
  const env = easeInOut(seg(t, 2.8, 3.7));
  const ex = lerp(196, 466, env);
  return (
    <Svg label="a saga breaks a transaction into steps with compensating actions, and the outbox commits an event alongside the write for later delivery — both give up atomicity" h={H}>
      {xs.map((x, i) => (
        <Node key={x} at={[x, 56]} label={names[i]} w={128} h={36} o={k} crash={i === 2 ? fail : 0} />
      ))}
      <Draw pts={[[186, 56], [234, 56]]} t={t} from={0.3} to={0.5} stroke={C.line} w={1.5} pen={false} />
      <Draw pts={[[366, 56], [414, 56]]} t={t} from={0.8} to={1.0} stroke={C.line} w={1.5} pen={false} />
      <Tick at={[xs[0], 20]} t={t} from={0.2} />
      <Tick at={[xs[1], 20]} t={t} from={0.7} />
      <Msg a={[470, 80]} b={[310, 80]} t={t} from={1.6} to={2.1} color={C.secondary} />
      <Msg a={[290, 80]} b={[130, 80]} t={t} from={2.1} to={2.6} color={C.secondary} />
      <T x={390} y={104} s={13} a="middle" f={C.secondary} o={easeOut(seg(t, 1.8, 2.1))}>
        refund
      </T>
      <T x={210} y={104} s={13} a="middle" f={C.secondary} o={easeOut(seg(t, 2.3, 2.6))}>
        release
      </T>
      <g opacity={easeOut(seg(t, 2.0, 2.4))}>
        <T x={150} y={176} s={13} a="middle" f={C.secondary}>
          one commit
        </T>
        <rect x={60} y={190} width={180} height={64} rx={4} fill={C.panel} stroke={C.crema} strokeWidth={1.5} />
        <T x={84} y={227} s={14} f={C.primary}>
          write
        </T>
        <rect x={406} y={202} width={120} height={40} rx={4} fill={C.panel} stroke={C.crema} strokeWidth={1.5} />
        <T x={466} y={276} s={13} a="middle" f={C.secondary}>
          queue
        </T>
        <T x={330} y={206} s={13} a="middle" f={C.secondary}>
          relay, later
        </T>
      </g>
      <g opacity={easeOut(seg(t, 2.2, 2.5))} transform={`translate(${(ex - 196).toFixed(1)} 0)`}>
        <rect x={180} y={212} width={32} height={22} rx={2} fill={C.focus} />
        <path d="M181 213 L196 225 L211 213" fill="none" stroke={C.ink} strokeWidth={1.6} />
      </g>
    </Svg>
  );
}

// 9 · The hook again, but the COMMIT tape is copied to three replicas before the coordinator dies, so both shards
// read the decision and unlock.
export function Recap({ t }: StepCtx) {
  const k = easeOut(seg(t, 0, 0.6));
  const crash = easeOut(seg(t, 2.6, 3.0));
  const resolved = easeOut(seg(t, 3.6, 4.0));
  const unlock = 1 - easeOutBack(seg(t, 3.8, 4.2));
  const xs = [160, 300, 440];
  return (
    <Svg label="a yes vote cannot be taken back, so a crashed coordinator leaves participants blocked; 3PC needs a partition-free network; Paxos Commit replicates the decision, with 2PC as its own special case" h={H}>
      <World t={t} k={k} crash={crash} tapeAt={0.2} lockL={unlock} lockR={unlock} />
      {xs.map((x, i) => {
        const fly = easeInOut(seg(t, 1.2 + i * 0.2, 2.0 + i * 0.2));
        if (fly <= 0) return null;
        return <Tape key={x} at={[lerp(300, x, fly), lerp(98, 164, fly)]} text="COMMIT" t={99} when={0} w={96} o={fly} />;
      })}
      <Msg a={[160, 176]} b={[150, 226]} t={t} from={3.3} to={3.7} color={C.focus} />
      <Msg a={[440, 176]} b={[450, 226]} t={t} from={3.3} to={3.7} color={C.focus} />
      <Question at={[LEFT[0] - 40, 214]} o={k * (1 - resolved)} />
      <Question at={[RIGHT[0] - 40, 214]} o={k * (1 - resolved)} />
      <Tick at={[LEFT[0] - 40, 206]} t={t} from={3.8} />
      <Tick at={[RIGHT[0] - 40, 206]} t={t} from={3.9} />
      <Reticle x={300} y={164} w={420} h={36} t={t} at={4.2} />
    </Svg>
  );
}

// 10 · The solved picture, then after the pick three narrower failures light up red: a shard's own crash, a lost
// message, and a replica group that has lost its majority.
export function ProveIt({ t, answer }: StepCtx) {
  const s = useSinceAnswer(answer !== null);
  const on = answer !== null;
  const k = easeOut(seg(t, 0, 0.6));
  const b1 = on ? easeOut(seg(s, 0.2, 0.5)) : 0;
  const b2 = on ? easeOut(seg(s, 0.8, 1.1)) : 0;
  const b3 = on ? easeOut(seg(s, 1.4, 1.7)) : 0;
  const xs = [160, 300, 440];
  return (
    <Svg label="a team replicates the coordinator's decision and calls the blocking problem solved for good — what does that fix, and what can still go wrong?" h={H}>
      <Node at={COORD} label="coordinator" w={170} o={k} crash={1} />
      {xs.map((x, i) => (
        <g key={x} opacity={i > 0 ? 1 - b3 * 0.7 : 1}>
          <Tape at={[x, 164]} text="COMMIT" t={99} when={0} w={96} o={k} color={i > 0 && b3 > 0.5 ? C.taupe : C.focus} />
        </g>
      ))}
      <Node at={LEFT} label="inventory" o={k} crash={b1} />
      <Node at={RIGHT} label="payments" o={k} />
      <Draw pts={[[160, 176], [150, 226]]} t={t} from={0.6} to={1.0} stroke={C.focus} w={1.6} pen={false} />
      <Draw pts={[[440, 176], [450, 226]]} t={t} from={0.6} to={1.0} stroke={C.focus} w={1.6} pen={false} o={1 - b2} />
      {b2 > 0 && (
        <g opacity={b2}>
          <line x1={440} y1={176} x2={444} y2={196} stroke={C.badText} strokeWidth={1.6} />
          <path d="M437 204 L455 218 M455 204 L437 218" stroke={C.badText} strokeWidth={2} />
        </g>
      )}
      <T x={300} y={306} s={14} a="middle" f={C.secondary} o={k * (1 - b1)}>
        solved for good?
      </T>
      <T x={LEFT[0]} y={300} s={13} a="middle" f={C.badText} o={b1}>
        own crash
      </T>
      <T x={RIGHT[0]} y={300} s={13} a="middle" f={C.badText} o={b2}>
        lost message
      </T>
      <T x={300} y={206} s={13} a="middle" f={C.badText} o={b3}>
        no majority
      </T>
      {on && <Reticle x={370} y={164} w={250} h={36} t={s} at={2.0} color={C.badText} />}
    </Svg>
  );
}
