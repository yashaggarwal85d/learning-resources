import type { Reel } from '../../../../../reels/types';
import * as S from './scenes';

// The four cost dimensions, a small-file request storm, and a worked Spark-job teardown. Every
// dollar figure shown in the visuals is computed by examples.py against disclosed, documented
// rates, or measured against a real local S3-compatible server for the lab.
const reel: Reel = {
  steps: [
    {
      title: 'A pipeline that looks free and turns out to be the biggest line item',
      body: (
        <>
          A pipeline writes one tiny file per row, every day. The storage-GB line on the bill barely moves — these files are small. A
          different line on that same bill ends up dwarfing every other line combined.
        </>
      ),
      duration: 4.4,
      Visual: S.LooksFree,
    },
    {
      title: "Which line is actually driving this bill?",
      body: (
        <>
          The bytes stored didn't change. Something else about writing them as many tiny files instead of a few large ones is what's actually
          costing money here. Which line is it?
        </>
      ),
      duration: 1.2,
      predict: {
        options: [
          { label: 'Compute — more files means more processing' },
          { label: 'Requests — every tiny file is its own billed operation', correct: true },
          { label: 'A flat cloud markup for having many small files' },
          { label: 'Network — small files cost more to transfer' },
        ],
        explain: (
          <>
            Requests. Storage is billed by bytes held, not by how many objects they're split into — so the storage line stays flat. Every PUT,
            every LIST page, every GET is its own billed operation, counted per call, not per byte. Splitting the same bytes into far more
            objects multiplies the operation count without changing the byte count at all.
          </>
        ),
      },
      Visual: S.WhichLineIsDriving,
    },
    {
      title: 'Storage is billed twice: by the byte, and by the operation',
      body: (
        <>
          A cloud object store charges for the bytes held per month, and separately for every operation performed against them — a PUT, a
          LIST page, a GET — regardless of how small the object behind that operation is.
        </>
      ),
      duration: 4.6,
      Visual: S.StorageTwice,
    },
    {
      title: 'Compute: what you reserved, not what you used',
      body: (
        <>
          Reserved capacity bills for the hours it exists, whether or not anything ran on it. Consumed capacity bills for what actually ran.
          The gap between the two is money spent on nothing at all.
        </>
      ),
      duration: 4.2,
      Visual: S.ReservedVsConsumed,
      takeaway: 'Reserved capacity bills for existing, not for running; the gap between reserved and consumed is money spent on idle hours.',
    },
    {
      title: 'Network has a price for every boundary a byte crosses',
      body: (
        <>
          Leaving the cloud to the public internet has its own rate. Crossing a region has a different rate. Crossing an availability zone,
          inside the same region, has yet another. A NAT gateway adds its own fee on top of whichever of those already applied.
        </>
      ),
      duration: 4.8,
      Visual: S.EveryBoundary,
      takeaway: 'Internet egress, cross-region, cross-AZ and a NAT gateway are four separate charges, not one network line.',
    },
    {
      title: "A managed service's premium is buying something, not nothing",
      body: (
        <>
          The gap between a managed service's price and the same workload self-hosted isn't waste. It's the price of moving the operational
          burden — patching, scaling, failing over — onto someone else's team instead of yours.
        </>
      ),
      duration: 4.2,
      Visual: S.ManagedPremium,
      takeaway: "A managed service's premium buys the operational burden moving to someone else's team, not a discount on doing nothing.",
    },
    {
      title: "One Spark job, every dollar accounted for",
      body: (
        <>
          Storage held for the run, requests against every object touched, network for the shuffle crossing zone boundaries and the result
          shipped out, and the gateway fee for traffic that left through it — four lines, one job, nothing left unlabeled.
        </>
      ),
      duration: 4.8,
      Visual: S.SparkTeardown,
      takeaway: 'A worked teardown prices every dimension separately; a single "it cost X" number hides which part actually drove it.',
    },
    {
      title: 'In one breath',
      body: (
        <>
          Storage bills by the byte and the operation. Compute bills for what's reserved, not just what's used. Network bills for every
          boundary crossed. A managed premium buys moved burden, not nothing. Next: the same four dimensions, three different vendor names.
        </>
      ),
      duration: 3.6,
      Visual: S.Recap,
    },
    {
      title: 'Prove it',
      body: (
        <>
          Twenty writers race to update one counter. The naive version makes the fewest requests of anyone — and loses nearly every commit.
          The safe version retries until nothing is lost. Which run costs more in requests?
        </>
      ),
      duration: 2.8,
      predict: {
        options: [
          { label: 'The naive run — more writers means more requests either way' },
          { label: "The safe run — its retries are real, counted requests the naive run never makes", correct: true },
        ],
        explain: (
          <>
            The safe run. Being correct isn't free: every retry after a lost race is a real request that gets counted and billed, and the
            naive run never pays that price because it never notices it lost anything. Correctness and cost are different axes — cheaper isn't
            automatically safer, and safer isn't automatically cheaper.
          </>
        ),
      },
      Visual: S.ProveIt,
    },
  ],
};

export default reel;
