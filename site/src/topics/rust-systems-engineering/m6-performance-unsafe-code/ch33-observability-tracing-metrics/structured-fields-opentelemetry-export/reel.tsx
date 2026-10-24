import type { Reel } from '../../../../../reels/types';
import * as S from './scenes';

// A structured field sums exactly, every time, no matter how its own
// event is worded; a formatted sentence can silently lose the
// identical value the moment it is phrased differently; and a real,
// specified format like traceparent survives being built by one
// program and parsed by a completely different one, exactly.
const reel: Reel = {
  steps: [
    {
      title: "Three real events each carry a real, structured attempt field (1, 2, 3) alongside their own differently-worded, rendered message. Does summing the structured field directly give the real, correct total?",
      body: (
        <>
          Three real events, three worded differently.
        </>
      ),
      duration: 2.8,
      predict: {
        options: [
          { label: 'No, a structured field is still just text underneath' },
          { label: 'Yes, genuinely; it is a typed value, summed directly', correct: true },
          { label: 'Only if every message is worded identically' },
        ],
        explain: (
          <>
            Yes. The typed field sums exactly.
          </>
        ),
      },
      Visual: S.StructuredPredict,
    },
    {
      title: "Measured: summing the real, structured attempt field across all three real events gives exactly six, the real, correct total, regardless of how differently each event's own message happens to be worded",
      body: (
        <>
          The real, structured sum, checked directly.
        </>
      ),
      duration: 3.0,
      Visual: S.StructuredReveal,
    },
    {
      title: "The identical total is attempted again, this time recovered only from each event's own rendered, formatted message, by pulling out the first run of digits found in it. Does that give the identical, correct total too?",
      body: (
        <>
          The same total, pulled from the text instead.
        </>
      ),
      duration: 2.8,
      predict: {
        options: [
          { label: 'Yes, the numbers are right there in the text' },
          { label: 'No, genuinely; one real message spells its number out', correct: true },
          { label: 'Only if the messages are parsed in the wrong order' },
        ],
        explain: (
          <>
            No. One message spells its number out.
          </>
        ),
      },
      Visual: S.FormattedPredict,
    },
    {
      title: "Measured: the identical total, recovered only from each event's own rendered message, genuinely comes out to three, not six, since one real message spells its own number out as a word rather than a digit",
      body: (
        <>
          The same total, genuinely wrong this time.
        </>
      ),
      duration: 3.0,
      takeaway: "A formatted sentence's own text is not a reliable source for a value a structured field already holds exactly.",
      Visual: S.FormattedReveal,
    },
    {
      title: "A real W3C Trace Context traceparent header is built from a real trace id, a real span id, and a real sampled flag, then parsed back. Does it round-trip exactly? Does a real, malformed header get rejected instead of guessed at?",
      body: (
        <>
          One real header, built then handed to a parser.
        </>
      ),
      duration: 2.8,
      predict: {
        options: [
          { label: 'It round-trips, but a malformed header is still accepted' },
          { label: 'Neither round-trips nor rejects correctly' },
          { label: 'It round-trips exactly, and the malformed one is rejected', correct: true },
        ],
        explain: (
          <>
            It round-trips exactly, and the bad one is rejected.
          </>
        ),
      },
      Visual: S.TraceContextPredict,
    },
    {
      title: "Measured: the real, formatted traceparent header, parsed back, genuinely recovers the identical trace id, span id, and sampled flag it was built from, and a real, malformed header is genuinely rejected rather than silently guessed at",
      body: (
        <>
          The real header, parsed both ways.
        </>
      ),
      duration: 3.0,
      takeaway: 'A structured, specified format survives being handed to a completely different, independent parser.',
      Visual: S.TraceContextReveal,
    },
    {
      title: "The W3C Trace Context specification and the tracing crate's own documentation state this directly: a trace id and a parent id are real, specific byte values joined into one real, specified format; a span or event's own fields are key-value data, not unstructured text. Do this topic's own three measured comparisons model exactly the rule both sources describe?",
      body: (
        <>
          Both sources' own words on this exact rule.
        </>
      ),
      duration: 2.8,
      takeaway: 'A structured field survives being queried later; a sentence written for a human was never built to survive that.',
      Visual: S.DocsReveal,
    },
    {
      title: 'Recap: a field that survives being queried',
      body: (
        <>
          A structured field sums exactly, every time, no matter how its own event is worded; a formatted sentence can silently lose the identical value the moment it is phrased differently; and a specified format like traceparent survives being built by one program and parsed by a completely different one, exactly.
        </>
      ),
      duration: 3.0,
      Visual: S.Recap,
    },
  ],
};

export default reel;
