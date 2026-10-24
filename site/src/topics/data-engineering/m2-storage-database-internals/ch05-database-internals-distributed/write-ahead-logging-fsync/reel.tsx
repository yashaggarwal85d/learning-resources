import type { Reel } from '../../../../../reels/types';
import * as S from './scenes';

// Real results on this sandbox's own PostgreSQL cluster (examples.py): a real write's own log
// position measured moving forward by an exact byte count; this sandbox's own chosen way to
// force a write out to disk, read directly rather than assumed; a real page's own defense
// against a torn page measured firing exactly once on its first change after a real checkpoint,
// not again on a second change; a real batch of concurrently committing transactions measured
// needing far fewer real flushes when transactions are allowed to share one. A different
// engine's own defense against the identical torn-page problem, and a real historical failure
// in forcing a write out to disk, are both named and sourced directly rather than reproduced,
// since neither can be run against this sandbox. No literal digits anywhere (the duration
// numbers below are exempt).
const reel: Reel = {
  steps: [
    {
      title: 'Hook: a dirty page is lost the instant the process crashes — what has to happen first?',
      body: (
        <>
          The last topic opened the cache in front of the disk. But a change sitting only in
          that cache disappears completely if the process crashes before it's ever written back.
          What has to happen before that's allowed to be the only copy?
        </>
      ),
      duration: 4.8,
      fig: "a dirty page sitting in the buffer pool is lost the instant the process crashes, unless something records the write durably first. What's that something?",
      Visual: S.Hook,
    },
    {
      title: "Reveal: a real log position, read directly off this sandbox's own cluster",
      body: (
        <>
          A real position in that log, read directly off this sandbox's own cluster before and
          after a real write. It only ever moves forward, and the real gap between the two
          readings is an exact number of bytes, not an estimate.
        </>
      ),
      duration: 4.8,
      fig: "a real write's own position in the log, read directly — what does it actually measure?",
      Visual: S.RevealLsn,
    },
    {
      title: 'Reveal: the write-ahead rule, and a measured trick that bends it without breaking it',
      body: (
        <>
          The rule is simple: the log is flushed before the data is. But flushing is not free,
          and a real batch of commits happening close together, measured directly, needs far
          fewer separate flushes than it has commits — without any of them skipping the rule.
        </>
      ),
      duration: 4.8,
      fig: "the log gets flushed before the data does — but does every single commit really pay for its own separate flush?",
      takeaway: "A real batch of concurrent commits measurably shares far fewer flushes than it has commits, without breaking the log-before-data rule.",
      Visual: S.RevealGroupCommit,
    },
    {
      title: 'Predict: does a torn page mean a write always lands as all-or-nothing?',
      body: (
        <>
          A disk doesn't write a whole page in one physical step; it writes it as several
          smaller physical chunks. If power fails partway through, does the result always come
          out as either the entire page or none of it?
        </>
      ),
      duration: 2.8,
      fig: "a disk write happens in fixed-size physical chunks, not all at once — if power fails mid-write, is the result always either the whole page or none of it?",
      predict: {
        options: [
          { label: 'Yes — a single write either lands or it does not, as one unit' },
          { label: 'No — some of the chunks can land while others do not, leaving a mix of old and new data', correct: true },
        ],
        explain: (
          <>
            No. A page is written as multiple smaller physical chunks, and a failure partway
            through can leave some of those chunks written and others not — a torn page,
            mixing old and new data in a way nothing downstream can safely trust.
          </>
        ),
      },
      Visual: S.PredictTornPage,
    },
    {
      title: "Reveal: a torn page's real defense, measured triggering exactly once per checkpoint",
      body: (
        <>
          A real page, changed twice after a real checkpoint. Measured directly, its full
          defense against being torn fires exactly once, on the first change. The second change
          to that same page doesn't need it fired again.
        </>
      ),
      duration: 4.8,
      fig: "a real page, changed twice after a real checkpoint — does the full defense against a torn page fire both times, or just the first?",
      takeaway: "A real page's first change after a checkpoint triggers its own full defense once, not again on a second change.",
      Visual: S.RevealFullPageWrite,
    },
    {
      title: 'Reveal: three real ways to force a write out, and which one this sandbox actually uses',
      body: (
        <>
          Three real, named ways exist to force a write out to disk rather than let it sit in a
          cache somewhere. Read directly rather than assumed, this sandbox's own cluster really
          does use one specific one of them.
        </>
      ),
      duration: 4.8,
      fig: "this sandbox's own cluster, read directly — which of three real system calls does it actually use to force the log out to disk?",
      takeaway: "This sandbox's own cluster really uses one specific, named way to force a write out, confirmed directly rather than assumed.",
      Visual: S.RevealSyncMethod,
    },
    {
      title: "Reveal: a different engine's own defense against the identical torn-page problem",
      body: (
        <>
          A different engine, the identical torn-page problem, named directly from its own
          documentation rather than run here. Does it defend against it the same way, or
          differently?
        </>
      ),
      duration: 4.8,
      fig: "a different engine's own documentation, on the identical torn-page problem — does it solve it the same way, or differently?",
      Visual: S.RevealInnodbDoublewrite,
    },
    {
      title: 'Reveal: a real, documented lesson a failed force-out taught the hard way',
      body: (
        <>
          A real, historical failure, named directly from the record rather than reproduced
          here: a failed attempt to force data out to disk that silently lied about having
          failed at all. What's the only response that's safe once that's discovered?
        </>
      ),
      duration: 4.8,
      fig: "in a real, documented incident, a failed attempt to force data out to disk turned out to be lying about having failed at all — what's the only safe response once that's discovered?",
      Visual: S.RevealFsyncgate,
    },
    {
      title: 'Recap',
      body: (
        <>
          A real log position that only ever moves forward. A measured group-commit saving that
          never breaks the log-before-data rule. A torn page's own defense, measured firing once
          per checkpoint. A chosen way to force a write out, confirmed directly. A different
          engine's different answer to the identical problem. And the lesson that a failed
          force-out is never safely retried.
        </>
      ),
      duration: 4.8,
      fig: "a real log position, a measured group-commit saving, a torn-page defense fired once, a chosen sync method, a different engine's different answer, and the crash-don't-retry lesson",
      Visual: S.Recap,
    },
    {
      title: 'Prove it',
      body: (
        <>
          A monitoring script sees a cluster's own force-out call fail just once. It logs a
          warning and lets the process keep running rather than crashing it, reasoning that one
          failure doesn't mean much. Is that response safe, and why or why not?
        </>
      ),
      duration: 2.8,
      fig: "a monitoring script sees a force-out call fail once, logs a warning, and lets the process keep running rather than crashing it — is that response safe?",
      predict: {
        options: [
          { label: 'Yes — logging a warning and continuing is reasonable for one isolated failure' },
          { label: "No — once a force-out call can fail without the caller finding out reliably, only a crash and a full replay can be trusted", correct: true },
        ],
        explain: (
          <>
            No, that response isn't safe. The entire lesson of a failed force-out is that the
            caller can no longer trust what it thinks it knows about which writes actually made
            it to disk. Logging a warning and continuing keeps running on data that might already
            be wrong — crashing and replaying from the last known-good checkpoint is the only
            response that doesn't.
          </>
        ),
      },
      Visual: S.ProveIt,
    },
  ],
};

export default reel;
