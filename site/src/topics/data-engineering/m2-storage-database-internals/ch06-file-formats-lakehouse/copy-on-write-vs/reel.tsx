import type { Reel } from '../../../../../reels/types';
import * as S from './scenes';

// Every claim here is verified against Hudi's own table-types documentation (copy-on-write
// rewrites base files with no log files; merge-on-read writes log files merged dynamically at
// query time; periodic compaction reconciles the log back into a new base file), Delta's own
// deletion-vectors documentation (a default row delete rewrites the whole Parquet file; deletion
// vectors mark rows removed without rewriting; OPTIMIZE / REORG TABLE converts that debt back),
// and Iceberg's own spec (deletion vectors as a per-file bitmap, more efficient than position
// delete files) — and against a real measured 1%-row update run twice in this sandbox: once under
// copy-on-write (every touched file rewritten, real millisecond write cost) and once under
// merge-on-read (a small log file, real near-free write cost, and a real merge-prep read cost that
// grows round over round as logs accumulate and drops back to near zero after real compaction).
const reel: Reel = {
  steps: [
    {
      title: 'Hook',
      body: (
        <>
          Every commit so far appended or overwrote whole files. This topic is what a commit does
          when it only needs to change some rows inside a file: copy-on-write's full rewrite
          versus merge-on-read's delete/log file, both measured on the identical 1%-update
          workload.
        </>
      ),
      duration: 4.8,
      fig: 'whole-file commits only get you so far -- this topic is a commit touching some rows, not all.',
      Visual: S.Hook,
    },
    {
      title: "Predict: a 1% row update, scattered across every file — what's the cheapest way to commit it?",
      body: (
        <>
          A 1% row update is scattered across every data file in the table. What's the cheapest
          way to actually commit that change?
        </>
      ),
      duration: 3.8,
      fig: '1% of rows change, scattered across every file -- rewrite the files, or log the change?',
      predict: {
        options: [
          { label: 'Rewrite every file that contains even one touched row, completely' },
          { label: "There isn't one answer — both are real strategies with different costs", correct: true },
        ],
        explain: (
          <>
            Both are real, named strategies every lakehouse format supports: copy-on-write and
            merge-on-read. Neither is universally cheaper — they just move the cost to a
            different place.
          </>
        ),
      },
      Visual: S.PredictCheapestCommit,
    },
    {
      title: 'Reveal: copy-on-write rewrites every touched file, whole',
      body: (
        <>
          Hudi's own docs: "the Copy-on-Write (CoW) table type... In this mode, record updates or
          deletes trigger the creation of new base files in a file group and there are no log
          files written."
        </>
      ),
      duration: 4.8,
      fig: 'a touched file gets a brand new version, in full -- no log files exist at all.',
      Visual: S.RevealCowRewritesWhole,
    },
    {
      title: "Reveal: reproduced for real — copy-on-write's real write cost",
      body: (
        <>
          A real 1% row update, run on local disk: every one of 12 data files that holds even one
          touched row gets rewritten completely, at a real, measured millisecond cost.
        </>
      ),
      duration: 4.8,
      fig: 'a real 1% update, real file rewrites, a real measured write time -- for one percent of rows.',
      takeaway: 'Copy-on-write pays for a change once, at write time, no matter how small the change was.',
      Visual: S.RevealCowRealWriteCost,
    },
    {
      title: "Predict: does copy-on-write's expensive write buy anything back at read time?",
      body: (
        <>
          Copy-on-write pays an expensive price to rewrite files at write time. Does that
          investment pay off when you actually read the table?
        </>
      ),
      duration: 3.8,
      fig: "copy-on-write pays at write time -- does that buy cheaper reads, or is it the same cost either way?",
      predict: {
        options: [
          { label: "No — reading costs the same whether or not the file was recently rewritten" },
          { label: 'Yes — reads never merge anything, since the base files are already current', correct: true },
        ],
        explain: (
          <>
            Because every base file is always fully current, a copy-on-write read is just reading
            the base files — there is never a merge step to pay for.
          </>
        ),
      },
      Visual: S.PredictCowReadPayoff,
    },
    {
      title: 'Reveal: merge-on-read defers the change to a small log file',
      body: (
        <>
          Hudi: "Data updates and deletes are written to log files... and these changes in log
          files are then merged dynamically with base files during query execution." Delta's
          deletion vectors do the identical thing by a different name.
        </>
      ),
      duration: 4.8,
      fig: 'the change goes to a small log file instead -- merged with the base only at query time.',
      Visual: S.RevealMorDefersToLog,
    },
    {
      title: 'Reveal: reproduced for real — a near-free write, and a read cost that grows',
      body: (
        <>
          The same real 1% update under merge-on-read: the log write costs a small fraction of
          copy-on-write's rewrite. But the real cost of opening and parsing every accumulated log
          file grows, measurably, round after round.
        </>
      ),
      duration: 4.8,
      fig: 'a real near-free write; a real read cost that measurably grows as logs pile up, round over round.',
      takeaway: 'Merge-on-read trades an expensive write for a read cost that keeps growing until someone pays it off.',
      Visual: S.RevealMorRealCostGrows,
    },
    {
      title: 'Reveal: reproduced for real — compaction resets the cost',
      body: (
        <>
          Delta names this directly: "An OPTIMIZE command is run on the table" and "REORG TABLE
          ... APPLY (PURGE) rewrites all data files containing records with modifications recorded
          using deletion vectors." Run for real, folding five logs into the base files drops the
          read cost right back toward zero.
        </>
      ),
      duration: 4.8,
      fig: 'fold every log into the base files once, discard them -- the real read cost drops back to near zero.',
      Visual: S.RevealCompactionResetsCost,
    },
    {
      title: 'Reveal: the same choice, under every name',
      body: (
        <>
          Iceberg's position delete files and deletion vectors, Delta's deletion vectors, Hudi's
          copy-on-write and merge-on-read table types — three formats, the identical trade between
          paying at write time or deferring to read time.
        </>
      ),
      duration: 4.8,
      fig: "Iceberg, Delta, and Hudi: different words for the identical write-now-or-pay-later choice.",
      takeaway: 'Every lakehouse format faces this exact trade — they just give it different names.',
      Visual: S.RevealSameChoiceEveryFormat,
    },
    {
      title: 'Recap',
      body: (
        <>
          Copy-on-write pays once, at write time, for predictable, cheap reads forever after.
          Merge-on-read defers that cost to read time, where it keeps growing until compaction
          pays it off. The choice comes down to update rate, how scattered the updates are, and
          how fresh a read needs to be.
        </>
      ),
      duration: 4.8,
      fig: 'pay for a change at write time, or defer it to read time and pay compaction later.',
      Visual: S.Recap,
    },
  ],
};

export default reel;
