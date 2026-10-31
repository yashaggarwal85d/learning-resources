import type { Reel } from '../../../../../reels/types';
import * as S from './scenes';

// The capacity-and-cardinality estimate, the buffer-sizing arithmetic, and
// the throttled-versus-unthrottled catch-up comparison are asserted in
// examples.py's own fleet_event_rate(), storage_bytes_per_year(),
// buffer_size_bytes(), series_cardinality() and catch_up_peak_rate(). The
// Gorilla and Prometheus claims trace to their own sources, quoted in
// SOURCES.md and checked step by step in FACT-CHECK.md. No literal digits
// appear below.
const reel: Reel = {
  steps: [
    {
      title: "Hook: a WAN outage blanks the plants, then floods them",
      body: (
        <>
          The shop-floor lead asked for real-time dashboards; the platform team built a
          cloud-only streaming pipeline. A long WAN outage blanks every plant's dashboard; on
          reconnect, the backlog floods the platform and the dashboards stay stale well past when
          the link actually recovered.
        </>
      ),
      duration: 5.0,
      fig: "a plant dashboard going dark for the outage, then a backlog spike on reconnect that keeps it stale",
      Visual: S.Hook,
    },
    {
      title: "Predict: which two decisions would have kept the plants running?",
      body: (
        <>
          Which two design decisions, absent from the first version, would have kept the plants
          running and made the catch-up boring?
        </>
      ),
      duration: 4.6,
      predict: {
        options: [
          { label: "a bigger WAN link, so the outage itself happens less often" },
          {
            label: "plant-local autonomy during the outage, and a throttled, idempotent catch-up on reconnect",
            correct: true,
          },
        ],
        explain: (
          <>
            A bigger link doesn't help once the link is actually down, and it does nothing for
            the reconnect flood. Local autonomy during the outage and a throttled catch-up on
            reconnect are what the hook's own scenario actually lacked.
          </>
        ),
      },
      fig: "a bigger link doesn't help once it's down; local autonomy plus a throttled catch-up does",
      Visual: S.Predict1,
    },
    {
      title: "Reveal: the capacity and cardinality estimate",
      body: (
        <>
          Events per second per plant build into a fleet total, with a peak well above the
          average for a shift change or a line restart, and a published compression figure quoted
          as a reference point, never as a promise for this data.
        </>
      ),
      duration: 5.0,
      fig: "a per-plant rate summing to a fleet total, a storage bar shrinking once the cited compression reference is applied",
      Visual: S.RevealCapacityEstimate,
    },
    {
      title: "Reveal: the edge gateway's buffer, sized from the outage",
      body: (
        <>
          A gateway buffers readings durably through an outage and forwards them, in order, once
          the link returns. The buffer size is the outage's own length times the rate it has to
          hold.
        </>
      ),
      duration: 4.8,
      takeaway: "The buffer size is a straight multiplication: an outage's length times the rate it has to hold.",
      fig: "a buffer bar filling against its own capacity through the outage's full length",
      Visual: S.RevealBufferSizing,
    },
    {
      title: "Reveal: the protocol boundary and the delivery level",
      body: (
        <>
          Sensors speak two protocols; the design chooses where to translate and picks a delivery
          level per signal class, then ingests into one durable log that decouples every plant
          from every consumer.
        </>
      ),
      duration: 4.8,
      fig: "a safety signal held to a stricter delivery guarantee than a routine reading, both landing in the same durable log",
      Visual: S.RevealProtocolDelivery,
    },
    {
      title: "Reveal: two stores, a cardinality limit, and where the asset joins in",
      body: (
        <>
          A hot time-series store serves operators querying seconds-old data; a lakehouse holds
          years of history for analysts. Cardinality is the hot store's own limiting resource,
          and each reading joins its asset-hierarchy context either early, at ingest, or late, at
          read.
        </>
      ),
      duration: 5.0,
      takeaway: "Joining the asset context early costs storage on every event; joining it late costs a lookup on every query.",
      fig: "a query-shape decision card contrasting the hot store and the lakehouse, an early-versus-late join priced beside it",
      Visual: S.RevealHotVsLakehouse,
    },
    {
      title: "Reveal: plant-local autonomy, and residency per site",
      body: (
        <>
          The plant keeps its own local broker, a short-retention store and local alert rules
          alive without the cloud, with a recovery target stated per signal class. Some sites'
          own data stays local by rule, with only an aggregate replicated upward.
        </>
      ),
      duration: 4.8,
      takeaway: "Plant-local autonomy during an outage is a degraded mode with its own recovery target per signal class.",
      fig: "a safety alarm held to a tight recovery bound beside a quality metric held to a looser one",
      Visual: S.RevealPlantAutonomy,
    },
    {
      title: "Reveal: the throttled, idempotent catch-up",
      body: (
        <>
          On reconnect, the buffered backlog replays through the same idempotent ingest, with a
          throttle that keeps the catch-up from swamping the platform the moment the link returns.
        </>
      ),
      duration: 4.8,
      takeaway: "A catch-up with no throttle just moves the outage's own damage from the outage to the moment the link returns.",
      fig: "an unthrottled catch-up spiking the platform's own load versus a throttled one replaying it smoothly",
      Visual: S.RevealThrottledCatchUp,
    },
    {
      title: "Recap",
      body: (
        <>
          A capacity and cardinality estimate with a cited reference point. A buffer sized from
          the outage. A per-signal delivery choice feeding one durable log. A hot-store-versus-
          lakehouse split. Plant autonomy as a degraded mode. A throttled, idempotent catch-up.
        </>
      ),
      duration: 4.8,
      fig: "the estimate, the buffer, the delivery choice, the store split, plant autonomy, and the catch-up, side by side",
      Visual: S.Recap,
    },
    {
      title: "Prove it: ten times the sensors",
      body: (
        <>
          The sensor count grows tenfold across the same three plants. What's the next
          bottleneck?
        </>
      ),
      duration: 4.8,
      predict: {
        options: [
          { label: "the WAN link itself, since more sensors means more data to send" },
          {
            label: "the hot store's own cardinality, since ten times the sensors means ten times the series count",
            correct: true,
          },
        ],
        explain: (
          <>
            The design already buffers through an outage regardless of link capacity, so the
            link's own bandwidth isn't where this bites first. Ten times the sensors means ten
            times the series count against the same label-driven limit.
          </>
        ),
      },
      fig: "the WAN link still buffering fine while the hot store's own series count climbs tenfold against its limit",
      Visual: S.ProveIt,
    },
  ],
};

export default reel;
