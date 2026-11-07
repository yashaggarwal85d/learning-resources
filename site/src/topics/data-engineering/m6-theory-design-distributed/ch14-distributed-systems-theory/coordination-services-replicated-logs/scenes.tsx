import { useEffect, useState } from 'react';
import { C, Decode, Draw, Reticle, Svg, T } from '../../../../../reels/kit';
import { easeInOut, easeOut, easeOutBack, lerp, seg } from '../../../../../reels/anim';
import type { StepCtx } from '../../../../../reels/types';

// The chapter's broker lanes (CHAPTER.md, topic 11): three brokers as lanes, the in-sync set as a bracket around the
// lanes in it, log entries as small boxes. examples.py's hook: replication factor three, the in-sync set shrunk to the
// leader and one follower, the write acknowledged once both have it, then both lost; its four combinations of
// min.insync.replicas and unclean election; one failure tolerated by three replicas under majority vote and two under
// the in-sync rule; and the Iceberg commit as a compare-and-swap that writer A wins and writer B retries.

type Pt = readonly [number, number];

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

const Check = ({ at: [x, y], t, from, f = C.focus }: { at: Pt; t: number; from: number; f?: string }) => (
  <Draw pts={[[x - 8, y], [x - 2, y + 7], [x + 10, y - 8]]} t={t} from={from} to={from + 0.3} stroke={f} w={2.4} pen={false} />
);
const Cross = ({ at: [x, y], o }: { at: Pt; o: number }) => (o > 0 ? <path d={`M${x - 8} ${y - 8} l16 16 M${x + 8} ${y - 8} l-16 16`} stroke={C.badText} strokeWidth={2.4} opacity={o} /> : null);

function Arrow({ a, b, t, from, to, f = C.secondary }: { a: Pt; b: Pt; t: number; from: number; to: number; f?: string }) {
  const k = easeInOut(seg(t, from, to));
  if (k <= 0) return null;
  const tip: Pt = [lerp(a[0], b[0], k), lerp(a[1], b[1], k)];
  const ang = Math.atan2(b[1] - a[1], b[0] - a[0]);
  const head = (s: number) => `${(b[0] - 8 * Math.cos(ang + s)).toFixed(1)} ${(b[1] - 8 * Math.sin(ang + s)).toFixed(1)}`;
  return (
    <g>
      <line x1={a[0]} y1={a[1]} x2={tip[0]} y2={tip[1]} stroke={f} strokeWidth={1.5} />
      {k < 1 ? <circle cx={tip[0]} cy={tip[1]} r={4} fill={C.focus} /> : <path d={`M${head(0.45)} L${b[0]} ${b[1]} L${head(-0.45)}`} fill="none" stroke={f} strokeWidth={1.5} />}
    </g>
  );
}

/** A log entry box. */
function Entry({ at: [x, y], label = '', k = 1, f = C.secondary, fill = false, dashed = false, w = 30 }: { at: Pt; label?: string; k?: number; f?: string; fill?: boolean; dashed?: boolean; w?: number }) {
  if (k <= 0) return null;
  return (
    <g opacity={Math.min(1, k)}>
      <rect x={x - w / 2} y={y - 11} width={w} height={22} rx={3} fill={fill ? f : C.panel} stroke={f} strokeWidth={1.4} strokeDasharray={dashed ? '4 3' : undefined} />
      {label && (
        <T x={x} y={y + 5} s={13} a="middle" f={fill ? C.void : f} w={fill ? 600 : 400}>
          {label}
        </T>
      )}
    </g>
  );
}

function Lane({ y, name, k = 1, dark = 0, x0 = 140 }: { y: number; name: string; k?: number; dark?: number; x0?: number }) {
  return (
    <g opacity={k}>
      <T x={x0 - 12} y={y + 5} s={13} a="end" f={dark > 0.5 ? C.quiet : C.secondary}>
        {name}
      </T>
      <line x1={x0} y1={y} x2={560} y2={y} stroke={C.band} strokeWidth={1.2} />
      {dark > 0 && <rect x={x0} y={y - 16} width={420 * dark} height={32} fill={C.void} opacity={0.75} />}
    </g>
  );
}

const BY = [64, 124, 184];
const BN = ['leader', 'follower one', 'follower two'];

/** The in-sync set: a bracket on the left spanning lanes [0, n). */
function Isr({ n, k = 1 }: { n: number; k?: number }) {
  const y0 = BY[0] - 20, y1 = lerp(BY[0], BY[2], (n - 1) / 2) + 20;
  return (
    <g opacity={k}>
      <path d={`M24 ${y0} L16 ${y0} L16 ${y1} L24 ${y1}`} fill="none" stroke={C.focus} strokeWidth={1.8} />
      <T x={10} y={y0 - 8} s={13} f={C.focus}>
        in sync
      </T>
    </g>
  );
}

