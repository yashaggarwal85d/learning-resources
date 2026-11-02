import type { Reel } from '../../../../../reels/types';
import * as S from './scenes';

// Every claim here is verified against Delta's own 4.4.0 and 4.2.0 release notes, the 4.3.0
// release-notes tracking issue, Delta Kernel's own introduction docs, Delta's type-widening docs,
// delta-rs's own README, and DuckDB's own blog post on why it chose Delta Kernel over delta-rs --
// plus a real local table built, appended, time-traveled and protocol-upgraded in this sandbox
// with delta-rs (the deltalake Python package) directly, no Spark cluster anywhere. Two of
// CHAPTER.md's own claims are corrected here: delta-rs is not a Delta Kernel connector, and
// Variant shredding is not fully out of preview in Delta 4.3.
const reel: Reel = {
  steps: [
    {
      title: 'Hook',
      body: (
        <>
          Topic 29 closed on: everything in the Delta arc so far is the protocol as it stands.
          This topic closes the arc with the release line that ships it, and the library, Delta
          Kernel, that lets this very script read and write Delta correctly with no Spark cluster.
        </>
      ),
      duration: 4.8,
      fig: 'everything so far is the protocol as it stands. this topic: the release that ships it, and the library that reads it.',
      Visual: S.Hook,
    },
    {
      title: "Predict: does every engine reimplement Delta's protocol itself?",
      body: (
        <>
          Flink, Trino, DuckDB and this very script all want to read and write Delta tables
          correctly. Does each one reimplement the whole protocol itself, or is there one shared
          library?
        </>
      ),
      duration: 4.8,
      fig: 'flink, trino, duckdb, this script all want to read delta. does each reimplement the protocol?',
      predict: {
        options: [
          { label: 'Each reimplements it' },
          { label: 'One shared library', correct: true },
        ],
        explain: (
          <>
            Delta Kernel exists exactly for this: a library that handles the protocol so a
            connector never has to understand its internals.
          </>
        ),
      },
      Visual: S.PredictSharedLibrary,
    },
    {
      title: 'Reveal: Delta Kernel',
      body: (
        <>
          Delta Kernel is a Rust library for building Delta connectors. It handles the protocol
          so you don't have to — query-engine agnostic, with a native Rust API and a C/C++ FFI
          layer any language can call.
        </>
      ),
      duration: 4.8,
      fig: "delta kernel: a rust library that handles the protocol, so a connector doesn't have to. query-engine agnostic.",
      Visual: S.RevealDeltaKernel,
    },
    {
      title: 'Reveal: delta-rs, a real table, no Spark',
      body: (
        <>
          delta-rs is a separate, independent implementation — not a Kernel connector — and it's
          what the deltalake package used right here is built on. This script writes a real
          table, appends a real second version, and reads delta-rs's own raw commit log off disk.
        </>
      ),
      duration: 4.8,
      fig: "delta-rs: a separate, real implementation, not a kernel connector. a real table, written and appended, no spark.",
      takeaway: "delta-rs isn't a Kernel connector — it's the separate, real implementation Kernel exists as an alternative to.",
      Visual: S.RevealDeltaRsRealTable,
    },
    {
      title: "Predict: can delta-rs still read an older version?",
      body: (
        <>
          The table has already moved on to its second version. With no Spark session and no
          separate catalog, can delta-rs alone still read exactly what the table looked like
          before that append?
        </>
      ),
      duration: 4.8,
      fig: 'the table has already moved to version one. can delta-rs still read version zero, alone?',
      predict: {
        options: [
          { label: 'No, the old version is gone' },
          { label: 'Yes, by version number', correct: true },
        ],
        explain: (
          <>
            Multi-version reads are part of the protocol itself — any correct reader, including
            delta-rs alone, can open a specific past version by number.
          </>
        ),
      },
      Visual: S.PredictTimeTravel,
    },
    {
      title: 'Reveal: a real time-travel read',
      body: (
        <>
          A real time-travel read: delta-rs opens the table at its first version by number alone,
          while the table itself has already moved on — multi-version support, with no Spark
          session anywhere.
        </>
      ),
      duration: 4.8,
      fig: 'yes, for real: a time-travel read by version number, delta-rs alone, no spark session anywhere.',
      takeaway: 'Reading an old version by number is a protocol property, not a Spark feature — any reader gets it free.',
      Visual: S.RevealTimeTravelReal,
    },
    {
      title: 'Reveal: real table features, enabled with one call',
      body: (
        <>
          One real call enables deletion vectors and row tracking — the exact two features
          earlier topics in this chapter built by hand. The table's real protocol numbers jump,
          and real reader and writer feature lists appear in its log.
        </>
      ),
      duration: 4.8,
      fig: "one call enables deletion vectors and row tracking for real. the table's own protocol numbers jump.",
      Visual: S.RevealFeaturesEnabled,
    },
    {
      title: 'Reveal: Variant, collations and geospatial, the same way',
      body: (
        <>
          The same switch enables the Variant type feature, connecting back to this chapter's own
          earlier Variant work. Collations and the Geospatial table feature land the identical
          way — both shipped in Delta Kernel at version 4.2.
        </>
      ),
      duration: 4.8,
      fig: 'the same switch enables variant, back to topic eight. collations and geospatial land the same way, in kernel.',
      Visual: S.RevealVariantFeature,
    },
    {
      title: 'Reveal: the current release line, precisely',
      body: (
        <>
          Delta 4.4 is built and tested against Spark 4.0.1, 4.1.0 and 4.2.0. Type widening has
          been fully supported since 4.0. But Variant shredding is still named
          variantShredding-preview as of 4.3 — not fully out of preview, as the syllabus line
          claims.
        </>
      ),
      duration: 4.8,
      fig: 'the release line, precisely: spark compatibility, identity columns, type widening since four oh, and variant shredding -- still preview-named in 4.3.',
      takeaway: "A syllabus line can be wrong too: Delta 4.3 still names shredding 'preview,' with its production flag unenforced.",
      Visual: S.RevealReleaseLinePrecise,
    },
    {
      title: 'Recap',
      body: (
        <>
          Delta Kernel is the shared, protocol-handling library. delta-rs is a separate, real
          implementation, used directly right here. The 4.x line's headline features are real and
          versioned, and most of them are Kernel features specifically.
        </>
      ),
      duration: 4.8,
      fig: "delta kernel is the shared library; delta-rs is a separate real one, used right here; the 4.x line's features are real and versioned.",
      Visual: S.Recap,
    },
  ],
};

export default reel;
