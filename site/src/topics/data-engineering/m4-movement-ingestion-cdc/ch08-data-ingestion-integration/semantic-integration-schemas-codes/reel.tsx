import type { Reel } from '../../../../../reels/types';
import * as S from './scenes';

// Measured directly against this sandbox's own real PostgreSQL cluster: a real slowly changing
// crosswalk joined by event time, a real dated-exchange-rate conversion that avoids the
// integer-cents bug, a real daylight-saving transition found by scanning real AT TIME ZONE
// output, and a real mapping test that fails the moment an unmapped code appears. Rahm and
// Bernstein's own schema-matching survey sits behind a sign-in wall and is named only.
const reel: Reel = {
  steps: [
    {
      title: 'Hook',
      body: (
        <>
          The legacy system reports revenue as integer cents and local Berlin time; the shop's
          own system reports decimals and UTC. Summed together, one is off by a hundred, the
          other by an hour on the clock-change night.
        </>
      ),
      duration: 4.8,
      fig: "the legacy system reports revenue as integer cents and local Berlin time; the shop's own system reports decimals and UTC. Summed together, one is off by a hundred, the other by an hour on the clock-change night.",
      Visual: S.Hook,
    },
    {
      title: 'Predict: are these two bugs the same fix',
      body: (
        <>
          Does fixing the currency mismatch also fix the timestamp mismatch, or are they two
          entirely separate problems needing two separate fixes?
        </>
      ),
      duration: 2.8,
      fig: "does fixing the currency mismatch also fix the timestamp mismatch, or are they two entirely separate problems needing two separate fixes?",
      predict: {
        options: [
          { label: 'One underlying fix — reconciling units generally — resolves both at once' },
          {
            label: "Two separate problems: a missing minor-unit scale factor, and a missing time zone, with entirely different fixes",
            correct: true,
          },
        ],
        explain: (
          <>
            The currency bug is a missing scale factor; the timestamp bug is a missing zone.
            Fixing one changes nothing about the other — each needs its own explicit, dated or
            zone-aware reconciliation.
          </>
        ),
      },
      Visual: S.Predict,
    },
    {
      title: 'Reveal: matching two schemas by evidence',
      body: (
        <>
          Two schemas get matched by name, type and sample-value evidence; thicker match lines
          mean stronger evidence, and the result is written as a transformation.
        </>
      ),
      duration: 4.8,
      fig: "two schemas get matched by name, type and sample-value evidence; thicker match lines mean stronger evidence, and the result is written as a transformation.",
      Visual: S.RevealSchemaMatching,
    },
    {
      title: 'Reveal: a crosswalk joined by event time',
      body: (
        <>
          A crosswalk table maps one system's own code to another's, carrying a validity window;
          a fact joins to the row in force at its own event time.
        </>
      ),
      duration: 4.8,
      fig: "a crosswalk table maps one system's own code to another's, carrying a validity window; a fact joins to the row in force at its own event time.",
      Visual: S.RevealCrosswalk,
    },
    {
      title: 'Reveal: one meaning per unit string',
      body: (
        <>
          A named unit standard maps every unit string to exactly one meaning a machine can
          check, rather than leaving units as free text.
        </>
      ),
      duration: 4.8,
      fig: 'a named unit standard maps every unit string to exactly one meaning a machine can check, rather than leaving units as free text.',
      Visual: S.RevealUnits,
    },
    {
      title: "Reveal: the currency's own minor-unit exponent",
      body: (
        <>
          Each currency has its own minor-unit exponent; skipping it and converting an
          integer-cents figure as if it were already a decimal is off by exactly that scale.
        </>
      ),
      duration: 4.8,
      fig: 'each currency has its own minor-unit exponent; skipping it and converting an integer-cents figure as if it were already a decimal is off by exactly that scale.',
      takeaway: 'A currency conversion is correct only once the minor-unit scale and the dated rate are both applied.',
      Visual: S.RevealCurrencyExponent,
    },
    {
      title: 'Reveal: a UTC instant plus its own zone',
      body: (
        <>
          Storing a UTC instant plus its original zone survives a real daylight-saving
          transition that a fixed-offset conversion gets wrong by exactly an hour.
        </>
      ),
      duration: 4.8,
      fig: 'storing a UTC instant plus its original zone survives a real daylight-saving transition that a fixed-offset conversion gets wrong by exactly an hour.',
      takeaway: 'A fixed offset agrees with a real time zone almost every night and fails on exactly the nights that matter.',
      Visual: S.RevealTimezone,
    },
    {
      title: 'Reveal: owning the mapping as tested data',
      body: (
        <>
          The mapping lives as versioned, owned, tested data; a brand-new source code with no
          mapping fails a test immediately, instead of quietly becoming unknown.
        </>
      ),
      duration: 4.8,
      fig: "the mapping lives as versioned, owned, tested data; a brand-new source code with no mapping fails a test immediately, instead of quietly becoming unknown.",
      Visual: S.RevealVersionedTests,
    },
    {
      title: 'Recap',
      body: (
        <>
          Matching by evidence, a slowly changing crosswalk, units and currencies reconciled
          explicitly, and the mapping itself owned as tested data.
        </>
      ),
      duration: 4.8,
      fig: 'matching by evidence, a slowly changing crosswalk, units and currencies reconciled explicitly, and the mapping itself owned as tested data.',
      takeaway: 'Meaning is reconciled the same way identity is: explicitly, with a rule and a test, not assumed.',
      Visual: S.Recap,
    },
    {
      title: 'Prove it',
      body: (
        <>
          A new legacy order category code appears for the first time, with nobody having added
          it to the crosswalk yet. What happens the moment that row is loaded?
        </>
      ),
      duration: 2.8,
      fig: 'a new legacy order category code appears for the first time, with nobody having added it to the crosswalk yet. What happens the moment that row is loaded?',
      predict: {
        options: [
          { label: "It silently maps to an UNKNOWN category and the load succeeds" },
          {
            label: 'The mapping test fails, naming the unmapped code, before the row is treated as correctly categorized anywhere downstream',
            correct: true,
          },
        ],
        explain: (
          <>
            Owning the mapping as tested data means exactly this: a code nobody mapped is a
            failing test, not a silent default. The team finds out immediately, by name, rather
            than discovering an "unknown" bucket growing quietly in a report weeks later.
          </>
        ),
      },
      Visual: S.ProveIt,
    },
  ],
};

export default reel;
