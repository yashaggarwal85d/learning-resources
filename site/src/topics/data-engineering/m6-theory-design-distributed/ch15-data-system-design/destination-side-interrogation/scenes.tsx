import { useEffect, useState } from 'react';
import { C, Draw, Reticle, Svg, T } from '../../../../../reels/kit';
import { easeInOut, easeOut, easeOutBack, lerp, seg } from '../../../../../reels/anim';
import type { StepCtx } from '../../../../../reels/types';

// CHAPTER.md, topic 11: a consumer box under a vague sentence, question cards that flip to show how each answer forks
// the design ("what do you do when you see it" splits one pipeline strip into two, "who else reads it" adds serving
// stores, "how far back" lengthens the retention bar). Answers are examples.py's: four consumers (plant lead
// dashboard, quality report, maintenance model, compliance filing) on three serving stores; five recorded answers
// (count now 40, query rate 12, retention 3 years, grain per line, next year's count 80 as the one bet); the csv
// download and the bi extract bypass the engine's policy, the api read does not.

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

/** A plain box with a centred label. */
const Box = ({ x, y, w, h = 32, label, lit = false, o = 1, dash, stroke }: { x: number; y: number; w: number; h?: number; label: string; lit?: boolean; o?: number; dash?: string; stroke?: string }) =>
  o <= 0 ? null : (
    <g opacity={Math.min(1, o)}>
      <rect x={x} y={y} width={w} height={h} rx={4} fill={C.panel} stroke={stroke ?? (lit ? C.focus : C.line)} strokeWidth={lit ? 1.8 : 1.1} strokeDasharray={dash} />
      <T x={x + w / 2} y={y + h / 2 + 5} s={13} f={lit ? C.focus : C.primary} a="middle">
        {label}
      </T>
    </g>
  );

/** A label-left / value-right line under a drawing. */
const Line2 = ({ y, l, r, o, rc = C.focus, lc = C.secondary }: { y: number; l: string; r: string; o: number; rc?: string; lc?: string }) =>
  o <= 0 ? null : (
    <g opacity={Math.min(1, o)}>
      <T x={30} y={y} s={14} f={lc}>
        {l}
      </T>
      <T x={575} y={y} s={14} f={rc} a="end">
        {r}
      </T>
    </g>
  );

/** A check mark. */
const Tick = ({ x, y, k, color = C.focus }: { x: number; y: number; k: number; color?: string }) =>
  k <= 0 ? null : <path d={`M${x - 5} ${y} l4 4 l8 -9`} fill="none" stroke={color} strokeWidth={2} opacity={k} />;

// 1 · One sentence leaves the lead's box and splits into two pipeline strips: a stream of fast dots to an operator
// screen, and a batch block that jumps on a refresh to a dashboard. Both get a check: both read it faithfully.
export function Hook({ t }: StepCtx) {
  const fork = easeInOut(seg(t, 1.0, 1.6));
  const up = easeOut(seg(t, 1.6, 2.1));
  const dn = easeOut(seg(t, 2.3, 2.8));
  return (
    <Svg label="'we want real-time dashboards for the plants' — two faithful readings, two pipelines" h={270}>
      <T x={300} y={36} s={16} f={C.focus} a="middle" serif italic o={easeOut(seg(t, 0, 0.5))}>
        "real-time dashboards for the plants"
      </T>
      <Box x={30} y={102} w={110} label="plant lead" o={easeOut(seg(t, 0.3, 0.7))} />
      <Draw pts={[[140, 118], [175, 118]]} t={t} from={0.7} to={1.0} stroke={C.secondary} w={1.5} pen={false} />
      {fork > 0 && (
        <g fill="none" stroke={C.secondary} strokeWidth={1.5}>
          <path d={`M175 118 C195 118 200 ${lerp(118, 82, fork)} 225 ${lerp(118, 82, fork)}`} />
          <path d={`M175 118 C195 118 200 ${lerp(118, 154, fork)} 225 ${lerp(118, 154, fork)}`} />
        </g>
      )}
      {/* reading one: a stream */}
      <Box x={225} y={66} w={100} label="stream" o={up} lit={up > 0.9} />
      <Box x={420} y={66} w={150} label="operator screen" o={up} />
      {up > 0.5 && (
        <g>
          <line x1={325} y1={82} x2={420} y2={82} stroke={C.line} />
          {[0, 1, 2, 3, 4].map((i) => {
            const p = ((Math.max(0, t - 1.8) * 1.6 + i / 5) % 1);
            return <circle key={i} cx={327 + p * 90} cy={82} r={3} fill={C.focus} />;
          })}
        </g>
      )}
      {/* reading two: a batch */}
      <Box x={225} y={138} w={100} label="batch" o={dn} lit={dn > 0.9} />
      <Box x={420} y={138} w={150} label="dashboard" o={dn} />
      {dn > 0.5 && (
        <g>
          <line x1={325} y1={154} x2={420} y2={154} stroke={C.line} />
          {(() => {
            const p = easeInOut(seg(t, 3.0, 3.5));
            return <rect x={330 + p * 70} y={148} width={14} height={12} fill={C.primary} />;
          })()}
        </g>
      )}
      <Tick x={585} y={80} k={easeOut(seg(t, 3.6, 3.9))} />
      <Tick x={585} y={152} k={easeOut(seg(t, 3.7, 4.0))} />
      <Line2 y={208} l="engineer one" r="sub-second display" o={easeOut(seg(t, 2.0, 2.4))} />
      <Line2 y={234} l="engineer two" r="minutes refresh" o={easeOut(seg(t, 2.8, 3.2))} />
      <Line2 y={260} l="both" r="read it faithfully" o={easeOut(seg(t, 3.8, 4.2))} />
    </Svg>
  );
}