// 1 · Three brokers. Follower two lags and the in-sync bracket shrinks to the top two lanes. The write lands on the
// leader, copies to follower one, and an ack goes out. The top two lanes go dark together; follower two stands alone
// with an empty, red-dashed slot where the write should be.
export function Hook({ t }: StepCtx) {
  const n = lerp(3, 2, easeInOut(seg(t, 0.5, 1.0)));
  const dead = easeOut(seg(t, 2.5, 2.9));
  return (
    <Svg label="a write is acknowledged by both in-sync replicas; then both fail together, leaving only the one replica that was already dropped from the in-sync set" h={300}>
      {BN.map((name, i) => (
        <Lane key={name} y={BY[i]} name={name} k={easeOut(seg(t, i * 0.1, 0.3 + i * 0.1))} dark={i < 2 ? dead : 0} />
      ))}
      <Isr n={n} k={easeOut(seg(t, 0.2, 0.5))} />
      {[0, 1].map((j) => <Entry key={j} at={[180 + j * 40, BY[2]]} k={easeOut(seg(t, 0.1 + j * 0.1, 0.3 + j * 0.1))} />)}
      <g opacity={1 - dead * 0.65}>
      {[0, 1].map((i) =>
        [0, 1].map((j) => <Entry key={`${i}${j}`} at={[180 + j * 40, BY[i]]} k={easeOut(seg(t, 0.1 + j * 0.1, 0.3 + j * 0.1))} />),
      )}
      <Entry at={[260, BY[0]]} k={easeOut(seg(t, 0.2, 0.4))} />
      <Entry at={[260, BY[1]]} k={easeOut(seg(t, 0.3, 0.5))} />
      <Entry at={[320, BY[0]]} label="w" f={C.focus} fill k={easeOutBack(seg(t, 1.1, 1.4))} />
      <Arrow a={[320, BY[0] + 12]} b={[320, BY[1] - 12]} t={t} from={1.3} to={1.6} f={C.focus} />
      <Entry at={[320, BY[1]]} label="w" f={C.focus} fill k={easeOutBack(seg(t, 1.6, 1.9))} />
      </g>
      <Cross at={[400, BY[0]]} o={dead} />
      <Cross at={[400, BY[1]]} o={dead} />
      <Arrow a={[340, BY[0]]} b={[470, BY[0]]} t={t} from={1.9} to={2.2} f={C.focus} />
      <T x={480} y={BY[0] + 5} s={13} f={C.focus} o={easeOut(seg(t, 2.1, 2.4))}>
        acked
      </T>
      <Entry at={[320, BY[2]]} f={C.badText} dashed k={easeOut(seg(t, 3.1, 3.4))} />
      <T x={350} y={BY[2] + 5} s={13} f={C.badText} o={easeOut(seg(t, 3.2, 3.5))}>
        never had it
      </T>
      <Decode text="the one survivor missed the acked write" t={t} at={3.6} x={300} y={262} s={15} a="middle" f={C.badText} w={600} />
    </Svg>
  );
}

// 2 · A two-by-two grid: min.insync.replicas (every in-sync replica, leader alone) down the side, unclean election
// (off, on) across the top, a question mark in each cell. After the pick, the "off" column fills "safe, waits", the
// "on" column fills "write gone" in red, and a bracket marks the column that decides.
export function PredictCombinations({ t, answer }: StepCtx) {
  const s = useSinceAnswer(answer !== null);
  const on = answer !== null;
  const CX = [300, 470], RY = [110, 180];
  return (
    <Svg label="across unclean-election on or off and min.insync.replicas's two settings, does the acknowledged write survive?" h={300}>
      <T x={CX[0]} y={56} s={13} a="middle" f={C.primary} o={easeOut(seg(t, 0, 0.3))}>
        unclean off
      </T>
      <T x={CX[1]} y={56} s={13} a="middle" f={C.primary} o={easeOut(seg(t, 0.1, 0.4))}>
        unclean on
      </T>
      {['all in sync', 'leader alone'].map((r, i) => (
        <T key={r} x={190} y={RY[i] + 5} s={13} a="end" f={C.primary} o={easeOut(seg(t, 0.2 + i * 0.1, 0.5 + i * 0.1))}>
          {r}
        </T>
      ))}
      {RY.map((y, i) =>
        CX.map((x, j) => {
          const k = easeOut(seg(t, 0.3 + (i + j) * 0.1, 0.6 + (i + j) * 0.1));
          const r = on ? easeOutBack(seg(s, 0.3 + j * 0.6 + i * 0.15, 0.6 + j * 0.6 + i * 0.15)) : 0;
          const lost = j === 1;
          return (
            <g key={`${i}${j}`} opacity={k}>
              <rect x={x - 76} y={y - 24} width={152} height={48} rx={5} fill="none" stroke={r > 0.5 ? (lost ? C.badText : C.focus) : C.line} strokeWidth={r > 0.5 ? 1.6 : 1} />
              <T x={x} y={y + 5} s={13} a="middle" f={r > 0.5 ? (lost ? C.badText : C.focus) : C.quiet}>
                {r > 0.5 ? (lost ? 'write gone' : 'safe, waits') : '?'}
              </T>
            </g>
          );
        }),
      )}
      {on && (
        <g>
          <Reticle x={CX[1]} y={145} w={172} h={130} t={s} at={1.8} color={C.badText} />
          <Decode text="unclean election decides" t={s} at={2.0} x={300} y={260} s={15} a="middle" f={C.focus} w={600} />
        </g>
      )}
    </Svg>
  );
}

