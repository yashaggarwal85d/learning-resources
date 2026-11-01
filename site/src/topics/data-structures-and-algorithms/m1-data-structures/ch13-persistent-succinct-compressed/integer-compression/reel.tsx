import type { Reel } from '../../../../../reels/types';
import * as S from './scenes';

// Integer compression. The previous topic's handoff's exact next step: a Roaring array
// container is nothing but a plain sorted list, and a plain sorted list is what every codec
// here compresses. Every number shown is computed or asserted in examples.py.
const reel: Reel = {
  steps: [
    {
      title: 'Is the smallest encoding also the fastest?',
      body: (
        <>
          A posting list of about a million document ids, in order, is four mebibytes as plain
          thirty two bit integers. A counting argument puts the fewest bits per id any encoding
          could average, over every such list, at thirteen and a half. Plain byte-oriented
          encoding on the gaps between ids spends about sixteen; packing fixed blocks of a
          hundred and twenty eight spends about seventeen here, because one stretch of wide gaps
          forces its own block wide. Is the smallest of these also the fastest to decode?
        </>
      ),
      duration: 5,
      fig: 'floor 13.44 bits/id, measured encodings spend more',
      Visual: S.Hook,
    },
    {
      title: 'Varint, the whole mechanism',
      body: (
        <>
          Seven payload bits per byte; the eighth bit says whether another byte follows. Decoding
          reads one byte at a time, checking that flag each time. The number one is a single
          byte; the number a hundred and fifty needs two.
        </>
      ),
      duration: 4.6,
      fig: 'one is one byte; a hundred and fifty is two',
      Visual: S.VarintMechanism,
    },
    {
      title: 'Known in advance, or not?',
      body: (
        <>
          Decoding a byte-oriented varint, one byte at a time: is the number of bytes a
          particular value will take known ahead of time, or does it depend on the value itself,
          discovered only byte by byte?
        </>
      ),
      duration: 1.8,
      predict: {
        options: [
          { label: 'Known in advance, from the value being decoded' },
          { label: "Depends on the value — found out one byte at a time", correct: true },
          { label: 'Always exactly four bytes, padded if shorter' },
          { label: 'Known in advance, from the list length alone' },
        ],
        explain: (
          <>
            Found out one byte at a time. Every continuation flag is a genuinely data-dependent
            branch — nothing about the value tells the decoder how many bytes are coming until
            it's already read them.
          </>
        ),
      },
      fig: 'each byte asks: is there another one?',
      Visual: S.VarintBranchPredict,
    },
    {
      title: 'The cost of that branch',
      body: (
        <>
          Measured on this list's own gaps: just under two data-dependent branches for every
          single id decoded. Every byte read is one more place the decoder could have guessed
          wrong about what comes next.
        </>
      ),
      duration: 4.4,
      fig: 'measured: almost two branches per id, every single decode',
      takeaway: 'A varint decode pays one genuinely data-dependent branch for every byte a value happens to need.',
      Visual: S.BranchCost,
    },
    {
      title: 'Frame of reference',
      body: (
        <>
          Split the list into fixed blocks. Each block stores one bit width of its own, wide
          enough for its largest gap, and every value in it is packed at exactly that width — no
          per-value flag, no per-value branch, anywhere inside the block.
        </>
      ),
      duration: 4.6,
      fig: 'one width per block, every value packed to it',
      Visual: S.FrameOfReference,
    },
    {
      title: 'One outlier, one whole block',
      body: (
        <>
          A single unusually large gap lands inside an otherwise tight block of a hundred and
          twenty eight small ones. What happens to that block's own stored width?
        </>
      ),
      duration: 1.8,
      predict: {
        options: [
          { label: 'Nothing — the block stores that one value separately' },
          { label: "The whole block widens to fit it", correct: true },
          { label: 'The outlier is simply dropped from the block' },
          { label: 'Only the outlier gets a wider slot; the rest stay narrow' },
        ],
        explain: (
          <>
            The whole block widens. One block has one width, for every value in it — so the
            single largest gap in the block sets the cost every other value in that same block
            has to pay.
          </>
        ),
      },
      fig: 'one wide gap, one hundred and twenty seven narrow ones',
      Visual: S.OutlierPredict,
    },
    {
      title: 'Patching',
      body: (
        <>
          Pick a width that covers most of a block's own values. Store the few that don't fit
          aside, as an exception list, and patch them back in right after the block itself
          decodes at its own narrow width. Measured: patching recovers most of what the outliers
          would otherwise have cost every value in their own block.
        </>
      ),
      duration: 5,
      fig: 'measured: frame of reference versus patched frame of reference',
      takeaway: 'Patching a few outliers aside costs far less than widening an entire block to fit them.',
      Visual: S.Patching,
    },
    {
      title: 'Grouped control bytes',
      body: (
        <>
          One control byte can describe four integers' own byte lengths at once. Decoding then
          checks one control byte for every four integers, instead of one continuation flag for
          every single byte.
        </>
      ),
      duration: 4.4,
      fig: 'one control byte, four integers described at once',
      Visual: S.GroupedControl,
    },
    {
      title: 'Does separating the streams change the size?',
      body: (
        <>
          A later design keeps the same grouped control byte idea, but moves every control byte
          out of the data entirely, into its own separate stream read ahead of it. Does that
          separation change how many bits the encoding spends?
        </>
      ),
      duration: 1.8,
      predict: {
        options: [
          { label: 'Yes — a separate stream needs its own extra bookkeeping' },
          { label: 'No — the same bits, only arranged differently', correct: true },
          { label: 'Yes — separating the streams saves bits outright' },
          { label: "No — but only because the data happens to compress better" },
        ],
        explain: (
          <>
            No — the same bits, laid out differently. What changes is whether the data stream can
            be read as one contiguous run, which is exactly what a vector instruction wants.
          </>
        ),
      },
      fig: 'same control bytes, moved ahead of the data',
      Visual: S.StreamSeparationPredict,
    },
    {
      title: 'Branches against bits, together',
      body: (
        <>
          The two numbers, side by side, don't fall in the same order. Frame of reference costs
          more bits than plain varint on this list, for a tiny fraction of the branches; patching
          recovers the bits without giving back any of that branch count.
        </>
      ),
      duration: 5.2,
      fig: 'measured: bits per id and branches per id, five schemes',
      takeaway: "The fastest decoder here has the fewest branches a value's own content can force — not the fewest bits.",
      Visual: S.BitsVsBranches,
    },
    {
      title: 'Where this is used',
      body: (
        <>
          A search engine's own postings format: fixed blocks of a hundred and twenty eight, one
          kind of block patched and another kind not. A columnar file format's two separately
          named encodings: delta plus bit-packing, and a run-length and bit-packing hybrid — each
          read from that format's own current specification.
        </>
      ),
      duration: 4.6,
      fig: 'two real formats, each read from its own documentation',
      Visual: S.Adoption,
    },
    {
      title: 'Recap',
      body: (
        <>
          The fastest decoder here was never the smallest one; it was the one with the fewest
          decisions a value's own content could force. The previous topic's plain sorted
          container turns out to be exactly this topic's own starting point — and it was
          compressible in exactly this way all along.
        </>
      ),
      duration: 4.2,
      fig: 'fewest branches, not fewest bits, wins the decode',
      Visual: S.Recap,
    },
  ],
};

export default reel;
