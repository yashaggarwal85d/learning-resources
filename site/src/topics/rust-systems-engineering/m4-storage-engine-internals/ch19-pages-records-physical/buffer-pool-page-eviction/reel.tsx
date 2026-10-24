import type { Reel } from '../../../../../reels/types';
import * as S from './scenes';

// A pinned frame is never evicted, a dirty frame is always written back
// before its frame is reused, and a real CLOCK sweep genuinely favors the
// frame touched more recently. Unlike mmap, which hands control of when
// a dirty page is flushed to the OS, an explicit buffer pool decides
// that for itself.
const reel: Reel = {
  steps: [
    {
      title: 'Build a real buffer pool: a frame table, a pin count per frame, a dirty bit per frame. Pin every single frame in the pool, then try to load one more page than the pool can hold. What happens?',
      body: (
        <>
          A buffer pool, every frame pinned, one more page arriving.
        </>
      ),
      duration: 2.8,
      predict: {
        options: [
          { label: 'The pool evicts whichever frame was loaded first, pinned or not' },
          { label: 'The pool genuinely refuses; there is nothing left that can be evicted', correct: true },
          { label: "The pool silently grows past its own stated capacity" },
        ],
        explain: (
          <>
            It genuinely refuses. A pinned frame is never a candidate.
          </>
        ),
      },
      Visual: S.PinPredict,
    },
    {
      title: 'Measured: with every frame genuinely pinned, loading one more page than the pool can hold was rejected outright; nothing was ever evicted',
      body: (
        <>
          The real, measured rejection.
        </>
      ),
      duration: 3.0,
      Visual: S.PinReveal,
    },
    {
      title: "Unpin the frames, and load a new page. One of them gets evicted to make room. If the evicted frame happened to be dirty, does its own data get written back before the frame is handed to the new page?",
      body: (
        <>
          A dirty frame, about to be evicted and reused.
        </>
      ),
      duration: 2.8,
      predict: {
        options: [
          { label: 'No, the old dirty bytes are simply discarded along with the frame' },
          { label: 'Yes, the dirty page is genuinely written back first, before the frame is reused', correct: true },
          { label: 'Only if the pool happens to be idle at that moment' },
        ],
        explain: (
          <>
            Written back first, every time. Nothing dirty is ever just dropped.
          </>
        ),
      },
      Visual: S.DirtyPredict,
    },
    {
      title: "Measured: the dirty frame's own data was genuinely written back before that same frame was reused for the new page",
      body: (
        <>
          The real, measured write-back, then the real, measured reuse.
        </>
      ),
      duration: 3.0,
      takeaway: "A dirty frame's own data is never simply discarded; it's written back first, before its frame is reused.",
      Visual: S.DirtyReveal,
    },
    {
      title: 'Now give the eviction policy, real CLOCK, a real choice: two unpinned frames, one re-accessed since the last sweep, one genuinely untouched. Load one more page. Does CLOCK evict the one just re-accessed, or the one left alone?',
      body: (
        <>
          Two unpinned frames, one just touched, one untouched.
        </>
      ),
      duration: 2.8,
      predict: {
        options: [
          { label: 'It evicts whichever one happens to be first in the frame table' },
          { label: 'It genuinely evicts the untouched one, giving the re-accessed one a second chance', correct: true },
          { label: 'It evicts the re-accessed one, since access makes it a bigger target' },
        ],
        explain: (
          <>
            The untouched one goes. Being touched again buys a real second chance.
          </>
        ),
      },
      Visual: S.ClockPredict,
    },
    {
      title: 'Measured: CLOCK genuinely evicted the untouched frame, not the one just re-accessed since the last sweep',
      body: (
        <>
          The real, measured eviction, naming which frame survived.
        </>
      ),
      duration: 3.0,
      takeaway: "CLOCK's own reference bit gives a touched frame a real second chance; an untouched one doesn't get one.",
      Visual: S.ClockReveal,
    },
    {
      title: "PostgreSQL's own pg_buffercache names exactly these fields on a real shared buffer: whether it's dirty, its own clock-sweep count, and how many backends are pinning it right now. What's that third one actually for?",
      body: (
        <>
          The pg_buffercache field names, shown directly.
        </>
      ),
      duration: 2.8,
      predict: {
        options: [
          { label: "It's just a diagnostic count, with no effect on eviction" },
          { label: "It's the same pin count this topic's own pool uses to protect a frame from eviction", correct: true },
          { label: "It only matters once a frame's dirty bit is set" },
        ],
        explain: (
          <>
            The same pin count. A frame being pinned right now is why it survives.
          </>
        ),
      },
      Visual: S.PgBufferPredict,
    },
    {
      title: "PostgreSQL's own words: pinning_backends is the number of backends pinning this buffer, and pg_buffercache_evict_relation only ever evicts a buffer that isn't pinned by anyone",
      body: (
        <>
          The documentation's own words, shown directly.
        </>
      ),
      duration: 2.8,
      Visual: S.PgBufferReveal,
    },
    {
      title: "The earlier chapter's own mmap approach hands the question of when a dirty page gets written back to the OS entirely. This chapter's own buffer pool never does: a real paper on mmap-based databases names the real difference directly",
      body: (
        <>
          This chapter's explicit dirty bit, next to the paper's own words on mmap's OS-controlled flush.
        </>
      ),
      duration: 3.0,
      takeaway: "An explicit buffer pool decides for itself when a dirty page is written back; mmap hands that to the OS.",
      Visual: S.MmapContrastReveal,
    },
    {
      title: 'Recap: who decides, and when',
      body: (
        <>
          A pinned frame is never evicted, a dirty frame is always written back before its frame is reused, and a real CLOCK sweep genuinely favors the frame touched more recently. PostgreSQL's own pg_buffercache tracks exactly these three things on every real shared buffer. And unlike mmap, which hands control of when a dirty page is flushed to the OS, an explicit buffer pool decides that for itself.
        </>
      ),
      duration: 3.0,
      Visual: S.Recap,
    },
  ],
};

export default reel;
