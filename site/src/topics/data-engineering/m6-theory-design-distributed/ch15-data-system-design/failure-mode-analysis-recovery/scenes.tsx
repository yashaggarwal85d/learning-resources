import { useEffect, useState } from 'react';
import { C, Draw, Reticle, Svg, T } from '../../../../../reels/kit';
import { easeInOut, easeOut, easeOutBack, lerp, seg } from '../../../../../reels/anim';
import type { StepCtx } from '../../../../../reels/types';

// CHAPTER.md, topic 7: the failure table filling as the pipeline is walked; each row gets a blast radius and a
// recovery cell; the poison-record row's recovery cell stays empty and turns red, and a dead-letter queue fills it;
// RPO and RTO drawn per data class as bars with their cost. Values are examples.py's: five partitions, partition
// three stuck (forty restarts); the poison-record row with and without a dead-letter queue; DATA_CLASSES (orders
// RPO 0 / RTO 5 min, clickstream 1 h / 1 h, audit log 0 / 1 min) priced at 4 per RPO second and 1 per RTO second
// saved against a one-hour baseline (orders 17,700, clickstream 0, audit log 17,940).

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

/** Five partition lanes; records flow along each, lane `stuck` loops on a red record. `dlq` sends it down instead. */
function Lanes({ x, y, w, t, stuck = 2, from = 0, dlq = -1, o = 1, dim = 0 }: { x: number; y: number; w: number; t: number; stuck?: number; from?: number; dlq?: number; o?: number; dim?: number }) {
  const gap = 24;
  const freed = dlq >= 0 && t > dlq + 0.6;
  return (
    <g opacity={o}>
      {[0, 1, 2, 3, 4].map((p) => {
        const ly = y + p * gap;
        const isStuck = p === stuck;
        return (
          <g key={p} opacity={isStuck ? 1 : 1 - 0.5 * dim}>
            <T x={x - 8} y={ly + 5} s={13} f={isStuck ? C.badText : C.quiet} a="end">
              p{p + 1}
            </T>
            <line x1={x} y1={ly} x2={x + w} y2={ly} stroke={isStuck && !freed ? C.bad : C.line} strokeWidth={isStuck ? 2 : 1} />
            {t > from &&
              [0, 1, 2, 3].map((i) => {
                if (isStuck && !freed) return null;
                const u = ((t - from) * 0.35 + i / 4 + p * 0.07) % 1;
                return <rect key={i} x={x + u * (w - 10)} y={ly - 4} width={8} height={8} fill={C.primary} />;
              })}
            {isStuck && !freed && t > from && (
              <rect x={x + w * 0.3 + Math.sin((t - from) * 9) * 3} y={ly - 5} width={10} height={10} fill={C.bad} stroke={C.badText} />
            )}
          </g>
        );
      })}
    </g>
  );
}

// 1 · Five lanes of orders; lane three crash-loops on one red record and its restart count climbs to forty; the
// averaged dashboard beside it keeps saying fine; a night clock ticks on.
export function Hook({ t }: StepCtx) {
  const restarts = Math.round(40 * easeInOut(seg(t, 0.6, 3.4)));
  const mins = Math.round(47 * easeInOut(seg(t, 0.6, 3.6)));
  return (
    <Svg label="one partition crash-loops on a bad record at 2am — every other partition keeps going, and the averaged dashboard reads fine" h={290}>
      <Lanes x={60} y={34} w={300} t={t} from={0.3} o={easeOut(seg(t, 0, 0.3))} />
      <T x={210} y={170} s={13} f={C.badText} a="middle" o={easeOut(seg(t, 0.8, 1.1))}>
        p3 restarts: {restarts}
      </T>
      <g opacity={easeOut(seg(t, 1.0, 1.3))}>
        <rect x={400} y={24} width={170} height={96} rx={5} fill={C.panel} stroke={C.line} />
        <T x={414} y={46} s={13} f={C.secondary}>
          dashboard
        </T>
        <path d="M414 92 L450 90 L486 91 L522 89 L556 90" fill="none" stroke={C.primary} strokeWidth={1.6} />
        <T x={556} y={72} s={15} f={C.focus} a="end" w={700}>
          fine
        </T>
        <T x={414} y={112} s={13} f={C.quiet}>
          averaged
        </T>
      </g>
      <T x={485} y={154} s={18} f={C.primary} a="middle" w={700} o={easeOut(seg(t, 0.6, 0.9))}>
        02:{String(mins).padStart(2, '0')}
      </T>
      <T x={40} y={208} s={14} f={C.primary} o={easeOut(seg(t, 1.4, 1.7))}>
        dashboard
      </T>
      <T x={575} y={208} s={14} f={C.secondary} a="end" o={easeOut(seg(t, 1.5, 1.8))}>
        100% fine, averaged
      </T>
      <T x={40} y={236} s={14} f={C.badText} o={easeOut(seg(t, 2.2, 2.5))}>
        partition three
      </T>
      <T x={575} y={236} s={14} f={C.badText} a="end" o={easeOut(seg(t, 2.3, 2.6))}>
        stuck, restarting
      </T>
      <T x={40} y={264} s={14} f={C.primary} o={easeOut(seg(t, 3.0, 3.3))}>
        time stuck
      </T>
      <T x={575} y={264} s={14} f={C.focus} a="end" o={easeOut(seg(t, 3.1, 3.4))}>
        unbounded so far
      </T>
    </Svg>
  );
}

