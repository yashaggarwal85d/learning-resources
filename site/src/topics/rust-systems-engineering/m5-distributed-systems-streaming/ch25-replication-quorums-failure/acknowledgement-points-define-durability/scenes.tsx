import type { StepCtx } from '../../../../../reels/types';
import { easeOut, seg, lerp, clamp, easeInOut, easeOutBack } from '../../../../../reels/anim';
import { Code } from '../../../../../reels/Code';
import { Draw, Stack, Svg, T, C, Reticle, Decode } from '../../../../../reels/kit';

// Which single point in a replication pipeline counts as "acknowledged"
// genuinely decides whether a write survives the node that accepted it
// being destroyed: a subset smaller than a quorum, even a durably
// recorded one, can lose it outright, while a real quorum cannot.
const fa = (t: number, a: number, d = 0.4) => easeOut(seg(t, a, a + d));
// ── Moves shared by this topic's measured, quoted and recap figures ─────────
/** Eased 0..1 from `a` over `d` seconds. */
const ez = (t: number, a: number, d = 0.4) => easeOut(seg(t, a, a + d));

/** A caption line that slides in from the left on its beat; its marker draws itself (tick, cross) or grows (dot). */
function Line({ t, at, y, text, mark = 'dot', mf = C.caramel, f = C.crema }: { t: number; at: number; y: number; text: string; mark?: 'dot' | 'tick' | 'cross'; mf?: string; f?: string }) {
  const k = ez(t, at, 0.45);
  const m = ez(t, at + 0.2, 0.35);
  if (k <= 0) return null;
  return (
    <g opacity={k} transform={`translate(${(-28 * (1 - k)).toFixed(2)} 0)`}>
      {mark === 'dot' && <circle cx={30} cy={y - 5} r={5 * m} fill={mf} />}
      {mark === 'tick' && <path d={`M23 ${y - 5} l5 5 l10 -11`} fill="none" stroke={mf} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" strokeDasharray={24} strokeDashoffset={24 * (1 - m)} />}
      {mark === 'cross' && <path d={`M24 ${y - 11} l12 12 M36 ${y - 11} l-12 12`} fill="none" stroke={mf} strokeWidth={2.5} strokeLinecap="round" strokeDasharray={34} strokeDashoffset={34 * (1 - m)} />}
      <T x={48} y={y} s={13} f={f}>
        {text}
      </T>
    </g>
  );
}

/**
 * A quoted source: the quote panel rises into place, a rule draws down its left edge, each quoted line slides in on
 * its beat, and the line that carries the point gets an underline drawn under it once the quote has landed.
 */
function Quote({ t, lines, y0 = 40, gap = 40, hot, at = 0.25, beat = 0.55 }: { t: number; lines: string[]; y0?: number; gap?: number; hot: number; at?: number; beat?: number }) {
  const k = ez(t, 0, 0.5);
  const top = y0 - 26;
  const bottom = y0 + (lines.length - 1) * gap + 16;
  const u = at + lines.length * beat;
  return (
    <g>
      <rect x={14} y={top + (1 - k) * 14} width={572} height={bottom - top} rx={6} fill={C.roast} opacity={k} />
      <Draw pts={[[26, top + 8], [26, bottom - 8]]} t={t} from={0.15} to={0.15 + beat * lines.length} stroke={C.taupe} w={2} pen={false} />
      {lines.map((l, i) => {
        const s = ez(t, at + i * beat, 0.45);
        return (
          <g key={l} opacity={s} transform={`translate(${(-22 * (1 - s)).toFixed(2)} 0)`}>
            <T x={42} y={y0 + i * gap} s={14} f={i === hot ? C.focus : C.crema} serif italic>
              {l}
            </T>
          </g>
        );
      })}
      <Draw pts={[[42, y0 + hot * gap + 8], [42 + Math.min(520, lines[hot].length * 7.2), y0 + hot * gap + 8]]} t={t} from={u} to={u + 0.5} stroke={C.focus} w={1.5} />
    </g>
  );
}

/**
 * The recap as a payoff: a spine draws down the left, each point's tick is drawn as the spine reaches it and the
 * point slides in beside it, and the last point, the one the topic stands on, is locked on once it lands.
 */
function RecapList({ t, rows, label, y0 = 50, gap = 58, h = 300 }: { t: number; rows: string[]; label: string; y0?: number; gap?: number; h?: number }) {
  const beat = 2.2 / rows.length;
  const at = (i: number) => 0.2 + i * beat;
  const last = rows.length - 1;
  return (
    <Svg label={label} h={h}>
      <Draw pts={[[30, y0 - 5], [30, y0 - 5 + last * gap]]} t={t} from={at(0)} to={at(last)} stroke={C.mocha} w={2} pen={false} />
      {rows.map((r, i) => {
        const k = ez(t, at(i), 0.45);
        const m = ez(t, at(i) + 0.1, 0.35);
        const y = y0 + i * gap;
        const f = i === last ? C.focus : C.caramel;
        return (
          <g key={r}>
            <circle cx={30} cy={y - 5} r={11 * m} fill={C.espresso} stroke={f} strokeWidth={1.5} opacity={m} />
            <path d={`M24 ${y - 5} l4 4 l8 -9`} fill="none" stroke={f} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" strokeDasharray={20} strokeDashoffset={20 * (1 - m)} />
            <g opacity={k} transform={`translate(${(-24 * (1 - k)).toFixed(2)} 0)`}>
              <T x={52} y={y} s={13} f={i === last ? C.focus : C.crema} w={i === last ? 600 : 500}>
                {r}
              </T>
            </g>
          </g>
        );
      })}
      <Reticle x={300} y={y0 + last * gap - 5} w={576} h={38} t={t} at={at(last) + 0.45} />
    </Svg>
  );
}


// ── 1 · Does acked-by-subset survive leader destruction (predict) ────────
export function SubsetPredict({ t }: StepCtx) {
  return (
    <Stack>
      <Code
        title="acknowledged by the leader alone, then destroyed"
        lines={['replicate_to_threshold(write, 1); destroy_node(leader);', '// does the write survive?']}
        t={t}
        start={0.1}
        end={2.6}
        highlight={[1]}
      />
    </Stack>
  );
}

// ── 2 · Measured: genuinely lost (no takeaway, the test's own "from" step) ──
// The write drops into the leader alone and is acknowledged; the followers' slots stay empty. Then the leader is
// struck out, sinks, and the only copy falls out of the picture with it.
export function SubsetReveal({ t }: StepCtx) {
  const land = ez(t, 0.15, 0.45);
  const kill = ez(t, 1.4, 0.4);
  const fall = easeInOut(seg(t, 1.7, 2.3));
  const nodes = [
    { x: 60, label: 'leader' },
    { x: 240, label: 'follower' },
    { x: 420, label: 'follower' },
  ];
  return (
    <Svg label="acknowledgement_point_durability_tradeoff.rs, measured" h={210}>
      {nodes.map((n, i) => (
        <g key={i} opacity={i === 0 ? 1 - 0.55 * kill : ez(t, 0.05 + i * 0.1)} transform={`translate(0 ${i === 0 ? (kill * 10).toFixed(2) : 0})`}>
          <rect x={n.x} y={40} width={120} height={44} rx={6} fill="none" stroke={i === 0 ? C.caramel : C.mocha} strokeWidth={2} strokeDasharray={i === 0 ? undefined : '5 4'} />
          <T x={n.x + 60} y={104} s={13} a="middle" f={C.latte}>
            {n.label}
          </T>
        </g>
      ))}
      <circle cx={120} cy={lerp(0, 62, land) + fall * 110 + kill * 10} r={7 * (1 - fall)} fill={C.caramel} opacity={land > 0 ? 1 : 0} />
      <path d="M190 30 l6 6 l12 -13" fill="none" stroke={C.focus} strokeWidth={2.5} strokeDasharray={30} strokeDashoffset={30 * (1 - ez(t, 0.65, 0.3))} opacity={1 - kill} />
      <Draw pts={[[70, 44], [170, 92]]} t={t} from={1.4} to={1.6} stroke={C.cherryText} w={3} />
      <Draw pts={[[170, 44], [70, 92]]} t={t} from={1.55} to={1.75} stroke={C.cherryText} w={3} />
      <Line t={t} at={0.6} y={150} text="held only by the leader" />
      <Line t={t} at={1.7} y={190} text="the leader is destroyed: gone" mark="cross" mf={C.cherryText} />
    </Svg>
  );
}

// ── 3 · Does leader-only durability survive (predict) ─────────────────────
export function LeaderOnlyPredict({ t }: StepCtx) {
  return (
    <Stack>
      <Code
        title="durably recorded by the leader alone, then destroyed"
        lines={['// a disk write on the leader -- enough on its own?', '// or still lost when that one node is gone?']}
        t={t}
        start={0.1}
        end={2.6}
        highlight={[1]}
      />
    </Stack>
  );
}

// ── 4 · Measured: genuinely lost too (takeaway) ───────────────────────────
export function LeaderOnlyReveal({ t }: StepCtx) {
  const vanish = easeOut(seg(t, 0.7, 1.0));
  return (
    <Svg label="acknowledgement_point_durability_tradeoff.rs, measured" h={200}>
      <T x={60} y={50} s={14} f={C.crema} o={fa(t, 0.3, 0.4)}>durable on the leader, still only one node</T>
      <rect x={140} y={65} width={100} height={36} rx={6} fill="none" stroke={C.caramel} strokeWidth={2} opacity={fa(t, 0.35, 0.3) * (1 - vanish)} />
      <T x={150} y={88} s={12} f={C.crema} o={fa(t, 0.35, 0.3) * (1 - vanish)}>leader: write</T>
      <Draw pts={[[150, 65], [230, 101]]} t={t} from={0.7} to={0.9} stroke={C.cherry} w={2} />
      <Draw pts={[[230, 65], [150, 101]]} t={t} from={0.7} to={0.9} stroke={C.cherry} w={2} />
      {fa(t, 1.1, 0.4) > 0.85 && <T x={190} y={130} s={13} a="middle" f={C.mocha}>genuinely lost, despite durability</T>}
      <T x={60} y={165} s={13} f={C.latte} o={fa(t, 1.5, 0.4)}>it never left the node that was destroyed</T>
    </Svg>
  );
}

// ── 5 · Does quorum-persisted survive (predict) ───────────────────────────
export function QuorumPredict({ t }: StepCtx) {
  return (
    <Stack>
      <Code
        title="persisted by a real quorum, then the leader destroyed"
        lines={['replicate_to_threshold(write, quorum_size(nodes));', '// the identical destruction -- survives this time?']}
        t={t}
        start={0.1}
        end={2.6}
        highlight={[1]}
      />
    </Stack>
  );
}

// ── 6 · Measured: genuinely survives (takeaway) ───────────────────────────
export function QuorumReveal({ t }: StepCtx) {
  const vanish = easeOut(seg(t, 0.7, 1.0));
  return (
    <Svg label="acknowledgement_point_durability_tradeoff.rs, measured" h={200}>
      <T x={60} y={50} s={14} f={C.crema} o={fa(t, 0.3, 0.4)}>a quorum held it, not just the leader</T>
      <rect x={60} y={65} width={90} height={36} rx={6} fill="none" stroke={C.caramel} strokeWidth={2} opacity={fa(t, 0.35, 0.3) * (1 - vanish)} />
      <T x={68} y={88} s={11} f={C.crema} o={fa(t, 0.35, 0.3) * (1 - vanish)}>leader</T>
      <rect x={165} y={65} width={90} height={36} rx={6} fill="none" stroke={C.caramel} strokeWidth={2} opacity={fa(t, 0.45, 0.3)} />
      <T x={173} y={88} s={11} f={C.crema} o={fa(t, 0.45, 0.3)}>follower</T>
      <Draw pts={[[70, 65], [145, 101]]} t={t} from={0.7} to={0.9} stroke={C.cherry} w={2} />
      <Draw pts={[[145, 65], [70, 101]]} t={t} from={0.7} to={0.9} stroke={C.cherry} w={2} />
      {fa(t, 1.1, 0.4) > 0.85 && <T x={190} y={130} s={13} a="middle" f={C.mocha}>genuinely survives, same destruction</T>}
      <T x={60} y={165} s={13} f={C.latte} o={fa(t, 1.5, 0.4)}>a second real copy, beyond the leader</T>
    </Svg>
  );
}

// ── 7 · Does Kafka name this exact loss (predict) ─────────────────────────
export function KafkaAcksPredict({ t }: StepCtx) {
  return (
    <Stack>
      <Code
        title="Kafka's own documentation on its weakest setting"
        lines={['// does it name the leader-alone case as a real loss?', '// or claim it is fully durable on its own?']}
        t={t}
        start={0.1}
        end={2.6}
        highlight={[1]}
      />
    </Stack>
  );
}

// ── 8 · Measured: Kafka names the real loss (takeaway) ────────────────────
// The quote lands and its verdict is underlined; underneath, its timeline plays out in order: the leader acks,
// the leader fails, and the record is lost before any follower ever got it.
export function KafkaAcksReveal({ t }: StepCtx) {
  const ev = [
    { x: 90, at: 1.2, label: 'acked' },
    { x: 290, at: 1.7, label: 'leader fails' },
  ];
  return (
    <Svg label="Confluent Docs: Kafka Producer Configuration Reference, quoted" h={210}>
      <Quote t={t} lines={['leader fails before followers replicate', 'the record: genuinely lost']} hot={1} y0={40} gap={38} beat={0.45} />
      <Draw pts={[[40, 150], [560, 150]]} t={t} from={1.0} to={2.3} stroke={C.mocha} w={1.5} pen={false} />
      {ev.map((e, i) => {
        const k = easeOutBack(seg(t, e.at, e.at + 0.35));
        return (
          <g key={e.label} opacity={clamp(k)}>
            {i === 0 ? <circle cx={e.x} cy={150} r={6 * clamp(k, 0, 1.3)} fill={C.caramel} /> : <path d={`M${e.x - 7} 143 l14 14 m0 -14 l-14 14`} stroke={C.cherryText} strokeWidth={2.5} />}
            <T x={e.x} y={lerp(186, 180, clamp(k))} s={13} a="middle" f={i === 0 ? C.crema : C.cherryText}>
              {e.label}
            </T>
          </g>
        );
      })}
      <Decode text="record lost" t={t} at={2.2} dur={0.5} x={490} y={186} s={13} a="middle" f={C.cherryText} />
    </Svg>
  );
}

// ── 9 · Kafka's own quorum-enforcement setting (connecting) ──────────────
// The quote lands; underneath, the in-sync set loses replicas one at a time. Down to the floor nothing happens;
// the moment it drops below the floor, the producer's write is refused with an exception.
export function MinInsyncReveal({ t }: StepCtx) {
  const drop = [0, ez(t, 2.0, 0.4), ez(t, 1.5, 0.4)];
  const below = ez(t, 2.3, 0.3);
  return (
    <Svg label="Confluent Docs: Kafka Topic Configuration Reference, quoted" h={210}>
      <Quote t={t} lines={['min.insync.replicas: the real floor', 'below it: the producer raises an exception']} hot={1} y0={40} gap={38} beat={0.45} />
      {[0, 1, 2].map((i) => (
        <rect key={i} x={70 + i * 50 - 14} y={135 + drop[i] * 30} width={28} height={28} rx={4} fill={below > 0 ? C.cherry : C.caramel} opacity={ez(t, 0.9 + i * 0.1) * (1 - drop[i])} />
      ))}
      <Draw pts={[[145, 125], [145, 175]]} t={t} from={1.2} to={1.5} stroke={C.focus} w={2} dash="4 3" />
      <T x={145} y={196} s={13} a="middle" f={C.latte} o={ez(t, 1.3)}>
        floor
      </T>
      <Decode text="exception" t={t} at={2.35} dur={0.5} x={400} y={155} s={15} a="middle" f={C.cherryText} w={600} />
      <Reticle x={400} y={150} w={130} h={34} t={t} at={2.4} color={C.cherryText} />
    </Svg>
  );
}

// ── 10 · Recap ─────────────────────────────────────────────────────────────
export function Recap({ t }: StepCtx) {
  return (
    <RecapList
      t={t}
      label="recap: what an acknowledgement point actually promises"
      rows={['subset: lost, once that node is destroyed', 'leader-only durable: lost too, same reason', 'real quorum: survives the identical loss', 'the rule: the ack point decides what survives']}
    />
  );
}
