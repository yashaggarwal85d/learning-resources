import type { Reel } from '../../../../../reels/types';
import * as S from './scenes';

// A real, executed Gorilla-style delta-of-delta/XOR encoder, a Chimp-style
// trailing-zero refinement, and bytes-per-point measurements across three
// synthetic regimes against raw storage, these two encoders, DuckDB's own
// default float codec (ALP) and Zstd (examples.py). The paper's own two
// worked examples are reproduced exactly as asserted bit counts; no other
// number here goes beyond what that file computes.
const reel: Reel = {
  steps: [
    {
      title: 'Hook: the same algorithm, a very different ratio',
      body: (
        <>
          A colleague promises that Gorilla's encoder will shrink the plant's
          storage bill by twelve times. Two weeks later, on this plant's own
          data, the measured ratio is barely better than one. Same algorithm,
          same code, no bug.
        </>
      ),
      duration: 5.6,
      fig: "a colleague's promise of a twelve-times reduction from Gorilla's encoder measures barely better than one on this plant's own data, with no bug in the code",
      Visual: S.Hook,
    },
    {
      title: "Reveal: delta-of-delta timestamps and XOR'd floats",
      body: (
        <>
          Gorilla stores the change in the change between timestamps, and XORs
          each float against the one before it. The paper's own worked
          examples — a small delta-of-delta, and an XOR with almost no
          meaningful bits — reproduce exactly to the bit.
        </>
      ),
      duration: 5.8,
      fig: "Gorilla stores the delta of deltas between timestamps and the XOR between successive floats, and this topic's encoder reproduces the paper's own worked bit counts exactly",
      Visual: S.RevealGorillaEncoders,
    },
    {
      title: 'Predict: same encoder, same ratio on a different signal?',
      body: (
        <>
          The same encoder runs on a signal that changes often and carries
          many significant digits, instead of the slow, regular signal
          Gorilla was built for. Does it still compress as well?
        </>
      ),
      duration: 4.8,
      fig: "the same Gorilla encoder runs on a noisy, frequently changing signal instead of a slow, regular one — does it still compress as well?",
      predict: {
        options: [
          { label: 'Yes — the encoding rule is the same either way' },
          {
            label: 'No — the rule depends on values and timestamps barely changing',
            correct: true,
          },
        ],
        explain: (
          <>
            No. Delta-of-delta and XOR encoding both depend on successive
            values staying close to each other — noise breaks exactly that
            assumption.
          </>
        ),
      },
      Visual: S.PredictSameEncoder,
    },
    {
      title: 'Reveal: three regimes, three very different ratios',
      body: (
        <>
          On a slow, regular signal the encoder shrinks the data by far. On a
          noisy, high-precision signal, the same encoder barely helps at all.
          The ratio belongs to the data, not the algorithm.
        </>
      ),
      duration: 5.6,
      fig: "the same Gorilla encoder shrinks a slow, regular signal by far while barely helping a noisy, high-precision signal — the ratio is a property of the data",
      Visual: S.RevealThreeRegimes,
    },
    {
      title: "Reveal: Chimp's threshold, and the wider window that helps",
      body: (
        <>
          Chimp spends fewer bits describing a short run of trailing zeros
          instead of counting them. Chimp128 compares against many earlier
          values instead of only the one before it — and that wider search
          wins when a signal repeats.
        </>
      ),
      duration: 5.8,
      fig: "Chimp spends fewer bits on a short trailing-zero run, and Chimp128's wider comparison against many earlier values wins specifically when a signal repeats",
      takeaway: "A wider search isn't a strictly better encoder — it's a different bet that only pays off on repeating data.",
      Visual: S.RevealChimp,
    },
    {
      title: "Reveal: ALP's decimal-aware encoding, and why it wins here",
      body: (
        <>
          A sensor reading of twenty-one point three seven degrees stores a
          float whose lowest bits are measurement noise. ALP treats that
          reading as a small exact integer instead, and DuckDB uses it as its
          own default float codec.
        </>
      ),
      duration: 5.8,
      fig: "a decimal sensor reading's low bits are measurement noise to a bit-pattern codec; ALP encodes it as a small exact integer instead, and is DuckDB's own default float codec",
      takeaway: "The win isn't compressing harder overall — it's noticing a decimal reading's low bits were never information at all.",
      Visual: S.RevealALP,
    },
    {
      title: 'Reveal: dictionary and RLE shrink the tags, not the values',
      body: (
        <>
          The same few equipment and signal names repeat across millions of
          rows. A dictionary plus a run length collapses that repetition to
          almost nothing — the compressed size left over is almost entirely
          the values.
        </>
      ),
      duration: 5.4,
      fig: "a dictionary plus run-length encoding collapses the repeated equipment and signal names to almost nothing, leaving the compressed size dominated by values",
      takeaway: "A label column and a value column are different compression problems, and the label side is already almost solved.",
      Visual: S.RevealDictionaryRLE,
    },
    {
      title: 'Recap',
      body: (
        <>
          Delta-of-delta and XOR win on slow, regular data. Chimp's wider
          search wins on repeating data. ALP wins on decimal data. A lossy
          codec trades some of this for an error band it has to name. The
          ratio was always about the data.
        </>
      ),
      duration: 5.8,
      fig: "delta-of-delta and XOR win on slow regular data, Chimp's wider search wins on repeating data, ALP wins on decimal data, and a lossy codec trades accuracy for a stated error band",
      Visual: S.Recap,
    },
    {
      title: 'Prove it',
      body: (
        <>
          A vendor claims their codec beats every other codec on every
          workload. Given what the three regimes just showed, should that
          claim survive contact with this plant's own data?
        </>
      ),
      duration: 4.8,
      fig: "a vendor claims one codec beats every other codec on every workload — should that claim survive contact with this plant's own data?",
      predict: {
        options: [
          { label: "Yes — a better codec should win everywhere" },
          {
            label: 'No — every codec measured here won on some regime and lost on another',
            correct: true,
          },
        ],
        explain: (
          <>
            No. Every codec this topic measured had a regime where it won and
            a regime where another codec beat it — a codec's ratio is a claim
            about data shape, not a universal ranking.
          </>
        ),
      },
      Visual: S.ProveIt,
    },
  ],
};

export default reel;