// 2 · The crash loop as a circle: read → process → crash → restart → read, a red record riding it. After the pick, the
// loop keeps spinning (nothing inside it changes); an eye on partition three's own lag metric appears outside, and a
// hand lifts the record out into quarantine.
export function Predict1({ t, answer }: StepCtx) {
  const s = useSinceAnswer(answer !== null);
  const on = answer !== null;
  const cx = 170, cy = 92, r = 58;
  const lift = on ? easeInOut(seg(s, 1.4, 2.2)) : 0;
  const ang = (t * 2.4) % (Math.PI * 2);
  const STAGES = ['read', 'process', 'crash', 'restart'];
  const rx = lift > 0 ? lerp(cx + r * Math.cos(ang), 470, lift) : cx + r * Math.cos(ang);
  const ry = lift > 0 ? lerp(cy + r * Math.sin(ang), 120, lift) : cy + r * Math.sin(ang);
  return (
    <Svg label="what actually ends the crash loop?" h={260}>
      <circle cx={cx} cy={cy} r={r} fill="none" stroke={C.line} strokeWidth={1.6} strokeDasharray="6 4" opacity={easeOut(seg(t, 0, 0.3))} />
      {STAGES.map((st, i) => {
        const a = (i / 4) * Math.PI * 2 - Math.PI / 2;
        const lx = cx + (r + 26) * Math.cos(a), ly = cy + (r + 26) * Math.sin(a) + 5;
        return (
          <T key={st} x={lx} y={ly} s={13} f={st === 'crash' ? C.badText : C.secondary} a={i === 1 ? 'start' : i === 3 ? 'end' : 'middle'} o={easeOut(seg(t, 0.2 + i * 0.1, 0.5 + i * 0.1))}>
            {st}
          </T>
        );
      })}
      <rect x={rx - 7} y={ry - 7} width={14} height={14} fill={C.bad} stroke={C.badText} />
      {/* outside watcher */}
      {on && (
        <g opacity={easeOut(seg(s, 0.4, 0.8))}>
          <path d="M420 50 q30 -22 60 0 q-30 22 -60 0 z" fill="none" stroke={C.focus} strokeWidth={1.6} />
          <circle cx={450} cy={50} r={6} fill={C.focus} />
          <T x={450} y={88} s={13} f={C.focus} a="middle">
            p3's own lag
          </T>
          <rect x={430} y={106} width={80} height={30} rx={4} fill="none" stroke={C.focus} strokeDasharray="4 3" opacity={easeOut(seg(s, 1.2, 1.5))} />
          <T x={470} y={154} s={13} f={C.focus} a="middle" o={easeOut(seg(s, 1.8, 2.1))}>
            quarantined
          </T>
        </g>
      )}
      {!on && (
        <T x={430} y={106} s={15} f={C.secondary} a="middle" o={easeOut(seg(t, 0.8, 1.2))}>
          what stops it?
        </T>
      )}
      {on && (
        <>
          <T x={40} y={214} s={14} f={C.secondary} o={easeOut(seg(s, 0.2, 0.5))}>
            the pipeline
          </T>
          <T x={575} y={214} s={14} f={C.secondary} a="end" o={easeOut(seg(s, 0.3, 0.6))}>
            sorts itself out
          </T>
          <line x1={40} y1={209} x2={575} y2={209} stroke={C.badText} strokeWidth={1.4} opacity={easeOut(seg(s, 0.6, 0.9))} />
          <T x={40} y={244} s={14} f={C.focus} o={easeOut(seg(s, 1.6, 1.9))}>
            a human
          </T>
          <T x={575} y={244} s={14} f={C.focus} a="end" o={easeOut(seg(s, 1.7, 2.0))}>
            notices, quarantines it
          </T>
        </>
      )}
    </Svg>
  );
}

