import type { Reel } from '../../../../../reels/types';
import * as S from './scenes';

// A feature a sibling crate requests is unified into a shared
// dependency's own single build, for better or worse; staying
// additive is what keeps that unification safe, and the resolver a
// workspace declares decides whether even a dev-only request can
// leak somewhere nobody meant it to go.
const reel: Reel = {
  steps: [
    {
      title: "consumer_b never asks for core_crate's own fast_mode feature. It is built alone, then built again in the same cargo invocation as consumer_a, which does request fast_mode on the shared core_crate. Does consumer_b's own real output change?",
      body: (
        <>
          One shared dependency, two siblings' own requests.
        </>
      ),
      duration: 2.8,
      predict: {
        options: [
          { label: 'No, a crate only sees the features it requests' },
          { label: 'Yes, genuinely; cargo unifies the request across the build', correct: true },
          { label: 'Only if consumer_b is rebuilt by hand afterward' },
        ],
        explain: (
          <>
            Yes. The unified build genuinely changes it.
          </>
        ),
      },
      Visual: S.NonAdditivePredict,
    },
    {
      title: 'Measured: consumer_b built alone genuinely prints "plain"; the identical consumer_b, built alongside consumer_a requesting fast_mode, genuinely prints "fast" instead, with its own source and Cargo.toml never touched',
      body: (
        <>
          The real, measured output, compared.
        </>
      ),
      duration: 3.0,
      Visual: S.NonAdditiveReveal,
    },
    {
      title: 'The identical comparison, but now consumer_a requests a genuinely additive feature, fancy, which only adds a new function and touches nothing consumer_b already calls. Does the output of consumer_b change this time?',
      body: (
        <>
          The same siblings, a different request.
        </>
      ),
      duration: 2.8,
      predict: {
        options: [
          { label: "Yes, any sibling's requested feature changes the build" },
          { label: 'No, genuinely; fancy never touches plain_output', correct: true },
          { label: 'Only if fancy happens to be enabled by default' },
        ],
        explain: (
          <>
            No. A purely additive feature changes nothing.
          </>
        ),
      },
      Visual: S.AdditivePredict,
    },
    {
      title: 'Measured: consumer_b built alone and consumer_b built alongside consumer_a requesting fancy genuinely print the identical "plain" both times',
      body: (
        <>
          The real, measured output, unchanged.
        </>
      ),
      duration: 3.0,
      takeaway: "A feature that only adds, never changes, a dependency's behavior leaves every sibling that never asked for it untouched.",
      Visual: S.AdditiveReveal,
    },
    {
      title: "consumer_b itself declares core_crate twice: once as a plain dependency, and once as a dev-dependency with fast_mode turned on, for its own tests. Under the resolver edition 2024 makes the default, does that dev-only feature request leak into a plain, non-test build?",
      body: (
        <>
          A dev-only request, on consumer_b's own Cargo.toml.
        </>
      ),
      duration: 2.8,
      predict: {
        options: [
          { label: "Yes, a dev-dependency's own features always apply everywhere" },
          { label: 'No, genuinely; the modern resolver keeps it out of a non-test build', correct: true },
          { label: 'Only if cargo test is run first' },
        ],
        explain: (
          <>
            No, not under the modern resolver.
          </>
        ),
      },
      Visual: S.DevDepPredict,
    },
    {
      title: 'Measured: the identical Cargo.toml declaration, built under the old, pre-2021 resolver default, genuinely leaks fast_mode into the plain build; built under the modern, edition-2024 resolver, the identical declaration genuinely does not leak',
      body: (
        <>
          The same declaration, two real resolvers.
        </>
      ),
      duration: 3.0,
      takeaway: 'The resolver a workspace declares decides whether a dev-only feature request can reach a build nobody meant it to touch.',
      Visual: S.DevDepReveal,
    },
    {
      title: 'The Cargo Book states these rules directly: cargo unifies the union of every feature requested on a shared dependency across the whole build, and a feature should stay additive so that enabling any combination of features stays safe. Do the three measured comparisons here model exactly the rule and the risk both quotes describe?',
      body: (
        <>
          The Cargo Book's own words on these rules.
        </>
      ),
      duration: 2.8,
      takeaway: "A feature's real safety is never just the crate's own property; it belongs to every combination the build can unify.",
      Visual: S.DocsReveal,
    },
    {
      title: "Recap: a feature's own real combinatorics",
      body: (
        <>
          A feature a sibling crate requests is unified into a shared dependency's own single build, for better or worse; staying additive is what keeps that unification safe, and the resolver a workspace declares decides whether even a dev-only request can leak somewhere nobody meant it to go.
        </>
      ),
      duration: 3.0,
      Visual: S.Recap,
    },
  ],
};

export default reel;
