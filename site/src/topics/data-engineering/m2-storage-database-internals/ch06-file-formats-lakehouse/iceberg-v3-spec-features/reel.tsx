import type { Reel } from '../../../../../reels/types';
import * as S from './scenes';

// Every claim here is verified against the Apache Iceberg table spec's own v3 feature additions
// (deletion vectors, row lineage, Variant, geometry/geography, nanosecond timestamps, the unknown
// type, default values, multi-argument transforms, table encryption keys; what an older reader
// does with an initial-default: read it correctly if null, default to null, or fail on a required
// field) and a real, dated vendor announcement (Databricks's own public-preview blog post naming
// exactly which v3 features its managed tables support today) -- and against real pyiceberg
// (0.12.0) behavior in this sandbox: a real, caught NotImplementedError when writing an actual
// v3 table is attempted, and a real v3-spec default value exercised and read back correctly on an
// ordinary v2-format table.
const reel: Reel = {
  steps: [
    {
      title: 'Hook',
      body: (
        <>
          Both delete mechanisms from the last topic are v2 features. v3 is a whole version
          bump — most of it, this chapter has already quietly met, one feature at a time.
        </>
      ),
      duration: 4.8,
      fig: 'both delete mechanisms from the last topic are v2 features -- v3 is a whole version bump.',
      Visual: S.Hook,
    },
    {
      title: 'Predict: what actually ties deletion vectors, row lineage, and Variant together?',
      body: (
        <>
          Deletion vectors, row lineage, and Variant were each taught separately, in earlier
          topics, as if they were just one idea at a time. What actually ties them together as
          one thing?
        </>
      ),
      duration: 4.8,
      fig: 'deletion vectors, row lineage, and variant were each taught separately. what ties them together?',
      predict: {
        options: [
          { label: 'Nothing — they’re unrelated features' },
          { label: 'They’re all part of one version: v3', correct: true },
        ],
        explain: (
          <>
            All three are v3 spec additions, taught one at a time as this chapter reached them —
            now named together as the single version bump they actually are.
          </>
        ),
      },
      Visual: S.PredictWhatTiesThemTogether,
    },
    {
      title: 'Reveal: they’re all one coherent version bump — v3',
      body: (
        <>
          They're all one coherent version bump: v3, adding deletion vectors (already built),
          row lineage (already built), Variant (already built) — and five more features named
          here.
        </>
      ),
      duration: 4.8,
      fig: "they're all one coherent version bump: v3.",
      Visual: S.RevealOneVersionBump,
    },
    {
      title: 'Reveal: v3 also adds five more features',
      body: (
        <>
          v3 also adds: geometry and geography types, nanosecond-precision timestamps, the
          `unknown` type, column default values, multi-argument transforms, and table encryption
          keys.
        </>
      ),
      duration: 4.8,
      fig: 'v3 also adds geometry, geography, nanosecond timestamps, the unknown type, defaults, multi-argument transforms, encryption keys.',
      takeaway: 'v3 is one version bump, eight named features, not a scattered pile of ideas.',
      Visual: S.RevealFiveMoreFeatures,
    },
    {
      title: 'Predict: what does a v2-only reader do when it meets a v3 default value?',
      body: (
        <>
          A v2-only reader opens a table that now has a required column filled in by a v3
          default value. What does it actually do: read it correctly, silently get it wrong, or
          fail?
        </>
      ),
      duration: 4.8,
      fig: 'a v2-only reader opens a table with a required column filled by a v3 default. what happens?',
      predict: {
        options: [
          { label: 'It reads everything correctly, no issue' },
          { label: 'It depends on whether the field is required', correct: true },
        ],
        explain: (
          <>
            An optional field's default falls back to null correctly on an old reader. A
            required field's default is the one case where an old reader genuinely fails.
          </>
        ),
      },
      Visual: S.PredictOldReaderMeetsDefault,
    },
    {
      title: 'Reveal: reproduced for real — a v3 default value, read correctly on a v2 table',
      body: (
        <>
          Measured: an optional column's default reads back correctly even through this
          sandbox's own v2-format table — old rows get the default, new rows get their own
          value. A required field's default is the one case that genuinely fails an old reader.
        </>
      ),
      duration: 4.8,
      fig: 'reproduced for real: an optional default reads correctly even on a v2-format table.',
      takeaway: "A v2 reader's fallback depends on whether the defaulted field is required.",
      Visual: S.RevealDefaultFallbackMeasured,
    },
    {
      title: 'Reveal: reproduced for real — writing an actual v3 table fails outright',
      body: (
        <>
          And writing an actual v3 table is attempted directly here: it fails outright, with
          this library's own real, open, named error. v3 is read about and partly borrowed from
          here — not fully written yet, even in this sandbox.
        </>
      ),
      duration: 4.8,
      fig: "reproduced for real: writing an actual v3 table fails outright, with this library's own real error.",
      Visual: S.RevealV3WriteBlocked,
    },
    {
      title: 'Reveal: a real, dated engine announcement supports exactly three v3 features today',
      body: (
        <>
          That gap is the real story: a real, dated engine's own v3 announcement lists exactly
          three features as supported today — deletion vectors, row lineage, Variant — and says
          nothing about the other five.
        </>
      ),
      duration: 4.8,
      fig: 'a real, dated engine announcement lists exactly three v3 features as supported today.',
      Visual: S.RevealVendorSupportsThree,
    },
    {
      title: 'Reveal: engine support lag, not the spec, is what actually gates adopting v3',
      body: (
        <>
          Engine support lag, not the spec itself, is what actually gates adopting v3 today.
        </>
      ),
      duration: 4.8,
      fig: 'engine support lag, not the spec itself, is what actually gates adopting v3 today.',
      takeaway: 'The spec is finished; engine support lag is the actual adoption constraint.',
      Visual: S.RevealEngineLagGates,
    },
    {
      title: 'Recap',
      body: (
        <>
          v3 is one coherent version bump across eight features, most of this chapter already
          met separately. This sandbox writes around its edges — a blocked v3 table, a v3
          default value borrowed onto v2 — while real engines are still catching up, feature by
          feature.
        </>
      ),
      duration: 4.8,
      fig: "column statistics are per-file; the next topic is whole-table statistics.",
      Visual: S.Recap,
    },
  ],
};

export default reel;
