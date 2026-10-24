import type { Reel } from '../../../../../reels/types';
import * as S from './scenes';

// A real, bounded queue behind a real Axum edge rejects a request at
// the boundary once full, and that request never reaches the worker
// pool or storage; a real shutdown coordinator closes the door to new
// work immediately while draining whatever had already gotten in.
const reel: Reel = {
  steps: [
    {
      title: 'A real, bounded queue sits behind a real Axum edge. Three real requests arrive quickly, faster than the single worker can finish its first storage write. Does the third one get queued like the first two?',
      body: (
        <>
          Three real requests, one bounded queue.
        </>
      ),
      duration: 2.8,
      predict: {
        options: [
          { label: 'Yes, the queue just grows to fit whatever arrives' },
          { label: 'No, genuinely; the third is rejected once the queue is full', correct: true },
          { label: 'Only if the requests arrive in a different order' },
        ],
        explain: (
          <>
            No. The queue is full, so it rejects.
          </>
        ),
      },
      Visual: S.BoundaryPredict,
    },
    {
      title: 'Measured: the first two real requests are genuinely queued, and the third is genuinely rejected the instant it finds the bounded queue already full, before the worker pool or storage is ever involved',
      body: (
        <>
          The boundary, checked against all three.
        </>
      ),
      duration: 3.0,
      Visual: S.BoundaryReveal,
    },
    {
      title: 'Does that rejected third request show up in the real storage layer once the worker has finished processing everything it actually received?',
      body: (
        <>
          Storage, checked once the worker finishes.
        </>
      ),
      duration: 2.8,
      predict: {
        options: [
          { label: 'Yes, it was submitted, so it eventually gets written' },
          { label: 'No, genuinely; a rejected request never reaches storage', correct: true },
          { label: 'Only if storage is checked too soon' },
        ],
        explain: (
          <>
            No. A rejection never reaches storage.
          </>
        ),
      },
      Visual: S.StoragePredict,
    },
    {
      title: 'Measured: once the worker finishes, the real storage layer holds exactly the first two requests and nothing else; the rejected third request never reached it, since the boundary that rejected it sits entirely in front of the worker pool and storage',
      body: (
        <>
          Storage, genuinely holding only two.
        </>
      ),
      duration: 3.0,
      takeaway: 'A request rejected at one real boundary genuinely never touches any real layer behind it.',
      Visual: S.StorageReveal,
    },
    {
      title: 'A real shutdown coordinator stops a second, independent instance of this service from accepting new work. Two real requests were already queued first. Does that queued work get finished, or dropped along with the shutdown?',
      body: (
        <>
          Shutdown begins; two requests already in.
        </>
      ),
      duration: 2.8,
      predict: {
        options: [
          { label: 'Dropped, since the service is shutting down' },
          { label: 'Finished, genuinely; the queue drains before it stops', correct: true },
          { label: 'Only if the requests happen to be queued slowly enough' },
        ],
        explain: (
          <>
            Finished. The queue drains first.
          </>
        ),
      },
      Visual: S.ShutdownPredict,
    },
    {
      title: 'Measured: once shutdown begins, a real new request is genuinely rejected immediately, while the two real requests already queued are genuinely drained all the way to storage before the worker pool itself stops',
      body: (
        <>
          Shutdown, measured both ways at once.
        </>
      ),
      duration: 3.0,
      takeaway: 'A real shutdown coordinator closes the door to new work immediately, but finishes draining whatever had already gotten in.',
      Visual: S.ShutdownReveal,
    },
    {
      title: "The tokio::sync::mpsc and tokio-util CancellationToken documentation each state this directly: a bounded channel at capacity rejects a send and provides backpressure; a cancellation token signals a real request to one or more tasks. Does this topic's own two measured scenarios model exactly the mechanisms both sources describe?",
      body: (
        <>
          mpsc and CancellationToken's own words.
        </>
      ),
      duration: 2.8,
      takeaway: "A service's topology is only as strong as its narrowest boundary, the one place a rejection is allowed to happen.",
      Visual: S.DocsReveal,
    },
    {
      title: 'Recap: a topology with real boundaries',
      body: (
        <>
          A request rejected at a real, bounded boundary never reaches the layers behind it; the same boundary, closed deliberately during a real shutdown, still lets whatever had already gotten through finish, rather than dropping it; together, that is what makes a layered service's own topology real rather than only drawn on a diagram.
        </>
      ),
      duration: 3.0,
      Visual: S.Recap,
    },
  ],
};

export default reel;