// 2 · The lead's box carries an empty definition: "real-time = ?". After the pick, the "define it" card gets nothing
// back, and the "what do you do then?" card returns a behaviour, which picks one strip of the fork.
export function Predict1({ t, answer }: StepCtx) {
  const s = useSinceAnswer(answer !== null);
  const on = answer !== null;
  const a1 = on ? easeOut(seg(s, 0.2, 0.7)) : 0;
  const a2 = on ? easeOut(seg(s, 0.9, 1.4)) : 0;
  const pick = on ? easeInOut(seg(s, 1.6, 2.2)) : 0;
  return (
    <Svg label="which question, asked in the first meeting, would have picked one design?" h={210}>
      <Box x={30} y={60} w={120} label="plant lead" o={easeOut(seg(t, 0, 0.4))} />
      <g opacity={easeOut(seg(t, 0.4, 0.9)) * (1 - 0.6 * a1)}>
        <rect x={40} y={14} width={100} height={28} rx={14} fill={C.band} stroke={C.line} strokeDasharray="3 3" />
        <T x={90} y={33} s={13} f={C.secondary} a="middle">
          real-time = ?
        </T>
      </g>
      <Box x={230} y={30} w={190} label="define 'real-time'?" o={easeOut(seg(t, 0.9, 1.3)) * (1 - 0.5 * a2)} />
      <Box x={230} y={90} w={190} label="what do you do then?" lit={a2 > 0.5} o={easeOut(seg(t, 1.2, 1.6))} />
      <Draw pts={[[150, 70], [230, 46]]} t={t} from={1.0} to={1.3} stroke={C.line} w={1.2} pen={false} />
      <Draw pts={[[150, 82], [230, 106]]} t={t} from={1.3} to={1.6} stroke={C.line} w={1.2} pen={false} />
      {a1 > 0 && (
        <T x={440} y={51} s={14} f={C.quiet} o={a1}>
          no definition
        </T>
      )}
      {a2 > 0 && (
        <T x={440} y={111} s={14} f={C.focus} o={a2}>
          a behaviour
        </T>
      )}
      {/* the behaviour picks one strip */}
      {pick > 0 && (
        <g opacity={pick}>
          <line x1={240} y1={150} x2={330} y2={150} stroke={C.focus} strokeWidth={1.6} />
          <line x1={330} y1={150} x2={420} y2={140} stroke={C.focus} strokeWidth={1.6} />
          <line x1={330} y1={150} x2={420} y2={160} stroke={C.line} strokeDasharray="3 3" opacity={1 - 0.5 * pick} />
          <circle cx={420} cy={140} r={4} fill={C.focus} />
          <T x={430} y={145} s={13} f={C.focus}>
            one design
          </T>
        </g>
      )}
      <T x={30} y={195} s={14} f={C.secondary} o={easeOut(seg(t, 1.7, 2.1))}>
        no technical definition in their head
      </T>
    </Svg>
  );
}

const CONSUMERS = ['plant lead', 'quality report', 'maintenance model', 'compliance filing'];
const GRID: [number, number][] = [
  [80, 62],
  [320, 62],
  [80, 112],
  [320, 112],
];