const COLS = ['failure', 'blast radius', 'detection', 'recovery', 'data lost', 'time'];

/** The failure table as one row turned on its side: six columns as lines, values written in one by one. */
function FailureRow({ y, values, t, at, gapAt = -1, fillAt = -1, fillText = '' }: { y: number; values: string[]; t: number; at: number; gapAt?: number; fillAt?: number; fillText?: string }) {
  return (
    <g>
      {COLS.map((c, i) => {
        const cy = y + i * 30;
        const k = easeOut(seg(t, at + i * 0.4, at + i * 0.4 + 0.3));
        const isGap = i === 3;
        const filled = fillAt >= 0 && t > fillAt;
        return (
          <g key={c} opacity={easeOut(seg(t, 0.1 + i * 0.05, 0.4 + i * 0.05))}>
            <T x={40} y={cy} s={13} f={isGap ? C.primary : C.secondary}>
              {c}
            </T>
            <line x1={40} y1={cy + 9} x2={575} y2={cy + 9} stroke={C.line} />
            {!isGap && (
              <T x={575} y={cy} s={13} f={C.primary} a="end" o={k}>
                {values[i]}
              </T>
            )}
            {isGap && !filled && gapAt >= 0 && t > gapAt && (
              <rect x={400} y={cy - 16} width={176} height={22} fill="none" stroke={C.badText} strokeWidth={1.6} strokeDasharray="4 3" opacity={easeOut(seg(t, gapAt, gapAt + 0.3))} />
            )}
            {isGap && filled && (
              <T x={575} y={cy} s={13} f={C.focus} a="end" w={700} o={easeOut(seg(t, fillAt, fillAt + 0.3))}>
                {fillText}
              </T>
            )}
          </g>
        );
      })}
    </g>
  );
}

const POISON_ROW = ['crash loop, p3', "one partition's orders", 'per-partition lag', '', 'none yet, growing', 'unbounded'];

// 3 · The strip at the top, the partition box lighting; the row fills left to right, one column a beat; the recovery
// column is skipped and outlined in red.
export function RevealFailureTable({ t }: StepCtx) {
  return (
    <Svg label="failure, blast radius, detection, recovery, data lost, time to recover — one row, filled in left to right" h={250}>
      <g opacity={easeOut(seg(t, 0, 0.3))}>
        {['orders', 'partitions', 'warehouse'].map((b, i) => (
          <g key={b}>
            <rect x={60 + i * 180} y={8} width={120} height={30} rx={4} fill={C.panel} stroke={i === 1 && t > 0.4 ? C.badText : C.line} strokeWidth={i === 1 && t > 0.4 ? 1.8 : 1} />
            <T x={120 + i * 180} y={28} s={13} f={i === 1 && t > 0.4 ? C.badText : C.primary} a="middle">
              {b}
            </T>
            {i < 2 && <line x1={180 + i * 180} y1={23} x2={240 + i * 180} y2={23} stroke={C.line} />}
          </g>
        ))}
      </g>
      <FailureRow y={74} values={POISON_ROW} t={t} at={0.6} gapAt={2.4} />
    </Svg>
  );
}

