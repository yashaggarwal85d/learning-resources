import type { Reel } from '../../../../../reels/types';
import * as S from './scenes';

// An entry is only genuinely committed once it is replicated to a real
// majority under the leader's own current term; conflict repair genuinely
// backs a divergent follower up to the real common prefix, never silently
// corrupting an index.
const reel: Reel = {
  steps: [
    {
      title: "A follower's own log genuinely diverges from the leader's at one point. The leader retries AppendEntries, backing up one entry at a time. Does it genuinely find the real common prefix, and overwrite only the divergent suffix?",
      body: (
        <>
          A leader log, a genuinely divergent follower.
        </>
      ),
      duration: 2.8,
      predict: {
        options: [
          { label: 'Yes, genuinely' },
          { label: 'No, a human has to point out where they diverge' },
          { label: "Only if the divergent entry is the very last one" },
        ],
        explain: (
          <>
            Yes. It genuinely finds the real common prefix.
          </>
        ),
      },
      Visual: S.RepairPredict,
    },
    {
      title: "Measured: the real conflict-repair pass genuinely finds the common prefix and overwrites the follower's divergent suffix exactly",
      body: (
        <>
          The real, measured repair, with no index silently corrupted.
        </>
      ),
      duration: 3.0,
      Visual: S.RepairReveal,
    },
    {
      title: 'Now a single entry from a previous term already sits on a real majority of the cluster. Does the leader genuinely count it as committed, just from that real majority alone?',
      body: (
        <>
          A previous-term entry, already on a majority.
        </>
      ),
      duration: 2.8,
      predict: {
        options: [
          { label: 'Yes, a real majority is a real majority' },
          { label: 'No, the leader genuinely refuses to count it alone', correct: true },
          { label: "Only if it's been there for more than one term" },
        ],
        explain: (
          <>
            No. A real majority alone was genuinely not enough.
          </>
        ),
      },
      Visual: S.PreviousTermPredict,
    },
    {
      title: "Measured: genuinely not committed. A previous-term entry's own real majority alone is genuinely not enough",
      body: (
        <>
          The real, measured refusal, on an entry already held by a real majority.
        </>
      ),
      duration: 3.0,
      takeaway: 'A real majority alone is not enough for a previous-term entry; this is the exact hazard the rule prevents.',
      Visual: S.PreviousTermReveal,
    },
    {
      title: "Now the leader also replicates one real entry from its own current term to the identical majority. Does that entry genuinely commit, and does the earlier entry genuinely commit along with it?",
      body: (
        <>
          A current-term entry, the identical majority.
        </>
      ),
      duration: 2.8,
      predict: {
        options: [
          { label: 'Only the new entry commits' },
          { label: 'Both commit, genuinely, together', correct: true },
          { label: "Neither commits without a human's sign-off" },
        ],
        explain: (
          <>
            Both, genuinely. One real commitment reaches backward too.
          </>
        ),
      },
      Visual: S.CurrentTermPredict,
    },
    {
      title: 'Measured: the current-term entry genuinely commits, and the earlier entry genuinely commits indirectly right along with it',
      body: (
        <>
          The real, measured commitment, reaching the earlier entry too.
        </>
      ),
      duration: 3.0,
      takeaway: "One real commitment from the leader's own current term reaches backward, committing every earlier entry with it.",
      Visual: S.CurrentTermReveal,
    },
    {
      title: "The Raft paper itself states this exact rule directly, in its own words: only entries from the leader's own current term are ever committed by counting replicas. Does this topic's own code measure exactly that rule?",
      body: (
        <>
          The paper's own words on this exact rule, shown directly.
        </>
      ),
      duration: 2.8,
      Visual: S.PaperRuleReveal,
    },
    {
      title: "A real, widely used Rust Raft implementation keeps the consensus log genuinely separate from the application's own state machine, through its own pluggable storage traits. Does separating them this way let consensus be tested against a trivial state machine first, exactly as the syllabus names?",
      body: (
        <>
          A real implementation's own words on keeping these separate, shown directly.
        </>
      ),
      duration: 2.8,
      Visual: S.SeparationReveal,
    },
    {
      title: 'Measured: conflict repair, the previous-term refusal, and the current-term commitment are all genuinely one coherent set of rules, run on one real log and one real follower',
      body: (
        <>
          All three real, measured results, side by side.
        </>
      ),
      duration: 3.0,
      takeaway: "A handful of plain comparisons on index, term, and replica count are the whole real safety net.",
      Visual: S.CoherenceReveal,
    },
    {
      title: 'Recap: a real log, checked against the real rules',
      body: (
        <>
          An entry is only genuinely committed once it is replicated to a real majority under the leader's own current term; conflict repair genuinely backs a divergent follower up to the real common prefix, never silently corrupting an index.
        </>
      ),
      duration: 3.0,
      Visual: S.Recap,
    },
  ],
};

export default reel;