// 3 · One data band, one box under it: the lead's. The box flips over and three more consumers slide out from behind
// it, each wired to the same band.
export function RevealListConsumers({ t }: StepCtx) {
  const flip = seg(t, 0.8, 1.3);
  const sx = Math.max(0.02, Math.abs(Math.cos(flip * Math.PI)));
  const out = easeOutBack(seg(t, 1.3, 2.1));
  return (
    <Svg label="the lead's own box flips to reveal three more consumers of the same data" h={210}>
      <g opacity={easeOut(seg(t, 0, 0.4))}>
        <rect x={80} y={14} width={440} height={22} rx={3} fill={C.band} stroke={C.line} />
        <T x={300} y={30} s={13} f={C.secondary} a="middle">
          the same plant data
        </T>
      </g>
      {CONSUMERS.map((c, i) => {
        if (i === 0) {
          const cx = lerp(300, GRID[0][0] + 100, out);
          const cy = lerp(87, GRID[0][1] + 16, out);
          return (
            <g key={c} transform={`translate(${cx} 0) scale(${flip < 1 ? sx : 1} 1) translate(${-cx} 0)`} opacity={easeOut(seg(t, 0.2, 0.6))}>
              <line x1={cx} y1={36} x2={cx} y2={cy - 16} stroke={C.secondary} />
              <Box x={cx - 100} y={cy - 16} w={200} label={c} />
            </g>
          );
        }
        if (out <= 0) return null;
        const cx = lerp(300, GRID[i][0] + 100, out);
        const cy = lerp(87, GRID[i][1] + 16, out);
        return (
          <g key={c} opacity={Math.min(1, out)}>
            <line x1={cx} y1={36} x2={cx} y2={cy - 16} stroke={C.line} strokeDasharray="3 3" opacity={i >= 2 ? 0 : 1} />
            <Box x={cx - 100} y={cy - 16} w={200} label={c} lit={t > 2.4} />
          </g>
        );
      })}
      {out > 0.9 && (
        <g fill="none" stroke={C.line} strokeDasharray="3 3">
          <path d="M70 128 L60 128 L60 25 L80 25" />
          <path d="M530 128 L540 128 L540 25 L520 25" />
        </g>
      )}
      <Line2 y={175} l="asked first" r="plant lead" o={easeOut(seg(t, 0.3, 0.7))} />
      <Line2 y={200} l="never asked" r="three more readers" o={easeOut(seg(t, 2.2, 2.6))} />
    </Svg>
  );
}

const STORES: { label: string; y: number; h: number }[] = [
  { label: 'warehouse aggregate', y: 14, h: 82 },
  { label: 'point-in-time store', y: 114, h: 32 },
  { label: 'immutable report', y: 164, h: 32 },
];
const STORE_OF = [0, 0, 1, 2];

// 4 · Four consumers on the left, three stores on the right; each consumer draws its line to its store in turn. The
// dashboard and quality report land on one shared aggregate; the model and the filing each need their own.
export function RevealSeveralStores({ t }: StepCtx) {
  return (
    <Svg label="four consumers, four different freshness needs, four different serving stores" h={240}>
      {CONSUMERS.map((c, i) => {
        const y = 14 + i * 50;
        const at = 0.6 + i * 0.6;
        const st = STORES[STORE_OF[i]];
        const ty = STORE_OF[i] === 0 ? st.y + 22 + i * 38 : st.y + 16;
        const k = easeOut(seg(t, at + 0.35, at + 0.6));
        return (
          <g key={c}>
            <Box x={30} y={y} w={180} label={c === 'plant lead' ? 'dashboard' : c} o={easeOut(seg(t, i * 0.12, i * 0.12 + 0.4))} lit={k > 0.5} />
            <Draw pts={[[210, y + 16], [290, y + 16], [370, ty]]} t={t} from={at} to={at + 0.4} stroke={C.focus} w={1.5} pen={false} />
            {k > 0 && <circle cx={370} cy={ty} r={3.5} fill={C.focus} opacity={k} />}
          </g>
        );
      })}
      {STORES.map((s, i) => {
        const first = [0.6, 1.8, 2.4][i];
        const lit = t > first + 0.5;
        return (
          <g key={s.label} opacity={easeOut(seg(t, 0.3 + i * 0.1, 0.7 + i * 0.1))}>
            <rect x={370} y={s.y} width={200} height={s.h} rx={4} fill={C.panel} stroke={lit ? C.focus : C.line} strokeWidth={lit ? 1.6 : 1} />
            <T x={470} y={s.y + s.h / 2 + 5} s={13} f={lit ? C.focus : C.primary} a="middle">
              {s.label}
            </T>
          </g>
        );
      })}
      <T x={300} y={228} s={14} f={C.secondary} a="middle" o={easeOut(seg(t, 3.2, 3.6))}>
        one dataset, several stores
      </T>
    </Svg>
  );
}

