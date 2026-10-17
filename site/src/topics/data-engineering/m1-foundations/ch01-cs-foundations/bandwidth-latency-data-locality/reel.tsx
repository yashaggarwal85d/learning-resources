import type { Reel } from '../../../../../reels/types';
import * as S from './scenes';

// The bulk-transfer regime, where n/beta dominates T(n) = alpha + n/beta, but alpha still sets how
// much data must be in flight to keep the pipe full. Running example: the shop's 1 TiB order_events
// copy and its 100-machine join, repriced in time and in dollars. Every number is in examples.py.

const reel: Reel = {
  steps: [
    {
      title: 'The pipe: width and length',
      body: (
        <>
          Two dimensions describe any network path: <b>β</b>, how many bytes a second it can carry, and the <b>round-trip time</b>, how long one
          acknowledgement takes to come back. Multiply them and you get the one quantity that decides whether a bulk transfer actually uses the
          link it is given.
        </>
      ),
      duration: 3.4,
      Visual: S.Problem,
    },
    {
      title: 'The bandwidth-delay product',
      body: (
        <>
          <b>BDP = β × RTT.</b> Same availability zone, 10 Gbit/s and a 0.5 ms round trip: about <b>610 KiB</b> in flight. Cross-region, the same
          10 Gbit/s link at a 60 ms round trip: about <b>71.5 MiB</b>. The sender can only have so many unacknowledged bytes outstanding at once,
          the <b>receive window</b>, before it must stop and wait.
        </>
      ),
      duration: 4,
      Visual: S.BdpPipe,
    },
    {
      title: 'Predict: window smaller than the pipe',
      body: <>Your receive window is smaller than the bandwidth-delay product. What happens to your throughput?</>,
      duration: 1.6,
      predict: {
        options: [
          { label: 'Nothing, bandwidth alone decides' },
          { label: 'Capped at window divided by round-trip time', correct: true },
          { label: 'It drops to zero' },
          { label: 'It depends only on packet loss' },
        ],
        explain: (
          <>
            Capped at window / RTT. The sender fills the window, then stalls a whole round trip waiting for an acknowledgement, and the pipe runs
            part-empty however fast or empty the link actually is.
          </>
        ),
      },
      Visual: S.WindowCapPredict,
    },
    {
      title: 'A sixteen-bit field caps the window at 64 KiB',
      body: (
        <>
          The classic receive-window field is <b>16</b> bits, so the largest window it can advertise is <b>65,535</b> bytes, <b>64 KiB</b>. On a
          cross-region path that caps a fast link at under a tenth of a percent of its rate. <b>Window scaling</b> multiplies the advertised window
          by a shift negotiated once at the handshake, capped at <b>14</b>, for a maximum window of <b>1 GiB</b>.
        </>
      ),
      duration: 4.4,
      Visual: S.WindowField,
    },
    {
      title: 'Latency and throughput are different axes',
      body: (
        <>
          <b>Latency</b> is how long one unit of work takes end to end: distance and queueing set it, and no amount of money buys it down.{' '}
          <b>Throughput</b> is how much completes per second, and you can buy that up. <b>Little&rsquo;s law</b> ties them together: in-flight work
          equals throughput times latency, which is the BDP read as a sizing rule for concurrency.
        </>
      ),
      duration: 4,
      Visual: S.LatencyThroughputAxes,
    },
    {
      title: 'Predict: one stream or ten?',
      body: <>Copying order_events across a region on a path with a 71.5 MiB BDP: one default-tuned stream, or ten streams at once. Which finishes first?</>,
      duration: 1.8,
      predict: {
        options: [
          { label: 'One stream, fewer connections win' },
          { label: 'Ten streams, easily', correct: true },
          { label: 'They tie' },
          { label: 'It depends on CPU, not network' },
        ],
        explain: (
          <>
            Ten streams. One default-tuned stream has far too little in flight to fill a long pipe, so it crawls; ten streams each needing only
            about 7.2 MiB sum to the whole BDP between them. This is why bulk-copy tools default to many connections.
          </>
        ),
      },
      Visual: S.StreamsPredict,
    },
    {
      title: 'The cheapest byte is the one never sent',
      body: (
        <>
          <b>Data locality</b> means doing the computation where the data already sits. The lakehouse form is <b>pushdown</b>: read only the
          columns a query needs, and skip blocks whose statistics prove they cannot match, shrinking n in <code>T(n) = α + n/β</code> before any
          byte crosses the wire.
        </>
      ),
      duration: 4,
      Visual: S.DataLocality,
    },
    {
      title: 'The shop join, repriced in time',
      body: (
        <>
          Join the big <code>orders</code> table with the small <code>customers</code> one on <b>100</b> machines. Shuffling both by key sends
          about <b>990 GB</b>, roughly <b>8</b> seconds of sending per machine; broadcasting the small table sends about <b>9.9 GB</b>, roughly{' '}
          <b>0.08</b> seconds. Same answer, same CPU work, a hundred times less traffic and time.
        </>
      ),
      duration: 4.2,
      Visual: S.JoinReprice,
    },
    {
      title: 'Predict: shuffle vs broadcast, in dollars',
      body: <>Both options cross availability zones, billed at $0.01 per GB each direction. How does the shuffle's bill compare to the broadcast's?</>,
      duration: 1.8,
      predict: {
        options: [
          { label: 'They cost about the same' },
          { label: 'The shuffle costs about a hundred times more', correct: true },
          { label: 'The broadcast costs more, it touches every machine' },
          { label: 'Neither costs anything within one region' },
        ],
        explain: (
          <>
            About <b>$20</b> for the shuffle against about <b>$0.20</b> for the broadcast: a hundred to one, exactly the ratio of the bytes, and
            that bill lands every single night the pipeline runs.
          </>
        ),
      },
      Visual: S.DollarPredict,
    },
    {
      title: 'Back to the shop: the meter is a design constraint',
      body: (
        <>
          Traffic inside one zone is free; across zones and out to the internet it is metered, and metered one way. Data flows in cheaply and is
          expensive to drag back out, data gravity, which is exactly why compute gets pinned next to its storage.
        </>
      ),
      duration: 3.6,
      Visual: S.Verdict,
    },
  ],
};

export default reel;
