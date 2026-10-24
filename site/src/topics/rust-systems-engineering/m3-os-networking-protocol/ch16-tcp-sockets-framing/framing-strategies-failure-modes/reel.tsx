import type { Reel } from '../../../../../reels/types';
import * as S from './scenes';

// A capped length-prefixed frame decodes correctly and extracts without copying a
// single byte; an uncapped claim is rejected before any large buffer is ever
// allocated — the real denial-of-service vector a length prefix needs a cap to avoid.
// Each of the three framing strategies the syllabus names fails in its own distinct way.
const reel: Reel = {
  steps: [
    {
      title: 'Build a real length-prefixed frame decoder with an explicit 1024-byte cap. Send it a frame whose length prefix honestly claims a length of 1 GiB. What happens?',
      body: (
        <>
          A real decoder, a real frame whose claimed length is far over its own cap.
        </>
      ),
      duration: 2.8,
      predict: {
        options: [
          { label: "It decodes anyway, since the decoder trusts the length it's given" },
          { label: "It's rejected immediately, before any large buffer is allocated", correct: true },
          { label: 'It silently truncates the frame down to the cap' },
        ],
        explain: (
          <>
            Rejected immediately. The cap check runs before any allocation happens.
          </>
        ),
      },
      Visual: S.CapPredict,
    },
    {
      title: 'Measured: a frame claiming a length of 1 GiB was rejected immediately, no buffer anywhere near that claimed size was ever allocated to hold it',
      body: (
        <>
          A real, executed rejection, with no allocation anywhere near that size.
        </>
      ),
      duration: 3.0,
      Visual: S.CapReveal,
    },
    {
      title: "Now send a frame under the cap, and extract it with BytesMut::split_to. Does that extraction copy the payload's bytes into a new buffer, or not?",
      body: (
        <>
          A real decode, a real split_to call, the returned frame's own address checked.
        </>
      ),
      duration: 2.8,
      predict: {
        options: [
          { label: 'It copies, since the returned value is a separate, owned buffer' },
          { label: "It doesn't copy, the same underlying bytes, just split", correct: true },
          { label: 'It depends on how large the frame happens to be' },
        ],
        explain: (
          <>
            No copy. The returned frame shares the original buffer's own bytes.
          </>
        ),
      },
      Visual: S.SplitToPredict,
    },
    {
      title: "Measured: the extracted frame's own data pointer landed exactly where the payload started in the original buffer, not a fresh allocation, confirmed directly",
      body: (
        <>
          A real, measured pointer comparison, not an assumption from the API's docs.
        </>
      ),
      duration: 3.0,
      takeaway: 'split_to splits the buffer in place; it was never going to copy the bytes back to you.',
      Visual: S.SplitToReveal,
    },
    {
      title: "The codec documentation's own description names the Decoder trait's actual job. What does it say that job actually is?",
      body: (
        <>
          The documentation's own description of what a decoder is actually for.
        </>
      ),
      duration: 2.8,
      predict: {
        options: [
          { label: 'To read bytes directly off the network socket itself' },
          { label: 'To turn a sequence of bytes into a sequence of frames, with boundaries', correct: true },
          { label: "To encrypt and decrypt each frame's own contents" },
        ],
        explain: (
          <>
            Finding the boundaries. That's the whole job, nothing about sockets or crypto.
          </>
        ),
      },
      Visual: S.DecoderPredict,
    },
    {
      title: "The documentation's own words: the Decoder trait's job is to specify how sequences of bytes are turned into a sequence of frames, and to determine where the boundaries between frames are, exactly the problem a byte stream creates in the first place",
      body: (
        <>
          The codec documentation's own quote, shown directly.
        </>
      ),
      duration: 2.8,
      Visual: S.DecoderReveal,
    },
    {
      title: 'A length prefix needs a cap to be safe. What do delimiter-based framing and fixed-size framing each need instead, to avoid their own distinct failure modes?',
      body: (
        <>
          Three strategies, three different ways of turning bytes back into messages.
        </>
      ),
      duration: 2.8,
      predict: {
        options: [
          { label: 'Delimiter-based needs the same cap a length prefix does' },
          { label: 'Delimiter needs escaping, and a real scan; fixed-size wastes bandwidth', correct: true },
          { label: 'Fixed-size framing has no real failure mode at all' },
        ],
        explain: (
          <>
            Each has its own cost. None of the three is free of one.
          </>
        ),
      },
      Visual: S.StrategiesPredict,
    },
    {
      title: 'Each framing strategy fails differently: a length prefix without a cap is a denial-of-service vector, a delimiter needs escaping and a real scan to find it, and a fixed size wastes real bandwidth on anything smaller than it',
      body: (
        <>
          The three strategies and their three distinct costs, shown together.
        </>
      ),
      duration: 2.8,
      takeaway: "There's no framing strategy without a cost, only a choice of which one to pay.",
      Visual: S.StrategiesReveal,
    },
    {
      title: "A capped length prefix, extracted without copying: that's the shape every framing strategy in this chapter's own lab is actually built around",
      body: (
        <>
          The capped decoder and its zero-copy extraction, shown as one chosen pattern.
        </>
      ),
      duration: 2.8,
      takeaway: 'Cap the claim, then split the buffer in place: a length prefix done safely and cheaply.',
      Visual: S.PatternReveal,
    },
    {
      title: 'Recap: a cap that runs before allocation, and a split that never copies',
      body: (
        <>
          A length-prefixed frame under its own cap decodes correctly, and split_to extracts it without copying a single byte. A frame claiming a length over the cap is rejected before any buffer that large is ever allocated, which is the real denial-of-service vector an uncapped length prefix creates. And each of the three framing strategies fails in its own distinct way, so the real choice is which cost a protocol can afford.
        </>
      ),
      duration: 3.0,
      Visual: S.Recap,
    },
  ],
};

export default reel;