// 4 · Left, the averaged dashboard as one big ring around all five lanes, reading fine. Right, the real blast radius:
// a tight red dashed outline around lane three, and the orders queued behind it piling up.
export function RevealBlastRadius({ t }: StepCtx) {
  const pile = Math.floor(easeInOut(seg(t, 1.8, 3.6)) * 9);
  return (
    <Svg label="the dashboard's blast radius buries one partition inside 100% fine — the real radius is that partition's own orders" h={250}>
      <Lanes x={90} y={40} w={250} t={t} from={0.2} o={easeOut(seg(t, 0, 0.3))} />
      <rect x={58} y={20} width={300} height={136} rx={10} fill="none" stroke={C.secondary} strokeWidth={1.4} strokeDasharray="6 4" opacity={easeOut(seg(t, 0.5, 0.9)) * (1 - 0.6 * easeOut(seg(t, 1.6, 2.0)))} />
      <T x={208} y={174} s={13} f={C.secondary} a="middle" o={easeOut(seg(t, 0.6, 0.9)) * (1 - 0.6 * easeOut(seg(t, 1.6, 2.0)))}>
        averaged: fine
      </T>
      <rect x={60} y={78} width={300} height={20} rx={4} fill="none" stroke={C.badText} strokeWidth={1.8} strokeDasharray="5 3" opacity={easeOut(seg(t, 1.6, 2.0))} />
      {/* delayed orders piling up for p3 */}
      {Array.from({ length: pile }, (_, i) => (
        <rect key={i} x={440 + (i % 3) * 18} y={100 - Math.floor(i / 3) * 18} width={14} height={14} fill={C.band} stroke={C.badText} />
      ))}
      <T x={474} y={140} s={13} f={C.badText} a="middle" o={easeOut(seg(t, 2.0, 2.3))}>
        p3's orders, delayed
      </T>
      <T x={40} y={210} s={14} f={C.secondary} o={easeOut(seg(t, 0.9, 1.2))}>
        dashboard's radius
      </T>
      <T x={575} y={210} s={14} f={C.secondary} a="end" o={easeOut(seg(t, 1.0, 1.3))}>
        buried, averaged away
      </T>
      <T x={40} y={238} s={14} f={C.badText} o={easeOut(seg(t, 2.6, 2.9))}>
        real radius
      </T>
      <T x={575} y={238} s={14} f={C.badText} a="end" o={easeOut(seg(t, 2.7, 3.0))}>
        one partition's orders
      </T>
    </Svg>
  );
}

// 5 · The row again with its red empty recovery cell. A dead-letter queue drops in under lane three; the bad record
// slides down into it, lane three starts flowing, and the recovery cell writes itself.
export function RevealRecoveryGap({ t }: StepCtx) {
  const DLQ = 1.6;
  const slide = easeInOut(seg(t, DLQ + 0.2, DLQ + 0.6));
  return (
    <Svg label="no dead-letter path leaves the recovery cell empty — add one, and the same row has an answer" h={260}>
      <Lanes x={90} y={24} w={250} t={t} from={0.2} dlq={DLQ} o={easeOut(seg(t, 0, 0.3))} />
      <g opacity={easeOut(seg(t, DLQ - 0.3, DLQ))}>
        <rect x={150} y={146} width={100} height={30} rx={4} fill={C.panel} stroke={C.focus} />
        <T x={200} y={194} s={13} f={C.focus} a="middle">
          dead letters
        </T>
      </g>
      {slide > 0 && slide < 1 && <rect x={165 + slide * 20} y={lerp(67, 155, slide)} width={10} height={10} fill={C.bad} stroke={C.badText} />}
      {slide >= 1 && <rect x={190} y={155} width={10} height={10} fill={C.bad} stroke={C.badText} />}
      <g opacity={easeOut(seg(t, 0.2, 0.5))}>
        <T x={380} y={50} s={13} f={C.primary}>
          recovery
        </T>
        <rect x={380} y={62} width={190} height={26} fill="none" stroke={t > DLQ + 0.9 ? C.focus : C.badText} strokeWidth={1.6} strokeDasharray={t > DLQ + 0.9 ? undefined : '4 3'} />
        {t > DLQ + 0.9 && (
          <T x={475} y={80} s={13} f={C.focus} a="middle" o={easeOut(seg(t, DLQ + 0.9, DLQ + 1.2))}>
            dead-letter, resume
          </T>
        )}
      </g>
      <T x={40} y={214} s={14} f={C.badText} o={easeOut(seg(t, 0.6, 0.9))}>
        no dead-letter queue
      </T>
      <T x={575} y={214} s={14} f={C.badText} a="end" o={easeOut(seg(t, 0.7, 1.0))}>
        recovery cell, empty
      </T>
      <T x={40} y={244} s={14} f={C.focus} o={easeOut(seg(t, DLQ + 1.2, DLQ + 1.5))}>
        with a dead-letter queue
      </T>
      <T x={575} y={244} s={14} f={C.focus} a="end" o={easeOut(seg(t, DLQ + 1.3, DLQ + 1.6))}>
        one cycle, resumes
      </T>
    </Svg>
  );
}