// 3 · A small znode tree: /election with an ephemeral /leader held by session A. Session A's lane goes dark; the node
// vanishes; a watch fires to client B, which creates its own /leader. Below, a plain read from a lagging follower
// returns the old value; a sync pulls the follower up, and the next read returns the new one.
export function RevealZooKeeper({ t }: StepCtx) {
  const gone = easeOut(seg(t, 1.1, 1.4));
  const b = easeOutBack(seg(t, 1.9, 2.2));
  const synced = t > 3.4;
  return (
    <Svg label="ZooKeeper guarantees linearizable writes and FIFO client order; ephemeral nodes vanish when their session ends, watches signal change, and a local read can lag until a sync" h={300}>
      <T x={20} y={24} s={13} f={C.secondary} o={easeOut(seg(t, 0, 0.3))}>
        writes linearizable, each client in order
      </T>
      <Entry at={[100, 60]} label="/election" w={110} f={C.primary} k={easeOut(seg(t, 0.1, 0.4))} />
      <line x1={100} y1={72} x2={100} y2={98} stroke={C.line} opacity={easeOut(seg(t, 0.2, 0.5))} />
      <Entry at={[100, 110]} label={b > 0.5 ? '/leader: B' : '/leader: A'} w={110} f={C.focus} dashed k={b > 0 ? b : easeOut(seg(t, 0.3, 0.6)) * (1 - gone)} />
      <Lane y={70} name="session A" x0={300} dark={easeInOut(seg(t, 0.7, 1.1)) * 0.98} />
      <Arrow a={[160, 110]} b={[390, 130]} t={t} from={1.4} to={1.8} f={C.focus} />
      <T x={280} y={140} s={13} a="middle" f={C.focus} o={easeOut(seg(t, 1.5, 1.8))}>
        watch fires
      </T>
      <T x={400} y={135} s={13} f={C.primary} o={easeOut(seg(t, 1.4, 1.7))}>
        client B
      </T>
      <line x1={20} y1={170} x2={580} y2={170} stroke={C.band} opacity={easeOut(seg(t, 2.3, 2.5))} />
      <g opacity={easeOut(seg(t, 2.4, 2.7))}>
        <Entry at={[120, 216]} label="leader: v2" w={110} f={C.focus} />
        <Entry at={[300, 216]} label={synced ? 'follower: v2' : 'follower: v1'} w={120} f={synced ? C.focus : C.secondary} />
        <T x={520} y={200} s={13} a="middle" f={C.primary}>
          client
        </T>
      </g>
      <Arrow a={[490, 210]} b={[364, 210]} t={t} from={2.6} to={2.9} />
      {!synced && (
        <T x={430} y={244} s={13} a="middle" f={C.secondary} o={easeOut(seg(t, 2.9, 3.1))}>
          plain read: v1
        </T>
      )}
      <Arrow a={[178, 222]} b={[236, 222]} t={t} from={3.1} to={3.4} f={C.focus} />
      <T x={207} y={252} s={13} a="middle" f={C.focus} o={easeOut(seg(t, 3.1, 3.4))}>
        sync
      </T>
      {synced && (
        <T x={430} y={244} s={13} a="middle" f={C.focus} o={easeOut(seg(t, 3.6, 3.9))}>
          then read: v2
        </T>
      )}
      <Reticle x={300} y={216} w={136} h={36} t={t} at={3.9} />
    </Svg>
  );
}