// 5 · "real-time" on the left is struck through. On the right, the plant number climbs, crosses the lead's line, and
// a bracket runs from the crossing to the moment the lead walks the floor: that gap is the freshness bound.
export function RevealSharpQuestion({ t }: StepCtx) {
  const strike = easeOut(seg(t, 0.6, 1.0));
  const pts: [number, number][] = [
    [240, 112],
    [270, 106],
    [300, 108],
    [330, 96],
    [360, 84],
    [390, 64],
    [420, 54],
    [450, 50],
    [480, 46],
    [510, 48],
  ];
  const cross = 375;
  const act = 480;
  const br = easeInOut(seg(t, 2.6, 3.3));
  return (
    <Svg label="'what do you do the moment you see it?' turns a vague demand into a concrete bound" h={210}>
      <g opacity={easeOut(seg(t, 0, 0.4))}>
        <T x={40} y={70} s={18} f={C.primary} serif italic>
          "real-time"
        </T>
        <line x1={36} y1={64} x2={lerp(36, 140, strike)} y2={64} stroke={C.badText} strokeWidth={2} opacity={strike > 0 ? 1 : 0} />
      </g>
      <T x={40} y={96} s={13} f={C.badText} o={easeOut(seg(t, 1.0, 1.3))}>
        not checkable
      </T>
      <line x1={240} y1={120} x2={520} y2={120} stroke={C.line} opacity={easeOut(seg(t, 0.9, 1.2))} />
      <g opacity={easeOut(seg(t, 1.1, 1.4))}>
        <line x1={240} y1={74} x2={520} y2={74} stroke={C.secondary} strokeDasharray="4 4" />
        <T x={235} y={79} s={13} f={C.secondary} a="end">
          the line
        </T>
      </g>
      <Draw pts={pts} t={t} from={1.3} to={2.4} stroke={C.focus} w={2} />
      <Reticle x={cross} y={74} w={18} h={18} t={t} at={2.2} />
      {br > 0 && (
        <g>
          <path d={`M${cross} 140 L${cross} 146 L${lerp(cross, act, br)} 146 L${lerp(cross, act, br)} 140`} fill="none" stroke={C.focus} strokeWidth={1.6} />
          <T x={(cross + act) / 2} y={166} s={13} f={C.focus} a="middle" o={easeOut(seg(t, 3.1, 3.4))}>
            the bound
          </T>
        </g>
      )}
      {t > 3.0 && (
        <g opacity={easeOut(seg(t, 3.0, 3.3))}>
          <line x1={act} y1={40} x2={act} y2={130} stroke={C.focus} strokeWidth={1.2} />
          <T x={act - 6} y={34} s={13} f={C.focus} a="end">
            walks the floor
          </T>
        </g>
      )}
      <T x={30} y={196} s={14} f={C.secondary} o={easeOut(seg(t, 3.5, 3.9))}>
        a stated trigger, not an adjective
      </T>
    </Svg>
  );
}

const ANSWERS: { k: string; v: string; bet?: boolean }[] = [
  { k: 'count now', v: '40' },
  { k: 'query rate', v: '12' },
  { k: 'retention', v: '3 years' },
  { k: 'grain', v: 'per line' },
  { k: 'next year', v: '80', bet: true },
];

