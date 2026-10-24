import type { Reel } from '../../../../../reels/types';
import * as S from './scenes';

// A format check catches what a human eye would call messy; a denied
// lint catches a known, named mistake the instant it appears; a test
// catches a real behavior regression neither one can see; none of the
// three substitutes for either of the other two.
const reel: Reel = {
  steps: [
    {
      title: 'A real source file in this workspace is rewritten with one line indented four extra spaces, a change cargo build compiles without complaint. Does cargo fmt --check genuinely catch it?',
      body: (
        <>
          One real file, one real extra indent.
        </>
      ),
      duration: 2.8,
      predict: {
        options: [
          { label: 'No, formatting is only a style suggestion' },
          { label: 'Yes, genuinely; the real check fails on it', correct: true },
          { label: 'Only if cargo fmt is run without --check' },
        ],
        explain: (
          <>
            Yes. The real check genuinely fails.
          </>
        ),
      },
      Visual: S.FmtPredict,
    },
    {
      title: 'Measured: cargo fmt --check genuinely fails the instant the real indentation violation exists, and genuinely passes again the moment it is reverted, with cargo build never once complaining either way',
      body: (
        <>
          The real check, compared to the real build.
        </>
      ),
      duration: 3.0,
      Visual: S.FmtReveal,
    },
    {
      title: "The workspace's own lints.clippy table denies needless_return for every member crate. A real, deliberately redundant return keyword is added to one function. Does the inherited lint genuinely catch it?",
      body: (
        <>
          A real, named mistake, inside one function.
        </>
      ),
      duration: 2.8,
      predict: {
        options: [
          { label: 'No, Clippy only warns by default' },
          { label: 'Yes, genuinely; the real build fails on it', correct: true },
          { label: 'Only if an extra flag is passed by hand' },
        ],
        explain: (
          <>
            Yes. The denied lint genuinely catches it.
          </>
        ),
      },
      Visual: S.ClippyPredict,
    },
    {
      title: "Measured: cargo clippy genuinely fails, naming the denied lint directly, the instant the real violation exists, and genuinely passes again the moment it is reverted, with the workspace's own lint declaration never touched",
      body: (
        <>
          The real build, checked both ways.
        </>
      ),
      duration: 3.0,
      takeaway: "A lint denied once in the workspace's own manifest is enforced the same way on every real violation.",
      Visual: S.ClippyReveal,
    },
    {
      title: "A real function's own logic is replaced with one that always returns the same, wrong answer; its type signature never changes. Does cargo build catch this real regression? Does cargo test catch it?",
      body: (
        <>
          The same signature, a genuinely wrong answer.
        </>
      ),
      duration: 2.8,
      predict: {
        options: [
          { label: 'Both catch it, since the logic clearly changed' },
          { label: 'Neither catches it, since no type ever changed' },
          { label: 'Build stays green, but test genuinely fails', correct: true },
        ],
        explain: (
          <>
            The test catches it; the build cannot.
          </>
        ),
      },
      Visual: S.TestPredict,
    },
    {
      title: 'Measured: cargo build genuinely stays green through the real logic regression, since the code still compiles; cargo test genuinely fails on it, since the existing unit tests assert the real, now-wrong behavior directly',
      body: (
        <>
          Build, then test, against the real regression.
        </>
      ),
      duration: 3.0,
      takeaway: 'A test is the one real local gate that checks what a program does, not just whether it compiles.',
      Visual: S.TestReveal,
    },
    {
      title: "The Cargo Book states these rules directly: the lints table overrides a lint's own level in one table, written once; cargo test compiles and executes a package's own unit, integration, and documentation tests. Do the three measured gates here model exactly the rules both quotes describe?",
      body: (
        <>
          The Cargo Book's own words on these rules.
        </>
      ),
      duration: 2.8,
      takeaway: 'A format check, a denied lint, and a real test each catch a different mistake the other two let through.',
      Visual: S.DocsReveal,
    },
    {
      title: 'Recap: three real, different gates',
      body: (
        <>
          A format check catches what a human eye would call messy; a denied lint catches a known, named mistake the instant it appears; a test catches a real behavior regression neither one can see; none of the three substitutes for either of the other two.
        </>
      ),
      duration: 3.0,
      Visual: S.Recap,
    },
  ],
};

export default reel;