// 4 · A revision counter ticks once per change. A default read fans out through the three-node cluster and comes back
// strictly serializable; an opt-in serializable read stops at the nearest node and comes back fast, maybe stale. A
// key bound to a lease drains with it and disappears, and the revision ticks once more.
export function RevealEtcd({ t }: StepCtx) {
  const N: Pt[] = [[360, 70], [450, 70], [540, 70]];
  const rev = 5 + (t > 0.4 ? 1 : 0) + (t > 0.7 ? 1 : 0) + (t > 4.1 ? 1 : 0);
  const lease = easeInOut(seg(t, 3.0, 4.0));
  const client: Pt = [200, 250];
  return (
    <Svg label="etcd's default is strictly serializable; an opt-in serializable read may be stale but is faster; leases bind keys to a lifetime, and a revision counts every change" h={300}>
      <rect x={30} y={40} width={130} height={64} rx={6} fill="none" stroke={C.primary} strokeWidth={1.4} opacity={easeOut(seg(t, 0, 0.3))} />
      <T x={95} y={64} s={13} a="middle" f={C.secondary}>
        revision
      </T>
      <T x={95} y={92} s={20} a="middle" f={C.focus} w={600}>
        {String(rev)}
      </T>
      {N.map(([x, y], i) => (
        <g key={i} opacity={easeOut(seg(t, 0.1 + i * 0.1, 0.4 + i * 0.1))}>
          <circle cx={x} cy={y} r={18} fill={C.panel} stroke={C.focus} strokeWidth={1.5} />
        </g>
      ))}
      <T x={client[0]} y={client[1] + 30} s={13} a="middle" f={C.primary} o={easeOut(seg(t, 0.8, 1.0))}>
        client
      </T>
      <circle cx={client[0]} cy={client[1]} r={8} fill={C.primary} opacity={easeOut(seg(t, 0.8, 1.0))} />
      {N.map(([x, y], i) => (
        <Arrow key={i} a={client} b={[x - 6, y + 16]} t={t} from={1.0 + i * 0.05} to={1.4 + i * 0.05} f={C.focus} />
      ))}
      <T x={300} y={206} s={13} f={C.focus} o={easeOut(seg(t, 1.4, 1.7))}>
        default: strict serializable
      </T>
      <Arrow a={[client[0] + 10, client[1] + 6]} b={[N[0][0] - 2, N[0][1] + 18]} t={t} from={2.0} to={2.2} f={C.second} />
      <T x={300} y={232} s={13} f={C.second} o={easeOut(seg(t, 2.2, 2.5))}>
        opt-in: fast, maybe stale
      </T>
      <g opacity={1 - easeOut(seg(t, 4.0, 4.2))}>
        <Entry at={[70, 150]} label="key" w={60} f={C.focus} k={easeOut(seg(t, 2.8, 3.0))} />
        <rect x={110} y={144} width={120 * (1 - lease)} height={12} rx={2} fill={C.focus} opacity={0.5 * easeOut(seg(t, 2.8, 3.0))} />
      </g>
      <T x={30} y={186} s={13} f={C.secondary} o={easeOut(seg(t, 3.0, 3.3))}>
        lease ends, key goes
      </T>
      <Reticle x={95} y={72} w={146} h={80} t={t} at={4.2} />
    </Svg>
  );
}