// 6 · Five answer cards land one by one; four get a solid outline and a check, stated in the room. The fifth drops a
// little, its outline turns dashed pale blue, and a "bet" tag pins to it.
export function RevealBetVsFact({ t }: StepCtx) {
  const mark = easeOut(seg(t, 2.6, 3.2));
  return (
    <Svg label="five answer cards, four stated directly, one a guess about next year" h={210}>
      {ANSWERS.map((a, i) => {
        const x = 25 + i * 112;
        const k = easeOutBack(seg(t, 0.2 + i * 0.35, 0.6 + i * 0.35));
        if (k <= 0) return null;
        const y = 40 + (1 - Math.min(1, k)) * -20 + (a.bet ? 18 * mark : 0);
        const stroke = a.bet ? (mark > 0.5 ? C.second : C.line) : C.primary;
        return (
          <g key={a.k} opacity={Math.min(1, k)}>
            <rect x={x} y={y} width={100} height={62} rx={4} fill={C.panel} stroke={stroke} strokeWidth={1.3} strokeDasharray={a.bet && mark > 0.5 ? '4 3' : undefined} />
            <T x={x + 50} y={y + 22} s={13} f={C.secondary} a="middle">
              {a.k}
            </T>
            <T x={x + 50} y={y + 46} s={16} f={a.bet && mark > 0.5 ? C.second : C.focus} a="middle">
              {a.v}
            </T>
            {!a.bet && <Tick x={x + 50} y={y + 82} k={easeOut(seg(t, 2.0 + i * 0.1, 2.3 + i * 0.1))} />}
          </g>
        );
      })}
      {mark > 0 && (
        <g opacity={mark}>
          <rect x={503} y={24 + 18 * mark - 18} width={40} height={20} rx={10} fill={C.panel} stroke={C.second} />
          <T x={523} y={38 + 18 * mark - 18} s={13} f={C.second} a="middle">
            bet
          </T>
        </g>
      )}
      <Line2 y={170} l="four answers" r="stated facts" o={easeOut(seg(t, 2.2, 2.6))} />
      <Line2 y={196} l="one answer" r="marked as a bet" rc={C.second} o={easeOut(seg(t, 3.0, 3.4))} />
    </Svg>
  );
}

// 7 · Three small panels. Grain: one plant bar splits into per-line slices, then the model block forms under it.
// Concurrency: a flat query line spikes at the Monday run while user dots stack on it. Retention: the filing's bar
// lengthens year by year to three.
export function RevealGrainConcurrency({ t }: StepCtx) {
  const split = easeInOut(seg(t, 0.6, 1.2));
  const model = easeOut(seg(t, 1.2, 1.6));
  const spike = easeInOut(seg(t, 1.8, 2.4));
  const ret = easeInOut(seg(t, 2.8, 3.6));
  const spk: [number, number][] = [
    [225, 130],
    [260, 128],
    [285, 129],
    [300, lerp(129, 70, spike)],
    [315, 129],
    [340, 128],
    [375, 130],
  ];
  return (
    <Svg label="grain asked before modeling; concurrency at the Monday run; retention for the filing" h={240}>
      {/* grain */}
      <g opacity={easeOut(seg(t, 0, 0.4))}>
        <T x={105} y={30} s={14} f={C.primary} a="middle">
          grain
        </T>
        {[0, 1, 2, 3].map((i) => (
          <rect key={i} x={30 + i * 37.5 + split * (i - 1.5) * 4} y={60} width={37.5 - split * 4 + 0.5} height={30} fill={C.band} stroke={split > 0.5 ? C.focus : C.line} />
        ))}
        <T x={105} y={112} s={13} f={split > 0.5 ? C.focus : C.secondary} a="middle">
          {split > 0.5 ? 'per line' : 'per plant'}
        </T>
        <Box x={55} y={124} w={100} h={28} label="model" o={model} />
      </g>
      {/* concurrency */}
      <g opacity={easeOut(seg(t, 0.2, 0.6))}>
        <T x={300} y={30} s={14} f={C.primary} a="middle">
          concurrency
        </T>
        <line x1={225} y1={140} x2={375} y2={140} stroke={C.line} />
        <Draw pts={spk} t={t} from={0.4} to={1.0} stroke={C.secondary} w={1.6} pen={false} />
        {spike > 0 &&
          [0, 1, 2, 3, 4].map((i) => (
            <circle key={i} cx={i % 2 === 0 ? 278 : 322} cy={120 - i * 11} r={4} fill={C.focus} opacity={easeOut(seg(t, 2.0 + i * 0.1, 2.3 + i * 0.1))} />
          ))}
        <T x={300} y={162} s={13} f={spike > 0.5 ? C.focus : C.secondary} a="middle" o={easeOut(seg(t, 0.4, 0.8))}>
          Monday run
        </T>
      </g>
      {/* retention */}
      <g opacity={easeOut(seg(t, 0.4, 0.8))}>
        <T x={495} y={30} s={14} f={C.primary} a="middle">
          retention
        </T>
        <rect x={420} y={60} width={150} height={30} fill={C.band} stroke={C.line} />
        <rect x={420} y={60} width={Math.max(0, 150 * ret)} height={30} fill={C.primary} />
        {[1, 2].map((i) => (
          <line key={i} x1={420 + i * 50} y1={92} x2={420 + i * 50} y2={98} stroke={C.secondary} />
        ))}
        <T x={495} y={112} s={13} f={ret > 0.95 ? C.focus : C.secondary} a="middle">
          {ret > 0.95 ? '3 years' : 'how far back?'}
        </T>
        <Box x={445} y={124} w={100} h={28} label="filing" o={easeOut(seg(t, 3.4, 3.8))} />
      </g>
      <T x={300} y={210} s={14} f={C.secondary} a="middle" o={easeOut(seg(t, 3.6, 4.0))}>
        asked before the model is built
      </T>
    </Svg>
  );
}

