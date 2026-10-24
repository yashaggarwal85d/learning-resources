import type { Reel } from '../../../../../reels/types';
import * as S from './scenes';

// Whether a real dependency version is actually vulnerable is a real,
// published, continuously updated fact, not something a project can
// determine by guessing or by how recently it was last updated.
const reel: Reel = {
  steps: [
    {
      title: "A real project pins a dependency at a specific, real version, one a real, published security advisory names as vulnerable. Nobody on this project wrote that advisory, or decided to check for it by hand. Does a real lookup against the real, published database actually catch it anyway?",
      body: (
        <>
          A real, pinned dependency, no special config.
        </>
      ),
      duration: 2.8,
      predict: {
        options: [
          { label: 'No, only a project that knows to look catches it' },
          { label: 'Yes, genuinely; the lookup catches any crate the database names', correct: true },
          { label: 'Only if the version is extremely recent' },
        ],
        explain: (
          <>
            Yes. It needs no project-specific setup.
          </>
        ),
      },
      Visual: S.LookupPredict,
    },
    {
      title: "Measured: a real cargo audit run against the real, pinned vulnerable version reports the real advisory by its own real id, with no project-specific configuration telling it what to look for",
      body: (
        <>
          The pinned version, checked against the real list.
        </>
      ),
      duration: 3.0,
      Visual: S.LookupReveal,
    },
    {
      title: "The very next real release of the identical crate, one version later, is the one the advisory itself names as fixed. Does the identical real lookup still flag anything for that one?",
      body: (
        <>
          The next real release, one version later.
        </>
      ),
      duration: 2.8,
      predict: {
        options: [
          { label: 'Yes, since the crate itself was involved once' },
          { label: 'No, genuinely; the lookup reports a clean result', correct: true },
          { label: 'Only after a real delay for the database to catch up' },
        ],
        explain: (
          <>
            No. The fixed version reports clean.
          </>
        ),
      },
      Visual: S.PatchPredict,
    },
    {
      title: "Measured: the identical real lookup against the real, patched version reports a clean result, finding nothing, from the exact same real, live database that flagged the version one release earlier",
      body: (
        <>
          The patch, checked the identical way.
        </>
      ),
      duration: 3.0,
      takeaway: "A real advisory lookup tracks a real, specific version, not a crate's own reputation in general.",
      Visual: S.PatchReveal,
    },
    {
      title: "Side by side, both real lookups ran against the identical real crate, one version apart. Did the real database actually tell the two versions apart correctly, or did it just flag the crate as a whole?",
      body: (
        <>
          One crate, two real pinned versions.
        </>
      ),
      duration: 2.8,
      predict: {
        options: [
          { label: 'It flagged the crate as a whole, catching both' },
          { label: 'It told them apart correctly, catching only the real one', correct: true },
          { label: 'It depends on which version was checked first' },
        ],
        explain: (
          <>
            It told them apart, by version.
          </>
        ),
      },
      Visual: S.ComparePredict,
    },
    {
      title: "Measured: the real advisory is reported for exactly the one real, pinned version it actually names, and only that one, confirming the lookup is checking the real, specific version pinned in each real Cargo.lock, not merely the crate's own name",
      body: (
        <>
          Both versions, checked side by side.
        </>
      ),
      duration: 3.0,
      takeaway: 'Whether a real dependency is actually vulnerable is a published fact to look up, not something to guess.',
      Visual: S.CompareReveal,
    },
    {
      title: "The RustSec Advisory Database's own front page states this directly: it is a real vulnerability database for the Rust ecosystem, and its own cargo-audit tool audits a real Cargo.lock file for crates with known, real vulnerabilities. Does this topic's own two measured lookups match exactly what both of those sentences describe?",
      body: (
        <>
          RustSec, in its own words.
        </>
      ),
      duration: 2.8,
      takeaway: 'A real, continuously updated advisory lookup finds what a guess, or a one-time check, genuinely cannot.',
      Visual: S.DocsReveal,
    },
    {
      title: 'Recap: asking a published list instead of guessing',
      body: (
        <>
          The identical real crate, one version apart, gets a genuinely different real answer from the identical real lookup; that is what makes supply-chain trust something to actually check, on a real, published record, rather than something to assume because nothing has broken yet.
        </>
      ),
      duration: 3.0,
      Visual: S.Recap,
    },
  ],
};

export default reel;