// 5 · Brokers in a row, a separate coordination ensemble above them wired to each. The ensemble is struck and fades;
// in its place a small three-controller quorum appears beneath the brokers, and metadata entries replicate around it.
export function RevealKRaft({ t }: StepCtx) {
  const BX = [180, 300, 420];
  const zk = 1 - easeOut(seg(t, 1.6, 2.0));
  const ring: Pt[] = [[300, 196], [250, 250], [350, 250]];
  return (
    <Svg label="Kafka's own release announcement: the first major version to run entirely without the coordination service it depended on, replaced by a Raft-replicated controller quorum" h={300}>
      {BX.map((x, i) => (
        <g key={x} opacity={easeOut(seg(t, i * 0.1, 0.3 + i * 0.1))}>
          <rect x={x - 46} y={110} width={92} height={36} rx={5} fill={C.panel} stroke={C.focus} strokeWidth={1.5} />
          <T x={x} y={133} s={13} a="middle" f={C.focus}>
            broker
          </T>
        </g>
      ))}
      <g opacity={easeOut(seg(t, 0.3, 0.6)) * zk}>
        <rect x={210} y={26} width={180} height={40} rx={6} fill="none" stroke={C.secondary} strokeWidth={1.4} />
        <T x={300} y={51} s={13} a="middle" f={C.secondary}>
          ZooKeeper
        </T>
        {BX.map((x) => (
          <line key={x} x1={300} y1={66} x2={x} y2={110} stroke={C.line} />
        ))}
      </g>
      <g opacity={zk}>
        <Draw pts={[[214, 62], [386, 30]]} t={t} from={1.2} to={1.6} stroke={C.badText} w={2.2} pen={false} />
      </g>
      <T x={430} y={50} s={13} f={C.secondary} o={easeOut(seg(t, 1.4, 1.8))}>
        no longer needed
      </T>
      {ring.map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r={16} fill={C.panel} stroke={C.focus} strokeWidth={1.6} opacity={easeOutBack(seg(t, 2.0 + i * 0.15, 2.3 + i * 0.15))} />
      ))}
      <circle cx={300} cy={232} r={42} fill="none" stroke={C.line} strokeDasharray="3 4" opacity={easeOut(seg(t, 2.3, 2.6))} />
      {[0, 1].map((j) => (
        <g key={j}>
          <Arrow a={[310, 210]} b={[340, 238]} t={t} from={2.7 + j * 0.6} to={2.9 + j * 0.6} f={C.focus} />
          <Arrow a={[290, 210]} b={[260, 238]} t={t} from={2.7 + j * 0.6} to={2.9 + j * 0.6} f={C.focus} />
        </g>
      ))}
      <T x={370} y={200} s={13} f={C.focus} o={easeOut(seg(t, 2.6, 2.9))}>
        controller quorum
      </T>
      <T x={370} y={220} s={13} f={C.secondary} o={easeOut(seg(t, 2.8, 3.1))}>
        metadata on Raft
      </T>
      <Decode text="the chapter's own mechanism" t={t} at={3.6} x={300} y={292} s={15} a="middle" f={C.focus} w={600} />
    </Svg>
  );
}

// 6 · Two panels side by side, each racing replica bars. Majority vote: three replicas, the commit tick lands when the
// second-fastest finishes. In-sync set: two replicas, the commit waits for the slower one. Captions note the counts
// for one tolerated failure and who sets the pace.
export function RevealIsrQuorum({ t }: StepCtx) {
  const run = (d: number) => easeInOut(seg(t, 0.6, 0.6 + d));
  const L = [0.9, 1.4, 3.0], R = [0.9, 3.0];
  const commitL = t > 0.6 + 1.4, commitR = t > 0.6 + 3.0;
  const bar = (x: number, y: number, k: number) => (
    <g>
      <rect x={x} y={y - 8} width={200} height={16} rx={3} fill="none" stroke={C.line} />
      <rect x={x} y={y - 8} width={200 * k} height={16} rx={3} fill={k >= 1 ? C.focus : C.secondary} opacity={0.7} />
    </g>
  );
  return (
    <Svg label="Kafka's in-sync set commits a write once every member has it, needing one fewer replica than majority vote for the same failure tolerance, at the cost of waiting on the slowest member, not the fastest" h={300}>
      <T x={150} y={30} s={14} a="middle" f={C.primary} w={600} o={easeOut(seg(t, 0, 0.3))}>
        majority vote
      </T>
      <T x={450} y={30} s={14} a="middle" f={C.primary} w={600} o={easeOut(seg(t, 0.1, 0.4))}>
        in-sync set
      </T>
      {L.map((d, i) => (
        <g key={i} opacity={easeOut(seg(t, 0.2, 0.5))}>
          {bar(50, 70 + i * 40, run(d))}
        </g>
      ))}
      {R.map((d, i) => (
        <g key={i} opacity={easeOut(seg(t, 0.3, 0.6))}>
          {bar(350, 70 + i * 40, run(d))}
        </g>
      ))}
      <T x={150} y={190} s={13} a="middle" f={C.focus} o={commitL ? 1 : 0}>
        commit: two of three
      </T>
      <T x={450} y={190} s={13} a="middle" f={C.focus} o={commitR ? 1 : 0}>
        commit: both
      </T>
      <Check at={[270, 70 + 40]} t={t} from={2.0} />
      <Check at={[570, 70 + 40]} t={t} from={3.6} />
      <T x={150} y={226} s={13} a="middle" f={C.secondary} o={easeOut(seg(t, 3.4, 3.7))}>
        three copies per loss
      </T>
      <T x={450} y={226} s={13} a="middle" f={C.secondary} o={easeOut(seg(t, 3.5, 3.8))}>
        two copies per loss
      </T>
      <Decode text="cheaper, but the slowest sets the pace" t={t} at={3.9} x={300} y={274} s={15} a="middle" f={C.focus} w={600} />
    </Svg>
  );
}

