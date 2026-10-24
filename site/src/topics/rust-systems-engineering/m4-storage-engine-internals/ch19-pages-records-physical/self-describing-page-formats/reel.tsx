import type { Reel } from '../../../../../reels/types';
import * as S from './scenes';

// A real page's checksum genuinely catches a corrupted byte anywhere in its
// body, but a checksum alone can't catch a deliberate, consistent format
// change -- only a magic number check does. A page's own byte order has to
// be explicit and enforced, matching PostgreSQL's own self-describing header
// and its line pointers' own permanence guarantee.
const reel: Reel = {
  steps: [
    {
      title: "Build a real, fixed-size page as a byte buffer. It has its own header: a magic number, a format version, a checksum, a page LSN. Does a corrupted byte anywhere in that page actually get caught, or does the page just silently hand back the wrong data?",
      body: (
        <>
          A real page, with one byte deliberately flipped somewhere in its body.
        </>
      ),
      duration: 2.8,
      predict: {
        options: [
          { label: "It's silently handed back as if nothing happened" },
          { label: "The page's own checksum genuinely catches it, no matter where the corruption is", correct: true },
          { label: "It's only caught if the corruption happens to land inside the header itself" },
        ],
        explain: (
          <>
            It's caught. The checksum covers the whole page, not just the header.
          </>
        ),
      },
      Visual: S.CorruptionPredict,
    },
    {
      title: "Measured: an untouched page's own checksum validates cleanly, and a single corrupted byte anywhere in its body genuinely invalidates that same checksum",
      body: (
        <>
          The real, measured round-trip, then the real, measured corruption.
        </>
      ),
      duration: 3.0,
      Visual: S.CorruptionReveal,
    },
    {
      title: "Now instead of corrupting a byte, change the page's own magic number to something else, and recompute the checksum over those new bytes. Does the checksum alone catch that the format itself has changed?",
      body: (
        <>
          A page with its magic number changed, checksum recomputed over the new bytes.
        </>
      ),
      duration: 2.8,
      predict: {
        options: [
          { label: 'Yes, the checksum still catches it, since it covers the whole page' },
          { label: 'No, a checksum recomputed over consistent new bytes still validates; only the magic number check catches this', correct: true },
          { label: 'It depends on which byte of the magic number changed' },
        ],
        explain: (
          <>
            No, it doesn't. Only the magic number check catches this one.
          </>
        ),
      },
      Visual: S.MagicPredict,
    },
    {
      title: 'Measured: the checksum, recomputed over the new bytes, still validated cleanly; only checking the magic number itself caught that the format had changed',
      body: (
        <>
          The real, measured pair: checksum valid, format invalid.
        </>
      ),
      duration: 3.0,
      takeaway: 'A checksum catches damage to bytes that were supposed to stay the same; a magic number catches a deliberate change.',
      Visual: S.MagicReveal,
    },
    {
      title: "The page's own multi-byte fields, like its LSN, are encoded in a specific byte order, chosen on purpose. Read those same raw bytes back in the opposite byte order. Does it matter, or is a byte order a byte order?",
      body: (
        <>
          The same raw bytes, read two different ways.
        </>
      ),
      duration: 2.8,
      predict: {
        options: [
          { label: "It doesn't matter; any consistent byte order reads the same value back" },
          { label: 'It matters completely; the wrong byte order gives a different, wrong value', correct: true },
          { label: 'It only matters for values large enough to need every byte' },
        ],
        explain: (
          <>
            It matters completely. The same bytes, a genuinely different value.
          </>
        ),
      },
      Visual: S.EndiannessPredict,
    },
    {
      title: 'Measured: the same raw bytes, read in the chosen byte order, gave back the exact original value; read in the opposite byte order, they genuinely gave back a different value',
      body: (
        <>
          The real, measured pair of reads.
        </>
      ),
      duration: 3.0,
      takeaway: 'A page byte order has to be explicit and enforced, not left to whatever platform happens to use.',
      Visual: S.EndiannessReveal,
    },
    {
      title: "PostgreSQL's own documentation describes what its page header's very first field actually tracks. What does it say?",
      body: (
        <>
          The documentation's own description of the header's first field.
        </>
      ),
      duration: 2.8,
      predict: {
        options: [
          { label: "The page's own total size, for a quick sanity check" },
          { label: 'The most recent log entry related to that page', correct: true },
          { label: 'The identifier of the process that last wrote the page' },
        ],
        explain: (
          <>
            The most recent log entry. The header ties the page to the log.
          </>
        ),
      },
      Visual: S.FieldPredict,
    },
    {
      title: "The documentation's own words: the first field tracks the most recent log entry related to this page, and the second field holds the page's own checksum, when checksums are enabled",
      body: (
        <>
          The documentation, quoted directly.
        </>
      ),
      duration: 2.8,
      Visual: S.FieldReveal,
    },
    {
      title: "The same documentation also says something stronger about an item identifier's own index inside a page: it's never moved until freed, so it can be used to reference an item on a long-term basis, even while the item itself moves around during compaction. That's the whole reason a slot and a physical offset are two different things",
      body: (
        <>
          The documentation's own permanence guarantee, shown directly.
        </>
      ),
      duration: 3.0,
      takeaway: 'A page own line pointers let an item identity outlive it being physically moved around that page.',
      Visual: S.PermanenceReveal,
    },
    {
      title: 'Recap: a page that can tell its own story',
      body: (
        <>
          A real page's checksum genuinely catches a corrupted byte anywhere in its body, but a checksum alone can't catch a deliberate, consistent format change; only a magic number check does. A page's own byte order has to be explicit and enforced, not assumed. And the documentation describes exactly this: a self-describing header, and an item identifier that outlives the item being moved.
        </>
      ),
      duration: 3.0,
      Visual: S.Recap,
    },
  ],
};

export default reel;
