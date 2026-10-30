import type { Reel } from '../../../../../reels/types';
import * as S from './scenes';

// Every number here is computed and asserted in examples.py: ninety-one percent precision and one
// hundred percent recall on two hundred structured rows; fifty percent recall and three of six
// notes missed on free text; and ten percent of columns left sensitive and unprotected, given
// fifty percent discovery recall and a fifth of columns truly sensitive.
const reel: Reel = {
  steps: [
    {
      title: 'Hook',
      body: (
        <>
          The shop's scanner finds every card number and email in its structured tables. Security
          signs off.
        </>
      ),
      duration: 4.4,
      fig: 'every structured card number and email, found. Signed off.',
      Visual: S.Hook,
    },
    {
      title: 'Predict: does a model close the free-text gap?',
      body: (
        <>
          Then a support agent types "call me instead, my card ends four-two-four-two" into a
          free-text note, in a nightly export nobody scanned. Does a model classifier close that
          gap entirely, partly, or not at all?
        </>
      ),
      duration: 4.8,
      fig: 'a phone number and a card ending, typed into prose.',
      predict: {
        options: [
          { label: 'A good enough model closes the free-text gap completely' },
          { label: 'A model helps, but free text keeps a real, measurable miss rate', correct: true },
        ],
        explain: (
          <>
            No vendor claims complete free-text coverage — Google's own infoType reference states
            built-in detectors "are not a perfectly accurate detection method." A model closes
            much of the gap, not all of it, and the honest remainder has to be carried forward as
            a known risk.
          </>
        ),
      },
      Visual: S.Predict,
    },
    {
      title: 'Reveal: two labels, not one',
      body: (
        <>
          A sensitivity tier says how carefully to handle a column. A category — personal data,
          health information, payment data — says which rules apply. One column carries both,
          independently.
        </>
      ),
      duration: 4.8,
      fig: 'a tier for handling. A category for which rules.',
      Visual: S.RevealTwoLabels,
    },
    {
      title: 'Reveal: pattern and checksum detection',
      body: (
        <>
          A regular expression catches a shape. A checksum, like the one card numbers carry,
          catches a shape that's also internally consistent — on the shop's own structured
          columns, that's ninety-one percent precision at one hundred percent recall.
        </>
      ),
      duration: 5.2,
      fig: 'shape plus checksum: ninety-one percent precision, full recall.',
      Visual: S.RevealPatternChecksum,
    },
    {
      title: 'Reveal: ML and LLM classifiers, by vendor',
      body: (
        <>
          Each major platform documents its own mix: Macie's managed identifiers add trained
          detection to pattern matching; Purview's built-in types can be copied and customized;
          Databricks calls its own engine an agentic AI system; Google scans by infoType.
        </>
      ),
      duration: 5.6,
      fig: 'four platforms, the same three techniques, named differently.',
      Visual: S.RevealVendorClassifiers,
    },
    {
      title: 'Reveal: tag propagation along lineage',
      body: (
        <>
          A tag set on one column should reach every column derived from it. A hash keeps the tag
          — the data is still personal — but breaks direct readability. An aggregate can lose the
          tag entirely.
        </>
      ),
      duration: 5.2,
      fig: 'the tag survives a hash. An aggregate can drop it.',
      takeaway: 'A hash does not remove a tag; it only breaks readability. An aggregate genuinely can.',
      Visual: S.RevealTagPropagation,
    },
    {
      title: 'Reveal: false negatives in free text, measured',
      body: (
        <>
          The same scanner, run on free-text support notes instead of structured columns, drops
          to fifty percent recall — missing three of six notes that genuinely contained a phone
          number or a card reference.
        </>
      ),
      duration: 5.2,
      fig: 'fifty percent recall on free text. Three of six missed.',
      takeaway: 'A scanner built for structured columns has a real, measurable miss rate on free text.',
      Visual: S.RevealFalseNegatives,
    },
    {
      title: "Reveal: classification as every later policy's input",
      body: (
        <>
          A masking policy, an erasure step, an access rule — each one reads a tag. A missed tag
          isn't a missed label. It's a policy that silently never ran.
        </>
      ),
      duration: 4.8,
      fig: 'every later policy reads a tag. A miss, a silent gap.',
      takeaway: 'A policy that protects only tagged columns fails open wherever discovery misses a tag.',
      Visual: S.RevealPolicyInput,
    },
    {
      title: 'Recap',
      body: (
        <>
          Two labels, not one. Pattern plus checksum on structured data, a model for the rest. A
          tag follows lineage, surviving a hash and dying at an aggregate. Free text keeps a real
          miss rate. Every later policy depends on this.
        </>
      ),
      duration: 5.2,
      fig: 'two labels, three techniques, a tag that travels, a real gap.',
      Visual: S.Recap,
    },
    {
      title: 'Prove it',
      body: (
        <>
          A masking policy protects only tagged columns. Discovery catches half of what's truly
          sensitive out there in free text. A fifth of the shop's columns are actually sensitive.
          What fraction of all columns end up sensitive and unprotected?
        </>
      ),
      duration: 4.8,
      fig: 'half caught, a fifth truly sensitive. What slips through?',
      predict: {
        options: [
          { label: 'None — a fifty percent recall policy still catches the one that matters' },
          { label: 'Ten percent of all columns: sensitive, and never tagged', correct: true },
        ],
        explain: (
          <>
            The miss rate (fifty percent) times the sensitive fraction (a fifth) is ten percent —
            exactly the "Prove it" calculation in examples.py. Half of a fifth of everything is
            still one in ten columns, silently unprotected.
          </>
        ),
      },
      Visual: S.ProveIt,
    },
  ],
};

export default reel;