// 7 · Top: copies of an acknowledged write under each setting, two lit for "every in-sync replica", one for "leader
// alone", with a floor line dropping between them. Middle: the unclean switch, off waits and on loses. Bottom: the
// last replica's own unclean restart drops an entry anyway, the gap a later fix closes.
export function RevealUncleanElection({ t }: StepCtx) {
  const drop = easeInOut(seg(t, 0.9, 1.4));
  return (
    <Svg label="requiring every in-sync replica protects against any one failure among them; letting the leader alone satisfy it weakens that floor; unclean election trades consistency for availability outright" h={300}>
      <T x={180} y={46} s={13} a="end" f={C.primary} o={easeOut(seg(t, 0, 0.3))}>
        all in sync
      </T>
      <Entry at={[220, 40]} label="w" f={C.focus} fill k={easeOutBack(seg(t, 0.1, 0.4))} />
      <Entry at={[260, 40]} label="w" f={C.focus} fill k={easeOutBack(seg(t, 0.2, 0.5))} />
      <T x={300} y={46} s={13} f={C.focus} o={easeOut(seg(t, 0.4, 0.7))}>
        survives one loss
      </T>
      <T x={180} y={96} s={13} a="end" f={C.primary} o={easeOut(seg(t, 0.6, 0.9))}>
        leader alone
      </T>
      <Entry at={[220, 90]} label="w" f={C.focus} fill k={easeOutBack(seg(t, 0.7, 1.0))} />
      <Entry at={[260, 90]} f={C.quiet} dashed k={easeOut(seg(t, 0.8, 1.1))} />
      <line x1={200} y1={lerp(56, 106, drop)} x2={460} y2={lerp(56, 106, drop)} stroke={C.badText} strokeWidth={1.4} strokeDasharray="5 4" opacity={easeOut(seg(t, 0.9, 1.1))} />
      <T x={470} y={lerp(60, 110, drop)} s={13} f={C.badText} o={easeOut(seg(t, 1.2, 1.5))}>
        floor drops
      </T>
      <line x1={20} y1={132} x2={580} y2={132} stroke={C.band} opacity={easeOut(seg(t, 1.6, 1.8))} />
      <g opacity={easeOut(seg(t, 1.7, 2.0))}>
        <rect x={60} y={150} width={220} height={40} rx={6} fill="none" stroke={C.focus} strokeWidth={1.4} />
        <T x={170} y={175} s={13} a="middle" f={C.focus}>
          unclean off: waits, safe
        </T>
      </g>
      <g opacity={easeOut(seg(t, 2.1, 2.4))}>
        <rect x={320} y={150} width={220} height={40} rx={6} fill="none" stroke={C.badText} strokeWidth={1.4} />
        <T x={430} y={175} s={13} a="middle" f={C.badText}>
          unclean on: serves, loses
        </T>
      </g>
      <line x1={20} y1={210} x2={580} y2={210} stroke={C.band} opacity={easeOut(seg(t, 2.7, 2.9))} />
      <T x={180} y={246} s={13} a="end" f={C.primary} o={easeOut(seg(t, 2.8, 3.1))}>
        last replica
      </T>
      {[0, 1, 2].map((j) => (
        <Entry key={j} at={[220 + j * 40, j === 2 ? lerp(240, 280, easeIn(seg(t, 3.3, 3.8))) : 240]} f={j === 2 && t > 3.3 ? C.badText : C.focus} k={easeOut(seg(t, 2.9 + j * 0.1, 3.1 + j * 0.1)) * (j === 2 ? 1 - easeOut(seg(t, 3.7, 3.9)) : 1)} />
      ))}
      <T x={340} y={246} s={13} f={C.badText} o={easeOut(seg(t, 3.5, 3.8))}>
        unclean restart
      </T>
      <T x={340} y={272} s={13} f={C.quiet} o={easeOut(seg(t, 3.9, 4.2))}>
        closed by a later fix
      </T>
    </Svg>
  );
}

const easeIn = (x: number) => x * x;

