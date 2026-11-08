import type { StepCtx } from '../../../../../reels/types';
import { easeOut, seg, lerp, clamp, easeInOut } from '../../../../../reels/anim';
import { Code } from '../../../../../reels/Code';
import { Draw, Stack, Svg, T, C, Reticle, Decode } from '../../../../../reels/kit';

// A real election under terms and randomized timeouts elects a correct
// leader only when the up-to-date-log voting rule is enforced; a real
// PreVote round genuinely stops a partitioned node's own stale term from
// ever disrupting a healthy cluster at all.
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


// ── 1 · Does the fastest timeout genuinely win (predict) ──────────────────
export function ElectionPredict({ t }: StepCtx) {
  return (
    <Stack>
      <Code
        title="five healthy nodes, real deterministic timeouts"
        lines={['let winner = timeouts.iter().enumerate().min_by_key(..);', 'run_election(winner) -- does it genuinely win?']}
        t={t}
        start={0.1}
        end={2.6}
        highlight={[1]}
      />
    </Stack>
  );
}

// ── 2 · Measured: fastest timeout wins ─────────────────────────────────────
// Five identical nodes, each with its own randomized election timer draining. The middle one's runs out first: it
// grows into a candidate, the other four grant their votes along arcs that draw into it, and it decodes as leader.
const SPEED = [0.62, 0.78, 1.0, 0.7, 0.55];
export function ElectionReveal({ t }: StepCtx) {
  const xs = [60, 180, 300, 420, 540];
  const drain = (i: number) => clamp(seg(t, 0.1, 1.0) * SPEED[i]);
  const cand = ez(t, 1.0, 0.35);
  return (
    <Svg label="leader_election_log_up_to_date_voting.rs, measured" h={240}>
      {xs.map((x, i) => {
        const c = i === 2;
        return (
          <g key={x} opacity={ez(t, 0, 0.3)}>
            <circle cx={x} cy={74} r={c ? 14 + 5 * cand : 14} fill={c && cand > 0 ? C.second : C.cocoa} stroke={c ? C.focus : C.latte} strokeWidth={2} />
            <rect x={x - 40} y={100} width={80} height={6} rx={3} fill={C.cocoa} />
            <rect x={x - 40} y={100} width={Math.max(0, 80 * (1 - drain(i)))} height={6} rx={3} fill={c ? C.focus : C.latte} />
          </g>
        );
      })}
      {xs.map((x, i) =>
        i === 2 ? null : (
          <Draw key={x} pts={Array.from({ length: 17 }, (_, j) => {
            const u = j / 16;
            return [lerp(x, 300, u), 56 - Math.sin(u * Math.PI) * (Math.abs(x - 300) / 240) * 36] as const;
          })} t={t} from={1.3 + Math.abs(i - 2) * 0.15} to={1.7 + Math.abs(i - 2) * 0.15} stroke={C.second} w={2} />
        ),
      )}
      <Decode text="leader" t={t} at={2.05} dur={0.4} x={300} y={132} s={14} a="middle" f={C.focus} w={600} />
      <Reticle x={300} y={74} w={56} h={56} t={t} at={2.2} />
      <Line t={t} at={0.9} y={180} text="the fastest timeout becomes candidate" />
      <Line t={t} at={1.7} y={216} text="a real majority of votes, genuinely won" mark="tick" />
    </Svg>
  );
}

// ── 3 · Does a stale candidate still win (predict) ─────────────────────────
export function StaleCandidatePredict({ t }: StepCtx) {
  return (
    <Stack>
      <Code
        title="one candidate's own log is genuinely behind"
        lines={['// fresh term, but a shorter log than every voter', 'grant_vote(voter, term, candidate_log) -- granted?']}
        t={t}
        start={0.1}
        end={2.6}
        highlight={[1]}
      />
    </Stack>
  );
}

