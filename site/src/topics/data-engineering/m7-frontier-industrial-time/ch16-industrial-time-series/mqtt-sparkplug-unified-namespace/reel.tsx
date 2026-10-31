import type { Reel } from '../../../../../reels/types';
import * as S from './scenes';

// MQTT QoS 0/1 loss and duplication measured against a real Mosquitto
// broker under a killed connection; a retained message and a Will message
// measured the same way; real Sparkplug B NBIRTH/NDATA Protobuf payloads
// (compiled from the Eclipse Tahu reference sparkplug_b.proto) with correct
// sequence numbers and bdSeq; a host-side sequence-gap detector that
// triggers a rebirth request; a Unified Namespace topic tree sketched onto
// the ISA-95 hierarchy (examples.py).
const reel: Reel = {
  steps: [
    {
      title: 'Hook: an edge node loses power mid-shift',
      body: (
        <>
          The dashboard keeps showing the same stale reading for twenty
          minutes. The node comes back, republishes, and every metric is
          recorded twice.
        </>
      ),
      duration: 5.8,
      fig: 'an edge node loses power mid-shift, the dashboard keeps showing the same stale reading for twenty minutes, then the node comes back and every metric is recorded twice',
      Visual: S.Hook,
    },
    {
      title: 'Predict: what two fields tell a consumer the node died and restarted?',
      body: (
        <>
          The dashboard trusted a dead node for twenty minutes. What two
          Sparkplug fields tell a consumer that the node died, and that this
          is a restart rather than a duplicate?
        </>
      ),
      duration: 5.4,
      fig: 'the dashboard trusted a dead node for twenty minutes — what two Sparkplug fields tell a consumer that the node died, and that this is a restart rather than a duplicate?',
      predict: {
        options: [
          { label: 'The MQTT topic name and the message timestamp' },
          {
            label: "The death certificate (the Will) and bdSeq plus the sequence number",
            correct: true,
          },
        ],
        explain: (
          <>
            The Will marks the node dead the moment the connection breaks.
            `bdSeq` and the sequence number, both reset on rebirth, separate
            a genuine restart from a duplicate of old data.
          </>
        ),
      },
      Visual: S.PredictFields,
    },
    {
      title: 'Reveal: QoS 0 loses messages, QoS 1 can duplicate — measured',
      body: (
        <>
          Killing a real connection to a real broker mid-stream: QoS 0 loses
          messages with zero duplicates, while QoS 1 loses nothing but
          redelivers one message the broker never got acknowledged.
        </>
      ),
      duration: 6.0,
      fig: "killing a real connection to a real Mosquitto broker mid-stream — QoS 0 loses messages with zero duplicates, QoS 1 loses nothing but redelivers one unacknowledged message",
      Visual: S.RevealQos,
    },
    {
      title: 'Reveal: the retained value is why the dashboard trusted a dead node',
      body: (
        <>
          A retained message is the broker's own stored last value, handed
          to anyone who asks. The Will is the death certificate the broker
          publishes only on an ungraceful disconnect.
        </>
      ),
      duration: 5.8,
      fig: "a retained message is the broker's own stored last value, handed to anyone who asks; the Will is the death certificate the broker publishes only on an ungraceful disconnect",
      Visual: S.RevealRetainedWill,
    },
    {
      title: 'Reveal: a real Protobuf NBIRTH carries every metric and sequence 0',
      body: (
        <>
          NBIRTH includes every metric the node will ever report, sequence
          0, and a `bdSeq`. NDATA's sequence number increments by one and
          wraps from 255 back to 0.
        </>
      ),
      duration: 6.0,
      fig: "NBIRTH includes every metric the node will ever report, sequence 0, and a bdSeq; NDATA's sequence number increments by one and wraps from 255 back to 0",
      Visual: S.RevealSparkplug,
    },
    {
      title: 'Reveal: a skipped sequence number triggers a rebirth request',
      body: (
        <>
          A host watching the sequence stream `0, 1, 2, 3, _, 5` detects the
          gap at 4 and asks for a rebirth. An unbroken stream raises nothing.
        </>
      ),
      duration: 5.6,
      fig: 'a host watching the sequence stream 0, 1, 2, 3, _, 5 detects the gap at 4 and asks for a rebirth; an unbroken stream raises nothing',
      takeaway: 'A counter that only ever moves forward by one is a cheap, reliable way to notice when something went missing.',
      Visual: S.RevealGap,
    },
    {
      title: 'Reveal: the Unified Namespace is one topic tree, not a point-to-point map',
      body: (
        <>
          One broker's topic tree mirrors the equipment hierarchy. Every
          system publishes its state to one place; every consumer reads it
          from one place.
        </>
      ),
      duration: 5.6,
      fig: "one broker's topic tree mirrors the equipment hierarchy — every system publishes its state to one place, every consumer reads it from one place",
      Visual: S.RevealUns,
    },
    {
      title: "Reveal: a broker holds the current value, never the history",
      body: (
        <>
          A UNS node's retained value is the current state and nothing
          before it. No history, no replay — a durable log has to sit
          behind the broker for either.
        </>
      ),
      duration: 5.8,
      fig: "a UNS node's retained value is the current state and nothing before it — no history, no replay, so a durable log has to sit behind the broker",
      takeaway: "A broker's retained value answers what is true now, never what was true a moment ago.",
      Visual: S.RevealLimits,
    },
    {
      title: 'Recap',
      body: (
        <>
          QoS's three delivery guarantees, a retained value and a Will that
          explain the dead-node dashboard, a real Sparkplug birth/death
          cycle with sequence numbers, and a broker that needs a log behind
          it for anything but the present.
        </>
      ),
      duration: 6.0,
      fig: "QoS's three delivery guarantees, a retained value and a Will that explain the dead-node dashboard, a real Sparkplug birth/death cycle with sequence numbers, and a broker that needs a log behind it for anything but the present",
      takeaway: "A death certificate and a sequence number say whether what you're reading is alive.",
      Visual: S.Recap,
    },
    {
      title: 'Prove it',
      body: (
        <>
          A consumer joins right after a ten-minute outage, with only the
          broker's retained values and no durable log behind it. Can it
          recover what it missed during the outage?
        </>
      ),
      duration: 5.2,
      fig: 'a consumer joins right after a ten-minute outage, with only the retained values and no durable log behind the broker — can it recover what it missed during the outage?',
      predict: {
        options: [
          { label: "Yes — the retained value catches it up to everything it missed" },
          {
            label: 'No — retained gives only the current value; everything published during the outage is gone',
            correct: true,
          },
        ],
        explain: (
          <>
            No. A retained message is the latest value, not a log of every
            value since. Without a durable log behind the broker, the whole
            outage window is simply unrecoverable.
          </>
        ),
      },
      Visual: S.ProveIt,
    },
  ],
};

export default reel;
