import type { Reel } from '../../../../../reels/types';
import * as S from './scenes';

// Axum has no middleware system of its own; it is tower::Service and Layer all
// the way down. A real extractor, real shared state, a real middleware::from_fn
// layer, and a real tower-http layer all compose through that same abstraction
// inside a real running server.
const reel: Reel = {
  steps: [
    {
      title: 'The last topic showed that Service and Layer are the whole backpressure abstraction. Axum is the framework most of this ecosystem actually ships with. Does Axum build its own separate middleware system on top of that, or does it just reuse Service and Layer directly?',
      body: (
        <>
          Axum's own router, with a question mark over its own middleware.
        </>
      ),
      duration: 2.8,
      predict: {
        options: [
          { label: 'It builds its own system, tailored to HTTP specifically' },
          { label: "It has no middleware system of its own; it's Service all the way down", correct: true },
          { label: 'It uses Service only for simple cases, its own system otherwise' },
        ],
        explain: (
          <>
            No system of its own. Service and Layer, the whole way down.
          </>
        ),
      },
      Visual: S.FrameworkPredict,
    },
    {
      title: "Axum's own documentation says so plainly: Axum doesn't have its own middleware system; it uses tower::Service, and that's what gets it timeouts, tracing, compression, and authorization for free",
      body: (
        <>
          Axum's own documentation, quoted directly.
        </>
      ),
      duration: 2.8,
      Visual: S.FrameworkReveal,
    },
    {
      title: "Stand up a real, running Axum server with a route written in the newer /{param} syntax. Send a real request for a specific name through it. Does the handler actually receive that name, or does it need to parse the raw path itself?",
      body: (
        <>
          A real running server, a real request to a path with a name in it.
        </>
      ),
      duration: 2.8,
      predict: {
        options: [
          { label: 'The handler has to parse the raw path string itself' },
          { label: 'A real extractor hands the handler the parameter directly, already parsed', correct: true },
          { label: 'It only works if the parameter is the very last thing in the path' },
        ],
        explain: (
          <>
            Already parsed. The extractor does the work, not the handler.
          </>
        ),
      },
      Visual: S.ExtractPredict,
    },
    {
      title: 'Measured: a real request to a path with a name in it came back with that exact name, pulled out by a real extractor, not a hand-written parser',
      body: (
        <>
          A real, measured extraction, against a real running server.
        </>
      ),
      duration: 3.0,
      takeaway: 'An extractor is a type that pulls itself out of a request; the handler never touches the raw path.',
      Visual: S.ExtractReveal,
    },
    {
      title: "Give that same server a piece of state shared across every request, and send three real requests to a handler that reads and increments it. Does each request see a fresh copy, or does the state actually accumulate?",
      body: (
        <>
          Three requests arriving in sequence, one shared piece of state behind them.
        </>
      ),
      duration: 2.8,
      predict: {
        options: [
          { label: 'Each request sees a fresh copy, since every request gets its own task' },
          { label: 'The state genuinely accumulates across every real request, since it is shared', correct: true },
          { label: 'It only accumulates if the requests happen to land on the same worker' },
        ],
        explain: (
          <>
            Genuinely accumulates. One shared piece of state, three real requests.
          </>
        ),
      },
      Visual: S.StatePredict,
    },
    {
      title: 'Measured: three separate real requests came back with increasing values in a row, a real piece of shared state actually accumulating, not three fresh copies',
      body: (
        <>
          The real, measured sequence of increasing values.
        </>
      ),
      duration: 3.0,
      takeaway: 'Shared state in a real Axum server is exactly that, shared; three real requests prove it accumulates, not resets.',
      Visual: S.StateReveal,
    },
    {
      title: "Wrap that server in a real middleware::from_fn layer that touches every response, and separately, a real tower-http layer that cuts a handler off if it runs too long. Do both of those actually run against real requests, the same way any other Tower layer would?",
      body: (
        <>
          A from_fn layer and a tower-http layer, both wrapped around the same server.
        </>
      ),
      duration: 2.8,
      predict: {
        options: [
          { label: 'Only the tower-http one really runs; from_fn is just documentation sugar' },
          { label: 'Both genuinely run, against real requests, the same way any other layer composes', correct: true },
          { label: 'Only one of the two can be active on a given router at once' },
        ],
        explain: (
          <>
            Both genuinely run. Neither one is special-cased by the framework.
          </>
        ),
      },
      Visual: S.LayersPredict,
    },
    {
      title: 'Measured: a real middleware::from_fn layer genuinely modified a real response, and a real tower-http timeout genuinely cut off a handler that would have taken far longer, both running against real requests',
      body: (
        <>
          The real, measured results of both layers, shown together.
        </>
      ),
      duration: 3.0,
      takeaway: 'from_fn and the tower-http layers are ordinary Tower layers; a real Axum server runs both exactly as promised.',
      Visual: S.LayersReveal,
    },
    {
      title: 'None of this needed a separate thing to learn: the extractor, the shared state, the two layers, all of it is the same Service and Layer abstraction from the topic before this one, just running inside a real HTTP server',
      body: (
        <>
          The server, the extractor, state, and both layers, shown as one whole.
        </>
      ),
      duration: 2.8,
      Visual: S.LessonReveal,
    },
    {
      title: 'Recap: one abstraction, running inside a real server',
      body: (
        <>
          A real path-parameter route genuinely hands a handler its parameter, already extracted. Real shared state genuinely accumulates across real requests. A real middleware::from_fn layer and a real tower-http layer both genuinely ran against real requests, composed the same way any Tower layer composes. None of it needed a system of its own, exactly as Axum's own documentation says.
        </>
      ),
      duration: 3.0,
      Visual: S.Recap,
    },
  ],
};

export default reel;
