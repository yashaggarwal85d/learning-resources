import type { Reel } from '../../../../../reels/types';
import * as S from './scenes';

// A real postings index built and intersected over a synthetic plant label
// scheme, checked against a brute-force scan; a worst-case-vs-actual series
// count; an unbounded label's series-count blowup; and a columnar scan-based
// comparison against the same query in DuckDB (examples.py). No number here
// goes beyond what that file computes.
const reel: Reel = {
  steps: [
    {
      title: 'Hook: one label, and the server gets killed',
      body: (
        <>
          A team adds a batch label to every sensor series "so we can filter
          by batch." Within a day the metrics server's memory climbs far past
          its usual size, and it gets killed. The change was one line.
        </>
      ),
      duration: 5.6,
      fig: "a team adds a batch label to every sensor series, and within a day the metrics server's memory climbs far past its usual size and gets killed, from a one-line change",
      Visual: S.Hook,
    },
    {
      title: "Reveal: a series is its metric name plus its full label set",
      body: (
        <>
          Two readings count as the same series only if every one of their
          labels matches exactly. Change one label's value, or add a label
          that wasn't there before, and the result is a brand new series.
        </>
      ),
      duration: 5.4,
      fig: "two readings are the same series only if every label matches exactly; changing one label's value, or adding one, creates a brand new series",
      Visual: S.RevealSeriesIdentity,
    },
    {
      title: "Reveal: worst-case cross product vs. the plant's own actual series count",
      body: (
        <>
          Multiply every label's distinct values together and the worst case
          is large. The plant's real series count, built from which sensors
          are actually fitted to which equipment, lands well below it.
        </>
      ),
      duration: 5.6,
      fig: "the worst-case cross product of every label's distinct values is large; the plant's actual series count, built from real equipment fitment, lands well below it",
      takeaway: "The worst case and the actual count both follow from the same label scheme — only real-world constraints separate them.",
      Visual: S.RevealWorstVsActual,
    },
    {
      title: 'Predict: does a multi-label query have to scan every series?',
      body: (
        <>
          A query names several labels at once: one site, one sensor type.
          Does answering it mean checking every single series in the system
          one at a time?
        </>
      ),
      duration: 4.8,
      fig: "a query names several labels at once — does answering it mean checking every single series in the system one at a time?",
      predict: {
        options: [
          { label: 'Yes — every matcher has to be checked against every series' },
          {
            label: "No — an index can skip straight to the matching series",
            correct: true,
          },
        ],
        explain: (
          <>
            No. A postings list already holds exactly which series carry a
            given label, so an equality matcher can go straight to that list
            instead of inspecting every series.
          </>
        ),
      },
      Visual: S.PredictScan,
    },
    {
      title: "Reveal: a postings intersection skips most series; a regex can't",
      body: (
        <>
          Intersecting two sorted postings lists finds exactly the matching
          series without touching the rest. A regex matcher has no postings
          list of its own, so it has to check every series directly.
        </>
      ),
      duration: 5.6,
      fig: "intersecting two sorted postings lists finds the matching series without touching the rest, while a regex matcher has no postings list and must check every series",
      Visual: S.RevealPostings,
    },
    {
      title: 'Reveal: one unbounded label multiplies every series it touches',
      body: (
        <>
          Give every sensor series its own batch label, and the series count
          multiplies by however many distinct batches exist. A label with no
          bound on its values has no bound on how many series it creates.
        </>
      ),
      duration: 5.6,
      fig: "giving every sensor series its own batch label multiplies the series count by the number of distinct batches, because an unbounded label has no bound on the series it creates",
      takeaway: "An unbounded label doesn't make a system slower — it makes the number of things to track unbounded.",
      Visual: S.RevealBlowup,
    },
    {
      title: 'Reveal: a scan-based model has no per-series index to blow up',
      body: (
        <>
          Store every reading as an ordinary row in a columnar table instead,
          and the same batch label is just another column. There is no
          per-series index for it to blow up — only a scan that gets larger.
        </>
      ),
      duration: 5.6,
      fig: "storing every reading as a row in a columnar table makes the batch label an ordinary column with no per-series index to blow up, only a scan that gets larger",
      takeaway: "A scan-based model trades an index that can explode for a scan that merely grows larger.",
      Visual: S.RevealColumnarScan,
    },
    {
      title: 'Recap',
      body: (
        <>
          A series is defined by its full label set. A postings index helps
          an equality matcher and not a regex. An unbounded label multiplies
          series count directly. A scan-based model trades the index for a
          scan. A batch ID belongs in a table, not a label.
        </>
      ),
      duration: 5.8,
      fig: "a series is defined by its full label set, a postings index helps equality but not regex matching, an unbounded label multiplies series count, and a scan-based model trades the index for a scan",
      Visual: S.Recap,
    },
    {
      title: 'Prove it',
      body: (
        <>
          The team that added the batch label asks why their memory usage
          exploded. Given the series-identity rule, can the exact new series
          count be stated without guessing?
        </>
      ),
      duration: 4.8,
      fig: "given the series-identity rule, can the exact new series count after adding the batch label be stated without guessing?",
      predict: {
        options: [
          { label: 'No — the exact count depends on data the system never records' },
          {
            label: 'Yes — multiply the prior series count by the number of distinct batch values',
            correct: true,
          },
        ],
        explain: (
          <>
            Yes. Because a series is exactly its label set, adding one label
            with a known number of distinct values multiplies the prior
            count by that number, with nothing left to guess.
          </>
        ),
      },
      Visual: S.ProveIt,
    },
  ],
};

export default reel;