const EXPORTS: { label: string; bad: boolean }[] = [
  { label: 'api read', bad: false },
  { label: 'csv download', bad: true },
  { label: 'bi extract', bad: true },
];

// 8 · The engine sits inside its policy boundary. Three paths leave it; the api read passes through a gate in the
// boundary and keeps its check, while the csv download and the bi extract cross the line and flip red.
export function RevealExportPaths({ t }: StepCtx) {
  return (
    <Svg label="a csv download and a bi extract both flip red — each bypasses the engine's own policy" h={210}>
      <g opacity={easeOut(seg(t, 0, 0.4))}>
        <rect x={30} y={14} width={230} height={140} rx={8} fill="none" stroke={C.secondary} strokeDasharray="5 4" />
        <T x={45} y={36} s={13} f={C.secondary}>
          engine policy
        </T>
        <Box x={70} y={70} w={120} label="engine" lit />
      </g>
      <rect x={252} y={28} width={16} height={22} fill={C.ink} stroke={C.focus} opacity={easeOut(seg(t, 0.4, 0.7))} />
      {EXPORTS.map((e, i) => {
        const y = 39 + i * 52;
        const at = 0.6 + i * 0.6;
        const p = seg(t, at + 0.5, at + 0.9);
        const flipped = p >= 0.5;
        const sx = e.bad ? Math.max(0.02, Math.abs(Math.cos(p * Math.PI))) : 1;
        const red = e.bad && flipped;
        const o = easeOut(seg(t, at + 0.3, at + 0.5));
        return (
          <g key={e.label}>
            <Draw pts={[[190, 86], [225, y], [360, y]]} t={t} from={at} to={at + 0.4} stroke={red ? C.badText : C.focus} w={1.5} pen={false} />
            {o > 0 && (
              <g opacity={o} transform={`translate(460 0) scale(${sx} 1) translate(-460 0)`}>
                <rect x={360} y={y - 16} width={200} height={32} rx={4} fill={red ? C.bad : C.panel} stroke={red ? C.badText : C.focus} strokeWidth={1.3} />
                <T x={460} y={y + 5} s={13} f={C.focus} a="middle">
                  {red ? `${e.label} · no policy` : e.label}
                </T>
              </g>
            )}
            {!e.bad && <Tick x={578} y={y} k={easeOut(seg(t, at + 0.6, at + 0.9))} />}
          </g>
        );
      })}
      <Line2 y={196} l="two exports" r="outside the policy" rc={C.badText} o={easeOut(seg(t, 2.9, 3.3))} />
    </Svg>
  );
}