// ── 4 · Measured: genuinely rejected (takeaway) ─────────────────────────────
export function StaleCandidateReveal({ t }: StepCtx) {
  const bounce = easeOut(seg(t, 0.6, 0.95));
  const dy = (1 - Math.abs(bounce - 0.5) * 2) * 12;
  return (
    <Svg label="leader_election_log_up_to_date_voting.rs, measured" h={200}>
      <T x={60} y={50} s={14} f={C.crema} o={fa(t, 0.3, 0.4)}>a fresh term alone, and a behind log</T>
      <T x={70} y={80} s={12} f={C.latte} o={fa(t, 0.4, 0.3)}>candidate: fresh term, short log</T>
      <circle cx={280} cy={76 - dy} r={5} fill={C.cherry} opacity={fa(t, 0.5, 0.2)} />
      {fa(t, 1.1, 0.4) > 0.85 && <T x={190} y={130} s={13} a="middle" f={C.mocha}>genuinely rejected, genuinely loses</T>}
      <T x={60} y={165} s={13} f={C.latte} o={fa(t, 1.5, 0.4)}>a fresh term is never enough on its own</T>
    </Svg>
  );
}

// ── 5 · Does the healthy leader step down (predict) ────────────────────────
export function DisruptionPredict({ t }: StepCtx) {
  return (
    <Stack>
      <Code
        title="a partitioned node, rejoining with an inflated term"
        lines={['// missed heartbeats raised its own term locally', '// the healthy leader sees that higher term now']}
        t={t}
        start={0.1}
        end={2.6}
        highlight={[1]}
      />
    </Stack>
  );
}

// ── 6 · Measured: genuinely disrupted (takeaway) ───────────────────────────
export function DisruptionReveal({ t }: StepCtx) {
  return (
    <Svg label="leader_election_log_up_to_date_voting.rs, measured" h={200}>
      <T x={60} y={50} s={14} f={C.crema} o={fa(t, 0.3, 0.4)}>every node updates to the higher term it sees</T>
      <T x={70} y={80} s={12} f={C.latte} o={fa(t, 0.4, 0.3)}>rejoining node: inflated term</T>
      <circle cx={280} cy={76} r={5} fill={C.caramel} opacity={fa(t, 0.45, 0.2)} />
      <Draw pts={[[200, 76], [160, 110]]} t={t} from={0.7} to={0.95} stroke={C.cherry} w={2} pen />
      <T x={70} y={122} s={12} f={C.latte} o={fa(t, 0.95, 0.3)}>leader: steps down</T>
      {fa(t, 1.2, 0.4) > 0.85 && <T x={190} y={150} s={13} a="middle" f={C.mocha}>the healthy leader genuinely steps down</T>}
      <T x={60} y={180} s={13} f={C.latte} o={fa(t, 1.6, 0.3)}>a bare term rise alone can depose a leader</T>
    </Svg>
  );
}

// ── 7 · Does PreVote stop the identical disruption (predict) ──────────────
export function PrevotePredict({ t }: StepCtx) {
  return (
    <Stack>
      <Code
        title="the identical node, a real pre-vote round first"
        lines={['grant_prevote(voter, would_be_term, log) -- granted?', '// voter already has a live leader -- denied first?']}
        t={t}
        start={0.1}
        end={2.6}
        highlight={[1]}
      />
    </Stack>
  );
}

