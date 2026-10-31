import type { Reel } from '../../../../../reels/types';
import * as S from './scenes';

// Every number this reel shows comes from a real run of examples.py against this topic's own
// in-process raw layer and silver table: a correction appended as a new record rather than an
// edit to an old one, two builds of silver from the identical raw layer checksummed against
// each other, a buggy currency transform and a fixed one rebuilt from the identical raw records
// and diffed row by row, and an erasure request measured twice — once against a plaintext raw
// layer, once against a tokenized one, each checked by comparing the raw layer's own checksum
// before and after.
const reel: Reel = {
  steps: [
    {
      title: 'Hook',
      body: (
        <>
          A bug in a currency conversion is found a year after the fact. The silver table was
          overwritten in place months ago, and the raw files that could rebuild it correctly
          were already deleted under a short retention window.
        </>
      ),
      duration: 4.8,
      fig: 'a currency bug found a year later; silver was overwritten, raw was already deleted; the rebuild arrow points at an empty box.',
      Visual: S.Hook,
    },
    {
      title: 'Predict: fixing without re-extracting',
      body: (
        <>
          Suppose this raw layer, unlike the hook's, was never deleted. Can fixing the
          transformation and rebuilding silver from that raw layer alone reproduce the correct
          numbers, with no new extraction from the live source at all?
        </>
      ),
      duration: 2.8,
      fig: 'this raw layer was never deleted. Can a replay with a fixed transform alone reproduce the correct numbers?',
      predict: {
        options: [
          { label: 'Yes — the raw layer already holds everything the transform needs, so a replay with the fixed logic is enough', correct: true },
          { label: 'No — only a fresh extraction from the live source can fix historical numbers, since the mistake happened at extraction time' },
        ],
        explain: (
          <>
            The mistake lived in the transform, not the capture. The raw layer's own unprocessed
            records were never touched by a bug that only existed downstream of them, so a
            replay with the fixed transform reaches the correct numbers on its own.
          </>
        ),
      },
      Visual: S.Predict,
    },
    {
      title: 'Reveal: raw capture is append-only, measured',
      body: (
        <>
          Run directly against the mock: a correction to an order's amount arrives later, not as
          an edit to the original record, but as a brand-new record with a later offset. The
          first three records stay byte for byte unmutated.
        </>
      ),
      duration: 4.8,
      fig: 'the real run: a correction arrives as a brand-new record; the first three stay byte for byte unmutated.',
      Visual: S.RevealAppendOnly,
    },
    {
      title: 'Reveal: rebuild by replay, measured',
      body: (
        <>
          Run directly against the mock: silver is built twice from the identical raw layer,
          using the identical transform, and checksummed both times.
        </>
      ),
      duration: 4.8,
      fig: 'the real run: silver built twice from the identical raw layer, checksummed both times.',
      takeaway: 'Two builds from the identical raw layer land on the identical checksum — raw alone decides what silver contains.',
      Visual: S.RevealRebuildMeasured,
    },
    {
      title: 'Reveal: the three metadata fields',
      body: (
        <>
          Every raw record is stamped with when it arrived, where in the source it came from,
          and which version of the schema it arrived under — the three fields that make a
          replay possible and a defect traceable to its exact input.
        </>
      ),
      duration: 4.8,
      fig: 'every raw record carries three fields: when it arrived, where from, and under which schema.',
      Visual: S.RevealMetadataFields,
    },
    {
      title: 'Reveal: a bug fix isolated by replay, measured',
      body: (
        <>
          Run directly against the mock: the identical raw layer rebuilt once with last year's
          buggy transform and once with the fixed one. Only the rows the bug actually touched
          differ between the two.
        </>
      ),
      duration: 4.8,
      fig: 'the real run: the identical raw layer rebuilt once buggy, once fixed. Only the rows the bug touched differ.',
      takeaway: "A bug-fixed replay changes only the rows the bug actually touched — proof the fix didn't break anything else.",
      Visual: S.RevealBugFixMeasured,
    },
    {
      title: 'Reveal: what keeping raw forever costs',
      body: (
        <>
          An append-only strip that never shrinks sits directly against a real legal duty:
          personal data kept no longer than necessary for the purpose it was collected for.
          Replayability and that duty pull in opposite directions on the same record.
        </>
      ),
      duration: 4.8,
      fig: 'an append-only strip that never shrinks, against a duty to keep personal data no longer than necessary.',
      Visual: S.RevealRetentionTension,
    },
    {
      title: 'Reveal: tokenizing the one field that matters',
      body: (
        <>
          Instead of a customer's email sitting in every raw record that mentions them, a token
          sits there instead, and a small, separate, mutable vault maps the token back to the
          real email.
        </>
      ),
      duration: 4.8,
      fig: 'an email in every raw record is replaced by a token; a small, separate vault maps it back.',
      Visual: S.RevealTokenization,
    },
    {
      title: 'Reveal: erasure against both designs, measured',
      body: (
        <>
          Run directly against the mock: a plaintext raw layer satisfies an erasure request only
          by mutating every historical record naming that person. A tokenized raw layer
          satisfies the identical request by deleting one row from the vault, and the raw
          layer's own checksum does not change at all.
        </>
      ),
      duration: 4.8,
      fig: 'the real run: a plaintext erasure mutates three historical records; a tokenized erasure leaves raw’s own checksum unchanged.',
      takeaway: 'Tokenizing the one identifying field turns an erasure into a one-row deletion that never touches raw at all.',
      Visual: S.RevealErasureMeasured,
    },
    {
      title: 'Recap',
      body: (
        <>
          An append-only strip, its three metadata fields, the replay that rebuilds silver, and
          a vault that carries the one thing allowed to change — side by side.
        </>
      ),
      duration: 4.8,
      fig: 'an append-only strip, three metadata fields, a replay that rebuilds silver, and a vault for the one thing allowed to change.',
      takeaway: 'An append-only raw layer plus a small, mutable vault lets a pipeline replay, fix bugs, and still honor an erasure.',
      Visual: S.Recap,
    },
    {
      title: 'Prove it',
      body: (
        <>
          An erasure request arrives for a person whose records sit in a tokenized raw layer.
          What has to change, and what must not?
        </>
      ),
      duration: 2.8,
      fig: 'an erasure request arrives for a tokenized raw layer. What has to change, and what must not?',
      predict: {
        options: [
          { label: "The vault's mapping for that person's token is deleted; every raw record keeping that token stays exactly as it is", correct: true },
          { label: 'Every raw record naming that person is found and has its token field blanked out' },
        ],
        explain: (
          <>
            Blanking out the token in every raw record is exactly the plaintext design's own
            failure, reintroduced by hand. The whole point of the token is that the raw layer
            never has to be touched — only the vault's one mapping does.
          </>
        ),
      },
      Visual: S.ProveIt,
    },
  ],
};

export default reel;