// 9 · All of it at once: four consumers wired to their stores; on the right the sharp question, the bet card in pale
// blue, and the two export chips in red; four summary lines below.
export function Recap({ t }: StepCtx) {
  const MINI = ['dashboard', 'quality', 'maintenance', 'filing'];
  const MS = ['aggregate', 'point-in-time', 'immutable'];
  return (
    <Svg label="four consumers landing on four stores, the sharp question, the bet flagged, two export paths flagged" h={290}>
      {MINI.map((c, i) => {
        const y = 14 + i * 38;
        const s = STORE_OF[i];
        const sy = s === 0 ? 14 + 30 : 14 + (s + 1) * 38 + 14;
        return (
          <g key={c}>
            <Box x={20} y={y} w={120} h={28} label={c} o={easeOut(seg(t, i * 0.12, i * 0.12 + 0.35))} />
            <Draw pts={[[140, y + 14], [190, sy]]} t={t} from={0.5 + i * 0.12} to={0.8 + i * 0.12} stroke={C.secondary} w={1.2} pen={false} />
          </g>
        );
      })}
      {MS.map((m, i) => {
        const y = i === 0 ? 14 : 14 + (i + 1) * 38;
        const h = i === 0 ? 66 : 28;
        return <Box key={m} x={190} y={y} w={140} h={h} label={m} o={easeOut(seg(t, 0.4 + i * 0.1, 0.8 + i * 0.1))} />;
      })}
      <Box x={360} y={14} w={215} h={28} label="what do you do then?" lit o={easeOut(seg(t, 1.2, 1.6))} />
      <Box x={360} y={56} w={215} h={28} label="next year · 80 · bet" dash="4 3" stroke={C.second} o={easeOut(seg(t, 1.6, 2.0))} />
      {['csv download', 'bi extract'].map((e, i) => {
        const k = easeOut(seg(t, 2.0 + i * 0.2, 2.4 + i * 0.2));
        return k <= 0 ? null : (
          <g key={e} opacity={k}>
            <rect x={360} y={98 + i * 38} width={215} height={28} rx={4} fill={C.bad} stroke={C.badText} />
            <T x={467} y={117 + i * 38} s={13} f={C.focus} a="middle">
              {e}
            </T>
          </g>
        );
      })}
      <Line2 y={202} l="consumers" r="every one listed" o={easeOut(seg(t, 2.6, 2.9))} />
      <Line2 y={228} l="freshness" r="tied to the moment" o={easeOut(seg(t, 2.9, 3.2))} />
      <Line2 y={254} l="bets" r="marked as bets" rc={C.second} o={easeOut(seg(t, 3.2, 3.5))} />
      <Line2 y={280} l="exports" r="policy gaps" rc={C.badText} o={easeOut(seg(t, 3.5, 3.8))} />
    </Svg>
  );
}

const FIVE = ['who reads?', 'how fresh?', 'what grain?', 'how many?', 'exports?'];

// 10 · A new prompt names a noun. Before the pick, a dashed "build it" box waits under it. After, the box fades and
// five question cards drop in a row; their answers fork one line into two candidate designs.
export function ProveIt({ t, answer }: StepCtx) {
  const s = useSinceAnswer(answer !== null);
  const on = answer !== null;
  const gone = on ? easeOut(seg(s, 0, 0.4)) : 0;
  const fork = on ? easeInOut(seg(s, 1.8, 2.4)) : 0;
  return (
    <Svg label="'a single view of the customer' — just as vague, needing the same five questions" h={250}>
      <T x={300} y={36} s={16} f={C.focus} a="middle" serif italic o={easeOut(seg(t, 0, 0.5))}>
        "a single view of the customer"
      </T>
      <T x={300} y={60} s={13} f={C.secondary} a="middle" o={easeOut(seg(t, 0.6, 1.0))}>
        a noun, nothing more
      </T>
      {gone < 1 && <Box x={210} y={90} w={180} label="build it now?" dash="4 3" o={easeOut(seg(t, 1.0, 1.4)) * (1 - gone)} />}
      {FIVE.map((q, i) => {
        const k = on ? easeOutBack(seg(s, 0.4 + i * 0.2, 0.8 + i * 0.2)) : 0;
        if (k <= 0) return null;
        return <Box key={q} x={25 + i * 112} y={80 + (1 - Math.min(1, k)) * -16} w={104} h={30} label={q} o={Math.min(1, k)} lit />;
      })}
      {fork > 0 && (
        <g fill="none" stroke={C.focus} strokeWidth={1.5}>
          <line x1={300} y1={112} x2={300} y2={140} />
          <path d={`M300 140 L${lerp(300, 180, fork)} 165`} />
          <path d={`M300 140 L${lerp(300, 420, fork)} 165`} />
        </g>
      )}
      <Box x={90} y={165} w={180} label="low-latency lookup" o={on ? easeOut(seg(s, 2.3, 2.7)) : 0} />
      <Box x={330} y={165} w={180} label="warehouse table" o={on ? easeOut(seg(s, 2.4, 2.8)) : 0} />
      <T x={300} y={232} s={14} f={C.secondary} a="middle" o={on ? easeOut(seg(s, 2.8, 3.2)) : 0}>
        the same five questions fork it
      </T>
    </Svg>
  );
}
