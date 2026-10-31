import type { Reel } from '../../../../../reels/types';
import * as S from './scenes';

// Every claim here is verified against Iceberg's own specification (Commit Conflict
// Resolution and Retry: append vs replace vs delete validation rules, and "writers can
// select what to validate") and against docs.delta.io's open-source concurrency-control
// page (the three-stage read/write/validate-and-commit protocol and its five named
// conflict exceptions) — and against a real two-writer race run in this sandbox: a real
// append-vs-append conflict whose loser revalidates and retries to success, and a real
// delete-vs-delete conflict on the same file whose loser's retry fails for good. The
// local-filesystem stand-in for a catalog is disclosed explicitly; what transfers is the
// validate-before-retry shape, not a claim that local disk is a real catalog.
const reel: Reel = {
  steps: [
    {
      title: 'Hook',
      body: (
        <>
          An atomic pointer move only works if exactly one writer wins it when two race for
          the same move. This topic is that race itself, reproduced for real: one commits,
          one is validated, retried, and either succeeds or correctly fails.
        </>
      ),
      duration: 4.6,
      fig: 'exactly one writer wins the swap -- this topic is what the loser does next.',
      Visual: S.Hook,
    },
    {
      title: 'Predict: when a writer loses the race, what should it do next?',
      body: (
        <>
          A writer's commit is rejected because the base snapshot it staged against is no
          longer current. What should it do next?
        </>
      ),
      duration: 3.6,
      fig: 'a writer loses the commit race -- always retry, or does it depend on the write?',
      predict: {
        options: [
          { label: 'Always retry against the new current version' },
          { label: 'It depends on what the write actually touched', correct: true },
        ],
        explain: (
          <>
            The conditions required for a write to successfully commit determine the
            isolation level, and writers can select what to validate — so what's safe to
            retry depends entirely on the operation.
          </>
        ),
      },
      Visual: S.PredictRetryRule,
    },
    {
      title: 'Reveal: writers stage first, validate only at commit',
      body: (
        <>
          Delta's own protocol names three stages: read the latest version, stage all
          changes by writing new files, then validate and commit. Conflicts are caught only
          at that last step — never while staging.
        </>
      ),
      duration: 4.6,
      fig: 'read, write, then validate-and-commit -- conflicts are caught only at the last step.',
      Visual: S.RevealThreeStages,
    },
    {
      title: "Reveal: the retry rule depends on the operation",
      body: (
        <>
          Iceberg's spec is explicit: an append operation "has no requirements and can
          always be applied." A delete or replace operation "must verify that specific
          files to delete are still in the table."
        </>
      ),
      duration: 4.8,
      fig: "an append: nothing to re-check. a delete: must verify its files are still there.",
      takeaway: "What's safe to retry isn't luck — it's written into the operation's own validation rule.",
      Visual: S.RevealRetryDependsOnOp,
    },
    {
      title: 'Predict: can a losing append always retry successfully?',
      body: (
        <>
          Two writers append different new files from the same base snapshot. One wins the
          commit. Can the loser always retry successfully?
        </>
      ),
      duration: 3.6,
      fig: 'two writers append disjoint files from the same base -- can the loser always retry?',
      predict: {
        options: [
          { label: 'No — the second append fails once the base has changed' },
          { label: 'Yes — an append has no requirements, so it just restages against the new base', correct: true },
        ],
        explain: (
          <>
            An append never conflicts with another append in Iceberg's own rule — there is
            nothing to re-check, so the loser simply restages its same new file against the
            new current version and retries.
          </>
        ),
      },
      Visual: S.PredictAppendRetry,
    },
    {
      title: 'Reveal: reproduced for real — append vs append, retry succeeds',
      body: (
        <>
          Two real writers race for the same commit slot from the same base, each appending
          a different new file. Writer A wins. Writer B loses, revalidates — an append has
          nothing to re-check — restages against the new base, and retries to a real, clean
          success.
        </>
      ),
      duration: 4.8,
      fig: 'writer A wins version 1; writer B restages and retries as version 2 -- real success.',
      Visual: S.RevealAppendRetrySucceeds,
    },
    {
      title: 'Reveal: reproduced for real — delete vs delete, retry fails for good',
      body: (
        <>
          Two real writers both try to remove the exact same file from the same base. One
          wins. The other revalidates and finds the file it wanted to delete is already
          gone from the new base — its retry fails permanently, by design.
        </>
      ),
      duration: 4.8,
      fig: 'both writers target the same file -- the loser finds it already gone, and fails for good.',
      takeaway: "A delete that can't verify its own files are still there must never retry blindly.",
      Visual: S.RevealDeleteRetryFails,
    },
    {
      title: "Reveal: Delta names the identical distinction as typed exceptions",
      body: (
        <>
          docs.delta.io gives this exact split real names: a `ConcurrentAppendException`
          when a concurrent write added files you read, and a `ConcurrentDeleteReadException`
          or `ConcurrentDeleteDeleteException` when a concurrent write touched files you also
          read or deleted.
        </>
      ),
      duration: 4.8,
      fig: "Delta's own exception names: one per validation condition Iceberg's spec describes in prose.",
      Visual: S.RevealDeltaTaxonomy,
    },
    {
      title: 'Reveal: isolation is a choice, not a given',
      body: (
        <>
          Iceberg says it plainly: the conditions required by a write to successfully
          commit determine the isolation level, and writers can select what to validate.
          Validate less, and more writers can succeed concurrently; validate more, and
          fewer can.
        </>
      ),
      duration: 4.8,
      fig: 'what a writer chooses to validate at commit time is the isolation level, not a fixed property of storage.',
      takeaway: 'Isolation level is a validation choice a writer makes, not something the table format hands you.',
      Visual: S.RevealIsolationIsAChoice,
    },
    {
      title: 'Recap',
      body: (
        <>
          Writers stage first and validate only at commit. An append can always revalidate
          and retry; a delete that can't confirm its own files are still there must fail
          for good. What you choose to validate at commit is the isolation level itself.
        </>
      ),
      duration: 4.8,
      fig: 'stage first, validate at commit -- what you validate is the isolation level itself.',
      Visual: S.Recap,
    },
  ],
};

export default reel;
