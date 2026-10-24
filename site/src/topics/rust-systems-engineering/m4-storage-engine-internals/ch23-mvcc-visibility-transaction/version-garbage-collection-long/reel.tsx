import type { Reel } from '../../../../../reels/types';
import * as S from './scenes';

// A version becomes reclaimable only once no open snapshot could still
// need it, so one long-running reader genuinely blocks every reclaim
// newer than it, not just what it reads, turning into a real,
// measurable storage-growth problem that ending the transaction, not
// a smarter VACUUM, is what actually fixes.
const reel: Reel = {
  steps: [
    {
      title: 'A reader opens a snapshot, then a row gets updated four more times while that reader stays open. Does any of those four now-dead versions ever become reclaimable while the reader is still open?',
      body: (
        <>
          One open reader, four further updates.
        </>
      ),
      duration: 2.8,
      predict: {
        options: [
          { label: 'Yes, the ones the reader itself never reads' },
          { label: 'No, not one of them, for as long as the reader stays open', correct: true },
          { label: "Only the single version the reader doesn't actually use" },
        ],
        explain: (
          <>
            Not one of them. The reader blocks every reclaim newer than it.
          </>
        ),
      },
      Visual: S.BlockedPredict,
    },
    {
      title: 'Measured: not one of the four, for as long as that reader stays open',
      body: (
        <>
          A long-lived reader blocks reclaim of everything newer than it, not only what it reads.
        </>
      ),
      duration: 3.0,
      Visual: S.BlockedReveal,
    },
    {
      title: 'That same reader now closes instead, on the identical workload. Do those same four now-dead versions become reclaimable?',
      body: (
        <>
          The reader closing, the identical four updates already applied.
        </>
      ),
      duration: 2.8,
      predict: {
        options: [
          { label: 'No, only the version the reader itself read' },
          { label: 'Yes, genuinely, all of them', correct: true },
          { label: 'Only if a fresh VACUUM pass is run twice' },
        ],
        explain: (
          <>
            All of them. Closing the reader frees every one.
          </>
        ),
      },
      Visual: S.FreedPredict,
    },
    {
      title: 'Measured: yes, genuinely; closing the reader freed every one of its previously-pinned dead versions',
      body: (
        <>
          The real, measured result, the dead versions reclaimed.
        </>
      ),
      duration: 3.0,
      takeaway: 'A version becomes reclaimable once no open snapshot could still need it; closing a reader removes exactly that need.',
      Visual: S.FreedReveal,
    },
    {
      title: 'Run the identical workload twice: once with that reader staying open the whole time, once with it closing early. Does the long-lived run genuinely retain more versions than the short-lived one?',
      body: (
        <>
          The identical workload, two different reader lifetimes.
        </>
      ),
      duration: 2.8,
      predict: {
        options: [
          { label: 'No, both runs end up retaining the same count' },
          { label: 'Yes, genuinely, the long-lived run retains more', correct: true },
          { label: 'Only if the reader actually reads every version along the way' },
        ],
        explain: (
          <>
            Yes. The long-lived run retains genuinely more.
          </>
        ),
      },
      Visual: S.ComparePredict,
    },
    {
      title: 'Measured: the long-lived run genuinely retained far more versions than the short-lived run, on the identical workload',
      body: (
        <>
          The real, measured counts, compared directly.
        </>
      ),
      duration: 3.0,
      takeaway: 'One long-running reader turns into a real, measurable storage-growth problem, on a workload that would otherwise stay small.',
      Visual: S.CompareReveal,
    },
    {
      title: "PostgreSQL's own documentation states this coupling directly. Does it name finishing a long-running open transaction as something that frees up space VACUUM alone cannot?",
      body: (
        <>
          PostgreSQL's own words on long-running transactions, shown directly.
        </>
      ),
      duration: 2.8,
      predict: {
        options: [
          { label: 'No, VACUUM alone handles it regardless' },
          { label: 'Yes, genuinely; it tells administrators to end those transactions directly', correct: true },
          { label: 'Only for transactions older than a fixed, hard-coded limit' },
        ],
        explain: (
          <>
            Yes. Ending the transaction is the real fix.
          </>
        ),
      },
      Visual: S.EndTransactionsPredict,
    },
    {
      title: "Measured, in PostgreSQL's own words: end long-running open transactions directly, since VACUUM alone can't reclaim past them",
      body: (
        <>
          PostgreSQL's own words, shown directly.
        </>
      ),
      duration: 3.0,
      takeaway: "The real fix for this isn't a smarter VACUUM; it's ending the long-running transaction that's pinning the horizon.",
      Visual: S.EndTransactionsReveal,
    },
    {
      title: "PostgreSQL's own documentation also names exactly what that horizon is made of: what does a backend's own xmin horizon, visible in its own system view, actually represent?",
      body: (
        <>
          PostgreSQL's own words on the xmin horizon, shown directly.
        </>
      ),
      duration: 2.8,
      Visual: S.HorizonReveal,
    },
    {
      title: 'Recap: what pins a version, and what actually frees it',
      body: (
        <>
          A version becomes reclaimable only once no open snapshot could still need it, so one long-running reader genuinely blocks every reclaim newer than it, not just what it reads, turning into a real, measurable storage-growth problem that ending the transaction, not a smarter VACUUM, is what actually fixes.
        </>
      ),
      duration: 3.0,
      Visual: S.Recap,
    },
  ],
};

export default reel;