// 6 · A timeline with a failure at its centre: RPO reaches back (the data that can be lost), RTO reaches forward (the
// time down). Each has its own slider; tightening RPO leaves RTO where it was.
export function RevealRpoRto({ t }: StepCtx) {
  const F = 300, Y = 90;
  const rpo = lerp(150, 60, easeInOut(seg(t, 2.2, 3.0)));
  const rto = 130;
  return (
    <Svg label="RPO: how much data this class can lose. RTO: how long it can stay down. Two numbers, two separate costs" h={250}>
      <line x1={40} y1={Y} x2={560} y2={Y} stroke={C.line} opacity={easeOut(seg(t, 0, 0.3))} />
      <T x={560} y={Y + 22} s={13} f={C.quiet} a="end" o={easeOut(seg(t, 0, 0.3))}>
        time →
      </T>
      <g opacity={easeOut(seg(t, 0.2, 0.5))}>
        <line x1={F} y1={Y - 30} x2={F} y2={Y + 10} stroke={C.badText} strokeWidth={2.4} />
        <T x={F} y={Y - 38} s={13} f={C.badText} a="middle">
          failure
        </T>
      </g>
      <rect x={F - rpo * easeOut(seg(t, 0.6, 1.2))} y={Y - 12} width={rpo * easeOut(seg(t, 0.6, 1.2))} height={12} fill={C.primary} opacity={0.8} />
      <T x={F - 8} y={Y + 26} s={13} f={C.primary} a="end" o={easeOut(seg(t, 0.9, 1.2))}>
        RPO: data lost
      </T>
      <rect x={F} y={Y - 12} width={rto * easeOut(seg(t, 1.2, 1.8))} height={12} fill={C.second} opacity={0.85} />
      <T x={F + 8} y={Y + 26} s={13} f={C.second} o={easeOut(seg(t, 1.5, 1.8))}>
        RTO: time down
      </T>
      {/* the two dials */}
      <g opacity={easeOut(seg(t, 1.9, 2.2))}>
        <T x={40} y={150} s={13} f={C.secondary}>
          tighten RPO
        </T>
        <line x1={160} y1={146} x2={300} y2={146} stroke={C.line} />
        <circle cx={lerp(300, 196, easeInOut(seg(t, 2.2, 3.0)))} cy={146} r={6} fill={C.primary} />
        <T x={330} y={150} s={13} f={C.secondary}>
          RTO
        </T>
        <line x1={380} y1={146} x2={520} y2={146} stroke={C.line} />
        <circle cx={470} cy={146} r={6} fill={C.second} />
        <T x={540} y={150} s={13} f={C.quiet} o={easeOut(seg(t, 3.0, 3.3))}>
          still
        </T>
      </g>
      <T x={40} y={204} s={14} f={C.primary} o={easeOut(seg(t, 1.0, 1.3))}>
        RPO
      </T>
      <T x={575} y={204} s={14} f={C.primary} a="end" o={easeOut(seg(t, 1.1, 1.4))}>
        data loss, bounded
      </T>
      <T x={40} y={234} s={14} f={C.second} o={easeOut(seg(t, 1.6, 1.9))}>
        RTO
      </T>
      <T x={575} y={234} s={14} f={C.second} a="end" o={easeOut(seg(t, 1.7, 2.0))}>
        downtime, bounded
      </T>
    </Svg>
  );
}

