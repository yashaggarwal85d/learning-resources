import type { Reel } from '../../../../../reels/types';
import * as S from './scenes';

// A crate, not a module, is the real unit cargo rebuilds; a
// dependency's own real boundary decides what a change forces to
// recompile, and a lint declared once is enforced the identical way
// for every member that inherits it.
const reel: Reel = {
  steps: [
    {
      title: "A real two-crate workspace is built once, then only consumer_crate's own source changes, and the workspace is rebuilt. Does core_crate's own compiled artifact change too?",
      body: (
        <>
          One real workspace, one real change.
        </>
      ),
      duration: 2.8,
      predict: {
        options: [
          { label: 'Yes, cargo always rebuilds the whole workspace' },
          { label: "No, genuinely; only consumer_crate's own artifact changes", correct: true },
          { label: 'Only if the lints table also changed' },
        ],
        explain: (
          <>
            No. Only consumer_crate genuinely rebuilds.
          </>
        ),
      },
      Visual: S.ConsumerOnlyPredict,
    },
    {
      title: "Measured: after a consumer-only change, core_crate's own real compiled artifact has the identical real modification time it had before; only consumer_crate's own artifact genuinely changed",
      body: (
        <>
          The real, measured artifacts, compared.
        </>
      ),
      duration: 3.0,
      Visual: S.ConsumerOnlyReveal,
    },
    {
      title: "The identical workspace now has core_crate's own source changed instead. Does consumer_crate have to rebuild too, even though its own source never changed?",
      body: (
        <>
          The same workspace, the other crate changed.
        </>
      ),
      duration: 2.8,
      predict: {
        options: [
          { label: 'No, only core_crate needs to rebuild' },
          { label: 'Yes, genuinely; consumer_crate depends on it', correct: true },
          { label: 'Only if consumer_crate is rebuilt by hand' },
        ],
        explain: (
          <>
            Yes. The dependency forces it, too.
          </>
        ),
      },
      Visual: S.CoreChangePredict,
    },
    {
      title: "Measured: after a real core_crate change, both core_crate's own artifact and consumer_crate's own artifact genuinely get a new, later real modification time",
      body: (
        <>
          The real, measured artifacts, both newer.
        </>
      ),
      duration: 3.0,
      takeaway: "A dependency's own real boundary is exactly where a rebuild's own real cost actually propagates.",
      Visual: S.CoreChangeReveal,
    },
    {
      title: "The workspace's own workspace.lints table forbids unsafe code for every member crate. A real, deliberately unsafe block is added to consumer_crate. Does the inherited lint genuinely catch it?",
      body: (
        <>
          A real violation, inside one member crate.
        </>
      ),
      duration: 2.8,
      predict: {
        options: [
          { label: 'No, lints only warn; they never block a build' },
          { label: 'Yes, genuinely; the real build fails on it', correct: true },
          { label: 'Only if cargo clippy is run separately' },
        ],
        explain: (
          <>
            Yes. The real build genuinely fails.
          </>
        ),
      },
      Visual: S.LintEnforcedPredict,
    },
    {
      title: "Measured: the real build genuinely fails the instant the real unsafe block exists in consumer_crate, and genuinely succeeds again the moment it is removed, with no change to the workspace's own lint declaration at all",
      body: (
        <>
          The real build, checked both ways.
        </>
      ),
      duration: 3.0,
      takeaway: 'A lint declared once, inherited by every member, is enforced the identical way everywhere.',
      Visual: S.LintEnforcedReveal,
    },
    {
      title: "The Rust Reference and the Cargo Book state these rules directly: a crate is a real unit of compilation and linking; a workspace's own dependencies and lints tables are where a shared dependency or lint configuration is defined once, to be inherited by every member. Does this topic's own three measured boundaries model exactly the rules both sources describe?",
      body: (
        <>
          Both sources' own words on these rules.
        </>
      ),
      duration: 2.8,
      takeaway: 'Drawing a boundary along real ownership, not a module, decides what a rebuild or a violation actually touches.',
      Visual: S.DocsReveal,
    },
    {
      title: "Recap: a workspace's own real boundaries",
      body: (
        <>
          A crate, not a module, is the real unit cargo rebuilds; a dependency's own real boundary decides what a change forces to recompile, and a lint declared once is enforced the identical way for every member that inherits it.
        </>
      ),
      duration: 3.0,
      Visual: S.Recap,
    },
  ],
};

export default reel;