// 8 · A catalog pointer aims at metadata v1. Writers A and B both read v1 and each build a new version. A swaps first:
// the pointer swings to A's version. B's swap compares against v1, finds the pointer moved, and bounces (red); B
// rebuilds on A's version and swaps again, and the pointer swings to it.
export function RevealIcebergCas({ t }: StepCtx) {
  const V: Record<string, Pt> = { v1: [120, 200], a: [300, 200], b2: [480, 200] };
  const ptr = t > 3.4 ? V.b2 : t > 1.8 ? V.a : V.v1;
  const swing = t > 3.4 ? easeInOut(seg(t, 3.4, 3.7)) : t > 1.8 ? easeInOut(seg(t, 1.8, 2.1)) : 1;
  const prev = t > 3.4 ? V.a : V.v1;
  const px = lerp(prev[0], ptr[0], swing), py = lerp(prev[1], ptr[1], swing);
  const bounce = easeOut(seg(t, 2.3, 2.5)) * (1 - easeOut(seg(t, 2.8, 3.0)));
  return (
    <Svg label="a table commit swaps one pointer atomically, so every reader sees the whole old state or the whole new one, never a mix; a writer that loses the race rebuilds and retries" h={300}>
      <rect x={240} y={34} width={120} height={36} rx={6} fill={C.panel} stroke={C.primary} strokeWidth={1.6} />
      <T x={300} y={57} s={13} a="middle" f={C.primary} w={600}>
        catalog
      </T>
      <line x1={300} y1={70} x2={px} y2={py - 18} stroke={C.focus} strokeWidth={2} />
      <circle cx={px} cy={py - 18} r={4} fill={C.focus} />
      <Entry at={V.v1} label="v1" w={80} f={C.secondary} />
      <Entry at={V.a} label="v2, A" w={80} f={C.focus} k={easeOutBack(seg(t, 0.6, 0.9))} />
      <Entry at={[480, 250]} label="v2, B" w={80} f={C.badText} k={easeOutBack(seg(t, 0.8, 1.1)) * (1 - easeOut(seg(t, 2.9, 3.1)))} dashed />
      <Entry at={V.b2} label="v3, B" w={80} f={C.focus} k={easeOutBack(seg(t, 3.0, 3.3))} />
      <T x={70} y={140} s={13} f={C.secondary} o={easeOut(seg(t, 0.2, 0.5))}>
        writer A
      </T>
      <T x={470} y={140} s={13} f={C.secondary} o={easeOut(seg(t, 0.3, 0.6))}>
        writer B
      </T>
      <Arrow a={[160, 200]} b={[258, 200]} t={t} from={0.4} to={0.6} />
      <g opacity={1 - easeOut(seg(t, 2.9, 3.1))}>
        <Arrow a={[160, 210]} b={[440, 246]} t={t} from={0.5} to={0.8} />
      </g>
      <Arrow a={[340, 200]} b={[438, 200]} t={t} from={2.9} to={3.1} />
      <Cross at={[400, 112]} o={bounce} />
      <T x={410} y={100} s={13} f={C.badText} o={bounce}>
        base moved
      </T>
      <T x={300} y={290} s={13} a="middle" f={C.secondary} o={easeOut(seg(t, 3.0, 3.3))}>
        loser rebuilds on the winner, retries
      </T>
      <Reticle x={300} y={52} w={136} h={52} t={t} at={3.8} />
    </Svg>
  );
}

// 9 · Four panels build in turn: a node vanishing with its session; a three-dot quorum under a broker; a commit
// waiting on the slowest bar; a pointer swinging. The shared idea decodes underneath.
export function Recap({ t }: StepCtx) {
  const P = [[20, 14], [310, 14], [20, 136], [310, 136]] as const;
  const k = (i: number) => easeOut(seg(t, 0.2 + i * 0.6, 0.6 + i * 0.6));
  const box = (i: number, label: string) => (
    <g opacity={k(i)}>
      <rect x={P[i][0]} y={P[i][1]} width={270} height={110} rx={6} fill="none" stroke={C.line} />
      <T x={P[i][0] + 135} y={P[i][1] + 98} s={13} a="middle" f={C.primary}>
        {label}
      </T>
    </g>
  );
  return (
    <Svg label="ZooKeeper and etcd hand out strongly consistent stores; KRaft replaces one with Raft; Kafka's in-sync set is a cheaper quorum with a cost; a table commit is a linearizable register swapped as one pointer" h={300}>
      {box(0, 'ZooKeeper, etcd: one strong store')}
      <g opacity={k(0)}>
        <Entry at={[P[0][0] + 135, P[0][1] + 40]} label="/leader" w={90} f={C.focus} dashed k={1 - easeOut(seg(t, 0.8, 1.1)) * 0.7} />
      </g>
      {box(1, 'KRaft: a Raft log')}
      <g opacity={k(1)}>
        {[[135, 26], [110, 60], [160, 60]].map(([x, y], i) => (
          <circle key={i} cx={P[1][0] + x} cy={P[1][1] + y} r={10} fill={t > 1.4 + i * 0.1 ? C.focus : C.panel} stroke={C.focus} strokeWidth={1.4} />
        ))}
      </g>
      {box(2, 'in-sync set: cheaper, waits')}
      <g opacity={k(2)}>
        <rect x={P[2][0] + 40} y={P[2][1] + 26} width={190} height={12} rx={2} fill={C.focus} opacity={0.7} />
        <rect x={P[2][0] + 40} y={P[2][1] + 50} width={190 * easeInOut(seg(t, 1.6, 2.6))} height={12} rx={2} fill={C.secondary} opacity={0.7} />
      </g>
      {box(3, 'a commit: one pointer swap')}
      <g opacity={k(3)}>
        <line x1={P[3][0] + 135} y1={P[3][1] + 20} x2={lerp(P[3][0] + 80, P[3][0] + 190, easeInOut(seg(t, 2.6, 3.0)))} y2={P[3][1] + 60} stroke={C.focus} strokeWidth={2} />
        <Entry at={[P[3][0] + 80, P[3][1] + 66]} w={50} f={C.secondary} />
        <Entry at={[P[3][0] + 190, P[3][1] + 66]} w={50} f={C.focus} />
      </g>
      <Decode text="a few replicas agreeing on one value" t={t} at={3.2} x={300} y={280} s={15} a="middle" f={C.focus} w={600} />
    </Svg>
  );
}