// ── 8 · Measured: pre-vote denied, term never rises ─────────────────────────
// Cut off behind the partition, the node asks for pre-votes; each request travels to a healthy voter that still
// hears its leader, and comes back crossed out. The node's term bar never moves, and the leader's heartbeat keeps on.
export function PrevoteReveal({ t }: StepCtx) {
  const voters = [
    { x: 330, y: 50 },
    { x: 450, y: 40 },
    { x: 330, y: 130 },
    { x: 450, y: 140 },
  ];
  const beat = 1 + 0.12 * Math.sin(t * 9);
  return (
    <Svg label="leader_election_log_up_to_date_voting.rs, measured" h={260}>
      <Draw pts={[[200, 14], [200, 170]]} t={t} from={0} to={0.3} stroke={C.mocha} w={2} dash="6 5" pen={false} />
      <circle cx={90} cy={90} r={16} fill={C.cocoa} stroke={C.latte} strokeWidth={2} />
      <T x={90} y={130} s={13} a="middle" f={C.latte}>partitioned</T>
      <rect x={128} y={60} width={10} height={50} rx={2} fill={C.cocoa} />
      <rect x={128} y={85} width={10} height={25} rx={2} fill={C.latte} />
      <rect x={128} y={60} width={10} height={25} rx={2} fill="none" stroke={C.taupe} strokeDasharray="3 3" opacity={ez(t, 0.4)} />
      <T x={133} y={50} s={13} a="middle" f={C.taupe} o={ez(t, 0.4)}>term</T>
      <circle cx={540} cy={90} r={16 * beat} fill={C.focus} opacity={ez(t, 0, 0.3)} />
      <T x={540} y={130} s={13} a="middle" f={C.crema}>leader</T>
      {voters.map((v, i) => {
        const go = easeInOut(seg(t, 0.4 + i * 0.25, 0.9 + i * 0.25));
        const no = ez(t, 0.9 + i * 0.25, 0.3);
        return (
          <g key={i}>
            <circle cx={v.x} cy={v.y} r={12} fill={C.cocoa} stroke={C.crema} strokeWidth={1.5} />
            <line x1={v.x + 12} y1={v.y} x2={528} y2={90} stroke={C.mocha} strokeWidth={1} />
            {go > 0 && go < 1 && <circle cx={lerp(108, v.x - 14, go)} cy={lerp(90, v.y, go)} r={4} fill={C.second} />}
            <path d={`M${v.x - 22} ${v.y - 7} l10 10 m0 -10 l-10 10`} stroke={C.cherryText} strokeWidth={2.2} strokeDasharray={30} strokeDashoffset={30 * (1 - no)} opacity={no > 0 ? 1 : 0} />
          </g>
        );
      })}
      <Line t={t} at={1.0} y={200} text="every live-leader voter denies the pre-vote" mark="cross" mf={C.cherryText} />
      <Line t={t} at={1.9} y={236} text="the node's own term never even rises" />
    </Svg>
  );
}

// ── 9 · etcd's own words on pre-vote (connecting) ─────────────────────────
// The quote lands and its first line, the rule, is underlined. Under it, the partitioned node slides back into the
// cluster: its term stays put, and the leader it rejoins is still the leader, locked on at the end.
export function PrevoteDocsReveal({ t }: StepCtx) {
  const back = easeInOut(seg(t, 1.2, 2.0));
  return (
    <Svg label="etcd-io/raft, doc.go, quoted" h={210}>
      <Quote t={t} lines={['no term rises unless the pre-vote would win', 'this minimizes disruption on rejoin']} hot={0} y0={40} gap={38} beat={0.45} />
      <Draw pts={[[200, 120], [200, 180]]} t={t} from={0.5} to={0.8} stroke={C.mocha} w={2} dash="6 5" pen={false} o={1 - back} />
      <circle cx={lerp(90, 330, back)} cy={150} r={13} fill={C.cocoa} stroke={C.latte} strokeWidth={2} opacity={ez(t, 0.5)} />
      <T x={lerp(90, 330, back)} y={190} s={13} a="middle" f={C.latte} o={ez(t, 0.5) * (1 - back)}>
        partitioned
      </T>
      <T x={330} y={190} s={13} a="middle" f={C.latte} o={back}>
        rejoined
      </T>
      {[400, 460].map((x) => (
        <circle key={x} cx={x} cy={150} r={11} fill={C.cocoa} stroke={C.crema} strokeWidth={1.5} opacity={ez(t, 0.6)} />
      ))}
      <circle cx={530} cy={150} r={15} fill={C.focus} opacity={ez(t, 0.6)} />
      <T x={530} y={190} s={13} a="middle" f={C.crema} o={ez(t, 0.6)}>leader</T>
      <Reticle x={530} y={150} w={46} h={46} t={t} at={2.15} />
    </Svg>
  );
}

// ── 10 · Recap ─────────────────────────────────────────────────────────────
export function Recap({ t }: StepCtx) {
  return (
    <RecapList
      t={t}
      label="recap: a real election, checked against the real rules"
      rows={['the fastest real timeout genuinely wins', 'a behind log loses, fresh term or not', 'a bare term rise alone can depose a leader', 'a real pre-vote round genuinely stops that']}
    />
  );
}