// 7 · Three classes, each with an RPO bar, an RTO bar and a cost bar counted up. Then a ghost of "one target for all"
// stretches the clickstream's cost to the audit log's, in red.
export function RevealRpoRtoPerClass({ t }: StepCtx) {
  const CLASSES: [string, string, string, number][] = [
    ['orders', '0', '5 min', 17700],
    ['clickstream', '1 h', '1 h', 0],
    ['audit log', '0', '1 min', 17940],
  ];
  const over = easeInOut(seg(t, 3.2, 3.9));
  return (
    <Svg label="orders, clickstream, audit log — each data class gets its own RPO and RTO, not one target for the whole system" h={270}>
      <g opacity={easeOut(seg(t, 0, 0.3))}>
        <T x={210} y={22} s={13} f={C.quiet} a="middle">
          RPO
        </T>
        <T x={290} y={22} s={13} f={C.quiet} a="middle">
          RTO
        </T>
        <T x={350} y={22} s={13} f={C.quiet}>
          cost to meet
        </T>
      </g>
      {CLASSES.map(([name, rpo, rto, cost], i) => {
        const y = 56 + i * 48;
        const at = 0.3 + i * 0.6;
        const k = easeOut(seg(t, at, at + 0.3));
        const c = easeInOut(seg(t, at + 0.2, at + 0.9));
        return (
          <g key={name} opacity={k}>
            <T x={40} y={y} s={14} f={i === 1 ? C.focus : C.primary}>
              {name}
            </T>
            <T x={210} y={y} s={13} f={C.primary} a="middle">
              {rpo}
            </T>
            <T x={290} y={y} s={13} f={C.second} a="middle">
              {rto}
            </T>
            <rect x={350} y={y - 12} width={(cost / 17940) * 160 * c} height={14} fill={C.primary} opacity={0.85} />
            <T x={575} y={y} s={13} f={C.primary} a="end">
              {Math.round(cost * c).toLocaleString('en-US')}
            </T>
          </g>
        );
      })}
      {over > 0 && <rect x={350} y={92} width={160 * over} height={14} fill="none" stroke={C.badText} strokeWidth={1.4} strokeDasharray="4 3" />}
      <T x={40} y={202} s={14} f={C.primary} o={easeOut(seg(t, 1.2, 1.5))}>
        orders, audit log
      </T>
      <T x={575} y={202} s={14} f={C.primary} a="end" o={easeOut(seg(t, 1.3, 1.6))}>
        near-zero loss
      </T>
      <T x={40} y={230} s={14} f={C.focus} o={easeOut(seg(t, 2.2, 2.5))}>
        clickstream
      </T>
      <T x={575} y={230} s={14} f={C.focus} a="end" o={easeOut(seg(t, 2.3, 2.6))}>
        loose, cheaper
      </T>
      <T x={40} y={258} s={14} f={C.badText} o={easeOut(seg(t, 3.4, 3.7))}>
        one target for all
      </T>
      <T x={575} y={258} s={14} f={C.badText} a="end" o={easeOut(seg(t, 3.5, 3.8))}>
        overpays for clickstream
      </T>
    </Svg>
  );
}

