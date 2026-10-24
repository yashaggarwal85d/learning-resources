import type { Reel } from '../../../../../reels/types';
import * as S from './scenes';

// Redo repeats history for everyone first, winners and losers alike. A
// fuzzy checkpoint's own dirty-page bound lets it skip what's already
// durable without skipping anything it needs. And a compensation log
// record bounds undo's own work across repeated failures, which is
// exactly what makes steal and no-force, the high-performance buffer
// policy, safe.
const reel: Reel = {
  steps: [
    {
      title: "Build a real log with two transactions: one commits, one never does. Run only the redo pass over it, before any undo. Does redo apply the committed transaction's own updates, the uncommitted one's, or both?",
      body: (
        <>
          Two transactions' updates, one committed, one not, redo about to run.
        </>
      ),
      duration: 2.8,
      predict: {
        options: [
          { label: "Only the committed transaction's own updates" },
          { label: "Only the uncommitted one's, since it needs undoing anyway" },
          { label: "Both, genuinely; redo doesn't know or care about commit status yet", correct: true },
        ],
        explain: (
          <>
            Both, genuinely. Redo doesn't tell winners from losers at all.
          </>
        ),
      },
      Visual: S.RedoScopePredict,
    },
    {
      title: "Measured: redo genuinely reapplied the uncommitted transaction's own updates too, exactly like the committed one's; nothing about redo itself tells them apart",
      body: (
        <>
          The real, measured redo, both transactions' pages changed.
        </>
      ),
      duration: 3.0,
      takeaway: "Redo repeats history for everyone first; only the undo pass that follows tells a winner from a loser.",
      Visual: S.RedoScopeReveal,
    },
    {
      title: "A checkpoint recorded that one page was already safely on disk, with nothing else dirty at that moment. Does redo, starting from that checkpoint's own bound instead of the very start of the log, still reach the correct final state?",
      body: (
        <>
          A checkpoint, one page already durable, redo's own starting point in question.
        </>
      ),
      duration: 2.8,
      predict: {
        options: [
          { label: "No, skipping older records risks missing something the checkpoint got wrong" },
          { label: "Yes, genuinely; the checkpoint's own bound is exactly how far back redo needs to look", correct: true },
          { label: "Only if no transaction was active at checkpoint time" },
        ],
        explain: (
          <>
            Yes, genuinely. That bound is exactly how far back redo needs to look.
          </>
        ),
      },
      Visual: S.CheckpointPredict,
    },
    {
      title: "Measured: redo starting from the checkpoint's own bound visited genuinely fewer log records, and reached the exact same final state as a full scan from the start",
      body: (
        <>
          The real, measured scan, fewer records, identical result.
        </>
      ),
      duration: 3.0,
      takeaway: "A fuzzy checkpoint's own dirty-page bound lets redo skip what's already durable, without skipping anything it needs.",
      Visual: S.CheckpointReveal,
    },
    {
      title: "Undo the uncommitted transaction's own last update, writing a compensation log record for it. Now crash again, right there, mid-undo. On the next recovery, does undo repeat that same step, skip it, or resume exactly where it left off?",
      body: (
        <>
          One update undone, one CLR written, a second crash mid-undo.
        </>
      ),
      duration: 2.8,
      predict: {
        options: [
          { label: "It repeats the step, undoing the same update a second time harmlessly" },
          { label: "It resumes exactly where it left off, thanks to the CLR already in the log", correct: true },
          { label: "It skips ahead too far, missing an earlier update that still needs undoing" },
        ],
        explain: (
          <>
            It resumes exactly there. The CLR already in the log says where.
          </>
        ),
      },
      Visual: S.ClrPredict,
    },
    {
      title: "Measured: the second recovery resumed undo exactly where the first one left off; the already-undone update got exactly one compensation log record, total, across both attempts",
      body: (
        <>
          The real, measured resumption, one CLR per update, no more.
        </>
      ),
      duration: 3.0,
      takeaway: "A compensation log record bounds undo's own work across repeated failures: nothing already undone gets undone twice.",
      Visual: S.ClrReveal,
    },
    {
      title: "The original ARIES paper names this kind of log record directly: a compensation log record, or CLR. Once ARIES writes a CLR undoing some update, is that CLR's own effect ever itself undone later?",
      body: (
        <>
          The paper's own words on CLRs, shown directly.
        </>
      ),
      duration: 2.8,
      predict: {
        options: [
          { label: "Yes, if the transaction that wrote it is itself later rolled back again" },
          { label: "No, never; a CLR is a redo-only log record", correct: true },
          { label: "Only during a third or later recovery attempt" },
        ],
        explain: (
          <>
            Never. A CLR is a redo-only log record.
          </>
        ),
      },
      Visual: S.PaperClrPredict,
    },
    {
      title: "The paper's own words: in ARIES, a CLR's own update is never undone, and hence CLRs are viewed as redo-only log records",
      body: (
        <>
          The paper's own words, shown directly.
        </>
      ),
      duration: 2.8,
      Visual: S.PaperClrReveal,
    },
    {
      title: "The same paper names the buffer policy this topic's own recovery assumes: steal, allowing an uncommitted page to be written back early, and no-force, allowing a committed one to stay unwritten. Redo and undo together are exactly why that combination is safe",
      body: (
        <>
          Steal and no-force, named directly, next to this topic's own analysis, redo, and undo.
        </>
      ),
      duration: 3.0,
      takeaway: "Steal and no-force are safe because redo and undo together can fix up a page however it was written back.",
      Visual: S.StealNoForceReveal,
    },
    {
      title: 'Recap: who redoes, who undoes, and why that makes steal and no-force safe',
      body: (
        <>
          Redo repeats history for everyone first, winners and losers alike. A fuzzy checkpoint's own dirty-page bound lets it skip what's already durable without skipping anything it needs. And a compensation log record bounds undo's own work across repeated failures, so nothing already undone gets undone twice — which is exactly what makes steal and no-force, the high-performance buffer policy, safe. A simpler no-steal, redo-only design, typical of LSM engines, gives up that freedom in exchange for never needing an undo pass at all.
        </>
      ),
      duration: 3.0,
      Visual: S.Recap,
    },
  ],
};

export default reel;
