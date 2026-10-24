import type { Reel } from '../../../../../reels/types';
import * as S from './scenes';

// Real results on this sandbox's own PostgreSQL cluster (examples.py, pg_buffercache and
// pg_statio): a real buffer's own usage counter measured rising to its documented cap; a real,
// much-bigger-than-the-pool table measured leaving only a small, bounded footprint resident
// after a full scan; a real dirtied buffer's own flag measured flipping clean the moment a real
// checkpoint runs; a warm table's own scan measured as pure buffer hits. This sandbox also runs
// a genuine second cluster on PostgreSQL eighteen, where io_method's real, measured I/O is
// confirmed directly rather than only named from documentation. Double caching and O_DIRECT are
// sourced from the Linux manual page rather than run, since neither cluster here uses O_DIRECT.
// No literal digits anywhere (the duration numbers below are exempt).
const reel: Reel = {
  steps: [
    {
      title: "Hook: a page on disk is useless if every access has to fetch it from disk — what's the cache in front of it?",
      body: (
        <>
          The last topic opened the page itself: a header, a slot array, real rows. But reading
          that page from disk on every single access would make every query slow. What sits
          between a query and the disk, deciding what never has to be read twice?
        </>
      ),
      duration: 4.8,
      fig: "a page sitting on disk is only useful if an engine doesn't have to read it from disk every time. What sits between a query and the disk?",
      Visual: S.Hook,
    },
    {
      title: "Reveal: the buffer pool's own clock sweep, read directly off a real cluster",
      body: (
        <>
          A fixed-size pool of buffers, read directly off this sandbox's own cluster rather than
          diagrammed. A circularly moving hand sweeps past every buffer, and a counter on each
          one — raised every time it's pinned — decides which one actually gets reused.
        </>
      ),
      duration: 4.8,
      fig: "a buffer's own usage counter, read directly off this sandbox's cluster — what actually decides which buffer gets reused?",
      Visual: S.RevealClockSweep,
    },
    {
      title: "Reveal: repeated access raises a real buffer's usage count to its own cap",
      body: (
        <>
          The exact same small table, scanned several more times for real. Its usage counter
          keeps rising with every touch — until it hits a small, fixed ceiling and simply stops
          there, no matter how many more times the table gets scanned.
        </>
      ),
      duration: 4.8,
      fig: "the same small table, scanned six more times for real — does its usage count keep climbing, or does it stop?",
      takeaway: "A buffer's usage counter only climbs to a small fixed cap, no matter how many times the page is touched.",
      Visual: S.RevealUsageCountCap,
    },
    {
      title: "Predict: does a sequential scan bigger than the whole buffer pool evict most of it?",
      body: (
        <>
          A sequential scan over a table far bigger than the whole buffer pool touches a huge
          number of pages, each exactly once. Does the ordinary clock sweep have to evict most
          of the pool to make room for a scan that size?
        </>
      ),
      duration: 2.8,
      fig: "a sequential scan bigger than the whole buffer pool touches thousands of pages, once each — does the ordinary clock sweep evict most of the pool to make room?",
      predict: {
        options: [
          { label: 'Yes — every one of those pages still has to occupy a real buffer while read' },
          { label: 'No — a small, separate ring of buffers is reused for the whole scan instead', correct: true },
        ],
        explain: (
          <>
            No. A page touched only by a big, once-only scan is unlikely to be needed again
            soon, so instead of running the normal clock sweep and blowing out the entire pool, a
            small ring of buffers is allocated and reused for the whole scan.
          </>
        ),
      },
      Visual: S.PredictRingBounded,
    },
    {
      title: "Reveal: a real, bigger-than-the-pool table's measured footprint, ring-bounded",
      body: (
        <>
          A real table, built and scanned for real, with far more pages than the whole buffer
          pool could ever hold at once. Measured directly after the scan finishes, only a small,
          bounded slice of it is actually resident.
        </>
      ),
      duration: 4.8,
      fig: "a table built and scanned for real, far bigger than the whole buffer pool — how much of it actually ends up resident?",
      takeaway: "A table far bigger than the whole pool left only a small, bounded ring resident after a full scan.",
      Visual: S.RevealRingFootprint,
    },
    {
      title: 'Reveal: a dirtied buffer, read directly, cleaned by a real checkpoint',
      body: (
        <>
          A page just updated for real, its own dirty flag read directly off the buffer that
          holds it. True, until a real checkpoint actually runs and writes it out — then read
          again, the exact same flag comes back false.
        </>
      ),
      duration: 4.8,
      fig: "a page just updated for real — is it marked dirty, and does a real checkpoint actually clean it?",
      takeaway: "A buffer's own dirty flag, read directly, flips from true to false the moment a real checkpoint writes it out.",
      Visual: S.RevealDirtyCheckpoint,
    },
    {
      title: 'Reveal: double caching, and the flag that bypasses it',
      body: (
        <>
          An engine's own buffer pool normally sits on top of the operating system's page cache,
          holding the exact same bytes in both places at once. One Linux flag exists specifically
          to try to avoid that duplication — at the cost of the engine doing its own caching work.
        </>
      ),
      duration: 4.8,
      fig: "the same page, cached twice — once by the OS, once by the engine — what does one Linux flag trade away to stop that?",
      takeaway: "An engine's buffer pool normally caches the same bytes the OS already cached; one flag trades that convenience away.",
      Visual: S.RevealDoubleCaching,
    },
    {
      title: "Reveal: a genuinely newer cluster's own async I/O, measured for real",
      body: (
        <>
          This sandbox doesn't only run one cluster. Its second one, a genuinely newer release,
          really does run the documented async I/O setting — and a real scan against it produces
          real, counted reads and hits under exactly that strategy, not just a name in a doc.
        </>
      ),
      duration: 4.8,
      fig: "this sandbox's own second cluster, a genuinely newer release — is its async I/O setting just a name in the docs, or does it show up as real, measured I/O?",
      takeaway: "A genuinely newer, second cluster here really runs its async I/O setting, measured on a real scan, not named.",
      Visual: S.RevealPg18Aio,
    },
    {
      title: 'Recap',
      body: (
        <>
          A buffer's own usage counter, capped by a real clock sweep. A huge scan, ring-bounded
          and measured, not blowing out the pool. A dirty page, cleaned by a real checkpoint.
          Double caching, and the flag that bypasses it. And a genuinely newer, second cluster's
          own async I/O, measured for real rather than only named.
        </>
      ),
      duration: 4.8,
      fig: "a buffer's own usage count, a ring-bounded scan, a dirty page cleaned by a checkpoint, double caching, and a second cluster's own async I/O, all measured directly",
      Visual: S.Recap,
    },
    {
      title: 'Prove it',
      body: (
        <>
          A reporting job runs a huge sequential scan over a table far bigger than the buffer
          pool, right before a dashboard query runs its own huge scan over a different, equally
          big table. Does the dashboard query's scan get slowed down by the reporting job having
          evicted the pool first, and why?
        </>
      ),
      duration: 2.8,
      fig: "a reporting job's huge scan runs right before a dashboard query's own huge scan — does the dashboard query get slowed down by the reporting job having evicted the pool first?",
      predict: {
        options: [
          { label: 'Yes — the reporting job already used up the buffer pool scanning its own table' },
          { label: "No — each big scan uses its own small ring, so neither one evicts the pool for the other", correct: true },
        ],
        explain: (
          <>
            No, the dashboard query isn't slowed down by this. Each big, once-only scan reuses
            its own small ring of buffers rather than claiming space across the whole pool, so
            the reporting job's own scan never touches the rest of the buffer pool at all — there
            is nothing there for the dashboard query to find evicted.
          </>
        ),
      },
      Visual: S.ProveIt,
    },
  ],
};

export default reel;