// 8 · Overload arrives as a burst. Left, the dead-letter mode: every record kept, the poisoned ones parked aside with a
// timer. Right, the freshness-flag mode: answers keep coming, with a "stale" flag raised on them.
export function RevealDegradedModes({ t }: StepCtx) {
  const burst = easeOut(seg(t, 0.3, 0.8));
  const parked = Math.floor(easeInOut(seg(t, 0.9, 2.2)) * 4);
  const flag = easeOutBack(seg(t, 2.4, 2.8));
  return (
    <Svg label="two degraded modes under overload: keep every record but delay the poisoned ones, or keep serving but go stale" h={250}>
      <T x={300} y={22} s={13} f={C.badText} a="middle" o={burst}>
        overload
      </T>
      {/* dead-letter mode */}
      <g opacity={easeOut(seg(t, 0.2, 0.5))}>
        <T x={150} y={50} s={14} f={C.primary} a="middle" w={600}>
          dead-letter mode
        </T>
        <line x1={40} y1={90} x2={260} y2={90} stroke={C.line} />
        {[0, 1, 2, 3, 4].map((i) => {
          const u = ((t * 0.4 + i / 5) % 1);
          return <rect key={i} x={40 + u * 210} y={86} width={8} height={8} fill={C.primary} />;
        })}
        <rect x={100} y={116} width={110} height={34} rx={4} fill={C.panel} stroke={C.line} />
        {Array.from({ length: parked }, (_, i) => (
          <rect key={i} x={110 + i * 22} y={127} width={12} height={12} fill={C.bad} stroke={C.badText} />
        ))}
        <T x={155} y={170} s={13} f={C.secondary} a="middle">
          parked, delayed
        </T>
      </g>
      {/* freshness-flag mode */}
      <g opacity={easeOut(seg(t, 1.6, 1.9))}>
        <T x={450} y={50} s={14} f={C.focus} a="middle" w={600}>
          freshness flag
        </T>
        <rect x={380} y={70} width={140} height={70} rx={4} fill={C.panel} stroke={C.line} />
        {[0, 1, 2].map((i) => (
          <rect key={i} x={392} y={82 + i * 16} width={[90, 70, 100][i]} height={8} fill={C.secondary} />
        ))}
        {flag > 0 && (
          <g opacity={Math.min(1, flag)} transform={`translate(${526} ${70}) scale(${Math.min(1.1, flag)})`}>
            <line x1={0} y1={0} x2={0} y2={34} stroke={C.focus} strokeWidth={1.6} />
            <path d="M0 0 h34 l-6 7 l6 7 h-34 z" fill={C.focus} />
          </g>
        )}
        <T x={450} y={170} s={13} f={C.secondary} a="middle" o={easeOut(seg(t, 2.6, 2.9))}>
          serving, marked stale
        </T>
      </g>
      <T x={40} y={210} s={14} f={C.primary} o={easeOut(seg(t, 2.0, 2.3))}>
        dead-letter mode
      </T>
      <T x={575} y={210} s={14} f={C.primary} a="end" o={easeOut(seg(t, 2.1, 2.4))}>
        keeps every record
      </T>
      <T x={40} y={238} s={14} f={C.focus} o={easeOut(seg(t, 3.0, 3.3))}>
        freshness-flag mode
      </T>
      <T x={575} y={238} s={14} f={C.focus} a="end" o={easeOut(seg(t, 3.1, 3.4))}>
        keeps serving, stale
      </T>
    </Svg>
  );
}

// 9 · Captions return with small marks: a grid with one red cell, a tight dashed outline, two short bars, a flag.
export function Recap({ t }: StepCtx) {
  const rows: [string, string][] = [
    ['failure table', 'failure to recovery'],
    ['blast radius', 'failure domain, not dashboard'],
    ['RPO, RTO', 'priced, per data class'],
    ['degraded modes', 'a designed trade'],
  ];
  return (
    <Svg label="the failure table finds the gap, RPO and RTO price it per class, two degraded modes are the designed fallback" h={280}>
      {rows.map(([label, value], i) => {
        const y = 44 + i * 64;
        const k = easeOut(seg(t, 0.2 + i * 0.7, 0.55 + i * 0.7));
        return (
          <g key={label} opacity={k}>
            <T x={96} y={y} s={14} f={i === 2 ? C.focus : C.primary}>
              {label}
            </T>
            <T x={575} y={y} s={13} f={i === 2 ? C.focus : C.secondary} a="end">
              {value}
            </T>
          </g>
        );
      })}
      <g opacity={easeOut(seg(t, 0.2, 0.5))}>
        {[0, 1, 2].map((c) => (
          <rect key={c} x={28 + c * 16} y={28} width={14} height={18} fill="none" stroke={c === 1 && t > 0.8 ? C.badText : C.line} strokeWidth={1.4} />
        ))}
      </g>
      <g opacity={easeOut(seg(t, 0.9, 1.2))}>
        {[0, 1, 2].map((i) => (
          <line key={i} x1={28} y1={96 + i * 8} x2={74} y2={96 + i * 8} stroke={C.line} />
        ))}
        <rect x={26} y={100} width={50} height={8} fill="none" stroke={C.badText} strokeDasharray="3 2" />
      </g>
      <g opacity={easeOut(seg(t, 1.6, 1.9))}>
        <rect x={28} y={160} width={30 * easeInOut(seg(t, 1.6, 2.2))} height={6} fill={C.primary} />
        <rect x={28} y={170} width={44 * easeInOut(seg(t, 1.7, 2.3))} height={6} fill={C.second} />
      </g>
      <g opacity={easeOut(seg(t, 2.3, 2.6))}>
        <line x1={34} y1={218} x2={34} y2={244} stroke={C.focus} strokeWidth={1.6} />
        <path d="M34 218 h26 l-5 6 l5 6 h-26 z" fill={C.focus} />
      </g>
    </Svg>
  );
}

