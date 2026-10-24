import type { StepCtx } from '../../../../../reels/types';
import { easeOut, seg } from '../../../../../reels/anim';
import { Code } from '../../../../../reels/Code';
import { Stack, Svg, T, C } from '../../../../../reels/kit';

// A real election under terms and randomized timeouts elects a correct
// leader only when the up-to-date-log voting rule is enforced; a real
// PreVote round genuinely stops a partitioned node's own stale term from
// ever disrupting a healthy cluster at all.
const fa = (t: number, a: number, d = 0.4) => easeOut(seg(t, a, a + d));

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

// ── 2 · Measured: genuinely wins (no takeaway, "from" step) ───────────────
export function ElectionReveal({ t }: StepCtx) {
  const rows = ['the fastest timeout becomes candidate', 'a real majority of votes, genuinely won'];
  return (
    <Svg label="leader_election_log_up_to_date_voting.rs, measured" h={180}>
      {rows.map((r, i) => (
        <g key={r} opacity={fa(t, 0.2 + i * 0.4, 0.4)}>
          <circle cx={30} cy={40 + i * 45} r={5} fill={C.caramel} />
          <T x={48} y={46 + i * 45} s={13} f={C.crema}>{r}</T>
        </g>
      ))}
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
  return (
    <Svg label="leader_election_log_up_to_date_voting.rs, measured" h={200}>
      <T x={60} y={50} s={14} f={C.crema} o={fa(t, 0.3, 0.4)}>a fresh term alone, and a behind log</T>
      <g opacity={fa(t, 0.9, 0.4)}>
        <rect x={60} y={75} width={300} height={44} rx={6} fill="none" stroke={C.caramel} strokeWidth={2} />
        <T x={210} y={102} s={13} a="middle" f={C.mocha}>genuinely rejected, genuinely loses</T>
      </g>
      <T x={60} y={150} s={13} f={C.latte} o={fa(t, 1.5, 0.4)}>a fresh term is never enough on its own</T>
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
      <g opacity={fa(t, 0.9, 0.4)}>
        <rect x={60} y={75} width={300} height={44} rx={6} fill="none" stroke={C.caramel} strokeWidth={2} />
        <T x={210} y={102} s={13} a="middle" f={C.mocha}>the healthy leader genuinely steps down</T>
      </g>
      <T x={60} y={150} s={13} f={C.latte} o={fa(t, 1.5, 0.4)}>a bare term rise alone can depose a leader</T>
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

// ── 8 · Measured: genuinely no disruption (takeaway) ────────────────────────
export function PrevoteReveal({ t }: StepCtx) {
  const rows = ['every live-leader voter denies the pre-vote', "the node's own term never even rises"];
  return (
    <Svg label="leader_election_log_up_to_date_voting.rs, measured" h={180}>
      {rows.map((r, i) => (
        <g key={r} opacity={fa(t, 0.2 + i * 0.4, 0.4)}>
          <circle cx={30} cy={40 + i * 45} r={5} fill={C.caramel} />
          <T x={48} y={46 + i * 45} s={13} f={C.crema}>{r}</T>
        </g>
      ))}
    </Svg>
  );
}

// ── 9 · The real implementation's own words (connecting) ──────────────────
export function PrevoteDocsReveal({ t }: StepCtx) {
  const rows = ['no term rises unless the pre-vote would win', 'this minimizes disruption on rejoin'];
  return (
    <Svg label="etcd-io/raft, doc.go, quoted" h={180}>
      {rows.map((r, i) => (
        <g key={r} opacity={fa(t, 0.2 + i * 0.4, 0.4)}>
          <circle cx={30} cy={40 + i * 45} r={5} fill={C.caramel} />
          <T x={48} y={46 + i * 45} s={13} f={C.crema}>{r}</T>
        </g>
      ))}
    </Svg>
  );
}

// ── 10 · Recap ───────────────────────────────────────────────────────────────
export function Recap({ t }: StepCtx) {
  const rows = [
    'the fastest real timeout genuinely wins',
    'a behind log loses, fresh term or not',
    'a bare term rise alone can depose a leader',
    'a real pre-vote round genuinely stops that',
  ];
  return (
    <Svg label="recap: a real election, checked against the real rules" h={300}>
      {rows.map((r, i) => (
        <g key={r} opacity={fa(t, 0.2 + i * 0.4, 0.4)}>
          <circle cx={30} cy={40 + i * 55} r={5} fill={C.caramel} />
          <T x={48} y={46 + i * 55} s={13} f={C.crema}>{r}</T>
        </g>
      ))}
    </Svg>
  );
}
