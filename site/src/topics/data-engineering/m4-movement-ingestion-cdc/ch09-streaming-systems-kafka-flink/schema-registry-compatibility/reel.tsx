import type { Reel } from '../../../../../reels/types';
import * as S from './scenes';

// Real results from this topic's own examples.py: a real Avro-style backward/forward/full/
// transitive compatibility checker, a real Protobuf field-number reuse check, a real wire-format
// encode/decode round trip with a schema id, and a real subject-naming-strategy comparison. No
// literal digits anywhere below (duration numbers are exempt); the real values live in scenes.tsx.
const reel: Reel = {
  steps: [
    {
      title: 'Hook: a field removed, a dashboard broken days later',
      body: (
        <>
          A producer removes a field it believes is unused. Under a compatibility setting that
          silently allows it, every consumer still reading that field starts seeing nulls — until
          a dashboard breaks, days later.
        </>
      ),
      duration: 4.8,
      fig: 'a field quietly dropped, a dashboard broken three days later',
      Visual: S.Hook,
    },
    {
      title: 'Setup: a schema registry is the contract',
      body: (
        <>
          A replay trusts that a record's fields still mean what they meant when first written.
          A schema registry is supposed to guarantee exactly that, across every producer and
          consumer ever deployed against a topic.
        </>
      ),
      duration: 4.8,
      fig: "a record's fields still mean what they meant when it was first written",
      Visual: S.Setup,
    },
    {
      title: 'Predict: would a stricter gate have caught it?',
      body: (
        <>
          The same field removal, checked against a stricter compatibility mode instead of the
          lenient one that let it through.
        </>
      ),
      duration: 2.8,
      fig: 'the same field removal, checked under a stricter compatibility mode',
      predict: {
        options: [
          { label: 'No — every mode allows removing a field' },
          { label: 'Yes — the right mode would have rejected it at publish time', correct: true },
          { label: "It doesn't matter — compatibility checks only run after publishing" },
        ],
        explain: (
          <>
            Yes. A stricter mode, checked against the schema the still-reading consumers actually
            depend on, would have rejected the change before it ever shipped.
          </>
        ),
      },
      Visual: S.PredictGate,
    },
    {
      title: 'Reveal: backward, forward, full, transitive',
      body: (
        <>
          Backward lets a new reader read old data. Forward lets an old reader read new data.
          Full is both. Transitive checks every prior version registered, not just the one right
          before it.
        </>
      ),
      duration: 4.8,
      fig: 'backward, forward, full, and transitive — four modes, two directions',
      Visual: S.RevealModes,
    },
    {
      title: 'Reveal: the same evolution, two different gates',
      body: (
        <>
          Removing a field passes backward compatibility — consumers simply ignore what they
          don't look for. Adding a required field with no default fails it outright.
        </>
      ),
      duration: 4.8,
      fig: 'the same removal passes backward, but a required addition fails it',
      takeaway: "Whether an evolution is safe depends entirely on which gate it's checked against, not on the evolution alone.",
      Visual: S.RevealGates,
    },
    {
      title: 'Predict: which format catches a reused number?',
      body: (
        <>
          The same field renamed, kept at its original position, checked by three different
          schema formats.
        </>
      ),
      duration: 2.8,
      fig: 'the same renamed field, checked by three different schema formats',
      predict: {
        options: [
          { label: 'All three treat a rename identically' },
          { label: "Protobuf doesn't care about the name at all — only the field number matters", correct: true },
          { label: 'Avro is the only one that tolerates a rename' },
        ],
        explain: (
          <>
            Protobuf resolves fields by number, not name, so a rename at the same number is
            invisible to it — while reusing that same number for something else entirely is not.
          </>
        ),
      },
      Visual: S.PredictFormats,
    },
    {
      title: 'Reveal: three formats, three native behaviors',
      body: (
        <>
          Avro resolves a mismatch by field name, falling back to a declared default. Protobuf
          resolves by field number — a rename is safe, a reused number is not. JSON Schema has no
          native evolution model at all; the registry layers rules on top.
        </>
      ),
      duration: 4.8,
      fig: 'Avro resolves by name, Protobuf by number, JSON Schema natively by neither',
      takeaway: "The three formats don't just enforce compatibility differently — they don't even agree on what identifies a field across versions.",
      Visual: S.RevealFormats,
    },
    {
      title: 'Reveal: naming strategies, and schema ids in the wire',
      body: (
        <>
          A subject-naming strategy decides how many types share one compatibility check. A wire
          record carries only a small schema id — not the whole schema — which a consumer
          resolves against the registry.
        </>
      ),
      duration: 4.8,
      fig: "a naming strategy sets the check scope; the wire record carries only a schema id",
      takeaway: "A subject-naming strategy is a scoping decision as much as a naming one — it decides what gets checked together.",
      Visual: S.RevealWire,
    },
    {
      title: 'Prove it',
      body: (
        <>
          Every figure in this reel so far came from a real run of this topic's own toy models,
          just now — the compatibility checker, the field-number-reuse check, and the wire-format
          round trip.
        </>
      ),
      duration: 4.8,
      fig: "this topic's own real run, every number read straight off it",
      Visual: S.ProveIt,
    },
    {
      title: 'Recap',
      body: (
        <>
          Pick the mode that matches the upgrade order. Know what each format actually permits.
          Pick a naming strategy for how types should share a check. And remember a data contract
          still catches what a schema check alone can't.
        </>
      ),
      duration: 4.8,
      fig: 'pick the mode, know the format, pick the strategy, and what a contract adds',
      Visual: S.Recap,
    },
  ],
};

export default reel;