// 10 · A second strip whose broker box goes red. After the pick, the same six column labels slide across from the
// poison-record row onto a new broker-loss row, which starts to fill: the method carries over unchanged.
export function ProveIt({ t, answer }: StepCtx) {
  const s = useSinceAnswer(answer !== null);
  const on = answer !== null;
  const slide = on ? easeInOut(seg(s, 0.3, 1.1)) : 0;
  return (
    <Svg label="a second pipeline loses its whole message broker, not one partition — does the same failure table still find the gap?" h={300}>
      <g opacity={easeOut(seg(t, 0, 0.3))}>
        {['producers', 'broker', 'consumers'].map((b, i) => (
          <g key={b}>
            <rect x={60 + i * 180} y={10} width={120} height={30} rx={4} fill={i === 1 && t > 0.6 ? C.bad : C.panel} stroke={i === 1 && t > 0.6 ? C.badText : C.line} />
            <T x={120 + i * 180} y={30} s={13} f={i === 1 && t > 0.6 ? C.focus : C.primary} a="middle">
              {b}
            </T>
            {i < 2 && <line x1={180 + i * 180} y1={25} x2={240 + i * 180} y2={25} stroke={C.line} />}
          </g>
        ))}
      </g>
      {COLS.map((c, i) => {
        const y = 72 + i * 22;
        return (
          <g key={c} opacity={easeOut(seg(t, 0.3 + i * 0.05, 0.6 + i * 0.05))}>
            <T x={lerp(40, 40, slide)} y={y} s={13} f={on ? C.focus : C.secondary}>
              {c}
            </T>
            <line x1={40} y1={y + 7} x2={575} y2={y + 7} stroke={C.line} />
            {on && (
              <rect x={lerp(160, 560, slide) - 0} y={y - 10} width={8} height={8} fill={C.focus} opacity={slide < 1 ? 1 : 0} />
            )}
            {on && slide >= 1 && (
              <T x={575} y={y} s={13} f={C.secondary} a="end" o={easeOut(seg(s, 1.1 + i * 0.15, 1.4 + i * 0.15))}>
                {i === 0 ? 'broker lost' : 'fill it in'}
              </T>
            )}
          </g>
        );
      })}
      {!on && (
        <T x={300} y={226} s={15} f={C.secondary} a="middle" o={easeOut(seg(t, 1.0, 1.4))}>
          same table, or start over?
        </T>
      )}
      {on && (
        <>
          <T x={40} y={222} s={14} f={C.primary} o={easeOut(seg(s, 0.2, 0.5))}>
            broker loss
          </T>
          <T x={575} y={222} s={14} f={C.secondary} a="end" o={easeOut(seg(s, 0.3, 0.6))}>
            a different failure
          </T>
          <T x={40} y={252} s={14} f={C.focus} o={easeOut(seg(s, 1.0, 1.3))}>
            same six columns
          </T>
          <T x={575} y={252} s={14} f={C.focus} a="end" o={easeOut(seg(s, 1.1, 1.4))}>
            apply to any failure
          </T>
          <T x={40} y={282} s={14} f={C.primary} o={easeOut(seg(s, 2.0, 2.3))}>
            filling them in
          </T>
          <T x={575} y={282} s={14} f={C.primary} a="end" o={easeOut(seg(s, 2.1, 2.4))}>
            surfaces the gap again
          </T>
        </>
      )}
      <Reticle x={300} y={127} w={548} h={140} t={on ? 1 + s : 0} at={2.6} />
    </Svg>
  );
}