// 10 · Five replicas in a row. A write reaches the left three (v2); a read asks the right three. They overlap on the
// middle one. After the pick, the read's three answers come back v2, v1, v1: with no rule, the majority answer v1
// wins (red); with versions, the highest, v2, is picked out.
export function ProveIt({ t, answer }: StepCtx) {
  const s = useSinceAnswer(answer !== null);
  const on = answer !== null;
  const X = (i: number) => 100 + i * 100;
  const y = 120;
  const has = (i: number) => i < 3;
  return (
    <Svg label="a store requires more-than-half-sized read and write quorums, guaranteeing they overlap on at least one replica — does that overlap alone make the store linearizable?" h={300}>
      {[0, 1, 2, 3, 4].map((i) => (
        <g key={i}>
          <circle cx={X(i)} cy={y} r={22} fill={C.panel} stroke={C.focus} strokeWidth={1.5} opacity={easeOut(seg(t, i * 0.08, 0.3 + i * 0.08))} />
          <T x={X(i)} y={y + 5} s={13} a="middle" f={has(i) && t > 0.8 ? C.focus : C.secondary}>
            {has(i) && t > 0.8 ? 'v2' : 'v1'}
          </T>
        </g>
      ))}
      <path d={`M${X(0) - 30} ${y - 34} L${X(0) - 30} ${y - 42} L${X(2) + 30} ${y - 42} L${X(2) + 30} ${y - 34}`} fill="none" stroke={C.focus} strokeWidth={1.6} opacity={easeOut(seg(t, 0.5, 0.8))} />
      <T x={X(1)} y={y - 52} s={13} a="middle" f={C.focus} o={easeOut(seg(t, 0.5, 0.8))}>
        write quorum
      </T>
      <path d={`M${X(2) - 30} ${y + 34} L${X(2) - 30} ${y + 42} L${X(4) + 30} ${y + 42} L${X(4) + 30} ${y + 34}`} fill="none" stroke={C.second} strokeWidth={1.6} opacity={easeOut(seg(t, 1.0, 1.3))} />
      <T x={X(3)} y={y + 62} s={13} a="middle" f={C.second} o={easeOut(seg(t, 1.0, 1.3))}>
        read quorum
      </T>
      <Reticle x={X(2)} y={y} w={60} h={60} t={t} at={1.4} />
      {!on && (
        <T x={300} y={270} s={15} a="middle" f={C.secondary} o={easeOut(seg(t, 1.6, 2.1))}>
          overlap, so linearizable?
        </T>
      )}
      {on && (
        <g>
          {['v2', 'v1', 'v1'].map((v, i) => (
            <Entry key={i} at={[230 + i * 70, 220]} label={v} w={50} f={v === 'v2' ? C.focus : C.secondary} k={easeOutBack(seg(s, 0.2 + i * 0.15, 0.5 + i * 0.15))} />
          ))}
          <T x={180} y={225} s={13} a="end" f={C.secondary} o={easeOut(seg(s, 0.2, 0.5))}>
            answers
          </T>
          <T x={470} y={212} s={13} f={C.badText} o={easeOut(seg(s, 0.8, 1.1))}>
            no rule: v1?
          </T>
          <T x={470} y={236} s={13} f={C.focus} o={easeOut(seg(s, 1.3, 1.6))}>
            versions: v2
          </T>
          <Decode text="overlap makes it possible, not certain" t={s} at={1.8} x={300} y={282} s={15} a="middle" f={C.focus} w={600} />
        </g>
      )}
    </Svg>
  );
}
