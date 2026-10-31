import type { Reel } from '../../../../../reels/types';
import * as S from './scenes';

// An edge gateway's own durable buffer during a WAN outage: a fsynced
// append-only queue that survives a restart, idempotent replay that
// resolves a duplicate, a gap and a reordering, a catch-up throttle sized
// by Little's law, drop-oldest/drop-newest/degrade policies compared under
// a priority rule, a mergeable rollup that extends a fixed buffer's
// survivable outage, and a clock-offset correction applied on reconnect
// (examples.py).
const reel: Reel = {
  steps: [
    {
      title: 'Hook: a buffered outage replays wrong on the way back',
      body: (
        <>
          A WAN outage ends. The gateway replays its buffer, and the
          platform shows some readings twice, a few out of order, and new
          live data arriving late because the replay saturated the link.
        </>
      ),
      duration: 5.8,
      fig: 'a WAN outage ends, the gateway replays its buffer, and the platform shows some readings twice, a few out of order, and new live data arriving late because the replay saturated the link',
      Visual: S.Hook,
    },
    {
      title: 'Predict: what was missing from the replay?',
      body: (
        <>
          The buffer held every reading through the outage. What was
          missing from the replay, and what should have limited its speed?
        </>
      ),
      duration: 5.6,
      fig: 'the buffer held every reading through the outage — what was missing from the replay, and what should have limited its speed?',
      predict: {
        options: [
          { label: 'Nothing — a bigger buffer would have fixed it' },
          {
            label: 'An idempotent key per point, and a throttle on the replay rate',
            correct: true,
          },
        ],
        explain: (
          <>
            An idempotent key per point, so a resend never counts twice,
            and a throttle on the replay rate, so catch-up traffic never
            outruns what the platform can actually ingest alongside live
            data.
          </>
        ),
      },
      Visual: S.PredictMissing,
    },
    {
      title: 'Reveal: the buffer itself is durable and sized from the outage',
      body: (
        <>
          Every write is fsynced to a plain append-only file before it is
          acknowledged. A fresh process reading the same file back after a
          restart recovers all 50 points a prior one wrote. A longer outage
          at the same rate needs proportionally more bytes: a four-hour
          outage needs 24 times what a ten-minute one does.
        </>
      ),
      duration: 6.0,
      fig: 'every write is fsynced to a plain append-only file before it is acknowledged, a fresh process reading it back after a restart recovers all 50 points a prior one wrote, and a four-hour outage needs 24 times the bytes a ten-minute one does',
      Visual: S.RevealDurable,
    },
    {
      title: 'Reveal: a wider sequence key makes a duplicate resend idempotent',
      body: (
        <>
          Sparkplug's own sequence number wraps after 256 messages, far too
          narrow to dedupe a long replay. A per-source key wide enough not
          to wrap recovers every real point exactly once, flags the one
          gap where a point never arrived, and fixes a reordering.
        </>
      ),
      duration: 6.0,
      fig: "sparkplug's own sequence number wraps after 256 messages, far too narrow to dedupe a long replay, so a per-source key wide enough not to wrap recovers every real point exactly once, flags the one gap where a point never arrived, and fixes a reordering",
      takeaway: 'A sequence number only prevents duplicates if it is wide enough to outlast everything replayed through it.',
      Visual: S.RevealSequence,
    },
    {
      title: "Reveal: Little's law sizes the catch-up throttle",
      body: (
        <>
          A backlog drains at the replay rate minus the live rate, because
          live points keep arriving the whole time catch-up runs. A
          throttle that leaves live traffic its own share of ingest
          capacity still drains the backlog in a bounded time.
        </>
      ),
      duration: 5.8,
      fig: "a backlog drains at the replay rate minus the live rate, because live points keep arriving the whole time catch-up runs, and a throttle that leaves live traffic its own share of ingest capacity still drains the backlog in a bounded time",
      Visual: S.RevealCatchup,
    },
    {
      title: 'Reveal: a full buffer drops by priority, never by backpressure',
      body: (
        <>
          Dropping the oldest or the newest point by age alone loses some
          of the buffer's own safety alarms along with everything else.
          Dropping by priority first keeps every alarm and loses only the
          lower-priority points around it. The buffer's own write never
          blocks, whichever policy applies on read.
        </>
      ),
      duration: 6.0,
      fig: "dropping the oldest or the newest point by age alone loses some of the buffer's own safety alarms along with everything else, dropping by priority first keeps every alarm, and the buffer's own write never blocks, whichever policy applies on read",
      takeaway: "A full buffer must never refuse a write; it only decides what to keep once it is already full.",
      Visual: S.RevealDropPolicy,
    },
    {
      title: 'Reveal: a local rollup extends the outage a fixed buffer survives',
      body: (
        <>
          A mergeable rollup records one aggregate per interval instead of
          every raw point. The same four-hour outage that needs 72,000 raw
          points fits in 240 rolled-up records, in the same fixed buffer.
        </>
      ),
      duration: 5.8,
      fig: 'a mergeable rollup records one aggregate per interval instead of every raw point, so the same four-hour outage that needs 72,000 raw points fits in 240 rolled-up records in the same fixed buffer',
      Visual: S.RevealRollup,
    },
    {
      title: "Reveal: the gateway's own clock offset is corrected on reconnect",
      body: (
        <>
          A device clock that drifted 90 seconds behind the gateway's own
          shows up as a shifting gap between the two recorded times. The
          estimated offset, applied to the whole drifted batch, recovers
          exactly what the gateway's own clock would have stamped.
        </>
      ),
      duration: 5.8,
      fig: "a device clock that drifted 90 seconds behind the gateway's own shows up as a shifting gap between the two recorded times, and the estimated offset, applied to the whole drifted batch, recovers exactly what the gateway's own clock would have stamped",
      Visual: S.RevealClock,
    },
    {
      title: 'Recap',
      body: (
        <>
          A durable, sized buffer; an idempotent key wide enough to survive
          its own replay; a throttle sized by Little's law; drop by
          priority, never by backpressure; a rollup that stretches the
          same buffer further; and a clock correction on reconnect.
        </>
      ),
      duration: 6.0,
      fig: "a durable, sized buffer, an idempotent key wide enough to survive its own replay, a throttle sized by Little's law, drop by priority never by backpressure, a rollup that stretches the same buffer further, and a clock correction on reconnect",
      takeaway: 'A gateway earns plant autonomy one property at a time; losing any one of them quietly breaks what it promised.',
      Visual: S.Recap,
    },
    {
      title: 'Prove it: does the plant keep reading during the outage?',
      body: (
        <>
          The WAN is down for the whole outage. Does the plant's own
          reading loop, independent of the gateway's uplink, keep running
          the entire time?
        </>
      ),
      duration: 5.4,
      fig: "the WAN is down for the whole outage — does the plant's own reading loop, independent of the gateway's uplink, keep running the entire time?",
      predict: {
        options: [
          { label: 'No — readings pause until the uplink returns' },
          {
            label: "Yes — all 3,000 local reads complete on schedule, uplink or not",
            correct: true,
          },
        ],
        explain: (
          <>
            Yes. Local autonomy is a property of the plant's own control
            loop, not of the gateway's buffer. The buffer only decides what
            happens to a reading after it is already taken.
          </>
        ),
      },
      Visual: S.ProveIt,
    },
  ],
};

export default reel;
