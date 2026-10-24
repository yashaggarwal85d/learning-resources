import type { Reel } from '../../../../../reels/types';
import * as S from './scenes';

// A full page doesn't reject or overwrite a new entry; it splits in two
// and hands a new key up. High fanout is exactly why that keeps the tree
// only a few levels deep, even at a huge record count. Packing a page
// less than completely full on purpose smooths out how often it has to
// split again, and a separator key only needs the shortest piece that
// still tells two sides apart.
const reel: Reel = {
  steps: [
    {
      title: "A leaf page holds only a handful of entries before it's full, say seven. Insert one more into a full page. What happens?",
      body: (
        <>
          A full leaf page, one more entry arriving.
        </>
      ),
      duration: 2.8,
      predict: {
        options: [
          { label: "It's simply rejected, the new entry has nowhere to go" },
          { label: 'It silently overwrites the oldest entry to make room' },
          { label: 'It splits into two pages, pushing a new key up into its parent', correct: true },
        ],
        explain: (
          <>
            It splits. A new separator key gets pushed up to the parent.
          </>
        ),
      },
      Visual: S.SplitPredict,
    },
    {
      title: 'Measured: inserting past a full page genuinely allocated a new page and pushed a real separator key up into a new root; every original key is still found afterward',
      body: (
        <>
          The real split, one page becoming two.
        </>
      ),
      duration: 3.0,
      takeaway: "A full page doesn't reject or overwrite a new entry; it splits in two and hands a new key up.",
      Visual: S.SplitReveal,
    },
    {
      title: "Keep inserting records, into the thousands. Does the tree's own depth grow about as fast as the record count, or much slower?",
      body: (
        <>
          The same tree, record count climbing.
        </>
      ),
      duration: 2.8,
      predict: {
        options: [
          { label: 'About as fast, so a huge table means a huge number of levels' },
          { label: 'Much slower; a high enough fanout keeps the tree only a few levels deep', correct: true },
          { label: 'Depth never changes once the tree has a root' },
        ],
        explain: (
          <>
            Much slower. High fanout keeps it only a few levels deep.
          </>
        ),
      },
      Visual: S.DepthPredict,
    },
    {
      title: "Measured: after thousands of inserts, the tree's own depth genuinely stayed within a handful of levels, with every record still found correctly",
      body: (
        <>
          The real, measured depth, still only a few levels.
        </>
      ),
      duration: 3.0,
      takeaway: 'High fanout is why a lookup touches only a few pages, even at billions of records.',
      Visual: S.DepthReveal,
    },
    {
      title: 'Two trees get the identical sequence of inserts. One packs each page less than completely full before its next split; the other packs pages fuller. Which one ends up splitting more times overall?',
      body: (
        <>
          Two trees, the same inserts, different packing.
        </>
      ),
      duration: 2.8,
      predict: {
        options: [
          { label: 'The one packed less full, since each split leaves less spare room before the next insert forces another one', correct: true },
          { label: "The one packed fuller, since it's always closer to overflowing" },
          { label: 'Exactly the same number of times either way' },
        ],
        explain: (
          <>
            The one packed less full splits more; it leaves less slack.
          </>
        ),
      },
      Visual: S.FillFactorPredict,
    },
    {
      title: 'Measured: packing pages less full genuinely caused more splits over the identical insert sequence than packing them fuller did',
      body: (
        <>
          The real, measured split counts, side by side.
        </>
      ),
      duration: 3.0,
      takeaway: 'Packing a page less than completely full on purpose smooths out how often it has to split again.',
      Visual: S.FillFactorReveal,
    },
    {
      title: "A split's new separator key only has to tell two sides apart, not describe either key in full. Can it genuinely take less storage than a full copy of the key, and still route every search correctly?",
      body: (
        <>
          A full key beside a shortened separator.
        </>
      ),
      duration: 2.8,
      predict: {
        options: [
          { label: 'No, a separator always needs the full key to compare correctly' },
          { label: 'Yes, a shorter separator can route identically, as long as it still carries the first real difference', correct: true },
          { label: "Only if the two sides' keys happen to already be identical" },
        ],
        explain: (
          <>
            Yes. Keeping the first real difference is enough to route.
          </>
        ),
      },
      Visual: S.TruncationPredict,
    },
    {
      title: 'Measured: a separator built from only the first differing part of the key genuinely took fewer bytes than a full copy, yet routed every test key exactly like the full one',
      body: (
        <>
          The real, measured byte counts, shortened versus full.
        </>
      ),
      duration: 3.0,
      takeaway: 'Keeping only the shortest piece of a key that still tells two sides apart shrinks separator keys for free.',
      Visual: S.TruncationReveal,
    },
    {
      title: "PostgreSQL's own nbtree README names exactly why it bothers with this directly: what does it say the goal of suffix truncation actually is?",
      body: (
        <>
          The real system's own words on suffix truncation, shown directly.
        </>
      ),
      duration: 2.8,
      Visual: S.NbtreeReveal,
    },
    {
      title: 'Recap: what fanout buys, and what keeps it cheap',
      body: (
        <>
          A full page doesn't reject a new entry, it splits in two and pushes a new key up; high fanout is exactly why that keeps the tree only a few levels deep, even at a huge record count. Packing a page less than completely full on purpose smooths out how often it has to split again, and a separator key only needs the shortest piece that still tells two sides apart — exactly what PostgreSQL's own nbtree does to improve fanout further still.
        </>
      ),
      duration: 3.0,
      Visual: S.Recap,
    },
  ],
};

export default reel;
