import type { Reel } from '../../../../../reels/types';
import * as S from './scenes';

// A small, hand-built OPC UA address space (nodes joined by typed
// references, browsed down to one Variable's value, unit and type), an
// absolute-deadband monitored item measured against plain polling, a
// client/server-vs-PubSub fan-out comparison, and the MessageSecurityMode
// enumeration with a check that flags None as a finding (examples.py). No
// OPC UA server was installed or run; the structure matches the
// specification's own node/reference model.
const reel: Reel = {
  steps: [
    {
      title: 'Hook: the same machine, two plants, months apart to onboard',
      body: (
        <>
          Two plants buy the same machine tool. One ends up with a tag list
          and an unmaintained spreadsheet. The other's machine publishes a
          typed model with names, units and a hierarchy already attached.
        </>
      ),
      duration: 5.8,
      fig: "two plants buy the same machine tool — one ends up with a tag list and an unmaintained spreadsheet, the other's machine publishes a typed model with names, units and a hierarchy already attached",
      Visual: S.Hook,
    },
    {
      title: "Predict: what did the typed model carry that the tag list didn’t?",
      body: (
        <>
          One plant onboards the machine in days. The other takes months.
          What exactly did the typed model carry that a raw address like
          `PLC1.DB7.REAL12` never could?
        </>
      ),
      duration: 4.8,
      fig: "one plant onboards the machine in days, the other in months — what exactly did the typed model carry that a raw address never could?",
      predict: {
        options: [
          { label: 'A faster network connection to the machine' },
          {
            label: "Names, types, units and a place in a hierarchy — semantics the tag list never had",
            correct: true,
          },
        ],
        explain: (
          <>
            Semantics. The typed model carries a name, a type, a unit and a
            position in a hierarchy for every value — exactly what the raw
            tag list left for a person to track down and maintain by hand.
          </>
        ),
      },
      Visual: S.PredictModel,
    },
    {
      title: "Reveal: typed references browsed down to one variable’s value, unit and type",
      body: (
        <>
          Nodes are joined by typed references. Browsing from the machine
          down through its monitoring and spindle objects reaches one
          variable, already carrying its own unit and data type.
        </>
      ),
      duration: 5.8,
      fig: "nodes are joined by typed references, and browsing from the machine down through its monitoring and spindle objects reaches one variable, already carrying its own unit and data type",
      Visual: S.RevealAddressSpace,
    },
    {
      title: 'Reveal: a companion specification makes that path the same everywhere',
      body: (
        <>
          A companion specification standardizes that exact path for a
          domain. Any machine tool built to it exposes the same object
          types, so a client never needs a per-vendor tag map.
        </>
      ),
      duration: 5.6,
      fig: "a companion specification standardizes that exact path for a domain, so any machine tool built to it exposes the same object types and a client never needs a per-vendor tag map",
      Visual: S.RevealCompanionSpec,
    },
    {
      title: 'Reveal: a deadband reports far fewer notifications than polling',
      body: (
        <>
          A monitored item's absolute deadband only reports a change past a
          stated threshold. Measured against polling every sample of the
          same signal, it sends a small fraction of the messages.
        </>
      ),
      duration: 5.8,
      fig: "a monitored item's absolute deadband only reports a change past a stated threshold, and measured against polling every sample it sends a small fraction of the messages",
      Visual: S.RevealDeadband,
    },
    {
      title: "Reveal: PubSub’s message count doesn’t scale with its subscribers",
      body: (
        <>
          Client/server gives every subscriber its own session, so its
          notification traffic scales with how many are listening. PubSub
          decouples publisher from subscriber, so it doesn't.
        </>
      ),
      duration: 5.8,
      fig: "client/server gives every subscriber its own session so its notification traffic scales with how many are listening, but PubSub decouples publisher from subscriber so its own message count doesn't",
      takeaway: "A session-per-subscriber model and a decoupled broker have different costs — one scales with subscribers, one doesn't.",
      Visual: S.RevealPubSub,
    },
    {
      title: 'Reveal: security mode None is a finding, not a default',
      body: (
        <>
          The specification's own default isn't None — it's an invalid
          value, specifically so no security is never chosen by accident.
          Finding it set to None in a plant is a finding to raise.
        </>
      ),
      duration: 5.8,
      fig: "the specification's own default isn't None, it's an invalid value specifically so no security is never chosen by accident — finding it set to None in a plant is a finding to raise",
      takeaway: 'A specification whose own default refuses no security has already told you how seriously to treat finding it anyway.',
      Visual: S.RevealSecurity,
    },
    {
      title: 'Recap',
      body: (
        <>
          Typed nodes and references, a companion specification that
          standardizes a path across vendors, a deadband that cuts
          notification volume, PubSub that decouples cost from subscriber
          count, and a security default built to never be an accident.
        </>
      ),
      duration: 5.8,
      fig: "typed nodes and references, a companion specification that standardizes a path across vendors, a deadband that cuts notification volume, PubSub that decouples cost from subscriber count, and a security default built to never be an accident",
      takeaway: "Browsing a model gives a name, a type, a unit, and a hierarchy, all in one read.",
      Visual: S.Recap,
    },
    {
      title: 'Prove it',
      body: (
        <>
          Given only the fields a browsed variable node carries — its name,
          its type, its unit, its place in the hierarchy — can the plant's
          whole equipment hierarchy be rebuilt from the model alone?
        </>
      ),
      duration: 4.8,
      fig: "given only the fields a browsed variable node carries, can the plant's whole equipment hierarchy be rebuilt from the model alone?",
      predict: {
        options: [
          { label: "No — the hierarchy still has to come from a separate spreadsheet" },
          {
            label: "Yes — the node's own references already encode its place in the hierarchy",
            correct: true,
          },
        ],
        explain: (
          <>
            Yes. The references that connect a machine's objects down to its
            variables already encode the hierarchy directly — that's the
            whole reason browsing the model replaces the spreadsheet.
          </>
        ),
      },
      Visual: S.ProveIt,
    },
  ],
};

export default reel;
